/* Hollowmere, Chapter 5: The Blood Kingdoms.
 * Dark Gothic Horror RPG expansion across 7 vampire & undead dominions.
 * Implements the full CHAPTER_API contract, 8 main quests across 4 Acts, side quests,
 * Blood Moon event, Vampire Infection & Holy Shrine cleansing, and 9 bosses culminating in Queen Carmilla. */
window.HM_C5_POOL = window.HM_C5_POOL || [];

HM_CHAPTERS.def.ch5 = function (api) {
    'use strict';
    const TS = api.TS || 32, GT = api.GT || { x: 0, y: 0 };
    const ART = window.HM_C5_ART, MAPS = window.HM_C5_MAPS, HERO = api.HERO || window.HM_HERO;
    const QD = window.HM_C5_QUESTS || { quests: [] };

    const S = () => api.S || {};
    const T = () => (typeof api.T === 'function' ? api.T() : api.T) || (window.HM_C5_TEXT && window.HM_C5_TEXT[api.L || 'en']) || {};
    const C = () => {
        const s = S();
        if (s && !s.c5) s.c5 = { st: 0, c: 0, m: 0, beacons: 0, open: {}, seen: {}, infected: 0, bloodMoon: 0, altarBuff: 0 };
        return (s && s.c5) || { st: 0, c: 0, m: 0, beacons: 0, open: {}, seen: {}, infected: 0, bloodMoon: 0, altarBuff: 0 };
    };
    const lines = (who, key) => {
        if (api.lines) return api.lines(who, key);
        const t = T(), arr = (t.lines && t.lines[key]) || [];
        return arr.map(s => [who, s, null]);
    };
    const loc = o => o ? (o[api.L || 'en'] || o.en || '') : '';
    const txt = (s, v) => api.txt ? api.txt(s || '', v || {}) : String(s || '');

    /* ---------------- Main quests flattened into steps ---------------- */
    const STEPS = [];
    for (const q of QD.quests) for (const s of q.steps) STEPS.push({ q, s });
    const IDX = {}; STEPS.forEach((e, i) => { IDX[e.s.id] = i; });
    const step = () => { const e = STEPS[C().st]; return e ? e.s : null; };
    const quest = () => { const e = STEPS[C().st]; return e ? e.q : null; };

    function sayPages(b, whoOver) {
        if (!b) return [];
        const list = b[api.L || 'en'] || b.en || [], who = whoOver !== undefined ? whoOver : (b.who === undefined ? null : b.who);
        return list.map(t => [who, t, null]);
    }
    function eachPages(s, i, who) {
        const l = s.each ? (s.each[api.L || 'en'] || s.each.en) : null;
        return l && l[i] ? [[who === undefined ? null : who, l[i], null]] : [];
    }
    function objective(lang) {
        const c = C(), l = lang || api.L || 'en';
        const t = (api.TEXT && (api.TEXT[l] || api.TEXT.en)) || T();
        const e = STEPS[c.st];
        if (!e) return (t.ui && t.ui.c5free) || 'The Blood Kingdoms are freed.';
        const s = e.s, g = s.goal[l] || s.goal.en;
        return txt(g, { n: Math.min(s.n || 0, c.c), m: s.n || 0 });
    }
    function announce() {
        const o = objective(api.L);
        if (window.MyPC && MyPC.announce) MyPC.announce(o);
        if (api.toast) api.toast(o);
    }

    function apply(set) {
        if (!set) return;
        const c = C(), u = T().ui || {};
        if (set.beacons && c.beacons < set.beacons) {
            c.beacons = set.beacons;
            setTimeout(() => api.toast && api.toast(txt(u.c5beacon || 'Blood Kingdom liberated ({n}/7)', { n: c.beacons })), 2000);
        }
        if (set.open) {
            c.open[set.open] = true;
            openNow(set.open);
        }
    }

    function openNow(g) {
        if (!api.Z || !api.openTiles) return;
        const z = api.Z.id;
        if (g === 'dracula' && z === 'c5_village') api.openTiles(113, 61, 'gate2');
        else if ((g === 'nosferatu' || g === 'crimson') && z === 'c5_village') api.openTiles(103, 61, 'gate');
        else if (g === 'shadow' && z === 'c5_brides') api.openTiles(103, 61, 'gate');
        else if (g === 'undying' && z === 'c5_shadow') api.openTiles(113, 61, 'gate2');
        else if (g === 'carmilla' && z === 'c5_undying') api.openTiles(113, 61, 'gate2');
        else return;
        api.Z.ftx = -1; api.Z.fty = -1; if (api.GT) api.GT.ok = false;
        if (api.SND) { api.SND.fx('door'); api.SND.fx('slam'); }
        api.shake = 10;
    }

    function complete(before, after) {
        const c = C(), e = STEPS[c.st]; if (!e) return;
        const s = e.s;
        apply(s.set);
        c.st++; c.c = 0; c.m = 0;
        if (api.GT) api.GT.ok = false;
        if (api.SND) api.SND.fx('quest');
        if (api.save) api.save();
        const pg = (before || []).concat(s.type === 'talk' ? [] : sayPages(s.say));
        const next = () => { startStep(); if (after) after(); else if (C().st < STEPS.length) announce(); };
        if (pg.length && api.say) api.say(pg, null, next); else next();
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
        if (s.type === 'kill' && s.zone === Z.id) ensureQuestFoes();
        if (s.type === 'boss' && s.zone === Z.id) wakeBoss();
    }

    function bossDef() {
        const s = step();
        if (s && s.type === 'boss' && api.Z && s.zone === api.Z.id) {
            return { t: s.boss, x: s.at ? s.at[0] : 23.5, y: s.at ? s.at[1] : 9.5, flag: 'c5_' + s.boss };
        }
        return null;
    }

    function wakeBoss() {
        const b = bossDef(); if (!b || !api.spawnFoe) return;
        if (api.boss && api.boss.on && api.boss.t === b.t) return;
        if (S() && b.flag) S()[b.flag] = false;
        const pos = findSpawnPos(b.x * TS, b.y * TS);
        api.boss = api.spawnFoe(b.t, pos[0], pos[1], false);
        if (api.boss) {
            api.boss.boss = true;
            if (api.burst) api.burst(api.boss.x, api.boss.y - 20, 30, '#ff2848', 3);
            if (api.ringFx) api.ringFx(api.boss.x, api.boss.y, 90, '#ff2848');
            // In Widow's Forest, the Three Brides fight together!
            if (b.t === 'bride_crimson') {
                const p1 = findSpawnPos((b.x - 4) * TS, (b.y + 1.5) * TS);
                const p2 = findSpawnPos((b.x + 4) * TS, (b.y + 1.5) * TS);
                const s1 = api.spawnFoe('bride_shadow', p1[0], p1[1], true);
                if (s1) { s1.d = Object.assign({}, s1.d, { boss: false }); s1.active = true; }
                const s2 = api.spawnFoe('bride_frost', p2[0], p2[1], true);
                if (s2) { s2.d = Object.assign({}, s2.d, { boss: false }); s2.active = true; }
            }
        }
    }

    /* ---------------- Characters of the Blood Kingdoms ---------------- */
    const LOOK = {
        alucard:    { skin: '#f0e2dc', hair: '#f2eef8', style: 1, tunic: '#5a1220', trim: '#ffd24a', pants: '#1a141e', shoes: '#140e16', cape: '#8a1428', s: 1.08, gear: { body: 'vampire_armor', feet: 'valyrian_greaves' } },
        vanhelsing: { skin: '#e0b490', hair: '#4a3220', style: 0, tunic: '#3e2c22', trim: '#c8a048', pants: '#241c18', shoes: '#181210', cape: '#2a1e18', beard: '#4a3220', s: 1.08, gear: { head: 'hood', body: 'watch_cloak' } },
        mina:       { skin: '#f4d4bc', hair: '#4a261c', style: 1, tunic: '#3a4e6e', trim: '#e8e0d0', pants: '#26344a', shoes: '#221816', cape: '#2c3c56' },
        jonathan:   { skin: '#e6be9a', hair: '#2e221c', style: 0, tunic: '#3e4452', trim: '#c8b898', pants: '#242830', shoes: '#1c1816' },
        tobin:      { skin: '#c89670', hair: '#2a2220', style: 0, tunic: '#5a3828', trim: '#e0a030', pants: '#2e221c', shoes: '#201814', beard: '#2a2220', s: 1.12, gear: { body: 'padded_vest' } },
        hana:       { skin: '#f2ceb0', hair: '#e8c468', style: 1, tunic: '#e8e4ec', trim: '#ffd24a', pants: '#3a4a68', shoes: '#241c18', cape: '#3a5080' },
        salladhor:  { skin: '#8d5836', hair: '#1e1816', style: 0, tunic: '#6a1838', trim: '#ffd24a', pants: '#2e1628', shoes: '#201218', cape: '#481028', beard: '#1e1816' }
    };

    const THRALL_LOOK   = { skin: '#c8c4d0', hair: '#241e28', style: 2, tunic: '#38222e', trim: '#7a2838', pants: '#1e1620', shoes: '#141018' };
    const KNIGHT_LOOK   = { skin: '#bab4c4', hair: '#1a1420', style: 0, tunic: '#4e1220', trim: '#d8a840', pants: '#221218', shoes: '#160c12', cape: '#7a1424' };
    const MAIDEN_LOOK   = { skin: '#f2dce4', hair: '#8a1428', style: 1, tunic: '#8a162c', trim: '#ffd25a', pants: '#3e0e1a', shoes: '#240810', cape: '#5e0e20' };
    const ASSASSIN_LOOK = { skin: '#9ca0b8', hair: '#14121e', style: 4, tunic: '#1e1a30', trim: '#8a5cff', pants: '#141022', shoes: '#0e0c18', cape: '#282040' };
    const ZOMBIE_LOOK   = { skin: '#789476', hair: '#2a3228', style: 2, tunic: '#363c32', trim: '#586452', pants: '#222820', shoes: '#181c16' };
    const SKELETON_LOOK = { skin: '#dcd8c8', hair: '#dcd8c8', style: 2, tunic: '#2e322e', trim: '#8a9488', pants: '#1e201e', shoes: '#161816' };

    /* ---------------- Rendering & AI Helpers ---------------- */
    const near = f => api.nearest ? api.nearest(f.x, f.y) : (api.P && api.P[0]);
    function towards(f, p) { const d = (api.dist ? api.dist(p.x, p.y, f.x, f.y) : Math.hypot(p.x - f.x, p.y - f.y)) || 1; f.vx = (p.x - f.x) / d; f.vy = (p.y - f.y) / d; }
    function oval(x, X, Y, rx, ry, col) { x.fillStyle = col; x.beginPath(); x.ellipse(X, Y, rx, ry, 0, 0, 6.2832); x.fill(); }
    function bar(x, f, X, Y) { if (f.hp >= f.max) return; x.fillStyle = '#000'; x.fillRect(X - 15, Y, 30, 4); x.fillStyle = '#ff3848'; x.fillRect(X - 14, Y + 1, 28 * Math.max(0, f.hp) / f.max, 2); }

    function person(x, f, X, Y, w, look, gear, weapon, col, s) {
        const q = near(f), tx = q ? q.x - f.x : 1, ty = q ? q.y - f.y : 0, dir = Math.abs(ty) > Math.abs(tx) * 1.3 ? (ty < 0 ? 1 : 0) : 2, flip = tx < 0;
        const aim = f.st === 1, a = aim && f.vx !== undefined ? Math.atan2(f.vy, f.vx) : dir === 2 ? (flip ? -2.2 : -0.95) : -1.3;
        const hx = X + (dir === 2 ? (flip ? -3 : 3) * s : dir === 1 ? -9 * s : 9 * s), hy = Y - 14 * s;
        if (dir === 1 && api.drawHeld) api.drawHeld(weapon, col, '#2a1a20', hx, hy, a, 0, aim ? 8 : 0, 0);
        if (HERO && HERO.draw) HERO.draw(x, X, Y, look, gear, dir, flip, f.st === 0 ? (f.walk || 0) * 1.6 : 0, f.st === 2 ? (flip ? -1 : 1) : 0, w, s);
        if (dir !== 1 && api.drawHeld) api.drawHeld(weapon, col, '#2a1a20', hx, hy, a, 0, aim ? 8 : 0, 0);
        return { dir, flip };
    }

    function wings(x, X, Y, span, col, t) {
        const flap = Math.sin((t || 0) * 0.16 + X * 0.05) * 6;
        x.fillStyle = col;
        x.beginPath();
        x.moveTo(X - 4, Y); x.lineTo(X - span, Y - 14 + flap); x.lineTo(X - span * 0.75, Y + 4 + flap * 0.5); x.lineTo(X - 4, Y + 6);
        x.moveTo(X + 4, Y); x.lineTo(X + span, Y - 14 + flap); x.lineTo(X + span * 0.75, Y + 4 + flap * 0.5); x.lineTo(X + 4, Y + 6);
        x.fill();
    }

    function pounceUpd(f, p, d, tx, ty, rw, rh, range, chaseFar) {
        if (f.cd > 0) f.cd--;
        const bm = C().bloodMoon > 0 ? 1.2 : 1;
        if (f.st === 0) {
            if (p && d < chaseFar) api.chase(f, tx, ty, f.d.spd * bm, rw, rh); else api.wander(f, rw, rh);
            if (p && d < range && f.cd <= 0) { f.st = 1; f.tm = 18; towards(f, p); }
        } else if (f.st === 1) {
            if (f.tm > 6 && p) towards(f, p);
            if (--f.tm <= 0) { f.st = 2; f.tm = 13; if (api.SND) api.SND.fx('swing'); }
        } else if (f.st === 2) {
            if (api.moveEnt(f, f.vx * 5.8, f.vy * 5.8, rw, rh) || --f.tm <= 0) { f.st = 3; f.tm = 20; }
        } else if (--f.tm <= 0) { f.st = 0; f.cd = 55; }
    }

    function archerUpd(f, p, d, tx, ty, rw, rh, col) {
        if (!p) return api.wander(f, rw, rh);
        if (d > 190) api.chase(f, tx, ty, f.d.spd, rw, rh);
        else if (d < 95) api.moveEnt(f, -tx * f.d.spd, -ty * f.d.spd, rw, rh);
        if (++f.tm > 68 && d < 260) {
            f.tm = 0;
            api.shot(f.x, f.y - 20, tx * 3.4, ty * 3.4, f.d.dmg, 6, 6, 0);
            if (api.SND) api.SND.fx('shoot');
        }
    }

    /* ---------------- Boss AI Routines ---------------- */
    function draculaUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0), phase2 = f.hp < f.max * 0.55;
        if (phase2 && !f.p2) {
            f.p2 = true;
            if (api.toast) api.toast(T().ui.c5draculaPhase);
            if (api.ringFx) api.ringFx(f.x, f.y, 95, '#ff2038');
            api.shake = 12;
        }
        api.chase(f, tx, ty, f.d.spd * (phase2 ? 1.28 : 1), rw, rh);
        if (++f.tm > (phase2 ? 48 : 64)) {
            f.tm = 0; f.pt = ((f.pt || 0) + 1) % 3;
            const ang = Math.atan2(p.y - f.y, p.x - f.x);
            if (f.pt === 0) {
                const n = phase2 ? 5 : 3;
                for (let i = 0; i < n; i++) {
                    const a = ang + (i - (n - 1) / 2) * 0.25;
                    api.shot(f.x, f.y - 26, Math.cos(a) * 3.5, Math.sin(a) * 3.5, dmg, 7, 8, 0);
                }
                if (api.SND) api.SND.fx('magic');
            } else if (f.pt === 1) {
                api.hazard(p.x, p.y, 38, 38, dmg, 0, '#ff1838');
                if (api.SND) api.SND.fx('slam');
                api.shake = 8;
            } else if (api.minions && api.minions() < 3) {
                api.spawnFoe('blood_bat', f.x - 36, f.y + 16, true);
                api.spawnFoe('blood_bat', f.x + 36, f.y + 16, true);
            }
        }
    }

    function orlokUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0), phase2 = f.hp < f.max * 0.55;
        if (phase2 && !f.p2) {
            f.p2 = true;
            if (api.toast) api.toast(T().ui.c5orlokDarkness);
            if (api.ringFx) api.ringFx(f.x, f.y, 90, '#58e848');
        }
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (++f.tm > (phase2 ? 52 : 68)) {
            f.tm = 0; f.pt = ((f.pt || 0) + 1) % 3;
            const ang = Math.atan2(p.y - f.y, p.x - f.x);
            if (f.pt === 0) {
                api.hazard(p.x, p.y, 40, 40, dmg - 4, 0, '#48c838');
                for (let i = -1; i <= 1; i++) {
                    const a = ang + i * 0.3;
                    api.shot(f.x, f.y - 24, Math.cos(a) * 3.2, Math.sin(a) * 3.2, dmg - 4, 6, 7, 0);
                }
            } else if (f.pt === 1 && api.minions && api.minions() < 4) {
                api.spawnFoe('plague_rat', f.x + 32, f.y + 20, true);
                api.spawnFoe('plague_rat', f.x - 32, f.y + 20, true);
            } else {
                // Infect player if nearby
                if (d < 150 && C().infected <= 0) {
                    C().infected = 900;
                    if (api.toast) api.toast(T().ui.c5infected);
                }
            }
        }
    }

    function brideUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0);
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (++f.tm > 56) {
            f.tm = 0;
            const ang = Math.atan2(p.y - f.y, p.x - f.x);
            for (let i = 0; i < 6; i++) {
                const a = ang + i * 1.0472;
                api.shot(f.x, f.y - 24, Math.cos(a) * 3.3, Math.sin(a) * 3.3, dmg - 5, 6, 7, 0);
            }
            if (f.t === 'bride_crimson') api.hazard(p.x, p.y, 34, 34, dmg, 0, '#ff2848');
            if (api.SND) api.SND.fx('magic');
        }
    }

    function bloodQueenUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0);
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (++f.tm > 54) {
            f.tm = 0; f.pt = ((f.pt || 0) + 1) % 2;
            const ang = Math.atan2(p.y - f.y, p.x - f.x);
            if (f.pt === 0) {
                for (let i = -2; i <= 2; i++) {
                    const a = ang + i * 0.22;
                    api.shot(f.x, f.y - 26, Math.cos(a) * 3.6, Math.sin(a) * 3.6, dmg, 7, 8, 0);
                }
                // Blood drain heal
                f.hp = Math.min(f.max, f.hp + 35);
            } else {
                api.hazard(p.x, p.y, 42, 42, dmg, 0, '#d81428');
                if (api.SND) api.SND.fx('slam');
            }
        }
    }

    function ruthvenUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0);
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (++f.tm > 50) {
            f.tm = 0; f.pt = ((f.pt || 0) + 1) % 2;
            if (f.pt === 0) {
                for (let k = 0; k < 8; k++) {
                    const a = k * 0.7854 + (api.tick || 0) * 0.03;
                    api.shot(f.x, f.y - 26, Math.cos(a) * 3.4, Math.sin(a) * 3.4, dmg - 4, 7, 7, 0);
                }
                if (api.SND) api.SND.fx('magic');
            } else {
                // Phantom shadow step behind hero
                const a = Math.random() * 6.2832;
                const nx = p.x + Math.cos(a) * 72, ny = p.y + Math.sin(a) * 72;
                if (!api.feetSolid || !api.feetSolid(nx, ny)) {
                    if (api.ringFx) api.ringFx(f.x, f.y, 48, '#9a58ff');
                    f.x = nx; f.y = ny;
                    if (api.ringFx) api.ringFx(f.x, f.y, 48, '#9a58ff');
                }
            }
        }
    }

    function undyingKingUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0);
        if (f.hp < f.max * 0.35 && !f.revived) {
            f.revived = true;
            f.hp = Math.min(f.max, f.hp + Math.round(f.max * 0.35));
            if (api.toast) api.toast(T().ui.c5undyingRevive);
            if (api.ringFx) api.ringFx(f.x, f.y, 100, '#58ff98');
            api.shake = 12;
        }
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (++f.tm > 58) {
            f.tm = 0; f.pt = ((f.pt || 0) + 1) % 3;
            if (f.pt === 0) {
                for (let k = 1; k <= 4; k++) api.hazard(f.x + tx * k * 34, f.y + ty * k * 28, 36, 36, dmg, 0, '#48e888');
                if (api.SND) api.SND.fx('slam');
                api.shake = 10;
            } else if (f.pt === 1 && api.minions && api.minions() < 4) {
                api.spawnFoe('undead_runner', f.x - 40, f.y + 20, true);
                api.spawnFoe('bone_archer', f.x + 40, f.y + 20, true);
            } else {
                const ang = Math.atan2(p.y - f.y, p.x - f.x);
                for (let i = -2; i <= 2; i++) {
                    const a = ang + i * 0.25;
                    api.shot(f.x, f.y - 28, Math.cos(a) * 3.3, Math.sin(a) * 3.3, dmg - 4, 7, 8, 0);
                }
            }
        }
    }

    function carmillaUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0);
        // Check active Blood Crystals in the zone; heal Carmilla if any remain
        let crystals = 0;
        if (api.FOES) {
            for (const o of api.FOES) if (o.on && o.t === 'blood_crystal') crystals++;
        }
        if (crystals > 0 && f.hp < f.max && ((api.tick || 0) & 15) === 0) {
            f.hp = Math.min(f.max, f.hp + crystals * 8);
        }
        if (f.hp < f.max * 0.68 && !f.p2) {
            f.p2 = true;
            if (api.toast) api.toast(T().ui.c5carmillaPhase2);
            if (api.ringFx) api.ringFx(f.x, f.y, 100, '#ff1838');
            api.shake = 12;
        }
        if (f.hp < f.max * 0.35 && !f.p3) {
            f.p3 = true;
            if (api.toast) api.toast(T().ui.c5carmillaPhase3);
            if (api.ringFx) api.ringFx(f.x, f.y, 120, '#ff1838');
            api.shake = 15;
            if (crystals === 0 && api.spawnFoe) {
                api.spawnFoe('blood_crystal', 14.5 * TS, 9.5 * TS, true);
                api.spawnFoe('blood_crystal', 32.5 * TS, 9.5 * TS, true);
            }
            if (api.minions && api.minions() < 3) {
                api.spawnFoe('vampire_knight', f.x - 48, f.y + 24, true);
                api.spawnFoe('vampire_knight', f.x + 48, f.y + 24, true);
            }
        }
        const spdMul = f.p3 ? 1.35 : f.p2 ? 1.18 : 1;
        api.chase(f, tx, ty, f.d.spd * spdMul, rw, rh);
        if (++f.tm > (f.p3 ? 42 : f.p2 ? 50 : 60)) {
            f.tm = 0; f.pt = ((f.pt || 0) + 1) % 3;
            const ang = Math.atan2(p.y - f.y, p.x - f.x);
            if (f.pt === 0) {
                const n = f.p3 ? 8 : f.p2 ? 6 : 4;
                for (let i = 0; i < n; i++) {
                    const a = ang + (i - (n - 1) / 2) * 0.24;
                    api.shot(f.x, f.y - 30, Math.cos(a) * 3.8, Math.sin(a) * 3.8, dmg, 8, 9, 0);
                }
                if (api.SND) api.SND.fx('magic');
            } else if (f.pt === 1) {
                api.hazard(p.x, p.y, 44, 44, dmg + 4, 0, '#ff1838');
                if (f.p2) api.hazard(p.x + 48, p.y, 34, 34, dmg, 0, '#ff1838');
                if (f.p3) api.hazard(p.x - 48, p.y, 34, 34, dmg, 0, '#ff1838');
                if (api.SND) api.SND.fx('slam');
                api.shake = 10;
            } else {
                for (let k = 0; k < 8; k++) {
                    const a = k * 0.7854;
                    api.shot(f.x, f.y - 28, Math.cos(a) * 3.2, Math.sin(a) * 3.2, dmg - 4, 7, 8, 0);
                }
            }
        }
    }

    /* ---------------- Foe & Boss Definitions ---------------- */
    const FOES = {
        blood_bat: {
            hp: 95, dmg: 20, spd: 1.55, r: 10, xp: 36, gold: 18, c: '#d8182c', fly: true,
            upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 110, 280),
            draw(x, f, X, Y, w) {
                oval(x, X, Y, 10, 3, 'rgba(0,0,0,0.28)');
                wings(x, X, Y - 18, 16, w ? '#fff' : '#4a101c', api.tick);
                oval(x, X, Y - 18, 6, 5, w ? '#fff' : '#280a12');
                x.fillStyle = '#ff2038'; x.fillRect(X - 3, Y - 20, 2, 2); x.fillRect(X + 1, Y - 20, 2, 2);
                bar(x, f, X, Y - 32);
            }
        },
        vampire_thrall: {
            hp: 145, dmg: 24, spd: 1.3, r: 11, xp: 44, gold: 24, c: '#a82034',
            upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 115, 280),
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, THRALL_LOOK, { head: '', body: 'padded_vest', feet: '' }, 'sword', '#9a2030', 1.0);
                bar(x, f, X, Y - 48);
            }
        },
        vampire_knight: {
            hp: 240, dmg: 32, spd: 1.15, r: 13, xp: 68, gold: 38, c: '#c8182c',
            upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 125, 290),
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, KNIGHT_LOOK, { head: 'knight_helm', body: 'vampire_armor', feet: 'valyrian_greaves' }, 'sword', '#d81c30', 1.12);
                bar(x, f, X, Y - 54);
            }
        },
        blood_wolf: {
            hp: 155, dmg: 26, spd: 1.52, r: 13, xp: 48, gold: 25, c: '#b81c2c',
            upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 130, 300),
            draw(x, f, X, Y, w) {
                oval(x, X, Y, 15, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = w ? '#fff' : '#3a141c';
                x.beginPath(); x.ellipse(X, Y - 13, 15, 7, 0, 0, 6.2832); x.fill();
                x.beginPath(); x.ellipse(X + 12, Y - 18, 7, 6, 0, 0, 6.2832); x.fill();
                x.fillStyle = '#ff2038'; x.fillRect(X + 14, Y - 20, 2.5, 2.5);
                bar(x, f, X, Y - 36);
            }
        },
        blood_maiden: {
            hp: 185, dmg: 28, spd: 1.32, r: 12, xp: 56, gold: 32, c: '#ff2848',
            upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 125, 290),
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, MAIDEN_LOOK, { head: '', body: 'mage_robe', feet: '' }, 'staff', '#ff2848', 1.04);
                bar(x, f, X, Y - 50);
            }
        },
        flesh_golem: {
            hp: 310, dmg: 36, spd: 0.9, r: 17, xp: 75, gold: 44, c: '#8a3844', kb: 0.15,
            upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 110, 270),
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, ZOMBIE_LOOK, { head: '', body: 'padded_vest', feet: 'iron_greaves' }, 'hammer', '#682430', 1.32);
                bar(x, f, X, Y - 60);
            }
        },
        plague_rat: {
            hp: 85, dmg: 19, spd: 1.6, r: 9, xp: 32, gold: 15, c: '#58c848',
            upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 105, 270),
            draw(x, f, X, Y, w) {
                oval(x, X, Y, 10, 3, 'rgba(0,0,0,0.28)');
                oval(x, X, Y - 8, 10, 5, w ? '#fff' : '#3a4234');
                x.fillStyle = '#68ff48'; x.fillRect(X + 6, Y - 10, 2, 2);
                bar(x, f, X, Y - 24);
            }
        },
        rotting_ghoul: {
            hp: 170, dmg: 27, spd: 1.28, r: 12, xp: 52, gold: 28, c: '#68d858',
            upd(f, p, d, tx, ty, rw, rh) {
                pounceUpd(f, p, d, tx, ty, rw, rh, 115, 280);
                if (p && d < 28 && C().infected <= 0 && Math.random() < 0.02) {
                    C().infected = 900;
                    if (api.toast) api.toast(T().ui.c5infected);
                }
            },
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, ZOMBIE_LOOK, { head: '', body: '', feet: '' }, 'axes', '#48a838', 1.02);
                bar(x, f, X, Y - 48);
            }
        },
        night_stalker: {
            hp: 180, dmg: 30, spd: 1.48, r: 12, xp: 58, gold: 32, c: '#7a48ff',
            upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 135, 300),
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, ASSASSIN_LOOK, { head: 'hood', body: 'watch_cloak', feet: '' }, 'axes', '#8a58ff', 1.05);
                bar(x, f, X, Y - 50);
            }
        },
        shadow_assassin: {
            hp: 195, dmg: 32, spd: 1.54, r: 12, xp: 62, gold: 35, c: '#9a58ff',
            upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 140, 310),
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, ASSASSIN_LOOK, { head: 'hood', body: 'vampire_armor', feet: 'swift_boots' }, 'sword', '#9a58ff', 1.06);
                bar(x, f, X, Y - 50);
            }
        },
        undead_walker: {
            hp: 190, dmg: 26, spd: 1.05, r: 12, xp: 50, gold: 26, c: '#58c878',
            upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 280) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); },
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, ZOMBIE_LOOK, { head: 'iron_helm', body: 'padded_vest', feet: '' }, 'axes', '#588868', 1.02);
                bar(x, f, X, Y - 48);
            }
        },
        undead_runner: {
            hp: 135, dmg: 28, spd: 1.62, r: 11, xp: 52, gold: 28, c: '#68ff88',
            upd: (f, p, d, tx, ty, rw, rh) => pounceUpd(f, p, d, tx, ty, rw, rh, 135, 310),
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, ZOMBIE_LOOK, { head: '', body: '', feet: 'leather_boots' }, 'sword', '#68c878', 0.98);
                bar(x, f, X, Y - 46);
            }
        },
        bone_archer: {
            hp: 150, dmg: 28, spd: 1.18, r: 11, xp: 55, gold: 30, c: '#d8dcd0',
            upd: (f, p, d, tx, ty, rw, rh) => archerUpd(f, p, d, tx, ty, rw, rh, '#d8dcd0'),
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, SKELETON_LOOK, { head: 'iron_helm', body: 'chainmail', feet: '' }, 'bow', '#d8dcd0', 1.02);
                bar(x, f, X, Y - 48);
            }
        },
        blood_crystal: {
            hp: 180, dmg: 0, spd: 0, r: 14, xp: 35, gold: 20, c: '#ff2038', kb: 0,
            upd: () => {},
            draw(x, f, X, Y, w) {
                oval(x, X, Y, 13, 4, 'rgba(0,0,0,0.35)');
                x.fillStyle = w ? '#fff' : '#ff1838';
                x.beginPath(); x.moveTo(X, Y - 38); x.lineTo(X + 12, Y - 18); x.lineTo(X, Y); x.lineTo(X - 12, Y - 18); x.closePath(); x.fill();
                bar(x, f, X, Y - 44);
            }
        },

        /* ---------------- 9 Chapter 5 Bosses ---------------- */
        dracula: {
            hp: 1950, dmg: 34, spd: 1.24, r: 18, xp: 450, gold: 320, c: '#ff1838', boss: true, kb: 0.1,
            upd: draculaUpd,
            draw(x, f, X, Y, w) {
                if (f.p2) wings(x, X, Y - 28, 28, '#5a0c18', api.tick);
                person(x, f, X, Y, w, LOOK.alucard, { head: '', body: 'vampire_armor', feet: 'valyrian_greaves' }, 'sword', '#ff1838', 1.32);
            }
        },
        orlok: {
            hp: 2150, dmg: 36, spd: 1.18, r: 18, xp: 500, gold: 350, c: '#58e848', boss: true, kb: 0.1,
            upd: orlokUpd,
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, { skin: '#b8c8b4', hair: '#d8e0d4', style: 2, tunic: '#1e2820', trim: '#58c848', pants: '#141a16', shoes: '#0e1210', cape: '#18221a' }, { head: '', body: 'mage_robe', feet: '' }, 'staff', '#58e848', 1.3);
            }
        },
        bride_crimson: {
            hp: 1800, dmg: 35, spd: 1.3, r: 17, xp: 520, gold: 360, c: '#ff2848', boss: true, kb: 0.12,
            upd: brideUpd,
            draw(x, f, X, Y, w) {
                wings(x, X, Y - 24, 22, '#8a1428', api.tick);
                person(x, f, X, Y, w, MAIDEN_LOOK, { head: '', body: 'mage_robe', feet: '' }, 'staff', '#ff2848', 1.24);
            }
        },
        bride_shadow: {
            hp: 950, dmg: 30, spd: 1.38, r: 15, xp: 220, gold: 140, c: '#9a58ff', boss: true, kb: 0.15,
            upd: brideUpd,
            draw(x, f, X, Y, w) {
                wings(x, X, Y - 22, 20, '#3a1c68', api.tick);
                person(x, f, X, Y, w, ASSASSIN_LOOK, { head: '', body: 'mage_robe', feet: '' }, 'sword', '#9a58ff', 1.16);
            }
        },
        bride_frost: {
            hp: 950, dmg: 30, spd: 1.32, r: 15, xp: 220, gold: 140, c: '#6ae8ff', boss: true, kb: 0.15,
            upd: brideUpd,
            draw(x, f, X, Y, w) {
                wings(x, X, Y - 22, 20, '#245878', api.tick);
                person(x, f, X, Y, w, { skin: '#d8f0ff', hair: '#eef8ff', style: 1, tunic: '#244868', trim: '#7ce8ff', pants: '#183048', shoes: '#102030', cape: '#1c3c58' }, { head: '', body: 'mage_robe', feet: '' }, 'staff', '#6ae8ff', 1.16);
            }
        },
        blood_queen: {
            hp: 2450, dmg: 38, spd: 1.22, r: 18, xp: 580, gold: 400, c: '#e8182c', boss: true, kb: 0.1,
            upd: bloodQueenUpd,
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, MAIDEN_LOOK, { head: 'crimson_amulet', body: 'targaryen_scale', feet: 'valyrian_greaves' }, 'staff', '#ff1838', 1.34);
            }
        },
        ruthven: {
            hp: 2650, dmg: 40, spd: 1.34, r: 18, xp: 640, gold: 440, c: '#9a58ff', boss: true, kb: 0.1,
            upd: ruthvenUpd,
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, ASSASSIN_LOOK, { head: 'shadow_ring', body: 'vampire_armor', feet: 'valyrian_greaves' }, 'sword', '#9a58ff', 1.32);
            }
        },
        undying_king: {
            hp: 3000, dmg: 42, spd: 1.15, r: 20, xp: 720, gold: 500, c: '#58ff98', boss: true, kb: 0.08,
            upd: undyingKingUpd,
            draw(x, f, X, Y, w) {
                person(x, f, X, Y, w, SKELETON_LOOK, { head: 'knight_helm', body: 'kingsguard_plate', feet: 'iron_greaves' }, 'axes', '#58ff98', 1.44);
            }
        },
        carmilla: {
            hp: 3800, dmg: 46, spd: 1.28, r: 20, xp: 950, gold: 700, c: '#ff1838', boss: true, kb: 0.08,
            upd: carmillaUpd,
            draw(x, f, X, Y, w) {
                if (f.p2 || f.p3) wings(x, X, Y - 32, f.p3 ? 36 : 28, f.p3 ? '#ff1838' : '#7a1020', api.tick);
                person(x, f, X, Y, w, MAIDEN_LOOK, { head: 'crimson_amulet', body: 'vampire_armor', feet: 'valyrian_greaves' }, 'sword', '#ff1838', f.p3 ? 1.48 : 1.36);
            }
        }
    };

    /* ---------------- Side Quests & Shops ---------------- */
    const QUESTS = [
        { id: 'c5_bats',   giver: 'jonathan',   stage: 1, type: 'kill', foe: 'blood_bat',     n: 8, gold: 320, xp: 340, gift: 'blood_sword',    reward: { coins: 320, item: 'blood_sword' } },
        { id: 'c5_ghouls', giver: 'mina',       stage: 4, type: 'kill', foe: 'rotting_ghoul', n: 6, gold: 360, xp: 380, gift: 'shadow_ring',    reward: { coins: 360, item: 'shadow_ring' } },
        { id: 'c5_wolves', giver: 'vanhelsing', stage: 7, type: 'kill', foe: 'blood_wolf',    n: 6, gold: 400, xp: 420, gift: 'crimson_amulet', reward: { coins: 400, item: 'crimson_amulet' } },
        { id: 'c5_undead', giver: 'alucard',    stage: 14,type: 'kill', foe: 'undead_walker', n: 8, gold: 480, xp: 500, gift: 'bone_reaper',    reward: { coins: 480, item: 'bone_reaper' } }
    ];

    const BOSS_GIFT = {
        dracula:       { item: 'blood_sword',    mount: 'nightmare' },
        orlok:         { item: 'shadow_ring' },
        bride_crimson: { item: 'holy_relic',     mount: 'bloodfang' },
        blood_queen:   { item: 'crimson_amulet' },
        ruthven:       { item: 'vampire_armor' },
        undying_king:  { item: 'bone_reaper',    mount: 'bonecharger' },
        carmilla:      { item: 'holy_relic',     mount: 'nightterror' }
    };

    const SHOP_TOBIN = ['blood_sword', 'bone_reaper', 'holy_relic', 'vampire_armor', 'nightstalker_garb', 'sanctified_vestment', 'crimson_amulet', 'shadow_ring', 'dread_greaves', 'valyrian_blade', 'winters_fang', 'stormbreaker', 'valyrian_axes', 'golden_pistols'];

    /* ---------------- Dialogue & Interactions ---------------- */
    function story(id) {
        const s = step();
        if (s && s.type === 'talk' && s.npc === id && api.Z && s.zone === api.Z.id) {
            complete(sayPages(s.say, id));
            return true;
        }
        return null;
    }

    function idle(id) {
        const key = {
            alucard: 'c5alucardIdle',
            vanhelsing: 'c5vanhelsingIdle',
            mina: 'c5minaIdle',
            jonathan: 'c5jonathanIdle',
            tobin: 'c5tobin',
            hana: 'c5hana',
            salladhor: 'c5salladhor'
        }[id];
        return key ? lines(id, key) : null;
    }

    function extras(id, ch) {
        const u = T().ui || {}, c = C(), o = c.open || {};
        if (id === 'tobin') ch.push({ label: u.browseForge || 'Forge & Relics', fn: () => { api.closeDlg(); api.forgeScreen(); } });
        if (id === 'hana') ch.push({ label: u.browsePotions || 'Potions & Elixirs', fn: () => { api.closeDlg(); api.potionScreen(); } });
        if (id === 'salladhor' || id === 'alucard') {
            if (api.Z.id !== 'c5_dracula' && (o.dracula || c.st >= 3)) ch.push({ label: u.c5travelDracula || 'Castle Dracula', fn: () => { api.closeDlg(); api.travel('c5_dracula', 22.5, 28.5); } });
            if (api.Z.id !== 'c5_nosferatu' && (o.nosferatu || c.st >= 5)) ch.push({ label: u.c5travelNosferatu || 'Nosferatu\'s Wasteland', fn: () => { api.closeDlg(); api.travel('c5_nosferatu', 22.5, 29.5); } });
            if (api.Z.id !== 'c5_brides' && (o.brides || c.st >= 8)) ch.push({ label: u.c5travelBrides || 'The Brides\' Domain', fn: () => { api.closeDlg(); api.travel('c5_brides', 2.5, 15.5); } });
            if (api.Z.id !== 'c5_crimson' && (o.crimson || c.st >= 11)) ch.push({ label: u.c5travelCrimson || 'The Crimson Empire', fn: () => { api.closeDlg(); api.travel('c5_crimson', 22.5, 28.5); } });
            if (api.Z.id !== 'c5_shadow' && (o.shadow || c.st >= 14)) ch.push({ label: u.c5travelShadow || 'The Shadow Principality', fn: () => { api.closeDlg(); api.travel('c5_shadow', 22.5, 29.5); } });
            if (api.Z.id !== 'c5_undying' && (o.undying || c.st >= 17)) ch.push({ label: u.c5travelUndying || 'The Undying Kingdom', fn: () => { api.closeDlg(); api.travel('c5_undying', 22.5, 29.5); } });
            if (api.Z.id !== 'c5_carmilla' && (o.carmilla || c.st >= 20)) ch.push({ label: u.c5travelCarmilla || 'Carmilla\'s Blood Cathedral', fn: () => { api.closeDlg(); api.travel('c5_carmilla', 22.5, 29.5); } });
            if (api.Z.id !== 'c5_village') ch.push({ label: u.c5travelBack || 'Return to Blackthorn Village', fn: () => { api.closeDlg(); api.travel('c5_village', 22.5, 25.5); } });
            if (id === 'salladhor') ch.push({ label: u.c5sailWesteros || 'Sail to Westeros (Chapter 4)', fn: () => { api.closeDlg(); api.travel('c4_river', 22.5, 25.5); } });
        }
    }

    function news(id) {
        const s = step();
        return !!(s && s.type === 'talk' && s.npc === id && api.Z && s.zone === api.Z.id);
    }

    function visible() { return undefined; }

    function nearPt(p, fx, fy, x, y, r) {
        const d1 = api.dist ? api.dist(fx, fy, x, y) : Math.hypot(fx - x, fy - y);
        const d2 = p ? (api.dist ? api.dist(p.x, p.y, x, y) : Math.hypot(p.x - x, p.y - y)) : 1e9;
        return d1 < (r || 44) || d2 < (r || 44) + 8;
    }

    function interact(p, fx, fy) {
        const Z = api.Z, c = C(), s = step(), u = T().ui || {};
        if (!Z) return false;
        // 1. Active main quest interact spots
        if (s && s.zone === Z.id && s.type === 'interact' && s.spots) {
            for (let i = 0; i < s.spots.length; i++) {
                if (c.m & (1 << i)) continue;
                if (!nearPt(p, fx, fy, s.spots[i][0] * TS, s.spots[i][1] * TS, 48)) continue;
                c.m |= 1 << i; c.c++;
                if (api.SND) api.SND.fx('pick');
                if (api.ringFx) api.ringFx(s.spots[i][0] * TS, s.spots[i][1] * TS, 44, '#ffd25a');
                if (s.id === 'consecrate_shrines' && c.c >= s.n && api.addToBag && api.makeItem) {
                    api.addToBag(api.makeItem('holy_relic', 3), true);
                }
                const pg = eachPages(s, i);
                if (c.c >= s.n) complete(pg);
                else {
                    if (api.save) api.save();
                    if (api.say) api.say(pg.length ? pg : [[null, objective(api.L), null]], null, () => api.toast && api.toast(objective(api.L)));
                }
                return true;
            }
        }
        // 2. Holy Shrines (cleanse vampire infection & heal party) and Blood Altars (grant Crimson Fury buff)
        for (const o of Z.c5props || []) {
            if (!nearPt(p, fx, fy, o.cx, o.cy, 46)) continue;
            if (o.k === 'shrine') {
                c.infected = 0;
                if (api.P) for (const q of api.P) if (q.on && api.maxHp) q.hp = api.maxHp(q);
                if (api.SND) api.SND.fx('level');
                if (api.ringFx) api.ringFx(o.cx, o.cy, 56, '#ffe880');
                if (api.toast) api.toast(u.c5cleansed || 'Holy Shrine cleanses and restores you!');
                return true;
            }
            if (o.k === 'altar') {
                c.altarBuff = 1800;
                if (api.SND) api.SND.fx('magic');
                if (api.ringFx) api.ringFx(o.cx, o.cy, 56, '#ff2848');
                if (api.toast) api.toast(u.c5altarBlessing || 'Blood Altar grants +30% Crimson Fury!');
                return true;
            }
        }
        return false;
    }

    function onKill(f) {
        if (api.GT) api.GT.ok = false;
        const s = step(), c = C(), u = T().ui || {};
        if (f && f.t === 'blood_crystal') {
            if (api.Z && api.Z.statics) {
                let bestSt = null, bdSt = 96;
                for (const st of api.Z.statics) if (st.on && st.k === 'crystal') {
                    const sx = st.cx || (st.dx + st.dw * 0.5), sy = st.cy || (st.dy + st.dh * 0.5);
                    const d = Math.hypot(sx - f.x, sy - f.y);
                    if (d < bdSt) { bdSt = d; bestSt = st; }
                }
                if (bestSt) bestSt.on = false;
            }
            if (api.toast) api.toast(u.c5crystalShatter || 'Blood Crystal shattered!');
            if (api.ringFx) api.ringFx(f.x, f.y, 60, '#ff2848');
        }
        if (s && s.type === 'kill' && api.Z && s.zone === api.Z.id && s.foes && s.foes.indexOf(f.t) >= 0) {
            c.c++;
            if (api.toast) api.toast(objective(api.L));
            if (c.c >= s.n) complete(); else { ensureQuestFoes(); if (api.save) api.save(); }
        } else {
            ensureQuestFoes();
        }
    }

    function bossDown(f) {
        const s = step(), b = api.Z && api.Z.def && api.Z.def.boss;
        if (b && b.t === f.t) S()[b.flag] = true;
        const reward = BOSS_GIFT[f.t];
        if (reward) {
            if (reward.item && api.dropGear && api.makeItem) api.dropGear(f.x, f.y + 20, api.makeItem(reward.item, 3));
            if (reward.mount && S().mounts && S().mounts.indexOf(reward.mount) < 0) S().mounts.push(reward.mount);
        }
        if (!s || s.type !== 'boss' || s.boss !== f.t) { if (api.save) api.save(); return; }
        if (f.t === 'carmilla') {
            complete(null, () => {
                if (api.toast) api.toast(T().ui.c5gotMounts);
                if (api.save) api.save();
            });
        } else {
            complete();
        }
    }

    /* ---------------- Gates, Music & Updates ---------------- */
    function tile(ch) {
        const o = C().open || {}, z = api.Z && api.Z.id;
        if (z === 'c5_village') return ch === 'q' ? (o.dracula ? '=' : 'q') : ch === 'g' ? (o.nosferatu ? '=' : 'g') : ch;
        if (z === 'c5_brides')  return ch === 'g' ? (o.shadow ? '=' : 'g') : ch;
        if (z === 'c5_shadow')  return ch === 'q' ? (o.undying ? '=' : 'q') : ch;
        if (z === 'c5_undying') return ch === 'q' ? (o.carmilla ? '=' : 'q') : ch;
        return ch;
    }

    function zoneOpen(z) {
        const o = C().open || {}, st = C().st || 0;
        if (z === 'c5_dracula')   return !!(o.dracula || st >= 3);
        if (z === 'c5_nosferatu') return !!(o.nosferatu || st >= 5);
        if (z === 'c5_brides')    return !!(o.brides || st >= 8);
        if (z === 'c5_crimson')   return !!(o.crimson || st >= 11);
        if (z === 'c5_shadow')    return !!(o.shadow || st >= 14);
        if (z === 'c5_undying')   return !!(o.undying || st >= 17);
        if (z === 'c5_carmilla')  return !!(o.carmilla || st >= 20);
        return true;
    }

    const MODS = { take: 1, deal: 1 };
    function mods() {
        const c = C();
        MODS.take = c.infected > 0 ? 1.15 : 0.95;
        MODS.deal = c.altarBuff > 0 ? 1.3 : 1.15;
        return MODS;
    }

    let lastCh5Track = '';
    let battleTimer = 0;

    function isCh5Dungeon(zid) {
        if (!zid) return false;
        return zid !== 'c5_village';
    }

    function isCh5Battling() {
        if (api.boss && api.boss.on && api.boss.active) return true;
        const p = api.P && api.P[0];
        if (p && api.FOES) {
            for (const f of api.FOES) {
                const d = api.dist ? api.dist(f.x, f.y, p.x, p.y) : Math.hypot(f.x - p.x, f.y - p.y);
                if (f.on && f.alpha > 0.5 && !f.friendly && d < 220) return true;
            }
        }
        return false;
    }

    function syncCh5Music() {
        if (isCh5Battling()) battleTimer = 180;
        else if (battleTimer > 0) battleTimer -= 15;

        const targetTrack = battleTimer > 0
            ? 'audio/soundtracks/battle.mp3'
            : (isCh5Dungeon(api.Z ? api.Z.id : '')
                ? 'audio/soundtracks/dangeon.mp3'
                : 'audio/soundtracks/theme.mp3');

        if (targetTrack !== lastCh5Track) {
            lastCh5Track = targetTrack;
            if (window.HM_AUDIO && HM_AUDIO.playTrack) HM_AUDIO.playTrack(targetTrack);
        }
    }

    function onZone(id) {
        const s = step();
        if (api.boss && api.boss.on && !(s && s.type === 'boss' && s.boss === api.boss.t)) { api.boss.on = false; api.boss = null; }
        if (s && s.type === 'boss' && s.zone === id) wakeBoss();
        ensureQuestFoes();
    }

    function arrive(id) {
        const c = C(), s = step();
        syncCh5Music();
        if (id === 'c5_village' && !c.seen.arrive) {
            c.seen.arrive = 1;
            if (api.save) api.save();
            announce();
            return;
        }
        if (s && s.type === 'reach' && s.zone === id) { complete(); return; }
        if (s && s.type === 'boss' && s.zone === id) wakeBoss();
    }

    function update() {
        const c = C(), s = step();
        if (s && s.type === 'reach' && api.Z && s.zone === api.Z.id) { complete(); return; }
        if (((api.tick || 0) & 15) === 0) syncCh5Music();
        if (c.altarBuff > 0) c.altarBuff--;
        if (c.infected > 0) c.infected--;
        if (c.bloodMoon > 0) c.bloodMoon--;
    }

    function npcAt(id) {
        if (!api.Z || !api.Z.npcs) return false;
        for (const n of api.Z.npcs) if (n.id === id) { GT.x = n.x; GT.y = n.y; return true; }
        return false;
    }

    function target() {
        const c = C(), s = step(), Z = api.Z;
        if (!s || !Z) return false;
        if (s.zone !== Z.id) return api.hop ? api.hop(s.zone) : false;
        if (s.type === 'talk' && npcAt(s.npc)) return true;
        if (s.spots) {
            let best = -1, bd = 1e9;
            const p0 = (api.P && api.P[0]) || { x: 0, y: 0 };
            for (let i = 0; i < s.spots.length; i++) {
                if (c.m & (1 << i)) continue;
                const d = api.dist ? api.dist(s.spots[i][0] * TS, s.spots[i][1] * TS, p0.x, p0.y) : Math.hypot(s.spots[i][0] * TS - p0.x, s.spots[i][1] * TS - p0.y);
                if (d < bd) { bd = d; best = i; }
            }
            if (best >= 0) { GT.x = s.spots[best][0] * TS; GT.y = s.spots[best][1] * TS; return true; }
        }
        if (s.type === 'kill' && api.FOES) {
            let best = null, bd = 1e9;
            const p0 = (api.P && api.P[0]) || { x: 0, y: 0 };
            for (const f of api.FOES) if (f.on && s.foes && s.foes.indexOf(f.t) >= 0) {
                const d = api.dist ? api.dist(f.x, f.y, p0.x, p0.y) : Math.hypot(f.x - p0.x, f.y - p0.y);
                if (d < bd) { bd = d; best = f; }
            }
            if (!best) {
                ensureQuestFoes();
                for (const f of api.FOES) if (f.on && s.foes && s.foes.indexOf(f.t) >= 0) {
                    const d = api.dist ? api.dist(f.x, f.y, p0.x, p0.y) : Math.hypot(f.x - p0.x, f.y - p0.y);
                    if (d < bd) { bd = d; best = f; }
                }
            }
            if (best) { GT.x = best.x; GT.y = best.y; return true; }
        }
        if (s.type === 'boss') {
            if (!(api.boss && api.boss.on && api.boss.t === s.boss)) wakeBoss();
            if (api.boss && api.boss.on) {
                if (s.boss === 'carmilla' && (api.boss.hp < api.boss.max || api.boss.p3) && api.FOES) {
                    const p0 = (api.P && api.P[0]) || { x: 0, y: 0 };
                    let bestCr = null, bdCr = 1e9;
                    for (const f of api.FOES) if (f.on && f.t === 'blood_crystal') {
                        const d = api.dist ? api.dist(f.x, f.y, p0.x, p0.y) : Math.hypot(f.x - p0.x, f.y - p0.y);
                        if (d < bdCr) { bdCr = d; bestCr = f; }
                    }
                    if (bestCr) { GT.x = bestCr.x; GT.y = bestCr.y; return true; }
                }
                GT.x = api.boss.x; GT.y = api.boss.y; return true;
            }
        }
        if (s.at && s.type === 'reach') { GT.x = s.at[0] * TS; GT.y = s.at[1] * TS; return true; }
        return false;
    }

    function journal() {
        const q = quest(); if (!q) return null;
        const c = C();
        let done = 0; for (const e of STEPS) if (e.q === q && IDX[e.s.id] < c.st) done++;
        return { act: q.act, title: loc(q.title), story: loc(q.story), n: done, m: q.steps.length, all: QD.quests.map(x => [loc(x.title), STEPS.findIndex(e => e.q === x) < c.st, x === q]) };
    }

    function devUnlockAll() {
        const c = C();
        for (const g of ['dracula', 'nosferatu', 'brides', 'crimson', 'shadow', 'undying', 'carmilla']) {
            c.open[g] = true;
            openNow(g);
        }
        if (api.save) api.save();
        if (api.toast) api.toast((T().ui && T().ui.devUnlockAll) || 'Unlocked all Chapter 5 kingdoms & gates!');
    }

    function devSkipStep() {
        const c = C(); if (!c || c.st >= STEPS.length) return;
        const e = STEPS[c.st];
        if (e && e.s) apply(e.s.set);
        c.st++; c.c = 0; c.m = 0;
        if (api.SND) api.SND.fx('quest');
        if (api.save) api.save();
        startStep(); announce();
    }

    return {
        id: 'ch5', home: 'c5_village', maps: MAPS, quests: QUESTS, pool: window.HM_C5_POOL, chests: {}, looks: LOOK,
        foes: FOES, foeTypes: FOES,
        shop: SHOP_TOBIN,
        talkers: { alucard: 1, vanhelsing: 1, mina: 1, jonathan: 1 }, noWolf: true, preload: false, solid: '^PkLcGRBq#', hard: 1,
        parent: {
            c5_dracula: 'c5_village',
            c5_nosferatu: 'c5_village',
            c5_brides: 'c5_village',
            c5_crimson: 'c5_village',
            c5_shadow: 'c5_brides',
            c5_undying: 'c5_shadow',
            c5_carmilla: 'c5_undying'
        },
        dust: {
            c5_village: '#6a3848', c5_dracula: '#8a182c', c5_nosferatu: '#486838', c5_brides: '#5a3858',
            c5_crimson: '#9a1828', c5_shadow: '#383068', c5_undying: '#3a5848', c5_carmilla: '#a81830'
        },
        treasures: { c5_village: 2, c5_dracula: 2, c5_nosferatu: 2, c5_brides: 2, c5_crimson: 2, c5_shadow: 2, c5_undying: 2, c5_carmilla: 2 },
        beasts: [
            'blood_bat', 'vampire_thrall', 'vampire_knight', 'blood_wolf', 'blood_maiden', 'flesh_golem',
            'plague_rat', 'rotting_ghoul', 'night_stalker', 'shadow_assassin', 'undead_walker', 'undead_runner',
            'bone_archer', 'dracula', 'orlok', 'bride_crimson', 'bride_shadow', 'bride_frost', 'blood_queen',
            'ruthven', 'undying_king', 'carmilla'
        ],
        songs: ['c5_village', 'c5_dracula', 'c5_nosferatu', 'c5_brides', 'c5_crimson', 'c5_shadow', 'c5_undying', 'c5_carmilla', 'c5_boss'],
        bossSong: 'audio/soundtracks/battle.mp3',
        songDefs: {
            c5_village:   { root: 146.8, scale: [0, 2, 3, 5, 7, 8, 11, 12], chords: [0, 5, 3, 4], rate: 2.8, beats: 64, pad: 'sawtooth', lead: 'bell',  drums: 'soft',  echo: 0.4, busy: 0.55, seed: 501 },
            c5_dracula:   { root: 130.8, scale: [0, 1, 4, 5, 7, 8, 11, 12], chords: [0, 3, 4, 1], rate: 3.6, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'march', echo: 0.3, busy: 0.72, seed: 503 },
            c5_nosferatu: { root: 110.0, scale: [0, 1, 3, 6, 7, 8, 10, 12], chords: [0, 1, 6, 4], rate: 2.5, beats: 48, pad: 'triangle', lead: 'flute', drums: 'none',  echo: 0.5, busy: 0.45, seed: 507 },
            c5_brides:    { root: 164.8, scale: [0, 2, 3, 5, 7, 8, 11, 12], chords: [0, 4, 5, 3], rate: 3.4, beats: 64, pad: 'sine',     lead: 'bell',  drums: 'tom',   echo: 0.35,busy: 0.65, seed: 509 },
            c5_crimson:   { root: 146.8, scale: [0, 1, 4, 5, 7, 8, 10, 12], chords: [0, 5, 1, 4], rate: 3.8, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'march', echo: 0.25,busy: 0.75, seed: 511 },
            c5_shadow:    { root: 123.5, scale: [0, 2, 3, 6, 7, 8, 11, 12], chords: [0, 3, 5, 4], rate: 3.2, beats: 64, pad: 'triangle', lead: 'bell',  drums: 'soft',  echo: 0.45,busy: 0.6,  seed: 513 },
            c5_undying:   { root: 110.0, scale: [0, 2, 3, 5, 7, 8, 10, 12], chords: [0, 5, 3, 4], rate: 3.5, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'war',   echo: 0.3, busy: 0.7,  seed: 517 },
            c5_carmilla:  { root: 146.8, scale: [0, 1, 3, 5, 7, 8, 11, 12], chords: [0, 5, 1, 4], rate: 4.2, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'war',   echo: 0.2, busy: 0.85, seed: 521 },
            c5_boss:      { root: 146.8, scale: [0, 1, 3, 5, 7, 8, 11, 12], chords: [0, 5, 1, 4], rate: 6.8, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'war',   echo: 0.12,busy: 0.92, seed: 523 }
        },
        start() {
            C();
            lastCh5Track = '';
            syncCh5Music();
        },
        stop() {
            lastCh5Track = '';
            if (window.HM_AUDIO && HM_AUDIO.playTrack) HM_AUDIO.playTrack('');
        },
        build(Z, def) { ART.build(Z, def, api); },
        drawUnder(x, cx, cy, t) { ART.drawUnder(x, api.Z, cx, cy, t); },
        drawOver(x, cx, cy, t) { ART.drawOver(x, api.Z, cx, cy, t, api.glow); },
        objective, story, idle, extras, news, visible, tile, interact, onKill, bossDown, onZone, arrive, update, target, mods, journal, zoneOpen,
        ensureQuestFoes, devUnlockAll, devSkipStep,
        whatNext() { return objective(api.L); },
        stageOf() { return C().st || 0; },
        music(zone) {
            if (isCh5Battling()) return 'audio/soundtracks/battle.mp3';
            if (isCh5Dungeon(zone)) return 'audio/soundtracks/dangeon.mp3';
            return 'audio/soundtracks/theme.mp3';
        },
        lanternLit() { return (C().beacons || 0) >= 7; },
        gems() { const b = C().beacons || 0; return (b >= 1 ? 1 : 0) | (b >= 3 ? 2 : 0) | (b >= 5 ? 4 : 0) | (b >= 7 ? 8 : 0); },
        relics() {
            const c = C(), u = T().ui || {};
            return [
                [u.c5crest || 'Dracula\'s Crest', c.st > (IDX.defeat_dracula || 4), 'b'],
                [u.c5ring  || 'Shadow Ring',      c.st > (IDX.defeat_orlok || 7),   'r'],
                [u.c5relic || 'Holy Relic',       c.st > (IDX.consecrate_shrines || 20), 's']
            ];
        },
        forgeName() { return (T().ui && T().ui.c5forge) || 'Blackthorn Vampire-Slayer Forge'; },
        storeName() { return (T().ui && T().ui.c5store) || 'Hana\'s Consecrated Elixirs'; }
    };
};
