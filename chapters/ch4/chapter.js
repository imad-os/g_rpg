/* Hollowmere, Chapter 4: A Song of Ice & Fire.
 * Set in the world of Westeros and Essos (Game of Thrones / A Song of Ice and Fire).
 * Runs the 8 main quests from chapters/ch4/quests.json, side quests, rare hunts, 4 House allegiances,
 * 5-floor Ruins of Old Valyria dungeon, 10 new creature types, and 5 bosses culminating in The Night King. */
HM_CHAPTERS.def.ch4 = function (api) {
    'use strict';
    const TS = api.TS, GT = api.GT, ART = window.HM_C4_ART, MAPS = window.HM_C4_MAPS, HERO = api.HERO, QD = window.HM_C4_QUESTS || { quests: [] };
    const S = () => api.S, T = () => api.T, C = () => api.S.c4, lines = api.lines;
    const loc = o => o ? (o[api.L] || o.en || '') : '';

    /* ---------------- Main quests flattened into steps ---------------- */
    const STEPS = [];
    for (const q of QD.quests) for (const s of q.steps) STEPS.push({ q, s });
    const IDX = {}; STEPS.forEach((e, i) => { IDX[e.s.id] = i; });
    const step = () => { const e = STEPS[C().st]; return e ? e.s : null; };
    const quest = () => { const e = STEPS[C().st]; return e ? e.q : null; };
    function sayPages(b, whoOver) {
        if (!b) return [];
        const list = b[api.L] || b.en || [], who = whoOver !== undefined ? whoOver : (b.who === undefined ? null : b.who);
        return list.map(t => [who, t, null]);
    }
    function eachPages(s, i, who) { const l = s.each ? (s.each[api.L] || s.each.en) : null; return l && l[i] ? [[who === undefined ? null : who, l[i], null]] : []; }
    function objective(lang) {
        const c = C(); if (!c) return '';
        const t = api.TEXT[lang] || api.TEXT.en;
        const e = STEPS[c.st];
        if (!e) return t.ui.c4free;
        const s = e.s, g = s.goal[lang] || s.goal.en;
        return api.txt(g, { n: Math.min(s.n || 0, c.c), m: s.n || 0 });
    }
    function announce() { const o = objective(api.L); MyPC.announce(o); api.toast(o); }

    function apply(set) {
        if (!set) return;
        const c = C();
        if (set.beacons && c.beacons < set.beacons) {
            c.beacons = set.beacons;
            setTimeout(() => api.toast(api.txt(T().ui.c4beacon, { n: c.beacons })), 2600);
        }
        if (set.open) { c.open[set.open] = true; openNow(set.open); }
    }
    function openNow(g) {
        const z = api.Z.id;
        if (g === 'south' && z === 'c4_river') api.openTiles(103, 61, 'gate');
        else if (g === 'north' && z === 'c4_river') api.openTiles(113, 61, 'gate2');
        else if (g === 'storm' && z === 'c4_kings') api.openTiles(103, 61, 'gate');
        else if (g === 'wall' && z === 'c4_north') api.openTiles(113, 61, 'gate2');
        else if (g === 'beyond' && z === 'c4_wall') api.openTiles(103, 120, 'gate');
        else if (g === 'altar' && z === 'c4_beyond') api.openTiles(113, 105, 'gate2');
        else return;
        api.Z.ftx = -1; api.Z.fty = -1; if (api.GT) api.GT.ok = false;
        api.SND.fx('door'); api.SND.fx('slam'); api.shake = 10;
    }

    function complete(before, after) {
        const c = C(), e = STEPS[c.st]; if (!e) return;
        const s = e.s;
        apply(s.set);
        c.st++; c.c = 0; c.m = 0; wave = null;
        if (api.GT) api.GT.ok = false;
        api.SND.fx('quest'); api.save();
        const pg = (before || []).concat(s.type === 'talk' || s.type === 'choice' ? [] : sayPages(s.say));
        const next = () => { startStep(); if (after) after(); else if (C().st < STEPS.length) announce(); };
        if (pg.length) api.say(pg, null, next); else next();
    }

    function findSpawnPos(cx, cy) {
        if (!api.feetSolid || !api.feetSolid(cx, cy)) return [cx, cy];
        for (let r = 24; r <= 120; r += 24) {
            for (let k = 0; k < 8; k++) {
                const a = k * 0.785398, nx = cx + Math.cos(a) * r, ny = cy + Math.sin(a) * r;
                if (!api.feetSolid(nx, ny)) return [nx, ny];
            }
        }
        return [cx, cy];
    }

    function ensureQuestFoes() {
        const Z = api.Z;
        if (!Z || !Z.id || !api.FOES || !api.spawnFoe) return;
        const c = C(), s = step();
        if (s && s.type === 'kill' && s.zone === Z.id && s.foes && s.foes.length) {
            const need = Math.max(0, (s.n || 1) - (c.c || 0));
            let alive = 0;
            for (const f of api.FOES) if (f.on && s.foes.indexOf(f.t) >= 0) alive++;
            const defFoes = (Z.def && Z.def.foes) ? Z.def.foes.filter(df => s.foes.indexOf(df.t) >= 0) : [];
            let idx = 0;
            while (alive < need && idx < 24) {
                const ft = s.foes[idx % s.foes.length];
                let bx = s.at ? s.at[0] * TS : 24 * TS, by = s.at ? s.at[1] * TS : 18 * TS;
                if (defFoes.length) {
                    const df = defFoes[idx % defFoes.length];
                    bx = df.x * TS; by = df.y * TS;
                } else {
                    const ang = idx * 1.3;
                    bx += Math.cos(ang) * 48; by += Math.sin(ang) * 36;
                }
                const pos = findSpawnPos(bx, by);
                const nf = api.spawnFoe(ft, pos[0], pos[1], false);
                idx++;
                if (!nf) break;
                alive++;
            }
        }
        if (api.qState && QUESTS) {
            for (const q of QUESTS) {
                if (q.type === 'kill' && api.qState(q.id) === 1 && Z.def && Z.def.foes) {
                    const defFoes = Z.def.foes.filter(df => df.t === q.foe);
                    if (!defFoes.length) continue;
                    const rem = Math.max(0, (q.n || 1) - ((S().sqc && S().sqc[q.id]) || 0));
                    let alive = 0;
                    for (const f of api.FOES) if (f.on && f.t === q.foe) alive++;
                    let idx = 0;
                    while (alive < rem && idx < 16) {
                        const df = defFoes[idx % defFoes.length];
                        const pos = findSpawnPos(df.x * TS, df.y * TS);
                        const nf = api.spawnFoe(q.foe, pos[0], pos[1], false);
                        idx++;
                        if (!nf) break;
                        alive++;
                    }
                }
            }
        }
    }

    function startStep() {
        const s = step(); if (!s || !api.Z) return;
        const Z = api.Z;
        if (s.type === 'reach' && s.zone === Z.id) return complete();
        if (s.type === 'collect' && s.zone === Z.id) spawnPicks();
        if (s.type === 'kill' && s.zone === Z.id) ensureQuestFoes();
        if (s.type === 'boss' && s.zone === Z.id) wakeBoss();
    }

    function bossDef() {
        const s = step();
        if (s && s.type === 'boss' && s.zone === api.Z.id) {
            return { t: s.boss, x: s.at ? s.at[0] : 24, y: s.at ? s.at[1] : 6.5, flag: 'c4_' + s.boss };
        }
        const b = api.Z.def.boss;
        return b && !S()[b.flag] ? b : null;
    }
    function wakeBoss() {
        const b = bossDef(); if (!b) return;
        if (api.boss && api.boss.on && api.boss.t === b.t) return;
        const pos = findSpawnPos(b.x * TS, b.y * TS);
        api.boss = api.spawnFoe(b.t, pos[0], pos[1], false);
        if (api.boss) {
            api.boss.boss = true;
            if (!api.boss.d.boss || api.boss.d.bossHp) {
                api.boss.d = Object.assign({}, api.boss.d, {
                    boss: true,
                    hp: api.boss.d.bossHp || api.boss.d.hp,
                    dmg: api.boss.d.bossDmg || api.boss.d.dmg
                });
                const mul = (api.coopMul ? api.coopMul() : 1) * (api.TUNE ? api.TUNE.enemyDifficulty : 1);
                api.boss.max = api.boss.hp = Math.max(1, Math.round(api.boss.d.hp * mul));
                api.boss.active = false;
            }
            api.burst(api.boss.x, api.boss.y - 20, 30, '#6ae8ff', 3);
            api.ringFx(api.boss.x, api.boss.y, 90, '#6ae8ff');
        }
    }

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
        if (api.GT) api.GT.ok = false;
        api.toast(api.txt(T().ui.c4pickedUp, { name: loc(s.goal).split('(')[0].trim(), n: c.c, m: s.n }));
        if (c.c >= s.n) complete(); else api.save();
    }

    let wave = null;
    function startWave(s, i) {
        const c = C(), key = s.id === 'obelisks' ? 'anchors' : 'wards';
        c[key] |= 1 << i;
        wave = { i };
        const sx = s.spots[i][0] * TS, sy = s.spots[i][1] * TS;
        api.SND.fx('roar'); api.shake = 12; api.ringFx(sx, sy, 90, key === 'anchors' ? '#6ae8ff' : '#ff6a2a');
        const list = s.wave.slice(); if (s.last && c.c === s.n - 1) list.push(s.last);
        if (api.P[1].on || api.P[2].on) list.push(list[0]);
        list.forEach((t, k) => {
            const a = k * 6.2832 / list.length, x = sx + Math.cos(a) * 72, y = sy + Math.sin(a) * 52;
            const pos = findSpawnPos(x, y);
            const f = api.spawnFoe(t, pos[0], pos[1], false);
            if (f) { f.tag = 'w'; f.active = true; api.burst(f.x, f.y - 10, 12, '#6ae8ff', 2); }
        });
        if (api.GT) api.GT.ok = false;
        api.say(eachPages(s, i), null, () => api.toast(api.txt(T().ui.c4waveLeft, { n: list.length })));
    }
    function checkWave() {
        if (!wave) return;
        let left = 0; for (const f of api.FOES) if (f.on && f.tag === 'w') left++;
        if (left) return;
        const s = step(), c = C();
        if (!s || s.type !== 'waves') { wave = null; return; }
        c.m |= 1 << wave.i; c.c++; wave = null;
        if (api.GT) api.GT.ok = false;
        api.SND.fx('level'); api.toast(T().ui.c4waveDone);
        if (c.c >= s.n) complete(); else { api.save(); setTimeout(announce, 1800); }
    }

    /* ---------------- Characters of Westeros & Essos ---------------- */
    const LOOK = {
        robb:      { skin: '#e2b896', hair: '#7a3420', style: 0, tunic: '#4a5462', trim: '#c8d2dc', pants: '#2a3038', shoes: '#221c18', cape: '#343c46', beard: '#7a3420', s: 1.08, gear: { body: 'kingsguard_plate', feet: 'iron_greaves' } },
        catelyn:   { skin: '#ecc6a6', hair: '#8a3420', style: 1, tunic: '#2a4a7a', trim: '#c84a3a', pants: '#22324a', shoes: '#2a2018', cape: '#8a2a24' },
        arya:      { skin: '#e8c2a0', hair: '#3a2820', style: 4, tunic: '#4e5660', trim: '#9aa4b0', pants: '#2a3036', shoes: '#241c16', s: 0.86, gear: { feet: 'leather_boots' } },
        sansa:     { skin: '#f2ceb0', hair: '#b84628', style: 1, tunic: '#4a5e78', trim: '#d8b86a', pants: '#324052', shoes: '#2a2018', cape: '#344458' },
        jon:       { skin: '#e2b896', hair: '#161418', style: 1, tunic: '#1e2026', trim: '#545a64', pants: '#14161a', shoes: '#121014', cape: '#121418', beard: '#161418', s: 1.06, gear: { body: 'watch_cloak', feet: 'valyrian_greaves' } },
        samwell:   { skin: '#f0caa8', hair: '#3a281c', style: 2, tunic: '#1e2026', trim: '#444850', pants: '#16181c', shoes: '#141214', beard: '#3a281c', s: 1.12, gear: { body: 'watch_cloak' } },
        aemon:     { skin: '#ebd0b8', hair: '#e8e8f0', style: 2, tunic: '#4a4e54', trim: '#8a909a', pants: '#2a2c30', shoes: '#1e1c20', cape: '#34383e', gear: { body: 'mage_robe' } },
        tyrion:    { skin: '#e6be98', hair: '#d8a840', style: 0, tunic: '#9e1e22', trim: '#f2c14e', pants: '#3e1618', shoes: '#281a14', cape: '#6e1216', beard: '#c89634', s: 0.78 },
        varys:     { skin: '#f0ccb0', hair: '#f0ccb0', style: 2, tunic: '#6a4a7a', trim: '#d8b04a', pants: '#3a2a44', shoes: '#2a2018', cape: '#4e345c', gear: { body: 'mage_robe' } },
        jaime:     { skin: '#e8c09c', hair: '#e2b848', style: 0, tunic: '#9e1e22', trim: '#ffd25a', pants: '#3a2820', shoes: '#2a2018', cape: '#f0eee8', s: 1.08, gear: { body: 'kingsguard_plate', feet: 'valyrian_greaves' } },
        davos:     { skin: '#c89a76', hair: '#5a5c60', style: 2, tunic: '#4a4e42', trim: '#d4a024', pants: '#2a2c28', shoes: '#221c16', beard: '#6a6c70', cape: '#343830' },
        brienne:   { skin: '#ecc6a4', hair: '#e8c868', style: 0, tunic: '#2a5298', trim: '#f2c14e', pants: '#243452', shoes: '#2a221c', cape: '#1e3c72', s: 1.16, gear: { body: 'kingsguard_plate', feet: 'iron_greaves' } },
        melisandre:{ skin: '#f4d2b8', hair: '#a81c22', style: 1, tunic: '#b01820', trim: '#ff6a2a', pants: '#5a0e12', shoes: '#2a1012', cape: '#821016', gear: { body: 'mage_robe' } },
        daenerys:  { skin: '#f4d4bc', hair: '#f2eef8', style: 1, tunic: '#221e26', trim: '#d8222a', pants: '#18141c', shoes: '#1e181c', cape: '#9e1820', gear: { body: 'targaryen_scale' } },
        jorah:     { skin: '#d8a880', hair: '#8a6842', style: 0, tunic: '#b88e4a', trim: '#3a5a3a', pants: '#4a3e2e', shoes: '#2a2018', beard: '#8a6842', cape: '#3a4e3a', s: 1.08, gear: { body: 'chainmail' } },
        jaqen:     { skin: '#e2ba96', hair: '#8a2a24', style: 1, tunic: '#3a3c44', trim: '#e8e4dc', pants: '#22242a', shoes: '#1c1a20', cape: '#282a32', gear: { head: 'hood' } },
        mance:     { skin: '#d4a47e', hair: '#4a4440', style: 1, tunic: '#5a4434', trim: '#9e2424', pants: '#342820', shoes: '#241c16', cape: '#3e2c22', s: 1.08, gear: { body: 'watch_cloak' } },
        child:     { skin: '#a8c89a', hair: '#3e6a34', style: 4, tunic: '#4a6e38', trim: '#d85a3a', pants: '#2e4824', shoes: '#2a381e', s: 0.78 },
        gendry:    { skin: '#c89670', hair: '#18161a', style: 0, tunic: '#6a4830', trim: '#e0ad24', pants: '#342820', shoes: '#241c16', s: 1.12, gear: { body: 'padded_vest' } },
        qyburn:    { skin: '#e0ba98', hair: '#8a8c90', style: 2, tunic: '#3e3844', trim: '#50ff78', pants: '#26222a', shoes: '#1e1a20', gear: { body: 'mage_robe' } },
        salladhor: { skin: '#8d5836', hair: '#1e1816', style: 0, tunic: '#7a2868', trim: '#ffd24a', pants: '#341e38', shoes: '#24181c', cape: '#521846', beard: '#1e1816' },
        scout1:    { skin: '#e2b896', hair: '#5a3a20', style: 0, tunic: '#4e5660', trim: '#c8d2dc', pants: '#2a3038', shoes: '#221c18', gear: { head: 'stark_wolfhelm' } },
        scout2:    { skin: '#d4a47e', hair: '#2a2018', style: 0, tunic: '#4e5660', trim: '#c8d2dc', pants: '#2a3038', shoes: '#221c18', gear: { head: 'stark_wolfhelm' } },
        scout3:    { skin: '#ecc6a4', hair: '#7a4424', style: 1, tunic: '#4e5660', trim: '#c8d2dc', pants: '#2a3038', shoes: '#221c18', gear: { head: 'stark_wolfhelm' } },
        folk1:     { skin: '#e2b896', hair: '#6a4428', style: 0, tunic: '#5a6e4a', trim: '#d8c8a0', pants: '#3a342a', shoes: '#241c16' },
        folk2:     { skin: '#c89670', hair: '#221c20', style: 1, tunic: '#4a3868', trim: '#ffd24a', pants: '#282034', shoes: '#201824' },
        nkshade:   { skin: '#8ad8ff', hair: '#d8f4ff', style: 2, tunic: '#1e2c3e', trim: '#6ae8ff', pants: '#141e2c', shoes: '#101824', cape: '#162436', s: 1.32, gear: { body: 'kingsguard_plate' } }
    };
    LOOK.ally_stark = LOOK.robb;
    LOOK.ally_baratheon = LOOK.davos;
    LOOK.ally_lannister = LOOK.tyrion;
    LOOK.ally_targaryen = LOOK.daenerys;

    /* ---------------- Foes & Bosses ---------------- */
    const near = f => api.nearest(f.x, f.y);
    function towards(f, p) { const d = api.dist(p.x, p.y, f.x, f.y) || 1; f.vx = (p.x - f.x) / d; f.vy = (p.y - f.y) / d; }
    function oval(x, X, Y, rx, ry, col) { x.fillStyle = col; x.beginPath(); x.ellipse(X, Y, rx, ry, 0, 0, 6.2832); x.fill(); }
    function bar(x, f, X, Y) { if (f.hp >= f.max) return; x.fillStyle = '#000'; x.fillRect(X - 15, Y, 30, 4); x.fillStyle = '#ff5a5a'; x.fillRect(X - 14, Y + 1, 28 * Math.max(0, f.hp) / f.max, 2); }

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
        if (f.t === 'unicorn') {
            x.fillStyle = w ? '#fff' : '#f0e8d0';
            x.beginPath(); x.moveTo(22 * stretch, -24 + crouch); x.lineTo(35 * stretch, -32 + crouch); x.lineTo(25 * stretch, -20 + crouch); x.fill();
        } else {
            x.fillStyle = c[2]; for (let k = 0; k < 4; k++) { const sx = -8 + k * 5; x.beginPath(); x.moveTo(sx - 2, -21 + crouch); x.lineTo(sx, -27 + crouch); x.lineTo(sx + 2, -21 + crouch); x.fill(); }
        }
        x.fillStyle = c[3]; x.fillRect(17 * stretch, -22 + crouch, 2.5, 2.5);
        x.restore();
        bar(x, f, X, Y - 40);
    }

    function pounceUpd(f, p, d, tx, ty, rw, rh, range, chaseFar) {
        if (f.cd > 0) f.cd--;
        if (f.st === 0) {
            if (p && d < chaseFar) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh);
            if (p && d < range && f.cd <= 0) { f.st = 1; f.tm = 22; towards(f, p); }
        } else if (f.st === 1) { if (f.tm > 8 && p) towards(f, p); if (--f.tm <= 0) { f.st = 2; f.tm = 14; api.SND.fx('swing'); } }
        else if (f.st === 2) { if (api.moveEnt(f, f.vx * 5.6, f.vy * 5.6, rw, rh) || --f.tm <= 0) { f.st = 3; f.tm = 24; } }
        else if (--f.tm <= 0) { f.st = 0; f.cd = 65; }
    }

    function person(x, f, X, Y, w, look, gear, weapon, col, s) {
        const q = near(f), tx = q ? q.x - f.x : 1, ty = q ? q.y - f.y : 0, dir = Math.abs(ty) > Math.abs(tx) * 1.3 ? (ty < 0 ? 1 : 0) : 2, flip = tx < 0;
        const aim = f.st === 1, a = aim && f.vx !== undefined ? Math.atan2(f.vy, f.vx) : dir === 2 ? (flip ? -2.2 : -0.95) : -1.3;
        const hx = X + (dir === 2 ? (flip ? -3 : 3) * s : dir === 1 ? -9 * s : 9 * s), hy = Y - 14 * s;
        if (dir === 1) api.drawHeld(weapon, col, '#3a2a20', hx, hy, a, 0, aim ? 8 : 0, 0);
        HERO.draw(x, X, Y, look, gear, dir, flip, f.st === 0 ? f.walk * 1.6 : 0, f.st === 2 ? (flip ? -1 : 1) : 0, w, s);
        if (dir !== 1) api.drawHeld(weapon, col, '#3a2a20', hx, hy, a, 0, aim ? 8 : 0, 0);
        return { dir, flip };
    }

    const WIGHT_LOOK = { skin: '#8ea4b0', hair: '#2a3038', style: 2, tunic: '#2e343c', trim: '#54606c', pants: '#1e242a', shoes: '#161a20' };
    const WALKER_LOOK = { skin: '#b4e4ff', hair: '#e8f8ff', style: 1, tunic: '#24384e', trim: '#7ce8ff', pants: '#182636', shoes: '#121c28', cape: '#1a2c40' };
    const CHILD_LOOK = { skin: '#94ba88', hair: '#2e5828', style: 4, tunic: '#38582c', trim: '#d84a3a', pants: '#24381c', shoes: '#1e2e18' };
    const SHADOW_LOOK = { skin: '#181422', hair: '#100c18', style: 1, tunic: '#14101c', trim: '#8a3aff', pants: '#0e0a14', shoes: '#0a0810', cape: '#1c1428' };

    function wightDraw(x, f, X, Y, w) {
        person(x, f, X, Y, w, WIGHT_LOOK, { head: '', body: 'padded_vest', feet: '' }, 'axes', '#7a8896', 1.0);
        if (!w) { x.fillStyle = '#4ad8ff'; x.fillRect(X - 3, Y - 32, 2, 2); x.fillRect(X + 1, Y - 32, 2, 2); }
        bar(x, f, X, Y - 50);
    }

    function walkerDraw(x, f, X, Y, w) {
        x.globalAlpha = 0.32; x.drawImage(api.glow('#6ae8ff'), X - 24, Y - 54, 48, 48); x.globalAlpha = 1;
        person(x, f, X, Y, w, WALKER_LOOK, { head: '', body: 'kingsguard_plate', feet: 'valyrian_greaves' }, 'sword', '#9ef0ff', 1.14);
        if (!w) { x.fillStyle = '#4ae8ff'; x.fillRect(X - 3, Y - 35, 2, 2); x.fillRect(X + 1, Y - 35, 2, 2); }
        bar(x, f, X, Y - 56);
    }
    function walkerUpd(f, p, d, tx, ty, rw, rh) {
        if (f.cd > 0) f.cd--;
        if (!p) return;
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (d < 210 && f.cd <= 0) {
            f.cd = 105; f.st = 2; f.tm = 18;
            for (let k = -1; k <= 1; k++) {
                const a = Math.atan2(ty, tx) + k * 0.22;
                api.shot(f.x, f.y - 20, Math.cos(a) * 3.4, Math.sin(a) * 3.4, f.d.dmg + f.bonus, 6, 1, 0);
            }
            api.SND.fx('magic');
        }
        if (f.st === 2 && --f.tm <= 0) f.st = 0;
    }

    function spiderDraw(x, f, X, Y, w) {
        oval(x, X, Y, 15, 5, 'rgba(0,0,0,0.3)');
        const l = Math.sin(f.walk * 3) * 3;
        x.strokeStyle = w ? '#fff' : '#b8d8ec'; x.lineWidth = 2.5;
        for (let k = -2; k <= 2; k++) if (k !== 0) {
            x.beginPath(); x.moveTo(X, Y - 10); x.lineTo(X + k * 7, Y - 16 + (k & 1 ? l : -l)); x.lineTo(X + k * 11, Y - 2 + (k & 1 ? -l : l)); x.stroke();
        }
        oval(x, X, Y - 12, 10, 8, w ? '#fff' : '#d8ecfa');
        oval(x, X, Y - 8, 7, 5, w ? '#fff' : '#eef8ff');
        x.fillStyle = '#4ad8ff'; x.fillRect(X - 4, Y - 8, 2, 2); x.fillRect(X + 2, Y - 8, 2, 2);
        bar(x, f, X, Y - 30);
    }
    function spiderUpd(f, p, d, tx, ty, rw, rh) {
        if (f.cd > 0) f.cd--;
        if (!p) return;
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (d < 200 && f.cd <= 0) {
            f.cd = 95;
            api.shot(f.x, f.y - 10, tx * 3.5, ty * 3.5, f.d.dmg + f.bonus, 6, 1, 0);
            api.SND.fx('shoot');
        }
    }

    function wyrmDraw(x, f, X, Y, w, big) {
        const s = big ? 1.75 : 1, t = api.tick, sw = Math.sin(t * 0.12 + f.x) * 4 * s;
        oval(x, X, Y, 18 * s, 6 * s, 'rgba(0,0,0,0.38)');
        x.globalAlpha = 0.35; x.drawImage(api.glow('#ff6a2a'), X - 28 * s, Y - 46 * s, 56 * s, 56 * s); x.globalAlpha = 1;
        for (let k = 0; k < 4; k++) {
            oval(x, X + Math.sin(k + t * 0.1) * 4 * s, Y - (8 + k * 8) * s, (12 - k * 1.4) * s, 7 * s, w ? '#fff' : (k & 1 ? '#8a2218' : '#b83220'));
        }
        oval(x, X + sw * 0.4, Y - 38 * s, 11 * s, 8 * s, w ? '#fff' : '#c83a22');
        x.fillStyle = '#ffd24a'; x.fillRect(X - 5 * s, Y - 40 * s, 3 * s, 3 * s); x.fillRect(X + 2 * s, Y - 40 * s, 3 * s, 3 * s);
        if (!big) bar(x, f, X, Y - 52 * s);
    }
    function wyrmUpd(f, p, d, tx, ty, rw, rh) {
        if (f.cd > 0) f.cd--;
        if (!p) return;
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (d < 220 && f.cd <= 0) {
            f.cd = 100;
            api.shot(f.x, f.y - 24, tx * 3.4, ty * 3.4, f.d.dmg + f.bonus, 7, 8, 0);
            api.SND.fx('shoot');
        }
    }

    function krakenDraw(x, f, X, Y, w) {
        const t = api.tick;
        oval(x, X, Y, 18, 6, 'rgba(20,60,90,0.45)');
        x.strokeStyle = w ? '#fff' : '#2a687a'; x.lineWidth = 3.5;
        for (let k = -2; k <= 2; k++) {
            const wv = Math.sin(t * 0.1 + k) * 5;
            x.beginPath(); x.moveTo(X + k * 5, Y - 6); x.quadraticCurveTo(X + k * 9 + wv, Y - 18, X + k * 7 - wv, Y - 28); x.stroke();
        }
        oval(x, X, Y - 14, 13, 10, w ? '#fff' : '#1e5062');
        x.fillStyle = '#ffd24a'; x.fillRect(X - 5, Y - 14, 3, 3); x.fillRect(X + 2, Y - 14, 3, 3);
        bar(x, f, X, Y - 36);
    }

    function giantDraw(x, f, X, Y, w) {
        const s = 1.48;
        oval(x, X, Y, 22, 7, 'rgba(0,0,0,0.38)');
        person(x, f, X, Y, w, { skin: '#b89478', hair: '#4a382c', style: 2, tunic: '#5a4636', trim: '#8a725a', pants: '#3a2e24', shoes: '#261e18', beard: '#4a382c' }, { head: '', body: 'watch_cloak', feet: '' }, 'hammer', '#6a523c', s);
        bar(x, f, X, Y - 68);
    }
    function giantUpd(f, p, d, tx, ty, rw, rh) {
        if (f.cd > 0) f.cd--;
        if (f.st === 0) {
            if (p && d < 250) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh);
            if (p && d < 90 && f.cd <= 0) {
                f.st = 1; f.tm = 36;
                api.hazard(f.x + tx * 22, f.y + ty * 16, 68, 36, Math.round((f.d.dmg + f.bonus) * 1.35), 0, '#9ad8ff');
            }
        } else if (f.st === 1) {
            if (--f.tm <= 0) { f.st = 2; f.tm = 30; api.SND.fx('slam'); api.shake = Math.max(api.shake, 9); }
        } else if (--f.tm <= 0) { f.st = 0; f.cd = 85; }
    }

    function childFoeDraw(x, f, X, Y, w) {
        x.globalAlpha = 0.28; x.drawImage(api.glow('#5ae0a0'), X - 20, Y - 46, 40, 40); x.globalAlpha = 1;
        person(x, f, X, Y, w, CHILD_LOOK, { head: '', body: '', feet: '' }, 'staff', '#5ae0a0', 0.85);
        bar(x, f, X, Y - 44);
    }
    function childFoeUpd(f, p, d, tx, ty, rw, rh) {
        if (f.cd > 0) f.cd--;
        if (!p) return;
        if (d < 110) api.chase(f, -tx, -ty, f.d.spd, rw, rh);
        else if (d > 190) api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (f.cd <= 0 && d < 260) {
            f.cd = 115;
            for (let k = -1; k <= 1; k += 2) api.shot(f.x, f.y - 18, (tx + ty * k * 0.35) * 2.8, (ty - tx * k * 0.35) * 2.8, f.d.dmg + f.bonus, 6, 6, 0);
            api.SND.fx('zap');
        }
    }

    /* ---------------- Boss 1: The Shadow Assassin (Dragonstone) ---------------- */
    function shadowDraw(x, f, X, Y, w) {
        x.globalAlpha = 0.45; x.drawImage(api.glow('#8a3aff'), X - 28, Y - 58, 56, 56); x.globalAlpha = 1;
        person(x, f, X, Y, w, SHADOW_LOOK, { head: 'hood', body: '', feet: '' }, 'sword', '#2a143a', f.boss ? 1.28 : 1.05);
        if (!f.boss) bar(x, f, X, Y - 52);
    }
    function shadowBossUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + f.bonus;
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (++f.tm > 75) {
            f.tm = 0; f.pt = (f.pt + 1) % 3;
            if (f.pt === 0) {
                // Shadow step behind hero
                api.burst(f.x, f.y - 20, 18, '#8a3aff', 2.5);
                f.x = p.x - p.ax * 48; f.y = p.y - p.ay * 48;
                api.burst(f.x, f.y - 20, 18, '#8a3aff', 2.5);
                api.SND.fx('blink');
                api.hazard(p.x, p.y, 48, 30, dmg, 0, '#8a3aff');
            } else if (f.pt === 1) {
                // Fan of dark daggers
                const a = Math.atan2(ty, tx);
                for (let k = -2; k <= 2; k++) api.shot(f.x, f.y - 22, Math.cos(a + k * 0.22) * 3.6, Math.sin(a + k * 0.22) * 3.6, dmg - 4, 6, 6, 0);
                api.SND.fx('swing');
            } else {
                // Summon shadow clone
                if (api.minions() < 3) {
                    const m = api.spawnFoe('shadow', f.x + 50, f.y + 30, true);
                    if (m) api.burst(m.x, m.y - 16, 14, '#8a3aff', 2);
                }
            }
        }
    }

    /* ---------------- Boss 2: The Elder Firewyrm (Essos) ---------------- */
    function elderWyrmUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + f.bonus;
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (++f.tm > 70) {
            f.tm = 0; f.pt = (f.pt + 1) % 3;
            if (f.pt === 0) {
                for (let k = 0; k < 8; k++) {
                    const a = k * 0.7854 + api.tick * 0.03;
                    api.shot(f.x, f.y - 36, Math.cos(a) * 2.6, Math.sin(a) * 2.6, dmg - 4, 7, 8, 0);
                }
                api.SND.fx('shoot');
            } else if (f.pt === 1) {
                api.toast(T().ui.c4wyrmMagma);
                for (let k = 1; k <= 4; k++) api.hazard(f.x + tx * k * 42, f.y + ty * k * 32, 38, 36, dmg, 0, '#ff6a2a');
                api.SND.fx('slam'); api.shake = 9;
            } else if (api.minions() < 3) {
                const m = api.spawnFoe('firewyrm', f.x - 50, f.y + 30, true);
                if (m) api.burst(m.x, m.y - 14, 14, '#ff6a2a', 2);
            }
        }
    }

    /* ---------------- Boss 3: Undead Viserion (Ice Dragon Beyond the Wall) ---------------- */
    function viserionDraw(x, f, X, Y, w) {
        const t = api.tick, flap = Math.sin(t * 0.16) * 14, hover = Math.sin(t * 0.08) * 5;
        oval(x, X, Y, 34, 10, 'rgba(0,0,0,0.42)');
        x.globalAlpha = 0.45; x.drawImage(api.glow('#4ae8ff'), X - 56, Y - 96 + hover, 112, 96); x.globalAlpha = 1;
        // Tattered undead dragon wings
        x.fillStyle = w ? '#fff' : '#2a4258';
        x.beginPath(); x.moveTo(X - 10, Y - 42 + hover); x.lineTo(X - 58, Y - 68 + flap + hover); x.lineTo(X - 44, Y - 24 + hover); x.closePath(); x.fill();
        x.beginPath(); x.moveTo(X + 10, Y - 42 + hover); x.lineTo(X + 58, Y - 68 + flap + hover); x.lineTo(X + 44, Y - 24 + hover); x.closePath(); x.fill();
        // Scaled body & neck
        oval(x, X, Y - 38 + hover, 22, 16, w ? '#fff' : '#3a5874');
        oval(x, X, Y - 58 + hover, 13, 11, w ? '#fff' : '#4e7294');
        // Glowing blue ice eyes & jaws
        x.fillStyle = '#6ae8ff';
        x.fillRect(X - 6, Y - 60 + hover, 3.5, 3.5); x.fillRect(X + 2.5, Y - 60 + hover, 3.5, 3.5);
    }
    function viserionUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + f.bonus;
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (++f.tm > 68) {
            f.tm = 0; f.pt = (f.pt + 1) % 3;
            if (f.pt === 0) {
                api.toast(T().ui.c4visBreath);
                const a = Math.atan2(ty, tx);
                for (let k = -2; k <= 2; k++) api.shot(f.x, f.y - 44, Math.cos(a + k * 0.16) * 3.8, Math.sin(a + k * 0.16) * 3.8, dmg, 7, 1, 0);
                api.SND.fx('roar');
            } else if (f.pt === 1) {
                for (let k = 0; k < 3; k++) api.hazard(p.x + (k - 1) * 44, p.y, 42, 42, dmg, 0, '#6ae8ff');
                api.SND.fx('slam'); api.shake = 10;
            } else if (api.minions() < 3) {
                api.spawnFoe('wight', f.x + 54, f.y + 24, true);
            }
        }
    }

    /* ---------------- Boss 4: The Night King (Heart of Winter) ---------------- */
    function nightKingDraw(x, f, X, Y, w) {
        const t = api.tick;
        oval(x, X, Y, 24, 8, 'rgba(0,0,0,0.45)');
        x.globalAlpha = 0.5 + Math.sin(t * 0.08) * 0.15; x.drawImage(api.glow('#4ae8ff'), X - 48, Y - 84, 96, 96); x.globalAlpha = 1;
        if (f.invul) {
            x.strokeStyle = '#7ce8ff'; x.lineWidth = 3;
            x.beginPath(); x.arc(X, Y - 28, 34 + Math.sin(t * 0.12) * 3, 0, 6.2832); x.stroke();
        }
        person(x, f, X, Y, w, LOOK.nkshade, { head: '', body: 'kingsguard_plate', feet: 'valyrian_greaves' }, 'sword', '#8af4ff', 1.32);
        // Crown of Ice Horns
        x.fillStyle = w ? '#fff' : '#b8f4ff';
        for (let k = -2; k <= 2; k++) {
            x.beginPath(); x.moveTo(X + k * 3.5 - 1.5, Y - 48); x.lineTo(X + k * 4, Y - 57 - (2 - Math.abs(k)) * 2); x.lineTo(X + k * 3.5 + 1.5, Y - 48); x.fill();
        }
        if (!w) { x.fillStyle = '#00e8ff'; x.fillRect(X - 4, Y - 41, 2.5, 2.5); x.fillRect(X + 1.5, Y - 41, 2.5, 2.5); }
    }
    function nightKingUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + f.bonus;
        const ph = f.hp < f.max * 0.35 ? 3 : f.hp < f.max * 0.7 ? 2 : 1;
        if (ph !== (f.ph || 1)) {
            f.ph = ph; api.SND.fx('roar'); api.shake = 12;
            if (ph === 2 && !f.shDone) {
                f.shDone = true; f.invul = true;
                api.toast(T().ui.c4nkBlizzard);
                for (const [sx, sy] of [[18, 4.5], [30, 4.5], [24, 2.5]]) {
                    const sh = api.spawnFoe('iceshard', sx * TS, sy * TS, true);
                    if (sh) sh.tag = 'nksh';
                }
            }
        }
        if (f.invul) {
            let left = 0; for (const o of api.FOES) if (o.on && o.tag === 'nksh') left++;
            if (!left) { f.invul = false; api.toast(T().ui.c4nkWeak); api.ringFx(f.x, f.y - 20, 100, '#6ae8ff'); }
        }
        api.chase(f, tx, ty, f.d.spd * (ph === 3 ? 1.3 : 1), rw, rh);
        if (++f.tm > (ph === 3 ? 52 : 68)) {
            f.tm = 0; f.pt = (f.pt + 1) % 3;
            if (f.pt === 0) {
                // Ice Spear volley
                const a = Math.atan2(ty, tx);
                for (let k = -2; k <= 2; k++) api.shot(f.x, f.y - 28, Math.cos(a + k * 0.18) * 4.0, Math.sin(a + k * 0.18) * 4.0, dmg, 7, 1, 0);
                api.SND.fx('magic');
            } else if (f.pt === 1) {
                // Frost eruption line
                for (let k = 1; k <= 5; k++) api.hazard(f.x + tx * k * 38, f.y + ty * k * 28, 36, 36, dmg, 0, '#6ae8ff');
                api.SND.fx('slam');
            } else if (api.minions() < 4) {
                api.toast(T().ui.c4nkRaise);
                for (let k = -1; k <= 1; k += 2) {
                    const m = api.spawnFoe('wight', f.x + k * 55, f.y + 30, true);
                    if (m) api.burst(m.x, m.y - 12, 14, '#6ae8ff', 2);
                }
            }
        }
    }

    function shardDraw(x, f, X, Y, w) {
        x.globalAlpha = 0.5; x.drawImage(api.glow('#6ae8ff'), X - 24, Y - 44, 48, 48); x.globalAlpha = 1;
        x.fillStyle = w ? '#fff' : '#8ae8ff';
        x.beginPath(); x.moveTo(X, Y - 42); x.lineTo(X + 12, Y - 18); x.lineTo(X, Y); x.lineTo(X - 12, Y - 18); x.closePath(); x.fill();
        bar(x, f, X, Y - 48);
    }

    /* ---------------- Boss 5: The Valyrian Dragonlord (Hall of the Fourteen Flames, c4_val5) ---------------- */
    function valyrianLordDraw(x, f, X, Y, w) {
        const t = api.tick;
        oval(x, X, Y, 30, 9, 'rgba(0,0,0,0.45)');
        x.globalAlpha = 0.45 + Math.sin(t * 0.08) * 0.12; x.drawImage(api.glow('#ff6a2a'), X - 54, Y - 96, 108, 96); x.globalAlpha = 1;
        person(x, f, X, Y, w, { skin: '#f4d4bc', hair: '#f2eef8', style: 1, tunic: '#221418', trim: '#ffd24a', pants: '#180e12', shoes: '#140a0e', cape: '#b81e24' }, { head: 'knight_helm', body: 'targaryen_scale', feet: 'valyrian_greaves' }, 'axes', '#ff7a2a', 1.42);
    }
    function valyrianLordUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + f.bonus;
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (++f.tm > 62) {
            f.tm = 0; f.pt = (f.pt + 1) % 3;
            if (f.pt === 0) {
                for (let k = 0; k < 8; k++) { const a = k * 0.7854 + api.tick * 0.04; api.shot(f.x, f.y - 32, Math.cos(a) * 2.8, Math.sin(a) * 2.8, dmg - 4, 7, 8, 0); }
                api.SND.fx('shoot');
            } else if (f.pt === 1) {
                for (let k = 1; k <= 5; k++) api.hazard(f.x + tx * k * 36, f.y + ty * k * 28, 36, 36, dmg, 0, '#ff6a2a');
                api.SND.fx('slam'); api.shake = 10;
            } else if (api.minions() < 3) {
                api.spawnFoe('firewyrm', f.x + 50, f.y + 24, true);
            }
        }
    }

    const FOES = {
        wight:        { hp: 120, dmg: 18, spd: 1.25, r: 11, xp: 34, gold: 18, c: '#6ae8ff', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 260) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: wightDraw },
        whitewalker:  { hp: 220, dmg: 26, spd: 1.15, r: 13, xp: 58, gold: 32, c: '#7ce8ff', upd: walkerUpd, draw: walkerDraw },
        direwolf:     { hp: 145, dmg: 21, spd: 1.48, r: 13, xp: 38, gold: 20, c: '#9aa4b0', upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 125, 290), draw: (x, f, X, Y, w) => quad(x, f, X, Y, w, ['#7a8490', '#4e5660', '#c8d2dc', '#ffd24a']) },
        children:     { hp: 135, dmg: 22, spd: 1.2,  r: 11, xp: 40, gold: 24, c: '#5ae0a0', upd: childFoeUpd, draw: childFoeDraw },
        shadow:       { hp: 165, dmg: 24, spd: 1.35, r: 12, xp: 46, gold: 28, c: '#8a3aff', bossHp: 1450, bossDmg: 28, upd: (f, p, d, tx, ty, rw, rh) => f.boss ? shadowBossUpd(f, p, d, tx, ty, rw, rh) : pounceUpd(f, p, d, tx, ty, rw, rh, 120, 280), draw: shadowDraw },
        giant:        { hp: 290, dmg: 32, spd: 0.85, r: 18, xp: 68, gold: 40, c: '#b89478', kb: 0.15, upd: giantUpd, draw: giantDraw },
        icespider:    { hp: 130, dmg: 20, spd: 1.52, r: 12, xp: 36, gold: 20, c: '#b8ecff', upd: spiderUpd, draw: spiderDraw },
        firewyrm:     { hp: 175, dmg: 25, spd: 1.2,  r: 13, xp: 45, gold: 28, c: '#ff6a2a', upd: wyrmUpd, draw: (x, f, X, Y, w) => wyrmDraw(x, f, X, Y, w, false) },
        kraken:       { hp: 185, dmg: 24, spd: 1.05, r: 15, xp: 44, gold: 26, c: '#2a889a', upd: wyrmUpd, draw: krakenDraw },
        unicorn:      { hp: 170, dmg: 25, spd: 1.45, r: 14, xp: 42, gold: 24, c: '#d8d2c0', upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 140, 300), draw: (x, f, X, Y, w) => quad(x, f, X, Y, w, ['#6e6860', '#423e38', '#e8e0d0', '#ff5a3a']) },
        iceshard:     { hp: 110, dmg: 0,  spd: 0,    r: 14, xp: 15, gold: 0,  c: '#7ce8ff', kb: 0, upd: () => {}, draw: shardDraw },
        elderwyrm:    { hp: 1850, dmg: 32, spd: 1.1, r: 22, xp: 380, gold: 260, c: '#ff6a2a', boss: true, kb: 0.1, upd: elderWyrmUpd, draw: (x, f, X, Y, w) => wyrmDraw(x, f, X, Y, w, true) },
        viserion:     { hp: 2300, dmg: 36, spd: 1.22, r: 24, xp: 480, gold: 320, c: '#4ae8ff', boss: true, kb: 0.1, upd: viserionUpd, draw: viserionDraw },
        nightking:    { hp: 2900, dmg: 40, spd: 1.2, r: 18, xp: 700, gold: 500, c: '#4ae8ff', boss: true, kb: 0.12, upd: nightKingUpd, draw: nightKingDraw },
        valyrianlord: { hp: 3200, dmg: 42, spd: 1.2, r: 20, xp: 650, gold: 450, c: '#ff6a2a', boss: true, kb: 0.1, upd: valyrianLordUpd, draw: valyrianLordDraw }
    };

    const QUESTS = [
        { id: 'c4_wolves',  giver: 'robb',     stage: 2,  type: 'kill', foe: 'direwolf',  n: 5, gold: 240, xp: 260, gift: 'ironwood_axes',     rep: 'stark',     reward: { coins: 240, item: 'ironwood_axes' } },
        { id: 'c4_krakens', giver: 'davos',    stage: 6,  type: 'kill', foe: 'kraken',    n: 4, gold: 260, xp: 280, gift: 'weirwood_bow',      rep: 'baratheon', reward: { coins: 260, item: 'weirwood_bow' } },
        { id: 'c4_wyrms',   giver: 'jorah',    stage: 15, type: 'kill', foe: 'firewyrm',  n: 5, gold: 300, xp: 320, gift: 'braavosi_pistols',  rep: 'targaryen', reward: { coins: 300, item: 'braavosi_pistols' } },
        { id: 'c4_wights',  giver: 'jon',      stage: 19, type: 'kill', foe: 'wight',     n: 8, gold: 320, xp: 350, gift: 'watch_cloak',       rep: 'stark',     reward: { coins: 320, item: 'watch_cloak' } },
        { id: 'c4_spiders', giver: 'samwell',  stage: 20, type: 'kill', foe: 'icespider', n: 5, gold: 340, xp: 360, gift: 'baratheon_hammer',  rep: 'baratheon', reward: { coins: 340, item: 'baratheon_hammer' } },
        { id: 'c4_giants',  giver: 'mance',    stage: 23, type: 'kill', foe: 'giant',     n: 3, gold: 380, xp: 400, gift: 'dornish_boots',     rep: 'targaryen', reward: { coins: 380, item: 'dornish_boots' } }
    ];
    const REP_GIFT = { stark: 'stark_wolfhelm', baratheon: 'baratheon_hammer', lannister: 'golden_pistols', targaryen: 'targaryen_scale' };
    const BOSS_GIFT = { shadow: 'dragonglass_staff', elderwyrm: 'dothraki_axes', viserion: 'dragonbone_bow', nightking: 'stormbreaker' };
    const SHOP_GENDRY = ['castle_longsword', 'ironwood_axes', 'twin_flintlocks', 'baratheon_hammer', 'weirwood_bow', 'scorpion_crossbow', 'dragonglass_staff', 'stark_wolfhelm', 'kingsguard_plate', 'dornish_boots'];
    const SHOP_JORAH  = ['valyrian_blade', 'dothraki_axes', 'valyrian_axes', 'braavosi_pistols', 'golden_pistols', 'dragonbone_bow', 'wildfire_arquebus', 'rhllor_scepter', 'targaryen_scale', 'watch_cloak', 'valyrian_greaves'];
    let shopOf = 'gendry';

    function valyrianHoard(f) {
        const c = C(), first = !c.valyrian;
        const POOL = ['winters_fang', 'stormbreaker', 'valyrian_axes', 'golden_pistols', 'valyrian_blade', 'dragonbone_bow', 'rhllor_scepter'];
        c.valyrian = (c.valyrian || 0) + 1;
        const list = first ? ['winters_fang', 'stormbreaker', 'valyrian_axes', 'golden_pistols'] : [POOL[(Math.random() * POOL.length) | 0]];
        list.forEach((id, i) => { api.dropGear(f.x + (i - (list.length - 1) / 2) * 28, f.y + 24, api.makeItem(id, 4)); });
        api.coins(f.x, f.y, api.loot(450)); api.addXp(550);
        setTimeout(() => api.toast(first ? T().ui.c4valFirst : T().ui.c4valAgain), 1400);
        api.save();
    }

    /* ---------------- Dialogue & Interactions ---------------- */
    function story(id) {
        const c = C(), s = step(), t = T();
        if (s && (s.type === 'talk' || s.type === 'choice') && s.npc === id && s.zone === api.Z.id) {
            if (s.type === 'talk') { complete(sayPages(s.say, id)); return true; }
            const picks = s.picks.map(pk => ({
                label: loc(pk.label),
                fn: () => {
                    api.closeDlg(); c.banner = pk.id;
                    const giftId = REP_GIFT[pk.id];
                    if (giftId) api.addToBag(api.makeItem(giftId, 3), true);
                    complete(sayPages(pk, pk.who));
                }
            }));
            api.say(sayPages(s.say, id), picks);
            return true;
        }
        if (s && s.type === 'rescue' && s.npcs.indexOf(id) >= 0 && s.zone === api.Z.id) {
            const i = s.npcs.indexOf(id);
            if (c.m & (1 << i)) return lines(id, 'c4scoutIdle');
            c.m |= 1 << i; c.c++; api.SND.fx('quest');
            const pg = eachPages(s, i, id);
            for (const n of api.Z.npcs) if (n.id === id) api.burst(n.x, n.y - 10, 16, '#ffe9a8', 2);
            if (c.c >= s.n) complete(pg); else { api.save(); api.say(pg, null, () => api.toast(objective(api.L))); }
            return true;
        }
        if (id === 'aemon' && c.lore === 15 && !c.aemon) {
            c.aemon = true; api.addToBag(api.makeItem('winters_fang', 3), true); api.SND.fx('level'); api.save();
            setTimeout(() => api.toast(t.ui.c4giftLore), 2600);
            return lines('aemon', 'c4aemonDone');
        }
        return null;
    }

    function idle(id) {
        const c = C(), lit = c.great;
        const key = {
            robb: 'c4robbIdle', catelyn: 'c4catelynIdle', arya: 'c4aryaIdle', sansa: 'c4sansaIdle',
            tyrion: 'c4tyrionIdle', varys: 'c4varysIdle', jaime: 'c4jaimeIdle',
            davos: 'c4davosIdle', brienne: 'c4brienneIdle', melisandre: 'c4melisandreIdle',
            daenerys: 'c4daenerysIdle', jorah: 'c4jorahIdle', jaqen: 'c4jaqenIdle',
            jon: 'c4jonIdle', samwell: 'c4samwellIdle', aemon: 'c4aemonIdle',
            mance: 'c4manceIdle', child: 'c4childIdle',
            gendry: 'c4gendry', qyburn: 'c4qyburn', salladhor: 'c4salladhor',
            folk1: lit ? 'c4folkLit' : 'c4folk1', folk2: lit ? 'c4folkLit' : 'c4folk2',
            ally_stark: 'c4ally_stark', ally_baratheon: 'c4ally_baratheon', ally_lannister: 'c4ally_lannister', ally_targaryen: 'c4ally_targaryen'
        }[id];
        if (id.indexOf('scout') === 0) return lines(id, 'c4scoutIdle');
        return key ? lines(id, key) : null;
    }

    function extras(id, ch) {
        const t = T(), c = C();
        if (id === 'gendry') ch.push({ label: t.ui.browseForge, fn: () => { shopOf = 'gendry'; api.closeDlg(); api.forgeScreen(); } });
        if (id === 'jorah') ch.push({ label: t.ui.c4browseQuarter, fn: () => { shopOf = 'jorah'; api.closeDlg(); api.forgeScreen(); } });
        if (id === 'qyburn') ch.push({ label: t.ui.browsePotions, fn: () => { api.closeDlg(); api.potionScreen(); } });
        if (id === 'sansa' && api.setCloth) {
            const cur = (S().cloth && S().cloth[0]) || 0, nxt = (cur + 1) % 8;
            ch.push({ label: t.ui.clothRow + ': ' + (t.ui['cloth' + nxt] || ''), fn: () => { api.setCloth(0, nxt); api.closeDlg(); api.toast(t.ui['cloth' + nxt]); } });
        }
        if (id === 'sansa' && api.setPetKind) {
            const kinds = ['cat', 'direwolf', 'babydragon'], cur = S().petKind || 'cat', nxt = kinds[(kinds.indexOf(cur) + 1) % kinds.length];
            ch.push({ label: t.ui.petRow + ': ' + (t.ui['pet_' + nxt] || nxt), fn: () => { api.setPetKind(nxt); api.closeDlg(); api.toast(t.ui['pet_' + nxt]); } });
        }
        if (id === 'salladhor') {
            if (api.Z.id !== 'c4_essos' && (c.open.essos || c.st >= IDX.reach_essos)) {
                ch.push({ label: t.ui.c4sailEssos, fn: () => { api.closeDlg(); api.travel('c4_essos', 22.5, 28.5); } });
            }
            if (api.Z.id !== 'c4_river') {
                ch.push({ label: t.ui.c4sailRiver, fn: () => { api.closeDlg(); api.travel('c4_river', 22.5, 25.5); } });
            }
            ch.push({ label: t.ui.c4sailHome, fn: () => { api.closeDlg(); api.travel('c2_bay', 23.5, 23.6); } });
            if (window.HM_CHAPTERS && window.HM_CHAPTERS.enabled && window.HM_CHAPTERS.enabled('ch5')) {
                ch.push({ label: t.ui.c4sailBloodKingdoms || 'Sail to the Blood Kingdoms (Chapter 5)', fn: () => { api.closeDlg(); api.travel('c5_village', 22.5, 25.5); } });
            }
        }
    }

    function news(id) {
        const s = step(), c = C();
        if (!s) return id === 'aemon' && c.lore === 15 && !c.aemon;
        if ((s.type === 'talk' || s.type === 'choice') && s.npc === id && s.zone === api.Z.id) return true;
        if (s.type === 'rescue' && s.npcs.indexOf(id) >= 0) return !(c.m & (1 << s.npcs.indexOf(id)));
        return id === 'aemon' && c.lore === 15 && !c.aemon;
    }

    function visible(id) {
        const c = C();
        if (id.indexOf('scout') === 0) { const i = IDX.scouts; return c.st === i && !(c.m & (1 << (+id.slice(5) - 1))); }
        if (id.indexOf('ally_') === 0) return c.banner === id.slice(5) && c.st >= IDX.reach_beyond;
        return undefined;
    }

    function nearPt(p, fx, fy, x, y, r) { return api.dist(fx, fy, x, y) < (r || 40) || api.dist(p.x, p.y, x, y) < (r || 40) + 6; }
    function interact(p, fx, fy) {
        const Z = api.Z, c = C(), s = step(), t = T();
        if (s && s.zone === Z.id && (s.type === 'interact' || s.type === 'waves') && s.spots) {
            for (let i = 0; i < s.spots.length; i++) {
                if (c.m & (1 << i)) continue;
                if (!nearPt(p, fx, fy, s.spots[i][0] * TS, s.spots[i][1] * TS, 44)) continue;
                if (s.type === 'waves') { if (wave) { api.toast(api.txt(t.ui.c4waveLeft, { n: waveLeft() })); return true; } startWave(s, i); return true; }
                return doSpot(s, i);
            }
        }
        for (const o of Z.c4props || []) {
            if (!nearPt(p, fx, fy, o.cx, o.cy, 42)) continue;
            if (o.k === 'lore') { readLore(o.at.n); return true; }
            if (o.k === 'pyre') { api.say(lines(null, c.great ? 'c4pyreLit' : 'c4pyre')); return true; }
            if (o.k === 'boat') { api.talk('salladhor'); return true; }
        }
        return false;
    }
    function waveLeft() { let n = 0; for (const f of api.FOES) if (f.on && f.tag === 'w') n++; return n; }
    function doSpot(s, i) {
        const c = C();
        c.m |= 1 << i; c.c++;
        api.SND.fx('pick'); api.ringFx(s.spots[i][0] * TS, s.spots[i][1] * TS, 40, '#ffd25a');
        if (s.id === 'light') { litScene(); return true; }
        const pg = eachPages(s, i);
        if (c.c >= s.n) complete(pg);
        else { api.save(); api.say(pg.length ? pg : [[null, objective(api.L), null]], null, () => api.toast(objective(api.L))); }
        return true;
    }
    function readLore(n) {
        const c = C();
        if (!(c.lore & (1 << n))) {
            c.lore |= 1 << n; api.addXp(120); api.SND.fx('magic'); api.save();
            let k = 0; for (let b = 0; b < 4; b++) if (c.lore & (1 << b)) k++;
            setTimeout(() => api.toast(k === 4 ? T().ui.c4loreAll : api.txt(T().ui.c4lore, { n: k, m: 4 })), 400);
            return api.say(lines(null, 'c4lore' + n).concat(lines(null, 'c4loreKeeper')));
        }
        api.say(lines(null, 'c4lore' + n));
    }

    function onKill(f) {
        if (api.GT) api.GT.ok = false;
        if (wave && f && f.tag === 'w') checkWave();
        const s = step(), c = C();
        if (s && s.type === 'kill' && s.zone === api.Z.id && s.foes.indexOf(f.t) >= 0) {
            c.c++; api.toast(objective(api.L));
            if (c.c >= s.n) complete(); else { ensureQuestFoes(); api.save(); }
        } else {
            ensureQuestFoes();
        }
    }

    function bossDown(f) {
        const c = C(), s = step(), b = api.Z.def.boss;
        if (b && b.t === f.t) S()[b.flag] = true;
        if (f.t === 'valyrianlord') return valyrianHoard(f);
        if (BOSS_GIFT[f.t]) api.dropGear(f.x, f.y + 20, api.makeItem(BOSS_GIFT[f.t], 3));
        if (!s || s.type !== 'boss' || s.boss !== f.t) return api.save();
        if (f.t === 'viserion') {
            S().c4_viserion = true;
            complete(null, () => nkScene());
        } else if (f.t === 'nightking') {
            if (S().mounts.indexOf('shadowmane') < 0) S().mounts.push('shadowmane');
            if (S().mounts.indexOf('frostfang') < 0) S().mounts.push('frostfang');
            complete(null, () => {
                api.toast(T().ui.c4gotMounts); api.save();
                setTimeout(() => api.travel('c4_river', 24.5, 13.6), 2400);
            });
        } else complete();
    }

    function questDone(q) {
        if (!q || !q.rep) return;
        const c = C(); c.rep[q.rep] = (c.rep[q.rep] || 0) + 1;
        const f = T().ui['c4f' + q.rep];
        setTimeout(() => api.toast(api.txt(T().ui.c4rep, { f, n: Math.min(2, c.rep[q.rep]) })), 3200);
        if (c.rep[q.rep] >= 2 && !c.gift[q.rep]) {
            c.gift[q.rep] = true; const it = api.makeItem(REP_GIFT[q.rep], 3); api.addToBag(it, true);
            setTimeout(() => api.toast(api.txt(T().ui.c4repGift, { f, item: api.itemLabel(it) })), 6200);
        }
        api.save();
    }

    /* ---------------- Gates, Zones, Music & Faction Buffs ---------------- */
    function tile(ch) {
        const o = C().open, z = api.Z.id;
        if (z === 'c4_river') return ch === 'g' ? (o.south ? '=' : 'g') : ch === 'q' ? (o.north ? '=' : 'q') : ch;
        if (z === 'c4_kings') return ch === 'g' ? (o.storm ? '=' : 'g') : ch;
        if (z === 'c4_north') return ch === 'q' ? (o.wall ? '=' : 'q') : ch;
        if (z === 'c4_wall') return ch === 'g' ? (o.beyond ? 'x' : 'g') : ch;
        if (z === 'c4_beyond') return ch === 'q' ? (o.altar ? 'i' : 'q') : ch;
        return ch;
    }
    function gateNote() {
        const z = api.Z.id, o = C().open, u = T().ui;
        if (z === 'c4_river') return [103, o.south ? '' : u.c4southShut, 113, o.north ? '' : u.c4northShut];
        if (z === 'c4_kings') return [103, o.storm ? '' : u.c4stormShut, 0, ''];
        if (z === 'c4_north') return [0, '', 113, o.wall ? '' : u.c4wallShut];
        if (z === 'c4_wall') return [103, o.beyond ? '' : u.c4beyondShut, 0, ''];
        if (z === 'c4_beyond') return [0, '', 113, o.altar ? '' : u.c4altarShut];
        return null;
    }

    let noteT = 0, buff = '';
    const MODS = { take: 1, deal: 1 };
    function mods() {
        MODS.take = buff === 'stark' ? 0.75 : buff === 'baratheon' ? 0.85 : 1;
        MODS.deal = buff === 'targaryen' ? 1.3 : buff === 'lannister' ? 1.25 : buff === 'baratheon' ? 1.2 : 1.1;
        return MODS;
    }

    function onZone(id) {
        const s = step(), c = C();
        for (const f of api.FOES) f.tag = '';
        if (wave) {
            const w = step(); if (w && w.type === 'waves') c[w.id === 'obelisks' ? 'anchors' : 'wards'] &= ~(1 << wave.i);
            wave = null;
        }
        if (api.boss && api.boss.on && api.boss.t !== 'valyrianlord' && !(s && s.type === 'boss' && s.boss === api.boss.t)) { api.boss.on = false; api.boss = null; }
        if (s && s.type === 'collect' && s.zone === id) spawnPicks();
        if (s && s.type === 'boss' && s.zone === id) wakeBoss();
        ensureQuestFoes();
        buff = '';
    }

    /* ---------------- Chapter 4 Dynamic Soundtrack Management ---------------- */
    let lastCh4Track = '';
    let battleTimer = 0;

    function isCh4Dungeon(zid) {
        if (!zid) return false;
        if (zid.indexOf('c4_val') === 0) return true;
        if (api.Z && api.Z.def && (api.Z.def.depth || api.Z.def.dark)) return true;
        return false;
    }

    function isCh4Battling() {
        if (api.boss && api.boss.on && api.boss.active) return true;
        if (wave) return true;
        const p = api.P[0];
        if (p) {
            for (const f of api.FOES) {
                const d = api.dist ? api.dist(f.x, f.y, p.x, p.y) : Math.hypot(f.x - p.x, f.y - p.y);
                if (f.on && f.alpha > 0.5 && !f.friendly && d < 220) {
                    return true;
                }
            }
        }
        return false;
    }

    function syncCh4Music() {
        if (isCh4Battling()) {
            battleTimer = 180; // keep battle music during combat and 3s cooldown
        } else if (battleTimer > 0) {
            battleTimer -= 15;
        }

        const targetTrack = battleTimer > 0
            ? 'audio/soundtracks/battle.mp3'
            : (isCh4Dungeon(api.Z ? api.Z.id : '')
                ? 'audio/soundtracks/dangeon.mp3'
                : 'audio/soundtracks/theme.mp3');

        if (targetTrack !== lastCh4Track) {
            lastCh4Track = targetTrack;
            if (window.HM_AUDIO && HM_AUDIO.playTrack) {
                HM_AUDIO.playTrack(targetTrack);
            }
        }
    }

    function arrive(id) {
        const c = C(), s = step();
        syncCh4Music();
        if (id === 'c4_river' && !c.seen.arrive) { c.seen.arrive = 1; api.save(); arrivalScene(); return; }
        if (s && s.type === 'reach' && s.zone === id) { complete(); return; }
        if ((id === 'c4_wall' || id === 'c4_beyond') && c.banner) {
            buff = c.banner;
            setTimeout(() => api.toast(T().ui['c4buff_' + c.banner]), 2400);
        }
        if (id === 'c4_val1') {
            if (S().c4valyrian) { delete S().c4valyrian; api.save(); setTimeout(() => api.toast(T().ui.c4valWake), 2400); }
            else if (!c.seen.val) { c.seen.val = 1; api.save(); setTimeout(() => api.toast(T().ui.c4valIn), 2400); }
        }
    }

    function update() {
        const c = C(), Z = api.Z, p = api.P[0];
        const s = step();
        if (s && s.type === 'reach' && Z && s.zone === Z.id) { complete(); return; }
        if ((api.tick & 15) === 0) syncCh4Music();
        if (wave && (api.tick & 15) === 0) checkWave();
        if (buff === 'stark' && (api.tick % 180) === 0) {
            for (const q of api.P) if (q.on && !q.down && q.hp < api.maxHp(q)) {
                q.hp = Math.min(api.maxHp(q), q.hp + Math.ceil(api.maxHp(q) * 0.06));
                api.part(q.x, q.y - 20, 6, 0, 0, 1, 30, '#7ce8ff', 3, -0.02);
            }
        }
        if (noteT > 0) noteT--;
        else if ((api.tick & 7) === 0) {
            const g = gateNote();
            if (g) for (let k = 0; k < 4; k += 2) if (g[k] && g[k + 1] && api.ahead(p, g[k])) { api.toast(g[k + 1]); noteT = 240; break; }
        }
        const b = api.boss, key = { shadow: 'c4shadowHi', elderwyrm: 'c4wyrmHi', viserion: 'c4visHi', nightking: 'c4nkHi' };
        if (b && b.on && key[b.t] && !c.seen[b.t] && api.dist(p.x, p.y, b.x, b.y) < 8.5 * TS) {
            c.seen[b.t] = 1; api.save();
            api.scene([{ cam: [b.x / TS, b.y / TS], t: 60 }, { say: lines(null, key[b.t]) }, { t: 10 }]);
        }
    }

    /* ---------------- Cut-scenes ---------------- */
    function arrivalScene() {
        api.scene([
            { cam: [22, 26], t: 65 },
            { title: api.txt(T().ui.chapterN, { n: 4, name: T().ui.ch4Name }), t: 170 },
            { cam: [22, 13], t: 100 }, { cam: [22, 23], t: 50 },
            { say: lines('salladhor', 'c4arrive') }
        ], () => announce());
    }
    function nkScene() {
        const Z = api.Z, a = [24, 5];
        Z.npcs.push({ id: 'nkshade', look: 'nkshade', x: a[0] * TS, y: a[1] * TS, hx: a[0] * TS, hy: a[1] * TS, kind: 2, sy: a[1] * TS, walk: 0, fx: 0, fy: 1, bob: 0, roam: 0, tx: 0, ty: 0, wt: 0 });
        api.scene([
            { cam: a, t: 50, fx: 'flash', sound: 'blink' },
            { say: lines(null, 'c4nkScene') },
            { fn: () => { for (let i = Z.npcs.length - 1; i >= 0; i--) if (Z.npcs[i].id === 'nkshade') { api.burst(Z.npcs[i].x, Z.npcs[i].y - 20, 30, '#6ae8ff', 3); Z.npcs.splice(i, 1); } }, sound: 'blink', t: 50 }
        ], () => { api.toast(T().ui.c4horn); setTimeout(announce, 2200); });
    }
    function litScene() {
        const c = C(), t = T();
        api.scene([
            { cam: [25, 10], t: 40 },
            { fn: () => { c.great = true; c.beacons = 4; api.save(); api.music(); }, sound: 'level', fx: 'flash', t: 90 },
            { title: t.ui.ch4Name, t: 160 }
        ], () => {
            c.st = STEPS.length; c.c = 0; api.save();
            const ally = c.banner === 'baratheon' ? t.c4endBaratheon : c.banner === 'lannister' ? t.c4endLannister : c.banner === 'targaryen' ? t.c4endTargaryen : t.c4endStark;
            const sc = score();
            api.slides(t.c4ending.map(s => api.txt(s, { ally })).concat([t.ui.c4theEnd + '\n' + api.txt(t.ui.score, { n: sc })]), () => { api.toPlay(); api.toast(t.ui.c4free); });
        });
    }

    function npcAt(id) { for (const n of api.Z.npcs) if (n.id === id) { GT.x = n.x; GT.y = n.y; return true; } return false; }
    function target() {
        const c = C(), s = step(), Z = api.Z;
        if (Z && Z.def && Z.def.depth) {
            if (Z.id === 'c4_val5' && api.boss && api.boss.on) { GT.x = api.boss.x; GT.y = api.boss.y; return true; }
            if (Z.def.down) { GT.x = Z.def.down[0] * TS; GT.y = Z.def.down[1] * TS; return true; }
        }
        if (!s || !Z) return false;
        if (s.zone !== Z.id) return api.hop(s.zone);
        if ((s.type === 'talk' || s.type === 'choice') && npcAt(s.npc)) return true;
        if (s.type === 'waves' && wave) {
            let bestW = null, bdW = 1e9;
            for (const f of api.FOES) if (f.on && f.tag === 'w') { const d = api.dist(f.x, f.y, api.P[0].x, api.P[0].y); if (d < bdW) { bdW = d; bestW = f; } }
            if (bestW) { GT.x = bestW.x; GT.y = bestW.y; return true; }
            checkWave();
        }
        if (s.spots) {
            let best = -1, bd = 1e9;
            for (let i = 0; i < s.spots.length; i++) { if (c.m & (1 << i)) continue; const d = api.dist(s.spots[i][0] * TS, s.spots[i][1] * TS, api.P[0].x, api.P[0].y); if (d < bd) { bd = d; best = i; } }
            if (best >= 0 && !(s.type === 'waves' && wave)) { GT.x = s.spots[best][0] * TS; GT.y = s.spots[best][1] * TS; return true; }
        }
        if (s.type === 'rescue') { for (let i = 0; i < s.npcs.length; i++) if (!(c.m & (1 << i)) && npcAt(s.npcs[i])) return true; }
        if (s.type === 'kill') {
            let best = null, bd = 1e9;
            for (const f of api.FOES) if (f.on && s.foes.indexOf(f.t) >= 0) { const d = api.dist(f.x, f.y, api.P[0].x, api.P[0].y); if (d < bd) { bd = d; best = f; } }
            if (!best) {
                ensureQuestFoes();
                for (const f of api.FOES) if (f.on && s.foes.indexOf(f.t) >= 0) { const d = api.dist(f.x, f.y, api.P[0].x, api.P[0].y); if (d < bd) { bd = d; best = f; } }
            }
            if (best) { GT.x = best.x; GT.y = best.y; return true; }
        }
        if (s.type === 'boss') {
            if (!(api.boss && api.boss.on && api.boss.t === s.boss)) wakeBoss();
            if (api.boss && api.boss.on) {
                if (api.boss.invul) {
                    let bestSh = null, bdSh = 1e9;
                    for (const f of api.FOES) if (f.on && f.tag === 'nksh') { const d = api.dist(f.x, f.y, api.P[0].x, api.P[0].y); if (d < bdSh) { bdSh = d; bestSh = f; } }
                    if (bestSh) { GT.x = bestSh.x; GT.y = bestSh.y; return true; }
                }
                GT.x = api.boss.x; GT.y = api.boss.y; return true;
            }
        }
        if (s.at && s.type === 'reach') { GT.x = s.at[0] * TS; GT.y = s.at[1] * TS; return true; }
        return false;
    }

    function score() { const s = S(); return 4500 + s.kills * 12 + s.lvl * 120 + s.qdone * 250; }
    function zoneOpen(z) {
        const o = C().open;
        if (z === 'c4_kings') return !!o.south;
        if (z === 'c4_storm') return !!o.storm;
        if (z === 'c4_north') return !!o.north;
        if (z === 'c4_essos') return !!o.essos;
        if (z === 'c4_wall') return !!o.wall;
        if (z === 'c4_beyond') return !!o.beyond;
        return true;
    }
    function npcExtra(id, x, y) {
        if (id === 'melisandre') { const c = api.ctx; c.globalAlpha = 0.4 + Math.sin(api.tick * 0.08) * 0.15; c.drawImage(api.glow('#ff4a2a'), x + 2, y - 36, 20, 20); c.globalAlpha = 1; }
    }
    function journal() {
        const q = quest(); if (!q) return null;
        const c = C();
        let done = 0; for (const e of STEPS) if (e.q === q && IDX[e.s.id] < c.st) done++;
        return { act: q.act, title: loc(q.title), story: loc(q.story), n: done, m: q.steps.length, all: QD.quests.map(x => [loc(x.title), STEPS.findIndex(e => e.q === x) < c.st, x === q]) };
    }

    function devUnlockAll() {
        const c = C(); if (!c) return;
        for (const g of ['south', 'storm', 'north', 'essos', 'wall', 'beyond', 'altar']) { c.open[g] = true; openNow(g); }
        api.save(); api.toast(T().ui.devUnlockAll);
    }
    function devSkipStep() {
        const c = C(); if (!c || c.st >= STEPS.length) return;
        const e = STEPS[c.st];
        if (e && e.s) {
            apply(e.s.set);
            if (e.s.type === 'choice' && !c.banner) c.banner = 'stark';
        }
        c.st++; c.c = 0; c.m = 0; wave = null;
        api.SND.fx('quest'); api.save(); startStep(); announce();
    }

    return {
        id: 'ch4', home: 'c4_river', maps: MAPS, quests: QUESTS, pool: window.HM_C4_POOL || [], chests: {}, looks: LOOK, foes: FOES,
        get shop() { return shopOf === 'jorah' ? SHOP_JORAH : SHOP_GENDRY; },
        talkers: { robb: 1, tyrion: 1, daenerys: 1, jon: 1 }, noWolf: true, preload: false, solid: '^PkLcGRBq', hard: 1,
        parent: {
            c4_val1: 'c4_essos', c4_val2: 'c4_val1', c4_val3: 'c4_val2', c4_val4: 'c4_val3', c4_val5: 'c4_val4',
            c4_kings: 'c4_river', c4_storm: 'c4_kings', c4_north: 'c4_river', c4_essos: 'c4_river', c4_wall: 'c4_north', c4_beyond: 'c4_wall'
        },
        dust: {
            c4_val1: '#5a4648', c4_val2: '#5a4648', c4_val3: '#5a4648', c4_val4: '#6a3a38', c4_val5: '#6a3a38',
            c4_river: '#a89470', c4_kings: '#b8a07a', c4_storm: '#8a8078', c4_north: '#e8f0f8', c4_essos: '#7a988a', c4_wall: '#e8f0f8', c4_beyond: '#d8ecff'
        },
        treasures: { c4_river: 2, c4_kings: 3, c4_storm: 3, c4_north: 3, c4_essos: 3, c4_wall: 3, c4_beyond: 3 },
        beasts: ['wight', 'whitewalker', 'direwolf', 'children', 'shadow', 'giant', 'icespider', 'firewyrm', 'kraken', 'unicorn', 'elderwyrm', 'viserion', 'nightking', 'valyrianlord'],
        songs: ['c4_river', 'c4_river_lit', 'c4_kings', 'c4_storm', 'c4_north', 'c4_essos', 'c4_wall', 'c4_beyond', 'c4_boss'], bossSong: 'audio/soundtracks/battle.mp3',
        songDefs: {
            // Game of Thrones main theme inspired D-minor cello/brass ostinato (fifth-minor third-fourth-fifth)
            c4_river:     { root: 146.8, scale: [0, 2, 3, 5, 7, 8, 10, 12], chords: [0, 5, 3, 4], rate: 3.2, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'march', echo: 0.3, busy: 0.65, seed: 71 },
            c4_river_lit: { root: 196.0, scale: [0, 2, 4, 7, 9, 12, 14, 16], chords: [0, 3, 4, 5], rate: 3.6, beats: 64, pad: 'sine', lead: 'brass', drums: 'march', echo: 0.25, busy: 0.75, seed: 73 },
            c4_kings:     { root: 130.8, scale: [0, 2, 3, 5, 7, 8, 11, 12], chords: [0, 4, 5, 3], rate: 3.0, beats: 64, pad: 'triangle', lead: 'bell', drums: 'soft', echo: 0.35, busy: 0.55, seed: 79 },
            c4_storm:     { root: 123.5, scale: [0, 1, 3, 5, 7, 8, 10, 12], chords: [0, 5, 6, 4], rate: 3.8, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'tom', echo: 0.25, busy: 0.65, seed: 83 },
            c4_north:     { root: 146.8, scale: [0, 2, 3, 7, 8, 12, 14, 15], chords: [0, 3, 5, 4], rate: 2.5, beats: 64, pad: 'sine', lead: 'flute', drums: 'soft', echo: 0.5, busy: 0.45, seed: 89 },
            c4_essos:     { root: 164.8, scale: [0, 1, 4, 5, 7, 8, 11, 12], chords: [0, 1, 4, 3], rate: 3.4, beats: 64, pad: 'triangle', lead: 'flute', drums: 'tom', echo: 0.35, busy: 0.6, seed: 97 },
            c4_wall:      { root: 110.0, scale: [0, 2, 3, 5, 7, 8, 10, 12], chords: [0, 5, 3, 4], rate: 2.6, beats: 48, pad: 'sawtooth', lead: 'brass', drums: 'soft', echo: 0.5, busy: 0.45, seed: 101 },
            c4_beyond:    { root: 110.0, scale: [0, 1, 3, 6, 7, 8, 11, 12], chords: [0, 1, 6, 4], rate: 2.4, beats: 48, pad: 'sawtooth', lead: 'bell', drums: 'none', echo: 0.6, busy: 0.4, arp: false, seed: 103 },
            c4_boss:      { root: 146.8, scale: [0, 1, 3, 5, 7, 8, 10, 12], chords: [0, 5, 1, 4], rate: 6.8, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'war', echo: 0.12, busy: 0.92, seed: 107 }
        },
        start() {
            const s = S();
            if (s && !s.c4) s.c4 = { st: 0, c: 0, m: 0, beacons: 0, great: false, open: {}, banner: '', lore: 0, rep: {}, gift: {}, wards: 0, anchors: 0, aemon: false, seen: {} };
            lastCh4Track = '';
            syncCh4Music();
        },
        stop() {
            wave = null; buff = ''; lastCh4Track = '';
            if (window.HM_AUDIO && HM_AUDIO.playTrack) HM_AUDIO.playTrack('');
        },
        build(Z, def) { ART.build(Z, def, api); },
        chestLoot(c) { if (api.Z.def.depth) api.dropGear(c.cx, c.cy + 18, api.rollItem(6, 1)); },
        drawUnder(x, cx, cy, t) { ART.drawUnder(x, api.Z, cx, cy, t); },
        drawOver(x, cx, cy, t) { ART.drawOver(x, api.Z, cx, cy, t, api.glow); },
        objective, story, idle, extras, news, visible, tile, interact, onKill, bossDown, onZone, arrive, update, target, score, npcExtra, questDone, mods, pickup, journal, zoneOpen,
        ensureQuestFoes, devUnlockAll, devSkipStep,
        whatNext() { return objective(api.L); },
        stageOf() { return C() ? C().st : 0; },
        music(zone, def) {
            if (isCh4Battling()) return 'audio/soundtracks/battle.mp3';
            if (isCh4Dungeon(zone)) return 'audio/soundtracks/dangeon.mp3';
            return 'audio/soundtracks/theme.mp3';
        },
        bossSong: 'audio/soundtracks/battle.mp3',
        lanternLit() { return !!C().great; },
        gems() { const c = C(); return (c.beacons >= 1 ? 1 : 0) | (c.beacons >= 2 ? 2 : 0) | (c.beacons >= 3 ? 4 : 0) | (c.great ? 8 : 0); },
        relics() { const c = C(), t = T(); return [[t.ui.c4wildfire, c.st > IDX.wildfire, 'b'], [t.ui.c4dragonglass, c.st > IDX.dragonglass, 'r'], [t.ui.c4horn, c.st > IDX.viserion, 's']]; },
        forgeName() { return shopOf === 'jorah' ? T().ui.c4quarter : T().ui.c4forge; },
        storeName() { return T().ui.c4store; }
    };
};
