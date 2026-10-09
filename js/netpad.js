/* NetPad: a direct connection between two devices on the same network (WebRTC data channel), no server
 * in the game traffic. Standalone and game-independent: copy this file (and netpad-rooms.js, virtual-pad.js)
 * into any My PC game. The two sides swap one short text each to introduce themselves (NetPad.rooms does
 * that for you through Firestore: players pick a room in the game, nobody types or copies anything).
 *
 *   caller:   NetPad.offer(h).then(function (c) { ... c.code to the other side ...; c.accept(theirReply); })
 *   callee:   NetPad.answer(code, h).then(function (c) { ... c.code back to the caller ... })
 *   h = { onOpen(), onMessage(msg), onClose() }       c = { code, send(msg), close(), open, accept(reply) (caller only) }
 *
 * Both sides ping every second and drop the link after 5 s of silence (phone locked, Wi-Fi lost).
 * No STUN/TURN is used: both devices must be on the same network, and the router must let devices talk to each
 * other (a "guest network" or "client isolation" does not). */
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

    // a session description <-> a text (deflated when the browser can, so it stays short)
    function pack(desc) {
        var raw = enc.encode(JSON.stringify({ t: desc.type, s: desc.sdp }));
        if (window.CompressionStream) return through(raw, new CompressionStream('deflate-raw')).then(function (z) { return 'z' + b64(z); });
        return Promise.resolve('p' + b64(raw));
    }
    function unpack(code) {
        code = String(code || '').trim();
        var kind = code.charAt(0), body;
        try { body = unb64(code.slice(1)); } catch (e) { return Promise.reject(new Error('bad code')); }
        var json = kind === 'z' ? through(body, new DecompressionStream('deflate-raw')) : kind === 'p' ? Promise.resolve(body) : Promise.reject(new Error('bad code'));
        return json.then(function (u) { var o = JSON.parse(dec.decode(u)); return { type: o.t, sdp: o.s }; });
    }
    // wait until the browser has listed its network addresses (no trickle: the text must be complete)
    function gathered(pc) {
        return new Promise(function (ok) {
            if (pc.iceGatheringState === 'complete') return ok();
            var t = setTimeout(ok, 3000);
            pc.addEventListener('icegatheringstatechange', function () { if (pc.iceGatheringState === 'complete') { clearTimeout(t); ok(); } });
        });
    }

    // the part both sides share: the data channel, heartbeat and clean closing
    function link(pc, h) {
        h = h || {};
        var ch = null, open = false, closed = false, seen = Date.now(), beat = 0, dog = 0;
        function send(m) { if (ch && ch.readyState === 'open') try { ch.send(JSON.stringify(m)); } catch (e) {} }
        function close() {
            if (closed) return; closed = true; clearInterval(beat); clearInterval(dog);
            try { pc.close(); } catch (e) {}
            if (h.onClose) h.onClose(open);
        }
        function attach(c) {
            ch = c;
            c.onopen = function () {
                open = true; seen = Date.now();
                beat = setInterval(function () { send('ping'); }, 1000);
                dog = setInterval(function () { if (Date.now() - seen > 5000) close(); }, 1000);
                if (h.onOpen) h.onOpen();
            };
            c.onclose = close;
            c.onmessage = function (e) { seen = Date.now(); var m; try { m = JSON.parse(e.data); } catch (x) { return; } if (m !== 'ping' && h.onMessage) h.onMessage(m); };
        }
        pc.onconnectionstatechange = function () { if (pc.connectionState === 'failed' || pc.connectionState === 'closed') close(); };
        return { attach: attach, send: send, close: close, isOpen: function () { return open; } };
    }
    function done(pc, l, extra) {
        return pack(pc.localDescription).then(function (code) {
            var c = { code: code, send: l.send, close: l.close, get open() { return l.isOpen(); } };
            for (var k in extra) c[k] = extra[k];
            return c;
        });
    }

    function offer(h) {
        var pc = new RTCPeerConnection(CFG), l = link(pc, h);
        l.attach(pc.createDataChannel('pad'));
        return pc.createOffer().then(function (o) { return pc.setLocalDescription(o); }).then(function () { return gathered(pc); }).then(function () {
            return done(pc, l, { accept: function (reply) {
                return unpack(reply).then(function (d) { if (d.type !== 'answer') throw new Error('bad code'); return pc.setRemoteDescription(d); });
            } });
        });
    }
    function answer(code, h) {
        var pc = new RTCPeerConnection(CFG), l = link(pc, h);
        pc.ondatachannel = function (e) { l.attach(e.channel); };
        return unpack(code).then(function (d) { if (d.type !== 'offer') throw new Error('bad code'); return pc.setRemoteDescription(d); })
            .then(function () { return pc.createAnswer(); }).then(function (a) { return pc.setLocalDescription(a); })
            .then(function () { return gathered(pc); }).then(function () { return done(pc, l, {}); });
    }

    return { offer: offer, answer: answer, supported: typeof RTCPeerConnection === 'function' && typeof Blob === 'function' };
})();
