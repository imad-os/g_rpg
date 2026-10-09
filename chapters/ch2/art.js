/* Hollowmere, Chapter 2: the art of Larkspur Bay, drawn in code with depth (2.5D).
 * Raised ground (cliffs, walls, palisades) has a top face and a front face and casts a shadow;
 * trees, houses and props stand up and are sorted with the heroes. Everything is drawn once into
 * cached canvases when an area loads; only water, lava and crystals shimmer each frame.
 * Map letters: . grass  , dark grass  F flowers  = cobbles  x stone floor  d dirt  s sand  w planks
 *   ~ water  v tide steps (water until low tide)  a ash  l lava  D dark way down  g north gate
 *   ^ rock cliff  # wall / palisade / dungeon wall  T tree  P dead pine  k sunflowers  r rock
 *   f fence  b barrel  h crate  L lamp  c crystal  p pot  C chest */
window.HM_C2_ART = (function () {
    'use strict';
    const TS = 32, H = 20, CACHE = {};
    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); fn(x); return c; }
    function cached(key, w, h, fn) { return CACHE[key] || (CACHE[key] = mk(w, h, fn)); }
    function oval(x, X, Y, rx, ry, col) { x.fillStyle = col; x.beginPath(); x.ellipse(X, Y, rx, ry, 0, 0, 6.2832); x.fill(); }

    // colours of each area
    const PAL = {
        bay:    { grass: '#76b95a', grass2: '#5e9e48', dark: '#4f8a3e', cob: '#b9ab92', stone: '#aaa49a', dirt: '#b08a5e', sand: '#e8d6a0', water: '#2f7fb8', deep: '#245f92', rock: '#8a7f72', rockTop: '#6fae52', wall: '#b8b2a6', wallTop: '#cfc9bd', tint: 'rgba(255,190,110,0.07)' },
        fields: { grass: '#7cc25a', grass2: '#64a848', dark: '#558f3e', cob: '#c0b090', stone: '#b0a898', dirt: '#b8915e', sand: '#ecdca4', water: '#3586c0', deep: '#2a6a9e', rock: '#8c7a62', rockTop: '#78b856', wall: '#8a5a32', wallTop: '#a8743e', tint: 'rgba(255,240,170,0.05)' },
        ridge:  { grass: '#5a5048', grass2: '#4a4240', dark: '#3e3836', cob: '#6a5e58', stone: '#5e5652', dirt: '#6e5a48', sand: '#7a6a58', water: '#2a4a6a', deep: '#1e3650', rock: '#3a3236', rockTop: '#4e4448', wall: '#2e2a30', wallTop: '#46404a', tint: 'rgba(120,30,10,0.16)' },
        light:  { grass: '#3a4a44', grass2: '#30403a', dark: '#2a3632', cob: '#4a5060', stone: '#465062', dirt: '#4a4a52', sand: '#5a5a62', water: '#1d4a6a', deep: '#163a56', rock: '#2a3040', rockTop: '#3a4256', wall: '#2c3242', wallTop: '#3e4658', tint: 'rgba(10,20,50,0.28)' }
    };
    const RAISED = { 35: 1, 94: 1 };                        // # and ^

    /* ---------- ground tiles ---------- */
    function grassTile(x, px, py, tx, ty, P, base) {
        x.fillStyle = base || P.grass; x.fillRect(px, py, TS, TS);
        for (let k = 0; k < 5; k++) { const h = hash(tx, ty, k + 3); x.fillStyle = h < 0.5 ? P.grass2 : 'rgba(255,255,255,0.07)'; oval(x, px + hash(tx, ty, k) * 32, py + hash(tx, ty, k + 9) * 32, 4 + h * 6, 2 + h * 3, x.fillStyle); }
        x.strokeStyle = P.dark; x.lineWidth = 1;
        for (let k = 0; k < 4; k++) { const gx = px + hash(tx, ty, k + 20) * 30 + 1, gy = py + hash(tx, ty, k + 30) * 28 + 4; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx - 1, gy - 4); x.moveTo(gx + 2, gy); x.lineTo(gx + 3, gy - 3); x.stroke(); }
    }
    function paint(x, c, px, py, tx, ty, P, at) {
        const h = hash(tx, ty, 1);
        switch (c) {
            case '.': case 'T': case 'P': case 'k': case 'f': case 'L': case 'r': case 'b': case 'h': case 'p': case 'C': case 'g': case 'c':
                if (P === PAL.light && c !== '.') { stoneTile(x, px, py, tx, ty, P); break; }
                if (P === PAL.ridge) { ashTile(x, px, py, tx, ty, P); break; }
                grassTile(x, px, py, tx, ty, P); break;
            case ',': grassTile(x, px, py, tx, ty, P, P.dark); break;
            case 'F':
                grassTile(x, px, py, tx, ty, P);
                for (let k = 0; k < 6; k++) { const fx = px + 3 + hash(tx, ty, k + 40) * 26, fy = py + 4 + hash(tx, ty, k + 50) * 24, col = ['#ffffff', '#ffd23f', '#ff8ab0', '#8ab4ff'][(hash(tx, ty, k + 60) * 4) | 0];
                    oval(x, fx, fy, 2.2, 2.2, col); oval(x, fx, fy, 0.9, 0.9, '#f4a020'); }
                break;
            case '=': {
                x.fillStyle = P.cob; x.fillRect(px, py, TS, TS); x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(px, py, TS, TS);
                for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) {
                    const sx = px + 5 + k * 11 + (r & 1) * 5 - 2, sy = py + 4 + r * 8;
                    oval(x, sx, sy, 4.6, 3.2, shade(P.cob, 0.9 + hash(tx * 3 + k, ty * 4 + r, 7) * 0.25));
                    oval(x, sx - 1, sy - 1, 2, 1, 'rgba(255,255,255,0.18)');
                }
                break;
            }
            case 'x': stoneTile(x, px, py, tx, ty, P); break;
            case 'd':
                x.fillStyle = P.dirt; x.fillRect(px, py, TS, TS);
                for (let k = 0; k < 6; k++) oval(x, px + hash(tx, ty, k + 70) * 32, py + hash(tx, ty, k + 80) * 32, 1.5 + hash(tx, ty, k) * 2, 1.2, k & 1 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)');
                break;
            case 's':
                x.fillStyle = P.sand; x.fillRect(px, py, TS, TS);
                x.strokeStyle = 'rgba(160,120,60,0.25)'; x.lineWidth = 1;
                for (let k = 0; k < 2; k++) { x.beginPath(); x.arc(px + 16 + (h - 0.5) * 10, py + 10 + k * 12, 9, 0.3, 2.8); x.stroke(); }
                for (let k = 0; k < 4; k++) x.fillRect(px + hash(tx, ty, k + 90) * 30, py + hash(tx, ty, k + 95) * 30, 1, 1);
                break;
            case 'a': ashTile(x, px, py, tx, ty, P); break;
            case 'l': {
                x.fillStyle = '#b8381a'; x.fillRect(px, py, TS, TS);
                for (let k = 0; k < 4; k++) oval(x, px + hash(tx, ty, k + 4) * 32, py + hash(tx, ty, k + 6) * 32, 6, 3, '#ff7a22');
                for (let k = 0; k < 3; k++) oval(x, px + hash(tx, ty, k + 14) * 32, py + hash(tx, ty, k + 16) * 32, 5, 3, '#5a2014');
                oval(x, px + 16, py + 16, 4, 2, '#ffd25a');
                break;
            }
            case 'w': case 'v': {
                if (c === 'v') { waterTile(x, px, py, tx, ty, P, at); x.fillStyle = 'rgba(120,90,60,0.45)'; for (let k = 0; k < 3; k++) x.fillRect(px + 2, py + 4 + k * 10, 28, 4); break; }
                waterTile(x, px, py, tx, ty, P, at);
                for (let k = 0; k < 4; k++) {
                    x.fillStyle = k & 1 ? '#a8784a' : '#9a6a3e'; x.fillRect(px, py + k * 8, TS, 7);
                    x.fillStyle = '#5a3a20'; x.fillRect(px, py + k * 8 + 7, TS, 1);
                    x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(px, py + k * 8, TS, 1);
                    x.fillStyle = '#3a2416'; x.fillRect(px + 3 + ((tx + k) % 2) * 22, py + k * 8 + 3, 1.5, 1.5);
                }
                break;
            }
            case '~': waterTile(x, px, py, tx, ty, P, at); break;
            case 'D': {
                x.fillStyle = '#0a0c12'; x.fillRect(px, py, TS, TS);
                for (let k = 0; k < 4; k++) { x.fillStyle = k & 1 ? '#3a3e4a' : '#4a4e5a'; x.fillRect(px + 2, py + 2 + k * 7, 28, 4); }
                break;
            }
            default: grassTile(x, px, py, tx, ty, P);
        }
    }
    function stoneTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.stone; x.fillRect(px, py, TS, TS);
        for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) {
            x.fillStyle = shade(P.stone, 0.92 + hash(tx * 2 + k, ty * 2 + r, 5) * 0.18); x.fillRect(px + k * 16 + 1, py + r * 16 + 1, 14, 14);
            x.fillStyle = 'rgba(255,255,255,0.1)'; x.fillRect(px + k * 16 + 1, py + r * 16 + 1, 14, 1);
        }
        if (hash(tx, ty, 9) < 0.2) { x.strokeStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.moveTo(px + 6, py + 8); x.lineTo(px + 12, py + 14); x.lineTo(px + 10, py + 22); x.stroke(); }
    }
    function ashTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.grass; x.fillRect(px, py, TS, TS);
        for (let k = 0; k < 5; k++) oval(x, px + hash(tx, ty, k + 4) * 32, py + hash(tx, ty, k + 8) * 32, 3 + hash(tx, ty, k) * 5, 2, k & 1 ? P.grass2 : 'rgba(255,255,255,0.06)');
        if (hash(tx, ty, 12) < 0.3) { x.fillStyle = '#ff8a3a'; x.fillRect(px + hash(tx, ty, 13) * 30, py + hash(tx, ty, 14) * 30, 1.5, 1.5); }
        if (hash(tx, ty, 15) < 0.25) { x.strokeStyle = 'rgba(0,0,0,0.35)'; x.beginPath(); x.moveTo(px + 4, py + 20); x.lineTo(px + 14, py + 16); x.lineTo(px + 22, py + 22); x.stroke(); }
    }
    function waterTile(x, px, py, tx, ty, P, at) {
        const g = x.createLinearGradient(px, py, px, py + TS); g.addColorStop(0, P.water); g.addColorStop(1, P.deep);
        x.fillStyle = g; x.fillRect(px, py, TS, TS);
        const land = c => c !== '~' && c !== 'w' && c !== 'v' && c !== 'D';
        x.fillStyle = 'rgba(200,240,255,0.55)';                                           // foam along the shore
        if (land(at(tx, ty - 1))) { x.fillRect(px, py, TS, 3); x.fillStyle = 'rgba(120,200,230,0.35)'; x.fillRect(px, py + 3, TS, 6); x.fillStyle = 'rgba(200,240,255,0.55)'; }
        if (land(at(tx - 1, ty))) x.fillRect(px, py, 2, TS);
        if (land(at(tx + 1, ty))) x.fillRect(px + 30, py, 2, TS);
        if (land(at(tx, ty + 1))) x.fillRect(px, py + 30, TS, 2);
    }
    function shade(col, k) {
        const n = parseInt(col.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k)));
        return 'rgb(' + f((n >> 16) & 255) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
    }

    /* ---------- raised blocks: a top face and (on the south side) a front face ---------- */
    function block(c, theme, front) {
        const P = PAL[theme], key = 'blk' + c + theme + front;
        return cached(key, TS, TS + H, x => {
            const rock = c === '^', palis = c === '#' && theme === 'fields', top = rock ? P.rockTop : P.wallTop, face = rock ? P.rock : P.wall;
            // top face
            x.fillStyle = top; x.fillRect(0, 0, TS, TS);
            if (rock && (theme === 'bay' || theme === 'fields')) {               // grassy cliff tops
                for (let k = 0; k < 5; k++) oval(x, 4 + k * 6, 6 + (k & 1) * 12, 5, 3, shade(top, 0.85));
                x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(0, 0, TS, 2);
            } else if (palis) {                                                 // log ends
                for (let k = 0; k < 4; k++) { oval(x, 4 + k * 8, 16, 4, 4, '#c08a50'); oval(x, 4 + k * 8, 16, 2, 2, '#8a5a32'); }
            } else if (c === '#') {                                             // stone blocks
                for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) { x.fillStyle = shade(top, 0.9 + ((r + k) & 1) * 0.12); x.fillRect(k * 16 + 1, r * 16 + 1, 14, 14); }
            } else for (let k = 0; k < 4; k++) oval(x, 6 + k * 7, 10 + (k % 2) * 10, 4, 3, shade(top, 0.85));
            if (!front) return;
            // front face with layers, and a darker foot
            const g = x.createLinearGradient(0, TS, 0, TS + H); g.addColorStop(0, face); g.addColorStop(1, shade(face, 0.6));
            x.fillStyle = g; x.fillRect(0, TS, TS, H);
            if (palis) { for (let k = 0; k < 4; k++) { x.fillStyle = k & 1 ? '#7a4e2a' : '#8a5a32'; x.fillRect(k * 8, TS - 8, 7, H + 8); x.beginPath(); x.moveTo(k * 8, TS - 8); x.lineTo(k * 8 + 3.5, TS - 14); x.lineTo(k * 8 + 7, TS - 8); x.fill(); } x.fillStyle = '#4a2e18'; x.fillRect(0, TS + 4, TS, 2); x.fillRect(0, TS + 13, TS, 2); }
            else if (c === '#') { x.fillStyle = 'rgba(0,0,0,0.25)'; for (let r = 0; r < 3; r++) { x.fillRect(0, TS + r * 7, TS, 1); x.fillRect((r & 1) * 10 + 6, TS + r * 7, 1, 7); x.fillRect((r & 1) * 10 + 22, TS + r * 7, 1, 7); } }
            else { x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(0, TS + 6, TS, 2); x.fillRect(0, TS + 13, TS, 1); x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(3, TS + 2, 10, 2); }
            x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(0, TS - 1, TS, 1);                // a lit edge
        });
    }

    /* ---------- things that stand up ---------- */
    function tree(theme, v) {
        return cached('tree' + theme + v, 64, 84, x => {
            if (theme === 'ridge') {                                        // a burnt pine
                x.fillStyle = '#2a2224'; x.fillRect(29, 30, 6, 52);
                x.strokeStyle = '#2a2224'; x.lineWidth = 3;
                for (let k = 0; k < 4; k++) { const y = 36 + k * 10, d = 14 - k * 2; x.beginPath(); x.moveTo(32, y); x.lineTo(32 - d, y - 6); x.moveTo(32, y + 4); x.lineTo(32 + d, y - 2); x.stroke(); }
                x.fillStyle = '#ff6a2a'; x.fillRect(31, 60 + v * 3, 2, 2);
                return;
            }
            const greens = theme === 'light' ? ['#2a4a3e', '#35584a', '#41685a'] : v === 2 ? ['#3d7a3a', '#4f9444', '#6cb352'] : ['#3a7034', '#4c8a40', '#68ad4c'];
            x.fillStyle = '#6a4a2e'; x.fillRect(28, 50, 8, 32); x.fillStyle = '#4e3420'; x.fillRect(28, 50, 3, 32);
            oval(x, 32, 50, 24, 16, greens[0]);
            oval(x, 22, 38, 16, 14, greens[1]); oval(x, 42, 36, 16, 15, greens[1]); oval(x, 32, 26, 18, 16, greens[1]);
            oval(x, 26, 22, 10, 8, greens[2]); oval(x, 40, 30, 8, 6, greens[2]);
            x.fillStyle = 'rgba(255,255,255,0.12)'; x.beginPath(); x.ellipse(24, 18, 7, 4, -0.4, 0, 6.2832); x.fill();
            if (v === 1) for (let k = 0; k < 5; k++) oval(x, 18 + k * 7, 30 + (k & 1) * 12, 2, 2, '#e04a3a');     // apples
        });
    }
    function prop(name, v) {
        switch (name) {
            case 'k': return cached('sun' + v, 32, 50, x => {
                for (let k = 0; k < 3; k++) {
                    const sx = 6 + k * 10, top = 8 + ((k + v) % 2) * 6;
                    x.fillStyle = '#3e7a2e'; x.fillRect(sx, top + 6, 2, 50 - top - 6);
                    oval(x, sx - 3, top + 22, 4, 2, '#4f9a3a');
                    for (let a = 0; a < 8; a++) oval(x, sx + 1 + Math.cos(a * 0.785) * 5, top + Math.sin(a * 0.785) * 5, 3, 2, '#ffd23f');
                    oval(x, sx + 1, top, 3.4, 3.4, '#6a3a1a');
                }
            });
            case 'r': return cached('rock' + v, 32, 32, x => {
                oval(x, 16, 26, 14, 5, 'rgba(0,0,0,0.25)');
                x.fillStyle = v ? '#6e6a70' : '#8a857c'; x.beginPath(); x.moveTo(3, 26); x.lineTo(6, 12); x.lineTo(14, 6); x.lineTo(24, 8); x.lineTo(29, 18); x.lineTo(28, 27); x.closePath(); x.fill();
                x.fillStyle = 'rgba(255,255,255,0.22)'; x.beginPath(); x.moveTo(7, 13); x.lineTo(14, 7); x.lineTo(20, 9); x.lineTo(12, 14); x.closePath(); x.fill();
                x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(18, 18, 9, 8);
            });
            case 'b': return cached('barrel', 32, 32, x => {
                oval(x, 16, 28, 10, 3, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#8a5a32'; x.fillRect(8, 8, 16, 20); oval(x, 16, 8, 8, 3, '#a8743e'); oval(x, 16, 8, 6, 2, '#6a4224');
                x.fillStyle = '#4a4a52'; x.fillRect(8, 12, 16, 2); x.fillRect(8, 22, 16, 2); x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(10, 9, 2, 18);
            });
            case 'h': return cached('crate', 32, 32, x => {
                oval(x, 16, 28, 12, 3, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#b8864a'; x.fillRect(5, 10, 22, 18); x.fillStyle = '#d8a660'; x.fillRect(5, 6, 22, 5);
                x.strokeStyle = '#6a4224'; x.lineWidth = 2; x.strokeRect(6, 11, 20, 16); x.beginPath(); x.moveTo(6, 11); x.lineTo(26, 27); x.stroke();
            });
            case 'L': return cached('lamp', 32, 64, x => {
                oval(x, 16, 61, 6, 2, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#2e2a30'; x.fillRect(14, 16, 4, 46); x.fillRect(11, 58, 10, 4);
                x.fillStyle = '#3a3640'; x.fillRect(9, 6, 14, 3); x.fillRect(10, 18, 12, 2);
                x.fillStyle = '#ffe9a8'; x.fillRect(11, 9, 10, 9); x.fillStyle = '#ffd25a'; x.fillRect(13, 11, 6, 5);
            });
            case 'c': return cached('crystal' + v, 32, 44, x => {
                const g = x.createRadialGradient(16, 26, 0, 16, 26, 18); g.addColorStop(0, 'rgba(120,230,255,0.5)'); g.addColorStop(1, 'rgba(120,230,255,0)');
                x.fillStyle = g; x.fillRect(0, 6, 32, 38);
                const pts = [[16, 4, 6], [9, 16, 4], [23, 14, 4]];
                for (const p of pts) { x.fillStyle = '#7ae0ff'; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[0] + p[2], p[1] + 14); x.lineTo(p[0], 40); x.lineTo(p[0] - p[2], p[1] + 14); x.closePath(); x.fill(); x.fillStyle = '#d8f8ff'; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[0] - p[2], p[1] + 14); x.lineTo(p[0], 30); x.closePath(); x.fill(); }
            });
            case 'p': return cached('jar', 32, 32, x => {
                oval(x, 16, 28, 9, 3, 'rgba(0,0,0,0.25)');
                oval(x, 16, 19, 9, 9, '#b8643a'); x.fillStyle = '#8a4426'; x.fillRect(12, 8, 8, 5); oval(x, 16, 8, 5, 2, '#d8845a');
                x.fillStyle = 'rgba(255,255,255,0.2)'; x.fillRect(10, 15, 2, 7); x.fillStyle = '#e8c890'; x.fillRect(8, 19, 16, 2);
            });
            case 'C': return cached('chest' + v, 32, 32, x => {
                oval(x, 16, 28, 12, 3, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#8a5a2e'; x.fillRect(4, 13, 24, 15);
                if (v) { x.fillStyle = '#5a3a1e'; x.fillRect(4, 6, 24, 7); x.fillStyle = '#ffd25a'; x.fillRect(8, 14, 16, 3); }
                else { x.fillStyle = '#a8703a'; x.beginPath(); x.moveTo(4, 14); x.quadraticCurveTo(16, 4, 28, 14); x.fill(); x.fillStyle = '#d8b04a'; x.fillRect(14, 12, 4, 6); }
                x.fillStyle = '#d8b04a'; x.fillRect(4, 18, 24, 2); x.fillRect(4, 13, 2, 15); x.fillRect(26, 13, 2, 15);
            });
            case 'f': return cached('fence' + v, 32, 32, x => {
                x.fillStyle = '#8a5a32';
                if (v === 1) { x.fillRect(14, 2, 5, 28); x.fillStyle = '#a8743e'; x.fillRect(14, 2, 5, 3); }
                else { x.fillRect(2, 10, 5, 18); x.fillRect(25, 10, 5, 18); x.fillStyle = '#a8743e'; x.fillRect(0, 13, 32, 4); x.fillRect(0, 21, 32, 3); }
            });
            case 'gate': return cached('gate', 32, 52, x => {
                x.fillStyle = '#2e2a30'; for (let k = 0; k < 5; k++) x.fillRect(2 + k * 7, 4, 3, 46);
                x.fillRect(0, 10, 32, 3); x.fillRect(0, 30, 32, 3); x.fillStyle = '#5a5660'; for (let k = 0; k < 5; k++) x.fillRect(2 + k * 7, 2, 3, 4);
            });
        }
        return null;
    }

    /* ---------- buildings and big props (footprint w x h tiles; drawn taller than the footprint) ---------- */
    const ROOF = { red: ['#b84a3a', '#8a3226'], blue: ['#3a6ab8', '#2a4a8a'], green: ['#3a8a5a', '#2a6a42'], brown: ['#8a5a3a', '#6a4228'], slate: ['#5a6070', '#40465a'] };
    function house(w, h, roof, kind) {
        return cached('house' + w + h + roof + kind, w * TS, h * TS + 44, x => {
            const W2 = w * TS, wallH = 46, wallY = h * TS + 44 - wallH, R = ROOF[roof] || ROOF.red;
            // shadow on the ground (the sun is to the upper left)
            x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(8, h * TS + 40, W2 - 4, 4);
            // walls
            const stone = kind === 'smith' || kind === 'stone';
            x.fillStyle = stone ? '#a8a49a' : '#efe2c4'; x.fillRect(4, wallY, W2 - 8, wallH);
            if (stone) for (let r = 0; r < 6; r++) for (let k = 0; k < w * 2; k++) { x.fillStyle = (r + k) & 1 ? '#96928a' : '#b4b0a6'; x.fillRect(4 + k * 16 + (r & 1) * 8, wallY + r * 8, 15, 7); }
            else { x.fillStyle = '#6a4228'; x.fillRect(4, wallY, W2 - 8, 3); x.fillRect(4, wallY, 3, wallH); x.fillRect(W2 - 7, wallY, 3, wallH); for (let k = 1; k < w; k++) x.fillRect(k * TS - 1, wallY, 3, wallH); x.fillRect(4, wallY + 22, W2 - 8, 2); }
            // windows (warm light) and a door
            const door = Math.floor(w / 2);
            for (let k = 0; k < w; k++) {
                if (k === door) {
                    x.fillStyle = '#5a3a20'; x.fillRect(k * TS + 8, wallY + 18, 16, 28); x.fillStyle = '#7a5230'; x.fillRect(k * TS + 10, wallY + 20, 12, 26);
                    x.fillStyle = '#d8b04a'; x.fillRect(k * TS + 18, wallY + 32, 2, 2);
                } else {
                    x.fillStyle = '#4a3020'; x.fillRect(k * TS + 7, wallY + 9, 18, 15);
                    x.fillStyle = '#ffd98a'; x.fillRect(k * TS + 9, wallY + 11, 14, 11); x.fillStyle = '#ffeec0'; x.fillRect(k * TS + 9, wallY + 11, 6, 5);
                    x.fillStyle = '#4a3020'; x.fillRect(k * TS + 15, wallY + 11, 2, 11); x.fillRect(k * TS + 9, wallY + 16, 14, 2);
                    if (kind !== 'smith') { oval(x, k * TS + 16, wallY + 26, 9, 2.5, '#5a9a44'); oval(x, k * TS + 12, wallY + 25, 2, 2, '#ff6a8a'); oval(x, k * TS + 20, wallY + 25, 2, 2, '#ffd23f'); }
                }
            }
            // the roof: a front slope, with rows of tiles and a ridge
            const roofTop = 6, roofBot = wallY + 4;
            x.fillStyle = R[1]; x.beginPath(); x.moveTo(0, roofBot); x.lineTo(10, roofTop); x.lineTo(W2 - 10, roofTop); x.lineTo(W2, roofBot); x.closePath(); x.fill();
            for (let r = 0; r < 6; r++) {
                const y = roofTop + 4 + r * (roofBot - roofTop - 4) / 6, inset = 10 - r * 1.7;
                x.fillStyle = r & 1 ? R[0] : shade(R[0], 1.08); x.fillRect(inset, y, W2 - inset * 2, (roofBot - roofTop) / 6 - 1);
                x.fillStyle = 'rgba(0,0,0,0.18)'; for (let k = 0; k < W2; k += 8) x.fillRect(inset + k + (r & 1) * 4, y, 1, (roofBot - roofTop) / 6 - 1);
            }
            x.fillStyle = shade(R[0], 1.25); x.fillRect(10, roofTop, W2 - 20, 4);
            x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, roofBot, W2, 3);
            // chimney, signs
            x.fillStyle = '#8a7a6a'; x.fillRect(W2 - 26, roofTop - 4, 10, 18); x.fillStyle = '#5a4a3a'; x.fillRect(W2 - 27, roofTop - 6, 12, 4);
            if (kind === 'smith') { x.fillStyle = '#ff8a3a'; x.fillRect(W2 - 24, wallY + 30, 14, 10); x.fillStyle = '#ffd25a'; x.fillRect(W2 - 21, wallY + 33, 8, 5); }
            if (kind === 'shop') { x.fillStyle = '#6a4228'; x.fillRect(4, wallY - 2, 22, 14); x.fillStyle = '#ff5a8a'; oval(x, 15, wallY + 5, 4, 4, '#ff5a8a'); x.fillStyle = '#5ad0ff'; x.fillRect(11, wallY + 1, 3, 3); }
            if (kind === 'inn') { x.fillStyle = '#6a4228'; x.fillRect(W2 - 30, wallY - 2, 24, 14); oval(x, W2 - 18, wallY + 5, 7, 4, '#e8c890'); }
        });
    }
    function bigProp(k, w, h) {
        switch (k) {
            case 'fountain': return cached('fountain', w * TS, h * TS + 20, x => {
                const cx = w * TS / 2, cy = h * TS / 2 + 14;
                oval(x, cx, cy + 6, w * 15, h * 13, 'rgba(0,0,0,0.25)');
                oval(x, cx, cy, w * 15, h * 12, '#a8a49a'); oval(x, cx, cy - 2, w * 13, h * 10, '#3a8ac8'); oval(x, cx - 6, cy - 6, w * 6, h * 4, 'rgba(255,255,255,0.25)');
                x.fillStyle = '#b8b4aa'; x.fillRect(cx - 4, cy - 26, 8, 24); oval(x, cx, cy - 26, 9, 4, '#cfc9bd');
            });
            case 'stall': return cached('stall' + w, w * TS, h * TS + 34, x => {
                const W2 = w * TS;
                x.fillStyle = '#6a4228'; x.fillRect(4, 20, 4, h * TS + 12); x.fillRect(W2 - 8, 20, 4, h * TS + 12);
                x.fillStyle = '#9a6a3e'; x.fillRect(2, h * TS + 12, W2 - 4, 14);
                for (let k = 0; k < 5; k++) oval(x, 10 + k * (W2 - 20) / 4, h * TS + 10, 4, 3, ['#e04a3a', '#ffd23f', '#7ac04a', '#ff8a3a', '#a85ad8'][k]);
                for (let k = 0; k < W2; k += 10) { x.fillStyle = (k / 10) & 1 ? '#ffffff' : '#d23a3a'; x.beginPath(); x.moveTo(k, 22); x.lineTo(k + 10, 22); x.lineTo(k + 12, 6); x.lineTo(k + 2, 6); x.fill(); }
            });
            case 'tent': return cached('tent', w * TS, h * TS + 30, x => {
                const W2 = w * TS, B = h * TS + 28;
                oval(x, W2 / 2 + 4, B - 2, W2 / 2, 6, 'rgba(0,0,0,0.25)');
                for (let k = 0; k < 6; k++) { x.fillStyle = k & 1 ? '#a8322e' : '#d8c8a0'; x.beginPath(); x.moveTo(W2 / 2, 4); x.lineTo(4 + k * (W2 - 8) / 6, B); x.lineTo(4 + (k + 1) * (W2 - 8) / 6, B); x.closePath(); x.fill(); }
                x.fillStyle = '#2a1a14'; x.beginPath(); x.moveTo(W2 / 2, 22); x.lineTo(W2 / 2 - 9, B); x.lineTo(W2 / 2 + 9, B); x.fill();
                x.fillStyle = '#6a4228'; x.fillRect(W2 / 2 - 1, 0, 2, 8); x.fillStyle = '#d23a3a'; x.fillRect(W2 / 2 + 1, 0, 8, 5);
            });
            case 'windmill': return cached('mill', w * TS, h * TS + 60, x => {
                const W2 = w * TS, B = h * TS + 60;
                oval(x, W2 / 2 + 6, B - 4, W2 / 2, 7, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#d8ccb0'; x.beginPath(); x.moveTo(W2 / 2 - 26, B - 4); x.lineTo(W2 / 2 - 14, 30); x.lineTo(W2 / 2 + 14, 30); x.lineTo(W2 / 2 + 26, B - 4); x.closePath(); x.fill();
                x.fillStyle = '#b8ac90'; x.beginPath(); x.moveTo(W2 / 2 + 6, B - 4); x.lineTo(W2 / 2 + 14, 30); x.lineTo(W2 / 2 + 26, B - 4); x.closePath(); x.fill();
                x.fillStyle = '#8a3226'; x.beginPath(); x.moveTo(W2 / 2 - 18, 32); x.lineTo(W2 / 2, 12); x.lineTo(W2 / 2 + 18, 32); x.fill();
                x.fillStyle = '#5a3a20'; x.fillRect(W2 / 2 - 6, B - 26, 12, 22); x.fillStyle = '#ffd98a'; x.fillRect(W2 / 2 - 4, 46, 8, 8);
            });
            case 'lighthouse': return cached('lighthouse', w * TS, h * TS + 90, x => {
                const W2 = w * TS, B = h * TS + 88;
                x.fillStyle = '#d8d0c0'; x.beginPath(); x.moveTo(W2 / 2 - 22, B); x.lineTo(W2 / 2 - 14, 30); x.lineTo(W2 / 2 + 14, 22); x.lineTo(W2 / 2 + 22, B); x.closePath(); x.fill();
                x.fillStyle = '#b84a3a'; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(W2 / 2 - 21 + k * 2, B - 20 - k * 34); x.lineTo(W2 / 2 + 21 - k * 2, B - 26 - k * 34); x.lineTo(W2 / 2 + 20 - k * 2, B - 38 - k * 34); x.lineTo(W2 / 2 - 20 + k * 2, B - 32 - k * 34); x.fill(); }
                x.fillStyle = 'rgba(0,0,0,0.2)'; x.beginPath(); x.moveTo(W2 / 2 + 4, B); x.lineTo(W2 / 2 + 8, 26); x.lineTo(W2 / 2 + 14, 22); x.lineTo(W2 / 2 + 22, B); x.fill();
                x.fillStyle = '#3a3440'; x.fillRect(W2 / 2 - 4, B - 18, 8, 18);
                x.fillStyle = '#5a5660'; x.beginPath(); x.moveTo(W2 / 2 - 14, 30); x.lineTo(W2 / 2 - 4, 14); x.lineTo(W2 / 2 + 2, 26); x.lineTo(W2 / 2 + 14, 22); x.fill();   // the broken top
            });
            case 'boat': return cached('boat' + w, w * TS + 8, 40, x => {
                x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(6, 30, w * TS - 4, 4);
                x.fillStyle = '#7a4a26'; x.beginPath(); x.moveTo(2, 18); x.lineTo(w * TS + 6, 18); x.lineTo(w * TS - 6, 32); x.lineTo(12, 32); x.closePath(); x.fill();
                x.fillStyle = '#a8703a'; x.fillRect(4, 18, w * TS, 3); x.fillStyle = '#e8e0c8'; x.fillRect(w * TS / 2 - 1, 0, 2, 18);
                x.fillStyle = '#f2ead2'; x.beginPath(); x.moveTo(w * TS / 2 + 1, 2); x.lineTo(w * TS / 2 + 16, 15); x.lineTo(w * TS / 2 + 1, 15); x.fill();
            });
            case 'bell': return cached('bell', 32, 64, x => {
                oval(x, 16, 62, 10, 2, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#6a4228'; x.fillRect(4, 8, 4, 54); x.fillRect(24, 8, 4, 54); x.fillRect(2, 6, 28, 5);
                x.fillStyle = '#c89a3a'; x.beginPath(); x.moveTo(10, 30); x.quadraticCurveTo(10, 12, 16, 12); x.quadraticCurveTo(22, 12, 22, 30); x.closePath(); x.fill();
                x.fillStyle = '#ffe08a'; x.fillRect(12, 16, 2, 10); x.fillStyle = '#8a6420'; x.fillRect(9, 29, 14, 3);
            });
            case 'well': return cached('well', 32, 52, x => {
                oval(x, 16, 46, 14, 5, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#9a968c'; x.fillRect(3, 30, 26, 16); oval(x, 16, 30, 13, 5, '#b8b4aa'); oval(x, 16, 30, 10, 3, '#1a3a5a');
                x.fillStyle = '#6a4228'; x.fillRect(4, 6, 3, 26); x.fillRect(25, 6, 3, 26); x.fillStyle = '#8a3226'; x.beginPath(); x.moveTo(0, 10); x.lineTo(16, 0); x.lineTo(32, 10); x.fill();
            });
            case 'fire': return cached('fire', 32, 32, x => { oval(x, 16, 26, 12, 4, 'rgba(0,0,0,0.3)'); x.fillStyle = '#5a3a20'; x.fillRect(5, 22, 22, 4); x.fillRect(8, 19, 16, 4); for (let k = 0; k < 6; k++) oval(x, 6 + k * 4, 26, 2, 2, '#6a6a70'); });
            case 'pedestal': return cached('pedestal' + w, w * TS, h * TS + 18, x => {
                const W2 = w * TS;
                oval(x, W2 / 2, h * TS + 12, W2 / 2, 6, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#8a8478'; x.fillRect(2, 14, W2 - 4, h * TS - 2); x.fillStyle = '#b8b2a6'; x.fillRect(2, 8, W2 - 4, 8);
                x.fillStyle = '#d8b04a'; x.fillRect(W2 / 2 - 10, 10, 20, 3);
            });
        }
        return null;
    }

    /* ---------- build an area: ground canvas, standing things, lights, animated tiles ---------- */
    function build(Z, def, api) {
        const theme = def.ground, P = PAL[theme], cols = Z.cols, rows = Z.rows;
        const at = (tx, ty) => (tx < 0 || ty < 0 || tx >= cols || ty >= rows) ? '^' : String.fromCharCode(Z.tiles[ty * cols + tx]);
        const raised = (tx, ty) => RAISED[(tx < 0 || ty < 0 || tx >= cols || ty >= rows) ? 94 : Z.tiles[ty * cols + tx]] === 1;
        const g = document.createElement('canvas'); g.width = cols * TS; g.height = rows * TS;
        const x = g.getContext('2d');
        Z.water = []; Z.lava = []; Z.glow = [];
        // things standing on a tile take the ground around them (a crate on the quay stands on stone)
        const GROUND = '.,F=xdsaw';
        const under = (tx, ty) => { for (const o of [[-1, 0], [1, 0], [0, 1], [0, -1]]) { const n = at(tx + o[0], ty + o[1]); if (GROUND.indexOf(n) >= 0 && n !== 'w') return n; } return theme === 'light' ? 'x' : theme === 'ridge' ? 'a' : '.'; };
        for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
            const c = at(tx, ty), px = tx * TS, py = ty * TS;
            const base = raised(tx, ty) ? (theme === 'light' ? 'x' : theme === 'ridge' ? 'a' : '.') : 'bhpCLcrg'.indexOf(c) >= 0 ? under(tx, ty) : c;
            paint(x, base, px, py, tx, ty, P, at);
            if (c === '~' || c === 'v') Z.water.push(px, py);
            if (c === 'l') Z.lava.push(px, py);
        }
        // shadows: below raised ground and to the lower right of trees and rocks
        for (let ty = 1; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
            if (raised(tx, ty) || !raised(tx, ty - 1)) continue;
            const gr = x.createLinearGradient(0, ty * TS, 0, ty * TS + 14); gr.addColorStop(0, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
            x.fillStyle = gr; x.fillRect(tx * TS, ty * TS, TS, 14);
        }
        // raised ground: hidden inner tops go into the ground; edges stand up as sprites
        for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
            if (!raised(tx, ty)) continue;
            const c = at(tx, ty), px = tx * TS, py = ty * TS, south = raised(tx, ty + 1), north = raised(tx, ty - 1);
            if (south && north) x.drawImage(block(c, theme, false), px, py - H);
            else api.addStatic('cliff', block(c, theme, !south), px, py - H, py + TS, TS, south ? TS : TS + H);
        }
        // things standing on tiles
        for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
            const c = at(tx, ty), px = tx * TS, py = ty * TS, v = (hash(tx, ty, 2) * 3) | 0, key = Z.id + ':' + tx + ',' + ty;
            if (c === 'T' || c === 'P') {
                oval(x, px + 22, py + 30, 22, 8, 'rgba(0,0,0,0.22)');
                api.addStatic('tree', tree(theme, c === 'P' ? 0 : v), px - 16 + ((hash(tx, ty, 5) * 6) | 0), Math.max(-10, py - 54), py + 30, 64, 84);
            }
            else if (c === 'k') api.addStatic('sun', prop('k', v & 1), px, py - 20, py + 30, 32, 50);
            else if (c === 'r') api.addStatic('rock', prop('r', theme === 'ridge' ? 1 : 0), px, py, py + 28, 32, 32);
            else if (c === 'b' || c === 'h') api.addStatic(c === 'b' ? 'barrel' : 'crate', prop(c), px, py, py + 28, 32, 32);
            else if (c === 'L') { api.addStatic('lamp', prop('L'), px, py - 32, py + 30, 32, 64); Z.lights.push(px + 16, py - 10); Z.glow.push(px + 16, py - 18, 0); }
            else if (c === 'c') { api.addStatic('crystal', prop('c', v), px, py - 14, py + 28, 32, 44); Z.lights.push(px + 16, py + 10); Z.glow.push(px + 16, py + 8, 1); }
            else if (c === 'f') api.addStatic('fence', prop('f', at(tx - 1, ty) === 'f' || at(tx + 1, ty) === 'f' ? 0 : 1), px, py, py + 28, 32, 32);
            else if (c === 'g') api.addStatic('gate', prop('gate'), px, py - 20, py + 32, 32, 52, { tx, ty });
            else if (c === 'p') Z.pots.push(api.addStatic('pot', prop('p'), px, py, py + 28, 32, 32, { tx, ty, cx: px + 16, cy: py + 18 }));
            else if (c === 'C') {
                const open = !!api.S.opened[key];
                Z.chests.push(api.addStatic('chest', prop('C', open ? 1 : 0), px, py, py + 28, 32, 32, { key, star: false, open, cx: px + 16, cy: py + 16, img2: prop('C', 1) }));
            }
        }
        // buildings and big props
        for (const p of def.props) {
            if (p.w) for (let y = p.y; y < p.y + p.h; y++) for (let k = p.x; k < p.x + p.w; k++) if (y >= 0 && k >= 0 && y < rows && k < cols) Z.block[y * cols + k] = 1;
            const sx = p.x * TS, base = (p.y + p.h) * TS;
            if (p.k === 'house') api.addStatic('house', house(p.w, p.h, p.roof || 'red', p.kind || ''), sx, p.y * TS - 44, base, p.w * TS, p.h * TS + 44);
            else {
                const img = bigProp(p.k, p.w, p.h); if (!img) continue;
                const extra = p.k === 'boat' ? { cx: sx + p.w * 16, cy: p.y * TS + 16 } : p.k === 'windmill' || p.k === 'fountain' || p.k === 'fire' || p.k === 'pedestal' ? { draw: ANIM[p.k], at: p } : null;
                const s = api.addStatic(p.k, img, sx - (p.k === 'boat' ? 4 : 0), base - img.height + (p.k === 'boat' ? 8 : 0), base, img.width, img.height, extra);
                if (p.k === 'boat') Z.boats.push(s);
                if (p.k === 'fire') { Z.lights.push(sx + 16, p.y * TS + 16); Z.glow.push(sx + 16, p.y * TS + 12, 2); }
                if (p.k === 'pedestal') Z.pedestal = s;
            }
        }
        // the light of the area (warm sun, red glow, deep dark)
        if (P.tint) { x.fillStyle = P.tint; x.fillRect(0, 0, g.width, g.height); }
        Z.ground = g;
    }
    // props that move a little (drawn every frame over their cached picture)
    const ANIM = {
        windmill(x, X, Y, t) {
            const cx = X + 48, cy = Y + 40, a = t * 0.02;
            x.drawImage(CACHE.mill, X, Y);
            x.strokeStyle = '#6a4228'; x.lineWidth = 3;
            for (let k = 0; k < 4; k++) { const b = a + k * 1.5708, ex = cx + Math.cos(b) * 40, ey = cy + Math.sin(b) * 40; x.beginPath(); x.moveTo(cx, cy); x.lineTo(ex, ey); x.stroke();
                x.fillStyle = 'rgba(242,234,210,0.9)'; x.beginPath(); x.moveTo(cx + Math.cos(b) * 10, cy + Math.sin(b) * 10); x.lineTo(ex, ey); x.lineTo(ex + Math.cos(b + 1.57) * 9, ey + Math.sin(b + 1.57) * 9); x.lineTo(cx + Math.cos(b + 0.3) * 12, cy + Math.sin(b + 0.3) * 12); x.fill(); }
            x.fillStyle = '#3a2416'; x.beginPath(); x.arc(cx, cy, 4, 0, 6.2832); x.fill();
        },
        fountain(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            const cx = X + o.dw / 2, cy = Y + 6;
            x.fillStyle = 'rgba(200,240,255,0.8)';
            for (let k = 0; k < 6; k++) { const a = k * 1.047 + t * 0.05, r = 8 + ((t + k * 9) % 30) * 0.5; x.fillRect(cx + Math.cos(a) * r, cy + 4 + Math.sin(a) * r * 0.4 + ((t + k * 9) % 30) * 0.4, 2, 2); }
        },
        fire(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            const f = Math.sin(t * 0.3) * 2;
            x.fillStyle = '#ff7a2a'; x.beginPath(); x.moveTo(X + 8, Y + 22); x.quadraticCurveTo(X + 16, Y - 2 - f, X + 24, Y + 22); x.fill();
            x.fillStyle = '#ffd25a'; x.beginPath(); x.moveTo(X + 12, Y + 22); x.quadraticCurveTo(X + 16, Y + 8 + f, X + 20, Y + 22); x.fill();
        },
        pedestal(x, X, Y, t, o) { x.drawImage(o.img, X, Y); if (o.lantern) o.lantern(x, X + o.dw / 2, Y + 10, t); }
    };
    // every frame: water glints, glowing lava and crystals (only on screen)
    function drawUnder(x, Z, cx, cy, t, glow) {
        const W = 640, Hh = 360, wl = Z.water;
        if (wl) {
            x.fillStyle = 'rgba(220,245,255,0.35)';
            for (let i = 0; i < wl.length; i += 2) {
                const px = wl[i] - cx, py = wl[i + 1] - cy; if (px < -32 || py < -32 || px > W || py > Hh) continue;
                const k = (t * 0.5 + wl[i] * 0.37 + wl[i + 1] * 0.61) % 64;
                if (k < 32) x.fillRect(px + (k * 0.7) % 26, py + 8 + ((wl[i] >> 5) % 3) * 7, 6 - Math.abs(k - 16) * 0.3, 1.5);
            }
        }
        const ll = Z.lava;
        if (ll && ll.length) {
            x.globalAlpha = 0.25 + Math.sin(t * 0.06) * 0.12;
            for (let i = 0; i < ll.length; i += 2) { const px = ll[i] - cx, py = ll[i + 1] - cy; if (px < -48 || py < -48 || px > W + 16 || py > Hh + 16) continue; x.drawImage(glow('#ff7a2a'), px - 16, py - 16, 64, 64); }
            x.globalAlpha = 1;
        }
    }
    function drawOver(x, Z, cx, cy, t, glow) {
        const gl = Z.glow; if (!gl) return;
        for (let i = 0; i < gl.length; i += 3) {
            const px = gl[i] - cx, py = gl[i + 1] - cy; if (px < -40 || py < -40 || px > 680 || py > 400) continue;
            const kind = gl[i + 2], s = kind === 1 ? 46 : kind === 2 ? 60 : 34;
            x.globalAlpha = (kind === 1 ? 0.35 : 0.3) + Math.sin(t * 0.08 + gl[i]) * 0.1;
            x.drawImage(glow(kind === 1 ? '#7ae0ff' : '#ffc860'), px - s / 2, py - s / 2, s, s);
        }
        x.globalAlpha = 1;
    }
    return { build, drawUnder, drawOver, house, tree, PAL };
})();
