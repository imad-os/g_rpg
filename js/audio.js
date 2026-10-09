/* Hollowmere: synthesized sound. One AudioContext (created on start, closed on destroy).
 * Music: each zone's loop is rendered once with an OfflineAudioContext and then looped. */
window.HM_AUDIO = (function () {
    'use strict';
    let ac = null, master = null, music = null, sfx = null, voice = null, src = null, cur = -1, vol = { music: 0.7, sfx: 0.8 };
    const loops = {}, pending = {}, SPECS = {};          // SPECS: songs a chapter adds (by name)
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
        if (SPECS[i]) return renderSpec(i);
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

    /* A chapter's songs: a pad, a bass, an arpeggio, a melody built from the scale, drums and an echo.
     * spec: { root, scale[8], chords[n], rate (8ths/s), beats, pad, lead ('flute'|'brass'|'bell'|'pluck'),
     *         drums ('none'|'soft'|'march'|'war'|'tom'), echo (0..0.5), busy (0..1), seed } */
    function renderSpec(key) {
        const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!OAC) return;
        const sp = SPECS[key], rate = 22050, beats = sp.beats || 64, len = beats / sp.rate;
        const o = new OAC(1, Math.ceil(len * rate), rate);
        const out = o.createGain(); out.gain.value = 0.9; out.connect(o.destination);
        if (sp.echo) { const dl = o.createDelay(1), fb = o.createGain(); dl.delayTime.value = 3 / sp.rate; fb.gain.value = sp.echo; out.connect(dl); dl.connect(fb); fb.connect(dl); fb.connect(o.destination); }
        const note = n => sp.root * Math.pow(2, n / 12), deg = d => sp.scale[((d % 8) + 8) % 8] + 12 * Math.floor(d / 8);
        const nb = o.createBuffer(1, rate * 0.3, rate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
        const osc = (type, fr, t, dur, v, f2) => { const os = o.createOscillator(), g = o.createGain(); os.type = type; os.frequency.setValueAtTime(fr, t); if (f2) os.frequency.exponentialRampToValueAtTime(f2, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dur); os.connect(g); g.connect(out); os.start(t); os.stop(t + dur + 0.05); return os; };
        const noise = (t, dur, v, fq, type) => { const b = o.createBufferSource(), fl = o.createBiquadFilter(), g = o.createGain(); b.buffer = nb; fl.type = type || 'highpass'; fl.frequency.value = fq; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); b.connect(fl); fl.connect(g); g.connect(out); b.start(t); b.stop(t + dur); };
        let seed = sp.seed || 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        let mel = 7;
        for (let b = 0; b < beats; b++) {
            const t = b / sp.rate, ch = sp.chords[((b / 8) | 0) % sp.chords.length], bar = b % 8;
            if (bar === 0) {                                                   // pad
                for (const k of [0, 2, 4]) { const os = o.createOscillator(), g = o.createGain(); os.type = sp.pad || 'sine'; os.frequency.value = note(deg(ch + k)) / 2;
                    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06, t + 0.8); g.gain.linearRampToValueAtTime(0, t + 8 / sp.rate); os.connect(g); g.connect(out); os.start(t); os.stop(t + 8 / sp.rate + 0.05); }
            }
            if (sp.bass !== false && (bar === 0 || bar === 3 || bar === 4 || (sp.drums === 'war' && bar === 6))) osc('triangle', note(deg(ch)) / 4, t, 0.5, 0.22);
            const arp = [0, 2, 4, 7, 4, 2, 4, 2];                           // a soft arpeggio (a harp)
            if (sp.arp !== false && (b + (sp.seed || 0)) % 4 !== 3) osc('triangle', note(deg(ch + arp[bar])), t, 0.45, 0.07);
            // the melody: steps through the scale, leaning on the chord
            if (bar % 2 === 0 && rnd() < (sp.busy || 0.7)) {
                const r = rnd(); mel += r < 0.35 ? -1 : r < 0.7 ? 1 : r < 0.85 ? 2 : -2;
                if (bar === 0) mel = ch + (rnd() < 0.5 ? 7 : 9);
                mel = Math.max(4, Math.min(14, mel));
                const fr = note(deg(mel)), dur = 2.2 / sp.rate;
                if (sp.lead === 'flute') { const os = osc('sine', fr, t, dur * 1.4, 0.12), lfo = o.createOscillator(), lg = o.createGain(); lfo.frequency.value = 5; lg.gain.value = fr * 0.01; lfo.connect(lg); lg.connect(os.frequency); lfo.start(t); lfo.stop(t + dur * 1.4); }
                else if (sp.lead === 'brass') { const os = o.createOscillator(), fl = o.createBiquadFilter(), g = o.createGain(); os.type = 'sawtooth'; os.frequency.value = fr; fl.type = 'lowpass'; fl.frequency.setValueAtTime(600, t); fl.frequency.linearRampToValueAtTime(2200, t + 0.08); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.07, t + 0.04); g.gain.exponentialRampToValueAtTime(0.001, t + dur); os.connect(fl); fl.connect(g); g.connect(out); os.start(t); os.stop(t + dur + 0.05); }
                else if (sp.lead === 'bell') { osc('sine', fr, t, 1.6, 0.1); osc('sine', fr * 2.76, t, 0.6, 0.03); }
                else osc('triangle', fr, t, 0.5, 0.11);
            }
            const dr = sp.drums || 'none';
            if (dr === 'soft') { if (bar % 2 === 1) noise(t, 0.04, 0.05, 6000); if (bar === 0) osc('sine', 90, t, 0.25, 0.25, 45); }
            else if (dr === 'march' || dr === 'war') {
                if (bar === 0 || bar === 4 || (dr === 'war' && (bar === 3 || bar === 7))) osc('sine', 120, t, 0.3, 0.5, 40);
                if (bar === 2 || bar === 6) { noise(t, 0.16, 0.25, 1500, 'bandpass'); osc('triangle', 220, t, 0.08, 0.1, 150); }
                noise(t, 0.03, 0.06, 7000);
                if (dr === 'war' && bar === 7) noise(t + 0.5 / sp.rate, 0.12, 0.15, 1500, 'bandpass');
            } else if (dr === 'tom') {
                if (bar === 0 || bar === 3 || bar === 6) osc('sine', 110, t, 0.35, 0.45, 55);
                if (bar === 4) osc('sine', 160, t, 0.25, 0.3, 80);
                if (bar % 2 === 1) noise(t, 0.05, 0.05, 5000);
            }
        }
        pending[key] = true;
        o.startRendering().then(buf => { loops[key] = buf; pending[key] = false; if (cur === key) play(key, true); }).catch(() => { pending[key] = false; });
    }
    function define(key, spec) { SPECS[key] = spec; }
    // let go of songs (a chapter that is left): they are rendered again if ever needed
    function drop(keys) { for (const k of keys) { if (cur === k) continue; delete loops[k]; } }

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
        equip: () => { hiss(0.1, 0.25, 1500); tone(400, 600, 0.12, 'triangle', 0.12); },
        // the heroes' voices when hit: a short "uh!" (two voices)
        ouch: () => voiceHit(240, 160, 850),
        ouch2: () => voiceHit(380, 270, 1250),
        hoof: () => { hoofStep = !hoofStep; tone(hoofStep ? 190 : 150, 70, 0.07, 'sine', 0.22); hiss(0.04, 0.12, hoofStep ? 1400 : 1000); },
        magic: () => { tone(700, 1500, 0.18, 'sine', 0.14); tone(1400, 2200, 0.25, 'triangle', 0.05, 0.05); },
        zap: () => { tone(300, 900, 0.14, 'square', 0.07); tone(900, 300, 0.2, 'sine', 0.08, 0.08); },
        bomb: () => { tone(90, 30, 0.6, 'sine', 0.45); hiss(0.5, 0.4, 500); },
        blink: () => tone(1500, 300, 0.25, 'sine', 0.12),
        beam: () => { tone(110, 90, 0.9, 'sawtooth', 0.12); hiss(0.8, 0.12, 2400); },
        bell: () => { [1, 2.76, 5.4].forEach((k, i) => tone(392 * k, 0, 2.2 - i * 0.6, 'sine', 0.2 / (i + 1))); },
        wave: () => { hiss(1.2, 0.3, 400); tone(80, 50, 1.2, 'sine', 0.2); }
    };
    let hoofStep = false;
    function voiceHit(f1, f2, formant) {
        if (!ac || ac.state !== 'running') return;
        const t = ac.currentTime, os = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
        os.type = 'sawtooth'; os.frequency.setValueAtTime(f1, t); os.frequency.exponentialRampToValueAtTime(f2, t + 0.16);
        fl.type = 'bandpass'; fl.frequency.value = formant; fl.Q.value = 3;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        os.connect(fl); fl.connect(g); g.connect(sfx); os.start(t); os.stop(t + 0.22);
        hiss(0.08, 0.08, formant * 2);
    }
    function fx(name) { const f = FX[name]; if (f && ac) f(); }

    // while someone speaks, the music steps back
    function duck(on) { if (ac && music) music.gain.setTargetAtTime((on ? 0.12 : 0.32) * vol.music, ac.currentTime, 0.15); }

    return { start, setVolume, pause, resume, close, play, fx, prepare: render, define, drop, duck, ctx: () => ac, voiceOut: () => voice };
})();
