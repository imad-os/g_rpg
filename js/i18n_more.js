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
        slot_weapon: 'Weapon', slot_head: 'Head', slot_body: 'Body', slot_feet: 'Feet'
    },
    items: {
        stick: 'Walking stick', iron_sword: 'Iron sword', steel_sword: 'Star-steel sword', knight_blade: 'Knight\'s blade',
        hunter_bow: 'Hunter\'s bow', long_bow: 'Longbow', flintlock: 'Flintlock pistol', musket: 'Musket',
        leather_cap: 'Leather cap', iron_helm: 'Iron helm', knight_helm: 'Knight\'s helm',
        padded_vest: 'Padded vest', chainmail: 'Chain mail', plate_armor: 'Plate armour',
        leather_boots: 'Leather boots', swift_boots: 'Swift boots', iron_greaves: 'Iron greaves'
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
        slot_weapon: 'Arme', slot_head: 'Tête', slot_body: 'Corps', slot_feet: 'Pieds'
    },
    items: {
        stick: 'Bâton de marche', iron_sword: 'Épée de fer', steel_sword: 'Épée d\'acier-étoile', knight_blade: 'Lame de chevalier',
        hunter_bow: 'Arc de chasseur', long_bow: 'Arc long', flintlock: 'Pistolet à silex', musket: 'Mousquet',
        leather_cap: 'Bonnet de cuir', iron_helm: 'Casque de fer', knight_helm: 'Heaume de chevalier',
        padded_vest: 'Gilet matelassé', chainmail: 'Cotte de mailles', plate_armor: 'Armure de plates',
        leather_boots: 'Bottes de cuir', swift_boots: 'Bottes de vitesse', iron_greaves: 'Jambières de fer'
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
        slot_weapon: 'Arma', slot_head: 'Cabeza', slot_body: 'Cuerpo', slot_feet: 'Pies'
    },
    items: {
        stick: 'Bastón', iron_sword: 'Espada de hierro', steel_sword: 'Espada de acero estelar', knight_blade: 'Hoja de caballero',
        hunter_bow: 'Arco de cazador', long_bow: 'Arco largo', flintlock: 'Pistola de chispa', musket: 'Mosquete',
        leather_cap: 'Gorro de cuero', iron_helm: 'Yelmo de hierro', knight_helm: 'Yelmo de caballero',
        padded_vest: 'Chaleco acolchado', chainmail: 'Cota de malla', plate_armor: 'Armadura de placas',
        leather_boots: 'Botas de cuero', swift_boots: 'Botas veloces', iron_greaves: 'Grebas de hierro'
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
        gotCoins: '+{n} قطعة', gotItem: 'حصلتم على: {item}!', atk: 'هجوم', def: 'دفاع', spd: 'سرعة', sword: 'سيف', bow: 'قوس', gun: 'سلاح ناري',
        qReturn: 'عودوا إلى {npc}.', qNew: 'مهمة جديدة: {name}', qDoneGo: 'أُنجزت المهمة: {name}! عودوا إلى {npc}.', qReward: 'المكافأة: {r}',
        nCoins: '{n} قطعة', potS: 'جرعة صغيرة', potB: 'جرعة كبيرة', mEquip: 'العتاد', mPotionS: 'جرعة صغيرة ({n})', mPotionB: 'جرعة كبيرة ({n})',
        browseForge: 'أرنا أسلحتك ودروعك.', browsePotions: 'نحتاج إلى جرعات.', askWork: 'هل من عمل لنا؟', reward: 'المكافأة',
        accept: 'قبول', later: 'ليس الآن', sideQuests: 'مهام جانبية', forge: 'كور توبين', owned: 'مملوك', bought2: 'تم الشراء: {item}! (مُرتدى)',
        potionShop: 'جرعات هانا', healN: 'تشفي {n}', healFull: 'تشفي بالكامل', equip: 'العتاد', none: 'لا شيء', equipped: 'مُرتدى', back: 'رجوع',
        slot_weapon: 'السلاح', slot_head: 'الرأس', slot_body: 'الجسد', slot_feet: 'القدمان'
    },
    items: {
        stick: 'عصا المشي', iron_sword: 'سيف حديدي', steel_sword: 'سيف الفولاذ النجمي', knight_blade: 'نصل الفارس',
        hunter_bow: 'قوس الصياد', long_bow: 'القوس الطويل', flintlock: 'مسدس الصوان', musket: 'بندقية قديمة',
        leather_cap: 'قبعة جلدية', iron_helm: 'خوذة حديدية', knight_helm: 'خوذة الفارس',
        padded_vest: 'سترة مبطنة', chainmail: 'درع الزرد', plate_armor: 'درع الصفائح',
        leather_boots: 'حذاء جلدي', swift_boots: 'حذاء السرعة', iron_greaves: 'واقيات حديدية'
    },
    zone: { barrow: 'سرداب التلّ', mine: 'المنجم العميق' },
    boss: { knight: 'فارس السرداب' },
    obj: { '11': 'افتحوا البوابة شمال القرية وابحثوا عن جمرة الحجر في أعماق المنجم تحت المقلع.' },
    lines: {
        hana: ['جرعات! الصغيرة بثماني قطع، والكبيرة بعشرين. طعمها كإبر الصنوبر، لكنها تنفع.'],
        tamFound: ['جئتم من أجلي؟ ظننت أن أحدًا لن يأتي. ذلك الفارس هناك... لا ينام أبدًا.', 'سأركض إلى البيت فورًا. قولوا للمعلّم برام إنني آسف!'],
        biscuitFound: ['هاو! هاو! (يهزّ بسكويت جسده كله ويركض نحو القرية.)'],
        tamHome: ['لن أدخل سردابًا مرة أخرى أبدًا. على الأرجح.'],
        biscuitHome: ['هاو!'],
        knightDown: ['جثا فارس السرداب على ركبته، وتفتّت درعه غبارًا.'],
        starFound: ['داخل الصندوق، تتوهّج سبائك الحديد النجمي بخفوت، كالصقيع تحت ضوء القمر.']
    },
    quests: {
        biscuit: { title: 'أين بسكويت؟', goal: 'ابحثوا عن بسكويت، كلب بيب، في الغابة الرمادية.',
            offer: ['لحق بسكويت بسنجاب إلى الغابة الرمادية، ولم يعد!', 'إنه صغير وبنّي، ويأتي دائمًا حين تناديه. أرجوكم ابحثوا عنه!'],
            done: ['بسكويت! وجدتموه! إنه ملطّخ بالوحل... أفضل أنواع الكلاب.', 'خذوا قبعتي الجالبة للحظ. وهذه القطع، كنت أدّخرها لشيء مهم.'] },
        wolves: { title: 'ذئاب عند الحطب', goal: 'اهزموا الذئاب في الغابة الرمادية ({n}/{m}).',
            offer: ['جعل السكون الذئاب جريئة. إنها تحوم حول كومة حطبي كل ليلة.', 'قلّلوا القطيع، خمسة منها، وسأدفع لكم. وحذائي الاحتياطي أيضًا.'],
            done: ['خمسة ذئاب! الغابة أهدأ منذ الآن.', 'هذا أجركم، والحذاء. لقد مشى أميالًا أكثر مني.'] },
        tam: { title: 'تائه في التلّ', goal: 'ابحثوا عن تام، تلميذ برام، في سرداب التلّ.',
            offer: ['دخل تلميذي تام سرداب التلّ ليثبت أنه شجاع. كان ذلك بالأمس.', 'المدخل بين الأشجار في جنوب الغابة. شيء قديم يحرس تلك القاعات. أرجوكم، أعيدوه.'],
            done: ['عاد تام شاحبًا كالطباشير، لكنه سليم. أنا مدين لكم بأكثر مما أستطيع قوله.', 'خذوا قوس الصيد خاصتي. لن يقترب تام من أي خطر لفترة طويلة.'] },
        crawlers: { title: 'آفات المستنقع', goal: 'اهزموا زواحف المستنقع ({n}/{m}).',
            offer: ['الزواحف تأكل الأعشاب التي أقطفها على شاطئ ميرفن.', 'اسحقوا ستة منها وسأدفع لكم، مع جرعتين كبيرتين من جرعاتي.'],
            done: ['ستة زواحف! أعشابي تشكركم، وأنا أيضًا.', 'جرعتان كبيرتان كما وعدت. تشفيان كل شيء إلا النكات السيئة.'] },
        mites: { title: 'سوس الصخر', goal: 'اهزموا سوس الصخر في المقلع أو المنجم ({n}/{m}).',
            offer: ['سوس الصخر يخرج من المقلع ويقضم بوابتي.', 'اسحقوا ستة منها وخوذتي الحديدية القديمة لكم. لقد أبقت رأسي في مكانه عشرين عامًا.'],
            done: ['هذا سيعلّمها. تفضّلوا الخوذة. انتبهوا للانبعاج، فله قصة.'] },
        stariron: { title: 'الحديد النجمي', goal: 'ابحثوا عن صندوق الحديد النجمي في المنجم العميق.',
            offer: ['حين كنت أعمل في المقلع، وجدنا حديدًا نجميًا في أعماق المنجم، وخبّأنا صندوقًا منه قبل أن نسدّ الأروقة.', 'أحضروه لي وسأصنع لكم نصلًا يستحق الحمل.'],
            done: ['الحديد النجمي... ما زال يغنّي بعد كل هذه السنين.', 'تفضّلوا. سيف مطويّ بالحديد النجمي. لا تجعلوني أندم.'] }
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
