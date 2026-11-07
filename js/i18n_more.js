/* Hollowmere: texts for gear, shops, dungeons and side quests, in 4 languages.
 * Merged into HM_TEXT (js/i18n.js) when the page loads. */
window.HM_TEXT_MORE = {
en: {
    ui: {
        gotCoins: '+{n} coins', gotItem: 'You got: {item}!', atk: 'ATK', def: 'DEF', spd: 'SPD', sword: 'Sword', bow: 'Bow', gun: 'Gun',
        qReturn: 'Return to {npc}.', qNew: 'New quest: {name}', qDoneGo: 'Quest done: {name}! Return to {npc}.', qReward: 'Reward: {r}',
        nCoins: '{n} coins', potS: 'Small potion', potB: 'Big potion', mEquip: 'Equipment', mPotionS: 'Small potion ({n})', mPotionB: 'Big potion ({n})',
        browseForge: 'Show me your weapons and armour.', browsePotions: 'I need potions.', askWork: 'Any work for me?', reward: 'Reward',
        accept: 'Accept', later: 'Not now', sideQuests: 'Side quests', forge: 'Tobin\'s Forge', owned: 'Owned', bought2: 'Bought: {item}! (now worn)',
        potionShop: 'Hana\'s Potions', healN: 'Heals {n}', healFull: 'Heals fully', equip: 'Equipment', none: 'None', equipped: 'Worn', back: 'Back',
        slot_weapon: 'Weapon', slot_head: 'Head', slot_body: 'Body', slot_feet: 'Feet', slot_costume: 'Costume',
        mMushroom: 'Super Mushroom ({n})', gotMushroom: 'You got a Super Mushroom! (1.5× Giant Power + Heal)',
        usedMushroom: '🍄 Super Mushroom! 1.5× Giant Scale & Full Vitality!',
        costumeShop: 'Toadette\'s Royal Costume Boutique', cosmeticOnly: 'Cosmetic Overlay (Keeps Armor Stats)',
        browseCostumes: 'Show me your royal costumes!'
    },
    items: {
        stick: 'Walking stick', iron_sword: 'Iron sword', steel_sword: 'Star-steel sword', knight_blade: 'Knight\'s blade',
        hunter_bow: 'Hunter\'s bow', long_bow: 'Longbow', flintlock: 'Flintlock pistol', musket: 'Musket',
        leather_cap: 'Leather cap', iron_helm: 'Iron helm', knight_helm: 'Knight\'s helm',
        padded_vest: 'Padded vest', chainmail: 'Chain mail', plate_armor: 'Plate armour',
        leather_boots: 'Leather boots', swift_boots: 'Swift boots', iron_greaves: 'Iron greaves',
        star_rod: 'Star Rod Blade', super_hammer: 'Ultra Star Hammer', fire_flower_staff: 'Fire Flower Staff',
        koopa_bow: 'Koopa Shell Bow', bullet_blaster: 'Bullet Bill Blasters', wing_cap_helm: 'Wing Cap Helm',
        royal_star_plate: 'Royal Star Plate', mushroom_tunic: 'Super Star Tunic', starlight_robe: 'Rosalina\'s Starlight Robe',
        plumber_boots: 'Super Jump Boots', mario_costume: 'Mario Costume', luigi_costume: 'Luigi Costume', peach_costume: 'Princess Peach Costume',
        kokiri_sword: 'Kokiri Sword', master_sword: 'Master Sword', biggoron_sword: 'Biggoron\'s Sword', megaton_hammer: 'Megaton Hammer',
        fairy_bow: 'Fairy Bow', sages_staff: 'Sages\' Triforce Staff', hylian_helm: 'Hero\'s Cap & Hylian Crest', mirror_helm: 'Mirror Shield Crest',
        kokiri_tunic: 'Kokiri Tunic', goron_tunic: 'Goron Tunic', zora_tunic: 'Zora Tunic', iron_boots: 'Iron Boots', hover_boots: 'Hover Boots',
        link_costume: 'Hero of Time Tunic', sheik_costume: 'Sheikah Garb', zelda_costume: 'Princess Zelda Gown'
    },
    zone: { barrow: 'The Barrow Crypt', mine: 'The Deep Mine' },
    boss: { knight: 'The Crypt Knight' },
    obj: { '11': 'Open the gate north of the village and find the Ember of Stone deep in the mine below the quarry.' },
    lines: {
        hana: ['Potions! Small ones for eight coins, big ones for twenty. They taste like pine needles, but they work.'],
        tamFound: ['You came for me? I thought nobody would. That knight out there... it never sleeps.', 'I\'m running straight home. Tell Master Bram I\'m sorry!'],
        biscuitFound: ['Woof! Woof! (Biscuit wags his whole body and dashes off toward the village.)'],
        tamHome: ['I\'m never going into a crypt again. Probably.'],
        biscuitHome: ['Woof!'],
        knightDown: ['The Crypt Knight sinks to one knee, and its armour crumbles into dust.'],
        starFound: ['Inside the chest, bars of star iron glow faintly, like frost under moonlight.']
    },
    quests: {
        biscuit: { title: 'Where\'s Biscuit?', goal: 'Find Biscuit, Pip\'s dog, in the Greywood.',
            offer: ['Biscuit chased a squirrel into the Greywood, and he hasn\'t come back!', 'He\'s small and brown and he always comes when you call. Please find him!'],
            done: ['Biscuit! You found him! He\'s all muddy... the best kind of dog.', 'Here, take my lucky cap. And these coins, I was saving them for something important.'] },
        wolves: { title: 'Wolves at the Woodpile', goal: 'Defeat wolves in the Greywood ({n}/{m}).',
            offer: ['The Hush has made the wolves bold. They circle my woodpile every night.', 'Thin out the pack, five of them, and I\'ll pay you. My spare boots too.'],
            done: ['Five wolves! The wood is quieter already.', 'Here\'s your pay, and the boots. They\'ve walked more miles than I have.'] },
        tam: { title: 'Lost in the Barrow', goal: 'Find Tam, Bram\'s apprentice, in the Barrow Crypt.',
            offer: ['My apprentice Tam went into the Barrow Crypt to prove he was brave. That was yesterday.', 'The doorway is in the trees at the south of the wood. Something old guards those halls. Please, bring him back.'],
            done: ['Tam came home white as chalk, but in one piece. I owe you more than I can say.', 'Take my hunting bow. Tam won\'t be going near anything dangerous for a while.'] },
        crawlers: { title: 'Pests in the Mire', goal: 'Defeat mire crawlers ({n}/{m}).',
            offer: ['The crawlers keep eating the herbs I pick on the Mirefen shore.', 'Squash six of them and I\'ll pay you, plus two of my big potions.'],
            done: ['Six crawlers! My herbs thank you, and so do I.', 'Two big potions, as promised. They heal everything except bad jokes.'] },
        mites: { title: 'Rock Mites', goal: 'Defeat stone mites in the quarry or the mine ({n}/{m}).',
            offer: ['Stone mites keep crawling out of the quarry and gnawing on my gate.', 'Crush six of them and my old iron helm is yours. It has kept my head on for twenty years.'],
            done: ['That\'ll teach them. Here, the helm. Mind the dent; it has a story.'] },
        stariron: { title: 'Star Iron', goal: 'Find the chest of star iron in the Deep Mine.',
            offer: ['When I worked the quarry, we found star iron deep in the mine, and hid a chest of it before we sealed the lower halls.', 'Bring it to me and I\'ll forge you a blade worth carrying.'],
            done: ['Star iron... still singing after all these years.', 'There. A sword folded with star iron. Don\'t make me regret it.'] }
    }
},

fr: {
    ui: {
        gotCoins: '+{n} pièces', gotItem: 'Vous obtenez : {item} !', atk: 'ATQ', def: 'DÉF', spd: 'VIT', sword: 'Épée', bow: 'Arc', gun: 'Arme à feu',
        qReturn: 'Retournez voir {npc}.', qNew: 'Nouvelle quête : {name}', qDoneGo: 'Quête terminée : {name} ! Retournez voir {npc}.', qReward: 'Récompense : {r}',
        nCoins: '{n} pièces', potS: 'Petite potion', potB: 'Grande potion', mEquip: 'Équipement', mPotionS: 'Petite potion ({n})', mPotionB: 'Grande potion ({n})',
        browseForge: 'Montrez-moi vos armes et armures.', browsePotions: 'Il me faut des potions.', askWork: 'Vous avez du travail pour moi ?', reward: 'Récompense',
        accept: 'Accepter', later: 'Pas maintenant', sideQuests: 'Quêtes secondaires', forge: 'La forge de Tobin', owned: 'Possédé', bought2: 'Acheté : {item} ! (équipé)',
        potionShop: 'Les potions de Hana', healN: 'Soigne {n}', healFull: 'Soigne tout', equip: 'Équipement', none: 'Aucun', equipped: 'Porté', back: 'Retour',
        slot_weapon: 'Arme', slot_head: 'Tête', slot_body: 'Corps', slot_feet: 'Pieds', slot_costume: 'Costume',
        mMushroom: 'Super Champignon ({n})', gotMushroom: 'Vous obtenez un Super Champignon ! (Taille 1,5× + Soin)',
        usedMushroom: '🍄 Super Champignon ! Taille géante 1,5× et vitalité restaurée !',
        costumeShop: 'Boutique Royale de Costumes de Toadette', cosmeticOnly: 'Apparence cosmétique (garde vos stats)',
        browseCostumes: 'Montrez-moi vos costumes royaux !'
    },
    items: {
        stick: 'Bâton de marche', iron_sword: 'Épée de fer', steel_sword: 'Épée d\'acier-étoile', knight_blade: 'Lame de chevalier',
        hunter_bow: 'Arc de chasseur', long_bow: 'Arc long', flintlock: 'Pistolet à silex', musket: 'Mousquet',
        leather_cap: 'Bonnet de cuir', iron_helm: 'Casque de fer', knight_helm: 'Heaume de chevalier',
        padded_vest: 'Gilet matelassé', chainmail: 'Cotte de mailles', plate_armor: 'Armure de plates',
        leather_boots: 'Bottes de cuir', swift_boots: 'Bottes de vitesse', iron_greaves: 'Jambières de fer',
        star_rod: 'Lame Bâton Étoile', super_hammer: 'Ultra Marteau Étoile', fire_flower_staff: 'Sceptre Fleur de Feu',
        koopa_bow: 'Arc Carapace Koopa', bullet_blaster: 'Pistolets Bill Balle', wing_cap_helm: 'Casquette Ailée',
        royal_star_plate: 'Armure Étoile Royale', mushroom_tunic: 'Tunique Super Étoile', starlight_robe: 'Robe Stellaire d\'Harmonie',
        plumber_boots: 'Bottes de Super Saut', mario_costume: 'Costume de Mario', luigi_costume: 'Costume de Luigi', peach_costume: 'Costume de Princesse Peach',
        kokiri_sword: 'Épée Kokiri', master_sword: 'Épée de Légende (Master Sword)', biggoron_sword: 'Épée de Biggoron', megaton_hammer: 'Masse des Titans',
        fairy_bow: 'Arc des Fées', sages_staff: 'Sceptre de la Triforce', hylian_helm: 'Bonnet du Héros Hylien', mirror_helm: 'Blason du Bouclier Miroir',
        kokiri_tunic: 'Tunique Kokiri', goron_tunic: 'Tunique Goron', zora_tunic: 'Tunique Zora', iron_boots: 'Bottes de Plomb', hover_boots: 'Bottes des Airs',
        link_costume: 'Costume du Héros du Temps', sheik_costume: 'Tenue de Sheik', zelda_costume: 'Robe de la Princesse Zelda'
    },
    zone: { barrow: 'La Crypte du Tertre', mine: 'La Mine Profonde' },
    boss: { knight: 'Le Chevalier de la Crypte' },
    obj: { '11': 'Ouvrez la grille au nord du village et trouvez la Braise de la Pierre au fond de la mine, sous la carrière.' },
    lines: {
        hana: ['Des potions ! Les petites à huit pièces, les grandes à vingt. Elles ont un goût d\'aiguilles de pin, mais elles marchent.'],
        tamFound: ['Vous êtes venus me chercher ? Je pensais que personne ne viendrait. Ce chevalier, là-bas... il ne dort jamais.', 'Je rentre tout de suite. Dites à maître Bram que je suis désolé !'],
        biscuitFound: ['Ouaf ! Ouaf ! (Biscuit remue tout son corps et file vers le village.)'],
        tamHome: ['Je ne remettrai plus jamais les pieds dans une crypte. Enfin, sûrement.'],
        biscuitHome: ['Ouaf !'],
        knightDown: ['Le Chevalier de la Crypte pose un genou à terre, et son armure tombe en poussière.'],
        starFound: ['Dans le coffre, des lingots de fer-étoile luisent faiblement, comme du givre sous la lune.']
    },
    quests: {
        biscuit: { title: 'Où est Biscuit ?', goal: 'Retrouvez Biscuit, le chien de Pip, dans le Boisgris.',
            offer: ['Biscuit a poursuivi un écureuil dans le Boisgris, et il n\'est pas revenu !', 'Il est petit et brun, et il vient toujours quand on l\'appelle. Retrouvez-le, s\'il vous plaît !'],
            done: ['Biscuit ! Vous l\'avez trouvé ! Il est tout boueux... le meilleur genre de chien.', 'Tenez, mon bonnet porte-bonheur. Et ces pièces, je les gardais pour quelque chose d\'important.'] },
        wolves: { title: 'Des loups près du bûcher', goal: 'Vainquez des loups dans le Boisgris ({n}/{m}).',
            offer: ['Le Silence a rendu les loups hardis. Ils tournent autour de mon tas de bois chaque nuit.', 'Éclaircissez la meute, cinq d\'entre eux, et je vous paierai. Mes bottes de rechange en plus.'],
            done: ['Cinq loups ! Le bois est déjà plus calme.', 'Voici votre paie, et les bottes. Elles ont marché plus de lieues que moi.'] },
        tam: { title: 'Perdu dans le Tertre', goal: 'Retrouvez Tam, l\'apprenti de Bram, dans la Crypte du Tertre.',
            offer: ['Mon apprenti Tam est entré dans la Crypte du Tertre pour prouver son courage. C\'était hier.', 'L\'entrée est dans les arbres, au sud du bois. Quelque chose d\'ancien garde ces salles. Ramenez-le, je vous en prie.'],
            done: ['Tam est rentré blanc comme un linge, mais entier. Je vous dois plus que je ne peux dire.', 'Prenez mon arc de chasse. Tam ne s\'approchera de rien de dangereux avant longtemps.'] },
        crawlers: { title: 'Nuisibles du marais', goal: 'Vainquez des rampeurs du marais ({n}/{m}).',
            offer: ['Les rampeurs mangent les herbes que je cueille sur la rive de la Fangemare.', 'Écrasez-en six et je vous paierai, avec deux de mes grandes potions.'],
            done: ['Six rampeurs ! Mes herbes vous remercient, et moi aussi.', 'Deux grandes potions, comme promis. Elles soignent tout, sauf les mauvaises blagues.'] },
        mites: { title: 'Mites de pierre', goal: 'Vainquez des mites de pierre dans la carrière ou la mine ({n}/{m}).',
            offer: ['Les mites de pierre sortent de la carrière et rongent ma grille.', 'Écrasez-en six et mon vieux casque de fer est à vous. Il m\'a gardé la tête sur les épaules pendant vingt ans.'],
            done: ['Ça leur apprendra. Tenez, le casque. Attention à la bosse : elle a une histoire.'] },
        stariron: { title: 'Le fer-étoile', goal: 'Trouvez le coffre de fer-étoile dans la Mine Profonde.',
            offer: ['Quand je travaillais à la carrière, on a trouvé du fer-étoile au fond de la mine, et on en a caché un coffre avant de murer les galeries.', 'Rapportez-le-moi et je vous forgerai une lame digne de ce nom.'],
            done: ['Du fer-étoile... il chante encore après toutes ces années.', 'Voilà. Une épée repliée au fer-étoile. Ne me faites pas regretter.'] }
    }
},

es: {
    ui: {
        gotCoins: '+{n} monedas', gotItem: '¡Consigues: {item}!', atk: 'ATQ', def: 'DEF', spd: 'VEL', sword: 'Espada', bow: 'Arco', gun: 'Arma de fuego',
        qReturn: 'Vuelve con {npc}.', qNew: 'Nueva misión: {name}', qDoneGo: '¡Misión cumplida: {name}! Vuelve con {npc}.', qReward: 'Recompensa: {r}',
        nCoins: '{n} monedas', potS: 'Poción pequeña', potB: 'Poción grande', mEquip: 'Equipo', mPotionS: 'Poción pequeña ({n})', mPotionB: 'Poción grande ({n})',
        browseForge: 'Enséñame tus armas y armaduras.', browsePotions: 'Necesito pociones.', askWork: '¿Tienes trabajo para mí?', reward: 'Recompensa',
        accept: 'Aceptar', later: 'Ahora no', sideQuests: 'Misiones secundarias', forge: 'La forja de Tobin', owned: 'Tuyo', bought2: '¡Comprado: {item}! (equipado)',
        potionShop: 'Las pociones de Hana', healN: 'Cura {n}', healFull: 'Cura del todo', equip: 'Equipo', none: 'Nada', equipped: 'Puesto', back: 'Volver',
        slot_weapon: 'Arma', slot_head: 'Cabeza', slot_body: 'Cuerpo', slot_feet: 'Pies', slot_costume: 'Disfraz',
        mMushroom: 'Superchampiñón ({n})', gotMushroom: '¡Conseguiste un Superchampiñón! (Escala 1.5× + Cura)',
        usedMushroom: '🍄 ¡Superchampiñón! ¡Tamaño gigante 1.5× y salud restaurada!',
        costumeShop: 'Boutique Real de Disfraces de Toadette', cosmeticOnly: 'Atuendo cosmético (mantiene tus estadísticas)',
        browseCostumes: '¡Enséñame tus disfraces reales!'
    },
    items: {
        stick: 'Bastón', iron_sword: 'Espada de hierro', steel_sword: 'Espada de acero estelar', knight_blade: 'Hoja de caballero',
        hunter_bow: 'Arco de cazador', long_bow: 'Arco largo', flintlock: 'Pistola de chispa', musket: 'Mosquete',
        leather_cap: 'Gorro de cuero', iron_helm: 'Yelmo de hierro', knight_helm: 'Yelmo de caballero',
        padded_vest: 'Chaleco acolchado', chainmail: 'Cota de malla', plate_armor: 'Armadura de placas',
        leather_boots: 'Botas de cuero', swift_boots: 'Botas veloces', iron_greaves: 'Grebas de hierro',
        star_rod: 'Espada Cetro Estelar', super_hammer: 'Ultra Martillo Estelar', fire_flower_staff: 'Báculo Flor de Fuego',
        koopa_bow: 'Arco Caparazón Koopa', bullet_blaster: 'Pistolas Bill Bala', wing_cap_helm: 'Gorra Alada',
        royal_star_plate: 'Coraza Estrella Real', mushroom_tunic: 'Túnica Superestrella', starlight_robe: 'Túnica Estelar de Estela',
        plumber_boots: 'Botas de Supersalto', mario_costume: 'Disfraz de Mario', luigi_costume: 'Disfraz de Luigi', peach_costume: 'Disfraz de Princesa Peach',
        kokiri_sword: 'Espada Kokiri', master_sword: 'Espada Maestra', biggoron_sword: 'Espada de Biggoron', megaton_hammer: 'Martillo Megatón',
        fairy_bow: 'Arco de las Hadas', sages_staff: 'Báculo de la Trifuerza', hylian_helm: 'Gorro del Héroe Hyliano', mirror_helm: 'Emblema del Escudo Espejo',
        kokiri_tunic: 'Túnica Kokiri', goron_tunic: 'Túnica Goron', zora_tunic: 'Túnica Zora', iron_boots: 'Botas de Hierro', hover_boots: 'Botas Voladoras',
        link_costume: 'Disfraz del Héroe del Tiempo', sheik_costume: 'Atuendo de Sheik', zelda_costume: 'Vestido de la Princesa Zelda'
    },
    zone: { barrow: 'La Cripta del Túmulo', mine: 'La Mina Profunda' },
    boss: { knight: 'El Caballero de la Cripta' },
    obj: { '11': 'Abre la verja al norte del pueblo y encuentra el Ascua de la Piedra en lo más hondo de la mina, bajo la cantera.' },
    lines: {
        hana: ['¡Pociones! Las pequeñas a ocho monedas, las grandes a veinte. Saben a agujas de pino, pero funcionan.'],
        tamFound: ['¿Vinisteis a por mí? Creía que nadie vendría. Ese caballero de ahí fuera... nunca duerme.', '¡Me voy derecho a casa! ¡Decidle al maestro Bram que lo siento!'],
        biscuitFound: ['¡Guau! ¡Guau! (Galleta mueve todo el cuerpo y sale corriendo hacia el pueblo.)'],
        tamHome: ['No vuelvo a entrar en una cripta nunca más. Seguramente.'],
        biscuitHome: ['¡Guau!'],
        knightDown: ['El Caballero de la Cripta hinca una rodilla, y su armadura se deshace en polvo.'],
        starFound: ['Dentro del cofre, barras de hierro estelar brillan débilmente, como escarcha bajo la luna.']
    },
    quests: {
        biscuit: { title: '¿Dónde está Galleta?', goal: 'Encuentra a Galleta, el perro de Pip, en el Bosquegrís.',
            offer: ['¡Galleta persiguió a una ardilla hasta el Bosquegrís y no ha vuelto!', 'Es pequeño y marrón, y siempre viene cuando lo llamas. ¡Encuéntralo, por favor!'],
            done: ['¡Galleta! ¡Lo encontraste! Está lleno de barro... el mejor tipo de perro.', 'Toma, mi gorro de la suerte. Y estas monedas, las guardaba para algo importante.'] },
        wolves: { title: 'Lobos en la leñera', goal: 'Derrota lobos en el Bosquegrís ({n}/{m}).',
            offer: ['El Silencio ha vuelto atrevidos a los lobos. Rondan mi leñera cada noche.', 'Diezma la manada, cinco de ellos, y te pagaré. Y te doy mis botas de repuesto.'],
            done: ['¡Cinco lobos! El bosque ya está más tranquilo.', 'Aquí tienes tu paga, y las botas. Han andado más leguas que yo.'] },
        tam: { title: 'Perdido en el Túmulo', goal: 'Encuentra a Tam, el aprendiz de Bram, en la Cripta del Túmulo.',
            offer: ['Mi aprendiz Tam entró en la Cripta del Túmulo para demostrar que es valiente. Eso fue ayer.', 'La entrada está entre los árboles, al sur del bosque. Algo antiguo guarda esas salas. Tráelo de vuelta, por favor.'],
            done: ['Tam volvió blanco como la cal, pero entero. Te debo más de lo que puedo decir.', 'Toma mi arco de caza. Tam no se acercará a nada peligroso en mucho tiempo.'] },
        crawlers: { title: 'Plagas del pantano', goal: 'Derrota reptadores del pantano ({n}/{m}).',
            offer: ['Los reptadores se comen las hierbas que recojo en la orilla de Lodomar.', 'Aplasta seis y te pagaré, además de dos de mis pociones grandes.'],
            done: ['¡Seis reptadores! Mis hierbas te lo agradecen, y yo también.', 'Dos pociones grandes, como prometí. Lo curan todo menos los chistes malos.'] },
        mites: { title: 'Ácaros de piedra', goal: 'Derrota ácaros de piedra en la cantera o la mina ({n}/{m}).',
            offer: ['Los ácaros de piedra salen de la cantera y roen mi verja.', 'Aplasta seis y mi viejo yelmo de hierro es tuyo. Me ha mantenido la cabeza en su sitio veinte años.'],
            done: ['Así aprenderán. Toma, el yelmo. Cuidado con la abolladura: tiene su historia.'] },
        stariron: { title: 'Hierro estelar', goal: 'Encuentra el cofre de hierro estelar en la Mina Profunda.',
            offer: ['Cuando trabajaba en la cantera, encontramos hierro estelar en lo hondo de la mina, y escondimos un cofre antes de tapiar las galerías.', 'Tráemelo y te forjaré una hoja que valga la pena.'],
            done: ['Hierro estelar... todavía canta después de tantos años.', 'Ahí tienes. Una espada plegada con hierro estelar. No me hagas arrepentirme.'] }
    }
},

ar: {
    ui: {
        gotCoins: '+{n} عملة', gotItem: 'حصلت على: {item}!', atk: 'هجوم', def: 'دفاع', spd: 'سرعة', sword: 'سيف', bow: 'قوس', gun: 'بندقية',
        qReturn: 'ارجع إلى {npc}.', qNew: 'مهمة جديدة: {name}', qDoneGo: 'أنهيت المهمة: {name}! ارجع إلى {npc}.', qReward: 'الجائزة: {r}',
        nCoins: '{n} عملة', potS: 'دواء صغير', potB: 'دواء كبير', mEquip: 'أغراضي', mPotionS: 'دواء صغير ({n})', mPotionB: 'دواء كبير ({n})',
        browseForge: 'أرني السيوف والدروع.', browsePotions: 'أريد أدوية.', askWork: 'هل عندك عمل لي؟', reward: 'الجائزة',
        accept: 'موافق', later: 'ليس الآن', sideQuests: 'مهام إضافية', forge: 'ورشة توبين', owned: 'عندك', bought2: 'اشتريت: {item}! (لبسته)',
        potionShop: 'أدوية هانا', healN: 'يعيد {n} صحة', healFull: 'يعيد كل الصحة', equip: 'أغراضي', none: 'لا شيء', equipped: 'ألبسه', back: 'رجوع',
        slot_weapon: 'السلاح', slot_head: 'الرأس', slot_body: 'الجسم', slot_feet: 'القدمان', slot_costume: 'الزي',
        mMushroom: 'الفطر الخارق ({n})', gotMushroom: 'حصلت على الفطر الخارق! (حجم عملاق 1.5× + شفاء)',
        usedMushroom: '🍄 الفطر الخارق! حجم عملاق 1.5× وشفاء كامل!',
        costumeShop: 'متجر توديت للأزياء الملكية', cosmeticOnly: 'مظهر تجميلي (يحافظ على قوة دروعك)',
        browseCostumes: 'أرني الأزياء الملكية!'
    },
    items: {
        stick: 'عصا خشب', iron_sword: 'سيف حديد', steel_sword: 'سيف النجمة', knight_blade: 'سيف الفارس',
        hunter_bow: 'قوس الصياد', long_bow: 'القوس الطويل', flintlock: 'مسدس قديم', musket: 'بندقية قديمة',
        leather_cap: 'قبعة جلد', iron_helm: 'خوذة حديد', knight_helm: 'خوذة الفارس',
        padded_vest: 'سترة جلد', chainmail: 'درع حلقات', plate_armor: 'درع حديد كامل',
        leather_boots: 'حذاء جلد', swift_boots: 'حذاء السرعة', iron_greaves: 'حذاء حديد',
        star_rod: 'سيف عصا النجمة', super_hammer: 'مطرقة النجمة الخارقة', fire_flower_staff: 'عصا زهرة النار',
        koopa_bow: 'قوس صدفة كوبا', bullet_blaster: 'مسدسات بيل الرصاصة', wing_cap_helm: 'القبعة المجنحة',
        royal_star_plate: 'درع النجمة الملكية', mushroom_tunic: 'سترة النجمة الخارقة', starlight_robe: 'رداء روزالينا النجمي',
        plumber_boots: 'حذاء القفز الخارق', mario_costume: 'زي ماريو', luigi_costume: 'زي لويجي', peach_costume: 'زي الأميرة بيتش',
        kokiri_sword: 'سيف كوكيري', master_sword: 'السيف الأسطوري (ماستر سورد)', biggoron_sword: 'سيف بيغورون العملاق', megaton_hammer: 'مطرقة الميغاتون',
        fairy_bow: 'قوس الجنيات', sages_staff: 'عصا الترايفورس للحكماء', hylian_helm: 'قبعة بطل هيرول', mirror_helm: 'شعار درع المرآة',
        kokiri_tunic: 'سترة كوكيري الخضراء', goron_tunic: 'سترة غورون النارية', zora_tunic: 'سترة زورا المائية', iron_boots: 'الحذاء الحديدي', hover_boots: 'الحذاء الطائر',
        link_costume: 'زي بطل الزمن (لينك)', sheik_costume: 'زي شيك الخفي', zelda_costume: 'ثوب الأميرة زيلدا الملكي'
    },
    zone: { barrow: 'سرداب التلّ', mine: 'المنجم العميق' },
    boss: { knight: 'فارس السرداب' },
    obj: { '11': 'افتح البوابة شمال القرية، وابحث عن جمرة الحجر في المنجم تحت المقلع.' },
    lines: {
        hana: ['أدوية! الصغير بثماني عملات، والكبير بعشرين. طعمه مثل أوراق الصنوبر، لكنه مفيد.'],
        tamFound: ['أتيت من أجلي؟ ظننت أن لا أحد سيأتي. ذلك الفارس هناك... لا ينام أبدًا.', 'سأركض إلى البيت الآن. قل للمعلم برام إنني آسف!'],
        biscuitFound: ['هاو! هاو! (بسكويت يهزّ جسمه كله ويركض إلى القرية.)'],
        tamHome: ['لن أدخل سردابًا مرة أخرى. على الأغلب.'],
        biscuitHome: ['هاو!'],
        knightDown: ['ركع فارس السرداب، وصار درعه غبارًا.'],
        starFound: ['داخل الصندوق قطع من حديد النجمة. تلمع بهدوء مثل الثلج تحت القمر.']
    },
    quests: {
        biscuit: { title: 'أين بسكويت؟', goal: 'ابحث عن بسكويت، كلب بيب، في الغابة الرمادية.',
            offer: ['بسكويت لحق سنجابًا إلى الغابة الرمادية، ولم يرجع!', 'هو صغير ولونه بنّي، ويأتي دائمًا عندما تناديه. أرجوك ابحث عنه!'],
            done: ['بسكويت! وجدته! هو مليء بالطين... أحسن كلب في الدنيا.', 'خذ قبعتي التي تجلب الحظ. وهذه العملات، كنت أجمعها لشيء مهم.'] },
        wolves: { title: 'ذئاب عند الحطب', goal: 'اهزم الذئاب في الغابة الرمادية ({n}/{m}).',
            offer: ['الضباب جعل الذئاب جريئة. تدور حول حطبي كل ليلة.', 'اهزم خمسة منها، وسأعطيك عملات. وحذائي الثاني أيضًا.'],
            done: ['خمسة ذئاب! الغابة صارت أهدأ.', 'هذه عملاتك، وهذا الحذاء. مشى مسافات أكثر مني.'] },
        tam: { title: 'ضائع في السرداب', goal: 'ابحث عن تام، تلميذ برام، في سرداب التلّ.',
            offer: ['تلميذي تام دخل سرداب التلّ ليثبت أنه شجاع. كان ذلك البارحة.', 'المدخل بين الأشجار في جنوب الغابة. شيء قديم يحرس المكان. أرجوك، أرجعه.'],
            done: ['تام رجع ووجهه أبيض من الخوف، لكنه بخير. أشكرك كثيرًا.', 'خذ قوس الصيد. تام لن يقترب من الخطر مدة طويلة.'] },
        crawlers: { title: 'ديدان المستنقع', goal: 'اهزم ديدان المستنقع ({n}/{m}).',
            offer: ['الديدان تأكل الأعشاب التي أقطفها على شاطئ المستنقع.', 'اهزم ستة منها، وسأعطيك عملات ودواءين كبيرين.'],
            done: ['ستة! أعشابي تشكرك، وأنا أيضًا.', 'دواءان كبيران كما وعدتك. يشفيان كل شيء، إلا النكت السيئة.'] },
        mites: { title: 'حشرات الصخر', goal: 'اهزم حشرات الصخر في المقلع أو المنجم ({n}/{m}).',
            offer: ['حشرات الصخر تخرج من المقلع وتأكل بوابتي.', 'اهزم ستة منها، وخوذتي الحديدية القديمة لك. حمت رأسي عشرين سنة.'],
            done: ['هذا يكفي. خذ الخوذة. انتبه للضربة التي فيها، لها قصة.'] },
        stariron: { title: 'حديد النجمة', goal: 'ابحث عن صندوق حديد النجمة في المنجم العميق.',
            offer: ['عندما كنت أعمل في المقلع، وجدنا حديد النجمة في أعماق المنجم. خبّأنا صندوقًا منه قبل أن نغلق الممرات.', 'أحضره لي، وسأصنع لك سيفًا رائعًا.'],
            done: ['حديد النجمة... ما زال يغني بعد كل هذه السنين.', 'تفضّل. سيف من حديد النجمة. لا تجعلني أندم.'] }
    }
}
};
// merge into the main texts
(function () {
    const T = window.HM_TEXT, M = window.HM_TEXT_MORE;
    for (const lang in M) {
        const t = T[lang], m = M[lang];
        for (const k of ['ui', 'zone', 'boss', 'lines']) Object.assign(t[k], m[k]);
        t.items = m.items; t.quests = m.quests;
        for (const i in m.obj) t.obj[i] = m.obj[i];
    }
})();
