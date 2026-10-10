/* Hollowmere: the "press the button to assign" modal in Settings (4 languages). */
(function () {
    const M = {
        en: { assignPadHelp: 'Press a button on the controller · D-pad up: none · D-pad down: keep it as it is', padKind: 'Controller: {kind}', padGeneric: 'game controller', assignTitle: 'Assign a button', assignHow: 'Press the button you want for: {fn}', assignNow: 'Now', assignHelp: 'OK (once, twice or held), Run or Cancel · Up: menu only · Down: keep it as it is', assignNo: 'That one must stay on OK.' },
        fr: { assignPadHelp: 'Appuyez sur un bouton de la manette · Croix haut : aucun · Croix bas : ne rien changer', padKind: 'Manette : {kind}', padGeneric: 'manette', assignTitle: 'Assigner un bouton', assignHow: 'Appuyez sur le bouton voulu pour : {fn}', assignNow: 'Actuellement', assignHelp: 'OK (une fois, deux fois ou maintenu), Course ou Annuler · Haut : menu seulement · Bas : ne rien changer', assignNo: 'Celui-ci doit rester sur OK.' },
        es: { assignPadHelp: 'Pulsa un botón del mando · Cruceta arriba: ninguno · Cruceta abajo: dejarlo como está', padKind: 'Mando: {kind}', padGeneric: 'mando', assignTitle: 'Asignar un botón', assignHow: 'Pulsa el botón que quieras para: {fn}', assignNow: 'Ahora', assignHelp: 'OK (una vez, dos veces o mantenido), Correr o Cancelar · Arriba: solo en el menú · Abajo: dejarlo como está', assignNo: 'Ese debe quedarse en OK.' },
        ar: { assignPadHelp: 'اضغط زرًا في يد اللعب · الاتجاه للأعلى: بدون · الاتجاه للأسفل: بدون تغيير', padKind: 'يد اللعب: {kind}', padGeneric: 'يد لعب', assignTitle: 'تعيين زر', assignHow: 'اضغط الزر الذي تريده لـ: {fn}', assignNow: 'الآن', assignHelp: 'OK (مرة أو مرتين أو ضغطة طويلة) أو زر الركض أو الإلغاء · للأعلى: من القائمة فقط · للأسفل: بدون تغيير', assignNo: 'هذا يجب أن يبقى على OK.' }
    };
    for (const l in M) Object.assign(window.HM_TEXT[l].ui, M[l]);
})();
