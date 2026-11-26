// Dawnmail Run — sound, all made in code with WebAudio: the engine's hum,
// the ring chime, the storm thud and the little landing jingle.

const FGAudio = (() => {
  let ctx = null;
  let engineOsc = null;
  let engineSub = null;
  let engineGain = null;

  function ensure(state) {
    if (ctx || state.muted) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    engineGain = ctx.createGain();
    engineGain.gain.value = 0.0;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    engineOsc = ctx.createOscillator();
    engineOsc.type = 'sawtooth';
    engineSub = ctx.createOscillator();
    engineSub.type = 'sine';
    engineOsc.connect(filter);
    engineSub.connect(filter);
    filter.connect(engineGain);
    engineGain.connect(ctx.destination);
    engineOsc.start();
    engineSub.start();
  }

  function tone(freq, at, dur, type = 'sine', vol = 0.16) {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime + at);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + at);
    osc.stop(ctx.currentTime + at + dur);
  }

  function thud(vol = 0.3) {
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * 0.22);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 240;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  function play(name, state) {
    if (state.muted) return;
    ensure(state);
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (name === 'ring') { tone(880, 0, 0.12, 'sine', 0.18); tone(1318, 0.09, 0.2, 'sine', 0.18); }
    if (name === 'storm') thud(0.34);
    if (name === 'crashed') { thud(0.5); tone(110, 0, 0.5, 'sawtooth', 0.12); }
    if (name === 'landed') [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle', 0.16));
  }

  function update(state) {
    if (!ctx || !engineOsc) return;
    const flying = state.phase === 'flying';
    const target = state.muted || !flying ? 0 : 0.045 + state.throttle * 0.03;
    engineGain.gain.setTargetAtTime(target, ctx.currentTime, 0.2);
    const freq = 52 + state.throttle * 46 + state.speed * 0.22;
    engineOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.15);
    engineSub.frequency.setTargetAtTime(freq / 2, ctx.currentTime, 0.15);
  }

  return { ensure, play, update };
})();
