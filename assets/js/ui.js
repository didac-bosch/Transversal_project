/* ==========================================================================
   DRONE QUEST - HTML interface: router, HUD, detail windows, menu,
   classic (plain) view and boot.
   ========================================================================== */
'use strict';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pending = (what) => `<p class="pending"><b>???</b> Coming soon: ${esc(what)}.</p>`;
const fill = (html, what) => (html && String(html).trim() ? html : pending(what));

/* ---------------------------------------------------------------- pages */
function mediaHTML(list) {
  if (!list || !list.length) return pending('our photos and videos');
  return '<div class="gallery">' + list.map((m) => {
    const cap = m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : '';
    if (m.type === 'youtube') return `<figure class="wide"><div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/${esc(m.id)}" title="${esc(m.caption || 'Video')}" loading="lazy" allowfullscreen></iframe></div>${cap}</figure>`;
    if (m.type === 'video') return `<figure class="wide"><video controls preload="metadata" src="${esc(m.src)}"></video>${cap}</figure>`;
    return `<figure${m.wide ? ' class="wide"' : ''}><a href="${esc(m.src)}" target="_blank" rel="noopener"><img src="${esc(m.src)}" alt="${esc(m.caption || '')}" loading="lazy"></a>${cap}</figure>`;
  }).join('') + '</div>';
}
function linksHTML(list) {
  if (!list || !list.length) return pending('external material');
  return '<ul class="links">' + list.map((l) => (l.url
    ? `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.t)}</a></li>`
    : `<li>${esc(l.t)}</li>`)).join('') + '</ul>';
}
function tagsHTML(tags) { return (tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join(' '); }

function activityBody(a) {
  return `
    <section><h3>Objective</h3>${fill(a.objective, 'the objective of this activity')}</section>
    <section><h3>What we did</h3>${fill(a.work, 'a step-by-step description of our work')}</section>
    <section><h3>Photos &amp; video</h3>${mediaHTML(a.media)}</section>
    <section><h3>Difficulties &amp; how we solved them</h3>${fill(a.difficulties, 'the problems we found and how we solved them')}</section>
    <section><h3>What we learned</h3>${fill(a.learned, 'our reflection on this activity')}</section>
    <section><h3>External material</h3>${linksHTML(a.links)}</section>`;
}

const PAGES = {
  log: {
    title: 'QUEST LOG', sub: 'Dated updates, newest first',
    body: () => (SITE.updates.length ? SITE.updates.map((u) => `
      <article class="post">
        <p class="meta"><time datetime="${esc(u.date)}">${esc(u.date)}</time> <span class="tag">${esc(u.category)}</span></p>
        <h4>${esc(u.title)}</h4><p>${u.text}</p>
        ${u.link ? `<p><a href="${esc(u.link)}">Read more</a></p>` : ''}
      </article>`).join('') : pending('our first update'))
  },
  team: {
    title: 'OUR TEAM', sub: SITE.team.name,
    body: () => `
      ${fill(SITE.team.intro, 'a short introduction of the team')}
      <div class="party">${SITE.team.members.map((m, i) => `
        <div class="member">
          <img class="avatar" src="${heroAvatar(m.id, 4)}" alt="Pixel character of ${esc(m.name)}" width="64" height="96">
          <div class="m-info">
            <span class="slot">P${i + 1}</span><b>${esc(m.fullName || m.name)}</b>
            ${m.role ? `<span>${esc(m.role)}</span>` : ''}
            ${m.bio ? `<span class="bio">${m.bio}</span>` : ''}
            <button class="btn play" type="button" data-hero="${m.id}">${Hero.current() === m.id ? 'PLAYING' : 'PLAY AS'}</button>
          </div>
        </div>`).join('')}</div>`,
    after: (el) => el.querySelectorAll('[data-hero]').forEach((b) => b.addEventListener('click', () => {
      Hero.set(b.dataset.hero); Snd.ok(); UI.paintPilot();
      el.querySelectorAll('[data-hero]').forEach((x) => { x.textContent = x.dataset.hero === Hero.current() ? 'PLAYING' : 'PLAY AS'; });
    }))
  },
  kit: {
    title: 'INVENTORY', sub: 'Kit components: function, where to buy and price',
    body: () => `
      <div class="table-wrap"><table>
        <thead><tr><th>Component</th><th>Function</th><th>Where to buy</th><th>Price</th></tr></thead>
        <tbody>${SITE.kit.map((k) => `
          <tr><td><b>${esc(k.item)}</b>${k.contents ? `<br><small>${esc(k.contents)}</small>` : ''}</td>
          <td>${esc(k.fn)}</td><td>${k.where ? k.where : '<span class="q">???</span>'}</td><td>${k.price ? esc(k.price) : '<span class="q">???</span>'}</td></tr>`).join('')}
        </tbody></table></div>`
  },
  troubles: {
    title: 'TROUBLESHOOTING', sub: 'Difficulties we found and how we solved them',
    body: () => (SITE.difficulties.length ? SITE.difficulties.map((d) => `
      <article class="post"><p class="meta"><span class="tag">${typeof d.activity === 'number' ? `Activity ${d.activity}` : esc(d.activity)}</span></p>
        <h4>${esc(d.problem)}</h4>
        ${d.cause ? `<p><b>Cause:</b> ${esc(d.cause)}</p>` : ''}<p><b>Solution:</b> ${esc(d.solution)}</p></article>`).join('')
      : pending('the list of problems and solutions'))
  },
  next: {
    title: 'NEXT QUESTS', sub: 'Towards phase 2: ideas from Unmanned Aircraft and Payload',
    body: () => `
      <section><h3>Unmanned Aircraft</h3>${fill(SITE.phase2.unmannedAircraft, 'contents from Unmanned Aircraft that we can apply in phase 2')}</section>
      <section><h3>Payload</h3>${fill(SITE.phase2.payload, 'contents from Payload that we can apply in phase 2')}</section>`
  },
  journal: {
    title: 'JOURNAL', sub: 'Team reflection',
    body: () => `
      <section><h3>What we are learning</h3>${fill(SITE.reflection.learning, 'our reflection on the learning')}</section>
      <section><h3>Teamwork</h3>${fill(SITE.reflection.teamwork, 'how the team is working')}</section>
      <section><h3>What we will improve</h3>${fill(SITE.reflection.improvements, 'our improvement goals')}</section>`
  },
  library: {
    title: 'LIBRARY', sub: 'References, external material and glossary',
    body: () => `
      <section><h3>References</h3>${linksHTML(SITE.references)}</section>
      ${SITE.glossary && SITE.glossary.length ? `<section><h3>Glossary</h3><div class="table-wrap"><table>
        <thead><tr><th>Term</th><th>Meaning</th></tr></thead>
        <tbody>${SITE.glossary.map((g) => `<tr><td><b>${esc(g.term)}</b></td><td>${esc(g.def)}</td></tr>`).join('')}</tbody>
      </table></div></section>` : ''}`
  },
  activities: {
    title: 'ACTIVITIES', sub: 'All the tasks of Version 1 (Phase 1)',
    body: () => '<ol class="act-list">' + SITE.activities.map((a) => `
      <li><a href="#/world/1/activity/${a.n}"><span class="num">${a.n}</span> ${esc(a.title)}</a>${a.done ? ' <span class="tag done">DONE</span>' : ''}</li>`).join('') + '</ol>'
  }
};

const MENU = [
  ['activities', 'ACTIVITIES'], ['log', 'QUEST LOG'], ['team', 'OUR TEAM'], ['kit', 'INVENTORY'],
  ['troubles', 'TROUBLESHOOTING'], ['next', 'NEXT QUESTS'], ['journal', 'JOURNAL'], ['library', 'LIBRARY'],
  ['@select', 'CHANGE PILOT'], ['@classic', 'CLASSIC VIEW'], ['@worlds', 'WORLD MAP'], ['@close', 'CLOSE']
];

/* ---------------------------------------------------------------- UI */
const UI = {
  open: null,           // 'panel' | 'menu' | 'classic' | null
  tab: null,            // 'lab' | 'report' inside an activity window
  prefTab: 'lab',

  init() {
    $('#btnMap').addEventListener('click', () => { location.hash = '#/worlds'; });
    $('#btnMenu').addEventListener('click', () => (this.open === 'menu' ? this.closeMenu() : this.openMenu()));
    $('#btnSound').addEventListener('click', () => this.toggleSound());
    $('#overlay').addEventListener('click', (e) => { if (e.target.id === 'overlay') this.closePanel(); });
    $('#menuWrap').addEventListener('click', (e) => { if (e.target.id === 'menuWrap') this.closeMenu(); });
    try { if (localStorage.getItem('dq-sound') === '1') Snd.on = true; } catch (e) { /* storage blocked */ }
    this.paintSound();
    const last = SITE.updates[0];
    $('#lastUpdate').textContent = last ? `LAST UPDATE: ${last.date}` : '';
    this.buildSrNav();

    window.addEventListener('keydown', (e) => this.onKey(e));
    window.addEventListener('keyup', (e) => {
      if (this.open === 'panel' && this.tab === 'lab') Lab.key(e.key, false);
      const k = KEYMAP[e.key];
      if (k) Game.release(k);
    });
    window.addEventListener('blur', () => { Game.held = {}; if (Lab.w && Lab.w.keys) Lab.w.keys = {}; });
    window.addEventListener('hashchange', () => this.route());
    Game.blocked = () => this.open !== null;
  },

  onKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (this.open === 'classic') { if (e.key === 'Escape') this.leaveOverlay(); return; }
    if (this.open === 'panel') {
      if (e.key === 'Escape') { e.preventDefault(); this.closePanel(); return; }
      if (this.tab === 'lab' && Lab.w) {           // the hands-on lab gets the keys
        if (!['BUTTON', 'A'].includes(e.target.tagName) || !['Enter', ' '].includes(e.key)) { if (Lab.key(e.key, true)) e.preventDefault(); }
        return;
      }
      if (this.panelNav && e.key === 'ArrowLeft') this.panelNav(-1);
      else if (this.panelNav && e.key === 'ArrowRight') this.panelNav(1);
      return;
    }
    if (this.open === 'menu') {
      const items = [...document.querySelectorAll('#menu button')];
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); items[(i + 1) % items.length].focus(); Snd.move(); }
      else if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); Snd.move(); }
      else if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') { e.preventDefault(); this.closeMenu(); }
      return;
    }
    if (e.target && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(e.target.tagName) && (e.key === 'Enter' || e.key === ' ')) return;
    const k = KEYMAP[e.key];
    if (!k) return;
    e.preventDefault();
    if (k === 'menu') { if (Game.scene === World1 || Game.scene === WorldMap) this.openMenu(); return; }
    if (e.repeat && !OPP[k]) return;
    Game.key(k);
  },

  /* ---------- router ---------- */
  route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    this.hideAll();
    let crumbs = [['TITLE', '#/']];
    let hint = 'PRESS ENTER OR CLICK TO START';
    if (parts[0] === 'classic') {
      if (!Game.scene) Game.set(Title);
      this.openClassic();
      crumbs.push(['CLASSIC VIEW', '#/classic']);
      hint = 'ESC: BACK TO THE GAME';
    } else if (parts[0] === 'select') {
      Game.go(Select);
      crumbs.push(['CHOOSE PILOT', '#/select']);
      hint = 'ARROWS: CHOOSE   ENTER: CONFIRM   CLICK A PILOT';
    } else if (parts[0] === 'worlds') {
      Game.go(WorldMap);
      crumbs.push(['WORLD MAP', '#/worlds']);
      hint = 'ARROWS: MOVE   ENTER: PLAY   CLICK A WORLD   M: MENU';
    } else if (parts[0] === 'world') {
      const w = SITE.worlds.find((x) => String(x.id) === parts[1]);
      if (!w || !w.unlocked) { location.replace('#/worlds'); return; }
      WorldMap.cur = SITE.worlds.indexOf(w);
      Game.go(World1);
      crumbs.push(['WORLD MAP', '#/worlds'], [`WORLD ${w.id}`, `#/world/${w.id}`]);
      hint = 'ARROWS: WALK   ENTER: OPEN   CLICK A BUILDING   M: MENU';
      if (parts[2] === 'activity') {
        const a = SITE.activities.find((x) => String(x.n) === parts[3]);
        if (a) { this.openActivity(a); crumbs.push([`ACTIVITY ${a.n}`, location.hash]); }
      } else if (PAGES[parts[2]]) {
        this.openPage(parts[2]);
        crumbs.push([PAGES[parts[2]].title, location.hash]);
      }
    } else {
      Game.go(Title);
    }
    $('#crumbs').innerHTML = crumbs.map(([t, h], i) => (i === crumbs.length - 1
      ? `<span aria-current="page">${esc(t)}</span>` : `<a href="${h}">${esc(t)}</a>`)).join('<i>&gt;</i>');
    $('#hintText').textContent = hint;
    this.paintPilot();
  },
  hideAll() {
    Lab.unmount();
    $('#overlay').hidden = true; $('#menuWrap').hidden = true; $('#classic').hidden = true;
    this.open = null; this.panelNav = null; this.tab = null;
  },
  leaveOverlay() { location.hash = '#/world/1'; },

  /* ---------- detail window ---------- */
  showPanel({ badge, title, meta, body, prev, next, lab, after }) {
    const p = $('#panel');
    const tabs = lab ? `
      <div class="tabs" role="tablist">
        <button class="tab" role="tab" type="button" data-tab="lab" aria-selected="true">${esc(lab.tab)}</button>
        <button class="tab" role="tab" type="button" data-tab="report" aria-selected="false">REPORT</button>
      </div>` : '';
    p.innerHTML = `
      <div class="p-head">
        <div class="p-title"><span class="badge">${badge}</span><h2 id="pTitle">${esc(title)}</h2>${meta ? `<p class="meta">${meta}</p>` : ''}</div>
        <button class="btn x" data-act="close" aria-label="Close">X</button>
      </div>
      ${tabs}
      <div class="p-body">${lab ? `<div class="lab" data-pane="lab"></div><div class="report" data-pane="report" hidden>${body}</div>` : body}</div>
      <div class="p-foot">
        ${prev ? `<a class="btn" href="${prev[0]}">&lt; ${esc(prev[1])}</a>` : '<span></span>'}
        <a class="btn ghost" href="#/world/1">BACK TO MAP</a>
        ${next ? `<a class="btn" href="${next[0]}">${esc(next[1])} &gt;</a>` : '<span></span>'}
      </div>`;
    p.querySelector('[data-act="close"]').addEventListener('click', () => this.closePanel());
    $('#overlay').hidden = false;
    this.open = 'panel';
    this.panelNav = (d) => { const t = d < 0 ? prev : next; if (t) location.hash = t[0]; };
    p.querySelector('.p-body').scrollTop = 0;
    p.focus();
    if (lab) {
      this.labDef = lab;
      p.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => { Snd.move(); this.setTab(b.dataset.tab); }));
      this.setTab(this.prefTab);
    } else this.tab = null;
    after && after(p);
  },
  setTab(id) {
    const p = $('#panel');
    this.tab = id; this.prefTab = id;
    p.querySelectorAll('.tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === id)));
    p.querySelectorAll('[data-pane]').forEach((el) => { el.hidden = el.dataset.pane !== id; });
    if (id === 'lab') Lab.mount(p.querySelector('[data-pane="lab"]'), this.labDef);
    else Lab.unmount();
    p.querySelector('.p-body').scrollTop = 0;
  },
  openActivity(a) {
    const n = SITE.activities.length;
    const pa = SITE.activities[a.n - 2], na = SITE.activities[a.n];
    this.showPanel({
      badge: `ACTIVITY ${a.n}/${n}`,
      title: a.title,
      meta: `${a.date ? `<time datetime="${esc(a.date)}">${esc(a.date)}</time>` : '<span class="q">DATE ???</span>'} ${tagsHTML(a.tags)} ${a.done ? '<span class="tag done">DONE</span>' : ''}`,
      body: activityBody(a),
      lab: LABS[a.n],
      prev: pa ? [`#/world/1/activity/${pa.n}`, 'PREV'] : null,
      next: na ? [`#/world/1/activity/${na.n}`, 'NEXT'] : null
    });
  },
  openPage(id) {
    const pg = PAGES[id];
    this.showPanel({ badge: 'MENU', title: pg.title, meta: esc(pg.sub), body: pg.body(), after: pg.after });
  },
  closePanel() { Snd.move(); location.hash = '#/world/1'; },

  /* ---------- menu ---------- */
  openMenu() {
    const m = $('#menu');
    m.innerHTML = '<p class="menu-title">MENU</p>' + MENU.map(([id, label]) => `<button data-id="${id}">${label}</button>`).join('');
    m.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => this.menuPick(b.dataset.id)));
    $('#menuWrap').hidden = false;
    this.open = 'menu';
    Snd.move();
    m.querySelector('button').focus();
  },
  closeMenu() { $('#menuWrap').hidden = true; this.open = null; $('#screen').focus(); },
  menuPick(id) {
    Snd.ok();
    this.closeMenu();
    if (id === '@close') return;
    if (id === '@classic') { location.hash = '#/classic'; return; }
    if (id === '@worlds') { location.hash = '#/worlds'; return; }
    if (id === '@select') { location.hash = '#/select'; return; }
    location.hash = `#/world/1/${id}`;
  },

  /* ---------- classic view: every section as a plain document ---------- */
  openClassic() {
    const toc = SITE.activities.map((a) => `<li><a href="#c-a${a.n}">Activity ${a.n}: ${esc(a.title)}</a></li>`).join('')
      + Object.entries(PAGES).filter(([k]) => k !== 'activities').map(([k, p]) => `<li><a href="#c-${k}">${esc(p.title)}</a></li>`).join('');
    $('#classicDoc').innerHTML = `
      <div class="c-top"><h1>${esc(SITE.title)} <small>${esc(SITE.subtitle)} - Version 1</small></h1>
        <button class="btn" id="btnBack">BACK TO THE GAME</button></div>
      <nav class="toc"><h2>Contents</h2><ul>${toc}</ul></nav>
      ${SITE.activities.map((a) => `
        <article id="c-a${a.n}" class="c-sec">
          <h2>Activity ${a.n}: ${esc(a.title)}</h2>
          <p class="meta">${a.date ? esc(a.date) : '<span class="q">DATE ???</span>'} ${tagsHTML(a.tags)}</p>
          ${LABS[a.n] ? `<p class="c-lab">Hands-on version (${esc(LABS[a.n].tab.toLowerCase())}): <a href="#/world/1/activity/${a.n}">open building ${a.n} in the game</a>.</p>` : ''}
          ${activityBody(a)}
        </article>`).join('')}
      ${Object.entries(PAGES).filter(([k]) => k !== 'activities').map(([k, p]) => `
        <article id="c-${k}" class="c-sec"><h2>${esc(p.title)}</h2><p class="meta">${esc(p.sub)}</p>${p.body()}</article>`).join('')}`;
    $('#btnBack').addEventListener('click', () => this.leaveOverlay());
    $('#classicDoc').querySelectorAll('.toc a').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      const el = document.getElementById(a.getAttribute('href').slice(1));
      el && el.scrollIntoView({ behavior: 'smooth' });
    }));
    $('#classic').hidden = false;
    $('#classic').scrollTop = 0;
    this.open = 'classic';
  },

  /* ---------- misc ---------- */
  toggleSound() {
    Snd.on = !Snd.on;
    try { localStorage.setItem('dq-sound', Snd.on ? '1' : '0'); } catch (e) { /* storage blocked */ }
    this.paintSound();
    Snd.ok();
  },
  paintSound() {
    const b = $('#btnSound');
    b.textContent = Snd.on ? 'SOUND ON' : 'SOUND OFF';
    b.setAttribute('aria-pressed', String(Snd.on));
  },
  paintPilot() {
    const id = Hero.current();
    if (this._pilot === id) return;
    this._pilot = id;
    const m = Hero.member();
    $('#pilotImg').src = heroAvatar(id, 2);
    $('#pilotName').textContent = m ? pxName(m.name) : '';
  },
  buildSrNav() {
    $('#srNav').innerHTML = '<h2>Site sections</h2><ul>'
      + SITE.activities.map((a) => `<li><a href="#/world/1/activity/${a.n}">Activity ${a.n}: ${esc(a.title)}</a></li>`).join('')
      + Object.entries(PAGES).map(([k, p]) => `<li><a href="#/world/1/${k}">${esc(p.title)}</a></li>`).join('')
      + '<li><a href="#/classic">Classic view (all content on one page)</a></li></ul>';
  }
};

/* ---------------------------------------------------------------- boot */
(function boot() {
  const cv = $('#screen');
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#16182a'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff'; ctx.font = '16px monospace'; ctx.textAlign = 'center';
  ctx.fillText('LOADING...', W / 2, H / 2);
  const fontsReady = document.fonts
    ? Promise.race([
      Promise.all([document.fonts.load('8px "Press Start 2P"'), document.fonts.load('20px "VT323"')]),
      new Promise((r) => setTimeout(r, 3000))
    ]).catch(() => {})
    : Promise.resolve();
  fontsReady.then(() => {
    Hero.load();
    UI.init();
    Game.init(cv);
    UI.route();
  });
})();
