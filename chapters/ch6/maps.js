/* Hollowmere, Chapter 6: Super Mario — Kingdoms of Wonder.
 * 19 Playable Maps across the Main Mushroom Kingdom Hub Village and 6 Kingdoms (3 Maps per Kingdom):
 * - Hub: c6_village (Mushroom Kingdom Hub Village)
 * - Kingdom 1 (Mushroom Meadows): c6_m1_fields, c6_m2_village, c6_m3_mountain
 * - Kingdom 2 (Jungle Bloom):     c6_j1_jungle, c6_j2_gardens, c6_j3_sanctuary
 * - Kingdom 3 (Boo Haunted):      c6_b1_forest, c6_b2_mansion, c6_b3_hall
 * - Kingdom 4 (Frostpeak):        c6_f1_valley, c6_f2_caverns, c6_f3_palace
 * - Kingdom 5 (Koopa Sky):        c6_s1_clouds, c6_s2_airship, c6_s3_fortress
 * - Kingdom 6 (Bowser Darkfire):  c6_d1_badlands, c6_d2_fortress, c6_d3_throne */
window.HM_C6_MAPS = (function () {
    'use strict';
    function grid(w, h, c) { const g = []; for (let y = 0; y < h; y++) g.push(new Array(w).fill(c)); return g; }
    function rect(g, x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] !== undefined) g[y][x] = c; }
    function box(g, x0, y0, x1, y1, c) { rect(g, x0, y0, x1, y0, c); rect(g, x0, y1, x1, y1, c); rect(g, x0, y0, x0, y1, c); rect(g, x1, y0, x1, y1, c); }
    function put(g, list, c) { for (let i = 0; i < list.length; i += 2) if (g[list[i + 1]]) g[list[i + 1]][list[i]] = c; }
    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    function scatter(g, x0, y0, x1, y1, c, chance, seed, on) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] === (on || '.') && hash(x, y, seed) < chance) g[y][x] = c; }
    function clear(g, props, c) { for (const p of props) rect(g, p.x - 1, p.y - 1, p.x + (p.w || 1), p.y + (p.h || 1) + 1, c || '.'); }
    function unblock(g, pts) { for (const q of pts) for (let y = Math.floor(q[1]) - 1; y <= Math.floor(q[1]) + 1; y++) for (let x = Math.floor(q[0]) - 1; x <= Math.floor(q[0]) + 1; x++) if (g[y] && 'TkPrFB^#'.indexOf(g[y][x]) >= 0) g[y][x] = q[2] || '.'; }
    function unblockFoes(g, foes, defTile) {
        const d = defTile || '.';
        for (const f of foes) {
            const fx = Math.floor(f.x), fy = Math.floor(f.y);
            for (let y = fy - 1; y <= fy + 1; y++) for (let x = fx - 1; x <= fx + 1; x++) {
                if (g[y] && 'TkPrFBcCpL'.indexOf(g[y][x]) >= 0) g[y][x] = d;
            }
        }
        return foes;
    }
    const rows = g => g.map(r => r.join(''));

    /* ========================================================================
     * 0. MAIN HUB — MUSHROOM KINGDOM HUB VILLAGE (c6_village)
     * ======================================================================== */
    function village() {
        const g = grid(46, 34, '.');
        box(g, 0, 0, 45, 33, '^');
        rect(g, 1, 1, 44, 1, '#');

        // 6 Kingdom Exits around the Village Hub:
        // North-West road -> Kingdom 1: Mushroom Meadows (c6_m1_fields)
        rect(g, 7, 0, 9, 0, '='); rect(g, 7, 1, 9, 1, 'q');
        // North-East road -> Kingdom 2: Jungle Bloom Kingdom (c6_j1_jungle)
        rect(g, 36, 0, 38, 0, '='); rect(g, 36, 1, 38, 1, 'g');
        // West road -> Kingdom 3: Boo Haunted Kingdom (c6_b1_forest)
        rect(g, 0, 15, 0, 17, '=');
        // East road -> Kingdom 4: Frostpeak Kingdom (c6_f1_valley)
        rect(g, 45, 15, 45, 17, '=');
        // South-West road -> Kingdom 5: Koopa Sky Kingdom (c6_s1_clouds)
        rect(g, 7, 33, 9, 33, '=');
        // South-East road -> Kingdom 6: Bowser's Darkfire Kingdom (c6_d1_badlands)
        rect(g, 36, 33, 38, 33, '=');

        // Main cobble plaza & roads
        rect(g, 13, 9, 32, 23, 'x');
        rect(g, 21, 7, 24, 31, '=');
        rect(g, 1, 15, 44, 17, '=');
        rect(g, 7, 2, 9, 15, '=');
        rect(g, 36, 2, 38, 15, '=');
        rect(g, 7, 17, 9, 32, '=');
        rect(g, 36, 17, 38, 32, '=');

        // Sparkling moat/stream & wooden bridges
        rect(g, 1, 25, 6, 27, '~'); rect(g, 10, 25, 20, 27, '~');
        rect(g, 25, 25, 35, 27, '~'); rect(g, 39, 25, 44, 27, '~');
        rect(g, 7, 24, 9, 28, 'w'); rect(g, 21, 24, 24, 28, 'w'); rect(g, 36, 24, 38, 28, 'w');

        const props = [
            // Central Peach's Castle
            { k: 'castle', x: 18, y: 2, w: 9, h: 5 },
            // Toadette's Royal Costume Boutique
            { k: 'boutique', x: 11, y: 9, w: 5, h: 3 },
            // Mushroom Houses & Village Shops
            { k: 'mush_house', x: 29, y: 9, w: 5, h: 3, col: 'green' },
            { k: 'house', x: 2, y: 18, w: 5, h: 3, roof: 'red', kind: 'smith' },
            { k: 'house', x: 39, y: 18, w: 5, h: 3, roof: 'green', kind: 'shop' },
            // Star Fountain in the Plaza
            { k: 'fountain', x: 21, y: 18, w: 3, h: 2 },
            // Warp Pipes by each Kingdom Gate
            { k: 'pipe', x: 6, y: 2, w: 1, h: 1, col: 'green' },
            { k: 'pipe', x: 39, y: 2, w: 1, h: 1, col: 'green' },
            { k: 'pipe', x: 2, y: 13, w: 1, h: 1, col: 'purple' },
            { k: 'pipe', x: 43, y: 13, w: 1, h: 1, col: 'blue' },
            { k: 'pipe', x: 6, y: 30, w: 1, h: 1, col: 'gold' },
            { k: 'pipe', x: 39, y: 30, w: 1, h: 1, col: 'red' },
            // Question Blocks (?) & Brick Blocks
            { k: 'qblock', x: 16, y: 14, w: 1, h: 1, item: 'mushroom' },
            { k: 'brick', x: 17, y: 14, w: 1, h: 1 },
            { k: 'qblock', x: 18, y: 14, w: 1, h: 1, item: 'coin' },
            { k: 'qblock', x: 27, y: 14, w: 1, h: 1, item: 'coin' },
            { k: 'brick', x: 28, y: 14, w: 1, h: 1 },
            { k: 'qblock', x: 29, y: 14, w: 1, h: 1, item: 'mushroom' },
            // Goal Flags & Star Shrines
            { k: 'flag', x: 17, y: 7, w: 1, h: 2 },
            { k: 'flag', x: 28, y: 7, w: 1, h: 2 },
            { k: 'shrine', x: 22, y: 11, w: 2, h: 2 }
        ];
        scatter(g, 1, 2, 44, 23, 'T', 0.04, 601);
        scatter(g, 1, 2, 44, 23, 'F', 0.08, 603);
        clear(g, props);
        rect(g, 13, 12, 32, 23, 'x');
        rect(g, 21, 7, 24, 31, '='); rect(g, 1, 15, 44, 17, '=');
        rect(g, 7, 2, 9, 32, '='); rect(g, 36, 2, 38, 32, '=');
        rect(g, 7, 24, 9, 28, 'w'); rect(g, 21, 24, 24, 28, 'w'); rect(g, 36, 24, 38, 28, 'w');
        rect(g, 7, 1, 9, 1, 'q'); rect(g, 36, 1, 38, 1, 'g');
        unblock(g, [
            [22.5, 16.5, 'x'], [19.5, 16.5, 'x'], [25.5, 16.5, 'x'],
            [13.5, 12.8, 'x'], [4.5, 21.7, '.'], [41.5, 21.7, '.'],
            [31.5, 12.8, 'x'], [22.5, 26.5, 'w'], [24.5, 28.5, '=']
        ]);
        put(g, [14, 12, 31, 12, 14, 22, 31, 22], 'L');
        put(g, [3, 4, 42, 4], 'C');
        put(g, [12, 22, 33, 22, 20, 29], 'p');

        return {
            ground: 'meadow', art: 1, music: 'c6_village', atmo: 'starlight', spawn: [22.5, 26.5], tier: 8,
            rows: rows(g), props,
            npcs: [
                { id: 'mario', x: 22.5, y: 16.5 },
                { id: 'luigi', x: 19.5, y: 16.5 },
                { id: 'toadette', x: 13.5, y: 12.8 },
                { id: 'capt_toad', x: 31.5, y: 12.8 },
                { id: 'toad_smith', x: 4.5, y: 21.7 },
                { id: 'toad_shop', x: 41.5, y: 21.7 },
                { id: 'salladhor', x: 24.5, y: 28.5 }
            ],
            foes: [],
            exits: [
                { x: 7, y: 0, w: 3, h: 1, to: 'c6_m1_fields', tx: 22.5, ty: 31.5 },
                { x: 36, y: 0, w: 3, h: 1, to: 'c6_j1_jungle', tx: 22.5, ty: 31.5 },
                { x: 0, y: 15, w: 1, h: 3, to: 'c6_b1_forest', tx: 22.5, ty: 31.5 },
                { x: 45, y: 15, w: 1, h: 3, to: 'c6_f1_valley', tx: 22.5, ty: 31.5 },
                { x: 7, y: 33, w: 3, h: 1, to: 'c6_s1_clouds', tx: 22.5, ty: 31.5 },
                { x: 36, y: 33, w: 3, h: 1, to: 'c6_d1_badlands', tx: 22.5, ty: 31.5 }
            ]
        };
    }

    /* ========================================================================
     * HELPER FOR THE 6 KINGDOMS (3 MAPS PER KINGDOM = 18 KINGDOM MAPS)
     * ======================================================================== */
    function makeKingdomMap1(opts) {
        const g = grid(46, 34, '.');
        box(g, 0, 0, 45, 33, '^');
        rect(g, 1, 1, 44, 1, '#');
        // North exit to Map 2, South exit back to c6_village
        rect(g, 21, 0, 23, 0, '=');
        rect(g, 21, 33, 23, 33, '=');
        // Winding adventure road & side clearings
        rect(g, 21, 1, 23, 32, '=');
        rect(g, 8, 10, 37, 12, '=');
        rect(g, 8, 22, 37, 24, '=');
        rect(g, 8, 10, 10, 24, '=');
        rect(g, 35, 10, 37, 24, '=');
        if (opts.river) {
            rect(g, 1, 16, 20, 18, '~'); rect(g, 24, 16, 44, 18, '~');
            rect(g, 20, 15, 24, 19, 'w');
            rect(g, 7, 15, 11, 19, 'w');
            rect(g, 34, 15, 38, 19, 'w');
        }
        const props = [
            { k: 'pipe', x: 19, y: 30, w: 1, h: 1, col: opts.pipeCol || 'green' },
            { k: 'pipe', x: 25, y: 3, w: 1, h: 1, col: opts.pipeCol || 'green' },
            { k: 'qblock', x: 14, y: 20, w: 1, h: 1, item: 'mushroom' },
            { k: 'brick', x: 15, y: 20, w: 1, h: 1 },
            { k: 'qblock', x: 16, y: 20, w: 1, h: 1, item: 'coin' },
            { k: 'qblock', x: 29, y: 14, w: 1, h: 1, item: 'coin' },
            { k: 'brick', x: 30, y: 14, w: 1, h: 1 },
            { k: 'qblock', x: 31, y: 14, w: 1, h: 1, item: 'mushroom' },
            { k: 'flag', x: 20, y: 3, w: 1, h: 2 }
        ].concat(opts.extraProps || []);
        scatter(g, 2, 3, 43, 30, 'T', 0.06, opts.seed);
        scatter(g, 2, 3, 43, 30, 'F', 0.07, opts.seed + 11);
        scatter(g, 2, 3, 43, 30, 'r', 0.03, opts.seed + 23);
        clear(g, props);
        rect(g, 21, 1, 23, 32, '=');
        if (opts.river) {
            rect(g, 20, 15, 24, 19, 'w'); rect(g, 7, 15, 11, 19, 'w'); rect(g, 34, 15, 38, 19, 'w');
        }
        put(g, [4, 5, 41, 5], 'C');
        put(g, [6, 28, 39, 28, 14, 9], 'p');
        const foes = unblockFoes(g, opts.foes, '.');
        return {
            ground: opts.ground, art: 1, music: opts.music, atmo: opts.atmo,
            spawn: [22.5, 31.5], tier: 8, rows: rows(g), props,
            npcs: opts.npcs || [], foes,
            exits: [
                { x: 21, y: 0, w: 3, h: 1, to: opts.next, tx: 22.5, ty: 31.5 },
                { x: 21, y: 33, w: 3, h: 1, to: opts.prev, tx: opts.prevX || 22.5, ty: opts.prevY || 26.5 }
            ]
        };
    }

    function makeKingdomMap2(opts) {
        const g = grid(46, 34, '.');
        box(g, 0, 0, 45, 33, '^');
        rect(g, 1, 1, 44, 1, '#');
        // North gate to Boss Arena (Map 3), South exit to Map 1
        rect(g, 21, 0, 23, 0, '=');
        rect(g, 21, 33, 23, 33, '=');
        rect(g, 21, 1, 23, 32, '=');
        rect(g, 9, 14, 36, 22, 'x');
        rect(g, 6, 8, 40, 10, '=');
        if (opts.moat) {
            rect(g, 1, 11, 19, 13, '~'); rect(g, 25, 11, 44, 13, '~');
            rect(g, 20, 10, 24, 14, 'w');
        }
        const props = [
            { k: 'qblock', x: 15, y: 18, w: 1, h: 1, item: 'mushroom' },
            { k: 'brick', x: 16, y: 18, w: 1, h: 1 },
            { k: 'qblock', x: 29, y: 18, w: 1, h: 1, item: 'coin' },
            { k: 'qblock', x: 22, y: 25, w: 1, h: 1, item: 'mushroom' },
            { k: 'shrine', x: 11, y: 15, w: 2, h: 2 },
            { k: 'shrine', x: 32, y: 15, w: 2, h: 2 },
            { k: 'flag', x: 19, y: 3, w: 1, h: 2 },
            { k: 'flag', x: 25, y: 3, w: 1, h: 2 }
        ].concat(opts.extraProps || []);
        scatter(g, 2, 3, 43, 30, 'T', 0.05, opts.seed);
        scatter(g, 2, 3, 43, 30, 'F', 0.06, opts.seed + 13);
        clear(g, props);
        rect(g, 9, 14, 36, 22, 'x');
        rect(g, 21, 1, 23, 32, '=');
        if (opts.moat) rect(g, 20, 10, 24, 14, 'w');
        unblock(g, opts.spots || [[12.5, 18.5, 'x'], [32.5, 18.5, 'x']]);
        put(g, [3, 4, 42, 4, 3, 29], 'C');
        put(g, [8, 26, 37, 26, 22, 7], 'p');
        const foes = unblockFoes(g, opts.foes, '.');
        return {
            ground: opts.ground, art: 1, music: opts.music, atmo: opts.atmo,
            spawn: [22.5, 31.5], tier: 8, rows: rows(g), props,
            npcs: opts.npcs || [], foes,
            exits: [
                { x: 21, y: 0, w: 3, h: 1, to: opts.next, tx: 22.5, ty: 31.5 },
                { x: 21, y: 33, w: 3, h: 1, to: opts.prev, tx: 22.5, ty: 2.5 }
            ]
        };
    }

    function makeBossArenaMap3(opts) {
        const g = grid(46, 34, '.');
        box(g, 0, 0, 45, 33, '^');
        rect(g, 1, 1, 44, 1, '#');
        // Grand Boss Arena Floor & Royal Star Dais
        rect(g, 9, 6, 36, 25, 'x');
        rect(g, 21, 25, 23, 32, '=');
        rect(g, 21, 33, 23, 33, '=');
        // North Warp Pipe back to Mushroom Kingdom Hub Village
        rect(g, 38, 6, 40, 8, '=');
        const props = [
            { k: 'star_dais', x: 21, y: 6, w: 3, h: 2 },
            { k: 'qblock', x: 11, y: 22, w: 1, h: 1, item: 'mushroom' },
            { k: 'qblock', x: 34, y: 22, w: 1, h: 1, item: 'mushroom' },
            { k: 'qblock', x: 11, y: 10, w: 1, h: 1, item: 'coin' },
            { k: 'qblock', x: 34, y: 10, w: 1, h: 1, item: 'coin' },
            { k: 'pipe', x: 39, y: 7, w: 1, h: 1, col: 'gold' },
            { k: 'flag', x: 15, y: 6, w: 1, h: 2 },
            { k: 'flag', x: 30, y: 6, w: 1, h: 2 }
        ].concat(opts.extraProps || []);
        clear(g, props, 'x');
        rect(g, 9, 8, 36, 25, 'x');
        rect(g, 21, 25, 23, 33, '=');
        unblock(g, [[22.5, 8.5, 'x'], [22.5, 13.5, 'x'], [22.5, 31.5, '=']]);
        put(g, [10, 7, 35, 7], 'C');
        const rawFoes = opts.foes || [];
        const bFoe = rawFoes.find(f => f.boss);
        const foes = unblockFoes(g, rawFoes.filter(f => !f.boss), 'x');
        const boss = bFoe ? { t: bFoe.t, x: bFoe.x, y: bFoe.y, flag: 'c6_' + bFoe.t } : undefined;
        return {
            ground: opts.ground, art: 1, music: opts.music, atmo: opts.atmo,
            spawn: [22.5, 31.5], tier: 8, rows: rows(g), props,
            npcs: [{ id: opts.princess, x: 22.5, y: 8.5 }],
            foes, boss,
            exits: [
                { x: 21, y: 33, w: 3, h: 1, to: opts.prev, tx: 22.5, ty: 2.5 },
                { x: 38, y: 6, w: 3, h: 2, to: 'c6_village', tx: 22.5, ty: 21.5 }
            ]
        };
    }

    /* ========================================================================
     * KINGDOM 1 — MUSHROOM MEADOWS (Daisy, Royal Star 1, Boss: King Bob-omb)
     * ======================================================================== */
    function m1_fields() {
        return makeKingdomMap1({
            ground: 'meadow', music: 'c6_meadow', atmo: 'day', seed: 610, river: true, pipeCol: 'green',
            prev: 'c6_village', prevX: 8.5, prevY: 2.5, next: 'c6_m2_village',
            extraProps: [{ k: 'mush_house', x: 4, y: 10, w: 4, h: 3, col: 'red' }],
            foes: [
                { t: 'goomba', x: 16, y: 24 }, { t: 'goomba', x: 28, y: 24 },
                { t: 'koopa', x: 14, y: 18 }, { t: 'koopa', x: 31, y: 18 },
                { t: 'paratroopa', x: 22, y: 14 }, { t: 'piranha', x: 11, y: 11 },
                { t: 'bobomb', x: 33, y: 11 }, { t: 'goomba', x: 22, y: 8 }
            ]
        });
    }
    function m2_village() {
        return makeKingdomMap2({
            ground: 'meadow', music: 'c6_meadow', atmo: 'day', seed: 620, moat: true,
            prev: 'c6_m1_fields', next: 'c6_m3_mountain',
            spots: [[12.5, 18.5, 'x'], [32.5, 18.5, 'x']],
            extraProps: [
                { k: 'mush_house', x: 4, y: 16, w: 4, h: 3, col: 'red' },
                { k: 'mush_house', x: 37, y: 16, w: 4, h: 3, col: 'green' }
            ],
            foes: [
                { t: 'koopa', x: 15, y: 24 }, { t: 'koopa', x: 30, y: 24 },
                { t: 'bobomb', x: 14, y: 19 }, { t: 'bobomb', x: 31, y: 19 },
                { t: 'paratroopa', x: 22, y: 16 }, { t: 'piranha', x: 18, y: 9 },
                { t: 'bobomb', x: 27, y: 9 }
            ]
        });
    }
    function m3_mountain() {
        return makeBossArenaMap3({
            ground: 'mountain', music: 'c6_boss', atmo: 'day',
            prev: 'c6_m2_village', princess: 'daisy',
            foes: [
                { t: 'king_bobomb', x: 22.5, y: 13.5, boss: true },
                { t: 'bobomb', x: 14, y: 19 }, { t: 'bobomb', x: 31, y: 19 }
            ]
        });
    }

    /* ========================================================================
     * KINGDOM 2 — JUNGLE BLOOM KINGDOM (Eclair, Royal Star 2, Boss: Petey Piranha)
     * ======================================================================== */
    function j1_jungle() {
        return makeKingdomMap1({
            ground: 'jungle', music: 'c6_jungle', atmo: 'spores', seed: 630, river: true, pipeCol: 'green',
            prev: 'c6_village', prevX: 37.5, prevY: 2.5, next: 'c6_j2_gardens',
            foes: [
                { t: 'piranha', x: 15, y: 24 }, { t: 'nipper', x: 29, y: 24 },
                { t: 'wiggler', x: 14, y: 18 }, { t: 'wiggler', x: 31, y: 18 },
                { t: 'monty_mole', x: 22, y: 13 }, { t: 'swooper', x: 12, y: 10 },
                { t: 'piranha', x: 33, y: 10 }, { t: 'nipper', x: 22, y: 7 }
            ]
        });
    }
    function j2_gardens() {
        return makeKingdomMap2({
            ground: 'jungle', music: 'c6_jungle', atmo: 'spores', seed: 640, moat: true,
            prev: 'c6_j1_jungle', next: 'c6_j3_sanctuary',
            spots: [[11.5, 16.5, 'x'], [33.5, 16.5, 'x']],
            foes: [
                { t: 'wiggler', x: 15, y: 24 }, { t: 'piranha', x: 30, y: 24 },
                { t: 'monty_mole', x: 14, y: 18 }, { t: 'monty_mole', x: 31, y: 18 },
                { t: 'swooper', x: 22, y: 15 }, { t: 'nipper', x: 19, y: 9 },
                { t: 'wiggler', x: 26, y: 9 }
            ]
        });
    }
    function j3_sanctuary() {
        return makeBossArenaMap3({
            ground: 'jungle', music: 'c6_boss', atmo: 'spores',
            prev: 'c6_j2_gardens', princess: 'eclair',
            foes: [
                { t: 'petey_piranha', x: 22.5, y: 13.5, boss: true },
                { t: 'nipper', x: 14, y: 19 }, { t: 'nipper', x: 31, y: 19 }
            ]
        });
    }

    /* ========================================================================
     * KINGDOM 3 — BOO HAUNTED KINGDOM (Shokora, Royal Star 3, Boss: King Boo)
     * ======================================================================== */
    function b1_forest() {
        return makeKingdomMap1({
            ground: 'haunted', music: 'c6_haunted', atmo: 'mist', seed: 650, river: false, pipeCol: 'purple',
            prev: 'c6_village', prevX: 2.5, prevY: 16.5, next: 'c6_b2_mansion',
            foes: [
                { t: 'boo', x: 15, y: 24 }, { t: 'boo', x: 29, y: 24 },
                { t: 'dry_bones', x: 14, y: 18 }, { t: 'dry_bones', x: 31, y: 18 },
                { t: 'peepa', x: 22, y: 14 }, { t: 'swooper', x: 12, y: 10 },
                { t: 'big_boo', x: 33, y: 10 }, { t: 'boo', x: 22, y: 7 }
            ]
        });
    }
    function b2_mansion() {
        return makeKingdomMap2({
            ground: 'haunted', music: 'c6_haunted', atmo: 'mist', seed: 660, moat: false,
            prev: 'c6_b1_forest', next: 'c6_b3_hall',
            spots: [[10.5, 20.5, 'x'], [34.5, 20.5, 'x'], [22.5, 14.5, 'x']],
            foes: [
                { t: 'boo', x: 14, y: 24 }, { t: 'big_boo', x: 31, y: 24 },
                { t: 'dry_bones', x: 14, y: 18 }, { t: 'peepa', x: 31, y: 18 },
                { t: 'big_boo', x: 22, y: 16 }, { t: 'boo', x: 18, y: 9 },
                { t: 'dry_bones', x: 27, y: 9 }
            ]
        });
    }
    function b3_hall() {
        return makeBossArenaMap3({
            ground: 'haunted', music: 'c6_boss', atmo: 'mist',
            prev: 'c6_b2_mansion', princess: 'shokora',
            foes: [
                { t: 'king_boo', x: 22.5, y: 13.5, boss: true },
                { t: 'boo', x: 14, y: 19 }, { t: 'boo', x: 31, y: 19 }
            ]
        });
    }

    /* ========================================================================
     * KINGDOM 4 — FROSTPEAK KINGDOM (Rosalina, Royal Star 4, Boss: Kamek)
     * ======================================================================== */
    function f1_valley() {
        return makeKingdomMap1({
            ground: 'snow', music: 'c6_frost', atmo: 'snow', seed: 670, river: true, pipeCol: 'blue',
            prev: 'c6_village', prevX: 43.5, prevY: 16.5, next: 'c6_f2_caverns',
            foes: [
                { t: 'shy_guy', x: 15, y: 24 }, { t: 'shy_guy', x: 29, y: 24 },
                { t: 'snow_pokey', x: 14, y: 18 }, { t: 'ice_bro', x: 31, y: 18 },
                { t: 'cooligan', x: 22, y: 13 }, { t: 'ice_bro', x: 12, y: 10 },
                { t: 'snow_pokey', x: 33, y: 10 }, { t: 'spiny', x: 22, y: 7 }
            ]
        });
    }
    function f2_caverns() {
        return makeKingdomMap2({
            ground: 'snow', music: 'c6_frost', atmo: 'snow', seed: 680, moat: true,
            prev: 'c6_f1_valley', next: 'c6_f3_palace',
            spots: [[12.5, 17.5, 'x'], [32.5, 17.5, 'x']],
            foes: [
                { t: 'ice_bro', x: 15, y: 24 }, { t: 'cooligan', x: 30, y: 24 },
                { t: 'snow_pokey', x: 14, y: 18 }, { t: 'ice_bro', x: 31, y: 18 },
                { t: 'shy_guy', x: 22, y: 15 }, { t: 'spiny', x: 18, y: 9 },
                { t: 'cooligan', x: 27, y: 9 }
            ]
        });
    }
    function f3_palace() {
        return makeBossArenaMap3({
            ground: 'snow', music: 'c6_boss', atmo: 'snow',
            prev: 'c6_f2_caverns', princess: 'rosalina',
            foes: [
                { t: 'kamek', x: 22.5, y: 13.5, boss: true },
                { t: 'magikoopa', x: 14, y: 19 }, { t: 'ice_bro', x: 31, y: 19 }
            ]
        });
    }

    /* ========================================================================
     * KINGDOM 5 — KOOPA SKY KINGDOM (Pauline, Royal Star 5, Boss: Bowser Jr.)
     * ======================================================================== */
    function s1_clouds() {
        return makeKingdomMap1({
            ground: 'sky', music: 'c6_sky', atmo: 'starlight', seed: 690, river: true, pipeCol: 'gold',
            prev: 'c6_village', prevX: 8.5, prevY: 31.5, next: 'c6_s2_airship',
            foes: [
                { t: 'paratroopa', x: 15, y: 24 }, { t: 'lakitu', x: 29, y: 24 },
                { t: 'hammer_bro', x: 14, y: 18 }, { t: 'buzzy_beetle', x: 31, y: 18 },
                { t: 'bullet_bill', x: 22, y: 13 }, { t: 'lakitu', x: 12, y: 10 },
                { t: 'hammer_bro', x: 33, y: 10 }, { t: 'magikoopa', x: 22, y: 7 }
            ]
        });
    }
    function s2_airship() {
        return makeKingdomMap2({
            ground: 'airship', music: 'c6_sky', atmo: 'starlight', seed: 700, moat: true,
            prev: 'c6_s1_clouds', next: 'c6_s3_fortress',
            spots: [[12.5, 16.5, 'x'], [32.5, 16.5, 'x']],
            foes: [
                { t: 'bullet_bill', x: 15, y: 24 }, { t: 'hammer_bro', x: 30, y: 24 },
                { t: 'buzzy_beetle', x: 14, y: 18 }, { t: 'magikoopa', x: 31, y: 18 },
                { t: 'lakitu', x: 22, y: 15 }, { t: 'bullet_bill', x: 18, y: 9 },
                { t: 'hammer_bro', x: 27, y: 9 }
            ]
        });
    }
    function s3_fortress() {
        return makeBossArenaMap3({
            ground: 'airship', music: 'c6_boss', atmo: 'starlight',
            prev: 'c6_s2_airship', princess: 'pauline',
            foes: [
                { t: 'bowser_jr', x: 22.5, y: 13.5, boss: true },
                { t: 'hammer_bro', x: 14, y: 19 }, { t: 'buzzy_beetle', x: 31, y: 19 }
            ]
        });
    }

    /* ========================================================================
     * KINGDOM 6 — BOWSER'S DARKFIRE KINGDOM (Peach, Royal Star 6, Final Boss: Bowser)
     * ======================================================================== */
    function d1_badlands() {
        return makeKingdomMap1({
            ground: 'lava', music: 'c6_darkfire', atmo: 'ash', seed: 710, river: true, pipeCol: 'red',
            prev: 'c6_village', prevX: 37.5, prevY: 31.5, next: 'c6_d2_fortress',
            foes: [
                { t: 'fire_bro', x: 15, y: 24 }, { t: 'koopa_guard', x: 29, y: 24 },
                { t: 'chain_chomp', x: 14, y: 18 }, { t: 'hammer_bro', x: 31, y: 18 },
                { t: 'lava_bubble', x: 22, y: 14 }, { t: 'dry_bones', x: 12, y: 10 },
                { t: 'magikoopa', x: 33, y: 10 }, { t: 'koopa_guard', x: 22, y: 7 }
            ]
        });
    }
    function d2_fortress() {
        return makeKingdomMap2({
            ground: 'lava', music: 'c6_darkfire', atmo: 'ash', seed: 720, moat: true,
            prev: 'c6_d1_badlands', next: 'c6_d3_throne',
            spots: [[11.5, 16.5, 'x'], [33.5, 16.5, 'x']],
            foes: [
                { t: 'koopa_guard', x: 15, y: 24 }, { t: 'fire_bro', x: 30, y: 24 },
                { t: 'chain_chomp', x: 14, y: 18 }, { t: 'hammer_bro', x: 31, y: 18 },
                { t: 'magikoopa', x: 22, y: 15 }, { t: 'lava_bubble', x: 18, y: 9 },
                { t: 'koopa_guard', x: 27, y: 9 }
            ]
        });
    }
    function d3_throne() {
        return makeBossArenaMap3({
            ground: 'lava', music: 'c6_bowser1', atmo: 'ash',
            prev: 'c6_d2_fortress', princess: 'peach',
            extraProps: [
                { k: 'bowser_statue', x: 13, y: 11, w: 2, h: 2 },
                { k: 'bowser_statue', x: 31, y: 11, w: 2, h: 2 }
            ],
            foes: [
                { t: 'bowser', x: 22.5, y: 14.5, boss: true },
                { t: 'koopa_guard', x: 14, y: 20 }, { t: 'fire_bro', x: 31, y: 20 }
            ]
        });
    }

    return {
        c6_village: village(),
        c6_m1_fields: m1_fields(),
        c6_m2_village: m2_village(),
        c6_m3_mountain: m3_mountain(),
        c6_j1_jungle: j1_jungle(),
        c6_j2_gardens: j2_gardens(),
        c6_j3_sanctuary: j3_sanctuary(),
        c6_b1_forest: b1_forest(),
        c6_b2_mansion: b2_mansion(),
        c6_b3_hall: b3_hall(),
        c6_f1_valley: f1_valley(),
        c6_f2_caverns: f2_caverns(),
        c6_f3_palace: f3_palace(),
        c6_s1_clouds: s1_clouds(),
        c6_s2_airship: s2_airship(),
        c6_s3_fortress: s3_fortress(),
        c6_d1_badlands: d1_badlands(),
        c6_d2_fortress: d2_fortress(),
        c6_d3_throne: d3_throne()
    };
})();
