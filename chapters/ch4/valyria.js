/* Hollowmere, Chapter 4: The Ruins of Old Valyria, a five-floor dungeon beneath the eastern ruins of Essos.
 * Its staircase lies in the south-east corner of Braavos & Essos (c4_essos).
 * Floors 1 to 4 are built from a fixed seed: nine Valyrian chambers on a 3 x 3 grid joined by corridors.
 * Floor 5 is the Hall of the Fourteen Flames, where the Valyrian Dragonlord guards a hoard of Tier 6 Valyrian steel weapons. */
window.HM_C4_VALYRIA = (function () {
    'use strict';
    const W = 40, H = 30, CW = 13, CH = 10, FLOORS = 5;
    const id = n => 'c4_val' + n;
    function rng(seed) {
        let a = seed >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const KINDS = [
        ['firewyrm', 'shadow', 'wight'],
        ['kraken', 'direwolf', 'children'],
        ['icespider', 'unicorn', 'whitewalker'],
        ['giant', 'firewyrm', 'whitewalker']
    ];
    function kinds(n) { let k = []; for (let i = 0; i < Math.min(n, KINDS.length); i++) k = k.concat(KINDS[i]); return k; }

    const DOOR = { x: 43, y: 31 }; // staircase in the south-east of c4_essos
    function floor(n) {
        const R = rng(9417 + n * 104729), ri = k => (R() * k) | 0;
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
        for (let y = sr.y1 + 1; y < H - 1; y++) { g[y][sr.cx] = 'x'; g[y][sr.cx + 1] = 'x'; }
        g[H - 2][sr.cx] = 'D'; g[H - 2][sr.cx + 1] = 'D';
        const dx = fr.x0, dy = fr.y0; g[dy][dx] = 'D'; g[dy][dx + 1] = 'D';
        const onLine = (r, x, y) => x === r.cx || x === r.cx + 1 || y === r.cy || y === r.cy + 1;
        const free = (x, y) => g[y][x] === 'x';
        const lamp = n >= 4 ? 'c' : 'L';
        for (const r of rooms) {
            for (const [x, y] of [[r.x1, r.y0], [r.x0, r.y1], [r.x1, r.y1]]) if (free(x, y) && !onLine(r, x, y) && R() < 0.55) g[y][x] = R() < 0.4 ? 'p' : lamp;
        }
        for (let k = 0, guard = 0; k < 2 && guard < 40; guard++) {
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
            ground: n >= 4 ? 'citadel' : 'keep', art: 1, music: n >= 4 ? 'c4_beyond' : 'c4_storm', dark: true, atmo: 'embers', tier: 6, depth: n,
            spawn: [sr.cx + 1, H - 3.4], rows: g.map(r => r.join('')), props: [], npcs: [], foes,
            down: [dx + 1, dy + 1.6],
            exits: [{ x: sr.cx, y: H - 2, w: 2, h: 1, to: n === 1 ? 'c4_essos' : id(n - 1), tx: 0, ty: 0, up: 1 },
                    { x: dx, y: dy, w: 2, h: 1, to: id(n + 1), tx: 0, ty: 0 }]
        };
    }

    function hall() {
        const g = []; for (let y = 0; y < H; y++) g.push(new Array(W).fill('#'));
        const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c; };
        rect(18, 22, 21, 28, 'x'); g[28][19] = 'D'; g[28][20] = 'D';
        rect(6, 3, 33, 21, 'x');
        for (const [x, y] of [[10, 7], [29, 7], [10, 16], [29, 16], [15, 11], [24, 11]]) g[y][x] = '#';
        for (const [x, y] of [[7, 4], [32, 4], [7, 20], [32, 20], [19, 4], [20, 4]]) g[y][x] = 'c';
        for (const [x, y] of [[18, 23], [21, 23], [18, 27], [21, 27]]) g[y][x] = 'L';
        g[4][8] = 'C'; g[4][31] = 'C';
        return {
            ground: 'citadel', art: 1, music: 'c4_beyond', dark: true, atmo: 'embers', tier: 6, depth: FLOORS,
            spawn: [20, 26.4], rows: g.map(r => r.join('')), props: [], npcs: [],
            foes: [{ t: 'firewyrm', x: 9, y: 12 }, { t: 'firewyrm', x: 30, y: 12 }, { t: 'shadow', x: 12, y: 19 }, { t: 'shadow', x: 27, y: 19 }],
            boss: { t: 'valyrianlord', x: 20, y: 9, flag: 'c4valyrian' }, arena: [20, 11],
            exits: [{ x: 19, y: 28, w: 2, h: 1, to: id(FLOORS - 1), tx: 0, ty: 0, up: 1 }]
        };
    }

    const MAPS = {};
    for (let n = 1; n < FLOORS; n++) MAPS[id(n)] = floor(n);
    MAPS[id(FLOORS)] = hall();
    for (let n = 1; n <= FLOORS; n++) for (const e of MAPS[id(n)].exits) {
        const to = MAPS[e.to];
        if (e.up && n === 1) { e.tx = DOOR.x + 1; e.ty = DOOR.y - 1.4; }
        else if (e.up) { e.tx = to.down[0]; e.ty = to.down[1]; }
        else { e.tx = to.spawn[0]; e.ty = to.spawn[1]; }
    }

    function hide(maps) {
        const es = maps.c4_essos; if (!es || es.depthDoor) return;
        const g = es.rows.map(r => r.split(''));
        for (let y = 28; y <= 33; y++) for (let x = 41; x <= 45; x++) if (g[y] && g[y][x] !== '^') g[y][x] = ',';
        g[DOOR.y][DOOR.x] = 'D'; g[DOOR.y][DOOR.x + 1] = 'D';
        es.rows = g.map(r => r.join(''));
        es.depthDoor = [DOOR.x + 1, DOOR.y + 0.5];
        es.exits.push({ x: DOOR.x, y: DOOR.y, w: 2, h: 1, to: id(1), tx: MAPS[id(1)].spawn[0], ty: MAPS[id(1)].spawn[1] });
        Object.assign(maps, MAPS);
    }
    if (window.HM_C4_MAPS) hide(window.HM_C4_MAPS);

    const TXT = {
        en: {
            ui: {
                c4valIn: 'The Ruins of Old Valyria: five floors below, the Valyrian Dragonlord guards a hoard of legendary Tier 6 weapons.',
                c4valFirst: 'The Valyrian Hoard: a legendary Tier 6 weapon of every class!',
                c4valAgain: 'The Valyrian Hoard: a legendary Tier 6 weapon!',
                c4valWake: 'The Valyrian Dragonlord stirs once more in the Hall of the Fourteen Flames.'
            },
            zone: {
                c4_val1: 'Ruins of Old Valyria (1/5)', c4_val2: 'Ruins of Old Valyria (2/5)',
                c4_val3: 'Ruins of Old Valyria (3/5)', c4_val4: 'Ruins of Old Valyria (4/5)',
                c4_val5: 'Hall of the Fourteen Flames (5/5)'
            },
            boss: { valyrianlord: 'The Valyrian Dragonlord' },
            foes: { valyrianlord: ['The Valyrian Dragonlord', 'An immortal lord of Old Valyria clad in molten dragonscale. Commands bloodfire, magma fissures, firewyrms, and devastating charges.'] }
        },
        fr: {
            ui: {
                c4valIn: 'Les Ruines de l’Ancienne Valyria : cinq étages plus bas, le Seigneur-Dragon garde un trésor d’armes valyriennes.',
                c4valFirst: 'Le trésor de Valyria : une arme légendaire de chaque classe !',
                c4valAgain: 'Le trésor de Valyria : une arme légendaire !',
                c4valWake: 'Le Seigneur-Dragon Valyrien se réveille dans la Salle des Quatorze Flammes.'
            },
            zone: {
                c4_val1: 'Ruines de Valyria (1/5)', c4_val2: 'Ruines de Valyria (2/5)',
                c4_val3: 'Ruines de Valyria (3/5)', c4_val4: 'Ruines de Valyria (4/5)',
                c4_val5: 'Salle des Quatorze Flammes (5/5)'
            },
            boss: { valyrianlord: 'Le Seigneur-Dragon Valyrien' },
            foes: { valyrianlord: ['Le Seigneur-Dragon Valyrien', 'Un seigneur immortel de l’Ancienne Valyria vêtu d’écailles en fusion. Commande le magma et les vers de feu.'] }
        },
        es: {
            ui: {
                c4valIn: 'Las Ruinas de la Antigua Valyria: cinco pisos más abajo, el Señor Dragón guarda un tesoro de armas valyrias.',
                c4valFirst: '¡El tesoro de Valyria: un arma legendaria de cada clase!',
                c4valAgain: '¡El tesoro de Valyria: un arma legendaria!',
                c4valWake: 'El Señor Dragón Valyrio despierta otra vez en la Sala de las Catorce Llamas.'
            },
            zone: {
                c4_val1: 'Ruinas de Valyria (1/5)', c4_val2: 'Ruinas de Valyria (2/5)',
                c4_val3: 'Ruinas de Valyria (3/5)', c4_val4: 'Ruinas de Valyria (4/5)',
                c4_val5: 'Sala de las Catorce Llamas (5/5)'
            },
            boss: { valyrianlord: 'El Señor Dragón Valyrio' },
            foes: { valyrianlord: ['El Señor Dragón Valyrio', 'Un señor inmortal de la Antigua Valyria revestido de escamas fundidas. Domina el magma y los gusanos de fuego.'] }
        },
        ar: {
            ui: {
                c4valIn: 'أطلال فاليريا القديمة: خمسة طوابق إلى الأسفل، يحرس سيد التنانين الفاليري كنزًا من الأسلحة الأسطورية.',
                c4valFirst: 'كنز فاليريا: سلاح أسطوري من كل فئة!',
                c4valAgain: 'كنز فاليريا: سلاح أسطوري!',
                c4valWake: 'سيد التنانين الفاليري يستيقظ من جديد في قاعة اللهب الأربعة عشر.'
            },
            zone: {
                c4_val1: 'أطلال فاليريا القديمة (1/5)', c4_val2: 'أطلال فاليريا القديمة (2/5)',
                c4_val3: 'أطلال فاليريا القديمة (3/5)', c4_val4: 'أطلال فاليريا القديمة (4/5)',
                c4_val5: 'قاعة اللهب الأربعة عشر (5/5)'
            },
            boss: { valyrianlord: 'سيد التنانين الفاليري' },
            foes: { valyrianlord: ['سيد التنانين الفاليري', 'سيد خالد من فاليريا القديمة يرتدي حراشف تنين منصهرة. يتحكم بالحمم النارية وديدان النار.'] }
        }
    };
    function merge(TEXT) {
        for (const l in TXT) { const T = TEXT[l]; if (!T) continue; for (const part in TXT[l]) Object.assign(T[part] || (T[part] = {}), TXT[l][part]); }
    }
    if (window.HM_TEXT) merge(window.HM_TEXT);
    return { MAPS, FLOORS, id, merge };
})();
