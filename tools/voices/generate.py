"""Hollowmere voice generator: turns every scripted line of the game into speech, offline and free.

Reads the texts from js/i18n.js, gives each character its own voice (voices.json), and saves small
Ogg/Opus clips to audio/voices/<lang>/ with an index.json the game can load line by line.

    pip install -r tools/voices/requirements.txt
    python tools/voices/generate.py                 # all languages
    python tools/voices/generate.py --lang en fr    # some languages
    python tools/voices/generate.py --only maren0   # one line (to try a voice)
    python tools/voices/generate.py --list          # show what would be spoken, by whom

Only changed or missing lines are regenerated (each clip remembers a hash of its text and voice),
so running it again after editing a few lines is fast. Use --force to redo everything.
Lines with live values ({n}, {obj}) are skipped: they change while playing.
"""
import argparse
import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.request
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MODELS = os.path.join(HERE, "models")
OUT = os.path.join(ROOT, "audio", "voices")
RATE = 24000            # Opus works at 8/12/16/24/48 kHz; 24 kHz is plenty for speech
BITRATE = "24k"         # about 3 KB per second of speech
PIPER_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/{fam}/{code}/{name}/{q}/{voice}{ext}"


# ---------------------------------------------------------------- texts

def _js_object(path, name):
    import json5
    src = open(os.path.join(ROOT, "js", path), encoding="utf-8").read()
    start = src.index("{", src.index(name))
    end = src.replace("\r\n", "\n").index("\n};", start)   # the object ends at the first top-level "};"
    src = src.replace("\r\n", "\n")
    return json5.loads(src[start:end + 2])


def load_texts():
    """js/i18n.js plus the gear / dungeon / side-quest texts of js/i18n_more.js."""
    texts = _js_object("i18n.js", "HM_TEXT")
    more = _js_object("i18n_more.js", "HM_TEXT_MORE") if os.path.exists(os.path.join(ROOT, "js", "i18n_more.js")) else {}
    for lang, m in more.items():
        t = texts[lang]
        t["lines"].update(m.get("lines", {}))
        t["quests"] = m.get("quests", {})
    return texts


QUEST_GIVER = {"biscuit": "pip", "wolves": "bram", "tam": "bram", "crawlers": "hana", "mites": "odo", "stariron": "tobin"}


def speaker_for(key):
    for who in ("lira", "corvin", "maren", "tobin", "sela", "hana", "pip", "bram", "odo", "tam", "biscuit"):
        if key.startswith(who):
            return who
    if key == "journalPage":
        return "corvin"
    return "narrator"   # boss defeats, the seal, the Lantern, the boat


def clean(text):
    text = re.sub(r"\s*\((signed|signé|firmado|التوقيع)[^)]*\)", "", text)   # journal signature
    text = text.replace("«", "").replace("»", "").replace('"', "").strip()
    return text


def clips_for(T):
    """Yields (key, speaker, text) for every fixed line of one language."""
    for i, s in enumerate(T["intro"]):
        yield "intro-%d" % i, "narrator", s
    for i, s in enumerate(T["ending"]):
        yield "ending-%d" % i, "narrator", s
    for key, pages in T["lines"].items():
        for i, s in enumerate(pages):
            if "{" in s:
                continue
            yield "%s-%d" % (key, i), speaker_for(key), s
    for npc, (label, lore, about) in T["topic"].items():
        yield "topic-%s-lore" % npc, npc, lore
        yield "topic-%s-about" % npc, npc, about
    for qid, q in T.get("quests", {}).items():         # side quests: the giver speaks the offer and the thanks
        for part in ("offer", "done"):
            for i, s in enumerate(q.get(part, [])):
                yield "q-%s-%s-%d" % (qid, part, i), QUEST_GIVER.get(qid, "narrator"), s


# ---------------------------------------------------------------- engines

_piper = {}
_kokoro = {}


def piper_model(voice):
    code, name, q = voice.split("-", 2)
    fam = code.split("_")[0]
    os.makedirs(MODELS, exist_ok=True)
    path = os.path.join(MODELS, voice + ".onnx")
    for ext in (".onnx", ".onnx.json"):
        dest = os.path.join(MODELS, voice + ext)
        if not os.path.exists(dest):
            url = PIPER_URL.format(fam=fam, code=code, name=name, q=q, voice=voice, ext=ext)
            print("  downloading", voice + ext)
            tmp = dest + ".part"
            urllib.request.urlretrieve(url, tmp)
            os.replace(tmp, dest)
    return path


def synth_piper(cfg, text):
    from piper import PiperVoice
    voice = cfg["model"]
    if voice not in _piper:
        _piper[voice] = PiperVoice.load(piper_model(voice))
    v = _piper[voice]
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        try:                                    # piper-tts 1.3 and newer
            from piper import SynthesisConfig
            sc = SynthesisConfig(speaker_id=cfg.get("speaker"), length_scale=cfg.get("speed", 1.0))
            v.synthesize_wav(text, wf, syn_config=sc)
        except ImportError:                     # older piper-tts
            v.synthesize(text, wf, speaker_id=cfg.get("speaker"), length_scale=cfg.get("speed", 1.0))
    buf.seek(0)
    with wave.open(buf, "rb") as wf:
        rate, frames = wf.getframerate(), wf.readframes(wf.getnframes())
    import numpy as np
    return np.frombuffer(frames, dtype="<i2").astype("float32") / 32768.0, rate


KOKORO_LANG = {"en": "a", "es": "e", "fr": "f"}


def synth_kokoro(cfg, text, lang):
    import numpy as np
    from kokoro import KPipeline
    if lang not in KOKORO_LANG:
        sys.exit("Kokoro has no voices for '%s': use piper for this language in voices.json" % lang)
    if lang not in _kokoro:
        _kokoro[lang] = KPipeline(lang_code=KOKORO_LANG[lang])
    parts = [np.asarray(audio, dtype="float32") for _, _, audio in _kokoro[lang](text, voice=cfg["voice"], speed=1.0 / cfg.get("speed", 1.0))]
    return np.concatenate(parts), 24000


# ---------------------------------------------------------------- saving

def finish(audio, rate):
    import numpy as np
    peak = float(np.max(np.abs(audio))) or 1.0
    audio = audio * (0.89 / peak)                       # same loudness for every voice (-1 dB peak)
    pad = np.zeros(int(rate * 0.08), dtype="float32")   # tiny silence so the start isn't clipped
    return np.concatenate([pad, audio, pad]).astype("float32")


def save_ogg(audio, rate, path):
    """Ogg/Opus at 24 kHz. ffmpeg (if installed) resamples with high quality; otherwise soundfile."""
    import numpy as np
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg:
        pcm = (np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes()
        subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(rate), "-ac", "1", "-i", "-",
                        "-ar", str(RATE), "-c:a", "libopus", "-b:a", BITRATE, "-application", "voip", path], input=pcm, check=True)
    else:
        import soundfile as sf
        if rate != RATE:                               # simple resampling, fine for speech
            n = int(len(audio) * RATE / rate)
            audio = np.interp(np.linspace(0, len(audio) - 1, n), np.arange(len(audio)), audio).astype("float32")
        sf.write(path, audio, RATE, format="OGG", subtype="OPUS")


# ---------------------------------------------------------------- main

def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")   # Windows consoles
    except Exception:
        pass
    ap = argparse.ArgumentParser(description="Generate the character voices of Hollowmere.")
    ap.add_argument("--lang", nargs="+", default=["en", "fr", "es", "ar"])
    ap.add_argument("--only", nargs="+", help="only these keys or key prefixes, e.g. maren0 intro")
    ap.add_argument("--force", action="store_true", help="regenerate everything")
    ap.add_argument("--list", action="store_true", help="only print the lines and speakers")
    args = ap.parse_args()

    texts = load_texts()
    casting = json.load(open(os.path.join(HERE, "voices.json"), encoding="utf-8"))
    total_bytes = 0
    for lang in args.lang:
        T, cast = texts[lang], casting[lang]
        out = os.path.join(OUT, lang)
        os.makedirs(out, exist_ok=True)
        index_path = os.path.join(out, "index.json")
        index = json.load(open(index_path, encoding="utf-8")) if os.path.exists(index_path) else {"lang": lang, "clips": {}}
        todo = [c for c in clips_for(T) if not args.only or any(c[0].startswith(o) for o in args.only)]
        print("%s: %d lines" % (lang, len(todo)))
        for n, (key, who, text) in enumerate(todo, 1):
            cfg = cast[who]
            text = clean(text)
            h = hashlib.sha1(json.dumps([text, cfg], sort_keys=True).encode("utf-8")).hexdigest()[:12]
            path = os.path.join(out, key + ".ogg")
            if args.list:
                print("  %-22s %-9s %s" % (key, who, text[:70]))
                continue
            old = index["clips"].get(key)
            if not args.force and old and old.get("hash") == h and os.path.exists(path):
                continue
            print("  [%d/%d] %s (%s)" % (n, len(todo), key, who))
            if cfg.get("engine", "piper") == "kokoro":
                audio, rate = synth_kokoro(cfg, text, lang)
            else:
                audio, rate = synth_piper(cfg, text)
            audio = finish(audio, rate)
            save_ogg(audio, rate, path)
            index["clips"][key] = {"file": key + ".ogg", "who": who, "dur": round(len(audio) / rate, 2), "hash": h}
            json.dump(index, open(index_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)  # save as we go
        if not args.list:
            size = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out) if f.endswith(".ogg"))
            total_bytes += size
            secs = sum(c["dur"] for c in index["clips"].values())
            print("  %s done: %d clips, %.0f s of speech, %.1f MB" % (lang, len(index["clips"]), secs, size / 1e6))
    if not args.list:
        print("total %.1f MB in %s" % (total_bytes / 1e6, OUT))


if __name__ == "__main__":
    main()
