import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadCh7Context() {
  const ctx = {
    window: { HM_VERSION: '7.0.0', HM_VIEW: { w: 640, h: 360 } },
    document: {
      createElement: () => ({
        width: 64,
        height: 64,
        getContext: () => ({
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          globalAlpha: 1,
          fillRect() {},
          strokeRect() {},
          beginPath() {},
          moveTo() {},
          lineTo() {},
          closePath() {},
          fill() {},
          stroke() {},
          arc() {},
          ellipse() {},
          quadraticCurveTo() {},
          drawImage() {}
        })
      }),
      body: { appendChild() {} }
    },
    console,
    Math,
    Uint8Array,
    Array,
    Object,
    String,
    Number,
    setTimeout: (fn) => fn()
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);

  const questsJson = JSON.parse(fs.readFileSync('chapters/ch7/quests.json', 'utf8'));
  ctx.window.HM_C7_QUESTS = questsJson;

  for (const file of [
    'js/items.js',
    'js/chapters.js',
    'chapters/ch7/text.js',
    'chapters/ch7/maps.js',
    'chapters/ch7/art.js',
    'chapters/ch7/chapter.js'
  ]) {
    const code = fs.readFileSync(file, 'utf8');
    vm.runInContext(code, ctx, { filename: file });
  }
  return { ctx, questsJson };
}

test('Chapter 7 configuration and registration', () => {
  const appCfg = JSON.parse(fs.readFileSync('mypc-app.json', 'utf8'));
  assert.equal(appCfg.config.dev_mod, false, 'dev_mod must remain false by default');
  assert.ok(appCfg.config.chapters.includes('ch7'), 'mypc-app.json chapters must include ch7');

  const { ctx } = loadCh7Context();
  const chapters = ctx.window.HM_CHAPTERS;
  assert.ok(chapters.LIST.ch7, 'HM_CHAPTERS.LIST.ch7 must exist');
  assert.equal(chapters.LIST.ch7.home, 'c7_kokiri');
  assert.equal(chapters.of('c7_kokiri'), 'ch7');
  assert.equal(chapters.of('c7_t7_tower'), 'ch7');
});

test('Chapter 7 has 22 playable maps with walkable spawns, NPCs, quest spots, and exits', () => {
  const { ctx } = loadCh7Context();
  const maps = ctx.window.HM_C7_MAPS;
  const mapIds = Object.keys(maps);
  assert.equal(mapIds.length, 22, 'Chapter 7 must have 22 playable zones');

  const solidChars = '^#TkPLgq~';
  for (const id of mapIds) {
    const m = maps[id];
    assert.equal(m.rows.length, 34, `${id} must have 34 rows`);
    assert.equal(m.rows[0].length, 46, `${id} must have 46 columns`);
    const sx = Math.floor(m.spawn[0]), sy = Math.floor(m.spawn[1]);
    assert.ok(!solidChars.includes(m.rows[sy][sx]), `${id} spawn [${sx},${sy}] must be walkable`);

    for (const n of m.npcs || []) {
      const nx = Math.floor(n.x), ny = Math.floor(n.y);
      assert.ok(!solidChars.includes(m.rows[ny][nx]), `${id} NPC ${n.id} at [${nx},${ny}] must be walkable`);
    }
    for (const e of m.exits || []) {
      assert.ok(maps[e.to], `${id} exit target ${e.to} must exist`);
      const tx = Math.floor(e.tx), ty = Math.floor(e.ty);
      const targetMap = maps[e.to];
      assert.ok(!solidChars.includes(targetMap.rows[ty][tx]), `${id} -> ${e.to} landing [${tx},${ty}] must be walkable`);
    }
  }
});

test('Chapter 7 has 10 Acts and 120 sequential main quest steps in 4 languages', () => {
  const { questsJson } = loadCh7Context();
  assert.equal(questsJson.quests.length, 10, 'Must have 10 main quests (Acts I–X)');
  let totalSteps = 0;
  for (const q of questsJson.quests) {
    assert.equal(q.steps.length, 12, `${q.id} must have 12 steps`);
    for (const lang of ['en', 'fr', 'es', 'ar']) {
      assert.ok(q.title[lang], `${q.id} title.${lang} must be non-empty`);
      assert.ok(q.story[lang], `${q.id} story.${lang} must be non-empty`);
    }
    for (const st of q.steps) {
      totalSteps++;
      for (const lang of ['en', 'fr', 'es', 'ar']) {
        assert.ok(st.goal[lang], `${st.id} goal.${lang} must be non-empty`);
        assert.ok(st.say[lang] && st.say[lang].length > 0, `${st.id} say.${lang} must be non-empty`);
      }
    }
  }
  assert.equal(totalSteps, 120, 'Total sequential main quest steps must be 120 (10x longer)');
});

test('Chapter 7 Tier 9 Hylian weapons, tunics, boots, costumes, and Epona/Loftwing mounts', () => {
  const { ctx } = loadCh7Context();
  const items = ctx.window.HM_ITEMS;
  const costumes = ctx.window.HM_COSTUMES;
  const mounts = ctx.window.HM_MOUNTS;
  for (const w of ['kokiri_sword', 'master_sword', 'biggoron_sword', 'megaton_hammer', 'fairy_bow', 'sages_staff']) {
    assert.ok(items[w], `Weapon ${w} must exist in HM_ITEMS`);
    assert.equal(items[w].tier, 9, `Weapon ${w} must be Tier 9`);
  }
  for (const a of ['hylian_helm', 'mirror_helm', 'kokiri_tunic', 'goron_tunic', 'zora_tunic', 'iron_boots', 'hover_boots']) {
    assert.ok(items[a], `Armor ${a} must exist in HM_ITEMS`);
    assert.equal(items[a].tier, 9, `Armor ${a} must be Tier 9`);
  }
  for (const c of ['link_costume', 'sheik_costume', 'zelda_costume']) {
    assert.ok(items[c] && costumes.includes(c), `Costume ${c} must exist in HM_ITEMS and HM_COSTUMES`);
  }
  assert.ok(mounts.epona, 'Epona mount must exist');
  assert.ok(mounts.loftwing, 'Loftwing mount must exist');
  assert.equal(mounts.loftwing.fly, true, 'Loftwing must be a flying mount');
});

test('Chapter 7 runtime hooks, Ocarina songs, and 3-Phase Ganondorf -> Beast Ganon boss', () => {
  const { ctx } = loadCh7Context();
  const S = { mounts: ['horse', 'wolf'], costumes: [] };
  const api = {
    TS: 32,
    L: 'en',
    S,
    GT: { x: 0, y: 0 },
    Z: { id: 'c7_kokiri', def: ctx.window.HM_C7_MAPS.c7_kokiri, npcs: [{ id: 'saria', x: 720, y: 528 }] },
    P: [{ on: true, x: 720, y: 840, hp: 100 }],
    FOES: [],
    SND: { fx() {} },
    toast() {},
    save() {},
    ringFx() {},
    burst() {},
    chase() {},
    shot() {},
    hazard() {},
    addStatic: (k, img, x, y, base, w, h, extra) => ({ k, img, x, y, base, w, h, ...extra })
  };

  const ch7 = ctx.window.HM_CHAPTERS.def.ch7(api);
  ch7.start();
  assert.equal(ch7.id, 'ch7');
  assert.equal(ch7.home, 'c7_kokiri');
  assert.ok(ch7.objective('en').includes('Saria'), 'First step objective should reference Saria');

  // Test Ocarina Epona's Song unlocks Epona
  ch7.playOcarinaSong({ id: 'epona_song', name: "Epona's Song", notes: '▲ ◄ ► ▲ ◄ ►' });
  assert.ok(S.mounts.includes('epona'), "Playing Epona's Song should unlock Epona");

  // Test 3-Phase Ganondorf boss progression
  const ganonDef = ch7.foes.ganondorf;
  const f = { t: 'ganondorf', x: 720, y: 320, hp: 5200, max: 5200, d: ganonDef, tm: 0, phase: 1 };
  ganonDef.upd(f, api.P[0], 100, 1, 0, 1472, 1088);
  assert.equal(f.phase, 1);

  f.hp = 3000; // <= 65% HP triggers Phase 2 (Dark Triforce Surge)
  ganonDef.upd(f, api.P[0], 100, 1, 0, 1472, 1088);
  assert.equal(f.phase, 2);

  f.hp = 1500; // <= 32% HP triggers Phase 3 (Beast Ganon)
  ganonDef.upd(f, api.P[0], 100, 1, 0, 1472, 1088);
  assert.equal(f.phase, 3);
});
