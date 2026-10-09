/* Hollowmere, Chapter 2: The Sunken Lantern. Across the lake, the harbour town of Larkspur lost its
 * Lantern to the sea a hundred years ago. The Grey Choir, masked raiders who serve the Hush, steal
 * from its farms. Win back the Lens (Captain Rook), the Flame (the Cinder Witch), lower the tide,
 * beat the Choirmaster under the sea and light Larkspur's Lantern again.
 * Story steps (S.c2.st): 0 meet Odile · 1 visit Ada · 2 clear the camp (6) · 3 beat Rook · 4 Lens to Odile
 * 5 find Mirelle · 6 beat the Witch · 7 Flame to Mirelle · 8 the Sunken Lighthouse · 9 light the Lantern · 10 free. */
HM_CHAPTERS.def.ch2 = function (api) {
    'use strict';
    const TS = api.TS, GT = api.GT, ART = window.HM_C2_ART, MAPS = window.HM_C2_MAPS, HERO = api.HERO;
    const S = () => api.S, T = () => api.T, C = () => api.S.c2, lines = api.lines;
    function adv(st) { const c = C(); if (c.st < st) { c.st = st; api.SND.fx('quest'); MyPC.announce(objective(api.L)); } api.save(); }

    /* ---------------- the people of Larkspur (drawn in clothes) ---------------- */
    const LOOK = {
        odile:   { skin: '#d8a882', hair: '#d8d0c8', style: 1, tunic: '#2f5f8a', trim: '#e8d27a', pants: '#2a3040', shoes: '#2a2018', cape: '#1d3a5a' },
        mirelle: { skin: '#ecc8a6', hair: '#f4f4f8', style: 1, tunic: '#6d5a8a', trim: '#d9c27a', pants: '#3a3048', shoes: '#2a2018', s: 0.94 },
        gus:     { skin: '#b8805a', hair: '#2a1a10', style: 2, tunic: '#5a4a3a', trim: '#3a2a1e', pants: '#3a3020', shoes: '#2a2018', beard: '#2a1a10', s: 1.14, gear: { body: 'padded_vest' } },
        juna:    { skin: '#e2b48c', hair: '#3a2a6a', style: 4, tunic: '#3f8a6a', trim: '#f2d14a', pants: '#2a4a3a', shoes: '#2a2018' },
        bo:      { skin: '#c89a74', hair: '#6a6a6a', style: 0, tunic: '#3a6a8a', trim: '#e8e0c8', pants: '#3a3a3a', shoes: '#2a2018', beard: '#8a8a8a', gear: { head: 'leather_cap' } },
        nell:    { skin: '#f0c8a0', hair: '#c0582e', style: 1, tunic: '#e8a03a', trim: '#ffffff', pants: '#5a8ad8', shoes: '#2a2018', s: 0.74 },
        tuck:    { skin: '#e8b890', hair: '#6a4a2a', style: 2, tunic: '#f2ead2', trim: '#c8a070', pants: '#6a5a4a', shoes: '#3a2a1e', beard: '#6a4a2a', s: 1.08 },
        pell:    { skin: '#d8a882', hair: '#1a1424', style: 4, tunic: '#a85ad8', trim: '#ffd23f', pants: '#3a2a4a', shoes: '#2a2018', cape: '#6a2a8a' },
        marta:   { skin: '#c48c64', hair: '#5a3a2a', style: 1, tunic: '#7a7f8a', trim: '#c9a43a', pants: '#3a3a44', shoes: '#2a2a2e', gear: { head: 'iron_helm', body: 'chainmail', feet: 'iron_greaves' } },
        sela2:   { skin: '#d4a984', hair: '#2a2a2e', style: 1, tunic: '#2f5f7a', trim: '#9fd6ff', pants: '#2a3a4a', shoes: '#2a2018', cape: '#1d3a4a' },
        folk1:   { skin: '#e8c4a0', hair: '#8a5a2a', style: 1, tunic: '#d86a6a', trim: '#ffffff', pants: '#4a4a6a', shoes: '#2a2018' },
        folk2:   { skin: '#a87850', hair: '#1a1a1a', style: 0, tunic: '#5a9a5a', trim: '#e8d27a', pants: '#4a3a2a', shoes: '#2a2018' },
        ada:     { skin: '#e2b48c', hair: '#c8a020', style: 1, tunic: '#8a6a3a', trim: '#e8e0c8', pants: '#5a4a3a', shoes: '#3a2a1e', gear: { head: 'leather_cap' } },
        finn:    { skin: '#f0c8a0', hair: '#c0582e', style: 0, tunic: '#4a8ad8', trim: '#ffffff', pants: '#5a4a3a', shoes: '#2a2018', s: 0.76 },
        finnHome:{ skin: '#f0c8a0', hair: '#c0582e', style: 0, tunic: '#4a8ad8', trim: '#ffffff', pants: '#5a4a3a', shoes: '#2a2018', s: 0.76 },
        lostkid: { skin: '#d8a882', hair: '#2a1a10', style: 4, tunic: '#e86a9a', trim: '#ffffff', pants: '#4a4a6a', shoes: '#2a2018', s: 0.74 },
        villager:{ skin: '#e2b48c', hair: '#5a3a1e', style: 0, tunic: '#8a8a6a', trim: '#e8e0c8', pants: '#4a4a4a', shoes: '#2a2018' }
    };

    /* ---------------- foes of chapter 2: helpers of the bosses, and the three bosses ---------------- */
    const ROOK = { skin: '#c8966e', hair: '#2a1a10', style: 0, tunic: '#7a2a2a', trim: '#d8b04a', pants: '#2e2a36', shoes: '#1e1a20', cape: '#a8221e', beard: '#2a1a10' };
    const WITCH = { skin: '#e0c8f0', hair: '#2a1a3a', style: 1, tunic: '#5a2a7a', trim: '#ff8a3a', pants: '#2a1a3a', shoes: '#1a1024', cape: '#3a1a4a' };
    const FOES = {
        rook:   { hp: 520, dmg: 7, spd: 1.1, r: 16, xp: 130, coin: 160, boss: 1, upd: rookUpd, draw: rookDraw },
        witch:  { hp: 600, dmg: 7, spd: 0, r: 14, xp: 160, coin: 200, boss: 1, upd: witchUpd, draw: witchDraw },
        choir:  { hp: 760, dmg: 8, spd: 0.35, r: 18, xp: 200, coin: 260, boss: 1, upd: choirUpd, draw: choirDraw },
        ember:  { hp: 50, dmg: 0, spd: 0, r: 12, xp: 10, coin: 0, upd: f => { f.sy = f.y; }, draw: emberDraw },
        clone:  { hp: 14, dmg: 3, spd: 0, r: 12, xp: 6, coin: 0, upd: cloneUpd, draw: (x, f, X, Y, w) => { x.globalAlpha = 0.55; witchBody(x, f, X, Y, w); x.globalAlpha = 1; } }
    };
    const nearHero = f => api.nearest(f.x, f.y);
    function towards(f, p) { const d = api.dist(p.x, p.y, f.x, f.y) || 1; f.vx = (p.x - f.x) / d; f.vy = (p.y - f.y) / d; }

    // Captain Rook: circles you, dashes along a red line (hit a wall and he is dazed), throws bombs, whistles for archers
    function rookUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const enr = f.hp < f.max * 0.33, cx = MAPS.c2_fields.arena[0] * TS, cy = MAPS.c2_fields.arena[1] * TS;
        if (f.sum === 0 && f.hp < f.max * 0.66) { f.sum = 1; whistle(f); } else if (f.sum === 1 && f.hp < f.max * 0.33) { f.sum = 2; whistle(f); }
        switch (f.st) {
            case 0:
                if (api.dist(f.x, f.y, cx, cy) > 6 * TS) api.chase(f, (cx - f.x) / 200, (cy - f.y) / 200, 1.6, rw, rh);
                else if (d < 80) api.chase(f, -tx, -ty, f.d.spd, rw, rh);
                else api.moveEnt(f, -ty * f.d.spd * 0.8, tx * f.d.spd * 0.8, rw, rh);
                if (++f.tm > (enr ? 45 : 75)) { f.tm = 0; f.pt = (f.pt + 1) % 3; if (f.pt === 2) { f.st = 3; f.wt = 0; f.ph = 0; } else { f.st = 1; f.wt = enr ? 26 : 38; towards(f, p); } }
                break;
            case 1: if (f.wt > 12) towards(f, p); if (--f.wt <= 0) { f.st = 2; f.wt = 26; api.SND.fx('swing'); } break;
            case 2:
                if (api.tick & 1) api.part(f.x, f.y, 2, -f.vx, -f.vy * 0.5, 0.6, 16, '#c8a878', 3);
                if (api.moveEnt(f, f.vx * 6, f.vy * 6, rw, rh)) { f.st = 4; f.wt = 90; api.shake = 14; api.SND.fx('slam'); api.ringFx(f.x, f.y, 40, '#ffd23f'); break; }
                if (--f.wt <= 0) { if (enr && !f.ph) { f.ph = 1; f.st = 1; f.wt = 18; towards(f, p); } else { f.st = 0; f.ph = 0; } }
                break;
            case 3:                                                   // three (or five) bombs where you stand and where you are going
                if (++f.wt % 22 === 1) {
                    const lead = (f.ph % 2) * 50, q = p;
                    api.bomb(f.x, f.y - 30, q.x + q.ax * lead, q.y + q.ay * lead, 56, f.d.dmg);
                    api.SND.fx('swing'); f.ph++;
                    if (f.ph >= (enr ? 5 : 3)) { f.st = 0; f.tm = 0; }
                }
                break;
            case 4: if (--f.wt <= 0) f.st = 0; break;                 // dazed: hit him now
        }
    }
    function whistle(f) {
        api.SND.fx('roar'); api.toast(T().ui.c2rookCall);
        const a = api.spawnFoe('archer', f.x - 90, f.y + 30, true), b = api.spawnFoe('archer', f.x + 90, f.y + 30, true);
        for (const m of [a, b]) if (m) { api.burst(m.x, m.y - 10, 12, '#c8a878', 2); if (api.feetSolid(m.x, m.y)) { m.x = f.x; m.y = f.y + 40; } }
    }
    function rookDraw(x, f, X, Y, w) {
        if (f.st === 1) {                                         // the red line of his dash
            x.globalAlpha = 0.35 + (f.wt < 12 ? 0.35 : 0) * (api.tick & 2 ? 1 : 0.4); x.strokeStyle = '#ff3a3a'; x.lineWidth = 10;
            x.beginPath(); x.moveTo(X, Y); x.lineTo(X + f.vx * 190, Y + f.vy * 190); x.stroke(); x.globalAlpha = 1;
        }
        const q = nearHero(f), flip = q ? q.x < f.x : false, sx = X + (f.st === 1 ? (api.tick & 2) - 1 : 0);
        const a = f.st === 2 ? Math.atan2(f.vy, f.vx) : flip ? -2.3 : -0.85;
        HERO.draw(x, sx, Y, ROOK, { head: 'knight_helm', body: 'chainmail', feet: 'iron_greaves' }, 2, flip, f.st === 0 ? f.walk * 1.6 : 0, f.st === 2 ? (flip ? -1 : 1) : 0, w, 1.6);
        api.drawHeld('sword', '#e8eef8', '#3a2416', sx + (flip ? -5 : 5), Y - 23, a, 2, 0, 0);
        if (f.st === 4) { x.fillStyle = '#ffd23f'; for (let k = 0; k < 3; k++) { const b = api.tick * 0.12 + k * 2.1; x.fillRect(X + Math.cos(b) * 16, Y - 72 + Math.sin(b) * 4, 4, 4); } }
    }

    // the Cinder Witch: spirals of fire, burning circles, mirror images, and a shield held up by three ember crystals
    function witchUpd(f, p, d, tx, ty) {
        if (!p) return;
        const pts = MAPS.c2_ridge.pts, enr = f.hp < f.max * 0.3;
        f.walk += 0.05;
        if (!f.ph && f.hp < f.max * 0.6) {                       // two mirror images
            f.ph = 1; api.SND.fx('blink'); api.toast(T().ui.c2witchClones);
            for (let k = 0; k < 2; k++) { const pt = pts[(f.pt + 1 + k) % pts.length], m = api.spawnFoe('clone', pt[0] * TS, pt[1] * TS, true); if (m) api.burst(m.x, m.y - 14, 14, '#c77dff', 2); }
        }
        if (f.sum === 0 && f.hp < f.max * 0.45) {                // the shield
            f.sum = 1; f.immune = true; api.SND.fx('roar'); api.toast(T().ui.c2witchShield);
            for (let k = 0; k < 3; k++) { const pt = pts[k], m = api.spawnFoe('ember', pt[0] * TS, pt[1] * TS + 30, true); if (m) api.ringFx(m.x, m.y, 30, '#ff8a3a'); }
        }
        if (f.immune) {
            let left = 0; for (const o of api.FOES) if (o.on && o.t === 'ember') left++;
            if (!left) { f.immune = false; f.weak = true; f.st = 4; f.wt = 170; f.alpha = 1; api.SND.fx('crit'); api.toast(T().ui.c2witchWeak); api.ringFx(f.x, f.y - 20, 70, '#ffd23f'); }
        }
        switch (f.st) {
            case 0:                                               // a spiral of fireballs
                f.alpha = Math.min(1, f.alpha + 0.05);
                if (++f.tm % (enr ? 5 : 7) === 0) {
                    const arms = enr ? 3 : 2;
                    for (let k = 0; k < arms; k++) { const a = f.ang + k * 6.2832 / arms; api.shot(f.x, f.y - 20, Math.cos(a) * 1.9, Math.sin(a) * 1.9, f.d.dmg - 2, 7, 8, 0); }
                    f.ang += 0.33; if ((f.tm & 15) === 0) api.SND.fx('shoot');
                }
                if (f.tm > 100) { f.st = 1; f.tm = 0; }
                break;
            case 1:                                               // circles of fire around you
                if (++f.tm === 1) {
                    api.SND.fx('zap');
                    api.hazard(p.x, p.y, 34, 60, f.d.dmg, 1, '#ff6a2a');
                    for (let k = 0; k < (enr ? 5 : 3); k++) { const a = k * 2.1 + api.tick; api.hazard(p.x + Math.cos(a) * 70, p.y + Math.sin(a) * 40, 30, 60 + k * 8, f.d.dmg, 1, '#ff6a2a'); }
                }
                if (f.tm > 80) { f.st = 2; f.tm = 0; }
                break;
            case 2:                                               // she fades and appears elsewhere
                f.alpha -= 0.04;
                if (f.alpha <= 0) { f.pt = (f.pt + 1 + ((Math.random() * 2) | 0)) % pts.length; f.x = pts[f.pt][0] * TS; f.y = pts[f.pt][1] * TS; f.st = 3; api.SND.fx('blink'); }
                break;
            case 3: f.alpha += 0.06; if (f.alpha >= 1) { f.alpha = 1; f.st = 0; f.tm = 0; } break;
            case 4: f.alpha = 1; if (--f.wt <= 0) { f.weak = false; f.st = 0; f.tm = 0; } break;   // shield broken: she is open, double damage
        }
    }
    function cloneUpd(f, p) {
        f.walk += 0.05; f.sy = f.y;
        if (p && ++f.tm % 110 === 0) { towards(f, p); api.shot(f.x, f.y - 20, f.vx * 1.6, f.vy * 1.6, f.d.dmg, 6, 6, 0); api.SND.fx('zap'); }
    }
    function witchBody(x, f, X, Y, w) {
        const bob = Math.sin(f.walk * 2) * 3 - 6, q = nearHero(f), flip = q ? q.x < f.x : false;
        x.globalAlpha *= 0.5; x.drawImage(api.glow('#ff8a3a'), X - 30, Y - 76 + bob, 60, 60); x.globalAlpha /= 0.5;
        HERO.draw(x, X, Y + bob, WITCH, { head: 'hood', body: 'mage_robe' }, 0, flip, 0, 0, w, 1.45);
        api.drawHeld('staff', '#ff8a3a', '#3a2a4a', X + 13, Y - 22 + bob, -1.5, 3, 0, 0);
    }
    function witchDraw(x, f, X, Y, w) {
        x.globalAlpha = Math.max(0, f.alpha);
        witchBody(x, f, X, Y, w);
        if (f.immune) { x.globalAlpha = 0.35 + Math.sin(api.tick * 0.2) * 0.15; x.strokeStyle = '#ffb040'; x.lineWidth = 3; x.beginPath(); x.ellipse(X, Y - 26, 26, 34, 0, 0, 6.2832); x.stroke(); }
        if (f.weak) { x.fillStyle = '#ffd23f'; for (let k = 0; k < 3; k++) { const b = api.tick * 0.12 + k * 2.1; x.fillRect(X + Math.cos(b) * 14, Y - 66 + Math.sin(b) * 4, 4, 4); } }
        x.globalAlpha = 1;
    }
    function emberDraw(x, f, X, Y, w) {
        x.globalAlpha = 0.6 + Math.sin(api.tick * 0.15) * 0.2; x.drawImage(api.glow('#ff8a3a'), X - 24, Y - 46, 48, 48); x.globalAlpha = 1;
        x.fillStyle = w ? '#ffffff' : '#ff8a3a'; x.beginPath(); x.moveTo(X, Y - 40); x.lineTo(X + 9, Y - 16); x.lineTo(X, Y); x.lineTo(X - 9, Y - 16); x.closePath(); x.fill();
        x.fillStyle = '#ffe0a0'; x.beginPath(); x.moveTo(X, Y - 40); x.lineTo(X - 9, Y - 16); x.lineTo(X, Y - 10); x.closePath(); x.fill();
        x.fillStyle = '#000'; x.fillRect(X - 13, Y - 50, 26, 4); x.fillStyle = '#ff8a3a'; x.fillRect(X - 12, Y - 49, 24 * f.hp / f.max, 2);
    }

    // the Choirmaster: rings of sound with one gap (stand in the gap), a turning beam, homing orbs and hexers
    function choirUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const enr = f.hp < f.max * 0.3, cx = MAPS.c2_light.arena[0] * TS, cy = MAPS.c2_light.arena[1] * TS;
        f.walk += 0.04;
        if (f.sum === 0 && f.hp < f.max * 0.7) { f.sum = 1; summon(f); } else if (f.sum === 1 && f.hp < f.max * 0.35) { f.sum = 2; summon(f); }
        switch (f.st) {
            case 0:
                if (api.dist(f.x, f.y, cx, cy) > 3 * TS) api.chase(f, (cx - f.x) / 100, (cy - f.y) / 100, 0.6, rw, rh);
                else api.chase(f, tx, ty, d > 90 ? f.d.spd : 0, rw, rh);
                if (++f.tm > (enr ? 40 : 70)) { f.tm = 0; f.pt = (f.pt + 1) % 3; f.st = f.pt + 1; f.wt = 0; f.ph = 0; f.ring = 0; f.mask = 0; f.ang = Math.random() * 6.2832; }
                break;
            case 1:                                               // two rings of sound, each with a gap
                if (f.wt < 45) { f.wt++; if (f.wt === 45) { api.SND.fx('beam'); f.ring = 12; f.mask = 0; } break; }
                f.ring += enr ? 3.2 : 2.6;
                for (const q of api.P) if (q.on && !q.down && !(f.mask & (1 << q.i))) {
                    const dx = q.x - f.x, dy = (q.y - f.y) * 2, rr = Math.sqrt(dx * dx + dy * dy);
                    if (Math.abs(rr - f.ring) < 11) { let da = Math.atan2(dy, dx) - f.ang; while (da > Math.PI) da -= 6.2832; while (da < -Math.PI) da += 6.2832; if (Math.abs(da) > 0.5) { f.mask |= 1 << q.i; api.hurt(q, f.d.dmg, f.x, f.y); } }
                }
                if (f.ring > 300) { if (++f.ph < 2) { f.wt = 20; f.ring = 0; f.ang += 1.5 + Math.random() * 2; } else { f.st = 0; f.ring = 0; } }
                break;
            case 2:                                               // a beam that turns (stay close to him, or keep ahead of it)
                if (f.wt === 0) { f.ang = Math.atan2(p.y - f.y, p.x - f.x) - 0.9; f.vx = Math.random() < 0.5 ? 1 : -1; f.ang += f.vx < 0 ? 1.8 : 0; }
                if (++f.wt === 45) api.SND.fx('beam');
                if (f.wt > 45) {
                    f.ang += f.vx * (enr ? 0.016 : 0.012);
                    for (const q of api.P) if (q.on && !q.down) for (let b = 0; b < (enr ? 2 : 1); b++) {
                        const a = f.ang + b * Math.PI, dx = q.x - f.x, dy = q.y - 8 - (f.y - 30), along = dx * Math.cos(a) + dy * Math.sin(a), perp = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a));
                        if (along > 28 && perp < 12) api.hurt(q, f.d.dmg, f.x, f.y);
                    }
                }
                if (f.wt > 45 + 150) { f.st = 0; f.tm = 0; }
                break;
            case 3:                                               // orbs that follow you
                if (++f.wt === 20) { const n = enr ? 10 : 8; for (let k = 0; k < n; k++) { const a = k * 6.2832 / n; api.shot(f.x, f.y - 30, Math.cos(a) * 1.3, Math.sin(a) * 1.3, f.d.dmg - 2, 6, 6, 0); } api.SND.fx('zap'); api.ringFx(f.x, f.y - 20, 50, '#c77dff'); }
                if (f.wt > 60) { f.st = 0; f.tm = 0; }
                break;
        }
    }
    function summon(f) { api.SND.fx('roar'); for (const k of [-1, 1]) { const m = api.spawnFoe('hexer', f.x + k * 110, f.y + 40, true); if (m) api.burst(m.x, m.y - 10, 14, '#c77dff', 2); } }
    function choirDraw(x, f, X, Y, w) {
        const t = api.tick, bob = Math.sin(f.walk * 2) * 3 - 8;
        if (f.st === 1) {                                         // the ring, with its gap (bright marks show the gap)
            if (f.wt < 45 || f.ring > 0) {
                const r = f.ring || 24 + f.wt * 0.4;
                x.globalAlpha = f.ring ? 0.85 : 0.4; x.strokeStyle = '#c77dff'; x.lineWidth = f.ring ? 7 : 2;
                x.beginPath(); x.ellipse(X, Y, r, r * 0.5, 0, f.ang + 0.5, f.ang + 6.2832 - 0.5); x.stroke();
                x.fillStyle = '#7ef0a0'; x.globalAlpha = 0.9;
                for (const s of [-0.5, 0.5]) x.fillRect(X + Math.cos(f.ang + s) * r - 3, Y + Math.sin(f.ang + s) * r * 0.5 - 3, 6, 6);
                x.globalAlpha = 1;
            }
        }
        if (f.st === 2) {
            const on = f.wt > 45;
            for (let b = 0; b < (f.hp < f.max * 0.3 ? 2 : 1); b++) {
                const a = f.ang + b * Math.PI;
                x.globalAlpha = on ? 0.8 : 0.3 + (t & 4 ? 0.2 : 0); x.strokeStyle = on ? '#e8d8ff' : '#c77dff'; x.lineWidth = on ? 14 : 2;
                x.beginPath(); x.moveTo(X + Math.cos(a) * 28, Y - 30 + Math.sin(a) * 28); x.lineTo(X + Math.cos(a) * 420, Y - 30 + Math.sin(a) * 420); x.stroke();
                if (on) { x.strokeStyle = '#ffffff'; x.lineWidth = 4; x.stroke(); }
            }
            x.globalAlpha = 1;
        }
        x.globalAlpha = 0.5; x.drawImage(api.glow('#8a5aff'), X - 44, Y - 92 + bob, 88, 88); x.globalAlpha = 1;
        x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(X, Y, 20, 7, 0, 0, 6.2832); x.fill();
        // a tall grey robe, a white mask, and three turning halos
        const robe = w ? '#ffffff' : '#3a3448', dark = w ? '#ffffff' : '#26222e';
        x.fillStyle = robe; x.beginPath(); x.moveTo(X - 10, Y - 62 + bob); x.lineTo(X + 10, Y - 62 + bob); x.lineTo(X + 20, Y - 6 + bob); x.lineTo(X - 20, Y - 6 + bob); x.closePath(); x.fill();
        x.fillStyle = dark; x.fillRect(X - 2, Y - 58 + bob, 4, 50);
        x.fillStyle = '#c77dff'; x.fillRect(X - 20, Y - 10 + bob, 40, 3);
        x.fillStyle = w ? '#ffffff' : '#ece8f4'; x.beginPath(); x.ellipse(X, Y - 70 + bob, 9, 11, 0, 0, 6.2832); x.fill();
        x.fillStyle = '#1b1820'; x.fillRect(X - 6, Y - 72 + bob, 4, 2); x.fillRect(X + 2, Y - 72 + bob, 4, 2); x.fillRect(X - 2, Y - 64 + bob, 4, 4);
        x.strokeStyle = '#c77dff'; x.lineWidth = 2;
        for (let k = 0; k < 3; k++) { x.globalAlpha = 0.7; x.beginPath(); x.ellipse(X, Y - 74 + bob - k * 3, 16 + k * 5, 5 + k, Math.sin(t * 0.02 + k) * 0.3, 0, 6.2832); x.stroke(); }
        x.globalAlpha = 1;
    }

    /* ---------------- side quests, tasks for the townsfolk, the smith's wares ---------------- */
    const QUESTS = [
        { id: 'c2_crabs', giver: 'bo', type: 'kill', foe: 'crab', n: 6, stage: 1, reward: { coins: 90, big: 2 } },
        { id: 'finn', giver: 'nell', type: 'rescue', who: 'finn', stage: 1, reward: { coins: 100, item: 'coral_helm' } },
        { id: 'c2_boars', giver: 'ada', type: 'kill', foe: 'boar', n: 5, stage: 2, reward: { coins: 120, item: 'gale_bow' } },
        { id: 'c2_imps', giver: 'gus', type: 'kill', foe: 'imp', n: 6, stage: 6, reward: { coins: 150, item: 'tide_staff' } },
        { id: 'c2_hexers', giver: 'juna', type: 'kill', foe: 'hexer', n: 4, stage: 8, reward: { coins: 200, item: 'tide_mail' } }
    ];
    const POOL = window.HM_C2_POOL || [];
    const SHOP = ['tide_blade', 'gale_bow', 'storm_musket', 'tide_staff', 'star_staff', 'coral_helm', 'tide_mail', 'mage_robe', 'wave_boots', 'knight_helm', 'plate_armor', 'swift_boots'];

    /* ---------------- the story ---------------- */
    function objective(lang) {
        const t = api.TEXT[lang] || api.TEXT.en, c = C(); if (!c || !t.c2obj) return '';
        return api.txt(t.c2obj[Math.min(c.st, t.c2obj.length - 1)], { n: Math.min(6, c.kills) });
    }
    function story(id) {
        const c = C(), st = c.st, t = T();
        switch (id) {
            case 'odile':
                if (st === 0) { adv(1); return lines('odile', 'c2odile0'); }
                if (st === 4) { adv(5); return lines('odile', 'c2odile4'); }
                return null;
            case 'ada':
                if (st === 1) { adv(2); return lines('ada', 'c2ada1'); }
                if (st === 2) return lines('ada', 'c2ada2', { n: Math.min(6, c.kills) });
                return null;
            case 'mirelle':
                if (st === 5) { adv(6); openGate(); setTimeout(() => api.toast(t.ui.c2gateOpen), 2600); return lines('mirelle', 'c2mirelle5'); }
                if (st === 7) { tideScene(); return true; }
                if (c.letter === 2) { c.letter = 3; S().coins += api.loot(150); api.giveItem('star_staff', true, 2); api.SND.fx('level'); setTimeout(() => api.toast(t.ui.c2letterDone), 2600); api.save(); return lines('mirelle', 'c2mirelleLetter'); }
                return null;
            case 'marta': return lines('marta', c.gate ? 'c2martaOpen' : 'c2martaShut');
        }
        return null;
    }
    function idle(id) {
        const c = C();
        if (id === 'odile') return lines('odile', c.lit ? 'c2odileEnd' : 'c2odileIdle', { obj: objective(api.L) });
        if (id === 'pell') return lines('pell', c.lit ? 'c2pellLit' : 'c2pell');
        const key = { mirelle: 'c2mirelleIdle', gus: 'c2gus', juna: 'c2juna', bo: 'c2bo', nell: 'c2nell', tuck: 'c2tuck', sela2: 'c2sela', folk1: c.lit ? 'c2folkLit' : 'c2folk1',
                      folk2: c.lit ? 'c2folkLit' : 'c2folk2', ada: c.st >= 4 ? 'c2adaAfter' : 'c2adaIdle', finnHome: 'c2finnHome' }[id];
        return key ? lines(id, key) : null;
    }
    function extras(id, c) {
        const t = T(), s = S(), cc = C();
        if (id === 'gus') c.push({ label: t.ui.browseForge, fn: () => { api.closeDlg(); api.forgeScreen(); } });
        if (id === 'juna') c.push({ label: t.ui.browsePotions, fn: () => { api.closeDlg(); api.potionScreen(); } });
        if (id === 'tuck') c.push({ label: t.ui.c2bread, fn: () => {
            api.closeDlg();
            if (s.coins < 6) return api.toast(t.ui.poor);
            s.coins -= 6; for (const p of api.P) if (p.on) { p.hp = Math.min(api.maxHp(p), p.hp + Math.ceil(api.maxHp(p) / 2)); api.burst(p.x, p.y - 12, 10, '#ffd98a', 1.4); }
            api.SND.fx('heal'); api.toast(t.ui.c2breadEat); api.save();
        } });
        if (id === 'sela2') c.push({ label: t.ui.c2sailHome, fn: () => { api.closeDlg(); api.travel('mireshore', 21.5, 16.5); } });
        if (id === 'mirelle' && cc.st >= 6 && !cc.letter) c.push({ label: t.ui.c2letterAsk, fn: () => { cc.letter = 1; api.save(); api.closeDlg(); api.say(lines('mirelle', 'c2mirelleAsk'), null, () => api.toast(t.ui.c2letterGot)); } });
    }
    function news(id) {
        const c = C(), st = c.st;
        if (id === 'odile') return st === 0 || st === 4;
        if (id === 'ada') return st === 1;
        if (id === 'mirelle') return st === 5 || st === 7 || c.letter === 2;
        return false;
    }
    function visible(id) {
        if (id === 'finnHome') return api.qState('finn') >= 2;
        return undefined;
    }
    function openGate() { const c = C(); c.gate = true; if (api.Z.id === 'c2_bay') { api.openTiles(103, 61, 'gate'); api.SND.fx('door'); } api.save(); }
    function tile(c) { const s = C(); return c === 'g' && s.gate ? '=' : c === 'v' && s.low ? 'w' : c; }

    function interact(p, fx, fy) {
        const Z = api.Z, c = C(), t = T();
        if (Z.pedestal && api.dist(fx, fy, Z.pedestal.dx + 32, Z.pedestal.dy + Z.pedestal.dh - 12) < 46) {
            if (c.st === 9) litScene(); else api.say(lines(null, c.lit ? 'c2lanternOn' : 'c2pedestal'));
            return true;
        }
        for (const b of Z.boats) if (api.dist(fx, fy, b.cx, b.cy) < 38) { api.talk('sela2'); return true; }
        return false;
    }
    function onKill(f) {
        const c = C();
        if (c.st === 2 && api.Z.id === 'c2_fields' && (f.t === 'raider' || f.t === 'archer')) {
            c.kills++; api.toast(api.txt(T().ui.c2campN, { n: Math.min(6, c.kills) }));
            if (c.kills >= 6) { adv(3); api.say(lines(null, 'c2fled')); }
        }
    }
    function bossDown(f) {
        const c = C(), t = T();
        if (f.t === 'rook') { adv(4); api.say(lines('rook', 'c2rookDown'), null, () => api.toast(t.ui.c2gotLens)); }
        else if (f.t === 'witch') { adv(7); api.say(lines('witch', 'c2witchDown'), null, () => api.toast(t.ui.c2gotFlame)); }
        else if (f.t === 'choir') {
            adv(9); c.rise = true; api.save();
            api.say(lines('choir', 'c2choirDown'), null, () => api.travel('c2_bay', 26.5, 21.3));
        }
    }
    function onZone(id) {
        const Z = api.Z, c = C();
        if (Z.pedestal) Z.pedestal.lantern = drawLantern;
    }
    function arrive(id) {
        const c = C();
        if (id === 'c2_bay' && !c.seen.arrive) { c.seen.arrive = 1; api.save(); arrivalScene(); }
        else if (id === 'c2_bay' && c.rise) riseScene();
    }
    // a boss says something the first time you come near
    function update() {
        const c = C(), Z = api.Z, b = api.boss, a = Z.def.arena, k = { c2_fields: 'rook', c2_ridge: 'witch', c2_light: 'choir' }[Z.id];
        if (!k || c.seen[k] || !b || !b.on || !a) return;
        const p = api.P[0];
        if (api.dist(p.x, p.y, a[0] * TS, a[1] * TS) < 8.5 * TS) {
            c.seen[k] = 1; api.save();
            api.scene([{ cam: a, t: 60 }, { say: lines(k, 'c2' + k + 'Hi') }, { t: 10 }]);
        }
    }

    /* ---------------- cut-scenes ---------------- */
    function arrivalScene() {
        api.scene([
            { cam: [22, 27], t: 80 }, { title: api.txt(T().ui.chapterN, { n: 2, name: T().ui.ch2Name }), t: 170 },
            { cam: [22, 14], t: 110 }, { cam: [22, 22], t: 60 },
            { say: lines('sela2', 'c2arrive') }, { move: ['odile', 22.5, 22.7] }, { t: 70 },
            { say: lines('odile', 'c2hello') }
        ], () => api.toast(objective(api.L)));
    }
    function tideScene() {
        const c = C();
        api.scene([
            { say: lines('mirelle', 'c2mirelle7') }, { cam: [8, 20], t: 40 },
            { sound: 'bell', fx: 'shake', t: 80 }, { sound: 'bell', t: 50 },
            { cam: [5, 26], t: 60, sound: 'wave' },
            { fx: 'flash', t: 70, fn: () => { c.low = true; api.save(); const p = api.P[0]; api.loadZone('c2_bay'); api.placePlayers(p.x / TS, p.y / TS); } },
            { say: lines(null, 'c2tide') }
        ], () => { adv(8); });
    }
    function riseScene() {
        const c = C(), Z = api.Z;
        if (Z.pedestal) Z.pedestal.rise = 0;
        api.scene([
            { cam: [27, 19], t: 50 }, { sound: 'wave', fx: 'shake', t: 30 },
            { fn: () => { if (Z.pedestal) Z.pedestal.rising = api.tick; }, sound: 'bell', t: 120 },
            { say: lines('odile', 'c2rise') }
        ], () => { c.rise = false; api.save(); api.toast(objective(api.L)); });
    }
    function litScene() {
        const c = C(), t = T();
        api.scene([
            { cam: [27, 19], t: 40 },
            { fn: () => { c.lit = true; api.save(); api.music(); }, sound: 'level', fx: 'flash', t: 90 },
            { title: t.ui.c2litTitle, t: 160 },
            { say: lines('odile', 'c2lit') }
        ], () => {
            adv(10);
            const sc = score();
            api.slides(t.c2ending.concat([t.ui.c2theEnd + '\n' + api.txt(t.ui.score, { n: sc })]), () => { api.toPlay(); api.toast(t.ui.c2free); }, 'end', t.c2ending.map((s, i) => 'c2ending-' + i).concat([0]));
        });
    }
    // the Lantern of Larkspur on its stone: under the sea until the Choirmaster falls, then it rises and is lit
    function drawLantern(x, X, Y, t) {
        const c = C(), o = api.Z.pedestal; if (!c || (c.st < 9 && !c.lit)) return;
        let up = 0; if (o && o.rising) { const k = Math.min(1, (t - o.rising) / 110); up = (1 - k) * 70; if (k >= 1) o.rising = 0; }
        x.save(); x.beginPath(); x.rect(X - 40, Y - 160, 80, 160); x.clip();
        const y = Y + up;
        x.fillStyle = '#4a4a52'; x.fillRect(X - 4, y - 70, 8, 70); x.fillStyle = '#6a6a72'; x.fillRect(X - 12, y - 6, 24, 6);
        x.fillStyle = '#3a3a42'; x.fillRect(X - 13, y - 96, 26, 4); x.fillRect(X - 13, y - 70, 26, 4);
        x.fillStyle = c.lit ? '#ffe9a8' : '#5a6070'; x.fillRect(X - 10, y - 92, 20, 22);
        if (c.lit) { x.fillStyle = '#ffd25a'; x.beginPath(); x.moveTo(X - 5, y - 74); x.quadraticCurveTo(X, y - 92 - Math.sin(t * 0.3) * 3, X + 5, y - 74); x.fill(); }
        x.fillStyle = '#3a3a42'; x.beginPath(); x.moveTo(X - 15, y - 96); x.lineTo(X, y - 110); x.lineTo(X + 15, y - 96); x.fill();
        x.restore();
        if (c.lit) { const g = 150 + Math.sin(t * 0.05) * 8; x.globalAlpha = 0.45; x.drawImage(api.glow('#ffd76a'), X - g / 2, Y - 82 - g / 2, g, g); x.globalAlpha = 1; }
        if (up > 0) { x.fillStyle = 'rgba(200,240,255,0.7)'; for (let k = 0; k < 6; k++) x.fillRect(X - 24 + k * 9, Y - 2 - (t + k * 5) % 10, 3, 3); }
    }

    /* ---------------- the guide arrow ---------------- */
    function target() {
        const c = C(), st = c.st, Z = api.Z;
        let z = '', x = 0, y = 0;
        if (st === 0 || st === 4) { z = 'c2_bay'; x = 22.5; y = 21.4; }
        else if (st === 1) { z = 'c2_fields'; x = 8.5; y = 9.4; }
        else if (st === 2) { z = 'c2_fields'; x = 35; y = 20; }
        else if (st === 3) { z = 'c2_fields'; x = 38; y = 5.5; }
        else if (st === 5 || st === 7) { z = 'c2_bay'; x = 8.5; y = 20.8; }
        else if (st === 6) { z = 'c2_ridge'; x = 20; y = 4.5; }
        else if (st === 8) { z = 'c2_light'; x = 20; y = 6.5; }
        else if (st === 9) { z = 'c2_bay'; x = 27; y = 20.6; }
        else return false;
        if (z !== Z.id) return api.hop(z);
        GT.x = x * TS; GT.y = y * TS; return true;
    }
    function score() { const s = S(); return 2000 + s.kills * 10 + s.lvl * 100 + s.qdone * 200; }
    // Pell plays the lute; little notes float up
    function npcExtra(id, x, y) {
        if (id !== 'pell') return;
        const c = api.ctx, t = api.tick;
        c.fillStyle = '#a8703a'; c.beginPath(); c.ellipse(x + 6, y - 15, 5, 4, 0.5, 0, 6.2832); c.fill(); c.fillStyle = '#6a4228'; c.fillRect(x + 7, y - 26, 2, 10);
        if ((t >> 5) & 1) { const k = (t & 31) / 32; c.globalAlpha = 1 - k; c.fillStyle = '#ffd23f'; c.fillRect(x + 10 + k * 6, y - 40 - k * 16, 3, 3); c.fillRect(x + 12 + k * 6, y - 46 - k * 16, 1, 6); c.globalAlpha = 1; }
    }

    return {
        id: 'ch2', home: 'c2_bay', maps: MAPS, quests: QUESTS, pool: POOL, chests: {}, shop: SHOP, looks: LOOK, foes: FOES,
        talkers: { odile: 1, mirelle: 1 }, noWolf: true, preload: false, solid: '^PkhLlcvg',
        parent: { c2_fields: 'c2_bay', c2_ridge: 'c2_bay', c2_light: 'c2_bay' },
        dust: { c2_bay: '#c8b89a', c2_fields: '#b8915e', c2_ridge: '#6a5e58', c2_light: '#5a6070' },
        treasures: { c2_bay: 2, c2_fields: 4, c2_ridge: 3, c2_light: 2 },
        beasts: ['crab', 'boar', 'raider', 'archer', 'gunner', 'hexer', 'imp', 'bones', 'rook', 'witch', 'choir'],
        songs: ['c2_bay', 'c2_bay_lit', 'c2_fields', 'c2_ridge', 'c2_light', 'c2_boss'], bossSong: 'c2_boss',
        songDefs: {
            c2_bay:     { root: 196, scale: [0, 2, 4, 7, 9, 12, 14, 16], chords: [0, 3, 1, 2], rate: 3, beats: 64, pad: 'sine', lead: 'flute', drums: 'soft', echo: 0.3, busy: 0.55, seed: 11 },
            c2_bay_lit: { root: 220, scale: [0, 2, 4, 7, 9, 12, 14, 16], chords: [0, 3, 4, 3], rate: 3.4, beats: 64, pad: 'sine', lead: 'flute', drums: 'soft', echo: 0.25, busy: 0.7, seed: 23 },
            c2_fields:  { root: 146.8, scale: [0, 2, 3, 5, 7, 8, 10, 12], chords: [0, 5, 3, 4], rate: 4.5, beats: 64, pad: 'triangle', lead: 'brass', drums: 'march', echo: 0.15, busy: 0.75, seed: 5 },
            c2_ridge:   { root: 138.6, scale: [0, 1, 3, 5, 7, 8, 10, 12], chords: [0, 1, 0, 6], rate: 5, beats: 64, pad: 'triangle', lead: 'brass', drums: 'tom', echo: 0.2, busy: 0.7, seed: 9 },
            c2_light:   { root: 130.8, scale: [0, 2, 3, 6, 7, 8, 11, 12], chords: [0, 2, 5, 1], rate: 2.4, beats: 48, pad: 'sine', lead: 'bell', drums: 'none', echo: 0.45, busy: 0.4, arp: false, seed: 17 },
            c2_boss:    { root: 123.5, scale: [0, 1, 3, 5, 6, 8, 10, 12], chords: [0, 1, 5, 4], rate: 6, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'war', echo: 0.1, busy: 0.85, seed: 3 }
        },
        start() { const s = S(); if (s && !s.c2) s.c2 = { st: 0, kills: 0, gate: false, low: false, lit: false, rise: false, letter: 0, seen: {} }; },
        stop() {},
        build(Z, def) { ART.build(Z, def, api); },
        drawUnder(x, cx, cy, t) { ART.drawUnder(x, api.Z, cx, cy, t, api.glow); },
        drawOver(x, cx, cy, t) { ART.drawOver(x, api.Z, cx, cy, t, api.glow); },
        objective, story, idle, extras, news, visible, tile, interact, onKill, bossDown, onZone, arrive, update, target, score, npcExtra,
        whatNext() { return objective(api.L); },
        stageOf() { return C() ? C().st : 0; },
        zoneOpen(z) { const c = C(); return z === 'c2_ridge' ? !!c.gate : z === 'c2_light' ? !!c.low : true; },
        music(zone, def) { return zone === 'c2_bay' && C().lit ? 'c2_bay_lit' : def.music; },
        lanternLit() { return !!C().lit; },
        gems() { const c = C(); return (c.st >= 7 ? 1 : 0) | (c.st >= 4 ? 2 : 0) | (c.low ? 4 : 0); },
        relics() { const c = C(), t = T(); return [[t.ui.c2lens, c.st >= 4, 'b'], [t.ui.c2flame, c.st >= 7, 'r'], [t.ui.c2tideName, c.low, 's']]; },
        forgeName() { return T().ui.c2forge; }, storeName() { return T().ui.c2store; }
    };
};
