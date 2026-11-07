/* Hollowmere, Chapter 7: The Legend of Zelda — Ocarina of Time — 2.5D Hylian pixel-art engine.
 * Pre-renders Hyrule biomes, Triforce Pedestals, Master Sword Pedestal, Great Deku Tree, Kakariko Windmill,
 * Fairy Fountains, and Temple Sanctums onto off-screen canvases for 60 FPS performance. */
window.HM_C7_ART = (function () {
    'use strict';
    const TS = 32, CACHE = {};

    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); fn(x); return c; }
    function cached(key, w, h, fn) { return CACHE[key] || (CACHE[key] = mk(w, h, fn)); }
    function oval(x, X, Y, rx, ry, col) { x.fillStyle = col; x.beginPath(); x.ellipse(X, Y, rx, ry, 0, 0, 6.2832); x.fill(); }

    const PAL = {
        kokiri:   { grass: '#1e6b34', grass2: '#165628', dark: '#0c3316', cob: '#a89268', stone: '#8c7852', dirt: '#6e5232', water: '#1d84c8', rock: '#4e5c42', rockTop: '#6b8258', wall: '#144420', wallTop: '#287a3c', tint: 'rgba(120,255,150,0.06)', flower: '#fde047' },
        field:    { grass: '#2d8a3c', grass2: '#237230', dark: '#12401a', cob: '#cbb588', stone: '#b29a6c', dirt: '#8c683e', water: '#1e88e5', rock: '#68645c', rockTop: '#8e887c', wall: '#3c5234', wallTop: '#587c4c', tint: 'rgba(255,245,190,0.05)', flower: '#f87171' },
        castle:   { grass: '#348c44', grass2: '#287236', dark: '#1e293b', cob: '#cbd5e1', stone: '#94a3b8', dirt: '#64748b', water: '#2563eb', rock: '#475569', rockTop: '#cbd5e1', wall: '#334155', wallTop: '#64748b', tint: 'rgba(220,235,255,0.06)', flower: '#60a5fa' },
        kakariko: { grass: '#4d7c2b', grass2: '#3f6622', dark: '#27272a', cob: '#b89f78', stone: '#967e5c', dirt: '#785c3c', water: '#2563eb', rock: '#57534e', rockTop: '#78716c', wall: '#44403c', wallTop: '#68625c', tint: 'rgba(255,215,160,0.06)', flower: '#fb923c' },
        volcano:  { grass: '#443834', grass2: '#362c28', dark: '#1c1210', cob: '#68544c', stone: '#54423c', dirt: '#3e2c26', water: '#ea580c', rock: '#2e221e', rockTop: '#523c34', wall: '#281814', wallTop: '#4c2c24', tint: 'rgba(255,90,20,0.10)', flower: '#f97316' },
        water:    { grass: '#1e5868', grass2: '#164654', dark: '#0c2834', cob: '#7dd3fc', stone: '#38bdf8', dirt: '#0284c7', water: '#0369a1', rock: '#1e3a5f', rockTop: '#3b82f6', wall: '#172554', wallTop: '#1d4ed8', tint: 'rgba(80,200,255,0.08)', flower: '#38bdf8' },
        desert:   { grass: '#d97706', grass2: '#b45309', dark: '#451a03', cob: '#fde68a', stone: '#f59e0b', dirt: '#92400e', water: '#0284c7', rock: '#78350f', rockTop: '#b45309', wall: '#5c2808', wallTop: '#8c4214', tint: 'rgba(255,200,90,0.08)', flower: '#fef08a' },
        dungeon:  { grass: '#1e293b', grass2: '#172030', dark: '#090d16', cob: '#475569', stone: '#334155', dirt: '#1e293b', water: '#0284c7', rock: '#1e293b', rockTop: '#334155', wall: '#0f172a', wallTop: '#334155', tint: 'rgba(60,90,160,0.09)', flower: '#facc15' },
        shadow:   { grass: '#1e162e', grass2: '#161022', dark: '#090612', cob: '#3b2854', stone: '#2c1c40', dirt: '#1c122c', water: '#311048', rock: '#241638', rockTop: '#3e285c', wall: '#140c20', wallTop: '#2c1c44', tint: 'rgba(130,60,220,0.12)', flower: '#c084fc' }
    };

    function drawTriforce(x, cx, cy, r) {
        x.fillStyle = '#facc15';
        x.strokeStyle = '#a16207';
        x.lineWidth = 1.2;
        const h = r * 0.86;
        const tris = [
            [cx, cy - h * 0.9, cx - r * 0.5, cy, cx + r * 0.5, cy],
            [cx - r * 0.5, cy, cx - r, cy + h * 0.9, cx, cy + h * 0.9],
            [cx + r * 0.5, cy, cx, cy + h * 0.9, cx + r, cy + h * 0.9]
        ];
        for (const t of tris) {
            x.beginPath();
            x.moveTo(t[0], t[1]); x.lineTo(t[2], t[3]); x.lineTo(t[4], t[5]);
            x.closePath(); x.fill(); x.stroke();
        }
    }

    function stoneTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.stone; x.fillRect(px, py, TS, TS);
        x.strokeStyle = P.dark; x.lineWidth = 1;
        x.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
        if (hash(tx, ty, 1) < 0.35) {
            x.fillStyle = P.cob; x.fillRect(px + 3, py + 3, 12, 10);
            x.fillRect(px + 17, py + 16, 11, 9);
        }
    }

    function pathTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.cob; x.fillRect(px, py, TS, TS);
        x.fillStyle = P.stone;
        for (let i = 0; i < 4; i++) {
            const rx = (hash(tx, ty, i * 3) * 20) | 0, ry = (hash(tx, ty, i * 3 + 1) * 20) | 0;
            x.fillRect(px + rx, py + ry, 9, 6);
        }
        x.fillStyle = P.dark;
        x.fillRect(px, py, TS, 1); x.fillRect(px, py + 15, TS, 1);
    }

    function bridgeTile(x, px, py, P) {
        x.fillStyle = P.water; x.fillRect(px, py, TS, TS);
        x.fillStyle = '#78350f'; x.fillRect(px + 1, py, TS - 2, TS);
        x.fillStyle = '#92400e'; x.fillRect(px + 3, py + 2, TS - 6, 6); x.fillRect(px + 3, py + 12, TS - 6, 6); x.fillRect(px + 3, py + 22, TS - 6, 6);
        x.fillStyle = '#451a03'; x.fillRect(px, py, 3, TS); x.fillRect(px + TS - 3, py, 3, TS);
    }

    function waterTile(x, px, py, tx, ty, P, theme) {
        x.fillStyle = P.water; x.fillRect(px, py, TS, TS);
        x.fillStyle = theme === 'volcano' ? 'rgba(253,224,71,0.45)' : 'rgba(186,230,253,0.32)';
        x.fillRect(px + 4, py + 10 + ((hash(tx, ty, 4) * 8) | 0), 22, 3);
    }

    function wallTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.wall; x.fillRect(px, py, TS, TS);
        x.fillStyle = P.wallTop; x.fillRect(px, py, TS, 10);
        x.strokeStyle = P.dark; x.lineWidth = 1;
        x.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
    }

    function tileProp(name, theme, v) {
        switch (name) {
            case 'tree': return cached('c7tree_' + theme + '_' + v, 64, 84, x => {
                oval(x, 32, 76, 18, 6, 'rgba(0,0,0,0.28)');
                x.fillStyle = '#5c3418'; x.fillRect(26, 38, 12, 38);
                const c1 = theme === 'desert' ? '#a16207' : theme === 'volcano' ? '#44403c' : '#15803d';
                const c2 = theme === 'desert' ? '#ca8a04' : theme === 'volcano' ? '#57534e' : '#22c55e';
                oval(x, 20, 34, 15, 13, c1); oval(x, 44, 34, 15, 13, c1);
                oval(x, 32, 22, 18, 15, c2);
            });
            case 'bush': return cached('c7bush_' + theme + '_' + v, 32, 34, x => {
                oval(x, 16, 30, 12, 4, 'rgba(0,0,0,0.24)');
                oval(x, 16, 22, 13, 9, '#15803d');
                oval(x, 11, 18, 8, 6, '#22c55e'); oval(x, 21, 17, 8, 6, '#22c55e');
            });
            case 'lamp': return cached('c7lamp_' + theme, 32, 60, x => {
                oval(x, 16, 56, 7, 2.5, 'rgba(0,0,0,0.28)');
                x.fillStyle = '#475569'; x.fillRect(12, 24, 8, 32); x.fillRect(8, 52, 16, 5);
                oval(x, 16, 18, 8, 8, '#f97316');
                oval(x, 16, 18, 4, 4, '#fef08a');
            });
            case 'pot': return cached('c7pot_' + theme, 32, 32, x => {
                oval(x, 16, 28, 9, 3, 'rgba(0,0,0,0.26)');
                oval(x, 16, 19, 9, 9, '#b45309');
                oval(x, 14, 17, 5, 6, '#d97706');
                x.fillStyle = '#78350f'; x.fillRect(11, 8, 10, 4);
            });
            case 'chest': return cached('c7chest_' + v, 32, 32, x => {
                oval(x, 16, 28, 12, 3.5, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#92400e'; x.fillRect(4, 13, 24, 15);
                x.fillStyle = v ? '#451a03' : '#b45309';
                x.fillRect(4, 7, 24, 7);
                x.fillStyle = '#facc15';
                x.fillRect(4, 14, 24, 2); x.fillRect(14, 12, 4, 6);
            });
            case 'gate': return cached('c7gate_' + theme, 32, 52, x => {
                x.fillStyle = '#1e293b';
                for (let k = 0; k < 5; k++) x.fillRect(2 + k * 7, 4, 3, 46);
                x.fillRect(0, 10, 32, 3); x.fillRect(0, 32, 32, 3);
                drawTriforce(x, 16, 21, 6);
            });
        }
        return null;
    }

    function bigProp(p) {
        const k = p.k;
        if (k === 'triforce_pad') {
            return cached('c7_triforce_pad_' + (p.song || 'default'), 64, 48, x => {
                oval(x, 32, 28, 28, 12, 'rgba(30, 58, 138, 0.82)');
                x.strokeStyle = '#fde047'; x.lineWidth = 2;
                x.beginPath(); x.ellipse(32, 28, 26, 10, 0, 0, 6.2832); x.stroke();
                drawTriforce(x, 32, 26, 12);
            });
        }
        if (k === 'pedestal') {
            return cached('c7_master_sword_pedestal', 96, 88, x => {
                oval(x, 48, 78, 38, 9, 'rgba(0,0,0,0.35)');
                x.fillStyle = '#cbd5e1'; x.fillRect(18, 52, 60, 24);
                x.fillStyle = '#94a3b8'; x.fillRect(26, 42, 44, 12);
                drawTriforce(x, 48, 64, 9);
                // Master Sword in Pedestal
                x.fillStyle = '#e2e8f0'; x.fillRect(46, 14, 4, 30);
                x.fillStyle = '#2563eb'; x.fillRect(36, 14, 24, 5);
                x.fillStyle = '#facc15'; x.fillRect(46, 4, 4, 10);
            });
        }
        if (k === 'deku_tree') {
            return cached('c7_deku_tree', 192, 168, x => {
                oval(x, 96, 156, 78, 12, 'rgba(0,0,0,0.38)');
                x.fillStyle = '#5c3418'; x.fillRect(44, 54, 104, 102);
                oval(x, 96, 48, 86, 44, '#15803d');
                oval(x, 64, 38, 48, 28, '#22c55e');
                oval(x, 128, 38, 48, 28, '#22c55e');
                // Wise bark brow & mustache
                x.fillStyle = '#3f220e';
                x.fillRect(62, 76, 68, 8);
                x.fillRect(58, 104, 76, 10);
                // Hollow mouth entrance
                x.fillStyle = '#090d16';
                x.beginPath(); x.arc(96, 154, 24, Math.PI, 0); x.closePath(); x.fill();
            });
        }
        if (k === 'windmill') {
            return cached('c7_windmill', 128, 140, x => {
                oval(x, 64, 130, 44, 9, 'rgba(0,0,0,0.32)');
                x.fillStyle = '#78350f'; x.fillRect(36, 48, 56, 82);
                x.fillStyle = '#92400e';
                x.beginPath(); x.moveTo(28, 50); x.lineTo(64, 18); x.lineTo(100, 50); x.closePath(); x.fill();
                // Sails
                x.fillStyle = '#fef3c7';
                x.fillRect(14, 44, 100, 10);
                x.fillRect(59, 2, 10, 96);
                oval(x, 64, 49, 8, 8, '#f59e0b');
            });
        }
        if (k === 'fairy_fountain') {
            return cached('c7_fairy_fountain', 96, 72, x => {
                oval(x, 48, 60, 42, 10, 'rgba(0,0,0,0.3)');
                oval(x, 48, 46, 36, 14, '#38bdf8');
                oval(x, 48, 46, 26, 9, '#bae6fd');
                oval(x, 48, 22, 10, 10, '#f472b6');
                oval(x, 48, 22, 5, 5, '#fdf2f8');
            });
        }
        if (k === 'temple' || k === 'castle') {
            return cached('c7_temple_' + (p.c || 'time'), (p.w || 7) * TS, (p.h || 4) * TS + 48, x => {
                const W = (p.w || 7) * TS, Hh = (p.h || 4) * TS + 48;
                const dark = p.c === 'ganon';
                x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(8, Hh - 6, W - 16, 6);
                x.fillStyle = dark ? '#1e1b4b' : '#e2e8f0';
                x.fillRect(14, 44, W - 28, Hh - 48);
                x.fillStyle = dark ? '#7f1d1d' : '#1d4ed8';
                x.beginPath(); x.moveTo(8, 46); x.lineTo(W / 2, 6); x.lineTo(W - 8, 46); x.closePath(); x.fill();
                drawTriforce(x, W / 2, 34, 14);
                x.fillStyle = '#0f172a';
                x.beginPath(); x.arc(W / 2, Hh - 28, 18, Math.PI, 0); x.lineTo(W / 2 + 18, Hh - 4); x.lineTo(W / 2 - 18, Hh - 4); x.closePath(); x.fill();
            });
        }
        if (k === 'house') {
            return cached('c7house_' + (p.w || 4) + '_' + (p.h || 3) + '_' + (p.roof || 'green'), (p.w || 4) * TS, (p.h || 3) * TS + 40, x => {
                const W = (p.w || 4) * TS, Hh = (p.h || 3) * TS + 40;
                x.fillStyle = 'rgba(0,0,0,0.26)'; x.fillRect(6, Hh - 4, W - 12, 4);
                x.fillStyle = '#e7d8c0'; x.fillRect(6, 34, W - 12, Hh - 36);
                x.fillStyle = p.roof === 'red' ? '#b91c1c' : p.roof === 'blue' ? '#1d4ed8' : '#15803d';
                x.beginPath(); x.moveTo(0, 36); x.lineTo(W / 2, 4); x.lineTo(W, 36); x.closePath(); x.fill();
                x.fillStyle = '#5c3418'; x.fillRect(W / 2 - 10, Hh - 28, 20, 26);
            });
        }
        if (k === 'shrine' || k === 'gossip_stone') {
            return cached('c7_shrine_' + k, 64, 68, x => {
                oval(x, 32, 62, 22, 6, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#94a3b8';
                x.beginPath(); x.arc(32, 34, 18, Math.PI, 0); x.lineTo(50, 60); x.lineTo(14, 60); x.closePath(); x.fill();
                drawTriforce(x, 32, 38, 10);
            });
        }
        return null;
    }

    function build(arg1, arg2, arg3) {
        let Z, def, api;
        if (arg3) { Z = arg1; def = arg2; api = arg3; }
        else { def = arg1; api = arg2; Z = api.Z; }

        const rows = def.rows.length, cols = def.rows[0].length;
        const g = document.createElement('canvas'); g.width = cols * TS; g.height = rows * TS;
        const x = g.getContext('2d');
        const theme = def.ground || 'kokiri', P = PAL[theme] || PAL.kokiri;

        if (!Z.lights) Z.lights = [];
        Z.glow = [];
        if (!Z.chests) Z.chests = [];
        if (!Z.pots) Z.pots = [];
        if (!Z.block || Z.block.length !== rows * cols) Z.block = new Uint8Array(rows * cols);
        Z.water = [];

        const at = (tx, ty) => {
            if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) return '^';
            if (Z.tiles && Z.tiles.length === rows * cols) return String.fromCharCode(Z.tiles[ty * cols + tx]);
            return def.rows[ty][tx];
        };

        for (let ty = 0; ty < rows; ty++) {
            for (let tx = 0; tx < cols; tx++) {
                const c = at(tx, ty), px = tx * TS, py = ty * TS;
                if (c === '^' || c === '#') { wallTile(x, px, py, tx, ty, P); Z.block[ty * cols + tx] = 1; continue; }
                if (c === '~') { waterTile(x, px, py, tx, ty, P, theme); Z.water.push(px, py); Z.block[ty * cols + tx] = 1; continue; }
                if (c === 'w') { bridgeTile(x, px, py, P); Z.block[ty * cols + tx] = 0; continue; }
                if (c === '=') { pathTile(x, px, py, tx, ty, P); continue; }
                if (c === 'x' || c === 'd') { stoneTile(x, px, py, tx, ty, P); continue; }
                x.fillStyle = P.grass; x.fillRect(px, py, TS, TS);
                if (hash(tx, ty, 0) < 0.28) { x.fillStyle = P.grass2; x.fillRect(px + 4, py + 4, 10, 8); }
                if (c === 'F') {
                    x.fillStyle = P.flower || '#fde047';
                    x.fillRect(px + 8, py + 10, 4, 4); x.fillRect(px + 20, py + 18, 4, 4);
                }
            }
        }

        for (let ty = 0; ty < rows; ty++) {
            for (let tx = 0; tx < cols; tx++) {
                const c = at(tx, ty), px = tx * TS, py = ty * TS, v = (hash(tx, ty, 2) * 3) | 0, key = (Z.id || 'c7') + ':' + tx + ',' + ty;
                if (c === 'T' || c === 'P') {
                    Z.block[ty * cols + tx] = 1;
                    api.addStatic('tree', tileProp('tree', theme, v), px - 16, py - 52, py + 30, 64, 84);
                } else if (c === 'k') {
                    Z.block[ty * cols + tx] = 1;
                    api.addStatic('bush', tileProp('bush', theme, v), px, py - 2, py + 30, 32, 34);
                } else if (c === 'L') {
                    Z.block[ty * cols + tx] = 1;
                    api.addStatic('lamp', tileProp('lamp', theme, 0), px, py - 28, py + 30, 32, 60);
                    Z.lights.push(px + 16, py - 6); Z.glow.push(px + 16, py - 10, 0);
                } else if (c === 'g' || c === 'q') {
                    api.addStatic(c === 'g' ? 'gate' : 'gate2', tileProp('gate', theme, 0), px, py - 20, py + 32, 32, 52, { tx, ty });
                } else if (c === 'p') {
                    Z.pots.push(api.addStatic('pot', tileProp('pot', theme, 0), px, py, py + 28, 32, 32, { tx, ty, cx: px + 16, cy: py + 18 }));
                } else if (c === 'C') {
                    const open = !!(api.S && api.S.opened && api.S.opened[key]);
                    Z.chests.push(api.addStatic('chest', tileProp('chest', theme, open ? 1 : 0), px, py, py + 28, 32, 32,
                        { key, star: false, open, cx: px + 16, cy: py + 16, img2: tileProp('chest', theme, 1) }));
                }
            }
        }

        Z.c7props = [];
        for (const p of def.props || []) {
            const pw = p.w || 1, ph = p.h || 1;
            const WalkableProp = (p.k === 'triforce_pad' || p.k === 'pedestal' || p.k === 'fairy_fountain' || p.k === 'shrine' || p.k === 'gossip_stone');
            if (!WalkableProp) {
                for (let y = p.y; y < p.y + ph; y++) {
                    for (let k = p.x; k < p.x + pw; k++) {
                        if (y >= 0 && k >= 0 && y < rows && k < cols) {
                            Z.block[y * cols + k] = api.blockOf ? api.blockOf(p) : 1;
                        }
                    }
                }
            }
            const sx = p.x * TS, base = (p.y + ph) * TS;
            const img = bigProp(p);
            if (!img) continue;
            const s = api.addStatic(p.k, img, sx, base - img.height, WalkableProp ? base - img.height : base, img.width, img.height, {
                cx: sx + pw * 16,
                cy: base - 8,
                at: p,
                p,
                song: p.song || null
            });
            Z.c7props.push(s);
            if (p.k === 'triforce_pad' || p.k === 'pedestal' || p.k === 'fairy_fountain' || p.k === 'shrine') {
                Z.lights.push(sx + 32, base - 20);
                Z.glow.push(sx + 32, base - 20, p.k === 'fairy_fountain' ? 1 : 0);
            }
        }

        if (P.tint) { x.fillStyle = P.tint; x.fillRect(0, 0, g.width, g.height); }
        Z.ground = g;
    }

    const GLOWC = ['#fde047', '#38bdf8', '#f97316', '#4ade80', '#c084fc'];

    function drawUnder(x, Z, cx, cy, t) {
        const wl = Z.water;
        if (!wl || !wl.length) return;
        const V = window.HM_VIEW || { w: 640, h: 360 }, W = V.w, Hh = V.h;
        const isLava = Z.def && Z.def.ground === 'volcano';
        x.fillStyle = isLava ? 'rgba(253,224,71,0.35)' : 'rgba(186,230,253,0.28)';
        for (let i = 0; i < wl.length; i += 2) {
            const px = wl[i] - cx, py = wl[i + 1] - cy;
            if (px < -32 || py < -32 || px > W || py > Hh) continue;
            const k = (t * 0.45 + wl[i] * 0.31 + wl[i + 1] * 0.53) % 48;
            if (k < 24) x.fillRect(px + (k * 0.6) % 24, py + 10, 6, 2);
        }
    }

    const FAIRY_MOTES = Array.from({ length: 10 }, (_, i) => ({
        x: (i * 71) % 640,
        y: (i * 43) % 360,
        spd: 0.55 + (i % 3) * 0.3,
        phase: i * 0.8
    }));

    function drawOver(x, Z, cx, cy, t, glow) {
        const V = window.HM_VIEW || { w: 640, h: 360 }, W = V.w, Hh = V.h;
        const gl = Z.glow;
        if (gl && glow) {
            for (let i = 0; i < gl.length; i += 3) {
                const px = gl[i] - cx, py = gl[i + 1] - cy;
                if (px < -56 || py < -56 || px > W + 56 || py > Hh + 56) continue;
                const kind = gl[i + 2], s = 52;
                x.globalAlpha = 0.30 + Math.sin(t * 0.08 + gl[i]) * 0.08;
                x.drawImage(glow(GLOWC[kind] || GLOWC[0]), px - s / 2, py - s / 2, s, s);
            }
        }
        x.globalAlpha = 1;
        const theme = Z.def ? Z.def.ground : 'kokiri';
        x.fillStyle = theme === 'volcano' ? '#fb923c' : theme === 'water' ? '#7dd3fc' : theme === 'shadow' ? '#c084fc' : '#bbf7d0';
        for (let i = 0; i < FAIRY_MOTES.length; i++) {
            const b = FAIRY_MOTES[i];
            b.x -= b.spd;
            b.y += Math.sin(t * 0.06 + b.phase) * 0.45;
            if (b.x < -10) { b.x = W + 10; b.y = ((t * 13 + i * 67) % Hh); }
            x.fillRect(b.x, b.y, 3, 3);
        }
    }

    return { build, drawUnder, drawOver, bigProp, PAL, drawTriforce };
})();
