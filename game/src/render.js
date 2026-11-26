// Dawnmail Run — the plane, the lit instruments, the HUD and the screens.
// The world itself is world.js; this file draws everything in the cockpit.

const FGRender = (() => {
  const { WIDTH, HEIGHT, COURSE, RINGS } = FGConfig;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  function panel(ctx, x, y, w, h, fill = 'rgba(16,24,38,0.82)') {
    ctx.fillStyle = fill;
    rr(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140,190,240,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawPlaneShadow(ctx, state) {
    const p = FGWorld.project(state, state.x, 0, state.z + 55);
    if (!p) return;
    const w = Math.min(120, Math.max(16, 120 * p.s * 0.55));
    ctx.fillStyle = 'rgba(20,30,16,0.18)';
    ctx.beginPath();
    ctx.ellipse(p.sx, Math.min(p.sy, HEIGHT - 6), w, w * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlane(ctx, state) {
    const shakeX = state.shake > 0 ? Math.sin(state.elapsed * 61) * 7 * state.shake : 0;
    const shakeY = state.shake > 0 ? Math.cos(state.elapsed * 53) * 5 * state.shake : 0;
    const cx = WIDTH / 2 + shakeX;
    const cy = 512 + Math.sin(state.elapsed * 2.1) * 3 - state.pitch * 16 + shakeY;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.bank * 0.36);
    // Main wing.
    ctx.fillStyle = '#e8e2d2';
    rr(ctx, -118, -6, 236, 26, 12); ctx.fill();
    ctx.fillStyle = '#d94f3d';
    rr(ctx, -118, -6, 34, 26, 12); ctx.fill();
    rr(ctx, 84, -6, 34, 26, 12); ctx.fill();
    // Navigation lights.
    ctx.fillStyle = '#ff5a4d';
    ctx.beginPath(); ctx.arc(-114, 7, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5aff7a';
    ctx.beginPath(); ctx.arc(114, 7, 4.5, 0, Math.PI * 2); ctx.fill();
    // Fuselage, tail at the bottom of the drawing, nose at the top.
    const body = ctx.createLinearGradient(0, -86, 0, 74);
    body.addColorStop(0, '#f2ecdc');
    body.addColorStop(1, '#cfc7ae');
    ctx.fillStyle = body;
    rr(ctx, -17, -88, 34, 168, 16); ctx.fill();
    ctx.fillStyle = '#d94f3d';
    rr(ctx, -17, 30, 34, 50, 14); ctx.fill();
    // Mail sacks strapped behind the cockpit.
    ctx.fillStyle = '#b98d54';
    rr(ctx, -13, 6, 26, 20, 5); ctx.fill();
    ctx.strokeStyle = '#8a6a3c';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, 26); ctx.stroke();
    // Cockpit canopy.
    ctx.fillStyle = '#9fd4ef';
    rr(ctx, -11, -34, 22, 34, 10); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    rr(ctx, -8, -32, 7, 28, 4); ctx.fill();
    // Tailplane and fin.
    ctx.fillStyle = '#e8e2d2';
    rr(ctx, -46, 58, 92, 15, 7); ctx.fill();
    ctx.fillStyle = '#d94f3d';
    rr(ctx, -4, 40, 9, 30, 4); ctx.fill();
    // The propeller, a spinning blur at the nose.
    const propA = state.elapsed * (14 + state.throttle * 30);
    ctx.strokeStyle = 'rgba(40,40,40,0.75)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(propA) * -30, -92 - Math.sin(propA) * 5);
    ctx.lineTo(Math.cos(propA) * 30, -92 + Math.sin(propA) * 5);
    ctx.stroke();
    ctx.fillStyle = 'rgba(230,230,220,0.20)';
    ctx.beginPath(); ctx.ellipse(0, -92, 33, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a2f23';
    ctx.beginPath(); ctx.arc(0, -92, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function gaugeLabel(ctx, x, y, text) {
    ctx.fillStyle = '#8fb8dd';
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
  }

  function drawHorizonGauge(ctx, state, cx, cy) {
    const r = 52;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.translate(cx, cy);
    ctx.rotate(-state.bank * 0.5);
    ctx.translate(0, state.pitch * 16);
    ctx.fillStyle = '#5ea9dd';
    ctx.fillRect(-r - 4, -r - 40, (r + 4) * 2, r + 40);
    ctx.fillStyle = '#8a6a44';
    ctx.fillRect(-r - 4, 0, (r + 4) * 2, r + 40);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-r - 4, 0); ctx.lineTo(r + 4, 0); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = '#20303f';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // The fixed plane symbol.
    ctx.strokeStyle = '#ffd23e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy); ctx.lineTo(cx - 9, cy); ctx.lineTo(cx, cy + 6); ctx.lineTo(cx + 9, cy); ctx.lineTo(cx + 30, cy);
    ctx.stroke();
    gaugeLabel(ctx, cx, cy + r + 16, 'HORIZON');
  }

  function drawDial(ctx, state, cx, cy, label, value01, text) {
    const r = 52;
    ctx.fillStyle = 'rgba(10,18,30,0.9)';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#20303f';
    ctx.lineWidth = 5;
    ctx.stroke();
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI * 0.75 + (i / 8) * Math.PI * 1.5;
      ctx.strokeStyle = '#cfe6f7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (r - 9), cy + Math.sin(a) * (r - 9));
      ctx.lineTo(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3));
      ctx.stroke();
    }
    const a = Math.PI * 0.75 + Math.max(0, Math.min(1, value01)) * Math.PI * 1.5;
    ctx.strokeStyle = '#ffd23e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * (r - 14), cy + Math.sin(a) * (r - 14));
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, cx, cy + 34);
    gaugeLabel(ctx, cx, cy + r + 16, label);
  }

  function drawCompass(ctx, state) {
    const x0 = WIDTH / 2 - 130;
    panel(ctx, x0, 58, 260, 26);
    ctx.save();
    ctx.beginPath(); ctx.rect(x0 + 4, 60, 252, 22); ctx.clip();
    ctx.strokeStyle = 'rgba(223,238,251,0.6)';
    ctx.lineWidth = 2;
    for (let deg = 0; deg <= 360; deg += 15) {
      let off = (deg - state.heading) * 3.4;
      while (off > 306) off -= 612;
      while (off < -306) off += 612;
      if (Math.abs(off) < 126) {
        ctx.beginPath();
        ctx.moveTo(WIDTH / 2 + off, deg % 45 === 0 ? 66 : 71);
        ctx.lineTo(WIDTH / 2 + off, 80);
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#dfeefb';
    ctx.font = '700 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const names = [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W'], [360, 'N']];
    for (const [deg, name] of names) {
      let off = (deg - state.heading) * 3.4;
      while (off > 306) off -= 612;
      while (off < -306) off += 612;
      if (Math.abs(off) < 118) ctx.fillText(name, WIDTH / 2 + off, 74);
    }
    ctx.restore();
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2 - 6, 58); ctx.lineTo(WIDTH / 2 + 6, 58); ctx.lineTo(WIDTH / 2, 66);
    ctx.closePath(); ctx.fill();
  }

  function nextRingInfo(state) {
    const i = state.rings.findIndex(r => r === 'waiting');
    if (i < 0) return null;
    return { ring: RINGS[i], index: i, dist: Math.max(0, Math.round(RINGS[i].z - state.z)) };
  }

  function drawHUD(ctx, state) {
    // Top-left: the three numbers the bounty asks for, big and lit.
    panel(ctx, 18, 14, 386, 62);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8fb8dd';
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.fillText('ALTITUDE', 34, 36);
    ctx.fillText('SPEED', 158, 36);
    ctx.fillText('HEADING', 268, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 27px system-ui, sans-serif';
    ctx.fillText(`${String(Math.round(state.alt * 3.28)).padStart(4, '0')} ft`, 34, 66);
    ctx.fillText(`${String(Math.round(state.speed * 1.94)).padStart(3, '0')} kt`, 158, 66);
    ctx.fillText(`${String(Math.round(state.heading)).padStart(3, '0')}°`, 268, 66);

    // Top-right: the run.
    panel(ctx, WIDTH - 356, 14, 338, 62);
    ctx.fillStyle = '#8fb8dd';
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.fillText('TIME', WIDTH - 340, 36);
    ctx.fillText('SCORE', WIDTH - 252, 36);
    ctx.fillText('RINGS', WIDTH - 128, 36);
    ctx.font = '800 27px system-ui, sans-serif';
    ctx.fillStyle = state.timeLeft <= 15 ? '#ff7a5c' : '#ffffff';
    const t = Math.max(0, Math.ceil(state.timeLeft));
    ctx.fillText(`${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`, WIDTH - 340, 66);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(state.score), WIDTH - 252, 66);
    const taken = state.rings.filter(r => r === 'taken').length;
    ctx.fillText(`${taken}/${RINGS.length}`, WIDTH - 128, 66);

    drawCompass(ctx, state);
    drawHorizonGauge(ctx, state, 84, HEIGHT - 96);
    drawDial(ctx, state, WIDTH - 190, HEIGHT - 96, 'ALTIMETER · M', state.alt / FGConfig.COURSE.ceiling, `${Math.round(state.alt)} m`);
    drawDial(ctx, state, WIDTH - 74, HEIGHT - 96, 'SPEED · KT', (state.speed - FGConfig.FLIGHT.minSpeed) / (FGConfig.FLIGHT.maxSpeed - FGConfig.FLIGHT.minSpeed), `${Math.round(state.speed * 1.94)}`);

    // Next-ring guide.
    const next = nextRingInfo(state);
    if (next) {
      const p = FGWorld.project(state, next.ring.x, next.ring.alt, next.ring.z);
      ctx.fillStyle = 'rgba(16,24,38,0.82)';
      rr(ctx, WIDTH / 2 - 128, 96, 256, 30, 9); ctx.fill();
      ctx.fillStyle = '#ffd23e';
      ctx.font = '700 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      let arrow = '';
      if (p) {
        if (p.sx < 90) arrow = ' ◀';
        else if (p.sx > WIDTH - 90) arrow = ' ▶';
        else if (next.ring.alt > state.alt + 12) arrow = ' ▲ climb';
        else if (next.ring.alt < state.alt - 12) arrow = ' ▼ sink';
      }
      ctx.fillText(`NEXT RING ${next.index + 1} · ${next.dist} m${arrow}`, WIDTH / 2, 117);
    } else if (state.z < COURSE.runwayStart) {
      ctx.fillStyle = 'rgba(16,24,38,0.82)';
      rr(ctx, WIDTH / 2 - 128, 96, 256, 30, 9); ctx.fill();
      ctx.fillStyle = '#9fe08a';
      ctx.font = '700 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ALL RINGS DONE — LAND AHEAD', WIDTH / 2, 117);
    }

    // The landing target, once the strip is in reach.
    if (state.z > 3900) {
      const p = FGWorld.project(state, 0, 10, COURSE.runwayStart + 120);
      if (p && p.dz < 1600) {
        ctx.strokeStyle = '#69c24a';
        ctx.lineWidth = 3;
        const w = Math.max(26, 30 * p.s);
        ctx.strokeRect(p.sx - w, p.sy - w * 0.5, w * 2, w);
        ctx.fillStyle = '#69c24a';
        ctx.font = '700 13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LAND HERE', p.sx, p.sy - w * 0.5 - 8);
      }
    }

    // Notices and warnings.
    if (state.noticeT > 0 && state.notice) {
      ctx.fillStyle = '#ffd23e';
      ctx.font = '800 25px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(state.notice, WIDTH / 2, 168);
    }
    if (state.alt < 22 && state.z < COURSE.runwayStart - 120 && Math.floor(state.elapsed * 2) % 2 === 0) {
      ctx.fillStyle = '#ff7a5c';
      ctx.font = '800 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ PULL UP ⚠', WIDTH / 2, HEIGHT - 190);
    }
    if (state.muted) {
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '700 13px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('SOUND OFF (M)', WIDTH - 20, HEIGHT - 14);
    }
  }

  function drawTitle(ctx, state) {
    ctx.fillStyle = 'rgba(10,16,28,0.45)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd23e';
    ctx.font = '800 26px system-ui, sans-serif';
    ctx.fillText('✉  THE VALLEY MAIL SERVICE  ✉', WIDTH / 2, 148);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 84px Georgia, serif';
    ctx.fillText('DAWNMAIL RUN', WIDTH / 2, 232);
    ctx.fillStyle = '#dfeefb';
    ctx.font = '600 21px system-ui, sans-serif';
    ctx.fillText('Fly the dawn mail down the valley: thread all ten rings, dodge the storm', WIDTH / 2, 276);
    ctx.fillText('clouds, and put her down gently on the MAIL strip before time runs out.', WIDTH / 2, 304);

    panel(ctx, WIDTH / 2 - 330, 344, 660, 218, 'rgba(12,20,34,0.88)');
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 19px system-ui, sans-serif';
    ctx.fillText('HOW TO FLY', WIDTH / 2, 382);
    ctx.font = '600 17px system-ui, sans-serif';
    ctx.fillStyle = '#cfe6f7';
    ctx.fillText('← →  bank and turn        ↑ ↓  climb and sink', WIDTH / 2, 422);
    ctx.fillText('W / S  throttle up and down        M  sound on/off', WIDTH / 2, 452);
    ctx.fillStyle = '#ffd23e';
    ctx.fillText('Ring +150 and +3s ·  Storm cloud −75 ·  A gentle landing pays a bonus', WIDTH / 2, 492);
    ctx.fillStyle = '#cfe6f7';
    ctx.fillText('Touch down on the strip slowly, low and near the centreline.', WIDTH / 2, 522);

    ctx.fillStyle = '#ffd23e';
    rr(ctx, WIDTH / 2 - 170, 596, 340, 58, 14); ctx.fill();
    ctx.fillStyle = '#20303f';
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.fillText('CLICK OR PRESS ENTER TO FLY', WIDTH / 2, 633);
  }

  function drawEnd(ctx, state) {
    ctx.fillStyle = 'rgba(10,16,28,0.42)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    panel(ctx, WIDTH / 2 - 300, 168, 600, 430, 'rgba(12,20,34,0.92)');
    ctx.textAlign = 'center';
    ctx.fillStyle = state.endReason === 'landed' ? '#9fe08a' : '#ffb59d';
    ctx.font = '800 34px system-ui, sans-serif';
    const title = state.endTitle.length > 44 ? state.endTitle.slice(0, 44) : state.endTitle;
    ctx.fillText(title, WIDTH / 2, 226);
    ctx.font = '900 44px system-ui, sans-serif';
    ctx.fillStyle = '#ffd23e';
    ctx.fillText('★'.repeat(state.stars) + '☆'.repeat(3 - state.stars), WIDTH / 2, 282);
    const taken = state.rings.filter(r => r === 'taken').length;
    const missed = state.rings.filter(r => r === 'missed').length;
    ctx.font = '600 20px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Rings flown through: ${taken} of ${RINGS.length}   (missed ${missed})`, WIDTH / 2, 336);
    ctx.fillText(`Storm clouds hit: ${state.stormsHit.filter(Boolean).length}`, WIDTH / 2, 372);
    if (state.endReason === 'landed') {
      ctx.fillText(`Landing bonus: ${FGConfig.SCORE.landBase} + ${Math.round(state.timeLeft)}s × ${FGConfig.SCORE.landPerSecond}`, WIDTH / 2, 408);
    }
    ctx.fillStyle = '#8fb8dd';
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.fillText('FINAL SCORE', WIDTH / 2, 452);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 54px system-ui, sans-serif';
    ctx.fillText(String(state.score), WIDTH / 2, 508);
    ctx.fillStyle = '#ffd23e';
    rr(ctx, WIDTH / 2 - 160, 532, 320, 48, 12); ctx.fill();
    ctx.fillStyle = '#20303f';
    ctx.font = '800 19px system-ui, sans-serif';
    ctx.fillText('CLICK OR ENTER TO FLY AGAIN', WIDTH / 2, 563);
  }

  function draw(ctx, state) {
    FGWorld.draw(ctx, state);
    drawPlaneShadow(ctx, state);
    drawPlane(ctx, state);
    if (state.phase === 'flying') drawHUD(ctx, state);
    if (state.phase === 'title') drawTitle(ctx, state);
    if (state.phase === 'end') { drawHUD(ctx, state); drawEnd(ctx, state); }
  }

  return { draw };
})();
