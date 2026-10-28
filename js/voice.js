/* Hollowmere: spoken dialogue. For each line:
 *   with "AI voices" on (Settings, and the owner's app config "tts" not false): My PC's AI speaks it
 *   (MyPC.ai.generate, task 'speech', any service the owner set up: Gemini, OpenAI...), with a voice and a style
 *   per character, in every language. A recorded clip is used instead if the AI is slow (3.5 s), missing or refused.
 *   with AI voices off: a recorded clip from audio/voices/<lang>/ (made by tools/voices/generate.py), if there is one;
 *   otherwise nothing (the text is still on screen and goes to the TV's Voice Guide).
 * Clips are fetched one line at a time, so nothing is downloaded up front. They play through one
 * <audio> element (routed into the game's voice volume), so the speed setting keeps voices at their pitch. */
window.HM_VOICE = (function () {
    'use strict';
    // a voice and a speaking style per character (Gemini voice names; OpenAI-style services get the second list)
    const TTS_VOICE = {
        narrator: ['Charon', 'calm storyteller, unhurried', 'fable'],
        maren: ['Gacrux', 'warm, wise elderly woman, a little tired', 'shimmer'],
        tobin: ['Algenib', 'gruff but kind blacksmith', 'onyx'],
        sela: ['Vindemiatrix', 'quiet, weathered ferrywoman, slightly mysterious', 'nova'],
        corvin: ['Enceladus', 'tired young man, bitter then ashamed', 'echo'],
        lira: ['Leda', 'soft, gentle young spirit', 'shimmer'],
        hana: ['Sulafat', 'cheerful shopkeeper', 'nova'],
        pip: ['Puck', 'excited small child', 'alloy'],
        bram: ['Orus', 'plain-spoken woodcutter', 'onyx'],
        odo: ['Alnilam', 'steady village guard', 'echo'],
        aldric: ['Alnilam', 'proud, tired captain of the guard', 'onyx'],
        ysolde: ['Leda', 'calm, mysterious seer', 'shimmer'],
        fenna: ['Aoede', 'serene, wise druid, a little cold', 'nova'],
        kragg: ['Algenib', 'loud, gruff warlord with a big heart', 'onyx'],
        brynn: ['Kore', 'quiet, careful scout, whispering', 'nova'],
        veyr: ['Charon', 'cold, hollow voice of a dead general', 'onyx'],
        hollowking: ['Enceladus', 'ancient, sad and menacing king, echoing', 'echo'],
        nessa: ['Vindemiatrix', 'friendly sailor', 'nova'],
        pim: ['Puck', 'excited small child', 'alloy']
    };
    let lang = 'en', index = null, indexP = null, token = 0, rate = 1, player = null, playerCtx = null, playing = false;
    let aiOn = true, aiOff = false, prov;                  // prov: undefined until asked, null when no service can speak
    const files = new Map(), speech = new Map();         // clips as blob: URLs: key -> url, text -> url

    function cfg() { const c = (window.MyPC && MyPC.app_config) || {}; return { tts: c.tts !== false }; }
    function aiReady() { return !!(window.MyPC && MyPC.ai && (MyPC.apiLevel || 0) >= 10) && cfg().tts && !aiOff; }
    function setAi(on) { aiOn = !!on; }

    function setLang(l) {
        lang = l; index = null;
        indexP = fetch('audio/voices/' + lang + '/index.json?v=' + (window.HM_VERSION || '1')).then(r => r.ok ? r.json() : null)
            .then(j => { index = (j && j.clips) || {}; return index; }).catch(() => { index = {}; return index; });
    }

    function keep(map, k, v, max) { map.set(k, v); if (map.size > max) { const old = map.keys().next().value; URL.revokeObjectURL(map.get(old)); map.delete(old); } }
    // the one <audio> element, connected to the voice volume of the current AudioContext
    function out() {
        const ac = HM_AUDIO.ctx(); if (!ac) return null;
        if (!player || playerCtx !== ac) {
            player = new Audio(); player.preservesPitch = true; playerCtx = ac;
            try { ac.createMediaElementSource(player).connect(HM_AUDIO.voiceOut()); } catch (e) {}
            player.onended = () => { playing = false; HM_AUDIO.duck(false); };
        }
        return player;
    }

    async function fromFile(key) {
        if (!key) return null;
        const idx = index || await indexP;
        const clip = idx && idx[key];
        if (!clip) return null;
        if (files.has(key)) return files.get(key);
        const r = await fetch('audio/voices/' + lang + '/' + clip.file + '?v=' + (window.HM_VERSION || '1'));
        if (!r.ok) return null;
        const url = URL.createObjectURL(await r.blob());
        keep(files, key, url, 24);
        return url;
    }

    // the first AI service of My PC that can speak (NVIDIA's voice has no Arabic)
    async function provider() {
        if (prov !== undefined) return prov;
        try {
            const list = await MyPC.ai.providers();
            prov = (list || []).find(p => p.tasks && p.tasks.speech && !(lang === 'ar' && /nvidia/i.test(p.type || p.preset || ''))) || null;
        } catch (e) { prov = null; }
        return prov;
    }
    async function fromAi(text, who) {
        if (!aiOn || !aiReady() || !text) return null;
        if (speech.has(text)) return speech.get(text);
        const p = await provider(); if (!p) return null;
        const v = TTS_VOICE[who] || TTS_VOICE.narrator, kind = String(p.type || p.preset || '').toLowerCase();
        const req = { task: 'speech', provider: p.id, language: lang, prompt: text.slice(0, 600) };
        if (kind.indexOf('gemini') >= 0) { req.voice = v[0]; req.prompt = 'Say it as a ' + v[1] + ', in natural ' + ({ en: 'English', fr: 'French', es: 'Spanish', ar: 'Arabic' }[lang] || 'English') + ': ' + text.slice(0, 600); }
        else if (kind.indexOf('nvidia') < 0) { req.voice = v[2]; req.format = 'mp3'; }
        try {
            const res = await MyPC.ai.generate(req);
            const part = res && res.parts ? res.parts.find(x => x.type === 'audio' && x.data) : null;
            if (!part) return null;
            const url = URL.createObjectURL(new Blob([part.data], { type: part.mime || 'audio/wav' }));
            keep(speech, text, url, 16);
            return url;
        } catch (e) {
            if (e && (e.code === 'denied' || e.code === 'no-provider' || e.code === 'unsupported')) aiOff = true;   // stop asking for this session
            return null;
        }
    }

    // speak one dialogue line; key = recorded clip name (or null), who = speaker id (null = narrator)
    function say(key, text, who) {
        stop();
        const t = token, file = fromFile(key).catch(() => null);
        let pick;
        if (aiOn && aiReady()) {
            const ai = fromAi(text, who || 'narrator');
            const slow = new Promise(r => setTimeout(() => r(null), 3500));
            pick = Promise.race([ai, slow]).then(u => u || file).then(u => u || ai);
        } else pick = file;
        pick.then(url => {
            const p = out();
            if (!url || t !== token || !p) return;
            p.src = url; p.playbackRate = rate; playing = true; HM_AUDIO.duck(true);
            p.play().catch(() => { playing = false; HM_AUDIO.duck(false); });
        });
    }
    // warm up the next recorded line (never AI: that would cost usage for lines nobody reaches)
    function prefetch(key) { if (key) fromFile(key).catch(() => null); }

    function stop() {
        token++;
        if (player && playing) { player.pause(); playing = false; HM_AUDIO.duck(false); }
    }
    // voice speed from the settings: 0.75 to 2
    function setRate(r) { rate = Math.max(0.5, Math.min(2, +r || 1)); if (player) player.playbackRate = rate; }

    return { setLang, say, prefetch, stop, setRate, setAi, aiReady };
})();
