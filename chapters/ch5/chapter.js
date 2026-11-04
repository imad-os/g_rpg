/* Hollowmere, Chapter 5: The Blood Kingdoms.
 * An interconnected dark gothic horror expansion spanning 7 vampire and undead kingdoms.
 * Features 16 enemy types, 7 principal bosses + 3 brides, multi-phase mechanics,
 * Blood Moon, Vampire Infection, Holy Shrines, Blood Altars, and Undead Wave Defense. */
HM_CHAPTERS.def.ch5 = function (api) {
    'use strict';
    const TS = api.TS, ART = window.HM_C5_ART, MAPS = window.HM_C5_MAPS, HERO = api.HERO, QD = window.HM_C5_QUESTS || { quests: [] };
    const S = () => api.S, T = () => api.T, C = () => api.S.c5, lines = api.lines;

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

    function eachPages(s, i, who) {
        const l = s.each ? (s.each[api.L] || s.each.en) : null;
        return l && l[i] ? [[who === undefined ? null : who, l[i], null]] : [];
    }

    function objective(lang) {
        const c = C(); if (!c) return '';
        const t = (window.HM_C5_TEXT && window.HM_C5_TEXT[lang]) ? window.HM_C5_TEXT[lang] : window.HM_C5_TEXT.en;
        const e = STEPS[c.st];
        if (!e) return t.ui.c5free;
        const s = e.s, g = s.goal[lang] || s.goal.en;
        return api.txt(g, { n: Math.min(s.n || 0, c.c), m: s.n || 0 });
    }

    function announce() {
        const o = objective(api.L);
        if (window.MyPC && MyPC.announce) MyPC.announce(o);
        api.toast(o);
    }

    function apply(set) {
        if (!set) return;
        const c = C();
        if (set.beacons && c.beacons < set.beacons) {
            c.beacons = set.beacons;
            setTimeout(() => api.toast(api.txt(T().ui.c5beacon || 'A Blood Realm is liberated! ({n}/7)', { n: c.beacons })), 2500);
        }
        if (set.open) {
            c.open[set.open] = true;
            openNow(set.open);
        }
    }

    function openNow(g) {
        const z = api.Z.id;
        if (g === 'dracula' && z === 'c5_village') api.openTiles(21, 1, 'gate');
        else if (g === 'nosferatu' && z === 'c5_village') api.openTiles(0, 15, 'gate');
        else if (g === 'brides' && z === 'c5_village') api.openTiles(45, 15, 'gate');
        else if (g === 'crimson' && z === 'c5_village') api.openTiles(21, 31, 'gate');
        else return;
        api.SND.fx('door'); api.SND.fx('slam'); api.shake = 10;
    }

    function complete(before, after) {
        const c = C(), e = STEPS[c.st]; if (!e) return;
        const s = e.s;
        apply(s.set);
        c.st++; c.c = 0; c.m = 0;
        api.SND.fx('quest'); api.save();
        const pg = (before || []).concat(s.type === 'talk' || s.type === 'choice' ? [] : sayPages(s.say));
        if (pg.length) {
            api.dialogue(pg, () => {
                if (after) after();
                announce();
            });
        } else {
            if (after) after();
            announce();
        }
    }

    /* ---------------- Mechanics State ---------------- */
    let bloodMoon = false, bloodMoonTimer = 0;
    let bloodAltarBuff = 0;
    let infected = false;

    function tickMechanics() {
        if (bloodAltarBuff > 0) bloodAltarBuff--;
        bloodMoonTimer++;
        // Cycle Blood Moon every 3600 frames (~1 minute)
        if (bloodMoonTimer % 3600 === 0) {
            bloodMoon = !bloodMoon;
            if (bloodMoon) {
                api.toast(T().ui.c5bloodMoonActive || '🩸 A Blood Moon rises!');
                api.SND.fx('roar');
            } else {
                api.toast(T().ui.c5bloodMoonFades || 'The Blood Moon fades.');
            }
        }
    }

    /* ---------------- Enemies & Bosses ---------------- */
    function batDraw(x, f, X, Y, w) {
        x.fillStyle = '#1c1420';
        const wing = Math.sin(api.tick * 0.3) * 8;
        x.beginPath();
        x.moveTo(X, Y - 12);
        x.lineTo(X - 16, Y - 12 - wing);
        x.lineTo(X - 8, Y - 6);
        x.lineTo(X + 8, Y - 6);
        x.lineTo(X + 16, Y - 12 - wing);
        x.closePath();
        x.fill();
        // Red glowing eyes
        x.fillStyle = '#ff1e2e';
        x.fillRect(X - 3, Y - 13, 2, 2); x.fillRect(X + 1, Y - 13, 2, 2);
    }

    function thrallDraw(x, f, X, Y, w) {
        x.fillStyle = '#342638';
        x.fillRect(X - 8, Y - 28, 16, 26);
        x.fillStyle = '#9c8e9e';
        x.beginPath(); x.arc(X, Y - 34, 7, 0, 6.28); x.fill();
        x.fillStyle = '#ff2030';
        x.fillRect(X - 3, Y - 36, 2, 2); x.fillRect(X + 1, Y - 36, 2, 2);
    }

    function knightDraw(x, f, X, Y, w) {
        x.fillStyle = '#221a28';
        x.fillRect(X - 10, Y - 32, 20, 30);
        x.fillStyle = '#645474';
        x.fillRect(X - 8, Y - 30, 16, 12);
        x.fillStyle = '#b01828';
        x.fillRect(X - 12, Y - 26, 4, 18); // Blood shield
    }

    function ghoulDraw(x, f, X, Y, w) {
        x.fillStyle = '#243422';
        x.fillRect(X - 9, Y - 26, 18, 24);
        x.fillStyle = '#648858';
        x.beginPath(); x.arc(X, Y - 32, 8, 0, 6.28); x.fill();
        x.fillStyle = '#44ff22';
        x.fillRect(X - 3, Y - 34, 2, 2); x.fillRect(X + 1, Y - 34, 2, 2);
    }

    function walkerDraw(x, f, X, Y, w) {
        x.fillStyle = '#323a32';
        x.fillRect(X - 7, Y - 28, 14, 26);
        x.fillStyle = '#7a8878';
        x.beginPath(); x.arc(X, Y - 34, 7, 0, 6.28); x.fill();
    }

    function crystalDraw(x, f, X, Y, w) {
        x.fillStyle = '#e81e34';
        x.beginPath();
        x.moveTo(X, Y - 36); x.lineTo(X + 14, Y - 18); x.lineTo(X, Y); x.lineTo(X - 14, Y - 18);
        x.closePath();
        x.fill();
        x.globalAlpha = 0.4 + Math.sin(api.tick * 0.1) * 0.2;
        x.drawImage(api.glow('#ff2034'), X - 24, Y - 42, 48, 48);
        x.globalAlpha = 1;
    }

    /* Boss Drawing: Dracula, Orlok, Carmilla, Undying King */
    function draculaDraw(x, f, X, Y, w) {
        const phase = f.hp < (f.d.bossHp || 3000) * 0.5 ? 2 : 1;
        x.fillStyle = '#140c18';
        x.fillRect(X - 12, Y - 38, 24, 36);
        // Crimson velvet cape
        x.fillStyle = '#8e1220';
        x.beginPath(); x.moveTo(X - 14, Y - 36); x.lineTo(X - 22, Y - 6); x.lineTo(X + 22, Y - 6); x.lineTo(X + 14, Y - 36); x.closePath(); x.fill();
        // Head
        x.fillStyle = '#c4b8cc';
        x.beginPath(); x.arc(X, Y - 44, 9, 0, 6.28); x.fill();
        // Eyes
        x.fillStyle = '#ff1828';
        x.fillRect(X - 4, Y - 46, 2, 2); x.fillRect(X + 2, Y - 46, 2, 2);
        // Phase 2 Winged Lord
        if (phase === 2) {
            const wing = Math.sin(api.tick * 0.2) * 12;
            x.fillStyle = '#180e1c';
            x.beginPath();
            x.moveTo(X, Y - 34); x.lineTo(X - 44, Y - 48 - wing); x.lineTo(X - 28, Y - 20); x.closePath(); x.fill();
            x.beginPath();
            x.moveTo(X, Y - 34); x.lineTo(X + 44, Y - 48 - wing); x.lineTo(X + 28, Y - 20); x.closePath(); x.fill();
        }
        x.globalAlpha = 0.35;
        x.drawImage(api.glow('#c81828'), X - 32, Y - 60, 64, 64);
        x.globalAlpha = 1;
    }

    function carmillaDraw(x, f, X, Y, w) {
        const hpPct = f.hp / (f.d.bossHp || 4500);
        const phase = hpPct < 0.35 ? 3 : hpPct < 0.7 ? 2 : 1;
        // Phase 1: Vampire Queen, Phase 2: Winged Empress, Phase 3: Ancient Blood Demon
        if (phase === 1) {
            x.fillStyle = '#8a0c1e';
            x.fillRect(X - 10, Y - 36, 20, 34);
            x.fillStyle = '#ffd700'; // Gold tiara
            x.fillRect(X - 6, Y - 48, 12, 4);
            x.fillStyle = '#f0dce0';
            x.beginPath(); x.arc(X, Y - 42, 8, 0, 6.28); x.fill();
            x.fillStyle = '#ff1e30';
            x.fillRect(X - 3, Y - 44, 2, 2); x.fillRect(X + 1, Y - 44, 2, 2);
        } else if (phase === 2) {
            x.fillStyle = '#640816';
            x.fillRect(X - 12, Y - 38, 24, 36);
            x.fillStyle = '#e0c8cc';
            x.beginPath(); x.arc(X, Y - 44, 9, 0, 6.28); x.fill();
            // Demonic Wings
            const wing = Math.sin(api.tick * 0.25) * 14;
            x.fillStyle = '#3c040e';
            x.beginPath(); x.moveTo(X, Y - 34); x.lineTo(X - 48, Y - 50 - wing); x.lineTo(X - 30, Y - 18); x.closePath(); x.fill();
            x.beginPath(); x.moveTo(X, Y - 34); x.lineTo(X + 48, Y - 50 - wing); x.lineTo(X + 30, Y - 18); x.closePath(); x.fill();
        } else {
            // Phase 3: Ancient Blood Demon
            x.fillStyle = '#44020a';
            x.beginPath(); x.arc(X, Y - 28, 24, 0, 6.28); x.fill();
            // Blood tendrils
            for (let i = 0; i < 6; i++) {
                const ang = i * 1.04 + api.tick * 0.05;
                x.strokeStyle = '#c81024'; x.lineWidth = 4;
                x.beginPath(); x.moveTo(X, Y - 28); x.lineTo(X + Math.cos(ang) * 44, Y - 28 + Math.sin(ang) * 44); x.stroke();
            }
        }
        x.globalAlpha = 0.45;
        x.drawImage(api.glow('#e81830'), X - 40, Y - 68, 80, 80);
        x.globalAlpha = 1;
    }

    function orlokDraw(x, f, X, Y, w) {
        x.fillStyle = '#1e241c';
        x.fillRect(X - 8, Y - 40, 16, 38);
        x.fillStyle = '#9cb094';
        x.beginPath(); x.arc(X, Y - 46, 8, 0, 6.28); x.fill();
        // Long clawed hands
        x.strokeStyle = '#9cb094'; x.lineWidth = 2;
        x.beginPath(); x.moveTo(X - 8, Y - 26); x.lineTo(X - 18, Y - 18); x.stroke();
        x.beginPath(); x.moveTo(X + 8, Y - 26); x.lineTo(X + 18, Y - 18); x.stroke();
        x.globalAlpha = 0.35;
        x.drawImage(api.glow('#44cc33'), X - 28, Y - 56, 56, 56);
        x.globalAlpha = 1;
    }

    function undyingKingDraw(x, f, X, Y, w) {
        x.fillStyle = '#222822';
        x.fillRect(X - 14, Y - 42, 28, 40);
        x.fillStyle = '#d8ded0'; // Skeletal skull
        x.beginPath(); x.arc(X, Y - 48, 10, 0, 6.28); x.fill();
        x.fillStyle = '#c8a424'; // Bone crown
        x.fillRect(X - 8, Y - 60, 16, 6);
        x.globalAlpha = 0.4;
        x.drawImage(api.glow('#34ff64'), X - 36, Y - 66, 72, 72);
        x.globalAlpha = 1;
    }

    function queenDraw(x, f, X, Y, w) {
        x.fillStyle = '#8a1424';
        x.fillRect(X - 10, Y - 36, 20, 34);
        x.fillStyle = '#f2e0e4';
        x.beginPath(); x.arc(X, Y - 42, 8, 0, 6.28); x.fill();
        x.fillStyle = '#ffd700'; x.fillRect(X - 6, Y - 48, 12, 4);
    }

    function ruthvenDraw(x, f, X, Y, w) {
        x.fillStyle = '#181428';
        x.fillRect(X - 10, Y - 38, 20, 36);
        x.fillStyle = '#d8d4ec';
        x.beginPath(); x.arc(X, Y - 44, 8, 0, 6.28); x.fill();
        x.globalAlpha = 0.35;
        x.drawImage(api.glow('#7a60ff'), X - 28, Y - 56, 56, 56);
        x.globalAlpha = 1;
    }

    function brideDraw(x, f, X, Y, w, col) {
        x.fillStyle = col;
        x.fillRect(X - 8, Y - 34, 16, 32);
        x.fillStyle = '#f0e4ea';
        x.beginPath(); x.arc(X, Y - 40, 7, 0, 6.28); x.fill();
        // Wings
        const wing = Math.sin(api.tick * 0.25) * 8;
        x.fillStyle = col;
        x.beginPath(); x.moveTo(X, Y - 30); x.lineTo(X - 26, Y - 40 - wing); x.lineTo(X - 14, Y - 18); x.closePath(); x.fill();
        x.beginPath(); x.moveTo(X, Y - 30); x.lineTo(X + 26, Y - 40 - wing); x.lineTo(X + 14, Y - 18); x.closePath(); x.fill();
    }

    /* ---------------- Foe Updaters ---------------- */
    function bossAI(f, p, d, tx, ty, rw, rh) {
        if (!p) return;
        // Shadow Dash / Teleport when player is far
        if (d > 220 && Math.random() < 0.02) {
            f.x = tx + (Math.random() < 0.5 ? -40 : 40);
            f.y = ty + (Math.random() < 0.5 ? -40 : 40);
            api.SND.fx('blink');
            return;
        }
        api.chase(f, tx, ty, f.d.spd, rw, rh);
    }

    const foeTypes = {
        blood_bat:       { hp: 110, dmg: 16, spd: 1.6,  r: 10, xp: 30, gold: 16, c: '#e82034', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 240) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: batDraw },
        vampire_thrall:  { hp: 140, dmg: 20, spd: 1.35, r: 12, xp: 38, gold: 20, c: '#a02034', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 260) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: thrallDraw },
        vampire_knight:  { hp: 240, dmg: 28, spd: 1.1,  r: 14, xp: 60, gold: 34, c: '#842034', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 260) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: knightDraw },
        blood_wolf:      { hp: 160, dmg: 22, spd: 1.55, r: 13, xp: 42, gold: 22, c: '#741020', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 280) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: thrallDraw },
        blood_maiden:    { hp: 180, dmg: 26, spd: 1.45, r: 12, xp: 50, gold: 28, c: '#c81024', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 260) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: thrallDraw },
        flesh_golem:     { hp: 380, dmg: 38, spd: 0.8,  r: 18, xp: 85, gold: 46, c: '#541c24', kb: 0.1, upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 280) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: knightDraw },
        plague_rat:      { hp: 80,  dmg: 12, spd: 1.8,  r: 9,  xp: 22, gold: 12, c: '#44aa33', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 220) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: batDraw },
        rotting_ghoul:   { hp: 150, dmg: 22, spd: 1.15, r: 12, xp: 40, gold: 20, c: '#338822', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 260) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: ghoulDraw },
        night_stalker:   { hp: 170, dmg: 24, spd: 1.4,  r: 12, xp: 46, gold: 26, c: '#225522', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 260) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: ghoulDraw },
        shadow_assassin: { hp: 190, dmg: 30, spd: 1.4,  r: 12, xp: 55, gold: 30, c: '#6a5494', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 260) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: knightDraw },
        undead_walker:   { hp: 130, dmg: 18, spd: 1.05, r: 11, xp: 32, gold: 16, c: '#667766', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 260) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: walkerDraw },
        undead_runner:   { hp: 120, dmg: 20, spd: 1.6,  r: 11, xp: 36, gold: 18, c: '#778877', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 280) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: walkerDraw },
        bone_archer:     { hp: 110, dmg: 22, spd: 1.1,  r: 11, xp: 34, gold: 18, c: '#a0a8a0', upd: (f, p, d, tx, ty, rw, rh) => { if (p && d < 260) api.chase(f, tx, ty, f.d.spd, rw, rh); else api.wander(f, rw, rh); }, draw: walkerDraw },
        blood_crystal:   { hp: 120, dmg: 0,  spd: 0,    r: 14, xp: 20, gold: 0,  c: '#ff2034', kb: 0, upd: () => {}, draw: crystalDraw },

        // Principal Bosses
        dracula:         { hp: 3200, bossHp: 3200, dmg: 40, spd: 1.25, r: 20, xp: 800, gold: 600, c: '#ff1424', boss: true, kb: 0.1, upd: bossAI, draw: draculaDraw },
        carmilla:        { hp: 4500, bossHp: 4500, dmg: 45, spd: 1.3,  r: 22, xp: 1200, gold: 900, c: '#ff1030', boss: true, kb: 0.08, upd: bossAI, draw: carmillaDraw },
        orlok:           { hp: 2600, bossHp: 2600, dmg: 35, spd: 1.15, r: 18, xp: 650, gold: 450, c: '#44bb33', boss: true, kb: 0.1, upd: bossAI, draw: orlokDraw },
        bride_crimson:   { hp: 2200, bossHp: 2200, dmg: 34, spd: 1.35, r: 17, xp: 550, gold: 380, c: '#cc1024', boss: true, kb: 0.1, upd: bossAI, draw: (x, f, X, Y, w) => brideDraw(x, f, X, Y, w, '#b01020') },
        bride_shadow:    { hp: 2000, bossHp: 2000, dmg: 32, spd: 1.4,  r: 17, xp: 500, gold: 350, c: '#554077', boss: true, kb: 0.1, upd: bossAI, draw: (x, f, X, Y, w) => brideDraw(x, f, X, Y, w, '#44305c') },
        bride_frost:     { hp: 2100, bossHp: 2100, dmg: 33, spd: 1.25, r: 17, xp: 520, gold: 360, c: '#80d8ff', boss: true, kb: 0.1, upd: bossAI, draw: (x, f, X, Y, w) => brideDraw(x, f, X, Y, w, '#64bfe8') },
        blood_queen:     { hp: 2800, bossHp: 2800, dmg: 38, spd: 1.2,  r: 19, xp: 700, gold: 500, c: '#b81228', boss: true, kb: 0.1, upd: bossAI, draw: queenDraw },
        ruthven:         { hp: 2700, bossHp: 2700, dmg: 36, spd: 1.25, r: 18, xp: 680, gold: 480, c: '#6a5494', boss: true, kb: 0.1, upd: bossAI, draw: ruthvenDraw },
        undying_king:    { hp: 3400, bossHp: 3400, dmg: 42, spd: 1.1,  r: 21, xp: 850, gold: 650, c: '#44aa55', boss: true, kb: 0.08, upd: bossAI, draw: undyingKingDraw }
    };

    /* ---------------- Interactions & Hooks ---------------- */
    function interact(p, dist, target) {
        if (!target) return false;
        const c = C();
        // 1. Holy Shrine Interaction (cleanses infection & heals)
        if (target.k === 'shrine' && dist < 48) {
            infected = false;
            p.hp = api.maxHp(p);
            api.SND.fx('heal');
            api.toast(T().ui.c5cleansed || '✨ Divine grace cleanses your spirit!');
            return true;
        }
        // 2. Blood Altar Interaction (temporary +30% attack boost)
        if (target.k === 'altar' && dist < 48) {
            bloodAltarBuff = 1800; // 30 seconds
            api.SND.fx('magic');
            api.toast(T().ui.c5altarBlessing || '🍷 Blood Altar Rite accepted: +30% attack power!');
            return true;
        }
        // 3. Quest steps interaction
        const e = STEPS[c.st];
        if (e && e.s.type === 'interact' && e.s.zone === api.Z.id) {
            const spots = e.s.spots || [];
            for (let i = 0; i < spots.length; i++) {
                const sp = spots[i], dx = p.x - sp[0], dy = p.y - sp[1];
                if (Math.hypot(dx, dy) < 1.8) {
                    c.c++;
                    api.SND.fx('ok');
                    api.dialogue(eachPages(e.s, i), () => {
                        if (c.c >= e.s.n) complete();
                        else announce();
                    });
                    return true;
                }
            }
        }
        return false;
    }

    function onKill(foe) {
        const c = C(), e = STEPS[c.st];
        if (!e) return;
        const s = e.s;
        if (s.type === 'kill' && s.zone === api.Z.id) {
            if (!s.foes || s.foes.indexOf(foe.t) >= 0) {
                c.c++;
                if (c.c >= s.n) complete();
            }
        } else if (s.type === 'boss' && s.zone === api.Z.id && s.boss === foe.t) {
            complete();
        }
    }

    function arrive(zone) {
        const c = C();
        if (c.open.dracula && zone === 'c5_village') api.openTiles(21, 1, 'gate');
        if (c.open.nosferatu && zone === 'c5_village') api.openTiles(0, 15, 'gate');
        if (c.open.brides && zone === 'c5_village') api.openTiles(45, 15, 'gate');
        if (c.open.crimson && zone === 'c5_village') api.openTiles(21, 31, 'gate');

        // Play real soundtrack based on kingdom
        if (window.HM_AUDIO && HM_AUDIO.playTrack) {
            if (zone === 'c5_carmilla' || zone === 'c5_dracula') {
                HM_AUDIO.playTrack('audio/soundtracks/battle.mp3');
            } else if (zone === 'c5_nosferatu' || zone === 'c5_shadow' || zone === 'c5_undying') {
                HM_AUDIO.playTrack('audio/soundtracks/dangeon.mp3');
            } else {
                HM_AUDIO.playTrack('audio/soundtracks/theme.mp3');
            }
        }
    }

    function music(zoneId, zoneDef) {
        if (zoneId === 'c5_carmilla') return 'c5_battle';
        if (zoneId === 'c5_nosferatu' || zoneId === 'c5_shadow' || zoneId === 'c5_undying') return 'c5_dungeon';
        return 'c5_theme';
    }

    return {
        id: 'ch5',
        home: 'c5_village',
        maps: MAPS,
        quests: QD.quests,
        foes: foeTypes,
        foeTypes,
        arrive,
        leave: () => {},
        tick: tickMechanics,
        drawUnder: (x, cx, cy, t) => ART.drawUnder(x, api.Z, cx, cy, t),
        drawOver: (x, cx, cy, t) => ART.drawOver(x, api.Z, cx, cy, t, api.glow),
        interact,
        onKill,
        objective,
        step,
        quest,
        music,
        bossSong: 'c5_battle',
        announce
    };
};

