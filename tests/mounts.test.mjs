import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';

const EXPECTED_SPRITES = {
    shadowmane:  { w: 672, h: 384, ct: 6 },
    nightmare:   { w: 672, h: 384, ct: 6 },
    horse_ns:    { w: 672, h: 192, ct: 6 },
    wolf:        { w: 384, h: 256, ct: 6 },
    frostfang:   { w: 384, h: 256, ct: 6 },
    bloodfang:   { w: 384, h: 256, ct: 6 },
    bonecharger: { w: 384, h: 680, ct: 6 },
    nightterror: { w: 573, h: 644, ct: 6 },
    dragon:      { w: 573, h: 644, ct: 6 }
};

test('All Chapter 1-5 mount sprite sheets exist, are valid RGBA PNGs with expected dimensions, and are distinct', () => {
    const hashes = new Map();
    for (const [name, spec] of Object.entries(EXPECTED_SPRITES)) {
        const file = `assets/mounts/${name}.png`;
        assert.ok(fs.existsSync(file), `Missing mount sprite sheet: ${file}`);
        const buf = fs.readFileSync(file);
        assert.equal(buf.readUInt32BE(0), 0x89504e47, `${file} must have valid PNG signature`);
        const w = buf.readUInt32BE(16);
        const h = buf.readUInt32BE(20);
        const ct = buf[25];
        assert.equal(w, spec.w, `${file} width mismatch`);
        assert.equal(h, spec.h, `${file} height mismatch`);
        assert.equal(ct, spec.ct, `${file} must be RGBA colorType 6`);

        const hash = crypto.createHash('sha256').update(buf).digest('hex');
        for (const [otherName, otherHash] of hashes.entries()) {
            assert.notEqual(hash, otherHash, `${name}.png and ${otherName}.png must not be identical files`);
        }
        hashes.set(name, hash);
    }
});

test('HM_MOUNTART exposes dedicated 4-directional renderers for all Chapter 4 and Chapter 5 mounts', () => {
    const code = fs.readFileSync('js/mounts.js', 'utf8');
    const loadedSrcs = [];
    const fakeImg = () => ({
        width: 672,
        height: 384,
        set onload(fn) { this._onload = fn; },
        set src(v) { loadedSrcs.push(v); if (this._onload) this._onload(); }
    });
    const ctxCalls = [];
    const fakeCtx = {
        fillStyle: '',
        globalAlpha: 1,
        beginPath() {},
        ellipse() {},
        fill() {},
        fillRect() {},
        save() {},
        restore() {},
        translate() {},
        scale() {},
        rotate() {},
        moveTo() {},
        quadraticCurveTo() {},
        drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) {
            ctxCalls.push({ sx, sy, sw, sh, dx, dy, dw, dh });
        },
        getImageData(x, y, w, h) {
            return { data: new Uint8ClampedArray(w * h * 4) };
        },
        putImageData() {},
        createImageData(w, h) {
            return { data: new Uint8ClampedArray(w * h * 4) };
        }
    };
    const sandbox = {
        window: {},
        Image: function () { return fakeImg(); },
        document: {
            createElement() {
                return { width: 0, height: 0, getContext: () => fakeCtx };
            }
        },
        Uint8ClampedArray,
        Math,
        Date
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);

    const M = sandbox.window.HM_MOUNTART;
    assert.ok(M, 'window.HM_MOUNTART must be defined');
    M.load('test');

    for (const sheet of ['shadowmane', 'frostfang', 'nightmare', 'bloodfang', 'bonecharger', 'nightterror', 'wolf', 'horse_ns']) {
        assert.ok(loadedSrcs.some(s => s.includes(`assets/mounts/${sheet}.png`)), `HM_MOUNTART.load must load ${sheet}.png`);
        assert.equal(M.has(sheet), true, `HM_MOUNTART.has('${sheet}') should be true after load`);
    }

    // Verify each Chapter 4 & 5 mount draws from its sprite sheet in all 4 directions (N: dir=1, S: dir=0, W: dir=2 fx=-1, E: dir=2 fx=1)
    for (const m of ['shadowmane', 'frostfang', 'nightmare', 'bloodfang']) {
        const rowsDrawn = new Set();
        for (const [dir, fx] of [[1, 1], [0, 1], [2, -1], [2, 1]]) {
            const before = ctxCalls.length;
            const ok = M[m](fakeCtx, 100, 100, 2.5, dir, fx, 1, true, 12, 0);
            assert.equal(ok, true, `MOUNTART.${m} must return true when sprite is loaded`);
            assert.ok(ctxCalls.length > before, `MOUNTART.${m} must call ctx.drawImage for dir=${dir}, fx=${fx}`);
            rowsDrawn.add(ctxCalls[ctxCalls.length - 1].sy);
        }
        assert.equal(rowsDrawn.size, 4, `MOUNTART.${m} must select 4 distinct directional rows for N, S, W, E`);
    }

    // Verify flying mounts bonecharger and nightterror draw 4 distinct rows
    for (const m of ['bonecharger', 'nightterror']) {
        const rowsDrawn = new Set();
        for (const [dir, fx] of [[1, 1], [0, 1], [2, -1], [2, 1]]) {
            const before = ctxCalls.length;
            const ok = m === 'bonecharger'
                ? M.bonecharger(fakeCtx, 100, 100, 20, 2.5, dir, fx, 1, true, 14, null)
                : M.nightterror(fakeCtx, 100, 100, 24, dir, fx < 0, 14, 0.6, false);
            assert.equal(ok, true, `MOUNTART.${m} must return true`);
            assert.ok(ctxCalls.length > before, `MOUNTART.${m} must call ctx.drawImage`);
            rowsDrawn.add(ctxCalls[ctxCalls.length - 1].sy);
        }
        assert.equal(rowsDrawn.size, 4, `MOUNTART.${m} must select 4 distinct directional rows for N, S, W, E`);
    }

    // Verify Bone Charger idle vs moving and East vs West row mapping
    const bcIdleCalls = [];
    for (const walkVal of [0, 1, 2, 3, 4, 5]) {
        const before = ctxCalls.length;
        M.bonecharger(fakeCtx, 100, 100, 20, walkVal, 2, 1, 1.0, false, walkVal * 7, null);
        assert.ok(ctxCalls.length > before);
        bcIdleCalls.push(ctxCalls[ctxCalls.length - 1]);
    }
    // When moving === false, Bone Charger must always use neutral standing column (col = 1 -> sx = 128)
    for (const call of bcIdleCalls) {
        assert.equal(call.sx, 128, 'Bone Charger must stay on standing column (col=1, sx=128) when moving=false');
    }
    // When moving === true, Bone Charger must cycle across multiple columns
    const bcMovingCols = new Set();
    for (const walkVal of [0, 1, 2, 3]) {
        M.bonecharger(fakeCtx, 100, 100, 20, walkVal, 2, 1, 1.0, true, 10, null);
        bcMovingCols.add(ctxCalls[ctxCalls.length - 1].sx);
    }
    assert.ok(bcMovingCols.size >= 2, 'Bone Charger must animate across walking columns when moving=true');

    // Verify Bone Charger East (fx > 0 -> Row 1 -> sy = 170) vs West (fx < 0 -> Row 3 -> sy = 510)
    M.bonecharger(fakeCtx, 100, 100, 20, 0, 2, 1, 1.0, false, 0, null);
    const eastCall = ctxCalls[ctxCalls.length - 1];
    assert.equal(eastCall.sy, 170, 'Bone Charger facing right (fx=1) must use Row 1 (sy=170)');

    M.bonecharger(fakeCtx, 100, 100, 20, 0, 2, -1, 1.0, false, 0, null);
    const westCall = ctxCalls[ctxCalls.length - 1];
    assert.equal(westCall.sy, 510, 'Bone Charger facing left (fx=-1) must use Row 3 (sy=510)');
});

test('Nightmare Steed pre-bakes 4 low-cost fire frames at load and cycles them across ticks with zero per-frame allocation', () => {
    const code = fs.readFileSync('js/mounts.js', 'utf8');
    let createdCanvases = 0;
    const drawnImages = [];
    const fakeImg = () => ({
        width: 672,
        height: 384,
        set onload(fn) { this._onload = fn; },
        set src(v) { if (this._onload) this._onload(); }
    });
    const makeCtx = () => ({
        fillStyle: '',
        globalAlpha: 1,
        beginPath() {},
        ellipse() {},
        fill() {},
        fillRect() {},
        save() {},
        restore() {},
        translate() {},
        scale() {},
        rotate() {},
        moveTo() {},
        quadraticCurveTo() {},
        drawImage(img) { drawnImages.push(img); },
        getImageData(x, y, w, h) {
            const data = new Uint8ClampedArray(w * h * 4);
            // Seed a warm orange pixel at center so fire baker exercises its color ramp + tongue logic
            const idx = ((10 * w) + 10) * 4;
            data[idx] = 230; data[idx + 1] = 110; data[idx + 2] = 25; data[idx + 3] = 255;
            return { data };
        },
        putImageData() {},
        createImageData(w, h) {
            return { data: new Uint8ClampedArray(w * h * 4) };
        }
    });
    const sandbox = {
        window: {},
        Image: function () { return fakeImg(); },
        document: {
            createElement() {
                createdCanvases++;
                return { id: 'canvas_' + createdCanvases, width: 0, height: 0, getContext: makeCtx };
            }
        },
        Uint8ClampedArray,
        Math,
        Date
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);

    const M = sandbox.window.HM_MOUNTART;
    M.load('test');
    const canvasesAtLoad = createdCanvases;
    assert.ok(canvasesAtLoad >= 4, 'Nightmare fire baker must pre-bake 4 canvas frames at load');

    const renderCtx = makeCtx();
    drawnImages.length = 0;
    for (const tick of [0, 4, 8, 12]) {
        M.nightmare(renderCtx, 100, 100, 2.5, 2, 1, 0, false, tick, 0);
    }
    assert.equal(createdCanvases, canvasesAtLoad, 'Nightmare render must allocate zero new canvases at runtime');
    const uniqueFrames = new Set(drawnImages.map(im => im.id));
    assert.equal(uniqueFrames.size, 4, 'Nightmare render must cycle through 4 distinct pre-baked fire canvases');
});

test('game.js dispatches each Chapter 4 and Chapter 5 mount and exposes Companion Pets menu and pet renaming', () => {
    const gameCode = fs.readFileSync('js/game.js', 'utf8');
    for (const m of ['shadowmane', 'frostfang', 'nightmare', 'bloodfang', 'bonecharger', 'nightterror']) {
        assert.ok(gameCode.includes(`MOUNTART.${m}(`), `js/game.js must explicitly call MOUNTART.${m}(...)`);
    }
    assert.ok(gameCode.includes('function petScreen('), 'js/game.js must define petScreen()');
    assert.ok(gameCode.includes('function renamePetScreen('), 'js/game.js must define renamePetScreen()');
    assert.ok(gameCode.includes('function setPetName('), 'js/game.js must define setPetName()');
    assert.ok(gameCode.includes('function petName('), 'js/game.js must define petName()');
});

