/* Hollowmere: the co-op texts (4 languages). The rooms list, "Open a room" and the accept dialog are My PC's own screens. */
(function () {
    const M = {
        en: { mCoop: 'Co-op: play with a friend', coopTitle: 'Co-op', coopIdle: 'No room is open.', coopWaiting: 'Room open. A friend picks it with "Join a friend" on the title screen of their phone.', coopShut: 'Close the room', coopBack: 'Back',
              coopOn: 'A friend is connected! Player 2: press A on the phone to join.', coopDrop: 'Disconnect the friend', coopOpened: 'Room open. A friend can join from the title screen: Join a friend.',
              coopJoin: 'Join a friend', coopNone: 'Local co-op is not available here.',
              coopCtrl: 'Controller for {name}', coopCtrlHelp: 'A: OK / attack · B: run, ability · C: cancel, ability', coopLeave: 'Leave', coopLeft: 'Disconnected from the game.' },
        fr: { mCoop: 'Coop : jouer avec un ami', coopTitle: 'Coop', coopIdle: 'Aucune salle ouverte.', coopWaiting: 'Salle ouverte. Un ami la choisit avec « Rejoindre un ami » sur l\'écran titre de son téléphone.', coopShut: 'Fermer la salle', coopBack: 'Retour',
              coopOn: 'Un ami est connecté ! Joueur 2 : appuyez sur A sur le téléphone pour rejoindre.', coopDrop: 'Déconnecter l\'ami', coopOpened: 'Salle ouverte. Un ami peut rejoindre depuis l\'écran titre : Rejoindre un ami.',
              coopJoin: 'Rejoindre un ami', coopNone: 'La coop locale n\'est pas disponible ici.',
              coopCtrl: 'Manette pour {name}', coopCtrlHelp: 'A : OK / attaque · B : courir, capacité · C : annuler, capacité', coopLeave: 'Quitter', coopLeft: 'Déconnecté du jeu.' },
        es: { mCoop: 'Coop: jugar con un amigo', coopTitle: 'Coop', coopIdle: 'No hay ninguna sala abierta.', coopWaiting: 'Sala abierta. Un amigo la elige con «Unirse a un amigo» en la pantalla de título de su móvil.', coopShut: 'Cerrar la sala', coopBack: 'Volver',
              coopOn: '¡Un amigo está conectado! Jugador 2: pulsa A en el móvil para unirte.', coopDrop: 'Desconectar al amigo', coopOpened: 'Sala abierta. Un amigo puede unirse desde la pantalla de título: Unirse a un amigo.',
              coopJoin: 'Unirse a un amigo', coopNone: 'El coop local no está disponible aquí.',
              coopCtrl: 'Mando para {name}', coopCtrlHelp: 'A: OK / ataque · B: correr, habilidad · C: cancelar, habilidad', coopLeave: 'Salir', coopLeft: 'Desconectado del juego.' },
        ar: { mCoop: 'تعاون: العب مع صديق', coopTitle: 'تعاون', coopIdle: 'لا توجد غرفة مفتوحة.', coopWaiting: 'الغرفة مفتوحة. يختارها صديق بزر «انضم إلى صديق» في شاشة البداية على هاتفه.', coopShut: 'أغلق الغرفة', coopBack: 'رجوع',
              coopOn: 'تم اتصال صديق! اللاعب 2: اضغط A على الهاتف للانضمام.', coopDrop: 'افصل الصديق', coopOpened: 'الغرفة مفتوحة. يمكن لصديق الانضمام من شاشة البداية: انضم إلى صديق.',
              coopJoin: 'انضم إلى صديق', coopNone: 'اللعب التعاوني المحلي غير متاح هنا.',
              coopCtrl: 'يد تحكم لـ {name}', coopCtrlHelp: 'A: موافق / هجوم · B: ركض، قدرة · C: إلغاء، قدرة', coopLeave: 'خروج', coopLeft: 'تم قطع الاتصال باللعبة.' }
    };
    for (const l in M) Object.assign(window.HM_TEXT[l].ui, M[l]);
})();
