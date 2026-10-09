/* Hollowmere, Chapter 2: the four areas of Larkspur Bay, built from a few drawing steps
 * (fill, rect, scatter...). Letters are listed in chapters/ch2/art.js. Coordinates are in tiles. */
window.HM_C2_MAPS = (function () {
    'use strict';
    function grid(w, h, c) { const g = []; for (let y = 0; y < h; y++) g.push(new Array(w).fill(c)); return g; }
    function rect(g, x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] !== undefined) g[y][x] = c; }
    function box(g, x0, y0, x1, y1, c) { rect(g, x0, y0, x1, y0, c); rect(g, x0, y1, x1, y1, c); rect(g, x0, y0, x0, y1, c); rect(g, x1, y0, x1, y1, c); }
    function put(g, list, c) { for (let i = 0; i < list.length; i += 2) g[list[i + 1]][list[i]] = c; }
    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    // sprinkle c over the free tiles 'on' of an area
    function scatter(g, x0, y0, x1, y1, c, chance, seed, on) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] === (on || '.') && hash(x, y, seed) < chance) g[y][x] = c; }
    const rows = g => g.map(r => r.join(''));

    /* ---------------- Larkspur: the harbour town (no foes) ---------------- */
    function bay() {
        const g = grid(44, 30, '.');
        rect(g, 0, 0, 43, 1, '^'); rect(g, 0, 0, 0, 21, '^'); rect(g, 43, 0, 43, 21, '^');
        rect(g, 21, 0, 23, 0, '='); rect(g, 21, 1, 23, 1, 'g'); rect(g, 19, 1, 20, 1, '#'); rect(g, 24, 1, 25, 1, '#');
        rect(g, 21, 2, 23, 8, '=');                                   // the north road to the gate
        rect(g, 15, 8, 29, 14, 'x');                                  // the square
        rect(g, 1, 12, 14, 13, '='); rect(g, 30, 12, 43, 13, '=');    // west and east roads (east: to the fields)
        rect(g, 20, 15, 23, 18, '=');                                 // down to the harbour
        rect(g, 1, 19, 42, 21, 'x');                                  // the quay
        rect(g, 0, 22, 43, 29, '~');                                  // the sea
        rect(g, 20, 22, 23, 26, 'w'); rect(g, 33, 22, 35, 24, 'w');   // docks
        rect(g, 4, 22, 6, 25, 'w'); rect(g, 4, 26, 6, 28, 'v'); rect(g, 4, 29, 6, 29, 'D');   // the old pier and the tide steps
        rect(g, 10, 25, 14, 28, '^');                                 // the lighthouse rock
        rect(g, 2, 2, 4, 8, '.'); scatter(g, 1, 2, 14, 11, 'T', 0.07, 3); scatter(g, 30, 2, 42, 11, 'T', 0.07, 5);
        scatter(g, 1, 14, 19, 18, 'F', 0.12, 7); scatter(g, 24, 14, 42, 18, 'F', 0.12, 9); scatter(g, 1, 2, 42, 11, 'F', 0.06, 11);
        rect(g, 2, 2, 14, 6, '.'); rect(g, 28, 2, 41, 6, '.'); rect(g, 31, 8, 33, 10, '.');     // keep house plots clear
        put(g, [1, 2, 2, 2, 41, 2, 42, 2, 1, 3, 42, 3, 1, 16, 42, 16], 'T');
        put(g, [15, 8, 29, 8, 15, 14, 29, 14, 19, 19, 24, 19, 8, 19, 36, 19], 'L');
        put(g, [25, 20, 26, 20, 31, 21, 38, 21], 'b'); put(g, [32, 21, 39, 21, 13, 21], 'h');
        put(g, [8, 7, 9, 7, 35, 7, 15, 18], 'p'); put(g, [42, 20], 'C');
        rect(g, 16, 16, 18, 16, 'f');
        return {
            ground: 'bay', art: 1, music: 'c2_bay', atmo: 'spray', spawn: [21.5, 23.6], tier: 3,
            rows: rows(g), npcs: [
                { id: 'odile', x: 22.5, y: 21.4 }, { id: 'mirelle', x: 8.5, y: 20.8 }, { id: 'gus', x: 5.5, y: 18.6 }, { id: 'juna', x: 12, y: 18.6 },
                { id: 'bo', x: 34.5, y: 23.6 }, { id: 'nell', x: 18.5, y: 15.4, roam: 2 }, { id: 'tuck', x: 38.5, y: 6.8 }, { id: 'pell', x: 25.5, y: 11.6, roam: 1 },
                { id: 'marta', x: 19.5, y: 2.9 }, { id: 'sela2', x: 23.5, y: 24.7 }, { id: 'folk1', x: 8, y: 14, roam: 4 }, { id: 'folk2', x: 36, y: 14, roam: 4 },
                { id: 'finnHome', x: 17.5, y: 17.4 }
            ],
            props: [
                { k: 'house', x: 3, y: 3, w: 5, h: 3, roof: 'blue' }, { k: 'house', x: 10, y: 3, w: 4, h: 3, roof: 'red' },
                { k: 'house', x: 29, y: 3, w: 5, h: 3, roof: 'green' }, { k: 'house', x: 36, y: 3, w: 5, h: 3, roof: 'brown', kind: 'inn' },
                { k: 'house', x: 2, y: 15, w: 6, h: 3, roof: 'slate', kind: 'smith' }, { k: 'house', x: 10, y: 15, w: 4, h: 3, roof: 'green', kind: 'shop' },
                { k: 'house', x: 30, y: 15, w: 4, h: 3, roof: 'red' }, { k: 'house', x: 36, y: 15, w: 5, h: 3, roof: 'blue' },
                { k: 'fountain', x: 21, y: 10, w: 2, h: 2 }, { k: 'stall', x: 16, y: 9, w: 2, h: 1 }, { k: 'stall', x: 27, y: 9, w: 2, h: 1 },
                { k: 'pedestal', x: 26, y: 19, w: 2, h: 1 }, { k: 'bell', x: 7, y: 19, w: 1, h: 1 }, { k: 'well', x: 32, y: 9, w: 1, h: 1 },
                { k: 'lighthouse', x: 11, y: 26, w: 2, h: 2 }, { k: 'boat', x: 24, y: 24, w: 2, h: 1 }, { k: 'boat', x: 36, y: 25, w: 2, h: 1 }
            ],
            foes: [],
            exits: [{ x: 43, y: 12, w: 1, h: 2, to: 'c2_fields', tx: 3.5, ty: 12.5 }, { x: 21, y: 0, w: 3, h: 1, to: 'c2_ridge', tx: 20.5, ty: 36.4 },
                    { x: 4, y: 29, w: 3, h: 1, to: 'c2_light', tx: 20.5, ty: 26.4 }]
        };
    }

    /* ---------------- the Sunpetal Fields: a farm, a river, a beach, a raider camp and their fort ---------------- */
    function fields() {
        const g = grid(50, 34, '.');
        rect(g, 0, 0, 49, 0, '^'); rect(g, 0, 0, 0, 33, '^'); rect(g, 49, 0, 49, 33, '^');
        rect(g, 0, 12, 0, 13, 'd');                                   // the way back to town
        rect(g, 1, 12, 46, 13, 'd');                                  // the farm road
        rect(g, 22, 1, 23, 29, '~'); rect(g, 22, 12, 23, 13, 'w');    // the river and its bridge
        rect(g, 1, 27, 48, 29, 's'); rect(g, 22, 27, 23, 29, '~'); rect(g, 1, 30, 48, 33, '~');   // beach and sea
        // the farm: sunflower rows inside a fence
        box(g, 2, 15, 19, 25, 'f'); rect(g, 10, 15, 11, 15, '.'); rect(g, 10, 25, 11, 25, '.');
        for (let y = 17; y <= 23; y += 2) { rect(g, 4, y, 8, y, 'k'); rect(g, 13, y, 17, y, 'k'); }
        // the raider camp and the fort (palisade) with an opening at the bottom
        rect(g, 27, 14, 42, 23, 'd');
        box(g, 30, 1, 46, 10, '#'); rect(g, 31, 2, 45, 9, 'd'); rect(g, 37, 10, 39, 10, 'd'); rect(g, 37, 11, 39, 11, 'd');
        put(g, [31, 2, 45, 2, 31, 9, 45, 9], 'L');
        put(g, [28, 16, 41, 16, 29, 22, 40, 22, 33, 21, 36, 15], 'h'); put(g, [27, 18, 42, 19, 34, 23], 'b'); put(g, [28, 21, 41, 21, 26, 15], 'p');
        put(g, [44, 23], 'C'); put(g, [32, 3], 'C');
        // nature
        scatter(g, 1, 1, 21, 10, 'T', 0.08, 13); scatter(g, 24, 14, 26, 26, 'T', 0.15, 15); scatter(g, 43, 14, 48, 26, 'T', 0.12, 17);
        scatter(g, 1, 1, 29, 26, 'F', 0.07, 19); scatter(g, 1, 27, 48, 29, 'r', 0.04, 21, 's'); scatter(g, 24, 2, 29, 10, 'r', 0.05, 23);
        rect(g, 1, 11, 21, 11, '.'); rect(g, 1, 14, 21, 14, '.');
        rect(g, 5, 4, 11, 8, '.'); rect(g, 12, 3, 16, 7, '.'); rect(g, 3, 8, 5, 10, '.'); rect(g, 43, 24, 46, 26, '.');   // house, mill, well, Finn's hiding place
        return {
            ground: 'fields', art: 1, music: 'c2_fields', atmo: 'pollen', spawn: [3.5, 12.5], tier: 3,
            rows: rows(g),
            npcs: [{ id: 'ada', x: 8.5, y: 9.4 }, { id: 'finn', x: 44.5, y: 25.2 }],
            props: [{ k: 'house', x: 6, y: 5, w: 5, h: 3, roof: 'red' }, { k: 'windmill', x: 13, y: 4, w: 3, h: 3 }, { k: 'well', x: 4, y: 9, w: 1, h: 1 },
                    { k: 'tent', x: 29, y: 17, w: 3, h: 2 }, { k: 'tent', x: 37, y: 17, w: 3, h: 2 }, { k: 'tent', x: 33, y: 14, w: 3, h: 2 }, { k: 'fire', x: 34, y: 19, w: 1, h: 1 },
                    { k: 'tent', x: 33, y: 3, w: 3, h: 2 }, { k: 'tent', x: 41, y: 3, w: 3, h: 2 }],
            foes: [{ t: 'boar', x: 6, y: 3 }, { t: 'boar', x: 15, y: 9 }, { t: 'boar', x: 3, y: 10 }, { t: 'boar', x: 26, y: 5 }, { t: 'boar', x: 12, y: 27 },
                   { t: 'crab', x: 28, y: 28 }, { t: 'crab', x: 33, y: 28 }, { t: 'crab', x: 39, y: 27 }, { t: 'crab', x: 44, y: 28 }, { t: 'crab', x: 18, y: 28 },
                   { t: 'raider', x: 30, y: 20 }, { t: 'raider', x: 38, y: 21 }, { t: 'raider', x: 35, y: 16 }, { t: 'archer', x: 32, y: 15 }, { t: 'archer', x: 40, y: 15 },
                   { t: 'archer', x: 31, y: 23 }, { t: 'raider', x: 35, y: 8 }, { t: 'archer', x: 42, y: 7 }],
            boss: { t: 'rook', x: 38, y: 5.5, flag: 'c2rook' }, arena: [38, 5.5],
            exits: [{ x: 0, y: 12, w: 1, h: 2, to: 'c2_bay', tx: 40.5, ty: 12.5 }]
        };
    }

    /* ---------------- Cinder Ridge: ash, lava streams and the Cinder Witch at the top ---------------- */
    function ridge() {
        const g = grid(40, 40, 'a');
        rect(g, 0, 0, 39, 0, '^'); rect(g, 0, 0, 0, 39, '^'); rect(g, 39, 0, 39, 39, '^'); rect(g, 0, 39, 39, 39, '^'); rect(g, 19, 39, 21, 39, 'd');
        rect(g, 1, 31, 38, 32, 'l'); rect(g, 8, 31, 10, 32, 'x');     // lava streams with stone crossings
        rect(g, 1, 21, 38, 22, 'l'); rect(g, 28, 21, 30, 22, 'x');
        rect(g, 1, 12, 38, 13, 'l'); rect(g, 14, 12, 16, 13, 'x');
        rect(g, 19, 33, 21, 38, 'd'); rect(g, 9, 33, 20, 34, 'd'); rect(g, 9, 23, 10, 30, 'd'); rect(g, 9, 23, 29, 24, 'd');
        rect(g, 29, 14, 30, 20, 'd'); rect(g, 15, 14, 30, 15, 'd'); rect(g, 15, 9, 16, 11, 'd');
        rect(g, 8, 1, 32, 9, 'x'); box(g, 7, 0, 33, 10, '^'); rect(g, 14, 10, 17, 10, 'x');   // the summit circle
        put(g, [8, 1, 32, 1, 8, 9, 32, 9], '^'); put(g, [10, 2, 30, 2, 10, 8, 30, 8], 'L');
        scatter(g, 1, 14, 38, 30, '^', 0.06, 31, 'a'); scatter(g, 1, 33, 38, 38, '^', 0.06, 33, 'a'); scatter(g, 1, 1, 6, 11, '^', 0.2, 35, 'a'); scatter(g, 34, 1, 38, 11, '^', 0.2, 37, 'a');
        scatter(g, 1, 14, 38, 38, 'P', 0.05, 39, 'a'); scatter(g, 1, 14, 38, 38, 'r', 0.04, 41, 'a');
        put(g, [3, 35, 36, 27, 4, 16], 'C'); put(g, [12, 36, 26, 25, 33, 17], 'p');
        return {
            ground: 'ridge', art: 1, music: 'c2_ridge', atmo: 'embers', spawn: [20.5, 36.4], tier: 4,
            rows: rows(g), npcs: [], props: [],
            foes: [{ t: 'imp', x: 14, y: 36 }, { t: 'imp', x: 28, y: 35 }, { t: 'raider', x: 6, y: 28 }, { t: 'gunner', x: 20, y: 26 }, { t: 'imp', x: 33, y: 26 },
                   { t: 'hexer', x: 12, y: 18 }, { t: 'gunner', x: 25, y: 17 }, { t: 'imp', x: 35, y: 16 }, { t: 'hexer', x: 22, y: 19 }, { t: 'raider', x: 5, y: 17 },
                   { t: 'gunner', x: 9, y: 14 }, { t: 'hexer', x: 30, y: 28 }],
            boss: { t: 'witch', x: 20, y: 4.5, flag: 'c2witch' }, arena: [20, 4.5], pts: [[13, 4], [27, 4], [20, 2.6], [20, 7.2]],
            exits: [{ x: 19, y: 39, w: 3, h: 1, to: 'c2_bay', tx: 22, ty: 2.8 }]
        };
    }

    /* ---------------- the Sunken Lighthouse: dark halls under the sea ---------------- */
    function light() {
        const g = grid(40, 30, '#');
        rect(g, 14, 21, 26, 28, 'x'); rect(g, 19, 29, 21, 29, 'D');                // entry hall (way out at the bottom)
        rect(g, 19, 13, 21, 20, 'x');                                              // corridor north
        rect(g, 3, 15, 12, 25, 'x'); rect(g, 13, 22, 13, 23, 'x');                 // west room
        rect(g, 28, 15, 37, 25, 'x'); rect(g, 27, 22, 27, 23, 'x');                // east room
        rect(g, 6, 2, 33, 12, 'x');                                                // the great hall
        rect(g, 5, 17, 7, 19, '~'); rect(g, 33, 21, 35, 23, '~'); rect(g, 9, 9, 11, 10, '~'); rect(g, 28, 9, 30, 10, '~');
        put(g, [4, 24, 11, 16, 29, 16, 36, 24, 7, 3, 32, 3, 15, 27, 25, 27], 'c');
        put(g, [15, 22, 25, 22, 8, 5, 31, 5], 'L');
        put(g, [4, 16, 36, 16], 'C'); put(g, [10, 24, 30, 24, 16, 27, 24, 27, 4, 20], 'p');
        return {
            ground: 'light', art: 1, music: 'c2_light', dark: true, atmo: 'motes', spawn: [20.5, 26.4], tier: 4,
            rows: rows(g), npcs: [], props: [],
            foes: [{ t: 'bones', x: 8, y: 20 }, { t: 'bones', x: 32, y: 18 }, { t: 'crab', x: 6, y: 23 }, { t: 'crab', x: 34, y: 24 }, { t: 'crab', x: 17, y: 24 },
                   { t: 'hexer', x: 10, y: 17 }, { t: 'hexer', x: 30, y: 20 }, { t: 'archer', x: 20, y: 15 }, { t: 'bones', x: 23, y: 25 }, { t: 'hexer', x: 20, y: 11 }],
            boss: { t: 'choir', x: 20, y: 6.5, flag: 'c2choir' }, arena: [20, 6.5],
            exits: [{ x: 19, y: 29, w: 3, h: 1, to: 'c2_bay', tx: 5.5, ty: 21.2 }]
        };
    }
    return { c2_bay: bay(), c2_fields: fields(), c2_ridge: ridge(), c2_light: light() };
})();
