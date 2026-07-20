/* ================================================================
   BUTTSCOOT GP — a jiu jitsu butt-scooting kart racer
   Mode-7 style behind-the-driver renderer (SNES kart vibes)
   ================================================================ */
'use strict';

/* ---------------- Characters ---------------- */
const BELT_COLORS = {
  white:  '#f2efe6',
  blue:   '#2e6fb5',
  purple: '#7a4fa3',
  brown:  '#7a4a2b',
  black:  '#191919',
  coral:  '#c8483c',
};

const CHARACTERS = [
  {
    name: 'SPAZZY STEVE', belt: 'white', beltLabel: 'WHITE BELT · 0 STRIPES',
    tag: '“Is this a heel hook? Is THIS a heel hook?”',
    gi: '#f2efe6', skin: '#e8b48c', hair: 'buzz', hairColor: '#5a4632',
    stats: { scoot: 5, speed: 3, control: 1 }, fav: 'submit',
  },
  {
    name: 'GUARD-PULL GARY', belt: 'blue', beltLabel: 'BLUE BELT · 4 STRIPES FOREVER',
    tag: 'Sat down before the ref said combate. Lives here now.',
    gi: '#2e6fb5', skin: '#f0c9a0', hair: 'bald', hairColor: '#000',
    stats: { scoot: 4, speed: 3, control: 3 }, fav: 'sweep',
  },
  {
    name: 'BERIMBOLO BIA', belt: 'purple', beltLabel: 'PURPLE BELT · INVERTED',
    tag: 'Turns corners by spinning underneath them.',
    gi: '#f2efe6', skin: '#b57e52', hair: 'bun', hairColor: '#2b1c12',
    stats: { scoot: 3, speed: 3, control: 5 }, fav: 'sweep',
  },
  {
    name: 'PRESSURE PETE', belt: 'brown', beltLabel: 'BROWN BELT · 240 LBS OF SHOULDER',
    tag: 'Slow to start. Impossible to stop. Smells like victory (vinegar).',
    gi: '#8a6a4f', skin: '#e8b48c', hair: 'cauliflower', hairColor: '#3d3d3d',
    stats: { scoot: 2, speed: 5, control: 2 }, fav: 'pass',
  },
  {
    name: 'PROFESSOR OSS', belt: 'black', beltLabel: 'BLACK BELT · 3RD DEGREE',
    tag: 'Has scooted more miles than your car. Says "position before submission… and before braking."',
    gi: '#f2efe6', skin: '#c98e5e', hair: 'bald', hairColor: '#000',
    stats: { scoot: 4, speed: 4, control: 4 }, fav: 'pass',
  },
  {
    name: 'HEEL HOOK HANNAH', belt: 'purple', beltLabel: 'PURPLE BELT · LEG LOCK LAB',
    tag: 'Only enters corners at 50/50. Your ankles are the finish line.',
    gi: '#2e2e2e', skin: '#f0c9a0', hair: 'ponytail', hairColor: '#a8552e',
    stats: { scoot: 4, speed: 4, control: 3 }, fav: 'submit',
  },
  {
    name: 'DOJO DAN', belt: 'blue', beltLabel: 'BLUE BELT · HOBBYIST HERO',
    tag: 'Two kids, a mortgage, and the fastest hips in the Tuesday 6am class.',
    gi: '#f2efe6', skin: '#d29a6a', hair: 'buzz', hairColor: '#222',
    stats: { scoot: 3, speed: 4, control: 3 }, fav: 'pass',
  },
  {
    name: 'COACH CORAL', belt: 'coral', beltLabel: 'CORAL BELT · SEEN EVERYTHING',
    tag: 'Scooted before it was cool. Will scoot after it is cool.',
    gi: '#f2efe6', skin: '#e0a878', hair: 'gray', hairColor: '#cfcfcf',
    stats: { scoot: 3, speed: 5, control: 4 }, fav: null, // coach has no tells

  },
];

const STAT_LABELS = [
  ['scoot',   'SCOOT POWER'],
  ['speed',   'TOP SPEED'],
  ['control', 'MAT CONTROL'],
];

/* ---------------- Tracks ---------------- */
const TRACKS = [
  {
    id: 'oval', name: 'WHITE BELT OVAL', sub: 'FUNDAMENTALS CLASS',
    width: 150,
    mat: '#3e8e6a', border: '#c8483c',
    floor: '#1b241f',
    points: [
      [320, 240], [800, 190], [1280, 240],
      [1430, 500], [1280, 760], [800, 810],
      [320, 760], [170, 500],
    ],
    boostS: [0.28, 0.78],
    bagS: [0.12, 0.45, 0.62, 0.92],
  },
  {
    id: 'bolo', name: 'BERIMBOLO BEND', sub: 'THE SPIN CYCLE',
    width: 136,
    mat: '#3a7dbb', border: '#e8c33c',
    floor: '#181e26',
    points: [
      [260, 300], [640, 170], [1050, 230], [1380, 180],
      [1480, 420], [1240, 560], [1350, 790],
      [950, 850], [640, 720], [330, 830], [160, 600],
    ],
    boostS: [0.22, 0.55, 0.85],
    bagS: [0.1, 0.38, 0.7, 0.95],
  },
  {
    id: 'worlds', name: 'WORLDS ARENA', sub: 'BLACK BELT FINAL · HAIRPIN OF DOOM',
    width: 124,
    mat: '#8659a8', border: '#e8c33c',
    floor: '#1d1824',
    points: [
      [230, 210], [720, 150], [1230, 200], [1440, 380],
      [1300, 520], [1000, 470], [820, 560],
      [1120, 680], [1380, 700], [1420, 860],
      [900, 900], [420, 840], [190, 640], [300, 430],
    ],
    boostS: [0.30, 0.68, 0.93],
    bagS: [0.15, 0.45, 0.6, 0.85],
  },
];

/* ---------------- Items ---------------- */
const ITEM_DEFS = {
  flow:   { icon: '🥋', name: 'FLOW ROLL' },
  acai:   { icon: '🍓', name: 'AÇAÍ BOWL' },
  puddle: { icon: '💦', name: 'MAT PUDDLE' },
};

/* ---------------- Utils ---------------- */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
const angleWrap = a => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
const angleLerp = (a, b, t) => a + angleWrap(b - a) * t;
const fmtTime = t => {
  if (t == null || !isFinite(t)) return '—';
  const m = Math.floor(t / 60), s = t % 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`;
};

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return [
    0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
  ];
}

/* ---------------- Audio ---------------- */
const AudioKit = {
  ctx: null, muted: false,
  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(freq, dur, type = 'square', vol = 0.12, glideTo = null, when = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  },
  squeak() {
    const f = 750 + Math.random() * 350;
    this.tone(f, 0.07, 'triangle', 0.05, f * 0.55);
  },
  bump() { this.tone(140, 0.1, 'sawtooth', 0.1, 80); },
  boost() { this.tone(300, 0.25, 'square', 0.09, 900); },
  beep(final) { this.tone(final ? 880 : 440, final ? 0.4 : 0.15, 'square', 0.12); },
  lap() { this.tone(660, 0.1, 'square', 0.1); this.tone(880, 0.14, 'square', 0.1, null, 0.1); },
  whistle() { this.tone(2350, 0.1, 'square', 0.08, 2000); this.tone(2350, 0.16, 'square', 0.08, 1850, 0.13); },
  pickup() { this.tone(700, 0.06, 'square', 0.08); this.tone(1050, 0.09, 'square', 0.08, null, 0.06); },
  flowOn() { this.tone(520, 0.3, 'triangle', 0.09, 780); },
  slurp() { this.tone(260, 0.28, 'triangle', 0.1, 720); },
  splat() { this.tone(190, 0.16, 'sawtooth', 0.1, 90); },
  slip() { this.tone(950, 0.35, 'triangle', 0.09, 180); },
  scWin() { this.tone(523, 0.12, 'square', 0.1); this.tone(784, 0.2, 'square', 0.1, null, 0.1); },
  scLose() { this.tone(300, 0.3, 'sawtooth', 0.1, 130); },
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'square', 0.1, null, i * 0.13));
  },
};

/* ---------------- Claude integration ----------------
   Talks to the local proxy in server.py (which holds the API key).
   Every feature here has a scripted fallback — offline play is identical
   to the pre-AI game. */
const AI_ROSTER = []; // Claude-invented characters, pooled for the session

const ClaudeKit = {
  enabled: false,
  async init() {
    try {
      const r = await fetch('/api/status');
      this.enabled = (await r.json()).ai === true;
    } catch (e) { this.enabled = false; }
    const badge = document.getElementById('ai-badge');
    badge.textContent = this.enabled
      ? '✦ CLAUDE: LIVE — AI ROSTER · TRASH TALK · RINGSIDE RECAP'
      : '✦ CLAUDE: OFFLINE — run server with ANTHROPIC_API_KEY for AI roster + trash talk';
    badge.classList.toggle('on', this.enabled);
  },
  async ask(system, prompt, maxTokens = 400, timeoutMs = 8000) {
    if (!this.enabled) return null;
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), timeoutMs);
      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, prompt, max_tokens: maxTokens }),
        signal: ctrl.signal,
      });
      clearTimeout(to);
      if (!r.ok) return null;
      return (await r.json()).text || null;
    } catch (e) { return null; }
  },
  json(text) {
    if (!text) return null;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]); } catch (e) { return null; }
  },
};

const HAIR_STYLES = ['buzz', 'bald', 'bun', 'ponytail', 'cauliflower', 'gray'];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

async function generateCharacter() {
  const taken = [...CHARACTERS, ...AI_ROSTER].map(c => c.name).join(', ');
  const system =
    'You invent original characters for BUTTSCOOT GP, a comedy browser game where ' +
    'jiu-jitsu practitioners race by butt-scooting around mats and settle collisions ' +
    'with grappling matches. Characters are absurd-but-loving BJJ gym archetypes. ' +
    'PG humor, never mean-spirited about real groups of people.';
  const prompt =
    `Invent ONE new BJJ gym archetype. Avoid these existing names: ${taken}.\n` +
    'Respond with ONLY this JSON, no other text:\n' +
    '{"name":"2-3 WORD PUNCHY NAME IN CAPS","belt":"white|blue|purple|brown|black|coral",' +
    '"beltLabel":"BELT NAME · FUNNY QUALIFIER, max 34 chars","tag":"one-line personality, max 85 chars",' +
    '"gi":"#hex gi color (tasteful: whites, blues, blacks, or one fun color)","skin":"#hex human skin tone",' +
    '"hair":"buzz|bald|bun|ponytail|cauliflower|gray","hairColor":"#hex",' +
    '"stats":{"scoot":1-5,"speed":1-5,"control":1-5},"fav":"sweep|pass|submit"}\n' +
    'Stats must total 9-12. Be specific to BJJ culture (guard pullers, leg lockers, ' +
    'wrestlers, cardio machines, gi snobs, open-mat dads, comp kids...).';
  const j = ClaudeKit.json(await ClaudeKit.ask(system, prompt, 450, 7000));
  if (!j || !j.name || !j.stats) return null;
  const clampStat = v => clamp(Math.round(Number(v) || 3), 1, 5);
  return {
    name: String(j.name).toUpperCase().slice(0, 22),
    belt: BELT_COLORS[j.belt] ? j.belt : 'blue',
    beltLabel: String(j.beltLabel || 'MYSTERY BELT').toUpperCase().slice(0, 40),
    tag: String(j.tag || 'Nobody knows where they train.').slice(0, 100),
    gi: HEX_RE.test(j.gi) ? j.gi : '#f2efe6',
    skin: HEX_RE.test(j.skin) ? j.skin : '#d29a6a',
    hair: HAIR_STYLES.includes(j.hair) ? j.hair : 'buzz',
    hairColor: HEX_RE.test(j.hairColor) ? j.hairColor : '#2b1c12',
    stats: {
      scoot: clampStat(j.stats.scoot),
      speed: clampStat(j.stats.speed),
      control: clampStat(j.stats.control),
    },
    fav: ['sweep', 'pass', 'submit'].includes(j.fav) ? j.fav : null,
    generated: true,
  };
}

/* ---------------- Accounts (passkeys via the private backend) ----------------
   Same-origin /api/* — served by the buttscoot-backend Worker in production.
   When the backend isn't reachable (e.g. plain local dev), the whole account
   UI hides and the game behaves exactly as before. */

const GI_COLORS = ['#f2efe6', '#2e6fb5', '#2e2e2e', '#8a6a4f', '#e8a0b4', '#5c7a5c'];
const SKIN_TONES = ['#f0c9a0', '#e8b48c', '#d29a6a', '#b57e52', '#8d5a3a', '#5f3c26'];
const HAIR_COLORS = ['#2b1c12', '#5a4632', '#a8552e', '#222222', '#cfcfcf', '#d4a017'];

const AuthKit = {
  available: false,
  profile: null,

  b64uToBuf(s) {
    const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(b, c => c.charCodeAt(0)).buffer;
  },
  bufToB64u(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },

  async me() {
    try {
      const r = await fetch('/api/me');
      if (!r.ok) return null;
      const j = await r.json();
      this.available = true;
      this.profile = j.signedIn ? j.profile : null;
      return this.profile;
    } catch (e) {
      this.available = false;
      return null;
    }
  },

  credToJSON(cred) {
    const r = cred.response;
    const out = {
      id: cred.id,
      rawId: this.bufToB64u(cred.rawId),
      type: cred.type,
      clientExtensionResults: cred.getClientExtensionResults(),
      response: { clientDataJSON: this.bufToB64u(r.clientDataJSON) },
    };
    if (cred.authenticatorAttachment) out.authenticatorAttachment = cred.authenticatorAttachment;
    if (r.attestationObject) {
      out.response.attestationObject = this.bufToB64u(r.attestationObject);
      if (r.getTransports) out.response.transports = r.getTransports();
    }
    if (r.authenticatorData) out.response.authenticatorData = this.bufToB64u(r.authenticatorData);
    if (r.signature) out.response.signature = this.bufToB64u(r.signature);
    if (r.userHandle) out.response.userHandle = this.bufToB64u(r.userHandle);
    return out;
  },

  /* Options are pre-fetched when the auth modal opens so the WebAuthn call
     fires immediately on click — password-manager popups (1Password etc.)
     steal focus, and a long fetch gap between click and ceremony is what
     produces "The document is not focused". */
  _optCache: {},
  async fetchOptions(kind) {
    const cached = this._optCache[kind];
    if (cached && Date.now() - cached.at < 4 * 60 * 1000) return JSON.parse(cached.raw);
    const r = await fetch(`/api/auth/${kind}/options`, { method: 'POST' });
    const raw = await r.text();
    if (!r.ok) {
      let j = {};
      try { j = JSON.parse(raw); } catch (e) { /* not json */ }
      throw new Error(j.error || 'options failed');
    }
    this._optCache[kind] = { raw, at: Date.now() };
    return JSON.parse(raw);
  },
  prefetch() {
    this.fetchOptions('register').catch(() => {});
    this.fetchOptions('login').catch(() => {});
  },

  /* run the browser ceremony; if focus was stolen (password-manager popup),
     wait for the page to regain focus and retry once */
  async ceremony(fn) {
    window.focus();
    try {
      return await fn();
    } catch (e) {
      if (String(e?.message || '').toLowerCase().includes('not focused')) {
        await new Promise(res => {
          if (document.hasFocus()) return res();
          const t = setTimeout(res, 15000);
          window.addEventListener('focus', () => { clearTimeout(t); setTimeout(res, 200); }, { once: true });
        });
        return await fn();
      }
      throw e;
    }
  },

  async register() {
    const options = await this.fetchOptions('register');
    options.challenge = this.b64uToBuf(options.challenge);
    options.user.id = this.b64uToBuf(options.user.id);
    (options.excludeCredentials || []).forEach(c => { c.id = this.b64uToBuf(c.id); });
    const cred = await this.ceremony(() => navigator.credentials.create({ publicKey: options }));
    delete this._optCache.register;
    const vr = await fetch('/api/auth/register/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(this.credToJSON(cred)),
    });
    const j = await vr.json();
    if (!vr.ok) throw new Error(j.error || 'registration failed');
    this.profile = j.profile;
    return j; // includes recoveryCodes
  },

  async login() {
    const options = await this.fetchOptions('login');
    options.challenge = this.b64uToBuf(options.challenge);
    (options.allowCredentials || []).forEach(c => { c.id = this.b64uToBuf(c.id); });
    const cred = await this.ceremony(() => navigator.credentials.get({ publicKey: options }));
    delete this._optCache.login;
    const vr = await fetch('/api/auth/login/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(this.credToJSON(cred)),
    });
    const j = await vr.json();
    if (!vr.ok) throw new Error(j.error || 'sign-in failed');
    this.profile = j.profile;
    return j;
  },

  async logout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) { /* best effort */ }
    this.profile = null;
  },

  async saveProfile(fields) {
    const r = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(fields),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'save failed');
    this.profile = j.profile;
    return j.profile;
  },
};

/* ---------------- Track geometry + world texture ---------------- */
class Track {
  constructor(def) {
    this.def = def;
    this.width = def.width;
    this.samples = [];
    this.build();
  }

  build() {
    const pts = this.def.points;
    const n = pts.length;
    const raw = [];
    const SEGS = 28;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (let j = 0; j < SEGS; j++) raw.push(catmullRom(p0, p1, p2, p3, j / SEGS));
    }
    let total = 0;
    const lens = [0];
    for (let i = 1; i <= raw.length; i++) {
      const a = raw[i - 1], b = raw[i % raw.length];
      total += Math.hypot(b[0] - a[0], b[1] - a[1]);
      lens.push(total);
    }
    this.length = total;
    const N = 480;
    this.samples = [];
    let seg = 0;
    for (let i = 0; i < N; i++) {
      const target = (i / N) * total;
      while (seg < raw.length - 1 && lens[seg + 1] < target) seg++;
      const a = raw[seg], b = raw[(seg + 1) % raw.length];
      const segLen = lens[seg + 1] - lens[seg] || 1;
      const t = (target - lens[seg]) / segLen;
      this.samples.push({ x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t) });
    }
    for (let i = 0; i < N; i++) {
      const a = this.samples[i], b = this.samples[(i + 1) % N];
      const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      a.dirX = (b.x - a.x) / d;
      a.dirY = (b.y - a.y) / d;
    }
    const pad = this.width / 2 + 120;
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    for (const s of this.samples) {
      minX = Math.min(minX, s.x); maxX = Math.max(maxX, s.x);
      minY = Math.min(minY, s.y); maxY = Math.max(maxY, s.y);
    }
    this.bounds = { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
    this.boosts = (this.def.boostS || []).map(s => {
      const p = this.sampleAt(s);
      return { x: p.x, y: p.y, dirX: p.dirX, dirY: p.dirY, s };
    });
    /* gear bags: item pickups, one either side of the racing line */
    this.bags = [];
    for (const s of (this.def.bagS || [])) {
      const p = this.sampleAt(s);
      const nx = -p.dirY, ny = p.dirX;
      for (const side of [-1, 1]) {
        const off = side * this.width * 0.22;
        this.bags.push({ x: p.x + nx * off, y: p.y + ny * off, s, activeAt: 0 });
      }
    }
  }

  sampleAt(s) {
    const N = this.samples.length;
    return this.samples[((Math.round(s * N) % N) + N) % N];
  }

  nearestS(x, y, hint) {
    const N = this.samples.length;
    if (hint == null) {
      let best = 0, bd = Infinity;
      for (let i = 0; i < N; i++) {
        const d = dist2(x, y, this.samples[i].x, this.samples[i].y);
        if (d < bd) { bd = d; best = i; }
      }
      return best / N;
    }
    const center = Math.round(hint * N);
    let best = center, bd = Infinity;
    for (let off = -30; off <= 30; off++) {
      const i = ((center + off) % N + N) % N;
      const d = dist2(x, y, this.samples[i].x, this.samples[i].y);
      if (d < bd) { bd = d; best = i; }
    }
    return best / N;
  }

  distToCenter(x, y, s) {
    const p = this.sampleAt(s);
    return Math.hypot(x - p.x, y - p.y);
  }

  centerPath(ctx) {
    ctx.beginPath();
    this.samples.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
  }

  /* world-space texture the mode-7 renderer samples from (1 world unit = 1 px) */
  buildTexture() {
    const b = this.bounds, d = this.def;
    const w = Math.ceil(b.maxX - b.minX), h = Math.ceil(b.maxY - b.minY);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.translate(-b.minX, -b.minY);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    /* gym floor + boards */
    ctx.fillStyle = d.floor;
    ctx.fillRect(b.minX, b.minY, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let y = Math.floor(b.minY / 42) * 42; y < b.maxY; y += 42) { ctx.moveTo(b.minX, y); ctx.lineTo(b.maxX, y); }
    ctx.stroke();

    /* mat drop shadow */
    ctx.save();
    ctx.translate(5, 9);
    this.centerPath(ctx);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = this.width + 100;
    ctx.stroke();
    ctx.restore();

    /* red/gold safety border zone */
    this.centerPath(ctx);
    ctx.strokeStyle = d.border;
    ctx.lineWidth = this.width + 92;
    ctx.stroke();
    this.centerPath(ctx);
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = this.width + 92;
    ctx.setLineDash([2, 96]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* athletic tape edge, then mat surface */
    this.centerPath(ctx);
    ctx.strokeStyle = 'rgba(243,239,228,0.9)';
    ctx.lineWidth = this.width + 8;
    ctx.stroke();
    this.centerPath(ctx);
    ctx.strokeStyle = d.mat;
    ctx.lineWidth = this.width;
    ctx.stroke();

    /* tatami puzzle-mat seams (texture first, mask to the ribbon) */
    const seams = document.createElement('canvas');
    seams.width = w; seams.height = h;
    const sctx = seams.getContext('2d');
    sctx.translate(-b.minX, -b.minY);
    sctx.lineJoin = 'round'; sctx.lineCap = 'round';
    const TILE = 64;
    for (let gx = Math.floor(b.minX / TILE) * TILE; gx < b.maxX; gx += TILE) {
      for (let gy = Math.floor(b.minY / TILE) * TILE; gy < b.maxY; gy += TILE) {
        const alt = ((gx / TILE) + (gy / TILE)) % 2 === 0;
        sctx.fillStyle = alt ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
        sctx.fillRect(gx, gy, TILE, TILE);
      }
    }
    sctx.strokeStyle = 'rgba(0,0,0,0.18)';
    sctx.lineWidth = 2;
    sctx.beginPath();
    for (let gx = Math.floor(b.minX / TILE) * TILE; gx < b.maxX; gx += TILE) { sctx.moveTo(gx, b.minY); sctx.lineTo(gx, b.maxY); }
    for (let gy = Math.floor(b.minY / TILE) * TILE; gy < b.maxY; gy += TILE) { sctx.moveTo(b.minX, gy); sctx.lineTo(b.maxX, gy); }
    sctx.stroke();
    sctx.globalCompositeOperation = 'destination-in';
    this.centerPath(sctx);
    sctx.strokeStyle = '#000';
    sctx.lineWidth = this.width;
    sctx.stroke();
    ctx.drawImage(seams, b.minX, b.minY);

    /* center dashed line */
    this.centerPath(ctx);
    ctx.strokeStyle = 'rgba(243,239,228,0.4)';
    ctx.lineWidth = 5;
    ctx.setLineDash([22, 30]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* start / finish checker */
    const st = this.samples[0];
    const half = this.width / 2;
    ctx.save();
    ctx.translate(st.x, st.y);
    ctx.rotate(Math.atan2(st.dirY, st.dirX));
    const cols = 8, rows = 3, cw = this.width / cols, chh = 12;
    for (let r = 0; r < rows; r++) {
      for (let ci = 0; ci < cols; ci++) {
        ctx.fillStyle = (r + ci) % 2 === 0 ? '#111' : '#f3efe4';
        ctx.fillRect(-chh * rows / 2 + r * chh, -half + ci * cw, chh, cw);
      }
    }
    ctx.restore();

    /* boost pads — floor-painted, text oriented toward oncoming scooters */
    for (const bp of this.boosts) {
      const ang = Math.atan2(bp.dirY, bp.dirX);
      ctx.save();
      ctx.translate(bp.x, bp.y);
      ctx.rotate(ang);
      ctx.fillStyle = 'rgba(244,197,66,0.95)';
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 4;
      const r = 34;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#10130f';
      ctx.beginPath();
      for (const off of [-10, 4]) {
        ctx.moveTo(off - 6, -13);
        ctx.lineTo(off + 8, 0);
        ctx.lineTo(off - 6, 13);
        ctx.lineTo(off - 1, 0);
      }
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(bp.x, bp.y);
      ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = '#10130f';
      ctx.font = '900 13px Archivo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OSS', 0, 27);
      ctx.restore();
    }

    /* infield logo */
    let cx = 0, cy = 0;
    for (const s of this.samples) { cx += s.x; cy += s.y; }
    cx /= this.samples.length; cy /= this.samples.length;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.font = '52px Bungee, sans-serif';
    ctx.fillText('BUTTSCOOT', 0, -8);
    ctx.font = '28px Bungee, sans-serif';
    ctx.fillText('G P', 0, 34);
    ctx.restore();

    this.texW = w;
    this.texH = h;
    this.texData = new Uint32Array(ctx.getImageData(0, 0, w, h).data.buffer);
    this.outColor = this.texData[0]; // gym floor
  }

  /* gym wall backdrop (drawn above the horizon, parallax-scrolled with yaw) */
  buildWall() {
    const d = this.def;
    const w = 1024, h = 140;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#07090812');
    grad.addColorStop(0, '#0a0d0b');
    grad.addColorStop(1, '#1a221d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    /* giant ghost lettering */
    ctx.fillStyle = 'rgba(243,239,228,0.05)';
    ctx.font = '44px Bungee, sans-serif';
    ctx.textAlign = 'center';
    for (let x = 128; x < w; x += 340) ctx.fillText('BUTTSCOOT GP', x, 74);

    /* wall pads (bottom band) */
    const padTop = h - 52;
    for (let x = 0; x < w; x += 64) {
      const alt = (x / 64) % 2 === 0;
      ctx.fillStyle = alt ? d.mat : '#12171a';
      ctx.globalAlpha = 0.5;
      ctx.fillRect(x + 1, padTop, 62, 52);
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(x, padTop, 2, 52);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, padTop, w, 5);

    /* pennant string */
    ctx.strokeStyle = 'rgba(243,239,228,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 22);
    for (let x = 0; x <= w; x += 64) ctx.quadraticCurveTo(x + 32, 34, x + 64, 22);
    ctx.stroke();
    const cols = [d.mat, d.border, '#f4c542'];
    for (let x = 8, i = 0; x < w; x += 32, i++) {
      ctx.fillStyle = cols[i % 3];
      ctx.beginPath();
      ctx.moveTo(x, 26); ctx.lineTo(x + 16, 26); ctx.lineTo(x + 8, 46);
      ctx.closePath();
      ctx.fill();
    }

    /* floor-meet line */
    ctx.fillStyle = 'rgba(243,239,228,0.18)';
    ctx.fillRect(0, h - 3, w, 3);

    this.wall = c;
  }
}

/* ---------------- Racer ---------------- */
class Racer {
  constructor(char, track, isPlayer, slot) {
    this.char = char;
    this.track = track;
    this.isPlayer = isPlayer;
    this.slot = slot;

    const st = char.stats;
    this.topSpeed = 175 + st.speed * 24;
    this.accel = 300 + st.scoot * 62;
    this.turnRate = 2.3 + st.control * 0.55;

    const backS = 1 - (0.014 + slot * 0.012);
    const p = track.sampleAt(backS);
    const nx = -p.dirY, ny = p.dirX;
    const lat = (slot % 2 === 0 ? -1 : 1) * track.width * 0.2;
    this.x = p.x + nx * lat;
    this.y = p.y + ny * lat;
    this.heading = Math.atan2(p.dirY, p.dirX);
    this.speed = 0;
    this.phase = Math.random() * TAU;
    this.pulseCount = 0;
    this.s = track.nearestS(this.x, this.y, backS);
    this.progress = 0;
    this.lap = 1;
    this.lapStart = 0;
    this.bestLap = null;
    this.finished = false;
    this.finishTime = null;
    this.boostTimer = 0;
    this.boostCooldowns = new Map();
    this.offTrack = false;
    this.bump = 0;
    this.lean = 0;
    this.stunTimer = 0;
    this.scW = 0;
    this.scL = 0;
    this.scSubs = 0;
    this.item = null;
    this.flowTimer = 0;
    this.slipTimer = 0;
    this.aiItemAt = 0;
    this.rank = 4;

    if (!isPlayer) {
      this.aiSkill = 0.86 + Math.random() * 0.12;
      this.aiWobble = Math.random() * TAU;
      this.aiLine = (Math.random() - 0.5) * track.width * 0.4;
    }
  }

  update(dt, input, game) {
    const tr = this.track;

    let steer = 0, thrust = 0, brake = false;
    if (this.isPlayer) {
      steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      thrust = input.up ? 1 : 0;
      brake = input.down;
    } else {
      ({ steer, thrust, brake } = this.aiControl(dt));
    }
    if (game.state !== 'race' || this.finished) { thrust = 0; brake = true; steer = 0; }
    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - dt);
      thrust = 0; steer = 0; brake = true;
    }
    if (this.slipTimer > 0) {
      this.slipTimer = Math.max(0, this.slipTimer - dt);
      thrust = 0; steer = 0; brake = false;
      this.heading += 9 * dt; // spin-out
    }
    this.flowTimer = Math.max(0, this.flowTimer - dt);
    this.lean = lerp(this.lean, steer, 1 - Math.exp(-8 * dt));

    /* scoot pulse: thrust arrives in rhythmic pushes */
    if (thrust > 0) {
      const rate = 5.2 + this.char.stats.scoot * 0.35;
      this.phase += dt * rate;
      const newCount = Math.floor(this.phase / TAU);
      if (newCount !== this.pulseCount) {
        this.pulseCount = newCount;
        if (this.isPlayer || Math.random() < 0.25) AudioKit.squeak();
      }
      const pulse = 0.45 + 0.55 * Math.pow(Math.max(0, Math.sin(this.phase)), 1.4);
      this.speed += this.accel * pulse * thrust * dt;
    } else {
      this.phase += dt * 2 * Math.min(1, this.speed / 60);
    }
    if (brake) this.speed -= 340 * dt;

    const cap = this.offTrack ? 95 : this.topSpeed * (this.boostTimer > 0 ? 1.42 : 1);
    const drag = this.offTrack ? 2.4 : 0.9;
    this.speed -= this.speed * drag * dt;
    this.speed = Math.max(0, this.speed);
    if (this.speed > cap) this.speed = Math.max(cap, this.speed - 260 * dt); // ease down to the cap

    const steerEff = this.turnRate * (0.55 + 0.45 * Math.min(1, this.speed / 160));
    this.heading += steer * steerEff * dt;

    this.x += Math.cos(this.heading) * this.speed * dt;
    this.y += Math.sin(this.heading) * this.speed * dt;

    const prevS = this.s;
    this.s = tr.nearestS(this.x, this.y, this.s);
    let ds = this.s - prevS;
    if (ds > 0.5) ds -= 1;
    if (ds < -0.5) ds += 1;
    this.progress += ds;

    const dCenter = tr.distToCenter(this.x, this.y, this.s);
    this.offTrack = dCenter > tr.width / 2 + 6;
    const hardEdge = tr.width / 2 + 42;
    if (dCenter > hardEdge) {
      const c = tr.sampleAt(this.s);
      const px = this.x - c.x, py = this.y - c.y;
      const d = Math.hypot(px, py) || 1;
      this.x = c.x + (px / d) * hardEdge;
      this.y = c.y + (py / d) * hardEdge;
      this.speed *= 0.7;
    }

    if (this.progress >= this.lap) {
      const now = game.raceTime;
      const lapTime = now - this.lapStart;
      this.lapStart = now;
      if (this.bestLap == null || lapTime < this.bestLap) this.bestLap = lapTime;
      this.lap++;
      if (this.isPlayer) {
        if (this.lap <= game.totalLaps) {
          AudioKit.lap();
          game.toast(this.lap === game.totalLaps ? 'FINAL LAP! GO GO GO!' : `LAP ${this.lap}!`);
        }
        game.updateBestLapHud();
      }
      if (this.lap > game.totalLaps && !this.finished) {
        this.finished = true;
        this.finishTime = now;
        if (this.isPlayer) game.onPlayerFinish();
      }
    }

    for (const bp of tr.boosts) {
      const cd = this.boostCooldowns.get(bp) || 0;
      if (cd > game.raceTime) continue;
      if (dist2(this.x, this.y, bp.x, bp.y) < 38 * 38) {
        this.boostCooldowns.set(bp, game.raceTime + 2);
        this.boostTimer = 1.1;
        this.speed = Math.max(this.speed, this.topSpeed * 1.42);
        if (this.isPlayer) { AudioKit.boost(); game.toast('OSS BOOST!'); }
      }
    }
    this.boostTimer = Math.max(0, this.boostTimer - dt);
    this.bump = Math.max(0, this.bump - dt * 3);
  }

  aiControl(dt) {
    const tr = this.track;
    this.aiWobble += dt * 0.7;
    const lookNear = 0.022, lookFar = 0.06;
    const wobble = Math.sin(this.aiWobble) * tr.width * 0.12;
    const p = tr.sampleAt(this.s + lookNear);
    const nx = -p.dirY, ny = p.dirX;
    const tx = p.x + nx * (this.aiLine * 0.5 + wobble);
    const ty = p.y + ny * (this.aiLine * 0.5 + wobble);
    const want = Math.atan2(ty - this.y, tx - this.x);
    const err = angleWrap(want - this.heading);
    const steer = clamp(err * 3.2, -1, 1);

    const far = tr.sampleAt(this.s + lookFar);
    const bendAngle = Math.abs(angleWrap(Math.atan2(far.dirY, far.dirX) - Math.atan2(p.dirY, p.dirX)));
    let throttle = this.aiSkill;
    if (bendAngle > 0.9 && this.speed > this.topSpeed * 0.6) throttle = 0.25;
    else if (Math.abs(err) > 1.1) throttle = 0.4;
    return { steer, thrust: throttle, brake: false };
  }

  /* ------- mode-7 sprite: the scooter seen from behind the camera ------- */
  /* drawn in world units around ground point (0,0); caller scales by f/z */
  drawSprite(ctx, relA) {
    const ch = this.char;
    if (this.slipTimer > 0) relA += this.slipTimer * 18; // spin-out twirl
    const bob = Math.max(0, Math.sin(this.phase)) * Math.min(1, this.speed / 60) * 3.4;
    const cosF = Math.cos(relA);   // 1 = facing away (back view), -1 = facing camera
    const sinF = Math.sin(relA);
    const gi = ch.gi, skin = ch.skin;
    const beltC = BELT_COLORS[ch.belt];

    ctx.save();

    /* flow-roll aura */
    if (this.flowTimer > 0) {
      const a = 0.32 + 0.14 * Math.sin(this.flowTimer * 9);
      const g = ctx.createRadialGradient(0, -16, 4, 0, -16, 34);
      g.addColorStop(0, `rgba(244,197,66,${a})`);
      g.addColorStop(1, 'rgba(244,197,66,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, -16, 34, 0, TAU); ctx.fill();
    }

    /* boost flames */
    if (this.boostTimer > 0) {
      ctx.strokeStyle = 'rgba(244,197,66,0.85)';
      ctx.lineWidth = 2.5;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 9, -4);
        ctx.lineTo(i * 15, 6 + Math.random() * 5);
        ctx.stroke();
      }
    }

    /* shadow */
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 5, 0, 0, TAU);
    ctx.fill();

    ctx.rotate(this.lean * 0.13);
    ctx.translate(0, -bob);
    const squash = 1 + this.bump * 0.18;
    ctx.scale(squash, 1 / squash);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(16,19,15,0.85)';

    const kick = Math.sin(this.phase) * 4 * Math.min(1, this.speed / 50);
    const facingAway = cosF > 0.3; // pure back view: legs hidden in front of the body

    const drawFeet = () => {
      if (facingAway) return;
      const feetY = cosF < -0.3 ? -4 : -9;
      for (const side of [-1, 1]) {
        const k = side === -1 ? kick : -kick;
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.ellipse(side * 8 + sinF * 14 + k * 0.3, feetY + Math.abs(k) * 0.2, 4.5, 3.5, 0, 0, TAU);
        ctx.fill(); ctx.stroke();
      }
    };

    /* arms: hands planted, pushing */
    for (const side of [-1, 1]) {
      const push = Math.sin(this.phase + (side === -1 ? 0 : 0.7)) * 2.5 * Math.min(1, this.speed / 60);
      ctx.strokeStyle = gi;
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(side * 10, -20);
      ctx.lineTo(side * 15, -2 + push);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(16,19,15,0.85)';
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(side * 15, -1 + push, 3.6, 0, TAU);
      ctx.fill(); ctx.stroke();
    }

    /* torso */
    ctx.fillStyle = gi;
    ctx.beginPath();
    ctx.ellipse(0, -17, 12.5, 13.5, 0, 0, TAU);
    ctx.fill(); ctx.stroke();

    /* lapel when facing the camera */
    if (cosF < -0.25) {
      ctx.strokeStyle = 'rgba(16,19,15,0.5)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-5, -24); ctx.lineTo(0, -13); ctx.lineTo(5, -24);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(16,19,15,0.85)';
      ctx.lineWidth = 2;
    }

    /* belt */
    ctx.fillStyle = beltC;
    ctx.beginPath();
    ctx.roundRect(-12, -13.5, 24, 5.5, 2.5);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (ch.belt === 'coral') {
      ctx.fillStyle = '#191919';
      for (let i = 0; i < 3; i++) ctx.fillRect(-9 + i * 8, -13, 4, 4.5);
    }
    if (cosF < -0.25) { // knot faces the camera
      ctx.fillStyle = beltC;
      ctx.beginPath();
      ctx.arc(sinF * -6, -10.5, 3.2, 0, TAU);
      ctx.fill(); ctx.stroke();
    }
    ctx.lineWidth = 2;

    drawFeet(); // sideways or facing the camera → feet visible in front

    /* head */
    const hx = sinF * 4;
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(hx, -34, 8, 0, TAU);
    ctx.fill(); ctx.stroke();

    /* hair */
    ctx.fillStyle = ch.hairColor;
    if (ch.hair === 'buzz' || ch.hair === 'gray') {
      ctx.beginPath(); ctx.arc(hx, -35.5, 6.8, Math.PI, TAU); ctx.fill();
    } else if (ch.hair === 'bun') {
      ctx.beginPath(); ctx.arc(hx, -35.5, 6.8, Math.PI, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(hx - sinF * 3, -42, 3.6, 0, TAU); ctx.fill(); ctx.stroke();
    } else if (ch.hair === 'ponytail') {
      ctx.beginPath(); ctx.arc(hx, -35.5, 6.8, Math.PI, TAU); ctx.fill();
      ctx.beginPath();
      ctx.ellipse(hx - sinF * 5, -43 - bob * 0.3, 2.6, 5, 0, 0, TAU);
      ctx.fill();
    } else if (ch.hair === 'cauliflower') {
      ctx.beginPath(); ctx.arc(hx - 7.5, -34, 2.8, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(hx + 7.5, -34, 2.8, 0, TAU); ctx.fill();
    }

    /* face when turned toward camera */
    if (cosF < -0.35) {
      ctx.fillStyle = '#10130f';
      if (this.stunTimer > 0 || this.slipTimer > 0) { // dazed X eyes
        ctx.strokeStyle = '#10130f';
        ctx.lineWidth = 1.2;
        for (const ex of [-2.8, 2.8]) {
          ctx.beginPath();
          ctx.moveTo(hx + ex - 1.4, -35.9); ctx.lineTo(hx + ex + 1.4, -33.1);
          ctx.moveTo(hx + ex + 1.4, -35.9); ctx.lineTo(hx + ex - 1.4, -33.1);
          ctx.stroke();
        }
      } else {
        ctx.beginPath(); ctx.arc(hx - 2.8, -34.5, 1.1, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(hx + 2.8, -34.5, 1.1, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#10130f';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(hx, -31.5, 2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      }
    }

    /* dizzy stars while stunned or slipping */
    if (this.stunTimer > 0 || this.slipTimer > 0) {
      ctx.fillStyle = '#f4c542';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      const a0 = Math.max(this.stunTimer, this.slipTimer) * 5;
      for (let i = 0; i < 3; i++) {
        const a = a0 + (i * TAU) / 3;
        ctx.fillText('✶', hx + Math.cos(a) * 12, -46 + Math.sin(a) * 3);
      }
    }

    ctx.restore();
  }

  /* top-down version, still used for the character card portrait */
  drawTopDown(ctx) {
    const ch = this.char;
    const bob = Math.max(0, Math.sin(this.phase)) * Math.min(1, this.speed / 60);
    const kick = Math.sin(this.phase) * 0.35 * Math.min(1, this.speed / 50);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.save();
    ctx.rotate(this.heading);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 3, 22, 16, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.rotate(this.heading + Math.PI / 2);
    const squash = 1 + bob * 0.1;
    ctx.scale(squash, 1 / Math.sqrt(squash));

    const gi = ch.gi, skin = ch.skin;
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = 'rgba(16,19,15,0.85)';

    for (const side of [-1, 1]) {
      const k = side === -1 ? kick : -kick;
      ctx.save();
      ctx.translate(side * 7, -6);
      ctx.rotate(k * 0.6);
      ctx.fillStyle = gi;
      ctx.beginPath();
      ctx.roundRect(-4.5, -24, 9, 24, 4.5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.ellipse(0, -26, 5, 6.5, 0, 0, TAU);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    for (const side of [-1, 1]) {
      const push = Math.sin(this.phase + (side === -1 ? 0 : 0.6)) * 3 * Math.min(1, this.speed / 60);
      ctx.save();
      ctx.translate(side * 13, 8 + push);
      ctx.fillStyle = gi;
      ctx.beginPath();
      ctx.roundRect(-3.5, -8, 7, 14, 3.5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(0, 8, 4.2, 0, TAU);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = gi;
    ctx.beginPath();
    ctx.ellipse(0, 2, 13.5, 14.5, 0, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(16,19,15,0.55)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, -8); ctx.lineTo(0, 4); ctx.lineTo(6, -8);
    ctx.stroke();
    const beltC = BELT_COLORS[ch.belt];
    ctx.strokeStyle = 'rgba(16,19,15,0.85)';
    ctx.fillStyle = beltC;
    ctx.beginPath();
    ctx.roundRect(-13, 6, 26, 6, 3);
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.stroke();
    if (ch.belt === 'coral') {
      ctx.fillStyle = '#191919';
      for (let i = 0; i < 3; i++) ctx.fillRect(-13 + 4 + i * 8.5, 6.5, 4, 5);
    }
    ctx.fillStyle = beltC;
    ctx.beginPath();
    ctx.arc(0, 9, 3.6, 0, TAU);
    ctx.fill(); ctx.stroke();

    ctx.lineWidth = 2.2;
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -4, 8.5, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = ch.hairColor;
    if (ch.hair === 'buzz' || ch.hair === 'gray') {
      ctx.beginPath(); ctx.arc(0, -5.5, 7, Math.PI, TAU); ctx.fill();
    } else if (ch.hair === 'bun') {
      ctx.beginPath(); ctx.arc(0, -5.5, 7, Math.PI, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -12, 4, 0, TAU); ctx.fill(); ctx.stroke();
    } else if (ch.hair === 'ponytail') {
      ctx.beginPath(); ctx.arc(0, -5.5, 7, Math.PI, TAU); ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, -14, 3, 6, 0, 0, TAU);
      ctx.fill();
    } else if (ch.hair === 'cauliflower') {
      ctx.beginPath(); ctx.arc(-8, -4, 3, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(8, -4, 3, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}

/* ---------------- Side-view match scene ----------------
   Hand-posed canvas puppets. Each composer draws both fighters in a real
   BJJ position and returns head coordinates so the caller can tag the player. */
const MatchScene = {
  OUT: 'rgba(16,19,15,0.85)',

  limb(ctx, x1, y1, x2, y2, w, color) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = this.OUT;
    ctx.lineWidth = w + 3;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  },

  bent(ctx, x1, y1, mx, my, x2, y2, w, color) {
    ctx.lineCap = 'round';
    for (const [lw, col] of [[w + 3, this.OUT], [w, color]]) {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(mx, my, x2, y2);
      ctx.stroke();
    }
  },

  hand(ctx, char, x, y, r = 4) {
    ctx.fillStyle = char.skin;
    ctx.strokeStyle = this.OUT;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
    ctx.fill(); ctx.stroke();
  },

  /* leg = thigh + shin + foot */
  leg(ctx, char, hx, hy, kx, ky, fx, fy, w = 7) {
    this.limb(ctx, hx, hy, kx, ky, w, char.gi);
    this.limb(ctx, kx, ky, fx, fy, w - 1, char.gi);
    this.hand(ctx, char, fx, fy, 4.2);
  },

  /* arm = shoulder→hand with a soft bend */
  arm(ctx, char, sx, sy, hx2, hy2, sag = 6, w = 6) {
    const mx = (sx + hx2) / 2, my = (sy + hy2) / 2 + sag;
    this.bent(ctx, sx, sy, mx, my, hx2, hy2, w, char.gi);
    this.hand(ctx, char, hx2, hy2);
  },

  /* torso capsule hip→shoulder with belt band near the hip */
  torso(ctx, char, hx, hy, sx, sy, w = 15) {
    this.limb(ctx, hx, hy, sx, sy, w, char.gi);
    const dx = sx - hx, dy = sy - hy;
    const len = Math.hypot(dx, dy) || 1;
    const bx = hx + dx * 0.22, by = hy + dy * 0.22;
    const px = -dy / len, py = dx / len;
    const half = w / 2 + 1.5;
    this.limb(ctx, bx - px * half, by - py * half, bx + px * half, by + py * half, 5, BELT_COLORS[char.belt]);
  },

  head(ctx, char, x, y, r, look, dizzy = false) {
    ctx.fillStyle = char.skin;
    ctx.strokeStyle = this.OUT;
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = char.hairColor;
    const hr = r - 1;
    if (char.hair !== 'bald') {
      ctx.beginPath(); ctx.arc(x, y - 1.5, hr, Math.PI, TAU); ctx.fill();
    }
    if (char.hair === 'bun') {
      ctx.beginPath(); ctx.arc(x - look * r * 0.8, y - r * 0.85, 3.6, 0, TAU); ctx.fill(); ctx.stroke();
    } else if (char.hair === 'ponytail') {
      ctx.beginPath(); ctx.ellipse(x - look * r * 1.15, y - r * 0.1, 2.8, 5.5, 0, 0, TAU); ctx.fill();
    } else if (char.hair === 'cauliflower') {
      ctx.beginPath(); ctx.arc(x - look * 2, y + 2, 2.6, 0, TAU); ctx.fill();
    }
    /* face */
    ctx.strokeStyle = '#10130f';
    ctx.fillStyle = '#10130f';
    const ex = x + look * r * 0.5, ey = y - 1;
    if (dizzy) {
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(ex - 2, ey - 2); ctx.lineTo(ex + 2, ey + 2);
      ctx.moveTo(ex + 2, ey - 2); ctx.lineTo(ex - 2, ey + 2);
      ctx.stroke();
    } else if (look !== 0) {
      ctx.beginPath(); ctx.arc(ex, ey, 1.4, 0, TAU); ctx.fill();
    }
  },

  /* ---- compositions (440×170, floor at y≈150) ---- */

  neutral(ctx, L, R, t) {
    const j1 = Math.sin(t * 7) * 3, j2 = Math.cos(t * 9) * 2.5;
    const M = (x) => 440 - x; // mirror helper
    /* left fighter */
    this.leg(ctx, L, 165, 142, 192, 134, 207, 148);
    this.leg(ctx, L, 168, 144, 198, 140, 213, 150);
    this.torso(ctx, L, 165, 142, 180, 110);
    this.arm(ctx, L, 180, 114, 212 + j1, 118 + j2);
    this.arm(ctx, L, 178, 120, 208 + j2, 128 - j1 * 0.5);
    this.head(ctx, L, 186, 97, 11, 1);
    /* right fighter */
    this.leg(ctx, R, M(165), 142, M(192), 134, M(207), 148);
    this.leg(ctx, R, M(168), 144, M(198), 140, M(213), 150);
    this.torso(ctx, R, M(165), 142, M(180), 110);
    this.arm(ctx, R, M(180), 114, M(212) - j1, 118 + j2);
    this.arm(ctx, R, M(178), 120, M(208) - j2, 128 + j1 * 0.5);
    this.head(ctx, R, M(186), 97, 11, -1);
    return { left: { x: 186, y: 97 }, right: { x: M(186), y: 97 } };
  },

  guard(ctx, top, bot, t) {
    const sway = Math.sin(t * 3) * 4;
    const lift = Math.max(0, Math.sin(t * 3)) * 2;
    /* bottom player: on their back, closed guard around the kneeling top player */
    this.torso(ctx, bot, 235, 142, 185, 144);
    this.arm(ctx, bot, 195, 142, 248 + sway * 0.5, 116, -4);
    this.head(ctx, bot, 170, 141 - lift, 10.5, 1);
    /* top player: kneeling, posturing */
    this.leg(ctx, top, 290 + sway * 0.4, 126, 285, 148, 305, 152);
    this.leg(ctx, top, 292 + sway * 0.4, 128, 300, 146, 315, 150);
    this.torso(ctx, top, 290 + sway * 0.4, 126, 272 + sway, 98);
    this.arm(ctx, top, 274 + sway, 102, 235, 132, 2);
    this.arm(ctx, top, 276 + sway, 106, 250, 138, 2);
    this.head(ctx, top, 266 + sway, 86, 10.5, -1);
    /* guard legs wrap over everything — drawn last so they read as wrapped */
    this.leg(ctx, bot, 232, 138, 262, 108 - lift, 285, 124);
    this.leg(ctx, bot, 236, 142, 268, 118 - lift, 287, 134);
    this.arm(ctx, bot, 192, 144, 255 + sway * 0.5, 124, -4);
    return { bot: { x: 170, y: 141 }, top: { x: 266 + sway, y: 86 } };
  },

  side(ctx, top, bot, t) {
    const press = Math.sin(t * 2) * 1.4;
    /* bottom: flat on their back */
    this.leg(ctx, bot, 245, 144, 272, 138, 295, 149);
    this.leg(ctx, bot, 248, 146, 278, 144, 300, 151);
    this.torso(ctx, bot, 245, 144, 192, 146);
    this.head(ctx, bot, 176, 143, 10.5, 1);
    this.arm(ctx, bot, 198, 144, 215, 118 + press, -6);
    /* top: chest-down across them */
    this.leg(ctx, top, 252, 112 + press, 292, 134, 315, 150);
    this.leg(ctx, top, 254, 114 + press, 300, 128, 322, 146);
    this.torso(ctx, top, 252, 112 + press, 198, 116 + press);
    this.arm(ctx, top, 202, 118 + press, 180, 144, 4);
    this.arm(ctx, top, 214, 118 + press, 232, 146, 6);
    this.head(ctx, top, 182, 107 + press, 10.5, -1);
    return { bot: { x: 176, y: 143 }, top: { x: 182, y: 107 } };
  },

  mount(ctx, top, bot, t) {
    const posture = Math.sin(t * 2.4) * 2.5;
    const grip = Math.sin(t * 5) * 3;
    /* bottom: flat, framing up */
    this.leg(ctx, bot, 240, 144, 268, 138, 292, 149);
    this.leg(ctx, bot, 243, 146, 274, 144, 297, 151);
    this.torso(ctx, bot, 240, 144, 190, 146);
    this.head(ctx, bot, 174, 143, 10.5, 1);
    this.arm(ctx, bot, 196, 144, 212, 120, -6);
    /* top: sitting astride the torso */
    this.leg(ctx, top, 212, 120, 190, 140, 184, 153);
    this.leg(ctx, top, 214, 120, 235, 138, 243, 152);
    this.torso(ctx, top, 212, 120, 212, 90 + posture);
    this.arm(ctx, top, 208, 96 + posture, 198 + grip, 112, 2);
    this.arm(ctx, top, 216, 96 + posture, 226 - grip, 112, 2);
    this.head(ctx, top, 212, 77 + posture, 10.5, -1);
    return { bot: { x: 174, y: 143 }, top: { x: 212, y: 77 } };
  },

  subCat(name) {
    const n = name || '';
    if (/HEEL|KNEE|ANKLE|LEG/.test(n)) return 'leg';
    if (/CHOKE|TRIANGLE|GUILLOTINE|DARCE|EZEKIEL|NORTH/.test(n)) return 'choke';
    return 'arm';
  },

  submission(ctx, atk, dfn, subName, t) {
    const cat = this.subCat(subName);
    ctx.save();
    ctx.translate(Math.sin(t * 18) * 1.3, 0); // strain tremble
    let heads;
    if (cat === 'arm') {
      /* armbar: defender flat, arm extended; attacker leaning back on it */
      this.leg(ctx, dfn, 200, 144, 228, 140, 250, 150);
      this.leg(ctx, dfn, 203, 146, 234, 144, 255, 151);
      this.torso(ctx, dfn, 200, 144, 155, 146);
      this.head(ctx, dfn, 140, 143, 10.5, 1, true);
      this.leg(ctx, atk, 245, 138, 218, 118, 196, 130);
      this.leg(ctx, atk, 248, 140, 224, 128, 203, 142);
      this.torso(ctx, atk, 245, 138, 280, 120);
      this.arm(ctx, atk, 278, 122, 227, 102, -4);
      this.arm(ctx, atk, 280, 126, 232, 106, -4);
      this.head(ctx, atk, 293, 111, 10.5, -1);
      this.arm(ctx, dfn, 160, 144, 225, 100 + Math.sin(t * 16) * 1.5, -14); // the arm in peril, on top
      heads = { atk: { x: 293, y: 111 }, dfn: { x: 140, y: 143 } };
    } else if (cat === 'choke') {
      /* rear choke: defender seated, attacker wrapped around from behind */
      this.leg(ctx, dfn, 205, 142, 180, 146, 160, 151);
      this.leg(ctx, dfn, 208, 144, 186, 148, 166, 153);
      this.torso(ctx, dfn, 205, 142, 200, 110);
      this.arm(ctx, dfn, 202, 114, 190, 98, -4);
      this.head(ctx, dfn, 198, 96, 10.5, 1, true);
      this.leg(ctx, atk, 250, 142, 252, 150, 268, 153);
      this.leg(ctx, atk, 253, 144, 260, 150, 275, 152);
      this.torso(ctx, atk, 250, 142, 220, 100);
      this.head(ctx, atk, 224, 86, 10.5, -1);
      this.bent(ctx, 222, 102, 200, 88, 185, 100, 6, atk.gi); // choking arm wraps the neck
      this.hand(ctx, atk, 185, 100);
      this.arm(ctx, atk, 226, 106, 208, 118, 2);
      heads = { atk: { x: 224, y: 86 }, dfn: { x: 198, y: 96 } };
    } else {
      /* leg lock: entangled, attacker leaning back with the ankle */
      this.leg(ctx, dfn, 185, 142, 205, 144, 222, 152);
      this.torso(ctx, dfn, 185, 142, 158, 116);
      this.arm(ctx, dfn, 160, 120, 150, 146, 6);
      this.head(ctx, dfn, 150, 104, 10.5, 1, true);
      this.leg(ctx, atk, 272, 140, 238, 130, 215, 140);
      this.leg(ctx, atk, 275, 142, 245, 140, 222, 148);
      this.torso(ctx, atk, 272, 140, 296, 118);
      this.head(ctx, atk, 305, 109, 10.5, -1);
      this.leg(ctx, dfn, 188, 140, 222, 126 - Math.sin(t * 16) * 1.5, 248, 114); // captured leg
      this.arm(ctx, atk, 294, 120, 250, 112, -6);
      this.arm(ctx, atk, 296, 124, 255, 118, -6);
      heads = { atk: { x: 305, y: 109 }, dfn: { x: 150, y: 104 } };
    }
    ctx.restore();
    /* alarm over the defender */
    ctx.fillStyle = '#c8483c';
    ctx.font = '16px Bungee, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!!', heads.dfn.x, heads.dfn.y - 18);
    return heads;
  },

  finale(ctx, winner, loser, byTap, t) {
    /* loser */
    if (byTap) {
      this.leg(ctx, loser, 230, 144, 258, 140, 282, 150);
      this.leg(ctx, loser, 233, 146, 264, 144, 287, 151);
      this.torso(ctx, loser, 230, 144, 180, 146);
      this.head(ctx, loser, 164, 143, 10.5, 1, true);
      const a = t * 8;
      const hx = 205 + Math.cos(a) * 14, hy = 146 - Math.abs(Math.sin(a)) * 20;
      this.arm(ctx, loser, 186, 144, hx, hy, -8);
      if (Math.abs(Math.sin(a)) < 0.25) { // the tap lands
        ctx.strokeStyle = '#10130f';
        ctx.lineWidth = 2;
        for (const [dx, dy] of [[-8, -4], [0, -7], [8, -4]]) {
          ctx.beginPath();
          ctx.moveTo(hx + dx * 0.6, hy + dy * 0.6);
          ctx.lineTo(hx + dx, hy + dy);
          ctx.stroke();
        }
      }
    } else {
      /* decision loss: seated, head hanging */
      this.leg(ctx, loser, 235, 142, 260, 140, 278, 150);
      this.torso(ctx, loser, 235, 142, 244, 112);
      this.arm(ctx, loser, 243, 116, 258, 146, 8);
      this.arm(ctx, loser, 240, 118, 226, 148, 8);
      this.head(ctx, loser, 248, 104, 10.5, 0, true);
    }
    /* winner: knees on the mat, arms up */
    const bounce = Math.abs(Math.sin(t * 4)) * 4;
    this.leg(ctx, winner, 150, 138, 140, 150, 128, 153);
    this.leg(ctx, winner, 153, 140, 160, 150, 172, 153);
    this.torso(ctx, winner, 150, 138, 150, 106 - bounce);
    this.arm(ctx, winner, 144, 110 - bounce, 122, 76 - bounce, -8);
    this.arm(ctx, winner, 156, 110 - bounce, 178, 74 - bounce, -8);
    this.head(ctx, winner, 150, 92 - bounce, 10.5, 1);
    return { winner: { x: 150, y: 92 - bounce }, loser: byTap ? { x: 164, y: 143 } : { x: 248, y: 104 } };
  },
};

/* ---------------- Game ---------------- */
const Game = {
  canvas: null, ctx: null, dpr: 1,
  low: null, lowCtx: null, resW: 480, resH: 270,
  frame: null, buf32: null,
  horizon: 92, focal: 260, camH: 46, followDist: 105, maxDist: 1300,
  spriteScale: 0.62,
  cam: { x: 0, y: 0, yaw: 0 },
  track: null, trackDef: TRACKS[0],
  playerChar: null,
  racers: [],
  state: 'menu',
  raceTime: 0,
  totalLaps: 3,
  input: { up: false, down: false, left: false, right: false },
  confetti: [],
  miniPts: null, miniBox: null,
  match: null, matchCdUntil: 0,
  puddles: [],

  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    window.addEventListener('resize', () => this.layout());
    this.bindInput();
    this.bindUI();
    this.bindAccountUi();
    this.checkMobile();
    Promise.all([ClaudeKit.init(), AuthKit.me()]).then(() => {
      this.refreshAccountUi();
      if (AuthKit.profile) this.applyProfile();
      else this.rollCharacter(true);
    });
    this.selectTrack(0);
    this.layout();
    // canvas text uses Bungee/Archivo — rebuild world art once fonts arrive
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.rebuildTrackArt());
    }
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.update(dt);
      this.render(now / 1000);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  /* ---------- layout ---------- */
  layout() {
    this.checkMobile();
    const w = window.innerWidth, h = window.innerHeight;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);

    this.resH = 270;
    this.resW = clamp(Math.round(this.resH * (w / h)), 200, 720);
    this.horizon = Math.round(this.resH * 0.34);
    this.focal = 260;
    this.low = document.createElement('canvas');
    this.low.width = this.resW;
    this.low.height = this.resH;
    this.lowCtx = this.low.getContext('2d');
    this.frame = this.lowCtx.createImageData(this.resW, this.resH);
    this.buf32 = new Uint32Array(this.frame.data.buffer);
    this.buildMinimap();
  },

  rebuildTrackArt() {
    if (!this.track) return;
    this.track.buildTexture();
    this.track.buildWall();
  },

  buildMinimap() {
    if (!this.track) return;
    const b = this.track.bounds;
    const MW = 150, MH = 110, PAD = 14;
    const sc = Math.min((MW - PAD * 2) / (b.maxX - b.minX), (MH - PAD * 2) / (b.maxY - b.minY));
    const ox = (MW - (b.maxX - b.minX) * sc) / 2 - b.minX * sc;
    const oy = (MH - (b.maxY - b.minY) * sc) / 2 - b.minY * sc;
    this.miniBox = { w: MW, h: MH, sc, ox, oy };
    this.miniPts = this.track.samples.map(p => [p.x * sc + ox, p.y * sc + oy]);
  },

  /* ---------- UI ---------- */
  bindUI() {
    const trackBtns = document.getElementById('track-buttons');
    TRACKS.forEach((t, i) => {
      const b = document.createElement('button');
      b.className = 'track-btn';
      b.innerHTML = `${t.name}<small>${t.sub}</small>`;
      b.addEventListener('click', () => { AudioKit.ensure(); this.selectTrack(i); });
      trackBtns.appendChild(b);
    });

    document.getElementById('btn-start').addEventListener('click', () => { AudioKit.ensure(); this.startRace(); });
    document.getElementById('btn-reroll').addEventListener('click', () => { AudioKit.ensure(); this.rollCharacter(); });
    document.getElementById('char-card').addEventListener('click', () => {
      AudioKit.ensure();
      if (AuthKit.profile) this.openProfileModal();
      else this.rollCharacter();
    });
    document.getElementById('btn-again').addEventListener('click', () => { AudioKit.ensure(); this.startRace(); });
    document.getElementById('btn-menu').addEventListener('click', () => {
      AudioKit.ensure();
      this.state = 'menu';
      document.getElementById('screen-results').classList.add('hidden');
      document.getElementById('hud').classList.add('hidden');
      document.getElementById('screen-card').classList.remove('hidden');
      this.rollCharacter();
    });
    document.getElementById('btn-demo').addEventListener('click', () => { AudioKit.ensure(); this.startDemoMatch(); });
    document.getElementById('btn-home-race').addEventListener('click', () => { AudioKit.ensure(); this.goHome(); });
    document.getElementById('btn-home-results').addEventListener('click', () => { AudioKit.ensure(); this.goHome(); });
    const muteBtn = document.getElementById('btn-mute');
    muteBtn.addEventListener('click', () => {
      AudioKit.ensure();
      AudioKit.muted = !AudioKit.muted;
      muteBtn.textContent = AudioKit.muted ? '🔇' : '🔊';
    });
  },

  /* ---------- account UI ---------- */
  profileToChar(p) {
    const rank = { white: 3, blue: 3, purple: 4, brown: 4, black: 5 }[p.belt] || 3;
    return {
      name: p.name,
      belt: p.belt,
      beltLabel: `${p.belt.toUpperCase()} BELT · ${p.stripes} STRIPE${p.stripes === 1 ? '' : 'S'}`,
      tag: p.bio || 'Fresh off the intro class. Scooting with heart.',
      gi: p.gi, skin: p.skin, hair: p.hair, hairColor: p.hairColor,
      stats: { scoot: rank, speed: rank, control: rank },
      fav: null,
      isProfile: true,
    };
  },

  applyProfile() {
    this._rollSeq = (this._rollSeq || 0) + 1; // cancel any in-flight roll
    document.getElementById('card-scouting').classList.add('hidden');
    this.playerChar = this.profileToChar(AuthKit.profile);
    this.fillCard();
    document.getElementById('char-card').classList.add('flipped');
    document.getElementById('btn-reroll').classList.add('hidden');
    this.refreshAccountUi();
  },

  refreshAccountUi() {
    const chip = document.getElementById('account-chip');
    if (!AuthKit.available) { chip.classList.add('hidden'); return; }
    chip.classList.remove('hidden');
    chip.textContent = AuthKit.profile ? `🥋 ${AuthKit.profile.name}` : '🔑 SIGN IN';
  },

  showModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.body.classList.add('modal-open');
  },
  hideModal(id) {
    document.getElementById(id).classList.add('hidden');
    if (!document.querySelector('.bs-modal:not(.hidden)')) {
      document.body.classList.remove('modal-open');
    }
  },

  bindAccountUi() {
    document.getElementById('account-chip').addEventListener('click', () => {
      AudioKit.ensure();
      if (AuthKit.profile) this.openProfileModal();
      else {
        document.getElementById('auth-error').classList.add('hidden');
        AuthKit.prefetch(); // ceremony can start instantly on button click
        this.showModal('modal-auth');
      }
    });
    document.querySelectorAll('.bs-close').forEach(b =>
      b.addEventListener('click', () => this.hideModal(b.dataset.close)));

    const authErr = e => {
      const raw = String(e?.message || e || 'something went wrong');
      const msg = raw.toLowerCase().includes('not focused')
        ? 'The page lost focus (a password-manager popup?). Click the page once, then try again.'
        : e?.name === 'NotAllowedError' || raw.toLowerCase().includes('not allowed')
          ? 'The passkey prompt was dismissed or timed out — try again.'
          : raw;
      const el = document.getElementById('auth-error');
      el.textContent = msg;
      el.classList.remove('hidden');
    };
    document.getElementById('btn-passkey-login').addEventListener('click', async () => {
      try {
        await AuthKit.login();
        this.hideModal('modal-auth');
        this.applyProfile();
      } catch (e) { authErr(e); }
    });
    document.getElementById('btn-passkey-register').addEventListener('click', async () => {
      try {
        const j = await AuthKit.register();
        this.hideModal('modal-auth');
        const codesEl = document.getElementById('recovery-codes');
        codesEl.innerHTML = '';
        for (const c of j.recoveryCodes || []) {
          const code = document.createElement('code');
          code.textContent = c;
          codesEl.appendChild(code);
        }
        this.showModal('modal-recovery');
        this.applyProfile();
      } catch (e) { authErr(e); }
    });
    document.getElementById('btn-recovery-done').addEventListener('click', () => {
      this.hideModal('modal-recovery');
      this.openProfileModal(); // straight into naming your grappler
    });

    document.getElementById('btn-signout').addEventListener('click', async () => {
      await AuthKit.logout();
      this.hideModal('modal-profile');
      document.getElementById('btn-reroll').classList.remove('hidden');
      this.refreshAccountUi();
      this.rollCharacter();
    });
    document.getElementById('btn-profile-save').addEventListener('click', async () => {
      const err = document.getElementById('profile-error');
      err.classList.add('hidden');
      try {
        await AuthKit.saveProfile({
          name: document.getElementById('pf-name').value,
          bio: document.getElementById('pf-bio').value,
          tone: document.getElementById('pf-tone').value,
          gi: this._pf.gi, skin: this._pf.skin,
          hair: this._pf.hair, hairColor: this._pf.hairColor,
        });
        this.hideModal('modal-profile');
        this.applyProfile();
      } catch (e) {
        err.textContent = e.message;
        err.classList.remove('hidden');
      }
    });
    /* live preview on typed fields */
    ['pf-name', 'pf-bio'].forEach(id =>
      document.getElementById(id).addEventListener('input', () => this.drawProfilePreview()));
  },

  openProfileModal() {
    const p = AuthKit.profile;
    if (!p) return;
    this._pf = { gi: p.gi, skin: p.skin, hair: p.hair, hairColor: p.hairColor };
    document.getElementById('pf-name').value = p.name;
    document.getElementById('pf-bio').value = p.bio;
    document.getElementById('pf-tone').value = p.tone;
    document.getElementById('profile-belt').textContent =
      `${p.belt.toUpperCase()} BELT · ${p.stripes} STRIPE${p.stripes === 1 ? '' : 'S'}`;
    document.getElementById('profile-points').textContent = `${p.matPoints} MAT POINTS`;
    document.getElementById('profile-error').classList.add('hidden');
    this.buildSwatches();
    this.drawProfilePreview();
    this.showModal('modal-profile');
  },

  buildSwatches() {
    const make = (elId, values, key, textLabels) => {
      const el = document.getElementById(elId);
      el.innerHTML = '';
      for (const v of values) {
        const b = document.createElement('button');
        b.className = 'swatch' + (textLabels ? ' swatch-txt' : '') + (this._pf[key] === v ? ' sel' : '');
        if (textLabels) b.textContent = v;
        else b.style.background = v;
        b.addEventListener('click', () => {
          this._pf[key] = v;
          this.buildSwatches();
          this.drawProfilePreview();
        });
        el.appendChild(b);
      }
    };
    make('sw-gi', GI_COLORS, 'gi');
    make('sw-skin', SKIN_TONES, 'skin');
    make('sw-hair', HAIR_STYLES, 'hair', true);
    make('sw-hairColor', HAIR_COLORS, 'hairColor');
  },

  drawProfilePreview() {
    const p = AuthKit.profile;
    if (!p || !this._pf) return;
    const c = document.getElementById('profile-preview');
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = this.trackDef.mat;
    ctx.beginPath(); ctx.roundRect(6, 6, 168, 168, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    for (let g = 48; g < 180; g += 42) {
      ctx.beginPath(); ctx.moveTo(g, 6); ctx.lineTo(g, 174); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, g); ctx.lineTo(174, g); ctx.stroke();
    }
    const fake = Object.create(Racer.prototype);
    fake.char = { ...this._pf, belt: p.belt };
    fake.x = 90; fake.y = 96;
    fake.heading = -Math.PI / 2;
    fake.phase = 1.2;
    fake.speed = 100;
    fake.boostTimer = 0;
    fake.bump = 0;
    ctx.save();
    ctx.translate(90, 96);
    ctx.scale(2.5, 2.5);
    ctx.translate(-90, -96);
    fake.drawTopDown(ctx);
    ctx.restore();
  },

  selectTrack(i) {
    this.trackDef = TRACKS[i];
    document.querySelectorAll('.track-btn').forEach((b, j) => b.classList.toggle('active', j === i));
    this.track = new Track(this.trackDef);
    this.track.buildTexture();
    this.track.buildWall();
    this.buildMinimap();
  },

  fillCard() {
    const ch = this.playerChar;
    document.getElementById('card-name').textContent = ch.name;
    document.getElementById('card-belt-label').textContent = ch.beltLabel;
    document.getElementById('card-tag').textContent = ch.tag;
    const belt = document.getElementById('card-belt');
    belt.style.background = BELT_COLORS[ch.belt];
    const statsEl = document.getElementById('card-stats');
    statsEl.innerHTML = '';
    for (const [key, label] of STAT_LABELS) {
      const row = document.createElement('div');
      row.className = 'stat-row';
      const pips = Array.from({ length: 5 }, (_, i) =>
        `<div class="stat-pip${i < ch.stats[key] ? ' on' : ''}"></div>`).join('');
      row.innerHTML = `<div class="stat-name">${label}</div><div class="stat-pips">${pips}</div>`;
      statsEl.appendChild(row);
    }
    this.drawPortrait(ch);
  },

  rollCharacter(first = false) {
    if (AuthKit.profile) { this.applyProfile(); return; } // your grappler is yours
    const card = document.getElementById('char-card');
    const scouting = document.getElementById('card-scouting');
    const seq = (this._rollSeq = (this._rollSeq || 0) + 1);
    if (!first) card.classList.remove('flipped');

    const pool = [...CHARACTERS, ...AI_ROSTER];
    const localPick = () => {
      const prev = this.playerChar;
      let next = pool[Math.floor(Math.random() * pool.length)];
      while (next === prev && pool.length > 1) next = pool[Math.floor(Math.random() * pool.length)];
      return next;
    };
    const finish = ch => {
      if (seq !== this._rollSeq) return; // superseded by a newer roll
      scouting.classList.add('hidden');
      this.playerChar = ch;
      this.fillCard();
      card.classList.add('flipped');
    };

    if (ClaudeKit.enabled) {
      scouting.classList.remove('hidden');
      generateCharacter().then(ch => {
        if (ch) {
          AI_ROSTER.push(ch);
          if (AI_ROSTER.length > 12) AI_ROSTER.shift();
          finish(ch);
        } else {
          finish(localPick());
        }
      });
    } else {
      setTimeout(() => finish(localPick()), first ? 450 : 420);
    }
  },

  drawPortrait(ch) {
    const c = document.getElementById('char-portrait');
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = this.trackDef.mat;
    ctx.beginPath();
    ctx.roundRect(10, 10, 200, 200, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    for (let g = 60; g < 210; g += 50) {
      ctx.beginPath(); ctx.moveTo(g, 10); ctx.lineTo(g, 210); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, g); ctx.lineTo(210, g); ctx.stroke();
    }
    const fake = Object.create(Racer.prototype);
    fake.char = ch;
    fake.x = 110; fake.y = 118;
    fake.heading = -Math.PI / 2;
    fake.phase = 1.2;
    fake.speed = 100;
    fake.boostTimer = 0;
    fake.bump = 0;
    fake.isPlayer = false;
    ctx.save();
    ctx.translate(110, 118);
    ctx.scale(3.1, 3.1);
    ctx.translate(-110, -118);
    fake.drawTopDown(ctx);
    ctx.restore();
  },

  /* ---------- navigation / modes ---------- */
  goHome() {
    this.state = 'menu';
    this.racers = [];
    this.player = null;
    (this.cdTimers || []).forEach(clearTimeout);
    if (this.match) {
      this.match = null;
      document.getElementById('sc-bubble').classList.add('hidden');
      document.getElementById('scramble').classList.add('hidden');
    }
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('countdown').classList.add('hidden');
    document.getElementById('screen-results').classList.add('hidden');
    document.getElementById('screen-card').classList.remove('hidden');
  },

  /* a friendly roll straight from the home page — no race attached */
  startDemoMatch() {
    if (this.isMobile || this.match || !this.playerChar) return;
    const mk = ch => ({
      char: ch, speed: 0, topSpeed: 200, boostTimer: 0, stunTimer: 0,
      x: 0, y: 0, scW: 0, scL: 0, scSubs: 0, finished: false,
    });
    const pool = [...CHARACTERS, ...AI_ROSTER].filter(c => c !== this.playerChar);
    const opp = mk(pool[Math.floor(Math.random() * pool.length)]);
    this.player = mk(this.playerChar);
    this.player.isPlayer = true;
    this.startMatch(opp, true);
  },

  checkMobile() {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    this.isMobile = (coarse && 'ontouchstart' in window) || window.innerWidth < 700;
    document.body.classList.toggle('mobile', this.isMobile);
    document.getElementById('mobile-note').classList.toggle('hidden', !this.isMobile);
  },

  /* ---------- race flow ---------- */
  startRace() {
    if (this.isMobile) return;
    document.getElementById('screen-card').classList.add('hidden');
    document.getElementById('screen-results').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    const others = [...CHARACTERS, ...AI_ROSTER].filter(c => c !== this.playerChar);
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    this.racers = [
      new Racer(this.playerChar, this.track, true, 0),
      ...others.slice(0, 3).map((c, i) => new Racer(c, this.track, false, i + 1)),
    ];
    this.player = this.racers[0];
    this.raceTime = 0;
    this.confetti = [];
    this.match = null;
    this.matchCdUntil = 0;
    this.puddles = [];
    for (const bag of this.track.bags) bag.activeAt = 0;
    document.getElementById('hud-item').classList.add('hidden');
    document.getElementById('scramble').classList.add('hidden');
    this.updateBestLapHud();

    this.cam.yaw = this.player.heading;
    this.cam.x = this.player.x - Math.cos(this.cam.yaw) * this.followDist;
    this.cam.y = this.player.y - Math.sin(this.cam.yaw) * this.followDist;

    this.state = 'countdown';
    const cd = document.getElementById('countdown');
    const cdt = document.getElementById('countdown-text');
    cd.classList.remove('hidden');
    const steps = [
      ['3', false], ['2', false], ['1', false], ['COMBATE!', true],
    ];
    (this.cdTimers || []).forEach(clearTimeout);
    this.cdTimers = steps.map(([txt, go], i) =>
      setTimeout(() => {
        cdt.textContent = txt;
        cdt.classList.toggle('go', go);
        cdt.style.animation = 'none';
        void cdt.offsetWidth;
        cdt.style.animation = '';
        AudioKit.beep(go);
        if (go) {
          this.state = 'race';
          setTimeout(() => cd.classList.add('hidden'), 800);
        }
      }, 700 * i + 300));
  },

  onPlayerFinish() {
    AudioKit.fanfare();
    for (let i = 0; i < 130; i++) {
      this.confetti.push({
        x: this.resW / 2, y: this.resH * 0.6,
        vx: (Math.random() - 0.5) * 260,
        vy: -Math.random() * 200 - 40,
        life: 1.6 + Math.random(),
        color: ['#f4c542', '#c8483c', '#3e8e6a', '#f3efe4', '#2e6fb5'][i % 5],
        size: 2 + Math.random() * 3,
      });
    }
    setTimeout(() => this.showResults(), 1700);
  },

  showResults() {
    this.state = 'finish';
    document.getElementById('hud').classList.add('hidden');
    const panel = document.getElementById('screen-results');
    panel.classList.remove('hidden');

    const ranked = [...this.racers].sort((a, b) => {
      if (a.finished && b.finished) return a.finishTime - b.finishTime;
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.progress - a.progress;
    });
    const place = ranked.indexOf(this.player) + 1;

    const medal = ['🥇', '🥈', '🥉', '🤕'][place - 1] || '🤕';
    document.getElementById('results-medal').textContent = medal;
    document.getElementById('results-title').textContent =
      place === 1 ? 'GOLD! OSS!' :
      place === 2 ? 'SILVER SCOOT' :
      place === 3 ? 'BRONZE BUNS' : 'GOT SWEPT';
    document.getElementById('results-sub').textContent =
      place === 1 ? 'PODIUM TOP SPOT · HANDS RAISED · BELT INTACT' :
      place === 4 ? 'THE MATS HUMBLE US ALL' : 'RESPECTABLE SCOOTING OUT THERE';

    const rows = document.getElementById('results-rows');
    rows.innerHTML = '';
    ranked.forEach((r, i) => {
      const div = document.createElement('div');
      div.className = 'results-row' + (r.isPlayer ? ' you' : '');
      div.innerHTML = `
        <span class="rr-pos">${i + 1}</span>
        <span class="rr-name">${r.char.name}${r.isPlayer ? ' (YOU)' : ''}</span>
        <span class="rr-time">${r.finished ? fmtTime(r.finishTime) : 'still scooting…'}</span>`;
      rows.appendChild(div);
    });

    const key = `buttscoot-best-${this.trackDef.id}`;
    const prevBest = parseFloat(localStorage.getItem(key));
    let recordNote = '';
    if (this.player.bestLap != null) {
      if (!isFinite(prevBest) || this.player.bestLap < prevBest) {
        localStorage.setItem(key, String(this.player.bestLap));
        recordNote = ' — <b>NEW MAT RECORD!</b>';
      }
    }
    /* ringside recap from Claude, slotted in when it arrives */
    const recapEl = document.getElementById('results-recap');
    recapEl.classList.add('hidden');
    this.fetchRecap(ranked, place).then(txt => {
      if (!txt || this.state !== 'finish') return;
      recapEl.innerHTML = '';
      const tag = document.createElement('b');
      tag.textContent = '🎙 RINGSIDE WITH CLAUDE';
      recapEl.appendChild(tag);
      recapEl.appendChild(document.createTextNode(txt));
      recapEl.classList.remove('hidden');
    });

    const subNote = this.player.scSubs ? ` (${this.player.scSubs} by submission!)` : '';
    const scLine = (this.player.scW || this.player.scL)
      ? `<br>Grappling matches: <b>${this.player.scW} won${subNote}</b> · ${this.player.scL} lost`
      : '';
    document.getElementById('results-times').innerHTML =
      `Your best lap: <b>${fmtTime(this.player.bestLap)}</b>${recordNote}<br>` +
      `${this.trackDef.name} record: ${fmtTime(isFinite(prevBest) ? Math.min(prevBest, this.player.bestLap ?? Infinity) : this.player.bestLap)}` +
      scLine;
  },

  /* ---------- grappling match minigame ----------
     Position ladder, player perspective:
       +3 full mount · +2 side control · +1 inside their guard
        0 neutral scoot-off
       -1 they're in your guard · -2 bottom side · -3 mounted
     Any submission ends the round instantly. 60s or it goes to a decision. */

  POS_NAMES: {
    3: 'FULL MOUNT — FINISH!', 2: 'SIDE CONTROL — YOU PASSED', 1: 'INSIDE THEIR GUARD',
    0: 'NEUTRAL — SCOOT-OFF',
    '-1': "THEY'RE IN YOUR GUARD", '-2': 'STUCK IN BOTTOM SIDE', '-3': 'MOUNTED — SURVIVE!',
  },
  SUB_NAMES: {
    3: ['ARMBAR', 'EZEKIEL CHOKE', 'ARM TRIANGLE'],
    2: ['KIMURA', 'AMERICANA', 'NORTH-SOUTH CHOKE'],
    1: ['GUILLOTINE', 'DARCE CHOKE'],
    0: ['IMANARI ROLL HEEL HOOK', 'FLYING ARMBAR'],
    '-1': ['TRIANGLE', 'OMOPLATA', 'ARMBAR FROM GUARD'],
    '-2': ['GHOST-ESCAPE DARCE', 'SCRAMBLE KNEEBAR'],
    '-3': ['HAIL-MARY WRIST LOCK'],
  },
  subChance(adv) {
    return { 3: 0.5, 2: 0.35, 1: 0.15, 0: 0.12, '-1': 0.28, '-2': 0.07, '-3': 0.05 }[adv] || 0.05;
  },

  /* belts tilt the odds on the mat — modestly, never decisively */
  BELT_RANK: { white: 0, blue: 1, purple: 2, brown: 3, black: 4, coral: 5 },
  beltMult(char) { return 0.85 + (this.BELT_RANK[char.belt] ?? 0) * 0.06; },
  gripFactor(mine, theirs) {
    return clamp(this.beltMult(mine) / this.beltMult(theirs), 0.8, 1.25);
  },
  statMult(v) { return 0.85 + v * 0.06; },

  startMatch(opp, demo = false) {
    const m = this.match = {
      opp, demo, t: 60, adv: 0,
      playerCd: 0, aiCd: 1.6, danger: null, guardUp: 0,
      over: false, closeT: 0, result: null,
      scenePhase: Math.random() * TAU,
      taunts: null, saidDominant: false, saidLosing: false,
      subFlash: 0, subFlashSub: null,
    };
    this.player.speed = opp.speed = 0;
    if (demo) document.getElementById('screen-card').classList.add('hidden');
    const rankDiff = (this.BELT_RANK[opp.char.belt] ?? 0) - (this.BELT_RANK[this.playerChar.belt] ?? 0);
    const threat = rankDiff >= 2 ? '  ⚠ HIGHER BELT — GOOD LUCK' : rankDiff <= -2 ? '  · LOWER BELT' : '';
    document.getElementById('sc-them').textContent = opp.char.name + threat;
    document.getElementById('sc-moves').classList.remove('hidden');
    document.getElementById('sc-result').classList.add('hidden');
    document.getElementById('sc-danger').classList.add('hidden');
    document.getElementById('sc-bubble').classList.add('hidden');
    document.getElementById('scramble').classList.remove('hidden');
    this.setFeed('Slap. Bump. GRAPPLE!');
    this.refreshMatchUi();
    AudioKit.whistle();

    /* Claude trash talk arrives async; the match never waits for it */
    this.fetchTaunts(opp).then(t => {
      if (this.match !== m || !t) return;
      m.taunts = t;
      if (t.opener) this.showBubble(opp, t.opener);
    });
  },

  async fetchTaunts(opp) {
    const ch = opp.char;
    const system =
      'You write PG trash talk for BUTTSCOOT GP, a comedy game where jiu-jitsu players ' +
      'butt-scoot around race tracks and settle collisions with grappling matches. ' +
      'All lines are spoken BY the opponent character, in their voice. Each line under ' +
      '12 words. Playful gym-culture humor: guard pulling, leg locks, cardio, gi snobbery. ' +
      'Never mean-spirited.';
    const toneNote = AuthKit.profile
      ? ` The player has asked for "${AuthKit.profile.tone}" style trash talk — write every line in that flavor.`
      : '';
    const prompt =
      `Opponent: ${ch.name} (${ch.beltLabel}). Personality: "${ch.tag}". ` +
      `Favorite move: ${ch.fav || 'unpredictable'}. They are grappling the player, ${this.playerChar.name}.${toneNote}\n` +
      'Respond with ONLY this JSON:\n' +
      '{"opener":"line as the match starts","dominant":"line while they are winning",' +
      '"losing":"line while they are losing","subAttempt":"line while locking a submission",' +
      '"gotDefended":"line after the player escapes their attack",' +
      '"victory":"line after they win","defeat":"line after they lose"}';
    const j = ClaudeKit.json(await ClaudeKit.ask(system, prompt, 380, 6000));
    if (!j) return null;
    const out = {};
    for (const k of ['opener', 'dominant', 'losing', 'subAttempt', 'gotDefended', 'victory', 'defeat']) {
      if (typeof j[k] === 'string' && j[k].trim()) out[k] = j[k].trim().slice(0, 110);
    }
    return out;
  },

  showBubble(opp, line) {
    if (!line) return;
    const el = document.getElementById('sc-bubble');
    el.innerHTML = '';
    const who = document.createElement('b');
    who.textContent = opp.char.name;
    el.appendChild(who);
    el.appendChild(document.createTextNode(`“${line}”`));
    el.classList.remove('hidden');
    clearTimeout(this._bubbleTimer);
    this._bubbleTimer = setTimeout(() => el.classList.add('hidden'), 3800);
  },

  setFeed(msg) {
    document.getElementById('sc-feed').textContent = msg;
  },

  refreshMatchUi() {
    const m = this.match;
    if (!m) return;
    document.getElementById('sc-position').textContent = this.POS_NAMES[m.adv];
    document.getElementById('sc-marker').style.left = `${((m.adv + 3) / 6) * 100}%`;
    document.getElementById('sc-sub-name').textContent = this.SUB_NAMES[m.adv][0];
    this.refreshMatchClock(true);
  },

  refreshMatchClock(force) {
    const m = this.match;
    const secs = Math.max(0, Math.ceil(m.t));
    if (!force && secs === m.lastClock) return;
    m.lastClock = secs;
    const el = document.getElementById('sc-round');
    el.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    el.classList.toggle('low', secs <= 10 && !m.over);
  },

  changeAdv(delta) {
    const m = this.match;
    m.adv = clamp(m.adv + delta, -3, 3);
    this.refreshMatchUi();
    if (m.taunts) {
      if (m.adv >= 2 && !m.saidLosing) { m.saidLosing = true; this.showBubble(m.opp, m.taunts.losing); }
      else if (m.adv <= -2 && !m.saidDominant) { m.saidDominant = true; this.showBubble(m.opp, m.taunts.dominant); }
    }
  },

  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

  playerAct(kind) {
    const m = this.match;
    if (!m || m.over || m.playerCd > 0) return;

    const name = m.opp.char.name;

    /* defend: escape a locked submission, or frame up to stuff their next move */
    if (kind === 'defend') {
      m.playerCd = 0.6;
      if (m.danger) {
        m.danger = null;
        document.getElementById('sc-danger').classList.add('hidden');
        document.querySelector('[data-move="defend"]').classList.remove('defend-glow');
        this.changeAdv(1);
        this.setFeed('DEFENDED! You scrambled out. (+1 position)');
        if (m.taunts?.gotDefended) this.showBubble(m.opp, m.taunts.gotDefended);
      } else {
        m.guardUp = 2.5;
        this.setFeed('You framed up — their next advance gets stuffed.');
      }
      AudioKit.squeak();
      return;
    }

    m.playerCd = 0.75;
    const rel = this.gripFactor(this.playerChar, m.opp.char);
    const st = this.playerChar.stats;

    if (kind === 'advance') {
      /* explosive hips (scoot power) drive the pass */
      const p = clamp((0.65 - m.adv * 0.1) * this.statMult(st.scoot) * rel, 0.15, 0.9);
      if (Math.random() < p) {
        this.changeAdv(1);
        this.setFeed(this.pick(['Knee slice! Position improved.', 'Pressure like rent is due. (+1)', 'Hip switch — you advanced!']));
        AudioKit.squeak();
      } else {
        this.setFeed(this.pick(['Stuffed — their frames held.', 'Grips broken. No advance.', `${name} shut that down.`]));
        AudioKit.bump();
      }
    } else if (kind === 'sweep') {
      /* mat control drives sweeps */
      const p = clamp((0.3 + (m.adv < 0 ? 0.28 : 0)) * this.statMult(st.control) * rel, 0.1, 0.85);
      if (Math.random() < p) {
        this.changeAdv(2);
        this.setFeed(this.pick(['SWEPT! The crowd gasps. (+2)', 'Huge reversal! (+2)', 'Old-school sweep — beautiful. (+2)']));
        AudioKit.scWin();
      } else {
        this.setFeed(this.pick(['Sweep rolled off — they based out.', 'They posted a hand. Nothing there.']));
        AudioKit.bump();
      }
    } else if (kind === 'submit') {
      const sub = this.pick(this.SUB_NAMES[m.adv]);
      m.subFlash = 0.8;       // show the attack pose in the scene
      m.subFlashSub = sub;
      const p = clamp(this.subChance(m.adv) * this.statMult(st.control) * rel, 0.03, 0.75);
      if (Math.random() < p) {
        this.player.scSubs++;
        this.endMatch({ type: 'sub', sub });
        return;
      }
      if (m.adv > 0) {
        this.changeAdv(-1);
        this.setFeed(`${sub} attempt slipped — you burned position! (-1)`);
      } else {
        this.setFeed(`${sub} attempt — ${name} wriggled free.`);
      }
      AudioKit.bump();
    } else if (kind === 'gloat') {
      if (Math.random() < 0.6) {
        m.aiCd += 1.3;
        this.setFeed(`You gloated. ${name} is FLUSTERED — they hesitate.`);
        AudioKit.scWin();
      } else {
        this.changeAdv(-1);
        this.setFeed(`You gloated mid-roll. ${name} made you pay. (-1)`);
        AudioKit.scLose();
      }
    }
  },

  aiAct() {
    const m = this.match;
    const ch = m.opp.char;
    const oppAdv = -m.adv;
    const name = ch.name;
    const aggro = this.gripFactor(ch, this.playerChar);

    let action;
    if (oppAdv >= 2) action = Math.random() < (ch.fav === 'submit' ? 0.6 : 0.42) ? 'submit' : 'pass';
    else if (oppAdv >= 0) action = Math.random() < 0.62 ? 'pass' : (Math.random() < 0.6 ? 'sweep' : 'submit');
    else action = Math.random() < 0.62 ? 'sweep' : 'pass';

    if (action === 'submit') {
      const sub = this.pick(this.SUB_NAMES[oppAdv]);
      m.danger = { t: 1.05, sub };
      const dEl = document.getElementById('sc-danger');
      dEl.textContent = `⚠ ${name} LOCKS UP A ${sub} — HIT D TO DEFEND!`;
      dEl.classList.remove('hidden');
      document.querySelector('[data-move="defend"]').classList.add('defend-glow');
      if (m.taunts?.subAttempt && Math.random() < 0.7) this.showBubble(m.opp, m.taunts.subAttempt);
      AudioKit.scLose();
    } else if (action === 'pass') {
      const p = clamp(0.55 - oppAdv * 0.09, 0.15, 0.75) * this.statMult(ch.stats.scoot) * aggro;
      if (m.guardUp > 0) {
        m.guardUp = 0;
        this.setFeed(`${name} pushed in — your frames held! Blocked.`);
        AudioKit.squeak();
      } else if (Math.random() < p) {
        this.changeAdv(-1);
        this.setFeed(`${name} improved position! (-1)`);
        AudioKit.bump();
      } else {
        this.setFeed(this.pick([`${name} pushed forward — you held them off.`, `${name} hunting grips…`]));
      }
    } else {
      const p = (0.26 + (oppAdv < 0 ? 0.26 : 0)) * this.statMult(ch.stats.control) * aggro;
      if (m.guardUp > 0) {
        m.guardUp = 0;
        this.setFeed(`${name} tried to sweep — your base held! Blocked.`);
        AudioKit.squeak();
      } else if (Math.random() < p) {
        this.changeAdv(-2);
        this.setFeed(`${name} REVERSED you! (-2)`);
        AudioKit.scLose();
      } else {
        this.setFeed(`${name} tried a sweep — you based out.`);
      }
    }
  },

  updateMatch(dt) {
    const m = this.match;

    if (m.over) {
      m.closeT -= dt;
      this.drawMatchScene(dt); // keep animating the tap / celebration
      if (m.closeT <= 0) this.closeMatch();
      return;
    }

    m.t -= dt;
    m.playerCd = Math.max(0, m.playerCd - dt);
    m.subFlash = Math.max(0, m.subFlash - dt);
    m.guardUp = Math.max(0, (m.guardUp || 0) - dt);
    const cooling = m.playerCd > 0.05;
    if (cooling !== m.coolShown) {
      m.coolShown = cooling;
      document.getElementById('sc-moves').classList.toggle('cooling', cooling);
    }

    if (m.danger) {
      m.danger.t -= dt;
      if (m.danger.t <= 0) {
        const sub = m.danger.sub;
        const oppAdv = -m.adv;
        m.danger = null;
        document.getElementById('sc-danger').classList.add('hidden');
        document.querySelector('[data-move="defend"]').classList.remove('defend-glow');
        const ch = m.opp.char;
        const p = clamp(
          this.subChance(oppAdv) * 1.15 * this.statMult(ch.stats.control) * this.gripFactor(ch, this.playerChar),
          0.03, 0.8);
        if (Math.random() < p) {
          this.endMatch({ type: 'subbed', sub });
          return;
        }
        this.setFeed(`You survived the ${sub}! Barely.`);
      }
    } else {
      m.aiCd -= dt;
      if (m.aiCd <= 0) {
        this.aiAct();
        m.aiCd = 1.25 + Math.random() * 0.8;
      }
    }

    this.refreshMatchClock(false);
    this.drawMatchScene(dt);

    if (m.t <= 0) {
      if (m.adv > 0) this.endMatch({ type: 'points' });
      else if (m.adv < 0) this.endMatch({ type: 'pointsLoss' });
      else this.endMatch({ type: 'draw' });
    }
  },

  endMatch(result) {
    const m = this.match;
    m.over = true;
    m.result = result;
    m.closeT = 2.6;
    m.danger = null;
    document.getElementById('sc-danger').classList.add('hidden');
    document.getElementById('sc-moves').classList.add('hidden');
    document.querySelector('[data-move="defend"]').classList.remove('defend-glow');
    const outEl = document.getElementById('sc-outcome');
    outEl.classList.remove('good', 'bad');
    const name = m.opp.char.name;

    if (result.type === 'sub') {
      outEl.textContent = `TAP!! ${result.sub}! ${name} SUBMITTED!`;
      outEl.classList.add('good');
      this.player.scW++;
      AudioKit.fanfare();
    } else if (result.type === 'points') {
      outEl.textContent = `TIME! YOU WIN ON POSITION — JUDGES LOVED IT.`;
      outEl.classList.add('good');
      this.player.scW++;
      AudioKit.scWin();
    } else if (result.type === 'draw') {
      outEl.textContent = `TIME! DEAD EVEN — REF SHRUGS, RACE ON.`;
      AudioKit.bump();
    } else if (result.type === 'pointsLoss') {
      outEl.textContent = `TIME! ${name} TAKES THE DECISION.`;
      outEl.classList.add('bad');
      this.player.scL++;
      AudioKit.scLose();
    } else {
      outEl.textContent = `YOU TAPPED TO THE ${result.sub}. THE CROWD SAW EVERYTHING.`;
      outEl.classList.add('bad');
      this.player.scL++;
      AudioKit.scLose();
    }
    document.getElementById('sc-result').classList.remove('hidden');
    if (m.taunts) {
      const won = result.type === 'sub' || result.type === 'points';
      const lost = result.type === 'subbed' || result.type === 'pointsLoss';
      if (won && m.taunts.defeat) this.showBubble(m.opp, m.taunts.defeat);
      else if (lost && m.taunts.victory) this.showBubble(m.opp, m.taunts.victory);
    }
  },

  closeMatch() {
    const m = this.match;
    if (m.demo) {
      /* demo roll from the home page: just return to the menu */
      this.match = null;
      this.player = null;
      document.getElementById('sc-bubble').classList.add('hidden');
      document.getElementById('scramble').classList.add('hidden');
      document.getElementById('screen-card').classList.remove('hidden');
      return;
    }
    const opp = m.opp, pl = this.player;

    /* separate them so they don't instantly re-collide */
    let nx = opp.x - pl.x, ny = opp.y - pl.y;
    const d = Math.hypot(nx, ny) || 1;
    nx /= d; ny /= d;
    opp.x += nx * 22; opp.y += ny * 22;
    pl.x -= nx * 8; pl.y -= ny * 8;

    const r = m.result.type;
    if (r === 'sub') {
      pl.boostTimer = 1.6; pl.speed = pl.topSpeed * 1.5;
      opp.stunTimer = 3.2;
    } else if (r === 'points') {
      pl.boostTimer = 1.2; pl.speed = pl.topSpeed * 1.35;
      opp.stunTimer = 1.8;
    } else if (r === 'subbed') {
      pl.stunTimer = 3.0;
      opp.boostTimer = 1.4; opp.speed = opp.topSpeed * 1.4;
    } else if (r === 'pointsLoss') {
      pl.stunTimer = 1.8;
      opp.boostTimer = 1.1; opp.speed = opp.topSpeed * 1.3;
    } else {
      pl.speed = 60; opp.speed = 60;
    }
    this.matchCdUntil = this.raceTime + 10;
    this.match = null;
    document.getElementById('sc-bubble').classList.add('hidden');
    document.getElementById('scramble').classList.add('hidden');
  },

  /* side-view scene of the two grapplers in their actual position */
  drawMatchScene(dt) {
    const m = this.match;
    const c = document.getElementById('sc-scene');
    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;
    m.scenePhase += dt;
    const t = m.scenePhase;
    const pl = this.playerChar, op = m.opp.char;

    /* --- pick the pose, flash on change --- */
    let key;
    if (m.over) key = 'end:' + m.result.type;
    else if (m.danger) key = 'subOpp:' + m.danger.sub;
    else if (m.subFlash > 0) key = 'subPl:' + m.subFlashSub;
    else key = 'adv:' + m.adv;
    if (key !== m.sceneKey) { m.sceneKey = key; m.sceneFlashT = 0.26; }
    m.sceneFlashT = Math.max(0, (m.sceneFlashT || 0) - dt);

    /* --- gym backdrop --- */
    const WALL = 62;
    const grad = ctx.createLinearGradient(0, 0, 0, WALL);
    grad.addColorStop(0, '#0b0f0d');
    grad.addColorStop(1, '#1a221d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, WALL);
    ctx.fillStyle = 'rgba(243,239,228,0.05)';
    ctx.font = '26px Bungee, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUTTSCOOT GP', w / 2, 42);
    const pennCols = [this.trackDef.mat, this.trackDef.border, '#f4c542'];
    for (let x = 14, i = 0; x < w; x += 34, i++) {
      ctx.fillStyle = pennCols[i % 3];
      ctx.beginPath();
      ctx.moveTo(x, 8); ctx.lineTo(x + 14, 8); ctx.lineTo(x + 7, 22);
      ctx.closePath(); ctx.fill();
    }
    /* mats */
    ctx.fillStyle = this.trackDef.mat;
    ctx.fillRect(0, WALL, w, h - WALL);
    ctx.fillStyle = 'rgba(243,239,228,0.7)';
    ctx.fillRect(0, WALL, w, 3);
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 2;
    for (let g = 55; g < w; g += 55) {
      ctx.beginPath(); ctx.moveTo(g, WALL); ctx.lineTo(g, h); ctx.stroke();
    }

    /* --- fighters --- */
    let youHead = null;
    if (key.startsWith('end:')) {
      const r = m.result.type;
      const playerWon = r === 'sub' || r === 'points';
      const byTap = r === 'sub' || r === 'subbed';
      if (r === 'draw') {
        const heads = MatchScene.neutral(ctx, pl, op, t * 0.3);
        youHead = heads.left;
      } else {
        const heads = MatchScene.finale(ctx, playerWon ? pl : op, playerWon ? op : pl, byTap, t);
        youHead = playerWon ? heads.winner : heads.loser;
      }
    } else if (key.startsWith('subOpp:')) {
      const heads = MatchScene.submission(ctx, op, pl, m.danger.sub, t);
      youHead = heads.dfn;
    } else if (key.startsWith('subPl:')) {
      const heads = MatchScene.submission(ctx, pl, op, m.subFlashSub, t);
      youHead = heads.atk;
    } else if (m.adv === 0) {
      youHead = MatchScene.neutral(ctx, pl, op, t).left;
    } else {
      const playerTop = m.adv > 0;
      const top = playerTop ? pl : op;
      const bot = playerTop ? op : pl;
      const a = Math.abs(m.adv);
      const heads =
        a === 1 ? MatchScene.guard(ctx, top, bot, t) :
        a === 2 ? MatchScene.side(ctx, top, bot, t) :
        MatchScene.mount(ctx, top, bot, t);
      youHead = playerTop ? heads.top : heads.bot;
    }

    /* --- scramble burst on pose change --- */
    if (m.sceneFlashT > 0) {
      const a = m.sceneFlashT / 0.26;
      ctx.save();
      ctx.globalAlpha = a * 0.85;
      ctx.strokeStyle = '#f3efe4';
      ctx.lineWidth = 3;
      const cx = w / 2, cy = h / 2 + 12;
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * TAU + 0.4;
        const r1 = 34 + (i % 3) * 12, r2 = r1 + 26 * a;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1 * 0.6);
        ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2 * 0.6);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* --- danger vignette --- */
    if (m.danger) {
      ctx.strokeStyle = `rgba(200,72,60,${0.5 + 0.5 * Math.sin(t * 12)})`;
      ctx.lineWidth = 7;
      ctx.strokeRect(0, 0, w, h);
    }

    /* --- YOU tag --- */
    if (youHead) {
      ctx.font = '700 11px "Chivo Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(16,19,15,0.85)';
      const ty = youHead.y - 24;
      ctx.beginPath();
      ctx.roundRect(youHead.x - 20, ty - 9, 40, 15, 4);
      ctx.fill();
      ctx.fillStyle = '#f4c542';
      ctx.fillText('YOU', youHead.x, ty + 2.5);
    }
  },

  async fetchRecap(ranked, place) {
    const p = this.player;
    const lines = ranked.map((r, i) =>
      `${i + 1}. ${r.char.name}${r.isPlayer ? ' (THE PLAYER)' : ''} — ${r.finished ? fmtTime(r.finishTime) : 'did not finish'}`);
    const system =
      'You are the over-caffeinated ringside announcer for BUTTSCOOT GP, a comedy ' +
      'jiu-jitsu butt-scooting race. High energy, BJJ-literate, PG.';
    const prompt =
      `Race just ended on ${this.trackDef.name}. Final standings:\n${lines.join('\n')}\n` +
      `The player raced as ${p.char.name}, best lap ${fmtTime(p.bestLap)}. ` +
      `Grappling matches during the race: ${p.scW} won (${p.scSubs} by submission), ${p.scL} lost.\n` +
      (AuthKit.profile ? `Style the recap with a "${AuthKit.profile.tone}" flavor. ` : '') +
      'Give a 2-sentence recap, max 45 words, plain text only, no emoji.';
    const txt = await ClaudeKit.ask(system, prompt, 200, 9000);
    return txt ? txt.trim().replace(/\s+/g, ' ').slice(0, 400) : null;
  },

  toast(msg) {
    const el = document.getElementById('hud-toast');
    el.textContent = msg;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  },

  updateBestLapHud() {
    const key = `buttscoot-best-${this.trackDef.id}`;
    const stored = parseFloat(localStorage.getItem(key));
    const best = Math.min(
      isFinite(stored) ? stored : Infinity,
      this.player?.bestLap ?? Infinity);
    document.getElementById('hud-best').textContent = isFinite(best) ? fmtTime(best) : '—';
  },

  /* ---------- input ---------- */
  bindInput() {
    const map = {
      ArrowUp: 'up', KeyW: 'up',
      ArrowDown: 'down', KeyS: 'down',
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right',
    };
    const scMap = {
      KeyA: 'advance', KeyS: 'sweep', KeyD: 'defend', KeyF: 'submit', KeyG: 'gloat',
    };
    window.addEventListener('keydown', e => {
      if (this.match && !this.match.over) {
        const m = scMap[e.code];
        if (m) { e.preventDefault(); AudioKit.ensure(); this.playerAct(m); }
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.state === 'race' && this.player && !this.match) {
          AudioKit.ensure();
          this.useItem(this.player);
        }
        return;
      }
      const k = map[e.code];
      if (k) { this.input[k] = true; e.preventDefault(); AudioKit.ensure(); }
    });
    window.addEventListener('keyup', e => {
      const k = map[e.code];
      if (k) { this.input[k] = false; e.preventDefault(); }
    });
  },

  /* ---------- sim ---------- */
  update(dt) {
    /* a grappling match (mid-race or demo roll from the menu) owns the clock */
    if (this.match) { this.updateMatch(dt); return; }

    if (this.state === 'menu') return;

    if (this.state === 'race') this.raceTime += dt;

    for (const r of this.racers) r.update(dt, this.input, this);

    for (let i = 0; i < this.racers.length; i++) {
      for (let j = i + 1; j < this.racers.length; j++) {
        const a = this.racers[i], b = this.racers[j];
        const R = 26;
        const d2 = dist2(a.x, a.y, b.x, b.y);
        if (d2 < R * R && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const nx = (b.x - a.x) / d, ny = (b.y - a.y) / d;
          const overlap = (R - d) / 2;
          a.x -= nx * overlap; a.y -= ny * overlap;
          b.x += nx * overlap; b.y += ny * overlap;
          const aFlow = a.flowTimer > 0, bFlow = b.flowTimer > 0;
          if (aFlow !== bFlow) {
            /* flow-roller barges through; the other gets shoved off line */
            const dir = aFlow ? 1 : -1;
            const victim = aFlow ? b : a;
            victim.x += nx * 22 * dir; victim.y += ny * 22 * dir;
            victim.speed *= 0.55;
            victim.bump = 1;
          } else {
            a.speed *= 0.9; b.speed *= 0.9;
          }
          if (a.bump < 0.1 && (a.isPlayer || b.isPlayer)) AudioKit.bump();
          a.bump = b.bump = 1;

          /* a real collision with the player starts a grappling match */
          const pl = a.isPlayer ? a : (b.isPlayer ? b : null);
          const other = pl === a ? b : a;
          if (
            pl && this.state === 'race' && !this.match &&
            this.raceTime > this.matchCdUntil &&
            !pl.finished && !other.finished &&
            pl.stunTimer <= 0 && other.stunTimer <= 0 &&
            pl.flowTimer <= 0 && other.flowTimer <= 0 &&
            Math.max(a.speed, b.speed) > 70
          ) {
            this.startMatch(other);
          }
        }
      }
    }

    /* chase camera */
    if (this.player) {
      const p = this.player;
      const k = 1 - Math.exp(-6 * dt);
      this.cam.yaw = angleLerp(this.cam.yaw, p.heading, k);
      this.cam.x = p.x - Math.cos(this.cam.yaw) * this.followDist;
      this.cam.y = p.y - Math.sin(this.cam.yaw) * this.followDist;
    }

    for (const c of this.confetti) {
      c.life -= dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += 240 * dt;
    }
    this.confetti = this.confetti.filter(c => c.life > 0);

    if (this.state === 'race' && this.player) {
      const rank = [...this.racers].sort((x, y) => {
        if (x.finished && y.finished) return x.finishTime - y.finishTime;
        if (x.finished) return -1;
        if (y.finished) return 1;
        return y.progress - x.progress;
      });
      rank.forEach((r, i) => { r.rank = i + 1; });
      this.updateItems(dt);
      document.getElementById('hud-lap').textContent = Math.min(this.totalLaps, this.player.lap);
      document.getElementById('hud-time').textContent = fmtTime(this.raceTime);
      document.getElementById('hud-pos').textContent = this.player.rank;
    }
  },

  /* ---------- items ---------- */
  rollItem(rank) {
    const table = {
      1: [['flow', 0.5], ['puddle', 0.4], ['acai', 0.1]],
      2: [['flow', 0.35], ['puddle', 0.35], ['acai', 0.3]],
      3: [['flow', 0.25], ['puddle', 0.25], ['acai', 0.5]],
      4: [['flow', 0.15], ['puddle', 0.15], ['acai', 0.7]],
    }[clamp(rank, 1, 4)];
    let roll = Math.random();
    for (const [item, w] of table) { if ((roll -= w) <= 0) return item; }
    return 'acai';
  },

  updateItems(dt) {
    for (const r of this.racers) {
      if (r.finished) continue;

      /* gear bag pickups */
      if (!r.item) {
        for (const bag of this.track.bags) {
          if (this.raceTime < bag.activeAt) continue;
          if (dist2(r.x, r.y, bag.x, bag.y) < 28 * 28) {
            bag.activeAt = this.raceTime + 5;
            r.item = this.rollItem(r.rank);
            r.aiItemAt = this.raceTime + 1 + Math.random() * 3;
            if (r.isPlayer) {
              AudioKit.pickup();
              this.updateItemHud();
              this.toast(`${ITEM_DEFS[r.item].icon} ${ITEM_DEFS[r.item].name}!`);
            }
            break;
          }
        }
      } else if (!r.isPlayer) {
        /* AI: açaí the instant they're dazed, otherwise use on their own clock */
        if ((r.item === 'acai' && r.stunTimer > 0) || this.raceTime >= r.aiItemAt) {
          this.useItem(r);
        }
      }

      /* mystery puddle slips */
      for (let i = this.puddles.length - 1; i >= 0; i--) {
        const p = this.puddles[i];
        if (this.raceTime < p.armAt) continue;
        if (p.owner === r && this.raceTime < p.armAt + 1.2) continue;
        if (dist2(r.x, r.y, p.x, p.y) < 26 * 26) {
          this.puddles.splice(i, 1);
          r.slipTimer = 1.3;
          r.speed *= 0.35;
          r.bump = 1;
          AudioKit.slip();
          if (r.isPlayer) this.toast('SLIPPED ON A MYSTERY PUDDLE! EW!');
        }
      }
    }
  },

  useItem(r) {
    const it = r.item;
    if (!it) return;
    r.item = null;
    if (it === 'flow') {
      r.flowTimer = 6;
      if (r.isPlayer) { this.toast('FLOW STATE — BUMP FREELY!'); AudioKit.flowOn(); }
    } else if (it === 'acai') {
      r.stunTimer = 0;
      r.slipTimer = 0;
      r.boostTimer = 1.8;
      r.speed = Math.max(r.speed, r.topSpeed * 1.55);
      if (r.isPlayer) { this.toast('AÇAÍ POWER!'); AudioKit.slurp(); }
    } else if (it === 'puddle') {
      this.puddles.push({
        x: r.x - Math.cos(r.heading) * 48,
        y: r.y - Math.sin(r.heading) * 48,
        owner: r,
        armAt: this.raceTime + 0.4,
      });
      if (r.isPlayer) { this.toast('PUDDLE DEPLOYED. GROSS.'); AudioKit.splat(); }
    }
    if (r.isPlayer) this.updateItemHud();
  },

  updateItemHud() {
    const el = document.getElementById('hud-item');
    const it = this.player?.item;
    if (!it) { el.classList.add('hidden'); return; }
    document.getElementById('hud-item-icon').textContent = ITEM_DEFS[it].icon;
    document.getElementById('hud-item-label').textContent = ITEM_DEFS[it].name;
    el.classList.remove('hidden');
  },

  /* ---------- mode-7 scene ---------- */
  renderScene(t) {
    const W = this.resW, H = this.resH, hor = this.horizon, f = this.focal;
    const tr = this.track;
    const cam = this.cam;
    const p = this.player;

    /* camera bobs with the player's scooting rhythm */
    let camH = this.camH;
    if (p) camH += Math.max(0, Math.sin(p.phase)) * Math.min(1, p.speed / 60) * 2.5 + p.bump * 3;

    const fwdX = Math.cos(cam.yaw), fwdY = Math.sin(cam.yaw);
    const rightX = -fwdY, rightY = fwdX;

    /* --- ground plane, one perspective row at a time --- */
    const tex = tr.texData, texW = tr.texW, texH = tr.texH;
    const bx = tr.bounds.minX, by = tr.bounds.minY;
    const out = tr.outColor;
    const buf = this.buf32;
    buf.fill(0, 0, (hor + 1) * W); // sky rows: wall image is drawn over these

    for (let y = hor + 1; y < H; y++) {
      const z = camH * f / (y - hor);
      let idx = y * W;
      if (z > this.maxDist) {
        buf.fill(out, idx, idx + W);
        continue;
      }
      const worldPerPx = z / f;
      let wx = cam.x + fwdX * z - rightX * worldPerPx * (W / 2) - bx;
      let wy = cam.y + fwdY * z - rightY * worldPerPx * (W / 2) - by;
      const stepX = rightX * worldPerPx;
      const stepY = rightY * worldPerPx;
      for (let x = 0; x < W; x++) {
        const tx = wx | 0, ty = wy | 0;
        buf[idx++] = (tx >= 0 && ty >= 0 && tx < texW && ty < texH) ? tex[ty * texW + tx] : out;
        wx += stepX; wy += stepY;
      }
    }
    this.lowCtx.putImageData(this.frame, 0, 0);

    const ctx = this.lowCtx;

    /* --- gym wall above the horizon, parallax with camera yaw --- */
    if (tr.wall) {
      const wallW = tr.wall.width;
      const fovFrac = (2 * Math.atan((W / 2) / f)) / TAU; // fraction of the wall visible
      const visW = wallW * fovFrac;
      let srcX = ((-cam.yaw / TAU) * wallW) % wallW;
      if (srcX < 0) srcX += wallW;
      const destH = hor + 2;
      if (srcX + visW <= wallW) {
        ctx.drawImage(tr.wall, srcX, 0, visW, tr.wall.height, 0, 0, W, destH);
      } else {
        const w1 = wallW - srcX;
        const d1 = (w1 / visW) * W;
        ctx.drawImage(tr.wall, srcX, 0, w1, tr.wall.height, 0, 0, d1, destH);
        ctx.drawImage(tr.wall, 0, 0, visW - w1, tr.wall.height, d1, 0, W - d1, destH);
      }
    }

    /* --- distance haze at the horizon --- */
    const fog = ctx.createLinearGradient(0, hor, 0, hor + 44);
    fog.addColorStop(0, this.trackDef.floor);
    fog.addColorStop(1, this.trackDef.floor + '00');
    ctx.fillStyle = fog;
    ctx.fillRect(0, hor, W, 46);

    /* --- projection helper for world points --- */
    const project = (wx, wy) => {
      const relX = wx - cam.x, relY = wy - cam.y;
      const zf = relX * fwdX + relY * fwdY;
      if (zf < 8 || zf > this.maxDist) return null;
      const lat = relX * rightX + relY * rightY;
      return { zf, sx: W / 2 + (lat * f) / zf, sy: hor + (camH * f) / zf };
    };

    /* --- mystery puddles: ground decals, before everything upright --- */
    for (const pd of this.puddles) {
      const pr = project(pd.x, pd.y);
      if (!pr) continue;
      const rx = (26 * f) / pr.zf;
      if (pr.sx < -rx || pr.sx > W + rx) continue;
      ctx.fillStyle = 'rgba(96,160,215,0.5)';
      ctx.beginPath();
      ctx.ellipse(pr.sx, pr.sy, rx, rx * 0.32, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(230,245,255,0.5)';
      ctx.lineWidth = Math.max(1, rx * 0.06);
      ctx.stroke();
    }

    /* --- sprites, far to near --- */
    const sprites = [];
    for (const r of this.racers) {
      const pr = project(r.x, r.y);
      if (!pr || pr.sx < -80 || pr.sx > W + 80) continue;
      sprites.push({ ...pr, r });
    }
    for (const bag of tr.bags) {
      if (this.raceTime < bag.activeAt) continue;
      const pr = project(bag.x, bag.y);
      if (!pr || pr.sx < -60 || pr.sx > W + 60) continue;
      sprites.push({ ...pr, bag });
    }
    sprites.sort((a, b) => b.zf - a.zf);
    for (const s of sprites) {
      const sc = Math.min((f / s.zf) * this.spriteScale, 4.2);
      ctx.save();
      ctx.translate(s.sx, s.sy);
      ctx.scale(sc, sc);
      if (s.bag) this.drawBagSprite(ctx, t, s.bag.s * 50);
      else s.r.drawSprite(ctx, angleWrap(s.r.heading - cam.yaw));
      ctx.restore();
    }

    /* --- confetti (screen space) --- */
    for (const c of this.confetti) {
      ctx.globalAlpha = clamp(c.life, 0, 1);
      ctx.fillStyle = c.color;
      ctx.fillRect(c.x - c.size / 2, c.y - c.size / 2, c.size, c.size * 0.7);
    }
    ctx.globalAlpha = 1;

    /* --- boost speed streaks at screen edges --- */
    if (p && p.boostTimer > 0) {
      ctx.strokeStyle = 'rgba(244,197,66,0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const yy = Math.random() * H;
        const side = i % 2 === 0 ? 0 : W;
        const len = 30 + Math.random() * 40;
        ctx.beginPath();
        ctx.moveTo(side, yy);
        ctx.lineTo(side + (side === 0 ? len : -len), yy);
        ctx.stroke();
      }
    }
  },

  /* gym duffel with a "?" patch — the item pickup */
  drawBagSprite(ctx, t, seed) {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 4, 0, 0, TAU);
    ctx.fill();
    const bob = Math.sin(t * 3 + seed) * 2;
    ctx.save();
    ctx.translate(0, -bob);
    ctx.fillStyle = '#23282c';
    ctx.strokeStyle = 'rgba(16,19,15,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(-12, -18, 24, 16, 5); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -18, 6, Math.PI, TAU); ctx.stroke(); // strap
    ctx.fillStyle = '#f4c542';
    ctx.beginPath(); ctx.arc(0, -10, 6, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#10130f';
    ctx.font = '900 9px Archivo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', 0, -7);
    ctx.restore();
  },

  drawMinimap(ctx, w, h) {
    if (!this.miniPts || !this.racers.length) return;
    const { w: MW, h: MH } = this.miniBox;
    const px = 16, py = h - MH - 16;
    ctx.save();
    ctx.translate(px, py);
    ctx.fillStyle = 'rgba(12,17,14,0.65)';
    ctx.beginPath();
    ctx.roundRect(0, 0, MW, MH, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(243,239,228,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    this.miniPts.forEach((pt, i) => i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]));
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.lineWidth = 9;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.strokeStyle = this.trackDef.mat;
    ctx.lineWidth = 6;
    ctx.stroke();

    /* start line tick */
    const s0 = this.miniPts[0];
    ctx.fillStyle = '#f3efe4';
    ctx.fillRect(s0[0] - 2, s0[1] - 2, 4, 4);

    /* racers + hazards */
    const { sc, ox, oy } = this.miniBox;
    for (const pd of this.puddles) {
      ctx.beginPath();
      ctx.arc(pd.x * sc + ox, pd.y * sc + oy, 2.5, 0, TAU);
      ctx.fillStyle = 'rgba(120,180,230,0.9)';
      ctx.fill();
    }
    for (const r of this.racers) {
      const mx = r.x * sc + ox, my = r.y * sc + oy;
      ctx.beginPath();
      ctx.arc(mx, my, r.isPlayer ? 4 : 3, 0, TAU);
      ctx.fillStyle = r.isPlayer ? '#f4c542' : BELT_COLORS[r.char.belt];
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.stroke();
    }
    ctx.restore();
  },

  /* side-view of your racer mid-scoot, so nobody mistakes what's happening */
  drawScootCam(ctx, w, h) {
    const p = this.player;
    if (!p || !p.char) return;
    const CW = 158, CH = 96;
    const px = w - CW - 14, py = h - CH - 66;
    ctx.save();
    ctx.translate(px, py);
    ctx.fillStyle = 'rgba(12,17,14,0.65)';
    ctx.beginPath(); ctx.roundRect(0, 0, CW, CH, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(243,239,228,0.2)';
    ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.roundRect(0, 0, CW, CH, 10); ctx.clip();

    const ch = p.char;
    const mv = Math.min(1, p.speed / 60);
    const ph = p.phase;
    const bob = Math.max(0, Math.sin(ph)) * mv * 3;
    const G = 80;

    /* mat line */
    ctx.strokeStyle = 'rgba(243,239,228,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(8, G + 6); ctx.lineTo(CW - 8, G + 6); ctx.stroke();

    /* speed lines behind */
    if (p.speed > 100) {
      ctx.strokeStyle = p.boostTimer > 0 ? 'rgba(244,197,66,0.8)' : 'rgba(243,239,228,0.35)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const yy = 42 + i * 14;
        const len = 10 + ((ph * 60 + i * 23) % 16);
        ctx.beginPath(); ctx.moveTo(28 - len, yy); ctx.lineTo(28, yy); ctx.stroke();
      }
    }

    const hipX = 66, hipY = G - 6 - bob * 0.4;
    const kick = Math.sin(ph) * 9 * mv;
    /* pushing arm behind, legs kicking forward, torso leaned back, head proud */
    MatchScene.arm(ctx, ch, hipX - 12, hipY - 22 - bob, hipX - 27 - Math.max(0, Math.sin(ph)) * 5 * mv, G + 3, 4, 5);
    MatchScene.leg(ctx, ch, hipX, hipY, hipX + 22, hipY - 8 - Math.max(0, kick) * 0.5, hipX + 42 + kick, G + 3, 6);
    MatchScene.leg(ctx, ch, hipX + 2, hipY + 2, hipX + 20, hipY - 4 + Math.max(0, kick) * 0.4, hipX + 40 - kick, G + 5, 6);
    MatchScene.torso(ctx, ch, hipX, hipY, hipX - 10, hipY - 28 - bob, 13);
    MatchScene.arm(ctx, ch, hipX - 6, hipY - 24 - bob, hipX + 15, hipY - 14 - bob, 4, 5);
    MatchScene.head(ctx, ch, hipX - 13, hipY - 40 - bob, 8.5, 1, p.stunTimer > 0);

    ctx.font = '700 9px "Chivo Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(244,197,66,0.9)';
    ctx.fillText('SCOOT CAM · YOU', 10, 15);
    ctx.restore();
  },

  /* ---------- present ---------- */
  render(t) {
    const ctx = this.ctx;
    const w = window.innerWidth, h = window.innerHeight;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.state === 'menu' || !this.track?.texData) {
      ctx.fillStyle = '#0c110e';
      ctx.fillRect(0, 0, w, h);
      return;
    }

    /* the world is frozen during a grappling match — draw it once and stop
       repainting so the overlay isn't fighting a full-screen redraw */
    if (this.match) {
      if (this.matchBgDrawn) return;
      this.matchBgDrawn = true;
    } else {
      this.matchBgDrawn = false;
    }

    this.renderScene(t);

    /* upscale, chunky pixels on purpose */
    ctx.imageSmoothingEnabled = false;
    let shakeX = 0, shakeY = 0;
    if (this.player && this.player.bump > 0) {
      shakeX = (Math.random() - 0.5) * 8 * this.player.bump;
      shakeY = (Math.random() - 0.5) * 6 * this.player.bump;
    }
    ctx.drawImage(this.low, shakeX, shakeY, w, h);

    /* crisp screen-space overlays */
    ctx.imageSmoothingEnabled = true;
    this.drawMinimap(ctx, w, h);
    this.drawScootCam(ctx, w, h);
  },
};

window.addEventListener('DOMContentLoaded', () => Game.init());
