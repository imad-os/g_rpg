/* Hollowmere: gear, shops and side quests (data only; names and texts are in js/i18n_more.js).
 *
 * Gear slots: weapon, head, body, feet. Weapons are swords (melee), bows (arrows) or
 * flintlock guns (slow to reload, hit hard, go through one foe).
 *   atk: damage   cd: frames between attacks   def: armour (6% less damage per point)
 *   spd: extra walking speed (0.1 = 10%)       price: coins at the forge (0 = not sold)
 *   tier: 1-4 (4: chapter 2), which areas drop it (and how much upgrades and bonuses are worth)
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
    leather_cap:  { slot: 'head', tier: 1, def: 1, price: 30,  col: '#7a5230' },
    iron_helm:    { slot: 'head', tier: 2, def: 2, price: 110, col: '#9aa2ae' },
    knight_helm:  { slot: 'head', tier: 3, def: 3, price: 260, col: '#c8d0dc', col2: '#d23a3a' },
    padded_vest:  { slot: 'body', tier: 1, def: 1, price: 40,  col: '#b89a6a' },
    chainmail:    { slot: 'body', tier: 2, def: 3, price: 170, col: '#8c94a0' },
    plate_armor:  { slot: 'body', tier: 3, def: 5, spd: -0.08, price: 380, col: '#d0d8e4', col2: '#c9a43a' },
    leather_boots:{ slot: 'feet', tier: 1, def: 0, spd: 0.1,  price: 35,  col: '#6b4a2e' },
    swift_boots:  { slot: 'feet', tier: 2, def: 1, spd: 0.2,  price: 160, col: '#3a8a5a' },
    iron_greaves: { slot: 'feet', tier: 2, def: 2, spd: 0,    price: 130, col: '#9aa2ae' },
    // magic staffs: a glowing bolt that bends toward foes
    oak_staff:    { slot: 'weapon', tier: 1, kind: 'staff', atk: 2, cd: 28, price: 90,  col: '#7fd8ff', col2: '#6b4a2e' },
    ember_staff:  { slot: 'weapon', tier: 2, kind: 'staff', atk: 4, cd: 26, price: 230, col: '#ff8a3a', col2: '#5a3418' },
    star_staff:   { slot: 'weapon', tier: 3, kind: 'staff', atk: 7, cd: 24, price: 390, col: '#c77dff', col2: '#3a2a4a' },
    mage_robe:    { slot: 'body', tier: 3, def: 2, spd: 0.05, price: 240, col: '#a8322e' },
    // chapter 2 (Larkspur Bay): tier 4
    tide_blade:   { slot: 'weapon', tier: 4, kind: 'sword', atk: 11, cd: 18, price: 620, col: '#bff6ff', col2: '#1d6668' },
    gale_bow:     { slot: 'weapon', tier: 4, kind: 'bow',   atk: 7, cd: 21, price: 580, col: '#3a8a8a', col2: '#e8f6ff' },
    storm_musket: { slot: 'weapon', tier: 4, kind: 'gun',   atk: 15, cd: 74, price: 740, col: '#4a5a6a', col2: '#2a3a4a' },
    tide_staff:   { slot: 'weapon', tier: 4, kind: 'staff', atk: 10, cd: 22, price: 700, col: '#5affd8', col2: '#1d4a5a' },
    coral_helm:   { slot: 'head', tier: 4, def: 4, price: 430, col: '#3fb0a6' },
    tide_mail:    { slot: 'body', tier: 4, def: 7, price: 690, col: '#2f9c9a' },
    wave_boots:   { slot: 'feet', tier: 4, def: 2, spd: 0.22, price: 490, col: '#1d6668' }
};
window.HM_SLOTS = ['weapon', 'head', 'body', 'feet'];

/* Loot. Every piece of gear you own is its own item: { u: id, id: base item, r: rarity, up: +0..+5, b: [[bonus, value]] }
 * Rarity 0 common, 1 rare (1 bonus), 2 epic (2 bonuses), 3 legendary (3 bonuses).
 * Bonuses: a attack, d defence, c crit %, s speed %, h max health, g extra coins % */
window.HM_LOOT = {
    colors: ['#e8e8e8', '#5ab0ff', '#c77dff', '#ffb020'],
    chance: [0.65, 0.25, 0.08, 0.02],             // common, rare, epic, legendary
    bonuses: { weapon: ['a', 'c', 's', 'g'], armour: ['d', 'h', 's', 'g'] },
    zoneTier: { village: 1, greywood: 1, mireshore: 2, isle: 2, quarry: 2, barrow: 2, mine: 3 },
    foeDrop: 0.035,                               // chance that a normal foe drops gear (bosses always do, rare or better)
    oreDrop: { mite: 0.15, bones: 0.1, sentinel: 1, knight: 1 },
    bagSize: 36,
    maxUp: 5
};

// what each shop sells, in order. Tobin's forge opens once he has forged your first sword.
window.HM_SHOPS = {
    forge: ['steel_sword', 'knight_blade', 'hunter_bow', 'long_bow', 'flintlock', 'musket', 'oak_staff', 'ember_staff', 'star_staff', 'mage_robe',
            'leather_cap', 'iron_helm', 'knight_helm', 'padded_vest', 'chainmail', 'plate_armor',
            'leather_boots', 'swift_boots', 'iron_greaves'],
    potions: [{ id: 'small', price: 8, heal: 8 }, { id: 'big', price: 20, heal: 99 }]
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
window.HM_MOUNTS = { horse: { speed: 1.75, price: 700 }, wolf: { speed: 1.5, price: 900, bite: true }, dragon: { speed: 2.1, price: 0, fly: true } };

// what the chests hold (by zone:x,y); anything not listed holds coins
window.HM_CHESTS = {
    'barrow:4,12': { item: 'padded_vest' },
    'barrow:35,17': { coins: 70 },
    'mine:5,18': { item: 'flintlock' },
    'mine:35,23': { coins: 80 },
    'mine:35,13': { star: true }
};
