/* Virtual gamepad for My PC games: a joystick and buttons for phones (standalone mode only).
 * Standalone and game-independent: copy this one file into any My PC game.
 *
 *   <script src="virtual-pad.js"></script>          (after the SDK)
 *   VirtualPad.init();                              // joystick + A (OK) + B (run) + pause
 *   VirtualPad.init({ buttons: [{ label: 'A', key: 13 }, { label: 'B', key: 88 }] });
 *
 * It shows itself only when the game runs standalone (not inside My PC) on a touch device; add
 * ?pad=1 to the address to force it on a computer, ?pad=0 to hide it. It does not touch the game:
 * it presses the same keys the SDK already reads in standalone mode (arrows, Enter, X, Esc).
 * Key codes: 13 Enter (OK / jump), 32 Space, 88 X (run / fire), 27 Esc (pause menu), 80 P. */
window.VirtualPad = (function () {
    'use strict';
    var DEFAULT = [{ label: 'A', key: 13 }, { label: 'B', key: 88 }];
    var DIRS = { left: 37, up: 38, right: 39, down: 40 };
    var root = null, down = {};

    function press(code, on) {
        if (!!down[code] === on) return;
        down[code] = on;
        var e = new KeyboardEvent(on ? 'keydown' : 'keyup', { bubbles: true, cancelable: true });
        Object.defineProperty(e, 'keyCode', { get: function () { return code; } });
        document.dispatchEvent(e);
    }
    function wanted() {
        var m = /[?&]pad=(\d)/.exec(location.search);
        if (m) return m[1] === '1';
        var standalone = !window.MyPC || !MyPC.info || !MyPC.info() || MyPC.info().standalone;
        return standalone && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || matchMedia('(pointer:coarse)').matches);
    }
    function el(tag, css, parent) {
        var e = document.createElement(tag); e.style.cssText = css; if (parent) parent.appendChild(e); return e;
    }
    function stick(parent) {
        var size = 'min(34vmin,200px)';
        var base = el('div', 'position:absolute;left:4vmin;bottom:4vmin;width:' + size + ';height:' + size + ';border-radius:50%;background:rgba(255,255,255,0.14);border:2px solid rgba(255,255,255,0.35);touch-action:none;pointer-events:auto', parent);
        var knob = el('div', 'position:absolute;left:50%;top:50%;width:44%;height:44%;margin:-22% 0 0 -22%;border-radius:50%;background:rgba(255,255,255,0.5);pointer-events:none', base);
        var id = null;
        function move(ev) {
            var r = base.getBoundingClientRect(), R = r.width / 2;
            var dx = ev.clientX - (r.left + R), dy = ev.clientY - (r.top + R), d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, R * 0.6 / d);
            knob.style.transform = 'translate(' + dx * k + 'px,' + dy * k + 'px)';
            var t = R * 0.3;
            press(DIRS.left, dx < -t); press(DIRS.right, dx > t); press(DIRS.up, dy < -t); press(DIRS.down, dy > t);
        }
        function end(ev) {
            if (ev.pointerId !== id) return;
            id = null; knob.style.transform = '';
            for (var k in DIRS) press(DIRS[k], false);
        }
        base.addEventListener('pointerdown', function (ev) { if (id !== null) return; id = ev.pointerId; base.setPointerCapture(id); move(ev); ev.preventDefault(); });
        base.addEventListener('pointermove', function (ev) { if (ev.pointerId === id) move(ev); });
        base.addEventListener('pointerup', end); base.addEventListener('pointercancel', end);
    }
    function button(parent, b, i) {
        var s = 'min(17vmin,100px)';
        var e = el('div', 'position:absolute;right:' + (4 + (i % 2) * 19) + 'vmin;bottom:' + (5 + (i >> 1) * 19 + (i % 2) * 9) + 'vmin;width:' + s + ';height:' + s + ';border-radius:50%;background:rgba(255,255,255,0.14);border:2px solid rgba(255,255,255,0.35);color:#fff;font:700 5vmin sans-serif;display:flex;align-items:center;justify-content:center;touch-action:none;pointer-events:auto', parent);
        e.textContent = b.label;
        function on(v) { return function (ev) { press(b.key, v); e.style.background = v ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.14)'; ev.preventDefault(); }; }
        e.addEventListener('pointerdown', on(true)); e.addEventListener('pointerup', on(false)); e.addEventListener('pointercancel', on(false)); e.addEventListener('pointerleave', on(false));
    }
    function init(opt) {
        if (root || !wanted()) return;
        opt = opt || {};
        // like a native app: no pinch zoom, no double-tap zoom, no page scroll or text selection while playing
        ['touchmove', 'gesturestart', 'gesturechange', 'contextmenu'].forEach(function (t) { document.addEventListener(t, function (e) { e.preventDefault(); }, { passive: false }); });
        var lastTap = 0; document.addEventListener('touchend', function (e) { var n = Date.now(); if (n - lastTap < 350) e.preventDefault(); lastTap = n; }, { passive: false });
        root = el('div', 'position:fixed;inset:0;z-index:99999;pointer-events:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none', document.body);
        stick(root);
        (opt.buttons || DEFAULT).forEach(function (b, i) { button(root, b, i); });
        if (opt.pause !== false) {                       // small pause button, top centre
            var p = el('div', 'position:absolute;left:50%;top:2vmin;margin-left:-6vmin;width:12vmin;height:6vmin;border-radius:3vmin;background:rgba(255,255,255,0.14);border:2px solid rgba(255,255,255,0.35);color:#fff;font:700 3.5vmin sans-serif;display:flex;align-items:center;justify-content:center;touch-action:none;pointer-events:auto', root);
            p.textContent = 'II';
            p.addEventListener('pointerdown', function (ev) { press(27, true); press(27, false); ev.preventDefault(); });
        }
    }
    function hide() { if (root) { for (var k in down) press(+k, false); root.remove(); root = null; } }
    return { init: init, hide: hide };
})();
