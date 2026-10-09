/* Hollowmere: local co-op, host side (standalone only: a phone or computer running the game in its browser).
 * A "Co-op" button opens a small panel: Invite -> send the link to the other phone -> paste the reply
 * code it shows -> Connect. The other phone then plays hero 2 with its own joystick (controller.html).
 * Needs js/netpad.js; the game side is window.HM_REMOTE (game.js). Does nothing inside My PC on the TV. */
(function () {
    'use strict';
    var TXT = {
        en: { btn: 'Co-op', title: 'Local co-op', how: 'Both phones on the same Wi-Fi. 1. Press Invite and send the link to the other phone. 2. It shows a reply code: paste it below.', invite: 'Invite', copy: 'Copy', share: 'Share', copied: 'Copied', reply: 'Paste the reply code here', connect: 'Connect', ok: 'Connected! Player 2: press A on your phone to join.', bad: 'That code does not work. Press Invite for a new link.', wait: 'Preparing the invite...', close: 'Close', drop: 'Disconnect', nonet: 'This browser cannot do local co-op.', lost: 'Player 2 disconnected.' },
        fr: { btn: 'Coop', title: 'Coop locale', how: 'Les deux téléphones sur le même Wi-Fi. 1. Appuyez sur Inviter et envoyez le lien à l\'autre téléphone. 2. Il affiche un code de réponse : collez-le ci-dessous.', invite: 'Inviter', copy: 'Copier', share: 'Partager', copied: 'Copié', reply: 'Collez le code de réponse ici', connect: 'Connecter', ok: 'Connecté ! Joueur 2 : appuyez sur A sur votre téléphone pour rejoindre.', bad: 'Ce code ne marche pas. Appuyez sur Inviter pour un nouveau lien.', wait: 'Préparation de l\'invitation...', close: 'Fermer', drop: 'Déconnecter', nonet: 'Ce navigateur ne gère pas la coop locale.', lost: 'Le joueur 2 s\'est déconnecté.' },
        es: { btn: 'Coop', title: 'Coop local', how: 'Los dos móviles en la misma Wi-Fi. 1. Pulsa Invitar y envía el enlace al otro móvil. 2. Muestra un código de respuesta: pégalo abajo.', invite: 'Invitar', copy: 'Copiar', share: 'Compartir', copied: 'Copiado', reply: 'Pega aquí el código de respuesta', connect: 'Conectar', ok: '¡Conectado! Jugador 2: pulsa A en tu móvil para unirte.', bad: 'Ese código no funciona. Pulsa Invitar para un enlace nuevo.', wait: 'Preparando la invitación...', close: 'Cerrar', drop: 'Desconectar', nonet: 'Este navegador no admite el coop local.', lost: 'El jugador 2 se desconectó.' },
        ar: { btn: 'تعاون', title: 'لعب تعاوني محلي', how: 'الهاتفان على نفس شبكة Wi-Fi. ١. اضغط دعوة وأرسل الرابط إلى الهاتف الآخر. ٢. سيعرض رمز رد: الصقه في الأسفل.', invite: 'دعوة', copy: 'نسخ', share: 'مشاركة', copied: 'تم النسخ', reply: 'الصق رمز الرد هنا', connect: 'اتصال', ok: 'تم الاتصال! اللاعب ٢: اضغط A على هاتفك للانضمام.', bad: 'هذا الرمز لا يعمل. اضغط دعوة لرابط جديد.', wait: 'جارٍ تجهيز الدعوة...', close: 'إغلاق', drop: 'قطع الاتصال', nonet: 'هذا المتصفح لا يدعم اللعب التعاوني المحلي.', lost: 'انقطع اتصال اللاعب ٢.' }
    };
    // the keys the controller sends -> the game's actions (hero 2 never sends OK/menu: it only plays)
    var ACTION = { 37: 'left', 38: 'up', 39: 'right', 40: 'down', 90: 'jump', 88: 'run', 8: 'cancel' };
    var T = TXT.en, h = null, cur = null, joined = '', btn = null, panel = null, els = {}, weBusy = false;

    function el(tag, css, parent, text) { var e = document.createElement(tag); e.style.cssText = css || ''; if (text) e.textContent = text; if (parent) parent.appendChild(e); return e; }
    function key(code, type) {                                  // press a key for the SDK (used to resume after the panel)
        var e = new KeyboardEvent(type, { bubbles: true, cancelable: true });
        Object.defineProperty(e, 'keyCode', { get: function () { return code; } });
        document.dispatchEvent(e);
    }
    function status(msg, bad) { els.msg.textContent = msg || ''; els.msg.style.color = bad ? '#ff9a9a' : '#9af0b0'; }

    function build() {
        var BTN = 'font:700 max(16px,2.8vmin) sans-serif;padding:1.4vmin 2.6vmin;border-radius:1.2vmin;border:2px solid rgba(255,255,255,0.5);background:rgba(255,255,255,0.14);color:#fff;touch-action:manipulation;cursor:pointer';
        btn = el('div', 'position:fixed;top:2vmin;left:50%;margin-left:8vmin;z-index:99998;font:700 max(14px,3vmin) sans-serif;padding:1.2vmin 2.2vmin;border-radius:3vmin;background:rgba(255,255,255,0.14);border:2px solid rgba(255,255,255,0.35);color:#fff;touch-action:manipulation;cursor:pointer;user-select:none;-webkit-user-select:none', document.body, T.btn);
        btn.addEventListener('click', open);
        panel = el('div', 'position:fixed;inset:0;z-index:100000;background:rgba(5,6,12,0.92);display:none;overflow:auto;-webkit-overflow-scrolling:touch;color:#fff;font:max(16px,2.8vmin) sans-serif', document.body);
        panel.dir = T === TXT.ar ? 'rtl' : 'ltr';
        ['keydown', 'keyup', 'touchmove', 'touchend', 'gesturestart', 'contextmenu'].forEach(function (t) { panel.addEventListener(t, function (e) { e.stopPropagation(); }); });
        var box = el('div', 'max-width:min(92vw,720px);margin:0 auto;padding:4vmin 0', panel);
        el('div', 'font-size:max(22px,4.4vmin);font-weight:800;color:#ffd76a;margin-bottom:2vmin', box, T.title);
        el('div', 'line-height:1.45;margin-bottom:3vmin;color:#dfe3ee', box, T.how);
        var row = el('div', 'display:flex;gap:1.5vmin;flex-wrap:wrap;margin-bottom:2vmin', box);
        els.invite = el('div', BTN, row, T.invite); els.invite.addEventListener('click', invite);
        els.link = el('input', 'width:100%;box-sizing:border-box;margin-bottom:1.5vmin;padding:1.4vmin;border-radius:1vmin;border:2px solid rgba(255,255,255,0.3);background:#10131c;color:#cfd6ea;font:max(14px,2.4vmin) monospace;display:none', box);
        els.link.readOnly = true; els.link.addEventListener('focus', function () { els.link.select(); });
        els.linkRow = el('div', 'display:none;gap:1.5vmin;margin-bottom:3vmin', box);
        els.copy = el('div', BTN, els.linkRow, T.copy); els.copy.addEventListener('click', function () { copy(els.link.value, els.copy); });
        if (navigator.share) { els.share = el('div', BTN, els.linkRow, T.share); els.share.addEventListener('click', function () { navigator.share({ title: 'Hollowmere', url: els.link.value }).catch(function () {}); }); }
        els.reply = el('textarea', 'width:100%;box-sizing:border-box;height:18vmin;padding:1.4vmin;border-radius:1vmin;border:2px solid rgba(255,255,255,0.3);background:#10131c;color:#fff;font:max(14px,2.4vmin) monospace;display:none;margin-bottom:1.5vmin', box);
        els.reply.placeholder = T.reply; els.reply.setAttribute('autocomplete', 'off'); els.reply.setAttribute('autocapitalize', 'off'); els.reply.spellcheck = false;
        els.connect = el('div', BTN + ';display:none;width:max-content;margin-bottom:2vmin', box, T.connect); els.connect.addEventListener('click', connect);
        els.msg = el('div', 'min-height:3em;line-height:1.4;margin-bottom:2vmin', box);
        var foot = el('div', 'display:flex;gap:1.5vmin;flex-wrap:wrap', box);
        els.drop = el('div', BTN + ';display:none', foot, T.drop); els.drop.addEventListener('click', function () { if (joined) h.close(joined); });
        els.close = el('div', BTN, foot, T.close); els.close.addEventListener('click', close);
    }
    function copy(text, who) {
        var done = function () { var t = who.textContent; who.textContent = T.copied; setTimeout(function () { who.textContent = t; }, 1200); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { els.link.select(); });
        else { els.link.select(); try { document.execCommand('copy'); done(); } catch (e) {} }
    }
    function refresh() {
        btn.textContent = joined ? '● 2P' : T.btn; btn.style.color = joined ? '#7ef0a0' : '#fff';
        els.drop.style.display = joined ? '' : 'none';
        els.invite.style.display = joined ? 'none' : '';
    }
    function open() {
        if (!window.NetPad || !NetPad.supported) { status(T.nonet, true); }
        panel.style.display = 'block';
        if (!weBusy) { weBusy = true; MyPC.pause(); }               // the game waits while you pair
    }
    function close() {
        panel.style.display = 'none';
        if (weBusy) { weBusy = false; key(80, 'keydown'); key(80, 'keyup'); }   // 'P' resumes the standalone pause
    }
    function invite() {
        if (!window.NetPad || !NetPad.supported) return status(T.nonet, true);
        if (cur) h.close(cur.id);
        cur = null; els.link.style.display = els.linkRow.style.display = els.reply.style.display = els.connect.style.display = 'none';
        status(T.wait);
        h.invite().then(function (inv) {
            cur = inv;
            els.link.value = location.origin + location.pathname.replace(/[^/]*$/, '') + 'controller.html#' + inv.code;
            els.link.style.display = ''; els.linkRow.style.display = 'flex'; els.reply.style.display = ''; els.connect.style.display = '';
            els.reply.value = ''; status('');
        }, function () { status(T.nonet, true); });
    }
    function connect() {
        if (!cur) return;
        h.accept(cur.id, els.reply.value).then(function () { status('...'); }, function () { status(T.bad, true); });
    }

    var tries = 0;
    function start() {
        var info = window.MyPC && MyPC.info && MyPC.info();
        if (!info) return tries++ < 100 ? setTimeout(start, 300) : 0;                   // wait until the SDK has told us how we run
        if (!info.standalone || !window.HM_REMOTE || !window.NetPad) return;
        T = TXT[info.lang] || TXT.en;
        h = NetPad.host({
            onJoin: function (id) { joined = id; refresh(); status(T.ok); setTimeout(close, 2500); },
            onLeave: function (id) {
                if (id === joined) { joined = ''; cur = null; els.link.style.display = els.linkRow.style.display = els.reply.style.display = els.connect.style.display = 'none'; refresh(); status(T.lost, true); }
                HM_REMOTE.leave(id);
            },
            onMessage: function (id, m) { var a = ACTION[m && m[0]]; if (a && id === joined) HM_REMOTE.input(a, !!m[1], id); }
        });
        build(); refresh();
    }
    start();
})();
