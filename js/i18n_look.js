/* Hollowmere: gender / look options, and the tailor (Ilsa) and the barber (Joss) of the village (4 languages). */
(function () {
    const M = {
        en: { ui: { male: 'Male', female: 'Female', lookOf: 'Look of {name}', lookTo: '{name}: change look to {to}', lookDone: '{name}: new look ({to}).' },
              lines: { ilsa: ['Welcome! I sew for the whole village. Every hero deserves the look that feels right. Tell me, and I will change yours in a moment.'],
                       joss: ['A trim, a curl, a whole new style: Joss the barber makes anybody feel like a new person. Just say the word and I will change your look.'] } },
        fr: { ui: { male: 'Homme', female: 'Femme', lookOf: 'Apparence de {name}', lookTo: '{name} : changer d\'apparence ({to})', lookDone: '{name} : nouvelle apparence ({to}).' },
              lines: { ilsa: ['Bienvenue ! Je couds pour tout le village. Chaque héros mérite l\'apparence qui lui va. Dites-le-moi et je change la vôtre en un instant.'],
                       joss: ['Une coupe, une boucle, un tout nouveau style : Joss le barbier donne à chacun l\'impression d\'être quelqu\'un d\'autre. Un mot et je change votre apparence.'] } },
        es: { ui: { male: 'Hombre', female: 'Mujer', lookOf: 'Aspecto de {name}', lookTo: '{name}: cambiar de aspecto ({to})', lookDone: '{name}: nuevo aspecto ({to}).' },
              lines: { ilsa: ['¡Bienvenido! Coso para todo el pueblo. Cada héroe merece el aspecto que le va. Dímelo y cambio el tuyo en un momento.'],
                       joss: ['Un corte, un rizo, un estilo nuevo: Joss el barbero hace que cualquiera se sienta otra persona. Una palabra y cambio tu aspecto.'] } },
        ar: { ui: { male: 'ذكر', female: 'أنثى', lookOf: 'مظهر {name}', lookTo: '{name}: غيّر المظهر ({to})', lookDone: '{name}: مظهر جديد ({to}).' },
              lines: { ilsa: ['أهلًا بك! أنا أخيط لكل أهل القرية. كل بطل يستحق المظهر الذي يناسبه. قل لي وسأغيّر مظهرك في لحظة.'],
                       joss: ['قصّة، تجعيدة، أسلوب جديد كليًا: جوس الحلاق يجعل أي شخص يشعر أنه شخص آخر. كلمة واحدة وأغيّر مظهرك.'] } }
    };
    for (const l in M) { Object.assign(window.HM_TEXT[l].ui, M[l].ui); Object.assign(window.HM_TEXT[l].lines, M[l].lines); }
})();
