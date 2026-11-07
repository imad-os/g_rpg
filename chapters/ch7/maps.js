/* Hollowmere, Chapter 7: The Legend of Zelda — Ocarina of Time ("The Symphony of Hyrule").
 * 22 Playable Maps across Hyrule (12 Overworld Regions + 3 Child Dungeons + 6 Adult Temples + Ganon's Tower):
 * - Overworld: c7_kokiri, c7_field, c7_ranch, c7_castle, c7_kakariko, c7_trail, c7_goron, c7_river, c7_zora, c7_lake, c7_gerudo, c7_desert
 * - Child Dungeons: c7_d1_deku, c7_d2_dodongo, c7_d3_jabu
 * - Adult Temples & Final Citadel: c7_t1_forest, c7_t2_fire, c7_t3_water, c7_t4_shadow, c7_t5_spirit, c7_t6_castle, c7_t7_tower */
window.HM_C7_MAPS = (function () {
    'use strict';
    const W = 46, H = 34;

    function grid(w, h, c) { const g = []; for (let y = 0; y < h; y++) g.push(new Array(w).fill(c)); return g; }
    function rect(g, x0, y0, x1, y1, c) {
        for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++) {
            for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) {
                if (g[y] && g[y][x] !== undefined) g[y][x] = c;
            }
        }
    }
    function box(g, x0, y0, x1, y1, c) {
        rect(g, x0, y0, x1, y0, c); rect(g, x0, y1, x1, y1, c);
        rect(g, x0, y0, x0, y1, c); rect(g, x1, y0, x1, y1, c);
    }
    function put(g, list, c) { for (let i = 0; i < list.length; i += 2) if (g[list[i + 1]]) g[list[i + 1]][list[i]] = c; }
    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    function scatter(g, x0, y0, x1, y1, c, chance, seed, on) {
        for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
                if (g[y] && g[y][x] === (on || '.') && hash(x, y, seed) < chance) g[y][x] = c;
            }
        }
    }
    function clear(g, props, c) {
        for (const p of props || []) {
            rect(g, p.x - 1, p.y - 1, p.x + (p.w || 1), p.y + (p.h || 1) + 1, c || '.');
        }
    }
    function unblockPt(g, x, y, tile) {
        const ix = Math.floor(x), iy = Math.floor(y);
        for (let py = iy - 1; py <= iy + 1; py++) {
            for (let px = ix - 1; px <= ix + 1; px++) {
                if (g[py] && g[py][px] !== undefined && 'TkPrFBcCpL^#~gq'.indexOf(g[py][px]) >= 0) {
                    g[py][px] = tile || '=';
                }
            }
        }
    }
    function finalizeMap(def, floorTile) {
        const fl = floorTile || '=';
        const g = def._grid;
        delete def._grid;
        if (def.spawn) unblockPt(g, def.spawn[0], def.spawn[1], fl);
        for (const n of def.npcs || []) unblockPt(g, n.x, n.y, fl);
        for (const f of def.foes || []) unblockPt(g, f.x, f.y, fl);
        for (const sp of def.questSpots || []) unblockPt(g, sp[0], sp[1], fl);
        for (const e of def.exits || []) {
            rect(g, e.x, e.y, e.x + e.w - 1, e.y + e.h - 1, '=');
            // Also clear 1 tile inward from the exit so player never hits a wall entering/leaving
            const cx = e.x + Math.floor(e.w / 2), cy = e.y + Math.floor(e.h / 2);
            unblockPt(g, cx, cy, '=');
        }
        def.rows = g.map(r => r.join(''));
        return def;
    }

    function makeBaseGrid(seed) {
        const g = grid(W, H, '.');
        box(g, 0, 0, W - 1, H - 1, '^');
        rect(g, 1, 1, W - 2, 1, '#');
        scatter(g, 2, 3, W - 3, H - 3, 'T', 0.04, seed);
        scatter(g, 2, 3, W - 3, H - 3, 'F', 0.07, seed + 7);
        // Central crossroad & plaza
        rect(g, 12, 10, 33, 24, 'x');
        rect(g, 21, 1, 24, H - 2, '=');
        rect(g, 1, 16, W - 2, 18, '=');
        return g;
    }

    // 1. KOKIRI FOREST (c7_kokiri) — Home Hub
    function buildKokiri() {
        const g = makeBaseGrid(701);
        const props = [
            { k: 'deku_tree', x: 35, y: 11, w: 6, h: 4 },
            { k: 'triforce_pad', x: 22, y: 5, w: 2, h: 1, song: 'minuet_forest' },
            { k: 'fairy_fountain', x: 8, y: 6, w: 3, h: 2 },
            { k: 'house', x: 10, y: 12, w: 4, h: 3, roof: 'green' },
            { k: 'house', x: 10, y: 20, w: 4, h: 3, roof: 'green' },
            { k: 'house', x: 28, y: 20, w: 4, h: 3, roof: 'red' }
        ];
        clear(g, props, 'x');
        put(g, [14, 11, 31, 11, 14, 24, 31, 24], 'L');
        put(g, [9, 27, 36, 27], 'C');
        put(g, [16, 25, 29, 25], 'p');
        return finalizeMap({
            _grid: g, ground: 'kokiri', art: 1, music: 'c7_kokiri', song: 'c7_kokiri', atmo: 'forest',
            spawn: [22.5, 26.5], tier: 9, props,
            npcs: [
                { id: 'saria', x: 22.5, y: 16.5 },
                { id: 'mido', x: 33.5, y: 16.5 },
                { id: 'kokiri_smith', x: 12.5, y: 15.8 },
                { id: 'kokiri_tailor', x: 12.5, y: 23.8 },
                { id: 'kokiri_witch', x: 30.5, y: 23.8 },
                { id: 'hylian_envoy', x: 25.5, y: 26.5 }
            ],
            foes: [
                { t: 'deku_baba', x: 8.5, y: 18.5 },
                { t: 'deku_baba', x: 16.5, y: 28.5 },
                { t: 'skullwalltula', x: 34.5, y: 26.5 },
                { t: 'mad_scrub', x: 28.5, y: 9.5 }
            ],
            questSpots: [[9.5, 8.5], [10.5, 27.5], [35.5, 16.5], [22.5, 6.5]],
            exits: [
                { x: 0, y: 16, w: 1, h: 3, to: 'c7_field', tx: 42.5, ty: 17.5 },
                { x: 45, y: 16, w: 1, h: 3, to: 'c7_d1_deku', tx: 22.5, ty: 30.5 },
                { x: 21, y: 0, w: 4, h: 1, to: 'c7_t1_forest', tx: 22.5, ty: 30.5 }
            ]
        }, 'x');
    }

    // 2. HYRULE FIELD (c7_field) — Central Hub connecting all regions
    function buildField() {
        const g = makeBaseGrid(702);
        rect(g, 35, 1, 38, 18, '=');
        const props = [
            { k: 'gossip_stone', x: 32, y: 14, w: 2, h: 2 },
            { k: 'shrine', x: 14, y: 8, w: 2, h: 2 },
            { k: 'house', x: 20, y: 15, w: 4, h: 3, roof: 'red' }
        ];
        clear(g, props, 'x');
        put(g, [18, 14, 27, 14, 18, 22, 27, 22], 'L');
        put(g, [8, 28, 38, 28], 'C');
        return finalizeMap({
            _grid: g, ground: 'field', art: 1, music: 'c7_field', song: 'c7_field', atmo: 'day',
            spawn: [41.5, 17.5], tier: 9, props,
            npcs: [
                { id: 'kaepora', x: 34.5, y: 16.5 },
                { id: 'sheik', x: 19.5, y: 19.5 }
            ],
            foes: [
                { t: 'peahat', x: 12.5, y: 13.5 },
                { t: 'peahat', x: 32.5, y: 24.5 },
                { t: 'stalchild', x: 14.5, y: 25.5 },
                { t: 'stalchild', x: 28.5, y: 26.5 },
                { t: 'poe', x: 10.5, y: 20.5 }
            ],
            questSpots: [[32.5, 16.5], [14.5, 10.5], [22.5, 19.5]],
            exits: [
                { x: 45, y: 16, w: 1, h: 3, to: 'c7_kokiri', tx: 3.5, ty: 17.5 },
                { x: 21, y: 0, w: 4, h: 1, to: 'c7_castle', tx: 22.5, ty: 30.5 },
                { x: 35, y: 0, w: 4, h: 1, to: 'c7_kakariko', tx: 22.5, ty: 30.5 },
                { x: 45, y: 8, w: 1, h: 3, to: 'c7_river', tx: 3.5, ty: 17.5 },
                { x: 21, y: 33, w: 4, h: 1, to: 'c7_lake', tx: 22.5, ty: 3.5 },
                { x: 0, y: 16, w: 1, h: 3, to: 'c7_gerudo', tx: 42.5, ty: 17.5 },
                { x: 21, y: 18, w: 3, h: 2, to: 'c7_ranch', tx: 22.5, ty: 30.5 }
            ]
        }, 'x');
    }

    // 3. LON LON RANCH (c7_ranch)
    function buildRanch() {
        const g = makeBaseGrid(703);
        rect(g, 14, 12, 31, 22, '.');
        box(g, 13, 11, 32, 23, '=');
        const props = [
            { k: 'triforce_pad', x: 22, y: 16, w: 2, h: 1, song: 'epona_song' },
            { k: 'house', x: 9, y: 22, w: 4, h: 3, roof: 'red' },
            { k: 'windmill', x: 34, y: 8, w: 4, h: 3 }
        ];
        clear(g, props, '=');
        put(g, [8, 8, 37, 26], 'C');
        return finalizeMap({
            _grid: g, ground: 'field', art: 1, music: 'c7_kokiri', song: 'c7_kokiri', atmo: 'day',
            spawn: [22.5, 30.5], tier: 9, props,
            npcs: [
                { id: 'malon', x: 22.5, y: 15.5 },
                { id: 'talon', x: 11.5, y: 25.8 },
                { id: 'ingo', x: 30.5, y: 24.5 }
            ],
            foes: [
                { t: 'mad_scrub', x: 8.5, y: 14.5 },
                { t: 'mad_scrub', x: 37.5, y: 14.5 }
            ],
            questSpots: [[22.5, 17.5], [12.5, 25.5], [35.5, 12.5]],
            exits: [
                { x: 21, y: 33, w: 4, h: 1, to: 'c7_field', tx: 22.5, ty: 20.5 }
            ]
        }, '=');
    }

    // 4. HYRULE CASTLE TOWN & TEMPLE OF TIME (c7_castle)
    function buildCastle() {
        const g = makeBaseGrid(704);
        rect(g, 8, 6, 37, 28, 'x');
        const props = [
            { k: 'temple', x: 19, y: 2, w: 7, h: 4, c: 'time' },
            { k: 'pedestal', x: 21, y: 7, w: 3, h: 2 },
            { k: 'triforce_pad', x: 22, y: 11, w: 2, h: 1, song: 'song_of_time' },
            { k: 'triforce_pad', x: 11, y: 12, w: 2, h: 1, song: 'zelda_lullaby' },
            { k: 'fairy_fountain', x: 33, y: 22, w: 3, h: 2 }
        ];
        clear(g, props, 'x');
        put(g, [16, 10, 29, 10, 16, 22, 29, 22], 'L');
        put(g, [9, 26, 36, 10], 'C');
        return finalizeMap({
            _grid: g, ground: 'castle', art: 1, music: 'c7_castle', song: 'c7_castle', atmo: 'starlight',
            spawn: [22.5, 30.5], tier: 9, props,
            npcs: [
                { id: 'zelda', x: 11.5, y: 10.5 },
                { id: 'impa', x: 14.5, y: 11.5 },
                { id: 'rauru', x: 25.5, y: 9.5 },
                { id: 'sheik', x: 22.5, y: 14.5 },
                { id: 'kokiri_smith', x: 12.5, y: 22.5 },
                { id: 'kokiri_witch', x: 31.5, y: 22.5 }
            ],
            foes: [
                { t: 'lizalfos', x: 9.5, y: 19.5 },
                { t: 'iron_knuckle', x: 36.5, y: 16.5 }
            ],
            questSpots: [[11.5, 12.5], [22.5, 11.5], [22.5, 8.5], [39.5, 16.5]],
            exits: [
                { x: 21, y: 33, w: 4, h: 1, to: 'c7_field', tx: 22.5, ty: 3.5 },
                { x: 45, y: 16, w: 1, h: 3, to: 'c7_t6_castle', tx: 22.5, ty: 30.5 }
            ]
        }, 'x');
    }

    // 5. KAKARIKO VILLAGE & ROYAL GRAVEYARD (c7_kakariko)
    function buildKakariko() {
        const g = makeBaseGrid(705);
        const props = [
            { k: 'windmill', x: 10, y: 8, w: 4, h: 3 },
            { k: 'triforce_pad', x: 11, y: 13, w: 2, h: 1, song: 'song_of_storms' },
            { k: 'shrine', x: 35, y: 9, w: 2, h: 2 },
            { k: 'triforce_pad', x: 38, y: 16, w: 2, h: 1, song: 'nocturne_shadow' },
            { k: 'house', x: 14, y: 21, w: 4, h: 3, roof: 'red' }
        ];
        clear(g, props, 'x');
        put(g, [18, 12, 28, 12, 34, 15, 34, 21], 'L');
        put(g, [22, 22, 38, 26], 'C');
        return finalizeMap({
            _grid: g, ground: 'kakariko', art: 1, music: 'c7_kokiri', song: 'c7_kokiri', atmo: 'dusk',
            spawn: [22.5, 30.5], tier: 9, props,
            npcs: [
                { id: 'impa', x: 20.5, y: 16.5 },
                { id: 'guru_guru', x: 14.5, y: 12.5 },
                { id: 'dampe', x: 33.5, y: 12.5 },
                { id: 'sheik', x: 25.5, y: 18.5 }
            ],
            foes: [
                { t: 'redead', x: 34.5, y: 22.5 },
                { t: 'gibdo', x: 37.5, y: 24.5 },
                { t: 'poe', x: 35.5, y: 14.5 }
            ],
            questSpots: [[35.5, 11.5], [11.5, 13.5], [22.5, 22.5], [38.5, 16.5]],
            exits: [
                { x: 21, y: 33, w: 4, h: 1, to: 'c7_field', tx: 36.5, ty: 3.5 },
                { x: 21, y: 0, w: 4, h: 1, to: 'c7_trail', tx: 22.5, ty: 30.5 },
                { x: 45, y: 16, w: 1, h: 3, to: 'c7_t4_shadow', tx: 22.5, ty: 30.5 }
            ]
        }, 'x');
    }

    // 6. DEATH MOUNTAIN TRAIL (c7_trail)
    function buildTrail() {
        const g = makeBaseGrid(706);
        const props = [
            { k: 'shrine', x: 33, y: 8, w: 2, h: 2 },
            { k: 'fairy_fountain', x: 34, y: 22, w: 3, h: 2 },
            { k: 'gossip_stone', x: 9, y: 15, w: 2, h: 2 }
        ];
        clear(g, props, '=');
        put(g, [12, 12, 32, 26], 'C');
        return finalizeMap({
            _grid: g, ground: 'volcano', art: 1, music: 'c7_goron', song: 'c7_goron', atmo: 'ember',
            spawn: [22.5, 30.5], tier: 9, props,
            npcs: [
                { id: 'biggoron', x: 31.5, y: 10.5 },
                { id: 'great_fairy', x: 32.5, y: 23.5 }
            ],
            foes: [
                { t: 'tektite', x: 14.5, y: 13.5 },
                { t: 'dodongo', x: 14.5, y: 22.5 },
                { t: 'beamos', x: 28.5, y: 18.5 },
                { t: 'tektite', x: 29.5, y: 25.5 }
            ],
            questSpots: [[8.5, 16.5], [33.5, 10.5], [14.5, 16.5]],
            exits: [
                { x: 21, y: 33, w: 4, h: 1, to: 'c7_kakariko', tx: 22.5, ty: 3.5 },
                { x: 21, y: 0, w: 4, h: 1, to: 'c7_goron', tx: 22.5, ty: 30.5 },
                { x: 0, y: 16, w: 1, h: 3, to: 'c7_d2_dodongo', tx: 22.5, ty: 30.5 }
            ]
        }, '=');
    }

    // 7. GORON CITY & VOLCANIC CRATER (c7_goron)
    function buildGoron() {
        const g = makeBaseGrid(707);
        rect(g, 10, 4, 35, 9, '~');
        rect(g, 20, 2, 25, 11, 'w');
        const props = [
            { k: 'triforce_pad', x: 22, y: 19, w: 2, h: 1, song: 'saria_song' },
            { k: 'triforce_pad', x: 22, y: 7, w: 2, h: 1, song: 'bolero_fire' },
            { k: 'shrine', x: 31, y: 18, w: 2, h: 2 }
        ];
        clear(g, props, 'x');
        rect(g, 20, 2, 25, 11, 'w');
        put(g, [14, 14, 31, 14, 14, 24, 31, 24], 'L');
        put(g, [11, 24, 34, 24], 'C');
        return finalizeMap({
            _grid: g, ground: 'volcano', art: 1, music: 'c7_goron', song: 'c7_goron', atmo: 'ember',
            spawn: [22.5, 30.5], tier: 9, props,
            npcs: [
                { id: 'darunia', x: 22.5, y: 17.5 },
                { id: 'sheik', x: 22.5, y: 10.5 },
                { id: 'kokiri_tailor', x: 14.5, y: 20.5 }
            ],
            foes: [
                { t: 'fire_keese', x: 13.5, y: 12.5 },
                { t: 'dodongo', x: 32.5, y: 13.5 },
                { t: 'lizalfos', x: 16.5, y: 25.5 }
            ],
            questSpots: [[22.5, 19.5], [31.5, 19.5], [22.5, 7.5]],
            exits: [
                { x: 21, y: 33, w: 4, h: 1, to: 'c7_trail', tx: 22.5, ty: 3.5 },
                { x: 21, y: 0, w: 4, h: 1, to: 'c7_t2_fire', tx: 22.5, ty: 30.5 }
            ]
        }, 'x');
    }

    // 8. ZORA'S RIVER (c7_river)
    function buildRiver() {
        const g = makeBaseGrid(708);
        rect(g, 4, 13, 41, 15, '~');
        rect(g, 19, 12, 26, 19, 'w');
        rect(g, 1, 16, 44, 18, '=');
        const props = [
            { k: 'triforce_pad', x: 38, y: 16, w: 2, h: 1, song: 'zelda_lullaby' },
            { k: 'gossip_stone', x: 22, y: 9, w: 2, h: 2 }
        ];
        clear(g, props, '=');
        put(g, [10, 26, 35, 26], 'C');
        return finalizeMap({
            _grid: g, ground: 'water', art: 1, music: 'c7_zora', song: 'c7_zora', atmo: 'mist',
            spawn: [4.5, 17.5], tier: 9, props,
            npcs: [
                { id: 'kaepora', x: 18.5, y: 17.5 }
            ],
            foes: [
                { t: 'octorok', x: 14.5, y: 22.5 },
                { t: 'tektite', x: 28.5, y: 22.5 },
                { t: 'octorok', x: 32.5, y: 11.5 }
            ],
            questSpots: [[38.5, 16.5], [22.5, 11.5]],
            exits: [
                { x: 0, y: 16, w: 1, h: 3, to: 'c7_field', tx: 41.5, ty: 9.5 },
                { x: 45, y: 16, w: 1, h: 3, to: 'c7_zora', tx: 4.5, ty: 17.5 }
            ]
        }, '=');
    }

    // 9. ZORA'S DOMAIN & SACRED FOUNTAIN (c7_zora)
    function buildZora() {
        const g = makeBaseGrid(709);
        const props = [
            { k: 'fairy_fountain', x: 21, y: 22, w: 3, h: 2 },
            { k: 'shrine', x: 36, y: 15, w: 2, h: 2 },
            { k: 'shrine', x: 22, y: 5, w: 2, h: 2 }
        ];
        clear(g, props, 'x');
        put(g, [15, 12, 30, 12, 15, 24, 30, 24], 'L');
        put(g, [10, 10, 22, 8], 'C');
        return finalizeMap({
            _grid: g, ground: 'water', art: 1, music: 'c7_zora', song: 'c7_zora', atmo: 'mist',
            spawn: [4.5, 17.5], tier: 9, props,
            npcs: [
                { id: 'king_zora', x: 22.5, y: 13.5 },
                { id: 'ruto', x: 26.5, y: 16.5 },
                { id: 'kokiri_tailor', x: 15.5, y: 20.5 }
            ],
            foes: [
                { t: 'freezard', x: 15.5, y: 9.5 },
                { t: 'freezard', x: 30.5, y: 9.5 },
                { t: 'octorok', x: 31.5, y: 25.5 }
            ],
            questSpots: [[22.5, 23.5], [36.5, 16.5], [22.5, 7.5]],
            exits: [
                { x: 0, y: 16, w: 1, h: 3, to: 'c7_river', tx: 41.5, ty: 17.5 },
                { x: 45, y: 16, w: 1, h: 3, to: 'c7_d3_jabu', tx: 22.5, ty: 30.5 }
            ]
        }, 'x');
    }

    // 10. LAKE HYLIA (c7_lake)
    function buildLake() {
        const g = makeBaseGrid(710);
        rect(g, 6, 12, 18, 24, '~');
        rect(g, 28, 12, 39, 24, '~');
        rect(g, 19, 4, 26, 30, 'w');
        rect(g, 15, 14, 30, 22, 'x');
        const props = [
            { k: 'triforce_pad', x: 22, y: 20, w: 2, h: 1, song: 'serenade_water' },
            { k: 'shrine', x: 22, y: 13, w: 2, h: 2 },
            { k: 'house', x: 10, y: 6, w: 4, h: 3, roof: 'blue' }
        ];
        clear(g, props, 'x');
        put(g, [16, 18, 29, 18], 'C');
        return finalizeMap({
            _grid: g, ground: 'water', art: 1, music: 'c7_zora', song: 'c7_zora', atmo: 'mist',
            spawn: [22.5, 4.5], tier: 9, props,
            npcs: [
                { id: 'ruto', x: 20.5, y: 18.5 },
                { id: 'sheik', x: 25.5, y: 18.5 },
                { id: 'lake_scientist', x: 12.5, y: 9.8 }
            ],
            foes: [
                { t: 'tektite', x: 16.5, y: 15.5 },
                { t: 'octorok', x: 29.5, y: 15.5 },
                { t: 'stinger', x: 22.5, y: 26.5 }
            ],
            questSpots: [[16.5, 18.5], [22.5, 20.5], [22.5, 14.5]],
            exits: [
                { x: 21, y: 0, w: 4, h: 1, to: 'c7_field', tx: 22.5, ty: 30.5 },
                { x: 21, y: 33, w: 4, h: 1, to: 'c7_t3_water', tx: 22.5, ty: 30.5 }
            ]
        }, 'x');
    }

    // 11. GERUDO VALLEY & FORTRESS (c7_gerudo)
    function buildGerudo() {
        const g = makeBaseGrid(711);
        rect(g, 20, 4, 25, 30, 'w');
        const props = [
            { k: 'house', x: 9, y: 10, w: 5, h: 3, roof: 'red' },
            { k: 'shrine', x: 11, y: 24, w: 2, h: 2 }
        ];
        clear(g, props, '=');
        put(g, [12, 14, 34, 24], 'C');
        return finalizeMap({
            _grid: g, ground: 'desert', art: 1, music: 'c7_gerudo', song: 'c7_gerudo', atmo: 'sand',
            spawn: [41.5, 17.5], tier: 9, props,
            npcs: [
                { id: 'gerudo_capt', x: 14.5, y: 16.5 },
                { id: 'nabooru', x: 10.5, y: 17.5 }
            ],
            foes: [
                { t: 'gerudo_thief', x: 15.5, y: 13.5 },
                { t: 'gerudo_thief', x: 15.5, y: 21.5 },
                { t: 'lizalfos', x: 32.5, y: 15.5 }
            ],
            questSpots: [[22.5, 17.5], [12.5, 14.5], [11.5, 25.5]],
            exits: [
                { x: 45, y: 16, w: 1, h: 3, to: 'c7_field', tx: 4.5, ty: 17.5 },
                { x: 0, y: 16, w: 1, h: 3, to: 'c7_desert', tx: 41.5, ty: 17.5 }
            ]
        }, '=');
    }

    // 12. HAUNTED WASTELAND & DESERT COLOSSUS (c7_desert)
    function buildDesert() {
        const g = makeBaseGrid(712);
        const props = [
            { k: 'temple', x: 4, y: 12, w: 6, h: 4, c: 'spirit' },
            { k: 'triforce_pad', x: 12, y: 16, w: 2, h: 1, song: 'requiem_spirit' },
            { k: 'gossip_stone', x: 26, y: 16, w: 2, h: 2 },
            { k: 'fairy_fountain', x: 21, y: 6, w: 3, h: 2 }
        ];
        clear(g, props, '=');
        put(g, [22, 9, 34, 25], 'C');
        return finalizeMap({
            _grid: g, ground: 'desert', art: 1, music: 'c7_gerudo', song: 'c7_gerudo', atmo: 'sand',
            spawn: [41.5, 17.5], tier: 9, props,
            npcs: [
                { id: 'sheik', x: 14.5, y: 15.5 },
                { id: 'nabooru', x: 11.5, y: 19.5 },
                { id: 'great_fairy', x: 22.5, y: 9.5 }
            ],
            foes: [
                { t: 'leever', x: 30.5, y: 14.5 },
                { t: 'leever', x: 24.5, y: 23.5 },
                { t: 'anubis', x: 18.5, y: 13.5 }
            ],
            questSpots: [[26.5, 17.5], [12.5, 16.5], [22.5, 8.5]],
            exits: [
                { x: 45, y: 16, w: 1, h: 3, to: 'c7_gerudo', tx: 4.5, ty: 17.5 },
                { x: 0, y: 16, w: 1, h: 3, to: 'c7_t5_spirit', tx: 22.5, ty: 30.5 }
            ]
        }, '=');
    }

    // HELPER FOR TEMPLE & DUNGEON MAPS (c7_d1..d3, c7_t1..t7)
    function buildDungeonMap(opts) {
        const g = grid(W, H, 'x');
        box(g, 0, 0, W - 1, H - 1, '^');
        rect(g, 1, 1, W - 2, 1, '#');
        rect(g, 8, 5, 37, 29, 'x');
        rect(g, 20, 3, 25, 32, '=');
        rect(g, 8, 16, 37, 19, '=');
        const props = (opts.props || []).concat([
            { k: 'shrine', x: 22, y: 6, w: 2, h: 2 }
        ]);
        clear(g, props, 'x');
        put(g, [14, 8, 31, 8, 14, 24, 31, 24], 'L');
        put(g, [11, 17, 34, 17], 'C');
        put(g, [18, 26, 27, 26], 'p');
        const exits = [
            { x: 21, y: 33, w: 4, h: 1, to: opts.back, tx: opts.bx, ty: opts.by }
        ];
        if (opts.northTo) {
            exits.push({ x: 21, y: 0, w: 4, h: 1, to: opts.northTo, tx: 22.5, ty: 30.5 });
        }
        return finalizeMap({
            _grid: g,
            ground: opts.ground || 'dungeon',
            art: 1,
            music: opts.music || 'c7_dungeon',
            song: opts.music || 'c7_dungeon',
            atmo: opts.atmo || 'dungeon',
            spawn: [22.5, 30.5],
            tier: 9,
            boss: opts.boss ? { t: opts.boss, x: 22.5, y: 10.5, flag: 'c7_' + opts.boss } : undefined,
            props,
            npcs: opts.npcs || [],
            foes: opts.foes || [],
            questSpots: opts.spots || [[11.5, 17.5], [22.5, 18.5], [34.5, 17.5], [22.5, 8.5]],
            exits
        }, 'x');
    }

    const OUT = {
        c7_kokiri: buildKokiri(),
        c7_field: buildField(),
        c7_ranch: buildRanch(),
        c7_castle: buildCastle(),
        c7_kakariko: buildKakariko(),
        c7_trail: buildTrail(),
        c7_goron: buildGoron(),
        c7_river: buildRiver(),
        c7_zora: buildZora(),
        c7_lake: buildLake(),
        c7_gerudo: buildGerudo(),
        c7_desert: buildDesert(),

        c7_d1_deku: buildDungeonMap({
            ground: 'kokiri', back: 'c7_kokiri', bx: 41.5, by: 17.5, boss: 'gohma',
            foes: [
                { t: 'deku_baba', x: 14.5, y: 22.5 },
                { t: 'skullwalltula', x: 31.5, y: 22.5 },
                { t: 'gohma_larva', x: 16.5, y: 13.5 },
                { t: 'gohma_larva', x: 29.5, y: 13.5 }
            ]
        }),

        c7_d2_dodongo: buildDungeonMap({
            ground: 'volcano', back: 'c7_trail', bx: 4.5, by: 17.5, boss: 'king_dodongo',
            foes: [
                { t: 'dodongo', x: 14.5, y: 22.5 },
                { t: 'lizalfos', x: 31.5, y: 22.5 },
                { t: 'lizalfos', x: 16.5, y: 13.5 },
                { t: 'beamos', x: 29.5, y: 13.5 }
            ]
        }),

        c7_d3_jabu: buildDungeonMap({
            ground: 'water', back: 'c7_zora', bx: 41.5, by: 17.5, boss: 'barinade',
            npcs: [{ id: 'ruto', x: 22.5, y: 24.5 }],
            foes: [
                { t: 'biri', x: 14.5, y: 22.5 },
                { t: 'stinger', x: 31.5, y: 22.5 },
                { t: 'octo_big', x: 16.5, y: 13.5 },
                { t: 'biri', x: 29.5, y: 13.5 }
            ]
        }),

        c7_t1_forest: buildDungeonMap({
            ground: 'kokiri', back: 'c7_kokiri', bx: 22.5, by: 4.5, boss: 'phantom_ganon',
            npcs: [{ id: 'saria', x: 22.5, y: 26.5 }],
            foes: [
                { t: 'stalfos', x: 14.5, y: 22.5 },
                { t: 'poe_sister', x: 31.5, y: 22.5 },
                { t: 'stalfos', x: 16.5, y: 13.5 },
                { t: 'floormaster', x: 29.5, y: 13.5 }
            ]
        }),

        c7_t2_fire: buildDungeonMap({
            ground: 'volcano', back: 'c7_goron', bx: 22.5, by: 4.5, boss: 'volvagia',
            npcs: [{ id: 'darunia', x: 22.5, y: 26.5 }],
            foes: [
                { t: 'flare_dancer', x: 14.5, y: 22.5 },
                { t: 'fire_keese', x: 31.5, y: 22.5 },
                { t: 'flare_dancer', x: 16.5, y: 13.5 },
                { t: 'dodongo', x: 29.5, y: 13.5 }
            ]
        }),

        c7_t3_water: buildDungeonMap({
            ground: 'water', back: 'c7_lake', bx: 22.5, by: 29.5, boss: 'morpha',
            props: [{ k: 'triforce_pad', x: 22, y: 18, w: 2, h: 1, song: 'zelda_lullaby' }],
            npcs: [{ id: 'ruto', x: 22.5, y: 26.5 }],
            foes: [
                { t: 'dark_link', x: 15.5, y: 17.5 },
                { t: 'shell_blade', x: 31.5, y: 22.5 },
                { t: 'stinger', x: 16.5, y: 13.5 },
                { t: 'shell_blade', x: 29.5, y: 13.5 }
            ]
        }),

        c7_t4_shadow: buildDungeonMap({
            ground: 'shadow', back: 'c7_kakariko', bx: 41.5, by: 17.5, boss: 'bongo_bongo',
            props: [{ k: 'triforce_pad', x: 33, y: 17, w: 2, h: 1, song: 'zelda_lullaby' }],
            npcs: [{ id: 'impa', x: 22.5, y: 26.5 }],
            foes: [
                { t: 'dead_hand', x: 14.5, y: 22.5 },
                { t: 'redead', x: 31.5, y: 22.5 },
                { t: 'gibdo', x: 16.5, y: 13.5 },
                { t: 'floormaster', x: 29.5, y: 13.5 }
            ]
        }),

        c7_t5_spirit: buildDungeonMap({
            ground: 'desert', back: 'c7_desert', bx: 4.5, by: 17.5, boss: 'twinrova',
            npcs: [{ id: 'nabooru', x: 22.5, y: 26.5 }],
            foes: [
                { t: 'iron_knuckle', x: 14.5, y: 22.5 },
                { t: 'iron_knuckle', x: 31.5, y: 22.5 },
                { t: 'anubis', x: 16.5, y: 13.5 },
                { t: 'anubis', x: 29.5, y: 13.5 }
            ]
        }),

        c7_t6_castle: buildDungeonMap({
            ground: 'dungeon', music: 'c7_boss', back: 'c7_castle', bx: 41.5, by: 17.5, northTo: 'c7_t7_tower',
            npcs: [{ id: 'rauru', x: 22.5, y: 26.5 }],
            foes: [
                { t: 'iron_knuckle', x: 14.5, y: 22.5 },
                { t: 'dinolfos', x: 31.5, y: 22.5 },
                { t: 'stalfos', x: 16.5, y: 13.5 },
                { t: 'iron_knuckle', x: 29.5, y: 13.5 }
            ]
        }),

        c7_t7_tower: buildDungeonMap({
            ground: 'shadow', music: 'c7_boss', back: 'c7_t6_castle', bx: 22.5, by: 6.5, boss: 'ganondorf',
            props: [{ k: 'triforce_pad', x: 22, y: 18, w: 2, h: 1, song: 'prelude_light' }],
            npcs: [{ id: 'zelda', x: 22.5, y: 26.5 }],
            foes: [
                { t: 'iron_knuckle', x: 14.5, y: 22.5 },
                { t: 'dinolfos', x: 31.5, y: 22.5 }
            ]
        })
    };
    // Ensure every exit landing coordinate (tx, ty) is 100% walkable on its destination map
    for (const k of Object.keys(OUT)) {
        for (const e of OUT[k].exits || []) {
            const dst = OUT[e.to];
            if (dst && dst.rows && e.tx != null && e.ty != null) {
                const g = dst.rows.map(r => r.split(''));
                unblockPt(g, e.tx, e.ty, '=');
                dst.rows = g.map(r => r.join(''));
            }
        }
    }
    return OUT;
})();
