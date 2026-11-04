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
        putImageData() {}
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
});

test('game.js dispatches each Chapter 4 and Chapter 5 mount to its own dedicated MOUNTART renderer in mountIcon and drawPlayer', () => {
    const gameCode = fs.readFileSync('js/game.js', 'utf8');
    for (const m of ['shadowmane', 'frostfang', 'nightmare', 'bloodfang', 'bonecharger', 'nightterror']) {
        assert.ok(gameCode.includes(`MOUNTART.${m}(`), `js/game.js must explicitly call MOUNTART.${m}(...)`);
    }
});
