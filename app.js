/* ===== CONFIG: paste your Apps Script Web App URL here ===== */
const API = 'https://script.google.com/macros/s/AKfycbxY5xBN8yfBwDbrlgXZBJ6d1_S9OHvt08hZ5kERP9hZBilrb6QxR6fYSPOyChORTVaPIQ/exec';

const TYPES = ['1 Room Set (Rent)', '2 Room Set (Rent)', 'Flat (Rent)', 'Dukan / Shop (Rent)', 'House / Flat (Sale)', 'Dukan / Plot (Sale)', 'Other'];
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

const App = {
  items: [], me: null, token: null, here: null, map: null, pin: null, image: null,

  async init() {
    try { this.token = localStorage.getItem('bb_token'); this.me = JSON.parse(localStorage.getItem('bb_user') || 'null'); } catch (e) {}
    $('fType').innerHTML = '<option value="">All types</option>' + TYPES.map(t => `<option>${t}</option>`).join('');
    this.nav();
    $('grid').innerHTML = '<div class="empty">Loading boards…</div>';
    try { this.items = await this.get('list'); } catch (e) { $('grid').innerHTML = `<div class="empty">${esc(e.message)}</div>`; return; }
    this.render();
  },

  /* ---- api ---- */
  async get(action) {
    const r = await (await fetch(`${API}?action=${action}`)).json();
    if (!r.ok) throw new Error(r.error); return r.data;
  },
  async post(action, data) {
    const r = await (await fetch(API, { method: 'POST', body: JSON.stringify(Object.assign({ action, token: this.token }, data)) })).json();
    if (!r.ok) { if (/login again/i.test(r.error)) this.logout(true); throw new Error(r.error); }
    return r.data;
  },

  /* ---- ui basics ---- */
  toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2600); },
  open(html, wide) { $('sheet').innerHTML = html; $('sheet').parentElement.className = 'sheet' + (wide ? ' wide' : ''); $('modal').classList.add('on'); },
  close() { $('modal').classList.remove('on'); if (this.map) { this.map.remove(); this.map = null; this.pin = null; } },
  home() { this.clear(); window.scrollTo(0, 0); },
  nav() {
    const on = !!this.me;
    $('navLogin').style.display = on ? 'none' : ''; $('navLogout').style.display = on ? '' : 'none';
    $('navMine').style.display = on ? '' : 'none'; $('navAdmin').style.display = on && this.me.role === 'admin' ? '' : 'none';
  },
  clear() { $('q').value = ''; $('fCity').value = ''; $('fType').value = ''; this.here = null; this.render(); },
  nearMe() {
    if (!navigator.geolocation) return this.toast('Location not supported');
    navigator.geolocation.getCurrentPosition(p => { this.here = [p.coords.latitude, p.coords.longitude]; this.render(); this.toast('Sorted by distance'); }, () => this.toast('Location permission denied'));
  },

  /* ---- listing grid ---- */
  render() {
    const q = $('q').value.toLowerCase(), c = $('fCity').value, t = $('fType').value;
    let list = this.items.filter(l => (!c || l.city === c) && (!t || l.type === t) && (!q || (l.area + ' ' + l.city + ' ' + l.type + ' ' + l.note).toLowerCase().includes(q)));
    if (this.here) { list = list.map(l => Object.assign({}, l, { d: hav(this.here[0], this.here[1], +l.lat, +l.lng) })).sort((a, b) => a.d - b.d); }
    $('count').textContent = list.length + ' board' + (list.length === 1 ? '' : 's');
    $('grid').innerHTML = list.length ? list.map(l => `
      <div class="card" onclick="App.detail('${l.id}')">
        <div class="img" style="background-image:url('${img(l.photo, 500)}')">
          <span class="badge">${esc(l.type)}</span>${l.d != null ? `<span class="badge dist">${l.d.toFixed(1)} km</span>` : ''}
        </div>
        <h4>${esc(l.area)}, ${esc(l.city)}</h4>
        <p>${l.note ? esc(l.note) : 'Tap to view board'}</p>
        <div class="tag">${l.phone ? '📞 Number available' : 'See board photo'}</div>
      </div>`).join('') : '<div class="empty">No boards found. Be the first to upload one!</div>';
  },

  detail(id) {
    const l = this.items.find(x => x.id === id); if (!l) return;
    const call = l.phone ? `<a class="btn green full" style="display:block;text-align:center;text-decoration:none" href="tel:+91${esc(l.phone)}">📞 Call ${esc(l.phone)}</a>`
      : `<div class="reward">Number not added yet – check the phone number on the board photo above.</div>`;
    this.open(`
      <img class="photo" src="${img(l.photo, 1000)}" alt="board">
      <h2 style="margin-top:14px">${esc(l.type)}</h2>
      <div><span class="pill">${esc(l.area)}, ${esc(l.city)}</span><span class="pill">by ${esc(l.by)}</span></div>
      ${l.note ? `<p>${esc(l.note)}</p>` : ''}
      ${call}
      <a class="btn ghost full" style="display:block;text-align:center;text-decoration:none" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${l.lat},${l.lng}">🗺️ Open in Maps</a>
      ${l.hasUpi ? `<div class="reward"><b>Booked through this board?</b><br>Please reward the person who found it – totally optional.<br>
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
    if (!this.me) return this.openAuth('Login to report');
    try { await this.post('report', { id, reason: 'fake/wrong' }); this.toast('Thanks, reported'); } catch (e) { this.toast(e.message); }
  },

  /* ---- auth ---- */
  openAuth(msg, after) {
    this.afterAuth = after;
    this.open(`<h2>${esc(msg || 'Login / Sign up')}</h2>
      <div id="nameRow" style="display:none"><label>Name</label><input id="aName"></div>
      <label>Email</label><input id="aEmail" type="email"><label>Password</label><input id="aPw" type="password">
      <div class="err" id="aErr"></div>
      <button class="btn full" id="aBtn" onclick="App.auth()">Login</button>
      <p style="text-align:center;font-size:13px"><a href="#" id="aSwitch" onclick="App.switchAuth();return false">New here? Create account</a></p>`);
    this.signup = false;
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
      if (this.afterAuth) { const f = this.afterAuth; this.afterAuth = null; f(); }
    } catch (e) { $('aErr').textContent = e.message; }
    $('aBtn').disabled = false;
  },
  logout(silent) {
    this.token = null; this.me = null; localStorage.removeItem('bb_token'); localStorage.removeItem('bb_user'); this.nav();
    if (!silent) this.toast('Logged out');
  },

  /* ---- upload ---- */
  openAdd() {
    if (!this.me) return this.openAuth('Login to upload a board', () => this.openAdd());
    this.image = null;
    this.open(`<h2>Upload a board</h2>
      <label>Board photo (take with camera)</label>
      <input type="file" id="fPhoto" accept="image/*" capture="environment" onchange="App.pick(this)">
      <img id="prev" class="photo" style="display:none;margin-top:8px">
      <label>Type</label><select id="aType">${TYPES.map(t => `<option>${t}</option>`).join('')}</select>
      <div class="row"><div><label>City</label><select id="aCity" onchange="App.cityChanged()"><option>Noida</option><option>Delhi</option><option>Gurugram</option></select></div>
      <div><label>Area</label><input id="aArea" list="areas" placeholder="Sector 44 / Laxmi Nagar"><datalist id="areas"></datalist></div></div>
      <label>Location</label>
      <button class="btn ghost sm" onclick="App.useLoc()">📍 Use my location</button> <span style="font-size:12px;color:var(--mut)">or tap on map to pin</span>
      <div id="map"></div>
      <label>Phone number (optional – you can add later)</label><input id="aPhone" inputmode="numeric" maxlength="10" placeholder="10 digit number">
      <label>Note (optional)</label><input id="aNote" maxlength="200" placeholder="e.g. 2nd floor, near metro">
      <label>Your UPI ID for reward (optional)</label><input id="aUpi" placeholder="name@upi">
      <div class="err" id="aErr"></div>
      <button class="btn full" id="aSave" onclick="App.save()">Submit</button>
      <p style="font-size:12px;color:var(--mut)">New listings are reviewed first. After 3 approved boards, yours go live instantly.</p>`);
    this.cityChanged(); this.initMap();
  },
  cityChanged() {
    const c = $('aCity').value; $('areas').innerHTML = AREAS[c].map(a => `<option value="${a}">`).join('');
    if (this.map) this.map.setView(CENTER[c], 12);
  },
  initMap() {
    setTimeout(() => {
      this.map = L.map('map').setView(CENTER[$('aCity').value], 12);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(this.map);
      this.map.on('click', e => this.setPin(e.latlng.lat, e.latlng.lng));
    }, 50);
  },
  setPin(lat, lng) {
    this.pinLL = [lat, lng];
    if (this.pin) this.pin.setLatLng([lat, lng]); else this.pin = L.marker([lat, lng]).addTo(this.map);
  },
  useLoc() {
    if (!navigator.geolocation) return this.toast('Location not supported');
    navigator.geolocation.getCurrentPosition(p => { this.setPin(p.coords.latitude, p.coords.longitude); this.map.setView([p.coords.latitude, p.coords.longitude], 17); },
      () => this.toast('Permission denied – pin on map instead'));
  },
  pick(inp) {
    const f = inp.files[0]; if (!f) return;
    const im = new Image(), url = URL.createObjectURL(f);
    im.onload = () => {
      const s = Math.min(1, 1280 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      this.image = c.toDataURL('image/jpeg', 0.72); $('prev').src = this.image; $('prev').style.display = 'block'; URL.revokeObjectURL(url);
    };
    im.src = url;
  },
  async save() {
    $('aErr').textContent = '';
    if (!this.image) return $('aErr').textContent = 'Please add the board photo';
    if (!this.pinLL) return $('aErr').textContent = 'Please set location (use my location or tap map)';
    $('aSave').disabled = true; $('aSave').textContent = 'Uploading…';
    try {
      const r = await this.post('create', {
        type: $('aType').value, city: $('aCity').value, area: $('aArea').value, lat: this.pinLL[0], lng: this.pinLL[1],
        phone: $('aPhone').value, note: $('aNote').value, upi: $('aUpi').value, image: this.image
      });
      this.pinLL = null; this.close();
      this.toast(r.status === 'approved' ? 'Board is live!' : 'Submitted – will go live after review');
      this.items = await this.get('list'); this.render();
    } catch (e) { $('aErr').textContent = e.message; $('aSave').disabled = false; $('aSave').textContent = 'Submit'; }
  },

  /* ---- my boards ---- */
  async openMine() {
    this.open('<h2>My boards</h2><div id="mineBox">Loading…</div>', true);
    try {
      const l = await this.post('mine', {});
      $('mineBox').innerHTML = l.length ? l.map(x => `
        <div class="item"><img src="${img(x.photo, 150)}">
          <div class="grow"><b>${esc(x.type)}</b> <span class="pill ${x.status}">${x.status}</span><br>${esc(x.area)}, ${esc(x.city)}<br>
            <input id="ph_${x.id}" value="${esc(x.phone)}" placeholder="Add phone number" style="margin-top:6px;max-width:200px">
            <button class="btn sm" onclick="App.setPhone('${x.id}')">Save</button></div>
          ${x.status === 'approved' ? `<button class="btn sm ghost" onclick="App.setStatus('${x.id}','closed')">Mark booked</button>` : ''}
          ${x.status === 'closed' ? `<button class="btn sm ghost" onclick="App.setStatus('${x.id}','reopen')">Reopen</button>` : ''}
        </div>`).join('') : 'You have not uploaded any board yet.';
    } catch (e) { $('mineBox').textContent = e.message; }
  },
  async setPhone(id) { try { await this.post('update', { id, phone: $('ph_' + id).value }); this.toast('Saved'); this.items = await this.get('list'); this.render(); } catch (e) { this.toast(e.message); } },
  async setStatus(id, status) { try { await this.post('update', { id, status }); this.items = await this.get('list'); this.render(); this.openMine(); } catch (e) { this.toast(e.message); } },

  /* ---- admin ---- */
  async openAdmin() {
    this.open('<h2>Review queue</h2><div id="admBox">Loading…</div>', true);
    try {
      const l = await this.post('adminList', {});
      $('admBox').innerHTML = l.length ? l.map(x => `
        <div class="item"><img src="${img(x.photo, 200)}" style="width:90px;height:90px">
          <div class="grow"><b>${esc(x.type)}</b> <span class="pill ${x.status}">${x.status}</span> ${+x.reports ? `<span class="pill rejected">${x.reports} reports</span>` : ''}<br>
            ${esc(x.area)}, ${esc(x.city)} · by ${esc(x.by)}<br>${x.phone ? esc(x.phone) : 'no phone'}</div>
          <button class="btn sm green" onclick="App.decide('${x.id}','approve')">Approve</button>
          <button class="btn sm" onclick="App.decide('${x.id}','reject')">Reject</button>
        </div>`).join('') : 'Nothing to review 🎉';
    } catch (e) { $('admBox').textContent = e.message; }
  },
  async decide(id, decision) { try { await this.post('adminDecide', { id, decision }); this.items = await this.get('list'); this.render(); this.openAdmin(); } catch (e) { this.toast(e.message); } }
};

App.init();
