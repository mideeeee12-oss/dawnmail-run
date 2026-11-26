// Dawnmail Run — the valley itself: projection, terrain, the river and the
// road, trees and houses, the mail rings, the clouds and the runway.
// Everything is drawn in code; nothing is loaded.

const FGWorld = (() => {
  const { WIDTH, HEIGHT, COURSE, RINGS, RING_RADIUS, STORMS } = FGConfig;

  // A small seeded random so the valley is the same valley every flight.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rand = mulberry32(20261126);
  const FIELD_COLORS = ['#79a84e', '#8fb45a', '#6f9c46', '#a9bd62', '#c2b06a', '#7fa653', '#97784a'];
  const CHUNKS = [[-260, -150], [-150, -60], [-60, 40], [40, 140], [140, 260]];
  const fieldColor = [];
  for (let b = 0; b < 48; b++) {
    fieldColor.push(CHUNKS.map(() => FIELD_COLORS[Math.floor(rand() * FIELD_COLORS.length)]));
  }

  const riverCenter = z => Math.sin(z * 0.0038) * 95;
  const roadCenter = z => -45 + Math.sin(z * 0.0021) * 34;

  const trees = [];
  for (let i = 0; i < 170; i++) {
    const z = 120 + rand() * 5000;
    let x = -250 + rand() * 500;
    if (Math.abs(x - riverCenter(z)) < 26) x += 60;
    if (z > COURSE.runwayStart - 60 && Math.abs(x) < 40) continue;
    trees.push({ x, z, s: 0.8 + rand() * 0.7 });
  }
  const houses = [];
  for (let i = 0; i < 15; i++) {
    const z = 260 + rand() * 4100;
    houses.push({ x: roadCenter(z) + (rand() > 0.5 ? 17 : -17), z, tone: rand() });
  }
  const farClouds = [];
  for (let i = 0; i < 18; i++) {
    farClouds.push({ x: -260 + rand() * 520, alt: 195 + rand() * 110, z: rand() * 6400, s: 0.7 + rand() * 1.1 });
  }

  function horizonY(state) {
    return HEIGHT * 0.40 + state.pitch * 30;
  }

  // Project a world point. Returns null when it is behind the plane.
  function project(state, x, alt, z) {
    const dz = z - state.z;
    if (dz < 4) return null;
    const persp = 260 / dz;
    const s = persp * 2.2;
    return {
      sx: WIDTH / 2 + (x - state.x) * s,
      sy: horizonY(state) + (state.alt - alt) * s,
      s,
      dz,
    };
  }

  function groundQuad(ctx, state, x0, x1, z0, z1, color) {
    const a = project(state, x0, 0, z1);
    const b = project(state, x1, 0, z1);
    const c = project(state, x1, 0, z0);
    const d = project(state, x0, 0, z0);
    if (!a || !b) return;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    if (c && d) { ctx.lineTo(c.sx, c.sy); ctx.lineTo(d.sx, d.sy); }
    else { ctx.lineTo(b.sx, HEIGHT + 40); ctx.lineTo(a.sx, HEIGHT + 40); }
    ctx.closePath();
    ctx.fill();
  }

  function drawSkyAndMountains(ctx, state) {
    const hy = horizonY(state);
    const sky = ctx.createLinearGradient(0, 0, 0, hy);
    sky.addColorStop(0, '#7ec3ee');
    sky.addColorStop(0.75, '#bfe3f7');
    sky.addColorStop(1, '#fdf3d8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, hy + 2);
    // The morning sun, low over the ridge.
    ctx.fillStyle = '#ffd964';
    ctx.beginPath(); ctx.arc(WIDTH * 0.78, hy - 118, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,217,100,0.35)';
    ctx.beginPath(); ctx.arc(WIDTH * 0.78, hy - 118, 52, 0, Math.PI * 2); ctx.fill();
    // Two ridge lines, drifting gently against the turn.
    const drift = -state.x * 0.06;
    ctx.fillStyle = '#8ba7c4';
    ctx.beginPath();
    ctx.moveTo(0, hy);
    for (let i = 0; i <= 8; i++) ctx.lineTo(i * 160 + drift, hy - 58 - Math.abs(Math.sin(i * 2.3 + 1)) * 66);
    ctx.lineTo(WIDTH, hy);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#6d8cae';
    ctx.beginPath();
    ctx.moveTo(0, hy);
    for (let i = 0; i <= 8; i++) ctx.lineTo(i * 160 - drift * 0.6, hy - 20 - Math.abs(Math.sin(i * 1.7 + 4)) * 44);
    ctx.lineTo(WIDTH, hy);
    ctx.closePath(); ctx.fill();
    // The valley floor base.
    ctx.fillStyle = '#79a84e';
    ctx.fillRect(0, hy, WIDTH, HEIGHT - hy);
  }

  function drawGroundBands(ctx, state) {
    const band = 130;
    const zFar = state.z + 2500;
    for (let z1 = Math.floor(zFar / band) * band; z1 > state.z + 12; z1 -= band) {
      const z0 = Math.max(z1 - band, state.z + 6);
      const bi = Math.abs(Math.floor(z0 / band)) % fieldColor.length;
      CHUNKS.forEach(([cx0, cx1], ci) => groundQuad(ctx, state, cx0, cx1, z0, z1, fieldColor[bi][ci]));
      // The river and the road ride on top of the fields.
      groundQuad(ctx, state, riverCenter(z0) - 13, riverCenter(z0) + 13, z0, z1, '#5ea9c9');
      groundQuad(ctx, state, roadCenter(z0) - 5, roadCenter(z0) + 5, z0, z1, '#8d8578');
      // The runway, when this band crosses it.
      if (z1 > COURSE.runwayStart && z0 < COURSE.runwayEnd) {
        groundQuad(ctx, state, -17, 17, Math.max(z0, COURSE.runwayStart), Math.min(z1, COURSE.runwayEnd), '#4c4f55');
      }
    }
    drawRunwayMarks(ctx, state);
  }

  function drawRunwayMarks(ctx, state) {
    // Threshold stripes and the centreline, only while the strip is near.
    for (let z = COURSE.runwayStart + 26; z < COURSE.runwayEnd; z += 52) {
      groundQuad(ctx, state, -1.1, 1.1, z, z + 22, 'rgba(255,255,255,0.85)');
    }
    for (let i = 0; i < 4; i++) {
      groundQuad(ctx, state, -13 + i * 7, -9 + i * 7, COURSE.runwayStart + 2, COURSE.runwayStart + 12, '#ffffff');
    }
    // The touchdown board the mail pilots aim for.
    const p = project(state, 0, 0, COURSE.runwayStart + 90);
    if (p && p.dz < 1500) {
      ctx.fillStyle = '#e8b23a';
      ctx.font = `700 ${Math.max(10, 9 * p.s)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('MAIL', p.sx, p.sy);
    }
  }

  function drawTree(ctx, p, size) {
    const h = 10 * p.s * size;
    ctx.fillStyle = '#7a5a38';
    ctx.fillRect(p.sx - h * 0.05, p.sy - h * 0.35, h * 0.1, h * 0.35);
    ctx.fillStyle = '#3f7a34';
    ctx.beginPath(); ctx.arc(p.sx, p.sy - h * 0.62, h * 0.34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4c8a3e';
    ctx.beginPath(); ctx.arc(p.sx - h * 0.2, p.sy - h * 0.45, h * 0.24, 0, Math.PI * 2); ctx.fill();
  }

  function drawHouse(ctx, p, tone) {
    const w = 13 * p.s;
    const h = 7 * p.s;
    ctx.fillStyle = tone > 0.5 ? '#e8ddc4' : '#dcc7a8';
    ctx.fillRect(p.sx - w / 2, p.sy - h, w, h);
    ctx.fillStyle = '#a34a38';
    ctx.beginPath();
    ctx.moveTo(p.sx - w * 0.62, p.sy - h);
    ctx.lineTo(p.sx, p.sy - h * 1.55);
    ctx.lineTo(p.sx + w * 0.62, p.sy - h);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd964';
    ctx.fillRect(p.sx - w * 0.16, p.sy - h * 0.62, w * 0.3, h * 0.34);
  }

  function drawCloudPuffs(ctx, p, size, dark, seed) {
    const r = Math.min(15 * p.s * size, dark ? 110 : 78);
    ctx.fillStyle = dark ? 'rgba(74,84,102,0.96)' : 'rgba(255,255,255,0.92)';
    const puffs = [[0, 0, 1], [-0.9, 0.16, 0.72], [0.9, 0.14, 0.78], [-0.4, -0.3, 0.66], [0.45, -0.32, 0.7], [0, 0.22, 0.85]];
    for (const [ox, oy, orad] of puffs) {
      ctx.beginPath();
      ctx.ellipse(p.sx + ox * r * (1 + seed * 0.1), p.sy + oy * r, r * orad, r * orad * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawRing(ctx, state, ring, status) {
    const p = project(state, ring.x, ring.alt, ring.z);
    if (!p || p.dz > 1700) return;
    const rx = RING_RADIUS * p.s;
    const ry = rx * 0.94;
    if (rx < 3) return;
    const pulse = status === 'waiting' ? 1 + Math.sin(state.elapsed * 4) * 0.03 : 1;
    ctx.lineWidth = Math.max(2.5, rx * 0.16);
    ctx.strokeStyle = status === 'taken' ? '#69c24a' : status === 'missed' ? 'rgba(160,160,160,0.6)' : '#f5a623';
    ctx.beginPath();
    ctx.ellipse(p.sx, p.sy, rx * pulse, ry * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = Math.max(1, rx * 0.05);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.ellipse(p.sx, p.sy, rx * 0.82 * pulse, ry * 0.82 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    // A little mail flag on top of the ring.
    ctx.fillStyle = status === 'waiting' ? '#d94f3d' : '#9a9a9a';
    const fw = Math.max(4, rx * 0.34);
    ctx.fillRect(p.sx - 1, p.sy - ry * pulse - fw * 0.9, 2, fw * 0.9);
    ctx.beginPath();
    ctx.moveTo(p.sx + 1, p.sy - ry * pulse - fw * 0.9);
    ctx.lineTo(p.sx + 1 + fw, p.sy - ry * pulse - fw * 0.55);
    ctx.lineTo(p.sx + 1, p.sy - ry * pulse - fw * 0.2);
    ctx.closePath(); ctx.fill();
  }

  function drawSprites(ctx, state) {
    const items = [];
    for (const t of trees) { const p = project(state, t.x, 0, t.z); if (p && p.dz > 35 && p.dz < 2400) items.push({ dz: p.dz, draw: () => drawTree(ctx, p, t.s) }); }
    for (const h of houses) { const p = project(state, h.x, 0, h.z); if (p && p.dz > 35 && p.dz < 2400) items.push({ dz: p.dz, draw: () => drawHouse(ctx, p, h.tone) }); }
    for (const c of farClouds) { const p = project(state, c.x, c.alt, c.z); if (p && p.dz > 160 && p.dz < 5200) items.push({ dz: p.dz, draw: () => drawCloudPuffs(ctx, p, c.s, false, c.x) }); }
    STORMS.forEach((storm, i) => {
      const p = project(state, storm.x, storm.alt, storm.z);
      if (p && p.dz > 55 && p.dz < 2600) items.push({ dz: p.dz, draw: () => drawCloudPuffs(ctx, p, 1.25, true, i * 3.7) });
    });
    items.sort((a, b) => b.dz - a.dz);
    for (const item of items) item.draw();
    // Rings after the clouds, so a ring never hides behind a puff.
    const ringItems = [];
    RINGS.forEach((ring, i) => {
      const p = project(state, ring.x, ring.alt, ring.z);
      if (p && p.dz > 45) ringItems.push({ dz: p.dz, ring, status: state.rings[i] });
    });
    ringItems.sort((a, b) => b.dz - a.dz);
    for (const item of ringItems) drawRing(ctx, state, item.ring, item.status);
  }

  function draw(ctx, state) {
    drawSkyAndMountains(ctx, state);
    drawGroundBands(ctx, state);
    drawSprites(ctx, state);
  }

  return { draw, project, horizonY };
})();
