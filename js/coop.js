/* Hollowmere: local co-op on top of MyPC.multiplayer (My PC owns the rooms, the room list and the accept dialog).
 *   HOST (the device that runs the game): host() -> My PC's "Open a room" screen; friends are accepted by My PC's own
 *         dialog; each connected friend's buttons arrive as one more input device (window.HM_REMOTE, game.js).
 *   GUEST (a phone): join() -> My PC's list of rooms; once accepted this phone is just a controller (virtual pad).
 * No lobby, no codes, no Firebase here. State only; the screens that remain are in game.js. */
window.HM_COOP = (function () {
    'use strict';
    // the keys the controller sends -> the game's actions (hero 2 never sends OK: menus on the host are not answered by the phone, except hero 2's own menu)
    const ACTION = { 37: 'left', 38: 'up', 39: 'right', 40: 'down', 90: 'jump', 88: 'run', 8: 'cancel', 77: 'menu' };
    const DEV = 'net1';
    const usable = () => !!(window.MyPC && MyPC.multiplayer && MyPC.multiplayer.supported);

    /* ------------------------------------------------------------ host */
    // state: idle | open (a room is open, nobody in yet) | connected
    let session = null, peer = null, listener = null;
    const hs = { state: 'idle' };
    const set = state => { hs.state = state; if (listener) listener(); };
    function openRoom(done) {
        if (!usable() || hs.state !== 'idle') return;
        MyPC.multiplayer.host({ max: 1 }).then(s => {
            session = s; set('open'); if (done) done();
            s.onPeer(p => {
                peer = p; set('connected');
                p.onMessage(m => { const a = ACTION[Array.isArray(m) ? m[0] : 0]; if (a) window.HM_REMOTE.input(a, !!m[1], DEV); });
                p.onClose(() => { window.HM_REMOTE.leave(DEV); if (peer === p) { peer = null; session = null; set('idle'); } });
            });
        }, () => { /* cancelled or refused: My PC already told the player */ });
    }
    function closeRoom() { if (session) session.close(); session = null; set('idle'); }
    function disconnect() { if (peer) peer.close(); }
    const sendMenu = rows => { if (peer) peer.send(['m', rows]); };

    /* ------------------------------------------------------------ guest */
    let gpeer = null;
    function join(onConnected, onLost, onText) {
        MyPC.multiplayer.join().then(p => {
            gpeer = p; p.onMessage(m => { if (Array.isArray(m) && m[0] === 'm' && Array.isArray(m[1]) && onText) onText(m[1].map(String)); });     // hero 2's menu, as lines
            p.onClose(() => { if (gpeer === p) { gpeer = null; onLost(); } });
            onConnected(p);
        }, () => { /* cancelled, declined, closed, no answer, not on the same Wi-Fi: My PC already explained it */ });
    }
    const leave = () => { if (gpeer) gpeer.close(); };
    const sendKey = (code, down) => { if (gpeer) gpeer.send([code, down ? 1 : 0]); };

    return { usable, get host() { return hs; }, listen(fn) { listener = fn; }, openRoom, closeRoom, disconnect, join, leave, sendKey, sendMenu };
})();
