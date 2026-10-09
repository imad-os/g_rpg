/* NetPad.room: pairing by a short room code, through Firestore (REST, no SDK, no sign-in).
 * Add after netpad.js. Standalone: copy both files into any My PC game.
 *
 * Why: swapping long codes by hand is impossible on a TV. Here the host (TV, phone or PC) gets a
 * 5-letter code, the guest types it, and the two devices swap their connection data through one small
 * Firestore document (rooms/<CODE>), which is deleted right after. The game itself is still direct
 * device-to-device on the local network; Firestore only introduces them. The Firestore rules must allow
 * the `rooms` collection: see docs/FIRESTORE_ROOMS.md.
 *
 *   host:  var h = NetPad.host({ onJoin, onLeave, onMessage });
 *          NetPad.room.open(h, { onExpire(), onError(e) }).then(function (r) { show(r.code); });   // r.cancel()
 *   guest: NetPad.room.join('K7M2Q', { onOpen(), onClose() }).then(function (g) { g.send(msg); });
 * Errors carry .status: 403 = the rules are not published, 404 = no such room, 0 = no internet,
 * -1 = no Firebase settings (js/firebase-config.js is empty). */
(function () {
    'use strict';
    // project and key come from your Firebase web config: set window.NETPAD_FIREBASE = { project, key } (js/firebase-config.js)
    var CFG = { project: '', key: '', collection: 'rooms', ttlMs: 10 * 60 * 1000, waitMs: 3 * 60 * 1000 };
    var FB = window.NETPAD_FIREBASE; if (FB) { CFG.project = FB.project || ''; CFG.key = FB.key || ''; }
    var ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';           // no I, O, 0, 1: easy to read from across the room

    function url(code, query) {
        return 'https://firestore.googleapis.com/v1/projects/' + CFG.project + '/databases/(default)/documents/' + CFG.collection +
            (code ? '/' + code : '') + '?' + (query ? query + '&' : '') + 'key=' + encodeURIComponent(CFG.key);
    }
    function call(method, u, body) {
        if (!CFG.project || !CFG.key) { var c = new Error('no firebase settings'); c.status = -1; return Promise.reject(c); }
        return fetch(u, { method: method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined }).then(function (r) {
            if (r.ok) return r.json();
            var e = new Error('room ' + r.status); e.status = r.status; throw e;
        }, function () { var e = new Error('no internet'); e.status = 0; throw e; });
    }
    function field(d, k) { return d && d.fields && d.fields[k] ? d.fields[k].stringValue || '' : ''; }
    function newCode() {
        var a = new Uint8Array(5), s = '';
        (window.crypto || window.msCrypto).getRandomValues(a);
        for (var i = 0; i < 5; i++) s += ALPHA.charAt(a[i] % ALPHA.length);
        return s;
    }
    function clean(code) { return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
    function create(offer, tries) {
        var code = newCode();
        return call('POST', url('', 'documentId=' + code), { fields: { offer: { stringValue: offer }, exp: { timestampValue: new Date(Date.now() + CFG.ttlMs).toISOString() } } })
            .then(function () { return code; }, function (e) { if (e.status === 409 && (tries || 0) < 4) return create(offer, (tries || 0) + 1); throw e; });
    }
    function remove(code) { return call('DELETE', url(code)).catch(function () {}); }

    // host: make an invite, publish it under a new code, wait (polling once a second) for the guest's answer
    function open(h, cb) {
        cb = cb || {};
        var live = true, got = false, code = '', timer = 0;
        function cancel() { live = false; clearTimeout(timer); if (code) remove(code); code = ''; }
        return h.invite().then(function (inv) {
            return create(inv.code).then(function (c) {
                code = c; var until = Date.now() + CFG.waitMs;
                (function poll() {
                    if (!live) return;
                    if (Date.now() > until) { cancel(); if (cb.onExpire) cb.onExpire(); return; }
                    call('GET', url(code)).then(function (d) {
                        var ans = field(d, 'answer');
                        if (!ans) { timer = setTimeout(poll, 1000); return; }
                        live = false; got = true; remove(code); code = '';
                        return h.accept(inv.id, ans);                    // the data channel opening then calls h.onJoin
                    }).catch(function (e) { if (got) { if (cb.onError) cb.onError(e); return; } if (!live) return; if (e && e.status === 404) timer = setTimeout(poll, 1000); else { cancel(); if (cb.onError) cb.onError(e); } });
                })();
                return { code: c, id: inv.id, cancel: cancel };
            });
        });
    }

    // guest: read the host's offer, answer it, write the answer back (the host picks it up)
    function join(code, cb) {
        code = clean(code);
        if (code.length !== 5) { var e = new Error('bad code'); e.status = 404; return Promise.reject(e); }
        return call('GET', url(code)).then(function (d) {
            var offer = field(d, 'offer'); if (!offer) { var e = new Error('no offer'); e.status = 404; throw e; }
            return window.NetPad.join(offer, cb);
        }).then(function (g) {
            return call('PATCH', url(code, 'updateMask.fieldPaths=answer'), { fields: { answer: { stringValue: g.reply } } }).then(function () { return g; });
        });
    }

    window.NetPad.room = { open: open, join: join, config: function (o) { for (var k in o) CFG[k] = o[k]; return CFG; }, clean: clean };
})();
