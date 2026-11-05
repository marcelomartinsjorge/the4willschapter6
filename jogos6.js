/* ==========================================================================
   Capítulo VI · os momentos de jogo do Kronk (sem sprite: imagem, código e dedo)
   FARO    · cada coisa solta fumaça de cheiro; o ponteiro é o nariz e segurar
             é puxar o ar; o cheiro puxado vira palavra. Modos:
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
// O nariz do Kronk. Cada coisa solta uma fumaça de cheiro que o vento leva: mais grossa onde nasce,
// mais rala longe. O ponteiro (o dedo, ou o mouse) é o nariz. Segurar é puxar o ar: a fumaça perto
// do nariz vem para ele. Cheiro puxado o bastante vira palavra. O jogo é achar de onde o cheiro nasce.
// Modos: alvo (achar um), sequencia (os cheiros chegam sozinhos), rastro (as pegadas do bicho só
// aparecem perto do nariz; chegar perto do bicho antes da hora o espanta), cavar (cheirar três
// buracos e escolher onde cavar). Com fome, os cheiros de comida vêm atrás do nariz sozinhos.
function clareia(cor, m = .32) {
  const n = parseInt(cor.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, f = (v) => Math.round(v + (255 - v) * m).toString(16).padStart(2, '0');
  return '#' + f(r) + f(g) + f(b);
}
function blob(cor) {
  cor = clareia(cor);
  const k = document.createElement('canvas'); k.width = k.height = 64; const g = k.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, cor); r.addColorStop(.45, cor + '88'); r.addColorStop(1, cor + '00');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); return k;
}
function faro(root, c) {
  const { A, L, p } = c;
  const cfg = L.faro[p.jogoId], modo = cfg.modo, fome = c.fomeAlta(), en = c.lang === 'en';
  const toque = matchMedia('(pointer: coarse)').matches;
  return new Promise((resolve) => {
    fundo(root, cfg.img, 'faro-bg');
    root.insertAdjacentHTML('beforeend', '<canvas class="fr-cv"></canvas><div class="fr-tags"></div><div class="fr-cavar"></div><div class="fr-nariz"><svg viewBox="0 0 100 100"><circle class="f" cx="50" cy="50" r="44"/><circle class="p" cx="50" cy="50" r="44"/></svg></div><p class="fr-ajuda"></p>');
    const cv = root.querySelector('.fr-cv'), cx = cv.getContext('2d'), tags = root.querySelector('.fr-tags'), cavar = root.querySelector('.fr-cavar');
    const nariz = root.querySelector('.fr-nariz'), narizP = nariz.querySelector('.p'), ajuda = root.querySelector('.fr-ajuda');
    const P = painel(root);
    let W = 0, H = 0; const dpr = Math.min(devicePixelRatio || 1, 2);
    // o nariz: onde o ponteiro está; segurar (clique, dedo ou espaço) é puxar o ar
    const nz = { x: -999, y: -999, puxa: false, dentro: false };
    const pos = (e) => { const r = root.getBoundingClientRect(); nz.x = e.clientX - r.left; nz.y = e.clientY - r.top; nz.dentro = true; };
    const naoE = (e) => e.target.closest && e.target.closest('button, .j6-gesto, .mg-x');
    const pd = (e) => { if (window.__mgPausa || naoE(e)) return; pos(e); nz.puxa = true; if (e.pointerType !== 'mouse') { try { root.setPointerCapture(e.pointerId); } catch (er) {} } };
    const pm = (e) => { pos(e); if (e.pointerType === 'mouse' && e.buttons === 0 && !espaco) nz.puxa = false; };
    const pu = () => { if (!espaco) nz.puxa = false; if (toque) nz.dentro = false; };
    let espaco = false;
    const kd = (e) => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); espaco = true; nz.puxa = true; } };
    const ku = (e) => { if (e.code === 'Space') { espaco = false; nz.puxa = false; } };
    root.addEventListener('pointerdown', pd); root.addEventListener('pointermove', pm); addEventListener('pointerup', pu); addEventListener('pointercancel', pu); addEventListener('keydown', kd); addEventListener('keyup', ku);
    root.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') nz.dentro = false; });
    ajuda.textContent = toque ? (en ? 'Hold your finger on the screen to sniff. Drag toward where the smell is born.' : 'Segure o dedo na tela para cheirar. Arraste até onde o cheiro nasce.')
      : (en ? 'Hold the click (or space) to sniff. Move the nose to where the smell is born.' : 'Segure o clique (ou o espaço) para cheirar. Leve o nariz até onde o cheiro nasce.');

    // as fontes de cheiro
    const lembra = (f) => f.cheiro && c.st.nariz && c.st.nariz.includes(f.cheiro);
    const fontes = cfg.fios.map((f, i) => Object.assign({}, f, { got: 0, feito: false, vis: modo === 'sequencia' ? 0 : 1, seed: i * 7 + 3, acc: 0, img: blob(f.cor), gold: null }));
    // a fome afia o nariz e traz um cheiro a mais: carne de três sol, que vem atrás do nariz
    if (fome && (modo === 'alvo' || modo === 'rastro') && !fontes.some((f) => f.id === 'carcaca')) fontes.push({ id: 'carcaca', cor: '#8a9a3a', ate: [.74, .3], larg: 18, isca: true, texto: c.L.nariz.carcaca.nome, cheiro: 'carcaca', got: 0, feito: false, vis: 1, seed: 77, acc: 0, img: blob('#8a9a3a') });
    fontes.forEach((f) => { if (lembra(f)) f.gold = blob('#ffd27a'); });
    const need = (f) => (f.auto ? 1e9 : (modo === 'sequencia' ? 14 : f.fino ? 18 : 24) * (lembra(f) ? .5 : 1));
    // o vento: para onde a fumaça vai
    const vento = cfg.vento === 'dir' ? 1 : cfg.vento === 'esq' ? -1 : .35;
    const parts = [];
    const fx = (f) => { const t = performance.now() / 1000; return (f.ate[0] + (f.anda && !f.feito ? Math.sin(t * .5 + f.seed) * .07 : 0)) * W; };
    const fy = (f) => { const t = performance.now() / 1000; return (f.ate[1] + (f.anda && !f.feito ? Math.cos(t * .41 + f.seed) * .05 : 0)) * H; };
    const tam = () => { const r = root.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); if (rastro) rastro.pts = geraRastro(); };

    // o rastro do bicho (caça): pegadas que só aparecem perto do nariz
    let rastro = null;
    const geraRastro = () => {
      const pts = [], N = 9, b = cfg.bicho || [.84, .6], o = cfg.inicio || [.1, .7];
      for (let i = 0; i <= N; i++) { const t = i / N; pts.push({ x: (o[0] + (b[0] - o[0]) * t + (i && i < N ? Math.sin(t * 7 + rastro.seed) * .05 : 0)) * W, y: (o[1] + (b[1] - o[1]) * t + (i && i < N ? Math.cos(t * 5 + rastro.seed) * .05 : 0)) * H }); }
      return pts;
    };
    if (modo === 'rastro') rastro = { seed: 1, i: 0, k: 0, magro: false, pts: [] };
    tam(); addEventListener('resize', tam);
    c.gesto(root, 'nariz', 'faro');

    const t0 = performance.now(); let last = t0, tempo = 0, fim = false, seguidos = 0, iscasFeitas = 0, iscaT = 0, parado = 0;
    const limpa = () => { removeEventListener('resize', tam); removeEventListener('pointerup', pu); removeEventListener('pointercancel', pu); removeEventListener('keydown', kd); removeEventListener('keyup', ku); };
    const termina = (res, ms = 1800) => { if (fim) return; fim = true; nariz.classList.add('fora'); setTimeout(() => { limpa(); resolve(res); }, BOT() ? 100 : ms); };
    const tag = (f, x, y) => { const s = c.sub(c.tr(f.texto || '')).replace(/^§\s*/, ''); if (!s) return; const t = document.createElement('span'); t.className = 'fr-tag' + (f.alvo ? ' alvo' : '') + (f.isca ? ' isca' : ''); t.textContent = s.length > 46 ? s.slice(0, 44) + '…' : s; t.style.left = (x / W * 100) + '%'; t.style.top = (y / H * 100) + '%'; tags.appendChild(t); requestAnimationFrame(() => t.classList.add('on')); };
    const completa = (f) => {
      if (f.feito) return;
      f.feito = true; seguidos++; ajuda.classList.add('some');
      if (f.isca) iscasFeitas++;
      A.fareja && A.fareja();
      if (f.texto) P.diz(f.texto, c, f.alvo ? 'alvo' : '');
      if (f.texto && /^§/.test(c.tr(f.texto))) A.ronco && A.ronco(1);
      if (f.cheiro) c.cheiro(f.cheiro, f.modo);
      if (!f.auto) tag(f, fx(f), fy(f));
      // a explosão de cheiro na fonte
      for (let i = 0; i < 26; i++) { const a = Math.random() * 6.28, v = 40 + Math.random() * 120; parts.push({ f, x: fx(f), y: fy(f), vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: .9, r: 10 + Math.random() * 14, pop: true }); }
      if (modo === 'alvo' && f.alvo) {
        const pts = Math.max(300, Math.round(1600 - tempo * 30 + 200 * (seguidos - 1) - 220 * iscasFeitas));
        termina({ tempo: Math.round(tempo), seguidos, iscas: iscasFeitas, pontos: pts });
      }
      if (modo === 'cavar' && !cavar.childElementCount) mostraCavar();
      if (modo === 'cavar' && fontes.every((x) => x.feito)) P.diz(en ? 'Three holes. Three smells. Kronk choose.' : 'Três buraco. Três cheiro. Kronk escolher.', c);
    };
    const mostraCavar = () => {
      fontes.forEach((f) => {
        const b = document.createElement('button'); b.className = 'fr-dig'; b.type = 'button'; b.dataset.id = f.id;
        b.style.left = (f.ate[0] * 100) + '%'; b.style.top = (f.ate[1] * 100 + 9) + '%';
        b.innerHTML = `<i></i><span>${c.esc(en ? 'Dig here' : 'Cavar aqui')}</span>`;
        const vai = (e) => { e.preventDefault(); e.stopPropagation(); if (fim) return; A.sfx('cavar', .6, () => A.hiss(.6, 400, .6, .12, 0, 'lowpass')); cavar.querySelectorAll('.fr-dig').forEach((x) => x.classList.toggle('sel', x === b)); termina({ escolha: f.id, cheirou: fontes.filter((x) => x.feito).map((x) => x.id), pontos: { A: 1500, B: 300, C: 600 }[f.id] || 500 }, 900); };
        b.addEventListener('pointerdown', (e) => e.stopPropagation()); b.addEventListener('click', vai);
        cavar.appendChild(b); requestAnimationFrame(() => b.classList.add('on'));
      });
    };

    let sniffT = 0;
    const loop = (now) => {
      if (!root.isConnected) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (window.__mgPausa) return requestAnimationFrame(loop);
      tempo += dt; const tt = now / 1000;
      // o robô dos testes: leva o nariz até o cheiro certo
      if (BOT()) {
        const alvo = rastro && !rastro.fim ? null : fontes.find((f) => (f.alvo || (modo === 'cavar' && f.id === 'A') || (modo === 'sequencia' && !f.auto)) && !f.feito && f.vis > .3);
        if (rastro) { const q = rastro.pts[Math.min(rastro.i, rastro.pts.length - 1)]; nz.x = q.x; nz.y = q.y; }
        else if (alvo) { nz.x = fx(alvo); nz.y = fy(alvo); }
        nz.puxa = true; nz.dentro = true;
      }
      const puxa = nz.puxa && nz.dentro && !fim;
      // o nariz na tela
      nariz.style.transform = `translate(${nz.x}px, ${nz.y}px)`;
      nariz.classList.toggle('on', nz.dentro && !fim); nariz.classList.toggle('puxa', puxa);
      if (puxa) { sniffT -= dt; if (sniffT <= 0) { sniffT = .55; A.fareja && A.fareja(); } } else sniffT = 0;
      // ninguém mexendo há um tempo: o cheiro mais forte que falta pulsa
      parado = puxa ? 0 : parado + dt;
      cx.clearRect(0, 0, W, H);
      // as fontes soltam fumaça
      fontes.forEach((f) => {
        if (modo === 'sequencia' && tempo >= (f.t || 0)) f.vis = Math.min(1, f.vis + dt * .9);
        if (!f.vis) return;
        if (f.auto) return;
        const rate = (f.feito ? 7 : f.fino ? 14 : f.forte ? 36 : 24) * f.vis * (fome && f.isca ? 1.5 : 1);
        f.acc += rate * dt;
        while (f.acc >= 1) { f.acc--; const sx = fx(f), sy = fy(f); parts.push({ f, x: sx + (Math.random() - .5) * 14, y: sy + (Math.random() - .5) * 14, vx: vento * (40 + Math.random() * 45) + (Math.random() - .5) * 24, vy: -32 - Math.random() * 40, age: 0, life: 3.4 + Math.random() * 1.8, r: (f.larg || 14) * (f.fino ? .45 : .7) }); }
      });
      // o cheiro que vem sozinho (sequência): cobre tudo
      const auto = fontes.find((f) => f.auto && f.vis > 0);
      if (auto) {
        const a = auto.vis, g = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * .7);
        g.addColorStop(0, `rgba(60,48,70,${a * .35})`); g.addColorStop(1, `rgba(40,30,50,${a * .8})`); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
        for (let k = 0; k < 6; k++) parts.push({ f: auto, x: Math.random() * W, y: H + 10, vx: (Math.random() - .5) * 40, vy: -40 - Math.random() * 60, age: 0, life: 3, r: 40 });
        if (a >= 1 && !auto.feito) { auto.dt = (auto.dt || 0) + dt; if (auto.dt > 2.4) { completa(auto); termina({ seguidos, pontos: 600 + 250 * (seguidos - 1) }, 2600); } }
      }
      // as partículas: sobem, o vento leva, ondulam; perto do nariz que puxa, vão para ele
      const R = toque ? 150 : 130;
      for (let i = parts.length - 1; i >= 0; i--) {
        const q = parts[i]; q.age += dt;
        if (q.age >= q.life) { parts.splice(i, 1); continue; }
        if (!q.pop) { q.vx += Math.sin(tt * 1.3 + q.y * .015 + q.f.seed) * 38 * dt; q.r += dt * (q.f.fino ? 7 : 15); }
        const dx = nz.x - q.x, dy = nz.y - q.y, d = Math.hypot(dx, dy) || 1;
        // a fome: a comida vem atrás do nariz mesmo sem puxar
        const isca = fome && q.f.isca && !q.f.feito && nz.dentro;
        if (!q.pop && ((puxa && d < R) || (isca && d < 300))) {
          const k = (puxa && d < R ? (1 - d / R) * 1400 : 0) + (isca ? 260 * (1 - d / 300) : 0);
          q.vx += dx / d * k * dt; q.vy += dy / d * k * dt; q.vx *= .94; q.vy *= .94;
          if (d < 18 && puxa) { parts.splice(i, 1); if (!q.f.feito) { q.f.got += lembra(q.f) ? 1.6 : 1; if (q.f.isca) iscaT += .12; } continue; }
        }
        q.x += q.vx * dt; q.y += q.vy * dt;
      }
      // puxar em cima da fonte enche mais depressa: o lugar onde o cheiro nasce
      if (puxa) fontes.forEach((f) => { if (f.feito || f.auto || !f.vis) return; const d = Math.hypot(nz.x - fx(f), nz.y - fy(f)); if (d < 70) f.got += dt * 9 * (1 - d / 70) * (lembra(f) ? 1.6 : 1); });
      fontes.forEach((f) => { if (!f.feito && !f.auto && f.got >= need(f)) completa(f); });
      // desenha as partículas
      cx.globalCompositeOperation = 'screen';
      parts.forEach((q) => {
        const t = q.age / q.life, al = (q.pop ? (1 - t) * .8 : Math.min(1, q.age * 2.5) * Math.pow(1 - t, 1.3) * .38) * (q.f.feito && !q.pop ? .45 : 1) * (q.f.vis || 1);
        const img = q.f.gold && !q.f.feito ? q.f.gold : q.f.img;
        cx.globalAlpha = al; const r = q.r * (q.pop ? 1 + t : 1); cx.drawImage(img, q.x - r, q.y - r, r * 2, r * 2);
      });
      cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
      // a dica: parado muito tempo, a fonte certa respira
      if (parado > 6 && !fim) {
        const f = fontes.find((x) => x.alvo && !x.feito) || fontes.find((x) => !x.feito && !x.auto && x.vis > .5 && !x.isca);
        if (f) { const r = 30 + Math.sin(tt * 4) * 8; cx.strokeStyle = 'rgba(255,226,173,.35)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(fx(f), fy(f), r, 0, 6.3); cx.stroke(); }
      }
      // o anel do nariz: o quanto do cheiro mais puxado já entrou
      const melhor = fontes.filter((f) => !f.feito && !f.auto).sort((a, b) => b.got / need(b) - a.got / need(a))[0];
      const kN = melhor ? Math.min(1, melhor.got / need(melhor)) : 0;
      narizP.style.strokeDashoffset = (277 * (1 - kN)).toFixed(1);
      narizP.style.stroke = melhor ? (melhor.gold ? '#ffd27a' : melhor.cor) : '#fff';
      // o cheiro que não foi puxado se perde devagar
      fontes.forEach((f) => { if (!f.feito && !puxa) f.got = Math.max(0, f.got - dt * 1.5); });

      // o rastro do bicho
      if (rastro && !fim) {
        const pts = rastro.pts, N = pts.length - 1, bicho = pts[N];
        // as pegadas: as já cheiradas ficam; a próxima aparece se o nariz estiver perto e puxando
        for (let i = 0; i < N; i++) {
          const q = pts[i], d = Math.hypot(nz.x - q.x, nz.y - q.y), feita = i < rastro.i;
          const vis = feita ? .75 : (i === rastro.i ? (puxa ? clamp(1.2 - d / 220, 0, 1) : .12 + .1 * Math.sin(tt * 3)) : (puxa ? clamp(.6 - d / 260, 0, .4) : 0));
          if (vis <= .01) continue;
          cx.globalAlpha = vis; cx.fillStyle = feita ? '#d9a868' : '#f0c890';
          for (let k = 0; k < 2; k++) { cx.beginPath(); cx.ellipse(q.x + (k ? 12 : -8), q.y + (k ? -6 : 6), 7, 10, .3, 0, 6.3); cx.fill(); }
          cx.globalAlpha = 1;
          if (i === rastro.i && puxa && d < 60) { rastro.k += dt; if (rastro.k > .45) { rastro.i++; rastro.k = 0; A.fareja(); } }
        }
        // o bicho, no fim; perto do fim ele aparece
        const pr = rastro.i / N;
        // o cheiro do bicho: fraco longe, forte quando o rastro chega perto
        if (pr > .5) { const g = cx.createRadialGradient(bicho.x, bicho.y, 0, bicho.x, bicho.y, 70); g.addColorStop(0, `rgba(240,200,140,${(pr - .5) * .5 * (.7 + .3 * Math.sin(tt * 4))})`); g.addColorStop(1, 'rgba(240,200,140,0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(bicho.x, bicho.y, 70, 0, 6.3); cx.fill(); }
        // chegar no bicho antes de seguir o rastro: ele sente o Kronk e foge
        if (puxa && Math.hypot(nz.x - bicho.x, nz.y - bicho.y) < 110 && pr < .75 && !rastro.magro) {
          rastro.magro = true; rastro.seed = 9; rastro.i = 0; rastro.pts = geraRastro();
          P.diz(en ? 'Beast smell Kronk. Beast run.' : 'Bicho cheirar Kronk. Bicho correr.', c);
          A.sfx('bicho-foge', .6, () => A.hiss(.8, 900, .5, .1));
        }
        if (tempo > 60 && !rastro.magro) { rastro.magro = true; rastro.seed = 9; rastro.i = 0; rastro.pts = geraRastro(); P.diz(en ? 'Beast go. Other beast. Thinner.' : 'Bicho ir. Outro bicho. Mais magro.', c); }
        if (BOT()) { rastro.k += dt * 4; }
        if (rastro.i >= N) {
          P.diz(cfg.rastro.texto, c, 'alvo'); A.fareja();
          termina({ caca: rastro.magro ? 'magro' : 'bom', isca: Math.round(iscaT * 10) / 10, tempo: Math.round(tempo), pontos: Math.max(400, (rastro.magro ? 1300 : 2600) - Math.round(iscaT * 120)) }, 1600);
        }
      }
      if (BOT() && modo === 'cavar' && fontes[0].feito && !fim) { const b = cavar.querySelector('.fr-dig'); b && b.click(); }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame((n) => { last = n; requestAnimationFrame(loop); });
  });
}

// ================================================================== QUIETO (debaixo do couro)
// Segurar é segurar o ar. O ar acaba. Respirar só é seguro quando a marcha está alta
// (o barulho cobre). Quando a marcha para e a sombra fica no couro, respirar é ser ouvido.
function quieto(root, c) {
  const { A, L } = c, cfg = L.quieto;
  const en = c.lang === 'en';
  // o roteiro da marcha: [tipo, segundos]
  const ROT = cfg.roteiro || [['marcha', 3.2], ['para', 2.4], ['marcha', 2.8], ['para', 3.2], ['marcha', 2.2], ['para', 4.0], ['marcha', 1.6]];
  const AR = cfg.ar || 4.8;
  return new Promise((resolve) => {
    fundo(root, cfg.img, 'qt-bg');
    root.insertAdjacentHTML('beforeend', '<div class="qt-sombras"><i></i><i></i><i></i></div><div class="qt-para"><svg viewBox="0 0 100 160" preserveAspectRatio="xMidYMax meet"><path d="M50 6c-11 0-19 8-19 19v6c0 7 4 13 9 16-14 3-27 10-31 22L4 160h92l-5-91c-4-12-17-19-31-22 5-3 9-9 9-16v-6C69 14 61 6 50 6z"/></svg></div><div class="qt-anel"><svg viewBox="0 0 100 100"><circle class="fundo" cx="50" cy="50" r="44"/><circle class="ar" cx="50" cy="50" r="44"/></svg><span>' + (en ? 'air' : 'ar') + '</span></div><div class="qt-estado"></div>');
    const anel = root.querySelector('.qt-anel circle.ar'), sombra = root.querySelector('.qt-para');
    const est = root.querySelector('.qt-estado');
    const TX = en ? { ini: 'Hold to hold your breath', marcha: 'NOISE · let go and breathe', vai: 'the steps slow down…', para: 'SILENCE · hold the air', segura: 'holding', solta: 'breathing' }
      : { ini: 'Segure para prender o ar', marcha: 'BARULHO · solte e respire', vai: 'os passos diminuem…', para: 'SILÊNCIO · prenda o ar', segura: 'prendendo', solta: 'respirando' };
    const rotulo = root.querySelector('.qt-anel span');
    let estAtual = '';
    const mostra = (k) => { if (estAtual === k) return; estAtual = k; est.textContent = TX[k]; est.className = 'qt-estado on ' + k; };
    mostra('ini');
    const P = painel(root);
    c.gesto(root, 'segurar', 'quieto');
    let ar = 1, fase = 0, tf = 0, sons = 0, comecou = false, fim = false, last = performance.now(), passo = 0, avisou = false, puxou = false;
    const tipo = () => (ROT[fase] || ['fim'])[0];
    const S = segura(root, {
      down: () => { if (!comecou) { comecou = true; A.sfx('marcha-abafada', .7, () => {}); } },
      up: () => { if (!comecou || fim) return; if (tipo() === 'para') ouvido(en ? 'Kronk breathe. Iron hear.' : 'Kronk respirar. Ferro ouvir.'); },
    });
    const ouvido = (t) => {
      sons++; root.classList.remove('som'); void root.offsetWidth; root.classList.add('som');
      A.sfx('crianca-som', .6, () => { A.tone(180, .25, 'triangle', .07, 0, .7); });
      P.diz(t, c);
      // a sombra demora mais no couro: quem ouviu fica
      if (tipo() === 'para') tf = Math.max(0, tf - 1.2);
    };
    const loop = (now) => {
      if (!root.isConnected || fim) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!window.__mgPausa && (comecou || BOT())) {
        const t = tipo();
        const prende = BOT() ? (t === 'para' || ar > .7) : S.on;
        // o ar
        if (prende) { ar -= dt / AR; if (ar <= 0) { ar = .35; if (!BOT()) { puxou = true; ouvido(en ? 'Air finish. Kronk pull air.' : 'Ar acabar. Kronk puxar ar.'); } } }
        else ar = Math.min(1, ar + dt / 1.1);
        anel.style.strokeDashoffset = (277 * (1 - ar)).toFixed(1);
        root.classList.toggle('pouco-ar', ar < .3);
        // a marcha: passos altos; a parada: silêncio e o coração
        tf += dt * (BOT() ? 3 : 1);
        if (t === 'marcha') { passo -= dt; if (passo <= 0) { passo = (ROT[fase + 1] && ROT[fase + 1][1] && ROT[fase][1] - tf < 1 ? .62 : .32) + Math.random() * .25; A.hiss(.25, 160, .8, .09, 0, 'lowpass'); } }
        else { passo -= dt; if (passo <= 0) { passo = .9; A.tone(52, .18, 'sine', .14, 0, .8); A.tone(48, .18, 'sine', .1, .22, .8); } }
        root.classList.toggle('parada', t === 'para');
        const resta = ROT[fase] ? ROT[fase][1] - tf : 0;
        mostra(t === 'para' ? 'para' : (ROT[fase + 1] && ROT[fase + 1][0] === 'para' && resta < 1) ? 'vai' : 'marcha');
        rotulo.textContent = S.on ? TX.segura : TX.solta;
        if (t === 'para' && !avisou) { avisou = true; P.diz(en ? 'Iron stop. Near hide.' : 'Ferro parar. Perto do couro.', c); }
        if (tf >= ROT[fase][1]) {
          fase++; tf = 0;
          if (fase >= ROT.length) {
            fim = true; S.fim(); root.classList.remove('parada'); est.className = 'qt-estado';
            P.diz(en ? 'Iron go. Far.' : 'Ferro ir. Longe.', c);
            setTimeout(() => resolve({ quieto: sons === 0, sons, puxou, pontos: Math.max(200, 1400 - sons * 300) }), BOT() ? 100 : 1800);
            return;
          }
          if (tipo() === 'marcha' && fase > 0 && !BOT()) P.limpa();
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
        // a luz anda em velocidade que muda; às vezes o sentinela para e olha
        if (!loop.pausa && Math.random() < dt * .16) loop.pausa = .7 + Math.random() * .6;
        if (loop.pausa) loop.pausa = Math.max(0, loop.pausa - dt); else loop.ph = (loop.ph || 0) + dt * 1.45 * (1 + .4 * Math.sin(tt * .7));
        const lx = .5 + Math.sin(loop.ph || 0) * .48;
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
// O olho vê o pau subir. O nariz sente antes: o suor da Hessa muda um instante antes do golpe.
// Duas vezes ela finge: ergue o pau sem o cheiro. Quem bate no que vê, apanha; quem bate no que cheira, acerta.
function treino(root, c) {
  const { A, L } = c, cfg = L.treino;
  const en = c.lang === 'en';
  const ROT = (cfg.roteiro || ['real', 'real', 'finta', 'real', 'finta', 'real']).slice();
  const reais = ROT.length;
  const CHEIRO = .75, ABERTA = .7, GRACA = .16;
  return new Promise((resolve) => {
    root.insertAdjacentHTML('beforeend', `<div class="tr-img guarda" style="background-image:url('${cfg.guarda}')"></div><div class="tr-img ergue" style="background-image:url('${cfg.ergue}')"></div><div class="tr-img bate" style="background-image:url('${cfg.bate || cfg.guarda}')"></div><div class="tr-cheiro"><svg viewBox="0 0 100 200" preserveAspectRatio="none"><path class="f0" d="M30 200 C 10 160, 50 130, 30 95 S 10 40, 35 5"/><path class="f1" d="M50 200 C 30 160, 70 130, 50 95 S 30 40, 55 5"/><path class="f2" d="M70 200 C 50 160, 90 130, 70 95 S 50 40, 75 5"/></svg></div><div class="j6-veu leve"></div><ol class="tr-cont">${'<li></li>'.repeat(reais)}</ol><div class="tr-dica"></div><div class="tr-dor"></div>`);
    const P = painel(root), cont = root.querySelectorAll('.tr-cont li'), dica = root.querySelector('.tr-dica');
    c.gesto(root, 'tocar', 'treino');
    let fase = 'guarda', t = 0, dur = 1.2, k = 0, n = 0, acertos = 0, enganado = 0, fim = false, last = performance.now(), ensinou = false, fintas = 0, graca = 0;
    const mostra = (txt, cls) => { dica.textContent = txt; dica.className = 'tr-dica on ' + (cls || ''); };
    const esconde = () => { dica.className = 'tr-dica'; };
    const set = (f, d) => {
      fase = f; t = 0; dur = d;
      root.classList.toggle('aberta', f === 'aberta' || f === 'finge'); root.classList.toggle('cheira', f === 'cheiro' || f === 'aberta'); root.classList.toggle('bateu-guarda', f === 'bateu');
      if (f === 'cheiro') { A.hiss(.5, 700, .9, .06); if (n < 2) mostra(en ? 'THE SMELL · STRIKE' : 'O CHEIRO · BATA', 'bata'); }
      else if (f === 'finge') { fintas++; if (fintas === 1) mostra(en ? 'NO SMELL · WAIT' : 'SEM CHEIRO · ESPERE', 'espera'); }
      else if (f !== 'aberta') esconde();
    };
    const bastao = () => A.sfx('bastao', .7, () => { A.tone(420, .07, 'square', .06); A.hiss(.08, 2000, 2, .1); });
    const apanha = (txt) => { bastao(); P.diz(txt, c); root.classList.remove('dor'); void root.offsetWidth; root.classList.add('dor'); };
    const proxima = () => { k++; if (k >= ROT.length) { fim = true; esconde(); removeEventListener('keydown', kd); P.diz(acertos >= 4 ? cfg.fimBom : cfg.fim, c); setTimeout(() => resolve({ acertos, enganado }), BOT() ? 50 : 1500); return; } set('guarda', 1 + Math.random() * 1.1); };
    const marca = (ok) => { if (cont[n]) cont[n].className = ok ? 'ok' : 'nao'; n++; };
    const acerta = (noCheiro) => {
      bastao(); acertos++; marca(true); esconde();
      P.diz(noCheiro ? cfg.acertaCheiro : cfg.acerta, c); set('pausa', 1.1);
      root.classList.remove('acertou'); void root.offsetWidth; root.classList.add('acertou');
      if (n === 2 && !ensinou) { ensinou = true; setTimeout(() => c.cheiro('hessa-brava'), 500); }
    };
    const toque = (e) => {
      if (window.__mgPausa || fim) return;
      if (e && e.target && e.target.closest && e.target.closest('button')) return;
      if (fase === 'cheiro') acerta(true);
      else if (fase === 'aberta' || graca > 0) { graca = 0; acerta(false); }
      else if (fase === 'finge') { enganado++; marca(false); set('bateu', .9); apanha(cfg.finta); }
      else if (fase === 'guarda') { marca(false); set('bateu', .9); apanha(cfg.apanha); }
    };
    root.addEventListener('pointerdown', toque);
    const kd = (e) => { if ((e.code === 'Space' || e.key === 'j' || e.key === 'J') && !e.repeat) { e.preventDefault(); toque(); } };
    addEventListener('keydown', kd);
    set('guarda', 1.8);
    const loop = (now) => {
      if (!root.isConnected || fim) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!window.__mgPausa) {
        t += dt; graca = Math.max(0, graca - dt);
        if (BOT() && fase === 'cheiro') toque();
        if (t >= dur) {
          if (fase === 'guarda') { if (ROT[k] === 'finta') set('finge', .9); else set('cheiro', CHEIRO); }
          else if (fase === 'cheiro') set('aberta', ABERTA);
          else if (fase === 'aberta') { graca = GRACA; esconde(); apanha(cfg.apanha); marca(false); set('pausa', 1.1); }   // ela bate primeiro
          else if (fase === 'finge') { if (fintas === 1) setTimeout(esconde, 300); P.diz(cfg.fintaVista, c); set('guarda', .6 + Math.random() * .5); ROT[k] = 'real'; }   // não caiu: agora vem o de verdade
          else if (fase === 'bateu') set('pausa', .5);
          else if (fase === 'pausa') proxima();
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
