/* ==========================================================================
   DRONE QUEST - interactive labs inside the buildings of World 1
   Every activity has a small hands-on scene (320x180 pixels, drawn in code)
   next to the written report. Lab.mount() runs one of them in the panel.
   ========================================================================== */
'use strict';

const LW = 320, LH = 180;

/* ---------------------------------------------------------------- framework */
const Lab = {
  host: null, cv: null, ctx: null, w: null, raf: 0, last: 0, t: 0, fx: [],

  mount(host, def) {
    this.unmount();
    this.host = host;
    host.innerHTML = `
      <p class="lab-hint">${def.hint}</p>
      <div class="lab-screen"><canvas class="lab-canvas" width="${LW}" height="${LH}" tabindex="0" aria-label="${esc(def.title)}"></canvas></div>
      <div class="lab-bar"><div class="lab-ctrls"></div><div class="lab-progress"></div></div>
      <div class="lab-msg" aria-live="polite"></div>`;
    this.cv = host.querySelector('canvas');
    this.ctx = this.cv.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.fx = []; this.t = 0; this.last = 0;
    const P = (e) => {
      const r = this.cv.getBoundingClientRect();
      return [(e.clientX - r.left) * LW / r.width, (e.clientY - r.top) * LH / r.height];
    };
    this.cv.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { this.cv.setPointerCapture(e.pointerId); } catch (_) { /* not supported */ }
      this.cv.focus({ preventScroll: true });
      const [x, y] = P(e);
      this.w && this.w.down && this.w.down(x, y);
    });
    this.cv.addEventListener('pointermove', (e) => {
      const [x, y] = P(e);
      const hot = this.w && this.w.move ? this.w.move(x, y, e.buttons > 0) : false;
      this.cv.style.cursor = hot ? 'pointer' : 'default';
    });
    const up = (e) => { const [x, y] = P(e); this.w && this.w.up && this.w.up(x, y); };
    this.cv.addEventListener('pointerup', up);
    this.cv.addEventListener('pointercancel', up);
    this.w = def.make();
    this.w.init && this.w.init();
    const loop = (ts) => {
      if (!this.w) return;
      const dt = Math.min(0.05, (ts - (this.last || ts)) / 1000);
      this.last = ts; this.t += dt;
      this.w.update && this.w.update(dt, this.t);
      drawOn(this.ctx, () => { this.w.draw(this.t); this.drawFx(dt); });
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  },
  unmount() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0; this.w = null; this.host = null; this.cv = null;
  },
  say(html, kind = 'info') {
    const m = this.host && this.host.querySelector('.lab-msg');
    if (!m) return;
    m.className = 'lab-msg ' + kind;
    m.innerHTML = html;
  },
  controls(list) {
    const box = this.host && this.host.querySelector('.lab-ctrls');
    if (!box) return;
    box.innerHTML = list.map((c, i) => `<button class="btn${c.on ? ' on' : ''}" data-i="${i}" type="button">${esc(c.label)}</button>`).join('');
    box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { Snd.move(); list[+b.dataset.i].fn(); }));
  },
  progress(items) {
    const box = this.host && this.host.querySelector('.lab-progress');
    if (!box) return;
    box.innerHTML = items.map((it) => `<span class="pg${it.done ? ' ok' : ''}">${it.done ? '&#10004;' : '&#9633;'} ${esc(it.label)}</span>`).join('');
  },
  burst(x, y, colors = [COL.yellow, COL.white, COL.orange]) {
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, v = 30 + Math.random() * 60;
      this.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 25, life: 0.5 + Math.random() * 0.4, c: colors[i % colors.length] });
    }
  },
  drawFx(dt) {
    this.fx = this.fx.filter((p) => (p.life -= dt) > 0);
    for (const p of this.fx) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 140 * dt; R(p.x, p.y, 2, 2, p.c); }
  },
  key(k, down) { return this.w && this.w.key ? !!this.w.key(k.length === 1 ? k.toLowerCase() : k, down) : false; }
};

/* ---------------------------------------------------------------- shared art */
const hyp = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* motor corners of a Quad X (front = up): [sx, sy, motor number, spin, arm colour] */
const QUAD = {
  FR: [1, -1, 1, 'ccw', 'orange'], RL: [-1, 1, 2, 'ccw', 'black'],
  FL: [-1, -1, 3, 'cw', 'orange'], RR: [1, 1, 4, 'cw', 'black']
};

function woodBG() {
  R(0, 0, LW, LH, '#a8743f');
  for (let y = 0; y < LH; y += 22) R(0, y, LW, 1, '#8f6034');
  const r = rng(11);
  for (let i = 0; i < 70; i++) R(Math.floor(r() * LW), Math.floor(r() * LH), 6 + Math.floor(r() * 14), 1, '#b98550');
}
function matBG(x, y, w, h) {
  R(x, y, w, h, '#1f4c40'); R(x + 1, y + 1, w - 2, h - 2, '#2f6b55');
  for (let i = x + 10; i < x + w - 1; i += 10) R(i, y + 1, 1, h - 2, '#367a61');
  for (let j = y + 10; j < y + h - 1; j += 10) R(x + 1, j, w - 2, 1, '#367a61');
}
function rrect(x, y, w, h, c, o = COL.out) {
  R(x + 2, y, w - 4, h, o); R(x, y + 2, w, h - 4, o); R(x + 1, y + 1, w - 2, h - 2, o);
  R(x + 2, y + 1, w - 4, h - 2, c); R(x + 1, y + 2, w - 2, h - 4, c);
}
function plates(cx, cy, hw = 16, hh = 20) {
  R(cx - hw - 1, cy - hh - 1, hw * 2 + 2, hh * 2 + 2, '#0f0f13');
  R(cx - hw, cy - hh, hw * 2, hh * 2, '#2b2b33');
  for (let y = cy - hh + 1; y < cy + hh; y += 2) for (let x = cx - hw + 1 + ((y >> 1) % 2) * 2; x < cx + hw; x += 4) R(x, y, 1, 1, '#363642');
  R(cx - hw, cy - hh, hw * 2, 1, '#4a4a56');
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) R(cx + sx * (hw - 4) - 1, cy + sy * (hh - 4) - 1, 2, 2, '#8a90a3');
}
function armLine(x0, y0, x1, y1, v, ghost) {
  if (ghost) { thick(x0, y0, x1, y1, 5, v === 'orange' ? 'rgba(255,138,28,0.4)' : 'rgba(20,20,30,0.45)'); return; }
  thick(x0, y0, x1, y1, 7, '#141418');
  thick(x0, y0, x1, y1, 5, v === 'orange' ? COL.orange : '#3a3a46');
  line(x0 - 1, y0 - 1, x1 - 1, y1 - 1, v === 'orange' ? COL.orangeL : '#5a5a6a');
}
function armTop(cx, cy, sx, sy, d, v, ghost) { armLine(cx + sx * 12, cy + sy * 12, cx + sx * d, cy + sy * d, v, ghost); }
function armTray(x, y, v) {
  R(x - 20, y - 3, 40, 7, '#141418');
  R(x - 19, y - 2, 38, 5, v === 'orange' ? COL.orange : '#3a3a46');
  R(x - 19, y - 2, 38, 1, v === 'orange' ? COL.orangeL : '#5a5a6a');
  circ(x + 16, y, 4, '#141418'); circ(x + 16, y, 3, v === 'orange' ? COL.orange : '#3a3a46'); R(x + 16, y, 1, 1, '#111');
}
function motorTop(x, y, o = {}) {
  circ(x, y, 7, '#111116'); circ(x, y, 6, '#30303a'); circ(x, y, 4, '#8a90a3'); circ(x, y, 2, '#c4c9d6');
  if (o.dot) R(x - 1, y - 1, 2, 2, '#ffffff');
  if (o.spin) {
    const a = o.t * 22 * (o.ccw ? -1 : 1), dx = Math.cos(a) * 12, dy = Math.sin(a) * 12;
    circ(x, y, 12, 'rgba(230,234,244,0.2)');
    thick(x - dx, y - dy, x + dx, y + dy, 2, 'rgba(245,246,252,0.9)');
  }
}
function spinArrow(cx, cy, r, ccw, t, c) {
  const span = 4.2, a0 = (ccw ? -1 : 1) * t * 3, n = Math.round(span * r);
  C.fillStyle = c;
  for (let i = 0; i <= n; i++) {
    const a = a0 + (span * i) / n;
    C.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1);
  }
  const ae = ccw ? a0 : a0 + span, d = ccw ? -1 : 1;
  const tx = cx + Math.cos(ae) * r, ty = cy + Math.sin(ae) * r;
  const ux = -Math.sin(ae) * d, uy = Math.cos(ae) * d, nx = Math.cos(ae), ny = Math.sin(ae);
  line(tx, ty, tx - ux * 4 + nx * 3, ty - uy * 4 + ny * 3, c);
  line(tx, ty, tx - ux * 4 - nx * 3, ty - uy * 4 - ny * 3, c);
}
function numTag(x, y, n, c = COL.yellow) {
  const s = String(n);
  if (s.length > 1) { R(x - 9, y - 5, 19, 11, COL.out); txt(s, x - 7, y - 3, { color: c }); return; }
  circ(x, y, 5, COL.out); txt(s, x - 3, y - 3, { color: c });
}
function pdbTop(x, y) {
  R(x - 11, y - 8, 22, 16, '#0f0f13'); R(x - 10, y - 7, 20, 14, '#2f8f4a');
  for (const [px, py] of [[-9, -6], [6, -6], [-9, 3], [6, 3]]) R(x + px, y + py, 3, 3, '#d9a64a');
  R(x - 3, y - 2, 6, 4, '#1d1d24'); R(x - 6, y - 1, 3, 1, '#3fae5e'); R(x + 3, y - 1, 3, 1, '#3fae5e');
}
function cubeTop(x, y, t = 0, lit = false) {
  R(x - 11, y - 7, 22, 14, '#0f0f13'); R(x - 10, y - 6, 20, 12, '#3a3a46');
  R(x - 6, y - 6, 12, 12, COL.out); R(x - 5, y - 5, 10, 10, COL.orange); R(x - 5, y - 5, 10, 2, COL.orangeL);
  arrow(x - 3, y - 3, 'up', '#9a4a00');
  if (lit) R(x + 7, y - 5, 2, 2, ['#5cff6a', '#4bb3ff', '#ffd23f'][Math.floor(t * 3) % 3]);
}
function gpsTop(x, y) { circ(x, y, 7, COL.out); circ(x, y, 6, '#3a3a46'); circ(x - 2, y - 2, 2, '#4a4a58'); arrow(x - 3, y - 3, 'up', COL.white); }
function rxTop(x, y) {
  line(x + 5, y - 3, x + 9, y - 9, COL.out); line(x - 5, y - 3, x - 9, y - 9, COL.out);
  R(x - 6, y - 4, 12, 8, COL.out); R(x - 5, y - 3, 10, 6, '#26262e'); R(x - 3, y - 2, 2, 1, '#5cff6a');
}
function telTop(x, y) { R(x + 3, y - 9, 2, 5, COL.out); R(x - 6, y - 5, 12, 10, COL.out); R(x - 5, y - 4, 10, 8, '#3d6fd0'); R(x - 3, y - 2, 2, 2, '#5cff6a'); }
function droneTop(x, y, t, spin, s = 1) {
  C.save(); C.translate(Math.round(x), Math.round(y)); C.scale(s, s);
  thick(-8, -8, 8, 8, 2, '#3a3a46'); thick(-8, 8, 8, -8, 2, '#3a3a46');
  thick(-8, -8, -2, -2, 2, COL.orange); thick(8, -8, 2, -2, 2, COL.orange);
  R(-3, -4, 6, 8, COL.out); R(-2, -3, 4, 6, '#3a3a46'); R(-1, -2, 2, 2, COL.orange);
  for (const [mx, my, ccw] of [[8, -8, 1], [-8, 8, 1], [-8, -8, 0], [8, 8, 0]]) {
    circ(mx, my, 2, '#111116');
    if (spin) {
      const a = t * 25 * (ccw ? -1 : 1);
      circ(mx, my, 5, 'rgba(230,234,244,0.28)');
      thick(mx - Math.cos(a) * 5, my - Math.sin(a) * 5, mx + Math.cos(a) * 5, my + Math.sin(a) * 5, 1, 'rgba(250,250,255,0.9)');
    } else thick(mx - 4, my, mx + 4, my, 1, '#c8cad6');
  }
  C.restore();
}
function inPoly(poly, x, y) {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
/* drag-and-drop helper shared by the workbenches (drag, or tap + tap) */
function dragMixin(o) {
  o.drag = null; o.carry = null;
  o.down = o.down || function (x, y) {
    if (this.carry) { const p = this.carry; this.carry = null; this.drop(p, x, y); return; }
    const p = this.pick(x, y);
    if (!p) { this.tap && this.tap(x, y); return; }
    this.drag = { p, sx: x, sy: y, ox: x - p.x, oy: y - p.y, moved: false };
    this.picked && this.picked(p);
  };
  o.move = o.move || function (x, y) {
    if (this.drag) {
      const d = this.drag;
      if (hyp(x, y, d.sx, d.sy) > 3) d.moved = true;
      d.p.x = x - d.ox; d.p.y = y - d.oy;
      return true;
    }
    if (this.carry) { this.carry.x = x; this.carry.y = y; return true; }
    this.mx = x; this.my = y;
    return !!this.pick(x, y) || (this.hot ? this.hot(x, y) : false);
  };
  o.up = o.up || function () {
    if (!this.drag) return;
    const d = this.drag;
    this.drag = null;
    if (d.moved) this.drop(d.p, d.p.x, d.p.y);
    else this.carry = d.p;
  };
  o.homeStep = function (list, dt) {
    for (const p of list) {
      if (!p.ret) continue;
      const d = hyp(p.x, p.y, p.hx, p.hy), s = 520 * dt;
      if (d <= s) { p.x = p.hx; p.y = p.hy; p.ret = false; }
      else { p.x += ((p.hx - p.x) / d) * s; p.y += ((p.hy - p.y) / d) * s; }
    }
  };
  return o;
}

/* ======================================================================
   1 - BASICS: how all the components of a drone talk to each other
   ====================================================================== */
const ICON = {
  tx(x, y) {
    R(x + 8, y - 14, 1, 7, COL.out);
    R(x - 12, y - 8, 24, 15, COL.out); R(x - 11, y - 7, 22, 13, '#3a3a46');
    circ(x - 6, y + 1, 3, '#20202a'); circ(x + 6, y + 1, 3, '#20202a');
    R(x - 6, y - 1, 1, 2, COL.grayL); R(x + 6, y, 1, 2, COL.grayL); R(x - 2, y - 6, 4, 3, '#9bbf6a');
  },
  rx(x, y) { rxTop(x, y); },
  gps(x, y) { R(x - 1, y + 4, 2, 5, COL.metal); gpsTop(x, y - 1); },
  tel(x, y) { telTop(x, y); },
  gcs(x, y) {
    R(x - 14, y - 11, 28, 18, COL.out); R(x - 13, y - 10, 26, 16, '#1f3b2a');
    line(x - 9, y + 2, x - 3, y - 5, '#5cff8a'); line(x - 3, y - 5, x + 4, y + 1, '#5cff8a'); line(x + 4, y + 1, x + 9, y - 6, '#5cff8a');
    R(x - 16, y + 7, 32, 4, COL.out); R(x - 15, y + 8, 30, 2, COL.grayL);
  },
  ap(x, y) {
    R(x - 12, y + 3, 24, 7, COL.out); R(x - 11, y + 4, 22, 5, '#3a3a46');
    R(x - 8, y - 9, 16, 13, COL.out); R(x - 7, y - 8, 14, 11, COL.orange); R(x - 7, y - 8, 14, 2, COL.orangeL); R(x + 4, y - 6, 3, 9, '#d9700f');
  },
  bat(x, y) {
    R(x - 14, y - 7, 28, 14, COL.out); R(x - 13, y - 6, 26, 12, '#3d6fd0'); R(x - 13, y - 1, 26, 3, COL.yellow);
    R(x + 14, y - 3, 4, 1, COL.red); R(x + 14, y + 1, 4, 1, '#111');
  },
  pdb(x, y) { pdbTop(x, y); },
  esc(x, y) { for (const k of [-4, 4]) { R(x - 9, y + k - 3, 18, 6, COL.out); R(x - 8, y + k - 2, 16, 4, '#3a6fd8'); R(x - 8, y + k - 2, 16, 1, '#6f97ea'); } },
  mot(x, y, t) {
    circ(x, y, 7, '#111116'); circ(x, y, 6, '#30303a'); circ(x, y, 4, '#8a90a3');
    const a = t * 14;
    thick(x - Math.cos(a) * 11, y - Math.sin(a) * 11, x + Math.cos(a) * 11, y + Math.sin(a) * 11, 2, 'rgba(240,242,250,0.9)');
  }
};
const LINKC = { pow: '#ff6a3a', sig: '#4bb3ff', data: '#5cff8a', radio: '#ffffff' };

const LABS = {};
LABS[1] = {
  tab: 'EXPLORE', title: 'How a drone works',
  hint: 'Click any component to see what it does, or follow a signal from the pilot\'s sticks to the motors.',
  make() {
    const N = {
      tx: { x: 34, y: 52, l: 'RADIO', d: '<b>Radio transmitter.</b> The pilot\'s sticks and switches. Every control is sent on its own channel: roll, pitch, throttle, yaw, flight mode...' },
      rx: { x: 106, y: 40, l: 'RX', d: '<b>Receiver.</b> Picks up the radio channels and sends all of them to the autopilot through a single SBUS cable.' },
      gps: { x: 166, y: 30, l: 'GPS', d: '<b>GPS + compass.</b> Position and heading. Needed for Loiter, RTL and autonomous missions.' },
      tel: { x: 228, y: 40, l: 'TELEM', d: '<b>Telemetry radio (drone side).</b> Two-way MAVLink link with the ground station: live data down, commands and missions up.' },
      gcs: { x: 288, y: 52, l: 'LAPTOP', d: '<b>Ground control station.</b> A laptop running Mission Planner: configuration, calibration, live telemetry and mission planning.' },
      ap: { x: 166, y: 88, l: 'AUTOPILOT', d: '<b>Autopilot</b> (Orange Cube running ArduCopter). Reads the pilot\'s commands and its sensors (gyroscope, accelerometer, barometer, compass, GPS) and decides how fast every motor must spin to keep the drone stable.' },
      bat: { x: 100, y: 146, l: 'BATTERY', d: '<b>LiPo battery (3S).</b> The energy source of the whole drone.' },
      pdb: { x: 152, y: 146, l: 'PDB', d: '<b>Power distribution board.</b> Splits the battery power between the four ESCs and the autopilot (POWER2 cable).' },
      esc: { x: 204, y: 146, l: 'ESCS', d: '<b>ESC</b> (electronic speed controller). Turns the PWM command of the autopilot into the three-phase current that drives a brushless motor. One per motor.' },
      mot: { x: 250, y: 146, l: 'MOTORS', d: '<b>Brushless motors + propellers.</b> Two spin clockwise and two counter-clockwise, so their torques cancel out and the drone does not spin on itself.' }
    };
    const L = [
      { a: 'tx', b: 'rx', k: 'radio', p: [[48, 48], [96, 40]] },
      { a: 'rx', b: 'ap', k: 'sig', p: [[114, 40], [132, 40], [132, 86], [153, 86]] },
      { a: 'gps', b: 'ap', k: 'data', p: [[166, 53], [166, 78]] },
      { a: 'ap', b: 'tel', k: 'data', p: [[179, 84], [228, 84], [228, 63]] },
      { a: 'tel', b: 'gcs', k: 'radio', p: [[236, 42], [272, 50]] },
      { a: 'bat', b: 'pdb', k: 'pow', p: [[115, 146], [141, 146]] },
      { a: 'pdb', b: 'ap', k: 'pow', p: [[156, 137], [156, 99]] },
      { a: 'pdb', b: 'esc', k: 'pow', p: [[163, 146], [194, 146]] },
      { a: 'ap', b: 'esc', k: 'sig', p: [[174, 99], [174, 120], [204, 120], [204, 136]] },
      { a: 'esc', b: 'mot', k: 'pow', p: [[214, 146], [242, 146]] }
    ];
    for (const l of L) {
      l.len = 0; l.seg = [];
      for (let i = 0; i < l.p.length - 1; i++) { const d = hyp(...l.p[i], ...l.p[i + 1]); l.seg.push(d); l.len += d; }
    }
    const at = (l, f) => {
      let d = f * l.len;
      for (let i = 0; i < l.seg.length; i++) {
        if (d <= l.seg[i]) { const [ax, ay] = l.p[i], [bx, by] = l.p[i + 1], k = d / l.seg[i]; return [ax + (bx - ax) * k, ay + (by - ay) * k]; }
        d -= l.seg[i];
      }
      return l.p[l.p.length - 1];
    };
    const STORIES = {
      signal: [
        ['tx', '<b>1/5</b> You push the throttle stick. The transmitter sends its position on channel 3.'],
        ['rx', '<b>2/5</b> The receiver picks up every channel and sends them all to the autopilot through one SBUS cable.'],
        ['ap', '<b>3/5</b> The autopilot mixes your command with its sensors and computes a PWM signal for each motor.'],
        ['esc', '<b>4/5</b> Each ESC turns its PWM signal into three-phase current...'],
        ['mot', '<b>5/5</b> ...and the brushless motors spin the propellers. The drone climbs!']
      ],
      power: [
        ['bat', '<b>1/3</b> The 3S LiPo battery is the only energy source on board.'],
        ['pdb', '<b>2/3</b> The power distribution board splits that power...'],
        ['esc', '<b>3/3</b> ...between the four ESCs (that feed the motors) and, through the POWER2 cable, the autopilot.']
      ]
    };
    return {
      sel: null, hov: null, story: null,
      init() {
        Lab.controls([
          { label: 'FOLLOW THE SIGNAL', fn: () => this.play('signal') },
          { label: 'FOLLOW THE POWER', fn: () => this.play('power') }
        ]);
        Lab.say('Everything on board is connected: <span class="k-pow">power</span>, <span class="k-sig">control signals</span>, <span class="k-data">data</span> and two <span class="k-radio">radio links</span>. Click a component.');
      },
      play(name) { this.story = { name, i: 0, t: 0 }; this.sel = STORIES[name][0][0]; Lab.say(STORIES[name][0][1]); },
      update(dt) {
        const s = this.story;
        if (!s) return;
        s.t += dt;
        if (s.t > 2.8) {
          s.t = 0; s.i++;
          const list = STORIES[s.name];
          if (s.i >= list.length) { this.story = null; return; }
          this.sel = list[s.i][0];
          Lab.say(list[s.i][1]);
        }
      },
      hit(x, y) { return Object.keys(N).find((k) => Math.abs(N[k].x - x) < 16 && Math.abs(N[k].y - y) < 15) || null; },
      down(x, y) {
        const k = this.hit(x, y);
        if (!k) return;
        this.story = null; this.sel = k; Snd.ok();
        Lab.say(N[k].d);
      },
      move(x, y) { this.hov = this.hit(x, y); return !!this.hov; },
      draw(t) {
        R(0, 0, LW, LH, '#1b1d28');
        for (let x = 0; x < LW; x += 16) R(x, 0, 1, LH, '#20232f');
        for (let y = 0; y < LH; y += 16) R(0, y, LW, 1, '#20232f');
        dashRect(72, 14, 202, 156, 'rgba(255,255,255,0.35)', 0);
        txt('ON THE DRONE', 270, 18, { align: 'right', color: '#6b7090' });
        const s = this.story, list = s ? STORIES[s.name] : null;
        for (const l of L) {
          let hot = this.sel && (l.a === this.sel || l.b === this.sel);
          if (s) hot = s.i > 0 && list[s.i - 1][0] === l.a && list[s.i][0] === l.b;
          const c = LINKC[l.k];
          for (let i = 0; i < l.p.length - 1; i++) {
            const [ax, ay] = l.p[i], [bx, by] = l.p[i + 1];
            if (l.k === 'radio') dashLine(ax, ay, bx, by, c, t * (hot ? 2 : 1));
            else if (hot) thick(ax, ay, bx, by, 2, c);
            else line(ax, ay, bx, by, c + '88');
          }
          const n = hot ? 3 : 1;
          for (let j = 0; j < n; j++) {
            const [px, py] = at(l, (t * (hot ? 0.9 : 0.45) + j / n) % 1);
            R(px - 1, py - 1, 3, 3, c);
          }
        }
        for (const [k, nd] of Object.entries(N)) {
          ICON[k](nd.x, nd.y, t);
          const on = k === this.sel, hv = k === this.hov;
          if (k === 'ap') txt(nd.l, 182, 90, { color: on ? COL.yellow : '#c4c9d6' });
          else txt(nd.l, nd.x, nd.y + 13, { align: 'center', color: on ? COL.yellow : '#c4c9d6' });
          if ((on && Math.floor(t * 4) % 2) || hv) {
            const c = on ? COL.yellow : COL.white, x0 = nd.x - 16, y0 = nd.y - 15, x1 = nd.x + 15, y1 = nd.y + 11;
            for (const [cx, cy, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
              R(Math.min(cx, cx + sx * 4), cy, 5, 1, c); R(cx, Math.min(cy, cy + sy * 4), 1, 5, c);
            }
          }
        }
        let lx = 24;
        for (const [k, name] of [['pow', 'POWER'], ['sig', 'CONTROL'], ['data', 'DATA'], ['radio', 'RADIO']]) {
          R(lx, 173, 5, 5, LINKC[k]); txt(name, lx + 8, 172, { color: '#9aa0b0' }); lx += name.length * 8 + 22;
        }
      }
    };
  }
};

/* ======================================================================
   2 - UNBOXING: open the kit and check the 11 objects
   ====================================================================== */
const KIT_ICON = {
  whitebox(x, y) { R(x - 12, y - 9, 24, 18, COL.out); R(x - 11, y - 8, 22, 16, '#f4f4f4'); R(x - 11, y - 8, 22, 3, '#dcdce4'); R(x - 3, y - 1, 6, 4, COL.orange); },
  radio(x, y) { ICON.tx(x, y + 2); },
  cube(x, y) { ICON.ap(x, y); },
  lipo(x, y) {
    R(x - 13, y - 7, 25, 14, COL.out); R(x - 12, y - 6, 23, 12, '#2f63c8'); R(x - 12, y - 6, 23, 2, '#4f83e8');
    R(x - 12, y - 1, 23, 3, COL.yellow); R(x + 12, y - 4, 3, 1, COL.red); R(x + 12, y + 3, 3, 1, '#1a1a1a');
  },
  checker(x, y) { R(x - 9, y - 10, 18, 20, COL.out); R(x - 8, y - 9, 16, 18, '#2e2e38'); R(x - 6, y - 7, 12, 7, '#9bbf6a'); R(x - 4, y - 5, 2, 3, '#2b3a1a'); R(x, y - 5, 2, 3, '#2b3a1a'); R(x - 5, y + 3, 3, 3, COL.red); R(x + 2, y + 3, 3, 3, COL.grayL); },
  pad(x, y) { ellipse(x, y, 13, 9, COL.out); ellipse(x, y, 12, 8, '#2f63c8'); ellipse(x, y, 8, 5, COL.yellow); R(x - 3, y - 2, 1, 5, COL.out); R(x + 3, y - 2, 1, 5, COL.out); R(x - 2, y, 5, 1, COL.out); },
  rpi(x, y) { R(x - 11, y - 8, 22, 16, COL.out); R(x - 10, y - 7, 20, 14, '#d9334a'); R(x - 10, y - 7, 20, 2, '#ea5a6c'); R(x - 2, y - 3, 4, 5, '#ffffff'); R(x - 1, y - 4, 2, 1, '#5cd65c'); },
  gps(x, y) { gpsTop(x, y); },
  telem(x, y) { telTop(x - 7, y + 1); telTop(x + 7, y + 1); },
  blackbox(x, y) { R(x - 12, y - 9, 24, 18, COL.out); R(x - 11, y - 8, 22, 16, '#26262e'); R(x - 11, y - 8, 22, 3, '#3a3a46'); },
  tools(x, y) {
    R(x - 5, y - 11, 10, 1, COL.out); R(x - 5, y - 11, 1, 5, COL.out); R(x + 4, y - 11, 1, 5, COL.out);
    R(x - 12, y - 6, 24, 14, COL.out); R(x - 11, y - 5, 22, 12, '#d94b4b'); R(x - 11, y - 1, 22, 1, '#a83434'); R(x - 2, y - 2, 4, 3, COL.grayL);
  }
};
LABS[2] = {
  tab: 'OPEN THE BOX', title: 'Unboxing the kit',
  hint: 'Open the box and check every object against the list, just like we did on the first day.',
  make() {
    const items = SITE.unboxing.map((it, i) => ({ ...it, n: i + 1, tx: 146 + (i % 4) * 46, ty: 30 + Math.floor(i / 4) * 52, x: 62, y: 98, k: -1, ok: false }));
    return {
      items, state: 'closed', t0: 0, hov: null,
      init() { this.prog(); Lab.controls([{ label: 'RESET', fn: () => this.reset() }]); Lab.say('Click the box to open it.'); },
      reset() { this.state = 'closed'; for (const it of items) { it.k = -1; it.ok = false; it.x = 62; it.y = 98; } this.prog(); Lab.say('Click the box to open it.'); },
      prog() { const n = items.filter((i) => i.ok).length; Lab.progress([{ label: `CHECKED ${n}/${items.length}`, done: n === items.length }]); },
      update(dt, t) {
        if (this.state === 'opening' && t - this.t0 > 0.6) { this.state = 'spawn'; this.t0 = t; }
        if (this.state === 'spawn') {
          let all = true;
          items.forEach((it, i) => {
            const k = clamp((t - this.t0 - i * 0.16) / 0.5, 0, 1);
            it.k = k;
            it.x = 62 + (it.tx - 62) * k; it.y = 98 + (it.ty - 98) * k - Math.sin(Math.PI * k) * 44;
            if (k < 1) all = false;
          });
          if (all) { this.state = 'check'; Lab.say(`${items.length} objects. Click each one to check it against the list.`); }
        }
      },
      hit(x, y) { return this.state === 'check' ? items.find((it) => Math.abs(it.x - x) < 20 && Math.abs(it.y - y) < 18) : null; },
      down(x, y) {
        if (this.state === 'closed' && x > 16 && x < 108 && y > 84 && y < 154) { this.state = 'opening'; this.t0 = Lab.t; Snd.ok(); return; }
        const it = this.hit(x, y);
        if (!it) return;
        if (!it.ok) { it.ok = true; Snd.ok(); Lab.burst(it.x, it.y, [COL.green, COL.white]); }
        this.prog();
        const n = items.filter((i) => i.ok).length;
        if (n === items.length) {
          Snd.win();
          Lab.say(`<b>Kit complete: ${n}/${n}</b> &#10004; Take photos of everything: the kit must be returned exactly as it was received!`, 'ok');
        } else Lab.say(`<b>${it.n}. ${esc(it.name)}</b><br>${esc(it.contents)}`);
      },
      move(x, y) {
        this.hov = this.hit(x, y);
        return !!this.hov || (this.state === 'closed' && x > 16 && x < 108 && y > 84 && y < 154);
      },
      draw(t) {
        woodBG();
        R(4, 6, 116, 168, 'rgba(0,0,0,0.12)');
        const k = this.state === 'closed' ? 0 : this.state === 'opening' ? clamp((Lab.t - this.t0) / 0.6, 0, 1) : 1;
        const ang = k * 2.2;
        // box
        R(19, 97, 86, 54, COL.out); R(20, 98, 84, 52, '#d9a35b'); R(20, 98, 84, 4, '#c48a45');
        R(60, 98, 4, 52, '#c48a45'); R(20, 140, 84, 10, '#c79250');
        R(30, 112, 22, 14, '#f4ecd6'); R(30, 112, 22, 3, COL.orange); txt('KIT', 29, 117, { color: COL.ink });
        if (ang > 0) R(21, 98, 82, 5, '#6b4423');
        for (const [hx, dir] of [[20, 1], [104, -1]]) {
          const ex = hx + dir * Math.cos(ang) * 42, ey = 98 - Math.sin(ang) * 30;
          thick(hx, 98, ex, ey, 6, COL.out); thick(hx, 98, ex, ey, 4, '#e8bb78');
        }
        if (this.state === 'closed' && Math.floor(t * 2) % 2) { txt('CLICK!', 62, 72, { align: 'center', color: COL.white, outline: COL.out }); arrow(59, 84, 'down', COL.white); }
        // grid of objects
        items.forEach((it) => {
          if (it.k < 0) return;
          if (this.state === 'check') {
            R(it.tx - 21, it.ty - 20, 42, 42, it.ok ? 'rgba(92,214,92,0.25)' : 'rgba(0,0,0,0.15)');
            if (it === this.hov) dashRect(it.tx - 21, it.ty - 20, 42, 42, COL.white, t);
          }
          KIT_ICON[it.icon](Math.round(it.x), Math.round(it.y));
          if (this.state === 'check') {
            numTag(it.tx - 15, it.ty - 14, it.n);
            if (it.ok) { R(it.tx + 11, it.ty + 13, 2, 3, COL.green); R(it.tx + 13, it.ty + 15, 1, 1, COL.green); R(it.tx + 13, it.ty + 10, 1, 5, COL.green); R(it.tx + 14, it.ty + 9, 2, 2, COL.green); }
          }
        });
      }
    };
  }
};

/* ======================================================================
   3 - FRAME ASSEMBLY (part 1): build the frame on the workbench
   ====================================================================== */
LABS[3] = {
  tab: 'WORKBENCH', title: 'Frame assembly workbench',
  hint: 'Build the frame: drag each part from the tray onto its dashed slot (or tap a part, then tap the slot). The front of the drone is at the top.',
  make() {
    const CX = 104, CY = 94, D = 46;
    const slots = [{ id: 'pdb', type: 'pdb', x: CX, y: CY }];
    for (const [k, [sx, sy, num, spin, color]] of Object.entries(QUAD)) {
      slots.push({ id: 'arm' + k, type: 'arm', corner: k, want: color, x: CX + sx * 30, y: CY + sy * 30 });
      slots.push({ id: 'mot' + k, type: 'motor', corner: k, want: spin, num, x: CX + sx * D, y: CY + sy * D });
    }
    const pieces = [{ id: 'pdb', type: 'pdb', v: 'pdb', hx: 262, hy: 30 }];
    [['orange', 238, 62], ['orange', 290, 62], ['black', 238, 78], ['black', 290, 78]].forEach(([v, x, y], i) => pieces.push({ id: 'arm' + i, type: 'arm', v, hx: x, hy: y }));
    [['ccw', 232, 110], ['ccw', 256, 110], ['cw', 282, 110], ['cw', 306, 110]].forEach(([v, x, y], i) => pieces.push({ id: 'mot' + i, type: 'motor', v, hx: x, hy: y }));
    const self = dragMixin({
      slots, pieces, showHint: false, done: false,
      init() { this.reset(true); },
      reset(first) {
        for (const p of pieces) { p.x = p.hx; p.y = p.hy; p.slot = null; p.ret = false; }
        this.done = false; this.carry = null; this.drag = null;
        this.ctrls(); this.prog();
        Lab.say(first ? 'Start with the <b>power distribution board (PDB)</b>: every ESC will take its power from it.' : 'Parts back in the tray. Start again with the PDB.');
      },
      ctrls() {
        Lab.controls([
          { label: this.showHint ? 'HIDE HINTS' : 'SHOW HINTS', on: this.showHint, fn: () => { this.showHint = !this.showHint; this.ctrls(); } },
          { label: 'RESET', fn: () => this.reset() }
        ]);
      },
      count(type) { return pieces.filter((p) => p.type === type && p.slot).length; },
      prog() {
        const a = this.count('pdb'), b = this.count('arm'), c = this.count('motor');
        Lab.progress([{ label: `PDB ${a}/1`, done: a === 1 }, { label: `ARMS ${b}/4`, done: b === 4 }, { label: `MOTORS ${c}/4`, done: c === 4 }]);
      },
      in(s) { return pieces.find((p) => p.slot === s.id); },
      armAt(corner) { return pieces.find((p) => p.slot === 'arm' + corner); },
      pick(x, y) {
        for (let i = pieces.length - 1; i >= 0; i--) {
          const p = pieces[i];
          if (p.slot || p.ret) continue;
          if (p.type === 'pdb' && Math.abs(x - p.x) <= 11 && Math.abs(y - p.y) <= 8) return p;
          if (p.type === 'arm' && Math.abs(x - p.x) <= 21 && Math.abs(y - p.y) <= 6) return p;
          if (p.type === 'motor' && hyp(x, y, p.x, p.y) <= 8) return p;
        }
        return null;
      },
      back(p) { p.ret = true; },
      drop(p, x, y) {
        const near = slots.filter((s) => s.type === p.type && !this.in(s)).map((s) => [s, hyp(s.x, s.y, x, y)]).sort((a, b) => a[1] - b[1])[0];
        if (!near || near[1] > 22) { this.back(p); if (x < 206) Lab.say('Drop the part on one of the dashed slots.', 'warn'); return; }
        const s = near[0];
        if (p.type === 'arm') {
          if (!this.count('pdb')) { this.back(p); Snd.no(); Lab.say('First fix the <b>power distribution board</b> to the top plate: the ESC inside every arm takes its power from it.', 'warn'); return; }
          if (s.want !== p.v) {
            this.back(p); Snd.no();
            Lab.say(p.v === 'orange' ? '<b>Orange arms go at the front</b> (look at the FRONT arrow): in flight they show where the drone is pointing.' : '<b>Black arms go at the back.</b> The orange ones mark the front.', 'warn');
            return;
          }
        }
        if (p.type === 'motor') {
          if (!this.armAt(s.corner)) { this.back(p); Snd.no(); Lab.say('Attach an arm at this corner first.', 'warn'); return; }
          if (s.want !== p.v) {
            this.back(p); Snd.no();
            Lab.say(p.v === 'ccw'
              ? 'This motor has a <b>white dot</b>: it spins <b>counter-clockwise (CCW)</b>. In ArduCopter\'s Quad X layout the CCW motors are number 1 (front-right) and number 2 (rear-left).'
              : 'This motor has <b>no dot</b>: it spins <b>clockwise (CW)</b>. In ArduCopter\'s Quad X layout the CW motors are number 3 (front-left) and number 4 (rear-right).', 'warn');
            return;
          }
        }
        p.slot = s.id; p.x = s.x; p.y = s.y;
        Snd.ok(); Lab.burst(s.x, s.y);
        if (p.type === 'pdb') Lab.say('PDB fixed to the top plate &#10004; Now the arms: <b>orange at the front, black at the back</b>.');
        else if (p.type === 'arm') Lab.say(this.count('arm') === 4 ? 'All four arms are on (each one hides an ESC inside) &#10004; Now the motors: look at the <b>white dots</b>!' : 'Arm attached.');
        else Lab.say(`Motor ${s.num} mounted: it spins <b>${s.want === 'ccw' ? 'counter-clockwise' : 'clockwise'}</b>.`);
        this.prog();
        if (pieces.every((q) => q.slot)) {
          this.done = true; Snd.win();
          Lab.say('<b>Frame assembled!</b> &#10004; Diagonal motors spin the same way (1 and 2 CCW, 3 and 4 CW), so their torques cancel out and the drone does not spin on itself. Watch the spin test.', 'ok');
        }
      },
      update(dt) { this.homeStep(pieces, dt); },
      draw(t) {
        woodBG();
        matBG(6, 6, 200, 168);
        arrow(CX - 3, 9, 'up', COL.yellow);
        txt('FRONT', CX, 15, { align: 'center', color: COL.yellow });
        for (const s of slots.filter((q) => q.type === 'arm')) {
          const [sx, sy] = QUAD[s.corner], p = this.in(s);
          if (p) armTop(CX, CY, sx, sy, D, p.v);
          else {
            if (this.showHint) armTop(CX, CY, sx, sy, D, s.want, true);
            dashLine(CX + sx * 16, CY + sy * 16, CX + sx * (D - 9), CY + sy * (D - 9), 'rgba(255,255,255,0.6)', t);
          }
        }
        plates(CX, CY);
        const pdb = slots[0];
        if (this.in(pdb)) pdbTop(CX, CY); else dashRect(CX - 11, CY - 8, 22, 16, 'rgba(255,255,255,0.75)', t);
        for (const s of slots.filter((q) => q.type === 'motor')) {
          const [sx, sy] = QUAD[s.corner], p = this.in(s);
          if (p) {
            motorTop(s.x, s.y, { dot: p.v === 'ccw', spin: this.done, ccw: s.want === 'ccw', t });
            if (this.done) {
              spinArrow(s.x, s.y, 16, s.want === 'ccw', t, COL.yellow);
              txt(s.want.toUpperCase(), s.x, s.y + sy * 22 - 3, { align: 'center', color: COL.yellow, outline: COL.out });
            }
          } else {
            dashRing(s.x, s.y, 8, 'rgba(255,255,255,0.65)', t);
            if (this.showHint && this.armAt(s.corner)) txt(s.want.toUpperCase(), s.x, s.y - 3, { align: 'center', color: COL.white, outline: COL.out });
          }
          numTag(s.x + sx * 15, s.y + sy * 13, s.num);
        }
        // tray
        R(210, 6, 106, 168, COL.out); R(211, 7, 104, 166, '#3a3f4f');
        if (this.done) {
          txt('FRAME', 263, 54, { size: 16, align: 'center', color: COL.yellow, outline: COL.out });
          txt('READY!', 263, 76, { size: 16, align: 'center', color: COL.yellow, outline: COL.out });
          star(228, 104, COL.yellow); star(298, 104, COL.yellow);
        }
        if (!this.done) {
          R(211, 42, 104, 1, '#2b2f3c'); R(211, 86, 104, 1, '#2b2f3c');
          txt('PDB', 216, 12, { color: '#9aa0b0' });
          txt('ARMS', 216, 46, { color: '#9aa0b0' });
          txt('MOTORS', 216, 90, { color: '#9aa0b0' });
          txt('CCW', 244, 121, { align: 'center', color: COL.white });
          txt('CW', 294, 121, { align: 'center', color: COL.white });
        }
        R(211, 130, 104, 1, '#2b2f3c');
        txt('QUAD X', 216, 136, { color: COL.yellow });
        txt('1,2 = CCW', 216, 148, { color: '#c4c9d6' });
        txt('3,4 = CW', 216, 160, { color: '#c4c9d6' });
        const held = (this.drag && this.drag.p) || this.carry;
        for (const p of pieces) {
          if (p.slot || p === held) continue;
          this.drawPiece(p);
        }
        if (held) { C.fillStyle = 'rgba(0,0,0,0.3)'; C.fillRect(Math.round(held.x - 8 + 3), Math.round(held.y + 6), 16, 3); this.drawPiece(held); }
      },
      drawPiece(p) {
        if (p.type === 'pdb') pdbTop(p.x, p.y);
        else if (p.type === 'arm') armTray(p.x, p.y, p.v);
        else motorTop(p.x, p.y, { dot: p.v === 'ccw' });
      }
    });
    return self;
  }
};

/* ======================================================================
   4 - RADIO CONTROL: transmitter, channels and the receiver test bench
   ====================================================================== */
LABS[4] = {
  tab: 'TRANSMITTER', title: 'Radio transmitter and receiver test bench',
  hint: 'Move the sticks (drag them, or use W A S D and the arrow keys) and flip the switches SB, SC and SF (click them or press 1, 2, 3). Every control has its own channel.',
  make() {
    const GL = [46, 98], GR = [138, 98], TRAVEL = 22;
    const SW = [['SB', 28, 3], ['SC', 52, 3], ['SF', 156, 2]];
    return {
      st: { yaw: 0, thr: -1, roll: 0, pitch: 0 }, sw: { SB: 0, SC: 0, SF: 0 },
      rev: false, motorCh: 3, grab: null, keys: {}, ang: 0, prev: [], flash: [0, 0, 0, 0, 0, 0, 0],
      init() {
        this.ctrls();
        Lab.say('This is the test from the guide: a motor (through its ESC) plugged straight into one receiver channel. Push the throttle (left stick, up and down): the PWM pulse gets wider and the motor spins faster. About 1 ms means stopped and 2 ms full power.');
      },
      ctrls() {
        Lab.controls([
          { label: `REVERSE CH2: ${this.rev ? 'ON' : 'OFF'}`, on: this.rev, fn: () => { this.rev = !this.rev; this.ctrls(); this.sayRev(); } },
          { label: 'THROTTLE DOWN', fn: () => { this.st.thr = -1; } }
        ]);
      },
      sayRev() {
        Lab.say(this.rev
          ? '<b>CH2 reversed:</b> pushing the right stick forward now <b>lowers</b> the pitch signal, which ArduPilot reads as nose down = fly forward. That is what most pilots set.'
          : '<b>CH2 normal:</b> with the default settings, pushing the stick forward <b>raises</b> the pitch signal and the drone would fly backwards.');
      },
      pwm(v) { return Math.round(1494 + v * 512); },
      chans() {
        const s = this.st, w = this.sw, p3 = [982, 1494, 2006];
        return [['ROLL', this.pwm(s.roll)], ['PITCH', this.pwm(this.rev ? -s.pitch : s.pitch)], ['THROT', this.pwm(s.thr)], ['YAW', this.pwm(s.yaw)],
          ['SB', p3[w.SB]], ['SC', p3[w.SC]], ['SF', w.SF ? 2006 : 982]];
      },
      flip(name) {
        const [, , n] = SW.find((s) => s[0] === name);
        this.sw[name] = (this.sw[name] + 1) % n;
        Snd.move();
      },
      key(k, down) {
        const handled = ['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '1', '2', '3'].includes(k);
        if (!handled) return false;
        if (down && !this.keys[k] && ['1', '2', '3'].includes(k)) this.flip(SW[+k - 1][0]);
        this.keys[k] = down;
        return true;
      },
      gimbalAt(x, y) {
        if (Math.abs(x - GL[0]) < 30 && Math.abs(y - GL[1]) < 30) return 'L';
        if (Math.abs(x - GR[0]) < 30 && Math.abs(y - GR[1]) < 30) return 'R';
        return null;
      },
      setStick(g, x, y) {
        const [cx, cy] = g === 'L' ? GL : GR;
        const vx = clamp((x - cx) / TRAVEL, -1, 1), vy = clamp(-(y - cy) / TRAVEL, -1, 1);
        if (g === 'L') { this.st.yaw = vx; this.st.thr = vy; } else { this.st.roll = vx; this.st.pitch = vy; }
      },
      onTag(x, y) { return y > 158 && y < 176 && Math.abs(x - 216) < 16; },
      down(x, y) {
        const g = this.gimbalAt(x, y);
        if (g) { this.grab = g; this.setStick(g, x, y); return; }
        for (const [name, sx] of SW) if (Math.abs(x - sx) < 7 && y > 24 && y < 50) { this.flip(name); return; }
        if (this.onTag(x, y)) {
          this.motorCh = this.motorCh === 3 ? 1 : 3; Snd.move();
          Lab.say(this.motorCh === 1
            ? 'The motor now listens to <b>CH1 (roll)</b>. The roll stick springs back to the centre, so the motor keeps spinning at half speed when you let go. That is why the throttle (CH3), which stays where you leave it, controls the power.'
            : 'Back on <b>CH3 (throttle)</b>: the left stick stays where you leave it and the motor speed follows it.');
        }
      },
      move(x, y) {
        if (this.grab) { this.setStick(this.grab, x, y); return true; }
        return !!this.gimbalAt(x, y) || SW.some(([, sx]) => Math.abs(x - sx) < 7 && y > 24 && y < 50) || this.onTag(x, y);
      },
      up() { this.grab = null; },            // the throttle stays, the other axes spring back in update()
      update(dt) {
        const k = this.keys, s = this.st, ease = Math.min(1, dt * 10);
        if (k.w) s.thr = Math.min(1, s.thr + dt * 1.2);
        if (k.s) s.thr = Math.max(-1, s.thr - dt * 1.2);
        if (this.grab !== 'L') s.yaw += ((k.d ? 1 : 0) - (k.a ? 1 : 0) - s.yaw) * ease;
        if (this.grab !== 'R') {
          s.roll += ((k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0) - s.roll) * ease;
          s.pitch += ((k.ArrowUp ? 1 : 0) - (k.ArrowDown ? 1 : 0) - s.pitch) * ease;
        }
        const ch = this.chans().map((c) => c[1]);
        ch.forEach((v, i) => { if (this.prev[i] != null && Math.abs(v - this.prev[i]) > 3) this.flash[i] = 0.5; this.flash[i] = Math.max(0, this.flash[i] - dt); });
        this.prev = ch;
        const m = ch[this.motorCh - 1];
        this.ang += Math.max(0, (m - 1040) / 966) * 40 * dt;
      },
      draw() {
        R(0, 0, LW, LH, '#20232f');
        // transmitter
        R(90, 4, 4, 20, COL.out); R(91, 5, 2, 18, '#55596a');
        rrect(6, 22, 172, 152, '#3a3a46');
        R(9, 23, 166, 2, '#4a4a58');
        for (const [name, sx, n] of SW) {
          R(sx - 3, 27, 7, 18, COL.out); R(sx - 2, 28, 5, 16, '#1e1e26');
          const pos = this.sw[name], ky = n === 3 ? 28 + pos * 6 : 28 + pos * 12;
          R(sx - 2, ky, 5, 4, COL.grayL); R(sx - 2, ky, 5, 1, '#ffffff');
          txt(name, sx, 48, { align: 'center', color: '#9aa0b0' });
        }
        R(64, 30, 60, 26, COL.out); R(65, 31, 58, 24, '#9bbf6a');
        txt('QUEST', 70, 34, { color: '#2b3a1a' });
        R(70, 45, Math.round(((this.chans()[2][1] - 982) / 1024) * 48), 4, '#2b3a1a'); R(70, 49, 48, 1, '#5b7a3a');
        for (const [g, [cx, cy]] of [['L', GL], ['R', GR]]) {
          rrect(cx - 28, cy - 28, 56, 56, '#26262e');
          R(cx, cy - 26, 1, 52, '#30303a'); R(cx - 26, cy, 52, 1, '#30303a');
          circ(cx, cy, 4, '#1a1a20');
          const vx = g === 'L' ? this.st.yaw : this.st.roll, vy = g === 'L' ? this.st.thr : this.st.pitch;
          const kx = cx + vx * TRAVEL, ky = cy - vy * TRAVEL;
          thick(cx, cy, kx, ky, 3, '#8a90a3');
          circ(kx, ky, 6, COL.out); circ(kx, ky, 5, COL.grayL); circ(kx - 1, ky - 1, 2, '#eef0f6');
        }
        txt('THR/YAW', GL[0], 130, { align: 'center', color: '#9aa0b0' });
        txt('PITCH/ROLL', GR[0], 130, { align: 'center', color: '#9aa0b0' });
        circ(70, 152, 4, '#1e1e26'); circ(114, 152, 4, '#1e1e26');
        txt('MODE 2', 92, 160, { align: 'center', color: '#6b7090' });
        // channel monitor
        R(184, 4, 134, 108, COL.out); R(185, 5, 132, 106, '#14161f');
        txt('CHANNELS', 190, 8, { color: COL.yellow });
        this.chans().forEach(([name, v], i) => {
          const y = 20 + i * 13, hot = this.flash[i] > 0;
          txt(`${i + 1} ${name}`, 190, y, { color: hot ? COL.yellow : '#c4c9d6' });
          txt(String(v), 314, y, { align: 'right', color: hot ? COL.yellow : '#8a90a3' });
          R(190, y + 9, 124, 3, '#2a2e40');
          R(190, y + 9, Math.round(((v - 982) / 1024) * 124), 3, i < 4 ? COL.ui : COL.yellow);
          if (i < 4) R(252, y + 8, 1, 5, '#55607a');
        });
        // receiver test bench: the motor and the PWM pulse of its channel
        R(184, 116, 134, 60, COL.out); R(185, 117, 132, 58, '#2a2e40');
        const v = this.chans()[this.motorCh - 1][1];
        txt('MOTOR', 216, 120, { align: 'center', color: COL.white });
        const mx = 216, my = 144, sp = Math.max(0, (v - 1040) / 966);
        if (sp > 0.25) circ(mx, my, 13, 'rgba(230,234,244,0.22)');
        circ(mx, my, 6, '#111116'); circ(mx, my, 5, '#30303a'); circ(mx, my, 3, '#8a90a3');
        thick(mx - Math.cos(this.ang) * 13, my - Math.sin(this.ang) * 13, mx + Math.cos(this.ang) * 13, my + Math.sin(this.ang) * 13, 2, '#eef0f6');
        R(mx - 15, 161, 30, 12, COL.out); R(mx - 14, 162, 28, 10, COL.ui); txt(`CH${this.motorCh}`, mx, 163, { align: 'center', color: COL.white });
        txt('PWM PULSE', 280, 120, { align: 'center', color: COL.white });
        R(245, 129, 70, 28, COL.out); R(246, 130, 68, 26, '#10202a');
        for (let i = 0; i <= 5; i++) R(248 + i * 12, 131, 1, 24, '#18303c');
        const w = Math.round((v / 2500) * 60), x0 = 248, yH = 135, yL = 151, g = '#5cff8a';
        R(x0, yH, 1, yL - yH + 1, g); R(x0, yH, w, 1, g); R(x0 + w, yH, 1, yL - yH + 1, g); R(x0 + w, yL, 312 - x0 - w, 1, g);
        txt(`${(v / 1000).toFixed(2)} MS`, 280, 163, { align: 'center', color: '#9be070' });
      }
    };
  }
};

/* ======================================================================
   5 - AUTOPILOT: flight modes on switch SB (ALTHOLD / LOITER / RTL)
   ====================================================================== */
LABS[5] = {
  tab: 'FLIGHT MODES', title: 'Autopilot flight modes',
  hint: 'Flip switch SB to change the flight mode (click it or press 1, 2, 3). Use the arrow keys to pilot. Switch the GPS off to see why Loiter and RTL only work outdoors.',
  make() {
    const G = 150, M = 12, HOMEX = 50, MODES = ['ALTHOLD', 'LOITER', 'RTL'];
    const r = rng(3);
    const wind = Array.from({ length: 14 }, () => ({ x: r() * LW, y: 70 + r() * 70, l: 6 + r() * 10 }));
    return {
      mode: 'ALTHOLD', gps: true, x: 210, alt: 3, vx: 0, tgtAlt: 3, tgtX: 210, armed: true, phase: null, keys: {}, warned: false,
      init() { this.ctrls(); this.sayMode(); },
      ctrls() {
        const list = [
          { label: this.gps ? 'GPS: OUTDOORS' : 'GPS: INDOORS', on: this.gps, fn: () => this.toggleGPS() },
          { label: 'PARAMETERS', fn: () => this.params() }
        ];
        if (!this.armed) list.unshift({ label: 'TAKE OFF', fn: () => this.takeoff() });
        Lab.controls(list);
      },
      sayMode() {
        const t = {
          ALTHOLD: '<b>ALTHOLD:</b> the barometer keeps the altitude constant, but nothing holds the position: the wind pushes the drone and the pilot has to correct it.',
          LOITER: '<b>LOITER:</b> the GPS holds the position and the barometer the altitude. Let go of the sticks and the drone stays put, even with wind.',
          RTL: '<b>RTL (return to launch):</b> the drone climbs to RTL_ALT (7 m), flies straight home and lands by itself. A good choice when something goes wrong.'
        };
        Lab.say(t[this.mode]);
      },
      setMode(m) {
        if (m === this.mode) return;
        if (m !== 'ALTHOLD' && !this.gps) {
          Snd.no();
          Lab.say(`<b>${m} needs a GPS fix.</b> Indoors (like in the classroom) there is no GPS, so use ALTHOLD. The autopilot would not even arm in Loiter.`, 'warn');
          return;
        }
        this.mode = m; Snd.ok();
        if (m === 'LOITER') this.tgtX = this.x;
        if (m === 'RTL') this.phase = this.alt < 6.95 ? 'climb' : 'home';
        else this.phase = null;
        if (this.armed) this.sayMode(); else Lab.say(`Mode set to ${m}. Press TAKE OFF to fly.`);
      },
      toggleGPS() {
        if (this.gps && this.mode !== 'ALTHOLD' && this.armed) { Snd.no(); Lab.say('Switch to ALTHOLD first: losing the GPS while flying in LOITER or RTL would trigger a failsafe.', 'warn'); return; }
        this.gps = !this.gps; this.ctrls();
        Lab.say(this.gps ? 'Outdoors: the GPS has a 3D fix, so LOITER and RTL are available.' : 'Indoors: no GPS fix. Only ALTHOLD is available.');
      },
      params() {
        Lab.say(`<b>Parameters set in Mission Planner</b> (values from the Hexsoon EDU450 guide):
          <table class="mini"><tr><th>Parameter</th><th>Value</th><th>What it does</th></tr>
          <tr><td>CAN_P1_DRIVER</td><td>1</td><td>Enables CAN port 1, where the GPS is connected</td></tr>
          <tr><td>GPS_TYPE</td><td>9</td><td>GPS connected through the CAN bus</td></tr>
          <tr><td>NTF_LED_TYPES</td><td>231</td><td>Which LEDs show the status of the drone</td></tr>
          <tr><td>BRD_SAFETY_DEFLT</td><td>0</td><td>No safety switch needed to arm</td></tr>
          <tr><td>BRD_BOOT_DELAY</td><td>3000</td><td>Waits 3 s at boot so every peripheral is ready</td></tr>
          <tr><td>RTL_ALT</td><td>700</td><td>Return altitude for RTL: 7 m (in cm)</td></tr></table>`);
      },
      takeoff() { this.armed = true; this.phase = null; this.tgtAlt = 3; if (this.mode === 'RTL') this.mode = this.gps ? 'LOITER' : 'ALTHOLD'; this.tgtX = this.x; this.ctrls(); Snd.ok(); this.sayMode(); },
      key(k, down) {
        if (down && ['1', '2', '3'].includes(k)) { this.setMode(MODES[+k - 1]); return true; }
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) { this.keys[k] = down; return true; }
        return false;
      },
      down(x, y) { if (x < 104 && y < 70) { const i = clamp(Math.floor((y - 18) / 14), 0, 2); this.setMode(MODES[i]); } },
      move(x, y) { return x < 104 && y < 70; },
      update(dt) {
        for (const w of wind) { w.x += 40 * dt; if (w.x > LW + 10) w.x = -20; }
        if (!this.armed) return;
        const k = this.keys, ix = (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0), iz = (k.ArrowUp ? 1 : 0) - (k.ArrowDown ? 1 : 0);
        if (this.mode === 'ALTHOLD' || this.mode === 'LOITER') this.tgtAlt = clamp(this.tgtAlt + iz * 2 * dt, 1, 9);
        if (this.mode === 'ALTHOLD') {
          this.vx += (ix * 70 + 10) * dt; this.vx *= 1 - 0.8 * dt;
          this.x += this.vx * dt;
          this.alt += clamp(this.tgtAlt - this.alt, -2 * dt, 2 * dt);
          if (this.x > 300 && !this.warned) { this.warned = true; Lab.say('The wind pushed the drone all the way to the net! In ALTHOLD the pilot has to correct the drift (&larr; key). Try LOITER.', 'warn'); }
        } else if (this.mode === 'LOITER') {
          this.tgtX = clamp(this.tgtX + ix * 45 * dt, 20, 300);
          this.vx = (this.tgtX - this.x) * 3;
          this.x += this.vx * dt + Math.sin(Lab.t * 7) * 0.05;
          this.alt += clamp(this.tgtAlt - this.alt, -2 * dt, 2 * dt);
        } else if (this.mode === 'RTL') {
          if (this.phase === 'climb') { this.alt = Math.min(7, this.alt + 1.6 * dt); if (this.alt >= 7) { this.phase = 'home'; Lab.say('RTL: at 7 m, now flying home.'); } }
          else if (this.phase === 'home') { const d = HOMEX - this.x; this.x += clamp(d, -40 * dt, 40 * dt); if (Math.abs(d) < 0.5) { this.phase = 'land'; Lab.say('RTL: above home, landing.'); } }
          else if (this.phase === 'land') {
            this.alt -= 0.9 * dt;
            if (this.alt <= 0) { this.alt = 0; this.armed = false; this.phase = null; Snd.win(); Lab.say('<b>Landed at home and disarmed</b> &#10004;', 'ok'); this.ctrls(); }
          }
        }
        this.x = clamp(this.x, 16, 304);
        if (this.x >= 304) this.vx = 0;
        if (this.x < 260) this.warned = false;
      },
      draw(t) {
        ['#7fd2f9', '#8dd9fa', '#9be0fb', '#a9e6fc', '#b7ecfd', '#c3f0fd'].forEach((c, i) => R(0, i * 25, LW, 25, c));
        Title.cloud(Math.round((90 + t * 6) % (LW + 60)) - 30, 30);
        for (const w of wind) R(w.x, w.y, w.l, 1, 'rgba(255,255,255,0.7)');
        for (let x = 6; x < LW; x += 52) R(x, 96, 2, 54, 'rgba(110,116,130,0.5)');
        R(0, G, LW, LH - G, COL.grass2); R(0, G, LW, 2, COL.grassL);
        ellipse(HOMEX, G + 1, 14, 3, COL.out); ellipse(HOMEX, G + 1, 13, 2, COL.yellow);
        txt('HOME', HOMEX, G + 8, { align: 'center', color: COL.white, outline: COL.out });
        const yR = G - 7 * M;
        dashLine(0, yR, LW, yR, 'rgba(255,255,255,0.9)', t);
        txt('RTL_ALT 7M', 316, yR - 10, { align: 'right', color: COL.white, outline: COL.out });
        const dy = G - this.alt * M - 10;
        ellipse(this.x, G + 1, Math.max(3, 12 - Math.round(this.alt)), 2, 'rgba(0,0,0,0.25)');
        drawDrone(this.x, dy, t, 2, this.armed);
        // switch SB
        win(4, 4, 98, 64);
        txt('SWITCH SB', 53, 8, { align: 'center', color: COL.grayD });
        R(12, 18, 6, 44, '#26262e');
        const idx = MODES.indexOf(this.mode);
        R(11, 19 + idx * 14, 8, 12, COL.grayL); R(11, 19 + idx * 14, 8, 2, '#ffffff');
        MODES.forEach((m, i) => txt(m, 24, 21 + i * 14, { color: m === this.mode ? COL.red : (m !== 'ALTHOLD' && !this.gps ? '#a0a4b0' : COL.ink) }));
        // HUD
        win(214, 4, 102, 40);
        txt(`ALT ${this.alt.toFixed(1)}M`, 222, 12, { color: COL.ink });
        txt(this.gps ? 'GPS 3D FIX' : 'GPS NO FIX', 222, 26, { color: this.gps ? '#2a8a3a' : COL.red });
        if (!this.armed) txt('DISARMED', 160, 120, { align: 'center', color: COL.white, outline: COL.out });
      }
    };
  }
};

/* ======================================================================
   6 - FRAME ASSEMBLY (part 2): install the electronics and wire them
   ====================================================================== */
LABS[6] = {
  tab: 'WIRING BENCH', title: 'Install and wire the electronics',
  hint: 'Place the Orange Cube exactly in the centre, then the GPS, the receiver and the telemetry radio. Finally drag a cable from every part (also the 4 motors and the POWER2 lead) to the right port of the Cube.',
  make() {
    const CX = 96, CY = 90, D = 46;
    const Z = { cube: [CX, CY], gps: [CX, 48], rx: [78, 110], tel: [114, 110] };
    const NAMES = { cube: 'Orange Cube (autopilot)', gps: 'GPS', rx: 'RC receiver', tel: 'Telemetry radio' };
    const DRAWS = { cube: cubeTop, gps: gpsTop, rx: rxTop, tel: telTop };
    const pieces = ['cube', 'gps', 'rx', 'tel'].map((id, i) => ({ id, hx: 30 + i * 44, hy: 164 }));
    const PORTS = ['POWER2', 'RCIN', 'USB', 'TELEM1', 'TELEM2', 'GPS1', 'CAN1', 'CAN2', 'MAIN 1', 'MAIN 2', 'MAIN 3', 'MAIN 4'].map((n, i) => ({ n, y: 22 + i * 12, by: null }));
    const SRC = [
      { id: 'power', name: 'POWER2 lead', want: 'POWER2', c: '#e04848', tag: 'PWR' },
      { id: 'rx', name: 'Receiver', want: 'RCIN', c: COL.yellow, tag: 'RX' },
      { id: 'tel', name: 'Telemetry radio', want: 'TELEM1', c: '#4bb3ff', tag: 'TEL' },
      { id: 'gps', name: 'GPS', want: 'CAN1', c: '#5cd65c', tag: 'GPS' }
    ];
    const MOT = {};
    for (const [k, [sx, sy, num]] of Object.entries(QUAD)) {
      MOT[num] = { x: CX + sx * D, y: CY + sy * D, sx, sy, k };
      SRC.push({ id: 'm' + num, name: `Motor ${num}`, want: `MAIN ${num}`, c: '#f0f0f0', tag: `M${num}`, num });
    }
    const TOTAL = SRC.length;
    const HINT = {
      power: 'The autopilot is powered with the <b>POWER2</b> cable that comes from the power distribution board.',
      rx: 'The receiver sends every channel through one cable: <b>SBUS OUT &rarr; RCIN</b>. That cable also powers the receiver.',
      tel: 'The telemetry radio goes to <b>TELEM1</b>.',
      gps: 'This GPS talks over the CAN bus: plug it into <b>CAN1</b>.'
    };
    const ZONE_HINT = {
      gps: 'The GPS goes on its mast at the <b>front</b> of the top plate.',
      rx: 'The receiver goes on the <b>left pad at the back</b>.',
      tel: 'The telemetry radio goes on the <b>right pad at the back</b>.'
    };
    const self = dragMixin({
      pieces, wires: {}, wire: null, wireCarry: null, done: false,
      init() { this.reset(true); },
      reset(first) {
        for (const p of pieces) { p.x = p.hx; p.y = p.hy; p.placed = false; p.ret = false; }
        for (const p of PORTS) p.by = null;
        this.wires = {}; this.wire = null; this.wireCarry = null; this.done = false; this.drag = null; this.carry = null;
        Lab.controls([{ label: 'RESET', fn: () => this.reset() }]);
        this.prog();
        Lab.say(first ? 'Start with the <b>Orange Cube</b>: drag it to the centre of the top plate.' : 'Everything is back in the tray.');
      },
      prog() {
        const c = pieces[0].placed ? 1 : 0, n = pieces.filter((p) => p.placed && p.id !== 'cube').length, w = Object.keys(this.wires).length;
        Lab.progress([{ label: `CUBE ${c}/1`, done: c === 1 }, { label: `PARTS ${n}/3`, done: n === 3 }, { label: `CABLES ${w}/${TOTAL}`, done: w === TOTAL }]);
      },
      srcPos(s) {
        if (s.id === 'power') return [80, 77];
        if (s.num) return [MOT[s.num].x, MOT[s.num].y];
        const p = pieces.find((q) => q.id === s.id);
        return [p.x, p.y];
      },
      srcAvailable(s) {
        if (!pieces[0].placed || this.wires[s.id]) return false;
        if (s.id === 'power' || s.num) return true;
        return pieces.find((q) => q.id === s.id).placed;
      },
      srcAt(x, y) { return SRC.find((s) => this.srcAvailable(s) && hyp(x, y, ...this.srcPos(s)) <= (s.num ? 9 : 8)); },
      portAt(x, y) { return x >= 199 && x <= 315 ? PORTS.find((p) => y >= p.y && y < p.y + 12) : null; },
      pick(x, y) {
        for (const p of pieces) if (!p.placed && !p.ret && hyp(x, y, p.x, p.y) <= 11) return p;
        return null;
      },
      picked(p) { Lab.say(`Placing: <b>${NAMES[p.id]}</b>`); },
      drop(p, x, y) {
        if (p.id !== 'cube' && !pieces[0].placed) { p.ret = true; Snd.no(); Lab.say('Start with the autopilot: every other part gets connected to it.', 'warn'); return; }
        const [zx, zy] = Z[p.id], d = hyp(x, y, zx, zy);
        if (p.id === 'cube') {
          if (d <= 9) this.place(p);
          else { p.ret = true; if (x > 68 && x < 124 && y > 60 && y < 122) { Snd.no(); Lab.say('Almost! The autopilot must be <b>exactly in the centre</b> of the top plate: its sensors (gyroscopes and accelerometers) assume they sit at the centre of the drone.', 'warn'); } }
          return;
        }
        if (d <= 12) { this.place(p); return; }
        p.ret = true;
        if (Object.entries(Z).some(([k, [ax, ay]]) => k !== p.id && hyp(x, y, ax, ay) <= 12)) { Snd.no(); Lab.say(ZONE_HINT[p.id], 'warn'); }
      },
      place(p) {
        const [zx, zy] = Z[p.id];
        p.placed = true; p.x = zx; p.y = zy;
        Snd.ok(); Lab.burst(zx, zy);
        Lab.say(p.id === 'cube'
          ? 'Autopilot centred &#10004; Now place the GPS, the receiver and the telemetry radio. You can already wire the motors and the POWER2 lead (red plug).'
          : `${NAMES[p.id]} in place &#10004; Drag its cable to the right port of the Cube (panel on the right).`);
        this.prog(); this.check();
      },
      connect(s, port) {
        if (port.by) { if (port.by !== s.id) { Snd.no(); Lab.say(`${port.n} is already in use.`, 'warn'); } return; }
        if (port.n !== s.want) {
          Snd.no();
          Lab.say(s.num ? `Motor ${s.num} must go to <b>MAIN OUT ${s.num}</b>. If the numbers do not match, the autopilot drives the wrong motor and the drone flips on take-off!` : HINT[s.id], 'warn');
          return;
        }
        port.by = s.id; this.wires[s.id] = port.n;
        Snd.ok(); Lab.burst(300, port.y + 5, [s.c, COL.white]);
        Lab.say(`${s.name} &rarr; <b>${port.n}</b> &#10004;`);
        this.prog(); this.check();
      },
      check() {
        if (this.done || !pieces.every((p) => p.placed) || Object.keys(this.wires).length < TOTAL) return;
        this.done = true; Snd.win();
        Lab.say('<b>Wiring complete!</b> &#10004; When the battery is connected the Cube boots and its LEDs light up. Next stop: calibrations.', 'ok');
      },
      down(x, y) {
        if (this.wireCarry) {
          const s = this.wireCarry, port = this.portAt(x, y);
          this.wireCarry = null;
          if (port) this.connect(s, port);
          return;
        }
        if (this.carry) { const p = this.carry; this.carry = null; this.drop(p, x, y); return; }
        const p = this.pick(x, y);
        if (p) { this.drag = { p, sx: x, sy: y, ox: x - p.x, oy: y - p.y, moved: false }; this.picked(p); return; }
        const s = this.srcAt(x, y);
        if (s) { this.wire = { s, x, y, sx: x, sy: y, moved: false }; Lab.say(`Cable from the <b>${s.name}</b>: drop it on a port.`); }
      },
      move(x, y) {
        if (this.wire) { this.wire.x = x; this.wire.y = y; if (hyp(x, y, this.wire.sx, this.wire.sy) > 3) this.wire.moved = true; return true; }
        if (this.wireCarry) { this.mx = x; this.my = y; return !!this.portAt(x, y); }
        if (this.drag) { const d = this.drag; if (hyp(x, y, d.sx, d.sy) > 3) d.moved = true; d.p.x = x - d.ox; d.p.y = y - d.oy; return true; }
        if (this.carry) { this.carry.x = x; this.carry.y = y; return true; }
        this.mx = x; this.my = y;
        return !!this.pick(x, y) || !!this.srcAt(x, y);
      },
      up(x, y) {
        if (this.wire) {
          const w = this.wire;
          this.wire = null;
          if (!w.moved) { this.wireCarry = w.s; this.mx = x; this.my = y; return; }
          const port = this.portAt(x, y);
          if (port) this.connect(w.s, port);
          return;
        }
        if (!this.drag) return;
        const d = this.drag;
        this.drag = null;
        if (d.moved) this.drop(d.p, d.p.x, d.p.y); else this.carry = d.p;
      },
      update(dt) { this.homeStep(pieces, dt); },
      draw(t) {
        woodBG();
        matBG(4, 4, 192, 146);
        arrow(CX - 3, 7, 'up', COL.yellow);
        txt('FRONT', CX + 8, 7, { color: COL.yellow });
        for (const m of Object.values(MOT)) armLine(CX + m.sx * 22, CY + m.sy * 24, m.x, m.y, QUAD[m.k][4]);
        plates(CX, CY, 26, 29);
        for (const [n, m] of Object.entries(MOT)) { motorTop(m.x, m.y, { dot: QUAD[m.k][3] === 'ccw' }); numTag(m.x + m.sx * 14, m.y + m.sy * 12, n); }
        R(CX - 1, 54, 2, 8, '#55596a');
        R(75, 75, 9, 5, COL.out); R(76, 76, 3, 3, '#e04848'); R(79, 76, 3, 3, '#26262e');
        txt('P2', 66, 66, { color: '#ff9a9a' });
        if (!pieces[0].placed) dashRect(CX - 11, CY - 7, 22, 14, 'rgba(255,255,255,0.8)', t);
        else for (const [k, [zx, zy]] of Object.entries(Z)) if (k !== 'cube' && !pieces.find((p) => p.id === k).placed) dashRing(zx, zy, 8, 'rgba(255,255,255,0.65)', t);
        for (const s of SRC) {
          if (!this.wires[s.id]) continue;
          const [sx, sy] = this.srcPos(s);
          thick(sx, sy, CX + (sx < CX ? -6 : 6), CY + (sy < CY ? -4 : 4), 2, s.c);
        }
        const held = (this.drag && this.drag.p) || this.carry;
        for (const p of pieces) if (p.placed && p.id !== 'cube') DRAWS[p.id](p.x, p.y);
        if (pieces[0].placed) cubeTop(CX, CY, t, this.done);
        if (this.wire || this.wireCarry) {
          const s = this.wire ? this.wire.s : this.wireCarry, [sx, sy] = this.srcPos(s);
          const ex = this.wire ? this.wire.x : this.mx, ey = this.wire ? this.wire.y : this.my;
          if (ex != null) thick(sx, sy, ex, ey, 2, s.c);
          ring(sx, sy, 9, COL.white);
        } else if (pieces[0].placed && !held) {
          for (const s of SRC) if (this.srcAvailable(s) && Math.floor(t * 2) % 2) { const [sx, sy] = this.srcPos(s); ring(sx, sy, s.num ? 9 : 7, 'rgba(255,210,63,0.9)'); }
        }
        // tray
        R(4, 152, 192, 24, COL.out); R(5, 153, 190, 22, '#3a3f4f');
        for (const p of pieces) if (!p.placed && p !== held) DRAWS[p.id](p.x, p.y);
        if (held) DRAWS[held.id](held.x, held.y);
        // port panel
        R(198, 4, 118, 172, COL.out); R(199, 5, 116, 170, '#1b1d28');
        txt('CUBE PORTS', 257, 9, { align: 'center', color: COL.orange });
        const hp = (this.wire || this.wireCarry) ? this.portAt(this.wire ? this.wire.x : this.mx, this.wire ? this.wire.y : this.my) : null;
        for (const p of PORTS) {
          if (p === hp) R(200, p.y, 114, 11, 'rgba(255,210,63,0.22)');
          R(203, p.y + 2, 10, 7, '#0b0b0f'); R(204, p.y + 3, 8, 5, '#3a3a46');
          for (let i = 0; i < 3; i++) R(205 + i * 3, p.y + 5, 1, 2, '#c9a64a');
          const s = p.by && SRC.find((q) => q.id === p.by);
          txt(p.n, 217, p.y + 2, { color: s ? '#9be070' : '#c4c9d6' });
          if (s) { txt(s.tag, 296, p.y + 2, { align: 'right', color: '#9aa0b0' }); R(300, p.y + 3, 7, 6, s.c); }
        }
      }
    });
    return self;
  }
};

/* ======================================================================
   7 - MORE CALIBRATIONS: radio failsafe, motor test, battery check
   ====================================================================== */
LABS[7] = {
  tab: 'CALIBRATION LAB', title: 'Calibrations: failsafe, motor test and battery',
  hint: 'Three quick experiments from the last calibrations. Pick one with the buttons.',
  make() {
    const CX = 104, CY = 92, D = 44;
    const TEST = { A: ['FR', 'front-right'], B: ['RR', 'rear-right'], C: ['RL', 'rear-left'], D: ['FL', 'front-left'] };
    /* failsafe gauge: a zoom on 940-1010 microseconds, where the important values are */
    const GY0 = 56, GY1 = 166, VLO = 940, VHI = 1010;
    const GY = (v) => Math.round(GY1 - ((clamp(v, VLO, VHI) - VLO) / (VHI - VLO)) * (GY1 - GY0));
    const LOST = 900;                                   // throttle signal when the radio link is lost
    return {
      mode: 'fs', thrMin: 982, fs: 975, radio: true, thr: -1, grab: false, status: null,
      test: null, seq: [], bat: null, meas: 0,
      init() { this.enter('fs'); },
      ctrls() {
        const list = [['fs', 'FAILSAFE'], ['motor', 'MOTOR TEST'], ['bat', 'BATTERY']].map(([m, l]) => ({ label: l, on: this.mode === m, fn: () => this.enter(m) }));
        if (this.mode === 'fs') {
          list.push(
            { label: this.radio ? 'RADIO: ON' : 'RADIO: OFF', on: this.radio, fn: () => { this.radio = !this.radio; this.ctrls(); this.fsStatus(); } },
            { label: 'FS -1', fn: () => this.setFS(this.fs - 1) },
            { label: 'FS +1', fn: () => this.setFS(this.fs + 1) });
        }
        if (this.mode === 'motor') list.push({ label: 'TEST ALL A-D', fn: () => { this.seq = ['A', 'B', 'C', 'D']; this.next(); } });
        if (this.mode === 'bat') list.push({ label: 'MEASURE', fn: () => this.measure() });
        Lab.controls(list);
      },
      enter(m) {
        this.mode = m; this.status = null; this.test = null; this.seq = [];
        if (m === 'fs') { this.radio = true; this.thr = -1; this.fs = 975; }
        this.ctrls();
        Lab.progress([]);
        if (m === 'fs') this.fsStatus();
        if (m === 'motor') Lab.say('Mission Planner\'s motor test spins one motor at a time. The letters go <b>clockwise starting at the front-right motor</b>: they are not the motor numbers! Click A, B, C or D.');
        if (m === 'bat') Lab.say('Check every battery before flying: each cell of the 3S LiPo must be at least <b>3.7 V</b>. Press MEASURE (simulation: every press measures a random battery).');
      },
      /* ---- failsafe ---- */
      signal() { return this.radio ? Math.round(982 + ((this.thr + 1) / 2) * 1024) : LOST; },
      fsState() {
        if (!this.radio) return this.fs > LOST ? 'lost' : 'blind';
        if (this.fs >= this.thrMin) return 'high';
        if (this.thrMin - this.fs < 10) return 'prearm';
        return 'ok';
      },
      setFS(v) { this.fs = clamp(v, 890, 1000); this.fsStatus(); },
      fsStatus() {
        const st = this.fsState(), gap = this.thrMin - this.fs;
        this.status = st;
        const M = {
          prearm: [`<b>Step 1 - the safety gap.</b> With the throttle stick down, your radio sends its lowest value: <b>${this.thrMin}</b>. FS_THR_VALUE (<b>${this.fs}</b>) is the red line: below it, the autopilot decides that the radio is lost. Between them there must be a gap of at least 10 (the yellow band). Now the gap is only <b>${gap}</b>, so ArduPilot refuses to arm: <b>PreArm: Check FS_THR_VALUE</b>. Press <b>FS -1</b> until the green line leaves the yellow band.`, 'warn'],
          ok: [`<b>Step 2 - ready.</b> The gap is <b>${gap}</b>: the autopilot can arm &#10004;. Now press the <b>RADIO</b> button to switch the radio off, as if the link was lost in flight.`, 'ok'],
          lost: [`<b>Step 3 - radio lost.</b> Without the radio the throttle signal falls to <b>${LOST}</b>, under the red line (<b>${this.fs}</b>). The autopilot notices it and starts the failsafe action recommended in the guide: <b>RTL</b>, the drone flies home by itself. Switch the radio on again to take back control.`, 'warn'],
          high: [`The red line (<b>${this.fs}</b>) is <b>above</b> the lowest value of the radio (<b>${this.thrMin}</b>): just by putting the stick down, the autopilot would think the radio is lost! Press <b>FS -1</b>.`, 'warn'],
          blind: [`The red line is so low that even a lost radio (${LOST}) is not under it: the autopilot would never notice! Press <b>FS +1</b>.`, 'warn']
        };
        Lab.say(...M[st]);
      },
      /* ---- motor test ---- */
      next() { const L = this.seq.shift(); if (L) this.run(L); },
      run(L) {
        const [k, pos] = TEST[L], [, , num, spin] = QUAD[k];
        this.test = { L, k, t: 0 };
        Snd.beep(spin === 'ccw' ? 440 : 520, 0.2, 'sawtooth', 0.03);
        Lab.say(`Test motor <b>${L}</b> &rarr; motor <b>${num}</b> (${pos}) spins <b>${spin === 'ccw' ? 'counter-clockwise' : 'clockwise'}</b>.`);
      },
      /* ---- battery ---- */
      measure() { this.meas = 0.8; this.bat = null; Snd.move(); },
      /* ---- input ---- */
      key(k, down) {
        if (this.mode === 'fs' && down) {
          if (k === 'ArrowLeft' || k === 'ArrowRight') { this.setFS(this.fs + (k === 'ArrowLeft' ? -1 : 1)); return true; }
          if (k === 'ArrowUp' || k === 'ArrowDown') { this.thr = clamp(this.thr + (k === 'ArrowUp' ? 0.1 : -0.1), -1, 1); return true; }
        }
        if (this.mode === 'motor' && down && ['a', 'b', 'c', 'd'].includes(k)) { this.seq = []; this.run(k.toUpperCase()); return true; }
        return false;
      },
      onStick(x, y) { return x > 16 && x < 54 && y > 32 && y < 76; },
      setStick(y) { this.thr = clamp((54 - y) / 15, -1, 1); },
      down(x, y) {
        if (this.mode === 'fs' && this.onStick(x, y)) { this.grab = true; this.setStick(y); }
        else if (this.mode === 'motor') {
          const i = Math.floor((y - 26) / 28);
          if (x > 214 && x < 312 && i >= 0 && i < 4 && (y - 26) % 28 < 22) { this.seq = []; this.run('ABCD'[i]); }
        }
      },
      move(x, y) {
        if (this.grab) { this.setStick(y); return true; }
        if (this.mode === 'fs') return this.onStick(x, y);
        if (this.mode === 'motor') return x > 214 && x < 312 && y > 26 && y < 136;
        return false;
      },
      up() { this.grab = false; },
      update(dt) {
        if (this.test) { this.test.t += dt; if (this.test.t > 2) { this.test = null; this.next(); } }
        if (this.meas > 0) {
          this.meas -= dt;
          if (this.meas <= 0) {
            const base = 3.52 + Math.random() * 0.68;
            const cells = [0, 1, 2].map(() => +(base + (Math.random() - 0.5) * 0.04).toFixed(2));
            const low = Math.min(...cells) < 3.7;
            this.bat = { cells, low };
            if (low) { Snd.no(); Lab.say('At least one cell is <b>below 3.7 V</b>: charge this battery before flying.', 'warn'); }
            else { Snd.ok(); Lab.say('All cells above 3.7 V: <b>ready to fly</b> &#10004; (a fully charged LiPo cell reads 4.2 V).', 'ok'); }
          }
        }
      },
      draw(t) {
        if (this.mode === 'fs') this.drawFS(t);
        else if (this.mode === 'motor') this.drawMotor(t);
        else this.drawBat(t);
      },
      drawFS(t) {
        R(0, 0, LW, LH, '#1b1d28');
        R(102, 0, 1, LH, '#2a2e40'); R(214, 0, 1, LH, '#2a2e40');
        /* 1 - the radio */
        txt('1 RADIO', 8, 6, { color: COL.yellow });
        R(70, 12, 3, 14, COL.out); R(71, 13, 1, 13, '#55596a');
        rrect(12, 24, 84, 60, '#3a3a46');
        rrect(18, 32, 34, 44, '#26262e'); R(35, 35, 1, 38, '#30303a');
        const ky = Math.round(54 - this.thr * 15);
        thick(35, 54, 35, ky, 3, '#8a90a3'); circ(35, ky, 5, COL.out); circ(35, ky, 4, COL.grayL); circ(34, ky - 1, 1, '#eef0f6');
        rrect(58, 32, 34, 44, '#26262e'); circ(75, 54, 5, COL.out); circ(75, 54, 4, COL.grayL);
        R(84, 27, 5, 3, this.radio ? '#5cff6a' : '#7a2a2a');
        txt('THR', 35, 77, { align: 'center', color: '#9aa0b0' });
        txt(this.radio ? 'RADIO ON' : 'RADIO OFF', 54, 92, { align: 'center', color: this.radio ? '#9be070' : '#ff7a7a' });
        txt('STICK DOWN', 54, 120, { align: 'center', color: '#8a90a3' });
        txt('SENDS', 54, 132, { align: 'center', color: '#8a90a3' });
        txt(String(this.thrMin), 54, 144, { align: 'center', color: '#9be070' });
        /* radio link */
        if (this.radio) for (let k = 0; k < 3; k++) R(Math.round(97 + ((t * 18 + k * 3) % 9)), 52, 1, 5, COL.white);
        else { line(96, 50, 102, 58, COL.red); line(102, 50, 96, 58, COL.red); }
        /* 2 - the signal the autopilot receives */
        txt('2 SIGNAL', 108, 6, { color: COL.yellow });
        const sig = this.signal();
        txt(String(sig), 158, 20, { size: 16, align: 'center', color: this.radio ? COL.white : '#ff7a7a' });
        txt('THROTTLE PWM', 158, 40, { align: 'center', color: '#8a90a3' });
        const gx = 122, gw = 22;
        R(gx - 1, GY0 - 1, gw + 2, GY1 - GY0 + 3, COL.out);
        R(gx, GY0, gw, GY1 - GY0 + 1, '#2e3240');
        const yFS = GY(this.fs), yM = GY(this.fs + 10), yMin = GY(this.thrMin);
        R(gx, GY0, gw, Math.max(0, yMin - GY0), '#24513a');           // normal range of the stick
        R(gx, yFS, gw, GY1 - yFS + 1, '#6a2228');                      // below the red line = radio lost
        if (yM < yFS) R(gx, yM, gw, yFS - yM, 'rgba(255,210,63,0.45)'); // the 10 safety gap
        R(gx - 3, yMin, gw + 6, 1, '#5cd65c');
        R(gx - 3, yFS, gw + 6, 1, '#ff5c5c');
        txt(`MIN ${this.thrMin}`, gx + gw + 6, yMin - 4, { color: '#9be070' });
        const ly = Math.abs(yFS - yMin) < 10 ? yMin + 10 : yFS - 4;
        txt(`FS ${this.fs}`, gx + gw + 6, ly, { color: '#ff8a8a' });
        txt('LOST', gx + gw + 6, clamp(Math.max(yFS + 10, ly + 12), 0, GY1 - 8), { color: '#c05058' });
        if (yFS - yM >= 9) txt('10', gx + gw / 2, Math.round((yM + yFS) / 2) - 3, { align: 'center', color: '#3a2a00' });
        arrow(gx - 9, GY(sig) - 3, 'right', sig > VHI ? COL.yellow : COL.white);
        /* 3 - what the autopilot does */
        txt('3 AUTOPILOT', 222, 6, { color: COL.yellow });
        R(220, 18, 96, 62, COL.out); R(221, 19, 94, 60, '#10202a');
        const LINES = {
          ok: [['RADIO OK', '#9be070'], ['READY', '#9be070'], ['TO ARM', '#9be070']],
          prearm: [['PREARM:', '#ff7a7a'], ['CHECK', '#ff7a7a'], ['FS_THR_', '#ff7a7a'], ['VALUE', '#ff7a7a']],
          lost: [['RADIO LOST', '#ff7a7a'], ['FAILSAFE', COL.yellow], ['-> RTL', COL.yellow]],
          high: [['STICK DOWN', '#ff7a7a'], ['LOOKS LIKE', '#ff7a7a'], ['RADIO LOST', '#ff7a7a']],
          blind: [['RADIO LOST', '#ff7a7a'], ['NOT', '#ff7a7a'], ['DETECTED!', '#ff7a7a']]
        }[this.status] || [];
        LINES.forEach(([s, c], i) => { if (this.status !== 'lost' || i || Math.floor(t * 3) % 2) txt(s, 268, 24 + i * 13, { align: 'center', color: c }); });
        R(216, 150, 100, 2, COL.grassL); R(216, 152, 100, 24, COL.grass2);
        ellipse(236, 152, 9, 2, COL.out); ellipse(236, 152, 8, 1, COL.yellow);
        txt('HOME', 236, 158, { align: 'center', color: COL.white, outline: COL.out });
        if (this.status === 'lost') {
          const k = (t % 5) / 5, x = 300 - Math.min(1, k / 0.65) * 64, y = k < 0.7 ? 110 : 110 + ((k - 0.7) / 0.3) * 36;
          drawDrone(x, Math.min(146, y), t, 1, true);
        } else {
          drawDrone(286, 146, t, 1, false);
          txt(this.status === 'ok' ? 'CAN ARM' : "CAN'T ARM", 268, 100, { align: 'center', color: this.status === 'ok' ? '#9be070' : '#ff7a7a' });
        }
      },
      drawMotor(t) {
        woodBG();
        matBG(6, 6, 200, 168);
        arrow(CX - 3, 9, 'up', COL.yellow);
        txt('FRONT', CX, 15, { align: 'center', color: COL.yellow });
        for (const [, [sx, sy, , , v]] of Object.entries(QUAD)) armTop(CX, CY, sx, sy, D, v);
        plates(CX, CY);
        cubeTop(CX, CY, t, true);
        for (const [k, [sx, sy, num, spin]] of Object.entries(QUAD)) {
          const x = CX + sx * D, y = CY + sy * D, on = this.test && this.test.k === k;
          motorTop(x, y, { dot: spin === 'ccw', spin: on, ccw: spin === 'ccw', t });
          if (on) { spinArrow(x, y, 16, spin === 'ccw', t, COL.yellow); txt(this.test.L, x + sx * 20 - 4, y - 4, { color: COL.yellow, outline: COL.out }); }
          numTag(x - sx * 14, y + sy * 13, num);
        }
        R(210, 6, 106, 168, COL.out); R(211, 7, 104, 166, '#3a3f4f');
        txt('MOTOR TEST', 263, 12, { align: 'center', color: COL.yellow });
        'ABCD'.split('').forEach((L, i) => {
          const y = 26 + i * 28, on = this.test && this.test.L === L;
          R(216, y, 94, 22, COL.out); R(217, y + 1, 92, 20, on ? COL.yellow : COL.white); R(217, y + 18, 92, 3, on ? '#d9a82a' : '#c6c8d4');
          txt(`MOTOR ${L}`, 263, y + 7, { align: 'center', color: COL.ink });
        });
        txt('A-D GO', 263, 144, { align: 'center', color: '#c4c9d6' });
        txt('CLOCKWISE', 263, 156, { align: 'center', color: '#c4c9d6' });
      },
      drawBat(t) {
        woodBG();
        R(18, 69, 114, 52, COL.out); R(19, 70, 112, 50, '#2f63c8'); R(19, 70, 112, 3, '#4f83e8');
        R(19, 88, 112, 11, COL.yellow); txt('3S LIPO', 75, 90, { align: 'center', color: COL.ink });
        thick(131, 80, 150, 70, 3, COL.red); thick(131, 86, 150, 92, 3, '#1a1a1a');
        ['#1a1a1a', '#e04848', '#e04848', '#e04848'].forEach((c, i) => line(131, 104 + i * 3, 186, 108 + i * 3, c));
        R(184, 40, 120, 102, COL.out); R(185, 41, 118, 100, '#2e2e38');
        R(192, 48, 104, 62, COL.out); R(193, 49, 102, 60, '#9bbf6a');
        const ink = '#22301a';
        if (this.meas > 0) { if (Math.floor(t * 4) % 2) txt('MEASURING', 244, 74, { align: 'center', color: ink }); }
        else if (!this.bat) txt('----', 244, 74, { align: 'center', color: ink });
        else {
          this.bat.cells.forEach((v, i) => txt(`C${i + 1} ${v.toFixed(2)}V`, 200, 53 + i * 12, { color: v < 3.7 ? '#a01818' : ink }));
          txt(`SUM ${this.bat.cells.reduce((a, b) => a + b, 0).toFixed(2)}V`, 200, 94, { color: ink });
          const ok = !this.bat.low;
          if (ok || Math.floor(t * 3) % 2) txt(ok ? 'READY TO FLY' : 'CHARGE IT!', 244, 120, { align: 'center', color: ok ? '#9be070' : '#ff7a7a' });
        }
        R(196, 128, 8, 6, COL.red); R(284, 128, 8, 6, COL.grayL);
      }
    };
  }
};

/* ======================================================================
   8 - FLIGHT TESTS: our flight in the DroneLab
   Real set-up: a geofence drawn before the flight, switch
   SB = LOITER / LOITER / LAND and take-off to 7 m.
   ====================================================================== */
LABS[8] = {
  tab: 'FLIGHT SIM', title: 'DroneLab flight simulator with geofence',
  hint: 'Our real flight: first we drew a geofence, then we flew with switch SB = LOITER / LOITER / LAND and took off to 7 m. Draw the fence by clicking its corners on the field, take off, fly in LOITER with W A S D or the arrow keys (or hold the mouse on the field) and land with LAND.',
  make() {
    const HOME = [60, 138], SB = ['LOITER', 'LOITER', 'LAND'], TOP = 7, MARGIN = 5, MAXPTS = 12;
    const inPoly = (x, y, P) => {
      let c = false;
      for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
        const [xi, yi] = P[i], [xj, yj] = P[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const segDist = (px, py, [ax, ay], [bx, by]) => {
      const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
      const k = l ? clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1) : 0;
      return hyp(px, py, ax + k * dx, ay + k * dy);
    };
    const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const segsCross = (a, b, c, d) => cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0;
    return {
      x: HOME[0], y: HOME[1], vx: 0, vy: 0, alt: 0, armed: false, sb: 0, phase: null,
      keys: {}, ptr: null, bonk: 0, time: 0,
      fence: [], closed: false, hover: null, steps: { fence: false, top: false, land: false },
      mode() { return SB[this.sb]; },
      init() {
        this.ctrls(); this.prog();
        Lab.say('Before flying we drew a <b>geofence</b>: a virtual wall that the drone cannot cross. Click on the field to place its corners (at least 3), then click the first corner again or press <b>CLOSE FENCE</b>.');
      },
      prog() {
        Lab.progress([{ label: 'GEOFENCE', done: this.steps.fence }, { label: 'TAKE-OFF 7 M', done: this.steps.top }, { label: 'LANDED', done: this.steps.land }]);
      },
      ctrls() {
        const list = [];
        if (!this.closed) {
          list.push({ label: 'UNDO', fn: () => { this.fence.pop(); } });
          list.push({ label: 'CLEAR', fn: () => { this.fence = []; } });
          list.push({ label: 'CLOSE FENCE', fn: () => this.closeFence() });
        } else {
          if (!this.armed) list.push({ label: 'ARM & TAKE OFF', fn: () => this.takeoff() }, { label: 'EDIT FENCE', fn: () => this.editFence() });
          ['SB UP: LOITER', 'SB MID: LOITER', 'SB DOWN: LAND'].forEach((label, i) => list.push({ label, on: this.sb === i, fn: () => this.setSB(i) }));
        }
        Lab.controls(list);
      },
      /* ---------- geofence ---------- */
      okAt(x, y) {
        const P = this.fence, n = P.length;
        if (!this.closed || n < 3 || !inPoly(x, y, P)) return false;
        for (let i = 0; i < n; i++) if (segDist(x, y, P[i], P[(i + 1) % n]) < MARGIN) return false;
        return true;
      },
      addPoint(x, y) {
        const P = this.fence;
        const px = clamp(Math.round(x), 6, 296), py = clamp(Math.round(y), 6, 174);
        if (P.length >= 3 && hyp(px, py, ...P[0]) <= 7) { this.closeFence(); return; }
        if (P.length && hyp(px, py, ...P[P.length - 1]) < 6) return;
        if (P.length >= MAXPTS) { Snd.no(); Lab.say(`That is enough corners (${MAXPTS}). Close the fence by clicking the first corner or with <b>CLOSE FENCE</b>.`, 'warn'); return; }
        P.push([px, py]); Snd.move();
        const n = P.length;
        Lab.say(`Corner ${n} placed. ` + (n >= 3 ? 'Add more, or click the first corner (blinking) or <b>CLOSE FENCE</b> to close it.' : `Add at least ${3 - n} more.`));
      },
      closeFence() {
        const P = this.fence, n = P.length;
        if (n < 3) { Snd.no(); Lab.say('A fence needs at least <b>3 corners</b>. Click on the field to add more.', 'warn'); return; }
        for (let i = 0; i < n; i++) {
          for (let j = i + 2; j < n; j++) {
            if (i === 0 && j === n - 1) continue;
            if (segsCross(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n])) {
              Snd.no(); Lab.say('The fence <b>crosses itself</b>. Use UNDO and place the corners going around the area.', 'warn'); return;
            }
          }
        }
        this.closed = true; this.steps.fence = true; this.hover = null;
        this.prog(); this.ctrls(); Snd.ok();
        if (!this.okAt(this.x, this.y)) Lab.say('Fence closed, but the <b>drone is outside it</b> (or right on the edge). Press <b>ARM &amp; TAKE OFF</b> to see what the autopilot says.', 'warn');
        else Lab.say('<b>Geofence ready</b> &#10004; The drone will not be able to leave this area. Now press <b>ARM &amp; TAKE OFF</b>: it climbs to 7 m, like ours did.', 'ok');
      },
      editFence() {
        if (this.armed) return;
        this.closed = false; this.steps.fence = false;
        this.prog(); this.ctrls();
        Lab.say('Editing the fence: click to add corners, <b>UNDO</b> to remove the last one, <b>CLEAR</b> to start again.');
      },
      /* ---------- flight ---------- */
      setSB(i) {
        if (i === this.sb) return;
        this.sb = i; if (this.closed) this.ctrls(); Snd.move();
        if (!this.closed) return;
        if (this.mode() === 'LAND') {
          if (this.armed) { this.phase = 'land'; Lab.say('<b>LAND:</b> the drone comes down where it is, and the motors stop by themselves on the ground.'); }
          else Lab.say('Switch SB is in LAND. Put it back in LOITER to take off.');
        } else if (this.armed && this.phase === 'land') {
          this.phase = null;
          Lab.say('Back to <b>LOITER</b>: the drone stops descending and holds its position.');
        } else Lab.say('<b>LOITER:</b> the GPS holds the position and the altitude. Release the sticks and the drone stays still: the safest mode for a first flight.');
      },
      takeoff() {
        if (this.mode() === 'LAND') { Snd.no(); Lab.say('Put switch SB in <b>LOITER</b> first: you cannot take off in LAND.', 'warn'); return; }
        if (!this.okAt(this.x, this.y)) { Snd.no(); Lab.say('<b>PreArm: vehicle outside fence.</b> The drone must start inside the geofence. Press <b>EDIT FENCE</b> and draw it around the drone.', 'warn'); return; }
        this.armed = true; this.phase = 'takeoff'; this.vx = this.vy = 0; this.time = 0;
        this.steps.top = this.steps.land = false;
        this.ctrls(); this.prog(); Snd.ok();
        Lab.say('Armed! Climbing to <b>7 m</b> in LOITER...');
      },
      key(k, down) {
        if (down && ['1', '2', '3'].includes(k)) { this.setSB(+k - 1); return true; }
        if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) { this.keys[k] = down; return true; }
        return false;
      },
      onSwitch(x, y) { return x > 238 && y > 4 && y < 56; },
      nearFirst(x, y) { return this.fence.length >= 3 && hyp(x, y, ...this.fence[0]) <= 7; },
      down(x, y) {
        if (!this.closed) { this.addPoint(x, y); return; }
        if (this.onSwitch(x, y)) { this.setSB(clamp(Math.floor((y - 14) / 12), 0, 2)); return; }
        this.ptr = [x, y];
      },
      move(x, y, pressed) {
        this.hover = [x, y];
        if (!this.closed) return this.nearFirst(x, y);
        if (this.ptr && pressed) this.ptr = [x, y];
        return this.onSwitch(x, y);
      },
      up() { this.ptr = null; },
      fmt(s) { return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; },
      update(dt) {
        if (this.bonk > 0) this.bonk -= dt;
        if (!this.armed) return;
        this.time += dt;
        const k = this.keys;
        let ix = (k.d || k.ArrowRight ? 1 : 0) - (k.a || k.ArrowLeft ? 1 : 0), iy = (k.s || k.ArrowDown ? 1 : 0) - (k.w || k.ArrowUp ? 1 : 0);
        if (this.ptr) { const dx = this.ptr[0] - this.x, dy = this.ptr[1] - this.y, d = Math.hypot(dx, dy); if (d > 4) { ix = dx / d; iy = dy / d; } }
        const n = Math.hypot(ix, iy) || 1; ix /= n; iy /= n;
        if (this.phase === 'takeoff') {
          this.alt = Math.min(TOP, this.alt + 1.8 * dt);
          if (this.alt >= TOP) {
            this.phase = null; this.steps.top = true; this.prog();
            Lab.say('At <b>7 m</b>. Fly around in LOITER and try to leave the fence, then flip switch SB down to <b>LAND</b>.');
          }
        }
        if (this.phase === 'land') {
          this.vx *= 1 - 3 * dt; this.vy *= 1 - 3 * dt;
          this.alt -= 1.1 * dt;
          if (this.alt <= 0) {
            this.alt = 0; this.armed = false; this.phase = null; this.vx = this.vy = 0;
            this.steps.land = true; this.ctrls(); this.prog(); Snd.win();
            Lab.say(`<b>Landed and disarmed</b> &#10004; Flight time ${this.fmt(this.time)}. That was our flight: geofence, take-off to 7 m, LOITER and LAND.`, 'ok');
            return;
          }
        } else {
          const e = Math.min(1, dt * 5);
          this.vx += (ix * 45 - this.vx) * e; this.vy += (iy * 45 - this.vy) * e;
        }
        // the geofence: the drone slides along the fence but never crosses it
        const nx = this.x + this.vx * dt, ny = this.y + this.vy * dt;
        if (this.okAt(nx, ny)) { this.x = nx; this.y = ny; return; }
        if (this.okAt(nx, this.y)) { this.x = nx; this.vy = 0; }
        else if (this.okAt(this.x, ny)) { this.y = ny; this.vx = 0; }
        else { this.vx = this.vy = 0; }
        if (this.bonk <= 0) {
          this.bonk = 2.5; Snd.no();
          Lab.say('<b>FENCE!</b> The drone stops at the geofence: in LOITER the autopilot does not let it cross the line we drew.', 'warn');
        }
      },
      drawFence(t) {
        const P = this.fence, n = P.length;
        if (this.closed && n >= 3) {
          C.save();
          C.beginPath(); C.rect(0, 0, LW, LH);
          C.moveTo(P[0][0], P[0][1]); for (let i = 1; i < n; i++) C.lineTo(P[i][0], P[i][1]); C.closePath();
          C.fillStyle = 'rgba(40,0,0,0.3)'; C.fill('evenodd');
          C.restore();
        }
        for (let i = 0; i < n - (this.closed ? 0 : 1); i++) {
          const a = P[i], b = P[(i + 1) % n];
          thick(a[0], a[1], b[0], b[1], 2, COL.red);
          dashLine(a[0], a[1], b[0], b[1], COL.yellow, this.closed ? t : 0);
        }
        if (!this.closed && n && this.hover) dashLine(P[n - 1][0], P[n - 1][1], this.hover[0], this.hover[1], 'rgba(255,255,255,0.75)', t);
        for (const [px, py] of P) { R(px - 2, py - 2, 5, 5, COL.out); R(px - 1, py - 1, 3, 3, COL.yellow); }
        if (!this.closed && n >= 3 && Math.floor(t * 3) % 2) ring(P[0][0], P[0][1], 6, COL.white);
      },
      draw(t) {
        R(0, 0, LW, LH, '#4e9e57');
        for (let x = 0; x < LW; x += 20) R(x, 0, 10, LH, '#56a95f');
        for (let x = 0; x < LW; x += 6) { R(x, 0, 1, 6, 'rgba(255,255,255,0.3)'); R(x, LH - 6, 1, 6, 'rgba(255,255,255,0.3)'); }
        for (let y = 0; y < LH; y += 6) { R(0, y, 6, 1, 'rgba(255,255,255,0.3)'); R(LW - 6, y, 6, 1, 'rgba(255,255,255,0.3)'); }
        R(0, 0, LW, 2, '#6b6f80'); R(0, LH - 2, LW, 2, '#6b6f80'); R(0, 0, 2, LH, '#6b6f80'); R(LW - 2, 0, 2, LH, '#6b6f80');
        circ(HOME[0], HOME[1], 9, COL.out); circ(HOME[0], HOME[1], 8, COL.yellow);
        R(HOME[0] - 3, HOME[1] - 3, 1, 7, COL.out); R(HOME[0] + 3, HOME[1] - 3, 1, 7, COL.out); R(HOME[0] - 2, HOME[1], 5, 1, COL.out);
        this.drawFence(t);
        if (this.alt > 0) ellipse(this.x + this.alt * 1.4, this.y + this.alt * 1.4, 8, 6, 'rgba(0,0,0,0.28)');
        droneTop(this.x, this.y, t, this.armed, 1 + this.alt * 0.05);
        // flight data
        win(4, 4, 106, 42);
        txt(this.armed ? this.mode() : 'DISARMED', 11, 10, { color: this.armed ? COL.ink : COL.red });
        txt(`ALT ${this.alt.toFixed(1)}M`, 11, 21, { color: COL.grayD });
        txt(this.closed ? `TIME ${this.fmt(this.time)}` : `FENCE ${this.fence.length} PTS`, 11, 32, { color: this.closed ? COL.grayD : COL.red });
        // switch SB, as we configured it
        win(238, 4, 78, 52);
        R(245, 14, 6, 38, '#26262e');
        R(244, 15 + this.sb * 12, 8, 10, COL.grayL); R(244, 15 + this.sb * 12, 8, 2, '#ffffff');
        SB.forEach((m, i) => txt(m, 257, 17 + i * 12, { color: i === this.sb ? COL.red : COL.ink }));
        // altitude bar with the 7 m take-off target
        R(304, 62, 8, 104, COL.out); R(305, 63, 6, 102, '#1b1d28');
        const h = Math.round((this.alt / 8) * 102);
        R(305, 165 - h, 6, h, COL.green);
        const y7 = Math.round(165 - (TOP / 8) * 102);
        R(300, y7, 4, 1, COL.yellow);
        txt('7M', 298, y7 - 4, { align: 'right', color: COL.yellow, outline: COL.out });
        if (!this.closed && Math.floor(t * 1.5) % 2) txt('CLICK TO PLACE THE FENCE CORNERS', 150, 166, { align: 'center', color: COL.white, outline: COL.out });
      }
    };
  }
};
