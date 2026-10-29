/* Hollowmere: spoken dialogue. For each line:
 *   with "AI voices" on (Settings, and the owner's app config "tts" not false): My PC's AI speaks it
 *   (MyPC.ai.generate, task 'speech', any service the owner set up: Gemini, OpenAI...), with a voice and a style
 *   per character, in every language. The speech model is always named in the request (Gemini's TTS model...):
 *   an app config "ai.model" such as "gemini-2.5-flash" is a text model, and My PC would use it for speech too.
 *   The next line of a conversation is asked for while the current one plays. A recorded clip is used instead if
 *   the AI takes too long (8 s), is missing or refused.
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
    let aiOn = true, aiOff = false, prov, provT = 0;                  // prov: undefined until asked, null when no service can speak
    const files = new Map(), speech = new Map();         // clips as blob: URLs: key -> url, text -> url

    function cfg() { const c = (window.MyPC && MyPC.app_config) || {}; return { tts: c.tts !== false, model: typeof c.ttsModel === 'string' ? c.ttsModel : '' }; }
    // the speech model of each kind of service (the app config's "ttsModel" wins)
    const TTS_MODEL = { gemini: 'gemini-2.5-flash-preview-tts', openai: 'gpt-4o-mini-tts', nvidia: 'magpie-multilingual' };
    let fails = 0;
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
        if (prov || (prov === null && Date.now() - provT < 60000)) return prov;          // no service: asked again after a minute
        provT = Date.now();
        try {
            const list = (await MyPC.ai.providers()) || [];
            const ok = p => !(lang === 'ar' && /nvidia/i.test(p.type || p.preset || ''));
            prov = list.find(p => p.isDefault && p.tasks && p.tasks.speech && ok(p)) || list.find(p => p.tasks && p.tasks.speech && ok(p)) ||
                   list.find(p => /gemini/i.test(p.type || p.preset || '')) || null;
        } catch (e) { prov = null; }
        return prov;
    }
    async function fromAi(text, who) {
        if (!aiOn || !aiReady() || !text) return null;
        if (speech.has(text)) return speech.get(text);
        const p = await provider(); if (!p) return null;
        const v = TTS_VOICE[who] || TTS_VOICE.narrator, kind = String(p.type || p.preset || '').toLowerCase();
        const req = { task: 'speech', provider: p.id, language: lang, prompt: text.slice(0, 600) };
        const mk = kind.indexOf('gemini') >= 0 ? 'gemini' : kind.indexOf('nvidia') >= 0 || /nvidia/i.test(p.preset || '') ? 'nvidia' : 'openai';
        req.model = cfg().model || TTS_MODEL[mk];
        if (kind.indexOf('gemini') >= 0) { req.voice = v[0]; req.prompt = 'Say it as a ' + v[1] + ', in natural ' + ({ en: 'English', fr: 'French', es: 'Spanish', ar: 'Arabic' }[lang] || 'English') + ': ' + text.slice(0, 600); }
        else if (kind.indexOf('nvidia') < 0) { req.voice = v[2]; req.format = 'mp3'; }
        try {
            const res = await MyPC.ai.generate(req);
            const part = res && res.parts ? res.parts.find(x => x.type === 'audio' && x.data) : null;
            if (!part) return null;
            const url = URL.createObjectURL(new Blob([part.data], { type: part.mime || 'audio/wav' }));
            keep(speech, text, url, 16); fails = 0;
            return url;
        } catch (e) {
            const code = e && e.code;
            if (code === 'denied' || code === 'no-provider' || code === 'unsupported' || ++fails >= 4) {   // stop asking for this session
                aiOff = true;
                if (code !== 'denied' && code !== 'no-provider' && window.MyPC && MyPC.report) MyPC.report(new Error('AI voice: ' + (code || '') + ' ' + ((e && e.message) || '')));
            }
            return null;
        }
    }

    // speak one dialogue line; key = recorded clip name (or null), who = speaker id (null = narrator)
    const asking = new Map();                           // text -> the AI request already on its way
    function aiFor(text, who) {
        if (speech.has(text)) return Promise.resolve(speech.get(text));
        if (asking.has(text)) return asking.get(text);
        const pr = fromAi(text, who || 'narrator').finally(() => asking.delete(text));
        asking.set(text, pr);
        return pr;
    }
    function say(key, text, who) {
        stop();
        const t = token, file = fromFile(key).catch(() => null);
        let pick;
        if (aiOn && aiReady() && text) {
            const ai = aiFor(text, who);
            const slow = new Promise(r => setTimeout(() => r(null), 8000));
            pick = Promise.race([ai, slow]).then(u => u || file);
        } else pick = file;
        pick.then(url => {
            const p = out();
            if (!url || t !== token || !p) return;
            p.src = url; p.playbackRate = rate; playing = true; HM_AUDIO.duck(true);
            p.play().catch(() => { playing = false; HM_AUDIO.duck(false); });
        });
    }
    // warm up the next line of the conversation: its recorded clip, and with AI voices its AI voice
    function prefetch(key, text, who) {
        if (key) fromFile(key).catch(() => null);
        if (text && aiOn && aiReady()) aiFor(text, who).catch(() => null);
    }

    function stop() {
        token++;
        if (player && playing) { player.pause(); playing = false; HM_AUDIO.duck(false); }
    }
    // voice speed from the settings: 0.75 to 2
    function setRate(r) { rate = Math.max(0.5, Math.min(2, +r || 1)); if (player) player.playbackRate = rate; }

    return { setLang, say, prefetch, stop, setRate, setAi, aiReady };
})();
