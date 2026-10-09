/* NetPad: phone-as-controller over the local network, with NO server (WebRTC data channel).
 * Standalone and game-independent: copy this one file (with virtual-pad.js) into any My PC game.
 *
 * Pairing swaps two short codes by hand (copy / paste / share link), once. After that the devices
 * talk directly to each other on the same Wi-Fi:
 *   host  (the device that runs the game):   var h = NetPad.host({ onJoin(id), onLeave(id), onMessage(id, msg) });
 *                                             var inv = await h.invite();        // { id, code }  -> give inv.code to the guest
 *                                             await h.accept(inv.id, replyCode);  // the code the guest gives back
 *                                             h.send(id, msg); h.close(id);
 *   guest (the phone used as controller):    var g = await NetPad.join(inviteCode, { onOpen(), onClose() });
 *                                             // show g.reply to the host, then: g.send(msg)  (any JSON value)
 * No STUN/TURN servers are used, so both devices must be on the same network (and the router must
 * allow devices to talk to each other, which a "guest network" or "client isolation" does not). */
window.NetPad = (function () {
    'use strict';
    var CFG = { iceServers: [] };
    var enc = new TextEncoder(), dec = new TextDecoder();

    function b64(u8) {
        var s = '';
        for (var i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
        return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    function unb64(t) {
        t = t.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '=';
        var s = atob(t), u = new Uint8Array(s.length);
        for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
        return u;
    }
    function through(u8, stream) { return new Response(new Blob([u8]).stream().pipeThrough(stream)).arrayBuffer().then(function (b) { return new Uint8Array(b); }); }

    // a session description <-> a text code (deflated when the browser can, so it stays short)
    function pack(desc) {
        var raw = enc.encode(JSON.stringify({ t: desc.type, s: desc.sdp }));
        if (window.CompressionStream) return through(raw, new CompressionStream('deflate-raw')).then(function (z) { return 'z' + b64(z); });
        return Promise.resolve('p' + b64(raw));
    }
    function unpack(code) {
        code = String(code || '').trim(); var h = code.lastIndexOf('#'); if (h >= 0) code = code.slice(h + 1);
        code = code.replace(/\s+/g, '');
        var kind = code.charAt(0), body;
        try { body = unb64(code.slice(1)); } catch (e) { return Promise.reject(new Error('bad code')); }
        var json = kind === 'z' ? through(body, new DecompressionStream('deflate-raw')) : kind === 'p' ? Promise.resolve(body) : Promise.reject(new Error('bad code'));
        return json.then(function (u) { var o = JSON.parse(dec.decode(u)); return { type: o.t, sdp: o.s }; });
    }
    // wait until the browser has listed its network addresses (no trickle: the code must be complete)
    function gathered(pc) {
        return new Promise(function (ok) {
            if (pc.iceGatheringState === 'complete') return ok();
            var t = setTimeout(ok, 3000);
            pc.addEventListener('icegatheringstatechange', function () { if (pc.iceGatheringState === 'complete') { clearTimeout(t); ok(); } });
        });
    }

    function host(h) {
        var peers = {}, n = 0, dog = null;
        function leave(id) {
            var p = peers[id]; if (!p) return;
            delete peers[id]; try { p.pc.close(); } catch (e) {}
            if (p.open && h.onLeave) h.onLeave(id);
            if (!Object.keys(peers).length && dog) { clearInterval(dog); dog = null; }
        }
        function watch() {      // a guest that stops answering (phone locked, Wi-Fi lost) is dropped after 5 s
            if (dog) return;
            dog = setInterval(function () { var now = Date.now(); for (var id in peers) if (peers[id].open && now - peers[id].seen > 5000) leave(id); }, 1000);
        }
        return {
            invite: function () {
                var id = 'net' + (++n), pc = new RTCPeerConnection(CFG), ch = pc.createDataChannel('pad');
                var p = peers[id] = { pc: pc, ch: ch, open: false, seen: Date.now() };
                ch.onopen = function () { p.open = true; p.seen = Date.now(); watch(); if (h.onJoin) h.onJoin(id); };
                ch.onclose = function () { leave(id); };
                ch.onmessage = function (e) { p.seen = Date.now(); var m; try { m = JSON.parse(e.data); } catch (x) { return; } if (m !== 'ping' && h.onMessage) h.onMessage(id, m); };
                pc.onconnectionstatechange = function () { if (pc.connectionState === 'failed' || pc.connectionState === 'closed') leave(id); };
                return pc.createOffer().then(function (o) { return pc.setLocalDescription(o); }).then(function () { return gathered(pc); })
                    .then(function () { return pack(pc.localDescription); }).then(function (code) { return { id: id, code: code }; });
            },
            accept: function (id, code) {
                var p = peers[id]; if (!p) return Promise.reject(new Error('no such invite'));
                return unpack(code).then(function (d) { if (d.type !== 'answer') throw new Error('bad code'); return p.pc.setRemoteDescription(d); });
            },
            send: function (id, msg) { var p = peers[id]; if (p && p.open) try { p.ch.send(JSON.stringify(msg)); } catch (e) {} },
            close: leave,
            closeAll: function () { for (var id in peers) leave(id); }
        };
    }

    function join(code, cb) {
        cb = cb || {};
        var pc = new RTCPeerConnection(CFG), ch = null, beat = null, closed = false;
        function done() { if (closed) return; closed = true; clearInterval(beat); try { pc.close(); } catch (e) {} if (cb.onClose) cb.onClose(); }
        pc.ondatachannel = function (e) {
            ch = e.channel;
            ch.onopen = function () { beat = setInterval(function () { g.send('ping'); }, 1000); if (cb.onOpen) cb.onOpen(); };
            ch.onclose = done;
        };
        pc.onconnectionstatechange = function () { if (pc.connectionState === 'failed' || pc.connectionState === 'closed') done(); };
        var g = {
            reply: '',
            get open() { return !!ch && ch.readyState === 'open'; },
            send: function (msg) { if (ch && ch.readyState === 'open') try { ch.send(JSON.stringify(msg)); } catch (e) {} },
            close: done
        };
        return unpack(code).then(function (d) { if (d.type !== 'offer') throw new Error('bad code'); return pc.setRemoteDescription(d); })
            .then(function () { return pc.createAnswer(); }).then(function (a) { return pc.setLocalDescription(a); }).then(function () { return gathered(pc); })
            .then(function () { return pack(pc.localDescription); }).then(function (r) { g.reply = r; return g; });
    }

    return { host: host, join: join, supported: typeof RTCPeerConnection === 'function' };
})();
