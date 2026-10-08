/* Hollowmere: the cat, the mounts, the quest pool: texts in 4 languages (merged into HM_TEXT). */
window.HM_TEXT_PETS = {
en: {
    ui: {
        gearReward: 'a piece of gear', ironReward: '{n} iron ore', qAbandon: 'Drop my current task', qDropped: 'Quest dropped.',
        gotPet: 'A cat joins you! It picks up loot and fights at your side.', gotMount: 'New mount: {m}! Choose it in the menu (hold OK).',
        horse: 'Horse', wolfMount: 'Wolf', rideHorse: 'Ride the horse', rideWolf: 'Ride the wolf', walk: 'Get down and walk',
        mRide: 'Ride: {m}', mWalk: 'Walk', noRideDark: 'Too dark and narrow to ride in here.', petDown: 'Your cat needs a rest.',
        store: 'Hana\'s Store', horseSub: 'Mount: the fastest way to travel', wolfSub: 'Mount: fast, and it bites the foes you run into',
        catName: 'Cat'
    },
    names: { kitten: 'Kitten', bramble: 'Bramble', pup: 'Wolf pup' },
    quests: {
        kitten: { title: 'The Smallest Kitten', goal: 'Find Hana\'s lost kitten on the Mirefen shore.',
            offer: ['My cat had kittens, and the smallest one followed a frog all the way to the Mirefen shore.', 'Bring her back and... you know what, she likes you already. Keep her.'],
            done: ['There she is! She chose you, you know. Cats always choose.', 'She\'ll follow you, pick up anything shiny, and scratch anything that scares you.'] },
        bramble: { title: 'Bramble', goal: 'Find Odo\'s old warhorse, Bramble, in the Old Quarry.',
            offer: ['My old warhorse Bramble bolted when the mites came, straight into the quarry.', 'Truth is, I\'m too old to ride him. Find him, and he\'s yours.'],
            done: ['Bramble! Look at him, already nuzzling you.', 'He\'s yours. Ride him anywhere outside the dark places, and he\'ll get you there fast.'] },
        pup: { title: 'The Wolf Pup', goal: 'Find the lone wolf pup in the Greywood.',
            offer: ['With the pack scattered, there\'s a young wolf alone in the south of the wood. Half-grown already.', 'Wolves remember kindness. Find it, and it may carry you one day. Sooner than you think.'],
            done: ['It followed you all the way here? Then it\'s yours.', 'That\'s no pup any more. It will carry you, and it bites back when you fight.'] }
    },
    lines: {
        kittenFound: ['Mew! (The kitten climbs up your leg and refuses to let go.)'],
        brambleFound: ['(Bramble snorts, sniffs your hand, and trots after you.)'],
        pupFound: ['(The young wolf watches you for a long moment, then lowers its head and pads after you.)']
    }
},
fr: {
    ui: {
        gearReward: 'une pièce d\'équipement', ironReward: '{n} minerai de fer', qAbandon: 'Abandonner ma tâche en cours', qDropped: 'Quête abandonnée.',
        gotPet: 'Un chat vous rejoint ! Il ramasse le butin et se bat à vos côtés.', gotMount: 'Nouvelle monture : {m} ! Choisissez-la dans le menu (OK maintenu).',
        horse: 'Cheval', wolfMount: 'Loup', rideHorse: 'Monter à cheval', rideWolf: 'Monter le loup', walk: 'Descendre et marcher',
        mRide: 'Monture : {m}', mWalk: 'Marcher', noRideDark: 'Trop sombre et trop étroit pour monter ici.', petDown: 'Votre chat a besoin de repos.',
        store: 'La boutique de Hana', horseSub: 'Monture : la façon la plus rapide de voyager', wolfSub: 'Monture : rapide, et il mord les ennemis que vous percutez',
        catName: 'Chat'
    },
    names: { kitten: 'Chaton', bramble: 'Bramble', pup: 'Louveteau' },
    quests: {
        kitten: { title: 'Le plus petit chaton', goal: 'Retrouvez le chaton perdu de Hana sur la rive de la Fangemare.',
            offer: ['Ma chatte a eu des petits, et le plus petit a suivi une grenouille jusqu\'à la rive de la Fangemare.', 'Ramenez-le et... vous savez quoi, il vous aime déjà. Gardez-le.'],
            done: ['Le voilà ! Il vous a choisi, vous savez. Les chats choisissent toujours.', 'Il vous suivra, ramassera tout ce qui brille, et griffera tout ce qui vous fait peur.'] },
        bramble: { title: 'Bramble', goal: 'Retrouvez Bramble, le vieux cheval de guerre d\'Odo, dans la Vieille Carrière.',
            offer: ['Mon vieux cheval de guerre Bramble s\'est enfui quand les mites sont venues, droit dans la carrière.', 'À vrai dire, je suis trop vieux pour le monter. Retrouvez-le, et il est à vous.'],
            done: ['Bramble ! Regardez-le, il vous fait déjà des câlins.', 'Il est à vous. Montez-le partout hors des endroits sombres, il vous y mènera vite.'] },
        pup: { title: 'Le louveteau', goal: 'Retrouvez le jeune loup solitaire dans le Boisgris.',
            offer: ['La meute s\'est dispersée, et un jeune loup est resté seul au sud du bois. Déjà à moitié adulte.', 'Les loups se souviennent de la gentillesse. Trouvez-le, et il vous portera peut-être un jour. Plus tôt que vous ne croyez.'],
            done: ['Il vous a suivi jusqu\'ici ? Alors il est à vous.', 'Ce n\'est plus un louveteau. Il vous portera, et il mord quand vous vous battez.'] }
    },
    lines: {
        kittenFound: ['Miaou ! (Le chaton grimpe le long de votre jambe et refuse de vous lâcher.)'],
        brambleFound: ['(Bramble s\'ébroue, renifle votre main et vous suit au trot.)'],
        pupFound: ['(Le jeune loup vous observe longuement, puis baisse la tête et vous suit.)']
    }
},
es: {
    ui: {
        gearReward: 'una pieza de equipo', ironReward: '{n} de mineral de hierro', qAbandon: 'Dejar mi encargo actual', qDropped: 'Misión abandonada.',
        gotPet: '¡Una gata se une a ti! Recoge el botín y lucha a tu lado.', gotMount: '¡Nueva montura: {m}! Elígela en el menú (mantén OK).',
        horse: 'Caballo', wolfMount: 'Lobo', rideHorse: 'Montar a caballo', rideWolf: 'Montar el lobo', walk: 'Bajar y caminar',
        mRide: 'Montura: {m}', mWalk: 'Caminar', noRideDark: 'Demasiado oscuro y estrecho para montar aquí.', petDown: 'Tu gata necesita descansar.',
        store: 'La tienda de Hana', horseSub: 'Montura: la forma más rápida de viajar', wolfSub: 'Montura: rápida, y muerde a los enemigos con los que chocas',
        catName: 'Gata'
    },
    names: { kitten: 'Gatita', bramble: 'Bramble', pup: 'Lobezno' },
    quests: {
        kitten: { title: 'La gatita más pequeña', goal: 'Encuentra a la gatita perdida de Hana en la orilla de Lodomar.',
            offer: ['Mi gata tuvo gatitos, y la más pequeña siguió a una rana hasta la orilla de Lodomar.', 'Tráela y... ¿sabes qué? Ya te quiere. Quédatela.'],
            done: ['¡Ahí está! Te eligió a ti, ¿sabes? Los gatos siempre eligen.', 'Te seguirá, recogerá todo lo que brille y arañará todo lo que te asuste.'] },
        bramble: { title: 'Bramble', goal: 'Encuentra a Bramble, el viejo caballo de guerra de Odo, en la Vieja Cantera.',
            offer: ['Mi viejo caballo de guerra Bramble se desbocó cuando llegaron los ácaros, directo a la cantera.', 'La verdad es que ya soy viejo para montarlo. Encuéntralo, y es tuyo.'],
            done: ['¡Bramble! Míralo, ya te está haciendo mimos.', 'Es tuyo. Móntalo donde quieras fuera de los lugares oscuros, y te llevará rápido.'] },
        pup: { title: 'El lobezno', goal: 'Encuentra al joven lobo solitario en el Bosquegrís.',
            offer: ['Con la manada dispersa, hay un lobo joven solo al sur del bosque. Ya medio crecido.', 'Los lobos recuerdan la bondad. Encuéntralo, y quizá algún día te lleve. Antes de lo que crees.'],
            done: ['¿Te ha seguido hasta aquí? Entonces es tuyo.', 'Ya no es un cachorro. Te llevará, y muerde cuando luchas.'] }
    },
    lines: {
        kittenFound: ['¡Miau! (La gatita trepa por tu pierna y no te suelta.)'],
        brambleFound: ['(Bramble resopla, olfatea tu mano y te sigue al trote.)'],
        pupFound: ['(El joven lobo te mira un buen rato, luego baja la cabeza y te sigue.)']
    }
},
ar: {
    ui: {
        gearReward: 'قطعة عتاد', ironReward: '{n} خام حديد', qAbandon: 'التخلّي عن مهمتي الحالية', qDropped: 'تم التخلّي عن المهمة.',
        gotPet: 'انضمّت إليكم قطّة! تلتقط الغنائم وتقاتل إلى جانبكم.', gotMount: 'مطيّة جديدة: {m}! اختاروها من القائمة (اضغط مطولًا على OK).',
        horse: 'حصان', wolfMount: 'ذئب', rideHorse: 'ركوب الحصان', rideWolf: 'ركوب الذئب', walk: 'النزول والمشي',
        mRide: 'المطيّة: {m}', mWalk: 'المشي', noRideDark: 'المكان مظلم وضيّق جدًا للركوب.', petDown: 'قطّتكم تحتاج إلى الراحة.',
        store: 'متجر هانا', horseSub: 'مطيّة: أسرع طريقة للتنقّل', wolfSub: 'مطيّة: سريع، ويعضّ الأعداء الذين تصطدمون بهم',
        catName: 'القطّة'
    },
    names: { kitten: 'القطّة الصغيرة', bramble: 'برامبل', pup: 'جرو الذئب' },
    quests: {
        kitten: { title: 'أصغر القطط', goal: 'ابحثوا عن قطّة هانا الصغيرة الضائعة على شاطئ ميرفن.',
            offer: ['أنجبت قطّتي صغارًا، وأصغرها لحقت بضفدع حتى شاطئ ميرفن.', 'أعيدوها و... أتعرفون؟ إنها تحبّكم منذ الآن. احتفظوا بها.'],
            done: ['ها هي! لقد اختارتكم. القطط تختار دائمًا.', 'ستتبعكم، وتلتقط كل ما يلمع، وتخدش كل ما يخيفكم.'] },
        bramble: { title: 'برامبل', goal: 'ابحثوا عن برامبل، حصان أودو الحربي العجوز، في المقلع القديم.',
            offer: ['هرب حصاني الحربي العجوز برامبل حين جاء السوس، مباشرة إلى المقلع.', 'الحقيقة أنني صرت أكبر من أن أركبه. ابحثوا عنه، وهو لكم.'],
            done: ['برامبل! انظروا إليه، إنه يتودّد إليكم منذ الآن.', 'إنه لكم. اركبوه في كل مكان خارج الأماكن المظلمة، وسيوصلكم بسرعة.'] },
        pup: { title: 'جرو الذئب', goal: 'ابحثوا عن جرو الذئب الوحيد في الغابة الرمادية.',
            offer: ['بعد أن تفرّق القطيع، بقي ذئب صغير وحيدًا في جنوب الغابة. نصف بالغ منذ الآن.', 'الذئاب تتذكّر اللطف. ابحثوا عنه، وقد يحملكم يومًا ما. أقرب مما تظنون.'],
            done: ['تبعكم حتى هنا؟ إذن هو لكم.', 'لم يعد جروًا. سيحملكم، ويعضّ حين تقاتلون.'] }
    },
    lines: {
        kittenFound: ['مياو! (تتسلّق القطّة الصغيرة ساقكم وترفض أن تترككم.)'],
        brambleFound: ['(يحمحم برامبل، ويشمّ يدكم، ثم يخبّ وراءكم.)'],
        pupFound: ['(يراقبكم الذئب الصغير طويلًا، ثم يخفض رأسه ويمشي خلفكم.)']
    }
}
};
(function () {
    const T = window.HM_TEXT, M = window.HM_TEXT_PETS;
    for (const lang in M) {
        const t = T[lang], m = M[lang];
        Object.assign(t.ui, m.ui); Object.assign(t.lines, m.lines); Object.assign(t.quests, m.quests);
        t.names = m.names;
    }
})();
