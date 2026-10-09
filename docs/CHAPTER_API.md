# Hollowmere chapters: how to add one

Hollowmere is one engine (`js/game.js` and its helpers) plus **chapters**. A chapter is a small pack of
files in `chapters/chN/` that is loaded only while the heroes are in it. Walking through a doorway
into another chapter loads that pack and lets go of the old one (its maps, people, music, foes and
code), so the game stays light, like switching from one game to the next.

To make a new chapter you only need to read **this file** and the files of an existing chapter
(`chapters/ch2/` is the best model). You do not need to read `js/game.js`.

## Files

| File | What |
|---|---|
| `js/chapters.js` | the list of chapters and their files, and the loader (add your chapter to `LIST`) |
| `chapters/chN/text.js` | every text of the chapter in `en`, `fr`, `es`, `ar`, merged into `HM_TEXT` |
| `chapters/chN/maps.js` | the areas (built with `rect`, `scatter`... or written as rows of letters) |
| `chapters/chN/art.js` | optional: how the areas are drawn (chapter 2 draws everything in code, with depth) |
| `chapters/chN/chapter.js` | the story, the people, quests, foes, bosses, music: `HM_CHAPTERS.def.chN = function (api) { return {...} }` |

Chapter 1 (`chapters/ch1/story.js`) uses `js/maps.js`, `js/pool.js` and `js/rift.js` as its data;
its texts are in `js/i18n*.js` because the menus share them.

## Zones and doorways

- Zone ids start with the chapter: `c2_bay`, `c3_...`. Ids without a prefix belong to chapter 1.
- An exit `{ x, y, w, h, to: 'c3_harbour', tx, ty }` into another chapter's zone switches chapter
  (a dark fade with "Loading" while the pack loads). `api.travel(zone, tx, ty)` does the same from code
  (for a boat, a portal...). Put arrival points at least 3 tiles away from any exit.
- The owner can switch chapters on or off with the app config key `chapters` (`"ch2"`, `["ch2", "ch3"]`
  or `"all"`; default: all). Check `HM_CHAPTERS.enabled('ch3')` before offering the way in.

## A zone (in `maps`)

```js
c2_fields: {
    ground: 'fields',          // theme for the art
    art: 1,                    // drawn by the chapter's build() (leave out to use chapter 1's Kenney tiles)
    music: 'c2_fields',        // a song key (see songDefs)
    atmo: 'pollen',            // light particles: pollen, leaves, embers, ash, motes, spray, fireflies
    dark: false,               // true: a dungeon (torches, lamps and crystals give light; no riding)
    tier: 3,                   // gear level of drops (1-4)
    spawn: [3.5, 12.5],        // tiles
    rows: [...],               // one string per row
    npcs: [{ id: 'ada', x: 8.5, y: 9.4, roam: 0 }],   // roam: walks around home within N tiles
    props: [{ k: 'house', x: 6, y: 5, w: 5, h: 3, roof: 'red' }],   // footprints block walking
    foes: [{ t: 'boar', x: 6, y: 3 }],
    boss: { t: 'rook', x: 38, y: 5.5, flag: 'c2rook' },   // not spawned again once S[flag] is true
    exits: [{ x: 0, y: 12, w: 1, h: 2, to: 'c2_bay', tx: 40.5, ty: 12.5 }]
}
```

Engine letters that keep their meaning in every chapter: `p` pot (breaks, coins), `C` chest,
`~` water (shots fly over), `w` planks, `D` dark way down, `#` and `T` solid. Add the chapter's own
solid letters with `solid: '^PkhLlcvg'`.

## The chapter object (`chapter.js`)

Everything is optional except `id`, `home` and `maps`.

| Field / hook | Use |
|---|---|
| `id`, `home` | `'ch2'`, the home zone (title screen, falling back) |
| `maps`, `quests`, `pool`, `chests`, `shop` | data used by the engine's quest, task, chest and forge systems |
| `looks` | people: `{ skin, hair, style, tunic, trim, pants, shoes, cape, beard, s, gear: { head, body, feet } }` (drawn in clothes), or `{ anim: 'dog' / 'cat' / 'horse' / 'wolf' }` |
| `talkers` | people who answer questions from `T.topic[id]` and `T.talk[id]` |
| `foes` | new foe types: `{ hp, dmg, spd, r, xp, coin, boss?, ai?, look?, gear?, weapon?, upd?, draw? }` |
| `beasts` | the bestiary list for this chapter |
| `songDefs`, `songs`, `bossSong`, `preload` | music (see below) |
| `parent`, `dust`, `treasures` | which zone leads to which (for the guide arrow), dust colour, hidden treasures per zone |
| `noWolf` | the wolf mount stays in chapter 1 (the horse can travel) |
| `start()`, `stop()` | entering / leaving the chapter (create `S.cN = {...}` in `start`) |
| `objective(lang)` | the quest text at the top of the screen |
| `stageOf()` | the chapter's story step (quests and tasks with `stage` use it) |
| `story(id)` | pages to say when the story needs this person, `true` to stay silent, `null` for usual talk |
| `idle(id)` | usual pages of a person |
| `extras(id, choices)` | add choices (shops, boats, gifts) |
| `news(id)`, `visible(id)`, `talkable(id)` | a yellow "!", who can be seen, who can be spoken to |
| `interact(p, fx, fy)` | OK near something special (return `true` if handled) |
| `tile(c)` | letters that change with the story (an opened gate, low tide) |
| `build(Z, def)`, `drawUnder`, `drawOver` | the chapter's own art |
| `onZone(id)`, `arrive(id)` | after an area loads; after walking in (cut-scenes) |
| `update()` | every frame in play (no allocation!) |
| `onKill(f)`, `bossDown(f)` | counting kills; story after a boss |
| `target()` | where the guide arrow points (set `api.GT.x / y`, or `return api.hop(zone)`) |
| `music(zone, def)`, `lanternLit()`, `gems()`, `relics()` | song choice, a lit Lantern, the four gems on the HUD, the journal row |
| `forgeName()`, `storeName()`, `score()` | shop titles, the score shown at the chapter's end |

## Foes

- **Shared brains** (`ai`): `archer`, `gunner`, `hexer` (keep distance, aim with a warning, shoot
  arrows / bullets / homing orbs), `brute` (shakes, then lunges), `boar` (charges, dazed on walls),
  `crab`, `imp`. People with `look` + `gear` + `weapon` (`bow`, `gun`, `staff`, `club`, `sword`) are
  drawn in clothes. Ready-made: `archer`, `gunner`, `hexer`, `raider`, `boar`, `crab`, `imp`, plus
  chapter 1's `wisp`, `wolf`, `crawler`, `mite`, `bones`, `bat`.
- **Bosses**: give `upd(f, p, d, tx, ty, rw, rh)` and `draw(ctx, f, x, y, flash)`. Use `f.st`, `f.tm`,
  `f.wt`, `f.ph`, `f.pt`, `f.ang`, `f.ring`, `f.sum` for state. `f.immune` blocks damage, `f.weak` doubles it,
  `f.alpha < 0.5` means it can't be hit. Telegraph every attack (a line, a circle, a shake) so players
  can learn the pattern. Spawn helpers with `api.spawnFoe(type, x, y, true)` (they vanish with the boss).
- Attacks: `api.shot(x, y, vx, vy, dmg, r, kind, 0)` with kind 4 arrow, 5 bullet, 6 homing orb,
  8 fireball; `api.bomb(x, y, tx, ty, frames, dmg)`; `api.hazard(x, y, r, warnFrames, dmg, kind, col)`
  (kind 0 bursts, 1 burns for a while); `api.hurt(p, dmg, fromX, fromY)` for beams and rings.

## Music

```js
songDefs: { c2_bay: { root: 196, scale: [0, 2, 4, 7, 9, 12, 14, 16], chords: [0, 3, 1, 2], rate: 3, beats: 64,
                      pad: 'sine', lead: 'flute', drums: 'soft', echo: 0.3, busy: 0.55, seed: 11 } }
```
`lead`: flute, brass, bell, pluck. `drums`: none, soft, march, war, tom. Songs are rendered in code
(no files), and let go when the chapter is left. Set `preload: false` to render each song only when it plays.

## Cut-scenes

```js
api.scene([
    { cam: [22, 27], t: 80 },                         // move the camera to a tile, wait 80 frames
    { title: 'Chapter 3: ...', t: 170 },              // a big title card
    { say: api.lines('odile', 'c2hello') },           // a conversation
    { move: ['odile', 22.5, 22.7] }, { t: 70 },       // a person walks; wait
    { fx: 'flash' | 'shake', sound: 'bell', fn: () => {...}, t: 60 }
], () => { /* when it ends */ });
```
OK skips a wait. Black bars show during the scene.

## Texts (`text.js`)

Merge into `HM_TEXT[lang]`: `ui` (keys prefixed `c3`), `zone`, `boss`, `names`, `foes` (bestiary),
`lines` (pages, keys prefixed `c3`), `quests`, `topic`, `talk`, `c3obj` (objectives), `c3ending`.
Keep sentences short and plain in every language, and especially in Arabic: everyday words, and
"you" in the singular. `lines(who, key, vars)` gives pages with a voice clip key per page (`key-0`...).
Recorded voices come from `tools/voices/generate.py` (add the chapter's file and speakers there).

## Checklist for a new chapter

1. Add `chN` to `LIST` in `js/chapters.js` (files, home, globals to forget).
2. Make a way in from an earlier chapter, shown only when `HM_CHAPTERS.enabled('chN')`.
3. Write the four files; keep `update()` and drawing free of allocation.
4. Test: walk in and out of the chapter, play its story to the end, check the guide arrow at every step.
5. Run `node tools/release.js X.Y.Z` (every file gets `?v=`), commit, push.
