/* Hollowmere: all the art, drawn in code. Static things are rendered once into small canvases
 * (sprites); characters are drawn live with a few shapes. Nothing here allocates per frame. */
window.HM_ART = (function () {
    'use strict';
    const TS = 32, SC = 2;                     // sprites are cached at 2x for sharpness
    const THEME = {
        grass:  { g: ['#5d8a3c', '#64923f', '#57833a'], path: '#a98a5c', leaf: ['#2f6b3a', '#3b7d43', '#4a9150'], trunk: '#5b3b24', cliffTop: '#7d8a5a', cliffFront: '#6b5a44', rock: '#8c8a80' },
        forest: { g: ['#3e6a3a', '#43703c', '#3a6336'], path: '#7f6a48', leaf: ['#1f4a35', '#28583d', '#346846'], trunk: '#4a3020', cliffTop: '#5b6b48', cliffFront: '#4d3f30', rock: '#77756c' },
        mire:   { g: ['#54663f', '#5a6c42', '#4e5f3a'], path: '#8a7a55', leaf: ['#2c4a3c', '#355648', '#3f6250'], trunk: '#3d3024', cliffTop: '#6f7378', cliffFront: '#4f5258', rock: '#6d6f68' },
        stone:  { g: ['#8a8074', '#837a6e', '#90867a'], path: '#a49884', leaf: ['#3b5a3a', '#466a45', '#4f744d'], trunk: '#4a3a2a', cliffTop: '#9a9083', cliffFront: '#6e6458', rock: '#9b958a' },
        crypt:  { g: ['#5a5c68', '#555763', '#5f616d'], path: '#4a4c58', leaf: ['#2c4a3c', '#355648', '#3f6250'], trunk: '#3d3024', cliffTop: '#3a3b47', cliffFront: '#26262f', rock: '#6d6f78', floor: true },
        mine:   { g: ['#6a5644', '#64513f', '#705b48'], path: '#7a6650', leaf: ['#2c4a3c', '#355648', '#3f6250'], trunk: '#4a3020', cliffTop: '#4a3a2c', cliffFront: '#2e241b', rock: '#7d6e5e', floor: true }
    };

    function mk(w, h, fn) {
        const c = document.createElement('canvas');
        c.width = Math.ceil(w * SC); c.height = Math.ceil(h * SC);
        const x = c.getContext('2d'); x.scale(SC, SC); fn(x, w, h);
        c.lw = w; c.lh = h;                    // logical size
        return c;
    }
    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    function circ(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); }
    function ell(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.2832); c.fill(); }

    const cache = {};
    function sprites(themeName) {
        if (cache[themeName]) return cache[themeName];
        const th = THEME[themeName];
        const s = {};
        s.tree = [0, 1, 2].map(v => mk(52, 72, c => {
            ell(c, 26, 66, 18, 6, 'rgba(0,0,0,0.25)');
            c.fillStyle = th.trunk; c.fillRect(22, 44, 8, 22);
            const L = th.leaf, o = v * 3;
            circ(c, 26, 30 - o, 20, L[0]); circ(c, 16, 38 - o, 13, L[0]); circ(c, 36, 38 - o, 13, L[0]);
            circ(c, 22, 26 - o, 14, L[1]); circ(c, 33, 31 - o, 11, L[1]); circ(c, 25, 20 - o, 10, L[2]);
            c.fillStyle = 'rgba(255,255,255,0.10)'; c.beginPath(); c.arc(20, 18 - o, 6, 0, 6.2832); c.fill();
        }));
        s.rock = mk(32, 30, c => {
            ell(c, 16, 25, 14, 5, 'rgba(0,0,0,0.25)');
            c.fillStyle = th.rock; c.beginPath(); c.moveTo(3, 24); c.lineTo(6, 10); c.lineTo(15, 4); c.lineTo(26, 8); c.lineTo(30, 23); c.closePath(); c.fill();
            c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.moveTo(7, 11); c.lineTo(15, 5); c.lineTo(20, 9); c.lineTo(10, 14); c.closePath(); c.fill();
            c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(4, 20, 26, 4);
        });
        s.cliff = [0, 1].map(front => mk(32, 48, c => {
            c.fillStyle = th.cliffTop; c.fillRect(0, 0, 32, 32);
            c.fillStyle = 'rgba(255,255,255,0.07)'; c.fillRect(2, 2, 13, 13); c.fillRect(17, 17, 13, 13);
            c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(17, 2, 13, 13); c.fillRect(2, 17, 13, 13);
            if (front) {
                c.fillStyle = th.cliffFront; c.fillRect(0, 32, 32, 16);
                c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 32, 32, 2); c.fillRect(10, 36, 2, 8); c.fillRect(24, 38, 2, 8);
            }
        }));
        s.bramble = mk(34, 44, c => {
            c.strokeStyle = '#2d3b1c'; c.lineWidth = 3;
            for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(4 + i * 4, 44); c.bezierCurveTo(i * 6 - 6, 20, 34 - i * 3, 22, 6 + i * 4, 2 + (i % 3) * 4); c.stroke(); }
            c.strokeStyle = '#4b5f2a'; c.lineWidth = 1.5;
            for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(30 - i * 5, 44); c.quadraticCurveTo(i * 5, 16, 28 - i * 3, 6); c.stroke(); }
            for (let i = 0; i < 6; i++) circ(c, 5 + (i * 11) % 26, 10 + (i * 7) % 28, 2, '#b8323a');
        });
        s.gate = mk(32, 48, c => {
            c.fillStyle = '#3d3d44'; c.fillRect(0, 6, 32, 4); c.fillRect(0, 40, 32, 4);
            for (let i = 0; i < 5; i++) { c.fillStyle = '#5a5a66'; c.fillRect(2 + i * 7, 2, 3, 46); }
            c.fillStyle = '#c9a43a'; c.fillRect(13, 22, 7, 8);
        });
        s.seal = mk(32, 48, c => {
            c.fillStyle = '#4a4e5a'; c.fillRect(0, 0, 32, 48);
            c.strokeStyle = '#9fd6ff'; c.lineWidth = 2; c.strokeRect(3, 3, 26, 42);
            circ(c, 16, 14, 4, '#20232b'); circ(c, 9, 30, 4, '#20232b'); circ(c, 23, 30, 4, '#20232b');
            c.strokeStyle = 'rgba(159,214,255,0.6)'; c.beginPath(); c.moveTo(16, 14); c.lineTo(9, 30); c.lineTo(23, 30); c.closePath(); c.stroke();
        });
        s.ore = mk(26, 22, c => {
            ell(c, 13, 19, 11, 3, 'rgba(0,0,0,0.25)');
            c.fillStyle = '#6f6a62'; c.beginPath(); c.moveTo(2, 18); c.lineTo(6, 6); c.lineTo(14, 2); c.lineTo(22, 7); c.lineTo(24, 18); c.closePath(); c.fill();
            c.fillStyle = '#e6eef7'; c.fillRect(8, 8, 3, 3); c.fillRect(15, 6, 3, 2); c.fillRect(17, 12, 3, 3); c.fillRect(10, 14, 2, 2);
        });
        s.cap = mk(20, 22, c => {
            circ(c, 10, 10, 9, 'rgba(90,190,255,0.25)');
            c.fillStyle = '#d8e4ea'; c.fillRect(8, 10, 4, 9);
            c.fillStyle = '#3fa9ff'; c.beginPath(); c.arc(10, 11, 8, Math.PI, 0); c.fill();
            circ(c, 7, 8, 1.5, '#c8f0ff'); circ(c, 12, 6, 1.5, '#c8f0ff');
        });
        s.flower = mk(10, 8, c => { circ(c, 3, 3, 2, '#f2d14a'); circ(c, 7, 5, 2, '#e86f8a'); });
        s.pot = mk(26, 30, c => {
            ell(c, 13, 27, 10, 3, 'rgba(0,0,0,0.3)');
            c.fillStyle = '#9a5a3a'; c.beginPath(); c.moveTo(7, 6); c.quadraticCurveTo(0, 18, 7, 27); c.lineTo(19, 27); c.quadraticCurveTo(26, 18, 19, 6); c.closePath(); c.fill();
            c.fillStyle = '#7a4228'; c.fillRect(7, 3, 12, 5); c.fillStyle = '#c8865a'; c.fillRect(6, 14, 14, 3);
            c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(8, 9, 3, 12);
        });
        const chest = (open, star) => mk(30, 28, c => {
            ell(c, 15, 25, 13, 3, 'rgba(0,0,0,0.3)');
            c.fillStyle = star ? '#3a3f6a' : '#7a4a2a'; c.fillRect(2, 10, 26, 15);
            c.fillStyle = star ? '#c8d0ff' : '#c9a43a'; c.fillRect(2, 15, 26, 2); c.fillRect(13, 12, 4, 6);
            if (open) { c.fillStyle = '#2a1a10'; c.fillRect(3, 6, 24, 5); c.fillStyle = star ? '#4a508a' : '#8a5a34'; c.fillRect(2, 0, 26, 7); }
            else { c.fillStyle = star ? '#4a508a' : '#8a5a34'; c.fillRect(2, 4, 26, 7); c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(4, 5, 22, 2); }
        });
        s.chest = chest(false, false); s.chestOpen = chest(true, false); s.star = chest(false, true); s.starOpen = chest(true, true);
        s.torch = mk(32, 48, c => {
            c.fillStyle = th.cliffTop; c.fillRect(0, 0, 32, 32);
            c.fillStyle = th.cliffFront; c.fillRect(0, 32, 32, 16);
            c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 32, 32, 2);
            c.fillStyle = '#3a2a1e'; c.fillRect(14, 34, 4, 12); c.fillStyle = '#5a5a60'; c.fillRect(11, 32, 10, 3);
        });
        cache[themeName] = s;
        return s;
    }

    // buildings: w, h in tiles; drawn with a visible roof top (2.5D)
    function building(kind, w, h) {
        const pw = w * TS, ph = h * TS, roof = 40;
        return mk(pw, ph + roof, c => {
            const wall = kind === 'forge' ? '#7b6a5c' : kind === 'shop' ? '#c9b48a' : '#d8c8a4';
            const roofC = kind === 'forge' ? '#4d4f57' : kind === 'shop' ? '#3f7a6a' : '#a4513f';
            c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(4, ph + roof - 8, pw, 10);
            c.fillStyle = wall; c.fillRect(0, roof + ph * 0.25, pw, ph * 0.75);                 // front wall
            c.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < pw; i += 16) c.fillRect(i, roof + ph * 0.25, 1, ph * 0.75);
            c.fillStyle = roofC; c.fillRect(-2, 0, pw + 4, roof + ph * 0.25);                        // roof top
            c.fillStyle = 'rgba(255,255,255,0.12)'; for (let y = 4; y < roof + ph * 0.25; y += 8) c.fillRect(-2, y, pw + 4, 2);
            c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-2, roof + ph * 0.25 - 4, pw + 4, 4);
            const dx = pw / 2 - 10, dy = roof + ph - 34;
            c.fillStyle = '#5a3a24'; c.fillRect(dx, dy, 20, 34); c.fillStyle = '#e0b04a'; c.fillRect(dx + 15, dy + 17, 3, 3);
            c.fillStyle = '#ffe9a8'; c.fillRect(10, dy + 6, 14, 12); c.fillRect(pw - 24, dy + 6, 14, 12);
            c.fillStyle = '#5a3a24'; c.fillRect(16, dy + 6, 2, 12); c.fillRect(pw - 18, dy + 6, 2, 12);
            if (kind === 'forge') {
                c.fillStyle = '#5a5050'; c.fillRect(pw - 26, -14, 14, 30);
                c.fillStyle = '#ff8a3a'; c.fillRect(8, dy + 6, 16, 12);
                c.fillStyle = '#2e2e33'; c.fillRect(pw - 10, ph + roof - 18, 18, 8); c.fillRect(pw - 6, ph + roof - 10, 8, 10);
            }
            if (kind === 'shop') {
                c.fillStyle = '#5a3a24'; c.fillRect(pw / 2 - 18, roof + ph * 0.25 + 4, 36, 16);
                circ(c, pw / 2 - 8, roof + ph * 0.25 + 12, 5, '#d24a6a'); circ(c, pw / 2 + 8, roof + ph * 0.25 + 12, 5, '#4ab07a');
            }
        });
    }

    function lantern(lit) {
        return mk(64, 150, c => {
            ell(c, 32, 144, 30, 7, 'rgba(0,0,0,0.3)');
            c.fillStyle = '#8f8678'; c.beginPath(); c.moveTo(10, 146); c.lineTo(18, 50); c.lineTo(46, 50); c.lineTo(54, 146); c.closePath(); c.fill();
            c.fillStyle = 'rgba(0,0,0,0.15)'; for (let y = 60; y < 146; y += 12) c.fillRect(12, y, 40, 2);
            c.fillStyle = '#5a3a24'; c.fillRect(26, 118, 12, 28);
            c.fillStyle = '#4a4a52'; c.fillRect(12, 44, 40, 8); c.fillRect(14, 8, 36, 6);
            c.beginPath(); c.moveTo(10, 10); c.lineTo(32, -4); c.lineTo(54, 10); c.closePath(); c.fill();
            c.fillStyle = lit ? '#ffd76a' : '#3a3d48'; c.fillRect(18, 14, 28, 30);
            c.fillStyle = '#4a4a52'; c.fillRect(30, 14, 4, 30);
            if (lit) { circ(c, 32, 29, 9, '#fff6c8'); }
            else { circ(c, 24, 36, 3, '#22252c'); circ(c, 32, 36, 3, '#22252c'); circ(c, 40, 36, 3, '#22252c'); }
        });
    }

    function misc() {
        if (cache.misc) return cache.misc;
        const m = {};
        m.boat = mk(56, 28, c => {
            c.fillStyle = '#6b4a2e'; c.beginPath(); c.moveTo(2, 8); c.lineTo(54, 8); c.lineTo(46, 24); c.lineTo(10, 24); c.closePath(); c.fill();
            c.fillStyle = '#8a6440'; c.fillRect(4, 8, 48, 4); c.fillStyle = '#4a321f'; c.fillRect(22, 10, 12, 4);
            c.fillStyle = '#ffd76a'; c.fillRect(44, 0, 4, 8);
        });
        m.bell = mk(44, 64, c => {
            ell(c, 22, 60, 18, 4, 'rgba(0,0,0,0.3)');
            c.fillStyle = '#4a3a2a'; c.fillRect(4, 6, 4, 56); c.fillRect(36, 6, 4, 56); c.fillRect(2, 4, 40, 5);
            c.fillStyle = '#4f7a6a'; c.beginPath(); c.moveTo(12, 38); c.quadraticCurveTo(12, 12, 22, 12); c.quadraticCurveTo(32, 12, 32, 38); c.closePath(); c.fill();
            c.fillStyle = '#3b5d51'; c.fillRect(11, 36, 22, 4);
        });
        m.statue = mk(30, 56, c => {
            ell(c, 15, 52, 13, 4, 'rgba(0,0,0,0.3)');
            c.fillStyle = '#7c776e'; c.fillRect(4, 42, 22, 10);
            c.fillStyle = '#9a948a'; c.fillRect(8, 16, 14, 28); circ(c, 15, 12, 7, '#9a948a');
            c.fillStyle = '#5e5a52'; c.fillRect(11, 11, 3, 2); c.fillRect(17, 11, 3, 2);
        });
        m.fog = mk(128, 128, c => {
            for (let i = 0; i < 14; i++) {
                const x = hash(i, 1, 7) * 128, y = hash(i, 2, 7) * 128, r = 20 + hash(i, 3, 7) * 30;
                const g = c.createRadialGradient(x, y, 0, x, y, r);
                g.addColorStop(0, 'rgba(200,205,215,0.55)'); g.addColorStop(1, 'rgba(200,205,215,0)');
                c.fillStyle = g;
                for (let ox = -128; ox <= 128; ox += 128) for (let oy = -128; oy <= 128; oy += 128) c.fillRect(x - r + ox, y - r + oy, r * 2, r * 2);
            }
        });
        m.glow = mk(64, 64, c => {
            const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
            g.addColorStop(0, 'rgba(255,220,120,0.55)'); g.addColorStop(1, 'rgba(255,220,120,0)');
            c.fillStyle = g; c.fillRect(0, 0, 64, 64);
        });
        m.blueGlow = mk(64, 64, c => {
            const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
            g.addColorStop(0, 'rgba(120,200,255,0.5)'); g.addColorStop(1, 'rgba(120,200,255,0)');
            c.fillStyle = g; c.fillRect(0, 0, 64, 64);
        });
        m.lanternOff = lantern(false); m.lanternOn = lantern(true);
        m.light = mk(128, 128, c => {                // cuts holes in the darkness (destination-out)
            const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
            g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
            c.fillStyle = g; c.fillRect(0, 0, 128, 128);
        });
        m.fire = mk(64, 64, c => {
            const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
            g.addColorStop(0, 'rgba(255,190,90,0.45)'); g.addColorStop(1, 'rgba(255,140,40,0)');
            c.fillStyle = g; c.fillRect(0, 0, 64, 64);
        });
        m.flash = mk(32, 32, c => {
            c.fillStyle = '#fff6c8'; c.beginPath();
            for (let i = 0; i < 16; i++) { const r = i % 2 ? 6 : 15, an = i * Math.PI / 8; c.lineTo(16 + Math.cos(an) * r, 16 + Math.sin(an) * r); }
            c.closePath(); c.fill(); circ(c, 16, 16, 5, '#ffffff');
        });
        cache.misc = m;
        return m;
    }

    function vignette(W, H) {
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        const x = c.getContext('2d');
        const g = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        return c;
    }

    // ground of a whole zone, drawn once when the zone loads
    function ground(zone, themeName, isOpen) {
        const th = THEME[themeName], cols = zone.cols, rows = zone.rows;
        const c = document.createElement('canvas'); c.width = cols * TS; c.height = rows * TS;
        const x = c.getContext('2d');
        const at = (cx, cy) => (cx < 0 || cy < 0 || cx >= cols || cy >= rows) ? 'T' : zone.ch(cx, cy);
        for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
            const ch = at(tx, ty), px = tx * TS, py = ty * TS, h = hash(tx, ty, 1);
            let base = th.g[0];                                 // one colour per ground (mixed colours made squares)
            if (ch === '=') base = th.path;
            else if (ch === 's') base = '#c8b07a';
            else if (ch === 'm') base = '#4a3f2c';
            else if (ch === 'x') base = '#7c7a80';
            else if (ch === '~' || ch === 'w') base = '#25506e';
            else if (ch === '#' || ch === 't') base = th.cliffTop;
            x.fillStyle = base; x.fillRect(px, py, TS, TS);
            if (ch === '#' || ch === 't') { x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(px + 2, py + 2, 13, 13); x.fillRect(px + 17, py + 17, 13, 13); continue; }
            if (ch === 'D') {
                const g = x.createLinearGradient(0, py, 0, py + TS); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
                x.fillStyle = g; x.fillRect(px, py, TS, TS); x.fillStyle = '#6a5a48'; x.fillRect(px, py, 2, TS); x.fillRect(px + TS - 2, py, 2, TS);
                continue;
            }
            if (th.floor && ch !== 'x' && ch !== '=') {          // dungeon flagstones
                x.fillStyle = 'rgba(0,0,0,0.22)'; x.fillRect(px, py + 15, TS, 2); x.fillRect(px + ((ty & 1) ? 8 : 22), py, 2, 15); x.fillRect(px + ((ty & 1) ? 22 : 8), py + 17, 2, 15);
                x.fillStyle = 'rgba(255,255,255,0.04)'; x.fillRect(px + 2, py + 2, 10, 4);
                if (h > 0.85) { x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(px + 12, py + 6, 6, 2); x.fillRect(px + 16, py + 8, 2, 5); }
                continue;
            }
            if (ch === '~' || ch === 'w') {
                x.fillStyle = 'rgba(255,255,255,0.06)';     // ripples at random places (the same marks in every tile made a grid)
                for (let i = 0; i < 2; i++) x.fillRect(px + ((hash(tx, ty, 30 + i) * 24) | 0), py + ((hash(tx, ty, 40 + i) * 28) | 0), 5 + ((hash(tx, ty, 50 + i) * 7) | 0), 2);
                // foam where water meets land
                if (at(tx, ty - 1) !== '~' && at(tx, ty - 1) !== 'w' && at(tx, ty - 1) !== 'T') { x.fillStyle = 'rgba(220,240,255,0.35)'; x.fillRect(px, py, TS, 3); }
                if (ch === 'w') {
                    x.fillStyle = '#7a5a38'; x.fillRect(px, py, TS, TS);
                    x.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < TS; i += 8) x.fillRect(px, py + i, TS, 1);
                    x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(px, py + TS - 3, TS, 3);
                }
            } else if (ch === 'x') {
                x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(px, py, TS, 1); x.fillRect(px, py, 1, TS); x.fillRect(px + 16, py + 16, 16, 1); x.fillRect(px + 16, py, 1, 16);
                x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(px + 2, py + 2, 12, 12);
            } else if (ch === 'm') {
                x.fillStyle = 'rgba(120,140,110,0.25)'; x.fillRect(px + 6 + h * 10, py + 10, 12, 5);
            } else if (ch === '=') {
                x.fillStyle = 'rgba(0,0,0,0.10)'; x.fillRect(px + (h * 26) | 0, py + (hash(tx, ty, 3) * 26) | 0, 3, 3);
                x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(px + (hash(tx, ty, 4) * 26) | 0, py + (hash(tx, ty, 5) * 26) | 0, 2, 2);
            } else if (ch === 's') {
                x.fillStyle = 'rgba(0,0,0,0.06)'; x.fillRect(px + (h * 24) | 0, py + 12, 6, 2);
            } else {
                // grass blades / gravel specks
                x.fillStyle = themeName === 'stone' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)';
                for (let i = 0; i < 4; i++) x.fillRect(px + (hash(tx, ty, 10 + i) * 30) | 0, py + (hash(tx, ty, 20 + i) * 30) | 0, 2, themeName === 'stone' ? 2 : 4);
            }
            if (ch === 'F') { const f = sprites(themeName).flower; x.drawImage(f, px + 8, py + 10, 10, 8); x.drawImage(f, px + 18, py + 20, 10, 8); }
        }
        return c;
    }

    /* ---------- live characters ---------- */
    // look: { cloak, trim, skin, hair, style: 0 short, 1 long, 2 bald, 3 hat, s: scale, glow }
    // gear (heroes): { head, body, feet } item ids; lean: 0..1 forward lunge while attacking
    function human(c, x, y, look, fx, fy, walk, flash, gear, lean) {
        const s = look.s || 1, run = walk ? Math.sin(walk) : 0, bob = walk ? Math.abs(run) * 1.6 : 0;
        const I = window.HM_ITEMS || {}, hd = gear && I[gear.head], bd = gear && I[gear.body], ft = gear && I[gear.feet];
        x += (lean || 0) * fx * 3; y += (lean || 0) * fy * 2;
        c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(x, y, 9 * s, 3.5 * s, 0, 0, 6.2832); c.fill();
        if (look.glow) c.globalAlpha = 0.75;
        const legA = run * 3;
        c.fillStyle = ft ? ft.col : '#2b2730';
        c.fillRect(x - 4 * s, y - 7 * s + legA * 0.4, 3 * s, 7 * s - legA * 0.4); c.fillRect(x + 1 * s, y - 7 * s - legA * 0.4, 3 * s, 7 * s + legA * 0.4);
        if (ft && gear.feet === 'swift_boots') { c.fillStyle = '#e8f0ff'; c.fillRect(x - 6 * s, y - 5 * s, 2 * s, 2 * s); c.fillRect(x + 4 * s, y - 5 * s, 2 * s, 2 * s); }
        const by = y - 7 * s - bob;
        // arms swing against the legs
        const armA = -run * 3;
        c.fillStyle = flash ? '#ffffff' : (bd ? bd.col : look.cloak);
        c.fillRect(x - 9 * s, by - 12 * s + armA, 3 * s, 8 * s); c.fillRect(x + 6 * s, by - 12 * s - armA, 3 * s, 8 * s);
        c.fillStyle = look.skin; c.fillRect(x - 9 * s, by - 5 * s + armA, 3 * s, 2 * s); c.fillRect(x + 6 * s, by - 5 * s - armA, 3 * s, 2 * s);
        c.fillStyle = flash ? '#ffffff' : look.cloak;
        c.beginPath(); c.moveTo(x - 8 * s, by); c.lineTo(x - 6 * s, by - 14 * s); c.lineTo(x + 6 * s, by - 14 * s); c.lineTo(x + 8 * s, by); c.closePath(); c.fill();
        if (bd && !flash) {
            c.fillStyle = bd.col; c.fillRect(x - 6 * s, by - 14 * s, 12 * s, 10 * s);
            if (gear.body === 'chainmail') { c.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 4; i++) c.fillRect(x - 5 * s + i * 3 * s, by - 12 * s, 1, 7 * s); }
            if (gear.body === 'plate_armor') { c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x - 4 * s, by - 13 * s, 2 * s, 7 * s); c.fillStyle = bd.col2; c.fillRect(x - 6 * s, by - 5 * s, 12 * s, 1.5 * s); }
            if (gear.body === 'padded_vest') { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x - 6 * s, by - 10 * s, 12 * s, 1); c.fillRect(x - 6 * s, by - 7 * s, 12 * s, 1); }
        }
        if (look.trim) { c.fillStyle = look.trim; c.fillRect(x - 7 * s, by - 3 * s, 14 * s, 3 * s); }
        const hy = by - 19 * s;
        c.fillStyle = flash ? '#ffffff' : look.skin; c.beginPath(); c.arc(x, hy, 6 * s, 0, 6.2832); c.fill();
        if (hd && !flash) {
            c.fillStyle = hd.col; c.beginPath(); c.arc(x, hy - 1 * s, 6.8 * s, 3.1, 6.33); c.fill();
            c.fillRect(x - 6.8 * s, hy - 1 * s, 13.6 * s, 2 * s);
            if (gear.head !== 'leather_cap' && fy >= 0) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x - 0.8 * s + fx * 2 * s, hy - 1 * s, 1.6 * s, 5 * s); }
            if (gear.head === 'knight_helm') { c.fillStyle = hd.col2; c.fillRect(x - 1.5 * s, hy - 12 * s, 3 * s, 6 * s); c.fillRect(x - 1.5 * s - fx * 3 * s, hy - 13 * s, 3 * s, 3 * s); }
        } else {
            c.fillStyle = look.hair;
            if (look.style === 0) { c.beginPath(); c.arc(x, hy - 1 * s, 6.3 * s, 3.3, 6.1); c.fill(); }
            else if (look.style === 1) { c.beginPath(); c.arc(x, hy - 1 * s, 6.5 * s, 3.0, 6.4); c.fill(); if (fy <= 0 || fx) c.fillRect(x - 6.5 * s, hy - 1 * s, 13 * s, 8 * s); }
            else if (look.style === 3) { c.fillRect(x - 9 * s, hy - 4 * s, 18 * s, 3 * s); c.fillRect(x - 5 * s, hy - 10 * s, 10 * s, 7 * s); }
        }
        if (fy >= 0 || fx) {                                     // eyes, unless facing away
            c.fillStyle = '#1b1820';
            const ex = x + fx * 2.5 * s;
            if (fx === 0) { c.fillRect(ex - 3 * s, hy, 2 * s, 2 * s); c.fillRect(ex + 1 * s, hy, 2 * s, 2 * s); }
            else c.fillRect(ex + fx * 1 * s - 1, hy, 2 * s, 2 * s);
        }
        c.globalAlpha = 1;
    }

    return { TS, THEME, sprites, building, misc, ground, vignette, human, hash };
})();
