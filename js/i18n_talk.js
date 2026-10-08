/* Hollowmere: loot and forge texts, and the written questions the main characters can answer.
 * talk: { q: the hero's question, a: the answer, s: from story step, e: until story step (optional) }
 * The order of the questions must be the same in every language (recorded voices use their position). */
window.HM_TEXT_TALK = {
en: {
    ui: {
        rar1: 'Rare', rar2: 'Epic', rar3: 'Legendary', rarityFmt: '{r} {item}',
        b_a: '+{n} ATK', b_d: '+{n} DEF', b_c: '+{n}% crit', b_s: '+{n}% speed', b_h: '+{n} HP', b_g: '+{n}% coins',
        gotIron: '+{n} iron ore', fBuy: 'Buy gear', fBuySub: 'Weapons, helmets, armour and boots', fUp: 'Upgrade gear', fUpSub: 'Coins and iron ore: from +1 to +5',
        fSell: 'Sell gear', fSellSub: 'Only gear nobody is wearing', max: 'MAX', sellAgain: 'Press OK again to sell', sold: 'Sold for {n} coins.',
        upgraded: '{item}: upgraded!', needOre: 'Not enough iron ore.', bagFull: 'Bag full! Sold for {n} coins.', bagFullShort: 'Your bag is full. Sell something first.'
    },
    talk: {
        maren: [
            { s: 1, q: 'What is the Hush, really?', a: 'Nobody knows where it began. The old songs say it is what remains when the world forgets something. The Lantern remembers for us, so the Hush cannot take hold.' },
            { s: 10, q: 'Tell me about Corvin.', a: 'Clever, gentle, and stubborn as a mule. When Lira drowned, something in him went quiet, and I mistook the quiet for healing.' },
            { s: 13, e: 16, q: 'Will Corvin fight us?', a: 'I hope not. But grief can hold a blade as well as anyone. If he does, remember that the boy I knew is still in there.' },
            { s: 17, q: 'What happens now?', a: 'Now we rest, and keep the Lantern fed. And I set an extra place at the table, in case someone finds the way home.' }
        ],
        tobin: [
            { s: 4, q: 'How do upgrades work?', a: 'Bring me coins and iron ore and I\'ll fold more strength into your gear, up to five times. Iron ore? Stone mites and old bones carry it, and chests hide some.' },
            { s: 4, q: 'What makes gear rare?', a: 'Old smiths left their mark on some pieces: a sharper edge, a lighter step. The glow tells you which. Blue is good, purple is better, and gold is a story.' },
            { s: 11, q: 'What is in the Deep Mine?', a: 'Old tunnels and older things. We sealed the lower halls the year the stone started humming at night.' }
        ],
        sela: [
            { s: 6, q: 'Why do you stay on the shore?', a: 'Someone has to row the lost ones home. The mire is cruel, but it is never lonely.' },
            { s: 8, q: 'Is the Drowned Isle dangerous?', a: 'The bell rings for the drowned, and something heavy wallows near it now. Keep your feet dry and your blade drier.' },
            { s: 15, q: 'Did you know Lira?', a: 'She used to sit on my dock and give names to the frogs. Every single one. The mire was kinder in those days.' }
        ],
        corvin: [
            { s: 15, q: 'Will you come home?', a: 'When I can bear Maren\'s kindness. It is harder to face than her anger ever was.' },
            { s: 15, q: 'What did the Hush promise you?', a: 'Nothing. That is the worst of it. It never promised anything. I heard my own wish in the silence and called it a voice.' }
        ]
    }
},

fr: {
    ui: {
        rar1: 'rare', rar2: 'épique', rar3: 'légendaire', rarityFmt: '{item} {r}',
        b_a: '+{n} ATQ', b_d: '+{n} DÉF', b_c: '+{n} % critique', b_s: '+{n} % vitesse', b_h: '+{n} PV', b_g: '+{n} % pièces',
        gotIron: '+{n} minerai de fer', fBuy: 'Acheter de l\'équipement', fBuySub: 'Armes, casques, armures et bottes', fUp: 'Améliorer l\'équipement', fUpSub: 'Pièces et minerai de fer : de +1 à +5',
        fSell: 'Vendre de l\'équipement', fSellSub: 'Seulement ce que personne ne porte', max: 'MAX', sellAgain: 'Appuyez encore sur OK pour vendre', sold: 'Vendu pour {n} pièces.',
        upgraded: '{item} : amélioré !', needOre: 'Pas assez de minerai de fer.', bagFull: 'Sac plein ! Vendu pour {n} pièces.', bagFullShort: 'Votre sac est plein. Vendez quelque chose d\'abord.'
    },
    talk: {
        maren: [
            { s: 1, q: 'Qu\'est-ce que le Silence, vraiment ?', a: 'Personne ne sait où il a commencé. Les vieilles chansons disent que c\'est ce qui reste quand le monde oublie quelque chose. La Lanterne se souvient pour nous, alors le Silence ne peut pas s\'installer.' },
            { s: 10, q: 'Parlez-moi de Corvin.', a: 'Intelligent, doux, et têtu comme une mule. Quand Lira s\'est noyée, quelque chose en lui s\'est tu, et j\'ai pris ce silence pour une guérison.' },
            { s: 13, e: 16, q: 'Corvin va-t-il nous combattre ?', a: 'J\'espère que non. Mais le chagrin sait tenir une lame aussi bien qu\'un autre. S\'il le fait, souvenez-vous que le garçon que je connaissais est toujours là.' },
            { s: 17, q: 'Et maintenant ?', a: 'Maintenant, on se repose, et on nourrit la Lanterne. Et je mets un couvert de plus à table, au cas où quelqu\'un retrouverait le chemin de la maison.' }
        ],
        tobin: [
            { s: 4, q: 'Comment marchent les améliorations ?', a: 'Apportez-moi des pièces et du minerai de fer, et je replierai plus de force dans votre équipement, jusqu\'à cinq fois. Du minerai ? Les mites de pierre et les vieux os en portent, et les coffres en cachent.' },
            { s: 4, q: 'Qu\'est-ce qui rend un objet rare ?', a: 'Les anciens forgerons ont laissé leur marque sur certaines pièces : un fil plus tranchant, un pas plus léger. La lueur vous le dit. Bleu, c\'est bien, violet, c\'est mieux, et l\'or, c\'est une légende.' },
            { s: 11, q: 'Qu\'y a-t-il dans la Mine Profonde ?', a: 'De vieux tunnels et des choses plus vieilles encore. On a muré les galeries du bas l\'année où la pierre s\'est mise à bourdonner la nuit.' }
        ],
        sela: [
            { s: 6, q: 'Pourquoi restez-vous sur la rive ?', a: 'Il faut bien quelqu\'un pour ramener les égarés. Le marais est cruel, mais il n\'est jamais seul.' },
            { s: 8, q: 'L\'Île Noyée est-elle dangereuse ?', a: 'La cloche sonne pour les noyés, et quelque chose de lourd se vautre près d\'elle maintenant. Gardez les pieds au sec, et votre lame encore plus.' },
            { s: 15, q: 'Vous connaissiez Lira ?', a: 'Elle s\'asseyait sur mon ponton et donnait un nom à chaque grenouille. Chacune. Le marais était plus doux en ce temps-là.' }
        ],
        corvin: [
            { s: 15, q: 'Allez-vous rentrer ?', a: 'Quand je pourrai supporter la gentillesse de Maren. Elle est plus dure à affronter que ne l\'a jamais été sa colère.' },
            { s: 15, q: 'Que vous avait promis le Silence ?', a: 'Rien. C\'est le pire. Il n\'a jamais rien promis. J\'ai entendu mon propre souhait dans le silence et je l\'ai appelé une voix.' }
        ]
    }
},

es: {
    ui: {
        rar1: 'raro', rar2: 'épico', rar3: 'legendario', rarityFmt: '{item} · {r}',
        b_a: '+{n} ATQ', b_d: '+{n} DEF', b_c: '+{n}% crítico', b_s: '+{n}% velocidad', b_h: '+{n} PS', b_g: '+{n}% monedas',
        gotIron: '+{n} mineral de hierro', fBuy: 'Comprar equipo', fBuySub: 'Armas, yelmos, armaduras y botas', fUp: 'Mejorar equipo', fUpSub: 'Monedas y mineral de hierro: de +1 a +5',
        fSell: 'Vender equipo', fSellSub: 'Solo lo que nadie lleva puesto', max: 'MÁX', sellAgain: 'Pulsa OK otra vez para vender', sold: 'Vendido por {n} monedas.',
        upgraded: '¡{item}: mejorado!', needOre: 'No tienes suficiente mineral de hierro.', bagFull: '¡Bolsa llena! Vendido por {n} monedas.', bagFullShort: 'Tu bolsa está llena. Vende algo primero.'
    },
    talk: {
        maren: [
            { s: 1, q: '¿Qué es el Silencio, de verdad?', a: 'Nadie sabe dónde empezó. Las viejas canciones dicen que es lo que queda cuando el mundo olvida algo. El Farol recuerda por nosotros, así que el Silencio no puede quedarse.' },
            { s: 10, q: 'Háblame de Corvin.', a: 'Listo, amable y terco como una mula. Cuando Lira se ahogó, algo en él se quedó callado, y yo confundí ese silencio con la curación.' },
            { s: 13, e: 16, q: '¿Corvin luchará contra nosotros?', a: 'Espero que no. Pero la pena sabe empuñar una espada tan bien como cualquiera. Si lo hace, recuerda que el chico que conocí sigue ahí dentro.' },
            { s: 17, q: '¿Y ahora qué?', a: 'Ahora descansamos y mantenemos el Farol encendido. Y pongo un plato más en la mesa, por si alguien encuentra el camino de vuelta.' }
        ],
        tobin: [
            { s: 4, q: '¿Cómo funcionan las mejoras?', a: 'Tráeme monedas y mineral de hierro y plegaré más fuerza en tu equipo, hasta cinco veces. ¿Mineral? Los ácaros de piedra y los huesos viejos lo llevan, y los cofres esconden algo.' },
            { s: 4, q: '¿Qué hace raro un objeto?', a: 'Los herreros antiguos dejaron su marca en algunas piezas: un filo más agudo, un paso más ligero. El brillo te lo dice. Azul es bueno, morado es mejor, y el dorado es una leyenda.' },
            { s: 11, q: '¿Qué hay en la Mina Profunda?', a: 'Túneles viejos y cosas aún más viejas. Tapiamos las galerías de abajo el año en que la piedra empezó a zumbar por las noches.' }
        ],
        sela: [
            { s: 6, q: '¿Por qué te quedas en la orilla?', a: 'Alguien tiene que llevar a casa a los perdidos. La ciénaga es cruel, pero nunca está sola.' },
            { s: 8, q: '¿Es peligrosa la Isla Ahogada?', a: 'La campana suena por los ahogados, y algo pesado se revuelca cerca de ella ahora. Mantén los pies secos, y tu espada más seca aún.' },
            { s: 15, q: '¿Conocías a Lira?', a: 'Se sentaba en mi embarcadero y le ponía nombre a las ranas. A todas, una por una. La ciénaga era más amable en aquellos días.' }
        ],
        corvin: [
            { s: 15, q: '¿Volverás a casa?', a: 'Cuando pueda soportar la bondad de Maren. Cuesta más enfrentarla que su enfado.' },
            { s: 15, q: '¿Qué te prometió el Silencio?', a: 'Nada. Eso es lo peor. Nunca prometió nada. Oí mi propio deseo en el silencio y lo llamé una voz.' }
        ]
    }
},

ar: {
    ui: {
        rar1: 'نادر', rar2: 'ملحمي', rar3: 'أسطوري', rarityFmt: '{item} · {r}',
        b_a: '+{n} هجوم', b_d: '+{n} دفاع', b_c: '+{n}% ضربة حرجة', b_s: '+{n}% سرعة', b_h: '+{n} صحة', b_g: '+{n}% قطع',
        gotIron: '+{n} خام حديد', fBuy: 'شراء عتاد', fBuySub: 'أسلحة وخوذ ودروع وأحذية', fUp: 'تحسين العتاد', fUpSub: 'قطع وخام حديد: من +1 إلى +5',
        fSell: 'بيع العتاد', fSellSub: 'فقط ما لا يرتديه أحد', max: 'الأقصى', sellAgain: 'اضغطوا OK مرة أخرى للبيع', sold: 'بيع مقابل {n} قطعة.',
        upgraded: '{item}: تم التحسين!', needOre: 'لا يكفي خام الحديد.', bagFull: 'الحقيبة ممتلئة! بيع مقابل {n} قطعة.', bagFullShort: 'حقيبتكم ممتلئة. بيعوا شيئًا أولًا.'
    },
    talk: {
        maren: [
            { s: 1, q: 'ما هو السكون حقًا؟', a: 'لا أحد يعرف من أين بدأ. تقول الأغاني القديمة إنه ما يبقى حين ينسى العالم شيئًا. الفانوس يتذكّر عنّا، فلا يستطيع السكون أن يستقرّ.' },
            { s: 10, q: 'حدّثينا عن كورفين.', a: 'ذكيّ ولطيف وعنيد كالبغل. حين غرقت ليرا، سكت شيء في داخله، وظننت ذلك السكوت شفاءً.' },
            { s: 13, e: 16, q: 'هل سيقاتلنا كورفين؟', a: 'أتمنى ألا يفعل. لكن الحزن يمسك النصل كما يمسكه أي أحد. وإن فعل، فتذكّروا أن الفتى الذي عرفته ما زال هناك.' },
            { s: 17, q: 'وماذا الآن؟', a: 'الآن نرتاح، ونُبقي الفانوس مشتعلًا. وأضع طبقًا إضافيًا على المائدة، تحسّبًا لأن يجد أحدهم طريق العودة.' }
        ],
        tobin: [
            { s: 4, q: 'كيف يعمل التحسين؟', a: 'أحضروا لي قطعًا وخام حديد، وسأطوي قوة أكبر في عتادكم، حتى خمس مرات. الخام؟ يحمله سوس الصخر والعظام القديمة، وتخبّئ الصناديق بعضه.' },
            { s: 4, q: 'ما الذي يجعل العتاد نادرًا؟', a: 'ترك الحدّادون القدامى بصمتهم على بعض القطع: حدّ أمضى، وخطوة أخفّ. التوهّج يخبركم. الأزرق جيد، والبنفسجي أفضل، والذهبي حكاية.' },
            { s: 11, q: 'ماذا يوجد في المنجم العميق؟', a: 'أنفاق قديمة وأشياء أقدم منها. سددنا الأروقة السفلى في العام الذي بدأ فيه الحجر يطنّ ليلًا.' }
        ],
        sela: [
            { s: 6, q: 'لماذا تبقين على الشاطئ؟', a: 'لا بدّ من أحد يعيد التائهين إلى بيوتهم. المستنقع قاسٍ، لكنه ليس وحيدًا أبدًا.' },
            { s: 8, q: 'هل الجزيرة الغارقة خطرة؟', a: 'الجرس يدقّ للغرقى، وشيء ثقيل يتمرّغ قربه الآن. أبقوا أقدامكم جافة، ونصلكم أكثر جفافًا.' },
            { s: 15, q: 'هل عرفتِ ليرا؟', a: 'كانت تجلس على رصيفي وتسمّي الضفادع. كل واحد منها. كان المستنقع ألطف في تلك الأيام.' }
        ],
        corvin: [
            { s: 15, q: 'هل ستعود إلى البيت؟', a: 'حين أحتمل لطف مارين. مواجهته أصعب من مواجهة غضبها.' },
            { s: 15, q: 'بماذا وعدك السكون؟', a: 'بلا شيء. وهذا أسوأ ما في الأمر. لم يعد بشيء قط. سمعت أمنيتي في الصمت وسمّيتها صوتًا.' }
        ]
    }
}
};
(function () {
    const T = window.HM_TEXT, M = window.HM_TEXT_TALK;
    for (const lang in M) { Object.assign(T[lang].ui, M[lang].ui); T[lang].talk = M[lang].talk; }
})();
