/* ===== CONFIG: paste your Apps Script Web App URL here ===== */
const API = 'https://script.google.com/macros/s/AKfycbxY5xBN8yfBwDbrlgXZBJ6d1_S9OHvt08hZ5kERP9hZBilrb6QxR6fYSPOyChORTVaPIQ/exec';

const TYPES = ['1 Room Set (Rent)', '2 Room Set (Rent)', 'Flat (Rent)', 'Dukan / Shop (Rent)', 'House / Flat (Sale)', 'Dukan / Plot (Sale)', 'Other'];
const CATS = [
  { ic: '🛏️', t: 'Room sets', d: '1 & 2 room sets for rent', f: '1 Room Set (Rent)' },
  { ic: '🏢', t: 'Flats', d: 'Flats and floors for rent', f: 'Flat (Rent)' },
  { ic: '🏪', t: 'Dukan / Shop', d: 'Shops for rent', f: 'Dukan / Shop (Rent)' },
  { ic: '🏡', t: 'For sale', d: 'Houses, flats, plots', f: 'House / Flat (Sale)' }
];
const AREAS = {
  Noida: ['Sector 15', 'Sector 18', 'Sector 44', 'Sector 62', 'Sector 75', 'Sector 137', 'Greater Noida'],
  Delhi: ['Laxmi Nagar', 'Mayur Vihar', 'Dwarka', 'Rohini', 'Saket', 'Janakpuri', 'Uttam Nagar'],
  Gurugram: ['Sector 14', 'Sector 29', 'Sector 56', 'DLF Phase 1', 'DLF Phase 2', 'Sohna Road', 'Sushant Lok']
};
const CENTER = { Noida: [28.5355, 77.3910], Delhi: [28.6139, 77.2090], Gurugram: [28.4595, 77.0266] };

const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const img = (id, w) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${w || 600}`;
const hav = (a, b, c, d) => { const r = x => x * Math.PI / 180, x = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
const optsOf = (arr, first) => (first ? `<option value="">${first}</option>` : '') + arr.map(t => `<option>${t}</option>`).join('');

const App = {
  items: [], me: null, token: null, here: null, map: null, pin: null, pinLL: null, image: null,
  f: { city: '', type: '', q: '' },

  async init() {
    try { this.token = localStorage.getItem('bb_token'); this.me = JSON.parse(localStorage.getItem('bb_user') || 'null'); } catch (e) {}
    $('yr').textContent = new Date().getFullYear();
    this.nav();
    window.addEventListener('hashchange', () => this.route());
    this.route();
    await this.load();
    this.route(true);
  },

  /* ---- api ---- */
  async post(action, data) {
    const r = await (await fetch(API, { method: 'POST', body: JSON.stringify(Object.assign({ action, token: this.token }, data)) })).json();
    if (!r.ok) { if (/login again/i.test(r.error)) { this.logout(true); } throw new Error(r.error); }
    return r.data;
  },
  async load() {
    try { this.items = await this.post('list', {}); this.loadErr = null; } catch (e) { this.loadErr = e.message; }
  },

  /* ---- router ---- */
  route(keepScroll) {
    const p = (location.hash.replace(/^#\/?/, '') || 'home').split('?')[0];
    const pages = { home: 'Home', listings: 'Listings', about: 'About', contact: 'Contact' };
    const name = pages[p] ? p : 'home';
    $('view').innerHTML = this['page_' + name]();
    document.querySelectorAll('.menu a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/' + (name === 'home' ? '' : name)));
    $('menu').classList.remove('on');
    if (name === 'listings') this.initFilters();
    if (keepScroll !== true) window.scrollTo(0, 0);
    document.title = (name === 'home' ? 'Reference' : pages[name] + ' – Reference') + ' – Rent & Sale Boards Near You';
  },

  /* ---- ui basics ---- */
  toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2800); },
  open(html, wide) { $('sheet').innerHTML = html; $('sheet').parentElement.className = 'sheet' + (wide ? ' wide' : ''); $('modal').classList.add('on'); },
  close() { $('modal').classList.remove('on'); if (this.map) { this.map.remove(); this.map = null; this.pin = null; } },
  nav() {
    const on = !!this.me;
    $('navLogin').style.display = on ? 'none' : ''; $('navLogout').style.display = on ? '' : 'none';
    $('navMine').style.display = on ? '' : 'none'; $('navAdmin').style.display = on && this.me.role === 'admin' ? '' : 'none';
  },
  go(h) { if (location.hash === h) this.route(); else location.hash = h; },
  goCity(c) { this.f = { city: c, type: '', q: '' }; if (location.hash === '#/listings') setTimeout(() => this.route(), 0); },
  goType(t) { this.f = { city: '', type: t, q: '' }; this.go('#/listings'); },
  homeSearch() { this.f = { city: $('hCity').value, type: '', q: $('hQ').value }; this.go('#/listings'); },

  /* ---- cards ---- */
  card(l) {
    const seen = this.me && l.photo;
    return `<div class="card" onclick="App.detail('${l.id}')">
      <div class="img" ${seen ? `style="background-image:url('${img(l.photo, 500)}')"` : ''}>
        ${seen ? '' : '<div class="cover"><span class="lock">🔒</span><small>Login to view board &amp; number</small></div>'}
        <span class="badge">${esc(l.type)}</span>${l.d != null && isFinite(l.d) ? `<span class="badge dist">${l.d.toFixed(1)} km</span>` : ''}
      </div>
      <h4>${esc(l.area || l.city)}${l.area ? ', ' + esc(l.city) : ''}</h4>
      <p>${l.note ? esc(l.note) : 'Tap to view board'}</p>
      <div class="tag">${l.hasPhone ? '📞 Number available' : 'Board photo available'}</div>
    </div>`;
  },

  /* ---- pages ---- */
  page_home() {
    const latest = this.items.slice(0, 4);
    return `
    <section class="hero">
      <h1>Every <span>To-Let board</span> on the road, now online.</h1>
      <p>Room, flat, dukan or plot. Find the board, call the owner, done. No broker needed.</p>
      <div class="hsearch">
        <select id="hCity" style="max-width:150px"><option value="">All cities</option><option>Noida</option><option>Delhi</option><option>Gurugram</option></select>
        <input id="hQ" placeholder="Area, e.g. Sector 44" onkeydown="if(event.key==='Enter')App.homeSearch()">
        <button class="btn" onclick="App.homeSearch()">Search</button>
      </div>
      <div class="cta"><button class="btn green lg" onclick="App.openAdd()">+ Upload a board</button><a class="btn ghost lg" href="#/listings">Browse listings</a></div>
    </section>

    <section class="blk"><div class="wrap">
      <h2>Browse by category</h2><p class="sub">What are you looking for?</p>
      <div class="cats">${CATS.map(c => `<div class="cat" onclick="App.goType('${c.f}')"><div class="ic">${c.ic}</div><h4>${c.t}</h4><p>${c.d}</p></div>`).join('')}</div>
    </div></section>

    <section class="blk alt"><div class="wrap">
      <div class="head"><div><h2>Latest boards</h2><p class="sub" style="margin:0">Freshly uploaded by people like you</p></div><a href="#/listings">View all →</a></div>
      <div class="grid">${this.loadErr ? `<div class="empty">${esc(this.loadErr)}</div>` : latest.length ? latest.map(l => this.card(l)).join('') : '<div class="empty">No boards yet. Be the first to upload one!</div>'}</div>
    </div></section>

    <section class="blk"><div class="wrap">
      <h2>How it works</h2><p class="sub">Three simple steps</p>
      <div class="steps">
        <div class="step"><div class="n">1</div><h4>Spot a board</h4><p>See a Rent or Sale board on the road? Click a clear photo of it.</p></div>
        <div class="step"><div class="n">2</div><h4>Upload on Reference</h4><p>Add the photo, city and (optionally) area, map pin and the number.</p></div>
        <div class="step"><div class="n">3</div><h4>Seeker calls the owner</h4><p>Someone who needs it opens the board, calls and books. They can also send a small thank-you reward.</p></div>
      </div>
    </div></section>

    <section class="blk" style="padding-top:0"><div class="wrap"><div class="banner">
      <h2>Help someone find a home today</h2><p>Every board you upload makes the search easier for someone.</p>
      <button class="btn white lg" onclick="App.openAdd()">Upload a board</button>
    </div></div></section>`;
  },

  page_listings() {
    return `<div class="wrap"><div class="layout">
      <aside class="filters">
        <h3>Filters</h3>
        <label>Search</label><input id="fQ" placeholder="Area or keyword" oninput="App.fChange()">
        <label>City</label><select id="fCity" onchange="App.fChange()">${optsOf(['Noida', 'Delhi', 'Gurugram'], 'All cities')}</select>
        <label>Type</label><select id="fType" onchange="App.fChange()">${optsOf(TYPES, 'All types')}</select>
        <button class="btn full" onclick="App.nearMe()">📍 Near me</button>
        <button class="btn ghost full" onclick="App.clear()">Clear filters</button>
      </aside>
      <section><div class="count" id="count"></div><div id="grid" class="grid"></div></section>
    </div></div>`;
  },
  initFilters() { $('fQ').value = this.f.q; $('fCity').value = this.f.city; $('fType').value = this.f.type; this.renderGrid(); },
  fChange() { this.f = { q: $('fQ').value, city: $('fCity').value, type: $('fType').value }; this.renderGrid(); },
  clear() { this.f = { city: '', type: '', q: '' }; this.here = null; this.initFilters(); },
  nearMe() {
    if (!navigator.geolocation) return this.toast('Location not supported');
    navigator.geolocation.getCurrentPosition(p => { this.here = [p.coords.latitude, p.coords.longitude]; this.renderGrid(); this.toast('Sorted by distance'); }, () => this.toast('Location permission denied'));
  },
  renderGrid() {
    if (!$('grid')) return;
    const { q, city, type } = this.f, ql = q.toLowerCase();
    let list = this.items.filter(l => (!city || l.city === city) && (!type || l.type === type) &&
      (!ql || (l.area + ' ' + l.city + ' ' + l.type + ' ' + l.note).toLowerCase().includes(ql)));
    if (this.here) list = list.map(l => Object.assign({}, l, { d: l.lat ? hav(this.here[0], this.here[1], +l.lat, +l.lng) : Infinity })).sort((a, b) => a.d - b.d);
    $('count').textContent = this.loadErr ? '' : list.length + ' board' + (list.length === 1 ? '' : 's');
    $('grid').innerHTML = this.loadErr ? `<div class="empty">${esc(this.loadErr)}</div>` :
      list.length ? list.map(l => this.card(l)).join('') : '<div class="empty">No boards found. Be the first to upload one!</div>';
  },

  page_about() {
    return `<div class="wrap"><div class="page">
      <h1>About Reference</h1>
      <p>Every day we pass dozens of "Room for Rent", "Flat for Rent", "Dukan Kiraye Par" and "For Sale" boards. Most of them are noticed by only a few people and then forgotten.</p>
      <p><b>Reference</b> puts those boards online. Anyone can click a photo of a board, upload it, and anyone who needs a room, flat or shop can open it and call the owner directly. No broker, no listing fee.</p>
      <div class="cols" style="margin:26px 0">
        <div class="box"><h4>For people who spot boards</h4><p>Upload a clear photo in under a minute. If the deal happens, the seeker may send you a small thank-you reward on UPI. It is always optional.</p></div>
        <div class="box"><h4>For people who need a place</h4><p>Search by city, area and type. Log in to see the board photo and the owner's number, then call and book.</p></div>
      </div>
      <h3>Good to know</h3>
      <ul><li>We currently cover Noida, Delhi and Gurugram.</li>
      <li>Boards are uploaded by users and reviewed before they go live.</li>
      <li>Always visit the property and verify details before paying any money.</li>
      <li>Found a wrong or fake board? Use the "Report" button on the listing.</li></ul>
      <p style="margin-top:24px"><button class="btn green" onclick="App.openAdd()">Upload a board</button></p>
    </div></div>`;
  },

  page_contact() {
    return `<div class="wrap"><div class="page">
      <h1>Contact us</h1>
      <p>Question, feedback, or want a wrong listing removed? Send us a message.</p>
      <div class="form">
        <label>Your name</label><input id="cName" value="${esc(this.me ? this.me.name : '')}">
        <label>Email</label><input id="cEmail" type="email">
        <label>Message</label><textarea id="cMsg"></textarea>
        <div class="err" id="cErr"></div>
        <button class="btn full" id="cBtn" onclick="App.sendContact()">Send message</button>
      </div>
    </div></div>`;
  },
  async sendContact() {
    $('cErr').textContent = ''; $('cBtn').disabled = true;
    try {
      await this.post('contact', { name: $('cName').value, email: $('cEmail').value, message: $('cMsg').value });
      $('cMsg').value = ''; this.toast('Thanks! We will get back to you.');
    } catch (e) { $('cErr').textContent = e.message; }
    $('cBtn').disabled = false;
  },

  /* ---- detail (login required) ---- */
  detail(id) {
    if (!this.me) return this.openAuth('Login or sign up to view the board photo & number', async () => { await this.load(); this.route(true); this.detail(id); });
    const l = this.items.find(x => x.id === id); if (!l) return;
    const call = l.phone ? `<a class="btn green full" href="tel:+91${esc(l.phone)}">📞 Call ${esc(l.phone)}</a>`
      : `<div class="reward">Number not added by the uploader. Check the phone number written on the board photo above.</div>`;
    const maps = l.lat ? `https://www.google.com/maps?q=${l.lat},${l.lng}` : `https://www.google.com/maps/search/${encodeURIComponent((l.area || '') + ' ' + l.city)}`;
    this.open(`
      <img class="photo" src="${img(l.photo, 1000)}" alt="board">
      <h2 style="margin-top:14px">${esc(l.type)}</h2>
      <div><span class="pill">${esc(l.area ? l.area + ', ' : '')}${esc(l.city)}</span><span class="pill">by ${esc(l.by)}</span></div>
      ${l.note ? `<p>${esc(l.note)}</p>` : ''}
      ${call}
      <a class="btn ghost full" target="_blank" rel="noopener" href="${maps}">🗺️ ${l.lat ? 'Open pin in Maps' : 'Search area in Maps'}</a>
      ${l.hasUpi ? `<div class="reward"><b>Booked through this board?</b><br>Please reward the person who found it. Totally optional.<br>
        <button class="btn sm green" onclick="App.reward('${l.id}',50)">Reward ₹50</button><button class="btn sm green" onclick="App.reward('${l.id}',100)">Reward ₹100</button></div>` : ''}
      <p style="text-align:right"><button class="link" style="font-size:12px;color:#b91c1c" onclick="App.report('${l.id}')">Report wrong / fake</button></p>`);
  },
  async reward(id, amt) {
    try {
      const r = await this.post('reward', { id });
      location.href = `upi://pay?pa=${encodeURIComponent(r.upi)}&pn=${encodeURIComponent(r.name)}&am=${amt}&cu=INR&tn=${encodeURIComponent('Board reward')}`;
    } catch (e) { this.toast(e.message); }
  },
  async report(id) {
    try { await this.post('report', { id, reason: 'fake/wrong' }); this.toast('Thanks, reported'); } catch (e) { this.toast(e.message); }
  },

  /* ---- auth ---- */
  openAuth(msg, after) {
    this.afterAuth = after; this.signup = false;
    this.open(`<h2>${esc(msg || 'Login / Sign up')}</h2>
      <div id="nameRow" style="display:none"><label>Name</label><input id="aName"></div>
      <label>Email</label><input id="aEmail" type="email"><label>Password</label><input id="aPw" type="password" onkeydown="if(event.key==='Enter')App.auth()">
      <div class="err" id="aErr"></div>
      <button class="btn full" id="aBtn" onclick="App.auth()">Login</button>
      <p style="text-align:center;font-size:13px"><a href="#" id="aSwitch" onclick="App.switchAuth();return false">New here? Create account</a></p>`);
  },
  switchAuth() {
    this.signup = !this.signup;
    $('nameRow').style.display = this.signup ? '' : 'none';
    $('aBtn').textContent = this.signup ? 'Create account' : 'Login';
    $('aSwitch').textContent = this.signup ? 'Have an account? Login' : 'New here? Create account';
  },
  async auth() {
    $('aErr').textContent = ''; $('aBtn').disabled = true;
    try {
      const r = await this.post(this.signup ? 'register' : 'login', { name: $('aName').value, email: $('aEmail').value, password: $('aPw').value });
      this.token = r.token; this.me = r.user;
      localStorage.setItem('bb_token', r.token); localStorage.setItem('bb_user', JSON.stringify(r.user));
      this.nav(); this.close(); this.toast('Welcome ' + r.user.name);
      await this.load(); this.route(true);
      if (this.afterAuth) { const f = this.afterAuth; this.afterAuth = null; f(); }
    } catch (e) { $('aErr').textContent = e.message; }
    if ($('aBtn')) $('aBtn').disabled = false;
  },
  async logout(silent) {
    this.token = null; this.me = null; localStorage.removeItem('bb_token'); localStorage.removeItem('bb_user'); this.nav();
    if (!silent) this.toast('Logged out');
    await this.load(); this.route(true);
  },

  /* ---- upload ---- */
  openAdd() {
    if (!this.me) return this.openAuth('Login to upload a board', () => this.openAdd());
    this.image = null; this.pinLL = null;
    this.open(`<h2>Upload a board</h2>
      <div class="tips"><b>For a clear photo:</b><ul>
        <li>Stand straight in front of the board, whole board in frame</li>
        <li>Phone number and text must be readable (zoom in if needed)</li>
        <li>Hold steady, use good light, avoid blur and glare</li></ul></div>
      <div class="row">
        <button class="btn" onclick="$('fCam').click()">📷 Take photo</button>
        <button class="btn ghost" onclick="$('fGal').click()">🖼️ Choose from gallery</button>
      </div>
      <input type="file" id="fCam" accept="image/*" capture="environment" hidden onchange="App.pick(this)">
      <input type="file" id="fGal" accept="image/*" hidden onchange="App.pick(this)">
      <img id="prev" class="photo" style="display:none;margin-top:10px">
      <label>Type</label><select id="aType">${optsOf(TYPES)}</select>
      <div class="row"><div><label>City</label><select id="aCity" onchange="App.cityChanged()">${optsOf(['Noida', 'Delhi', 'Gurugram'])}</select></div>
      <div><label>Area (optional)</label><input id="aArea" list="areas" placeholder="Type area, e.g. Sector 44"><datalist id="areas"></datalist></div></div>
      <label>Map pin (optional)</label>
      <div class="row"><button class="btn ghost sm" onclick="App.useLoc()">📍 Use my location</button><button class="btn ghost sm" onclick="App.toggleMap()">🗺️ Pin on map</button></div>
      <div id="map" style="display:none"></div><div id="pinNote" style="font-size:12px;color:var(--mut);margin-top:4px"></div>
      <label>Phone number (optional, you can add later)</label><input id="aPhone" inputmode="numeric" maxlength="10" placeholder="10 digit number">
      <label>Note (optional)</label><input id="aNote" maxlength="200" placeholder="e.g. 2nd floor, near metro">
      <label>Your UPI ID for reward (optional)</label><input id="aUpi" placeholder="name@upi">
      <div class="err" id="aErr"></div>
      <button class="btn full" id="aSave" onclick="App.save()">Submit</button>
      <p style="font-size:12px;color:var(--mut)">New listings are reviewed first. After 3 approved boards, yours go live instantly.</p>`);
    this.cityChanged();
  },
  cityChanged() {
    const c = $('aCity').value; $('areas').innerHTML = AREAS[c].map(a => `<option value="${a}">`).join('');
    if (this.map) this.map.setView(CENTER[c], 12);
  },
  toggleMap() {
    const m = $('map');
    if (m.style.display === 'none') {
      m.style.display = 'block';
      if (!this.map) {
        this.map = L.map('map').setView(CENTER[$('aCity').value], 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(this.map);
        this.map.on('click', e => this.setPin(e.latlng.lat, e.latlng.lng));
      }
      setTimeout(() => this.map.invalidateSize(), 50);
    } else m.style.display = 'none';
  },
  setPin(lat, lng) {
    this.pinLL = [lat, lng]; $('pinNote').textContent = '✅ Location pinned';
    if (this.map) { if (this.pin) this.pin.setLatLng([lat, lng]); else this.pin = L.marker([lat, lng]).addTo(this.map); }
  },
  useLoc() {
    if (!navigator.geolocation) return this.toast('Location not supported');
    navigator.geolocation.getCurrentPosition(p => { this.setPin(p.coords.latitude, p.coords.longitude); if (this.map) this.map.setView([p.coords.latitude, p.coords.longitude], 17); },
      () => this.toast('Permission denied. You can skip this, it is optional.'));
  },
  pick(inp) {
    const f = inp.files[0]; if (!f) return;
    const im = new Image(), url = URL.createObjectURL(f);
    im.onload = () => {
      const s = Math.min(1, 1280 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      this.image = c.toDataURL('image/jpeg', 0.72); $('prev').src = this.image; $('prev').style.display = 'block'; URL.revokeObjectURL(url);
    };
    im.onerror = () => this.toast('Could not read this photo, try another');
    im.src = url;
  },
  async save() {
    $('aErr').textContent = '';
    if (!this.image) return $('aErr').textContent = 'Please add the board photo';
    $('aSave').disabled = true; $('aSave').textContent = 'Uploading…';
    try {
      const r = await this.post('create', {
        type: $('aType').value, city: $('aCity').value, area: $('aArea').value,
        lat: this.pinLL ? this.pinLL[0] : '', lng: this.pinLL ? this.pinLL[1] : '',
        phone: $('aPhone').value, note: $('aNote').value, upi: $('aUpi').value, image: this.image
      });
      this.pinLL = null; this.close();
      this.toast(r.status === 'approved' ? 'Board is live!' : 'Submitted. It will go live after review.');
      await this.load(); this.route(true);
    } catch (e) { $('aErr').textContent = e.message; $('aSave').disabled = false; $('aSave').textContent = 'Submit'; }
  },

  /* ---- my boards ---- */
  async openMine() {
    this.open('<h2>My boards</h2><div id="mineBox">Loading…</div>', true);
    try {
      const l = await this.post('mine', {});
      $('mineBox').innerHTML = l.length ? l.map(x => `
        <div class="item"><img src="${img(x.photo, 150)}">
          <div class="grow"><b>${esc(x.type)}</b> <span class="pill ${x.status}">${x.status}</span><br>${esc(x.area ? x.area + ', ' : '')}${esc(x.city)}<br>
            <input id="ph_${x.id}" value="${esc(x.phone)}" placeholder="Add phone number" style="margin-top:6px;max-width:200px">
            <button class="btn sm" onclick="App.setPhone('${x.id}')">Save</button></div>
          ${x.status === 'approved' ? `<button class="btn sm ghost" onclick="App.setStatus('${x.id}','closed')">Mark booked</button>` : ''}
          ${x.status === 'closed' ? `<button class="btn sm ghost" onclick="App.setStatus('${x.id}','reopen')">Reopen</button>` : ''}
        </div>`).join('') : 'You have not uploaded any board yet.';
    } catch (e) { $('mineBox').textContent = e.message; }
  },
  async setPhone(id) { try { await this.post('update', { id, phone: $('ph_' + id).value }); this.toast('Saved'); await this.load(); this.route(true); } catch (e) { this.toast(e.message); } },
  async setStatus(id, status) { try { await this.post('update', { id, status }); await this.load(); this.route(true); this.openMine(); } catch (e) { this.toast(e.message); } },

  /* ---- admin ---- */
  async openAdmin() {
    this.open('<h2>Review queue</h2><div id="admBox">Loading…</div>', true);
    try {
      const l = await this.post('adminList', {});
      $('admBox').innerHTML = l.length ? l.map(x => `
        <div class="item"><img src="${img(x.photo, 200)}" style="width:90px;height:90px">
          <div class="grow"><b>${esc(x.type)}</b> <span class="pill ${x.status}">${x.status}</span> ${+x.reports ? `<span class="pill rejected">${x.reports} reports</span>` : ''}<br>
            ${esc(x.area ? x.area + ', ' : '')}${esc(x.city)} · by ${esc(x.by)}<br>${x.phone ? esc(x.phone) : 'no phone'}</div>
          <button class="btn sm green" onclick="App.decide('${x.id}','approve')">Approve</button>
          <button class="btn sm" onclick="App.decide('${x.id}','reject')">Reject</button>
        </div>`).join('') : 'Nothing to review 🎉';
    } catch (e) { $('admBox').textContent = e.message; }
  },
  async decide(id, decision) { try { await this.post('adminDecide', { id, decision }); await this.load(); this.route(true); this.openAdmin(); } catch (e) { this.toast(e.message); } }
};

App.init();
