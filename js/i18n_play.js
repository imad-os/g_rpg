/* Hollowmere: abilities, settings, buttons, gear and mounts screens, chapters, the Rift's ten floors,
 * new gear and foes (4 languages). The Arabic is kept short and plain, with everyday words. */
window.HM_TEXT_PLAY = {
en: { ui: {
    credits: 'Credits', creditsText: 'Kenney (CC0) · ScratchIO, horse (CC0) · ZaPaper / buko-studios.com, commissioned by PlayCraft (playcraftapp.com), dragon (CC-BY 3.0) · Piper voices',
    dragon: 'Dragon', dragonSub: 'Flies over water and low things. You can\'t attack while flying; only bows, guns and magic reach you', dragonHow: 'A dragon lives on Cinder Ridge, in Chapter 2.',
    flyNoAttack: 'You can\'t attack while flying. Land first (Mounts).', flyLand: 'You can\'t land here. Fly to solid ground first.', gotDragon: 'A young dragon is yours! Choose it in Mounts and fly.',
    backF: 'Return', backSub: 'Closes a menu or ends a conversation with one press (hold OK: OK then acts when you let go)',
    healFullHp: 'Your health is already full.', noMount: 'You have no mount yet.', takeOff: 'Take off', critL: 'Critical', hpL: 'Health', goldL: 'Coins',
    gearHelp: 'Arrows: choose · OK: wear or take off · Up: tabs', gearHelpTabs: 'Left / right: slots · Down: your gear · OK: open',
    onFootSub: 'Walk (inside dark dungeons you always walk)', notOwned: 'Not owned', notOwnedLong: 'Win it in a quest, or buy it from Hana.',
    voiceSub: 'Left / right to change; you hear a sample', healSub: 'Heals 20% of your health', powerSub: 'A slam that hits everything around you', distantSub: 'A bolt of light that goes through every foe in a line',
    heal: 'Healing', power: 'Power attack', distant: 'Distant attack', attack: 'Attack', menuF: 'Quick menu', mountF: 'Ride / walk', potionF: 'Drink a potion',
    stamina: 'Stamina', noStamina: 'Not enough stamina: defeat foes to fill it.', cooling: 'Not ready yet.', abilityInfo: '{a} · {s} stamina · {c} s',
    settings: 'Settings', voiceSpeed: 'Voice speed: {n}×', buttons: 'Buttons', resetButtons: 'Reset buttons', mMenu: 'Quick menu', mSettings: 'Settings', mMounts: 'Mounts',
    g_tap: 'OK', g_double: 'OK twice', g_hold: 'Hold OK', g_run: 'Run button (gamepad, Shift)', g_cancel: 'Cancel button (gamepad, Backspace)', g_none: 'Menu only',
    remoteNote: 'On a TV remote only OK, OK twice and Hold OK work; everything is also in the quick menu.',
    gearDetail: 'Details', worn: 'Worn by {name}', compare: 'Compared with what you wear', tier: 'Tier {n}', upgradeLv: 'Upgrade +{n}', noneWorn: 'Nothing worn',
    mounts: 'Mounts', onFoot: 'On foot', riding: 'Riding',
    chapterN: 'Chapter {n}: {name}', ch1Name: 'The Lantern Road', ch2Name: 'The Sunken Lantern', loading: 'Loading', loadFail: 'This place could not be loaded. Try again.',
    wolfStays: 'The wolf will not leave the Greywood. It waits for you with Bram.', staff: 'Staff',
    riftMax: 'The Rift has {n} floors.', riftLast: 'The last floor is clear! Take the stairs to climb out in triumph.',
    riftWon: 'You conquered all ten floors of the Rift! Score: {s}. A legendary piece of gear is yours.',
    ch2Go: 'A new land waits across the lake: ask Sela at the Mirefen Shore to sail you to Larkspur Bay.',
    sailLark: 'Sail to Larkspur Bay (Chapter 2)', letterBack: 'Maren wrote a reply. Bring it to Mirelle in Larkspur.'
}, items: {
    oak_staff: 'Oak staff', ember_staff: 'Ember staff', star_staff: 'Star staff', mage_robe: 'Mage robe',
    tide_blade: 'Tide blade', gale_bow: 'Gale bow', storm_musket: 'Storm musket', tide_staff: 'Tide staff', coral_helm: 'Coral helm', tide_mail: 'Tide mail', wave_boots: 'Wave boots'
}, foes: {
    archer: ['Raider archer', 'Keeps away and shoots. When the bow is drawn, step aside.'],
    gunner: ['Raider musketeer', 'Aims with a red line. Get out of the line before the shot.'],
    hexer: ['Hexer', 'Casts orbs that follow you. Get close and it vanishes, so be quick.'],
    raider: ['Raider', 'Shakes before it lunges. Dodge, then strike.'],
    boar: ['Wild boar', 'Charges in a straight line. If it hits a wall, it is dizzy: attack!'],
    crab: ['Shore crab', 'Walks sideways and pinches. Weak, but they come in groups.'],
    imp: ['Cinder imp', 'A little fire spirit. Fast, and hard to catch.']
}, lines: {
    selaLark: ['Across the lake there is a town called Larkspur Bay. My mother was born there.', 'They say their Lantern sank into the sea a long time ago. When you are ready, I can sail you there.'],
    marenLetter: ['A letter from Mirelle? My little sister! I have not heard from her in forty years.', 'She asks if I am well. I am, now that the Lantern burns. Here, take my answer back to her.']
} },
fr: { ui: {
    credits: 'Crédits', creditsText: 'Kenney (CC0) · ScratchIO, horse (CC0) · ZaPaper / buko-studios.com, commissioned by PlayCraft (playcraftapp.com), dragon (CC-BY 3.0) · Piper voices',
    dragon: 'Dragon', dragonSub: 'Vole au-dessus de l’eau et des petits obstacles. On ne peut pas attaquer en vol ; seuls les arcs, fusils et la magie vous atteignent', dragonHow: 'Un dragon vit sur la Crête de Cendre, au Chapitre 2.',
    flyNoAttack: 'Impossible d’attaquer en volant. Posez-vous d’abord (Montures).', flyLand: 'Impossible de se poser ici. Volez d’abord vers la terre ferme.', gotDragon: 'Un jeune dragon est à vous ! Choisissez-le dans Montures et volez.',
    backF: 'Retour', backSub: 'Ferme un menu ou termine une conversation d’un seul appui (OK maintenu : OK agit alors au relâchement)',
    healFullHp: 'Votre santé est déjà pleine.', noMount: 'Vous n’avez pas encore de monture.', takeOff: 'Retirer', critL: 'Critique', hpL: 'Santé', goldL: 'Pièces',
    gearHelp: 'Flèches : choisir · OK : porter ou retirer · Haut : onglets', gearHelpTabs: 'Gauche / droite : emplacements · Bas : votre équipement · OK : ouvrir',
    onFootSub: 'À pied (dans les donjons sombres, on marche toujours)', notOwned: 'Pas à vous', notOwnedLong: 'Gagnez-la par une quête, ou achetez-la chez Hana.',
    voiceSub: 'Gauche / droite pour changer ; un extrait est joué', healSub: 'Soigne 20 % de votre santé', powerSub: 'Un coup au sol qui frappe tout autour de vous', distantSub: 'Un trait de lumière qui traverse tous les ennemis en ligne',
    heal: 'Soin', power: 'Attaque puissante', distant: 'Attaque à distance', attack: 'Attaque', menuF: 'Menu rapide', mountF: 'Monter / marcher', potionF: 'Boire une potion',
    stamina: 'Endurance', noStamina: 'Pas assez d’endurance : battez des ennemis pour la remplir.', cooling: 'Pas encore prêt.', abilityInfo: '{a} · {s} d’endurance · {c} s',
    settings: 'Réglages', voiceSpeed: 'Vitesse des voix : {n}×', buttons: 'Boutons', resetButtons: 'Boutons par défaut', mMenu: 'Menu rapide', mSettings: 'Réglages', mMounts: 'Montures',
    g_tap: 'OK', g_double: 'OK deux fois', g_hold: 'OK maintenu', g_run: 'Bouton course (manette, Maj)', g_cancel: 'Bouton annuler (manette, Retour arrière)', g_none: 'Menu seulement',
    remoteNote: 'Sur une télécommande, seuls OK, OK deux fois et OK maintenu marchent ; tout est aussi dans le menu rapide.',
    gearDetail: 'Détails', worn: 'Porté par {name}', compare: 'Comparé à ce que vous portez', tier: 'Rang {n}', upgradeLv: 'Amélioration +{n}', noneWorn: 'Rien de porté',
    mounts: 'Montures', onFoot: 'À pied', riding: 'En selle',
    chapterN: 'Chapitre {n} : {name}', ch1Name: 'La Route de la Lanterne', ch2Name: 'La Lanterne engloutie', loading: 'Chargement', loadFail: 'Ce lieu n’a pas pu être chargé. Réessayez.',
    wolfStays: 'Le loup ne quitte pas le Boisgris. Il vous attend chez Bram.', staff: 'Bâton',
    riftMax: 'La Faille a {n} niveaux.', riftLast: 'Le dernier niveau est nettoyé ! Prenez l’escalier pour sortir en vainqueurs.',
    riftWon: 'Vous avez vaincu les dix niveaux de la Faille ! Score : {s}. Une pièce légendaire est à vous.',
    ch2Go: 'Une nouvelle terre attend de l’autre côté du lac : demandez à Sela, sur la Rive de la Fangemare, de vous emmener à la Baie de Larkspur.',
    sailLark: 'Naviguer vers la Baie de Larkspur (Chapitre 2)', letterBack: 'Maren a écrit une réponse. Portez-la à Mirelle, à Larkspur.'
}, items: {
    oak_staff: 'Bâton de chêne', ember_staff: 'Bâton de braise', star_staff: 'Bâton étoilé', mage_robe: 'Robe de mage',
    tide_blade: 'Lame des marées', gale_bow: 'Arc des rafales', storm_musket: 'Mousquet de tempête', tide_staff: 'Bâton des marées', coral_helm: 'Heaume de corail', tide_mail: 'Cotte des marées', wave_boots: 'Bottes des vagues'
}, foes: {
    archer: ['Archer pillard', 'Il reste loin et tire. Quand l’arc est tendu, faites un pas de côté.'],
    gunner: ['Mousquetaire pillard', 'Il vise avec une ligne rouge. Sortez de la ligne avant le tir.'],
    hexer: ['Sorcier', 'Il lance des orbes qui vous suivent. Approchez-vous et il disparaît : soyez rapide.'],
    raider: ['Pillard', 'Il tremble avant de foncer. Esquivez, puis frappez.'],
    boar: ['Sanglier', 'Il charge tout droit. S’il heurte un mur, il est étourdi : attaquez !'],
    crab: ['Crabe du rivage', 'Il marche de côté et pince. Faible, mais ils viennent en groupe.'],
    imp: ['Diablotin des cendres', 'Un petit esprit de feu. Rapide, et dur à attraper.']
}, lines: {
    selaLark: ['De l’autre côté du lac, il y a une ville : la Baie de Larkspur. Ma mère y est née.', 'On dit que leur Lanterne a sombré dans la mer il y a longtemps. Quand vous serez prêts, je peux vous y emmener.'],
    marenLetter: ['Une lettre de Mirelle ? Ma petite sœur ! Je n’ai pas eu de nouvelles depuis quarante ans.', 'Elle demande si je vais bien. Oui, maintenant que la Lanterne brûle. Tenez, rapportez-lui ma réponse.']
} },
es: { ui: {
    credits: 'Créditos', creditsText: 'Kenney (CC0) · ScratchIO, horse (CC0) · ZaPaper / buko-studios.com, commissioned by PlayCraft (playcraftapp.com), dragon (CC-BY 3.0) · Piper voices',
    dragon: 'Dragón', dragonSub: 'Vuela sobre el agua y obstáculos bajos. No puedes atacar volando; solo arcos, armas de fuego y magia te alcanzan', dragonHow: 'Un dragón vive en la Cresta de Ceniza, en el Capítulo 2.',
    flyNoAttack: 'No puedes atacar volando. Aterriza primero (Monturas).', flyLand: 'No puedes aterrizar aquí. Vuela antes a tierra firme.', gotDragon: '¡Un dragón joven es tuyo! Elígelo en Monturas y vuela.',
    backF: 'Volver', backSub: 'Cierra un menú o termina una conversación con una sola pulsación (mantener OK: OK actúa al soltarlo)',
    healFullHp: 'Tu salud ya está completa.', noMount: 'Todavía no tienes montura.', takeOff: 'Quitar', critL: 'Crítico', hpL: 'Salud', goldL: 'Monedas',
    gearHelp: 'Flechas: elegir · OK: poner o quitar · Arriba: pestañas', gearHelpTabs: 'Izquierda / derecha: huecos · Abajo: tu equipo · OK: abrir',
    onFootSub: 'A pie (en las mazmorras oscuras siempre se camina)', notOwned: 'No es tuya', notOwnedLong: 'Gánala en una misión o cómprala en la tienda de Hana.',
    voiceSub: 'Izquierda / derecha para cambiar; suena una muestra', healSub: 'Cura el 20 % de tu salud', powerSub: 'Un golpe al suelo que alcanza todo a tu alrededor', distantSub: 'Un rayo de luz que atraviesa a todos los enemigos en línea',
    heal: 'Curación', power: 'Ataque poderoso', distant: 'Ataque a distancia', attack: 'Atacar', menuF: 'Menú rápido', mountF: 'Montar / caminar', potionF: 'Beber una poción',
    stamina: 'Aguante', noStamina: 'No tienes aguante suficiente: derrota enemigos para llenarlo.', cooling: 'Todavía no está listo.', abilityInfo: '{a} · {s} de aguante · {c} s',
    settings: 'Ajustes', voiceSpeed: 'Velocidad de las voces: {n}×', buttons: 'Botones', resetButtons: 'Botones por defecto', mMenu: 'Menú rápido', mSettings: 'Ajustes', mMounts: 'Monturas',
    g_tap: 'OK', g_double: 'OK dos veces', g_hold: 'Mantener OK', g_run: 'Botón correr (mando, Mayús)', g_cancel: 'Botón cancelar (mando, Retroceso)', g_none: 'Solo en el menú',
    remoteNote: 'En un mando de TV solo funcionan OK, OK dos veces y mantener OK; todo está también en el menú rápido.',
    gearDetail: 'Detalles', worn: 'Lo lleva {name}', compare: 'Comparado con lo que llevas', tier: 'Nivel {n}', upgradeLv: 'Mejora +{n}', noneWorn: 'Nada puesto',
    mounts: 'Monturas', onFoot: 'A pie', riding: 'Montado',
    chapterN: 'Capítulo {n}: {name}', ch1Name: 'El Camino del Farol', ch2Name: 'El Farol hundido', loading: 'Cargando', loadFail: 'No se pudo cargar este lugar. Inténtalo otra vez.',
    wolfStays: 'El lobo no sale del Bosquegrís. Te espera con Bram.', staff: 'Bastón',
    riftMax: 'La Grieta tiene {n} pisos.', riftLast: '¡El último piso está limpio! Toma la escalera para salir victorioso.',
    riftWon: '¡Has vencido los diez pisos de la Grieta! Puntos: {s}. Una pieza legendaria es tuya.',
    ch2Go: 'Una nueva tierra espera al otro lado del lago: pide a Sela, en la Orilla de Lodomar, que te lleve a la Bahía de Larkspur.',
    sailLark: 'Navegar a la Bahía de Larkspur (Capítulo 2)', letterBack: 'Maren escribió una respuesta. Llévasela a Mirelle, en Larkspur.'
}, items: {
    oak_staff: 'Bastón de roble', ember_staff: 'Bastón de ascuas', star_staff: 'Bastón estelar', mage_robe: 'Túnica de mago',
    tide_blade: 'Hoja de marea', gale_bow: 'Arco del vendaval', storm_musket: 'Mosquete de tormenta', tide_staff: 'Bastón de marea', coral_helm: 'Yelmo de coral', tide_mail: 'Malla de marea', wave_boots: 'Botas de ola'
}, foes: {
    archer: ['Arquero saqueador', 'Se queda lejos y dispara. Cuando tensa el arco, apártate.'],
    gunner: ['Mosquetero saqueador', 'Apunta con una línea roja. Sal de la línea antes del disparo.'],
    hexer: ['Hechicero', 'Lanza orbes que te siguen. Si te acercas, desaparece: sé rápido.'],
    raider: ['Saqueador', 'Tiembla antes de lanzarse. Esquiva y luego golpea.'],
    boar: ['Jabalí', 'Embiste en línea recta. Si choca con una pared, se marea: ¡ataca!'],
    crab: ['Cangrejo de playa', 'Camina de lado y pellizca. Débil, pero van en grupo.'],
    imp: ['Diablillo de ceniza', 'Un pequeño espíritu de fuego. Rápido y difícil de atrapar.']
}, lines: {
    selaLark: ['Al otro lado del lago hay un pueblo: la Bahía de Larkspur. Mi madre nació allí.', 'Dicen que su Farol se hundió en el mar hace mucho. Cuando estés listo, puedo llevarte.'],
    marenLetter: ['¿Una carta de Mirelle? ¡Mi hermana pequeña! No sé nada de ella desde hace cuarenta años.', 'Pregunta si estoy bien. Lo estoy, ahora que el Farol arde. Toma, llévale mi respuesta.']
} },
ar: { ui: {
    credits: 'الشكر', creditsText: 'Kenney (CC0) · ScratchIO, horse (CC0) · ZaPaper / buko-studios.com, commissioned by PlayCraft (playcraftapp.com), dragon (CC-BY 3.0) · Piper voices',
    dragon: 'تنين', dragonSub: 'يطير فوق الماء والأشياء الصغيرة. لا تستطيع الهجوم وأنت تطير، ولا يصل إليك إلا السهم والرصاص والسحر', dragonHow: 'يعيش تنين في جبل الرماد، في الفصل 2.',
    flyNoAttack: 'لا تستطيع الهجوم وأنت تطير. انزل أولًا (الركوب).', flyLand: 'لا تستطيع النزول هنا. طِر أولًا إلى أرض صلبة.', gotDragon: 'صار عندك تنين صغير! اختره من الركوب وطِر.',
    backF: 'رجوع', backSub: 'يغلق القائمة أو ينهي الكلام بضغطة واحدة (مع الضغط الطويل: يعمل OK عندما ترفع إصبعك)',
    healFullHp: 'صحتك كاملة.', noMount: 'ليس عندك ما تركبه بعد.', takeOff: 'انزع', critL: 'ضربة قوية', hpL: 'الصحة', goldL: 'العملات',
    gearHelp: 'الأسهم: اختر · OK: البس أو انزع · فوق: الأقسام', gearHelpTabs: 'يمين / يسار: الأقسام · تحت: أغراضك · OK: افتح',
    onFootSub: 'المشي (في الأماكن المظلمة تمشي دائمًا)', notOwned: 'ليس لك', notOwnedLong: 'تحصل عليه من مهمة، أو تشتريه من هانا.',
    voiceSub: 'يمين / يسار للتغيير، وستسمع مثالًا', healSub: 'يعيد 20٪ من صحتك', powerSub: 'ضربة على الأرض تصيب كل من حولك', distantSub: 'سهم من نور يمر عبر كل الأعداء أمامك',
    heal: 'العلاج', power: 'ضربة قوية', distant: 'ضربة بعيدة', attack: 'الهجوم', menuF: 'القائمة السريعة', mountF: 'اركب / امشِ', potionF: 'اشرب دواءً',
    stamina: 'الطاقة', noStamina: 'طاقتك لا تكفي: اهزم الأعداء لتمتلئ.', cooling: 'ليس جاهزًا بعد.', abilityInfo: '{a} · {s} طاقة · {c} ث',
    settings: 'الإعدادات', voiceSpeed: 'سرعة الكلام: {n}×', buttons: 'الأزرار', resetButtons: 'أرجع الأزرار كما كانت', mMenu: 'القائمة السريعة', mSettings: 'الإعدادات', mMounts: 'الركوب',
    g_tap: 'OK', g_double: 'OK مرتين', g_hold: 'ضغط طويل على OK', g_run: 'زر الجري (يد اللعب، Shift)', g_cancel: 'زر الإلغاء (يد اللعب، Backspace)', g_none: 'من القائمة فقط',
    remoteNote: 'في جهاز التحكم للتلفاز تعمل فقط: OK، و OK مرتين، والضغط الطويل. وكل شيء موجود في القائمة السريعة.',
    gearDetail: 'التفاصيل', worn: 'يلبسه {name}', compare: 'مقارنة بما تلبسه', tier: 'المستوى {n}', upgradeLv: 'تقوية +{n}', noneWorn: 'لا تلبس شيئًا',
    mounts: 'الركوب', onFoot: 'مشيًا', riding: 'راكب',
    chapterN: 'الفصل {n}: {name}', ch1Name: 'طريق الفانوس', ch2Name: 'الفانوس الغارق', loading: 'جارٍ التحميل', loadFail: 'لم يتم تحميل هذا المكان. حاول مرة أخرى.',
    wolfStays: 'الذئب لا يترك الغابة الرمادية. هو ينتظرك عند برام.', staff: 'عصا',
    riftMax: 'في الشق {n} طوابق.', riftLast: 'نظّفت الطابق الأخير! اصعد الدرج لتخرج منتصرًا.',
    riftWon: 'فزت في كل الطوابق العشرة! النقاط: {s}. وحصلت على قطعة نادرة جدًا.',
    ch2Go: 'هناك أرض جديدة وراء البحيرة: اطلب من سيلا عند شاطئ ميرفن أن تأخذك إلى خليج لاركسبير.',
    sailLark: 'أبحر إلى خليج لاركسبير (الفصل 2)', letterBack: 'كتبت مارين ردًا. خذه إلى ميريل في لاركسبير.'
}, items: {
    oak_staff: 'عصا البلوط', ember_staff: 'عصا الجمر', star_staff: 'عصا النجوم', mage_robe: 'ثوب الساحر',
    tide_blade: 'سيف الموج', gale_bow: 'قوس الريح', storm_musket: 'بندقية العاصفة', tide_staff: 'عصا الموج', coral_helm: 'خوذة المرجان', tide_mail: 'درع الموج', wave_boots: 'حذاء الموج'
}, foes: {
    archer: ['رامي اللصوص', 'يبقى بعيدًا ويرمي. عندما يشد قوسه، تحرك جانبًا.'],
    gunner: ['صاحب البندقية', 'يصوّب بخط أحمر. اخرج من الخط قبل أن يطلق.'],
    hexer: ['الساحر', 'يرمي كرات تلحق بك. إذا اقتربت منه يختفي، فكن سريعًا.'],
    raider: ['اللص', 'يهتز قبل أن يهجم. ابتعد، ثم اضربه.'],
    boar: ['الخنزير البري', 'يركض في خط مستقيم. إذا اصطدم بالجدار يدوخ: اضربه الآن!'],
    crab: ['سلطعون الشاطئ', 'يمشي على جنبه ويقرص. ضعيف، لكنه يأتي مع أصحابه.'],
    imp: ['عفريت النار', 'روح نار صغيرة. سريع، ويصعب الإمساك به.']
}, lines: {
    selaLark: ['وراء البحيرة مدينة اسمها خليج لاركسبير. هناك وُلدت أمي.', 'يقولون إن فانوسهم غرق في البحر منذ زمن طويل. عندما تكون جاهزًا، آخذك إلى هناك بقاربي.'],
    marenLetter: ['رسالة من ميريل؟ أختي الصغيرة! لم أسمع عنها شيئًا منذ أربعين سنة.', 'تسأل هل أنا بخير. نعم، أنا بخير الآن والفانوس مضيء. خذ ردي إليها.']
} }
};
(function () {
    const T = window.HM_TEXT, M = window.HM_TEXT_PLAY;
    for (const l in M) for (const part in M[l]) Object.assign(T[l][part] || (T[l][part] = {}), M[l][part]);
})();
