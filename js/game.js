/* Hollowmere: The Lantern Road. A 2.5D action RPG for My PC, for 1 or 2 players.
 * One rAF loop, fixed 60 Hz update, pools for foes / shots / particles / drops / rings,
 * input only through the My PC SDK. */
(function () {
    'use strict';
    const W = 640, H = 360, TS = 32, STEP = 1000 / 60;
    const ART = window.HM_ART, SND = window.HM_AUDIO, VOICE = window.HM_VOICE, MAPS = window.HM_MAPS, TEXT = window.HM_TEXT;
    const ITEMS = window.HM_ITEMS, SLOTS = window.HM_SLOTS, SHOPS = window.HM_SHOPS, QUESTS = window.HM_QUESTS, CHESTS = window.HM_CHESTS, LOOT = window.HM_LOOT;
    const $ = id => document.getElementById(id);

    let info = null, T = TEXT.en, L = 'en', tier = 'high';
    let canvas, ctx, raf = 0, last = 0, acc = 0, tick = 0, lockUntil = 0, started = false;
    let mode = 'boot';           // overlay, play, dialog, fade
    let S = null;                // the saved game
    let camX = 0, camY = 0, fogOff = 0, shake = 0, freeze = 0, flashT = 0;

    /* ------------------------------------------------------------------ data */

    const NAME = { maren: 'Maren', tobin: 'Tobin', sela: 'Sela', corvin: 'Corvin', lira: 'Lira', hana: 'Hana', pip: 'Pip', bram: 'Bram', odo: 'Odo', tam: 'Tam', biscuit: 'Biscuit' };
    const NAME_AR = { maren: 'مارين', tobin: 'توبين', sela: 'سيلا', corvin: 'كورفين', lira: 'ليرا', hana: 'هانا', pip: 'بيب', bram: 'برام', odo: 'أودو', tam: 'تام', biscuit: 'بسكويت' };
    const LOOK = {
        maren: { cloak: '#6d5a8a', trim: '#d9c27a', skin: '#e8c4a0', hair: '#e6e6ea', style: 1, s: 1 },
        tobin: { cloak: '#6b4a32', trim: '#2f2f33', skin: '#c98e66', hair: '#3a2a1e', style: 2, s: 1.2 },
        sela: { cloak: '#2f5f7a', trim: '#9fd6ff', skin: '#d4a984', hair: '#2a2a2e', style: 3, s: 1 },
        corvin: { cloak: '#2a2a38', trim: '#5b5bd6', skin: '#d8c0a8', hair: '#151518', style: 0, s: 1.05 },
        lira: { cloak: '#bfe6ff', trim: '#ffffff', skin: '#eaf6ff', hair: '#d9ecff', style: 1, s: 0.85, glow: true },
        hana: { cloak: '#3f8a5a', trim: '#f2d14a', skin: '#e2b48c', hair: '#7a3a22', style: 1, s: 1 },
        pip: { cloak: '#d86a3a', trim: '', skin: '#f0c8a0', hair: '#5a3a1e', style: 0, s: 0.72 },
        bram: { cloak: '#a8322e', trim: '#3a2a1e', skin: '#d09a74', hair: '#6a4a2a', style: 0, s: 1.1 },
        odo: { cloak: '#7a7f8a', trim: '#c9a43a', skin: '#c48c64', hair: '#5a5f6a', style: 3, s: 1.1 },
        tam: { cloak: '#5a7a3a', trim: '#3a2a1e', skin: '#e2b48c', hair: '#9a5a2a', style: 0, s: 0.86 }
    };
    const HERO = [
        { cloak: '#2a9d8f', trim: '#f4d35e', skin: '#e9c39b', hair: '#2b1d14', style: 0, s: 1 },
        { cloak: '#e76f51', trim: '#f4d35e', skin: '#d9a77c', hair: '#c0582e', style: 1, s: 1 }
    ];
    const TALKER = { maren: 1, tobin: 1, sela: 1, corvin: 1 };      // they answer questions from a written list
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
        shade:     { hp: 84, dmg: 3, spd: 0, r: 18, xp: 80, coin: 120, boss: 1 }
    };
    const SHADE_PTS = [[20, 4.5], [15, 3.5], [25, 3.5], [15.5, 6.5], [24.5, 6.5]];
    const PARENT = { greywood: 'village', mireshore: 'village', quarry: 'village', isle: 'mireshore', barrow: 'greywood', mine: 'quarry' };
    const DUST = { village: '#b8a27a', greywood: '#7f6a48', mireshore: '#c8b07a', isle: '#8a7a55', quarry: '#b4a894', barrow: '#7a7c88', mine: '#8a7058' };
    const NUM = []; for (let i = 0; i < 200; i++) NUM.push(String(i));

    function fresh() {
        return { v: 3, stage: 0, ore: 0, caps: 0, sword: false, key: false, gate: false, seal: false, hearth: false, tide: false, stone: false,
                 heart: false, page: false, lit: false, picked: {}, cut: false, coins: 0, potions: 1, big: 0, xp: 0, lvl: 1,
                 zone: 'village', x: 21.5, y: 10.5, kills: 0, time: 0, scored: false,
                 bag: [{ u: 1, id: 'stick', r: 0, up: 0, b: [] }], uid: 1, iron: 0,
                 eq: [{ weapon: 1, head: 0, body: 0, feet: 0 }, { weapon: 1, head: 0, body: 0, feet: 0 }],
                 sq: {}, sqc: {}, opened: {}, star: false, crypt: false, qdone: 0 };
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
    function npcName(id) { id = baseId(id); return L === 'ar' ? NAME_AR[id] : NAME[id]; }
    function heroName(i) { return i ? T.ui.hero2 : T.ui.hero1; }
    function itemName(id) { return (T.items && T.items[id]) || id; }
    function maxHp(p) { return 10 + 3 * (S.lvl - 1) + (p ? p.st.hp : 0); }
    function need(l) { return 5 * l * (l + 1); }
    function embers() { return (S.hearth ? 1 : 0) + (S.tide ? 1 : 0) + (S.stone ? 1 : 0); }

    function objective(lang) {
        const t = TEXT[lang] || TEXT.en, st = S.stage;
        if (st === 2 && S.ore >= 3) return t.obj[3];
        if (st === 7 && S.caps >= 3) return t.ui.bringCaps;
        return txt(t.obj[st] || '', { n: st === 2 ? Math.min(3, S.ore) : Math.min(3, S.caps) });
    }

    /* ------------------------------------------------------------------ pools */

    const P = [0, 1].map(i => ({ i, on: i === 0, dev: '', x: 0, y: 0, fx: 0, fy: 1, ax: 0, ay: 1, hp: 10, atk: 0, swing: 0, inv: 0,
        down: false, downT: 0, walk: 0, kx: 0, ky: 0, hold: 0, moving: false, r: 7, sy: 0, kind: 3, lean: 0, flash: 0, anim: 'sword',
        st: { atk: 1, cd: 20, kind: 'sword', def: 0, spd: 0, crit: 10, hp: 0, gold: 0, col: '#a07a4a', col2: '#6b4a2e' }, gear: { head: '', body: '', feet: '' } }));
    const FOES = []; for (let i = 0; i < 36; i++) FOES.push({ on: false, kind: 4, t: '', d: null, x: 0, y: 0, hx: 0, hy: 0, hp: 0, max: 0, st: 0, tm: 0, cd: 0,
        vx: 0, vy: 0, kx: 0, ky: 0, hurt: 0, r: 10, sy: 0, active: false, minion: false, mask: 0, ring: 0, alpha: 1, wt: 0, sum: 0, pt: 0, walk: 0, side: 0, sdx: 0, sdy: 0 });
    // k: 0 mud, 1 rock, 2 orb, 3 bone (hurt heroes) | 10 arrow, 11 bullet (hurt foes)
    const SHOTS = []; for (let i = 0; i < 64; i++) SHOTS.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, dmg: 0, r: 5, k: 0, pierce: 0, owner: 0, hit: null });
    const PARTS = []; for (let i = 0; i < 260; i++) PARTS.push({ on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, max: 1, col: '#fff', sz: 2, g: 0.15 });
    const DROPS = []; for (let i = 0; i < 32; i++) DROPS.push({ on: false, kind: 5, k: 0, x: 0, y: 0, z: 0, vz: 0, vx: 0, vy: 0, t: 0, v: 0, sy: 0, it: null });
    const FLOATS = []; for (let i = 0; i < 28; i++) FLOATS.push({ on: false, x: 0, y: 0, t: 0, s: '', col: '#fff', big: false });
    const RINGS = []; for (let i = 0; i < 16; i++) RINGS.push({ on: false, x: 0, y: 0, r: 0, max: 0, col: '#fff', w: 3 });
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
        p.gear.head = h ? h.id : ''; p.gear.body = bd ? bd.id : ''; p.gear.feet = ft ? ft.id : '';
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
    function zoneTier() { return Math.min(3, Math.max(LOOT.zoneTier[Z.id] || 2, S.lvl >= 9 ? 3 : S.lvl >= 5 ? 2 : 1)); }
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
        for (const q of QUESTS) if (q.giver === npc && !qState(q.id) && S.stage >= q.stage && (!q.after || qState(q.after) === 3)) return q;
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
        if (r.coins) parts.push(txt(T.ui.nCoins, { n: r.coins }));
        if (r.item) parts.push(itemName(r.item));
        if (r.big) parts.push(r.big + ' × ' + T.ui.potB);
        return parts.join(', ');
    }
    function handIn(q) {
        const r = q.reward;
        S.sq[q.id] = 3; S.qdone++;
        S.coins += r.coins || 0; S.big += r.big || 0;
        if (r.item) giveItem(r.item, true, 1);
        SND.fx('level'); ringFx(P[0].x, P[0].y - 10, 60, '#ffd23f');
        save();
        return txt(T.ui.qReward, { r: rewardText(r) });
    }
    function countKill(t) {
        for (const q of QUESTS) if (q.type === 'kill' && q.foe === t && qState(q.id) === 1) {
            S.sqc[q.id] = (S.sqc[q.id] || 0) + 1;
            if (S.sqc[q.id] >= q.n) questReady(q);
        }
    }

    /* ------------------------------------------------------------------ zone */

    const SOLID = new Uint8Array(128);
    '#T~rfbgSpCQt'.split('').forEach(c => { SOLID[c.charCodeAt(0)] = 1; });
    const Z = { id: '', def: null, cols: 0, rows: 0, tiles: null, block: null, ground: null, theme: 'grass', rs: [], npcs: [], statics: [], picks: [],
        pots: [], chests: [], lights: [], lantern: null, boats: [], field: null, fq: null, ftx: -1, fty: -1, dust: '#b8a27a' };

    function solidAt(x, y) {
        const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
        if (tx < 0 || ty < 0 || tx >= Z.cols || ty >= Z.rows) return true;
        const i = ty * Z.cols + tx;
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
        Z.theme = def.ground; Z.dust = DUST[id] || '#b8a27a';
        Z.tiles = new Uint8Array(Z.cols * Z.rows); Z.block = new Uint8Array(Z.cols * Z.rows);
        Z.field = new Int16Array(Z.cols * Z.rows); Z.fq = new Int16Array(Z.cols * Z.rows * 2); Z.ftx = -1; Z.fty = -1;
        for (let y = 0; y < Z.rows; y++) for (let x = 0; x < Z.cols; x++) {
            let c = def.rows[y][x];
            if (c === 'b' && S.cut) c = '.';
            if (c === 'g' && S.gate) c = '=';
            if (c === 'S' && S.seal) c = 'x';
            Z.tiles[y * Z.cols + x] = c.charCodeAt(0);
        }
        Z.rs = []; for (let y = 0; y < Z.rows; y++) Z.rs.push([]);
        Z.statics = []; Z.picks = []; Z.pots = []; Z.chests = []; Z.lights = []; Z.npcs = []; Z.boats = []; Z.lantern = null;
        const sp = ART.sprites(Z.theme), mi = ART.misc();
        for (const p of def.props) {
            if (p.w) for (let y = p.y; y < p.y + p.h; y++) for (let x = p.x; x < p.x + p.w; x++) Z.block[y * Z.cols + x] = 1;
            if (p.k === 'lantern') Z.lantern = addStatic('lantern', mi.lanternOff, p.x * TS, (p.y + p.h) * TS - 150, (p.y + p.h) * TS, 64, 150, { cx: (p.x + 1) * TS, cy: (p.y + p.h) * TS });
            else if (p.k === 'boat') Z.boats.push(addStatic('boat', mi.boat, p.x * TS - 28, p.y * TS - 14, p.y * TS + 10, 56, 28, { cx: p.x * TS, cy: p.y * TS }));
            else if (p.k === 'bell') { Z.block[Math.floor(p.y) * Z.cols + Math.floor(p.x)] = 1; addStatic('bell', mi.bell, p.x * TS - 22, p.y * TS - 56, p.y * TS + 8, 44, 64); }
            else if (p.k === 'statue') { Z.block[Math.floor(p.y) * Z.cols + Math.floor(p.x)] = 1; addStatic('statue', mi.statue, p.x * TS - 15, p.y * TS - 48, p.y * TS + 8, 30, 56); }
            else { const img = ART.building(p.k, p.w, p.h); addStatic(p.k, img, p.x * TS, p.y * TS - 40, (p.y + p.h) * TS, p.w * TS, p.h * TS + 40); }
        }
        const isWall = (x, y) => x < 0 || y < 0 || x >= Z.cols || y >= Z.rows || def.rows[y][x] === '#' || def.rows[y][x] === 't';
        for (let ty = 0; ty < Z.rows; ty++) for (let tx = 0; tx < Z.cols; tx++) {
            const c = def.rows[ty][tx], px = tx * TS, py = ty * TS, key = id + ':' + tx + ',' + ty;
            if (c === 'T') addStatic('tree', sp.tree[(ART.hash(tx, ty, 9) * 3) | 0], px - 10 + ((ART.hash(tx, ty, 2) * 6) | 0), py - 42, py + 30, 52, 72);
            else if (c === '#') {
                // walls inside a block are drawn flat into the ground; only their edges need raised sprites
                const above = isWall(tx, ty - 1), below = isWall(tx, ty + 1);
                if (!above || !below) addStatic('cliff', sp.cliff[below ? 0 : 1], px, py - 16, py + TS, 32, 48);
            }
            else if (c === 't') { addStatic('torch', sp.torch, px, py - 16, py + TS, 32, 48); Z.lights.push(px + 16, py + 22); }
            else if (c === 'r') addStatic('rock', sp.rock, px, py, py + 28, 32, 30);
            else if (c === 'b') { if (!S.cut) addStatic('bramble', sp.bramble, px - 1, py - 12, py + TS, 34, 44, { tx, ty }); }
            else if (c === 'g') { if (!S.gate) addStatic('gate', sp.gate, px, py - 16, py + TS, 32, 48, { tx, ty }); }
            else if (c === 'S') { if (!S.seal) addStatic('seal', sp.seal, px, py - 16, py + TS, 32, 48, { tx, ty }); }
            else if (c === 'p') Z.pots.push(addStatic('pot', sp.pot, px + 3, py + 2, py + 28, 26, 30, { tx, ty, cx: px + 16, cy: py + 18 }));
            else if (c === 'C' || c === 'Q') {
                const open = !!S.opened[key], star = c === 'Q';
                Z.chests.push(addStatic('chest', star ? (open ? sp.starOpen : sp.star) : (open ? sp.chestOpen : sp.chest), px + 1, py + 2, py + 28, 30, 28,
                    { key, star, open, cx: px + 16, cy: py + 16, img2: star ? sp.starOpen : sp.chestOpen }));
            }
            else if (c === 'o' && !S.picked[key]) Z.picks.push(addStatic('ore', sp.ore, px + 3, py + 8, py + 28, 26, 22, { key, cx: px + 16, cy: py + 20 }));
            else if (c === 'c' && !S.picked[key]) Z.picks.push(addStatic('cap', sp.cap, px + 6, py + 8, py + 28, 20, 22, { key, cx: px + 16, cy: py + 20 }));
        }
        for (const n of def.npcs) Z.npcs.push({ id: n.id, x: n.x * TS, y: n.y * TS, hx: n.x * TS, hy: n.y * TS, kind: 2, sy: n.y * TS, walk: 0, fx: 0, fy: 1, bob: ART.hash(n.x, n.y, 4) * 6 });
        Z.ground = ART.ground({ cols: Z.cols, rows: Z.rows, ch: (x, y) => def.rows[y][x] }, Z.theme);
        for (const f of FOES) f.on = false;
        for (const s of SHOTS) s.on = false;
        for (const d of DROPS) d.on = false;
        boss = null;
        for (const f of def.foes) spawnFoe(f.t, f.x * TS, f.y * TS, false);
        if (def.boss && !S[def.boss.flag]) boss = spawnFoe(def.boss.t, def.boss.x * TS, def.boss.y * TS, false);
        if (id === 'isle' && S.stage === 14) boss = spawnFoe('shade', 20 * TS, 4.5 * TS, false);
        hideBoss();
        music();
    }

    function music() {
        if (boss && boss.active) return SND.play(6);
        const m = Z.def ? Z.def.music : 0;
        SND.play(m === 0 && S && S.lit ? 5 : m);
    }

    function placePlayers(tx, ty) {
        P[0].x = tx * TS; P[0].y = ty * TS;
        P[1].x = P[0].x; P[1].y = P[0].y;
        for (const o of [[18, 0], [-18, 0], [0, 18], [0, -18], [12, 12]]) {
            if (!feetSolid(P[0].x + o[0], P[0].y + o[1])) { P[1].x = P[0].x + o[0]; P[1].y = P[0].y + o[1]; break; }
        }
        for (const p of P) { p.kx = p.ky = 0; p.inv = 60; p.atk = 0; p.swing = 0; p.sy = p.y; }
        snapCamera();
    }

    function feetSolid(x, y) { return solidAt(x - 7, y - 5) || solidAt(x + 7, y - 5) || solidAt(x - 7, y + 3) || solidAt(x + 7, y + 3); }

    /* ------------------------------------------------------------------ helpers */

    function spawnFoe(t, x, y, minion) {
        for (const f of FOES) if (!f.on) {
            const d = FOE[t];
            f.on = true; f.t = t; f.d = d; f.x = f.hx = x; f.y = f.hy = y; f.r = d.r;
            f.max = f.hp = Math.round(d.hp * (d.boss && P[1].on ? 1.5 : 1));
            f.st = 0; f.tm = 0; f.cd = 60; f.vx = f.vy = f.kx = f.ky = 0; f.hurt = 0; f.minion = minion; f.mask = 0; f.ring = 0;
            f.alpha = 1; f.wt = 0; f.sum = 0; f.pt = 0; f.side = 0; f.active = !d.boss; f.walk = Math.random() * 6; f.sy = y;
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
        for (const s of SHOTS) if (!s.on) { s.on = true; s.x = x; s.y = y; s.vx = vx; s.vy = vy; s.dmg = dmg; s.r = r; s.k = k; s.life = k === 10 ? 48 : k === 11 ? 36 : 240; s.pierce = k === 11 ? 1 : 0; s.owner = owner || 0; s.hit = null; return s; }
        return null;
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
        const em = (S.hearth ? 1 : 0) | (S.tide ? 2 : 0) | (S.stone ? 4 : 0) | (S.heart ? 8 : 0);
        if (em !== hudLast.em) { hudLast.em = em; $('em0').className = 'em r' + (S.hearth ? ' on' : ''); $('em1').className = 'em b' + (S.tide ? ' on' : ''); $('em2').className = 'em s' + (S.stone ? ' on' : ''); $('em3').className = 'em h' + (S.heart && !S.lit ? ' on' : ' off'); }
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
        if (boss && boss.active && boss.on && boss.hp !== hudLast.boss) { hudLast.boss = boss.hp; $('bossFill').style.width = (100 * Math.max(0, boss.hp) / boss.max) + '%'; }
    }
    function showBoss(f) { $('bossName').textContent = T.boss[f.t]; $('bossBox').style.display = ''; hudLast.boss = -1; MyPC.announce(T.boss[f.t]); }
    function hideBoss() { $('bossBox').style.display = 'none'; }
    function setHud(on) { $('hud').style.display = on ? '' : 'none'; }

    let menuKey = '';
    function refreshMenu() {
        if (!S) return;
        const items = [{ id: 'journal', label: T.ui.mJournal }, { id: 'equip', label: T.ui.mEquip },
            { id: 'potion', label: txt(T.ui.mPotionS, { n: S.potions }) }, { id: 'big', label: txt(T.ui.mPotionB, { n: S.big }) }];
        if (P[1].on) items.push({ id: 'leave2', label: T.ui.mLeave });
        const k = items.map(i => i.label).join('|');
        if (k !== menuKey) { menuKey = k; MyPC.setMenu(items); }
    }

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
        if (id === 'sela' && S.stage >= 8) c.push({ label: T.ui.ferry, fn: () => { closeDlg(); ferry('isle'); } });
        if (id === 'tobin' && S.stage >= 4) c.push({ label: T.ui.browseForge, fn: () => { closeDlg(); forgeScreen(); } });
        if (id === 'hana') c.push({ label: T.ui.browsePotions, fn: () => { closeDlg(); potionScreen(); } });
        const q = qOffer(id);
        if (q) c.push({ label: T.ui.askWork, fn: () => offer(id, q) });
        return c;
    }
    // every question shown has a written answer; more questions open up as the story goes on
    function talkChoices(id) {
        const c = extras(id);
        c.push({ label: T.ui.next, fn: () => answer(id, id === 'maren' ? txt(T.lines.marenIdle[0], { obj: objective(L) }) : objective(L), null) });
        const tp = T.topic[id];
        if (tp) {
            c.push({ label: tp[0], fn: () => answer(id, tp[1], 'topic-' + id + '-lore') });
            c.push({ label: T.ui.about, fn: () => answer(id, tp[2], 'topic-' + id + '-about') });
        }
        const list = (T.talk && T.talk[id]) || [];
        list.forEach((t, k) => { if (S.stage >= t.s && (t.e === undefined || S.stage <= t.e)) c.push({ label: t.q, fn: () => answer(id, t.a, 'talk-' + id + '-' + k) }); });
        c.push({ label: T.ui.bye, fn: closeDlg });
        return c;
    }
    function answer(id, text, clip) {
        const sel = D.sel;
        D.pages = [[id, text, clip]]; D.i = 0; D.choices = talkChoices(id); D.sel = Math.min(sel, D.choices.length - 1); D.wait = false; D.ai = false;
        renderDlg();
    }

    /* ------------------------------------------------------------------ story */

    function advance(st) { if (S.stage < st) { S.stage = st; SND.fx('quest'); MyPC.announce(objective(L)); } save(); }

    function offer(id, q) {
        D.pages = qlines(id, q.id, 'offer'); D.i = 0; D.sel = 0;
        D.pages[D.pages.length - 1] = [id, D.pages[D.pages.length - 1][1] + '\n' + T.ui.reward + ': ' + rewardText(q.reward), D.pages[D.pages.length - 1][2]];
        D.choices = [{ label: T.ui.accept, fn: () => { acceptQuest(q); closeDlg(); } }, { label: T.ui.later, fn: closeDlg }];
        renderDlg();
    }

    function talk(id) {
        const st = S.stage;
        let pages = null;
        // first the main story, then side quests waiting to be handed in, then the usual talk
        switch (id) {
            case 'maren':
                if (st === 0) { pages = lines('maren', 'maren0'); advance(1); }
                else if (st === 5) { pages = lines('maren', 'maren5'); advance(6); }
                else if (st === 9) { pages = lines('maren', 'maren9'); advance(10); }
                else if (st === 12) { pages = lines('maren', 'maren12'); advance(13); }
                else if (st === 15) { pages = lines('maren', 'maren15'); advance(16); }
                else if (st >= 17) pages = lines('maren', 'marenEnd');
                else pages = lines('maren', 'marenIdle', { obj: objective(L) });
                break;
            case 'tobin':
                if (st === 1 && S.ore >= 3) { pages = lines('tobin', 'tobin1').slice(0, 1).concat(lines('tobin', 'tobin2b')); forgeSword(); advance(4); }
                else if (st === 1) { pages = lines('tobin', 'tobin1'); advance(2); }
                else if (st === 2 && S.ore < 3) pages = lines('tobin', 'tobin2a', { n: S.ore });
                else if (st === 2) { pages = lines('tobin', 'tobin2b'); forgeSword(); advance(4); }
                else if (st === 10) { pages = lines('tobin', 'tobin10'); S.key = true; advance(11); toast(T.ui.gotKey); }
                break;
            case 'sela':
                if (st === 6 && S.caps >= 3) { pages = lines('sela', 'sela6').slice(0, 1).concat(lines('sela', 'sela7b')); advance(8); }
                else if (st === 6) { pages = lines('sela', 'sela6'); advance(7); }
                else if (st === 7 && S.caps < 3) pages = lines('sela', 'sela7a', { n: S.caps });
                else if (st === 7) { pages = lines('sela', 'sela7b'); advance(8); }
                break;
            case 'corvin': if (st < 15) return; break;
            case 'tam': return rescue('tam');
            case 'biscuit': return rescue('biscuit');
        }
        if (!pages) {
            const q = qReady(baseId(id) === id ? id : '');
            if (q) {
                const msg = handIn(q);
                return say(qlines(id, q.id, 'done').concat([[null, msg, 0]]), null, () => toast(msg));
            }
            const idle = { maren: null, tobin: 'tobinIdle', sela: 'selaIdle', corvin: 'corvinIdle', lira: 'liraIdle', hana: 'hana', pip: S.lit ? 'pipPost' : 'pip',
                bram: S.hearth ? 'bramPost' : 'bram', odo: S.key ? 'odoKey' : 'odo', tamHome: 'tamHome', biscuitHome: 'biscuitHome' }[id];
            pages = lines(baseId(id), idle);
        }
        if (TALKER[id]) return say(pages, talkChoices(id));
        const ex = extras(id);
        if (ex.length) { ex.push({ label: T.ui.bye, fn: closeDlg }); return say(pages, ex); }
        say(pages);
    }
    function forgeSword() { S.sword = true; giveItem('iron_sword', true); toast(T.ui.gotSword); }
    // Tam and Biscuit: finding them is enough (even before anyone asked); they head home
    function rescue(who) {
        const q = qDef(who);
        if (qState(who) < 2) { S.sq[who] = 2; SND.fx('quest'); }
        save();
        say(lines(who, who === 'tam' ? 'tamFound' : 'biscuitFound'), null, () => {
            for (const n of Z.npcs) if (n.id === who) burst(n.x, n.y - 10, 16, '#ffe9a8', 2);
            toast(txt(T.ui.qDoneGo, { name: T.quests[who].title, npc: npcName(q.giver) }));
        });
    }

    function ferry(to) {
        startFade(() => {
            if (to === 'isle') { loadZone('isle'); placePlayers(21.5, 22.2); S.zone = 'isle'; S.x = 21.5; S.y = 22.2; }
            else { loadZone('mireshore'); placePlayers(21.5, 16.5); S.zone = 'mireshore'; S.x = 21.5; S.y = 16.5; }
            save(); banner(T.zone[S.zone]);
        });
    }

    function yesNo(who, text, yes, clip) {
        say([[who, text, clip]], [{ label: T.ui.yes, fn: () => { closeDlg(); yes(); } }, { label: T.ui.no, fn: closeDlg }]);
    }

    function bossDown(f) {
        hideBoss(); shake = 20; SND.fx('quest');
        for (const o of FOES) if (o.on && o.minion) { o.on = false; burst(o.x, o.y, 8, '#9aa0b0', 2); }
        for (const s of SHOTS) if (s.k < 10) s.on = false;
        boss = null; music();
        if (f.t === 'thornback') { S.hearth = true; advance(5); say(lines(null, 'thornbackDown'), null, () => toast(txt(T.ui.gotEmber, { name: T.ui.hearth }))); }
        else if (f.t === 'warden') { S.tide = true; S.page = true; advance(9); say(lines(null, 'wardenDown').concat(lines(null, 'journalPage')), null, () => toast(txt(T.ui.gotEmber, { name: T.ui.tide }))); }
        else if (f.t === 'sentinel') { S.stone = true; advance(12); say(lines(null, 'sentinelDown'), null, () => toast(txt(T.ui.gotEmber, { name: T.ui.stone }))); }
        else if (f.t === 'knight') { S.crypt = true; say(lines(null, 'knightDown')); }
        else if (f.t === 'shade') {
            S.heart = true; advance(15);
            const pages = lines(null, 'shadeDown').concat(lines('lira', 'lira1'), lines('lira', 'lira2'), lines('corvin', 'corvin1'), lines('lira', 'lira3'), lines('corvin', 'corvin2'));
            say(pages, null, () => toast(T.ui.gotHeart));
        }
        save();
    }

    function useLantern() {
        if (S.stage === 16) {
            say(lines(null, 'lanternLit'), null, () => {
                S.lit = true; S.stage = 17; save(); music();
                for (let i = 0; i < 40; i++) part(Z.lantern.cx, Z.lantern.cy - 120, 0, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, Math.random() * 3, 60, '#ffd76a', 3);
                ringFx(Z.lantern.cx, Z.lantern.cy - 20, 220, '#ffd76a');
                startEnding();
            });
        } else if (S.stage >= 17) say(lines(null, 'lanternOn'));
        else say(lines(null, 'lanternCold'));
    }

    function openChest(c) {
        c.open = true; c.img = c.img2; S.opened[c.key] = true;
        SND.fx('chest'); ringFx(c.cx, c.cy, 50, '#ffe9a8');
        for (let i = 0; i < 16; i++) part(c.cx, c.cy - 4, 10, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 1.2, 2 + Math.random() * 2, 40, '#ffe9a8', 2);
        const k = CHESTS[c.key];
        if (k && k.star) { S.star = true; if (qState('stariron') === 1) S.sq.stariron = 2; say(lines(null, 'starFound')); }
        else if (k && k.item) giveItem(k.item, false, 1);
        else { const n = (k && k.coins) || 30 + ((ART.hash(c.cx, c.cy, 3) * 30) | 0); coins(c.cx, c.cy, n); S.iron += 2; toast(txt(T.ui.gotCoins, { n }) + '   ·   ' + txt(T.ui.gotIron, { n: 2 })); }
        save();
    }
    function breakPot(s) {
        s.on = false; Z.tiles[s.ty * Z.cols + s.tx] = C_dot; SND.fx('pot');
        for (let i = 0; i < 10; i++) part(s.cx, s.cy, 8, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, 1 + Math.random() * 2.5, 40, i & 1 ? '#9a5a3a' : '#c8865a', 3);
        const r = ART.hash(s.tx, s.ty, tick & 7);
        coins(s.cx, s.cy, 1 + ((r * 4) | 0));
        if (r > 0.85) drop(s.cx, s.cy, 1, 3);
    }

    function score() { return 1000 + S.kills * 10 + S.coins + S.lvl * 100 + S.qdone * 200 + Math.max(0, 3600 - Math.floor(S.time)); }

    /* ------------------------------------------------------------------ overlay screens */

    const OV = { kind: '', items: null, sel: 0, slides: null, i: 0, done: null, list: null };
    function ovShow(html) { const o = $('ov'); o.textContent = ''; o.appendChild(html); o.style.display = ''; }
    function ovHide() { $('ov').style.display = 'none'; OV.kind = ''; VOICE.stop(); }
    function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }

    function showTitle() {
        mode = 'overlay'; OV.kind = 'menu'; setHud(false);
        const hasSave = !!MyPC.load('save', null);
        OV.items = [];
        if (hasSave) OV.items.push({ label: T.ui.cont, fn: continueGame });
        OV.items.push({ label: T.ui.newg, fn: () => hasSave ? confirmNew() : newGame() });
        OV.sel = 0; OV.head = [T.ui.title, T.ui.sub];
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
        box.appendChild(el('div', 'jzone', T.zone[Z.id] || ''));
        box.appendChild(el('div', 'jobj', objective(L)));
        const em = el('div', 'jrow');
        [['hearth', S.hearth, 'r'], ['tide', S.tide, 'b'], ['stone', S.stone, 's']].forEach(e => em.appendChild(el('span', 'jem ' + e[2] + (e[1] ? ' on' : ''), (e[1] ? '◆ ' : '◇ ') + T.ui[e[0]])));
        box.appendChild(em);
        const side = QUESTS.filter(q => qState(q.id) === 1 || qState(q.id) === 2);
        if (side.length) {
            box.appendChild(el('div', 'jsub', T.ui.sideQuests));
            for (const q of side) box.appendChild(el('div', 'jq' + (qState(q.id) === 2 ? ' ready' : ''), '◆ ' + T.quests[q.id].title + ': ' + qText(q)));
        }
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
            title: () => T.ui.forge, info: () => '● ' + S.coins + '   ⛏ ' + S.iron,
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
            rows: () => SHOPS.forge.map(id => {
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
            title: () => T.ui.potionShop, info: () => '● ' + S.coins + '   ♥ ' + S.potions + '   ✚ ' + S.big,
            rows: () => SHOPS.potions.map(p => ({
                label: p.id === 'small' ? T.ui.potS : T.ui.potB, sub: p.id === 'small' ? txt(T.ui.healN, { n: p.heal }) : T.ui.healFull,
                right: txt(T.ui.nCoins, { n: p.price }), dim: S.coins < p.price,
                fn: () => {
                    if (S.coins < p.price) return toast(T.ui.poor);
                    S.coins -= p.price; if (p.id === 'small') S.potions++; else S.big++;
                    SND.fx('buy'); save(); renderList();
                }
            })).concat([{ label: T.ui.leave, fn: closeList }])
        });
    }
    // equipment: pick a slot, then pick what to wear in it; left/right switches hero in co-op
    const EQ = { hero: 0, slot: '' };
    function equipScreen() {
        EQ.hero = 0; EQ.slot = '';
        listScreen({
            title: () => T.ui.equip + (P[1].on ? ': ' + heroName(EQ.hero) : ''),
            info: () => { const st = P[EQ.hero].st; return T.ui.atk + ' ' + (st.atk + ((S.lvl - 1) >> 1)) + '   ' + T.ui.def + ' ' + st.def + '   ' + T.ui.spd + ' ' + (st.spd >= 0 ? '+' : '') + Math.round(st.spd * 100) + '%'; },
            tabs: P[1].on ? () => '◀ ' + heroName(0) + ' · ' + heroName(1) + ' ▶' : null,
            side: P[1].on ? dir => { if (!EQ.slot) { EQ.hero = (EQ.hero + 2 + dir) % 2; } } : null,
            rows: () => {
                const e = S.eq[EQ.hero];
                if (!EQ.slot) return SLOTS.map(sl => { const cur = itemOf(e[sl]); return { label: T.ui['slot_' + sl] + ': ' + (cur ? itemLabel(cur) : T.ui.none), cls: cur ? 'r' + cur.r : '', sub: cur ? statLine(cur) : '',
                    fn: () => { EQ.slot = sl; OV.sel = 0; renderList(); } }; }).concat([{ label: T.ui.close, fn: closeList }]);
                const list = S.bag.filter(it => ITEMS[it.id] && ITEMS[it.id].slot === EQ.slot);
                list.sort((a, b) => (e[EQ.slot] === b.u ? 1 : 0) - (e[EQ.slot] === a.u ? 1 : 0) || b.r - a.r || ITEMS[b.id].tier - ITEMS[a.id].tier || b.up - a.up);
                const rows = list.map(it => ({ label: itemLabel(it), cls: 'r' + it.r, sub: statLine(it), right: e[EQ.slot] === it.u ? '✓ ' + T.ui.equipped : '', mark: e[EQ.slot] === it.u,
                    fn: () => { e[EQ.slot] = it.u; recalcAll(); SND.fx('equip'); save(); EQ.slot = ''; OV.sel = 0; renderList(); } }));
                if (EQ.slot !== 'weapon') rows.push({ label: T.ui.none, right: !e[EQ.slot] ? '✓' : '', fn: () => { e[EQ.slot] = 0; recalcAll(); save(); EQ.slot = ''; OV.sel = 0; renderList(); } });
                rows.push({ label: T.ui.back, fn: () => { const s = SLOTS.indexOf(EQ.slot); EQ.slot = ''; OV.sel = s; renderList(); } });
                return rows;
            }
        });
    }
    function quickMenu() {
        const c = [
            { label: T.ui.mJournal, fn: () => { closeDlg(); showJournal(); } },
            { label: T.ui.mEquip, fn: () => { closeDlg(); equipScreen(); } },
            { label: txt(T.ui.mPotionS, { n: S.potions }), fn: () => { closeDlg(); drink(false); } },
            { label: txt(T.ui.mPotionB, { n: S.big }), fn: () => { closeDlg(); drink(true); } }
        ];
        if (P[1].on) c.push({ label: T.ui.mLeave, fn: () => { closeDlg(); leave2(); } });
        c.push({ label: T.ui.close, fn: closeDlg });
        say([[null, T.ui.quest + ': ' + objective(L), 0]], c);
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
    }
    function toPlay() { mode = 'play'; setHud(true); lockUntil = tick + 8; hudLast.obj = ''; hud(); }

    function newGame() {
        S = fresh(); recalcAll(); save();
        P[0].hp = maxHp(P[0]); P[1].hp = maxHp(P[1]); P[0].down = P[1].down = false;
        loadZone('village'); placePlayers(S.x, S.y); P[0].fx = 0; P[0].fy = -1;
        slides(T.intro, () => { toPlay(); banner(T.zone.village); }, '', T.intro.map((s, i) => 'intro-' + i));
    }
    function continueGame() {
        S = migrate(Object.assign(fresh(), MyPC.load('save', {})));
        recalcAll();
        P[0].hp = maxHp(P[0]); P[1].hp = maxHp(P[1]); P[0].down = P[1].down = false;
        loadZone(S.zone); placePlayers(S.x, S.y);
        ovHide(); toPlay(); banner(T.zone[S.zone]);
    }
    function startEnding() {
        const sc = score();
        const list = T.ending.concat([T.ui.theEnd + '\n' + txt(T.ui.score, { n: sc })]);
        slides(list, () => {
            if (!S.scored) { S.scored = true; save(); MyPC.submitScore(sc, { player: 1, players: P[1].on ? 2 : 1 }); }
            toPlay(); toast(T.ui.freeRoam);
        }, 'end', T.ending.map((s, i) => 'ending-' + i).concat([0]));
    }

    /* ------------------------------------------------------------------ fade */

    let fadeT = 0, fadeCb = null;
    function startFade(cb) { mode = 'fade'; fadeT = 0; fadeCb = cb; }
    function updFade() {
        fadeT++;
        if (fadeT === 20 && fadeCb) { const c = fadeCb; fadeCb = null; c(); }
        if (fadeT >= 40 && mode === 'fade') { mode = 'play'; lockUntil = tick + 4; }
    }
    function changeZone(to, tx, ty) {
        startFade(() => { loadZone(to); placePlayers(tx, ty); S.zone = to; S.x = tx; S.y = ty; save(); banner(T.zone[to]); });
    }

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
    function leave2() { P[1].on = false; toast(txt(T.ui.p2left, { name: heroName(1) })); }

    function frontX(p, d) { return p.x + p.ax * d; }
    function frontY(p, d) { return p.y - 4 + p.ay * d; }

    function npcVisible(id) {
        if (id === 'corvin') return S.stage >= 13;
        if (id === 'lira') return S.stage >= 15;
        if (id === 'tam' || id === 'biscuit') return qState(id) < 2;
        if (id === 'tamHome' || id === 'biscuitHome') return qState(baseId(id)) >= 2;
        return true;
    }

    function act(p) {
        if (p.down) return;
        const fx = frontX(p, 18), fy = frontY(p, 18);
        for (const n of Z.npcs) {
            if (!npcVisible(n.id) || (n.id === 'corvin' && S.stage < 15)) continue;
            if (dist(fx, fy, n.x, n.y - 6) < 34 || dist(p.x, p.y, n.x, n.y) < 46) { n.fx = Math.sign(p.x - n.x); n.fy = n.fx ? 0 : Math.sign(p.y - n.y); return talk(n.id); }
        }
        if (Z.lantern && dist(fx, fy, Z.lantern.cx, Z.lantern.cy) < 44) return useLantern();
        for (const b of Z.boats) if (dist(fx, fy, b.cx, b.cy) < 34) {
            if (Z.id === 'isle') return yesNo(null, T.lines.boatBack[0], () => ferry('shore'), 'boatBack-0');
            if (S.stage >= 8) return yesNo('sela', T.lines.selaFerry[0], () => ferry('isle'), 'selaFerry-0');
            return talk('sela');
        }
        for (const c of Z.chests) if (!c.open && dist(fx, fy, c.cx, c.cy) < 30) return openChest(c);
        if (ahead(p, C_g)) {
            if (S.key) { S.gate = true; openTiles(C_g, 61, 'gate'); SND.fx('door'); toast(T.ui.gateOpen); save(); }
            else toast(T.ui.gateLocked);
            return;
        }
        if (ahead(p, C_S)) {
            if (embers() === 3) { S.seal = true; openTiles(C_S, 120, 'seal'); SND.fx('door'); shake = 12; say(lines(null, 'sealOpen')); save(); }
            else say(lines(null, 'sealNeed'));
            return;
        }
        if (p.atk <= 0) attack(p);                       // only attacking waits for the weapon to be ready
    }
    function ahead(p, code) { for (let d = 12; d <= 28; d += 8) if (codeAt(frontX(p, d), frontY(p, d) + 4) === code) return true; return false; }
    function openTiles(code, to, k) {
        for (let i = 0; i < Z.tiles.length; i++) if (Z.tiles[i] === code) Z.tiles[i] = to;
        for (const s of Z.statics) if (s.k === k && s.on) { s.on = false; burst(s.dx + 16, s.dy + 40, 6, '#c9c4b8', 1.5); }
    }

    function damage(p) {
        let d = p.st.atk + ((S.lvl - 1) >> 1);
        return d;
    }
    function attack(p) {
        const st = p.st;
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

    function hitFoe(f, p, dmg, dx, dy) {
        if (!f.active && f.d.boss) activate(f);
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
        f.on = false; S.kills++; SND.fx('die');
        const col = f.t === 'shade' || f.t === 'wisp' ? '#c9cfdc' : f.t === 'bones' || f.t === 'knight' ? '#e8e4d8' : f.t === 'bat' ? '#5a4a6a' : '#a08a6a';
        burst(f.x, f.y - 8, f.d.boss ? 40 : 14, col, f.d.boss ? 3 : 2);
        for (let i = 0; i < (f.d.boss ? 10 : 3); i++) part(f.x + (Math.random() - 0.5) * 10, f.y - 10, 10, 0, 0, 0.6 + Math.random() * 0.6, 50, '#e8ecff', 2, -0.01);
        ringFx(f.x, f.y - 6, f.d.boss ? 90 : 26, f.d.boss ? '#ffe9a8' : '#ffffff');
        coins(f.x, f.y, f.d.coin);
        if (!f.d.boss && Math.random() < 0.15) drop(f.x, f.y, 1, 3);
        if (f.d.boss || Math.random() < LOOT.foeDrop) dropGear(f.x, f.y, rollItem(zoneTier(), f.d.boss ? 1 : 0));
        if (Math.random() < (LOOT.oreDrop[f.t] || 0)) drop(f.x, f.y, 3, f.d.boss ? 3 : 1);
        addXp(f.d.xp);
        countKill(f.t);
        if (f.d.boss) bossDown(f);
    }
    function addXp(n) {
        S.xp += n;
        while (S.lvl < 12 && S.xp >= need(S.lvl)) {
            S.lvl++;
            for (const p of P) if (p.on) { p.hp = maxHp(p); p.down = false; burst(p.x, p.y - 10, 20, '#ffe66a', 2); ringFx(p.x, p.y - 8, 60, '#ffe66a'); }
            SND.fx('level'); toast(txt(T.ui.lvup, { n: S.lvl }));
        }
    }
    function hurt(p, dmg, sx, sy) {
        if (!p.on || p.inv > 0 || p.down || mode !== 'play') return;
        dmg = Math.max(1, Math.round(dmg * (1 - Math.min(0.6, p.st.def * 0.06))));
        p.hp = Math.max(0, p.hp - dmg); p.inv = 60; SND.fx('hurt'); shake = 6; freeze = 3;
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
        toast(T.ui.allDown);
        startFade(() => {
            S.coins = Math.floor(S.coins * 0.9);
            loadZone(Z.id);
            const sp = Z.def.spawn; placePlayers(sp[0], sp[1]);
            for (const p of P) { p.hp = maxHp(p); p.down = false; }
            save();
        });
    }

    function updPlayer(p) {
        if (p.inv > 0) p.inv--;
        if (p.atk > 0) p.atk--;
        if (p.swing > 0) p.swing--;
        if (p.lean > 0) p.lean--;
        if (p.flash > 0) p.flash--;
        if (p.down) {
            const other = P[1 - p.i];
            if (--p.downT <= 0 && other.on && !other.down) { p.down = false; p.hp = Math.ceil(maxHp(p) / 2); p.inv = 120; p.x = other.x; p.y = other.y; toast(txt(T.ui.revived, { name: heroName(p.i) })); }
            return;
        }
        const dx = (held(p, 'right') ? 1 : 0) - (held(p, 'left') ? 1 : 0);
        const dy = (held(p, 'down') ? 1 : 0) - (held(p, 'up') ? 1 : 0);
        p.moving = !!(dx || dy);
        // long press OK (without moving) opens the quick menu: journal, equipment, potions
        if (held(p, 'jump') && !p.moving) { if (++p.hold === 50) { p.hold = 0; quickMenu(); return; } } else p.hold = 0;
        if (p.moving) {
            const n = dx && dy ? 0.7071 : 1;
            p.ax = dx * n; p.ay = dy * n; p.fx = dx; p.fy = dy;
            const spd = (codeAt(p.x, p.y) === C_m ? 1.1 : 1.8) * (1 + p.st.spd) * (p.atk > p.st.cd - 8 ? 0.5 : 1);
            const ox = p.x, oy = p.y;
            moveEnt(p, dx * n * spd, dy * n * spd, 7, 4);
            p.walk += 0.22 * (1 + p.st.spd);
            if ((tick + p.i * 5) % 9 === 0) part(p.x - p.ax * 6, p.y, 1, -p.ax * 0.3, -p.ay * 0.2, 0.6, 22, Z.dust, 3, 0.02);
            if (P[1].on) {                                 // co-op: stay on the same screen
                const o = P[1 - p.i];
                if (o.on && !o.down && (Math.abs(p.x - o.x) > W - 70 || Math.abs(p.y - o.y) > H - 70)) { p.x = ox; p.y = oy; }
            }
        } else p.walk = 0;
        if (p.kx || p.ky) { moveEnt(p, p.kx, p.ky, 7, 4); p.kx *= 0.75; p.ky *= 0.75; if (Math.abs(p.kx) + Math.abs(p.ky) < 0.1) p.kx = p.ky = 0; }
        p.sy = p.y;
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
            if (dd < 14) {
                d.on = false;
                if (d.k === 0) { S.coins += d.v + (p.st.gold && Math.random() * 100 < p.st.gold ? 1 : 0); SND.fx('coin'); part(d.x, d.y, 6, 0, 0, 1.2, 16, '#ffe66a', 2, 0); }
                else if (d.k === 1) { p.hp = Math.min(maxHp(p), p.hp + d.v); SND.fx('heal'); }
                else if (d.k === 2) { const it = d.it; d.it = null; addToBag(it); burst(d.x, d.y - 6, 14, LOOT.colors[it.r], 1.5); }
                else { S.iron += d.v; SND.fx('pick'); toast(txt(T.ui.gotIron, { n: d.v })); }
            }
        }
        for (const e of Z.def.exits) {
            if (p.x >= e.x * TS && p.x < (e.x + e.w) * TS && p.y >= e.y * TS && p.y < (e.y + e.h) * TS) { changeZone(e.to, e.tx, e.ty); return; }
        }
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
        switch (f.t) {
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
                    for (const q of P) if (q.on && !q.down && !(f.mask & (1 << q.i)) && Math.abs(dist(q.x, q.y, f.x, f.y) - f.ring) < 12) { f.mask |= 1 << q.i; hurt(q, f.d.dmg, f.x, f.y); }
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
        if (f.alpha > 0.5) for (const q of P) if (q.on && !q.down && dist(q.x, q.y, f.x, f.y) < f.r + 8) hurt(q, f.d.dmg, f.x, f.y);
        f.sy = f.y;
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
            if (--s.life <= 0 || (c !== C_tilde && c !== C_w && solidAt(s.x, s.y))) { s.on = false; burst(s.x, s.y, 3, s.k === 2 ? '#8a8fb8' : s.k === 11 ? '#ffd76a' : '#6a5a40', 1); continue; }
            if (s.k === 11 && (tick & 1)) part(s.x, s.y, 10, 0, 0, 0, 10, '#ffe9a8', 2, 0);
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
            } else for (const q of P) if (q.on && !q.down && dist(q.x, q.y - 8, s.x, s.y) < s.r + 7) { hurt(q, s.dmg, s.x - s.vx * 4, s.y - s.vy * 4); s.on = false; break; }
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

    /* ------------------------------------------------------------------ update */

    function update() {
        tick++;
        if (toastT > 0 && --toastT === 0) $('toast').className = '';
        if (bannerT > 0 && --bannerT === 0) $('banner').className = '';
        if (shake > 0) shake--;
        if (flashT > 0) flashT--;
        fogOff += 0.25;
        if (freeze > 0) { freeze--; updParts(); return; }     // a short hit-pause makes blows land
        if (mode === 'fade') updFade();
        else if (mode === 'play') {
            S.time += 1 / 60;
            for (const p of P) if (p.on) updPlayer(p);
            if (mode === 'play') {
                for (const f of FOES) if (f.on) updFoe(f);
                updShots();
                if (Z.id === 'isle' && S.stage === 13 && S.seal) {
                    for (const p of P) if (p.on && p.y < 8.2 * TS) {
                        say(lines('corvin', 'corvin13'), null, () => { advance(14); boss = spawnFoe('shade', 20 * TS, 4.5 * TS, false); burst(20 * TS, 4.5 * TS, 30, '#3a3d58', 3); });
                        break;
                    }
                }
            }
            for (const n of Z.npcs) { n.sy = n.id === 'corvin' && S.stage === 14 ? 2.3 * TS : n.y; n.walk += 0.1; }
            hud();
        } else if (mode === 'overlay' && OV.kind === 'menu') { camX += 0.15; }
        updParts();
        if (mode !== 'overlay' || OV.kind !== 'menu') follow(false);
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
        for (let i = 1; i < dlN; i++) { const v = DL[i], k = v.sy; let j = i - 1; while (j >= 0 && DL[j].sy > k) { DL[j + 1] = DL[j]; j--; } DL[j + 1] = v; }
        const mi = ART.misc();
        for (let i = 0; i < dlN; i++) {
            const o = DL[i];
            if (o.kind === 1) {
                if (o.k === 'lantern') ctx.drawImage(S && S.lit ? mi.lanternOn : mi.lanternOff, o.dx - cx, o.dy - cy, o.dw, o.dh);
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
        }
        drawShots(cx, cy);
        for (const p of PARTS) { if (!p.on) continue; ctx.globalAlpha = Math.min(1, p.life / p.max * 2); ctx.fillStyle = p.col; ctx.fillRect(p.x - cx, p.y - p.z - cy, p.sz, p.sz); }
        ctx.globalAlpha = 1;
        if (Z.lantern && S && S.lit) { const g = 300 + Math.sin(tick * 0.05) * 10; ctx.globalAlpha = 0.6; ctx.drawImage(mi.glow, Z.lantern.cx - g / 2 - cx, Z.lantern.cy - 120 - g / 2 - cy, g, g); ctx.globalAlpha = 1; }
        if (Z.def.dark) drawDark(cx, cy, mi);
        else {
            const fog = S && !S.lit ? (Z.id === 'village' ? 0.22 : 0.3) - embers() * 0.04 : 0;
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
        if (mode === 'play' || mode === 'dialog') drawGuide(cx, cy);
        if (vignette && tier !== 'low') ctx.drawImage(vignette, 0, 0);
        if (flashT > 0) { ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
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
        for (const s of SHOTS) if (s.on && s.k === 11) dctx.drawImage(mi.light, s.x - cx - 40, s.y - cy - 40, 80, 80);
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
        if (id === 'biscuit') { drawDog(x, y, n.walk); }
        else {
            const look = LOOK[id];
            if (id === 'lira') y -= 6 + Math.sin(tick * 0.05) * 3;
            if (look.glow) ctx.drawImage(ART.misc().blueGlow, x - 28, y - 44, 56, 56);
            ART.human(ctx, x, y, look, n.fx, n.fy, 0, false);
            if (id === 'maren') { ctx.fillStyle = '#6b4a2e'; ctx.fillRect(x + 9, y - 30, 2, 30); ctx.fillStyle = '#ffd76a'; ctx.fillRect(x + 7, y - 33, 6, 5); }
            if (id === 'bram') { ctx.fillStyle = '#6b4a2e'; ctx.fillRect(x - 13, y - 22, 2, 16); ctx.fillStyle = '#b8bcc4'; ctx.fillRect(x - 17, y - 24, 6, 5); }
            if (id === 'tobin') { ctx.fillStyle = '#4a4a52'; ctx.fillRect(x + 10, y - 26, 3, 14); ctx.fillRect(x + 7, y - 28, 9, 5); }
            if (id === 'corvin' && S.stage < 15) { ctx.fillStyle = '#5b5bd6'; ctx.fillRect(x + 9, y - 22, 5, 7); }
        }
        // markers: yellow ! for the story, green ! for a side quest, ? for a quest to hand in
        const s = id === 'biscuit' ? 0.6 : (LOOK[id] && LOOK[id].s) || 1;
        const by = y - 44 * s + Math.sin(tick * 0.1 + n.bob) * 2;
        const ready = !!qReady(n.id), side = !!qOffer(n.id);
        if (news(n.id) || ready || side) {
            ctx.fillStyle = '#000'; ctx.fillRect(x - 5, by - 14, 11, 20);
            ctx.fillStyle = news(n.id) ? '#ffd23f' : ready ? '#7ef0a0' : '#5ad07a';
            if (ready && !news(n.id)) { ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', x, by + 4); }
            else { ctx.fillRect(x - 3, by - 12, 7, 11); ctx.fillRect(x - 3, by + 1, 7, 3); }
        } else if (TALKER[n.id] && npcTalkable(n.id) && dist(P[0].x, P[0].y, n.x, n.y) < 70) {
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
    function npcTalkable(id) { return id !== 'corvin' || S.stage >= 15; }
    function news(id) {
        const st = S.stage;
        if (id === 'maren') return st === 0 || st === 5 || st === 9 || st === 12 || st === 15;
        if (id === 'tobin') return st === 1 || (st === 2 && S.ore >= 3) || st === 10;
        if (id === 'sela') return st === 6 || (st === 7 && S.caps >= 3);
        return false;
    }

    function drawPlayer(p, cx, cy) {
        const x = p.x - cx, y = p.y - cy;
        if (p.down) {
            ctx.globalAlpha = 0.5; ctx.fillStyle = HERO[p.i].cloak; ctx.fillRect(x - 10, y - 6, 20, 7); ctx.globalAlpha = 1;
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(NUM[Math.ceil(p.downT / 60)], x, y - 14);
            return;
        }
        if (p.inv > 0 && (p.inv & 4)) ctx.globalAlpha = 0.45;
        const lean = p.lean / 8, back = p.ay < 0;
        if (back) drawWeapon(p, x, y);
        ART.human(ctx, x, y, HERO[p.i], p.fx, p.fy, p.walk, false, p.gear, lean);
        if (!back) drawWeapon(p, x, y);
        ctx.globalAlpha = 1;
        if (P[1].on) {
            ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
            ctx.fillStyle = '#000'; ctx.fillText(p.i ? '2P' : '1P', x + 1, y - 39);
            ctx.fillStyle = p.i ? '#ffb38a' : '#8af0e0'; ctx.fillText(p.i ? '2P' : '1P', x, y - 40);
        }
    }
    function drawWeapon(p, x, y) {
        const st = p.st, ax = p.ax, ay = p.ay, hx = x + ax * 9, hy = y - 13 + ay * 3;
        if (st.kind === 'sword') {
            if (p.swing > 0) {                              // slash: a bright arc with a fading trail
                const a = Math.atan2(ay, ax), t = p.swing / 12, from = a - 1.4, to = a - 1.4 + (1 - t) * 2.8 + 0.2;
                for (let k = 0; k < 3; k++) {
                    ctx.globalAlpha = t * (0.9 - k * 0.28); ctx.strokeStyle = k === 0 ? '#ffffff' : st.col; ctx.lineWidth = 6 - k * 1.5;
                    ctx.beginPath(); ctx.arc(x, y - 10, 20 + k * 3, from + k * 0.15, to); ctx.stroke();
                }
                ctx.globalAlpha = 1;
                const ba = to; ctx.strokeStyle = st.col; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(x + Math.cos(ba) * 6, y - 10 + Math.sin(ba) * 6); ctx.lineTo(x + Math.cos(ba) * 22, y - 10 + Math.sin(ba) * 22); ctx.stroke();
                return;
            }
            ctx.fillStyle = st.col2; ctx.fillRect(hx - 1.5, hy - 1.5, 3, 3);
            ctx.fillStyle = st.col;
            if (ax !== 0 && Math.abs(ax) >= Math.abs(ay)) ctx.fillRect(hx - (ax < 0 ? 13 : 0), hy - 1, 13, 3);
            else ctx.fillRect(hx - 1, hy - (ay < 0 ? 13 : 0), 3, 13);
        } else if (st.kind === 'bow') {
            const a = Math.atan2(ay, ax), pull = p.swing > 6 ? (12 - p.swing) * 0.6 : 0;
            ctx.strokeStyle = st.col; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(hx - ax * 3, hy - ay * 3, 9, a - 1.2, a + 1.2); ctx.stroke();
            ctx.strokeStyle = st.col2; ctx.lineWidth = 1;
            const ex1 = hx - ax * 3 + Math.cos(a - 1.2) * 9, ey1 = hy - ay * 3 + Math.sin(a - 1.2) * 9, ex2 = hx - ax * 3 + Math.cos(a + 1.2) * 9, ey2 = hy - ay * 3 + Math.sin(a + 1.2) * 9;
            ctx.beginPath(); ctx.moveTo(ex1, ey1); ctx.lineTo(hx - ax * (3 + pull), hy - ay * (3 + pull)); ctx.lineTo(ex2, ey2); ctx.stroke();
        } else {
            const rec = p.atk > st.cd - 8 ? 3 : 0, bx = hx - ax * rec, by = hy - ay * rec;
            ctx.strokeStyle = st.col2; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx - ax * 4, by - ay * 4 + 2); ctx.lineTo(bx + ax * 2, by + ay * 2); ctx.stroke();
            ctx.strokeStyle = st.col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + ax * 14, by + ay * 14); ctx.stroke();
            if (p.flash > 0) { const s = 14 + p.flash * 3; ctx.drawImage(ART.misc().flash, bx + ax * 18 - s / 2, by + ay * 18 - s / 2, s, s); }
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
            ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 2;
            if (sl === 'weapon') { ctx.beginPath(); ctx.moveTo(x - 5, y + 1 + b); ctx.lineTo(x + 5, y - 9 + b); ctx.stroke(); ctx.fillRect(x - 5, y - 2 + b, 4, 2); }
            else if (sl === 'head') { ctx.beginPath(); ctx.arc(x, y - 2 + b, 5, Math.PI, 0); ctx.fill(); }
            else if (sl === 'body') ctx.fillRect(x - 4, y - 9 + b, 8, 9);
            else { ctx.fillRect(x - 4, y - 9 + b, 3, 8); ctx.fillRect(x - 4, y - 2 + b, 7, 3); }
            return;
        }
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
        const x = f.x - cx, y = f.y - cy, w = f.hurt > 0 && (f.hurt & 2);
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
    function nearestDir(f) { const p = nearest(f.x, f.y); return p && p.x < f.x ? -1 : 1; }

    /* ------------------------------------------------------------------ the guide arrow */

    // where the story wants you, in which zone
    function target() {
        const st = S.stage;
        let z = '', x = 0, y = 0;
        if (st === 0 || st === 5 || st === 9 || st === 12 || st === 15) { z = 'village'; x = 24.5; y = 5.2; }
        else if (st === 1 || st === 10 || (st === 2 && S.ore >= 3)) { z = 'village'; x = 5; y = 12.6; }
        else if (st === 2) { z = 'greywood'; const o = nearestPick('greywood', 'o'); if (!o) return false; x = o[0]; y = o[1]; }
        else if (st === 4) { z = 'greywood'; x = 35; y = 9; }
        else if (st === 6 || (st === 7 && S.caps >= 3)) { z = 'mireshore'; x = 23.5; y = 15.2; }
        else if (st === 7) { z = 'mireshore'; const o = nearestPick('mireshore', 'c'); if (!o) return false; x = o[0]; y = o[1]; }
        else if (st === 8) { z = 'isle'; x = 20; y = 13; }
        else if (st === 11) { z = 'mine'; x = 20; y = 5; }
        else if (st === 13) { z = 'isle'; x = 20; y = S.seal ? 5 : 8.6; }
        else if (st === 14) { z = 'isle'; x = 20; y = 4.5; }
        else if (st === 16) { z = 'village'; x = 22; y = 4.6; }
        else return false;
        if (z !== Z.id) return hop(z);
        GT.x = x * TS; GT.y = y * TS; return true;
    }
    // the next doorway on the way to zone z: down from the village hub, or back up toward it
    function hop(z) {
        let k = z, next = '';
        while (k && k !== Z.id) { if (PARENT[k] === Z.id) { next = k; break; } k = PARENT[k]; }
        if (!next) next = PARENT[Z.id] || 'village';
        if (Z.id === 'isle') { const b = Z.boats[0]; GT.x = b.cx; GT.y = b.cy; return true; }
        if (Z.id === 'mireshore' && next === 'isle') { GT.x = 23.5 * TS; GT.y = 15.2 * TS; return true; }
        if (Z.id === 'village' && next === 'quarry' && !S.gate) { GT.x = 9 * TS; GT.y = 1.5 * TS; return true; }
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
        if (!pressed || !started) return;
        if (P[0].dev === '') P[0].dev = dev;
        if (dev !== P[0].dev && !repeat) joinSeen = true;
        if (tick < lockUntil && (a === 'confirm' || a === 'jump')) return;
        if (mode === 'overlay') { if (a !== 'jump') ovInput(a); return; }
        if (mode === 'dialog') { if (a !== 'jump') dlgInput(a); return; }
        if (mode !== 'play' || repeat) return;
        if (a === 'jump') {
            if (dev === P[0].dev || !P[1].on && dev === 'keys') act(P[0]);
            else if (P[1].on && dev === P[1].dev) act(P[1]);
            else if (!P[1].on) join(dev);
        }
    }

    // test hook for development only: open index.html?debug
    if (/[?&]debug\b/.test(location.search)) window.__HM = { get S() { return S; }, P, Z, FOES, get mode() { return mode; }, get boss() { return boss; },
        talk, act, changeZone, loadZone, placePlayers, update, recalcAll, giveItem, objective: () => objective(L), target: () => target() && GT };

    /* ------------------------------------------------------------------ lifecycle */

    MyPC.init({
        onInit: function (i) {
            info = i; L = TEXT[i.lang] ? i.lang : 'en'; T = TEXT[L]; tier = (i.quality && i.quality.tier) || 'high';
            document.documentElement.lang = L;
            VOICE.setLang(L);
            document.title = T.ui.title + ': ' + T.ui.sub;
            canvas = $('c'); ctx = canvas.getContext('2d', { alpha: false });
            resize(); window.addEventListener('resize', resize);
            vignette = ART.vignette(W, H);
            darkC = document.createElement('canvas'); darkC.width = W; darkC.height = H; dctx = darkC.getContext('2d');
            $('questLbl').textContent = T.ui.quest;
            $('join').textContent = T.ui.p2join;
            $('hint').textContent = T.ui.holdOk;
            $('dai').textContent = '✦ ' + T.ui.ai;
            $('pn0').textContent = T.ui.hero1; $('pn1').textContent = T.ui.hero2;
            MyPC.progress(0.3);
            ['grass', 'forest', 'mire', 'stone', 'crypt', 'mine'].forEach(t => ART.sprites(t));
            ART.misc();
            MyPC.progress(0.8);
            S = fresh();
            const saved = MyPC.load('save', null);
            if (saved) S = migrate(Object.assign(fresh(), saved));
            recalcAll();
            loadZone('village'); camX = 0; camY = 0;
            refreshMenu();
            MyPC.progress(1);
            MyPC.ready();
        },
        onStart: function () {
            started = true;
            SND.start(info.volume);
            for (let k = 0; k < 9; k++) SND.prepare(k);
            music();
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
        onMenu: function (id) {
            if (!S || (mode !== 'play' && mode !== 'dialog')) return;
            if (mode === 'dialog' && (id === 'journal' || id === 'equip')) closeDlg();
            if (id === 'journal') showJournal();
            else if (id === 'equip') equipScreen();
            else if (id === 'potion') drink(false);
            else if (id === 'big') drink(true);
            else if (id === 'leave2' && P[1].on) leave2();
        },
        onVolume: function (v) { SND.setVolume(v); }
    });
})();
