/* Hollowmere, Chapter 6: Super Mario — Kingdoms of Wonder.
 * 2.5D Action-Adventure RPG expansion across 6 Wonder Kingdoms (19 maps total).
 * Features Super Mushroom 1.5x Giant Mode, Toadette's Costume Boutique, Question Blocks,
 * 6 Princess rescues, 6 Royal Stars, and a 3-Phase Final Boss battle against Bowser (THE KING -> THE DESTROYER -> RAGE). */
window.HM_C6_POOL = window.HM_C6_POOL || [];

HM_CHAPTERS.def.ch6 = function (api) {
    'use strict';
    const TS = api.TS || 32, GT = api.GT || { x: 0, y: 0 };
    const ART = window.HM_C6_ART, MAPS = window.HM_C6_MAPS, HERO = api.HERO || window.HM_HERO;
    const QD = window.HM_C6_QUESTS || { quests: [] };

    const S = () => api.S || {};
    const T = () => (typeof api.T === 'function' ? api.T() : api.T) || (window.HM_C6_TEXT && window.HM_C6_TEXT[api.L || 'en']) || {};
    const C = () => {
        const s = S();
        if (s && !s.c6) s.c6 = { st: 0, c: 0, m: 0, stars: 0, open: {}, seen: {}, blocks: {}, rescued: {} };
        return (s && s.c6) || { st: 0, c: 0, m: 0, stars: 0, open: {}, seen: {}, blocks: {}, rescued: {} };
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
        if (!e) return (t.ui && t.ui.c6free) || 'All 6 Kingdoms of Wonder are saved!';
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
        if (set.stars && c.stars < set.stars) {
            c.stars = set.stars;
            if (api.SND) api.SND.fx('star');
            setTimeout(() => api.toast && api.toast(txt(u.c6star || 'Royal Star recovered! ({n}/6)', { n: c.stars })), 1500);
        }
        if (set.rescued) {
            c.rescued[set.rescued] = 1;
            if (api.SND) api.SND.fx('rescue');
        }
        if (set.open) {
            c.open[set.open] = true;
            openNow(set.open);
        }
    }

    function openNow(g) {
        if (!api.Z || !api.openTiles) return;
        const z = api.Z.id;
        if (g === 'jungle' && z === 'c6_village') api.openTiles(103, 61, 'gate');
        else if (g === 'boo' && z === 'c6_village') api.openTiles(113, 61, 'gate2');
        else if (g === 'frost' && z === 'c6_m2_village') api.openTiles(113, 61, 'gate2');
        else if (g === 'sky' && z === 'c6_j2_gardens') api.openTiles(113, 61, 'gate2');
        else if (g === 'darkfire' && z === 'c6_b2_mansion') api.openTiles(113, 61, 'gate2');
        else return;
        api.Z.ftx = -1; api.Z.fty = -1; if (api.GT) api.GT.ok = false;
        if (api.SND) { api.SND.fx('door'); api.SND.fx('pipe'); }
        api.shake = 8;
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
            return { t: s.boss, x: s.at ? s.at[0] : 23.5, y: s.at ? s.at[1] : 9.5, flag: 'c6_' + s.boss };
        }
        return null;
    }

    function wakeBoss() {
        const b = bossDef(); if (!b || !api.spawnFoe) return;
        if (api.boss && api.boss.on && api.boss.t === b.t) return;
        if (api.FOES) {
            for (const f of api.FOES) if (f.on && f.t === b.t && !f.minion) {
                api.boss = f; f.boss = true;
                if (b.t === 'bowser' && !f.phase) f.phase = 1;
                return;
            }
        }
        if (S() && b.flag) S()[b.flag] = false;
        const pos = findSpawnPos(b.x * TS, b.y * TS);
        api.boss = api.spawnFoe(b.t, pos[0], pos[1], false);
        if (api.boss) {
            api.boss.boss = true;
            if (b.t === 'bowser') api.boss.phase = 1;
            if (api.burst) api.burst(api.boss.x, api.boss.y - 20, 32, '#ffd700', 3.2);
            if (api.ringFx) api.ringFx(api.boss.x, api.boss.y, 92, '#ff4818');
        }
    }

    /* ---------------- Characters of the Kingdoms of Wonder ---------------- */
    const LOOK = {
        mario:      { skin: '#f6c29c', hair: '#5a2c14', style: 0, tunic: '#e42428', trim: '#ffd700', pants: '#1c54c8', shoes: '#5c3014', beard: '#3a1c0c', s: 1.06, gear: { costume: 'mario_costume' } },
        luigi:      { skin: '#f6c29c', hair: '#5a2c14', style: 0, tunic: '#24b434', trim: '#ffd700', pants: '#183e98', shoes: '#5c3014', beard: '#3a1c0c', s: 1.10, gear: { costume: 'luigi_costume' } },
        peach:      { skin: '#ffe0c8', hair: '#ffe048', style: 1, tunic: '#ff70b4', trim: '#ffd700', pants: '#df428c', shoes: '#d82868', s: 1.06, gear: { costume: 'peach_costume' } },
        daisy:      { skin: '#f8cca4', hair: '#d8681c', style: 1, tunic: '#ffa824', trim: '#48c8a0', pants: '#e07c10', shoes: '#b85c08', s: 1.05, gear: { head: 'royal_tiara', body: 'princess_gown' } },
        eclair:     { skin: '#ffe0c4', hair: '#ffc848', style: 1, tunic: '#58c848', trim: '#ffd700', pants: '#2ea02e', shoes: '#247824', s: 1.05, gear: { head: 'royal_tiara' } },
        shokora:    { skin: '#f4d8ec', hair: '#9858d8', style: 1, tunic: '#7a3cc4', trim: '#ffd700', pants: '#4c2088', shoes: '#32105c', s: 1.05, gear: { head: 'royal_tiara', body: 'starlight_robe' } },
        rosalina:   { skin: '#fff0e4', hair: '#fff4a8', style: 1, tunic: '#48d4e8', trim: '#e8f8ff', pants: '#2ca4c0', shoes: '#c0e8f8', s: 1.10, gear: { head: 'royal_tiara', body: 'starlight_robe' } },
        pauline:    { skin: '#f6c8a8', hair: '#3c1e14', style: 1, tunic: '#d81c2c', trim: '#ffd700', pants: '#9c101c', shoes: '#780812', s: 1.08, gear: { head: 'royal_tiara' } },
        toadette:   { skin: '#ffd8b8', hair: '#ff58a4', style: 1, tunic: '#ff58a4', trim: '#ffffff', pants: '#ffffff', shoes: '#8c4820', s: 0.96, gear: { head: 'mushroom_cap' } },
        capt_toad:  { skin: '#ffd8b8', hair: '#e82428', style: 0, tunic: '#2458d8', trim: '#ffd700', pants: '#ffffff', shoes: '#8c4820', s: 0.96, gear: { head: 'mushroom_cap', body: 'plumber_overalls' } },
        toad_smith: { skin: '#ffd8b8', hair: '#2458d8', style: 0, tunic: '#8c4820', trim: '#ffd700', pants: '#ffffff', shoes: '#5c3014', s: 0.98, gear: { head: 'mushroom_cap' } },
        toad_shop:  { skin: '#ffd8b8', hair: '#24b434', style: 0, tunic: '#24b434', trim: '#ffd700', pants: '#ffffff', shoes: '#5c3014', s: 0.96, gear: { head: 'mushroom_cap' } },
        salladhor:  { skin: '#8d5836', hair: '#1e1816', style: 0, tunic: '#6a1838', trim: '#ffd24a', pants: '#2e1628', shoes: '#201218', cape: '#481028', beard: '#1e1816' }
    };

    /* ---------------- Rendering & AI Helpers ---------------- */
    const near = f => api.nearest ? api.nearest(f.x, f.y) : (api.P && api.P[0]);
    function towards(f, p) { const d = (api.dist ? api.dist(p.x, p.y, f.x, f.y) : Math.hypot(p.x - f.x, p.y - f.y)) || 1; f.vx = (p.x - f.x) / d; f.vy = (p.y - f.y) / d; }
    function oval(x, X, Y, rx, ry, col) { x.fillStyle = col; x.beginPath(); x.ellipse(X, Y, rx, ry, 0, 0, 6.2832); x.fill(); }
    function bar(x, f, X, Y) { if (f.hp >= f.max) return; x.fillStyle = '#000'; x.fillRect(X - 15, Y, 30, 4); x.fillStyle = '#ff3848'; x.fillRect(X - 14, Y + 1, 28 * Math.max(0, f.hp) / f.max, 2); }

    function pounceUpd(f, p, d, tx, ty, rw, rh, range, chaseFar) {
        if (f.cd > 0) f.cd--;
        if (f.st === 0) {
            if (p && d < chaseFar) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh);
            if (p && d < range && f.cd <= 0) { f.st = 1; f.tm = 16; towards(f, p); }
        } else if (f.st === 1) {
            if (f.tm > 5 && p) towards(f, p);
            if (--f.tm <= 0) { f.st = 2; f.tm = 12; if (api.SND) api.SND.fx('shell'); }
        } else if (f.st === 2) {
            if (api.moveEnt(f, f.vx * 5.6, f.vy * 5.6, rw, rh) || --f.tm <= 0) { f.st = 3; f.tm = 18; }
        } else if (--f.tm <= 0) { f.st = 0; f.cd = 50; }
    }

    function archerUpd(f, p, d, tx, ty, rw, rh, sfx) {
        if (!p) return api.wander(f, rw, rh);
        if (d > 185) api.chase(f, tx, ty, f.d.spd, rw, rh);
        else if (d < 90) api.moveEnt(f, -tx * f.d.spd, -ty * f.d.spd, rw, rh);
        if (++f.tm > 64 && d < 260) {
            f.tm = 0;
            api.shot(f.x, f.y - 18, tx * 3.5, ty * 3.5, f.d.dmg, 6, 6, 0);
            if (api.SND) api.SND.fx(sfx || 'fireball');
        }
    }

    /* ---------------- 6 Kingdom Boss AI Routines ---------------- */
    function kingBobombUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0), phase2 = f.hp < f.max * 0.5;
        api.chase(f, tx, ty, f.d.spd * (phase2 ? 1.25 : 1), rw, rh);
        if (++f.tm > (phase2 ? 48 : 62)) {
            f.tm = 0; f.pt = ((f.pt || 0) + 1) % 3;
            if (f.pt === 0) {
                api.hazard(p.x, p.y, 44, 44, dmg, 0, '#ff6818');
                if (api.SND) api.SND.fx('boom');
                api.shake = 10;
            } else if (f.pt === 1) {
                const ang = Math.atan2(p.y - f.y, p.x - f.x);
                for (let i = -1; i <= 1; i++) {
                    const a = ang + i * 0.32;
                    api.shot(f.x, f.y - 24, Math.cos(a) * 3.4, Math.sin(a) * 3.4, dmg - 4, 7, 8, 0);
                }
                if (api.SND) api.SND.fx('fireball');
            } else if (api.minions && api.minions() < 3) {
                api.spawnFoe('bobomb', f.x - 36, f.y + 18, true);
                api.spawnFoe('bobomb', f.x + 36, f.y + 18, true);
            }
        }
    }

    function peteyUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0), phase2 = f.hp < f.max * 0.5;
        api.chase(f, tx, ty, f.d.spd * (phase2 ? 1.22 : 1), rw, rh);
        if (++f.tm > (phase2 ? 50 : 64)) {
            f.tm = 0; f.pt = ((f.pt || 0) + 1) % 3;
            const ang = Math.atan2(p.y - f.y, p.x - f.x);
            if (f.pt === 0) {
                for (let i = -2; i <= 2; i++) {
                    const a = ang + i * 0.25;
                    api.shot(f.x, f.y - 26, Math.cos(a) * 3.3, Math.sin(a) * 3.3, dmg - 4, 7, 8, 0);
                }
                if (api.SND) api.SND.fx('spit');
            } else if (f.pt === 1) {
                api.hazard(p.x, p.y, 44, 44, dmg, 0, '#58d838');
                if (api.SND) api.SND.fx('slam');
                api.shake = 9;
            } else if (api.minions && api.minions() < 3) {
                api.spawnFoe('nipper', f.x - 34, f.y + 16, true);
                api.spawnFoe('nipper', f.x + 34, f.y + 16, true);
            }
        }
    }

    function kingBooUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0), phase2 = f.hp < f.max * 0.55;
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (++f.tm > (phase2 ? 48 : 60)) {
            f.tm = 0; f.pt = ((f.pt || 0) + 1) % 3;
            if (f.pt === 0) {
                for (let k = 0; k < 6; k++) {
                    const a = k * 1.0472 + (api.tick || 0) * 0.03;
                    api.shot(f.x, f.y - 24, Math.cos(a) * 3.4, Math.sin(a) * 3.4, dmg - 4, 7, 7, 0);
                }
                if (api.SND) api.SND.fx('boo');
            } else if (f.pt === 1) {
                const a = Math.random() * 6.2832;
                const nx = p.x + Math.cos(a) * 80, ny = p.y + Math.sin(a) * 80;
                if (!api.feetSolid || !api.feetSolid(nx, ny)) {
                    if (api.ringFx) api.ringFx(f.x, f.y, 50, '#78f0ff');
                    f.x = nx; f.y = ny;
                    if (api.ringFx) api.ringFx(f.x, f.y, 50, '#78f0ff');
                    if (api.SND) api.SND.fx('boo');
                }
            } else if (api.minions && api.minions() < 3) {
                api.spawnFoe('boo', f.x - 36, f.y + 16, true);
            }
        }
    }

    function kamekUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0), phase2 = f.hp < f.max * 0.55;
        api.chase(f, tx, ty, f.d.spd, rw, rh);
        if (++f.tm > (phase2 ? 46 : 58)) {
            f.tm = 0; f.pt = ((f.pt || 0) + 1) % 3;
            const ang = Math.atan2(p.y - f.y, p.x - f.x);
            if (f.pt === 0) {
                for (let i = -2; i <= 2; i++) {
                    const a = ang + i * 0.22;
                    api.shot(f.x, f.y - 24, Math.cos(a) * 3.8, Math.sin(a) * 3.8, dmg, 7, 8, 0);
                }
                if (api.SND) api.SND.fx('magic');
            } else if (f.pt === 1) {
                api.hazard(p.x, p.y, 42, 42, dmg, 0, '#58d8ff');
                if (api.SND) api.SND.fx('ice');
            } else {
                const a = Math.random() * 6.2832;
                const nx = p.x + Math.cos(a) * 88, ny = p.y + Math.sin(a) * 88;
                if (!api.feetSolid || !api.feetSolid(nx, ny)) { f.x = nx; f.y = ny; }
            }
        }
    }

    function bowserJrUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0), phase2 = f.hp < f.max * 0.55;
        api.chase(f, tx, ty, f.d.spd * (phase2 ? 1.3 : 1), rw, rh);
        if (++f.tm > (phase2 ? 44 : 56)) {
            f.tm = 0; f.pt = ((f.pt || 0) + 1) % 3;
            const ang = Math.atan2(p.y - f.y, p.x - f.x);
            if (f.pt === 0) {
                for (let i = -1; i <= 1; i++) {
                    const a = ang + i * 0.25;
                    api.shot(f.x, f.y - 24, Math.cos(a) * 3.8, Math.sin(a) * 3.8, dmg, 7, 8, 0);
                }
                if (api.SND) api.SND.fx('fireball');
            } else if (f.pt === 1) {
                api.hazard(p.x, p.y, 42, 42, dmg, 0, '#ff5818');
                if (api.SND) api.SND.fx('shell');
                api.shake = 8;
            } else if (api.minions && api.minions() < 3) {
                api.spawnFoe('bullet_bill', f.x - 40, f.y, true);
                api.spawnFoe('bullet_bill', f.x + 40, f.y, true);
            }
        }
    }

    /* ---------------- Final Boss: Bowser (3 Distinct Combat Phases) ---------------- */
    function bowserUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0);
        const u = T().ui || {};
        if (!f.phase) f.phase = 1;

        // Phase 2 Transition: <= 65% HP — THE DESTROYER
        if (f.hp <= f.max * 0.65 && f.phase < 2) {
            f.phase = 2;
            f.p2 = true;
            if (api.toast) api.toast(u.c6bowserPhase2 || 'BOWSER PHASE 2 — THE DESTROYER!');
            if (api.ringFx) api.ringFx(f.x, f.y, 110, '#ff6818');
            if (api.burst) api.burst(f.x, f.y - 24, 34, '#ff7818', 3.4);
            if (api.SND) api.SND.fx('roar');
            api.shake = 14;
            if (api.minions && api.minions() < 3 && api.spawnFoe) {
                api.spawnFoe('koopa_guard', f.x - 48, f.y + 24, true);
                api.spawnFoe('koopa_guard', f.x + 48, f.y + 24, true);
            }
        }

        // Phase 3 Transition: <= 30% HP — RAGE (Giant Bowser)
        if (f.hp <= f.max * 0.30 && f.phase < 3) {
            f.phase = 3;
            f.p3 = true;
            if (api.toast) api.toast(u.c6bowserPhase3 || 'BOWSER PHASE 3 — GIANT RAGE!');
            if (api.ringFx) api.ringFx(f.x, f.y, 140, '#ff1818');
            if (api.burst) api.burst(f.x, f.y - 28, 45, '#ff2020', 4.0);
            if (api.SND) { api.SND.fx('roar'); api.SND.fx('mushroom'); }
            api.shake = 18;
        }

        // Brief exhaustion recovery window in Phase 3 after 3 rage combos
        if (f.exhaustT && f.exhaustT > 0) {
            f.exhaustT--;
            return;
        }

        const spdMul = f.phase === 3 ? 1.38 : f.phase === 2 ? 1.18 : 1.0;
        api.chase(f, tx, ty, f.d.spd * spdMul, rw, rh);

        const cd = f.phase === 3 ? 38 : f.phase === 2 ? 48 : 58;
        if (++f.tm > cd) {
            f.tm = 0;
            f.pt = ((f.pt || 0) + 1) % 3;
            const ang = Math.atan2(p.y - f.y, p.x - f.x);

            if (f.pt === 0) {
                // Fire breath volley (wider & faster in Phases 2 and 3)
                const n = f.phase === 3 ? 7 : f.phase === 2 ? 5 : 3;
                for (let i = 0; i < n; i++) {
                    const a = ang + (i - (n - 1) / 2) * 0.22;
                    api.shot(f.x, f.y - 28, Math.cos(a) * 4.0, Math.sin(a) * 4.0, dmg, 8, 9, 0);
                }
                if (api.SND) api.SND.fx('fireball');
            } else if (f.pt === 1) {
                // Ground stomp / Meteor firestorm
                api.hazard(p.x, p.y, 46, 46, dmg + 4, 0, '#ff3810');
                if (f.phase >= 2) {
                    api.hazard(p.x + 52, p.y, 38, 38, dmg, 0, '#ff5818');
                    api.hazard(p.x - 52, p.y, 38, 38, dmg, 0, '#ff5818');
                }
                if (f.phase === 3) {
                    api.hazard(p.x, p.y + 52, 38, 38, dmg, 0, '#ff1818');
                    api.hazard(p.x, p.y - 52, 38, 38, dmg, 0, '#ff1818');
                }
                if (api.SND) api.SND.fx('slam');
                api.shake = f.phase === 3 ? 14 : 10;
            } else {
                // Spinning shell shockwave / Koopa Guard reinforcements
                for (let k = 0; k < (f.phase === 3 ? 10 : 6); k++) {
                    const a = (k * 6.2832) / (f.phase === 3 ? 10 : 6);
                    api.shot(f.x, f.y - 24, Math.cos(a) * 3.5, Math.sin(a) * 3.5, dmg - 4, 7, 8, 0);
                }
                if (api.SND) api.SND.fx('shell');
                if (f.phase === 2 && api.minions && api.minions() < 2 && api.spawnFoe) {
                    api.spawnFoe('koopa_guard', f.x + 40, f.y + 20, true);
                }
                if (f.phase === 3) {
                    f.exhaustT = 28; // Vulnerability window after Giant Rage combo
                }
            }
        }
    }

    /* ---------------- Foe & Boss Definitions ---------------- */
    function drawBowserModel(x, f, X, Y, s, phase) {
        const rage = phase === 3, p2 = phase >= 2;
        if (rage) {
            oval(x, X, Y - 18 * s, 26 * s, 22 * s, 'rgba(255,35,15,0.28)');
        } else if (p2) {
            oval(x, X, Y - 18 * s, 22 * s, 18 * s, 'rgba(255,110,20,0.20)');
        }
        oval(x, X, Y, 16 * s, 6 * s, 'rgba(0,0,0,0.38)');
        // Spiked Koopa Shell
        oval(x, X, Y - 16 * s, 15 * s, 14 * s, rage ? '#981010' : '#1e7824');
        x.fillStyle = '#fff0c8';
        x.fillRect(X - 11 * s, Y - 26 * s, 4 * s, 4 * s);
        x.fillRect(X + 7 * s, Y - 26 * s, 4 * s, 4 * s);
        x.fillRect(X - 2 * s, Y - 30 * s, 4 * s, 5 * s);
        // Scaly Gold Belly
        oval(x, X, Y - 14 * s, 11 * s, 11 * s, rage ? '#ff9828' : '#f0b828');
        // Head & Snout
        oval(x, X, Y - 28 * s, 10 * s, 9 * s, rage ? '#c82818' : '#4ca434');
        // Crimson Mane & Horns
        x.fillStyle = rage ? '#ff2010' : '#d82820';
        x.fillRect(X - 6 * s, Y - 38 * s, 12 * s, 5 * s);
        x.fillStyle = '#fff0c8';
        x.fillRect(X - 10 * s, Y - 37 * s, 3 * s, 6 * s);
        x.fillRect(X + 7 * s, Y - 37 * s, 3 * s, 6 * s);
        // Glowing Eyes
        x.fillStyle = rage ? '#ffff40' : '#ff2818';
        x.fillRect(X - 5 * s, Y - 30 * s, 3 * s, 3 * s);
        x.fillRect(X + 2 * s, Y - 30 * s, 3 * s, 3 * s);
    }

    const FOES = {
        goomba: {
            hp: 95, dmg: 18, spd: 1.25, r: 11, xp: 35, gold: 18, c: '#a85824',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 68, 220); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 10, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#382010'; x.fillRect(X - 7, Y - 5, 5, 5); x.fillRect(X + 2, Y - 5, 5, 5);
                oval(x, X, Y - 8, 7, 6, '#f4d0a4');
                oval(x, X, Y - 16, 11, 9, '#a85824');
                x.fillStyle = '#fff'; x.fillRect(X - 5, Y - 17, 3, 4); x.fillRect(X + 2, Y - 17, 3, 4);
                x.fillStyle = '#000'; x.fillRect(X - 4, Y - 16, 2, 3); x.fillRect(X + 3, Y - 16, 2, 3);
                bar(x, f, X, Y - 28);
            }
        },
        koopa: {
            hp: 125, dmg: 22, spd: 1.32, r: 12, xp: 44, gold: 22, c: '#28b838',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 76, 230); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.3)');
                oval(x, X, Y - 12, 10, 9, '#28b838');
                oval(x, X, Y - 11, 7, 6, '#ffe058');
                oval(x, X + (f.vx < 0 ? -7 : 7), Y - 20, 6, 6, '#ffd838');
                bar(x, f, X, Y - 30);
            }
        },
        paratroopa: {
            hp: 135, dmg: 24, spd: 1.48, r: 12, xp: 48, gold: 24, c: '#e83838', fly: true,
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 84, 240); },
            draw(x, f, X, Y) {
                const b = Math.sin((api.tick || 0) * 0.2 + f.x) * 4;
                oval(x, X, Y, 10, 3.5, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#ffffff';
                x.fillRect(X - 14, Y - 24 + b, 6, 8); x.fillRect(X + 8, Y - 24 + b, 6, 8);
                oval(x, X, Y - 16 + b, 10, 9, '#e83838');
                oval(x, X, Y - 24 + b, 6, 6, '#ffd838');
                bar(x, f, X, Y - 34);
            }
        },
        piranha: {
            hp: 145, dmg: 26, spd: 0.85, r: 12, xp: 52, gold: 26, c: '#e42428',
            upd(f, p, d, tx, ty, rw, rh) { archerUpd(f, p, d, tx, ty, rw, rh, 'fireball'); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#24a82c'; x.fillRect(X - 3, Y - 14, 6, 14);
                oval(x, X, Y - 20, 11, 10, '#e42428');
                x.fillStyle = '#ffffff';
                x.fillRect(X - 6, Y - 24, 3, 3); x.fillRect(X + 3, Y - 24, 3, 3);
                x.fillRect(X - 7, Y - 18, 14, 3);
                bar(x, f, X, Y - 34);
            }
        },
        bobomb: {
            hp: 130, dmg: 28, spd: 1.42, r: 11, xp: 48, gold: 24, c: '#282c38',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 72, 230); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 10, 4, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#ffd700'; x.fillRect(X - 6, Y - 4, 4, 4); x.fillRect(X + 2, Y - 4, 4, 4);
                oval(x, X, Y - 13, 10, 10, '#222632');
                x.fillStyle = '#ffffff'; x.fillRect(X - 4, Y - 15, 3, 5); x.fillRect(X + 2, Y - 15, 3, 5);
                x.fillStyle = '#ff6818'; oval(x, X, Y - 25, 4, 4, '#ff6818');
                bar(x, f, X, Y - 32);
            }
        },
        nipper: {
            hp: 115, dmg: 22, spd: 1.38, r: 10, xp: 42, gold: 20, c: '#ffffff',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 70, 220); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 9, 3.5, 'rgba(0,0,0,0.28)');
                x.fillStyle = '#28a82c'; x.fillRect(X - 2, Y - 8, 4, 8);
                oval(x, X, Y - 14, 8, 7, '#ffffff');
                x.fillStyle = '#202020'; x.fillRect(X - 5, Y - 16, 10, 3);
                bar(x, f, X, Y - 26);
            }
        },
        wiggler: {
            hp: 185, dmg: 28, spd: 1.35, r: 14, xp: 64, gold: 32, c: '#f8c828',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 80, 240); },
            draw(x, f, X, Y) {
                const angry = f.hp < f.max * 0.6;
                const col = angry ? '#e83828' : '#f8c828';
                oval(x, X, Y, 14, 5, 'rgba(0,0,0,0.3)');
                oval(x, X - 8, Y - 10, 7, 7, col);
                oval(x, X, Y - 12, 8, 8, col);
                oval(x, X + 7, Y - 15, 9, 8, col);
                x.fillStyle = '#ffffff'; oval(x, X + 7, Y - 25, 4, 4, '#ffffff');
                bar(x, f, X, Y - 32);
            }
        },
        monty_mole: {
            hp: 140, dmg: 25, spd: 1.46, r: 11, xp: 52, gold: 26, c: '#8c582c',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 76, 230); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.3)');
                oval(x, X, Y - 12, 10, 10, '#8c582c');
                oval(x, X, Y - 10, 6, 5, '#d8a878');
                x.fillStyle = '#181818'; x.fillRect(X - 6, Y - 16, 12, 3);
                bar(x, f, X, Y - 28);
            }
        },
        swooper: {
            hp: 120, dmg: 24, spd: 1.62, r: 10, xp: 46, gold: 22, c: '#5c3c98', fly: true,
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 84, 240); },
            draw(x, f, X, Y) {
                const b = Math.sin((api.tick || 0) * 0.25 + f.x) * 4;
                oval(x, X, Y, 9, 3, 'rgba(0,0,0,0.24)');
                x.fillStyle = '#5c3c98';
                x.beginPath(); x.moveTo(X - 14, Y - 22 + b); x.lineTo(X + 14, Y - 22 + b); x.lineTo(X, Y - 10 + b); x.closePath(); x.fill();
                oval(x, X, Y - 18 + b, 6, 6, '#7a52c4');
                bar(x, f, X, Y - 30);
            }
        },
        boo: {
            hp: 150, dmg: 28, spd: 1.38, r: 12, xp: 58, gold: 28, c: '#f0f8ff', fly: true,
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 80, 240); },
            draw(x, f, X, Y) {
                const b = Math.sin((api.tick || 0) * 0.14 + f.x) * 3;
                oval(x, X, Y, 10, 3.5, 'rgba(0,0,0,0.22)');
                oval(x, X, Y - 16 + b, 11, 11, '#f0f8ff');
                x.fillStyle = '#181028'; x.fillRect(X - 5, Y - 19 + b, 3, 4); x.fillRect(X + 2, Y - 19 + b, 3, 4);
                x.fillStyle = '#ff3858'; x.fillRect(X - 3, Y - 13 + b, 6, 4);
                bar(x, f, X, Y - 32);
            }
        },
        big_boo: {
            hp: 240, dmg: 34, spd: 1.24, r: 16, xp: 85, gold: 42, c: '#e0f0ff', fly: true,
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 90, 250); },
            draw(x, f, X, Y) {
                const b = Math.sin((api.tick || 0) * 0.12 + f.x) * 4;
                oval(x, X, Y, 14, 5, 'rgba(0,0,0,0.26)');
                oval(x, X, Y - 20 + b, 16, 15, '#e8f4ff');
                x.fillStyle = '#181028'; x.fillRect(X - 7, Y - 24 + b, 4, 5); x.fillRect(X + 3, Y - 24 + b, 4, 5);
                x.fillStyle = '#ff2848'; x.fillRect(X - 5, Y - 16 + b, 10, 5);
                bar(x, f, X, Y - 40);
            }
        },
        dry_bones: {
            hp: 170, dmg: 30, spd: 1.30, r: 12, xp: 64, gold: 32, c: '#dcd8ce',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 78, 240); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.3)');
                oval(x, X, Y - 12, 10, 9, '#b8b4a8');
                oval(x, X, Y - 21, 7, 7, '#ece8de');
                x.fillStyle = '#ff2828'; x.fillRect(X - 4, Y - 22, 2, 2); x.fillRect(X + 2, Y - 22, 2, 2);
                bar(x, f, X, Y - 32);
            }
        },
        peepa: {
            hp: 145, dmg: 27, spd: 1.42, r: 11, xp: 54, gold: 26, c: '#c8e8ff', fly: true,
            upd(f, p, d, tx, ty, rw, rh) { archerUpd(f, p, d, tx, ty, rw, rh, 'boo'); },
            draw(x, f, X, Y) {
                const b = Math.sin((api.tick || 0) * 0.16 + f.x) * 3;
                oval(x, X, Y - 16 + b, 9, 10, '#d8f0ff');
                x.fillStyle = '#ffe058'; oval(x, X, Y - 26 + b, 4, 3, '#ffe058');
                bar(x, f, X, Y - 32);
            }
        },
        shy_guy: {
            hp: 165, dmg: 30, spd: 1.38, r: 11, xp: 62, gold: 30, c: '#e42828',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 76, 235); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 10, 4, 'rgba(0,0,0,0.3)');
                oval(x, X, Y - 13, 10, 10, '#e42828');
                oval(x, X, Y - 14, 7, 7, '#ffffff');
                x.fillStyle = '#181818';
                x.fillRect(X - 4, Y - 16, 2, 3); x.fillRect(X + 2, Y - 16, 2, 3);
                x.fillRect(X - 1, Y - 12, 2, 2);
                bar(x, f, X, Y - 28);
            }
        },
        snow_pokey: {
            hp: 195, dmg: 32, spd: 1.15, r: 13, xp: 70, gold: 35, c: '#eef8ff',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 78, 230); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.28)');
                oval(x, X, Y - 8, 9, 8, '#dceeff');
                oval(x, X, Y - 18, 8, 8, '#eef8ff');
                oval(x, X, Y - 28, 7, 7, '#ffffff');
                x.fillStyle = '#182838'; x.fillRect(X - 4, Y - 30, 2, 3); x.fillRect(X + 2, Y - 30, 2, 3);
                bar(x, f, X, Y - 38);
            }
        },
        ice_bro: {
            hp: 185, dmg: 34, spd: 1.28, r: 12, xp: 72, gold: 36, c: '#38b8ff',
            upd(f, p, d, tx, ty, rw, rh) { archerUpd(f, p, d, tx, ty, rw, rh, 'ice'); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.3)');
                oval(x, X, Y - 13, 10, 11, '#2898e8');
                oval(x, X, Y - 23, 7, 7, '#58d8ff');
                bar(x, f, X, Y - 34);
            }
        },
        cooligan: {
            hp: 160, dmg: 30, spd: 1.65, r: 11, xp: 60, gold: 30, c: '#2c4878',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 86, 240); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.3)');
                oval(x, X, Y - 10, 11, 8, '#2c4878');
                oval(x, X, Y - 9, 7, 5, '#ffffff');
                x.fillStyle = '#101010'; x.fillRect(X - 6, Y - 13, 12, 3);
                bar(x, f, X, Y - 24);
            }
        },
        spiny: {
            hp: 175, dmg: 32, spd: 1.25, r: 12, xp: 66, gold: 32, c: '#d82424',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 72, 230); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.3)');
                oval(x, X, Y - 10, 11, 8, '#d82424');
                x.fillStyle = '#ffffff';
                x.fillRect(X - 7, Y - 18, 3, 4); x.fillRect(X - 1, Y - 19, 3, 4); x.fillRect(X + 5, Y - 18, 3, 4);
                bar(x, f, X, Y - 26);
            }
        },
        lakitu: {
            hp: 180, dmg: 34, spd: 1.48, r: 12, xp: 74, gold: 36, c: '#ffffff', fly: true,
            upd(f, p, d, tx, ty, rw, rh) { archerUpd(f, p, d, tx, ty, rw, rh, 'shell'); },
            draw(x, f, X, Y) {
                const b = Math.sin((api.tick || 0) * 0.15 + f.x) * 3;
                oval(x, X, Y - 20 + b, 7, 7, '#28b838');
                oval(x, X, Y - 12 + b, 13, 9, '#ffffff');
                bar(x, f, X, Y - 32);
            }
        },
        bullet_bill: {
            hp: 155, dmg: 36, spd: 1.78, r: 11, xp: 64, gold: 32, c: '#242830', fly: true,
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 95, 260); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 3.5, 'rgba(0,0,0,0.26)');
                oval(x, X, Y - 14, 12, 8, '#242830');
                x.fillStyle = '#ffffff'; oval(x, X + 4, Y - 15, 3, 3, '#ffffff');
                bar(x, f, X, Y - 28);
            }
        },
        buzzy_beetle: {
            hp: 200, dmg: 32, spd: 1.32, r: 12, xp: 70, gold: 34, c: '#283868',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 76, 230); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.3)');
                oval(x, X, Y - 10, 11, 9, '#283868');
                x.fillStyle = '#ff3838'; x.fillRect(X - 4, Y - 8, 2, 2); x.fillRect(X + 2, Y - 8, 2, 2);
                bar(x, f, X, Y - 24);
            }
        },
        hammer_bro: {
            hp: 210, dmg: 36, spd: 1.30, r: 12, xp: 78, gold: 38, c: '#24882c',
            upd(f, p, d, tx, ty, rw, rh) { archerUpd(f, p, d, tx, ty, rw, rh, 'swing'); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.3)');
                oval(x, X, Y - 13, 10, 11, '#24882c');
                oval(x, X, Y - 23, 7, 7, '#f8d858');
                x.fillStyle = '#1e5820'; x.fillRect(X - 7, Y - 28, 14, 5);
                bar(x, f, X, Y - 34);
            }
        },
        magikoopa: {
            hp: 195, dmg: 38, spd: 1.34, r: 12, xp: 80, gold: 40, c: '#2864d8',
            upd(f, p, d, tx, ty, rw, rh) { archerUpd(f, p, d, tx, ty, rw, rh, 'magic'); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.3)');
                oval(x, X, Y - 13, 10, 11, '#2864d8');
                x.fillStyle = '#2864d8';
                x.beginPath(); x.moveTo(X - 9, Y - 22); x.lineTo(X, Y - 36); x.lineTo(X + 9, Y - 22); x.closePath(); x.fill();
                bar(x, f, X, Y - 38);
            }
        },
        fire_bro: {
            hp: 215, dmg: 38, spd: 1.32, r: 12, xp: 82, gold: 42, c: '#e42818',
            upd(f, p, d, tx, ty, rw, rh) { archerUpd(f, p, d, tx, ty, rw, rh, 'fireball'); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.3)');
                oval(x, X, Y - 13, 10, 11, '#e42818');
                oval(x, X, Y - 23, 7, 7, '#ff9838');
                bar(x, f, X, Y - 34);
            }
        },
        chain_chomp: {
            hp: 250, dmg: 42, spd: 1.52, r: 14, xp: 92, gold: 46, c: '#1c202c',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 92, 250); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 13, 5, 'rgba(0,0,0,0.35)');
                oval(x, X, Y - 15, 14, 14, '#1c202c');
                x.fillStyle = '#ffffff';
                x.fillRect(X - 8, Y - 14, 16, 4);
                x.fillRect(X - 6, Y - 22, 4, 4); x.fillRect(X + 2, Y - 22, 4, 4);
                bar(x, f, X, Y - 34);
            }
        },
        lava_bubble: {
            hp: 165, dmg: 38, spd: 1.55, r: 11, xp: 74, gold: 36, c: '#ff4810', fly: true,
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 84, 240); },
            draw(x, f, X, Y) {
                const b = Math.sin((api.tick || 0) * 0.22 + f.x) * 4;
                oval(x, X, Y - 14 + b, 10, 11, '#ff4810');
                oval(x, X, Y - 14 + b, 6, 7, '#ffe048');
                bar(x, f, X, Y - 30);
            }
        },
        koopa_guard: {
            hp: 235, dmg: 40, spd: 1.38, r: 13, xp: 88, gold: 44, c: '#8c1818',
            upd(f, p, d, tx, ty, rw, rh) { pounceUpd(f, p, d, tx, ty, rw, rh, 82, 245); },
            draw(x, f, X, Y) {
                oval(x, X, Y, 12, 4.5, 'rgba(0,0,0,0.32)');
                oval(x, X, Y - 14, 11, 11, '#8c1818');
                oval(x, X, Y - 24, 8, 8, '#4ca434');
                x.fillStyle = '#ffd700'; x.fillRect(X - 6, Y - 30, 12, 4);
                bar(x, f, X, Y - 36);
            }
        },

        /* ---------------- 6 Kingdom Bosses ---------------- */
        king_bobomb: {
            hp: 1900, dmg: 34, spd: 1.15, r: 20, xp: 450, gold: 320, c: '#242838', boss: true, kb: 0.1,
            upd: kingBobombUpd,
            draw(x, f, X, Y) {
                oval(x, X, Y, 20, 7, 'rgba(0,0,0,0.38)');
                oval(x, X, Y - 22, 20, 20, '#1e2230');
                // Big White Mustache
                oval(x, X - 9, Y - 18, 9, 5, '#ffffff');
                oval(x, X + 9, Y - 18, 9, 5, '#ffffff');
                // Golden Crown
                x.fillStyle = '#ffd700';
                x.beginPath(); x.moveTo(X - 12, Y - 38); x.lineTo(X - 8, Y - 48); x.lineTo(X, Y - 41); x.lineTo(X + 8, Y - 48); x.lineTo(X + 12, Y - 38); x.closePath(); x.fill();
            }
        },
        petey_piranha: {
            hp: 2250, dmg: 36, spd: 1.18, r: 20, xp: 520, gold: 360, c: '#e42428', boss: true, kb: 0.1,
            upd: peteyUpd,
            draw(x, f, X, Y) {
                oval(x, X, Y, 20, 7, 'rgba(0,0,0,0.36)');
                oval(x, X, Y - 16, 14, 14, '#2ea42c');
                // Yellow Petals ring
                oval(x, X, Y - 32, 22, 18, '#ffd828');
                // Red Spotted Head
                oval(x, X, Y - 32, 16, 14, '#e42428');
                x.fillStyle = '#ffffff';
                oval(x, X - 7, Y - 36, 4, 4, '#ffffff');
                oval(x, X + 7, Y - 36, 4, 4, '#ffffff');
                x.fillRect(X - 10, Y - 28, 20, 4);
            }
        },
        king_boo: {
            hp: 2550, dmg: 38, spd: 1.24, r: 20, xp: 580, gold: 400, c: '#f0f8ff', boss: true, fly: true, kb: 0.1,
            upd: kingBooUpd,
            draw(x, f, X, Y) {
                const b = Math.sin((api.tick || 0) * 0.1 + f.x) * 4;
                oval(x, X, Y, 18, 6, 'rgba(0,0,0,0.28)');
                oval(x, X, Y - 24 + b, 20, 19, '#f0f8ff');
                x.fillStyle = '#281038'; x.fillRect(X - 8, Y - 28 + b, 5, 6); x.fillRect(X + 3, Y - 28 + b, 5, 6);
                x.fillStyle = '#ff2858'; x.fillRect(X - 6, Y - 18 + b, 12, 6);
                // Ruby Crown
                x.fillStyle = '#ffd700'; x.fillRect(X - 10, Y - 46 + b, 20, 6);
                oval(x, X, Y - 48 + b, 5, 5, '#ff1838');
            }
        },
        kamek: {
            hp: 2800, dmg: 40, spd: 1.28, r: 18, xp: 640, gold: 440, c: '#2864d8', boss: true, kb: 0.1,
            upd: kamekUpd,
            draw(x, f, X, Y) {
                oval(x, X, Y, 16, 6, 'rgba(0,0,0,0.34)');
                oval(x, X, Y - 18, 14, 15, '#2864d8');
                oval(x, X, Y - 30, 10, 9, '#f8d858');
                x.fillStyle = '#2864d8';
                x.beginPath(); x.moveTo(X - 14, Y - 34); x.lineTo(X, Y - 52); x.lineTo(X + 14, Y - 34); x.closePath(); x.fill();
            }
        },
        bowser_jr: {
            hp: 3150, dmg: 42, spd: 1.34, r: 19, xp: 720, gold: 500, c: '#48b838', boss: true, kb: 0.09,
            upd: bowserJrUpd,
            draw(x, f, X, Y) {
                drawBowserModel(x, f, X, Y, 1.05, 1);
            }
        },
        bowser: {
            hp: 4200, dmg: 48, spd: 1.26, r: 22, xp: 1100, gold: 850, c: '#ff3818', boss: true, kb: 0.06,
            upd: bowserUpd,
            draw(x, f, X, Y) {
                const phase = f.phase || 1;
                const s = phase === 3 ? 1.85 : phase === 2 ? 1.55 : 1.35;
                drawBowserModel(x, f, X, Y, s, phase);
            }
        }
    };

    /* ---------------- Side Quests & Rewards ---------------- */
    const QUESTS = [
        { id: 'c6_goombas', giver: 'luigi',     stage: 1,  type: 'kill', foe: 'goomba',      n: 8, gold: 340, xp: 360, gift: 'wing_cap_helm',     reward: { coins: 340, item: 'wing_cap_helm' } },
        { id: 'c6_piranha', giver: 'capt_toad', stage: 4,  type: 'kill', foe: 'piranha',     n: 6, gold: 380, xp: 400, gift: 'fire_flower_staff', reward: { coins: 380, item: 'fire_flower_staff' } },
        { id: 'c6_boos',    giver: 'toadette',  stage: 8,  type: 'kill', foe: 'boo',         n: 6, gold: 420, xp: 440, gift: 'starlight_robe',    reward: { coins: 420, item: 'starlight_robe' } },
        { id: 'c6_koopas',  giver: 'mario',     stage: 14, type: 'kill', foe: 'hammer_bro',  n: 6, gold: 500, xp: 520, gift: 'super_hammer',      reward: { coins: 500, item: 'super_hammer' } }
    ];

    const BOSS_GIFT = {
        king_bobomb:   { item: 'super_hammer' },
        petey_piranha: { item: 'fire_flower_staff' },
        king_boo:      { item: 'starlight_robe' },
        kamek:         { item: 'mushroom_tunic' },
        bowser_jr:     { item: 'royal_star_plate' },
        bowser:        { item: 'star_rod', mount: 'dragon' }
    };

    const SHOP_TOAD = [
        'star_rod', 'super_hammer', 'fire_flower_staff', 'koopa_bow', 'bullet_blaster',
        'wing_cap_helm', 'royal_star_plate', 'mushroom_tunic', 'starlight_robe', 'plumber_boots'
    ];

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
            mario: 'c6marioIdle',
            luigi: 'c6luigiIdle',
            toadette: 'c6toadetteIdle',
            capt_toad: 'c6captToadIdle',
            toad_smith: 'c6toadSmith',
            toad_shop: 'c6toadShop',
            salladhor: 'c6salladhor',
            daisy: 'c6daisyIdle',
            eclair: 'c6eclairIdle',
            shokora: 'c6shokoraIdle',
            rosalina: 'c6rosalinaIdle',
            pauline: 'c6paulineIdle',
            peach: 'c6peachIdle'
        }[id];
        return key ? lines(id, key) : null;
    }

    function extras(id, ch) {
        const u = T().ui || {}, c = C(), o = c.open || {};
        if (id === 'toadette') {
            ch.push({ label: u.browseCostumes || 'Royal Costume Boutique', fn: () => { api.closeDlg(); if (api.costumeShopScreen) api.costumeShopScreen(0); } });
            if (api.P && api.P[1] && api.P[1].on) {
                ch.push({ label: (u.browseCostumes || 'Royal Costume Boutique') + ' (P2)', fn: () => { api.closeDlg(); if (api.costumeShopScreen) api.costumeShopScreen(1); } });
            }
        }
        if (id === 'toad_smith') ch.push({ label: u.browseForge || 'Star Forge & Gear', fn: () => { api.closeDlg(); api.forgeScreen(); } });
        if (id === 'toad_shop') ch.push({ label: u.browsePotions || 'Super Mushrooms & Potions', fn: () => { api.closeDlg(); api.potionScreen(); } });
        if (id === 'capt_toad' || id === 'mario' || id === 'salladhor') {
            if (api.Z.id !== 'c6_m1_fields') ch.push({ label: u.c6travelMeadows || 'Kingdom 1: Mushroom Meadows', fn: () => { api.closeDlg(); api.travel('c6_m1_fields', 22.5, 29.5); } });
            if (api.Z.id !== 'c6_j1_jungle' && (o.jungle || c.st >= 5)) ch.push({ label: u.c6travelJungle || 'Kingdom 2: Jungle Bloom', fn: () => { api.closeDlg(); api.travel('c6_j1_jungle', 22.5, 29.5); } });
            if (api.Z.id !== 'c6_b1_forest' && (o.boo || c.st >= 9)) ch.push({ label: u.c6travelBoo || 'Kingdom 3: Boo Haunted Kingdom', fn: () => { api.closeDlg(); api.travel('c6_b1_forest', 22.5, 29.5); } });
            if (api.Z.id !== 'c6_f1_valley' && (o.frost || c.st >= 13)) ch.push({ label: u.c6travelFrost || 'Kingdom 4: Frostpeak Kingdom', fn: () => { api.closeDlg(); api.travel('c6_f1_valley', 22.5, 29.5); } });
            if (api.Z.id !== 'c6_s1_clouds' && (o.sky || c.st >= 17)) ch.push({ label: u.c6travelSky || 'Kingdom 5: Koopa Sky Kingdom', fn: () => { api.closeDlg(); api.travel('c6_s1_clouds', 22.5, 29.5); } });
            if (api.Z.id !== 'c6_d1_badlands' && (o.darkfire || c.st >= 21)) ch.push({ label: u.c6travelDarkfire || 'Kingdom 6: Bowser\'s Darkfire', fn: () => { api.closeDlg(); api.travel('c6_d1_badlands', 22.5, 29.5); } });
            if (api.Z.id !== 'c6_village') ch.push({ label: u.c6travelHub || 'Return to Mushroom Kingdom Hub', fn: () => { api.closeDlg(); api.travel('c6_village', 22.5, 21.5); } });
            ch.push({ label: u.c6sailCh7 || 'Voyage to Hyrule (Chapter 7: Ocarina of Time)', fn: () => { api.closeDlg(); if (api.playChapter7) api.playChapter7('c7_kokiri', 22.5, 26.5); else api.travel('c7_kokiri', 22.5, 26.5); } });
            if (id === 'salladhor') {
                ch.push({ label: u.c6sailCh5 || 'Sail to Blood Kingdoms (Chapter 5)', fn: () => { api.closeDlg(); api.travel('c5_village', 22.5, 25.5); } });
            }
        }
    }

    function news(id) {
        const s = step();
        return !!(s && s.type === 'talk' && s.npc === id && api.Z && s.zone === api.Z.id);
    }

    function visible(id) {
        const c = C(), s = step(), z = api.Z && api.Z.id;
        // Rescued princesses appear in the Hub Village around the Star Fountain, and hide in their boss room once rescued
        if (['daisy', 'eclair', 'shokora', 'rosalina', 'pauline', 'peach'].indexOf(id) >= 0) {
            if (z === 'c6_village') return !!(c.rescued && c.rescued[id]);
            if (s && s.type === 'talk' && s.npc === id && s.zone === z) return true;
            return !(c.rescued && c.rescued[id]);
        }
        return undefined;
    }

    function nearPt(p, fx, fy, x, y, r) {
        const d1 = api.dist ? api.dist(fx, fy, x, y) : Math.hypot(fx - x, fy - y);
        const d2 = p ? (api.dist ? api.dist(p.x, p.y, x, y) : Math.hypot(p.x - x, p.y - y)) : 1e9;
        return d1 < (r || 44) || d2 < (r || 44) + 8;
    }

    function triggerQBlock(o) {
        if (!o || o.used) return false;
        const c = C(), u = T().ui || {};
        o.used = true;
        if (o.imgUsed) o.img = o.imgUsed;
        if (o.bkey) c.blocks[o.bkey] = 1;
        if (api.SND) api.SND.fx('qblock');
        if (api.ringFx) api.ringFx(o.cx, o.cy - 12, 38, '#ffd700');
        const reward = (o.p && o.p.item) || 'mushroom';
        if (reward === 'mushroom' && api.dropMushroom) {
            api.dropMushroom(o.cx, o.cy + 18);
            if (api.toast) api.toast(u.c6qblockMushroom || 'Super Mushroom popped from the ? Block!');
        } else {
            if (api.coins) api.coins(o.cx, o.cy + 18, 15);
            if (api.toast) api.toast(u.c6qblockCoins || '? Block granted +15 Gold Coins!');
        }
        if (api.save) api.save();
        return true;
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
                if (api.ringFx) api.ringFx(s.spots[i][0] * TS, s.spots[i][1] * TS, 44, '#ffd700');
                const pg = eachPages(s, i);
                if (c.c >= s.n) complete(pg);
                else {
                    if (api.save) api.save();
                    if (api.say) api.say(pg.length ? pg : [[null, objective(api.L), null]], null, () => api.toast && api.toast(objective(api.L)));
                }
                return true;
            }
        }
        // 2. Question Blocks (? Blocks) & Star Shrines
        for (const o of Z.c6props || []) {
            if (!nearPt(p, fx, fy, o.cx, o.cy, 48)) continue;
            if (o.k === 'qblock' && !o.used) {
                return triggerQBlock(o);
            }
            if (o.k === 'shrine' || o.k === 'star_dais') {
                if (api.P) for (const q of api.P) if (q.on && api.maxHp) q.hp = api.maxHp(q);
                if (api.SND) api.SND.fx('star');
                if (api.ringFx) api.ringFx(o.cx, o.cy, 56, '#ffd700');
                if (api.toast) api.toast(u.c6shrineHeal || 'Star Shrine restores full health!');
                return true;
            }
        }
        return false;
    }

    function onKill(f) {
        if (api.GT) api.GT.ok = false;
        const s = step(), c = C();
        // 12% chance for Chapter 6 enemies to drop a bonus Super Mushroom!
        if (f && !f.boss && api.dropMushroom && Math.random() < 0.12) {
            api.dropMushroom(f.x, f.y);
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
        if (api.dropMushroom) api.dropMushroom(f.x - 20, f.y + 16);
        if (!s || s.type !== 'boss' || s.boss !== f.t) { if (api.save) api.save(); return; }
        complete();
    }

    /* ---------------- Gates, Music & Updates ---------------- */
    function tile(ch) {
        const o = C().open || {}, z = api.Z && api.Z.id;
        if (z === 'c6_village')    return ch === 'g' ? (o.jungle ? '=' : 'g') : ch === 'q' ? (o.boo ? '=' : 'q') : ch;
        if (z === 'c6_m2_village') return ch === 'q' ? (o.frost ? '=' : 'q') : ch;
        if (z === 'c6_j2_gardens') return ch === 'q' ? (o.sky ? '=' : 'q') : ch;
        if (z === 'c6_b2_mansion') return ch === 'q' ? (o.darkfire ? '=' : 'q') : ch;
        return ch;
    }

    function zoneOpen(z) {
        const o = C().open || {}, st = C().st || 0;
        if (z === 'c6_j1_jungle' || z === 'c6_j2_gardens' || z === 'c6_j3_sanctuary') return !!(o.jungle || st >= 5);
        if (z === 'c6_b1_forest' || z === 'c6_b2_mansion' || z === 'c6_b3_hall')      return !!(o.boo || st >= 9);
        if (z === 'c6_f1_valley' || z === 'c6_f2_caverns' || z === 'c6_f3_palace')    return !!(o.frost || st >= 13);
        if (z === 'c6_s1_clouds' || z === 'c6_s2_airship' || z === 'c6_s3_fortress')  return !!(o.sky || st >= 17);
        if (z === 'c6_d1_badlands' || z === 'c6_d2_fortress' || z === 'c6_d3_throne') return !!(o.darkfire || st >= 21);
        return true;
    }

    const MODS = { take: 0.92, deal: 1.15 };
    function mods() { return MODS; }

    function onZone(id) {
        const s = step();
        if (api.boss && api.boss.on && !(s && s.type === 'boss' && s.boss === api.boss.t)) { api.boss.on = false; api.boss = null; }
        if (s && s.type === 'boss' && s.zone === id) wakeBoss();
        ensureQuestFoes();
    }

    function arrive(id) {
        const c = C(), s = step();
        if (id === 'c6_village' && !c.seen.arrive) {
            c.seen.arrive = 1;
            if (api.save) api.save();
            announce();
            return;
        }
        if (s && s.type === 'reach' && s.zone === id) { complete(); return; }
        if (s && s.type === 'boss' && s.zone === id) wakeBoss();
    }

    function update() {
        const s = step();
        if (s && s.type === 'reach' && api.Z && s.zone === api.Z.id) { complete(); return; }
        // Auto-pop Question Blocks (? Blocks) when any player bumps into them or swings near them!
        if (api.Z && api.Z.c6props && api.P) {
            for (const o of api.Z.c6props) {
                if (o.k !== 'qblock' || o.used) continue;
                for (const p of api.P) {
                    if (!p || !p.on) continue;
                    const d = Math.hypot(p.x - o.cx, p.y - o.cy);
                    if (d < 28 || (p.sw > 0 && d < 46)) {
                        triggerQBlock(o);
                        break;
                    }
                }
            }
        }
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
            if (api.boss && api.boss.on) { GT.x = api.boss.x; GT.y = api.boss.y; return true; }
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
        for (const g of ['jungle', 'boo', 'frost', 'sky', 'darkfire']) {
            c.open[g] = true;
            openNow(g);
        }
        c.stars = 6;
        for (const p of ['daisy', 'eclair', 'shokora', 'rosalina', 'pauline', 'peach']) c.rescued[p] = 1;
        if (api.save) api.save();
        if (api.toast) api.toast((T().ui && T().ui.devUnlockAll) || 'Unlocked all 6 Kingdoms of Wonder & Royal Stars!');
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
        id: 'ch6', home: 'c6_village', maps: MAPS, quests: QUESTS, pool: window.HM_C6_POOL, chests: {}, looks: LOOK,
        foes: FOES, foeTypes: FOES,
        shop: SHOP_TOAD,
        talkers: { mario: 1, luigi: 1, toadette: 1, capt_toad: 1, daisy: 1, eclair: 1, shokora: 1, rosalina: 1, pauline: 1, peach: 1 },
        noWolf: true, preload: false, solid: '^PkLcGRBq#', hard: 1,
        parent: {
            c6_m1_fields: 'c6_village', c6_m2_village: 'c6_m1_fields', c6_m3_mountain: 'c6_m2_village',
            c6_j1_jungle: 'c6_village', c6_j2_gardens: 'c6_j1_jungle', c6_j3_sanctuary: 'c6_j2_gardens',
            c6_b1_forest: 'c6_village', c6_b2_mansion: 'c6_b1_forest', c6_b3_hall: 'c6_b2_mansion',
            c6_f1_valley: 'c6_m2_village', c6_f2_caverns: 'c6_f1_valley', c6_f3_palace: 'c6_f2_caverns',
            c6_s1_clouds: 'c6_j2_gardens', c6_s2_airship: 'c6_s1_clouds', c6_s3_fortress: 'c6_s2_airship',
            c6_d1_badlands: 'c6_b2_mansion', c6_d2_fortress: 'c6_d1_badlands', c6_d3_throne: 'c6_d2_fortress'
        },
        dust: {
            c6_village: '#78d858', c6_m1_fields: '#78d858', c6_m2_village: '#78d858', c6_m3_mountain: '#c8a878',
            c6_j1_jungle: '#48b848', c6_j2_gardens: '#48b848', c6_j3_sanctuary: '#48b848',
            c6_b1_forest: '#7858b8', c6_b2_mansion: '#7858b8', c6_b3_hall: '#7858b8',
            c6_f1_valley: '#d8f0ff', c6_f2_caverns: '#a8d8ff', c6_f3_palace: '#d8f0ff',
            c6_s1_clouds: '#fff4c8', c6_s2_airship: '#b88858', c6_s3_fortress: '#fff4c8',
            c6_d1_badlands: '#ff5820', c6_d2_fortress: '#ff5820', c6_d3_throne: '#ff3818'
        },
        treasures: {
            c6_village: 2, c6_m1_fields: 1, c6_m2_village: 1, c6_m3_mountain: 1,
            c6_j1_jungle: 1, c6_j2_gardens: 1, c6_j3_sanctuary: 1,
            c6_b1_forest: 1, c6_b2_mansion: 1, c6_b3_hall: 1,
            c6_f1_valley: 1, c6_f2_caverns: 1, c6_f3_palace: 1,
            c6_s1_clouds: 1, c6_s2_airship: 1, c6_s3_fortress: 1,
            c6_d1_badlands: 1, c6_d2_fortress: 1, c6_d3_throne: 1
        },
        beasts: [
            'goomba', 'koopa', 'paratroopa', 'piranha', 'bobomb', 'nipper', 'wiggler', 'monty_mole', 'swooper',
            'boo', 'big_boo', 'dry_bones', 'peepa', 'shy_guy', 'snow_pokey', 'ice_bro', 'cooligan', 'spiny',
            'lakitu', 'bullet_bill', 'buzzy_beetle', 'hammer_bro', 'magikoopa', 'fire_bro', 'chain_chomp',
            'lava_bubble', 'koopa_guard', 'king_bobomb', 'petey_piranha', 'king_boo', 'kamek', 'bowser_jr', 'bowser'
        ],
        songs: ['c6_village', 'c6_meadow', 'c6_jungle', 'c6_haunted', 'c6_frost', 'c6_sky', 'c6_darkfire', 'c6_boss', 'c6_bowser1', 'c6_bowser2', 'c6_bowser3'],
        bossSong: 'c6_boss',
        songDefs: {
            c6_village:  { root: 261.6, scale: [0, 2, 4, 5, 7, 9, 11, 12], chords: [0, 5, 3, 4], rate: 4.2, beats: 64, pad: 'triangle', lead: 'bell',  drums: 'soft',  echo: 0.25, busy: 0.72, seed: 601 },
            c6_meadow:   { root: 293.7, scale: [0, 2, 4, 5, 7, 9, 11, 12], chords: [0, 4, 5, 3], rate: 4.6, beats: 64, pad: 'triangle', lead: 'flute', drums: 'march', echo: 0.22, busy: 0.78, seed: 603 },
            c6_jungle:   { root: 220.0, scale: [0, 2, 3, 5, 7, 9, 10, 12], chords: [0, 3, 4, 2], rate: 4.4, beats: 64, pad: 'sine',     lead: 'flute', drums: 'tom',   echo: 0.30, busy: 0.75, seed: 607 },
            c6_haunted:  { root: 196.0, scale: [0, 1, 3, 6, 7, 8, 11, 12], chords: [0, 1, 4, 3], rate: 3.2, beats: 48, pad: 'sine',     lead: 'bell',  drums: 'soft',  echo: 0.48, busy: 0.58, seed: 609 },
            c6_frost:    { root: 329.6, scale: [0, 2, 4, 7, 9, 11, 12, 14], chords: [0, 3, 5, 4], rate: 4.0, beats: 64, pad: 'sine',     lead: 'bell',  drums: 'soft',  echo: 0.40, busy: 0.70, seed: 611 },
            c6_sky:      { root: 261.6, scale: [0, 2, 4, 6, 7, 9, 11, 12], chords: [0, 4, 2, 5], rate: 4.8, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'march', echo: 0.25, busy: 0.82, seed: 613 },
            c6_darkfire: { root: 146.8, scale: [0, 1, 4, 5, 7, 8, 10, 12], chords: [0, 5, 1, 4], rate: 4.4, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'war',   echo: 0.22, busy: 0.85, seed: 617 },
            c6_boss:     { root: 164.8, scale: [0, 1, 3, 5, 7, 8, 11, 12], chords: [0, 4, 1, 5], rate: 6.2, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'war',   echo: 0.16, busy: 0.90, seed: 619 },
            c6_bowser1:  { root: 146.8, scale: [0, 1, 3, 5, 7, 8, 11, 12], chords: [0, 5, 1, 4], rate: 5.8, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'war',   echo: 0.18, busy: 0.88, seed: 621 },
            c6_bowser2:  { root: 155.6, scale: [0, 1, 3, 6, 7, 8, 11, 12], chords: [0, 1, 5, 4], rate: 6.6, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'war',   echo: 0.14, busy: 0.92, seed: 623 },
            c6_bowser3:  { root: 164.8, scale: [0, 1, 3, 6, 7, 8, 11, 12], chords: [0, 5, 1, 4], rate: 7.6, beats: 64, pad: 'sawtooth', lead: 'brass', drums: 'war',   echo: 0.10, busy: 0.96, seed: 629 }
        },
        start() { C(); },
        stop() {},
        build(Z, def) { ART.build(Z, def, api); },
        drawUnder(x, cx, cy, t) { ART.drawUnder(x, api.Z, cx, cy, t); },
        drawOver(x, cx, cy, t) { ART.drawOver(x, api.Z, cx, cy, t, api.glow); },
        objective, story, idle, extras, news, visible, tile, interact, onKill, bossDown, onZone, arrive, update, target, mods, journal, zoneOpen,
        ensureQuestFoes, devUnlockAll, devSkipStep,
        whatNext() { return objective(api.L); },
        stageOf() { return C().st || 0; },
        music(zone) {
            if (api.boss && api.boss.on && api.boss.active) {
                if (api.boss.t === 'bowser') {
                    return api.boss.phase === 3 ? 'c6_bowser3' : api.boss.phase === 2 ? 'c6_bowser2' : 'c6_bowser1';
                }
                return 'c6_boss';
            }
            const def = MAPS[zone];
            return (def && def.song) || 'c6_village';
        },
        lanternLit() { return (C().stars || 0) >= 6; },
        gems() { const s = C().stars || 0; return (s >= 1 ? 1 : 0) | (s >= 2 ? 2 : 0) | (s >= 4 ? 4 : 0) | (s >= 6 ? 8 : 0); },
        relics() {
            const c = C(), u = T().ui || {};
            return [
                [u.c6star1 || 'Meadow & Jungle Stars', (c.stars || 0) >= 2, 'b'],
                [u.c6star2 || 'Haunted & Frost Stars', (c.stars || 0) >= 4, 'r'],
                [u.c6star3 || 'Grand Royal Star Crown',(c.stars || 0) >= 6, 's']
            ];
        },
        forgeName() { return (T().ui && T().ui.c6forge) || 'Toad\'s Star Forge'; },
        storeName() { return (T().ui && T().ui.c6store) || 'Toad\'s 1-Up & Mushroom Shop'; }
    };
};
