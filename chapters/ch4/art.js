/* Hollowmere, Chapter 4: A Song of Ice & Fire — 2.5D procedural & Kenney-assisted art for Westeros, Essos,
 * and the Ruins of Old Valyria. Cached onto off-screen canvases on zone load; zero per-frame allocations. */
window.HM_C4_ART = (function () {
    'use strict';
    const TS = 32, H = 20, CACHE = {};
    let API = null;
    const ST = () => (API && API.S && API.S.c4) || {};
    const SKI = new Image(); let skiOk = false;
    SKI.onload = () => { skiOk = true; }; SKI.src = 'assets/kenney/ski.png?v=' + (window.HM_VERSION || '1');
    function ski(x, i, dx, dy, s) { x.imageSmoothingEnabled = false; x.drawImage(SKI, (i % 12) * 16, ((i / 12) | 0) * 16, 16, 16, dx, dy, 16 * s, 16 * s); }

    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
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
        return 'rgb(' + f((n >> 16) & 16777215 ? (n >> 16) & 255 : 128) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
    }

    const PAL = {
        dawn:    { grass: '#6a964c', grass2: '#56803b', dark: '#466c30', cob: '#b0a288', stone: '#9e988c', dirt: '#9e7e56', water: '#2e6e9e', rock: '#787064', rockTop: '#608c44', wall: '#6e4c2e', wallTop: '#8e643c', tint: 'rgba(255,195,130,0.06)', moss: '#527e36' },
        elder:   { grass: '#4a8268', grass2: '#3c6e56', dark: '#2e5a46', cob: '#8a9688', stone: '#7e8a80', dirt: '#7a6850', water: '#24788e', rock: '#566058', rockTop: '#4a7a62', wall: '#525c56', wallTop: '#68766e', tint: 'rgba(40,120,140,0.08)', moss: '#366850' },
        ashen:   { grass: '#544e4a', grass2: '#46403c', dark: '#383432', cob: '#686058', stone: '#625a54', dirt: '#564638', water: '#263646', rock: '#383230', rockTop: '#484240', wall: '#2a2626', wallTop: '#423c3a', tint: 'rgba(130,50,25,0.12)', moss: '#444238' },
        keep:    { grass: '#3a3438', grass2: '#302a2e', dark: '#262024', cob: '#4a4248', stone: '#4c444a', dirt: '#3c3436', water: '#1e1418', rock: '#282226', rockTop: '#383036', wall: '#2c242a', wallTop: '#443a42', tint: 'rgba(60,15,10,0.22)', moss: '#383234' },
        frost:   { grass: '#e6eff8', grass2: '#d2e0ee', dark: '#c0d2e6', cob: '#96a2b0', stone: '#a0acc0', dirt: '#b4c0d0', water: '#5898cc', rock: '#667080', rockTop: '#ecf2fa', wall: '#68829e', wallTop: '#c4d8ee', tint: 'rgba(140,185,255,0.08)', moss: '#d4e2f0' },
        veil:    { grass: '#4a3a5e', grass2: '#3e3050', dark: '#342844', cob: '#5a4a6e', stone: '#544866', dirt: '#4a3e56', water: '#0a0614', rock: '#2a2036', rockTop: '#4a3a5e', wall: '#2a2036', wallTop: '#46385a', tint: 'rgba(90,30,140,0.14)', moss: '#3a2e4a' },
        citadel: { grass: '#3c2428', grass2: '#301c20', dark: '#241418', cob: '#4c3034', stone: '#4e3236', dirt: '#3c2628', water: '#140608', rock: '#261418', rockTop: '#3e2428', wall: '#2c181c', wallTop: '#482a30', tint: 'rgba(140,35,15,0.18)', moss: '#321e22' }
    };
    const RAISED = { 35: 1, 94: 1 };
    const SOFT = { dawn: 1, elder: 1, ashen: 1, frost: 1 };

    let BASE = true, THEME = 'dawn';
    function grassTile(x, px, py, tx, ty, P, base) {
        if (BASE) { x.fillStyle = base || P.grass; x.fillRect(px, py, TS, TS); return; }
        if (THEME === 'frost') {
            for (let k = 0; k < 3; k++) oval(x, px + hash(tx, ty, k) * 32, py + hash(tx, ty, k + 9) * 32, 6 + hash(tx, ty, k + 3) * 6, 2.5, k & 1 ? P.grass2 : '#ffffff');
            if (hash(tx, ty, 12) < 0.4) { x.fillStyle = '#ffffff'; x.fillRect(px + hash(tx, ty, 13) * 30, py + hash(tx, ty, 14) * 30, 1.5, 1.5); }
            return;
        }
        if (THEME === 'veil' || THEME === 'citadel' || THEME === 'keep') { stoneTile(x, px, py, tx, ty, P); return; }
        for (let k = 0; k < 5; k++) { const h = hash(tx, ty, k + 3); oval(x, px + hash(tx, ty, k) * 32, py + hash(tx, ty, k + 9) * 32, 4 + h * 6, 2 + h * 3, h < 0.5 ? P.grass2 : 'rgba(255,255,255,0.06)'); }
        x.strokeStyle = P.dark; x.lineWidth = 1;
        for (let k = 0; k < 4; k++) { const gx = px + hash(tx, ty, k + 20) * 30 + 1, gy = py + hash(tx, ty, k + 30) * 28 + 4; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx - 1, gy - 4); x.moveTo(gx + 2, gy); x.lineTo(gx + 3, gy - 3); x.stroke(); }
        if (THEME === 'ashen' && hash(tx, ty, 41) < 0.25) { x.fillStyle = '#ff6a2a'; x.fillRect(px + hash(tx, ty, 42) * 30, py + hash(tx, ty, 43) * 30, 1.5, 1.5); }
    }
    function paint(x, c, px, py, tx, ty, P, at) {
        switch (c) {
            case ',': grassTile(x, px, py, tx, ty, P, P.moss); break;
            case 'F':
                grassTile(x, px, py, tx, ty, P); if (BASE) break;
                for (let k = 0; k < 5; k++) {
                    const fx = px + 3 + hash(tx, ty, k + 40) * 26, fy = py + 4 + hash(tx, ty, k + 50) * 24;
                    const col = ['#d82a3a', '#ffd23f', '#ffffff', '#8ab4ff'][(hash(tx, ty, k + 60) * 4) | 0];
                    oval(x, fx, fy, 2.2, 2.2, col); oval(x, fx, fy, 0.9, 0.9, '#f4a020');
                }
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
            case 'i': {
                if (BASE) { x.fillStyle = '#b4dcf4'; x.fillRect(px, py, TS, TS); break; }
                x.strokeStyle = 'rgba(255,255,255,0.75)'; x.lineWidth = 1; x.beginPath(); x.moveTo(px + 4 + hash(tx, ty, 3) * 10, py + 26); x.lineTo(px + 20 + hash(tx, ty, 4) * 10, py + 6); x.stroke();
                break;
            }
            case 'w': {
                if (!BASE) break;
                waterTile(x, px, py, tx, ty, P, at);
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
                x.fillStyle = '#0e0a0c'; x.fillRect(px, py, TS, TS);
                for (let k = 0; k < 4; k++) { x.fillStyle = k & 1 ? '#4a383c' : '#5e484c'; x.fillRect(px + 2, py + 2 + k * 7, 28, 4); }
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
        if (THEME === 'citadel' && hash(tx, ty, 10) < 0.18) {
            x.strokeStyle = 'rgba(255,110,40,0.55)'; x.beginPath(); x.moveTo(px + 4, py + 20); x.lineTo(px + 14, py + 15); x.lineTo(px + 26, py + 19); x.stroke();
        }
    }
    function waterTile(x, px, py, tx, ty, P, at) {
        x.fillStyle = P.water; x.fillRect(px, py, TS, TS);
        if (THEME === 'frost') { x.fillStyle = 'rgba(220,240,255,0.55)'; x.fillRect(px, py, TS, TS); return; }
        const land = c => c !== '~' && c !== 'w' && c !== 'D';
        x.fillStyle = 'rgba(200,240,255,0.55)';
        if (land(at(tx, ty - 1))) { x.fillRect(px, py, TS, 3); x.fillStyle = 'rgba(120,200,230,0.35)'; x.fillRect(px, py + 3, TS, 6); x.fillStyle = 'rgba(200,240,255,0.55)'; }
        if (land(at(tx - 1, ty))) x.fillRect(px, py, 2, TS);
        if (land(at(tx + 1, ty))) x.fillRect(px + 30, py, 2, TS);
        if (land(at(tx, ty + 1))) x.fillRect(px, py + 30, TS, 2);
    }

    function block(c, theme, front, v) {
        const P = PAL[theme], key = 'c4blk' + c + theme + front + v;
        return cached(key, TS, TS + H, x => {
            const rock = c === '^', palis = c === '#' && theme === 'dawn', top = rock ? P.rockTop : P.wallTop, face = rock ? P.rock : P.wall;
            x.fillStyle = top; x.fillRect(0, 0, TS, TS);
            if (c === '#') {
                for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) { x.fillStyle = shade(top, 0.9 + ((r + k) & 1) * 0.12); x.fillRect(k * 16 + 1, r * 16 + 1, 14, 14); }
                if (theme === 'frost') { x.fillStyle = '#f0f8ff'; x.fillRect(0, 0, TS, 6); }
            } else {
                for (let k = 0; k < 4; k++) oval(x, (6 + k * 7 + v * 11) % 32, 10 + ((k + v) % 2) * 10, 4, 3, shade(top, 0.85 + v * 0.03));
            }
            if (!front) return;
            const g = x.createLinearGradient(0, TS, 0, TS + H); g.addColorStop(0, face); g.addColorStop(1, shade(face, 0.6));
            x.fillStyle = g; x.fillRect(0, TS, TS, H);
            if (palis) {
                for (let k = 0; k < 4; k++) { x.fillStyle = k & 1 ? '#6a4426' : '#7a5232'; x.fillRect(k * 8, TS - 8, 7, H + 8); }
            } else if (c === '#') {
                x.fillStyle = 'rgba(0,0,0,0.25)'; for (let r = 0; r < 3; r++) { x.fillRect(0, TS + r * 7, TS, 1); }
                if (theme === 'frost') { x.fillStyle = 'rgba(200,235,255,0.85)'; for (let k = 0; k < 4; k++) x.fillRect(3 + k * 8, TS, 2, 6 + ((k + v) % 3) * 3); }
            }
            x.fillStyle = 'rgba(255,255,255,0.22)'; x.fillRect(0, TS - 1, TS, 1);
        });
    }

    function tree(theme, c, v) {
        if (theme === 'frost' && skiOk) return cached('c4skipine' + c + v, 48, 96, x => {
            if (c === 'T') { ski(x, 7, 0, 0, 3); ski(x, 19, 0, 48, 3); } else if (v === 2) { ski(x, 30, 0, 48, 3); } else { ski(x, 6, 0, 0, 3); ski(x, 18, 0, 48, 3); }
        });
        return cached('c4tree' + theme + c + v, 80, 110, x => {
            if (theme === 'ashen') {
                x.fillStyle = '#26201e'; x.beginPath(); x.moveTo(36, 108); x.lineTo(38, 50); x.lineTo(44, 50); x.lineTo(46, 108); x.fill();
                x.strokeStyle = '#26201e'; x.lineCap = 'round';
                for (const b of [[40, 70, 20, 52, 4], [42, 60, 64, 40, 4], [41, 52, 30, 30, 3], [43, 45, 56, 22, 3]]) { x.lineWidth = b[4]; x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(b[2], b[3]); x.stroke(); }
                return;
            }
            if (theme === 'frost') {
                x.fillStyle = '#5a3e2a'; x.fillRect(37, 84, 6, 24);
                for (let k = 0; k < 4; k++) { const y = 30 + k * 16, w = 12 + k * 7; x.fillStyle = k & 1 ? '#2f6a4a' : '#3a7a56'; x.beginPath(); x.moveTo(40, y - 18); x.lineTo(40 + w, y + 10); x.lineTo(40 - w, y + 10); x.fill(); x.fillStyle = '#f4f8ff'; x.fillRect(40 - w + 2, y + 7, w * 2 - 4, 3); }
                return;
            }
            const greens = v === 2 ? ['#8a1e2a', '#b02838', '#d83a4a'] : ['#3a7034', '#4c8a40', '#68ad4c']; // v===2: Weirwood-style red-leafed tree!
            x.fillStyle = v === 2 ? '#e8e4dc' : '#6a4a2e'; x.fillRect(36, 72, 8, 34);
            oval(x, 40, 72, 24, 16, greens[0]);
            oval(x, 30, 60, 16, 14, greens[1]); oval(x, 50, 58, 16, 15, greens[1]); oval(x, 40, 48, 18, 16, greens[1]);
            oval(x, 34, 44, 10, 8, greens[2]); oval(x, 48, 52, 8, 6, greens[2]);
        });
    }

    function prop(name, theme, v) {
        switch (name) {
            case 'k': return cached('c4bush' + theme + v, 32, 36, x => {
                oval(x, 16, 32, 13, 4, 'rgba(0,0,0,0.25)');
                const g = theme === 'frost' ? ['#cfdcea', '#f0f6fc', '#ffffff'] : ['#3e7a36', '#52963e', '#d83a5a'];
                oval(x, 16, 22, 14, 10, g[0]); oval(x, 10, 18, 8, 7, g[1]); oval(x, 21, 16, 9, 8, g[1]);
            });
            case 'r': return cached('c4rock' + theme + v, 32, 32, x => {
                oval(x, 16, 26, 14, 5, 'rgba(0,0,0,0.25)');
                const P = PAL[theme] || PAL.dawn;
                x.fillStyle = P.rock; x.beginPath(); x.moveTo(3, 26); x.lineTo(6, 12); x.lineTo(14, 6); x.lineTo(24, 8); x.lineTo(29, 18); x.lineTo(28, 27); x.closePath(); x.fill();
            });
            case 'R': return cached('c4stone' + theme, 32, 56, x => {
                oval(x, 16, 52, 11, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#7a7480'; x.beginPath(); x.moveTo(7, 52); x.lineTo(9, 10); x.lineTo(16, 4); x.lineTo(24, 10); x.lineTo(25, 52); x.fill();
                x.fillStyle = '#d82a3a'; for (let k = 0; k < 3; k++) x.fillRect(13, 16 + k * 10, 6, 2);
            });
            case 'L': return cached('c4lamp' + theme, 32, 64, x => {
                oval(x, 16, 61, 6, 2, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#2a2830'; x.fillRect(14, 30, 4, 32); x.fillRect(9, 58, 14, 4);
                x.fillStyle = '#3a3640'; x.beginPath(); x.moveTo(6, 22); x.lineTo(26, 22); x.lineTo(22, 32); x.lineTo(10, 32); x.fill();
                x.fillStyle = theme === 'citadel' ? '#ff5a2a' : '#ff9a3a'; oval(x, 16, 22, 9, 3, x.fillStyle);
            });
            case 'c': return cached('c4crystal' + theme + v, 32, 44, x => {
                const col = theme === 'frost' ? ['#8ae8ff', '#ffffff', '138,232,255'] : ['#ff6a2a', '#ffe0a8', '255,106,42'];
                const g = x.createRadialGradient(16, 26, 0, 16, 26, 18); g.addColorStop(0, 'rgba(' + col[2] + ',0.5)'); g.addColorStop(1, 'rgba(' + col[2] + ',0)');
                x.fillStyle = g; x.fillRect(0, 6, 32, 38);
                for (const p of [[16, 4, 6], [9, 16, 4], [23, 14, 4]]) {
                    x.fillStyle = col[0]; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[0] + p[2], p[1] + 14); x.lineTo(p[0], 40); x.lineTo(p[0] - p[2], p[1] + 14); x.closePath(); x.fill();
                }
            });
            case 'p': return cached('c4jar' + theme, 32, 32, x => {
                oval(x, 16, 28, 9, 3, 'rgba(0,0,0,0.25)');
                const c1 = theme === 'frost' ? '#7a8aa0' : '#a85a36';
                oval(x, 16, 19, 9, 9, c1); x.fillStyle = shade(c1, 0.7); x.fillRect(12, 8, 8, 5);
            });
            case 'C': return cached('c4chest' + v, 32, 32, x => {
                oval(x, 16, 28, 12, 3, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#5a2626'; x.fillRect(4, 13, 24, 15);
                if (v) { x.fillStyle = '#2a1212'; x.fillRect(4, 6, 24, 7); x.fillStyle = '#ffd25a'; x.fillRect(8, 14, 16, 3); }
                else { x.fillStyle = '#7a3232'; x.beginPath(); x.moveTo(4, 14); x.quadraticCurveTo(16, 4, 28, 14); x.fill(); x.fillStyle = '#d8b04a'; x.fillRect(14, 12, 4, 6); }
                x.fillStyle = '#d8b04a'; x.fillRect(4, 18, 24, 2); x.fillRect(4, 13, 2, 15); x.fillRect(26, 13, 2, 15);
            });
            case 'gate': return cached('c4gate' + theme, 32, 52, x => {
                x.fillStyle = '#2e2a30'; for (let k = 0; k < 5; k++) x.fillRect(2 + k * 7, 4, 3, 46);
                x.fillRect(0, 10, 32, 3); x.fillRect(0, 30, 32, 3);
            });
        }
        return null;
    }

    const ROOF = { red: ['#b83a2e', '#8a261e'], blue: ['#2e5a9a', '#1e3e70'], green: ['#2e7a4e', '#1e5836'], brown: ['#8a5a3a', '#6a4228'], slate: ['#545c6c', '#3c4252'] };
    function house(w, h, roof, kind, burnt) {
        return cached('c4house' + w + h + roof + kind + burnt, w * TS, h * TS + 44, x => {
            const W2 = w * TS, wallH = 46, wallY = h * TS + 44 - wallH, R = burnt ? ['#3a3230', '#2a2422'] : ROOF[roof] || ROOF.red;
            x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(8, h * TS + 40, W2 - 4, 4);
            x.fillStyle = burnt ? '#6a5e52' : '#d8d2c6'; x.fillRect(4, wallY, W2 - 8, wallH);
            x.fillStyle = burnt ? '#2a2220' : '#5a4a3a'; x.fillRect(4, wallY, W2 - 8, 3); x.fillRect(4, wallY, 3, wallH); x.fillRect(W2 - 7, wallY, 3, wallH);
            const door = Math.floor(w / 2);
            for (let k = 0; k < w; k++) {
                if (k === door) {
                    x.fillStyle = '#3a2414'; x.fillRect(k * TS + 8, wallY + 18, 16, 28);
                } else {
                    x.fillStyle = '#3a2418'; x.fillRect(k * TS + 7, wallY + 9, 18, 15);
                    x.fillStyle = burnt ? '#14100e' : '#ffd98a'; x.fillRect(k * TS + 9, wallY + 11, 14, 11);
                }
            }
            const roofTop = 6, roofBot = wallY + 4;
            x.fillStyle = R[1]; x.beginPath(); x.moveTo(0, roofBot); x.lineTo(10, roofTop); x.lineTo(W2 - 10, roofTop); x.lineTo(W2, roofBot); x.closePath(); x.fill();
            x.fillStyle = R[0]; x.fillRect(8, roofTop + 4, W2 - 16, roofBot - roofTop - 6);
            if (kind === 'smith') { x.fillStyle = '#ff8a3a'; x.fillRect(W2 - 24, wallY + 30, 14, 10); }
            if (kind === 'shop') { oval(x, 15, wallY + 5, 4, 4, '#50ff78'); }
        });
    }

    const TENT = {
        stark: ['#5a6472', '#e8eef4'],
        baratheon: ['#d4a024', '#24201c'],
        lannister: ['#9e1e22', '#e8b838'],
        targaryen: ['#221e24', '#c82028'],
        snow: ['#6a7a8a', '#e8eef4']
    };
    const BANNER = {
        stark: ['#5a6472', '#ffffff'],
        baratheon: ['#e0ad24', '#1a1612'],
        lannister: ['#a81c22', '#ffd24a'],
        targaryen: ['#1c181e', '#d8222a']
    };

    function bigProp(p) {
        const k = p.k, w = p.w, h = p.h;
        switch (k) {
            case 'ruin': return cached('c4ruin' + w + h, w * TS, h * TS + 36, x => {
                const W2 = w * TS, B = h * TS + 34;
                x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(6, B - 2, W2 - 4, 4);
                x.fillStyle = '#4a423c'; x.beginPath(); x.moveTo(4, B); x.lineTo(4, 14); x.lineTo(24, 8); x.lineTo(W2 * 0.5, 22); x.lineTo(W2 - 18, 6); x.lineTo(W2 - 4, 18); x.lineTo(W2 - 4, B); x.fill();
                x.fillStyle = '#ff6a2a'; x.fillRect(W2 * 0.3, B - 6, 3, 3); x.fillRect(W2 * 0.7, B - 10, 3, 3);
            });
            case 'beacon': return cached('c4beacon', 32, 72, x => {
                oval(x, 16, 68, 12, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#6a6460'; x.fillRect(6, 52, 20, 18); x.fillStyle = '#8a847c'; x.fillRect(4, 48, 24, 6);
                x.fillStyle = '#3a3440'; x.fillRect(14, 14, 4, 36); x.fillStyle = '#4a4450'; x.beginPath(); x.moveTo(4, 16); x.lineTo(28, 16); x.lineTo(23, 26); x.lineTo(9, 26); x.fill();
            });
            case 'pyre': return cached('c4pyre', w * TS, h * TS + 70, x => {
                const W2 = w * TS, B = h * TS + 68;
                oval(x, W2 / 2, B - 4, W2 / 2, 8, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#7a746c'; x.beginPath(); x.moveTo(6, B - 4); x.lineTo(14, B - 28); x.lineTo(W2 - 14, B - 28); x.lineTo(W2 - 6, B - 4); x.fill();
                x.fillStyle = '#3a3440'; x.fillRect(W2 / 2 - 4, 18, 8, B - 46);
                x.fillStyle = '#d8b04a'; x.fillRect(W2 / 2 - 20, 20, 40, 4);
            });
            case 'shrine': return cached('c4weirwood', w * TS, h * TS + 80, x => {
                // Ancient Weirwood Heart Tree: bone-white trunk, carved red face, blood-red leaf canopy
                const W2 = w * TS, B = h * TS + 76;
                oval(x, W2 / 2, B - 4, W2 / 2, 8, 'rgba(0,0,0,0.35)');
                x.fillStyle = '#ebe6dc';
                x.beginPath(); x.moveTo(W2 / 2 - 18, B - 4); x.quadraticCurveTo(W2 / 2 - 12, B - 32, W2 / 2 - 10, 36);
                x.lineTo(W2 / 2 + 10, 36); x.quadraticCurveTo(W2 / 2 + 12, B - 32, W2 / 2 + 18, B - 4); x.fill();
                // Carved face & weeping red sap
                x.fillStyle = '#8a1822';
                x.fillRect(W2 / 2 - 5, B - 28, 3, 2); x.fillRect(W2 / 2 + 2, B - 28, 3, 2);
                x.fillRect(W2 / 2 - 4, B - 21, 8, 2);
                x.fillStyle = '#c8202e';
                x.fillRect(W2 / 2 - 4, B - 26, 1.5, 6); x.fillRect(W2 / 2 + 3, B - 26, 1.5, 6);
                // Blood-red Weirwood leaves
                oval(x, W2 / 2, 34, 38, 18, '#8a1622');
                oval(x, W2 / 2 - 18, 24, 22, 14, '#b01e2c');
                oval(x, W2 / 2 + 18, 24, 22, 14, '#b01e2c');
                oval(x, W2 / 2, 16, 26, 14, '#d42838');
            });
            case 'wagon': return cached('c4wagon', w * TS + 16, h * TS + 34, x => {
                const W2 = w * TS + 16, B = h * TS + 32;
                oval(x, W2 / 2, B - 2, W2 / 2, 5, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#6a4428'; x.fillRect(10, B - 22, W2 - 20, 14);
                x.strokeStyle = '#2a1a10'; x.lineWidth = 3; x.beginPath(); x.arc(18, B - 8, 7, 0, 6.2832); x.stroke(); x.beginPath(); x.arc(W2 - 18, B - 8, 7, 0, 6.2832); x.stroke();
            });
            case 'tent': return cached('c4tent' + (p.c || ''), w * TS, h * TS + 30, x => {
                const W2 = w * TS, B = h * TS + 28, col = TENT[p.c] || TENT.stark;
                oval(x, W2 / 2 + 4, B - 2, W2 / 2, 6, 'rgba(0,0,0,0.25)');
                for (let k2 = 0; k2 < 6; k2++) { x.fillStyle = k2 & 1 ? col[0] : col[1]; x.beginPath(); x.moveTo(W2 / 2, 4); x.lineTo(4 + k2 * (W2 - 8) / 6, B); x.lineTo(4 + (k2 + 1) * (W2 - 8) / 6, B); x.closePath(); x.fill(); }
                x.fillStyle = '#1a1210'; x.beginPath(); x.moveTo(W2 / 2, 22); x.lineTo(W2 / 2 - 9, B); x.lineTo(W2 / 2 + 9, B); x.fill();
            });
            case 'banner': return cached('c4banner' + (p.c || ''), 32, 80, x => {
                oval(x, 16, 77, 7, 2, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#3a2a1e'; x.fillRect(14, 4, 3, 74); x.fillStyle = '#d8b04a'; x.fillRect(13, 2, 5, 4);
            });
            case 'lore': return cached('c4lore', 32, 48, x => {
                oval(x, 16, 45, 13, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#6a6672'; x.beginPath(); x.moveTo(4, 45); x.lineTo(6, 12); x.quadraticCurveTo(16, 2, 26, 12); x.lineTo(28, 45); x.fill();
                x.fillStyle = '#d8b04a'; x.fillRect(10, 14, 12, 2);
            });
            case 'ward': return cached('c4ward', 32, 56, x => {
                oval(x, 16, 52, 12, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#4a464e'; x.fillRect(6, 42, 20, 10); x.fillStyle = '#68626c'; x.fillRect(10, 14, 12, 28);
                x.fillStyle = '#ff6a2a'; oval(x, 16, 14, 8, 3, '#ff6a2a');
            });
            case 'anchor': return cached('c4anchor', w * TS, h * TS + 80, x => {
                const W2 = w * TS, B = h * TS + 78;
                oval(x, W2 / 2, B - 4, W2 / 2, 7, 'rgba(0,0,0,0.4)');
                x.fillStyle = '#5a94b8'; x.beginPath(); x.moveTo(8, B - 4); x.lineTo(W2 / 2 - 6, 18); x.lineTo(W2 / 2 + 6, 18); x.lineTo(W2 - 8, B - 4); x.fill();
                x.fillStyle = '#b4ecff'; x.beginPath(); x.moveTo(14, B - 4); x.lineTo(W2 / 2 - 2, 22); x.lineTo(W2 / 2 + 2, B - 4); x.fill();
            });
            case 'throne': return cached('c4throne' + (p.c || ''), w * TS, h * TS + 70, x => {
                const W2 = w * TS, B = h * TS + 68, ir = p.c === 'iron';
                oval(x, W2 / 2, B - 4, W2 / 2, 7, 'rgba(0,0,0,0.35)');
                x.fillStyle = ir ? '#383c44' : '#2a384c';
                x.fillRect(10, 8, W2 - 20, B - 20);
                // Splayed sword blades of the Iron Throne or Ice Spires
                for (let k2 = -5; k2 <= 5; k2++) {
                    x.fillStyle = ir ? (k2 & 1 ? '#646a76' : '#4a505a') : '#8ae0ff';
                    x.beginPath(); x.moveTo(W2 / 2 + k2 * 5 - 2, 24); x.lineTo(W2 / 2 + k2 * 7, 2 + Math.abs(k2) * 2); x.lineTo(W2 / 2 + k2 * 5 + 2, 24); x.fill();
                }
                x.fillStyle = ir ? '#8a1e22' : '#4a88b8'; x.fillRect(16, 24, W2 - 32, B - 48);
            });
            case 'boat': return cached('c4boat' + w, w * TS + 8, 40, x => {
                x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(6, 30, w * TS - 4, 4);
                x.fillStyle = '#6a3e20'; x.beginPath(); x.moveTo(2, 18); x.lineTo(w * TS + 6, 18); x.lineTo(w * TS - 6, 32); x.lineTo(12, 32); x.closePath(); x.fill();
                x.fillStyle = '#d8b04a'; x.fillRect(4, 18, w * TS, 3); x.fillStyle = '#e8e0c8'; x.fillRect(w * TS / 2 - 1, 0, 2, 18);
                x.fillStyle = '#9e1e22'; x.beginPath(); x.moveTo(w * TS / 2 + 1, 2); x.lineTo(w * TS / 2 + 16, 15); x.lineTo(w * TS / 2 + 1, 15); x.fill();
            });
            case 'well': return cached('c4well', 32, 52, x => {
                oval(x, 16, 46, 14, 5, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#9a968c'; x.fillRect(3, 30, 26, 16); oval(x, 16, 30, 13, 5, '#b8b4aa'); oval(x, 16, 30, 10, 3, '#1a3a5a');
            });
            case 'fire': return cached('c4fire', 32, 32, x => {
                oval(x, 16, 26, 12, 4, 'rgba(0,0,0,0.3)'); x.fillStyle = '#5a3a20'; x.fillRect(5, 22, 22, 4); x.fillRect(8, 19, 16, 4);
            });
        }
        return null;
    }

    function flame(x, X, Y, t, s, col1, col2) {
        const f = Math.sin(t * 0.3 + X) * 2 * s;
        x.fillStyle = col1; x.beginPath(); x.moveTo(X - 7 * s, Y); x.quadraticCurveTo(X, Y - 22 * s - f, X + 7 * s, Y); x.fill();
        x.fillStyle = col2; x.beginPath(); x.moveTo(X - 3.5 * s, Y); x.quadraticCurveTo(X, Y - 12 * s + f, X + 3.5 * s, Y); x.fill();
    }

    const ANIM = {
        beacon(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            if ((ST().beacons || 0) >= o.at.n) {
                flame(x, X + 16, Y + 18, t, 1, '#ff9a3a', '#fff2a8');
                x.globalAlpha = 0.35 + Math.sin(t * 0.1 + o.at.n) * 0.08; x.drawImage(API.glow('#ffc860'), X - 24, Y - 30, 80, 80); x.globalAlpha = 1;
            }
        },
        pyre(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            if (ST().great) {
                flame(x, X + o.dw / 2, Y + 22, t, 2, '#ffb040', '#fff6c8');
                x.globalAlpha = 0.5; const g = 150 + Math.sin(t * 0.05) * 10; x.drawImage(API.glow('#ffd76a'), X + o.dw / 2 - g / 2, Y + 10 - g / 2, g, g); x.globalAlpha = 1;
            }
        },
        shrine(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            const cx = X + o.dw / 2, cy = Y + o.dh - 26;
            x.globalAlpha = 0.38 + Math.sin(t * 0.06) * 0.12; x.drawImage(API.glow('#ff4a5a'), cx - 26, cy - 26, 52, 52); x.globalAlpha = 1;
        },
        banner(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            const col = BANNER[o.at.c] || BANNER.stark, wv = Math.sin(t * 0.08 + X) * 2;
            x.fillStyle = col[0]; x.beginPath(); x.moveTo(X + 17, Y + 8); x.lineTo(X + 31 + wv, Y + 10); x.lineTo(X + 30 + wv, Y + 40); x.lineTo(X + 24 + wv * 0.5, Y + 34); x.lineTo(X + 17, Y + 40); x.fill();
            x.fillStyle = col[1]; x.beginPath(); x.arc(X + 24 + wv * 0.6, Y + 22, 3.5, 0, 6.2832); x.fill();
        },
        lore(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            if (!((ST().lore || 0) & (1 << o.at.n))) {
                x.globalAlpha = 0.4 + Math.sin(t * 0.08 + o.at.n) * 0.2; x.drawImage(API.glow('#ffd25a'), X - 6, Y + 2, 44, 44); x.globalAlpha = 1;
            }
        },
        ward(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            const done = (ST().wards || 0) & (1 << o.at.n);
            if (!done) {
                flame(x, X + 16, Y + 14, t, 0.9, '#ff4a2a', '#ffd25a');
                x.globalAlpha = 0.45 + Math.sin(t * 0.1 + o.at.n) * 0.12; x.drawImage(API.glow('#ff6a2a'), X - 10, Y - 8, 52, 52); x.globalAlpha = 1;
            }
        },
        anchor(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            const broken = (ST().anchors || 0) & (1 << o.at.n), cx = X + o.dw / 2, cy = Y + 20;
            if (broken) return;
            const pulse = 1 + Math.sin(t * 0.12 + o.at.n) * 0.18;
            x.globalAlpha = 0.55; x.drawImage(API.glow('#6ae8ff'), cx - 28 * pulse, cy - 28 * pulse, 56 * pulse, 56 * pulse); x.globalAlpha = 1;
        },
        throne(x, X, Y, t, o) {
            x.drawImage(o.img, X, Y);
            if (o.at.c === 'void') {
                x.globalAlpha = 0.3 + Math.sin(t * 0.05) * 0.1; x.drawImage(API.glow('#6ae8ff'), X - 10, Y - 10, o.dw + 20, o.dw + 20); x.globalAlpha = 1;
            }
        },
        fire(x, X, Y, t, o) { x.drawImage(o.img, X, Y); flame(x, X + 16, Y + 22, t, 1, '#ff7a2a', '#ffd25a'); }
    };

    function build(Z, def, api) {
        API = api;
        const theme = def.ground, P = PAL[theme] || PAL.dawn, cols = Z.cols, rows = Z.rows;
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
            if (c === '~') Z.water.push(tx * TS, ty * TS);
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
            const light = theme === 'frost' ? '255,255,255' : theme === 'elder' ? '140,255,220' : '255,245,190';
            masked(x, soft, l => { for (let k = 0; k < n * 0.35; k++) {
                const gx = hash(k, 1, 31) * cols * TS, gy = hash(k, 2, 33) * rows * TS, r = 18 + hash(k, 3, 35) * 50, dark = hash(k, 4, 37) < 0.55;
                blob(l, gx, gy, r * 1.4, 0.5 + hash(k, 5, 39) * 0.4, hash(k, 6, 41) * 3, dark ? (theme === 'frost' ? '120,150,200' : '0,0,0') : light, dark ? 0.1 : 0.09);
            } });
        }
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
            }
            else if (c === 'k') api.addStatic('bush', prop('k', theme, v), px, py - 4, py + 30, 32, 36);
            else if (c === 'r') api.addStatic('rock', prop('r', theme, v), px, py, py + 28, 32, 32);
            else if (c === 'R') { api.addStatic('stone', prop('R', theme, 0), px, py - 26, py + 30, 32, 56); Z.glow.push(px + 16, py - 4, 1); }
            else if (c === 'L') { api.addStatic('lamp', prop('L', theme, 0), px, py - 32, py + 30, 32, 64); Z.lights.push(px + 16, py - 10); Z.glow.push(px + 16, py - 18, 0); }
            else if (c === 'c') { api.addStatic('crystal', prop('c', theme, v), px, py - 14, py + 28, 32, 44); Z.lights.push(px + 16, py + 10); Z.glow.push(px + 16, py + 8, theme === 'frost' ? 1 : 2); }
            else if (c === 'g' || c === 'q') api.addStatic(c === 'g' ? 'gate' : 'gate2', prop('gate', theme, 0), px, py - 20, py + 32, 32, 52, { tx, ty });
            else if (c === 'p') Z.pots.push(api.addStatic('pot', prop('p', theme, 0), px, py, py + 28, 32, 32, { tx, ty, cx: px + 16, cy: py + 18 }));
            else if (c === 'C') {
                const open = !!api.S.opened[key];
                Z.chests.push(api.addStatic('chest', prop('C', theme, open ? 1 : 0), px, py, py + 28, 32, 32, { key, star: false, open, cx: px + 16, cy: py + 16, img2: prop('C', theme, 1) }));
            }
        }
        Z.c4props = [];
        for (const p of def.props) {
            if (p.w) for (let y = p.y; y < p.y + p.h; y++) for (let k = p.x; k < p.x + p.w; k++) if (y >= 0 && k >= 0 && y < rows && k < cols) Z.block[y * cols + k] = api.blockOf ? api.blockOf(p) : 1;
            const sx = p.x * TS, base = (p.y + p.h) * TS;
            if (p.k === 'house') { api.addStatic('house', house(p.w, p.h, p.roof || 'red', p.kind || '', p.b !== undefined && (ST().beacons || 0) < p.b ? 1 : 0), sx, p.y * TS - 44, base, p.w * TS, p.h * TS + 44); continue; }
            const img = bigProp(p); if (!img) continue;
            const anim = ANIM[p.k], wide = p.k === 'wagon' ? 8 : 0;
            const s = api.addStatic(p.k, img, sx - wide - (p.k === 'boat' ? 4 : 0), base - img.height + (p.k === 'boat' ? 8 : 0), base, img.width, img.height,
                anim ? { draw: anim, at: p, cx: sx + p.w * 16, cy: base - 8 } : { cx: sx + p.w * 16, cy: base - 8 });
            Z.c4props.push(s);
            if (p.k === 'fire') { Z.lights.push(sx + 16, p.y * TS + 16); Z.glow.push(sx + 16, p.y * TS + 12, 2); }
            if (p.k === 'boat') Z.boats.push(s);
            if (p.k === 'anchor' || p.k === 'beacon' || p.k === 'pyre') Z.lights.push(sx + p.w * 16, base - 40);
        }
        if (P.tint) { x.fillStyle = P.tint; x.fillRect(0, 0, g.width, g.height); }
        Z.ground = g;
    }

    const GLOWC = ['#ffc860', '#7ae0ff', '#ff7a3a', '#50ff78', '#b07aff'];
    function drawUnder(x, Z, cx, cy, t) {
        const V = window.HM_VIEW || { w: 640, h: 360 }, W = V.w, Hh = V.h, wl = Z.water;
        if (wl && wl.length && Z.def.ground !== 'frost') {
            x.fillStyle = Z.id === 'c4_kings' ? 'rgba(80,255,120,0.38)' : 'rgba(220,245,255,0.35)';
            for (let i = 0; i < wl.length; i += 2) {
                const px = wl[i] - cx, py = wl[i + 1] - cy; if (px < -32 || py < -32 || px > W || py > Hh) continue;
                const k = (t * 0.5 + wl[i] * 0.37 + wl[i + 1] * 0.61) % 64;
                if (k < 32) x.fillRect(px + (k * 0.7) % 26, py + 8 + ((wl[i] >> 5) % 3) * 7, 6 - Math.abs(k - 16) * 0.3, 1.5);
            }
        }
    }
    function drawOver(x, Z, cx, cy, t, glow) {
        const gl = Z.glow; if (!gl) return;
        const V = window.HM_VIEW || { w: 640, h: 360 };
        for (let i = 0; i < gl.length; i += 3) {
            const px = gl[i] - cx, py = gl[i + 1] - cy; if (px < -40 || py < -40 || px > V.w + 40 || py > V.h + 40) continue;
            const kind = gl[i + 2], s = kind === 2 ? 60 : 44;
            x.globalAlpha = 0.28 + Math.sin(t * 0.06 + gl[i]) * 0.08;
            x.drawImage(glow(GLOWC[kind] || GLOWC[0]), px - s / 2, py - s / 2, s, s);
        }
        x.globalAlpha = 1;
    }
    return { build, drawUnder, drawOver, house, tree, PAL, flame };
})();
