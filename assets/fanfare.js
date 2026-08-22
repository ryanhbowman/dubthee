// A tiny synthesized "royal trumpet" fanfare — no audio file needed.
// Browsers block audio autoplay until a user gesture, so we try immediately
// on load and, if blocked, retry on the visitor's first click/tap/keypress.
(function () {
  function createContext() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    return Ctx ? new Ctx() : null;
  }

  function playNote(ctx, dest, freq, startTime, duration, peak, opts) {
    opts = opts || {};
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc2.type = "sawtooth";
    osc1.frequency.value = freq;
    osc2.frequency.value = freq;
    osc2.detune.value = 8;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2600;
    filter.Q.value = 0.6;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(peak * 0.65, startTime + duration * 0.55);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.05);
    osc2.stop(startTime + duration + 0.05);

    if (opts.richness) {
      const osc3 = ctx.createOscillator();
      osc3.type = "square";
      osc3.frequency.value = freq / 2;
      const subGain = ctx.createGain();
      subGain.gain.value = opts.richness;
      osc3.connect(filter);
      filter.connect(subGain);
      subGain.connect(dest);
      osc3.start(startTime);
      osc3.stop(startTime + duration + 0.05);
    }

    if (opts.vibrato) {
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = opts.vibratoRate || 5.5;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = opts.vibratoDepth || 4;
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);
      const vibratoStart = startTime + (opts.vibratoDelay || 0.15);
      lfo.start(vibratoStart);
      lfo.stop(startTime + duration + 0.1);
    }
  }

  function scheduleFanfare(ctx) {
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);

    const delay = ctx.createDelay();
    delay.delayTime.value = 0.18;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.26;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(master);

    const dest = ctx.createGain();
    dest.connect(master);
    dest.connect(delay);

    const now = ctx.currentTime + 0.05;
    const C4 = 261.63, G4 = 392.0, C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, E6 = 1318.51;

    // Call
    playNote(ctx, dest, G4, now, 0.14, 0.5);
    playNote(ctx, dest, C5, now + 0.15, 0.14, 0.5);
    playNote(ctx, dest, E5, now + 0.3, 0.14, 0.5);
    playNote(ctx, dest, G5, now + 0.45, 0.17, 0.55);

    // Response, echoing a step higher
    const respStart = now + 0.75;
    playNote(ctx, dest, C5, respStart, 0.13, 0.42);
    playNote(ctx, dest, E5, respStart + 0.13, 0.13, 0.42);
    playNote(ctx, dest, G5, respStart + 0.26, 0.13, 0.44);
    playNote(ctx, dest, C6, respStart + 0.39, 0.2, 0.5);

    // Sustained resolving chord, richer and with vibrato for grandeur
    const chordStart = respStart + 0.66;
    const chordDur = 1.3;
    playNote(ctx, dest, C4, chordStart, chordDur, 0.32, { richness: 0.08 });
    playNote(ctx, dest, C5, chordStart, chordDur, 0.4, { vibrato: true, richness: 0.05 });
    playNote(ctx, dest, E5, chordStart, chordDur, 0.36, { vibrato: true });
    playNote(ctx, dest, G5, chordStart, chordDur, 0.4, { vibrato: true });
    playNote(ctx, dest, C6, chordStart, chordDur, 0.24, { vibrato: true });
    playNote(ctx, dest, E6, chordStart, chordDur, 0.14, { vibrato: true, vibratoDepth: 3 });

    const totalMs = (chordStart - now + chordDur + 0.4) * 1000;
    setTimeout(() => ctx.close().catch(() => {}), totalMs);
  }

  let played = false;

  function tryPlay() {
    if (played) return;
    const ctx = createContext();
    if (!ctx) return;

    const start = () => {
      played = true;
      scheduleFanfare(ctx);
    };

    if (ctx.state === "running") {
      start();
    } else {
      ctx.resume().then(() => {
        if (ctx.state === "running") start();
        else ctx.close().catch(() => {});
      }).catch(() => {
        ctx.close().catch(() => {});
      });
    }
  }

  tryPlay();

  ["pointerdown", "keydown", "touchstart"].forEach((evt) => {
    window.addEventListener(evt, tryPlay, { once: true });
  });
})();
