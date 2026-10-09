# Hollowmere: The Lantern Road

**Version 1.8.0** · a game for [My PC](https://imad-os.github.io/g/) (Samsung TVs 2024+ and desktop browsers)

A 2.5D story RPG for **1 or 2 players**. For three hundred years the Great Lantern of Hollowmere
kept the Hush, a grey fog that eats sound, colour and memory, beyond the trees. Last night the
Lantern went dark and its three Embers were stolen. As the old lamplighter's apprentices, you
cross the Greywood, the Mirefen and the Old Quarry, and down into the Deep Mine, to bring the
fire home and learn why it was taken.

- 7 areas including **2 dungeons** (the Barrow Crypt and the Deep Mine: dark halls lit by
  torches, pots to smash, chests to open), 17 story steps, 5 bosses and a full ending
- **9 story side quests** from the villagers (hunt wolves, crawlers and mites, rescue Bram's
  apprentice from the Crypt Knight, find Pip's lost dog, dig up star iron, and three animals)
- **A pool of 30 more tasks**: after their own quests, Bram, Hana, Odo, Pip, Sela and Tobin each
  hand out one task at a time, picked at random from those that fit the story so far: hunts,
  things to collect, people to rescue, deliveries and named elite foes. Rewards (coins, iron ore,
  often gear) grow with your level. A task can be dropped, and finished tasks come round again.
- **A cat** (Hana's lost kitten) follows player 1: it picks up loot and fights at your side with
  half your attack, defence and health, and runs one and a half times as fast as you
- **Mounts:** a horse (Odo's quest, or 700 coins at Hana's store) and a wolf (Bram's quest, or
  900 coins) that bites the foes you run into. Both heroes ride; you get down in dungeons.
- **Gear:** swords, bows and flintlock guns; helmets, body armour and boots, bought at Tobin's
  forge or won from quests and chests, and changed on the Equipment screen (per hero in co-op)
- **The Rift**: an endless dungeon under the hill, opened at level 6 (or after the ending). Every
  floor is generated anew: clear it to open the stairs down; every fifth floor has a guardian and
  an old stone tablet that tells a little more of what lies below. You can start again from every
  fifth floor you have reached. **Your deepest floor is your score on My PC's top-10 table.**
- **Bestiary** (hold OK menu): every creature you meet, with its picture, a note and how many you
  have defeated; **21 hidden treasures** buried around the world (your cat sniffs them out)
- After the ending, a new mystery: something below the hill remembers the Hush
- Hana sells small and big potions; coins come from foes, pots, chests, treasures and quests
- **Pixel art by Kenney** (CC0): heroes are built from layers, so every helmet, armour and weapon
  you wear shows; villagers, monsters, houses, trees, walls and floors come from Tiny Town and
  Tiny Dungeon. Movement is animated in code (bob, tilt, lunge, hit flash).
- **Abilities:** Healing (20% of your health, 10 s cooldown), Power attack (a ground slam that
  hits everything around you) and Distant attack (a bolt of light that goes through every foe in a
  line). They burn **stamina**, the blue bar under your health, which fills as you defeat foes
  (bosses and named elites give more). Each ability box on the screen darkens while it cools down.
- **Equipment screen** with pictures: a box for every piece (its name on top, rarity colour, +level,
  a tick on what you wear), tabs for weapon, head, body and feet, and a details panel that compares
  the chosen piece with what you wear (▲ better, ▼ worse)
- **Mounts screen** to switch between walking, the horse and the wolf
- **Settings:** voice speed (0.75× to 2×, the pitch stays natural) and button mapping
- Hit-pause, critical hits, sparks, slash trails, arrows, muzzle flash and smoke, rings of light,
  running dust, spinning coins that fly to you
- The quest box folds into a small badge 10 seconds after each new step
- **Loot:** common, rare, epic and legendary gear with random bonuses (attack, defence, crit,
  speed, health, extra coins); Tobin upgrades any piece from +1 to +5 with coins and iron ore,
  and buys what you don't need
- The main characters (**Maren, Tobin, Sela, Corvin**) answer your questions; new questions
  open up as the story goes on, and every question shown always has an answer
- English, French, Spanish and Arabic (right to left)
- Saves on every step, top-10 table for the Rift, Voice Guide support

## Controls

| | TV remote | Keyboard (standalone) | Gamepad |
|---|---|---|---|
| Move | arrows | arrows | stick / d-pad |
| Talk, use, attack | OK | Enter / Space | A |
| Power attack | OK twice | Enter twice | A twice |
| Distant attack | (quick menu) | Shift / X | run button |
| Healing | (quick menu) | Backspace | B |
| Quick menu (journal, abilities, potions, equipment, mounts, bestiary, settings) | hold OK | hold Enter | hold A |
| Pause menu | Back | Esc / P | Start |

Those are the default buttons. In **Settings** each action (attack, quick menu, healing, power
attack, distant attack, potion, ride / walk) can be put on OK, OK twice, hold OK, the run button,
the cancel button, or the menu only. The quick menu and attacking always stay on the remote's OK,
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
speaks. Voices follow the sound-effects volume in My PC. Recorded so far: **Arabic** (209 lines, 5.4 MB).

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
| `js/game.js` | engine: loop, players, foes, bosses, story, rendering |
| `js/maps.js` | the seven areas, dungeons included |
| `js/i18n.js`, `js/i18n_more.js`, `js/i18n_talk.js`, `js/i18n_pets.js`, `js/i18n_rift.js`, `js/i18n_play.js` | all texts in 4 languages (story; gear, dungeons, side quests; abilities and settings) |
| `js/items.js` | gear, shops, mounts, story side quests and chests (data) |
| `js/pool.js` | the 30 pool tasks, with their texts in 4 languages |
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
node tools/release.js 1.8.0
```

## Credits

Pixel art: [Kenney](https://www.kenney.nl) (Tiny Town, Tiny Dungeon, Roguelike Characters), CC0.
Voices: [Piper](https://github.com/rhasspy/piper) voices. Everything else: made for this game.

## Run and install

- **Standalone:** open `index.html` in Chrome (arrows + Enter, Esc pauses).
- **My PC:** GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root), then paste
  `https://imad-os.github.io/g_rpg/` into the installer at https://imad-os.github.io/g/installer/.
