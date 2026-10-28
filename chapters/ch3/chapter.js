/* Hollowmere, Chapter 3: The Veilscar Frontier. North of the lake, Dawnwatch is the last town of the old kingdom.
 * Its caravans vanish, the dead walk, and three banners (the Guard, the Circle of the Grove, the Ashblood) fight while
 * King Aurelian, the Hollow King, comes back from the Veil to tear it open for good.
 * The main story is data: chapters/ch3/quests.json (8 quests, 31 steps; each step is one action, see "about" there).
 * This file runs those steps, and holds the people, the new foes and the four bosses.
 * State: S.c3 = { st: step, c: progress, m: spots done (bits), beacons, open: {gates}, banner, lore, rep, ... } */
HM_CHAPTERS.def.ch3 = function (api) {
    'use strict';
    const TS = api.TS, GT = api.GT, ART = window.HM_C3_ART, MAPS = window.HM_C3_MAPS, HERO = api.HERO, QD = window.HM_C3_QUESTS || { quests: [] };
    const S = () => api.S, T = () => api.T, C = () => api.S.c3, lines = api.lines;
    const loc = o => o ? (o[api.L] || o.en || '') : '';

    /* ---------------- the main quests (from quests.json), flattened into steps ---------------- */
    const STEPS = [];
    for (const q of QD.quests) for (const s of q.steps) STEPS.push({ q, s });
    const IDX = {}; STEPS.forEach((e, i) => { IDX[e.s.id] = i; });
    const step = () => { const e = STEPS[C().st]; return e ? e.s : null; };
    const quest = () => { const e = STEPS[C().st]; return e ? e.q : null; };
    // the lines of a step's "say" (or one pick of a choice) as dialogue pages
    function sayPages(b, whoOver) {
        if (!b) return [];
        const list = b[api.L] || b.en || [], who = whoOver !== undefined ? whoOver : (b.who === undefined ? null : b.who);
        return list.map(t => [who, t, null]);
    }
    function eachPages(s, i, who) { const l = s.each ? (s.each[api.L] || s.each.en) : null; return l && l[i] ? [[who === undefined ? null : who, l[i], null]] : []; }
    function objective(lang) {
        const c = C(); if (!c) return '';
        const e = STEPS[c.st];
        if (!e) return (api.TEXT[lang] || api.TEXT.en).ui.c3free;
        const s = e.s, g = s.goal[lang] || s.goal.en;
        return api.txt(g, { n: Math.min(s.n || 0, c.c), m: s.n || 0 });
    }
    function announce() { const o = objective(api.L); MyPC.announce(o); api.toast(o); }
    // what a step changes in the world when it is done
    function apply(set) {
        if (!set) return;
        const c = C();
        if (set.beacons && c.beacons < set.beacons) {
            c.beacons = set.beacons;
            setTimeout(() => api.toast(api.txt(T().ui.c3beacon, { n: c.beacons })), 2600);
            const who = c.beacons === 1 ? 'mira' : c.beacons === 2 ? 'tov' : c.beacons === 3 ? 'kesh' : '';
            if (who) setTimeout(() => api.toast(api.txt(T().ui.c3vendor, { name: api.npcName(who) })), 5600);
        }
        if (set.open) { c.open[set.open] = true; openNow(set.open); }
    }
    // a gate opened while the heroes stand in its area
    function openNow(g) {
        const z = api.Z.id;
        if (g === 'east' && z === 'c3_dawn') api.openTiles(103, 61, 'gate');
        else if (g === 'north' && z === 'c3_dawn') api.openTiles(113, 61, 'gate2');
        else if (g === 'keep' && z === 'c3_keep') api.openTiles(103, 120, 'gate');
        else if (g === 'fort' && z === 'c3_frost') api.openTiles(103, 61, 'gate');
        else if (g === 'breach' && z === 'c3_frost') api.openTiles(113, 61, 'gate2');
        else if (g === 'citadel' && z === 'c3_veil') api.openTiles(113, 120, 'gate2');
        else return;
        api.SND.fx('door'); api.SND.fx('slam'); api.shake = 10;
    }
    // finish the current step: change the world, say its lines, then start the next one
    function complete(before, after) {
        const c = C(), e = STEPS[c.st]; if (!e) return;
        const s = e.s;
        apply(s.set);
        c.st++; c.c = 0; c.m = 0; wave = null;
        api.SND.fx('quest'); api.save();
        const pg = (before || []).concat(s.type === 'talk' || s.type === 'choice' ? [] : sayPages(s.say));
        const next = () => { startStep(); if (after) after(); else if (C().st < STEPS.length) announce(); };
        if (pg.length) api.say(pg, null, next); else next();
    }
    // a step starts: put its things in the world (petals, the boss), and finish "reach" steps that are already done
    function startStep() {
        const s = step(); if (!s) return;
        const Z = api.Z;
        if (s.type === 'reach' && s.zone === Z.id) return complete();
        if (s.type === 'collect' && s.zone === Z.id) spawnPicks();
        if (s.type === 'boss' && s.zone === Z.id) wakeBoss();
    }
    function bossDef() { const b = api.Z.def.boss; return b && !S()[b.flag] ? b : null; }
    function wakeBoss() {
        const b = bossDef(); if (!b) return;
        if (api.boss && api.boss.on) return;
        api.boss = api.spawnFoe(b.t, b.x * TS, b.y * TS, false);
        if (api.boss) { api.burst(api.boss.x, api.boss.y - 20, 30, '#ffffff', 3); api.ringFx(api.boss.x, api.boss.y, 90, '#b07aff'); }
    }
    // moonpetals (and any "collect" step): glowing things on the ground, one per spot not taken yet
    function spawnPicks() {
        const s = step(), c = C();
        for (const o of api.DROPS) if (o.on && o.k === 4 && o.qg === '@ch') o.on = false;
        s.spots.forEach((p, i) => {
            if (c.m & (1 << i)) return;
            for (const o of api.DROPS) if (!o.on) { o.on = true; o.k = 4; o.qg = '@ch'; o.icon = s.icon || 'moonpetal'; o.v = i; o.x = p[0] * TS; o.y = p[1] * TS; o.vx = o.vy = 0; o.z = 0; o.vz = 0; o.t = 1e9; o.sy = o.y; o.it = null; break; }
        });
    }
    function pickup(d) {
        const s = step(), c = C();
        if (!s || s.type !== 'collect' || (c.m & (1 << d.v))) return;
        c.m |= 1 << d.v; c.c++;
        api.toast(api.txt(T().ui.c3pickedUp, { name: loc(s.goal).split('(')[0].trim(), n: c.c, m: s.n }));
        if (c.c >= s.n) complete(); else api.save();
    }

    /* ---------------- waves: a ward stone / rift anchor wakes foes that must all be beaten ---------------- */
    let wave = null;                                        // { i } while a wave is fighting
    function startWave(s, i) {
        const c = C(), key = s.id === 'wards' ? 'wards' : 'anchors';
        c[key] |= 1 << i;
        wave = { i };
        api.SND.fx('roar'); api.shake = 12; api.ringFx(s.spots[i][0] * TS, s.spots[i][1] * TS, 90, key === 'wards' ? '#ffffff' : '#b07aff');
        const list = s.wave.slice(); if (s.last && c.c === s.n - 1) list.push(s.last);
        if (api.P[1].on || api.P[2].on) list.push(list[0]);
        list.forEach((t, k) => {
            const a = k * 6.2832 / list.length, x = s.spots[i][0] * TS + Math.cos(a) * 90, y = s.spots[i][1] * TS + Math.sin(a) * 60;
            const f = api.spawnFoe(t, api.feetSolid(x, y) ? s.spots[i][0] * TS : x, api.feetSolid(x, y) ? s.spots[i][1] * TS + 40 : y, false);
            if (f) { f.tag = 'w'; f.active = true; api.burst(f.x, f.y - 10, 12, key === 'wards' ? '#d8d2c0' : '#b07aff', 2); }
        });
        api.say(eachPages(s, i), null, () => api.toast(api.txt(T().ui.c3waveLeft, { n: list.length })));
    }
    function checkWave() {
        if (!wave) return;
        let left = 0; for (const f of api.FOES) if (f.on && f.tag === 'w') left++;
        if (left) return;
        const s = step(), c = C();
        c.m |= 1 << wave.i; c.c++; wave = null;
        api.SND.fx('level'); api.toast(T().ui.c3waveDone);
        if (c.c >= s.n) complete(); else { api.save(); setTimeout(announce, 1800); }
    }

    /* ---------------- the people of the frontier (drawn in clothes) ---------------- */
    const LOOK = {
        aldric:  { skin: '#d8a882', hair: '#6a5a4a', style: 0, tunic: '#2a4a8a', trim: '#ffd25a', pants: '#2a3040', shoes: '#2a2018', cape: '#1d3a7a', beard: '#6a5a4a', s: 1.08, gear: { body: 'plate_armor', feet: 'iron_greaves' } },
        ysolde:  { skin: '#ecc8a6', hair: '#e8e8f4', style: 1, tunic: '#5a4a8a', trim: '#9ad8ff', pants: '#3a3048', shoes: '#2a2018', cape: '#3a2a6a' },
        brann:   { skin: '#b8805a', hair: '#8a2a1a', style: 2, tunic: '#5a4a3a', trim: '#3a2a1e', pants: '#3a3020', shoes: '#2a2018', beard: '#8a2a1a', s: 1.12, gear: { body: 'padded_vest' } },
        mira:    { skin: '#e2b48c', hair: '#3a6a3a', style: 4, tunic: '#4a8a5a', trim: '#f2d14a', pants: '#2a4a3a', shoes: '#2a2018' },
        tov:     { skin: '#c89a74', hair: '#3a3a3a', style: 0, tunic: '#6a5a3a', trim: '#d8b04a', pants: '#3a3a3a', shoes: '#2a2018', beard: '#5a5a5a', gear: { head: 'iron_helm', body: 'chainmail' } },
        kesh:    { skin: '#a87850', hair: '#1a1a1a', style: 1, tunic: '#8a5a3a', trim: '#e8e0c8', pants: '#4a3a2a', shoes: '#2a2018', gear: { head: 'leather_cap' } },
        ivo:     { skin: '#f0c8a0', hair: '#c8c8c8', style: 2, tunic: '#3a3a6a', trim: '#d8b04a', pants: '#2a2a3a', shoes: '#2a2018', beard: '#d8d8d8', gear: { body: 'mage_robe' } },
        roan:    { skin: '#c8966e', hair: '#5a3a1e', style: 0, tunic: '#4a6a3a', trim: '#8a5a2e', pants: '#3a3020', shoes: '#2a2018', gear: { head: 'hood', feet: 'leather_boots' } },
        pim:     { skin: '#f0c8a0', hair: '#e8a03a', style: 4, tunic: '#d84a4a', trim: '#ffffff', pants: '#4a4a6a', shoes: '#2a2018', s: 0.72 },
        folk1:   { skin: '#e8c4a0', hair: '#8a5a2a', style: 1, tunic: '#8a6a9a', trim: '#ffffff', pants: '#4a4a6a', shoes: '#2a2018' },
        folk2:   { skin: '#a87850', hair: '#3a2a1a', style: 0, tunic: '#6a8a9a', trim: '#e8d27a', pants: '#4a3a2a', shoes: '#2a2018', beard: '#3a2a1a' },
        nessa:   { skin: '#d4a984', hair: '#2a2a2e', style: 1, tunic: '#2f5f7a', trim: '#9fd6ff', pants: '#2a3a4a', shoes: '#2a2018', cape: '#1d3a4a' },
        fenna:   { skin: '#e0c0a0', hair: '#5a8a3a', style: 1, tunic: '#2f6a4a', trim: '#d8f0a0', pants: '#2a4a3a', shoes: '#3a2a1e', cape: '#1f4a2a', gear: { head: 'hood' } },
        kragg:   { skin: '#b07a5a', hair: '#1a1212', style: 2, tunic: '#7a2a1e', trim: '#1a1212', pants: '#2a2220', shoes: '#1a1212', beard: '#1a1212', cape: '#4a1a12', s: 1.18, gear: { body: 'padded_vest', feet: 'iron_greaves' } },
        gorra:   { skin: '#c48c64', hair: '#4a1a12', style: 1, tunic: '#5a2a1e', trim: '#d8b04a', pants: '#2a2220', shoes: '#1a1212' },
        surv1:   { skin: '#e8c4a0', hair: '#5a3a1e', style: 1, tunic: '#6a6a5a', trim: '#c8c8b8', pants: '#3a3a3a', shoes: '#2a2018' },
        surv2:   { skin: '#c8966e', hair: '#2a1a10', style: 0, tunic: '#5a5a6a', trim: '#c8c8b8', pants: '#3a3a3a', shoes: '#2a2018' },
        surv3:   { skin: '#d8a882', hair: '#a8a8a8', style: 2, tunic: '#6a5a4a', trim: '#c8c8b8', pants: '#3a3a3a', shoes: '#2a2018', beard: '#a8a8a8' },
        surv4:   { skin: '#f0c8a0', hair: '#c0582e', style: 4, tunic: '#7a6a5a', trim: '#c8c8b8', pants: '#3a3a3a', shoes: '#2a2018', s: 0.8 },
        brynn:   { skin: '#ecc8a6', hair: '#f0f0f8', style: 1, tunic: '#d8e2ee', trim: '#6a8aaa', pants: '#5a6a7a', shoes: '#3a3a3a', cape: '#e8eef4', gear: { head: 'hood', feet: 'iron_greaves' } },
        leaf:    { anim: 'cat' },
        kingshade: { skin: '#9a8aaa', hair: '#2a2036', style: 1, tunic: '#2a1a3a', trim: '#b07aff', pants: '#1a1424', shoes: '#1a1424', cape: '#3a1a5a', s: 1.4, gear: { head: 'knight_helm' } },
        villager:{ skin: '#e2b48c', hair: '#5a3a1e', style: 0, tunic: '#8a8a6a', trim: '#e8e0c8', pants: '#4a4a4a', shoes: '#2a2018' }
    };
    LOOK.ally_guard = LOOK.aldric; LOOK.ally_grove = LOOK.fenna; LOOK.ally_ash = LOOK.kragg;

    /* ---------------- foes ---------------- */
    const near = f => api.nearest(f.x, f.y);
    function towards(f, p) { const d = api.dist(p.x, p.y, f.x, f.y) || 1; f.vx = (p.x - f.x) / d; f.vy = (p.y - f.y) / d; }
    const theme = () => api.Z.def ? api.Z.def.ground : '';
    function oval(x, X, Y, rx, ry, col) { x.fillStyle = col; x.beginPath(); x.ellipse(X, Y, rx, ry, 0, 0, 6.2832); x.fill(); }
    function bar(x, f, X, Y) { if (f.hp >= f.max) return; x.fillStyle = '#000'; x.fillRect(X - 15, Y, 30, 4); x.fillStyle = '#ff5a5a'; x.fillRect(X - 14, Y + 1, 28 * Math.max(0, f.hp) / f.max, 2); }
    // draw a chapter 1 creature at a larger size (the frontier's wolves and bones are bigger and meaner)
    function drawAs(t, s, tint) {
        return (x, f, X, Y, w) => {
            const ot = f.t, od = f.d; f.t = t; f.d = api.FOE[t];
            x.save(); x.translate(X, Y); x.scale(s, s); x.translate(-X, -Y);
            api.drawFoeBody(f, f.x - X, f.y - Y);
            x.restore(); f.t = ot; f.d = od;
            if (tint) { x.globalAlpha = 0.25; x.drawImage(api.glow(tint), X - 18, Y - 30, 36, 36); x.globalAlpha = 1; }
            bar(x, f, X, Y - 34 * s);
        };
    }
    // a hunter on four legs (stalker, frostfang): crouches before it leaps
    function quad(x, f, X, Y, w, c) {
        const q = near(f), fx = f.st === 2 ? (f.vx < 0 ? -1 : 1) : q && q.x < f.x ? -1 : 1, crouch = f.st === 1 ? 4 : 0, stretch = f.st === 2 ? 1.25 : 1;
        const l = Math.sin(f.walk * 2.2) * 3;
        oval(x, X, Y, 16, 4, 'rgba(0,0,0,0.3)');
        x.save(); x.translate(X, Y); x.scale(fx, 1);
        const body = w ? '#ffffff' : c[0], dark = w ? '#ffffff' : c[1];
        x.fillStyle = dark; x.fillRect(-12, -10 + crouch * 0.5 + l, 3, 10); x.fillRect(-6, -10 - l, 3, 10); x.fillRect(6, -10 - l, 3, 10); x.fillRect(11, -10 + l, 3, 10);
        x.fillStyle = body; x.beginPath(); x.ellipse(0, -15 + crouch, 16 * stretch, 7.5, 0, 0, 6.2832); x.fill();
        x.beginPath(); x.ellipse(15 * stretch, -20 + crouch, 7.5, 6.2, 0, 0, 6.2832); x.fill();
        x.beginPath(); x.moveTo(20 * stretch, -20 + crouch); x.lineTo(28 * stretch, -16 + crouch); x.lineTo(20 * stretch, -14 + crouch); x.fill();
        x.beginPath(); x.moveTo(11 * stretch, -24 + crouch); x.lineTo(13 * stretch, -32 + crouch); x.lineTo(17 * stretch, -25 + crouch); x.fill();
        x.strokeStyle = body; x.lineWidth = 3.5; x.beginPath(); x.moveTo(-15 * stretch, -16 + crouch); x.quadraticCurveTo(-24, -22, -26, -12 + Math.sin(api.tick * 0.2) * 2); x.stroke();
        x.fillStyle = c[2]; for (let k = 0; k < 5; k++) { const sx = -10 + k * 5; x.beginPath(); x.moveTo(sx - 2, -21 + crouch); x.lineTo(sx, -28 - (k & 1) * 2 + crouch); x.lineTo(sx + 2, -21 + crouch); x.fill(); }
        x.fillStyle = c[3]; x.fillRect(17 * stretch, -22 + crouch, 2.5, 2.5);
        x.restore();
        if (f.st === 1) { x.globalAlpha = 0.3 + (api.tick & 4 ? 0.3 : 0); x.strokeStyle = '#ff3a3a'; x.lineWidth = 3; x.beginPath(); x.moveTo(X, Y - 8); x.lineTo(X + f.vx * 120, Y - 8 + f.vy * 120); x.stroke(); x.globalAlpha = 1; }
        bar(x, f, X, Y - 40);
    }
    function pounceUpd(f, p, d, tx, ty, rw, rh, range, chaseFar) {
        if (f.cd > 0) f.cd--;
        if (f.st === 0) {
            if (p && d < chaseFar) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh);
            if (p && d < range && f.cd <= 0) { f.st = 1; f.tm = f.t === 'frostfang' ? 18 : 28; towards(f, p); }
        } else if (f.st === 1) { if (f.tm > 8 && p) towards(f, p); if (--f.tm <= 0) { f.st = 2; f.tm = 14; api.SND.fx('swing'); } }
        else if (f.st === 2) { if (api.tick & 1) api.part(f.x, f.y, 2, -f.vx, -f.vy * 0.5, 0.5, 14, api.Z.dust, 3); if (api.moveEnt(f, f.vx * 5.4, f.vy * 5.4, rw, rh) || --f.tm <= 0) { f.st = 3; f.tm = 26; } }
        else if (--f.tm <= 0) { f.st = 0; f.cd = f.t === 'frostfang' ? 50 : 80; }
    }
    // an archer of ash: keeps away, draws, then shoots three arrows in a fan
    function archerUpd(f, p, d, tx, ty, rw, rh) {
        if (f.cd > 0) f.cd--;
        if (!p || d > 320) { api.wander(f, rw, rh); f.st = 0; return; }
        if (f.st === 0) {
            if (d < 120) api.chase(f, -tx, -ty, f.d.spd, rw, rh); else if (d > 200) api.chase(f, tx, ty, f.d.spd, rw, rh);
            else { if (--f.wt <= 0) { f.wt = 60 + ((Math.random() * 50) | 0); f.sdx = Math.random() < 0.5 ? 1 : -1; } api.moveEnt(f, -ty * f.sdx * f.d.spd * 0.6, tx * f.sdx * f.d.spd * 0.6, rw, rh); }
            if (f.cd <= 0 && d < 280) { f.st = 1; f.tm = 36; towards(f, p); }
        } else if (--f.tm <= 0 || f.st !== 1) {
            const a = Math.atan2(f.vy, f.vx);
            for (let k = -1; k <= 1; k++) api.shot(f.x + f.vx * 10, f.y - 14, Math.cos(a + k * 0.2) * 3.8, Math.sin(a + k * 0.2) * 3.8, f.d.dmg + f.bonus, 5, 4, 0);
            api.SND.fx('bow'); f.cd = 120; f.st = 0;
        } else if (f.tm > 10) towards(f, p);
    }
    function wispUpd(f, p, d, tx, ty, rw, rh) {
        if (f.cd > 0) f.cd--;
        f.walk += 0.08;
        if (!p || d > 300) { api.wander(f, rw, rh); return; }
        if (d < 90 && f.cd < 50) { blinkAway(f, p, '#b07aff'); return; }
        if (d > 170) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.moveEnt(f, -ty * Math.sin(f.walk) * f.d.spd, tx * Math.sin(f.walk) * f.d.spd, rw, rh);
        if (f.cd <= 0) { f.cd = 130; for (let k = -1; k <= 1; k += 2) api.shot(f.x, f.y - 22, (tx + ty * k * 0.4) * 1.6, (ty - tx * k * 0.4) * 1.6, f.d.dmg + f.bonus, 6, 6, 0); api.SND.fx('zap'); }
    }
    function blinkAway(f, p, col) {
        api.burst(f.x, f.y - 14, 12, col, 2); api.SND.fx('blink');
        for (let k = 0; k < 8; k++) { const a = Math.random() * 6.2832, nx = p.x + Math.cos(a) * 160, ny = p.y + Math.sin(a) * 110; if (!api.feetSolid(nx, ny) && api.dist(nx, ny, f.hx, f.hy) < 9 * TS) { f.x = nx; f.y = ny; break; } }
        api.burst(f.x, f.y - 14, 12, col, 2); f.cd = 90;
    }
    function bruteUpd(f, p, d, tx, ty, rw, rh) {
        if (f.cd > 0) f.cd--;
        if (f.st === 0) {
            if (p && d < 240) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh);
            if (f.t === 'yeti' && p && d > 110 && d < 260 && f.cd <= 0) { f.cd = 110; api.shot(f.x, f.y - 30, tx * 3, ty * 3, f.d.dmg + f.bonus, 7, 1, 0); api.SND.fx('shoot'); }
            if (p && d < 85 && f.cd <= 30) { f.st = 1; f.tm = 42; api.hazard(f.x + tx * 20, f.y + ty * 14, 64, 42, Math.round((f.d.dmg + f.bonus) * 1.3), 0, theme() === 'frost' ? '#bfe8ff' : '#c8a878'); }
        } else if (f.st === 1) { if (--f.tm <= 0) { f.st = 2; f.tm = 40; api.SND.fx('slam'); api.shake = Math.max(api.shake, 8); } }
        else if (--f.tm <= 0) { f.st = 0; f.cd = 90; }
    }
    function cultistUpd(f, p, d, tx, ty, rw, rh) {
        if (f.cd > 0) f.cd--;
        f.walk += 0.05;
        if (!p || d > 320) { api.wander(f, rw, rh); return; }
        if (d < 120) api.chase(f, -tx, -ty, f.d.spd, rw, rh); else if (d > 210) api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (f.cd <= 0) {
            f.cd = 170; f.st = 1; f.tm = 30; api.SND.fx('zap');
            for (let k = 0; k < 3; k++) api.hazard(p.x + p.ax * k * 46, p.y + p.ay * k * 30, 30, 50 + k * 10, f.d.dmg + f.bonus, 1, '#8a3aff');
        }
        if (f.st === 1 && --f.tm <= 0) f.st = 0;
    }
    // the abomination of the rift: three moods as it gets hurt
    function riftbornUpd(f, p, d, tx, ty, rw, rh) {
        if (f.cd > 0) f.cd--;
        f.walk += 0.06;
        const ph = f.hp < f.max * 0.33 ? 2 : f.hp < f.max * 0.66 ? 1 : 0;
        if (ph !== f.ph) { f.ph = ph; api.SND.fx('roar'); api.ringFx(f.x, f.y - 20, 70, '#ff5aff'); api.shake = 10; }
        if (!p) return;
        api.chase(f, tx, ty, f.d.spd * (ph === 2 ? 1.6 : 1), rw, rh);
        if (f.cd <= 0) {
            if (ph >= 1 && (api.tick & 1)) { for (let k = 0; k < 10; k++) { const a = k * 0.6283 + f.walk; api.shot(f.x, f.y - 24, Math.cos(a) * 1.7, Math.sin(a) * 1.7, f.d.dmg + f.bonus - 4, 7, 2, 0); } api.SND.fx('zap'); }
            else api.hazard(p.x, p.y, 44, 44, f.d.dmg + f.bonus, 0, '#d05aff');
            if (ph >= 1 && d < 80) blinkAway(f, p, '#d05aff');
            f.cd = ph === 2 ? 70 : 110;
        }
    }
    // shields: blows from the front do much less (go around, or wait for the swing)
    function shieldMul(f, dx, dy) {
        const q = near(f); if (!q || f.st === 2) return 1;
        const fx = q.x - f.x, fy = q.y - f.y, dd = Math.sqrt(fx * fx + fy * fy) || 1;
        if ((-dx * fx - dy * fy) / dd > 0.35) { api.sparks(f.x + fx / dd * 10, f.y - 14, -dx, -dy, 4, '#c8d8ff'); return 0.35; }
        return 1;
    }
    const SOLDIER = { skin: '#9aa4a8', hair: '#3a3a40', style: 2, tunic: '#3a4a5a', trim: '#8a8a7a', pants: '#2a2e36', shoes: '#1e1a20' };
    const ARCHER = { skin: '#e2dccc', hair: '#e2dccc', style: 2, tunic: '#4a4038', trim: '#2a2420', pants: '#3a3430', shoes: '#2a2420' };
    const CULTIST = { skin: '#c8b8d8', hair: '#1a1424', style: 1, tunic: '#3a1a5a', trim: '#b07aff', pants: '#1a1024', shoes: '#140c1c', cape: '#24103a' };
    function person(x, f, X, Y, w, look, gear, weapon, col, s) {
        const q = near(f), tx = q ? q.x - f.x : 1, ty = q ? q.y - f.y : 0, dir = Math.abs(ty) > Math.abs(tx) * 1.3 ? (ty < 0 ? 1 : 0) : 2, flip = tx < 0;
        const aim = f.st === 1, a = aim && f.vx !== undefined ? Math.atan2(f.vy, f.vx) : dir === 2 ? (flip ? -2.2 : -0.95) : -1.3;
        const hx = X + (dir === 2 ? (flip ? -3 : 3) * s : dir === 1 ? -9 * s : 9 * s), hy = Y - 14 * s;
        if (dir === 1) api.drawHeld(weapon, col, '#3a2a20', hx, hy, a, 0, aim ? 8 : 0, 0);
        HERO.draw(x, X, Y, look, gear, dir, flip, f.st === 0 ? f.walk * 1.6 : 0, f.st === 2 ? (flip ? -1 : 1) : 0, w, s);
        if (dir !== 1) api.drawHeld(weapon, col, '#3a2a20', hx, hy, a, 0, aim ? 8 : 0, 0);
        return { dir, flip };
    }
    function soldierDraw(x, f, X, Y, w) {
        const o = person(x, f, X, Y, w, SOLDIER, { head: 'knight_helm', body: 'chainmail', feet: 'iron_greaves' }, 'sword', '#b8c0c8', 1.1);
        const sx = X + (o.dir === 2 ? (o.flip ? -9 : 9) : o.dir === 0 ? -9 : 9), sy = Y - 20;
        if (o.dir !== 1) { x.fillStyle = w ? '#fff' : '#4a5260'; x.beginPath(); x.ellipse(sx, sy, o.dir === 2 ? 4 : 7, 10, 0, 0, 6.2832); x.fill(); x.fillStyle = '#8a8a7a'; x.fillRect(sx - 1, sy - 6, 2, 12); x.fillRect(sx - 4, sy - 1, 8, 2); }
        if (f.st === 1) { x.fillStyle = '#ffd23f'; x.fillRect(X - 1, Y - 58 + (api.tick & 4), 3, 7); x.fillRect(X - 1, Y - 49, 3, 3); }
        bar(x, f, X, Y - 56);
    }
    function archerDraw(x, f, X, Y, w) {
        person(x, f, X, Y, w, ARCHER, { head: 'hood', body: '', feet: '' }, 'bow', '#4a3a2a', 1);
        x.fillStyle = '#ff5a2a'; if (!w) { x.fillRect(X - 3, Y - 32, 1.6, 1.6); x.fillRect(X + 2, Y - 32, 1.6, 1.6); }
        bar(x, f, X, Y - 50);
    }
    function cultistDraw(x, f, X, Y, w) {
        x.globalAlpha = 0.3; x.drawImage(api.glow('#8a3aff'), X - 24, Y - 54, 48, 48); x.globalAlpha = 1;
        const bob = Math.sin(f.walk * 2) * 2 - 3;
        person(x, f, X, Y + bob, w, CULTIST, { head: 'hood', body: 'mage_robe', feet: '' }, 'staff', '#b07aff', 1.05);
        bar(x, f, X, Y - 52);
    }
    function wispDraw(x, f, X, Y, w) {
        const b = Math.sin(f.walk * 3) * 4, y = Y - 24 + b;
        oval(x, X, Y, 9, 3, 'rgba(0,0,0,0.25)');
        x.globalAlpha = 0.7; x.drawImage(api.glow('#b07aff'), X - 22, y - 22, 44, 44); x.globalAlpha = 1;
        x.strokeStyle = w ? '#fff' : '#d8b0ff'; x.lineWidth = 2;
        for (let k = 0; k < 4; k++) { const a = f.walk + k * 1.57; x.beginPath(); x.moveTo(X, y); x.quadraticCurveTo(X + Math.cos(a) * 14, y + 8, X + Math.cos(a + 0.6) * 10, y + 18); x.stroke(); }
        oval(x, X, y, 7, 7, w ? '#fff' : '#e8d0ff'); oval(x, X, y, 3, 3, '#3a1a5a');
        bar(x, f, X, Y - 46);
    }
    function bruteDraw(x, f, X, Y, w) {
        const sh = f.st === 1 ? (api.tick & 2) - 1 : 0, sm = f.st === 2 && f.tm > 30 ? 6 : 0, ice = theme() === 'frost';
        const c1 = w ? '#fff' : ice ? '#8a9ab0' : '#6a5e52', c2 = w ? '#fff' : ice ? '#6a7a90' : '#4e443c', core = ice ? '#7ae0ff' : '#ff8a3a';
        oval(x, X, Y, 22, 6, 'rgba(0,0,0,0.3)');
        x.fillStyle = c2; x.beginPath(); x.ellipse(X - 10 + sh, Y - 8, 7, 9, 0, 0, 6.2832); x.ellipse(X + 10 + sh, Y - 8, 7, 9, 0, 0, 6.2832); x.fill();
        x.fillStyle = c1; x.beginPath(); x.moveTo(X - 20 + sh, Y - 14); x.lineTo(X - 16 + sh, Y - 42); x.lineTo(X + 16 + sh, Y - 44); x.lineTo(X + 21 + sh, Y - 14); x.closePath(); x.fill();
        x.fillStyle = c2; x.beginPath(); x.ellipse(X - 22 + sh, Y - 30 + sm, 8, 12, 0.3, 0, 6.2832); x.ellipse(X + 22 + sh, Y - 30 + sm, 8, 12, -0.3, 0, 6.2832); x.fill();
        oval(x, X + sh, Y - 50, 10, 8, c1);
        x.fillStyle = core; x.fillRect(X - 5 + sh, Y - 52, 3, 2); x.fillRect(X + 2 + sh, Y - 52, 3, 2);
        x.globalAlpha = 0.6 + Math.sin(api.tick * 0.1) * 0.2; oval(x, X + sh, Y - 30, 5, 5, core); x.globalAlpha = 1;
        x.strokeStyle = 'rgba(0,0,0,0.3)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(X - 10 + sh, Y - 40); x.lineTo(X - 4 + sh, Y - 30); x.lineTo(X - 8 + sh, Y - 20); x.stroke();
        bar(x, f, X, Y - 66);
    }
    function yetiDraw(x, f, X, Y, w) {
        const sp = ART.skiSprite(78 + (((f.walk * 0.6) | 0) % 3)), q = near(f), fl = q && q.x < f.x;
        oval(x, X, Y, 18, 5, 'rgba(0,0,0,0.3)');
        if (sp) { x.save(); x.translate(X, Y); if (fl) x.scale(-1, 1); x.imageSmoothingEnabled = false; x.drawImage(sp, -24, -46, 48, 48); x.restore(); if (w) { x.globalAlpha = 0.5; oval(x, X, Y - 22, 18, 22, '#fff'); x.globalAlpha = 1; } }
        else { oval(x, X, Y - 22, 18, 22, w ? '#fff' : '#e8eef4'); oval(x, X, Y - 40, 11, 9, '#cfd8e4'); }
        bar(x, f, X, Y - 54);
    }
    function riftbornDraw(x, f, X, Y, w) {
        const ph = f.ph || 0, col = ph === 2 ? '#ff5aff' : ph === 1 ? '#c060ff' : '#8a4aff', t = api.tick;
        oval(x, X, Y, 26, 7, 'rgba(0,0,0,0.35)');
        x.globalAlpha = 0.5; x.drawImage(api.glow(col), X - 40, Y - 70, 80, 80); x.globalAlpha = 1;
        x.strokeStyle = w ? '#fff' : '#3a1a5a'; x.lineWidth = 5;
        for (let k = 0; k < 6; k++) { const a = k * 1.047 + Math.sin(t * 0.05 + k) * 0.3; x.beginPath(); x.moveTo(X, Y - 26); x.quadraticCurveTo(X + Math.cos(a) * 26, Y - 10, X + Math.cos(a) * 30, Y - 2 + Math.sin(t * 0.1 + k) * 3); x.stroke(); }
        oval(x, X, Y - 30, 22, 20, w ? '#fff' : '#2a1036'); oval(x, X, Y - 34, 16, 12, w ? '#fff' : '#4a1a6a');
        x.fillStyle = col; for (let k = 0; k < 3 + ph; k++) { const ex = X - 10 + k * (20 / (2 + ph)), ey = Y - 36 + Math.sin(t * 0.1 + k) * 2; x.beginPath(); x.arc(ex, ey, 2.5, 0, 6.2832); x.fill(); }
        bar(x, f, X, Y - 62);
    }

    /* ---------------- the four bosses ---------------- */
    const arena = () => api.Z.def.arena;
    // the Rootbound Guardian: never moves; slams, roots that break the ground in lines, thorn volleys, saplings
    function rootUpd(f, p) {
        if (!p) return;
        const enr = f.hp < f.max * 0.3;
        f.walk += 0.03;
        if (f.sum === 0 && f.hp < f.max * 0.6) { f.sum = 1; saplings(f); } else if (f.sum === 1 && f.hp < f.max * 0.3) { f.sum = 2; saplings(f); }
        switch (f.st) {
            case 0: if (++f.tm > (enr ? 40 : 65)) { f.tm = 0; f.pt = (f.pt + 1) % 3; f.st = f.pt + 1; f.wt = 0; } break;
            case 1:                                           // a slam: a ring of bursts around the trunk, then another further out
                if (++f.wt === 1) { api.SND.fx('roar'); for (let k = 0; k < 8; k++) { const a = k * 0.785; api.hazard(f.x + Math.cos(a) * 64, f.y + Math.sin(a) * 40, 34, 48, f.d.dmg, 0, '#7a5a3a'); } }
                if (f.wt === 30 && enr) for (let k = 0; k < 10; k++) { const a = k * 0.628 + 0.3; api.hazard(f.x + Math.cos(a) * 120, f.y + Math.sin(a) * 76, 32, 46, f.d.dmg, 0, '#7a5a3a'); }
                if (f.wt > 80) { f.st = 0; }
                break;
            case 2:                                           // roots: lines of bursts racing toward every hero
                if (++f.wt === 1) {
                    api.toast(T().ui.c3rootRoots); api.SND.fx('slam'); api.shake = 8;
                    for (const q of api.P) if (q.on && !q.down) { const d = api.dist(q.x, q.y, f.x, f.y) || 1, ux = (q.x - f.x) / d, uy = (q.y - f.y) / d;
                        for (let k = 1; k <= 7; k++) api.hazard(f.x + ux * k * 46, f.y + uy * k * 40, 22, 26 + k * 7, f.d.dmg, 0, '#5a8a3a'); }
                }
                if (f.wt > 90) f.st = 0;
                break;
            case 3:                                           // a volley of thorns
                if (++f.wt % 14 === 1) { const n = enr ? 14 : 10; for (let k = 0; k < n; k++) { const a = k * 6.2832 / n + f.wt * 0.05; api.shot(f.x, f.y - 40, Math.cos(a) * 2.4, Math.sin(a) * 2.4, f.d.dmg - 4, 6, 4, 0); } api.SND.fx('shoot'); }
                if (f.wt > 44) f.st = 0;
                break;
        }
    }
    function saplings(f) {
        api.SND.fx('roar'); api.toast(T().ui.c3rootSap);
        for (const k of [-1, 1]) { const m = api.spawnFoe('thornstalker', f.x + k * 100, f.y + 50, true); if (m) { m.active = true; api.burst(m.x, m.y - 10, 14, '#5a8a3a', 2); } }
    }
    function rootDraw(x, f, X, Y, w) {
        const t = api.tick, sway = Math.sin(f.walk) * 3, sick = f.hp > f.max * 0.3, shake = f.st === 1 && f.wt < 40 ? (t & 2) - 1 : 0;
        oval(x, X, Y, 46, 12, 'rgba(0,0,0,0.35)');
        x.strokeStyle = w ? '#fff' : '#3a2818'; x.lineWidth = 7; x.lineCap = 'round';
        for (let k = 0; k < 6; k++) { const a = k * 1.047 + 0.3, l = 40 + Math.sin(t * 0.05 + k) * 4; x.beginPath(); x.moveTo(X, Y - 6); x.quadraticCurveTo(X + Math.cos(a) * l * 0.6, Y + 2, X + Math.cos(a) * l, Y + Math.sin(a) * 10 + 2); x.stroke(); }
        x.fillStyle = w ? '#fff' : '#4a3424'; x.beginPath(); x.moveTo(X - 22 + shake, Y - 4); x.quadraticCurveTo(X - 18, Y - 60, X - 14 + sway, Y - 96); x.lineTo(X + 14 + sway, Y - 96); x.quadraticCurveTo(X + 18, Y - 60, X + 22 + shake, Y - 4); x.fill();
        x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(X - 10, Y - 80, 3, 70);
        const g = sick ? ['#2a2036', '#3a2a4a', '#5a3a6a'] : ['#21583c', '#2c6e4c', '#44966a'];
        oval(x, X + sway, Y - 108, 50, 26, w ? '#fff' : g[0]); oval(x, X - 22 + sway, Y - 128, 30, 22, w ? '#fff' : g[1]); oval(x, X + 24 + sway, Y - 126, 30, 22, w ? '#fff' : g[1]); oval(x, X + sway, Y - 146, 30, 22, w ? '#fff' : g[2]);
        x.fillStyle = '#1a1010'; oval(x, X - 8 + sway * 0.5, Y - 66, 5, 7, '#1a1010'); oval(x, X + 8 + sway * 0.5, Y - 66, 5, 7, '#1a1010');
        x.fillStyle = sick ? '#d05aff' : '#7ef0c0'; x.fillRect(X - 9 + sway * 0.5, Y - 67, 3, 3); x.fillRect(X + 7 + sway * 0.5, Y - 67, 3, 3);
        x.fillStyle = '#1a1010'; x.beginPath(); x.ellipse(X + sway * 0.5, Y - 46, 9, f.st === 1 || f.st === 2 ? 7 : 3, 0, 0, 6.2832); x.fill();
        if (sick) { x.fillStyle = '#1a0a1a'; x.fillRect(X - 9 + sway * 0.5, Y - 60, 2, 8 + (t >> 3) % 6); }
    }

    // Marshal Veyr: three dashing slashes along red lines, a long shield charge (dazed if he hits a wall), a shield wall, dead soldiers
    function veyrUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const enr = f.hp < f.max * 0.33, a = arena(), cx = a[0] * TS, cy = a[1] * TS;
        if (f.sum === 0 && f.hp < f.max * 0.66) { f.sum = 1; veyrCall(f); } else if (f.sum === 1 && f.hp < f.max * 0.33) { f.sum = 2; veyrCall(f); }
        switch (f.st) {
            case 0:
                if (api.dist(f.x, f.y, cx, cy) > 8 * TS) api.chase(f, (cx - f.x) / 200, (cy - f.y) / 200, 1.5, rw, rh);
                else if (d > 70) api.chase(f, tx, ty, f.d.spd, rw, rh);
                if (++f.tm > (enr ? 40 : 60)) { f.tm = 0; f.pt = (f.pt + 1) % 4; f.ph = 0; if (f.pt === 3) { f.st = 5; f.wt = 70; f.immune = true; api.toast(T().ui.c3veyrShield); } else if (f.pt === 1) { f.st = 3; f.wt = 44; towards(f, p); } else { f.st = 1; f.wt = enr ? 16 : 22; towards(f, p); } }
                break;
            case 1: if (f.wt > 8) towards(f, p); if (--f.wt <= 0) { f.st = 2; f.wt = 12; api.SND.fx('swing'); } break;            // aim a slash
            case 2:                                                                                                         // the slash dash
                if (api.tick & 1) api.part(f.x, f.y, 2, -f.vx, -f.vy * 0.5, 0.6, 14, '#c8c8d0', 3);
                api.moveEnt(f, f.vx * 6.2, f.vy * 6.2, rw, rh);
                if (--f.wt <= 0) { if (++f.ph < 3) { f.st = 1; f.wt = enr ? 12 : 16; towards(f, p); } else { f.st = 0; f.tm = 0; } }
                break;
            case 3: f.immune = true; if (f.wt > 16) towards(f, p); if (--f.wt <= 0) { f.st = 4; f.wt = 46; api.SND.fx('roar'); } break;    // the shield charge: aim
            case 4:
                if (api.tick & 1) api.part(f.x, f.y, 2, -f.vx, -f.vy * 0.5, 0.6, 16, '#8a8a9a', 4);
                if (api.moveEnt(f, f.vx * 7.2, f.vy * 7.2, rw, rh)) { f.immune = false; f.weak = true; f.st = 6; f.wt = 100; api.shake = 16; api.SND.fx('slam'); api.ringFx(f.x, f.y, 50, '#ffd23f'); break; }
                if (--f.wt <= 0) { f.immune = false; f.st = 0; f.tm = 0; }
                break;
            case 5:                                                                                                         // shield wall, then a shockwave
                if (--f.wt === 0) { f.immune = false; f.st = 7; f.ring = 12; f.mask = 0; api.SND.fx('slam'); api.shake = 12; }
                break;
            case 6: if (--f.wt <= 0) { f.weak = false; f.st = 0; f.tm = 0; } break;                                           // dazed: strike now!
            case 7:
                f.ring += 3.4;
                for (const q of api.P) if (q.on && !q.down && !(f.mask & (1 << q.i)) && Math.abs(api.dist(q.x, q.y, f.x, f.y) - f.ring) < 12) { f.mask |= 1 << q.i; api.hurt(q, f.d.dmg, f.x, f.y, true); }
                if (f.ring > 130) { f.st = 0; f.tm = 0; }
                break;
        }
    }
    function veyrCall(f) {
        api.SND.fx('roar'); api.toast(T().ui.c3veyrCall);
        const list = ['hollowsoldier', 'hollowsoldier', 'ashenarcher'];
        list.forEach((t, k) => { const m = api.spawnFoe(t, f.x + (k - 1) * 90, f.y + 60, true); if (m) { m.active = true; api.burst(m.x, m.y - 10, 12, '#d8d2c0', 2); if (api.feetSolid(m.x, m.y)) { m.x = f.x; m.y = f.y + 50; } } });
    }
    const VEYR = { skin: '#8a9498', hair: '#1a1a1e', style: 2, tunic: '#3a3a4a', trim: '#d8b04a', pants: '#2a2a34', shoes: '#1a1a1e', cape: '#6a1a1a', beard: '#4a4a52' };
    function veyrDraw(x, f, X, Y, w) {
        if (f.st === 1 || f.st === 3) {
            x.globalAlpha = 0.3 + (f.wt < 10 ? 0.4 : 0) * (api.tick & 2 ? 1 : 0.4); x.strokeStyle = f.st === 3 ? '#ffb020' : '#ff3a3a'; x.lineWidth = f.st === 3 ? 18 : 8;
            x.beginPath(); x.moveTo(X, Y); x.lineTo(X + f.vx * (f.st === 3 ? 330 : 80), Y + f.vy * (f.st === 3 ? 330 : 80)); x.stroke(); x.globalAlpha = 1;
        }
        if (f.st === 7) { x.globalAlpha = 0.8; x.strokeStyle = '#ffd23f'; x.lineWidth = 6; x.beginPath(); x.ellipse(X, Y, f.ring, f.ring * 0.45, 0, 0, 6.2832); x.stroke(); x.globalAlpha = 1; }
        const q = near(f), flip = q ? q.x < f.x : false, a = f.st === 2 ? Math.atan2(f.vy, f.vx) : flip ? -2.3 : -0.85, sx = X + (f.st === 3 ? (api.tick & 2) - 1 : 0);
        HERO.draw(x, sx, Y, VEYR, { head: 'knight_helm', body: 'plate_armor', feet: 'iron_greaves' }, 2, flip, f.st === 0 ? f.walk * 1.6 : 0, f.st === 2 ? (flip ? -1 : 1) : 0, w, 1.7);
        api.drawHeld('sword', '#c8d0dc', '#3a2416', sx + (flip ? -6 : 6), Y - 25, a, 3, f.st === 2 ? 8 : 0, 0);
        const shx = sx + (flip ? 10 : -10) * (f.immune ? -1 : 1), shy = Y - 34;
        x.fillStyle = w ? '#fff' : f.immune ? '#d8b04a' : '#4a4a5a'; x.beginPath(); x.moveTo(shx - 9, shy - 13); x.lineTo(shx + 9, shy - 13); x.lineTo(shx + 8, shy + 6); x.lineTo(shx, shy + 15); x.lineTo(shx - 8, shy + 6); x.closePath(); x.fill();
        x.fillStyle = '#6a1a1a'; x.fillRect(shx - 2, shy - 10, 4, 18); x.fillRect(shx - 7, shy - 3, 14, 4);
        if (f.immune) { x.globalAlpha = 0.3 + Math.sin(api.tick * 0.3) * 0.15; x.strokeStyle = '#ffd23f'; x.lineWidth = 3; x.beginPath(); x.ellipse(X, Y - 34, 30, 40, 0, 0, 6.2832); x.stroke(); x.globalAlpha = 1; }
        if (f.weak) { x.fillStyle = '#ffd23f'; for (let k = 0; k < 3; k++) { const b = api.tick * 0.12 + k * 2.1; x.fillRect(X + Math.cos(b) * 16, Y - 80 + Math.sin(b) * 4, 4, 4); } }
    }

    // the Frozen Colossus: the floor freezes under you all the time, a stomp ring with a gap, ice shards, an avalanche
    function colUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const enr = f.hp < f.max * 0.5;
        f.walk += 0.03;
        if (++f.sum % (enr ? 40 : 56) === 0) for (const q of api.P) if (q.on && !q.down) api.hazard(q.x, q.y, 30, 46, f.d.dmg - 6, 1, '#9ad8ff');
        if (f.sum === 1) api.toast(T().ui.c3colIce);
        switch (f.st) {
            case 0:
                api.chase(f, tx, ty, d > 60 ? f.d.spd : 0, rw, rh);
                if (++f.tm > (enr ? 60 : 80)) { f.tm = 0; f.pt = (f.pt + 1) % (enr ? 3 : 2); f.st = f.pt + 1; f.wt = 0; f.ang = Math.random() * 6.2832; f.ring = 0; f.mask = 0; }
                break;
            case 1:                                            // a stomp: an icy ring with one gap (green marks)
                if (f.wt < 50) { f.wt++; if (f.wt === 50) { api.SND.fx('slam'); api.shake = 14; f.ring = 16; } break; }
                f.ring += enr ? 3.4 : 2.8;
                for (const q of api.P) if (q.on && !q.down && !(f.mask & (1 << q.i))) {
                    const dx = q.x - f.x, dy = (q.y - f.y) * 2, rr = Math.sqrt(dx * dx + dy * dy);
                    if (Math.abs(rr - f.ring) < 12) { let da = Math.atan2(dy, dx) - f.ang; while (da > Math.PI) da -= 6.2832; while (da < -Math.PI) da += 6.2832; if (Math.abs(da) > 0.55) { f.mask |= 1 << q.i; api.hurt(q, f.d.dmg, f.x, f.y, true); } }
                }
                if (f.ring > 300) { f.st = 0; f.ring = 0; }
                break;
            case 2:                                            // shards of ice in every direction, twice
                if (++f.wt === 20 || f.wt === 50) { const n = 12; for (let k = 0; k < n; k++) { const a = k * 6.2832 / n + f.wt * 0.02; api.shot(f.x, f.y - 50, Math.cos(a) * 2.3, Math.sin(a) * 2.3, f.d.dmg - 4, 7, 1, 0); } api.SND.fx('shoot'); }
                if (f.wt > 70) f.st = 0;
                break;
            case 3:                                            // an avalanche from the walls
                if (++f.wt === 1) { api.toast(T().ui.c3colAval); api.SND.fx('roar'); const a = arena(); for (let k = 0; k < 9; k++) api.hazard((a[0] + (Math.random() - 0.5) * 16) * TS, (a[1] + (Math.random() - 0.5) * 7) * TS, 34, 40 + k * 6, f.d.dmg, 0, '#e8f4ff'); }
                if (f.wt > 100) f.st = 0;
                break;
        }
    }
    function colDraw(x, f, X, Y, w) {
        if (f.st === 1 && (f.wt < 50 || f.ring > 0)) {
            const r = f.ring || 20 + f.wt * 0.5;
            x.globalAlpha = f.ring ? 0.85 : 0.4; x.strokeStyle = '#bfe8ff'; x.lineWidth = f.ring ? 8 : 2;
            x.beginPath(); x.ellipse(X, Y, r, r * 0.5, 0, f.ang + 0.55, f.ang + 6.2832 - 0.55); x.stroke();
            x.fillStyle = '#7ef0a0'; x.globalAlpha = 0.9; for (const s of [-0.55, 0.55]) x.fillRect(X + Math.cos(f.ang + s) * r - 3, Y + Math.sin(f.ang + s) * r * 0.5 - 3, 6, 6);
            x.globalAlpha = 1;
        }
        const b = Math.sin(f.walk * 2) * 2, c1 = w ? '#fff' : '#a8c8e8', c2 = w ? '#fff' : '#7898b8', c3 = w ? '#fff' : '#d8ecff';
        oval(x, X, Y, 40, 11, 'rgba(0,0,0,0.35)');
        x.fillStyle = c2; x.fillRect(X - 26, Y - 34, 16, 34); x.fillRect(X + 10, Y - 34, 16, 34);
        x.fillStyle = c1; x.beginPath(); x.moveTo(X - 36, Y - 34 + b); x.lineTo(X - 30, Y - 96 + b); x.lineTo(X + 30, Y - 100 + b); x.lineTo(X + 38, Y - 34 + b); x.closePath(); x.fill();
        x.fillStyle = c3; x.beginPath(); x.moveTo(X - 30, Y - 96 + b); x.lineTo(X - 8, Y - 100 + b); x.lineTo(X - 20, Y - 60 + b); x.fill();
        const arm = f.st === 1 && f.wt < 50 ? -14 : 0;
        x.fillStyle = c2; x.beginPath(); x.ellipse(X - 44, Y - 66 + b + arm, 12, 26, 0.2, 0, 6.2832); x.ellipse(X + 44, Y - 66 + b + arm, 12, 26, -0.2, 0, 6.2832); x.fill();
        x.fillStyle = c1; x.beginPath(); x.moveTo(X - 16, Y - 100 + b); x.lineTo(X - 12, Y - 124 + b); x.lineTo(X + 12, Y - 126 + b); x.lineTo(X + 16, Y - 100 + b); x.fill();
        x.fillStyle = '#7ae0ff'; x.fillRect(X - 9, Y - 116 + b, 5, 3); x.fillRect(X + 4, Y - 116 + b, 5, 3);
        x.globalAlpha = 0.6 + Math.sin(api.tick * 0.08) * 0.2; x.drawImage(api.glow('#7ae0ff'), X - 18, Y - 82 + b, 36, 36); x.globalAlpha = 1;
        x.fillStyle = c3; for (let k = 0; k < 5; k++) { x.beginPath(); x.moveTo(X - 24 + k * 12, Y - 98 + b); x.lineTo(X - 20 + k * 12, Y - 112 - (k & 1) * 8 + b); x.lineTo(X - 16 + k * 12, Y - 98 + b); x.fill(); }
    }

    // the Hollow King: void spirals and shadow dashes; a shield held by three rift shards; the arena breaks; a turning beam and the pull of the void
    function kingUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const a = arena(), cx = a[0] * TS, cy = a[1] * TS, ph = f.hp < f.max * 0.33 ? 3 : f.hp < f.max * 0.66 ? 2 : 1;
        f.walk += 0.04;
        if (f.sum === 0 && ph >= 2) {                         // phase 2: the shield of the rift
            f.sum = 1; f.immune = true; api.SND.fx('roar'); api.toast(T().ui.c3kingShield); api.shake = 14;
            for (let k = 0; k < 3; k++) { const ang = k * 2.094, m = api.spawnFoe('riftshard', cx + Math.cos(ang) * 150, cy + Math.sin(ang) * 90, true); if (m) { m.active = true; api.ringFx(m.x, m.y, 30, '#b07aff'); } }
            for (const k of [-1, 1]) { const m = api.spawnFoe('riftwisp', f.x + k * 120, f.y + 60, true); if (m) m.active = true; }
            fracture(cx, cy);
        }
        if (f.sum === 1 && ph === 3) { f.sum = 2; api.SND.fx('roar'); api.toast(T().ui.c3kingP3); api.flash = 8; api.shake = 20; fracture(cx, cy); for (const k of [-1, 1]) { const m = api.spawnFoe('veilcultist', f.x + k * 140, f.y + 70, true); if (m) m.active = true; } }
        if (f.immune) {
            let left = 0; for (const o of api.FOES) if (o.on && o.t === 'riftshard') left++;
            if (!left) { f.immune = false; f.weak = true; f.wt2 = 170; api.SND.fx('crit'); api.toast(T().ui.c3kingWeak); api.ringFx(f.x, f.y - 20, 80, '#ffd23f'); }
        }
        if (f.weak && --f.wt2 <= 0) f.weak = false;
        if (ph === 3) for (const q of api.P) if (q.on && !q.down) { const dd = api.dist(q.x, q.y, cx, cy) || 1; q.kx += (cx - q.x) / dd * 0.18; q.ky += (cy - q.y) / dd * 0.18; }   // the void pulls
        switch (f.st) {
            case 0:
                if (api.dist(f.x, f.y, cx, cy) > 4 * TS) api.chase(f, (cx - f.x) / 120, (cy - f.y) / 120, 0.8, rw, rh);
                else api.chase(f, tx, ty, d > 110 ? f.d.spd : 0, rw, rh);
                if (++f.tm > (ph === 3 ? 34 : 56)) { f.tm = 0; f.pt = (f.pt + 1) % (ph === 1 ? 2 : 3); f.st = f.pt + 1; f.wt = 0; f.ph = 0; f.ang = Math.atan2(p.y - f.y, p.x - f.x); }
                break;
            case 1:                                            // a spiral of void
                if (++f.wt % (ph === 3 ? 4 : 6) === 0) { const arms = ph === 3 ? 4 : 3; for (let k = 0; k < arms; k++) { const an = f.ang + k * 6.2832 / arms; api.shot(f.x, f.y - 34, Math.cos(an) * 2, Math.sin(an) * 2, f.d.dmg - 6, 7, 2, 0); } f.ang += 0.27; if ((f.wt & 15) === 0) api.SND.fx('shoot'); }
                if (f.wt > 110) f.st = 0;
                break;
            case 2:                                            // shadow swords: dashes along lines
                if (f.wt === 0) { towards(f, p); f.ph = 0; }
                if (++f.wt < 26) { if (f.wt < 16) towards(f, p); break; }
                if (f.wt === 26) api.SND.fx('swing');
                if (api.moveEnt(f, f.vx * 6.5, f.vy * 6.5, rw, rh) || f.wt > 42) { if (++f.ph < (ph === 3 ? 3 : 2)) { f.wt = 6; } else { f.st = 0; } }
                if (api.tick & 1) api.part(f.x, f.y - 20, 4, -f.vx, -f.vy * 0.5, 0.4, 18, '#8a4aff', 4);
                break;
            case 3:                                            // a beam of the Veil that turns (two in the last phase)
                if (f.wt === 0) { f.ang = Math.atan2(p.y - f.y, p.x - f.x) - 1; f.vx = Math.random() < 0.5 ? 1 : -1; }
                if (++f.wt === 45) api.SND.fx('beam');
                if (f.wt > 45) {
                    f.ang += f.vx * (ph === 3 ? 0.017 : 0.013);
                    for (const q of api.P) if (q.on && !q.down) for (let b = 0; b < (ph === 3 ? 2 : 1); b++) {
                        const an = f.ang + b * Math.PI, dx = q.x - f.x, dy = q.y - 8 - (f.y - 34), along = dx * Math.cos(an) + dy * Math.sin(an), perp = Math.abs(-dx * Math.sin(an) + dy * Math.cos(an));
                        if (along > 30 && perp < 12) api.hurt(q, f.d.dmg, f.x, f.y);
                    }
                }
                if (f.wt > 45 + 140) { f.st = 0; f.tm = 0; }
                break;
        }
    }
    // the arena breaks: rifts that burn for a long time around the edge of the throne room
    function fracture(cx, cy) {
        for (let k = 0; k < 7; k++) { const an = k * 0.8976 + Math.random() * 0.3, h = api.hazard(cx + Math.cos(an) * 190, cy + Math.sin(an) * 110, 36, 60, 10, 1, '#6a2aff'); if (h) h.burn = 900; }
    }
    function shardUpd(f) { f.sy = f.y; f.walk += 0.06; }
    function shardDraw(x, f, X, Y, w) {
        const b = Math.sin(f.walk * 2) * 3;
        x.globalAlpha = 0.6 + Math.sin(api.tick * 0.15) * 0.2; x.drawImage(api.glow('#b07aff'), X - 24, Y - 50 + b, 48, 48); x.globalAlpha = 1;
        x.fillStyle = w ? '#fff' : '#b07aff'; x.beginPath(); x.moveTo(X, Y - 44 + b); x.lineTo(X + 9, Y - 20 + b); x.lineTo(X, Y - 4 + b); x.lineTo(X - 9, Y - 20 + b); x.closePath(); x.fill();
        x.fillStyle = '#f0e0ff'; x.beginPath(); x.moveTo(X, Y - 44 + b); x.lineTo(X - 9, Y - 20 + b); x.lineTo(X, Y - 14 + b); x.fill();
        x.fillStyle = '#000'; x.fillRect(X - 13, Y - 54, 26, 4); x.fillStyle = '#b07aff'; x.fillRect(X - 12, Y - 53, 24 * f.hp / f.max, 2);
    }
    const KING = { skin: '#7a6a8a', hair: '#e8e0f0', style: 1, tunic: '#1a1024', trim: '#b07aff', pants: '#140c1c', shoes: '#140c1c', cape: '#2a1040', beard: '#d8d0e8' };
    function kingDraw(x, f, X, Y, w) {
        const t = api.tick, bob = Math.sin(f.walk * 2) * 4 - 10, q = near(f), flip = q ? q.x < f.x : false;
        if (f.st === 2 && f.wt < 26) { x.globalAlpha = 0.3 + (f.wt > 16 ? 0.4 : 0) * (t & 2 ? 1 : 0.4); x.strokeStyle = '#8a4aff'; x.lineWidth = 10; x.beginPath(); x.moveTo(X, Y); x.lineTo(X + f.vx * 260, Y + f.vy * 260); x.stroke(); x.globalAlpha = 1; }
        if (f.st === 3) {
            const on = f.wt > 45;
            for (let b = 0; b < (f.hp < f.max * 0.33 ? 2 : 1); b++) {
                const an = f.ang + b * Math.PI;
                x.globalAlpha = on ? 0.85 : 0.3 + (t & 4 ? 0.2 : 0); x.strokeStyle = on ? '#e8d8ff' : '#8a4aff'; x.lineWidth = on ? 16 : 2;
                x.beginPath(); x.moveTo(X + Math.cos(an) * 30, Y - 34 + Math.sin(an) * 30); x.lineTo(X + Math.cos(an) * 440, Y - 34 + Math.sin(an) * 440); x.stroke();
                if (on) { x.strokeStyle = '#ffffff'; x.lineWidth = 5; x.stroke(); }
            }
            x.globalAlpha = 1;
        }
        x.globalAlpha = 0.55; x.drawImage(api.glow('#6a2aff'), X - 50, Y - 110 + bob, 100, 100); x.globalAlpha = 1;
        oval(x, X, Y, 22, 7, 'rgba(0,0,0,0.35)');
        HERO.draw(x, X, Y + bob, KING, { head: '', body: 'mage_robe', feet: '' }, 2, flip, 0, 0, w, 1.75);
        // the broken crown
        x.fillStyle = w ? '#fff' : '#d8b04a'; const cy2 = Y + bob - 66;
        x.fillRect(X - 9, cy2, 18, 4); for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(X - 9 + k * 6, cy2); x.lineTo(X - 6 + k * 6, cy2 - 7 - (k & 1) * 3); x.lineTo(X - 3 + k * 6, cy2); x.fill(); }
        x.fillStyle = '#b07aff'; x.fillRect(X - 1, cy2 + 1, 2, 2);
        api.drawHeld('staff', '#8a4aff', '#2a1a3a', X + (flip ? -14 : 14), Y + bob - 26, -1.5, 3, 0, 0);
        x.strokeStyle = '#b07aff'; x.lineWidth = 2; for (let k = 0; k < 2; k++) { x.globalAlpha = 0.7; x.beginPath(); x.ellipse(X, Y + bob - 76 - k * 4, 18 + k * 6, 5 + k, Math.sin(t * 0.02 + k) * 0.3, 0, 6.2832); x.stroke(); }
        if (f.immune) { x.globalAlpha = 0.35 + Math.sin(t * 0.2) * 0.15; x.strokeStyle = '#b07aff'; x.lineWidth = 4; x.beginPath(); x.ellipse(X, Y - 40 + bob, 34, 48, 0, 0, 6.2832); x.stroke(); }
        if (f.weak) { x.globalAlpha = 1; x.fillStyle = '#ffd23f'; for (let k = 0; k < 3; k++) { const b = t * 0.12 + k * 2.1; x.fillRect(X + Math.cos(b) * 16, Y - 96 + bob + Math.sin(b) * 4, 4, 4); } }
        x.globalAlpha = 1;
    }

    // stats: tuned so a hero in full legendary gear at +1 still has to fight (normal foes take 6-10 blows; bosses are long fights)
    const FOES = {
        thornstalker:  { hp: 150, dmg: 11, spd: 1.25, r: 12, xp: 34, coin: 10, def: 2, upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 120, 260), draw: (x, f, X, Y, w) => quad(x, f, X, Y, w, ['#3a5a2e', '#2a3e22', '#a8d870', '#ff5a2a']) },
        frostfang:     { hp: 140, dmg: 11, spd: 1.6, r: 12, xp: 34, coin: 10, def: 2, upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 90, 380), draw: (x, f, X, Y, w) => quad(x, f, X, Y, w, ['#e8eef4', '#b8c4d4', '#ffffff', '#ff3a3a']) },
        grimwolf:      { hp: 110, dmg: 10, spd: 1.2, r: 12, xp: 26, coin: 8, def: 1, upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 90, 220), draw: drawAs('wolf', 1.3) },
        cryptbones:    { hp: 120, dmg: 10, spd: 0.9, r: 11, xp: 26, coin: 8, def: 3, upd: bruteUpd, draw: drawAs('bones', 1.2, '#9a8aaa') },
        hollowsoldier: { hp: 210, dmg: 12, spd: 0.75, r: 12, xp: 40, coin: 12, def: 5, ai: 'brute', hitMul: shieldMul, draw: soldierDraw },
        ashenarcher:   { hp: 120, dmg: 10, spd: 0.85, r: 10, xp: 34, coin: 10, def: 1, upd: archerUpd, draw: archerDraw },
        riftwisp:      { hp: 100, dmg: 9, spd: 1.0, r: 10, xp: 32, coin: 9, def: 0, upd: wispUpd, draw: wispDraw },
        stonebrute:    { hp: 420, dmg: 16, spd: 0.55, r: 16, xp: 60, coin: 18, def: 8, upd: bruteUpd, draw: bruteDraw },
        yeti:          { hp: 320, dmg: 15, spd: 0.8, r: 15, xp: 55, coin: 14, def: 5, upd: bruteUpd, draw: yetiDraw },
        veilcultist:   { hp: 130, dmg: 12, spd: 0.75, r: 10, xp: 40, coin: 12, def: 2, upd: cultistUpd, draw: cultistDraw },
        riftborn:      { hp: 900, dmg: 18, spd: 0.7, r: 20, xp: 160, coin: 40, def: 6, upd: riftbornUpd, draw: riftbornDraw },
        riftshard:     { hp: 260, dmg: 0, spd: 0, r: 12, xp: 20, coin: 0, upd: shardUpd, draw: shardDraw },
        rootbound:     { hp: 2600, dmg: 16, spd: 0, r: 30, xp: 600, coin: 300, def: 4, boss: 1, upd: rootUpd, draw: rootDraw },
        veyr:          { hp: 3000, dmg: 18, spd: 1.2, r: 16, xp: 700, coin: 350, def: 6, boss: 1, upd: veyrUpd, draw: veyrDraw },
        colossus:      { hp: 3200, dmg: 20, spd: 0.45, r: 30, xp: 800, coin: 400, def: 8, boss: 1, upd: colUpd, draw: colDraw },
        hollowking:    { hp: 4200, dmg: 20, spd: 0.6, r: 20, xp: 1200, coin: 600, def: 6, boss: 1, upd: kingUpd, draw: kingDraw }
    };

    /* ---------------- side quests, gear, shops ---------------- */
    const QUESTS = [
        { id: 'c3_stalkers', giver: 'roan', type: 'kill', foe: 'thornstalker', n: 6, stage: 1, rep: 'guard', reward: { coins: 220, item: 'runed_bow' } },
        { id: 'c3_wisps', giver: 'fenna', type: 'kill', foe: 'riftwisp', n: 5, stage: 11, rep: 'grove', reward: { coins: 240, item: 'grove_staff' } },
        { id: 'leaf', giver: 'fenna', type: 'rescue', who: 'leaf', stage: 11, after: 'c3_wisps', rep: 'grove', reward: { coins: 180, big: 3 } },
        { id: 'c3_bones', giver: 'kragg', type: 'kill', foe: 'cryptbones', n: 8, stage: 12, rep: 'ash', reward: { coins: 260, item: 'ash_musket' } },
        { id: 'c3_brutes', giver: 'kragg', type: 'kill', foe: 'stonebrute', n: 4, stage: 14, after: 'c3_bones', rep: 'ash', reward: { coins: 300, item: 'wyrm_boots' } },
        { id: 'c3_soldiers', giver: 'aldric', type: 'kill', foe: 'hollowsoldier', n: 6, stage: 13, rep: 'guard', reward: { coins: 280, item: 'frost_blade' } },
        { id: 'c3_fangs', giver: 'brynn', type: 'kill', foe: 'frostfang', n: 5, stage: 22, rep: 'guard', reward: { coins: 320, item: 'warden_helm' } },
        { id: 'c3_cultists', giver: 'kesh', type: 'kill', foe: 'veilcultist', n: 5, stage: 27, reward: { coins: 360, item: 'frost_plate' } }
    ];
    const REP_GIFT = { guard: 'warden_helm', grove: 'runic_robe', ash: 'wyrm_boots' };
    const BOSS_GIFT = { rootbound: 'sylvan_warbow', veyr: 'dawnbreaker', colossus: 'thunderforge', hollowking: 'veilstaff' };
    const SHOP_BRANN = ['tide_blade', 'gale_bow', 'storm_musket', 'tide_staff', 'coral_helm', 'tide_mail', 'wave_boots', 'frost_blade', 'runed_bow'];
    const SHOP_TOV = ['frost_blade', 'runed_bow', 'ash_musket', 'grove_staff', 'warden_helm', 'frost_plate', 'runic_robe', 'wyrm_boots'];
    let shopOf = 'brann';

    /* ---------------- talking ---------------- */
    function story(id) {
        const c = C(), s = step(), t = T();
        if (s && (s.type === 'talk' || s.type === 'choice') && s.npc === id && s.zone === api.Z.id) {
            if (s.type === 'talk') { complete(sayPages(s.say, id)); return true; }
            const picks = s.picks.map(pk => ({ label: loc(pk.label), fn: () => { api.closeDlg(); c.banner = pk.id; complete(sayPages(pk, pk.who)); } }));
            api.say(sayPages(s.say, id), picks);
            return true;
        }
        if (s && s.type === 'rescue' && s.npcs.indexOf(id) >= 0 && s.zone === api.Z.id) {
            const i = s.npcs.indexOf(id);
            if (c.m & (1 << i)) return lines(id, 'c3survIdle');
            c.m |= 1 << i; c.c++; api.SND.fx('quest');
            const pg = eachPages(s, i, id);
            for (const n of api.Z.npcs) if (n.id === id) api.burst(n.x, n.y - 10, 16, '#ffe9a8', 2);
            if (c.c >= s.n) complete(pg); else { api.save(); api.say(pg, null, () => api.toast(objective(api.L))); }
            return true;
        }
        if (id === 'ivo' && c.lore === 15 && !c.ivo) {
            c.ivo = true; api.addToBag(api.makeItem('grove_staff', 3), true); api.SND.fx('level'); api.save();
            setTimeout(() => api.toast(t.ui.c3giftLore), 2600);
            return lines('ivo', 'c3ivoDone');
        }
        return null;
    }
    function idle(id) {
        const c = C(), lit = c.beacons >= 2;
        const key = { aldric: 'c3aldricIdle', ysolde: 'c3ysoldeIdle', brann: 'c3brann', mira: 'c3mira', tov: 'c3tov', kesh: 'c3kesh', ivo: 'c3ivo', roan: 'c3roan',
                      pim: lit ? 'c3pimLit' : 'c3pim', folk1: lit ? 'c3folkLit' : 'c3folk1', folk2: lit ? 'c3folkLit' : 'c3folk2', nessa: 'c3nessa', fenna: 'c3fennaIdle',
                      kragg: 'c3kraggIdle', gorra: 'c3gorra', brynn: 'c3brynnIdle', ally_guard: 'c3ally_guard', ally_grove: 'c3ally_grove', ally_ash: 'c3ally_ash' }[id];
        if (id.indexOf('surv') === 0) return lines(id, 'c3survIdle');
        return key ? lines(id, key) : null;
    }
    function extras(id, ch) {
        const t = T(), s = S();
        if (id === 'brann') ch.push({ label: t.ui.browseForge, fn: () => { shopOf = 'brann'; api.closeDlg(); api.forgeScreen(); } });
        if (id === 'tov') ch.push({ label: t.ui.c3browseQuarter, fn: () => { shopOf = 'tov'; api.closeDlg(); api.forgeScreen(); } });
        if (id === 'mira') ch.push({ label: t.ui.browsePotions, fn: () => { api.closeDlg(); api.potionScreen(); } });
        if (id === 'nessa') ch.push({ label: t.ui.c3sailBack, fn: () => { api.closeDlg(); api.travel('c2_bay', 23.5, 23.6); } });
    }
    function news(id) {
        const s = step(), c = C();
        if (!s) return id === 'ivo' && c.lore === 15 && !c.ivo;
        if ((s.type === 'talk' || s.type === 'choice') && s.npc === id) return true;
        if (s.type === 'rescue' && s.npcs.indexOf(id) >= 0) return !(c.m & (1 << s.npcs.indexOf(id)));
        return id === 'ivo' && c.lore === 15 && !c.ivo;
    }
    function visible(id) {
        const c = C();
        if (id === 'mira') return c.beacons >= 1;
        if (id === 'tov') return c.beacons >= 2;
        if (id === 'kesh') return c.beacons >= 3;
        if (id.indexOf('surv') === 0) { const i = IDX.survivors; return c.st === i && !(c.m & (1 << (+id.slice(4) - 1))); }
        if (id.indexOf('ally_') === 0) return c.banner === id.slice(5) && c.st >= IDX.veil;
        return undefined;
    }

    /* ---------------- interacting with the world ---------------- */
    function nearPt(p, fx, fy, x, y, r) { return api.dist(fx, fy, x, y) < (r || 40) || api.dist(p.x, p.y, x, y) < (r || 40) + 6; }
    function interact(p, fx, fy) {
        const Z = api.Z, c = C(), s = step(), t = T();
        if (s && s.zone === Z.id && (s.type === 'interact' || s.type === 'waves') && s.spots) {
            for (let i = 0; i < s.spots.length; i++) {
                if (c.m & (1 << i)) continue;
                if (!nearPt(p, fx, fy, s.spots[i][0] * TS, s.spots[i][1] * TS, 44)) continue;
                if (s.type === 'waves') { if (wave) { api.toast(api.txt(t.ui.c3waveLeft, { n: waveLeft() })); return true; } startWave(s, i); return true; }
                return doSpot(s, i);
            }
        }
        for (const o of Z.c3props || []) {
            if (!nearPt(p, fx, fy, o.cx, o.cy, 40)) continue;
            if (o.k === 'lore') { readLore(o.at.n); return true; }
            if (o.k === 'pyre') { api.say(lines(null, c.great ? 'c3pyreLit' : 'c3pyre')); return true; }
            if (o.k === 'boat') { api.talk('nessa'); return true; }
        }
        return false;
    }
    function waveLeft() { let n = 0; for (const f of api.FOES) if (f.on && f.tag === 'w') n++; return n; }
    function doSpot(s, i) {
        const c = C();
        c.m |= 1 << i; c.c++;
        api.SND.fx('pick'); api.ringFx(s.spots[i][0] * TS, s.spots[i][1] * TS, 40, '#7ef0a0');
        if (s.id === 'levers') { c.levers |= 1 << i; api.SND.fx('latch'); api.SND.fx('door'); }
        if (s.id === 'runes') { c.runes |= 1 << i; api.SND.fx('magic'); }
        if (s.id === 'plant') { c.seed = true; }
        if (s.id === 'light') { litScene(); return true; }
        const pg = eachPages(s, i);
        if (c.c >= s.n) complete(pg);
        else { api.save(); api.say(pg.length ? pg : [[null, objective(api.L), null]], null, () => api.toast(objective(api.L))); }
        return true;
    }
    function readLore(n) {
        const c = C();
        if (!(c.lore & (1 << n))) {
            c.lore |= 1 << n; api.addXp(80); api.SND.fx('magic'); api.save();
            let k = 0; for (let b = 0; b < 4; b++) if (c.lore & (1 << b)) k++;
            setTimeout(() => api.toast(k === 4 ? T().ui.c3loreAll : api.txt(T().ui.c3lore, { n: k, m: 4 })), 400);
            return api.say(lines(null, 'c3lore' + n).concat(lines(null, 'c3loreKeeper')));
        }
        api.say(lines(null, 'c3lore' + n));
    }
    function onKill(f) {
        const s = step(), c = C();
        if (s && s.type === 'kill' && s.zone === api.Z.id && s.foes.indexOf(f.t) >= 0) {
            c.c++; api.toast(objective(api.L));
            if (c.c >= s.n) complete(); else api.save();
        }
    }
    function bossDown(f) {
        const c = C(), s = step(), b = api.Z.def.boss;
        if (b && b.t === f.t) S()[b.flag] = true;
        if (BOSS_GIFT[f.t]) api.dropGear(f.x, f.y + 20, api.makeItem(BOSS_GIFT[f.t], 3));
        if (!s || s.type !== 'boss' || s.boss !== f.t) return api.save();
        if (f.t === 'rootbound') { c.root = true; complete(); }
        else if (f.t === 'colossus') complete(null, () => kingScene());
        else if (f.t === 'hollowking') {
            if (S().mounts.indexOf('charger') < 0) S().mounts.push('charger');
            complete(null, () => { api.toast(T().ui.c3gotMount); api.save(); setTimeout(() => api.travel('c3_dawn', 26.5, 13.6), 2400); });
        }
        else complete();
    }
    function questDone(q) {
        if (!q || !q.rep) return;
        const c = C(); c.rep[q.rep] = (c.rep[q.rep] || 0) + 1;
        const f = T().ui['c3f' + q.rep];
        setTimeout(() => api.toast(api.txt(T().ui.c3rep, { f, n: Math.min(2, c.rep[q.rep]) })), 3200);
        if (c.rep[q.rep] >= 2 && !c.gift[q.rep]) {
            c.gift[q.rep] = true; const it = api.makeItem(REP_GIFT[q.rep], 3); api.addToBag(it, true);
            setTimeout(() => api.toast(api.txt(T().ui.c3repGift, { f, item: api.itemLabel(it) })), 6200);
        }
        api.save();
    }

    /* ---------------- areas, gates, music, allies ---------------- */
    function tile(ch) {
        const o = C().open, z = api.Z.id;
        if (z === 'c3_dawn') return ch === 'g' ? (o.east ? '=' : 'g') : ch === 'q' ? (o.north ? '=' : 'q') : ch;
        if (z === 'c3_keep') return ch === 'g' ? (o.keep ? 'x' : 'g') : ch;
        if (z === 'c3_frost') return ch === 'g' ? (o.fort ? '=' : 'g') : ch === 'q' ? (o.breach ? '=' : 'q') : ch;
        if (z === 'c3_veil') return ch === 'q' ? (o.citadel ? 'x' : 'q') : ch;
        return ch;
    }
    function gateNote() {
        const z = api.Z.id, o = C().open, u = T().ui;
        if (z === 'c3_dawn') return [103, o.east ? '' : u.c3eastShut, 113, o.north ? '' : u.c3northShut];
        if (z === 'c3_keep') return [103, o.keep ? '' : u.c3innerShut, 0, ''];
        if (z === 'c3_frost') return [103, o.fort ? '' : u.c3fortShut, 113, o.breach ? '' : u.c3breachShut];
        if (z === 'c3_veil') return [0, '', 113, o.citadel ? '' : u.c3citadelShut];
        return null;
    }
    let noteT = 0;
    function onZone(id) {
        const s = step(), c = C();
        for (const f of api.FOES) f.tag = '';
        if (wave) {                                         // a wave left unfinished: the stone can be lit again
            const w = step(); if (w && w.type === 'waves') c[w.id === 'wards' ? 'wards' : 'anchors'] &= ~(1 << wave.i);
            wave = null;
        }
        // the boss only waits for you when the story has brought you to it
        if (api.boss && api.boss.on && !(s && s.type === 'boss' && s.boss === api.boss.t)) { api.boss.on = false; api.boss = null; }
        if (s && s.type === 'collect' && s.zone === id) spawnPicks();
        buff = '';
    }
    function arrive(id) {
        const c = C(), s = step();
        if (id === 'c3_dawn' && !c.seen.arrive) { c.seen.arrive = 1; api.save(); arrivalScene(); return; }
        if (s && s.type === 'reach' && s.zone === id) { complete(); return; }
        if ((id === 'c3_veil' || id === 'c3_citadel') && c.banner && c.st >= IDX.veil) { buff = c.banner; setTimeout(() => api.toast(T().ui['c3buff_' + c.banner]), 2600); }
        if (id === 'c3_dawn' && c.great && c.rise) { c.rise = false; api.save(); }
    }
    let buff = '';
    const MODS = { take: 1, deal: 1 };
    function mods() { MODS.take = buff === 'guard' ? 0.75 : 1; MODS.deal = buff === 'ash' ? 1.25 : 1; return MODS; }
    function update() {
        const c = C(), Z = api.Z, p = api.P[0];
        if (wave && (api.tick & 15) === 0) checkWave();
        if (buff === 'grove' && (api.tick % 180) === 0) for (const q of api.P) if (q.on && !q.down && q.hp < api.maxHp(q)) { q.hp = Math.min(api.maxHp(q), q.hp + Math.ceil(api.maxHp(q) * 0.06)); api.part(q.x, q.y - 20, 6, 0, 0, 1, 30, '#7ef0a0', 3, -0.02); }
        if (noteT > 0) noteT--;
        else if ((api.tick & 7) === 0) {
            const g = gateNote();
            if (g) for (let k = 0; k < 4; k += 2) if (g[k] && g[k + 1] && api.ahead(p, g[k])) { api.toast(g[k + 1]); noteT = 240; break; }
        }
        // a boss speaks the first time you come near it
        const b = api.boss, a = Z.def.arena, key = { rootbound: 'c3rootHi', veyr: 'c3veyrHi', colossus: 'c3colHi', hollowking: 'c3kingHi' };
        if (b && b.on && a && key[b.t] && !c.seen[b.t] && api.dist(p.x, p.y, a[0] * TS, a[1] * TS) < 8.5 * TS) {
            c.seen[b.t] = 1; api.save();
            const who = b.t === 'veyr' ? 'veyr' : b.t === 'hollowking' ? 'hollowking' : null;
            api.scene([{ cam: a, t: 60 }, { say: lines(who, key[b.t]) }, { t: 10 }]);
        }
    }

    /* ---------------- cut-scenes ---------------- */
    function arrivalScene() {
        api.scene([
            { cam: [22, 27], t: 70 }, { title: api.txt(T().ui.chapterN, { n: 3, name: T().ui.ch3Name }), t: 170 },
            { cam: [22, 12], t: 110 }, { cam: [22, 22], t: 50 },
            { say: lines('nessa', 'c3arrive') }
        ], () => announce());
    }
    function kingScene() {
        const Z = api.Z, a = Z.def.arena;
        Z.npcs.push({ id: 'kingshade', look: 'kingshade', x: a[0] * TS, y: (a[1] - 1.5) * TS, hx: a[0] * TS, hy: a[1] * TS, kind: 2, sy: a[1] * TS, walk: 0, fx: 0, fy: 1, bob: 0, roam: 0, tx: 0, ty: 0, wt: 0 });
        api.scene([
            { cam: a, t: 50, fx: 'flash', sound: 'blink' }, { say: lines('hollowking', 'c3kingScene') },
            { fn: () => { for (let i = Z.npcs.length - 1; i >= 0; i--) if (Z.npcs[i].id === 'kingshade') { api.burst(Z.npcs[i].x, Z.npcs[i].y - 20, 30, '#b07aff', 3); Z.npcs.splice(i, 1); } }, sound: 'blink', t: 50 }
        ], () => { api.toast(T().ui.c3shard); setTimeout(announce, 2600); });
    }
    function litScene() {
        const c = C(), t = T();
        api.scene([
            { cam: [25, 10], t: 40 },
            { fn: () => { c.great = true; c.beacons = 4; api.save(); api.music(); }, sound: 'level', fx: 'flash', t: 90 },
            { title: t.ui.ch3Name, t: 160 }
        ], () => {
            c.st = STEPS.length; c.c = 0; api.save();
            const ally = c.banner === 'grove' ? t.c3endGrove : c.banner === 'ash' ? t.c3endAsh : t.c3endGuard;
            const sc = score();
            api.slides(t.c3ending.map(s => api.txt(s, { ally })).concat([t.ui.c3theEnd + '\n' + api.txt(t.ui.score, { n: sc })]), () => { api.toPlay(); api.toast(t.ui.c3free); });
        });
    }

    /* ---------------- the guide arrow ---------------- */
    function npcAt(id) { for (const n of api.Z.npcs) if (n.id === id) { GT.x = n.x; GT.y = n.y; return true; } return false; }
    function target() {
        const c = C(), s = step(), Z = api.Z;
        if (!s) return false;
        if (s.zone !== Z.id) return api.hop(s.zone);
        if ((s.type === 'talk' || s.type === 'choice') && npcAt(s.npc)) return true;
        if (s.spots) {
            let best = -1, bd = 1e9;
            for (let i = 0; i < s.spots.length; i++) { if (c.m & (1 << i)) continue; const d = api.dist(s.spots[i][0] * TS, s.spots[i][1] * TS, api.P[0].x, api.P[0].y); if (d < bd) { bd = d; best = i; } }
            if (best >= 0 && !(s.type === 'waves' && wave)) { GT.x = s.spots[best][0] * TS; GT.y = s.spots[best][1] * TS; return true; }
        }
        if (s.type === 'rescue') { for (let i = 0; i < s.npcs.length; i++) if (!(c.m & (1 << i)) && npcAt(s.npcs[i])) return true; }
        if (s.type === 'kill' || (s.type === 'waves' && wave)) {
            let best = null, bd = 1e9;
            for (const f of api.FOES) if (f.on && (s.type === 'waves' ? f.tag === 'w' : s.foes.indexOf(f.t) >= 0)) { const d = api.dist(f.x, f.y, api.P[0].x, api.P[0].y); if (d < bd) { bd = d; best = f; } }
            if (best) { GT.x = best.x; GT.y = best.y; return true; }
        }
        if (s.type === 'boss' && api.boss && api.boss.on) { GT.x = api.boss.x; GT.y = api.boss.y; return true; }
        if (s.at) { GT.x = s.at[0] * TS; GT.y = s.at[1] * TS; return true; }
        return false;
    }
    function score() { const s = S(); return 3000 + s.kills * 10 + s.lvl * 100 + s.qdone * 200; }
    function zoneOpen(z) {
        const o = C().open;
        return z === 'c3_ashen' || z === 'c3_keep' ? !!o.east : z === 'c3_frost' ? !!o.north : z === 'c3_veil' ? !!o.breach : z === 'c3_citadel' ? !!o.citadel : true;
    }
    function npcExtra(id, x, y) {
        if (id === 'ysolde') { const c = api.ctx; c.globalAlpha = 0.35 + Math.sin(api.tick * 0.08) * 0.15; c.drawImage(api.glow('#9ad8ff'), x + 2, y - 36, 18, 18); c.globalAlpha = 1; }
    }
    function journal() {
        const q = quest(); if (!q) return null;
        const c = C();
        let done = 0; for (const e of STEPS) if (e.q === q && IDX[e.s.id] < c.st) done++;
        return { act: q.act, title: loc(q.title), story: loc(q.story), n: done, m: q.steps.length, all: QD.quests.map(x => [loc(x.title), STEPS.findIndex(e => e.q === x) < c.st, x === q]) };
    }

    return {
        id: 'ch3', home: 'c3_dawn', maps: MAPS, quests: QUESTS, pool: window.HM_C3_POOL || [], chests: {}, looks: LOOK, foes: FOES,
        get shop() { return shopOf === 'tov' ? SHOP_TOV : SHOP_BRANN; },
        talkers: { aldric: 1, ysolde: 1, fenna: 1, kragg: 1 }, noWolf: true, preload: false, solid: '^PkLcGRBq', hard: 1,
        parent: { c3_elder: 'c3_dawn', c3_ashen: 'c3_dawn', c3_keep: 'c3_ashen', c3_frost: 'c3_dawn', c3_veil: 'c3_frost', c3_citadel: 'c3_veil' },
        dust: { c3_dawn: '#b8a07a', c3_elder: '#6a8a5a', c3_ashen: '#8a8078', c3_keep: '#5a5660', c3_frost: '#e8f0f8', c3_veil: '#8a6aaa', c3_citadel: '#6a5a8a' },
        treasures: { c3_dawn: 1, c3_elder: 4, c3_ashen: 4, c3_frost: 4, c3_veil: 3 },
        beasts: ['thornstalker', 'grimwolf', 'riftwisp', 'stonebrute', 'hollowsoldier', 'ashenarcher', 'cryptbones', 'veilcultist', 'frostfang', 'yeti', 'riftborn', 'rootbound', 'veyr', 'colossus', 'hollowking'],
        songs: ['c3_dawn', 'c3_dawn_lit', 'c3_elder', 'c3_ashen', 'c3_keep', 'c3_frost', 'c3_veil', 'c3_citadel', 'c3_boss'], bossSong: 'c3_boss',
        songDefs: {
            c3_dawn:     { root: 174.6, scale: [0, 2, 3, 5, 7, 9, 10, 12], chords: [0, 3, 4, 3], rate: 3, beats: 64, pad: 'triangle', lead: 'flute', drums: 'soft', echo: 0.3, busy: 0.5, seed: 31 },
            c3_dawn_lit: { root: 196, scale: [0, 2, 4, 7, 9, 12, 14, 16], chords: [0, 3, 4, 5], rate: 3.4, beats: 64, pad: 'sine', lead: 'brass', drums: 'march', echo: 0.25, busy: 0.7, seed: 37 },
            c3_elder:    { root: 164.8, scale: [0, 2, 3, 7, 9, 12, 14, 15], chords: [0, 5, 3, 4], rate: 2.8, beats: 64, pad: 'sine', lead: 'bell', drums: 'soft', echo: 0.45, busy: 0.45, seed: 41 },
            c3_ashen:    { root: 138.6, scale: [0, 1, 3, 5, 7, 8, 10, 12], chords: [0, 5, 6, 4], rate: 4, beats: 64, pad: 'triangle', lead: 'brass', drums: 'tom', echo: 0.2, busy: 0.6, seed: 43 },
            c3_keep:     { root: 123.5, scale: [0, 1, 3, 6, 7, 8, 11, 12], chords: [0, 1, 0, 4], rate: 2.4, beats: 48, pad: 'sine', lead: 'bell', drums: 'none', echo: 0.5, busy: 0.35, arp: false, seed: 47 },
            c3_frost:    { root: 155.6, scale: [0, 2, 3, 7, 8, 12, 14, 15], chords: [0, 4, 5, 3], rate: 2.6, beats: 64, pad: 'sine', lead: 'flute', drums: 'soft', echo: 0.55, busy: 0.4, seed: 53 },
            c3_veil:     { root: 116.5, scale: [0, 1, 4, 6, 7, 10, 11, 13], chords: [0, 2, 5, 1], rate: 2.2, beats: 48, pad: 'sawtooth', lead: 'bell', drums: 'none', echo: 0.6, busy: 0.35, arp: false, seed: 59 },
            c3_citadel:  { root: 110, scale: [0, 1, 3, 6, 7, 8, 11, 12], chords: [0, 1, 6, 5], rate: 2.6, beats: 48, pad: 'sawtooth', lead: 'brass', drums: 'tom', echo: 0.4, busy: 0.45, seed: 61 },
            c3_boss:     { root: 116.5, scale: [0, 1, 3, 5, 6, 8, 10, 12], chords: [0, 1, 5, 4], rate: 6.5, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'war', echo: 0.1, busy: 0.9, seed: 67 }
        },
        start() {
            const s = S();
            if (s && !s.c3) s.c3 = { st: 0, c: 0, m: 0, beacons: 0, great: false, open: {}, banner: '', lore: 0, rep: {}, gift: {}, wards: 0, levers: 0, runes: 0, anchors: 0, root: false, seed: false, ivo: false, seen: {} };
        },
        stop() { wave = null; buff = ''; },
        build(Z, def) { ART.build(Z, def, api); },
        drawUnder(x, cx, cy, t) { ART.drawUnder(x, api.Z, cx, cy, t); },
        drawOver(x, cx, cy, t) { ART.drawOver(x, api.Z, cx, cy, t, api.glow); },
        objective, story, idle, extras, news, visible, tile, interact, onKill, bossDown, onZone, arrive, update, target, score, npcExtra, questDone, mods, pickup, journal, zoneOpen,
        whatNext() { return objective(api.L); },
        stageOf() { return C() ? C().st : 0; },
        music(zone, def) { return zone === 'c3_dawn' && C().beacons >= 2 ? 'c3_dawn_lit' : def.music; },
        lanternLit() { return !!C().great; },
        gems() { const c = C(); return (c.st > IDX.seed ? 1 : 0) | (c.st > IDX.veyr ? 2 : 0) | (c.st > IDX.colossus ? 4 : 0) | (c.great ? 8 : 0); },
        relics() { const c = C(), t = T(); return [[t.ui.c3seed, c.st > IDX.seed, 'b'], [t.ui.c3seal, c.st > IDX.veyr, 'r'], [t.ui.c3shard, c.st > IDX.colossus, 's']]; },
        forgeName() { return shopOf === 'tov' ? T().ui.c3quarter : T().ui.c3forge; }, storeName() { return T().ui.c3store; }
    };
};
