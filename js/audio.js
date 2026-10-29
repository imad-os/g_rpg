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
        bakeAll();
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
        wave: () => { hiss(1.2, 0.3, 400); tone(80, 50, 1.2, 'sine', 0.2); },
        wings: () => { hiss(0.22, 0.18, 380); tone(70, 50, 0.2, 'sine', 0.15); },
        // the special attacks until their baked sounds are ready
        throw: () => { hiss(0.4, 0.35, 1800); tone(1800, 1200, 0.3, 'sine', 0.06); },
        fireArrow: () => { tone(900, 300, 0.12, 'triangle', 0.18); hiss(0.5, 0.35, 700); },
        cannon: () => { hiss(0.6, 0.7, 500); tone(120, 30, 0.5, 'square', 0.3); },
        arcane: () => { tone(300, 1200, 0.5, 'sawtooth', 0.08); tone(1400, 2600, 0.4, 'sine', 0.06, 0.1); },
        boom: () => { tone(90, 30, 0.5, 'sine', 0.4); hiss(0.4, 0.4, 500); },
        burn: () => hiss(0.4, 0.3, 700)
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
    // recorded sounds (Kenney's RPG Audio, CC0, audio/sfx/): once decoded they replace or join the synthesized ones
    const SAMPLES = {}, SAMPLE_VOL = {};
    function loadSamples(map, version) {
        if (!ac) return;
        for (const name in map) {
            if (SAMPLES[name]) continue;
            fetch(map[name][0] + '?v=' + version).then(r => r.ok ? r.arrayBuffer() : null)
                .then(b => b && ac ? new Promise((ok, no) => ac.decodeAudioData(b, ok, no)) : null)
                .then(buf => { if (buf) { SAMPLES[name] = buf; SAMPLE_VOL[name] = map[name][1]; } }).catch(() => {});
        }
    }
    function sample(name) {
        const b = SAMPLES[name]; if (!b || ac.state !== 'running') return false;
        const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = b; g.gain.value = SAMPLE_VOL[name] || 0.8;
        s.connect(g); g.connect(sfx); s.start();
        return true;
    }
    /* Baked sounds: the weapons and the special attacks are computed sample by sample once, a few after the start
     * (so the TV never stalls), and kept as buffers: noise through moving filters, plucked strings (Karplus-Strong),
     * ringing metal, fire crackle, a low thump and echoes. Until a sound is ready the oscillator version plays. */
    const BAKE = {
        // a flintlock: the hammer clicks, then a sharp crack, a deep boom and its echo off the hills
        gun: [1.3, 0.9, function* (d, R) {
            const lp = flt(0, 0.8), hp = flt(2, 0.9), lp2 = flt(0, 0.7); let ph = 0;
            for (let i = 0; i < d.length; i++) {
                if ((i & 511) === 511) yield;
                const t = i / R, u = t - 0.022;
                let v = t < 0.005 ? hp(N(), 4000) * (1 - t / 0.005) * 0.5 : 0;
                if (u >= 0) {
                    v += hp(N(), 2200) * env(u, 0.0008, 0.014) * 1.5;
                    v += lp(N(), 180 + 6000 * Math.exp(-u / 0.045)) * env(u, 0.002, 0.15) * 1.9;
                    ph += 6.2832 * (42 + 120 * Math.exp(-u / 0.04)) / R; v += Math.sin(ph) * env(u, 0.002, 0.11) * 1.1;
                    v += lp2(N(), 400) * env(u, 0.03, 0.35) * 0.5;
                }
                d[i] = v;
            }
            yield* echo(d, R, 0.12, 0.32); yield* echo(d, R, 0.29, 0.16);
        }],
        // the special shell: the same, heavier and longer, with debris rattling down after
        cannon: [2.0, 1, function* (d, R) {
            const lp = flt(0, 0.7), hp = flt(2, 0.9), lp2 = flt(0, 0.6), cr = flt(2, 1); let ph = 0;
            for (let i = 0; i < d.length; i++) {
                if ((i & 511) === 511) yield;
                const t = i / R, u = t - 0.03;
                let v = t < 0.006 ? hp(N(), 3500) * (1 - t / 0.006) * 0.6 : 0;
                if (u >= 0) {
                    v += hp(N(), 1800) * env(u, 0.001, 0.025) * 1.6;
                    v += lp(N(), 120 + 5000 * Math.exp(-u / 0.07)) * env(u, 0.003, 0.3) * 2.2;
                    ph += 6.2832 * (30 + 100 * Math.exp(-u / 0.07)) / R; v += Math.sin(ph) * env(u, 0.003, 0.25) * 1.4;
                    v += lp2(N(), 160) * env(u, 0.05, 0.7) * 0.9;
                    if (u > 0.15 && Math.random() < 0.0016 * Math.exp(-u / 0.6)) crackle = 1;
                    crackle *= 0.985; v += cr(N(), 3000) * crackle * 0.5;
                }
                d[i] = v;
            }
            yield* echo(d, R, 0.15, 0.35); yield* echo(d, R, 0.34, 0.2);
        }],
        // a bow: the string twangs (a plucked string) as the arrow whooshes away
        bow: [0.75, 0.85, function* (d, R) {
            const s1 = pluck(R, 165, 0.994, d.length), s2 = pluck(R, 82, 0.996, d.length), bp = flt(1, 0.7), hp = flt(2, 1);
            for (let i = 0; i < d.length; i++) {
                if ((i & 511) === 511) yield;
                const t = i / R;
                let v = s1[i] * env(t, 0.001, 0.09) * 0.9 + s2[i] * env(t, 0.001, 0.14) * 0.6;
                v += t < 0.006 ? hp(N(), 3000) * (1 - t / 0.006) * 0.7 : 0;
                const u = t - 0.015; if (u >= 0) v += bp(N(), 600 + 2600 * Math.exp(-u / 0.12)) * env(u, 0.025, 0.12) * 1.3;
                d[i] = v;
            }
        }],
        // the special: a fire arrow, the string plus a roaring, crackling flame
        fireArrow: [1.3, 0.9, function* (d, R) {
            const s1 = pluck(R, 150, 0.994, d.length), bp = flt(1, 0.6), fl = flt(0, 0.9), cr = flt(2, 1); let c = 0;
            for (let i = 0; i < d.length; i++) {
                if ((i & 511) === 511) yield;
                const t = i / R;
                let v = s1[i] * env(t, 0.001, 0.1) * 0.8;
                v += bp(N(), 500 + 2200 * Math.exp(-t / 0.2)) * env(t - 0.01, 0.03, 0.2) * 1.2;
                v += fl(N(), 500 + 300 * Math.sin(t * 40)) * env(t, 0.05, 0.45) * 1.6;
                if (Math.random() < 0.004 * Math.exp(-t / 0.5)) c = 1; c *= 0.97; v += cr(N(), 2500) * c * 0.8;
                d[i] = v;
            }
        }],
        // a sword: a sharp swish of air with a faint ring of steel
        swing: [0.36, 0.7, function* (d, R) {
            const bp = flt(1, 0.35);
            for (let i = 0; i < d.length; i++) {
                if ((i & 511) === 511) yield;
                const t = i / R, k = t < 0.24 ? Math.sin(Math.PI * t / 0.24) : 0;
                let v = bp(N(), 700 + 3800 * k) * k * k * 1.4;
                v += (Math.sin(t * 16570) + Math.sin(t * 24830) * 0.6 + Math.sin(t * 33140) * 0.4) * env(t, 0.004, 0.09) * 0.07;
                d[i] = v;
            }
        }],
        // the special: the blade rings out as it leaves the hand, then whirls through the air
        throw: [1.2, 0.85, function* (d, R) {
            const bp = flt(1, 0.3);
            for (let i = 0; i < d.length; i++) {
                if ((i & 511) === 511) yield;
                const t = i / R, spin = Math.pow(0.5 + 0.5 * Math.sin(6.2832 * 11 * t), 2);
                let v = (Math.sin(t * 11300) + Math.sin(t * 17000) * 0.7 + Math.sin(t * 25800) * 0.5 + Math.sin(t * 38900) * 0.3) * env(t, 0.002, 0.25) * 0.22;
                v += bp(N(), 1200 + 1400 * spin) * spin * env(t, 0.05, 0.45) * 1.3;
                d[i] = v;
            }
        }],
        // a staff: a shimmer of rising bells over a soft swoop
        magic: [0.6, 0.7, function* (d, R) {
            const bp = flt(1, 0.5), F = [1320, 1760, 2090, 2640, 3520]; let ph = 0;
            for (let i = 0; i < d.length; i++) {
                if ((i & 511) === 511) yield;
                const t = i / R; let v = 0;
                for (let k = 0; k < 5; k++) { const u = t - k * 0.03; if (u > 0) v += Math.sin(6.2832 * F[k] * u * (1 + u * 0.8)) * env(u, 0.004, 0.12) * 0.18; }
                ph += 6.2832 * (260 + 500 * t) / R; v += Math.sin(ph) * env(t, 0.02, 0.15) * 0.35;
                v += bp(N(), 5000) * env(t, 0.01, 0.1) * 0.3;
                d[i] = v;
            }
        }],
        // the special: a big orb: a chord swells through an opening filter, sparkles and a low boom
        arcane: [1.6, 0.9, function* (d, R) {
            const lp = flt(0, 0.4), bp = flt(1, 0.5), F = [110, 165, 220, 330]; let sub = 0;
            const sp = [1760, 2350, 2790, 3520, 4700];
            for (let i = 0; i < d.length; i++) {
                if ((i & 511) === 511) yield;
                const t = i / R; let saw = 0;
                for (const f of F) saw += ((t * f) % 1) * 2 - 1;
                let v = lp(saw * 0.3, 300 + 3200 * Math.min(1, t / 0.35)) * env(t, 0.18, 0.5) * 1.2;
                for (let k = 0; k < 5; k++) { const u = t - 0.05 - k * 0.05; if (u > 0) v += Math.sin(6.2832 * sp[k] * u) * env(u, 0.003, 0.2) * 0.12; }
                sub += 6.2832 * (55 - 20 * Math.min(1, t)) / R; v += Math.sin(sub) * env(t, 0.01, 0.35) * 0.8;
                v += bp(N(), 6000) * env(t, 0.1, 0.4) * 0.15;
                d[i] = v;
            }
        }],
        // the slam: a crack, a heavy thud, the ground rumbling and stones falling back
        slam: [1.8, 1, function* (d, R) {
            const hp = flt(2, 0.9), lp = flt(0, 0.8), cr = flt(2, 1); let ph = 0, c = 0;
            for (let i = 0; i < d.length; i++) {
                if ((i & 511) === 511) yield;
                const t = i / R;
                let v = hp(N(), 1500) * env(t, 0.001, 0.03) * 1.2;
                ph += 6.2832 * (26 + 60 * Math.exp(-t / 0.08)) / R; v += Math.sin(ph) * env(t, 0.003, 0.35) * 1.5;
                v += lp(N(), 90 + 400 * Math.exp(-t / 0.15)) * env(t, 0.01, 0.6) * 2.4;
                if (t > 0.1 && Math.random() < 0.003 * Math.exp(-t / 0.5)) c = 1; c *= 0.98; v += cr(N(), 2000) * c * 0.6;
                d[i] = v;
            }
            yield* echo(d, R, 0.14, 0.3);
        }],
        // a shell or a fire arrow bursting on a foe
        boom: [1.1, 0.9, function* (d, R) {
            const hp = flt(2, 0.9), lp = flt(0, 0.7); let ph = 0;
            for (let i = 0; i < d.length; i++) {
                if ((i & 511) === 511) yield;
                const t = i / R;
                let v = hp(N(), 2000) * env(t, 0.001, 0.02) * 1.2 + lp(N(), 150 + 4000 * Math.exp(-t / 0.05)) * env(t, 0.002, 0.25) * 2;
                ph += 6.2832 * (35 + 80 * Math.exp(-t / 0.05)) / R; v += Math.sin(ph) * env(t, 0.002, 0.15) * 1.1;
                d[i] = v;
            }
            yield* echo(d, R, 0.11, 0.25);
        }],
        burn: [0.8, 0.7, function* (d, R) {
            const fl = flt(0, 0.8), cr = flt(2, 1); let c = 0;
            for (let i = 0; i < d.length; i++) {
                if ((i & 511) === 511) yield;
                const t = i / R; let v = fl(N(), 700) * env(t, 0.01, 0.3) * 1.6;
                if (Math.random() < 0.006 * Math.exp(-t / 0.3)) c = 1; c *= 0.96; v += cr(N(), 3000) * c * 0.8;
                d[i] = v;
            }
        }],
        // the heal: a warm chord of bells rising
        heal: [1.6, 0.6, function* (d, R) {
            const F = [523.3, 659.3, 784, 1046.5];
            for (let i = 0; i < d.length; i++) {
                if ((i & 511) === 511) yield;
                const t = i / R; let v = 0;
                for (let k = 0; k < 4; k++) { const u = t - k * 0.08; if (u > 0) v += (Math.sin(6.2832 * F[k] * u) + Math.sin(6.2832 * F[k] * 2.76 * u) * 0.2) * env(u, 0.005, 0.5) * 0.25; }
                v += Math.sin(6.2832 * 261.6 * t) * env(t, 0.25, 0.6) * 0.15;
                d[i] = v;
            }
        }]
    };
    let crackle = 0;
    const N = () => Math.random() * 2 - 1;
    const env = (t, a, k) => t < 0 ? 0 : t < a ? t / a : Math.exp(-(t - a) / k);
    // a state-variable filter with a moving cutoff; mode 0 low-pass, 1 band-pass, 2 high-pass; q: damping (lower rings more)
    let SR = 48000;
    function flt(mode, q) {
        let lo = 0, bd = 0;
        const sr = SR;
        return (x, fc) => { const g = 2 * Math.sin(Math.PI * Math.min(fc, sr / 7) / sr), hi = x - lo - q * bd; bd += g * hi; lo += g * bd; return mode === 0 ? lo : mode === 1 ? bd : hi; };
    }
    // a plucked string (Karplus-Strong)
    function pluck(R, freq, damp, n) {
        const p = Math.max(2, Math.round(R / freq)), b = new Float32Array(p), out = new Float32Array(n);
        for (let i = 0; i < p; i++) b[i] = N();
        for (let i = 0; i < n; i++) { const j = i % p, v = b[j]; b[j] = (v + b[(j + 1) % p]) * 0.5 * damp; out[i] = v; }
        return out;
    }
    // an echo that keeps fading (each repeat a little duller)
    function* echo(d, R, sec, g) { const k = Math.round(sec * R); let lp = 0; for (let i = k; i < d.length; i++) { lp += (d[i - k] - lp) * 0.35; d[i] += lp * g; if ((i & 2047) === 2047) yield; } }
    // one sound at a time, a slice every few milliseconds, so the game keeps running while they are made
    function* bakeOne(name) {
        const b = BAKE[name]; if (!ac || !b || SAMPLES[name]) return;
        const R = 24000, n = Math.ceil(b[0] * R), buf = ac.createBuffer(1, n, R), d = buf.getChannelData(0);
        SR = R; crackle = 0;
        yield* b[2](d, R);
        let pk = 0;
        for (let i = 0; i < n; i++) { const v = Math.tanh(d[i] * 1.3); d[i] = v; if (v > pk) pk = v; else if (-v > pk) pk = -v; if ((i & 4095) === 4095) yield; }
        const k = pk > 0 ? 0.95 / pk : 1;
        for (let i = 0; i < n; i++) d[i] *= k;
        for (let i = Math.max(0, n - 300); i < n; i++) d[i] *= (n - i) / 300;              // no click at the end
        SAMPLES[name] = buf; SAMPLE_VOL[name] = b[1];
    }
    function bakeAll() {
        const names = Object.keys(BAKE); let i = 0, job = null;
        const next = () => {
            if (!ac) return;
            if (!job) { if (i >= names.length) return; job = bakeOne(names[i++]); }
            try { if (job.next().done) job = null; } catch (e) { job = null; }
            setTimeout(next, 4);
        };
        setTimeout(next, 300);
    }
    // a name with a recorded sound plays it (door, buy, cut, equip also keep a little synth under it); others are synthesized
    const MIX = { door: 1, chest: 1 };
    function fx(name) { if (!ac) return; if (sample(name) && !MIX[name]) return; const f = FX[name]; if (f) f(); }

    // while someone speaks, the music steps back
    function duck(on) { if (ac && music) music.gain.setTargetAtTime((on ? 0.12 : 0.32) * vol.music, ac.currentTime, 0.15); }

    return { start, setVolume, pause, resume, close, play, fx, prepare: render, define, drop, duck, loadSamples, ctx: () => ac, voiceOut: () => voice };
})();
