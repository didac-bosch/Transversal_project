/* ==========================================================================
   DRONE QUEST - engine
   Canvas loop, input, sound and pixel-art primitives. Everything is drawn
   in code at a low resolution (480x270) and scaled up with crisp pixels.
   ========================================================================== */
'use strict';

const W = 480, H = 270;

const COL = {
  out: '#2b2433', white: '#f8f8f8', ink: '#2b2433',
  grass: '#7fcf5a', grass2: '#6dbd4c', grass3: '#58a63e', grassL: '#9be070',
  path: '#e6c98e', path2: '#d6b679', pathE: '#b8945a',
  tree: '#3e9a45', treeD: '#2a6e35', treeL: '#63c25a', trunk: '#7a4a26',
  water: '#3e9be6', waterL: '#8fd3ff', waterD: '#2f78c0',
  wall: '#f4ecd6', wallD: '#d9cba6', door: '#7a4a26', doorL: '#9a6436',
  glass: '#8fd3ff', glassL: '#d4f1ff',
  gray: '#8a90a3', grayD: '#5c6275', grayL: '#c4c9d6', metal: '#2e2e38',
  orange: '#ff8a1c', orangeL: '#ffb35c', red: '#e04848', yellow: '#ffd23f',
  green: '#5cd65c', blue: '#4b7bd9', ui: '#5a8ee8', wood: '#a87a48', woodL: '#c99a62'
};

/* ---------- drawing primitives (draw on the current context C) ---------- */
let C = null;
let MONO = false;                 // when true, colours are drawn in greyscale
const _grayCache = {};
function gray(c) {
  if (c[0] !== '#') return c;
  if (_grayCache[c]) return _grayCache[c];
  const n = parseInt(c.slice(1), 16);
  const l = Math.round(((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11);
  const v = Math.round(70 + l * 0.55);
  return (_grayCache[c] = `rgb(${v},${v},${v + 12})`);
}
function R(x, y, w, h, c) {
  C.fillStyle = MONO ? gray(c) : c;
  C.fillRect(Math.round(x), Math.round(y), w, h);
}
function circ(cx, cy, r, c) {
  C.fillStyle = MONO ? gray(c) : c;
  for (let dy = -r; dy <= r; dy++) {
    const dx = Math.floor(Math.sqrt(r * r - dy * dy) + 0.35);
    C.fillRect(Math.round(cx - dx), Math.round(cy + dy), dx * 2 + 1, 1);
  }
}
function ellipse(cx, cy, rx, ry, c) {
  C.fillStyle = MONO ? gray(c) : c;
  for (let dy = -ry; dy <= ry; dy++) {
    const dx = Math.floor(rx * Math.sqrt(1 - (dy * dy) / (ry * ry)) + 0.35);
    C.fillRect(Math.round(cx - dx), Math.round(cy + dy), dx * 2 + 1, 1);
  }
}
/* circle outline (midpoint algorithm) */
function ring(cx, cy, r, c) {
  C.fillStyle = MONO ? gray(c) : c;
  cx = Math.round(cx); cy = Math.round(cy);
  let x = r, y = 0, err = 1 - r;
  while (x >= y) {
    for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) C.fillRect(cx + a, cy + b, 1, 1);
    y++;
    if (err < 0) err += 2 * y + 1;
    else { x--; err += 2 * (y - x) + 1; }
  }
}
function line(x0, y0, x1, y1, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  C.fillStyle = MONO ? gray(c) : c;
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (let i = 0; i < 4000; i++) {
    C.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
/* thick line: a square brush of width w along the line */
function thick(x0, y0, x1, y1, w, c) {
  const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0)));
  const o = Math.floor(w / 2);
  C.fillStyle = MONO ? gray(c) : c;
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n), y = Math.round(y0 + ((y1 - y0) * i) / n);
    C.fillRect(x - o, y - o, w, w);
  }
}
/* dashed line, the dashes march with t */
function dashLine(x0, y0, x1, y1, c, t = 0, on = 3, off = 3) {
  const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0)));
  C.fillStyle = c;
  const shift = Math.floor(t * 12);
  for (let i = 0; i <= n; i++) {
    if ((i + shift) % (on + off) >= on) continue;
    C.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), 1, 1);
  }
}
function dashRect(x, y, w, h, c, t = 0) {
  dashLine(x, y, x + w - 1, y, c, t); dashLine(x + w - 1, y, x + w - 1, y + h - 1, c, t);
  dashLine(x + w - 1, y + h - 1, x, y + h - 1, c, t); dashLine(x, y + h - 1, x, y, c, t);
}
function dashRing(cx, cy, r, c, t = 0) {
  C.fillStyle = c;
  const n = Math.round(Math.PI * 2 * r), shift = Math.floor(t * 12);
  for (let i = 0; i < n; i++) {
    if ((i + shift) % 6 >= 3) continue;
    const a = (i / n) * Math.PI * 2;
    C.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1);
  }
}
function font(size) { return `${size}px "Press Start 2P", monospace`; }
function txt(s, x, y, o = {}) {
  const size = o.size || 8;
  C.font = font(size);
  C.textAlign = o.align || 'left';
  C.textBaseline = 'top';
  x = Math.round(x); y = Math.round(y);
  if (o.outline) {
    C.fillStyle = o.outline;
    const d = o.ow || 1;
    for (const [ax, ay] of [[-d, 0], [d, 0], [0, -d], [0, d], [-d, -d], [d, -d], [-d, d], [d, d]]) C.fillText(s, x + ax, y + ay);
  }
  if (o.shadow) { C.fillStyle = o.shadow; C.fillText(s, x + (o.sd || 1), y + (o.sd || 1)); }
  C.fillStyle = o.color || COL.ink;
  C.fillText(s, x, y);
}
function textW(s, size = 8) { C.font = font(size); return Math.ceil(C.measureText(s).width); }
/* names for the pixel font: accents are too cramped at 8 px (Dídac -> DIDAC) */
function pxName(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase(); }
function wrap(s, maxChars) {
  const words = s.split(' '), lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; }
    else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}
/* classic RPG window: dark border, white, blue inner line */
function win(x, y, w, h) {
  R(x + 1, y, w - 2, h, COL.out); R(x, y + 1, w, h - 2, COL.out);
  R(x + 1, y + 1, w - 2, h - 2, COL.white);
  R(x + 2, y + 2, w - 4, h - 4, COL.ui);
  R(x + 3, y + 3, w - 6, h - 6, COL.white);
}
/* small solid arrow (cursor), 7 px wide */
function arrow(x, y, dir, c = COL.ink) {
  for (let i = 0; i < 4; i++) {
    if (dir === 'right') R(x + i, y + i, 1, 7 - i * 2, c);
    else if (dir === 'down') R(x + i, y + i, 7 - i * 2, 1, c);
    else if (dir === 'left') R(x + 3 - i, y + i, 1, 7 - i * 2, c);
    else if (dir === 'up') R(x + i, y + 3 - i, 7 - i * 2, 1, c);
  }
}
function rng(seed) {
  return function () {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeBuffer(w = W, h = H) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return { canvas: c, ctx: x };
}
/* run a drawing function on another context */
function drawOn(ctx, fn) { const prev = C; C = ctx; try { fn(); } finally { C = prev; } }

/* ---------- common sprites ---------- */

function drawTree(x, y, v = 0) {            // x,y = base of the trunk
  C.fillStyle = 'rgba(0,0,0,0.18)'; C.fillRect(Math.round(x - 7), Math.round(y - 1), 14, 3);
  R(x - 3, y - 7, 6, 7, COL.out); R(x - 2, y - 7, 4, 6, COL.trunk);
  circ(x, y - 13, 9, COL.out);
  circ(x, y - 13, 8, v ? COL.treeD : COL.tree);
  circ(x - 2, y - 15, 5, v ? COL.tree : COL.treeL);
  R(x - 4, y - 18, 2, 1, '#8fe07a');
}
function drawPine(x, y) {
  R(x - 2, y - 5, 4, 5, COL.trunk);
  for (let i = 0; i < 3; i++) {
    const w = 14 - i * 4, yy = y - 6 - i * 6;
    for (let r = 0; r < 7; r++) {
      const ww = Math.round(w * (r / 7)) + 1;
      R(x - ww / 2, yy - 7 + r, ww, 1, r < 2 ? COL.treeL : COL.treeD);
    }
  }
}
function flower(x, y, c) {
  R(x - 1, y, 3, 1, c); R(x, y - 1, 1, 3, c); R(x, y, 1, 1, COL.yellow);
}

/* ---------- the team: one pixel character per member ----------
   Each "look" describes hair, face, clothes and accessories, based on the
   team photo. Characters are drawn on a 16x23 grid with the feet at the
   bottom; parts are [x, y, w, h, colour, outlined]. */
const HERO_OUT = '#2b2433';
const LOOKS = {
  aatif: {
    skin: '#b98258', skinD: '#9a6744', hair: '#1c1a1f', hairL: '#3b3640', style: 'quiff', beard: '#29222a',
    shirt: '#29272f', shirtD: '#1a191e', print: '#4f4c58', shades: true,
    pants: '#25242c', pantsD: '#1a191f', shoe: '#efe6d2', mouth: '#6b3a30'
  },
  didac: {
    skin: '#f1c6a3', skinD: '#d8a482', hair: '#3a2a20', hairL: '#5b4434', style: 'short', cheek: '#eea0a0',
    shirt: '#5a4274', shirtD: '#422f57',
    pants: '#86acd4', pantsD: '#6a90b8', shoe: '#c8cdd8', mouth: '#c9876a'
  },
  timur: {
    skin: '#f3d0b5', skinD: '#dbad8f', hair: '#4a3427', hairL: '#6d4e39', style: 'fringe', cheek: '#f0a6a6',
    glasses: '#d8506e', lens: '#f4b6c6',
    shirt: '#f4f4f4', shirtD: '#d4d6de', emblem: '#c83a4a', leaf: '#4f8f4f',
    pants: '#d9ccb2', pantsD: '#bfb193', shoe: '#ffffff', mouth: '#c98a74'
  },
  ashwin: {
    skin: '#8a5a3a', skinD: '#6f462c', hair: '#19161a', hairL: '#35302f', style: 'crop', smile: true,
    shirt: '#f2ede1', shirtD: '#d6cfbd', pattern: ['#e8853a', '#5c9c5a', '#e8b35a'], open: true,
    pants: '#a7c3de', pantsD: '#8aaccb', shoe: '#2b3f7d', mouth: '#5a2f26'
  },
  /* the generic student of the title screen (not selectable) */
  student: {
    skin: '#f6c99c', skinD: '#dea47a', hair: '#5b3a1f', hairL: '#80562f', style: 'short', cheek: '#f39a9a',
    shirt: '#3d7be0', shirtD: '#2b5cb5', long: true, strings: true,
    bag: '#e8833a', bagD: '#b55f22', bagL: '#f4a35f',
    pants: '#3a3f5c', pantsD: '#30344d', shoe: '#f2f2f2', mouth: '#dea47a'
  }
};

function heroParts(L, dir, f) {
  const p = [], O = HERO_OUT;
  const step = f % 2 === 1, alt = f === 3;
  const leg = (x, y, w, lifted, shoeW, shoeX) => {
    const rows = L.shorts
      ? (lifted ? [L.shorts, L.socks] : [L.shorts, L.skin, L.socks])
      : (lifted ? [L.pants, L.pantsD] : [L.pants, L.pants, L.pantsD]);
    p.push([x, y, w, rows.length, null, 1]);
    rows.forEach((c, i) => p.push([x, y + i, w, 1, c, 0]));
    p.push([shoeX != null ? shoeX : x, y + rows.length, shoeW || w, 1, L.shoe, 1]);
  };
  const arm = (x, a) => (L.long
    ? p.push([x, 12 + a, 2, 6, null, 1], [x, 12 + a, 2, 5, L.shirtD, 0], [x, 17 + a, 2, 1, L.skin, 0])
    : p.push([x, 12 + a, 2, 6, null, 1], [x, 12 + a, 2, 2, L.shirtD, 0], [x, 14 + a, 2, 4, L.skin, 0]));
  const pat = (dots) => { if (L.pattern) dots.forEach(([x, y, i]) => p.push([x, y, 1, 1, L.pattern[i], 0])); };

  if (dir === 'down' || dir === 'up') {
    leg(5, 18, 3, step && !alt);
    leg(8, 18, 3, step && alt);
    arm(2, f === 1 ? 1 : 0);
    arm(12, f === 3 ? 1 : 0);
    p.push([4, 12, 8, 6, L.shirt, 1], [4, 17, 8, 1, L.shirtD, 0]);
    if (dir === 'down') {
      if (L.open) p.push([7, 12, 2, 2, L.skin, 0], [6, 12, 1, 1, L.shirtD, 0], [9, 12, 1, 1, L.shirtD, 0], [8, 14, 1, 3, L.shirtD, 0]);
      else if (L.strings) p.push([6, 13, 1, 2, '#ffffff', 0], [9, 13, 1, 2, '#ffffff', 0], [6, 15, 4, 1, L.shirtD, 0]);
      else p.push([6, 12, 4, 1, L.shirtD, 0]);
      if (L.print) p.push([6, 15, 4, 2, L.print, 0]);
      if (L.shades) p.push([5, 13, 2, 2, '#0d0c10', 0], [9, 13, 2, 2, '#0d0c10', 0], [7, 13, 2, 1, '#6a6775', 0]);
      if (L.emblem) p.push([7, 14, 2, 2, L.emblem, 0], [9, 15, 1, 1, L.leaf, 0]);
      pat([[5, 13, 0], [10, 13, 1], [5, 15, 2], [10, 15, 0], [6, 16, 1], [10, 17, 2]]);
    } else {
      pat([[5, 13, 0], [9, 13, 1], [7, 15, 2], [10, 16, 0], [5, 16, 1]]);
      if (L.bag) p.push([5, 12, 6, 5, L.bag, 1], [5, 16, 6, 1, L.bagD, 0], [6, 13, 4, 1, L.bagL, 0]);
    }
    p.push([3, 2, 10, 10, L.skin, 1]);
    const st = L.style;
    if (dir === 'down') {
      if (st === 'quiff') p.push([4, 0, 8, 2, L.hair, 1], [3, 2, 10, 2, L.hair, 0], [3, 4, 1, 3, L.hair, 0], [12, 4, 1, 3, L.hair, 0], [4, 4, 1, 1, L.hair, 0], [11, 4, 1, 1, L.hair, 0], [6, 0, 3, 1, L.hairL, 0]);
      else if (st === 'fringe') p.push([4, 1, 7, 1, L.hair, 1], [3, 2, 10, 4, L.hair, 0], [3, 6, 4, 1, L.hair, 0], [3, 6, 1, 3, L.hair, 0], [12, 5, 1, 4, L.hair, 0], [6, 3, 4, 1, L.hairL, 0]);
      else if (st === 'crop') p.push([5, 1, 6, 1, L.hair, 1], [3, 2, 10, 2, L.hair, 0], [3, 4, 1, 2, L.hair, 0], [12, 4, 1, 2, L.hair, 0], [4, 4, 8, 1, L.hair, 0], [6, 2, 3, 1, L.hairL, 0]);
      else p.push([5, 1, 6, 1, L.hair, 1], [3, 2, 10, 3, L.hair, 0], [3, 5, 1, 3, L.hair, 0], [12, 5, 1, 3, L.hair, 0], [4, 5, 2, 1, L.hair, 0], [7, 5, 3, 1, L.hair, 0], [5, 3, 3, 1, L.hairL, 0]);
      if (L.beard) p.push([3, 7, 1, 4, L.beard, 0], [12, 7, 1, 4, L.beard, 0], [4, 9, 1, 3, L.beard, 0], [11, 9, 1, 3, L.beard, 0], [5, 11, 6, 1, L.beard, 0], [6, 9, 4, 1, L.beard, 0]);
      if (L.glasses) p.push([4, 7, 3, 2, L.lens, 0], [9, 7, 3, 2, L.lens, 0]);
      p.push([5, 7, 1, 2, O, 0], [10, 7, 1, 2, O, 0]);
      if (L.glasses) p.push([4, 6, 3, 1, L.glasses, 0], [9, 6, 3, 1, L.glasses, 0], [7, 7, 2, 1, L.glasses, 0], [3, 7, 1, 1, L.glasses, 0], [12, 7, 1, 1, L.glasses, 0]);
      if (L.cheek) p.push([4, 9, 1, 1, L.cheek, 0], [11, 9, 1, 1, L.cheek, 0]);
      if (L.smile) p.push([5, 10, 1, 1, L.mouth, 0], [6, 10, 4, 1, '#ffffff', 0], [10, 10, 1, 1, L.mouth, 0], [6, 11, 4, 1, L.skinD, 0]);
      else p.push([7, 10, 2, 1, L.mouth, 0]);
    } else {
      if (st === 'quiff') p.push([4, 0, 8, 2, L.hair, 1], [3, 2, 10, 8, L.hair, 0], [6, 0, 3, 1, L.hairL, 0]);
      else if (st === 'crop') p.push([5, 1, 6, 1, L.hair, 1], [3, 2, 10, 7, L.hair, 0], [6, 2, 3, 1, L.hairL, 0]);
      else p.push([L.style === 'fringe' ? 4 : 5, 1, L.style === 'fringe' ? 7 : 6, 1, L.hair, 1], [3, 2, 10, 9, L.hair, 0], [5, 3, 4, 1, L.hairL, 0]);
      p.push([4, 11, 8, 1, L.skinD, 0]);
    }
  } else { // facing left ('right' is drawn mirrored)
    if (!step) leg(6, 18, 4, false, 5, 5);
    else { leg(9, 18, 3, false); leg(4, 18, 3, false, 3, 3); }
    if (L.bag) p.push([10, 12, 3, 5, L.bag, 1], [10, 16, 3, 1, L.bagD, 0]);
    p.push([5, 12, 6, 6, L.shirt, 1], [5, 17, 6, 1, L.shirtD, 0], [5, 12, 2, 1, L.shirtD, 0]);
    pat([[6, 14, 0], [9, 13, 1], [8, 16, 2]]);
    arm(f === 1 ? 5 : f === 3 ? 9 : 7, 0);
    p.push([3, 2, 10, 10, L.skin, 1]);
    const st = L.style;
    if (st === 'quiff') p.push([3, 0, 7, 2, L.hair, 1], [3, 2, 10, 2, L.hair, 0], [10, 4, 3, 4, L.hair, 0], [4, 0, 3, 1, L.hairL, 0]);
    else if (st === 'fringe') p.push([4, 1, 7, 1, L.hair, 1], [3, 2, 10, 4, L.hair, 0], [8, 6, 5, 4, L.hair, 0], [3, 6, 3, 1, L.hair, 0], [5, 3, 3, 1, L.hairL, 0]);
    else if (st === 'crop') p.push([5, 1, 5, 1, L.hair, 1], [3, 2, 10, 2, L.hair, 0], [10, 4, 3, 3, L.hair, 0], [5, 2, 3, 1, L.hairL, 0]);
    else p.push([4, 1, 6, 1, L.hair, 1], [3, 2, 10, 3, L.hair, 0], [9, 5, 4, 5, L.hair, 0], [3, 5, 2, 1, L.hair, 0], [5, 3, 3, 1, L.hairL, 0]);
    p.push([10, 7, 2, 2, L.skin, 0], [10, 8, 1, 1, L.skinD, 0]);
    if (L.beard) p.push([8, 8, 2, 3, L.beard, 0], [4, 11, 6, 1, L.beard, 0], [3, 10, 1, 1, L.beard, 0]);
    if (L.glasses) p.push([4, 7, 3, 2, L.lens, 0]);
    p.push([5, 7, 1, 2, O, 0]);
    if (L.glasses) p.push([4, 6, 3, 1, L.glasses, 0], [7, 7, 3, 1, L.glasses, 0]);
    if (L.cheek) p.push([4, 9, 1, 1, L.cheek, 0]);
    if (L.smile) p.push([4, 10, 2, 1, '#ffffff', 0], [6, 10, 1, 1, L.mouth, 0]);
    else p.push([4, 10, 2, 1, L.mouth, 0]);
  }
  return p;
}
/* x,y = point between the feet; s = scale */
function drawHero(x, y, dir, f, look, s = 1) {
  const L = look || Hero.look();
  const scaled = s !== 1;
  if (scaled) { C.save(); C.translate(Math.round(x), Math.round(y)); C.scale(s, s); x = 0; y = 0; }
  const ox = Math.round(x - 8), oy = Math.round(y - 22);
  C.fillStyle = 'rgba(0,0,0,0.22)';
  C.fillRect(ox + 3, oy + 21, 10, 2); C.fillRect(ox + 4, oy + 23, 8, 1);
  const mir = dir === 'right';
  const parts = heroParts(L, mir ? 'left' : dir, f);
  const X = (px, w) => (mir ? ox + 16 - px - w : ox + px);
  for (const [px, py, w, h, , o] of parts) if (o) R(X(px, w) - 1, oy + py - 1, w + 2, h + 2, HERO_OUT);
  for (const [px, py, w, h, c] of parts) if (c) R(X(px, w), oy + py, w, h, c);
  if (scaled) C.restore();
}
/* a pixel avatar as an image (for HTML pages) */
function heroAvatar(id, s = 4, dir = 'down') {
  const b = makeBuffer(16 * s, 24 * s);
  drawOn(b.ctx, () => drawHero(8 * s, 22 * s, dir, 0, LOOKS[id], s));
  return b.canvas.toDataURL();
}

/* which team member the visitor plays with (remembered in this browser) */
const Hero = {
  id: null,
  load() {
    try { this.id = localStorage.getItem('dq-hero'); } catch (e) { this.id = null; }
    if (!LOOKS[this.id]) this.id = null;
  },
  set(id) {
    if (!LOOKS[id]) return;
    this.id = id;
    try { localStorage.setItem('dq-hero', id); } catch (e) { /* storage blocked */ }
  },
  current() { return this.id || (SITE.team.members[0] || {}).id; },
  look() { return LOOKS[this.current()] || LOOKS.didac; },
  member() { return SITE.team.members.find((m) => m.id === this.current()) || SITE.team.members[0]; }
};

/* --- the drone, side view (Hexsoon EDU450 style: orange front arms, orange cube) --- */
function drawDrone(cx, cy, t, s = 1, spinning = true) {
  C.save();
  C.translate(Math.round(cx), Math.round(cy));
  C.scale(s, s);
  const spin = spinning ? Math.floor(t * 30) % 2 : 0;
  const prop = (c, y) => {
    if (!spinning) { R(c - 3, y, 6, 1, '#c8cad6'); return; }
    if (spin) { R(c - 4, y, 8, 1, 'rgba(222,224,236,0.35)'); R(c - 1, y, 2, 1, '#e4e6f0'); }
    else R(c - 4, y, 8, 1, '#e4e6f0');
  };
  R(-8, -2, 16, 1, '#55596a');
  R(-9, -3, 2, 2, COL.metal); R(7, -3, 2, 2, COL.metal);
  prop(-8, -4); prop(8, -4);
  R(-4, 2, 1, 3, COL.metal); R(3, 2, 1, 3, COL.metal);
  R(-6, 5, 4, 1, COL.metal); R(2, 5, 4, 1, COL.metal);
  R(-5, -3, 10, 5, '#3a3a46'); R(-4, -4, 8, 1, '#3a3a46');
  R(-2, -4, 4, 3, COL.orange); R(-2, -4, 4, 1, COL.orangeL);
  R(-1, -7, 1, 3, COL.metal); R(-2, -8, 3, 1, COL.metal);
  R(-10, 0, 20, 1, COL.orange);
  R(-11, -1, 2, 2, COL.metal); R(9, -1, 2, 2, COL.metal);
  prop(-10, -2); prop(10, -2);
  const blink = Math.floor(t * 3) % 2;
  R(-11, 1, 1, 1, blink ? '#5cff6a' : '#2a7a33');
  R(10, 1, 1, 1, blink ? '#ff5c5c' : '#7a2a2a');
  C.restore();
}

/* ---------- sound (WebAudio blips, off by default) ---------- */
const Snd = {
  on: false, ac: null,
  beep(f = 660, d = 0.06, type = 'square', v = 0.04) {
    if (!this.on) return;
    try {
      this.ac = this.ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = this.ac.createOscillator(), g = this.ac.createGain(), now = this.ac.currentTime;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(v, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + d);
      o.connect(g); g.connect(this.ac.destination);
      o.start(now); o.stop(now + d + 0.02);
    } catch (e) { /* audio not available */ }
  },
  move() { this.beep(520, 0.04); },
  ok() { this.beep(660, 0.06); setTimeout(() => this.beep(990, 0.08), 70); },
  no() { this.beep(180, 0.14); },
  start() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.beep(f, 0.09), i * 90)); },
  win() { [523, 659, 784, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.beep(f, 0.1), i * 110)); }
};

/* ---------- game loop, scenes and input ---------- */
const KEYMAP = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
  Enter: 'a', ' ': 'a', z: 'a', Z: 'a', Escape: 'b', x: 'b', X: 'b', m: 'menu', M: 'menu'
};
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };

const Game = {
  cv: null, ctx: null, scene: null, t: 0, last: 0,
  held: {}, fade: 0, fading: null, blocked: () => false,

  init(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    C = this.ctx;
    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
    };
    canvas.addEventListener('click', (e) => {
      if (this.blocked() || this.fading) return;
      const [x, y] = pos(e);
      this.scene && this.scene.click && this.scene.click(x, y);
    });
    canvas.addEventListener('mousemove', (e) => {
      const [x, y] = pos(e);
      const hit = this.scene && this.scene.hover ? this.scene.hover(x, y) : false;
      canvas.style.cursor = hit ? 'pointer' : 'default';
    });
    canvas.addEventListener('mouseleave', () => { this.scene && this.scene.hover && this.scene.hover(-99, -99); });
    requestAnimationFrame((ts) => this.loop(ts));
  },

  key(k) {                                  // called on keydown
    this.held[k] = true;
    if (this.fading) return;
    this.scene && this.scene.key && this.scene.key(k);
  },
  release(k) { this.held[k] = false; },
  heldDir() {
    for (const d of ['up', 'down', 'left', 'right']) if (this.held[d]) return d;
    return null;
  },

  set(scene, params) {                      // switch immediately
    this.scene = scene;
    scene.enter && scene.enter(params || {});
  },
  go(scene, params) {                       // switch with a fade
    if (this.scene === scene) { scene.reenter && scene.reenter(params || {}); return; }
    if (!this.scene) { this.set(scene, params); return; }
    this.fading = { phase: 'out', t: 0, fn: () => this.set(scene, params) };
  },

  loop(ts) {
    const dt = Math.min(0.05, (ts - (this.last || ts)) / 1000);
    this.last = ts;
    this.t += dt;
    if (this.fading) {
      const f = this.fading;
      f.t += dt;
      if (f.phase === 'out') {
        this.fade = Math.min(1, f.t / 0.25);
        if (f.t >= 0.25) { f.fn(); f.phase = 'in'; f.t = 0; }
      } else {
        this.fade = Math.max(0, 1 - f.t / 0.25);
        if (f.t >= 0.25) { this.fading = null; this.fade = 0; }
      }
    }
    C = this.ctx;
    if (this.scene) {
      if (!this.blocked()) this.scene.update && this.scene.update(dt);
      this.scene.draw(this.t);
    }
    if (this.fade > 0) { C.fillStyle = `rgba(16,12,28,${this.fade})`; C.fillRect(0, 0, W, H); }
    requestAnimationFrame((t) => this.loop(t));
  }
};
