/* Hollowmere: The Lantern Road. A 2.5D action RPG for My PC, for 1 or 2 players.
 * One rAF loop, fixed 60 Hz update, pools for foes / shots / particles / drops,
 * input only through the My PC SDK. */
(function () {
    'use strict';
    const W = 640, H = 360, TS = 32, STEP = 1000 / 60;
    const ART = window.HM_ART, SND = window.HM_AUDIO, VOICE = window.HM_VOICE, AI = window.HM_AI, MAPS = window.HM_MAPS, TEXT = window.HM_TEXT;
    const $ = id => document.getElementById(id);

    let info = null, T = TEXT.en, L = 'en', tier = 'high';
    let canvas, ctx, raf = 0, last = 0, acc = 0, tick = 0, lockUntil = 0, started = false;
    let mode = 'boot';           // title, intro, play, dialog, overlay, ending, fade
    let S = null;                // the saved game
    let camX = 0, camY = 0, fogOff = 0, shake = 0;

    /* ------------------------------------------------------------------ data */

    const NAME = { maren: 'Maren', tobin: 'Tobin', sela: 'Sela', corvin: 'Corvin', lira: 'Lira', hana: 'Hana', pip: 'Pip', bram: 'Bram', odo: 'Odo' };
    const NAME_AR = { maren: 'مارين', tobin: 'توبين', sela: 'سيلا', corvin: 'كورفين', lira: 'ليرا', hana: 'هانا', pip: 'بيب', bram: 'برام', odo: 'أودو' };
    const LOOK = {
        maren: { cloak: '#6d5a8a', trim: '#d9c27a', skin: '#e8c4a0', hair: '#e6e6ea', style: 1, s: 1 },
        tobin: { cloak: '#6b4a32', trim: '#2f2f33', skin: '#c98e66', hair: '#3a2a1e', style: 2, s: 1.2 },
        sela: { cloak: '#2f5f7a', trim: '#9fd6ff', skin: '#d4a984', hair: '#2a2a2e', style: 3, s: 1 },
        corvin: { cloak: '#2a2a38', trim: '#5b5bd6', skin: '#d8c0a8', hair: '#151518', style: 0, s: 1.05 },
        lira: { cloak: '#bfe6ff', trim: '#ffffff', skin: '#eaf6ff', hair: '#d9ecff', style: 1, s: 0.85, glow: true },
        hana: { cloak: '#3f8a5a', trim: '#f2d14a', skin: '#e2b48c', hair: '#7a3a22', style: 1, s: 1 },
        pip: { cloak: '#d86a3a', trim: '', skin: '#f0c8a0', hair: '#5a3a1e', style: 0, s: 0.72 },
        bram: { cloak: '#a8322e', trim: '#3a2a1e', skin: '#d09a74', hair: '#6a4a2a', style: 0, s: 1.1 },
        odo: { cloak: '#7a7f8a', trim: '#c9a43a', skin: '#c48c64', hair: '#5a5f6a', style: 3, s: 1.1 }
    };
    const HERO = [
        { cloak: '#2a9d8f', trim: '#f4d35e', skin: '#e9c39b', hair: '#2b1d14', style: 0, s: 1 },
        { cloak: '#e76f51', trim: '#f4d35e', skin: '#d9a77c', hair: '#c0582e', style: 1, s: 1 }
    ];
    const AI_NPC = { maren: 1, tobin: 1, sela: 1, corvin: 1 };
    const FOE = {
        wisp:      { hp: 2,  dmg: 1, spd: 0.9, r: 9,  xp: 2,  coin: 1 },
        wolf:      { hp: 4,  dmg: 2, spd: 1.1, r: 11, xp: 4,  coin: 2 },
        crawler:   { hp: 5,  dmg: 2, spd: 0.7, r: 11, xp: 5,  coin: 2 },
        mite:      { hp: 7,  dmg: 3, spd: 1.0, r: 11, xp: 7,  coin: 3 },
        thornback: { hp: 40, dmg: 3, spd: 0.6, r: 20, xp: 30, coin: 20, boss: 1 },
        warden:    { hp: 56, dmg: 3, spd: 0.55, r: 22, xp: 45, coin: 25, boss: 1 },
        sentinel:  { hp: 60, dmg: 3, spd: 0.5, r: 22, xp: 60, coin: 30, boss: 1 },
        shade:     { hp: 84, dmg: 3, spd: 0, r: 18, xp: 80, coin: 40, boss: 1 }
    };
    const SHADE_PTS = [[20, 4.5], [15, 3.5], [25, 3.5], [15.5, 6.5], [24.5, 6.5]];
    const NUM = []; for (let i = 0; i < 100; i++) NUM.push(String(i));

    function fresh() {
        return { v: 1, stage: 0, ore: 0, caps: 0, sword: false, key: false, gate: false, seal: false, hearth: false, tide: false, stone: false,
                 heart: false, page: false, lit: false, picked: {}, cut: false, coins: 0, potions: 1, xp: 0, lvl: 1,
                 zone: 'village', x: 21.5, y: 10.5, kills: 0, time: 0, scored: false };
    }
    function save() { MyPC.save('save', S); }
    function txt(s, vars) { return vars ? s.replace(/\{(\w+)\}/g, (m, k) => vars[k] !== undefined ? vars[k] : m) : s; }
    function npcName(id) { return L === 'ar' ? NAME_AR[id] : NAME[id]; }
    function heroName(i) { return i ? T.ui.hero2 : T.ui.hero1; }
    function maxHp() { return 10 + 3 * (S.lvl - 1); }
    function power() { return (S.sword ? 3 : 1) + ((S.lvl - 1) >> 1); }
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
        down: false, downT: 0, walk: 0, kx: 0, ky: 0, hold: 0, moving: false, r: 7, sy: 0, kind: 3 }));
    const FOES = []; for (let i = 0; i < 32; i++) FOES.push({ on: false, kind: 4, t: '', d: null, x: 0, y: 0, hx: 0, hy: 0, hp: 0, max: 0, st: 0, tm: 0, cd: 0,
        vx: 0, vy: 0, kx: 0, ky: 0, hurt: 0, r: 10, sy: 0, active: false, minion: false, mask: 0, ring: 0, alpha: 1, wt: 0, sum: 0, pt: 0, walk: 0, side: 0, sdx: 0, sdy: 0 });
    const SHOTS = []; for (let i = 0; i < 48; i++) SHOTS.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, dmg: 0, r: 5, k: 0 });
    const PARTS = []; for (let i = 0; i < 220; i++) PARTS.push({ on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, max: 1, col: '#fff', sz: 2 });
    const DROPS = []; for (let i = 0; i < 20; i++) DROPS.push({ on: false, kind: 5, k: 0, x: 0, y: 0, z: 0, vz: 0, t: 0, v: 0, sy: 0 });
    const FLOATS = []; for (let i = 0; i < 24; i++) FLOATS.push({ on: false, x: 0, y: 0, t: 0, s: '', col: '#fff' });
    const DL = new Array(1600); let dlN = 0;
    let boss = null;

    /* ------------------------------------------------------------------ zone */

    const SOLID = new Uint8Array(128);
    '#T~rfbgS'.split('').forEach(c => { SOLID[c.charCodeAt(0)] = 1; });
    const Z = { id: '', def: null, cols: 0, rows: 0, tiles: null, block: null, ground: null, theme: 'grass', rs: [], npcs: [], statics: [], lantern: null, boats: [], chapel: false };

    function ch(tx, ty) { return String.fromCharCode(Z.tiles[ty * Z.cols + tx]); }
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
    const C_b = 98, C_g = 103, C_S = 83, C_m = 109, C_w = 119, C_tilde = 126;

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
        Z.theme = def.ground === 'mire' ? 'mire' : def.ground;
        Z.tiles = new Uint8Array(Z.cols * Z.rows); Z.block = new Uint8Array(Z.cols * Z.rows);
        for (let y = 0; y < Z.rows; y++) for (let x = 0; x < Z.cols; x++) {
            let c = def.rows[y][x];
            if (c === 'b' && S.cut) c = '.';
            if (c === 'g' && S.gate) c = '=';
            if (c === 'S' && S.seal) c = 'x';
            Z.tiles[y * Z.cols + x] = c.charCodeAt(0);
        }
        Z.rs = []; for (let y = 0; y < Z.rows; y++) Z.rs.push([]);
        Z.statics = []; Z.picks = []; Z.npcs = []; Z.boats = []; Z.lantern = null;
        const sp = ART.sprites(Z.theme), mi = ART.misc();
        for (const p of def.props) {
            if (p.w) for (let y = p.y; y < p.y + p.h; y++) for (let x = p.x; x < p.x + p.w; x++) Z.block[y * Z.cols + x] = 1;
            if (p.k === 'lantern') Z.lantern = addStatic('lantern', mi.lanternOff, p.x * TS, (p.y + p.h) * TS - 150, (p.y + p.h) * TS, 64, 150, { cx: (p.x + 1) * TS, cy: (p.y + p.h) * TS });
            else if (p.k === 'boat') Z.boats.push(addStatic('boat', mi.boat, p.x * TS - 28, p.y * TS - 14, p.y * TS + 10, 56, 28, { cx: p.x * TS, cy: p.y * TS }));
            else if (p.k === 'bell') { Z.block[Math.floor(p.y) * Z.cols + Math.floor(p.x)] = 1; addStatic('bell', mi.bell, p.x * TS - 22, p.y * TS - 56, p.y * TS + 8, 44, 64); }
            else if (p.k === 'statue') { Z.block[Math.floor(p.y) * Z.cols + Math.floor(p.x)] = 1; addStatic('statue', mi.statue, p.x * TS - 15, p.y * TS - 48, p.y * TS + 8, 30, 56); }
            else { const img = ART.building(p.k, p.w, p.h); addStatic(p.k, img, p.x * TS, p.y * TS - 40, (p.y + p.h) * TS, p.w * TS, p.h * TS + 40); }
        }
        for (let ty = 0; ty < Z.rows; ty++) for (let tx = 0; tx < Z.cols; tx++) {
            const c = def.rows[ty][tx], px = tx * TS, py = ty * TS, key = id + ':' + tx + ',' + ty;
            if (c === 'T') addStatic('tree', sp.tree[(ART.hash(tx, ty, 9) * 3) | 0], px - 10 + ((ART.hash(tx, ty, 2) * 6) | 0), py - 42, py + 30, 52, 72);
            else if (c === '#') { const below = ty + 1 < Z.rows ? def.rows[ty + 1][tx] : '#'; addStatic('cliff', sp.cliff[below === '#' ? 0 : 1], px, py - 16, py + TS, 32, 48); }
            else if (c === 'r') addStatic('rock', sp.rock, px, py, py + 28, 32, 30);
            else if (c === 'b') { if (!S.cut) addStatic('bramble', sp.bramble, px - 1, py - 12, py + TS, 34, 44, { tx, ty }); }
            else if (c === 'g') { if (!S.gate) addStatic('gate', sp.gate, px, py - 16, py + TS, 32, 48, { tx, ty }); }
            else if (c === 'S') { if (!S.seal) addStatic('seal', sp.seal, px, py - 16, py + TS, 32, 48, { tx, ty }); }
            else if (c === 'o' && !S.picked[key]) Z.picks.push(addStatic('ore', sp.ore, px + 3, py + 8, py + 28, 26, 22, { key, cx: px + 16, cy: py + 20 }));
            else if (c === 'c' && !S.picked[key]) Z.picks.push(addStatic('cap', sp.cap, px + 6, py + 8, py + 28, 20, 22, { key, cx: px + 16, cy: py + 20 }));
        }
        for (const n of def.npcs) Z.npcs.push({ id: n.id, x: n.x * TS, y: n.y * TS, hx: n.x * TS, hy: n.y * TS, kind: 2, sy: n.y * TS, walk: 0, fx: 0, fy: 1, bob: ART.hash(n.x, n.y, 4) * 6 });
        Z.ground = ART.ground({ cols: Z.cols, rows: Z.rows, ch: (x, y) => def.rows[y][x] }, Z.theme);
        // foes
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
            f.alpha = 1; f.wt = 0; f.sum = 0; f.pt = 0; f.side = 0; f.active = !d.boss; f.walk = 0; f.sy = y;
            return f;
        }
        return null;
    }
    function part(x, y, z, vx, vy, vz, life, col, sz) {
        if (tier === 'low' && (tick & 1)) return;
        for (const p of PARTS) if (!p.on) { p.on = true; p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz; p.life = p.max = life; p.col = col; p.sz = sz; return; }
    }
    function burst(x, y, n, col, spd) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = spd * (0.4 + Math.random()); part(x, y, 6, Math.cos(a) * s, Math.sin(a) * s * 0.6, 1 + Math.random() * 2, 30 + Math.random() * 20, col, 2 + Math.random() * 2); } }
    function floater(x, y, n, col) { for (const f of FLOATS) if (!f.on) { f.on = true; f.x = x; f.y = y; f.t = 50; f.s = NUM[Math.min(99, n)]; f.col = col; return; } }
    function drop(x, y, k, v) { for (const d of DROPS) if (!d.on) { d.on = true; d.k = k; d.v = v; d.x = x + (Math.random() - 0.5) * 16; d.y = y + (Math.random() - 0.5) * 10; d.z = 4; d.vz = 2.5; d.t = 600; return; } }
    function shot(x, y, vx, vy, dmg, r, k) { for (const s of SHOTS) if (!s.on) { s.on = true; s.x = x; s.y = y; s.vx = vx; s.vy = vy; s.dmg = dmg; s.r = r; s.k = k; s.life = 240; return; } }
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

    const hudLast = { hp0: -1, hp1: -1, on1: null, max: -1, boss: -1, coins: -1, pot: -1, lvl: -1, obj: '', em: -1, join: null, hint: '' };
    let toastT = 0, bannerT = 0, joinSeen = false, aiNoticeShown = false;

    function toast(s) { const t = $('toast'); t.textContent = s; t.className = 'show'; toastT = 170; MyPC.announce(s); }
    function banner(s) { const b = $('banner'); b.textContent = s; b.className = 'show'; bannerT = 140; }

    function hud() {
        if (!S) return;
        const o = objective(L);
        if (o !== hudLast.obj) { hudLast.obj = o; $('questTxt').textContent = o; }
        const em = (S.hearth ? 1 : 0) | (S.tide ? 2 : 0) | (S.stone ? 4 : 0) | (S.heart ? 8 : 0);
        if (em !== hudLast.em) { hudLast.em = em; $('em0').className = 'em r' + (S.hearth ? ' on' : ''); $('em1').className = 'em b' + (S.tide ? ' on' : ''); $('em2').className = 'em s' + (S.stone ? ' on' : ''); $('em3').className = 'em h' + (S.heart && !S.lit ? ' on' : ' off'); }
        if (S.coins !== hudLast.coins) { hudLast.coins = S.coins; $('stCoins').textContent = '● ' + S.coins; }
        if (S.potions !== hudLast.pot) { hudLast.pot = S.potions; $('stPot').textContent = '♥ ' + S.potions; refreshMenu(); }
        if (S.lvl !== hudLast.lvl) { hudLast.lvl = S.lvl; $('stLv').textContent = T.ui.lv + ' ' + S.lvl; }
        const mh = maxHp();
        if (P[0].hp !== hudLast.hp0 || mh !== hudLast.max) { hudLast.hp0 = P[0].hp; $('hp0').style.width = (100 * P[0].hp / mh) + '%'; }
        if (P[1].hp !== hudLast.hp1 || mh !== hudLast.max) { hudLast.hp1 = P[1].hp; $('hp1').style.width = (100 * P[1].hp / mh) + '%'; }
        hudLast.max = mh;
        if (P[1].on !== hudLast.on1) { hudLast.on1 = P[1].on; $('pb1').style.display = P[1].on ? '' : 'none'; refreshMenu(); }
        const j = joinSeen && !P[1].on;
        if (j !== hudLast.join) { hudLast.join = j; $('join').style.display = j ? '' : 'none'; }
        if (boss && boss.active && boss.on) {
            if (boss.hp !== hudLast.boss) { hudLast.boss = boss.hp; $('bossFill').style.width = (100 * Math.max(0, boss.hp) / boss.max) + '%'; }
        }
    }
    function showBoss(f) { $('bossName').textContent = T.boss[f.t]; $('bossBox').style.display = ''; hudLast.boss = -1; MyPC.announce(T.boss[f.t]); }
    function hideBoss() { $('bossBox').style.display = 'none'; }
    function setHud(on) { $('hud').style.display = on ? '' : 'none'; }

    let menuKey = '';
    function refreshMenu() {
        if (!S) return;
        const items = [{ id: 'journal', label: T.ui.mJournal }, { id: 'potion', label: txt(T.ui.mPotion, { n: S.potions }) }];
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
    // pages: [[who, text], ...]; choices on the last page (optional); after: called when closed
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
            D.choices.forEach((c, i) => { const el = document.createElement('div'); el.className = 'ch' + (i === D.sel ? ' sel' : ''); el.textContent = c.label; box.appendChild(el); });
        }
        if (!D.wait) {
            MyPC.announce((who ? $('dname').textContent + ': ' : '') + pg[1] + (lastPage && D.choices ? '. ' + D.choices[D.sel].label : ''));
            if (pg[2] === 0) VOICE.stop(); else VOICE.say(pg[2] || null, pg[1], who);
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

    /* ------------------------------------------------------------------ AI chat */

    function defaultOpts(id) { return [T.ui.next, T.topic[id][0], T.ui.about]; }
    function chatChoices(id, opts) {
        const c = [];
        if (id === 'sela' && S.stage >= 8) c.push({ label: T.ui.ferry, fn: () => { closeDlg(); ferry('isle'); } });
        for (const o of opts) c.push({ label: o, fn: () => askNpc(id, o) });
        c.push({ label: T.ui.bye, fn: closeDlg });
        return c;
    }
    function canned(id, q) {          // [text, clip]
        if (q === T.ui.next) return [id === 'maren' ? txt(T.lines.marenIdle[0], { obj: objective(L) }) : objective(L), null];
        if (q === T.topic[id][0]) return [T.topic[id][1], 'topic-' + id + '-lore'];
        if (q === T.ui.about) return [T.topic[id][2], 'topic-' + id + '-about'];
        return [T.ui.aiErr, 0];
    }
    function askNpc(id, q) {
        D.pages = [[id, '« ' + q + ' »', 0]]; D.i = 0; D.wait = true; D.ai = false; renderDlg();
        const finish = (text, opts, fromAI, clip) => {
            D.pages = [[id, text, clip === undefined ? null : clip]]; D.i = 0; D.choices = chatChoices(id, opts); D.sel = 0; D.wait = false; D.ai = fromAI; renderDlg();
        };
        if (!AI.enabled()) {
            if (info.standalone && !aiNoticeShown) { aiNoticeShown = true; toast(T.ui.aiOff); }
            const c = canned(id, q);
            return finish(c[0], defaultOpts(id), false, c[1]);
        }
        const tok = ++askToken;
        const ctx2 = { stage: S.stage, lang: L, objective: objective('en'), heroes: P[1].on ? 'two young apprentices, Ash and Wren' : 'a young apprentice called Ash' };
        AI.ask(id, q, ctx2).then(r => {
            if (tok !== askToken || mode !== 'dialog') return;
            finish(r.reply, r.options.length ? r.options : defaultOpts(id), true);
        }).catch(() => {
            if (tok !== askToken || mode !== 'dialog') return;
            const c = canned(id, q);
            finish(c[0], defaultOpts(id), false, c[1]);
        });
    }

    /* ------------------------------------------------------------------ story */

    function advance(st) { if (S.stage < st) { S.stage = st; SND.fx('quest'); MyPC.announce(objective(L)); } save(); }

    function talk(id) {
        const st = S.stage;
        let pages = null;
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
                if (st === 1 && S.ore >= 3) { pages = lines('tobin', 'tobin1').slice(0, 1).concat(lines('tobin', 'tobin2b')); S.sword = true; advance(4); toast(T.ui.gotSword); }
                else if (st === 1) { pages = lines('tobin', 'tobin1'); advance(2); }
                else if (st === 2 && S.ore < 3) pages = lines('tobin', 'tobin2a', { n: S.ore });
                else if (st === 2) { pages = lines('tobin', 'tobin2b'); S.sword = true; advance(4); toast(T.ui.gotSword); }
                else if (st === 10) { pages = lines('tobin', 'tobin10'); S.key = true; advance(11); toast(T.ui.gotKey); }
                else pages = lines('tobin', 'tobinIdle');
                break;
            case 'sela':
                if (st === 6 && S.caps >= 3) { pages = lines('sela', 'sela6').slice(0, 1).concat(lines('sela', 'sela7b')); advance(8); }
                else if (st === 6) { pages = lines('sela', 'sela6'); advance(7); }
                else if (st === 7 && S.caps < 3) pages = lines('sela', 'sela7a', { n: S.caps });
                else if (st === 7) { pages = lines('sela', 'sela7b'); advance(8); }
                else pages = lines('sela', 'selaIdle');
                break;
            case 'corvin':
                if (st < 15) return;
                pages = lines('corvin', 'corvinIdle');
                break;
            case 'lira': return say(lines('lira', 'liraIdle'));
            case 'hana': return shop(lines('hana', 'hana'));
            case 'pip': return say(lines('pip', S.lit ? 'pipPost' : 'pip'));
            case 'bram': return say(lines('bram', S.hearth ? 'bramPost' : 'bram'));
            case 'odo': return say(lines('odo', S.key ? 'odoKey' : 'odo'));
        }
        if (!pages) return;
        say(pages, chatChoices(id, defaultOpts(id)));
    }

    function shop(pages) {
        const choices = [
            { label: T.ui.buy, fn: () => {
                if (S.coins < 10) { D.pages = [['hana', T.ui.poor, 0]]; }
                else { S.coins -= 10; S.potions++; save(); SND.fx('coin'); D.pages = [['hana', T.ui.bought, 0]]; }
                D.i = 0; renderDlg();
            } },
            { label: T.ui.leave, fn: closeDlg }
        ];
        say(pages, choices);
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
        for (const s of SHOTS) s.on = false;
        boss = null; music();
        if (f.t === 'thornback') { S.hearth = true; advance(5); say(lines(null, 'thornbackDown'), null, () => toast(txt(T.ui.gotEmber, { name: T.ui.hearth }))); }
        else if (f.t === 'warden') { S.tide = true; S.page = true; advance(9); say(lines(null, 'wardenDown').concat(lines(null, 'journalPage')), null, () => toast(txt(T.ui.gotEmber, { name: T.ui.tide }))); }
        else if (f.t === 'sentinel') { S.stone = true; advance(12); say(lines(null, 'sentinelDown'), null, () => toast(txt(T.ui.gotEmber, { name: T.ui.stone }))); }
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
                startEnding();
            });
        } else if (S.stage >= 17) say(lines(null, 'lanternOn'));
        else say(lines(null, 'lanternCold'));
    }

    function score() { return 1000 + S.kills * 10 + S.coins + S.lvl * 100 + Math.max(0, 3600 - Math.floor(S.time)); }

    /* ------------------------------------------------------------------ overlay screens */

    const OV = { kind: '', items: null, sel: 0, slides: null, i: 0, done: null };
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
        [['hearth', S.hearth, 'r'], ['tide', S.tide, 'b'], ['stone', S.stone, 's']].forEach(e => { const s = el('span', 'jem ' + e[2] + (e[1] ? ' on' : ''), (e[1] ? '◆ ' : '◇ ') + T.ui[e[0]]); em.appendChild(s); });
        box.appendChild(em);
        const m = Math.floor(S.time / 60), s = Math.floor(S.time % 60);
        box.appendChild(el('div', 'jrow', T.ui.level + ' ' + S.lvl + '  (' + S.xp + ' / ' + need(S.lvl) + ' XP)    ' + T.ui.coins + ' ' + S.coins + '    ' + T.ui.potions + ' ' + S.potions + '    ' + T.ui.time + ' ' + m + ':' + (s < 10 ? '0' : '') + s));
        if (S.page) box.appendChild(el('div', 'jpage', T.ui.page + ': ' + T.lines.journalPage[0]));
        box.appendChild(el('div', 'mi sel', T.ui.close));
        ovShow(box);
        MyPC.announce(T.ui.journal + '. ' + objective(L));
    }
    function quickMenu() {
        const c = [
            { label: T.ui.mJournal, fn: () => { closeDlg(); showJournal(); } },
            { label: txt(T.ui.mPotion, { n: S.potions }), fn: () => { closeDlg(); drink(); } }
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
    }
    function toPlay() { mode = 'play'; setHud(true); lockUntil = tick + 8; hudLast.obj = ''; hud(); }

    function newGame() {
        S = fresh(); AI.reset(); save();
        P[0].hp = P[1].hp = maxHp(); P[0].down = P[1].down = false;
        loadZone('village'); placePlayers(S.x, S.y); P[0].fx = 0; P[0].fy = -1;
        slides(T.intro, () => { toPlay(); banner(T.zone.village); }, '', T.intro.map((s, i) => 'intro-' + i));
    }
    function continueGame() {
        S = Object.assign(fresh(), MyPC.load('save', {}));
        P[0].hp = P[1].hp = maxHp(); P[0].down = P[1].down = false;
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

    function drink() {
        if (S.potions <= 0) return toast(T.ui.noPotion);
        let p = P[0];
        if (P[1].on && (P[0].down || (!P[1].down && P[1].hp < P[0].hp))) p = P[1];
        S.potions--; p.hp = Math.min(maxHp(), p.hp + 8); if (p.down) { p.down = false; p.inv = 90; }
        SND.fx('heal'); burst(p.x, p.y - 10, 12, '#ff7a9a', 1.5); toast(txt(T.ui.healed, { name: heroName(p.i) })); save();
    }
    function join(dev) {
        const p = P[1];
        p.on = true; p.dev = dev; p.hp = maxHp(); p.down = false; p.x = P[0].x; p.y = P[0].y; p.inv = 90;
        for (const o of [[18, 0], [-18, 0], [0, 18], [0, -18]]) if (!feetSolid(P[0].x + o[0], P[0].y + o[1])) { p.x = P[0].x + o[0]; p.y = P[0].y + o[1]; break; }
        toast(txt(T.ui.p2joined, { name: heroName(1) })); SND.fx('ok');
    }
    function leave2() { P[1].on = false; toast(txt(T.ui.p2left, { name: heroName(1) })); }

    function frontX(p, d) { return p.x + p.ax * d; }
    function frontY(p, d) { return p.y - 4 + p.ay * d; }

    function act(p) {
        if (p.down || p.atk > 0) return;
        const fx = frontX(p, 18), fy = frontY(p, 18);
        for (const n of Z.npcs) {
            if (!npcVisible(n.id) || (n.id === 'corvin' && S.stage < 15)) continue;
            if (dist(fx, fy, n.x, n.y - 6) < 28 || dist(p.x, p.y, n.x, n.y) < 36) { n.fx = Math.sign(p.x - n.x); n.fy = n.fx ? 0 : Math.sign(p.y - n.y); return talk(n.id); }
        }
        if (Z.lantern && dist(fx, fy, Z.lantern.cx, Z.lantern.cy) < 44) return useLantern();
        for (const b of Z.boats) if (dist(fx, fy, b.cx, b.cy) < 34) {
            if (Z.id === 'isle') return yesNo(null, T.lines.boatBack[0], () => ferry('shore'), 'boatBack-0');
            if (S.stage >= 8) return yesNo('sela', T.lines.selaFerry[0], () => ferry('isle'), 'selaFerry-0');
            return talk('sela');
        }
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
        attack(p);
    }
    function ahead(p, code) { for (let d = 12; d <= 28; d += 8) if (codeAt(frontX(p, d), frontY(p, d) + 4) === code) return true; return false; }
    function openTiles(code, to, k) {
        for (let i = 0; i < Z.tiles.length; i++) if (Z.tiles[i] === code) Z.tiles[i] = to;
        for (const s of Z.statics) if (s.k === k && s.on) { s.on = false; burst(s.dx + 16, s.dy + 40, 6, '#c9c4b8', 1.5); }
    }

    function attack(p) {
        p.atk = 20; p.swing = 12; SND.fx('swing');
        const hx = frontX(p, 16), hy = frontY(p, 16);
        for (const f of FOES) {
            if (!f.on || f.alpha < 0.5) continue;
            if (dist(hx, hy, f.x, f.y - 6) < f.r + 16) hitFoe(f, p);
        }
        // brambles
        if (ahead(p, C_b)) {
            if (S.sword) {
                S.cut = true; openTiles(C_b, 46, 'bramble'); SND.fx('cut');
                for (let i = 0; i < 20; i++) part(frontX(p, 30), frontY(p, 30), 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, Math.random() * 3, 40, '#4b5f2a', 3);
                save();
            } else if (toastT < 60) toast(T.ui.brambles);
        }
    }

    function hitFoe(f, p) {
        if (!f.active && f.d.boss) activate(f);
        let dmg = power();
        if (f.t === 'thornback' && f.st === 3) dmg *= 2;
        f.hp -= dmg; f.hurt = 8; SND.fx('hit');
        floater(f.x, f.y - 24, dmg, '#ffe66a');
        burst(f.x, f.y - 8, 5, '#ffffff', 1.5);
        if (!f.d.boss) { const d = dist(p.x, p.y, f.x, f.y) || 1; f.kx = (f.x - p.x) / d * 4; f.ky = (f.y - p.y) / d * 4; }
        if (f.hp <= 0) killFoe(f);
    }
    function killFoe(f) {
        f.on = false; S.kills++; SND.fx('die');
        burst(f.x, f.y - 8, f.d.boss ? 40 : 12, f.t === 'shade' || f.t === 'wisp' ? '#c9cfdc' : '#a08a6a', f.d.boss ? 3 : 2);
        for (let i = 0; i < f.d.coin; i += f.d.boss ? 5 : 1) drop(f.x, f.y, 0, f.d.boss ? 5 : 1);
        if (!f.d.boss && Math.random() < 0.18) drop(f.x, f.y, 1, 3);
        addXp(f.d.xp);
        if (f.d.boss) bossDown(f);
    }
    function addXp(n) {
        S.xp += n;
        while (S.lvl < 10 && S.xp >= need(S.lvl)) {
            S.lvl++;
            for (const p of P) if (p.on) { p.hp = maxHp(); p.down = false; burst(p.x, p.y - 10, 16, '#ffe66a', 2); }
            SND.fx('level'); toast(txt(T.ui.lvup, { n: S.lvl }));
        }
    }
    function hurt(p, dmg, sx, sy) {
        if (!p.on || p.inv > 0 || p.down || mode !== 'play') return;
        p.hp = Math.max(0, p.hp - dmg); p.inv = 60; SND.fx('hurt'); shake = 6;
        const d = dist(p.x, p.y, sx, sy) || 1; p.kx = (p.x - sx) / d * 5; p.ky = (p.y - sy) / d * 5;
        floater(p.x, p.y - 30, dmg, '#ff5a5a');
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
            for (const p of P) { p.hp = maxHp(); p.down = false; }
            save();
        });
    }

    function updPlayer(p) {
        if (p.inv > 0) p.inv--;
        if (p.atk > 0) p.atk--;
        if (p.swing > 0) p.swing--;
        if (p.down) {
            const other = P[1 - p.i];
            if (--p.downT <= 0 && other.on && !other.down) { p.down = false; p.hp = Math.ceil(maxHp() / 2); p.inv = 120; p.x = other.x; p.y = other.y; toast(txt(T.ui.revived, { name: heroName(p.i) })); }
            return;
        }
        let dx = (held(p, 'right') ? 1 : 0) - (held(p, 'left') ? 1 : 0);
        let dy = (held(p, 'down') ? 1 : 0) - (held(p, 'up') ? 1 : 0);
        p.moving = !!(dx || dy);
        // long press OK (without moving) opens the quick menu: journal, potion
        if (held(p, 'jump') && !p.moving) { if (++p.hold === 50) { p.hold = 0; quickMenu(); return; } } else p.hold = 0;
        if (p.moving) {
            const n = dx && dy ? 0.7071 : 1;
            p.ax = dx * n; p.ay = dy * n; p.fx = dx; p.fy = dy;
            const spd = (codeAt(p.x, p.y) === C_m ? 1.1 : 1.8) * (p.atk > 10 ? 0.5 : 1);
            const ox = p.x, oy = p.y;
            moveEnt(p, dx * n * spd, dy * n * spd, 7, 4);
            p.walk += 0.25;
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
                s.on = false; S.picked[s.key] = true; SND.fx('pick'); burst(s.cx, s.cy - 6, 10, s.k === 'ore' ? '#e6eef7' : '#3fa9ff', 1.5);
                if (s.k === 'ore') { S.ore++; toast(txt(T.ui.gotOre, { n: Math.min(3, S.ore) })); }
                else { S.caps++; toast(txt(T.ui.gotCap, { n: Math.min(3, S.caps) })); }
                save();
            }
        }
        for (const d of DROPS) {
            if (!d.on || d.z > 1) continue;
            if (dist(p.x, p.y, d.x, d.y) < 16) {
                d.on = false;
                if (d.k === 0) { S.coins += d.v; SND.fx('coin'); }
                else { p.hp = Math.min(maxHp(), p.hp + d.v); SND.fx('heal'); }
            }
        }
        // exits
        for (const e of Z.def.exits) {
            if (p.x >= e.x * TS && p.x < (e.x + e.w) * TS && p.y >= e.y * TS && p.y < (e.y + e.h) * TS) { changeZone(e.to, e.tx, e.ty); return; }
        }
    }

    /* ------------------------------------------------------------------ foes */

    function activate(f) { if (f.active) return; f.active = true; f.tm = 0; SND.fx('roar'); shake = 10; showBoss(f); music(); }

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
            case 'wolf':
                if (f.cd > 0) f.cd--;
                if (f.st === 0) {
                    if (p && d < 170) chase(f, tx, ty, f.d.spd, rw, rh); else wander(f, rw, rh);
                    if (p && d < 90 && f.cd <= 0) { f.st = 1; f.tm = 24; f.vx = tx; f.vy = ty; }
                } else if (f.st === 1) { if (--f.tm <= 0) { f.st = 2; f.tm = 20; } }
                else { moveEnt(f, f.vx * 3.4, f.vy * 3.4, rw, rh); if (--f.tm <= 0) { f.st = 0; f.cd = 80; } }
                break;
            case 'thornback':
                if (f.st === 0) {
                    leash(f, tx, ty, 0.6, rw, rh);
                    if (++f.tm > 90 && p) { f.st = 1; f.tm = 45; f.vx = tx; f.vy = ty; }
                } else if (f.st === 1) { if (--f.tm <= 0) { f.st = 2; f.tm = 75; } if (f.tm & 4) part(f.x, f.y, 0, -f.vx, -f.vy * 0.5, 1, 15, '#a08a6a', 2); }
                else if (f.st === 2) {
                    if (moveEnt(f, f.vx * 4.2, f.vy * 4.2, rw, rh)) { f.st = 3; f.tm = 110; shake = 12; SND.fx('slam'); burst(f.x + f.vx * 20, f.y, 14, '#5b3b24', 2.5); }
                    else if (--f.tm <= 0 || dist(f.x, f.y, f.hx, f.hy) > 9 * TS) { f.st = 0; f.tm = 0; }
                } else if (--f.tm <= 0) { f.st = 0; f.tm = 0; }
                break;
            case 'warden':
                if (f.st === 0) {
                    leash(f, tx, ty, f.d.spd, rw, rh);
                    if (++f.tm > 150 && p) { f.st = 1; f.tm = 40; }
                } else if (--f.tm <= 0) {
                    const a = Math.atan2(ty, tx);
                    for (let k = -2; k <= 2; k++) shot(f.x, f.y - 14, Math.cos(a + k * 0.28) * 2.2, Math.sin(a + k * 0.28) * 2.2, 2, 6, 0);
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
                        if (d > 150) { shot(f.x, f.y - 30, tx * 2.6, ty * 2.6, 3, 8, 1); SND.fx('shoot'); f.tm = 40; }
                        else { f.st = 1; f.tm = 64; }
                    }
                } else if (f.st === 1) { if (--f.tm <= 0) { f.st = 2; f.ring = 10; f.mask = 0; SND.fx('slam'); shake = 14; } }
                else {
                    f.ring += 3;
                    for (const q of P) if (q.on && !q.down && !(f.mask & (1 << q.i)) && Math.abs(dist(q.x, q.y, f.x, f.y) - f.ring) < 12) { f.mask |= 1 << q.i; hurt(q, f.d.dmg, f.x, f.y); }
                    if (f.ring > 92) { f.st = 0; f.tm = 0; }
                }
                break;
            case 'shade':
                if (f.st === 0) {
                    f.alpha = Math.min(1, f.alpha + 0.05);
                    if (++f.tm % 110 === 0) {
                        const n = tier === 'low' ? 8 : tier === 'mid' ? 10 : 12, off = f.wt * 0.4;
                        for (let k = 0; k < n; k++) { const a = off + k * 6.2832 / n; shot(f.x, f.y - 16, Math.cos(a) * 1.5, Math.sin(a) * 1.5, 2, 6, 2); }
                        SND.fx('shoot'); f.wt++;
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
        // contact damage
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
            if (--s.life <= 0 || (c !== C_tilde && c !== C_w && solidAt(s.x, s.y))) { s.on = false; burst(s.x, s.y, 3, s.k === 2 ? '#8a8fb8' : '#6a5a40', 1); continue; }
            for (const q of P) if (q.on && !q.down && dist(q.x, q.y - 8, s.x, s.y) < s.r + 7) { hurt(q, s.dmg, s.x - s.vx * 4, s.y - s.vy * 4); s.on = false; break; }
        }
    }
    function updParts() {
        for (const p of PARTS) {
            if (!p.on) continue;
            p.x += p.vx; p.y += p.vy; p.z += p.vz; p.vz -= 0.15;
            if (p.z < 0) { p.z = 0; p.vz *= -0.4; p.vx *= 0.7; p.vy *= 0.7; }
            if (--p.life <= 0) p.on = false;
        }
        for (const f of FLOATS) if (f.on && --f.t <= 0) f.on = false;
        for (const d of DROPS) {
            if (!d.on) continue;
            d.z += d.vz; d.vz -= 0.2; if (d.z < 0) { d.z = 0; d.vz = 0; }
            d.sy = d.y;
            if (--d.t <= 0) d.on = false;
        }
    }

    function npcVisible(id) {
        if (id === 'corvin') return S.stage >= 13;
        if (id === 'lira') return S.stage >= 15;
        return true;
    }

    /* ------------------------------------------------------------------ update */

    function update() {
        tick++;
        if (toastT > 0 && --toastT === 0) $('toast').className = '';
        if (bannerT > 0 && --bannerT === 0) $('banner').className = '';
        if (shake > 0) shake--;
        fogOff += 0.25;
        if (mode === 'fade') updFade();
        else if (mode === 'play') {
            S.time += 1 / 60;
            for (const p of P) if (p.on) updPlayer(p);
            if (mode === 'play') {
                for (const f of FOES) if (f.on) updFoe(f);
                updShots();
                // the chapel: meeting Corvin
                if (Z.id === 'isle' && S.stage === 13 && S.seal) {
                    for (const p of P) if (p.on && p.y < 8.2 * TS) {
                        say(lines('corvin', 'corvin13'), null, () => { advance(14); boss = spawnFoe('shade', 20 * TS, 4.5 * TS, false); burst(20 * TS, 4.5 * TS, 30, '#3a3d58', 3); });
                        break;
                    }
                }
            }
            for (const n of Z.npcs) { n.sy = n.id === 'corvin' && S.stage === 14 ? 2.3 * TS : n.y; }
            hud();
        } else if (mode === 'overlay' && OV.kind === 'menu') { camX += 0.15; }   // slow pan behind the title
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

    function draw() {
        ctx.fillStyle = '#0b0d12'; ctx.fillRect(0, 0, W, H);
        if (!Z.ground) return;
        const maxX = Z.cols * TS - W, maxY = Z.rows * TS - H;
        if (camX > maxX) camX = 0;                     // title pan wraps around
        let cx = Math.round(camX), cy = Math.round(camY);
        if (shake > 0) { cx += ((tick * 7) % 5) - 2; cy += ((tick * 13) % 5) - 2; }
        const sx = Math.max(0, Math.min(maxX, cx)), sy = Math.max(0, Math.min(maxY, cy));
        ctx.drawImage(Z.ground, sx, sy, W, H, sx - cx, sy - cy, W, H);
        // gather drawables in view
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
                if (o.k === 'lantern') {
                    ctx.drawImage(S && S.lit ? mi.lanternOn : mi.lanternOff, o.dx - cx, o.dy - cy, o.dw, o.dh);
                } else {
                    if (o.k === 'cap') ctx.drawImage(mi.blueGlow, o.dx - 22 - cx, o.dy - 22 - cy, 64, 64);
                    ctx.drawImage(o.img, o.dx - cx, o.dy - cy, o.dw, o.dh);
                    if (o.k === 'ore' && (tick + o.dx) % 90 < 8) { ctx.fillStyle = '#ffffff'; ctx.fillRect(o.dx + 14 - cx, o.dy + 4 - cy, 3, 3); }
                }
            } else if (o.kind === 2) drawNpc(o, cx, cy);
            else if (o.kind === 3) drawPlayer(o, cx, cy);
            else if (o.kind === 4) drawFoe(o, cx, cy);
            else if (o.kind === 5) drawDrop(o, cx, cy);
        }
        // shots
        for (const s of SHOTS) {
            if (!s.on) continue;
            ctx.fillStyle = s.k === 2 ? '#2b2d48' : s.k === 1 ? '#8c867a' : '#5a4a30';
            ctx.beginPath(); ctx.arc(s.x - cx, s.y - cy, s.r, 0, 6.2832); ctx.fill();
            ctx.fillStyle = s.k === 2 ? '#a8b0ff' : 'rgba(255,255,255,0.3)'; ctx.fillRect(s.x - cx - 2, s.y - cy - 2, 3, 3);
        }
        // particles
        for (const p of PARTS) { if (!p.on) continue; ctx.globalAlpha = Math.min(1, p.life / p.max * 2); ctx.fillStyle = p.col; ctx.fillRect(p.x - cx, p.y - p.z - cy, p.sz, p.sz); }
        ctx.globalAlpha = 1;
        // lantern light
        if (Z.lantern && S && S.lit) { const g = 300 + Math.sin(tick * 0.05) * 10; ctx.globalAlpha = 0.6; ctx.drawImage(mi.glow, Z.lantern.cx - g / 2 - cx, Z.lantern.cy - 120 - g / 2 - cy, g, g); ctx.globalAlpha = 1; }
        // the Hush
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
        // floating numbers
        ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        for (const f of FLOATS) { if (!f.on) continue; ctx.fillStyle = '#000'; ctx.fillText(f.s, f.x - cx + 1, f.y - cy - (50 - f.t) * 0.4 + 1); ctx.fillStyle = f.col; ctx.fillText(f.s, f.x - cx, f.y - cy - (50 - f.t) * 0.4); }
        if (mode === 'play' || mode === 'dialog') drawGuide(cx, cy);
        if (vignette && tier !== 'low') ctx.drawImage(vignette, 0, 0);
        if (mode === 'fade') { ctx.fillStyle = '#000'; ctx.globalAlpha = fadeT < 20 ? fadeT / 20 : (40 - fadeT) / 20; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    }

    function drawNpc(n, cx, cy) {
        const look = LOOK[n.id];
        let x = n.x - cx, y = n.sy - cy;
        if (n.id === 'lira') y -= 6 + Math.sin(tick * 0.05) * 3;
        if (look.glow) ctx.drawImage(ART.misc().blueGlow, x - 28, y - 44, 56, 56);
        ART.human(ctx, x, y, look, n.fx, n.fy, 0, false);
        if (n.id === 'maren') { ctx.fillStyle = '#6b4a2e'; ctx.fillRect(x + 9, y - 30, 2, 30); ctx.fillStyle = '#ffd76a'; ctx.fillRect(x + 7, y - 33, 6, 5); }
        if (n.id === 'bram') { ctx.fillStyle = '#6b4a2e'; ctx.fillRect(x - 13, y - 22, 2, 16); ctx.fillStyle = '#b8bcc4'; ctx.fillRect(x - 17, y - 24, 6, 5); }
        if (n.id === 'corvin' && S.stage < 15) { ctx.fillStyle = '#5b5bd6'; ctx.fillRect(x + 9, y - 22, 5, 7); }
        // quest marker
        if (news(n.id)) {
            const by = y - 44 * (look.s || 1) + Math.sin(tick * 0.1 + n.bob) * 2;
            ctx.fillStyle = '#000'; ctx.fillRect(x - 4, by - 13, 9, 18);
            ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - 3, by - 12, 7, 11); ctx.fillRect(x - 3, by + 1, 7, 3);
        } else if (AI_NPC[n.id] && npcTalkable(n.id) && dist(P[0].x, P[0].y, n.x, n.y) < 70) {
            const by = y - 42 * (look.s || 1);
            ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.ellipse(x, by, 9, 6, 0, 0, 6.2832); ctx.fill();
            ctx.fillStyle = '#334'; ctx.fillRect(x - 5, by - 1, 2, 2); ctx.fillRect(x - 1, by - 1, 2, 2); ctx.fillRect(x + 3, by - 1, 2, 2);
        }
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
        // weapon behind when facing up
        const wx = x + p.ax * 10, wy = y - 12 + p.ay * 4;
        if (p.ay < 0 && !p.swing) drawBlade(wx, wy, p);
        ART.human(ctx, x, y, HERO[p.i], p.fx, p.fy, p.walk, false);
        if (!(p.ay < 0) && !p.swing) drawBlade(wx, wy, p);
        ctx.globalAlpha = 1;
        if (p.swing > 0) {
            const a = Math.atan2(p.ay, p.ax), t = p.swing / 12;
            ctx.globalAlpha = t; ctx.strokeStyle = S.sword ? '#e6f0ff' : '#d2b482';
            ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y - 10, 20, a - 1.3 + (1 - t) * 0.8, a + 1.3 - (1 - t) * 0.8); ctx.stroke(); ctx.globalAlpha = 1;
        }
        if (P[1].on) {
            ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
            ctx.fillStyle = '#000'; ctx.fillText(p.i ? '2P' : '1P', x + 1, y - 37);
            ctx.fillStyle = p.i ? '#ffb38a' : '#8af0e0'; ctx.fillText(p.i ? '2P' : '1P', x, y - 38);
        }
    }
    function drawBlade(x, y, p) {
        ctx.fillStyle = S.sword ? '#d8e2ee' : '#a07a4a';
        if (p.ax !== 0 && Math.abs(p.ax) >= Math.abs(p.ay)) ctx.fillRect(x - (p.ax < 0 ? 12 : 0), y, 12, 3);
        else ctx.fillRect(x - 1, y - (p.ay < 0 ? 12 : 0), 3, 12);
    }

    function drawDrop(d, cx, cy) {
        const x = d.x - cx, y = d.y - cy - d.z - 4 + (d.z === 0 ? Math.sin(tick * 0.15 + d.x) * 1.5 : 0);
        if (d.t < 120 && (d.t & 8)) return;
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(d.x - cx - 4, d.y - cy, 8, 2);
        if (d.k === 0) { ctx.fillStyle = '#b8860b'; ctx.beginPath(); ctx.arc(x, y, d.v > 1 ? 6 : 4, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x, y, d.v > 1 ? 4.5 : 3, 0, 6.2832); ctx.fill(); }
        else { ctx.fillStyle = '#ff5a7a'; ctx.beginPath(); ctx.arc(x - 3, y - 2, 3.5, 0, 6.2832); ctx.arc(x + 3, y - 2, 3.5, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 6.5, y - 1); ctx.lineTo(x, y + 6); ctx.lineTo(x + 6.5, y - 1); ctx.fill(); }
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
            case 'wolf': {
                const dir = f.st === 2 ? Math.sign(f.vx) || 1 : (nearestDir(f));
                ctx.fillStyle = w ? '#fff' : f.st === 1 ? '#a8a0a0' : '#6e6a72';
                ctx.beginPath(); ctx.ellipse(x, y - 10, 14, 8, 0, 0, 6.2832); ctx.fill();
                ctx.beginPath(); ctx.ellipse(x + dir * 13, y - 15, 7, 6, 0, 0, 6.2832); ctx.fill();
                ctx.fillRect(x - 10, y - 5, 3, 6); ctx.fillRect(x + 7, y - 5, 3, 6);
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

    // the guide marker: a bouncing arrow over the current target, or at the screen edge
    function target() {
        const st = S.stage, zid = Z.id;
        let z = '', x = 0, y = 0;
        if (st === 0 || st === 5 || st === 9 || st === 12 || st === 15) { z = 'village'; x = 24.5; y = 5.2; }
        else if (st === 1 || st === 10 || (st === 2 && S.ore >= 3)) { z = 'village'; x = 5; y = 12.6; }
        else if (st === 2) { z = 'greywood'; const o = nearestPick('greywood', 'o'); if (!o) return false; x = o[0]; y = o[1]; }
        else if (st === 4) { z = 'greywood'; x = 35; y = 9; }
        else if (st === 6 || (st === 7 && S.caps >= 3)) { z = 'mireshore'; x = 23.5; y = 15.2; }
        else if (st === 7) { z = 'mireshore'; const o = nearestPick('mireshore', 'c'); if (!o) return false; x = o[0]; y = o[1]; }
        else if (st === 8) { z = 'isle'; x = 20; y = 13; }
        else if (st === 11) { if (S.gate || zid === 'quarry') { z = 'quarry'; x = 20; y = 5; } else { z = 'village'; x = 9; y = 1.5; } }
        else if (st === 13) { z = 'isle'; x = 20; y = S.seal ? 5 : 8.6; }
        else if (st === 14) { z = 'isle'; x = 20; y = 4.5; }
        else if (st === 16) { z = 'village'; x = 22; y = 4.6; }
        else return false;
        // route through the world: village is the hub, the isle is reached by Sela's ferry
        if (z !== zid) {
            if (zid === 'isle') { const b = Z.boats[0]; GT.x = b.cx; GT.y = b.cy; return true; }
            if (zid === 'mireshore' && z === 'isle') { GT.x = 23.5 * TS; GT.y = 15.2 * TS; return true; }
            if (zid !== 'village') { const e = Z.def.exits[0]; GT.x = (e.x + e.w / 2) * TS; GT.y = (e.y + e.h / 2) * TS; return true; }
            const to = z === 'isle' ? 'mireshore' : z;
            const e = exitTo(to);
            if (to === 'quarry' && !S.gate) { GT.x = 9 * TS; GT.y = 1.5 * TS; return true; }
            GT.x = (e.x + e.w / 2) * TS; GT.y = (e.y + e.h / 2) * TS; return true;
        }
        GT.x = x * TS; GT.y = y * TS; return true;
    }
    const GT = { x: 0, y: 0, t: 0, ok: false };
    function exitTo(to) { const ex = Z.def.exits; for (let i = 0; i < ex.length; i++) if (ex[i].to === to) return ex[i]; return ex[0]; }
    function nearestPick(zone, c) {         // only needed inside that zone; elsewhere the arrow points to the exit
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
    function drawGuide(cx, cy) {
        if (!S || (tick % 15 === 0 && !(GT.ok = target()))) return;
        if (!GT.ok) return;
        const x = GT.x - cx, y = GT.y - cy - 34, m = 26;
        if (x > m && x < W - m && y > m && y < H - m) {
            const b = Math.sin(tick * 0.12) * 4;
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(x - 9, y - 12 + b); ctx.lineTo(x + 9, y - 12 + b); ctx.lineTo(x, y + 1 + b); ctx.fill();
            ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(x - 6, y - 10 + b); ctx.lineTo(x + 6, y - 10 + b); ctx.lineTo(x, y - 2 + b); ctx.fill();
        } else {
            const ccx = W / 2, ccy = H / 2, a = Math.atan2(y - ccy, x - ccx);
            const ex = Math.max(m, Math.min(W - m, ccx + Math.cos(a) * 1000)), ey = Math.max(m + 20, Math.min(H - m - 20, ccy + Math.sin(a) * 1000));
            const px = ccx + Math.cos(a) * Math.min(Math.abs((ex - ccx) / (Math.cos(a) || 1e-6)), Math.abs((ey - ccy) / (Math.sin(a) || 1e-6)));
            const py = ccy + Math.sin(a) * Math.min(Math.abs((ex - ccx) / (Math.cos(a) || 1e-6)), Math.abs((ey - ccy) / (Math.sin(a) || 1e-6)));
            ctx.save(); ctx.translate(px, py); ctx.rotate(a);
            const pulse = 1 + Math.sin(tick * 0.15) * 0.12; ctx.scale(pulse, pulse);
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-9, -11); ctx.lineTo(-9, 11); ctx.fill();
            ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, -8); ctx.lineTo(-6, 8); ctx.fill();
            ctx.restore();
        }
    }

    /* ------------------------------------------------------------------ loop, screen */

    let vignette = null;
    function resize() {
        const vw = window.innerWidth, vh = window.innerHeight;
        const s = Math.min(vw / W, vh / H);
        const cw = Math.floor(W * s), ch2 = Math.floor(H * s);
        const st = $('stage'); st.style.width = cw + 'px'; st.style.height = ch2 + 'px';
        st.style.left = Math.floor((vw - cw) / 2) + 'px'; st.style.top = Math.floor((vh - ch2) / 2) + 'px';
        st.style.setProperty('--u', (ch2 / 100) + 'px');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let bw = Math.round(cw * dpr), bh = Math.round(ch2 * dpr);
        if (bw > 1920) { bh = Math.round(bh * 1920 / bw); bw = 1920; }   // 4K TVs: draw at 1080p, let the GPU scale
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
        talk, act, changeZone, loadZone, placePlayers, update, objective: () => objective(L), target: () => target() && GT };

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
            $('questLbl').textContent = T.ui.quest;
            $('join').textContent = T.ui.p2join;
            $('hint').textContent = T.ui.holdOk;
            $('dai').textContent = '✦ ' + T.ui.ai;
            $('pn0').textContent = T.ui.hero1; $('pn1').textContent = T.ui.hero2;
            MyPC.progress(0.3);
            // build the art for every zone now, so walking between zones never stutters
            ['grass', 'forest', 'mire', 'stone'].forEach(t => ART.sprites(t));
            ART.misc();
            MyPC.progress(0.8);
            S = fresh();
            const saved = MyPC.load('save', null);
            if (saved) S = Object.assign(fresh(), saved);
            loadZone('village'); camX = 0; camY = 0;
            refreshMenu();
            MyPC.progress(1);
            MyPC.ready();
        },
        onStart: function () {
            started = true;
            SND.start(info.volume);
            for (let k = 0; k < 7; k++) SND.prepare(k);
            music();
            showTitle();
            startLoop();
        },
        onPause: function () { stopLoop(); SND.pause(); $('paused').style.display = info.standalone ? '' : 'none'; for (const k in DEV) DEV[k] = {}; },
        onResume: function () { $('paused').style.display = 'none'; SND.resume(); startLoop(); },
        onDestroy: function () {
            stopLoop(); AI.abort(); VOICE.stop(); SND.close();
            window.removeEventListener('resize', resize);
        },
        onInput: onInput,
        onMenu: function (id) {
            if (!S || (mode !== 'play' && mode !== 'dialog')) return;
            if (id === 'journal') { if (mode === 'dialog') closeDlg(); showJournal(); }
            else if (id === 'potion') drink();
            else if (id === 'leave2' && P[1].on) leave2();
        },
        onVolume: function (v) { SND.setVolume(v); }
    });
})();
