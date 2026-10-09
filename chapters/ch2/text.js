/* Hollowmere, Chapter 2: every text in English, French, Spanish and Arabic, and the townsfolk's tasks.
 * Short, clear sentences (the Arabic in plain everyday words). Merged into HM_TEXT when the chapter loads. */
window.HM_C2_TEXT = {
en: {
    ui: {
        c2rookCall: 'Rook whistles: archers join the fight!', c2witchClones: 'The Witch splits into mirror images!', c2witchShield: 'A shield of fire! Break the three ember crystals!',
        c2witchWeak: 'The shield breaks! Strike now!', c2gateOpen: 'The north gate is open.', c2letterDone: 'Mirelle thanks you with a staff.',
        c2bread: 'Buy warm bread (6 coins)', c2breadEat: 'Warm bread! Everyone feels much better.', c2sailHome: 'Sail home to Hollowmere',
        c2letterAsk: 'Take a letter to Maren', c2letterGot: 'You have Mirelle\'s letter. Bring it to Maren in Hollowmere.', c2campN: 'Raiders chased from the camp: {n}/6',
        c2gotLens: 'You got the Lens of the Lantern!', c2gotFlame: 'You got the Flame of the Lantern!', c2litTitle: 'The Lantern of Larkspur',
        c2theEnd: 'End of Chapter 2. Thank you for playing!', c2free: 'Larkspur is yours to explore. Sela can sail you home.',
        c2lens: 'The Lens', c2flame: 'The Flame', c2tideName: 'Low tide', c2forge: 'Gus\'s Sea Forge', c2store: 'Juna\'s Store'
    },
    zone: { c2_bay: 'Larkspur Bay', c2_fields: 'The Sunpetal Fields', c2_ridge: 'Cinder Ridge', c2_light: 'The Sunken Lighthouse' },
    boss: { rook: 'Captain Rook', witch: 'The Cinder Witch', choir: 'The Choirmaster' },
    names: { odile: 'Odile', mirelle: 'Mirelle', gus: 'Gus', juna: 'Juna', bo: 'Bo', nell: 'Nell', tuck: 'Tuck', pell: 'Pell', marta: 'Marta', sela2: 'Sela',
             folk1: 'Lou', folk2: 'Remy', ada: 'Ada', finn: 'Finn', finnHome: 'Finn', rook: 'Captain Rook', witch: 'The Cinder Witch', choir: 'The Choirmaster' },
    foes: {
        rook: ['Captain Rook', 'Leader of the raiders. He dashes along a red line: step aside, and if he hits a wall he is dizzy.'],
        witch: ['The Cinder Witch', 'She throws spirals of fire and hides behind a shield. Break her crystals first.'],
        choir: ['The Choirmaster', 'His rings of sound have a gap: stand in the gap. Stay close when the beam turns.']
    },
    c2obj: [
        'Find Odile, the harbour mistress, at the docks.',
        'Visit farmer Ada in the Sunpetal Fields (east of town).',
        'Chase the raiders out of the camp in the fields ({n}/6).',
        'The raiders ran to their fort. Beat Captain Rook (north of the fields).',
        'You have the Lens! Bring it to Odile at the harbour.',
        'Find old Mirelle by the old pier (west of the harbour).',
        'Climb Cinder Ridge (through the north gate) and beat the Cinder Witch.',
        'You have the Flame! Bring it to Mirelle.',
        'The tide is low. Go down the old pier into the Sunken Lighthouse.',
        'The Lantern of Larkspur has risen! Light it on the harbour.',
        'Larkspur shines again. Help the townsfolk, or sail home with Sela.'
    ],
    c2ending: [
        'The Lantern of Larkspur burns again. Its light runs across the water, all the way to Hollowmere.',
        'Far to the north, a third light flickers in the dark. It is very weak.',
        'The Hush is not gone. But now two Lanterns watch over the lake.'
    ],
    lines: {
        c2dragon: ['Behind the Witch\'s throne, an egg cracks in the heat. A young red dragon looks at you... and bows its head.'],
        c2arrive: ['Here we are: Larkspur Bay. Smell that? Salt and fresh bread.', 'Someone is coming. That must be the harbour mistress.'],
        c2hello: ['Travellers from across the lake? Welcome to Larkspur!', 'I am Odile. I look after this harbour. Come and talk to me: we need help.'],
        c2odile0: ['A hundred years ago, our Lantern stood here. One stormy night the old lighthouse fell, and the Lantern sank into the sea.',
                   'Now masked raiders, the Grey Choir, rob our farms. They work for the Hush.',
                   'To raise our Lantern we need three things: its Lens, its Flame, and a low tide. Let us start with the Lens.',
                   'Farmer Ada saw the raiders take it. Her farm is in the Sunpetal Fields, east of town.'],
        c2odile4: ['The Lens! It still shines after all these years.', 'Now the Flame. Only old Mirelle knows where it went. She lives by the old pier, west of the harbour.'],
        c2odileIdle: ['How can I help? {obj}'],
        c2odileEnd: ['Ships come back to Larkspur now that the light is on. Thank you.'],
        c2ada1: ['You came from town? Thank the sun!', 'The raiders made a camp in the middle of my fields. They took the old Lens to their fort.', 'Chase them out of the camp first. Then their captain will have to come out.'],
        c2ada2: ['The camp is still full of raiders. You chased away {n} of 6.'],
        c2adaIdle: ['Watch out in the fields: boars, crabs and raiders everywhere.'],
        c2adaAfter: ['My fields are quiet now. The sunflowers grow tall again. Thank you!'],
        c2fled: ['The last raiders run north to their wooden fort. Captain Rook waits there.'],
        c2rookHi: ['So you are the heroes from Hollowmere. The Choir pays well for shiny things.', 'Come and take the Lens, if you can!'],
        c2rookDown: ['Enough! Take your glass. The Choirmaster will come for it anyway...'],
        c2mirelle5: ['The Lens is back? Then the Lantern can live again.', 'A witch of the Choir stole the Flame. She lives on Cinder Ridge, north of town, where the ground burns.', 'I asked Marta to open the north gate for you. Be careful up there.'],
        c2mirelleIdle: ['I kept the lighthouse when I was young. I still know every wave.'],
        c2mirelle7: ['You brought the Flame! Now, the tide.', 'This old bell calls the sea away. Listen.'],
        c2tide: ['The sea pulls back. Under the old pier, stone steps lead down to the Sunken Lighthouse.'],
        c2mirelleAsk: ['My sister Maren lives in Hollowmere. We have not spoken in forty years.', 'Will you take her this letter? It would make me very happy.'],
        c2mirelleLetter: ['A letter from Maren! My hands are shaking.', 'Thank you, dear. Please take this staff. My father made it.'],
        c2martaShut: ['The north gate stays shut. The ridge is too dangerous.'],
        c2martaOpen: ['The gate is open. Good luck on the ridge, and watch the lava.'],
        c2witchHi: ['Little lamplighters! You want my pretty flame?', 'Then dance with fire!'],
        c2witchDown: ['No... my flame... it was so warm...'],
        c2choirHi: ['You walk into my house of silence.', 'Every Lantern goes dark in the end. I will sing yours to sleep.'],
        c2choirDown: ['The song... breaks... But the Hush is older than any Lantern. We will meet again, in the north.'],
        c2rise: ['Look! The Lantern is rising out of the sea!', 'Go on, light it. You have the Flame.'],
        c2lit: ['It burns! After a hundred years, Larkspur has its light again.', 'Thank you, friends. This town is your home now, too.'],
        c2pedestal: ['An old stone on the harbour. Something should stand here.'],
        c2lanternOn: ['The Lantern of Larkspur shines over the bay.'],
        c2gus: ['This is my forge. I work with sea steel: lighter and stronger than iron.', 'Bring coins, and I will make you shine.'],
        c2juna: ['Potions, herbs, and hay for your horse! Everything here is fresh.'],
        c2bo: ['Crabs cut my nets again. Beach crabs, as big as plates!'],
        c2nell: ['My brother Finn went to look at the raiders. He is not back...'],
        c2tuck: ['Fresh bread! Warm bread helps tired heroes.'],
        c2pell: ['♪ The light went down beneath the sea... ♪', 'Oh, sorry! I am writing a song about our Lantern. It needs a happy ending.'],
        c2pellLit: ['♪ ...and heroes brought it back to me! ♪ Now my song is finished!'],
        c2sela: ['My boat is ready when you want to go home to Hollowmere.'],
        c2folk1: ['Lock your door at night. The masked raiders come from the fields.'],
        c2folk2: ['My grandmother says the Lantern made the fish happy. Strange, no?'],
        c2folkLit: ['Did you see the Lantern last night? The whole bay was golden!'],
        c2finnHome: ['I am home! Nell cried a lot. Me too, a little.'],
        finnFound: ['You found me! I hid from the raiders behind these crates.', 'I will run home to Nell now. Thank you!']
    },
    quests: {
        c2_crabs: { title: 'Crabs in the Nets', goal: 'Defeat shore crabs on the beach of the Sunpetal Fields ({n}/{m}).', offer: ['Beach crabs cut my nets every night. Can you send six of them back to the sea?'], done: ['My nets are safe! Take these potions. I had a good catch today.'] },
        finn: { title: 'Where Is Finn?', goal: 'Find Finn, Nell\'s brother, near the raider camp in the fields.', offer: ['My brother Finn went to spy on the raiders in the fields. He is not back. Please find him!'], done: ['Finn is home! Thank you, thank you! Here, this helmet was our father\'s.'] },
        c2_boars: { title: 'Wild Boars', goal: 'Defeat wild boars in the Sunpetal Fields ({n}/{m}).', offer: ['Wild boars eat my seeds and break my fences. Five less would help me a lot.'], done: ['The fields are calm. Take my husband\'s old bow. It shoots like the wind.'] },
        c2_imps: { title: 'Little Fires', goal: 'Defeat cinder imps on Cinder Ridge ({n}/{m}).', offer: ['Cinder imps come down from the ridge and steal my coal. Six of them, please.'], done: ['My coal is safe. Here, a staff I made from sea steel.'] },
        c2_hexers: { title: 'Hexers Below', goal: 'Defeat hexers in the Sunken Lighthouse ({n}/{m}).', offer: ['Hexers of the Choir hide in the Sunken Lighthouse. Their magic spoils my herbs. Stop four of them.'], done: ['My herbs smell sweet again. Take this armour. It belonged to a sailor.'] }
    },
    topic: {
        odile: ['Tell me about Larkspur.', 'Larkspur is a town of fishers and farmers. Our Lantern kept the Hush away, until the sea took it.', 'I am the harbour mistress. I count the boats, and I worry about everyone.'],
        mirelle: ['Tell me about the old lighthouse.', 'I lit its lamp every night when I was a girl. Our Lantern stood on top. Now it sleeps under the water.', 'I am old, I am stubborn, and I make the best fish soup in town.']
    },
    talk: {
        odile: [{ q: 'Who are the Grey Choir?', a: 'Raiders with grey masks. They take light, music and memories, and give them to the Hush.', s: 1 },
                { q: 'What happened to the lighthouse?', a: 'A storm, a hundred years ago. Some say the Choir called that storm.', s: 0 }],
        mirelle: [{ q: 'Do you know Maren?', a: 'Maren is my big sister! She went to Hollowmere when she was young. I miss her.', s: 5 },
                  { q: 'What is the tide bell?', a: 'An old bell. When it rings, the sea pulls back for a while. The Lantern makers built it.', s: 5 }]
    }
},
fr: {
    ui: {
        c2rookCall: 'Rook siffle : des archers arrivent !', c2witchClones: 'La Sorcière se divise en reflets !', c2witchShield: 'Un bouclier de feu ! Brisez les trois cristaux de braise !',
        c2witchWeak: 'Le bouclier se brise ! Frappez maintenant !', c2gateOpen: 'La porte nord est ouverte.', c2letterDone: 'Mirelle vous remercie avec un bâton.',
        c2bread: 'Acheter du pain chaud (6 pièces)', c2breadEat: 'Du pain chaud ! Tout le monde va beaucoup mieux.', c2sailHome: 'Rentrer à Hollowmere en bateau',
        c2letterAsk: 'Porter une lettre à Maren', c2letterGot: 'Vous avez la lettre de Mirelle. Portez-la à Maren, à Hollowmere.', c2campN: 'Pillards chassés du camp : {n}/6',
        c2gotLens: 'Vous avez la Lentille de la Lanterne !', c2gotFlame: 'Vous avez la Flamme de la Lanterne !', c2litTitle: 'La Lanterne de Larkspur',
        c2theEnd: 'Fin du Chapitre 2. Merci d’avoir joué !', c2free: 'Larkspur est à vous. Sela peut vous ramener chez vous.',
        c2lens: 'La Lentille', c2flame: 'La Flamme', c2tideName: 'Marée basse', c2forge: 'La forge marine de Gus', c2store: 'La boutique de Juna'
    },
    zone: { c2_bay: 'Baie de Larkspur', c2_fields: 'Les Champs de Tournesol', c2_ridge: 'La Crête de Cendre', c2_light: 'Le Phare englouti' },
    boss: { rook: 'Capitaine Rook', witch: 'La Sorcière des Cendres', choir: 'Le Maître du Chœur' },
    names: { odile: 'Odile', mirelle: 'Mirelle', gus: 'Gus', juna: 'Juna', bo: 'Bo', nell: 'Nell', tuck: 'Tuck', pell: 'Pell', marta: 'Marta', sela2: 'Sela',
             folk1: 'Lou', folk2: 'Rémy', ada: 'Ada', finn: 'Finn', finnHome: 'Finn', rook: 'Capitaine Rook', witch: 'La Sorcière des Cendres', choir: 'Le Maître du Chœur' },
    foes: {
        rook: ['Capitaine Rook', 'Chef des pillards. Il fonce sur une ligne rouge : écartez-vous, et s’il heurte un mur, il est étourdi.'],
        witch: ['La Sorcière des Cendres', 'Elle lance des spirales de feu et se cache derrière un bouclier. Brisez d’abord ses cristaux.'],
        choir: ['Le Maître du Chœur', 'Ses anneaux de son ont une ouverture : placez-vous dedans. Restez près de lui quand le rayon tourne.']
    },
    c2obj: [
        'Trouvez Odile, la maîtresse du port, sur les quais.',
        'Allez voir la fermière Ada dans les Champs de Tournesol (à l’est de la ville).',
        'Chassez les pillards du camp dans les champs ({n}/6).',
        'Les pillards ont fui dans leur fort. Battez le Capitaine Rook (au nord des champs).',
        'Vous avez la Lentille ! Apportez-la à Odile, au port.',
        'Trouvez la vieille Mirelle près du vieux ponton (à l’ouest du port).',
        'Montez sur la Crête de Cendre (par la porte nord) et battez la Sorcière des Cendres.',
        'Vous avez la Flamme ! Apportez-la à Mirelle.',
        'La marée est basse. Descendez le vieux ponton jusqu’au Phare englouti.',
        'La Lanterne de Larkspur est sortie de l’eau ! Allumez-la sur le port.',
        'Larkspur brille à nouveau. Aidez les habitants, ou rentrez avec Sela.'
    ],
    c2ending: [
        'La Lanterne de Larkspur brûle de nouveau. Sa lumière court sur l’eau, jusqu’à Hollowmere.',
        'Loin au nord, une troisième lumière tremble dans le noir. Elle est très faible.',
        'Le Silence n’a pas disparu. Mais maintenant, deux Lanternes veillent sur le lac.'
    ],
    lines: {
        c2dragon: ['Derrière le trône de la Sorcière, un œuf se fend dans la chaleur. Un jeune dragon rouge vous regarde... et baisse la tête.'],
        c2arrive: ['Nous y voilà : la Baie de Larkspur. Vous sentez ? Le sel et le pain frais.', 'Quelqu’un arrive. Ce doit être la maîtresse du port.'],
        c2hello: ['Des voyageurs venus de l’autre côté du lac ? Bienvenue à Larkspur !', 'Je suis Odile. Je m’occupe de ce port. Venez me parler : nous avons besoin d’aide.'],
        c2odile0: ['Il y a cent ans, notre Lanterne se dressait ici. Une nuit de tempête, le vieux phare est tombé, et la Lanterne a coulé dans la mer.',
                   'Maintenant, des pillards masqués, le Chœur Gris, volent nos fermes. Ils servent le Silence.',
                   'Pour relever notre Lanterne, il faut trois choses : sa Lentille, sa Flamme et une marée basse. Commençons par la Lentille.',
                   'La fermière Ada a vu les pillards la prendre. Sa ferme est dans les Champs de Tournesol, à l’est de la ville.'],
        c2odile4: ['La Lentille ! Elle brille encore après toutes ces années.', 'Maintenant, la Flamme. Seule la vieille Mirelle sait où elle est partie. Elle vit près du vieux ponton, à l’ouest du port.'],
        c2odileIdle: ['Comment puis-je aider ? {obj}'],
        c2odileEnd: ['Les bateaux reviennent à Larkspur depuis que la lumière brille. Merci.'],
        c2ada1: ['Vous venez de la ville ? Merci au soleil !', 'Les pillards ont fait un camp au milieu de mes champs. Ils ont emporté la vieille Lentille dans leur fort.', 'Chassez-les d’abord du camp. Leur capitaine devra alors sortir.'],
        c2ada2: ['Le camp est encore plein de pillards. Vous en avez chassé {n} sur 6.'],
        c2adaIdle: ['Attention dans les champs : sangliers, crabes et pillards partout.'],
        c2adaAfter: ['Mes champs sont calmes. Les tournesols repoussent. Merci !'],
        c2fled: ['Les derniers pillards fuient vers le nord, dans leur fort en bois. Le Capitaine Rook les attend.'],
        c2rookHi: ['Alors c’est vous, les héros de Hollowmere. Le Chœur paie bien pour les choses qui brillent.', 'Venez prendre la Lentille, si vous pouvez !'],
        c2rookDown: ['Assez ! Prenez votre verre. Le Maître du Chœur viendra le chercher de toute façon...'],
        c2mirelle5: ['La Lentille est revenue ? Alors la Lanterne peut revivre.', 'Une sorcière du Chœur a volé la Flamme. Elle vit sur la Crête de Cendre, au nord de la ville, où le sol brûle.', 'J’ai demandé à Marta d’ouvrir la porte nord pour vous. Soyez prudents là-haut.'],
        c2mirelleIdle: ['Je gardais le phare quand j’étais jeune. Je connais encore chaque vague.'],
        c2mirelle7: ['Vous avez la Flamme ! Maintenant, la marée.', 'Cette vieille cloche éloigne la mer. Écoutez.'],
        c2tide: ['La mer se retire. Sous le vieux ponton, des marches de pierre descendent vers le Phare englouti.'],
        c2mirelleAsk: ['Ma sœur Maren vit à Hollowmere. Nous ne nous parlons plus depuis quarante ans.', 'Voulez-vous lui porter cette lettre ? Cela me rendrait très heureuse.'],
        c2mirelleLetter: ['Une lettre de Maren ! Mes mains tremblent.', 'Merci, mon enfant. Prenez ce bâton. C’est mon père qui l’a fait.'],
        c2martaShut: ['La porte nord reste fermée. La crête est trop dangereuse.'],
        c2martaOpen: ['La porte est ouverte. Bonne chance sur la crête, et attention à la lave.'],
        c2witchHi: ['Petits allumeurs ! Vous voulez ma jolie flamme ?', 'Alors dansez avec le feu !'],
        c2witchDown: ['Non... ma flamme... elle était si chaude...'],
        c2choirHi: ['Vous entrez dans ma maison du silence.', 'Toute Lanterne finit par s’éteindre. Je vais endormir la vôtre en chantant.'],
        c2choirDown: ['Le chant... se brise... Mais le Silence est plus vieux que toutes les Lanternes. Nous nous reverrons, au nord.'],
        c2rise: ['Regardez ! La Lanterne sort de la mer !', 'Allez-y, allumez-la. Vous avez la Flamme.'],
        c2lit: ['Elle brûle ! Après cent ans, Larkspur a de nouveau sa lumière.', 'Merci, mes amis. Cette ville est aussi votre maison maintenant.'],
        c2pedestal: ['Une vieille pierre sur le port. Quelque chose devrait se tenir ici.'],
        c2lanternOn: ['La Lanterne de Larkspur brille sur la baie.'],
        c2gus: ['Voici ma forge. Je travaille l’acier marin : plus léger et plus solide que le fer.', 'Apportez des pièces, et je vous ferai briller.'],
        c2juna: ['Potions, herbes, et foin pour votre cheval ! Tout est frais ici.'],
        c2bo: ['Les crabes ont encore coupé mes filets. Des crabes de plage, grands comme des assiettes !'],
        c2nell: ['Mon frère Finn est parti voir les pillards. Il n’est pas revenu...'],
        c2tuck: ['Du pain frais ! Le pain chaud aide les héros fatigués.'],
        c2pell: ['♪ La lumière est descendue sous la mer... ♪', 'Oh, pardon ! J’écris une chanson sur notre Lanterne. Il lui faut une fin heureuse.'],
        c2pellLit: ['♪ ...et des héros l’ont ramenée ! ♪ Ma chanson est finie !'],
        c2sela: ['Mon bateau est prêt quand vous voulez rentrer à Hollowmere.'],
        c2folk1: ['Fermez votre porte la nuit. Les pillards masqués viennent des champs.'],
        c2folk2: ['Ma grand-mère dit que la Lanterne rendait les poissons heureux. Bizarre, non ?'],
        c2folkLit: ['Vous avez vu la Lanterne hier soir ? Toute la baie était dorée !'],
        c2finnHome: ['Je suis à la maison ! Nell a beaucoup pleuré. Moi aussi, un peu.'],
        finnFound: ['Vous m’avez trouvé ! Je me cachais des pillards derrière ces caisses.', 'Je rentre vite chez Nell. Merci !']
    },
    quests: {
        c2_crabs: { title: 'Crabes dans les filets', goal: 'Vainquez des crabes sur la plage des Champs de Tournesol ({n}/{m}).', offer: ['Les crabes coupent mes filets chaque nuit. Pouvez-vous en renvoyer six à la mer ?'], done: ['Mes filets sont sauvés ! Prenez ces potions. J’ai fait une bonne pêche.'] },
        finn: { title: 'Où est Finn ?', goal: 'Trouvez Finn, le frère de Nell, près du camp des pillards.', offer: ['Mon frère Finn est allé espionner les pillards dans les champs. Il n’est pas revenu. Trouvez-le, s’il vous plaît !'], done: ['Finn est rentré ! Merci, merci ! Tenez, ce casque était à notre père.'] },
        c2_boars: { title: 'Sangliers sauvages', goal: 'Vainquez des sangliers dans les Champs de Tournesol ({n}/{m}).', offer: ['Les sangliers mangent mes graines et cassent mes clôtures. Cinq de moins m’aideraient beaucoup.'], done: ['Les champs sont calmes. Prenez le vieil arc de mon mari. Il tire comme le vent.'] },
        c2_imps: { title: 'Petits feux', goal: 'Vainquez des diablotins sur la Crête de Cendre ({n}/{m}).', offer: ['Les diablotins descendent de la crête et volent mon charbon. Six, s’il vous plaît.'], done: ['Mon charbon est sauvé. Tenez, un bâton fait en acier marin.'] },
        c2_hexers: { title: 'Sorciers en bas', goal: 'Vainquez des sorciers dans le Phare englouti ({n}/{m}).', offer: ['Des sorciers du Chœur se cachent dans le Phare englouti. Leur magie gâche mes herbes. Arrêtez-en quatre.'], done: ['Mes herbes sentent bon à nouveau. Prenez cette armure. Elle était à un marin.'] }
    },
    topic: {
        odile: ['Parlez-moi de Larkspur.', 'Larkspur est une ville de pêcheurs et de fermiers. Notre Lanterne gardait le Silence au loin, jusqu’à ce que la mer la prenne.', 'Je suis la maîtresse du port. Je compte les bateaux, et je m’inquiète pour tout le monde.'],
        mirelle: ['Parlez-moi du vieux phare.', 'J’allumais sa lampe chaque soir quand j’étais petite. Notre Lanterne était tout en haut. Maintenant, elle dort sous l’eau.', 'Je suis vieille, je suis têtue, et je fais la meilleure soupe de poisson de la ville.']
    },
    talk: {
        odile: [{ q: 'Qui est le Chœur Gris ?', a: 'Des pillards aux masques gris. Ils prennent la lumière, la musique et les souvenirs, et les donnent au Silence.', s: 1 },
                { q: 'Qu’est-il arrivé au phare ?', a: 'Une tempête, il y a cent ans. On dit que le Chœur a appelé cette tempête.', s: 0 }],
        mirelle: [{ q: 'Connaissez-vous Maren ?', a: 'Maren est ma grande sœur ! Elle est partie à Hollowmere quand elle était jeune. Elle me manque.', s: 5 },
                  { q: 'Qu’est-ce que la cloche des marées ?', a: 'Une vieille cloche. Quand elle sonne, la mer se retire un moment. Les créateurs de la Lanterne l’ont construite.', s: 5 }]
    }
},
es: {
    ui: {
        c2rookCall: 'Rook silba: ¡llegan arqueros!', c2witchClones: '¡La Bruja se divide en reflejos!', c2witchShield: '¡Un escudo de fuego! ¡Rompe los tres cristales de brasa!',
        c2witchWeak: '¡El escudo se rompe! ¡Ataca ahora!', c2gateOpen: 'La puerta norte está abierta.', c2letterDone: 'Mirelle te da las gracias con un bastón.',
        c2bread: 'Comprar pan caliente (6 monedas)', c2breadEat: '¡Pan caliente! Todos se sienten mucho mejor.', c2sailHome: 'Volver a Hollowmere en barca',
        c2letterAsk: 'Llevar una carta a Maren', c2letterGot: 'Tienes la carta de Mirelle. Llévasela a Maren, en Hollowmere.', c2campN: 'Saqueadores echados del campamento: {n}/6',
        c2gotLens: '¡Tienes la Lente del Farol!', c2gotFlame: '¡Tienes la Llama del Farol!', c2litTitle: 'El Farol de Larkspur',
        c2theEnd: 'Fin del Capítulo 2. ¡Gracias por jugar!', c2free: 'Larkspur es tuyo. Sela puede llevarte a casa.',
        c2lens: 'La Lente', c2flame: 'La Llama', c2tideName: 'Marea baja', c2forge: 'La forja marina de Gus', c2store: 'La tienda de Juna'
    },
    zone: { c2_bay: 'Bahía de Larkspur', c2_fields: 'Los Campos de Girasol', c2_ridge: 'La Cresta de Ceniza', c2_light: 'El Faro hundido' },
    boss: { rook: 'Capitán Rook', witch: 'La Bruja de Ceniza', choir: 'El Maestro del Coro' },
    names: { odile: 'Odile', mirelle: 'Mirelle', gus: 'Gus', juna: 'Juna', bo: 'Bo', nell: 'Nell', tuck: 'Tuck', pell: 'Pell', marta: 'Marta', sela2: 'Sela',
             folk1: 'Lou', folk2: 'Remy', ada: 'Ada', finn: 'Finn', finnHome: 'Finn', rook: 'Capitán Rook', witch: 'La Bruja de Ceniza', choir: 'El Maestro del Coro' },
    foes: {
        rook: ['Capitán Rook', 'Jefe de los saqueadores. Embiste sobre una línea roja: apártate, y si choca con una pared se marea.'],
        witch: ['La Bruja de Ceniza', 'Lanza espirales de fuego y se esconde tras un escudo. Rompe primero sus cristales.'],
        choir: ['El Maestro del Coro', 'Sus anillos de sonido tienen un hueco: ponte en el hueco. Quédate cerca cuando gira el rayo.']
    },
    c2obj: [
        'Busca a Odile, la jefa del puerto, en los muelles.',
        'Visita a la granjera Ada en los Campos de Girasol (al este del pueblo).',
        'Echa a los saqueadores del campamento en los campos ({n}/6).',
        'Los saqueadores huyeron a su fuerte. Vence al Capitán Rook (al norte de los campos).',
        '¡Tienes la Lente! Llévasela a Odile, al puerto.',
        'Busca a la anciana Mirelle junto al viejo muelle (al oeste del puerto).',
        'Sube a la Cresta de Ceniza (por la puerta norte) y vence a la Bruja de Ceniza.',
        '¡Tienes la Llama! Llévasela a Mirelle.',
        'La marea está baja. Baja por el viejo muelle hasta el Faro hundido.',
        '¡El Farol de Larkspur ha salido del mar! Enciéndelo en el puerto.',
        'Larkspur brilla otra vez. Ayuda a la gente, o vuelve a casa con Sela.'
    ],
    c2ending: [
        'El Farol de Larkspur arde otra vez. Su luz corre sobre el agua, hasta Hollowmere.',
        'Lejos, al norte, una tercera luz tiembla en la oscuridad. Es muy débil.',
        'El Silencio no se ha ido. Pero ahora dos Faroles vigilan el lago.'
    ],
    lines: {
        c2dragon: ['Detrás del trono de la Bruja, un huevo se rompe con el calor. Un dragón rojo y joven te mira... y baja la cabeza.'],
        c2arrive: ['Ya llegamos: la Bahía de Larkspur. ¿Lo hueles? Sal y pan recién hecho.', 'Alguien viene. Debe de ser la jefa del puerto.'],
        c2hello: ['¿Viajeros del otro lado del lago? ¡Bienvenidos a Larkspur!', 'Soy Odile. Cuido de este puerto. Ven a hablar conmigo: necesitamos ayuda.'],
        c2odile0: ['Hace cien años, nuestro Farol estaba aquí. Una noche de tormenta cayó el viejo faro, y el Farol se hundió en el mar.',
                   'Ahora unos saqueadores con máscara, el Coro Gris, roban nuestras granjas. Sirven al Silencio.',
                   'Para sacar nuestro Farol necesitamos tres cosas: su Lente, su Llama y una marea baja. Empecemos por la Lente.',
                   'La granjera Ada vio cómo se la llevaban. Su granja está en los Campos de Girasol, al este del pueblo.'],
        c2odile4: ['¡La Lente! Todavía brilla después de tantos años.', 'Ahora la Llama. Solo la anciana Mirelle sabe adónde fue. Vive junto al viejo muelle, al oeste del puerto.'],
        c2odileIdle: ['¿En qué te ayudo? {obj}'],
        c2odileEnd: ['Los barcos vuelven a Larkspur ahora que hay luz. Gracias.'],
        c2ada1: ['¿Vienes del pueblo? ¡Gracias al sol!', 'Los saqueadores hicieron un campamento en medio de mis campos. Se llevaron la vieja Lente a su fuerte.', 'Échalos primero del campamento. Así su capitán tendrá que salir.'],
        c2ada2: ['El campamento sigue lleno de saqueadores. Has echado a {n} de 6.'],
        c2adaIdle: ['Cuidado en los campos: jabalíes, cangrejos y saqueadores por todas partes.'],
        c2adaAfter: ['Mis campos están tranquilos. Los girasoles vuelven a crecer. ¡Gracias!'],
        c2fled: ['Los últimos saqueadores huyen al norte, a su fuerte de madera. El Capitán Rook los espera.'],
        c2rookHi: ['Así que sois los héroes de Hollowmere. El Coro paga bien por las cosas que brillan.', '¡Ven a por la Lente, si puedes!'],
        c2rookDown: ['¡Basta! Toma tu cristal. El Maestro del Coro vendrá a por él de todos modos...'],
        c2mirelle5: ['¿Ha vuelto la Lente? Entonces el Farol puede vivir otra vez.', 'Una bruja del Coro robó la Llama. Vive en la Cresta de Ceniza, al norte del pueblo, donde el suelo arde.', 'Le pedí a Marta que te abra la puerta norte. Ten cuidado allí arriba.'],
        c2mirelleIdle: ['Yo cuidaba el faro de joven. Todavía conozco cada ola.'],
        c2mirelle7: ['¡Traes la Llama! Ahora, la marea.', 'Esta vieja campana aleja el mar. Escucha.'],
        c2tide: ['El mar se retira. Bajo el viejo muelle, unos escalones de piedra bajan hasta el Faro hundido.'],
        c2mirelleAsk: ['Mi hermana Maren vive en Hollowmere. No hablamos desde hace cuarenta años.', '¿Le llevas esta carta? Me haría muy feliz.'],
        c2mirelleLetter: ['¡Una carta de Maren! Me tiemblan las manos.', 'Gracias, cariño. Toma este bastón. Lo hizo mi padre.'],
        c2martaShut: ['La puerta norte sigue cerrada. La cresta es muy peligrosa.'],
        c2martaOpen: ['La puerta está abierta. Suerte en la cresta, y cuidado con la lava.'],
        c2witchHi: ['¡Pequeños faroleros! ¿Queréis mi bonita llama?', '¡Entonces bailad con el fuego!'],
        c2witchDown: ['No... mi llama... era tan cálida...'],
        c2choirHi: ['Entras en mi casa del silencio.', 'Todo Farol se apaga al final. Voy a dormir el tuyo con mi canto.'],
        c2choirDown: ['El canto... se rompe... Pero el Silencio es más viejo que cualquier Farol. Nos veremos otra vez, en el norte.'],
        c2rise: ['¡Mira! ¡El Farol sale del mar!', 'Vamos, enciéndelo. Tú tienes la Llama.'],
        c2lit: ['¡Arde! Después de cien años, Larkspur tiene otra vez su luz.', 'Gracias, amigos. Este pueblo también es vuestra casa.'],
        c2pedestal: ['Una piedra vieja en el puerto. Aquí debería haber algo.'],
        c2lanternOn: ['El Farol de Larkspur brilla sobre la bahía.'],
        c2gus: ['Esta es mi forja. Trabajo el acero marino: más ligero y fuerte que el hierro.', 'Trae monedas, y te haré brillar.'],
        c2juna: ['¡Pociones, hierbas y heno para tu caballo! Todo es fresco aquí.'],
        c2bo: ['Los cangrejos cortaron otra vez mis redes. ¡Cangrejos de playa, grandes como platos!'],
        c2nell: ['Mi hermano Finn fue a mirar a los saqueadores. No ha vuelto...'],
        c2tuck: ['¡Pan fresco! El pan caliente ayuda a los héroes cansados.'],
        c2pell: ['♪ La luz se hundió bajo el mar... ♪', '¡Ay, perdón! Escribo una canción sobre nuestro Farol. Necesita un final feliz.'],
        c2pellLit: ['♪ ...¡y unos héroes la trajeron otra vez! ♪ ¡Mi canción está terminada!'],
        c2sela: ['Mi barca está lista cuando quieras volver a Hollowmere.'],
        c2folk1: ['Cierra tu puerta por la noche. Los saqueadores con máscara vienen de los campos.'],
        c2folk2: ['Mi abuela dice que el Farol hacía felices a los peces. Raro, ¿no?'],
        c2folkLit: ['¿Viste el Farol anoche? ¡Toda la bahía estaba dorada!'],
        c2finnHome: ['¡Estoy en casa! Nell lloró mucho. Yo también, un poco.'],
        finnFound: ['¡Me encontraste! Me escondí de los saqueadores detrás de estas cajas.', 'Voy corriendo a casa con Nell. ¡Gracias!']
    },
    quests: {
        c2_crabs: { title: 'Cangrejos en las redes', goal: 'Derrota cangrejos en la playa de los Campos de Girasol ({n}/{m}).', offer: ['Los cangrejos cortan mis redes cada noche. ¿Puedes devolver seis al mar?'], done: ['¡Mis redes están a salvo! Toma estas pociones. Hoy pesqué mucho.'] },
        finn: { title: '¿Dónde está Finn?', goal: 'Encuentra a Finn, el hermano de Nell, cerca del campamento.', offer: ['Mi hermano Finn fue a espiar a los saqueadores en los campos. No ha vuelto. ¡Búscalo, por favor!'], done: ['¡Finn está en casa! ¡Gracias, gracias! Toma, este casco era de nuestro padre.'] },
        c2_boars: { title: 'Jabalíes', goal: 'Derrota jabalíes en los Campos de Girasol ({n}/{m}).', offer: ['Los jabalíes se comen mis semillas y rompen mis vallas. Cinco menos me ayudarían mucho.'], done: ['Los campos están tranquilos. Toma el viejo arco de mi marido. Dispara como el viento.'] },
        c2_imps: { title: 'Pequeños fuegos', goal: 'Derrota diablillos en la Cresta de Ceniza ({n}/{m}).', offer: ['Los diablillos bajan de la cresta y roban mi carbón. Seis, por favor.'], done: ['Mi carbón está a salvo. Toma, un bastón de acero marino.'] },
        c2_hexers: { title: 'Hechiceros abajo', goal: 'Derrota hechiceros en el Faro hundido ({n}/{m}).', offer: ['Hechiceros del Coro se esconden en el Faro hundido. Su magia estropea mis hierbas. Detén a cuatro.'], done: ['Mis hierbas huelen bien otra vez. Toma esta armadura. Era de un marinero.'] }
    },
    topic: {
        odile: ['Háblame de Larkspur.', 'Larkspur es un pueblo de pescadores y granjeros. Nuestro Farol alejaba el Silencio, hasta que el mar se lo llevó.', 'Soy la jefa del puerto. Cuento los barcos y me preocupo por todos.'],
        mirelle: ['Háblame del viejo faro.', 'Encendía su lámpara cada noche cuando era niña. Nuestro Farol estaba arriba. Ahora duerme bajo el agua.', 'Soy vieja, soy testaruda, y hago la mejor sopa de pescado del pueblo.']
    },
    talk: {
        odile: [{ q: '¿Quién es el Coro Gris?', a: 'Saqueadores con máscaras grises. Se llevan la luz, la música y los recuerdos, y se los dan al Silencio.', s: 1 },
                { q: '¿Qué le pasó al faro?', a: 'Una tormenta, hace cien años. Dicen que el Coro llamó a esa tormenta.', s: 0 }],
        mirelle: [{ q: '¿Conoces a Maren?', a: '¡Maren es mi hermana mayor! Se fue a Hollowmere de joven. La echo de menos.', s: 5 },
                  { q: '¿Qué es la campana de las mareas?', a: 'Una campana vieja. Cuando suena, el mar se retira un rato. La hicieron los creadores del Farol.', s: 5 }]
    }
},
ar: {
    ui: {
        c2rookCall: 'روك يصفّر: جاء رماة لمساعدته!', c2witchClones: 'الساحرة صنعت نسخًا منها!', c2witchShield: 'درع من نار! اكسر البلورات الثلاث!',
        c2witchWeak: 'انكسر الدرع! اضربها الآن!', c2gateOpen: 'البوابة الشمالية مفتوحة.', c2letterDone: 'ميريل تشكرك وتعطيك عصا.',
        c2bread: 'اشترِ خبزًا ساخنًا (6 عملات)', c2breadEat: 'خبز ساخن! الجميع أفضل الآن.', c2sailHome: 'ارجع إلى هولومير بالقارب',
        c2letterAsk: 'خذ رسالة إلى مارين', c2letterGot: 'معك رسالة ميريل. خذها إلى مارين في هولومير.', c2campN: 'طردت من المخيم: {n}/6',
        c2gotLens: 'حصلت على عدسة الفانوس!', c2gotFlame: 'حصلت على شعلة الفانوس!', c2litTitle: 'فانوس لاركسبير',
        c2theEnd: 'نهاية الفصل 2. شكرًا لأنك لعبت!', c2free: 'تجوّل في لاركسبير كما تحب. سيلا تستطيع أن ترجعك إلى بيتك.',
        c2lens: 'العدسة', c2flame: 'الشعلة', c2tideName: 'الجَزْر', c2forge: 'ورشة غاس', c2store: 'دكان جونا'
    },
    zone: { c2_bay: 'خليج لاركسبير', c2_fields: 'حقول عباد الشمس', c2_ridge: 'جبل الرماد', c2_light: 'المنارة الغارقة' },
    boss: { rook: 'القبطان روك', witch: 'ساحرة الرماد', choir: 'قائد الجوقة' },
    names: { odile: 'أوديل', mirelle: 'ميريل', gus: 'غاس', juna: 'جونا', bo: 'بو', nell: 'نيل', tuck: 'تاك', pell: 'بيل', marta: 'مارتا', sela2: 'سيلا',
             folk1: 'لو', folk2: 'ريمي', ada: 'آدا', finn: 'فين', finnHome: 'فين', rook: 'القبطان روك', witch: 'ساحرة الرماد', choir: 'قائد الجوقة' },
    foes: {
        rook: ['القبطان روك', 'رئيس اللصوص. يركض على خط أحمر: ابتعد عن الخط. وإذا اصطدم بالجدار يدوخ.'],
        witch: ['ساحرة الرماد', 'ترمي دوائر من النار وتختبئ خلف درع. اكسر البلورات أولًا.'],
        choir: ['قائد الجوقة', 'في دوائر صوته فتحة: قف في الفتحة. وابقَ قريبًا منه عندما يدور الشعاع.']
    },
    c2obj: [
        'ابحث عن أوديل، مسؤولة الميناء، عند الرصيف.',
        'زُر المزارعة آدا في حقول عباد الشمس (شرق المدينة).',
        'اطرد اللصوص من المخيم في الحقول ({n}/6).',
        'هرب اللصوص إلى حصنهم. اهزم القبطان روك (شمال الحقول).',
        'معك العدسة! خذها إلى أوديل في الميناء.',
        'ابحث عن ميريل العجوز قرب الرصيف القديم (غرب الميناء).',
        'اصعد جبل الرماد (من البوابة الشمالية) واهزم ساحرة الرماد.',
        'معك الشعلة! خذها إلى ميريل.',
        'البحر انخفض. انزل من الرصيف القديم إلى المنارة الغارقة.',
        'خرج فانوس لاركسبير من البحر! أشعله في الميناء.',
        'لاركسبير مضيئة من جديد. ساعد الناس، أو ارجع إلى بيتك مع سيلا.'
    ],
    c2ending: [
        'فانوس لاركسبير يضيء من جديد. ونوره يمشي على الماء حتى يصل إلى هولومير.',
        'وبعيدًا في الشمال، يظهر نور ثالث صغير في الظلام. إنه ضعيف جدًا.',
        'السكون لم يذهب بعد. لكن الآن يحرس البحيرة فانوسان.'
    ],
    lines: {
        c2dragon: ['خلف كرسي الساحرة، تنكسر بيضة من الحرارة. تنين أحمر صغير ينظر إليك... ثم يخفض رأسه.'],
        c2arrive: ['وصلنا: هذا خليج لاركسبير. هل تشم الرائحة؟ ملح وخبز طازج.', 'أحد ما قادم. لا بد أنها مسؤولة الميناء.'],
        c2hello: ['مسافرون من وراء البحيرة؟ أهلًا بكم في لاركسبير!', 'أنا أوديل. أنا أعتني بهذا الميناء. تعال وكلّمني: نحن نحتاج المساعدة.'],
        c2odile0: ['قبل مئة سنة كان فانوسنا هنا. وفي ليلة عاصفة سقطت المنارة القديمة، وغرق الفانوس في البحر.',
                   'والآن يسرق مزارعنا لصوص يلبسون أقنعة. اسمهم الجوقة الرمادية، وهم يعملون للسكون.',
                   'لنرفع فانوسنا نحتاج ثلاثة أشياء: العدسة، والشعلة، وانخفاض البحر. لنبدأ بالعدسة.',
                   'المزارعة آدا رأت اللصوص يأخذونها. مزرعتها في حقول عباد الشمس، شرق المدينة.'],
        c2odile4: ['العدسة! ما زالت تلمع بعد كل هذه السنين.', 'الآن الشعلة. ميريل العجوز وحدها تعرف أين ذهبت. هي تسكن قرب الرصيف القديم، غرب الميناء.'],
        c2odileIdle: ['كيف أساعدك؟ {obj}'],
        c2odileEnd: ['السفن ترجع إلى لاركسبير لأن الفانوس مضيء. شكرًا لك.'],
        c2ada1: ['أتيت من المدينة؟ الحمد لله!', 'اللصوص صنعوا مخيمًا وسط حقولي. وأخذوا العدسة القديمة إلى حصنهم.', 'اطردهم من المخيم أولًا. عندها سيخرج قائدهم.'],
        c2ada2: ['المخيم ما زال مليئًا باللصوص. طردت {n} من 6.'],
        c2adaIdle: ['انتبه في الحقول: خنازير وسلطعونات ولصوص في كل مكان.'],
        c2adaAfter: ['حقولي هادئة الآن، وعباد الشمس يكبر من جديد. شكرًا!'],
        c2fled: ['آخر اللصوص يهربون شمالًا إلى حصنهم الخشبي. القبطان روك ينتظرهم هناك.'],
        c2rookHi: ['إذن أنتم أبطال هولومير. الجوقة تدفع كثيرًا مقابل الأشياء اللامعة.', 'تعالوا وخذوا العدسة، إن استطعتم!'],
        c2rookDown: ['كفى! خذوا زجاجتكم. قائد الجوقة سيأتي ليأخذها على كل حال...'],
        c2mirelle5: ['العدسة رجعت؟ إذن يمكن للفانوس أن يعود.', 'ساحرة من الجوقة سرقت الشعلة. تعيش في جبل الرماد، شمال المدينة، حيث الأرض تحترق.', 'طلبت من مارتا أن تفتح لك البوابة الشمالية. كن حذرًا هناك.'],
        c2mirelleIdle: ['كنت أحرس المنارة وأنا صغيرة. وما زلت أعرف كل موجة.'],
        c2mirelle7: ['أحضرت الشعلة! الآن نحتاج أن ينخفض البحر.', 'هذا الجرس القديم يُبعد البحر. اسمع.'],
        c2tide: ['البحر يبتعد. وتحت الرصيف القديم درج من حجر ينزل إلى المنارة الغارقة.'],
        c2mirelleAsk: ['أختي مارين تعيش في هولومير. لم نتكلم منذ أربعين سنة.', 'هل تأخذ لها هذه الرسالة؟ هذا سيفرحني كثيرًا.'],
        c2mirelleLetter: ['رسالة من مارين! يداي ترتجفان.', 'شكرًا يا عزيزي. خذ هذه العصا. صنعها أبي.'],
        c2martaShut: ['البوابة الشمالية مغلقة. الجبل خطير جدًا.'],
        c2martaOpen: ['البوابة مفتوحة. بالتوفيق في الجبل، وانتبه من النار.'],
        c2witchHi: ['يا صغار الفانوس! تريدون شعلتي الجميلة؟', 'إذن العبوا مع النار!'],
        c2witchDown: ['لا... شعلتي... كانت دافئة جدًا...'],
        c2choirHi: ['دخلتم بيت الصمت.', 'كل فانوس ينطفئ في النهاية. سأُنيم فانوسكم بغنائي.'],
        c2choirDown: ['الأغنية... تنكسر... لكن السكون أقدم من كل الفوانيس. سنلتقي مرة أخرى، في الشمال.'],
        c2rise: ['انظر! الفانوس يخرج من البحر!', 'هيا، أشعله. الشعلة معك.'],
        c2lit: ['إنه يضيء! بعد مئة سنة، رجع النور إلى لاركسبير.', 'شكرًا يا أصدقائي. هذه المدينة بيتكم أيضًا.'],
        c2pedestal: ['حجر قديم في الميناء. يجب أن يكون هنا شيء ما.'],
        c2lanternOn: ['فانوس لاركسبير يضيء فوق الخليج.'],
        c2gus: ['هذه ورشتي. أعمل بحديد البحر: أخف وأقوى من الحديد العادي.', 'أحضر العملات، وسأجعلك تلمع.'],
        c2juna: ['أدوية، وأعشاب، وتبن لحصانك! كل شيء هنا طازج.'],
        c2bo: ['السلطعونات قطعت شباكي مرة أخرى. سلطعونات كبيرة مثل الصحون!'],
        c2nell: ['أخي فين ذهب ليرى اللصوص. ولم يرجع...'],
        c2tuck: ['خبز طازج! الخبز الساخن يساعد الأبطال المتعبين.'],
        c2pell: ['♪ النور نزل تحت البحر... ♪', 'آسف! أكتب أغنية عن فانوسنا. تحتاج نهاية سعيدة.'],
        c2pellLit: ['♪ ...والأبطال أرجعوه إلينا! ♪ أغنيتي انتهت!'],
        c2sela: ['قاربي جاهز عندما تريد الرجوع إلى هولومير.'],
        c2folk1: ['أغلق بابك في الليل. اللصوص المقنّعون يأتون من الحقول.'],
        c2folk2: ['جدتي تقول إن الفانوس كان يُفرح السمك. غريب، أليس كذلك؟'],
        c2folkLit: ['هل رأيت الفانوس البارحة؟ كان الخليج كله ذهبيًا!'],
        c2finnHome: ['رجعت إلى البيت! نيل بكت كثيرًا. وأنا أيضًا، قليلًا.'],
        finnFound: ['وجدتني! اختبأت من اللصوص خلف هذه الصناديق.', 'سأركض إلى البيت عند نيل. شكرًا لك!']
    },
    quests: {
        c2_crabs: { title: 'سلطعونات في الشباك', goal: 'اهزم سلطعونات الشاطئ في حقول عباد الشمس ({n}/{m}).', offer: ['السلطعونات تقطع شباكي كل ليلة. هل ترجع ستة منها إلى البحر؟'], done: ['شباكي بخير! خذ هذه الأدوية. صيدي اليوم كان كثيرًا.'] },
        finn: { title: 'أين فين؟', goal: 'ابحث عن فين، أخي نيل، قرب مخيم اللصوص في الحقول.', offer: ['أخي فين ذهب ليتجسس على اللصوص في الحقول. ولم يرجع. أرجوك، ابحث عنه!'], done: ['فين في البيت! شكرًا، شكرًا! خذ هذه الخوذة، كانت لأبينا.'] },
        c2_boars: { title: 'الخنازير البرية', goal: 'اهزم الخنازير البرية في حقول عباد الشمس ({n}/{m}).', offer: ['الخنازير تأكل بذوري وتكسر سياجي. خمسة أقل ستساعدني كثيرًا.'], done: ['الحقول هادئة. خذ قوس زوجي القديم. سهامه سريعة مثل الريح.'] },
        c2_imps: { title: 'نيران صغيرة', goal: 'اهزم عفاريت النار في جبل الرماد ({n}/{m}).', offer: ['عفاريت النار تنزل من الجبل وتسرق فحمي. ستة منها، من فضلك.'], done: ['فحمي بخير. خذ هذه العصا، صنعتها من حديد البحر.'] },
        c2_hexers: { title: 'السحرة في الأسفل', goal: 'اهزم السحرة في المنارة الغارقة ({n}/{m}).', offer: ['سحرة الجوقة يختبئون في المنارة الغارقة. سحرهم يُفسد أعشابي. أوقف أربعة منهم.'], done: ['أعشابي رائحتها حلوة من جديد. خذ هذا الدرع. كان لبحّار.'] }
    },
    topic: {
        odile: ['حدّثيني عن لاركسبير.', 'لاركسبير مدينة صيادين ومزارعين. كان فانوسنا يُبعد السكون، حتى أخذه البحر.', 'أنا مسؤولة الميناء. أعدّ القوارب، وأقلق على الجميع.'],
        mirelle: ['حدّثيني عن المنارة القديمة.', 'كنت أُشعل مصباحها كل ليلة وأنا صغيرة. وكان فانوسنا في أعلاها. الآن هو نائم تحت الماء.', 'أنا عجوز وعنيدة، وأطبخ أطيب حساء سمك في المدينة.']
    },
    talk: {
        odile: [{ q: 'من هي الجوقة الرمادية؟', a: 'لصوص يلبسون أقنعة رمادية. يأخذون النور والموسيقى والذكريات، ويعطونها للسكون.', s: 1 },
                { q: 'ماذا حدث للمنارة؟', a: 'عاصفة، قبل مئة سنة. يقول بعض الناس إن الجوقة هي التي نادت العاصفة.', s: 0 }],
        mirelle: [{ q: 'هل تعرفين مارين؟', a: 'مارين أختي الكبيرة! ذهبت إلى هولومير وهي صغيرة. أنا أشتاق إليها.', s: 5 },
                  { q: 'ما هو جرس البحر؟', a: 'جرس قديم. عندما يرن، يبتعد البحر قليلًا. صنعه الذين صنعوا الفانوس.', s: 5 }]
    }
}
};
// the townsfolk's tasks (one at a time per person; see js/pool.js for the kinds)
window.HM_C2_POOL = [
{ id: 'c2p1', giver: 'bo', type: 'collect', icon: 'pearl', n: 4, zone: 'c2_fields', stage: 1, t: {
    en: { title: 'Pearls on the Beach', offer: 'The storm threw pearls onto the beach of the fields. Bring me four and I will share the money.', goal: 'Pick up pearls in the Sunpetal Fields ({n}/{m}).', done: 'Four fine pearls! Here is your share.' },
    fr: { title: 'Des perles sur la plage', offer: 'La tempête a jeté des perles sur la plage des champs. Rapportez-m’en quatre et je partagerai l’argent.', goal: 'Ramassez des perles dans les Champs de Tournesol ({n}/{m}).', done: 'Quatre belles perles ! Voici votre part.' },
    es: { title: 'Perlas en la playa', offer: 'La tormenta tiró perlas en la playa de los campos. Tráeme cuatro y repartimos el dinero.', goal: 'Recoge perlas en los Campos de Girasol ({n}/{m}).', done: '¡Cuatro perlas bonitas! Aquí tienes tu parte.' },
    ar: { title: 'لؤلؤ على الشاطئ', offer: 'العاصفة رمت لؤلؤًا على شاطئ الحقول. أحضر لي أربع حبات وسنقتسم المال.', goal: 'اجمع اللؤلؤ في حقول عباد الشمس ({n}/{m}).', done: 'أربع حبات جميلة! هذا نصيبك.' } } },
{ id: 'c2p2', giver: 'bo', type: 'kill', foe: 'crab', n: 6, zone: 'c2_fields', stage: 1, t: {
    en: { title: 'More Crabs', offer: 'The crabs are back, and they brought friends. Six more, please!', goal: 'Defeat shore crabs in the Sunpetal Fields ({n}/{m}).', done: 'Peace on the beach. For now.' },
    fr: { title: 'Encore des crabes', offer: 'Les crabes sont revenus, avec des amis. Encore six, s’il vous plaît !', goal: 'Vainquez des crabes dans les Champs de Tournesol ({n}/{m}).', done: 'La plage est calme. Pour l’instant.' },
    es: { title: 'Más cangrejos', offer: 'Los cangrejos volvieron, y con amigos. ¡Seis más, por favor!', goal: 'Derrota cangrejos en los Campos de Girasol ({n}/{m}).', done: 'Paz en la playa. Por ahora.' },
    ar: { title: 'سلطعونات أخرى', offer: 'السلطعونات رجعت، ومعها أصحابها. ستة أخرى، من فضلك!', goal: 'اهزم السلطعونات في حقول عباد الشمس ({n}/{m}).', done: 'الشاطئ هادئ. حتى الآن.' } } },
{ id: 'c2p3', giver: 'ada', type: 'collect', icon: 'seed', n: 5, zone: 'c2_fields', stage: 2, t: {
    en: { title: 'Sunflower Seeds', offer: 'The raiders spilled my seed bags all over the fields. Can you find five?', goal: 'Find seed bags in the Sunpetal Fields ({n}/{m}).', done: 'My seeds! Next year the fields will be golden.' },
    fr: { title: 'Graines de tournesol', offer: 'Les pillards ont renversé mes sacs de graines partout. Pouvez-vous en retrouver cinq ?', goal: 'Trouvez des sacs de graines dans les champs ({n}/{m}).', done: 'Mes graines ! L’an prochain, les champs seront dorés.' },
    es: { title: 'Semillas de girasol', offer: 'Los saqueadores tiraron mis sacos de semillas por todo el campo. ¿Encuentras cinco?', goal: 'Encuentra sacos de semillas en los campos ({n}/{m}).', done: '¡Mis semillas! El año que viene los campos serán de oro.' },
    ar: { title: 'بذور عباد الشمس', offer: 'اللصوص رموا أكياس بذوري في كل الحقول. هل تجد خمسة؟', goal: 'ابحث عن أكياس البذور في الحقول ({n}/{m}).', done: 'بذوري! في السنة القادمة ستصير الحقول ذهبية.' } } },
{ id: 'c2p4', giver: 'ada', type: 'kill', foe: 'boar', n: 4, zone: 'c2_fields', stage: 3, t: {
    en: { title: 'Boars at the Fence', offer: 'Four boars are digging under my fence. Please chase them away for good.', goal: 'Defeat wild boars in the Sunpetal Fields ({n}/{m}).', done: 'My fence stands. Thank you!' },
    fr: { title: 'Sangliers à la clôture', offer: 'Quatre sangliers creusent sous ma clôture. Chassez-les pour de bon.', goal: 'Vainquez des sangliers dans les champs ({n}/{m}).', done: 'Ma clôture tient. Merci !' },
    es: { title: 'Jabalíes en la valla', offer: 'Cuatro jabalíes cavan bajo mi valla. Échalos para siempre, por favor.', goal: 'Derrota jabalíes en los campos ({n}/{m}).', done: '¡Mi valla sigue en pie! Gracias.' },
    ar: { title: 'خنازير عند السياج', offer: 'أربعة خنازير تحفر تحت سياجي. اطردها، من فضلك.', goal: 'اهزم الخنازير البرية في الحقول ({n}/{m}).', done: 'سياجي ما زال واقفًا. شكرًا!' } } },
{ id: 'c2p5', giver: 'gus', type: 'collect', icon: 'ore2', n: 4, zone: 'c2_ridge', stage: 6, t: {
    en: { title: 'Cinder Ore', offer: 'The best metal comes from Cinder Ridge. Bring me four pieces of cinder ore.', goal: 'Find cinder ore on Cinder Ridge ({n}/{m}).', done: 'Hot and heavy, perfect. My hammer is happy.' },
    fr: { title: 'Minerai de cendre', offer: 'Le meilleur métal vient de la Crête de Cendre. Rapportez-moi quatre morceaux de minerai.', goal: 'Trouvez du minerai sur la Crête de Cendre ({n}/{m}).', done: 'Chaud et lourd, parfait. Mon marteau est content.' },
    es: { title: 'Mineral de ceniza', offer: 'El mejor metal viene de la Cresta de Ceniza. Tráeme cuatro trozos de mineral.', goal: 'Encuentra mineral en la Cresta de Ceniza ({n}/{m}).', done: 'Caliente y pesado, perfecto. Mi martillo está contento.' },
    ar: { title: 'حجر الرماد', offer: 'أفضل حديد يأتي من جبل الرماد. أحضر لي أربع قطع من حجر الرماد.', goal: 'ابحث عن حجر الرماد في جبل الرماد ({n}/{m}).', done: 'ساخن وثقيل، ممتاز. مطرقتي سعيدة.' } } },
{ id: 'c2p6', giver: 'gus', type: 'elite', foe: 'raider', zone: 'c2_fields', stage: 4, name: { en: 'Ironjaw', fr: 'Mâchoire-de-Fer', es: 'Mandíbula de Hierro', ar: 'فك الحديد' }, t: {
    en: { title: 'Ironjaw', offer: 'A huge raider called Ironjaw stole my best hammer. He hides in the fields.', goal: 'Defeat Ironjaw in the Sunpetal Fields.', done: 'My hammer is back! Ironjaw will not come again.' },
    fr: { title: 'Mâchoire-de-Fer', offer: 'Un énorme pillard, Mâchoire-de-Fer, a volé mon meilleur marteau. Il se cache dans les champs.', goal: 'Vainquez Mâchoire-de-Fer dans les champs.', done: 'Mon marteau est revenu ! Il ne reviendra plus.' },
    es: { title: 'Mandíbula de Hierro', offer: 'Un saqueador enorme, Mandíbula de Hierro, robó mi mejor martillo. Se esconde en los campos.', goal: 'Vence a Mandíbula de Hierro en los campos.', done: '¡Mi martillo ha vuelto! No volverá.' },
    ar: { title: 'فك الحديد', offer: 'لص ضخم اسمه فك الحديد سرق أفضل مطرقة عندي. هو يختبئ في الحقول.', goal: 'اهزم فك الحديد في حقول عباد الشمس.', done: 'مطرقتي رجعت! لن يأتي مرة أخرى.' } } },
{ id: 'c2p7', giver: 'juna', type: 'kill', foe: 'imp', n: 5, zone: 'c2_ridge', stage: 6, t: {
    en: { title: 'Fire Imps', offer: 'Imps burnt my herb garden! Five of them live on the ridge.', goal: 'Defeat cinder imps on Cinder Ridge ({n}/{m}).', done: 'No more burnt herbs. Thank you!' },
    fr: { title: 'Diablotins de feu', offer: 'Des diablotins ont brûlé mon jardin d’herbes ! Cinq vivent sur la crête.', goal: 'Vainquez des diablotins sur la Crête de Cendre ({n}/{m}).', done: 'Plus d’herbes brûlées. Merci !' },
    es: { title: 'Diablillos de fuego', offer: '¡Unos diablillos quemaron mi huerto de hierbas! Cinco viven en la cresta.', goal: 'Derrota diablillos en la Cresta de Ceniza ({n}/{m}).', done: 'Se acabaron las hierbas quemadas. ¡Gracias!' },
    ar: { title: 'عفاريت النار', offer: 'العفاريت أحرقت حديقة أعشابي! خمسة منها تعيش في الجبل.', goal: 'اهزم عفاريت النار في جبل الرماد ({n}/{m}).', done: 'لا أعشاب محروقة بعد اليوم. شكرًا!' } } },
{ id: 'c2p8', giver: 'tuck', type: 'deliver', to: 'pell', zone: 'c2_bay', stage: 0, t: {
    en: { title: 'Bread for the Singer', offer: 'Pell sings all day and forgets to eat. Take this warm bread to him in the square.', goal: 'Bring the bread to Pell in the town square.', done: 'He ate it all? Good. A singer needs strength.', given: 'Bread from Tuck? Mmm! Now I can sing until night!' },
    fr: { title: 'Du pain pour le chanteur', offer: 'Pell chante toute la journée et oublie de manger. Portez-lui ce pain chaud sur la place.', goal: 'Portez le pain à Pell, sur la place.', done: 'Il a tout mangé ? Bien. Un chanteur a besoin de forces.', given: 'Du pain de Tuck ? Miam ! Je peux chanter jusqu’à la nuit !' },
    es: { title: 'Pan para el cantante', offer: 'Pell canta todo el día y se olvida de comer. Llévale este pan caliente a la plaza.', goal: 'Lleva el pan a Pell, en la plaza.', done: '¿Se lo comió todo? Bien. Un cantante necesita fuerza.', given: '¿Pan de Tuck? ¡Mmm! ¡Ahora puedo cantar hasta la noche!' },
    ar: { title: 'خبز للمغنّي', offer: 'بيل يغني طوال اليوم وينسى أن يأكل. خذ له هذا الخبز الساخن في الساحة.', goal: 'خذ الخبز إلى بيل في الساحة.', done: 'أكله كله؟ جيد. المغني يحتاج قوة.', given: 'خبز من تاك؟ لذيذ! الآن أستطيع أن أغني حتى الليل!' } } },
{ id: 'c2p9', giver: 'nell', type: 'rescue', zone: 'c2_fields', stage: 2, who: { look: 'lostkid', name: { en: 'Pim', fr: 'Pim', es: 'Pim', ar: 'بيم' } }, t: {
    en: { title: 'Pim Is Lost', offer: 'My friend Pim followed a butterfly into the fields and got lost. Can you find her?', goal: 'Find Pim in the Sunpetal Fields.', done: 'Pim is back! We will play only in town now. Promise!', found: 'I was so scared! I will go home right now. Thank you!' },
    fr: { title: 'Pim est perdue', offer: 'Mon amie Pim a suivi un papillon dans les champs et s’est perdue. Pouvez-vous la retrouver ?', goal: 'Trouvez Pim dans les Champs de Tournesol.', done: 'Pim est revenue ! On jouera seulement en ville maintenant. Promis !', found: 'J’avais tellement peur ! Je rentre tout de suite. Merci !' },
    es: { title: 'Pim se perdió', offer: 'Mi amiga Pim siguió a una mariposa por los campos y se perdió. ¿La encuentras?', goal: 'Encuentra a Pim en los Campos de Girasol.', done: '¡Pim volvió! Ahora solo jugaremos en el pueblo. ¡Prometido!', found: '¡Tenía tanto miedo! Me voy a casa ahora mismo. ¡Gracias!' },
    ar: { title: 'بيم ضاعت', offer: 'صديقتي بيم لحقت فراشة إلى الحقول وضاعت. هل تجدها؟', goal: 'ابحث عن بيم في حقول عباد الشمس.', done: 'بيم رجعت! سنلعب في المدينة فقط من الآن. وعد!', found: 'كنت خائفة جدًا! سأرجع إلى البيت الآن. شكرًا لك!' } } },
{ id: 'c2p10', giver: 'tuck', type: 'elite', foe: 'imp', zone: 'c2_ridge', stage: 6, name: { en: 'Sootfang', fr: 'Croc-de-Suie', es: 'Colmillo de Hollín', ar: 'ناب السخام' }, t: {
    en: { title: 'Sootfang', offer: 'A big imp called Sootfang stole the fire from my oven! It lives on the ridge.', goal: 'Defeat Sootfang on Cinder Ridge.', done: 'My oven is warm again. Free bread for you, always!' },
    fr: { title: 'Croc-de-Suie', offer: 'Un gros diablotin, Croc-de-Suie, a volé le feu de mon four ! Il vit sur la crête.', goal: 'Vainquez Croc-de-Suie sur la Crête de Cendre.', done: 'Mon four est chaud à nouveau. Merci !' },
    es: { title: 'Colmillo de Hollín', offer: '¡Un diablillo grande, Colmillo de Hollín, robó el fuego de mi horno! Vive en la cresta.', goal: 'Vence a Colmillo de Hollín en la Cresta de Ceniza.', done: 'Mi horno vuelve a estar caliente. ¡Gracias!' },
    ar: { title: 'ناب السخام', offer: 'عفريت كبير اسمه ناب السخام سرق النار من فرني! يعيش في الجبل.', goal: 'اهزم ناب السخام في جبل الرماد.', done: 'فرني ساخن من جديد. شكرًا لك!' } } },
{ id: 'c2p11', giver: 'juna', type: 'kill', foe: 'hexer', n: 3, zone: 'c2_light', stage: 8, t: {
    en: { title: 'Dark Magic', offer: 'I can feel the hexers\' magic from here. Stop three of them in the Sunken Lighthouse.', goal: 'Defeat hexers in the Sunken Lighthouse ({n}/{m}).', done: 'The air feels clean again. Thank you.' },
    fr: { title: 'Magie noire', offer: 'Je sens la magie des sorciers d’ici. Arrêtez-en trois dans le Phare englouti.', goal: 'Vainquez des sorciers dans le Phare englouti ({n}/{m}).', done: 'L’air est propre à nouveau. Merci.' },
    es: { title: 'Magia oscura', offer: 'Siento la magia de los hechiceros desde aquí. Detén a tres en el Faro hundido.', goal: 'Derrota hechiceros en el Faro hundido ({n}/{m}).', done: 'El aire vuelve a estar limpio. Gracias.' },
    ar: { title: 'سحر مظلم', offer: 'أشعر بسحر السحرة من هنا. أوقف ثلاثة منهم في المنارة الغارقة.', goal: 'اهزم السحرة في المنارة الغارقة ({n}/{m}).', done: 'الهواء نظيف من جديد. شكرًا.' } } }
];
(function () {
    const T = window.HM_TEXT, M = window.HM_C2_TEXT;
    for (const l in M) for (const part in M[l]) {
        const v = M[l][part];
        if (Array.isArray(v)) T[l][part] = v; else Object.assign(T[l][part] || (T[l][part] = {}), v);
    }
})();
