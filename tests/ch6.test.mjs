import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();

function loadBrowserEnv() {
  const windowObj = {
    HM_VERSION: '6.0.0',
    HM_CHAPTERS: { packs: {}, def: {}, loaded: {} },
    HM_MAPS: {},
    HM_ART: {
      drawChar: () => {},
      char: () => {},
      tile: () => {},
      prop: () => {},
      foe: () => {},
    },
    HM_HERO: {
      looks: [],
      draw: () => {},
      icon: () => {},
    },
    HM_MOUNTART: {},
    HM_AUDIO: {
      ctx: () => null,
      voiceOut: () => null,
      duck: () => {},
      sfx: () => {},
      tone: () => {},
      noise: () => {},
      play: () => {},
      playTrack: () => {},
    },
    document: {
      createElement: () => ({
        width: 64,
        height: 64,
        getContext: () => ({
          fillRect: () => {},
          clearRect: () => {},
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          stroke: () => {},
          moveTo: () => {},
          lineTo: () => {},
          closePath: () => {},
          ellipse: () => {},
          save: () => {},
          restore: () => {},
          translate: () => {},
          scale: () => {},
          rotate: () => {},
          drawImage: () => {},
          quadraticCurveTo: () => {},
          fillText: () => {},
          strokeRect: () => {},
          createRadialGradient: () => ({ addColorStop: () => {} }),
          getImageData: () => ({ data: new Uint8ClampedArray(64 * 64 * 4) }),
          putImageData: () => {}
        })
      })
    },
    Image: class {
      constructor() {
        this.width = 64;
        this.height = 64;
      }
    }
  };
  windowObj.window = windowObj;
  return windowObj;
}

test('mypc-app.json and js/chapters.js register ch6 properly', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'mypc-app.json'), 'utf8'));
  assert.ok(manifest.config.chapters.includes('ch6'), 'config.chapters must include ch6');

  const chaptersJs = fs.readFileSync(path.join(ROOT, 'js/chapters.js'), 'utf8');
  const ctx = loadBrowserEnv();
  vm.createContext(ctx);
  vm.runInContext(chaptersJs, ctx);

  assert.ok(ctx.HM_CHAPTERS.LIST.ch6, 'HM_CHAPTERS.LIST must define ch6');
  assert.equal(ctx.HM_CHAPTERS.LIST.ch6.home, 'c6_village');
  assert.equal(ctx.HM_CHAPTERS.of('c6_village'), 'ch6');
  assert.equal(ctx.HM_CHAPTERS.of('c6_m1_fields'), 'ch6');
  assert.equal(ctx.HM_CHAPTERS.of('c6_d3_throne'), 'ch6');
});

test('chapters/ch6/quests.json has 6 Kingdom quests across 4 acts with complete en, fr, es, ar translations', () => {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'chapters/ch6/quests.json'), 'utf8'));
  assert.ok(Array.isArray(data.quests), 'quests must be an array');
  assert.equal(data.quests.length, 6, 'must define 6 Kingdom main quests');

  for (const q of data.quests) {
    for (const lang of ['en', 'fr', 'es', 'ar']) {
      assert.ok(q.title[lang], `quest ${q.id} missing title in ${lang}`);
      assert.ok(q.story[lang], `quest ${q.id} missing story in ${lang}`);
    }
    for (const s of q.steps) {
      for (const lang of ['en', 'fr', 'es', 'ar']) {
        assert.ok(s.goal[lang], `step ${s.id} in quest ${q.id} missing goal in ${lang}`);
      }
    }
  }
});

test('Cosmetic Costume System & Tier 8 Chapter 6 Gear in js/items.js and js/hero.js', () => {
  const ctx = loadBrowserEnv();
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/items.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/hero.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/i18n.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/i18n_more.js'), 'utf8'), ctx);

  const ITEMS = ctx.HM_ITEMS;
  const HERO = ctx.HM_HERO;
  const SLOTS = ctx.HM_SLOTS;

  assert.ok(SLOTS.includes('costume'), 'HM_SLOTS must include the cosmetic costume slot');

  const costumes = ['mario_costume', 'luigi_costume', 'peach_costume'];
  for (const cid of costumes) {
    assert.ok(ITEMS[cid], `${cid} must exist in HM_ITEMS`);
    assert.equal(ITEMS[cid].slot, 'costume', `${cid} must be in slot 'costume'`);
    assert.equal(ITEMS[cid].cosmetic, true, `${cid} must have cosmetic: true`);
    assert.equal(ITEMS[cid].def, 0, `${cid} must have 0 def (purely cosmetic)`);
    assert.equal(ITEMS[cid].atk, 0, `${cid} must have 0 atk (purely cosmetic)`);
    assert.ok(HERO.COSTUME && HERO.COSTUME[cid], `${cid} must have visual overlay in HM_HERO.COSTUME`);
  }

  const ch6Gear = ['star_rod', 'super_hammer', 'fire_flower_staff', 'koopa_bow', 'bullet_blaster', 'wing_cap_helm', 'royal_star_plate', 'mushroom_tunic', 'starlight_robe', 'plumber_boots'];
  for (const gid of ch6Gear) {
    assert.ok(ITEMS[gid], `Chapter 6 gear ${gid} must exist in HM_ITEMS`);
    assert.equal(ITEMS[gid].tier, 8, `Chapter 6 gear ${gid} must be Tier 8`);
  }
});

test('All 19 Chapter 6 maps build cleanly, Question Blocks pop Super Mushrooms, and all 6 Kingdom quests + 3-Phase Bowser work end-to-end', () => {
  const ctx = loadBrowserEnv();
  ctx.setTimeout = () => 0;
  ctx.clearTimeout = () => {};
  vm.createContext(ctx);
  ctx.HM_C6_QUESTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'chapters/ch6/quests.json'), 'utf8'));
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'chapters/ch6/text.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'chapters/ch6/maps.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'chapters/ch6/art.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'chapters/ch6/chapter.js'), 'utf8'), ctx);

  const MAPS = ctx.HM_C6_MAPS;
  const requiredMaps = [
    'c6_village',
    'c6_m1_fields', 'c6_m2_village', 'c6_m3_mountain',
    'c6_j1_jungle', 'c6_j2_gardens', 'c6_j3_sanctuary',
    'c6_b1_forest', 'c6_b2_mansion', 'c6_b3_hall',
    'c6_f1_valley', 'c6_f2_caverns', 'c6_f3_palace',
    'c6_s1_clouds', 'c6_s2_airship', 'c6_s3_fortress',
    'c6_d1_badlands', 'c6_d2_fortress', 'c6_d3_throne'
  ];
  assert.equal(Object.keys(MAPS).length, 19, 'HM_C6_MAPS must have all 19 playable maps (1 Hub + 18 Kingdom maps)');
  for (const m of requiredMaps) {
    assert.ok(MAPS[m], `Map ${m} must exist in HM_C6_MAPS`);
  }

  const GT = { x: 0, y: 0, ok: false };
  const S = {
    c6: { st: 0, c: 0, m: 0, stars: 0, open: {}, seen: { arrive: 1 }, blocks: {}, rescued: {} },
    opened: {},
    mounts: [],
    sq: {},
    sqc: {}
  };
  const FOES = Array.from({ length: 48 }, () => ({ on: false }));
  let bossRef = null;
  let ch6 = null;
  let mushroomsDropped = 0;

  const api = {
    TS: 32,
    GT,
    S,
    L: 'en',
    TEXT: ctx.HM_C6_TEXT,
    T: () => ctx.HM_C6_TEXT.en,
    Z: null,
    P: [{ x: 24 * 32, y: 18 * 32, on: true, hp: 100 }],
    FOES,
    SND: { fx: () => {}, play: () => {} },
    get boss() { return bossRef; },
    set boss(v) { bossRef = v; },
    dist: (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2),
    txt: (s, v) => String(s || '').replace(/\{(\w+)\}/g, (_, k) => (v && v[k] !== undefined ? v[k] : '')),
    toast: () => {},
    save: () => {},
    openTiles: () => {},
    ringFx: () => {},
    burst: () => {},
    dropGear: () => {},
    dropMushroom: () => { mushroomsDropped++; },
    coins: () => {},
    addToBag: () => {},
    makeItem: (id, r) => ({ id, r }),
    say: (_pg, _ch, cb) => { if (cb) cb(); },
    hop: () => { GT.x = 32; GT.y = 32; return true; },
    feetSolid: () => false,
    qState: (id) => S.sq[id] || 0,
    chase: () => {},
    wander: () => {},
    moveEnt: () => false,
    shot: () => {},
    hazard: () => {},
    minions: () => 0,
    addStatic: (k, img, x, y, base, w, h, extra) => {
      assert.ok(img, `Static prop ${k} must produce a valid cached canvas image`);
      return Object.assign({ k, img, x, y, base, dw: w, dh: h }, extra || {});
    },
    blockOf: () => 1,
    glow: () => ctx.document.createElement('canvas'),
    spawnFoe: (t, x, y, minion) => {
      for (const f of FOES) if (!f.on) {
        const rawD = ch6.foes[t];
        assert.ok(rawD, `Foe type ${t} must be defined in ch6.foes`);
        const d = (minion && rawD.boss) ? Object.assign({}, rawD, { boss: false }) : rawD;
        f.on = true; f.t = t; f.d = d; f.boss = !!d.boss; f.x = x; f.y = y; f.minion = !!minion;
        f.max = f.hp = d.hp; f.tm = 0; f.pt = 0; f.phase = 1;
        return f;
      }
      return null;
    }
  };

  ch6 = ctx.HM_CHAPTERS.def.ch6(api);

  // Build all 19 maps and verify interactive spots and Question Blocks
  for (const [zid, def] of Object.entries(MAPS)) {
    const Z = {
      id: zid,
      def,
      cols: def.rows[0].length,
      rows: def.rows.length,
      block: new Uint8Array(def.rows.length * def.rows[0].length),
      lights: [],
      pots: [],
      chests: [],
      npcs: (def.npcs || []).map(n => ({ id: n.id, x: n.x * 32, y: n.y * 32 }))
    };
    api.Z = Z;
    ch6.build(Z, def);
    assert.ok(Z.ground, `${zid} must produce a pre-rendered ground canvas`);
  }

  // Test hitting a Question Block (? Block) in c6_village pops a Super Mushroom
  {
    const def = MAPS.c6_village;
    const Z = {
      id: 'c6_village',
      def,
      cols: def.rows[0].length,
      rows: def.rows.length,
      block: new Uint8Array(def.rows.length * def.rows[0].length),
      lights: [],
      pots: [],
      chests: []
    };
    api.Z = Z;
    ch6.build(Z, def);
    const qb = Z.c6props.find(p => p.k === 'qblock' && p.p.item === 'mushroom');
    assert.ok(qb, 'c6_village must have a Super Mushroom Question Block');
    const beforeMush = mushroomsDropped;
    assert.ok(ch6.interact({ x: qb.cx, y: qb.cy }, qb.cx, qb.cy), 'Interacting with Question Block must trigger it');
    assert.equal(qb.used, true, 'Question Block must be marked used after being struck');
    assert.equal(mushroomsDropped, beforeMush + 1, 'Mushroom Question Block must pop a Super Mushroom');
  }

  function enterZone(zid) {
    const def = MAPS[zid];
    for (const f of FOES) f.on = false;
    bossRef = null;
    api.Z = {
      id: zid,
      def,
      cols: def.rows[0].length,
      rows: def.rows.length,
      npcs: (def.npcs || []).map(n => ({ id: n.id, x: n.x * 32, y: n.y * 32 })),
      statics: [],
      c6props: []
    };
    for (const f of def.foes || []) api.spawnFoe(f.t, f.x * 32, f.y * 32, false);
    ch6.onZone(zid);
    ch6.arrive(zid);
  }

  function simulateKill(f) {
    f.on = false;
    const isBoss = (f.d.boss || f.boss || f === bossRef) && !f.minion;
    ch6.onKill(f);
    if (isBoss) {
      bossRef = null;
      ch6.bossDown(f);
    }
  }

  const allSteps = [];
  for (const q of ctx.HM_C6_QUESTS.quests) for (const s of q.steps) allSteps.push(s);

  enterZone('c6_village');

  for (let idx = 0; idx < allSteps.length; idx++) {
    const s = allSteps[idx];
    assert.equal(S.c6.st, idx, `Should be at step ${idx} (${s.id})`);
    if (api.Z.id !== s.zone) enterZone(s.zone);
    if (S.c6.st > idx) continue;

    assert.ok(ch6.target(), `Step ${s.id} (${s.type}) must provide a valid target`);

    if (s.type === 'talk') {
      assert.ok(ch6.story(s.npc), `Step ${s.id} talk with ${s.npc} must advance quest`);
    } else if (s.type === 'interact') {
      for (const [sx, sy] of s.spots) {
        const px = sx * 32, py = sy * 32;
        api.P[0].x = px; api.P[0].y = py;
        assert.ok(ch6.interact(api.P[0], px, py), `Step ${s.id} interact at [${sx}, ${sy}] must succeed`);
      }
    } else if (s.type === 'kill') {
      for (let k = 0; k < s.n; k++) {
        assert.ok(ch6.target(), `Step ${s.id} kill ${k + 1}/${s.n} must find or respawn a live foe`);
        const targetFoe = FOES.find(f => f.on && s.foes.includes(f.t) && f.x === GT.x && f.y === GT.y);
        assert.ok(targetFoe, `Step ${s.id} arrow must point to an actual live foe`);
        simulateKill(targetFoe);
      }
    } else if (s.type === 'boss') {
      assert.ok(bossRef && bossRef.on && bossRef.t === s.boss, `Step ${s.id} boss ${s.boss} must be spawned`);
      if (s.boss === 'bowser') {
        bossRef.active = true;
        // Phase 1: THE KING (100% HP)
        assert.equal(bossRef.phase, 1, 'Bowser starts in Phase 1 (THE KING)');
        assert.equal(ch6.music('c6_d3_throne'), 'c6_bowser1');
        // Phase 2: THE DESTROYER (<= 65% HP)
        bossRef.hp = Math.floor(bossRef.max * 0.60);
        bossRef.d.upd(bossRef, api.P[0], 100, 1, 0, 20, 20);
        assert.equal(bossRef.phase, 2, 'Bowser transitions to Phase 2 (THE DESTROYER) at <= 65% HP');
        assert.equal(ch6.music('c6_d3_throne'), 'c6_bowser2');
        // Phase 3: RAGE (< 30% HP)
        bossRef.hp = Math.floor(bossRef.max * 0.25);
        bossRef.d.upd(bossRef, api.P[0], 100, 1, 0, 20, 20);
        assert.equal(bossRef.phase, 3, 'Bowser transitions to Phase 3 (GIANT RAGE) at <= 30% HP');
        assert.equal(ch6.music('c6_d3_throne'), 'c6_bowser3');
      }
      simulateKill(bossRef);
    }

    assert.ok(S.c6.st > idx, `Step ${s.id} (${s.type}) must advance quest stage upon completion`);
  }

  assert.equal(S.c6.st, allSteps.length, 'All Chapter 6 steps must complete cleanly');
  assert.equal(S.c6.stars, 6, 'All 6 Royal Stars must be recovered');
  for (const p of ['daisy', 'eclair', 'shokora', 'rosalina', 'pauline', 'peach']) {
    assert.equal(S.c6.rescued[p], 1, `Princess ${p} must be marked rescued`);
  }
});
