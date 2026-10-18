/* ==========================================================================
   DRONE QUEST - scenes: Title, World Map and World 1 (Version 1)
   ========================================================================== */
'use strict';

/* ---------------------------------------------------------------- helpers */
function halfEllipse(cx, cy, rx, ry, c) {        // top half only
  C.fillStyle = MONO ? gray(c) : c;
  for (let dy = -ry; dy <= 0; dy++) {
    const dx = Math.floor(rx * Math.sqrt(1 - (dy * dy) / (ry * ry)) + 0.35);
    C.fillRect(Math.round(cx - dx), Math.round(cy + dy), dx * 2 + 1, 1);
  }
}
function building(x, y, w, h, o) {
  const rh = o.rh || Math.round(h * 0.38);
  C.fillStyle = 'rgba(0,0,0,0.16)'; C.fillRect(x + w, y + rh + 2, 3, h - rh - 1);
  R(x, y + rh - 1, w, h - rh + 1, COL.out);
  R(x + 1, y + rh, w - 2, h - rh - 1, o.wall || COL.wall);
  R(x + 1, y + h - 4, w - 2, 3, o.wallD || COL.wallD);
  R(x - 2, y, w + 4, rh, COL.out);
  R(x - 1, y + 1, w + 2, rh - 2, o.roof);
  for (let i = y + 4; i < y + rh - 2; i += 3) R(x - 1, i, w + 2, 1, o.roofD);
  R(x - 1, y + 1, w + 2, 1, o.roofL || o.roof);
  C.fillStyle = 'rgba(0,0,0,0.14)'; C.fillRect(x + 1, y + rh, w - 2, 2);
  if (o.door !== false) {
    const dw = 10, dh = 14, dx = Math.round((o.doorX != null ? o.doorX : x + w / 2) - dw / 2);
    R(dx - 1, y + h - dh - 1, dw + 2, dh + 1, COL.out);
    R(dx, y + h - dh, dw, dh, o.doorC || COL.door);
    R(dx + 1, y + h - dh + 1, dw - 2, 5, o.doorL || COL.doorL);
    R(dx + dw - 3, y + h - 7, 1, 1, COL.yellow);
  }
}
function windowAt(x, y, w = 10, h = 8) {
  R(x - 1, y - 1, w + 2, h + 2, COL.out);
  R(x, y, w, h, COL.glass); R(x, y, w, 2, COL.glassL);
  R(x + Math.floor(w / 2), y, 1, h, COL.out);
  R(x - 1, y + h + 1, w + 2, 1, COL.wallD);
}
function sign(cx, y, label, bg = '#fff6dc') {
  const tw = label.length * 8 + 6, x = Math.round(cx - tw / 2);
  R(x - 1, y - 1, tw + 2, 12, COL.out);
  R(x, y, tw, 10, bg); R(x, y + 9, tw, 1, COL.wallD);
  txt(label, x + 3, y + 1, { color: COL.ink });
}
function badge(cx, cy, n) {
  circ(cx, cy, 6, COL.out); circ(cx, cy, 5, COL.yellow);
  R(cx - 3, cy - 4, 3, 1, '#fff2a8');
  txt(String(n), cx - 3, cy - 3, { color: COL.ink });
}
function cardboard(x, y, w, h) {
  R(x - 1, y - 1, w + 2, h + 2, COL.out);
  R(x, y, w, h, '#d9a35b'); R(x, y, w, 2, '#e8bb78');
  R(x + Math.floor(w / 2) - 1, y, 2, h, '#c48a45');
}
function star(x, y, c = COL.yellow) {
  R(x, y - 3, 1, 7, COL.out); R(x - 3, y, 7, 1, COL.out);
  R(x - 1, y - 1, 3, 3, c); R(x, y - 2, 1, 5, c); R(x - 2, y, 5, 1, c);
}
function padlock(x, y) {
  R(x + 1, y - 4, 1, 4, COL.out); R(x + 6, y - 4, 1, 4, COL.out); R(x + 2, y - 5, 4, 1, COL.out);
  R(x - 1, y - 1, 10, 8, COL.out); R(x, y, 8, 6, COL.yellow); R(x, y, 8, 1, '#fff2a8');
  R(x + 3, y + 2, 2, 2, COL.out);
}
function exclaim(x, y) {
  R(x - 1, y - 1, 4, 7, COL.out); R(x, y, 2, 5, COL.red);
  R(x - 1, y + 6, 4, 4, COL.out); R(x, y + 7, 2, 2, COL.red);
}
function msgBox(text, t) {
  win(16, 212, W - 32, 50);
  wrap(text, 52).slice(0, 3).forEach((l, i) => txt(l, 28, 222 + i * 12, { color: COL.ink }));
  if (Math.floor(t * 2) % 2) arrow(W - 34, 250, 'down', COL.red);
}

/* ======================================================================
   TITLE
   ====================================================================== */
const Title = {
  clouds: [
    { x: 40, y: 34, v: 6 }, { x: 210, y: 58, v: 4 }, { x: 330, y: 24, v: 7 }, { x: 420, y: 70, v: 5 }
  ],
  tufts: null,
  enter() {
    if (!this.tufts) {
      const r = rng(7);
      this.tufts = Array.from({ length: 70 }, () => [Math.floor(r() * W), 232 + Math.floor(r() * 36), r()]);
    }
  },
  cloud(x, y) {
    circ(x, y, 7, '#ffffff'); circ(x + 9, y - 4, 9, '#ffffff'); circ(x + 19, y, 7, '#ffffff');
    R(x - 6, y + 2, 32, 6, '#ffffff'); R(x - 6, y + 6, 32, 2, '#d8eefc');
  },
  draw(t) {
    const bands = ['#56bdf6', '#63c4f7', '#71cbf8', '#7fd2f9', '#8dd9fa', '#9be0fb', '#a9e6fc', '#b7ecfd'];
    bands.forEach((c, i) => R(0, i * 20, W, 20, c));
    R(0, 160, W, 70, '#c3f0fd');
    circ(400, 40, 15, '#fff6c8'); circ(400, 40, 12, '#ffe066');
    for (const c of this.clouds) {
      const x = ((c.x + t * c.v) % (W + 80)) - 40;
      this.cloud(Math.round(x), c.y);
    }
    // hills
    for (let x = -20; x < W + 40; x += 70) circ(x, 236, 48, '#9ad9a6');
    for (let x = 15; x < W + 40; x += 90) circ(x, 250, 40, '#72c272');
    R(0, 228, W, 42, COL.grass); R(0, 228, W, 2, COL.grassL);
    for (const [x, y, v] of this.tufts) {
      if (v < 0.15) flower(x, y, v < 0.07 ? '#ff7a7a' : '#ffffff');
      else { R(x, y, 1, 2, COL.grass3); R(x + 2, y + 1, 1, 1, COL.grass3); }
    }
    drawTree(30, 248); drawTree(54, 262, 1); drawTree(452, 250); drawTree(428, 264, 1);
    // the student piloting the drone
    drawHero(240, 256, 'up', 0, LOOKS.student);
    // the drone
    const dx = 240 + Math.sin(t * 0.7) * 150, dy = 142 + Math.sin(t * 1.4) * 10;
    C.fillStyle = 'rgba(0,0,0,0.12)'; C.fillRect(Math.round(dx - 18), 236, 36, 3);
    drawDrone(dx, dy, t, 3);
    // title
    const tw = textW(SITE.title, 32), tx = Math.round(240 - tw / 2);
    txt(SITE.title, tx + 4, 34, { size: 32, color: '#b5521b', outline: COL.out, ow: 2 });
    txt(SITE.title, tx, 30, { size: 32, color: COL.yellow, outline: COL.out, ow: 2 });
    txt(SITE.subtitle, 240, 78, { size: 16, align: 'center', color: COL.white, outline: COL.out });
    txt(SITE.master, 240, 102, { size: 8, align: 'center', color: COL.white, outline: COL.out });
    if (Math.floor(t * 1.6) % 2 === 0) txt('PRESS START', 240, 194, { size: 16, align: 'center', color: COL.white, outline: COL.out, ow: 2 });
    txt('© 2026 ' + SITE.team.name, 8, 258, { color: COL.white, outline: COL.out });
    txt('V1', W - 8, 258, { align: 'right', color: COL.white, outline: COL.out });
  },
  key(k) { if (k === 'a') this.start(); },
  click() { this.start(); },
  hover() { return true; },
  start() { Snd.start(); location.hash = '#/select'; }
};

/* ======================================================================
   CHARACTER SELECT - play as any member of the team
   ====================================================================== */
const Select = {
  i: 0, confirm: null, hov: -1, bg: null,
  xs: [84, 188, 292, 396], feet: 194, S: 3,

  build() {
    this.bg = makeBuffer();
    drawOn(this.bg.ctx, () => {
      const r = rng(5);
      ['#56bdf6', '#63c4f7', '#71cbf8', '#7fd2f9', '#8dd9fa', '#9be0fb', '#a9e6fc'].forEach((c, i) => R(0, i * 16, W, 16, c));
      R(0, 112, W, 60, '#b7ecfd');
      Title.cloud(300, 34); Title.cloud(392, 58); Title.cloud(150, 44);
      // big trees and tall reeds behind the fence (like the DroneLab surroundings)
      for (const [x, y, rr] of [[20, 70, 26], [60, 56, 30], [104, 74, 22]]) { circ(x, y, rr + 1, COL.out); circ(x, y, rr, COL.treeD); circ(x - 6, y - 6, rr - 8, COL.tree); }
      for (let i = 0; i < 320; i++) {
        const x = Math.floor(r() * W), h = 26 + Math.floor(r() * 56);
        R(x, 152 - h, 1, h, ['#5f9e3a', '#71b046', '#86c255', '#4e8a30'][Math.floor(r() * 4)]);
        if (r() < 0.25) R(x - 1, 149 - h, 3, 4, '#d8d0a0');
      }
      // chain-link fence
      for (let k = -80; k < W + 80; k += 6) {
        line(k, 100, k + 60, 160, 'rgba(205,210,220,0.35)');
        line(k + 60, 100, k, 160, 'rgba(205,210,220,0.35)');
      }
      R(0, 98, W, 2, '#9aa0b0');
      for (let x = 12; x < W; x += 74) { R(x - 1, 94, 5, 68, COL.out); R(x, 95, 3, 66, '#a3a9b8'); }
      // electrical cabinet
      R(150, 60, 36, 104, COL.out); R(151, 61, 34, 102, '#c9ccd3'); R(151, 61, 34, 4, '#e3e6eb');
      R(167, 69, 1, 90, '#a9adb8'); R(162, 108, 2, 6, '#8a90a3'); R(171, 108, 2, 6, '#8a90a3');
      // roof beam
      R(250, 0, 230, 12, '#4f5563'); R(250, 0, 230, 2, '#6b7280'); R(250, 12, 230, 3, '#2f333d');
      // gravel
      R(0, 160, W, 110, '#cfc5b3');
      for (let i = 0; i < 1500; i++) R(Math.floor(r() * W), 160 + Math.floor(r() * 110), 1, 1, ['#b4aa98', '#e6dece', '#a39885', '#d9d0be'][Math.floor(r() * 4)]);
      for (let i = 0; i < 50; i++) { const x = Math.floor(r() * W), y = 162 + Math.floor(r() * 100); R(x, y, 1, 2, '#7aa35a'); R(x + 2, y + 1, 1, 1, '#7aa35a'); }
    });
  },
  enter() {
    if (!this.bg) this.build();
    this.i = Math.max(0, SITE.team.members.findIndex((m) => m.id === Hero.current()));
    this.confirm = null;
  },
  update(dt) {
    if (!this.confirm) return;
    this.confirm.t += dt;
    if (this.confirm.t > 1.3 && !this.confirm.done) { this.confirm.done = true; location.hash = '#/worlds'; }
  },
  draw(t) {
    C.drawImage(this.bg.canvas, 0, 0);
    win(140, 8, 200, 22);
    txt('CHOOSE YOUR PILOT', 240, 15, { align: 'center', color: COL.ink });
    const ms = SITE.team.members;
    ms.forEach((m, k) => {
      const x = this.xs[k], sel = k === this.i;
      let y = this.feet, dir = 'down', f = 0;
      if (this.confirm) {
        if (sel) y -= Math.round(Math.abs(Math.sin(this.confirm.t * 8)) * 12);
        else dir = k < this.i ? 'right' : 'left';
      } else if (sel) f = Math.floor(t * 5) % 4;
      if (sel) ellipse(x, this.feet + 2, 30, 6, 'rgba(255,236,140,0.6)');
      else if (k === this.hov) ellipse(x, this.feet + 2, 26, 5, 'rgba(255,255,255,0.35)');
      drawHero(x, y, dir, f, LOOKS[m.id], this.S);
      const name = pxName(m.name), w = name.length * 8 + 14;
      win(x - w / 2, 204, w, 17);
      txt(name, x - w / 2 + 7, 209, { color: sel ? COL.red : COL.ink });
      if (sel && !this.confirm) {
        const ay = this.feet - 88 + (Math.floor(t * 3) % 2) * 2;
        for (let i = 0; i < 6; i++) { R(x - 6 + i, ay + i, 12 - i * 2 + 1, 1, COL.out); }
        for (let i = 0; i < 5; i++) { R(x - 4 + i, ay + i, 9 - i * 2, 1, COL.yellow); }
      }
    });
    const m = ms[this.i];
    win(8, 226, W - 16, 38);
    txt(`P${this.i + 1}  ${pxName(m.name)}`, 20, 234, { color: COL.ink });
    if (this.confirm) txt(`${pxName(m.name)} JOINED THE QUEST!`, 20, 248, { color: COL.red });
    else {
      if (m.role) txt(pxName(m.role), 20, 248, { color: COL.grayD });
      if (Math.floor(t * 2) % 2) { txt('ENTER', W - 80, 241, { color: COL.red }); arrow(W - 36, 241, 'right', COL.red); }
    }
  },
  choose() {
    if (this.confirm) return;
    Hero.set(SITE.team.members[this.i].id);
    Snd.start();
    this.confirm = { t: 0 };
  },
  key(k) {
    if (this.confirm) return;
    const n = SITE.team.members.length;
    if (k === 'left' || k === 'up') { this.i = (this.i + n - 1) % n; Snd.move(); }
    else if (k === 'right' || k === 'down') { this.i = (this.i + 1) % n; Snd.move(); }
    else if (k === 'a') this.choose();
    else if (k === 'b') location.hash = '#/';
  },
  hit(x, y) { return y > 112 && y < 222 ? this.xs.findIndex((cx) => Math.abs(x - cx) < 32) : -1; },
  click(x, y) {
    const k = this.hit(x, y);
    if (k < 0 || this.confirm) return;
    if (k === this.i) this.choose();
    else { this.i = k; Snd.move(); }
  },
  hover(x, y) { this.hov = this.hit(x, y); return this.hov >= 0; }
};

/* ======================================================================
   WORLD MAP (one node per version of the project site)
   ====================================================================== */
const WorldMap = {
  nodes: [[96, 186], [172, 120], [262, 172], [350, 100], [416, 170]],
  cur: 0, walk: null, msg: null, hov: -1, buf: null, anim: 0,

  build() {
    this.buf = makeBuffer();
    drawOn(this.buf.ctx, () => {
      const land = [[96, 190, 50], [148, 152, 46], [176, 112, 40], [228, 162, 48], [266, 190, 38],
        [300, 122, 44], [352, 100, 46], [398, 150, 48], [420, 190, 34], [330, 176, 40], [214, 112, 30]];
      for (const [x, y, r] of land) circ(x, y, r + 7, '#e9cf86');
      for (const [x, y, r] of land) circ(x, y, r + 5, '#f4de9c');
      for (const [x, y, r] of land) circ(x, y, r, COL.grass2);
      for (const [x, y, r] of land) circ(x - 2, y - 2, r - 3, COL.grass);
      const rnd = rng(42);
      const onLand = (x, y, m) => land.some(([cx, cy, r]) => Math.hypot(x - cx, y - cy) < r - m);
      for (let i = 0; i < 500; i++) {
        const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H);
        if (!onLand(x, y, 3)) continue;
        if (rnd() < 0.08) flower(x, y, rnd() < 0.5 ? '#ffffff' : '#ff8a8a');
        else { R(x, y, 1, 2, COL.grass3); R(x + 2, y + 1, 1, 1, COL.grass3); }
      }
      // dotted road between worlds
      for (let i = 0; i < this.nodes.length - 1; i++) {
        const [x0, y0] = this.nodes[i], [x1, y1] = this.nodes[i + 1];
        const n = Math.floor(Math.hypot(x1 - x0, y1 - y0) / 7);
        for (let k = 1; k < n; k++) {
          const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n + 4;
          R(x - 2, y - 1, 4, 3, COL.pathE); R(x - 1, y - 1, 2, 2, '#f6e7bd');
        }
      }
      // trees, away from the nodes
      const trees = [];
      for (let i = 0; i < 400 && trees.length < 34; i++) {
        const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H);
        if (!onLand(x, y, 12)) continue;
        if (this.nodes.some(([nx, ny]) => Math.hypot(x - nx, y - ny) < 34)) continue;
        if (trees.some(([tx, ty]) => Math.hypot(x - tx, y - ty) < 14)) continue;
        if (y > 214) continue;
        trees.push([x, y, rnd() < 0.4]);
      }
      trees.sort((a, b) => a[1] - b[1]).forEach(([x, y, p]) => (p ? drawPine(x, y) : drawTree(x, y, y % 2)));
      // world icons
      SITE.worlds.forEach((w, i) => {
        const [x, y] = this.nodes[i];
        MONO = !w.unlocked;
        C.fillStyle = 'rgba(0,0,0,0.18)'; C.fillRect(x - 16, y + 2, 32, 4);
        [this.village, this.lab, this.arena, this.mountain, this.castle][i].call(this, x, y);
        MONO = false;
        if (!w.unlocked) padlock(x + 9, y - 18);
        const pw = w.label.length * 8 + 10;
        win(x - pw / 2, y - 44, pw, 15);
        txt(w.label, x - pw / 2 + 5, y - 40, { color: w.unlocked ? COL.ink : COL.grayD });
      });
    });
  },
  /* --- world icons (base centred on x,y) --- */
  mini(x, y, w, h, roof) {
    R(x - 1, y + 2, w + 2, h - 1, COL.out); R(x, y + 3, w, h - 3, COL.wall);
    R(x - 2, y - 1, w + 4, 5, COL.out); R(x - 1, y, w + 2, 3, roof);
    R(x + Math.floor(w / 2) - 1, y + h - 4, 3, 4, COL.door);
  },
  village(x, y) {
    this.mini(x - 15, y - 12, 12, 13, '#d94b4b');
    this.mini(x + 2, y - 16, 14, 17, COL.blue);
    drawTree(x + 22, y + 1);
  },
  lab(x, y) {
    halfEllipse(x, y - 7, 12, 10, COL.out); halfEllipse(x, y - 7, 11, 9, '#dfe6f0');
    R(x - 13, y - 7, 26, 9, COL.out); R(x - 12, y - 7, 24, 8, COL.grayL);
    R(x - 2, y - 4, 4, 6, COL.grayD); R(x, y - 22, 1, 5, COL.grayD); R(x - 1, y - 23, 3, 1, COL.red);
  },
  arena(x, y) {
    R(x - 15, y - 12, 30, 15, COL.out); R(x - 14, y - 11, 28, 13, '#4e9e57');
    for (let i = x - 14; i < x + 14; i += 4) R(i, y - 11, 1, 13, 'rgba(255,255,255,0.35)');
    for (let j = y - 11; j < y + 2; j += 4) R(x - 14, j, 28, 1, 'rgba(255,255,255,0.35)');
    drawDrone(x, y - 5, 0, 1, false);
  },
  mountain(x, y) {
    for (let r = 0; r <= 22; r++) {
      R(x - r, y - 22 + r, r + 1, 1, '#9a8a78'); R(x + 1, y - 22 + r, r, 1, '#7a6b5c');
      if (r < 6) { R(x - r, y - 22 + r, r + 1, 1, COL.white); R(x + 1, y - 22 + r, r, 1, '#d8dce8'); }
    }
    for (let r = 0; r <= 12; r++) R(x + 8 - r + 12, y - 12 + r, r * 2 + 1, 1, '#8a7a68');
  },
  castle(x, y) {
    R(x - 15, y - 15, 30, 18, COL.out); R(x - 14, y - 14, 28, 16, COL.grayL);
    for (const tx of [x - 17, x + 9]) {
      R(tx, y - 22, 8, 25, COL.out); R(tx + 1, y - 21, 6, 23, COL.gray);
      R(tx + 1, y - 21, 2, 2, COL.out); R(tx + 5, y - 21, 2, 2, COL.out);
    }
    R(x - 3, y - 6, 6, 9, COL.out); R(x - 2, y - 5, 4, 8, '#3b3446');
    R(x, y - 30, 1, 9, COL.out); R(x + 1, y - 30, 6, 4, COL.red);
  },

  enter() {
    if (!this.buf) this.build();
    this.msg = null; this.walk = null;
  },
  pos() {
    if (!this.walk) return [...this.nodes[this.cur]];
    const [x0, y0] = this.nodes[this.walk.from], [x1, y1] = this.nodes[this.walk.to];
    const k = Math.min(1, this.walk.t);
    return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
  },
  update(dt) {
    if (!this.walk) { this.anim = 0; return; }
    const [x0, y0] = this.nodes[this.walk.from], [x1, y1] = this.nodes[this.walk.to];
    this.walk.t += dt * 110 / Math.hypot(x1 - x0, y1 - y0);
    this.anim += dt * 8;
    if (this.walk.t >= 1) {
      const then = this.walk.then;
      this.cur = this.walk.to; this.walk = null;
      then && then();
    }
  },
  draw(t) {
    R(0, 0, W, H, '#3c8fe0');
    for (let y = 8, row = 0; y < H; y += 14, row++) {
      for (let x = (row % 2) * 12; x < W; x += 24) {
        const o = Math.round(Math.sin(t * 1.5 + x * 0.05 + row) * 2);
        R(x + o, y, 5, 1, '#6fb3f0'); R(x + o + 1, y - 1, 3, 1, '#6fb3f0');
      }
    }
    C.drawImage(this.buf.canvas, 0, 0);
    // hover ring
    if (this.hov >= 0 && !this.walk) {
      const [x, y] = this.nodes[this.hov];
      if (Math.floor(t * 4) % 2) { R(x - 20, y + 6, 40, 1, COL.white); R(x - 20, y - 26, 40, 1, COL.white); }
    }
    // hero
    const [bx, by] = this.pos();
    let dir = 'down';
    if (this.walk) {
      const [x0, y0] = this.nodes[this.walk.from], [x1, y1] = this.nodes[this.walk.to];
      dir = Math.abs(x1 - x0) > Math.abs(y1 - y0) ? (x1 > x0 ? 'right' : 'left') : (y1 > y0 ? 'down' : 'up');
    }
    drawHero(bx, by + 12, dir, Math.floor(this.anim) % 4);
    if (!this.walk) arrow(Math.round(bx) - 3, Math.round(by) - 14 + (Math.floor(t * 3) % 2), 'down', COL.red);
    // UI
    win(160, 6, 160, 20);
    txt('SELECT A WORLD', 240, 12, { align: 'center', color: COL.ink });
    const w = SITE.worlds[this.walk ? this.walk.to : this.cur];
    win(8, 224, W - 16, 40);
    txt(`WORLD ${w.id} - ${w.name}`, 20, 234, { color: COL.ink });
    txt(w.subtitle, 20, 248, { color: COL.grayD });
    if (w.unlocked) {
      if (Math.floor(t * 2) % 2) { txt('ENTER', W - 70, 241, { color: COL.red }); arrow(W - 28, 241, 'right', COL.red); }
    } else txt('LOCKED', W - 66, 241, { color: COL.grayD });
    if (this.msg) msgBox(this.msg, t);
  },
  moveTo(i, then) {
    if (i < 0 || i >= this.nodes.length) return;
    if (i === this.cur) { then && then(); return; }
    this.walk = { from: this.cur, to: i, t: 0, then };
    Snd.move();
  },
  select() {
    const w = SITE.worlds[this.cur];
    if (w.unlocked) { Snd.start(); location.hash = '#/world/' + w.id; }
    else { Snd.no(); this.msg = `${w.name} is still locked. This world will open with the next version of our project. Coming soon!`; }
  },
  key(k) {
    if (this.msg) { if (k === 'a' || k === 'b') { this.msg = null; Snd.move(); } return; }
    if (this.walk) return;
    if (k === 'left' || k === 'up') this.moveTo(this.cur - 1);
    else if (k === 'right' || k === 'down') this.moveTo(this.cur + 1);
    else if (k === 'a') this.select();
    else if (k === 'b') location.hash = '#/';
  },
  hit(x, y) { return this.nodes.findIndex(([nx, ny]) => Math.abs(x - nx) < 22 && y > ny - 48 && y < ny + 16); },
  click(x, y) {
    if (this.msg) { this.msg = null; return; }
    if (this.walk) return;
    const i = this.hit(x, y);
    if (i >= 0) this.moveTo(i, () => this.select());
  },
  hover(x, y) { this.hov = this.hit(x, y); return this.hov >= 0; }
};

/* ======================================================================
   WORLD 1 - VERSION 1 (Phase 1). One building per activity.
   ====================================================================== */
const World1 = {
  path: [[48, 72], [48, 88], [424, 88], [424, 168], [72, 168], [72, 232], [440, 232]],
  segs: [], len: 0, buf: null,
  s: 0, dir: 'down', walkAnim: 0, target: null,
  tour: { on: false, i: 0, wait: 0, waiting: false, resetting: false },
  bubble: null, idle: 0, hov: null, msg: null, visited: false,

  spots: [
    { id: 'home', kind: 'page', page: 'team', name: 'HOME: OUR TEAM', box: [16, 18, 64, 56], stop: [48, 72], face: 'up' },
    { id: 'board', kind: 'page', page: 'log', name: 'NOTICE BOARD: QUEST LOG', box: [76, 40, 26, 40], stop: [89, 88], face: 'up' },
    { id: 'a1', kind: 'act', n: 1, box: [100, 20, 68, 60], stop: [134, 88], face: 'up' },
    { id: 'a2', kind: 'act', n: 2, box: [178, 24, 98, 56], stop: [224, 88], face: 'up' },
    { id: 'a3', kind: 'act', n: 3, box: [286, 22, 68, 58], stop: [320, 88], face: 'up' },
    { id: 'a4', kind: 'act', n: 4, box: [434, 86, 30, 88], stop: [424, 128], face: 'right' },
    { id: 'a5', kind: 'act', n: 5, box: [326, 94, 74, 66], stop: [363, 168], face: 'up' },
    { id: 'a6', kind: 'act', n: 6, box: [192, 102, 70, 58], stop: [227, 168], face: 'up' },
    { id: 'a7', kind: 'act', n: 7, box: [94, 104, 64, 56], stop: [127, 168], face: 'up' },
    { id: 'kit', kind: 'page', page: 'kit', name: 'PARTS SHOP: INVENTORY', box: [86, 182, 58, 42], stop: [115, 232], face: 'up' },
    { id: 'a8', kind: 'act', n: 8, box: [164, 178, 108, 46], stop: [218, 232], face: 'up' },
    { id: 'gate', kind: 'gate', name: 'ROAD TO WORLD 2 (LOCKED)', box: [438, 190, 26, 42], stop: [440, 232], face: 'right' }
  ],

  /* ---------- path maths ---------- */
  initPath() {
    let s0 = 0;
    this.segs = [];
    for (let i = 0; i < this.path.length - 1; i++) {
      const [ax, ay] = this.path[i], [bx, by] = this.path[i + 1];
      const l = Math.abs(bx - ax) + Math.abs(by - ay);
      const dir = bx > ax ? 'right' : bx < ax ? 'left' : by > ay ? 'down' : 'up';
      this.segs.push({ ax, ay, bx, by, s0, s1: s0 + l, dir });
      s0 += l;
    }
    this.len = s0;
    for (const sp of this.spots) {
      sp.s = this.proj(sp.stop[0], sp.stop[1]);
      if (sp.kind === 'act') sp.name = `${sp.n}. ${SITE.activities[sp.n - 1].short}`;
    }
    this.tourList = this.spots.filter((sp) => sp.kind === 'act' || sp.kind === 'gate').sort((a, b) => a.s - b.s);
  },
  posAt(s) {
    s = Math.max(0, Math.min(this.len, s));
    for (const g of this.segs) {
      if (s <= g.s1) {
        const k = s - g.s0;
        return [g.ax + Math.sign(g.bx - g.ax) * k, g.ay + Math.sign(g.by - g.ay) * k];
      }
    }
    return [...this.path[this.path.length - 1]];
  },
  segAt(s, bias) {
    if (bias > 0) return this.segs.find((g) => s >= g.s0 && s < g.s1) || null;
    return this.segs.find((g) => s > g.s0 && s <= g.s1) || null;
  },
  proj(x, y) {
    let best = 0, bd = Infinity;
    for (const g of this.segs) {
      const minx = Math.min(g.ax, g.bx), maxx = Math.max(g.ax, g.bx);
      const miny = Math.min(g.ay, g.by), maxy = Math.max(g.ay, g.by);
      const px = Math.max(minx, Math.min(maxx, x)), py = Math.max(miny, Math.min(maxy, y));
      const d = Math.hypot(px - x, py - y);
      if (d < bd) { bd = d; best = g.s0 + Math.abs(px - g.ax) + Math.abs(py - g.ay); }
    }
    return best;
  },
  canMove(d) {
    const f = this.segAt(this.s, 1), b = this.segAt(this.s, -1);
    return (f && f.dir === d) || (b && OPP[b.dir] === d);
  },
  tryMove(d, dt) {
    const v = 75 * dt, f = this.segAt(this.s, 1), b = this.segAt(this.s, -1);
    if (f && f.dir === d) { this.s = Math.min(this.s + v, f.s1); this.dir = d; return true; }
    if (b && OPP[b.dir] === d) { this.s = Math.max(this.s - v, b.s0); this.dir = d; return true; }
    return false;
  },
  autoStep(dt) {
    const tg = this.target, diff = tg.s - this.s;
    if (Math.abs(diff) < 0.5) {
      this.s = tg.s;
      if (tg.face) this.dir = tg.face;
      this.target = null;
      tg.then && tg.then();
      return false;
    }
    const sg = Math.sign(diff), g = this.segAt(this.s, sg);
    this.s += sg * Math.min(Math.abs(diff), (tg.speed || 120) * dt);
    if (g) this.dir = sg > 0 ? g.dir : OPP[g.dir];
    return true;
  },
  spotAt() {
    let best = null;
    for (const sp of this.spots) if (Math.abs(sp.s - this.s) < 10 && (!best || Math.abs(sp.s - this.s) < Math.abs(best.s - this.s))) best = sp;
    return best;
  },
  spotHit(x, y) {
    return this.spots.find(({ box: [bx, by, bw, bh] }) => x >= bx && x < bx + bw && y >= by && y < by + bh) || null;
  },

  /* ---------- static map (drawn once into a buffer) ---------- */
  build() {
    this.initPath();
    this.buf = makeBuffer();
    drawOn(this.buf.ctx, () => {
      const rnd = rng(2024);
      R(0, 0, W, H, COL.grass);
      for (let i = 0; i < 900; i++) {
        const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H);
        if (rnd() < 0.5) { R(x, y, 1, 2, COL.grass2); R(x + 2, y + 1, 1, 1, COL.grass2); }
        else R(x, y, 2, 1, COL.grassL);
      }
      for (let i = 0; i < 70; i++) {
        flower(Math.floor(rnd() * W), Math.floor(rnd() * H), ['#ffffff', '#ff7a7a', '#ffd23f', '#c49bff'][Math.floor(rnd() * 4)]);
      }
      this.drawPond();
      // path
      const rects = this.segs.map((g) => [Math.min(g.ax, g.bx) - 8, Math.min(g.ay, g.by) - 8, Math.abs(g.bx - g.ax) + 16, Math.abs(g.by - g.ay) + 16]);
      for (const [x, y, w, h] of rects) R(x - 1, y - 1, w + 2, h + 2, COL.pathE);
      for (const [x, y, w, h] of rects) R(x, y, w, h, COL.path);
      for (const [x, y, w, h] of rects) {
        for (let i = 0; i < (w * h) / 60; i++) {
          const px = x + 1 + Math.floor(rnd() * (w - 3)), py = y + 1 + Math.floor(rnd() * (h - 3));
          R(px, py, rnd() < 0.5 ? 2 : 1, 1, COL.path2);
        }
      }
      // fence along the bottom
      R(84, 248, 352, 1, COL.woodL); R(84, 252, 352, 1, COL.woodL);
      for (let x = 84; x <= 436; x += 8) { R(x - 1, 244, 4, 11, COL.out); R(x, 245, 2, 9, COL.wood); }
      // decorative trees
      [[374, 74], [398, 60], [392, 36], [30, 122, 1], [56, 148], [80, 124, 1], [30, 206], [46, 236, 1],
        [380, 214], [404, 200, 1], [424, 216], [284, 214, 1], [168, 74, 1], [306, 196], [330, 212, 1], [354, 194], [358, 216]].sort((a, b) => a[1] - b[1])
        .forEach(([x, y, v]) => drawTree(x, y, v));
      // buildings
      this.drawHome(); this.drawBoard();
      this.s1(); this.s2(); this.s3(); this.s4(); this.s5(); this.s6(); this.s7();
      this.drawShop(); this.s8(); this.drawGate();
      // forest border
      const edge = [];
      for (let x = -6; x <= W + 6; x += 12) { edge.push([x, 3]); edge.push([x + 6, H - 2]); }
      for (let y = 10; y <= H - 6; y += 12) { edge.push([3, y]); edge.push([W - 3, y + 6]); }
      for (const [x, y] of edge) circ(x, y, 10, COL.out);
      for (const [x, y] of edge) circ(x, y, 9, COL.treeD);
      for (const [x, y] of edge) circ(x - 2, y - 2, 6, COL.tree);
      for (const [x, y] of edge) R(x - 4, y - 5, 2, 1, COL.treeL);
    });
  },
  drawPond() {
    ellipse(293, 134, 25, 16, COL.grass3);
    ellipse(293, 134, 23, 14, COL.waterD);
    ellipse(293, 135, 22, 12, COL.water);
    circ(281, 139, 2, '#4fae5a'); circ(303, 129, 2, '#4fae5a'); R(303, 128, 1, 1, '#ff9ad0');
    R(268, 122, 5, 3, COL.out); R(269, 122, 3, 2, COL.grayL);
    R(314, 144, 5, 3, COL.out); R(315, 144, 3, 2, COL.grayL);
  },
  drawHome() {
    building(20, 22, 56, 48, { roof: '#d94b4b', roofD: '#b53a3a', roofL: '#ec6a6a', rh: 19 });
    windowAt(26, 46); windowAt(60, 46);
    sign(48, 26, 'HOME');
    R(67, 70, 2, 8, COL.trunk); R(63, 65, 10, 7, COL.out); R(64, 66, 8, 5, COL.blue); R(72, 64, 1, 4, COL.red);
  },
  drawBoard() {
    R(82, 64, 2, 15, COL.trunk); R(94, 64, 2, 15, COL.trunk);
    R(79, 51, 20, 15, COL.out); R(80, 52, 18, 13, '#b8834a'); R(80, 52, 18, 1, '#d39a5c');
    R(82, 54, 5, 5, '#ffffff'); R(88, 55, 7, 4, '#fff3b0'); R(83, 60, 6, 3, '#ffd0d0'); R(91, 60, 3, 3, '#d0e8ff');
    R(84, 54, 1, 1, COL.red); R(91, 55, 1, 1, COL.blue);
  },
  s1() { // VIDEOS - the basics
    building(104, 24, 60, 56, { roof: '#e0603a', roofD: '#bf4a2a', roofL: '#f2885e', rh: 22 });
    R(107, 50, 22, 15, COL.out); R(108, 51, 20, 13, '#1d2333');
    windowAt(146, 53);
    sign(134, 29, 'VIDEOS'); badge(106, 21, 1);
  },
  s2() { // UNBOXING - warehouse
    building(196, 28, 56, 52, { roof: '#b07a42', roofD: '#8a5c2e', roofL: '#c99257', rh: 20, door: false });
    R(209, 55, 30, 25, COL.out); R(210, 56, 28, 24, '#a9adbb');
    for (let i = 58; i < 80; i += 3) R(210, i, 28, 1, '#8a8e9c');
    R(222, 77, 4, 1, COL.metal);
    cardboard(181, 70, 13, 10); cardboard(183, 61, 9, 8);
    sign(224, 32, 'UNBOX'); badge(198, 24, 2);
  },
  s3() { // FRAME ASSEMBLY 1 - workshop
    building(290, 26, 60, 54, { roof: '#7d8597', roofD: '#62697b', roofL: '#9aa1b3', rh: 21, door: false });
    R(299, 51, 42, 29, COL.out); R(300, 52, 40, 28, '#3b3446');
    R(302, 56, 14, 1, '#6b4420'); R(303, 53, 2, 3, COL.red); R(307, 54, 3, 2, COL.grayL); R(312, 53, 2, 3, COL.blue);
    R(302, 69, 36, 3, '#8a5a2b'); R(302, 69, 36, 1, '#a87444');
    R(304, 72, 2, 8, '#6b4420'); R(334, 72, 2, 8, '#6b4420');
    drawDrone(319, 63, 0, 1, false);
    R(330, 52, 1, 3, COL.metal); R(327, 55, 7, 2, COL.yellow);
    sign(320, 30, 'FRAME 1'); badge(292, 22, 3);
  },
  s4() { // RADIO CONTROL - radio tower
    const yb = 146, yt = 100;
    const xl = (y) => 441 + ((yb - y) * 7) / (yb - yt), xr = (y) => 457 - ((yb - y) * 7) / (yb - yt);
    line(441, yb, 448, yt, COL.grayD); line(457, yb, 450, yt, COL.grayD);
    for (let y = 106; y < yb; y += 10) {
      R(xl(y), y, xr(y) - xl(y) + 1, 1, COL.gray);
      line(xl(y), y, xr(y + 10), y + 10, COL.gray);
    }
    R(449, 90, 1, 12, COL.grayD);
    R(436, 143, 26, 5, COL.out); R(437, 144, 24, 3, '#d94b4b');
    R(437, 147, 24, 13, COL.out); R(438, 148, 22, 11, COL.wall);
    R(445, 150, 8, 4, COL.out); R(446, 151, 6, 2, COL.glass);
    sign(449, 162, 'RC'); badge(439, 96, 4);
  },
  s5() { // AUTOPILOT - control centre
    building(330, 104, 66, 56, { roof: '#4b7bd9', roofD: '#3a62b5', roofL: '#6f97ea', rh: 20 });
    R(387, 97, 2, 7, COL.grayD); circ(388, 96, 4, COL.out); circ(388, 96, 3, COL.grayL); R(388, 95, 1, 1, COL.red);
    R(335, 128, 18, 16, COL.out); R(336, 129, 16, 14, COL.metal);
    R(340, 131, 8, 8, COL.orange); R(340, 131, 8, 2, COL.orangeL); R(346, 133, 2, 6, '#d9700f');
    R(371, 127, 22, 18, COL.out); R(372, 128, 20, 16, '#1f3b2a');
    R(372, 133, 20, 1, '#2a4d38'); R(372, 138, 20, 1, '#2a4d38'); R(379, 128, 1, 16, '#2a4d38'); R(386, 128, 1, 16, '#2a4d38');
    sign(363, 108, 'AUTOPILOT'); badge(332, 100, 5);
  },
  s6() { // FRAME ASSEMBLY 2 - hangar
    halfEllipse(227, 125, 33, 21, COL.out); halfEllipse(227, 125, 32, 20, '#3aa58f');
    for (let x = 203; x <= 251; x += 8) {
      const top = 125 - Math.floor(20 * Math.sqrt(Math.max(0, 1 - ((x - 227) / 32) ** 2)));
      R(x, top + 1, 1, 125 - top, '#2f8a77');
    }
    R(196, 124, 63, 36, COL.out); R(197, 125, 61, 34, '#e8e2cf'); R(197, 156, 61, 3, '#cfc7ad');
    R(205, 131, 44, 29, COL.out); R(206, 132, 42, 28, '#2c2836'); R(206, 154, 42, 6, '#3d3848');
    for (let i = 0; i < 10; i++) R(206 + i * 4, 132, 2, 2, i % 2 ? COL.metal : COL.yellow);
    sign(227, 110, 'FRAME 2'); badge(202, 102, 6);
  },
  s7() { // MORE CALIBRATIONS - calibration lab
    building(98, 106, 58, 54, { roof: '#8a5ad0', roofD: '#6c42ad', roofL: '#a77ae6', rh: 20 });
    circ(111, 137, 7, COL.out); circ(111, 137, 6, COL.white);
    R(105, 137, 2, 1, COL.out); R(116, 137, 2, 1, COL.out); R(111, 131, 1, 2, COL.out);
    R(115, 132, 2, 2, COL.red);
    R(137, 130, 15, 9, COL.out); R(138, 131, 12, 7, COL.metal); R(152, 133, 1, 3, COL.out);
    sign(127, 110, 'CALIB'); badge(100, 102, 7);
  },
  drawShop() {
    building(90, 186, 50, 38, { roof: '#3d9be0', roofD: '#2f7fc0', roofL: '#62b4ee', rh: 13 });
    for (let i = 0; i < 13; i++) { const c = i % 2 ? COL.white : COL.red; R(89 + i * 4, 199, 4, 4, c); R(90 + i * 4, 203, 2, 1, c); }
    windowAt(95, 208, 9, 7); windowAt(126, 208, 9, 7);
    sign(115, 188, 'KIT');
  },
  s8() { // FLIGHT TESTS - DroneLab
    R(165, 185, 106, 40, COL.out);
    R(166, 186, 104, 38, '#4e9e57');
    for (let x = 166; x < 270; x += 8) R(x, 186, 4, 38, '#56a95f');
    R(170, 190, 96, 1, 'rgba(255,255,255,0.5)'); R(170, 220, 96, 1, 'rgba(255,255,255,0.5)');
    ellipse(196, 212, 9, 4, COL.out); ellipse(196, 212, 8, 3, COL.yellow);
    R(193, 211, 1, 3, COL.out); R(199, 211, 1, 3, COL.out); R(194, 212, 5, 1, COL.out);
    for (const x of [166, 217, 268]) R(x, 180, 2, 45, '#6b6f80');
    R(166, 180, 104, 2, '#6b6f80');
    sign(218, 182, 'DRONELAB'); badge(171, 186, 8);
  },
  drawGate() {
    R(446, 196, 4, 33, COL.out); R(447, 197, 2, 31, '#9aa0b0');
    R(444, 227, 8, 3, COL.out);
    padlock(452, 214);
  },

  /* ---------- animated layer ---------- */
  drawAnims(t) {
    // pond ripples
    for (let k = 0; k < 3; k++) R(279 + ((t * 5 + k * 9) % 22), 131 + k * 4, 4, 1, COL.waterL);
    // 1 - video screen
    const f1 = Math.floor(t * 1.2) % 3;
    if (f1 === 1) {
      ['#f8f8f8', '#ffd23f', '#5ce0e0', '#5cd65c', '#e05ce0', '#e04848', '#4b7bd9'].forEach((c, i) => R(108 + i * 3, 51, i === 6 ? 2 : 3, 10, c));
      R(108, 61, 20, 3, '#1d2333');
    } else {
      R(108, 51, 20, 13, '#28324a');
      arrow(116, 53, 'right', COL.white);
      R(110, 61, 16, 1, '#55607a'); R(110, 61, Math.floor((t * 4) % 16) + 1, 1, COL.red);
    }
    // 2 - box opening
    const f2 = Math.floor(t * 2) % 4;
    R(256, 69, 16, 11, COL.out); R(257, 70, 14, 9, '#d9a35b'); R(257, 70, 14, 1, '#c48a45');
    if (f2 === 0) { R(256, 67, 16, 3, COL.out); R(257, 68, 14, 1, '#e8bb78'); R(263, 67, 2, 3, '#c48a45'); }
    else if (f2 === 1) { line(257, 69, 253, 65, COL.out); line(270, 69, 274, 65, COL.out); line(258, 69, 254, 65, '#e8bb78'); line(269, 69, 273, 65, '#e8bb78'); }
    else {
      R(253, 62, 3, 8, COL.out); R(254, 63, 1, 6, '#e8bb78'); R(272, 62, 3, 8, COL.out); R(273, 63, 1, 6, '#e8bb78');
      const y = f2 === 3 ? 59 : 63;
      R(261, y, 7, 6, COL.out); R(262, y + 1, 5, 4, '#555a6a'); R(263, y + 1, 3, 1, COL.grayL);
      if (f2 === 3) for (const [x, yy] of [[256, 56], [272, 54], [265, 50]]) { R(x, yy - 1, 1, 3, '#fff6a0'); R(x - 1, yy, 3, 1, '#fff6a0'); }
    }
    // 3 - wrench + sparks
    if (Math.floor(t * 4) % 2) { line(333, 57, 338, 62, COL.grayL); R(332, 56, 2, 2, COL.grayL); }
    else { line(333, 62, 338, 57, COL.grayL); R(332, 62, 2, 2, COL.grayL); }
    if (Math.floor(t * 8) % 3 === 0) {
      const r = rng(Math.floor(t * 8));
      for (let i = 0; i < 4; i++) R(328 + Math.floor(r() * 6), 56 + Math.floor(r() * 7), 1, 1, r() < 0.5 ? COL.yellow : COL.white);
    }
    // 4 - radio waves + beacon
    R(448, 88, 3, 3, Math.floor(t * 2) % 2 ? COL.red : '#7a2a2a');
    for (let k = 0; k < 3; k++) {
      const r = 6 + ((t * 16 + k * 9) % 27), a = Math.max(0, 1 - (r - 6) / 27);
      C.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
      for (let ang = -0.7; ang <= 0.7; ang += 1 / r) {
        C.fillRect(Math.round(449 + Math.cos(ang) * r), Math.round(89 + Math.sin(ang) * r), 1, 1);
        C.fillRect(Math.round(449 - Math.cos(ang) * r), Math.round(89 + Math.sin(ang) * r), 1, 1);
      }
    }
    // 5 - autopilot LED + mission on screen
    R(343, 141, 2, 1, ['#5cff6a', '#4bb3ff', '#ff5c5c', COL.yellow][Math.floor(t * 2) % 4]);
    const wp = [[375, 141], [378, 131], [385, 139], [390, 130]];
    const prog = ((t * 0.45) % 1.3) * 3;
    for (let i = 0; i < 3; i++) {
      if (prog <= i) break;
      const k = Math.min(1, prog - i), [ax, ay] = wp[i], [bx, by] = wp[i + 1];
      line(ax, ay, ax + (bx - ax) * k, ay + (by - ay) * k, '#5cff8a');
    }
    for (const [x, y] of wp) R(x, y, 1, 1, COL.yellow);
    {
      const i = Math.min(2, Math.floor(prog)), k = Math.min(1, prog - i), [ax, ay] = wp[i], [bx, by] = wp[i + 1];
      R(ax + (bx - ax) * k - 1, ay + (by - ay) * k - 1, 2, 2, COL.orange);
    }
    // 6 - finished drone in the hangar
    drawDrone(227, 149, t, 1, false);
    if (Math.floor(t * 2.5) % 2) R(226, 140, 1, 1, '#4bb3ff');
    // 7 - gauge needle + battery charging
    const ang = -Math.PI * 0.95 + (Math.sin(t * 1.7) * 0.5 + 0.5) * Math.PI * 0.9;
    line(111, 137, 111 + Math.cos(ang) * 5, 137 + Math.sin(ang) * 5, COL.red);
    R(111, 137, 1, 1, COL.out);
    const nb = Math.floor(t * 2) % 5;
    for (let i = 0; i < nb; i++) R(139 + i * 3, 132, 2, 5, nb === 4 ? '#5cff6a' : COL.grassL);
    // 8 - drone flying in the DroneLab, behind the net
    const dx = 228 + Math.sin(t * 0.9) * 28, dy = 200 + Math.sin(t * 1.8) * 4;
    C.fillStyle = 'rgba(0,0,0,0.22)'; C.fillRect(Math.round(dx - 6), 218, 12, 2);
    drawDrone(dx, dy, t, 1, true);
    C.fillStyle = 'rgba(255,255,255,0.22)';
    for (let x = 170; x < 268; x += 6) C.fillRect(x, 182, 1, 42);
    for (let y = 188; y < 224; y += 6) C.fillRect(166, y, 104, 1);
    // gate flag
    R(449, 197, 11, 8, COL.out); R(450, 198, 9, 6, COL.red);
    if (Math.floor(t * 3) % 2) R(458, 199, 2, 3, COL.out);
    txt('2', 451, 198, { size: 8, color: COL.white });
    // notice board "!"
    if (SITE.updates.length) exclaim(88, 38 + (Math.floor(t * 3) % 2));
    // stars on completed activities
    for (const sp of this.spots) if (sp.kind === 'act' && SITE.activities[sp.n - 1].done) star(sp.box[0] + 12, sp.box[1] + 2);
  },

  /* ---------- scene interface ---------- */
  enter() {
    if (!this.buf) this.build();
    this.s = 0; this.dir = 'down'; this.target = null; this.msg = null; this.bubble = null;
    this.tour = { on: false, i: 0, wait: 0, waiting: false, resetting: false };
    this.idle = this.visited ? 0 : 16.8;   // first visit: the tour starts almost at once
    this.visited = true;
  },
  stopAuto() {
    this.tour.on = false; this.tour.waiting = false; this.target = null; this.bubble = null; this.idle = 0;
  },
  startTour() {
    const i = this.tourList.findIndex((sp) => sp.s > this.s + 2);
    this.tour = { on: true, i: i < 0 ? 0 : i, wait: 0, waiting: false, resetting: false };
    this.goTour();
  },
  goTour() {
    const sp = this.tourList[this.tour.i];
    this.bubble = null;
    this.target = { s: sp.s, face: sp.face, speed: 85, then: () => { this.bubble = sp; this.tour.waiting = true; this.tour.wait = 1.8; } };
  },
  update(dt) {
    this.idle += dt;
    if (this.msg) { this.walkAnim = 0; return; }
    let moved = false;
    const d = Game.heldDir();
    if (d) { if (this.tour.on || this.target) this.stopAuto(); moved = this.tryMove(d, dt); }
    else if (this.target) moved = this.autoStep(dt);
    if (this.tour.on && this.tour.waiting && !this.tour.resetting) {
      this.tour.wait -= dt;
      if (this.tour.wait <= 0) {
        this.tour.waiting = false;
        this.tour.i++;
        if (this.tour.i >= this.tourList.length) {
          this.tour.resetting = true; this.bubble = null;
          Game.fading = { phase: 'out', t: 0, fn: () => { this.s = 0; this.dir = 'down'; this.tour.i = 0; this.tour.resetting = false; if (this.tour.on) this.goTour(); } };
        } else this.goTour();
      }
    }
    if (!this.tour.on && !this.target && this.idle > 18) this.startTour();
    this.walkAnim = moved ? this.walkAnim + dt * 8 : 0;
  },
  draw(t) {
    C.drawImage(this.buf.canvas, 0, 0);
    this.drawAnims(t);
    // hover highlight
    const hl = this.hov || (this.bubble && this.tour.on ? this.bubble : null);
    if (hl && Math.floor(t * 4) % 2) {
      const [x, y, w, h] = hl.box, c = COL.white;
      for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w - 1, y, -1, 1], [x, y + h - 1, 1, -1], [x + w - 1, y + h - 1, -1, -1]]) {
        R(Math.min(cx, cx + sx * 5), cy, 6, 1, c); R(cx, Math.min(cy, cy + sy * 5), 1, 6, c);
      }
    }
    // hero
    const [x, y] = this.posAt(this.s);
    drawHero(x, y + 5, this.dir, Math.floor(this.walkAnim) % 4);
    // labels
    if (this.hov && !this.msg) this.label(this.hov.name, this.hov.box[0] + this.hov.box[2] / 2, this.hov.box[1] - 4);
    if (this.bubble) this.label(this.bubble.name, x, y - 24, true);
    if (this.tour.on && !this.msg) {
      win(84, H - 25, 312, 20);
      txt('AUTO-TOUR: CLICK A BUILDING TO ENTER', 240, H - 19, { align: 'center', color: COL.ink });
    }
    if (this.msg) msgBox(this.msg, t);
  },
  label(s, cx, by, tail) {
    const w = s.length * 8 + 12, x = Math.max(4, Math.min(W - w - 4, Math.round(cx - w / 2))), y = Math.max(4, by - 16);
    win(x, y, w, 16);
    txt(s, x + 6, y + 4, { color: COL.ink });
    if (tail) { R(Math.round(cx) - 2, y + 15, 5, 1, COL.out); R(Math.round(cx) - 1, y + 16, 3, 1, COL.out); R(Math.round(cx), y + 17, 1, 1, COL.out); }
  },
  activate(sp) {
    Snd.ok();
    if (sp.kind === 'act') location.hash = `#/world/1/activity/${sp.n}`;
    else if (sp.kind === 'page') location.hash = `#/world/1/${sp.page}`;
    else this.msg = 'The road to WORLD 2 is still closed. It will open with VERSION 2 of our project. Coming soon!';
  },
  key(k) {
    this.idle = 0;
    if (this.msg) { if (k === 'a' || k === 'b') { this.msg = null; Snd.move(); } return; }
    if (k === 'b') { location.hash = '#/worlds'; return; }
    if (k === 'a') { this.stopAuto(); const sp = this.spotAt(); if (sp) { this.dir = sp.face; this.activate(sp); } return; }
    if (OPP[k]) {
      if (this.tour.on || this.target) this.stopAuto();
      if (!this.canMove(k)) {
        const sp = this.spotAt();
        if (sp && sp.face === k) this.activate(sp); else this.dir = k;
      }
    }
  },
  click(x, y) {
    this.idle = 0;
    if (this.msg) { this.msg = null; return; }
    this.stopAuto();
    const sp = this.spotHit(x, y);
    if (sp) {
      if (Math.abs(sp.s - this.s) < 1) { this.dir = sp.face; this.activate(sp); }
      else { Snd.move(); this.target = { s: sp.s, face: sp.face, speed: 140, then: () => this.activate(sp) }; }
    } else {
      this.target = { s: this.proj(x, y - 4), speed: 140 };
    }
  },
  hover(x, y) {
    this.hov = this.spotHit(x, y);
    return !!this.hov;
  }
};
