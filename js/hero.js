/* Hollowmere: people drawn in code, for the heroes, the Chapter 2 townsfolk and armed foes.
 * A clothed character about 38 px tall, seen from the front, the back or the side, with walking
 * legs and swinging arms. Clothes come from the gear worn, so armour is easy to see:
 *   look = { skin, hair, style (0 short, 1 long tail, 2 bald, 3 hood, 4 curls), tunic, trim, pants, shoes, cape, beard }
 *   gear = { head, body, feet } item ids (or '' for none)
 * Draws straight to the canvas (no allocation): about 40 small shapes per person. */
window.HM_HERO = (function () {
    'use strict';
    let F = false;                                       // hit flash: everything white
    const c = v => F ? '#ffffff' : v;
    function rect(x, X, Y, w, h, col) { x.fillStyle = c(col); x.fillRect(X, Y, w, h); }
    function oval(x, X, Y, rx, ry, col) { x.fillStyle = c(col); x.beginPath(); x.ellipse(X, Y, rx, ry, 0, 0, 6.2832); x.fill(); }
    function poly4(x, ax, ay, bx, by, cx, cy, dx, dy, col) { x.fillStyle = c(col); x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.lineTo(cx, cy); x.lineTo(dx, dy); x.closePath(); x.fill(); }

    // what each piece of gear looks like
    const BODY = {
        padded_vest:         { main: '#8a5a34', dark: '#5e3a1e', light: '#b07a4a', kind: 'leather' },
        chainmail:           { main: '#8f98a6', dark: '#5f6878', light: '#c4ccd8', kind: 'mail' },
        plate_armor:         { main: '#cfd7e3', dark: '#7c8798', light: '#ffffff', kind: 'plate', trim: '#d8b04a' },
        tide_mail:           { main: '#2f9c9a', dark: '#1d6668', light: '#7fe0d6', kind: 'scale', trim: '#e8d27a' },
        mage_robe:           { main: '#a8322e', dark: '#6e1c1a', light: '#ff8a5a', kind: 'robe',  trim: '#ffd25a' },
        frost_plate:         { main: '#c8dcf0', dark: '#6a829e', light: '#ffffff', kind: 'plate', trim: '#7ae0ff' },
        runic_robe:          { main: '#4a3a8a', dark: '#2a1e56', light: '#b07aff', kind: 'robe',  trim: '#9ad8ff' },
        kingsguard_plate:    { main: '#f2e6c2', dark: '#b89644', light: '#ffffff', kind: 'plate', trim: '#ffd23f' },
        targaryen_scale:     { main: '#241e22', dark: '#141014', light: '#6a5258', kind: 'scale', trim: '#c82828' },
        watch_cloak:         { main: '#1c1e24', dark: '#101216', light: '#3a404c', kind: 'robe',  trim: '#5a6270' },
        red_priest_robe:     { main: '#b81d24', dark: '#6e0e14', light: '#ff6a4a', kind: 'robe',  trim: '#ffb030' },
        vampire_armor:       { main: '#1c1424', dark: '#0e0814', light: '#8a1828', kind: 'plate', trim: '#c81828' },
        nightstalker_garb:   { main: '#1e1828', dark: '#100c18', light: '#7a4cff', kind: 'leather', trim: '#9a70ff' },
        sanctified_vestment: { main: '#f4ecd8', dark: '#b8a882', light: '#ffffff', kind: 'robe',  trim: '#ffd700' },
        royal_star_plate:    { main: '#ffd700', dark: '#b8860b', light: '#fff8c0', kind: 'plate', trim: '#3a78ff' },
        mushroom_tunic:      { main: '#e62222', dark: '#9e1010', light: '#ff6a6a', kind: 'leather', trim: '#2058d8' },
        starlight_robe:      { main: '#5ad8ff', dark: '#2478a8', light: '#c8f4ff', kind: 'robe',  trim: '#ffd700' },
        kokiri_tunic:        { main: '#249838', dark: '#145820', light: '#58d868', kind: 'leather', trim: '#8a5a2e' },
        goron_tunic:         { main: '#c82424', dark: '#781010', light: '#ff6858', kind: 'plate', trim: '#ffd23f' },
        zora_tunic:          { main: '#2068d8', dark: '#103880', light: '#68b8ff', kind: 'scale', trim: '#c8f4ff' }
    };
    const HEAD = {
        leather_cap:    { main: '#7a5230', dark: '#4e331c', kind: 'cap' },
        iron_helm:      { main: '#9aa2ae', dark: '#626a78', kind: 'helm' },
        mystic_hood:    { main: '#4a3a5a', dark: '#2a2036', kind: 'hood' },
        knight_helm:    { main: '#d0d8e4', dark: '#7c8798', kind: 'knight', plume: '#d23a3a' },
        coral_helm:     { main: '#3fb0a6', dark: '#1d6668', kind: 'knight', plume: '#ff8a6a' },
        hood:           { main: '#4a3a5a', dark: '#2a2036', kind: 'hood' },
        warden_helm:    { main: '#b8c8e0', dark: '#6a7a90', kind: 'knight', plume: '#7ae0ff' },
        astral_circlet: { main: '#7a5cff', dark: '#3a2488', kind: 'cap' },
        stark_wolfhelm: { main: '#8a96a6', dark: '#4a5260', kind: 'knight', plume: '#e8eef6' },
        shadow_ring:    { main: '#2a1a44', dark: '#160c28', kind: 'hood' },
        crimson_amulet: { main: '#e82038', dark: '#7a0c18', kind: 'cap' },
        wing_cap_helm:  { main: '#e62222', dark: '#9e1010', kind: 'cap', wing: true },
        hylian_helm:    { main: '#249838', dark: '#145820', kind: 'cap' },
        mirror_helm:    { main: '#e82828', dark: '#901414', kind: 'knight', plume: '#ffd700' }
    };
    const FEET = {
        leather_boots:    { main: '#6b4a2e', top: '#8a5f3a' },
        swift_boots:      { main: '#2f7a4f', top: '#5ac08a', wing: true },
        iron_greaves:     { main: '#8a929e', top: '#c0c8d4' },
        silk_shoes:       { main: '#7a2838', top: '#ffd25a', wing: true },
        wave_boots:       { main: '#1d6668', top: '#7fe0d6', wing: true },
        wyrm_boots:       { main: '#6a2a1e', top: '#ff8a3a', wing: true },
        runic_boots:      { main: '#3a2a6a', top: '#9ad8ff', wing: true },
        dornish_boots:    { main: '#a84424', top: '#ffb040', wing: true },
        valyrian_greaves: { main: '#4a5260', top: '#c83030', wing: true },
        dread_greaves:    { main: '#281822', top: '#b81828' },
        plumber_boots:    { main: '#6b3e1e', top: '#8c542b', wing: true },
        iron_boots:       { main: '#687488', top: '#b8c4d8' },
        hover_boots:      { main: '#d8a838', top: '#fff2b0', wing: true }
    };
    const COSTUME = {
        mario_costume: { kind: 'plumber', cap: '#e62222', capDark: '#a01010', shirt: '#e62222', overalls: '#2058d8', overallsDark: '#143890', pants: '#2058d8', shoes: '#6b3e1e', emblem: '#e62222' },
        luigi_costume: { kind: 'plumber', cap: '#22b838', capDark: '#127822', shirt: '#22b838', overalls: '#1a44b8', overallsDark: '#102b7a', pants: '#1a44b8', shoes: '#5c3618', emblem: '#22b838' },
        peach_costume: { kind: 'princess', dress: '#ff85c2', dressDark: '#e04088', dressLight: '#ffc2e2', pants: '#e04088', shoes: '#e04088', crown: '#ffd700', jewel: '#2890ff', ruby: '#ff2244', hair: '#ffe048' },
        link_costume:  { kind: 'hylian', cap: '#249838', capDark: '#145c20', tunic: '#249838', tunicDark: '#145c20', sleeves: '#e8dfc4', pants: '#e8dfc4', shoes: '#6b4224', hair: '#f4d046', belt: '#5a381e', buckle: '#ffd700' },
        sheik_costume: { kind: 'sheikah', wrap: '#f0ead8', wrapDark: '#c8be9c', suit: '#1e3264', suitDark: '#121e42', pants: '#1e3264', shoes: '#d8d0be', hair: '#f4d046', emblem: '#d82828' },
        zelda_costume: { kind: 'princess', dress: '#e888c4', dressDark: '#984898', dressLight: '#f8e8f8', pants: '#984898', shoes: '#984898', crown: '#ffd700', jewel: '#3898ff', ruby: '#ffd700', hair: '#ffe058' }
    };

    /* dir: 0 front (facing down), 1 back (facing up), 2 side; flip = facing left
     * dir 3 / 4: three-quarter views for diagonals (front turned toward the side it walks to / back turned), flip = toward the left
     * walk: phase in radians (0 = standing), lean: -1..1 forward lean when striking */
    let Q = 0;                                           // 1 while drawing a three-quarter view: the face turns toward +x
    function draw(x, X, Y, look, gear, dir, flip, walk, lean, flash, s) {
        F = !!flash;
        s = s || 1;
        gear = gear || {};
        Q = dir === 3 || dir === 4 ? 1 : 0; if (Q) dir = dir === 3 ? 0 : 1;
        x.save(); x.translate(X, Y); if (s !== 1) x.scale(s, s); if (flip) x.scale(-1, 1);
        if (Q) x.scale(0.84, 1);                         // turned a little: narrower shoulders
        if (lean) x.rotate(lean * 0.12);
        const sw = walk ? Math.sin(walk) : 0, bob = walk ? -Math.abs(Math.cos(walk)) * 1.3 : 0;
        const cos = COSTUME[gear.costume || look.costume];
        const bd = cos ? null : BODY[gear.body], hd = cos ? null : HEAD[gear.head], ft = cos ? null : FEET[gear.feet];
        const tunic = cos ? (cos.kind === 'plumber' ? cos.shirt : cos.kind === 'hylian' ? cos.sleeves : cos.kind === 'sheikah' ? cos.suit : cos.dress) : (bd ? bd.main : look.tunic);
        const tdark = cos ? (cos.kind === 'plumber' ? cos.overallsDark : cos.kind === 'hylian' ? cos.tunicDark : cos.kind === 'sheikah' ? cos.suitDark : cos.dressDark) : (bd ? bd.dark : shade(look.tunic));
        const tlight = cos ? (cos.kind === 'plumber' ? '#ffd23f' : cos.kind === 'hylian' ? cos.buckle : cos.kind === 'sheikah' ? cos.emblem : cos.dressLight) : (bd ? bd.light : look.trim);
        const side = dir === 2, back = dir === 1;
        const wId = gear.weapon || '';
        const isAxes = !!(gear.axes || (wId && window.HM_ITEMS && window.HM_ITEMS[wId] && window.HM_ITEMS[wId].kind === 'axes') || /axes/i.test(wId));
        // shadow
        if (!F) { x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(0, 0, 9, 3.4, 0, 0, 6.2832); x.fill(); }
        x.translate(0, bob);
        // cape behind the body (in front when seen from the back)
        if (look.cape && !back && !cos) poly4(x, -7, -26.5, 7, -26.5, side ? 3 : 9, -7, side ? -11 - sw * 2 : -9, -7, shade(look.cape));
        // legs (full 14.5px length from hip y=-14.5 to ground y=0 so running stride is clearly visible)
        const pants = cos ? (cos.kind === 'plumber' ? cos.overalls : cos.pants || cos.dressDark) : look.pants;
        const shoe = cos ? (cos.shoes || '#e04088') : (ft ? ft.main : look.shoes);
        const shoeTop = cos ? shoe : (ft ? ft.top : look.shoes);
        if (side) {
            leg(x, -0.8, -14.5, shade(pants), shade(shoe), shoeTop, ft, 1, -sw);
            leg(x, -0.8, -14.5, pants, shoe, shoeTop, ft, 1, sw);
        } else {
            leg(x, -4.1, -14.5, pants, shoe, shoeTop, ft, 0, sw);
            leg(x, 0.7, -14.5, pants, shoe, shoeTop, ft, 0, -sw);
        }
        // the far arm (side view) goes behind the body
        if (side) arm(x, -1 - sw * 2.2, tunic, tdark, cos && cos.kind === 'plumber' ? '#ffffff' : cos && cos.kind === 'hylian' ? '#7a4e28' : cos && cos.kind === 'sheikah' ? cos.wrap : look.skin, bd, 1, -sw, isAxes);
        // torso: balanced 13.5px upper body (from y=-27.5 to y=-14) so legs have full room below
        const tw = side ? 5.8 : 7.2;
        if (cos && cos.kind === 'hylian') {
            // Iconic green Hylian Tunic with cream collar, cross-chest baldric strap, and golden buckle belt
            poly4(x, -tw, -27.5, tw, -27.5, tw + 1.2, -13.0, -tw - 1.2, -13.0, cos.tunic);
            rect(x, -tw - 1.2, -14.6, tw * 2 + 2.4, 1.6, cos.tunicDark);
            if (!back) {
                poly4(x, -2.6, -27.5, 2.6, -27.5, 0, -23.2, 0, -23.2, cos.sleeves);
                poly4(x, -tw + 1.2, -26.8, -tw + 3.0, -26.8, tw - 0.8, -16.5, tw - 2.6, -16.5, cos.belt);
            }
            rect(x, -tw - 0.8, -17.2, tw * 2 + 1.6, 2.0, cos.belt);
            rect(x, side ? 1.0 : -1.4, -17.6, 2.8, 2.8, cos.buckle);
        } else if (cos && cos.kind === 'sheikah') {
            // Sheikah shinobi suit with crimson Eye of Truth emblem and white waist sash
            poly4(x, -tw, -27.5, tw, -27.5, tw + 0.8, -13.5, -tw - 0.8, -13.5, cos.suit);
            rect(x, -tw - 0.8, -15, tw * 2 + 1.6, 1.6, cos.suitDark);
            rect(x, -tw - 0.6, -17.0, tw * 2 + 1.2, 2.0, cos.wrap);
            if (!back) {
                oval(x, side ? 1.5 : 0, -22.5, 2.4, 1.6, cos.emblem);
                oval(x, side ? 1.5 : 0, -22.5, 1.0, 1.0, cos.wrap);
            }
        } else if (cos && cos.kind === 'plumber') {
            // Shirt + blue overalls with straps and yellow buttons
            poly4(x, -tw, -27.5, tw, -27.5, tw + 0.8, -13.5, -tw - 0.8, -13.5, cos.shirt);
            poly4(x, -tw + 0.5, -21.5, tw - 0.5, -21.5, tw + 0.8, -13.5, -tw - 0.8, -13.5, cos.overalls);
            rect(x, -tw - 0.8, -15, tw * 2 + 1.6, 1.6, cos.overallsDark);
            if (!side) {
                rect(x, -4.6, -27.5, 2.1, 6.5, cos.overalls);
                rect(x, 2.5, -27.5, 2.1, 6.5, cos.overalls);
                if (!back) {
                    oval(x, -3.5, -20.2, 1.3, 1.3, '#ffd23f');
                    oval(x, 3.5, -20.2, 1.3, 1.3, '#ffd23f');
                }
            } else {
                rect(x, -1.4, -27.5, 2.5, 6.5, cos.overalls);
                oval(x, 0, -20.2, 1.3, 1.3, '#ffd23f');
            }
        } else if (cos && cos.kind === 'princess') {
            // Royal pink gown with panniers, frill hem, and sapphire brooch
            poly4(x, -tw + 1, -27.5, tw - 1, -27.5, tw + 4.2, -5.5, -tw - 4.2, -5.5, cos.dress);
            poly4(x, -tw - 1.8, -17.5, tw + 1.8, -17.5, tw + 3.2, -13.5, -tw - 3.2, -13.5, cos.dressDark);
            rect(x, -tw - 4.2, -7, (tw + 4.2) * 2, 1.6, cos.dressLight);
            oval(x, -tw, -25.8, 2.6, 2.2, cos.dressLight);
            oval(x, tw, -25.8, 2.6, 2.2, cos.dressLight);
            if (!back) {
                oval(x, side ? 2.5 : 0, -23.8, 2.0, 2.2, '#ffd700');
                oval(x, side ? 2.5 : 0, -23.8, 1.3, 1.5, cos.jewel);
            }
        } else {
            poly4(x, -tw, -27.5, tw, -27.5, tw + 1.2, -13.5, -tw - 1.2, -13.5, tunic);
            rect(x, -tw - 1.2, -15, tw * 2 + 2.4, 1.6, tdark);                    // hem shadow
            if (!bd) {                                                            // cloth: a collar and a trim line
                rect(x, side ? -1 : -2, -27.5, side ? 3 : 4, 2.6, look.trim);
                if (!side) rect(x, -0.5, -24.8, 1, 8, tdark);
            } else if (bd.kind === 'leather') {
                rect(x, -tw + 1, -26.5, tw * 2 - 2, 1.4, bd.light);
                for (let k = 0; k < 3; k++) rect(x, -tw + 2, -23.8 + k * 2.8, tw * 2 - 4, 0.8, bd.dark);
            } else if (bd.kind === 'mail') {
                for (let r = 0; r < 4; r++) for (let k = 0; k < (side ? 3 : 5); k++) rect(x, -tw + 1.5 + k * 2.6 + (r & 1), -25.8 + r * 2.6, 1.3, 1.3, (r + k) & 1 ? bd.light : bd.dark);
            } else if (bd.kind === 'plate' || bd.kind === 'scale') {
                poly4(x, -tw + 1, -26.5, tw - 1, -26.5, tw - 1.8, -17, -tw + 1.8, -17, bd.light);
                poly4(x, -tw + 1.8, -25.5, tw - 1.8, -25.5, tw - 2.6, -17.8, -tw + 2.6, -17.8, bd.main);
                if (bd.kind === 'scale') for (let r = 0; r < 3; r++) for (let k = -1; k <= 1; k++) oval(x, k * 3.0 + (r & 1) * 1.5, -23.8 + r * 2.3, 1.4, 1.0, bd.dark);
                else { rect(x, -0.5, -25.5, 1, 7, bd.dark); oval(x, -2.4, -22.5, 1.2, 0.9, '#ffffff'); }
                rect(x, -tw + 1, -17.5, tw * 2 - 2, 1, bd.trim);
                if (!side) { oval(x, -tw - 0.5, -26, 3.2, 2.4, bd.light); oval(x, tw + 0.5, -26, 3.2, 2.4, bd.light); oval(x, -tw - 0.5, -25.5, 2.2, 1.5, bd.main); oval(x, tw + 0.5, -25.5, 2.2, 1.5, bd.main); }
                else oval(x, 1, -26, 3.4, 2.6, bd.light);
            } else if (bd.kind === 'robe') {
                rect(x, -1, -27.5, 2, 14.5, bd.trim); poly4(x, -tw - 1.2, -14.5, tw + 1.2, -14.5, tw + 2.0, -10.5, -tw - 2.0, -10.5, bd.main);
            }
            // belt at waist y=-16.5
            rect(x, -tw - 0.5, -16.8, tw * 2 + 1, 1.8, '#3a2416');
            rect(x, side ? 1 : -1, -17.2, 2.2, 2.6, '#d8b04a');
        }
        // the near arm(s)
        const handCol = cos ? (cos.kind === 'plumber' ? '#ffffff' : cos.kind === 'hylian' ? '#7a4e28' : cos.kind === 'sheikah' ? cos.wrap : look.skin) : look.skin;
        if (side) arm(x, 1 + sw * 2.2, tunic, tdark, handCol, bd, 0, sw, isAxes);
        else { arm(x, -tw - 1.4, tunic, tdark, handCol, bd, 0, sw, isAxes); arm(x, tw + 1.4, tunic, tdark, handCol, bd, 0, -sw, isAxes); }
        // head
        head(x, look, hd, dir, cos);
        if (look.cape && back && !cos) poly4(x, -8, -27.5, 8, -27.5, 10, -8 + sw, -10, -8 - sw, look.cape);
        x.restore();
        F = false;
    }
    function shade(col) {                                                    // a darker version of a #rrggbb colour
        const n = parseInt(col.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        return SH[col] || (SH[col] = '#' + ((1 << 24) | ((r * 0.68) << 16) | ((g * 0.68) << 8) | (b * 0.68)).toString(16).slice(1));
    }
    const SH = {};
    function leg(x, lx, top, pants, shoe, shoeTop, ft, side, stride) {
        const s = stride || 0;
        if (side) {
            const kx = lx + 1.5 + s * 3.6, ky = -8.2 - Math.abs(s) * 0.8;
            const fx = lx + 1.5 + s * 5.0 - Math.max(0, -s) * 1.4, fy = -4.0 - Math.max(0, s) * 2.4 - Math.max(0, -s) * 1.5;
            // Upper thigh (hip to knee)
            poly4(x, lx - 0.2, top, lx + 3.4, top, kx + 1.7, ky, kx - 1.7, ky, pants);
            // Lower shin (knee to ankle)
            poly4(x, kx - 1.5, ky, kx + 1.5, ky, fx + 1.5, fy + 0.8, fx - 1.5, fy + 0.8, pants);
            // Boot
            rect(x, fx - 1.8, fy, 5.2, 4.0, shoe);
            if (ft) {
                rect(x, fx - 1.6, fy - 1.4, 4.2, 1.5, shoeTop);
                if (ft.wing) rect(x, fx - 2.8, fy - 2.0, 1.6, 1.6, '#ffffff');
            }
        } else {
            const dx = s * 0.8;
            const ky = -8.5 - Math.max(0, s) * 2.0;
            const by = -4.0 - (s > 0 ? s * 3.2 : -s * 0.9);
            const thighCol = s < -0.15 ? shade(pants) : pants;
            // Upper thigh
            rect(x, lx + dx * 0.4, top, 3.5, ky - top + 0.8, thighCol);
            // Knee & lower shin
            rect(x, lx + dx, ky, 3.3, by - ky + 0.6, pants);
            // Boot
            rect(x, lx + dx - 0.4, by, 4.2, 4.0, shoe);
            if (ft) {
                rect(x, lx + dx - 0.4, by - 1.4, 4.2, 1.5, shoeTop);
                if (ft.wing) rect(x, lx + dx - 1.6, by - 2.0, 1.6, 1.6, '#ffffff');
            }
        }
    }
    function arm(x, ax, tunic, tdark, skin, bd, far, sw, axes) {
        const swing = sw ? sw * 1.4 : 0;
        const sleeveCol = far ? tdark : (bd && bd.kind !== 'robe' ? bd.dark : tunic);
        if (axes) {
            if (!far && Math.abs(ax) > 4) {
                // Front/back relaxed Dual Axes stance: arms lowered and slightly spread outward from hips, elbows slightly bent
                const out = ax < 0 ? -1 : 1;
                const sx = ax - out * 0.4, sy = -25.8;
                const ex = ax + out * 1.8, ey = -19.8 + swing * 0.18;
                const hx = ax + out * 1.4, hy = -14.0 + swing * 0.25;
                poly4(x, sx - 1.5, sy, sx + 1.5, sy, ex + 1.5, ey, ex - 1.5, ey, sleeveCol);
                poly4(x, ex - 1.4, ey, ex + 1.4, ey, hx + 1.3, hy, hx - 1.3, hy, sleeveCol);
                if (bd && (bd.kind === 'plate' || bd.kind === 'scale')) rect(x, ex - 1.5, ey - 0.6, 3.0, 1.2, bd.light);
                oval(x, hx, hy, 2.1, 2.1, skin);
                return;
            } else {
                // Side view relaxed Dual Axes stance: elbow slightly bent, forearm lowered beside hip
                const sx = 0, sy = -25.8;
                const ex = (far ? -1.8 : -1.0) + swing * 0.3, ey = -19.8;
                const hx = (far ? -2.8 : 3.4) + swing * 0.5, hy = -14.0;
                poly4(x, sx - 1.5, sy, sx + 1.5, sy, ex + 1.5, ey, ex - 1.5, ey, sleeveCol);
                poly4(x, ex - 1.4, ey, ex + 1.4, ey, hx + 1.3, hy, hx - 1.3, hy, sleeveCol);
                oval(x, hx, hy, 2.1, 2.1, skin);
                return;
            }
        }
        rect(x, ax - 1.6, -25.5 + swing * 0.35, 3.2, 8.8, sleeveCol);
        if (bd && (bd.kind === 'plate' || bd.kind === 'scale')) rect(x, ax - 1.6, -19.8 + swing * 0.35, 3.2, 1.2, bd.light);
        oval(x, ax, -15.5 + swing * 0.35, 2.1, 2.1, skin);
    }
    function head(x, look, hd, dir, cos) {
        const side = dir === 2, back = dir === 1, hy = -33.5;
        rect(x, -1.5, -29.5, 3, 2.6, look.skin);                             // neck
        oval(x, 0, hy, 7, 6.6, look.skin);
        if (look.style === 2 && !hd && !cos) oval(x, -2, hy - 4, 2.5, 1.4, '#ffffff');  // shine on a bald head
        // hair (not under a full helmet)
        const full = hd && (hd.kind === 'knight' || hd.kind === 'hood');
        const hr = (cos && (cos.kind === 'princess' || cos.kind === 'hylian' || cos.kind === 'sheikah')) ? cos.hair : (cos && cos.kind === 'plumber' ? '#5a3214' : look.hair);
        if (!full && (look.style !== 2 || cos)) {
            if (back) { oval(x, -Q, hy - 0.5, 7.4, 7, hr); if (look.style === 1 || (cos && cos.kind === 'princess')) rect(x, -4 - Q * 1.5, hy + 2, 8, 9, hr); if (Q) oval(x, 5.4, hy + 1.5, 1.6, 2.2, look.skin); }
            else if (side) {
                poly4(x, -7.4, hy - 1, 5, hy - 7.6, 7.4, hy - 3, -3, hy + 5, hr);
                oval(x, -1, hy - 3, 7, 4.6, hr);
                if (look.style === 1 || (cos && cos.kind === 'princess')) { rect(x, -8.5, hy - 1, 3.6, 10, hr); }
            } else {
                oval(x, 0, hy - 3.2, 7.6, 4.6, hr);
                rect(x, -7.4, hy - 3, 2.4, 6, hr); rect(x, 5, hy - 3, 2.4, 6, hr);
                if (look.style === 0 || (cos && cos.kind === 'hylian')) { poly4(x, -4.5, hy - 4, 0, hy - 4, -1.2, hy - 0.5, -5.5, hy - 1, hr); poly4(x, 0, hy - 4, 4.5, hy - 4, 5.5, hy - 1, 1.2, hy - 0.5, hr); }
                if (look.style === 4) for (let k = -2; k <= 2; k++) oval(x, k * 2.6, hy - 6, 2, 2, hr);
                if (look.style === 1 || (cos && cos.kind === 'princess')) { rect(x, -8.4, hy - 1, 2.6, 9, hr); rect(x, 5.8, hy - 1, 2.6, 9, hr); }
            }
        }
        // face
        if (!back) {
            const ey = hy + 0.5;
            const eyeCol = (cos && cos.kind === 'sheikah') ? '#d82828' : (cos && cos.kind === 'hylian') ? '#1e4898' : '#20182a';
            if (side) { rect(x, 3.4, ey - 1, 1.6, 2.2, eyeCol); rect(x, 6.4, ey + 1.5, 1.2, 1.2, shade(look.skin)); }
            else if (Q) { rect(x, -1.2, ey - 1, 1.6, 2.2, eyeCol); rect(x, 3.8, ey - 1, 1.6, 2.2, eyeCol); rect(x, 6.6, ey + 1, 1.2, 1.4, shade(look.skin)); if (!F) { x.fillStyle = 'rgba(255,120,120,0.35)'; x.fillRect(-3, ey + 2, 2, 1.2); x.fillRect(5, ey + 2, 1.6, 1.2); } }
            else { rect(x, -3.4, ey - 1, 1.6, 2.2, eyeCol); rect(x, 1.8, ey - 1, 1.6, 2.2, eyeCol); if (!F) { x.fillStyle = 'rgba(255,120,120,0.35)'; x.fillRect(-5.5, ey + 2, 2, 1.2); x.fillRect(3.5, ey + 2, 2, 1.2); } }
            if (cos && cos.kind === 'plumber') {
                // Iconic plumber nose & mustache
                oval(x, side ? 6.2 : 0, ey + 1.4, 2.2, 1.6, look.skin);
                rect(x, side ? 2.5 : -4.6, ey + 2.5, side ? 4.8 : 9.2, 2.1, '#4a2810');
            } else if (look.beard && !cos) {
                if (side) poly4(x, 0, hy + 3, 6, hy + 3, 4, hy + 8, -1, hy + 6, look.beard); else poly4(x, -5, hy + 2.5, 5, hy + 2.5, 3, hy + 8, -3, hy + 8, look.beard);
            }
        }
        if (cos) {
            if (cos.kind === 'hylian') {
                // Pointed Hylian elf ears + long Phrygian Kokiri cap trailing behind
                if (!side) {
                    poly4(x, -7, hy - 0.5, -11.5, hy - 2.2, -10.5, hy + 1.2, -7, hy + 1.8, look.skin);
                    poly4(x, 7, hy - 0.5, 11.5, hy - 2.2, 10.5, hy + 1.2, 7, hy + 1.8, look.skin);
                } else {
                    poly4(x, -1, hy - 0.5, -5.5, hy - 2.4, -4.5, hy + 1.0, -1, hy + 1.8, look.skin);
                }
                oval(x, 0, hy - 4.2, 7.8, 4.4, cos.cap);
                rect(x, -7.8, hy - 2.4, 15.6, 1.8, cos.capDark);
                if (side) {
                    poly4(x, -6, hy - 6.5, 4, hy - 6.5, -14.5, hy + 3.5, -11.5, hy + 5.5, cos.cap);
                } else {
                    poly4(x, -5.5, hy - 6.5, 5.5, hy - 6.5, 11.5, hy + 3.5, 7.0, hy + 5.0, back ? cos.cap : cos.capDark);
                }
            } else if (cos.kind === 'sheikah') {
                // White Sheikah head-wrap & lower face veil
                oval(x, 0, hy - 4.0, 8.0, 4.6, cos.wrap);
                rect(x, -7.8, hy - 2.2, 15.6, 2.0, cos.wrapDark);
                if (!back) {
                    poly4(x, side ? 0 : -6.5, hy + 1.2, side ? 7.2 : 6.5, hy + 1.2, side ? 6.2 : 5.2, hy + 6.5, side ? -1 : -5.2, hy + 6.5, cos.wrap);
                }
            } else if (cos.kind === 'plumber') {
                oval(x, 0, hy - 4.2, 8.2, 4.8, cos.cap);
                rect(x, side ? -1 : -8.2, hy - 2.2, side ? 10.5 : 16.4, 2.2, cos.capDark);
                if (!back) {
                    oval(x, side ? 4.2 : 0, hy - 4.8, 2.6, 2.2, '#ffffff');
                    rect(x, side ? 3.4 : -1, hy - 5.6, 2, 1.6, cos.emblem);
                }
            } else if (cos.kind === 'princess') {
                // Golden crown with jewels
                poly4(x, -4.5, hy - 6, 4.5, hy - 6, 5.2, hy - 11.5, -5.2, hy - 11.5, cos.crown);
                poly4(x, -2.5, hy - 10, 0, hy - 13.5, 2.5, hy - 10, 0, hy - 8, cos.crown);
                oval(x, 0, hy - 8.5, 1.4, 1.6, cos.ruby);
                oval(x, -3.2, hy - 8.2, 1.1, 1.2, cos.jewel);
                oval(x, 3.2, hy - 8.2, 1.1, 1.2, cos.jewel);
            }
            return;
        }
        if (!hd) return;
        // helmets
        if (hd.kind === 'cap') {
            oval(x, 0, hy - 3.6, 7.6, 4.4, hd.main);
            rect(x, side ? 0 : -8, hy - 1.6, side ? 9 : 16, 1.8, hd.dark);
            if (hd.wing) {
                poly4(x, -8, hy - 3, -13, hy - 7, -11, hy - 1, -7.5, hy - 1, '#ffffff');
                poly4(x, 8, hy - 3, 13, hy - 7, 11, hy - 1, 7.5, hy - 1, '#ffffff');
            }
        } else if (hd.kind === 'helm') {
            oval(x, 0, hy - 3, 7.8, 5.4, hd.main); rect(x, -7.8, hy - 2, 15.6, 1.8, hd.dark);
            if (!back && !side) rect(x, -0.8, hy - 2, 1.6, 5, hd.dark);
            oval(x, -3, hy - 5.5, 1.6, 1, '#ffffff');
        } else if (hd.kind === 'knight') {
            oval(x, 0, hy, 7.8, 7.4, hd.main);
            if (!back) rect(x, side ? 1 : -5, hy - 0.5, side ? 6.5 : 10, 1.8, '#1b1820');
            oval(x, -3, hy - 4, 1.6, 1.2, '#ffffff');
            poly4(x, -1, hy - 7, 1, hy - 7, side ? -5 : 3, hy - 13, side ? -8 : -3, hy - 12, hd.plume);
        } else if (hd.kind === 'hood') {
            oval(x, 0, hy - 1, 8, 7.8, hd.main);
            if (!back) oval(x, side ? 2.5 : 0, hy + 1, side ? 4.6 : 5.4, 5, look.skin);
            if (!back) { if (side) rect(x, 3.4, hy, 1.6, 2, '#ffd25a'); else { rect(x, -3.2, hy, 1.6, 2, '#ffd25a'); rect(x, 1.6, hy, 1.6, 2, '#ffd25a'); } }
        }
    }
    // where the weapon hand is, for the game to draw the weapon (front: right hand; side: near hand)
    function hand(dir, flip) { return dir === 2 ? (flip ? -3 : 3) : dir === 1 ? -9 : 9; }

    return { draw, shade, hand, BODY, HEAD, FEET, COSTUME };
})();
