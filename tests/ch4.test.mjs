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
  assert.equal(mypc.version, '4.0.0');
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

test('mypc-app.json defaults dev_mod to false and only enables dev mode when dev_mod is true in MyPC.app_config', () => {
  const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'mypc-app.json'), 'utf8'));
  assert.equal(appJson.config.dev_mod, false, 'mypc-app.json config.dev_mod must be false by default');

  const gameCode = fs.readFileSync(path.join(ROOT, 'js/game.js'), 'utf8');
  assert.ok(gameCode.includes('function isDevMod('), 'js/game.js must define isDevMod()');
  assert.ok(gameCode.includes('c.dev_mod === true'), 'isDevMod must check c.dev_mod === true');
  assert.ok(gameCode.includes('if (isDevMod() && CHAPTERS.enabled(\'ch4\'))'), 'dev tools in menus must be guarded by isDevMod()');
});
