/* Hollowmere: the mount sprites (open-source art, see assets/mounts/LICENSE.txt).
 *   assets/mounts/horse_*.png      "Animated horse" by ScratchIO (CC0): 60 x 33 frames, facing left
 *   assets/mounts/horse_ns.png     4-directional N/S horse frames from LPC Horse Extended (CC-BY-SA 3.0)
 *   assets/mounts/shadowmane.png   Armored Northern Warhorse from LPC Horse Extended (96 x 96, 7 cols x 4 rows NESW)
 *   assets/mounts/nightmare.png    Abyssal Hellsteed from LPC Horse Extended (96 x 96, 7 cols x 4 rows NESW)
 *   assets/mounts/wolf.png         Timber Wolf from [LPC] Wolf Animation by Redshrike (64 x 64, 6 cols x 4 rows NESW)
 *   assets/mounts/frostfang.png    Giant Glacial Direwolf from [LPC] Wolf Animation (64 x 64, 6 cols x 4 rows NESW)
 *   assets/mounts/bloodfang.png    Alpha Blood-Wolf / Hellhound from [LPC] Wolf Animation (64 x 64, 6 cols x 4 rows NESW)
 *   assets/mounts/bonecharger.png  Winged Skeletal Warhorse from Stendhal Pegasus (128 x 170, 3 cols x 4 rows NESW)
 *   assets/mounts/dragon.png       "Flying Dragon" by ZaPaper / AntumDeluge (191 x 161, 3 cols x 4 rows NESW)
 *   assets/mounts/nightterror.png  Nocturnal Vampire Blood-Drake from ZaPaper / AntumDeluge (191 x 161, 3 cols x 4 rows NESW)
 */
window.HM_MOUNTART = (function () {
    'use strict';
    const IMG = {}, LISTENERS = [];
    const HW = 60, HH = 33, DW = 191, DH = 161, LW = 96, LH = 96, WW = 64, WH = 64, BW = 128, BH = 170;
    const SHEETS = [
        'horse_walk', 'horse_run', 'horse_idle', 'horse_ns',
        'dragon', 'shadowmane', 'frostfang', 'nightmare',
        'bloodfang', 'bonecharger', 'nightterror', 'wolf', 'yoshi'
    ];

    function notify() {
        for (let i = 0; i < LISTENERS.length; i++) {
            try { LISTENERS[i](); } catch (e) {}
        }
    }

    function onLoad(fn) {
        if (typeof fn === 'function') LISTENERS.push(fn);
    }

    function load(version) {
        const v = version || Date.now();
        for (const n of SHEETS) {
            const im = new Image();
            im.onload = () => {
                IMG[n] = im;
                if (n === 'horse_run' || n === 'horse_idle' || n === 'horse_ns') {
                    IMG['ghost_' + n] = ghostly(im, n === 'horse_ns' ? LW : HW);
                } else if (n === 'nightmare') {
                    IMG.nightmare_fire = bakeNightmareFire(im);
                }
                notify();
            };
            im.src = 'assets/mounts/' + n + '.png?v=' + v;
        }
    }

    function has(m) {
        if (!m) return true;
        if (m === 'horse') return !!(IMG.horse_run && IMG.horse_idle);
        if (m === 'charger') return !!(IMG.ghost_horse_run && IMG.ghost_horse_idle);
        return !!IMG[m];
    }

    // Pre-bake 4 animation frames of flickering hellfire on Nightmare Steed's orange parts once at load time (zero runtime cost)
    function bakeNightmareFire(im) {
        const w = im.width, h = im.height;
        const baseC = document.createElement('canvas'); baseC.width = w; baseC.height = h;
        const bx = baseC.getContext('2d'); bx.drawImage(im, 0, 0);
        let baseD; try { baseD = bx.getImageData(0, 0, w, h); } catch (e) { return null; }
        const src = baseD.data;
        const isFire = new Uint8Array(w * h);
        for (let i = 0, p = 0; i < src.length; i += 4, p++) {
            const r = src[i], g = src[i + 1], b = src[i + 2], a = src[i + 3];
            if (a > 40 && r > 125 && r > g * 1.12 && g > b * 1.35 && b < 120) isFire[p] = 1;
        }
        const fireRamp = [[135, 16, 0], [220, 48, 0], [255, 118, 0], [255, 196, 28], [255, 248, 175]];
        const frames = [];
        for (let f = 0; f < 4; f++) {
            const c = document.createElement('canvas'); c.width = w; c.height = h;
            const cx = c.getContext('2d');
            const d = cx.createImageData(w, h);
            const out = d.data;
            out.set(src);
            const ph = f * 1.570796;
            for (let py = 0; py < h; py++) {
                const cellY = py % LH;
                for (let px = 0; px < w; px++) {
                    const p = py * w + px, i = p << 2;
                    if (isFire[p]) {
                        const baseL = (src[i] * 0.35 + src[i + 1] * 0.55 + src[i + 2] * 0.1) / 255;
                        const wave = Math.sin(px * 0.55 + py * 0.75 - ph) * 0.26 + Math.cos((px - py) * 0.4 + ph) * 0.18;
                        const t = Math.max(0, Math.min(3.999, (baseL + wave) * 4.2));
                        const k = t | 0, fr = t - k;
                        out[i]     = fireRamp[k][0] + (fireRamp[k + 1][0] - fireRamp[k][0]) * fr;
                        out[i + 1] = fireRamp[k][1] + (fireRamp[k + 1][1] - fireRamp[k][1]) * fr;
                        out[i + 2] = fireRamp[k][2] + (fireRamp[k + 1][2] - fireRamp[k][2]) * fr;
                        // Flickering flame tongues rising 1..3 px into empty space above mane, tail, horn, and hooves
                        if (cellY > 3) {
                            const tongueH = 1 + (((px * 5 + py * 3 + f * 3) & 3) === 0 ? 2 : ((px + f) & 1));
                            for (let dy = 1; dy <= tongueH && cellY - dy >= 1; dy++) {
                                const upP = (py - dy) * w + px;
                                if (!src[(upP << 2) + 3]) {
                                    const ui = upP << 2;
                                    const tip = dy === tongueH;
                                    out[ui]     = tip ? 255 : 255;
                                    out[ui + 1] = tip ? 95  : 185;
                                    out[ui + 2] = tip ? 10  : 35;
                                    out[ui + 3] = tip ? 175 : 235;
                                }
                            }
                        }
                    } else if (!src[i + 3] && cellY > 1 && cellY < LH - 1 && (px % LW) > 1 && (px % LW) < LW - 1) {
                        // Subtle warm fire aura on adjacent transparent pixels
                        if ((px > 0 && isFire[p - 1]) || (px + 1 < w && isFire[p + 1]) || (py > 0 && isFire[p - w])) {
                            out[i] = 255; out[i + 1] = 85; out[i + 2] = 10; out[i + 3] = 85 + ((px + py + f) & 1) * 35;
                        }
                    }
                }
            }
            cx.putImageData(d, 0, 0);
            frames.push(c);
        }
        return frames;
    }

    // the horse sheet turned spectral: dark pixels become deep blue, light ones ice and white, with a soft cyan rim
    function ghostly(im, cellW) {
        const cw = cellW || HW;
        const w = im.width, h = im.height, c = document.createElement('canvas'); c.width = w; c.height = h;
        const x = c.getContext('2d'); x.drawImage(im, 0, 0);
        let d; try { d = x.getImageData(0, 0, w, h); } catch (e) { return null; }
        const a = d.data, src = new Uint8ClampedArray(a);
        const ramp = [[30, 60, 130], [70, 150, 230], [150, 225, 255], [240, 252, 255]];
        for (let i = 0; i < a.length; i += 4) {
            if (!src[i + 3]) {
                const px = (i >> 2) % w, py = ((i >> 2) / w) | 0;
                let n = 0;
                for (let k = 0; k < 4; k++) {
                    const qx = px + (k === 0 ? 1 : k === 1 ? -1 : 0), qy = py + (k === 2 ? 1 : k === 3 ? -1 : 0);
                    if (qx >= 0 && qy >= 0 && qx < w && qy < h && src[(qy * w + qx) * 4 + 3]) n++;
                }
                if (n && (px % cw) !== 0 && (px % cw) !== cw - 1) { a[i] = 120; a[i + 1] = 220; a[i + 2] = 255; a[i + 3] = 110; }
                continue;
            }
            const l = (src[i] * 0.3 + src[i + 1] * 0.59 + src[i + 2] * 0.11) / 255, t = Math.min(2.999, 0.6 + l * 4.2), k = t | 0, f = t - k;
            a[i] = ramp[k][0] + (ramp[k + 1][0] - ramp[k][0]) * f;
            a[i + 1] = ramp[k][1] + (ramp[k + 1][1] - ramp[k][1]) * f;
            a[i + 2] = ramp[k][2] + (ramp[k + 1][2] - ramp[k][2]) * f;
            a[i + 3] = Math.min(255, src[i + 3] * 0.92);
        }
        x.putImageData(d, 0, 0);
        return c;
    }

    // Standard N/E/S/W row index from game dir (0=down/S, 1=up/N, 2=side) and fx (<0 left/W, >0 right/E)
    function neswRow(dir, fx) {
        return dir === 1 ? 0 : dir === 0 ? 2 : fx < 0 ? 3 : 1;
    }

    // Chapter 1 horse standing on y (feet), centred on x; fx: 1 = facing right; s: scale; moving: run cycle
    function horse(ctx, x, y, walk, fx, s, moving, t) {
        const sheet = moving ? IMG.horse_run : IMG.horse_idle;
        if (!sheet) return false;
        const hs = s * 1.22;
        const n = (sheet.width / HW) | 0, f = moving ? ((walk * 1.5) | 0) % n : ((t / 10) | 0) % n;
        ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y, 24 * hs, 5.2 * hs, 0, 0, 6.2832); ctx.fill();
        ctx.save(); ctx.translate(x, y + 1); if (fx > 0) ctx.scale(-1, 1);
        ctx.drawImage(sheet, f * HW, 0, HW, HH, -HW / 2 * hs, -HH * hs, HW * hs, HH * hs);
        ctx.restore();
        return true;
    }

    // North (dir 1) or South (dir 0) view for horse & charger using pixel-art horse_ns.png
    const HPAL = { horse: ['#8a5a34', '#5a3a22', '#3a2416'], charger: ['#5ab8f0', '#1e3a7a', '#bff4ff'] };
    function horseFB(ctx, x, y, walk, dir, s, kind) {
        const gh = kind === 'charger';
        const nsSheet = gh ? IMG.ghost_horse_ns : IMG.horse_ns;
        if (nsSheet) {
            const moving = walk > 0;
            const col = moving ? 1 + (((walk * 1.5) | 0) % 6) : 0;
            const row = dir === 1 ? 0 : 1; // Row 0 = North, Row 1 = South
            const ps = s * 0.86;
            if (!gh) {
                ctx.fillStyle = 'rgba(0,0,0,0.28)';
                ctx.beginPath(); ctx.ellipse(x, y, 16 * s, 5.8 * s, 0, 0, 6.2832); ctx.fill();
            }
            ctx.drawImage(nsSheet, col * LW, row * LH, LW, LH, x - (LW / 2) * ps, y - 88 * ps, LW * ps, LH * ps);
            return true;
        }
        const p = HPAL[kind] || HPAL.horse, l = Math.sin(walk * 1.6) * 2.5 * s, b = walk ? Math.abs(Math.sin(walk * 1.6)) * 1.5 : 0;
        if (!gh) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y, 13 * s, 5 * s, 0, 0, 6.2832); ctx.fill(); }
        if (gh) ctx.globalAlpha = 0.9;
        ctx.fillStyle = p[1]; ctx.fillRect(x - 8 * s, y - 13 * s + l, 4 * s, 13 * s - l); ctx.fillRect(x + 4 * s, y - 13 * s - l, 4 * s, 13 * s + l);
        ctx.fillStyle = p[0]; ctx.beginPath(); ctx.ellipse(x, y - 17 * s - b, 11 * s, 9 * s, 0, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 1;
        return true;
    }

    // Chapter 1 Timber Wolf mount (6 cols x 4 rows of 64x64 NESW)
    function wolf(ctx, x, y, walk, dir, fx, s, moving, t, bite) {
        const sheet = IMG.wolf;
        if (!sheet) return false;
        const row = neswRow(dir, fx);
        const col = bite > 0 ? 5 : moving ? 1 + (((walk * 1.6) | 0) & 3) : 0;
        ctx.fillStyle = 'rgba(0,0,0,0.30)';
        ctx.beginPath(); ctx.ellipse(x, y, (dir === 2 ? 22 : 13) * s, 5 * s, 0, 0, 6.2832); ctx.fill();
        ctx.drawImage(sheet, col * WW, row * WH, WW, WH, x - (WW / 2) * s, y - 58 * s, WW * s, WH * s);
        return true;
    }

    // Chapter 4 Shadowmane: Armored Northern Warhorse (7 cols x 4 rows of 96x96 NESW)
    function shadowmane(ctx, x, y, walk, dir, fx, s, moving, t) {
        const sheet = IMG.shadowmane;
        ctx.fillStyle = 'rgba(0,0,0,0.34)';
        ctx.beginPath(); ctx.ellipse(x, y, (dir === 2 ? 32 : 17) * s, 6.5 * s, 0, 0, 6.2832); ctx.fill();
        if (!sheet) return false;
        const row = neswRow(dir, fx);
        const col = moving ? 1 + (((walk * 1.5) | 0) % 6) : 0;
        const ps = s * 1.02;
        ctx.drawImage(sheet, col * LW, row * LH, LW, LH, x - (LW / 2) * ps, y - 88 * ps, LW * ps, LH * ps);
        return true;
    }

    // Chapter 4 Frostfang: Giant Glacial Direwolf (6 cols x 4 rows of 64x64 NESW)
    function frostfang(ctx, x, y, walk, dir, fx, s, moving, t, bite) {
        const sheet = IMG.frostfang;
        ctx.fillStyle = 'rgba(15,35,60,0.34)';
        ctx.beginPath(); ctx.ellipse(x, y, (dir === 2 ? 24 : 14) * s, 5.5 * s, 0, 0, 6.2832); ctx.fill();
        if (!sheet) return false;
        const row = neswRow(dir, fx);
        const col = bite > 0 ? 5 : moving ? 1 + (((walk * 1.6) | 0) & 3) : 0;
        const ps = s * 0.92;
        ctx.drawImage(sheet, col * WW, row * WH, WW, WH, x - (WW / 2) * ps, y - 58 * ps, WW * ps, WH * ps);
        // Subtle glacial frost crystals drifting around paws
        ctx.fillStyle = 'rgba(150,235,255,0.65)';
        for (let i = 0; i < 2; i++) {
            const ox = Math.sin((t || 0) * 0.12 + i * 3.1) * 14 * s;
            const oy = -4 * s - (((t || 0) * 0.4 + i * 9) % 10) * s;
            ctx.fillRect(x + ox, y + oy, 2, 2);
        }
        return true;
    }

    // Ultra-lightweight procedural fire tongues for Nightmare Steed's mane & tail (4 curves, <0.01ms)
    function hellfireMane(ctx, x, y, t, s) {
        const tt = t || 0;
        for (let k = 0; k < 4; k++) {
            const h = (7 + ((tt * 0.65 + k * 5) % 9)) * s;
            ctx.globalAlpha = 0.78 - k * 0.14;
            ctx.fillStyle = k === 0 ? '#fff6a8' : (k & 1) ? '#ff9a18' : '#ff3808';
            const bx = x + (k - 1.5) * 2.4 * s;
            ctx.beginPath();
            ctx.moveTo(bx - 2.2 * s, y);
            ctx.quadraticCurveTo(bx + Math.sin(tt * 0.35 + k * 1.7) * 2.5 * s, y - h, bx + 2.2 * s, y);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // Chapter 5 Nightmare: Abyssal Hellsteed (7 cols x 4 rows of 96x96 NESW)
    function nightmare(ctx, x, y, walk, dir, fx, s, moving, t) {
        const tt = t || 0;
        const frames = IMG.nightmare_fire;
        const sheet = (frames && frames[((tt / 4) | 0) & 3]) || IMG.nightmare;
        ctx.fillStyle = 'rgba(40,5,10,0.38)';
        ctx.beginPath(); ctx.ellipse(x, y, (dir === 2 ? 33 : 17) * s, 6.8 * s, 0, 0, 6.2832); ctx.fill();
        if (!sheet) return false;
        const row = neswRow(dir, fx);
        const col = moving ? 1 + (((walk * 1.5) | 0) % 6) : 0;
        const ps = s * 1.05;
        ctx.drawImage(sheet, col * LW, row * LH, LW, LH, x - (LW / 2) * ps, y - 88 * ps, LW * ps, LH * ps);
        // Low-cost dancing flame tongues along crest & tail
        if (dir === 2) {
            hellfireMane(ctx, x + fx * 15 * ps, y - 40 * ps, tt, ps * 0.85);
            hellfireMane(ctx, x - fx * 22 * ps, y - 28 * ps, tt + 11, ps * 0.75);
        } else {
            hellfireMane(ctx, x, y - (dir === 0 ? 48 : 44) * ps, tt, ps * 0.85);
        }
        return true;
    }

    // Chapter 5 Bloodfang: Colossal Alpha Blood-Wolf / Bone-Spiked Hellhound (6 cols x 4 rows of 64x64 NESW)
    function bloodfang(ctx, x, y, walk, dir, fx, s, moving, t, bite) {
        const sheet = IMG.bloodfang;
        ctx.fillStyle = 'rgba(45,5,12,0.38)';
        ctx.beginPath(); ctx.ellipse(x, y, (dir === 2 ? 25 : 14) * s, 5.5 * s, 0, 0, 6.2832); ctx.fill();
        if (!sheet) return false;
        const row = neswRow(dir, fx);
        const col = bite > 0 ? 5 : moving ? 1 + (((walk * 1.6) | 0) & 3) : 0;
        const ps = s * 0.96;
        ctx.drawImage(sheet, col * WW, row * WH, WW, WH, x - (WW / 2) * ps, y - 58 * ps, WW * ps, WH * ps);
        // Dark crimson blood-mist motes
        ctx.fillStyle = 'rgba(235,30,48,0.68)';
        for (let i = 0; i < 2; i++) {
            const ox = Math.cos((t || 0) * 0.14 + i * 2.7) * 15 * s;
            const oy = -5 * s - (((t || 0) * 0.35 + i * 8) % 12) * s;
            ctx.fillRect(x + ox, y + oy, 2, 2);
        }
        return true;
    }

    // Feathered wings of light for Chapter 3 Hollow Charger
    const FEATHER = ['rgba(90,180,255,0.85)', 'rgba(150,215,255,0.7)', 'rgba(230,250,255,0.55)'];
    function wings(ctx, x, y, t, s, k, dir) {
        const beat = Math.sin(t * 0.18) * 0.5, sp = dir === 2 ? 1 : 1.5;
        ctx.save(); ctx.translate(x, y); ctx.scale(k * sp, 1); ctx.rotate(-0.5 + beat);
        for (let f = 0; f < 5; f++) {
            const len = (26 - f * 3) * s;
            ctx.fillStyle = FEATHER[f % 3];
            ctx.beginPath();
            ctx.moveTo(0, f * 2 * s);
            ctx.quadraticCurveTo(len * 0.6, -6 * s + f * 3 * s, len, f * 4 * s);
            ctx.quadraticCurveTo(len * 0.5, 4 * s + f * 3 * s, 0, 4 * s + f * 2 * s);
            ctx.fill();
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

    // Chapter 3 Hollow Charger, z pixels in the air above y; dir: 0 down, 1 up, 2 side; fx: 1 = facing right
    function charger(ctx, x, y, z, walk, dir, fx, s, moving, t, glow) {
        const hs = s * 1.22;
        const sh = 26 + Math.sin(t * 0.05) * 3, yy = y - z;
        ctx.fillStyle = 'rgba(20,40,90,0.28)'; ctx.beginPath(); ctx.ellipse(x, y, sh * hs * 0.9, sh * hs * 0.28, 0, 0, 6.2832); ctx.fill();
        if (glow) { ctx.globalAlpha = 0.35 + Math.sin(t * 0.1) * 0.1; ctx.drawImage(glow, x - 34 * hs, yy - 50 * hs, 68 * hs, 60 * hs); ctx.globalAlpha = 1; }
        if (dir !== 2) {
            wings(ctx, x - 4 * hs, yy - 20 * hs, t, hs, -1, dir); wings(ctx, x + 4 * hs, yy - 20 * hs, t, hs, 1, dir);
            horseFB(ctx, x, yy, walk, dir, hs, 'charger'); flameMane(ctx, x - 3 * hs, yy - (dir === 0 ? 40 : 36) * hs, t, hs);
            return true;
        }
        const sheet = moving ? IMG.ghost_horse_run : IMG.ghost_horse_idle;
        wings(ctx, x - fx * 4 * hs, yy - 22 * hs, t, hs, -fx, 2);
        if (sheet) {
            const n = (sheet.width / HW) | 0, f = moving ? ((walk * 1.5) | 0) % n : ((t / 10) | 0) % n;
            ctx.save(); ctx.translate(x, yy + 1); if (fx > 0) ctx.scale(-1, 1);
            ctx.drawImage(sheet, f * HW, 0, HW, HH, -HW / 2 * hs, -HH * hs, HW * hs, HH * hs);
            ctx.restore();
        } else horseFB(ctx, x, yy, walk, 0, hs, 'charger');
        flameMane(ctx, x + fx * 16 * hs, yy - 27 * hs, t, hs * 0.9);
        wings(ctx, x + fx * 2 * hs, yy - 21 * hs, t + 3, hs, fx, 2);
        return true;
    }

    // Chapter 5 Bone Charger: Winged Skeletal Necropolis Warhorse (3 cols x 4 rows of 128x170 NESW)
    // Row 0 = North, Row 1 = East (fx > 0), Row 2 = South, Row 3 = West (fx < 0)
    // Col 1 = Standing idle; Col 0 -> 1 -> 2 -> 1 = Walking/galloping cycle when moving
    function bonecharger(ctx, x, y, z, walk, dir, fx, s, moving, t, glow) {
        const sheet = IMG.bonecharger;
        const sh = 28 + Math.sin((t || 0) * 0.05) * 3, yy = y - z;
        ctx.fillStyle = 'rgba(10,25,22,0.34)';
        ctx.beginPath(); ctx.ellipse(x, y, sh * s * 1.1, sh * s * 0.34, 0, 0, 6.2832); ctx.fill();
        if (glow) {
            ctx.globalAlpha = 0.28 + Math.sin((t || 0) * 0.1) * 0.08;
            ctx.drawImage(glow, x - 40 * s, yy - 58 * s, 80 * s, 70 * s);
            ctx.globalAlpha = 1;
        }
        if (!sheet) return false;
        const row = neswRow(dir, fx);
        const k = moving ? (((walk * 1.4) | 0) & 3) : 1;
        const col = k === 3 ? 1 : k;
        const ps = s * 0.62;
        ctx.drawImage(sheet, col * BW, row * BH, BW, BH, x - (BW / 2) * ps, yy - 165 * ps, BW * ps, BH * ps);
        return true;
    }

    // Chapter 2 Dragon flying z pixels above y; dir: 0 down, 1 up, 2 side (flip = left); wings beat by itself
    function dragon(ctx, x, y, z, dir, flip, t, s, flash) {
        const sheet = IMG.dragon;
        if (!sheet) return false;
        const row = dir === 1 ? 0 : dir === 0 ? 2 : flip ? 3 : 1, k = ((t / 7) | 0) % 4, col = k === 3 ? 1 : k;
        const sh = 26 + Math.sin(t * 0.05) * 3;
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y, sh * s * 1.6, sh * s * 0.45, 0, 0, 6.2832); ctx.fill();
        if (flash) ctx.globalAlpha = 0.55;
        ctx.drawImage(sheet, col * DW, row * DH, DW, DH, x - DW / 2 * s, y - z - DH * 0.78 * s, DW * s, DH * s);
        ctx.globalAlpha = 1;
        return true;
    }

    // Chapter 5 Night Terror: Nocturnal Vampire Blood-Drake (3 cols x 4 rows of 191x161 NESW)
    function nightterror(ctx, x, y, z, dir, flip, t, s, flash) {
        const sheet = IMG.nightterror || IMG.dragon;
        if (!sheet) return false;
        const row = dir === 1 ? 0 : dir === 0 ? 2 : flip ? 3 : 1, k = (((t || 0) / 7) | 0) % 4, col = k === 3 ? 1 : k;
        const sh = 26 + Math.sin((t || 0) * 0.05) * 3;
        ctx.fillStyle = 'rgba(18,4,14,0.34)'; ctx.beginPath(); ctx.ellipse(x, y, sh * s * 1.6, sh * s * 0.45, 0, 0, 6.2832); ctx.fill();
        if (flash) ctx.globalAlpha = 0.55;
        ctx.drawImage(sheet, col * DW, row * DH, DW, DH, x - DW / 2 * s, y - z - DH * 0.78 * s, DW * s, DH * s);
        ctx.globalAlpha = 1;
        return true;
    }

    // Chapter 6 Yoshi: Friendly Green Dino Steed with red shell-saddle, orange boots & tongue snap (6 cols x 4 rows of 64x64 NESW)
    function yoshi(ctx, x, y, walk, dir, fx, s, moving, t, bite) {
        const sheet = IMG.yoshi;
        ctx.fillStyle = 'rgba(10,35,15,0.32)';
        ctx.beginPath(); ctx.ellipse(x, y, (dir === 2 ? 22 : 14) * s, 5.5 * s, 0, 0, 6.2832); ctx.fill();
        if (!sheet) return false;
        const row = neswRow(dir, fx);
        const col = bite > 0 ? 5 : moving ? 1 + (((walk * 1.6) | 0) & 3) : 0;
        const ps = s * 0.96;
        ctx.drawImage(sheet, col * WW, row * WH, WW, WH, x - (WW / 2) * ps, y - 58 * ps, WW * ps, WH * ps);
        return true;
    }

    return {
        load, onLoad, has,
        horse, horseFB, wolf,
        dragon, charger,
        shadowmane, frostfang,
        nightmare, bloodfang, bonecharger, nightterror, yoshi,
        get ready() { return !!(IMG.horse_run && IMG.dragon); },
        get hasDragon() { return !!(IMG.dragon || IMG.nightterror); }
    };
})();
