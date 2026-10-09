/* Hollowmere: the Kenney art (www.kenney.nl, CC0): Tiny Town, Tiny Dungeon, Roguelike Characters.
 * 16 x 16 pixel sprites drawn at 2x and more. Heroes are built from layers (body, clothes, hair,
 * helmet, weapon) so the gear you wear shows; movement is animated in code (bob, tilt, lunge,
 * flash). If the images can't load, the game keeps its own drawn art (see HM_ART). */
window.HM_KN = (function () {
    'use strict';
    const IMG = {}, CACHE = {};
    let ok = false;
    // sheets: Tiny Town and Tiny Dungeon are 12 x 11 tiles, no spacing; characters 54 x 12 with 1 px spacing
    const SHEET = { town: { cols: 12, gap: 0 }, dungeon: { cols: 12, gap: 0 }, chars: { cols: 54, gap: 1 } };

    function load(version, progress, done) {
        const names = Object.keys(SHEET);
        let left = names.length, failed = false;
        names.forEach(n => {
            const im = new Image();
            im.onload = () => { IMG[n] = im; if (--left === 0) { ok = !failed; done(ok); } else progress(1 - left / names.length); };
            im.onerror = () => { failed = true; if (--left === 0) { ok = false; done(false); } };
            im.src = 'assets/kenney/' + n + '.png?v=' + version;
        });
    }

    // one 16 x 16 tile as its own small canvas (cached)
    function tile(sheet, i) {
        const key = sheet + i;
        if (CACHE[key]) return CACHE[key];
        const s = SHEET[sheet], c = document.createElement('canvas'); c.width = 16; c.height = 16;
        const x = (i % s.cols) * (16 + s.gap), y = ((i / s.cols) | 0) * (16 + s.gap);
        c.getContext('2d').drawImage(IMG[sheet], x, y, 16, 16, 0, 0, 16, 16);
        CACHE[key] = c;
        return c;
    }
    // a white silhouette of a sprite, for the hit flash
    function white(c) {
        if (c.white) return c.white;
        const w = document.createElement('canvas'); w.width = c.width; w.height = c.height;
        const x = w.getContext('2d'); x.drawImage(c, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#ffffff'; x.fillRect(0, 0, w.width, w.height);
        c.white = w;
        return w;
    }

    /* ---------- heroes: layers from Roguelike Characters ---------- */
    const HERO = [{ body: 0, shirt: 10, hair: 19 }, { body: 108, shirt: 6, hair: 24 }];
    const GEAR = {
        // weapons (guns are drawn in code: the pack has none)
        stick: 474, iron_sword: 422, steel_sword: 476, knight_blade: 530, hunter_bow: 53, long_bow: 106,
        // helmets, body armour, boots
        leather_cap: 137, iron_helm: 82, knight_helm: 28,
        padded_vest: 338, chainmail: 284, plate_armor: 226,
        leather_boots: 58, swift_boots: 220, iron_greaves: 112,
        tide_blade: 530, gale_bow: 106, coral_helm: 28, tide_mail: 226, wave_boots: 220, mage_robe: 14
    };
    function hero(i, weapon, head, body, feet) {
        const key = 'h' + i + weapon + head + body + feet;
        if (CACHE[key]) return CACHE[key];
        const h = HERO[i], c = document.createElement('canvas'); c.width = 16; c.height = 16;
        const x = c.getContext('2d');
        const layer = n => { if (n !== undefined && n !== null) x.drawImage(tile('chars', n), 0, 0); };
        layer(h.body); layer(3); layer(GEAR[feet] !== undefined ? GEAR[feet] : 4);
        layer(GEAR[body] !== undefined ? GEAR[body] : h.shirt);
        layer(h.hair); if (head) layer(GEAR[head]);
        if (GEAR[weapon] !== undefined) layer(GEAR[weapon]);
        CACHE[key] = c;
        return c;
    }

    /* ---------- villagers and monsters: Tiny Dungeon ---------- */
    const NPC = { maren: 100, tobin: 86, sela: 111, corvin: 84, lira: 99, hana: 88, pip: 98, bram: 87, odo: 96, tam: 112, miner: 97, kid: 98, fisher: 85 };
    // the pack has no wolf, skeleton or boar: those keep the game's own drawings
    const FOE = { wisp: [121, 2], crawler: [108, 2], mite: [110, 2], bat: [120, 2],
                  warden: [108, 4], knight: [97, 2.8], sentinel: [109, 4], shade: [121, 3.6] };
    // sprite centred on x, standing on y; s = scale (2 = 32 px), flip = face left, flash = white, alpha
    function sprite(ctx, c, x, y, s, flip, flash, rot) {
        const w = 16 * s;
        ctx.save(); ctx.translate(x, y);
        if (rot) ctx.rotate(rot);
        if (flip) ctx.scale(-1, 1);
        ctx.drawImage(flash ? white(c) : c, -w / 2, -w, w, w);
        ctx.restore();
    }
    function shadow(ctx, x, y, r) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.38, 0, 0, 6.2832); ctx.fill(); }
    function npc(ctx, id, x, y, scale, flip, t) {
        const n = NPC[id]; if (n === undefined) return false;
        const s = 2 * (scale || 1), bob = Math.sin(t * 0.06 + x) * 0.6;
        shadow(ctx, x, y, 7 * (scale || 1));
        sprite(ctx, tile('dungeon', n), x, y + bob * 0.2, s, flip, false, 0);
        return true;
    }
    function foe(ctx, t, x, y, flip, flash, walk, big) {
        const f = FOE[t]; if (!f) return false;
        const s = f[1] * (big || 1), fly = t === 'bat' || t === 'wisp' || t === 'shade';
        const bob = fly ? Math.sin(walk) * 3 - 10 : -Math.abs(Math.sin(walk * 1.5)) * 1.5;
        shadow(ctx, x, y, 5 * s);
        sprite(ctx, tile('dungeon', f[0]), x, y + bob, s, flip, flash, fly ? 0 : Math.sin(walk * 1.5) * 0.06);
        return true;
    }
    function bossSprite(t) { const f = FOE[t]; return f ? tile('dungeon', f[0]) : null; }

    /* ---------- the world: ground tiles, trees, walls, houses ---------- */
    function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
    const TINT = { forest: 'rgba(10,40,25,0.28)', mire: 'rgba(60,55,20,0.22)', stone: '', crypt: 'rgba(16,14,34,0.55)', mine: 'rgba(20,10,5,0.25)', grass: '' };
    // a soft patch of colour (fades out to its edge), squashed into an ellipse
    function blob(x, gx, gy, r, sy, rot, rgb, a) {
        x.save(); x.translate(gx, gy); x.rotate(rot); x.scale(1, sy);
        const g = x.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
        x.fillStyle = g; x.fillRect(-r, -r, r * 2, r * 2); x.restore();
    }
    // draws the Kenney ground over the drawn one (water, planks and doorways stay as they are)
    function ground(canvas, zone, theme) {
        const x = canvas.getContext('2d'); x.imageSmoothingEnabled = false;
        const cols = zone.cols, rows = zone.rows, at = (cx, cy) => (cx < 0 || cy < 0 || cx >= cols || cy >= rows) ? '#' : zone.ch(cx, cy);
        const isPath = (cx, cy) => at(cx, cy) === '=' || at(cx, cy) === 'g';
        const dungeon = theme === 'crypt' || theme === 'mine';
        // one base tile per kind of ground, turned at random, so no square pattern shows; the variety
        // comes afterwards from soft patches, tufts and flowers placed freely across tile edges
        const natural = new Path2D(), sandy = new Path2D(), floor = new Path2D(), wet = new Path2D(), flowers = [];
        for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
            let c = at(tx, ty); const px = tx * 32, py = ty * 32;
            // a single grass tile in the middle of sand would show as a square: it becomes sand
            if (c === '.' && at(tx - 1, ty) === 's' && at(tx + 1, ty) === 's' && at(tx, ty - 1) === 's' && at(tx, ty + 1) === 's') c = 's';
            if (c === '~') wet.rect(px, py, 32, 32);
            if (c === '~' || c === 'w' || c === 'D') continue;
            let sh = 'town', i = 0, turn = true;
            if (c === '=' || c === 'g') {                       // dirt path with grass edges (9-slice)
                const n = isPath(tx, ty - 1), s = isPath(tx, ty + 1), w = isPath(tx - 1, ty), e = isPath(tx + 1, ty);
                const col = w && e ? 1 : !w && e ? 0 : w && !e ? 2 : 1, row = n && s ? 1 : !n && s ? 0 : n && !s ? 2 : 1;
                i = theme === 'stone' ? 48 : [12, 13, 14, 24, 25, 26, 36, 37, 38][row * 3 + col]; if (theme === 'stone') sh = 'dungeon';
                turn = i === 25 || i === 48;                    // only the middle of a path may be turned
                if (theme === 'stone') sandy.rect(px, py, 32, 32);
            }
            else if (c === 's') { sh = 'dungeon'; i = 48; sandy.rect(px, py, 32, 32); }
            else if (c === 'm') i = 25;
            else if (c === 'x') { if (theme === 'mine') { sh = 'dungeon'; i = 40; } else i = 109; floor.rect(px, py, 32, 32); }
            else if (c === '#' || c === 't') { sh = 'dungeon'; i = 40; if (!dungeon && theme !== 'stone') { sh = 'town'; i = 109; } }
            else if (theme === 'crypt') { i = 109; floor.rect(px, py, 32, 32); }
            else if (theme === 'mine') { sh = 'dungeon'; i = 0; floor.rect(px, py, 32, 32); }
            else if (theme === 'stone') { sh = 'dungeon'; i = 48; sandy.rect(px, py, 32, 32); }
            else { natural.rect(px, py, 32, 32); if (c === 'F') flowers.push(px, py); }
            const fx = turn && hash(tx, ty, 21) < 0.5, fy = turn && hash(tx, ty, 23) < 0.5;
            if (fx || fy) { x.save(); x.translate(px + 16, py + 16); x.scale(fx ? -1 : 1, fy ? -1 : 1); x.drawImage(tile(sh, i), -16, -16, 32, 32); x.restore(); }
            else x.drawImage(tile(sh, i), px, py, 32, 32);
            if (c === 'm') { x.fillStyle = 'rgba(45,32,12,0.45)'; x.fillRect(px, py, 32, 32); }      // wet mud
        }
        const n = cols * rows;
        // grass: big soft patches of lighter and darker green, and little tufts, all off the grid
        x.save(); x.clip(natural);
        for (let k = 0; k < n * 0.45; k++) {
            const gx = hash(k, 1, 31) * cols * 32, gy = hash(k, 2, 33) * rows * 32, r = 18 + hash(k, 3, 35) * 46;
            if (hash(k, 4, 37) < 0.55) blob(x, gx, gy, r * 1.4, 0.55 + hash(k, 5, 39) * 0.4, hash(k, 6, 41) * 3, '25,70,15', 0.16); else blob(x, gx, gy, r * 1.4, 0.55 + hash(k, 5, 39) * 0.4, hash(k, 6, 41) * 3, '255,250,190', 0.12);
        }
        for (let k = 0; k < n * 1.6; k++) {
            const gx = (hash(k, 7, 43) * cols * 32) | 0, gy = (hash(k, 8, 45) * rows * 32) | 0;
            x.fillStyle = 'rgba(30,85,25,0.55)'; x.fillRect(gx, gy, 1, 3); x.fillRect(gx + 2, gy - 1, 1, 4); x.fillRect(gx + 4, gy + 1, 1, 2);
            x.fillStyle = 'rgba(190,235,120,0.45)'; x.fillRect(gx + 2, gy - 1, 1, 1);
        }
        x.restore();
        // flowers, scattered freely inside their tiles
        for (let k = 0; k < flowers.length; k += 2) for (let j = 0; j < 5; j++) {
            const fx = flowers[k] + 3 + hash(flowers[k], flowers[k + 1], j) * 26, fy = flowers[k + 1] + 3 + hash(flowers[k + 1], flowers[k], j + 9) * 26;
            x.fillStyle = ['#ffffff', '#ffd23f', '#ff8ab0', '#9ab8ff'][(hash(fx | 0, fy | 0, 5) * 4) | 0];
            x.fillRect(fx - 1, fy, 3, 1); x.fillRect(fx, fy - 1, 1, 3); x.fillStyle = '#e8a020'; x.fillRect(fx, fy, 1, 1);
        }
        // sand and stone: gentle light and shade; dungeon floors: shade and a few cracks
        x.save(); x.clip(sandy);
        for (let k = 0; k < n * 0.25; k++) { const gx = hash(k, 9, 47) * cols * 32, gy = hash(k, 10, 49) * rows * 32, r = 16 + hash(k, 11, 51) * 40; blob(x, gx, gy, r * 1.4, 0.6, 0, hash(k, 12, 53) < 0.5 ? '90,60,20' : '255,255,230', 0.13); }
        x.restore();
        // water: deeper and lighter patches, so it reads as one surface
        x.save(); x.clip(wet);
        for (let k = 0; k < n * 0.15; k++) { const gx = hash(k, 18, 65) * cols * 32, gy = hash(k, 19, 67) * rows * 32, r = 30 + hash(k, 20, 69) * 60; blob(x, gx, gy, r, 0.5, 0, hash(k, 21, 71) < 0.6 ? '5,25,50' : '150,210,240', hash(k, 21, 71) < 0.6 ? 0.25 : 0.1); }
        x.restore();
        x.save(); x.clip(floor);
        for (let k = 0; k < n * 0.25; k++) { const gx = hash(k, 13, 55) * cols * 32, gy = hash(k, 14, 57) * rows * 32, r = 16 + hash(k, 15, 59) * 40; blob(x, gx, gy, r * 1.4, 0.6, 0, '0,0,0', 0.16); }
        x.strokeStyle = 'rgba(0,0,0,0.25)'; x.lineWidth = 1;
        for (let k = 0; k < n * 0.12; k++) { const gx = hash(k, 16, 61) * cols * 32, gy = hash(k, 17, 63) * rows * 32; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + 5, gy + 3); x.lineTo(gx + 8, gy + 1); x.stroke(); }
        x.restore();
        if (TINT[theme]) { x.fillStyle = TINT[theme]; x.fillRect(0, 0, canvas.width, canvas.height); }
        return canvas;
    }
    function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; fn(x); c.lw = w; c.lh = h; return c; }
    const T = (sheet, i) => tile(sheet, i);
    // trees: one Tiny Town tree, drawn tall so the forest has depth
    function trees(theme) {
        const key = 'trees' + theme; if (CACHE[key]) return CACHE[key];
        const list = (theme === 'forest' ? [16, 28, 16] : theme === 'mire' ? [28, 5, 16] : [16, 28, 16]).map((n, k) => mk(48, 56, x => {
            x.fillStyle = 'rgba(0,0,0,0.25)'; x.beginPath(); x.ellipse(24, 52, 16, 5, 0, 0, 6.2832); x.fill();
            x.drawImage(T('town', n), 0, 4, 48, 48);
            if (theme === 'forest') { x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(10,40,30,0.3)'; x.fillRect(0, 0, 48, 56); }
        }));
        CACHE[key] = list;
        return list;
    }
    // a raised wall block: top face, and a front face when nothing is below it
    function wall(theme, front) {
        const key = 'wall' + theme + front; if (CACHE[key]) return CACHE[key];
        // the mine: grey rock walls over its brown earth floor, so the two never look alike
        const top = theme === 'mine' || theme === 'crypt' || theme === 'stone' ? T('dungeon', 40) : T('town', 109);
        const face = theme === 'mine' || theme === 'crypt' || theme === 'stone' ? T('dungeon', 40) : T('town', 77);
        const c = mk(32, 48, x => {
            x.drawImage(top, 0, 0, 32, 32);
            if (theme === 'crypt') { x.fillStyle = 'rgba(16,14,34,0.55)'; x.fillRect(0, 0, 32, 32); }
            if (theme === 'mine') { x.fillStyle = 'rgba(30,32,40,0.45)'; x.fillRect(0, 0, 32, 32); x.fillStyle = 'rgba(255,220,160,0.18)'; x.fillRect(0, 0, 32, 2); }
            x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(0, 28, 32, 4);
            if (front) { x.drawImage(face, 0, 4, 16, 8, 0, 32, 32, 16); x.fillStyle = theme === 'mine' ? 'rgba(10,10,16,0.55)' : 'rgba(0,0,0,0.25)'; x.fillRect(0, 32, 32, theme === 'mine' ? 16 : 2); }
        });
        CACHE[key] = c;
        return c;
    }
    // houses: roof rows over a wall row with a window and a door (footprint w x h tiles)
    function building(kind, w, h) {
        const key = 'b' + kind + w + h; if (CACHE[key]) return CACHE[key];
        const grey = kind !== 'house', stone = kind === 'forge';
        const roof = grey ? [48, 49, 50, 51, 60, 61, 62] : [52, 53, 54, 55, 64, 65, 66];
        const walls = stone ? [76, 77, 88, 89, 79] : [72, 73, 84, 85, 75];
        const c = mk(w * 32, (h + 1) * 32, x => {
            for (let r = 0; r < h; r++) for (let k = 0; k < w; k++) {
                const last = r === h - 1;
                const n = last ? (k === 0 ? roof[4] : k === w - 1 ? roof[6] : roof[5]) : (k === 0 ? roof[0] : k === w - 1 ? roof[2] : (r === 0 && k === w - 2 && kind === 'forge') ? roof[3] : roof[1]);
                x.drawImage(T('town', n), k * 32, r * 32, 32, 32);
            }
            for (let k = 0; k < w; k++) {
                const n = k === 0 ? walls[0] : k === w - 1 ? walls[4] : k === 2 ? walls[3] : walls[2];
                x.drawImage(T('town', n), k * 32, h * 32, 32, 32);
            }
            if (kind === 'forge') { x.drawImage(T('dungeon', 74), (w - 1) * 32 + 4, h * 32 + 8, 24, 24); }
            if (kind === 'shop') { x.drawImage(T('dungeon', 115), 4, h * 32 - 6, 20, 20); x.drawImage(T('dungeon', 114), w * 32 - 24, h * 32 - 6, 20, 20); }
        });
        CACHE[key] = c;
        return c;
    }
    const PROPS = { rock: ['dungeon', 102], pot: ['town', 107], chest: ['dungeon', 90], chestOpen: ['dungeon', 91], star: ['dungeon', 89], starOpen: ['dungeon', 91],
                    ore: ['dungeon', 24], gate: ['dungeon', 41], tablet: ['dungeon', 65], sprout: ['town', 17] };
    function prop(name, size) {
        const key = 'p' + name + size; if (CACHE[key]) return CACHE[key];
        const p = PROPS[name], s = size || 32;
        const c = mk(s, s, x => x.drawImage(T(p[0], p[1]), 0, 0, s, s));
        CACHE[key] = c;
        return c;
    }
    // a gear icon for drops and lists
    function gearIcon(id) { const n = GEAR[id]; return n !== undefined ? tile('chars', n) : null; }

    return { load, get ok() { return ok; }, tile, white, hero, npc, foe, bossSprite, sprite, shadow, ground, trees, wall, building, prop, gearIcon, NPC };
})();
