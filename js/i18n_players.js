/* Hollowmere: texts for up to four heroes (4 languages). */
(function () {
    const M = {
        en: { hero3: 'Sage', hero4: 'Rook', coopOnN: '{n} friend(s) connected. On each phone press A to join the adventure.', coopDropN: 'Disconnect {name}' },
        fr: { hero3: 'Sage', hero4: 'Rook', coopOnN: '{n} ami(s) connecté(s). Sur chaque téléphone, appuyez sur A pour rejoindre l\'aventure.', coopDropN: 'Déconnecter {name}' },
        es: { hero3: 'Sage', hero4: 'Rook', coopOnN: '{n} amigo(s) conectado(s). En cada móvil pulsa A para unirte a la aventura.', coopDropN: 'Desconectar a {name}' },
        ar: { hero3: 'سيج', hero4: 'روك', coopOnN: '{n} من الأصدقاء متصلون. على كل هاتف اضغط A للانضمام إلى المغامرة.', coopDropN: 'افصل {name}' }
    };
    for (const l in M) Object.assign(window.HM_TEXT[l].ui, M[l]);
})();
(function () {
    const M = {
        en: { zoomRow: 'Zoom: {n}%', zoomSub: 'How much of the world you see. Lower sees more, higher is closer.', buttonsSub: 'Choose which button does what' },
        fr: { zoomRow: 'Zoom : {n} %', zoomSub: 'La part du monde que vous voyez. Moins : plus large, plus : plus près.', buttonsSub: 'Choisir quel bouton fait quoi' },
        es: { zoomRow: 'Zoom: {n}%', zoomSub: 'Cuánto del mundo ves. Menos ve más, más se acerca.', buttonsSub: 'Elige qué botón hace qué' },
        ar: { zoomRow: 'التقريب: {n}٪', zoomSub: 'مقدار ما تراه من العالم. أقل يعني رؤية أوسع، وأكثر يعني أقرب.', buttonsSub: 'اختر أي زر يفعل ماذا' }
    };
    for (const l in M) Object.assign(window.HM_TEXT[l].ui, M[l]);
})();
