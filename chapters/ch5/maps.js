/* Hollowmere, Chapter 5: The Blood Kingdoms.
 * Seven major playable kingdoms across the cursed gothic realm:
 * 1. c5_village   — Blackthorn Village & Dracula's Dominion Hub
 * 2. c5_dracula   — Castle Dracula & Bloodmoon Peaks (Boss: Dracula)
 * 3. c5_nosferatu — Nosferatu's Wasteland & Plague Tower (Boss: Count Orlok)
 * 4. c5_brides    — The Brides' Domain & Widow's Forest (Bosses: Verona, Marishka, Aleera)
 * 5. c5_crimson   — The Crimson Empire & Scarlet City (Boss: The Blood Queen)
 * 6. c5_shadow    — The Shadow Principality & Ravenport (Boss: Lord Ruthven)
 * 7. c5_undying   — The Undying Kingdom & Necropolis (Boss: The Undying King)
 * 8. c5_carmilla  — Carmilla's Court & Blood Cathedral (Ultimate Boss: Queen Carmilla) */
window.HM_C5_MAPS = (function () {
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

    /* ---------------- 1. Blackthorn Village (Hub) ---------------- */
    function village() {
        const g = grid(46, 32, '.');
        box(g, 0, 0, 45, 31, '^');
        rect(g, 1, 1, 44, 1, '#');                                      // Northern palisade to Castle Dracula
        rect(g, 21, 0, 22, 0, '='); rect(g, 21, 1, 22, 1, 'q');        // Gate to Castle Dracula (q -> open.dracula)
        rect(g, 21, 2, 22, 30, '=');                                    // Blackthorn High Road
        rect(g, 0, 15, 1, 16, '=');                                     // West road to Nosferatu's Wasteland
        rect(g, 44, 15, 45, 16, '=');                                   // East road to Brides & Shadow realms
        rect(g, 21, 30, 22, 30, 'g'); rect(g, 21, 31, 22, 31, '=');    // South gate to Crimson & Undying
        rect(g, 15, 8, 29, 20, 'x');                                    // Cobblestone village square
        rect(g, 4, 6, 12, 12, 'x');                                     // Churchyard sanctuary
        rect(g, 1, 26, 18, 30, '~'); rect(g, 25, 26, 44, 30, '~');      // Blackthorn River
        rect(g, 20, 25, 24, 29, 'w');                                   // Stone bridge
        const props = [
            { k: 'house', x: 3, y: 3, w: 6, h: 3, roof: 'slate', kind: 'church' },
            { k: 'house', x: 34, y: 3, w: 5, h: 3, roof: 'red', kind: 'inn' },
            { k: 'house', x: 2, y: 16, w: 6, h: 3, roof: 'slate', kind: 'smith' },
            { k: 'house', x: 31, y: 16, w: 5, h: 3, roof: 'green', kind: 'shop' },
            { k: 'shrine', x: 8, y: 9, w: 2, h: 2, n: 1 },
            { k: 'altar', x: 36, y: 18, w: 2, h: 2, n: 1 },
            { k: 'coffin', x: 10, y: 7, w: 1, h: 1 },
            { k: 'tomb', x: 5, y: 10, w: 1, h: 1 }, { k: 'tomb', x: 12, y: 10, w: 1, h: 1 },
            { k: 'pyre', x: 24, y: 8, w: 2, h: 2 },
            { k: 'well', x: 17, y: 16, w: 1, h: 1 },
            { k: 'wagon', x: 14, y: 22, w: 2, h: 1 },
            { k: 'banner', x: 19, y: 2, w: 1, h: 1, c: 'gothic' }, { k: 'banner', x: 24, y: 2, w: 1, h: 1, c: 'gothic' }
        ];
        scatter(g, 1, 2, 44, 24, 'T', 0.04, 3); scatter(g, 1, 2, 44, 24, 'F', 0.06, 5); scatter(g, 1, 2, 44, 24, 'k', 0.03, 7);
        clear(g, props);
        rect(g, 15, 8, 29, 20, 'x'); rect(g, 21, 2, 22, 29, '='); rect(g, 21, 30, 22, 30, 'g');
        rect(g, 4, 6, 12, 12, 'x'); rect(g, 20, 25, 24, 29, 'w');
        unblock(g, [[22.5, 14.6, 'x'], [18.5, 11.5, 'x'], [26.5, 11.5, 'x'], [8.5, 9.5, 'x'], [36.5, 18.5, 'x'], [22.5, 25.5, 'w']]);
        put(g, [8, 7, 35, 7, 7, 23, 41, 12], 'p'); put(g, [42, 2, 2, 12], 'C'); put(g, [18, 8, 25, 8, 18, 19, 25, 19], 'L');
        return {
            ground: 'gothic', art: 1, music: 'c5_theme', atmo: 'fog', spawn: [22.5, 25.5], tier: 6,
            rows: rows(g), props,
            npcs: [
                { id: 'alucard', x: 22.5, y: 14.6 },
                { id: 'mina', x: 18.5, y: 11.5 },
                { id: 'jonathan', x: 26.5, y: 11.5 },
                { id: 'tobin', x: 5.5, y: 19.7 },
                { id: 'hana', x: 33.5, y: 19.7 },
                { id: 'salladhor', x: 23.5, y: 25.8 }
            ],
            foes: [
                { t: 'blood_bat', x: 36, y: 11 }, { t: 'blood_bat', x: 40, y: 12 }, { t: 'vampire_thrall', x: 42, y: 10 },
                { t: 'vampire_thrall', x: 38, y: 21 }, { t: 'blood_bat', x: 9, y: 22 }, { t: 'vampire_thrall', x: 6, y: 21 }
            ],
            exits: [
                { x: 21, y: 0, w: 2, h: 1, to: 'c5_dracula', tx: 22.5, ty: 28.5 },
                { x: 0, y: 15, w: 1, h: 2, to: 'c5_nosferatu', tx: 43.5, ty: 15.5 },
                { x: 45, y: 15, w: 1, h: 2, to: 'c5_brides', tx: 2.5, ty: 15.5 },
                { x: 21, y: 31, w: 2, h: 1, to: 'c5_crimson', tx: 22.5, ty: 2.5 }
            ]
        };
    }

    /* ---------------- 2. Castle Dracula & Bloodmoon Peaks ---------------- */
    function dracula() {
        const g = grid(48, 34, '.');
        box(g, 0, 0, 47, 33, '^');
        rect(g, 21, 33, 23, 33, '='); rect(g, 21, 32, 23, 32, 'g');    // South entrance from village
        rect(g, 21, 15, 23, 31, '=');                                   // Obsidian grand causeway
        rect(g, 10, 5, 36, 17, 'x');                                    // Dracula's black marble throne hall
        rect(g, 3, 10, 9, 24, 'd'); rect(g, 37, 10, 44, 24, 'd');       // Gargoyle parapets and ancient crypts
        const props = [
            { k: 'throne', x: 22, y: 6, w: 3, h: 2, c: 'dracula' },
            { k: 'coffin', x: 15, y: 7, w: 1, h: 1 }, { k: 'coffin', x: 31, y: 7, w: 1, h: 1 },
            { k: 'crystal', x: 13, y: 10, w: 1, h: 1, n: 1 }, { k: 'crystal', x: 33, y: 10, w: 1, h: 1, n: 2 },
            { k: 'altar', x: 22, y: 18, w: 2, h: 2, n: 2 },
            { k: 'gargoyle', x: 18, y: 12, w: 1, h: 1 }, { k: 'gargoyle', x: 28, y: 12, w: 1, h: 1 },
            { k: 'gargoyle', x: 6, y: 8, w: 1, h: 1 }, { k: 'gargoyle', x: 40, y: 8, w: 1, h: 1 },
            { k: 'banner', x: 19, y: 5, w: 1, h: 1, c: 'dracula' }, { k: 'banner', x: 27, y: 5, w: 1, h: 1, c: 'dracula' }
        ];
        clear(g, props, 'x');
        rect(g, 10, 5, 36, 17, 'x'); rect(g, 21, 15, 23, 31, '=');
        unblock(g, [[23.5, 12.5, 'x'], [13.5, 10.5, 'x'], [33.5, 10.5, 'x'], [22.5, 28.5, '=']]);
        put(g, [11, 7, 35, 7, 11, 15, 35, 15, 20, 24, 26, 24], 'L');
        put(g, [5, 20, 42, 20], 'C'); put(g, [16, 20, 30, 20], 'p');
        return {
            ground: 'gothic', art: 1, music: 'c5_theme', atmo: 'bloodmoon', spawn: [22.5, 28.5], tier: 6, bossSong: 'c5_battle',
            rows: rows(g), props,
            npcs: [],
            foes: [
                { t: 'vampire_knight', x: 16, y: 14 }, { t: 'vampire_knight', x: 30, y: 14 },
                { t: 'blood_bat', x: 14, y: 22 }, { t: 'blood_bat', x: 32, y: 22 },
                { t: 'blood_wolf', x: 6, y: 16 }, { t: 'blood_wolf', x: 40, y: 16 },
                { t: 'dracula', x: 23.5, y: 12.5, boss: true }
            ],
            exits: [
                { x: 21, y: 33, w: 2, h: 1, to: 'c5_village', tx: 22.5, ty: 2.5 }
            ]
        };
    }

    /* ---------------- 3. Nosferatu's Wasteland & Tower ---------------- */
    function nosferatu() {
        const g = grid(48, 34, '.');
        box(g, 0, 0, 47, 33, '^');
        rect(g, 47, 15, 47, 16, '=');                                   // East exit back to Blackthorn
        rect(g, 2, 15, 46, 16, '=');                                    // Decaying wasteland road
        rect(g, 13, 4, 33, 14, 'd');                                    // Orlok's ruined plague tower base
        rect(g, 4, 8, 11, 26, 'd'); rect(g, 35, 8, 43, 26, 'd');       // Hollow crypts and deadwood
        rect(g, 1, 28, 46, 32, '~');                                    // Stagnant toxic marsh
        const props = [
            { k: 'ruin', x: 14, y: 5, w: 4, h: 3 }, { k: 'ruin', x: 28, y: 5, w: 4, h: 3 },
            { k: 'cauldron', x: 8, y: 12, w: 1, h: 1, n: 1 },
            { k: 'cauldron', x: 37, y: 11, w: 1, h: 1, n: 2 },
            { k: 'cauldron', x: 14, y: 23, w: 1, h: 1, n: 3 },
            { k: 'tomb', x: 7, y: 15, w: 1, h: 1 }, { k: 'tomb', x: 39, y: 15, w: 1, h: 1 },
            { k: 'coffin', x: 23, y: 7, w: 1, h: 1 },
            { k: 'shrine', x: 23, y: 22, w: 2, h: 2, n: 2 }
        ];
        scatter(g, 1, 1, 45, 27, 'T', 0.08, 13); scatter(g, 1, 1, 45, 27, 'k', 0.05, 17);
        clear(g, props, 'd');
        rect(g, 2, 15, 46, 16, '='); rect(g, 13, 4, 33, 14, 'd');
        unblock(g, [[23.5, 8.5, 'd'], [8.5, 12.5, 'd'], [37.5, 11.5, 'd'], [14.5, 23.5, 'd'], [43.5, 15.5, '=']]);
        put(g, [14, 6, 32, 6, 18, 15, 28, 15], 'L');
        put(g, [6, 22, 40, 22], 'C'); put(g, [10, 18, 36, 18], 'p');
        return {
            ground: 'plague', art: 1, music: 'c5_dungeon', atmo: 'plague_fog', spawn: [43.5, 15.5], tier: 6, bossSong: 'c5_battle',
            rows: rows(g), props,
            npcs: [],
            foes: [
                { t: 'plague_rat', x: 12, y: 18 }, { t: 'plague_rat', x: 15, y: 19 },
                { t: 'rotting_ghoul', x: 32, y: 18 }, { t: 'rotting_ghoul', x: 35, y: 21 },
                { t: 'night_stalker', x: 18, y: 10 }, { t: 'night_stalker', x: 28, y: 10 },
                { t: 'orlok', x: 23.5, y: 8.5, boss: true }
            ],
            exits: [
                { x: 47, y: 15, w: 1, h: 2, to: 'c5_village', tx: 2.5, ty: 15.5 }
            ]
        };
    }

    /* ---------------- 4. The Brides' Domain & Widow's Forest ---------------- */
    function brides() {
        const g = grid(48, 34, '.');
        box(g, 0, 0, 47, 33, '^');
        rect(g, 0, 15, 1, 16, '=');                                     // West exit to Blackthorn
        rect(g, 2, 15, 44, 16, '=');                                    // Foggy woodland path
        rect(g, 12, 5, 34, 15, 'x');                                    // Three Sisters' Castle courtyard
        rect(g, 10, 20, 20, 27, 'x');                                   // Hunter's Lodge clearing
        const props = [
            { k: 'house', x: 12, y: 21, w: 6, h: 3, roof: 'green', kind: 'hunter' },
            { k: 'ruin', x: 14, y: 6, w: 5, h: 3 }, { k: 'ruin', x: 27, y: 6, w: 5, h: 3 },
            { k: 'crystal', x: 16, y: 10, w: 1, h: 1, n: 3 }, { k: 'crystal', x: 30, y: 10, w: 1, h: 1, n: 4 },
            { k: 'shrine', x: 38, y: 22, w: 2, h: 2, n: 3 },
            { k: 'pyre', x: 19, y: 23, w: 2, h: 2 }
        ];
        scatter(g, 1, 1, 45, 30, 'T', 0.12, 23); scatter(g, 1, 1, 45, 30, 'F', 0.08, 29);
        clear(g, props, 'x');
        rect(g, 2, 15, 44, 16, '='); rect(g, 12, 5, 34, 15, 'x'); rect(g, 10, 20, 20, 27, 'x');
        unblock(g, [[23.5, 9.5, 'x'], [15.5, 23.5, 'x'], [2.5, 15.5, '=']]);
        put(g, [13, 8, 33, 8, 17, 15, 29, 15], 'L');
        put(g, [8, 24, 40, 24], 'C'); put(g, [18, 18, 28, 18], 'p');
        return {
            ground: 'gothic', art: 1, music: 'c5_theme', atmo: 'leaves', spawn: [2.5, 15.5], tier: 6, bossSong: 'c5_battle',
            rows: rows(g), props,
            npcs: [
                { id: 'vanhelsing', x: 15.5, y: 23.5 }
            ],
            foes: [
                { t: 'blood_wolf', x: 26, y: 18 }, { t: 'blood_wolf', x: 32, y: 19 },
                { t: 'blood_bat', x: 18, y: 12 }, { t: 'blood_bat', x: 28, y: 12 },
                { t: 'bride_crimson', x: 23.5, y: 9.5, boss: true },
                { t: 'bride_shadow', x: 18.5, y: 9.5, boss: true },
                { t: 'bride_frost', x: 28.5, y: 9.5, boss: true }
            ],
            exits: [
                { x: 0, y: 15, w: 1, h: 2, to: 'c5_village', tx: 43.5, ty: 15.5 }
            ]
        };
    }

    /* ---------------- 5. The Crimson Empire & Scarlet City ---------------- */
    function crimson() {
        const g = grid(48, 34, '.');
        box(g, 0, 0, 47, 33, '^');
        rect(g, 21, 0, 23, 0, '=');                                     // North exit to Blackthorn
        rect(g, 21, 1, 23, 26, '=');                                    // Grand Scarlet Boulevard
        rect(g, 10, 6, 36, 17, 'x');                                    // Queen Elizabeth's Blood Baths & Keep
        rect(g, 3, 12, 11, 25, 'd'); rect(g, 35, 12, 44, 25, 'd');      // Alchemist Quarter & distillation chambers
        rect(g, 1, 28, 46, 32, '~');                                    // Crimson Blood River
        const props = [
            { k: 'house', x: 4, y: 8, w: 5, h: 3, roof: 'red', kind: 'lab' },
            { k: 'house', x: 37, y: 8, w: 5, h: 3, roof: 'red', kind: 'lab' },
            { k: 'throne', x: 22, y: 7, w: 3, h: 2, c: 'crimson' },
            { k: 'fountain', x: 22, y: 14, w: 3, h: 2, c: 'blood' },
            { k: 'alembic', x: 9, y: 14, w: 1, h: 1, n: 1 },
            { k: 'alembic', x: 36, y: 13, w: 1, h: 1, n: 2 },
            { k: 'alembic', x: 17, y: 21, w: 1, h: 1, n: 3 },
            { k: 'altar', x: 30, y: 21, w: 2, h: 2, n: 3 },
            { k: 'banner', x: 17, y: 6, w: 1, h: 1, c: 'crimson' }, { k: 'banner', x: 29, y: 6, w: 1, h: 1, c: 'crimson' }
        ];
        clear(g, props, 'x');
        rect(g, 10, 6, 36, 17, 'x'); rect(g, 21, 1, 23, 26, '=');
        unblock(g, [[23.5, 10.5, 'x'], [9.5, 14.5, 'd'], [36.5, 13.5, 'd'], [17.5, 21.5, 'x'], [22.5, 2.5, '=']]);
        put(g, [13, 8, 33, 8, 18, 15, 28, 15], 'L');
        put(g, [5, 22, 41, 22], 'C'); put(g, [16, 19, 30, 19], 'p');
        return {
            ground: 'crimson', art: 1, music: 'c5_theme', atmo: 'blood_rain', spawn: [22.5, 2.5], tier: 6, bossSong: 'c5_battle',
            rows: rows(g), props,
            npcs: [],
            foes: [
                { t: 'blood_maiden', x: 17, y: 13 }, { t: 'blood_maiden', x: 29, y: 13 },
                { t: 'flesh_golem', x: 8, y: 18 }, { t: 'flesh_golem', x: 38, y: 18 },
                { t: 'blood_queen', x: 23.5, y: 10.5, boss: true }
            ],
            exits: [
                { x: 21, y: 0, w: 2, h: 1, to: 'c5_village', tx: 21.5, ty: 29.5 }
            ]
        };
    }

    /* ---------------- 6. The Shadow Principality & Ravenport ---------------- */
    function shadow() {
        const g = grid(48, 34, '.');
        box(g, 0, 0, 47, 33, '^');
        rect(g, 21, 33, 23, 33, '=');                                   // South exit back to Blackthorn
        rect(g, 21, 16, 23, 32, '=');                                   // Ravenport pier
        rect(g, 10, 5, 36, 16, 'x');                                    // Eternal Ballroom & Shadow Manor
        rect(g, 1, 27, 46, 31, '~');                                    // Fog-covered Ravenport bay
        const props = [
            { k: 'mirror', x: 10, y: 12, w: 1, h: 1, n: 1 },
            { k: 'mirror', x: 37, y: 12, w: 1, h: 1, n: 2 },
            { k: 'mirror', x: 23, y: 19, w: 1, h: 1, n: 3 },
            { k: 'shrine', x: 36, y: 7, w: 2, h: 2, n: 4 },
            { k: 'throne', x: 22, y: 6, w: 3, h: 2, c: 'shadow' },
            { k: 'banner', x: 18, y: 5, w: 1, h: 1, c: 'shadow' }, { k: 'banner', x: 28, y: 5, w: 1, h: 1, c: 'shadow' }
        ];
        clear(g, props, 'x');
        rect(g, 10, 5, 36, 16, 'x'); rect(g, 21, 16, 23, 32, '=');
        unblock(g, [[23.5, 9.5, 'x'], [10.5, 12.5, 'x'], [37.5, 12.5, 'x'], [23.5, 19.5, 'x'], [22.5, 29.5, '=']]);
        put(g, [12, 7, 34, 7, 17, 14, 29, 14], 'L');
        put(g, [6, 19, 40, 19], 'C'); put(g, [15, 17, 31, 17], 'p');
        return {
            ground: 'shadow', art: 1, music: 'c5_dungeon', atmo: 'shadow_mist', spawn: [22.5, 29.5], tier: 6, bossSong: 'c5_battle',
            rows: rows(g), props,
            npcs: [],
            foes: [
                { t: 'shadow_assassin', x: 15, y: 12 }, { t: 'shadow_assassin', x: 31, y: 12 },
                { t: 'vampire_knight', x: 18, y: 15 }, { t: 'vampire_knight', x: 28, y: 15 },
                { t: 'ruthven', x: 23.5, y: 9.5, boss: true }
            ],
            exits: [
                { x: 21, y: 33, w: 2, h: 1, to: 'c5_village', tx: 22.5, ty: 25.5 }
            ]
        };
    }

    /* ---------------- 7. The Undying Kingdom & Necropolis ---------------- */
    function undying() {
        const g = grid(48, 34, '.');
        box(g, 0, 0, 47, 33, '^');
        rect(g, 21, 33, 23, 33, '=');                                   // South exit
        rect(g, 21, 17, 23, 32, '=');                                   // Bone-strewn causeway
        rect(g, 10, 4, 36, 16, 'd');                                    // Necropolis grand crypt & throne
        rect(g, 4, 18, 18, 26, 'd'); rect(g, 28, 18, 42, 26, 'd');      // Gravefall barricades & bonefields
        const props = [
            { k: 'throne', x: 22, y: 6, w: 3, h: 2, c: 'bone' },
            { k: 'tomb', x: 14, y: 8, w: 1, h: 1 }, { k: 'tomb', x: 32, y: 8, w: 1, h: 1 },
            { k: 'coffin', x: 18, y: 10, w: 1, h: 1 }, { k: 'coffin', x: 28, y: 10, w: 1, h: 1 },
            { k: 'crystal', x: 12, y: 14, w: 1, h: 1, n: 5 }, { k: 'crystal', x: 34, y: 14, w: 1, h: 1, n: 6 },
            { k: 'altar', x: 22, y: 20, w: 2, h: 2, n: 4 }
        ];
        scatter(g, 1, 1, 45, 27, 'k', 0.1, 31); scatter(g, 1, 1, 45, 27, 'T', 0.05, 37);
        clear(g, props, 'd');
        rect(g, 10, 4, 36, 16, 'd'); rect(g, 21, 17, 23, 32, '=');
        unblock(g, [[23.5, 9.5, 'd'], [22.5, 22.5, 'd'], [22.5, 29.5, '=']]);
        put(g, [12, 6, 34, 6, 16, 15, 30, 15], 'L');
        put(g, [6, 23, 40, 23], 'C'); put(g, [15, 20, 31, 20], 'p');
        return {
            ground: 'undead', art: 1, music: 'c5_dungeon', atmo: 'plague_fog', spawn: [22.5, 29.5], tier: 6, bossSong: 'c5_battle',
            rows: rows(g), props,
            npcs: [],
            foes: [
                { t: 'undead_walker', x: 16, y: 22 }, { t: 'undead_walker', x: 28, y: 22 },
                { t: 'undead_runner', x: 14, y: 24 }, { t: 'undead_runner', x: 30, y: 24 },
                { t: 'bone_archer', x: 8, y: 20 }, { t: 'bone_archer', x: 38, y: 20 },
                { t: 'undying_king', x: 23.5, y: 9.5, boss: true }
            ],
            exits: [
                { x: 21, y: 33, w: 2, h: 1, to: 'c5_village', tx: 22.5, ty: 25.5 }
            ]
        };
    }

    /* ---------------- 8. Carmilla's Court & Blood Cathedral ---------------- */
    function carmilla() {
        const g = grid(48, 34, '.');
        box(g, 0, 0, 47, 33, '^');
        rect(g, 21, 33, 23, 33, '=');                                   // South exit
        rect(g, 21, 17, 23, 32, '=');                                   // Crimson rose pathway
        rect(g, 8, 4, 38, 16, 'x');                                     // Grand Blood Cathedral
        rect(g, 4, 18, 18, 28, 'x'); rect(g, 28, 18, 42, 28, 'x');      // Crimson Gardens of Roseveil
        const props = [
            { k: 'throne', x: 22, y: 5, w: 3, h: 2, c: 'carmilla' },
            { k: 'shrine', x: 9, y: 19, w: 2, h: 2, n: 5 },
            { k: 'shrine', x: 37, y: 19, w: 2, h: 2, n: 6 },
            { k: 'shrine', x: 23, y: 23, w: 2, h: 2, n: 7 },
            { k: 'crystal', x: 16, y: 9, w: 1, h: 1, n: 7 },
            { k: 'crystal', x: 30, y: 9, w: 1, h: 1, n: 8 },
            { k: 'fountain', x: 12, y: 22, w: 3, h: 2, c: 'blood' },
            { k: 'fountain', x: 32, y: 22, w: 3, h: 2, c: 'blood' },
            { k: 'banner', x: 16, y: 5, w: 1, h: 1, c: 'carmilla' }, { k: 'banner', x: 30, y: 5, w: 1, h: 1, c: 'carmilla' }
        ];
        clear(g, props, 'x');
        rect(g, 8, 4, 38, 16, 'x'); rect(g, 21, 17, 23, 32, '=');
        unblock(g, [[23.5, 9.5, 'x'], [9.5, 19.5, 'x'], [37.5, 19.5, 'x'], [23.5, 23.5, 'x'], [22.5, 29.5, '=']]);
        put(g, [10, 6, 36, 6, 17, 14, 29, 14, 20, 24, 26, 24], 'L');
        put(g, [6, 25, 40, 25], 'C'); put(g, [15, 21, 31, 21], 'p');
        return {
            ground: 'crimson', art: 1, music: 'c5_battle', atmo: 'bloodmoon', spawn: [22.5, 29.5], tier: 6, bossSong: 'c5_battle',
            rows: rows(g), props,
            npcs: [],
            foes: [
                { t: 'blood_maiden', x: 14, y: 12 }, { t: 'blood_maiden', x: 32, y: 12 },
                { t: 'vampire_knight', x: 18, y: 13 }, { t: 'vampire_knight', x: 28, y: 13 },
                { t: 'carmilla', x: 23.5, y: 9.5, boss: true }
            ],
            exits: [
                { x: 21, y: 33, w: 2, h: 1, to: 'c5_village', tx: 22.5, ty: 25.5 }
            ]
        };
    }

    return {
        c5_village: village(),
        c5_dracula: dracula(),
        c5_nosferatu: nosferatu(),
        c5_brides: brides(),
        c5_crimson: crimson(),
        c5_shadow: shadow(),
        c5_undying: undying(),
        c5_carmilla: carmilla()
    };
})();

