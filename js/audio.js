/* Hollowmere: synthesized sound. One AudioContext (created on start, closed on destroy).
 * Music: each zone's loop is rendered once with an OfflineAudioContext and then looped. */
window.HM_AUDIO = (function () {
    'use strict';
    let ac = null, master = null, music = null, sfx = null, voice = null, src = null, cur = -1, vol = { music: 0.7, sfx: 0.8 };
    const loops = {}, pending = {};
    // root (Hz), scale steps, chords (scale degrees), tempo (8ths per second), pad wave
    const SONGS = [
        { root: 196.0, scale: [0, 2, 4, 7, 9, 12, 14, 16], chords: [0, 3, 4, 2], rate: 4, wave: 'triangle' },   // village
        { root: 174.6, scale: [0, 2, 3, 5, 7, 8, 10, 12], chords: [0, 5, 3, 4], rate: 3.5, wave: 'sine' },      // greywood
        { root: 164.8, scale: [0, 1, 5, 7, 8, 12, 13, 17], chords: [0, 2, 0, 3], rate: 3, wave: 'sine' },       // mire
        { root: 146.8, scale: [0, 3, 5, 6, 7, 10, 12, 15], chords: [0, 3, 1, 4], rate: 3, wave: 'sine' },       // isle
        { root: 185.0, scale: [0, 2, 3, 5, 7, 9, 10, 12], chords: [0, 3, 4, 3], rate: 3.5, wave: 'triangle' },  // quarry
        { root: 220.0, scale: [0, 2, 4, 7, 9, 12, 14, 16], chords: [0, 4, 3, 4], rate: 4, wave: 'triangle' },   // village, Lantern lit
        { root: 130.8, scale: [0, 1, 3, 6, 7, 8, 11, 12], chords: [0, 1, 0, 4], rate: 5, wave: 'sawtooth' },    // boss
        { root: 138.6, scale: [0, 1, 3, 5, 7, 8, 10, 12], chords: [0, 5, 1, 4], rate: 2.5, wave: 'sine' },     // the Barrow Crypt
        { root: 155.6, scale: [0, 2, 3, 5, 7, 8, 11, 12], chords: [0, 3, 5, 4], rate: 3, wave: 'triangle' }    // the Deep Mine
    ];

    function start(v) {
        if (ac) return;
        vol = v || vol;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try { ac = new AC(); } catch (e) { ac = null; return; }
        master = ac.createGain(); master.connect(ac.destination);
        music = ac.createGain(); music.connect(master);
        sfx = ac.createGain(); sfx.connect(master);
        voice = ac.createGain(); voice.connect(master);       // spoken dialogue follows the sound-effects volume
        setVolume(vol);
    }
    function setVolume(v) { vol = v || vol; if (!ac) return; music.gain.value = 0.32 * vol.music; sfx.gain.value = 0.55 * vol.sfx; voice.gain.value = 1.1 * vol.sfx; }
    function pause() { if (ac && ac.state === 'running') ac.suspend(); }
    function resume() { if (ac && ac.state === 'suspended') ac.resume(); }
    function close() { stopMusic(); if (ac) { try { ac.close(); } catch (e) {} } ac = null; }

    function render(i) {
        if (loops[i] || pending[i] || !ac) return;
        const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!OAC) return;
        const song = SONGS[i], rate = 22050, beats = 32, len = beats / song.rate;
        const o = new OAC(1, Math.ceil(len * rate), rate);
        const note = n => song.root * Math.pow(2, n / 12);
        const deg = d => song.scale[((d % 8) + 8) % 8];
        for (let b = 0; b < beats; b++) {
            const t = b / song.rate, ch = song.chords[(b / 8) | 0];
            if (b % 8 === 0) {                                    // pad chord
                [0, 2, 4].forEach(k => {
                    const os = o.createOscillator(), g = o.createGain();
                    os.type = song.wave; os.frequency.value = note(deg(ch + k)) / 2;
                    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.6); g.gain.linearRampToValueAtTime(0, t + 8 / song.rate);
                    os.connect(g); g.connect(o.destination); os.start(t); os.stop(t + 8 / song.rate + 0.05);
                });
                const bs = o.createOscillator(), bg = o.createGain();
                bs.type = 'sine'; bs.frequency.value = note(deg(ch)) / 4;
                bg.gain.setValueAtTime(0.25, t); bg.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
                bs.connect(bg); bg.connect(o.destination); bs.start(t); bs.stop(t + 1.7);
            }
            const pat = [0, 2, 4, 2, 5, 4, 2, 4];                 // arpeggio
            if ((b * 7 + i) % 5 !== 3) {
                const os = o.createOscillator(), g = o.createGain();
                os.type = 'triangle'; os.frequency.value = note(deg(ch + pat[b % 8]));
                g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.13, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
                os.connect(g); g.connect(o.destination); os.start(t); os.stop(t + 0.55);
            }
        }
        pending[i] = true;
        o.startRendering().then(buf => { loops[i] = buf; pending[i] = false; if (cur === i) play(i, true); }).catch(() => { pending[i] = false; });
    }

    function stopMusic() { if (src) { try { src.stop(); } catch (e) {} src.disconnect(); src = null; } }
    function play(i, force) {
        if (!ac) return;
        if (cur === i && !force && src) return;
        cur = i; stopMusic();
        if (!loops[i]) { render(i); return; }
        src = ac.createBufferSource(); src.buffer = loops[i]; src.loop = true; src.connect(music); src.start();
    }

    let noise = null;
    function getNoise() {
        if (noise) return noise;
        noise = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate);
        const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        return noise;
    }
    function tone(f1, f2, dur, type, v, delay) {
        if (!ac || ac.state !== 'running') return;
        const t = ac.currentTime + (delay || 0), os = ac.createOscillator(), g = ac.createGain();
        os.type = type; os.frequency.setValueAtTime(f1, t); if (f2) os.frequency.exponentialRampToValueAtTime(f2, t + dur);
        g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        os.connect(g); g.connect(sfx); os.start(t); os.stop(t + dur + 0.02);
    }
    function hiss(dur, v, freq) {
        if (!ac || ac.state !== 'running') return;
        const t = ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = getNoise(); f.type = 'bandpass'; f.frequency.value = freq || 1800;
        g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        s.connect(f); f.connect(g); g.connect(sfx); s.start(t); s.stop(t + dur);
    }
    const FX = {
        swing: () => hiss(0.12, 0.35, 2600),
        hit: () => { tone(220, 90, 0.12, 'square', 0.18); hiss(0.08, 0.3, 900); },
        hurt: () => tone(300, 80, 0.25, 'sawtooth', 0.2),
        die: () => { tone(400, 60, 0.35, 'triangle', 0.25); hiss(0.25, 0.2, 600); },
        coin: () => { tone(988, 0, 0.08, 'square', 0.08); tone(1319, 0, 0.12, 'square', 0.08, 0.07); },
        pick: () => { tone(660, 0, 0.1, 'triangle', 0.2); tone(990, 0, 0.18, 'triangle', 0.2, 0.08); },
        talk: () => tone(520, 0, 0.05, 'square', 0.05),
        move: () => tone(700, 0, 0.04, 'triangle', 0.08),
        ok: () => { tone(600, 0, 0.06, 'triangle', 0.12); tone(900, 0, 0.08, 'triangle', 0.12, 0.05); },
        level: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0, 0.25, 'triangle', 0.18, i * 0.09)); },
        quest: () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0, 0.4, 'triangle', 0.16, i * 0.11)); },
        roar: () => { tone(110, 45, 0.7, 'sawtooth', 0.22); hiss(0.6, 0.2, 400); },
        cut: () => { hiss(0.2, 0.4, 3500); tone(800, 300, 0.15, 'triangle', 0.1); },
        shoot: () => tone(500, 200, 0.18, 'sine', 0.12),
        slam: () => { tone(80, 30, 0.5, 'sine', 0.4); hiss(0.4, 0.3, 300); },
        door: () => { tone(120, 90, 0.6, 'sawtooth', 0.12); hiss(0.5, 0.15, 500); },
        heal: () => { tone(500, 1000, 0.3, 'sine', 0.18); },
        bow: () => { tone(900, 300, 0.12, 'triangle', 0.18); hiss(0.1, 0.2, 4000); },
        gun: () => { hiss(0.35, 0.6, 700); tone(160, 40, 0.3, 'square', 0.25); },
        pot: () => { hiss(0.18, 0.4, 2500); tone(700, 200, 0.1, 'square', 0.08); },
        chest: () => { tone(300, 200, 0.2, 'sawtooth', 0.1); [523, 784, 1047].forEach((f, i) => tone(f, 0, 0.3, 'triangle', 0.14, 0.15 + i * 0.08)); },
        crit: () => { tone(1200, 400, 0.15, 'square', 0.12); hiss(0.12, 0.35, 3000); },
        buy: () => { tone(880, 0, 0.08, 'square', 0.08); tone(1320, 0, 0.15, 'square', 0.08, 0.08); },
        equip: () => { hiss(0.1, 0.25, 1500); tone(400, 600, 0.12, 'triangle', 0.12); }
    };
    function fx(name) { const f = FX[name]; if (f && ac) f(); }

    // while someone speaks, the music steps back
    function duck(on) { if (ac && music) music.gain.setTargetAtTime((on ? 0.12 : 0.32) * vol.music, ac.currentTime, 0.15); }

    return { start, setVolume, pause, resume, close, play, fx, prepare: render, duck, ctx: () => ac, voiceOut: () => voice };
})();
