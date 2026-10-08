/* Hollowmere: gear, shops and side quests (data only; names and texts are in js/i18n_more.js).
 *
 * Gear slots: weapon, head, body, feet. Weapons are swords (melee), bows (arrows) or
 * flintlock guns (slow to reload, hit hard, go through one foe).
 *   atk: damage   cd: frames between attacks   def: armour (6% less damage per point)
 *   spd: extra walking speed (0.1 = 10%)       price: coins at the forge (0 = not sold)
 */
window.HM_ITEMS = {
    stick:        { slot: 'weapon', kind: 'sword', atk: 1, cd: 20, price: 0,   col: '#a07a4a', col2: '#6b4a2e' },
    iron_sword:   { slot: 'weapon', kind: 'sword', atk: 3, cd: 20, price: 0,   col: '#d8e2ee', col2: '#6b4a2e' },
    steel_sword:  { slot: 'weapon', kind: 'sword', atk: 5, cd: 19, price: 140, col: '#f2f7ff', col2: '#3a3f6a' },
    knight_blade: { slot: 'weapon', kind: 'sword', atk: 8, cd: 18, price: 340, col: '#ffffff', col2: '#c9a43a' },
    hunter_bow:   { slot: 'weapon', kind: 'bow',   atk: 2, cd: 26, price: 70,  col: '#8a5a2e', col2: '#e8e0c8' },
    long_bow:     { slot: 'weapon', kind: 'bow',   atk: 4, cd: 24, price: 210, col: '#5a3a1e', col2: '#f2ead2' },
    flintlock:    { slot: 'weapon', kind: 'gun',   atk: 6, cd: 64, price: 190, col: '#3a3a40', col2: '#7a4a2a' },
    musket:       { slot: 'weapon', kind: 'gun',   atk: 11, cd: 80, price: 400, col: '#2e2e34', col2: '#5a3418' },
    leather_cap:  { slot: 'head', def: 1, price: 30,  col: '#7a5230' },
    iron_helm:    { slot: 'head', def: 2, price: 110, col: '#9aa2ae' },
    knight_helm:  { slot: 'head', def: 3, price: 260, col: '#c8d0dc', col2: '#d23a3a' },
    padded_vest:  { slot: 'body', def: 1, price: 40,  col: '#b89a6a' },
    chainmail:    { slot: 'body', def: 3, price: 170, col: '#8c94a0' },
    plate_armor:  { slot: 'body', def: 5, spd: -0.08, price: 380, col: '#d0d8e4', col2: '#c9a43a' },
    leather_boots:{ slot: 'feet', def: 0, spd: 0.1,  price: 35,  col: '#6b4a2e' },
    swift_boots:  { slot: 'feet', def: 1, spd: 0.2,  price: 160, col: '#3a8a5a' },
    iron_greaves: { slot: 'feet', def: 2, spd: 0,    price: 130, col: '#9aa2ae' }
};
window.HM_SLOTS = ['weapon', 'head', 'body', 'feet'];

// what each shop sells, in order. Tobin's forge opens once he has forged your first sword.
window.HM_SHOPS = {
    forge: ['steel_sword', 'knight_blade', 'hunter_bow', 'long_bow', 'flintlock', 'musket',
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
    { id: 'stariron', giver: 'tobin', type: 'fetch', stage: 11, reward: { coins: 40, item: 'steel_sword' } }
];

// what the chests hold (by zone:x,y); anything not listed holds coins
window.HM_CHESTS = {
    'barrow:4,12': { item: 'padded_vest' },
    'barrow:35,17': { coins: 70 },
    'mine:5,18': { item: 'flintlock' },
    'mine:35,23': { coins: 80 },
    'mine:35,13': { star: true }
};
