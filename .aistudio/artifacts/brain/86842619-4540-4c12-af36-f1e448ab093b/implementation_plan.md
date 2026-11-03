# Hollowmere — Chapter 4: The Song of Ice & Fire

An expansive **Game of Thrones / A Song of Ice and Fire** fourth chapter for *Hollowmere*, unlocking after Chapter 3 (*The Veilscar Frontier*). Players sail from Dawnwatch into a war-torn Westeros and Essos during the **War of the Five Kings**, forge alliances across Great Houses, wield new weapon classes (**Dual Axes**, **Dual Guns**, **Winter's Fang**, and **Stormbreaker**), ride **Shadowmane** and **Frostfang**, command **Direwolf** or **Baby Dragon** companions, customize per-hero House cloth colors, and confront the **White Walkers**, **Undead Viserion**, and the **Night King**—all fully optimized for Samsung TVs running Tizen OS 9 under the MyPC SDK rules.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> All core scope and design choices from your answers have been locked into this plan:

- **Confirmed World Scope (7 Core Regions + 5-Floor Valyrian Ruins Dungeon)**:
  1. **The Riverlands (Riverrun, The Twins & Burned Villages)** — War-torn starting region where the player arrives from Dawnwatch and witnesses the War of the Five Kings firsthand.
  2. **The Crownlands & King's Landing (Red Keep, Blackwater Bay & Flea Bottom)** — Political hub with Tyrion Lannister, Varys, Cersei, and the Battle of the Blackwater wildfire defense.
  3. **The Stormlands & Dragonstone (Shipbreaker Bay & Painted Table)** — Stannis Baratheon, Melisandre, Brienne of Tarth, and Shadow Creature encounters.
  4. **The North & Winterfell (Godswood, Stark Crypts & Dreadfort Road)** — Robb Stark, Catelyn, Arya, Sansa, and Direwolf pack territory.
  5. **Braavos & Free Cities of Essos (Titan's Canal, Iron Bank, House of Black and White & Dothraki Outskirts)** — Daenerys Targaryen, Jorah Mormont, Faceless Men, and access to the **Ruins of Old Valyria (5-Floor Dungeon)** guarded by **Firewyrms**.
  6. **The Wall & Castle Black (Frostfang Pass & Watchtower)** — Jon Snow, Samwell Tarly, Maester Aemon, and Night's Watch defenses.
  7. **Beyond the Wall & Hardhome (Haunted Forest, Fist of the First Men & Heart of Winter)** — Mance Rayder, Children of the Forest, Giants, Ice Spiders, Wights, White Walkers, **Undead Viserion**, and the **Night King**.
- **Confirmed Faction Allegiance (4 Great Houses)**:
  - Players can pledge their banner to **House Stark** (Direwolf crit & northern frost defense), **House Baratheon** (Staggering hammer blows & stamina surge), **House Lannister** (Bonus gold, elite armor & wildfire volley), or **House Targaryen** (Dragonfire burn & magic mastery), shaping their final-act allies, battle buffs, and ending slides.
- **Confirmed Progression & Arsenal Expansion**:
  - **Hero Level Cap raised to 30**, **Forge Upgrades raised to +8**, and **Tier 6 (Westerosi & Valyrian Steel) Gear** added.
  - **New Weapon Classes**:
    - **Dual Axes (2-Handed Axes)**: Passive 360° whirlwind radius cleave hitting all surrounding enemies; Special Distant Attack hurls both spinning axes outward and boomerangs them back.
    - **Dual Guns (2-Handed Pistols)**: Passive split-target firing that automatically shoots two different nearby enemies at once; Special Distant Attack unloads a rapid barrage of bullets locked onto a single priority target.
    - **Winter's Fang (Legendary Valyrian-Steel Sword)**: Rippling dark steel with Stark wolf pommel; bonus undead damage, high crit, freezing strikes, and *Frost Rend* sweeping ice wave.
    - **Stormbreaker (Heavy Baratheon War Hammer)**: Massive two-handed dark-steel and bronze warhammer; armor penetration, shield breaking, stagger, and *Thunderfall* shockwave slam.
- **Confirmed Mounts, Companion Pets & Co-op Customization**:
  - **2 New Mounts**: **Shadowmane** (armored northern warhorse with trample knockdown charge) and **Frostfang** (giant white-grey direwolf with fast leap & bite attack), built from the open-source horse and wolf rigs with full 4-direction riding animations.
  - **Companion Pet Selector**: Switch companion pet between the classic **Cat**, a loyal **Direwolf Pup** (pack bite & tracking), or a **Baby Dragon** (aerial flame puffs) in Settings or at the kennel/eyrie.
  - **Per-Hero Cloth & House Sigil Dye Selector**: Each of the 1–4 co-op players can independently choose their tunic/cloak House palette (Stark Grey/White, Lannister Crimson/Gold, Targaryen Black/Red, Baratheon Gold/Black, Tyrell Emerald/Gold, Martell Sun/Orange, Arryn Sky/Silver, Greyjoy Iron/Teal) in Settings and at the tailor so co-op heroes never look identical.

---

## 1. Overview & Core Concept

- **What It Does**: Adds Chapter 4 (`ch4`) as a dynamically loaded chapter pack that unlocks as soon as Chapter 3 is completed (via a Westerosi envoy ship at Dawnwatch harbour or from Chapter 1/2 docks when `ch4` is enabled), while also allowing instant travel for testing.
- **Target Audience / Persona**: Built for 1–4 local or phone-pad co-op players playing together on a Samsung TV (Tizen OS 9) or desktop browser via MyPC.
- **Key Value**: Delivers an authentic, lore-rich *A Song of Ice and Fire* campaign with iconic characters, political choices, cinematic cutscenes with multi-language voice audio (`en`, `fr`, `es`, `ar`), distinct creature AI for all 12 bestiary monsters, and zero impact on frame rate or memory on TV hardware.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Unlocking & Arrival**: Completing Chapter 3 (or talking to Captain Davos's envoy / Sela at the harbour when Chapter 3 is complete) offers *"Sail west across the Narrow Sea to Westeros (Chapter 4)"*. An arrival cutscene introduces the burning Riverlands and the War of the Five Kings.
  2. **Act I — A Kingdom Divided (The Riverlands & King's Landing)**: Witness burned villages, rescue refugees, meet Robb Stark and Brienne in the Riverlands, infiltrate King's Landing to speak with Tyrion and Varys, and defend Blackwater Bay using wildfire caches.
  3. **Act II — Banners of Power (Stormlands, Winterfell & Braavos)**: Meet Stannis and Melisandre at Dragonstone (surviving a Shadow Assassin), journey north to Winterfell's Godswood to recover *Winter's Fang* from the Stark Crypts, sail to Braavos and Essos to meet Daenerys Targaryen and Jorah Mormont, optionally delve into the **5-Floor Ruins of Old Valyria**, and **pledge allegiance** to Stark, Baratheon, Lannister, or Targaryen.
  4. **Act III — The Night's Watch & Beyond the Wall**: Ride to Castle Black to aid Jon Snow and Samwell Tarly, range Beyond the Wall to meet Mance Rayder and the Children of the Forest, and uncover the spiral symbol of the Others.
  5. **Act IV — The Coming Winter (Hardhome & The Heart of Winter)**: Unite your pledged House's forces at the Wall, survive the Wight horde and Giant/Ice Spider ambushes, slay **Undead Viserion** in an aerial/ice-fire boss fight, and defeat **The Night King** to end the Long Night.
- **Visual Identity & Theme**:
  - **Medieval Typography in Chapter 4**: When entering Chapter 4 (`ch4`), the UI applies a medieval-inspired serif display stack (`'Cinzel', 'Palatino Linotype', 'Book Antiqua', Georgia, serif`) for chapter titles, quest headers, dialogue speaker banners, and boss nameplates, paired with crisp high-contrast body text readable from 3 meters away on a TV screen.
  - **Color Palette & Mood**:
    - *Background & Panels*: Obsidian Iron (`#0b0d14`) and Valyrian Slate (`#161926`) glass panels.
    - *Primary Accents*: Targaryen Ember Gold (`#d4af37`) and Stark Winter Frost (`#8ad8ff`).
    - *Regional Palettes*: Muddy crimson and ash in the Riverlands, royal crimson-and-gold stonework in King's Landing, obsidian and sea-spray on Dragonstone, deep snow and weirwood red-leaves in Winterfell, misty teal canals in Braavos, and glacial blue-white at the Wall.
- **Interactive Feedback & Motion**:
  - Strictly compositor-only CSS transitions (`transform`, `opacity`) and zero-allocation 60 Hz Canvas 2.5D rendering with offscreen culling so Samsung Tizen OS 9 TVs maintain a locked 60 FPS.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Modular Chapter Pack Architecture (`chapters/ch4/`)**
  - *Chosen Approach*: Build Chapter 4 as a self-contained pack loaded on demand by `js/chapters.js` (`quests.json`, `text.js`, `maps.js`, `valyria.js`, `art.js`, `chapter.js`) and unloaded when leaving the chapter.
  - *Why*: Preserves MyPC memory limits on Samsung TVs while allowing a massive 4-act story, 7 overworld zones, 5 dungeon floors, 12 creature types, and 9 synthesized regional soundtracks.
- **Decision 2: Dual-Wield Weapons & Level/Upgrade Scaling in Engine**
  - *Chosen Approach*: Extend the core weapon handler cleanly with two new weapon kinds (`axes` for 360° dual-axe cleave + twin boomerang throw, and `pistols` for dual-target gunshot + single-target rapid barrage), raise `maxUp` to `+8`, raise hero level cap to `30`, and add Tier 6 items (`winters_fang`, `stormbreaker`, `blood_axes`, `corsair_pistols`, `valyrian_helm`, `kingsguard_plate`, `wolf_cloak`, `watch_boots`, plus super weapons).
  - *Why*: Integrates seamlessly with existing equipment comparison UI, forge upgrades, and co-op loot drops without breaking existing saves.
- **Decision 3: Multi-Language Scene Audio (`en`, `fr`, `es`, `ar`)**
  - *Chosen Approach*: Generate offline Ogg/Opus voice clips in `audio/voices/<lang>/` with `index.json` for Chapter 4 cutscenes and key dialogues across all 4 supported languages (`en`, `fr`, `es`, `ar`), while also keeping `MyPC.ai` TTS fallback and Web Audio sound effects active.
  - *Why*: Guarantees spoken dialogue works out-of-the-box offline in every language on both standalone browsers and MyPC TVs.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        HOLLOWMERE ENGINE (js/game.js)                     │
│  ┌─────────────────┐  ┌────────────────────┐  ┌────────────────────────┐  │
│  │ Combat & Gear   │  │ Mounts & Pets      │  │ Appearance & Settings  │  │
│  │ • Lv 30 / +8 Up │  │ • Shadowmane       │  │ • 8 House Cloth Dyes   │  │
│  │ • Dual Axes     │  │ • Frostfang        │  │ • Pet Picker (Cat /    │  │
│  │ • Dual Pistols  │  │ • 4-Dir Sprites    │  │   Direwolf / Dragon)   │  │
│  │ • Winter's Fang │  │ • Trample & Bite   │  │ • Ch4 Medieval Font    │  │
│  │ • Stormbreaker  │  └─────────┬──────────┘  └───────────┬────────────┘  │
│  └────────┬────────┘            │                         │               │
└───────────┼─────────────────────┼─────────────────────────┼───────────────┘
            │                     ▼                         │
┌───────────┴───────────────────────────────────────────────┴───────────────┐
│                 CHAPTER 4 PACK (chapters/ch4/* — Lazy Loaded)             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐  │
│  │ Narrative & Quests   │  │ 7 Regions + Valyria  │  │ Bestiary (12)   │  │
│  │ • quests.json (4 Act)│  │ • c4_river (Tully)   │  │ • White Walker  │  │
│  │ • 4-House Pledge     │  │ • c4_kings (Capital) │  │ • Wight Horde   │  │
│  │ • Cutscenes + Audio  │  │ • c4_storm (Dragonst)│  │ • Shadow Spawn  │  │
│  │ • EN / FR / ES / AR  │  │ • c4_north (Winterfl)│  │ • Direwolf/Giant│  │
│  │   Voice Clips (.ogg) │  │ • c4_essos (Braavos) │  │ • Ice Spider    │  │
│  └──────────────────────┘  │ • c4_wall  (Watch)   │  │ • Firewyrm/Krkn │  │
│                            │ • c4_beyond(Hardhome)│  │ • Viserion (Boss│  │
│                            │ • c4_val1..5 (Ruins) │  │ • Night King    │  │
│                            └──────────────────────┘  └─────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State (`S.c4` & Global Save Extensions)
- **Save State Extensions (`S`)**:
  - `S.cloth`: Array `[c0, c1, c2, c3]` storing each hero's chosen House dye index (`0..7`), eliminating multiplayer look conflicts.
  - `S.petKind`: `'cat' | 'direwolf' | 'babydragon'` so players can switch their active companion pet.
  - `S.c4`: Chapter 4 state object tracking `{ st, c, m, house, beacons, open, lore, rep, gift, seen, crypt, wildfire, dragonglass }`.
- **12 Bestiary Creatures & Boss Mechanics**:
  1. **Wights**: Fast, relentless undead that have a chance to rise once unless slain by fire, dragonglass, or *Winter's Fang*.
  2. **White Walkers (The Others)**: Tall pale commanders with frost aura, ice-spear projectiles, and ordinary-weapon resistance; summon Wights.
  3. **Direwolves**: Fast pack hunters that coordinate flanking leaps.
  4. **Children of the Forest**: Secretive weirwood guardians using rapid nature-bow volleys and emerald root wards.
  5. **Shadow Creatures**: Blood-magic silhouettes that turn semi-transparent, blink behind targets, and strike from stealth.
  6. **Giants**: Massive northern colossi with ground-shaking club slams and boulder throws.
  7. **Ice Spiders (Legendary)**: Pale chitinous ambushers that shoot frost webs to slow heroes and strike with venomous mandibles.
  8. **Firewyrms (Valyrian Ruins)**: Burrowing molten serpents that erupt from volcanic ground with magma rings.
  9. **Krakens (Shipbreaker Bay & Blackwater Coast)**: Coastal tentacle horrors that lash across piers and drag targets toward the surf.
  10. **Unicorns of Skagos**: Rare horned mountain steeds with lightning-fast gore charges.
  11. **Undead Dragon Viserion (Boss)**: Swoops across the arena breathing walls of blue ice-fire, shattering fortifications, and summoning frost storms.
  12. **The Night King (Final Boss)**: Multi-phase battle—raises fallen Wights in waves, hurls ice javelins, projects a freezing blizzard vortex shielded by three White Walker lieutenants, and drops the legendary **Dragonglass War-Crown** and unlocks **Frostfang / Shadowmane** rewards.

### Interactive Component & State Mapping
- **Settings & Tailor Menu**: Adds *"Colors of {name}"* (cycling 8 House palettes with instant preview on the hero) and *"Companion Pet"* (Cat / Direwolf Pup / Baby Dragon) with full keyboard, TV remote (`OK` / arrows), and gamepad support.
- **Equipment & Forge UI**: Supports `+1` to `+8` upgrades, displays new weapon icons and stats for Dual Axes (`axes`), Dual Guns (`pistols`), War Hammers (`hammer`), and Valyrian Steel blades, and automatically applies Chapter 4's medieval font styling when in `ch4` zones.
