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
        padded_vest: { main: '#8a5a34', dark: '#5e3a1e', light: '#b07a4a', kind: 'leather' },
        chainmail:   { main: '#8f98a6', dark: '#5f6878', light: '#c4ccd8', kind: 'mail' },
        plate_armor: { main: '#cfd7e3', dark: '#7c8798', light: '#ffffff', kind: 'plate', trim: '#d8b04a' },
        tide_mail:   { main: '#2f9c9a', dark: '#1d6668', light: '#7fe0d6', kind: 'scale', trim: '#e8d27a' },
        mage_robe:   { main: '#a8322e', dark: '#6e1c1a', light: '#ff8a5a', kind: 'robe', trim: '#ffd25a' }
    };
    const HEAD = {
        leather_cap: { main: '#7a5230', dark: '#4e331c', kind: 'cap' },
        iron_helm:   { main: '#9aa2ae', dark: '#626a78', kind: 'helm' },
        knight_helm: { main: '#d0d8e4', dark: '#7c8798', kind: 'knight', plume: '#d23a3a' },
        coral_helm:  { main: '#3fb0a6', dark: '#1d6668', kind: 'knight', plume: '#ff8a6a' },
        hood:        { main: '#4a3a5a', dark: '#2a2036', kind: 'hood' }
    };
    const FEET = {
        leather_boots: { main: '#6b4a2e', top: '#8a5f3a' },
        swift_boots:   { main: '#2f7a4f', top: '#5ac08a', wing: true },
        iron_greaves:  { main: '#8a929e', top: '#c0c8d4' },
        wave_boots:    { main: '#1d6668', top: '#7fe0d6', wing: true }
    };

    /* dir: 0 front (facing down), 1 back (facing up), 2 side; flip = facing left
     * walk: phase in radians (0 = standing), lean: -1..1 forward lean when striking */
    function draw(x, X, Y, look, gear, dir, flip, walk, lean, flash, s) {
        F = !!flash;
        s = s || 1;
        x.save(); x.translate(X, Y); if (s !== 1) x.scale(s, s); if (flip) x.scale(-1, 1);
        if (lean) x.rotate(lean * 0.12);
        const sw = walk ? Math.sin(walk) : 0, bob = walk ? -Math.abs(Math.cos(walk)) * 1.2 : 0;
        const bd = BODY[gear.body], hd = HEAD[gear.head], ft = FEET[gear.feet];
        const tunic = bd ? bd.main : look.tunic, tdark = bd ? bd.dark : shade(look.tunic), tlight = bd ? bd.light : look.trim;
        const side = dir === 2, back = dir === 1;
        // shadow
        if (!F) { x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(0, 0, 9, 3.4, 0, 0, 6.2832); x.fill(); }
        x.translate(0, bob);
        // cape behind the body (in front when seen from the back)
        if (look.cape && !back) poly4(x, -7, -24, 7, -24, side ? 3 : 9, -6, side ? -11 - sw * 2 : -9, -6, shade(look.cape));
        // legs
        const pants = look.pants, shoe = ft ? ft.main : look.shoes, shoeTop = ft ? ft.top : look.shoes;
        if (side) {
            leg(x, -1 + sw * 3, -12, pants, shoe, shoeTop, ft, 1);
            leg(x, -1 - sw * 3, -12, shade(pants), shade(shoe), shoeTop, ft, 1);
        } else {
            leg(x, -4, -12 - Math.max(0, sw) * 1.5, pants, shoe, shoeTop, ft, 0);
            leg(x, 1, -12 - Math.max(0, -sw) * 1.5, pants, shoe, shoeTop, ft, 0);
        }
        // the far arm (side view) goes behind the body
        if (side) arm(x, -1 - sw * 2.5, tunic, tdark, look.skin, bd, 1);
        // torso: a tunic that flares at the hem, or armour
        const tw = side ? 6 : 7.5;
        poly4(x, -tw, -25, tw, -25, tw + 1.5, -9, -tw - 1.5, -9, tunic);
        rect(x, -tw - 1.5, -11, tw * 2 + 3, 2, tdark);                       // hem shadow
        if (!bd) {                                                          // cloth: a collar and a trim line
            rect(x, side ? -1 : -2, -25, side ? 3 : 4, 3, look.trim);
            if (!side) rect(x, -0.5, -22, 1, 9, tdark);
        } else if (bd.kind === 'leather') {
            rect(x, -tw + 1, -24, tw * 2 - 2, 1.5, bd.light);
            for (let k = 0; k < 3; k++) rect(x, -tw + 2, -21 + k * 3.5, tw * 2 - 4, 0.8, bd.dark);
        } else if (bd.kind === 'mail') {
            for (let r = 0; r < 5; r++) for (let k = 0; k < (side ? 3 : 5); k++) rect(x, -tw + 1.5 + k * 2.8 + (r & 1), -23 + r * 3, 1.4, 1.4, (r + k) & 1 ? bd.light : bd.dark);
        } else if (bd.kind === 'plate' || bd.kind === 'scale') {
            poly4(x, -tw + 1, -24, tw - 1, -24, tw - 2, -14, -tw + 2, -14, bd.light);
            poly4(x, -tw + 2, -23, tw - 2, -23, tw - 3, -15, -tw + 3, -15, bd.main);
            if (bd.kind === 'scale') for (let r = 0; r < 3; r++) for (let k = -1; k <= 1; k++) oval(x, k * 3.2 + (r & 1) * 1.6, -21 + r * 2.6, 1.5, 1.1, bd.dark);
            else { rect(x, -0.5, -23, 1, 8, bd.dark); oval(x, -2.5, -20, 1.3, 1, '#ffffff'); }
            rect(x, -tw + 1, -15, tw * 2 - 2, 1, bd.trim);
            if (!side) { oval(x, -tw - 0.5, -23.5, 3.4, 2.6, bd.light); oval(x, tw + 0.5, -23.5, 3.4, 2.6, bd.light); oval(x, -tw - 0.5, -23, 2.4, 1.6, bd.main); oval(x, tw + 0.5, -23, 2.4, 1.6, bd.main); }
            else oval(x, 1, -23.5, 3.6, 2.8, bd.light);
        } else if (bd.kind === 'robe') {
            rect(x, -1, -25, 2, 16, bd.trim); poly4(x, -tw - 1.5, -11, tw + 1.5, -11, tw + 2.5, -6, -tw - 2.5, -6, bd.main);
        }
        // belt
        rect(x, -tw - 0.5, -14, tw * 2 + 1, 2, '#3a2416');
        rect(x, side ? 1 : -1, -14.5, 2.4, 3, '#d8b04a');
        // the near arm(s)
        if (side) arm(x, 1 + sw * 2.5, tunic, tdark, look.skin, bd, 0);
        else { arm(x, -tw - 1.8, tunic, tdark, look.skin, bd, 0, sw); arm(x, tw + 1.8, tunic, tdark, look.skin, bd, 0, -sw); }
        // head
        head(x, look, hd, dir);
        if (look.cape && back) poly4(x, -8, -25, 8, -25, 10, -7 + sw, -10, -7 - sw, look.cape);
        x.restore();
        F = false;
    }
    function shade(col) {                                                    // a darker version of a #rrggbb colour
        const n = parseInt(col.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        return SH[col] || (SH[col] = '#' + ((1 << 24) | ((r * 0.68) << 16) | ((g * 0.68) << 8) | (b * 0.68)).toString(16).slice(1));
    }
    const SH = {};
    function leg(x, lx, top, pants, shoe, shoeTop, ft, side) {
        rect(x, lx, top, 3.4, -top - 3, pants);
        rect(x, lx - (side ? 0 : 0.4), -4, side ? 5 : 4.2, 4, shoe);
        if (ft) { rect(x, lx - 0.4, -5.5, 4.2, 1.6, shoeTop); if (ft.wing) rect(x, lx - 1.6, -6, 1.6, 1.6, '#ffffff'); }
    }
    function arm(x, ax, tunic, tdark, skin, bd, far, sw) {
        const swing = sw ? sw * 1.5 : 0;
        rect(x, ax - 1.6, -23 + swing * 0.3, 3.2, 8, far ? tdark : (bd && bd.kind !== 'robe' ? bd.dark : tunic));
        if (bd && (bd.kind === 'plate' || bd.kind === 'scale')) rect(x, ax - 1.6, -18 + swing * 0.3, 3.2, 1.2, bd.light);
        oval(x, ax, -14 + swing * 0.3, 1.9, 1.9, skin);
    }
    function head(x, look, hd, dir) {
        const side = dir === 2, back = dir === 1, hy = -31;
        rect(x, -1.5, -27, 3, 2.5, look.skin);                               // neck
        oval(x, 0, hy, 7, 6.6, look.skin);
        if (look.style === 2 && !hd) oval(x, -2, hy - 4, 2.5, 1.4, '#ffffff');  // shine on a bald head
        // hair (not under a full helmet)
        const full = hd && (hd.kind === 'knight' || hd.kind === 'hood');
        if (!full && look.style !== 2) {
            const hr = look.hair;
            if (back) { oval(x, 0, hy - 0.5, 7.4, 7, hr); if (look.style === 1) rect(x, -2, hy + 4, 4, 9, hr); }
            else if (side) {
                poly4(x, -7.4, hy - 1, 5, -38.6, 7.4, hy - 3, -3, hy + 5, hr);
                oval(x, -1, hy - 3, 7, 4.6, hr);
                if (look.style === 1) { rect(x, -8.5, hy - 1, 3, 10, hr); }
            } else {
                oval(x, 0, hy - 3.2, 7.6, 4.6, hr);
                rect(x, -7.4, hy - 3, 2.4, 6, hr); rect(x, 5, hy - 3, 2.4, 6, hr);
                if (look.style === 0) { poly4(x, -4, hy - 4, 0, hy - 4, -1, hy - 1, -5, hy - 1.5, hr); poly4(x, 0, hy - 4, 4, hy - 4, 3.5, hy - 1.5, 1, hy - 1, hr); }
                if (look.style === 4) for (let k = -2; k <= 2; k++) oval(x, k * 2.6, hy - 6, 2, 2, hr);
                if (look.style === 1) { rect(x, -8.4, hy - 1, 2.4, 9, hr); rect(x, 6, hy - 1, 2.4, 9, hr); }
            }
        }
        // face
        if (!back) {
            const ey = hy + 0.5;
            if (side) { rect(x, 3.4, ey - 1, 1.6, 2.2, '#20182a'); rect(x, 6.4, ey + 1.5, 1.2, 1.2, shade(look.skin)); }
            else { rect(x, -3.4, ey - 1, 1.6, 2.2, '#20182a'); rect(x, 1.8, ey - 1, 1.6, 2.2, '#20182a'); if (!F) { x.fillStyle = 'rgba(255,120,120,0.35)'; x.fillRect(-5.5, ey + 2, 2, 1.2); x.fillRect(3.5, ey + 2, 2, 1.2); } }
            if (look.beard) { if (side) poly4(x, 0, hy + 3, 6, hy + 3, 4, hy + 8, -1, hy + 6, look.beard); else poly4(x, -5, hy + 2.5, 5, hy + 2.5, 3, hy + 8, -3, hy + 8, look.beard); }
        }
        if (!hd) return;
        // helmets
        if (hd.kind === 'cap') {
            oval(x, 0, hy - 3.6, 7.6, 4.4, hd.main);
            rect(x, side ? 0 : -8, hy - 1.6, side ? 9 : 16, 1.8, hd.dark);
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

    return { draw, shade, hand, BODY, HEAD, FEET };
})();
