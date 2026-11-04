# Role & Armor Archetype Balance System — Implementation Plan

## 1. Design Goal & Philosophy
Create a clean, fast, and intuitive **3-Role Combat Archetype System** (**Tank**, **Damage / Striker**, and **Wizard / Healer**) driven dynamically by the player's equipped **Armor (`head`, `body`, `feet`) + Weapon (`weapon`)**.

To keep the game simple while ensuring no single build dominates in solo play, co-op, or future **PvP**:
- **Any player can equip any weapon and armor**, but each armor piece belongs to one of three archetypes (`heavy`, `light`, `mystic`) with clear trade-offs in **Defense, Max HP, Attack Speed, Move Speed, and Weapon/Heal Synergy**.
- **Balanced Triangle (Rock-Paper-Scissors for Future PvP)**:
  - **Tank (`heavy`)** excels at absorbing burst damage, resisting knockback, and trading blows in melee (`sword`, `hammer`), at the cost of slower attack speed (`atkSpd < 0`), slower movement (`spd < 0`), and reduced ranged/staff efficiency.
  - **Damage / Striker (`light`)** excels at fast attack speed (`atkSpd > 0`), high movement speed (`spd > 0`), bonus physical attack (`atk`), and critical strikes (`crit`), at the cost of low Defense and HP (glass cannon).
  - **Wizard / Healer (`mystic`)** excels at Staff magic damage (`mag > 0`), faster Staff casting, stronger self + nearby ally **Heal (`✚`)**, and shorter ability cooldowns, at the cost of the lowest physical Defense and no bonus to physical weapons.

---

## 2. Core Mechanics & Formulas (`js/items.js` & `js/game.js`)

### A. Three Armor Classes (`role: 'heavy' | 'light' | 'mystic'`)
Every armor item (`head`, `body`, `feet`) in `window.HM_ITEMS` gets a `role` tag and lightweight base modifiers:
1. **`heavy` (Tank / Vanguard)**
   - **High Defense (`def`)** and **Bonus Max HP (`hp`)** per piece.
   - **Trade-off**: Slower Attack Speed (`atkSpd`: `-6%` to `-14%` per piece, up to ~`-25%` full set) and slightly slower Move Speed (`spd`: `-2%` to `-8%`).
   - **Weapon Synergy**: Full power with `sword`, `hammer`, and `axes` (`+10%` melee damage when wearing 2+ Heavy pieces with `sword`/`hammer`, plus `50%` knockback resistance). If paired with ranged/magic (`bow`, `gun`, `pistols`, `staff`), attack cooldown penalty applies in full with no damage bonus.
2. **`light` (Damage / Striker)**
   - **Low Defense (`def`)**, no base HP bonus.
   - **Strengths**: Faster Attack Speed (`atkSpd`: `+6%` to `+14%` per piece, up to `+30%` faster attacks full set), faster Move Speed (`spd`: `+4%` to `+12%`), plus flat Physical Attack (`atk`) and Crit Chance (`crit`).
   - **Weapon Synergy**: Boosts physical & ranged weapons (`axes`, `bow`, `pistols`, `gun`, `sword`).
3. **`mystic` (Wizard / Healer)**
   - **Lowest Physical Defense (`def`)**, moderate Move Speed (`spd`: `+3%` to `+7%`), small Max HP buffer on high-tier robes.
   - **Strengths**: **Magic & Heal Power (`mag`)** (`+8%` to `+20%` per piece, up to `+45%` full set).
   - **Weapon & Ability Synergy**:
     - When wielding a **`staff`**, `mag` directly boosts Staff basic & special (`✸`) damage by `1 + st.mag` and speeds up Staff attack cooldown by `15%–25%`.
     - **Empowered Heal (`✚`)**: Increases self-healing from `40%` to up to `60%` Max HP, **heals nearby allies and pets within 110px** for `35%–55%` of their Max HP (making Healer a true support role in Co-op and team PvP), and reduces Heal/Distant ability cooldowns by up to `25%`.

### B. Dynamic Role Detection (`p.st.role`)
In `recalc(p)`:
- Count the weight of equipped armor archetypes (`body` counts as 2 points, `head` and `feet` count as 1 point each) plus weapon affinity (`hammer`/`sword` leans Tank, `axes`/`bow`/`pistols`/`gun` leans Striker, `staff` leans Wizard/Healer).
- Compute the active role label displayed in the **Equipment Screen** header and details panel:
  - **🛡 Tank** (`heavy` dominant)
  - **⚔ Striker** (`light` dominant)
  - **✦ Wizard / Healer** (`mystic` dominant)
  - **⚖ Hybrid** (mixed armor set)

---

## 3. Rebalancing Existing Armors & Completing Tier Sets (`js/items.js` & `js/hero.js`)

We will rebalance existing armors across Tiers 1–7 and add **6 missing armor pieces** so every tier range (Chapters 1–5) offers a complete choice of **Heavy (Tank)**, **Light (Striker)**, and **Mystic (Wizard/Healer)**:

| Tier / Chapter | Heavy (Tank) | Light (Striker) | Mystic (Wizard / Healer) |
| :--- | :--- | :--- | :--- |
| **Tier 1–2** *(Ch 1)* | `iron_helm`, `plate_armor`, `iron_greaves` | `leather_cap`, `padded_vest`, `chainmail`, `leather_boots` | `mystic_hood` *(new)*, `mage_robe`, `silk_shoes` *(new)* |
| **Tier 3–4** *(Ch 2–3)* | `knight_helm`, `warden_helm`, `frost_plate` | `coral_helm`, `tide_mail`, `swift_boots`, `wave_boots`, `wyrm_boots` | `astral_circlet` *(new)*, `runic_robe`, `runic_boots` *(new)* |
| **Tier 5–6** *(Ch 4)* | `stark_wolfhelm`, `kingsguard_plate`, `valyrian_greaves` | `watch_cloak`, `targaryen_scale`, `dornish_boots` | `red_priest_robe` *(new)* |
| **Tier 7** *(Ch 5)* | `vampire_armor`, `dread_greaves` *(new)* | `shadow_ring`, `nightstalker_garb` *(new)* | `crimson_amulet`, `sanctified_vestment` *(new)* |

- All new and Chapter 5 armor pieces (`vampire_armor`, `shadow_ring`, `crimson_amulet`, etc.) will also be registered in `window.HM_HERO.BODY`, `HEAD`, and `FEET` in `js/hero.js` so they render distinctly on the hero sprite and in the Equipment preview.
- Shops (`HM_SHOPS.forge` and chapter shops) and the Dev Mode Gear Spawner will automatically include the new pieces.

---

## 4. UI & Equipment Screen Updates (`js/game.js`)
- **Equipment Screen Header**: Displays the hero's current active Role badge (e.g., `🛡 Tank`, `⚔ Striker`, `✦ Wizard / Healer`) alongside total stats.
- **Item Details & Stat Lines (`statLine` & `gearDetails`)**:
  - Show the armor's archetype (`Heavy · Tank`, `Light · Striker`, `Mystic · Wizard`) and new stats (`ATK SPD`, `MAGIC/HEAL`, `HP`) with green/red comparison deltas when browsing gear.

---

## 5. Verification Plan
1. **Unit Tests (`tests/ch5.test.mjs`)**:
   - Add automated tests verifying all 3 armor archetypes (`heavy`, `light`, `mystic`), `recalc(p)` attack speed / cooldown scaling, Staff magic synergy, Tank HP & knockback reduction, and Healer AoE ally healing.
2. **Build & Runtime Check**:
   - Run `node --test tests/ch4.test.mjs tests/ch5.test.mjs` and `compile_applet` to ensure zero errors and smooth 60 FPS gameplay.
