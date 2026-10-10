/* Hollowmere: local co-op on top of MyPC.multiplayer (My PC owns the rooms, the room list and the accept dialog).
 *   HOST (the device that runs the game): host() -> My PC's "Open a room" screen; friends are accepted by My PC's own
 *         dialog; each connected friend's buttons arrive as one more input device (window.HM_REMOTE, game.js).
 *   GUEST (a phone): join() -> My PC's list of rooms; once accepted this phone is just a controller (virtual pad).
 * No lobby, no codes, no Firebase here. State only; the screens that remain are in game.js. */
window.HM_COOP = (function () {
    'use strict';
    // the keys the controller sends -> the game's actions (hero 2 never sends OK: menus on the host are not answered by the phone, except hero 2's own menu)
    const ACTION = { 37: 'left', 38: 'up', 39: 'right', 40: 'down', 90: 'jump', 88: 'run', 8: 'cancel', 77: 'menu' };
        const usable = () => !!(window.MyPC && MyPC.multiplayer && MyPC.multiplayer.supported);

    /* ------------------------------------------------------------ host */
    // state: idle | open (a room is open, or friends are in). Up to three friends (four heroes with the host); each phone is one device ('net1', 'net2'...)
    let session = null, listener = null, seq = 0;
    const peers = {};
    const hs = { state: 'idle', peers: [] };                 // peers: [{ dev, name }]
    const set = () => { if (listener) listener(); };
    function openRoom(done) {
        if (!usable() || hs.state !== 'idle') return;
        MyPC.multiplayer.host({ max: 3 }).then(s => {
            session = s; hs.state = 'open'; set(); if (done) done();
            s.onPeer(p => {
                const dev = 'net' + (++seq);
                peers[dev] = p; hs.peers.push({ dev, name: p.name }); window.HM_REMOTE.setName(dev, p.name);   // the friend's My PC profile name
                set();
                p.onMessage(m => { const a = ACTION[Array.isArray(m) ? m[0] : 0]; if (a) window.HM_REMOTE.input(a, !!m[1], dev); });
                p.onClose(() => {
                    window.HM_REMOTE.leave(dev); delete peers[dev]; hs.peers = hs.peers.filter(q => q.dev !== dev);
                    if (!hs.peers.length) closeRoom(); else set();       // the last friend left: a fresh room can be opened
                });
            });
        }, () => { /* cancelled or refused: My PC already told the player */ });
    }
    function closeRoom() { if (session) session.close(); session = null; hs.state = 'idle'; hs.peers = []; set(); }
    function disconnect(dev) { if (peers[dev]) peers[dev].close(); }
    const sendMenu = (dev, rows) => { if (peers[dev]) peers[dev].send(['m', rows]); };
    const broadcast = m => { for (const dev in peers) peers[dev].send(m); };               // rewards and progress, for every connected phone

    /* ------------------------------------------------------------ guest */
    let gpeer = null;
    function join(onConnected, onLost, onText, onSync) {
        MyPC.multiplayer.join().then(p => {
            gpeer = p; p.onMessage(m => {
                if (Array.isArray(m) && m[0] === 'm' && Array.isArray(m[1])) { if (onText) onText(m[1].map(String)); }      // the hero's menu, as lines
                else if (Array.isArray(m) && onSync) onSync(m);                                                         // rewards and progress from the host
            });
            p.onClose(() => { if (gpeer === p) { gpeer = null; onLost(); } });
            onConnected(p);
        }, () => { /* cancelled, declined, closed, no answer, not on the same Wi-Fi: My PC already explained it */ });
    }
    const leave = () => { if (gpeer) gpeer.close(); };
    const sendKey = (code, down) => { if (gpeer) gpeer.send([code, down ? 1 : 0]); };

    return { usable, get host() { return hs; }, listen(fn) { listener = fn; }, openRoom, closeRoom, disconnect, join, leave, sendKey, sendMenu, broadcast };
})();
