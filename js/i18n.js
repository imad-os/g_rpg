/* Hollowmere: every text in English, French, Spanish and Arabic.
 * {n} and {name} are filled in by the game. Story lines are arrays of pages. */
window.HM_TEXT = {
en: {
    ui: {
        title: 'Hollowmere', sub: 'The Lantern Road', cont: 'Continue', newg: 'New game',
        newConfirm: 'Start a new game? The current save will be erased.', ok: 'OK',
        quest: 'Quest', lv: 'Lv', p2join: '2P: press OK on another controller',
        p2joined: '{name} joins the adventure!', p2left: '{name} leaves the adventure.',
        mJournal: 'Quest journal', mPotion: 'Drink a potion ({n})', mLeave: 'Player 2 leaves',
        bye: 'Goodbye.', buy: 'Buy a potion (10 coins)', leave: 'Leave', yes: 'Yes', no: 'No',
        poor: 'Not enough coins.', bought: 'Potion bought!', noPotion: 'No potions left.',
        healed: '{name} drinks a potion.', lvup: 'Level up! Level {n}',
        allDown: 'The Hush closes in... You wake up at the edge of the area.',
        down: '{name} is down! They will be back in a moment.', revived: '{name} is back on their feet!',
        ai: 'AI', thinking: '...', aiOff: 'AI voices are off. Set proxyUrl in the app config (My PC installer).',
        aiErr: '(The voice falters. Ask again.)',
        brambles: 'The brambles are too thick for this stick.', gateLocked: 'The gate is locked.',
        gateOpen: 'You unlock the quarry gate.', gotOre: 'Iron ore ({n}/3)', gotCap: 'Glowcap ({n}/3)',
        gotEmber: 'You recovered the {name}!', gotSword: 'You received the Iron Sword!',
        gotKey: 'You received the Quarry Key!', gotHeart: 'You received the Heartflame!',
        journal: 'Quest journal', embers: 'Embers', coins: 'Coins', potions: 'Potions', level: 'Level',
        time: 'Time', close: 'Close', score: 'Score: {n}', theEnd: 'The End. Thank you for playing!',
        freeRoam: 'The Lantern burns. Hollowmere is yours to explore.', hero1: 'Ash', hero2: 'Wren',
        hearth: 'Ember of Hearth', tide: 'Ember of Tide', stone: 'Ember of Stone',
        next: 'What should we do now?', about: 'Tell me about yourself.', page: 'Journal page',
        bringCaps: 'Bring the glowcaps to Sela.', ferry: 'Take the ferry to the Drowned Isle', holdOk: 'Hold OK: menu'
    },
    zone: { village: 'Hollowmere', greywood: 'The Greywood', mireshore: 'Mirefen Shore', isle: 'The Drowned Isle', quarry: 'The Old Quarry' },
    boss: { thornback: 'The Thornback', warden: 'The Bog Warden', sentinel: 'The Stone Sentinel', shade: 'The Hush Shade' },
    intro: [
        'For three hundred years the Great Lantern of Hollowmere burned on the hill, and the Hush stayed beyond the trees.',
        'The Hush is a grey fog that eats sound, colour and memory. Whatever it touches forgets itself.',
        'Last night the Lantern went dark. Its three Embers are gone, and the fog is already at the fences.',
        'You are the lamplighter\'s apprentices. Elder Maren is waiting at the foot of the Lantern.'
    ],
    ending: [
        'Hollowmere remembers itself. Colour returns to the fields, and songs to the tavern.',
        'Weeks later, a thin man with a mended lantern knocks at Maren\'s door.',
        'She opens it.'
    ],
    obj: [
        'Talk to Elder Maren by the Lantern, on the hill.',
        'Find Tobin the blacksmith at his forge, west of the square.',
        'Collect iron ore in the Greywood, east of the village ({n}/3).',
        'Bring the iron ore to Tobin.',
        'Cut through the brambles and find the Ember of Hearth deep in the Greywood.',
        'Bring the Ember of Hearth to Elder Maren.',
        'Find Sela the ferrywoman on the Mirefen shore, south of the village.',
        'Gather glowcaps along the water\'s edge ({n}/3).',
        'Take Sela\'s ferry to the Drowned Isle and recover the Ember of Tide.',
        'Show Corvin\'s journal page to Elder Maren.',
        'Ask Tobin for the key to the Old Quarry.',
        'Open the gate north of the village and recover the Ember of Stone in the quarry.',
        'Bring the three Embers to Elder Maren.',
        'Open the Sunken Chapel on the Drowned Isle with the three Embers.',
        'Defeat the Hush Shade in the Sunken Chapel.',
        'Bring the Heartflame to Elder Maren.',
        'Light the Great Lantern on the hill.',
        'The Lantern burns. Explore Hollowmere freely.'
    ],
    lines: {
        maren0: [
            'There you are. The Lantern is cold, and the Hush is already at the fences.',
            'Someone climbed the tower last night and took all three Embers: Hearth, Tide and Stone. Without them, the Lantern cannot hold back the fog.',
            'I\'m too old for the road. You are not. But no apprentice of mine walks into the Greywood with a broom handle. Go to Tobin at the forge first.'
        ],
        marenIdle: ['The Hush won\'t wait for us. {obj}'],
        tobin1: [
            'Maren sent you? Then she\'s frightened, and Maren doesn\'t frighten easily.',
            'My forge is cold without iron. The old veins in the Greywood, east of the village, still give ore. Look for silver glints among the rocks.',
            'Bring me three pieces and I\'ll make you a real blade, one that bites through thorn.'
        ],
        tobin2a: ['Three pieces of ore, no fewer. The Greywood is east of the village. You have {n}.'],
        tobin2b: [
            'Good iron. It still smells of rain. Give me a moment...',
            'There. An iron sword, balanced and sharp.',
            'Thorns walled up the heart of the Greywood overnight. This blade will cut a path. Whatever took the Ember will be waiting behind them.'
        ],
        tobinIdle: ['Keep the edge clean and it will keep you alive.'],
        bram: [
            'Brambles grew across the old trail in a single night. Something big is nesting behind them. I heard it snorting.',
            'If you go in, strike when it gets its tusks stuck in a tree. Nothing that size turns quickly.'
        ],
        bramPost: ['The wood breathes easier now. Thank you, young lamplighters.'],
        maren5: [
            'The Ember of Hearth! Warm as a kitchen fire. Keep it close.',
            'I can feel the second one, Tide, somewhere out in the Mirefen. Only Sela knows those waters.',
            'Her ferry is on the shore, south of the village. Be kind to her. She has lost more to the mire than anyone.'
        ],
        sela6: [
            'Lamplighters, is it? The Hush swallowed my lamp, and I don\'t cross the mire in the dark.',
            'Bring me three glowcaps, the blue mushrooms that grow at the water\'s edge, and I\'ll have light enough to take you to the Drowned Isle.'
        ],
        sela7a: ['Three glowcaps. They glow blue along the water\'s edge. You have {n}.'],
        sela7b: [
            'Blue light, true light. That will do.',
            'The boat is ready whenever you are. The Drowned Isle is waiting, and its old bell has been ringing without any wind.'
        ],
        selaFerry: ['Shall I take you across to the Drowned Isle?'],
        boatBack: ['Sail back to the Mirefen shore?'],
        selaIdle: ['The mire keeps what it takes. Mind your step.'],
        maren9: [
            'Let me see that page... This is Corvin\'s hand.',
            'He was my apprentice once, before you. His sister Lira drowned in the Mirefen, and grief turned him strange. When he tried to use the Lantern to call her back, I sent him away. I should have gone after him.',
            'The last Ember, Stone, will be in the Old Quarry, north of the village. Tobin worked that quarry for years. He still has the key.'
        ],
        tobin10: [
            'Corvin... I taught that boy to hold a hammer.',
            'Here, the quarry key. The gate is at the north end of the village, past Odo.',
            'Watch the old statues in there. I always felt they were watching back.'
        ],
        odo: ['The quarry gate is locked, and the Hush is thick beyond it. Tobin keeps the key.'],
        odoKey: ['You have Tobin\'s key? Then the gate is yours. Come back in one piece.'],
        maren12: [
            'All three Embers... but feel them. They\'re cold.',
            'Corvin didn\'t only take the Embers. He took the Heartflame, the fire that lives inside them. He\'s hiding in the Sunken Chapel on the Drowned Isle, behind a seal of Lantern magic.',
            'The Embers are the key to that seal. Bring the fire home. And if you can... bring Corvin home too.'
        ],
        sealNeed: ['A seal of old Lantern magic. Three hollows are carved into it, shaped like Embers.'],
        sealOpen: ['The three Embers fit the seal. The doors grind open.'],
        corvin13: [
            'Maren\'s apprentices. So she sends children to do her work now.',
            'Leave. Tonight the Heartflame calls Lira home, and nothing will stop it.',
            '...You won\'t go? Then let the Hush answer you.'
        ],
        lira1: ['Thank you. My brother kept calling, and every call pulled me back into the cold.'],
        lira2: ['I don\'t want to come back, Corvin. I want you to let go.'],
        corvin1: ['Lira... I\'m sorry. I only wanted one more day.'],
        lira3: ['You had all of them. Light the Lantern. Let me rest.'],
        corvin2: ['Take the Heartflame to Maren. Tell her... I\'ll come home when I can look her in the eye.'],
        liraIdle: ['Thank you. I can rest now.'],
        corvinIdle: ['Go. Maren is waiting, and the Lantern has been dark long enough.'],
        maren15: [
            'The Heartflame... I can feel the whole village in it.',
            'And Corvin? He spoke of coming home? Then there\'s hope for him yet.',
            'Go on. Light the Lantern. It should be lit by the ones who saved it.'
        ],
        marenEnd: ['Look at that light. Hollowmere has its memory back, and I have my apprentices. All of them, soon.'],
        lanternCold: ['The Great Lantern stands cold. Its three ember-cradles are empty.'],
        lanternLit: ['You set the Embers into the Lantern, and the Heartflame leaps between them. Light pours down the hill, and the Hush unravels like morning mist.'],
        lanternOn: ['The Great Lantern burns bright and warm.'],
        hana: ['Potions! Ten coins each. They taste like pine needles, but they work.'],
        pip: ['Is the fog going to eat my dog? Biscuit is scared of it.', 'Elder Maren says the Lantern will chase it away. You\'ll fix it, right?'],
        pipPost: ['The fog is gone! Biscuit says thank you. Well, he barked. Same thing.'],
        thornbackDown: ['The Thornback collapses. Among the roots, the Ember of Hearth glows warm and red.'],
        wardenDown: ['The Bog Warden sinks into the mud. The Ember of Tide rises from the water, cold and blue. A soaked journal page floats beside it.'],
        journalPage: ['"Lira, I will bring you back. The Lantern remembers everyone this village has lost, and with its Heartflame I can call you home. Maren will never forgive me. I have stopped asking her to." (signed: C.)'],
        sentinelDown: ['The Stone Sentinel crumbles. In its chest, the Ember of Stone beats like a slow heart.'],
        shadeDown: ['The Hush Shade tears apart into grey threads. Corvin\'s lantern cracks, and a small light drifts out of it.']
    },
    topic: {
        maren: ['Tell me about the Lantern.', 'The Lantern was built three hundred years ago, when the Hush first came. Its fire remembers us, so the fog cannot make us forget.', 'I\'ve tended that Lantern for forty years. My knees are old, but my eyes still work.'],
        tobin: ['How is the forge?', 'Cold for too long. A forge without fire is just a heap of stones, like a village without its Lantern.', 'I mined the Old Quarry before I took up the hammer. Stone taught me patience. Iron taught me temper.'],
        sela: ['What is the Mirefen like?', 'Still water, deep mud, and the bell of the Drowned Isle. People say the drowned listen when it rings.', 'I\'ve ferried folk across this mire for thirty years. It took my husband once. I still row.'],
        corvin: ['Why did you do it?', 'Because the Lantern holds every memory of her, and I wanted more than memories.', 'I was Maren\'s apprentice. Then I was nobody. Now... I don\'t know yet.']
    }
},

fr: {
    ui: {
        title: 'Hollowmere', sub: 'La Route de la Lanterne', cont: 'Continuer', newg: 'Nouvelle partie',
        newConfirm: 'Commencer une nouvelle partie ? La sauvegarde actuelle sera effacée.', ok: 'OK',
        quest: 'Quête', lv: 'Niv', p2join: '2J : appuyez sur OK sur une autre manette',
        p2joined: '{name} rejoint l\'aventure !', p2left: '{name} quitte l\'aventure.',
        mJournal: 'Journal de quête', mPotion: 'Boire une potion ({n})', mLeave: 'Le joueur 2 part',
        bye: 'Au revoir.', buy: 'Acheter une potion (10 pièces)', leave: 'Partir', yes: 'Oui', no: 'Non',
        poor: 'Pas assez de pièces.', bought: 'Potion achetée !', noPotion: 'Plus de potions.',
        healed: '{name} boit une potion.', lvup: 'Niveau supérieur ! Niveau {n}',
        allDown: 'Le Silence se referme... Vous vous réveillez à l\'entrée de la zone.',
        down: '{name} est à terre ! Retour dans un instant.', revived: '{name} est de nouveau debout !',
        ai: 'IA', thinking: '...', aiOff: 'Voix IA désactivées. Réglez proxyUrl dans la configuration de l\'app (installateur My PC).',
        aiErr: '(La voix hésite. Redemandez.)',
        brambles: 'Les ronces sont trop épaisses pour ce bâton.', gateLocked: 'La grille est fermée à clé.',
        gateOpen: 'Vous ouvrez la grille de la carrière.', gotOre: 'Minerai de fer ({n}/3)', gotCap: 'Luminelle ({n}/3)',
        gotEmber: 'Vous avez récupéré la {name} !', gotSword: 'Vous recevez l\'Épée de fer !',
        gotKey: 'Vous recevez la Clé de la carrière !', gotHeart: 'Vous recevez la Flamme-Cœur !',
        journal: 'Journal de quête', embers: 'Braises', coins: 'Pièces', potions: 'Potions', level: 'Niveau',
        time: 'Temps', close: 'Fermer', score: 'Score : {n}', theEnd: 'Fin. Merci d\'avoir joué !',
        freeRoam: 'La Lanterne brûle. Hollowmere est à vous.', hero1: 'Ash', hero2: 'Wren',
        hearth: 'Braise du Foyer', tide: 'Braise de la Marée', stone: 'Braise de la Pierre',
        next: 'Que devons-nous faire ?', about: 'Parlez-moi de vous.', page: 'Page de journal',
        bringCaps: 'Apportez les luminelles à Sela.', ferry: 'Prendre le bac vers l\'Île Noyée', holdOk: 'OK maintenu : menu'
    },
    zone: { village: 'Hollowmere', greywood: 'Le Boisgris', mireshore: 'Rive de la Fangemare', isle: 'L\'Île Noyée', quarry: 'La Vieille Carrière' },
    boss: { thornback: 'Le Dos-d\'Épines', warden: 'Le Gardien du Marais', sentinel: 'La Sentinelle de Pierre', shade: 'L\'Ombre du Silence' },
    intro: [
        'Pendant trois cents ans, la Grande Lanterne de Hollowmere a brûlé sur la colline, et le Silence est resté au-delà des arbres.',
        'Le Silence est un brouillard gris qui dévore les sons, les couleurs et les souvenirs. Tout ce qu\'il touche s\'oublie.',
        'La nuit dernière, la Lanterne s\'est éteinte. Ses trois Braises ont disparu, et le brouillard atteint déjà les clôtures.',
        'Vous êtes les apprentis de l\'allumeuse. L\'Ancienne Maren vous attend au pied de la Lanterne.'
    ],
    ending: [
        'Hollowmere se souvient d\'elle-même. Les couleurs reviennent dans les champs, et les chansons à la taverne.',
        'Quelques semaines plus tard, un homme maigre, une lanterne réparée à la main, frappe à la porte de Maren.',
        'Elle ouvre.'
    ],
    obj: [
        'Parlez à l\'Ancienne Maren, près de la Lanterne sur la colline.',
        'Trouvez Tobin le forgeron à sa forge, à l\'ouest de la place.',
        'Ramassez du minerai de fer dans le Boisgris, à l\'est du village ({n}/3).',
        'Apportez le minerai de fer à Tobin.',
        'Taillez les ronces et trouvez la Braise du Foyer au cœur du Boisgris.',
        'Apportez la Braise du Foyer à l\'Ancienne Maren.',
        'Trouvez Sela la passeuse sur la rive de la Fangemare, au sud du village.',
        'Cueillez des luminelles au bord de l\'eau ({n}/3).',
        'Prenez le bac de Sela jusqu\'à l\'Île Noyée et récupérez la Braise de la Marée.',
        'Montrez la page du journal de Corvin à l\'Ancienne Maren.',
        'Demandez à Tobin la clé de la Vieille Carrière.',
        'Ouvrez la grille au nord du village et récupérez la Braise de la Pierre dans la carrière.',
        'Apportez les trois Braises à l\'Ancienne Maren.',
        'Ouvrez la Chapelle Engloutie de l\'Île Noyée avec les trois Braises.',
        'Vainquez l\'Ombre du Silence dans la Chapelle Engloutie.',
        'Apportez la Flamme-Cœur à l\'Ancienne Maren.',
        'Allumez la Grande Lanterne sur la colline.',
        'La Lanterne brûle. Explorez Hollowmere librement.'
    ],
    lines: {
        maren0: [
            'Vous voilà. La Lanterne est froide, et le Silence est déjà aux clôtures.',
            'Quelqu\'un est monté dans la tour cette nuit et a pris les trois Braises : Foyer, Marée et Pierre. Sans elles, la Lanterne ne peut plus retenir le brouillard.',
            'Je suis trop vieille pour la route. Pas vous. Mais aucun de mes apprentis n\'entre dans le Boisgris avec un manche à balai. Allez d\'abord voir Tobin à la forge.'
        ],
        marenIdle: ['Le Silence ne nous attendra pas. {obj}'],
        tobin1: [
            'C\'est Maren qui vous envoie ? Alors elle a peur, et Maren n\'a pas peur facilement.',
            'Ma forge est froide sans fer. Les vieux filons du Boisgris, à l\'est du village, donnent encore du minerai. Cherchez les éclats d\'argent entre les rochers.',
            'Rapportez-m\'en trois morceaux et je vous forgerai une vraie lame, une qui tranche les épines.'
        ],
        tobin2a: ['Trois morceaux de minerai, pas un de moins. Le Boisgris est à l\'est du village. Vous en avez {n}.'],
        tobin2b: [
            'Du bon fer. Il sent encore la pluie. Donnez-moi un instant...',
            'Voilà. Une épée de fer, équilibrée et tranchante.',
            'Des épines ont muré le cœur du Boisgris en une nuit. Cette lame vous ouvrira un chemin. Ce qui a pris la Braise vous attendra derrière.'
        ],
        tobinIdle: ['Gardez le fil propre, et il vous gardera en vie.'],
        bram: [
            'Les ronces ont poussé sur le vieux sentier en une seule nuit. Quelque chose de gros niche derrière. Je l\'ai entendu grogner.',
            'Si vous y allez, frappez quand ses défenses se coincent dans un arbre. Rien de cette taille ne se retourne vite.'
        ],
        bramPost: ['La forêt respire mieux. Merci, jeunes allumeurs.'],
        maren5: [
            'La Braise du Foyer ! Chaude comme un feu de cuisine. Gardez-la près de vous.',
            'Je sens la deuxième, la Marée, quelque part dans la Fangemare. Seule Sela connaît ces eaux.',
            'Son bac est sur la rive, au sud du village. Soyez gentils avec elle. Le marais lui a pris plus qu\'à personne.'
        ],
        sela6: [
            'Des allumeurs, hein ? Le Silence a avalé ma lampe, et je ne traverse pas le marais dans le noir.',
            'Apportez-moi trois luminelles, les champignons bleus qui poussent au bord de l\'eau, et j\'aurai assez de lumière pour vous mener à l\'Île Noyée.'
        ],
        sela7a: ['Trois luminelles. Elles brillent en bleu au bord de l\'eau. Vous en avez {n}.'],
        sela7b: [
            'Lumière bleue, lumière sûre. Ça ira.',
            'La barque est prête quand vous l\'êtes. L\'Île Noyée attend, et sa vieille cloche sonne sans le moindre vent.'
        ],
        selaFerry: ['Je vous fais traverser jusqu\'à l\'Île Noyée ?'],
        boatBack: ['Retourner sur la rive de la Fangemare ?'],
        selaIdle: ['Le marais garde ce qu\'il prend. Attention où vous marchez.'],
        maren9: [
            'Montrez-moi cette page... C\'est l\'écriture de Corvin.',
            'Il a été mon apprenti, avant vous. Sa sœur Lira s\'est noyée dans la Fangemare, et le chagrin l\'a rendu étrange. Quand il a voulu utiliser la Lanterne pour la rappeler, je l\'ai chassé. J\'aurais dû le suivre.',
            'La dernière Braise, la Pierre, doit être dans la Vieille Carrière, au nord du village. Tobin y a travaillé des années. Il a encore la clé.'
        ],
        tobin10: [
            'Corvin... C\'est moi qui ai appris à ce garçon à tenir un marteau.',
            'Tenez, la clé de la carrière. La grille est au nord du village, après Odo.',
            'Méfiez-vous des vieilles statues là-bas. J\'ai toujours eu l\'impression qu\'elles nous regardaient.'
        ],
        odo: ['La grille de la carrière est fermée, et le Silence est épais derrière. C\'est Tobin qui a la clé.'],
        odoKey: ['Vous avez la clé de Tobin ? Alors la grille est à vous. Revenez entiers.'],
        maren12: [
            'Les trois Braises... mais touchez-les. Elles sont froides.',
            'Corvin n\'a pas seulement pris les Braises. Il a pris la Flamme-Cœur, le feu qui vit en elles. Il se cache dans la Chapelle Engloutie, sur l\'Île Noyée, derrière un sceau de magie de la Lanterne.',
            'Les Braises sont la clé de ce sceau. Ramenez le feu. Et si vous le pouvez... ramenez aussi Corvin.'
        ],
        sealNeed: ['Un sceau de vieille magie de la Lanterne. Trois creux y sont gravés, en forme de Braises.'],
        sealOpen: ['Les trois Braises s\'emboîtent dans le sceau. Les portes s\'ouvrent en grinçant.'],
        corvin13: [
            'Les apprentis de Maren. Elle envoie des enfants faire son travail, maintenant.',
            'Partez. Cette nuit, la Flamme-Cœur rappelle Lira, et rien ne l\'arrêtera.',
            '... Vous ne partez pas ? Alors que le Silence vous réponde.'
        ],
        lira1: ['Merci. Mon frère m\'appelait sans cesse, et chaque appel me ramenait dans le froid.'],
        lira2: ['Je ne veux pas revenir, Corvin. Je veux que tu me laisses partir.'],
        corvin1: ['Lira... Pardon. Je voulais seulement un jour de plus.'],
        lira3: ['Tu les as tous eus. Allume la Lanterne. Laisse-moi me reposer.'],
        corvin2: ['Portez la Flamme-Cœur à Maren. Dites-lui... que je rentrerai quand je pourrai la regarder en face.'],
        liraIdle: ['Merci. Je peux me reposer, maintenant.'],
        corvinIdle: ['Allez. Maren attend, et la Lanterne est éteinte depuis trop longtemps.'],
        maren15: [
            'La Flamme-Cœur... J\'y sens tout le village.',
            'Et Corvin ? Il a parlé de rentrer ? Alors il y a encore de l\'espoir pour lui.',
            'Allez. Allumez la Lanterne. C\'est à ceux qui l\'ont sauvée de l\'allumer.'
        ],
        marenEnd: ['Regardez cette lumière. Hollowmere a retrouvé sa mémoire, et moi mes apprentis. Tous, bientôt.'],
        lanternCold: ['La Grande Lanterne est froide. Ses trois berceaux de Braises sont vides.'],
        lanternLit: ['Vous posez les Braises dans la Lanterne, et la Flamme-Cœur bondit de l\'une à l\'autre. La lumière dévale la colline, et le Silence se défait comme une brume du matin.'],
        lanternOn: ['La Grande Lanterne brûle, vive et chaude.'],
        hana: ['Des potions ! Dix pièces chacune. Elles ont un goût d\'aiguilles de pin, mais elles marchent.'],
        pip: ['Le brouillard va manger mon chien ? Biscuit en a peur.', 'L\'Ancienne Maren dit que la Lanterne va le chasser. Vous allez la réparer, hein ?'],
        pipPost: ['Le brouillard est parti ! Biscuit dit merci. Enfin, il a aboyé. C\'est pareil.'],
        thornbackDown: ['Le Dos-d\'Épines s\'effondre. Entre les racines, la Braise du Foyer brille, chaude et rouge.'],
        wardenDown: ['Le Gardien du Marais s\'enfonce dans la boue. La Braise de la Marée sort de l\'eau, froide et bleue. Une page de journal trempée flotte à côté.'],
        journalPage: ['« Lira, je te ramènerai. La Lanterne se souvient de tous ceux que ce village a perdus, et avec sa Flamme-Cœur je peux te rappeler. Maren ne me pardonnera jamais. J\'ai cessé de le lui demander. » (signé : C.)'],
        sentinelDown: ['La Sentinelle de Pierre s\'écroule. Dans sa poitrine, la Braise de la Pierre bat comme un cœur lent.'],
        shadeDown: ['L\'Ombre du Silence se déchire en fils gris. La lanterne de Corvin se fend, et une petite lumière s\'en échappe.']
    },
    topic: {
        maren: ['Parlez-moi de la Lanterne.', 'La Lanterne a été bâtie il y a trois cents ans, quand le Silence est arrivé. Son feu se souvient de nous, alors le brouillard ne peut pas nous faire oublier.', 'Je veille sur cette Lanterne depuis quarante ans. Mes genoux sont vieux, mais mes yeux marchent encore.'],
        tobin: ['Comment va la forge ?', 'Froide depuis trop longtemps. Une forge sans feu n\'est qu\'un tas de pierres, comme un village sans sa Lanterne.', 'J\'ai creusé la Vieille Carrière avant de prendre le marteau. La pierre m\'a appris la patience. Le fer, le caractère.'],
        sela: ['Comment est la Fangemare ?', 'De l\'eau immobile, de la boue profonde, et la cloche de l\'Île Noyée. On dit que les noyés écoutent quand elle sonne.', 'Je fais traverser ce marais depuis trente ans. Il m\'a pris mon mari, autrefois. Je rame encore.'],
        corvin: ['Pourquoi avez-vous fait ça ?', 'Parce que la Lanterne garde chaque souvenir d\'elle, et que je voulais plus que des souvenirs.', 'J\'étais l\'apprenti de Maren. Puis je n\'étais plus personne. Maintenant... je ne sais pas encore.']
    }
},

es: {
    ui: {
        title: 'Hollowmere', sub: 'El Camino del Farol', cont: 'Continuar', newg: 'Nueva partida',
        newConfirm: '¿Empezar una nueva partida? Se borrará la partida guardada.', ok: 'OK',
        quest: 'Misión', lv: 'Nv', p2join: '2J: pulsa OK en otro mando',
        p2joined: '¡{name} se une a la aventura!', p2left: '{name} deja la aventura.',
        mJournal: 'Diario de misiones', mPotion: 'Beber una poción ({n})', mLeave: 'El jugador 2 se va',
        bye: 'Adiós.', buy: 'Comprar una poción (10 monedas)', leave: 'Salir', yes: 'Sí', no: 'No',
        poor: 'No tienes suficientes monedas.', bought: '¡Poción comprada!', noPotion: 'No quedan pociones.',
        healed: '{name} bebe una poción.', lvup: '¡Subes de nivel! Nivel {n}',
        allDown: 'El Silencio se cierra... Despiertas a la entrada de la zona.',
        down: '¡{name} ha caído! Volverá en un momento.', revived: '¡{name} vuelve a estar en pie!',
        ai: 'IA', thinking: '...', aiOff: 'Voces de IA desactivadas. Configura proxyUrl en la config de la app (instalador de My PC).',
        aiErr: '(La voz vacila. Pregunta otra vez.)',
        brambles: 'Las zarzas son demasiado gruesas para este palo.', gateLocked: 'La verja está cerrada con llave.',
        gateOpen: 'Abres la verja de la cantera.', gotOre: 'Mineral de hierro ({n}/3)', gotCap: 'Luceta ({n}/3)',
        gotEmber: '¡Has recuperado el {name}!', gotSword: '¡Recibes la Espada de hierro!',
        gotKey: '¡Recibes la Llave de la cantera!', gotHeart: '¡Recibes la Llama Corazón!',
        journal: 'Diario de misiones', embers: 'Ascuas', coins: 'Monedas', potions: 'Pociones', level: 'Nivel',
        time: 'Tiempo', close: 'Cerrar', score: 'Puntos: {n}', theEnd: 'Fin. ¡Gracias por jugar!',
        freeRoam: 'El Farol arde. Hollowmere es tuyo para explorar.', hero1: 'Ash', hero2: 'Wren',
        hearth: 'Ascua del Hogar', tide: 'Ascua de la Marea', stone: 'Ascua de la Piedra',
        next: '¿Qué hacemos ahora?', about: 'Háblame de ti.', page: 'Página de diario',
        bringCaps: 'Lleva las lucetas a Sela.', ferry: 'Cruzar en barca a la Isla Ahogada', holdOk: 'Mantén OK: menú'
    },
    zone: { village: 'Hollowmere', greywood: 'El Bosquegrís', mireshore: 'Orilla de Lodomar', isle: 'La Isla Ahogada', quarry: 'La Vieja Cantera' },
    boss: { thornback: 'El Lomoespino', warden: 'El Guardián del Pantano', sentinel: 'El Centinela de Piedra', shade: 'La Sombra del Silencio' },
    intro: [
        'Durante trescientos años, el Gran Farol de Hollowmere ardió en la colina, y el Silencio se quedó más allá de los árboles.',
        'El Silencio es una niebla gris que devora el sonido, el color y la memoria. Todo lo que toca se olvida de sí mismo.',
        'Anoche el Farol se apagó. Sus tres Ascuas han desaparecido, y la niebla ya llega a las vallas.',
        'Eres aprendiz de la farolera. La Anciana Maren te espera al pie del Farol.'
    ],
    ending: [
        'Hollowmere se recuerda a sí mismo. El color vuelve a los campos, y las canciones a la taberna.',
        'Semanas después, un hombre delgado con un farol remendado llama a la puerta de Maren.',
        'Ella abre.'
    ],
    obj: [
        'Habla con la Anciana Maren junto al Farol, en la colina.',
        'Busca a Tobin el herrero en su forja, al oeste de la plaza.',
        'Reúne mineral de hierro en el Bosquegrís, al este del pueblo ({n}/3).',
        'Lleva el mineral de hierro a Tobin.',
        'Corta las zarzas y encuentra el Ascua del Hogar en el corazón del Bosquegrís.',
        'Lleva el Ascua del Hogar a la Anciana Maren.',
        'Busca a Sela la barquera en la orilla de Lodomar, al sur del pueblo.',
        'Recoge lucetas junto al agua ({n}/3).',
        'Toma la barca de Sela hasta la Isla Ahogada y recupera el Ascua de la Marea.',
        'Enseña la página del diario de Corvin a la Anciana Maren.',
        'Pide a Tobin la llave de la Vieja Cantera.',
        'Abre la verja al norte del pueblo y recupera el Ascua de la Piedra en la cantera.',
        'Lleva las tres Ascuas a la Anciana Maren.',
        'Abre la Capilla Hundida de la Isla Ahogada con las tres Ascuas.',
        'Derrota a la Sombra del Silencio en la Capilla Hundida.',
        'Lleva la Llama Corazón a la Anciana Maren.',
        'Enciende el Gran Farol en la colina.',
        'El Farol arde. Explora Hollowmere libremente.'
    ],
    lines: {
        maren0: [
            'Ahí estás. El Farol está frío, y el Silencio ya llega a las vallas.',
            'Anoche alguien subió a la torre y se llevó las tres Ascuas: Hogar, Marea y Piedra. Sin ellas, el Farol no puede contener la niebla.',
            'Yo ya soy vieja para el camino. Tú no. Pero ningún aprendiz mío entra en el Bosquegrís con un palo de escoba. Ve primero a ver a Tobin a la forja.'
        ],
        marenIdle: ['El Silencio no nos esperará. {obj}'],
        tobin1: [
            '¿Te manda Maren? Entonces tiene miedo, y Maren no se asusta con facilidad.',
            'Mi forja está fría sin hierro. Las viejas vetas del Bosquegrís, al este del pueblo, todavía dan mineral. Busca destellos plateados entre las rocas.',
            'Tráeme tres trozos y te haré una hoja de verdad, de las que cortan espinas.'
        ],
        tobin2a: ['Tres trozos de mineral, ni uno menos. El Bosquegrís está al este del pueblo. Tienes {n}.'],
        tobin2b: [
            'Buen hierro. Todavía huele a lluvia. Dame un momento...',
            'Listo. Una espada de hierro, equilibrada y afilada.',
            'Las espinas amurallaron el corazón del Bosquegrís en una noche. Esta hoja te abrirá camino. Lo que se llevó el Ascua te estará esperando detrás.'
        ],
        tobinIdle: ['Mantén el filo limpio y él te mantendrá con vida.'],
        bram: [
            'Las zarzas crecieron sobre el viejo sendero en una sola noche. Algo grande anida detrás. Lo oí resoplar.',
            'Si entras, golpea cuando se le claven los colmillos en un árbol. Nada de ese tamaño gira deprisa.'
        ],
        bramPost: ['El bosque respira mejor. Gracias, jóvenes faroleros.'],
        maren5: [
            '¡El Ascua del Hogar! Caliente como el fuego de una cocina. Tenla cerca.',
            'Siento la segunda, la Marea, en algún lugar de Lodomar. Solo Sela conoce esas aguas.',
            'Su barca está en la orilla, al sur del pueblo. Sé amable con ella. La ciénaga le ha quitado más que a nadie.'
        ],
        sela6: [
            'Faroleros, ¿eh? El Silencio se tragó mi lámpara, y yo no cruzo la ciénaga a oscuras.',
            'Tráeme tres lucetas, las setas azules que crecen junto al agua, y tendré luz suficiente para llevarte a la Isla Ahogada.'
        ],
        sela7a: ['Tres lucetas. Brillan en azul junto al agua. Tienes {n}.'],
        sela7b: [
            'Luz azul, luz fiel. Con esto basta.',
            'La barca está lista cuando tú lo estés. La Isla Ahogada espera, y su vieja campana suena sin que sople el viento.'
        ],
        selaFerry: ['¿Te llevo a la Isla Ahogada?'],
        boatBack: ['¿Volver a la orilla de Lodomar?'],
        selaIdle: ['La ciénaga guarda lo que se lleva. Cuidado dónde pisas.'],
        maren9: [
            'Déjame ver esa página... Es la letra de Corvin.',
            'Fue mi aprendiz, antes que tú. Su hermana Lira se ahogó en Lodomar, y la pena lo volvió extraño. Cuando intentó usar el Farol para traerla de vuelta, lo eché. Debí ir tras él.',
            'La última Ascua, la Piedra, estará en la Vieja Cantera, al norte del pueblo. Tobin trabajó allí muchos años. Todavía tiene la llave.'
        ],
        tobin10: [
            'Corvin... Yo le enseñé a ese chico a sujetar un martillo.',
            'Toma, la llave de la cantera. La verja está al norte del pueblo, pasando a Odo.',
            'Vigila las viejas estatuas de ahí dentro. Siempre sentí que nos devolvían la mirada.'
        ],
        odo: ['La verja de la cantera está cerrada, y el Silencio es espeso al otro lado. Tobin guarda la llave.'],
        odoKey: ['¿Tienes la llave de Tobin? Entonces la verja es tuya. Vuelve entero.'],
        maren12: [
            'Las tres Ascuas... pero tócalas. Están frías.',
            'Corvin no solo se llevó las Ascuas. Se llevó la Llama Corazón, el fuego que vive en ellas. Se esconde en la Capilla Hundida de la Isla Ahogada, tras un sello de magia del Farol.',
            'Las Ascuas son la llave de ese sello. Trae el fuego a casa. Y si puedes... trae también a Corvin.'
        ],
        sealNeed: ['Un sello de vieja magia del Farol. Tiene tres huecos tallados con forma de Ascua.'],
        sealOpen: ['Las tres Ascuas encajan en el sello. Las puertas se abren chirriando.'],
        corvin13: [
            'Los aprendices de Maren. Ahora manda a niños a hacer su trabajo.',
            'Vete. Esta noche la Llama Corazón llama a Lira a casa, y nada lo impedirá.',
            '... ¿No te vas? Entonces que el Silencio te responda.'
        ],
        lira1: ['Gracias. Mi hermano no dejaba de llamarme, y cada llamada me arrastraba de nuevo al frío.'],
        lira2: ['No quiero volver, Corvin. Quiero que me dejes ir.'],
        corvin1: ['Lira... Lo siento. Solo quería un día más.'],
        lira3: ['Los tuviste todos. Enciende el Farol. Déjame descansar.'],
        corvin2: ['Lleva la Llama Corazón a Maren. Dile... que volveré a casa cuando pueda mirarla a los ojos.'],
        liraIdle: ['Gracias. Ya puedo descansar.'],
        corvinIdle: ['Ve. Maren te espera, y el Farol lleva demasiado tiempo apagado.'],
        maren15: [
            'La Llama Corazón... Siento a todo el pueblo en ella.',
            '¿Y Corvin? ¿Habló de volver a casa? Entonces aún hay esperanza para él.',
            'Anda. Enciende el Farol. Deben encenderlo quienes lo salvaron.'
        ],
        marenEnd: ['Mira esa luz. Hollowmere ha recuperado su memoria, y yo a mis aprendices. A todos, pronto.'],
        lanternCold: ['El Gran Farol está frío. Sus tres cunas de ascuas están vacías.'],
        lanternLit: ['Colocas las Ascuas en el Farol, y la Llama Corazón salta entre ellas. La luz baja por la colina, y el Silencio se deshace como la bruma de la mañana.'],
        lanternOn: ['El Gran Farol arde, brillante y cálido.'],
        hana: ['¡Pociones! Diez monedas cada una. Saben a agujas de pino, pero funcionan.'],
        pip: ['¿La niebla se va a comer a mi perro? Galleta le tiene miedo.', 'La Anciana Maren dice que el Farol la espantará. Lo vas a arreglar, ¿verdad?'],
        pipPost: ['¡La niebla se fue! Galleta dice gracias. Bueno, ladró. Es lo mismo.'],
        thornbackDown: ['El Lomoespino se desploma. Entre las raíces, el Ascua del Hogar brilla, cálida y roja.'],
        wardenDown: ['El Guardián del Pantano se hunde en el barro. El Ascua de la Marea sale del agua, fría y azul. A su lado flota una página de diario empapada.'],
        journalPage: ['«Lira, te traeré de vuelta. El Farol recuerda a todos los que este pueblo ha perdido, y con su Llama Corazón puedo llamarte a casa. Maren nunca me lo perdonará. Ya dejé de pedírselo.» (firmado: C.)'],
        sentinelDown: ['El Centinela de Piedra se derrumba. En su pecho, el Ascua de la Piedra late como un corazón lento.'],
        shadeDown: ['La Sombra del Silencio se deshace en hilos grises. El farol de Corvin se agrieta, y una pequeña luz sale flotando.']
    },
    topic: {
        maren: ['Háblame del Farol.', 'El Farol se construyó hace trescientos años, cuando llegó el Silencio. Su fuego nos recuerda, así que la niebla no puede hacernos olvidar.', 'Llevo cuarenta años cuidando ese Farol. Mis rodillas son viejas, pero mis ojos aún funcionan.'],
        tobin: ['¿Cómo va la forja?', 'Fría demasiado tiempo. Una forja sin fuego es solo un montón de piedras, como un pueblo sin su Farol.', 'Trabajé en la Vieja Cantera antes de tomar el martillo. La piedra me enseñó paciencia. El hierro, carácter.'],
        sela: ['¿Cómo es Lodomar?', 'Agua quieta, barro hondo y la campana de la Isla Ahogada. Dicen que los ahogados escuchan cuando suena.', 'Llevo treinta años cruzando gente por esta ciénaga. Una vez se llevó a mi marido. Sigo remando.'],
        corvin: ['¿Por qué lo hiciste?', 'Porque el Farol guarda cada recuerdo de ella, y yo quería algo más que recuerdos.', 'Fui aprendiz de Maren. Luego no fui nadie. Ahora... todavía no lo sé.']
    }
},

ar: {
    ui: {
        title: 'هولومير', sub: 'طريق الفانوس', cont: 'تابع اللعب', newg: 'لعبة جديدة',
        newConfirm: 'تبدأ لعبة جديدة؟ سيُحذف ما حفظته.', ok: 'OK',
        quest: 'المهمة', lv: 'م', p2join: 'اللاعب 2: اضغط OK على يد لعب أخرى',
        p2joined: '{name} يلعب معك الآن!', p2left: '{name} خرج من اللعبة.',
        mJournal: 'دفتر المهام', mPotion: 'اشرب دواءً ({n})', mLeave: 'اللاعب 2 يخرج',
        bye: 'مع السلامة.', buy: 'اشترِ دواءً (10 عملات)', leave: 'اخرج', yes: 'نعم', no: 'لا',
        poor: 'ليس معك عملات كافية.', bought: 'اشتريت الدواء!', noPotion: 'لم يبقَ معك دواء.',
        healed: '{name} شرب الدواء.', lvup: 'صرت أقوى! المستوى {n}',
        allDown: 'غلبك الضباب... تستيقظ عند أول المكان.',
        down: '{name} سقط! سيقوم بعد قليل.', revived: '{name} قام من جديد!',
        ai: 'ذكاء', thinking: '...', aiOff: 'الأصوات غير مفعّلة. ضع proxyUrl في إعدادات التطبيق (مثبّت My PC).',
        aiErr: '(الصوت لم يعمل. اسأل مرة أخرى.)',
        brambles: 'الأشواك قوية جدًا. تحتاج سيفًا لتقطعها.', gateLocked: 'البوابة مقفلة.',
        gateOpen: 'فتحت بوابة المقلع.', gotOre: 'حجر الحديد ({n}/3)', gotCap: 'فطر مضيء ({n}/3)',
        gotEmber: 'حصلت على {name}!', gotSword: 'حصلت على السيف الحديدي!',
        gotKey: 'حصلت على مفتاح المقلع!', gotHeart: 'حصلت على شعلة القلب!',
        journal: 'دفتر المهام', embers: 'الجمرات', coins: 'العملات', potions: 'الأدوية', level: 'المستوى',
        time: 'الوقت', close: 'إغلاق', score: 'النقاط: {n}', theEnd: 'النهاية. شكرًا لأنك لعبت!',
        freeRoam: 'الفانوس مضيء. تجوّل في هولومير كما تحب.', hero1: 'آش', hero2: 'رين',
        hearth: 'جمرة البيت', tide: 'جمرة الماء', stone: 'جمرة الحجر',
        next: 'ماذا أفعل الآن؟', about: 'من أنت؟', page: 'ورقة من دفتر',
        bringCaps: 'خذ الفطر المضيء إلى سيلا.', ferry: 'اركب القارب إلى الجزيرة الغارقة', holdOk: 'اضغط طويلًا على OK: القائمة'
    },
    zone: { village: 'هولومير', greywood: 'الغابة الرمادية', mireshore: 'شاطئ المستنقع', isle: 'الجزيرة الغارقة', quarry: 'المقلع القديم' },
    boss: { thornback: 'الخنزير الشوكي', warden: 'وحش المستنقع', sentinel: 'الحارس الحجري', shade: 'ظل الضباب' },
    intro: [
        'منذ ثلاثمئة سنة، يضيء فانوس كبير فوق تلّ هولومير. وبسببه يبقى الضباب بعيدًا خلف الأشجار.',
        'هذا الضباب اسمه السكون. هو ضباب رمادي يأكل الأصوات والألوان والذكريات. كل شيء يلمسه ينسى نفسه.',
        'البارحة انطفأ الفانوس. سُرقت جمراته الثلاث، والضباب وصل إلى أطراف القرية.',
        'أنت تلميذ عند حارسة الفانوس. الجدة مارين تنتظرك عند الفانوس.'
    ],
    ending: [
        'هولومير تتذكر نفسها من جديد. رجعت الألوان إلى الحقول، ورجعت الأغاني إلى القرية.',
        'وبعد أسابيع، دقّ رجل نحيل باب مارين. كان يحمل فانوسًا صغيرًا أصلحه بيده.',
        'ففتحت له الباب.'
    ],
    obj: [
        'كلّم الجدة مارين عند الفانوس، فوق التلّ.',
        'ابحث عن توبين الحدّاد في ورشته، غرب الساحة.',
        'اجمع حجر الحديد في الغابة الرمادية، شرق القرية ({n}/3).',
        'خذ حجر الحديد إلى توبين.',
        'اقطع الأشواك، وابحث عن جمرة البيت في وسط الغابة الرمادية.',
        'خذ جمرة البيت إلى الجدة مارين.',
        'ابحث عن سيلا صاحبة القارب، على شاطئ المستنقع جنوب القرية.',
        'اجمع الفطر المضيء قرب الماء ({n}/3).',
        'اركب قارب سيلا إلى الجزيرة الغارقة، واسترجع جمرة الماء.',
        'أرِ ورقة كورفين للجدة مارين.',
        'اطلب مفتاح المقلع القديم من توبين.',
        'افتح البوابة شمال القرية، واسترجع جمرة الحجر من المقلع.',
        'خذ الجمرات الثلاث إلى الجدة مارين.',
        'افتح المعبد في الجزيرة الغارقة بالجمرات الثلاث.',
        'اهزم ظل الضباب في المعبد.',
        'خذ شعلة القلب إلى الجدة مارين.',
        'أشعل الفانوس الكبير فوق التلّ.',
        'الفانوس مضيء. تجوّل في هولومير كما تحب.'
    ],
    lines: {
        maren0: [
            'وصلت أخيرًا. الفانوس بارد، والضباب وصل إلى أطراف القرية.',
            'البارحة صعد أحدهم إلى البرج وسرق الجمرات الثلاث: جمرة البيت، وجمرة الماء، وجمرة الحجر. بدونها لا يستطيع الفانوس أن يُبعد الضباب.',
            'أنا كبيرة ولا أستطيع السفر، لكنك تستطيع. لا تذهب إلى الغابة بعصا خشب! اذهب أولًا إلى توبين في ورشته.'
        ],
        marenIdle: ['الضباب لن ينتظرنا. {obj}'],
        tobin1: [
            'مارين أرسلتك؟ إذن هي خائفة. ومارين لا تخاف بسهولة.',
            'ورشتي باردة لأنه لا يوجد حديد. في الغابة الرمادية، شرق القرية، يوجد حجر الحديد بين الصخور. ابحث عن الحجر اللامع.',
            'أحضر لي ثلاث قطع، وسأصنع لك سيفًا حقيقيًا. سيفًا يقطع الأشواك.'
        ],
        tobin2a: ['أحتاج ثلاث قطع من حجر الحديد. الغابة الرمادية شرق القرية. معك {n}.'],
        tobin2b: [
            'حديد جيد! رائحته مثل المطر. انتظر لحظة...',
            'تفضّل. سيف من حديد، خفيف وحادّ.',
            'نبتت أشواك كثيرة حول وسط الغابة في ليلة واحدة. هذا السيف يفتح لك الطريق. ومن سرق الجمرة ينتظرك هناك.'
        ],
        tobinIdle: ['اعتنِ بسيفك، وسيعتني بك.'],
        bram: [
            'نبتت الأشواك فوق الطريق في ليلة واحدة. وخلفها يعيش شيء كبير. سمعته يشخر.',
            'إذا دخلت، اضربه عندما تعلق أنيابه في شجرة. الحيوان الكبير يحتاج وقتًا ليستدير.'
        ],
        bramPost: ['الغابة هادئة الآن. شكرًا لك يا بطل.'],
        maren5: [
            'جمرة البيت! دافئة مثل نار المطبخ. احتفظ بها.',
            'أشعر بالجمرة الثانية، جمرة الماء، في مكان ما في المستنقع. سيلا وحدها تعرف تلك المياه.',
            'قاربها على الشاطئ، جنوب القرية. كن لطيفًا معها، فقد خسرت الكثير هناك.'
        ],
        sela6: [
            'أنت تلميذ الفانوس، صحيح؟ الضباب أطفأ مصباحي، وأنا لا أعبر المستنقع في الظلام.',
            'أحضر لي ثلاث حبات من الفطر المضيء. هو فطر أزرق ينبت قرب الماء. بنوره أستطيع أن آخذك إلى الجزيرة الغارقة.'
        ],
        sela7a: ['أحتاج ثلاث حبات من الفطر المضيء. يلمع بالأزرق قرب الماء. معك {n}.'],
        sela7b: [
            'نور أزرق جميل. هذا يكفي.',
            'القارب جاهز متى أردت. الجزيرة الغارقة تنتظر، وجرسها القديم يرنّ وحده.'
        ],
        selaFerry: ['هل آخذك إلى الجزيرة الغارقة؟'],
        boatBack: ['ترجع إلى شاطئ المستنقع؟'],
        selaIdle: ['المستنقع لا يرجع ما يأخذه. انتبه أين تمشي.'],
        maren9: [
            'أرني هذه الورقة... هذا خطّ كورفين.',
            'كان كورفين تلميذي قبلك. أخته ليرا غرقت في المستنقع، فحزن حزنًا شديدًا. ثم حاول أن يستعمل الفانوس ليرجعها، فطردته. كان يجب أن أساعده.',
            'الجمرة الأخيرة، جمرة الحجر، في المقلع القديم شمال القرية. توبين عمل هناك سنوات، ومفتاح البوابة ما زال معه.'
        ],
        tobin10: [
            'كورفين... أنا الذي علّمته كيف يمسك المطرقة.',
            'خذ مفتاح المقلع. البوابة شمال القرية، بعد أودو.',
            'انتبه من التماثيل القديمة هناك. كنت أشعر دائمًا أنها تنظر إلينا.'
        ],
        odo: ['بوابة المقلع مقفلة، والضباب كثيف خلفها. المفتاح عند توبين.'],
        odoKey: ['معك مفتاح توبين؟ إذن البوابة لك. ارجع سالمًا.'],
        maren12: [
            'الجمرات الثلاث... لكن المسها. إنها باردة.',
            'كورفين لم يأخذ الجمرات فقط. أخذ شعلة القلب، وهي النار التي تعيش في الجمرات. هو مختبئ في المعبد، في الجزيرة الغارقة، خلف باب سحري.',
            'الجمرات هي مفتاح ذلك الباب. أرجع النار إلى بيتها. وإن استطعت... أرجع كورفين أيضًا.'
        ],
        sealNeed: ['باب قديم عليه سحر الفانوس. فيه ثلاثة أماكن على شكل جمرات.'],
        sealOpen: ['وضعت الجمرات الثلاث في الباب، فانفتح ببطء.'],
        corvin13: [
            'تلاميذ مارين. صارت ترسل الأطفال ليعملوا بدلًا منها.',
            'ارحل. الليلة ستنادي شعلة القلب أختي ليرا لترجع. ولن يوقفني أحد.',
            '... لن ترحل؟ إذن سيجيبك الضباب.'
        ],
        lira1: ['شكرًا لك. كان أخي يناديني، وكل نداء كان يسحبني إلى البرد.'],
        lira2: ['لا أريد أن أرجع يا كورفين. أريدك أن تتركني أرتاح.'],
        corvin1: ['ليرا... سامحيني. أردت يومًا واحدًا آخر معك.'],
        lira3: ['عشت معي كل أيامي. أشعل الفانوس، ودعني أرتاح.'],
        corvin2: ['خذ شعلة القلب إلى مارين. وقل لها... سأرجع إلى البيت عندما أستطيع أن أنظر في عينيها.'],
        liraIdle: ['شكرًا لك. أستطيع أن أرتاح الآن.'],
        corvinIdle: ['اذهب. مارين تنتظر، والفانوس مطفأ منذ وقت طويل.'],
        maren15: [
            'شعلة القلب... أشعر بالقرية كلها فيها.',
            'وكورفين؟ قال إنه سيرجع إلى البيت؟ إذن ما زال هناك أمل.',
            'هيا، أشعل الفانوس. من أنقذه هو الذي يشعله.'
        ],
        marenEnd: ['انظر إلى هذا النور. هولومير تتذكر نفسها، وتلاميذي رجعوا إليّ. وكلهم سيرجعون قريبًا.'],
        lanternCold: ['الفانوس الكبير بارد. أماكن الجمرات الثلاث فارغة.'],
        lanternLit: ['وضعت الجمرات في الفانوس، فقفزت شعلة القلب بينها. خرج نور كبير فوق التلّ، واختفى الضباب مثل ضباب الصباح.'],
        lanternOn: ['الفانوس الكبير مضيء ودافئ.'],
        hana: ['أدوية! الدواء بعشر عملات. طعمه مثل أوراق الصنوبر، لكنه مفيد.'],
        pip: ['هل سيأكل الضباب كلبي؟ بسكويت يخاف منه.', 'الجدة مارين تقول إن الفانوس سيطرده. ستصلحه، صحيح؟'],
        pipPost: ['الضباب اختفى! بسكويت يقول شكرًا. حسنًا، هو نبح. نفس الشيء.'],
        thornbackDown: ['سقط الخنزير الشوكي. وبين الجذور تلمع جمرة البيت، حمراء ودافئة.'],
        wardenDown: ['غاص وحش المستنقع في الطين. وخرجت جمرة الماء من الماء، باردة وزرقاء. وبجانبها ورقة مبلولة من دفتر.'],
        journalPage: ['«يا ليرا، سأرجعك. الفانوس يتذكر كل الذين فقدناهم، وبشعلة القلب أستطيع أن أناديك إلى البيت. مارين لن تسامحني أبدًا، وأنا لم أعد أطلب ذلك.» (التوقيع: ك.)'],
        sentinelDown: ['سقط الحارس الحجري. وفي صدره جمرة الحجر، تنبض ببطء مثل قلب.'],
        shadeDown: ['تمزّق ظل الضباب إلى خيوط رمادية. انكسر فانوس كورفين، وخرج منه نور صغير.']
    },
    topic: {
        maren: ['حدّثيني عن الفانوس.', 'صُنع الفانوس قبل ثلاثمئة سنة، عندما جاء الضباب أول مرة. ناره تتذكرنا، فلا يستطيع الضباب أن يجعلنا ننسى أنفسنا.', 'أنا أحرس هذا الفانوس منذ أربعين سنة. ركبتاي تعبتا، لكن عينيّ ما زالتا قويتين.'],
        tobin: ['كيف حال ورشتك؟', 'باردة منذ مدة طويلة. الورشة بلا نار مجرد حجارة، مثل القرية بلا فانوسها.', 'عملت في المقلع قبل أن أصير حدّادًا. الحجر علّمني الصبر، والحديد علّمني القوة.'],
        sela: ['كيف هو المستنقع؟', 'ماء ساكن، وطين عميق، وجرس الجزيرة الغارقة. يقولون إن الغرقى يسمعونه عندما يرنّ.', 'أنقل الناس في هذا المستنقع منذ ثلاثين سنة. أخذ زوجي مرة. وما زلت أجدّف.'],
        corvin: ['لماذا فعلت ذلك؟', 'لأن الفانوس يحفظ كل ذكرى عن أختي. وأنا أردت أكثر من الذكريات.', 'كنت تلميذ مارين. ثم صرت لا أحد. والآن... لا أعرف بعد.']
    }
}
};
