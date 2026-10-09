/* Hollowmere: local co-op state, for both roles. No visuals here; the screens are in game.js.
 *   HOST  (the device that runs the game, TV / phone / computer): opens a room, gets join requests, accepts one;
 *         the guest's buttons then arrive as one more input device (window.HM_REMOTE, game.js).
 *   GUEST (a phone): lists the open rooms, picks one and waits to be accepted; then it is just a controller.
 * Built on NetPad.rooms (js/netpad-rooms.js), which talks to Firestore. See docs/FIRESTORE_ROOMS.md. */
window.HM_COOP = (function () {
    'use strict';
    // the keys the controller sends -> the game's actions (hero 2 never sends OK / menu: it only plays)
    const ACTION = { 37: 'left', 38: 'up', 39: 'right', 40: 'down', 90: 'jump', 88: 'run', 8: 'cancel' };
    const DEV = 'net1';
    const errKind = e => e && e.status === 403 ? 'rules' : e && e.status === -1 ? 'config' : 'net';
    const usable = () => !!(window.NetPad && NetPad.supported && NetPad.rooms);

    /* ------------------------------------------------------------ host */
    // state: idle | opening | open (asks: who wants to join) | connecting | connected | error (err: rules | config | net | none)
    let room = null, conn = null, hostFn = null;
    let hs = { state: 'idle', asks: [], err: '' };
    const hset = (state, extra) => { hs = Object.assign({ state, asks: hs.asks, err: '' }, extra); if (hostFn) hostFn(); };
    function openRoom(name) {
        if (hs.state !== 'idle' && hs.state !== 'error') return;
        if (!usable()) return hset('error', { err: 'none' });
        hs.asks = []; hset('opening');
        NetPad.rooms.host({
            name,
            onRequest: req => { hs.asks.push(req); hset(hs.state); if (api.onAsk) api.onAsk(req); },
            onError: e => { room = null; hset('error', { err: errKind(e) }); }
        }).then(r => { room = r; if (hs.state === 'opening') hset('open'); else r.close(); }, e => hset('error', { err: errKind(e) }));
    }
    function closeRoom() { if (room) room.close(); room = null; if (hs.state === 'open' || hs.state === 'opening' || hs.state === 'error') { hs.asks = []; hset('idle'); } }
    function accept(ask) {
        if (!room || hs.state !== 'open') return;
        hs.asks = hs.asks.filter(a => a !== ask); hset('connecting');
        const r = room;
        r.accept(ask, {
            onOpen: () => { r.close(); room = null; hs.asks = []; hset('connected'); },
            onMessage: m => { const a = ACTION[m && m[0]]; if (a) window.HM_REMOTE.input(a, !!m[1], DEV); },
            onClose: () => { window.HM_REMOTE.leave(DEV); conn = null; if (hs.state === 'connected' || hs.state === 'connecting') hset('idle'); }
        }).then(c => { conn = c; }, () => hset(room ? 'open' : 'idle'));
        // a request that never turns into a connection: back to waiting for others
        setTimeout(() => { if (hs.state === 'connecting' && conn && !conn.open) { conn.close(); } }, 20000);
    }
    function decline(ask) { if (room) room.decline(ask); hs.asks = hs.asks.filter(a => a !== ask); hset(hs.state); }
    function disconnect() { if (conn) conn.close(); }

    /* ------------------------------------------------------------ guest */
    // state: idle | listing (rooms) | asking (room) | connected | denied (why: no | gone | timeout | connect) | error (err)
    let join = null, listT = 0, guestFn = null, listing = false, gConn = null;
    let gs = { state: 'idle', rooms: [], room: null, why: '', err: '' };
    const gset = (state, extra) => { gs = Object.assign({ state, rooms: gs.rooms, room: null, why: '', err: '' }, extra); if (guestFn) guestFn(); };
    function browse(fn) {
        guestFn = fn; listing = true;
        if (!usable()) return gset('error', { err: 'none' });
        if (gs.state === 'idle' || gs.state === 'denied' || gs.state === 'error') gset('listing');
        (function tick() {
            if (!listing) return;
            NetPad.rooms.list().then(rooms => {
                if (!listing) return;
                if (gs.state === 'listing' || gs.state === 'error') gset('listing', { rooms });
                listT = setTimeout(tick, 3000);
            }, e => { if (listing) { gset('error', { err: errKind(e) }); listT = setTimeout(tick, 5000); } });
        })();
    }
    function stopBrowse() { listing = false; clearTimeout(listT); guestFn = null; }
    function ask(r, myName, onConnected, onLost) {
        gset('asking', { room: r });
        join = NetPad.rooms.join(r, myName, {
            onOpen: () => { gConn = join; gset('connected', { room: r }); if (onConnected) onConnected(); },
            onClose: () => { gConn = null; join = null; if (onLost) onLost(); gset('listing'); },
            onDenied: why => { join = null; gset('denied', { room: r, why }); },
            onError: e => { join = null; gset('error', { err: errKind(e) }); }
        });
    }
    function cancel() { if (join) join.cancel(); join = null; gset('listing'); }
    function leave() { if (join) join.close(); join = null; gConn = null; }
    function sendKey(code, down) { if (gConn) gConn.send([code, down ? 1 : 0]); }

    const api = {
        usable, onAsk: null,
        get host() { return hs; }, get guest() { return gs; },
        // host
        listenHost(fn) { hostFn = fn; }, openRoom, closeRoom, accept, decline, disconnect,
        // guest
        browse, stopBrowse, ask, cancel, leave, sendKey
    };
    return api;
})();
