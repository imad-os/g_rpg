import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();

function loadBrowserEnv() {
  const windowObj = {
    HM_VERSION: '5.0.0',
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

test('mypc-app.json and chapters.js register ch5 pack properly', () => {
  const manifestRaw = fs.readFileSync(path.join(ROOT, 'mypc-app.json'), 'utf8');
  const manifest = JSON.parse(manifestRaw);
  assert.ok(manifest.config.chapters.includes('ch5'), 'config.chapters must include ch5');

  const chaptersJs = fs.readFileSync(path.join(ROOT, 'js/chapters.js'), 'utf8');
  const ctx = loadBrowserEnv();
  vm.createContext(ctx);
  vm.runInContext(chaptersJs, ctx);

  assert.ok(ctx.HM_CHAPTERS.LIST.ch5, 'HM_CHAPTERS.LIST must define ch5');
  assert.equal(ctx.HM_CHAPTERS.LIST.ch5.home, 'c5_village');
  assert.equal(ctx.HM_CHAPTERS.of('c5_village'), 'ch5');
  assert.equal(ctx.HM_CHAPTERS.of('c5_dracula'), 'ch5');
  assert.equal(ctx.HM_CHAPTERS.of('c5_carmilla'), 'ch5');
  assert.equal(ctx.HM_CHAPTERS.of('c5_nosferatu'), 'ch5');
  assert.equal(ctx.HM_CHAPTERS.of('c5_brides'), 'ch5');
  assert.equal(ctx.HM_CHAPTERS.of('c5_crimson'), 'ch5');
  assert.equal(ctx.HM_CHAPTERS.of('c5_shadow'), 'ch5');
  assert.equal(ctx.HM_CHAPTERS.of('c5_undying'), 'ch5');
});

test('chapters/ch5/quests.json has 8 quests across 4 acts with complete en, fr, es, ar translations', () => {
  const questsRaw = fs.readFileSync(path.join(ROOT, 'chapters/ch5/quests.json'), 'utf8');
  const data = JSON.parse(questsRaw);
  assert.ok(Array.isArray(data.quests), 'quests must be an array');
  assert.equal(data.quests.length, 8, 'must define exactly 8 main quests');

  const acts = new Set(data.quests.map(q => q.act));
  assert.deepEqual(Array.from(acts).sort(), [1, 2, 3, 4], 'must span Acts 1 through 4');

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

test('js/items.js defines Tier 7 gothic gear and 4 Chapter 5 mounts', () => {
  const itemsJs = fs.readFileSync(path.join(ROOT, 'js/items.js'), 'utf8');
  const ctx = loadBrowserEnv();
  vm.createContext(ctx);
  vm.runInContext(itemsJs, ctx);

  const ITEMS = ctx.HM_ITEMS;
  const MOUNTS = ctx.HM_MOUNTS;

  const requiredGear = [
    'blood_sword',
    'vampire_armor',
    'shadow_ring',
    'crimson_amulet',
    'holy_relic',
    'bone_reaper'
  ];
  for (const id of requiredGear) {
    assert.ok(ITEMS[id], `Gear item ${id} must exist in HM_ITEMS`);
    assert.equal(ITEMS[id].tier, 7, `Gear item ${id} must be Tier 7`);
  }

  const requiredMounts = ['nightmare', 'bloodfang', 'bonecharger', 'nightterror'];
  for (const m of requiredMounts) {
    assert.ok(MOUNTS[m], `Mount ${m} must exist in HM_MOUNTS`);
    assert.ok(MOUNTS[m].speed >= 2.0, `Mount ${m} must have speed >= 2.0`);
  }
});

test('chapters/ch5 maps, art, text, and chapter definition load cleanly', () => {
  const ctx = loadBrowserEnv();
  vm.createContext(ctx);

  // Load quests data
  const questsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'chapters/ch5/quests.json'), 'utf8'));
  ctx.HM_C5_QUESTS = questsData;

  // Load text, maps, art, chapter
  const textJs = fs.readFileSync(path.join(ROOT, 'chapters/ch5/text.js'), 'utf8');
  vm.runInContext(textJs, ctx);
  assert.ok(ctx.HM_C5_TEXT, 'HM_C5_TEXT must be defined');
  for (const l of ['en', 'fr', 'es', 'ar']) {
    assert.ok(ctx.HM_C5_TEXT[l], `HM_C5_TEXT.${l} must exist`);
  }

  const mapsJs = fs.readFileSync(path.join(ROOT, 'chapters/ch5/maps.js'), 'utf8');
  vm.runInContext(mapsJs, ctx);
  assert.ok(ctx.HM_C5_MAPS, 'HM_C5_MAPS must be defined');

  const requiredMaps = [
    'c5_village',
    'c5_dracula',
    'c5_nosferatu',
    'c5_brides',
    'c5_crimson',
    'c5_shadow',
    'c5_undying',
    'c5_carmilla'
  ];
  for (const mapId of requiredMaps) {
    const raw = ctx.HM_C5_MAPS[mapId];
    assert.ok(raw, `Map ${mapId} must be present`);
    const mapDef = typeof raw === 'function' ? raw() : raw;
    assert.ok(Array.isArray(mapDef.rows), `${mapId} rows must be an array`);
    assert.ok(mapDef.spawn && mapDef.spawn.length === 2, `${mapId} must define a valid spawn point`);
  }

  const artJs = fs.readFileSync(path.join(ROOT, 'chapters/ch5/art.js'), 'utf8');
  vm.runInContext(artJs, ctx);
  assert.ok(ctx.HM_C5_ART, 'HM_C5_ART must be defined');

  const chapterJs = fs.readFileSync(path.join(ROOT, 'chapters/ch5/chapter.js'), 'utf8');
  vm.runInContext(chapterJs, ctx);
  assert.ok(typeof ctx.HM_CHAPTERS.def.ch5 === 'function', 'HM_CHAPTERS.def.ch5 must be defined');

  // Instantiate chapter definition
  const mockApi = {
    TS: 32,
    L: 'en',
    S: { c5: { st: 0, c: 0, m: 0, beacons: 0, open: {} } },
    T: () => ctx.HM_C5_TEXT.en,
    Z: { id: 'c5_village' },
    SND: { fx: () => {}, play: () => {} },
    toast: () => {},
    save: () => {},
    dialogue: () => {},
    openTiles: () => {},
    txt: (s, v) => s
  };

  const chInstance = ctx.HM_CHAPTERS.def.ch5(mockApi);
  assert.ok(chInstance.foeTypes, 'chInstance must provide foeTypes');

  const bosses = [
    'dracula',
    'carmilla',
    'orlok',
    'bride_crimson',
    'bride_shadow',
    'bride_frost',
    'blood_queen',
    'ruthven',
    'undying_king'
  ];
  for (const b of bosses) {
    assert.ok(chInstance.foeTypes[b], `Boss ${b} must be defined in foeTypes`);
    assert.ok(chInstance.foeTypes[b].boss, `Boss ${b} must have boss: true`);
  }
});

test('Real audio soundtracks and ATTRIBUTION.md exist and are non-empty', () => {
  const soundtrackFiles = ['battle.mp3', 'dangeon.mp3', 'theme.mp3'];
  for (const f of soundtrackFiles) {
    const p = path.join(ROOT, 'audio/soundtracks', f);
    assert.ok(fs.existsSync(p), `Soundtrack ${f} must exist`);
    const stat = fs.statSync(p);
    assert.ok(stat.size > 1000000, `Soundtrack ${f} must be a real high-fidelity audio file (>1MB)`);
  }

  const attrPath = path.join(ROOT, 'chapters/ch5/ATTRIBUTION.md');
  assert.ok(fs.existsSync(attrPath), 'chapters/ch5/ATTRIBUTION.md must exist');
  const attrContent = fs.readFileSync(attrPath, 'utf8');
  assert.ok(attrContent.includes('CC0'), 'Attribution must note open-source licenses');
});
