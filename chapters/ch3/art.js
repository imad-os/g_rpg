/* Hollowmere, Chapter 3: the art of the Veilscar Frontier, drawn in code with depth (2.5D), plus Kenney's
 * Tiny Ski sheet (CC0, assets/kenney/ski.png) for the snowy pines, rocks, logs and snowmen of the heights.
 * Everything is drawn once into cached canvases when an area loads; only water, the void, beacons, wards,
 * anchors and crystals move each frame (small, no allocation). On a slow TV ('low') the soft patches are skipped.
 * Map letters: . grass / snow / ash   , moss   F glowcaps / flowers   = cobbles   x stone floor   d dirt road
 *   i ice   a ash   ~ water (the void in the Veilscar)   w planks / old stone bridge   D dark way down
 *   ^ cliff   # wall / palisade   T tree   P pine / dead tree   k bush   r rock   B bones   G grave   R standing stone
 *   f fence   b barrel   h crate   L lamp / brazier   c crystal   p pot   C chest   g q gates (opened by the story) */
window.HM_C3_ART = (function () {
    'use strict';
    const TS = 32, H = 20, CACHE = {};
    let API = null;
    const ST = () => (API && API.S && API.S.c3) || {};
    // Kenney Tiny Ski: 12 x 11 tiles of 16 px, no spacing
    const SKI = new Image(); let skiOk = false;
    SKI.onload = () => { skiOk = true; }; SKI.src = 'assets/kenney/ski.png?v=' + (window.HM_VERSION || '1');
    function ski(x, i, dx, dy, s) { x.imageSmoothingEnabled = false; x.drawImage(SKI, (i % 12) * 16, ((i / 12) | 0) * 16, 16, 16, dx, dy, 16 * s, 16 * s); }

    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    // a soft round patch of colour: one gradient sprite per colour, drawn stretched and turned (old TVs choke on
    // a thousand gradients while a map is built)
    const BLOB = {};
    function blobSprite(rgb, a) {
        const k = rgb + a; if (BLOB[k]) return BLOB[k];
        const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
        const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
        x.fillStyle = g; x.fillRect(0, 0, 128, 128);
        return (BLOB[k] = c);
    }
    function blob(x, gx, gy, r, sy, rot, rgb, a) {
        x.setTransform(Math.cos(rot), Math.sin(rot), -Math.sin(rot) * sy, Math.cos(rot) * sy, gx, gy);
        x.drawImage(blobSprite(rgb, a), -r, -r, r * 2, r * 2);
        x.setTransform(1, 0, 0, 1, 0, 0);
    }
    // blobs painted on a layer, kept only where the mask has tiles, then laid on the ground (no clip per blob)
    function masked(x, area, paintFn) {
        const w = x.canvas.width, h = x.canvas.height, L = document.createElement('canvas'); L.width = w; L.height = h;
        const l = L.getContext('2d'); paintFn(l);
        l.globalCompositeOperation = 'destination-in'; l.fillStyle = '#000'; l.fill(area);
        x.drawImage(L, 0, 0); L.width = L.height = 0;
    }
    function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); fn(x); return c; }
    function cached(key, w, h, fn) { return CACHE[key] || (CACHE[key] = mk(w, h, fn)); }
    function oval(x, X, Y, rx, ry, col) { x.fillStyle = col; x.beginPath(); x.ellipse(X, Y, rx, ry, 0, 0, 6.2832); x.fill(); }
    function shade(col, k) {
        const n = parseInt(col.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k)));
        return 'rgb(' + f((n >> 16) & 255) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
    }

    // colours of each land
    const PAL = {
        dawn:    { grass: '#7aa856', grass2: '#64903f', dark: '#53803a', cob: '#b4a68c', stone: '#a49e92', dirt: '#a8865c', water: '#3a7aa8', rock: '#80786c', rockTop: '#6c9a4c', wall: '#7a5232', wallTop: '#9a6c40', tint: 'rgba(255,200,140,0.06)', moss: '#5a8a3c' },
        elder:   { grass: '#3f8a52', grass2: '#33744a', dark: '#2a6440', cob: '#8a9a7a', stone: '#7c8c78', dirt: '#7a6446', water: '#2a8aa0', rock: '#56604e', rockTop: '#3f7a46', wall: '#56604e', wallTop: '#6a7a5e', tint: 'rgba(40,120,140,0.10)', moss: '#2e6e44' },
        ashen:   { grass: '#5e5852', grass2: '#4e4844', dark: '#3e3a38', cob: '#6e665e', stone: '#6a625a', dirt: '#5e4c3c', water: '#2e3e4e', rock: '#3e3836', rockTop: '#4e4846', wall: '#2e2a2a', wallTop: '#46403e', tint: 'rgba(120,60,30,0.12)', moss: '#4a4a3e' },
        keep:    { grass: '#3a3a40', grass2: '#323238', dark: '#2a2a30', cob: '#4a4a52', stone: '#4e4c54', dirt: '#3e3a3a', water: '#1d2a3a', rock: '#2a2a30', rockTop: '#3a3a44', wall: '#2e2c34', wallTop: '#46444e', tint: 'rgba(20,10,30,0.25)', moss: '#3a4038' },
        frost:   { grass: '#e8f0f8', grass2: '#d4e2f0', dark: '#c4d6ea', cob: '#9aa6b4', stone: '#a4b0c0', dirt: '#b8c4d4', water: '#6aa8d8', rock: '#6a7484', rockTop: '#eef4fa', wall: '#7a8494', wallTop: '#c8d2de', tint: 'rgba(150,190,255,0.08)', moss: '#d8e4f0' },
        veil:    { grass: '#4a3a5e', grass2: '#3e3050', dark: '#342844', cob: '#5a4a6e', stone: '#544866', dirt: '#4a3e56', water: '#0a0614', rock: '#2a2036', rockTop: '#4a3a5e', wall: '#2a2036', wallTop: '#46385a', tint: 'rgba(90,30,140,0.14)', moss: '#3a2e4a' },
        citadel: { grass: '#3a3048', grass2: '#30283e', dark: '#282034', cob: '#463a56', stone: '#4a3e5a', dirt: '#3a3046', water: '#06040c', rock: '#241c30', rockTop: '#3a3048', wall: '#2a2238', wallTop: '#443856', tint: 'rgba(60,20,90,0.2)', moss: '#30283e' }
    };
    const RAISED = { 35: 1, 94: 1 };                        // # and ^
    const SOFT = { dawn: 1, elder: 1, ashen: 1, frost: 1 };

    /* ---------- ground tiles: a base pass, then details over everything (so patches are never cut at tile edges) ---------- */
    let BASE = true, THEME = 'dawn';
    function grassTile(x, px, py, tx, ty, P, base) {
        if (BASE) { x.fillStyle = base || P.grass; x.fillRect(px, py, TS, TS); return; }
        if (THEME === 'frost') {                                                 // snow: soft drifts and sparkles
            for (let k = 0; k < 3; k++) oval(x, px + hash(tx, ty, k) * 32, py + hash(tx, ty, k + 9) * 32, 6 + hash(tx, ty, k + 3) * 6, 2.5, k & 1 ? P.grass2 : '#ffffff');
            if (hash(tx, ty, 12) < 0.4) { x.fillStyle = '#ffffff'; x.fillRect(px + hash(tx, ty, 13) * 30, py + hash(tx, ty, 14) * 30, 1.5, 1.5); }
            return;
        }
        if (THEME === 'veil' || THEME === 'citadel' || THEME === 'keep') { stoneTile(x, px, py, tx, ty, P); return; }
        for (let k = 0; k < 5; k++) { const h = hash(tx, ty, k + 3); oval(x, px + hash(tx, ty, k) * 32, py + hash(tx, ty, k + 9) * 32, 4 + h * 6, 2 + h * 3, h < 0.5 ? P.grass2 : 'rgba(255,255,255,0.06)'); }
        x.strokeStyle = P.dark; x.lineWidth = 1;
        for (let k = 0; k < 4; k++) { const gx = px + hash(tx, ty, k + 20) * 30 + 1, gy = py + hash(tx, ty, k + 30) * 28 + 4; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx - 1, gy - 4); x.moveTo(gx + 2, gy); x.lineTo(gx + 3, gy - 3); x.stroke(); }
        if (THEME === 'ashen' && hash(tx, ty, 41) < 0.25) { x.fillStyle = '#ff8a3a'; x.fillRect(px + hash(tx, ty, 42) * 30, py + hash(tx, ty, 43) * 30, 1.5, 1.5); }
    }
    function paint(x, c, px, py, tx, ty, P, at) {
        switch (c) {
            case ',': grassTile(x, px, py, tx, ty, P, P.moss);
                if (!BASE && THEME === 'elder') for (let k = 0; k < 3; k++) oval(x, px + hash(tx, ty, k + 60) * 30, py + hash(tx, ty, k + 61) * 30, 3, 1.5, 'rgba(120,255,200,0.12)');
                break;
            case 'F':
                grassTile(x, px, py, tx, ty, P); if (BASE) break;
                if (THEME === 'elder') {                                       // glowcaps: little blue mushrooms
                    for (let k = 0; k < 4; k++) { const fx = px + 4 + hash(tx, ty, k + 40) * 24, fy = py + 8 + hash(tx, ty, k + 50) * 20;
                        x.fillStyle = '#d8e8e0'; x.fillRect(fx - 0.5, fy - 1, 1.5, 4); oval(x, fx, fy - 1, 3, 2, k & 1 ? '#5ae0ff' : '#8affd0'); oval(x, fx - 1, fy - 1.5, 1, 0.6, '#ffffff'); }
                } else for (let k = 0; k < 6; k++) { const fx = px + 3 + hash(tx, ty, k + 40) * 26, fy = py + 4 + hash(tx, ty, k + 50) * 24, col = ['#ffffff', '#ffd23f', '#ff8ab0', '#8ab4ff'][(hash(tx, ty, k + 60) * 4) | 0];
                    oval(x, fx, fy, 2.2, 2.2, col); oval(x, fx, fy, 0.9, 0.9, '#f4a020'); }
                break;
            case '=': {
                if (BASE) { x.fillStyle = P.cob; x.fillRect(px, py, TS, TS); x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(px, py, TS, TS); break; }
                for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) {
                    const sx = px + 5 + k * 11 + (r & 1) * 5 - 2, sy = py + 4 + r * 8;
                    oval(x, sx, sy, 4.6, 3.2, shade(P.cob, 0.9 + hash(tx * 3 + k, ty * 4 + r, 7) * 0.25));
                    oval(x, sx - 1, sy - 1, 2, 1, THEME === 'frost' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)');
                }
                break;
            }
            case 'x': case 'q': case 'g': stoneTile(x, px, py, tx, ty, P); break;
            case 'd':
                if (BASE) { x.fillStyle = P.dirt; x.fillRect(px, py, TS, TS); break; }
                for (let k = 0; k < 6; k++) oval(x, px + hash(tx, ty, k + 70) * 32, py + hash(tx, ty, k + 80) * 32, 1.5 + hash(tx, ty, k) * 2, 1.2, k & 1 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)');
                break;
            case 'a': grassTile(x, px, py, tx, ty, P); break;
            case 'i': {                                                         // ice: pale blue with long glints
                if (BASE) { x.fillStyle = '#bfe0f4'; x.fillRect(px, py, TS, TS); break; }
                x.strokeStyle = 'rgba(255,255,255,0.7)'; x.lineWidth = 1; x.beginPath(); x.moveTo(px + 4 + hash(tx, ty, 3) * 10, py + 26); x.lineTo(px + 20 + hash(tx, ty, 4) * 10, py + 6); x.stroke();
                if (hash(tx, ty, 5) < 0.3) { x.strokeStyle = 'rgba(80,130,180,0.35)'; x.beginPath(); x.moveTo(px + 6, py + 10); x.lineTo(px + 14, py + 16); x.lineTo(px + 12, py + 24); x.stroke(); }
                break;
            }
            case 'w': {
                if (!BASE) break;
                waterTile(x, px, py, tx, ty, P, at);
                if (THEME === 'veil') {                                         // an old stone bridge over the void
                    x.fillStyle = '#5a4a6e'; x.fillRect(px, py + 2, TS, 28); for (let k = 0; k < 4; k++) { x.fillStyle = k & 1 ? '#6a5a80' : '#625274'; x.fillRect(px + k * 8 + 1, py + 3, 7, 26); }
                    x.fillStyle = 'rgba(0,0,0,0.4)'; x.fillRect(px, py + 28, TS, 2); x.fillStyle = 'rgba(200,160,255,0.25)'; x.fillRect(px, py + 2, TS, 1);
                    break;
                }
                for (let k = 0; k < 4; k++) {
                    x.fillStyle = k & 1 ? '#a8784a' : '#9a6a3e'; x.fillRect(px, py + k * 8, TS, 7);
                    x.fillStyle = '#5a3a20'; x.fillRect(px, py + k * 8 + 7, TS, 1);
                    x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(px, py + k * 8, TS, 1);
                }
                break;
            }
            case '~': if (BASE) waterTile(x, px, py, tx, ty, P, at); break;
            case 'D': {
                if (!BASE) break;
                x.fillStyle = '#0a0c12'; x.fillRect(px, py, TS, TS);
                for (let k = 0; k < 4; k++) { x.fillStyle = k & 1 ? '#3a3e4a' : '#4a4e5a'; x.fillRect(px + 2, py + 2 + k * 7, 28, 4); }
                break;
            }
            default: grassTile(x, px, py, tx, ty, P);
        }
    }
    function stoneTile(x, px, py, tx, ty, P) {
        if (BASE) { x.fillStyle = P.stone; x.fillRect(px, py, TS, TS); return; }
        for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) {
            x.fillStyle = shade(P.stone, 0.9 + hash(tx * 2 + k, ty * 2 + r, 5) * 0.2); x.fillRect(px + k * 16 + 1, py + r * 16 + 1, 14, 14);
            x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(px + k * 16 + 1, py + r * 16 + 1, 14, 1);
        }
        if (hash(tx, ty, 9) < 0.2) { x.strokeStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.moveTo(px + 6, py + 8); x.lineTo(px + 12, py + 14); x.lineTo(px + 10, py + 22); x.stroke(); }
        if ((THEME === 'veil' || THEME === 'citadel') && hash(tx, ty, 10) < 0.15) { x.strokeStyle = 'rgba(200,120,255,0.45)'; x.beginPath(); x.moveTo(px + 4, py + 20); x.lineTo(px + 14, py + 15); x.lineTo(px + 26, py + 19); x.stroke(); }
    }
    function waterTile(x, px, py, tx, ty, P, at) {
        x.fillStyle = P.water; x.fillRect(px, py, TS, TS);
        if (THEME === 'veil' || THEME === 'citadel') {                         // the void: deep dark with faint stars
            for (let k = 0; k < 2; k++) if (hash(tx, ty, k + 90) < 0.5) { x.fillStyle = k ? 'rgba(200,170,255,0.5)' : 'rgba(255,255,255,0.4)'; x.fillRect(px + hash(tx, ty, k + 91) * 30, py + hash(tx, ty, k + 92) * 30, 1, 1); }
            const edge = c => c !== '~' && c !== 'w';
            if (edge(at(tx, ty - 1))) { x.fillStyle = 'rgba(0,0,0,0.6)'; x.fillRect(px, py, TS, 10); x.fillStyle = 'rgba(160,90,255,0.35)'; x.fillRect(px, py + 10, TS, 2); }
            return;
        }
        if (THEME === 'frost') { x.fillStyle = 'rgba(220,240,255,0.55)'; x.fillRect(px, py, TS, TS); x.strokeStyle = 'rgba(255,255,255,0.8)'; x.beginPath(); x.moveTo(px + 3, py + 25); x.lineTo(px + 28, py + 8); x.stroke(); return; }
        const land = c => c !== '~' && c !== 'w' && c !== 'D';
        x.fillStyle = 'rgba(200,240,255,0.55)';
        if (land(at(tx, ty - 1))) { x.fillRect(px, py, TS, 3); x.fillStyle = 'rgba(120,200,230,0.35)'; x.fillRect(px, py + 3, TS, 6); x.fillStyle = 'rgba(200,240,255,0.55)'; }
        if (land(at(tx - 1, ty))) x.fillRect(px, py, 2, TS);
        if (land(at(tx + 1, ty))) x.fillRect(px + 30, py, 2, TS);
        if (land(at(tx, ty + 1))) x.fillRect(px, py + 30, TS, 2);
    }

    /* ---------- raised blocks: a top face and (on the south side) a front face ---------- */
    function block(c, theme, front, v) {
        const P = PAL[theme], key = 'blk' + c + theme + front + v;
        return cached(key, TS, TS + H, x => {
            const rock = c === '^', palis = c === '#' && theme === 'dawn', top = rock ? P.rockTop : P.wallTop, face = rock ? P.rock : P.wall;
            x.fillStyle = top; x.fillRect(0, 0, TS, TS);
            if (rock && (theme === 'dawn' || theme === 'elder')) {
                for (let k = 0; k < 5; k++) oval(x, (4 + k * 6 + v * 9) % 32, 6 + ((k + v) & 1) * 12 + v * 3, 5, 3, shade(top, 0.85 + v * 0.03));
                x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(0, 0, TS, 2);
            } else if (rock && theme === 'frost') {
                for (let k = 0; k < 4; k++) oval(x, (5 + k * 8 + v * 7) % 32, 8 + ((k + v) & 1) * 12, 6, 3, k & 1 ? '#ffffff' : '#dbe6f2');
            } else if (palis) {
                for (let k = 0; k < 4; k++) { oval(x, 4 + k * 8, 16, 4, 4, '#c08a50'); oval(x, 4 + k * 8, 16, 2, 2, '#8a5a32'); }
            } else if (c === '#') {
                for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) { x.fillStyle = shade(top, 0.9 + ((r + k) & 1) * 0.12); x.fillRect(k * 16 + 1, r * 16 + 1, 14, 14); }
                if (theme === 'frost') { x.fillStyle = '#f4f8ff'; x.fillRect(0, 0, TS, 5); }
            } else for (let k = 0; k < 4; k++) oval(x, (6 + k * 7 + v * 11) % 32, 10 + ((k + v) % 2) * 10, 4, 3, shade(top, 0.85 + v * 0.03));
            if (!front) return;
            const g = x.createLinearGradient(0, TS, 0, TS + H); g.addColorStop(0, face); g.addColorStop(1, shade(face, 0.6));
            x.fillStyle = g; x.fillRect(0, TS, TS, H);
            if (palis) { for (let k = 0; k < 4; k++) { x.fillStyle = k & 1 ? '#6a4426' : '#7a5232'; x.fillRect(k * 8, TS - 8, 7, H + 8); x.beginPath(); x.moveTo(k * 8, TS - 8); x.lineTo(k * 8 + 3.5, TS - 14); x.lineTo(k * 8 + 7, TS - 8); x.fill(); } x.fillStyle = '#3a2416'; x.fillRect(0, TS + 4, TS, 2); x.fillRect(0, TS + 13, TS, 2); }
            else if (c === '#') { x.fillStyle = 'rgba(0,0,0,0.25)'; for (let r = 0; r < 3; r++) { x.fillRect(0, TS + r * 7, TS, 1); x.fillRect((r & 1) * 10 + 6, TS + r * 7, 1, 7); x.fillRect((r & 1) * 10 + 22, TS + r * 7, 1, 7); }
                if (theme === 'frost') { x.fillStyle = 'rgba(220,240,255,0.8)'; for (let k = 0; k < 4; k++) x.fillRect(3 + k * 8, TS, 2, 4 + ((k + v) % 3) * 3); } }
            else { x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(0, TS + 6, TS, 2); x.fillRect(0, TS + 13, TS, 1); x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(3, TS + 2, 10, 2);
                if (theme === 'veil' || theme === 'citadel') { x.fillStyle = 'rgba(180,100,255,0.35)'; x.fillRect(6 + v * 6, TS + 4, 2, 10); } }
            x.fillStyle = 'rgba(255,255,255,0.22)'; x.fillRect(0, TS - 1, TS, 1);
        });
    }

    /* ---------- things that stand up ---------- */
    function tree(theme, c, v) {
        if (theme === 'frost' && skiOk) return cached('skipine' + c + v, 48, 96, x => {      // Kenney's snowy pine (or a bare tree)
            if (c === 'T') { ski(x, 7, 0, 0, 3); ski(x, 19, 0, 48, 3); } else if (v === 2) { ski(x, 30, 0, 48, 3); } else { ski(x, 6, 0, 0, 3); ski(x, 18, 0, 48, 3); }
        });
        return cached('tree' + theme + c + v, 80, 110, x => {
            if (theme === 'ashen' || (theme === 'dawn' && c === 'P')) {         // a burnt tree, bent and black
                x.fillStyle = '#26201e'; x.beginPath(); x.moveTo(36, 108); x.lineTo(38, 50); x.lineTo(44, 50); x.lineTo(46, 108); x.fill();
                x.strokeStyle = '#26201e'; x.lineCap = 'round';
                const br = [[40, 70, 20, 52, 4], [42, 60, 64, 40, 4], [41, 52, 30, 30, 3], [43, 45, 56, 22, 3], [24, 54, 14, 40, 2], [60, 44, 70, 36, 2]];
                for (const b of br) { x.lineWidth = b[4]; x.beginPath(); x.moveTo(b[0], b[1] + v * 2); x.lineTo(b[2], b[3] + v * 3); x.stroke(); }
                x.fillStyle = '#ff6a2a'; x.fillRect(40, 88 - v * 6, 2, 2); x.fillStyle = 'rgba(255,120,40,0.4)'; x.fillRect(39, 87 - v * 6, 4, 4);
                return;
            }
            if (theme === 'frost') {                                         // drawn pine (until Kenney's sheet is there)
                x.fillStyle = '#5a3e2a'; x.fillRect(37, 84, 6, 24);
                for (let k = 0; k < 4; k++) { const y = 30 + k * 16, w = 12 + k * 7; x.fillStyle = k & 1 ? '#2f6a4a' : '#3a7a56'; x.beginPath(); x.moveTo(40, y - 18); x.lineTo(40 + w, y + 10); x.lineTo(40 - w, y + 10); x.fill(); x.fillStyle = '#f4f8ff'; x.fillRect(40 - w + 2, y + 7, w * 2 - 4, 3); }
                return;
            }
            if (theme === 'elder') {                                         // a giant of the Elderwood: wide roots, deep crown, glowing leaves
                x.fillStyle = '#4a3424'; x.beginPath(); x.moveTo(28, 108); x.quadraticCurveTo(34, 80, 34, 54); x.lineTo(46, 54); x.quadraticCurveTo(46, 80, 54, 108); x.fill();
                x.fillStyle = '#3a281a'; x.beginPath(); x.moveTo(18, 108); x.quadraticCurveTo(30, 100, 34, 92); x.lineTo(36, 108); x.fill(); x.beginPath(); x.moveTo(62, 108); x.quadraticCurveTo(50, 100, 46, 92); x.lineTo(44, 108); x.fill();
                x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(37, 58, 2, 44);
                const g = v === 2 ? ['#1f5a46', '#287058', '#3a9070'] : v === 1 ? ['#1d5236', '#27684a', '#3a8a5a'] : ['#21583c', '#2c6e4c', '#44966a'];
                oval(x, 40, 56, 36, 18, g[0]); oval(x, 24, 40, 22, 18, g[1]); oval(x, 58, 40, 22, 19, g[1]); oval(x, 40, 26, 26, 20, g[1]);
                oval(x, 32, 22, 13, 9, g[2]); oval(x, 54, 34, 10, 7, g[2]); oval(x, 22, 46, 9, 6, g[2]);
                for (let k = 0; k < 7; k++) { oval(x, 14 + hash(k, v, 3) * 52, 18 + hash(k, v, 5) * 40, 1.6, 1.6, k & 1 ? '#8affd8' : '#5ae0ff'); }
                return;
            }
            if (theme === 'veil') { // a dead crystal spire
                x.fillStyle = '#2a2036'; x.beginPath(); x.moveTo(30, 108); x.lineTo(38, 20); x.lineTo(46, 108); x.fill();
                x.fillStyle = '#b07aff'; x.beginPath(); x.moveTo(38, 14); x.lineTo(44, 40); x.lineTo(38, 52); x.lineTo(32, 40); x.fill();
                return;
            }
            const greens = v === 2 ? ['#3d7a3a', '#4f9444', '#6cb352'] : ['#3a7034', '#4c8a40', '#68ad4c'];
            x.fillStyle = '#6a4a2e'; x.fillRect(36, 72, 8, 34); x.fillStyle = '#4e3420'; x.fillRect(36, 72, 3, 34);
            oval(x, 40, 72, 24, 16, greens[0]);
            oval(x, 30, 60, 16, 14, greens[1]); oval(x, 50, 58, 16, 15, greens[1]); oval(x, 40, 48, 18, 16, greens[1]);
            oval(x, 34, 44, 10, 8, greens[2]); oval(x, 48, 52, 8, 6, greens[2]);
            if (v === 1) for (let k = 0; k < 5; k++) oval(x, 26 + k * 7, 52 + (k & 1) * 12, 2, 2, '#e04a3a');
        });
    }
    function prop(name, theme, v) {
        switch (name) {
            case 'k': return cached('bush' + theme + v, 32, 36, x => {
                if (theme === 'frost' && skiOk) { ski(x, 31, 0, 4, 2); return; }
                oval(x, 16, 32, 13, 4, 'rgba(0,0,0,0.25)');
                const g = theme === 'elder' ? ['#235a3e', '#2f7450', '#5ae0c0'] : theme === 'ashen' ? ['#3a3430', '#4a423c', '#ff7a3a'] : theme === 'frost' ? ['#cfdcea', '#f0f6fc', '#ffffff'] : ['#3e7a36', '#52963e', '#d83a5a'];
                oval(x, 16, 22, 14, 10, g[0]); oval(x, 10, 18, 8, 7, g[1]); oval(x, 21, 16, 9, 8, g[1]);
                for (let k = 0; k < 4; k++) oval(x, 7 + hash(k, v, 2) * 18, 12 + hash(k, v, 4) * 12, 1.5, 1.5, g[2]);
            });
            case 'r': return cached('rock' + theme + v, 32, 32, x => {
                if (theme === 'frost' && skiOk) { ski(x, 81, 0, 0, 2); return; }
                oval(x, 16, 26, 14, 5, 'rgba(0,0,0,0.25)');
                const P = PAL[theme];
                x.fillStyle = P.rock; x.beginPath(); x.moveTo(3, 26); x.lineTo(6, 12); x.lineTo(14, 6); x.lineTo(24, 8); x.lineTo(29, 18); x.lineTo(28, 27); x.closePath(); x.fill();
                x.fillStyle = 'rgba(255,255,255,0.2)'; x.beginPath(); x.moveTo(7, 13); x.lineTo(14, 7); x.lineTo(20, 9); x.lineTo(12, 14); x.closePath(); x.fill();
                if (theme === 'elder') { oval(x, 12, 9, 6, 2.5, '#3f7a46'); }
                if (theme === 'veil') { x.fillStyle = '#b07aff'; x.fillRect(18, 12, 2, 8); }
            });
            case 'B': return cached('bones' + v, 32, 32, x => {
                oval(x, 16, 26, 12, 4, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#d8d2c0'; x.fillRect(6, 20, 18, 3); x.fillRect(10, 16, 3, 9); x.fillRect(19, 22, 9, 2);
                oval(x, 22, 15, 6, 5, '#e8e2d0'); x.fillStyle = '#26201e'; x.fillRect(19, 14, 2, 2); x.fillRect(23, 14, 2, 2); x.fillRect(21, 18, 2, 1);
            });
            case 'G': return cached('grave' + v, 32, 40, x => {
                oval(x, 16, 36, 12, 3.5, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#5a564e'; x.fillRect(5, 32, 22, 5);
                if (v === 1) { x.fillStyle = '#6e6a62'; x.fillRect(13, 8, 6, 26); x.fillRect(6, 14, 20, 5); }
                else { x.fillStyle = '#76726a'; x.beginPath(); x.moveTo(8, 34); x.lineTo(8, 14); x.quadraticCurveTo(16, 4, 24, 14); x.lineTo(24, 34); x.fill(); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(12, 18, 8, 1.5); x.fillRect(12, 22, 8, 1.5); }
                x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(9, 14, 2, 18);
            });
            case 'R': return cached('stone' + theme, 32, 56, x => {
                oval(x, 16, 52, 11, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = theme === 'elder' ? '#6a7a6e' : '#7a7480'; x.beginPath(); x.moveTo(7, 52); x.lineTo(9, 10); x.lineTo(16, 4); x.lineTo(24, 10); x.lineTo(25, 52); x.fill();
                x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(19, 10, 6, 42);
                x.fillStyle = '#5ae0ff'; for (let k = 0; k < 3; k++) x.fillRect(13, 16 + k * 10, 6, 2);
                if (theme === 'elder') { oval(x, 12, 12, 5, 2, '#3f7a46'); oval(x, 20, 42, 4, 2, '#3f7a46'); }
            });
            case 'b': return cached('barrel', 32, 32, x => {
                oval(x, 16, 28, 10, 3, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#8a5a32'; x.fillRect(8, 8, 16, 20); oval(x, 16, 8, 8, 3, '#a8743e'); oval(x, 16, 8, 6, 2, '#6a4224');
                x.fillStyle = '#4a4a52'; x.fillRect(8, 12, 16, 2); x.fillRect(8, 22, 16, 2);
            });
            case 'h': return cached('crate', 32, 32, x => {
                oval(x, 16, 28, 12, 3, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#b8864a'; x.fillRect(5, 10, 22, 18); x.fillStyle = '#d8a660'; x.fillRect(5, 6, 22, 5);
                x.strokeStyle = '#6a4224'; x.lineWidth = 2; x.strokeRect(6, 11, 20, 16); x.beginPath(); x.moveTo(6, 11); x.lineTo(26, 27); x.stroke();
            });
            case 'L': return cached('lamp' + theme, 32, 64, x => {
                oval(x, 16, 61, 6, 2, 'rgba(0,0,0,0.3)');
                if (theme === 'keep' || theme === 'citadel' || theme === 'frost') {      // an iron brazier on a stand
                    x.fillStyle = '#2a2830'; x.fillRect(14, 30, 4, 32); x.fillRect(9, 58, 14, 4);
                    x.fillStyle = '#3a3640'; x.beginPath(); x.moveTo(6, 22); x.lineTo(26, 22); x.lineTo(22, 32); x.lineTo(10, 32); x.fill();
                    x.fillStyle = theme === 'citadel' ? '#b07aff' : '#ff8a3a'; oval(x, 16, 22, 9, 3, x.fillStyle);
                    return;
                }
                x.fillStyle = '#2e2a30'; x.fillRect(14, 16, 4, 46); x.fillRect(11, 58, 10, 4);
                x.fillStyle = '#3a3640'; x.fillRect(9, 6, 14, 3); x.fillRect(10, 18, 12, 2);
                x.fillStyle = '#ffe9a8'; x.fillRect(11, 9, 10, 9); x.fillStyle = '#ffd25a'; x.fillRect(13, 11, 6, 5);
            });
            case 'c': return cached('crystal' + theme + v, 32, 44, x => {
                const col = theme === 'frost' ? ['#bfe8ff', '#ffffff', '191,232,255'] : ['#b07aff', '#f0e0ff', '176,122,255'];
                const g = x.createRadialGradient(16, 26, 0, 16, 26, 18); g.addColorStop(0, 'rgba(' + col[2] + ',0.5)'); g.addColorStop(1, 'rgba(' + col[2] + ',0)');
                x.fillStyle = g; x.fillRect(0, 6, 32, 38);
                const pts = [[16, 4, 6], [9, 16, 4], [23, 14, 4]];
                for (const p of pts) { x.fillStyle = col[0]; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[0] + p[2], p[1] + 14); x.lineTo(p[0], 40); x.lineTo(p[0] - p[2], p[1] + 14); x.closePath(); x.fill(); x.fillStyle = col[1]; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[0] - p[2], p[1] + 14); x.lineTo(p[0], 30); x.closePath(); x.fill(); }
            });
            case 'p': return cached('jar' + theme, 32, 32, x => {
                oval(x, 16, 28, 9, 3, 'rgba(0,0,0,0.25)');
                const c1 = theme === 'veil' || theme === 'citadel' ? '#5a4a7a' : theme === 'frost' ? '#7a8aa0' : '#b8643a';
                oval(x, 16, 19, 9, 9, c1); x.fillStyle = shade(c1, 0.7); x.fillRect(12, 8, 8, 5); oval(x, 16, 8, 5, 2, shade(c1, 1.2));
                x.fillStyle = 'rgba(255,255,255,0.2)'; x.fillRect(10, 15, 2, 7); x.fillStyle = '#e8c890'; x.fillRect(8, 19, 16, 2);
            });
            case 'C': return cached('chest' + v, 32, 32, x => {
                oval(x, 16, 28, 12, 3, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#6a3a5a'; x.fillRect(4, 13, 24, 15);
                if (v) { x.fillStyle = '#3a1a30'; x.fillRect(4, 6, 24, 7); x.fillStyle = '#ffd25a'; x.fillRect(8, 14, 16, 3); }
                else { x.fillStyle = '#8a4a7a'; x.beginPath(); x.moveTo(4, 14); x.quadraticCurveTo(16, 4, 28, 14); x.fill(); x.fillStyle = '#d8b04a'; x.fillRect(14, 12, 4, 6); }
                x.fillStyle = '#d8b04a'; x.fillRect(4, 18, 24, 2); x.fillRect(4, 13, 2, 15); x.fillRect(26, 13, 2, 15);
            });
            case 'f': return cached('fence' + theme + v, 32, 36, x => {
                if (theme === 'ashen') {                                       // a black iron graveyard fence
                    x.fillStyle = '#26222a'; for (let k = 0; k < 4; k++) { x.fillRect(3 + k * 8, 6, 2, 26); x.beginPath(); x.moveTo(2 + k * 8, 7); x.lineTo(4 + k * 8, 1); x.lineTo(6 + k * 8, 7); x.fill(); }
                    x.fillRect(0, 12, 32, 2); x.fillRect(0, 26, 32, 2); return;
                }
                x.fillStyle = '#8a5a32';
                if (v === 1) { x.fillRect(14, 4, 5, 28); x.fillStyle = '#a8743e'; x.fillRect(14, 4, 5, 3); }
                else { x.fillRect(2, 12, 5, 18); x.fillRect(25, 12, 5, 18); x.fillStyle = '#a8743e'; x.fillRect(0, 15, 32, 4); x.fillRect(0, 23, 32, 3); }
            });
            case 'gate': return cached('gate' + theme, 32, 52, x => {
                x.fillStyle = theme === 'veil' || theme === 'frost' ? '#3a3448' : '#2e2a30'; for (let k = 0; k < 5; k++) x.fillRect(2 + k * 7, 4, 3, 46);
                x.fillRect(0, 10, 32, 3); x.fillRect(0, 30, 32, 3); x.fillStyle = theme === 'veil' ? '#b07aff' : '#5a5660'; for (let k = 0; k < 5; k++) x.fillRect(2 + k * 7, 2, 3, 4);
            });
        }
        return null;
    }

    /* ---------- buildings and big props ---------- */
    const ROOF = { red: ['#b84a3a', '#8a3226'], blue: ['#3a6ab8', '#2a4a8a'], green: ['#3a8a5a', '#2a6a42'], brown: ['#8a5a3a', '#6a4228'], slate: ['#5a6070', '#40465a'] };
    // burnt: a house the dark has burned (Dawnwatch's houses are rebuilt as its beacons are lit)
    function house(w, h, roof, kind, burnt) {
        return cached('house' + w + h + roof + kind + burnt, w * TS, h * TS + 44, x => {
            const W2 = w * TS, wallH = 46, wallY = h * TS + 44 - wallH, R = burnt ? ['#3a3230', '#2a2422'] : ROOF[roof] || ROOF.red;
            x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(8, h * TS + 40, W2 - 4, 4);
            const stone = kind === 'smith' || kind === 'stone';
            x.fillStyle = burnt ? '#6a5e52' : stone ? '#a8a49a' : '#efe2c4'; x.fillRect(4, wallY, W2 - 8, wallH);
            if (stone && !burnt) for (let r = 0; r < 6; r++) for (let k = 0; k < w * 2; k++) { x.fillStyle = (r + k) & 1 ? '#96928a' : '#b4b0a6'; x.fillRect(4 + k * 16 + (r & 1) * 8, wallY + r * 8, 15, 7); }
            else { x.fillStyle = burnt ? '#2a2220' : '#6a4228'; x.fillRect(4, wallY, W2 - 8, 3); x.fillRect(4, wallY, 3, wallH); x.fillRect(W2 - 7, wallY, 3, wallH); for (let k = 1; k < w; k++) x.fillRect(k * TS - 1, wallY, 3, wallH); x.fillRect(4, wallY + 22, W2 - 8, 2); }
            if (burnt) { x.fillStyle = 'rgba(20,14,12,0.55)'; for (let k = 0; k < w; k++) oval(x, k * TS + 16, wallY + 6, 14, 10, 'rgba(20,14,12,0.45)'); }
            const door = Math.floor(w / 2);
            for (let k = 0; k < w; k++) {
                if (k === door) {
                    x.fillStyle = '#4a2e18'; x.fillRect(k * TS + 8, wallY + 18, 16, 28); x.fillStyle = burnt ? '#1a1412' : '#7a5230'; x.fillRect(k * TS + 10, wallY + 20, 12, 26);
                } else {
                    x.fillStyle = '#3a2418'; x.fillRect(k * TS + 7, wallY + 9, 18, 15);
                    x.fillStyle = burnt ? '#14100e' : '#ffd98a'; x.fillRect(k * TS + 9, wallY + 11, 14, 11);
                    if (!burnt) { x.fillStyle = '#ffeec0'; x.fillRect(k * TS + 9, wallY + 11, 6, 5); oval(x, k * TS + 16, wallY + 26, 9, 2.5, '#5a9a44'); oval(x, k * TS + 12, wallY + 25, 2, 2, '#ff6a8a'); }
                    x.fillStyle = '#3a2418'; x.fillRect(k * TS + 15, wallY + 11, 2, 11); x.fillRect(k * TS + 9, wallY + 16, 14, 2);
                }
            }
            const roofTop = 6, roofBot = wallY + 4;
            x.fillStyle = R[1]; x.beginPath(); x.moveTo(0, roofBot); x.lineTo(10, roofTop); x.lineTo(W2 - 10, roofTop); x.lineTo(W2, roofBot); x.closePath(); x.fill();
            for (let r = 0; r < 6; r++) {
                const y = roofTop + 4 + r * (roofBot - roofTop - 4) / 6, inset = 10 - r * 1.7;
                x.fillStyle = r & 1 ? R[0] : shade(R[0], 1.08); x.fillRect(inset, y, W2 - inset * 2, (roofBot - roofTop) / 6 - 1);
                x.fillStyle = 'rgba(0,0,0,0.18)'; for (let k = 0; k < W2; k += 8) x.fillRect(inset + k + (r & 1) * 4, y, 1, (roofBot - roofTop) / 6 - 1);
            }
            if (burnt) { x.fillStyle = '#0e0a0a'; x.beginPath(); x.moveTo(W2 * 0.3, roofTop + 4); x.lineTo(W2 * 0.55, roofTop + 2); x.lineTo(W2 * 0.5, roofBot - 6); x.lineTo(W2 * 0.35, roofBot - 10); x.fill(); x.fillStyle = '#3a2418'; for (let k = 0; k < 4; k++) x.fillRect(W2 * 0.32 + k * 8, roofTop + 2, 2, roofBot - roofTop - 8); }
            else { x.fillStyle = shade(R[0], 1.25); x.fillRect(10, roofTop, W2 - 20, 4); }
            x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, roofBot, W2, 3);
            x.fillStyle = '#8a7a6a'; x.fillRect(W2 - 26, roofTop - 4, 10, 18); x.fillStyle = '#5a4a3a'; x.fillRect(W2 - 27, roofTop - 6, 12, 4);
            if (burnt) return;
            if (kind === 'smith') { x.fillStyle = '#ff8a3a'; x.fillRect(W2 - 24, wallY + 30, 14, 10); x.fillStyle = '#ffd25a'; x.fillRect(W2 - 21, wallY + 33, 8, 5); }
            if (kind === 'shop') { x.fillStyle = '#6a4228'; x.fillRect(4, wallY - 2, 22, 14); oval(x, 15, wallY + 5, 4, 4, '#7ef0a0'); }
            if (kind === 'inn') { x.fillStyle = '#6a4228'; x.fillRect(W2 - 30, wallY - 2, 24, 14); oval(x, W2 - 18, wallY + 5, 7, 4, '#c9d0dc'); }
            if (kind === 'stable') { x.fillStyle = '#6a4228'; x.fillRect(4, wallY - 2, 22, 14); x.fillStyle = '#e8d8a8'; x.fillRect(9, wallY + 1, 12, 8); }
        });
    }
    const TENT = { grove: ['#3a7a4a', '#d8e8c0'], ash: ['#7a2a1e', '#2a2220'], snow: ['#6a7a8a', '#e8eef4'], guard: ['#2a4a8a', '#e8e0c8'] };
    const BANNER = { grove: ['#2f7a4a', '#d8f0a0'], ash: ['#8a1e1a', '#1a1212'], guard: ['#2a4a9a', '#ffd25a'] };
    function bigProp(p) {
        const k = p.k, w = p.w, h = p.h;
        switch (k) {
            case 'ruin': return cached('ruin' + w + h, w * TS, h * TS + 36, x => {
                const W2 = w * TS, B = h * TS + 34;
                x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(6, B - 2, W2 - 4, 4);
                x.fillStyle = '#4a423c'; x.beginPath(); x.moveTo(4, B); x.lineTo(4, 14); x.lineTo(16, 20); x.lineTo(24, 8); x.lineTo(W2 * 0.5, 22); x.lineTo(W2 - 18, 6); x.lineTo(W2 - 4, 18); x.lineTo(W2 - 4, B); x.fill();
                x.fillStyle = '#2a2420'; for (let k2 = 0; k2 < w; k2++) x.fillRect(k2 * TS + 9, B - 28, 14, 14);
                x.fillStyle = '#1a1412'; x.fillRect(W2 / 2 - 8, B - 24, 16, 24);
                x.strokeStyle = '#1a1210'; x.lineWidth = 4; x.beginPath(); x.moveTo(8, 18); x.lineTo(W2 - 10, 30); x.stroke(); x.beginPath(); x.moveTo(W2 * 0.3, 12); x.lineTo(W2 * 0.6, B - 6); x.stroke();
                x.fillStyle = '#ff7a2a'; x.fillRect(W2 * 0.3, B - 6, 2, 2); x.fillRect(W2 * 0.7, B - 10, 2, 2);
            });
            case 'beacon': return cached('beacon', 32, 72, x => {
                oval(x, 16, 68, 12, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#6a6460'; x.fillRect(6, 52, 20, 18); x.fillStyle = '#8a847c'; x.fillRect(4, 48, 24, 6);
                x.fillStyle = '#3a3440'; x.fillRect(14, 14, 4, 36); x.fillStyle = '#4a4450'; x.beginPath(); x.moveTo(4, 16); x.lineTo(28, 16); x.lineTo(23, 26); x.lineTo(9, 26); x.fill();
                x.fillStyle = '#26222a'; x.fillRect(8, 12, 16, 4);
            });
            case 'pyre': return cached('pyre', w * TS, h * TS + 70, x => {
                const W2 = w * TS, B = h * TS + 68;
                oval(x, W2 / 2, B - 4, W2 / 2, 8, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#7a746c'; x.beginPath(); x.moveTo(6, B - 4); x.lineTo(14, B - 28); x.lineTo(W2 - 14, B - 28); x.lineTo(W2 - 6, B - 4); x.fill();
                x.fillStyle = '#9a948a'; x.fillRect(12, B - 32, W2 - 24, 6);
                x.fillStyle = '#3a3440'; x.fillRect(W2 / 2 - 3, 18, 6, B - 50); x.fillStyle = '#4a4450'; x.beginPath(); x.moveTo(W2 / 2 - 20, 22); x.lineTo(W2 / 2 + 20, 22); x.lineTo(W2 / 2 + 12, 36); x.lineTo(W2 / 2 - 12, 36); x.fill();
                x.fillStyle = '#d8b04a'; x.fillRect(W2 / 2 - 20, 20, 40, 3);
            });
            case 'shrine': return cached('shrine', w * TS, h * TS + 60, x => {
                const W2 = w * TS, B = h * TS + 58;
                oval(x, W2 / 2, B - 4, W2 / 2, 7, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#6a7a6e'; x.fillRect(4, B - 18, W2 - 8, 16); x.fillStyle = '#7e8e80'; x.fillRect(2, B - 22, W2 - 4, 6);
                x.fillStyle = '#5a6a5e'; x.fillRect(10, 12, 10, B - 34); x.fillRect(W2 - 20, 12, 10, B - 34); x.fillStyle = '#7e8e80'; x.fillRect(4, 6, W2 - 8, 9);
                x.fillStyle = '#3f7a46'; oval(x, 14, 10, 8, 3, '#3f7a46'); oval(x, W2 - 20, 40, 5, 3, '#3f7a46');
                x.fillStyle = '#2a3a30'; x.fillRect(W2 / 2 - 8, B - 30, 16, 12);
            });
            case 'wagon': return cached('wagon', w * TS + 16, h * TS + 34, x => {
                const W2 = w * TS + 16, B = h * TS + 32;
                oval(x, W2 / 2, B - 2, W2 / 2, 5, 'rgba(0,0,0,0.25)');
                x.save(); x.translate(W2 / 2, B - 14); x.rotate(-0.12);
                x.fillStyle = '#7a5232'; x.fillRect(-W2 / 2 + 6, -10, W2 - 12, 14); x.fillStyle = '#5a3a20'; x.fillRect(-W2 / 2 + 6, 2, W2 - 12, 3);
                x.fillStyle = '#d8cca8'; x.beginPath(); x.moveTo(-W2 / 2 + 8, -10); x.quadraticCurveTo(0, -36, W2 / 2 - 14, -10); x.fill();
                x.fillStyle = '#1a1412'; x.beginPath(); x.moveTo(-6, -12); x.lineTo(4, -26); x.lineTo(8, -12); x.fill();
                x.restore();
                x.strokeStyle = '#3a2416'; x.lineWidth = 3; x.beginPath(); x.arc(16, B - 8, 7, 0, 6.2832); x.stroke(); x.beginPath(); x.ellipse(W2 - 18, B - 4, 7, 3, 0, 0, 6.2832); x.stroke();
                x.strokeStyle = '#2a4a2a'; x.lineWidth = 2; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(20 + k * 14, B - 6); x.quadraticCurveTo(26 + k * 14, B - 24, 18 + k * 14, B - 30); x.stroke(); }
            });
            case 'tent': return cached('tent' + (p.c || ''), w * TS, h * TS + 30, x => {
                const W2 = w * TS, B = h * TS + 28, col = TENT[p.c] || TENT.guard;
                oval(x, W2 / 2 + 4, B - 2, W2 / 2, 6, 'rgba(0,0,0,0.25)');
                for (let k2 = 0; k2 < 6; k2++) { x.fillStyle = k2 & 1 ? col[0] : col[1]; x.beginPath(); x.moveTo(W2 / 2, 4); x.lineTo(4 + k2 * (W2 - 8) / 6, B); x.lineTo(4 + (k2 + 1) * (W2 - 8) / 6, B); x.closePath(); x.fill(); }
                x.fillStyle = '#1a1210'; x.beginPath(); x.moveTo(W2 / 2, 22); x.lineTo(W2 / 2 - 9, B); x.lineTo(W2 / 2 + 9, B); x.fill();
                if (p.c === 'snow') { x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(W2 / 2, 4); x.lineTo(W2 / 2 - 18, 22); x.lineTo(W2 / 2 + 18, 22); x.fill(); }
            });
            case 'banner': return cached('banner' + (p.c || ''), 32, 80, x => {
                const col = BANNER[p.c] || BANNER.guard;
                oval(x, 16, 77, 7, 2, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#3a2a1e'; x.fillRect(14, 4, 3, 74); x.fillStyle = '#d8b04a'; x.fillRect(13, 2, 5, 4);
            });
            case 'lore': return cached('lore', 32, 48, x => {
                oval(x, 16, 45, 13, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#6a6672'; x.beginPath(); x.moveTo(4, 45); x.lineTo(6, 12); x.quadraticCurveTo(16, 2, 26, 12); x.lineTo(28, 45); x.fill();
                x.fillStyle = '#827e8a'; x.beginPath(); x.moveTo(8, 42); x.lineTo(9, 14); x.quadraticCurveTo(16, 7, 23, 14); x.lineTo(24, 42); x.fill();
                x.fillStyle = 'rgba(0,0,0,0.35)'; for (let k = 0; k < 5; k++) x.fillRect(11, 17 + k * 5, 10 - (k & 1) * 3, 1.5);
            });
            case 'ward': return cached('ward', 32, 56, x => {
                oval(x, 16, 52, 12, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#5a5a62'; x.fillRect(5, 44, 22, 9); x.fillStyle = '#7a7a84'; x.fillRect(9, 10, 14, 36); x.beginPath(); x.moveTo(9, 10); x.lineTo(16, 2); x.lineTo(23, 10); x.fill();
                x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(18, 10, 5, 36);
                x.strokeStyle = '#2a2a30'; x.lineWidth = 1.5; x.beginPath(); x.arc(16, 24, 5, 0, 6.2832); x.moveTo(16, 16); x.lineTo(16, 32); x.moveTo(8, 24); x.lineTo(24, 24); x.stroke();
            });
            case 'lever': return cached('leverbase', 32, 48, x => {
                oval(x, 16, 45, 12, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#3a3640'; x.fillRect(4, 30, 24, 16); x.fillStyle = '#4e4a56'; x.fillRect(4, 28, 24, 4);
                x.fillStyle = '#26222a'; x.fillRect(14, 4, 4, 28); for (let k = 0; k < 6; k++) { x.fillStyle = k & 1 ? '#5a5660' : '#6e6a74'; x.fillRect(13, 4 + k * 4, 6, 3); }
            });
            case 'rune': return cached('rune', 32, 64, x => {
                oval(x, 16, 60, 12, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#7a8494'; x.beginPath(); x.moveTo(6, 60); x.lineTo(8, 10); x.lineTo(16, 2); x.lineTo(25, 12); x.lineTo(26, 60); x.fill();
                x.fillStyle = '#eef4fa'; x.beginPath(); x.moveTo(8, 12); x.lineTo(16, 2); x.lineTo(25, 12); x.lineTo(16, 10); x.fill();
                x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(20, 12, 6, 48);
            });
            case 'anchor': return cached('anchor', w * TS, h * TS + 80, x => {
                const W2 = w * TS, B = h * TS + 78;
                oval(x, W2 / 2, B - 4, W2 / 2, 7, 'rgba(0,0,0,0.4)');
                x.fillStyle = '#2a2036'; x.beginPath(); x.moveTo(8, B - 4); x.lineTo(W2 / 2 - 6, 20); x.lineTo(W2 / 2 + 6, 20); x.lineTo(W2 - 8, B - 4); x.fill();
                x.fillStyle = '#3e3050'; x.beginPath(); x.moveTo(14, B - 4); x.lineTo(W2 / 2 - 3, 26); x.lineTo(W2 / 2, B - 4); x.fill();
                x.strokeStyle = '#1a1424'; x.lineWidth = 3; x.beginPath(); x.moveTo(W2 / 2, 10); x.lineTo(W2 / 2, 30); x.stroke();
            });
            case 'throne': return cached('throne' + (p.c || ''), w * TS, h * TS + 70, x => {
                const W2 = w * TS, B = h * TS + 68, vo = p.c === 'void';
                oval(x, W2 / 2, B - 4, W2 / 2, 7, 'rgba(0,0,0,0.35)');
                x.fillStyle = vo ? '#2a2038' : '#3a3440'; x.fillRect(10, 8, W2 - 20, B - 20); x.beginPath(); x.moveTo(10, 10); x.lineTo(W2 / 2, 0); x.lineTo(W2 - 10, 10); x.fill();
                x.fillStyle = vo ? '#4a3a66' : '#5a5462'; x.fillRect(4, B - 30, W2 - 8, 26); x.fillStyle = vo ? '#7a4aaa' : '#8a2a2a'; x.fillRect(16, 20, W2 - 32, B - 52);
                x.fillStyle = '#d8b04a'; x.fillRect(W2 / 2 - 2, 4, 4, 10);
            });
            case 'boat': return cached('boat' + w, w * TS + 8, 40, x => {
                x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(6, 30, w * TS - 4, 4);
                x.fillStyle = '#7a4a26'; x.beginPath(); x.moveTo(2, 18); x.lineTo(w * TS + 6, 18); x.lineTo(w * TS - 6, 32); x.lineTo(12, 32); x.closePath(); x.fill();
                x.fillStyle = '#a8703a'; x.fillRect(4, 18, w * TS, 3); x.fillStyle = '#e8e0c8'; x.fillRect(w * TS / 2 - 1, 0, 2, 18);
                x.fillStyle = '#f2ead2'; x.beginPath(); x.moveTo(w * TS / 2 + 1, 2); x.lineTo(w * TS / 2 + 16, 15); x.lineTo(w * TS / 2 + 1, 15); x.fill();
            });
            case 'well': return cached('well', 32, 52, x => {
                oval(x, 16, 46, 14, 5, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#9a968c'; x.fillRect(3, 30, 26, 16); oval(x, 16, 30, 13, 5, '#b8b4aa'); oval(x, 16, 30, 10, 3, '#1a3a5a');
                x.fillStyle = '#6a4228'; x.fillRect(4, 6, 3, 26); x.fillRect(25, 6, 3, 26); x.fillStyle = '#3a4a6a'; x.beginPath(); x.moveTo(0, 10); x.lineTo(16, 0); x.lineTo(32, 10); x.fill();
            });
            case 'stall': return cached('stall' + w, w * TS, h * TS + 34, x => {
                const W2 = w * TS;
                x.fillStyle = '#6a4228'; x.fillRect(4, 20, 4, h * TS + 12); x.fillRect(W2 - 8, 20, 4, h * TS + 12);
                x.fillStyle = '#9a6a3e'; x.fillRect(2, h * TS + 12, W2 - 4, 14);
                for (let k2 = 0; k2 < 5; k2++) oval(x, 10 + k2 * (W2 - 20) / 4, h * TS + 10, 4, 3, ['#e04a3a', '#ffd23f', '#7ac04a', '#ff8a3a', '#a85ad8'][k2]);
                for (let k2 = 0; k2 < W2; k2 += 10) { x.fillStyle = (k2 / 10) & 1 ? '#ffffff' : '#2a4a9a'; x.beginPath(); x.moveTo(k2, 22); x.lineTo(k2 + 10, 22); x.lineTo(k2 + 12, 6); x.lineTo(k2 + 2, 6); x.fill(); }
            });
            case 'fire': return cached('fire', 32, 32, x => { oval(x, 16, 26, 12, 4, 'rgba(0,0,0,0.3)'); x.fillStyle = '#5a3a20'; x.fillRect(5, 22, 22, 4); x.fillRect(8, 19, 16, 4); for (let k2 = 0; k2 < 6; k2++) oval(x, 6 + k2 * 4, 26, 2, 2, '#6a6a70'); });
        }
        return null;
    }

    /* ---------- props that change with the story or move a little (drawn every frame over their cached picture) ---------- */
    function flame(x, X, Y, t, s, col1, col2) {
        const f = Math.sin(t * 0.3 + X) * 2 * s;
        x.fillStyle = col1; x.beginPath(); x.moveTo(X - 7 * s, Y); x.quadraticCurveTo(X, Y - 22 * s - f, X + 7 * s, Y); x.fill();
        x.fillStyle = col2; x.beginPath(); x.moveTo(X - 3.5 * s, Y); x.quadraticCurveTo(X, Y - 12 * s + f, X + 3.5 * s, Y); x.fill();
    }
    const ANIM = {
        beacon(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            if ((ST().beacons || 0) >= o.at.n) { flame(x, X + 16, Y + 18, t, 1, '#ff9a3a', '#fff2a8'); x.globalAlpha = 0.35 + Math.sin(t * 0.1 + o.at.n) * 0.08; x.drawImage(API.glow('#ffc860'), X - 24, Y - 30, 80, 80); x.globalAlpha = 1; }
            else { x.fillStyle = '#3a3036'; x.fillRect(X + 8, Y + 12, 16, 3); }
        },
        pyre(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            if (ST().great) { flame(x, X + o.dw / 2, Y + 22, t, 2, '#ffb040', '#fff6c8'); x.globalAlpha = 0.5; const g = 150 + Math.sin(t * 0.05) * 10; x.drawImage(API.glow('#ffd76a'), X + o.dw / 2 - g / 2, Y + 10 - g / 2, g, g); x.globalAlpha = 1; }
        },
        shrine(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            const s = ST(), cx = X + o.dw / 2, cy = Y + o.dh - 26;
            const col = s.root ? '#7ef0c0' : '#5a2a6a';
            x.globalAlpha = 0.45 + Math.sin(t * 0.06) * 0.15; x.drawImage(API.glow(col), cx - 22, cy - 22, 44, 44); x.globalAlpha = 1;
            if (s.seed) { x.fillStyle = '#d8ffe0'; x.beginPath(); x.arc(cx, cy, 3, 0, 6.2832); x.fill(); }
        },
        banner(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            const col = BANNER[o.at.c] || BANNER.guard, wv = Math.sin(t * 0.08 + X) * 2;
            x.fillStyle = col[0]; x.beginPath(); x.moveTo(X + 17, Y + 8); x.lineTo(X + 31 + wv, Y + 10); x.lineTo(X + 30 + wv, Y + 40); x.lineTo(X + 24 + wv * 0.5, Y + 34); x.lineTo(X + 17, Y + 40); x.fill();
            x.fillStyle = col[1]; x.beginPath(); x.arc(X + 24 + wv * 0.6, Y + 22, 3.5, 0, 6.2832); x.fill();
        },
        lore(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            if (!((ST().lore || 0) & (1 << o.at.n))) { x.globalAlpha = 0.4 + Math.sin(t * 0.08 + o.at.n) * 0.2; x.drawImage(API.glow('#9ad8ff'), X - 6, Y + 2, 44, 44); x.globalAlpha = 1; }
        },
        ward(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            const lit = (ST().wards || 0) & (1 << o.at.n);
            if (lit) { x.globalAlpha = 0.55 + Math.sin(t * 0.1 + o.at.n) * 0.15; x.drawImage(API.glow('#ffffff'), X - 10, Y + 2, 52, 52); x.globalAlpha = 1; x.fillStyle = '#fff6c8'; x.fillRect(X + 15, Y + 16, 2, 16); x.fillRect(X + 8, Y + 23, 16, 2); }
        },
        lever(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            const on = (ST().levers || 0) & (1 << o.at.n), a = on ? 0.9 : -0.9;
            x.strokeStyle = '#8a8490'; x.lineWidth = 3; x.beginPath(); x.moveTo(X + 16, Y + 30); x.lineTo(X + 16 + Math.sin(a) * 16, Y + 30 - Math.cos(a) * 16); x.stroke();
            x.fillStyle = on ? '#7ef0a0' : '#d23a3a'; x.beginPath(); x.arc(X + 16 + Math.sin(a) * 16, Y + 30 - Math.cos(a) * 16, 3.5, 0, 6.2832); x.fill();
        },
        rune(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            const read = (ST().runes || 0) & (1 << o.at.n);
            x.fillStyle = read ? '#7ef0ff' : '#3a4a5e'; for (let k = 0; k < 3; k++) x.fillRect(X + 12, Y + 20 + k * 10, 8, 2);
            if (read) { x.globalAlpha = 0.35 + Math.sin(t * 0.1) * 0.15; x.drawImage(API.glow('#7ef0ff'), X - 8, Y + 6, 48, 48); x.globalAlpha = 1; }
        },
        anchor(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            const broken = (ST().anchors || 0) & (1 << o.at.n), cx = X + o.dw / 2, cy = Y + 18;
            if (broken) { x.fillStyle = '#4a3a5a'; x.fillRect(cx - 4, cy - 2, 8, 8); return; }
            const pulse = 1 + Math.sin(t * 0.12 + o.at.n) * 0.2;
            x.globalAlpha = 0.6; x.drawImage(API.glow('#b07aff'), cx - 30 * pulse, cy - 30 * pulse, 60 * pulse, 60 * pulse); x.globalAlpha = 1;
            x.fillStyle = '#e8d0ff'; x.beginPath(); x.moveTo(cx, cy - 12); x.lineTo(cx + 7, cy); x.lineTo(cx, cy + 12); x.lineTo(cx - 7, cy); x.fill();
            x.strokeStyle = 'rgba(200,140,255,0.6)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx, cy + 12); x.lineTo(cx + Math.sin(t * 0.07) * 6, Y + o.dh - 8); x.stroke();
        },
        throne(x, X, Y, t, o) { x.drawImage(o.img, X, Y); if (o.at.c === 'void') { x.globalAlpha = 0.3 + Math.sin(t * 0.05) * 0.1; x.drawImage(API.glow('#8a4aff'), X - 10, Y - 10, o.dw + 20, o.dw + 20); x.globalAlpha = 1; } },
        fire(x, X, Y, t, o) { x.drawImage(o.img, X, Y); flame(x, X + 16, Y + 22, t, 1, '#ff7a2a', '#ffd25a'); }
    };

    /* ---------- build an area ---------- */
    function build(Z, def, api) {
        API = api;
        const theme = def.ground, P = PAL[theme], cols = Z.cols, rows = Z.rows;
        THEME = theme;
        const at = (tx, ty) => (tx < 0 || ty < 0 || tx >= cols || ty >= rows) ? '^' : String.fromCharCode(Z.tiles[ty * cols + tx]);
        const raised = (tx, ty) => RAISED[(tx < 0 || ty < 0 || tx >= cols || ty >= rows) ? 94 : Z.tiles[ty * cols + tx]] === 1;
        const g = document.createElement('canvas'); g.width = cols * TS; g.height = rows * TS;
        const x = g.getContext('2d');
        Z.water = []; Z.void = []; Z.glow = [];
        const floor = theme === 'keep' || theme === 'citadel' || theme === 'veil' ? 'x' : theme === 'ashen' ? 'a' : '.';
        const GROUND = '.,F=xdaiw';
        const under = (tx, ty) => { for (const o of [[-1, 0], [1, 0], [0, 1], [0, -1]]) { const n = at(tx + o[0], ty + o[1]); if (GROUND.indexOf(n) >= 0 && n !== 'w') return n; } return floor; };
        const kinds = new Array(cols * rows), soft = new Path2D(), wet = new Path2D();
        for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
            const c = at(tx, ty);
            const base = raised(tx, ty) ? floor : 'bhpCLcrgqGRBkTP'.indexOf(c) >= 0 ? under(tx, ty) : c;
            kinds[ty * cols + tx] = base;
            if (c === '~') (theme === 'veil' || theme === 'citadel' ? Z.void : Z.water).push(tx * TS, ty * TS);
            if (base === '~') wet.rect(tx * TS, ty * TS, TS, TS);
            else if ('.,FaT'.indexOf(base) >= 0 && SOFT[theme]) soft.rect(tx * TS, ty * TS, TS, TS);
        }
        for (const pass of [true, false]) {
            BASE = pass;
            for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) paint(x, kinds[ty * cols + tx], tx * TS, ty * TS, tx, ty, P, at);
        }
        BASE = true;
        const n = cols * rows, low = api.tier === 'low';
        if (!low) {
            const light = theme === 'frost' ? '255,255,255' : theme === 'elder' ? '140,255,220' : '255,250,200';
            masked(x, soft, l => { for (let k = 0; k < n * 0.4; k++) {
                const gx = hash(k, 1, 31) * cols * TS, gy = hash(k, 2, 33) * rows * TS, r = 18 + hash(k, 3, 35) * 50, dark = hash(k, 4, 37) < 0.55;
                blob(l, gx, gy, r * 1.4, 0.5 + hash(k, 5, 39) * 0.4, hash(k, 6, 41) * 3, dark ? (theme === 'frost' ? '120,150,200' : '0,0,0') : light, dark ? 0.1 : 0.09);
            } });
            masked(x, wet, l => { for (let k = 0; k < n * 0.15; k++) {
                const gx = hash(k, 7, 43) * cols * TS, gy = hash(k, 8, 45) * rows * TS, r = 30 + hash(k, 9, 47) * 70;
                blob(l, gx, gy, r * 1.3, 0.5, 0, theme === 'veil' || theme === 'citadel' ? '120,40,200' : '10,40,80', 0.18);
            } });
        }
        const gr = x.createLinearGradient(0, 0, 0, 14); gr.addColorStop(0, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = gr;
        for (let ty = 1; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
            if (raised(tx, ty) || !raised(tx, ty - 1)) continue;
            x.setTransform(1, 0, 0, 1, tx * TS, ty * TS); x.fillRect(0, 0, TS, 14);
        }
        x.setTransform(1, 0, 0, 1, 0, 0);
        for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
            if (!raised(tx, ty)) continue;
            const c = at(tx, ty), px = tx * TS, py = ty * TS, south = raised(tx, ty + 1), north = raised(tx, ty - 1);
            const bv = (hash(tx, ty, 7) * 3) | 0;
            if (south && north) x.drawImage(block(c, theme, false, bv), px, py - H);
            else api.addStatic('cliff', block(c, theme, !south, bv), px, py - H, py + TS, TS, south ? TS : TS + H);
        }
        for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
            const c = at(tx, ty), px = tx * TS, py = ty * TS, v = (hash(tx, ty, 2) * 3) | 0, key = Z.id + ':' + tx + ',' + ty;
            if (c === 'T' || c === 'P') {
                oval(x, px + 20, py + 30, 22, 8, 'rgba(0,0,0,0.22)');
                const img = tree(theme, c, v);
                if (img.width === 48) api.addStatic('tree', img, px - 8, py - 64, py + 30, 48, 96);
                else api.addStatic('tree', img, px - 24 + ((hash(tx, ty, 5) * 6) | 0), Math.max(-30, py - 80), py + 30, 80, 110);
                if (theme === 'elder' && c === 'T' && v === 2) Z.glow.push(px + 16, py - 30, 3);
            }
            else if (c === 'k') api.addStatic('bush', prop('k', theme, v), px, py - 4, py + 30, 32, 36);
            else if (c === 'r') api.addStatic('rock', prop('r', theme, v), px, py, py + 28, 32, 32);
            else if (c === 'B') api.addStatic('bones', prop('B', theme, v), px, py, py + 26, 32, 32);
            else if (c === 'G') api.addStatic('grave', prop('G', theme, v & 1), px, py - 10, py + 30, 32, 40);
            else if (c === 'R') { api.addStatic('stone', prop('R', theme, 0), px, py - 26, py + 30, 32, 56); Z.glow.push(px + 16, py - 4, 1); }
            else if (c === 'b' || c === 'h') api.addStatic(c === 'b' ? 'barrel' : 'crate', prop(c, theme, 0), px, py, py + 28, 32, 32);
            else if (c === 'L') { api.addStatic('lamp', prop('L', theme, 0), px, py - 32, py + 30, 32, 64); Z.lights.push(px + 16, py - 10); Z.glow.push(px + 16, py - 18, theme === 'citadel' ? 4 : 0); }
            else if (c === 'c') { api.addStatic('crystal', prop('c', theme, v), px, py - 14, py + 28, 32, 44); Z.lights.push(px + 16, py + 10); Z.glow.push(px + 16, py + 8, theme === 'frost' ? 1 : 4); }
            else if (c === 'f') api.addStatic('fence', prop('f', theme, at(tx - 1, ty) === 'f' || at(tx + 1, ty) === 'f' ? 0 : 1), px, py - 4, py + 28, 32, 36);
            else if (c === 'g' || c === 'q') api.addStatic(c === 'g' ? 'gate' : 'gate2', prop('gate', theme, 0), px, py - 20, py + 32, 32, 52, { tx, ty });
            else if (c === 'p') Z.pots.push(api.addStatic('pot', prop('p', theme, 0), px, py, py + 28, 32, 32, { tx, ty, cx: px + 16, cy: py + 18 }));
            else if (c === 'C') {
                const open = !!api.S.opened[key];
                Z.chests.push(api.addStatic('chest', prop('C', theme, open ? 1 : 0), px, py, py + 28, 32, 32, { key, star: false, open, cx: px + 16, cy: py + 16, img2: prop('C', theme, 1) }));
            }
        }
        if (theme === 'frost' && skiOk) for (let k = 0; k < 3; k++) {                // Kenney snowmen and log piles near the camp
            const sx = [16, 7, 26][k] * TS, sy = [29, 31, 33][k] * TS, img = cached('skiprop' + k, 32, 32, c2 => ski(c2, k === 0 ? 69 : 31, 0, 0, 2));
            if (Z.tiles[(sy / TS) * cols + sx / TS] === 46) api.addStatic('snowman', img, sx, sy - 6, sy + 26, 32, 32);
        }
        Z.c3props = [];
        for (const p of def.props) {
            if (p.w) for (let y = p.y; y < p.y + p.h; y++) for (let k = p.x; k < p.x + p.w; k++) if (y >= 0 && k >= 0 && y < rows && k < cols) Z.block[y * cols + k] = api.blockOf ? api.blockOf(p) : 1;
            const sx = p.x * TS, base = (p.y + p.h) * TS;
            if (p.k === 'house') { api.addStatic('house', house(p.w, p.h, p.roof || 'red', p.kind || '', p.b !== undefined && (ST().beacons || 0) < p.b ? 1 : 0), sx, p.y * TS - 44, base, p.w * TS, p.h * TS + 44); continue; }
            const img = bigProp(p); if (!img) continue;
            const anim = ANIM[p.k], wide = p.k === 'wagon' ? 8 : 0;
            const s = api.addStatic(p.k, img, sx - wide - (p.k === 'boat' ? 4 : 0), base - img.height + (p.k === 'boat' ? 8 : 0), base, img.width, img.height,
                anim ? { draw: anim, at: p, cx: sx + p.w * 16, cy: base - 8 } : { cx: sx + p.w * 16, cy: base - 8 });
            Z.c3props.push(s);
            if (p.k === 'fire') { Z.lights.push(sx + 16, p.y * TS + 16); Z.glow.push(sx + 16, p.y * TS + 12, 2); }
            if (p.k === 'boat') Z.boats.push(s);
            if (p.k === 'anchor' || p.k === 'beacon' || p.k === 'pyre') Z.lights.push(sx + p.w * 16, base - 40);
        }
        if (P.tint) { x.fillStyle = P.tint; x.fillRect(0, 0, g.width, g.height); }
        Z.ground = g;
    }
    const GLOWC = ['#ffc860', '#7ae0ff', '#ffb050', '#5ae0c0', '#b07aff'];
    // every frame: water glints, void sparks (only on screen)
    function drawUnder(x, Z, cx, cy, t) {
        const V = window.HM_VIEW || { w: 640, h: 360 }, W = V.w, Hh = V.h, wl = Z.water, vl = Z.void;
        if (wl && wl.length && Z.def.ground !== 'frost') {
            x.fillStyle = 'rgba(220,245,255,0.35)';
            for (let i = 0; i < wl.length; i += 2) {
                const px = wl[i] - cx, py = wl[i + 1] - cy; if (px < -32 || py < -32 || px > W || py > Hh) continue;
                const k = (t * 0.5 + wl[i] * 0.37 + wl[i + 1] * 0.61) % 64;
                if (k < 32) x.fillRect(px + (k * 0.7) % 26, py + 8 + ((wl[i] >> 5) % 3) * 7, 6 - Math.abs(k - 16) * 0.3, 1.5);
            }
        }
        if (vl && vl.length) {
            for (let i = 0; i < vl.length; i += 2) {
                const px = vl[i] - cx, py = vl[i + 1] - cy; if (px < -32 || py < -32 || px > W || py > Hh) continue;
                const k = (t * 0.7 + vl[i] * 0.53 + vl[i + 1] * 0.29) % 160;
                if (k < 40) { x.globalAlpha = 1 - Math.abs(k - 20) / 20; x.fillStyle = (vl[i] >> 5) & 1 ? '#d8b0ff' : '#ffffff'; x.fillRect(px + ((vl[i + 1] >> 5) * 7) % 28, py + 6 + ((vl[i] >> 5) * 5) % 20 - k * 0.15, 1.5, 1.5); }
            }
            x.globalAlpha = 1;
        }
    }
    function drawOver(x, Z, cx, cy, t, glow) {
        const gl = Z.glow; if (!gl) return;
        const V = window.HM_VIEW || { w: 640, h: 360 };
        for (let i = 0; i < gl.length; i += 3) {
            const px = gl[i] - cx, py = gl[i + 1] - cy; if (px < -40 || py < -40 || px > V.w + 40 || py > V.h + 40) continue;
            const kind = gl[i + 2], s = kind === 3 ? 70 : kind === 1 || kind === 4 ? 46 : kind === 2 ? 60 : 34;
            x.globalAlpha = (kind === 3 ? 0.18 : 0.3) + Math.sin(t * 0.06 + gl[i]) * 0.08;
            x.drawImage(glow(GLOWC[kind]), px - s / 2, py - s / 2, s, s);
        }
        x.globalAlpha = 1;
    }
    function skiSprite(i) { return skiOk ? cached('skisp' + i, 16, 16, c => ski(c, i, 0, 0, 1)) : null; }
    return { build, drawUnder, drawOver, house, tree, PAL, skiSprite, flame };
})();
