/* ==========================================================================
   AS QUATRO VONTADES · CAPÍTULO VI · KRONK — O MAIOR (roteiro interativo)
   --------------------------------------------------------------------------
   Cada texto vem em par: T('português', 'english'). O inglês é o original;
   o português é a tradução e é a chave. Mudou um, mude o outro.
   O Kronk fala no infinitivo, de si na terceira pessoa, sem metáfora. As
   falas dele em CAPS; a barriga também, em âmbar (o parágrafo começa com §).
   A narração fica em caixa normal. Travessão só em fala.
   V('D01', T(...)) prende a dublagem ao parágrafo (só aos 21, só o Kronk).
   Linha do tempo: da festa dos 2 secas (duas secas depois do dia comido do
   Cap. V) até a noite depois da Batalha das Goelas, aos 21.
   O que vem do Cap. V: st.c5 (copiado de aqv_estado.cap5 em inicio()).
   ========================================================================== */
window.LIVRO_EN = window.LIVRO_EN || {};
const T = (pt, en) => { if (en != null) window.LIVRO_EN[pt] = en; return pt; };
const se = (cond, t) => ({ se: cond, t });
const V = (voz, t, cond) => ({ voz, t, se: cond });
const IMG = (n) => 'assets/images/' + n + '.jpg';
const VID = (n) => 'assets/video/' + n + '.mp4';
const MASK = (n) => 'assets/images/mascaras/' + n + '.png';

// ---------------------------------------------------------------- o que veio do Cap. V
const c5 = (st) => st.c5 || {};
const shaaViva = (st) => !!c5(st).shaaViva;
const tukkVivo = (st) => ['inteiro', 'sem_braco'].includes(c5(st).tukk);
const umBraco = (st) => c5(st).tukk === 'sem_braco';
const esc5 = (st, k) => (c5(st).escolhas || {})[k] || null;
const adeus = (st) => c5(st).despedida || esc5(st, 'adeus');
const faixa5 = (st) => c5(st).hessaFaixa || 'neutra';
// ---------------------------------------------------------------- atalhos
const af = (st, k) => (st.af && st.af[k]) || 0;
const alta = (st) => !!window.fomeAlta && window.fomeAlta(st);
// duas versões da mesma frase: cheia, ou curta quando a fome está alta (só aos 21, só no que não é dublado)
const fx = (cheio, curto) => (st) => (alta(st) ? curto : cheio);
const J = (st, k) => st.jogos[k] || {};
const temCarne21 = (st) => st.escolhas.caca21 !== 'comer' || st.escolhas.posto === 'roubar';
const dorghVivo = (st) => af(st, 'dorgh') >= 2;
const aoLado = (st) => [af(st, 'ikk') >= 2 && 'ikk', dorghVivo(st) && 'dorgh', af(st, 'velho') >= 1 && 'velho', af(st, 'gup') >= 2 && 'gup'].filter(Boolean);
// "Shaa dormir" ou "Ghru dormir": quem dormiu e não acordou na primeira idade
const DORMIR = (st) => (shaaViva(st) ? T('Shaa dormir', 'Shaa sleep') : T('Ghru dormir', 'Ghru sleep'));
// a Pergunta: o que o Kronk acredita (aos 7 e aos 21, para a Hessa)
const crenca = (id) => ({ kronk: 'sim', peito: 'sim', naosabe: 'nao' }[id] || 'outro');
const mesmaResposta = (st) => crenca(st.escolhas.p7) !== 'outro' && crenca(st.escolhas.p7) === crenca(st.escolhas.p21h);

// os avisos (estilo Telltale)
const AV = {
  hessa: T('Hessa vai lembrar disso.', 'Hessa will remember this.'),
  ikk: T('Ikk vai lembrar disso.', 'Ikk will remember this.'),
  ikkVelho: T('Ikk e {VELHO} vão lembrar disso.', 'Ikk and {VELHO} will remember this.'),
  dorgh: T('Dorgh vai lembrar disso.', 'Dorgh will remember this.'),
  gup: T('Gup vai lembrar disso.', 'Gup will remember this.'),
  velho: T('{VELHO} vai lembrar disso.', '{VELHO} will remember this.'),
};

// as fogueiras do fim: o que sobra perto do fogo do Kronk
const ultimasFogueiras = (st) => {
  const a = aoLado(st), out = [];
  if (a.includes('ikk')) out.push(T('Fogo de Ikk perto.', 'Ikk fire near.'));
  if (a.includes('dorgh')) out.push(T('Fogo de Dorgh perto.', 'Dorgh fire near.'));
  if (a.includes('velho')) out.push(T('Fogo de {VELHO} perto.', '{VELHO} fire near.'));
  if (a.includes('gup')) out.push(T('Fogo de Gup perto. Gup dentro, dormindo.', 'Gup fire near. Gup inside it, asleep.'));
  return out;
};

window.LIVRO_UI = {
  pt: {
    parte: 'Idade', prox: 'Próxima', fim: 'Encerrar o capítulo', voltar: '← Voltar', continuar: 'Continuar', oque: 'O que Kronk faz?', escolheu: 'Você escolheu:', silencio: 'não dizer nada', silencioR: 'Silêncio', momento: 'Momento de jogo',
    comer: 'Comer', comerDica: 'Segure para comer.', olhar: 'Olhar', olharDica: 'Segure. Olhe até parar.', acabar: 'Acabar',
    narizT: 'O que o nariz guardar', narizSub: 'O nariz do Kronk', narizNovo: 'O nariz guardar', narizVazio: 'Nada ainda.',
    mg: { faro: 'O cheiro', quieto: 'Quieto', tocha: 'A tocha', olhar: 'Debaixo da pedra', treino: 'O pau da Hessa', carne: 'A carne', seguro: 'As mãos', batalha: 'A Batalha das Goelas' },
    verbo: { faro: 'Faro', quieto: 'Quieto', olhar: 'Olhar', forca: 'Força', guerra: 'Guerra' },
    verboDe: { faro: 'faro', quieto: 'quieto', tocha: 'quieto', olhar: 'olhar', treino: 'forca', carne: 'forca', seguro: 'forca', batalha: 'guerra' },
    dica: {
      faro: 'Os cheiros entram pela borda da tela. Passe e segure o dedo em cima de um fio: quanto mais o dedo fica, mais forte ele fica, até virar palavra. Soltar deixa o fio ir.',
      quieto: 'Segure para ficar quieto. Soltar faz barulho.',
      tocha: 'Segure quando a luz vier. Solte quando passar: soltar é andar.',
      olhar: 'Toque em cada coisa debaixo da pedra.',
      treino: 'A Hessa fecha a guarda e abre. Toque quando ela erguer o pau. Cinco vezes.',
      carne: 'Arraste a carne: para a boca, para a mão da Ikk, ou para o lado de rasgar.',
      seguro: 'Arraste para cima, em direção à batalha. Três vezes.',
      batalha: 'Andar: A/D ou setas. Golpe: toque em J ou clique. Golpe pesado: segure J ou o clique e solte. Esquivar: espaço ou clique direito. No celular, os quatro botões da tela.',
    },
    gesto: { faro: 'Siga o cheiro', quieto: 'Segure para ficar quieto', tocha: 'Segure quando a luz vier', olhar: 'Toque no que brilha', treino: 'Bata quando ela abrir', carne: 'Arraste a carne', seguro: 'Puxe', batalha: 'Ninguém te segura.' },
    gestoSub: { faro: 'passe o dedo pelo fio e segure', quieto: 'soltar faz barulho', tocha: 'solte quando a luz passar', olhar: 'cada coisa tem um cheiro', treino: 'toque quando o pau subir', carne: 'para onde ela vai', seguro: 'arraste para cima', batalha: () => (matchMedia('(pointer: coarse)').matches ? 'andar ◀ ▶ · toque para bater · segure e solte para o pesado · esquivar' : 'andar A D · bater J ou clique · segure e solte: pesado · esquivar: espaço') },
    teclaSeg: 'ou segure espaço', comecar: 'Toque para começar',
    coverEye: 'As Quatro Vontades · Livro I · Capítulo VI', coverLede: 'Nasceu no dia comido. Todo mundo esperou. Ele comeu primeiro, a vida inteira.', coverGo: 'Entrar na Pira', coverCont: 'Continuar de onde parei', coverRestart: 'Começar do início', coverHint: 'Use fones. Avance com o botão, com a seta → ou deslizando para o lado.',
    confirm: 'Recomeçar o capítulo? Suas escolhas serão apagadas.', capN: 'Capítulo VI', fimCap: 'Fim do Capítulo VI', ficou: 'O que ficou na areia', suas: 'O que você escolheu', reler: 'Reler e escolher diferente', mesmo: (p) => `${p}% dos leitores fizeram o mesmo`,
    pontos: 'Pontuação do capítulo', jornada: 'Jornada (Capítulos I a VI)', posicao: (p, n) => `${p}º de ${n} leitores`, semCap1: 'Jogue os capítulos anteriores neste navegador para somar a jornada.',
    pts: { faro: 'O faro', treino: 'O treino', quieto: 'Quieto', batalha: 'As Goelas', antes: 'Capítulos I a V' },
    bt: { esq: '◀', dir: '▶', atacar: 'ATACAR', esquivar: 'ESQUIVAR', girar: 'Gire o celular para lutar melhor.', levantar: 'Kronk levantar.', segue: 'Toque para seguir' },
  },
  en: {
    parte: 'Age', prox: 'Next', fim: 'Close the chapter', voltar: '← Back', continuar: 'Continue', oque: 'What does Kronk do?', escolheu: 'You chose:', silencio: 'say nothing', silencioR: 'Silence', momento: 'Moment of play',
    comer: 'Eat', comerDica: 'Hold to eat.', olhar: 'Look', olharDica: 'Hold. Look until it stops.', acabar: 'Finish it',
    narizT: 'What the nose keep', narizSub: 'Kronk’s nose', narizNovo: 'The nose keep', narizVazio: 'Nothing yet.',
    mg: { faro: 'The smell', quieto: 'Still', tocha: 'The torch', olhar: 'Under the stone', treino: 'Hessa’s stick', carne: 'The meat', seguro: 'The hands', batalha: 'The Battle of the Gullets' },
    verbo: { faro: 'Smell', quieto: 'Still', olhar: 'Look', forca: 'Strength', guerra: 'War' },
    verboDe: { faro: 'faro', quieto: 'quieto', tocha: 'quieto', olhar: 'olhar', treino: 'forca', carne: 'forca', seguro: 'forca', batalha: 'guerra' },
    dica: {
      faro: 'Smells come in from the edge of the screen. Pass your finger over a thread and hold it there: the longer it stays, the stronger the thread, until it becomes a word. Let go and the thread drifts away.',
      quieto: 'Hold to keep still. Letting go makes a sound.',
      tocha: 'Hold when the light comes. Let go when it passes: letting go is walking.',
      olhar: 'Touch every thing under the stone.',
      treino: 'Hessa closes her guard and opens it. Tap when she raises the stick. Five times.',
      carne: 'Drag the meat: to the mouth, to Ikk’s hand, or to the side to tear it.',
      seguro: 'Drag upward, toward the battle. Three times.',
      batalha: 'Walk: A/D or arrows. Strike: tap J or click. Heavy strike: hold J or the click and release. Dodge: space or right click. On a phone, the four buttons on screen.',
    },
    gesto: { faro: 'Follow the smell', quieto: 'Hold to keep still', tocha: 'Hold when the light comes', olhar: 'Touch what glows', treino: 'Strike when she opens', carne: 'Drag the meat', seguro: 'Pull', batalha: 'Nobody holds you back.' },
    gestoSub: { faro: 'pass your finger over the thread and hold', quieto: 'letting go makes a sound', tocha: 'let go when the light passes', olhar: 'every thing has a smell', treino: 'tap when the stick goes up', carne: 'where it goes', seguro: 'drag upward', batalha: () => (matchMedia('(pointer: coarse)').matches ? 'walk ◀ ▶ · tap to strike · hold and release for heavy · dodge' : 'walk A D · strike J or click · hold and release: heavy · dodge: space') },
    teclaSeg: 'or hold space', comecar: 'Tap to begin',
    coverEye: 'The Four Wills · Book I · Chapter VI', coverLede: 'He was born on the eaten day. Everyone waited. He ate first, his whole life.', coverGo: 'Walk into the Pyre', coverCont: 'Continue where I left off', coverRestart: 'Start from the beginning', coverHint: 'Wear headphones. Move on with the button, the → key, or a swipe.',
    confirm: 'Restart the chapter? Your choices will be erased.', capN: 'Chapter VI', fimCap: 'End of Chapter VI', ficou: 'What the sand kept', suas: 'What you chose', reler: 'Read again and choose differently', mesmo: (p) => `${p}% of readers did the same`,
    pontos: 'Chapter score', jornada: 'Journey (Chapters I to VI)', posicao: (p, n) => `#${p} of ${n} readers`, semCap1: 'Play the earlier chapters in this browser to add up the journey.',
    pts: { faro: 'The nose', treino: 'The training', quieto: 'Still', batalha: 'The Gullets', antes: 'Chapters I to V' },
    bt: { esq: '◀', dir: '▶', atacar: 'STRIKE', esquivar: 'DODGE', girar: 'Turn your phone to fight better.', levantar: 'Kronk get up.', segue: 'Tap to go on' },
  },
};

// as idades: a névoa cobre menos a cada uma (aos 21, nada)
const NEVOA = { 1: .85, 2: .7, 3: .55, 4: .42, 5: .3, 6: .2, 7: .12, 8: 0 };
const ID = (n, nome, numPt, numEn) => ({ num: T(numPt, numEn), nome });

window.LIVRO = {
  id: 'cap06',
  chaveEstado: 'cap6',
  titulo: 'Kronk',
  subtitulo: 'O Maior',
  subtituloEn: 'The Greatest',
  intertitulo: T('Duas secas depois do dia comido.', 'Two dry seasons after the eaten day.'),
  tituloPag: 'Kronk, o Maior · As Quatro Vontades',
  tituloPagEn: 'Kronk, the Greatest · The Four Wills',
  capa: IMG('capa'),
  proximo: { titulo: 'Capítulo VII', tituloEn: 'Chapter VII', url: '' },

  // ---------------------------------------------------------------- o Cap. V, com os defaults do roteiro (§2)
  inicio: (st) => {
    let a = {}; try { a = JSON.parse(localStorage.getItem('aqv_estado') || '{}') || {}; } catch (e) {}
    const k = a.cap5 || {};
    st.c5 = { veio: !!a.cap5, shaaViva: !!k.shaaViva, tukk: k.tukk || 'morto', hessaFaixa: k.hessaFaixa || 'neutra', estalou: !!k.estalou, despedida: k.despedida || null, escolhas: k.escolhas || {} };
  },

  // ---------------------------------------------------------------- as zonas de som
  zonas: {
    festa: { src: 'assets/audio/festa-loop.mp3', volume: .5, reserva: 'fogo' },
    tenda: { src: 'assets/audio/tenda-loop.mp3', volume: .4, reserva: 'vento' },
    laje: { src: 'assets/audio/laje-dia-loop.mp3', volume: .5, reserva: 'vento' },
    fogo: { src: 'assets/audio/fogo-loop.mp3', volume: .45, reserva: 'fogo' },
    vazio: { src: 'assets/audio/acampamento-vazio-loop.mp3', volume: .5, reserva: 'vento' },
    morro: { src: 'assets/audio/batalha-longe-loop.mp3', volume: .5, reserva: 'vento' },
    guerra: { src: 'assets/audio/batalha-loop.mp3', volume: .55, reserva: 'vento' },
    rangido: { src: 'assets/audio/rangido-loop.mp3', volume: .5, reserva: 'vento' },
    dunas: { src: 'assets/audio/dunas-loop.mp3', volume: .5, reserva: 'vento' },
    frio: { src: 'assets/audio/noite-fria-loop.mp3', volume: .45, reserva: 'vento' },
    pira: { src: 'assets/audio/pira-funeral-loop.mp3', volume: .5, reserva: 'fogo' },
    deserto: { src: 'assets/audio/deserto-noite-loop.mp3', volume: .5, reserva: 'vento' },
  },

  // ---------------------------------------------------------------- O NARIZ: o codex do Kronk
  // O nome é a primeira coisa em que ele sentiu aquele cheiro. Ninguém diz o que ele quer dizer.
  nariz: {
    dormir: { nome: (st) => (shaaViva(st) ? T('cheiro de Shaa dormir', 'Shaa-sleep smell') : T('cheiro de Ghru dormir', 'Ghru-sleep smell')), linha: T('Cheiro igual nada. Pesado. Ficar no nariz.', 'Smell like nothing else. Heavy. Stay in nose.') },
    ferro: { nome: T('cheiro de ferro andar', 'iron-walk smell'), linha: T('Ferro e cavalo e homem. Vir do leste.', 'Iron and horse and men. Come from east.') },
    laje: { nome: T('cheiro de Laje', 'Slab smell'), linha: T('Fruta de cacto passada, seiva, graxa cinza. E homem. Homem velho.', 'Cactus fruit gone bad, tree sap, grey grease. And man. Old man.') },
    'hessa-brava': { nome: T('cheiro de Hessa brava', 'Hessa-angry smell'), linha: T('Suor, rápido. Vir antes do pau.', 'Sweat, quick. Come before stick.') },
    ikk: { nome: T('cheiro de Ikk', 'Ikk smell'), linha: T('Boca cheirar fruta passada. Nos pequeno. Em Kronk, não.', 'Mouth smell of fruit gone bad. On small ones. Not on Kronk.') },
    assobio: { nome: T('cheiro de Assobio', 'Whistle smell'), linha: T('Ferro, cavalo, óleo de lâmina. E uma coisa que num nascer na areia. Onde ir, Grakh cair.', 'Iron, horse, blade oil. And something that not grow in sand. Where it go, Grakh fall.') },
    'kronk-pequeno': { nome: T('cheiro de Kronk pequeno', 'small-Kronk smell'), linha: T('Igual Kronk. Pequeno. Leite por cima.', 'Same as Kronk. Small. Milk on top.') },
    poco: { nome: T('cheiro de poço', 'well smell'), linha: T('Pedra molhada. Lama. Debaixo da areia.', 'Wet stone. Mud. Under sand.') },
    carcaca: { nome: T('cheiro de carne de três sol', 'three-sun-meat smell'), linha: T('Carne. Velha. Mosca.', 'Meat. Old. Flies.') },
    'dorgh-noite': { nome: T('cheiro de Dorgh falar de noite', 'Dorgh-talk-at-night smell'), linha: T('Suor frio, quando boca dizer uma coisa.', 'Cold sweat, when mouth say one thing.') },
    'quase-assobio': { nome: T('cheiro de quase Assobio', 'almost-Whistle smell'), linha: T('Igual Assobio. Num ser Assobio.', 'Like Whistle. Not Whistle.') },
  },

  // ---------------------------------------------------------------- configuração dos jogos (fios do Faro e o resto)
  // fio: { id, cor, de: 'esq'|'dir'|'cima'|'baixo', ate: [x, y] (0 a 1), larg, alvo, isca, fino, texto, cheiro, modo }
  faro: {
    f1: { modo: 'alvo', img: IMG('k1-festa'), fios: [
      { id: 'fumaca', cor: '#9a948c', de: 'esq', ate: [.42, .3], larg: 16, texto: T('Fumaça.', 'Smoke.') },
      { id: 'gente', cor: '#7a4a3a', de: 'baixo', ate: [.6, .58], larg: 16, texto: T('Mão grande.', 'Big hands.') },
      { id: 'gordura', cor: '#e8b74a', de: 'dir', ate: [.5, .45], larg: 26, forte: true, alvo: true, texto: T('Gordura.', 'Fat.') },
    ] },
    f2: { modo: 'alvo', img: IMG('k5-morro'), fios: [
      { id: 'sangue', cor: '#9c2a22', de: 'baixo', ate: [.35, .55], larg: 20, texto: T('Sangue. Muito.', 'Blood. Much.') },
      { id: 'ferro', cor: '#8b8f96', de: 'baixo', ate: [.62, .5], larg: 20, texto: T('Ferro andar.', 'Iron walk.'), cheiro: 'ferro' },
      { id: 'assobio', cor: '#e6eef6', de: 'baixo', ate: [.48, .32], larg: 8, fino: true, alvo: true, anda: true, texto: T('Um cheiro diferente.', 'One smell different.') },
    ] },
    f3: { modo: 'sequencia', img: IMG('k6-parede'), fios: [
      { id: 'sangue', cor: '#9c2a22', de: 'baixo', ate: [.3, .5], larg: 20, t: 0, texto: T('Sangue.', 'Blood.') },
      { id: 'ferro', cor: '#8b8f96', de: 'dir', ate: [.55, .42], larg: 22, t: 2.5, texto: T('Ferro andar.', 'Iron walk.'), cheiro: 'ferro' },
      { id: 'assobio', cor: '#e6eef6', de: 'baixo', ate: [.68, .35], larg: 9, fino: true, t: 5, texto: T('Assobio.', 'Whistle.'), cheiro: 'assobio' },
      { id: 'mais-sangue', cor: '#7e1d18', de: 'esq', ate: [.45, .62], larg: 26, t: 7.5, texto: T('Sangue. Mais.', 'Blood. More.') },
      { id: 'dormir', cor: '#4a3f52', de: 'tudo', ate: [.5, .5], larg: 90, t: 11, auto: true, cheiro: 'dormir', modo: 'fica' },
    ] },
    f4: { modo: 'alvo', img: IMG('k7-gup'), fios: [
      { id: 'c1', cor: '#efe3cf', de: 'esq', ate: [.22, .4], larg: 14, texto: T('Leite. Mãe.', 'Milk. Mother.') },
      { id: 'c2', cor: '#efe3cf', de: 'cima', ate: [.4, .25], larg: 14, texto: T('Leite. Mãe.', 'Milk. Mother.') },
      { id: 'gup', cor: '#c9a06a', de: 'baixo', ate: [.55, .5], larg: 14, alvo: true, texto: T('Esse, não.', 'Not this one.') },
      { id: 'c3', cor: '#efe3cf', de: 'dir', ate: [.75, .35], larg: 14, texto: T('Leite. Mãe.', 'Milk. Mother.') },
      { id: 'c4', cor: '#efe3cf', de: 'dir', ate: [.8, .62], larg: 14, texto: T('Leite. Mãe.', 'Milk. Mother.') },
    ] },
    f5: { modo: 'rastro', img: IMG('k8-dunas'), vento: 'dir',
      rastro: { cor: '#b98a52', texto: T('Bicho. Perto.', 'Beast. Near.') },
      fios: [
        { id: 'carcaca', cor: '#6f7a3a', de: 'cima', ate: [.32, .38], larg: 22, isca: true, texto: T('Carne de três sol.', 'Meat of three suns.'), cheiro: 'carcaca' },
        { id: 'fumaca', cor: '#8c8278', de: 'esq', ate: [.24, .7], larg: 22, isca: true, texto: T('Fumaça de fogo de gente.', 'Smoke of people fire.') },
      ] },
    f6: { modo: 'cavar', img: IMG('k8-leito'), fios: [
      { id: 'A', cor: '#8fb8c8', de: 'baixo', ate: [.2, .58], larg: 16, texto: T('Cheiro de poço. E pedra fria. Fundo.', 'Well smell. And cold stone. Deep.'), cheiro: 'poco' },
      { id: 'B', cor: '#8fb8c8', de: 'baixo', ate: [.5, .62], larg: 16, texto: T('Cheiro de poço. E carne de três sol.', 'Well smell. And meat of three suns.'), cheiro: 'poco' },
      { id: 'C', cor: '#8fb8c8', de: 'baixo', ate: [.82, .55], larg: 16, texto: T('Cheiro de poço. E ferro. E cavalo.', 'Well smell. And iron. And horse.'), cheiro: 'poco' },
    ] },
    f7: { modo: 'alvo', img: IMG('k8-posto'), fios: [
      { id: 'cavalo', cor: '#7b5a3e', de: 'esq', ate: [.3, .48], larg: 16, texto: T('Cavalo.', 'Horse.') },
      { id: 'oleo', cor: '#6c6a52', de: 'cima', ate: [.46, .3], larg: 14, texto: T('Óleo.', 'Oil.') },
      { id: 'ferro', cor: '#8b8f96', de: 'dir', ate: [.66, .4], larg: 18, texto: T('Ferro andar.', 'Iron walk.'), cheiro: 'ferro' },
      { id: 'pao', cor: '#e2b26a', de: 'baixo', ate: [.42, .62], larg: 22, isca: true, texto: T('§PÃO.', '§BREAD.') },
      { id: 'quase', cor: '#e6eef6', de: 'dir', ate: [.58, .55], larg: 9, fino: true, alvo: true, anda: true, texto: T('Um cheiro que Kronk conhecer.', 'One smell Kronk know.') },
    ] },
  },

  // debaixo da Laje (k3b): os cinco pontos, na imagem do debaixo da pedra
  laje: { img: IMG('k3-laje-debaixo'), proporcao: 16 / 9, pontos: [
    { id: 'alambique', x: 30, y: 52, w: 12, h: 18, rotulo: T('O pote grande', 'The big pot'), texto: T('Pote grande c’um nariz. Cheiro de fruta de cacto passada. Kronk lamber. Ruim. Kronk lamber mais.', 'Big pot with nose. Smell of cactus fruit gone bad. Kronk lick. Bad. Kronk lick again.') },
    { id: 'riscos', x: 12, y: 28, w: 12, h: 18, rotulo: T('Os riscos', 'The scratches'), texto: T('Risco na pedra. Muito. Primeiro risco fundo. Último risco raso. Kronk contar na mão. Mão num dar.', 'Scratches in stone. Many. First ones deep. Last ones not deep. Kronk count on hand. Hand not enough.') },
    { id: 'potes', x: 72, y: 60, w: 14, h: 16, rotulo: T('Os potes pequenos', 'The small pots'), texto: T('Pote pequeno, vazio. Um cheirar cinza e amargo. Mesmo cheiro de grande depois de briga.', 'Small pots, empty. One smell grey and bitter. Same smell of big ones after fight.') },
    { id: 'couro', x: 52, y: 40, w: 12, h: 14, rotulo: T('O couro riscado', 'The scratched hide'), texto: T('Couro c’risco em fila. Num ser risco de caça. Kronk num saber o que.', 'Hide with scratches in rows. Not hunt marks. Kronk not know what.') },
    { id: 'sombra', x: 50, y: 80, w: 22, h: 12, rotulo: T('A sombra', 'The shadow'), texto: T('Sombra do tamanho de homem deitado. Cheiro de homem ficar na pedra. Velho. Kronk deitar na sombra. Kronk grande demais pra sombra.', 'Shadow size of man lying. Smell of man stay in stone. Old. Kronk lie down in shadow. Kronk too big for shadow.') },
  ], porta: T('Sair de debaixo da pedra', 'Come out from under the stone') },

  // o treino (k3d): as cinco trocas
  treino: {
    guarda: IMG('k3-hessa-guarda'), ergue: IMG('k3-hessa-ergue'),
    apanha: T('Pau bater na cabeça de Kronk. Kronk ver luz. Kronk rir.', 'Stick hit Kronk head. Kronk see light. Kronk laugh.'),
    acerta: T('Pau bater no braço de Hessa. Hessa num parar.', 'Stick hit Hessa arm. Hessa not stop.'),
  },

  // a carne (k4c)
  carne: { img: IMG('k4-carne'), boca: T('Boca', 'Mouth'), ikk: T('Mão de Ikk', 'Ikk’s hand'), rasgar: T('Rasgar', 'Tear') },

  // as mãos que seguram (k5c)
  seguro: { img: (st) => IMG(umBraco(st) ? 'k5-maos-um-braco' : 'k5-maos'), fundo: IMG('k5-morro'),
    linhas: [T('Kronk ir. Mão segurar Kronk.', 'Kronk go. Hands hold Kronk.'), T('Kronk puxar. Três grande cair na areia. Três grande levantar. Segurar outra vez.', 'Kronk pull. Three big ones fall in sand. Three big ones get up. Hold again.'), T('Uma mão cheirar cinza e osso. Kronk conhecer essa mão.', 'One hand smell of ash and bone. Kronk know this hand.')] },

  // quieto debaixo do couro (k2b) e a tocha do posto (k8l)
  quieto: { img: IMG('k2-couro'), dur: 11 },
  tocha: { img: IMG('k8-posto'), voltas: 3 },

  // a batalha (k8t): ver batalha6.js
  batalha: {
    telas: [IMG('batalha/tela1'), IMG('batalha/tela2'), IMG('batalha/tela3')],
    legendas: {
      sai1: T('Vir mais ferro.', 'More iron come.'),
      sai2: T('Grakh urrar longe. Menos urro.', 'Grakh roar far. Less roar.'),
      entra3: T('Corneta do Pira. Chamar de volta. Kronk num voltar.', 'Horn of Pyre. Call back. Kronk not go back.'),
      ikk: T('Ikk.', 'Ikk.'), dorgh: T('Dorgh.', 'Dorgh.'),
    },
  },

  nevoaDe: (st, p) => 0,

  paginas: [

    // ===================================================== ABERTURA
    { id: 'c00', zona: 'vazio', nevoa: .6, fundo: { img: IMG('capa'), dim: .7, kb: 'in', clima: 'poeira' },
      cartao: { num: T('Capítulo VI · Kronk', 'Chapter VI · Kronk'), nome: T('O Maior', 'The Greatest'), epigrafe: T('Toda fome ter um nome.', 'Every hunger has a name.'), fonte: T('dito Grakh', 'Grakh saying') } },

    // ===================================================== PRIMEIRA IDADE · 2 secas · "Kronk"
    { id: 'i1', parte: T('2 secas', '2 dry seasons'), zona: 'festa', nevoa: NEVOA[1], fundo: { img: IMG('k1-festa'), dim: .6, lado: 'dir', clima: 'brasas' },
      cartao: ID(1, T('Kronk', 'Kronk'), 'Primeira idade · 2 secas', 'First age · 2 dry seasons') },

    { id: 'k1a', zona: 'festa', nevoa: NEVOA[1], fundo: { img: IMG('k1-festa'), dim: .45, lado: 'dir', clima: 'brasas', foco: '40% 50%' },
      texto: [T('Fumaça.', 'Smoke.'), T('Gordura.', 'Fat.'), T('Mão grande.', 'Big hands.')],
      minijogo: 'faro', jogoId: 'f1', mgDica: T('Siga o cheiro mais forte.', 'Follow the strongest smell.'),
      depois: [] },

    { id: 'k1b', zona: 'festa', nevoa: NEVOA[1] - .1, fundo: { img: IMG('k1-festa'), dim: .4, lado: 'dir', clima: 'brasas' },
      sons: [{ fn: (A) => [0, 380, 820, 1150].forEach((ms, i) => setTimeout(() => A.sfx('canto-kronk' + (i + 1), [.6, .5, .5, .45][i]), ms)), p: 1 }],
      texto: [
        T('Pra cima. Kronk subir. Muita mão. Muita boca.', 'Up. Kronk go up. Many hands. Many mouths.'),
        T('KRONK. KRONK. KRONK.', 'KRONK. KRONK. KRONK.'),
        T('Uma boca mais alta que todas. Uma mão pôr carne na boca de Kronk. Mão cheirar cinza e osso.', 'One mouth louder than all. One hand put meat in Kronk mouth. Hand smell of ash and bone.'),
        T('Kronk num saber nome. Kronk saber cheiro.', 'Kronk not know name. Kronk know smell.'),
      ] },

    { id: 'k1c', zona: 'tenda', nevoa: NEVOA[1], fundo: (st) => ({ img: IMG(shaaViva(st) ? 'k1-shaa-dorme' : 'k1-ghru-dorme'), dim: .45, kb: 'in' }),
      texto: (st) => (shaaViva(st) ? [
        T('Shaa cheirar leite e trança. Shaa rir. Dente grande.', 'Shaa smell of milk and braid. Shaa laugh. Big teeth.'),
        T('Shaa deitar. Shaa dormir.', 'Shaa lie down. Shaa sleep.'),
        { t: T('Shaa dormir e cheiro mudar. Kronk puxar trança. Shaa num acordar.', 'Shaa sleep and smell change. Kronk pull braid. Shaa not wake.'), cheiro: 'dormir' },
      ] : [
        T('Velho de meio dente. Velho rir c’os ombro. Velho cheirar raiz.', 'Old one with half teeth. Old one laugh with shoulders. Old one smell of root.'),
        T('Velho sentar. Velho dormir.', 'Old one sit. Old one sleep.'),
        { t: T('Velho dormir e cheiro mudar. Kronk puxar orelha. Velho num acordar.', 'Old one sleep and smell change. Kronk pull ear. Old one not wake.'), cheiro: 'dormir' },
      ]) },

    { id: 'k1d', zona: 'fogo', nevoa: NEVOA[1], fundo: { img: IMG('comer-tigela'), dim: .4, clima: 'brasas', mascara: MASK('comer-tigela') },
      texto: [T('Gordura. Quente. Barriga. Outra barriga.', 'Fat. Warm. Belly. Other belly.'), T('Mão. Dormir.', 'Hands. Sleep.')],
      comer: {} },

    // ===================================================== SEGUNDA IDADE · 4 secas · "Ferro Andar"
    { id: 'i2', parte: T('4 secas', '4 dry seasons'), zona: 'tenda', nevoa: NEVOA[2], fundo: { img: IMG('k2-couro'), dim: .65, lado: 'dir' },
      cartao: ID(2, T('Ferro Andar', 'Iron Walk'), 'Segunda idade · 4 secas', 'Second age · 4 dry seasons') },

    { id: 'k2a', zona: 'tenda', nevoa: NEVOA[2], fundo: { img: IMG('k2-couro'), dim: .45, lado: 'dir' },
      sons: [{ sfx: 'tambor-alerta', p: 0, v: .6 }],
      texto: [
        T('Vento trazer cheiro. Kronk num conhecer esse.', 'Wind bring smell. Kronk not know this one.'),
        { t: T('Ferro. Cavalo. Ferro andar. Muito ferro andar.', 'Iron. Horse. Iron walk. Many iron walk.'), cheiro: 'ferro' },
        T('Grande empurrar pequeno pra baixo do couro. Kronk também.', 'Big ones push small ones under hide. Kronk too.'),
      ] },

    { id: 'k2b', zona: 'tenda', nevoa: NEVOA[2], fundo: { img: IMG('k2-couro'), dim: .7, lado: 'dir' },
      texto: [T('Kronk segurar ar. Pequeno segurar ar. Couro cheirar pequeno. Pequeno cheirar suor frio.', 'Kronk hold breath. Small ones hold breath. Hide smell of small ones. Small ones smell of fear sweat.')],
      minijogo: 'quieto', mgDica: T('Segure para ficar quieto.', 'Hold still.'), depois: [] },

    { id: 'k2c', zona: 'fogo', nevoa: NEVOA[2], fundo: { video: VID('k2-luto'), img: IMG('k2-luto'), dim: .45, clima: 'brasas' },
      sons: [{ sfx: 'choro-grakh', p: 0, v: .55 }],
      texto: [
        T('Muita fogueira de noite. Grande urrar baixo, comprido. Grakh chorar assim.', 'Many fires at night. Big ones roar small, long. That is how Grakh cry.'),
        T('Velho olhar Kronk.', 'Old ones look at Kronk.'),
        T('— Maior ser pequeno ainda. Maior crescer.', '— Greatest be small still. Greatest grow.'),
      ] },

    { id: 'k2d', zona: 'fogo', nevoa: NEVOA[2], fundo: { img: IMG('comer-tigela'), dim: .4, clima: 'brasas', mascara: MASK('comer-tigela') },
      texto: [T('Carne. Barriga. Outra barriga. Velho dar pra Kronk osso com mais carne.', 'Meat. Belly. Other belly. Old one give Kronk bone with most meat.')],
      comer: {} },

    // ===================================================== TERCEIRA IDADE · 7 secas · "A Laje"
    { id: 'i3', parte: T('7 secas', '7 dry seasons'), zona: 'laje', nevoa: NEVOA[3], fundo: { img: IMG('k3-laje'), dim: .6, lado: 'dir', clima: 'areia' },
      cartao: ID(3, T('A Laje', 'The Slab'), 'Terceira idade · 7 secas', 'Third age · 7 dry seasons') },

    { id: 'k3a', zona: 'laje', nevoa: NEVOA[3], fundo: { img: IMG('k3-laje'), dim: .45, lado: 'dir', clima: 'areia' },
      texto: [
        T('Pequeno dizer: aqui morar velho da luz. Velho ir embora. Velho num voltar.', 'Small ones say: here live old one of light. Old one go away. Old one not come back.'),
        se((st) => c5(st).estalou, T('Pequeno estalar a língua. Tk. Tk. Esse ser o nome do velho.', 'Small ones click tongue. Tk. Tk. That is name of old one.')),
        T('Kronk entrar debaixo da pedra. Cheiro sair da pedra.', 'Kronk go under stone. Smell come out of stone.'),
      ] },

    { id: 'k3b', zona: 'laje', nevoa: NEVOA[3] - .1, fundo: { img: IMG('k3-laje-debaixo'), dim: .5, foco: '50% 55%' },
      texto: [T('Debaixo da pedra, sombra e cheiro.', 'Under the stone, shadow and smell.')],
      minijogo: 'olhar',
      depois: [{ t: T('Tudo cheirar igual. Cheiro da pedra.', 'All smell same. Smell of the stone.'), cheiro: 'laje' }],
      escolha: { id: 'laje', pergunta: T('O que levar?', 'What to take?'), opcoes: [
        { id: 'pote', gesto: true, txt: T('Levar o pote cinza.', 'Take the grey pot.'), resultado: [T('Kronk pôr pote debaixo do braço. Cheiro ir c’Kronk.', 'Kronk put pot under arm. Smell go with Kronk.')] },
        { id: 'couro', gesto: true, txt: T('Levar o couro riscado.', 'Take the scratched hide.'), resultado: [T('Kronk enrolar couro. Couro cheirar mão de velho.', 'Kronk roll hide. Hide smell of old man hands.')] },
        { id: 'nada', gesto: true, txt: T('Deixar tudo.', 'Leave it all.'), resultado: [T('Kronk sair. Pedra ficar c’o cheiro.', 'Kronk come out. Stone keep smell.')] },
      ] } },

    { id: 'k3c', zona: 'laje', nevoa: NEVOA[3], fundo: { img: IMG('k3-hessa-guarda'), dim: .45, clima: 'areia' },
      sons: [{ sfx: 'bastao', p: 0, v: .5 }],
      texto: [
        T('Hessa esperar fora da pedra. Hessa ter dois pau. Hessa jogar um pra Kronk.', 'Hessa wait outside stone. Hessa have two sticks. Hessa throw one to Kronk.'),
        T('— Bater em Hessa.', '— Hit Hessa.'),
        se((st) => st.escolhas.laje === 'pote', T('Hessa cheirar pote.', 'Hessa smell the pot.')),
        se((st) => st.escolhas.laje === 'pote', T('— Velho da luz fazer isso. Hessa saber.', '— Old one of light make this. Hessa know.')),
        se((st) => st.escolhas.laje === 'couro', T('— Velho da luz riscar isso. Pra fazer o cinza.', '— Old one of light scratch this. For to make the grey.')),
        se((st) => adeus(st) === 'nome', T('Hessa dizer uma palavra que num ser Grakh. Aheryn. Kronk num conhecer palavra.', 'Hessa say one word that is not Grakh. Aheryn. Kronk not know word.')),
      ] },

    { id: 'k3d', zona: 'laje', nevoa: NEVOA[3], fundo: { img: IMG('k3-hessa-guarda'), dim: .5, clima: 'areia' },
      texto: [T('Hessa fechar. Hessa abrir.', 'Hessa close. Hessa open.')],
      minijogo: 'treino', mgDica: T('Bata quando ela abrir.', 'Strike when she opens.'),
      depois: [{ t: T('Antes de bater, Hessa mudar cheiro. Suor. Kronk num saber o que.', 'Before hit, Hessa smell change. Sweat. Kronk not know what.'), cheiro: 'hessa-brava' }] },

    { id: 'k3e', zona: 'laje', nevoa: NEVOA[3], fundo: { img: IMG('k3-lagarto'), dim: .45, lado: 'dir', clima: 'areia' },
      texto: [
        T('Hessa jogar lagarto. Lagarto morto. Lagarto mexer perna.', 'Hessa throw lizard. Lizard dead. Lizard move leg.'),
        T('— Bicho ferido levantar. Olhar até parar.', '— Hurt beast get up. Look until it stop.'),
        T('Kronk olhar. Lagarto parar.', 'Kronk look. Lizard stop.'),
      ] },

    { id: 'k3f', zona: 'fogo', nevoa: NEVOA[3], fundo: { img: IMG('k3-ritual'), dim: .45, lado: 'dir', clima: 'brasas', mascara: MASK('k3-ritual') },
      texto: [
        T('Grande dar pra Kronk melhor carne. Sempre. Kronk levar melhor carne pra Hessa.', 'Big ones give Kronk best meat. Always. Kronk take best meat to Hessa.'),
        T('Hessa rasgar carne em dois. Devolver metade. Bater na cabeça de Kronk c’a mão.', 'Hessa tear meat in two. Give half back. Hit Kronk head with hand.'),
        T('— Comer. Maior comer.', '— Eat. Greatest eat.'),
        se((st) => esc5(st, 'dente') === 'presente', T('Hessa tirar cordão do pescoço. Dente. Dente grande. Hessa amarrar em Kronk.', 'Hessa take cord from her neck. Tooth. Big tooth. Hessa tie on Kronk.')),
        se((st) => esc5(st, 'dente') === 'presente', T('— Shaa matar sozinha. Primeira caçada.', '— Shaa kill alone. First hunt.')),
      ] },

    { id: 'k3g', zona: 'fogo', nevoa: NEVOA[3], fundo: { img: IMG('k3-ritual'), dim: .55, lado: 'dir', clima: 'brasas' },
      texto: [T('Hessa olhar Kronk muito.', 'Hessa look at Kronk long.'), T('— Quem ser o Maior?', '— Who be Greatest?')],
      escolha: { id: 'p7', pergunta: T('Responder a Hessa', 'Answer Hessa'), opcoes: [
        { id: 'kronk', fala: true, txt: T('KRONK.', 'KRONK.'), acredita: 1, aviso: AV.hessa, resultado: [T('— Todo mundo dizer.', '— Everybody say.')] },
        { id: 'naosabe', fala: true, txt: T('KRONK NUM SABER.', 'KRONK NOT KNOW.'), acredita: -1, af: { hessa: 1 }, aviso: AV.hessa, resultado: [T('— Bom.', '— Good.')] },
        { id: 'peito', gesto: true, txt: T('Bater no peito.', 'Hit chest.'), acredita: 1, af: { dorgh: 1 }, aviso: AV.hessa, resultado: [T('Hessa bater no peito de Kronk. Mais forte.', 'Hessa hit Kronk chest. Harder.')] },
      ] } },

    { id: 'k3h', zona: 'fogo', nevoa: NEVOA[3], fundo: { img: IMG('comer-tigela'), dim: .4, clima: 'brasas', mascara: MASK('comer-tigela') },
      texto: [T('Meia carne. Ainda muito. Barriga. Outra barriga. Cheiro de Hessa perto.', 'Half meat. Still much. Belly. Other belly. Hessa smell near.')],
      comer: {} },

    // ===================================================== QUARTA IDADE · 11 secas · "A Primeira Fome"
    { id: 'i4', parte: T('11 secas', '11 dry seasons'), zona: 'vazio', nevoa: NEVOA[4], fundo: { img: IMG('k4-magro'), dim: .6, clima: 'poeira' },
      cartao: ID(4, T('A Primeira Fome', 'The First Hunger'), 'Quarta idade · 11 secas', 'Fourth age · 11 dry seasons') },

    { id: 'k4a', zona: 'vazio', nevoa: NEVOA[4], fundo: { img: IMG('k4-magro'), dim: .45, clima: 'poeira' },
      texto: [
        T('Pouca chuva. Pouco bicho. Grande num caçar longe. Fogueira pequena.', 'Little rain. Little beast. Big ones not hunt far. Fires small.'),
        { t: T('Boca dos pequeno cheirar fruta passada. Kronk num saber por quê.', 'Mouths of small ones smell of fruit gone bad. Kronk not know why.'), cheiro: 'ikk' },
      ] },

    { id: 'k4b', zona: 'fogo', nevoa: NEVOA[4], fundo: { img: IMG('k4-carne'), dim: .45, clima: 'brasas', mascara: MASK('k4-carne') },
      texto: [
        T('Grande dar carne pra Kronk. Igual sempre. Pedaço grande.', 'Big ones give Kronk meat. Same as always. Big piece.'),
        T('Pequena sentar. Olhar a carne. Num pedir. Grakh num pedir.', 'Small one sit. Look at meat. Not ask. Grakh not ask.'),
        T('Pequena chamar Ikk. Nascer soluçando. Ikk. Ikk.', 'Small one name Ikk. Born with hiccup. Ikk. Ikk.'),
        T('— Por que Kronk comer mais?', '— Why Kronk eat more?'),
      ],
      escolha: { id: 'p11', pergunta: T('Responder a Ikk', 'Answer Ikk'), opcoes: [
        { id: 'maior', fala: true, txt: T('KRONK SER O MAIOR.', 'KRONK BE GREATEST.'), acredita: 1, resultado: [T('Ikk olhar a carne.', 'Ikk look at meat.')] },
        { id: 'naosabe', fala: true, txt: T('KRONK NUM SABER.', 'KRONK NOT KNOW.'), acredita: -1, resultado: [T('Ikk olhar a carne.', 'Ikk look at meat.')] },
        { id: 'dentes', gesto: true, txt: T('Mostrar os dente.', 'Show the teeth.'), af: { ikk: -1 }, aviso: AV.ikk, resultado: [T('Ikk num ir embora. Ikk olhar a carne.', 'Ikk not go. Ikk look at meat.')] },
      ] } },

    { id: 'k4c', zona: 'fogo', nevoa: NEVOA[4], fundo: { img: IMG('k4-carne'), dim: .5, clima: 'brasas' },
      texto: [T('A carne na mão de Kronk.', 'The meat in Kronk hand.')],
      minijogo: 'carne', mgDica: T('Arraste a carne.', 'Drag the meat.'),
      aoTerminar: (st, r, h) => {
        st.f.partilhou = r.destino;
        if (r.destino === 'boca') { st.af.velho++; st.af.ikk--; h.toast(AV.ikk); }
        else if (r.destino === 'rasgar') { st.af.ikk++; h.toast(AV.ikk); }
        else { st.af.ikk += 2; st.af.velho--; h.toast(AV.ikkVelho); }
      },
      depois: (st) => ({
        boca: [T('Kronk comer. Tudo. Ikk olhar até carne acabar. Depois Ikk ir.', 'Kronk eat. All. Ikk look until meat gone. Then Ikk go.')],
        rasgar: [T('Kronk rasgar carne. Igual Hessa. Metade pra Ikk. Ikk comer rápido, soluçar.', 'Kronk tear meat. Like Hessa. Half to Ikk. Ikk eat fast, hiccup.')],
        ikk: [T('Kronk pôr carne toda na mão de Ikk. Ikk olhar carne. Olhar Kronk. Ikk correr. Grande ver.', 'Kronk put all meat in Ikk hand. Ikk look at meat. Look at Kronk. Ikk run. Big ones see.')],
      }[st.f.partilhou] || []) },

    { id: 'k4c2', se: (st) => st.f.partilhou === 'ikk', zona: 'fogo', nevoa: NEVOA[4], fundo: { img: IMG('k4-velho'), dim: .45, lado: 'dir', clima: 'brasas' },
      texto: [
        T('Grande de mão de cinza vir. Grande empurrar outra carne na boca de Kronk. Forte.', 'Big one with ash hands come. Big one push other meat in Kronk mouth. Hard.'),
        T('— Maior comer. Pequeno morrer, vir mais pequeno. Maior só ter um.', '— Greatest eat. Small ones die, more small ones come. Greatest only one.'),
      ] },

    { id: 'k4d', zona: 'fogo', nevoa: NEVOA[4], fundo: { img: IMG('comer-tigela-noite'), dim: .45, clima: 'brasas', mascara: MASK('comer-tigela-noite') },
      texto: [
        T('Barriga. Outra barriga. Kronk deitar. Pequeno num deitar. Pequeno olhar.', 'Belly. Other belly. Kronk lie down. Small ones not lie down. Small ones look.'),
        se((st) => st.f.partilhou && st.f.partilhou !== 'boca', T('Barriga menos cheia. Kronk dormir igual.', 'Belly less full. Kronk sleep anyway.')),
      ],
      comer: {} },

    // ===================================================== QUINTA IDADE · 13 secas · "Atrás"
    { id: 'i5', parte: T('13 secas', '13 dry seasons'), zona: 'morro', nevoa: NEVOA[5], fundo: { img: IMG('k5-morro'), dim: .6, lado: 'dir', clima: 'poeira' },
      cartao: ID(5, T('Atrás', 'Behind'), 'Quinta idade · 13 secas', 'Fifth age · 13 dry seasons') },

    { id: 'k5a', zona: 'morro', nevoa: NEVOA[5], fundo: { img: IMG('k5-morro'), dim: .45, lado: 'dir', clima: 'poeira' },
      texto: [
        T('Pira ir pra guerra. Kronk ir também. Kronk do tamanho dos grande agora. Maior que uns.', 'Pyre go to war. Kronk go too. Kronk big as big ones now. Bigger than some.'),
        T('Mas Kronk ficar atrás. No morro. C’os velho e os pequeno e os sem perna.', 'But Kronk stay back. On hill. With old ones and small ones and the ones with no leg.'),
        T('Lá embaixo, Grakh correr. Lá embaixo, ferro esperar. Ferro num correr. Ferro esperar em fila.', 'Down there, Grakh run. Down there, iron wait. Iron not run. Iron wait in line.'),
      ] },

    { id: 'k5b', zona: 'morro', nevoa: NEVOA[5], fundo: { img: IMG('k5-morro'), dim: .55, lado: 'dir', clima: 'poeira' },
      texto: [T('Cheiro subir do lá embaixo.', 'Smell come up from down there.')],
      minijogo: 'faro', jogoId: 'f2',
      depois: [
        T('Um cheiro diferente. Ferro, e cavalo, e óleo de lâmina. E uma coisa que num nascer na areia.', 'One smell different. Iron, and horse, and oil of blade. And one thing that not grow in sand.'),
        T('Onde esse cheiro ir, Grakh cair.', 'Where this smell go, Grakh fall.'),
        T('Os grande no morro dizer um nome. Um som. Som de lâmina no ar.', 'Big ones on hill say a name. A sound. Sound of blade in air.'),
        { t: T('— Assobio.', '— Whistle.'), cheiro: 'assobio' },
      ] },

    { id: 'k5c', zona: 'morro', nevoa: NEVOA[5], fundo: (st) => ({ img: IMG(umBraco(st) ? 'k5-maos-um-braco' : 'k5-maos'), dim: .45 }),
      texto: [T('Kronk levantar.', 'Kronk get up.')],
      minijogo: 'seguro', mgDica: T('Puxe.', 'Pull.'),
      depois: [
        se(umBraco, T('A mão ser uma só. Um braço, e segurar igual dois.', 'The hand is one only. One arm, and it hold like two.')),
        T('— Hoje não. Maior num morrer antes de crescer.', '— Not today. Greatest not die before grow.'),
        T('A mão ser {VELHO}.', 'The hand be {VELHO}.'),
      ] },

    { id: 'k5d', zona: 'morro', nevoa: NEVOA[5], fundo: { img: IMG('k5-volta'), dim: .45, lado: 'dir', clima: 'poeira' },
      sons: [{ sfx: 'choro-grakh', p: 0, v: .5 }],
      texto: [
        T('Pira voltar. Menos do que ir.', 'Pyre come back. Less than go.'),
        T('Um novo c’um corte na cara passar por Kronk. Sangue ainda molhado. Parar.', 'One young one with cut on face walk past Kronk. Blood still wet. He stop.'),
        T('— Maior lutar quando?', '— Greatest fight when?'),
        T('Novo chamar Dorgh. Som de pau na barriga.', 'Young one name Dorgh. Sound of club in belly.'),
      ],
      escolha: { id: 'p13', pergunta: T('Responder a Dorgh', 'Answer Dorgh'), opcoes: [
        { id: 'logo', fala: true, txt: T('LOGO.', 'SOON.'), acredita: 1, af: { dorgh: 1 }, aviso: AV.dorgh, resultado: [T('— Logo. Dorgh esperar.', '— Soon. Dorgh wait.')] },
        { id: 'soltar', fala: true, txt: T('QUANDO SOLTAR.', 'WHEN THEY LET GO.'), af: { dorgh: -1 }, aviso: AV.dorgh, resultado: [T('Dorgh cuspir.', 'Dorgh spit.'), T('— Então nunca.', '— Then never.')] },
        { id: 'bracos', gesto: true, txt: T('Mostrar os braço marcado.', 'Show the hands that held.'), aviso: AV.dorgh, resultado: [T('Dorgh olhar as marca de dedo nos braço de Kronk. Dorgh ir embora. Num dizer nada.', 'Dorgh look at finger marks on Kronk arms. Dorgh go. Not say nothing.')] },
      ] } },

    { id: 'k5e', zona: 'fogo', nevoa: NEVOA[5], fundo: { img: IMG('comer-tigela'), dim: .45, clima: 'brasas', mascara: MASK('comer-tigela') },
      texto: [T('Carne dos que num voltar. Grakh num jogar carne fora. Barriga. Outra barriga. Dormir.', 'Meat of the ones who not come back. Grakh not waste meat. Belly. Other belly. Sleep.')],
      comer: {} },

    // ===================================================== SEXTA IDADE · 16 secas · "As Goelas"
    { id: 'i6', parte: T('16 secas', '16 dry seasons'), zona: 'guerra', nevoa: NEVOA[6], fundo: { video: VID('k6-parede'), img: IMG('k6-parede'), dim: .6 },
      cartao: ID(6, T('As Goelas', 'The Gullets'), 'Sexta idade · 16 secas', 'Sixth age · 16 dry seasons') },

    { id: 'k6a', zona: 'guerra', nevoa: NEVOA[6], fundo: { video: VID('k6-parede'), img: IMG('k6-parede'), dim: .45, clima: 'poeira' },
      texto: [
        T('Ferro vir c’mais ferro dessa vez. Ferro no peito. Ferro no braço. Pau grande que jogar pedra.', 'Iron come with more iron this time. Iron on chest. Iron on arm. Big wood that throw stone.'),
        T('Pira ir c’tudo. Hessa na frente. Dorgh na frente.', 'Pyre go with all. Hessa in front. Dorgh in front.'),
        T('Kronk atrás. Outra vez. Kronk grande igual ninguém agora. Kronk atrás.', 'Kronk back. Again. Kronk big as nobody now. Kronk back.'),
      ] },

    { id: 'k6b', zona: 'guerra', nevoa: NEVOA[6], fundo: { video: VID('k6-parede'), img: IMG('k6-parede'), dim: .55, clima: 'poeira' },
      texto: [T('Cheiro vir. Muito.', 'Smell come. Much.')],
      minijogo: 'faro', jogoId: 'f3',
      depois: (st) => [
        shaaViva(st) ? T('Cheiro de Shaa dormir. Num ser um. Muito. Nariz de Kronk cheio disso.', 'Smell of Shaa sleep. Not one. Many. Kronk nose full of it.')
          : T('Cheiro de Ghru dormir. Num ser um. Muito. Nariz de Kronk cheio disso.', 'Smell of Ghru sleep. Not one. Many. Kronk nose full of it.'),
      ] },

    { id: 'k6c', zona: 'rangido', nevoa: NEVOA[6], fundo: { img: IMG('k6-goelas-tomadas'), dim: .45 },
      texto: [
        T('Pira correr. Água ficar c’o ferro.', 'Pyre run. Water stay with iron.'),
        T('Ferro fazer tenda nas Goelas. Fazer pau alto pra olhar. Fazer roda c’corda no poço.', 'Iron build tents on the throats of water. Build tall wood to look. Build wheel with rope on well.'),
        T('De noite roda fazer som. Rrrrec. Rrrrec. Toda noite.', 'At night wheel make sound. Kreeek. Kreeek. Every night.'),
        T('Grakh dar nome pelo som. Ferro das Goelas ter nome agora.', 'Grakh name things by sound. Iron at the throats now have name.'),
        T('— Rangido.', '— Creak.'),
      ] },

    { id: 'k6d', zona: 'fogo', nevoa: NEVOA[6], fundo: { img: IMG('k6-dorgh'), dim: .45, clima: 'brasas' },
      sons: [{ sfx: 'choro-grakh', p: 0, v: .4 }],
      texto: [
        T('Dorgh voltar c’o braço aberto. Dorgh parar na frente de Kronk. Dorgh olhar Kronk. Kronk num ter corte nenhum.', 'Dorgh come back with arm open. Dorgh stop in front of Kronk. Dorgh look at Kronk. Kronk have no cut.'),
        T('— Kronk num ser o Maior.', '— Kronk not be Greatest.'),
        T('Ninguém dizer isso antes. Todo mundo ouvir.', 'Nobody say this before. Everybody hear.'),
      ],
      escolha: { id: 'k16', pergunta: T('Diante de Dorgh', 'Facing Dorgh'), opcoes: [
        { id: 'levantar', gesto: true, txt: T('Levantar.', 'Stand up.'), af: { dorgh: -1, velho: 1 }, aviso: AV.dorgh, resultado: [T('Kronk levantar. Kronk uma cabeça mais alto que Dorgh. Dorgh num recuar. Hessa pôr a mão entre os dois.', 'Kronk stand. Kronk one head taller than Dorgh. Dorgh not step back. Hessa put hand between the two.')] },
        { id: 'naosabe', fala: true, txt: T('KRONK NUM SABER.', 'KRONK NOT KNOW.'), acredita: -1, af: { dorgh: 1 }, aviso: AV.dorgh, resultado: [T('Dorgh ficar sem ter o que dizer. Dorgh ir embora.', 'Dorgh have nothing to say. Dorgh go.'), T('Dorgh cheirar sangue e outra coisa. Kronk num saber o que.', 'Dorgh smell of blood and something else. Kronk not know what.')] },
        { id: 'nao-estar', fala: true, txt: T('KRONK NUM ESTAR LÁ.', 'KRONK NOT BE THERE.'), af: { hessa: 1 }, aviso: AV.hessa, resultado: [T('A verdade ficar no meio do fogo. Ninguém responder. Hessa olhar Kronk.', 'The truth stay in the middle of the fire. Nobody answer. Hessa look at Kronk.')] },
      ] } },

    { id: 'k6e', zona: 'rangido', nevoa: NEVOA[6] + .05, fundo: { img: IMG('comer-tigela-olhos'), dim: .45, clima: 'brasas', mascara: MASK('comer-tigela-olhos') },
      texto: [
        T('Grande dar carne pra Kronk. Ainda. Menos que antes. Ainda mais que todo mundo.', 'Big ones give Kronk meat. Still. Less than before. Still more than all.'),
        T('Barriga. Outra barriga. Kronk deitar.', 'Belly. Other belly. Kronk lie down.'),
        T('Pira num deitar. Pira olhar o Rangido fazer som a noite toda.', 'Pyre not lie down. Pyre look at the Creak make sound all night.'),
      ],
      comer: {} },

    // ===================================================== SÉTIMA IDADE · 18 secas · "Kronk Pequeno"
    { id: 'i7', parte: T('18 secas', '18 dry seasons'), zona: 'fogo', nevoa: NEVOA[7], fundo: { img: IMG('k7-roda'), dim: .6, lado: 'dir', clima: 'brasas' },
      cartao: ID(7, T('Kronk Pequeno', 'Small Kronk'), 'Sétima idade · 18 secas', 'Seventh age · 18 dry seasons') },

    { id: 'k7a', zona: 'fogo', nevoa: NEVOA[7], fundo: { img: IMG('k7-roda'), dim: .45, lado: 'dir', clima: 'brasas' },
      texto: [
        T('Os velho sentar em volta de Kronk.', 'Old ones sit around Kronk.'),
        T('— Maior fazer cria. Muita cria. Cria do Maior ser maior.', '— Greatest make cubs. Many cubs. Cub of Greatest be greatest.'),
        T('Grakh viver pouco. Grakh fazer cria cedo. Grakh precisar de muita.', 'Grakh live short. Grakh make cubs early. Grakh need many.'),
        T('Fêmea vir pro fogo de Kronk. Seca passar.', 'Females come to Kronk fire. Seasons go.'),
      ] },

    { id: 'k7b', zona: 'fogo', nevoa: NEVOA[7], fundo: { img: IMG('k7-crias'), dim: .45 },
      sons: [{ sfx: 'choro-cria', p: 0, v: .5 }],
      texto: [
        T('Cria vir. Muita. Toda pequena. Pequena igual toda cria.', 'Cubs come. Many. All small. Small like all cubs.'),
        T('Os velho olhar as cria. Olhar Kronk. Olhar as cria.', 'Old ones look at cubs. Look at Kronk. Look at cubs.'),
        T('Os velho cheirar nada bom.', 'Old ones smell of nothing good.'),
      ] },

    { id: 'k7c', zona: 'fogo', nevoa: NEVOA[7], fundo: { img: IMG('k7-gup'), dim: .45, lado: 'dir', clima: 'brasas' },
      texto: [T('Cinco cria. Cinco cheiro.', 'Five cubs. Five smells.')],
      minijogo: 'faro', jogoId: 'f4',
      depois: [
        { t: T('Uma cria cheirar igual Kronk. Mesmo suor. Mesmo couro. Pequeno.', 'One cub smell like Kronk. Same sweat. Same skin. Small.'), cheiro: 'kronk-pequeno' },
        T('Grakh num ter pai. Cria ser do Pira. Kronk num conhecer palavra pra isso.', 'Grakh have no father. Cub belong to Pyre. Kronk not know word for this.'),
        T('Kronk conhecer cheiro.', 'Kronk know smell.'),
        T('Cria mamar e fazer som. Gup. Esse ser o primeiro som. Esse ser o nome.', 'Cub drink milk and make sound. Gup. That is first sound. That is name.'),
      ],
      escolha: { id: 'gup', pergunta: T('O Pira virar as costa pras cria', 'The Pyre turns its back on the cubs'), opcoes: [
        { id: 'erguer', gesto: true, txt: T('Erguer Gup pra todo mundo ver.', 'Lift Gup up, for all to see.'), af: { gup: 1, velho: -1 }, aviso: AV.gup, resultado: [T('Os velho olhar e ir embora. A mãe rir.', 'Old ones look and go. The mother laugh.'), T('Kronk erguer Gup igual grande erguer Kronk. Ninguém gritar.', 'Kronk lift Gup like big ones lift Kronk. Nobody shout.')] },
        { id: 'ficar', gesto: true, txt: T('Cheirar Gup e ficar.', 'Smell Gup and stay.'), af: { gup: 2 }, aviso: AV.gup, resultado: [T('Kronk pôr nariz na cabeça de Gup. Ficar. Gup agarrar cabelo de Kronk. Num soltar.', 'Kronk put nose in Gup head. Stay. Gup grab Kronk hair. Not let go.')] },
        { id: 'devolver', gesto: true, txt: T('Devolver pra mãe e ir.', 'Give back to the mother and go.'), af: { velho: 1 }, aviso: AV.gup, resultado: [T('Cria ser do Pira. Kronk ir caçar. Cheiro de Gup ir c’Kronk um pouco.', 'Cub belong to Pyre. Kronk go hunt. Smell of Gup go with Kronk a little.')] },
      ] } },

    { id: 'k7d', zona: 'fogo', nevoa: NEVOA[7], fundo: (st) => ({ img: IMG(umBraco(st) ? 'k7-velho-um-braco' : 'k7-velho'), dim: .45 }),
      texto: [
        T('{VELHO} vir. {VELHO} velho agora.', '{VELHO} come. {VELHO} old now.'),
        se(umBraco, T('Um braço, e esse braço apontar pra Kronk.', 'One arm, and that arm point at Kronk.')),
        T('— {VELHO} dar carne pra Kronk quando Kronk pequeno. {VELHO} segurar Kronk no morro. {VELHO} esperar.', '— {VELHO} give meat to Kronk when Kronk small. {VELHO} hold Kronk on hill. {VELHO} wait.'),
        T('— Quem ser o Maior?', '— Who be Greatest?'),
      ],
      escolha: { id: 'p18', pergunta: T('Responder a {VELHO}', 'Answer {VELHO}'), opcoes: [
        { id: 'kronk', fala: true, txt: T('KRONK.', 'KRONK.'), acredita: 1, resultado: [T('— Então mostrar.', '— Then show.')] },
        { id: 'naosabe', fala: true, txt: T('KRONK NUM SABER.', 'KRONK NOT KNOW.'), acredita: -1, af: { velho: -1 }, aviso: AV.velho, resultado: [T('{VELHO} cuspir na areia, perto do pé de Kronk.', '{VELHO} spit on the sand, near Kronk foot.')] },
        { id: 'silencio', silencio: true, resultado: [T('{VELHO} esperar. Depois ir embora.', '{VELHO} wait. Then go.')] },
      ] } },

    { id: 'k7e', zona: 'fogo', nevoa: NEVOA[7], fundo: (st) => ({ img: IMG(af(st, 'gup') >= 1 ? 'comer-gup' : 'comer-tigela'), dim: .45, clima: 'brasas', mascara: MASK(af(st, 'gup') >= 1 ? 'comer-gup' : 'comer-tigela') }),
      texto: [
        T('Carne menor. Ainda carne. Barriga. Outra barriga.', 'Meat smaller. Still meat. Belly. Other belly.'),
        se((st) => af(st, 'gup') >= 1, T('Gup dormir na barriga de Kronk. Subir quando Kronk respirar. Descer.', 'Gup sleep on Kronk belly. Go up when Kronk breathe. Go down.')),
      ],
      comer: {} },

    // ===================================================== OITAVA IDADE · 21 secas · "A Barriga Falar"
    { id: 'i8', parte: T('21 secas', '21 dry seasons'), zona: 'vazio', nevoa: 0, fundo: { img: IMG('k8-acordar'), dim: .6, lado: 'dir' },
      cartao: ID(8, T('A Barriga Falar', 'Belly Speak'), 'Oitava idade · 21 secas', 'Eighth age · 21 dry seasons') },

    // ---------- PRIMEIRO SOL
    { id: 'k8a', zona: 'vazio', fundo: { img: IMG('k8-acordar'), dim: .4, lado: 'dir' },
      aoEntrar: (st) => { st.f.fomeOn = true; st.fome = 55; },
      sons: [{ fn: (A) => A.ronco(.8), p: 1 }],
      texto: [
        V('D01', T('Kronk acordar. Uma coisa errada. Kronk cheirar tudo antes de abrir o olho. Fumaça, pouca. Suor, muito. Bicho, nenhum.', 'Kronk wake. Something wrong. Kronk smell all around before open eyes. Smoke, little. Sweat, much. Beast, none.')),
        T('§GRRUM.', '§GRRUM.'),
        V('D02', T('Barriga falar. Barriga nunca falar antes. A vida toda de Kronk, quieta. Agora falar.', 'Belly speak. Belly never speak before. All Kronk life, quiet. Now speak.')),
      ] },

    { id: 'k8b', zona: 'vazio', fome: 3, fundo: { img: IMG('k8-fogueiras'), dim: .45, clima: 'poeira' },
      texto: [
        fx(T('Kronk contar fogueira. Uma mão de fogueira. Duas mão. Mais três dedo.', 'Kronk count fires. One hand of fires. Two hands. Three fingers more.'), T('Kronk contar fogueira. Pouca.', 'Kronk count fires. Few.')),
        T('Sobrar mão.', 'Hands left over.'),
        { t: T('Entre as fogueira, lugar sem fogueira. Cinza, fria. Cheiro de {DORMIR} na cinza.', 'Between fires, places with no fire. Ash, cold. Smell of {DORMIR} in the ash.'), cheiro: 'dormir' },
      ] },

    { id: 'k8c', zona: 'vazio', fome: 3, fundo: { img: IMG('k8-poco'), dim: .45, lado: 'dir', mascara: MASK('k8-poco') },
      sons: [{ sfx: 'balde-poco', p: 0, v: .6 }],
      texto: [
        { t: T('Poço pequeno. Corda curta. Balde subir c’lama e pouca água.', 'Small well. Rope short. Bucket come up with mud and little water.'), cheiro: 'poco' },
        fx(T('Grakh em fila. Grakh magro. Grakh magro ser errado. Grakh ser feito pra grande.', 'Grakh in line. Grakh thin. Grakh thin is wrong. Grakh made for big.'), T('Grakh em fila. Magro. Errado.', 'Grakh in line. Thin. Wrong.')),
        T('§ÁGUA.', '§WATER.'),
        se((st) => st.f.partilhou === 'ikk', T('Ikk, agora grande, c’arco nas costa, sair da fila. Dar a vez pra Kronk.', 'Ikk, big now, bow on her back, step out of line. Give her turn to Kronk.')),
        se((st) => st.f.partilhou === 'ikk', T('— Ikk beber depois.', '— Ikk drink after.')),
        se((st) => st.f.partilhou === 'rasgar', T('Ikk passar por Kronk. Cheirar o pescoço de Kronk. Voltar pra fila.', 'Ikk walk past Kronk. Smell Kronk neck. Go back to the line.')),
        se((st) => !st.f.partilhou || st.f.partilhou === 'boca', { t: T('Ikk olhar Kronk. Ikk num sair do lugar. Boca de Ikk ainda cheirar fruta passada.', 'Ikk look at Kronk. Ikk not move. Ikk mouth still smell of fruit gone bad.'), cheiro: 'ikk' }),
        T('{VELHO} no fim da fila. {VELHO} cuspir quando Kronk passar.', '{VELHO} at end of line. {VELHO} spit when Kronk pass.'),
        se(umBraco, T('Um braço, e esse braço segurar pau pra andar.', 'One arm, and that arm hold a stick to walk.')),
      ],
      escolha: { id: 'fila', pergunta: T('A fila', 'The line'), opcoes: [
        { id: 'esperar', gesto: true, txt: T('Esperar na fila.', 'Wait in line.'), fome: 10, af: { velho: 1 }, resultado: [T('Kronk esperar. Fila olhar Kronk esperar.', 'Kronk wait. Line look at Kronk wait.')] },
        { id: 'beber', barriga: true, txt: T('BEBER.', 'DRINK.'), fome: -15, af: { ikk: -1 }, resultado: [T('Kronk passar na frente. Ninguém parar Kronk.', 'Kronk go in front. Nobody stop Kronk.')] },
        { id: 'hessa', gesto: true, txt: T('Dar a vez pra Hessa.', 'Give your turn to Hessa.'), af: { hessa: 1 }, fome: 10, aviso: AV.hessa, resultado: [T('Kronk encher o odre. Levar pra sombra onde Hessa estar.', 'Kronk fill the skin. Take it to the shade where Hessa is.')] },
      ] } },

    { id: 'k8d', zona: 'laje', fome: 3, fundo: { img: IMG('k8-hessa-sombra'), dim: .45 },
      texto: [
        V('D03', T('Hessa velha agora. Hessa mais velha que todo Grakh. Hessa num brigar desde a outra seca. Hessa ainda deixar a maça perto da mão.', 'Hessa old now. Hessa older than all Grakh. Hessa not fight since last dry season. Hessa still keep club near hand.')),
        T('— Kronk caçar hoje. Trazer pra Hessa o melhor pedaço.', '— Kronk hunt today. Bring Hessa best piece.'),
        T('Hessa num rir. Hessa nunca rir. Canto da boca mexer um pouco.', 'Hessa not laugh. Hessa never laugh. Corner of mouth move a little.'),
      ] },

    { id: 'k8e', zona: 'dunas', fome: 3, fundo: { video: VID('k8-dunas'), img: IMG('k8-dunas'), dim: .4, clima: 'areia' },
      texto: [T('Kronk sair pra caçar. Areia aberta. Vento.', 'Kronk go hunt. Open sand. Wind.')],
      minijogo: 'faro', jogoId: 'f5', mgDica: T('Siga o bicho. O vento diz onde.', 'Follow the beast. The wind tells you where.'),
      aoTerminar: (st, r, h) => { st.f.caca = r.caca; if (r.isca) h.mudaFome(Math.min(25, Math.round(r.isca * 5))); },
      depois: (st) => [st.f.caca === 'magro' ? T('Primeiro bicho sentir Kronk. Correr. Segundo bicho mais magro. Kronk seguir esse.', 'First beast smell Kronk. Run. Second beast thinner. Kronk follow this one.') : T('Bicho num sentir Kronk. Kronk perto.', 'Beast not smell Kronk. Kronk close.')] },

    { id: 'k8f', zona: 'dunas', fome: 3, fundo: { img: IMG('k8-caca'), dim: .45, mascara: MASK('k8-caca') },
      texto: [
        V('D04', T('Lança entrar. Bicho cair. Bicho levantar. Bicho ferido levantar.', 'Spear go in. Beast fall. Beast get up. Hurt beast get up.')),
        V('D05', T('Kronk olhar até parar.', 'Kronk look until it stop.')),
        T('Bicho parar.', 'Beast stop.'),
        T('§COMER. AGORA.', '§EAT. NOW.'),
      ],
      escolha: { id: 'caca21', pergunta: T('A caça', 'The kill'), opcoes: [
        { id: 'comer', barriga: true, txt: T('COMER AQUI.', 'EAT HERE.'), fome: -35, resultado: [T('Kronk comer. Barriga parar de falar um pouco. Kronk comer mais. Kronk parar.', 'Kronk eat. Belly stop speak a little. Kronk eat more. Kronk stop.')] },
        { id: 'pira', gesto: true, txt: T('Levar tudo pro fogo do Pira.', 'Take all to the Pyre fire.'), fome: 10, af: { ikk: 1, velho: 1, dorgh: 1 }, resultado: [T('Bicho nas costa de Kronk. Kronk andar. Barriga falar o caminho todo.', 'Beast on Kronk back. Kronk walk. Belly speak all the way.')] },
        { id: 'hessa', gesto: true, txt: T('Levar o melhor pedaço pra Hessa primeiro.', 'Take best piece to Hessa first.'), af: { hessa: 1 }, fome: 5, aviso: AV.hessa, resultado: [T('Kronk cortar o melhor pedaço. Levar primeiro.', 'Kronk cut the best piece. Take it first.')] },
      ] } },

    { id: 'k8g', zona: 'fogo', fome: 3, fundo: { img: IMG('k8-ritual'), dim: .45, lado: 'dir', clima: 'brasas', mascara: MASK('k8-ritual') },
      texto: [
        T('Kronk dar pra Hessa o melhor pedaço. Igual sempre.', 'Kronk give Hessa best piece. Like always.'),
        T('Hessa rasgar em dois. Devolver metade.', 'Hessa tear in two. Give half back.'),
        T('Hessa bater na cabeça de Kronk c’a mão.', 'Hessa hit Kronk head with hand.'),
        V('D06', T('Mão num pesar nada.', 'Hand weigh nothing.')),
        V('D07', T('Hessa cheirar couro velho e queimadura no ombro. Igual sempre. E embaixo, outro cheiro. Pouco.', 'Hessa smell of old leather and burn on shoulder. Same as always. And under, other smell. Little.')),
        (st) => (shaaViva(st) ? { t: T('Cheiro de Shaa dormir.', 'Smell of Shaa sleep.'), voz: 'D08', cheiro: 'dormir', modo: 'fica' } : { t: T('Cheiro de Ghru dormir.', 'Smell of Ghru sleep.'), voz: 'D08b', cheiro: 'dormir', modo: 'fica' }),
        T('Kronk num saber por quê.', 'Kronk not know why.'),
      ] },

    { id: 'k8h', zona: 'fogo', fome: 3, fundo: { video: VID('k8-conselho'), img: IMG('k8-conselho'), dim: .45, clima: 'brasas' },
      sons: [{ sfx: 'rangido-longe', p: 0, v: .35 }],
      texto: [
        fx(T('Noite. Pira sentar em volta dum fogo. Longe, o Rangido fazer som.', 'Night. Pyre sit around one fire. Far, the Creak make sound.'), T('Noite. Um fogo. Longe, o Rangido.', 'Night. One fire. Far, the Creak.')),
        T('Dorgh levantar.', 'Dorgh stand.'),
        T('— Água nas Goelas. Ferro nas Goelas. Pouco ferro agora. Ferro achar que Grakh acabar. Grakh ir. Pegar água.', '— Water at the Gullets. Iron at the Gullets. Few iron now. Iron think Grakh finish. Grakh go. Take water.'),
        T('Hessa num levantar.', 'Hessa not stand.'),
        T('— Grakh morrer.', '— Grakh die.'),
        T('— Grakh morrer de sede igual.', '— Grakh die of thirst same.'),
        T('Dorgh olhar Kronk.', 'Dorgh look at Kronk.'),
        T('— Maior ir na frente. Pira ganhar.', '— Greatest go in front. Pyre win.'),
        V('D09', T('Dorgh dizer isso e suor mudar. Suor frio, rápido. Kronk cheirar isso antes. Nos pequeno debaixo do couro, quando ferro andar.', 'Dorgh say this and sweat change. Cold sweat, fast. Kronk smell this before. On small ones under hide, when iron walk.')),
        { t: T('Todo mundo olhar Kronk.', 'All look at Kronk.'), cheiro: 'dorgh-noite' },
      ],
      escolha: { id: 'conselho', pergunta: T('O fogo do conselho', 'The council fire'), opcoes: [
        { id: 'ir', fala: true, voz: 'C-ir', txt: T('IR.', 'GO.'), af: { dorgh: 2, hessa: -1 }, acredita: 1, aviso: AV.dorgh, resultado: [T('Dorgh bater no peito. Metade da roda também.', 'Dorgh hit chest. Half the ring too.')] },
        { id: 'hessa', fala: true, txt: T('HESSA DIZER NUM.', 'HESSA SAY NO.'), af: { hessa: 1, dorgh: -1 }, aviso: AV.hessa, resultado: [T('Dorgh sentar. Dorgh olhar o fogo.', 'Dorgh sit. Dorgh look at fire.')] },
        { id: 'suor', fala: true, txt: T('DORGH CHEIRAR SUOR FRIO.', 'DORGH SMELL OF COLD SWEAT.'), af: { dorgh: -2, velho: 1, hessa: 1 }, aviso: AV.dorgh, resultado: [T('A roda ficar quieta. Dorgh num responder.', 'The ring go quiet. Dorgh not answer.'), T('{VELHO} rir. Sem som.', '{VELHO} laugh. No sound.')] },
        { id: 'comer', barriga: true, txt: T('COMER PRIMEIRO.', 'EAT FIRST.'), af: { velho: -1 }, aviso: AV.velho, resultado: [T('Alguém rir. Depois a roda rir. Risada magra.', 'Someone laugh. Then the ring laugh. Thin laugh.'), T('Kronk num saber por que rir. Barriga saber.', 'Kronk not know why they laugh. Belly know.')] },
      ] } },

    { id: 'k8i', zona: 'deserto', fome: 3, fundo: { img: IMG('k8-noite'), dim: .45, lado: 'dir', clima: 'estrelas' },
      texto: [
        V('D10', T('Mão de Kronk procurar comida. Mão achar areia.', 'Kronk hand look for food. Hand find sand.')),
        T('Kronk deitar. Barriga num deixar.', 'Kronk lie down. Belly not let.'),
      ],
      comer: { vazio: true, escurece: true, aoFim: (st, h) => h.mudaFome(15) } },

    // ---------- SEGUNDO SOL
    { id: 'k8j', zona: 'dunas', fundo: { img: IMG('k8-leito'), dim: .45, clima: 'areia' },
      texto: [
        V('D11', T('Poço pequeno secar. Só lama. Grakh cavar c’a mão.', 'Small well dry. Mud only. Grakh dig with hands.')),
        V('D12', T('Kronk andar c’o nariz baixo.', 'Kronk walk with nose low.')),
      ],
      minijogo: 'faro', jogoId: 'f6', mgDica: T('Cheire. Depois escolha onde cavar.', 'Smell. Then choose where to dig.'),
      aoTerminar: (st, r, h) => { st.f.agua = { A: 'boa', B: 'ruim', C: 'patrulha' }[r.escolha] || 'boa'; if (st.f.agua === 'ruim') { h.mudaFome(10); st.af.ikk--; } if (st.f.agua === 'patrulha') h.mudaFome(10); },
      depois: [] },

    { id: 'k8k', zona: 'dunas', fundo: (st) => ({ img: IMG({ boa: 'k8-agua-boa', ruim: 'k8-agua-ruim', patrulha: 'k8-patrulha' }[st.f.agua || 'boa']), dim: .45, lado: 'dir', mascara: st.f.agua === 'boa' ? MASK('k8-agua-boa') : undefined }),
      texto: (st) => ({
        boa: [T('Kronk cavar. Cavar. Braço no buraco até o ombro. Frio. Molhado.', 'Kronk dig. Dig. Arm in hole to shoulder. Cold. Wet.'), T('Água vir. Pouca. Dar.', 'Water come. Little. Enough.')],
        ruim: [T('Kronk cavar. Água vir marrom. Pequeno beber antes de Kronk parar. Pequeno vomitar.', 'Kronk dig. Water come brown. Small ones drink before Kronk can stop. Small ones throw up.')],
        patrulha: [T('Kronk cavar. Água vir. Cavalo vir também. Ferro no cavalo. Kronk correr. Pequeno correr.', 'Kronk dig. Water come. Horse come too. Iron on horse. Kronk run. Small ones run.')],
      }[st.f.agua || 'boa']),
      escolha: { id: 'agua21', se: (st) => st.f.agua === 'boa', pergunta: T('A água', 'The water'), opcoes: [
        { id: 'chamar', gesto: true, txt: T('Chamar o Pira.', 'Call the Pyre.'), af: { ikk: 1, velho: 1, dorgh: 1 }, resultado: [T('Kronk urrar. Pira vir. Pira beber. Pira olhar Kronk diferente.', 'Kronk roar. Pyre come. Pyre drink. Pyre look at Kronk different.')] },
        { id: 'odre', gesto: true, txt: T('Encher o odre pra Hessa.', 'Fill the skin for Hessa.'), af: { hessa: 1 }, aviso: AV.hessa, resultado: [T('Kronk encher o odre antes de chamar os outro.', 'Kronk fill the skin before calling the others.')] },
        { id: 'beber', barriga: true, txt: T('BEBER.', 'DRINK.'), fome: -25, resultado: [T('Kronk beber até barriga pesar. Depois chamar os outro.', 'Kronk drink until belly heavy. Then call the others.')] },
      ] } },

    { id: 'k8l', zona: 'rangido', fundo: { video: VID('k8-posto'), img: IMG('k8-posto'), dim: .45, clima: 'estrelas' },
      sons: [{ sfx: 'cavalos-vozes', p: 0, v: .4 }],
      texto: [V('D13', T('Noite. Kronk ir pro Rangido. Sozinho. Barriga rente na areia.', 'Night. Kronk go to the Creak. Alone. Belly low to sand.'))],
      minijogo: 'tocha', mgDica: T('Segure quando a luz vier. Solte quando passar.', 'Hold when the light comes. Let go when it passes.'),
      aoTerminar: (st, r) => { st.f.visto = r.visto; },
      depois: (st) => [(st.f.visto || 0) === 0 ? T('Ninguém ver Kronk.', 'Nobody see Kronk.') : (st.f.visto || 0) === 1 ? T('Um ferro olhar. Ferro num ver nada.', 'One iron look. Iron see nothing.') : T('Ferro olhar muito. Ferro acordar outro ferro.', 'Iron look many times. Iron wake other iron.')] },

    { id: 'k8m', zona: 'rangido', fundo: { video: VID('k8-posto'), img: IMG('k8-posto'), dim: .5, clima: 'estrelas' },
      texto: [T('Muito cheiro. Perto.', 'Many smells. Close.')],
      minijogo: 'faro', jogoId: 'f7',
      depois: [
        { t: T('Um cheiro que Kronk conhecer. Ferro, cavalo, óleo de lâmina. E a coisa que num nascer na areia.', 'One smell Kronk know. Iron, horse, blade oil. And the thing that not grow in sand.'), voz: 'D14', cheiro: 'assobio', modo: 'treme' },
        { t: T('Num ser Assobio. Quase Assobio.', 'Not Whistle. Almost Whistle.'), voz: 'D15', cheiro: 'quase-assobio' },
      ] },

    { id: 'k8n', zona: 'rangido', fundo: { img: IMG('k8-pao'), dim: .45, mascara: MASK('k8-pao') },
      sons: [{ sfx: 'rangido-roda', p: 6, v: .6 }],
      texto: [
        V('D16', T('Homem do cheiro de quase Assobio sentar c’um ferro novo. Partir pão. Dar metade.', 'Man with almost-Whistle smell sit with young iron. Break bread. Give half.')),
        V('D17', T('Igual Hessa.', 'Like Hessa.')),
        T('Homem falar. Kronk num conhecer fala de homem.', 'Man talk. Kronk not know talk of men.'),
        T('— Mais uma rodada. Depois o pão de amanhã é por minha conta.', '— One more round. Then tomorrow’s bread is on me.'),
        T('Homem bater no peito c’dois dedo. Bater outra vez. Ferro novo rir. Ferro novo ir andar.', 'Man hit chest with two fingers. Hit again. Young iron laugh. Young iron go walk.'),
        T('Homem ir pra roda. Pôr mão na roda. Roda fazer som.', 'Man go to the wheel. Put hand on wheel. Wheel make sound.'),
        T('Rrrrec.', 'Kreeek.'),
        V('D18', T('Esse homem ser o Rangido.', 'That man be the Creak.')),
        T('§PÃO.', '§BREAD.'),
      ],
      escolha: { id: 'posto', pergunta: T('No escuro, perto do pão', 'In the dark, near the bread'), opcoes: [
        { id: 'roubar', gesto: true, txt: T('Roubar pão pras cria.', 'Steal bread for the cubs.'), af: { gup: 1, ikk: 1 }, aviso: AV.gup, resultado: [T('Kronk pegar pão. Muito. Levar no braço pras cria.', 'Kronk take bread. Much. Carry it in arm for the cubs.')] },
        { id: 'comer', barriga: true, txt: T('PÃO. AGORA.', 'BREAD. NOW.'), fome: -30, resultado: [T('Kronk comer o pão ali. No escuro.', 'Kronk eat the bread there. In the dark.'), T('Pão mole. Kronk nunca comer mole. Barriga quieta.', 'Bread soft. Kronk never eat soft. Belly quiet.')] },
        { id: 'caminho', gesto: true, txt: T('Cheirar o caminho e voltar.', 'Smell the way in and go back.'), flag: 'caminho', resultado: [T('Kronk cheirar onde o ferro dormir. Onde o ferro andar. Kronk voltar.', 'Kronk smell where iron sleep. Where iron walk. Kronk go back.')] },
      ] } },

    { id: 'k8o', zona: 'frio', fome: 10, fundo: { video: VID('k8-hessa'), img: IMG('k8-hessa'), dim: .45, clima: 'estrelas' },
      texto: [
        V('D19', T('Noite do deserto fria. Kronk odiar frio. Kronk sentar perto de Hessa pro frio bater em Kronk primeiro.', 'Desert night cold. Kronk hate cold. Kronk sit near Hessa so cold hit Kronk first.')),
        se(temCarne21, T('Kronk dar pra Hessa o melhor pedaço.', 'Kronk give Hessa best piece.')),
        se(temCarne21, T('Hessa num rasgar.', 'Hessa not tear.')),
        se(temCarne21, T('Hessa num devolver metade.', 'Hessa not give half back.')),
        se(temCarne21, T('Carne ficar na mão de Hessa.', 'Meat stay in Hessa hand.')),
        se((st) => !temCarne21(st), T('Kronk num ter nada pra dar. Kronk dar a mão. Hessa segurar a mão.', 'Kronk have nothing to give. Kronk give hand. Hessa hold hand.')),
        se((st) => st.escolhas.agua21 === 'odre', T('Hessa beber do odre. Pouco.', 'Hessa drink from skin. Little.')),
        T('— Quem ser o Maior?', '— Who be Greatest?'),
      ],
      escolha: { id: 'p21h', pergunta: T('Responder a Hessa', 'Answer Hessa'), opcoes: [
        { id: 'kronk', fala: true, voz: 'C-kronk', txt: T('KRONK.', 'KRONK.'), aoEscolher: (st) => { if (mesmaResposta(st)) st.af.hessa++; }, resultado: [T('— Todo mundo dizer. Ainda.', '— Everybody say. Still.')] },
        { id: 'naosabe', fala: true, voz: 'C-naosabe', txt: T('KRONK NUM SABER.', 'KRONK NOT KNOW.'), aoEscolher: (st) => { if (mesmaResposta(st)) st.af.hessa++; }, resultado: [T('— Hessa num saber também.', '— Hessa not know too.')] },
        { id: 'hessa', fala: true, txt: T('HESSA.', 'HESSA.'), resultado: [T('Hessa bater na cabeça de Kronk. Sem força.', 'Hessa hit Kronk head. No strength.'), T('— Burro.', '— Stupid.')] },
      ] } },

    { id: 'k8o2', zona: 'frio', fundo: { video: VID('k8-hessa'), img: IMG('k8-hessa'), dim: .5, clima: 'estrelas' },
      texto: [T('— Hessa morrer?', '— Hessa die?')],
      escolha: { id: 'morte', pergunta: T('A pergunta da Hessa', 'Hessa’s question'), opcoes: [
        { id: 'morrer', fala: true, voz: 'C-hessa-morrer', txt: T('HESSA MORRER.', 'HESSA DIE.'), resultado: [T('Hessa balançar a cabeça.', 'Hessa nod.'), T('— Bom. Kronk num mentir.', '— Good. Kronk not lie.')] },
        { id: 'silencio', silencio: true, resultado: [T('Hessa esperar. Hessa saber.', 'Hessa wait. Hessa know.')] },
        { id: 'mao', gesto: true, txt: T('Pôr a mão de Hessa no peito de Kronk.', 'Put Hessa hand on Kronk chest.'), resultado: [T('Mão fria. Peito de Kronk quente. Hessa deixar a mão lá.', 'Hand cold. Kronk chest warm. Hessa leave hand there.')] },
      ] } },

    { id: 'k8o3', zona: 'frio', fundo: { video: VID('k8-hessa'), img: IMG('k8-hessa'), dim: .5, clima: 'estrelas' },
      texto: (st) => [
        adeus(st) === 'lua' ? T('— Dia comido ser lua. Velho da luz contar pra Hessa. Hessa nunca contar. Pira precisar de Maior.', '— Day eaten be moon. Old one of light tell Hessa. Hessa never tell. Pyre need Greatest.')
          : ['respeito', 'confianca'].includes(faixa5(st)) ? T('— Velho da luz pôr a mão em Shaa. Luz sair do velho. Kronk sair. Hessa ver.', '— Old one of light put hands on Shaa. Light come out of old one. Kronk come out. Hessa see.')
            : ['hostil', 'fria'].includes(faixa5(st)) ? T('— Velho da luz ir embora. Todo mundo ir embora. Kronk ficar.', '— Old one of light go away. All go away. Kronk stay.')
              : T('— Hessa segurar Kronk primeiro. Antes de todo mundo. Kronk gritar pro sol.', '— Hessa hold Kronk first. Before all. Kronk yell at sun.'),
        T('— Hessa nunca saber se Kronk ser o Maior. Hessa gostar de Kronk igual.', '— Hessa never know if Kronk be Greatest. Hessa like Kronk same.'),
      ] },

    { id: 'k8p', zona: 'frio', fundo: { video: VID('k8-hessa'), img: IMG('k8-hessa'), dim: .55, foco: '50% 60%' },
      texto: [
        T('Hessa bater no peito de Kronk c’a mão. Última vez.', 'Hessa hit Kronk chest with hand. Last time.'),
        V('D20', T('Num pesar nada.', 'Weigh nothing.')),
        T('Hessa respirar. Respirar menos.', 'Hessa breathe. Breathe less.'),
        V('D21', T('Kronk olhar até parar.', 'Kronk look until it stop.')),
        T('Último ar fazer som. Sss. Água em pedra quente.', 'Last breath make sound. Sss. Water on hot stone.'),
        V('D22', T('Hessa morrer c’o som do nome dela.', 'Hessa die with sound of Hessa name.')),
      ],
      olhar: { antes: 3, dica: T('Olhe até parar.', 'Look until it stops.') } },

    { id: 'k8q', zona: 'frio', fundo: { img: IMG('k8-mao-hessa'), dim: .45, mascara: MASK('k8-mao-hessa') },
      texto: (st) => (temCarne21(st) ? [
        T('Carne de Hessa. Kronk segurar carne.', 'Meat of Hessa. Kronk hold meat.'),
        V('D23', T('Boca num abrir.', 'Mouth not open.')),
      ] : [T('Mão de Hessa. Kronk segurar.', 'Hand of Hessa. Kronk hold.')]),
      comer: { vazio: true, escurece: true } },

    // ---------- TERCEIRO SOL
    { id: 'k8r', zona: 'pira', fundo: { video: VID('k8-pira'), img: IMG('k8-pira'), dim: .45, clima: 'brasas' },
      sons: [{ sfx: 'choro-grakh', p: 1, v: .5 }],
      texto: [
        V('D24', T('Pira queimar Hessa. Fogo alto. Cheiro de Hessa subir.', 'Pyre burn Hessa. Fire tall. Smell of Hessa go up.')),
        T('Maça de Hessa ficar na areia.', 'Hessa club stay on sand.'),
        T('Dorgh olhar a maça. Olhar Kronk.', 'Dorgh look at club. Look at Kronk.'),
        T('— Hoje. Goelas.', '— Today. Gullets.'),
        V('D25', T('Ninguém segurar Kronk atrás hoje.', 'Nobody hold Kronk back today.')),
      ] },

    { id: 'k8s', zona: 'pira', fundo: { img: IMG('k8-pintura'), dim: .45, lado: 'dir', clima: 'poeira' },
      sons: [{ sfx: 'tambores-guerra', p: 0, v: .55 }],
      texto: [
        se((st) => af(st, 'ikk') >= 2, T('Ikk pintar argila branca na cara. Ikk pegar arco. Ikk ficar perto de Kronk.', 'Ikk paint white clay on face. Ikk take bow. Ikk stand near Kronk.')),
        se(dorghVivo, T('Dorgh ficar do outro lado de Kronk. Dorgh num olhar Kronk. Dorgh ficar.', 'Dorgh stand on Kronk other side. Dorgh not look at Kronk. Dorgh stay.')),
        se((st) => !dorghVivo(st), T('Dorgh levar os dele e ir pelo outro lado.', 'Dorgh take his own and go by other side.')),
        se((st) => af(st, 'velho') >= 1, T('{VELHO} velho demais pra guerra. {VELHO} pôr argila branca nas costa de Kronk, onde Kronk num alcançar.', '{VELHO} too old for war. {VELHO} put white clay on Kronk back, where Kronk not reach.')),
        se((st) => af(st, 'gup') >= 2, T('Gup agarrar perna de Kronk. Mãe puxar Gup. Gup num soltar. Kronk cheirar cabeça de Gup. Gup soltar.', 'Gup hold Kronk leg. Mother pull Gup. Gup not let go. Kronk smell Gup head. Gup let go.')),
        se(alta, T('§GRRUM.', '§GRRUM.')),
        se(alta, T('Barriga vazia. Braço cheio.', 'Belly empty. Arms full.')),
        T('Pira andar pras Goelas.', 'Pyre walk to the Gullets.'),
      ] },

    { id: 'k8t', zona: 'guerra', fundo: { img: IMG('batalha/tela1'), dim: .5 },
      texto: [T('As Goelas. De dia. Fumaça.', 'The Gullets. By day. Smoke.')],
      minijogo: 'batalha',
      aoTerminar: (st, r) => { st.f.batalha = r; },
      depois: [] },

    { id: 'k8u', zona: 'guerra', fundo: { img: IMG('k8-rangido'), dim: .45 },
      sons: [{ sfx: 'corneta-recuo', p: 0, v: .5 }],
      texto: [
        V('D26', T('Rangido no chão. Espada longe. Homem tentar levantar.', 'The Creak on ground. Sword far. Man try to get up.')),
        V('D27', T('Bicho ferido levantar.', 'Hurt beast get up.')),
      ],
      escolha: { id: 'rangido', pergunta: T('O Rangido', 'The Creak'), opcoes: [
        { id: 'olhar', gesto: true, txt: T('Olhar até parar.', 'Look until it stops.'), depois: 'olhar',
          resultado: (st) => [
            T('Kronk ajoelhar. Homem olhar Kronk. Homem num desviar o olho.', 'Kronk kneel. Man look at Kronk. Man not look away.'),
            T('Mão do homem ir pro peito. Dois dedo. Bater uma vez.', 'Man hand go to chest. Two fingers. Hit one time.'),
            T('Num bater outra.', 'Not hit again.'),
            { t: T('Kronk olhar até parar.', 'Kronk look until it stop.'), voz: 'D28', cheiro: 'dormir' },
            T('Um ferro no cavalo correr pro leste. Ferro novo. Ferro do pão.', 'One iron on horse run east. Young iron. Iron of the bread.'),
            T('Kronk ver. Kronk deixar ir.', 'Kronk see. Kronk let go.'),
          ] },
        { id: 'acabar', gesto: true, txt: T('Acabar.', 'Finish it.'), depois: 'golpe',
          resultado: [
            T('Maça descer. Homem num olhar mais nada.', 'Club come down. Man not look at nothing more.'),
            T('Barriga quieta. Pouco.', 'Belly quiet. Little.'),
            T('Um ferro no cavalo correr pro leste. Ferro novo. Ferro do pão.', 'One iron on horse run east. Young iron. Iron of the bread.'),
            T('Kronk ver. Kronk deixar ir.', 'Kronk see. Kronk let go.'),
          ] },
      ] } },

    { id: 'k8v', zona: 'deserto', fundo: { video: VID('k8-recuo'), img: IMG('k8-recuo'), dim: .45, clima: 'poeira' },
      sons: [{ sfx: 'choro-grakh', p: 2, v: .45 }],
      texto: [
        T('Corneta do Pira chamar de volta. Grakh correr. Água ficar c’o ferro.', 'Horn of Pyre call back. Grakh run. Water stay with iron.'),
        T('Muito Grakh num voltar.', 'Many Grakh not come back.'),
        se((st) => !dorghVivo(st), T('Dorgh num voltar.', 'Dorgh not come back.')),
        se(dorghVivo, T('Dorgh voltar c’Kronk. Dorgh cheirar sangue. Suor frio, não.', 'Dorgh come back with Kronk. Dorgh smell of blood. Not cold sweat.')),
        T('Grakh olhar Kronk. Num igual ontem. Igual quando Kronk pequeno, nas mão.', 'Grakh look at Kronk. Not like yesterday. Like when Kronk small, on the hands.'),
        T('Uns bater no peito quando Kronk passar.', 'Some hit chest when Kronk pass.'),
        se((st) => af(st, 'velho') >= 1, T('{VELHO} ver Kronk vir. {VELHO} num cuspir.', '{VELHO} see Kronk come. {VELHO} not spit.')),
        se((st) => af(st, 'velho') >= 1, T('— Agora. Agora vir.', '— Now. Now come.')),
      ] },

    { id: 'k8w', zona: 'deserto', fundo: { img: IMG('k8-ultima-noite'), dim: .45, lado: 'dir', clima: 'estrelas' },
      texto: [
        V('D29', T('Noite. Pira sentar. Pira pouco agora. Fogueira longe uma da outra.', 'Night. Pyre sit. Pyre few now. Fires far from each other.')),
        fx(T('Os velho falar. Uns dizer: ir pro norte. Frio lá. Grakh do gelo lá. Uns dizer: ficar. Deserto ser dos Grakh.', 'Old ones talk. Some say: go north. Cold there. Grakh of ice there. Some say: stay. Desert be Grakh.'),
          T('Os velho falar. Norte. Ficar. Falar.', 'Old ones talk. North. Stay. Talk.')),
        T('Grakh num ter palavra pra sair do deserto.', 'Grakh have no word for leave the desert.'),
        T('Todo mundo olhar Kronk.', 'All look at Kronk.'),
        se((st) => af(st, 'gup') >= 1, T('Gup subir no colo de Kronk.', 'Gup climb into Kronk lap.')),
        se((st) => af(st, 'gup') >= 1, T('— Quem ser o Maior?', '— Who be Greatest?')),
      ],
      escolha: { id: 'p21', se: (st) => af(st, 'gup') >= 1, pergunta: T('Responder a Gup', 'Answer Gup'), opcoes: [
        { id: 'kronk', fala: true, voz: 'C-kronk', txt: T('KRONK.', 'KRONK.'), acredita: 1, resultado: [T('Os Grakh mais perto bater no peito.', 'The nearest Grakh hit chest.')] },
        { id: 'naosabe', fala: true, voz: 'C-naosabe', txt: T('KRONK NUM SABER.', 'KRONK NOT KNOW.'), acredita: -1, resultado: [T('Gup encostar a cabeça no peito de Kronk.', 'Gup put his head on Kronk chest.')] },
        { id: 'lua', se: (st) => adeus(st) === 'lua', fala: true, voz: 'C-lua', txt: T('DIA COMIDO SER LUA.', 'DAY EATEN BE MOON.'), flag: 'lua21', resultado: [T('Silêncio na roda. {VELHO} levantar e ir pro escuro.', 'Silence in the ring. {VELHO} get up and go into the dark.')] },
      ] } },

    { id: 'k8x', zona: 'deserto', fundo: { img: IMG('k8-ultima-noite'), dim: .4, kb: 'out', lado: 'dir', clima: 'estrelas' },
      sons: [{ fn: (A) => A.ronco(1), p: -3 }],
      texto: (st) => [
        ...ultimasFogueiras(st),
        T('Pira esperar Kronk dizer.', 'Pyre wait for Kronk to say.'),
        T('Kronk num dizer.', 'Kronk not say.'),
        T('§GRRUM.', '§GRRUM.'),
        V('D30', T('Barriga falar. Kronk num ter o que dar pra ela.', 'Belly speak. Kronk have nothing to give it.')),
        V('D31', T('Sol vir. Kronk ainda acordado.', 'Sun come. Kronk still awake.')),
      ],
      fim: true },
  ],

  // ---------------------------------------------------------------- o que este capítulo deixa para os próximos (§10.2)
  estadoFinal: (st) => {
    const b = st.f.batalha || {};
    return {
      velho: tukkVivo(st) ? 'tukk' : 'rruk', afetos: Object.assign({}, st.af), acredita: st.acredita,
      respostas: { p7: st.escolhas.p7 || null, p11: st.escolhas.p11 || null, p13: st.escolhas.p13 || null, p18: st.escolhas.p18 || null, p21h: st.escolhas.p21h || null, p21: st.escolhas.p21 || null },
      laje: st.escolhas.laje || null, partilhou: ({ boca: 'nao', rasgar: 'metade', ikk: 'tudo' })[st.f.partilhou] || null, treino: J(st, 'treino').acertos || 0, quieto: !!J(st, 'quieto').quieto, forca13: J(st, 'seguro').forca || 0,
      k16: st.escolhas.k16 || null, gup: st.escolhas.gup || null, fila: st.escolhas.fila || null, caca: st.f.caca || null, caca21: st.escolhas.caca21 || null,
      conselho: st.escolhas.conselho || null, agua: st.f.agua || null, agua21: st.escolhas.agua21 || null, visto: st.f.visto || 0, posto: st.escolhas.posto || null, caminho: !!st.f.caminho,
      morte: st.escolhas.morte || null, rangido: st.escolhas.rangido || null, lua21: !!st.f.lua21, dorghVivo: dorghVivo(st), aoLado: aoLado(st), nariz: st.nariz.slice(),
      fomeFinal: Math.round(st.fome || 0), batalha: { quedas: b.quedas || 0, mortos: b.mortos || 0, furiaMax: b.furiaMax || 0, golpesRecebidos: b.golpesRecebidos || 0 }, escolhas: st.escolhas,
    };
  },

  // ---------------------------------------------------------------- pontuação escondida (cap06)
  pontos: (st) => {
    const f = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7'].reduce((a, k) => a + (J(st, k).pontos || 0), 0);
    const t = Math.round(600 * (J(st, 'treino').acertos || 0));
    const q = (J(st, 'quieto').pontos || 0) + (J(st, 'tocha').pontos || 0);
    const b = (st.f.batalha && st.f.batalha.pontos) || 0;
    const partes = [['faro', Math.max(400, f)], ['treino', Math.max(200, t)], ['quieto', Math.max(200, q)], ['batalha', Math.max(1000, b)]];
    return { total: partes.reduce((a, [, v]) => a + v, 0), partes };
  },

  // ---------------------------------------------------------------- tela final (um narrador fora do roleplay)
  resumo: (st, lang) => {
    const t = (pt) => window.LIVRO.subst(lang === 'en' && window.LIVRO_EN[pt] != null ? window.LIVRO_EN[pt] : pt, st, (x) => (lang === 'en' && window.LIVRO_EN[x] != null ? window.LIVRO_EN[x] : x));
    const a = st.acredita || 0;
    const frase = a >= 2 ? t(T('Kronk acreditou no que lhe disseram. Na última noite, o Pira ainda acreditava.', 'Kronk believed what they told him. On the last night, the Pyre still did.'))
      : a <= -2 ? t(T('Kronk nunca disse que era o Maior. Também nunca mentiu sobre isso.', 'Kronk never said he was the Greatest. He never lied about it, either.'))
        : t(T('Kronk não sabia. Disse isso, quando não sabia.', 'Kronk did not know. He said so, when he did not.'));
    const revela = {
      img: IMG('simon'),
      olho: t(T('O homem que os Grakh chamavam de Rangido', 'The man the Grakh called the Creak')),
      nome: 'Simon D’Orrose',
      titulo: t(T('Comandante do posto das Goelas, irmão da General-Rainha', 'Commander of the Gullets outpost, brother of the General-Queen')),
      texto: [
        st.escolhas.rangido === 'acabar' ? t(T('Morreu antes de conseguir se levantar.', 'He died before he could get up.')) : t(T('Morreu olhando para quem o matou.', 'He died looking at the one who killed him.')),
        t(T('O sentinela com quem ele tinha dividido o pão cavalgou até Redom sem parar. Laura D’Orrose ouviu o relato inteiro sem dizer nada. Depois pediu os mapas da Boca Seca.', 'The young sentry he had shared his bread with rode to Redom without stopping. Laura D’Orrose heard the whole report without a word. Then she asked for the maps of the Dry Mouth.')),
      ],
    };
    const n = [];
    n.push(mesmaResposta(st) ? t(T('Hessa: viu você responder igual aos sete e aos vinte e um.', 'Hessa: she saw you answer the same at seven and at twenty-one.')) : t(T('Hessa: segurou a carne e não rasgou.', 'Hessa: she held the meat and did not tear it.')));
    n.push({ ikk: t(T('Ikk: lembra quem pôs a carne na mão dela.', 'Ikk: she remembers who put the meat in her hand.')), rasgar: t(T('Ikk: lembra da metade.', 'Ikk: she remembers the half.')), boca: t(T('Ikk: lembra de ver você comer.', 'Ikk: she remembers watching you eat.')) }[st.f.partilhou || 'boca']);
    n.push(dorghVivo(st) ? t(T('Dorgh: voltou com você, cheirando a sangue.', 'Dorgh: he came back with you, smelling of blood.')) : t(T('Dorgh: foi pelo outro lado.', 'Dorgh: he went by the other side.')));
    n.push(af(st, 'velho') >= 1 ? t(T('{VELHO}: “Agora. Agora você vem.”', '{VELHO}: “Now. Now you come.”')) : t(T('{VELHO}: cuspiu mais uma vez, na volta.', '{VELHO}: he spat once more, on the way back.')));
    n.push(af(st, 'gup') >= 2 ? t(T('Gup: dorme perto do seu fogo.', 'Gup: he sleeps by your fire.')) : t(T('Gup: dorme perto do fogo da mãe.', 'Gup: he sleeps by his mother’s.')));
    if (st.f.lua21) n.push(t(T('Você contou ao Pira o que comeu o dia.', 'You told the Pyre what ate the day.')));
    const tr2 = (x) => (lang === 'en' && window.LIVRO_EN[x] != null ? window.LIVRO_EN[x] : x);
    const nariz = st.nariz.map((id) => { const e = window.LIVRO.nariz[id]; return e ? tr2(typeof e.nome === 'function' ? e.nome(st) : e.nome) : id; });
    const R = {
      p7: { kronk: T('“KRONK.”', '“KRONK.”'), naosabe: T('“KRONK NUM SABER.”', '“KRONK NOT KNOW.”'), peito: T('Bateu no peito', 'Hit your chest') },
      partilhou: { boca: T('Comeu tudo', 'Ate it all'), rasgar: T('Rasgou e deu metade', 'Tore it and gave half'), ikk: T('Pôs tudo na mão dela', 'Put it all in her hand') },
      p13: { logo: T('“LOGO.”', '“SOON.”'), soltar: T('“QUANDO SOLTAR.”', '“WHEN THEY LET GO.”'), bracos: T('Mostrou os braços marcados', 'Showed the marked arms') },
      gup: { erguer: T('Ergueu Gup para todos verem', 'Lifted Gup for all to see'), ficar: T('Cheirou Gup e ficou', 'Smelled Gup and stayed'), devolver: T('Devolveu à mãe', 'Gave him back to the mother') },
      conselho: { ir: T('“IR.”', '“GO.”'), hessa: T('“HESSA DIZER NUM.”', '“HESSA SAY NO.”'), suor: T('Disse o cheiro do Dorgh', 'Said what Dorgh smelled of'), comer: T('“COMER PRIMEIRO.”', '“EAT FIRST.”') },
      posto: { roubar: T('Roubou pão para as crias', 'Stole bread for the cubs'), comer: T('Comeu o pão no escuro', 'Ate the bread in the dark'), caminho: T('Cheirou o caminho e voltou', 'Smelled the way in and went back') },
      morte: { morrer: T('“HESSA MORRER.”', '“HESSA DIE.”'), silencio: T('Silêncio', 'Silence'), mao: T('A mão dela no seu peito', 'Her hand on your chest') },
      rangido: { olhar: T('Olhou até parar', 'Looked until it stopped'), acabar: T('Acabou', 'Finished it') },
    };
    const Q = {
      p7: T('Aos sete, “Quem ser o Maior?”', 'At seven, “Who be Greatest?”'), partilhou: T('Aos onze, a carne e a Ikk', 'At eleven, the meat and Ikk'), p13: T('Aos treze, “Maior lutar quando?”', 'At thirteen, “Greatest fight when?”'),
      gup: T('Aos dezoito, Gup', 'At eighteen, Gup'), conselho: T('O fogo do conselho', 'The council fire'), posto: T('No posto, à noite', 'At the outpost, at night'), morte: T('“Hessa morrer?”', '“Hessa die?”'), rangido: T('O Rangido no chão', 'The Creak on the ground'),
    };
    const linhas = [];
    const val = { p7: st.escolhas.p7, partilhou: st.f.partilhou, p13: st.escolhas.p13, gup: st.escolhas.gup, conselho: st.escolhas.conselho, posto: st.escolhas.posto, morte: st.escolhas.morte, rangido: st.escolhas.rangido };
    Object.entries(val).forEach(([k, v]) => { if (v && R[k][v]) linhas.push({ id: k, opcao: v, q: t(Q[k]), a: t(R[k][v]) }); });
    return { frase, revela, notas: n, nariz, linhas };
  },
};

// {VELHO} e {DORMIR} são resolvidos na hora, já no idioma da leitura
window.LIVRO.subst = (s, st, tr) => {
  if (s.indexOf('{') < 0) return s;
  return s.replace(/\{VELHO\}/g, tukkVivo(st) ? 'Tukk' : 'Rruk').replace(/\{DORMIR\}/g, tr(DORMIR(st)));
};
