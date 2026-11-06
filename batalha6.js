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
// a velocidade do Kronk andando casa com o pé no chão da folha (≈7,5 px por quadro × 26 qps × 330/270), senão ele patina
const VK = 240;
const KRONK_H = 330, HOMEM_H = Math.round(KRONK_H * 1.8 / 2.3);

// ------------------------------------------------------------------ o manifesto dos sprites
// frames: quantos quadros; a folha é uma grade de ceil(sqrt(frames)) colunas.
// refH: altura do corpo de pé no quadro (px da folha); go: do topo do quadro até o pé.
// impacto: o quadro em que o golpe acerta; segura: o quadro em que o pesado fica armado;
// livre: a partir dele o golpe pode ser cancelado; avanco: px que o corpo avança no meio do golpe.
const S = 'assets/sprites/';
// gerado a partir dos clipes do Flow (MIDIAS_CAP6 §2.2): recortados, sem o verde, virados para a direita, na mesma escala por personagem
const SPR = {
  kronk: { h: KRONK_H, filtro: 'saturate(.72) brightness(1.04)', a: {
    guarda: { src: S + 'kronk/guarda.webp', frames: 23, fps: 10, refH: 270, go: 274.2, res: 1, loop: true },
    andar: { src: S + 'kronk/andar.webp', frames: 12, fps: 26, refH: 270, go: 274.2, res: 1, loop: true },
    golpe: { src: S + 'kronk/golpe.webp', frames: 20, fps: 34, refH: 270, go: 272.4, res: 1, impacto: 9, livre: 14 },
    pesado: { src: S + 'kronk/pesado.webp', frames: 23, fps: 30, refH: 270, go: 273.9, res: 1, segura: 7, impacto: 12, livre: 17, fpsVolta: 34 },
    esquiva: { src: S + 'kronk/esquiva.webp', frames: 12, fps: 26, refH: 270, go: 272.4, res: 1, livre: 9 },
    apanha: { src: S + 'kronk/apanha.webp', frames: 12, fps: 30, refH: 270, go: 273.3, res: 1 },
    cai: { src: S + 'kronk/cai.webp', frames: 28, fps: 22, refH: 270, go: 272.4, res: 1 },
  } },
  soldado: { h: HOMEM_H, a: {
    andar: { src: S + 'soldado/andar.webp', frames: 17, fps: 20, refH: 230, go: 246.4, res: 1, loop: true },
    guarda: { seq: [11, 12, 13, 0, 1, 2, 3, 2, 1, 0, 13, 12], src: S + 'soldado/guarda.webp', frames: 14, fps: 10, refH: 230, go: 251.3, res: 1, loop: true },
    golpe: { src: S + 'soldado/golpe.webp', frames: 24, fps: 22, refH: 230, go: 252.8, res: 1, impacto: 15 },
    aberto: { src: S + 'soldado/aberto.webp', frames: 4, fps: 6, refH: 230, go: 232.1, res: 1, loop: true },
    apanha: { src: S + 'soldado/apanha.webp', frames: 15, fps: 30, refH: 230, go: 241.1, res: 1 },
    morre: { src: S + 'soldado/morre.webp', frames: 18, fps: 18, refH: 230, go: 253.0, res: 1, escFim: 0.82, cai: 'frente' },
  } },
  escudeiro: { h: HOMEM_H, a: {
    andar: { src: S + 'escudeiro/andar.webp', frames: 20, fps: 12, refH: 230, go: 236.6, res: 1, esc: 0.78, loop: true },
    guarda: { src: S + 'escudeiro/guarda.webp', frames: 15, fps: 9, refH: 230, go: 232.3, res: 1, esc: 0.78, loop: true },
    golpe: { src: S + 'escudeiro/golpe.webp', frames: 22, fps: 26, refH: 230, go: 232.1, res: 1, esc: 0.9, impacto: 11 },
    apanha: { src: S + 'escudeiro/apanha.webp', frames: 17, fps: 32, refH: 230, go: 235.1, res: 1, esc: 0.84 },
    quebra: { src: S + 'escudeiro/quebra.webp', frames: 24, fps: 28, refH: 230, go: 244.5, res: 1, esc: 0.84 },
  } },
  arqueiro: { h: HOMEM_H, a: {
    guarda: { src: S + 'arqueiro/guarda.webp', frames: 14, fps: 8, refH: 230, go: 232.1, res: 1, loop: true },
    andar: { src: S + 'arqueiro/andar.webp', frames: 20, fps: 18, refH: 230, go: 234.9, res: 1, loop: true },
    atira: { src: S + 'arqueiro/atira.webp', frames: 22, fps: 14, refH: 230, go: 246.5, res: 1, aviso: 6, impacto: 15 },
    apanha: { src: S + 'arqueiro/apanha.webp', frames: 15, fps: 28, refH: 230, go: 241.0, res: 1 },
    morre: { src: S + 'arqueiro/morre.webp', frames: 14, fps: 16, refH: 230, go: 232.8, res: 1, escFim: 0.92 },
  } },
  simon: { h: HOMEM_H, a: {
    guarda: { src: S + 'simon/guarda.webp', frames: 13, fps: 10, refH: 230, go: 232.2, res: 1, loop: true },
    andar: { src: S + 'simon/andar.webp', frames: 16, fps: 18, refH: 230, go: 232.9, res: 1, loop: true },
    alto: { src: S + 'simon/alto.webp', frames: 20, fps: 28, refH: 230, go: 235.0, res: 1, impacto: 12 },
    estocada: { src: S + 'simon/estocada.webp', frames: 15, fps: 28, refH: 230, go: 232.1, res: 1, impacto: 8 },
    baixo: { src: S + 'simon/baixo.webp', frames: 18, fps: 28, refH: 230, go: 232.1, res: 1, impacto: 8 },
    desvio: { src: S + 'simon/desvio.webp', frames: 10, fps: 26, refH: 230, go: 232.2, res: 1 },
    apanha: { src: S + 'simon/apanha.webp', frames: 14, fps: 30, refH: 230, go: 232.2, res: 1 },
    cai: { src: S + 'simon/cai.webp', frames: 18, fps: 16, refH: 230, go: 232.2, res: 1, escFim: 0.86 },
    gesto: { src: S + 'simon/gesto.webp', frames: 37, fps: 18, refH: 230, go: 250.0, res: 1 },
    aberto: { src: S + 'simon/aberto.webp', frames: 4, fps: 6, refH: 230, go: 232.1, res: 1, loop: true },
  } },
};
// a ponta da arma em cada quadro dos golpes (px da folha, a partir do centro do quadro e do pé), achada nos próprios sprites
const PONTAS = {"kronk":{"golpe":[[72,-61],[80,-60],[-75,-270],[-96,-253],[-102,-230],[-102,-198],[-81,-158],[117,-177],[119,-123],[186,-135],[218,-161],[229,-178],[234,-188],[228,-181],[209,-169],[175,-136],[139,-93],[105,-60],[77,-61],[52,-61]],"pesado":[[119,-93],[89,-95],[54,-186],[-95,-104],[-126,-111],[-138,-125],[-139,-142],[-139,-151],[-138,-158],[-135,-156],[-101,-127],[87,-155],[170,-146],[217,-180],[217,-201],[216,-202],[204,-176],[190,-163],[171,-133],[146,-100],[121,-72],[103,-60],[96,-61]]},"soldado":{"golpe":[[76,-228],[76,-235],[57,-250],[28,-250],[3,-250],[-25,-250],[-52,-250],[-55,-246],[-55,-246],[-55,-246],[-55,-246],[-53,-248],[-33,-250],[36,-250],[114,-210],[126,-126],[137,-83],[136,-84],[147,-97],[144,-167],[100,-219],[75,-231],[66,-241],[68,-235]]},"escudeiro":{"golpe":[[123,-179],[105,-162],[105,-162],[105,-162],[105,-162],[-64,-48],[-64,-48],[109,-139],[196,-114],[199,-114],[187,-100],[181,-93],[179,-94],[178,-93],[210,-87],[209,-100],[201,-125],[185,-152],[168,-171],[141,-185],[126,-182],[121,-176]]},"simon":{"alto":[[71,-144],[61,-160],[67,-222],[37,-231],[33,-210],[41,-207],[-63,-221],[-62,-209],[73,-217],[73,-223],[92,-198],[164,-196],[214,-175],[215,-161],[215,-164],[203,-180],[172,-182],[104,-138],[166,-169],[166,-174]],"estocada":[[114,-214],[109,-215],[105,-217],[110,-221],[96,-181],[110,-167],[137,-162],[130,-160],[223,-150],[224,-158],[129,-160],[129,-171],[114,-181],[127,-216],[119,-216]]}};
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
    const hpMax = faminto ? 10 : 12, furia0 = faminto ? 40 : 15;
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
      mata: () => { if (Math.random() < .5) sfx(um(['kronk-fala1', 'kronk-fala2', 'kronk-fala3']), .6); },
      grito: () => sfx(um(['soldado-grito1', 'soldado-grito2', 'soldado-grito3', 'soldado-grito4']), .6, () => sfx('soldado-golpe', .6, () => A.tone(260, .25, 'sawtooth', .05, 0, 1.3))),
      estocada: () => sfx('escudeiro-estocada', .6, () => A.hiss(.25, 1400, .8, .08)),
      corda: () => sfx('arco-corda', .7, () => A.hiss(.6, 300, 2, .06)),
      flecha: () => sfx('arqueiro-solta', .6, () => A.hiss(.3, 3000, .5, .08)),
      flechaFora: () => sfx('flecha-de-fora', .8, () => { A.hiss(.4, 3500, .6, .1); A.tone(140, .3, 'sawtooth', .06, .3, .7); }),
      gemido: () => sfx(um(['gemido1', 'gemido2', 'gemido3', 'gemido4']), .5),
      respira: (k) => sfx('kronk-respira' + (k > .75 ? 4 : k > .5 ? 3 : k > .25 ? 2 : 1), .55, () => A.hiss(1, 380, .7, .07)),
    };

    // ---------- estado
    const K = { tipo: 'kronk', x: 260, dir: 1, est: 'guarda', a: 'guarda', f: 0, t: 0, hp: hpMax, inv: 0, cai: 0, vx: 0, fol: 100, folT: 1, esqT: -9 };
    let vidas = 3;
    let furia = furia0, furiaMax = furia0, mortos = 0, golpes = 0, quedas = 0, tempo = 0, fim = false;
    let inimigos = [], flechas = [], parts = [], pocas = [], arcos = [], lento = 0, ensinouCheiro = false, flashB = 0, tela = 0, ondaI = 0, fase = 'luta', fila = [], seta = false, slide = 0, hitstop = 0, shake = 0, shakeM = 0, regen = 0, respT = 0, semLuta = 0, dorTela = 0;
    const quedasOnda = {}; let facil = 1;
    const bgs = cfg.telas.map((s) => { const im = new Image(); im.src = s; return im; });

    // as ondas de cada tela (§9.4 do roteiro)
    const TELAS = [
      [{ lista: ['soldado', 'soldado', 'soldado'], umPorVez: true, dorme: caminho ? 2 : 0 }],
      [{ lista: ['soldado', 'arqueiro'], ikk: ikk }, { lista: ['escudeiro', 'soldado'].concat(faminto ? ['soldado'] : []), lanca: faminto }],
      [{ lista: ['escudeiro', 'escudeiro', 'arqueiro'].concat(extras), dorgh: dorgh, max: 3 }, { lista: ['simon'] }],
    ];
    const chave = () => tela + ':' + ondaI;

    // ---------- criar inimigos
    const HP = { soldado: 4, escudeiro: 4, arqueiro: 2, simon: 14 };
    function novo(tipo, i) {
      const lado = tipo === 'arqueiro' ? 1 : (i % 3 === 2 && tela > 0 ? -1 : 1);
      const e = { hpMax: HP[tipo], tipo, x: lado > 0 ? W + 80 + i * 60 : -80 - i * 60, dir: -lado, est: 'andar', a: tipo === 'escudeiro' ? 'andar' : 'andar', f: 0, t: 0, hp: HP[tipo], timer: 1.2 + Math.random(), escudo: 0, morto: false, some: 0, flash: 0 };
      if (tipo === 'arqueiro') e.posto = W - 150;
      if (tipo === 'simon') { e.timer = 1.6; e.fase = 1; }
      return e;
    }
    function comecaOnda() {
      const o = TELAS[tela][ondaI]; fila = o.lista.map((t, i) => ({ t, i })); o._spawn = tempo; o._ikk = false; o._dorgh = false; o._fim = false; o._lanca = false;
      if (o.lista[0] === 'simon') {
        // antes dele, o som: a mão na roda
        if (ctxA) A.sfx('rangido-roda', .75, () => A.tone(90, 1.2, 'sawtooth', .05, 0, 1.5));
        if (mus) mus.g.gain.setTargetAtTime(.12, ctxA.currentTime, .6);
        legenda(cfg.legendas.rangido || 'Rrrrec.', 2400);
        const t = tela; setTimeout(() => { if (!fim && tela === t) soltaFila(o, true); }, BOT() ? 0 : 2200);
        return;
      }
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
      const sc = k.h / (a.refH * a.res) * (a.esc || 1) * (a.escFim ? 1 + (a.escFim - 1) * clamp(ent.f / (a.frames - 1), 0, 1) : 1);
      const fr = a.seq ? a.seq[Math.max(0, Math.floor(ent.f)) % a.seq.length] : Math.min(a.frames - 1, Math.max(0, Math.floor(ent.f)));
      cx.save(); cx.globalAlpha = alfa; cx.translate(ent.x, 0);
      if (!a.fixo && ent.dir < 0) cx.scale(-1, 1);
      if (k.filtro) cx.filter = k.filtro;
      if (ent.flash > 0) cx.filter = (k.filtro || '') + ' brightness(2.2)';
      if (ent.dor > 0) cx.filter = 'sepia(1) saturate(5) hue-rotate(-35deg) brightness(.95)';
      if (o && o.ok && a.fw) {
        const sx = (fr % a.cols) * a.fw, sy = Math.floor(fr / a.cols) * a.fh, dw = a.fw * sc, dh = a.fh * sc;
        const av = a.avanco ? a.avanco * Math.sin(Math.PI * clamp(ent.f / (a.frames - 1), 0, 1)) : 0;
        cx.drawImage(o.im, sx, sy, a.fw, a.fh, -dw / 2 + av, CHAO - a.go * a.res * sc, dw, dh);
      } else {
        // sem a folha ainda: uma silhueta, para o jogo funcionar mesmo assim
        cx.fillStyle = ent.tipo === 'kronk' ? '#5b5650' : ent.tipo === 'simon' ? '#c9b48a' : '#7a2620';
        const h = k.h, w = h * .32; cx.beginPath(); cx.roundRect(-w / 2, CHAO - h, w, h, 20); cx.fill();
      }
      cx.restore();
    }

    // ---------- a ponta da arma na tela (para o rastro de luz)
    function ponta(ent) {
      const L0 = PONTAS[ent.tipo] && PONTAS[ent.tipo][ent.a]; if (!L0) return null;
      const k = SPR[ent.tipo], a = anim(ent), fr = Math.min(a.frames - 1, Math.max(0, Math.floor(ent.f))), q = L0[fr]; if (!q) return null;
      const sc = k.h / (a.refH * a.res) * (a.esc || 1);
      return { x: ent.x + (ent.dir < 0 ? -q[0] : q[0]) * sc, y: CHAO + q[1] * sc };
    }
    function rastroArma(ent, dt) {
      ent.rastro = ent.rastro || [];
      const atacando = ent === K ? (K.est === 'golpe' || K.est === 'pesado') : ent.est === 'ataca';
      if (atacando && !ent.morto) { const p = ponta(ent), h = SPR[ent.tipo].h; if (p && Math.hypot(p.x - ent.x, (p.y - (CHAO - h * .55)) * .8) > h * .36) ent.rastro.push({ x: p.x, y: p.y, t: tempo }); }
      ent.rastro = ent.rastro.filter((p) => tempo - p.t < .16);
    }
    const JANELA = .45;
    function desenhaRastro(ent) {
      // golpe sem ponta achada no sprite (o baixo do Simon): o brilho fica no chão, na frente, onde o ferro vai passar
      if (ent !== K && ent.est === 'ataca' && !(PONTAS[ent.tipo] && PONTAS[ent.tipo][ent.a])) {
        const a = anim(ent), falta = (a.impacto - ent.f) / a.fps; if (falta < -.1) return;
        const x = ent.x + ent.dir * (REACH[ent.tipo] || 200) * .62, y = CHAO - 34, br = falta <= JANELA, rr = br ? 26 + Math.sin(tempo * 40) * 4 : 18;
        cx.save(); cx.globalCompositeOperation = 'lighter'; const g = cx.createRadialGradient(x, y, 0, x, y, rr * 1.6);
        g.addColorStop(0, br ? 'rgba(255,250,225,1)' : 'rgba(255,96,48,.85)'); g.addColorStop(1, 'rgba(255,96,48,0)'); cx.fillStyle = g; cx.beginPath(); cx.ellipse(x, y, rr * 2.4, rr, 0, 0, 6.3); cx.fill(); cx.restore();
        return;
      }
      const r = ent.rastro; if (!r || !r.length) return;
      let cor = '255,214,140', brilho = .9, raio = 20;
      if (ent !== K) {
        const a = anim(ent), falta = ent.est === 'ataca' ? (a.impacto - ent.f) / a.fps : -1;
        if (falta > JANELA) { cor = '255,96,48'; brilho = .85; raio = 18; }
        else if (falta >= 0) { cor = '255,250,225'; brilho = 1; raio = 24 + Math.sin(tempo * 40) * 4; }   // a hora de esquivar
        else { cor = '255,120,70'; brilho = .6; raio = 18; }
      }
      cx.save(); cx.globalCompositeOperation = 'lighter'; cx.lineCap = 'round'; cx.lineJoin = 'round';
      for (let i = 1; i < r.length; i++) { const k = i / r.length; cx.strokeStyle = `rgba(${cor},${k * brilho * .8})`; cx.lineWidth = 3 + k * 9; cx.beginPath(); cx.moveTo(r[i - 1].x, r[i - 1].y); cx.lineTo(r[i].x, r[i].y); cx.stroke(); }
      const p = r[r.length - 1], g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, raio);
      g.addColorStop(0, `rgba(${cor},${brilho})`); g.addColorStop(1, `rgba(${cor},0)`); cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, raio, 0, 6.3); cx.fill();
      cx.restore();
    }

    // ---------- trocar de animação
    function poe(ent, a, f = 0) { ent.a = a; ent.f = f; ent.t = 0; }
    function avanca(ent, dt, vel = 1) {
      const a = anim(ent); let fps = a.fps * vel;
      if (ent.volta && a.fpsVolta) fps = a.fpsVolta * vel;
      ent.f += dt * fps * (ent.reverso ? -1 : 1);
      const ate = a.ate || a.frames;
      if (a.loop) { const n = a.seq ? a.seq.length : a.frames; if (ent.f >= n) ent.f -= n; return false; }
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
    function arco(ent, forte, frio) {
      const k = SPR[ent.tipo] || SPR.soldado, h = k.h, d = ent.dir || 1;
      arcos.push({ x: ent.x + d * h * .18, y: CHAO - h * .58, r: h * (forte ? .62 : .5), d, age: 0, life: forte ? .2 : .14, forte, frio });
    }
    function faisca(x, y) { for (let i = 0; i < 12; i++) { const ang = Math.random() * Math.PI * 2, sp = 80 + Math.random() * 160; parts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .6, life: .3, age: 0, size: 2 + Math.random() * 2.5, spark: true }); } }
    function juice(forte, leve) { hitstop = forte ? .11 : .06; shake = forte ? .22 : .12; shakeM = (forte ? 14 : 7) * (leve ? .5 : 1); }

    // ---------- alcances (centro a centro, em px do mundo)
    const ALC = { golpe: 268, pesado: 272 };                         // o Kronk
    const REACH = { soldado: 208, escudeiro: 240, simon: 236 };      // até onde o golpe deles chega
    const PARA = { soldado: 168, escudeiro: 204, simon: 190 };       // onde eles param para lutar
    const DANO = { soldado: 2, escudeiro: 2, simon: 2 };
    const melee = (e) => e.tipo === 'soldado' || e.tipo === 'escudeiro' || e.tipo === 'simon';
    let vezAtaque = 0;   // dois inimigos não começam golpe juntos: o próximo espera
    const proxAcao = (e) => {
      // o que ele faz quando o tempo acabar: bater (com o suor antes) ou baixar a guarda um instante
      const cedo = tela === 0 && mortos < 2;
      if (e.tipo === 'escudeiro') { e.prox = Math.random() < .75 ? 'ataca' : 'espera'; e.timer = 1.6 + Math.random() * 1.4; return; }
      e.prox = Math.random() < (cedo ? .55 : .68) ? 'ataca' : 'abre';
      e.timer = (cedo ? 1.9 : 1.15) + Math.random() * (cedo ? 1.1 : 1.0);
    };
    let ensinouGuarda = false, ensinouAr = false;

    // ---------- o fôlego do Kronk: bater cansa; bater sem parar não dá
    const CUSTO = { golpe: 34, pesado: 55, esquiva: 0 };
    function gasta(qual) {
      const c = CUSTO[qual] * (furia >= 80 ? .6 : 1);
      if (K.fol < c) { semAr(); return false; }
      K.fol -= c; K.folT = 0; return true;
    }
    function semAr() {
      K.folPisca = .5;
      if (tempo - (semAr.t || -9) > 1.4) { semAr.t = tempo; SOM.respira(.7); }
      if (!ensinouAr) { ensinouAr = true; legenda(cfg.legendas.ar || 'Ar acabar. Kronk respirar.', 2400); }
    }

    // ---------- o Kronk acerta
    const alvosNaFrente = (alc) => inimigos.filter((e) => !e.morto && e.est !== 'quebra' && (e.x - K.x) * K.dir > -40 && Math.abs(e.x - K.x) < alc).sort((a, b) => Math.abs(a.x - K.x) - Math.abs(b.x - K.x));
    function acertaKronk(pesado) {
      arco(K, pesado, false);
      let alvos = alvosNaFrente(pesado ? ALC.pesado : ALC.golpe);
      if (!alvos.length) return;
      if (!(pesado && furia >= 80)) alvos = alvos.slice(0, 1);
      alvos.forEach((e) => bate(e, pesado));
    }
    function bloqueia(e, dir, yImp, forte) { faisca(e.x - dir * 40, yImp); faisca(e.x - dir * 40, yImp - 20); SOM.escudo(); juice(!!forte, !forte); e.x = clamp(e.x + dir * (forte ? 60 : 24), -200, W + 200); if (!forte) { K.x = clamp(K.x - dir * 28, 60, W - 60); parts.push({ x: e.x - dir * 40, y: yImp, vx: 0, vy: 0, life: .25, age: 0, size: 60, anel: true, azul: true }); } }
    function contra(e) {
      // ele defende e devolve na hora: o golpe já vem no meio
      const a = SPR[e.tipo].a.golpe || SPR[e.tipo].a.alto;
      e.est = 'ataca'; e.contra = true; poe(e, e.tipo === 'simon' ? um(['alto', 'baixo']) : 'golpe', Math.max(0, (anim(e).impacto || 6) - 7)); e.f = Math.max(0, (anim(e).impacto || 6) - 7);
      SOM.grito(); vezAtaque = tempo + .6; void a;
    }
    function bate(e, pesado) {
      const yImp = CHAO - HOMEM_H * .6, dir = Math.sign(e.x - K.x) || K.dir;
      const naSubida = e.est === 'ataca' && e.f < (anim(e).impacto || 99);
      const dano = (n, cambaleia = true) => {
        e.hp -= n; e.flash = .12; e.mostraHp = 2.2; sangue(e.x, yImp, dir); juice(pesado); pesado ? SOM.acertaForte() : SOM.acertaLeve(); SOM.gemido();
        furia = clamp(furia + (naSubida ? 10 : 5), 0, 100);
        if (naSubida) faisca(e.x, yImp - 30);
        if (e.hp <= 0) return morre(e, dir);
        e.x = clamp(e.x + dir * (pesado ? 110 : 45), -200, W + 200);
        if (cambaleia || naSubida) { e.est = 'apanha'; poe(e, 'apanha'); }
      };
      if (e.est === 'dorme') return dano(pesado ? 3 : 1);
      const aberto = e.est === 'aberto' || e.est === 'andar' || e.est === 'apanha' || naSubida;
      if (e.tipo === 'escudeiro') {
        if (aberto && e.est !== 'andar') return dano(pesado ? 2 : 1);
        if (!pesado) { bloqueia(e, dir, yImp); if (!ensinouGuarda) { ensinouGuarda = true; legenda(cfg.legendas.guarda, 2600); } return; }
        e.escudo++; bloqueia(e, dir, yImp, true);
        if (e.escudo >= 2) { e.est = 'quebra'; poe(e, 'quebra'); return; }
        e.est = 'apanha'; poe(e, 'apanha'); e.x = clamp(e.x + dir * 70, -200, W + 200); return;
      }
      if (e.tipo === 'soldado') {
        if (!aberto) {
          if (!pesado) {
            bloqueia(e, dir, yImp); if (!ensinouGuarda) { ensinouGuarda = true; legenda(cfg.legendas.guarda, 2600); }
            if (Math.random() < (tela === 0 ? .35 : .55) && tempo > vezAtaque - .3) contra(e);
            return;
          }
          return dano(2);   // o pesado quebra a guarda
        }
        return dano(pesado ? 3 : 1);
      }
      if (e.tipo === 'arqueiro') return dano(pesado ? 2 : 1);
      if (e.tipo === 'simon') {
        if (e.est === 'gesto' || e.est === 'cai' || e.est === 'recua') return;
        const ab = e.est === 'aberto' || naSubida;
        if (!ab) {
          // o Simon na guarda não se deixa tocar de leve: desvia ou devolve
          if (!pesado) { if (Math.random() < .45) { bloqueia(e, dir, yImp); contra(e); } else { e.est = 'desvio'; poe(e, 'desvio'); e.dx = (e.x > K.x ? 1 : -1) * 120; SOM.esquiva(); } return; }
          if (Math.random() < .5) { e.est = 'desvio'; poe(e, 'desvio'); e.dx = (e.x > K.x ? 1 : -1) * 140; SOM.esquiva(); return; }
          return dano(2);
        }
        return dano(pesado ? 3 : 1);
      }
    }
    function morre(e, dir) {
      e.morto = true; e.est = 'morre'; mortos++; furia = clamp(furia + 12, 0, 100); SOM.mata();
      if (e.tipo === 'simon') { e.est = 'cai'; poe(e, 'cai'); fase = 'fim'; hitstop = .45; shake = .5; shakeM = 22; flashB = 1; legenda('—', 10); return; }
      poe(e, e.tipo === 'escudeiro' ? 'apanha' : 'morre');
      e.dir = anim(e).cai === 'frente' ? dir : -dir;   // quem cai de frente cai para longe do Kronk
    }

    // ---------- o Kronk apanha
    function apanhaKronk(de, n) {
      if (fase !== 'luta' || K.est === 'cai' || K.est === 'levanta') return;
      if (K.est === 'esquiva' && K.inv > 0) { if (tempo - K.esqT < .5) perfeita(de); return; }
      if (K.inv > 0) return;
      n = Math.max(1, Math.round(n * facil));
      K.hp -= n; golpes++; furia = clamp(furia - 10, 0, 100);
      const d = Math.sign(K.x - de.x) || -K.dir;
      sangue(K.x, CHAO - KRONK_H * .62, d); juice(true); SOM.apanha(); K.dor = .35; dorTela = 1; K.hpPerda = (K.hpPerda || 0) + n;
      K.dir = -d || K.dir;   // vira para quem bateu
      if (K.hp <= 0) { K.est = 'cai'; poe(K, 'cai'); K.reverso = false; K.cai = 0; quedas++; return; }
      K.est = 'apanha'; poe(K, 'apanha'); K.inv = .6; K.x = clamp(K.x + d * 70, 60, W - 60);
    }

    // a esquiva no último instante: o mundo fica lento, quem bateu fica aberto, a fúria sobe
    function perfeita(de) {
      if (de && melee(de) && !de.morto) { de.est = 'aberto'; poe(de, de.tipo === 'escudeiro' ? 'guarda' : 'aberto'); de.timer = 1.3; de.perf = true; }
      if (lento > 0) return;
      lento = .5; furia = clamp(furia + 12, 0, 100); SOM.esquiva(); K.fol = Math.min(100, K.fol + 40); K.folGanho = .6;
      parts.push({ x: K.x, y: CHAO - KRONK_H * .6, vx: 0, vy: 0, life: .35, age: 0, size: 120, anel: true });
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
    const podeCancelar = () => { const a = anim(K); return (K.est === 'golpe' || K.est === 'esquiva') && a.livre && K.f >= a.livre; };
    function kronk(dt) {
      const cansado = K.fol < 20;
      const vel = (furia >= 50 ? 1.12 : 1) * (cansado ? .85 : 1);
      if (inp.atkDown) inp.atkT += dt;
      K.inv = Math.max(0, K.inv - dt); K.folPisca = Math.max(0, (K.folPisca || 0) - dt);
      // o fôlego volta quando ele para de bater
      K.folT += dt;
      // só volta parado na guarda: andar e bater não deixam o ar voltar
      if (K.folT > .7 && K.est === 'guarda' && !inp.esq && !inp.dir) K.fol = Math.min(100, K.fol + 24 * (furia >= 80 ? 1.35 : 1) * dt);
      K.esqCd = Math.max(0, (K.esqCd || 0) - dt); K.dor = Math.max(0, (K.dor || 0) - dt); K.folGanho = Math.max(0, (K.folGanho || 0) - dt);
      // virar para o inimigo mais perto quando parado
      if (!ocupado() && !inp.esq && !inp.dir) { const e = inimigos.filter((x) => !x.morto).sort((a, b) => Math.abs(a.x - K.x) - Math.abs(b.x - K.x))[0]; if (e && Math.abs(e.x - K.x) < 520) K.dir = e.x > K.x ? 1 : -1; }
      const livre = !ocupado() || podeCancelar();
      if (livre && inp.esquiva) {
        inp.esquiva = false;
        if (K.esqCd <= 0) { K.esqCd = .45; K.est = 'esquiva'; poe(K, 'esquiva'); K.inv = .48; K.esqT = tempo; K.vx = -K.dir * 430; SOM.esquiva(); return; }
      }
      inp.esquiva = false;
      if (livre && inp.atk === 'golpe') { inp.atk = null; if (gasta('golpe')) { K.est = 'golpe'; poe(K, 'golpe'); K.bateu = false; SOM.golpe(); return; } }
      if (livre && inp.atkDown && inp.atkT >= .18 && K.est !== 'pesado') {
        inp.atk = null;
        if (!inp.semAr) { if (gasta('pesado')) { K.est = 'pesado'; poe(K, 'pesado'); K.bateu = false; K.volta = false; return; } inp.semAr = true; }
      }
      if (!inp.atkDown) inp.semAr = false;
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
      // andar (o corpo dos outros é parede)
      const mv = (inp.dir ? 1 : 0) - (inp.esq ? 1 : 0);
      const limD = fase === 'luta' && inimigos.some((e) => !e.morto) ? W - 70 : W + 40;
      if (mv) {
        K.dir = mv; const x0 = K.x; let nx = clamp(K.x + mv * VK * dt, 60, limD);
        inimigos.forEach((e) => { if (e.morto || e.tipo === 'arqueiro') return; const s = Math.sign(e.x - K.x); if (s === mv && Math.abs(e.x - nx) < 120) nx = e.x - s * 120; });
        K.x = mv > 0 ? Math.max(K.x, Math.min(nx, K.x + VK * dt)) : Math.min(K.x, Math.max(nx, K.x - VK * dt));
        // preso num corpo ou na borda: não fica andando no lugar
        if (Math.abs(K.x - x0) < VK * dt * .25) { if (K.est !== 'guarda') { K.est = 'guarda'; poe(K, 'guarda'); } avanca(K, dt); }
        else { if (K.est !== 'andar') { K.est = 'andar'; poe(K, 'andar'); } avanca(K, dt); }
      } else { if (K.est !== 'guarda') { K.est = 'guarda'; poe(K, 'guarda'); } avanca(K, dt); }
    }
    function reergue() {
      // a onda recomeça na mesma tela, com a fúria do começo
      vidas--;
      if (vidas <= 0) {
        // três vezes no chão: as Goelas desde o começo
        vidas = 3; tela = 0; ondaI = 0; mortos = 0; furia = furia0; K.hp = hpMax; K.fol = 100; K.est = 'guarda'; poe(K, 'guarda'); K.inv = 1.2; K.x = 260;
        inimigos = []; flechas = []; pocas = []; fase = 'chegou'; chegou = tempo; seta = false;
        TELAS.forEach((t) => t.forEach((o) => { o._ikk = o._dorgh = o._lanca = o._fim = false; }));
        legenda(cfg.legendas.recomeca || 'Três vez no chão. Começar de novo.', 3000);
        return;
      }
      const k = chave(); quedasOnda[k] = (quedasOnda[k] || 0) + 1; if (quedasOnda[k] >= 2) facil = .7;
      K.hp = hpMax; furia = furia0; K.fol = 100; K.est = 'guarda'; poe(K, 'guarda'); K.inv = 1.2; K.x = 260;
      inimigos = inimigos.filter((e) => e.morto && e.some > 0); flechas = [];
      comecaOnda();
    }

    // ---------- a fila: de cada lado, só o mais perto luta; os outros esperam atrás, cada um no seu lugar
    function filas() {
      [-1, 1].forEach((lado) => {
        inimigos.filter((e) => !e.morto && melee(e) && e.est !== 'dorme' && (Math.sign(e.x - K.x) || 1) === lado).sort((a, b) => Math.abs(a.x - K.x) - Math.abs(b.x - K.x)).forEach((e, k) => { e.fila = k; });
      });
    }
    function anda(e, alvoX, dt, v) {
      const d = alvoX - e.x;
      // parado no lugar, só se mexe se o Kronk se afastar de verdade (não fica andando em cima dele)
      if (e.parado2 && Math.abs(d) < 26) return false;
      if (Math.abs(d) < 10) { e.parado2 = true; return false; }
      e.parado2 = false;
      const frente = Math.sign(d) === Math.sign(K.x - e.x);
      e.x += Math.sign(d) * Math.min(Math.abs(d), v * (frente ? 1 : .55) * dt);
      if (Math.abs(d) > 40 && frente) { if (e.est !== 'andar') { e.est = 'andar'; poe(e, 'andar'); } avanca(e, dt); return true; }
      if (e.est === 'andar') { e.est = 'guarda'; poe(e, 'guarda'); }
      return false;
    }

    // ---------- os inimigos, por quadro
    function inimigo(e, dt) {
      const a = anim(e), dist = Math.abs(e.x - K.x), lado = Math.sign(K.x - e.x) || 1;
      e.flash = Math.max(0, e.flash - dt);
      if (e.morto) { if (avanca(e, dt)) e.some += dt; return; }
      if (e.est === 'dorme') { avanca(e, dt * .5); return; }
      if (e.est === 'apanha') { if (avanca(e, dt)) { if (e.tipo === 'arqueiro') { e.est = 'posto'; poe(e, 'guarda'); e.timer = .9; } else { e.est = 'guarda'; poe(e, 'guarda'); proxAcao(e); e.timer = Math.max(e.timer * .6, .7); } } return; }
      if (e.est === 'quebra') { if (avanca(e, dt)) { e.tipo = 'soldado'; e.hp = 3; e.hpMax = 3; e.est = 'aberto'; poe(e, 'aberto'); e.timer = 1.2; } return; }
      e.dir = lado;
      if (e.tipo === 'arqueiro') {
        if (e.est !== 'atira' && Math.abs(e.x - e.posto) > 6) { e.est = 'andar'; if (e.a !== 'andar') poe(e, 'andar'); e.x += Math.sign(e.posto - e.x) * 150 * dt; avanca(e, dt); e.dir = Math.sign(e.posto - e.x) || lado; return; }
        if (e.est !== 'atira') { e.est = 'posto'; e.dir = lado; e.timer -= dt; if (e.a !== 'guarda') poe(e, 'guarda'); avanca(e, dt); if (e.timer <= 0) { e.est = 'atira'; poe(e, 'atira'); e.avisou = false; e.soltou = false; } return; }
        const ant = e.f; const acabou = avanca(e, dt);
        if (!e.avisou && e.f >= a.aviso) { e.avisou = true; SOM.corda(); }
        if (!e.soltou && ant < a.impacto && e.f >= a.impacto) { e.soltou = true; SOM.flecha(); arco(e, false, true); flechas.push({ x: e.x + lado * 40, y: CHAO - HOMEM_H * .72, vx: lado * 1500, de: e }); }
        if (acabou) { e.est = 'posto'; poe(e, 'guarda'); e.timer = 2.4 + Math.random() * 1; }
        return;
      }
      if (e.tipo === 'simon') return simon(e, dt, dist, lado);
      if (e.est === 'ataca') {
        const ant = e.f; const acabou = avanca(e, dt);
        if (ant < a.impacto && e.f >= a.impacto) {
          arco(e, false, true);
          const pega = Math.abs(e.x - K.x) <= REACH[e.tipo] && (K.x - e.x) * e.dir > 0;
          if (pega) apanhaKronk(e, e.contra ? 1 : DANO[e.tipo]); else e.errou = true;
        }
        if (acabou) { e.est = 'aberto'; poe(e, e.tipo === 'escudeiro' ? 'guarda' : 'aberto'); e.timer = e.errou ? 1.1 : .75; e.errou = false; e.contra = false; }
        return;
      }
      if (e.est === 'aberto') { e.timer -= dt; avanca(e, dt); if (e.timer <= 0) { e.est = 'guarda'; poe(e, 'guarda'); e.perf = false; proxAcao(e); } return; }
      // o lugar dele na fila
      let alvoX = K.x - lado * (PARA[e.tipo] + (e.fila || 0) * 200);
      if (!(e.fila > 0)) alvoX = clamp(alvoX, 90, W - 90);   // quem luta fica dentro da tela
      if (anda(e, alvoX, dt, e.tipo === 'escudeiro' ? 105 : 160)) return;
      if (e.est !== 'guarda') { e.est = 'guarda'; poe(e, 'guarda'); }
      if (e.prox == null) proxAcao(e);
      avanca(e, dt);
      if ((e.fila || 0) > 0 || dist > REACH[e.tipo] - 4 || K.est === 'cai' || K.est === 'levanta') { e.timer = Math.max(e.timer, .9); return; }
      e.timer -= dt;
      // o golpe espera a vez (o suor só sobe quando ele vai mesmo bater)
      if (e.prox === 'ataca' && e.timer < .6 && tempo < vezAtaque) e.timer = .6;
      if (e.timer <= 0) {
        if (e.prox === 'ataca') { e.est = 'ataca'; poe(e, 'golpe'); e.tipo === 'escudeiro' ? SOM.estocada() : SOM.grito(); vezAtaque = tempo + 1.1; }
        else if (e.prox === 'abre') { e.est = 'aberto'; poe(e, 'aberto'); e.timer = .9; return; }
        proxAcao(e);
      }
    }
    // o Simon: três golpes; na guarda ele não se deixa tocar de leve; abre depois de bater, ou quando o Kronk esquiva na hora
    function simon(e, dt, dist, lado) {
      const vel = e.fase === 3 ? 1.02 : .86, a = anim(e);
      if (e.est === 'cai') { avanca(e, dt * .7); return; }
      if (e.est === 'gesto') { e.timer -= dt; avanca(e, dt); if (e.timer <= 0) { e.est = 'guarda'; poe(e, 'guarda'); e.timer = .9; } return; }
      if (e.est === 'desvio') { e.x = clamp(e.x + e.dx * dt * 3, 80, W - 80); if (avanca(e, dt)) { e.est = 'guarda'; poe(e, 'guarda'); e.timer = Math.min(e.timer, .45 + Math.random() * .3); } return; }
      if (e.fase < 3 && e.hp <= 6) {
        // recua, para, bate dois dedos no peito duas vezes
        e.fase = 3; e.est = 'recua'; e.alvoX = clamp(e.x + (e.x > K.x ? 1 : -1) * 260, 120, W - 120);
      }
      if (e.est === 'recua') { e.dir = lado; e.x += Math.sign(e.alvoX - e.x) * 260 * dt; e.rt = (e.rt || 0) + dt; avanca(e, dt); if (Math.abs(e.alvoX - e.x) < 10 || e.rt > 1.3) { e.est = 'gesto'; poe(e, 'gesto'); e.timer = 2; sfx('simon-peito', .6, () => { A.tone(160, .1, 'sine', .08); A.tone(160, .1, 'sine', .08, .35); }); } return; }
      if (e.est === 'ataca') {
        const ant = e.f; const acabou = avanca(e, dt, vel);
        if (ant < a.impacto && e.f >= a.impacto) {
          arco(e, e.fase === 3, true);
          const pega = Math.abs(e.x - K.x) <= REACH.simon && (K.x - e.x) * e.dir > 0;
          if (pega) apanhaKronk(e, e.contra ? 1 : (e.fase === 3 ? 3 : 2)); else e.errou = true;
        }
        if (acabou) {
          // na terceira fase, às vezes emenda o segundo golpe
          if (e.fase === 3 && !e.emenda && Math.random() < .5 && K.est !== 'cai') { e.emenda = true; e.contra = false; poe(e, um(['alto', 'estocada', 'baixo'])); SOM.grito(); return; }
          e.emenda = false; e.est = 'aberto'; poe(e, 'aberto'); e.timer = e.errou ? 1.0 : (e.fase === 3 ? .6 : .8); e.errou = false; e.contra = false;
        }
        return;
      }
      if (e.est === 'aberto') { e.timer -= dt; avanca(e, dt); if (e.timer <= 0) { e.est = 'guarda'; poe(e, 'guarda'); e.timer = (1 + Math.random() * .7) / vel; } return; }
      const sx = clamp(K.x - lado * PARA.simon, 90, W - 90);
      if (Math.abs(sx - e.x) > 22) { if (e.a !== 'andar') poe(e, 'andar'); e.est = 'anda'; e.dir = Math.sign(sx - e.x) || lado; e.x += Math.sign(sx - e.x) * 180 * vel * dt; avanca(e, dt); return; }
      if (e.est !== 'guarda') { e.est = 'guarda'; poe(e, 'guarda'); }
      e.timer -= dt; avanca(e, dt);
      if (e.timer <= 0 && K.est !== 'cai' && K.est !== 'levanta' && dist <= REACH.simon - 4) { e.est = 'ataca'; e.contra = false; poe(e, um(['alto', 'estocada', 'baixo'])); SOM.grito(); }
    }

    // ---------- as telas
    function atualizaOnda() {
      if (fase !== 'luta') return;
      const o = TELAS[tela][ondaI];
      // os aliados, fora da tela
      if (o.ikk && !o._ikk && tempo - o._spawn > 3) { const arq = inimigos.find((e) => e.tipo === 'arqueiro' && !e.morto); if (arq) { o._ikk = true; SOM.flechaFora(); arq.hp = 0; morre(arq, 1); mortos--; legenda(cfg.legendas.ikk, 1800); } }
      if (o.lanca && !o._lanca && tempo - o._spawn > 5) { const sol = inimigos.find((e) => e.tipo === 'soldado' && !e.morto && e.est !== 'dorme' && e.x > K.x); if (sol) { o._lanca = true; SOM.flechaFora(); sol.hp = 0; morre(sol, 1); mortos--; legenda(cfg.legendas.lanca, 2200); } }
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
          tela++; ondaI = 0; K.x = 120; fase = 'chegou'; K.hp = hpMax; K.fol = 100; inimigos = inimigos.filter(() => false); pocas = []; flechas = [];
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
      // quem está aberto: um anel dourado no chão
      todos.forEach((e) => { if (e.morto || !(e.est === 'aberto' || e.est === 'dorme')) return; const al = .55 + .25 * Math.sin(tempo * 8); cx.strokeStyle = `rgba(255,214,120,${al})`; cx.lineWidth = 4; cx.beginPath(); cx.ellipse(e.x, CHAO + 4, 70, 13, 0, 0, 6.3); cx.stroke(); });
      todos.filter((e) => !e.morto).forEach((e) => desenha(e));
      // o nariz: um instante antes do golpe, o suor frio sobe de quem vai bater
      inimigos.forEach((e) => {
        if (e.morto) return;
        const ant = (e.tipo === 'arqueiro' ? e.est === 'posto' && e.timer < .7 : (e.tipo !== 'simon' && e.est === 'guarda' && e.prox === 'ataca' && !(e.fila > 0) && e.timer < .55) || (e.tipo === 'simon' && e.est === 'guarda' && e.timer < .5));
        if (!ant) return;
        if (!ensinouCheiro) { ensinouCheiro = true; legenda(cfg.legendas.cheiro, 2600); }
        const k = clamp(1 - e.timer / (e.tipo === 'arqueiro' ? .7 : .55), 0, 1) * (faminto ? 1 : .8), hh = SPR[e.tipo].h;
        for (let j = 0; j < 3; j++) {
          const ph = (tempo * 1.6 + j / 3) % 1, x = e.x + Math.sin(tempo * 3 + j * 2) * 14, y = CHAO - hh * (.78 + ph * .45);
          const g = cx.createRadialGradient(x, y, 0, x, y, 26 + ph * 30);
          const cor = e.tipo === 'simon' ? '230,238,246' : '170,200,220';
          g.addColorStop(0, `rgba(${cor},${(.45 * (1 - ph)) * k})`); g.addColorStop(1, `rgba(${cor},0)`);
          cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, 26 + ph * 30, 0, 6.3); cx.fill();
        }
      });
      const pisca = K.inv > 0 && K.est !== 'esquiva' ? (Math.floor(K.inv * 30) % 2 ? .55 : .95) : 1;
      desenha(K, pisca);
      // os rastros de luz das armas
      inimigos.forEach(desenhaRastro); desenhaRastro(K);
      // a vida e o fôlego do Kronk: dois traços no chão, embaixo dele
      if (K.est !== 'cai' && fase !== 'fim') {
        const w = 140, x0 = K.x - w / 2, y0 = CHAO + 20, v = clamp(K.hp / hpMax, 0, 1), f = K.fol / 100;
        cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(x0 - 3, y0 - 3, w + 6, 22); cx.fillRect(x0 - 34, y0 - 3, 28, 22);
        for (let i = 0; i < 3; i++) { cx.fillStyle = i < vidas ? '#efe6d6' : 'rgba(239,230,214,.18)'; cx.fillRect(x0 - 30 + i * 8, y0, 5, 16); }
        cx.fillStyle = K.dor > 0 ? '#ffffff' : '#c0281c'; cx.fillRect(x0, y0, w * v, 7);
        cx.fillStyle = K.folPisca > 0 ? (Math.floor(K.folPisca * 16) % 2 ? '#ff6a3a' : '#5a1a0a') : f < .34 ? '#c8643a' : '#e8c874';
        cx.fillRect(x0, y0 + 10, w * f, 6);
        if (K.folGanho > 0) { cx.fillStyle = `rgba(255,240,200,${K.folGanho})`; cx.fillRect(x0, y0 + 9, w * f, 8); }
      }
      // a vida de quem apanhou, por cima da cabeça
      inimigos.forEach((e) => { if (e.morto || !(e.mostraHp > 0)) return; const hm = HP[e.tipo === 'soldado' && e.hpMax ? 'soldado' : e.tipo] || 4, w = 90, x0 = e.x - w / 2, y0 = CHAO - SPR[e.tipo].h - 26; cx.globalAlpha = Math.min(1, e.mostraHp); cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(x0 - 2, y0 - 2, w + 4, 9); cx.fillStyle = '#e04a2a'; cx.fillRect(x0, y0, w * clamp(e.hp / (e.hpMax || hm), 0, 1), 5); cx.globalAlpha = 1; });
      // os arcos dos golpes
      arcos.forEach((a) => {
        const t = a.age / a.life, al = 1 - t, a0 = -1.15, a1 = .55 + t * .25;
        cx.save(); cx.translate(a.x, a.y); cx.scale(a.d, 1);
        for (let L2 = 0; L2 < 3; L2++) {
          cx.beginPath(); cx.arc(0, 0, a.r * (1 - L2 * .07), a0 + t * .5, a1); cx.lineCap = 'round';
          cx.strokeStyle = a.frio ? `rgba(225,235,245,${al * (.55 - L2 * .15)})` : `rgba(255,${200 - L2 * 30},${120 - L2 * 30},${al * (.7 - L2 * .18)})`;
          cx.lineWidth = (a.forte ? 26 : 16) * (1 - L2 * .3) * (1 - t * .5); cx.stroke();
        }
        cx.restore();
      });
      // as flechas
      cx.strokeStyle = '#d8c8a8'; cx.lineWidth = 3; flechas.forEach((f) => { cx.beginPath(); cx.moveTo(f.x, f.y); cx.lineTo(f.x - Math.sign(f.vx) * 46, f.y); cx.stroke(); });
      // o sangue
      parts.forEach((p) => {
        const t = 1 - p.age / p.life;
        if (p.mist) { cx.globalAlpha = Math.max(0, t) * .35; const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size); g.addColorStop(0, '#7a0f0f'); g.addColorStop(1, 'rgba(122,15,15,0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.size, 0, 6.3); cx.fill(); return; }
        cx.globalAlpha = Math.max(0, t);
        if (p.anel) { cx.strokeStyle = p.azul ? `rgba(170,215,255,${Math.max(0, t) * .9})` : `rgba(255,226,173,${Math.max(0, t) * .8})`; cx.lineWidth = 4; cx.beginPath(); cx.arc(p.x, p.y, p.size * (1.4 - t), 0, 6.3); cx.stroke(); return; }
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
      if (lento > 0) { cx.fillStyle = `rgba(20,30,40,${lento * .35})`; cx.fillRect(0, 0, W, H); }
      if (dorTela > 0) { const g = cx.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, W * .6); g.addColorStop(0, 'rgba(160,0,0,0)'); g.addColorStop(1, `rgba(170,0,0,${dorTela * .6})`); cx.fillStyle = g; cx.fillRect(0, 0, W, H); }
      if (flashB > 0) { cx.fillStyle = `rgba(255,245,230,${flashB * .7})`; cx.fillRect(0, 0, W, H); }
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
      if (lento > 0) { lento -= dt; dt *= .3; }
      flashB = Math.max(0, flashB - dt * 1.5);
      arcos.forEach((a) => { a.age += dt; }); arcos = arcos.filter((a) => a.age < a.life);
      if (fase === 'fim') dt *= .4;
      tempo += dt; shake = Math.max(0, shake - dt);
      kronk(dt);
      filas();
      inimigos.forEach((e) => inimigo(e, dt));
      rastroArma(K, dt); inimigos.forEach((e) => { rastroArma(e, dt); e.mostraHp = Math.max(0, (e.mostraHp || 0) - dt); });
      dorTela = Math.max(0, dorTela - dt * 2.2);
      // dois inimigos nunca ocupam o mesmo lugar: o de trás recua um pouco
      // ninguém atravessa ninguém: o de trás fica atrás; ninguém entra no corpo do Kronk
      inimigos.forEach((e) => { if (e.morto || !melee(e) || e.est === 'dorme') return; const s0 = Math.sign(e.x - K.x) || 1; if (Math.abs(e.x - K.x) < 118 && e.est !== 'desvio') e.x = K.x + s0 * 118; inimigos.forEach((o) => { if (o === e || o.morto || !melee(o) || o.est === 'dorme') return; if ((Math.sign(o.x - K.x) || 1) !== s0) return; if (Math.abs(o.x - e.x) < 125 && Math.abs(e.x - K.x) > Math.abs(o.x - K.x)) { e.x = o.x + s0 * 125; if (e.est === 'andar') { e.est = 'guarda'; poe(e, 'guarda'); } } }); });
      inimigos = inimigos.filter((e) => !(e.morto && e.some > 5));
      flechas.forEach((f) => { f.x += f.vx * dt; if (Math.abs(f.x - K.x) < 46 && K.est !== 'cai') { if (K.inv > 0) { f.fora = true; if (K.est === 'esquiva') perfeita(); } else { apanhaKronk(f.de, 2); f.fora = true; } } if (f.x < -60 || f.x > W + 60) f.fora = true; });
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
    window.__BT = { get inp() { return inp; }, get dtT() { return tempo; }, get K() { return K; }, get ini() { return inimigos; }, get tela() { return tela; }, get fase() { return fase; }, get furia() { return furia; }, get onda() { return ondaI; }, falta: (e) => (e.est === 'ataca' ? (anim(e).impacto - e.f) / anim(e).fps : -1) };   // para os testes
    c.gesto(root, 'golpe', 'batalha');
    comecaOnda();
    requestAnimationFrame((n) => { last = n; requestAnimationFrame(loop); });
    if (window.__BATALHA_RAPIDA) setTimeout(encerra, 200);
  });
};
})();
