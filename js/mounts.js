/* Hollowmere: the mount sprites (open-source art, see README "Credits").
 *   assets/mounts/horse_*.png  "Animated horse" by ScratchIO (CC0): 60 x 33 frames, facing left
 *   assets/mounts/dragon.png   "Flying Dragon" by ZaPaper for Buko Studios, commissioned by PlayCraft (CC-BY 3.0):
 *                              191 x 161 frames, rows N, E, S, W, 3 wing beats each
 *   the Hollow Charger (chapter 3) is made from the same horse sheets at load time: every pixel is mapped through a
 *   ghostly ice-blue gradient, with an outline glow, then given feathered wings and a mane of blue fire when drawn.
 *   Seen from the front or the back (riding up or down the screen) the horses are drawn in code from the same colours.
 * Until the pictures are loaded (or if they fail), the game keeps its own drawings. */
window.HM_MOUNTART = (function () {
    'use strict';
    const IMG = {}, HW = 60, HH = 33, DW = 191, DH = 161;
    function load(version) {
        for (const n of ['horse_walk', 'horse_run', 'horse_idle', 'dragon']) {
            const im = new Image();
            im.onload = () => { IMG[n] = im; if (n === 'horse_run' || n === 'horse_idle') IMG['ghost_' + n] = ghostly(im); };
            im.src = 'assets/mounts/' + n + '.png?v=' + version;
        }
    }
    // the horse sheet turned spectral: dark pixels become deep blue, light ones ice and white, with a soft cyan rim
    function ghostly(im) {
        const w = im.width, h = im.height, c = document.createElement('canvas'); c.width = w; c.height = h;
        const x = c.getContext('2d'); x.drawImage(im, 0, 0);
        let d; try { d = x.getImageData(0, 0, w, h); } catch (e) { return null; }
        const a = d.data, src = new Uint8ClampedArray(a);
        const ramp = [[30, 60, 130], [70, 150, 230], [150, 225, 255], [240, 252, 255]];
        for (let i = 0; i < a.length; i += 4) {
            if (!src[i + 3]) {                                                      // a cyan rim around the body
                const px = (i >> 2) % w, py = ((i >> 2) / w) | 0;
                let n = 0;
                for (let k = 0; k < 4; k++) { const qx = px + (k === 0 ? 1 : k === 1 ? -1 : 0), qy = py + (k === 2 ? 1 : k === 3 ? -1 : 0); if (qx >= 0 && qy >= 0 && qx < w && qy < h && src[(qy * w + qx) * 4 + 3]) n++; }
                if (n && (px % HW) !== 0 && (px % HW) !== HW - 1) { a[i] = 120; a[i + 1] = 220; a[i + 2] = 255; a[i + 3] = 110; }
                continue;
            }
            const l = (src[i] * 0.3 + src[i + 1] * 0.59 + src[i + 2] * 0.11) / 255, t = Math.min(2.999, 0.6 + l * 4.2), k = t | 0, f = t - k;
            a[i] = ramp[k][0] + (ramp[k + 1][0] - ramp[k][0]) * f; a[i + 1] = ramp[k][1] + (ramp[k + 1][1] - ramp[k][1]) * f; a[i + 2] = ramp[k][2] + (ramp[k + 1][2] - ramp[k][2]) * f;
            a[i + 3] = Math.min(255, src[i + 3] * 0.92);
        }
        x.putImageData(d, 0, 0);
        return c;
    }
    // a horse standing on y (feet), centred on x; fx: 1 = facing right; s: scale; moving: run cycle
    function horse(ctx, x, y, walk, fx, s, moving, t) {
        const sheet = moving ? IMG.horse_run : IMG.horse_idle;
        if (!sheet) return false;
        const n = (sheet.width / HW) | 0, f = moving ? ((walk * 1.5) | 0) % n : ((t / 10) | 0) % n;
        ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y, 24 * s, 5 * s, 0, 0, 6.2832); ctx.fill();
        ctx.save(); ctx.translate(x, y + 1); if (fx > 0) ctx.scale(-1, 1);
        ctx.drawImage(sheet, f * HW, 0, HW, HH, -HW / 2 * s, -HH * s, HW * s, HH * s);
        ctx.restore();
        return true;
    }
    // a horse seen from the front (dir 0) or the back (dir 1), drawn in code
    const HPAL = { horse: ['#8a5a34', '#5a3a22', '#3a2416'], charger: ['#5ab8f0', '#1e3a7a', '#bff4ff'] };
    function horseFB(ctx, x, y, walk, dir, s, kind) {
        const p = HPAL[kind] || HPAL.horse, l = Math.sin(walk * 1.6) * 2.5 * s, b = walk ? Math.abs(Math.sin(walk * 1.6)) * 1.5 : 0, gh = kind === 'charger';
        if (!gh) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y, 13 * s, 5 * s, 0, 0, 6.2832); ctx.fill(); }
        if (gh) ctx.globalAlpha = 0.9;
        ctx.fillStyle = p[1]; ctx.fillRect(x - 8 * s, y - 13 * s + l, 4 * s, 13 * s - l); ctx.fillRect(x + 4 * s, y - 13 * s - l, 4 * s, 13 * s + l);
        ctx.fillStyle = p[0]; ctx.beginPath(); ctx.ellipse(x, y - 17 * s - b, 11 * s, 9 * s, 0, 0, 6.2832); ctx.fill();
        if (dir === 0) {                                                            // front: the long face and the chest
            ctx.beginPath(); ctx.ellipse(x, y - 30 * s - b, 5 * s, 10 * s, 0, 0, 6.2832); ctx.fill();
            ctx.fillStyle = p[2]; ctx.fillRect(x - 1.5 * s, y - 40 * s - b, 3 * s, 8 * s);
            ctx.fillStyle = p[1]; ctx.fillRect(x - 6 * s, y - 39 * s - b, 3 * s, 4 * s); ctx.fillRect(x + 3 * s, y - 39 * s - b, 3 * s, 4 * s);
            ctx.fillStyle = gh ? '#ffffff' : '#1b1820'; ctx.fillRect(x - 4 * s, y - 32 * s - b, 2 * s, 2 * s); ctx.fillRect(x + 2 * s, y - 32 * s - b, 2 * s, 2 * s);
        } else {                                                                    // back: the tail
            ctx.strokeStyle = p[2]; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x, y - 18 * s - b); ctx.quadraticCurveTo(x + Math.sin(walk + 1) * 4 * s, y - 8 * s, x, y - 2 * s); ctx.stroke();
            ctx.fillStyle = p[0]; ctx.beginPath(); ctx.ellipse(x, y - 30 * s - b, 4 * s, 6 * s, 0, 0, 6.2832); ctx.fill();
            ctx.fillStyle = p[1]; ctx.fillRect(x - 5 * s, y - 37 * s - b, 3 * s, 4 * s); ctx.fillRect(x + 2 * s, y - 37 * s - b, 3 * s, 4 * s);
        }
        ctx.globalAlpha = 1;
    }
    // feathered wings of light, beating (no gradients per frame: three cached feather colours)
    const FEATHER = ['rgba(90,180,255,0.85)', 'rgba(150,215,255,0.7)', 'rgba(230,250,255,0.55)'];
    function wings(ctx, x, y, t, s, k, dir) {
        const beat = Math.sin(t * 0.18) * 0.5, sp = dir === 2 ? 1 : 1.5;
        ctx.save(); ctx.translate(x, y); ctx.scale(k * sp, 1); ctx.rotate(-0.5 + beat);
        for (let f = 0; f < 5; f++) {
            const len = (26 - f * 3) * s;
            ctx.fillStyle = FEATHER[f % 3]; ctx.beginPath(); ctx.moveTo(0, f * 2 * s); ctx.quadraticCurveTo(len * 0.6, -6 * s + f * 3 * s, len, f * 4 * s); ctx.quadraticCurveTo(len * 0.5, 4 * s + f * 3 * s, 0, 4 * s + f * 2 * s); ctx.fill();
        }
        ctx.restore();
    }
    function flameMane(ctx, x, y, t, s) {
        for (let k = 0; k < 4; k++) {
            const h = (6 + ((t * 0.5 + k * 7) % 8)) * s;
            ctx.globalAlpha = 0.65 - k * 0.12; ctx.fillStyle = k & 1 ? '#9ae8ff' : '#e8fbff';
            ctx.beginPath(); ctx.moveTo(x - 3 * s + k * 2 * s, y); ctx.quadraticCurveTo(x - s + k * 2 * s + Math.sin(t * 0.3 + k) * 2, y - h, x + s + k * 2 * s, y); ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    // the Hollow Charger, z pixels in the air above y; dir: 0 down, 1 up, 2 side; fx: 1 = facing right
    function charger(ctx, x, y, z, walk, dir, fx, s, moving, t, glow) {
        const sh = 24 + Math.sin(t * 0.05) * 3, yy = y - z;
        ctx.fillStyle = 'rgba(20,40,90,0.28)'; ctx.beginPath(); ctx.ellipse(x, y, sh * s * 0.9, sh * s * 0.28, 0, 0, 6.2832); ctx.fill();
        if (glow) { ctx.globalAlpha = 0.35 + Math.sin(t * 0.1) * 0.1; ctx.drawImage(glow, x - 34 * s, yy - 50 * s, 68 * s, 60 * s); ctx.globalAlpha = 1; }
        if (dir !== 2) {
            wings(ctx, x - 4 * s, yy - 20 * s, t, s, -1, dir); wings(ctx, x + 4 * s, yy - 20 * s, t, s, 1, dir);
            horseFB(ctx, x, yy, walk, dir, s, 'charger'); flameMane(ctx, x - 3 * s, yy - (dir === 0 ? 40 : 36) * s, t, s);
            return true;
        }
        const sheet = moving ? IMG.ghost_horse_run : IMG.ghost_horse_idle;
        wings(ctx, x - fx * 4 * s, yy - 22 * s, t, s, -fx, 2);
        if (sheet) {
            const n = (sheet.width / HW) | 0, f = moving ? ((walk * 1.5) | 0) % n : ((t / 10) | 0) % n;
            ctx.save(); ctx.translate(x, yy + 1); if (fx > 0) ctx.scale(-1, 1);
            ctx.drawImage(sheet, f * HW, 0, HW, HH, -HW / 2 * s, -HH * s, HW * s, HH * s);
            ctx.restore();
        } else horseFB(ctx, x, yy, walk, 0, s, 'charger');
        flameMane(ctx, x + fx * 16 * s, yy - 27 * s, t, s * 0.9);
        wings(ctx, x + fx * 2 * s, yy - 21 * s, t + 3, s, fx, 2);
        return true;
    }
    // the dragon flying z pixels above y; dir: 0 down, 1 up, 2 side (flip = left); wings beat by itself
    function dragon(ctx, x, y, z, dir, flip, t, s, flash) {
        const sheet = IMG.dragon;
        if (!sheet) return false;
        const row = dir === 1 ? 0 : dir === 0 ? 2 : flip ? 3 : 1, k = ((t / 7) | 0) % 4, col = k === 3 ? 1 : k;
        const sh = 26 + Math.sin(t * 0.05) * 3;                     // the shadow breathes with the height
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y, sh * s * 1.6, sh * s * 0.45, 0, 0, 6.2832); ctx.fill();
        if (flash) ctx.globalAlpha = 0.55;
        ctx.drawImage(sheet, col * DW, row * DH, DW, DH, x - DW / 2 * s, y - z - DH * 0.78 * s, DW * s, DH * s);
        ctx.globalAlpha = 1;
        return true;
    }
    return { load, horse, horseFB, dragon, charger, get ready() { return !!(IMG.horse_run && IMG.dragon); }, get hasDragon() { return !!IMG.dragon; } };
})();
