/* Hollowmere: the "press the button to assign" modal in Settings (4 languages). */
(function () {
    const M = {
        en: { assignTitle: 'Assign a button', assignHow: 'Press the button you want for: {fn}', assignNow: 'Now', assignHelp: 'OK (once, twice or held), Run or Cancel · Up: menu only · Down: keep it as it is', assignNo: 'That one must stay on OK.' },
        fr: { assignTitle: 'Assigner un bouton', assignHow: 'Appuyez sur le bouton voulu pour : {fn}', assignNow: 'Actuellement', assignHelp: 'OK (une fois, deux fois ou maintenu), Course ou Annuler · Haut : menu seulement · Bas : ne rien changer', assignNo: 'Celui-ci doit rester sur OK.' },
        es: { assignTitle: 'Asignar un botón', assignHow: 'Pulsa el botón que quieras para: {fn}', assignNow: 'Ahora', assignHelp: 'OK (una vez, dos veces o mantenido), Correr o Cancelar · Arriba: solo en el menú · Abajo: dejarlo como está', assignNo: 'Ese debe quedarse en OK.' },
        ar: { assignTitle: 'تعيين زر', assignHow: 'اضغط الزر الذي تريده لـ: {fn}', assignNow: 'الآن', assignHelp: 'OK (مرة أو مرتين أو ضغطة طويلة) أو زر الركض أو الإلغاء · للأعلى: من القائمة فقط · للأسفل: بدون تغيير', assignNo: 'هذا يجب أن يبقى على OK.' }
    };
    for (const l in M) Object.assign(window.HM_TEXT[l].ui, M[l]);
})();
