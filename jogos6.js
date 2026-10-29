/* ==========================================================================
   Capítulo VI · os momentos de jogo do Kronk (sem sprite: imagem, código e dedo)
   FARO    · os cheiros entram pela borda como fios de fumaça; segurar o dedo
             no fio faz ele ficar forte até virar palavra. Modos:
             alvo (achar um), sequencia (os cheiros chegam sozinhos),
             rastro (seguir o bicho contra o vento; a fome puxa o dedo),
             cavar (cheirar três buracos e escolher onde cavar)
   QUIETO  · debaixo do couro: segurar é ficar quieto
   TOCHA   · o posto à noite: segurar quando a luz vem, soltar é andar
   OLHAR   · debaixo da Laje: tocar no que brilha
   TREINO  · o pau da Hessa: duas imagens, tocar quando ela abre
   CARNE   · arrastar a carne: boca, mão da Ikk, ou rasgar
   SEGURO  · as mãos que seguram: arrastar para cima, a tela resiste
   Cada jogo recebe (root, ctx) e devolve uma Promise com o resultado.
   Nenhum tem derrota. O que muda é o custo, o tom e a pontuação.
   ========================================================================== */
(() => {
'use strict';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const BOT = () => !!window.__JOGO_BOT;
const lerp = (a, b, t) => a + (b - a) * t;

// ------------------------------------------------------------------ peças comuns
function fundo(root, img, extra = '') {
  root.insertAdjacentHTML('beforeend', `<div class="j6-bg ${extra}" style="background-image:url('${img}')"></div><div class="j6-veu"></div>`);
}
function painel(root) {
  root.insertAdjacentHTML('beforeend', '<div class="j6-texto" aria-live="polite"></div>');
  const el = root.querySelector('.j6-texto');
  return {
    el,
    diz(t, c, extra = '') {
      const s = c.sub(c.tr(t));
      const barr = s.startsWith('§');
      el.innerHTML = `<p class="${barr ? 'barriga' : ''} ${extra}">${c.esc(barr ? s.slice(1).trim() : s)}</p>`;
      el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    },
    limpa() { el.classList.remove('on'); },
  };
}
const ponteiro = (root) => {
  const p = { x: -1, y: -1, down: false };
  const pos = (e) => { const r = root.getBoundingClientRect(); p.x = e.clientX - r.left; p.y = e.clientY - r.top; };
  root.addEventListener('pointerdown', (e) => { if (window.__mgPausa) return; pos(e); p.down = true; try { root.setPointerCapture(e.pointerId); } catch (er) {} });
  root.addEventListener('pointermove', (e) => { pos(e); if (e.pointerType === 'mouse' && e.buttons === 0) p.down = false; });
  const up = () => { p.down = false; };
  root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up); root.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'mouse') up(); });
  return p;
};
const segura = (root, opts = {}) => {
  let seg = false;
  const down = (e) => { if (window.__mgPausa) return; if (e && e.cancelable) e.preventDefault(); seg = true; root.classList.add('segura'); opts.down && opts.down(); };
  const up = () => { if (!seg) return; seg = false; root.classList.remove('segura'); opts.up && opts.up(); };
  const kd = (e) => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); down(); } }, ku = (e) => { if (e.code === 'Space') up(); };
  root.addEventListener('pointerdown', down); addEventListener('pointerup', up); addEventListener('pointercancel', up); addEventListener('keydown', kd); addEventListener('keyup', ku);
  return { get on() { return seg || false; }, fim() { up(); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); removeEventListener('keydown', kd); removeEventListener('keyup', ku); } };
};

// ================================================================== FARO
// Um fio: uma curva da borda até um ponto da imagem, que ondula. O dedo em cima dele o fortalece.
function geraFio(f, W, H, seed) {
  const r = (n) => { const x = Math.sin(seed * 91.7 + n * 12.9) * 43758.5; return x - Math.floor(x); };
  const ex = f.ate[0] * W, ey = f.ate[1] * H;
  let sx, sy;
  switch (f.de) {
    case 'esq': sx = -20; sy = H * (.2 + r(1) * .6); break;
    case 'dir': sx = W + 20; sy = H * (.2 + r(1) * .6); break;
    case 'cima': sx = W * (.15 + r(1) * .7); sy = -20; break;
    default: sx = W * (.15 + r(1) * .7); sy = H + 20;
  }
  const c1 = [lerp(sx, ex, .33) + (r(2) - .5) * W * .25, lerp(sy, ey, .33) + (r(3) - .5) * H * .3];
  const c2 = [lerp(sx, ex, .66) + (r(4) - .5) * W * .25, lerp(sy, ey, .66) + (r(5) - .5) * H * .3];
  const N = 48, pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = 1 - t;
    pts.push({ x: u * u * u * sx + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * ex, y: u * u * u * sy + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * ey });
  }
  return pts;
}
const distSeg = (px, py, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy || 1; let t = ((px - a.x) * dx + (py - a.y) * dy) / l; t = clamp(t, 0, 1); const x = a.x + t * dx, y = a.y + t * dy; return [Math.hypot(px - x, py - y), t]; };
function distPts(px, py, pts) { let best = 1e9, bi = 0; for (let i = 0; i < pts.length - 1; i++) { const [d] = distSeg(px, py, pts[i], pts[i + 1]); if (d < best) { best = d; bi = i; } } return [best, bi]; }

function faro(root, c) {
  const { A, L, p, st } = c;
  const cfg = L.faro[p.jogoId], modo = cfg.modo, fome = c.fomeAlta();
  return new Promise((resolve) => {
    fundo(root, cfg.img, 'faro-bg');
    root.insertAdjacentHTML('beforeend', '<canvas class="fr-cv"></canvas><div class="fr-cavar"></div>');
    const cv = root.querySelector('.fr-cv'), cx = cv.getContext('2d'), cavar = root.querySelector('.fr-cavar');
    const P = painel(root), ptr = ponteiro(root);
    let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    const fios = cfg.fios.map((f, i) => Object.assign({}, f, { k: 0, feito: false, vis: modo === 'sequencia' ? 0 : 1, seed: i * 7 + 3 + (p.jogoId.charCodeAt(1) || 0), visto: false }));
    // a fome afia o nariz: um fio a mais (carne de três sol), e todos mais nítidos
    if (fome && (modo === 'alvo' || modo === 'rastro') && !fios.some((f) => f.id === 'carcaca')) fios.push({ id: 'carcaca', cor: '#6f7a3a', de: 'cima', ate: [.72, .3], larg: 18, isca: true, texto: c.L.nariz.carcaca.nome, cheiro: 'carcaca', k: 0, feito: false, vis: 1, seed: 77 });
    const tam = () => { const r = root.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); fios.forEach((f) => { f.pts = geraFio(f, W, H, f.seed); }); if (rastro) rastro.pts = geraRastro(); };
    // o rastro do bicho: do lado de onde o vento vai (a favor do vento) até o bicho, contra o vento
    let rastro = null;
    const geraRastro = () => {
      const pts = [], N = 70, rnd = (n) => { const x = Math.sin((rastro ? rastro.seed : 1) * 33.1 + n * 7.7) * 9999; return x - Math.floor(x); };
      const dirX = cfg.vento === 'dir' ? 1 : -1, x0 = dirX > 0 ? W * .08 : W * .92, x1 = dirX > 0 ? W * .86 : W * .14;
      let y = H * (.45 + rnd(1) * .25);
      for (let i = 0; i <= N; i++) { const t = i / N; y += (Math.sin(t * 9 + rnd(2) * 6) * .012 + (rnd(i + 5) - .5) * .008) * H; pts.push({ x: lerp(x0, x1, t), y: clamp(y, H * .22, H * .8) }); }
      return pts;
    };
    if (modo === 'rastro') rastro = { seed: 1, prog: 0, fugiu: 0, magro: false, pts: [] };
    tam(); addEventListener('resize', tam);
    c.gesto(root, 'nariz', 'faro');
    const t0 = performance.now(); let last = t0, tempo = 0, fim = false, iscaSeg = 0, seguidos = 0, iscasFeitas = 0, venc = null;
    const termina = (res, ms = 1800) => {
      if (fim) return; fim = true;
      setTimeout(() => { removeEventListener('resize', tam); resolve(res); }, BOT() ? 100 : ms);
    };
    const completa = (f) => {
      f.feito = true; f.k = 1; seguidos++;
      if (f.isca) iscasFeitas++;
      A.fareja && A.fareja();
      if (f.texto) P.diz(f.texto, c, f.alvo ? 'alvo' : '');
      if (f.cheiro) c.cheiro(f.cheiro, f.modo);
      if (f.texto && /^§/.test(c.tr(f.texto))) A.ronco && A.ronco(1);
      if (modo === 'alvo' && f.alvo) {
        const pts = Math.max(300, Math.round(1600 - tempo * 35 + 250 * (seguidos - 1) - 220 * iscasFeitas));
        termina({ tempo: Math.round(tempo), seguidos, iscas: iscasFeitas, pontos: pts });
      }
      if (modo === 'cavar' && !cavar.childElementCount) mostraCavar();
    };
    const mostraCavar = () => {
      fios.forEach((f) => {
        const b = document.createElement('button'); b.className = 'fr-dig'; b.type = 'button';
        b.style.left = (f.ate[0] * 100) + '%'; b.style.top = (f.ate[1] * 100) + '%';
        b.innerHTML = `<i></i><span>${c.esc(c.lang === 'en' ? 'Dig here' : 'Cavar aqui')}</span>`;
        b.onclick = (e) => { e.stopPropagation(); if (fim) return; A.sfx('cavar', .6, () => A.hiss(.6, 400, .6, .12, 0, 'lowpass')); cavar.querySelectorAll('.fr-dig').forEach((x) => x.classList.toggle('sel', x === b)); termina({ escolha: f.id, cheirou: fios.filter((x) => x.feito).map((x) => x.id), pontos: { A: 1500, B: 300, C: 600 }[f.id] || 500 }, 900); };
        cavar.appendChild(b); requestAnimationFrame(() => b.classList.add('on'));
      });
    };
    const desenhaFio = (pts, cor, larg, alfa, tt, seed, ond = 1) => {
      for (let L2 = 3; L2 >= 0; L2--) {
        cx.beginPath();
        pts.forEach((q, i) => {
          const w = Math.sin(tt * 1.3 + i * .35 + seed) * 6 * ond + Math.sin(tt * .7 + i * .15 + seed * 2) * 9 * ond;
          const x = q.x + w * .6, y = q.y + w;
          i ? cx.lineTo(x, y) : cx.moveTo(x, y);
        });
        cx.strokeStyle = cor; cx.globalAlpha = alfa * (L2 === 0 ? .9 : .22 / L2); cx.lineWidth = larg * (1 + L2 * .9); cx.lineCap = 'round'; cx.lineJoin = 'round';
        cx.stroke();
      }
      cx.globalAlpha = 1;
    };
    const loop = (now) => {
      if (!root.isConnected) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (window.__mgPausa) return requestAnimationFrame(loop);
      tempo += dt; const tt = now / 1000;
      cx.clearRect(0, 0, W, H);
      // o vento (só no rastro): riscos de areia indo do lado do bicho para o outro
      if (rastro) {
        const dirX = cfg.vento === 'dir' ? -1 : 1;
        cx.strokeStyle = 'rgba(236,214,170,.22)'; cx.lineWidth = 1.2;
        for (let i = 0; i < 26; i++) { const y = (i * 97.3 % H), x = ((tt * 260 * -dirX * -1 + i * 211) % (W + 200)); const xx = dirX < 0 ? W - x : x; cx.beginPath(); cx.moveTo(xx, y); cx.lineTo(xx + dirX * 26, y + 1); cx.stroke(); }
      }
      const toque = ptr.down || BOT();
      // os fios
      fios.forEach((f) => {
        if (modo === 'sequencia') { if (tempo >= (f.t || 0)) f.vis = Math.min(1, f.vis + dt * .8); if (!f.vis) return; }
        if (!f.pts) return;
        // fio que anda: a ponta foge devagar (é preciso acompanhar)
        if (f.anda && !f.feito) { const k = Math.sin(tt * .45 + f.seed) * .06; f.pts = geraFio(Object.assign({}, f, { ate: [f.ate[0] + k, f.ate[1] + Math.cos(tt * .37) * .04] }), W, H, f.seed); }
        // a isca puxa: o fio se curva para o dedo
        let pts = f.pts;
        if (f.isca && ptr.x >= 0 && !f.feito) {
          pts = f.pts.map((q) => { const d = Math.hypot(q.x - ptr.x, q.y - ptr.y), a = clamp(1 - d / 220, 0, 1) * .45; return { x: lerp(q.x, ptr.x, a), y: lerp(q.y, ptr.y, a) }; });
        }
        if (f.auto) {
          // o cheiro que vem sozinho: grosso, de todo lado, e não sai
          const a = f.vis;
          const g = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * .7);
          g.addColorStop(0, `rgba(60,48,70,${.0 + a * .35})`); g.addColorStop(1, `rgba(40,30,50,${a * .75})`);
          cx.fillStyle = g; cx.fillRect(0, 0, W, H);
          for (let j = 0; j < 6; j++) desenhaFio(geraFio(Object.assign({}, f, { de: ['esq', 'dir', 'cima', 'baixo', 'esq', 'dir'][j], ate: [.5 + Math.sin(j) * .1, .5 + Math.cos(j) * .1] }), W, H, j * 11), f.cor, 24, .35 * a, tt, j);
          if (a >= 1 && !f.feito) { f.dt = (f.dt || 0) + dt; if (f.dt > 2.4) { completa(f); termina({ seguidos, pontos: 600 + 250 * (seguidos - 1) }, 2600); } }
          return;
        }
        const base = (f.fino ? .32 : .42) + (fome ? .15 : 0);
        const alfa = (base + f.k * .55) * (f.vis || 1);
        desenhaFio(pts, f.cor, (f.larg || 14) * (f.fino ? .6 : 1) * (1 + f.k * .4), alfa, tt, f.seed, f.fino ? 1.4 : 1);
        if (f.feito) return;
        // o dedo em cima do fio
        let em = false;
        if (toque && ptr.x >= 0) { const [d] = distPts(ptr.x, ptr.y, pts); em = d < (f.larg || 14) * .5 + (f.isca ? 46 : 30); }
        if (BOT()) em = f.alvo || (modo === 'cavar' && f.id === 'A') || (modo === 'sequencia' && !f.auto);
        if (em) { f.k = Math.min(1, f.k + dt / (f.fino ? 1.9 : 1.4) * (BOT() ? 5 : 1)); if (f.isca) iscaSeg += dt; if (!f.visto) { f.visto = true; } }
        else f.k = Math.max(0, f.k - dt * .25);
        if (f.k >= 1) completa(f);
      });
      // o rastro do bicho
      if (rastro && !fim) {
        const pts = rastro.pts, N = pts.length - 1, pi = Math.floor(rastro.prog * N);
        // o que já foi seguido, forte; o que falta, fraco
        cx.save();
        desenhaFio(pts.slice(0, pi + 1), '#d9a868', 14, .7, tt, 5, .3);
        desenhaFio(pts.slice(Math.max(0, pi - 1)), '#b98a52', 9, .28 + (fome ? .1 : 0), tt, 5, .3);
        cx.restore();
        // o bicho, no fim do rastro
        const fimP = pts[N]; cx.fillStyle = rastro.prog > .7 ? 'rgba(80,52,30,.9)' : 'rgba(80,52,30,.35)';
        cx.beginPath(); cx.ellipse(fimP.x, fimP.y, 22, 12, 0, 0, Math.PI * 2); cx.fill();
        cx.beginPath(); cx.moveTo(fimP.x + 10, fimP.y - 8); cx.lineTo(fimP.x + 16, fimP.y - 30); cx.moveTo(fimP.x + 16, fimP.y - 8); cx.lineTo(fimP.x + 26, fimP.y - 26); cx.strokeStyle = cx.fillStyle; cx.lineWidth = 2.5; cx.stroke();
        // a cabeça do rastro: o lugar onde o dedo precisa estar
        const head = pts[Math.min(N, pi + 3)];
        cx.beginPath(); cx.arc(head.x, head.y, 18 + Math.sin(tt * 5) * 3, 0, Math.PI * 2); cx.strokeStyle = 'rgba(255,226,173,.55)'; cx.lineWidth = 2; cx.stroke();
        if (toque && ptr.x >= 0) {
          // tocar o bicho antes da hora: ele sente o cheiro do Kronk e foge
          if (Math.hypot(ptr.x - fimP.x, ptr.y - fimP.y) < 90 && rastro.prog < .78 && !rastro.magro) {
            rastro.magro = true; rastro.seed = 9; rastro.prog = 0; rastro.pts = geraRastro();
            P.diz(c.lang === 'en' ? 'Beast smell Kronk. Beast run.' : 'Bicho cheirar Kronk. Bicho correr.', c);
            A.sfx('bicho-foge', .6, () => A.hiss(.8, 900, .5, .1));
          } else {
            const [d] = distPts(ptr.x, ptr.y, pts.slice(pi, Math.min(N + 1, pi + 8)));
            if (d < 38) rastro.prog = Math.min(1, rastro.prog + dt * .11);
          }
        }
        if (BOT()) rastro.prog = Math.min(1, rastro.prog + dt * .9);
        // o tempo: demorar muito, e o bicho vai embora (uma vez)
        if (tempo > 42 && !rastro.magro) { rastro.magro = true; rastro.seed = 9; rastro.prog = 0; rastro.pts = geraRastro(); P.diz(c.lang === 'en' ? 'Beast go. Other beast. Thinner.' : 'Bicho ir. Outro bicho. Mais magro.', c); }
        if (rastro.prog >= 1) {
          P.diz(cfg.rastro.texto, c, 'alvo'); A.fareja();
          termina({ caca: rastro.magro ? 'magro' : 'bom', isca: Math.round(iscaSeg * 10) / 10, tempo: Math.round(tempo), pontos: Math.max(400, (rastro.magro ? 1300 : 2600) - Math.round(iscaSeg * 120)) }, 1600);
        }
      }
      if (BOT() && modo === 'cavar' && fios[0].feito && !fim) cavar.querySelector('.fr-dig') && cavar.querySelector('.fr-dig').click();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame((n) => { last = n; requestAnimationFrame(loop); });
  });
}

// ================================================================== QUIETO (debaixo do couro)
function quieto(root, c) {
  const { A, L } = c, cfg = L.quieto;
  return new Promise((resolve) => {
    fundo(root, cfg.img, 'qt-bg');
    root.insertAdjacentHTML('beforeend', '<div class="qt-sombras"><i></i><i></i><i></i></div><div class="qt-anel"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/></svg></div>');
    const anel = root.querySelector('.qt-anel circle');
    const P = painel(root);
    c.gesto(root, 'segurar', 'quieto');
    let t = 0, sons = 0, comecou = false, fim = false, last = performance.now(), passo = 0;
    const S = segura(root, {
      down: () => { if (!comecou) { comecou = true; A.sfx('marcha-abafada', .7, () => {}); } root.classList.remove('som'); },
      up: () => { if (!comecou || fim) return; sons++; root.classList.remove('som'); void root.offsetWidth; root.classList.add('som'); A.sfx('crianca-som', .6, () => { A.tone(180, .25, 'triangle', .07, 0, .7); }); P.diz(c.lang === 'en' ? 'Kronk make sound. Drum stop.' : 'Kronk fazer som. Tambor parar.', c); },
    });
    const loop = (now) => {
      if (!root.isConnected || fim) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!window.__mgPausa && (comecou || BOT())) {
        if (S.on || BOT()) t += dt * (BOT() ? 8 : 1);
        anel.style.strokeDashoffset = (277 * (1 - t / cfg.dur)).toFixed(1);
        passo -= dt; if (passo <= 0) { passo = .6 + Math.random() * .5; A.hiss(.3, 160, .8, .05, 0, 'lowpass'); }
        if (t >= cfg.dur) {
          fim = true; S.fim();
          P.diz(c.lang === 'en' ? 'Iron go. Far.' : 'Ferro ir. Longe.', c);
          setTimeout(() => resolve({ quieto: sons === 0, sons, pontos: Math.max(200, 1200 - sons * 300) }), BOT() ? 100 : 1800);
          return;
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame((n) => { last = n; loop(n); });
  });
}

// ================================================================== TOCHA (o posto à noite)
function tocha(root, c) {
  const { A, L } = c, cfg = L.tocha;
  return new Promise((resolve) => {
    fundo(root, cfg.img, 'tc-bg');
    root.insertAdjacentHTML('beforeend', '<div class="tc-escuro"></div><div class="tc-luz"></div><div class="tc-chao"><i class="tc-alvo"></i><i class="tc-kronk"></i></div>');
    const luz = root.querySelector('.tc-luz'), kr = root.querySelector('.tc-kronk');
    const P = painel(root);
    c.gesto(root, 'segurar', 'tocha');
    let prog = 0, visto = 0, last = performance.now(), fim = false, tt = 0, pegou = false, comecou = false;
    const S = segura(root, { down: () => { comecou = true; } });
    const loop = (now) => {
      if (!root.isConnected || fim) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!window.__mgPausa) {
        tt += dt;
        // a luz da torre: vai e volta, devagar
        const lx = .5 + Math.sin(tt * 1.45) * .48;
        luz.style.left = (lx * 100) + '%';
        const kx = .06 + prog * .84; kr.style.left = (kx * 100) + '%';
        const parado = S.on || (BOT() && Math.abs(lx - kx) < .2);
        const andando = !parado && (comecou || BOT());
        if (andando) prog = Math.min(1, prog + dt * (BOT() ? .5 : .085));
        kr.classList.toggle('anda', andando);
        const sob = Math.abs(lx - kx) < .085;
        root.classList.toggle('perigo', Math.abs(lx - kx) < .2);
        if (sob && andando && !pegou && visto < 3) {
          pegou = true; visto++; prog = Math.max(0, prog - .07);
          A.sfx('sentinela-grito', .6, () => { A.tone(300, .3, 'sawtooth', .04, 0, 1.3); });
          root.classList.remove('visto'); void root.offsetWidth; root.classList.add('visto');
          P.diz(c.lang === 'en' ? 'Iron look. Iron shout. Kronk go back one step.' : 'Ferro olhar. Ferro gritar. Kronk voltar um passo.', c);
        }
        if (!sob) pegou = false;
        if (prog >= 1) {
          fim = true; S.fim();
          P.diz(c.lang === 'en' ? 'Kronk at the tents. Kronk under the wheel.' : 'Kronk nas tenda. Kronk debaixo da roda.', c);
          setTimeout(() => resolve({ visto, pontos: Math.max(200, 1500 - visto * 400) }), BOT() ? 100 : 1600);
          return;
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame((n) => { last = n; loop(n); });
  });
}

// ================================================================== OLHAR (debaixo da Laje)
function olhar(root, c) {
  const { A, L, tr, st } = c, ex = L.laje;
  return new Promise((resolve) => {
    root.classList.add('explorar', 'olhar');
    root.insertAdjacentHTML('beforeend', `<div class="ex-rolo"><div class="ex-caixa" style="--r:${ex.proporcao};background-image:url('${ex.img}')"></div></div><p class="ex-instr"></p><div class="ex-texto"><div class="ex-corpo"></div><div class="ex-acoes"></div></div>`);
    const caixa = root.querySelector('.ex-caixa'), corpo = root.querySelector('.ex-corpo'), acoes = root.querySelector('.ex-acoes'), instr = root.querySelector('.ex-instr');
    c.gesto(root, 'tocar', 'olhar');
    const vistos = [];
    const conta = () => { instr.innerHTML = `<span>${c.esc(c.lang === 'en' ? 'Under the stone' : 'Debaixo da pedra')}</span><b>${vistos.length}<small>/${ex.pontos.length}</small></b>`; };
    conta();
    corpo.innerHTML = `<p>${c.esc(c.lang === 'en' ? 'Smell come out of the stone.' : 'Cheiro sair da pedra.')}</p>`;
    ex.pontos.forEach((pt) => {
      const b = document.createElement('button'); b.className = 'ex-pt';
      Object.assign(b.style, { left: (pt.x - pt.w / 2) + '%', top: (pt.y - pt.h / 2) + '%', width: pt.w + '%', height: pt.h + '%' });
      b.innerHTML = `<i></i><span>${c.esc(tr(pt.rotulo))}</span>`;
      b.onclick = (e) => {
        e.stopPropagation(); A.fareja();
        corpo.innerHTML = `<p class="novo">${c.esc(tr(pt.texto))}</p>`; b.classList.add('visto');
        if (!vistos.includes(pt.id)) vistos.push(pt.id);
        conta();
        if (vistos.length >= ex.pontos.length && !acoes.innerHTML) {
          acoes.innerHTML = `<button class="cta porta">${c.esc(tr(ex.porta))}</button>`;
          acoes.querySelector('.porta').onclick = () => resolve({ vistos: vistos.slice() });
        }
      };
      caixa.appendChild(b);
    });
    if (BOT()) setTimeout(() => { [...caixa.querySelectorAll('.ex-pt')].forEach((b, i) => setTimeout(() => b.click(), 60 + i * 60)); setTimeout(() => { const pb = root.querySelector('.porta'); pb && pb.click(); }, 600); }, 200);
  });
}

// ================================================================== TREINO (o pau da Hessa)
function treino(root, c) {
  const { A, L, tr } = c, cfg = L.treino;
  return new Promise((resolve) => {
    root.insertAdjacentHTML('beforeend', `<div class="tr-img guarda" style="background-image:url('${cfg.guarda}')"></div><div class="tr-img ergue" style="background-image:url('${cfg.ergue}')"></div><div class="j6-veu leve"></div><ol class="tr-cont">${'<li></li>'.repeat(5)}</ol><div class="tr-luz"></div>`);
    const P = painel(root), cont = root.querySelectorAll('.tr-cont li');
    c.gesto(root, 'tocar', 'treino');
    let fase = 'guarda', t = 0, dur = 1.2, n = 0, acertos = 0, fim = false, last = performance.now();
    const set = (f, d) => { fase = f; t = 0; dur = d; root.classList.toggle('aberta', f === 'aberta'); };
    const bastao = () => A.sfx('bastao', .7, () => { A.tone(420, .07, 'square', .06); A.hiss(.08, 2000, 2, .1); });
    const resolveTroca = (ok) => {
      bastao();
      if (ok) { acertos++; P.diz(cfg.acerta, c); cont[n].className = 'ok'; }
      else { P.diz(cfg.apanha, c); cont[n].className = 'nao'; root.classList.remove('luzinha'); void root.offsetWidth; root.classList.add('luzinha'); }
      n++; set('pausa', 1.1);
    };
    root.addEventListener('pointerdown', () => { if (window.__mgPausa || fim) return; if (fase === 'aberta') resolveTroca(true); else if (fase === 'guarda') resolveTroca(false); });
    const kd = (e) => { if ((e.code === 'Space' || e.key === 'j' || e.key === 'J') && !e.repeat) { if (fase === 'aberta') resolveTroca(true); else if (fase === 'guarda' && !window.__mgPausa) resolveTroca(false); } };
    addEventListener('keydown', kd);
    set('guarda', 1.6);
    const loop = (now) => {
      if (!root.isConnected || fim) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!window.__mgPausa) {
        t += dt;
        if (BOT() && fase === 'aberta') resolveTroca(true);
        if (t >= dur) {
          if (fase === 'guarda') set('aberta', .62);
          else if (fase === 'aberta') resolveTroca(false);   // ela bate primeiro
          else if (fase === 'pausa') {
            if (n >= 5) { fim = true; removeEventListener('keydown', kd); setTimeout(() => resolve({ acertos }), BOT() ? 50 : 900); return; }
            set('guarda', .9 + Math.random() * 1.1);
          }
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame((nn) => { last = nn; loop(nn); });
  });
}

// ================================================================== CARNE (arrastar)
const SVG_CARNE = '<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M8 52c-6-2-8-10-2-14 4-3 9-1 11 2l14 4c6-14 22-24 40-24 22 0 40 12 40 26S93 72 71 72c-16 0-30-6-36-16l-14 3c-1 4-6 7-11 5"/><path class="gordura" d="M48 40c8-8 22-12 34-8M50 54c10 4 24 4 36-2"/></svg>';
function carne(root, c) {
  const { A, L, tr } = c, cfg = L.carne;
  return new Promise((resolve) => {
    fundo(root, cfg.img, 'cn-bg');
    root.insertAdjacentHTML('beforeend', `
      <div class="cn-zona rasgar" data-d="rasgar"><b>${c.esc(tr(cfg.rasgar))}</b></div>
      <div class="cn-zona ikk" data-d="ikk"><b>${c.esc(tr(cfg.ikk))}</b></div>
      <div class="cn-zona boca" data-d="boca"><b>${c.esc(tr(cfg.boca))}</b></div>
      <div class="cn-carne">${SVG_CARNE}</div>`);
    const m = root.querySelector('.cn-carne'), zonas = [...root.querySelectorAll('.cn-zona')];
    c.gesto(root, 'arrastar', 'carne');
    let arr = false, ox = 0, oy = 0, fim = false;
    const zonaEm = (x, y) => zonas.find((z) => { const r = z.getBoundingClientRect(); return x > r.left && x < r.right && y > r.top && y < r.bottom; });
    m.addEventListener('pointerdown', (e) => { if (window.__mgPausa || fim) return; arr = true; const r = m.getBoundingClientRect(); ox = e.clientX - (r.left + r.width / 2); oy = e.clientY - (r.top + r.height / 2); try { m.setPointerCapture(e.pointerId); } catch (er) {} m.classList.add('pega'); });
    m.addEventListener('pointermove', (e) => {
      if (!arr) return; const rr = root.getBoundingClientRect();
      m.style.left = (e.clientX - ox - rr.left) + 'px'; m.style.top = (e.clientY - oy - rr.top) + 'px';
      zonas.forEach((z) => z.classList.toggle('sob', z === zonaEm(e.clientX, e.clientY)));
    });
    const solta = (e) => {
      if (!arr) return; arr = false; m.classList.remove('pega');
      const z = zonaEm(e.clientX, e.clientY);
      if (!z) { m.style.left = ''; m.style.top = ''; return; }
      vai(z.dataset.d);
    };
    m.addEventListener('pointerup', solta); m.addEventListener('pointercancel', solta);
    const vai = (d) => {
      if (fim) return; fim = true;
      zonas.forEach((z) => z.classList.toggle('sel', z.dataset.d === d));
      m.classList.add('vai-' + d);
      if (d === 'boca') { [0, 500, 1000].forEach((ms) => setTimeout(() => A.mastiga(), ms)); }
      else if (d === 'rasgar') { A.sfx('carne-rasga', .7, () => A.hiss(.5, 700, .6, .14)); }
      else A.sfx('passos-areia', .5, () => A.hiss(.3, 300, .6, .1, 0, 'lowpass'));
      setTimeout(() => resolve({ destino: d }), BOT() ? 50 : 1500);
    };
    if (BOT()) setTimeout(() => vai(window.__CARNE || 'rasgar'), 200);
  });
}

// ================================================================== SEGURO (as mãos)
function seguro(root, c) {
  const { A, L, st, tr } = c, cfg = L.seguro;
  return new Promise((resolve) => {
    root.insertAdjacentHTML('beforeend', `<div class="sg-longe" style="background-image:url('${cfg.fundo}')"></div><div class="sg-maos" style="background-image:url('${typeof cfg.img === 'function' ? cfg.img(st) : cfg.img}')"></div><div class="sg-borda"></div><ol class="tr-cont">${'<li></li>'.repeat(3)}</ol>`);
    const longe = root.querySelector('.sg-longe'), maos = root.querySelector('.sg-maos'), cont = root.querySelectorAll('.tr-cont li');
    const P = painel(root);
    c.gesto(root, 'puxar', 'seguro');
    let y0 = null, d = 0, max = 0, n = 0, fim = false, solto = true, last = performance.now(), forca = 0;
    const LIM = 220;
    root.addEventListener('pointerdown', (e) => { if (window.__mgPausa || fim) return; y0 = e.clientY; solto = false; A.sfx('seguro-forca', .6, () => A.hiss(1.2, 220, .6, .12, 0, 'lowpass')); });
    root.addEventListener('pointermove', (e) => { if (y0 == null || fim) return; const dy = Math.max(0, y0 - e.clientY); d = LIM * (1 - Math.exp(-dy / LIM)); });
    const solta = () => {
      if (y0 == null || fim) return; y0 = null; solto = true;
      const r = d / LIM; max = Math.max(max, r);
      if (r > .12) { P.diz(cfg.linhas[n], c); cont[n].className = 'ok'; n++; A.sfx('grakh-grunhe', .5, () => A.tone(90, .4, 'sawtooth', .05, 0, .7)); }
      if (n >= 3) { fim = true; setTimeout(() => resolve({ forca: Math.round(max * 100) / 100 }), BOT() ? 50 : 2600); }
    };
    addEventListener('pointerup', solta); addEventListener('pointercancel', solta);
    const loop = (now) => {
      if (!root.isConnected) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (BOT() && !fim) { if (solto) { y0 = 0; solto = false; d = LIM * .9; setTimeout(solta, 30); } }
      if (solto) d *= Math.pow(.02, dt);   // volta como mola
      forca = d / LIM;
      const tre = forca * 9 * (solto ? 0 : 1);
      longe.style.transform = `scale(${1 + forca * .35}) translate(${(Math.random() - .5) * tre}px, ${(Math.random() - .5) * tre}px)`;
      maos.style.transform = `translateY(${-d * .55}px) translate(${(Math.random() - .5) * tre}px, 0)`;
      root.style.setProperty('--forca', forca.toFixed(3));
      if (!fim || d > 1) requestAnimationFrame(loop);
    };
    requestAnimationFrame((nn) => { last = nn; loop(nn); });
  });
}

window.JOGOS6 = { faro, quieto, tocha, olhar, treino, carne, seguro };
})();
