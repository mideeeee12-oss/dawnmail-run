// Dawnmail Run — boot and the frame loop. Everything else lives in
// config / state / world / render / audio / input / shots.

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const state = FGState.create();

  // The title screen flies itself over the valley until the player starts.
  state.z = 900;
  state.x = 12;
  state.alt = 118;
  state.speed = 56;
  state.throttle = 0.6;
  state.bank = 0.14;

  FGInput.bind(canvas);
  FGInput.setTapHandler(() => {
    FGAudio.ensure(state);
    if (state.phase === 'title' || state.phase === 'end') FGState.startRun(state);
  });
  FGInput.setMuteHandler(() => { state.muted = !state.muted; });

  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    FGShots.stage(state, shot);
    FGRender.draw(ctx, state);
    requestAnimationFrame(() => { window.__shotReady = true; });
    return;
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (state.phase === 'flying') {
      const events = [];
      FGState.step(state, FGInput.keys, dt, events);
      for (const name of events) FGAudio.play(name, state);
    } else if (state.phase === 'title') {
      // A gentle scenic drift behind the menu.
      state.elapsed += dt;
      state.z += state.speed * dt * 0.35;
      if (state.z > 2600) state.z = 700;
      state.bank = Math.sin(state.elapsed * 0.24) * 0.16;
    } else {
      state.elapsed += dt;
    }
    FGAudio.update(state);
    FGRender.draw(ctx, state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
