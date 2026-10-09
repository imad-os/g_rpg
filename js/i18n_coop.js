/* Hollowmere: the co-op screen texts (4 languages). */
(function () {
    const M = {
        en: { mCoop: 'Co-op: invite a phone', coopHow: 'On the other phone open {url} and type this code. Both on the same Wi-Fi.', coopMake: 'Making a code...', coopOn: 'Phone connected! Player 2: press A on the phone to join.',
              coopNew: 'New code', coopDrop: 'Disconnect the phone', coopExpired: 'The code expired.', coopNet: 'Could not reach the internet to make a code.',
              coopRules: 'The room service is not set up yet (see docs/FIRESTORE_ROOMS.md).', coopConfig: 'Firebase settings are missing (js/firebase-config.js).', coopNone: 'This browser cannot do local co-op.' },
        fr: { mCoop: 'Coop : inviter un téléphone', coopHow: 'Sur l\'autre téléphone, ouvrez {url} et tapez ce code. Les deux sur le même Wi-Fi.', coopMake: 'Création du code...', coopOn: 'Téléphone connecté ! Joueur 2 : appuyez sur A sur le téléphone pour rejoindre.',
              coopNew: 'Nouveau code', coopDrop: 'Déconnecter le téléphone', coopExpired: 'Le code a expiré.', coopNet: 'Impossible de joindre internet pour créer un code.',
              coopRules: 'Le service de salles n\'est pas encore configuré (voir docs/FIRESTORE_ROOMS.md).', coopConfig: 'Les réglages Firebase manquent (js/firebase-config.js).', coopNone: 'Ce navigateur ne gère pas la coop locale.' },
        es: { mCoop: 'Coop: invitar un móvil', coopHow: 'En el otro móvil abre {url} y escribe este código. Los dos en la misma Wi-Fi.', coopMake: 'Creando el código...', coopOn: '¡Móvil conectado! Jugador 2: pulsa A en el móvil para unirte.',
              coopNew: 'Código nuevo', coopDrop: 'Desconectar el móvil', coopExpired: 'El código caducó.', coopNet: 'No se pudo llegar a internet para crear un código.',
              coopRules: 'El servicio de salas aún no está configurado (mira docs/FIRESTORE_ROOMS.md).', coopConfig: 'Faltan los ajustes de Firebase (js/firebase-config.js).', coopNone: 'Este navegador no admite el coop local.' },
        ar: { mCoop: 'تعاون: ادعُ هاتفًا', coopHow: 'على الهاتف الآخر افتح {url} واكتب هذا الرمز. الاثنان على نفس شبكة Wi-Fi.', coopMake: 'جارٍ إنشاء الرمز...', coopOn: 'تم توصيل الهاتف! اللاعب 2: اضغط A على الهاتف للانضمام.',
              coopNew: 'رمز جديد', coopDrop: 'افصل الهاتف', coopExpired: 'انتهت صلاحية الرمز.', coopNet: 'تعذّر الوصول إلى الإنترنت لإنشاء رمز.',
              coopRules: 'خدمة الغرف غير مفعّلة بعد (انظر docs/FIRESTORE_ROOMS.md).', coopConfig: 'إعدادات Firebase مفقودة (js/firebase-config.js).', coopNone: 'هذا المتصفح لا يدعم اللعب التعاوني المحلي.' }
    };
    for (const l in M) Object.assign(window.HM_TEXT[l].ui, M[l]);
})();
