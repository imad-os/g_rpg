/* Hollowmere: AI conversation for the main characters, with Gemini (gemini-3.5-flash-lite).
 * The AI never drives the story: quests are scripted. It only answers the hero's chosen line in
 * character, knowing exactly what has happened so far, and suggests the next lines to choose. */
window.HM_AI = (function () {
    'use strict';
    const cfg = window.HM_CONFIG || {};
    const LANG = { en: 'English', fr: 'French', es: 'Spanish', ar: 'Modern Standard Arabic' };
    let thinkingOk = true, ctrl = null;
    const history = {};                       // npc id -> [{role, text}]

    const WORLD = 'World: Hollowmere is a small village. The Great Lantern on its hill has kept the Hush away for three hundred years. ' +
        'The Hush is a grey fog that eats sound, colour and memory. Last night someone stole the Lantern\'s three Embers (Hearth, Tide and Stone) and the fog reached the fences. ' +
        'Places: the Greywood (forest east of the village), the Mirefen shore (south), the Drowned Isle (across the mire, only by Sela\'s ferry), the Old Quarry (north, behind a locked gate). ' +
        'Other villagers: Elder Maren (old lamplighter), Tobin (blacksmith), Sela (ferrywoman), Hana (sells potions), Pip (a boy with a dog called Biscuit), Bram (woodcutter), Odo (guards the quarry gate).';

    const PERSONA = {
        maren: 'You are Elder Maren, the old lamplighter of Hollowmere, about seventy. Warm, wry, firm, a little stubborn. You raised the heroes as your apprentices.',
        tobin: 'You are Tobin, the village blacksmith: big, gruff but kind, dry humour. You mined the Old Quarry before becoming a smith.',
        sela: 'You are Sela, the ferrywoman of the Mirefen: weathered, superstitious, speaks in short poetic sentences. The mire took your husband years ago.',
        corvin: 'You are Corvin, Maren\'s former apprentice. You stole the Embers and the Heartflame to bring back your drowned sister Lira. You have just been defeated, and Lira\'s spirit asked you to let her go. You are ashamed, tired, quietly grateful, and afraid to face Maren.'
    };

    // what everyone knows, unlocked by story stage (never reveal what comes later)
    const FACTS = [
        [1, 'Maren sent the heroes to Tobin to get a real weapon.'],
        [4, 'Tobin forged an iron sword for the heroes from Greywood ore.'],
        [5, 'The heroes defeated the Thornback, a huge thorny boar, deep in the Greywood and recovered the Ember of Hearth.'],
        [8, 'The heroes brought Sela glowcaps, so she can ferry them to the Drowned Isle.'],
        [9, 'On the Drowned Isle the heroes defeated the Bog Warden and recovered the Ember of Tide, and found a journal page signed "C.".'],
        [10, 'The thief is Corvin, Maren\'s former apprentice. His sister Lira drowned in the Mirefen; he tried to use the Lantern to call her back and Maren sent him away.'],
        [11, 'Tobin gave the heroes the Old Quarry key. Tobin once taught Corvin to hold a hammer.'],
        [12, 'The heroes defeated the Stone Sentinel in the quarry and recovered the Ember of Stone.'],
        [13, 'The Embers are cold: Corvin also took the Heartflame, the fire inside them, and hides in the Sunken Chapel on the Drowned Isle, behind a seal the three Embers can open.'],
        [15, 'In the chapel the heroes defeated the Hush Shade. Lira\'s spirit asked Corvin to let her go. Corvin gave back the Heartflame and said he will come home when he can face Maren.'],
        [17, 'The heroes relit the Great Lantern. The Hush is gone and colour has returned.']
    ];

    function enabled() { return !!(cfg.proxyUrl || cfg.geminiKey); }

    function system(npc, ctx) {
        const known = [];
        for (const f of FACTS) if (ctx.stage >= f[0]) known.push('- ' + f[1]);
        const lang = LANG[ctx.lang] || 'English';
        return PERSONA[npc] + '\n' + WORLD + '\n' +
            'What has happened so far:\n' + (known.length ? known.join('\n') : '- The heroes have just woken up to the dark Lantern.') + '\n' +
            'The heroes\' current task: ' + ctx.objective + '\n' +
            'You are talking to ' + ctx.heroes + '.\n' +
            'Rules:\n' +
            '- Reply ONLY in ' + lang + (ctx.lang === 'ar' ? ', addressing the heroes with the plural form' : '') + '. 1 to 3 short sentences, at most 45 words. Stay in character. Spoken words only: no emojis, no markdown, no stage directions.\n' +
            '- You only know the facts above. Never invent new quests, items, places, rewards, or what happens later in the story. If you do not know, say so in character.\n' +
            '- If asked what to do, tell them the current task in your own words.\n' +
            '- "options": exactly 3 short things the heroes could say next (each at most 6 words), in ' + lang + ', varied, and one of them about the current task.';
    }

    function abort() { if (ctrl) { try { ctrl.abort(); } catch (e) {} ctrl = null; } }

    async function call(body) {
        abort();
        ctrl = new AbortController();
        const c = ctrl, timer = setTimeout(() => c.abort(), cfg.timeoutMs || 8000);
        try {
            const model = cfg.model || 'gemini-3.5-flash-lite';
            const url = cfg.proxyUrl ? cfg.proxyUrl : 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent';
            const headers = { 'Content-Type': 'application/json' };
            if (!cfg.proxyUrl) headers['x-goog-api-key'] = cfg.geminiKey;
            const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(cfg.proxyUrl ? Object.assign({ model }, body) : body), signal: c.signal });
            return res;
        } finally { clearTimeout(timer); if (ctrl === c) ctrl = null; }
    }

    // returns { reply, options } or throws
    async function ask(npc, question, ctx) {
        if (!enabled()) throw new Error('off');
        const h = history[npc] || (history[npc] = []);
        h.push({ role: 'user', text: question });
        while (h.length > 8) h.splice(0, 2);         // keep user/model pairs
        const gen = {
            temperature: 0.8, maxOutputTokens: 300, responseMimeType: 'application/json',
            responseSchema: { type: 'OBJECT', properties: { reply: { type: 'STRING' }, options: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['reply', 'options'] }
        };
        const body = {
            systemInstruction: { parts: [{ text: system(npc, ctx) }] },
            contents: h.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
            generationConfig: gen
        };
        if (thinkingOk) gen.thinkingConfig = { thinkingLevel: 'minimal' };   // fastest answers
        let res = await call(body);
        if (res.status === 400 && thinkingOk) { thinkingOk = false; delete gen.thinkingConfig; res = await call(body); }
        if (!res.ok) { h.pop(); throw new Error('http ' + res.status); }
        const data = await res.json();
        const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts || [];
        let text = '';
        for (const p of parts) if (p.text && !p.thought) text += p.text;
        let out;
        try { out = JSON.parse(text); } catch (e) { out = { reply: text, options: [] }; }
        const reply = String(out.reply || '').replace(/[*_#`]/g, '').trim().slice(0, 420);
        if (!reply) { h.pop(); throw new Error('empty'); }
        const options = (Array.isArray(out.options) ? out.options : []).map(o => String(o).replace(/[*_#`]/g, '').trim().slice(0, 60)).filter(Boolean).slice(0, 3);
        h.push({ role: 'model', text: reply });
        return { reply, options };
    }

    function reset() { abort(); for (const k in history) delete history[k]; }

    return { enabled, ask, abort, reset };
})();
