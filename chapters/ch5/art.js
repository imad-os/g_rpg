/* Hollowmere, Chapter 5: The Blood Kingdoms — 2.5D procedural gothic horror art engine.
 * Pre-rendered onto off-screen canvases on zone entry; zero runtime allocations for 60 FPS on Max Quality & 1 GB RAM TVs. */
window.HM_C5_ART = (function () {
    'use strict';
    const TS = 32, H = 20, CACHE = {};
    let API = null;

    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); fn(x); return c; }
    function cached(key, w, h, fn) { return CACHE[key] || (CACHE[key] = mk(w, h, fn)); }
    function oval(x, X, Y, rx, ry, col) { x.fillStyle = col; x.beginPath(); x.ellipse(X, Y, rx, ry, 0, 0, 6.2832); x.fill(); }

    const PAL = {
        gothic:  { grass: '#24202c', grass2: '#1c1824', dark: '#110e16', cob: '#4c4456', stone: '#3c3546', dirt: '#322a3a', water: '#2a0e16', rock: '#282232', rockTop: '#3c3448', wall: '#1e1826', wallTop: '#362c42', tint: 'rgba(70,12,28,0.14)', moss: '#421a26' },
        crimson: { grass: '#2e141c', grass2: '#240e15', dark: '#16070b', cob: '#622430', stone: '#501c26', dirt: '#3e141c', water: '#580c1a', rock: '#38121a', rockTop: '#561e28', wall: '#2c0c14', wallTop: '#501822', tint: 'rgba(110,14,26,0.18)', moss: '#48121a' },
        plague:  { grass: '#262e22', grass2: '#1d241a', dark: '#121610', cob: '#46523e', stone: '#3a4434', dirt: '#2e3629', water: '#182614', rock: '#283424', rockTop: '#384832', wall: '#1c2419', wallTop: '#303e2c', tint: 'rgba(35,80,25,0.15)', moss: '#3a5224' },
        shadow:  { grass: '#1a182a', grass2: '#141222', dark: '#0b0914', cob: '#3e3a5c', stone: '#322e4e', dirt: '#28243e', water: '#090716', rock: '#221e38', rockTop: '#342e52', wall: '#181428', wallTop: '#2e264a', tint: 'rgba(25,30,85,0.18)', moss: '#26203e' },
        undead:  { grass: '#222824', grass2: '#1a1e1b', dark: '#0f1210', cob: '#404842', stone: '#343c36', dirt: '#2a302c', water: '#101a12', rock: '#242c26', rockTop: '#343e36', wall: '#18201a', wallTop: '#2c362e', tint: 'rgba(20,55,35,0.16)', moss: '#2c4030' }
    };

    function stoneTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.stone; x.fillRect(px, py, TS, TS);
        x.strokeStyle = P.dark; x.lineWidth = 1;
        x.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
        if (hash(tx, ty, 1) < 0.35) {
            x.fillStyle = P.cob; x.fillRect(px + 3, py + 3, 12, 10);
            x.fillRect(px + 17, py + 16, 11, 9);
        }
        if (hash(tx, ty, 2) < 0.2) {
            x.fillStyle = P.moss; x.fillRect(px + 10, py + 12, 6, 4);
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
        x.fillStyle = '#4e4254'; x.fillRect(px + 1, py, TS - 2, TS);
        x.fillStyle = '#685a70'; x.fillRect(px + 3, py + 2, TS - 6, 6); x.fillRect(px + 3, py + 12, TS - 6, 6); x.fillRect(px + 3, py + 22, TS - 6, 6);
        x.fillStyle = '#241c28'; x.fillRect(px, py, 3, TS); x.fillRect(px + TS - 3, py, 3, TS);
    }

    function waterTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.water; x.fillRect(px, py, TS, TS);
        x.fillStyle = 'rgba(255,90,100,0.22)';
        x.fillRect(px + 4, py + 10 + ((hash(tx, ty, 4) * 8) | 0), 22, 2);
    }

    function wallTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.wall; x.fillRect(px, py, TS, TS);
        x.fillStyle = P.wallTop; x.fillRect(px, py, TS, 9);
        x.strokeStyle = P.dark; x.lineWidth = 1;
        x.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
    }

    /* ---------------- Tile Props (Trees, Lamps, Pots, Chests, Gates) ---------------- */
    function tileProp(name, theme, v) {
        switch (name) {
            case 'tree': return cached('c5tree_' + theme + '_' + v, 64, 84, x => {
                oval(x, 32, 76, 18, 6, 'rgba(0,0,0,0.32)');
                x.fillStyle = '#281e24';
                x.beginPath(); x.moveTo(26, 76); x.lineTo(29, 34); x.lineTo(35, 34); x.lineTo(38, 76); x.fill();
                // Gnarled gothic branches
                x.strokeStyle = '#281e24'; x.lineWidth = 3.5; x.lineCap = 'round';
                x.beginPath(); x.moveTo(31, 48); x.lineTo(14, 30); x.moveTo(33, 44); x.lineTo(50, 28); x.moveTo(32, 36); x.lineTo(24, 18); x.stroke();
                const leafCol = theme === 'plague' ? ['#2e4624', '#3e5e2e'] : theme === 'shadow' ? ['#221c3a', '#322854'] : ['#4e1220', '#78182c'];
                oval(x, 16, 26, 12, 9, leafCol[0]); oval(x, 48, 25, 12, 9, leafCol[0]);
                oval(x, 32, 20, 16, 11, leafCol[1]);
            });
            case 'bush': return cached('c5bush_' + theme + '_' + v, 32, 34, x => {
                oval(x, 16, 30, 12, 4, 'rgba(0,0,0,0.28)');
                const c1 = theme === 'plague' ? '#344c28' : '#3a1824', c2 = theme === 'plague' ? '#486836' : '#5c1e30';
                oval(x, 16, 22, 13, 9, c1); oval(x, 11, 18, 8, 6, c2); oval(x, 21, 17, 8, 6, c2);
                x.fillStyle = '#d82038'; x.fillRect(10, 16, 2, 2); x.fillRect(20, 18, 2, 2);
            });
            case 'lamp': return cached('c5lamp_' + theme, 32, 60, x => {
                oval(x, 16, 56, 7, 2.5, 'rgba(0,0,0,0.32)');
                x.fillStyle = '#1e1a24'; x.fillRect(14, 24, 4, 32); x.fillRect(10, 53, 12, 4);
                x.fillStyle = '#383044'; x.beginPath(); x.moveTo(7, 16); x.lineTo(25, 16); x.lineTo(21, 26); x.lineTo(11, 26); x.closePath(); x.fill();
                x.fillStyle = '#ff3848'; oval(x, 16, 20, 5, 4, '#ff3848');
                x.fillStyle = '#ffd8a8'; oval(x, 16, 20, 2.5, 2, '#ffd8a8');
            });
            case 'pot': return cached('c5pot_' + theme, 32, 32, x => {
                oval(x, 16, 28, 9, 3, 'rgba(0,0,0,0.28)');
                x.fillStyle = '#4a2434'; oval(x, 16, 19, 9, 9, '#4a2434');
                x.fillStyle = '#6e3248'; oval(x, 14, 17, 5, 6, '#6e3248');
                x.fillStyle = '#2e1420'; x.fillRect(11, 8, 10, 4);
                x.fillStyle = '#c8a444'; x.fillRect(10, 12, 12, 2);
            });
            case 'chest': return cached('c5chest_' + v, 32, 32, x => {
                oval(x, 16, 28, 12, 3.5, 'rgba(0,0,0,0.32)');
                x.fillStyle = '#3a1420'; x.fillRect(4, 13, 24, 15);
                if (v) {
                    x.fillStyle = '#1c080e'; x.fillRect(4, 6, 24, 7);
                    x.fillStyle = '#ffd24a'; x.fillRect(8, 13, 16, 3);
                } else {
                    x.fillStyle = '#5c1a2c'; x.beginPath(); x.moveTo(4, 14); x.quadraticCurveTo(16, 4, 28, 14); x.fill();
                    x.fillStyle = '#ffd24a'; x.fillRect(14, 12, 4, 6);
                }
                x.fillStyle = '#c8a038'; x.fillRect(4, 18, 24, 2); x.fillRect(4, 13, 2, 15); x.fillRect(26, 13, 2, 15);
            });
            case 'gate': return cached('c5gate_' + theme, 32, 52, x => {
                x.fillStyle = '#1c1622';
                for (let k = 0; k < 5; k++) x.fillRect(2 + k * 7, 4, 3, 46);
                x.fillRect(0, 10, 32, 3); x.fillRect(0, 32, 32, 3);
                x.fillStyle = '#c82034'; x.fillRect(13, 18, 6, 6);
            });
        }
        return null;
    }

    /* ---------------- Big Props ---------------- */
    function bigProp(p) {
        const k = p.k;
        if (k === 'shrine') {
            return cached('shrine', 64, 68, x => {
                oval(x, 32, 62, 22, 6, 'rgba(0,0,0,0.35)');
                x.fillStyle = '#4a4254'; x.fillRect(14, 34, 36, 28);
                x.fillStyle = '#6a6078'; x.fillRect(18, 22, 28, 12);
                // Golden Holy Cross
                x.fillStyle = '#ffd700'; x.fillRect(29, 6, 6, 24); x.fillRect(21, 12, 22, 6);
                // Halo of light
                x.strokeStyle = 'rgba(255,230,120,0.75)'; x.lineWidth = 2;
                x.beginPath(); x.arc(32, 16, 14, 0, 6.28); x.stroke();
            });
        }
        if (k === 'altar') {
            return cached('altar', 64, 64, x => {
                oval(x, 32, 58, 24, 6, 'rgba(0,0,0,0.35)');
                x.fillStyle = '#2a1a24'; x.fillRect(12, 30, 40, 26);
                x.fillStyle = '#521422'; x.fillRect(16, 22, 32, 8);
                // Crimson basin
                x.fillStyle = '#c8182c'; x.beginPath(); x.ellipse(32, 22, 14, 5, 0, 0, 6.28); x.fill();
                // Runes on base
                x.fillStyle = '#ff4a5a'; x.fillRect(20, 38, 4, 10); x.fillRect(30, 38, 4, 10); x.fillRect(40, 38, 4, 10);
            });
        }
        if (k === 'crystal') {
            return cached('crystal_' + (p.n || 0), 32, 48, x => {
                oval(x, 16, 44, 12, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#4a121a'; x.beginPath(); x.moveTo(16, 4); x.lineTo(28, 24); x.lineTo(16, 44); x.lineTo(4, 24); x.closePath(); x.fill();
                x.fillStyle = '#e82038'; x.beginPath(); x.moveTo(16, 8); x.lineTo(24, 24); x.lineTo(16, 40); x.lineTo(8, 24); x.closePath(); x.fill();
                x.fillStyle = '#ffa4b0'; x.fillRect(14, 16, 4, 12);
            });
        }
        if (k === 'coffin') {
            return cached('coffin', 32, 48, x => {
                oval(x, 16, 44, 12, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#1c1622'; x.beginPath(); x.moveTo(10, 4); x.lineTo(22, 4); x.lineTo(28, 16); x.lineTo(24, 44); x.lineTo(8, 44); x.lineTo(4, 16); x.closePath(); x.fill();
                x.strokeStyle = '#8a2034'; x.lineWidth = 2; x.stroke();
                x.fillStyle = '#c8a444'; x.fillRect(14, 12, 4, 20); x.fillRect(9, 18, 14, 4);
            });
        }
        if (k === 'tomb') {
            return cached('tomb', 32, 32, x => {
                oval(x, 16, 28, 12, 3.5, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#484450'; x.beginPath(); x.arc(16, 12, 10, Math.PI, 0); x.lineTo(26, 28); x.lineTo(6, 28); x.closePath(); x.fill();
                x.strokeStyle = '#282430'; x.lineWidth = 1; x.stroke();
                x.fillStyle = '#282430'; x.fillRect(14, 10, 4, 10); x.fillRect(11, 13, 10, 3);
            });
        }
        if (k === 'gargoyle') {
            return cached('gargoyle', 32, 44, x => {
                oval(x, 16, 40, 12, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#56505c'; x.fillRect(8, 24, 16, 16);
                x.fillStyle = '#7a7280'; x.beginPath(); x.arc(16, 14, 8, 0, 6.28); x.fill();
                x.fillStyle = '#46404c';
                x.beginPath(); x.moveTo(10, 12); x.lineTo(2, 4); x.lineTo(6, 16); x.closePath(); x.fill();
                x.beginPath(); x.moveTo(22, 12); x.lineTo(30, 4); x.lineTo(26, 16); x.closePath(); x.fill();
                x.fillStyle = '#ff2030'; x.fillRect(13, 12, 2, 2); x.fillRect(17, 12, 2, 2);
            });
        }
        if (k === 'fountain') {
            return cached('fountain', 96, 64, x => {
                oval(x, 48, 56, 42, 10, 'rgba(0,0,0,0.35)');
                x.fillStyle = '#3c2430'; x.fillRect(10, 26, 76, 30);
                x.fillStyle = '#1e1018'; x.fillRect(14, 30, 68, 22);
                x.fillStyle = '#b81428'; x.beginPath(); x.ellipse(48, 36, 30, 9, 0, 0, 6.28); x.fill();
                x.fillStyle = '#5c1420'; x.fillRect(42, 8, 12, 28);
                x.fillStyle = '#ff4a5a'; x.fillRect(45, 4, 6, 8);
            });
        }
        if (k === 'cauldron') {
            return cached('cauldron', 32, 36, x => {
                oval(x, 16, 32, 13, 4, 'rgba(0,0,0,0.35)');
                x.fillStyle = '#1e241c'; x.beginPath(); x.arc(16, 20, 12, 0, 6.28); x.fill();
                x.fillStyle = '#44aa30'; x.beginPath(); x.ellipse(16, 14, 10, 4, 0, 0, 6.28); x.fill();
                x.fillStyle = '#8aff54'; x.fillRect(13, 11, 3, 3); x.fillRect(18, 13, 2, 2);
            });
        }
        if (k === 'alembic') {
            return cached('alembic', 32, 36, x => {
                oval(x, 16, 32, 12, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#2a1a1e'; x.fillRect(6, 22, 20, 10);
                x.fillStyle = '#e82438'; x.beginPath(); x.arc(16, 16, 9, 0, 6.28); x.fill();
                x.strokeStyle = '#d8e4f4'; x.lineWidth = 2;
                x.beginPath(); x.moveTo(16, 7); x.lineTo(16, 3); x.lineTo(26, 12); x.stroke();
            });
        }
        if (k === 'mirror') {
            return cached('mirror', 32, 48, x => {
                oval(x, 16, 44, 12, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#1a1828'; x.fillRect(6, 6, 20, 38);
                x.strokeStyle = '#d8b448'; x.lineWidth = 2; x.strokeRect(6, 6, 20, 38);
                x.fillStyle = '#4a4482'; x.fillRect(9, 9, 14, 32);
                x.fillStyle = 'rgba(200,225,255,0.45)'; x.fillRect(11, 12, 4, 24);
            });
        }
        if (k === 'throne') {
            return cached('throne_' + (p.c || 'gothic'), 96, 72, x => {
                oval(x, 48, 66, 36, 8, 'rgba(0,0,0,0.38)');
                const col = p.c === 'crimson' || p.c === 'carmilla' ? '#8a1624' : p.c === 'bone' ? '#585c54' : '#2a1828';
                x.fillStyle = col; x.fillRect(20, 10, 56, 54);
                x.fillStyle = '#d8b038'; x.fillRect(16, 6, 64, 6);
                x.fillStyle = '#140e16'; x.fillRect(26, 26, 44, 36);
                x.fillStyle = '#b81e30'; x.fillRect(30, 30, 36, 30);
            });
        }
        if (k === 'banner') {
            return cached('banner_' + (p.c || 'gothic'), 32, 56, x => {
                oval(x, 16, 52, 8, 2.5, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#5a3e28'; x.fillRect(14, 4, 4, 48);
                x.fillStyle = p.c === 'crimson' || p.c === 'carmilla' ? '#b81828' : p.c === 'dracula' ? '#24121e' : '#28203c';
                x.beginPath(); x.moveTo(6, 8); x.lineTo(26, 8); x.lineTo(26, 36); x.lineTo(16, 44); x.lineTo(6, 36); x.closePath(); x.fill();
                x.fillStyle = '#d8b038'; x.fillRect(12, 16, 8, 8);
            });
        }
        if (k === 'house') {
            return cached('house_' + p.w + '_' + p.h + '_' + (p.roof || 'slate') + '_' + (p.kind || ''), p.w * TS, p.h * TS + 44, x => {
                const W = p.w * TS, Hh = p.h * TS + 44;
                x.fillStyle = 'rgba(0,0,0,0.28)'; x.fillRect(6, Hh - 4, W - 12, 4);
                x.fillStyle = '#2e2736'; x.fillRect(4, 36, W - 8, Hh - 36);
                x.fillStyle = '#463c52'; x.fillRect(4, 36, W - 8, 4);
                // Roof
                x.fillStyle = p.roof === 'red' ? '#7a1824' : p.roof === 'green' ? '#244e38' : '#383244';
                x.beginPath(); x.moveTo(0, 38); x.lineTo(W / 2, 4); x.lineTo(W, 38); x.closePath(); x.fill();
                // Gothic arched door
                x.fillStyle = '#140e18';
                x.beginPath(); x.arc(W / 2, Hh - 22, 11, Math.PI, 0); x.lineTo(W / 2 + 11, Hh); x.lineTo(W / 2 - 11, Hh); x.closePath(); x.fill();
                // Warm/Crimson stained glass windows
                x.fillStyle = p.kind === 'church' ? '#ffd868' : '#df2c40';
                x.fillRect(Math.floor(W * 0.22), 48, 10, 14);
                x.fillRect(Math.floor(W * 0.78) - 10, 48, 10, 14);
                if (p.kind === 'church') {
                    x.fillStyle = '#ffd700'; x.fillRect(W / 2 - 2, 0, 4, 12); x.fillRect(W / 2 - 6, 3, 12, 3);
                }
            });
        }
        if (k === 'ruin') {
            return cached('ruin_' + p.w + '_' + p.h, p.w * TS, p.h * TS + 28, x => {
                const W = p.w * TS, Hh = p.h * TS + 28;
                x.fillStyle = '#383242'; x.beginPath(); x.moveTo(4, Hh); x.lineTo(4, 14); x.lineTo(W * 0.35, 6); x.lineTo(W * 0.65, 18); x.lineTo(W - 4, 8); x.lineTo(W - 4, Hh); x.closePath(); x.fill();
                x.fillStyle = '#1e1824'; x.fillRect(10, Hh - 28, 14, 20); x.fillRect(W - 26, Hh - 24, 14, 18);
            });
        }
        if (k === 'pyre') {
            return cached('pyre', 64, 64, x => {
                oval(x, 32, 58, 22, 6, 'rgba(0,0,0,0.35)');
                x.fillStyle = '#3a2416'; x.fillRect(16, 40, 32, 16);
                x.fillStyle = '#ff4a20'; x.beginPath(); x.arc(32, 36, 13, 0, 6.28); x.fill();
                x.fillStyle = '#ffd240'; x.beginPath(); x.arc(32, 34, 7, 0, 6.28); x.fill();
            });
        }
        if (k === 'well') {
            return cached('well', 32, 36, x => {
                oval(x, 16, 32, 13, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#4a4454'; x.beginPath(); x.arc(16, 20, 12, 0, 6.28); x.fill();
                x.fillStyle = '#240c14'; x.beginPath(); x.arc(16, 20, 8, 0, 6.28); x.fill();
            });
        }
        if (k === 'wagon') {
            return cached('wagon', 64, 36, x => {
                oval(x, 32, 32, 26, 5, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#3e2820'; x.fillRect(8, 8, 48, 16);
                x.fillStyle = '#1e1410'; x.beginPath(); x.arc(18, 26, 6, 0, 6.28); x.arc(46, 26, 6, 0, 6.28); x.fill();
            });
        }
        return null;
    }

    function build(arg1, arg2, arg3) {
        // Support both build(Z, def, api) from js/game.js and build(def, api) from tests
        let Z, def, api;
        if (arg3) { Z = arg1; def = arg2; api = arg3; }
        else { def = arg1; api = arg2; Z = api.Z; }
        API = api;

        const rows = def.rows.length, cols = def.rows[0].length;
        const g = document.createElement('canvas'); g.width = cols * TS; g.height = rows * TS;
        const x = g.getContext('2d');
        const theme = def.ground || 'gothic', P = PAL[theme] || PAL.gothic;

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

        // 1. Draw base tiles
        for (let ty = 0; ty < rows; ty++) {
            for (let tx = 0; tx < cols; tx++) {
                const c = at(tx, ty), px = tx * TS, py = ty * TS;
                if (c === '^' || c === '#') { wallTile(x, px, py, tx, ty, P); Z.block[ty * cols + tx] = 1; continue; }
                if (c === '~') { waterTile(x, px, py, tx, ty, P); Z.water.push(px, py); Z.block[ty * cols + tx] = 1; continue; }
                if (c === 'w') { bridgeTile(x, px, py, P); Z.block[ty * cols + tx] = 0; continue; }
                if (c === '=') { pathTile(x, px, py, tx, ty, P); continue; }
                if (c === 'x' || c === 'd') { stoneTile(x, px, py, tx, ty, P); continue; }
                // Default ground
                x.fillStyle = P.grass; x.fillRect(px, py, TS, TS);
                if (hash(tx, ty, 0) < 0.28) { x.fillStyle = P.grass2; x.fillRect(px + 4, py + 4, 10, 8); }
                if (c === 'F') {
                    x.fillStyle = '#c81e34'; x.fillRect(px + 8, py + 10, 3, 3); x.fillRect(px + 20, py + 18, 3, 3);
                }
            }
        }

        // 2. Tile-based 2.5D statics (trees, bushes, lamps, gates, pots, chests)
        for (let ty = 0; ty < rows; ty++) {
            for (let tx = 0; tx < cols; tx++) {
                const c = at(tx, ty), px = tx * TS, py = ty * TS, v = (hash(tx, ty, 2) * 3) | 0, key = (Z.id || 'c5') + ':' + tx + ',' + ty;
                if (c === 'T' || c === 'P') {
                    Z.block[ty * cols + tx] = 1;
                    api.addStatic('tree', tileProp('tree', theme, v), px - 16, py - 52, py + 30, 64, 84);
                } else if (c === 'k') {
                    Z.block[ty * cols + tx] = 1;
                    api.addStatic('bush', tileProp('bush', theme, v), px, py - 2, py + 30, 32, 34);
                } else if (c === 'L') {
                    Z.block[ty * cols + tx] = 1;
                    api.addStatic('lamp', tileProp('lamp', theme, 0), px, py - 28, py + 30, 32, 60);
                    Z.lights.push(px + 16, py - 6); Z.glow.push(px + 16, py - 10, 2);
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

        // 3. Big Props (houses, shrines, altars, thrones, cauldrons, alembics, mirrors, etc.)
        Z.c5props = [];
        for (const p of def.props || []) {
            const pw = p.w || 1, ph = p.h || 1;
            for (let y = p.y; y < p.y + ph; y++) {
                for (let k = p.x; k < p.x + pw; k++) {
                    if (y >= 0 && k >= 0 && y < rows && k < cols) {
                        Z.block[y * cols + k] = api.blockOf ? api.blockOf(p) : 1;
                    }
                }
            }
            const sx = p.x * TS, base = (p.y + ph) * TS;
            const img = bigProp(p);
            if (!img) continue;
            const s = api.addStatic(p.k, img, sx, base - img.height, base, img.width, img.height, { cx: sx + pw * 16, cy: base - 8, at: p, p });
            Z.c5props.push(s);
            if (p.k === 'shrine') { Z.lights.push(sx + 32, base - 24); Z.glow.push(sx + 32, base - 24, 0); }
            else if (p.k === 'altar' || p.k === 'fountain') { Z.lights.push(sx + 32, base - 22); Z.glow.push(sx + 32, base - 22, 2); }
            else if (p.k === 'crystal' || p.k === 'alembic') { Z.lights.push(sx + 16, base - 20); Z.glow.push(sx + 16, base - 20, 2); }
            else if (p.k === 'cauldron') { Z.lights.push(sx + 16, base - 20); Z.glow.push(sx + 16, base - 20, 3); }
            else if (p.k === 'mirror') { Z.lights.push(sx + 16, base - 24); Z.glow.push(sx + 16, base - 24, 4); }
            else if (p.k === 'pyre') { Z.lights.push(sx + 32, base - 24); Z.glow.push(sx + 32, base - 24, 2); }
        }

        if (P.tint) { x.fillStyle = P.tint; x.fillRect(0, 0, g.width, g.height); }
        Z.ground = g;
    }

    const GLOWC = ['#ffe880', '#5ae0ff', '#ff283c', '#6aff50', '#b068ff'];

    function drawUnder(x, Z, cx, cy, t) {
        const wl = Z.water;
        if (!wl || !wl.length) return;
        const V = window.HM_VIEW || { w: 640, h: 360 }, W = V.w, Hh = V.h;
        x.fillStyle = Z.def && Z.def.ground === 'plague' ? 'rgba(90,255,70,0.22)' : 'rgba(255,50,70,0.24)';
        for (let i = 0; i < wl.length; i += 2) {
            const px = wl[i] - cx, py = wl[i + 1] - cy;
            if (px < -32 || py < -32 || px > W || py > Hh) continue;
            const k = (t * 0.45 + wl[i] * 0.31 + wl[i + 1] * 0.53) % 48;
            if (k < 24) x.fillRect(px + (k * 0.6) % 24, py + 10, 6, 2);
        }
    }

    // Pre-allocated nocturnal bat silhouettes for zero-GC 60 FPS rendering
    const BATS = Array.from({ length: 8 }, (_, i) => ({
        x: (i * 83) % 640,
        y: (i * 47) % 360,
        spd: 1.8 + (i % 3) * 0.55,
        phase: i * 0.9
    }));

    function drawOver(x, Z, cx, cy, t, glow) {
        const V = window.HM_VIEW || { w: 640, h: 360 }, W = V.w, Hh = V.h;

        // 1. Point Lights, Shrines, Altars & Crystals
        const gl = Z.glow;
        if (gl && glow) {
            for (let i = 0; i < gl.length; i += 3) {
                const px = gl[i] - cx, py = gl[i + 1] - cy;
                if (px < -56 || py < -56 || px > W + 56 || py > Hh + 56) continue;
                const kind = gl[i + 2], s = kind === 2 ? 64 : 48;
                x.globalAlpha = 0.32 + Math.sin(t * 0.08 + gl[i]) * 0.09;
                x.drawImage(glow(GLOWC[kind] || GLOWC[0]), px - s / 2, py - s / 2, s, s);
            }
        }

        // 2. Gothic Atmospheric Overlay
        x.globalAlpha = 1;
        const atmo = Z.def ? Z.def.atmo : '';
        if (atmo === 'bloodmoon') {
            x.fillStyle = 'rgba(150, 16, 30, 0.08)';
            x.fillRect(0, 0, W, Hh);
        } else if (atmo === 'plague_fog') {
            x.fillStyle = 'rgba(30, 85, 25, 0.08)';
            x.fillRect(0, 0, W, Hh);
        } else if (atmo === 'shadow_mist') {
            x.fillStyle = 'rgba(25, 20, 75, 0.09)';
            x.fillRect(0, 0, W, Hh);
        }

        // 3. Ambient Nocturnal Bats
        x.fillStyle = '#16101c';
        for (let i = 0; i < BATS.length; i++) {
            const b = BATS[i];
            b.x -= b.spd;
            b.y += Math.sin(t * 0.1 + b.phase) * 0.7;
            if (b.x < -20) { b.x = W + 20; b.y = ((t * 17 + i * 67) % Hh); }
            const wing = Math.sin(t * 0.26 + b.phase) * 4.5;
            x.beginPath();
            x.moveTo(b.x, b.y);
            x.lineTo(b.x - 5, b.y - wing);
            x.lineTo(b.x - 2, b.y + 1.5);
            x.lineTo(b.x + 5, b.y - wing);
            x.closePath();
            x.fill();
        }
    }

    return { build, drawUnder, drawOver, bigProp, PAL };
})();
