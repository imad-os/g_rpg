/* Hollowmere, Chapter 3: the seven areas of the Veilscar Frontier, built from a few drawing steps
 * (fill, rect, scatter...). Letters are listed in chapters/ch3/art.js. Coordinates are in tiles.
 * Spots the main quests use (wagons, petals, wards, levers, runes, anchors) are named in quests.json. */
window.HM_C3_MAPS = (function () {
    'use strict';
    function grid(w, h, c) { const g = []; for (let y = 0; y < h; y++) g.push(new Array(w).fill(c)); return g; }
    function rect(g, x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] !== undefined) g[y][x] = c; }
    function box(g, x0, y0, x1, y1, c) { rect(g, x0, y0, x1, y0, c); rect(g, x0, y1, x1, y1, c); rect(g, x0, y0, x0, y1, c); rect(g, x1, y0, x1, y1, c); }
    function put(g, list, c) { for (let i = 0; i < list.length; i += 2) g[list[i + 1]][list[i]] = c; }
    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    function scatter(g, x0, y0, x1, y1, c, chance, seed, on) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] === (on || '.') && hash(x, y, seed) < chance) g[y][x] = c; }
    // keep the ground under props (and a step in front of them) free of trees and rocks
    function clear(g, props, c) { for (const p of props) rect(g, p.x - 1, p.y - 1, p.x + (p.w || 1), p.y + (p.h || 1) + 1, c || '.'); }
    // people and quest spots must be reachable: trees, rocks and bushes around them go
    function unblock(g, pts) { for (const q of pts) for (let y = Math.floor(q[1]) - 1; y <= Math.floor(q[1]) + 1; y++) for (let x = Math.floor(q[0]) - 1; x <= Math.floor(q[0]) + 1; x++) if (g[y] && 'TkPrF'.indexOf(g[y][x]) >= 0) g[y][x] = q[2] || ','; }
    const rows = g => g.map(r => r.join(''));

    /* ---------------- Dawnwatch: the last frontier town (no foes) ---------------- */
    function dawn() {
        const g = grid(44, 32, '.');
        rect(g, 0, 0, 43, 0, '^'); rect(g, 0, 0, 0, 26, '^'); rect(g, 43, 0, 43, 26, '^');
        rect(g, 1, 1, 42, 1, '#');                                    // the palisade, with the north gate
        rect(g, 21, 0, 22, 0, '='); rect(g, 21, 1, 22, 1, 'q');
        rect(g, 21, 2, 22, 26, '=');                                  // the king's road
        rect(g, 0, 13, 42, 14, '='); rect(g, 42, 13, 42, 14, 'g'); rect(g, 43, 13, 43, 14, '=');   // west to the wood, east gate to the marches
        rect(g, 15, 8, 28, 19, 'x');                                  // the square
        rect(g, 1, 26, 42, 26, 'd'); rect(g, 0, 27, 43, 31, '~');     // shore and lake
        rect(g, 20, 26, 23, 30, 'w');                                 // the dock
        const props = [
            { k: 'house', x: 3, y: 3, w: 5, h: 3, roof: 'slate', b: 0 }, { k: 'house', x: 9, y: 3, w: 4, h: 3, roof: 'red', b: 1 },
            { k: 'house', x: 30, y: 3, w: 5, h: 3, roof: 'green', b: 2 }, { k: 'house', x: 36, y: 3, w: 5, h: 3, roof: 'blue', b: 3 },
            { k: 'house', x: 2, y: 16, w: 6, h: 3, roof: 'slate', kind: 'smith', b: 0 }, { k: 'house', x: 31, y: 16, w: 5, h: 3, roof: 'green', kind: 'shop', b: 1 },
            { k: 'house', x: 31, y: 8, w: 5, h: 3, roof: 'brown', kind: 'inn', b: 2 }, { k: 'house', x: 36, y: 21, w: 5, h: 3, roof: 'red', kind: 'stable', b: 3 },
            { k: 'house', x: 3, y: 21, w: 5, h: 3, roof: 'blue', b: 2 }, { k: 'house', x: 9, y: 21, w: 4, h: 3, roof: 'brown', b: 4 },
            { k: 'beacon', x: 14, y: 7, w: 1, h: 1, n: 1 }, { k: 'beacon', x: 29, y: 7, w: 1, h: 1, n: 2 }, { k: 'beacon', x: 14, y: 20, w: 1, h: 1, n: 3 }, { k: 'beacon', x: 29, y: 20, w: 1, h: 1, n: 4 },
            { k: 'pyre', x: 24, y: 9, w: 2, h: 2 }, { k: 'well', x: 17, y: 16, w: 1, h: 1 }, { k: 'stall', x: 16, y: 9, w: 2, h: 1 },
            { k: 'boat', x: 24, y: 28, w: 2, h: 1 }, { k: 'banner', x: 19, y: 2, w: 1, h: 1, c: 'guard' }, { k: 'banner', x: 24, y: 2, w: 1, h: 1, c: 'guard' }
        ];
        scatter(g, 1, 2, 42, 25, 'T', 0.06, 3); scatter(g, 1, 2, 42, 25, 'F', 0.05, 5); scatter(g, 1, 2, 42, 25, 'k', 0.03, 7);
        clear(g, props.filter(p => p.k !== 'boat')); rect(g, 15, 8, 28, 19, 'x'); rect(g, 21, 2, 22, 26, '='); rect(g, 0, 13, 42, 14, '='); rect(g, 42, 13, 42, 14, 'g');
        rect(g, 1, 26, 42, 26, 'd'); rect(g, 20, 26, 23, 26, 'w');
        put(g, [8, 7, 35, 7, 7, 25, 40, 12], 'p'); put(g, [41, 2, 2, 12], 'C'); put(g, [18, 8, 25, 8, 18, 19, 25, 19], 'L');
        return {
            ground: 'dawn', art: 1, music: 'c3_dawn', atmo: 'leaves', spawn: [21.5, 24.5], tier: 5,
            rows: rows(g), props,
            npcs: [
                { id: 'aldric', x: 19.5, y: 16.6 }, { id: 'ysolde', x: 17.5, y: 11.6 }, { id: 'brann', x: 5.5, y: 19.7 }, { id: 'mira', x: 33.5, y: 19.7 },
                { id: 'tov', x: 33.5, y: 11.7 }, { id: 'kesh', x: 38.5, y: 24.7 }, { id: 'ivo', x: 11.5, y: 10.6, roam: 1 }, { id: 'roan', x: 27.5, y: 23.6 },
                { id: 'pim', x: 18.5, y: 21.5, roam: 3 }, { id: 'folk1', x: 9, y: 13.6, roam: 4 }, { id: 'folk2', x: 35, y: 14.6, roam: 4 }, { id: 'nessa', x: 23.5, y: 24.8 }
            ],
            foes: [],
            exits: [{ x: 0, y: 13, w: 1, h: 2, to: 'c3_elder', tx: 47.5, ty: 17.5 }, { x: 43, y: 13, w: 1, h: 2, to: 'c3_ashen', tx: 2.5, ty: 17.5 },
                    { x: 21, y: 0, w: 2, h: 1, to: 'c3_frost', tx: 23.5, ty: 36.5 }]
        };
    }

    /* ---------------- the Elderwood: giant glowing trees, streams, the druid shrine ---------------- */
    function elder() {
        const g = grid(50, 36, '.');
        box(g, 0, 0, 49, 35, '^'); rect(g, 49, 17, 49, 18, 'd');
        rect(g, 33, 1, 34, 34, '~'); rect(g, 1, 11, 32, 12, '~');                     // two streams
        rect(g, 25, 17, 48, 18, 'd'); rect(g, 33, 17, 34, 18, 'w');                   // the old caravan road, a bridge
        rect(g, 24, 9, 26, 16, 'd'); rect(g, 24, 11, 26, 12, 'w');                     // north to the shrine
        rect(g, 8, 18, 24, 19, 'd'); rect(g, 8, 20, 9, 27, 'd'); rect(g, 26, 19, 27, 30, 'd'); rect(g, 35, 22, 42, 23, 'd');
        rect(g, 17, 1, 33, 9, 'x'); box(g, 16, 0, 33, 10, '^'); rect(g, 24, 10, 26, 10, 'x');   // the shrine circle
        put(g, [18, 2, 31, 2, 18, 8, 31, 8, 20, 5, 29, 5], 'R');                        // standing stones
        const props = [
            { k: 'shrine', x: 24, y: 2, w: 3, h: 1 }, { k: 'wagon', x: 40, y: 21, w: 2, h: 1 }, { k: 'wagon', x: 29, y: 26, w: 2, h: 1 }, { k: 'wagon', x: 14, y: 16, w: 2, h: 1 },
            { k: 'tent', x: 5, y: 26, w: 3, h: 2, c: 'grove' }, { k: 'tent', x: 11, y: 28, w: 3, h: 2, c: 'grove' }, { k: 'fire', x: 9, y: 30, w: 1, h: 1 },
            { k: 'banner', x: 4, y: 30, w: 1, h: 1, c: 'grove' }, { k: 'lore', x: 46, y: 31, w: 1, h: 1, n: 0 }
        ];
        scatter(g, 1, 1, 48, 34, 'T', 0.13, 13); scatter(g, 1, 1, 48, 34, 'F', 0.1, 15); scatter(g, 1, 1, 48, 34, 'k', 0.05, 17); scatter(g, 1, 1, 48, 34, ',', 0.12, 19);
        clear(g, props, ','); rect(g, 17, 1, 32, 9, 'x'); put(g, [18, 2, 31, 2, 18, 8, 31, 8, 20, 5, 29, 5], 'R'); rect(g, 22, 1, 28, 4, 'x');
        rect(g, 25, 17, 48, 18, 'd'); rect(g, 33, 17, 34, 18, 'w'); rect(g, 24, 9, 26, 16, 'd'); rect(g, 24, 11, 26, 12, 'w');
        rect(g, 8, 18, 24, 19, 'd'); rect(g, 8, 20, 9, 27, 'd'); rect(g, 26, 19, 27, 30, 'd'); rect(g, 35, 22, 42, 23, 'd'); rect(g, 33, 1, 34, 16, '~'); rect(g, 33, 19, 34, 34, '~'); rect(g, 1, 11, 23, 12, '~'); rect(g, 27, 11, 32, 12, '~');
        // spots the story uses: petals in hidden corners, the camp, the secret path to an old chest
        rect(g, 5, 5, 7, 7, ','); rect(g, 43, 4, 45, 6, ','); rect(g, 19, 30, 21, 32, ','); rect(g, 2, 2, 3, 3, ','); rect(g, 3, 4, 3, 8, ',');
        unblock(g, [[8.5, 28.6], [40.5, 9.2], [6, 6], [44, 5], [20, 31], [41, 21.5], [30, 26.5], [15, 16.5], [46, 31]]);
        put(g, [2, 2], 'C'); put(g, [44, 33, 36, 3], 'C'); put(g, [12, 24, 38, 28, 45, 9], 'p');
        return {
            ground: 'elder', art: 1, music: 'c3_elder', atmo: 'fireflies', spawn: [47.5, 17.5], tier: 5,
            rows: rows(g), props,
            npcs: [{ id: 'fenna', x: 8.5, y: 28.6 }, { id: 'leaf', x: 40.5, y: 9.2 }],
            foes: [{ t: 'thornstalker', x: 38, y: 25 }, { t: 'thornstalker', x: 30, y: 22 }, { t: 'thornstalker', x: 16, y: 21 }, { t: 'thornstalker', x: 20, y: 15 },
                   { t: 'thornstalker', x: 43, y: 10 }, { t: 'thornstalker', x: 10, y: 6 }, { t: 'grimwolf', x: 41, y: 30 }, { t: 'grimwolf', x: 18, y: 28 }, { t: 'grimwolf', x: 6, y: 15 },
                   { t: 'riftwisp', x: 28, y: 14 }, { t: 'riftwisp', x: 39, y: 6 }, { t: 'riftwisp', x: 12, y: 8 }, { t: 'stonebrute', x: 22, y: 25 }],
            boss: { t: 'rootbound', x: 25, y: 5.6, flag: 'c3root' }, arena: [25, 5.6],
            exits: [{ x: 49, y: 17, w: 1, h: 2, to: 'c3_dawn', tx: 2.5, ty: 13.5 }]
        };
    }

    /* ---------------- the Ashen Marches: a burnt village, a graveyard, the Ashblood camp ---------------- */
    function ashen() {
        const g = grid(52, 36, 'a');
        box(g, 0, 0, 51, 35, '^'); rect(g, 0, 17, 0, 18, 'd');
        rect(g, 1, 17, 46, 18, 'd'); rect(g, 45, 1, 47, 18, 'd'); rect(g, 45, 0, 47, 0, 'D');      // the road to the keep
        rect(g, 3, 2, 21, 12, ','); box(g, 2, 1, 22, 13, 'f'); rect(g, 11, 13, 13, 13, ',');           // the graveyard and its fence
        for (let y = 3; y <= 11; y += 2) for (let x = 4; x <= 20; x += 3) if (!((x === 7 && y === 3) || (x === 16 && y === 3) || (x === 13 && y === 9))) g[y][x] = 'G';
        rect(g, 4, 20, 26, 33, 'x');                                                                    // Hearthvale's burnt square
        rect(g, 33, 22, 48, 33, 'd');                                                                   // the Ashblood camp
        const props = [
            { k: 'ruin', x: 5, y: 21, w: 5, h: 3 }, { k: 'ruin', x: 12, y: 21, w: 4, h: 3 }, { k: 'ruin', x: 19, y: 21, w: 5, h: 3 },
            { k: 'ruin', x: 5, y: 28, w: 4, h: 3 }, { k: 'ruin', x: 18, y: 28, w: 5, h: 3 }, { k: 'well', x: 14, y: 26, w: 1, h: 1 },
            { k: 'ward', x: 7, y: 3, w: 1, h: 1 }, { k: 'ward', x: 16, y: 3, w: 1, h: 1 }, { k: 'ward', x: 12, y: 9, w: 1, h: 1 },
            { k: 'tent', x: 35, y: 23, w: 3, h: 2, c: 'ash' }, { k: 'tent', x: 42, y: 23, w: 3, h: 2, c: 'ash' }, { k: 'tent', x: 37, y: 29, w: 3, h: 2, c: 'ash' },
            { k: 'fire', x: 40, y: 27, w: 1, h: 1 }, { k: 'banner', x: 34, y: 27, w: 1, h: 1, c: 'ash' }, { k: 'banner', x: 46, y: 27, w: 1, h: 1, c: 'ash' },
            { k: 'lore', x: 28, y: 5, w: 1, h: 1, n: 1 }
        ];
        scatter(g, 23, 1, 44, 16, 'P', 0.07, 21, 'a'); scatter(g, 1, 19, 50, 34, 'P', 0.05, 23, 'a'); scatter(g, 1, 1, 50, 34, 'r', 0.035, 25, 'a'); scatter(g, 23, 1, 44, 34, 'B', 0.025, 27, 'a');
        clear(g, props.filter(p => p.k !== 'ward'), 'a'); rect(g, 4, 20, 26, 33, 'x'); rect(g, 33, 22, 48, 33, 'd'); for (const p of props) if (p.k === 'ward') g[p.y][p.x] = ',';
        rect(g, 1, 17, 46, 18, 'd'); rect(g, 45, 1, 47, 18, 'd');
        unblock(g, [[10.5, 25.6, 'x'], [24.5, 31.2, 'x'], [37.5, 10.6, 'a'], [6.5, 32.4, 'x'], [28, 5, 'a'], [40.5, 25.8, 'd']]);
        put(g, [49, 33, 24, 2, 3, 33], 'C'); put(g, [10, 26, 22, 26, 44, 31, 30, 9], 'p');
        return {
            ground: 'ashen', art: 1, music: 'c3_ashen', atmo: 'ash', spawn: [2.5, 17.5], tier: 5,
            rows: rows(g), props,
            npcs: [{ id: 'kragg', x: 40.5, y: 25.8 }, { id: 'gorra', x: 44.5, y: 30.6, roam: 2 },
                   { id: 'surv1', x: 10.5, y: 25.6 }, { id: 'surv2', x: 24.5, y: 31.2 }, { id: 'surv3', x: 37.5, y: 10.6 }, { id: 'surv4', x: 6.5, y: 32.4 }],
            foes: [{ t: 'hollowsoldier', x: 15, y: 25 }, { t: 'hollowsoldier', x: 22, y: 31 }, { t: 'hollowsoldier', x: 30, y: 14 }, { t: 'hollowsoldier', x: 40, y: 8 },
                   { t: 'ashenarcher', x: 9, y: 6 }, { t: 'ashenarcher', x: 18, y: 10 }, { t: 'ashenarcher', x: 28, y: 22 }, { t: 'ashenarcher', x: 38, y: 4 },
                   { t: 'cryptbones', x: 6, y: 10 }, { t: 'cryptbones', x: 14, y: 4 }, { t: 'cryptbones', x: 26, y: 27 }, { t: 'cryptbones', x: 34, y: 14 },
                   { t: 'stonebrute', x: 29, y: 31 }, { t: 'stonebrute', x: 42, y: 13 }, { t: 'grimwolf', x: 30, y: 4 }],
            exits: [{ x: 0, y: 17, w: 1, h: 2, to: 'c3_dawn', tx: 41.5, ty: 13.5 }, { x: 45, y: 0, w: 3, h: 1, to: 'c3_keep', tx: 20.5, ty: 28.6 }]
        };
    }

    /* ---------------- the Ruined Keep: Marshal Veyr's dark halls ---------------- */
    function keep() {
        const g = grid(40, 32, '#');
        rect(g, 14, 21, 26, 30, 'x'); rect(g, 19, 31, 21, 31, 'D');                     // entry hall
        rect(g, 19, 14, 21, 20, 'x'); rect(g, 19, 14, 21, 14, 'g');                     // the corridor and the inner gate
        rect(g, 2, 14, 12, 28, 'x'); rect(g, 13, 25, 13, 26, 'x');                       // west wing
        rect(g, 28, 14, 38, 28, 'x'); rect(g, 27, 25, 27, 26, 'x');                      // east wing
        rect(g, 5, 2, 35, 13, 'x');                                                     // the great hall
        rect(g, 6, 17, 8, 19, ','); rect(g, 32, 20, 34, 22, ','); put(g, [10, 5, 30, 5, 10, 10, 30, 10], '#');   // rubble, pillars
        put(g, [14, 22, 26, 22, 3, 15, 11, 27, 29, 27, 37, 15, 6, 3, 34, 3, 6, 12, 34, 12], 'L');
        put(g, [3, 27, 37, 27], 'C'); put(g, [15, 29, 25, 29, 9, 20, 31, 18], 'p');
        return {
            ground: 'keep', art: 1, music: 'c3_keep', dark: true, atmo: 'motes', spawn: [20.5, 28.6], tier: 5,
            rows: rows(g), props: [{ k: 'lever', x: 4, y: 16, w: 1, h: 1, n: 0 }, { k: 'lever', x: 36, y: 17, w: 1, h: 1, n: 1 }, { k: 'throne', x: 19, y: 2, w: 3, h: 1 }],
            npcs: [],
            foes: [{ t: 'hollowsoldier', x: 17, y: 24 }, { t: 'hollowsoldier', x: 8, y: 22 }, { t: 'hollowsoldier', x: 33, y: 24 }, { t: 'hollowsoldier', x: 20, y: 17 },
                   { t: 'ashenarcher', x: 24, y: 27 }, { t: 'ashenarcher', x: 4, y: 26 }, { t: 'ashenarcher', x: 35, y: 15 },
                   { t: 'cryptbones', x: 10, y: 15 }, { t: 'cryptbones', x: 30, y: 26 }, { t: 'cryptbones', x: 16, y: 28 }, { t: 'veilcultist', x: 7, y: 25 }, { t: 'veilcultist', x: 31, y: 21 }],
            boss: { t: 'veyr', x: 20, y: 7, flag: 'c3veyr' }, arena: [20, 7],
            exits: [{ x: 19, y: 31, w: 3, h: 1, to: 'c3_ashen', tx: 46, ty: 2.5 }]
        };
    }

    /* ---------------- the Frostbound Heights: snow, ice, pines and the frozen fortress ---------------- */
    function frost() {
        const g = grid(48, 40, '.');
        box(g, 0, 0, 47, 39, '^'); rect(g, 23, 39, 24, 39, '=');
        rect(g, 23, 12, 24, 38, '=');                                                   // the old road up
        rect(g, 14, 1, 34, 11, '#'); rect(g, 15, 2, 33, 10, 'x');                        // the fortress and its yard
        rect(g, 23, 11, 24, 11, 'g'); rect(g, 23, 0, 24, 1, 'q');                        // the fortress gate; the breach to the Veilscar
        rect(g, 5, 14, 13, 18, '~'); rect(g, 33, 27, 41, 31, '~');                       // frozen ponds (solid)
        rect(g, 4, 13, 14, 19, 'i'); rect(g, 5, 14, 13, 18, '~'); rect(g, 32, 26, 42, 32, 'i'); rect(g, 33, 27, 41, 31, '~');
        rect(g, 9, 30, 24, 31, '='); rect(g, 25, 24, 38, 25, '='); rect(g, 8, 20, 9, 29, '=');
        const props = [{ k: 'tent', x: 10, y: 27, w: 3, h: 2, c: 'snow' }, { k: 'fire', x: 14, y: 29, w: 1, h: 1 },
                       { k: 'rune', x: 8, y: 20, w: 1, h: 1, n: 0 }, { k: 'rune', x: 38, y: 23, w: 1, h: 1, n: 1 }, { k: 'rune', x: 30, y: 14, w: 1, h: 1, n: 2 },
                       { k: 'lore', x: 44, y: 36, w: 1, h: 1, n: 2 }];
        scatter(g, 1, 12, 46, 38, 'P', 0.1, 31); scatter(g, 1, 12, 46, 38, '^', 0.04, 33); scatter(g, 1, 12, 46, 38, 'r', 0.03, 35); scatter(g, 1, 12, 46, 38, ',', 0.1, 37);
        scatter(g, 1, 1, 13, 11, 'P', 0.25, 39); scatter(g, 35, 1, 46, 11, 'P', 0.25, 41);
        clear(g, props, '.'); rect(g, 23, 12, 24, 38, '='); rect(g, 9, 30, 24, 31, '='); rect(g, 25, 24, 38, 25, '='); rect(g, 8, 20, 9, 29, '='); rect(g, 20, 12, 27, 16, '.'); rect(g, 23, 12, 24, 16, '=');
        rect(g, 5, 14, 13, 18, '~'); rect(g, 33, 27, 41, 31, '~');
        unblock(g, [[12.5, 30.2, '.'], [8, 20, '.'], [38, 23, '.'], [30, 14, '.'], [44, 36, '.']]);
        put(g, [16, 3, 32, 3, 16, 9, 32, 9], 'c'); put(g, [17, 6, 31, 6], 'L');
        put(g, [2, 13, 45, 13, 15, 3], 'C'); put(g, [27, 34, 19, 20, 42, 18], 'p');
        return {
            ground: 'frost', art: 1, music: 'c3_frost', atmo: 'snow', spawn: [23.5, 36.5], tier: 5,
            rows: rows(g), props,
            npcs: [{ id: 'brynn', x: 12.5, y: 30.2 }],
            foes: [{ t: 'frostfang', x: 15, y: 24 }, { t: 'frostfang', x: 33, y: 20 }, { t: 'frostfang', x: 40, y: 35 }, { t: 'frostfang', x: 6, y: 35 },
                   { t: 'frostfang', x: 28, y: 33 }, { t: 'frostfang', x: 20, y: 18 }, { t: 'frostfang', x: 31, y: 29 }, { t: 'stonebrute', x: 18, y: 14 }, { t: 'stonebrute', x: 36, y: 16 }, { t: 'grimwolf', x: 4, y: 24 },
                   { t: 'grimwolf', x: 44, y: 22 }, { t: 'riftwisp', x: 26, y: 20 }, { t: 'riftwisp', x: 11, y: 22 }, { t: 'yeti', x: 40, y: 30 }, { t: 'yeti', x: 6, y: 27 }],
            boss: { t: 'colossus', x: 24, y: 5.5, flag: 'c3colossus' }, arena: [24, 5.5],
            exits: [{ x: 23, y: 39, w: 2, h: 1, to: 'c3_dawn', tx: 21.5, ty: 2.6 }, { x: 23, y: 0, w: 2, h: 1, to: 'c3_veil', tx: 22.5, ty: 32.6 }]
        };
    }

    /* ---------------- the Veilscar: floating ruins over the void, three rift anchors ---------------- */
    function veil() {
        const g = grid(46, 36, '~');
        const isl = (x0, y0, x1, y1) => rect(g, x0, y0, x1, y1, 'x');
        isl(17, 27, 28, 34); isl(3, 15, 13, 25); isl(31, 12, 42, 23); isl(16, 4, 29, 13); isl(19, 0, 26, 3);   // the islands
        rect(g, 22, 35, 23, 35, 'x');
        rect(g, 22, 14, 23, 26, 'w'); rect(g, 14, 20, 21, 21, 'w'); rect(g, 24, 17, 30, 18, 'w'); rect(g, 8, 26, 9, 30, 'w'); rect(g, 8, 30, 16, 31, 'w');   // bridges of old stone
        rect(g, 21, 0, 24, 1, 'q');                                                      // the citadel door (shut while the anchors stand)
        scatter(g, 0, 0, 45, 35, '.', 0.6, 51, 'x'); scatter(g, 0, 0, 45, 35, 'c', 0.03, 53, 'x'); scatter(g, 0, 0, 45, 35, 'r', 0.03, 55, '.');
        rect(g, 21, 0, 24, 1, 'q'); rect(g, 6, 18, 9, 21, 'x'); rect(g, 35, 16, 38, 19, 'x'); rect(g, 20, 7, 24, 10, 'x'); rect(g, 22, 27, 26, 33, 'x');
        put(g, [4, 16, 41, 22, 28, 5], 'C'); put(g, [12, 24, 33, 13, 18, 12], 'p');
        return {
            ground: 'veil', art: 1, music: 'c3_veil', atmo: 'motes', spawn: [22.5, 32.6], tier: 5,
            rows: rows(g), props: [{ k: 'anchor', x: 7, y: 19, w: 2, h: 1, n: 0 }, { k: 'anchor', x: 36, y: 17, w: 2, h: 1, n: 1 }, { k: 'anchor', x: 21, y: 8, w: 2, h: 1, n: 2 },
                                   { k: 'lore', x: 41, y: 13, w: 1, h: 1, n: 3 }],
            npcs: [{ id: 'ally_guard', x: 25.5, y: 30.6 }, { id: 'ally_grove', x: 25.5, y: 30.6 }, { id: 'ally_ash', x: 25.5, y: 30.6 }],
            foes: [{ t: 'veilcultist', x: 10, y: 22 }, { t: 'veilcultist', x: 38, y: 21 }, { t: 'veilcultist', x: 26, y: 11 }, { t: 'veilcultist', x: 5, y: 17 },
                   { t: 'riftwisp', x: 20, y: 29 }, { t: 'riftwisp', x: 33, y: 14 }, { t: 'riftwisp', x: 18, y: 6 }, { t: 'riftwisp', x: 11, y: 17 },
                   { t: 'hollowsoldier', x: 22, y: 19 }, { t: 'hollowsoldier', x: 39, y: 15 }, { t: 'hollowsoldier', x: 27, y: 7 }],
            exits: [{ x: 22, y: 35, w: 2, h: 1, to: 'c3_frost', tx: 23.5, ty: 2.6 }, { x: 21, y: 0, w: 4, h: 1, to: 'c3_citadel', tx: 20.5, ty: 30.6 }]
        };
    }

    /* ---------------- the Fractured Citadel: the Hollow King's throne ---------------- */
    function citadel() {
        const g = grid(40, 34, '#');
        rect(g, 15, 24, 25, 32, 'x'); rect(g, 19, 33, 21, 33, 'D');
        rect(g, 19, 15, 21, 23, 'x'); rect(g, 4, 16, 14, 26, 'x'); rect(g, 26, 16, 36, 26, 'x'); rect(g, 14, 19, 15, 20, 'x'); rect(g, 25, 19, 26, 20, 'x');
        rect(g, 6, 2, 34, 14, 'x');                                                     // the throne hall
        rect(g, 8, 4, 9, 5, '~'); rect(g, 31, 4, 32, 5, '~'); rect(g, 8, 11, 9, 12, '~'); rect(g, 31, 11, 32, 12, '~');   // holes into the void
        put(g, [7, 3, 33, 3, 7, 13, 33, 13, 15, 25, 25, 25, 5, 17, 35, 17, 5, 25, 35, 25], 'c');
        put(g, [5, 22, 35, 22], 'C'); put(g, [16, 31, 24, 31, 13, 24, 27, 24], 'p');
        return {
            ground: 'citadel', art: 1, music: 'c3_citadel', dark: true, atmo: 'motes', spawn: [20.5, 30.6], tier: 5,
            rows: rows(g), props: [{ k: 'throne', x: 19, y: 2, w: 3, h: 1, c: 'void' }],
            npcs: [],
            foes: [{ t: 'riftwisp', x: 17, y: 27 }, { t: 'riftwisp', x: 9, y: 20 }, { t: 'riftwisp', x: 31, y: 22 }, { t: 'veilcultist', x: 23, y: 28 },
                   { t: 'veilcultist', x: 6, y: 24 }, { t: 'veilcultist', x: 34, y: 18 }, { t: 'hollowsoldier', x: 20, y: 18 }, { t: 'hollowsoldier', x: 11, y: 17 },
                   { t: 'hollowsoldier', x: 29, y: 25 }, { t: 'riftborn', x: 20, y: 21 }],
            boss: { t: 'hollowking', x: 20, y: 7, flag: 'c3king' }, arena: [20, 7.5],
            exits: [{ x: 19, y: 33, w: 3, h: 1, to: 'c3_veil', tx: 22.5, ty: 2.8 }]
        };
    }
    return { c3_dawn: dawn(), c3_elder: elder(), c3_ashen: ashen(), c3_keep: keep(), c3_frost: frost(), c3_veil: veil(), c3_citadel: citadel() };
})();
