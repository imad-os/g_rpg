/* Hollowmere, Chapter 5: The Blood Kingdoms — 2.5D procedural and gothic horror art engine.
 * Pre-rendered onto off-screen canvases on zone entry; zero runtime allocations on 1 GB RAM Samsung Smart TVs. */
window.HM_C5_ART = (function () {
    'use strict';
    const TS = 32, H = 20, CACHE = {};
    let API = null;

    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); fn(x); return c; }
    function cached(key, w, h, fn) { return CACHE[key] || (CACHE[key] = mk(w, h, fn)); }
    function oval(x, X, Y, rx, ry, col) { x.fillStyle = col; x.beginPath(); x.ellipse(X, Y, rx, ry, 0, 0, 6.2832); x.fill(); }

    const PAL = {
        gothic:  { grass: '#242028', grass2: '#1b1720', dark: '#120f16', cob: '#484050', stone: '#3c3544', dirt: '#322a38', water: '#2a0e14', rock: '#282230', rockTop: '#383042', wall: '#1e1824', wallTop: '#342a3e', tint: 'rgba(80,10,25,0.18)', moss: '#3c1822' },
        crimson: { grass: '#2e141a', grass2: '#240e14', dark: '#18080c', cob: '#5c222c', stone: '#4e1c24', dirt: '#3e141a', water: '#520c18', rock: '#381218', rockTop: '#541c24', wall: '#2c0c12', wallTop: '#4e1620', tint: 'rgba(120,15,25,0.22)', moss: '#441018' },
        plague:  { grass: '#283024', grass2: '#1e241b', dark: '#141812', cob: '#44503c', stone: '#3a4434', dirt: '#30382b', water: '#182414', rock: '#283424', rockTop: '#384832', wall: '#1c2419', wallTop: '#303e2c', tint: 'rgba(35,80,25,0.18)', moss: '#3a5024' },
        shadow:  { grass: '#1a1828', grass2: '#141220', dark: '#0c0a14', cob: '#3c3858', stone: '#322e4c', dirt: '#28243c', water: '#080614', rock: '#221e36', rockTop: '#322c4e', wall: '#181426', wallTop: '#2e2648', tint: 'rgba(25,30,85,0.20)', moss: '#241e3a' },
        undead:  { grass: '#222622', grass2: '#1a1c1a', dark: '#101210', cob: '#3e443e', stone: '#343a34', dirt: '#2a302a', water: '#101810', rock: '#242a24', rockTop: '#343c34', wall: '#181e18', wallTop: '#2c342c', tint: 'rgba(20,50,30,0.18)', moss: '#2c3e2c' }
    };

    function stoneTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.stone; x.fillRect(px, py, TS, TS);
        x.strokeStyle = P.dark; x.lineWidth = 1;
        x.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
        if (hash(tx, ty, 1) < 0.3) {
            x.fillStyle = P.cob; x.fillRect(px + 4, py + 4, 12, 10);
            x.fillRect(px + 18, py + 16, 10, 8);
        }
    }

    function pathTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.cob; x.fillRect(px, py, TS, TS);
        x.fillStyle = P.stone;
        for (let i = 0; i < 4; i++) {
            const rx = hash(tx, ty, i * 3) * 20, ry = hash(tx, ty, i * 3 + 1) * 20;
            x.fillRect(px + rx, py + ry, 8, 6);
        }
    }

    function waterTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.water; x.fillRect(px, py, TS, TS);
        x.fillStyle = 'rgba(255,100,100,0.25)';
        x.fillRect(px + 4, py + 12, 24, 2);
    }

    function wallTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.wall; x.fillRect(px, py, TS, TS);
        x.fillStyle = P.wallTop; x.fillRect(px, py, TS, 8);
        x.strokeStyle = P.dark; x.lineWidth = 1;
        x.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
    }

    /* ---------------- Big Props ---------------- */
    function bigProp(p) {
        const k = p.k;
        if (k === 'shrine') {
            return cached('shrine', 64, 64, x => {
                x.fillStyle = '#4a4250'; x.fillRect(16, 32, 32, 28);
                x.fillStyle = '#6a6074'; x.fillRect(20, 20, 24, 12);
                // Golden Holy Cross
                x.fillStyle = '#ffd700'; x.fillRect(29, 6, 6, 22); x.fillRect(22, 12, 20, 6);
                // Halo of light
                x.strokeStyle = 'rgba(255,230,120,0.6)'; x.lineWidth = 2;
                x.beginPath(); x.arc(32, 15, 14, 0, 6.28); x.stroke();
            });
        }
        if (k === 'altar') {
            return cached('altar', 64, 64, x => {
                x.fillStyle = '#2a1a24'; x.fillRect(12, 30, 40, 26);
                x.fillStyle = '#521422'; x.fillRect(16, 22, 32, 8);
                // Crimson basin
                x.fillStyle = '#b01828'; x.beginPath(); x.ellipse(32, 22, 14, 5, 0, 0, 6.28); x.fill();
                // Runes on base
                x.fillStyle = '#ff4a5a'; x.fillRect(20, 38, 4, 10); x.fillRect(30, 38, 4, 10); x.fillRect(40, 38, 4, 10);
            });
        }
        if (k === 'crystal') {
            return cached('crystal_' + (p.n || 0), 32, 48, x => {
                x.fillStyle = '#4a121a'; x.beginPath(); x.moveTo(16, 4); x.lineTo(28, 24); x.lineTo(16, 44); x.lineTo(4, 24); x.closePath(); x.fill();
                x.fillStyle = '#e82038'; x.beginPath(); x.moveTo(16, 8); x.lineTo(24, 24); x.lineTo(16, 40); x.lineTo(8, 24); x.closePath(); x.fill();
                x.fillStyle = '#ffa4b0'; x.fillRect(14, 16, 4, 12);
            });
        }
        if (k === 'coffin') {
            return cached('coffin', 32, 48, x => {
                x.fillStyle = '#1c1622'; x.beginPath(); x.moveTo(10, 4); x.lineTo(22, 4); x.lineTo(28, 16); x.lineTo(24, 44); x.lineTo(8, 44); x.lineTo(4, 16); x.closePath(); x.fill();
                x.strokeStyle = '#8a2034'; x.lineWidth = 2; x.stroke();
                // Gilt cross on lid
                x.fillStyle = '#c8a444'; x.fillRect(14, 12, 4, 20); x.fillRect(9, 18, 14, 4);
            });
        }
        if (k === 'tomb') {
            return cached('tomb', 32, 32, x => {
                x.fillStyle = '#484450'; x.beginPath(); x.arc(16, 12, 10, Math.PI, 0); x.lineTo(26, 28); x.lineTo(6, 28); x.closePath(); x.fill();
                x.strokeStyle = '#282430'; x.lineWidth = 1; x.stroke();
                x.fillStyle = '#282430'; x.fillRect(14, 10, 4, 10); x.fillRect(11, 13, 10, 3);
            });
        }
        if (k === 'gargoyle') {
            return cached('gargoyle', 32, 40, x => {
                x.fillStyle = '#56505c'; x.fillRect(8, 24, 16, 14);      // Plinth
                x.fillStyle = '#7a7280'; x.beginPath(); x.arc(16, 14, 8, 0, 6.28); x.fill(); // Head & torso
                // Wings
                x.fillStyle = '#46404c';
                x.beginPath(); x.moveTo(10, 12); x.lineTo(2, 4); x.lineTo(6, 16); x.closePath(); x.fill();
                x.beginPath(); x.moveTo(22, 12); x.lineTo(30, 4); x.lineTo(26, 16); x.closePath(); x.fill();
                // Glowing red eyes
                x.fillStyle = '#ff2030'; x.fillRect(13, 12, 2, 2); x.fillRect(17, 12, 2, 2);
            });
        }
        if (k === 'fountain') {
            return cached('fountain', 64, 48, x => {
                x.fillStyle = '#3c2430'; x.fillRect(8, 20, 48, 24);
                x.fillStyle = '#1e1018'; x.fillRect(12, 24, 40, 16);
                x.fillStyle = '#9e1424'; x.beginPath(); x.ellipse(32, 26, 18, 6, 0, 0, 6.28); x.fill();
                x.fillStyle = '#5c1420'; x.fillRect(28, 4, 8, 20);      // Center spout
                x.fillStyle = '#ff4a5a'; x.fillRect(30, 2, 4, 6);
            });
        }
        if (k === 'cauldron') {
            return cached('cauldron', 32, 32, x => {
                x.fillStyle = '#1e241c'; x.beginPath(); x.arc(16, 18, 12, 0, 6.28); x.fill();
                x.fillStyle = '#448a30'; x.beginPath(); x.ellipse(16, 12, 10, 4, 0, 0, 6.28); x.fill();
                x.fillStyle = '#7aff44'; x.fillRect(14, 9, 3, 3);
            });
        }
        if (k === 'alembic') {
            return cached('alembic', 32, 32, x => {
                x.fillStyle = '#2a1a1e'; x.fillRect(8, 22, 16, 8);
                x.fillStyle = '#e82438'; x.beginPath(); x.arc(16, 16, 8, 0, 6.28); x.fill();
                x.strokeStyle = '#c8d4e4'; x.lineWidth = 2;
                x.beginPath(); x.moveTo(16, 8); x.lineTo(16, 4); x.lineTo(26, 12); x.stroke();
            });
        }
        if (k === 'mirror') {
            return cached('mirror', 32, 48, x => {
                x.fillStyle = '#1a1828'; x.fillRect(6, 6, 20, 36);
                x.strokeStyle = '#c8a444'; x.lineWidth = 2; x.strokeRect(6, 6, 20, 36);
                x.fillStyle = '#4a4478'; x.fillRect(9, 9, 14, 30);
                x.fillStyle = 'rgba(200,220,255,0.4)'; x.fillRect(11, 12, 3, 22);
            });
        }
        if (k === 'throne') {
            return cached('throne_' + (p.c || 'gothic'), 64, 64, x => {
                const col = p.c === 'crimson' ? '#8a1824' : p.c === 'dracula' ? '#2a1420' : '#221e2c';
                x.fillStyle = col; x.fillRect(16, 12, 32, 44);
                x.fillStyle = '#c8a434'; x.fillRect(12, 8, 40, 6);
                x.fillStyle = '#140e16'; x.fillRect(20, 26, 24, 26);
                x.fillStyle = '#a01e2c'; x.fillRect(22, 28, 20, 22);
            });
        }
        if (k === 'banner') {
            return cached('banner_' + (p.c || 'gothic'), 32, 48, x => {
                x.fillStyle = '#6a4a2e'; x.fillRect(14, 4, 4, 38);
                x.fillStyle = p.c === 'crimson' ? '#b01828' : p.c === 'dracula' ? '#18121a' : '#282038';
                x.beginPath(); x.moveTo(6, 8); x.lineTo(26, 8); x.lineTo(26, 32); x.lineTo(16, 40); x.lineTo(6, 32); x.closePath(); x.fill();
                x.fillStyle = '#c8a434'; x.fillRect(12, 14, 8, 8);
            });
        }
        if (k === 'house') {
            return cached('house_' + p.w + '_' + p.h + '_' + (p.roof || 'slate'), p.w * TS, p.h * TS + 44, x => {
                const W = p.w * TS, H = p.h * TS + 44;
                x.fillStyle = '#2a2430'; x.fillRect(0, 36, W, H - 36);
                // Roof
                x.fillStyle = p.roof === 'red' ? '#6e1822' : '#34303c';
                x.beginPath(); x.moveTo(0, 36); x.lineTo(W / 2, 4); x.lineTo(W, 36); x.closePath(); x.fill();
                // Gothic arched door
                x.fillStyle = '#120e14';
                x.beginPath(); x.arc(W / 2, H - 24, 10, Math.PI, 0); x.lineTo(W / 2 + 10, H); x.lineTo(W / 2 - 10, H); x.closePath(); x.fill();
                // Stained glass window
                x.fillStyle = '#c8283a'; x.fillRect(W / 4, 48, 8, 12);
                x.fillStyle = '#c8283a'; x.fillRect(3 * W / 4 - 8, 48, 8, 12);
            });
        }
        if (k === 'ruin') {
            return cached('ruin_' + p.w + '_' + p.h, p.w * TS, p.h * TS + 20, x => {
                const W = p.w * TS, H = p.h * TS + 20;
                x.fillStyle = '#34303c'; x.fillRect(0, 16, W, H - 16);
                x.fillStyle = '#1c1822'; x.fillRect(4, 24, 12, 14); x.fillRect(W - 18, 20, 14, 18);
            });
        }
        if (k === 'pyre') {
            return cached('pyre', 64, 64, x => {
                x.fillStyle = '#3a2416'; x.fillRect(16, 40, 32, 14);
                x.fillStyle = '#ff4a20'; x.beginPath(); x.arc(32, 36, 12, 0, 6.28); x.fill();
                x.fillStyle = '#ffd240'; x.beginPath(); x.arc(32, 34, 6, 0, 6.28); x.fill();
            });
        }
        if (k === 'well') {
            return cached('well', 32, 32, x => {
                x.fillStyle = '#4a4454'; x.beginPath(); x.arc(16, 18, 12, 0, 6.28); x.fill();
                x.fillStyle = '#140c10'; x.beginPath(); x.arc(16, 18, 8, 0, 6.28); x.fill();
            });
        }
        if (k === 'wagon') {
            return cached('wagon', 64, 32, x => {
                x.fillStyle = '#4a3424'; x.fillRect(8, 6, 48, 16);
                x.fillStyle = '#241810'; x.beginPath(); x.arc(16, 24, 6, 0, 6.28); x.arc(48, 24, 6, 0, 6.28); x.fill();
            });
        }
        return null;
    }

    function build(def, api) {
        API = api;
        const rows = def.rows.length, cols = def.rows[0].length;
        const g = document.createElement('canvas'); g.width = cols * TS; g.height = rows * TS;
        const x = g.getContext('2d');
        const theme = def.ground || 'gothic', P = PAL[theme] || PAL.gothic;
        const Z = api.Z;
        Z.lights = []; Z.glow = []; Z.chests = []; Z.pots = []; Z.block = new Uint8Array(rows * cols);
        Z.water = [];

        // 1. Draw base tiles
        for (let ty = 0; ty < rows; ty++) {
            const r = def.rows[ty];
            for (let tx = 0; tx < cols; tx++) {
                const c = r[tx], px = tx * TS, py = ty * TS;
                if (c === '^' || c === '#' || c === 'T') Z.block[ty * cols + tx] = 1;
                if (c === '~') { waterTile(x, px, py, tx, ty, P); Z.water.push(px, py); Z.block[ty * cols + tx] = 1; continue; }
                if (c === '=') { pathTile(x, px, py, tx, ty, P); continue; }
                if (c === 'x' || c === 'd') { stoneTile(x, px, py, tx, ty, P); continue; }
                if (c === '^' || c === '#') { wallTile(x, px, py, tx, ty, P); continue; }
                // Default ground
                x.fillStyle = P.grass; x.fillRect(px, py, TS, TS);
                if (hash(tx, ty, 0) < 0.25) { x.fillStyle = P.grass2; x.fillRect(px + 4, py + 4, 8, 8); }
            }
        }

        // 2. Props
        Z.c5props = [];
        for (const p of def.props || []) {
            if (p.w && p.h) {
                for (let y = p.y; y < p.y + p.h; y++) {
                    for (let k = p.x; k < p.x + p.w; k++) {
                        if (y >= 0 && k >= 0 && y < rows && k < cols) Z.block[y * cols + k] = 1;
                    }
                }
            }
            const sx = p.x * TS, base = (p.y + p.h) * TS;
            const img = bigProp(p);
            if (!img) continue;
            const s = api.addStatic(p.k, img, sx, base - img.height, base, img.width, img.height, { cx: sx + (p.w || 1) * 16, cy: base - 8, p });
            Z.c5props.push(s);
            if (p.k === 'shrine') { Z.lights.push(sx + 32, base - 20); Z.glow.push(sx + 32, base - 20, 0); }
            else if (p.k === 'altar') { Z.lights.push(sx + 32, base - 20); Z.glow.push(sx + 32, base - 20, 2); }
            else if (p.k === 'crystal') { Z.lights.push(sx + 16, base - 20); Z.glow.push(sx + 16, base - 20, 2); }
            else if (p.k === 'pyre') { Z.lights.push(sx + 32, base - 20); Z.glow.push(sx + 32, base - 20, 2); }
        }

        // 3. Tile Props (chests, pots, lamps)
        for (let ty = 0; ty < rows; ty++) {
            const r = def.rows[ty];
            for (let tx = 0; tx < cols; tx++) {
                const c = r[tx], px = tx * TS, py = ty * TS, key = Z.id + ':' + tx + ',' + ty;
                if (c === 'L') {
                    Z.lights.push(px + 16, py + 16); Z.glow.push(px + 16, py + 16, 2);
                } else if (c === 'p') {
                    Z.pots.push(api.addStatic('pot', null, px, py, py + 28, 32, 32, { tx, ty, cx: px + 16, cy: py + 18 }));
                } else if (c === 'C') {
                    const open = !!api.S.opened[key];
                    Z.chests.push(api.addStatic('chest', null, px, py, py + 28, 32, 32, { key, open, cx: px + 16, cy: py + 16 }));
                }
            }
        }

        if (P.tint) { x.fillStyle = P.tint; x.fillRect(0, 0, g.width, g.height); }
        Z.ground = g;
    }

    const GLOWC = ['#ffe880', '#5ae0ff', '#ff3040', '#7aff60', '#b060ff'];

    function drawUnder(x, Z, cx, cy, t) {
        // Subtle blood river or stagnant water animation
        const wl = Z.water;
        if (!wl || !wl.length) return;
        const V = window.HM_VIEW || { w: 640, h: 360 };
        x.fillStyle = 'rgba(255,50,70,0.22)';
        for (let i = 0; i < wl.length; i += 2) {
            const px = wl[i] - cx, py = wl[i + 1] - cy;
            if (px < -32 || py < -32 || px > V.w || py > V.h) continue;
            const k = (t * 0.4 + wl[i] * 0.3) % 48;
            if (k < 24) x.fillRect(px + (k * 0.6) % 24, py + 10, 6, 2);
        }
    }

    // Pre-allocated bat particle state for 60 FPS performance
    const BATS = Array.from({ length: 8 }, (_, i) => ({
        x: Math.random() * 640,
        y: Math.random() * 360,
        spd: 2.2 + Math.random() * 1.5,
        phase: Math.random() * 6.28
    }));

    function drawOver(x, Z, cx, cy, t, glow) {
        const V = window.HM_VIEW || { w: 640, h: 360 };

        // 1. Point Lights & Altars
        const gl = Z.glow;
        if (gl) {
            for (let i = 0; i < gl.length; i += 3) {
                const px = gl[i] - cx, py = gl[i + 1] - cy;
                if (px < -50 || py < -50 || px > V.w + 50 || py > V.h + 50) continue;
                const kind = gl[i + 2], s = kind === 2 ? 64 : 48;
                x.globalAlpha = 0.35 + Math.sin(t * 0.08 + gl[i]) * 0.1;
                x.drawImage(glow(GLOWC[kind] || GLOWC[0]), px - s / 2, py - s / 2, s, s);
            }
        }

        // 2. Gothic Atmospheric Fog & Blood Moon
        const atmo = Z.def ? Z.def.atmo : '';
        if (atmo === 'bloodmoon') {
            x.fillStyle = 'rgba(160, 20, 30, 0.08)';
            x.fillRect(0, 0, V.w, V.h);
        } else if (atmo === 'plague_fog') {
            x.fillStyle = 'rgba(30, 80, 20, 0.09)';
            x.fillRect(0, 0, V.w, V.h);
        }

        // 3. Ambient Flying Bats
        x.fillStyle = '#18121a';
        for (const b of BATS) {
            b.x -= b.spd;
            b.y += Math.sin(t * 0.1 + b.phase) * 0.8;
            if (b.x < -20) { b.x = V.w + 20; b.y = Math.random() * V.h; }
            const wing = Math.sin(t * 0.25 + b.phase) * 4;
            x.beginPath();
            x.moveTo(b.x, b.y);
            x.lineTo(b.x - 4, b.y - wing);
            x.lineTo(b.x - 2, b.y + 1);
            x.lineTo(b.x + 4, b.y - wing);
            x.closePath();
            x.fill();
        }
        x.globalAlpha = 1;
    }

    return { build, drawUnder, drawOver, bigProp, PAL };
})();
