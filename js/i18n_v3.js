/* Hollowmere 3.0: texts for the quest journal and tracking, the effects and AI-voice settings, the Hollow Charger,
 * the way north to chapter 3, and the names of the tier 5 gear (4 languages). */
(function () {
    const M = {
        en: { ui: {
            ch3Name: 'The Veilscar Frontier', c3sailNorth: 'Sail north to the Veilscar Frontier',
            trackHint: 'OK on a quest: the arrow follows it', tracked: 'Followed', actN: 'Act {n}', mainQuest: 'Main story', storySoFar: 'The story so far', relics: 'Relics',
            trackMain: 'The arrow follows the main story again.', trackOn: 'The arrow now follows this quest.',
            fxRow: 'Effects', fxSub: 'Shine of legendary gear and weapons, sparks and trails. Lower is faster on old TVs.', fx_auto: 'Auto', fx_low: 'Low', fx_mid: 'Medium', fx_high: 'High',
            aiVoice: 'AI voices', aiVoiceSub: 'My PC\'s AI reads every line aloud, with a voice for each person, in your language.', aiVoiceNone: 'Needs an AI service in My PC (App Store Manager > AI services).',
            aiVoiceTest: 'This is how the people of Hollowmere will sound.', on: 'On', off: 'Off',
            charger: 'Hollow Charger', chargerSub: 'A ghostly winged steed of the Veil. Flies over water, the void and low things; the fastest of all', chargerHow: 'The Hollow Charger answers only the one who defeats the Hollow King, in Chapter 3.'
        }, items: {
            frost_blade: 'Frost blade', runed_bow: 'Runed bow', ash_musket: 'Ash musket', grove_staff: 'Grove staff', warden_helm: 'Warden helm', frost_plate: 'Frost plate',
            runic_robe: 'Runic robe', wyrm_boots: 'Wyrm boots', dawnbreaker: 'Dawnbreaker', sylvan_warbow: 'Sylvan Warbow', thunderforge: 'Thunderforge', veilstaff: 'Veilstaff'
        } },
        fr: { ui: {
            ch3Name: 'La Frontière du Voile', c3sailNorth: 'Naviguer au nord vers la Frontière du Voile',
            trackHint: 'OK sur une quête : la flèche la suit', tracked: 'Suivie', actN: 'Acte {n}', mainQuest: 'Histoire principale', storySoFar: 'L’histoire jusqu’ici', relics: 'Reliques',
            trackMain: 'La flèche suit à nouveau l’histoire principale.', trackOn: 'La flèche suit maintenant cette quête.',
            fxRow: 'Effets', fxSub: 'Éclat de l’équipement légendaire, étincelles et traînées. Plus bas, c’est plus rapide sur les vieilles TV.', fx_auto: 'Auto', fx_low: 'Bas', fx_mid: 'Moyen', fx_high: 'Haut',
            aiVoice: 'Voix IA', aiVoiceSub: 'L’IA de My PC lit chaque réplique à voix haute, avec une voix par personnage, dans votre langue.', aiVoiceNone: 'Il faut un service d’IA dans My PC (App Store Manager > services d’IA).',
            aiVoiceTest: 'Voici comment parleront les gens de Hollowmere.', on: 'Oui', off: 'Non',
            charger: 'Destrier Creux', chargerSub: 'Un destrier fantôme et ailé du Voile. Vole au-dessus de l’eau, du vide et des petits obstacles ; le plus rapide de tous', chargerHow: 'Le Destrier Creux ne répond qu’à celui qui bat le Roi Creux, au chapitre 3.'
        }, items: {
            frost_blade: 'Lame de givre', runed_bow: 'Arc runique', ash_musket: 'Mousquet de cendre', grove_staff: 'Bâton du bosquet', warden_helm: 'Heaume du gardien', frost_plate: 'Plaque de givre',
            runic_robe: 'Robe runique', wyrm_boots: 'Bottes de wyrm', dawnbreaker: 'Brise-Aube', sylvan_warbow: 'Arc sylvestre', thunderforge: 'Forge-Tonnerre', veilstaff: 'Bâton du Voile'
        } },
        es: { ui: {
            ch3Name: 'La Frontera del Velo', c3sailNorth: 'Navegar al norte, a la Frontera del Velo',
            trackHint: 'OK en una misión: la flecha la sigue', tracked: 'Seguida', actN: 'Acto {n}', mainQuest: 'Historia principal', storySoFar: 'La historia hasta ahora', relics: 'Reliquias',
            trackMain: 'La flecha vuelve a seguir la historia principal.', trackOn: 'La flecha sigue ahora esta misión.',
            fxRow: 'Efectos', fxSub: 'Brillo del equipo legendario, chispas y estelas. Más bajo es más rápido en televisores viejos.', fx_auto: 'Auto', fx_low: 'Bajo', fx_mid: 'Medio', fx_high: 'Alto',
            aiVoice: 'Voces IA', aiVoiceSub: 'La IA de My PC lee cada frase en voz alta, con una voz para cada persona, en tu idioma.', aiVoiceNone: 'Necesita un servicio de IA en My PC (App Store Manager > servicios de IA).',
            aiVoiceTest: 'Así sonará la gente de Hollowmere.', on: 'Sí', off: 'No',
            charger: 'Corcel Hueco', chargerSub: 'Un corcel fantasma y alado del Velo. Vuela sobre el agua, el vacío y obstáculos bajos; el más rápido de todos', chargerHow: 'El Corcel Hueco solo responde a quien derrota al Rey Hueco, en el capítulo 3.'
        }, items: {
            frost_blade: 'Hoja de escarcha', runed_bow: 'Arco rúnico', ash_musket: 'Mosquete de ceniza', grove_staff: 'Bastón de la arboleda', warden_helm: 'Yelmo del guardián', frost_plate: 'Placas de escarcha',
            runic_robe: 'Túnica rúnica', wyrm_boots: 'Botas de sierpe', dawnbreaker: 'Rompealbas', sylvan_warbow: 'Arco silvano', thunderforge: 'Forjatruenos', veilstaff: 'Bastón del Velo'
        } },
        ar: { ui: {
            ch3Name: 'حدود الحجاب', c3sailNorth: 'أبحر شمالًا إلى حدود الحجاب',
            trackHint: 'اضغط OK على مهمة: السهم يتبعها', tracked: 'متبوعة', actN: 'الفصل {n}', mainQuest: 'القصة الأساسية', storySoFar: 'القصة حتى الآن', relics: 'الكنوز',
            trackMain: 'السهم يتبع القصة الأساسية من جديد.', trackOn: 'السهم يتبع هذه المهمة الآن.',
            fxRow: 'المؤثرات', fxSub: 'لمعان المعدات الأسطورية والشرارات والآثار. الأقل أسرع على التلفزيونات القديمة.', fx_auto: 'تلقائي', fx_low: 'قليل', fx_mid: 'متوسط', fx_high: 'كثير',
            aiVoice: 'أصوات الذكاء الاصطناعي', aiVoiceSub: 'ذكاء My PC يقرأ كل جملة بصوت عالٍ، بصوت لكل شخصية، بلغتك.', aiVoiceNone: 'يحتاج إلى خدمة ذكاء اصطناعي في My PC (مدير المتجر > خدمات الذكاء الاصطناعي).',
            aiVoiceTest: 'هكذا سيتكلم أهل هولومير.', on: 'نعم', off: 'لا',
            charger: 'الجواد الأجوف', chargerSub: 'جواد شبح بأجنحة من الحجاب. يطير فوق الماء والفراغ والأشياء الصغيرة؛ الأسرع على الإطلاق', chargerHow: 'الجواد الأجوف لا يلبي إلا من يهزم الملك الأجوف، في الفصل الثالث.'
        }, items: {
            frost_blade: 'سيف الصقيع', runed_bow: 'القوس الروني', ash_musket: 'بندقية الرماد', grove_staff: 'عصا البستان', warden_helm: 'خوذة الحارس', frost_plate: 'درع الصقيع',
            runic_robe: 'الرداء الروني', wyrm_boots: 'حذاء التنين', dawnbreaker: 'كاسر الفجر', sylvan_warbow: 'قوس الغابة', thunderforge: 'مطرقة الرعد', veilstaff: 'عصا الحجاب'
        } }
    };
    for (const l in M) { Object.assign(window.HM_TEXT[l].ui, M[l].ui); Object.assign(window.HM_TEXT[l].items, M[l].items); }
})();
