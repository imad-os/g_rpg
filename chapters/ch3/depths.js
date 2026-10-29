/* Hollowmere, Chapter 3: the Sunken Vault, a hidden dungeon of five floors under the Elderwood.
 * Its stairs hide in the south-west corner of the wood, behind the trees past the druids' camp.
 * Floors 1 to 4 are built from a fixed seed (always the same): nine rooms on a 3 x 3 grid joined by a random tree of
 * corridors, stairs up where you arrive and stairs down in the farthest room. Floor 5 is the Tyrant's hall.
 * The Deep Tyrant (chapters/ch3/chapter.js) wakes again each time you come down from the wood; its hoard is legendary
 * weapons: the first time one of each kind (sword, bow, gun, staff), then one of a random kind.
 * Tiles: # wall, x floor, D stairs, L lamp, c crystal, p pot, C chest (chapters/ch3/art.js). */
window.HM_C3_DEPTHS = (function () {
    'use strict';
    const W = 40, H = 30, CW = 13, CH = 10, FLOORS = 5;
    const id = n => 'c3_deep' + n;
    function rng(seed) {
        let a = seed >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    // the deeper, the more kinds of foe (and more of them)
    const KINDS = [['grimwolf', 'cryptbones', 'thornstalker'], ['ashenarcher', 'hollowsoldier'], ['riftwisp', 'frostfang', 'veilcultist'], ['stonebrute', 'yeti']];
    function kinds(n) { let k = []; for (let i = 0; i < Math.min(n, KINDS.length); i++) k = k.concat(KINDS[i]); return k; }

    // where you arrive on floor n coming down (or coming back up from below)
    const DOOR = { x: 3, y: 32 };                                  // the stairs in the Elderwood
    function floor(n) {
        const R = rng(7331 + n * 104729), ri = k => (R() * k) | 0;
        const g = []; for (let y = 0; y < H; y++) g.push(new Array(W).fill('#'));
        const rooms = [];
        for (let cy = 0; cy < 3; cy++) for (let cx = 0; cx < 3; cx++) {
            const w = 6 + ri(4), h = 4 + ri(3);
            const x0 = cx * CW + 1 + ri(CW - w - 1), y0 = cy * CH + 1 + ri(CH - h - 2);
            rooms.push({ x0, y0, x1: x0 + w - 1, y1: y0 + h - 1, cx: x0 + (w >> 1) - 1, cy: y0 + (h >> 1) - 1, gx: cx, gy: cy, d: -1 });
        }
        const carve = (x0, y0, x1, y1) => { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) if (x > 0 && y > 0 && x < W - 1 && y < H - 1) g[y][x] = 'x'; };
        for (const r of rooms) carve(r.x0, r.y0, r.x1, r.y1);
        const start = 7, links = [], seen = new Array(9).fill(false), stack = [start];
        seen[start] = true; rooms[start].d = 0;
        while (stack.length) {
            const i = stack[stack.length - 1], r = rooms[i], next = [];
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = r.gx + dx, ny = r.gy + dy; if (nx >= 0 && ny >= 0 && nx <= 2 && ny <= 2 && !seen[ny * 3 + nx]) next.push(ny * 3 + nx); }
            if (!next.length) { stack.pop(); continue; }
            const j = next[ri(next.length)]; seen[j] = true; rooms[j].d = r.d + 1; links.push([i, j]); stack.push(j);
        }
        for (let k = 0; k < 2; k++) { const i = ri(9), r = rooms[i], dx = r.gx < 2 ? 1 : -1; links.push([i, r.gy * 3 + r.gx + dx]); }
        for (const [i, j] of links) {
            const a = rooms[i], b = rooms[j];
            if (R() < 0.5) { carve(a.cx, a.cy, b.cx, a.cy + 1); carve(b.cx, a.cy, b.cx + 1, b.cy); }
            else { carve(a.cx, a.cy, a.cx + 1, b.cy); carve(a.cx, b.cy, b.cx, b.cy + 1); }
        }
        let far = 0; for (let i = 0; i < 9; i++) if (rooms[i].d > rooms[far].d) far = i;
        const sr = rooms[start], fr = rooms[far];
        // stairs up: a short hall under the start room; stairs down: the far room's top-left corner
        for (let y = sr.y1 + 1; y < H - 1; y++) { g[y][sr.cx] = 'x'; g[y][sr.cx + 1] = 'x'; }
        g[H - 2][sr.cx] = 'D'; g[H - 2][sr.cx + 1] = 'D';
        const dx = fr.x0, dy = fr.y0; g[dy][dx] = 'D'; g[dy][dx + 1] = 'D';
        const onLine = (r, x, y) => x === r.cx || x === r.cx + 1 || y === r.cy || y === r.cy + 1;
        const free = (x, y) => g[y][x] === 'x';
        const lamp = n >= 4 ? 'c' : 'L';
        for (const r of rooms) {
            for (const [x, y] of [[r.x1, r.y0], [r.x0, r.y1], [r.x1, r.y1]]) if (free(x, y) && !onLine(r, x, y) && R() < 0.55) g[y][x] = R() < 0.4 ? 'p' : lamp;
        }
        for (let k = 0, guard = 0; k < 2 && guard < 40; guard++) {          // two chests in rooms away from the start
            const i = ri(9); if (i === start) continue;
            const r = rooms[i], x = r.x0, y = r.y1;
            if (free(x, y) && !onLine(r, x, y) && g[y - 1][x] === 'x' && g[y][x + 1] === 'x') { g[y][x] = 'C'; k++; }
        }
        const types = kinds(n), foes = [], count = 10 + n * 2;
        for (let k = 0, guard = 0; k < count && guard < 600; guard++) {
            const i = ri(9); if (i === start) continue;
            const r = rooms[i], x = r.x0 + ri(r.x1 - r.x0 + 1), y = r.y0 + ri(r.y1 - r.y0 + 1);
            if (!free(x, y)) continue;
            foes.push({ t: types[ri(types.length)], x: x + 0.5, y: y + 0.5 }); k++;
        }
        return {
            ground: n >= 4 ? 'citadel' : 'keep', art: 1, music: n >= 4 ? 'c3_citadel' : 'c3_keep', dark: true, atmo: 'motes', tier: 5, depth: n,
            spawn: [sr.cx + 1, H - 3.4], rows: g.map(r => r.join('')), props: [], npcs: [], foes,
            down: [dx + 1, dy + 1.6],
            exits: [{ x: sr.cx, y: H - 2, w: 2, h: 1, to: n === 1 ? 'c3_elder' : id(n - 1), tx: 0, ty: 0, up: 1 },
                    { x: dx, y: dy, w: 2, h: 1, to: id(n + 1), tx: 0, ty: 0 }]
        };
    }
    // floor 5: the Tyrant's hall, pillars and crystals around a wide floor
    function hall() {
        const g = []; for (let y = 0; y < H; y++) g.push(new Array(W).fill('#'));
        const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c; };
        rect(18, 22, 21, 28, 'x'); g[28][19] = 'D'; g[28][20] = 'D';                  // the stair hall up
        rect(6, 3, 33, 21, 'x');                                                        // the hall
        for (const [x, y] of [[10, 7], [29, 7], [10, 16], [29, 16], [15, 11], [24, 11]]) g[y][x] = '#';
        for (const [x, y] of [[7, 4], [32, 4], [7, 20], [32, 20], [19, 4], [20, 4]]) g[y][x] = 'c';
        for (const [x, y] of [[18, 23], [21, 23], [18, 27], [21, 27]]) g[y][x] = 'L';
        g[4][8] = 'C'; g[4][31] = 'C';
        return {
            ground: 'citadel', art: 1, music: 'c3_citadel', dark: true, atmo: 'motes', tier: 5, depth: FLOORS,
            spawn: [20, 26.4], rows: g.map(r => r.join('')), props: [], npcs: [],
            foes: [{ t: 'riftwisp', x: 9, y: 12 }, { t: 'riftwisp', x: 30, y: 12 }, { t: 'veilcultist', x: 12, y: 19 }, { t: 'veilcultist', x: 27, y: 19 }],
            boss: { t: 'dtyrant', x: 20, y: 9, flag: 'c3tyrant' }, arena: [20, 11],
            exits: [{ x: 19, y: 28, w: 2, h: 1, to: id(FLOORS - 1), tx: 0, ty: 0, up: 1 }]
        };
    }
    const MAPS = {};
    for (let n = 1; n < FLOORS; n++) MAPS[id(n)] = floor(n);
    MAPS[id(FLOORS)] = hall();
    // each exit leads to the stairs of the floor it opens on: down lands under the stairs up, up lands under the stairs down
    for (let n = 1; n <= FLOORS; n++) for (const e of MAPS[id(n)].exits) {
        const to = MAPS[e.to];
        if (e.up && n === 1) { e.tx = DOOR.x + 1; e.ty = DOOR.y - 1.4; }
        else if (e.up) { e.tx = to.down[0]; e.ty = to.down[1]; }
        else { e.tx = to.spawn[0]; e.ty = to.spawn[1]; }
    }
    // the hidden stairs in the Elderwood: a little clearing in the south-west corner, behind the trees
    function hide(maps) {
        const el = maps.c3_elder; if (!el || el.depthDoor) return;
        const g = el.rows.map(r => r.split(''));
        for (let y = 29; y <= 34; y++) for (let x = 1; x <= 5; x++) if (g[y][x] !== '^') g[y][x] = ',';
        for (const [x, y] of [[1, 29], [5, 29], [1, 34], [5, 30]]) g[y][x] = 'T';
        g[DOOR.y][DOOR.x] = 'D'; g[DOOR.y][DOOR.x + 1] = 'D';
        el.rows = g.map(r => r.join(''));
        el.depthDoor = [DOOR.x + 1, DOOR.y + 0.5];
        el.exits.push({ x: DOOR.x, y: DOOR.y, w: 2, h: 1, to: id(1), tx: MAPS[id(1)].spawn[0], ty: MAPS[id(1)].spawn[1] });
        Object.assign(maps, MAPS);
    }
    if (window.HM_C3_MAPS) hide(window.HM_C3_MAPS);

    // the texts, in the four languages, merged into the game's texts
    const TXT = {
        en: { ui: { c3deepIn: 'The Sunken Vault: five floors down, a tyrant sleeps on a hoard of legendary weapons.', c3deepFirst: 'The Deep Tyrant\'s hoard: a legendary weapon of every kind!', c3deepAgain: 'The Deep Tyrant\'s hoard: a legendary weapon!', c3deepWake: 'The Deep Tyrant wakes in its hall again.' },
              zone: { c3_deep1: 'The Sunken Vault (1/5)', c3_deep2: 'The Sunken Vault (2/5)', c3_deep3: 'The Sunken Vault (3/5)', c3_deep4: 'The Sunken Vault (4/5)', c3_deep5: 'The Tyrant\'s Hall (5/5)' },
              boss: { dtyrant: 'The Deep Tyrant' }, foes: { dtyrant: ['The Deep Tyrant', 'A giant of molten iron at the bottom of the Sunken Vault. It slams, sends spirals of fire, calls the dead and charges.'] } },
        fr: { ui: { c3deepIn: 'Le Caveau englouti : cinq étages plus bas, un tyran dort sur un trésor d’armes légendaires.', c3deepFirst: 'Le trésor du Tyran des profondeurs : une arme légendaire de chaque sorte !', c3deepAgain: 'Le trésor du Tyran des profondeurs : une arme légendaire !', c3deepWake: 'Le Tyran des profondeurs se réveille à nouveau dans sa salle.' },
              zone: { c3_deep1: 'Le Caveau englouti (1/5)', c3_deep2: 'Le Caveau englouti (2/5)', c3_deep3: 'Le Caveau englouti (3/5)', c3_deep4: 'Le Caveau englouti (4/5)', c3_deep5: 'La Salle du Tyran (5/5)' },
              boss: { dtyrant: 'Le Tyran des profondeurs' }, foes: { dtyrant: ['Le Tyran des profondeurs', 'Un géant de fer en fusion au fond du Caveau englouti. Il frappe le sol, lance des spirales de feu, appelle les morts et charge.'] } },
        es: { ui: { c3deepIn: 'La Cripta Hundida: cinco pisos más abajo, un tirano duerme sobre un tesoro de armas legendarias.', c3deepFirst: 'El tesoro del Tirano de las Profundidades: ¡un arma legendaria de cada tipo!', c3deepAgain: 'El tesoro del Tirano de las Profundidades: ¡un arma legendaria!', c3deepWake: 'El Tirano de las Profundidades despierta otra vez en su sala.' },
              zone: { c3_deep1: 'La Cripta Hundida (1/5)', c3_deep2: 'La Cripta Hundida (2/5)', c3_deep3: 'La Cripta Hundida (3/5)', c3_deep4: 'La Cripta Hundida (4/5)', c3_deep5: 'La Sala del Tirano (5/5)' },
              boss: { dtyrant: 'El Tirano de las Profundidades' }, foes: { dtyrant: ['El Tirano de las Profundidades', 'Un gigante de hierro fundido al fondo de la Cripta Hundida. Golpea el suelo, lanza espirales de fuego, llama a los muertos y embiste.'] } },
        ar: { ui: { c3deepIn: 'القبو الغارق: خمسة طوابق إلى الأسفل، ينام طاغية على كنز من الأسلحة الأسطورية.', c3deepFirst: 'كنز طاغية الأعماق: سلاح أسطوري من كل نوع!', c3deepAgain: 'كنز طاغية الأعماق: سلاح أسطوري!', c3deepWake: 'طاغية الأعماق يستيقظ من جديد في قاعته.' },
              zone: { c3_deep1: 'القبو الغارق (1/5)', c3_deep2: 'القبو الغارق (2/5)', c3_deep3: 'القبو الغارق (3/5)', c3_deep4: 'القبو الغارق (4/5)', c3_deep5: 'قاعة الطاغية (5/5)' },
              boss: { dtyrant: 'طاغية الأعماق' }, foes: { dtyrant: ['طاغية الأعماق', 'عملاق من حديد منصهر في قاع القبو الغارق. يضرب الأرض، يطلق دوامات من نار، ينادي الموتى ويندفع.'] } }
    };
    function merge(TEXT) {
        for (const l in TXT) { const T = TEXT[l]; if (!T) continue; for (const part in TXT[l]) Object.assign(T[part] || (T[part] = {}), TXT[l][part]); }
    }
    if (window.HM_TEXT) merge(window.HM_TEXT);
    return { MAPS, FLOORS, id, merge };
})();
