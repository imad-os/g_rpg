/* Hollowmere, Chapter 5: The Blood Kingdoms.
 * Eight playable gothic horror zones across the Seven Vampire & Undead Kingdoms:
 * 1. c5_village   — Blackthorn Village (Dominion Hub)
 * 2. c5_dracula   — Castle Dracula & Bloodmoon Peaks
 * 3. c5_nosferatu — Nosferatu's Wasteland & Plague Tower
 * 4. c5_brides    — The Brides' Domain (Widow's Forest & Three Sisters' Castle)
 * 5. c5_crimson   — The Crimson Empire & Scarlet City
 * 6. c5_shadow    — The Shadow Principality (Ravenport & Eternal Ballroom)
 * 7. c5_undying   — The Undying Kingdom (Gravefall & Necropolis)
 * 8. c5_carmilla  — Carmilla's Court & The Blood Cathedral */
window.HM_C5_MAPS = (function () {
    'use strict';
    function grid(w, h, c) { const g = []; for (let y = 0; y < h; y++) g.push(new Array(w).fill(c)); return g; }
    function rect(g, x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] !== undefined) g[y][x] = c; }
    function box(g, x0, y0, x1, y1, c) { rect(g, x0, y0, x1, y0, c); rect(g, x0, y1, x1, y1, c); rect(g, x0, y0, x0, y1, c); rect(g, x1, y0, x1, y1, c); }
    function put(g, list, c) { for (let i = 0; i < list.length; i += 2) if (g[list[i + 1]]) g[list[i + 1]][list[i]] = c; }
    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    function scatter(g, x0, y0, x1, y1, c, chance, seed, on) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] === (on || '.') && hash(x, y, seed) < chance) g[y][x] = c; }
    function clear(g, props, c) { for (const p of props) rect(g, p.x - 1, p.y - 1, p.x + (p.w || 1), p.y + (p.h || 1) + 1, c || '.'); }
    function unblock(g, pts) { for (const q of pts) for (let y = Math.floor(q[1]) - 1; y <= Math.floor(q[1]) + 1; y++) for (let x = Math.floor(q[0]) - 1; x <= Math.floor(q[0]) + 1; x++) if (g[y] && 'TkPrFB^#'.indexOf(g[y][x]) >= 0) g[y][x] = q[2] || '.'; }
    const rows = g => g.map(r => r.join(''));

    /* ---------------- 1. Blackthorn Village (Dominion Hub) ---------------- */
    function village() {
        const g = grid(46, 32, '.');
        box(g, 0, 0, 45, 31, '^');
        rect(g, 1, 1, 44, 1, '#');
        // North gate to Castle Dracula (q -> open.dracula)
        rect(g, 21, 0, 23, 0, '='); rect(g, 21, 1, 23, 1, 'q');
        // West gate to Nosferatu's Wasteland
        rect(g, 0, 14, 0, 16, '='); rect(g, 1, 14, 1, 16, 'g');
        // East gate to The Brides' Domain
        rect(g, 45, 14, 45, 16, '=');
        // South gate to The Crimson Empire
        rect(g, 21, 30, 23, 30, 'g'); rect(g, 21, 31, 23, 31, '=');

        // Roads & Central Cobblestone Square
        rect(g, 21, 2, 23, 29, '=');
        rect(g, 2, 14, 44, 16, '=');
        rect(g, 14, 9, 30, 20, 'x');
        // Churchyard clearing around [8.5, 9.5]
        rect(g, 5, 6, 12, 12, 'x');
        // Dark river & bridge
        rect(g, 1, 25, 19, 28, '~'); rect(g, 25, 25, 44, 28, '~');
        rect(g, 20, 24, 24, 29, 'w');

        const props = [
            { k: 'house', x: 3, y: 2, w: 5, h: 3, roof: 'slate', kind: 'church' },
            { k: 'shrine', x: 7, y: 6, w: 2, h: 2 },                     // Holy Shrine right above spot [8.5, 9.5]
            { k: 'house', x: 33, y: 3, w: 5, h: 3, roof: 'red' },
            { k: 'house', x: 3, y: 18, w: 6, h: 3, roof: 'slate', kind: 'smith' },
            { k: 'house', x: 34, y: 18, w: 5, h: 3, roof: 'green', kind: 'shop' },
            { k: 'fountain', x: 21, y: 11, w: 3, h: 2 },
            { k: 'altar', x: 15, y: 10, w: 2, h: 2 },                    // Blood Altar for risk/reward blessing
            { k: 'tomb', x: 4, y: 10, w: 1, h: 1 }, { k: 'tomb', x: 11, y: 10, w: 1, h: 1 },
            { k: 'gargoyle', x: 19, y: 3, w: 1, h: 1 }, { k: 'gargoyle', x: 25, y: 3, w: 1, h: 1 },
            { k: 'banner', x: 14, y: 9, w: 1, h: 1, c: 'dracula' }, { k: 'banner', x: 30, y: 9, w: 1, h: 1, c: 'dracula' },
            { k: 'well', x: 28, y: 17, w: 1, h: 1 },
            { k: 'wagon', x: 11, y: 20, w: 2, h: 1 }
        ];
        scatter(g, 1, 2, 44, 24, 'T', 0.04, 101); scatter(g, 1, 2, 44, 24, 'F', 0.05, 103); scatter(g, 1, 2, 44, 24, 'k', 0.03, 107);
        clear(g, props);
        rect(g, 14, 9, 30, 20, 'x'); rect(g, 5, 8, 11, 12, 'x');
        rect(g, 21, 2, 23, 29, '='); rect(g, 2, 14, 44, 16, '='); rect(g, 20, 24, 24, 29, 'w');
        rect(g, 21, 1, 23, 1, 'q'); rect(g, 1, 14, 1, 16, 'g'); rect(g, 21, 30, 23, 30, 'g');
        unblock(g, [[22.5, 14.6, 'x'], [8.5, 9.5, 'x'], [18.5, 12.6, 'x'], [26.5, 12.6, 'x'], [6.5, 21.7, '.'], [36.5, 21.7, '.'], [23.5, 24.8, 'w']]);
        put(g, [15, 9, 29, 9, 15, 19, 29, 19, 20, 4, 24, 4], 'L');
        put(g, [42, 3, 3, 23], 'C'); put(g, [13, 13, 31, 13, 17, 21], 'p');

        return {
            ground: 'gothic', art: 1, music: 'c5_village', atmo: 'bloodmoon', spawn: [22.5, 25.5], tier: 7,
            rows: rows(g), props,
            npcs: [
                { id: 'alucard', x: 22.5, y: 14.6 },
                { id: 'mina', x: 18.5, y: 12.6 },
                { id: 'jonathan', x: 26.5, y: 12.6 },
                { id: 'tobin', x: 6.5, y: 21.7 },
                { id: 'hana', x: 36.5, y: 21.7 },
                { id: 'salladhor', x: 23.5, y: 24.8 }
            ],
            foes: [
                { t: 'blood_bat', x: 34, y: 8 }, { t: 'blood_bat', x: 38, y: 10 }, { t: 'blood_bat', x: 40, y: 7 },
                { t: 'vampire_thrall', x: 35, y: 12 }, { t: 'vampire_thrall', x: 39, y: 12 },
                { t: 'blood_bat', x: 12, y: 5 }, { t: 'vampire_thrall', x: 15, y: 5 }
            ],
            exits: [
                { x: 21, y: 0, w: 3, h: 1, to: 'c5_dracula', tx: 22.5, ty: 28.5 },
                { x: 0, y: 14, w: 1, h: 3, to: 'c5_nosferatu', tx: 43.5, ty: 15.5 },
                { x: 45, y: 14, w: 1, h: 3, to: 'c5_brides', tx: 2.5, ty: 15.5 },
                { x: 21, y: 31, w: 3, h: 1, to: 'c5_crimson', tx: 22.5, ty: 2.5 }
            ]
        };
    }

    /* ---------------- 2. Castle Dracula & Bloodmoon Peaks ---------------- */
    function dracula() {
        const g = grid(46, 32, 'x');
        box(g, 0, 0, 45, 31, '#');
        rect(g, 21, 30, 23, 31, '=');
        rect(g, 20, 4, 25, 30, '=');
        rect(g, 10, 6, 35, 22, 'x');
        // Blood moats flanking the keep
        rect(g, 2, 4, 7, 26, '~'); rect(g, 38, 4, 43, 26, '~');
        const props = [
            { k: 'throne', x: 21, y: 3, w: 3, h: 2, c: 'crimson' },
            { k: 'altar', x: 12, y: 8, w: 2, h: 2 },
            { k: 'shrine', x: 31, y: 8, w: 2, h: 2 },
            { k: 'coffin', x: 11, y: 15, w: 1, h: 1 }, { k: 'coffin', x: 34, y: 15, w: 1, h: 1 },
            { k: 'gargoyle', x: 18, y: 7, w: 1, h: 1 }, { k: 'gargoyle', x: 27, y: 7, w: 1, h: 1 },
            { k: 'gargoyle', x: 18, y: 20, w: 1, h: 1 }, { k: 'gargoyle', x: 27, y: 20, w: 1, h: 1 },
            { k: 'banner', x: 15, y: 5, w: 1, h: 1, c: 'dracula' }, { k: 'banner', x: 30, y: 5, w: 1, h: 1, c: 'dracula' }
        ];
        clear(g, props, 'x');
        rect(g, 20, 6, 25, 30, '='); rect(g, 21, 30, 23, 31, '=');
        unblock(g, [[23.5, 12.5, 'x'], [22.5, 28.5, '=']]);
        put(g, [14, 7, 31, 7, 14, 14, 31, 14, 14, 21, 31, 21], 'L');
        put(g, [9, 4, 36, 4], 'C'); put(g, [10, 24, 35, 24], 'p');

        return {
            ground: 'crimson', art: 1, music: 'c5_dracula', atmo: 'bloodmoon', spawn: [22.5, 28.5], tier: 7, dark: true,
            rows: rows(g), props,
            npcs: [],
            boss: { t: 'dracula', x: 23.5, y: 12.5, flag: 'c5_dracula' },
            foes: [
                { t: 'blood_bat', x: 15, y: 23 }, { t: 'blood_bat', x: 30, y: 23 },
                { t: 'vampire_thrall', x: 16, y: 18 }, { t: 'vampire_thrall', x: 29, y: 18 },
                { t: 'vampire_knight', x: 17, y: 13 }, { t: 'vampire_knight', x: 28, y: 13 }
            ],
            exits: [
                { x: 21, y: 31, w: 3, h: 1, to: 'c5_village', tx: 22.5, ty: 2.5 }
            ]
        };
    }

    /* ---------------- 3. Nosferatu's Wasteland & Tower ---------------- */
    // Interactive spots (cure_crypt): [[8.5, 12.5], [37.5, 11.5], [14.5, 23.5]]
    function nosferatu() {
        const g = grid(46, 32, '.');
        box(g, 0, 0, 45, 31, '^');
        // East road back to Blackthorn Village, plus South road
        rect(g, 44, 14, 45, 16, '=');
        rect(g, 21, 30, 23, 31, '=');
        rect(g, 6, 14, 44, 16, '=');
        rect(g, 21, 6, 24, 30, '=');
        // Plague Tower courtyard in North
        rect(g, 16, 4, 29, 12, 'x');
        // Poisonous swamp pools
        rect(g, 3, 4, 11, 8, '~'); rect(g, 33, 19, 42, 25, '~');

        const props = [
            { k: 'ruin', x: 19, y: 2, w: 6, h: 3 },
            // Cauldrons placed 2 tiles above the spots [[8.5, 12.5], [37.5, 11.5], [14.5, 23.5]]
            { k: 'cauldron', x: 8, y: 10, w: 1, h: 1 },                  // spot [8.5, 12.5]
            { k: 'cauldron', x: 37, y: 9, w: 1, h: 1 },                  // spot [37.5, 11.5]
            { k: 'cauldron', x: 14, y: 21, w: 1, h: 1 },                 // spot [14.5, 23.5]
            { k: 'shrine', x: 28, y: 22, w: 2, h: 2 },
            { k: 'coffin', x: 17, y: 6, w: 1, h: 1 }, { k: 'coffin', x: 27, y: 6, w: 1, h: 1 },
            { k: 'tomb', x: 6, y: 18, w: 1, h: 1 }, { k: 'tomb', x: 10, y: 18, w: 1, h: 1 }
        ];
        scatter(g, 2, 2, 43, 29, 'T', 0.05, 201); scatter(g, 2, 2, 43, 29, 'k', 0.04, 203);
        clear(g, props);
        rect(g, 16, 5, 29, 12, 'x'); rect(g, 6, 14, 45, 16, '='); rect(g, 21, 6, 24, 31, '=');
        unblock(g, [[8.5, 12.5, '.'], [37.5, 11.5, '.'], [14.5, 23.5, '.'], [23.5, 8.5, 'x'], [22.5, 29.5, '='], [43.5, 15.5, '=']]);
        put(g, [16, 6, 29, 6, 16, 12, 29, 12, 20, 22, 25, 22], 'L');
        put(g, [4, 27, 41, 4], 'C'); put(g, [12, 12, 34, 12, 18, 24], 'p');

        return {
            ground: 'plague', art: 1, music: 'c5_nosferatu', atmo: 'plague_fog', spawn: [22.5, 29.5], tier: 7, dark: true,
            rows: rows(g), props,
            npcs: [],
            boss: { t: 'orlok', x: 23.5, y: 8.5, flag: 'c5_orlok' },
            foes: [
                { t: 'plague_rat', x: 11, y: 13 }, { t: 'plague_rat', x: 35, y: 12 }, { t: 'plague_rat', x: 16, y: 23 },
                { t: 'rotting_ghoul', x: 9, y: 14 }, { t: 'rotting_ghoul', x: 38, y: 13 },
                { t: 'rotting_ghoul', x: 13, y: 24 }, { t: 'rotting_ghoul', x: 26, y: 18 },
                { t: 'night_stalker', x: 19, y: 11 }, { t: 'night_stalker', x: 27, y: 11 }
            ],
            exits: [
                { x: 45, y: 14, w: 1, h: 3, to: 'c5_village', tx: 2.5, ty: 15.5 },
                { x: 21, y: 31, w: 3, h: 1, to: 'c5_village', tx: 2.5, ty: 15.5 }
            ]
        };
    }

    /* ---------------- 4. The Brides' Domain (Widow's Forest) ---------------- */
    // Exits: West -> c5_village, East -> c5_shadow (Ravenport)
    function brides() {
        const g = grid(48, 34, '.');
        box(g, 0, 0, 47, 33, '^');
        // West entrance from Blackthorn Village & South entrance
        rect(g, 0, 14, 1, 16, '=');
        rect(g, 21, 32, 23, 33, '=');
        // East gate to Shadow Principality (c5_shadow)
        rect(g, 46, 14, 46, 16, 'g'); rect(g, 47, 14, 47, 16, '=');
        // Forest paths & Three Sisters' Castle courtyard
        rect(g, 1, 14, 46, 16, '=');
        rect(g, 21, 6, 24, 32, '=');
        rect(g, 14, 5, 32, 13, 'x');
        rect(g, 12, 21, 19, 26, 'x'); // Van Helsing's Hunter Lodge clearing

        const props = [
            { k: 'house', x: 20, y: 1, w: 6, h: 3, roof: 'red' },
            { k: 'house', x: 13, y: 18, w: 5, h: 3, roof: 'slate' },    // Hunter's Lodge above Van Helsing [15.5, 23.5]
            { k: 'shrine', x: 34, y: 20, w: 2, h: 2 },
            { k: 'altar', x: 15, y: 6, w: 2, h: 2 },
            { k: 'fountain', x: 29, y: 6, w: 3, h: 2 },
            { k: 'gargoyle', x: 19, y: 5, w: 1, h: 1 }, { k: 'gargoyle', x: 27, y: 5, w: 1, h: 1 }
        ];
        scatter(g, 2, 2, 45, 31, 'T', 0.06, 301); scatter(g, 2, 2, 45, 31, 'F', 0.05, 305);
        clear(g, props);
        rect(g, 14, 5, 32, 13, 'x'); rect(g, 12, 21, 19, 26, 'x');
        rect(g, 1, 14, 45, 16, '='); rect(g, 21, 6, 24, 32, '='); rect(g, 46, 14, 46, 16, 'g');
        unblock(g, [[15.5, 23.5, 'x'], [23.5, 9.5, 'x'], [2.5, 15.5, '='], [28, 18, '.']]);
        put(g, [14, 6, 32, 6, 14, 13, 32, 13, 13, 22, 18, 22], 'L');
        put(g, [5, 5, 42, 5], 'C'); put(g, [19, 22, 33, 22], 'p');

        return {
            ground: 'gothic', art: 1, music: 'c5_brides', atmo: 'bloodmoon', spawn: [2.5, 15.5], tier: 7,
            rows: rows(g), props,
            npcs: [
                { id: 'vanhelsing', x: 15.5, y: 23.5 }
            ],
            boss: { t: 'bride_crimson', x: 23.5, y: 9.5, flag: 'c5_brides' },
            foes: [
                { t: 'blood_wolf', x: 26, y: 18 }, { t: 'blood_wolf', x: 30, y: 19 },
                { t: 'blood_wolf', x: 34, y: 17 }, { t: 'blood_wolf', x: 28, y: 24 },
                { t: 'blood_bat', x: 24, y: 18 }, { t: 'blood_bat', x: 32, y: 22 },
                { t: 'blood_bat', x: 38, y: 18 }, { t: 'vampire_thrall', x: 18, y: 11 }
            ],
            exits: [
                { x: 0, y: 14, w: 1, h: 3, to: 'c5_village', tx: 43.5, ty: 15.5 },
                { x: 21, y: 33, w: 3, h: 1, to: 'c5_village', tx: 43.5, ty: 15.5 },
                { x: 47, y: 14, w: 1, h: 3, to: 'c5_shadow', tx: 22.5, ty: 29.5 }
            ]
        };
    }

    /* ---------------- 5. The Crimson Empire & Scarlet City ---------------- */
    // Interactive spots (destroy_labs): [[9.5, 14.5], [36.5, 13.5], [17.5, 21.5]]
    function crimson() {
        const g = grid(46, 32, 'x');
        box(g, 0, 0, 45, 31, '#');
        // North & South entrances
        rect(g, 21, 0, 23, 1, '=');
        rect(g, 21, 30, 23, 31, '=');
        rect(g, 21, 1, 23, 30, '=');
        rect(g, 6, 13, 40, 15, '=');
        // Blood aqueducts
        rect(g, 3, 4, 10, 8, '~'); rect(g, 35, 4, 42, 8, '~');

        const props = [
            { k: 'throne', x: 21, y: 4, w: 3, h: 2, c: 'crimson' },
            // Alembics placed 2 tiles above the spots [[9.5, 14.5], [36.5, 13.5], [17.5, 21.5]]
            { k: 'alembic', x: 9, y: 12, w: 1, h: 1 },                   // spot [9.5, 14.5]
            { k: 'alembic', x: 36, y: 11, w: 1, h: 1 },                  // spot [36.5, 13.5]
            { k: 'alembic', x: 17, y: 19, w: 1, h: 1 },                  // spot [17.5, 21.5]
            { k: 'fountain', x: 21, y: 16, w: 3, h: 2 },
            { k: 'shrine', x: 32, y: 22, w: 2, h: 2 },
            { k: 'banner', x: 16, y: 6, w: 1, h: 1, c: 'crimson' }, { k: 'banner', x: 29, y: 6, w: 1, h: 1, c: 'crimson' }
        ];
        clear(g, props, 'x');
        rect(g, 21, 0, 23, 31, '='); rect(g, 6, 13, 40, 15, '=');
        unblock(g, [[9.5, 14.5, 'x'], [36.5, 13.5, 'x'], [17.5, 21.5, 'x'], [23.5, 10.5, 'x'], [22.5, 28.5, '='], [22.5, 2.5, '=']]);
        put(g, [15, 8, 30, 8, 15, 16, 30, 16, 15, 24, 30, 24], 'L');
        put(g, [5, 26, 40, 26], 'C'); put(g, [12, 18, 33, 18], 'p');

        return {
            ground: 'crimson', art: 1, music: 'c5_crimson', atmo: 'bloodmoon', spawn: [22.5, 28.5], tier: 7, dark: true,
            rows: rows(g), props,
            npcs: [],
            boss: { t: 'blood_queen', x: 23.5, y: 10.5, flag: 'c5_blood_queen' },
            foes: [
                { t: 'blood_maiden', x: 13, y: 14 }, { t: 'blood_maiden', x: 33, y: 14 },
                { t: 'flesh_golem', x: 15, y: 21 }, { t: 'flesh_golem', x: 30, y: 21 },
                { t: 'vampire_knight', x: 18, y: 11 }, { t: 'vampire_knight', x: 27, y: 11 }
            ],
            exits: [
                { x: 21, y: 0, w: 3, h: 1, to: 'c5_village', tx: 22.5, ty: 28.5 },
                { x: 21, y: 31, w: 3, h: 1, to: 'c5_village', tx: 22.5, ty: 28.5 }
            ]
        };
    }

    /* ---------------- 6. The Shadow Principality (Ravenport) ---------------- */
    // Interactive spots (shatter_mirrors): [[10.5, 12.5], [37.5, 12.5], [23.5, 19.5]]
    // Exits: South -> c5_brides, North -> c5_undying
    function shadow() {
        const g = grid(46, 32, 'x');
        box(g, 0, 0, 45, 31, '#');
        // South exit to c5_brides & North gate to c5_undying
        rect(g, 21, 30, 23, 31, '=');
        rect(g, 21, 0, 23, 0, '='); rect(g, 21, 1, 23, 1, 'q');
        rect(g, 21, 2, 23, 30, '=');
        rect(g, 8, 12, 39, 14, '=');

        const props = [
            { k: 'throne', x: 21, y: 4, w: 3, h: 2, c: 'gothic' },
            // Mirrors placed 2 tiles above the spots [[10.5, 12.5], [37.5, 12.5], [23.5, 19.5]]
            { k: 'mirror', x: 10, y: 10, w: 1, h: 1 },                   // spot [10.5, 12.5]
            { k: 'mirror', x: 37, y: 10, w: 1, h: 1 },                   // spot [37.5, 12.5]
            { k: 'mirror', x: 23, y: 17, w: 1, h: 1 },                   // spot [23.5, 19.5]
            { k: 'shrine', x: 8, y: 22, w: 2, h: 2 },
            { k: 'gargoyle', x: 17, y: 8, w: 1, h: 1 }, { k: 'gargoyle', x: 28, y: 8, w: 1, h: 1 }
        ];
        clear(g, props, 'x');
        rect(g, 21, 2, 23, 31, '='); rect(g, 8, 12, 39, 14, '='); rect(g, 21, 1, 23, 1, 'q');
        unblock(g, [[10.5, 12.5, 'x'], [37.5, 12.5, 'x'], [23.5, 19.5, 'x'], [23.5, 9.5, 'x'], [22.5, 29.5, '=']]);
        put(g, [15, 7, 30, 7, 15, 16, 30, 16, 15, 24, 30, 24], 'L');
        put(g, [5, 5, 40, 5], 'C'); put(g, [13, 22, 33, 22], 'p');

        return {
            ground: 'shadow', art: 1, music: 'c5_shadow', atmo: 'shadow_mist', spawn: [22.5, 29.5], tier: 7, dark: true,
            rows: rows(g), props,
            npcs: [],
            boss: { t: 'ruthven', x: 23.5, y: 9.5, flag: 'c5_ruthven' },
            foes: [
                { t: 'shadow_assassin', x: 13, y: 13 }, { t: 'shadow_assassin', x: 34, y: 13 },
                { t: 'shadow_assassin', x: 20, y: 20 }, { t: 'night_stalker', x: 15, y: 22 },
                { t: 'night_stalker', x: 31, y: 22 }, { t: 'vampire_knight', x: 18, y: 10 },
                { t: 'vampire_knight', x: 27, y: 10 }
            ],
            exits: [
                { x: 21, y: 31, w: 3, h: 1, to: 'c5_brides', tx: 44.5, ty: 15.5 },
                { x: 21, y: 0, w: 3, h: 1, to: 'c5_undying', tx: 22.5, ty: 29.5 }
            ]
        };
    }

    /* ---------------- 7. The Undying Kingdom & Necropolis ---------------- */
    // Exits: South -> c5_shadow, North -> c5_carmilla
    function undying() {
        const g = grid(46, 32, 'd');
        box(g, 0, 0, 45, 31, '#');
        rect(g, 21, 30, 23, 31, '=');
        rect(g, 21, 0, 23, 0, '='); rect(g, 21, 1, 23, 1, 'q');
        rect(g, 21, 2, 23, 30, '=');
        rect(g, 10, 7, 35, 24, 'x');

        const props = [
            { k: 'throne', x: 21, y: 3, w: 3, h: 2, c: 'bone' },
            { k: 'pyre', x: 14, y: 19, w: 2, h: 2 },
            { k: 'pyre', x: 30, y: 19, w: 2, h: 2 },
            { k: 'shrine', x: 8, y: 24, w: 2, h: 2 },
            { k: 'coffin', x: 12, y: 9, w: 1, h: 1 }, { k: 'coffin', x: 33, y: 9, w: 1, h: 1 },
            { k: 'tomb', x: 12, y: 15, w: 1, h: 1 }, { k: 'tomb', x: 33, y: 15, w: 1, h: 1 }
        ];
        clear(g, props, 'x');
        rect(g, 21, 2, 23, 31, '='); rect(g, 21, 1, 23, 1, 'q');
        unblock(g, [[23.5, 9.5, 'x'], [22, 22, '='], [22.5, 29.5, '=']]);
        put(g, [16, 8, 29, 8, 16, 16, 29, 16, 16, 24, 29, 24], 'L');
        put(g, [5, 5, 40, 5], 'C'); put(g, [11, 22, 34, 22], 'p');

        return {
            ground: 'undead', art: 1, music: 'c5_undying', atmo: 'plague_fog', spawn: [22.5, 29.5], tier: 7, dark: true,
            rows: rows(g), props,
            npcs: [],
            boss: { t: 'undying_king', x: 23.5, y: 9.5, flag: 'c5_undying_king' },
            foes: [
                { t: 'undead_walker', x: 16, y: 23 }, { t: 'undead_walker', x: 28, y: 23 },
                { t: 'undead_walker', x: 20, y: 21 }, { t: 'undead_walker', x: 25, y: 21 },
                { t: 'undead_runner', x: 14, y: 17 }, { t: 'undead_runner', x: 31, y: 17 },
                { t: 'undead_runner', x: 22, y: 18 },
                { t: 'bone_archer', x: 13, y: 12 }, { t: 'bone_archer', x: 32, y: 12 },
                { t: 'bone_archer', x: 18, y: 13 }, { t: 'bone_archer', x: 27, y: 13 }
            ],
            exits: [
                { x: 21, y: 31, w: 3, h: 1, to: 'c5_shadow', tx: 22.5, ty: 2.5 },
                { x: 21, y: 0, w: 3, h: 1, to: 'c5_carmilla', tx: 22.5, ty: 29.5 }
            ]
        };
    }

    /* ---------------- 8. Carmilla's Court & Blood Cathedral ---------------- */
    // Interactive spots (consecrate_shrines): [[9.5, 19.5], [37.5, 19.5], [23.5, 23.5]]
    function carmilla() {
        const g = grid(48, 34, 'x');
        box(g, 0, 0, 47, 33, '#');
        rect(g, 21, 30, 24, 33, '=');
        rect(g, 21, 4, 25, 32, '=');
        rect(g, 8, 18, 39, 21, '=');
        // Rivers of blood on far left & right
        rect(g, 2, 4, 5, 28, '~'); rect(g, 42, 4, 45, 28, '~');

        const props = [
            { k: 'throne', x: 22, y: 2, w: 3, h: 2, c: 'carmilla' },
            // Shrines placed 2 tiles above the spots [[9.5, 19.5], [37.5, 19.5], [23.5, 23.5]]
            { k: 'shrine', x: 9, y: 16, w: 2, h: 2 },                    // spot [9.5, 19.5]
            { k: 'shrine', x: 37, y: 16, w: 2, h: 2 },                   // spot [37.5, 19.5]
            { k: 'shrine', x: 23, y: 20, w: 2, h: 2 },                   // spot [23.5, 23.5]
            { k: 'crystal', x: 13, y: 8, w: 1, h: 1, n: 0 },
            { k: 'crystal', x: 33, y: 8, w: 1, h: 1, n: 1 },
            { k: 'altar', x: 15, y: 12, w: 2, h: 2 },
            { k: 'altar', x: 30, y: 12, w: 2, h: 2 },
            { k: 'banner', x: 18, y: 5, w: 1, h: 1, c: 'carmilla' }, { k: 'banner', x: 28, y: 5, w: 1, h: 1, c: 'carmilla' }
        ];
        clear(g, props, 'x');
        rect(g, 21, 5, 25, 33, '='); rect(g, 8, 18, 39, 21, '=');
        unblock(g, [[9.5, 19.5, '='], [37.5, 19.5, '='], [23.5, 23.5, '='], [23.5, 9.5, 'x'], [22.5, 29.5, '=']]);
        put(g, [16, 7, 30, 7, 16, 15, 30, 15, 16, 25, 30, 25], 'L');
        put(g, [7, 5, 40, 5], 'C'); put(g, [12, 26, 35, 26], 'p');

        return {
            ground: 'crimson', art: 1, music: 'c5_carmilla', atmo: 'bloodmoon', spawn: [22.5, 29.5], tier: 7, dark: true,
            rows: rows(g), props,
            npcs: [],
            boss: { t: 'carmilla', x: 23.5, y: 9.5, flag: 'c5_carmilla' },
            foes: [
                { t: 'blood_crystal', x: 14.5, y: 9.5 },
                { t: 'blood_crystal', x: 32.5, y: 9.5 },
                { t: 'vampire_knight', x: 16, y: 16 }, { t: 'vampire_knight', x: 31, y: 16 },
                { t: 'blood_maiden', x: 13, y: 22 }, { t: 'blood_maiden', x: 34, y: 22 },
                { t: 'shadow_assassin', x: 19, y: 26 }, { t: 'shadow_assassin', x: 28, y: 26 }
            ],
            exits: [
                { x: 21, y: 33, w: 4, h: 1, to: 'c5_undying', tx: 22.5, ty: 2.5 }
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
