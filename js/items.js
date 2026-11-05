/* Hollowmere: gear, shops and side quests (data only; names and texts are in js/i18n_more.js).
 *
 * Gear slots: weapon, head, body, feet. Weapons are swords (melee), bows (arrows) or
 * flintlock guns (slow to reload, hit hard, go through one foe).
 *   atk: damage   cd: frames between attacks   def: armour (6% less damage per point)
 *   spd: extra walking speed (0.1 = 10%)       price: coins at the forge (0 = not sold)
 *   tier: 1-5 (4: chapter 2, 5: chapter 3), which areas drop it (and how much upgrades and bonuses are worth)
 *   fx: a "super" weapon (chapter 3 bosses only, never sold or rolled): its attacks have their own effect
 *       wave: every swing also throws a crescent of light   leaf: arrows split in three
 *       chain: bullets jump to two more foes as lightning     void: bolts burst in a ring of void
 */
window.HM_ITEMS = {
    stick:        { slot: 'weapon', tier: 0, kind: 'sword', atk: 1, cd: 20, price: 0,   col: '#a07a4a', col2: '#6b4a2e' },
    iron_sword:   { slot: 'weapon', tier: 1, kind: 'sword', atk: 3, cd: 20, price: 0,   col: '#d8e2ee', col2: '#6b4a2e' },
    steel_sword:  { slot: 'weapon', tier: 2, kind: 'sword', atk: 5, cd: 19, price: 140, col: '#f2f7ff', col2: '#3a3f6a' },
    knight_blade: { slot: 'weapon', tier: 3, kind: 'sword', atk: 8, cd: 18, price: 340, col: '#ffffff', col2: '#c9a43a' },
    hunter_bow:   { slot: 'weapon', tier: 1, kind: 'bow',   atk: 2, cd: 26, price: 70,  col: '#8a5a2e', col2: '#e8e0c8' },
    long_bow:     { slot: 'weapon', tier: 2, kind: 'bow',   atk: 4, cd: 24, price: 210, col: '#5a3a1e', col2: '#f2ead2' },
    flintlock:    { slot: 'weapon', tier: 2, kind: 'gun',   atk: 6, cd: 64, price: 190, col: '#3a3a40', col2: '#7a4a2a' },
    musket:       { slot: 'weapon', tier: 3, kind: 'gun',   atk: 11, cd: 80, price: 400, col: '#2e2e34', col2: '#5a3418' },
    leather_cap:  { slot: 'head', role: 'light',  tier: 1, def: 1, atk: 1, spd: 0.04, atkSpd: 0.06, price: 30,  col: '#7a5230' },
    iron_helm:    { slot: 'head', role: 'heavy',  tier: 2, def: 3, hp: 4,  spd: -0.03, atkSpd: -0.06, price: 110, col: '#9aa2ae' },
    mystic_hood:  { slot: 'head', role: 'mystic', tier: 2, def: 1, hp: 2,  mag: 0.12, spd: 0.03, price: 120, col: '#4a3a5a', col2: '#ffd25a' },
    knight_helm:  { slot: 'head', role: 'heavy',  tier: 3, def: 4, hp: 6,  spd: -0.04, atkSpd: -0.08, price: 260, col: '#c8d0dc', col2: '#d23a3a' },
    padded_vest:  { slot: 'body', role: 'light',  tier: 1, def: 1, atk: 1, spd: 0.05, atkSpd: 0.08, price: 40,  col: '#b89a6a' },
    chainmail:    { slot: 'body', role: 'light',  tier: 2, def: 2, atk: 2, crit: 4, spd: 0.06, atkSpd: 0.10, price: 170, col: '#8c94a0' },
    plate_armor:  { slot: 'body', role: 'heavy',  tier: 3, def: 6, hp: 10, spd: -0.08, atkSpd: -0.14, price: 380, col: '#d0d8e4', col2: '#c9a43a' },
    leather_boots:{ slot: 'feet', role: 'light',  tier: 1, def: 0, atk: 1, spd: 0.10, atkSpd: 0.05, price: 35,  col: '#6b4a2e' },
    swift_boots:  { slot: 'feet', role: 'light',  tier: 2, def: 1, atk: 1, crit: 3, spd: 0.18, atkSpd: 0.08, price: 160, col: '#3a8a5a' },
    iron_greaves: { slot: 'feet', role: 'heavy',  tier: 2, def: 3, hp: 5,  spd: -0.04, atkSpd: -0.06, price: 130, col: '#9aa2ae' },
    silk_shoes:   { slot: 'feet', role: 'mystic', tier: 2, def: 1, hp: 2,  mag: 0.10, spd: 0.10, price: 140, col: '#7a2838', col2: '#ffd25a' },
    // magic staffs: a glowing bolt that bends toward foes
    oak_staff:    { slot: 'weapon', tier: 1, kind: 'staff', atk: 2, cd: 28, price: 90,  col: '#7fd8ff', col2: '#6b4a2e' },
    ember_staff:  { slot: 'weapon', tier: 2, kind: 'staff', atk: 4, cd: 26, price: 230, col: '#ff8a3a', col2: '#5a3418' },
    star_staff:   { slot: 'weapon', tier: 3, kind: 'staff', atk: 7, cd: 24, price: 390, col: '#c77dff', col2: '#3a2a4a' },
    mage_robe:    { slot: 'body', role: 'mystic', tier: 3, def: 2, hp: 4,  mag: 0.20, spd: 0.05, price: 240, col: '#a8322e' },
    // chapter 2 (Larkspur Bay): tier 4
    tide_blade:   { slot: 'weapon', tier: 4, kind: 'sword', atk: 11, cd: 18, price: 620, col: '#bff6ff', col2: '#1d6668' },
    gale_bow:     { slot: 'weapon', tier: 4, kind: 'bow',   atk: 7, cd: 21, price: 580, col: '#3a8a8a', col2: '#e8f6ff' },
    storm_musket: { slot: 'weapon', tier: 4, kind: 'gun',   atk: 15, cd: 74, price: 740, col: '#4a5a6a', col2: '#2a3a4a' },
    tide_staff:   { slot: 'weapon', tier: 4, kind: 'staff', atk: 10, cd: 22, price: 700, col: '#5affd8', col2: '#1d4a5a' },
    coral_helm:   { slot: 'head', role: 'light',  tier: 4, def: 3, atk: 2, crit: 4, spd: 0.05, atkSpd: 0.08, price: 430, col: '#3fb0a6' },
    tide_mail:    { slot: 'body', role: 'light',  tier: 4, def: 5, atk: 3, crit: 5, spd: 0.07, atkSpd: 0.12, price: 690, col: '#2f9c9a' },
    wave_boots:   { slot: 'feet', role: 'light',  tier: 4, def: 2, atk: 2, spd: 0.20, atkSpd: 0.08, price: 490, col: '#1d6668' },
    // chapter 3 (the Veilscar Frontier): tier 5
    frost_blade:  { slot: 'weapon', tier: 5, kind: 'sword', atk: 14, cd: 18, price: 1100, col: '#d8f4ff', col2: '#3a4a6a' },
    runed_bow:    { slot: 'weapon', tier: 5, kind: 'bow',   atk: 9,  cd: 21, price: 1050, col: '#5a6a8a', col2: '#9ad8ff' },
    ash_musket:   { slot: 'weapon', tier: 5, kind: 'gun',   atk: 19, cd: 72, price: 1250, col: '#3a3436', col2: '#7a2a1e' },
    grove_staff:  { slot: 'weapon', tier: 5, kind: 'staff', atk: 13, cd: 22, price: 1200, col: '#7effc8', col2: '#3a5a2e' },
    warden_helm:  { slot: 'head', role: 'heavy',  tier: 5, def: 6, hp: 10, spd: -0.04, atkSpd: -0.08, price: 780, col: '#b8c8e0' },
    astral_circlet:{ slot: 'head', role: 'mystic', tier: 5, def: 3, hp: 5,  mag: 0.16, spd: 0.05, price: 800, col: '#7a5cff', col2: '#9ad8ff' },
    frost_plate:  { slot: 'body', role: 'heavy',  tier: 5, def: 11, hp: 16, spd: -0.06, atkSpd: -0.15, price: 1300, col: '#c8dcf0' },
    runic_robe:   { slot: 'body', role: 'mystic', tier: 5, def: 5, hp: 7,  mag: 0.25, spd: 0.06, price: 1150, col: '#4a3a8a' },
    wyrm_boots:   { slot: 'feet', role: 'light',  tier: 5, def: 3, atk: 3, crit: 4, spd: 0.22, atkSpd: 0.10, price: 820, col: '#6a2a1e' },
    runic_boots:  { slot: 'feet', role: 'mystic', tier: 5, def: 2, hp: 4,  mag: 0.14, spd: 0.14, price: 790, col: '#3a2a6a', col2: '#9ad8ff' },
    // the four super weapons: one from each boss of chapter 3, always legendary
    dawnbreaker:      { slot: 'weapon', tier: 5, kind: 'sword',   atk: 18, cd: 17, price: 0, super: 1, fx: 'wave',    col: '#fff2b0', col2: '#c9a43a' },
    sylvan_warbow:    { slot: 'weapon', tier: 5, kind: 'bow',     atk: 12, cd: 19, price: 0, super: 1, fx: 'leaf',    col: '#4ad87a', col2: '#e8ffe0' },
    thunderforge:     { slot: 'weapon', tier: 5, kind: 'gun',     atk: 24, cd: 66, price: 0, super: 1, fx: 'chain',   col: '#5a6a9a', col2: '#ffd23f' },
    veilstaff:        { slot: 'weapon', tier: 5, kind: 'staff',   atk: 17, cd: 20, price: 0, super: 1, fx: 'void',    col: '#b07aff', col2: '#2a1a3a' },
    // chapter 4 (Westeros & Essos): new two-handed weapon classes & tier 6 gear
    ironwood_axes:    { slot: 'weapon', tier: 5, kind: 'axes',    atk: 15, cd: 19, price: 1150, col: '#b8c4d0', col2: '#4a3628' },
    twin_flintlocks:  { slot: 'weapon', tier: 5, kind: 'pistols', atk: 16, cd: 38, price: 1200, col: '#c8a850', col2: '#3a2418' },
    valyrian_blade:   { slot: 'weapon', tier: 6, kind: 'sword',   atk: 19, cd: 17, price: 1800, col: '#9aa8b8', col2: '#7a1e1e' },
    weirwood_bow:     { slot: 'weapon', tier: 6, kind: 'bow',     atk: 13, cd: 19, price: 1700, col: '#e8e4dc', col2: '#b82828' },
    braavosi_pistols: { slot: 'weapon', tier: 6, kind: 'pistols', atk: 21, cd: 36, price: 1950, col: '#d8b85a', col2: '#2a2228' },
    dothraki_axes:    { slot: 'weapon', tier: 6, kind: 'axes',    atk: 20, cd: 18, price: 1900, col: '#c8d4e0', col2: '#6a3a22' },
    wildfire_staff:   { slot: 'weapon', tier: 6, kind: 'staff',   atk: 18, cd: 20, price: 1850, col: '#4aff7a', col2: '#243a28' },
    baratheon_hammer: { slot: 'weapon', tier: 6, kind: 'hammer',  atk: 24, cd: 28, price: 2000, col: '#7a8490', col2: '#d8b030' },
    stark_wolfhelm:   { slot: 'head', role: 'heavy',  tier: 6, def: 8,  hp: 14, spd: -0.04, atkSpd: -0.08, price: 1350, col: '#8a96a6', col2: '#d8e0e8' },
    kingsguard_plate: { slot: 'body', role: 'heavy',  tier: 6, def: 14, hp: 22, spd: -0.06, atkSpd: -0.16, price: 2100, col: '#f2e6c2', col2: '#d8b04a' },
    targaryen_scale:  { slot: 'body', role: 'light',  tier: 6, def: 8,  atk: 5, crit: 6, spd: 0.06, atkSpd: 0.14, price: 2050, col: '#241e22', col2: '#c82828' },
    watch_cloak:      { slot: 'body', role: 'light',  tier: 6, def: 6,  atk: 6, crit: 8, spd: 0.10, atkSpd: 0.16, price: 1900, col: '#1c1e24', col2: '#4a5260' },
    red_priest_robe:  { slot: 'body', role: 'mystic', tier: 6, def: 6,  hp: 9,  mag: 0.30, spd: 0.07, price: 1950, col: '#b81d24', col2: '#ffb030' },
    dornish_boots:    { slot: 'feet', role: 'light',  tier: 6, def: 3,  atk: 4, crit: 5, spd: 0.25, atkSpd: 0.10, price: 1400, col: '#a84424', col2: '#ffb040' },
    valyrian_greaves: { slot: 'feet', role: 'heavy',  tier: 6, def: 7,  hp: 12, spd: -0.03, atkSpd: -0.06, price: 1500, col: '#5a6472', col2: '#c83030' },
    // chapter 4 legendary super weapons: Winter's Fang, Stormbreaker, Dragonbone Dual Axes, Golden Company Pistols
    winters_fang:     { slot: 'weapon', tier: 6, kind: 'sword',   atk: 24, cd: 16, price: 0, super: 1, fx: 'frost',   col: '#a8ecff', col2: '#e8f4ff' },
    stormbreaker:     { slot: 'weapon', tier: 6, kind: 'hammer',  atk: 32, cd: 26, price: 0, super: 1, fx: 'thunder', col: '#ffd23f', col2: '#3a4250' },
    valyrian_axes:    { slot: 'weapon', tier: 6, kind: 'axes',    atk: 25, cd: 17, price: 0, super: 1, fx: 'whirl',   col: '#ff6a3a', col2: '#2a1e22' },
    golden_pistols:   { slot: 'weapon', tier: 6, kind: 'pistols', atk: 26, cd: 33, price: 0, super: 1, fx: 'barrage', col: '#ffd76a', col2: '#7a1c1c' },
    // chapter 5 (The Blood Kingdoms): Tier 7 gothic cursed & holy relics
    blood_sword:         { slot: 'weapon', tier: 7, kind: 'sword',   atk: 30, cd: 16, price: 2600, super: 1, fx: 'lifesteal', col: '#c81828', col2: '#4a0810' },
    bone_reaper:         { slot: 'weapon', tier: 7, kind: 'axes',    atk: 36, cd: 20, price: 2800, super: 1, fx: 'undeadslayer', col: '#d8ded0', col2: '#283824' },
    holy_relic:          { slot: 'weapon', tier: 7, kind: 'staff',   atk: 28, cd: 18, price: 2500, super: 1, fx: 'holyburn', col: '#ffe660', col2: '#ffd700' },
    shadow_ring:         { slot: 'head', role: 'light',  tier: 7, def: 5,  atk: 5, crit: 8, spd: 0.10, atkSpd: 0.10, price: 1800, col: '#2a1a44', col2: '#8a5cff' },
    crimson_amulet:      { slot: 'head', role: 'mystic', tier: 7, def: 6,  hp: 10, mag: 0.20, spd: 0.06, price: 2000, col: '#e82038', col2: '#ffb030' },
    vampire_armor:       { slot: 'body', role: 'heavy',  tier: 7, def: 17, hp: 28, spd: -0.05, atkSpd: -0.15, price: 2900, col: '#1c1424', col2: '#8a1828' },
    nightstalker_garb:   { slot: 'body', role: 'light',  tier: 7, def: 8,  atk: 7, crit: 10, spd: 0.12, atkSpd: 0.18, price: 2750, col: '#1e1828', col2: '#7a4cff' },
    sanctified_vestment: { slot: 'body', role: 'mystic', tier: 7, def: 7,  hp: 12, mag: 0.35, spd: 0.08, price: 2700, col: '#f4ecd8', col2: '#ffd700' },
    dread_greaves:       { slot: 'feet', role: 'heavy',  tier: 7, def: 8,  hp: 14, spd: -0.03, atkSpd: -0.06, price: 1750, col: '#281822', col2: '#b81828' },
    // chapter 6 (Super Mario: Kingdoms of Wonder): Tier 8 gear & Cosmetic Costumes
    star_rod:            { slot: 'weapon', tier: 8, kind: 'sword',   atk: 35, cd: 15, price: 3200, super: 1, fx: 'wave',    col: '#ffd700', col2: '#ff5277' },
    super_hammer:        { slot: 'weapon', tier: 8, kind: 'hammer',  atk: 44, cd: 24, price: 3400, super: 1, fx: 'thunder', col: '#e62222', col2: '#2e2e34' },
    fire_flower_staff:   { slot: 'weapon', tier: 8, kind: 'staff',   atk: 33, cd: 17, price: 3100, super: 1, fx: 'holyburn',col: '#ff6a1a', col2: '#ffd23f' },
    koopa_bow:           { slot: 'weapon', tier: 8, kind: 'bow',     atk: 26, cd: 18, price: 2950, col: '#28c840', col2: '#ffd23f' },
    bullet_blaster:      { slot: 'weapon', tier: 8, kind: 'pistols', atk: 34, cd: 31, price: 3300, col: '#2a2e38', col2: '#ff3a28' },
    wing_cap_helm:       { slot: 'head', role: 'light',  tier: 8, def: 7,  atk: 6, crit: 10, spd: 0.12, atkSpd: 0.12, price: 2200, col: '#e62222', col2: '#ffffff' },
    royal_star_plate:    { slot: 'body', role: 'heavy',  tier: 8, def: 20, hp: 34, spd: -0.04, atkSpd: -0.14, price: 3500, col: '#ffd700', col2: '#3a78ff' },
    mushroom_tunic:      { slot: 'body', role: 'light',  tier: 8, def: 10, atk: 9, crit: 12, spd: 0.14, atkSpd: 0.20, price: 3300, col: '#e62222', col2: '#2058d8' },
    starlight_robe:      { slot: 'body', role: 'mystic', tier: 8, def: 9,  hp: 16, mag: 0.40, spd: 0.10, price: 3250, col: '#5ad8ff', col2: '#ffd700' },
    plumber_boots:       { slot: 'feet', role: 'light',  tier: 8, def: 5,  atk: 5, crit: 6,  spd: 0.28, atkSpd: 0.12, price: 2100, col: '#6b3e1e', col2: '#ffd23f' },
    // Cosmetic Costumes (Chapter 6 Costume Overlay slot: visual-only, zero combat stats)
    mario_costume:       { slot: 'costume', tier: 8, def: 0, atk: 0, spd: 0, price: 800, cosmetic: true, col: '#e62222', col2: '#2058d8' },
    luigi_costume:       { slot: 'costume', tier: 8, def: 0, atk: 0, spd: 0, price: 800, cosmetic: true, col: '#22b838', col2: '#1a44b8' },
    peach_costume:       { slot: 'costume', tier: 8, def: 0, atk: 0, spd: 0, price: 950, cosmetic: true, col: '#ff85c2', col2: '#ffd700' }
};
window.HM_SLOTS = ['weapon', 'head', 'body', 'feet', 'costume'];
window.HM_COSTUMES = ['mario_costume', 'luigi_costume', 'peach_costume'];

/* Loot. Every piece of gear you own is its own item: { u: id, id: base item, r: rarity, up: +0..+8, b: [[bonus, value]] }
 * Rarity 0 common, 1 rare (1 bonus), 2 epic (2 bonuses), 3 legendary (3 bonuses).
 * Bonuses: a attack, d defence, c crit %, s speed %, h max health, g extra coins % */
window.HM_LOOT = {
    colors: ['#e8e8e8', '#5ab0ff', '#c77dff', '#ffb020'],
    chance: [0.52, 0.28, 0.13, 0.07],             // common, rare, epic, legendary (legendary was 2%: too rare to ever see)
    pity: 18,                                     // after this many pieces of gear without a legendary, the next one is legendary
    bossLegend: 0.35,                             // chance that a boss's piece is legendary (else epic)
    bonuses: { weapon: ['a', 'c', 's', 'g'], armour: ['d', 'h', 's', 'g'] },
    zoneTier: { village: 1, greywood: 1, mireshore: 2, isle: 2, quarry: 2, barrow: 2, mine: 3 },
    foeDrop: 0.035,                               // chance that a normal foe drops gear (bosses always do, rare or better)
    oreDrop: { mite: 0.15, bones: 0.1, sentinel: 1, knight: 1, stonebrute: 0.4, yeti: 0.3, riftborn: 1, hollowsoldier: 0.12, cryptbones: 0.12,
               wight: 0.15, whitewalker: 0.45, giant: 0.5, firewyrm: 0.45, icespider: 0.2, shadow: 0.25, kraken: 1, viserion: 1, nightking: 1,
               blood_bat: 0.15, vampire_thrall: 0.2, vampire_knight: 0.5, flesh_golem: 0.6, dracula: 1, carmilla: 1, orlok: 1, undying_king: 1,
               goomba: 0.15, koopa: 0.2, bobomb: 0.3, dry_bones: 0.25, hammer_bro: 0.4, chain_chomp: 0.5, king_bobomb: 1, petey_piranha: 1, king_boo: 1, kamek: 1, bowser_jr: 1, bowser: 1 },
    bagSize: 48,
    maxUp: 8
};

// what each shop sells, in order. Tobin's forge opens once he has forged your first sword.
window.HM_SHOPS = {
    forge: ['steel_sword', 'knight_blade', 'hunter_bow', 'long_bow', 'flintlock', 'musket', 'oak_staff', 'ember_staff', 'star_staff', 'mage_robe',
            'leather_cap', 'mystic_hood', 'iron_helm', 'knight_helm', 'padded_vest', 'chainmail', 'plate_armor',
            'leather_boots', 'swift_boots', 'silk_shoes', 'iron_greaves', 'blood_sword', 'vampire_armor', 'nightstalker_garb', 'sanctified_vestment', 'dread_greaves',
            'star_rod', 'super_hammer', 'fire_flower_staff', 'koopa_bow', 'bullet_blaster', 'wing_cap_helm', 'royal_star_plate', 'mushroom_tunic', 'starlight_robe', 'plumber_boots'],
    potions: [{ id: 'small', price: 8, heal: 8 }, { id: 'big', price: 20, heal: 99 }],
    costumes: ['mario_costume', 'luigi_costume', 'peach_costume']
};

/* Side quests. All optional, all repeatable to finish (foes come back when you re-enter an area).
 *   kill:   defeat n foes of one kind (counted from when the quest is accepted)
 *   rescue: find someone and talk to them (they then go home); return to the giver
 *   fetch:  find a special chest; return to the giver
 * stage: the main-story step from which the giver offers it; after: a quest that must be done first. */
window.HM_QUESTS = [
    { id: 'biscuit',  giver: 'pip',   type: 'rescue', who: 'biscuit', stage: 1,  reward: { coins: 30, item: 'leather_cap' } },
    { id: 'wolves',   giver: 'bram',  type: 'kill', foe: 'wolf', n: 5, stage: 2,  reward: { coins: 50, item: 'leather_boots' } },
    { id: 'tam',      giver: 'bram',  type: 'rescue', who: 'tam', stage: 2, after: 'wolves', reward: { coins: 90, item: 'hunter_bow' } },
    { id: 'crawlers', giver: 'hana',  type: 'kill', foe: 'crawler', n: 6, stage: 6, reward: { coins: 60, big: 2 } },
    { id: 'mites',    giver: 'odo',   type: 'kill', foe: 'mite', n: 6, stage: 11, reward: { coins: 80, item: 'iron_helm' } },
    { id: 'stariron', giver: 'tobin', type: 'fetch', stage: 11, reward: { coins: 40, item: 'steel_sword' } },
    // animals: Hana's kitten becomes your cat; Odo's warhorse and a wolf pup become mounts
    { id: 'kitten',   giver: 'hana',  type: 'rescue', who: 'kitten', stage: 6, reward: { coins: 20, pet: 'cat' } },
    { id: 'pup',      giver: 'bram',  type: 'rescue', who: 'pup', stage: 4, after: 'tam', reward: { coins: 30, mount: 'wolf' } },
    { id: 'bramble',  giver: 'odo',   type: 'rescue', who: 'bramble', stage: 11, after: 'mites', reward: { coins: 40, mount: 'horse' } }
];

// mounts: speed multiplier, and the price at Hana's store (expensive on purpose: quests give them for free)
// the dragon flies over water and low things; it is won in chapter 2 (never sold)
// the Hollow Charger (chapter 3, from the Hollow King): a ghostly winged steed of the Veil, the fastest of all, and it flies
// Shadowmane & Frostfang (chapter 4)
// Nightmare Steed, Bloodfang, Bone Charger, Night Terror (chapter 5)
window.HM_MOUNTS = {
    horse: { speed: 1.75, price: 700 },
    wolf: { speed: 1.5, price: 900, bite: true },
    shadowmane: { speed: 2.0, price: 1400, trample: true },
    frostfang: { speed: 1.95, price: 1400, bite: true },
    dragon: { speed: 2.1, price: 0, fly: true },
    charger: { speed: 2.3, price: 0, fly: true },
    nightmare: { speed: 2.35, price: 2000, trample: true },
    bloodfang: { speed: 2.25, price: 1900, bite: true },
    bonecharger: { speed: 2.4, price: 2200, fly: true },
    nightterror: { speed: 2.5, price: 0, fly: true }
};

// what the chests hold (by zone:x,y); anything not listed holds coins
window.HM_CHESTS = {
    'barrow:4,12': { item: 'padded_vest' },
    'barrow:35,17': { coins: 70 },
    'mine:5,18': { item: 'flintlock' },
    'mine:35,23': { coins: 80 },
    'mine:35,13': { star: true }
};
