/* Hollowmere: local co-op, host side. Keeps the state of one co-op room: it asks NetPad for a room code,
 * waits for a phone (controller.html) to enter it, then feeds the phone's buttons to the game as one more
 * input device (window.HM_REMOTE, game.js). Works the same on the TV, a phone and a computer.
 * The screen that shows the code is in game.js (coopScreen); this file has no visuals. */
window.HM_COOP = (function () {
    'use strict';
    // the keys the controller sends -> the game's actions (hero 2 never sends OK / menu: it only plays)
    const ACTION = { 37: 'left', 38: 'up', 39: 'right', 40: 'down', 90: 'jump', 88: 'run', 8: 'cancel' };
    let h = null, room = null, joined = '', listener = null;
    let st = { state: 'idle', code: '', err: '' };         // idle | creating | waiting | connected | expired | error (err: rules | net | none)

    function set(state, extra) { st = Object.assign({ state, code: '', err: '' }, extra); if (listener) listener(); }
    function fail(e) { room = null; set('error', { err: e && e.status === 403 ? 'rules' : e && e.status === -1 ? 'config' : 'net' }); }
    function host() {
        if (!h) h = NetPad.host({
            onJoin: id => { joined = id; set('connected'); },
            onLeave: id => {
                window.HM_REMOTE.leave(id);
                if (id === joined) { joined = ''; set('idle'); if (listener) start(); }       // the screen is open: a fresh code
            },
            onMessage: (id, m) => { const a = ACTION[m && m[0]]; if (a && id === joined) window.HM_REMOTE.input(a, !!m[1], id); }
        });
        return h;
    }
    function start() {
        if (st.state === 'creating' || st.state === 'waiting' || st.state === 'connected') return;
        if (!window.NetPad || !NetPad.supported || !NetPad.room) return set('error', { err: 'none' });
        set('creating');
        NetPad.room.open(host(), { onExpire: () => { room = null; set('expired'); }, onError: fail })
            .then(r => { room = r; if (st.state === 'creating') set('waiting', { code: r.code }); }, fail);
    }
    return {
        get state() { return st; },
        open(fn) { listener = fn; start(); },               // fn is called on every change while the co-op screen is open
        close() { listener = null; },                       // the code stays valid in the background
        again() { if (room) room.cancel(); room = null; set('idle'); start(); },
        disconnect() { if (joined && h) h.close(joined); }
    };
})();
