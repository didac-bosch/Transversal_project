/* ==========================================================================
   DRONE QUEST - the HANGAR: our real drone.
   Three views in one window: the real photo with clickable components (each
   one opens a close-up of that part), a detailed 3D model of the Hexsoon
   EDU 450 (three.js, loaded only when needed) and a walk-around video.
   ========================================================================== */
'use strict';

const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

/* parts of the 3D model that have no marker on the photo */
const EXTRA_PARTS = {
  arm: { name: 'Carbon-tube arm', text: 'Each arm is a carbon-fibre tube: light and stiff. It carries the motor at one end and goes into the arm clamp at the other.' },
  prop: {
    name: 'Propeller', img: 'prop.jpg',
    text: 'Two blades. CW and CCW propellers are mirrored, so every motor pushes the air down. We fly them only outside the lab bench!',
    credit: { text: 'T-MOTOR Air Gear 450 II propellers product photo (store.tmotor.com)', url: 'https://store.tmotor.com/goods.php?id=1220' }
  },
  battery: {
    name: 'LiPo battery', img: 'battery.jpg',
    text: 'The lithium-polymer battery that powers the whole drone. It hangs under the frame with two straps and plugs into the XT60 lead; the small white plug is the balance lead used to charge and check every cell.',
    credit: { text: 'Example of a LiPo pack: photo by Daniel van den Ouden, Wikimedia Commons (CC BY 2.0)', url: 'https://commons.wikimedia.org/wiki/File:Lithium-polymer_battery_(3629206176).jpg' }
  },
  wires: { name: 'Wiring', text: 'Yellow and black twisted pairs carry the motor signals from the autopilot; the red wires carry battery power to the ESCs.' }
};

const Hangar = {
  el: null, view: null,

  info(part) {
    return SITE.hangar.hotspots.find((h) => h.part === part) || EXTRA_PARTS[part] || null;
  },
  card(h, num) {
    const img = h.img ? `<img class="hs-img" src="${esc(SITE.hangar.parts + h.img)}" alt="${esc(h.name)}">` : '';
    const credit = h.credit ? `<small class="hs-credit">Image: <a href="${esc(h.credit.url)}" target="_blank" rel="noopener">${esc(h.credit.text)}</a></small>` : '';
    return `${img}<div class="hs-text"><b>${num ? num + '. ' : ''}${esc(h.name)}</b> ${esc(h.text)}${credit}</div>`;
  },

  /* static HTML: also used by the classic view (no JavaScript behaviour there) */
  body() {
    const H = SITE.hangar;
    const hs = H.hotspots;
    return `
      ${H.intro}
      <div class="tabs hangar-tabs" role="tablist">
        <button class="tab" role="tab" type="button" data-htab="photo" aria-selected="true">REAL PHOTO</button>
        <button class="tab" role="tab" type="button" data-htab="model" aria-selected="false">3D MODEL</button>
        <button class="tab" role="tab" type="button" data-htab="video" aria-selected="false">VIDEO</button>
      </div>
      <section data-hpane="photo">
        <div class="hs-wrap">
          <img src="${esc(H.photo.src)}" alt="${esc(H.photo.alt)}" width="1400" height="1167">
          ${hs.map((h, i) => `<button class="hs-marker" type="button" data-hs="${i}" style="left:${h.x}%;top:${h.y}%" aria-label="${esc(h.name)}">${i + 1}</button>`).join('')}
        </div>
        <div class="hs-card" aria-live="polite"><div class="hs-text">Click a number on the photo to see each component and its official photo.</div></div>
        <ol class="hs-list">${hs.map((h, i) => `<li><button type="button" class="hs-name" data-hs="${i}">${esc(h.name)}</button> ${esc(h.text)}</li>`).join('')}</ol>
      </section>
      <section data-hpane="model">
        <div class="model3d"><p class="m3d-msg">Open the HANGAR in the game to spin the 3D model of our drone.</p></div>
      </section>
      <section data-hpane="video">
        <figure class="tv">
          <video controls preload="metadata" playsinline poster="${esc(H.video.poster)}" src="${esc(H.video.src)}"></video>
          <figcaption>${esc(H.video.caption)}</figcaption>
        </figure>
      </section>`;
  },

  mount(el) {
    this.unmount();
    this.el = el;
    el.querySelectorAll('[data-htab]').forEach((b) => b.addEventListener('click', () => { Snd.move(); this.tab(b.dataset.htab); }));
    el.querySelectorAll('[data-hs]').forEach((b) => b.addEventListener('click', () => { Snd.move(); this.pick(+b.dataset.hs); }));
    this.tab('photo');
  },
  unmount() {
    if (this.view) { this.view.dispose(); this.view = null; }
    if (this.el) { const v = this.el.querySelector('video'); v && v.pause(); }
    this.el = null;
  },

  tab(id) {
    const el = this.el;
    el.querySelectorAll('[data-htab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.htab === id)));
    el.querySelectorAll('[data-hpane]').forEach((p) => { p.hidden = p.dataset.hpane !== id; });
    if (id !== 'video') { const v = el.querySelector('video'); v && v.pause(); }
    if (id === 'model') this.openModel();
    else if (this.view) this.view.pause();
  },

  pick(i) {
    const h = SITE.hangar.hotspots[i];
    const pane = this.el.querySelector('[data-hpane="photo"]');
    this.el.querySelectorAll('.hs-marker').forEach((m, k) => m.classList.toggle('on', k === i));
    pane.querySelector('.hs-card').innerHTML = this.card(h, i + 1);
    // pop-up over the photo, on the side away from the marker (hidden on phones: the card below is used)
    let pop = pane.querySelector('.hs-pop');
    if (!pop) {
      pop = document.createElement('div');
      pop.className = 'hs-pop';
      pane.querySelector('.hs-wrap').appendChild(pop);
    }
    pop.className = 'hs-pop ' + (h.x < 50 ? 'right' : 'left');
    pop.innerHTML = `<button class="btn x hs-close" type="button" aria-label="Close">X</button>${this.card(h, i + 1)}`;
    pop.querySelector('.hs-close').addEventListener('click', () => {
      Snd.move(); pop.remove();
      this.el.querySelectorAll('.hs-marker').forEach((m) => m.classList.remove('on'));
    });
    if (getComputedStyle(pop).display === 'none') pane.querySelector('.hs-card').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },

  /* ---------- 3D model ---------- */
  loadThree() {
    if (window.THREE) return Promise.resolve();
    if (!this.loading) {
      this.loading = new Promise((ok, fail) => {
        const s = document.createElement('script');
        s.src = THREE_URL; s.async = true; s.crossOrigin = 'anonymous';
        s.onload = ok;
        s.onerror = () => { this.loading = null; s.remove(); fail(new Error('three.js')); };
        document.head.appendChild(s);
      });
    }
    return this.loading;
  },
  openModel() {
    if (this.view) { this.view.resume(); return; }
    const box = this.el.querySelector('.model3d');
    box.innerHTML = '<p class="m3d-msg">LOADING THE 3D MODEL...</p>';
    const el = this.el;
    this.loadThree().then(() => {
      if (this.el !== el || this.view) return;          // window closed or already built
      box.innerHTML = `
        <canvas aria-label="3D model of our Hexsoon EDU 450. Drag to rotate, click a part to identify it, use the + and - buttons to zoom."></canvas>
        <p class="m3d-help">DRAG TO ROTATE &middot; CLICK A PART &middot; PINCH, CTRL + WHEEL OR + / - TO ZOOM</p>`;
      const bar = document.createElement('div');
      bar.className = 'lab-ctrls m3d-ctrls';
      bar.innerHTML = `
        <button class="btn" type="button" data-m="explode">EXPLODED VIEW</button>
        <button class="btn" type="button" data-m="props">PROPELLERS</button>
        <button class="btn on" type="button" data-m="labels">MOTOR LABELS</button>
        <button class="btn" type="button" data-m="in" aria-label="Zoom in">+</button>
        <button class="btn" type="button" data-m="out" aria-label="Zoom out">-</button>
        <button class="btn" type="button" data-m="reset">RESET VIEW</button>`;
      const card = document.createElement('div');
      card.className = 'hs-card m3d-card';
      card.setAttribute('aria-live', 'polite');
      card.innerHTML = '<div class="hs-text">Click any part of the 3D drone to identify it. Try the EXPLODED VIEW to see how it is put together.</div>';
      box.after(bar, card);
      this.view = DroneModel.create(box.querySelector('canvas'), box, (part) => {
        const h = part && this.info(part);
        card.innerHTML = h ? this.card(h) : '<div class="hs-text">Click any part of the 3D drone to identify it.</div>';
      });
      bar.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => {
        Snd.move();
        const m = b.dataset.m;
        if (m === 'reset') { this.view.reset(); return; }
        if (m === 'in' || m === 'out') { this.view.zoom(m === 'in' ? 0.85 : 1.18); return; }
        b.classList.toggle('on', this.view.toggle(m));
      }));
    }).catch(() => {
      box.innerHTML = '<p class="m3d-msg">The 3D viewer could not be loaded (no internet connection?). The real photo and the video still work.</p>';
    });
  }
};

/* ---------------------------------------------------------------- the model
   Units: 1 = 10 cm. Front = -Z, right = +X, up = +Y.
   Motor layout as in the WORKBENCH lab (labs.js, QUAD): Quad X,
   1 front-right CCW, 2 rear-left CCW, 3 front-left CW, 4 rear-right CW.
   Every part is a group with userData.part (for clicking) and
   userData.ex (how far it moves in the exploded view). */
const DroneModel = {
  create(canvas, box, onPick) {
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;

    const scene = new T.Scene();
    scene.background = new T.Color(0xf1f3f7);
    scene.fog = new T.Fog(0xf1f3f7, 22, 38);
    const camera = new T.PerspectiveCamera(32, 1.6, 0.1, 100);

    scene.add(new T.HemisphereLight(0xffffff, 0x8a8f9c, 0.7));
    const sun = new T.DirectionalLight(0xffffff, 0.85);
    sun.position.set(4, 9, 3);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0005;
    Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 25 });
    scene.add(sun);
    const rim = new T.DirectionalLight(0xdfe8ff, 0.35);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    /* ---------- textures drawn on canvases (no image files) ---------- */
    const canvasTex = (w, h, draw) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      draw(c.getContext('2d'), w, h);
      const t = new T.CanvasTexture(c); t.anisotropy = 4;
      return t;
    };
    const carbon = (rx, ry) => {
      const t = canvasTex(64, 64, (g) => {
        g.fillStyle = '#1b1d22'; g.fillRect(0, 0, 64, 64);
        for (let y = 0; y < 64; y += 8) for (let x = 0; x < 64; x += 8) {
          const odd = ((x + y) / 8) % 2;
          const gr = g.createLinearGradient(x, y, odd ? x + 8 : x, odd ? y : y + 8);
          gr.addColorStop(0, '#24272d'); gr.addColorStop(0.5, '#3b3f48'); gr.addColorStop(1, '#202329');
          g.fillStyle = gr; g.fillRect(x + 0.5, y + 0.5, 7, 7);
        }
      });
      t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry);
      return t;
    };
    const label = (w, h, bg, lines) => canvasTex(w, h, (g) => {
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      for (const [text, x, y, size, color, align] of lines) {
        g.fillStyle = color; g.font = `bold ${size}px Arial, sans-serif`;
        g.textAlign = align || 'left'; g.textBaseline = 'middle'; g.fillText(text, x, y);
      }
    });

    const M = (color, o = {}) => new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.6, metalness: 0.1 }, o));
    const mat = {
      carbonPlate: M(0xffffff, { map: carbon(3, 3), roughness: 0.4, metalness: 0.3 }),
      carbonTube: M(0xffffff, { map: carbon(4, 14), roughness: 0.35, metalness: 0.3 }),
      carbonLeg: M(0xffffff, { map: carbon(2, 20), roughness: 0.4, metalness: 0.3 }),
      orange: M(0xff5a1f, { roughness: 0.55 }),
      orangeFlat: M(0xff5a1f, { roughness: 0.6, flatShading: true }),
      black: M(0x18181c, { roughness: 0.7 }),
      blackFlat: M(0x1c1c21, { roughness: 0.65, flatShading: true }),
      hole: M(0x0c0c0e, { roughness: 1 }),
      metal: M(0xc4c8d0, { roughness: 0.3, metalness: 0.9 }),
      alu: M(0xd8dbe2, { roughness: 0.25, metalness: 0.8, flatShading: true }),
      copper: M(0xb8733a, { roughness: 0.35, metalness: 0.8 }),
      acrylic: M(0xe8f6ff, { roughness: 0.05, metalness: 0, transparent: true, opacity: 0.32, depthWrite: false }),
      cube: M(0xff6a2a, { roughness: 0.45 }),
      board: M(0x111114, { roughness: 0.5 }),
      jst: M(0xf4f1e8, { roughness: 0.6 }),
      gold: M(0xd9b34a, { roughness: 0.3, metalness: 0.9 }),
      xt60: M(0xf0c030, { roughness: 0.5 }),
      red: M(0xc0201c, { roughness: 0.5 }),
      blue: M(0x2c4fd0, { roughness: 0.5 }),
      yellow: M(0xe8c21c, { roughness: 0.5 }),
      table: M(0xe4e8ef, { roughness: 0.95 }),
      prop: M(0x16161a, { roughness: 0.35, side: T.DoubleSide })
    };

    /* ---------- helpers ---------- */
    const drone = new T.Group();
    scene.add(drone);
    const parts = [];
    const part = (name, ex, parent = drone) => {
      const g = new T.Group();
      g.userData.part = name; g.userData.ex = ex || new T.Vector3();
      parent.add(g); parts.push(g);
      return g;
    };
    const add = (geo, m, x, y, z, parent) => {
      const mesh = new T.Mesh(geo, m);
      mesh.position.set(x, y, z);
      mesh.castShadow = true; mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    const V = (x, y, z) => new T.Vector3(x, y, z);
    const box3 = (w, h, d) => new T.BoxGeometry(w, h, d);
    const cyl = (rt, rb, h, seg = 20) => new T.CylinderGeometry(rt, rb, h, seg);
    const tube = (pts, r, m, parent) => add(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map((p) => V(...p))), Math.max(12, pts.length * 8), r, 6, false), m, 0, 0, 0, parent);
    // two wires twisted around a path (the yellow / black signal pairs)
    const twisted = (pts, r, mA, mB, parent, turns = 6) => {
      const curve = new T.CatmullRomCurve3(pts.map((p) => V(...p)));
      const n = 60, a = [], b = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, p = curve.getPoint(t), tan = curve.getTangent(t);
        const side = new T.Vector3().crossVectors(tan, V(0, 1, 0)).normalize();
        if (side.lengthSq() < 0.01) side.set(1, 0, 0);
        const up = new T.Vector3().crossVectors(side, tan).normalize();
        const ang = t * turns * Math.PI * 2, off = r * 1.1;
        const o = side.clone().multiplyScalar(Math.cos(ang) * off).add(up.clone().multiplyScalar(Math.sin(ang) * off));
        a.push(p.clone().add(o)); b.push(p.clone().sub(o));
      }
      add(new T.TubeGeometry(new T.CatmullRomCurve3(a), n * 2, r, 5, false), mA, 0, 0, 0, parent);
      add(new T.TubeGeometry(new T.CatmullRomCurve3(b), n * 2, r, 5, false), mB, 0, 0, 0, parent);
    };
    // flat plate with holes (rounded rectangle extruded upwards from y = 0)
    const plate = (w, d, r, holes, depth) => {
      const s = new T.Shape(), x = -w / 2, y = -d / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
      s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      for (const h of holes) {
        const p = new T.Path();
        if (h.n) {
          for (let i = 0; i <= h.n; i++) {
            const a = (i / h.n) * Math.PI * 2 + (h.rot || 0);
            const px = h.x + Math.cos(a) * h.r, py = h.y + Math.sin(a) * h.r;
            i ? p.lineTo(px, py) : p.moveTo(px, py);
          }
        } else p.absarc(h.x, h.y, h.r, 0, Math.PI * 2, true);
        s.holes.push(p);
      }
      const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 18 });
      g.rotateX(-Math.PI / 2);
      return g;
    };
    const corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    /* ---------- central frame ---------- */
    const frame = part('frame', V(0, -0.35, 0));
    add(plate(1.5, 1.5, 0.12, [
      { x: 0, y: 0, r: 0.2 }, ...corners.map(([sx, sz]) => ({ x: sx * 0.42, y: sz * 0.42, r: 0.07 })),
      { x: 0, y: 0.55, r: 0.09 }, { x: 0, y: -0.55, r: 0.09 }, { x: 0.55, y: 0, r: 0.09 }, { x: -0.55, y: 0, r: 0.09 }
    ], 0.035), mat.carbonPlate, 0, -0.02, 0, frame);
    // PDB: a thin board with copper pads between the plates
    const pdb = part('frame', V(0, -0.15, 0), frame);
    add(box3(0.62, 0.025, 0.62), M(0x1f3b2a, { roughness: 0.5 }), 0, 0.06, 0, pdb);
    for (const [sx, sz] of corners) add(box3(0.1, 0.012, 0.07), mat.gold, sx * 0.22, 0.078, sz * 0.22, pdb);
    // red power wires from the PDB towards each arm (to the ESCs)
    for (const [sx, sz] of corners) tube([[sx * 0.2, 0.08, sz * 0.2], [sx * 0.42, 0.14, sz * 0.38], [sx * 0.62, 0.12, sz * 0.62]], 0.018, mat.red, pdb);

    const mid = part('frame', V(0, 0.25, 0));
    add(plate(1.3, 1.3, 0.1, [
      ...corners.map(([sx, sz]) => ({ x: sx * 0.38, y: sz * 0.38, r: 0.06 })), { x: 0, y: 0.45, r: 0.12 }, { x: 0, y: -0.45, r: 0.12 }
    ], 0.035), mat.carbonPlate, 0, 0.345, 0, mid);
    for (const [sx, sz] of corners) add(cyl(0.028, 0.028, 0.34, 6), mat.alu, sx * 0.58, 0.17, sz * 0.2, frame);

    // orange arm clamps with their holes
    const clampG = [];
    for (const [sx, sz] of corners) {
      const ang = Math.atan2(sz, sx);
      const c = part('clamp', V(Math.cos(ang) * 0.35, 0, Math.sin(ang) * 0.35));
      c.position.set(sx * 0.5, 0.18, sz * 0.5);
      c.rotation.y = -ang;
      add(box3(0.3, 0.3, 0.3), mat.orange, 0, 0, 0, c);
      for (const [fy, fz] of [[0, 1], [0, -1], [1, 0]]) {
        for (const u of [-0.07, 0.07]) for (const v of [-0.07, 0.07]) {
          const hole = add(cyl(0.042, 0.042, 0.02, 14), mat.hole, fy ? u : u, fy ? 0.151 : v, fy ? v : fz * 0.151, c);
          if (!fy) hole.rotation.x = Math.PI / 2;
        }
      }
      clampG.push(c);
    }

    /* ---------- autopilot: carrier board + Orange Cube + connectors ---------- */
    const cube = part('cube', V(0, 0.7, 0));
    const carrierTex = label(256, 64, '#111114', [['CubePilot', 128, 32, 30, '#e8e8ee', 'center']]);
    const carrierMats = [mat.board, mat.board, mat.board, mat.board, M(0xffffff, { map: carrierTex, roughness: 0.5 }), mat.board];
    add(box3(0.82, 0.09, 0.54), carrierMats, 0, 0.42, 0.05, cube);
    for (let i = 0; i < 6; i++) add(box3(0.07, 0.045, 0.05), mat.jst, -0.3 + i * 0.12, 0.485, 0.29, cube);
    for (let i = 0; i < 4; i++) add(box3(0.05, 0.045, 0.07), mat.jst, 0.38, 0.485, -0.12 + i * 0.1, cube);
    const cubeGeo = new T.ExtrudeGeometry((() => {
      const s = new T.Shape(), a = 0.16, r = 0.04;
      s.moveTo(-a + r, -a); s.lineTo(a - r, -a); s.quadraticCurveTo(a, -a, a, -a + r); s.lineTo(a, a - r);
      s.quadraticCurveTo(a, a, a - r, a); s.lineTo(-a + r, a); s.quadraticCurveTo(-a, a, -a, a - r);
      s.lineTo(-a, -a + r); s.quadraticCurveTo(-a, -a, -a + r, -a);
      return s;
    })(), { depth: 0.3, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
    cubeGeo.rotateX(-Math.PI / 2);
    add(cubeGeo, mat.cube, 0, 0.47, 0.05, cube);
    add(box3(0.07, 0.03, 0.02), mat.hole, 0, 0.56, -0.13, cube);                     // micro-USB
    // signal pairs from the carrier board to the four arms
    const wires = part('wires', V(0, 0.45, 0));
    for (const [sx, sz] of corners) twisted([[sx * 0.25, 0.43, sz * 0.2], [sx * 0.45, 0.39, sz * 0.4], [sx * 0.62, 0.3, sz * 0.62]], 0.012, mat.yellow, mat.black, wires, 7);

    /* ---------- acrylic top plate on standoffs ---------- */
    const top = part('plate', V(0, 1.15, 0));
    const hexes = [[-0.36, -0.22], [0, -0.3], [0.36, -0.22], [-0.36, 0.22], [0.36, 0.22]].map(([x, y]) => ({ x, y, r: 0.11, n: 6, rot: Math.PI / 6 }));
    const acrGeo = plate(1.25, 1.05, 0.08, [...hexes, { x: 0, y: 0.18, r: 0.13 }, { x: 0, y: -0.02, r: 0.05 }], 0.04);
    add(acrGeo, mat.acrylic, 0, 0.94, 0, top).castShadow = false;
    const edges = new T.LineSegments(new T.EdgesGeometry(acrGeo, 30), new T.LineBasicMaterial({ color: 0x9fc3dd }));
    edges.position.y = 0.94; top.add(edges);
    for (const [sx, sz] of corners) add(cyl(0.024, 0.024, 0.5, 6), mat.alu, sx * 0.52, 0.69, sz * 0.42, top);

    /* ---------- GPS mast and Here3 puck (front-left corner, as on our drone) ---------- */
    const mast = part('mast', V(0, 1.7, 0));
    add(box3(0.16, 0.05, 0.16), mat.black, -0.42, 1.005, -0.34, mast);
    for (const [sx, sz] of corners) add(cyl(0.012, 0.012, 0.03, 8), mat.metal, -0.42 + sx * 0.055, 1.04, -0.34 + sz * 0.055, mast);
    const pole = add(box3(0.09, 1.3, 0.09), mat.black, -0.46, 1.68, -0.34, mast);
    pole.rotation.z = 0.06;
    add(box3(0.12, 0.25, 0.12), mat.blackFlat, -0.43, 1.2, -0.34, mast);            // folding joint
    const gps = part('gps', V(0, 1.9, 0));
    const puckGeo = new T.LatheGeometry([V(0, 0, 0), V(0.36, 0, 0), V(0.385, 0.02, 0), V(0.39, 0.06, 0), V(0.37, 0.1, 0), V(0.3, 0.12, 0), V(0, 0.125, 0)].map((p) => new T.Vector2(p.x, p.y)), 48);
    add(puckGeo, mat.black, -0.5, 2.32, -0.34, gps);
    const here3 = label(256, 256, '#1d1e23', [['Here3', 128, 128, 44, '#c9ccd4', 'center']]);
    add(new T.CircleGeometry(0.29, 48), M(0xffffff, { map: here3, roughness: 0.4 }), -0.5, 2.448, -0.34, gps).rotation.x = -Math.PI / 2;
    add(box3(0.06, 0.02, 0.03), M(0x9fe3ff, { emissive: 0x2a8ad0, emissiveIntensity: 0.6 }), -0.5, 2.45, -0.06, gps);   // status LED
    tube([[-0.38, 2.3, -0.2], [-0.05, 2.0, -0.05], [0.12, 1.4, 0.08], [0.06, 0.95, 0.12], [0.02, 0.6, 0.1]], 0.018, mat.black, gps);

    /* ---------- under the frame: telemetry radio, receiver, XT60 lead ---------- */
    const telem = part('telemetry', V(0.5, -0.5, 0.3));
    const telTex = label(256, 160, '#141418', [['Holybro', 20, 30, 22, '#d8d8de'], ['TELEMETRY RADIO', 20, 82, 26, '#f0f0f4'], ['433 MHz 500 mW', 20, 122, 20, '#b8b8c0']]);
    // mounted on its side under the frame, label facing out (right side of the drone)
    add(box3(0.1, 0.26, 0.42), [M(0xffffff, { map: telTex }), mat.board, mat.board, mat.board, mat.board, mat.board], 0.5, -0.16, 0.32, telem);
    add(cyl(0.025, 0.025, 0.08, 10), mat.gold, 0.5, -0.2, 0.56, telem).rotation.x = Math.PI / 2;
    add(cyl(0.03, 0.03, 0.06, 10), mat.black, 0.5, -0.24, 0.6, telem);
    add(cyl(0.026, 0.034, 0.52, 12), mat.black, 0.5, -0.52, 0.6, telem);           // antenna pointing down

    const rx = part('receiver', V(-0.55, -0.45, 0));
    const rxTex = label(256, 160, '#121216', [['R8 PRO', 128, 62, 44, '#f2f2f6', 'center'], ['ACCESS', 128, 118, 24, '#4f8de8', 'center']]);
    // also on its side, label facing the left side of the drone
    add(box3(0.1, 0.2, 0.34), [mat.board, M(0xffffff, { map: rxTex }), mat.board, mat.board, mat.board, mat.board], -0.45, -0.13, 0.1, rx);
    tube([[-0.45, -0.23, -0.02], [-0.55, -0.5, -0.1], [-0.68, -0.85, -0.2]], 0.007, mat.black, rx);
    tube([[-0.45, -0.23, 0.22], [-0.4, -0.5, 0.36], [-0.32, -0.88, 0.5]], 0.007, mat.black, rx);
    add(cyl(0.014, 0.014, 0.12, 8), mat.black, -0.69, -0.9, -0.21, rx);
    add(cyl(0.014, 0.014, 0.12, 8), mat.black, -0.32, -0.94, 0.51, rx);

    const xt = part('xt60', V(0.15, -0.6, 0.3));
    twisted([[0.18, -0.02, 0.48], [0.28, -0.22, 0.62], [0.32, -0.38, 0.7]], 0.017, mat.red, mat.black, xt, 2);
    add(box3(0.15, 0.08, 0.11), mat.xt60, 0.33, -0.44, 0.72, xt);
    for (const k of [-0.025, 0.025]) add(cyl(0.012, 0.012, 0.05, 8), mat.gold, 0.33 + k, -0.5, 0.72, xt);

    /* ---------- LiPo battery under the frame, held by two straps ---------- */
    const bat = part('battery', V(0, -1.0, 0));
    const batGeo = new T.ExtrudeGeometry((() => {            // rounded cross-section, extruded front to back
      const s = new T.Shape(), w = 0.24, h = 0.19, r = 0.05;
      s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r); s.lineTo(w, h - r);
      s.quadraticCurveTo(w, h, w - r, h); s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r);
      s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h);
      return s;
    })(), { depth: 1.46, bevelEnabled: false, curveSegments: 8 });
    batGeo.translate(0, 0, -0.73);
    add(batGeo, M(0x2a3a5c, { roughness: 0.35, metalness: 0.15 }), 0, -0.26, 0, bat);
    const batTex = label(512, 128, '#f2c230', [['LiPo', 24, 64, 64, '#1d1e24'], ['BATTERY', 200, 46, 34, '#1d1e24'], ['handle with care', 200, 92, 24, '#3a3a40']]);
    for (const k of [-1, 1]) {                                // label on both sides
      const lab = add(new T.PlaneGeometry(0.9, 0.22), M(0xffffff, { map: batTex, roughness: 0.5 }), k * 0.2405, -0.26, 0, bat);
      lab.rotation.y = k * Math.PI / 2;
    }
    // straps: a black loop around the battery and the bottom plate, with a buckle
    for (const z of [-0.42, 0.42]) {
      add(box3(0.52, 0.014, 0.1), mat.black, 0, -0.458, z, bat);
      add(box3(0.52, 0.014, 0.1), mat.black, 0, 0.022, z, bat);
      for (const k of [-1, 1]) add(box3(0.014, 0.49, 0.1), mat.black, k * 0.255, -0.215, z, bat);
      add(box3(0.12, 0.03, 0.12), M(0x6b6f7a, { roughness: 0.4, metalness: 0.5 }), 0.1, -0.47, z, bat);
    }
    // main lead to the XT60 of the drone, and the white balance plug
    twisted([[0.1, -0.2, 0.74], [0.24, -0.34, 0.86], [0.33, -0.44, 0.84]], 0.017, mat.red, mat.black, bat, 2);
    add(box3(0.15, 0.08, 0.1), mat.xt60, 0.33, -0.44, 0.82, bat);
    [[mat.black, -0.03], [mat.red, -0.01], [mat.red, 0.01], [mat.red, 0.03]].forEach(([m, k]) => tube([[-0.1 + k, -0.3, 0.74], [-0.14 + k, -0.42, 0.86], [-0.16 + k, -0.58, 0.9]], 0.006, m, bat));
    add(box3(0.12, 0.05, 0.04), mat.jst, -0.16, -0.62, 0.9, bat);

    /* ---------- arms, motor mounts, legs, motors, propellers ---------- */
    const ARMS = [
      { n: 1, sx: 1, sz: -1, spin: 'ccw', front: true },
      { n: 2, sx: -1, sz: 1, spin: 'ccw', front: false },
      { n: 3, sx: -1, sz: -1, spin: 'cw', front: true },
      { n: 4, sx: 1, sz: 1, spin: 'cw', front: false }
    ];
    const R0 = 0.55, R1 = 2.25, props = [], labels = [];
    const bladeShape = (() => {                                     // tapered blade with a rounded tip
      const s = new T.Shape();
      s.moveTo(0.06, -0.05); s.lineTo(0.35, -0.085); s.quadraticCurveTo(0.8, -0.1, 1.1, -0.05);
      s.quadraticCurveTo(1.2, -0.02, 1.18, 0.03); s.quadraticCurveTo(0.8, 0.07, 0.35, 0.06); s.lineTo(0.06, 0.04);
      return s;
    })();
    for (const a of ARMS) {
      const ang = Math.atan2(a.sz, a.sx);
      const armG = new T.Group();                                   // local +X points outwards along the arm
      armG.rotation.y = -ang; drone.add(armG);
      const out = (d) => V(d, 0, 0);

      const tubeP = part('arm', out(0.55), armG);
      const t = add(cyl(0.07, 0.07, R1 - R0, 24), mat.carbonTube, (R0 + R1) / 2, 0.18, 0, tubeP);
      t.rotation.z = Math.PI / 2;

      const mountMat = a.front ? mat.orange : mat.black, mountFlat = a.front ? mat.orangeFlat : mat.blackFlat;
      const mount = part('mount', V(0.9, 0, 0), armG);
      add(box3(0.34, 0.24, 0.3), mountMat, R1, 0.18, 0, mount);
      add(cyl(0.11, 0.11, 0.33, 20), mountMat, R1 - 0.2, 0.18, 0, mount).rotation.z = Math.PI / 2;   // tube clamp
      for (const k of [-1, 1]) add(cyl(0.02, 0.02, 0.33, 8), mat.metal, R1 - 0.2, 0.18 + k * 0.1, k * 0.12, mount).rotation.x = Math.PI / 2;
      add(cyl(0.14, 0.055, 0.78, 10), mountFlat, R1, -0.32, 0, mount);              // fluted leg sleeve

      const leg = part('leg', V(0.9, -0.7, 0), armG);
      add(cyl(0.035, 0.035, 1.8, 14), mat.carbonLeg, R1, -1.5, 0, leg);
      const foot = add(new T.SphereGeometry(0.06, 14, 10), mat.black, R1, -2.38, 0, leg);
      foot.scale.y = 0.7;

      const motor = part('motor', V(0.9, 0.55, 0), armG);
      const mx = R1, my = 0.3;
      add(cyl(0.15, 0.16, 0.05, 28), mat.black, mx, my + 0.025, 0, motor);         // base
      add(cyl(0.155, 0.155, 0.015, 28), mat.metal, mx, my + 0.055, 0, motor);
      add(cyl(0.135, 0.135, 0.17, 24), mat.copper, mx, my + 0.15, 0, motor);       // windings
      for (let i = 0; i < 7; i++) {                                                // bell with vents
        const b = (i / 7) * Math.PI * 2;
        const bar = add(box3(0.06, 0.17, 0.035), mat.black, mx + Math.cos(b) * 0.158, my + 0.15, Math.sin(b) * 0.158, motor);
        bar.rotation.y = -b + Math.PI / 2;
      }
      add(cyl(0.172, 0.172, 0.045, 28), mat.black, mx, my + 0.255, 0, motor);
      add(cyl(0.06, 0.06, 0.01, 20), mat.metal, mx, my + 0.282, 0, motor);
      add(cyl(0.02, 0.02, 0.16, 10), mat.metal, mx, my + 0.36, 0, motor);          // shaft
      // the three motor wires loop outside the mount, as on our drone
      [[mat.red, -0.05], [mat.blue, 0], [mat.black, 0.05]].forEach(([m, k]) => tube([
        [mx - 0.05, my + 0.03, k], [mx - 0.25, my - 0.02, 0.18 + k], [mx - 0.32, my - 0.22, 0.24 + k], [mx - 0.12, my - 0.28, 0.12 + k]
      ], 0.014, m, motor));

      const prop = part('prop', V(0.9, 1.1, 0), armG);
      prop.position.set(0, 0, 0);
      const rotor = new T.Group();
      rotor.position.set(mx, my + 0.42, 0);
      prop.add(rotor);
      const pitch = a.spin === 'ccw' ? 0.22 : -0.22;
      for (const k of [0, Math.PI]) {
        const bg = new T.ExtrudeGeometry(bladeShape, { depth: 0.012, bevelEnabled: false, curveSegments: 10 });
        bg.rotateX(-Math.PI / 2);
        const bl = add(bg, mat.prop, 0, 0, 0, rotor);
        bl.rotation.y = k; bl.rotation.x = k ? -pitch : pitch;
      }
      add(cyl(0.075, 0.075, 0.06, 18), mat.black, 0, 0.01, 0, rotor);
      add(cyl(0.04, 0.04, 0.05, 6), mat.alu, 0, 0.06, 0, rotor);                 // prop nut
      rotor.userData.dir = a.spin === 'ccw' ? 1 : -1;
      prop.visible = false;
      props.push({ g: prop, rotor });

      const lab = this.sprite(`${a.n} ${a.spin.toUpperCase()}`, a.front ? '#e0480f' : '#2b2433');
      lab.position.set(R1 + 0.15, 1.05, 0);
      motor.add(lab); labels.push(lab);
    }
    const front = this.sprite('FRONT', '#2b2433');
    front.position.set(0, -2.1, -3.0);
    drone.add(front); labels.push(front);

    // table (same colour as the background, so only the shadow shows)
    const table = add(new T.PlaneGeometry(60, 60), mat.table, 0, -2.42, 0, scene);
    table.rotation.x = -Math.PI / 2; table.castShadow = false;

    for (const p of parts) p.userData.home = p.position.clone();

    /* ---------- picking: click a part to identify it ---------- */
    const ray = new T.Raycaster();
    let sel = null;
    const select = (g) => {
      if (sel) { scene.remove(sel.helper); sel.helper.geometry.dispose(); sel.helper.material.dispose(); sel = null; }
      if (g) {
        const helper = new T.BoxHelper(g, 0xffd23f);
        helper.material.depthTest = false; helper.renderOrder = 20;
        scene.add(helper); sel = { g, helper };
      }
      onPick && onPick(g ? g.userData.part : null);
    };
    const pickAt = (cx, cy) => {
      const r = canvas.getBoundingClientRect();
      ray.setFromCamera({ x: ((cx - r.left) / r.width) * 2 - 1, y: -((cy - r.top) / r.height) * 2 + 1 }, camera);
      const hits = ray.intersectObjects(drone.children, true).filter((h) => h.object.visible && !h.object.isSprite && !h.object.isLineSegments);
      // clicking through the transparent top plate identifies what is just under it
      let hit = hits[0];
      if (hit && hit.object.material.transparent) {
        const under = hits.find((h) => !h.object.material.transparent);
        if (under && under.distance - hit.distance < 0.6) hit = under;
      }
      let o = hit && hit.object;
      while (o && !o.userData.part) o = o.parent;
      select(o || null);
    };

    /* ---------- camera control: drag to orbit, pinch / ctrl + wheel to zoom ---------- */
    const HOME = { yaw: 1.85, pitch: 0.36, dist: 12 };
    const cam = Object.assign({}, HOME);
    const target = V(0, -0.05, 0);
    let idle = 0, raf = 0, last = 0, paused = false, explode = 0, explodeTo = 0;
    const ptrs = new Map();
    let pinch = 0, downAt = null;
    const place = () => {
      const cp = Math.cos(cam.pitch);
      camera.position.set(target.x + cam.dist * cp * Math.sin(cam.yaw), target.y + cam.dist * Math.sin(cam.pitch), target.z + cam.dist * cp * Math.cos(cam.yaw));
      camera.lookAt(target);
    };
    const zoom = (k) => { idle = 0; cam.dist = Math.min(20, Math.max(4.5, cam.dist * k)); };
    const onDown = (e) => {
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, [e.clientX, e.clientY]); idle = 0;
      downAt = ptrs.size === 1 ? [e.clientX, e.clientY] : null;
      if (ptrs.size === 2) { const [p, q] = [...ptrs.values()]; pinch = Math.hypot(p[0] - q[0], p[1] - q[1]); }
    };
    const onMove = (e) => {
      if (!ptrs.has(e.pointerId)) return;
      const [px, py] = ptrs.get(e.pointerId);
      ptrs.set(e.pointerId, [e.clientX, e.clientY]); idle = 0;
      if (ptrs.size === 2) {
        const [p, q] = [...ptrs.values()], d = Math.hypot(p[0] - q[0], p[1] - q[1]);
        if (pinch) zoom(pinch / d);
        pinch = d; return;
      }
      cam.yaw -= (e.clientX - px) * 0.01;
      cam.pitch = Math.min(1.35, Math.max(-0.15, cam.pitch + (e.clientY - py) * 0.008));
    };
    const onUp = (e) => {
      if (downAt && ptrs.size === 1 && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 6) pickAt(e.clientX, e.clientY);
      ptrs.delete(e.pointerId); pinch = 0; downAt = null;
    };
    // plain wheel keeps scrolling the window; Ctrl + wheel (or pinch) zooms
    const onWheel = (e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zoom(1 + Math.sign(e.deltaY) * 0.08); };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    const resize = () => {
      const w = Math.max(240, box.clientWidth), h = Math.round(Math.min(480, w * 0.64));
      renderer.setSize(w, h, false);
      canvas.style.width = '100%'; canvas.style.height = h + 'px';
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    ro ? ro.observe(box) : window.addEventListener('resize', resize);
    resize();

    const ease = (x) => x * x * (3 - 2 * x);
    const tick = (ts) => {
      if (paused) return;
      const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
      last = ts; idle += dt;
      if (idle > 2.5 && !ptrs.size) cam.yaw += dt * 0.25;            // slow turntable when nobody touches it
      if (explode !== explodeTo) {
        explode = explodeTo > explode ? Math.min(explodeTo, explode + dt * 1.6) : Math.max(explodeTo, explode - dt * 1.6);
        const k = ease(explode);
        for (const p of parts) p.position.copy(p.userData.home).addScaledVector(p.userData.ex, k);
        if (sel) sel.helper.update();
      }
      for (const p of props) if (p.g.visible) p.rotor.rotation.y += p.rotor.userData.dir * dt * 7;
      if (sel && sel.g.userData.part === 'prop') sel.helper.update();
      place();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return {
      toggle(what) {
        if (what === 'explode') {
          explodeTo = explodeTo ? 0 : 1; idle = 0;
          if (explodeTo) { cam.dist = Math.max(cam.dist, 16); target.y = 0.4; } else target.y = -0.05;   // keep it all in frame
          return !!explodeTo;
        }
        const list = what === 'props' ? props.map((p) => p.g) : labels;
        const on = !list[0].visible;
        list.forEach((o) => { o.visible = on; });
        if (!on && sel && list.includes(sel.g)) select(null);
        return on;
      },
      reset() { Object.assign(cam, HOME); target.y = explodeTo ? 0.4 : -0.05; if (explodeTo) cam.dist = 16; idle = 0; },
      zoom,
      pause() { paused = true; cancelAnimationFrame(raf); },
      resume() { if (!paused) return; paused = false; last = 0; raf = requestAnimationFrame(tick); },
      dispose() {
        paused = true; cancelAnimationFrame(raf);
        ro ? ro.disconnect() : window.removeEventListener('resize', resize);
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
        canvas.removeEventListener('wheel', onWheel);
        select(null);
        const seen = new Set();
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          for (const m of [].concat(o.material || [])) {
            if (seen.has(m)) continue;
            seen.add(m); if (m.map) m.map.dispose(); m.dispose();
          }
        });
        renderer.dispose();
        renderer.forceContextLoss && renderer.forceContextLoss();
      },
      _debug: { scene, camera, cam, parts, pickAt, select }
    };
  },

  /* text label always facing the camera (canvas texture on a sprite) */
  sprite(text, color, scale = 0.06) {   // constant size on screen (fraction of the viewport height)
    const T = window.THREE;
    const c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.strokeStyle = '#2b2433'; g.lineWidth = 6;
    g.fillRect(3, 3, 250, 58); g.strokeRect(3, 3, 250, 58);
    g.fillStyle = color; g.font = '28px "Press Start 2P", monospace';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 128, 35);
    const tex = new T.CanvasTexture(c);
    tex.minFilter = T.LinearFilter;
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, sizeAttenuation: false }));
    s.scale.set(scale * 2, scale * 0.5, 1);
    s.renderOrder = 10;
    return s;
  }
};
