/* Hollowmere, Chapter 4: A Song of Ice & Fire.
 * Seven playable areas across Westeros and Essos:
 * 1. c4_river  — The Riverlands & Riverrun War Camp
 * 2. c4_kings  — King's Landing & Blackwater Bay
 * 3. c4_storm  — Storm's End & Dragonstone
 * 4. c4_north  — Winterfell, Wolfswood & The Godswood
 * 5. c4_essos  — Braavos, Canals & Valyrian Ruins
 * 6. c4_wall   — Castle Black & The Wall
 * 7. c4_beyond — Beyond the Wall, Hardhome & Heart of Winter */
window.HM_C4_MAPS = (function () {
    'use strict';
    function grid(w, h, c) { const g = []; for (let y = 0; y < h; y++) g.push(new Array(w).fill(c)); return g; }
    function rect(g, x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] !== undefined) g[y][x] = c; }
    function box(g, x0, y0, x1, y1, c) { rect(g, x0, y0, x1, y0, c); rect(g, x0, y1, x1, y1, c); rect(g, x0, y0, x0, y1, c); rect(g, x1, y0, x1, y1, c); }
    function put(g, list, c) { for (let i = 0; i < list.length; i += 2) if (g[list[i + 1]]) g[list[i + 1]][list[i]] = c; }
    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    function scatter(g, x0, y0, x1, y1, c, chance, seed, on) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] === (on || '.') && hash(x, y, seed) < chance) g[y][x] = c; }
    function clear(g, props, c) { for (const p of props) rect(g, p.x - 1, p.y - 1, p.x + (p.w || 1), p.y + (p.h || 1) + 1, c || '.'); }
    function unblock(g, pts) { for (const q of pts) for (let y = Math.floor(q[1]) - 1; y <= Math.floor(q[1]) + 1; y++) for (let x = Math.floor(q[0]) - 1; x <= Math.floor(q[0]) + 1; x++) if (g[y] && 'TkPrFB'.indexOf(g[y][x]) >= 0) g[y][x] = q[2] || '.'; }
    const rows = g => g.map(r => r.join(''));

    /* ---------------- 1. The Riverlands & Riverrun War Camp ---------------- */
    function river() {
        const g = grid(46, 32, '.');
        box(g, 0, 0, 45, 31, '^');
        rect(g, 1, 1, 44, 1, '#');                                     // northern palisade toward Winterfell
        rect(g, 21, 0, 22, 0, '='); rect(g, 21, 1, 22, 1, 'q');        // north gate (q -> open.north)
        rect(g, 21, 2, 22, 30, '=');                                   // the Kingsroad
        rect(g, 21, 30, 22, 30, 'g'); rect(g, 21, 31, 22, 31, '=');    // south gate to King's Landing (g -> open.south)
        rect(g, 1, 14, 44, 15, '='); rect(g, 45, 14, 45, 15, '=');     // River Road east to the Narrow Sea port
        rect(g, 15, 8, 29, 19, 'x');                                   // Riverrun central war camp square
        rect(g, 1, 26, 18, 30, '~'); rect(g, 25, 26, 44, 30, '~');     // the Red Fork & Trident river
        rect(g, 20, 25, 24, 29, 'w');                                  // the Trident bridge & dock
        const props = [
            { k: 'house', x: 3, y: 3, w: 5, h: 3, roof: 'slate', b: 0 },
            { k: 'house', x: 34, y: 3, w: 5, h: 3, roof: 'red', b: 1 },
            { k: 'house', x: 2, y: 16, w: 6, h: 3, roof: 'slate', kind: 'smith', b: 0 },
            { k: 'house', x: 31, y: 16, w: 5, h: 3, roof: 'green', kind: 'shop', b: 1 },
            { k: 'tent', x: 16, y: 9, w: 3, h: 2, c: 'stark' },
            { k: 'tent', x: 26, y: 9, w: 3, h: 2, c: 'stark' },
            { k: 'ruin', x: 9, y: 8, w: 4, h: 3 },                     // burned village 1 (spot [10.5, 11.5])
            { k: 'ruin', x: 37, y: 7, w: 4, h: 3 },                    // Harrenhal outpost (spot [38.5, 10.5])
            { k: 'wagon', x: 13, y: 21, w: 2, h: 1 },                  // burned mill wagon (spot [14.5, 22.5])
            { k: 'beacon', x: 14, y: 7, w: 1, h: 1, n: 1 }, { k: 'beacon', x: 30, y: 7, w: 1, h: 1, n: 2 },
            { k: 'beacon', x: 14, y: 20, w: 1, h: 1, n: 3 }, { k: 'beacon', x: 30, y: 20, w: 1, h: 1, n: 4 },
            { k: 'pyre', x: 24, y: 8, w: 2, h: 2 },
            { k: 'well', x: 17, y: 16, w: 1, h: 1 },
            { k: 'boat', x: 25, y: 27, w: 2, h: 1 },
            { k: 'banner', x: 19, y: 2, w: 1, h: 1, c: 'stark' }, { k: 'banner', x: 24, y: 2, w: 1, h: 1, c: 'stark' }
        ];
        scatter(g, 1, 2, 44, 24, 'T', 0.05, 3); scatter(g, 1, 2, 44, 24, 'F', 0.05, 5); scatter(g, 1, 2, 44, 24, 'k', 0.03, 7);
        clear(g, props.filter(p => p.k !== 'boat'));
        rect(g, 15, 8, 29, 19, 'x'); rect(g, 21, 2, 22, 29, '='); rect(g, 21, 30, 22, 30, 'g');
        rect(g, 1, 14, 44, 15, '='); rect(g, 20, 25, 24, 29, 'w');
        unblock(g, [[22.5, 16.6, 'x'], [19.5, 12.6, 'x'], [26.5, 12.6, 'x'], [10.5, 11.5, '.'], [38.5, 10.5, '.'], [14.5, 22.5, '.'], [23.5, 25.8, 'w']]);
        put(g, [8, 7, 35, 7, 7, 23, 41, 12], 'p'); put(g, [42, 2, 2, 12], 'C'); put(g, [18, 8, 25, 8, 18, 19, 25, 19], 'L');
        return {
            ground: 'dawn', art: 1, music: 'c4_river', atmo: 'leaves', spawn: [22.5, 25.5], tier: 5,
            rows: rows(g), props,
            npcs: [
                { id: 'robb', x: 22.5, y: 16.6 }, { id: 'catelyn', x: 19.5, y: 12.6 }, { id: 'sansa', x: 26.5, y: 12.6 },
                { id: 'gendry', x: 5.5, y: 19.7 }, { id: 'qyburn', x: 33.5, y: 19.7 }, { id: 'jaime', x: 28.5, y: 16.6 },
                { id: 'salladhor', x: 23.5, y: 25.8 }, { id: 'folk1', x: 11.5, y: 14.6, roam: 3 }
            ],
            foes: [
                { t: 'raider', x: 36, y: 11 }, { t: 'raider', x: 40, y: 12 }, { t: 'archer', x: 42, y: 10 },
                { t: 'raider', x: 38, y: 21 }, { t: 'archer', x: 41, y: 22 }, { t: 'raider', x: 9, y: 22 }, { t: 'archer', x: 6, y: 21 }
            ],
            exits: [
                { x: 21, y: 31, w: 2, h: 1, to: 'c4_kings', tx: 22.5, ty: 2.5 },
                { x: 21, y: 0, w: 2, h: 1, to: 'c4_north', tx: 23.5, ty: 36.5 },
                { x: 45, y: 14, w: 1, h: 2, to: 'c4_essos', tx: 2.5, ty: 14.5 }
            ]
        };
    }

    /* ---------------- 2. King's Landing & Blackwater Bay ---------------- */
    function kings() {
        const g = grid(48, 34, '.');
        box(g, 0, 0, 47, 33, '^');
        rect(g, 21, 0, 23, 0, '='); rect(g, 21, 1, 23, 26, '=');       // Kingsroad down to the Blackwater Mudgate
        rect(g, 13, 6, 31, 16, 'x');                                   // Red Keep courtyard
        rect(g, 1, 17, 46, 18, '='); rect(g, 46, 17, 46, 18, 'g'); rect(g, 47, 17, 47, 18, '='); // east gate to Stormlands
        rect(g, 3, 14, 11, 25, 'd'); rect(g, 33, 14, 44, 25, 'd');     // Flea Bottom & Alchemists' alleys
        rect(g, 1, 27, 46, 27, 'x');                                   // Blackwater quay
        rect(g, 1, 28, 46, 32, '~');                                   // Blackwater Bay (Wildfire-lit waters)
        const props = [
            { k: 'house', x: 14, y: 2, w: 5, h: 3, roof: 'red' },
            { k: 'house', x: 25, y: 2, w: 5, h: 3, roof: 'red' },
            { k: 'house', x: 4, y: 11, w: 5, h: 3, roof: 'brown' },
            { k: 'house', x: 35, y: 11, w: 5, h: 3, roof: 'brown' },
            { k: 'throne', x: 21, y: 6, w: 3, h: 1, c: 'iron' },
            { k: 'banner', x: 15, y: 7, w: 1, h: 1, c: 'lannister' },
            { k: 'banner', x: 29, y: 7, w: 1, h: 1, c: 'lannister' },
            { k: 'lore', x: 42, y: 6, w: 1, h: 1, n: 0 }
        ];
        scatter(g, 1, 1, 45, 26, 'T', 0.04, 11); scatter(g, 1, 1, 45, 26, 'F', 0.06, 13);
        clear(g, props, 'x');
        rect(g, 13, 6, 31, 16, 'x'); rect(g, 21, 0, 23, 26, '='); rect(g, 1, 17, 45, 18, '='); rect(g, 46, 17, 46, 18, 'g');
        unblock(g, [[22.5, 14.6, 'x'], [17.5, 11.6, 'x'], [8, 18, 'd'], [38, 18, 'd'], [14, 26, 'x'], [42, 6, '.']]);
        put(g, [14, 8, 30, 8, 14, 15, 30, 15, 20, 26, 24, 26], 'L');
        put(g, [4, 24, 43, 24, 32, 3], 'C'); put(g, [10, 20, 36, 20, 18, 25], 'p');
        return {
            ground: 'dawn', art: 1, music: 'c4_kings', atmo: 'embers', spawn: [22.5, 2.5], tier: 5,
            rows: rows(g), props,
            npcs: [{ id: 'tyrion', x: 22.5, y: 14.6 }, { id: 'varys', x: 17.5, y: 11.6 }],
            foes: [
                { t: 'raider', x: 6, y: 20 }, { t: 'raider', x: 9, y: 23 }, { t: 'archer', x: 5, y: 16 },
                { t: 'raider', x: 37, y: 21 }, { t: 'archer', x: 41, y: 19 }, { t: 'raider', x: 39, y: 24 },
                { t: 'kraken', x: 12, y: 27 }, { t: 'kraken', x: 34, y: 27 }
            ],
            exits: [
                { x: 21, y: 0, w: 3, h: 1, to: 'c4_river', tx: 21.5, ty: 28.5 },
                { x: 47, y: 17, w: 1, h: 2, to: 'c4_storm', tx: 3.5, ty: 17.5 }
            ]
        };
    }

    /* ---------------- 3. Storm's End & Dragonstone ---------------- */
    function storm() {
        const g = grid(50, 34, 'a');
        box(g, 0, 0, 49, 33, '^');
        rect(g, 0, 17, 0, 18, 'd'); rect(g, 1, 17, 44, 18, 'd');       // coastal road
        rect(g, 23, 10, 26, 24, 'd');                                  // Dragonstone causeway
        rect(g, 16, 1, 33, 10, 'x'); box(g, 15, 0, 34, 10, '#'); rect(g, 23, 10, 26, 10, 'x'); // Painted Hall of Dragonstone
        rect(g, 1, 27, 48, 32, '~');                                   // Shipbreaker Bay
        const props = [
            { k: 'throne', x: 23, y: 2, w: 3, h: 1, c: 'void' },
            { k: 'ward', x: 16, y: 12, w: 1, h: 1, n: 0 },
            { k: 'ward', x: 32, y: 12, w: 1, h: 1, n: 1 },
            { k: 'ward', x: 24, y: 20, w: 1, h: 1, n: 2 },
            { k: 'tent', x: 9, y: 20, w: 3, h: 2, c: 'baratheon' },
            { k: 'fire', x: 13, y: 22, w: 1, h: 1 },
            { k: 'banner', x: 18, y: 9, w: 1, h: 1, c: 'baratheon' },
            { k: 'banner', x: 30, y: 9, w: 1, h: 1, c: 'baratheon' }
        ];
        scatter(g, 1, 11, 48, 26, 'P', 0.05, 21, 'a'); scatter(g, 1, 11, 48, 26, 'r', 0.04, 23, 'a');
        clear(g, props.filter(p => p.k !== 'ward'), 'a');
        rect(g, 16, 1, 33, 10, 'x'); rect(g, 1, 17, 44, 18, 'd'); rect(g, 23, 10, 26, 24, 'd');
        for (const p of props) if (p.k === 'ward') g[p.y][p.x] = ',';
        unblock(g, [[12.5, 22.6, 'a'], [15.5, 22.6, 'a'], [24.5, 14.6, 'd'], [16, 12.8, 'a'], [32, 12.8, 'a'], [24, 20.8, 'd']]);
        put(g, [17, 2, 32, 2, 17, 8, 32, 8], 'L');
        put(g, [3, 12, 46, 12, 45, 24], 'C'); put(g, [19, 22, 35, 22, 40, 14], 'p');
        return {
            ground: 'ashen', art: 1, music: 'c4_storm', atmo: 'ash', spawn: [3.5, 17.5], tier: 5,
            rows: rows(g), props,
            npcs: [{ id: 'davos', x: 12.5, y: 22.6 }, { id: 'brienne', x: 15.5, y: 22.6 }, { id: 'melisandre', x: 24.5, y: 14.6 }],
            foes: [
                { t: 'raider', x: 18, y: 15 }, { t: 'archer', x: 30, y: 15 }, { t: 'shadow', x: 36, y: 14 },
                { t: 'unicorn', x: 40, y: 21 }, { t: 'unicorn', x: 8, y: 13 },
                { t: 'kraken', x: 18, y: 26 }, { t: 'kraken', x: 32, y: 26 }, { t: 'kraken', x: 42, y: 26 }
            ],
            boss: { t: 'shadow', x: 25, y: 6.5, flag: 'c4shadow' }, arena: [25, 6.5],
            exits: [{ x: 0, y: 17, w: 1, h: 2, to: 'c4_kings', tx: 44.5, ty: 17.5 }]
        };
    }

    /* ---------------- 4. Winterfell & The North ---------------- */
    function north() {
        const g = grid(48, 40, '.');
        box(g, 0, 0, 47, 39, '^');
        rect(g, 23, 39, 24, 39, '='); rect(g, 23, 12, 24, 38, '=');    // Kingsroad north through Winterfell
        rect(g, 23, 0, 24, 1, 'q');                                    // gate to Castle Black & The Wall (open.wall)
        rect(g, 15, 22, 32, 31, 'x');                                  // Winterfell Great Courtyard
        rect(g, 17, 3, 31, 11, 'x');                                   // The Godswood of Winterfell
        rect(g, 6, 23, 14, 25, '='); rect(g, 33, 23, 42, 25, '=');     // Wolfswood trails
        const props = [
            { k: 'shrine', x: 23, y: 6, w: 3, h: 1 },                  // Ancient Weirwood Heart Tree (spot [24, 9.6])
            { k: 'house', x: 16, y: 18, w: 5, h: 3, roof: 'slate' },
            { k: 'house', x: 27, y: 18, w: 5, h: 3, roof: 'slate' },
            { k: 'tent', x: 16, y: 28, w: 3, h: 2, c: 'snow' },
            { k: 'fire', x: 20, y: 28, w: 1, h: 1 },
            { k: 'banner', x: 21, y: 22, w: 1, h: 1, c: 'stark' },
            { k: 'banner', x: 26, y: 22, w: 1, h: 1, c: 'stark' },
            { k: 'lore', x: 43, y: 33, w: 1, h: 1, n: 1 }
        ];
        scatter(g, 1, 12, 46, 38, 'P', 0.09, 31); scatter(g, 1, 12, 46, 38, 'r', 0.03, 35);
        clear(g, props, '.');
        rect(g, 15, 22, 32, 31, 'x'); rect(g, 17, 3, 31, 11, 'x'); rect(g, 23, 12, 24, 38, '=');
        rect(g, 6, 23, 14, 25, '='); rect(g, 33, 23, 42, 25, '='); rect(g, 23, 0, 24, 1, 'q');
        unblock(g, [[20.5, 26.6, 'x'], [9.5, 24.6, '='], [39.5, 22.6, '.'], [14.5, 14.6, '.'], [24, 9.6, 'x'], [43, 33, '.']]);
        put(g, [18, 4, 30, 4, 18, 10, 30, 10], 'R');
        put(g, [3, 14, 44, 14, 4, 35], 'C'); put(g, [18, 25, 29, 25, 12, 18], 'p');
        return {
            ground: 'frost', art: 1, music: 'c4_north', atmo: 'snow', spawn: [23.5, 36.5], tier: 5,
            rows: rows(g), props,
            npcs: [
                { id: 'arya', x: 20.5, y: 26.6 },
                { id: 'scout1', x: 9.5, y: 24.6 }, { id: 'scout2', x: 39.5, y: 22.6 }, { id: 'scout3', x: 14.5, y: 14.6 }
            ],
            foes: [
                { t: 'direwolf', x: 8, y: 18 }, { t: 'direwolf', x: 12, y: 33 }, { t: 'direwolf', x: 37, y: 16 },
                { t: 'direwolf', x: 41, y: 28 }, { t: 'direwolf', x: 35, y: 34 }, { t: 'direwolf', x: 10, y: 13 },
                { t: 'wight', x: 6, y: 29 }, { t: 'wight', x: 42, y: 18 }, { t: 'unicorn', x: 36, y: 13 }, { t: 'giant', x: 9, y: 34 }
            ],
            exits: [
                { x: 23, y: 39, w: 2, h: 1, to: 'c4_river', tx: 21.5, ty: 2.6 },
                { x: 23, y: 0, w: 2, h: 1, to: 'c4_wall', tx: 23.5, ty: 34.5 }
            ]
        };
    }

    /* ---------------- 5. Braavos & Free Cities of Essos ---------------- */
    function essos() {
        const g = grid(48, 36, '.');
        box(g, 0, 0, 47, 35, '^');
        rect(g, 0, 14, 0, 15, '='); rect(g, 1, 14, 46, 15, '=');       // Grand Canal promenade
        rect(g, 14, 11, 33, 18, 'x');                                  // Plaza of the Iron Bank & House of Black and White
        rect(g, 2, 20, 45, 24, '~');                                   // Braavosi Grand Lagoon & Canal
        rect(g, 10, 20, 12, 24, 'w'); rect(g, 22, 20, 25, 24, 'w'); rect(g, 35, 20, 37, 24, 'w'); // stone bridges
        rect(g, 22, 10, 25, 30, '='); rect(g, 22, 20, 25, 24, 'w');
        rect(g, 16, 1, 32, 10, 'x'); box(g, 15, 0, 33, 10, '#'); rect(g, 22, 10, 25, 10, 'x');    // Valyrian Sanctum courtyard
        const props = [
            { k: 'house', x: 4, y: 9, w: 5, h: 3, roof: 'slate' },     // House of Black and White
            { k: 'house', x: 35, y: 9, w: 6, h: 3, roof: 'blue' },     // Iron Bank of Braavos
            { k: 'boat', x: 25, y: 21, w: 2, h: 1 },
            { k: 'banner', x: 18, y: 11, w: 1, h: 1, c: 'targaryen' },
            { k: 'banner', x: 29, y: 11, w: 1, h: 1, c: 'targaryen' },
            { k: 'lore', x: 42, y: 26, w: 1, h: 1, n: 2 }
        ];
        scatter(g, 1, 25, 40, 34, 'F', 0.06, 41); scatter(g, 1, 25, 40, 34, 'r', 0.04, 43);
        clear(g, props.filter(p => p.k !== 'boat'), 'x');
        rect(g, 14, 11, 33, 18, 'x'); rect(g, 16, 1, 32, 10, 'x');
        rect(g, 2, 20, 45, 24, '~'); rect(g, 10, 20, 12, 24, 'w'); rect(g, 22, 20, 25, 24, 'w'); rect(g, 35, 20, 37, 24, 'w');
        unblock(g, [[22.5, 14.6, 'x'], [26.5, 14.6, 'x'], [12.5, 14.6, '='], [33.5, 14.6, '='], [42, 26, '.']]);
        put(g, [15, 12, 32, 12, 17, 2, 31, 2, 21, 25, 26, 25], 'L');
        put(g, [3, 27, 38, 28, 17, 3], 'C'); put(g, [14, 26, 30, 26, 8, 17], 'p');
        return {
            ground: 'elder', art: 1, music: 'c4_essos', atmo: 'fireflies', spawn: [22.5, 28.5], tier: 5,
            rows: rows(g), props,
            npcs: [
                { id: 'daenerys', x: 22.5, y: 14.6 }, { id: 'jorah', x: 26.5, y: 14.6 },
                { id: 'jaqen', x: 12.5, y: 14.6 }, { id: 'folk2', x: 33.5, y: 14.6 }
            ],
            foes: [
                { t: 'kraken', x: 14, y: 22 }, { t: 'kraken', x: 20, y: 22 }, { t: 'kraken', x: 31, y: 22 },
                { t: 'firewyrm', x: 8, y: 28 }, { t: 'firewyrm', x: 18, y: 30 }, { t: 'firewyrm', x: 30, y: 29 },
                { t: 'firewyrm', x: 38, y: 17 }, { t: 'shadow', x: 6, y: 17 }
            ],
            boss: { t: 'elderwyrm', x: 24, y: 5.5, flag: 'c4wyrm' }, arena: [24, 5.5],
            exits: [{ x: 0, y: 14, w: 1, h: 2, to: 'c4_river', tx: 42.5, ty: 14.5 }]
        };
    }

    /* ---------------- 6. The Wall & Castle Black ---------------- */
    function wall() {
        const g = grid(48, 38, '.');
        box(g, 0, 0, 47, 37, '^');
        rect(g, 1, 1, 46, 7, '#');                                     // The 700-foot Ice Wall across the entire northern border
        rect(g, 22, 0, 25, 8, 'x'); rect(g, 22, 1, 25, 1, 'g');        // The Tunnel through The Wall (g -> open.beyond)
        rect(g, 23, 37, 24, 37, '='); rect(g, 23, 8, 24, 36, '=');     // Castle Black road
        rect(g, 14, 15, 33, 23, 'x');                                  // Castle Black inner yard
        const props = [
            { k: 'house', x: 14, y: 11, w: 5, h: 3, roof: 'slate' },   // Lord Commander's Keep
            { k: 'house', x: 28, y: 11, w: 5, h: 3, roof: 'slate' },   // Maester Aemon's Library
            { k: 'ward', x: 18, y: 9, w: 1, h: 1, n: 0 },              // West Tunnel Barricade (spot [18, 9.8])
            { k: 'ward', x: 29, y: 9, w: 1, h: 1, n: 1 },              // East Tunnel Barricade (spot [29, 9.8])
            { k: 'fire', x: 23, y: 16, w: 1, h: 1 },
            { k: 'lore', x: 42, y: 14, w: 1, h: 1, n: 3 }
        ];
        scatter(g, 1, 9, 46, 36, 'P', 0.08, 51); scatter(g, 1, 9, 46, 36, 'r', 0.04, 53);
        clear(g, props.filter(p => p.k !== 'ward'), '.');
        rect(g, 1, 1, 46, 7, '#'); rect(g, 22, 0, 25, 8, 'x'); rect(g, 22, 1, 25, 1, 'g');
        rect(g, 14, 15, 33, 23, 'x'); rect(g, 23, 8, 24, 36, '=');
        for (const p of props) if (p.k === 'ward') g[p.y][p.x] = 'x';
        unblock(g, [[23.5, 18.6, 'x'], [19.5, 18.6, 'x'], [27.5, 18.6, 'x'], [8, 24, '.'], [38, 24, '.'], [14, 14, '.'], [18, 9.8, 'x'], [29, 9.8, 'x'], [42, 14, '.']]);
        put(g, [15, 15, 32, 15, 21, 8, 26, 8], 'L');
        put(g, [3, 10, 44, 10, 4, 34], 'C'); put(g, [12, 22, 35, 22, 20, 30], 'p');
        return {
            ground: 'frost', art: 1, music: 'c4_wall', atmo: 'snow', spawn: [23.5, 34.5], tier: 6,
            rows: rows(g), props,
            npcs: [{ id: 'jon', x: 23.5, y: 18.6 }, { id: 'samwell', x: 19.5, y: 18.6 }, { id: 'aemon', x: 27.5, y: 18.6 }],
            foes: [
                { t: 'wight', x: 9, y: 12 }, { t: 'wight', x: 38, y: 12 }, { t: 'wight', x: 6, y: 28 }, { t: 'wight', x: 40, y: 28 },
                { t: 'icespider', x: 11, y: 20 }, { t: 'icespider', x: 36, y: 20 },
                { t: 'whitewalker', x: 8, y: 10 }, { t: 'whitewalker', x: 39, y: 10 }
            ],
            exits: [
                { x: 23, y: 37, w: 2, h: 1, to: 'c4_north', tx: 23.5, ty: 2.6 },
                { x: 22, y: 0, w: 4, h: 1, to: 'c4_beyond', tx: 23.5, ty: 35.5 }
            ]
        };
    }

    /* ---------------- 7. Beyond the Wall, Hardhome & Heart of Winter ---------------- */
    function beyond() {
        const g = grid(48, 38, '.');
        box(g, 0, 0, 47, 37, '^');
        rect(g, 22, 37, 25, 37, 'x'); rect(g, 22, 8, 25, 36, 'x');     // Frozen glacier path to the Heart of Winter
        rect(g, 14, 1, 34, 7, 'i'); box(g, 13, 0, 35, 7, '#');         // Heart of Winter Altar
        rect(g, 22, 7, 25, 7, 'q');                                    // Ice barrier to the Night King (q -> open.altar)
        rect(g, 14, 8, 34, 14, 'i');                                   // Undead Viserion glacier arena
        const props = [
            { k: 'throne', x: 23, y: 1, w: 3, h: 1, c: 'void' },       // Heart of Winter Ice Altar
            { k: 'anchor', x: 8, y: 20, w: 2, h: 1, n: 0 },            // West Ice Spiral (spot [9, 20.8])
            { k: 'anchor', x: 37, y: 20, w: 2, h: 1, n: 1 },           // East Ice Spiral (spot [38, 20.8])
            { k: 'anchor', x: 22, y: 15, w: 2, h: 1, n: 2 },           // Center Ice Spiral (spot [23, 15.8])
            { k: 'tent', x: 13, y: 27, w: 3, h: 2, c: 'snow' },
            { k: 'fire', x: 17, y: 29, w: 1, h: 1 }
        ];
        scatter(g, 1, 15, 46, 36, 'P', 0.08, 61); scatter(g, 1, 15, 46, 36, 'c', 0.03, 63); scatter(g, 1, 15, 46, 36, 'r', 0.03, 65);
        clear(g, props, '.');
        rect(g, 14, 1, 34, 6, 'i'); rect(g, 22, 7, 25, 7, 'q'); rect(g, 14, 8, 34, 14, 'i'); rect(g, 22, 15, 25, 36, 'x');
        unblock(g, [[15.5, 29.6, '.'], [18.5, 29.6, '.'], [27.5, 29.6, '.'], [9, 20.8, '.'], [38, 20.8, '.'], [23, 15.8, 'x']]);
        put(g, [15, 2, 33, 2, 15, 6, 33, 6, 15, 9, 33, 9], 'c');
        put(g, [3, 16, 44, 16, 4, 34], 'C'); put(g, [11, 25, 36, 25, 20, 32], 'p');
        return {
            ground: 'frost', art: 1, music: 'c4_beyond', atmo: 'snow', spawn: [23.5, 35.5], tier: 6,
            rows: rows(g), props,
            npcs: [
                { id: 'mance', x: 15.5, y: 29.6 }, { id: 'child', x: 18.5, y: 29.6 },
                { id: 'ally_stark', x: 27.5, y: 29.6 }, { id: 'ally_baratheon', x: 27.5, y: 29.6 },
                { id: 'ally_lannister', x: 27.5, y: 29.6 }, { id: 'ally_targaryen', x: 27.5, y: 29.6 }
            ],
            foes: [
                { t: 'wight', x: 10, y: 24 }, { t: 'wight', x: 36, y: 24 }, { t: 'wight', x: 12, y: 17 }, { t: 'wight', x: 35, y: 17 },
                { t: 'whitewalker', x: 7, y: 22 }, { t: 'whitewalker', x: 40, y: 22 },
                { t: 'icespider', x: 14, y: 21 }, { t: 'icespider', x: 33, y: 21 }, { t: 'icespider', x: 8, y: 31 },
                { t: 'giant', x: 6, y: 27 }, { t: 'giant', x: 41, y: 27 },
                { t: 'children', x: 11, y: 15 }, { t: 'children', x: 36, y: 15 }, { t: 'children', x: 39, y: 32 }, { t: 'children', x: 9, y: 33 }
            ],
            boss: { t: 'nightking', x: 24, y: 4.5, flag: 'c4nightking' }, arena: [24, 4.5],
            exits: [{ x: 22, y: 37, w: 4, h: 1, to: 'c4_wall', tx: 23.5, ty: 2.6 }]
        };
    }

    return {
        c4_river: river(),
        c4_kings: kings(),
        c4_storm: storm(),
        c4_north: north(),
        c4_essos: essos(),
        c4_wall: wall(),
        c4_beyond: beyond()
    };
})();
