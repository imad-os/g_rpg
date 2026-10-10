/* Hollowmere: reads the real game controller (navigator.getGamepads) so buttons can be shown and assigned by their real names
 * (A, B, X, Y on Xbox; ✕ ○ □ △ on PlayStation; B, A, Y, X on Nintendo). Works where the page can see the controller;
 * `live` turns true only after a real press was seen, so nothing changes when the shell hides the controller from the game. */
window.HM_PAD = (function () {
    'use strict';
    const NAMES = {
        xbox: ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'View', 'Menu', 'L3', 'R3', '↑', '↓', '←', '→', 'Xbox'],
        ps: ['✕', '○', '□', '△', 'L1', 'R1', 'L2', 'R2', 'Create', 'Options', 'L3', 'R3', '↑', '↓', '←', '→', 'PS'],
        nintendo: ['B', 'A', 'Y', 'X', 'L', 'R', 'ZL', 'ZR', '−', '+', 'L3', 'R3', '↑', '↓', '←', '→', 'Home'],
        generic: []
    };
    let kind = 'generic', live = false, prev = [];
    const pads = () => { try { return Array.prototype.filter.call(navigator.getGamepads ? navigator.getGamepads() : [], g => g && g.connected); } catch (e) { return []; } };
    function kindOf(id) {
        id = String(id || '').toLowerCase();
        if (/xbox|xinput|045e/.test(id)) return 'xbox';
        if (/playstation|dualshock|dualsense|wireless controller|054c/.test(id)) return 'ps';
        if (/nintendo|switch|pro controller|joy-con|057e/.test(id)) return 'nintendo';
        return 'generic';
    }
    const name = i => i < 0 ? '' : (NAMES[kind][i] || ('#' + (i + 1)));
    const holding = () => { const g = pads()[0]; if (!g) return false; for (let i = 0; i < 12; i++) if (g.buttons[i] && g.buttons[i].pressed) return true; return false; };
    // edges since the last call: cb(index, down)
    function poll(cb) {
        const g = pads()[0]; if (!g) { prev = []; return; }
        kind = kindOf(g.id);
        for (let i = 0; i < g.buttons.length && i < 17; i++) {
            const d = !!(g.buttons[i] && g.buttons[i].pressed);
            if (d !== !!prev[i]) { prev[i] = d; if (d) live = true; cb(i, d); }
        }
    }
    return { poll, name, holding, get live() { return live; }, get kind() { return kind; }, connected: () => pads().length > 0 };
})();
