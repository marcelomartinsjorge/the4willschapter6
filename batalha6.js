/* ==========================================================================
   Capítulo VI · A BATALHA DAS GOELAS (minijogo G1)
   Beat 'em up em três telas (Final Fight / Streets of Rage): a tela trava,
   os inimigos vêm, o Kronk mata todos, aparece o →, ele anda até a borda
   e a imagem desliza para a tela seguinte. O Kronk sozinho na tela.
   Quatro botões: andar (◀ ▶), golpe (toque), pesado (segurar e soltar),
   esquiva. Sem estamina e sem barras: a vida aparece na borda da tela e
   no som; a fúria, na cor, na velocidade e nos tambores.
   Os sprites saem do MANIFESTO (SPR, abaixo). Hoje ele aponta para as
   folhas do jogo antigo, convertidas; quando os clipes novos chegarem,
   eu troco as folhas e os números de cada animação, e mais nada.
   Devolve { quedas, mortos, furiaMax, golpesRecebidos, tempo, pontos }.
   ========================================================================== */
(() => {
'use strict';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const BOT = () => !!window.__JOGO_BOT;
const W = 1680, H = 720, CHAO = 640;
const KRONK_H = 330, HOMEM_H = Math.round(KRONK_H * 1.8 / 2.3);

// ------------------------------------------------------------------ o manifesto dos sprites
// frames: quantos quadros; a folha é uma grade de ceil(sqrt(frames)) colunas.
// refH: altura do corpo no quadro (px da folha original); go: do topo do quadro até o pé.
// res: escala da folha em disco em relação à original (as convertidas estão em 0,5).
// impacto: o quadro em que o golpe acerta; segura: o quadro em que o pesado fica erguido.
const S = 'assets/sprites/';
const SPR = {
  kronk: { h: KRONK_H, a: {
    guarda: { src: S + 'kronk/guarda.webp', frames: 36, fps: 10, loop: true, refH: 320, go: 328, res: .5 },
    andar: { src: S + 'kronk/andar.webp', frames: 30, fps: 24, loop: true, refH: 233, go: 251, res: .5 },
    golpe: { src: S + 'kronk/golpe.webp', frames: 16, fps: 26, refH: 322, go: 333, res: .5, impacto: 6, livre: 7 },
    pesado: { src: S + 'kronk/pesado.webp', frames: 64, fps: 40, refH: 252.5, go: 282, res: .5, segura: 20, impacto: 28, livre: 40, fpsVolta: 56 },
    esquiva: { src: S + 'kronk/esquiva.webp', frames: 28, fps: 64, refH: 328.5, go: 353, res: .5, livre: 17 },
    apanhaE: { src: S + 'kronk/apanha_e.webp', frames: 39, fps: 40, ate: 12, refH: 325, go: 352, res: .5, fixo: true },
    apanhaD: { src: S + 'kronk/apanha_d.webp', frames: 39, fps: 40, ate: 12, refH: 325, go: 352, res: .5, fixo: true },
    caiE: { src: S + 'kronk/cai_e.webp', frames: 32, fps: 14, refH: 332.5, go: 345, res: .5, fixo: true },
    caiD: { src: S + 'kronk/cai_d.webp', frames: 32, fps: 14, refH: 332.5, go: 345, res: .5, fixo: true },
  } },
  soldado: { h: HOMEM_H, a: {
    guarda: { src: S + 'soldado/guarda.webp', frames: 32, fps: 8, loop: true, refH: 326, go: 350.5, res: .5 },
    aberto: { src: S + 'soldado/aberto.webp', frames: 32, fps: 8, loop: true, refH: 331, go: 351.5, res: .5 },
    andar: { src: S + 'soldado/andar.webp', frames: 42, fps: 24, loop: true, refH: 339.5, go: 350, res: .5 },
    golpe: { src: S + 'soldado/golpe.webp', frames: 29, fps: 20, refH: 334, go: 351.5, res: .5, impacto: 14 },
    apanha: { src: S + 'soldado/apanha.webp', frames: 12, fps: 24, refH: 345, go: 350.5, res: .5 },
    morre: { src: S + 'soldado/morre.webp', frames: 32, fps: 14, refH: 320.5, go: 327, res: .5 },
    estocada: { src: S + 'soldado/estocada.webp', frames: 37, fps: 40, refH: 335.5, go: 351.5, res: .5, impacto: 18 },
    baixo: { src: S + 'soldado/baixo.webp', frames: 26, fps: 23, refH: 311, go: 340.5, res: .5, impacto: 16 },
  } },
  escudeiro: { h: HOMEM_H, a: {
    andar: { src: S + 'escudeiro/andar.webp', frames: 32, fps: 10, loop: true, refH: 318.5, go: 340, res: .5 },
    guarda: { src: S + 'escudeiro/guarda.webp', frames: 32, fps: 8, loop: true, refH: 312.5, go: 341, res: .5 },
    apanha: { src: S + 'escudeiro/apanha.webp', frames: 48, fps: 48, refH: 320, go: 346, res: .5 },
    golpe: { src: S + 'escudeiro/estocada.webp', frames: 56, fps: 32, refH: 296, go: 339, res: .5, impacto: 26 },
    quebra: { src: S + 'escudeiro/quebra.webp', frames: 48, fps: 32, refH: 322.5, go: 356.5, res: .5 },
  } },
  arqueiro: { h: HOMEM_H, a: {
    andar: { src: S + 'arqueiro/andar.webp', frames: 32, fps: 10, loop: true, refH: 318.5, go: 340.5, res: .5 },
    atira: { src: S + 'arqueiro/atira.webp', frames: 109, fps: 16, refH: 325.5, go: 346.5, res: .5, de: 70, aviso: 87, impacto: 92 },
    apanha: { src: S + 'arqueiro/apanha.webp', frames: 17, fps: 24, refH: 325.5, go: 345, res: .5 },
    morre: { src: S + 'arqueiro/morre.webp', frames: 48, fps: 16, refH: 318.5, go: 341, res: .5 },
  } },
};
// o Simon, até os clipes dele chegarem: o soldado, mais claro (os golpes dele já têm começos diferentes)
SPR.simon = { h: HOMEM_H, filtro: 'brightness(1.18) saturate(.55) sepia(.25)', a: {
  guarda: SPR.soldado.a.guarda, aberto: SPR.soldado.a.aberto, andar: SPR.soldado.a.andar, apanha: SPR.soldado.a.apanha,
  alto: SPR.soldado.a.golpe, estocada: SPR.soldado.a.estocada, baixo: SPR.soldado.a.baixo,
  desvio: Object.assign({}, SPR.soldado.a.andar, { fps: 60, loop: false }), cai: SPR.soldado.a.morre, gesto: SPR.soldado.a.aberto,
} };
const imgs = {};
function carrega(a) {
  if (imgs[a.src]) return imgs[a.src];
  const im = new Image(); const o = { im, ok: false };
  a.cols = Math.ceil(Math.sqrt(a.frames)); a.rows = Math.ceil(a.frames / a.cols);
  im.onload = () => { o.ok = true; a.fw = im.naturalWidth / a.cols; a.fh = im.naturalHeight / a.rows; };
  im.src = a.src; imgs[a.src] = o; return o;
}
Object.values(SPR).forEach((k) => Object.values(k.a).forEach((a) => { carrega(a); a.cols = Math.ceil(Math.sqrt(a.frames)); a.rows = Math.ceil(a.frames / a.cols); }));

// ------------------------------------------------------------------ o jogo
window.BATALHA6 = function (root, c) {
  const { A, L, st, tr } = c;
  const cfg = L.batalha, U = c.U, bt = U('bt');
  return new Promise((resolve) => {
    root.classList.add('bt-root');
    root.innerHTML = `<canvas class="bt-cv" width="${W}" height="${H}"></canvas>
      <div class="bt-leg" aria-live="polite"></div>
      <div class="bt-girar">${c.esc(bt.girar)}</div>
      <div class="bt-pads">
        <div class="bt-mov"><button class="bt-b esq" aria-label="${c.esc(bt.esq)}">◀</button><button class="bt-b dir" aria-label="${c.esc(bt.dir)}">▶</button></div>
        <div class="bt-acao"><button class="bt-b esquiva">${c.esc(bt.esquivar)}</button><button class="bt-b ataca">${c.esc(bt.atacar)}</button></div>
      </div>`;
    const cv = root.querySelector('.bt-cv'), cx = cv.getContext('2d'), leg = root.querySelector('.bt-leg');
    const legenda = (t, ms = 2600) => { leg.textContent = c.sub(tr(t)); leg.classList.remove('on'); void leg.offsetWidth; leg.classList.add('on'); clearTimeout(legenda.t); legenda.t = setTimeout(() => leg.classList.remove('on'), ms); };

    // ---------- o que o capítulo trouxe
    const fome0 = st.fome || 0, faminto = fome0 >= 60;
    const hpMax = faminto ? 9 : 12, furia0 = faminto ? 40 : 15;
    const caminho = !!st.f.caminho, ikk = (st.af.ikk || 0) >= 2, dorgh = (st.af.dorgh || 0) >= 2;
    const extras = [];
    if (st.f.agua === 'patrulha') extras.push('arqueiro');
    if ((st.f.visto || 0) >= 2) extras.push('soldado');
    if (['roubar', 'comer'].includes(st.escolhas.posto)) extras.push('soldado');

    // ---------- som: música e batalha de fundo passam por um filtro (a vida baixa abafa o mundo)
    const ctxA = A.ctx; let lp = null, mus = null, fundoB = null, tamb = null, tambG = null;
    if (ctxA) {
      A.setZone('—');
      lp = ctxA.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 18000; lp.connect(A.master);
      const toca = async (url, vol, alvo) => { const b = await A.buf(url); if (!b || fim) return null; const s = ctxA.createBufferSource(); s.buffer = b; s.loop = true; const g = ctxA.createGain(); g.gain.value = 0; s.connect(g); g.connect(alvo || lp); s.start(); g.gain.linearRampToValueAtTime(vol, ctxA.currentTime + 1.5); return { s, g }; };
      toca('assets/audio/batalha/musica-loop.mp3', .32).then((h) => { mus = h; });
      toca('assets/audio/batalha/fora-da-tela-loop.mp3', .45).then((h) => { fundoB = h; });
      tambG = ctxA.createGain(); tambG.gain.value = 0; tambG.connect(lp);
      toca('assets/audio/batalha/tambores-furia-loop.mp3', 1, tambG).then((h) => { tamb = h; });
    }
    const sfx = (n, v = .7, reserva) => { if (!ctxA) return; A.once('assets/audio/batalha/' + n + '.mp3', v).then((d) => { if (!d && reserva) reserva(); }); };
    const um = (l) => l[Math.floor(Math.random() * l.length)];
    const SOM = {
      golpe: () => sfx('kronk-golpe', .6, () => A.hiss(.18, 900, .7, .12)),
      pesado: () => sfx('kronk-pesado', .7, () => A.hiss(.3, 500, .6, .16)),
      acertaLeve: () => sfx('acerta-leve', .7, () => { A.tone(120, .12, 'square', .08); A.hiss(.1, 1800, 1, .12); }),
      acertaForte: () => sfx('acerta-forte', .85, () => { A.tone(70, .25, 'sine', .25, 0, .6); A.hiss(.2, 700, .6, .2); }),
      escudo: () => sfx('escudo', .7, () => { A.tone(900, .12, 'square', .05); A.tone(1300, .2, 'sine', .04); }),
      apanha: () => sfx(um(['kronk-apanha1', 'kronk-apanha2']), .7, () => A.tone(80, .3, 'sawtooth', .08, 0, .6)),
      esquiva: () => sfx('kronk-esquiva', .55, () => A.hiss(.2, 1200, .6, .08)),
      mata: () => sfx(um(['kronk-mata1', 'kronk-mata2', 'kronk-mata3']), .55),
      grito: () => sfx(um(['soldado-grito1', 'soldado-grito2', 'soldado-grito3', 'soldado-grito4']), .6, () => sfx('soldado-golpe', .6, () => A.tone(260, .25, 'sawtooth', .05, 0, 1.3))),
      estocada: () => sfx('escudeiro-estocada', .6, () => A.hiss(.25, 1400, .8, .08)),
      corda: () => sfx('arco-corda', .7, () => A.hiss(.6, 300, 2, .06)),
      flecha: () => sfx('arqueiro-solta', .6, () => A.hiss(.3, 3000, .5, .08)),
      flechaFora: () => sfx('flecha-de-fora', .8, () => { A.hiss(.4, 3500, .6, .1); A.tone(140, .3, 'sawtooth', .06, .3, .7); }),
      respira: (k) => sfx('kronk-respira' + (k > .6 ? 3 : k > .3 ? 2 : 1), .55, () => A.hiss(1, 380, .7, .07)),
    };

    // ---------- estado
    const K = { tipo: 'kronk', x: 260, dir: 1, est: 'guarda', a: 'guarda', f: 0, t: 0, hp: hpMax, inv: 0, cai: 0, vx: 0 };
    let furia = furia0, furiaMax = furia0, mortos = 0, golpes = 0, quedas = 0, tempo = 0, fim = false;
    let inimigos = [], flechas = [], parts = [], pocas = [], tela = 0, ondaI = 0, fase = 'luta', fila = [], seta = false, slide = 0, hitstop = 0, shake = 0, shakeM = 0, regen = 0, respT = 0, semLuta = 0;
    const quedasOnda = {}; let facil = 1;
    const bgs = cfg.telas.map((s) => { const im = new Image(); im.src = s; return im; });

    // as ondas de cada tela (§9.4 do roteiro)
    const TELAS = [
      [{ lista: ['soldado', 'soldado', 'soldado'], umPorVez: true, dorme: caminho ? 2 : 0 }],
      [{ lista: ['soldado', 'arqueiro'], ikk: ikk }, { lista: ['escudeiro', 'soldado'] }],
      [{ lista: ['escudeiro', 'escudeiro', 'arqueiro'].concat(extras), dorgh: dorgh, max: 3 }, { lista: ['simon'] }],
    ];
    const chave = () => tela + ':' + ondaI;

    // ---------- criar inimigos
    const HP = { soldado: 4, escudeiro: 4, arqueiro: 2, simon: 15 };
    function novo(tipo, i) {
      const lado = tipo === 'arqueiro' ? 1 : (i % 3 === 2 && tela > 0 ? -1 : 1);
      const e = { tipo, x: lado > 0 ? W + 80 + i * 60 : -80 - i * 60, dir: -lado, est: 'andar', a: tipo === 'escudeiro' ? 'andar' : 'andar', f: 0, t: 0, hp: HP[tipo], timer: 1.2 + Math.random(), escudo: 0, morto: false, some: 0, flash: 0 };
      if (tipo === 'arqueiro') e.posto = W - 150;
      if (tipo === 'simon') { e.timer = 1.6; e.fase = 1; }
      return e;
    }
    function comecaOnda() {
      const o = TELAS[tela][ondaI]; fila = o.lista.map((t, i) => ({ t, i })); o._spawn = tempo; o._ikk = false; o._dorgh = false; o._fim = false;
      soltaFila(o, true);
    }
    function soltaFila(o, primeira) {
      const vivos = inimigos.filter((e) => !e.morto).length, max = o.umPorVez ? 1 : (o.max || 2);
      while (fila.length && inimigos.filter((e) => !e.morto).length < max) {
        const q = fila.shift(), e = novo(q.t, q.i);
        if (o.dorme && q.i < o.dorme) { e.est = 'dorme'; e.a = 'aberto'; e.x = 820 + q.i * 260; e.hp = 2; e.dir = -1; }
        inimigos.push(e); o._spawn = tempo;
        if (!primeira) break;
      }
      void vivos;
    }

    // ---------- desenho de um quadro
    function anim(ent) { const k = SPR[ent.tipo] || SPR.soldado; return k.a[ent.a] || k.a.guarda; }
    function desenha(ent, alfa = 1) {
      const k = SPR[ent.tipo], a = anim(ent), o = imgs[a.src];
      const sc = k.h / (a.refH * a.res);
      const fr = Math.min(a.frames - 1, Math.max(0, Math.floor(ent.f)));
      cx.save(); cx.globalAlpha = alfa; cx.translate(ent.x, 0);
      if (!a.fixo && ent.dir < 0) cx.scale(-1, 1);
      if (k.filtro) cx.filter = k.filtro;
      if (ent.flash > 0) cx.filter = (k.filtro || '') + ' brightness(2.2)';
      if (o && o.ok && a.fw) {
        const sx = (fr % a.cols) * a.fw, sy = Math.floor(fr / a.cols) * a.fh, dw = a.fw * sc, dh = a.fh * sc;
        cx.drawImage(o.im, sx, sy, a.fw, a.fh, -dw / 2, CHAO - a.go * a.res * sc, dw, dh);
      } else {
        // sem a folha ainda: uma silhueta, para o jogo funcionar mesmo assim
        cx.fillStyle = ent.tipo === 'kronk' ? '#5b5650' : ent.tipo === 'simon' ? '#c9b48a' : '#7a2620';
        const h = k.h, w = h * .32; cx.beginPath(); cx.roundRect(-w / 2, CHAO - h, w, h, 20); cx.fill();
      }
      cx.restore();
    }

    // ---------- trocar de animação
    function poe(ent, a, f = 0) { ent.a = a; ent.f = f; ent.t = 0; }
    function avanca(ent, dt, vel = 1) {
      const a = anim(ent); let fps = a.fps * vel;
      if (ent.volta && a.fpsVolta) fps = a.fpsVolta * vel;
      ent.f += dt * fps * (ent.reverso ? -1 : 1);
      const ate = a.ate || a.frames;
      if (a.loop) { if (ent.f >= a.frames) ent.f -= a.frames; return false; }
      if (ent.reverso) { if (ent.f <= 0) { ent.f = 0; return true; } return false; }
      if (ent.f >= ate) { ent.f = ate - .001; return true; }
      return false;
    }

    // ---------- partículas (o sangue e as faíscas do jogo antigo)
    function sangue(x, y, d) {
      for (let i = 0; i < 26; i++) { const ang = (d >= 0 ? 0 : Math.PI) + (Math.random() - .5) * Math.PI * .9, sp = 90 + Math.random() * 260; parts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .5 - (80 + Math.random() * 120), life: .45 + Math.random() * .45, age: 0, size: Math.random() < .3 ? 4.5 + Math.random() * 4 : 1.5 + Math.random() * 2.5, dark: Math.random() < .4 }); }
      parts.push({ x, y, vx: 0, vy: -20, life: .22, age: 0, size: 30, mist: true });
      pocas.push({ x: x + d * (20 + Math.random() * 30), r: 30 + Math.random() * 22, age: 0, seed: Math.random() * 1000 });
    }
    function faisca(x, y) { for (let i = 0; i < 12; i++) { const ang = Math.random() * Math.PI * 2, sp = 80 + Math.random() * 160; parts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .6, life: .3, age: 0, size: 2 + Math.random() * 2.5, spark: true }); } }
    function juice(forte, leve) { hitstop = forte ? .11 : .06; shake = forte ? .22 : .12; shakeM = (forte ? 14 : 7) * (leve ? .5 : 1); }

    // ---------- o Kronk acerta
    const alvosNaFrente = (alc) => inimigos.filter((e) => !e.morto && e.est !== 'quebra' && (e.x - K.x) * K.dir > -40 && Math.abs(e.x - K.x) < alc).sort((a, b) => Math.abs(a.x - K.x) - Math.abs(b.x - K.x));
    function acertaKronk(pesado) {
      const alc = pesado ? 260 : 220;
      let alvos = alvosNaFrente(alc);
      if (!alvos.length) return;
      if (!(pesado && furia >= 80)) alvos = alvos.slice(0, 1);
      alvos.forEach((e) => bate(e, pesado));
    }
    function bate(e, pesado) {
      const yImp = CHAO - HOMEM_H * .6, dir = Math.sign(e.x - K.x) || K.dir;
      const dano = (n) => {
        e.hp -= n; e.flash = .08; sangue(e.x, yImp, dir); juice(pesado); pesado ? SOM.acertaForte() : SOM.acertaLeve();
        furia = clamp(furia + 4, 0, 100);
        if (e.hp <= 0) return morre(e, dir);
        e.x = clamp(e.x + dir * (pesado ? 110 : 50), 60, W - 60);
        if (e.tipo === 'simon') { e.est = 'apanha'; poe(e, 'apanha'); return; }
        e.est = 'apanha'; poe(e, 'apanha');
      };
      if (e.est === 'dorme') return dano(pesado ? 3 : 1);
      if (e.tipo === 'escudeiro') {
        if (!pesado) { faisca(e.x - dir * 30, yImp); SOM.escudo(); juice(false, true); e.x = clamp(e.x + dir * 30, 60, W - 60); return; }
        e.escudo++; faisca(e.x - dir * 30, yImp); SOM.escudo(); juice(true);
        if (e.escudo >= 2) { e.est = 'quebra'; poe(e, 'quebra'); return; }
        e.est = 'apanha'; poe(e, 'apanha'); e.x = clamp(e.x + dir * 90, 60, W - 60); return;
      }
      if (e.tipo === 'soldado') {
        if (e.est === 'guarda') {
          if (!pesado) { faisca(e.x - dir * 30, yImp); SOM.escudo(); juice(false, true); e.x = clamp(e.x + dir * 40, 60, W - 60); return; }
          return dano(2);   // o pesado quebra a guarda
        }
        return dano(pesado ? 3 : 1);
      }
      if (e.tipo === 'arqueiro') return dano(pesado ? 2 : 1);
      if (e.tipo === 'simon') {
        if (e.est === 'gesto' || e.est === 'cai') return;
        const aberto = e.est === 'aberto' || (e.est === 'ataca' && e.f < anim(e).impacto);
        if (!aberto && Math.random() < (pesado ? .75 : .5)) { e.est = 'desvio'; poe(e, 'desvio'); e.dx = (e.x > K.x ? 1 : -1) * 110; SOM.esquiva(); return; }
        return dano(aberto ? (pesado ? 3 : 1) : (pesado ? 2 : 1));
      }
    }
    function morre(e, dir) {
      e.morto = true; e.est = 'morre'; mortos++; furia = clamp(furia + 12, 0, 100); SOM.mata();
      if (e.tipo === 'simon') { e.est = 'cai'; poe(e, 'cai'); fase = 'fim'; legenda('—', 10); return; }
      poe(e, e.tipo === 'escudeiro' ? 'apanha' : 'morre'); e.dir = -dir;
    }

    // ---------- o Kronk apanha
    function apanhaKronk(de, n) {
      if (K.inv > 0 || K.est === 'cai' || fase !== 'luta') return;
      n = Math.max(1, Math.round(n * facil));
      K.hp -= n; golpes++; furia = clamp(furia - 10, 0, 100);
      const d = Math.sign(K.x - de.x) || -K.dir;
      sangue(K.x, CHAO - KRONK_H * .62, d); juice(true); SOM.apanha();
      if (K.hp <= 0) { K.est = 'cai'; poe(K, d > 0 ? 'caiE' : 'caiD'); K.reverso = false; K.cai = 0; quedas++; return; }
      K.est = 'apanha'; poe(K, d > 0 ? 'apanhaE' : 'apanhaD'); K.inv = .5; K.x = clamp(K.x + d * 60, 60, W - 60);
    }

    // ---------- controles
    const inp = { esq: false, dir: false, atkDown: false, atkT: 0, atk: null, esquiva: false };
    const atkPress = () => { if (window.__mgPausa) return; if (!inp.atkDown) { inp.atkDown = true; inp.atkT = 0; } };
    const atkSolta = () => { if (!inp.atkDown) return; inp.atkDown = false; if (inp.atkT < .18) inp.atk = 'golpe'; else inp.atk = 'solta'; };
    const kd = (e) => {
      if (fim) return;
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) inp.esq = true;
      else if (['ArrowRight', 'd', 'D'].includes(e.key)) inp.dir = true;
      else if (['j', 'J', 'z', 'Z', 'Enter'].includes(e.key)) { if (!e.repeat) atkPress(); }
      else if (e.code === 'Space' || e.key === 'k' || e.key === 'K' || e.key === 'Shift') { e.preventDefault(); if (!e.repeat) inp.esquiva = true; }
      else return; e.preventDefault();
    };
    const ku = (e) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) inp.esq = false;
      else if (['ArrowRight', 'd', 'D'].includes(e.key)) inp.dir = false;
      else if (['j', 'J', 'z', 'Z', 'Enter'].includes(e.key)) atkSolta();
    };
    addEventListener('keydown', kd); addEventListener('keyup', ku);
    cv.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') { if (e.button === 2) inp.esquiva = true; else if (e.button === 0) atkPress(); } });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    const muUp = (e) => { if (e.pointerType === 'mouse' && e.button === 0) atkSolta(); };
    addEventListener('pointerup', muUp);
    const pad = (sel, dn, up) => { const b = root.querySelector(sel); b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); b.classList.add('on'); dn(); try { b.setPointerCapture(e.pointerId); } catch (er) {} }); const u = (e) => { b.classList.remove('on'); up && up(); }; b.addEventListener('pointerup', u); b.addEventListener('pointercancel', u); b.addEventListener('contextmenu', (e) => e.preventDefault()); };
    pad('.bt-b.esq', () => { inp.esq = true; }, () => { inp.esq = false; });
    pad('.bt-b.dir', () => { inp.dir = true; }, () => { inp.dir = false; });
    pad('.bt-b.ataca', atkPress, atkSolta);
    pad('.bt-b.esquiva', () => { inp.esquiva = true; });

    // ---------- o Kronk, por quadro
    const ocupado = () => ['golpe', 'pesado', 'esquiva', 'apanha', 'cai', 'levanta'].includes(K.est);
    const podeCancelar = () => { const a = anim(K); return (K.est === 'golpe' || K.est === 'pesado' || K.est === 'esquiva') && a.livre && K.f >= a.livre && !(K.est === 'pesado' && !K.volta); };
    function kronk(dt) {
      const vel = furia >= 50 ? 1.2 : 1;
      if (inp.atkDown) inp.atkT += dt;
      K.inv = Math.max(0, K.inv - dt);
      // virar para o inimigo mais perto quando parado
      if (!ocupado() && !inp.esq && !inp.dir) { const e = inimigos.filter((x) => !x.morto).sort((a, b) => Math.abs(a.x - K.x) - Math.abs(b.x - K.x))[0]; if (e && Math.abs(e.x - K.x) < 520) K.dir = e.x > K.x ? 1 : -1; }
      const livre = !ocupado() || podeCancelar();
      if (livre && inp.esquiva) {
        inp.esquiva = false; K.est = 'esquiva'; poe(K, 'esquiva'); K.inv = .38; K.vx = -K.dir * 380; SOM.esquiva(); return;
      }
      inp.esquiva = false;
      if (livre && inp.atk === 'golpe') { inp.atk = null; K.est = 'golpe'; poe(K, 'golpe'); K.bateu = false; SOM.golpe(); return; }
      if (livre && inp.atkDown && inp.atkT >= .18 && K.est !== 'pesado') { inp.atk = null; K.est = 'pesado'; poe(K, 'pesado'); K.bateu = false; K.volta = false; return; }
      if (K.est === 'pesado') {
        const a = anim(K);
        if (!K.volta) {
          // o braço sobe; enquanto o dedo segura, fica lá em cima
          if (K.f < a.segura) avanca(K, dt, vel); else K.f = a.segura;
          if (!inp.atkDown && inp.atk === 'solta') { if (K.f >= a.segura - .5) { inp.atk = null; K.volta = true; SOM.pesado(); } }
          if (!inp.atkDown && inp.atk !== 'solta' && K.f >= a.segura) { K.volta = true; SOM.pesado(); }
        } else {
          const ant = K.f; const acabou = avanca(K, dt, vel);
          if (!K.bateu && ant < a.impacto && K.f >= a.impacto) { K.bateu = true; acertaKronk(true); }
          if (acabou) { K.est = 'guarda'; poe(K, 'guarda'); K.volta = false; }
        }
        return;
      }
      if (K.est === 'golpe') {
        const a = anim(K), ant = K.f; const acabou = avanca(K, dt, vel);
        if (!K.bateu && ant < a.impacto && K.f >= a.impacto) { K.bateu = true; acertaKronk(false); }
        if (acabou) { K.est = 'guarda'; poe(K, 'guarda'); }
        return;
      }
      if (K.est === 'esquiva') {
        K.x = clamp(K.x + K.vx * dt, 60, W - 60); K.vx *= Math.pow(.02, dt);
        if (avanca(K, dt, vel)) { K.est = 'guarda'; poe(K, 'guarda'); }
        return;
      }
      if (K.est === 'apanha') { if (avanca(K, dt)) { K.est = 'guarda'; poe(K, 'guarda'); } return; }
      if (K.est === 'cai') {
        if (!K.reverso) { if (avanca(K, dt)) { K.cai += dt; if (K.cai > .6 && !K.legLev) { K.legLev = true; legenda(bt.levantar, 2200); } if (K.cai > 1.6) { K.reverso = true; K.est = 'levanta'; } } }
        return;
      }
      if (K.est === 'levanta') {
        if (avanca(K, dt * 1.5)) { K.reverso = false; K.legLev = false; reergue(); }
        return;
      }
      // andar
      const mv = (inp.dir ? 1 : 0) - (inp.esq ? 1 : 0);
      const limD = fase === 'luta' && inimigos.some((e) => !e.morto) ? W - 70 : W + 40;
      if (mv) { K.dir = mv; K.x = clamp(K.x + mv * 270 * dt, 60, limD); if (K.est !== 'andar') { K.est = 'andar'; poe(K, 'andar'); } avanca(K, dt); }
      else { if (K.est !== 'guarda') { K.est = 'guarda'; poe(K, 'guarda'); } avanca(K, dt); }
    }
    function reergue() {
      // a onda recomeça na mesma tela, com a fúria do começo
      const k = chave(); quedasOnda[k] = (quedasOnda[k] || 0) + 1; if (quedasOnda[k] >= 2) facil = .8;
      K.hp = hpMax; furia = furia0; K.est = 'guarda'; poe(K, 'guarda'); K.inv = 1.2; K.x = 260;
      inimigos = inimigos.filter((e) => e.morto && e.some > 0); flechas = [];
      comecaOnda();
    }

    // ---------- os inimigos, por quadro
    function inimigo(e, dt) {
      const a = anim(e), dist = Math.abs(e.x - K.x), lado = Math.sign(K.x - e.x) || 1;
      e.flash = Math.max(0, e.flash - dt);
      if (e.morto) { if (avanca(e, dt)) e.some += dt; if (e.tipo === 'escudeiro' && e.a === 'apanha' && e.f >= anim(e).frames - 1) { /* fica no chão */ } return; }
      if (e.est === 'dorme') { avanca(e, dt * .5); return; }
      if (e.est === 'apanha') { if (avanca(e, dt)) { e.est = e.tipo === 'arqueiro' ? 'posto' : 'aberto'; poe(e, e.tipo === 'arqueiro' ? 'andar' : (e.tipo === 'escudeiro' ? 'guarda' : 'aberto')); e.timer = .8; if (e.tipo === 'escudeiro') e.est = 'guarda'; } return; }
      if (e.est === 'quebra') { if (avanca(e, dt)) { e.tipo = 'soldado'; e.hp = 3; e.est = 'aberto'; poe(e, 'aberto'); e.timer = 1.2; } return; }
      e.dir = lado;
      if (e.tipo === 'arqueiro') {
        if (e.est !== 'atira' && Math.abs(e.x - e.posto) > 6) { e.est = 'andar'; if (e.a !== 'andar') poe(e, 'andar'); e.x += Math.sign(e.posto - e.x) * 150 * dt; avanca(e, dt); e.dir = Math.sign(e.posto - e.x) || lado; return; }
        if (e.est !== 'atira') { e.est = 'posto'; e.dir = lado; e.timer -= dt; if (e.a !== 'atira') { poe(e, 'atira', anim({ tipo: 'arqueiro', a: 'atira' }).de); } e.f = SPR.arqueiro.a.atira.de; if (e.timer <= 0) { e.est = 'atira'; e.avisou = false; e.soltou = false; } return; }
        const ant = e.f; const acabou = avanca(e, dt);
        if (!e.avisou && e.f >= a.aviso) { e.avisou = true; SOM.corda(); }
        if (!e.soltou && ant < a.impacto && e.f >= a.impacto) { e.soltou = true; SOM.flecha(); flechas.push({ x: e.x + lado * 40, y: CHAO - HOMEM_H * .72, vx: lado * 1500, de: e }); }
        if (acabou) { e.est = 'posto'; e.timer = 2.6 + Math.random() * .8; }
        return;
      }
      if (e.tipo === 'simon') return simon(e, dt, dist, lado);
      const alcance = e.tipo === 'escudeiro' ? 165 : 175;
      if (e.est === 'ataca') {
        const ant = e.f; const acabou = avanca(e, dt);
        if (ant < a.impacto && e.f >= a.impacto && dist < alcance + 60) apanhaKronk(e, 2);
        if (acabou) { e.est = 'aberto'; poe(e, e.tipo === 'escudeiro' ? 'guarda' : 'aberto'); e.timer = e.tipo === 'escudeiro' ? .9 : .8; }
        return;
      }
      // não deixa dois inimigos no mesmo lugar
      const viz = inimigos.find((o) => o !== e && !o.morto && o.tipo !== 'arqueiro' && Math.abs(o.x - e.x) < 110 && Math.abs(o.x - K.x) < dist);
      if (dist > alcance && !viz) { if (e.est !== 'andar') { e.est = 'andar'; poe(e, 'andar'); } e.x += lado * (e.tipo === 'escudeiro' ? 95 : 150) * dt; avanca(e, dt); return; }
      if (e.est === 'andar') { e.est = 'guarda'; poe(e, 'guarda'); }
      if (e.est === 'aberto') { e.timer -= dt; avanca(e, dt); if (e.timer <= 0) { e.est = 'guarda'; poe(e, 'guarda'); e.timer = 2 + Math.random(); } return; }
      e.timer -= dt; avanca(e, dt);
      if (e.timer <= 0 && !viz && K.est !== 'cai' && K.est !== 'levanta') { e.est = 'ataca'; poe(e, 'golpe'); e.tipo === 'escudeiro' ? SOM.estocada() : SOM.grito(); e.timer = 2 + Math.random() * (e.tipo === 'escudeiro' ? 1.5 : 1); }
    }
    // o Simon: três golpes, cada um com o começo próprio; desvia de metade; o gesto entre a 2ª e a 3ª fase
    function simon(e, dt, dist, lado) {
      const vel = e.fase === 3 ? 1.25 : 1, a = anim(e);
      if (e.est === 'cai') { avanca(e, dt * .7); return; }
      if (e.est === 'gesto') { e.timer -= dt; avanca(e, dt); if (e.timer <= 0) { e.est = 'guarda'; poe(e, 'guarda'); e.timer = 1; } return; }
      if (e.est === 'desvio') { e.x = clamp(e.x + e.dx * dt * 3, 80, W - 80); if (avanca(e, dt)) { e.est = 'guarda'; poe(e, 'guarda'); e.timer = .5 + Math.random() * .4; } return; }
      if (e.fase < 3 && e.hp <= 5) {
        // recua, para, bate dois dedos no peito duas vezes
        e.fase = 3; e.est = 'recua'; e.alvoX = clamp(e.x + (e.x > K.x ? 1 : -1) * 260, 120, W - 120);
      }
      if (e.est === 'recua') { e.dir = lado; e.x += Math.sign(e.alvoX - e.x) * 260 * dt; avanca(e, dt); if (Math.abs(e.alvoX - e.x) < 10) { e.est = 'gesto'; poe(e, 'gesto'); e.timer = 2; sfx('simon-peito', .6, () => { A.tone(160, .1, 'sine', .08); A.tone(160, .1, 'sine', .08, .35); }); } return; }
      if (e.est === 'ataca') {
        const ant = e.f; const acabou = avanca(e, dt, vel);
        if (ant < a.impacto && e.f >= a.impacto && dist < 250) apanhaKronk(e, e.fase === 3 ? 3 : 2);
        if (acabou) { e.est = 'aberto'; poe(e, 'aberto'); e.timer = .7; }
        return;
      }
      if (e.est === 'aberto') { e.timer -= dt; avanca(e, dt); if (e.timer <= 0) { e.est = 'guarda'; poe(e, 'guarda'); e.timer = (1.1 + Math.random() * .7) / vel; } return; }
      if (dist > 195) { if (e.a !== 'andar') poe(e, 'andar'); e.est = 'anda'; e.x += lado * 170 * vel * dt; avanca(e, dt); return; }
      if (e.est !== 'guarda') { e.est = 'guarda'; poe(e, 'guarda'); }
      e.timer -= dt; avanca(e, dt);
      if (e.timer <= 0 && K.est !== 'cai' && K.est !== 'levanta') { e.est = 'ataca'; poe(e, um(['alto', 'estocada', 'baixo'])); SOM.grito(); }
    }

    // ---------- as telas
    function atualizaOnda() {
      if (fase !== 'luta') return;
      const o = TELAS[tela][ondaI];
      // os aliados, fora da tela
      if (o.ikk && !o._ikk && tempo - o._spawn > 3) { const arq = inimigos.find((e) => e.tipo === 'arqueiro' && !e.morto); if (arq) { o._ikk = true; SOM.flechaFora(); arq.hp = 0; morre(arq, 1); mortos--; legenda(cfg.legendas.ikk, 1800); } }
      if (o.dorgh && !o._dorgh && tempo - o._spawn > 4) { const esc = inimigos.find((e) => e.tipo === 'escudeiro' && !e.morto && e.est !== 'quebra'); if (esc) { o._dorgh = true; esc.est = 'quebra'; poe(esc, 'quebra'); SOM.acertaForte(); faisca(esc.x, CHAO - 150); legenda(cfg.legendas.dorgh, 1800); } }
      if (fila.length) soltaFila(o, false);
      const vivos = inimigos.filter((e) => !e.morto).length;
      if (!vivos && !fila.length && !o._fim) {
        o._fim = true;
        if (ondaI + 1 < TELAS[tela].length) { const t = tela; setTimeout(() => { if (!fim && tela === t && fase === 'luta') { ondaI++; comecaOnda(); } }, 1000); return; }
        if (tela + 1 < TELAS.length) { fase = 'livre'; seta = true; legenda(tela === 0 ? cfg.legendas.sai1 : cfg.legendas.sai2, 2800); }
      }
    }
    function atualizaTela(dt) {
      if (fase === 'livre' && K.x > W - 30) { fase = 'desliza'; slide = 0; seta = false; }
      if (fase === 'desliza') {
        slide += dt; K.x = W - 30 - slide * 1400;
        if (slide >= 1) {
          tela++; ondaI = 0; K.x = 120; fase = 'chegou'; inimigos = inimigos.filter(() => false); pocas = []; flechas = [];
          const t0 = tempo; chegou = t0;
          if (tela === 2) setTimeout(() => { if (!fim) legenda(cfg.legendas.entra3, 3200); }, 3000);
        }
      }
      if (fase === 'chegou' && tempo - chegou > 2.5) { fase = 'luta'; comecaOnda(); }
    }
    let chegou = 0;

    // ---------- desenho
    function fundoTela(i, ox) {
      const im = bgs[i];
      if (im && im.complete && im.naturalWidth) {
        const sc = Math.max(W / im.naturalWidth, H / im.naturalHeight), dw = im.naturalWidth * sc, dh = im.naturalHeight * sc;
        cx.drawImage(im, ox + (W - dw) / 2, (H - dh) / 2, dw, dh);
      } else {
        const g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, ['#8a6a4a', '#6d4e36', '#5a3e2e'][i]); g.addColorStop(.6, '#b08a5a'); g.addColorStop(1, '#7a5a3a');
        cx.fillStyle = g; cx.fillRect(ox, 0, W, H);
        cx.fillStyle = 'rgba(30,20,14,.5)'; cx.font = '28px serif'; cx.fillText(['IMG-40a · a cerca', 'IMG-40b · as tendas', 'IMG-40c · o poço'][i], ox + 40, 60);
      }
      cx.fillStyle = 'rgba(20,12,8,.25)'; cx.fillRect(ox, CHAO + 10, W, H - CHAO);
    }
    function quadro() {
      cx.save();
      if (shake > 0) cx.translate((Math.random() - .5) * shakeM, (Math.random() - .5) * shakeM);
      if (fase === 'desliza') { fundoTela(tela, -slide * W); fundoTela(tela + 1, W - slide * W); }
      else fundoTela(tela, 0);
      // as poças
      pocas.forEach((p) => { const al = p.age < .35 ? p.age / .35 : p.age < 5 ? 1 : Math.max(0, 1 - (p.age - 5) / 2.2); const r = Math.min(1, p.age / .35) * p.r; cx.globalAlpha = al * .75; cx.fillStyle = '#4a0a0a'; for (let k = 0; k < 4; k++) { const ang = p.seed + k * 1.7; cx.beginPath(); cx.ellipse(p.x + Math.cos(ang) * r * .3, CHAO - 2 + Math.sin(ang) * 3, r * (.6 + .2 * Math.sin(ang * 3)), r * .18, 0, 0, Math.PI * 2); cx.fill(); } cx.globalAlpha = 1; });
      // as sombras e os corpos
      const todos = inimigos.slice().concat(fase === 'desliza' ? [] : []);
      todos.forEach((e) => { cx.fillStyle = 'rgba(0,0,0,.28)'; cx.beginPath(); cx.ellipse(e.x, CHAO + 2, 60, 10, 0, 0, Math.PI * 2); cx.fill(); });
      cx.fillStyle = 'rgba(0,0,0,.32)'; cx.beginPath(); cx.ellipse(K.x, CHAO + 2, 84, 13, 0, 0, Math.PI * 2); cx.fill();
      todos.filter((e) => e.morto).forEach((e) => desenha(e, e.some > 4 ? Math.max(0, 1 - (e.some - 4)) : 1));
      todos.filter((e) => !e.morto).forEach((e) => desenha(e));
      const pisca = K.inv > 0 && K.est !== 'esquiva' ? (Math.floor(K.inv * 30) % 2 ? .55 : .95) : 1;
      desenha(K, pisca);
      // as flechas
      cx.strokeStyle = '#d8c8a8'; cx.lineWidth = 3; flechas.forEach((f) => { cx.beginPath(); cx.moveTo(f.x, f.y); cx.lineTo(f.x - Math.sign(f.vx) * 46, f.y); cx.stroke(); });
      // o sangue
      parts.forEach((p) => {
        const t = 1 - p.age / p.life;
        if (p.mist) { cx.globalAlpha = Math.max(0, t) * .35; const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size); g.addColorStop(0, '#7a0f0f'); g.addColorStop(1, 'rgba(122,15,15,0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.size, 0, 6.3); cx.fill(); return; }
        cx.globalAlpha = Math.max(0, t);
        if (p.spark) { cx.fillStyle = t > .5 ? '#fff4d8' : '#e8b36a'; cx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); return; }
        const sp = Math.hypot(p.vx, p.vy) || 1, st2 = Math.min(2.6, 1 + sp / 220);
        cx.save(); cx.translate(p.x, p.y); cx.rotate(Math.atan2(p.vy, p.vx)); cx.fillStyle = p.dark ? '#5a0d0d' : (t > .5 ? '#b81c1c' : '#7a1010'); cx.beginPath(); cx.ellipse(0, 0, p.size * st2 * .5, p.size * .5, 0, 0, 6.3); cx.fill(); cx.restore();
      });
      cx.globalAlpha = 1;
      cx.restore();
      // a seta: a tela abriu
      if (seta) { const a = .5 + .5 * Math.sin(tempo * 6); cx.fillStyle = `rgba(255,226,173,${a})`; cx.font = 'bold 96px serif'; cx.textAlign = 'right'; cx.fillText('→', W - 40, H * .42); cx.textAlign = 'left'; }
      // a vida: a borda escurece e avermelha
      const vida = clamp(K.hp / hpMax, 0, 1);
      if (vida < 1) { const g = cx.createRadialGradient(W / 2, H / 2, H * (.35 + vida * .4), W / 2, H / 2, W * .65); g.addColorStop(0, 'rgba(60,0,0,0)'); g.addColorStop(1, `rgba(70,0,0,${(1 - vida) * .85})`); cx.fillStyle = g; cx.fillRect(0, 0, W, H); }
      // a fúria: esquenta; no alto, a visão fecha em túnel
      if (furia >= 50) { cx.fillStyle = `rgba(150,40,10,${(furia - 50) / 50 * .16})`; cx.fillRect(0, 0, W, H); }
      if (furia >= 80) { const g = cx.createRadialGradient(W / 2, H * .55, H * .32, W / 2, H * .55, W * .55); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.78)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H); }
      if (fase === 'fim') { cx.fillStyle = `rgba(0,0,0,${clamp(fimT / 2.2, 0, 1)})`; cx.fillRect(0, 0, W, H); }
    }

    // ---------- o laço
    let last = performance.now(), fimT = 0;
    const tam = () => { const r = root.getBoundingClientRect(); const s = Math.min(r.width / W, r.height / H); cv.style.width = (W * s) + 'px'; cv.style.height = (H * s) + 'px'; root.classList.toggle('retrato', r.height > r.width); };
    tam(); addEventListener('resize', tam);
    const encerra = () => {
      if (fim) return; fim = true;
      removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('resize', tam); removeEventListener('pointerup', muUp);
      [mus, fundoB, tamb].forEach((h) => h && A.stop(h, 1.2));
      const bonus = clamp(Math.round(3000 - Math.max(0, tempo - 240) * 12), 0, 3000);
      const pontos = Math.max(1000, mortos * 300 + Math.round(furiaMax) * 10 - golpes * 120 + bonus);
      c.registrar('batalha_quedas', String(Math.min(9, quedas)));
      resolve({ quedas, mortos, furiaMax: Math.round(furiaMax), golpesRecebidos: golpes, tempo: Math.round(tempo), pontos });
    };
    function loop(now) {
      if (fim || !root.isConnected) return;
      let dt = Math.min(.05, (now - last) / 1000); last = now;
      if (window.__mgPausa) { quadro(); return requestAnimationFrame(loop); }   // o cartão do gesto fica por cima da cena parada
      if (BOT()) { encerra(); return; }
      if (hitstop > 0) { hitstop -= dt; quadro(); return requestAnimationFrame(loop); }
      if (fase === 'fim') dt *= .4;
      tempo += dt; shake = Math.max(0, shake - dt);
      kronk(dt);
      inimigos.forEach((e) => inimigo(e, dt));
      // dois inimigos nunca ocupam o mesmo lugar: o de trás recua um pouco
      inimigos.forEach((e) => { if (e.morto || e.tipo === 'arqueiro' || e.est === 'ataca') return; inimigos.forEach((o) => { if (o === e || o.morto || o.tipo === 'arqueiro') return; if (Math.abs(o.x - e.x) < 100 && Math.abs(e.x - K.x) > Math.abs(o.x - K.x)) e.x += (Math.sign(e.x - o.x) || 1) * 120 * dt; }); });
      inimigos = inimigos.filter((e) => !(e.morto && e.some > 5));
      flechas.forEach((f) => { f.x += f.vx * dt; if (Math.abs(f.x - K.x) < 46 && K.est !== 'cai') { if (K.inv > 0) { f.fora = true; } else { apanhaKronk(f.de, 2); f.fora = true; } } if (f.x < -60 || f.x > W + 60) f.fora = true; });
      flechas = flechas.filter((f) => !f.fora);
      parts.forEach((p) => { p.age += dt; if (!p.spark && !p.mist) p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }); parts = parts.filter((p) => p.age < p.life);
      pocas.forEach((p) => { p.age += dt; }); pocas = pocas.filter((p) => p.age < 7.5);
      atualizaOnda(); atualizaTela(dt);
      // a fúria desce sozinha, devagar, fora de combate; a vida volta (o Kronk aguenta)
      const perto = inimigos.some((e) => !e.morto && Math.abs(e.x - K.x) < 520);
      semLuta = perto ? 0 : semLuta + dt;
      if (semLuta > 2) { furia = Math.max(0, furia - 3 * dt); regen += dt; if (regen >= 5 && K.hp < hpMax && K.hp > 0) { regen = 0; K.hp++; } } else regen = 0;
      furiaMax = Math.max(furiaMax, furia);
      // o som segue a vida e a fúria
      if (ctxA && lp) { const v = clamp(K.hp / hpMax, 0, 1); lp.frequency.setTargetAtTime(500 + 17500 * v * v, ctxA.currentTime, .3); if (tambG) tambG.gain.setTargetAtTime(furia >= 50 ? .25 + (furia - 50) / 50 * .35 : 0, ctxA.currentTime, .4); }
      respT -= dt; if (K.hp / hpMax < .5 && respT <= 0 && K.est !== 'cai') { respT = 2.6; SOM.respira(1 - K.hp / hpMax); }
      if (fase === 'fim') { fimT += dt / .4; if (fimT > 2.6) return encerra(); }
      quadro();
      requestAnimationFrame(loop);
    }
    window.__BT = { get inp() { return inp; }, get dtT() { return tempo; }, get K() { return K; }, get ini() { return inimigos; }, get tela() { return tela; }, get fase() { return fase; }, get furia() { return furia; }, get onda() { return ondaI; } };   // para os testes
    c.gesto(root, 'golpe', 'batalha');
    comecaOnda();
    requestAnimationFrame((n) => { last = n; requestAnimationFrame(loop); });
    if (window.__BATALHA_RAPIDA) setTimeout(encerra, 200);
  });
};
})();
