/* NetPad.rooms: a lobby for local multiplayer through Firestore (REST, no SDK, no sign-in).
 * Add after netpad.js. Standalone and game-independent: copy netpad.js + netpad-rooms.js into any My PC game.
 *
 * A player OPENS A ROOM (a small Firestore document with a name). Other players LIST the open rooms inside the
 * game and pick one: that creates a join request. The host sees the request and ACCEPTS (or declines); the answer
 * travels back through Firestore, and the two devices connect directly (NetPad). Nobody types or copies anything.
 * Only the introduction goes through Firestore; the game traffic stays on the local network.
 *
 *   host:   NetPad.rooms.host({ name, onRequest(req), onError(e) }).then(function (room) { ... })
 *             room.accept(req, { onOpen, onMessage, onClose }) -> Promise<connection>    room.decline(req)    room.close()
 *             req = { id, name }
 *   guest:  NetPad.rooms.list() -> Promise<[{ id, name }]>
 *           var j = NetPad.rooms.join(room, myName, { onOpen, onMessage, onClose, onDenied(why), onError(e) })   j.send(msg), j.cancel(), j.close()
 *             why = 'no' (declined) | 'gone' (room closed) | 'timeout' | 'connect' (could not connect)
 * Errors carry .status: 403 = the Firestore rules are not published, 0 = no internet, -1 = no Firebase settings.
 * Setup (rules, TTL, settings): docs/FIRESTORE_ROOMS.md. */
(function () {
    'use strict';
    var CFG = { project: '', key: '', collection: 'rooms', liveMs: 45000, beatMs: 15000, reqMs: 120000 };
    var FB = window.NETPAD_FIREBASE; if (FB) { CFG.project = FB.project || ''; CFG.key = FB.key || ''; }
    var ALPHA = 'abcdefghijklmnopqrstuvwxyz0123456789';

    function base() { return 'https://firestore.googleapis.com/v1/projects/' + CFG.project + '/databases/(default)/documents'; }
    function url(path, query) { return base() + (path ? '/' + path : '') + '?' + (query ? query + '&' : '') + 'key=' + encodeURIComponent(CFG.key); }
    function call(method, u, body) {
        if (!CFG.project || !CFG.key) { var c = new Error('no firebase settings'); c.status = -1; return Promise.reject(c); }
        return fetch(u, { method: method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined }).then(function (r) {
            if (r.ok) return r.json();
            var e = new Error('firestore ' + r.status); e.status = r.status; throw e;
        }, function () { var e = new Error('no internet'); e.status = 0; throw e; });
    }
    function S(v) { return { stringValue: String(v) }; }
    function T(ms) { return { timestampValue: new Date(ms).toISOString() }; }
    function f(d, k) { return d && d.fields && d.fields[k] ? d.fields[k].stringValue || '' : ''; }
    function ft(d, k) { return d && d.fields && d.fields[k] && d.fields[k].timestampValue ? Date.parse(d.fields[k].timestampValue) : 0; }
    function last(name) { return String(name || '').split('/').pop(); }
    function newId() {
        var a = new Uint8Array(12), s = '';
        (window.crypto || window.msCrypto).getRandomValues(a);
        for (var i = 0; i < 12; i++) s += ALPHA.charAt(a[i] % ALPHA.length);
        return s;
    }
    function nop() {}

    // the rooms that are open right now (a host keeps its room alive; one that stops is gone in under a minute)
    function list() {
        var q = { structuredQuery: { from: [{ collectionId: CFG.collection }],
            where: { fieldFilter: { field: { fieldPath: 'exp' }, op: 'GREATER_THAN', value: T(Date.now()) } },
            orderBy: [{ field: { fieldPath: 'exp' }, direction: 'DESCENDING' }], limit: 20 } };
        return call('POST', base() + ':runQuery?key=' + encodeURIComponent(CFG.key), q).then(function (rows) {
            return rows.filter(function (r) { return r.document; }).map(function (r) { return { id: last(r.document.name), name: f(r.document, 'name') }; });
        });
    }

    function host(opt) {
        opt = opt || {};
        var rid = newId(), path = CFG.collection + '/' + rid, live = true, seen = {}, beatT = 0, pollT = 0;
        function fail(e) { if (live) { close(); if (opt.onError) opt.onError(e); } }
        function beat() { if (!live) return; call('PATCH', url(path, 'updateMask.fieldPaths=exp'), { fields: { exp: T(Date.now() + CFG.liveMs) } }).then(function () { beatT = setTimeout(beat, CFG.beatMs); }, fail); }
        function poll() {
            if (!live) return;
            call('POST', base() + '/' + path + ':runQuery?key=' + encodeURIComponent(CFG.key), { structuredQuery: { from: [{ collectionId: 'reqs' }], limit: 10 } }).then(function (rows) {
                rows.filter(function (r) { return r.document; }).map(function (r) { return r.document; }).forEach(function (doc) {
                    var id = last(doc.name);
                    if (seen[id]) return; seen[id] = 1;
                    if (f(doc, 'answer') || (doc.fields && doc.fields.no) || ft(doc, 'exp') < Date.now()) return;
                    if (opt.onRequest) opt.onRequest({ id: id, name: f(doc, 'name'), offer: f(doc, 'offer') });
                });
                pollT = setTimeout(poll, opt.pollMs || 2000);
            }, fail);
        }
        function close() {
            if (!live) return; live = false; clearTimeout(beatT); clearTimeout(pollT);
            Object.keys(seen).forEach(function (id) { call('DELETE', url(path + '/reqs/' + id)).catch(nop); });
            call('DELETE', url(path)).catch(nop);
        }
        var room = {
            id: rid,
            accept: function (req, h) {
                return window.NetPad.answer(req.offer, h).then(function (c) {
                    return call('PATCH', url(path + '/reqs/' + req.id, 'updateMask.fieldPaths=answer'), { fields: { answer: S(c.code) } }).then(function () { return c; });
                });
            },
            decline: function (req) { return call('PATCH', url(path + '/reqs/' + req.id, 'updateMask.fieldPaths=no'), { fields: { no: { booleanValue: true } } }).catch(nop); },
            close: close
        };
        return call('POST', url(CFG.collection, 'documentId=' + rid), { fields: { name: S(opt.name || 'Player'), exp: T(Date.now() + CFG.liveMs) } }).then(function () {
            beatT = setTimeout(beat, CFG.beatMs); poll(); return room;
        });
    }

    function join(room, name, h) {
        h = h || {};
        var live = true, conn = null, rq = newId(), made = false, pollT = 0, giveUp = 0;
        var parent = CFG.collection + '/' + room.id + '/reqs', path = parent + '/' + rq;
        function stop() { live = false; clearTimeout(pollT); clearTimeout(giveUp); if (made) { made = false; call('DELETE', url(path)).catch(nop); } }
        function deny(why) { if (!live) return; stop(); if (conn) conn.close(); if (h.onDenied) h.onDenied(why); }
        function error(e) { if (!live) return; stop(); if (conn) conn.close(); if (e && e.status === 404) { if (h.onDenied) h.onDenied('gone'); } else if (h.onError) h.onError(e); }
        var api = {
            cancel: function () { stop(); if (conn && !conn.open) conn.close(); },
            close: function () { stop(); if (conn) conn.close(); },
            send: function (m) { if (conn) conn.send(m); },
            get open() { return !!conn && conn.open; }
        };
        window.NetPad.offer({
            onOpen: function () { stop(); if (h.onOpen) h.onOpen(); },
            onMessage: h.onMessage,
            onClose: function (wasOpen) { var was = live; stop(); if (wasOpen) { if (h.onClose) h.onClose(); } else if (was && h.onDenied) h.onDenied('connect'); }
        }).then(function (c) {
            conn = c; if (!live) { c.close(); return; }
            return call('POST', url(parent, 'documentId=' + rq), { fields: { name: S(name || 'Player'), offer: S(c.code), exp: T(Date.now() + CFG.reqMs) } }).then(function () {
                made = true; if (!live) { stop(); return; }
                giveUp = setTimeout(function () { deny('timeout'); }, 60000);          // the host did not answer
                (function poll() {
                    if (!live) return;
                    call('GET', url(path)).then(function (d) {
                        var ans = f(d, 'answer');
                        if (ans) { clearTimeout(giveUp); giveUp = setTimeout(function () { deny('connect'); }, 15000); return c.accept(ans).catch(function () { deny('connect'); }); }
                        if (d.fields && d.fields.no) return deny('no');
                        pollT = setTimeout(poll, 1000);
                    }, error);
                })();
            });
        }).catch(error);
        return api;
    }

    window.NetPad.rooms = { list: list, host: host, join: join, config: function (o) { for (var k in o) CFG[k] = o[k]; return CFG; } };
})();
