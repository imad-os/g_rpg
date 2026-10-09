/* Hollowmere: the mount sprites (open-source art, see README "Credits").
 *   assets/mounts/horse_*.png  "Animated horse" by ScratchIO (CC0): 60 x 33 frames, facing left
 *   assets/mounts/dragon.png   "Flying Dragon" by ZaPaper for Buko Studios, commissioned by PlayCraft (CC-BY 3.0):
 *                              191 x 161 frames, rows N, E, S, W, 3 wing beats each
 * Until the pictures are loaded (or if they fail), the game keeps its own drawings. */
window.HM_MOUNTART = (function () {
    'use strict';
    const IMG = {}, HW = 60, HH = 33, DW = 191, DH = 161;
    function load(version) {
        for (const n of ['horse_walk', 'horse_run', 'horse_idle', 'dragon']) {
            const im = new Image();
            im.onload = () => { IMG[n] = im; };
            im.src = 'assets/mounts/' + n + '.png?v=' + version;
        }
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
    return { load, horse, dragon, get ready() { return !!(IMG.horse_run && IMG.dragon); }, get hasDragon() { return !!IMG.dragon; } };
})();
