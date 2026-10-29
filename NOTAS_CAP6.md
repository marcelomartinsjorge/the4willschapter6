# Capítulo 6 (Kronk, o Maior) · Notas

## Versão 1 (29/10/2026)

O capítulo inteiro, montado a partir do `CAP6_ROTEIRO_v1.md` aprovado, com a batalha em três telas. Roda do começo ao fim. Onde falta mídia, entra uma provisória (ver `MIDIAS_CAP6.md`).

### Arquivos
- `index.html` · o livro
- `capitulo6.js` · o roteiro: páginas, escolhas, o nariz, os jogos, a tela final. Textos em par `T('português', 'english')`; o inglês é o original.
- `motor6.js` · o motor (o do Cap. V, sem a Luz e o odre; com a névoa, o comer, o olhar, a fome e o nariz).
- `jogos6.js` · os minijogos sem sprite (faro, quieto, tocha, debaixo da pedra, treino, carne, as mãos).
- `batalha6.js` · a Batalha das Goelas (canvas, beat 'em up em três telas).
- `livro.css` + `content/cap06/tema.css` · o visual; `content/cap06/chapter-config.js` · o codex impessoal.
- `MIDIAS_CAP6.md` · tudo o que falta gerar, com nome de arquivo, pasta e prompt.
- `fontes/manifesto.py` · a lista das imagens (eu uso para refazer as provisórias).

### Os sistemas do Kronk
- **A névoa (Cap. III)** cobre as sete primeiras idades e abre onde o dedo passa. Ela afina a cada idade (de 0,85 aos 2 secas a 0,12 aos 18); aos 21 não há névoa.
- **Comer:** toda idade termina com o gesto de segurar. Enquanto o dedo segura, ouve-se o mastigar, o calor sobe da borda de baixo e o texto aparece. Depois a névoa fecha (o sono) e a próxima idade começa sozinha.
  - **Aos 21,** o mesmo gesto aparece duas vezes, na noite do 1º sol e na da Hessa. O dedo segura e não há mastigar nem calor; a página escurece de uma vez e o próximo sol começa.
- **O nariz, "O que o nariz guardar":** é o codex do Kronk, num botão no topo (o nariz, com a contagem de cheiros) ou na tecla N.
  - Cheiro novo: um cartão com o nome e a linha do Kronk.
  - Cheiro antigo que volta: o nome acende em ouro no meio da tela.
  - O "Shaa dormir" da Hessa fica aceso no canto até o fim da página. O "Assobio" no posto treme e apaga.
- **A fome (só aos 21), sem barra:**
  - **Ouvido:** o ronco, que fica constante com fome alta; no celular, também uma vibração.
  - **Olho:** a imagem perde a cor; com as máscaras, só a comida fica colorida.
  - **Texto:** a barriga em CAPS âmbar entra tremendo, e cinco frases têm uma versão curta para a fome alta.
  - **Mão:** a opção da barriga nasce embaixo do dedo, flutuando. Ela só arma depois de 0,38 s, para o toque que abriu a escolha não escolher.
- **Olhar até parar:** segurar enquanto a respiração espaça (cinco respiros, cada vez mais longe um do outro). Soltar só pausa. No fim, o "Sss".
  - Aparece na morte da Hessa (k8p) e, se o jogador escolher, no Simon (k8u). "Acabar" é um toque, com o golpe da maça e a tela tremendo.
- **Os afetos** (Hessa, o velho, Dorgh, Ikk, Gup) e a crença (`acredita`) ficam escondidos. Os avisos são no estilo Telltale.

### Os minijogos
- **Faro** (sete vezes: F1 a F7). Os fios de cheiro entram pela borda e ondulam; o dedo em cima de um fio o fortalece até virar palavra.
  - A isca puxa: o fio se curva para o dedo.
  - **F5 (a caçada):** é preciso seguir o rastro do começo ao fim. Tocar o bicho antes da hora, ou demorar mais de 42 s, faz o bicho fugir, e vem um mais magro.
  - **F6 (a água):** depois do primeiro fio aparecem os três "Cavar aqui".
  - **Com fome alta:** os fios ficam mais nítidos e entra um fio a mais (carne de três sol).
- **Quieto** (2 secas): segurar até a marcha passar; cada vez que o dedo solta, o Kronk faz um som.
- **A tocha** (o posto): segurar quando a luz vem, soltar para andar. Ser visto faz o Kronk voltar um passo (`visto`, de 0 a 3).
- **Debaixo da pedra** (7 secas): os cinco pontos, como a Laje do Cap. V.
- **O treino** (7 secas): duas imagens da Hessa (guarda e pau erguido); tocar quando ela abre. Cinco trocas.
- **A carne** (11 secas): arrastar para a boca, para a mão da Ikk ou para o lado de rasgar.
- **As mãos** (13 secas): arrastar para cima; a tela resiste, treme e volta. Três vezes.

### A Batalha das Goelas
- **Três telas.** Cada uma trava até o último inimigo cair; aí aparece o →, o Kronk anda até a borda e a imagem desliza para a próxima.
- **Controles:**
  - computador: A/D ou as setas para andar; J (ou clique) para o golpe; segurar J (ou o clique) e soltar para o pesado; espaço (ou o clique direito) para esquivar;
  - celular: quatro botões na tela.
- **Tempos:** o golpe acerta em 0,23 s; o pesado fica erguido enquanto o dedo segura e acerta 0,2 s depois de soltar; a esquiva tem 0,38 s de invulnerabilidade; levar um golpe trava 0,3 s.
- **Vida e fúria escondidas:**
  - **Vida:** 12, ou 9 com fome alta. Aparece na borda vermelha e no som, que fica abafado. Volta 1 ponto a cada 5 s longe da luta.
  - **Fúria:** começa em 15, ou 40 com fome alta. A partir de 50, o Kronk fica 20% mais rápido, a imagem esquenta e entram os tambores. A partir de 80, a visão fecha em túnel e o pesado acerta todos no alcance.
- **Os inimigos:**
  - **soldado:** o golpe rápido bate na guarda; o pesado quebra; atacar na subida do braço interrompe o golpe dele.
  - **escudeiro:** só o pesado conta; dois pesados quebram o escudo e ele vira soldado.
  - **arqueiro:** a corda estica com som, e dá para esquivar.
  - **Simon:** três golpes com começos diferentes; desvia de metade; o gesto dos dois dedos na troca da 2ª para a 3ª fase.
- **Os aliados, fora da tela:** a flecha da Ikk derruba o arqueiro da tela 2; o golpe do Dorgh quebra um escudo da tela 3.
- **Sem derrota:** "Kronk levantar.", e a onda recomeça. Com duas quedas na mesma onda, os inimigos passam a dar 20% menos dano.
- **Os sprites de hoje** são os do jogo antigo, convertidos para WebP pela metade do tamanho (79 MB viraram 5 MB). O Simon, até os clipes dele chegarem, é o soldado mais claro.

### O que o capítulo lê do Cap. V
`aqv_estado.cap5`, com os padrões do roteiro: `shaaViva` (Shaa ou Ghru), `tukk` (Tukk ou Rruk; um braço), `despedida` (lua, nome), `estalou`, `hessaFaixa`, `escolhas.dente`.

### O que grava (`aqv_estado.cap6`)
Os campos da §10.2 do roteiro (velho, afetos, acredita, respostas, laje, partilhou, treino, quieto, forca13, as escolhas dos 21, visto, caminho, rangido, lua21, dorghVivo, aoLado, nariz, fomeFinal, batalha), mais a pontuação.

### Pontuação escondida (`cap06`)
- **Faro:** a soma dos sete; mais rápido e com menos iscas, mais pontos.
- **Treino:** 600 por acerto.
- **Quieto:** o couro mais a tocha.
- **As Goelas:** mortos × 300, mais a fúria máxima × 10, menos os golpes recebidos × 120, mais o bônus de tempo.
- Tudo é somado à jornada pela mesma função do Supabase.

### Diferenças em relação ao roteiro (para você conferir)
1. **Cinco frases curtas para a fome alta** (§1.3 pede as duas versões, e o roteiro não as escreveu). Ficam em k8b, k8c, k8h e k8w, e nenhuma é dublada. Exemplo: "Kronk contar fogueira. Pouca."
2. **Linhas curtas dentro dos minijogos**, todas na voz do Kronk:
   - os fios do faro: "Sangue. Muito." · "Leite. Mãe." · "Esse, não.";
   - o bicho que foge: "Bicho cheirar Kronk. Bicho correr.";
   - a tocha: "Ferro olhar. Ferro gritar. Kronk voltar um passo.";
   - o quieto: "Kronk fazer som. Tambor parar.";
   - o fim da caçada e do posto.
3. **Um cheiro novo no nariz:** "cheiro de poço" (aprendido no poço pequeno, em k8c), porque o F6 acende esse nome. Também "cheiro de carne de três sol", que vem da isca da caçada.
4. **Uma linha de abertura** nas páginas de minijogo que não tinham texto (ex.: "Debaixo da pedra, sombra e cheiro." · "Cheiro subir do lá embaixo.").
5. **O odre da Hessa** (`escolhas.odre = entregar`, no Cap. V) ainda não aparece, porque o roteiro não escreveu a linha. Se quiser, proponho uma.

### Um defeito do Cap. V, corrigido aqui
No motor do Cap. V, quem fecha o intertítulo com um clique fica com a tecla presa: dali em diante, →, espaço e Enter são engolidos e não fazem nada. No Cap. VI isso travava o andar da batalha. A correção são duas linhas no `livro.js` do Cap. V; posso aplicar lá também.

## O que falta
- As mídias (`MIDIAS_CAP6.md`).
- Os sprites novos: eu faço as folhas e ajusto os números do manifesto em `batalha6.js`.
- As máscaras da fome, que eu faço quando as imagens dos 21 chegarem.
- A revisão do texto pelo Prompt Mestre, antes da dublagem.
- O link para o Capítulo VII no fim.
