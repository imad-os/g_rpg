# Hollowmere

**Version 2.0.0** · a game for [My PC](https://imad-os.github.io/g/) (Samsung TVs 2024+ and desktop browsers)

A 2.5D story RPG for **1 or 2 players**, told in chapters.

## Chapter 1: The Lantern Road

For three hundred years the Great Lantern of Hollowmere kept the Hush, a grey fog that eats
sound, colour and memory, beyond the trees. Last night the Lantern went dark and its three Embers
were stolen. As the old lamplighter's apprentices, you cross the Greywood, the Mirefen and the Old
Quarry, and down into the Deep Mine, to bring the fire home and learn why it was taken.

- 7 areas including **2 dungeons**, 17 story steps, 5 bosses and a full ending
- **9 story side quests** and **a pool of 30 more tasks** (hunts, things to collect, people to rescue,
  deliveries, named elite foes), handed out one at a time by the villagers
- **The Rift** under the hill (level 6, or after the ending): **ten floors**, each generated anew and
  tougher than the last, with archers, musketeers and hexers from floor 3; guardians on floors 5 and 10.
  Conquer all ten for a legendary piece of gear. Your run goes to My PC's top-10 table.

## Chapter 2: The Sunken Lantern

After the ending, Sela can sail you across the lake to **Larkspur Bay**. A hundred years ago its own
Lantern sank into the sea with the old lighthouse; now masked raiders, the **Grey Choir**, rob its
farms for the Hush. Win back the Lantern's **Lens** from Captain Rook, its **Flame** from the
Cinder Witch, ring the tide bell, and go down into the Sunken Lighthouse to face the Choirmaster.

- **A new look with depth:** raised cliffs and walls with shadows, layered trees, houses with sloped
  roofs, animated water, lava and windmill, light weather in every place (sea spray, pollen, embers,
  dark motes), all drawn in code
- 4 areas: the harbour town of **Larkspur** (13 townsfolk, a market, a fountain, a quiet melody),
  the **Sunpetal Fields** (farm, river, beach, raider camp and fort), **Cinder Ridge** (lava, ash,
  dead pines) and the dark **Sunken Lighthouse**, each with its own music
- **Three bosses with real patterns:** Rook dashes along a red line (dazed if he hits a wall), throws
  bombs and whistles for archers; the Witch spins fire spirals, burns circles under you, makes mirror
  images and hides behind a shield held by three crystals; the Choirmaster sends rings of sound
  with one gap, turns a beam around the hall and calls hexers
- Cut-scenes at the big moments (arrival, the bosses, the tide going out, the Lantern rising)
- 5 side quests and 11 tasks, tier 4 gear (sea steel) at Gus's forge, warm bread at Tuck's bakery,
  and one quest that sends a letter back to Maren in Hollowmere
- The horse sails with you; the wolf stays home in the Greywood
- **A flying dragon** hatches when the Cinder Witch falls. It flies over water, rocks, fences and lava (never over walls, trees or gates). You can't attack from its back, and only bows, guns and magic can reach you there; you can't land on water.

## In both chapters

- **Heroes drawn in clothes:** tunic, belt, boots and cape, and every helmet, armour and pair of boots
  you wear changes how you look (leather, chainmail, plate, tide mail, a mage robe); 4 directions,
  walking legs; epic and legendary weapons shine in your hand
- **Weapons:** swords, bows, flintlock guns and **magic staffs** (a glowing bolt that bends toward
  foes). **Attacks aim themselves** at the nearest foe in reach.
- **Abilities:** Healing (20% of your health, 10 s), Power attack (a ground slam) and Distant attack
  (a bolt through every foe in a line), fuelled by **stamina** that fills as you defeat foes
- **Armed foes:** archers and musketeers aim with a warning (a drawn bow, a red line), hexers throw
  homing orbs and vanish when you get close, raiders shake before they lunge, boars charge
- **A cat** that wanders near you, sits when you stop, picks up loot, fights at your side and hides
  behind you when hurt; **mounts**: a horse (open-source sprite, walk and gallop), a wolf in chapter 1, and a flying dragon
- Gear with rarities and random bonuses, upgrades from +1 to +5, an **Equipment screen** with
  pictures and a details panel, a **Mounts screen**, **Settings** (voice speed, button mapping, Return)
- Each hero cries out when hit; hit-pause, critical hits, sparks, slash trails, rings of light
- English, French, Spanish and Arabic (right to left; the Arabic is written in plain, simple words)
- Saves on every step, Voice Guide support, recorded Arabic voices

## Chapters (app config)

Each chapter is loaded only while you are in it: travelling to chapter 2 loads its pack and lets go
of chapter 1's maps, music and code, and the other way round. The owner chooses the chapters with the
app config key `chapters`, a list such as `["ch2"]` (later `["ch2", "ch3"]`; `"all"` turns on every
chapter, `[]` keeps only chapter 1). How to add a
chapter: **[docs/CHAPTER_API.md](docs/CHAPTER_API.md)**.

## Controls

| | TV remote | Keyboard (standalone) | Gamepad |
|---|---|---|---|
| Move | arrows | arrows | stick / d-pad |
| Talk, use, attack | OK | Enter / Space | A |
| Power attack | OK twice | Enter twice | A twice |
| Distant attack | (quick menu) | Shift / X | run button |
| Healing | (quick menu) | Backspace | B |
| Quick menu (journal, abilities, potions, equipment, mounts, bestiary, settings) | hold OK | hold Enter | hold A |
| Return: close a menu, end a conversation | hold OK (in menus) | hold Enter | hold A |
| Pause menu | Back | Esc / P | hold Start |
| Quick menu (also) | | | Start |

Those are the default buttons. In **Settings** each action (attack, quick menu, healing, power
attack, distant attack, potion, ride / walk) can be put on OK, OK twice, hold OK, the run button,
the cancel button, or the menu only. **Return** has its own setting (hold OK, the cancel button, the run
button, or off): one press closes any menu or ends a conversation, picking its Leave / Back /
Goodbye choice. While Return is on hold OK, OK in menus and conversations acts when you let go. The quick menu and attacking always stay on the remote's OK,
and OK always talks, opens and reads first, so nothing can be locked away.

**Co-op:** a second player presses OK / A on another controller (or F with W A S D on a second
keyboard inside My PC) to join, and can leave from the pause menu. Both heroes share the quest,
coins and level, and a fallen partner gets back up after a few seconds.

Everything works with the arrows and OK only. A yellow arrow always points to the next goal and
follows the corridors in dungeons. In the shops, up/down choose and OK buys. On the Equipment
screen the arrows move between the boxes, up from the top row reaches the tabs, and OK wears or
takes off; in co-op a tab switches hero.

## Balance (app config)

The owner can tune the game without changing code, with these optional keys in My PC's app config
(`MyPC.app_config`; the defaults are in `mypc-app.json` and in the code). Every key is a
multiplier; numbers out of range are clamped.

| Key | Default | What it does |
|---|---|---|
| `coinDrops` | 0.6 | coins from foes, pots, chests, treasures and quest rewards (1 = version 1.7, 0 = none) |
| `gearDrops` | 0.5 | chance that foes and pool quests give gear (bosses and elites always do) |
| `enemyDifficulty` | 1.3 | foes' attack and health (1 = version 1.7, 2 = twice as tough) |
| `mountSpeed` | 1 | how much faster the horse and the wolf are than walking |
| `petSpeed` | 1.5 | the cat's speed, times the hero's |

## Story design (no dead ends)

The quest is one chain, and every step can always be finished:

- Items that unlock things (ore, glowcaps, the sword, the key, the Embers) are never lost.
  Pickups stay collected, there are spares, and items found early still count.
- Gates only open when the step before them is done (brambles need the sword, the ferry needs
  the glowcaps, the quarry needs the key, the chapel needs the three Embers), so you can't
  reach a boss too early.
- Falling in battle only costs 10% of your coins. You wake at the edge of the area with full
  health, foes and pots come back, and you can level up, buy potions or better gear before trying again.
- Side quests are optional and can't get stuck: kill counts can always be finished (foes come back
  when you re-enter an area), and finding Tam, Biscuit or the star iron counts even before anyone asks.

## Spoken dialogue

Every dialogue line and story page is spoken, in this order:

1. a **recorded clip** from `audio/voices/<lang>/`, if one exists (free; made with the generator below);
2. otherwise **Gemini text-to-speech** through the proxy, if `proxyUrl` is set and `tts` is not
   `false` (this costs API usage, so record the fixed lines whenever you can);

   It is set in the **app config** (installer → this app → **Config**), which My PC hands to the
   game as `MyPC.app_config`:
   `{ "proxyUrl": "https://hollowmere-voice.<you>.workers.dev", "tts": true, "ttsModel": "gemini-3.8-flash-lite-tts" }`.
   The app config is not secret, so the Gemini key only lives in the proxy (`proxy/worker.js`,
   a free Cloudflare Worker; set-up steps inside the file);
3. otherwise **nothing**: the text stays on screen and goes to the TV's Voice Guide.

Clips are downloaded one line at a time while playing, and the music gets quieter while someone
speaks. Voices follow the sound-effects volume in My PC. Recorded so far: **Arabic**, both chapters (316 lines).

### Making the recordings (free, offline)

`tools/voices/generate.py` turns every scripted line (about 200 per language) into speech with
[Piper](https://github.com/rhasspy/piper), a free open-source voice engine that runs on your PC.
It gives each character its own voice and saves small Ogg/Opus clips to `audio/voices/<lang>/`
with an `index.json` (about 1.2 MB per language).

Needs **64-bit** Python 3.9 or newer (the speech engine has no 32-bit build). ffmpeg is used if
installed.

```
py -3.13 -m venv .venv
.venv\Scripts\activate
pip install -r tools/voices/requirements.txt
python tools/voices/generate.py                 # everything (downloads each voice once, 20-60 MB each)
python tools/voices/generate.py --lang en       # one language
python tools/voices/generate.py --only maren0   # try one line
python tools/voices/generate.py --list          # who says what
```

Change who speaks with which voice in `tools/voices/voices.json` (voices listed at
https://huggingface.co/rhasspy/piper-voices). Running it again only redoes lines whose text or
voice changed. Arabic has a single free Piper voice (male), so every Arabic character shares it
with a different speed. For more natural English, Spanish and French, voices can be switched to
the optional Kokoro engine.

## Files

| File | What |
|---|---|
| `index.html` | page, styles, HUD and dialog layout |
| `mypc-app.json` | My PC manifest (`id: hollowmere-lantern-road`) |
| `icon.svg` | icon |
| `js/game.js` | the engine: loop, players, foes, combat, screens, the chapter interface (`API`) |
| `js/chapters.js` | the list of chapters and the loader |
| `js/hero.js` | people drawn in code, in clothes (heroes, Chapter 2 townsfolk, armed foes) |
| `chapters/ch1/story.js` | Chapter 1's story, people and world (uses `js/maps.js`, `js/pool.js`, `js/rift.js`) |
| `chapters/ch2/` | Chapter 2: `text.js` (4 languages, tasks), `maps.js`, `art.js` (2.5D art in code), `chapter.js` |
| `docs/CHAPTER_API.md` | how to add a chapter |
| `js/maps.js` | Chapter 1's seven areas, dungeons included |
| `js/i18n.js`, `js/i18n_more.js`, `js/i18n_talk.js`, `js/i18n_pets.js`, `js/i18n_rift.js`, `js/i18n_play.js` | texts in 4 languages (shared menus, Chapter 1's story, abilities and settings) |
| `js/items.js` | gear (tiers 1 to 4, staffs), shops, mounts, Chapter 1's side quests and chests |
| `js/pool.js` | Chapter 1's 30 tasks, with their texts in 4 languages |
| `js/rift.js` | builds each Rift floor from a seed (always fully reachable) |
| `js/kenney.js`, `assets/kenney/` | the Kenney sprite sheets (21 KB) and how the game uses them |
| `js/art.js` | art drawn in code: water, the Lantern, animals, effects, and everything if the sheets can't load |
| `tools/release.js` | sets a new version everywhere (see below) |
| `js/audio.js` | synthesized music and sound (Web Audio) |
| `js/voice.js` | spoken dialogue (recordings, then Gemini TTS) |
| `proxy/worker.js` | optional key-hiding proxy |
| `tools/voices/` | voice generator (Python, not loaded by the game) |

No build step and no downloads besides the code (about 200 KB). The SDK is loaded from
`https://imad-os.github.io/g/sdk/mypc-sdk.js`.

## Releasing a new version

TVs cache files, so every file the game loads carries `?v=<version>`, the same as `version` in
`mypc-app.json`. One command updates all of it:

```
node tools/release.js 2.0.0
```

## Credits

Pixel art: [Kenney](https://www.kenney.nl) (Tiny Town, Tiny Dungeon, Roguelike Characters), CC0.
Horse: ["Animated horse"](https://opengameart.org/content/animated-horse) by ScratchIO, CC0.
Dragon: ["Flying Dragon"](https://opengameart.org/content/flying-dragon-rework) by ZaPaper. Credits to http://www.buko-studios.com/, commissioned by PlayCraft (www.playcraftapp.com), [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/). Details in `assets/mounts/LICENSE.txt`.
Voices: [Piper](https://github.com/rhasspy/piper) voices. Everything else: made for this game.

## Run and install

- **Standalone:** open `index.html` in Chrome (arrows + Enter, Esc pauses).
- **My PC:** GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root), then paste
  `https://imad-os.github.io/g_rpg/` into the installer at https://imad-os.github.io/g/installer/.

## Local co-op (a phone as the second player)

Uses My PC's own multiplayer (`MyPC.multiplayer`): the rooms list, "Open a room" and the accept dialog are My PC's screens, the same in every game. Both devices on the same Wi-Fi.
- **Host** (TV, phone or computer): pause menu (or hold OK: quick menu) → **Co-op: play with a friend** → My PC's "Open a room".
- **Guest** (a phone running My PC): Hollowmere title screen → **Join a friend** → pick the room. The host accepts in My PC's dialog.
- The phone becomes a controller with a big joystick and **A** (OK / attack), **B** (run, ability), **C** (cancel, ability), **☰** (hero 2's own menu: gear, mounts, abilities, journal), **Leave**. It presses **A** to join as hero 2. Hero 2's menu opens on the host's screen, is driven from the phone (stick, **A** = OK, **C** = back) and is copied as text onto the phone. Other menus and dialogs stay on the host.
- **Pad settings** (the ⚙ button, on every touch pad): add or hide buttons, make the stick and buttons bigger or smaller, drag them where you like, reset. Saved on the device.

The game only has `js/coop.js` (host/guest state and messages), the small status and controller screens in `game.js`, and `js/virtual-pad.js` (touch pad, reusable).
Standalone (a browser, not My PC) works between two tabs of the same browser, for testing. No Firebase, no codes, no links.
