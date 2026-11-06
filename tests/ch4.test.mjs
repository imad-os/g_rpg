import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();

function loadBrowserEnv() {
  const windowObj = {
    HM_VERSION: '4.0.0',
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
          createLinearGradient: () => ({ addColorStop: () => {} }),
        }),
      }),
      getElementById: () => null,
      querySelectorAll: () => [],
      body: { classList: { toggle: () => {}, add: () => {}, remove: () => {} } },
    },
    Image: class { set src(_) {} },
    Audio: class { play() { return Promise.resolve(); } pause() {} },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    fetch: () => Promise.resolve({ ok: false }),
    URL: { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} },
    Math,
    Date,
    Object,
    Array,
    String,
    Number,
    Boolean,
    Map,
    Set,
    Promise,
    RegExp,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    setTimeout: () => 0,
    clearTimeout: () => {},
  };
  windowObj.window = windowObj;
  return vm.createContext(windowObj);
}

function runScript(ctx, relPath) {
  const code = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  vm.runInContext(code, ctx, { filename: relPath });
}

test('mypc-app.json and chapters.js register ch4 pack properly', () => {
  const mypc = JSON.parse(fs.readFileSync(path.join(ROOT, 'mypc-app.json'), 'utf8'));
  assert.ok(mypc.version >= '4.0.0', 'version must be 4.0.0 or higher');
  assert.ok(Array.isArray(mypc.config.chapters), 'config.chapters should be an array');
  assert.ok(mypc.config.chapters.includes('ch4'), 'config.chapters must include ch4');

  const ctx = loadBrowserEnv();
  runScript(ctx, 'js/chapters.js');
  const ch4Pack = ctx.window.HM_CHAPTERS.LIST.ch4;
  assert.ok(ch4Pack, 'HM_CHAPTERS.LIST.ch4 must be registered');
  assert.equal(ch4Pack.home, 'c4_river');
  assert.equal(ch4Pack.data.HM_C4_QUESTS, 'chapters/ch4/quests.json');
  assert.deepEqual(Array.from(ch4Pack.files), [
    'chapters/ch4/text.js',
    'chapters/ch4/maps.js',
    'chapters/ch4/valyria.js',
    'chapters/ch4/art.js',
    'chapters/ch4/chapter.js',
  ]);
});

test('chapters/ch4/quests.json has 8 quests across 4 acts with complete en, fr, es, ar translations', () => {
  const questsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'chapters/ch4/quests.json'), 'utf8'));
  assert.equal(questsData.quests.length, 8, 'Chapter 4 should have 8 main quests');
  const acts = new Set(questsData.quests.map(q => q.act));
  assert.deepEqual([...acts].sort(), [1, 2, 3, 4], 'Quests must span acts 1..4');

  const langs = ['en', 'fr', 'es', 'ar'];
  for (const q of questsData.quests) {
    for (const l of langs) {
      assert.ok(q.title[l] && q.title[l].length > 0, `Quest ${q.id} missing title for ${l}`);
      assert.ok(q.story[l] && q.story[l].length > 0, `Quest ${q.id} missing story for ${l}`);
    }
    assert.ok(Array.isArray(q.steps) && q.steps.length >= 2, `Quest ${q.id} must have steps`);
    for (const st of q.steps) {
      assert.ok(st.zone, `Step ${st.id} in ${q.id} must specify zone`);
      for (const l of langs) {
        assert.ok(st.goal[l] && st.goal[l].length > 0, `Step ${st.id} in ${q.id} missing goal for ${l}`);
      }
    }
  }
});

test('js/items.js defines Tier 5 & Tier 6 weapons/armor, maxUp=8, and shadowmane + frostfang mounts', () => {
  const ctx = loadBrowserEnv();
  runScript(ctx, 'js/items.js');
  const items = ctx.window.HM_ITEMS;
  const loot = ctx.window.HM_LOOT;
  assert.ok(items, 'HM_ITEMS should exist');
  assert.equal(loot.maxUp, 8, 'Forge maxUp must be 8 in Chapter 4');
  assert.ok(loot.bagSize >= 48, 'Bag size should be expanded');

  const expectedItems = [
    'ironwood_axes', 'dothraki_axes', 'valyrian_axes',
    'twin_flintlocks', 'braavosi_pistols', 'golden_pistols',
    'baratheon_hammer', 'stormbreaker',
    'valyrian_blade', 'winters_fang',
    'weirwood_bow', 'wildfire_staff',
    'stark_wolfhelm', 'kingsguard_plate', 'targaryen_scale', 'watch_cloak',
    'dornish_boots', 'valyrian_greaves',
  ];
  for (const id of expectedItems) {
    assert.ok(items[id], `Missing Chapter 4 item: ${id}`);
  }
  assert.equal(items.valyrian_axes.kind, 'axes');
  assert.equal(items.golden_pistols.kind, 'pistols');
  assert.equal(items.stormbreaker.kind, 'hammer');
  assert.equal(items.winters_fang.tier, 6);

  const mounts = ctx.window.HM_MOUNTS;
  assert.ok(mounts.shadowmane, 'shadowmane mount must be defined');
  assert.ok(mounts.frostfang, 'frostfang mount must be defined');
  assert.equal(mounts.shadowmane.trample, true);
  assert.equal(mounts.frostfang.bite, true);
});

test('chapters/ch4 maps, valyria dungeon, art, text, and chapter definition load cleanly and match all quest targets', () => {
  const ctx = loadBrowserEnv();
  runScript(ctx, 'js/i18n.js');
  runScript(ctx, 'js/i18n_more.js');
  runScript(ctx, 'js/i18n_talk.js');
  runScript(ctx, 'js/i18n_pets.js');
  runScript(ctx, 'js/i18n_rift.js');
  runScript(ctx, 'js/i18n_v3.js');
  runScript(ctx, 'js/items.js');
  runScript(ctx, 'js/mounts.js');
  runScript(ctx, 'js/hero.js');
  runScript(ctx, 'js/chapters.js');

  ctx.window.HM_C4_QUESTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'chapters/ch4/quests.json'), 'utf8'));
  runScript(ctx, 'chapters/ch4/text.js');
  runScript(ctx, 'chapters/ch4/maps.js');
  runScript(ctx, 'chapters/ch4/valyria.js');
  runScript(ctx, 'chapters/ch4/art.js');
  runScript(ctx, 'chapters/ch4/chapter.js');

  const maps = ctx.window.HM_C4_MAPS;
  const expectedZones = [
    'c4_river', 'c4_kings', 'c4_storm', 'c4_north', 'c4_essos', 'c4_wall', 'c4_beyond',
    'c4_val1', 'c4_val2', 'c4_val3', 'c4_val4', 'c4_val5',
  ];
  for (const z of expectedZones) {
    assert.ok(maps[z], `Missing Chapter 4 zone: ${z}`);
    assert.ok(maps[z].rows && maps[z].rows.length >= 20, `Zone ${z} rows invalid`);
  }

  // Every quest step zone must exist
  for (const q of ctx.window.HM_C4_QUESTS.quests) {
    for (const st of q.steps) {
      assert.ok(maps[st.zone], `Quest ${q.id} step ${st.id} references unknown zone ${st.zone}`);
      if (st.npc && st.npc !== 'throne' && st.npc !== 'shrine' && st.npc !== 'pedestal') {
        const foundNpc = maps[st.zone].npcs.some(n => n.id === st.npc);
        assert.ok(foundNpc, `Quest ${q.id} step ${st.id} NPC ${st.npc} not found in ${st.zone}`);
      }
    }
  }

  // Verify Chapter 4 definition hooks via factory call
  assert.equal(typeof ctx.window.HM_CHAPTERS.def.ch4, 'function');
  const stateObj = { c4: { st: 0, c: 0, m: 0, beacons: 0, open: {}, rep: {}, gift: {}, seen: {} } };
  const ch4 = ctx.window.HM_CHAPTERS.def.ch4({
    S: stateObj,
    Z: { id: 'c4_river', def: {} },
    L: 'en',
    TEXT: ctx.window.HM_TEXT,
    T: ctx.window.HM_TEXT.en,
    SND: { fx: () => {} },
    P: [{ x: 0, y: 0 }],
    FOES: [],
    openTiles: () => {},
    save: () => {},
    toast: () => {},
    txt: s => s,
    lines: (w, k) => [[w, k]],
  });
  assert.ok(ch4, 'HM_CHAPTERS.def.ch4(api) must return hooks');
  assert.equal(typeof ch4.story, 'function');
  assert.equal(typeof ch4.bossDown, 'function');
  assert.equal(typeof ch4.onKill, 'function');
  assert.equal(typeof ch4.interact, 'function');
  assert.equal(typeof ch4.journal, 'function');
  assert.equal(typeof ch4.devUnlockAll, 'function');
  assert.equal(typeof ch4.devSkipStep, 'function');

  // Verify Chapter 4 soundtrack mapping
  assert.equal(ch4.music('c4_river', {}), 'audio/soundtracks/theme.mp3', 'Default zone should play theme.mp3');
  assert.equal(ch4.music('c4_val1', {}), 'audio/soundtracks/dangeon.mp3', 'Valyria dungeon should play dangeon.mp3');
  assert.equal(ch4.music('c4_val5', {}), 'audio/soundtracks/dangeon.mp3', 'Dungeon depth 5 should play dangeon.mp3');
  assert.equal(ch4.bossSong, 'audio/soundtracks/battle.mp3', 'Boss encounters should play battle.mp3');
  for (const q of ch4.quests) {
    assert.ok(q.reward && q.reward.coins && q.reward.item, `Side quest ${q.id} must have reward.coins and reward.item`);
  }
  for (const l of ['en', 'fr', 'es', 'ar']) {
    assert.ok(ctx.window.HM_TEXT[l].ui.playCh4, `Missing playCh4 in ${l}`);
    assert.ok(ctx.window.HM_TEXT[l].ui.devTools, `Missing devTools in ${l}`);
    assert.ok(ctx.window.HM_TEXT[l].ui.sideQuestLbl, `Missing sideQuestLbl in ${l}`);
  }
  assert.ok(ch4.songDefs && ch4.songDefs.c4_kings && ch4.songDefs.c4_north && ch4.songDefs.c4_beyond);
});

test('audio/voices/<lang>/index.json and .ogg files exist for Chapter 4 scenes in en, fr, es, ar', () => {
  const langs = ['en', 'fr', 'es', 'ar'];
  const requiredClips = [
    'c4arrive-0', 'c4arrive-1', 'c4shadowHi-0', 'c4wyrmHi-0', 'c4visHi-0',
    'c4nkHi-0', 'c4nkScene-0', 'c4ending-0', 'c4ending-2', 'c4ending-3',
    'c4robbIdle-0', 'c4tyrionIdle-0', 'c4daenerysIdle-0', 'c4jonIdle-0',
  ];
  for (const l of langs) {
    const idxPath = path.join(ROOT, 'audio/voices', l, 'index.json');
    assert.ok(fs.existsSync(idxPath), `Missing voice index.json for ${l}`);
    const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
    for (const k of requiredClips) {
      assert.ok(idx.clips[k], `Missing clip ${k} in ${l}/index.json`);
      const oggPath = path.join(ROOT, 'audio/voices', l, idx.clips[k].file);
      assert.ok(fs.existsSync(oggPath), `Missing .ogg file ${oggPath}`);
      assert.ok(fs.statSync(oggPath).size > 200, `Empty .ogg file ${oggPath}`);
    }
  }
});

test('mypc-app.json defines dev_mod and js/game.js only enables dev mode when dev_mod is true in MyPC.app_config', () => {
  const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'mypc-app.json'), 'utf8'));
  assert.equal(typeof appJson.config.dev_mod, 'boolean', 'mypc-app.json config.dev_mod must be a boolean');

  const gameCode = fs.readFileSync(path.join(ROOT, 'js/game.js'), 'utf8');
  assert.ok(gameCode.includes('function isDevMod('), 'js/game.js must define isDevMod()');
  assert.ok(gameCode.includes('c.dev_mod === true'), 'isDevMod must check c.dev_mod === true');
  assert.ok(gameCode.includes('if (isDevMod() && CHAPTERS.enabled(\'ch4\'))'), 'dev tools in menus must be guarded by isDevMod()');
});

test('All 8 Chapter 4 main quests, shadow_boss, waves, and kill steps complete end-to-end without stuck target arrows', () => {
  const ctx = loadBrowserEnv();
  ctx.MyPC = { announce: () => {} };
  runScript(ctx, 'js/i18n.js');
  runScript(ctx, 'js/i18n_more.js');
  runScript(ctx, 'js/i18n_talk.js');
  runScript(ctx, 'js/i18n_pets.js');
  runScript(ctx, 'js/i18n_rift.js');
  runScript(ctx, 'js/i18n_v3.js');
  runScript(ctx, 'js/items.js');
  runScript(ctx, 'js/mounts.js');
  runScript(ctx, 'js/hero.js');
  runScript(ctx, 'js/chapters.js');

  ctx.window.HM_C4_QUESTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'chapters/ch4/quests.json'), 'utf8'));
  runScript(ctx, 'chapters/ch4/text.js');
  runScript(ctx, 'chapters/ch4/maps.js');
  runScript(ctx, 'chapters/ch4/valyria.js');
  runScript(ctx, 'chapters/ch4/art.js');
  runScript(ctx, 'chapters/ch4/chapter.js');

  const MAPS = ctx.window.HM_C4_MAPS;
  const GT = { x: 0, y: 0, ok: false };
  const S = {
    c4: { st: 0, c: 0, m: 0, beacons: 0, great: false, open: {}, banner: '', lore: 0, rep: {}, gift: {}, wards: 0, anchors: 0, aemon: false, seen: { arrive: 1 } },
    mounts: [],
    sq: {},
    sqc: {},
    kills: 0,
    lvl: 20,
    qdone: 0
  };
  const FOES = Array.from({ length: 48 }, () => ({ on: false }));
  const DROPS = Array.from({ length: 32 }, () => ({ on: false }));
  let bossRef = null;
  let ch4 = null;

  const api = {
    TS: 32,
    GT,
    S,
    L: 'en',
    TEXT: ctx.window.HM_TEXT,
    T: ctx.window.HM_TEXT.en,
    Z: null,
    P: [{ x: 24 * 32, y: 18 * 32, on: true, hp: 100 }, { on: false }, { on: false }],
    FOES,
    DROPS,
    TUNE: { enemyDifficulty: 1 },
    SND: { fx: () => {}, play: () => {} },
    get boss() { return bossRef; },
    set boss(v) { bossRef = v; },
    coopMul: () => 1,
    dist: (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2),
    txt: (s, v) => String(s || '').replace(/\{(\w+)\}/g, (_, k) => (v && v[k] !== undefined ? v[k] : '')),
    lines: (w, k) => [[w, k, null]],
    toast: () => {},
    save: () => {},
    music: () => {},
    toPlay: () => {},
    travel: () => {},
    openTiles: () => {},
    ringFx: () => {},
    burst: () => {},
    part: () => {},
    dropGear: () => {},
    addToBag: () => {},
    makeItem: (id, r) => ({ id, r }),
    itemLabel: (it) => it.id,
    closeDlg: () => {},
    say: (_pg, ch, cb) => {
      if (ch && ch.length) ch[0].fn();
      else if (cb) cb();
    },
    scene: (steps, cb) => {
      for (const st of steps || []) if (st.fn) st.fn();
      if (cb) cb();
    },
    slides: (_pages, cb) => { if (cb) cb(); },
    hop: () => { GT.x = 32; GT.y = 32; return true; },
    feetSolid: () => false,
    qState: (id) => S.sq[id] || 0,
    spawnFoe: (t, x, y, minion) => {
      for (const f of FOES) if (!f.on) {
        const d = ch4.foes[t] || { hp: 50, dmg: 10, r: 12 };
        f.on = true; f.t = t; f.d = d; f.boss = !!d.boss; f.x = x; f.y = y; f.minion = !!minion; f.tag = '';
        f.max = f.hp = d.hp;
        return f;
      }
      return null;
    }
  };

  ch4 = ctx.window.HM_CHAPTERS.def.ch4(api);

  function enterZone(zid) {
    const def = MAPS[zid];
    for (const f of FOES) f.on = false;
    for (const d of DROPS) d.on = false;
    bossRef = null;
    api.Z = {
      id: zid,
      def,
      cols: def.rows[0].length,
      rows: def.rows.length,
      npcs: (def.npcs || []).map(n => ({ id: n.id, x: n.x * 32, y: n.y * 32 })),
      c4props: []
    };
    for (const f of def.foes || []) api.spawnFoe(f.t, f.x * 32, f.y * 32, false);
    if (def.boss && !S[def.boss.flag]) bossRef = api.spawnFoe(def.boss.t, def.boss.x * 32, def.boss.y * 32, false);
    ch4.onZone(zid);
    ch4.arrive(zid);
  }

  function simulateKill(f) {
    f.on = false;
    const isBoss = (f.d.boss || f.boss || f === bossRef) && !f.minion;
    ch4.onKill(f);
    if (isBoss) {
      bossRef = null;
      ch4.bossDown(f);
    }
  }

  const allSteps = [];
  for (const q of ctx.window.HM_C4_QUESTS.quests) for (const s of q.steps) allSteps.push(s);

  enterZone('c4_river');

  for (let idx = 0; idx < allSteps.length; idx++) {
    const s = allSteps[idx];
    assert.equal(S.c4.st, idx, `Should be at step ${idx} (${s.id})`);
    if (api.Z.id !== s.zone) enterZone(s.zone);
    if (S.c4.st > idx) continue; // completed on arrive (type === 'reach')

    // Pre-kill all existing foes before a kill step to verify ensureQuestFoes() respawns needed targets!
    if (s.type === 'kill') {
      for (const f of FOES) if (f.on && s.foes.includes(f.t)) f.on = false;
    }

    assert.ok(ch4.target(), `Step ${s.id} (${s.type}) must provide a valid target`);

    if (s.type === 'talk' || s.type === 'choice') {
      assert.ok(ch4.story(s.npc), `Step ${s.id} talk with ${s.npc} must advance quest`);
    } else if (s.type === 'interact') {
      for (const [sx, sy] of s.spots) {
        const px = sx * 32, py = sy * 32;
        api.P[0].x = px; api.P[0].y = py;
        assert.ok(ch4.interact(api.P[0], px, py), `Step ${s.id} interact at [${sx}, ${sy}] must succeed`);
      }
    } else if (s.type === 'rescue') {
      for (const npcId of s.npcs) {
        assert.ok(ch4.story(npcId), `Step ${s.id} rescue ${npcId} must succeed`);
      }
    } else if (s.type === 'collect') {
      const picks = DROPS.filter(d => d.on && d.k === 4 && d.qg === '@ch');
      assert.equal(picks.length, s.n, `Step ${s.id} must spawn ${s.n} collect drops`);
      for (const d of picks) ch4.pickup(d);
    } else if (s.type === 'waves') {
      for (const [sx, sy] of s.spots) {
        const px = sx * 32, py = sy * 32;
        api.P[0].x = px; api.P[0].y = py;
        assert.ok(ch4.interact(api.P[0], px, py), `Step ${s.id} wave start at [${sx}, ${sy}] must succeed`);
        const waveFoes = FOES.filter(f => f.on && f.tag === 'w');
        assert.ok(waveFoes.length > 0, `Step ${s.id} wave must spawn tagged foes`);
        for (const wf of waveFoes) {
          assert.ok(ch4.target(), `Step ${s.id} wave target must point to alive wave foe`);
          simulateKill(wf);
        }
      }
    } else if (s.type === 'kill') {
      for (let k = 0; k < s.n; k++) {
        assert.ok(ch4.target(), `Step ${s.id} kill ${k + 1}/${s.n} must find or respawn a live foe`);
        const targetFoe = FOES.find(f => f.on && s.foes.includes(f.t) && f.x === GT.x && f.y === GT.y);
        assert.ok(targetFoe, `Step ${s.id} arrow must point to an actual live foe, never a static empty spawn coordinate`);
        simulateKill(targetFoe);
      }
    } else if (s.type === 'boss') {
      assert.ok(bossRef && bossRef.on && bossRef.t === s.boss, `Step ${s.id} boss ${s.boss} must be spawned`);
      assert.ok(bossRef.d.boss || bossRef.boss, `Step ${s.id} boss ${s.boss} must have boss flag set so killing it triggers bossDown`);
      assert.ok(ch4.target(), `Step ${s.id} arrow must point to boss ${s.boss}`);
      assert.equal(GT.x, bossRef.x);
      assert.equal(GT.y, bossRef.y);
      simulateKill(bossRef);
    }

    assert.ok(S.c4.st > idx, `Step ${s.id} (${s.type}) must advance quest stage upon completion`);
  }

  assert.equal(S.c4.st, allSteps.length, 'All Chapter 4 steps must complete cleanly');
  assert.equal(S.c4.great, true, 'Great Pyre must be lit at end of Chapter 4');
});

test('js/game.js shows only one quest arrow: yellow when Main Quest is followed, green only when a Side Quest is followed', () => {
  const gameCode = fs.readFileSync(path.join(ROOT, 'js/game.js'), 'utf8');
  assert.ok(!gameCode.includes('const ST ='), 'js/game.js must not maintain a secondary ST arrow state');
  assert.ok(!gameCode.includes('anySideTarget'), 'js/game.js must not fall back to or overlay anySideTarget when Main Quest is followed');

  // Verify drawGuide calls renderQuestArrow exactly once
  const drawGuideMatch = gameCode.match(/function drawGuide\(cx, cy\)\s*\{[\s\S]*?\n    \}/);
  assert.ok(drawGuideMatch, 'drawGuide must exist in js/game.js');
  const arrowCalls = drawGuideMatch[0].match(/renderQuestArrow\(/g) || [];
  assert.equal(arrowCalls.length, 1, 'drawGuide must call renderQuestArrow only once (single arrow)');
});

test('killFoe has no broken ST reference, dev_mod defaults to false, Ch1 10/10 dungeon quests complete, arrow renders under hero feet, and hero has articulated legs + relaxed Dual Axes stance', () => {
  const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'mypc-app.json'), 'utf8'));
  assert.equal(appJson.config.dev_mod, false, 'mypc-app.json config.dev_mod must default to false so chapter jump buttons are hidden when dev mode is off');

  const gameCode = fs.readFileSync(path.join(ROOT, 'js/game.js'), 'utf8');
  assert.ok(!/\bST\./.test(gameCode), 'js/game.js must not contain any leftover ST. property references that would throw ReferenceError in killFoe');
  assert.ok(gameCode.includes("if (isDevMod() && CHAPTERS.enabled('ch5'))"), 'playCh5 must be gated behind isDevMod()');
  assert.ok(gameCode.includes("if (isDevMod() && CHAPTERS.enabled('ch6'))"), 'playCh6 must be gated behind isDevMod()');

  // Verify drawGuide is called before DL entity rendering so the arrow renders underneath the character's feet
  const drawIdx = gameCode.indexOf('drawGuide(cx, cy);');
  const dlPlayerIdx = gameCode.indexOf('else if (o.kind === 3) drawPlayer(o, cx, cy);');
  assert.ok(drawIdx > 0 && dlPlayerIdx > drawIdx, 'drawGuide(cx, cy) must run before drawPlayer so the arrow is under the hero feet');

  // Verify shortened arrow shape and feet-level anchor
  assert.ok(gameCode.includes('ctx.moveTo(9.5, 0);'), 'drawArrowShape must use shortened tip (9.5px)');
  assert.ok(gameCode.includes('hy = P[0].y - cy - 1'), 'renderQuestArrow must anchor at hero feet (P[0].y - cy - 1), not above head');

  // Verify relaxed Dual Axes weapon stance beside thighs pointing downward
  assert.ok(gameCode.includes("if (st.kind === 'axes')"), 'drawHeroWeapon must handle axes specifically');
  assert.ok(gameCode.includes('Math.PI - 1.24') && gameCode.includes('rx, ry, 1.24'), 'Dual axes at rest must hang beside the thighs with axe heads pointing downward');

  // Verify Chapter 1 10/10 dungeon completion in chapters/ch1/story.js
  const ch1Code = fs.readFileSync(path.join(ROOT, 'chapters/ch1/story.js'), 'utf8');
  assert.ok(ch1Code.includes('const riftDone = () =>'), 'chapters/ch1/story.js must define riftDone()');
  assert.ok(ch1Code.includes('s.rift.best >= 10'), 'riftDone() must complete when 10/10 Rift floors are cleared');

  // Verify hero.js leg articulation and relaxed Dual Axes arm pose
  const heroCode = fs.readFileSync(path.join(ROOT, 'js/hero.js'), 'utf8');
  assert.ok(heroCode.includes('const isAxes = !!(gear.axes'), 'js/hero.js must detect Dual Axes for relaxed arm pose');
  assert.ok(heroCode.includes('Lower shin (knee to ankle)'), 'js/hero.js leg() must render articulated knee and lower shin during running animation');
});



