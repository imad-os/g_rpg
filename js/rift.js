/* Hollowmere: the Rift, ten floors under the hill. Each floor is built from a seed:
 * nine rooms on a 3 x 3 grid, joined by a random tree of corridors (so every room can be reached),
 * plus a shortcut or two. You start in the bottom middle room, next to the way out; the stairs
 * down are in the room farthest from you. Every fifth floor has a guardian and an old tablet. */
window.HM_RIFT = (function () {
    'use strict';
    const W = 40, H = 30, CW = 13, CH = 10;
    const GUARDS = ['thornback', 'warden', 'knight', 'sentinel'];

    function rng(seed) {                          // small, fast, repeatable random numbers (mulberry32)
        let a = seed >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    function foesFor(floor) {
        const list = ['wisp', 'wolf', 'bat'];
        if (floor >= 3) list.push('crawler', 'bones');
        if (floor >= 5) list.push('mite');
        if (floor >= 3) list.push('archer');
        if (floor >= 5) list.push('gunner');
        if (floor >= 7) list.push('hexer', 'archer');
        if (floor >= 8) list.push('bones', 'mite');
        return list;
    }

    function build(floor, seed) {
        const R = rng(seed * 31 + floor * 7919);
        const ri = n => (R() * n) | 0;
        const g = []; for (let y = 0; y < H; y++) g.push(new Array(W).fill('#'));
        const rooms = [];
        for (let cy = 0; cy < 3; cy++) for (let cx = 0; cx < 3; cx++) {
            const w = 6 + ri(4), h = 4 + ri(3);
            const x0 = cx * CW + 1 + ri(CW - w - 1), y0 = cy * CH + 1 + ri(CH - h - 2);
            rooms.push({ x0, y0, x1: x0 + w - 1, y1: y0 + h - 1, cx: x0 + (w >> 1) - 1, cy: y0 + (h >> 1) - 1, gx: cx, gy: cy, d: -1 });
        }
        const carve = (x0, y0, x1, y1) => { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) if (x > 0 && y > 0 && x < W - 1 && y < H - 1) g[y][x] = '.'; };
        for (const r of rooms) carve(r.x0, r.y0, r.x1, r.y1);
        // a random tree from the start room, so every room is reachable
        const start = 7, links = [];
        const seen = new Array(9).fill(false); seen[start] = true; rooms[start].d = 0;
        const stack = [start];
        while (stack.length) {
            const i = stack[stack.length - 1], r = rooms[i], next = [];
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const nx = r.gx + dx, ny = r.gy + dy;
                if (nx < 0 || ny < 0 || nx > 2 || ny > 2) continue;
                const j = ny * 3 + nx; if (!seen[j]) next.push(j);
            }
            if (!next.length) { stack.pop(); continue; }
            const j = next[ri(next.length)];
            seen[j] = true; rooms[j].d = r.d + 1; links.push([i, j]); stack.push(j);
        }
        // one or two shortcuts make loops
        for (let k = 0; k < 1 + ri(2); k++) {
            const i = ri(9), r = rooms[i], dx = r.gx < 2 ? 1 : -1, j = r.gy * 3 + r.gx + dx;
            links.push([i, j]);
        }
        for (const [i, j] of links) {                 // two-tile-wide L-shaped corridors between room centres
            const a = rooms[i], b = rooms[j];
            if (R() < 0.5) { carve(a.cx, a.cy, b.cx, a.cy + 1); carve(b.cx, a.cy, b.cx + 1, b.cy); }
            else { carve(a.cx, a.cy, a.cx + 1, b.cy); carve(a.cx, b.cy, b.cx, b.cy + 1); }
        }
        // the stairs: the room farthest from the start
        let stairs = 0; for (let i = 0; i < 9; i++) if (rooms[i].d > rooms[stairs].d) stairs = i;
        const sr = rooms[start], st = rooms[stairs];
        // the way out, under the start room
        for (let y = sr.y1 + 1; y < H - 1; y++) { g[y][sr.cx] = 'x'; g[y][sr.cx + 1] = 'x'; }
        g[H - 1][sr.cx] = 'D'; g[H - 1][sr.cx + 1] = 'D';
        const isCorridorLine = (r, x, y) => x === r.cx || x === r.cx + 1 || y === r.cy || y === r.cy + 1;
        const free = (x, y) => g[y][x] === '.';
        // torches on the top wall of every room, pots in the corners, sometimes a chest
        for (const r of rooms) {
            for (let k = 0; k < 2; k++) { const x = r.x0 + 1 + ri(r.x1 - r.x0 - 1); if (g[r.y0 - 1] && g[r.y0 - 1][x] === '#' && g[r.y0][x] === '.') g[r.y0 - 1][x] = 't'; }
            const pots = 1 + ri(3);
            for (let k = 0; k < pots; k++) {
                const x = r.x0 + ri(r.x1 - r.x0 + 1), y = r.y0 + ri(r.y1 - r.y0 + 1);
                if (free(x, y) && !isCorridorLine(r, x, y) && r !== sr) g[y][x] = 'p';
            }
        }
        if (R() < 0.65) {
            const r = rooms[[0, 1, 2, 3, 5].filter(i => i !== stairs)[ri(4)]];
            const x = R() < 0.5 ? r.x0 : r.x1, y = r.y0;
            if (free(x, y) && !isCorridorLine(r, x, y)) g[y][x] = 'C';
        }
        // never let a pot or chest cut anything off: walk the floor from the start, and clear any that block
        for (let pass = 0; pass < 8; pass++) {
            const reach = []; for (let y = 0; y < H; y++) reach.push(new Array(W).fill(false));
            const q = [sr.cx + 1, sr.y1]; reach[sr.y1][sr.cx + 1] = true;
            for (let h = 0; h < q.length; h += 2) {
                const x = q[h], y = q[h + 1];
                for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const nx = x + dx, ny = y + dy, c = g[ny] && g[ny][nx];
                    if (!c || reach[ny][nx] || (c !== '.' && c !== 'x' && c !== 'D')) continue;
                    reach[ny][nx] = true; q.push(nx, ny);
                }
            }
            let fixed = false;
            for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
                if ((g[y][x] === 'p' || g[y][x] === 'C') && !reach[y - 1][x] && !reach[y + 1][x] && !reach[y][x - 1] && !reach[y][x + 1]) { g[y][x] = '.'; fixed = true; continue; }
                if (g[y][x] !== '.' || reach[y][x]) continue;
                for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (g[y + dy][x + dx] === 'p' || g[y + dy][x + dx] === 'C') { g[y + dy][x + dx] = '.'; fixed = true; }
            }
            if (!fixed) break;
        }
        // foes everywhere but the start room; they get stronger the deeper you go (the game scales them)
        const types = foesFor(floor), foes = [], n = Math.min(6 + floor, 18);
        for (let k = 0, guard = 0; k < n && guard < 400; guard++) {
            const i = ri(9); if (i === start) continue;
            const r = rooms[i], x = r.x0 + ri(r.x1 - r.x0 + 1), y = r.y0 + ri(r.y1 - r.y0 + 1);
            if (!free(x, y)) continue;
            foes.push({ t: types[ri(types.length)], x: x + 0.5, y: y + 0.5 }); k++;
        }
        const def = {
            ground: floor % 2 ? 'crypt' : 'mine', music: floor % 2 ? 7 : 8, dark: true, rift: floor,
            spawn: [sr.cx + 1, sr.y1 - 0.5],
            rows: g.map(r => r.join('')),
            props: [], npcs: [],
            exits: [{ x: sr.cx, y: H - 1, w: 2, h: 1, to: 'village', tx: 12.5, ty: 6.2 }],
            foes,
            stairs: { x: st.cx + 1, y: st.cy + 1 }
        };
        if (floor % 5 === 0) {
            def.boss = { t: GUARDS[((floor / 5) - 1) % 4], x: st.cx + 1, y: st.cy - 0.5, flag: '__riftGuard' };
            def.tablet = { x: st.x0 + 0.5, y: st.y1 + 0.5 };
        }
        return def;
    }
    return { build };
})();
