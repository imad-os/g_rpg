/* Hollowmere: The Lantern Road. A 2.5D action RPG for My PC, for 1 or 2 players.
 * One rAF loop, fixed 60 Hz update, pools for foes / shots / particles / drops / rings,
 * input only through the My PC SDK. */
(function () {
    'use strict';
    const W = 640, H = 360, TS = 32, STEP = 1000 / 60;
    const KN = window.HM_KN, VERSION = window.HM_VERSION || '1';
    const ART = window.HM_ART, SND = window.HM_AUDIO, VOICE = window.HM_VOICE, TEXT = window.HM_TEXT, CHAPTERS = window.HM_CHAPTERS, HEROART = window.HM_HERO, MOUNTART = window.HM_MOUNTART;
    const ITEMS = window.HM_ITEMS, SLOTS = window.HM_SLOTS, SHOPS = window.HM_SHOPS, LOOT = window.HM_LOOT, MOUNTS = window.HM_MOUNTS;
    // the chapter the heroes are in (its pack is loaded by js/chapters.js) and its content
    let CH = null, CHID = '', MAPS = {}, QUESTS = [], POOL = [], CHESTS = {}, LOOK = {}, TALKER = {}, PARENT = {}, DUST = {}, TREASURES = {}, BEASTS = [];
    const $ = id => document.getElementById(id);

    let info = null, T = TEXT.en, L = 'en', tier = 'high';
    let canvas, ctx, raf = 0, last = 0, acc = 0, tick = 0, lockUntil = 0, started = false;
    let mode = 'boot';           // overlay, play, dialog, fade
    let S = null;                // the saved game
    let camX = 0, camY = 0, fogOff = 0, shake = 0, freeze = 0, flashT = 0;

    /* ------------------------------------------------------------------ data */

    const HERO_LOOK = [
        { skin: '#f0c8a0', hair: '#3a2416', style: 0, tunic: '#2a9d8f', trim: '#f4d35e', pants: '#3a3f5a', shoes: '#4a3020', cape: '#1f6f66' },
        { skin: '#e2b48c', hair: '#c0582e', style: 1, tunic: '#e76f51', trim: '#f4d35e', pants: '#4a3a5a', shoes: '#4a3020', cape: '#a8432e' }
    ];
    const NOGEAR = { head: '', body: '', feet: '' };
    // a soft round glow of one colour (cached), for magic, shiny weapons and lights
    const GLOW = {};
    function glowSprite(col) {
        if (GLOW[col]) return GLOW[col];
        const c = document.createElement('canvas'); c.width = c.height = 32;
        const x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, col); g.addColorStop(0.35, col + 'aa'); g.addColorStop(1, col + '00');
        x.fillStyle = g; x.fillRect(0, 0, 32, 32);
        GLOW[col] = c; return c;
    }
    const HERO = [
        { cloak: '#2a9d8f', trim: '#f4d35e', skin: '#e9c39b', hair: '#2b1d14', style: 0, s: 1 },
        { cloak: '#e76f51', trim: '#f4d35e', skin: '#d9a77c', hair: '#c0582e', style: 1, s: 1 }
    ];
    const FOE = {
        wisp:      { hp: 2,  dmg: 1, spd: 0.9, r: 9,  xp: 2,  coin: 2 },
        wolf:      { hp: 4,  dmg: 2, spd: 1.1, r: 11, xp: 4,  coin: 4 },
        crawler:   { hp: 5,  dmg: 2, spd: 0.7, r: 11, xp: 5,  coin: 4 },
        mite:      { hp: 7,  dmg: 3, spd: 1.0, r: 11, xp: 7,  coin: 6 },
        bones:     { hp: 7,  dmg: 2, spd: 0.85, r: 10, xp: 6, coin: 5 },
        bat:       { hp: 2,  dmg: 1, spd: 1.5, r: 8,  xp: 3,  coin: 2 },
        thornback: { hp: 40, dmg: 3, spd: 0.6, r: 20, xp: 30, coin: 50, boss: 1 },
        warden:    { hp: 56, dmg: 3, spd: 0.55, r: 22, xp: 45, coin: 70, boss: 1 },
        knight:    { hp: 44, dmg: 3, spd: 0.7, r: 16, xp: 40, coin: 60, boss: 1 },
        sentinel:  { hp: 64, dmg: 3, spd: 0.5, r: 22, xp: 60, coin: 90, boss: 1 },
        shade:     { hp: 84, dmg: 3, spd: 0, r: 18, xp: 80, coin: 120, boss: 1 },
        // people with weapons: they keep their distance, aim, and warn you before they shoot
        archer:  { hp: 30, dmg: 3, spd: 0.85, r: 10, xp: 14, coin: 7, ai: 'archer', weapon: 'bow', col: '#8a5a2e',
                   look: { skin: '#d8a882', hair: '#4a2a1a', style: 3, tunic: '#3f6a3a', trim: '#2a3a20', pants: '#3a3020', shoes: '#2a2018' }, gear: { head: 'hood', body: '', feet: 'leather_boots' } },
        gunner:  { hp: 34, dmg: 5, spd: 0.7, r: 10, xp: 18, coin: 9, ai: 'gunner', weapon: 'gun', col: '#3a3a40',
                   look: { skin: '#c8966e', hair: '#2a2a2e', style: 0, tunic: '#6a3a2e', trim: '#d8b04a', pants: '#2e2a36', shoes: '#1e1a20', beard: '#2a2a2e' }, gear: { head: 'iron_helm', body: '', feet: 'iron_greaves' } },
        hexer:   { hp: 32, dmg: 4, spd: 0.8, r: 10, xp: 20, coin: 10, ai: 'hexer', weapon: 'staff', col: '#c77dff',
                   look: { skin: '#b8a8c8', hair: '#1a1424', style: 1, tunic: '#4a2a6a', trim: '#c77dff', pants: '#2a1a3a', shoes: '#1a1024', cape: '#2a1a3a' }, gear: { head: 'hood', body: '', feet: '' } },
        raider:  { hp: 40, dmg: 4, spd: 0.9, r: 11, xp: 16, coin: 8, ai: 'brute', weapon: 'club', col: '#7a5230',
                   look: { skin: '#c8966e', hair: '#6a2a1a', style: 2, tunic: '#7a2a2a', trim: '#3a2416', pants: '#3a3020', shoes: '#2a2018', beard: '#6a2a1a' }, gear: { head: '', body: 'padded_vest', feet: 'leather_boots' } },
        boar:    { hp: 36, dmg: 4, spd: 0.7, r: 13, xp: 12, coin: 6, ai: 'boar' },
        crab:    { hp: 22, dmg: 3, spd: 0.9, r: 10, xp: 9, coin: 5, ai: 'crab' },
        imp:     { hp: 18, dmg: 3, spd: 1.6, r: 8, xp: 11, coin: 6, ai: 'imp' }
    };
    const ARMED = { archer: 1, gunner: 1, hexer: 1, raider: 1 };
    const SHADE_PTS = [[20, 4.5], [15, 3.5], [25, 3.5], [15.5, 6.5], [24.5, 6.5]];
    const NUM = []; for (let i = 0; i < 200; i++) NUM.push(String(i));
    const RIFT_OPEN = {};                         // chests opened on the current Rift floor (not saved)
    let riftClear = false;

    // balance, set by the owner in MyPC.app_config (all optional; 1 = the 1.7.0 game, which was too generous)
    const TUNE = { coinDrops: 0.6, gearDrops: 0.5, mountSpeed: 1, petSpeed: 1.5, enemyDifficulty: 1.3 };
    const TUNE_MAX = { coinDrops: 5, gearDrops: 10, mountSpeed: 3, petSpeed: 4, enemyDifficulty: 5 };
    function readTune() {
        const c = (window.MyPC && MyPC.app_config) || {};
        for (const k in TUNE) { const v = +c[k]; if (c[k] !== undefined && c[k] !== '' && isFinite(v)) TUNE[k] = Math.max(k === 'coinDrops' || k === 'gearDrops' ? 0 : 0.2, Math.min(TUNE_MAX[k], v)); }
    }
    function loot(n) { return n > 0 && TUNE.coinDrops > 0 ? Math.max(1, Math.round(n * TUNE.coinDrops)) : 0; }

    // abilities: they burn stamina (filled by defeating foes) and then wait for their cooldown (frames)
    const ABIL = { heal: { cost: 25, cd: 600, icon: '✚' }, power: { cost: 35, cd: 300, icon: '✸' }, distant: { cost: 20, cd: 180, icon: '➶' } };
    const STA_MAX = 100, STA_KILL = 8, STA_BIG = 25;
    // what each OK gesture or extra button does (the player can change it in Settings)
    const FNS = ['attack', 'menu', 'heal', 'power', 'distant', 'potion', 'mount'];
    const GESTURES = ['tap', 'double', 'hold', 'run', 'cancel', 'none'];
    const OK_G = { tap: 1, double: 1, hold: 1 };
    const BTN_DEFAULT = { attack: 'tap', menu: 'hold', heal: 'cancel', power: 'double', distant: 'run', potion: 'none', mount: 'none' };
    const VOICE_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];
    // "Return" works only in menus and conversations, so it has its own buttons (hold OK = OK acts when released there)
    const BACK_G = ['hold', 'cancel', 'run', 'none'];
    const SET = { voice: 1, btn: Object.assign({}, BTN_DEFAULT), back: 'hold' };
    function loadSettings() {
        const s = MyPC.load('settings', null);
        if (s && typeof s === 'object') {
            if (VOICE_RATES.indexOf(s.voice) >= 0) SET.voice = s.voice;
            if (s.btn) for (const f of FNS) if (GESTURES.indexOf(s.btn[f]) >= 0) SET.btn[f] = s.btn[f];
            if (!OK_G[SET.btn.menu] || SET.btn.attack === 'none') SET.btn = Object.assign({}, BTN_DEFAULT);
            if (BACK_G.indexOf(s.back) >= 0) SET.back = s.back;
        }
        VOICE.setRate(SET.voice);
    }
    function saveSettings() { MyPC.save('settings', SET); }
    function fnOf(g) { for (const f in SET.btn) if (SET.btn[f] === g) return f; return ''; }

    function fresh() {
        return { v: 3, stage: 0, ore: 0, caps: 0, sword: false, key: false, gate: false, seal: false, hearth: false, tide: false, stone: false,
                 heart: false, page: false, lit: false, picked: {}, cut: false, coins: 0, potions: 1, big: 0, xp: 0, lvl: 1,
                 zone: 'village', x: 21.5, y: 10.5, kills: 0, time: 0, scored: false,
                 bag: [{ u: 1, id: 'stick', r: 0, up: 0, b: [] }], uid: 1, iron: 0,
                 eq: [{ weapon: 1, head: 0, body: 0, feet: 0 }, { weapon: 1, head: 0, body: 0, feet: 0 }],
                 sq: {}, sqc: {}, opened: {}, star: false, crypt: false, qdone: 0,
                 pq: {}, pqDone: [], pqOffer: {}, pet: '', mounts: [], mount: '',
                 seen: {}, tre: {}, rift: { best: 0, floor: 0, seed: 1, k0: 0 } };
    }
    // older saves: their gear (a list of names) becomes items in the bag, and Tobin's sword is never lost
    function migrate(s) {
        if ((s.v || 1) < 3) {
            const names = Array.isArray(s.inv) ? s.inv.slice() : ['stick'];
            if (names.indexOf('stick') < 0) names.unshift('stick');
            if (s.sword && names.indexOf('iron_sword') < 0) names.push('iron_sword');
            s.bag = []; s.uid = 0;
            const uidOf = {};
            for (const id of names) if (window.HM_ITEMS[id]) { s.bag.push({ u: ++s.uid, id, r: 0, up: 0, b: [] }); uidOf[id] = s.uid; }
            const old = Array.isArray(s.eq) ? s.eq : [];
            s.eq = [0, 1].map(i => {
                const e = old[i] || {}, out = { weapon: uidOf.stick, head: 0, body: 0, feet: 0 };
                for (const sl of ['weapon', 'head', 'body', 'feet']) if (e[sl] && uidOf[e[sl]]) out[sl] = uidOf[e[sl]];
                if (s.sword && (!e.weapon || e.weapon === 'stick')) out.weapon = uidOf.iron_sword;
                return out;
            });
            delete s.inv; s.iron = s.iron || 0; s.v = 3;
        }
        return s;
    }
    function save() { MyPC.save('save', S); }
    function txt(s, vars) { return vars ? s.replace(/\{(\w+)\}/g, (m, k) => vars[k] !== undefined ? vars[k] : m) : s; }
    function baseId(id) { return id === 'tamHome' ? 'tam' : id === 'biscuitHome' ? 'biscuit' : id; }
    function npcName(id) {
        id = baseId(id);
        if (id.indexOf('q:') === 0) { const d = poolDef(S.pq[id.slice(2)]); return d ? d.who.name[L] || d.who.name.en : ''; }
        return (T.names && T.names[id]) || (TEXT.en.names && TEXT.en.names[id]) || id;
    }
    function mountName(m) { return m === 'horse' ? T.ui.horse : m === 'dragon' ? T.ui.dragon : T.ui.wolfMount; }
    function heroName(i) { return i ? T.ui.hero2 : T.ui.hero1; }
    function itemName(id) { return (T.items && T.items[id]) || id; }
    function maxHp(p) { return 10 + 3 * (S.lvl - 1) + (p ? p.st.hp : 0); }
    function need(l) { return 5 * l * (l + 1) + (l > 11 ? 60 * (l - 11) * (l - 10) : 0); }   // levels past 11 (chapter 2) take longer
    function stage() { return CH && CH.stageOf ? CH.stageOf() : S.stage; }

    function objective(lang) { return CH && CH.objective ? CH.objective(lang) : ''; }

    /* ------------------------------------------------------------------ pools */

    const P = [0, 1].map(i => ({ i, on: i === 0, dev: '', x: 0, y: 0, fx: 0, fy: 1, ax: 0, ay: 1, hp: 10, atk: 0, swing: 0, inv: 0,
        down: false, downT: 0, walk: 0, kx: 0, ky: 0, hold: 0, moving: false, r: 7, sy: 0, kind: 3, lean: 0, flash: 0, anim: 'sword', bite: 0, lfx: 1,
        sta: 50, cdHeal: 0, cdPower: 0, cdDistant: 0, tapT: -99, aura: 0, auraCol: '#fff',
        st: { atk: 1, cd: 20, kind: 'sword', def: 0, spd: 0, crit: 10, hp: 0, gold: 0, col: '#a07a4a', col2: '#6b4a2e' }, gear: { head: '', body: '', feet: '' } }));
    const FOES = []; for (let i = 0; i < 36; i++) FOES.push({ on: false, kind: 4, t: '', d: null, x: 0, y: 0, hx: 0, hy: 0, hp: 0, max: 0, st: 0, tm: 0, cd: 0,
        vx: 0, vy: 0, kx: 0, ky: 0, hurt: 0, r: 10, sy: 0, active: false, minion: false, mask: 0, ring: 0, alpha: 1, wt: 0, sum: 0, pt: 0, walk: 0, side: 0, sdx: 0, sdy: 0, elite: '', ename: '', bonus: 0 });
    // k: 0 mud, 1 rock, 2 orb, 3 bone (hurt heroes) | 10 arrow, 11 bullet (hurt foes)
    // hostile k: 4 arrow, 5 bullet, 6 homing orb, 7 bomb (lobbed to tx,ty), 8 fireball | friendly 12 light bolt, 13 staff magic
    const SHOTS = []; for (let i = 0; i < 80; i++) SHOTS.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, dmg: 0, r: 5, k: 0, pierce: 0, owner: 0, hit: null, tx: 0, ty: 0, m: 1, col: '' });
    // ground warnings: a circle fills up, then bursts (kind 0) or burns for a while (kind 1)
    const HAZ = []; for (let i = 0; i < 24; i++) HAZ.push({ on: false, x: 0, y: 0, r: 0, t: 0, m: 1, burn: 0, dmg: 0, kind: 0, col: '#ff5a3c', mask: 0 });
    function hazard(x, y, r, warn, dmg, kind, col) {
        for (const h of HAZ) if (!h.on) { h.on = true; h.x = x; h.y = y; h.r = r; h.t = h.m = warn; h.dmg = dmg; h.kind = kind || 0; h.burn = kind ? 150 : 0; h.col = col || '#ff5a3c'; h.mask = 0; return h; }
        return null;
    }
    function updHaz() {
        for (const h of HAZ) {
            if (!h.on) continue;
            if (h.t > 0) { if (--h.t === 0) {
                SND.fx('bomb'); shake = Math.max(shake, 6); ringFx(h.x, h.y, h.r + 10, h.col); burst(h.x, h.y - 4, 14, h.col, 2.4);
                for (const q of P) if (q.on && !q.down && dist(q.x, q.y, h.x, h.y) < h.r + 6) hurt(q, h.dmg, h.x, h.y, true);
                if (PET.on && !PET.down && dist(PET.x, PET.y, h.x, h.y) < h.r) petHurt(h.dmg, h.x, h.y);
                if (!h.kind) h.on = false;
            } continue; }
            if ((tick & 3) === 0) part(h.x + (Math.random() - 0.5) * h.r * 1.6, h.y + (Math.random() - 0.5) * h.r * 0.6, 2, 0, 0, 0.8 + Math.random(), 22, tick & 4 ? '#ffd25a' : h.col, 3, -0.02);
            if ((tick & 31) === 0) for (const q of P) if (q.on && !q.down && dist(q.x, q.y, h.x, h.y) < h.r) hurt(q, Math.max(1, h.dmg >> 1), h.x, h.y, true);
            if (--h.burn <= 0) h.on = false;
        }
    }
    function drawHaz(cx, cy) {
        for (const h of HAZ) {
            if (!h.on) continue;
            const x = h.x - cx, y = h.y - cy;
            if (h.t > 0) {
                const k = 1 - h.t / h.m;
                ctx.globalAlpha = 0.25 + 0.25 * (tick & 4 ? 1 : 0); ctx.strokeStyle = h.col; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.ellipse(x, y, h.r, h.r * 0.45, 0, 0, 6.2832); ctx.stroke();
                ctx.globalAlpha = 0.3; ctx.fillStyle = h.col; ctx.beginPath(); ctx.ellipse(x, y, h.r * k, h.r * 0.45 * k, 0, 0, 6.2832); ctx.fill();
            } else {
                ctx.globalAlpha = 0.35 + Math.sin(tick * 0.3) * 0.1; ctx.fillStyle = h.col; ctx.beginPath(); ctx.ellipse(x, y, h.r, h.r * 0.45, 0, 0, 6.2832); ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }
    const PARTS = []; for (let i = 0; i < 260; i++) PARTS.push({ on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, max: 1, col: '#fff', sz: 2, g: 0.15 });
    const DROPS = []; for (let i = 0; i < 32; i++) DROPS.push({ on: false, kind: 5, k: 0, x: 0, y: 0, z: 0, vz: 0, vx: 0, vy: 0, t: 0, v: 0, sy: 0, it: null, qg: '', icon: '' });
    const FLOATS = []; for (let i = 0; i < 28; i++) FLOATS.push({ on: false, x: 0, y: 0, t: 0, s: '', col: '#fff', big: false });
    const RINGS = []; for (let i = 0; i < 16; i++) RINGS.push({ on: false, x: 0, y: 0, r: 0, max: 0, col: '#fff', w: 3 });
    // the cat follows hero 1: half the hero's attack, defence and health, one and a half times the speed
    const PET = { on: false, kind: 7, x: 0, y: 0, sy: 0, hp: 5, max: 5, down: 0, cd: 0, walk: 0, fx: 1, inv: 0, hurt: 0, regen: 0, lunge: 0, gx: -20, gy: 8, gt: 0, idle: 0, sit: false, sniff: false };
    const DL = new Array(1800); let dlN = 0;
    let boss = null;

    /* ------------------------------------------------------------------ gear */

    // every piece of gear is its own item: { u, id, r: rarity 0-3, up: +0..+5, b: [[bonus, value]] }
    function itemOf(u) { if (!u) return null; for (const it of S.bag) if (it.u === u) return it; return null; }
    function newItem(id, r, b) { return { u: ++S.uid, id, r: r || 0, up: 0, b: b || [] }; }
    function upStep(base) { return base.kind === 'gun' ? 2 : 1; }
    function recalc(p) {
        const e = S.eq[p.i], wi = itemOf(e.weapon), w = ITEMS[wi ? wi.id : 'stick'], st = p.st;
        st.atk = w.atk + (wi ? wi.up * upStep(w) : 0); st.cd = w.cd; st.kind = w.kind; st.col = w.col; st.col2 = w.col2 || '#6b4a2e';
        st.def = 0; st.spd = 0; st.crit = w.kind === 'gun' ? 18 : 10; st.hp = 0; st.gold = 0;
        for (let k = 0; k < SLOTS.length; k++) {
            const it = itemOf(e[SLOTS[k]]); if (!it) continue;
            const base = ITEMS[it.id];
            if (k > 0) { st.def += (base.def || 0) + it.up; st.spd += base.spd || 0; }
            for (const b of it.b) {
                if (b[0] === 'a') st.atk += b[1]; else if (b[0] === 'd') st.def += b[1]; else if (b[0] === 'c') st.crit += b[1];
                else if (b[0] === 's') st.spd += b[1] / 100; else if (b[0] === 'h') st.hp += b[1]; else if (b[0] === 'g') st.gold += b[1];
            }
        }
        const h = itemOf(e.head), bd = itemOf(e.body), ft = itemOf(e.feet);
        p.gear.head = h ? h.id : ''; p.gear.body = bd ? bd.id : ''; p.gear.feet = ft ? ft.id : ''; p.gear.weapon = wi ? wi.id : 'stick'; p.wr = wi ? wi.r : 0;
        if (p.hp > maxHp(p)) p.hp = maxHp(p);
    }
    function recalcAll() { recalc(P[0]); recalc(P[1]); }
    function rollBonuses(id, r) {
        const base = ITEMS[id], pool = LOOT.bonuses[base.slot === 'weapon' ? 'weapon' : 'armour'].slice(), out = [], t = Math.max(1, base.tier || 1);
        for (let k = 0; k < r && pool.length; k++) {
            const type = pool.splice((Math.random() * pool.length) | 0, 1)[0];
            const v = type === 'a' || type === 'd' ? t + ((Math.random() * (t + 1)) | 0) : type === 'c' ? 3 + r + ((Math.random() * 5) | 0)
                : type === 's' ? 4 + ((Math.random() * 7) | 0) : type === 'h' ? 2 * t + ((Math.random() * 4) | 0) : 10 + ((Math.random() * 21) | 0);
            out.push([type, v]);
        }
        return out;
    }
    // a random piece of gear for this area: better areas drop better gear; minR = lowest rarity (bosses: rare)
    function rollItem(tier, minR) {
        const ids = [];
        for (const id in ITEMS) { const t = ITEMS[id].tier; if (t >= 1 && t <= tier && t >= tier - 1) ids.push(id); }
        const id = ids[(Math.random() * ids.length) | 0], c = LOOT.chance, x = Math.random();
        let r = x < c[3] ? 3 : x < c[3] + c[2] ? 2 : x < c[3] + c[2] + c[1] ? 1 : 0;
        r = Math.max(r, minR || 0);
        return newItem(id, r, rollBonuses(id, r));
    }
    function zoneTier() { if (Z.def && Z.def.tier) return Z.def.tier; if (Z.def && Z.def.rift) return Math.min(3, 1 + ((Z.def.rift / 4) | 0)); return Math.min(3, Math.max(LOOT.zoneTier[Z.id] || 2, S.lvl >= 9 ? 3 : S.lvl >= 5 ? 2 : 1)); }
    function sellPrice(it) { return Math.max(5, (ITEMS[it.id].price || 60) >> 2) * (1 + it.r) + it.up * 15; }
    function addToBag(it, quiet) {
        if (S.bag.length >= LOOT.bagSize) { const c = sellPrice(it); S.coins += c; toast(txt(T.ui.bagFull, { n: c })); save(); return; }
        S.bag.push(it);
        // wear it right away if that slot is empty (or still holds the stick)
        const sl = ITEMS[it.id].slot;
        for (let i = 0; i < 2; i++) { const cur = itemOf(S.eq[i][sl]); if (!cur || cur.id === 'stick') S.eq[i][sl] = it.u; }
        recalcAll();
        if (!quiet) { toast(txt(T.ui.gotItem, { item: itemLabel(it) })); SND.fx(it.r >= 2 ? 'level' : 'equip'); }
        save();
    }
    function giveItem(id, quiet, r) { if (ITEMS[id]) addToBag(newItem(id, r || 0, r ? rollBonuses(id, r) : []), quiet); }
    function itemLabel(it) {
        const n = itemName(it.id) + (it.up ? ' +' + it.up : '');
        return it.r ? txt(T.ui.rarityFmt, { item: n, r: T.ui['rar' + it.r] }) : n;
    }
    function statLine(it) {
        const base = ITEMS[it.id]; if (!base) return '';
        let s = '';
        if (base.slot === 'weapon') s = T.ui.atk + ' ' + (base.atk + it.up * upStep(base)) + (base.kind !== 'sword' ? ' · ' + T.ui[base.kind] : '');
        else { const d = (base.def || 0) + it.up; if (d) s = T.ui.def + ' ' + d; }
        if (base.spd) s += (s ? '  ' : '') + T.ui.spd + ' ' + (base.spd > 0 ? '+' : '') + Math.round(base.spd * 100) + '%';
        for (const b of it.b) s += (s ? '  ' : '') + txt(T.ui['b_' + b[0]], { n: b[1] });
        return s;
    }
    // worn by hero 1, or by hero 2 while they play (hero 2's slots fall back to nothing if it was sold)
    function worn(u) { return !!u && (S.eq[0].weapon === u || S.eq[0].head === u || S.eq[0].body === u || S.eq[0].feet === u ||
        (P[1].on && (S.eq[1].weapon === u || S.eq[1].head === u || S.eq[1].body === u || S.eq[1].feet === u))); }

    /* ------------------------------------------------------------------ side quests */

    function qDef(id) { for (const q of QUESTS) if (q.id === id) return q; return null; }
    function qState(id) { return S.sq[id] || 0; }      // 0 not taken, 1 active, 2 ready to hand in, 3 done
    function qOffer(npc) {
        for (const q of QUESTS) if (q.giver === npc && !qState(q.id) && stage() >= q.stage && (!q.after || qState(q.after) === 3)) return q;
        return null;
    }
    function qReady(npc) { for (const q of QUESTS) if (q.giver === npc && qState(q.id) === 2) return q; return null; }
    function qText(q) {
        const t = T.quests[q.id], st = qState(q.id);
        if (st === 2) return txt(T.ui.qReturn, { npc: npcName(q.giver) });
        return txt(t.goal, { n: Math.min(q.n || 0, S.sqc[q.id] || 0), m: q.n || 0 });
    }
    function acceptQuest(q) {
        S.sq[q.id] = 1; S.sqc[q.id] = 0;
        if (q.type === 'fetch' && S.star) S.sq[q.id] = 2;
        SND.fx('quest'); toast(txt(T.ui.qNew, { name: T.quests[q.id].title })); save();
    }
    function questReady(q) { S.sq[q.id] = 2; SND.fx('quest'); toast(txt(T.ui.qDoneGo, { name: T.quests[q.id].title, npc: npcName(q.giver) })); save(); }
    function rewardText(r) {
        const parts = [];
        if (r.coins) parts.push(txt(T.ui.nCoins, { n: loot(r.coins) }));
        if (r.item) parts.push(itemName(r.item));
        if (r.big) parts.push(r.big + ' × ' + T.ui.potB);
        if (r.pet) parts.push(T.ui.catName);
        if (r.mount) parts.push(mountName(r.mount));
        return parts.join(', ');
    }
    function handIn(q) {
        const r = q.reward;
        S.sq[q.id] = 3; S.qdone++;
        S.coins += loot(r.coins || 0); S.big += r.big || 0;
        if (r.item) giveItem(r.item, true, 1);
        if (r.pet && !S.pet) { S.pet = r.pet; PET.x = P[0].x - 20; PET.y = P[0].y + 6; PET.hp = 99; PET.down = 0; setTimeout(() => toast(T.ui.gotPet), 2600); }
        if (r.mount && S.mounts.indexOf(r.mount) < 0) { S.mounts.push(r.mount); if (!S.mount) S.mount = r.mount; refreshMenu(); setTimeout(() => toast(txt(T.ui.gotMount, { m: mountName(r.mount) })), 2600); }
        SND.fx('level'); ringFx(P[0].x, P[0].y - 10, 60, '#ffd23f');
        save();
        return txt(T.ui.qReward, { r: rewardText(r) });
    }
    /* ---------- the quest pool: one task at a time per villager ---------- */
    function poolDef(q) { if (!q) return null; for (const d of POOL) if (d.id === q.id) return d; return null; }
    function pt(d) { return d.t[L] || d.t.en; }
    function zoneOpen(z) { return CH && CH.zoneOpen ? CH.zoneOpen(z) : true; }
    function poolFits(d, npc) { return d.giver === npc && stage() >= d.stage && zoneOpen(d.zone || CH.home); }
    function hasPoolOffer(npc) { if (S.pq[npc] || qOffer(npc)) return false; for (const d of POOL) if (poolFits(d, npc)) return true; return false; }
    // the task this villager offers now (the same one until it is taken, so asking twice shows the same request)
    function poolOffer(npc) {
        if (S.pq[npc]) return null;
        for (const d of POOL) if (d.id === S.pqOffer[npc] && poolFits(d, npc)) return d;
        let list = POOL.filter(d => poolFits(d, npc) && S.pqDone.indexOf(d.id) < 0);
        if (!list.length) list = POOL.filter(d => poolFits(d, npc));           // all done: they come round again
        if (!list.length) return null;
        const d = list[(Math.random() * list.length) | 0];
        S.pqOffer[npc] = d.id;
        return d;
    }
    function poolReward(d) {
        const n = d.n || 1;
        return { coins: loot(20 + S.lvl * 6 + (d.type === 'elite' ? 40 : d.type === 'kill' ? n * 3 : d.type === 'collect' ? n * 4 : 15)),
                 ore: d.type === 'elite' ? 3 : 1, gear: d.type === 'elite' || ART.hash(d.id.charCodeAt(0), d.id.charCodeAt(1), 5) < 0.5 * Math.min(2, TUNE.gearDrops) };
    }
    function poolRewardText(rw) {
        const parts = [txt(T.ui.nCoins, { n: rw.coins }), txt(T.ui.ironReward, { n: rw.ore })];
        if (rw.gear) parts.push(T.ui.gearReward);
        return parts.join(', ');
    }
    function offerPool(npc, d) {
        D.pages = [[npc, pt(d).offer + '\n' + T.ui.reward + ': ' + poolRewardText(poolReward(d)), 'pq-' + d.id + '-offer-0']]; D.i = 0; D.sel = 0;
        D.choices = [{ label: T.ui.accept, fn: () => { acceptPool(npc, d); closeDlg(); } }, { label: T.ui.later, fn: closeDlg }];
        renderDlg();
    }
    function acceptPool(npc, d) {
        S.pq[npc] = { id: d.id, st: 1, c: 0, rw: poolReward(d) }; delete S.pqOffer[npc];
        SND.fx('quest'); toast(txt(T.ui.qNew, { name: pt(d).title })); save();
        if (d.zone === Z.id) spawnPool();
    }
    function poolReady(npc) { const q = S.pq[npc]; if (!q || q.st !== 1) return; q.st = 2; SND.fx('quest'); toast(txt(T.ui.qDoneGo, { name: pt(poolDef(q)).title, npc: npcName(npc) })); save(); }
    function poolHandIn(npc) {
        const q = S.pq[npc], d = poolDef(q), rw = q.rw;
        delete S.pq[npc]; if (S.pqDone.indexOf(d.id) < 0) S.pqDone.push(d.id); S.qdone++;
        S.coins += rw.coins; S.iron += rw.ore;
        if (rw.gear) addToBag(rollItem(zoneTier(), 1), true);
        SND.fx('level'); ringFx(P[0].x, P[0].y - 10, 60, '#ffd23f'); save();
        const msg = txt(T.ui.qReward, { r: poolRewardText(rw) });
        say([[npc, pt(d).done, 'pq-' + d.id + '-done-0'], [null, msg, 0]], null, () => toast(msg));
    }
    function poolGoal(npc) {
        const q = S.pq[npc], d = poolDef(q);
        if (q.st === 2) return txt(T.ui.qReturn, { npc: npcName(npc) });
        return txt(pt(d).goal, { n: Math.min(d.n || 0, q.c), m: d.n || 0 });
    }
    function deliverFor(id) { for (const npc in S.pq) { const q = S.pq[npc], d = poolDef(q); if (d && q.st === 1 && d.type === 'deliver' && d.to === id) return npc; } return ''; }
    // safe, reachable spots far from the entrance, worked out once per area
    const SPOTS = {};
    function zoneSpots() {
        if (SPOTS[Z.id]) return SPOTS[Z.id];
        const cols = Z.cols, rows = Z.rows, dd = new Int16Array(cols * rows).fill(-1), q = [], out = [];
        const sx = Math.floor(Z.def.spawn[0]), sy = Math.floor(Z.def.spawn[1]);
        dd[sy * cols + sx] = 0; q.push(sx, sy);
        let max = 0;
        for (let h = 0; h < q.length; h += 2) {
            const x = q[h], y = q[h + 1], v = dd[y * cols + x];
            if (v > max) max = v;
            for (let k = 0; k < 4; k++) {
                const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
                if (nx < 1 || ny < 1 || nx >= cols - 1 || ny >= rows - 1) continue;
                const i = ny * cols + nx, c = Z.def.rows[ny][nx];
                if (dd[i] >= 0 || Z.block[i] || '#T~rfbgSpCQtDow'.indexOf(c) >= 0) continue;
                dd[i] = v + 1; q.push(nx, ny);
            }
        }
        for (let y = 1; y < rows - 1; y++) for (let x = 1; x < cols - 1; x++) if (dd[y * cols + x] >= max * 0.4) out.push(x, y);
        SPOTS[Z.id] = out;
        return out;
    }
    function spot(seed, k) {
        const s = zoneSpots(), n = s.length >> 1;
        const i = ((ART.hash(seed, k, 11) * n) | 0) * 2;
        PICK[0] = s[i] * TS + 16; PICK[1] = s[i + 1] * TS + 20; return PICK;
    }
    // put this area's quest things in place: items to collect, a lost villager, a named elite
    function spawnPool() {
        for (const npc in S.pq) {
            const q = S.pq[npc], d = poolDef(q);
            if (!d || q.st !== 1 || d.zone !== Z.id) continue;
            const seed = d.id.charCodeAt(0) * 31 + d.id.charCodeAt(1);
            if (d.type === 'collect') {
                for (const o of DROPS) if (o.on && o.k === 4 && o.qg === npc) o.on = false;
                for (let k = q.c; k < d.n; k++) {
                    const p = spot(seed, k);
                    for (const o of DROPS) if (!o.on) { o.on = true; o.k = 4; o.qg = npc; o.icon = d.icon; o.x = p[0]; o.y = p[1]; o.vx = o.vy = 0; o.z = 0; o.vz = 0; o.t = 1e9; o.sy = o.y; o.it = null; break; }
                }
            } else if (d.type === 'rescue') {
                let have = false; for (const n of Z.npcs) if (n.id === 'q:' + npc) have = true;
                if (!have) { const p = spot(seed, 0); Z.npcs.push({ id: 'q:' + npc, look: d.who.look, x: p[0], y: p[1], hx: p[0], hy: p[1], kind: 2, sy: p[1], walk: 0, fx: 0, fy: 1, bob: 2 }); }
            } else if (d.type === 'elite') {
                const p = spot(seed, 0), f = spawnFoe(d.foe, p[0], p[1], false);
                if (f) { f.elite = npc; f.ename = d.name[L] || d.name.en; f.max = f.hp = Math.round((f.d.hp * 5 + S.lvl * 3) * TUNE.enemyDifficulty); f.r = Math.round(f.d.r * 1.35); f.bonus = 1; }
            }
        }
    }

    function countKill(t) {
        for (const npc in S.pq) {
            const q = S.pq[npc], d = poolDef(q);
            if (d && q.st === 1 && d.type === 'kill' && d.foe === t && d.zone === Z.id && ++q.c >= d.n) poolReady(npc);
        }
        for (const q of QUESTS) if (q.type === 'kill' && q.foe === t && qState(q.id) === 1) {
            S.sqc[q.id] = (S.sqc[q.id] || 0) + 1;
            if (S.sqc[q.id] >= q.n) questReady(q);
        }
    }

    /* ------------------------------------------------------------------ zone */

    const SOLID = new Uint8Array(128);
    function setSolid(extra) { SOLID.fill(0); ('#T~rfbgSpCQt' + (extra || '')).split('').forEach(c => { SOLID[c.charCodeAt(0)] = 1; }); }
    setSolid('');
    const Z = { id: '', def: null, cols: 0, rows: 0, tiles: null, block: null, ground: null, theme: 'grass', rs: [], npcs: [], statics: [], picks: [],
        pots: [], chests: [], lights: [], lantern: null, boats: [], field: null, fq: null, ftx: -1, fty: -1, dust: '#b8a27a' };

    const FLY_OVER = new Uint8Array(128); '~rfpbhlkcCv'.split('').forEach(c => { FLY_OVER[c.charCodeAt(0)] = 1; });
    let flyMove = false;                                    // true while a hero on the dragon moves
    function solidAt(x, y) {
        const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
        if (tx < 0 || ty < 0 || tx >= Z.cols || ty >= Z.rows) return true;
        const i = ty * Z.cols + tx;
        if (flyMove && FLY_OVER[Z.tiles[i]] === 1 && Z.block[i] !== 1) return false;
        return SOLID[Z.tiles[i]] === 1 || Z.block[i] === 1;
    }
    function codeAt(x, y) {
        const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
        if (tx < 0 || ty < 0 || tx >= Z.cols || ty >= Z.rows) return 0;
        return Z.tiles[ty * Z.cols + tx];
    }
    const C_b = 98, C_g = 103, C_S = 83, C_m = 109, C_w = 119, C_tilde = 126, C_p = 112, C_dot = 46;

    function addStatic(k, img, x, y, sy, w, h, extra) {
        const s = { k, img, dx: x, dy: y, dw: w, dh: h, sy, on: true, kind: 1, tx: 0, ty: 0, glow: 0 };
        if (extra) Object.assign(s, extra);
        Z.statics.push(s);
        const row = Math.max(0, Math.min(Z.rows - 1, Math.floor((sy - 1) / TS)));
        Z.rs[row].push(s);
        return s;
    }

    function loadZone(id) {
        const def = MAPS[id];
        Z.id = id; Z.def = def; Z.cols = def.rows[0].length; Z.rows = def.rows.length;
        Z.theme = def.ground; Z.dust = DUST[id] || def.dust || '#b8a27a';
        Z.tiles = new Uint8Array(Z.cols * Z.rows); Z.block = new Uint8Array(Z.cols * Z.rows);
        Z.field = new Int16Array(Z.cols * Z.rows); Z.fq = new Int16Array(Z.cols * Z.rows * 2); Z.ftx = -1; Z.fty = -1;
        for (let y = 0; y < Z.rows; y++) for (let x = 0; x < Z.cols; x++) {
            let c = def.rows[y][x];
            if (CH.tile) c = CH.tile(c);
            Z.tiles[y * Z.cols + x] = c.charCodeAt(0);
        }
        Z.rs = []; for (let y = 0; y < Z.rows; y++) Z.rs.push([]);
        Z.statics = []; Z.picks = []; Z.pots = []; Z.chests = []; Z.lights = []; Z.npcs = []; Z.boats = []; Z.lantern = null; Z.rift = null; Z.stairs = null; Z.tablet = null; Z.tre = []; Z.water = null;
        if (def.art && CH.build) CH.build(Z, def); else buildClassic(id, def);
        if (def.stairs) Z.stairs = addStatic('stairs', null, def.stairs.x * TS - 20, def.stairs.y * TS - 18, def.stairs.y * TS - 20, 40, 36, { cx: def.stairs.x * TS, cy: def.stairs.y * TS });
        if (def.tablet) Z.tablet = addStatic('tablet', KN.ok ? KN.prop('tablet') : null, def.tablet.x * TS - 12, def.tablet.y * TS - 34, def.tablet.y * TS + 6, 24, 40, { cx: def.tablet.x * TS, cy: def.tablet.y * TS });
        for (const n of def.npcs) Z.npcs.push({ id: n.id, look: n.look, x: n.x * TS, y: n.y * TS, hx: n.x * TS, hy: n.y * TS, kind: 2, sy: n.y * TS, walk: 0, fx: 0, fy: 1, bob: ART.hash(n.x, n.y, 4) * 6, roam: n.roam || 0, tx: 0, ty: 0, wt: 0 });
        for (const f of FOES) f.on = false;
        for (const s of SHOTS) s.on = false;
        for (const d of DROPS) d.on = false;
        for (const h of HAZ) h.on = false;
        boss = null;
        for (const f of def.foes) spawnFoe(f.t, f.x * TS, f.y * TS, false);
        if (def.boss && !S[def.boss.flag]) boss = spawnFoe(def.boss.t, def.boss.x * TS, def.boss.y * TS, false);
        if (CH.onZone) CH.onZone(id);
        if (def.rift) riftFoes(def.rift);
        if (TREASURES[id]) for (let k = 0; k < TREASURES[id]; k++) {
            const p = spot(7700 + id.charCodeAt(0) * 13 + id.charCodeAt(2), k), key = id + ':T' + k;
            Z.tre.push({ x: p[0], y: p[1], key, found: !!S.tre[key], sniffed: false });
        }
        atmoStart(def.atmo || '');
        spawnPool();
        hideBoss();
        music();
    }
    // chapter 1's zones: Kenney tiles and drawn sprites from the map letters
    function buildClassic(id, def) {
        const sp = ART.sprites(Z.theme), mi = ART.misc(), K = KN.ok, kt = K ? KN.trees(Z.theme) : null;
        for (const p of def.props) {
            if (p.w) for (let y = p.y; y < p.y + p.h; y++) for (let x = p.x; x < p.x + p.w; x++) Z.block[y * Z.cols + x] = 1;
            if (p.k === 'lantern') Z.lantern = addStatic('lantern', mi.lanternOff, p.x * TS, (p.y + p.h) * TS - 150, (p.y + p.h) * TS, 64, 150, { cx: (p.x + 1) * TS, cy: (p.y + p.h) * TS });
            else if (p.k === 'boat') Z.boats.push(addStatic('boat', mi.boat, p.x * TS - 28, p.y * TS - 14, p.y * TS + 10, 56, 28, { cx: p.x * TS, cy: p.y * TS }));
            else if (p.k === 'bell') { Z.block[Math.floor(p.y) * Z.cols + Math.floor(p.x)] = 1; addStatic('bell', mi.bell, p.x * TS - 22, p.y * TS - 56, p.y * TS + 8, 44, 64); }
            else if (p.k === 'rift') Z.rift = addStatic('rift', null, p.x * TS - 26, p.y * TS - 22, p.y * TS - 10, 52, 34, { cx: p.x * TS, cy: p.y * TS });
            else if (p.k === 'statue') { Z.block[Math.floor(p.y) * Z.cols + Math.floor(p.x)] = 1; addStatic('statue', mi.statue, p.x * TS - 15, p.y * TS - 48, p.y * TS + 8, 30, 56); }
            else if (K) addStatic(p.k, KN.building(p.k, p.w, p.h), p.x * TS, (p.y - 1) * TS, (p.y + p.h) * TS, p.w * TS, (p.h + 1) * TS);
            else { const img = ART.building(p.k, p.w, p.h); addStatic(p.k, img, p.x * TS, p.y * TS - 40, (p.y + p.h) * TS, p.w * TS, p.h * TS + 40); }
        }
        const isWall = (x, y) => x < 0 || y < 0 || x >= Z.cols || y >= Z.rows || def.rows[y][x] === '#' || def.rows[y][x] === 't';
        for (let ty = 0; ty < Z.rows; ty++) for (let tx = 0; tx < Z.cols; tx++) {
            const c = def.rows[ty][tx], px = tx * TS, py = ty * TS, key = id + ':' + tx + ',' + ty;
            if (c === 'T') { if (K) addStatic('tree', kt[(ART.hash(tx, ty, 9) * 3) | 0], px - 8 + ((ART.hash(tx, ty, 2) * 4) | 0), Math.max(0, py - 26), py + 30, 48, 56); else addStatic('tree', sp.tree[(ART.hash(tx, ty, 9) * 3) | 0], px - 10 + ((ART.hash(tx, ty, 2) * 6) | 0), Math.max(0, py - 42), py + 30, 52, 72); }
            else if (c === '#') {
                // walls inside a block are drawn flat into the ground; only their edges need raised sprites
                const above = isWall(tx, ty - 1), below = isWall(tx, ty + 1);
                if (!above || !below) addStatic('cliff', K ? KN.wall(Z.theme, !below) : sp.cliff[below ? 0 : 1], px, py - 16, py + TS, 32, 48);
            }
            else if (c === 't') { addStatic('torch', K ? KN.wall(Z.theme, true) : sp.torch, px, py - 16, py + TS, 32, 48); Z.lights.push(px + 16, py + 22); }
            else if (c === 'r') addStatic('rock', K ? KN.prop('rock') : sp.rock, px, py, py + 28, 32, K ? 32 : 30);
            else if (c === 'b') { if (Z.tiles[ty * Z.cols + tx] === 98) addStatic('bramble', sp.bramble, px - 1, py - 12, py + TS, 34, 44, { tx, ty }); }
            else if (c === 'g') { if (Z.tiles[ty * Z.cols + tx] === 103) addStatic('gate', K ? KN.prop('gate') : sp.gate, px, K ? py : py - 16, py + TS, 32, K ? 32 : 48, { tx, ty }); }
            else if (c === 'S') { if (Z.tiles[ty * Z.cols + tx] === 83) addStatic('seal', sp.seal, px, py - 16, py + TS, 32, 48, { tx, ty }); }
            else if (c === 'p') Z.pots.push(K ? addStatic('pot', KN.prop('pot'), px, py, py + 28, 32, 32, { tx, ty, cx: px + 16, cy: py + 18 }) : addStatic('pot', sp.pot, px + 3, py + 2, py + 28, 26, 30, { tx, ty, cx: px + 16, cy: py + 18 }));
            else if (c === 'C' || c === 'Q') {
                const open = def.rift ? !!RIFT_OPEN[key] : !!S.opened[key], star = c === 'Q';
                if (K) Z.chests.push(addStatic('chest', KN.prop(star ? (open ? 'starOpen' : 'star') : (open ? 'chestOpen' : 'chest')), px, py, py + 28, 32, 32,
                    { key, star, open, cx: px + 16, cy: py + 16, img2: KN.prop(star ? 'starOpen' : 'chestOpen') }));
                else Z.chests.push(addStatic('chest', star ? (open ? sp.starOpen : sp.star) : (open ? sp.chestOpen : sp.chest), px + 1, py + 2, py + 28, 30, 28,
                    { key, star, open, cx: px + 16, cy: py + 16, img2: star ? sp.starOpen : sp.chestOpen }));
            }
            else if (c === 'o' && !S.picked[key]) Z.picks.push(K ? addStatic('ore', KN.prop('ore'), px, py, py + 28, 32, 32, { key, cx: px + 16, cy: py + 20 }) : addStatic('ore', sp.ore, px + 3, py + 8, py + 28, 26, 22, { key, cx: px + 16, cy: py + 20 }));
            else if (c === 'c' && !S.picked[key]) Z.picks.push(addStatic('cap', sp.cap, px + 6, py + 8, py + 28, 20, 22, { key, cx: px + 16, cy: py + 20 }));
        }
        const zg = { cols: Z.cols, rows: Z.rows, ch: (x, y) => def.rows[y][x] };
        Z.ground = ART.ground(zg, Z.theme);
        if (K) KN.ground(Z.ground, zg, Z.theme);
    }

    function music() {
        if (boss && boss.active) return SND.play(Z.def.bossSong !== undefined ? Z.def.bossSong : CH && CH.bossSong !== undefined ? CH.bossSong : 6);
        SND.play(Z.def ? (CH && CH.music ? CH.music(Z.id, Z.def) : Z.def.music) : 0);
    }

    function placePlayers(tx, ty) {
        P[0].x = tx * TS; P[0].y = ty * TS;
        P[1].x = P[0].x; P[1].y = P[0].y;
        for (const o of [[18, 0], [-18, 0], [0, 18], [0, -18], [12, 12]]) {
            if (!feetSolid(P[0].x + o[0], P[0].y + o[1])) { P[1].x = P[0].x + o[0]; P[1].y = P[0].y + o[1]; break; }
        }
        for (const p of P) { p.kx = p.ky = 0; p.inv = 60; p.atk = 0; p.swing = 0; p.sy = p.y; }
        PET.x = P[0].x - 18; PET.y = P[0].y + 6; PET.sy = PET.y;
        snapCamera();
    }

    function feetSolid(x, y) { return solidAt(x - 7, y - 5) || solidAt(x + 7, y - 5) || solidAt(x - 7, y + 3) || solidAt(x + 7, y + 3); }

    /* ------------------------------------------------------------------ helpers */

    function spawnFoe(t, x, y, minion) {
        for (const f of FOES) if (!f.on) {
            const d = FOE[t];
            f.on = true; f.t = t; f.d = d; f.x = f.hx = x; f.y = f.hy = y; f.r = d.r;
            f.max = f.hp = Math.max(1, Math.round(d.hp * (d.boss && P[1].on ? 1.5 : 1) * TUNE.enemyDifficulty));
            f.st = 0; f.tm = 0; f.cd = 60; f.vx = f.vy = f.kx = f.ky = 0; f.hurt = 0; f.minion = minion; f.mask = 0; f.ring = 0;
            f.alpha = 1; f.wt = 0; f.sum = 0; f.pt = 0; f.side = 0; f.immune = false; f.weak = false; f.ang = 0; f.ph = 0; f.elite = ''; f.ename = ''; f.bonus = 0; f.active = !d.boss; f.walk = Math.random() * 6; f.sy = y;
            return f;
        }
        return null;
    }
    function part(x, y, z, vx, vy, vz, life, col, sz, g) {
        if (tier === 'low' && (tick & 1)) return;
        for (const p of PARTS) if (!p.on) { p.on = true; p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz; p.life = p.max = life; p.col = col; p.sz = sz; p.g = g === undefined ? 0.15 : g; return; }
    }
    function burst(x, y, n, col, spd) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = spd * (0.4 + Math.random()); part(x, y, 6, Math.cos(a) * s, Math.sin(a) * s * 0.6, 1 + Math.random() * 2, 30 + Math.random() * 20, col, 2 + Math.random() * 2); } }
    function sparks(x, y, dx, dy, n, col) { for (let i = 0; i < n; i++) { const s = 1.5 + Math.random() * 3; part(x, y, 8, dx * s + (Math.random() - 0.5) * 2, dy * s * 0.6 + (Math.random() - 0.5) * 2, 1 + Math.random() * 2, 14 + Math.random() * 10, col, 2, 0.1); } }
    function smoke(x, y, n) { for (let i = 0; i < n; i++) part(x, y, 10, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.5, 0.4 + Math.random() * 0.4, 40 + Math.random() * 20, '#c8c8cc', 4, -0.005); }
    function ringFx(x, y, max, col) { for (const r of RINGS) if (!r.on) { r.on = true; r.x = x; r.y = y; r.r = 4; r.max = max; r.col = col; r.w = 4; return; } }
    function floater(x, y, n, col, big) { for (const f of FLOATS) if (!f.on) { f.on = true; f.x = x; f.y = y; f.t = 50; f.s = NUM[Math.min(199, n)]; f.col = col; f.big = !!big; return; } }
    function drop(x, y, k, v) {
        for (const d of DROPS) if (!d.on) {
            const a = Math.random() * 6.283, s = 0.5 + Math.random() * 1.5;
            d.on = true; d.k = k; d.v = v; d.x = x; d.y = y; d.vx = Math.cos(a) * s; d.vy = Math.sin(a) * s * 0.6; d.z = 6; d.vz = 2.5 + Math.random() * 1.5; d.t = 720; d.sy = y; return;
        }
    }
    function dropGear(x, y, it) {
        for (const d of DROPS) if (!d.on) {
            d.on = true; d.k = 2; d.v = 0; d.it = it; d.x = x; d.y = y; d.vx = (Math.random() - 0.5) * 1.5; d.vy = (Math.random() - 0.5); d.z = 10; d.vz = 3.5; d.t = 3600; d.sy = y;
            if (it.r >= 2) { ringFx(x, y, 60, LOOT.colors[it.r]); SND.fx('chest'); }
            return;
        }
        addToBag(it);                                       // no room on the ground: straight into the bag
    }
    function coins(x, y, total) { while (total > 0) { const v = total >= 10 ? 5 : 1; drop(x, y, 0, v); total -= v; } }
    function shot(x, y, vx, vy, dmg, r, k, owner) {
        for (const s of SHOTS) if (!s.on) { s.on = true; s.x = x; s.y = y; s.vx = vx; s.vy = vy; s.dmg = dmg; s.r = r; s.k = k; s.life = k === 10 ? 48 : k === 11 ? 36 : k === 12 ? 70 : k === 13 ? 64 : k === 4 ? 100 : k === 5 ? 80 : k === 8 ? 160 : 240; s.m = s.life; s.pierce = k === 11 ? 1 : 0; s.owner = owner || 0; s.hit = null; s.col = ''; return s; }
        return null;
    }
    function bomb(x, y, tx, ty, time, dmg) {
        const s = shot(x, y, (tx - x) / time, (ty - y) / time, dmg, 6, 7, 0); if (!s) return;
        s.life = s.m = time; s.tx = tx; s.ty = ty;
        hazard(tx, ty, 30, time, dmg, 0, '#ff7a3a');
    }
    function nearest(x, y) {
        let best = null, bd = 1e9;
        for (const p of P) if (p.on && !p.down) { const d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); if (d < bd) { bd = d; best = p; } }
        return best;
    }
    function dist(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
    function moveEnt(o, dx, dy, rw, rh) {
        let hit = false;
        if (dx) { const nx = o.x + dx; if (!(solidAt(nx - rw, o.y - rh) || solidAt(nx + rw, o.y - rh) || solidAt(nx - rw, o.y + rh) || solidAt(nx + rw, o.y + rh))) o.x = nx; else hit = true; }
        if (dy) { const ny = o.y + dy; if (!(solidAt(o.x - rw, ny - rh) || solidAt(o.x + rw, ny - rh) || solidAt(o.x - rw, ny + rh) || solidAt(o.x + rw, ny + rh))) o.y = ny; else hit = true; }
        return hit;
    }

    /* ------------------------------------------------------------------ HUD / DOM */

    const hudLast = { hp0: -1, hp1: -1, on1: null, max: -1, boss: -1, coins: -1, pot: -1, lvl: -1, obj: '', em: -1, join: null, objTick: 0, mini: false };
    let toastT = 0, bannerT = 0, joinSeen = false, aiNoticeShown = false;

    function toast(s) { const t = $('toast'); t.textContent = s; t.className = 'show'; toastT = 170; MyPC.announce(s); }
    function banner(s) { const b = $('banner'); b.textContent = s; b.className = 'show'; bannerT = 140; }

    function hud() {
        if (!S) return;
        const o = objective(L);
        if (o !== hudLast.obj) { hudLast.obj = o; $('questTxt').textContent = o; hudLast.objTick = tick; }
        // the quest box folds into a small badge 10 seconds after each new step
        const mini = tick - hudLast.objTick > 600;
        if (mini !== hudLast.mini) { hudLast.mini = mini; $('questBox').className = mini ? 'mini' : ''; }
        const em = CH && CH.gems ? CH.gems() : 0;
        if (em !== hudLast.em) { hudLast.em = em; $('em0').className = 'em r' + (em & 1 ? ' on' : ''); $('em1').className = 'em b' + (em & 2 ? ' on' : ''); $('em2').className = 'em s' + (em & 4 ? ' on' : ''); $('em3').className = 'em h' + (em & 8 ? ' on' : ' off'); }
        if (S.coins !== hudLast.coins) { hudLast.coins = S.coins; $('stCoins').textContent = '● ' + S.coins; }
        const pk = S.potions * 100 + S.big;
        if (pk !== hudLast.pot) { hudLast.pot = pk; $('stPot').textContent = '♥ ' + S.potions + (S.big ? '  ✚ ' + S.big : ''); refreshMenu(); }
        if (S.lvl !== hudLast.lvl) { hudLast.lvl = S.lvl; $('stLv').textContent = T.ui.lv + ' ' + S.lvl; }
        const m0 = maxHp(P[0]), m1 = maxHp(P[1]), mh = m0 * 1000 + m1;
        if (P[0].hp !== hudLast.hp0 || mh !== hudLast.max) { hudLast.hp0 = P[0].hp; $('hp0').style.width = (100 * P[0].hp / m0) + '%'; }
        if (P[1].hp !== hudLast.hp1 || mh !== hudLast.max) { hudLast.hp1 = P[1].hp; $('hp1').style.width = (100 * P[1].hp / m1) + '%'; }
        hudLast.max = mh;
        if (P[1].on !== hudLast.on1) { hudLast.on1 = P[1].on; $('pb1').style.display = P[1].on ? '' : 'none'; refreshMenu(); }
        const j = joinSeen && !P[1].on;
        if (j !== hudLast.join) { hudLast.join = j; $('join').style.display = j ? '' : 'none'; }
        hudAbil();
        if (boss && boss.active && boss.on && boss.hp !== hudLast.boss) { hudLast.boss = boss.hp; $('bossFill').style.width = (100 * Math.max(0, boss.hp) / boss.max) + '%'; }
    }
    // stamina bars and the three ability boxes (dark part = cooldown left), changed only when they change
    const AB_EL = [], AB_LAST = new Int32Array(6).fill(-1), STA_LAST = new Int32Array(2).fill(-1), AB_IDS = ['heal', 'power', 'distant'], AB_CH = ['h', 'p', 'd'];
    function hudAbil() {
        if (!AB_EL.length) for (let i = 0; i < 6; i++) { const e = $('ab' + ((i / 3) | 0) + AB_CH[i % 3]); AB_EL.push({ e, b: e.firstElementChild, u: e.lastElementChild }); }
        for (let i = 0; i < 2; i++) {
            const p = P[i]; if (!p.on) continue;
            const sv = Math.round(p.sta); if (sv !== STA_LAST[i]) { STA_LAST[i] = sv; $('sp' + i).style.width = (100 * sv / STA_MAX) + '%'; }
            for (let k = 0; k < 3; k++) {
                const a = AB_IDS[k], cd = p[CD_KEY[a]], ok = p.sta >= ABIL[a].cost, pc = Math.ceil(20 * cd / ABIL[a].cd);
                const key = pc * 4 + (ok ? 2 : 0) + (cd > 0 ? 1 : 0) + Math.ceil(cd / 60) * 100, n = i * 3 + k;
                if (key === AB_LAST[n]) continue;
                AB_LAST[n] = key; const o = AB_EL[n];
                o.b.style.height = (pc * 5) + '%'; o.u.textContent = cd > 0 ? NUM[Math.ceil(cd / 60)] : '';
                o.e.className = 'ab' + (cd <= 0 && ok ? ' ready' : '') + (!ok ? ' low' : '');
            }
        }
    }
    function showBoss(f) { $('bossName').textContent = T.boss[f.t]; $('bossBox').style.display = ''; hudLast.boss = -1; MyPC.announce(T.boss[f.t]); }
    function hideBoss() { $('bossBox').style.display = 'none'; }
    function setHud(on) { $('hud').style.display = on ? '' : 'none'; }

    let menuKey = '';
    function refreshMenu() {
        if (!S) return;
        // My PC's pause menu holds 6 at most; the rest is in the quick menu
        const items = [{ id: 'journal', label: T.ui.mJournal }, { id: 'equip', label: T.ui.mEquip }, { id: 'settings', label: T.ui.mSettings },
            { id: 'potion', label: txt(T.ui.mPotionS, { n: S.potions }) }];
        if (S.mounts.length) items.push({ id: 'mount', label: T.ui.mMounts });
        if (ctrlEl) return;                                 // a guest phone: the menu only has "Leave" (set in controllerOn)
                if (P[1].on) items.push({ id: 'leave2', label: T.ui.mLeave }); else if (HM_COOP.usable()) items.push({ id: 'coop', label: T.ui.mCoop });
        const k = items.map(i => i.label).join('|');
        if (k !== menuKey) { menuKey = k; MyPC.setMenu(items); }
    }

    /* ---------- the Return button: one press closes a menu or ends a conversation ---------- */
    function goBack() {
        if (mode === 'dialog') {
            if (D.wait) return false;
            if (D.i < D.pages.length - 1) { D.i = D.pages.length - 1; if (D.choices) { renderDlg(); } }   // skip the rest of the text
            if (!D.choices) { SND.fx('ok'); closeDlg(); return true; }
            for (const c of D.choices) if (c.fn === closeDlg) { SND.fx('ok'); c.fn(); return true; }
            renderDlg(); return true;                       // a choice that must be made: just show it
        }
        if (mode !== 'overlay') return false;
        if (OV.kind === 'gear') { SND.fx('ok'); closeList(); return true; }
        if (OV.kind === 'journal') { SND.fx('ok'); ovHide(); toPlay(); return true; }
        if (OV.kind === 'menu' && OV.coop) { SND.fx('ok'); coopClose(); return true; }
        if (OV.kind === 'list') {
            const rows = OV.list.rows();
            for (const r of rows) if (r.fn === closeList || r.label === T.ui.back || r.label === T.ui.close || r.label === T.ui.leave) { SND.fx('ok'); r.fn(); return true; }
        }
        return false;                                       // the title screen and story pages have no way back
    }
    let okDown = -1, okBack = false;                        // hold OK as Return: when OK went down in a menu

    /* ------------------------------------------------------------------ dialog */

    const D = { pages: null, i: 0, choices: null, sel: 0, npc: '', ai: false, wait: false, after: null };
    let askToken = 0;

    function openDlg() { mode = 'dialog'; $('dlg').style.display = ''; lockUntil = tick + 6; }
    function closeDlg() {
        VOICE.stop();
        $('dlg').style.display = 'none'; D.pages = null; D.choices = null; D.wait = false; askToken++;
        if (mode === 'dialog') mode = 'play';
        lockUntil = tick + 8;
        const a = D.after; D.after = null; if (a) a();
    }
    // pages: [[who, text, clip], ...]; choices on the last page (optional); after: called when closed
    function say(pages, choices, after) {
        D.pages = pages; D.i = 0; D.choices = choices || null; D.sel = 0; D.ai = false; D.wait = false; D.after = after || null;
        openDlg(); renderDlg();
    }
    function renderDlg() {
        const pg = D.pages[D.i], who = pg[0];
        $('dname').textContent = who ? (who === 'p' ? heroName(0) : npcName(who)) : '';
        $('dname').style.display = who ? '' : 'none';
        $('dtext').textContent = D.wait ? pg[1] + '  …' : pg[1];
        $('dai').style.display = D.ai ? '' : 'none';
        const box = $('dchoices'); box.textContent = '';
        const lastPage = D.i === D.pages.length - 1;
        $('dmore').style.display = (!lastPage || !D.choices) && !D.wait ? '' : 'none';
        if (lastPage && D.choices && !D.wait) {
            D.choices.forEach((c, i) => { const e = document.createElement('div'); e.className = 'ch' + (i === D.sel ? ' sel' : ''); e.textContent = c.label; box.appendChild(e); });
        }
        if (!D.wait) {
            MyPC.announce((who ? $('dname').textContent + ': ' : '') + pg[1] + (lastPage && D.choices ? '. ' + D.choices[D.sel].label : ''));
            if (pg[2] === 0) VOICE.stop(); else VOICE.say(pg[2] || null, pg[1], who ? baseId(who) : null);
            if (!lastPage) VOICE.prefetch(D.pages[D.i + 1][2]);
        } else VOICE.stop();
        SND.fx('talk');
    }
    function dlgInput(a) {
        if (D.wait) return;
        const lastPage = D.i === D.pages.length - 1;
        if (lastPage && D.choices) {
            if (a === 'up' || a === 'down') {
                const n = D.choices.length; D.sel = (D.sel + (a === 'down' ? 1 : n - 1)) % n;
                const els = $('dchoices').children; for (let i = 0; i < els.length; i++) els[i].className = 'ch' + (i === D.sel ? ' sel' : '');
                MyPC.announce(D.choices[D.sel].label); SND.fx('move');
            } else if (a === 'confirm') { SND.fx('ok'); const c = D.choices[D.sel]; c.fn(); }
        } else if (a === 'confirm') {
            if (!lastPage) { D.i++; renderDlg(); } else closeDlg();
        }
    }
    // pages are [who, text, clip]: clip = recorded line name, null = none (text-to-speech may read it), 0 = silent
    const lines = (who, key, vars) => (T.lines[key] || []).map((s, i) => [who, txt(s, vars), vars ? null : key + '-' + i]);
    const qlines = (who, id, part) => (T.quests[id][part] || []).map((s, i) => [who, s, 'q-' + id + '-' + part + '-' + i]);

    /* ------------------------------------------------------------------ questions and answers */

    // the extra things an NPC can do for you: ferry, forge, potions, a side quest
    function extras(id) {
        const c = [];
        if (CH.extras) CH.extras(id, c);
        const q = qOffer(id);
        if (q) c.push({ label: T.ui.askWork, fn: () => offer(id, q) });
        else if (S.pq[id] && S.pq[id].st === 1) c.push({ label: T.ui.qAbandon, fn: () => { delete S.pq[id]; for (const o of DROPS) if (o.on && o.qg === id) o.on = false; save(); closeDlg(); toast(T.ui.qDropped); } });
        else { const d = poolOffer(id); if (d) c.push({ label: T.ui.askWork, fn: () => offerPool(id, d) }); }
        return c;
    }
    // every question shown has a written answer; more questions open up as the story goes on
    function talkChoices(id) {
        const c = extras(id);
        c.push({ label: T.ui.next, fn: () => answer(id, CH.whatNext ? CH.whatNext(id) : objective(L), null) });
        const tp = T.topic[id];
        if (tp) {
            c.push({ label: tp[0], fn: () => answer(id, tp[1], 'topic-' + id + '-lore') });
            c.push({ label: T.ui.about, fn: () => answer(id, tp[2], 'topic-' + id + '-about') });
        }
        const list = (T.talk && T.talk[id]) || [];
        list.forEach((t, k) => { if (stage() >= t.s && (t.e === undefined || stage() <= t.e)) c.push({ label: t.q, fn: () => answer(id, t.a, 'talk-' + id + '-' + k) }); });
        c.push({ label: T.ui.bye, fn: closeDlg });
        return c;
    }
    function answer(id, text, clip) {
        const sel = D.sel;
        D.pages = [[id, text, clip]]; D.i = 0; D.choices = talkChoices(id); D.sel = Math.min(sel, D.choices.length - 1); D.wait = false; D.ai = false;
        renderDlg();
    }

    /* ------------------------------------------------------------------ story */


    function offer(id, q) {
        D.pages = qlines(id, q.id, 'offer'); D.i = 0; D.sel = 0;
        D.pages[D.pages.length - 1] = [id, D.pages[D.pages.length - 1][1] + '\n' + T.ui.reward + ': ' + rewardText(q.reward), D.pages[D.pages.length - 1][2]];
        D.choices = [{ label: T.ui.accept, fn: () => { acceptQuest(q); closeDlg(); } }, { label: T.ui.later, fn: closeDlg }];
        renderDlg();
    }

    function talk(id) {
        let pages = CH.story ? CH.story(id) : null;
        if (pages === true) return;                                       // nothing to say yet
        if (!pages) { const q = qDef(id); if (q && q.type === 'rescue' && q.who === id) return rescue(id); }
        if (!pages && id.indexOf('q:') === 0) return rescueVillager(id.slice(2));
        if (!pages && S.pq[id] && S.pq[id].st === 2) return poolHandIn(id);
        if (!pages) {
            const giver = deliverFor(id);
            if (giver) { const d = poolDef(S.pq[giver]); S.pq[giver].st = 2; SND.fx('quest'); save(); return say([[id, pt(d).given, 'pq-' + d.id + '-given-0']], null, () => toast(txt(T.ui.qDoneGo, { name: pt(d).title, npc: npcName(giver) }))); }
        }
        if (!pages) {
            const q = qReady(baseId(id) === id ? id : '');
            if (q) {
                const msg = handIn(q);
                return say(qlines(id, q.id, 'done').concat([[null, msg, 0]]), null, () => toast(msg));
            }
            pages = CH.idle ? CH.idle(id) : [];
            if (!pages || !pages.length) pages = [[id, '...', 0]];
        }
        if (TALKER[id]) return say(pages, talkChoices(id));
        const ex = extras(id);
        if (ex.length) { ex.push({ label: T.ui.bye, fn: closeDlg }); return say(pages, ex); }
        say(pages);
    }
    // Tam and Biscuit: finding them is enough (even before anyone asked); they head home
    function rescue(who) {
        const q = qDef(who);
        if (qState(who) < 2) { S.sq[who] = 2; SND.fx('quest'); }
        save();
        say(lines(who, who + 'Found'), null, () => {
            for (const n of Z.npcs) if (n.id === who) burst(n.x, n.y - 10, 16, '#ffe9a8', 2);
            toast(txt(T.ui.qDoneGo, { name: T.quests[who].title, npc: npcName(q.giver) }));
        });
    }

    /* ---------- the Rift ---------- */
    function riftOpen() { return S.lvl >= 6 || S.lit; }
    function riftMenu() {
        if (!riftOpen()) return say([[null, T.ui.riftLocked, 0]]);
        const c = [{ label: T.ui.riftStart, fn: () => { closeDlg(); enterRift(1); } }];
        const cp = Math.min(5, Math.floor(S.rift.best / 5) * 5);
        if (cp >= 5) c.push({ label: txt(T.ui.riftFrom, { n: cp }), fn: () => { closeDlg(); enterRift(cp); } });
        c.push({ label: T.ui.leave, fn: closeDlg });
        say([[null, T.ui.riftIntro + '\n' + txt(T.ui.riftMax, { n: RIFT_MAX }) + (S.rift.best ? '   ' + txt(T.ui.riftBest, { n: S.rift.best }) : '') + (S.rift.won ? '   ★ ' + S.rift.won : ''), 0]], c);
    }
    const RIFT_MAX = 10;
    // deeper floors: tougher foes (armed people are a little lighter there, as chapter 1 heroes are young)
    function riftFoes(n) {
        riftClear = false;
        for (const f of FOES) if (f.on) {
            f.max = f.hp = Math.max(1, Math.round(f.max * (ARMED[f.t] ? 0.55 : 1) * (1 + 0.25 * (n - 1))));
            f.bonus = (n / 3) | 0;
        }
    }
    function riftFloor(n) {
        startFade(() => {
            S.rift.floor = n; if (n > S.rift.best) S.rift.best = n;
            for (const k in RIFT_OPEN) delete RIFT_OPEN[k];
            MAPS.rift = window.HM_RIFT.build(n, S.rift.seed); delete SPOTS.rift;
            loadZone('rift'); const sp = Z.def.spawn; placePlayers(sp[0], sp[1]);
            S.zone = 'rift'; S.x = sp[0]; S.y = sp[1]; save();
            banner(txt(T.ui.riftFloor, { n }) + ' / ' + RIFT_MAX);
        });
    }
    function enterRift(n) { S.rift.seed = 1 + ((Math.random() * 1e9) | 0); S.rift.k0 = S.kills; S.rift.t0 = S.time; riftFloor(n); }
    // a run ends when you climb out or fall: the deepest floor goes to the top-10 table
    function endRift(fell, won) {
        const n = S.rift.floor, secs = Math.floor(S.time - (S.rift.t0 || S.time));
        const sc = n * 1000 + Math.max(0, S.kills - S.rift.k0) * 10 + (won ? 5000 + Math.max(0, 3000 - secs * 2) : 0);
        if (won) { S.rift.won = (S.rift.won || 0) + 1; addToBag(rollItem(3, 3), true); }
        MyPC.submitScore(sc, { player: 1, players: P[1].on ? 2 : 1 });
        S.rift.floor = 0;
        startFade(() => {
            loadZone('village'); placePlayers(12.5, 6.2); S.zone = 'village'; S.x = 12.5; S.y = 6.2;
            for (const p of P) { p.hp = maxHp(p); p.down = false; }
            save(); banner(T.zone.village);
            setTimeout(() => toast(txt(won ? T.ui.riftWon : fell ? T.ui.riftFell : T.ui.riftRun, { n, s: sc })), 900);
        });
    }
    function dig(t) {
        t.found = true; S.tre[t.key] = true;
        SND.fx('chest'); ringFx(t.x, t.y, 60, '#ffd23f'); shake = 4;
        for (let i = 0; i < 18; i++) part(t.x, t.y, 4, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, 2 + Math.random() * 2.5, 40, i & 1 ? '#8a6a44' : '#ffe9a8', 3);
        coins(t.x, t.y, loot(40 + zoneTier() * 20)); S.iron += 2;
        if (Math.random() < 0.6) dropGear(t.x, t.y, rollItem(zoneTier(), Math.random() < 0.15 ? 2 : 1));
        toast(T.ui.treasureFound + '   ' + txt(T.ui.gotIron, { n: 2 })); save();
    }
    function readTablet() {
        const f = Math.min(25, Z.def.rift || 25), key = T.lines['tablet' + f] ? 'tablet' + f : 'tablet25';
        say([[null, T.ui.tablet + ':', 0]].concat(lines(null, key)));
    }

    function rescueVillager(npc) {
        const q = S.pq[npc], d = poolDef(q);
        if (!q || q.st !== 1) return;
        q.st = 2; SND.fx('quest'); save();
        say([['q:' + npc, pt(d).found, 'pq-' + d.id + '-found-0']], null, () => {
            for (const n of Z.npcs) if (n.id === 'q:' + npc) burst(n.x, n.y - 10, 16, '#ffe9a8', 2);
            toast(txt(T.ui.qDoneGo, { name: pt(d).title, npc: npcName(npc) }));
        });
    }

    function yesNo(who, text, yes, clip) {
        say([[who, text, clip]], [{ label: T.ui.yes, fn: () => { closeDlg(); yes(); } }, { label: T.ui.no, fn: closeDlg }]);
    }

    function bossDown(f) {
        hideBoss(); shake = 20; SND.fx('quest');
        if (Z.def.rift) { for (const o of FOES) if (o.on && o.minion) { o.on = false; burst(o.x, o.y, 8, '#9aa0b0', 2); } for (const s of SHOTS) if (s.k < 10) s.on = false; boss = null; music(); save(); return; }
        for (const o of FOES) if (o.on && o.minion) { o.on = false; burst(o.x, o.y, 8, '#9aa0b0', 2); }
        for (const s of SHOTS) if (s.k < 10) s.on = false;
        boss = null; music();
        if (CH.bossDown) CH.bossDown(f);
        save();
    }

    function openChest(c) {
        c.open = true; c.img = c.img2; if (Z.def.rift) RIFT_OPEN[c.key] = true; else S.opened[c.key] = true;
        SND.fx('chest'); ringFx(c.cx, c.cy, 50, '#ffe9a8');
        for (let i = 0; i < 16; i++) part(c.cx, c.cy - 4, 10, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 1.2, 2 + Math.random() * 2, 40, '#ffe9a8', 2);
        const k = CHESTS[c.key];
        if (k && k.star) { S.star = true; if (qState('stariron') === 1) S.sq.stariron = 2; say(lines(null, 'starFound')); }
        else if (k && k.flag) { S[k.flag] = true; if (k.item) giveItem(k.item, false, k.r || 1); if (CH.chest) CH.chest(k); }
        else if (k && k.item) giveItem(k.item, false, 1);
        else { const n = loot((k && k.coins) || 30 + ((ART.hash(c.cx, c.cy, 3) * 30) | 0)); coins(c.cx, c.cy, n); S.iron += 2; toast(txt(T.ui.gotCoins, { n }) + '   ·   ' + txt(T.ui.gotIron, { n: 2 })); }
        save();
    }
    function breakPot(s) {
        s.on = false; Z.tiles[s.ty * Z.cols + s.tx] = C_dot; SND.fx('pot');
        for (let i = 0; i < 10; i++) part(s.cx, s.cy, 8, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, 1 + Math.random() * 2.5, 40, i & 1 ? '#9a5a3a' : '#c8865a', 3);
        const r = ART.hash(s.tx, s.ty, tick & 7);
        if (Math.random() < TUNE.coinDrops) coins(s.cx, s.cy, 1 + ((r * 3) | 0));
        if (r > 0.85) drop(s.cx, s.cy, 1, 3);
    }

    function score() { return CH && CH.score ? CH.score() : 0; }

    /* ------------------------------------------------------------------ overlay screens */

    const OV = { kind: '', items: null, sel: 0, slides: null, i: 0, done: null, list: null };
    function ovShow(html) { const o = $('ov'); o.textContent = ''; o.appendChild(html); o.style.display = ''; if (remoteMenu) mirrorMenu(); }
    // hero 2's menu is shown on the host's screen and also copied, as short lines, to the phone that drives it
    let remoteMenu = false;
    function mirrorMenu() {
        if (!remoteMenu) return;
        const rows = [];
        $('ov').querySelectorAll('.ltitle,.linfo,.gt,.li,.gi,.gdn,.gdk,.gds,.mi,.jtitle,.jzone,.jobj,.jq,.jrow').forEach(e => {
            const t = e.textContent.replace(/\s+/g, ' ').trim().slice(0, 70);
            if (t) rows.push((e.classList.contains('sel') ? '▶ ' : '') + t);
        });
        HM_COOP.sendMenu(rows.slice(0, 40));
    }
    function ovHide() { $('ov').style.display = 'none'; OV.kind = ''; VOICE.stop(); }
    function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }

    // the chapter's title: "Chapter 2: The Sunken Lantern"
    function chapterTitle() { const n = CHID ? +CHID.slice(2) : 1; return txt(T.ui.chapterN, { n, name: T.ui['ch' + n + 'Name'] || T.ui.sub }); }
    function showTitle() {
        mode = 'overlay'; OV.kind = 'menu'; setHud(false);
        const hasSave = !!MyPC.load('save', null);
        OV.items = [];
        if (hasSave) OV.items.push({ label: T.ui.cont, fn: continueGame });
        OV.items.push({ label: T.ui.newg, fn: () => hasSave ? confirmNew() : newGame() });
        if (HM_COOP.usable()) OV.items.push({ label: T.ui.coopJoin, fn: joinFriend });
        OV.sel = 0; OV.head = [T.ui.title, chapterTitle()];
        renderMenu();
    }
    function confirmNew() {
        OV.items = [{ label: T.ui.no, fn: showTitle }, { label: T.ui.yes, fn: newGame }];
        OV.sel = 0; OV.head = [T.ui.newg, T.ui.newConfirm]; renderMenu();
    }
    function renderMenu() {
        const box = el('div', 'menu');
        box.appendChild(el('div', 'mtitle', OV.head[0]));
        box.appendChild(el('div', 'msub', OV.head[1]));
        OV.items.forEach((it, i) => box.appendChild(el('div', 'mi' + (i === OV.sel ? ' sel' : ''), it.label)));
        ovShow(box);
        MyPC.announce(OV.head[0] + '. ' + OV.head[1] + '. ' + OV.items[OV.sel].label);
    }
    function slides(list, done, cls, clips) {
        mode = 'overlay'; OV.kind = 'slides'; OV.slides = list; OV.i = 0; OV.done = done; OV.cls = cls || ''; OV.clips = clips || [];
        setHud(false); renderSlide();
    }
    function renderSlide() {
        const box = el('div', 'slide ' + OV.cls);
        box.appendChild(el('div', 'stext', OV.slides[OV.i]));
        box.appendChild(el('div', 'snext', '▶ ' + T.ui.ok));
        ovShow(box); MyPC.announce(OV.slides[OV.i]);
        const clip = OV.clips[OV.i];
        if (clip === undefined || clip === 0) VOICE.stop(); else VOICE.say(clip, OV.slides[OV.i], null);
        if (OV.clips[OV.i + 1]) VOICE.prefetch(OV.clips[OV.i + 1]);
    }
    function showJournal() {
        mode = 'overlay'; OV.kind = 'journal';
        const box = el('div', 'journal');
        box.appendChild(el('div', 'jtitle', T.ui.journal));
        box.appendChild(el('div', 'jzone', Z.def.rift ? txt(T.ui.riftFloor, { n: Z.def.rift }) : T.zone[Z.id] || ''));
        box.appendChild(el('div', 'jobj', objective(L)));
        const em = el('div', 'jrow');
        (CH.relics ? CH.relics() : []).forEach(e => em.appendChild(el('span', 'jem ' + e[2] + (e[1] ? ' on' : ''), (e[1] ? '◆ ' : '◇ ') + e[0])));
        box.appendChild(em);
        const side = QUESTS.filter(q => qState(q.id) === 1 || qState(q.id) === 2), pool = Object.keys(S.pq).filter(n => poolDef(S.pq[n]));
        if (side.length || pool.length) {
            box.appendChild(el('div', 'jsub', T.ui.sideQuests));
            for (const q of side) box.appendChild(el('div', 'jq' + (qState(q.id) === 2 ? ' ready' : ''), '◆ ' + T.quests[q.id].title + ': ' + qText(q)));
            for (const npc of pool) box.appendChild(el('div', 'jq' + (S.pq[npc].st === 2 ? ' ready' : ''), '◆ ' + pt(poolDef(S.pq[npc])).title + ': ' + poolGoal(npc)));
        }
        let found = 0, all = 0; for (const z in TREASURES) { all += TREASURES[z]; for (let k = 0; k < TREASURES[z]; k++) if (S.tre[z + ':T' + k]) found++; }
        box.appendChild(el('div', 'jrow', txt(T.ui.progress, { a: BEASTS.filter(b => S.seen[b]).length, b: BEASTS.length, c: found, d: all, e: S.rift.best })));
        const m = Math.floor(S.time / 60), s = Math.floor(S.time % 60);
        box.appendChild(el('div', 'jrow', T.ui.level + ' ' + S.lvl + '  (' + S.xp + ' / ' + need(S.lvl) + ' XP)    ' + T.ui.coins + ' ' + S.coins + '    ' + T.ui.time + ' ' + m + ':' + (s < 10 ? '0' : '') + s));
        if (S.page) box.appendChild(el('div', 'jpage', T.ui.page + ': ' + T.lines.journalPage[0]));
        box.appendChild(el('div', 'mi sel', T.ui.close));
        ovShow(box);
        MyPC.announce(T.ui.journal + '. ' + objective(L));
    }

    // a scrolling list screen (shop, equipment): rows of { label, sub, right, fn, dim, mark }
    function listScreen(def) { mode = 'overlay'; OV.kind = 'list'; OV.list = def; OV.sel = def.sel || 0; renderList(); }
    function renderList() {
        const d = OV.list, rows = d.rows();
        if (OV.sel >= rows.length) OV.sel = rows.length - 1;
        const box = el('div', 'listbox');
        const head = el('div', 'lhead');
        head.appendChild(el('div', 'ltitle', d.title()));
        head.appendChild(el('div', 'linfo', d.info()));
        box.appendChild(head);
        if (d.tabs) box.appendChild(el('div', 'ltabs', d.tabs()));
        const list = el('div', 'lrows');
        rows.forEach((r, i) => {
            const row = el('div', 'li' + (i === OV.sel ? ' sel' : '') + (r.dim ? ' dim' : '') + (r.mark ? ' mark' : ''));
            if (r.img) { const im = el('div', 'limg'); im.appendChild(r.img); row.appendChild(im); }
            const left = el('div', 'll'); left.appendChild(el('div', 'lname' + (r.cls ? ' ' + r.cls : ''), r.label)); if (r.sub) left.appendChild(el('div', 'lsub', r.sub));
            row.appendChild(left); if (r.right) row.appendChild(el('div', 'lr', r.right));
            list.appendChild(row);
        });
        box.appendChild(list);
        ovShow(box);
        const selEl = list.children[OV.sel];
        if (selEl) { list.scrollTop = Math.max(0, selEl.offsetTop - list.clientHeight / 2 + selEl.offsetHeight / 2); MyPC.announce(rows[OV.sel].label + (rows[OV.sel].sub ? '. ' + rows[OV.sel].sub : '') + (rows[OV.sel].right ? '. ' + rows[OV.sel].right : '')); }
    }
    function listInput(a) {
        const d = OV.list, rows = d.rows();
        if (a === 'up' || a === 'down') { OV.sel = (OV.sel + (a === 'down' ? 1 : rows.length - 1)) % rows.length; SND.fx('move'); renderList(); }
        else if ((a === 'left' || a === 'right') && d.side) { d.side(a === 'right' ? 1 : -1); SND.fx('move'); renderList(); }
        else if (a === 'confirm') { SND.fx('ok'); rows[OV.sel].fn(); }
    }
    function closeList() { ovHide(); toPlay(); }

    function forgeScreen() {
        listScreen({
            title: () => CH.forgeName ? CH.forgeName() : T.ui.forge, info: () => '● ' + S.coins + '   ⛏ ' + S.iron,
            rows: () => [
                { label: T.ui.fBuy, sub: T.ui.fBuySub, fn: buyScreen },
                { label: T.ui.fUp, sub: T.ui.fUpSub, fn: upScreen },
                { label: T.ui.fSell, sub: T.ui.fSellSub, fn: sellScreen },
                { label: T.ui.leave, fn: closeList }]
        });
    }
    function buyScreen() {
        listScreen({
            title: () => T.ui.fBuy, info: () => '● ' + S.coins,
            rows: () => (CH.shop || SHOPS.forge).map(id => {
                const it = ITEMS[id];
                return { label: itemName(id), sub: T.ui['slot_' + it.slot] + ' · ' + statLine({ id, up: 0, b: [] }), right: txt(T.ui.nCoins, { n: it.price }),
                    dim: S.coins < it.price, fn: () => buyItem(id) };
            }).concat([{ label: T.ui.back, fn: () => { forgeScreen(); OV.sel = 0; renderList(); } }])
        });
    }
    function buyItem(id) {
        const base = ITEMS[id];
        if (S.coins < base.price) { toast(T.ui.poor); return; }
        if (S.bag.length >= LOOT.bagSize) { toast(T.ui.bagFullShort); return; }
        S.coins -= base.price;
        const it = newItem(id, 0, []); S.bag.push(it);
        S.eq[0][base.slot] = it.u; recalcAll();             // wear it straight away (hero 1); change it in Equipment
        SND.fx('buy'); toast(txt(T.ui.bought2, { item: itemName(id) })); save(); renderList();
    }
    function gearList(filter) {
        const list = S.bag.filter(it => it.id !== 'stick' && filter(it));
        list.sort((a, b) => (worn(b.u) ? 1 : 0) - (worn(a.u) ? 1 : 0) || b.r - a.r || ITEMS[b.id].tier - ITEMS[a.id].tier);
        return list;
    }
    function upCost(it) { return { c: 20 * (it.up + 1) * (ITEMS[it.id].tier + 1), o: it.up + 1 }; }
    function upScreen() {
        listScreen({
            title: () => T.ui.fUp, info: () => '● ' + S.coins + '   ⛏ ' + S.iron,
            rows: () => gearList(() => true).map(it => {
                const max = it.up >= LOOT.maxUp, cost = upCost(it);
                return { label: itemLabel(it), cls: 'r' + it.r, sub: statLine(it) + (worn(it.u) ? '   ✓ ' + T.ui.equipped : ''),
                    right: max ? T.ui.max : cost.c + ' ●  ' + cost.o + ' ⛏', dim: max || S.coins < cost.c || S.iron < cost.o, fn: () => upgrade(it) };
            }).concat([{ label: T.ui.back, fn: () => { forgeScreen(); OV.sel = 1; renderList(); } }])
        });
    }
    function upgrade(it) {
        if (it.up >= LOOT.maxUp) return toast(T.ui.max);
        const cost = upCost(it);
        if (S.coins < cost.c) return toast(T.ui.poor);
        if (S.iron < cost.o) return toast(T.ui.needOre);
        S.coins -= cost.c; S.iron -= cost.o; it.up++; recalcAll();
        SND.fx('level'); toast(txt(T.ui.upgraded, { item: itemLabel(it) })); save(); renderList();
    }
    let sellArm = 0;
    function sellScreen() {
        sellArm = 0;
        listScreen({
            title: () => T.ui.fSell, info: () => '● ' + S.coins,
            rows: () => gearList(it => !worn(it.u)).map(it => ({ label: itemLabel(it), cls: 'r' + it.r, sub: sellArm === it.u ? T.ui.sellAgain : statLine(it),
                right: '+' + txt(T.ui.nCoins, { n: sellPrice(it) }), mark: sellArm === it.u,
                fn: () => {
                    if (sellArm !== it.u) { sellArm = it.u; renderList(); return; }     // press OK twice to sell
                    const c = sellPrice(it); S.bag.splice(S.bag.indexOf(it), 1); S.coins += c; sellArm = 0;
                    SND.fx('coin'); toast(txt(T.ui.sold, { n: c })); save(); renderList();
                } })).concat([{ label: T.ui.back, fn: () => { forgeScreen(); OV.sel = 2; renderList(); } }])
        });
    }
    function potionScreen() {
        listScreen({
            title: () => CH.storeName ? CH.storeName() : T.ui.store, info: () => '● ' + S.coins + '   ♥ ' + S.potions + '   ✚ ' + S.big,
            rows: () => SHOPS.potions.map(p => ({
                label: p.id === 'small' ? T.ui.potS : T.ui.potB, sub: p.id === 'small' ? txt(T.ui.healN, { n: p.heal }) : T.ui.healFull,
                right: txt(T.ui.nCoins, { n: p.price }), dim: S.coins < p.price,
                fn: () => {
                    if (S.coins < p.price) return toast(T.ui.poor);
                    S.coins -= p.price; if (p.id === 'small') S.potions++; else S.big++;
                    SND.fx('buy'); save(); renderList();
                }
            })).concat(['horse', 'wolf'].filter(m => S.mounts.indexOf(m) < 0 && !(m === 'wolf' && CH.noWolf)).map(m => ({
                label: mountName(m), sub: m === 'horse' ? T.ui.horseSub : T.ui.wolfSub, right: txt(T.ui.nCoins, { n: MOUNTS[m].price }), dim: S.coins < MOUNTS[m].price,
                fn: () => {
                    if (S.coins < MOUNTS[m].price) return toast(T.ui.poor);
                    S.coins -= MOUNTS[m].price; S.mounts.push(m); S.mount = m; refreshMenu();
                    SND.fx('level'); toast(txt(T.ui.gotMount, { m: mountName(m) })); save(); renderList();
                } }))).concat([{ label: T.ui.leave, fn: closeList }])
        });
    }
    // equipment: boxes with pictures (name on top), tabs for the slots, and the details of the chosen piece
    const EQ = { hero: 0, si: 0, focus: 'grid', ti: 0, gi: 0 };
    const GCOLS = 5;
    function rtl() { return document.documentElement.dir === 'rtl'; }
    function gearImg(id) {
        const c = document.createElement('canvas'); c.width = c.height = 32;
        const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
        const icon = KN.ok && KN.gearIcon(id), base = ITEMS[id];
        if (icon) { x.drawImage(icon, 0, 0, 32, 32); return c; }
        x.fillStyle = base.col; x.strokeStyle = base.col; x.lineWidth = 3;
        if (base.kind === 'staff') {                           // a staff with a glowing orb
            x.strokeStyle = base.col2; x.lineWidth = 3; x.beginPath(); x.moveTo(8, 28); x.lineTo(21, 9); x.stroke();
            x.drawImage(glowSprite(base.col), 11, -1, 22, 22); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(22, 10, 3, 0, 6.2832); x.fill();
        } else if (base.kind === 'gun') {                      // a flintlock: wooden stock, dark barrel
            x.fillStyle = base.col2 || '#6b4a2e'; x.beginPath(); x.moveTo(4, 22); x.lineTo(13, 15); x.lineTo(15, 19); x.lineTo(8, 27); x.closePath(); x.fill();
            x.fillStyle = '#8a8f9a'; x.fillRect(12, 13, 17, 4); x.fillStyle = '#c9a43a'; x.fillRect(12, 17, 4, 3); x.fillStyle = '#ffffff'; x.fillRect(26, 13, 3, 1);
        } else if (base.slot === 'weapon') { x.beginPath(); x.moveTo(7, 25); x.lineTo(25, 7); x.stroke(); x.fillStyle = base.col2 || '#6b4a2e'; x.fillRect(5, 21, 8, 3); }
        else if (base.slot === 'head') { x.beginPath(); x.arc(16, 20, 10, Math.PI, 0); x.fill(); x.fillRect(5, 20, 22, 3); }
        else if (base.slot === 'body') { x.fillRect(8, 8, 16, 18); x.fillRect(4, 8, 5, 9); x.fillRect(23, 8, 5, 9); }
        else { x.fillRect(7, 8, 6, 16); x.fillRect(7, 21, 11, 5); x.fillRect(19, 8, 6, 16); x.fillRect(19, 21, 11, 5); }
        return c;
    }
    function itemStats(it) {
        const o = { atk: 0, def: 0, spd: 0, crit: 0, hp: 0, gold: 0 };
        if (!it) return o;
        const base = ITEMS[it.id];
        if (base.slot === 'weapon') o.atk = base.atk + it.up * upStep(base); else o.def = (base.def || 0) + it.up;
        o.spd = Math.round((base.spd || 0) * 100);
        for (const b of it.b) { if (b[0] === 'a') o.atk += b[1]; else if (b[0] === 'd') o.def += b[1]; else if (b[0] === 'c') o.crit += b[1]; else if (b[0] === 's') o.spd += b[1]; else if (b[0] === 'h') o.hp += b[1]; else if (b[0] === 'g') o.gold += b[1]; }
        return o;
    }
    function gearItems() {
        const e = S.eq[EQ.hero], sl = SLOTS[EQ.si];
        const list = S.bag.filter(it => ITEMS[it.id] && ITEMS[it.id].slot === sl);
        list.sort((a, b) => (e[sl] === b.u ? 1 : 0) - (e[sl] === a.u ? 1 : 0) || b.r - a.r || ITEMS[b.id].tier - ITEMS[a.id].tier || b.up - a.up);
        if (sl !== 'weapon') list.push(null);             // the last box takes the piece off
        return list;
    }
    function gearTabs() { const t = SLOTS.slice(); if (P[1].on) t.push('hero'); t.push('close'); return t; }
    function equipScreen(h) { mode = 'overlay'; OV.kind = 'gear'; EQ.hero = h || 0; EQ.si = 0; EQ.focus = 'grid'; EQ.ti = 0; EQ.gi = 0; renderGear(); }
    function renderGear() {
        const e = S.eq[EQ.hero], sl = SLOTS[EQ.si], items = gearItems(), tabs = gearTabs();
        if (EQ.gi >= items.length) EQ.gi = Math.max(0, items.length - 1);
        const box = el('div', 'gearbox'), head = el('div', 'lhead'), st = P[EQ.hero].st;
        head.appendChild(el('div', 'ltitle', T.ui.equip + (P[1].on ? ': ' + heroName(EQ.hero) : '')));
        head.appendChild(el('div', 'linfo', T.ui.atk + ' ' + (st.atk + ((S.lvl - 1) >> 1)) + '   ' + T.ui.def + ' ' + st.def + '   ' + T.ui.spd + ' ' + (st.spd >= 0 ? '+' : '') + Math.round(st.spd * 100) + '%'));
        box.appendChild(head);
        const tb = el('div', 'gtabs');
        tabs.forEach((t, i) => tb.appendChild(el('div', 'gt' + (i === EQ.si && i < 4 ? ' cur' : '') + (EQ.focus === 'tabs' && i === EQ.ti ? ' sel' : ''),
            t === 'hero' ? '⇄ ' + heroName(1 - EQ.hero) : t === 'close' ? T.ui.close : T.ui['slot_' + t])));
        box.appendChild(tb);
        const main = el('div', 'gmain'), grid = el('div', 'ggrid');
        items.forEach((it, i) => {
            const sel = EQ.focus === 'grid' && i === EQ.gi;
            if (!it) { grid.appendChild(el('div', 'gi empty' + (sel ? ' sel' : '') + (!e[sl] ? ' worn' : ''), T.ui.takeOff)); return; }
            const g = el('div', 'gi r' + it.r + (sel ? ' sel' : '') + (e[sl] === it.u ? ' worn' : ''));
            g.appendChild(el('div', 'gn r' + it.r, itemName(it.id)));
            g.appendChild(gearImg(it.id));
            if (it.up) g.appendChild(el('div', 'gup', '+' + it.up));
            grid.appendChild(g);
        });
        main.appendChild(grid);
        // details: the chosen box, or what is worn in this slot while the tabs have the focus
        const det = el('div', 'gdet'), cur = itemOf(e[sl]);
        const it = EQ.focus === 'grid' ? items[EQ.gi] : cur;
        if (it) {
            const base = ITEMS[it.id];
            det.appendChild(el('div', 'gdn r' + it.r, itemLabel(it)));
            det.appendChild(el('div', 'gdk', T.ui['slot_' + base.slot] + (base.slot === 'weapon' ? ' · ' + T.ui[base.kind] : '') + ' · ' + txt(T.ui.tier, { n: base.tier || 0 })));
            det.appendChild(gearImg(it.id));
            const a = itemStats(it), b = itemStats(cur), same = cur === it;
            const rows = [['atk', T.ui.atk, ''], ['def', T.ui.def, ''], ['spd', T.ui.spd, '%'], ['crit', T.ui.critL, '%'], ['hp', T.ui.hpL, ''], ['gold', T.ui.goldL, '%']];
            for (const r of rows) {
                if (!a[r[0]] && !b[r[0]]) continue;
                const row = el('div', 'gds'); row.appendChild(el('span', '', r[1]));
                const v = el('span', '', (a[r[0]] > 0 && r[2] ? '+' : '') + a[r[0]] + r[2]);
                const d = a[r[0]] - b[r[0]];
                if (!same && d) v.appendChild(el('span', d > 0 ? 'up' : 'dn', '  ' + (d > 0 ? '▲' : '▼') + Math.abs(d)));
                row.appendChild(v); det.appendChild(row);
            }
            if (it.up) det.appendChild(el('div', 'gds', txt(T.ui.upgradeLv, { n: it.up })));
            const who = [0, 1].filter(i => (i === 0 || P[1].on) && S.eq[i][base.slot] === it.u).map(heroName).join(', ');
            det.appendChild(el('div', 'gdh', who ? txt(T.ui.worn, { name: who }) : cur ? T.ui.compare : T.ui.noneWorn));
        } else det.appendChild(el('div', 'gdk', EQ.focus === 'grid' ? T.ui.takeOff : T.ui.noneWorn));
        det.appendChild(el('div', 'ghelp', EQ.focus === 'grid' ? T.ui.gearHelp : T.ui.gearHelpTabs));
        main.appendChild(det);
        box.appendChild(main);
        ovShow(box);
        const selEl = EQ.focus === 'grid' ? grid.children[EQ.gi] : null;
        if (selEl) grid.scrollTop = Math.max(0, selEl.offsetTop - grid.clientHeight / 2 + selEl.offsetHeight / 2);
        MyPC.announce(EQ.focus === 'grid' ? (it ? itemLabel(it) + '. ' + statLine(it) : T.ui.takeOff) : tb.children[EQ.ti].textContent);
    }
    function gearInput(a) {
        const items = gearItems(), tabs = gearTabs(), e = S.eq[EQ.hero], sl = SLOTS[EQ.si];
        const dx = a === 'left' ? -1 : a === 'right' ? 1 : 0, h = rtl() ? -dx : dx;    // in Arabic the boxes run right to left
        if (EQ.focus === 'tabs') {
            if (h) { EQ.ti = (EQ.ti + h + tabs.length) % tabs.length; if (EQ.ti < 4) { EQ.si = EQ.ti; EQ.gi = 0; } }
            else if (a === 'down') { if (EQ.ti >= 4) EQ.ti = EQ.si; EQ.focus = 'grid'; EQ.gi = 0; }
            else if (a === 'confirm') {
                const t = tabs[EQ.ti]; SND.fx('ok');
                if (t === 'close') return closeList();
                if (t === 'hero') EQ.hero = 1 - EQ.hero; else { EQ.si = EQ.ti; EQ.focus = 'grid'; EQ.gi = 0; }
            } else return;
        } else {
            if (h) EQ.gi = Math.max(0, Math.min(items.length - 1, EQ.gi + h));
            else if (a === 'down') { if (EQ.gi + GCOLS < items.length) EQ.gi += GCOLS; else if (((EQ.gi / GCOLS) | 0) < (((items.length - 1) / GCOLS) | 0)) EQ.gi = items.length - 1; }
            else if (a === 'up') { if (EQ.gi >= GCOLS) EQ.gi -= GCOLS; else { EQ.focus = 'tabs'; EQ.ti = EQ.si; } }
            else if (a === 'confirm') {
                const it = items[EQ.gi];
                if (!it || (e[sl] === it.u && sl !== 'weapon')) e[sl] = 0; else e[sl] = it.u;
                recalcAll(); SND.fx('equip'); save();
            } else return;
        }
        if (a !== 'confirm') SND.fx('move');
        renderGear();
    }

    // mounts: walk, or ride one you own (the others say where to get them)
    const MICONS = {};
    function mountIcon(m) {
        if (MICONS[m]) return MICONS[m];
        const c = document.createElement('canvas'); c.width = c.height = 96;
        const saved = ctx; ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
        try {
            if (m === 'horse') drawHorse(48, 80, 0, 1, 1.45); else if (m === 'wolf') drawWolfMount(42, 80, 0, 1, 1.8);
            else if (m === 'dragon') MOUNTART.dragon(ctx, 48, 92, 6, 0, false, 7, 0.5, false);
            else HEROART.draw(ctx, 48, 88, HERO_LOOK[0], P[0].gear, 0, false, 0, 0, false, 2);
        } catch (e) {}
        ctx = saved; if (m) MICONS[m] = c;
        return c;
    }
    function mountScreen() {
        listScreen({
            title: () => T.ui.mounts, info: () => S.mount ? T.ui.riding + ': ' + mountName(S.mount) : T.ui.onFoot,
            rows: () => [{ label: T.ui.onFoot, sub: T.ui.onFootSub, img: mountIcon(''), mark: !S.mount, right: S.mount ? '' : '✓', fn: () => { if (S.mount) setMount(''); renderList(); } }]
                .concat(['horse', 'wolf', 'dragon'].map(m => {
                    const own = S.mounts.indexOf(m) >= 0, sp = Math.round((1 + (MOUNTS[m].speed - 1) * TUNE.mountSpeed) * 100) / 100, home = m === 'wolf' && CH.noWolf;
                    return { label: mountName(m), sub: home ? T.ui.wolfStays : (m === 'horse' ? T.ui.horseSub : m === 'dragon' ? T.ui.dragonSub : T.ui.wolfSub) + ' · ' + T.ui.spd + ' ×' + sp, img: mountIcon(m), dim: !own || home, mark: S.mount === m,
                        right: !own ? T.ui.notOwned : home ? '' : S.mount === m ? '✓' : '', fn: () => { if (!own) return toast(m === 'dragon' ? T.ui.dragonHow : T.ui.notOwnedLong); if (home) return toast(T.ui.wolfStays); if (S.mount !== m) setMount(m); renderList(); } };
                }))
                .concat([{ label: T.ui.close, fn: closeList }])
        });
    }

    // settings: voice speed and what each button does
    function fnLabel(f) { return f === 'attack' ? T.ui.attack : f === 'menu' ? T.ui.menuF : f === 'mount' ? T.ui.mountF : f === 'potion' ? T.ui.potionF : ABIL[f].icon + ' ' + T.ui[f]; }
    function canSet(f, g) {
        const cur = SET.btn[f], o = g === 'none' ? '' : fnOf(g);
        if (f === 'menu' && !OK_G[g]) return false;              // the menu must stay on the remote's OK
        if (f === 'attack' && g === 'none') return false;
        if (o && o !== f && ((o === 'menu' && !OK_G[cur]) || (o === 'attack' && cur === 'none'))) return false;
        return true;
    }
    function cycleBtn(f, dir) {
        const cur = SET.btn[f]; let i = GESTURES.indexOf(cur);
        for (let n = 0; n < GESTURES.length; n++) {
            i = (i + dir + GESTURES.length) % GESTURES.length;
            const g = GESTURES[i]; if (g === cur) return;
            if (!canSet(f, g)) continue;
            const o = g === 'none' ? '' : fnOf(g);
            if (o) SET.btn[o] = cur;                               // the one that had it gets this one's old button
            SET.btn[f] = g; saveSettings(); refreshHint(); return;
        }
    }
    function cycleBack(dir) { SET.back = BACK_G[(BACK_G.indexOf(SET.back) + dir + BACK_G.length) % BACK_G.length]; saveSettings(); }
    function cycleVoice(dir) {
        const i = Math.max(0, Math.min(VOICE_RATES.length - 1, VOICE_RATES.indexOf(SET.voice) + dir));
        SET.voice = VOICE_RATES[i]; VOICE.setRate(SET.voice); saveSettings();
        VOICE.say('intro-0', T.intro[0], null);                  // a sample at the new speed
    }
    function settingsScreen() {
        listScreen({
            title: () => T.ui.settings, info: () => '', tabs: () => T.ui.remoteNote,
            side: dir => { const r = OV.sel; if (r === 0) cycleVoice(rtl() ? -dir : dir); else if (r <= FNS.length) cycleBtn(FNS[r - 1], rtl() ? -dir : dir); else if (r === FNS.length + 1) cycleBack(rtl() ? -dir : dir); },
            rows: () => [{ label: txt(T.ui.voiceSpeed, { n: SET.voice }), sub: T.ui.voiceSub, right: '◀ ▶', fn: () => cycleVoice(SET.voice >= 2 ? -9 : 1) }]
                .concat(FNS.map(f => ({ label: fnLabel(f), sub: ABIL[f] ? txt(T.ui.abilityInfo, { a: T.ui[f + 'Sub'], s: ABIL[f].cost, c: ABIL[f].cd / 60 }) : '', right: T.ui['g_' + SET.btn[f]],
                    fn: () => { cycleBtn(f, 1); renderList(); } })))
                .concat([{ label: '↩ ' + T.ui.backF, sub: T.ui.backSub, right: T.ui['g_' + SET.back], fn: () => { cycleBack(1); renderList(); } },
                         { label: T.ui.resetButtons, fn: () => { SET.btn = Object.assign({}, BTN_DEFAULT); SET.back = 'hold'; saveSettings(); refreshHint(); renderList(); } },
                         { label: T.ui.credits, sub: T.ui.creditsText, fn: () => {} },
                         { label: T.ui.close, fn: () => { VOICE.stop(); closeList(); } }])
        });
    }
    function refreshHint() { $('hint').textContent = T.ui['g_' + SET.btn.menu] + ': ' + T.ui.menuF; }

    // the quick menu (hold OK with the default buttons): everything is reachable from here with arrows and OK
    let qmP = null;
    function quickMenu(p) {
        qmP = p || P[0];
        const go = fn => () => { closeList(); fn(); };
        listScreen({
            title: () => T.ui.menuF + (P[1].on ? ': ' + heroName(qmP.i) : ''), info: () => T.ui.stamina + ' ' + Math.round(qmP.sta) + ' / ' + STA_MAX,
            rows: () => {
                const r = [{ label: T.ui.mJournal, sub: objective(L), fn: () => { ovHide(); showJournal(); } }];
                for (const a of AB_IDS) {
                    const cd = qmP[CD_KEY[a]];
                    r.push({ label: ABIL[a].icon + ' ' + T.ui[a], sub: txt(T.ui.abilityInfo, { a: T.ui[a + 'Sub'], s: ABIL[a].cost, c: ABIL[a].cd / 60 }),
                        right: cd > 0 ? Math.ceil(cd / 60) + ' s' : qmP.sta < ABIL[a].cost ? '' : '✓', dim: cd > 0 || qmP.sta < ABIL[a].cost, fn: go(() => ability(qmP, a)) });
                }
                r.push({ label: txt(T.ui.mPotionS, { n: S.potions }), dim: S.potions <= 0, fn: go(() => drink(false)) },
                       { label: txt(T.ui.mPotionB, { n: S.big }), dim: S.big <= 0, fn: go(() => drink(true)) },
                       { label: T.ui.mEquip, fn: () => { ovHide(); equipScreen(qmP.i); } },
                       { label: T.ui.mMounts, sub: S.mount ? T.ui.riding + ': ' + mountName(S.mount) : T.ui.onFoot, fn: mountScreen },
                       { label: T.ui.mBestiary, fn: bestiaryScreen },
                       { label: T.ui.mSettings, fn: settingsScreen });
                if (P[1].on) r.push({ label: T.ui.mLeave, fn: go(leave2) });
                else if (HM_COOP.usable()) r.push({ label: T.ui.mCoop, fn: () => { ovHide(); toPlay(); coopScreen(); } });
                r.push({ label: T.ui.close, fn: closeList });
                return r;
            }
        });
    }
    // the bestiary: a picture, the name and how many you have defeated (??? until you meet one)
    const ICONS = {};
    function beastIcon(t) {
        if (ICONS[t]) return ICONS[t];
        const c = document.createElement('canvas'); c.width = 96; c.height = 96;
        const saved = ctx; ctx = c.getContext('2d');
        const d = FOE[t], k = Math.min(2.6, 34 / d.r);
        ctx.translate(48, 82); ctx.scale(k, k); ctx.translate(-48, -82);
        const f = { t, d, r: d.r, x: 48, y: 82, st: 0, tm: 0, walk: 1, hurt: 0, alpha: 1, vx: 1, vy: 0, ring: 0, sum: 0, elite: '' };
        try { drawFoeBody(f, 0, 0); } catch (e) {}
        ctx = saved; ICONS[t] = c;
        return c;
    }
    function bestiaryScreen() {
        listScreen({
            title: () => T.ui.bestiary, info: () => BEASTS.filter(b => S.seen[b]).length + ' / ' + BEASTS.length,
            rows: () => BEASTS.map(b => S.seen[b] ? { label: T.foes[b][0], sub: T.foes[b][1], right: txt(T.ui.defeated, { n: S.seen[b] }), img: beastIcon(b), fn: () => {} }
                                                   : { label: T.ui.unknown, sub: '', dim: true, fn: () => {} }).concat([{ label: T.ui.close, fn: closeList }])
        });
    }
    function ovInput(a) {
        if (OV.kind === 'menu') {
            if (a === 'up' || a === 'down') {
                const n = OV.items.length; OV.sel = (OV.sel + (a === 'down' ? 1 : n - 1)) % n;
                const els = $('ov').querySelectorAll('.mi'); for (let i = 0; i < els.length; i++) els[i].className = 'mi' + (i === OV.sel ? ' sel' : '');
                MyPC.announce(OV.items[OV.sel].label); SND.fx('move');
            } else if (a === 'confirm') { SND.fx('ok'); OV.items[OV.sel].fn(); }
        } else if (OV.kind === 'slides' && a === 'confirm') {
            SND.fx('ok');
            if (++OV.i < OV.slides.length) renderSlide(); else { ovHide(); const d = OV.done; d(); }
        } else if (OV.kind === 'journal' && a === 'confirm') { ovHide(); toPlay(); }
        else if (OV.kind === 'list') listInput(a);
        else if (OV.kind === 'gear') gearInput(a);
    }
    function toPlay() { if (remoteMenu) { remoteMenu = false; HM_COOP.sendMenu([]); } mode = 'play'; setHud(true); lockUntil = tick + 8; hudLast.obj = ''; hud(); }

    function newGame() {
        S = fresh();
        const go = () => {
            recalcAll(); save();
            P[0].hp = maxHp(P[0]); P[1].hp = maxHp(P[1]); P[0].down = P[1].down = false;
            for (const p of P) { p.sta = 50; p.cdHeal = p.cdPower = p.cdDistant = 0; }
            loadZone('village'); placePlayers(S.x, S.y); P[0].fx = 0; P[0].fy = -1;
            slides(T.intro, () => { toPlay(); banner(T.zone.village); }, '', T.intro.map((s, i) => 'intro-' + i));
        };
        if (CHID === 'ch1') go(); else { ovHide(); mode = 'fade'; fadeT = 20; fadeHold = true; enterChapter('ch1').then(() => { fadeHold = false; mode = 'overlay'; go(); }); }
    }
    function continueGame() {
        S = migrate(Object.assign(fresh(), MyPC.load('save', {})));
        if (CHAPTERS.of(S.zone) !== CHID) { S.zone = CH.home; const sp = MAPS[CH.home].spawn; S.x = sp[0]; S.y = sp[1]; }
        recalcAll();
        P[0].hp = maxHp(P[0]); P[1].hp = maxHp(P[1]); P[0].down = P[1].down = false;
        if (S.zone === 'rift') { if (S.rift.floor > 0) MAPS.rift = window.HM_RIFT.build(S.rift.floor, S.rift.seed); else { S.zone = 'village'; S.x = 12.5; S.y = 6.2; } }
        loadZone(S.zone); placePlayers(S.x, S.y);
        ovHide(); toPlay(); banner(S.zone === 'rift' ? txt(T.ui.riftFloor, { n: S.rift.floor }) : T.zone[S.zone]);
    }
    /* ------------------------------------------------------------------ fade */

    let fadeT = 0, fadeCb = null;
    function startFade(cb) { mode = 'fade'; fadeT = 0; fadeCb = cb; }
    let fadeHold = false;                                   // the screen stays dark while a chapter loads
    function updFade() {
        fadeT++;
        if (fadeT === 20 && fadeCb) { const c = fadeCb; fadeCb = null; c(); }
        if (fadeHold && fadeT > 20) fadeT = 20;
        if (fadeT >= 40 && mode === 'fade') { mode = 'play'; lockUntil = tick + 4; }
    }
    function changeZone(to, tx, ty) {
        const ch = CHAPTERS.of(to);
        startFade(() => {
            const go = () => {
                loadZone(to); placePlayers(tx, ty); S.zone = to; S.x = tx; S.y = ty; save(); banner(T.zone[to] || '');
                if (Z.def.dark && S.mount) setTimeout(() => toast(T.ui.noRideDark), 2400);
                if (CH.arrive) CH.arrive(to);
            };
            if (ch === CHID) return go();
            fadeHold = true;
            enterChapter(ch).then(() => { fadeHold = false; go(); }).catch(() => { fadeHold = false; toast(T.ui.loadFail); });
        });
    }
    function travel(to, tx, ty) { changeZone(to, tx, ty); }

    /* ------------------------------------------------------------------ chapters */

    // enter a chapter: load its pack, let go of the old one, and use its maps, people, quests and music
    let chFoes = [], chSongs = [];
    async function enterChapter(id) {
        if (CHID === id && CH) return;
        const old = CHID;
        if (CH && CH.stop) CH.stop();
        const make = await CHAPTERS.load(id);
        if (!make) throw new Error('chapter ' + id);
        for (const t of chFoes) delete FOE[t];
        if (chSongs.length) SND.drop(chSongs);
        CH = make(API); CHID = id;
        if (old && old !== id) CHAPTERS.unload(old);
        MAPS = CH.maps; QUESTS = CH.quests || []; POOL = CH.pool || []; CHESTS = CH.chests || {}; LOOK = CH.looks || {}; TALKER = CH.talkers || {};
        PARENT = CH.parent || {}; DUST = CH.dust || {}; TREASURES = CH.treasures || {}; BEASTS = CH.beasts || [];
        chFoes = []; if (CH.foes) for (const t in CH.foes) { FOE[t] = CH.foes[t]; chFoes.push(t); }
        if (CH.songDefs) for (const k in CH.songDefs) SND.define(k, CH.songDefs[k]);
        chSongs = CH.songs || [];
        setSolid(CH.solid || '');
        for (const k in SPOTS) delete SPOTS[k];
        for (const k in ICONS) delete ICONS[k];
        if (CH.start) CH.start();
        if (S && CH.noWolf && S.mount === 'wolf') { S.mount = S.mounts.indexOf('horse') >= 0 ? 'horse' : ''; setTimeout(() => toast(T.ui.wolfStays), 2800); }
        if (CH.preload !== false) for (const k of chSongs) SND.prepare(k);
        menuKey = ''; if (S) refreshMenu();
    }
    function lanternLit() { return !!(CH && CH.lanternLit && CH.lanternLit()); }

    // what a chapter can use (see docs/CHAPTER_API.md)
    const API = {
        TS, W, H, P, Z, FOES, SHOTS, DROPS, PET, TEXT, ITEMS, MOUNTS, TUNE, KN, ART, SND, VOICE, HERO: HEROART, FOE,
        get S() { return S; }, get T() { return T; }, get L() { return L; }, get tick() { return tick; }, get ctx() { return ctx; }, get GT() { return GT; },
        get mode() { return mode; }, set mode(v) { mode = v; }, get boss() { return boss; }, set boss(f) { boss = f; },
        get shake() { return shake; }, set shake(v) { shake = v; }, set flash(v) { flashT = v; }, set freeze(v) { freeze = v; },
        get camX() { return camX; }, get camY() { return camY; },
        txt, lines, say, closeDlg, yesNo, toast, banner, slides, toPlay, save, talk, talkChoices,
        spawnFoe, shot, hazard, part, burst, sparks, smoke, ringFx, floater, coins, loot, drop, dropGear, rollItem, giveItem, addToBag, addXp,
        hurt, hitFoe, petHurt, dist, moveEnt, chase, leash, wander, nearest, activate, showBoss, hideBoss, music, minions, maxHp,
        loadZone, placePlayers, changeZone, travel, startFade, addStatic, solidAt, codeAt, openTiles, ahead, frontX, frontY,
        forgeScreen, potionScreen, listScreen, closeList, qState, qDef, hop, exitTo, nearestPick, npcName, heroName, itemName,
        scene, setMount, riding, objective, score: () => score(), zoneTier, aimAt, atmoStart, bomb, drawHeld, feetSolid, glow: glowSprite, enterChapter, potion: () => drink(false)
    };

    /* ------------------------------------------------------------------ players */

    const DEV = {};
    function devHeld(dev, a) { const d = DEV[dev]; return !!(d && d[a]); }
    function held(p, a) { return P[1].on ? devHeld(p.dev, a) : MyPC.isDown(a); }

    function drink(big) {
        if (big ? S.big <= 0 : S.potions <= 0) return toast(T.ui.noPotion);
        let p = P[0];
        if (P[1].on && (P[0].down || (!P[1].down && P[1].hp < P[0].hp))) p = P[1];
        if (big) S.big--; else S.potions--;
        p.hp = Math.min(maxHp(p), p.hp + (big ? 99 : 8)); if (p.down) { p.down = false; p.inv = 90; }
        SND.fx('heal'); burst(p.x, p.y - 10, 16, '#ff7a9a', 1.5); ringFx(p.x, p.y - 8, 34, '#ff7a9a');
        toast(txt(T.ui.healed, { name: heroName(p.i) })); save();
    }
    function join(dev) {
        const p = P[1];
        p.on = true; p.dev = dev; p.hp = maxHp(p); p.down = false; p.x = P[0].x; p.y = P[0].y; p.inv = 90;
        for (const o of [[18, 0], [-18, 0], [0, 18], [0, -18]]) if (!feetSolid(P[0].x + o[0], P[0].y + o[1])) { p.x = P[0].x + o[0]; p.y = P[0].y + o[1]; break; }
        recalc(p); ringFx(p.x, p.y - 10, 40, '#ffb38a');
        toast(txt(T.ui.p2joined, { name: heroName(1) })); SND.fx('ok');
    }
    function setMount(m) {
        if (m === 'wolf' && CH.noWolf) { toast(T.ui.wolfStays); return; }
        if (S.mount === 'dragon' && m !== 'dragon' && !Z.def.dark) for (const p of P) if (p.on && !p.down && feetSolid(p.x, p.y)) { toast(T.ui.flyLand); return; }
        S.mount = m; if (m) S.lastMount = m; save(); refreshMenu();
        if (m && Z.def.dark) toast(T.ui.noRideDark);
        for (const p of P) if (p.on) { burst(p.x, p.y - 4, 12, Z.dust, 1.5); ringFx(p.x, p.y, 30, '#ffffff'); }
        SND.fx(m ? 'equip' : 'move');
    }
    function riding(p) { return !!S.mount && !Z.def.dark && !p.down && !(S.mount === 'wolf' && CH && CH.noWolf); }
    function flying(p) { return S.mount === 'dragon' && riding(p); }
    function playerSpeed(p) { return (codeAt(p.x, p.y) === C_m ? 1.1 : 1.8) * (1 + p.st.spd) * (riding(p) ? 1 + (MOUNTS[S.mount].speed - 1) * TUNE.mountSpeed : 1); }
    function leave2() { P[1].on = false; toast(txt(T.ui.p2left, { name: heroName(1) })); }

    /* ---------- local co-op: My PC owns the rooms (MyPC.multiplayer); state and messages in js/coop.js ---------- */
    // the host: "Co-op" opens My PC's own "Open a room" screen; friends are accepted by My PC's own dialog.
    // Once a room is open (or a friend is in) the menu item shows a small status screen instead.
    function coopScreen() {
        if (!HM_COOP.usable()) return toast(T.ui.coopNone);
        if (HM_COOP.host.state === 'idle') { HM_COOP.openRoom(() => { toast(T.ui.coopOpened); refreshMenu(); }); return; }
        mode = 'overlay'; OV.kind = 'menu'; OV.coop = 'host'; OV.items = []; OV.sel = 0; setHud(false);
        HM_COOP.listen(coopRender); coopRender();
    }
    function coopRender() {
        if (!(mode === 'overlay' && OV.kind === 'menu' && OV.coop === 'host')) return;
        const c = HM_COOP.host, u = T.ui, back = { label: u.coopBack, fn: coopClose };
        OV.head = [u.coopTitle, c.state === 'connected' ? u.coopOn : c.state === 'open' ? u.coopWaiting : u.coopIdle];
        OV.items = c.state === 'connected' ? [{ label: u.coopDrop, fn: () => HM_COOP.disconnect() }, back] : c.state === 'open' ? [{ label: u.coopShut, fn: () => HM_COOP.closeRoom() }, back] : [back];
        OV.sel = Math.min(OV.sel || 0, OV.items.length - 1);
        renderMenu();
    }
    function coopClose() { OV.coop = ''; HM_COOP.listen(null); ovHide(); toPlay(); refreshMenu(); }
    // the guest: "Join a friend" opens My PC's own list of rooms; when accepted this phone becomes a pad
    function joinFriend() {
        if (!HM_COOP.usable()) return toast(T.ui.coopNone);
        HM_COOP.join(controllerOn, controllerOff, rows => { if (ctrlText) ctrlText.textContent = rows.join('\n'); });               // a failed or cancelled join was already explained by My PC: stay on the title
    }
    // connected as a guest: the phone shows only a pad; the game runs on the host
    let ctrlEl = null, ctrlText = null;
    function controllerOn(r) {
        OV.coop = ''; ovHide(); mode = 'overlay'; OV.kind = 'ctrl'; setHud(false); SND.pause();
        ctrlEl = el('div', '');
        ctrlEl.style.cssText = 'position:fixed;inset:0;z-index:99990;background:#07080c;color:#fff;text-align:center;padding-top:14vmin;font-size:max(18px,4.2vmin)';
        ctrlEl.appendChild(el('div', '', txt(T.ui.coopCtrl, { name: r.name })));
        const h = el('div', '', T.ui.coopCtrlHelp); h.style.cssText = 'margin-top:2vmin;font-size:max(14px,3vmin);color:#9fb0c8'; ctrlEl.appendChild(h);
        const b = el('div', '', T.ui.coopLeave); b.style.cssText = 'position:absolute;top:2vmin;inset-inline-end:2vmin;padding:1.4vmin 3vmin;border:2px solid rgba(255,255,255,0.5);border-radius:1.2vmin;background:rgba(255,255,255,0.14);font-weight:700;touch-action:manipulation';
        b.addEventListener('click', () => HM_COOP.leave());
        ctrlEl.appendChild(b);
        ctrlText = el('div', ''); ctrlText.style.cssText = 'position:absolute;left:26%;right:26%;top:20vmin;bottom:4vmin;overflow:hidden;text-align:start;white-space:pre-line;font-size:max(13px,2.8vmin);line-height:1.35;color:#dfe3ee';
        ctrlEl.appendChild(ctrlText); document.body.appendChild(ctrlEl);
        // a pure controller: big stick and buttons (the player can change them with the gear button); the menu button opens hero 2's menu
        if (window.VirtualPad) { VirtualPad.hide(); VirtualPad.init({ force: true, pause: false, id: 'guest', scale: { stick: 1.35, btn: 1.25 }, send: HM_COOP.sendKey,
            buttons: [{ label: 'A', key: 90 }, { label: 'B', key: 88 }, { label: 'C', key: 8 }, { label: '☰', key: 77 }], catalog: [{ label: 'A', key: 90 }, { label: 'B', key: 88 }, { label: 'C', key: 8 }, { label: '☰', key: 77 }] }); }
        MyPC.setMenu([{ id: 'coopleave', label: T.ui.coopLeave }]);
    }
    function controllerOff() {
        if (!ctrlEl) return;
        ctrlEl.remove(); ctrlEl = null;
        ctrlText = null;
        if (window.VirtualPad) { VirtualPad.hide(); VirtualPad.init(window.HM_PADOPT); }
        SND.resume(); menuKey = ''; showTitle(); toast(T.ui.coopLeft);
    }

    function frontX(p, d) { return p.x + p.ax * d; }
    function frontY(p, d) { return p.y - 4 + p.ay * d; }

    function roamNpc(n) {
        const q = P[0], near = dist(q.x, q.y, n.x, n.y) < 56;
        if (near) { n.moving = false; const dx = q.x - n.x, dy = q.y - n.y; n.dir = Math.abs(dy) > Math.abs(dx) ? (dy < 0 ? 1 : 0) : 2; n.flip = dx < 0; return; }
        if (!n.moving) { if (--n.wt <= 0) { const a = Math.random() * 6.2832, r = Math.random() * n.roam * TS; n.tx = n.hx + Math.cos(a) * r; n.ty = n.hy + Math.sin(a) * r * 0.6; n.moving = true; } return; }
        const dx = n.tx - n.x, dy = n.ty - n.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 2 || moveEnt(n, dx / d * 0.45, dy / d * 0.45, 5, 3)) { n.moving = false; n.wt = 120 + ((Math.random() * 240) | 0); n.dir = 0; return; }
        n.dir = Math.abs(dy) > Math.abs(dx) ? (dy < 0 ? 1 : 0) : 2; n.flip = dx < 0; n.walk += 0.12;
    }
    function npcVisible(id) {
        const v = CH.visible ? CH.visible(id) : undefined;
        if (v !== undefined) return v;
        if (id.indexOf('q:') === 0) { const q = S.pq[id.slice(2)]; return !!q && q.st === 1; }
        const q = qDef(id); if (q && q.type === 'rescue' && q.who === id) return qState(id) < 2;
        return true;
    }
    function talkable(id) { return !CH.talkable || CH.talkable(id); }
    function news(id) { return !!(CH.news && CH.news(id)); }

    // talking, doors, chests, the Rift...: true when OK did one of them
    function interact(p) {
        if (p.down) return true;
        const fx = frontX(p, 18), fy = frontY(p, 18);
        for (const n of Z.npcs) {
            if (!npcVisible(n.id) || !talkable(n.id)) continue;
            if (dist(fx, fy, n.x, n.y - 6) < 34 || dist(p.x, p.y, n.x, n.y) < 46) { n.fx = Math.sign(p.x - n.x); n.fy = n.fx ? 0 : Math.sign(p.y - n.y); talk(n.id); return true; }
        }
        if (CH.interact && CH.interact(p, fx, fy)) return true;
        if (Z.rift && (dist(fx, fy, Z.rift.cx, Z.rift.cy) < 40 || dist(p.x, p.y, Z.rift.cx, Z.rift.cy) < 40)) { riftMenu(); return true; }
        if (Z.tablet && dist(fx, fy, Z.tablet.cx, Z.tablet.cy) < 36) { readTablet(); return true; }
        for (const t of Z.tre) if (!t.found && (dist(fx, fy, t.x, t.y) < 30 || dist(p.x, p.y, t.x, t.y) < 26)) { dig(t); return true; }
        for (const c of Z.chests) if (!c.open && dist(fx, fy, c.cx, c.cy) < 30) { openChest(c); return true; }
        return false;
    }
    function act(p) { if (!interact(p) && p.atk <= 0) attack(p); }     // OK with the default buttons
    function ahead(p, code) { for (let d = 12; d <= 28; d += 8) if (codeAt(frontX(p, d), frontY(p, d) + 4) === code) return true; return false; }
    function openTiles(code, to, k) {
        for (let i = 0; i < Z.tiles.length; i++) if (Z.tiles[i] === code) Z.tiles[i] = to;
        for (const s of Z.statics) if (s.k === k && s.on) { s.on = false; burst(s.dx + 16, s.dy + 40, 6, '#c9c4b8', 1.5); }
    }

    function damage(p) {
        let d = p.st.atk + ((S.lvl - 1) >> 1);
        return d;
    }
    // turn the hero toward the nearest foe within range (true if there was one)
    function aimAt(p, range) {
        let best = null, bd = range * range;
        for (const f of FOES) {
            if (!f.on || f.alpha < 0.5 || (f.d.boss && !f.active && dist(f.x, f.y, p.x, p.y) > 120)) continue;
            const d2 = (f.x - p.x) * (f.x - p.x) + (f.y - p.y) * (f.y - p.y);
            if (d2 < bd) { bd = d2; best = f; }
        }
        if (!best) return false;
        const dx = best.x - p.x, dy = best.y - 4 - p.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        p.ax = dx / d; p.ay = dy / d;
        if (Math.abs(p.ax) > Math.abs(p.ay) * 0.6) { p.fx = p.ax < 0 ? -1 : 1; p.fy = 0; p.lfx = p.fx; } else { p.fx = 0; p.fy = p.ay < 0 ? -1 : 1; }
        return true;
    }
    function attack(p) {
        if (flying(p)) { if (toastT < 60) toast(T.ui.flyNoAttack); return; }
        const st = p.st;
        aimAt(p, st.kind === 'sword' ? 64 : 290);
        p.atk = st.cd; p.swing = 12; p.lean = 8; p.anim = st.kind;
        if (st.kind === 'sword') {
            SND.fx('swing');
            const hx = frontX(p, 16), hy = frontY(p, 16);
            let hits = 0;
            for (const f of FOES) {
                if (!f.on || f.alpha < 0.5) continue;
                if (dist(hx, hy, f.x, f.y - 6) < f.r + 18) { hitFoe(f, p, damage(p), p.ax, p.ay); hits++; }
            }
            for (const s of Z.pots) if (s.on && dist(hx, hy, s.cx, s.cy) < 26) breakPot(s);
            for (let i = 0; i < 5; i++) part(frontX(p, 18), frontY(p, 18) - 6, 6, p.ax * 1.5 + (Math.random() - 0.5), p.ay * 1 + (Math.random() - 0.5), 0.5, 10, '#ffffff', 2, 0);
        } else if (st.kind === 'staff') {                    // magic: a glowing bolt that bends toward foes
            SND.fx('magic');
            const s = shot(p.x + p.ax * 14, p.y - 14 + p.ay * 6, p.ax * 4.6, p.ay * 4.6, damage(p), 7, 13, p.i + 1);
            if (s) s.col = st.col;
            ringFx(p.x + p.ax * 14, p.y - 6 + p.ay * 6, 16, st.col);
        } else if (st.kind === 'bow') {
            SND.fx('bow');
            shot(p.x + p.ax * 12, p.y - 10 + p.ay * 6, p.ax * 5.6, p.ay * 5.6, damage(p), 5, 10, 1);
        } else {
            SND.fx('gun'); p.flash = 6; shake = 5; flashT = 2;
            shot(p.x + p.ax * 18, p.y - 11 + p.ay * 8, p.ax * 10, p.ay * 10, damage(p), 4, 11, 1);
            smoke(p.x + p.ax * 22, p.y - 10 + p.ay * 8, 6);
            sparks(p.x + p.ax * 20, p.y - 10 + p.ay * 8, p.ax, p.ay, 6, '#ffd76a');
            p.kx -= p.ax * 2.5; p.ky -= p.ay * 2.5;
        }
        // brambles: any hero who owns a sword can hack through them
        if (ahead(p, C_b)) {
            if (S.sword) {
                S.cut = true; openTiles(C_b, 46, 'bramble'); SND.fx('cut');
                for (let i = 0; i < 24; i++) part(frontX(p, 30), frontY(p, 30), 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, Math.random() * 3, 40, '#4b5f2a', 3);
                save();
            } else if (toastT < 60) toast(T.ui.brambles);
        }
    }

    /* ---------- abilities: heal, power attack (a ground slam), distant attack (a piercing bolt) ---------- */
    const CD_KEY = { heal: 'cdHeal', power: 'cdPower', distant: 'cdDistant' };
    // quiet: say nothing when it cannot be used (OK twice then just attacks again)
    function ability(p, a, quiet) {
        if (!p.on || p.down || mode !== 'play') return false;
        if (a !== 'heal' && flying(p)) { if (!quiet && toastT < 60) toast(T.ui.flyNoAttack); return false; }
        const ab = ABIL[a], k = CD_KEY[a];
        let why = p[k] > 0 ? T.ui[a] + ': ' + T.ui.cooling + ' ' + Math.ceil(p[k] / 60) + ' s' : p.sta < ab.cost ? T.ui.noStamina : a === 'heal' && p.hp >= maxHp(p) ? T.ui.healFullHp : '';
        if (why) { if (!quiet) { SND.fx('move'); if (toastT < 100) toast(why); } return false; }
        p.sta -= ab.cost; p[k] = ab.cd; p.aura = 30;
        if (a === 'heal') {
            const n = Math.max(1, Math.ceil(maxHp(p) * 0.2));
            p.hp = Math.min(maxHp(p), p.hp + n); p.auraCol = '#7ef0a0';
            SND.fx('heal'); SND.fx('level');
            floater(p.x, p.y - 34, n, '#7ef0a0', true);
            ringFx(p.x, p.y - 4, 50, '#7ef0a0'); ringFx(p.x, p.y - 4, 30, '#d8ffe0');
            for (let i = 0; i < 26; i++) part(p.x + (Math.random() - 0.5) * 26, p.y - Math.random() * 10, 2, (Math.random() - 0.5) * 0.4, 0, 1 + Math.random() * 1.6, 50 + Math.random() * 20, i & 1 ? '#7ef0a0' : '#ffffff', 3, -0.01);
        } else if (a === 'power') {
            p.auraCol = '#ffb040'; p.swing = 16; p.lean = 10; p.anim = 'sword'; p.atk = Math.max(p.atk, 16);
            SND.fx('slam'); SND.fx('crit');
            shake = 16; freeze = 6; flashT = 4;
            ringFx(p.x, p.y, 84, '#ffb040'); ringFx(p.x, p.y, 60, '#fff2c0'); ringFx(p.x, p.y, 34, '#ff6a3a');
            for (let i = 0; i < 36; i++) { const an = i / 36 * 6.2832, s = 2.5 + Math.random() * 2.5; part(p.x, p.y - 2, 2, Math.cos(an) * s, Math.sin(an) * s * 0.55, 1.5 + Math.random() * 2.5, 30 + Math.random() * 15, i % 3 ? Z.dust : '#ffb040', 3 + (i & 1)); }
            const dmg = damage(p) * 3;
            for (const f of FOES) {
                if (!f.on || f.alpha < 0.5) continue;
                const d = dist(p.x, p.y, f.x, f.y);
                if (d < 84 + f.r) { const ux = (f.x - p.x) / (d || 1), uy = (f.y - p.y) / (d || 1); hitFoe(f, p, dmg, ux, uy); if (f.on && !f.d.boss) { f.kx = ux * 12; f.ky = uy * 12; } }
            }
            for (const s of Z.pots) if (s.on && dist(p.x, p.y, s.cx, s.cy) < 80) breakPot(s);
        } else {
            aimAt(p, 320); p.auraCol = '#7ad8ff'; p.swing = 10; p.lean = 6;
            SND.fx('shoot'); SND.fx('bow'); flashT = 2; shake = Math.max(shake, 5);
            const s = shot(p.x + p.ax * 14, p.y - 10 + p.ay * 6, p.ax * 7, p.ay * 7, Math.round(damage(p) * 2.5), 11, 12, p.i + 1);
            if (s) s.pierce = 99;
            ringFx(p.x + p.ax * 14, p.y - 6 + p.ay * 6, 26, '#7ad8ff');
            sparks(p.x + p.ax * 16, p.y - 10 + p.ay * 6, p.ax, p.ay, 10, '#bff0ff');
            p.kx -= p.ax * 3; p.ky -= p.ay * 3;
        }
        return true;
    }
    function gainStamina(n) { for (const p of P) if (p.on && !p.down) p.sta = Math.min(STA_MAX, p.sta + n); }
    function potion(p) {                                   // the mapped potion button: a small one, else a big one
        if (S.potions > 0) drink(false); else if (S.big > 0) drink(true); else toast(T.ui.noPotion);
    }
    function toggleMount() {
        if (!S.mounts.length) return toast(T.ui.noMount);
        let m = S.mounts.indexOf(S.lastMount) >= 0 ? S.lastMount : S.mounts[0];
        if (m === 'wolf' && CH.noWolf) m = S.mounts.indexOf('horse') >= 0 ? 'horse' : 'wolf';
        setMount(S.mount ? '' : m);
    }
    // a gesture (tap, double, hold, run, cancel) from hero p: do what the player mapped to it
    function gesture(p, g) {
        if (p.down) return;
        const f = fnOf(g);
        if (!f && g === 'double') return gesture(p, 'tap');               // nothing on "OK twice": it is just another OK
        if ((g === 'tap' || g === 'double') && interact(p)) return;        // OK always talks, opens and reads first
        if (f === 'attack') { if (p.atk <= 0) attack(p); }
        else if (f === 'menu') quickMenu(p);
        else if (f === 'potion') potion(p);
        else if (f === 'mount') toggleMount();
        else if (!ability(p, f, g === 'double') && g === 'double') gesture(p, 'tap');
    }

    function hitFoe(f, p, dmg, dx, dy) {
        if (!f.active && f.d.boss) activate(f);
        if (f.immune) { SND.fx('pot'); sparks(f.x - dx * 6, f.y - 14, dx, dy, 5, '#9ad8ff'); ringFx(f.x, f.y - 14, f.r + 10, '#9ad8ff'); return; }
        if (f.weak) dmg *= 2;
        const crit = Math.random() * 100 < p.st.crit;
        if (crit) dmg *= 2;
        if (f.t === 'thornback' && f.st === 3) dmg *= 2;
        f.hp -= dmg; f.hurt = 8;
        freeze = crit ? 5 : 2;
        SND.fx(crit ? 'crit' : 'hit');
        if (crit) { flashT = 3; shake = Math.max(shake, 6); ringFx(f.x, f.y - 10, 30, '#ffd23f'); }
        floater(f.x, f.y - 26, dmg, crit ? '#ffb020' : '#ffe66a', crit);
        sparks(f.x - dx * 6, f.y - 10, dx, dy, crit ? 10 : 6, crit ? '#ffd23f' : '#ffffff');
        if (!f.d.boss) { f.kx = dx * (p.st.kind === 'gun' ? 6 : 4); f.ky = dy * (p.st.kind === 'gun' ? 6 : 4); }
        if (f.hp <= 0) killFoe(f);
    }
    function killFoe(f) {
        f.on = false; S.kills++; S.seen[f.t] = (S.seen[f.t] || 0) + 1; SND.fx('die');
        gainStamina(f.d.boss || f.elite ? STA_BIG : STA_KILL);
        if (CH.onKill) CH.onKill(f);
        const col = f.t === 'shade' || f.t === 'wisp' ? '#c9cfdc' : f.t === 'bones' || f.t === 'knight' ? '#e8e4d8' : f.t === 'bat' ? '#5a4a6a' : '#a08a6a';
        burst(f.x, f.y - 8, f.d.boss || f.elite ? 40 : 14, col, f.d.boss || f.elite ? 3 : 2);
        for (let i = 0; i < (f.d.boss ? 10 : 3); i++) part(f.x + (Math.random() - 0.5) * 10, f.y - 10, 10, 0, 0, 0.6 + Math.random() * 0.6, 50, '#e8ecff', 2, -0.01);
        ringFx(f.x, f.y - 6, f.d.boss ? 90 : 26, f.d.boss ? '#ffe9a8' : '#ffffff');
        coins(f.x, f.y, loot(f.d.coin * (f.elite ? 5 : 1)));
        if (f.elite) { const g2 = f.elite; f.elite = ''; poolReady(g2); dropGear(f.x, f.y, rollItem(zoneTier(), 1)); }
        if (!f.d.boss && Math.random() < 0.15) drop(f.x, f.y, 1, 3);
        if (f.d.boss || Math.random() < LOOT.foeDrop * TUNE.gearDrops * (Z.def.rift ? 2 : 1)) dropGear(f.x, f.y, rollItem(zoneTier(), f.d.boss ? 1 : 0));
        if (Math.random() < (LOOT.oreDrop[f.t] || 0)) drop(f.x, f.y, 3, f.d.boss ? 3 : 1);
        addXp(f.d.xp);
        countKill(f.t);
        if (f.d.boss) bossDown(f);
    }
    function addXp(n) {
        S.xp += n;
        while (S.lvl < 20 && S.xp >= need(S.lvl)) {
            S.lvl++;
            for (const p of P) if (p.on) { p.hp = maxHp(p); p.down = false; burst(p.x, p.y - 10, 20, '#ffe66a', 2); ringFx(p.x, p.y - 8, 60, '#ffe66a'); }
            SND.fx('level'); toast(txt(T.ui.lvup, { n: S.lvl }));
        }
    }
    // ground: a blow or something on the ground (a flying hero is out of reach)
    function hurt(p, dmg, sx, sy, ground) {
        if (!p.on || p.inv > 0 || p.down || mode !== 'play') return;
        if (ground && flying(p)) return;
        dmg = Math.max(1, Math.round(dmg * TUNE.enemyDifficulty * (1 - Math.min(0.6, p.st.def * 0.06))));
        p.hp = Math.max(0, p.hp - dmg); p.inv = 60; SND.fx('hurt'); SND.fx(p.i ? 'ouch2' : 'ouch'); shake = 6; freeze = 3;
        const d = dist(p.x, p.y, sx, sy) || 1; p.kx = (p.x - sx) / d * 5; p.ky = (p.y - sy) / d * 5;
        floater(p.x, p.y - 30, dmg, '#ff5a5a');
        sparks(p.x, p.y - 12, (p.x - sx) / d, (p.y - sy) / d, 6, '#ff7a7a');
        if (p.hp <= 0) {
            p.down = true; p.downT = 360; burst(p.x, p.y - 8, 12, '#c9cfdc', 1.5);
            const other = P[1 - p.i];
            if (other.on && !other.down) toast(txt(T.ui.down, { name: heroName(p.i) }));
            else allDown();
        }
    }
    function allDown() {
        if (Z.def.rift) return endRift(true);
        toast(T.ui.allDown);
        startFade(() => {
            S.coins = Math.floor(S.coins * 0.9);
            loadZone(Z.id);
            const sp = Z.def.spawn; placePlayers(sp[0], sp[1]);
            for (const p of P) { p.hp = maxHp(p); p.down = false; }
            save();
        });
    }

    // picking something up (the hero or the cat; the cat's finds go to hero 1)
    function collect(p, d) {
        d.on = false;
        if (d.k === 0) { S.coins += d.v + (p.st.gold && Math.random() * 100 < p.st.gold ? 1 : 0); SND.fx('coin'); part(d.x, d.y, 6, 0, 0, 1.2, 16, '#ffe66a', 2, 0); }
        else if (d.k === 1) { p.hp = Math.min(maxHp(p), p.hp + d.v); SND.fx('heal'); }
        else if (d.k === 2) { const it = d.it; d.it = null; addToBag(it); burst(d.x, d.y - 6, 14, LOOT.colors[it.r], 1.5); }
        else if (d.k === 3) { S.iron += d.v; SND.fx('pick'); toast(txt(T.ui.gotIron, { n: d.v })); }
        else {                                              // a quest item
            const q = S.pq[d.qg], df = poolDef(q);
            SND.fx('pick'); burst(d.x, d.y - 6, 12, '#7ef0a0', 1.5); ringFx(d.x, d.y, 30, '#7ef0a0');
            if (q && q.st === 1) { q.c++; toast(pt(df).title + ': ' + Math.min(q.c, df.n) + ' / ' + df.n); if (q.c >= df.n) poolReady(d.qg); else save(); }
        }
    }
    function petHit(f, dmg, dx, dy) {
        if (!f.active && f.d.boss) activate(f);
        if (f.immune) return;
        f.hp -= dmg; f.hurt = 6;
        floater(f.x, f.y - 24, dmg, '#ffc8a0');
        sparks(f.x - dx * 6, f.y - 10, dx, dy, 4, '#ffe0c0');
        if (!f.d.boss && !f.elite) { f.kx = dx * 2.5; f.ky = dy * 2.5; }
        if (f.hp <= 0) killFoe(f);
    }
    function updPet() {
        const pet = PET, p = P[0];
        pet.on = !!S.pet && p.on;
        if (!pet.on) return;
        pet.max = Math.max(4, Math.floor(maxHp(p) / 2)); if (pet.hp > pet.max) pet.hp = pet.max;
        if (pet.inv > 0) pet.inv--; if (pet.cd > 0) pet.cd--; if (pet.hurt > 0) pet.hurt--; if (pet.lunge > 0) pet.lunge--;
        if (pet.down > 0) { if (--pet.down === 0) pet.hp = pet.max; pet.sy = pet.y; return; }
        if (++pet.regen >= 180) { pet.regen = 0; if (pet.hp < pet.max) pet.hp++; }
        // a foe near the hero comes first, then loot near the cat, else stay at the hero's heel
        const brave = pet.hp > pet.max * 0.3;
        let foe = null, loot = null, best = 110 * 110;
        if (brave) for (const f of FOES) if (f.on && f.alpha > 0.5 && (f.active || !f.d.boss)) { const d2 = (f.x - p.x) * (f.x - p.x) + (f.y - p.y) * (f.y - p.y); if (d2 < best) { best = d2; foe = f; } }
        if (!foe) { best = 150 * 150; for (const d of DROPS) if (d.on && d.k !== 4 && d.z <= 2 && dist(d.x, d.y, p.x, p.y) < 220) { const d2 = (d.x - pet.x) * (d.x - pet.x) + (d.y - pet.y) * (d.y - pet.y); if (d2 < best) { best = d2; loot = d; } } }
        let tre = null; pet.sniff = false;
        if (!foe && !loot) for (const t of Z.tre) if (!t.found && dist(t.x, t.y, p.x, p.y) < 190) { tre = t; pet.sniff = true; if (!t.sniffed) { t.sniffed = true; toast(T.ui.catSniff); } break; }
        // its own spot near the hero, changed now and then; when hurt it keeps behind the hero
        if (--pet.gt <= 0) { pet.gt = 150 + ((Math.random() * 200) | 0); const a = Math.random() * 6.2832, r = 26 + Math.random() * 34; pet.gx = Math.cos(a) * r; pet.gy = Math.sin(a) * r * 0.6 + 6; }
        if (!brave) { pet.gx = -(p.lfx || 1) * 24; pet.gy = 8; }
        const hd = dist(pet.x, pet.y, p.x, p.y);
        if (p.moving) pet.idle = 0; else pet.idle++;
        pet.sit = !foe && !loot && !tre && pet.idle > 240 && hd < 80;
        const tx = foe ? foe.x : loot ? loot.x : tre ? tre.x + 10 : p.x + pet.gx, ty = foe ? foe.y : loot ? loot.y : tre ? tre.y : p.y + pet.gy;
        const dx = tx - pet.x, dy = ty - pet.y, dd = Math.sqrt(dx * dx + dy * dy) || 1;
        const stop = foe ? foe.r + 8 : loot ? 2 : 6;
        const lazy = !foe && !loot && !tre && hd < 70 && !p.moving;           // close enough and nothing to do: no need to move
        if (hd > 420) { pet.x = p.x; pet.y = p.y + 6; }                        // left far behind: catch up at once
        else if (dd > stop && !lazy && !pet.sit) {
            const hurry = foe || loot ? 1 : Math.min(1, 0.45 + hd / 140);
            const s = Math.min(playerSpeed(p) * TUNE.petSpeed * hurry, dd - stop + 0.5), ox = pet.x, oy = pet.y;
            moveEnt(pet, dx / dd * s, dy / dd * s, 4, 3);
            if (pet.x === ox && pet.y === oy) { pet.x += dx / dd * s; pet.y += dy / dd * s; }   // cats squeeze through anything
            pet.walk += 0.4; pet.fx = dx < 0 ? -1 : 1;
        } else pet.walk = 0;
        if (foe && dd <= stop + 6 && pet.cd <= 0) { pet.cd = 34; pet.lunge = 8; SND.fx('swing'); petHit(foe, Math.max(1, damage(p) >> 1), dx / dd, dy / dd); }
        if (loot && dd < 12) collect(p, loot);
        pet.sy = pet.y;
    }
    function petHurt(dmg, sx, sy) {
        const pet = PET; if (!pet.on || pet.down || pet.inv > 0) return;
        dmg = Math.max(1, Math.round(dmg * TUNE.enemyDifficulty * (1 - Math.min(0.6, (P[0].st.def / 2) * 0.06))));
        pet.hp -= dmg; pet.inv = 50; pet.hurt = 8; floater(pet.x, pet.y - 20, dmg, '#ff9a9a');
        const d = dist(pet.x, pet.y, sx, sy) || 1; moveEnt(pet, (pet.x - sx) / d * 8, (pet.y - sy) / d * 8, 4, 3);
        if (pet.hp <= 0) { pet.hp = 0; pet.down = 600; burst(pet.x, pet.y - 6, 10, '#c9cfdc', 1.5); toast(T.ui.petDown); }
    }

    function updPlayer(p) {
        if (p.inv > 0) p.inv--;
        if (p.atk > 0) p.atk--;
        if (p.swing > 0) p.swing--;
        if (p.lean > 0) p.lean--;
        if (p.flash > 0) p.flash--;
        if (p.aura > 0) p.aura--;
        if (p.cdHeal > 0) p.cdHeal--; if (p.cdPower > 0) p.cdPower--; if (p.cdDistant > 0) p.cdDistant--;
        if (p.down) {
            const other = P[1 - p.i];
            if (--p.downT <= 0 && other.on && !other.down) { p.down = false; p.hp = Math.ceil(maxHp(p) / 2); p.inv = 120; p.x = other.x; p.y = other.y; toast(txt(T.ui.revived, { name: heroName(p.i) })); }
            return;
        }
        const dx = (held(p, 'right') ? 1 : 0) - (held(p, 'left') ? 1 : 0);
        const dy = (held(p, 'down') ? 1 : 0) - (held(p, 'up') ? 1 : 0);
        p.moving = !!(dx || dy);
        // long press OK (without moving): the quick menu with the default buttons
        if (held(p, 'jump') && !p.moving && !okBack) { if (++p.hold === 50) { p.hold = 0; gesture(p, 'hold'); if (mode !== 'play') return; } } else p.hold = 0;
        if (p.moving) {
            const n = dx && dy ? 0.7071 : 1;
            p.ax = dx * n; p.ay = dy * n; p.fx = dx; p.fy = dy;
            const spd = playerSpeed(p) * (p.atk > p.st.cd - 8 ? 0.5 : 1);
            if (p.ax) p.lfx = p.ax < 0 ? -1 : 1;
            const ox = p.x, oy = p.y;
            flyMove = flying(p); moveEnt(p, dx * n * spd, dy * n * spd, 7, 4); flyMove = false;
            p.walk += 0.22 * (1 + p.st.spd);
            if (riding(p) && (tick + p.i * 7) % (flying(p) ? 26 : 14) === 0) SND.fx(flying(p) ? 'wings' : 'hoof');
            if ((tick + p.i * 5) % (riding(p) ? 4 : 9) === 0) part(p.x - p.ax * 6, p.y, 1, -p.ax * 0.3, -p.ay * 0.2, 0.6, 22, Z.dust, riding(p) ? 4 : 3, 0.02);
            if (P[1].on) {                                 // co-op: stay on the same screen
                const o = P[1 - p.i];
                if (o.on && !o.down && (Math.abs(p.x - o.x) > W - 70 || Math.abs(p.y - o.y) > H - 70)) { p.x = ox; p.y = oy; }
            }
        } else p.walk = 0;
        if (p.kx || p.ky) { flyMove = flying(p); moveEnt(p, p.kx, p.ky, 7, 4); flyMove = false; p.kx *= 0.75; p.ky *= 0.75; if (Math.abs(p.kx) + Math.abs(p.ky) < 0.1) p.kx = p.ky = 0; }
        p.sy = p.y;
        // riding the wolf: it bites what you run into
        if (riding(p) && MOUNTS[S.mount].bite && --p.bite <= 0) {
            for (const f of FOES) if (f.on && f.alpha > 0.5 && dist(f.x, f.y, p.x, p.y) < f.r + 16) { p.bite = 30; SND.fx('hit'); petHit(f, Math.max(1, damage(p) >> 1), p.ax, p.ay); break; }
        }
        // pickups
        for (const s of Z.picks) {
            if (!s.on) continue;
            if (dist(p.x, p.y, s.cx, s.cy) < 18) {
                s.on = false; S.picked[s.key] = true; SND.fx('pick'); burst(s.cx, s.cy - 6, 10, s.k === 'ore' ? '#e6eef7' : '#3fa9ff', 1.5); ringFx(s.cx, s.cy - 4, 28, s.k === 'ore' ? '#e6eef7' : '#3fa9ff');
                if (s.k === 'ore') { S.ore++; toast(txt(T.ui.gotOre, { n: Math.min(3, S.ore) })); }
                else { S.caps++; toast(txt(T.ui.gotCap, { n: Math.min(3, S.caps) })); }
                save();
            }
        }
        for (const d of DROPS) {
            if (!d.on || d.z > 2) continue;
            const dd = dist(p.x, p.y, d.x, d.y);
            if (dd < 40 && (d.k === 0 || d.k === 3)) { d.x += (p.x - d.x) * 0.15; d.y += (p.y - d.y) * 0.15; }   // coins fly to you
            if (dd < 14) collect(p, d);
        }
        for (const e of Z.def.exits) {
            if (p.x >= e.x * TS && p.x < (e.x + e.w) * TS && p.y >= e.y * TS && p.y < (e.y + e.h) * TS) { if (Z.def.rift) endRift(false); else changeZone(e.to, e.tx, e.ty); return; }
        }
        if (Z.stairs && riftClear && dist(p.x, p.y, Z.stairs.cx, Z.stairs.cy) < 30) { SND.fx('door'); if (S.rift.floor >= RIFT_MAX) endRift(false, true); else riftFloor(S.rift.floor + 1); }
    }

    /* ------------------------------------------------------------------ foes */

    function activate(f) { if (f.active) return; f.active = true; f.tm = 0; SND.fx('roar'); shake = 10; showBoss(f); music(); ringFx(f.x, f.y - 10, 80, '#ff6a4a'); }

    function updFoe(f) {
        if (f.hurt > 0) f.hurt--;
        if (f.kx || f.ky) { moveEnt(f, f.kx, f.ky, f.r * 0.6, f.r * 0.4); f.kx *= 0.8; f.ky *= 0.8; if (Math.abs(f.kx) + Math.abs(f.ky) < 0.1) f.kx = f.ky = 0; }
        const p = nearest(f.x, f.y);
        const d = p ? dist(p.x, p.y, f.x, f.y) : 1e9;
        const rw = f.r * 0.6, rh = f.r * 0.4;
        f.walk += 0.15;
        if (!f.active) {
            if (f.t === 'shade') { if (p && p.y < 8.6 * TS && Z.id === 'isle') activate(f); }
            else if (p && d < 6 * TS) activate(f);
            f.sy = f.y; return;
        }
        const tx = p ? (p.x - f.x) / (d || 1) : 0, ty = p ? (p.y - f.y) / (d || 1) : 0;
        if (f.d.upd) f.d.upd(f, p, d, tx, ty, rw, rh);
        else if (f.d.ai) aiFoe(f, p, d, tx, ty, rw, rh);
        else switch (f.t) {
            case 'wisp': case 'crawler': case 'mite':
                if (p && d < 170) chase(f, tx, ty, f.d.spd, rw, rh);
                else wander(f, rw, rh);
                break;
            case 'bat':                                       // flutters toward you in zigzags
                if (p && d < 190) { const w = Math.sin(f.walk * 1.7) * 1.2; chase(f, tx - ty * w, ty + tx * w, f.d.spd, rw, rh); }
                else wander(f, rw, rh);
                f.walk += 0.15;
                break;
            case 'bones':                                     // walks at you; from afar it throws bones
                if (f.cd > 0) f.cd--;
                if (p && d < 180) {
                    if (d > 70 && f.cd <= 0) { shot(f.x, f.y - 16, tx * 2.4, ty * 2.4, 2, 5, 3, 0); f.cd = 150; SND.fx('shoot'); }
                    chase(f, tx, ty, f.d.spd, rw, rh);
                } else wander(f, rw, rh);
                break;
            case 'wolf':
                if (f.cd > 0) f.cd--;
                if (f.st === 0) {
                    if (p && d < 170) chase(f, tx, ty, f.d.spd, rw, rh); else wander(f, rw, rh);
                    if (p && d < 90 && f.cd <= 0) { f.st = 1; f.tm = 24; f.vx = tx; f.vy = ty; }
                } else if (f.st === 1) { if (--f.tm <= 0) { f.st = 2; f.tm = 20; } }
                else { moveEnt(f, f.vx * 3.4, f.vy * 3.4, rw, rh); if (--f.tm <= 0) { f.st = 0; f.cd = 80; } }
                break;
            case 'knight':                                    // the Crypt Knight: marches, then lunges with its blade
                if (f.cd > 0) f.cd--;
                if (f.st === 0) {
                    leash(f, tx, ty, f.d.spd, rw, rh);
                    if (p && d < 120 && f.cd <= 0) { f.st = 1; f.tm = 34; f.vx = tx; f.vy = ty; }
                } else if (f.st === 1) { if (--f.tm <= 0) { f.st = 2; f.tm = 22; SND.fx('swing'); } }
                else { moveEnt(f, f.vx * 3.8, f.vy * 3.8, rw, rh); if (tick & 1) part(f.x, f.y, 2, -f.vx, -f.vy * 0.5, 0.5, 14, '#c8c8d0', 2); if (--f.tm <= 0) { f.st = 0; f.cd = 70; } }
                if (f.hp < f.max / 2 && !f.sum) { f.sum = 1; spawnFoe('bones', f.x - 50, f.y, true); spawnFoe('bones', f.x + 50, f.y, true); }
                break;
            case 'thornback':
                if (f.st === 0) {
                    leash(f, tx, ty, 0.6, rw, rh);
                    if (++f.tm > 90 && p) { f.st = 1; f.tm = 45; f.vx = tx; f.vy = ty; }
                } else if (f.st === 1) { if (--f.tm <= 0) { f.st = 2; f.tm = 75; } if (f.tm & 4) part(f.x, f.y, 0, -f.vx, -f.vy * 0.5, 1, 15, '#a08a6a', 2); }
                else if (f.st === 2) {
                    if (tick & 1) part(f.x, f.y, 1, -f.vx * 1.5, -f.vy, 0.8, 18, Z.dust, 3);
                    if (moveEnt(f, f.vx * 4.2, f.vy * 4.2, rw, rh)) { f.st = 3; f.tm = 110; shake = 12; SND.fx('slam'); burst(f.x + f.vx * 20, f.y, 14, '#5b3b24', 2.5); ringFx(f.x + f.vx * 20, f.y, 50, '#c8a878'); }
                    else if (--f.tm <= 0 || dist(f.x, f.y, f.hx, f.hy) > 9 * TS) { f.st = 0; f.tm = 0; }
                } else if (--f.tm <= 0) { f.st = 0; f.tm = 0; }
                break;
            case 'warden':
                if (f.st === 0) {
                    leash(f, tx, ty, f.d.spd, rw, rh);
                    if (++f.tm > 150 && p) { f.st = 1; f.tm = 40; }
                } else if (--f.tm <= 0) {
                    const a = Math.atan2(ty, tx);
                    for (let k = -2; k <= 2; k++) shot(f.x, f.y - 14, Math.cos(a + k * 0.28) * 2.2, Math.sin(a + k * 0.28) * 2.2, 2, 6, 0, 0);
                    SND.fx('shoot'); f.st = 0; f.tm = 0;
                }
                if (f.hp < f.max / 2 && ++f.sum > 1) {
                    if (f.sum === 2 || f.sum % 720 === 0) { if (minions() < 2) { spawnFoe('crawler', f.x - 40, f.y + 10, true); spawnFoe('crawler', f.x + 40, f.y + 10, true); } }
                }
                break;
            case 'sentinel':
                if (f.st === 0) {
                    leash(f, tx, ty, f.d.spd, rw, rh);
                    if (++f.tm > 110 && p) {
                        if (d > 150) { shot(f.x, f.y - 30, tx * 2.6, ty * 2.6, 3, 8, 1, 0); SND.fx('shoot'); f.tm = 40; }
                        else { f.st = 1; f.tm = 64; }
                    }
                } else if (f.st === 1) { if (--f.tm <= 0) { f.st = 2; f.ring = 10; f.mask = 0; SND.fx('slam'); shake = 14; } }
                else {
                    f.ring += 3;
                    if (tick & 1) part(f.x + Math.cos(tick) * f.ring, f.y + Math.sin(tick) * f.ring * 0.4, 1, 0, 0, 1.5, 16, '#c8b89a', 3);
                    for (const q of P) if (q.on && !q.down && !(f.mask & (1 << q.i)) && Math.abs(dist(q.x, q.y, f.x, f.y) - f.ring) < 12) { f.mask |= 1 << q.i; hurt(q, f.d.dmg, f.x, f.y, true); }
                    if (f.ring > 92) { f.st = 0; f.tm = 0; }
                }
                break;
            case 'shade':
                if (f.st === 0) {
                    f.alpha = Math.min(1, f.alpha + 0.05);
                    if (++f.tm % 110 === 0) {
                        const n = tier === 'low' ? 8 : tier === 'mid' ? 10 : 12, off = f.wt * 0.4;
                        for (let k = 0; k < n; k++) { const a = off + k * 6.2832 / n; shot(f.x, f.y - 16, Math.cos(a) * 1.5, Math.sin(a) * 1.5, 2, 6, 2, 0); }
                        SND.fx('shoot'); f.wt++; ringFx(f.x, f.y - 16, 40, '#8a8fff');
                        if (f.wt % 3 === 0) { f.st = 1; f.tm = 0; }
                    }
                    const sumAt = f.sum === 0 ? 0.66 : f.sum === 1 ? 0.33 : -1;
                    if (f.hp < f.max * sumAt) { f.sum++; for (let k = 0; k < 3; k++) spawnFoe('wisp', f.x + (k - 1) * 40, f.y + 30, true); }
                } else if (f.st === 1) {
                    f.alpha -= 0.04;
                    if (f.alpha <= 0) { f.pt = (f.pt + 1 + ((Math.random() * 3) | 0)) % SHADE_PTS.length; f.x = SHADE_PTS[f.pt][0] * TS; f.y = SHADE_PTS[f.pt][1] * TS; f.st = 0; f.tm = 0; f.alpha = 0; }
                }
                break;
        }
        if (f.alpha > 0.5 && f.d.dmg > 0) {
            for (const q of P) if (q.on && !q.down && dist(q.x, q.y, f.x, f.y) < f.r + 8) hurt(q, f.d.dmg + f.bonus, f.x, f.y, true);
            if (PET.on && !PET.down && dist(PET.x, PET.y, f.x, f.y) < f.r + 5) petHurt(f.d.dmg + f.bonus, f.x, f.y);
        }
        f.sy = f.y;
    }
    // shared brains for armed people and beasts
    function aiFoe(f, p, d, tx, ty, rw, rh) {
        if (f.cd > 0) f.cd--;
        const dmg = f.d.dmg + f.bonus;
        switch (f.d.ai) {
            case 'archer': case 'gunner': case 'hexer': {
                if (!p || d > 300) { wander(f, rw, rh); f.st = 0; break; }
                const near = f.d.ai === 'hexer' ? 120 : 110, far = f.d.ai === 'gunner' ? 200 : 180;
                if (f.st === 0) {                                     // keep a good distance, side-step now and then
                    if (d < near) chase(f, -tx, -ty, f.d.spd, rw, rh);
                    else if (d > far) chase(f, tx, ty, f.d.spd, rw, rh);
                    else { if (--f.wt <= 0) { f.wt = 70 + ((Math.random() * 60) | 0); f.side = 0; f.sdx = Math.random() < 0.5 ? 1 : -1; } moveEnt(f, -ty * f.sdx * f.d.spd * 0.6, tx * f.sdx * f.d.spd * 0.6, rw, rh); }
                    if (f.d.ai === 'hexer' && d < 60 && f.cd < 60) blink(f, p);
                    else if (f.cd <= 0 && d < 260) { f.st = 1; f.tm = f.d.ai === 'gunner' ? 54 : f.d.ai === 'hexer' ? 40 : 34; f.vx = tx; f.vy = ty; }
                } else if (f.st === 1) {                              // aiming: the warning (bow drawn, red line, glowing staff)
                    if (f.d.ai !== 'gunner' || f.tm > 16) { f.vx = tx; f.vy = ty; }
                    if (--f.tm <= 0) {
                        const sx = f.x + f.vx * 10, sy = f.y - 14 + f.vy * 6;
                        if (f.d.ai === 'archer') { shot(sx, sy, f.vx * 3.6, f.vy * 3.6, dmg, 5, 4, 0); SND.fx('bow'); f.cd = 110; }
                        else if (f.d.ai === 'gunner') { shot(sx, sy, f.vx * 6.5, f.vy * 6.5, dmg + 1, 4, 5, 0); SND.fx('gun'); smoke(sx, sy, 5); sparks(sx, sy, f.vx, f.vy, 5, '#ffd76a'); f.kx = -f.vx * 2; f.ky = -f.vy * 2; f.cd = 170; }
                        else {
                            if (++f.sum % 3 === 0) { for (let k = 0; k < 6; k++) { const a = k * 1.0472 + f.walk; shot(f.x, f.y - 16, Math.cos(a) * 1.4, Math.sin(a) * 1.4, dmg, 6, 6, 0); } ringFx(f.x, f.y - 10, 40, '#c77dff'); }
                            else shot(sx, sy, f.vx * 1.8, f.vy * 1.8, dmg, 6, 6, 0);
                            SND.fx('zap'); f.cd = 150;
                        }
                        f.st = 0;
                    }
                }
                break;
            }
            case 'brute':                                             // walks up, winds up (shakes), then lunges
                if (f.st === 0) {
                    if (p && d < 220) chase(f, tx, ty, f.d.spd, rw, rh); else wander(f, rw, rh);
                    if (p && d < 75 && f.cd <= 0) { f.st = 1; f.tm = 26; f.vx = tx; f.vy = ty; }
                } else if (f.st === 1) { if (--f.tm <= 0) { f.st = 2; f.tm = 16; SND.fx('swing'); } }
                else { moveEnt(f, f.vx * 3.3, f.vy * 3.3, rw, rh); if (--f.tm <= 0) { f.st = 0; f.cd = 75; } }
                break;
            case 'boar':                                              // paws the ground, then charges in a straight line
                if (f.st === 0) {
                    if (p && d < 170 && f.cd <= 0) { f.st = 1; f.tm = 34; f.vx = tx; f.vy = ty; } else if (p && d < 220) chase(f, tx, ty, f.d.spd, rw, rh); else wander(f, rw, rh);
                } else if (f.st === 1) { if (f.tm & 4) part(f.x - f.vx * 8, f.y, 0, -f.vx, -f.vy * 0.5, 1, 14, Z.dust, 2); if (--f.tm <= 0) { f.st = 2; f.tm = 44; SND.fx('roar'); } }
                else if (f.st === 2) { if (tick & 1) part(f.x, f.y, 1, -f.vx, -f.vy, 0.6, 14, Z.dust, 3); if (moveEnt(f, f.vx * 3.9, f.vy * 3.9, rw, rh)) { f.st = 3; f.tm = 60; SND.fx('slam'); ringFx(f.x, f.y, 26, '#ffd23f'); } else if (--f.tm <= 0) { f.st = 0; f.cd = 70; } }
                else if (--f.tm <= 0) { f.st = 0; f.cd = 50; }                   // dazed after hitting something: strike now
                break;
            case 'crab':                                              // scuttles sideways toward you
                if (p && d < 180) { const w = Math.sin(f.walk * 0.7); chase(f, tx * 0.5 + (tx > 0 ? 0.6 : -0.6) * (1 + w * 0.3), ty * 0.8, f.d.spd, rw, rh); }
                else wander(f, rw, rh);
                break;
            case 'imp':                                               // darts around you, leaves a trail of sparks
                if (p && d < 220) { const w = Math.sin(f.walk * 1.9) * 1.4; chase(f, tx - ty * w, ty + tx * w, f.d.spd, rw, rh); } else wander(f, rw, rh);
                if (tick & 1) part(f.x, f.y - 12, 6, 0, 0, 0.4, 16, tick & 2 ? '#ffb040' : '#ff5a3c', 2, -0.01);
                f.walk += 0.2;
                break;
        }
    }
    // a hexer vanishes in a puff and appears farther away
    function blink(f, p) {
        burst(f.x, f.y - 10, 12, '#c77dff', 2); SND.fx('blink');
        for (let k = 0; k < 8; k++) {
            const a = Math.random() * 6.2832, nx = p.x + Math.cos(a) * 150, ny = p.y + Math.sin(a) * 110;
            if (!feetSolid(nx, ny) && dist(nx, ny, f.hx, f.hy) < 9 * TS) { f.x = nx; f.y = ny; break; }
        }
        burst(f.x, f.y - 10, 12, '#c77dff', 2); f.cd = 90;
    }
    function minions() { let n = 0; for (const f of FOES) if (f.on && f.minion) n++; return n; }
    function wander(f, rw, rh) {
        if (--f.tm <= 0) { f.tm = 60 + Math.random() * 90; const a = Math.random() * 6.283; f.vx = Math.cos(a) * 0.5; f.vy = Math.sin(a) * 0.5; if (dist(f.x, f.y, f.hx, f.hy) > 80) { const d = dist(f.x, f.y, f.hx, f.hy); f.vx = (f.hx - f.x) / d * 0.6; f.vy = (f.hy - f.y) / d * 0.6; } }
        moveEnt(f, f.vx, f.vy, rw, rh);
    }
    function leash(f, tx, ty, spd, rw, rh) {
        if (dist(f.x, f.y, f.hx, f.hy) > 8 * TS) { const d = dist(f.x, f.y, f.hx, f.hy); moveEnt(f, (f.hx - f.x) / d * spd * 2, (f.hy - f.y) / d * spd * 2, rw, rh); }
        else chase(f, tx, ty, spd, rw, rh);
    }
    // walk toward the target; when blocked, sidestep for a moment to get around trees, rocks and the bell
    function chase(f, tx, ty, spd, rw, rh) {
        if (f.side > 0) { f.side--; if (!moveEnt(f, f.sdx * spd, f.sdy * spd, rw, rh)) return; f.sdx = -f.sdx; f.sdy = -f.sdy; return; }
        const ox = f.x, oy = f.y;
        moveEnt(f, tx * spd, ty * spd, rw, rh);
        if (Math.abs(f.x - ox) + Math.abs(f.y - oy) < spd * 0.3) { const s = (f.hx + f.hy) & 32 ? 1 : -1; f.side = 40; f.sdx = -ty * s || s; f.sdy = tx * s; }
    }

    function updShots() {
        for (const s of SHOTS) {
            if (!s.on) continue;
            s.x += s.vx; s.y += s.vy;
            const c = codeAt(s.x, s.y);
            if (s.owner && c === C_p) {                       // arrows and bullets break pots
                for (const pt of Z.pots) if (pt.on && Math.floor(s.x / TS) === pt.tx && Math.floor(s.y / TS) === pt.ty) breakPot(pt);
                s.on = false; continue;
            }
            if (s.k === 7) { if (--s.life <= 0) s.on = false; continue; }          // bombs fly over everything; the warning below does the damage
            if (s.k === 6 && s.life > s.m - 110) {                                  // magic orbs turn toward the nearest hero for a while
                const q = nearest(s.x, s.y);
                if (q) { const dd = dist(q.x, q.y - 10, s.x, s.y) || 1; s.vx += ((q.x - s.x) / dd * 1.7 - s.vx) * 0.045; s.vy += ((q.y - 10 - s.y) / dd * 1.7 - s.vy) * 0.045; }
            }
            if (s.k === 13) {                                                       // staff magic bends a little toward the nearest foe
                let best = null, bd = 90 * 90;
                for (const o of FOES) if (o.on && o.alpha > 0.5 && o !== s.hit) { const d2 = (o.x - s.x) * (o.x - s.x) + (o.y - 10 - s.y) * (o.y - 10 - s.y); if (d2 < bd) { bd = d2; best = o; } }
                if (best) { const dd = Math.sqrt(bd) || 1, sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy); s.vx += ((best.x - s.x) / dd * sp - s.vx) * 0.12; s.vy += ((best.y - 10 - s.y) / dd * sp - s.vy) * 0.12; }
            }
            if (--s.life <= 0 || (c !== C_tilde && c !== C_w && solidAt(s.x, s.y))) { s.on = false; if (s.k === 12) { burst(s.x, s.y, 16, '#7ad8ff', 2.2); ringFx(s.x, s.y + 8, 30, '#7ad8ff'); } else if (s.k === 13 || s.k === 6 || s.k === 8) burst(s.x, s.y, 8, s.k === 6 ? '#c77dff' : s.k === 8 ? '#ff8a3a' : s.col || '#7fd8ff', 1.6); else burst(s.x, s.y, 3, s.k === 2 ? '#8a8fb8' : s.k === 11 ? '#ffd76a' : '#6a5a40', 1); continue; }
            if (s.k === 11 && (tick & 1)) part(s.x, s.y, 10, 0, 0, 0, 10, '#ffe9a8', 2, 0);
            else if (s.k === 13 && (tick & 1)) part(s.x, s.y, 10, -s.vx * 0.1, -s.vy * 0.1, 0.1, 14, s.col || '#7fd8ff', 3, 0);
            else if ((s.k === 6 || s.k === 8) && (tick & 3) === 0) part(s.x, s.y, 10, 0, 0, 0.2, 16, s.k === 6 ? '#c77dff' : '#ffb040', 3, 0);
            else if (s.k === 12) { part(s.x + (Math.random() - 0.5) * 8, s.y + (Math.random() - 0.5) * 8, 10, -s.vx * 0.1, -s.vy * 0.1, 0.2, 18, tick & 1 ? '#7ad8ff' : '#ffffff', 3, 0); }
            if (s.owner) {
                for (const f of FOES) {
                    if (!f.on || f.alpha < 0.5 || f === s.hit) continue;
                    if (dist(f.x, f.y - 10, s.x, s.y) < f.r + s.r) {
                        const sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
                        hitFoe(f, P[s.owner - 1] || P[0], s.dmg, s.vx / sp, s.vy / sp);
                        if (s.pierce-- > 0) { s.hit = f; } else { s.on = false; }
                        break;
                    }
                }
            } else {
                for (const q of P) if (q.on && !q.down && dist(q.x, q.y - 8, s.x, s.y) < s.r + 7) { hurt(q, s.dmg, s.x - s.vx * 4, s.y - s.vy * 4); s.on = false; break; }
                if (s.on && PET.on && !PET.down && dist(PET.x, PET.y - 6, s.x, s.y) < s.r + 5) { petHurt(s.dmg, s.x - s.vx * 4, s.y - s.vy * 4); s.on = false; }
            }
        }
    }
    function updParts() {
        for (const p of PARTS) {
            if (!p.on) continue;
            p.x += p.vx; p.y += p.vy; p.z += p.vz; p.vz -= p.g;
            if (p.z < 0) { p.z = 0; p.vz *= -0.4; p.vx *= 0.7; p.vy *= 0.7; }
            if (--p.life <= 0) p.on = false;
        }
        for (const f of FLOATS) if (f.on && --f.t <= 0) f.on = false;
        for (const r of RINGS) if (r.on) { r.r += (r.max - r.r) * 0.18 + 0.5; if (r.r >= r.max - 1) r.on = false; }
        for (const d of DROPS) {
            if (!d.on) continue;
            d.z += d.vz; d.vz -= 0.2;
            if (d.z <= 0) { d.z = 0; d.vz = d.vz < -1.5 ? -d.vz * 0.4 : 0; d.vx *= 0.8; d.vy *= 0.8; }
            if (d.vx || d.vy) { if (!solidAt(d.x + d.vx, d.y)) d.x += d.vx; if (!solidAt(d.x, d.y + d.vy)) d.y += d.vy; }
            d.sy = d.y;
            if (--d.t <= 0) { d.on = false; d.it = null; }
        }
    }

    /* ------------------------------------------------------------------ atmosphere */

    const ATMO = []; for (let i = 0; i < 40; i++) ATMO.push({ x: 0, y: 0, vx: 0, vy: 0, ph: 0, s: 1 });
    const ATMO_DEF = { pollen: [26, '#fff6c8'], leaves: [16, '#9ad05a'], embers: [34, '#ffb040'], ash: [30, '#a8a4b0'], motes: [26, '#9aa8ff'], spray: [22, '#e8f6ff'], fireflies: [22, '#d8ff7a'] };
    let atmoKind = '', atmoN = 0, atmoCol = '#fff', atmoCX = 0, atmoCY = 0;
    function atmoStart(k) {
        const d = ATMO_DEF[k]; atmoKind = d ? k : ''; atmoN = d ? (tier === 'low' ? d[0] >> 1 : d[0]) : 0; atmoCol = d ? d[1] : '#fff';
        for (let i = 0; i < atmoN; i++) atmoReset(ATMO[i], true);
        atmoCX = camX; atmoCY = camY;
    }
    function atmoReset(a, any) {
        a.x = Math.random() * W; a.y = any ? Math.random() * H : (atmoKind === 'embers' ? H + 4 : atmoKind === 'ash' || atmoKind === 'leaves' ? -4 : Math.random() * H);
        a.ph = Math.random() * 6.28; a.s = 0.6 + Math.random() * 0.8;
        a.vx = atmoKind === 'leaves' ? 0.3 + Math.random() * 0.4 : atmoKind === 'spray' ? 0.5 + Math.random() * 0.5 : (Math.random() - 0.5) * 0.3;
        a.vy = atmoKind === 'embers' ? -0.25 - Math.random() * 0.45 : atmoKind === 'ash' ? 0.2 + Math.random() * 0.3 : atmoKind === 'leaves' ? 0.3 + Math.random() * 0.3 : (Math.random() - 0.5) * 0.15;
    }
    function updAtmo() {
        const mx = (camX - atmoCX) * 0.6, my = (camY - atmoCY) * 0.6; atmoCX = camX; atmoCY = camY;
        for (let i = 0; i < atmoN; i++) {
            const a = ATMO[i];
            a.ph += 0.03; a.x += a.vx + Math.sin(a.ph) * 0.25 - mx; a.y += a.vy - my;
            if (a.x < -8) a.x += W + 16; else if (a.x > W + 8) a.x -= W + 16;
            if (a.y < -8 || a.y > H + 8) atmoReset(a, false);
        }
    }
    function drawAtmo() {
        for (let i = 0; i < atmoN; i++) {
            const a = ATMO[i], tw = 0.5 + Math.sin(a.ph * 3) * 0.5;
            ctx.globalAlpha = atmoKind === 'fireflies' ? tw : atmoKind === 'motes' ? 0.3 + tw * 0.4 : 0.6;
            ctx.fillStyle = atmoCol;
            if (atmoKind === 'leaves') { ctx.fillRect(a.x, a.y, 3 * a.s + Math.sin(a.ph) * 1.5, 2); }
            else if (atmoKind === 'embers' || atmoKind === 'fireflies') { ctx.fillRect(a.x, a.y, 2, 2); if (tier !== 'low') { ctx.globalAlpha *= 0.4; ctx.drawImage(glowSprite(atmoCol), a.x - 4, a.y - 4, 10, 10); } }
            else ctx.fillRect(a.x, a.y, 2 * a.s, 2 * a.s);
        }
        ctx.globalAlpha = 1;
    }

    /* ------------------------------------------------------------------ cut-scenes */

    // steps: { cam: [tx, ty], t } moves the camera; { say: pages }; { title: 'text', t }; { move: [npc, tx, ty] };
    //        { fx: 'flash' | 'shake' }; { sound }; { fn }; { t } waits. OK skips a wait.
    const SC = { steps: null, i: 0, t: 0, done: null, card: '', cardT: 0, cardM: 1, bars: 0 };
    function scene(steps, done) { SC.steps = steps; SC.i = -1; SC.done = done || null; closeDlg(); mode = 'scene'; setHud(false); nextStep(); }
    function nextStep() {
        if (!SC.steps) return;
        SC.i++;
        if (SC.i >= SC.steps.length) { const d = SC.done; SC.steps = null; SC.done = null; SC.cardT = 0; mode = 'play'; setHud(true); lockUntil = tick + 8; if (d) d(); return; }
        const st = SC.steps[SC.i]; SC.t = st.t || 0;
        if (st.fn) st.fn();
        if (st.title) { SC.card = st.title; SC.cardT = SC.cardM = st.t || 150; }
        if (st.fx === 'flash') flashT = 10; else if (st.fx === 'shake') shake = 24;
        if (st.sound) SND.fx(st.sound);
        if (st.move) for (const n of Z.npcs) if (n.id === st.move[0]) { n.tx = st.move[1] * TS; n.ty = st.move[2] * TS; n.going = true; }
        if (st.say) { say(st.say, null, () => { if (!SC.steps) return; mode = 'scene'; setHud(false); nextStep(); }); return; }
        if (!SC.t) nextStep();
    }
    function updScene() {
        const st = SC.steps && SC.steps[SC.i];
        if (st && st.cam) { const tx = Math.max(0, Math.min(Z.cols * TS - W, st.cam[0] * TS - W / 2)), ty = Math.max(0, Math.min(Z.rows * TS - H, st.cam[1] * TS - H / 2)); camX += (tx - camX) * 0.05; camY += (ty - camY) * 0.05; }
        for (const n of Z.npcs) if (n.going) {
            const dx = n.tx - n.x, dy = n.ty - n.y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < 1.5) { n.going = false; n.moving = false; n.hx = n.x; n.hy = n.y; n.dir = 0; continue; }
            n.x += dx / d * 0.9; n.y += dy / d * 0.9; n.moving = true; n.dir = Math.abs(dy) > Math.abs(dx) ? (dy < 0 ? 1 : 0) : 2; n.flip = dx < 0; n.walk += 0.12; n.sy = n.y;
        }
        if (SC.cardT > 0) SC.cardT--;
        if (SC.t > 0 && --SC.t === 0) nextStep();
    }
    function drawScene() {
        SC.bars += ((SC.steps ? 1 : 0) - SC.bars) * 0.1;
        if (SC.bars > 0.02) { const h = 26 * SC.bars; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); }
        if (SC.cardT > 0) {
            const k = Math.min(1, SC.cardT / 30, (SC.cardM - SC.cardT) / 30);
            ctx.globalAlpha = k; ctx.textAlign = 'center'; ctx.font = 'bold 26px serif';
            ctx.fillStyle = '#000'; ctx.fillText(SC.card, W / 2 + 2, H / 2 + 2); ctx.fillStyle = '#ffe9a8'; ctx.fillText(SC.card, W / 2, H / 2);
            ctx.globalAlpha = 1;
        }
    }

    /* ------------------------------------------------------------------ update */

    function update() {
        tick++;
        if (toastT > 0 && --toastT === 0) $('toast').className = '';
        if (bannerT > 0 && --bannerT === 0) $('banner').className = '';
        if (shake > 0) shake--;
        if (flashT > 0) flashT--;
        fogOff += 0.25;
        // OK held half a second in a menu or a conversation: Return (if there is nothing to return from, the release is a normal OK)
        if (okDown >= 0 && tick - okDown === 30 && SET.back === 'hold' && (mode === 'dialog' || mode === 'overlay')) okBack = goBack();
        if (freeze > 0) { freeze--; updParts(); return; }     // a short hit-pause makes blows land
        updAtmo();
        if (mode === 'fade') updFade();
        else if (mode === 'scene') { updScene(); for (const n of Z.npcs) n.walk += 0.1; updHaz(); }
        else if (mode === 'play') {
            S.time += 1 / 60;
            for (const p of P) if (p.on) updPlayer(p);
            if (mode === 'play') updPet();
            if (mode === 'play') {
                for (const f of FOES) if (f.on) updFoe(f);
                updShots();
                updHaz();
                if (CH.update) CH.update();
            }
            for (const n of Z.npcs) { if (n.roam) roamNpc(n); n.sy = CH.npcY ? CH.npcY(n) : n.y; n.walk += 0.1; }
            if (Z.def.rift && !riftClear && (tick & 15) === 0) {
                let left = 0; for (const f of FOES) if (f.on) left++;
                if (!left) { riftClear = true; SND.fx('level'); toast(S.rift.floor >= RIFT_MAX ? T.ui.riftLast : T.ui.riftCleared); ringFx(Z.stairs.cx, Z.stairs.cy, 70, '#c77dff'); }
            }
            hud();
        } else if (mode === 'overlay' && OV.kind === 'menu') { camX += 0.15; }
        updParts();
        if ((mode !== 'overlay' || OV.kind !== 'menu') && !(mode === 'scene' && SC.steps && SC.steps[SC.i] && SC.steps[SC.i].cam)) follow(false);
    }

    function follow(snap) {
        let x = 0, y = 0, n = 0;
        for (const p of P) if (p.on && !p.down) { x += p.x; y += p.y; n++; }
        if (!n) { x = P[0].x; y = P[0].y; n = 1; }
        const tx = Math.max(0, Math.min(Z.cols * TS - W, x / n - W / 2)), ty = Math.max(0, Math.min(Z.rows * TS - H, y / n - H / 2 - 10));
        if (snap) { camX = tx; camY = ty; } else { camX += (tx - camX) * 0.12; camY += (ty - camY) * 0.12; }
    }
    function snapCamera() { follow(true); }

    /* ------------------------------------------------------------------ draw */

    let vignette = null, darkC = null, dctx = null;

    function draw() {
        ctx.fillStyle = '#0b0d12'; ctx.fillRect(0, 0, W, H);
        if (fadeHold) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ffd76a'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(T.ui.loading + ' ' + '...'.slice(0, 1 + ((tick >> 4) % 3)), W / 2, H / 2); return; }
        if (!Z.ground) return;
        const maxX = Z.cols * TS - W, maxY = Z.rows * TS - H;
        if (camX > maxX) camX = 0;
        let cx = Math.round(camX), cy = Math.round(camY);
        if (shake > 0) { cx += ((tick * 7) % 5) - 2; cy += ((tick * 13) % 5) - 2; }
        const sx = Math.max(0, Math.min(maxX, cx)), sy = Math.max(0, Math.min(maxY, cy));
        ctx.drawImage(Z.ground, sx, sy, W, H, sx - cx, sy - cy, W, H);
        // rings on the ground
        for (const r of RINGS) {
            if (!r.on) continue;
            ctx.globalAlpha = Math.max(0, 1 - r.r / r.max); ctx.strokeStyle = r.col; ctx.lineWidth = r.w;
            ctx.beginPath(); ctx.ellipse(r.x - cx, r.y - cy, r.r, r.r * 0.45, 0, 0, 6.2832); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        drawHaz(cx, cy);
        if (CH.drawUnder) CH.drawUnder(ctx, cx, cy, tick);
        dlN = 0;
        const r0 = Math.max(0, Math.floor(cy / TS) - 1), r1 = Math.min(Z.rows - 1, Math.floor((cy + H) / TS) + 5);
        for (let r = r0; r <= r1; r++) {
            const row = Z.rs[r];
            for (let i = 0; i < row.length; i++) { const s = row[i]; if (s.on && s.dx + s.dw > cx && s.dx < cx + W) DL[dlN++] = s; }
        }
        for (const n of Z.npcs) if (npcVisible(n.id)) DL[dlN++] = n;
        for (const p of P) if (p.on) DL[dlN++] = p;
        for (const f of FOES) if (f.on) DL[dlN++] = f;
        for (const d of DROPS) if (d.on) DL[dlN++] = d;
        if (PET.on) DL[dlN++] = PET;
        for (let i = 1; i < dlN; i++) { const v = DL[i], k = v.sy; let j = i - 1; while (j >= 0 && DL[j].sy > k) { DL[j + 1] = DL[j]; j--; } DL[j + 1] = v; }
        const mi = ART.misc();
        for (let i = 0; i < dlN; i++) {
            const o = DL[i];
            if (o.kind === 1) {
                if (o.k === 'lantern') ctx.drawImage(lanternLit() ? mi.lanternOn : mi.lanternOff, o.dx - cx, o.dy - cy, o.dw, o.dh);
                else if (o.draw) o.draw(ctx, o.dx - cx, o.dy - cy, tick, o);
                else if (o.k === 'rift') drawRiftPortal(o.cx - cx, o.cy - cy);
                else if (o.k === 'stairs') drawStairs(o.cx - cx, o.cy - cy);
                else if (o.k === 'tablet') { if (o.img) ctx.drawImage(o.img, o.cx - cx - 16, o.cy - cy - 30, 32, 32); else drawTablet(o.cx - cx, o.cy - cy); }
                else {
                    if (o.k === 'cap') ctx.drawImage(mi.blueGlow, o.dx - 22 - cx, o.dy - 22 - cy, 64, 64);
                    ctx.drawImage(o.img, o.dx - cx, o.dy - cy, o.dw, o.dh);
                    if (o.k === 'ore' && (tick + o.dx) % 90 < 8) { ctx.fillStyle = '#ffffff'; ctx.fillRect(o.dx + 14 - cx, o.dy + 4 - cy, 3, 3); }
                    else if (o.k === 'torch') drawFlame(o.dx + 16 - cx, o.dy + 46 - cy);
                    else if (o.k === 'chest' && !o.open && (tick + o.dx) % 120 < 10) { ctx.fillStyle = '#fff6c8'; ctx.fillRect(o.dx + 6 + ((tick >> 1) % 18) - cx, o.dy + 6 - cy, 2, 2); }
                }
            } else if (o.kind === 2) drawNpc(o, cx, cy);
            else if (o.kind === 3) drawPlayer(o, cx, cy);
            else if (o.kind === 4) drawFoe(o, cx, cy);
            else if (o.kind === 5) drawDrop(o, cx, cy);
            else if (o.kind === 7) drawPet(o, cx, cy);
        }
        drawTreasures(cx, cy);
        drawShots(cx, cy);
        for (const p of PARTS) { if (!p.on) continue; ctx.globalAlpha = Math.min(1, p.life / p.max * 2); ctx.fillStyle = p.col; ctx.fillRect(p.x - cx, p.y - p.z - cy, p.sz, p.sz); }
        ctx.globalAlpha = 1;
        if (Z.lantern && lanternLit()) { const g = 300 + Math.sin(tick * 0.05) * 10; ctx.globalAlpha = 0.6; ctx.drawImage(mi.glow, Z.lantern.cx - g / 2 - cx, Z.lantern.cy - 120 - g / 2 - cy, g, g); ctx.globalAlpha = 1; }
        if (Z.def.dark) drawDark(cx, cy, mi);
        else {
            const fog = S && CH && CH.fog ? CH.fog() : 0;
            if (fog > 0) {
                if (tier === 'low') { ctx.globalAlpha = fog * 0.5; ctx.fillStyle = '#aab0be'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
                else {
                    ctx.globalAlpha = fog;
                    const ox = -((fogOff + cx * 0.6) % 128), oy = -((fogOff * 0.4 + cy * 0.6) % 128);
                    for (let x = ox - 128; x < W; x += 128) for (let y = oy - 128; y < H; y += 128) ctx.drawImage(mi.fog, x, y, 128, 128);
                    ctx.globalAlpha = 1;
                }
            }
        }
        // floating numbers (crits are bigger)
        ctx.textAlign = 'center';
        for (const f of FLOATS) {
            if (!f.on) continue;
            const y = f.y - cy - (50 - f.t) * 0.5, sc = f.big ? (f.t > 42 ? 1.6 : 1.25) : 1;
            ctx.font = f.big ? 'bold 22px sans-serif' : 'bold 15px sans-serif';
            ctx.globalAlpha = Math.min(1, f.t / 15);
            ctx.fillStyle = '#000'; ctx.fillText(f.s, f.x - cx + 1.5, y + 1.5);
            ctx.fillStyle = f.col; ctx.fillText(f.s, f.x - cx, y - (sc - 1) * 4);
        }
        ctx.globalAlpha = 1;
        if (CH.drawOver) CH.drawOver(ctx, cx, cy, tick);
        drawAtmo();
        if ((mode === 'play' || mode === 'dialog') && !SC.steps) drawGuide(cx, cy);
        if (vignette && tier !== 'low') ctx.drawImage(vignette, 0, 0);
        if (flashT > 0) { ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
        drawScene();
        if (mode === 'fade') { ctx.fillStyle = '#000'; ctx.globalAlpha = fadeT < 20 ? fadeT / 20 : (40 - fadeT) / 20; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    }

    function drawFlame(x, y) {
        const f = Math.sin(tick * 0.3 + x) * 1.5;
        ctx.fillStyle = '#ff7a2a'; ctx.beginPath(); ctx.moveTo(x - 4, y - 12); ctx.quadraticCurveTo(x, y - 24 - f, x + 4, y - 12); ctx.fill();
        ctx.fillStyle = '#ffd76a'; ctx.beginPath(); ctx.moveTo(x - 2, y - 12); ctx.quadraticCurveTo(x, y - 19 - f, x + 2, y - 12); ctx.fill();
    }

    // dungeons are dark: light comes from torches, the heroes' lanterns and gunfire
    function drawDark(cx, cy, mi) {
        if (tier === 'low') { ctx.globalAlpha = 0.45; ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; return; }
        dctx.globalCompositeOperation = 'source-over'; dctx.globalAlpha = 1;
        dctx.fillStyle = '#05060a'; dctx.fillRect(0, 0, W, H);
        dctx.globalCompositeOperation = 'destination-out';
        const fl = Math.sin(tick * 0.2) * 6;
        for (let i = 0; i < Z.lights.length; i += 2) {
            const x = Z.lights[i] - cx, y = Z.lights[i + 1] - cy;
            if (x < -140 || x > W + 140 || y < -140 || y > H + 140) continue;
            dctx.drawImage(mi.light, x - 110 - fl / 2, y - 100 - fl / 2, 220 + fl, 200 + fl);
        }
        for (const p of P) if (p.on) { const r = p.flash > 0 ? 300 : 230; dctx.drawImage(mi.light, p.x - cx - r / 2, p.y - cy - 12 - r / 2, r, r); }
        for (const s of SHOTS) if (s.on && (s.k === 11 || s.k === 12 || s.k === 13 || s.k === 6 || s.k === 8)) dctx.drawImage(mi.light, s.x - cx - 40, s.y - cy - 40, 80, 80);
        dctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.9; ctx.drawImage(darkC, 0, 0, W, H); ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < Z.lights.length; i += 2) {
            const x = Z.lights[i] - cx, y = Z.lights[i + 1] - cy;
            if (x < -80 || x > W + 80 || y < -80 || y > H + 80) continue;
            ctx.drawImage(mi.fire, x - 40, y - 34, 80, 80);
        }
        ctx.globalCompositeOperation = 'source-over';
    }

    function drawShots(cx, cy) {
        for (const s of SHOTS) {
            if (!s.on) continue;
            const x = s.x - cx, y = s.y - cy;
            if (s.k === 10) {                                  // arrow
                const sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy), ux = s.vx / sp, uy = s.vy / sp;
                ctx.strokeStyle = '#d8c8a0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - ux * 12, y - uy * 12); ctx.lineTo(x + ux * 4, y + uy * 4); ctx.stroke();
                ctx.fillStyle = '#e8eef8'; ctx.beginPath(); ctx.moveTo(x + ux * 7, y + uy * 7); ctx.lineTo(x - uy * 3, y + ux * 3); ctx.lineTo(x + uy * 3, y - ux * 3); ctx.fill();
                ctx.fillStyle = '#c84a3a'; ctx.fillRect(x - ux * 12 - 1, y - uy * 12 - 1, 3, 3);
            } else if (s.k === 11) {                           // bullet
                ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - s.vx * 1.6, y - s.vy * 1.6); ctx.lineTo(x, y); ctx.stroke();
                ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 2, y - 2, 4, 4);
            } else if (s.k === 12) {                           // the distant attack: a bolt of blue light
                const pulse = 1 + Math.sin(tick * 0.6) * 0.15;
                ctx.globalAlpha = 0.35; ctx.fillStyle = '#7ad8ff'; ctx.beginPath(); ctx.arc(x, y, 16 * pulse, 0, 6.2832); ctx.fill();
                ctx.globalAlpha = 0.5; ctx.strokeStyle = '#bff0ff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - s.vx * 3, y - s.vy * 3); ctx.lineTo(x, y); ctx.stroke();
                ctx.globalAlpha = 1; ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.arc(x, y, 6 * pulse, 0, 6.2832); ctx.fill();
            } else if (s.k === 13 || s.k === 6 || s.k === 8) {     // magic: a glow with a white heart
                const col = s.k === 13 ? (s.col || '#7fd8ff') : s.k === 6 ? '#c77dff' : '#ff8a3a', r = s.k === 8 ? 22 : 16;
                ctx.drawImage(glowSprite(col), x - r, y - r, r * 2, r * 2);
                ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, s.k === 8 ? 4 : 3, 0, 6.2832); ctx.fill();
            } else if (s.k === 4) {                            // an enemy arrow
                const sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy), ux = s.vx / sp, uy = s.vy / sp;
                ctx.strokeStyle = '#3a2416'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - ux * 12, y - uy * 12); ctx.lineTo(x + ux * 4, y + uy * 4); ctx.stroke();
                ctx.fillStyle = '#c0c8d4'; ctx.beginPath(); ctx.moveTo(x + ux * 7, y + uy * 7); ctx.lineTo(x - uy * 3, y + ux * 3); ctx.lineTo(x + uy * 3, y - ux * 3); ctx.fill();
                ctx.fillStyle = '#d23a3a'; ctx.fillRect(x - ux * 12 - 1.5, y - uy * 12 - 1.5, 3, 3);
            } else if (s.k === 5) {                            // an enemy bullet
                ctx.strokeStyle = '#ff9a6a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - s.vx * 1.6, y - s.vy * 1.6); ctx.lineTo(x, y); ctx.stroke();
                ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 2, y - 2, 4, 4);
            } else if (s.k === 7) {                            // a bomb in the air (its shadow on the ground)
                const k = 1 - s.life / s.m, z = Math.sin(k * Math.PI) * 50;
                ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y, 5, 2, 0, 0, 6.2832); ctx.fill();
                ctx.fillStyle = '#26222e'; ctx.beginPath(); ctx.arc(x, y - z, 5, 0, 6.2832); ctx.fill();
                ctx.fillStyle = tick & 2 ? '#ffd25a' : '#ff5a3c'; ctx.fillRect(x + 2, y - z - 8, 2, 3);
            } else if (s.k === 3) {                            // thrown bone
                const a = tick * 0.4;
                ctx.save(); ctx.translate(x, y); ctx.rotate(a);
                ctx.fillStyle = '#e8e4d8'; ctx.fillRect(-6, -1.5, 12, 3); ctx.fillRect(-7, -3, 3, 6); ctx.fillRect(4, -3, 3, 6);
                ctx.restore();
            } else {
                ctx.fillStyle = s.k === 2 ? '#2b2d48' : s.k === 1 ? '#8c867a' : '#5a4a30';
                ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.2832); ctx.fill();
                ctx.fillStyle = s.k === 2 ? '#a8b0ff' : 'rgba(255,255,255,0.3)'; ctx.fillRect(x - 2, y - 2, 3, 3);
            }
        }
    }

    function drawNpc(n, cx, cy) {
        const id = baseId(n.id);
        let x = n.x - cx, y = n.sy - cy;
        const look = LOOK[n.look || id] || LOOK.villager || {};
        if (look.anim === 'dog') { drawDog(x, y, n.walk); }
        else if (look.anim === 'cat') drawCat(x, y, n.walk, 1, 0.75, false);
        else if (look.anim === 'horse') drawHorse(x, y, 0, 1, 1);
        else if (look.anim === 'wolf') drawWolfMount(x, y, 0, -1, 0.75);
        else if (look.tunic) HEROART.draw(ctx, x, y, look, look.gear || NOGEAR, n.dir === undefined ? 0 : n.dir, n.flip, n.moving ? n.walk * 2.2 : 0, 0, false, look.s || 1);
        else {
            if (look.float) y -= 6 + Math.sin(tick * 0.05) * 3;
            if (look.glow) ctx.drawImage(ART.misc().blueGlow, x - 28, y - 44, 56, 56);
            if (KN.ok && KN.NPC[n.look || id] !== undefined) { if (look.glow) ctx.globalAlpha = 0.75; KN.npc(ctx, n.look || id, x, y, look.s < 0.9 ? 0.8 : 1, n.fx < 0, tick); ctx.globalAlpha = 1; }
            else ART.human(ctx, x, y, look, n.fx, n.fy, 0, false);
            if (KN.ok) { /* the sprites carry their own staff, apron and axe */ }
            else if (id === 'maren') { ctx.fillStyle = '#6b4a2e'; ctx.fillRect(x + 9, y - 30, 2, 30); ctx.fillStyle = '#ffd76a'; ctx.fillRect(x + 7, y - 33, 6, 5); }
            if (!KN.ok && id === 'bram') { ctx.fillStyle = '#6b4a2e'; ctx.fillRect(x - 13, y - 22, 2, 16); ctx.fillStyle = '#b8bcc4'; ctx.fillRect(x - 17, y - 24, 6, 5); }
            if (!KN.ok && id === 'tobin') { ctx.fillStyle = '#4a4a52'; ctx.fillRect(x + 10, y - 26, 3, 14); ctx.fillRect(x + 7, y - 28, 9, 5); }
            if (CH.npcExtra) CH.npcExtra(id, x, y);
        }
        // markers: yellow ! for the story, green ! for a side quest, ? for a quest to hand in
        const s = (look.tunic ? 1.05 : 1) * (look.s || 1);
        const by = y - 44 * s + Math.sin(tick * 0.1 + n.bob) * 2;
        const ready = !!qReady(n.id) || (S.pq[n.id] && S.pq[n.id].st === 2) || !!deliverFor(n.id) || n.id.indexOf('q:') === 0, side = !!qOffer(n.id) || hasPoolOffer(n.id);
        if (news(n.id) || ready || side) {
            ctx.fillStyle = '#000'; ctx.fillRect(x - 5, by - 14, 11, 20);
            ctx.fillStyle = news(n.id) ? '#ffd23f' : ready ? '#7ef0a0' : '#5ad07a';
            if (ready && !news(n.id)) { ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', x, by + 4); }
            else { ctx.fillRect(x - 3, by - 12, 7, 11); ctx.fillRect(x - 3, by + 1, 7, 3); }
        } else if (TALKER[n.id] && talkable(n.id) && dist(P[0].x, P[0].y, n.x, n.y) < 70) {
            const b2 = y - 42 * s;
            ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.ellipse(x, b2, 9, 6, 0, 0, 6.2832); ctx.fill();
            ctx.fillStyle = '#334'; ctx.fillRect(x - 5, b2 - 1, 2, 2); ctx.fillRect(x - 1, b2 - 1, 2, 2); ctx.fillRect(x + 3, b2 - 1, 2, 2);
        }
    }
    function drawDog(x, y, t) {
        const wag = Math.sin(t * 3) * 4;
        ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y, 10, 3.5, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#b07a3a'; ctx.beginPath(); ctx.ellipse(x, y - 8, 10, 6, 0, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + 9, y - 14, 6, 5, 0, 0, 6.2832); ctx.fill();
        ctx.fillRect(x - 7, y - 4, 3, 5); ctx.fillRect(x + 4, y - 4, 3, 5);
        ctx.strokeStyle = '#b07a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 9, y - 10); ctx.lineTo(x - 15, y - 16 + wag * 0.3); ctx.stroke();
        ctx.fillStyle = '#6a4220'; ctx.fillRect(x + 7, y - 20, 4, 5);
        ctx.fillStyle = '#1b1820'; ctx.fillRect(x + 11, y - 15, 2, 2); ctx.fillRect(x + 14, y - 13, 2, 2);
    }
    function drawRiftPortal(x, y) {
        const open = riftOpen(), t = tick * 0.05;
        ctx.fillStyle = '#0a0612'; ctx.beginPath(); ctx.ellipse(x, y, 22, 9, 0, 0, 6.2832); ctx.fill();
        if (!open) { ctx.strokeStyle = '#2a2236'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.lineTo(x - 6, y - 2); ctx.lineTo(x + 4, y + 2); ctx.lineTo(x + 18, y); ctx.stroke(); return; }
        for (let k = 0; k < 3; k++) {
            ctx.globalAlpha = 0.5 - k * 0.12; ctx.strokeStyle = k === 1 ? '#5ab0ff' : '#c77dff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(x, y, 20 - k * 5 + Math.sin(t + k) * 2, 8 - k * 2, 0, t * (k + 1), t * (k + 1) + 4.5); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        if ((tick & 7) === 0) part(x + (Math.random() - 0.5) * 30 + camX, y + camY, 2, 0, 0, 0.6 + Math.random() * 0.4, 60, '#c77dff', 2, -0.005);
    }
    function drawStairs(x, y) {
        ctx.fillStyle = '#05040a'; ctx.fillRect(x - 18, y - 16, 36, 32);
        for (let k = 0; k < 4; k++) { ctx.fillStyle = k & 1 ? '#3a3448' : '#4a4458'; ctx.fillRect(x - 16 + k * 2, y - 14 + k * 7, 32 - k * 4, 5); }
        if (riftClear) { ctx.globalAlpha = 0.35 + Math.sin(tick * 0.12) * 0.15; ctx.fillStyle = '#c77dff'; ctx.fillRect(x - 18, y - 16, 36, 32); ctx.globalAlpha = 1; }
        else { ctx.strokeStyle = '#6a5a7a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 18, y - 16); ctx.lineTo(x + 18, y + 16); ctx.moveTo(x + 18, y - 16); ctx.lineTo(x - 18, y + 16); ctx.stroke(); }
    }
    function drawTablet(x, y) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y + 4, 12, 4, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#7c7a86'; ctx.fillRect(x - 10, y - 30, 20, 34); ctx.beginPath(); ctx.arc(x, y - 30, 10, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#c8a8ff'; for (let k = 0; k < 4; k++) ctx.fillRect(x - 6, y - 28 + k * 6, 12 - (k & 1) * 4, 2);
    }
    function drawTreasures(cx, cy) {
        for (const t of Z.tre) {
            if (t.found) continue;
            const near = dist(t.x, t.y, P[0].x, P[0].y) < 70 || (P[1].on && dist(t.x, t.y, P[1].x, P[1].y) < 70) || (PET.on && PET.sniff && dist(t.x, t.y, PET.x, PET.y) < 60);
            if (!near) continue;
            const x = t.x - cx, y = t.y - cy;
            ctx.fillStyle = '#6a5034'; ctx.beginPath(); ctx.ellipse(x, y, 11, 5, 0, 0, 6.2832); ctx.fill();
            ctx.fillStyle = '#8a6a44'; ctx.beginPath(); ctx.ellipse(x - 2, y - 2, 6, 3, 0, 0, 6.2832); ctx.fill();
            if ((tick + t.x) % 40 < 10) { ctx.fillStyle = '#ffe9a8'; ctx.fillRect(x - 6 + ((tick >> 2) % 12), y - 8, 2, 2); }
        }
    }
    function drawPet(o, cx, cy) {
        const x = o.x - cx, y = o.y - cy;
        if (o.down) { ctx.globalAlpha = 0.6; drawCat(x, y, 0, o.fx, 0.8, true); ctx.globalAlpha = 1; return; }
        if (o.inv > 0 && (o.inv & 4)) ctx.globalAlpha = 0.5;
        drawCat(x + (o.lunge ? o.fx * o.lunge * 0.6 : 0), y, o.walk, o.fx, 0.8, !!o.sit && o.idle > 600, o.hurt > 0 && (o.hurt & 2));
        ctx.globalAlpha = 1;
        if (o.sniff) { const b = Math.sin(tick * 0.2) * 2; ctx.fillStyle = '#000'; ctx.fillRect(x - 3, y - 36 + b, 7, 13); ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - 2, y - 35 + b, 5, 7); ctx.fillRect(x - 2, y - 26 + b, 5, 2); }
        if (o.hp < o.max) { ctx.fillStyle = '#000'; ctx.fillRect(x - 11, y - 24, 22, 4); ctx.fillStyle = '#7ef0a0'; ctx.fillRect(x - 10, y - 23, 20 * o.hp / o.max, 2); }
    }
    function drawCat(x, y, walk, fx, s, sleep, flash) {
        const l = Math.sin(walk * 2) * 2 * s, tail = Math.sin(tick * 0.12) * 3;
        ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y, 9 * s, 3 * s, 0, 0, 6.2832); ctx.fill();
        const body = flash ? '#fff' : '#d8893a', dark = flash ? '#fff' : '#a65f22';
        if (sleep) { ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(x, y - 4 * s, 9 * s, 5 * s, 0, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('z', x + 8, y - 12 - (tick % 60) * 0.1); return; }
        ctx.strokeStyle = dark; ctx.lineWidth = 2.5 * s; ctx.beginPath(); ctx.moveTo(x - fx * 8 * s, y - 7 * s); ctx.quadraticCurveTo(x - fx * 15 * s, y - 12 * s, x - fx * (12 * s) + tail * 0.3, y - 20 * s); ctx.stroke();
        ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(x, y - 7 * s, 9 * s, 5 * s, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = dark; ctx.fillRect(x - 6 * s, y - 4 * s + l, 2 * s, 4 * s); ctx.fillRect(x + 4 * s, y - 4 * s - l, 2 * s, 4 * s);
        ctx.fillStyle = dark; ctx.fillRect(x - 2 * s, y - 11 * s, 2 * s, 7 * s);
        ctx.fillStyle = body; ctx.beginPath(); ctx.arc(x + fx * 8 * s, y - 13 * s, 5 * s, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + fx * 4 * s, y - 16 * s); ctx.lineTo(x + fx * 5 * s, y - 21 * s); ctx.lineTo(x + fx * 8 * s, y - 17 * s); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + fx * 9 * s, y - 17 * s); ctx.lineTo(x + fx * 12 * s, y - 21 * s); ctx.lineTo(x + fx * 12 * s, y - 15 * s); ctx.fill();
        ctx.fillStyle = '#2a8a3a'; ctx.fillRect(x + fx * 9 * s, y - 14 * s, 2 * s, 2 * s);
    }
    function drawHorse(x, y, walk, fx, s) {
        if (MOUNTART.horse(ctx, x, y, walk, fx, s * 0.95, walk > 0, tick)) return;
        const l = Math.sin(walk * 1.6) * 3, b = walk ? Math.abs(Math.sin(walk * 1.6)) * 1.5 : 0;
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y + 1, 20 * s, 5 * s, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#5a3a22';
        ctx.fillRect(x - 13 * s, y - 10 * s + l, 3 * s, 11 * s); ctx.fillRect(x - 8 * s, y - 10 * s - l, 3 * s, 11 * s);
        ctx.fillRect(x + 6 * s, y - 10 * s - l, 3 * s, 11 * s); ctx.fillRect(x + 11 * s, y - 10 * s + l, 3 * s, 11 * s);
        ctx.fillStyle = '#8a5a34'; ctx.beginPath(); ctx.ellipse(x, y - 14 * s - b, 17 * s, 8 * s, 0, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + fx * 10 * s, y - 18 * s - b); ctx.lineTo(x + fx * 17 * s, y - 31 * s - b); ctx.lineTo(x + fx * 23 * s, y - 28 * s - b); ctx.lineTo(x + fx * 16 * s, y - 14 * s - b); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + fx * 22 * s, y - 27 * s - b, 6 * s, 3.5 * s, fx * 0.5, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#3a2416'; ctx.fillRect(x + fx * 13 * s - 2, y - 33 * s - b, 5 * s, 12 * s);
        ctx.strokeStyle = '#3a2416'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x - fx * 16 * s, y - 16 * s - b); ctx.quadraticCurveTo(x - fx * 22 * s, y - 12 * s, x - fx * 20 * s, y - 4 * s + Math.sin(tick * 0.1) * 2); ctx.stroke();
        ctx.fillStyle = '#1b1820'; ctx.fillRect(x + fx * 22 * s, y - 29 * s - b, 2, 2);
        ctx.fillStyle = '#7a2a2a'; ctx.fillRect(x - 6 * s, y - 22 * s - b, 12 * s, 4 * s);
    }
    function drawWolfMount(x, y, walk, fx, s) {
        const l = Math.sin(walk * 1.8) * 3, b = walk ? Math.abs(Math.sin(walk * 1.8)) * 1.5 : 0;
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y + 1, 18 * s, 5 * s, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#4e4a54';
        ctx.fillRect(x - 12 * s, y - 9 * s + l, 3 * s, 10 * s); ctx.fillRect(x - 7 * s, y - 9 * s - l, 3 * s, 10 * s);
        ctx.fillRect(x + 5 * s, y - 9 * s - l, 3 * s, 10 * s); ctx.fillRect(x + 10 * s, y - 9 * s + l, 3 * s, 10 * s);
        ctx.fillStyle = '#7a7682'; ctx.beginPath(); ctx.ellipse(x, y - 13 * s - b, 16 * s, 8 * s, 0, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + fx * 16 * s, y - 19 * s - b, 8 * s, 6.5 * s, 0, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + fx * 20 * s, y - 19 * s - b); ctx.lineTo(x + fx * 28 * s, y - 16 * s - b); ctx.lineTo(x + fx * 20 * s, y - 14 * s - b); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + fx * 12 * s, y - 23 * s - b); ctx.lineTo(x + fx * 14 * s, y - 31 * s - b); ctx.lineTo(x + fx * 18 * s, y - 24 * s - b); ctx.fill();
        ctx.strokeStyle = '#7a7682'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(x - fx * 15 * s, y - 15 * s - b); ctx.quadraticCurveTo(x - fx * 24 * s, y - 18 * s, x - fx * 26 * s, y - 10 * s + Math.sin(tick * 0.15) * 2); ctx.stroke();
        ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + fx * 19 * s, y - 21 * s - b, 2, 2);
        ctx.fillStyle = '#e8e4ec'; ctx.fillRect(x - 4 * s, y - 9 * s - b, 9 * s, 3 * s);
    }
    function drawQuestItem(x, y, icon) {
        const b = Math.sin(tick * 0.1 + x) * 2;
        ctx.globalAlpha = 0.4 + Math.sin(tick * 0.15 + x) * 0.15; ctx.fillStyle = '#7ef0a0'; ctx.beginPath(); ctx.ellipse(x, y, 12, 5, 0, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
        const yy = y - 10 + b;
        switch (icon) {
            case 'resin': ctx.fillStyle = '#e8a030'; ctx.beginPath(); ctx.arc(x, yy, 5, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#ffe0a0'; ctx.fillRect(x - 2, yy - 3, 2, 2); break;
            case 'axe': ctx.fillStyle = '#b8c0cc'; ctx.beginPath(); ctx.moveTo(x - 6, yy - 5); ctx.lineTo(x + 4, yy - 7); ctx.lineTo(x + 6, yy + 5); ctx.lineTo(x - 4, yy + 3); ctx.fill(); break;
            case 'cap': ctx.fillStyle = '#d8e4ea'; ctx.fillRect(x - 1.5, yy, 3, 6); ctx.fillStyle = '#3fa9ff'; ctx.beginPath(); ctx.arc(x, yy + 1, 6, Math.PI, 0); ctx.fill(); break;
            case 'moss': ctx.fillStyle = '#c8d8e8'; for (let k = 0; k < 5; k++) ctx.fillRect(x - 6 + k * 3, yy - (k & 1) * 3, 2, 7); break;
            case 'feather': ctx.strokeStyle = '#f2f2f8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 6, yy + 6); ctx.quadraticCurveTo(x, yy - 2, x + 6, yy - 8); ctx.stroke(); break;
            case 'shell': ctx.fillStyle = '#f2b0c8'; ctx.beginPath(); ctx.arc(x, yy + 3, 6, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#c87a98'; ctx.fillRect(x - 1, yy - 3, 2, 6); break;
            case 'lamp': ctx.fillStyle = '#4a4a52'; ctx.fillRect(x - 4, yy - 7, 8, 2); ctx.fillStyle = '#ffd76a'; ctx.fillRect(x - 3, yy - 5, 6, 8); ctx.fillStyle = '#4a4a52'; ctx.fillRect(x - 4, yy + 3, 8, 2); break;
            case 'seed': ctx.fillStyle = '#5a3a1a'; ctx.beginPath(); ctx.ellipse(x, yy, 6, 4, 0.4, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - 2, yy - 1, 4, 2); break;
            case 'ore2': ctx.fillStyle = '#4a3a3e'; ctx.beginPath(); ctx.moveTo(x - 6, yy + 4); ctx.lineTo(x - 3, yy - 5); ctx.lineTo(x + 4, yy - 6); ctx.lineTo(x + 6, yy + 4); ctx.fill(); ctx.fillStyle = '#ff7a2a'; ctx.fillRect(x - 2, yy - 2, 3, 3); break;
            case 'pearl': ctx.fillStyle = '#f2f2ff'; ctx.beginPath(); ctx.arc(x, yy, 4.5, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#c8d0ff'; ctx.fillRect(x - 2, yy - 2, 2, 2); break;
            case 'coal': ctx.fillStyle = '#1e1e22'; ctx.beginPath(); ctx.arc(x, yy, 5.5, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#ff8a3a'; ctx.fillRect(x + 1, yy - 2, 2, 2); break;
            default: ctx.fillStyle = '#9aa2ae'; ctx.fillRect(x - 5, yy - 5, 10, 9); ctx.fillStyle = '#6a707e'; ctx.fillRect(x - 5, yy - 1, 10, 2);
        }
        if ((tick + x) % 50 < 6) { ctx.fillStyle = '#fff'; ctx.fillRect(x + 4, yy - 8, 2, 2); }
    }
    function heroDir(p) { return p.fy < 0 && Math.abs(p.fy) >= Math.abs(p.fx) ? 1 : p.fx !== 0 ? 2 : 0; }
    function drawPlayer(p, cx, cy) {
        const x = p.x - cx, y = p.y - cy, look = HERO_LOOK[p.i];
        if (p.down) {
            ctx.globalAlpha = 0.65; ctx.save(); ctx.translate(x, y - 3); ctx.rotate(-1.45); HEROART.draw(ctx, 0, 0, look, p.gear, 0, false, 0, 0, false, 0.9); ctx.restore(); ctx.globalAlpha = 1;
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(NUM[Math.ceil(p.downT / 60)], x, y - 18);
            return;
        }
        if (p.aura > 0) {                                  // an ability was just used: a glow around the hero
            const k = p.aura / 30;
            ctx.globalAlpha = 0.45 * k; ctx.fillStyle = p.auraCol; ctx.beginPath(); ctx.ellipse(x, y - 16, 22 + (1 - k) * 14, 28 + (1 - k) * 14, 0, 0, 6.2832); ctx.fill();
            ctx.globalAlpha = 0.9 * k; ctx.strokeStyle = p.auraCol; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, 16 + (1 - k) * 20, 7 + (1 - k) * 9, 0, 0, 6.2832); ctx.stroke();
            ctx.globalAlpha = 1;
        }
        if (p.inv > 0 && (p.inv & 4)) ctx.globalAlpha = 0.45;
        const ride = riding(p), dir = heroDir(p), flip = dir === 2 && (p.lfx || p.fx) < 0, mfx = p.lfx || 1;
        const fly = ride && S.mount === 'dragon' && MOUNTART.hasDragon, z = fly ? 24 + Math.sin(tick * 0.06 + p.i) * 3 : 0;
        const hy = fly ? y - z - (dir === 2 ? 15 : dir === 1 ? 23 : 29) : ride ? y - (S.mount === 'horse' ? (MOUNTART.ready ? 19 : 25) : 21) : y, lean = p.lean / 8;
        // where the rider sits: on the dragon's back (behind its neck), in the horse's saddle
        const rx = fly ? x + (dir === 2 ? (flip ? 7 : -7) : 0) : ride && S.mount === 'horse' && MOUNTART.ready ? x - mfx * 3 : x;
        if (fly) { MOUNTART.dragon(ctx, x, y, z, dir, (p.lfx || 1) < 0, tick + p.i * 5, 0.6, false); if (p.moving && (tick & 7) === 0) part(x - p.ax * 40, y - z - 26, 4, -p.ax * 0.6, -p.ay * 0.4, 0, 18, '#ffffff', 2, 0); }
        else if (ride) { if (S.mount === 'horse') drawHorse(x, y, p.walk, mfx, 1.38); else drawWolfMount(x, y, p.walk, mfx, 1.28); }
        if (dir === 1) drawHeroWeapon(p, rx, hy, dir, flip);
        if (ride) {                                        // sitting: hide the legs, show one leg down the side
            ctx.save(); ctx.beginPath(); ctx.rect(rx - 40, hy - 70, 80, 61); ctx.clip();
            HEROART.draw(ctx, rx, hy, look, p.gear, dir, flip, 0, 0, p.inv > 50, 1);
            ctx.restore();
            const ft = HEROART.FEET[p.gear.feet];
            ctx.fillStyle = look.pants; ctx.fillRect(rx - 2 + (dir === 2 ? (flip ? 1 : -2) : 0), hy - 10, 4, 9);
            ctx.fillStyle = ft ? ft.main : look.shoes; ctx.fillRect(rx - 2.5 + (dir === 2 ? (flip ? 1 : -2) : 0), hy - 2, 5, 4);
        } else HEROART.draw(ctx, x, hy, look, p.gear, dir, flip, p.walk * 1.6, lean * (flip ? -0.7 : 0.7), p.inv > 50, 1);
        if (dir !== 1) drawHeroWeapon(p, rx, hy, dir, flip);
        ctx.globalAlpha = 1;
        if (P[1].on) {
            ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
            ctx.fillStyle = '#000'; ctx.fillText(p.i ? '2P' : '1P', x + 1, hy - 47);
            ctx.fillStyle = p.i ? '#ffb38a' : '#8af0e0'; ctx.fillText(p.i ? '2P' : '1P', x, hy - 48);
        }
    }
    function drawHeroWeapon(p, x, y, dir, flip) {
        const st = p.st;
        if (st.kind === 'sword' && p.swing > 0) {          // slash: a bright arc with a fading trail
            const a = Math.atan2(p.ay, p.ax), t = p.swing / 12, from = a - 1.4, to = a - 1.4 + (1 - t) * 2.8 + 0.2;
            for (let k = 0; k < 3; k++) {
                ctx.globalAlpha = t * (0.9 - k * 0.28); ctx.strokeStyle = k === 0 ? '#ffffff' : p.wr >= 2 ? LOOT.colors[p.wr] : st.col; ctx.lineWidth = 6 - k * 1.5;
                ctx.beginPath(); ctx.arc(x, y - 12, 20 + k * 3, from + k * 0.15, to); ctx.stroke();
            }
            ctx.globalAlpha = 1;
            drawHeld('sword', st.col, st.col2, x + Math.cos(to) * 6, y - 12 + Math.sin(to) * 6, to, p.wr);
            return;
        }
        const hx = x + (dir === 2 ? (flip ? -3 : 3) : dir === 1 ? -9 : 9), hy = y - 14;
        let a;
        if (p.swing > 0 || st.kind === 'gun') a = Math.atan2(p.ay, p.ax);
        else if (st.kind === 'sword') a = dir === 2 ? (flip ? -2.25 : -0.9) : dir === 1 ? -1.9 : -1.2;
        else if (st.kind === 'bow') a = dir === 2 ? (flip ? Math.PI : 0) : dir === 1 ? -1.57 : 0.25;
        else a = dir === 2 ? (flip ? -1.85 : -1.3) : -1.45;
        drawHeld(st.kind, st.col, st.col2, hx, hy, a, p.wr, p.swing, p.flash);
    }
    // a weapon in a hand at hx,hy pointing at angle a; epic and legendary weapons shine
    function drawHeld(kind, col, col2, hx, hy, a, rar, swing, flash) {
        const ca = Math.cos(a), sa = Math.sin(a);
        if (rar >= 2) {
            const gc = LOOT.colors[rar], len = kind === 'staff' ? 18 : 10;
            ctx.globalAlpha = 0.35 + Math.sin(tick * 0.12) * 0.15; ctx.drawImage(glowSprite(gc), hx + ca * len - 13, hy + sa * len - 13, 26, 26); ctx.globalAlpha = 1;
        }
        ctx.save(); ctx.translate(hx, hy); ctx.rotate(a);
        if (kind === 'sword') {
            ctx.fillStyle = col2 || '#6b4a2e'; ctx.fillRect(-4, -1.2, 5, 2.4);                 // grip
            ctx.fillStyle = '#c9a43a'; ctx.fillRect(0.5, -3.5, 2, 7);                           // guard
            ctx.fillStyle = col; ctx.fillRect(2.5, -1.4, 13, 2.8);                              // blade
            ctx.fillStyle = '#ffffff'; ctx.fillRect(2.5, -1.4, 13, 0.9);
            ctx.beginPath(); ctx.moveTo(15.5, -1.4); ctx.lineTo(18.5, 0); ctx.lineTo(15.5, 1.4); ctx.fillStyle = col; ctx.fill();
        } else if (kind === 'bow') {
            const pull = swing > 6 ? (12 - swing) * 0.7 : 0;
            ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(-3, 0, 10, -1.25, 1.25); ctx.stroke();
            ctx.strokeStyle = '#f2ead2'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-3 + Math.cos(-1.25) * 10, Math.sin(-1.25) * 10); ctx.lineTo(-3 - pull, 0); ctx.lineTo(-3 + Math.cos(1.25) * 10, Math.sin(1.25) * 10); ctx.stroke();
        } else if (kind === 'gun') {
            ctx.fillStyle = col2 || '#6b4a2e'; ctx.fillRect(-6, -1.5, 7, 3.4); ctx.fillRect(-7, 0, 3, 4);
            ctx.fillStyle = col; ctx.fillRect(0, -1.6, 15, 2.6); ctx.fillStyle = '#c9a43a'; ctx.fillRect(0, 0.8, 3, 1.6);
            if (flash > 0) { const s2 = 14 + flash * 3; ctx.drawImage(ART.misc().flash, 18 - s2 / 2, -s2 / 2, s2, s2); }
        } else if (kind === 'staff') {
            ctx.fillStyle = '#6b4a2e'; ctx.fillRect(-8, -1.2, 26, 2.4);
            ctx.fillStyle = '#c9a43a'; ctx.fillRect(15, -2.2, 3, 4.4);
            const pulse = 1 + Math.sin(tick * 0.15) * 0.15 + (swing > 0 ? swing * 0.05 : 0);
            ctx.globalAlpha = 0.85; ctx.drawImage(glowSprite(col), 21 - 9 * pulse, -9 * pulse, 18 * pulse, 18 * pulse); ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(21, 0, 2.6, 0, 6.2832); ctx.fill();
        } else if (kind === 'club') {
            ctx.fillStyle = '#5a3a20'; ctx.fillRect(-3, -1.6, 10, 3.2); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(10, 0, 5, 3.4, 0, 0, 6.2832); ctx.fill();
            ctx.fillStyle = '#c0c8d4'; ctx.fillRect(9, -4, 2, 2); ctx.fillRect(12, 2, 2, 2);
        }
        ctx.restore();
        if (rar >= 2 && (tick + hx) % 50 < 12) {           // a little star running along the weapon
            const k = ((tick + hx) % 50) / 12, len = kind === 'staff' ? 21 : 14, sx = hx + ca * len * k, sy = hy + sa * len * k;
            ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - 0.5, sy - 3, 1, 6); ctx.fillRect(sx - 3, sy - 0.5, 6, 1);
        }
    }

    function drawDrop(d, cx, cy) {
        const x = d.x - cx, y = d.y - cy - d.z - 4 + (d.z === 0 ? Math.sin(tick * 0.15 + d.x) * 1.5 : 0);
        if (d.t < 120 && (d.t & 8)) return;
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(d.x - cx - 4, d.y - cy, 8, 2);
        if (d.k === 2) {                                   // gear: an icon in its rarity colour, epic and legendary send up a beam
            const col = LOOT.colors[d.it.r], sl = ITEMS[d.it.id].slot, b = Math.sin(tick * 0.1 + d.x) * 2;
            if (d.it.r >= 2) { ctx.globalAlpha = 0.25 + Math.sin(tick * 0.15) * 0.1; ctx.fillStyle = col; ctx.fillRect(x - 3, y - 60, 6, 60); ctx.globalAlpha = 1; }
            ctx.globalAlpha = 0.5; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - 4 + b, 11, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
            ctx.fillStyle = '#1b1820'; ctx.beginPath(); ctx.arc(x, y - 4 + b, 8, 0, 6.2832); ctx.fill();
            const icon = KN.ok && KN.gearIcon(d.it.id);
            if (icon) { ctx.drawImage(icon, x - 12, y - 16 + b, 24, 24); return; }
            ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 2;
            if (sl === 'weapon') { ctx.beginPath(); ctx.moveTo(x - 5, y + 1 + b); ctx.lineTo(x + 5, y - 9 + b); ctx.stroke(); ctx.fillRect(x - 5, y - 2 + b, 4, 2); }
            else if (sl === 'head') { ctx.beginPath(); ctx.arc(x, y - 2 + b, 5, Math.PI, 0); ctx.fill(); }
            else if (sl === 'body') ctx.fillRect(x - 4, y - 9 + b, 8, 9);
            else { ctx.fillRect(x - 4, y - 9 + b, 3, 8); ctx.fillRect(x - 4, y - 2 + b, 7, 3); }
            return;
        }
        if (d.k === 4) { drawQuestItem(x, y + 4, d.icon); return; }
        if (d.k === 3) {                                   // iron ore
            ctx.fillStyle = '#6f6a62'; ctx.beginPath(); ctx.moveTo(x - 6, y + 3); ctx.lineTo(x - 4, y - 4); ctx.lineTo(x + 2, y - 6); ctx.lineTo(x + 6, y + 3); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#e6eef7'; ctx.fillRect(x - 2, y - 3, 2, 2); ctx.fillRect(x + 2, y - 1, 2, 2);
            return;
        }
        if (d.k === 0) {
            const w = Math.abs(Math.sin(tick * 0.12 + d.x));          // spinning coin
            const r = d.v > 1 ? 6 : 4;
            ctx.fillStyle = '#b8860b'; ctx.beginPath(); ctx.ellipse(x, y, r * (0.3 + w * 0.7), r, 0, 0, 6.2832); ctx.fill();
            ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(x, y, r * 0.7 * (0.3 + w * 0.7), r * 0.7, 0, 0, 6.2832); ctx.fill();
        } else { ctx.fillStyle = '#ff5a7a'; ctx.beginPath(); ctx.arc(x - 3, y - 2, 3.5, 0, 6.2832); ctx.arc(x + 3, y - 2, 3.5, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 6.5, y - 1); ctx.lineTo(x, y + 6); ctx.lineTo(x + 6.5, y - 1); ctx.fill(); }
    }

    function drawFoe(f, cx, cy) {
        if (f.elite) {
            const x0 = f.x - cx, y0 = f.y - cy;
            ctx.globalAlpha = 0.5 + Math.sin(tick * 0.1) * 0.2; ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.ellipse(x0, y0, f.r + 6, (f.r + 6) * 0.42, 0, 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1;
            ctx.save(); ctx.translate(x0, y0); ctx.scale(1.35, 1.35); ctx.translate(-x0, -y0);
            drawFoeBody(f, cx, cy);
            ctx.restore();
            const top = y0 - 50 - f.r;
            ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
            ctx.fillStyle = '#000'; ctx.fillText(f.ename, x0 + 1, top + 1); ctx.fillStyle = '#ffd23f'; ctx.fillText(f.ename, x0, top);
            ctx.fillStyle = '#000'; ctx.fillRect(x0 - 21, top + 4, 42, 5); ctx.fillStyle = '#ff5a5a'; ctx.fillRect(x0 - 20, top + 5, 40 * Math.max(0, f.hp) / f.max, 3);
            return;
        }
        drawFoeBody(f, cx, cy);
    }
    function drawFoeBody(f, cx, cy) {
        const x = f.x - cx, y = f.y - cy, w = f.hurt > 0 && (f.hurt & 2);
        if (f.d.draw) { f.d.draw(ctx, f, x, y, w); return; }
        if (f.d.look) { drawPerson(f, x, y, w); return; }
        if (f.d.ai === 'boar' || f.d.ai === 'crab' || f.d.ai === 'imp') { drawBeast(f, x, y, w); return; }
        if (KN.ok && drawFoeK(f, x, y, w)) return;
        ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y, f.r, f.r * 0.4, 0, 0, 6.2832); ctx.fill();
        switch (f.t) {
            case 'wisp': {
                const z = 12 + Math.sin(f.walk) * 3;
                ctx.fillStyle = w ? '#fff' : 'rgba(196,202,216,0.85)'; ctx.beginPath(); ctx.arc(x, y - z, 9, 0, 6.2832); ctx.fill();
                ctx.beginPath(); ctx.moveTo(x - 9, y - z); ctx.lineTo(x - 5, y - z + 13); ctx.lineTo(x, y - z + 8); ctx.lineTo(x + 5, y - z + 13); ctx.lineTo(x + 9, y - z); ctx.fill();
                ctx.fillStyle = '#2a2d3a'; ctx.fillRect(x - 5, y - z - 2, 3, 4); ctx.fillRect(x + 2, y - z - 2, 3, 4);
                break;
            }
            case 'bat': {
                const z = 18 + Math.sin(f.walk * 2) * 4, flap = Math.sin(f.walk * 6) * 7;
                ctx.fillStyle = w ? '#fff' : '#4a3a5a';
                ctx.beginPath(); ctx.moveTo(x, y - z); ctx.lineTo(x - 14, y - z - flap); ctx.lineTo(x - 8, y - z + 3); ctx.lineTo(x, y - z + 2); ctx.lineTo(x + 8, y - z + 3); ctx.lineTo(x + 14, y - z - flap); ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.arc(x, y - z, 5, 0, 6.2832); ctx.fill();
                ctx.fillStyle = '#ff5a5a'; ctx.fillRect(x - 3, y - z - 1, 2, 2); ctx.fillRect(x + 1, y - z - 1, 2, 2);
                break;
            }
            case 'bones': {
                const l = Math.sin(f.walk * 2) * 2;
                ctx.fillStyle = w ? '#fff' : '#e8e4d8';
                ctx.fillRect(x - 4, y - 7 + l * 0.3, 2, 7); ctx.fillRect(x + 2, y - 7 - l * 0.3, 2, 7);
                ctx.fillRect(x - 1, y - 20, 2, 13); for (let k = 0; k < 3; k++) ctx.fillRect(x - 5, y - 18 + k * 3, 10, 1.5);
                ctx.fillRect(x - 8, y - 18 + l, 2, 9); ctx.fillRect(x + 6, y - 18 - l, 2, 9);
                ctx.beginPath(); ctx.arc(x, y - 25, 6, 0, 6.2832); ctx.fill();
                ctx.fillStyle = '#1b1820'; ctx.fillRect(x - 3, y - 26, 2, 3); ctx.fillRect(x + 1, y - 26, 2, 3); ctx.fillRect(x - 2, y - 22, 4, 1);
                break;
            }
            case 'knight': {
                const dir = f.st >= 1 ? Math.sign(f.vx) || 1 : nearestDir(f), sh = f.st === 1 ? ((tick & 2) - 1) : 0;
                ctx.fillStyle = w ? '#fff' : '#4a4e5a';
                ctx.fillRect(x - 8 + sh, y - 12, 6, 12); ctx.fillRect(x + 2 + sh, y - 12, 6, 12);
                ctx.fillStyle = w ? '#fff' : '#6a707e'; ctx.fillRect(x - 12 + sh, y - 36, 24, 26);
                ctx.fillStyle = '#3a2a4a'; ctx.fillRect(x - 12 + sh, y - 14, 24, 4);
                ctx.fillStyle = w ? '#fff' : '#8a90a0'; ctx.beginPath(); ctx.arc(x + sh, y - 44, 10, 0, 6.2832); ctx.fill();
                ctx.fillStyle = '#7ad0ff'; ctx.fillRect(x - 5 + sh + dir * 2, y - 46, 3, 2); ctx.fillRect(x + 2 + sh + dir * 2, y - 46, 3, 2);
                ctx.fillStyle = '#5a5e6a'; ctx.fillRect(x - dir * 18 + sh - 6, y - 36, 10, 18);
                ctx.strokeStyle = f.st === 1 ? '#ffd23f' : '#c8d0dc'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(x + dir * 12 + sh, y - 26); ctx.lineTo(x + dir * (f.st === 2 ? 40 : 28) + sh, y - (f.st === 2 ? 20 : 44)); ctx.stroke();
                break;
            }
            case 'wolf': {
                const dir = f.st === 2 ? Math.sign(f.vx) || 1 : (nearestDir(f)), l = Math.sin(f.walk * 3) * 2;
                ctx.fillStyle = w ? '#fff' : f.st === 1 ? '#a8a0a0' : '#6e6a72';
                ctx.beginPath(); ctx.ellipse(x, y - 10, 14, 8, 0, 0, 6.2832); ctx.fill();
                ctx.beginPath(); ctx.ellipse(x + dir * 13, y - 15, 7, 6, 0, 0, 6.2832); ctx.fill();
                ctx.fillRect(x - 10, y - 5 + l, 3, 6); ctx.fillRect(x + 7, y - 5 - l, 3, 6);
                ctx.beginPath(); ctx.moveTo(x + dir * 10, y - 20); ctx.lineTo(x + dir * 12, y - 27); ctx.lineTo(x + dir * 15, y - 20); ctx.fill();
                ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + dir * 16 - 1, y - 17, 2, 2);
                break;
            }
            case 'crawler': {
                const s = Math.sin(f.walk * 2) * 2;
                ctx.fillStyle = w ? '#fff' : '#5e6a3a'; ctx.beginPath(); ctx.ellipse(x, y - 7, 13 + s, 8 - s * 0.5, 0, 0, 6.2832); ctx.fill();
                ctx.fillStyle = w ? '#fff' : '#7a8a4a'; ctx.fillRect(x - 6, y - 22, 2, 10); ctx.fillRect(x + 4, y - 22, 2, 10);
                ctx.fillStyle = '#e8f0a0'; ctx.beginPath(); ctx.arc(x - 5, y - 23, 3, 0, 6.2832); ctx.arc(x + 5, y - 23, 3, 0, 6.2832); ctx.fill();
                break;
            }
            case 'mite': {
                ctx.fillStyle = w ? '#fff' : '#8a8478'; ctx.beginPath(); ctx.moveTo(x - 13, y - 4); ctx.lineTo(x - 8, y - 18); ctx.lineTo(x + 8, y - 18); ctx.lineTo(x + 13, y - 4); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#5e594f'; const l = Math.sin(f.walk * 2) * 2;
                ctx.fillRect(x - 15, y - 6 + l, 4, 6); ctx.fillRect(x + 11, y - 6 - l, 4, 6);
                ctx.fillStyle = '#ff8a3a'; ctx.fillRect(x - 5, y - 14, 3, 3); ctx.fillRect(x + 2, y - 14, 3, 3);
                break;
            }
            case 'thornback': {
                const dir = f.st >= 1 && f.st <= 2 ? Math.sign(f.vx) || 1 : nearestDir(f), sh = f.st === 1 ? ((tick & 2) - 1) : 0;
                ctx.fillStyle = w ? '#fff' : f.st === 3 ? '#8a6a5a' : '#5b3b2c';
                ctx.beginPath(); ctx.ellipse(x + sh, y - 18, 26, 17, 0, 0, 6.2832); ctx.fill();
                ctx.beginPath(); ctx.ellipse(x + dir * 24 + sh, y - 16, 12, 10, 0, 0, 6.2832); ctx.fill();
                ctx.fillStyle = '#2d3b1c';
                for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(x + k * 7 - 4, y - 30); ctx.lineTo(x + k * 7, y - 44 + Math.abs(k) * 3); ctx.lineTo(x + k * 7 + 4, y - 30); ctx.fill(); }
                ctx.fillStyle = '#efe6cc'; ctx.beginPath(); ctx.moveTo(x + dir * 32, y - 14); ctx.lineTo(x + dir * 40, y - 24); ctx.lineTo(x + dir * 34, y - 10); ctx.fill();
                ctx.fillStyle = '#ff4a3a'; ctx.fillRect(x + dir * 27 - 2, y - 21, 4, 4);
                ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x - 18, y - 6, 6, 7); ctx.fillRect(x + 12, y - 6, 6, 7);
                if (f.st === 3) { ctx.fillStyle = '#ffd23f'; for (let k = 0; k < 3; k++) { const a = tick * 0.1 + k * 2.1; ctx.fillRect(x + Math.cos(a) * 16, y - 46 + Math.sin(a) * 4, 4, 4); } }
                break;
            }
            case 'warden': {
                const b = Math.sin(f.walk) * 2;
                ctx.fillStyle = w ? '#fff' : f.st === 1 ? '#5a6a3a' : '#4a4a2c';
                ctx.beginPath(); ctx.moveTo(x - 26, y); ctx.quadraticCurveTo(x - 30, y - 44 - b, x, y - 50 - b); ctx.quadraticCurveTo(x + 30, y - 44 - b, x + 26, y); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#2f3b25'; ctx.fillRect(x - 20, y - 20, 6, 14); ctx.fillRect(x + 12, y - 28, 5, 18);
                ctx.fillStyle = '#9fe8c8'; ctx.beginPath(); ctx.arc(x - 8, y - 34 - b, 4, 0, 6.2832); ctx.arc(x + 8, y - 34 - b, 4, 0, 6.2832); ctx.fill();
                if (f.st === 1) { ctx.fillStyle = 'rgba(160,140,90,0.5)'; ctx.beginPath(); ctx.arc(x, y - 30, 30 - f.tm * 0.5, 0, 6.2832); ctx.fill(); }
                break;
            }
            case 'sentinel': {
                if (f.st === 1) { ctx.globalAlpha = 0.3 + (64 - f.tm) / 100; ctx.strokeStyle = '#ff5a3c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, 92 * (1 - f.tm / 80), 37 * (1 - f.tm / 80), 0, 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1; }
                if (f.st === 2) { ctx.strokeStyle = 'rgba(255,200,120,0.9)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(x, y, f.ring, f.ring * 0.4, 0, 0, 6.2832); ctx.stroke(); }
                const lift = f.st === 1 ? (64 - f.tm) * 0.25 : 0;
                ctx.fillStyle = w ? '#fff' : '#8c867a';
                ctx.fillRect(x - 18, y - 52, 36, 40); ctx.fillRect(x - 12, y - 66, 24, 16);
                ctx.fillStyle = w ? '#fff' : '#77716a'; ctx.fillRect(x - 30, y - 52 - lift, 12, 30); ctx.fillRect(x + 18, y - 52 - lift, 12, 30);
                ctx.fillRect(x - 14, y - 12, 10, 12); ctx.fillRect(x + 4, y - 12, 10, 12);
                ctx.fillStyle = '#ffb347'; ctx.fillRect(x - 7, y - 61, 4, 4); ctx.fillRect(x + 3, y - 61, 4, 4);
                ctx.fillStyle = '#a0583a'; ctx.fillRect(x - 4, y - 40, 8, 8);
                break;
            }
            case 'shade': {
                ctx.globalAlpha = Math.max(0, f.alpha) * (w ? 1 : 0.9);
                const fl = Math.sin(tick * 0.08) * 3;
                ctx.fillStyle = w ? '#fff' : '#23243a';
                ctx.beginPath(); ctx.moveTo(x - 20, y - 6 + fl); ctx.quadraticCurveTo(x - 26, y - 50 + fl, x, y - 62 + fl); ctx.quadraticCurveTo(x + 26, y - 50 + fl, x + 20, y - 6 + fl);
                ctx.lineTo(x + 10, y - 14 + fl); ctx.lineTo(x, y - 4 + fl); ctx.lineTo(x - 10, y - 14 + fl); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#c8d0ff'; ctx.fillRect(x - 8, y - 44 + fl, 5, 3); ctx.fillRect(x + 3, y - 44 + fl, 5, 3);
                ctx.fillStyle = '#5b5bd6'; ctx.fillRect(x - 3, y - 30 + fl, 6, 8);
                ctx.globalAlpha = 1;
                break;
            }
        }
    }
    function drawFoeK(f, x, y, w) {
        const dir = (f.st >= 1 && f.st <= 2 && (f.t === 'wolf' || f.t === 'thornback' || f.t === 'knight')) ? (Math.sign(f.vx) || 1) : nearestDir(f);
        let sx = x;
        if (f.st === 1 && (f.t === 'wolf' || f.t === 'thornback' || f.t === 'knight')) sx += (tick & 2) - 1;         // trembling before a charge
        if (f.t === 'sentinel' && f.st === 1) { ctx.globalAlpha = 0.3 + (64 - f.tm) / 100; ctx.strokeStyle = '#ff5a3c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, 92 * (1 - f.tm / 80), 37 * (1 - f.tm / 80), 0, 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1; }
        if (f.t === 'sentinel' && f.st === 2) { ctx.strokeStyle = 'rgba(255,200,120,0.9)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(x, y, f.ring, f.ring * 0.4, 0, 0, 6.2832); ctx.stroke(); }
        if (f.t === 'warden' && f.st === 1) { ctx.fillStyle = 'rgba(160,140,90,0.45)'; ctx.beginPath(); ctx.arc(x, y - 30, 34 - f.tm * 0.5, 0, 6.2832); ctx.fill(); }
        if (f.t === 'shade') ctx.globalAlpha = Math.max(0, f.alpha) * 0.9;
        if (!KN.foe(ctx, f.t, sx, y, dir < 0, w, f.walk, 1)) { ctx.globalAlpha = 1; return false; }
        ctx.globalAlpha = 1;
        if (f.t === 'thornback' && f.st === 3) { ctx.fillStyle = '#ffd23f'; for (let k = 0; k < 3; k++) { const a = tick * 0.1 + k * 2.1; ctx.fillRect(x + Math.cos(a) * 18, y - 60 + Math.sin(a) * 4, 4, 4); } }
        if (f.t === 'knight' && f.st === 1) { ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + dir * 20, y - 40 + (tick & 4), 3, 3); }
        if (f.t === 'shade') { ctx.globalAlpha = 0.35 * Math.max(0, f.alpha); ctx.drawImage(ART.misc().blueGlow, x - 40, y - 80, 80, 80); ctx.globalAlpha = 1; }
        return true;
    }
    // armed people: they face you, and show what they are about to do
    function drawPerson(f, x, y, w) {
        const q = nearest(f.x, f.y), tx = q ? q.x - f.x : 1, ty = q ? q.y - f.y : 0;
        const dir = Math.abs(ty) > Math.abs(tx) * 1.3 ? (ty < 0 ? 1 : 0) : 2, flip = tx < 0, s = f.d.scale || 1;
        const aim = f.st === 1 && f.d.ai !== 'brute', a = aim ? Math.atan2(f.vy, f.vx) : f.d.weapon === 'gun' ? Math.atan2(ty, tx) : dir === 2 ? (flip ? -2.2 : -0.95) : -1.3;
        if (f.d.ai === 'gunner' && aim) {                  // the red aiming line: move out of it!
            ctx.globalAlpha = 0.25 + (f.tm < 16 ? 0.45 : 0.15) * (tick & 2 ? 1 : 0.5); ctx.strokeStyle = '#ff3a3a'; ctx.lineWidth = f.tm < 16 ? 2 : 1;
            ctx.beginPath(); ctx.moveTo(x + f.vx * 14, y - 14 + f.vy * 6); ctx.lineTo(x + f.vx * 320, y - 14 + f.vy * 320); ctx.stroke(); ctx.globalAlpha = 1;
        }
        if (f.d.ai === 'hexer') { ctx.globalAlpha = 0.25; ctx.drawImage(glowSprite('#c77dff'), x - 24, y - 50, 48, 48); ctx.globalAlpha = 1; }
        const bob = f.d.ai === 'hexer' ? Math.sin(f.walk) * 2 - 3 : 0, sx = x + (f.st === 1 && f.d.ai === 'brute' ? (tick & 2) - 1 : 0);
        const hx = sx + (dir === 2 ? (flip ? -3 : 3) * s : dir === 1 ? -9 * s : 9 * s), hy = y + bob - 14 * s;
        if (dir === 1) drawHeld(f.d.weapon, f.d.col, '#5a3a20', hx, hy, a, 0, aim ? 8 : 0, 0);
        HEROART.draw(ctx, sx, y + bob, f.d.look, f.d.gear || NOGEAR, dir, flip, f.st === 0 ? f.walk * 1.6 : 0, f.st === 2 && f.d.ai === 'brute' ? (flip ? -1 : 1) : 0, w, s);
        if (dir !== 1) drawHeld(f.d.weapon, f.d.col, '#5a3a20', hx, hy, a, 0, aim ? 8 : 0, 0);
        if (aim && f.d.ai === 'hexer') { const g = 18 + (40 - f.tm) * 0.5; ctx.globalAlpha = 0.7; ctx.drawImage(glowSprite('#c77dff'), hx + Math.cos(a) * 21 - g / 2, hy + Math.sin(a) * 21 - g / 2, g, g); ctx.globalAlpha = 1; }
        if (f.d.ai === 'brute' && f.st === 1) { ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - 1, y - 52 * s + (tick & 4), 3, 7); ctx.fillRect(x - 1, y - 43 * s, 3, 3); }
    }
    function drawBeast(f, x, y, w) {
        ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y, f.r, f.r * 0.4, 0, 0, 6.2832); ctx.fill();
        const q = nearest(f.x, f.y), fx = f.st >= 1 && f.st <= 2 ? (f.vx < 0 ? -1 : 1) : q && q.x < f.x ? -1 : 1, l = Math.sin(f.walk * 2) * 2;
        if (f.d.ai === 'boar') {
            const sx = x + (f.st === 1 ? (tick & 2) - 1 : 0), body = w ? '#fff' : '#6a4a32', dark = w ? '#fff' : '#3e2a1c';
            ctx.fillStyle = dark; for (let k = -1; k <= 1; k += 2) { ctx.fillRect(sx + k * 7 - 1.5, y - 7 + l * k, 3, 7); ctx.fillRect(sx + k * 3 - 1.5, y - 7 - l * k, 3, 7); }
            ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(sx, y - 11, 13, 8, 0, 0, 6.2832); ctx.fill();
            ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(sx - fx * 2, y - 17, 9, 3, 0, 0, 6.2832); ctx.fill();          // bristly back
            ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(sx + fx * 12, y - 11, 6, 5, 0, 0, 6.2832); ctx.fill();
            ctx.fillStyle = w ? '#fff' : '#d89a8a'; ctx.fillRect(sx + fx * 16 - 2, y - 11, 4, 4);
            ctx.fillStyle = '#f2ead2'; ctx.fillRect(sx + fx * 14, y - 8, fx * 4, 2);
            ctx.fillStyle = '#1b1820'; ctx.fillRect(sx + fx * 11, y - 14, 2, 2);
            if (f.st === 3) { ctx.fillStyle = '#ffd23f'; for (let k = 0; k < 3; k++) { const a = tick * 0.12 + k * 2.1; ctx.fillRect(sx + Math.cos(a) * 12, y - 26 + Math.sin(a) * 3, 3, 3); } }
        } else if (f.d.ai === 'crab') {
            const body = w ? '#fff' : '#d8643a', dark = w ? '#fff' : '#9a3a20';
            ctx.strokeStyle = dark; ctx.lineWidth = 1.6;
            for (let k = -1; k <= 1; k += 2) for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(x + k * 6, y - 6 + j * 2); ctx.lineTo(x + k * 12, y - 2 + j * 2 + (j & 1 ? l : -l) * 0.5); ctx.stroke(); }
            ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(x, y - 7, 9, 6, 0, 0, 6.2832); ctx.fill();
            for (let k = -1; k <= 1; k += 2) { ctx.beginPath(); ctx.ellipse(x + k * 12, y - 12 + Math.sin(tick * 0.2 + k) * 1.5, 4.5, 3.5, k * 0.5, 0, 6.2832); ctx.fill(); }
            ctx.fillStyle = '#1b1820'; ctx.fillRect(x - 4, y - 15, 2, 3); ctx.fillRect(x + 2, y - 15, 2, 3);
        } else {
            const z = 14 + Math.sin(f.walk) * 3;
            ctx.globalAlpha = 0.6; ctx.drawImage(glowSprite('#ff7a2a'), x - 14, y - z - 14, 28, 28); ctx.globalAlpha = 1;
            ctx.fillStyle = w ? '#fff' : '#b8321e'; ctx.beginPath(); ctx.arc(x, y - z, 6, 0, 6.2832); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x - 5, y - z - 3); ctx.lineTo(x - 7, y - z - 10); ctx.lineTo(x - 2, y - z - 5); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + 5, y - z - 3); ctx.lineTo(x + 7, y - z - 10); ctx.lineTo(x + 2, y - z - 5); ctx.fill();
            ctx.fillStyle = '#ffd25a'; ctx.fillRect(x - 3, y - z - 1, 2, 2); ctx.fillRect(x + 1, y - z - 1, 2, 2);
            ctx.fillStyle = tick & 4 ? '#ffd25a' : '#ff8a3a'; ctx.beginPath(); ctx.moveTo(x - 3, y - z - 5); ctx.lineTo(x, y - z - 12 - (tick & 3)); ctx.lineTo(x + 3, y - z - 5); ctx.fill();
        }
    }
    function nearestDir(f) { const p = nearest(f.x, f.y); return p && p.x < f.x ? -1 : 1; }

    /* ------------------------------------------------------------------ the guide arrow */

    // where the story wants you, in which zone
    function target() {
        if (Z.def.rift) {
            if (riftClear) { GT.x = Z.stairs.cx; GT.y = Z.stairs.cy; return true; }
            let best = null, bd = 1e9; for (const f of FOES) if (f.on) { const d = dist(f.x, f.y, P[0].x, P[0].y); if (d < bd) { bd = d; best = f; } }
            if (!best) return false; GT.x = best.x; GT.y = best.y; return true;
        }
        return CH && CH.target ? CH.target() : false;
    }
    // the next doorway on the way to zone z: down from the village hub, or back up toward it
    function hop(z) {
        let k = z, next = '';
        while (k && k !== Z.id) { if (PARENT[k] === Z.id) { next = k; break; } k = PARENT[k]; }
        if (!next) next = PARENT[Z.id] || CH.home;
        if (CH.hop && CH.hop(next)) return true;
        const e = exitTo(next);
        GT.x = (e.x + e.w / 2) * TS; GT.y = (e.y + e.h / 2) * TS; return true;
    }
    const GT = { x: 0, y: 0, t: 0, ok: false, px: 0, py: 0 };
    function exitTo(to) { const ex = Z.def.exits; for (let i = 0; i < ex.length; i++) if (ex[i].to === to) return ex[i]; return ex[0]; }
    function nearestPick(zone, c) {
        let best = null, bd = 1e9;
        if (Z.id !== zone) { PICK[0] = 0; PICK[1] = 0; return PICK; }
        for (const s of Z.picks) {
            if (!s.on || (c === 'o') !== (s.k === 'ore')) continue;
            const d = (s.cx - P[0].x) * (s.cx - P[0].x) + (s.cy - P[0].y) * (s.cy - P[0].y);
            if (d < bd) { bd = d; best = PICK; PICK[0] = s.cx / TS; PICK[1] = s.cy / TS; }
        }
        return best;
    }
    const PICK = [0, 0];
    // a walking-distance map to the target, so the arrow follows corridors instead of pointing through walls
    function field(tx, ty) {
        if (tx === Z.ftx && ty === Z.fty) return;
        Z.ftx = tx; Z.fty = ty;
        const F = Z.field, Q = Z.fq, cols = Z.cols, n = cols * Z.rows;
        F.fill(-1);
        if (tx < 0 || ty < 0 || tx >= cols || ty >= Z.rows) return;
        let qh = 0, qt = 0;
        F[ty * cols + tx] = 0; Q[qt++] = tx; Q[qt++] = ty;
        while (qh < qt) {
            const x = Q[qh++], y = Q[qh++], dv = F[y * cols + x] + 1;
            for (let k = 0; k < 4; k++) {
                const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
                if (nx < 0 || ny < 0 || nx >= cols || ny >= Z.rows) continue;
                const i = ny * cols + nx, c = Z.tiles[i];
                if (F[i] >= 0 || (SOLID[c] === 1 && c !== C_g && c !== C_S && c !== C_b) || Z.block[i] === 1) continue;
                F[i] = dv; if (qt < n * 2) { Q[qt++] = nx; Q[qt++] = ny; }
            }
        }
    }
    function guidePoint() {
        field(Math.floor(GT.x / TS), Math.floor(GT.y / TS));
        const cols = Z.cols, F = Z.field;
        let x = Math.floor(P[0].x / TS), y = Math.floor(P[0].y / TS);
        if (x < 0 || y < 0 || x >= cols || y >= Z.rows || F[y * cols + x] < 0) { GT.px = GT.x; GT.py = GT.y; return; }
        for (let s = 0; s < 7; s++) {
            let bx = x, by = y, bv = F[y * cols + x];
            if (bv <= 0) break;
            for (let k = 0; k < 4; k++) {
                const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
                if (nx < 0 || ny < 0 || nx >= cols || ny >= Z.rows) continue;
                const v = F[ny * cols + nx]; if (v >= 0 && v < bv) { bv = v; bx = nx; by = ny; }
            }
            if (bx === x && by === y) break;
            x = bx; y = by;
        }
        GT.px = x * TS + 16; GT.py = y * TS + 16;
    }
    function drawGuide(cx, cy) {
        if (!S) return;
        if (tick % 15 === 0) { GT.ok = target(); if (GT.ok) guidePoint(); }
        if (!GT.ok) return;
        const x = GT.x - cx, y = GT.y - cy - 34, m = 26;
        if (x > m && x < W - m && y > m && y < H - m) {
            const b = Math.sin(tick * 0.12) * 4;
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(x - 9, y - 12 + b); ctx.lineTo(x + 9, y - 12 + b); ctx.lineTo(x, y + 1 + b); ctx.fill();
            ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(x - 6, y - 10 + b); ctx.lineTo(x + 6, y - 10 + b); ctx.lineTo(x, y - 2 + b); ctx.fill();
        } else {
            // an arrow circling the hero, pointing along the path
            const hx = P[0].x - cx, hy = P[0].y - cy - 14, a = Math.atan2(GT.py - cy - (P[0].y - cy), GT.px - cx - hx);
            const px = hx + Math.cos(a) * 34, py = hy + Math.sin(a) * 24;
            ctx.save(); ctx.translate(px, py); ctx.rotate(a);
            const pulse = 1 + Math.sin(tick * 0.15) * 0.12; ctx.scale(pulse, pulse);
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-8, -10); ctx.lineTo(-8, 10); ctx.fill();
            ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-5, -7); ctx.lineTo(-5, 7); ctx.fill();
            ctx.restore();
        }
    }

    /* ------------------------------------------------------------------ loop, screen */

    function resize() {
        const vw = window.innerWidth, vh = window.innerHeight;
        const s = Math.min(vw / W, vh / H);
        const cw = Math.floor(W * s), ch2 = Math.floor(H * s);
        const st = $('stage'); st.style.width = cw + 'px'; st.style.height = ch2 + 'px';
        st.style.left = Math.floor((vw - cw) / 2) + 'px'; st.style.top = Math.floor((vh - ch2) / 2) + 'px';
        st.style.setProperty('--u', (ch2 / 100) + 'px');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let bw = Math.round(cw * dpr), bh = Math.round(ch2 * dpr);
        if (bw > 1920) { bh = Math.round(bh * 1920 / bw); bw = 1920; }
        canvas.width = bw; canvas.height = bh;
        ctx.setTransform(bw / W, 0, 0, bh / H, 0, 0);
        ctx.imageSmoothingEnabled = false;
    }
    function frame(ts) {
        raf = requestAnimationFrame(frame);
        if (!last) last = ts;
        acc += Math.min(250, ts - last); last = ts;
        while (acc >= STEP) { update(); acc -= STEP; }
        draw();
    }
    function startLoop() { if (!raf) { last = 0; acc = 0; raf = requestAnimationFrame(frame); } }
    function stopLoop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

    /* ------------------------------------------------------------------ input (SDK only) */

    function onInput(a, pressed, repeat, dev) {
        dev = dev || 'keys';
        if (!repeat) { const d = DEV[dev] || (DEV[dev] = {}); d[a] = pressed; }
        // with Return on "hold OK", OK in menus and conversations acts when released (a long press is Return)
        if (a === 'confirm' && !pressed && okDown >= 0) { const was = okBack; okDown = -1; okBack = false; if (!was && (mode === 'overlay' || mode === 'dialog')) { if (mode === 'overlay') ovInput('confirm'); else dlgInput('confirm'); } return; }
        if (!pressed || !started) return;
        // a phone on the network ('net1'...) only plays: it never takes hero 1, opens menus or answers dialogs
        const remote = dev.indexOf('net') === 0;
        if (remote) {
            if (mode === 'play') {
                if (a === 'menu') { if (P[1].on && P[1].dev === dev) { remoteMenu = true; quickMenu(P[1]); } return; }       // hero 2's own menu: gear, mounts, abilities
                if (a === 'confirm' || a === 'pause') return;
            } else {
                if (remoteMenu && mode === 'overlay' && OV.kind === 'journal') { if (a === 'jump' || a === 'cancel') { ovHide(); toPlay(); } return; }
                if (remoteMenu && mode === 'overlay' && (OV.kind === 'list' || OV.kind === 'gear')) {                      // the phone drives hero 2's menu
                    if (a === 'cancel') goBack(); else if (a === 'jump') ovInput('confirm'); else if (a === 'left' || a === 'right' || a === 'up' || a === 'down') ovInput(a);
                    mirrorMenu();
                }
                return;
            }
        }
        if (P[0].dev === '' && !remote) P[0].dev = dev;
        if (dev !== P[0].dev && !repeat) joinSeen = true;
        if (tick < lockUntil && (a === 'confirm' || a === 'jump')) return;
        if (a === 'menu') { if (mode === 'play') quickMenu(P[0]); else if (mode === 'overlay' || mode === 'dialog') goBack(); return; }
        if (mode === 'scene') { if (a === 'confirm' && SC.t > 0 && !repeat) { SC.t = 0; nextStep(); } return; }
        if (mode === 'overlay' || mode === 'dialog') {
            if (a === 'jump') return;
            if (a === SET.back) { goBack(); return; }
            if (a === 'confirm' && SET.back === 'hold') { if (!repeat) { okDown = tick; okBack = false; } return; }
            if (mode === 'overlay') ovInput(a); else dlgInput(a);
            return;
        }
        if (mode !== 'play' || repeat) return;
        const p = dev === P[0].dev || !P[1].on && dev === 'keys' ? P[0] : P[1].on && dev === P[1].dev ? P[1] : null;
        if (a === 'jump') {
            if (!p) { if (!P[1].on) join(dev); return; }
            // a second OK soon after the first is "OK twice"
            if (tick - p.tapT < 16) { p.tapT = -99; gesture(p, 'double'); } else { p.tapT = tick; gesture(p, 'tap'); }
        } else if (p && (a === 'run' || a === 'cancel')) gesture(p, a);
    }

    // local co-op: js/coop.js feeds a phone's buttons in here as one more device
    window.HM_REMOTE = {
        input: (a, down, dev) => onInput(a, down, false, dev),
        leave: dev => {
            DEV[dev] = {};
            if (P[1].on && P[1].dev === dev) { P[1].on = false; P[1].dev = ''; toast(txt(T.ui.p2left, { name: heroName(1) })); }
        }
    };

    // test hook for development only: open index.html?debug
    if (/[?&]debug\b/.test(location.search)) window.__HM = { get S() { return S; }, P, Z, FOES, get mode() { return mode; }, get boss() { return boss; },
        talk, act, gesture, ability, SET, TUNE, solidAt, interact, spawnFoe, setMount, attack, shot, get CH() { return CH; }, changeZone, loadZone, placePlayers, update, recalcAll, giveItem, DROPS, PET, riftFloor, get riftClear() { return riftClear; }, objective: () => objective(L), target: () => target() && GT };

    /* ------------------------------------------------------------------ lifecycle */

    // load the chapter the save is in (or chapter 1), then show the title over its home
    function finishInit() {
        readTune(); loadSettings(); refreshHint();
        S = fresh();
        const saved = MyPC.load('save', null);
        if (saved) S = migrate(Object.assign(fresh(), saved));
        let ch = CHAPTERS.of(S.zone);
        if (!CHAPTERS.enabled(ch)) ch = 'ch1';
        let finished = false;
        const done = () => {
            if (finished) return; finished = true;
            try { recalcAll(); loadZone(CH.home); camX = 0; camY = 0; refreshMenu(); }
            catch (e) { finished = false; return fail(e); }
            MyPC.progress(1);
            MyPC.ready();
        };
        // never stay silently on the loading bar: a failure shows My PC's Retry / Back with the reason
        const fail = e => { if (!finished) { finished = true; MyPC.fail('Hollowmere: ' + ((e && e.message) || e)); } };
        enterChapter(ch).then(done).catch(e1 => {
            if (ch === 'ch1') return fail(e1);
            CH = null; CHID = '';
            enterChapter('ch1').then(done).catch(fail);
        });
    }

    MyPC.init({
        onInit: function (i) {
            info = i; L = TEXT[i.lang] ? i.lang : 'en'; T = TEXT[L]; tier = (i.quality && i.quality.tier) || 'high';
            document.documentElement.lang = L; document.documentElement.dir = L === 'ar' ? 'rtl' : 'ltr';
            VOICE.setLang(L);
            document.title = T.ui.title;
            canvas = $('c'); ctx = canvas.getContext('2d', { alpha: false });
            resize(); window.addEventListener('resize', resize);
            vignette = ART.vignette(W, H);
            darkC = document.createElement('canvas'); darkC.width = W; darkC.height = H; dctx = darkC.getContext('2d');
            $('questLbl').textContent = T.ui.quest;
            $('join').textContent = T.ui.p2join;
            $('dai').textContent = '✦ ' + T.ui.ai;
            $('pn0').textContent = T.ui.hero1; $('pn1').textContent = T.ui.hero2;
            MyPC.progress(0.3);
            ['grass', 'forest', 'mire', 'stone', 'crypt', 'mine'].forEach(t => ART.sprites(t));
            ART.misc();
            MyPC.progress(0.5);
            MOUNTART.load(VERSION);
            // the pictures must not hold the game back: if they stall (slow TV network), start with the drawn art
            let inited = false;
            const go = () => { if (inited) return; inited = true; clearTimeout(wd); finishInit(); };
            const wd = setTimeout(go, 15000);
            KN.load(VERSION, p => MyPC.progress(0.5 + p * 0.4), go);
        },
        onStart: function () {
            started = true;
            try { SND.start(info.volume); if (CH) for (const k of CH.songs || []) SND.prepare(k); music(); } catch (e) { /* no sound is better than no game */ }
            showTitle();
            startLoop();
        },
        onPause: function () { stopLoop(); SND.pause(); $('paused').style.display = info.standalone ? '' : 'none'; for (const k in DEV) DEV[k] = {}; },
        onResume: function () { $('paused').style.display = 'none'; SND.resume(); startLoop(); },
        onDestroy: function () {
            stopLoop(); VOICE.stop(); SND.close();
            window.removeEventListener('resize', resize);
        },
        onInput: onInput,
        ownMenu: true,
        onMenu: function (id) {
            if (id === 'coopleave') { HM_COOP.leave(); return; }
            if (!S || (mode !== 'play' && mode !== 'dialog')) return;
            if (mode === 'dialog' && (id === 'journal' || id === 'equip' || id === 'settings' || id === 'mount')) closeDlg();
            if (id === 'journal') showJournal();
            else if (id === 'equip') equipScreen();
            else if (id === 'settings') settingsScreen();
            else if (id === 'potion') drink(false);
            else if (id === 'big') drink(true);
            else if (id === 'leave2' && P[1].on) leave2();
            else if (id === 'coop' && !P[1].on) { if (mode === 'dialog') closeDlg(); coopScreen(); }
            else if (id === 'mount') mountScreen();
        },
        onVolume: function (v) { SND.setVolume(v); }
    });
})();
