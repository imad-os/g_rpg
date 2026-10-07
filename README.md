# Hollowmere: The Lantern Road

**Version 1.0.0** · a game for [My PC](https://imad-os.github.io/g/) (Samsung TVs 2024+ and desktop browsers)

A 2.5D story RPG for **1 or 2 players**. For three hundred years the Great Lantern of Hollowmere
kept the Hush, a grey fog that eats sound, colour and memory, beyond the trees. Last night the
Lantern went dark and its three Embers were stolen. As the old lamplighter's apprentices, you
cross the Greywood, the Mirefen and the Old Quarry to bring the fire home, and learn why it
was taken.

- 5 areas, 17 story steps, 4 bosses, a full ending (about 30 minutes)
- The main characters (**Maren, Tobin, Sela, Corvin**) talk freely through AI
  (Gemini `gemini-3.5-flash-lite`). The other villagers have scripted lines.
- English, French, Spanish and Arabic (right to left)
- Saves on every step, top-10 scores at the end, Voice Guide support

## Controls

| | TV remote | Keyboard (standalone) | Gamepad |
|---|---|---|---|
| Move | arrows | arrows | stick / d-pad |
| Talk, use, attack | OK | Enter / Space | A |
| Quick menu (journal, potion) | hold OK | hold Enter | hold A |
| Pause menu | Back | Esc / P | Start |

**Co-op:** a second player presses OK / A on another controller (or F with W A S D on a second
keyboard inside My PC) to join, and can leave from the pause menu. Both heroes share the quest,
coins and level, and a fallen partner gets back up after a few seconds.

Everything works with the arrows and OK only. A yellow arrow always points to the next goal.

## Story design (no dead ends)

The quest is one chain, and every step can always be finished:

- Items that unlock things (ore, glowcaps, the sword, the key, the Embers) are never lost.
  Pickups stay collected, there are spares, and items found early still count.
- Gates only open when the step before them is done (brambles need the sword, the ferry needs
  the glowcaps, the quarry needs the key, the chapel needs the three Embers), so you can't
  reach a boss too early.
- Falling in battle only costs 10% of your coins. You wake at the edge of the area with full
  health, foes come back, and you can level up and buy potions (Hana, 10 coins) before trying again.
- The AI only adds conversation. It is told exactly what has happened so far and the current
  goal, and is not allowed to invent quests, items or spoilers. Quest progress is always scripted.

## AI voices (optional)

The game is fully playable without AI: the main characters then answer from a set of written
lines. To turn the AI on, edit `config.js`:

- **Recommended:** deploy `proxy/worker.js` as a free Cloudflare Worker (instructions inside the
  file) with your Gemini key as a secret, then set `proxyUrl` to its address.
- **Quick test:** set `geminiKey`. The key is then public, so restrict it to your Pages address
  (HTTP referrer) and the Generative Language API, and give it a low quota.

Get a key at https://aistudio.google.com/apikey.

## Files

| File | What |
|---|---|
| `index.html` | page, styles, HUD and dialog layout |
| `mypc-app.json` | My PC manifest (`id: hollowmere-lantern-road`) |
| `icon.svg` | icon |
| `config.js` | AI settings |
| `js/game.js` | engine: loop, players, foes, bosses, story, rendering |
| `js/maps.js` | the five areas |
| `js/i18n.js` | all texts in 4 languages |
| `js/art.js` | art drawn in code (sprites cached once) |
| `js/audio.js` | synthesized music and sound (Web Audio) |
| `js/ai.js` | Gemini conversations |
| `proxy/worker.js` | optional key-hiding proxy |

No build step and no downloads besides the code (about 200 KB). The SDK is loaded from
`https://imad-os.github.io/g/sdk/mypc-sdk.js`.

## Run and install

- **Standalone:** open `index.html` in Chrome (arrows + Enter, Esc pauses).
- **My PC:** GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root), then paste
  `https://imad-os.github.io/g_rpg/` into the installer at https://imad-os.github.io/g/installer/.
