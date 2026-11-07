# Chapter 7: The Legend of Zelda — Ocarina of Time ("The Symphony of Hyrule")

Chapter 7 transforms Hollowmere into a full-scale, playable tribute to *The Legend of Zelda: Ocarina of Time*, featuring an epic 10-Act main quest campaign (over 100+ multi-stage quest steps—nearly 10× the length of standard chapters), faithful Hyrule overworld regions and 10 iconic dungeons/temples, an interactive Ocarina melody system, two new mounts (**Epona** and **Crimson Loftwing**), Tier 9 Hylian weapons and elemental tunics, and real open-source orchestral/acoustic soundtracks and sound effects.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following core design decisions were confirmed during Phase 1 and govern the Chapter 7 build:

- **Confirmed Decision 1 — Playable Ocarina Songs in a Unified Hyrule Era**: Players unlock and play iconic Ocarina melodies (*Zelda's Lullaby*, *Epona's Song*, *Saria's Song*, *Sun's Song*, *Song of Time*, *Song of Storms*, and warp ballads) via an interactive Ocarina overlay or quick-action wheel to solve environmental puzzles, open sealed temple doors, awaken Sacred Stones, summon Epona, and warp across Hyrule—all within a seamless, unified world state where every region and temple remains accessible.
- **Confirmed Decision 2 — Full Hyrule Overworld + 3 Child Dungeons + 6 Adult Temples + Ganon's Castle**: The world spans **22 interconnected maps** faithfully modeled after *Ocarina of Time*:
  - **Overworld Hubs & Lands (12 Maps)**: *Kokiri Forest*, *Hyrule Field & Lon Lon Ranch*, *Hyrule Castle Town & Temple of Time*, *Kakariko Village & Graveyard*, *Death Mountain Trail & Goron City*, *Zora's River & Zora's Domain*, *Lake Hylia*, *Gerudo Valley & Fortress*, and *Haunted Wasteland & Desert Colossus*.
  - **The 3 Spiritual Stone Dungeons**: *Inside the Deku Tree* (Boss: **Queen Gohma**), *Dodongo's Cavern* (Boss: **King Dodongo**), and *Inside Jabu-Jabu's Belly* (Boss: **Barinade**).
  - **The 6 Sage Medallion Temples + Final Citadel (7 Dungeons)**: *Forest Temple* (**Phantom Ganon**), *Fire Temple* (**Volvagia**), *Water Temple* (**Morpha** / **Dark Link** mini-boss), *Shadow Temple* (**Bongo Bongo**), *Spirit Temple* (**Twinrova**), and *Ganon's Castle & Tower* (3-Phase Final Boss: **Ganondorf, King of Thieves → Phantom Surge → Beast Ganon**).
- **Confirmed Decision 3 — Two New Mounts (Epona & Crimson Loftwing)**:
  - **Epona (Legendary Hylian Mare)**: Summoned with *Epona's Song* / whistle entrance animation, featuring a chestnut coat, cream mane, seated riding posture, trample charge, and real open-source hoofbeat/whinny audio.
  - **Crimson Loftwing (Sacred Skybird of Skyloft)**: High-speed flying mount capable of soaring over Hyrule's rivers, canyons, and Death Mountain craters with real open-source wing-flap and eagle-cry audio.
- **Confirmed Decision 4 — Tier 9 Hylian Arsenal & Elemental Tunics**:
  - **Weapons**: *Kokiri Sword*, *Master Sword (Blade of Evil's Bane)*, *Biggoron's Giant Sword*, *Megaton Hammer*, and *Sacred Fairy Bow*.
  - **Tunics, Shields & Boots**: *Kokiri Tunic*, *Goron Fire Tunic* (grants volcanic heat immunity in Fire Temple), *Zora Water Tunic* (grants deep-water breathing in Water Temple), *Hylian Shield*, *Mirror Shield*, *Iron Boots*, and *Hover Boots* (plus Hero of Time, Sheik, and Princess Zelda cosmetic costumes).

---

## 1. Overview & Core Concept

- **What It Does**: Delivers a massive, self-contained *Ocarina of Time* adventure inside Hollowmere (accessible via Dev Mode, main menu Chapter 7 progression, or sailing from Chapter 6/5 via Captain Toad / Salladhor Saan). Players collect the **3 Spiritual Stones** (*Kokiri's Emerald*, *Goron's Ruby*, *Zora's Sapphire*), open the **Door of Time** to claim the **Master Sword**, awaken the **6 Sages** (*Saria*, *Darunia*, *Ruto*, *Impa*, *Nabooru*, *Rauru/Zelda*) to earn the **6 Sage Medallions**, and storm **Ganon's Castle** to recover the **Triforce**.
- **Target Audience / Persona**: Solo players and local co-op friends seeking a deep, nostalgic, puzzle-and-combat RPG campaign with multi-stage quests, dungeon mechanics, and boss fights.
- **Key Value**: Expands the quest architecture to **10 full Acts (~110–120 sequential steps)**—nearly 10× the depth of earlier chapters—mixing riddle solving, Ocarina melody puzzles, Cucco roundups, Goron boulder demolition, Zora diving trials, Poe hunting, Gerudo gate rescues, and multi-phase temple bosses.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Entering Hyrule (Chapter 7 Arrival)**:
   - Players can sail to Hyrule from Chapter 6/5 or launch Chapter 7 directly.
   - Awakening in **Kokiri Forest** greeted by **Navi** (companion fairy option) and **Saria**, the player explores Kokiri Village, claims the *Kokiri Sword & Deku Shield*, and enters the **Great Deku Tree** to break Ganondorf's curse.
2. **The 10-Act Epic Main Campaign (~120 Quest Steps)**:
   - **Act I — The Boy Without a Fairy & The Great Deku Tree (12 Steps)**: Explore Kokiri Forest, pass Mido's trial, light the Deku torches, burn the spiderwebs, defeat **Queen Gohma**, and receive **Kokiri's Emerald**.
   - **Act II — Princess of Destiny & Lon Lon Ranch (12 Steps)**: Cross Hyrule Field, learn *Epona's Song* from **Malon** at Lon Lon Ranch to tame **Epona**, sneak past Castle Courtyard guards, meet **Princess Zelda** & **Impa**, and learn *Zelda's Lullaby*.
   - **Act III — The Goron's Ruby & Dodongo's Cavern (12 Steps)**: Climb Kakariko Village and Death Mountain Trail, play *Saria's Song* for **Darunia**, detonate Bomb Flowers to open **Dodongo's Cavern**, solve the giant skull bridge puzzle, slay **King Dodongo**, and claim **Goron's Ruby**.
   - **Act IV — Zora's Sapphire & Jabu-Jabu's Belly (12 Steps)**: Play *Zelda's Lullaby* at Zora's Waterfall, recover **Princess Ruto's** letter in Lake Hylia, enter **Lord Jabu-Jabu's Belly**, carry Ruto through electric octo-wards, defeat **Barinade**, and earn **Zora's Sapphire**.
   - **Act V — The Temple of Time & The Forest Medallion (12 Steps)**: Place the 3 Spiritual Stones at the **Temple of Time**, play the *Song of Time*, draw the **Master Sword**, travel to the Sacred Forest Meadow, hunt the **4 Poe Sisters** in the **Forest Temple**, and defeat **Phantom Ganon** to awaken **Sage Saria**.
   - **Act VI — The Subterranean Inferno & Fire Medallion (12 Steps)**: Equip the **Goron Tunic**, enter the **Fire Temple** inside Death Mountain Crater, rescue the imprisoned Goron elders, claim the **Megaton Hammer**, and slay the subterranean dragon **Volvagia** to awaken **Sage Darunia**.
   - **Act VII — Beneath Lake Hylia & The Water Medallion (12 Steps)**: Equip the **Zora Tunic & Iron Boots**, descend into the **Water Temple**, adjust the 3 water-level Triforce crests, duel **Dark Link** in the illusion chamber, and defeat **Morpha** to awaken **Sage Ruto**.
   - **Act VIII — The Well of Shadows & The Shadow Medallion (12 Steps)**: Learn the *Nocturne of Shadow* in Kakariko Village, light the truth braziers in the **Shadow Temple**, cross the Stalfos ferry, and defeat the invisible phantom **Bongo Bongo** to awaken **Sage Impa**.
   - **Act IX — The Desert Colossus & The Spirit Medallion (12 Steps)**: Rescue the carpenters in **Gerudo Fortress**, cross the **Haunted Wasteland** following the phantom guidepost, align the **Mirror Shield** sunbeams in the **Spirit Temple**, and defeat the witches **Twinrova (Kotake & Koume)** to awaken **Sage Nabooru**.
   - **Act X — The Six Sages' Bridge & Ganon's Tower (12 Steps)**: Summon the Rainbow Bridge with all 6 Medallions, shatter the 6 elemental barrier seals inside **Ganon's Castle**, and conquer the 3-Phase Final Showdown (**Ganondorf, Demon Thief → Dark Triforce Surge → Ganon, Demon King**) to restore the Triforce.
3. **Interactive Ocarina of Time System**:
   - Interacting with **Ocarina Pedestals** (marked with the Triforce crest on the ground) or selecting the **Ocarina of Time** from the quick menu opens a clean musical staff modal where players play unlocked songs (*Zelda's Lullaby*, *Epona's Song*, *Saria's Song*, *Sun's Song*, *Song of Time*, *Song of Storms*, *Minuet of Forest*, *Bolero of Fire*, *Serenade of Water*, *Nocturne of Shadow*, *Requiem of Spirit*, *Prelude of Light*).
   - Playing a song triggers authentic acoustic Ocarina notes (real open-source `.ogg` flute/ocarina samples), a golden Triforce resonance ring, and immediate world-state reactions (lowering water, opening royal gates, summoning Epona, or warping to temple entrances).

### Visual Identity & Theme
- **Aesthetic Direction**: Rich 2D pixel-art & painterly top-down Hyrule aesthetic blending lush Kokiri emerald greens (`#1b5e3a`), sun-bleached Hyrule Field savannah golds (`#d4a84f`), sacred Temple of Time marble (`#e8e4d8`), volcanic Death Mountain basalt (`#3a1d16`), crystalline Zora sapphire waters (`#1c7ed6`), and golden Triforce accents (`#ffd43b`).
- **HUD & Overlay Discipline**:
  - Preserves Hollowmere's unobtrusive top-left Quest Banner, top-right Level/Rupee/Triforce Medallion counter (`♦ 0/3 Stones · ⬡ 0/6 Medallions`), and bottom-left health/magic bars.
  - Keeps the enlarged, high-visibility **orange directional quest arrow (`#ff7a18`)** anchored on the ground layer beneath the hero's boots so it guides players clearly across all 22 Hyrule zones without obscuring the character or mount.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — 22 Interconnected Hyrule Zones (12 Overworld + 10 Dungeons)**:
  - *Chosen Approach*: Build 12 distinct overworld regions connected to 10 bespoke dungeon/temple maps rather than cramming all of Hyrule into 4–5 generic maps.
  - *Why*: *Ocarina of Time*'s magic comes from traveling from Kokiri Forest out into central Hyrule Field and branching into Kakariko, Death Mountain, Zora's Domain, Lake Hylia, and Gerudo Valley, with each dungeon having its own atmosphere, puzzles, and boss arena.
- **Decision 2 — Real Open-Source Audio Assets (Zero MIDI)**:
  - *Chosen Approach*: Use real open-source orchestral/acoustic `.mp3` soundtracks (pastoral flute/harp overworld themes, sacred temple choir/ambient tracks, and dramatic boss battle themes) and real `.ogg` mount/ocarina sound effects in `audio/mounts/` and `audio/soundtracks/`.
  - *Why*: Respects the user's explicit preference against synthetic MIDI audio and ensures Epona, the Crimson Loftwing, and the Ocarina sound rich and authentic.
- **Decision 3 — Unified Era with Progressive World Unlocks**:
  - *Chosen Approach*: Keep all child and adult dungeons accessible in one seamless timeline while unlocking the Master Sword, Epona, Loftwing, and the 6 Adult Temples after placing the 3 Spiritual Stones in the Temple of Time.
  - *Why*: Avoids frustrating inventory lockouts (players can ride Epona, swing the Master Sword or Megaton Hammer, and revisit any region freely).

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        HOLLOWMERE CORE ENGINE (js/game.js)                  │
│  ┌──────────────────┐  ┌──────────────────────┐  ┌───────────────────────┐  │
│  │  Chapter Loader  │  │  Mount & Seated Pose │  │ Ground Quest Arrow &  │  │
│  │  (js/chapters.js)│  │  Renderer (mounts.js)│  │ Pathfinding BFS (GT)  │  │
│  └────────┬─────────┘  └──────────┬───────────┘  └───────────┬───────────┘  │
└───────────┼───────────────────────┼──────────────────────────┼──────────────┘
            │                       │                          │
            ▼                       ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│             CHAPTER 7: OCARINA OF TIME PACK (chapters/ch7/*)                │
│                                                                             │
│  ┌──────────────────────────┐      ┌─────────────────────────────────────┐  │
│  │   10-Act Quest Engine    │◄────►│   Interactive Ocarina Melody Modal  │  │
│  │ (quests.json + chapter.js│      │  • 12 Songs (Lullaby, Time, Epona,  │  │
│  │  ~120 Sequential Steps)  │      │    Saria, Storms + 6 Temple Warps)  │  │
│  └────────────┬─────────────┘      └──────────────────┬──────────────────┘  │
│               │                                       │                     │
│               ▼                                       ▼                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                 22 HYRULE MAPS (chapters/ch7/maps.js)                 │  │
│  │  • 12 Overworld Maps: Kokiri, Hyrule Field, Lon Lon, Castle/Temple,   │  │
│  │    Kakariko, Death Mtn, Goron City, Zora River/Domain, Lake Hylia,    │  │
│  │    Gerudo Valley/Fortress, Haunted Wasteland                          │  │
│  │  • 3 Stone Dungeons: Deku Tree, Dodongo's Cavern, Jabu-Jabu's Belly   │  │
│  │  • 6 Sage Temples + Final: Forest, Fire, Water, Shadow, Spirit, Ganon │  │
│  └────────────┬───────────────────────────────────────┬──────────────────┘  │
│               │                                       │                     │
│               ▼                                       ▼                     │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │   Hyrule Art & Boss AI (art.js) │   │ Tier 9 Gear, Tunics & 2 Mounts  │  │
│  │  • Deku/Goron/Zora/Gerudo NPCs  │   │  • Epona (Steed) & Loftwing(Fly)│  │
│  │  • 10 Bosses + 3-Phase Ganondorf│   │  • Master Sword, Biggoron, Bow, │  │
│  │  • Triforce Pedestals & Torch   │   │    Megaton Hammer, 3 Tunics     │  │
│  │    / Water-Level / Mirror Puzzles│   │  • Hero of Time / Sheik / Zelda │  │
│  └─────────────────────────────────┘   └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State (`S.c7`)
- `S.c7.st`: Active main quest step index (`0..119` across 10 Acts / 10 Quests, each with 12 rich steps).
- `S.c7.stones`: Bitmask/count of the **3 Spiritual Stones** (`emerald`, `ruby`, `sapphire`).
- `S.c7.medallions`: Bitmask/count of the **6 Sage Medallions** (`forest`, `fire`, `water`, `shadow`, `spirit`, `light`).
- `S.c7.songs`: Unlocked Ocarina songs map (`lullaby`, `epona`, `saria`, `time`, `storms`, `suns`, plus temple warp songs).
- `S.c7.waterLv`: Current water-level state in the Water Temple (`low`, `mid`, `high`), dynamically toggling flooded vs. dry walkable bridges.
- `S.c7.open`: Unlocked gates, bombed boulder passages, and temple entrances across Hyrule.
- `S.mounts`: Adds `'epona'` (Speed ×2.25, Trample charge, seated horse saddle pose) and `'loftwing'` (Speed ×2.40, Flying mount, seated sky-saddle pose).
- `HM_ITEMS`: Adds Tier 9 weapons (`kokiri_sword`, `master_sword`, `biggoron_sword`, `megaton_hammer`, `fairy_bow`), Tier 9 armor/tunics (`kokiri_tunic`, `goron_tunic`, `zora_tunic`, `hylian_shield_helm`, `mirror_shield_helm`, `iron_boots`, `hover_boots`), and 3 cosmetic costumes (`link_costume`, `sheik_costume`, `zelda_costume`).

### Interactive Component & State Mapping
- **Ocarina Pedestals & Quick Action**: Standing on a Triforce Pedestal (`k: 'triforce_pad'`) and pressing Interact (or opening the Ocarina menu) plays the required melody, triggers real acoustic Ocarina audio, animates floating musical notes (`♪ ♫`), advances `S.c7.st` when on a song step, or warps the player to any unlocked Temple entrance.
- **Dungeon Puzzle Mechanics**:
  - *Deku Tree & Shadow Temple*: Torch-lighting braziers and spiderweb/truth barriers that open `Z.block` gates via `api.openTiles`.
  - *Dodongo's Cavern & Fire Temple*: Bomb-flower rock walls and Goron prison switches.
  - *Water Temple*: Triforce water-crest switches that cycle water levels and open paths to Dark Link and Morpha.
  - *Spirit Temple*: Solar mirror pedestals that reflect light beams into the boss door.
  - *Ganon's Castle*: 6 Sage barrier seals that shatter in sequence before the 3-Phase Ganondorf / Beast Ganon finale.
- **Walkability & Co-op Safety**: All 22 maps, NPC warp songs, and exits are validated against `feetSolid` so no transition ever places a player on water or solid tiles.
