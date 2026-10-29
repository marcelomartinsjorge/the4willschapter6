/* ==========================================================================
   MOTOR DO LIVRO INTERATIVO · As Quatro Vontades · Capítulo VI (Kronk)
   A base é o motor do Cap. V (escolha só depois de "Próxima", sons e vozes
   presos ao parágrafo com "Continuar", pontuação da jornada, tela final no
   estilo Telltale). Sai a Luz e o odre do Aheryn. Entra o que é do Kronk:
   - a NÉVOA do Cap. III nas sete primeiras idades (abre onde o dedo passa);
   - COMER (segurar) no fim de cada idade, e a névoa fecha: é o sono;
   - o NARIZ: o codex do Kronk, cada cheiro com o nome que ele deu;
   - a FOME, só aos 21, sem barra: ouvido (ronco), olho (a cor some, menos
     na comida), texto (linhas curtas e a barriga em CAPS âmbar) e mão
     (a opção da barriga nasce embaixo do dedo);
   - OLHAR ATÉ PARAR (segurar enquanto a respiração espaça e para);
   - os afetos escondidos (Hessa, o velho, Dorgh, Ikk, Gup) e os avisos.
   Todo arquivo de mídia é opcional: o que falta vira silêncio, um som feito
   por código, ou a imagem provisória que vem no pacote.
   O roteiro vem de window.LIVRO (capitulo6.js); os jogos, de window.JOGOS6
   (jogos6.js) e window.BATALHA6 (batalha6.js).
   ========================================================================== */
(() => {
'use strict';
const L = window.LIVRO, CFG = window.CHAPTER_CONFIG || {}, CODEX = CFG.codex || {}, ZONES = Object.assign({}, CFG.zones || {}, L.zonas || {});
const SUPA = { url: 'https://qoxvlgscpljsrybywivf.supabase.co', key: 'sb_publishable_XvoczGgXZGAezAmabNUBrQ_r25L-7ga' };
const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const H264 = !!document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"');
const vsrc = (u) => (H264 || !/\.mp4$/.test(u) ? u : u.replace(/\.mp4$/, '.webm'));
const SAVE_KEY = 'livro_' + L.id;
let LANG = 'en'; try { LANG = localStorage.getItem('livro_lang') || 'en'; } catch (e) {}
const EN = window.LIVRO_EN || {};
const tr = (t) => (LANG === 'en' && t != null ? (EN[t] != null ? EN[t] : t) : t);
const UI = window.LIVRO_UI;
const U = (k) => UI[LANG][k];
const BOT = () => !!window.__JOGO_BOT;

// ---------------------------------------------------------------- estado
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); }));
const novoEstado = () => ({ i: 0, fome: 0, af: { hessa: 0, velho: 0, dorgh: 0, ikk: 0, gup: 0 }, acredita: 0, f: {}, escolhas: {}, feitos: {}, jogos: {}, nariz: [], sessao: uuid() });
let st = novoEstado();
const salvar = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(st)); } catch (e) {} };
const carregar = () => { try { const j = JSON.parse(localStorage.getItem(SAVE_KEY)); return j && j.sessao ? j : null; } catch (e) { return null; } };
let ANTES = {}; try { ANTES = JSON.parse(localStorage.getItem('aqv_estado') || '{}') || {}; } catch (e) {}
window.AQV_ANTES = ANTES;
const P = L.paginas;
const visivel = (p) => !p.se || p.se(st);
const idxVis = (from, dir) => { let i = from + dir; while (i >= 0 && i < P.length && !visivel(P[i])) i += dir; return i; };

// ---------------------------------------------------------------- áudio (Web Audio)
const AC = window.AudioContext || window.webkitAudioContext;
const A = {
  ctx: null, bufs: {}, zone: null, narr: null, on: true,
  init() {
    if (this.ctx || !AC) return; this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
    this.bed = this.ctx.createGain(); this.bed.connect(this.master);
    this.fx = this.ctx.createGain(); this.fx.gain.value = .85; this.fx.connect(this.master);
    const n = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.noise = n;
  },
  resume() { this.ctx && this.ctx.state === 'suspended' && this.ctx.resume(); },
  async buf(url) {
    if (!this.ctx) return null;
    if (this.bufs[url]) return this.bufs[url];
    const p = fetch(url).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject())).then((ab) => new Promise((res, rej) => this.ctx.decodeAudioData(ab, res, rej))).catch(() => null);
    this.bufs[url] = p; return p;
  },
  async loop(url, vol, fade = 1.5) {
    const b = await this.buf(url); if (!b) return null;
    const s = this.ctx.createBufferSource(); s.buffer = b; s.loop = true;
    const g = this.ctx.createGain(); g.gain.value = 0; s.connect(g); g.connect(this.bed); s.start();
    g.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + fade);
    return { s, g };
  },
  stop(h, fade = 1.5) { if (!h || !this.ctx) return; const t = this.ctx.currentTime; h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(h.g.gain.value, t); h.g.gain.linearRampToValueAtTime(0, t + fade); setTimeout(() => { try { h.s.stop(); } catch (e) {} (h.extra || []).forEach((x) => { try { x.stop(); } catch (e) {} }); }, fade * 1000 + 100); },
  // cama sonora de reserva enquanto o arquivo da zona não existe: vento ou fogo baixo
  sintetico(tipo, vol) {
    const c = this.ctx, g = c.createGain(); g.gain.value = 0; g.connect(this.bed);
    const s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = tipo === 'fogo' ? 900 : 420; f.Q.value = tipo === 'fogo' ? .5 : .7;
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = tipo === 'fogo' ? .6 : .07; lg.gain.value = tipo === 'fogo' ? 300 : 260; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    s.connect(f); f.connect(g); s.start();
    g.gain.linearRampToValueAtTime(vol * (tipo === 'fogo' ? .18 : .32), c.currentTime + 2.5);
    return { s, g, extra: [lfo] };
  },
  async setZone(z) {
    if (!this.ctx || z === this.zone) return; this.zone = z;
    const old = this.zoneH; this.zoneH = null; this.stop(old, 2);
    const cfg = ZONES[z]; if (!cfg) return;
    let h = cfg.src ? await this.loop(cfg.src, cfg.volume * .8, 2.2) : null;
    if (!h && cfg.reserva) h = this.sintetico(cfg.reserva, cfg.volume);
    if (this.zone === z) this.zoneH = h; else this.stop(h, .3);
  },
  async once(url, vol = .7) { const b = await this.buf(url); if (!b) return 0; const s = this.ctx.createBufferSource(); s.buffer = b; const g = this.ctx.createGain(); g.gain.value = vol; s.connect(g); g.connect(this.fx); s.start(); return b.duration; },
  async narrate(url, onEnd, fila) {
    if (fila && (this.narr || this.carregando)) { (this.fila = this.fila || []).push([url, onEnd]); return true; }
    this.stopNarr(true); this.carregando = true; const b = await this.buf(url); this.carregando = false;
    if (!b) { const q = this.fila && this.fila.shift(); if (q && !this.narr) this.narrate(q[0], q[1]); return false; }
    const s = this.ctx.createBufferSource(); s.buffer = b; s.connect(this.master); s.start();
    this.duck(true); this.narr = s; s.onended = () => { if (this.narr === s) { this.narr = null; this.duck(false); onEnd && onEnd(); const q = this.fila && this.fila.shift(); if (q) this.narrate(q[0], q[1]); } };
    return true;
  },
  stopNarr(manterFila) { if (!manterFila) this.fila = []; if (this.narr) { const s = this.narr; this.narr = null; try { s.stop(); } catch (e) {} this.duck(false); } },
  duck(on) { if (!this.ctx) return; const t = this.ctx.currentTime; this.bed.gain.cancelScheduledValues(t); this.bed.gain.setTargetAtTime(on ? .25 : 1, t, .25); },
  setOn(on) { this.on = on; if (this.master) this.master.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, .1); },
  tone(f, d, type = 'sine', v = .08, when = 0, bend = 0) {
    if (!this.ctx) return; const t = this.ctx.currentTime + when, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (bend) o.frequency.exponentialRampToValueAtTime(f * bend, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(this.fx); o.start(t); o.stop(t + d + .05);
  },
  hiss(d, f, q, v, when = 0, type = 'bandpass') {
    if (!this.ctx) return; const t = this.ctx.currentTime + when, s = this.ctx.createBufferSource(); s.buffer = this.noise;
    const fl = this.ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = this.ctx.createGain();
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + d * .3); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(fl); fl.connect(g); g.connect(this.fx); s.start(t); s.stop(t + d + .05);
  },
  // sfx: toca assets/audio/sfx/<nome>.mp3; se ainda não existir, a reserva feita por código
  async sfx(nome, vol = .6, reserva) { if (!this.ctx) return 0; const d = await this.once('assets/audio/sfx/' + nome + '.mp3', vol); if (!d && reserva) reserva(); return d; },
  virar() { this.sfx('pagina', .35, () => this.hiss(.35, 2400, .7, .05)); },
  escolha() { this.tone(196, .5, 'sine', .05); this.tone(294, .6, 'sine', .035, .06); },
  aviso() { this.tone(220, .9, 'triangle', .03); this.tone(330, 1.1, 'sine', .02, .1); },
  // o ronco da fome: dois tons graves, quase sentidos mais do que ouvidos
  ronco(forca = .5) { const k = 1 + Math.floor(Math.random() * 3); this.sfx('ronco' + k, .45 + forca * .45, () => { const v = .05 + forca * .1; this.tone(58, 1.1, 'sine', v, 0, .72); this.tone(41, 1.4, 'triangle', v * .8, .55, .8); this.hiss(1.2, 120, .9, v * .6, .1, 'lowpass'); }); },
  // o nariz: duas fungadas (o grakh-bufa do Cap. V serve)
  fareja() { this.sfx('fareja', .5, () => { this.hiss(.22, 700, .8, .08); this.hiss(.26, 650, .8, .08, .28); }); },
  // mastigar: osso e carne, em ciclos
  mastiga() { this.sfx('mastigar', .55, () => { this.hiss(.14, 1100, .8, .09); this.tone(90, .12, 'sine', .07); this.hiss(.1, 700, .9, .05, .18); }); },
  respira(k = 0) { this.sfx('respira', .5 - k * .06, () => { this.hiss(1.1 - k * .08, 520, .7, .08 - k * .01); }); },
  ultimoAr() { this.sfx('ultimo-ar', .55, () => { this.hiss(2.6, 3800, .4, .07, 0, 'highpass'); }); },
  marreta() { this.sfx('marreta', .9, () => { this.tone(60, .5, 'sine', .3, 0, .5); this.hiss(.3, 300, .6, .25, 0, 'lowpass'); }); },
};

// ---------------------------------------------------------------- fundos
const bgWrap = $('#bg');
let bgKey = '';
const resolveFundo = (p) => (st.fundoPag && st.fundoPag[p.id]) || (typeof p.fundo === 'function' ? p.fundo(st) : p.fundo);
function setFundo(f) {
  if (!f) return; const key = JSON.stringify(f); if (key === bgKey) return; bgKey = key;
  const layer = document.createElement('div');
  layer.className = 'bgl kb-' + (f.kb || 'in') + (f.tint ? ' tint-' + f.tint : '');
  layer.style.setProperty('--dim', f.dim != null ? f.dim : .5);
  layer.style.setProperty('--foco', f.foco || '50% 40%');
  if (f.video || f.clip) {
    const v = document.createElement('video'); v.src = vsrc(f.video || f.clip); v.muted = true; v.loop = !f.umaVez; v.playsInline = true; v.setAttribute('playsinline', ''); v.autoplay = true;
    v.style.objectPosition = f.foco || '50% 40%'; v.className = 'img';
    if (f.img) v.poster = f.img; layer.appendChild(v); v.play().catch(() => {});
  } else { const im = document.createElement('div'); im.className = 'img'; im.style.backgroundImage = `url("${f.img}")`; layer.appendChild(im); }
  // a máscara da fome: só a comida e a água ficam com cor quando a imagem perde a cor
  if (f.mascara && f.img && !f.video && !f.clip) {
    const c = document.createElement('div'); c.className = 'img cor'; c.style.backgroundImage = `url("${f.img}")`;
    c.style.webkitMaskImage = c.style.maskImage = `url("${f.mascara}")`; layer.appendChild(c);
  }
  bgWrap.appendChild(layer);
  document.body.classList.toggle('lado-dir', f.lado === 'dir');
  Clima.set(f.clima || null);
  requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add('on')));
  const olds = [...bgWrap.children].filter((c) => c !== layer);
  setTimeout(() => olds.forEach((o) => o.remove()), 1600);
}

// ---------------------------------------------------------------- clima: areia no vento, brasas, estrelas
const Clima = (() => {
  const cv = $('#fx'), cx = cv.getContext('2d'); let modo = null, alvo = 0, dens = 0, parts = [], t0 = performance.now();
  const PERFIS = {
    areia: { n: 110, cor: '232,196,140', vy: [-3, 8], vx: [30, 90], r: [.4, 1.5], a: [.12, .45], wob: 14 },
    poeira: { n: 60, cor: '236,214,170', vy: [-4, 6], vx: [-5, 8], r: [.5, 1.8], a: [.1, .4], wob: 10 },
    brasas: { n: 40, cor: '255,180,100', vy: [-22, -6], vx: [-6, 6], r: [.6, 1.8], a: [.25, .8], wob: 10, pisca: true },
    estrelas: { n: 70, cor: '230,236,255', vy: [0, 0], vx: [0, 0], r: [.4, 1.2], a: [.15, .7], wob: 0, pisca: true },
    cinza: { n: 70, cor: '186,180,170', vy: [4, 14], vx: [-6, 8], r: [.4, 1.4], a: [.08, .35], wob: 8 },
  };
  const rs = () => { const d = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); };
  addEventListener('resize', rs); rs();
  const rnd = (a) => a[0] + Math.random() * (a[1] - a[0]);
  const novo = (pf) => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: rnd(pf.vx), vy: rnd(pf.vy), r: rnd(pf.r), a: rnd(pf.a), ph: Math.random() * 6.28 });
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.max(0, Math.min((now - last) / 1000, .05)); last = now;
    dens = Math.max(0, dens + (alvo - dens) * Math.min(1, dt * 1.5));
    cx.clearRect(0, 0, innerWidth, innerHeight);
    const pf = PERFIS[modo];
    if (pf) {
      const n = Math.max(0, Math.round(pf.n * dens * (innerWidth < 700 ? .55 : 1)) || 0);
      while (parts.length < n) parts.push(novo(pf));
      if (parts.length > n) parts.length = n;
      const tt = (now - t0) / 1000;
      for (const q of parts) {
        q.x += (q.vx + Math.sin(tt * .6 + q.ph) * pf.wob * .3) * dt; q.y += q.vy * dt;
        if (q.y > innerHeight + 10 || q.y < -12 || q.x < -20 || q.x > innerWidth + 20) { Object.assign(q, novo(pf)); if (q.vx > 20) q.x = -10; if (q.vy < 0) q.y = innerHeight + 6; }
        const al = q.a * (pf.pisca ? .55 + .45 * Math.sin(tt * 2.4 + q.ph * 3) : 1) * dens;
        cx.beginPath(); cx.fillStyle = `rgba(${pf.cor},${al.toFixed(3)})`; cx.arc(q.x, q.y, q.r, 0, 6.283); cx.fill();
      }
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return { set(m) { if (m === modo) return; if (matchMedia('(prefers-reduced-motion: reduce)').matches) m = null; modo = m; parts = []; dens = 0; alvo = m ? 1 : 0; } };
})();

// ---------------------------------------------------------------- a névoa (Cap. III): cobre a lembrança e abre onde o dedo passa
const Nevoa = (() => {
  const cv = $('#nevoa'), cx = cv.getContext('2d');
  let alvo = 0, v = 0, px = -1, py = -1, tp = 0;
  const blobs = Array.from({ length: 18 }, () => ({ x: Math.random(), y: Math.random(), r: .18 + Math.random() * .28, vx: (Math.random() - .5) * .006, vy: (Math.random() - .5) * .003, a: .14 + Math.random() * .14, f: Math.random() * 6 }));
  const mexe = (e) => { px = e.clientX; py = e.clientY; tp = performance.now(); };
  addEventListener('pointermove', mexe, { passive: true }); addEventListener('pointerdown', mexe, { passive: true });
  const tam = () => { cv.width = Math.ceil(innerWidth / 4); cv.height = Math.ceil(innerHeight / 4); };
  tam(); addEventListener('resize', tam);
  const quadro = (t) => {
    v += (alvo - v) * .025;
    const W = cv.width, H = cv.height, m = Math.max(W, H);
    cx.globalCompositeOperation = 'source-over'; cx.clearRect(0, 0, W, H);
    if (v > .005) {
      // fechada de tudo (o sono): uma camada lisa por baixo das nuvens
      if (v > 1) { cx.fillStyle = `rgba(28,22,16,${Math.min(1, (v - 1) * 6)})`; cx.fillRect(0, 0, W, H); }
      for (const b of blobs) {
        b.x += b.vx * .016; b.y += b.vy * .016;
        if (b.x < -.3) b.x = 1.3; if (b.x > 1.3) b.x = -.3; if (b.y < -.3) b.y = 1.3; if (b.y > 1.3) b.y = -.3;
        const a = Math.min(.9, b.a * Math.min(v, 1) * 1.6 * (.75 + .25 * Math.sin(t / 3000 + b.f))), r = b.r * m;
        const g = cx.createRadialGradient(b.x * W, b.y * H, 0, b.x * W, b.y * H, r);
        g.addColorStop(0, `rgba(206,192,170,${a})`); g.addColorStop(1, 'rgba(206,192,170,0)');
        cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      }
      const idade = (performance.now() - tp) / 1000;
      if (px >= 0 && idade < 4 && v <= 1) {
        const x = px / 4, y = py / 4, r = Math.min(W, H) * .34, k = 1 - idade / 4;
        cx.globalCompositeOperation = 'destination-out';
        const g = cx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(0,0,0,${.9 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      }
    }
    requestAnimationFrame(quadro);
  };
  requestAnimationFrame(quadro);
  return { set(a) { alvo = a || 0; }, fecha() { alvo = 1.25; }, get v() { return v; } };
})();

// ---------------------------------------------------------------- codex (verbetes impessoais)
function aliasesAtuais() {
  const out = [];
  for (const [id, c] of Object.entries(CODEX)) {
    const al = LANG === 'en' ? (c.aliasesEn || [c.en && c.en.title]) : (c.aliasesPt || [c.pt && c.pt.title]);
    for (const a of al.filter(Boolean)) out.push([a, id]);
  }
  return out.sort((a, b) => b[0].length - a[0].length);
}
const esc = (t) => String(t).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const linkUsados = new Set();
function linkify(text) {
  let html = esc(text);
  for (const [a, id] of aliasesAtuais()) {
    if (linkUsados.has(id)) continue;
    const re = new RegExp(`(^|[^\\p{L}])(${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![\\p{L}])`, 'u');
    if (re.test(html)) { html = html.replace(re, `$1<button class="gloss" data-codex="${id}">$2</button>`); linkUsados.add(id); }
  }
  return html;
}
function abrirCodex(id) {
  const c = CODEX[id]; if (!c) return; const t = c[LANG] || c.pt || c.en; let pg = 0;
  const m = $('#codex'); $('#cxImg').style.backgroundImage = `url("${c.image}")`; $('#cxEye').textContent = t.eyebrow || ''; $('#cxTitle').textContent = t.title;
  const draw = () => { $('#cxText').innerHTML = t.pages[pg].map((p) => `<p>${esc(p)}</p>`).join(''); $('#cxPg').textContent = `${pg + 1} / ${t.pages.length}`; $('#cxPrev').disabled = pg === 0; $('#cxNext').disabled = pg === t.pages.length - 1; };
  $('#cxPrev').onclick = () => { pg--; draw(); }; $('#cxNext').onclick = () => { pg++; draw(); };
  draw(); m.classList.add('show'); A.tone(330, .5, 'sine', .03);
}
document.addEventListener('click', (e) => { const g = e.target.closest('.gloss'); if (g) { e.preventDefault(); abrirCodex(g.dataset.codex); } });
$('#cxClose').onclick = () => $('#codex').classList.remove('show');

function toast(t) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = t; $('#toasts').appendChild(el); A.aviso(); setTimeout(() => el.classList.add('out'), 3800); setTimeout(() => el.remove(), 4600); }

// ---------------------------------------------------------------- O NARIZ: o que o nariz guardar
// Cada cheiro novo entra com o nome que o Kronk deu e uma linha na voz dele.
// Um cheiro que volta acende o nome em ouro, por um momento. Ninguém diz o que ele significa.
const NARIZ = L.nariz || {};
const nomeCheiro = (id) => { const n = NARIZ[id]; if (!n) return id; return tr(typeof n.nome === 'function' ? n.nome(st) : n.nome); };
const linhaCheiro = (id) => { const n = NARIZ[id]; if (!n) return ''; return tr(typeof n.linha === 'function' ? n.linha(st) : n.linha); };
function desenhaNariz() {
  const b = $('#narizBtn'); if (!b) return;
  b.querySelector('.qt').textContent = st.nariz.length; b.hidden = !st.nariz.length;
}
let narizFixo = null;
function cheiro(id, modo) {
  if (!NARIZ[id]) return;
  const novo = !st.nariz.includes(id);
  if (novo && modo !== 'treme') {
    st.nariz.push(id); salvar(); desenhaNariz(); registrar('nariz_' + id, '1');
    A.fareja();
    const el = document.createElement('div'); el.className = 'cheiro-novo';
    el.innerHTML = `<small>${esc(U('narizNovo'))}</small><b>${esc(nomeCheiro(id))}</b><span>${esc(linhaCheiro(id))}</span>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    const b = $('#narizBtn'); b && (b.classList.remove('pulsa'), void b.offsetWidth, b.classList.add('pulsa'));
    setTimeout(() => el.classList.remove('on'), 5200); setTimeout(() => el.remove(), 6000);
    return;
  }
  // o cheiro antigo volta: o nome acende em ouro (e pode ficar, ou tremer e apagar)
  A.fareja();
  const el = document.createElement('div'); el.className = 'cheiro-acende' + (modo === 'treme' ? ' treme' : '') + (modo === 'fica' ? ' fica' : '');
  el.textContent = nomeCheiro(id);
  if (modo === 'fica') { if (narizFixo) narizFixo.remove(); narizFixo = el; document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on')); return; }
  document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
  setTimeout(() => el.classList.remove('on'), modo === 'treme' ? 1500 : 2200); setTimeout(() => el.remove(), 3200);
}
function abrirNariz() {
  const m = $('#narizModal');
  $('#nzTitle').textContent = U('narizT'); $('#nzSub').textContent = U('narizSub');
  $('#nzLista').innerHTML = st.nariz.map((id) => `<li><b>${esc(nomeCheiro(id))}</b><span>${esc(linhaCheiro(id))}</span></li>`).join('') || `<li class="vazio">${esc(U('narizVazio'))}</li>`;
  m.classList.add('show'); A.fareja();
}
$('#narizBtn').onclick = abrirNariz;
$('#nzClose').onclick = () => $('#narizModal').classList.remove('show');

// ---------------------------------------------------------------- A FOME (só aos 21): sem barra
// ouvido: o ronco · olho: a cor some (menos na comida) · texto: frases curtas e a barriga · mão: a barriga embaixo do dedo
const fomeOn = () => !!st.f.fomeOn;
const fomeAlta = () => fomeOn() && st.fome >= 60;
window.fomeAlta = (s) => !!(s.f && s.f.fomeOn && s.fome >= 60);
function mudaFome(d) { if (!d || !fomeOn()) return; st.fome = clamp(st.fome + d, 0, 100); salvar(); if (d > 0 && st.fome >= 60) proxRonco = Math.min(proxRonco, performance.now() + 600); }
let proxRonco = 0;
function fomeLoop() {
  const on = fomeOn() && $('#cover').classList.contains('hide') && !$('#resumo').classList.contains('show');
  const k = on ? clamp((st.fome - 35) / 55, 0, 1) : 0;
  document.documentElement.style.setProperty('--fome', k.toFixed(3));
  document.body.classList.toggle('faminto', on && st.fome >= 60);
  const emJogo = document.body.classList.contains('mg-on') && !document.body.classList.contains('mg-fome');
  if (on && !emJogo && A.ctx && A.on && performance.now() > proxRonco && st.fome >= 40) {
    A.ronco(k);
    // no celular, o ronco também se sente na mão
    if (st.fome >= 60 && navigator.vibrate && matchMedia('(pointer: coarse)').matches) { try { navigator.vibrate([70, 60, 120]); } catch (e) {} }
    document.body.classList.remove('ronca'); void document.body.offsetWidth; document.body.classList.add('ronca');
    proxRonco = performance.now() + (st.fome >= 60 ? 5200 + Math.random() * 3000 : 14000 + Math.random() * 6000);
  }
  setTimeout(fomeLoop, 500);
}

// ---------------------------------------------------------------- onde está o dedo (a barriga nasce embaixo dele)
let ptr = { x: innerWidth * .3, y: innerHeight * .8 };
addEventListener('pointerdown', (e) => { ptr = { x: e.clientX, y: e.clientY }; }, { passive: true, capture: true });
addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') ptr = { x: e.clientX, y: e.clientY }; }, { passive: true });

// ---------------------------------------------------------------- ícones de gesto
const GESTO = {
  segurar: '<svg viewBox="0 0 64 64"><circle class="anel" cx="26" cy="14" r="11"/><g transform="translate(13 20) scale(1.6)"><path d="M10 9.5V4a2 2 0 0 0-4 0v10"/><path d="M10 9a2 2 0 0 1 4 0v1"/><path d="M14 10a2 2 0 0 1 4 0v1"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.83L6 14"/></g></svg>',
  tocar: '<svg viewBox="0 0 64 64"><circle class="onda" cx="26" cy="14" r="7"/><g transform="translate(13 20) scale(1.6)"><path d="M10 9.5V4a2 2 0 0 0-4 0v10"/><path d="M10 9a2 2 0 0 1 4 0v1"/><path d="M14 10a2 2 0 0 1 4 0v1"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.83L6 14"/></g></svg>',
  nariz: '<svg viewBox="0 0 64 64"><path d="M30 8c-2 10-8 20-12 28-3 6 0 12 7 12 3 0 5-2 7-2s4 2 7 2c7 0 10-6 7-12"/><path class="fio" d="M8 22c6-4 10 4 16 0M40 18c6-4 10 4 16 0M44 30c5-3 8 3 13 0"/></svg>',
  comer: '<svg viewBox="0 0 64 64"><path d="M10 34h44c0 12-10 20-22 20S10 46 10 34z"/><path class="fio" d="M22 26c-3-5 3-7 0-12M32 26c-3-5 3-7 0-12M42 26c-3-5 3-7 0-12"/></svg>',
  olhar: '<svg viewBox="0 0 64 64"><path d="M6 32c8-12 17-18 26-18s18 6 26 18c-8 12-17 18-26 18S14 44 6 32z"/><circle class="anel" cx="32" cy="32" r="8"/></svg>',
  arrastar: '<svg viewBox="0 0 64 64"><path class="fio" d="M10 46c10-14 30-14 44-30"/><path d="M46 12l8 4-3 9"/><circle cx="12" cy="46" r="5"/></svg>',
  puxar: '<svg viewBox="0 0 64 64"><path d="M32 56V12"/><path d="M20 24l12-12 12 12"/><path class="fio" d="M14 50c6-3 6 3 12 0M38 50c6-3 6 3 12 0"/></svg>',
  golpe: '<svg viewBox="0 0 64 64"><path d="M14 50l22-22"/><rect x="32" y="10" width="20" height="16" rx="4" transform="rotate(45 42 18)"/><path class="fio" d="M10 30l-4-2M18 22l-2-4M40 52l2 4"/></svg>',
};
function gesto(root, icone, titulo, sub) {
  const veu = document.createElement('div'); veu.className = 'gesto-veu';
  const g = document.createElement('div'); g.className = 'gesto ' + icone;
  g.innerHTML = `${GESTO[icone] || ''}<p>${esc(titulo)}</p>${sub ? `<small>${esc(sub)}</small>` : ''}<em class="gesto-ir">${esc(U('comecar') || '')}</em>`;
  root.appendChild(veu); root.appendChild(g); requestAnimationFrame(() => { g.classList.add('on'); veu.classList.add('on'); });
  window.__mgPausa = true;
  let feito = false;
  const some = (e) => {
    if (feito) return;
    if (e) { if (e.cancelable) e.preventDefault(); e.stopPropagation(); }
    feito = true; window.__mgPausa = false;
    g.classList.remove('on'); veu.classList.remove('on'); setTimeout(() => { g.remove(); veu.remove(); }, 500);
    root.removeEventListener('pointerdown', some, true); removeEventListener('keydown', some, true);
  };
  root.addEventListener('pointerdown', (e) => { if (!feito) { e.stopPropagation(); if (e.cancelable) e.preventDefault(); } }, true);
  setTimeout(() => { root.addEventListener('pointerdown', some, true); addEventListener('keydown', some, true); }, 350);
  if (BOT()) setTimeout(some, 50);
  return some;
}

// ---------------------------------------------------------------- SEGURAR (comer e olhar): o mesmo gesto, dois sentidos
// Um botão grande. Segurar (dedo, mouse ou espaço) faz o progresso andar; soltar pausa (olhar) ou deixa voltar (comer).
function segurador(opt) {
  const w = document.createElement('div'); w.className = 'segura-w ' + (opt.classe || '');
  w.innerHTML = `<button class="segura-b" type="button" aria-label="${esc(opt.rotulo)}"><svg class="anelp" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46"/></svg>${GESTO[opt.icone] || ''}</button><p class="segura-r">${esc(opt.rotulo)}</p><p class="dica">${esc(opt.dica || '')}</p>`;
  box.appendChild(w);
  const b = w.querySelector('.segura-b'), anel = w.querySelector('.anelp circle');
  let seg = false, k = 0, fim = false, last = performance.now(), raf = 0;
  const down = (e) => { if (fim) return; if (e && e.cancelable) e.preventDefault(); seg = true; w.classList.add('on'); opt.down && opt.down(); };
  const up = () => { if (!seg) return; seg = false; w.classList.remove('on'); opt.up && opt.up(); };
  b.addEventListener('pointerdown', down);
  const kd = (e) => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); down(); } };
  const ku = (e) => { if (e.code === 'Space') up(); };
  addEventListener('pointerup', up); addEventListener('pointercancel', up); addEventListener('keydown', kd); addEventListener('keyup', ku);
  b.addEventListener('contextmenu', (e) => e.preventDefault());
  const limpa = () => { removeEventListener('pointerup', up); removeEventListener('pointercancel', up); removeEventListener('keydown', kd); removeEventListener('keyup', ku); cancelAnimationFrame(raf); };
  const passo = (now) => {
    if (fim || !w.isConnected) { limpa(); return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const segNow = seg || BOT();
    const nk = opt.passo ? opt.passo(dt, segNow, k) : clamp(k + (segNow ? dt / opt.dur : -(opt.volta || 0) * dt), 0, 1);
    k = nk; anel.style.strokeDashoffset = (289 * (1 - k)).toFixed(1);
    opt.prog && opt.prog(k, segNow, dt);
    if (k >= 1) { fim = true; up(); limpa(); w.classList.add('feito'); opt.fim && opt.fim(); return; }
    raf = requestAnimationFrame(passo);
  };
  raf = requestAnimationFrame((n) => { last = n; passo(n); });
  return { el: w, get segura() { return seg; } };
}

// ---------------------------------------------------------------- estatísticas (Supabase)
function registrar(escolha, opcao) {
  fetch(`${SUPA.url}/rest/v1/livro_escolhas?on_conflict=sessao,capitulo,escolha`, {
    method: 'POST', headers: { apikey: SUPA.key, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify({ capitulo: L.id, escolha: String(escolha).slice(0, 40), opcao: String(opcao).slice(0, 40), sessao: st.sessao }),
  }).catch(() => {});
}
async function estatisticas() {
  try {
    const r = await fetch(`${SUPA.url}/rest/v1/rpc/livro_estatisticas`, { method: 'POST', headers: { apikey: SUPA.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_capitulo: L.id }) });
    return r.ok ? r.json() : [];
  } catch (e) { return []; }
}

// ---------------------------------------------------------------- render de página
const txt = $('#ptext'), box = $('#choices'), btnNext = $('#next'), btnPrev = $('#prev'), panel = $('#page');
// um parágrafo pode ser: 'texto', { t: 'texto', se?: st => bool, voz?: 'D01', sfx?, cheiro?, modo? } ou st => (qualquer um destes, ou lista)
// a voz (e o som, e o cheiro) fica PRESA ao parágrafo: se um parágrafo condicional some, nada cai no lugar errado
const umObj = (x) => {
  if (x == null || x === false) return [];
  if (typeof x === 'string') return [{ t: x }];
  if (typeof x === 'function') return [].concat(x(st)).map(umObj).flat();
  if (Array.isArray(x)) return x.map(umObj).flat();
  if (x.se && !x.se(st)) return [];
  return x.t ? [x] : [];
};
const resolve = (list) => [].concat(typeof list === 'function' ? list(st) : (list || [])).map(umObj).flat();
const sub = (s) => (L.subst ? L.subst(s, st, tr) : s);
const paras = (list) => resolve(list).map((o) => sub(tr(o.t)));
// os sons presos aos parágrafos, com o índice certo
const itensDe = (objs, base = 0) => objs.map((o, k) => [o.voz ? { voz: o.voz, p: base + k } : null, o.sfx ? { sfx: o.sfx, p: base + k, v: o.v } : null, o.cheiro ? { cheiro: o.cheiro, modo: o.modo, p: base + k, solto: true } : null]).flat().filter(Boolean);
// '§' abre uma linha da barriga (CAPS âmbar); '—' abre uma fala
function pHTML(p, extra = '') {
  if (p.startsWith('§')) return `<p class="barriga ${extra}">${esc(p.slice(1).trim())}</p>`;
  const dlg = p.startsWith('—'), kronk = dlg && p === p.toUpperCase() && /[A-ZÀ-Ú]/.test(p);
  return `<p class="${dlg ? 'dlg' : ''} ${kronk ? 'kfala' : ''} ${extra}">${linkify(p)}</p>`;
}
let timers = [];
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
const vozUrl = (n) => 'assets/audio/voz/' + n + '.mp3';
const fala = (nome, ms = 0) => { if (!nome) return; later(() => { if (A.ctx && A.on) A.narrate(vozUrl(nome), null, true); }, ms); };
let cuesPend = [];
const palavras = (el) => (el.textContent || '').trim().split(/\s+/).length;
const msAte = (els, k) => { if (!els.length) return 900; if (k < 0) k = els.length + k; k = Math.max(0, Math.min(els.length - 1, k)); let w = 0; for (let i = 0; i < k; i++) w += palavras(els[i]); return (700 + (w / 3.3) * 1000) * (window.__LEITURA_K || 1); };
const tocaItem = (it) => {
  if (it.cheiro) return cheiro(it.cheiro, it.modo);
  if (!A.ctx || !A.on) return;
  if (it.voz) A.narrate(vozUrl(typeof it.voz === 'function' ? it.voz(st) : it.voz), null, true); else if (it.fn) it.fn(A, st); else if (it.sfx) A.sfx(it.sfx, it.v != null ? it.v : .7); else if (it.s) A.once(it.s, it.v != null ? it.v : .7);
};
function agendaItens(itens, els, base = 0) {
  (itens || []).forEach((it) => {
    if (it.se && !it.se(st)) return;
    const c = { done: false, fim: !!it.fim };
    c.tocar = () => { if (c.done) return; c.done = true; tocaItem(it); };
    if (c.fim) cuesPend.push(c);
    later(c.tocar, base + (it.p != null ? msAte(els, it.p) : (it.ms != null ? it.ms : 900)));
  });
}
// som no meio do texto: o texto PARA antes do parágrafo que tem som (ou voz); o leitor clica em Continuar
function agendaPortoes(itens, els, aoAcabar) {
  const n = els.length, idx = (it) => (it.p < 0 ? Math.max(0, n + it.p) : Math.min(n - 1, it.p));
  const lista = (itens || []).filter((it) => !(it.se && !it.se(st)));
  const portaoDe = (it) => !it.fim && it.p != null && idx(it) > 0 && !it.cheiro && !it.solto;
  const meio = lista.filter(portaoDe);
  const gates = [...new Set(meio.map(idx))].sort((x, y) => x - y);
  // o que não é portão (cheiro, som solto) e cai depois de um portão vai junto com ele
  const presos = {};
  const soltos = lista.filter((it) => !meio.includes(it)).filter((it) => {
    if (it.p == null || it.fim) return true;
    const g = gates.filter((x) => x <= idx(it)).pop();
    if (g == null) return true;
    (presos[g] = presos[g] || []).push(it); return false;
  });
  agendaItens(soltos, els);
  if (!gates.length) return false;
  els.slice(gates[0]).forEach((el) => el.classList.add('em-espera'));
  const mostra = (k) => {
    const g = gates[k], ate = k + 1 < gates.length ? gates[k + 1] : n;
    const w = document.createElement('div'); w.className = 'portao';
    const b = document.createElement('button'); b.className = 'cta portao-btn'; b.type = 'button'; b.textContent = U('continuar');
    w.appendChild(b); els[g].before(w);
    b.onclick = () => {
      if (!w.isConnected) return; w.remove();
      for (let i = g; i < ate; i++) { els[i].classList.remove('em-espera'); els[i].classList.add('novo'); els[i].style.animationDelay = ((i - g) * .35) + 's'; }
      meio.filter((it) => idx(it) === g).forEach(tocaItem);
      // o cheiro aparece junto com o parágrafo (mesmo se o leitor virar a página logo)
      (presos[g] || []).forEach((it) => (it.cheiro ? setTimeout(() => tocaItem(it), 250 + Math.max(0, idx(it) - g) * 500) : later(() => tocaItem(it), 300 + Math.max(0, idx(it) - g) * 900)));
      if (k + 1 < gates.length) mostra(k + 1); else aoAcabar();
      const nb = $('.portao-btn'); nb ? nb.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) : els[g].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
  };
  mostra(0);
  return true;
}

// os parágrafos escondidos de uma página com gesto (comer, olhar): aparecem com o gesto, e o som de cada um toca junto
let revelaCues = {};
function revela(els, k) {
  const el = els[k]; if (!el || !el.classList.contains('oculto')) return;
  el.classList.remove('oculto'); el.classList.add('novo'); panel.scrollTop = panel.scrollHeight;
  (revelaCues[k] || []).forEach(tocaItem);
}

function render(dir = 1) {
  clearTimers(); cuesPend = []; revelaCues = {}; A.stopNarr(); linkUsados.clear(); limpaBarriga();
  if (narizFixo) { narizFixo.remove(); narizFixo = null; }
  document.body.classList.remove('apaga', 'comendo', 'olhando');
  document.documentElement.style.setProperty('--calor', '0');
  const p = P[st.i]; if (!p) return;
  if (p.aoEntrar && !st.feitos['in:' + p.id]) { st.feitos['in:' + p.id] = 1; p.aoEntrar(st, { mudaFome, toast: (t) => later(() => toast(tr(t)), 600) }); }
  if (p.fome && !st.feitos['fo:' + p.id]) { st.feitos['fo:' + p.id] = 1; mudaFome(p.fome); }
  setFundo(resolveFundo(p));
  Nevoa.set(p.nevoa != null ? p.nevoa : (L.nevoaDe ? L.nevoaDe(st, p) : 0));
  if (A.ctx) { A.setZone(p.zona); if (p.som && dir > 0) A.once(p.som, .55); }
  document.body.dataset.zona = p.zona || '';
  { let k = st.i; while (k > 0 && !P[k].parte) k--; $('#parte').textContent = P[k].parte ? tr(P[k].parte) : ''; }
  const vis = P.filter(visivel), n = vis.indexOf(p) + 1; $('#pnum').textContent = `${n}`;
  $('#prog').style.setProperty('--p', (n / vis.length).toFixed(3));
  panel.classList.remove('in'); void panel.offsetWidth; panel.classList.add('in');
  panel.classList.toggle('cartao', !!p.cartao);
  if (p.cartao) {
    const c = p.cartao;
    txt.innerHTML = `<div class="ct"><p class="ct-num">${esc(tr(c.num))}</p><h2 class="ct-nome">${esc(tr(c.nome))}</h2><span class="ct-orn">✦</span>
      ${c.epigrafe ? `<blockquote class="ct-epi"><p>${esc(tr(c.epigrafe))}</p><cite>${esc(tr(c.fonte))}</cite></blockquote>` : ''}</div>`;
  } else txt.innerHTML = paras(p.texto).map((t, k) => pHTML(t, k === 0 && p.capitular ? 'cap' : '')).join('');
  const sonsPag = (p.cartao ? [] : itensDe(resolve(p.texto))).concat((p.sons || []).filter((it) => !(it.se && !it.se(st))));
  box.innerHTML = ''; box.style.display = '';
  [...txt.children].forEach((el, k) => { el.style.animationDelay = (k * .35) + 's'; });
  $('#extras').innerHTML = '';
  let livre = true;
  const gestoPag = p.comer || p.olhar;
  if (escolhaAtiva(p)) livre = renderEscolha(p);
  if (p.minijogo) livre = renderMinijogo(p);
  if (gestoPag) livre = renderGestoPagina(p, dir, sonsPag);
  setNext(livre);
  if (sonsPag.length && dir >= 0 && !gestoPag) {
    const liberaTudo = () => { box.style.display = ''; setNext(livre); };
    const portao = agendaPortoes(sonsPag, [...txt.children], liberaTudo);
    if (portao) { box.style.display = 'none'; setNext(false); }
  }
  if (p.cheiros && dir >= 0) {
    const els = [...txt.children];
    p.cheiros.forEach((c) => { if (c.se && !c.se(st)) return; if (gestoPag && c.p != null && c.p >= (gestoPag.antes || 0)) return; later(() => { if (P[st.i] === p) cheiro(typeof c.id === 'function' ? c.id(st) : c.id, c.modo); }, c.ms != null ? c.ms : msAte(els, c.p || 0) + 400); });
  }
  btnPrev.disabled = idxVis(st.i, -1) < 0; btnPrev.textContent = U('voltar');
  btnNext.textContent = p.fim ? U('fim') : U('prox');
  st.feitos[p.id] = st.feitos[p.id] || 1; salvar();
  panel.scrollTop = 0;
}
function setNext(on) { btnNext.disabled = !on; btnNext.classList.toggle('pulse', on); }
function appendParas(list, cls = '') { const ps = paras(list); ps.forEach((t, k) => { txt.insertAdjacentHTML('beforeend', pHTML(t, 'novo ' + cls)); txt.lastElementChild.style.animationDelay = (k * .35) + 's'; }); return ps.length; }
// o texto que chega depois (resultado de escolha, fim de jogo): se tiver voz, para antes dela e pede Continuar
function appendComSom(list, extra, depois) {
  const objs = resolve(list), n0 = txt.children.length;
  appendParas(list);
  const els = [...txt.children].slice(n0);
  const itens = itensDe(objs).concat((extra || []).filter((it) => !(it.se && !it.se(st))));
  if (!itens.length) { depois && depois(); return; }
  box.style.display = 'none';
  const portao = agendaPortoes(itens, els, () => { box.style.display = ''; depois && depois(); });
  if (!portao) { box.style.display = ''; depois && depois(); }
}

// ----- COMER e OLHAR: a página que só termina com o dedo
function renderGestoPagina(p, dir, sonsPag) {
  const g = p.comer || p.olhar, tipo = p.comer ? 'comer' : 'olhar';
  const els = [...txt.children], antes = g.antes || 0;
  // os sons dos parágrafos visíveis seguem a regra normal; os dos escondidos tocam quando aparecem
  sonsPag.forEach((it) => {
    const k = it.p == null ? 0 : (it.p < 0 ? Math.max(0, els.length + it.p) : Math.min(els.length - 1, it.p));
    if (k >= antes) (revelaCues[k] = revelaCues[k] || []).push(it); else if (dir >= 0) agendaItens([it], els);
  });
  (p.cheiros || []).filter((c) => c.p != null && c.p >= antes && !(c.se && !c.se(st))).forEach((c) => { (revelaCues[c.p] = revelaCues[c.p] || []).push({ cheiro: typeof c.id === 'function' ? c.id(st) : c.id, modo: c.modo }); });
  if (st.feitos['g:' + p.id]) return true;   // já feito: o texto inteiro fica
  els.slice(antes).forEach((el) => el.classList.add('oculto'));
  const escondidos = els.length - antes;
  const tvez = (k) => { const n = Math.min(escondidos, Math.floor(k * (escondidos + .999))); for (let i = 0; i < n; i++) revela(els, antes + i); };
  const termina = () => {
    for (let i = antes; i < els.length; i++) revela(els, i);
    st.feitos['g:' + p.id] = 1; salvar();
    if (g.aoFim) g.aoFim(st, { mudaFome });
    if (tipo === 'comer' && !g.vazio) {
      // o sono: a névoa fecha e a próxima idade começa
      later(() => { Nevoa.fecha(); document.body.classList.add('dorme'); }, 1600);
      later(() => { document.body.classList.remove('dorme'); irProxima(); }, 4200);
    } else if (g.escurece) {
      later(() => document.body.classList.add('apaga'), 2400);
      later(() => irProxima(), 4600);
    } else setNext(true);
  };
  const atraso = Math.min(4200, 900 + antes * 900) * (window.__LEITURA_K || 1);
  later(() => {
    if (P[st.i] !== p) return;
    if (tipo === 'comer') {
      let mast = 0;
      segurador({ icone: 'comer', classe: 'comer', rotulo: U('comer'), dica: U('comerDica'), dur: g.vazio ? 1.8 : 3, volta: g.vazio ? 0 : .25,
        prog: (k, seg, dt) => {
          if (!g.vazio) {
            document.documentElement.style.setProperty('--calor', k.toFixed(3));
            document.body.classList.toggle('comendo', seg);
            if (seg) { mast -= dt; if (mast <= 0) { A.mastiga(); mast = .55; } }
          }
          tvez(k);
        },
        fim: termina });
    } else {
      // olhar até parar: a respiração espaça; soltar não desfaz, só pausa
      const N = g.respiros || 5, gaps = Array.from({ length: N }, (_, i) => 1 + i * .45);
      const total = gaps.reduce((a, b) => a + b, 0); let t = 0, prox = 0, feitos = 0;
      document.body.classList.add('olhando');
      segurador({ icone: 'olhar', classe: 'olhar', rotulo: U('olhar'), dica: tr(g.dica) || U('olharDica'),
        passo: (dt, seg) => { if (seg) t += dt * (BOT() ? 6 : 1); return clamp(t / total, 0, 1); },
        prog: (k, seg) => {
          while (feitos < N && t >= prox) { prox += gaps[feitos]; A.respira(feitos); feitos++; const r = document.createElement('i'); r.className = 'respiro'; box.querySelector('.segura-w') && box.querySelector('.segura-w').appendChild(r); setTimeout(() => r.remove(), 1600); }
          document.body.classList.toggle('olhando-seg', seg);
        },
        fim: () => { A.ultimoAr(); document.body.classList.remove('olhando', 'olhando-seg'); later(termina, 900); } });
    }
  }, dir >= 0 ? atraso : 0);
  return false;
}

// ----- ESCOLHAS: abrem só depois de "Próxima"
const escolhaAtiva = (p) => !!(p.escolha && (!p.escolha.se || p.escolha.se(st)));
const rotulo = (o) => (o.silencio ? U('silencioR') : sub(tr(typeof o.txt === 'function' ? o.txt(st) : o.txt)));
const opcoesVis = (lista) => lista.filter((o) => !o.se || o.se(st));
const resultadoDe = (o) => (typeof o.resultado === 'function' ? o.resultado(st) : o.resultado);
const rotHTML = (o) => (o.silencio ? `<em>${U('silencio')}</em>` : o.fala ? `“${esc(rotulo(o))}”` : o.gesto ? `<i class="gst">${esc(rotulo(o))}</i>` : esc(rotulo(o)));
const optHTML = (o, k) => `<button class="opt ${o.silencio ? 'sil' : ''} ${o.fala ? 'fala' : ''} ${o.barriga ? 'barr' : ''}" data-id="${o.id}"><span class="k">${k + 1}</span><span class="tx">${rotHTML(o)}</span></button>`;
function renderEscolha(p) {
  const e = p.escolha, feita = st.escolhas[e.id];
  if (feita) { const o = e.opcoes.find((x) => x.id === feita); if (o) { box.innerHTML = `<p class="feita">${U('escolheu')} ${o.fala ? '“' + esc(rotulo(o)) + '”' : esc(rotulo(o))}</p>`; appendParas(resultadoDe(o)); } return true; }
  p._revelado = false; box.innerHTML = '';
  return true;
}
function abreEscolha(p) {
  const e = p.escolha, ops = opcoesVis(e.opcoes);
  const barr = fomeOn() ? ops.filter((o) => o.barriga) : [], resto = ops.filter((o) => !barr.includes(o));
  box.innerHTML = `<p class="eyebrow">${e.pergunta ? esc(sub(tr(typeof e.pergunta === 'function' ? e.pergunta(st) : e.pergunta))) : U('oque')}</p>` + resto.map(optHTML).join('');
  box.querySelectorAll('.opt').forEach((b) => b.onclick = () => escolher(p, b.dataset.id));
  // a barriga: a opção dela nasce embaixo do dedo, e as outras continuam em volta
  barr.forEach((o, j) => {
    const b = document.createElement('button'); b.className = 'opt-barriga'; b.dataset.id = o.id; b.type = 'button';
    b.innerHTML = `<span class="k">${resto.length + j + 1}</span>${esc(rotulo(o))}`;
    document.body.appendChild(b);
    const w = b.offsetWidth || 180, h = b.offsetHeight || 54;
    b.style.left = clamp(ptr.x - w / 2, 10, innerWidth - w - 10) + 'px'; b.style.top = clamp(ptr.y - h / 2, 70, innerHeight - h - 10) + 'px';
    requestAnimationFrame(() => b.classList.add('on'));
    A.ronco(.9);
    setTimeout(() => { b.onclick = () => escolher(p, o.id); }, BOT() ? 0 : 380);   // o mesmo toque que abriu não escolhe
    box.dataset.barriga = '1';
  });
}
function limpaBarriga() { document.querySelectorAll('.opt-barriga').forEach((b) => { b.classList.add('sai'); b.onclick = null; setTimeout(() => b.remove(), 400); }); }
function aplicar(o) {
  if (!o) return;
  if (o.af) Object.entries(typeof o.af === 'function' ? o.af(st) : o.af).forEach(([k, v]) => { st.af[k] = (st.af[k] || 0) + v; });
  if (o.acredita) st.acredita = clamp(st.acredita + o.acredita, -3, 3);
  if (o.fome) mudaFome(typeof o.fome === 'function' ? o.fome(st) : o.fome);
  if (o.flag) [].concat(o.flag).forEach((f) => { st.f[f] = true; });
  if (o.aoEscolher) o.aoEscolher(st);
  const av = typeof o.aviso === 'function' ? o.aviso(st) : o.aviso;
  if (av) later(() => toast(sub(tr(av))), 700);
}
function escolher(p, id) {
  const e = p.escolha; if (st.escolhas[e.id]) return;
  const o = e.opcoes.find((x) => x.id === id); st.escolhas[e.id] = id;
  if (o.fundo) { (st.fundoPag = st.fundoPag || {})[p.id] = o.fundo; setFundo(o.fundo); }
  limpaBarriga();
  box.querySelectorAll('.opt').forEach((b) => { b.disabled = true; b.classList.toggle('sel', b.dataset.id === id); });
  if (o.som) A.sfx(o.som, .7);
  A.escolha(); registrar(e.id, id); salvar();
  const fecha = () => { aplicar(o); salvar(); if (o.voz) fala(typeof o.voz === 'function' ? o.voz(st) : o.voz, 200); later(() => { appendComSom(resultadoDe(o), null, () => setNext(true)); panel.scrollTop = panel.scrollHeight; }, 450); };
  // a escolha que pede um gesto antes do resultado (olhar até parar, ou acabar)
  if (o.depois === 'olhar') {
    later(() => {
      box.innerHTML = ''; let t = 0, prox = 0, feitos = 0; const N = 5, gaps = [1, 1.4, 1.8, 2.3, 2.8], total = gaps.reduce((a, b) => a + b, 0);
      document.body.classList.add('olhando');
      segurador({ icone: 'olhar', classe: 'olhar', rotulo: U('olhar'), dica: U('olharDica'),
        passo: (dt, seg) => { if (seg) t += dt * (BOT() ? 6 : 1); return clamp(t / total, 0, 1); },
        prog: () => { while (feitos < N && t >= prox) { prox += gaps[feitos]; A.respira(feitos); feitos++; const r = document.createElement('i'); r.className = 'respiro'; const sw = box.querySelector('.segura-w'); sw && sw.appendChild(r); setTimeout(() => r.remove(), 1600); } },
        fim: () => { A.ultimoAr(); document.body.classList.remove('olhando'); later(() => { box.innerHTML = ''; fecha(); }, 900); } });
    }, 500);
  } else if (o.depois === 'golpe') {
    later(() => {
      box.innerHTML = `<div class="segura-w golpe"><button class="segura-b golpe-b" type="button">${GESTO.golpe}</button><p class="segura-r">${esc(U('acabar'))}</p></div>`;
      const b = box.querySelector('.golpe-b');
      const vai = () => { b.onclick = null; A.marreta(); document.body.classList.remove('golpeia'); void document.body.offsetWidth; document.body.classList.add('golpeia'); later(() => { box.innerHTML = ''; fecha(); }, 700); };
      b.onclick = vai; if (BOT()) setTimeout(vai, 100);
    }, 500);
  } else fecha();
}

// ---------------------------------------------------------------- minijogos (window.JOGOS6 e window.BATALHA6)
let overlay = $('#mg');
function renovaOverlay() { const n = overlay.cloneNode(false); n.className = ''; n.innerHTML = ''; overlay.replaceWith(n); overlay = n; }
function abreOverlay(cls) { renovaOverlay(); overlay.className = 'show ' + cls; document.body.classList.add('mg-on'); return overlay; }
function fechaOverlay() { renovaOverlay(); document.body.classList.remove('mg-on', 'mg-fome'); }
const ctxJogo = (p) => ({ lang: LANG, A, st, tr, U, p, paras, esc, linkify, vsrc, L, toast: (t) => toast(tr(t)), registrar, salvar, cheiro, mudaFome, fomeAlta, nomeCheiro, sub,
  narrate: (n, fila) => { if (A.ctx && A.on) A.narrate(vozUrl(n), null, fila); },
  gesto: (root, icone, tipo) => { tipo = tipo || p.minijogo; const s = (U('gestoSub') || {})[tipo]; return gesto(root, icone, (U('gesto') || {})[tipo] || '', typeof s === 'function' ? s(st) : s || ''); } });
function renderMinijogo(p) {
  const tipo = p.minijogo, done = st.feitos['mg:' + p.id];
  if (done) { appendParas(p.depois); return true; }
  const dica = typeof U('dica')[tipo] === 'function' ? U('dica')[tipo](st) : U('dica')[tipo];
  const vb = (U('verboDe') || {})[tipo];
  const nome = (typeof p.mgNome === 'function' ? tr(p.mgNome(st)) : p.mgNome ? tr(p.mgNome) : null) || U('mg')[tipo];
  box.innerHTML = `<p class="eyebrow">${U('momento')}</p><button class="opt jogar" id="mgGo"><span class="k">▶</span><span class="tx">${vb ? `<span class="verbo v-${vb}">${esc(U('verbo')[vb])}</span>` : ''}${esc(nome)}</span></button><p class="dica">${esc(tr(p.mgDica) || dica || '')}</p>`;
  $('#mgGo').onclick = () => {
    box.innerHTML = '';
    const o = abreOverlay('j6 jg-' + tipo);   // jg-: o Cap. I já usa .quieto para outra coisa
    if (fomeOn()) document.body.classList.add('mg-fome');
    const fn = tipo === 'batalha' ? window.BATALHA6 : window.JOGOS6[tipo];
    Promise.resolve(fn(o, ctxJogo(p))).then((res) => {
      st.jogos[p.jogoId || tipo] = res || true; st.feitos['mg:' + p.id] = 1; salvar(); fechaOverlay();
      if (p.aoTerminar) p.aoTerminar(st, res, { mudaFome, cheiro, toast: (t) => later(() => toast(tr(t)), 400) });
      salvar();
      if (res && res.nav) return irProxima();
      appendComSom(p.depois, p.sonsDepois, () => setNext(true));
      panel.scrollTop = panel.scrollHeight;
    });
  };
  return false;
}

// ---------------------------------------------------------------- navegação
function irProxima() {
  const p = P[st.i];
  if (p && escolhaAtiva(p) && !st.escolhas[p.escolha.id] && !p._revelado) { p._revelado = true; setNext(false); abreEscolha(p); box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
  limpaBarriga();
  cuesPend.forEach((c) => c.tocar()); cuesPend = [];
  if (p && p.aoSair && !st.feitos['out:' + p.id]) { st.feitos['out:' + p.id] = 1; p.aoSair(st, { mudaFome }); }
  if (p && p.fim) return resumo();
  const j = idxVis(st.i, 1); if (j >= P.length) return resumo();
  st.i = j; A.ctx && A.virar(); render(1);
}
function irAnterior() { const j = idxVis(st.i, -1); if (j < 0) return; limpaBarriga(); st.i = j; A.ctx && A.virar(); render(-1); }
btnNext.onclick = () => { if (!btnNext.disabled) irProxima(); };
btnPrev.onclick = irAnterior;
addEventListener('keydown', (e) => {
  if (document.body.classList.contains('mg-on') || !$('#cover').classList.contains('hide')) return;
  if ($('#codex').classList.contains('show') || $('#narizModal').classList.contains('show')) { if (e.key === 'Escape') { $('#codex').classList.remove('show'); $('#narizModal').classList.remove('show'); } return; }
  if (e.code === 'Space' && box.querySelector('.segura-w')) return;   // o espaço segura
  if (['ArrowRight', 'Enter', ' '].includes(e.key)) { e.preventDefault(); const pb = $('.portao-btn'); if (pb) pb.click(); else if (!btnNext.disabled) irProxima(); }
  else if (e.key === 'ArrowLeft') irAnterior();
  else if (/^[1-5]$/.test(e.key)) { const bs = [...box.querySelectorAll('.opt:not(:disabled)'), ...document.querySelectorAll('.opt-barriga')]; const b = bs[+e.key - 1]; b && b.click(); }
  else if (e.key === 'n' || e.key === 'N') { if (st.nariz.length) abrirNariz(); }
});
let sx = null, sy = null;
panel.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
panel.addEventListener('touchend', (e) => {
  if (sx == null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) { if (dx < 0 && !btnNext.disabled) irProxima(); else if (dx > 0) irAnterior(); }
});

// ---------------------------------------------------------------- resumo final (estilo Telltale)
function guardaEstado() {
  try {
    const todos = JSON.parse(localStorage.getItem('aqv_estado') || '{}');
    todos.v = 1;
    todos[L.chaveEstado] = Object.assign(L.estadoFinal(st), { pontos: st.pontos || null, quando: new Date().toISOString() });
    localStorage.setItem('aqv_estado', JSON.stringify(todos));
  } catch (e) {}
}
function pontosCap1() {
  try {
    if (ANTES.cap1 && Number.isFinite(ANTES.cap1.pontos)) return Math.round(ANTES.cap1.pontos);
    const c1 = JSON.parse(localStorage.getItem('livro_cap01') || 'null');
    if (c1 && c1.jogo && Number.isFinite(Number(c1.jogo.score))) return Math.round(Number(c1.jogo.score));
  } catch (e) {}
  return null;
}
function anteriores() {
  const e = ANTES, out = {};
  const c1 = pontosCap1(); if (c1 != null) out.cap01 = c1;
  if (e.cap2 && e.cap2.pontos && Number.isFinite(e.cap2.pontos.total)) out.cap02 = Math.round(e.cap2.pontos.total);
  if (e.cap3 && Number.isFinite(e.cap3.pontos)) out.cap03 = Math.round(e.cap3.pontos);
  if (e.cap4 && e.cap4.pontos && Number.isFinite(e.cap4.pontos.total)) out.cap04 = Math.round(e.cap4.pontos.total);
  if (e.cap5 && e.cap5.pontos && Number.isFinite(e.cap5.pontos.total)) out.cap05 = Math.round(e.cap5.pontos.total);
  return out;
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function jogadorId() {
  try {
    let j = localStorage.getItem('aqv_jogador');
    if (!j || !UUID.test(j)) { j = UUID.test(st.sessao) ? st.sessao : uuid(); localStorage.setItem('aqv_jogador', j); }
    return j;
  } catch (e) { return UUID.test(st.sessao) ? st.sessao : null; }
}
function calculaPontos() {
  const r = L.pontos(st), ant = anteriores();
  st.pontos = { total: r.total, partes: r.partes, antes: ant, somaAntes: Object.values(ant).reduce((a, b) => a + b, 0) };
  return st.pontos;
}
async function enviaPontos(pt) {
  const j = jogadorId(); if (!j) return null;
  const rpc = (cap, pontos, detalhes) => fetch(`${SUPA.url}/rest/v1/rpc/livro_salva_pontos`, {
    method: 'POST', headers: { apikey: SUPA.key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_jogador: j, p_capitulo: cap, p_pontos: pontos, p_detalhes: detalhes }),
  }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  for (const [cap, v] of Object.entries(pt.antes)) await rpc(cap, Math.min(2000000, v), { origem: L.id });
  const r = await rpc(L.id, pt.total, Object.fromEntries(pt.partes));
  return r && r[0] ? r[0] : null;
}
function mostraPontos(pt, srv) {
  const loc = LANG === 'en' ? 'en-US' : 'pt-BR', n = (x) => Number(x).toLocaleString(loc);
  const temAntes = Object.keys(pt.antes).length > 0;
  const jornada = srv && srv.total != null ? Number(srv.total) : temAntes ? pt.somaAntes + pt.total : null;
  $('#rsPontos').innerHTML = `
    <p class="eyebrow">${U('pontos')}</p>
    <p class="rs-num">${n(pt.total)}</p>
    <ul class="rs-pts">${pt.partes.map(([k, v]) => `<li><span>${U('pts')[k]}</span><b>${n(v)}</b></li>`).join('')}
    ${temAntes ? `<li><span>${U('pts').antes}</span><b>${n(pt.somaAntes)}</b></li>` : ''}</ul>
    ${jornada != null ? `<p class="rs-jornada"><span>${U('jornada')}</span><b>${n(jornada)}</b>${srv && srv.posicao ? `<em>${U('posicao')(n(srv.posicao), n(srv.leitores))}</em>` : ''}</p>` : `<p class="rs-sem">${U('semCap1')}</p>`}`;
}
async function resumo() {
  const pt = calculaPontos();
  guardaEstado(); salvar();
  A.stopNarr(); limpaBarriga();
  $('#resumo').classList.add('show');
  mostraPontos(pt, null); enviaPontos(pt).then((srv) => { if (srv) mostraPontos(pt, srv); });
  const R = L.resumo(st, LANG);
  $('#rsFrase').textContent = R.frase;
  const rv = R.revela;
  $('#rsRevela').innerHTML = !rv ? '' : `<div class="kcard"><div class="kimg" style="background-image:url('${rv.img}')"></div><div class="ktx"><p class="eyebrow">${esc(rv.olho)}</p><h3>${esc(rv.nome)}</h3><p class="ksub">${esc(rv.titulo)}</p>${[].concat(rv.texto).map((t) => `<p class="ktexto">${esc(t)}</p>`).join('')}</div></div>`;
  $('#rsRevela').classList.toggle('card', !!rv);
  $('#rsRel').innerHTML = R.notas.map((r) => `<li>${esc(r)}</li>`).join('');
  $('#rsPerfil').innerHTML = R.nariz && R.nariz.length ? `<p class="eyebrow">${U('narizT')}</p><ul class="rs-nariz">${R.nariz.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
  const desenha = (stats) => {
    $('#rsEsc').innerHTML = R.linhas.map((l) => {
      const tot = stats.filter((x) => x.escolha === l.id).reduce((a, b) => a + Number(b.total), 0);
      const mine = stats.find((x) => x.escolha === l.id && x.opcao === l.opcao);
      const pct = tot && mine ? Math.round((Number(mine.total) / tot) * 100) : null;
      return `<li><span class="q">${esc(l.q)}</span><span class="a">${esc(l.a)}</span>${pct != null ? `<span class="pct"><i style="width:${pct}%"></i><b>${U('mesmo')(pct)}</b></span>` : ''}</li>`;
    }).join('');
  };
  desenha([]); desenha(await estatisticas());
}
const reiniciar = () => { st = novoEstado(); if (L.inicio) L.inicio(st); salvar(); desenhaNariz(); $('#resumo').classList.remove('show'); render(1); };
$('#rsReler').onclick = () => { if (confirm(U('confirm'))) reiniciar(); };
$('#menuReset').onclick = () => { if (confirm(U('confirm'))) reiniciar(); };

// ---------------------------------------------------------------- idioma
function aplicaIdioma() {
  document.documentElement.lang = LANG === 'pt' ? 'pt-BR' : 'en';
  document.querySelectorAll('.lang').forEach((b) => { b.textContent = LANG === 'pt' ? 'EN' : 'PT'; b.setAttribute('aria-label', LANG === 'pt' ? 'Read in English' : 'Ler em português'); });
  $('#cvEye').textContent = U('coverEye'); $('#cvSub').textContent = LANG === 'en' ? L.subtituloEn : L.subtitulo; $('#cvLede').textContent = U('coverLede');
  $('#cvGo').textContent = salvo && salvo.i > 0 ? U('coverRestart') : U('coverGo'); $('#cvCont').textContent = U('coverCont'); $('#cvHint').textContent = U('coverHint');
  $('.tl .cap').textContent = U('capN'); $('#rhead').textContent = `${L.titulo} · ${LANG === 'en' ? L.subtituloEn : L.subtitulo}`;
  $('#narizBtn').title = U('narizT') + ' (N)';
  $('#rsEye').textContent = U('fimCap'); $('#rsH').textContent = U('ficou'); $('#rsSuas').textContent = U('suas'); $('#rsReler').textContent = U('reler');
  $('#rsProx').textContent = (LANG === 'en' ? L.proximo.tituloEn : L.proximo.titulo) + (L.proximo.url ? ' →' : '');
  document.title = LANG === 'en' ? L.tituloPagEn : L.tituloPag;
}
document.querySelectorAll('.lang').forEach((b) => b.addEventListener('click', () => {
  LANG = LANG === 'pt' ? 'en' : 'pt'; try { localStorage.setItem('livro_lang', LANG); } catch (e) {}
  aplicaIdioma(); if ($('#cover').classList.contains('hide') && !document.body.classList.contains('mg-on')) render(0); if ($('#resumo').classList.contains('show')) resumo();
}));

// ---------------------------------------------------------------- capa / início
$('#cvTitle').textContent = L.titulo; $('#cover').style.setProperty('--capa', `url("${L.capa}")`);
if (L.proximo.url) $('#rsProx').href = L.proximo.url; else { $('#rsProx').removeAttribute('href'); $('#rsProx').classList.add('off'); }
const salvo = carregar();
if (salvo && salvo.i > 0) $('#cvCont').hidden = false;
aplicaIdioma();
Clima.set('poeira'); document.body.classList.add('na-capa');
const comecar = (continuar) => {
  A.init(); A.resume();
  st = continuar && salvo ? Object.assign(novoEstado(), salvo) : novoEstado();
  if (!(continuar && salvo) && L.inicio) L.inicio(st);
  salvar(); desenhaNariz();
  ['assets/audio/sfx/pagina.mp3', 'assets/audio/sfx/fareja.mp3', 'assets/audio/sfx/ronco1.mp3'].forEach((u) => A.buf(u));
  $('#cover').classList.add('hide'); document.body.classList.remove('na-capa'); A.virar();
  if (!(continuar && salvo) && L.intertitulo) intertitulo(tr(L.intertitulo), () => render(1)); else render(1);
};
function intertitulo(frase, depois) {
  let el = $('#intertitulo');
  if (!el) { el = document.createElement('section'); el.id = 'intertitulo'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
  el.innerHTML = `<p>${esc(frase)}</p>`; el.classList.remove('sai'); el.classList.add('show');
  let feito = false;
  // a tecla sai junto com o intertítulo, de qualquer jeito que ele feche (no Cap. V ela ficava presa e engolia →, espaço e Enter)
  const fim = () => { if (feito) return; feito = true; clearTimeout(t); document.removeEventListener('keydown', tecla, true); el.classList.add('sai'); setTimeout(() => { el.classList.remove('show', 'sai'); }, 1200); setTimeout(depois, 500); };
  const t = setTimeout(fim, 5200);
  const tecla = (e) => { if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); fim(); } };
  el.onclick = fim;
  document.addEventListener('keydown', tecla, true);
}
$('#cvGo').onclick = () => comecar(false);
$('#cvCont').onclick = () => comecar(true);
$('#som').onclick = () => { A.init(); A.setOn(!A.on); $('#som').classList.toggle('off', !A.on); };
fomeLoop();
window.__LIVRO = { get st() { return st; }, set st(v) { st = v; }, render, irProxima, A, cheiro, mudaFome, ir: (id) => { st.i = P.findIndex((p) => p.id === id); render(1); } };
})();
