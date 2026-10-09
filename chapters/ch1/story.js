/* Hollowmere, Chapter 1: The Lantern Road. The story, the villagers and the world of chapter 1,
 * built on the engine's chapter interface (docs/CHAPTER_API.md). Maps: js/maps.js, side quests:
 * js/items.js, tasks: js/pool.js, texts: js/i18n*.js. Loaded only while the heroes are in chapter 1. */
HM_CHAPTERS.def.ch1 = function (api) {
    'use strict';
    const TS = api.TS, GT = api.GT;
    const NAME = { maren: 'Maren', tobin: 'Tobin', sela: 'Sela', corvin: 'Corvin', lira: 'Lira', hana: 'Hana', pip: 'Pip', bram: 'Bram', odo: 'Odo', tam: 'Tam', biscuit: 'Biscuit' };
    const NAME_AR = { maren: 'مارين', tobin: 'توبين', sela: 'سيلا', corvin: 'كورفين', lira: 'ليرا', hana: 'هانا', pip: 'بيب', bram: 'برام', odo: 'أودو', tam: 'تام', biscuit: 'بسكويت' };
    const LOOK = {
        maren: { cloak: '#6d5a8a', trim: '#d9c27a', skin: '#e8c4a0', hair: '#e6e6ea', style: 1, s: 1 },
        tobin: { cloak: '#6b4a32', trim: '#2f2f33', skin: '#c98e66', hair: '#3a2a1e', style: 2, s: 1.2 },
        sela: { cloak: '#2f5f7a', trim: '#9fd6ff', skin: '#d4a984', hair: '#2a2a2e', style: 3, s: 1 },
        corvin: { cloak: '#2a2a38', trim: '#5b5bd6', skin: '#d8c0a8', hair: '#151518', style: 0, s: 1.05 },
        lira: { cloak: '#bfe6ff', trim: '#ffffff', skin: '#eaf6ff', hair: '#d9ecff', style: 1, s: 0.85, glow: true, float: true },
        hana: { cloak: '#3f8a5a', trim: '#f2d14a', skin: '#e2b48c', hair: '#7a3a22', style: 1, s: 1 },
        pip: { cloak: '#d86a3a', trim: '', skin: '#f0c8a0', hair: '#5a3a1e', style: 0, s: 0.72 },
        bram: { cloak: '#a8322e', trim: '#3a2a1e', skin: '#d09a74', hair: '#6a4a2a', style: 0, s: 1.1 },
        odo: { cloak: '#7a7f8a', trim: '#c9a43a', skin: '#c48c64', hair: '#5a5f6a', style: 3, s: 1.1 },
        tam: { cloak: '#5a7a3a', trim: '#3a2a1e', skin: '#e2b48c', hair: '#9a5a2a', style: 0, s: 0.86 },
        miner: { cloak: '#7a5a3a', trim: '#3a3a3a', skin: '#d4a07a', hair: '#c8a020', style: 3, s: 1 },
        kid: { cloak: '#5a8ad8', trim: '#f2d14a', skin: '#f0c8a0', hair: '#2a1a10', style: 1, s: 0.74 },
        fisher: { cloak: '#3a6a8a', trim: '#e8e0c8', skin: '#c89a74', hair: '#6a6a6a', style: 3, s: 1.05 },
        biscuit: { anim: 'dog', s: 0.6 }, kitten: { anim: 'cat', s: 0.6 }, bramble: { anim: 'horse', s: 1.2 }, pup: { anim: 'wolf', s: 0.8 }
    };
    const C_g = 103, C_S = 83;

    function S() { return api.S; }
    function T() { return api.T; }
    function advance(st) { const s = S(); if (s.stage < st) { s.stage = st; api.SND.fx('quest'); MyPC.announce(objective(api.L)); } api.save(); }
    const lines = api.lines;
    function embers() { const s = S(); return (s.hearth ? 1 : 0) + (s.tide ? 1 : 0) + (s.stone ? 1 : 0); }
    const ch2Open = () => S().stage >= 17 && HM_CHAPTERS.enabled('ch2');

    function objective(lang) {
        const t = api.TEXT[lang] || api.TEXT.en, s = S(), st = s.stage;
        if (st === 2 && s.ore >= 3) return t.obj[3];
        if (st === 7 && s.caps >= 3) return t.ui.bringCaps;
        if (st >= 17 && ch2Open() && !s.c2) return t.ui.ch2Go;
        return api.txt(t.obj[st] || '', { n: st === 2 ? Math.min(3, s.ore) : Math.min(3, s.caps) });
    }

    // the main story: what someone says when the story needs them (null: nothing new)
    function story(id) {
        const s = S(), st = s.stage;
        switch (id) {
            case 'maren':
                if (st === 0) { advance(1); return lines('maren', 'maren0'); }
                if (st === 5) { advance(6); return lines('maren', 'maren5'); }
                if (st === 9) { advance(10); return lines('maren', 'maren9'); }
                if (st === 12) { advance(13); return lines('maren', 'maren12'); }
                if (st === 15) { advance(16); return lines('maren', 'maren15'); }
                if (s.c2 && s.c2.letter === 1) { s.c2.letter = 2; api.save(); api.SND.fx('quest'); setTimeout(() => api.toast(T().ui.letterBack), 2600); return lines('maren', 'marenLetter'); }
                return null;
            case 'tobin':
                if (st === 1 && s.ore >= 3) { forgeSword(); advance(4); return lines('tobin', 'tobin1').slice(0, 1).concat(lines('tobin', 'tobin2b')); }
                if (st === 1) { advance(2); return lines('tobin', 'tobin1'); }
                if (st === 2 && s.ore < 3) return lines('tobin', 'tobin2a', { n: s.ore });
                if (st === 2) { forgeSword(); advance(4); return lines('tobin', 'tobin2b'); }
                if (st === 10) { s.key = true; advance(11); api.toast(T().ui.gotKey); return lines('tobin', 'tobin10'); }
                return null;
            case 'sela':
                if (st === 6 && s.caps >= 3) { advance(8); return lines('sela', 'sela6').slice(0, 1).concat(lines('sela', 'sela7b')); }
                if (st === 6) { advance(7); return lines('sela', 'sela6'); }
                if (st === 7 && s.caps < 3) return lines('sela', 'sela7a', { n: s.caps });
                if (st === 7) { advance(8); return lines('sela', 'sela7b'); }
                if (ch2Open() && !s.c2) return lines('sela', 'selaLark');
                return null;
            case 'corvin': return st < 15 ? true : null;
        }
        return null;
    }
    function idle(id) {
        const s = S();
        if (id === 'maren') return s.stage >= 17 ? lines('maren', 'marenEnd') : lines('maren', 'marenIdle', { obj: objective(api.L) });
        const key = { tobin: 'tobinIdle', sela: 'selaIdle', corvin: 'corvinIdle', lira: 'liraIdle', hana: 'hana', pip: s.lit ? 'pipPost' : 'pip',
            bram: s.hearth ? 'bramPost' : 'bram', odo: s.key ? 'odoKey' : 'odo', tamHome: 'tamHome', biscuitHome: 'biscuitHome' }[id];
        return lines(id === 'tamHome' ? 'tam' : id === 'biscuitHome' ? 'biscuit' : id, key);
    }
    function forgeSword() { S().sword = true; api.giveItem('iron_sword', true); api.toast(T().ui.gotSword); }
    // what else a villager can do for you
    function extras(id, c) {
        const s = S(), t = T();
        if (id === 'sela' && s.stage >= 8) c.push({ label: t.ui.ferry, fn: () => { api.closeDlg(); ferry('isle'); } });
        if (id === 'sela' && ch2Open()) c.push({ label: t.ui.sailLark, fn: () => { api.closeDlg(); sailLark(); } });
        if (id === 'tobin' && s.stage >= 4) c.push({ label: t.ui.browseForge, fn: () => { api.closeDlg(); api.forgeScreen(); } });
        if (id === 'hana') c.push({ label: t.ui.browsePotions, fn: () => { api.closeDlg(); api.potionScreen(); } });
    }
    function whatNext(id) { return id === 'maren' ? api.txt(T().lines.marenIdle[0], { obj: objective(api.L) }) : objective(api.L); }
    function news(id) {
        const s = S(), st = s.stage;
        if (id === 'maren') return st === 0 || st === 5 || st === 9 || st === 12 || st === 15 || !!(s.c2 && s.c2.letter === 1);
        if (id === 'tobin') return st === 1 || (st === 2 && s.ore >= 3) || st === 10;
        if (id === 'sela') return st === 6 || (st === 7 && s.caps >= 3) || (ch2Open() && !s.c2);
        return false;
    }
    function visible(id) {
        const s = S();
        if (id === 'corvin') return s.stage >= 13;
        if (id === 'lira') return s.stage >= 15;
        if (id === 'tamHome' || id === 'biscuitHome') return api.qState(id === 'tamHome' ? 'tam' : 'biscuit') >= 2;
        return undefined;
    }
    function talkable(id) { return id !== 'corvin' || S().stage >= 15; }

    function ferry(to) {
        api.startFade(() => {
            const s = S();
            if (to === 'isle') { api.loadZone('isle'); api.placePlayers(21.5, 22.2); s.zone = 'isle'; s.x = 21.5; s.y = 22.2; }
            else { api.loadZone('mireshore'); api.placePlayers(21.5, 16.5); s.zone = 'mireshore'; s.x = 21.5; s.y = 16.5; }
            api.save(); api.banner(T().zone[s.zone]);
        });
    }
    // Chapter 2: Sela sails the heroes across the lake to Larkspur Bay
    function sailLark() { api.travel('c2_bay', 21.5, 23.6); }

    // the Lantern, the boats, the quarry gate and the chapel seal
    function interact(p, fx, fy) {
        const s = S(), Z = api.Z, t = T();
        if (Z.lantern && api.dist(fx, fy, Z.lantern.cx, Z.lantern.cy) < 44) { useLantern(); return true; }
        for (const b of Z.boats) if (api.dist(fx, fy, b.cx, b.cy) < 34) {
            if (Z.id === 'isle') api.yesNo(null, t.lines.boatBack[0], () => ferry('shore'), 'boatBack-0');
            else if (ch2Open()) api.say([['sela', t.lines.selaFerry[0], 'selaFerry-0']], [
                { label: t.ui.ferry, fn: () => { api.closeDlg(); ferry('isle'); } },
                { label: t.ui.sailLark, fn: () => { api.closeDlg(); sailLark(); } },
                { label: t.ui.no, fn: api.closeDlg }]);
            else if (s.stage >= 8) api.yesNo('sela', t.lines.selaFerry[0], () => ferry('isle'), 'selaFerry-0');
            else api.talk('sela');
            return true;
        }
        if (api.ahead(p, C_g)) {
            if (s.key) { s.gate = true; api.openTiles(C_g, 61, 'gate'); api.SND.fx('door'); api.toast(t.ui.gateOpen); api.save(); }
            else api.toast(t.ui.gateLocked);
            return true;
        }
        if (api.ahead(p, C_S)) {
            if (embers() === 3) { s.seal = true; api.openTiles(C_S, 120, 'seal'); api.SND.fx('door'); api.shake = 12; api.say(lines(null, 'sealOpen')); api.save(); }
            else api.say(lines(null, 'sealNeed'));
            return true;
        }
        return false;
    }
    // barriers that are already open become plain ground
    function tile(c) { const s = S(); return c === 'b' && s.cut ? '.' : c === 'g' && s.gate ? '=' : c === 'S' && s.seal ? 'x' : c; }
    function onZone(id) { if (id === 'isle' && S().stage === 14) api.boss = api.spawnFoe('shade', 20 * TS, 4.5 * TS, false); }
    // Corvin waits at the chapel: when the seal is open and a hero comes close, he speaks and the Shade rises
    function update() {
        const s = S(), Z = api.Z;
        if (Z.id === 'isle' && s.stage === 13 && s.seal) {
            for (const p of api.P) if (p.on && p.y < 8.2 * TS) {
                api.say(lines('corvin', 'corvin13'), null, () => { advance(14); api.boss = api.spawnFoe('shade', 20 * TS, 4.5 * TS, false); api.burst(20 * TS, 4.5 * TS, 30, '#3a3d58', 3); });
                break;
            }
        }
    }
    function bossDown(f) {
        const s = S(), t = T();
        if (f.t === 'thornback') { s.hearth = true; advance(5); api.say(lines(null, 'thornbackDown'), null, () => api.toast(api.txt(t.ui.gotEmber, { name: t.ui.hearth }))); }
        else if (f.t === 'warden') { s.tide = true; s.page = true; advance(9); api.say(lines(null, 'wardenDown').concat(lines(null, 'journalPage')), null, () => api.toast(api.txt(t.ui.gotEmber, { name: t.ui.tide }))); }
        else if (f.t === 'sentinel') { s.stone = true; advance(12); api.say(lines(null, 'sentinelDown'), null, () => api.toast(api.txt(t.ui.gotEmber, { name: t.ui.stone }))); }
        else if (f.t === 'knight') { s.crypt = true; api.say(lines(null, 'knightDown')); }
        else if (f.t === 'shade') {
            s.heart = true; advance(15);
            api.say(lines(null, 'shadeDown').concat(lines('lira', 'lira1'), lines('lira', 'lira2'), lines('corvin', 'corvin1'), lines('lira', 'lira3'), lines('corvin', 'corvin2')), null, () => api.toast(t.ui.gotHeart));
        }
    }
    function useLantern() {
        const s = S(), Z = api.Z;
        if (s.stage === 16) {
            api.say(lines(null, 'lanternLit'), null, () => {
                s.lit = true; s.stage = 17; api.save(); api.music();
                for (let i = 0; i < 40; i++) api.part(Z.lantern.cx, Z.lantern.cy - 120, 0, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, Math.random() * 3, 60, '#ffd76a', 3);
                api.ringFx(Z.lantern.cx, Z.lantern.cy - 20, 220, '#ffd76a');
                startEnding();
            });
        } else if (s.stage >= 17) api.say(lines(null, 'lanternOn'));
        else api.say(lines(null, 'lanternCold'));
    }
    function score() { const s = S(); return 1000 + s.kills * 10 + s.coins + s.lvl * 100 + s.qdone * 200 + Math.max(0, 3600 - Math.floor(s.time)); }
    function startEnding() {
        const t = T(), sc = score();
        api.slides(t.ending.concat([t.ui.theEnd + '\n' + api.txt(t.ui.score, { n: sc })]), () => {
            S().scored = true; api.save();
            api.toPlay(); api.say(lines('maren', 'hookMaren'), null, () => api.toast(ch2Open() ? t.ui.ch2Go : t.ui.freeRoam));
        }, 'end', t.ending.map((s, i) => 'ending-' + i).concat([0]));
    }

    // where the guide arrow points
    function target() {
        const s = S(), st = s.stage, Z = api.Z;
        if (st >= 17) {
            if (ch2Open() && !s.c2) { if (Z.id !== 'mireshore') return api.hop('mireshore'); GT.x = 23.5 * TS; GT.y = 15.2 * TS; return true; }
            if (Z.id !== 'village') return api.hop('village'); GT.x = 12.5 * TS; GT.y = 4.6 * TS; return true;
        }
        let z = '', x = 0, y = 0;
        if (st === 0 || st === 5 || st === 9 || st === 12 || st === 15) { z = 'village'; x = 24.5; y = 5.2; }
        else if (st === 1 || st === 10 || (st === 2 && s.ore >= 3)) { z = 'village'; x = 5; y = 12.6; }
        else if (st === 2) { z = 'greywood'; const o = api.nearestPick('greywood', 'o'); if (!o) return false; x = o[0]; y = o[1]; }
        else if (st === 4) { z = 'greywood'; x = 35; y = 9; }
        else if (st === 6 || (st === 7 && s.caps >= 3)) { z = 'mireshore'; x = 23.5; y = 15.2; }
        else if (st === 7) { z = 'mireshore'; const o = api.nearestPick('mireshore', 'c'); if (!o) return false; x = o[0]; y = o[1]; }
        else if (st === 8) { z = 'isle'; x = 20; y = 13; }
        else if (st === 11) { z = 'mine'; x = 20; y = 5; }
        else if (st === 13) { z = 'isle'; x = 20; y = s.seal ? 5 : 8.6; }
        else if (st === 14) { z = 'isle'; x = 20; y = 4.5; }
        else if (st === 16) { z = 'village'; x = 22; y = 4.6; }
        else return false;
        if (z !== Z.id) return api.hop(z);
        GT.x = x * TS; GT.y = y * TS; return true;
    }
    // ways that are not doorways: the ferry, and the locked quarry gate
    function hop(next) {
        const Z = api.Z;
        if (Z.id === 'isle') { const b = Z.boats[0]; GT.x = b.cx; GT.y = b.cy; return true; }
        if (Z.id === 'mireshore' && next === 'isle') { GT.x = 23.5 * TS; GT.y = 15.2 * TS; return true; }
        if (Z.id === 'village' && next === 'quarry' && !S().gate) { GT.x = 9 * TS; GT.y = 1.5 * TS; return true; }
        return false;
    }
    function music(zone, def) { return def.music === 0 && S().lit ? 5 : def.music; }
    function fog() { const s = S(); return s.lit ? 0 : (api.Z.id === 'village' ? 0.22 : 0.3) - embers() * 0.04; }
    // Corvin carries a blue lantern until the end
    function npcExtra(id, x, y) { if (id === 'corvin' && S().stage < 15) { const c = api.ctx; c.fillStyle = '#5b5bd6'; c.fillRect(x + 9, y - 22, 5, 7); } }

    return {
        id: 'ch1', home: 'village', maps: window.HM_MAPS, quests: window.HM_QUESTS, pool: window.HM_POOL, chests: window.HM_CHESTS,
        looks: LOOK, talkers: { maren: 1, tobin: 1, sela: 1, corvin: 1 },
        parent: { greywood: 'village', mireshore: 'village', quarry: 'village', isle: 'mireshore', barrow: 'greywood', mine: 'quarry' },
        dust: { village: '#b8a27a', greywood: '#7f6a48', mireshore: '#c8b07a', isle: '#8a7a55', quarry: '#b4a894', barrow: '#7a7c88', mine: '#8a7058' },
        treasures: { village: 2, greywood: 4, mireshore: 3, isle: 3, quarry: 3, barrow: 3, mine: 3 },
        beasts: ['wisp', 'wolf', 'crawler', 'mite', 'bones', 'bat', 'thornback', 'warden', 'knight', 'sentinel', 'shade', 'archer', 'gunner', 'hexer'],
        songs: [0, 1, 2, 3, 4, 5, 6, 7, 8], bossSong: 6,
        start() {
            for (const l in api.TEXT) { const n = api.TEXT[l].names || (api.TEXT[l].names = {}); const src = l === 'ar' ? NAME_AR : NAME; for (const k in src) if (!n[k]) n[k] = src[k]; }
        },
        objective, story, idle, extras, whatNext, news, visible, talkable, interact, tile, onZone, update, bossDown, target, hop, music, fog, npcExtra, score,
        zoneOpen(z) { const s = S(); return z === 'barrow' ? s.stage >= 2 : z === 'isle' ? s.stage >= 8 : z === 'quarry' || z === 'mine' ? !!s.gate : true; },
        stageOf() { return S().stage; },
        lanternLit() { return S().lit; },
        gems() { const s = S(); return (s.hearth ? 1 : 0) | (s.tide ? 2 : 0) | (s.stone ? 4 : 0) | (s.heart && !s.lit ? 8 : 0); },
        relics() { const s = S(), t = T(); return [[t.ui.hearth, s.hearth, 'r'], [t.ui.tide, s.tide, 'b'], [t.ui.stone, s.stone, 's']]; },
        npcY(n) { return n.id === 'corvin' && S().stage === 14 ? 2.3 * TS : n.y; }
    };
};
