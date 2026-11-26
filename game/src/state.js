// Dawnmail Run — the game state and the flight model. Pure logic: input.js
// fills `keys`, main.js calls step() once a frame, render.js only reads.

const FGState = (() => {
  const { COURSE, RINGS, STORMS, FLIGHT, SCORE } = FGConfig;

  function create() {
    return {
      phase: 'title',           // title | flying | end
      // the plane
      x: 0,                     // metres across the valley (0 = centreline)
      alt: FLIGHT.startAlt,     // metres above the fields
      z: 0,                     // metres along the course
      speed: FLIGHT.startSpeed, // metres per second
      throttle: 0.55,           // 0..1
      bank: 0,                  // -1..1, for the drawing and the turn
      pitch: 0,                 // -1..1, for the drawing and the climb
      vspeed: 0,                // metres per second, up positive
      heading: 90,              // degrees, for the compass (90 = down the valley)
      // the run
      timeLeft: FLIGHT.timeLimit,
      elapsed: 0,
      score: 0,
      rings: RINGS.map(() => 'waiting'),   // waiting | taken | missed
      stormsHit: STORMS.map(() => false),
      shake: 0,
      notice: '',
      noticeT: 0,
      endReason: '',            // landed | crashed | hard | overshot | time
      endTitle: '',
      stars: 0,
      muted: false,
    };
  }

  function startRun(state) {
    const fresh = create();
    Object.assign(state, fresh, { phase: 'flying' });
  }

  function finish(state, reason, title) {
    state.phase = 'end';
    state.endReason = reason;
    state.endTitle = title;
    if (reason === 'landed') {
      state.score += SCORE.landBase + Math.round(state.timeLeft) * SCORE.landPerSecond;
    }
    const taken = state.rings.filter(r => r === 'taken').length;
    state.stars = (reason === 'landed' ? 1 : 0) + (taken >= 5 ? 1 : 0) + (taken >= 9 ? 1 : 0);
  }

  // keys: {left, right, up, down, faster, slower} booleans. dt in seconds.
  // events collects 'ring' | 'storm' | 'landed' | 'crashed' for audio.js.
  function step(state, keys, dt, events) {
    if (state.phase !== 'flying') return;

    state.elapsed += dt;
    state.timeLeft -= dt;
    if (state.noticeT > 0) state.noticeT -= dt;
    if (state.shake > 0) state.shake -= dt;

    // Throttle and speed.
    if (keys.faster) state.throttle = Math.min(1, state.throttle + dt * 0.7);
    if (keys.slower) state.throttle = Math.max(0, state.throttle - dt * 0.7);
    const target = FLIGHT.minSpeed + state.throttle * (FLIGHT.maxSpeed - FLIGHT.minSpeed);
    state.speed += (target - state.speed) * Math.min(1, dt * 1.6);

    // Pitch and climb. Near the ground a gentle sink is a landing, not a crash.
    const pitchIn = (keys.up ? 1 : 0) - (keys.down ? 1 : 0);
    state.pitch += (pitchIn - state.pitch) * Math.min(1, dt * 7);
    state.vspeed = state.pitch * FLIGHT.climbRate - (state.throttle < 0.25 ? 4 : 0);
    state.alt += state.vspeed * dt;

    // Bank and turn: the plane drifts across the valley and the nose swings.
    const bankIn = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    state.bank += (bankIn - state.bank) * Math.min(1, dt * 6);
    state.x += state.bank * FLIGHT.turnRate * dt;
    state.x = Math.max(-COURSE.valleyHalf, Math.min(COURSE.valleyHalf, state.x));
    state.heading = 90 + state.bank * 38;

    state.z += state.speed * dt;

    // Rings: judged the moment the plane's nose crosses the ring's z.
    RINGS.forEach((ring, i) => {
      if (state.rings[i] !== 'waiting') return;
      if (state.z >= ring.z) {
        const dx = state.x - ring.x;
        const dy = state.alt - ring.alt;
        if (Math.hypot(dx, dy) <= FGConfig.RING_RADIUS) {
          state.rings[i] = 'taken';
          state.score += SCORE.ring;
          state.timeLeft += SCORE.ringTime;
          state.notice = 'Ring! +150 and +3s';
          state.noticeT = 1.6;
          events.push('ring');
        } else {
          state.rings[i] = 'missed';
          state.notice = 'Missed a ring';
          state.noticeT = 1.2;
        }
      }
    });

    // Storm clouds: one bump each.
    STORMS.forEach((storm, i) => {
      if (state.stormsHit[i]) return;
      if (Math.abs(state.z - storm.z) < 15 && Math.abs(state.x - storm.x) < 30 && Math.abs(state.alt - storm.alt) < 18) {
        state.stormsHit[i] = true;
        state.score = Math.max(0, state.score + SCORE.cloud);
        state.shake = 0.7;
        state.speed = Math.max(FLIGHT.minSpeed, state.speed - 9);
        state.notice = 'Storm cloud! −75';
        state.noticeT = 1.6;
        events.push('storm');
      }
    });

    // The ground, the runway, and the end of the course.
    if (state.alt <= 0.6) {
      state.alt = 0;
      const onRunway = state.z >= COURSE.runwayStart && state.z <= COURSE.runwayEnd
        && Math.abs(state.x) <= COURSE.runwayHalfWidth;
      if (onRunway && state.vspeed > -9 && state.speed <= 62) {
        events.push('landed');
        finish(state, 'landed', 'Delivered! A smooth landing');
      } else if (onRunway) {
        events.push('crashed');
        finish(state, 'hard', 'A hard arrival — the mail survives, barely');
      } else {
        events.push('crashed');
        finish(state, 'crashed', 'Down in the fields — the mail is scattered');
      }
      return;
    }
    if (state.alt > COURSE.ceiling) state.alt = COURSE.ceiling;
    if (state.z > COURSE.length + 260) {
      finish(state, 'overshot', 'You flew past the strip — the mail comes back tomorrow');
      return;
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      finish(state, 'time', 'Out of time — the valley keeps its mail another night');
    }
  }

  return { create, startRun, step };
})();
