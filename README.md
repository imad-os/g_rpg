# Hollowmere: The Lantern Road

**Version 1.3.0** · a game for [My PC](https://imad-os.github.io/g/) (Samsung TVs 2024+ and desktop browsers)

A 2.5D story RPG for **1 or 2 players**. For three hundred years the Great Lantern of Hollowmere
kept the Hush, a grey fog that eats sound, colour and memory, beyond the trees. Last night the
Lantern went dark and its three Embers were stolen. As the old lamplighter's apprentices, you
cross the Greywood, the Mirefen and the Old Quarry, and down into the Deep Mine, to bring the
fire home and learn why it was taken.

- 7 areas including **2 dungeons** (the Barrow Crypt and the Deep Mine: dark halls lit by
  torches, pots to smash, chests to open), 17 story steps, 5 bosses and a full ending
- **6 side quests** from the villagers (hunt wolves, crawlers and mites, rescue Bram's apprentice
  from the Crypt Knight, find Pip's lost dog, dig up star iron), each paying coins and gear
- **Gear:** swords, bows and flintlock guns; helmets, body armour and boots, bought at Tobin's
  forge or won from quests and chests, and changed on the Equipment screen (per hero in co-op)
- Hana sells small and big potions; coins come from foes, pots, chests and quests
- Hit-pause, critical hits, sparks, slash trails, arrows, muzzle flash and smoke, rings of light,
  running dust, spinning coins that fly to you
- The quest box folds into a small badge 10 seconds after each new step
- The main characters (**Maren, Tobin, Sela, Corvin**) talk freely through AI
  (Gemini `gemini-3.5-flash-lite`). The other villagers have scripted lines.
- English, French, Spanish and Arabic (right to left)
- Saves on every step, top-10 scores at the end, Voice Guide support

## Controls

| | TV remote | Keyboard (standalone) | Gamepad |
|---|---|---|---|
| Move | arrows | arrows | stick / d-pad |
| Talk, use, attack | OK | Enter / Space | A |
| Quick menu (journal, equipment, potions) | hold OK | hold Enter | hold A |
| Pause menu | Back | Esc / P | Start |

**Co-op:** a second player presses OK / A on another controller (or F with W A S D on a second
keyboard inside My PC) to join, and can leave from the pause menu. Both heroes share the quest,
coins and level, and a fallen partner gets back up after a few seconds.

Everything works with the arrows and OK only. A yellow arrow always points to the next goal and
follows the corridors in dungeons. In the shop and Equipment screens, up/down choose and OK
buys or wears; in co-op, left/right switch hero.

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
- The AI only adds conversation. It is told exactly what has happened so far and the current
  goal, and is not allowed to invent quests, items or spoilers. Quest progress is always scripted.

## AI conversations (optional)

The game is fully playable without AI: the main characters then answer from a set of written
lines. The AI is set in the **app config** (installer → this app → **Config**), which My PC hands
to the game as `MyPC.app_config`:

```json
{ "proxyUrl": "https://hollowmere-ai.<you>.workers.dev", "model": "gemini-3.5-flash-lite", "timeoutMs": 8000,
  "tts": true, "ttsModel": "gemini-3.8-flash-lite-tts" }
```

The app config is **not secret** (every TV downloads it), so the Gemini key never goes there or in
this repository. It lives in a small free proxy, `proxy/worker.js` (a Cloudflare Worker, set-up
steps inside the file), that adds the key and only answers requests from this game's site.
Get a key at https://aistudio.google.com/apikey.

To test in a browser without My PC, add the config to the address:
`index.html?app_config={"proxyUrl":"https://hollowmere-ai.<you>.workers.dev"}`

## Spoken dialogue

Every dialogue line and story page is spoken, in this order:

1. a **recorded clip** from `audio/voices/<lang>/`, if one exists (free; made with the generator below);
2. otherwise **Gemini text-to-speech** through the proxy, if `proxyUrl` is set and `tts` is not
   `false` (this costs API usage, so record the fixed lines whenever you can);
3. otherwise **nothing**: the text stays on screen and goes to the TV's Voice Guide.

Clips are downloaded one line at a time while playing, and the music gets quieter while someone
speaks. Voices follow the sound-effects volume in My PC. Recorded so far: **Arabic** (107 lines, 2.6 MB).

### Making the recordings (free, offline)

`tools/voices/generate.py` turns every scripted line (about 230 in 4 languages) into speech with
[Piper](https://github.com/rhasspy/piper), a free open-source voice engine that runs on your PC.
It gives each character its own voice and saves small Ogg/Opus clips to `audio/voices/<lang>/`
with an `index.json` (about 1.2 MB per language). Live AI replies are not voiced.

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
| `js/i18n.js`, `js/i18n_more.js` | all texts in 4 languages (story; gear, dungeons, side quests) |
| `js/items.js` | gear, shops, side quests and chests (data) |
| `js/art.js` | art drawn in code (sprites cached once) |
| `js/audio.js` | synthesized music and sound (Web Audio) |
| `js/ai.js` | Gemini conversations |
| `js/voice.js` | spoken dialogue (recordings, then Gemini TTS) |
| `proxy/worker.js` | optional key-hiding proxy |
| `tools/voices/` | voice generator (Python, not loaded by the game) |

No build step and no downloads besides the code (about 200 KB). The SDK is loaded from
`https://imad-os.github.io/g/sdk/mypc-sdk.js`.

## Run and install

- **Standalone:** open `index.html` in Chrome (arrows + Enter, Esc pauses).
- **My PC:** GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root), then paste
  `https://imad-os.github.io/g_rpg/` into the installer at https://imad-os.github.io/g/installer/.
