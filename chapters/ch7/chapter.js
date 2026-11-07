/* Hollowmere, Chapter 7: The Legend of Zelda — Ocarina of Time ("The Symphony of Hyrule").
 * 22 Playable Zones across Hyrule (12 Overworld Regions + 3 Spiritual Stone Dungeons + 6 Adult Sage Temples + Ganon's Tower).
 * Features Playable 12-Song Ocarina of Time System, Master Sword Pedestal of Time, Epona & Crimson Loftwing Mounts,
 * Tier 9 Hylian Weapons/Tunics/Boots, and 3-Phase Final Boss against Ganondorf & Beast Ganon. */
window.HM_C7_POOL = window.HM_C7_POOL || [];

(window.HM_CHAPTERS = window.HM_CHAPTERS || { def: {} }).def.ch7 = function (api) {
    'use strict';
    const TS = api.TS || 32, GT = api.GT || { x: 0, y: 0 };
    const ART = window.HM_C7_ART, MAPS = window.HM_C7_MAPS;
    const QD = window.HM_C7_QUESTS || { quests: [] };

    const S = () => api.S || {};
    const T = () => (typeof api.T === 'function' ? api.T() : api.T) || (window.HM_C7_TEXT && window.HM_C7_TEXT[api.L || 'en']) || {};
    const C = () => {
        const s = S();
        if (s && !s.c7) {
            s.c7 = {
                st: 0, c: 0, m: 0, stones: 0, medallions: 0,
                songs: { zelda_lullaby: 1, epona_song: 1, saria_song: 1, sun_song: 1, song_of_time: 1, song_of_storms: 1 },
                open: {}, seen: {}, waterLevel: 'mid'
            };
        }
        return (s && s.c7) || { st: 0, c: 0, m: 0, stones: 0, medallions: 0, songs: {}, open: {}, seen: {}, waterLevel: 'mid' };
    };

    const lines = (who, key) => {
        if (api.lines) return api.lines(who, key);
        const t = T(), arr = (t.lines && t.lines[key]) || [];
        return arr.map(s => [who, s, null]);
    };
    const loc = o => o ? (o[api.L || 'en'] || o.en || '') : '';
    const txt = (s, v) => api.txt ? api.txt(s || '', v || {}) : String(s || '');

    /* ---------------- 12 Playable Ocarina of Time Melodies ---------------- */
    const OCARINA_SONGS = [
        { id: 'zelda_lullaby',   name: 'Zelda\'s Lullaby',   notes: '◄ ▲ ► ◄ ▲ ►',     warp: null },
        { id: 'epona_song',      name: 'Epona\'s Song',      notes: '▲ ◄ ► ▲ ◄ ►',     warp: null },
        { id: 'saria_song',      name: 'Saria\'s Song',      notes: '▼ ► ◄ ▼ ► ◄',     warp: null },
        { id: 'sun_song',        name: 'Sun\'s Song',        notes: '► ▼ ▲ ► ▼ ▲',     warp: null },
        { id: 'song_of_time',    name: 'Song of Time',       notes: '► A ▼ ► A ▼',     warp: null },
        { id: 'song_of_storms',  name: 'Song of Storms',     notes: 'A ▼ ▲ A ▼ ▲',     warp: null },
        { id: 'minuet_forest',   name: 'Minuet of Forest',   notes: 'A ▲ ◄ ► ◄ ►',     warp: 'c7_kokiri',   wx: 22.5, wy: 7.5 },
        { id: 'bolero_fire',     name: 'Bolero of Fire',     notes: '▼ A ▼ A ► ▼ ► ▼', warp: 'c7_goron',    wx: 22.5, wy: 9.5 },
        { id: 'serenade_water',  name: 'Serenade of Water',  notes: 'A ▼ ► ► ◄',       warp: 'c7_lake',     wx: 22.5, wy: 21.5 },
        { id: 'nocturne_shadow', name: 'Nocturne of Shadow', notes: '◄ ► ► A ◄ ► ▼',   warp: 'c7_kakariko', wx: 37.5, wy: 17.5 },
        { id: 'requiem_spirit',  name: 'Requiem of Spirit',  notes: 'A ▼ A ► ▼ A',     warp: 'c7_desert',   wx: 12.5, wy: 17.5 },
        { id: 'prelude_light',   name: 'Prelude of Light',   notes: '▲ ► ▲ ► ◄ ▲',     warp: 'c7_castle',   wx: 22.5, wy: 12.5 }
    ];

    /* ---------------- Main quests flattened into 120 sequential steps ---------------- */
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
        if (!e) return (t.ui && t.ui.c7free) || 'Peace has returned to Hyrule! All 3 Spiritual Stones, 6 Medallions & Triforce restored!';
        const s = e.s, g = (s.goal && (s.goal[l] || s.goal.en)) || '';
        return txt(g, { n: Math.min(s.n || 0, c.c), m: s.n || 0 });
    }
    function announce() {
        const o = objective(api.L);
        if (window.MyPC && MyPC.announce) MyPC.announce(o);
        if (api.toast) api.toast(o);
    }

    function grantHeroItem(id) {
        if (!id) return;
        const s = S();
        if (['link_costume', 'sheik_costume', 'zelda_costume'].indexOf(id) >= 0) {
            if (!s.costumes) s.costumes = [];
            if (s.costumes.indexOf(id) < 0) s.costumes.push(id);
            return;
        }
        if (api.makeItem && api.giveItem) {
            api.giveItem(0, api.makeItem(id, 3));
        } else if (api.dropGear && api.makeItem && api.P && api.P[0]) {
            api.dropGear(api.P[0].x, api.P[0].y + 12, api.makeItem(id, 3));
        }
    }

    function apply(set) {
        if (!set) return;
        const c = C(), u = T().ui || {}, s = S();
        if (set.stones && c.stones < set.stones) {
            c.stones = set.stones;
            if (api.SND) api.SND.fx('ocarina');
            setTimeout(() => api.toast && api.toast(txt(u.c7stone || '💎 Spiritual Stone recovered! ({n}/3)', { n: c.stones })), 1200);
        }
        if (set.medallions && c.medallions < set.medallions) {
            c.medallions = set.medallions;
            if (api.SND) api.SND.fx('star');
            setTimeout(() => api.toast && api.toast(txt(u.c7medallion || '🏅 Sage Medallion awakened! ({n}/6)', { n: c.medallions })), 1200);
        }
        if (set.song) {
            if (!c.songs) c.songs = {};
            c.songs[set.song] = 1;
            if (api.SND) api.SND.fx('ocarina');
        }
        if (set.item) grantHeroItem(set.item);
        if (set.mount && s.mounts) {
            if (s.mounts.indexOf(set.mount) < 0) s.mounts.push(set.mount);
        }
        if (set.open) {
            if (!c.open) c.open = {};
            c.open[set.open] = true;
        }
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
                let bx = s.at ? s.at[0] * TS : 22 * TS, by = s.at ? s.at[1] * TS : 18 * TS;
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

    function bossDef() {
        const s = step();
        if (s && s.type === 'boss' && api.Z && s.zone === api.Z.id) {
            return { t: s.boss, x: s.at ? s.at[0] : 22.5, y: s.at ? s.at[1] : 10.5, flag: 'c7_' + s.boss };
        }
        return null;
    }

    function wakeBoss() {
        const b = bossDef(); if (!b || !api.spawnFoe) return;
        if (api.boss && api.boss.on && api.boss.t === b.t) return;
        if (api.FOES) {
            for (const f of api.FOES) if (f.on && f.t === b.t && !f.minion) {
                api.boss = f; f.boss = true;
                if (b.t === 'ganondorf' && !f.phase) f.phase = 1;
                return;
            }
        }
        if (S() && b.flag) S()[b.flag] = false;
        const pos = findSpawnPos(b.x * TS, b.y * TS);
        api.boss = api.spawnFoe(b.t, pos[0], pos[1], false);
        if (api.boss) {
            api.boss.boss = true;
            if (b.t === 'ganondorf') api.boss.phase = 1;
            if (api.burst) api.burst(api.boss.x, api.boss.y - 20, 32, '#fde047', 3.2);
            if (api.ringFx) api.ringFx(api.boss.x, api.boss.y, 92, '#ef4444');
        }
    }

    function startStep() {
        const s = step(); if (!s || !api.Z) return;
        const Z = api.Z;
        if (s.type === 'reach' && s.zone === Z.id) return complete();
        if (s.type === 'kill' && s.zone === Z.id) ensureQuestFoes();
        if (s.type === 'boss' && s.zone === Z.id) wakeBoss();
    }

    /* ---------------- Characters of Hyrule ---------------- */
    const LOOK = {
        saria:          { skin: '#ffe0c8', hair: '#22c55e', style: 1, tunic: '#16a34a', trim: '#fde047', pants: '#14532d', shoes: '#78350f', s: 0.98 },
        mido:           { skin: '#f8cca4', hair: '#a16207', style: 0, tunic: '#15803d', trim: '#ca8a04', pants: '#14532d', shoes: '#5c3418', s: 0.96 },
        deku_sprout:    { skin: '#86efac', hair: '#15803d', style: 0, tunic: '#22c55e', trim: '#fde047', pants: '#166534', shoes: '#14532d', s: 0.92 },
        kokiri_smith:   { skin: '#d97706', hair: '#fef08a', style: 0, tunic: '#92400e', trim: '#facc15', pants: '#451a03', shoes: '#292524', s: 1.12 },
        kokiri_tailor:  { skin: '#ffe0c8', hair: '#e2e8f0', style: 1, tunic: '#1e3a8a', trim: '#facc15', pants: '#172554', shoes: '#1e293b', s: 1.02 },
        kokiri_witch:   { skin: '#fdf2f8', hair: '#f472b6', style: 1, tunic: '#db2777', trim: '#fde047', pants: '#831843', shoes: '#500724', s: 1.06 },
        kaepora:        { skin: '#d97706', hair: '#78350f', style: 0, tunic: '#92400e', trim: '#fde047', pants: '#451a03', shoes: '#292524', s: 1.14 },
        malon:          { skin: '#ffe0c8', hair: '#ea580c', style: 1, tunic: '#f8fafc', trim: '#7e22ce', pants: '#3b82f6', shoes: '#78350f', s: 1.02 },
        talon:          { skin: '#f6c29c', hair: '#451a03', style: 0, tunic: '#dc2626', trim: '#fde047', pants: '#1d4ed8', shoes: '#451a03', beard: '#451a03', s: 1.08 },
        ingo:           { skin: '#e2b48c', hair: '#292524', style: 0, tunic: '#65a30d', trim: '#a16207', pants: '#3f6212', shoes: '#451a03', beard: '#292524', s: 1.06 },
        zelda:          { skin: '#fff0e4', hair: '#fde047', style: 1, tunic: '#f472b6', trim: '#facc15', pants: '#ec4899', shoes: '#be185d', s: 1.06, gear: { costume: 'zelda_costume' } },
        impa:           { skin: '#d6b498', hair: '#f8fafc', style: 1, tunic: '#1e3a8a', trim: '#ef4444', pants: '#172554', shoes: '#0f172a', s: 1.10 },
        rauru:          { skin: '#fde8d0', hair: '#f8fafc', style: 0, tunic: '#f59e0b', trim: '#fef08a', pants: '#b45309', shoes: '#78350f', beard: '#f8fafc', s: 1.14 },
        sheik:          { skin: '#f6c8a8', hair: '#fde047', style: 0, tunic: '#1e3a8a', trim: '#ef4444', pants: '#172554', shoes: '#f8fafc', s: 1.06, gear: { costume: 'sheik_costume' } },
        dampe:          { skin: '#a8a29e', hair: '#44403c', style: 0, tunic: '#57534e', trim: '#a16207', pants: '#292524', shoes: '#1c1917', s: 1.04 },
        guru_guru:      { skin: '#f6c29c', hair: '#78350f', style: 0, tunic: '#7e22ce', trim: '#facc15', pants: '#4c1d95', shoes: '#2e1065', s: 1.02 },
        darunia:        { skin: '#b45309', hair: '#fef08a', style: 0, tunic: '#dc2626', trim: '#facc15', pants: '#78350f', shoes: '#451a03', beard: '#fef08a', s: 1.22 },
        biggoron:       { skin: '#92400e', hair: '#fde047', style: 0, tunic: '#b45309', trim: '#facc15', pants: '#78350f', shoes: '#451a03', s: 1.38 },
        king_zora:      { skin: '#7dd3fc', hair: '#0284c7', style: 0, tunic: '#0369a1', trim: '#facc15', pants: '#0c4a6e', shoes: '#082f49', s: 1.24 },
        ruto:           { skin: '#bae6fd', hair: '#38bdf8', style: 1, tunic: '#0284c7', trim: '#fde047', pants: '#0369a1', shoes: '#075985', s: 1.00 },
        lake_scientist: { skin: '#e2d4c4', hair: '#cbd5e1', style: 0, tunic: '#6b21a8', trim: '#38bdf8', pants: '#3b0764', shoes: '#1e1b4b', beard: '#cbd5e1', s: 1.02 },
        nabooru:        { skin: '#b45309', hair: '#dc2626', style: 1, tunic: '#ea580c', trim: '#facc15', pants: '#9a3412', shoes: '#7c2d12', s: 1.08 },
        gerudo_capt:    { skin: '#b45309', hair: '#b91c1c', style: 1, tunic: '#d97706', trim: '#fde047', pants: '#92400e', shoes: '#451a03', s: 1.06 },
        great_fairy:    { skin: '#fdf2f8', hair: '#ec4899', style: 1, tunic: '#f472b6', trim: '#fde047', pants: '#db2777', shoes: '#9d174d', s: 1.18 },
        hylian_envoy:   { skin: '#f6c29c', hair: '#1e293b', style: 0, tunic: '#1d4ed8', trim: '#facc15', pants: '#1e3a8a', shoes: '#0f172a', beard: '#1e293b', s: 1.06 }
    };

    /* ---------------- Rendering & AI Helpers ---------------- */
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
            if (--f.tm <= 0) { f.st = 2; f.tm = 12; if (api.SND) api.SND.fx('swing'); }
        } else if (f.st === 2) {
            if (api.moveEnt(f, f.vx * 5.6, f.vy * 5.6, rw, rh) || --f.tm <= 0) { f.st = 3; f.tm = 18; }
        } else if (--f.tm <= 0) { f.st = 0; f.cd = 50; }
    }

    function archerUpd(f, p, d, tx, ty, rw, rh, sfx) {
        if (!p) return api.wander(f, rw, rh);
        if (d > 185) api.chase(f, tx, ty, f.d.spd, rw, rh);
        else if (d < 90) api.moveEnt(f, -tx * f.d.spd, -ty * f.d.spd, rw, rh);
        if (++f.tm > 62 && d < 265) {
            f.tm = 0;
            api.shot(f.x, f.y - 18, tx * 3.6, ty * 3.6, f.d.dmg, 6, 6, 0);
            if (api.SND) api.SND.fx(sfx || 'fireball');
        }
    }

    function templeBossUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0), phase2 = f.hp < f.max * 0.5;
        api.chase(f, tx, ty, f.d.spd * (phase2 ? 1.25 : 1), rw, rh);
        if (++f.tm > (phase2 ? 46 : 58)) {
            f.tm = 0; f.pt = ((f.pt || 0) + 1) % 3;
            const ang = Math.atan2(p.y - f.y, p.x - f.x);
            if (f.pt === 0) {
                for (let i = -1; i <= 1; i++) {
                    const a = ang + i * 0.26;
                    api.shot(f.x, f.y - 24, Math.cos(a) * 3.8, Math.sin(a) * 3.8, dmg, 7, 8, 0);
                }
                if (api.SND) api.SND.fx('fireball');
            } else if (f.pt === 1) {
                api.hazard(p.x, p.y, 44, 44, dmg, 0, '#f97316');
                if (api.SND) api.SND.fx('slam');
                api.shake = 9;
            } else {
                for (let k = 0; k < 6; k++) {
                    const a = k * 1.0472 + (api.tick || 0) * 0.03;
                    api.shot(f.x, f.y - 22, Math.cos(a) * 3.4, Math.sin(a) * 3.4, dmg - 4, 7, 7, 0);
                }
            }
        }
    }

    /* ---------------- Final Boss: Ganondorf & Beast Ganon (3 Distinct Combat Phases) ---------------- */
    function ganondorfUpd(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        const dmg = f.d.dmg + (f.bonus || 0);
        const u = T().ui || {};
        if (!f.phase) f.phase = 1;

        if (f.hp <= f.max * 0.65 && f.phase < 2) {
            f.phase = 2;
            f.p2 = true;
            if (api.toast) api.toast(u.c7ganonPhase2 || '⚡ GANONDORF PHASE 2 — DARK TRIFORCE SURGE!');
            if (api.ringFx) api.ringFx(f.x, f.y, 115, '#a855f7');
            if (api.burst) api.burst(f.x, f.y - 24, 34, '#facc15', 3.4);
            if (api.SND) api.SND.fx('roar');
            api.shake = 14;
            if (api.minions && api.minions() < 2 && api.spawnFoe) {
                api.spawnFoe('iron_knuckle', f.x - 48, f.y + 24, true);
            }
        }

        if (f.hp <= f.max * 0.32 && f.phase < 3) {
            f.phase = 3;
            f.p3 = true;
            if (api.toast) api.toast(u.c7ganonPhase3 || '🐗 GANON PHASE 3 — DEMON KING BEAST GANON!');
            if (api.ringFx) api.ringFx(f.x, f.y, 145, '#ef4444');
            if (api.burst) api.burst(f.x, f.y - 28, 45, '#dc2626', 4.0);
            if (api.SND) api.SND.fx('roar');
            api.shake = 18;
        }

        const spdMul = f.phase === 3 ? 1.42 : f.phase === 2 ? 1.20 : 1.0;
        api.chase(f, tx, ty, f.d.spd * spdMul, rw, rh);

        const cd = f.phase === 3 ? 36 : f.phase === 2 ? 46 : 56;
        if (++f.tm > cd) {
            f.tm = 0;
            f.pt = ((f.pt || 0) + 1) % 3;
            const ang = Math.atan2(p.y - f.y, p.x - f.x);
            if (f.pt === 0) {
                const n = f.phase === 3 ? 7 : f.phase === 2 ? 5 : 3;
                for (let i = 0; i < n; i++) {
                    const a = ang + (i - (n - 1) / 2) * 0.22;
                    api.shot(f.x, f.y - 28, Math.cos(a) * 4.2, Math.sin(a) * 4.2, dmg, 8, 9, 0);
                }
                if (api.SND) api.SND.fx('magic');
            } else if (f.pt === 1) {
                api.hazard(p.x, p.y, 48, 48, dmg + 6, 0, '#a855f7');
                if (f.phase >= 2) {
                    api.hazard(p.x + 54, p.y, 40, 40, dmg, 0, '#ef4444');
                    api.hazard(p.x - 54, p.y, 40, 40, dmg, 0, '#ef4444');
                }
                if (api.SND) api.SND.fx('slam');
                api.shake = f.phase === 3 ? 15 : 10;
            } else {
                for (let k = 0; k < (f.phase === 3 ? 10 : 6); k++) {
                    const a = (k * 6.2832) / (f.phase === 3 ? 10 : 6);
                    api.shot(f.x, f.y - 24, Math.cos(a) * 3.6, Math.sin(a) * 3.6, dmg - 4, 7, 8, 0);
                }
            }
        }
    }

    function makeFoe(hp, dmg, spd, col1, col2, ranged, fly) {
        return {
            hp, dmg, spd, r: 12, xp: 85, gold: 45, c: col1, fly: !!fly,
            upd(f, p, d, tx, ty, rw, rh) {
                if (ranged) archerUpd(f, p, d, tx, ty, rw, rh, 'fireball');
                else pounceUpd(f, p, d, tx, ty, rw, rh, 84, 245);
            },
            draw(x, f, X, Y) {
                const b = fly ? Math.sin((api.tick || 0) * 0.18 + f.x) * 4 : 0;
                oval(x, X, Y, 11, 4, 'rgba(0,0,0,0.3)');
                oval(x, X, Y - 14 + b, 11, 11, col1);
                oval(x, X, Y - 22 + b, 7, 7, col2);
                x.fillStyle = '#fef08a';
                x.fillRect(X - 4, Y - 23 + b, 2, 2); x.fillRect(X + 2, Y - 23 + b, 2, 2);
                bar(x, f, X, Y - 34);
            }
        };
    }

    function makeBoss(hp, dmg, spd, col1, col2, customDraw) {
        return {
            hp, dmg, spd, r: 20, xp: 850, gold: 600, c: col1, boss: true, kb: 0.08,
            upd: templeBossUpd,
            draw(x, f, X, Y) {
                oval(x, X, Y, 20, 7, 'rgba(0,0,0,0.38)');
                if (customDraw) { customDraw(x, f, X, Y); return; }
                oval(x, X, Y - 22, 20, 20, col1);
                oval(x, X, Y - 34, 12, 11, col2);
                x.fillStyle = '#fde047';
                x.fillRect(X - 6, Y - 36, 4, 4); x.fillRect(X + 2, Y - 36, 4, 4);
            }
        };
    }

    const FOES = {
        deku_baba:     makeFoe(170, 32, 1.35, '#15803d', '#7e22ce', false, false),
        skullwalltula: makeFoe(165, 32, 1.48, '#44403c', '#facc15', false, false),
        mad_scrub:     makeFoe(175, 34, 1.38, '#a16207', '#22c55e', true,  false),
        gohma_larva:   makeFoe(180, 34, 1.52, '#ea580c', '#1e293b', false, false),
        peahat:        makeFoe(195, 36, 1.45, '#65a30d', '#fef08a', false, true),
        stalchild:     makeFoe(185, 35, 1.42, '#cbd5e1', '#475569', false, false),
        poe:           makeFoe(190, 36, 1.46, '#a855f7', '#fde047', true,  true),
        lizalfos:      makeFoe(220, 38, 1.56, '#16a34a', '#dc2626', false, false),
        dodongo:       makeFoe(240, 40, 1.32, '#991b1b', '#f97316', true,  false),
        tektite:       makeFoe(200, 36, 1.60, '#2563eb', '#f97316', false, false),
        beamos:        makeFoe(230, 42, 1.10, '#64748b', '#ef4444', true,  false),
        fire_keese:    makeFoe(180, 38, 1.65, '#ea580c', '#fef08a', false, true),
        octorok:       makeFoe(205, 38, 1.38, '#e11d48', '#38bdf8', true,  false),
        freezard:      makeFoe(235, 40, 1.25, '#38bdf8', '#e0f2fe', true,  false),
        biri:          makeFoe(195, 38, 1.42, '#7dd3fc', '#c084fc', false, true),
        stinger:       makeFoe(210, 40, 1.58, '#0284c7', '#f43f5e', false, true),
        octo_big:      makeFoe(260, 42, 1.40, '#9f1239', '#fda4af', false, false),
        stalfos:       makeFoe(255, 44, 1.48, '#e2e8f0', '#334155', false, false),
        poe_sister:    makeFoe(230, 42, 1.46, '#9333ea', '#f472b6', true,  true),
        floormaster:   makeFoe(240, 44, 1.50, '#312e81', '#a5b4fc', false, false),
        flare_dancer:  makeFoe(250, 45, 1.58, '#f97316', '#fde047', true,  false),
        shell_blade:   makeFoe(235, 42, 1.40, '#0369a1', '#facc15', false, false),
        dark_link:     makeFoe(340, 48, 1.62, '#0f172a', '#ef4444', false, false),
        redead:        makeFoe(250, 44, 1.24, '#57534e', '#292524', false, false),
        gibdo:         makeFoe(265, 45, 1.26, '#d6d3d1', '#78716c', false, false),
        dead_hand:     makeFoe(310, 46, 1.22, '#e7e5e4', '#991b1b', false, false),
        gerudo_thief:  makeFoe(255, 44, 1.58, '#ea580c', '#facc15', false, false),
        leever:        makeFoe(225, 42, 1.52, '#65a30d', '#ca8a04', false, false),
        anubis:        makeFoe(250, 46, 1.40, '#b45309', '#f97316', true,  true),
        iron_knuckle:  makeFoe(330, 50, 1.28, '#475569', '#facc15', false, false),
        dinolfos:      makeFoe(295, 48, 1.55, '#15803d', '#ef4444', true,  false),

        /* ---------------- 9 Dungeon & Temple Bosses ---------------- */
        gohma:         makeBoss(2200, 38, 1.22, '#1e293b', '#f97316'),
        king_dodongo:  makeBoss(2550, 40, 1.18, '#991b1b', '#f97316'),
        barinade:      makeBoss(2800, 42, 1.24, '#7e22ce', '#38bdf8'),
        phantom_ganon: makeBoss(3100, 44, 1.32, '#1e1b4b', '#dc2626'),
        volvagia:      makeBoss(3400, 46, 1.36, '#ea580c', '#fde047'),
        morpha:        makeBoss(3650, 46, 1.30, '#0284c7', '#e11d48'),
        bongo_bongo:   makeBoss(3900, 48, 1.34, '#312e81', '#f43f5e'),
        twinrova:      makeBoss(4200, 50, 1.38, '#1d4ed8', '#dc2626'),
        ganondorf: {
            hp: 5200, dmg: 54, spd: 1.32, r: 22, xp: 1800, gold: 1500, c: '#7f1d1d', boss: true, kb: 0.05,
            upd: ganondorfUpd,
            draw(x, f, X, Y) {
                const phase = f.phase || 1;
                const sc = phase === 3 ? 1.65 : phase === 2 ? 1.35 : 1.15;
                oval(x, X, Y, 20 * sc, 7 * sc, 'rgba(0,0,0,0.42)');
                if (phase === 3) {
                    // Colossal Twin-Greatsword Beast Ganon
                    oval(x, X, Y - 24 * sc, 22 * sc, 20 * sc, '#14532d');
                    oval(x, X, Y - 38 * sc, 16 * sc, 12 * sc, '#dc2626');
                    x.fillStyle = '#fef08a';
                    x.fillRect(X - 16 * sc, Y - 26 * sc, 6 * sc, 10 * sc);
                    x.fillRect(X + 10 * sc, Y - 26 * sc, 6 * sc, 10 * sc);
                    x.fillStyle = '#e2e8f0';
                    x.fillRect(X - 30 * sc, Y - 38 * sc, 6 * sc, 34 * sc);
                    x.fillRect(X + 24 * sc, Y - 38 * sc, 6 * sc, 34 * sc);
                } else {
                    // Ganondorf, King of Evil
                    oval(x, X, Y - 22 * sc, 16 * sc, 20 * sc, '#7f1d1d');
                    oval(x, X, Y - 36 * sc, 11 * sc, 11 * sc, '#3f6212');
                    oval(x, X, Y - 42 * sc, 10 * sc, 6 * sc, '#ea580c');
                    if (ART && ART.drawTriforce) ART.drawTriforce(x, X, Y - 20 * sc, 7 * sc);
                }
            }
        }
    };

    /* ---------------- Side Quests & Boss Drops ---------------- */
    const QUESTS = [
        { id: 'c7_sq_babas',    giver: 'saria',       stage: 1,  type: 'kill', foe: 'deku_baba',     n: 6, gold: 450, xp: 500, gift: 'kokiri_tunic',   reward: { coins: 450, item: 'kokiri_tunic' } },
        { id: 'c7_sq_dodongos', giver: 'darunia',     stage: 20, type: 'kill', foe: 'dodongo',       n: 6, gold: 550, xp: 650, gift: 'goron_tunic',    reward: { coins: 550, item: 'goron_tunic' } },
        { id: 'c7_sq_biggoron', giver: 'biggoron',    stage: 24, type: 'kill', foe: 'lizalfos',      n: 6, gold: 700, xp: 800, gift: 'biggoron_sword', reward: { coins: 700, item: 'biggoron_sword' } },
        { id: 'c7_sq_zora',     giver: 'king_zora',   stage: 36, type: 'kill', foe: 'octorok',       n: 6, gold: 650, xp: 750, gift: 'zora_tunic',     reward: { coins: 650, item: 'zora_tunic' } },
        { id: 'c7_sq_redeads',  giver: 'impa',        stage: 72, type: 'kill', foe: 'redead',        n: 6, gold: 750, xp: 850, gift: 'hover_boots',    reward: { coins: 750, item: 'hover_boots' } },
        { id: 'c7_sq_knuckles', giver: 'nabooru',     stage: 90, type: 'kill', foe: 'iron_knuckle',  n: 4, gold: 900, xp: 1000, gift: 'mirror_helm',   reward: { coins: 900, item: 'mirror_helm' } }
    ];

    const BOSS_GIFT = {
        gohma:         { item: 'kokiri_sword' },
        king_dodongo:  { item: 'hylian_helm' },
        barinade:      { item: 'zora_tunic' },
        phantom_ganon: { item: 'fairy_bow', mount: 'epona' },
        volvagia:      { item: 'megaton_hammer' },
        morpha:        { item: 'iron_boots' },
        bongo_bongo:   { item: 'hover_boots' },
        twinrova:      { item: 'mirror_helm', mount: 'loftwing' },
        ganondorf:     { item: 'sages_staff', mount: 'loftwing' }
    };

    const SHOP_HYRULE = [
        'kokiri_sword', 'master_sword', 'biggoron_sword', 'megaton_hammer', 'fairy_bow', 'sages_staff',
        'hylian_helm', 'mirror_helm', 'kokiri_tunic', 'goron_tunic', 'zora_tunic', 'iron_boots', 'hover_boots'
    ];

    /* ---------------- Playable Ocarina of Time Action ---------------- */
    function playOcarinaSong(songObj) {
        if (!songObj) return;
        const c = C(), s = S();
        if (!c.songs) c.songs = {};
        c.songs[songObj.id] = 1;
        if (api.SND) api.SND.fx('ocarina');
        if (api.P && api.P[0] && api.ringFx) {
            api.ringFx(api.P[0].x, api.P[0].y - 12, 64, '#38bdf8');
        }
        if (api.toast) api.toast('🪈 ' + songObj.name + ' (' + songObj.notes + ')');

        if (songObj.id === 'epona_song') {
            if (s.mounts && s.mounts.indexOf('epona') < 0) s.mounts.push('epona');
            if (api.SND) api.SND.fx('eponaNeigh');
            if (api.toast) api.toast('🐎 Epona hears Epona\'s Song and gallops to your side!');
        } else if (songObj.id === 'zelda_lullaby' && api.Z && api.Z.id === 'c7_t3_water') {
            c.waterLevel = c.waterLevel === 'low' ? 'mid' : c.waterLevel === 'mid' ? 'high' : 'low';
            if (api.toast) api.toast('🌊 Water Temple Cistern level shifted to: ' + c.waterLevel.toUpperCase());
        } else if (songObj.id === 'sun_song' && api.FOES) {
            for (const f of api.FOES) if (f.on) f.cd = 120;
            if (api.toast) api.toast('☀️ Sun\'s Song radiates golden light and stuns nearby undead!');
        }

        // Advance current step if it's an interact/song step in the current zone
        const cur = step();
        if (cur && cur.type === 'interact' && api.Z && cur.zone === api.Z.id && cur.song === songObj.id) {
            complete();
            return;
        }

        if (songObj.warp && api.Z && api.Z.id !== songObj.warp && api.travel) {
            api.travel(songObj.warp, songObj.wx || 22.5, songObj.wy || 22.5);
        }
        if (api.save) api.save();
    }

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
            saria: 'c7sariaIdle',
            mido: 'c7sariaIdle',
            zelda: 'c7zeldaIdle',
            rauru: 'c7rauruIdle',
            sheik: 'c7sheikIdle',
            malon: 'c7malonIdle',
            talon: 'c7malonIdle',
            ingo: 'c7malonIdle',
            darunia: 'c7daruniaIdle',
            biggoron: 'c7biggoronIdle',
            king_zora: 'c7rutoIdle',
            ruto: 'c7rutoIdle',
            lake_scientist: 'c7rutoIdle',
            impa: 'c7impaIdle',
            dampe: 'c7impaIdle',
            guru_guru: 'c7impaIdle',
            nabooru: 'c7nabooruIdle',
            gerudo_capt: 'c7nabooruIdle',
            kaepora: 'c7kaeporaIdle',
            great_fairy: 'c7zeldaIdle',
            hylian_envoy: 'c7envoyIdle'
        }[id];
        return key ? lines(id, key) : null;
    }

    function extras(id, ch) {
        const u = T().ui || {};
        if (id === 'kokiri_smith' || id === 'biggoron') {
            ch.push({ label: u.c7forge || 'Biggoron & Kokiri Master Forge', fn: () => { api.closeDlg(); api.forgeScreen(); } });
        }
        if (id === 'kokiri_tailor') {
            ch.push({ label: 'Hylian Tunic & Costume Boutique (Link, Sheik, Zelda)', fn: () => { api.closeDlg(); if (api.costumeShopScreen) api.costumeShopScreen(0); } });
        }
        if (id === 'kokiri_witch' || id === 'great_fairy') {
            ch.push({ label: u.c7store || 'Great Fairy Potions & Elixirs', fn: () => { api.closeDlg(); api.potionScreen(); } });
        }
        if (id === 'ingo' || id === 'malon') {
            ch.push({ label: 'Lon Lon Stables (Epona & Crimson Loftwing)', fn: () => { api.closeDlg(); if (api.mountScreen) api.mountScreen(0); } });
        }
        // Ocarina of Time songs available from Saria, Sheik, Zelda, Rauru, Malon, Kaepora
        if (['saria', 'sheik', 'zelda', 'rauru', 'malon', 'kaepora'].indexOf(id) >= 0) {
            for (const sg of OCARINA_SONGS) {
                ch.push({
                    label: '🪈 Play ' + sg.name + ' (' + sg.notes + ')' + (sg.warp ? ' [Warp]' : ''),
                    fn: () => { api.closeDlg(); playOcarinaSong(sg); }
                });
            }
        }
        if (id === 'hylian_envoy') {
            ch.push({ label: 'Voyage to Mushroom Kingdom (Chapter 6)', fn: () => { api.closeDlg(); api.travel('c6_village', 22.5, 26.5); } });
            ch.push({ label: 'Sail to Blood Kingdoms (Chapter 5)', fn: () => { api.closeDlg(); api.travel('c5_village', 22.5, 25.5); } });
            ch.push({ label: 'Warp to Hyrule Castle & Temple of Time', fn: () => { api.closeDlg(); api.travel('c7_castle', 22.5, 26.5); } });
            ch.push({ label: 'Warp to Lon Lon Ranch', fn: () => { api.closeDlg(); api.travel('c7_ranch', 22.5, 26.5); } });
            ch.push({ label: 'Warp to Kakariko Village', fn: () => { api.closeDlg(); api.travel('c7_kakariko', 22.5, 26.5); } });
        }
    }

    function news(id) {
        const s = step();
        return !!(s && s.type === 'talk' && s.npc === id && api.Z && s.zone === api.Z.id);
    }

    function visible() { return undefined; }
    function tile(ch) { return ch; }
    function zoneOpen() { return true; }

    function nearPt(p, fx, fy, x, y, r) {
        const d1 = api.dist ? api.dist(fx, fy, x, y) : Math.hypot(fx - x, fy - y);
        const d2 = p ? (api.dist ? api.dist(p.x, p.y, x, y) : Math.hypot(p.x - x, p.y - y)) : 1e9;
        return d1 < (r || 48) || d2 < (r || 48) + 10;
    }

    function interact(p, fx, fy) {
        const Z = api.Z, c = C(), s = step();
        if (!Z) return false;
        // 1. Active main quest interact spots
        if (s && s.zone === Z.id && s.type === 'interact' && s.spots) {
            for (let i = 0; i < s.spots.length; i++) {
                if (c.m & (1 << i)) continue;
                if (!nearPt(p, fx, fy, s.spots[i][0] * TS, s.spots[i][1] * TS, 52)) continue;
                c.m |= 1 << i; c.c++;
                if (api.SND) api.SND.fx(s.song ? 'ocarina' : 'pick');
                if (api.ringFx) api.ringFx(s.spots[i][0] * TS, s.spots[i][1] * TS, 52, '#fde047');
                const pg = eachPages(s, i);
                if (c.c >= (s.n || 1)) complete(pg);
                else {
                    if (api.save) api.save();
                    if (api.say) api.say(pg.length ? pg : [[null, objective(api.L), null]], null, () => api.toast && api.toast(objective(api.L)));
                }
                return true;
            }
        }
        // 2. Interactive Triforce Ocarina Pedestals, Master Sword Pedestal, and Fairy Fountains
        for (const o of Z.c7props || []) {
            if (!nearPt(p, fx, fy, o.cx, o.cy, 52)) continue;
            if (o.k === 'triforce_pad') {
                const sg = OCARINA_SONGS.find(x => x.id === o.song) || OCARINA_SONGS[0];
                playOcarinaSong({ id: sg.id, name: sg.name, notes: sg.notes, warp: null });
                return true;
            }
            if (o.k === 'pedestal') {
                grantHeroItem('master_sword');
                if (api.SND) api.SND.fx('ocarina');
                if (api.ringFx) api.ringFx(o.cx, o.cy, 72, '#60a5fa');
                if (api.toast) api.toast('🗡️ You draw the Master Sword — Blade of Evil\'s Bane!');
                return true;
            }
            if (o.k === 'fairy_fountain' || o.k === 'shrine') {
                if (api.P) for (const q of api.P) if (q.on && api.maxHp) q.hp = api.maxHp(q);
                if (api.SND) api.SND.fx('star');
                if (api.ringFx) api.ringFx(o.cx, o.cy, 58, '#f472b6');
                if (api.toast) api.toast('🧚 Great Fairy Fountain restores all Hearts & Stamina!');
                return true;
            }
        }
        return false;
    }

    function onKill(f) {
        if (api.GT) api.GT.ok = false;
        const s = step(), c = C();
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
        complete();
    }

    const MODS = { take: 0.90, deal: 1.18 };
    function mods() { return MODS; }

    function onZone(id) {
        const s = step();
        if (api.boss && api.boss.on && !(s && s.type === 'boss' && s.boss === api.boss.t)) { api.boss.on = false; api.boss = null; }
        if (s && s.type === 'boss' && s.zone === id) wakeBoss();
        ensureQuestFoes();
    }

    function arrive(id) {
        const c = C(), s = step();
        if (id === 'c7_kokiri' && !c.seen.arrive) {
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
        if (s.at) { GT.x = s.at[0] * TS; GT.y = s.at[1] * TS; return true; }
        return false;
    }

    function journal() {
        const q = quest(); if (!q) return null;
        const c = C();
        let done = 0; for (const e of STEPS) if (e.q === q && IDX[e.s.id] < c.st) done++;
        return {
            act: q.act,
            title: loc(q.title),
            story: loc(q.story),
            n: done,
            m: q.steps.length,
            all: QD.quests.map(x => [loc(x.title), STEPS.findIndex(e => e.q === x) < c.st, x === q])
        };
    }

    function devUnlockAll() {
        const c = C(), s = S();
        c.stones = 3;
        c.medallions = 6;
        for (const sg of OCARINA_SONGS) c.songs[sg.id] = 1;
        if (s.mounts) {
            if (s.mounts.indexOf('epona') < 0) s.mounts.push('epona');
            if (s.mounts.indexOf('loftwing') < 0) s.mounts.push('loftwing');
        }
        for (const cs of ['link_costume', 'sheik_costume', 'zelda_costume']) {
            if (s.costumes && s.costumes.indexOf(cs) < 0) s.costumes.push(cs);
        }
        if (api.save) api.save();
        if (api.toast) api.toast('Unlocked all 3 Spiritual Stones, 6 Medallions, 12 Ocarina Songs, Epona & Loftwing!');
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
        id: 'ch7', home: 'c7_kokiri', maps: MAPS, quests: QUESTS, pool: window.HM_C7_POOL, chests: {}, looks: LOOK,
        foes: FOES, foeTypes: FOES,
        shop: SHOP_HYRULE,
        talkers: {
            saria: 1, mido: 1, kaepora: 1, malon: 1, talon: 1, ingo: 1,
            zelda: 1, impa: 1, rauru: 1, sheik: 1, dampe: 1, guru_guru: 1,
            darunia: 1, biggoron: 1, king_zora: 1, ruto: 1, lake_scientist: 1,
            nabooru: 1, gerudo_capt: 1, great_fairy: 1, hylian_envoy: 1
        },
        noWolf: false, preload: false, solid: '^PkLcGRBq#', hard: 1,
        parent: {
            c7_d1_deku: 'c7_kokiri', c7_t1_forest: 'c7_kokiri',
            c7_field: 'c7_kokiri', c7_ranch: 'c7_field',
            c7_castle: 'c7_field', c7_t6_castle: 'c7_castle', c7_t7_tower: 'c7_t6_castle',
            c7_kakariko: 'c7_field', c7_t4_shadow: 'c7_kakariko',
            c7_trail: 'c7_kakariko', c7_d2_dodongo: 'c7_trail',
            c7_goron: 'c7_trail', c7_t2_fire: 'c7_goron',
            c7_river: 'c7_field', c7_zora: 'c7_river', c7_d3_jabu: 'c7_zora',
            c7_lake: 'c7_field', c7_t3_water: 'c7_lake',
            c7_gerudo: 'c7_field', c7_desert: 'c7_gerudo', c7_t5_spirit: 'c7_desert'
        },
        dust: {
            c7_kokiri: '#4ade80', c7_field: '#86efac', c7_ranch: '#fde047', c7_castle: '#cbd5e1',
            c7_kakariko: '#d6d3d1', c7_trail: '#f97316', c7_goron: '#ef4444',
            c7_river: '#38bdf8', c7_zora: '#7dd3fc', c7_lake: '#38bdf8',
            c7_gerudo: '#f59e0b', c7_desert: '#fde047',
            c7_d1_deku: '#4ade80', c7_d2_dodongo: '#f97316', c7_d3_jabu: '#38bdf8',
            c7_t1_forest: '#22c55e', c7_t2_fire: '#ef4444', c7_t3_water: '#38bdf8',
            c7_t4_shadow: '#a855f7', c7_t5_spirit: '#f59e0b', c7_t6_castle: '#ef4444', c7_t7_tower: '#facc15'
        },
        treasures: {
            c7_kokiri: 2, c7_field: 2, c7_ranch: 2, c7_castle: 2, c7_kakariko: 2,
            c7_trail: 2, c7_goron: 2, c7_river: 2, c7_zora: 2, c7_lake: 2,
            c7_gerudo: 2, c7_desert: 2, c7_d1_deku: 2, c7_d2_dodongo: 2, c7_d3_jabu: 2,
            c7_t1_forest: 2, c7_t2_fire: 2, c7_t3_water: 2, c7_t4_shadow: 2, c7_t5_spirit: 2,
            c7_t6_castle: 2, c7_t7_tower: 2
        },
        beasts: Object.keys(FOES),
        songs: ['c7_kokiri', 'c7_field', 'c7_castle', 'c7_goron', 'c7_zora', 'c7_gerudo', 'c7_dungeon', 'c7_boss'],
        bossSong: 'c7_boss',
        start() { C(); },
        stop() {},
        build(Z, def) { ART.build(Z, def, api); },
        drawUnder(x, cx, cy, t) { ART.drawUnder(x, api.Z, cx, cy, t); },
        drawOver(x, cx, cy, t) { ART.drawOver(x, api.Z, cx, cy, t, api.glow); },
        objective, story, idle, extras, news, visible, tile, interact, onKill, bossDown, onZone, arrive, update, target, mods, journal, zoneOpen,
        ensureQuestFoes, devUnlockAll, devSkipStep, playOcarinaSong,
        whatNext() { return objective(api.L); },
        stageOf() { return C().st || 0; },
        music(zone) {
            if (api.boss && api.boss.on && api.boss.active) return 'c7_boss';
            const def = MAPS[zone];
            return (def && def.song) || 'c7_kokiri';
        },
        lanternLit() { return (C().medallions || 0) >= 6; },
        gems() { const s = (C().stones || 0) + (C().medallions || 0); return (s >= 1 ? 1 : 0) | (s >= 3 ? 2 : 0) | (s >= 6 ? 4 : 0) | (s >= 9 ? 8 : 0); },
        relics() {
            const c = C();
            return [
                ['Three Spiritual Stones', (c.stones || 0) >= 3, 'g'],
                ['Forest, Fire & Water Medallions', (c.medallions || 0) >= 3, 'b'],
                ['Shadow, Spirit & Light Medallions', (c.medallions || 0) >= 6, 's']
            ];
        },
        forgeName() { return (T().ui && T().ui.c7forge) || 'Biggoron & Kokiri Master Forge'; },
        storeName() { return (T().ui && T().ui.c7store) || 'Great Fairy Potion & Elixir Sanctuary'; }
    };
};
