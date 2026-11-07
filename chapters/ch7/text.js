/* Hollowmere, Chapter 7: The Legend of Zelda — Ocarina of Time ("The Symphony of Hyrule").
 * Localization and narrative texts in English, French, Spanish, and Arabic.
 * Merged into HM_TEXT when loaded. */
window.HM_C7_TEXT = (function () {
    const ZONES = {
        en: {
            c7_kokiri: 'Kokiri Forest — Sacred Glade',
            c7_field: 'Hyrule Field — Central Plains',
            c7_ranch: 'Lon Lon Ranch — Epona\'s Paddock',
            c7_castle: 'Hyrule Castle Town & Temple of Time',
            c7_kakariko: 'Kakariko Village & Royal Graveyard',
            c7_trail: 'Death Mountain Trail',
            c7_goron: 'Goron City & Volcanic Crater',
            c7_river: 'Zora\'s River — Cascading Falls',
            c7_zora: 'Zora\'s Domain & Sacred Fountain',
            c7_lake: 'Lake Hylia — Water Shrine',
            c7_gerudo: 'Gerudo Valley & Canyon Fortress',
            c7_desert: 'Haunted Wasteland & Desert Colossus',
            c7_d1_deku: 'Inside the Great Deku Tree',
            c7_d2_dodongo: 'Dodongo\'s Cavern',
            c7_d3_jabu: 'Inside Jabu-Jabu\'s Belly',
            c7_t1_forest: 'Forest Temple — Sacred Meadow',
            c7_t2_fire: 'Fire Temple — Death Mountain Core',
            c7_t3_water: 'Water Temple — Abyssal Cistern',
            c7_t4_shadow: 'Shadow Temple — House of the Dead',
            c7_t5_spirit: 'Spirit Temple — Goddess Colossus',
            c7_t6_castle: 'Ganon\'s Castle — Six Barrier Trials',
            c7_t7_tower: 'Ganon\'s Tower — Triforce Sanctum'
        },
        fr: {
            c7_kokiri: 'Forêt Kokiri — Clairière Sacrée',
            c7_field: 'Plaine d\'Hyrule — Terres Centrales',
            c7_ranch: 'Ranch Lon Lon — Enclos d\'Épona',
            c7_castle: 'Bourg d\'Hyrule & Temple du Temps',
            c7_kakariko: 'Village Cocorico & Cimetière Royal',
            c7_trail: 'Chemin du Péril',
            c7_goron: 'Village Goron & Cratère Volcanique',
            c7_river: 'Rivière Zora — Cascades',
            c7_zora: 'Domaine Zora & Fontaine Sacrée',
            c7_lake: 'Lac Hylia — Sanctuaire des Eaux',
            c7_gerudo: 'Vallée Gerudo & Forteresse du Canyon',
            c7_desert: 'Désert Hanté & Colosse du Désert',
            c7_d1_deku: 'Dans l\'Arbre Mojo',
            c7_d2_dodongo: 'Caverne Dodongo',
            c7_d3_jabu: 'Dans le Ventre de Jabu-Jabu',
            c7_t1_forest: 'Temple de la Forêt — Bosquet Sacré',
            c7_t2_fire: 'Temple du Feu — Cœur du Cratère',
            c7_t3_water: 'Temple de l\'Eau — Citerne Abyssale',
            c7_t4_shadow: 'Temple de l\'Ombre — Demeure des Morts',
            c7_t5_spirit: 'Temple de l\'Esprit — Colosse de la Déesse',
            c7_t6_castle: 'Château de Ganon — Six Barrières',
            c7_t7_tower: 'Tour de Ganon — Sanctuaire de la Triforce'
        },
        es: {
            c7_kokiri: 'Bosque Kokiri — Claro Sagrado',
            c7_field: 'Llanura de Hyrule — Tierras Centrales',
            c7_ranch: 'Rancho Lon Lon — Prado de Epona',
            c7_castle: 'Ciudadela de Hyrule y Templo del Tiempo',
            c7_kakariko: 'Kakariko y Cementerio Real',
            c7_trail: 'Sendero de la Montaña de la Muerte',
            c7_goron: 'Ciudad Goron y Cráter Volcánico',
            c7_river: 'Río Zora — Cascadas',
            c7_zora: 'Dominio Zora y Fuente Sagrada',
            c7_lake: 'Lago Hylia — Santuario del Agua',
            c7_gerudo: 'Valle Gerudo y Fortaleza del Cañón',
            c7_desert: 'Desierto Encantado y Coloso del Desierto',
            c7_d1_deku: 'Interior del Gran Árbol Deku',
            c7_d2_dodongo: 'Cueva de los Dodongos',
            c7_d3_jabu: 'Interior de la Tripa de Jabu-Jabu',
            c7_t1_forest: 'Templo del Bosque — Prado Sagrado',
            c7_t2_fire: 'Templo del Fuego — Núcleo del Cráter',
            c7_t3_water: 'Templo del Agua — Cisterna Abisal',
            c7_t4_shadow: 'Templo de las Sombras — Casa de los Muertos',
            c7_t5_spirit: 'Templo del Espíritu — Coloso de la Diosa',
            c7_t6_castle: 'Castillo de Ganon — Seis Barreras',
            c7_t7_tower: 'Torre de Ganon — Santuario de la Trifuerza'
        },
        ar: {
            c7_kokiri: 'غابة كوكيري — المرج المقدس',
            c7_field: 'حقل هيرول — السهول الوسطى',
            c7_ranch: 'مزرعة لون لون — مرعى إبونا',
            c7_castle: 'مدينة قلعة هيرول ومعبد الزمن',
            c7_kakariko: 'قرية كاكاريكو والمقبرة الملكية',
            c7_trail: 'ممر جبل الموت',
            c7_goron: 'مدينة غورون والفوهة البركانية',
            c7_river: 'نهر زورا — الشلالات المتدفقة',
            c7_zora: 'مملكة زورا والنافورة المقدسة',
            c7_lake: 'بحيرة هيليا — ضريح المياه',
            c7_gerudo: 'وادي غيرودو وقلعة الوادي',
            c7_desert: 'الصحراء المسكونة وتمثال الصحراء',
            c7_d1_deku: 'داخل شجرة ديكو العظيمة',
            c7_d2_dodongo: 'كهف دودونغو',
            c7_d3_jabu: 'داخل بطن جابو-جابو',
            c7_t1_forest: 'معبد الغابة — المرج المقدس',
            c7_t2_fire: 'معبد النار — قلب البركان',
            c7_t3_water: 'معبد الماء — الخزان السحيق',
            c7_t4_shadow: 'معبد الظل — بيت الموتى',
            c7_t5_spirit: 'معبد الروح — تمثال الإلهة',
            c7_t6_castle: 'قلعة غانون — حواجز الحكماء الستة',
            c7_t7_tower: 'برج غانون — قدس الترايفورس'
        }
    };

    const NAMES = {
        saria: 'Saria',
        mido: 'Mido',
        deku_sprout: 'Great Deku Tree Spirit',
        kokiri_smith: 'Master Goron-Kokiri Smith',
        kokiri_tailor: 'Sheikah Weaver',
        kokiri_witch: 'Great Fairy Apothecary',
        kokiri_groom: 'Lon Lon Stable Master',
        kaepora: 'Kaepora Gaebora',
        malon: 'Malon',
        talon: 'Talon',
        ingo: 'Ingo',
        zelda: 'Princess Zelda',
        impa: 'Impa',
        rauru: 'Rauru, Sage of Light',
        sheik: 'Sheik',
        dampe: 'Dampé the Gravekeeper',
        guru_guru: 'Guru-Guru',
        darunia: 'Chief Darunia',
        biggoron: 'Biggoron',
        king_zora: 'King Zora XVI',
        ruto: 'Princess Ruto',
        lake_scientist: 'Lakeside Professor',
        nabooru: 'Nabooru',
        gerudo_capt: 'Captain Aveil',
        great_fairy: 'Great Fairy of Courage',
        hylian_envoy: 'Captain Linebeck',
        gohma: 'Queen Gohma',
        king_dodongo: 'King Dodongo',
        barinade: 'Barinade',
        phantom_ganon: 'Phantom Ganon',
        volvagia: 'Volvagia',
        morpha: 'Morpha',
        bongo_bongo: 'Bongo Bongo',
        twinrova: 'Twinrova',
        dark_link: 'Dark Link',
        ganondorf: 'Ganondorf & Beast Ganon'
    };

    const BOSSES = {
        gohma: 'Parasitic Armored Arachnid: Queen Gohma',
        king_dodongo: 'Infernal Dinosaur: King Dodongo',
        barinade: 'Bio-Electric Anemone: Barinade',
        phantom_ganon: 'Evil Spirit from Beyond: Phantom Ganon',
        volvagia: 'Subterranean Lava Dragon: Volvagia',
        morpha: 'Giant Aquatic Amoeba: Morpha',
        bongo_bongo: 'Phantom Shadow Beast: Bongo Bongo',
        twinrova: 'Sorceress Sisters: Twinrova (Koume & Kotake)',
        dark_link: 'Shadow Reflection: Dark Link',
        ganondorf: 'Great King of Evil: Ganondorf & Ganon'
    };

    const FOES = {
        deku_baba: ['Deku Baba', 'A snapping carnivorous forest plant rooted in Kokiri glades.'],
        skullwalltula: ['Skulltula', 'An armored spider with a skull-patterned carapace.'],
        mad_scrub: ['Mad Scrub', 'A territorial Deku Scrub that fires Deku Nuts from flower burrows.'],
        gohma_larva: ['Gohma Larva', 'A hatchling of Queen Gohma dropped from the ceiling of the Deku Tree.'],
        peahat: ['Peahat', 'A helicopter-bladed plant monster patrolling Hyrule Field.'],
        stalchild: ['Stalchild', 'A restless skeletal soldier rising from the soil of Hyrule Field.'],
        poe: ['Poe Spirit', 'A lantern-carrying specter wandering graveyards and plains.'],
        lizalfos: ['Lizalfos', 'An agile dagger-wielding reptilian warrior of Dodongo\'s Cavern.'],
        dodongo: ['Dodongo', 'A fire-breathing armored reptile of Death Mountain.'],
        tektite: ['Tektite', 'A four-legged leaping crag spider of mountain trails and lakes.'],
        beamos: ['Beamos', 'An ancient stone turret whose rotating eye fires searing laser beams.'],
        fire_keese: ['Fire Keese', 'A cavern bat wreathed in living volcanic flame.'],
        octorok: ['Octorok', 'An aquatic cephalopod that spits river stones from the water.'],
        freezard: ['Freezard', 'An icy elemental sculpture that breathes freezing mist.'],
        biri: ['Biri', 'A bio-electric jellyfish floating inside Lord Jabu-Jabu.'],
        stinger: ['Stinger', 'A manta-ray predator that darts from temple waters.'],
        octo_big: ['Big Octo', 'A giant spiked cephalopod guarding Jabu-Jabu\'s inner sanctum.'],
        stalfos: ['Stalfos Knight', 'An elite undead swordsman armed with Hylian steel and shield.'],
        poe_sister: ['Poe Sister', 'One of the four phantom sisters haunting the Forest Temple torches.'],
        floormaster: ['Floormaster', 'A shadowy severed hand that stalks ancient temple halls.'],
        flare_dancer: ['Flare Dancer', 'A whirling pyromancer spirit of the Fire Temple.'],
        shell_blade: ['Shell Blade', 'A spiked bivalve predator snapping inside the Water Temple.'],
        dark_link: ['Dark Link', 'Your own shadowy reflection born from the Illusion Room of the Water Temple.'],
        redead: ['ReDead', 'Amoaning undead figure whose gaze freezes travellers in their tracks.'],
        gibdo: ['Gibdo', 'A bandage-wrapped mummy haunting the Royal Graveyard and Shadow Temple.'],
        dead_hand: ['Dead Hand', 'A pale multi-armed abomination lurking beneath Kakariko Well and the Shadow Temple.'],
        gerudo_thief: ['Gerudo Guard', 'An elite twin-scimitar sentinel of Gerudo Fortress.'],
        leever: ['Leever', 'A spinning cactus creature erupting from the shifting sands of the Haunted Wasteland.'],
        anubis: ['Anubis', 'A floating jackal sarcophagus that mirrors movements and breathes fire.'],
        iron_knuckle: ['Iron Knuckle', 'A colossal axe-wielding dreadnought clad in heavy Gerudo plate.'],
        dinolfos: ['Dinolfos', 'A veteran fire-breathing reptilian champion guarding Ganon\'s Castle.'],
        gohma: ['Queen Gohma', 'The Parasitic Armored Arachnid cursing the Great Deku Tree.'],
        king_dodongo: ['King Dodongo', 'The Infernal Dinosaur ruling Dodongo\'s Cavern.'],
        barinade: ['Barinade', 'The Bio-Electric Anemone draining Lord Jabu-Jabu.'],
        phantom_ganon: ['Phantom Ganon', 'The spectral rider of the Forest Temple paintings.'],
        volvagia: ['Volvagia', 'The ancient subterranean Lava Dragon of the Fire Temple.'],
        morpha: ['Morpha', 'The Giant Aquatic Amoeba commanding the Water Temple cistern.'],
        bongo_bongo: ['Bongo Bongo', 'The Phantom Shadow Beast beating the giant drum of the Shadow Temple.'],
        twinrova: ['Twinrova', 'The twin Gerudo sorceress sisters of Fire and Ice in the Spirit Temple.'],
        ganondorf: ['Ganondorf & Ganon', 'The Great King of Evil wielding the Triforce of Power across three epic phases!']
    };

    const LINES = {
        c7sariaIdle: [
            'Listen to the forest melody, Hero! Play the Ocarina of Time anytime to call upon the sacred songs of Hyrule.',
            'Even across time and temples, Kokiri Forest and the Sacred Meadow will always welcome you home.'
        ],
        c7zeldaIdle: [
            'The Triforce rests where the Three Spiritual Stones and the Six Sage Medallions converge.',
            'Wield the Master Sword and the Light Arrows to pierce Ganondorf\'s dark defenses!'
        ],
        c7rauruIdle: [
            'I am Rauru, ancient Sage of Light. As you awaken the Sages of Forest, Fire, Water, Shadow, and Spirit, our power will forge the Rainbow Bridge.',
            'Stand upon any Triforce Pedestal to play the Ocarina of Time!'
        ],
        c7sheikIdle: [
            'The flow of time is always cruel... yet a melody played on the Ocarina of Time can bridge any distance across Hyrule.',
            'Speak with me or step onto a Triforce Pedestal whenever you wish to play one of the twelve sacred songs.'
        ],
        c7malonIdle: [
            'Epona loves the melody my mother composed! Play Epona\'s Song (▲ ◄ ► ▲ ◄ ►) and she will gallop to your side anywhere.',
            'Visit Ingo or the Stable Master if you want to switch between Epona and your Crimson Loftwing!'
        ],
        c7daruniaIdle: [
            'Har-har-har! Nothing beats the rhythm of Saria\'s Song, Sworn Brother!',
            'With the Goron Tunic and the Megaton Hammer, no volcanic flame in Death Mountain can stop you!'
        ],
        c7rutoIdle: [
            'You saved me inside Lord Jabu-Jabu and awakened the Water Temple! Wear the Zora Tunic and Iron Boots with pride.',
            'Remember: playing Zelda\'s Lullaby at the Water Temple Triforce Crest shifts the cistern water level!'
        ],
        c7impaIdle: [
            'As guardian of Kakariko Village and Sage of Shadow, I watch over the Royal Family\'s secrets.',
            'Use the Lens of Truth and Hover Boots to cross unseen chasms in the Shadow Temple.'
        ],
        c7nabooruIdle: [
            'Ganondorf and Twinrova thought they could bend the Gerudo to evil, but the Spirit Medallion shines with true honor!',
            'With the Silver Gauntlets and Mirror Shield, the Desert Colossus stands with you.'
        ],
        c7biggoronIdle: [
            'BIIIIIGGORON! My summit anvil on Death Mountain Trail forges the unbreakable Biggoron\'s Sword for true heroes!'
        ],
        c7kaeporaIdle: [
            'Hoot-hoot! Hyrule Field connects all realms: Kokiri Forest to the east, Castle Town and Kakariko to the north, Zora\'s River to the northeast, Lake Hylia to the south, and Gerudo Valley to the west!',
            'Complete my Skyward trial at the Owl Stone to summon the Crimson Loftwing sky mount!'
        ],
        c7envoyIdle: [
            'Ahoy, Hero of Time! My realm-ship can sail between Kokiri Forest, the Mushroom Kingdom (Chapter 6), and the Blood Kingdoms (Chapter 5) whenever you wish!'
        ]
    };

    function makeLang(l) {
        return {
            ui: {
                ch7Name: l === 'fr' ? 'The Legend of Zelda : Ocarina of Time' : l === 'es' ? 'The Legend of Zelda: Ocarina of Time' : l === 'ar' ? 'أسطورة زيلدا: أوكارينا الزمن' : 'The Legend of Zelda: Ocarina of Time',
                c7stone: l === 'fr' ? '💎 Pierre Ancestrale obtenue ! ({n}/3)' : l === 'es' ? '💎 ¡Piedra Espiritual obtenida! ({n}/3)' : l === 'ar' ? '💎 تم الحصول على حجر روحي! ({n}/3)' : '💎 Spiritual Stone recovered! ({n}/3)',
                c7medallion: l === 'fr' ? '🏅 Médaillon des Sages éveillé ! ({n}/6)' : l === 'es' ? '🏅 ¡Medallón de los Sabios despertado! ({n}/6)' : l === 'ar' ? '🏅 تم إيقاظ ميدالية الحكماء! ({n}/6)' : '🏅 Sage Medallion awakened! ({n}/6)',
                c7songLearned: l === 'fr' ? '🎶 Nouveau chant d\'Ocarina appris : {song} !' : l === 'es' ? '🎶 ¡Nueva melodía de Ocarina aprendida: {song}!' : l === 'ar' ? '🎶 تم تعلم لحن أوكارينا جديد: {song}!' : '🎶 New Ocarina Melody learned: {song}!',
                c7ganonPhase2: '⚡ GANONDORF PHASE 2 — DARK TRIFORCE SURGE! Ganondorf unleashes Dead Man\'s Volley & Shadow Knights!',
                c7ganonPhase3: '🐗 GANON PHASE 3 — DEMON KING BEAST GANON! Ganondorf transforms into colossal twin-sword Beast Ganon!',
                c7theEnd: 'End of Chapter 7: The Legend of Zelda — Ocarina of Time! All 3 Spiritual Stones, 6 Medallions & the Triforce are restored!',
                c7free: 'Peace has returned to Hyrule! Play all 12 Ocarina melodies, ride Epona or the Crimson Loftwing, or explore all 22 regions & temples.',
                c7forge: 'Biggoron & Kokiri Master Forge',
                c7store: 'Great Fairy Potion & Elixir Sanctuary',
                c7ocarinaBtn: '🪈 Play the Ocarina of Time (12 Sacred Songs)',
                epona: 'Epona',
                eponaSub: 'Malon\'s legendary Hylian mare summoned by Epona\'s Song; tramples foes at a gallop',
                eponaHow: 'Unlocked in Chapter 7 at Lon Lon Ranch or Hylian Stables',
                loftwing: 'Crimson Loftwing',
                loftwingSub: 'A majestic sky-bird of Skyloft & Hyrule that soars effortlessly over cliffs and rivers',
                loftwingHow: 'Unlocked in Chapter 7 from Kaepora Gaebora or Hylian Stables'
            },
            zone: ZONES[l] || ZONES.en,
            boss: BOSSES,
            names: NAMES,
            foes: FOES,
            lines: LINES,
            intro: [
                'In the vast, mythical land of Hyrule, the golden power of the Goddesses—the Triforce—rests within the Sacred Realm.',
                'Ganondorf, King of the Gerudo Thieves, has cast curses upon the Great Deku Tree, Dodongo\'s Cavern, and Lord Jabu-Jabu to seize the Spiritual Stones!',
                'Guided by Navi the Fairy and armed with the Ocarina of Time, gather the Three Spiritual Stones, draw the Master Sword from the Pedestal of Time, awaken the Six Sages, and vanquish Ganondorf!'
            ],
            outro: [
                'With a final strike of the Master Sword and the Six Sages\' sacred seal, Beast Ganon is banished into the void of the Sacred Realm!',
                'The Triforce of Courage, Wisdom, and Power shines in harmony once more above Hyrule Field, Kokiri Forest, Death Mountain, and Lake Hylia.',
                'Your legend as the Hero of Time echoes forever across the Symphony of Hyrule!'
            ]
        };
    }

    const out = {
        en: makeLang('en'),
        fr: makeLang('fr'),
        es: makeLang('es'),
        ar: makeLang('ar')
    };
    // Keep window.C7_TEXT alias for any direct helper lookups
    window.C7_TEXT = window.C7_TEXT || out;
    return out;
})();
