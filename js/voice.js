/* Hollowmere: spoken dialogue. For each line, in this order:
 *   1. a recorded clip from audio/voices/<lang>/ (made by tools/voices/generate.py), if there is one;
 *   2. otherwise Gemini text-to-speech through the owner's proxy (MyPC.app_config.proxyUrl);
 *   3. otherwise nothing (the text is still on screen and goes to the TV's Voice Guide).
 * Clips are fetched one line at a time, so nothing is downloaded up front. They play through one
 * <audio> element (routed into the game's voice volume), so the speed setting keeps voices at their pitch. */
window.HM_VOICE = (function () {
    'use strict';
    // a voice and a speaking style per character for Gemini TTS
    const TTS_VOICE = {
        narrator: ['Charon', 'calm storyteller, unhurried'],
        maren: ['Gacrux', 'warm, wise elderly woman, a little tired'],
        tobin: ['Algenib', 'gruff but kind blacksmith'],
        sela: ['Vindemiatrix', 'quiet, weathered ferrywoman, slightly mysterious'],
        corvin: ['Enceladus', 'tired young man, bitter then ashamed'],
        lira: ['Leda', 'soft, gentle young spirit'],
        hana: ['Sulafat', 'cheerful shopkeeper'],
        pip: ['Puck', 'excited small child'],
        bram: ['Orus', 'plain-spoken woodcutter'],
        odo: ['Alnilam', 'steady village guard']
    };
    let lang = 'en', index = null, indexP = null, token = 0, ttsOff = false, rate = 1, player = null, playerCtx = null, playing = false;
    const files = new Map(), speech = new Map();      // clips as blob: URLs: key -> url, text -> url

    function cfg() {
        const c = (window.MyPC && MyPC.app_config) || {};
        const url = typeof c.proxyUrl === 'string' && c.proxyUrl.indexOf('https://') === 0 ? c.proxyUrl : '';
        return {
            proxyUrl: url,
            tts: c.tts !== false && !ttsOff,
            model: typeof c.ttsModel === 'string' && c.ttsModel ? c.ttsModel : 'gemini-3.8-flash-lite-tts',
            timeoutMs: Math.max(3000, Math.min(30000, +c.ttsTimeoutMs || 12000))
        };
    }

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

    async function fromTts(text, who) {
        const c = cfg();
        if (!c.proxyUrl || !c.tts || !text) return null;
        if (speech.has(text)) return speech.get(text);
        const v = TTS_VOICE[who] || TTS_VOICE.narrator;
        const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), c.timeoutMs);
        try {
            const r = await fetch(c.proxyUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
                body: JSON.stringify({ kind: 'tts', model: c.model, text: text.slice(0, 600), voice: v[0], style: v[1] }) });
            if (r.status === 400 || r.status === 403 || r.status === 404) ttsOff = true;   // proxy without TTS: stop asking
            if (!r.ok) return null;
            const j = await r.json();
            if (!j || !j.audio) return null;
            const bin = atob(j.audio), bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
            keep(speech, text, url, 16);
            return url;
        } finally { clearTimeout(timer); }
    }

    // speak one dialogue line; key = recorded clip name (or null), who = speaker id (null = narrator)
    function say(key, text, who) {
        stop();
        const t = token;
        fromFile(key).catch(() => null)
            .then(buf => buf || fromTts(text, who || 'narrator').catch(() => null))
            .then(url => {
                const p = out();
                if (!url || t !== token || !p) return;
                p.src = url; p.playbackRate = rate; playing = true; HM_AUDIO.duck(true);
                p.play().catch(() => { playing = false; HM_AUDIO.duck(false); });
            });
    }
    // warm up the next recorded line (never TTS: that would cost money for lines nobody reaches)
    function prefetch(key) { if (key) fromFile(key).catch(() => null); }

    function stop() {
        token++;
        if (player && playing) { player.pause(); playing = false; HM_AUDIO.duck(false); }
    }
    // voice speed from the settings: 0.75 to 2
    function setRate(r) { rate = Math.max(0.5, Math.min(2, +r || 1)); if (player) player.playbackRate = rate; }

    return { setLang, say, prefetch, stop, setRate };
})();
