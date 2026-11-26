// Dawnmail Run — staged scenes for the screenshots (?shot=cover|title|play|end).
// Each scene sets the state directly, so the picture is a real render of the
// game's own code, identical on every visit.

const FGShots = (() => {
  function base(state) {
    state.elapsed = 30;
    state.bank = 0;
    state.pitch = 0;
    state.notice = '';
    state.noticeT = 0;
    state.shake = 0;
  }

  function stage(state, name) {
    base(state);
    if (name === 'title') {
      state.phase = 'title';
      state.z = 900;
      state.x = 12;
      state.alt = 118;
      state.speed = 56;
      state.throttle = 0.6;
      state.bank = 0.14;
      state.elapsed = 8;
    }
    if (name === 'cover') {
      state.phase = 'flying';
      state.z = 2290;
      state.x = -14;
      state.alt = 122;
      state.speed = 59;
      state.throttle = 0.62;
      state.bank = -0.32;
      state.pitch = 0.08;
      state.heading = 78;
      state.elapsed = 48;
      state.timeLeft = 84;
      state.score = 600;
      state.rings = ['taken', 'taken', 'taken', 'taken', 'waiting', 'waiting', 'waiting', 'waiting', 'waiting', 'waiting'];
    }
    if (name === 'play') {
      state.phase = 'flying';
      state.z = 4150;
      state.x = 3;
      state.alt = 39;
      state.speed = 47;
      state.throttle = 0.24;
      state.bank = 0.04;
      state.pitch = -0.1;
      state.heading = 92;
      state.elapsed = 97;
      state.timeLeft = 47;
      state.score = 1200;
      state.rings = ['taken', 'taken', 'taken', 'taken', 'taken', 'taken', 'taken', 'taken', 'waiting', 'waiting'];
      state.notice = 'Final approach — ease her down';
      state.noticeT = 99;
    }
    if (name === 'end') {
      state.phase = 'end';
      state.z = 4935;
      state.x = 1;
      state.alt = 0;
      state.speed = 0;
      state.throttle = 0;
      state.elapsed = 124;
      state.timeLeft = 23;
      state.score = 2005;
      state.rings = ['taken', 'taken', 'taken', 'taken', 'taken', 'taken', 'taken', 'taken', 'taken', 'missed'];
      state.stormsHit = [false, true, false, false, false, false];
      state.endReason = 'landed';
      state.endTitle = 'Delivered! A smooth landing';
      state.stars = 3;
    }
  }

  return { stage };
})();
