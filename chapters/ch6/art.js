/* Hollowmere, Chapter 6: Super Mario — Kingdoms of Wonder — 2.5D colorful pixel-art engine.
 * Pre-rendered onto off-screen canvases on zone entry; zero runtime allocations for 60 FPS on Max Quality & 1 GB RAM TVs. */
window.HM_C6_ART = (function () {
    'use strict';
    const TS = 32, CACHE = {};

    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); fn(x); return c; }
    function cached(key, w, h, fn) { return CACHE[key] || (CACHE[key] = mk(w, h, fn)); }
    function oval(x, X, Y, rx, ry, col) { x.fillStyle = col; x.beginPath(); x.ellipse(X, Y, rx, ry, 0, 0, 6.2832); x.fill(); }

    const PAL = {
        meadow:   { grass: '#48b838', grass2: '#3ca22e', dark: '#1e5818', cob: '#e8c478', stone: '#d4ae62', dirt: '#b88644', water: '#2494f4', rock: '#8a6842', rockTop: '#b48c5c', wall: '#8a5832', wallTop: '#56c844', tint: 'rgba(255,245,190,0.06)', flower: '#ff3848' },
        mountain: { grass: '#8a6c48', grass2: '#765a3a', dark: '#382818', cob: '#c8a878', stone: '#a8885c', dirt: '#6e5034', water: '#2080d8', rock: '#68523c', rockTop: '#967858', wall: '#58422c', wallTop: '#886a48', tint: 'rgba(255,220,160,0.07)', flower: '#ffd838' },
        jungle:   { grass: '#2c8e2c', grass2: '#227624', dark: '#103c12', cob: '#98b454', stone: '#7c9640', dirt: '#5c4628', water: '#1ca898', rock: '#486034', rockTop: '#648448', wall: '#1e521e', wallTop: '#389c34', tint: 'rgba(60,220,80,0.07)', flower: '#ff50a8' },
        haunted:  { grass: '#241c38', grass2: '#1c152c', dark: '#0e0a18', cob: '#4a3e68', stone: '#3a3054', dirt: '#2c2440', water: '#1c1236', rock: '#2c2444', rockTop: '#423664', wall: '#1a142c', wallTop: '#342854', tint: 'rgba(90,50,180,0.12)', flower: '#78f0ff' },
        snow:     { grass: '#dcf0ff', grass2: '#c4e2fa', dark: '#54789c', cob: '#9ad0f8', stone: '#7ebce8', dirt: '#8ab4d8', water: '#2888e4', rock: '#6890b8', rockTop: '#eef8ff', wall: '#5c84b0', wallTop: '#ffffff', tint: 'rgba(180,230,255,0.08)', flower: '#58d8ff' },
        sky:      { grass: '#fff8ec', grass2: '#f2e4ce', dark: '#8898c8', cob: '#ffd868', stone: '#eab848', dirt: '#d8c4a8', water: '#58b8ff', rock: '#c8d8f0', rockTop: '#ffffff', wall: '#98b4e0', wallTop: '#ffffff', tint: 'rgba(255,245,210,0.08)', flower: '#ffd700' },
        airship:  { grass: '#7c4e28', grass2: '#684020', dark: '#2c180a', cob: '#9c6838', stone: '#585c68', dirt: '#4c3018', water: '#3888d8', rock: '#464a54', rockTop: '#6e7482', wall: '#3c2412', wallTop: '#643e20', tint: 'rgba(40,30,20,0.08)', flower: '#ff9020' },
        lava:     { grass: '#2c1818', grass2: '#221212', dark: '#120808', cob: '#4e2824', stone: '#3e201c', dirt: '#321816', water: '#ff4810', rock: '#281414', rockTop: '#482220', wall: '#221010', wallTop: '#421c18', tint: 'rgba(255,60,15,0.12)', flower: '#ff6818' }
    };

    function stoneTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.stone; x.fillRect(px, py, TS, TS);
        x.strokeStyle = P.dark; x.lineWidth = 1;
        x.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
        if (hash(tx, ty, 1) < 0.35) {
            x.fillStyle = P.cob; x.fillRect(px + 3, py + 3, 12, 10);
            x.fillRect(px + 17, py + 16, 11, 9);
        }
    }

    function pathTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.cob; x.fillRect(px, py, TS, TS);
        x.fillStyle = P.stone;
        for (let i = 0; i < 4; i++) {
            const rx = (hash(tx, ty, i * 3) * 20) | 0, ry = (hash(tx, ty, i * 3 + 1) * 20) | 0;
            x.fillRect(px + rx, py + ry, 9, 6);
        }
        x.fillStyle = P.dark;
        x.fillRect(px, py, TS, 1); x.fillRect(px, py + 15, TS, 1);
    }

    function bridgeTile(x, px, py, P) {
        x.fillStyle = P.water; x.fillRect(px, py, TS, TS);
        x.fillStyle = '#9c622c'; x.fillRect(px + 1, py, TS - 2, TS);
        x.fillStyle = '#c88642'; x.fillRect(px + 3, py + 2, TS - 6, 6); x.fillRect(px + 3, py + 12, TS - 6, 6); x.fillRect(px + 3, py + 22, TS - 6, 6);
        x.fillStyle = '#543214'; x.fillRect(px, py, 3, TS); x.fillRect(px + TS - 3, py, 3, TS);
    }

    function waterTile(x, px, py, tx, ty, P, theme) {
        x.fillStyle = P.water; x.fillRect(px, py, TS, TS);
        x.fillStyle = theme === 'lava' ? 'rgba(255,230,60,0.45)' : 'rgba(255,255,255,0.28)';
        x.fillRect(px + 4, py + 10 + ((hash(tx, ty, 4) * 8) | 0), 22, 3);
    }

    function wallTile(x, px, py, tx, ty, P) {
        x.fillStyle = P.wall; x.fillRect(px, py, TS, TS);
        x.fillStyle = P.wallTop; x.fillRect(px, py, TS, 10);
        x.strokeStyle = P.dark; x.lineWidth = 1;
        x.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
    }

    /* ---------------- Tile Props (Trees, Bushes, Lamps, Pots, Chests, Gates) ---------------- */
    function tileProp(name, theme, v) {
        switch (name) {
            case 'tree': return cached('c6tree_' + theme + '_' + v, 64, 84, x => {
                oval(x, 32, 76, 18, 6, 'rgba(0,0,0,0.26)');
                x.fillStyle = theme === 'haunted' ? '#2c2038' : '#7a4a24';
                x.fillRect(26, 38, 12, 38);
                const c1 = theme === 'snow' ? '#b8e0f8' : theme === 'haunted' ? '#3a2854' : theme === 'lava' ? '#4a201c' : '#2ea02e';
                const c2 = theme === 'snow' ? '#ffffff' : theme === 'haunted' ? '#523874' : theme === 'lava' ? '#7a2c22' : '#4cd038';
                oval(x, 20, 34, 15, 13, c1); oval(x, 44, 34, 15, 13, c1);
                oval(x, 32, 22, 18, 15, c2);
                // Friendly Mario-style highlights / spots
                x.fillStyle = 'rgba(255,255,255,0.35)';
                oval(x, 26, 18, 5, 3, 'rgba(255,255,255,0.35)');
            });
            case 'bush': return cached('c6bush_' + theme + '_' + v, 32, 34, x => {
                oval(x, 16, 30, 12, 4, 'rgba(0,0,0,0.24)');
                const c1 = theme === 'snow' ? '#c8e6fa' : theme === 'haunted' ? '#3c2a56' : '#2ea42c';
                const c2 = theme === 'snow' ? '#ffffff' : theme === 'haunted' ? '#583e7a' : '#52d442';
                oval(x, 16, 22, 13, 9, c1); oval(x, 11, 18, 8, 6, c2); oval(x, 21, 17, 8, 6, c2);
                x.fillStyle = '#ff3848'; x.fillRect(10, 16, 3, 3); x.fillRect(20, 18, 3, 3);
            });
            case 'lamp': return cached('c6lamp_' + theme, 32, 60, x => {
                oval(x, 16, 56, 7, 2.5, 'rgba(0,0,0,0.28)');
                x.fillStyle = '#383028'; x.fillRect(14, 24, 4, 32); x.fillRect(10, 53, 12, 4);
                // Star lantern top
                x.fillStyle = '#ffd700'; oval(x, 16, 19, 8, 7, '#ffd700');
                x.fillStyle = '#fff8c0'; oval(x, 16, 19, 4, 4, '#fff8c0');
            });
            case 'pot': return cached('c6pot_' + theme, 32, 32, x => {
                oval(x, 16, 28, 9, 3, 'rgba(0,0,0,0.26)');
                // Brick/Terracotta pot
                x.fillStyle = '#c85a28'; oval(x, 16, 19, 9, 9, '#c85a28');
                x.fillStyle = '#e47838'; oval(x, 14, 17, 5, 6, '#e47838');
                x.fillStyle = '#7c3214'; x.fillRect(11, 8, 10, 4);
                x.fillStyle = '#ffd700'; x.fillRect(10, 12, 12, 2);
            });
            case 'chest': return cached('c6chest_' + v, 32, 32, x => {
                oval(x, 16, 28, 12, 3.5, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#c86820'; x.fillRect(4, 13, 24, 15);
                if (v) {
                    x.fillStyle = '#5c2808'; x.fillRect(4, 6, 24, 7);
                    x.fillStyle = '#ffd700'; x.fillRect(8, 13, 16, 3);
                } else {
                    x.fillStyle = '#e88830'; x.beginPath(); x.moveTo(4, 14); x.quadraticCurveTo(16, 4, 28, 14); x.fill();
                    x.fillStyle = '#ffd700'; x.fillRect(14, 12, 4, 6);
                }
                x.fillStyle = '#ffd700'; x.fillRect(4, 18, 24, 2); x.fillRect(4, 13, 2, 15); x.fillRect(26, 13, 2, 15);
            });
            case 'gate': return cached('c6gate_' + theme, 32, 52, x => {
                x.fillStyle = '#28242c';
                for (let k = 0; k < 5; k++) x.fillRect(2 + k * 7, 4, 3, 46);
                x.fillRect(0, 10, 32, 3); x.fillRect(0, 32, 32, 3);
                // Star emblem on gate
                x.fillStyle = '#ffd700'; oval(x, 16, 21, 5, 5, '#ffd700');
            });
        }
        return null;
    }

    /* ---------------- Big Props (Castle, Boutique, Mushroom House, Warp Pipe, ? Block, etc.) ---------------- */
    function bigProp(p, used) {
        const k = p.k;
        if (k === 'qblock') {
            return cached('qblock_' + (used ? '1' : '0'), 32, 36, x => {
                oval(x, 16, 33, 11, 3, 'rgba(0,0,0,0.28)');
                x.fillStyle = used ? '#8c6e46' : '#f8b800';
                x.fillRect(2, 2, 28, 28);
                x.strokeStyle = '#382400'; x.lineWidth = 2;
                x.strokeRect(3, 3, 26, 26);
                // Corner rivets
                x.fillStyle = '#5c3c00';
                x.fillRect(5, 5, 2, 2); x.fillRect(25, 5, 2, 2);
                x.fillRect(5, 25, 2, 2); x.fillRect(25, 25, 2, 2);
                if (!used) {
                    // Top highlight
                    x.fillStyle = '#ffe868'; x.fillRect(5, 4, 22, 3);
                    // Classic '?' symbol
                    x.fillStyle = '#fff8e0';
                    x.fillRect(11, 8, 10, 3);
                    x.fillRect(18, 11, 3, 4);
                    x.fillRect(14, 14, 5, 3);
                    x.fillRect(14, 17, 3, 3);
                    x.fillRect(14, 22, 3, 3);
                }
            });
        }
        if (k === 'brick') {
            return cached('brick', 32, 34, x => {
                oval(x, 16, 31, 11, 3, 'rgba(0,0,0,0.25)');
                x.fillStyle = '#c84c0c'; x.fillRect(2, 2, 28, 28);
                x.strokeStyle = '#281000'; x.lineWidth = 2; x.strokeRect(3, 3, 26, 26);
                x.fillStyle = '#f88848'; x.fillRect(4, 4, 11, 6); x.fillRect(17, 4, 11, 6);
                x.fillRect(4, 12, 6, 6); x.fillRect(12, 12, 10, 6); x.fillRect(24, 12, 4, 6);
                x.fillRect(4, 20, 11, 6); x.fillRect(17, 20, 11, 6);
            });
        }
        if (k === 'pipe') {
            return cached('pipe_' + (p.c || 'green'), 64, 52, x => {
                oval(x, 32, 48, 24, 5, 'rgba(0,0,0,0.32)');
                const main = p.c === 'gold' ? '#e8b820' : p.c === 'red' ? '#d82828' : '#00a800';
                const hi   = p.c === 'gold' ? '#fff088' : p.c === 'red' ? '#ff7878' : '#58f858';
                const dark = p.c === 'gold' ? '#8c6400' : p.c === 'red' ? '#780808' : '#005800';
                // Lower cylinder
                x.fillStyle = main; x.fillRect(12, 18, 40, 28);
                x.fillStyle = hi;   x.fillRect(17, 18, 8, 28);
                x.fillStyle = dark; x.fillRect(44, 18, 6, 28);
                x.strokeStyle = '#082008'; x.lineWidth = 2; x.strokeRect(12, 18, 40, 28);
                // Upper rim
                x.fillStyle = main; x.fillRect(8, 4, 48, 15);
                x.fillStyle = hi;   x.fillRect(14, 4, 10, 15);
                x.fillStyle = dark; x.fillRect(46, 4, 8, 15);
                x.strokeRect(8, 4, 48, 15);
                // Interior opening
                x.fillStyle = '#061406'; x.fillRect(14, 5, 36, 4);
            });
        }
        if (k === 'mush_house') {
            return cached('mush_house_' + (p.c || 'red'), 96, 92, x => {
                oval(x, 48, 84, 38, 8, 'rgba(0,0,0,0.3)');
                // Cream stem house walls
                x.fillStyle = '#fff0d4'; x.fillRect(22, 44, 52, 38);
                x.strokeStyle = '#4a321a'; x.lineWidth = 2; x.strokeRect(22, 44, 52, 38);
                // Door
                x.fillStyle = '#8c5228'; x.beginPath(); x.arc(48, 64, 10, Math.PI, 0); x.lineTo(58, 82); x.lineTo(38, 82); x.closePath(); x.fill();
                // Giant Spotted Mushroom Cap Roof
                const cap = p.c === 'green' ? '#24b42c' : p.c === 'blue' ? '#2478e8' : p.c === 'gold' ? '#f0b818' : '#e42428';
                x.fillStyle = cap;
                x.beginPath(); x.arc(48, 44, 42, Math.PI, 0); x.closePath(); x.fill();
                x.strokeStyle = '#381414'; x.lineWidth = 2; x.stroke();
                // White spots on cap
                x.fillStyle = '#ffffff';
                oval(x, 48, 18, 11, 9, '#ffffff');
                oval(x, 24, 30, 9, 8, '#ffffff');
                oval(x, 72, 30, 9, 8, '#ffffff');
            });
        }
        if (k === 'boutique') {
            return cached('boutique', 128, 104, x => {
                oval(x, 64, 96, 54, 9, 'rgba(0,0,0,0.32)');
                x.fillStyle = '#ffe8f4'; x.fillRect(14, 44, 100, 50);
                x.strokeStyle = '#782854'; x.lineWidth = 2; x.strokeRect(14, 44, 100, 50);
                // Striped royal awning roof
                for (let i = 0; i < 8; i++) {
                    x.fillStyle = (i & 1) ? '#ffffff' : '#ff4898';
                    x.fillRect(10 + i * 13.5, 16, 14, 30);
                }
                // Crown emblem on boutique roof
                x.fillStyle = '#ffd700';
                x.beginPath(); x.moveTo(48, 16); x.lineTo(52, 4); x.lineTo(64, 11); x.lineTo(76, 4); x.lineTo(80, 16); x.closePath(); x.fill();
                // Display windows showing Mario Red & Luigi Green tunics
                x.fillStyle = '#283248'; x.fillRect(24, 56, 22, 22); x.fillRect(82, 56, 22, 22);
                x.fillStyle = '#e82428'; x.fillRect(30, 62, 10, 12);
                x.fillStyle = '#24b434'; x.fillRect(88, 62, 10, 12);
                // Boutique door
                x.fillStyle = '#982c64'; x.fillRect(54, 58, 20, 36);
            });
        }
        if (k === 'castle') {
            return cached('castle_' + (p.c || 'peach'), (p.w || 6) * TS, (p.h || 4) * TS + 48, x => {
                const W = (p.w || 6) * TS, Hh = (p.h || 4) * TS + 48;
                const dark = p.c === 'bowser';
                x.fillStyle = 'rgba(0,0,0,0.32)'; x.fillRect(8, Hh - 6, W - 16, 6);
                // Main castle walls
                x.fillStyle = dark ? '#342428' : '#fff2ec';
                x.fillRect(16, 48, W - 32, Hh - 52);
                // Side towers
                x.fillStyle = dark ? '#281a1e' : '#f4dcd4';
                x.fillRect(8, 32, 34, Hh - 36);
                x.fillRect(W - 42, 32, 34, Hh - 36);
                // Spire roofs
                const roofCol = dark ? '#a81818' : '#e83468';
                x.fillStyle = roofCol;
                x.beginPath(); x.moveTo(4, 34); x.lineTo(25, 6); x.lineTo(46, 34); x.closePath(); x.fill();
                x.beginPath(); x.moveTo(W - 46, 34); x.lineTo(W - 25, 6); x.lineTo(W - 4, 34); x.closePath(); x.fill();
                x.beginPath(); x.moveTo(W / 2 - 36, 48); x.lineTo(W / 2, 4); x.lineTo(W / 2 + 36, 48); x.closePath(); x.fill();
                // Stained glass Star / Bowser emblem above gate
                oval(x, W / 2, 66, 13, 13, dark ? '#ff4818' : '#ffd700');
                oval(x, W / 2, 66, 8, 8, dark ? '#ffe040' : '#fff8c8');
                // Grand arched doorway
                x.fillStyle = '#2c1810';
                x.beginPath(); x.arc(W / 2, Hh - 28, 18, Math.PI, 0); x.lineTo(W / 2 + 18, Hh - 4); x.lineTo(W / 2 - 18, Hh - 4); x.closePath(); x.fill();
            });
        }
        if (k === 'house') {
            return cached('c6house_' + (p.w || 4) + '_' + (p.h || 3) + '_' + (p.roof || 'red'), (p.w || 4) * TS, (p.h || 3) * TS + 40, x => {
                const W = (p.w || 4) * TS, Hh = (p.h || 3) * TS + 40;
                x.fillStyle = 'rgba(0,0,0,0.26)'; x.fillRect(6, Hh - 4, W - 12, 4);
                x.fillStyle = '#f8ecd8'; x.fillRect(6, 34, W - 12, Hh - 36);
                x.fillStyle = p.roof === 'blue' ? '#2c78e4' : p.roof === 'gold' ? '#e8a818' : p.roof === 'green' ? '#28a438' : '#dc2c2c';
                x.beginPath(); x.moveTo(0, 36); x.lineTo(W / 2, 4); x.lineTo(W, 36); x.closePath(); x.fill();
                x.fillStyle = '#6c3e1c'; x.fillRect(W / 2 - 10, Hh - 28, 20, 26);
                x.fillStyle = '#ffe878'; x.fillRect(18, 48, 14, 14); x.fillRect(W - 32, 48, 14, 14);
            });
        }
        if (k === 'fountain') {
            return cached('c6fountain', 96, 68, x => {
                oval(x, 48, 60, 42, 10, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#e0d8cc'; x.fillRect(10, 30, 76, 28);
                x.fillStyle = '#2898f8'; oval(x, 48, 38, 32, 10, '#2898f8');
                // Golden Star Pedestal in center
                x.fillStyle = '#d8cec0'; x.fillRect(42, 14, 12, 24);
                oval(x, 48, 10, 10, 10, '#ffd700');
                oval(x, 48, 10, 5, 5, '#fff8c0');
            });
        }
        if (k === 'star_dais') {
            return cached('star_dais', 64, 64, x => {
                oval(x, 32, 56, 26, 7, 'rgba(0,0,0,0.32)');
                x.fillStyle = '#e8dec8'; oval(x, 32, 46, 24, 10, '#e8dec8');
                x.fillStyle = '#ffd700'; oval(x, 32, 24, 12, 12, '#ffd700');
                oval(x, 32, 24, 6, 6, '#ffffff');
            });
        }
        if (k === 'shrine') {
            return cached('c6shrine', 64, 68, x => {
                oval(x, 32, 62, 22, 6, 'rgba(0,0,0,0.3)');
                x.fillStyle = '#e4dcd0'; x.fillRect(14, 34, 36, 28);
                oval(x, 32, 18, 13, 13, '#ffd700');
                oval(x, 32, 18, 7, 7, '#fff8c8');
            });
        }
        if (k === 'flag') {
            return cached('c6flag_' + (p.c || 'red'), 32, 68, x => {
                oval(x, 16, 64, 8, 3, 'rgba(0,0,0,0.28)');
                x.fillStyle = '#e8e8e8'; x.fillRect(14, 8, 4, 56);
                oval(x, 16, 6, 5, 5, '#ffd700');
                x.fillStyle = p.c === 'bowser' ? '#c81818' : p.c === 'green' ? '#24b434' : '#e82428';
                x.beginPath(); x.moveTo(18, 10); x.lineTo(31, 17); x.lineTo(18, 24); x.closePath(); x.fill();
            });
        }
        if (k === 'bowser_statue') {
            return cached('bowser_statue', 64, 72, x => {
                oval(x, 32, 66, 24, 6, 'rgba(0,0,0,0.38)');
                x.fillStyle = '#484044'; x.fillRect(14, 42, 36, 24);
                x.fillStyle = '#62585c'; oval(x, 32, 28, 16, 16, '#62585c');
                // Horns
                x.fillStyle = '#d8c8a8';
                x.beginPath(); x.moveTo(18, 20); x.lineTo(8, 8); x.lineTo(24, 16); x.fill();
                x.beginPath(); x.moveTo(46, 20); x.lineTo(56, 8); x.lineTo(40, 16); x.fill();
                // Glowing lava eyes
                x.fillStyle = '#ff3810'; x.fillRect(24, 24, 5, 4); x.fillRect(35, 24, 5, 4);
            });
        }
        return null;
    }

    function build(arg1, arg2, arg3) {
        let Z, def, api;
        if (arg3) { Z = arg1; def = arg2; api = arg3; }
        else { def = arg1; api = arg2; Z = api.Z; }

        const rows = def.rows.length, cols = def.rows[0].length;
        const g = document.createElement('canvas'); g.width = cols * TS; g.height = rows * TS;
        const x = g.getContext('2d');
        const theme = def.ground || 'meadow', P = PAL[theme] || PAL.meadow;

        if (!Z.lights) Z.lights = [];
        Z.glow = [];
        if (!Z.chests) Z.chests = [];
        if (!Z.pots) Z.pots = [];
        if (!Z.block || Z.block.length !== rows * cols) Z.block = new Uint8Array(rows * cols);
        Z.water = [];

        const at = (tx, ty) => {
            if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) return '^';
            if (Z.tiles && Z.tiles.length === rows * cols) return String.fromCharCode(Z.tiles[ty * cols + tx]);
            return def.rows[ty][tx];
        };

        // 1. Base tiles
        for (let ty = 0; ty < rows; ty++) {
            for (let tx = 0; tx < cols; tx++) {
                const c = at(tx, ty), px = tx * TS, py = ty * TS;
                if (c === '^' || c === '#') { wallTile(x, px, py, tx, ty, P); Z.block[ty * cols + tx] = 1; continue; }
                if (c === '~') { waterTile(x, px, py, tx, ty, P, theme); Z.water.push(px, py); Z.block[ty * cols + tx] = 1; continue; }
                if (c === 'w') { bridgeTile(x, px, py, P); Z.block[ty * cols + tx] = 0; continue; }
                if (c === '=') { pathTile(x, px, py, tx, ty, P); continue; }
                if (c === 'x' || c === 'd') { stoneTile(x, px, py, tx, ty, P); continue; }
                x.fillStyle = P.grass; x.fillRect(px, py, TS, TS);
                if (hash(tx, ty, 0) < 0.28) { x.fillStyle = P.grass2; x.fillRect(px + 4, py + 4, 10, 8); }
                if (c === 'F') {
                    x.fillStyle = P.flower || '#ff3848';
                    x.fillRect(px + 8, py + 10, 4, 4); x.fillRect(px + 20, py + 18, 4, 4);
                    x.fillStyle = '#fff860';
                    x.fillRect(px + 9, py + 11, 2, 2); x.fillRect(px + 21, py + 19, 2, 2);
                }
            }
        }

        // 2. Tile-based 2.5D statics
        for (let ty = 0; ty < rows; ty++) {
            for (let tx = 0; tx < cols; tx++) {
                const c = at(tx, ty), px = tx * TS, py = ty * TS, v = (hash(tx, ty, 2) * 3) | 0, key = (Z.id || 'c6') + ':' + tx + ',' + ty;
                if (c === 'T' || c === 'P') {
                    Z.block[ty * cols + tx] = 1;
                    api.addStatic('tree', tileProp('tree', theme, v), px - 16, py - 52, py + 30, 64, 84);
                } else if (c === 'k') {
                    Z.block[ty * cols + tx] = 1;
                    api.addStatic('bush', tileProp('bush', theme, v), px, py - 2, py + 30, 32, 34);
                } else if (c === 'L') {
                    Z.block[ty * cols + tx] = 1;
                    api.addStatic('lamp', tileProp('lamp', theme, 0), px, py - 28, py + 30, 32, 60);
                    Z.lights.push(px + 16, py - 6); Z.glow.push(px + 16, py - 10, 0);
                } else if (c === 'g' || c === 'q') {
                    api.addStatic(c === 'g' ? 'gate' : 'gate2', tileProp('gate', theme, 0), px, py - 20, py + 32, 32, 52, { tx, ty });
                } else if (c === 'p') {
                    Z.pots.push(api.addStatic('pot', tileProp('pot', theme, 0), px, py, py + 28, 32, 32, { tx, ty, cx: px + 16, cy: py + 18 }));
                } else if (c === 'C') {
                    const open = !!(api.S && api.S.opened && api.S.opened[key]);
                    Z.chests.push(api.addStatic('chest', tileProp('chest', theme, open ? 1 : 0), px, py, py + 28, 32, 32,
                        { key, star: false, open, cx: px + 16, cy: py + 16, img2: tileProp('chest', theme, 1) }));
                }
            }
        }

        // 3. Big Props (Castles, Boutique, Mushroom Houses, Warp Pipes, ? Blocks, Shrines, etc.)
        Z.c6props = [];
        const blocksUsed = (api.S && api.S.c6 && api.S.c6.blocks) || {};
        for (const p of def.props || []) {
            const pw = p.w || 1, ph = p.h || 1;
            for (let y = p.y; y < p.y + ph; y++) {
                for (let k = p.x; k < p.x + pw; k++) {
                    if (y >= 0 && k >= 0 && y < rows && k < cols) {
                        Z.block[y * cols + k] = api.blockOf ? api.blockOf(p) : 1;
                    }
                }
            }
            const sx = p.x * TS, base = (p.y + ph) * TS;
            const bkey = (Z.id || 'c6') + ':' + p.x + ',' + p.y;
            const used = !!(p.k === 'qblock' && blocksUsed[bkey]);
            const img = bigProp(p, used);
            if (!img) continue;
            const s = api.addStatic(p.k, img, sx, base - img.height, base, img.width, img.height, {
                cx: sx + pw * 16,
                cy: base - 8,
                at: p,
                p,
                bkey,
                used,
                imgUsed: p.k === 'qblock' ? bigProp(p, true) : null
            });
            Z.c6props.push(s);
            if (p.k === 'shrine' || p.k === 'star_dais' || p.k === 'fountain') {
                Z.lights.push(sx + 32, base - 24); Z.glow.push(sx + 32, base - 24, 0);
            } else if (p.k === 'qblock' && !used) {
                Z.glow.push(sx + 16, base - 18, 0);
            } else if (p.k === 'bowser_statue') {
                Z.glow.push(sx + 32, base - 28, 2);
            }
        }

        if (P.tint) { x.fillStyle = P.tint; x.fillRect(0, 0, g.width, g.height); }
        Z.ground = g;
    }

    const GLOWC = ['#ffe868', '#5ae0ff', '#ff4818', '#6aff50', '#b068ff'];

    function drawUnder(x, Z, cx, cy, t) {
        const wl = Z.water;
        if (!wl || !wl.length) return;
        const V = window.HM_VIEW || { w: 640, h: 360 }, W = V.w, Hh = V.h;
        const isLava = Z.def && Z.def.ground === 'lava';
        x.fillStyle = isLava ? 'rgba(255,220,50,0.35)' : 'rgba(255,255,255,0.28)';
        for (let i = 0; i < wl.length; i += 2) {
            const px = wl[i] - cx, py = wl[i + 1] - cy;
            if (px < -32 || py < -32 || px > W || py > Hh) continue;
            const k = (t * 0.45 + wl[i] * 0.31 + wl[i + 1] * 0.53) % 48;
            if (k < 24) x.fillRect(px + (k * 0.6) % 24, py + 10, 6, 2);
        }
    }

    const SPARKS = Array.from({ length: 8 }, (_, i) => ({
        x: (i * 83) % 640,
        y: (i * 47) % 360,
        spd: 0.7 + (i % 3) * 0.35,
        phase: i * 0.9
    }));

    function drawOver(x, Z, cx, cy, t, glow) {
        const V = window.HM_VIEW || { w: 640, h: 360 }, W = V.w, Hh = V.h;
        const gl = Z.glow;
        if (gl && glow) {
            for (let i = 0; i < gl.length; i += 3) {
                const px = gl[i] - cx, py = gl[i + 1] - cy;
                if (px < -56 || py < -56 || px > W + 56 || py > Hh + 56) continue;
                const kind = gl[i + 2], s = kind === 2 ? 64 : 48;
                x.globalAlpha = 0.28 + Math.sin(t * 0.08 + gl[i]) * 0.08;
                x.drawImage(glow(GLOWC[kind] || GLOWC[0]), px - s / 2, py - s / 2, s, s);
            }
        }
        x.globalAlpha = 1;
        const theme = Z.def ? Z.def.ground : 'meadow';
        x.fillStyle = theme === 'lava' ? '#ff7820' : theme === 'snow' ? '#ffffff' : theme === 'haunted' ? '#90f0ff' : '#fff498';
        for (let i = 0; i < SPARKS.length; i++) {
            const b = SPARKS[i];
            b.x -= b.spd;
            b.y += Math.sin(t * 0.06 + b.phase) * 0.4;
            if (b.x < -10) { b.x = W + 10; b.y = ((t * 13 + i * 67) % Hh); }
            x.fillRect(b.x, b.y, 3, 3);
        }
    }

    return { build, drawUnder, drawOver, bigProp, PAL };
})();
