# Cap. VI · Auditoria de game design dos minijogos (e o que eu mudei)

Feita pelo seu prompt de auditoria, com uma diferença: você pediu para melhorar, então as propostas de prioridade P0 e P1 já estão no código. Cada item diz o que estava, o que mudou e como testar.

**O que é fato e o que é hipótese.** "Confirmado" quer dizer que li no código e que o jogo rodou no teste automático (Chromium sem tela, o robô do livro jogando as duas rotas e a batalha inteira, sem erro de script). O que depende de gente jogando está marcado como **a testar**. Não houve teste com leitor real.

---

## 1. Inventário

| Jogo | Onde | Quantas vezes | Função principal | Função secundária |
|---|---|---|---|---|
| **Comer** (segurar) | fim de cada idade; aos 21, vazio | 7 + 2 | ritmo (o capítulo respira) | a virada aos 21, quando o gesto não dá nada |
| **Faro** (seguir o fio) | F1 a F7 | 7 | descoberta (o mundo pelo nariz) | ensinar uma mecânica que volta |
| **Quieto** (debaixo do couro) | 4 secas | 1 | tensão | caracterizar (criança escondida) |
| **Olhar a Laje** (tocar 5 pontos) | 7 secas | 1 | exploração contemplativa | elo com o Cap. V |
| **Treino** (o pau da Hessa) | 7 secas | 1 | ensinar a ler o golpe | relação Kronk e Hessa |
| **A carne** (arrastar) | 11 secas | 1 | decisão moral feita gesto | consequência (Ikk) |
| **As mãos** (puxar) | 13 secas | 1 | impotência física | memória (a mão de cinza) |
| **A tocha** (segurar e soltar) | 21, o posto | 1 | tensão | consequência na batalha |
| **Olhar até parar** | Hessa, Simon | 1 a 2 | luto, fecho | a regra do caçador aplicada |
| **A Batalha das Goelas** | 21 | 1 | habilidade (clímax) | catarse: "ninguém te segura" |

---

## 2. Diagnóstico executivo, jogo por jogo

### Comer · **funciona bem. Preservar.**
É o melhor achado do capítulo: um gesto repetido sete vezes que, aos 21, **não dá nada**. O leitor aprende o ritual e depois sente a falta dele. A repetição tem função.
- **Não fazer:** encurtar, pular ou "variar" as sete vezes. A força está em serem iguais.

### Faro · **funcionava parcialmente. Mexi pouco.**
- **Problema 1 (confirmado), gravidade média.** No F4 (as cinco crias), o fio do Gup tinha **outra cor**. O jogo pedia para achar o cheiro diferente, mas o olho já tinha achado. Não havia decisão.
  - **Mudança:** as cinco crias agora têm a mesma cor. Só cheirando cada uma se acha a que "cheira Kronk". Custa tempo, e esse custo é o jogo.
- **Problema 2 (hipótese), gravidade média.** Sete faros correm o risco de cansar.
  - **Mudança (nível A):** **o nariz lembra.** Um cheiro que já está no codex ganha força 2,2 vezes mais rápido e brilha em ouro. O jogo agora reconhece o que o jogador aprendeu: o "ferro andar" do F2, F3 e F7 vira atalho, e quem prestou atenção na infância sente o adulto farejar melhor.
- **Preservar:**
  - a isca que curva o fio para o dedo, quando a fome está alta;
  - o rastro contra o vento (F5);
  - a escolha sem aviso de certo ou errado (F6).
- **A testar:** se o F4 ficou lento demais. Se ficar, baixo o tempo por fio, que hoje é de 1,4 s.

### Quieto · **era um "segure 11 segundos". Reescrevi.**
- **Antes (confirmado):** segurar e esperar. Não havia leitura nem decisão, e soltar só fazia um som.
- **Agora:** duas regras simples que se cruzam.
  1. **Segurar é segurar o ar.** O anel mostra o ar e ele acaba em 4,8 s. Sem ar, o Kronk puxa o ar com barulho.
  2. **Respirar só é seguro quando a marcha está alta**, porque o barulho cobre. Quando a marcha **para** e uma sombra fica no couro (só o coração batendo baixo), respirar é ser ouvido.
- O jogador lê o som e a imagem e escolhe quando respirar. Cada respiro na hora errada faz a sombra demorar mais.
- **Arte nova:** nenhuma. Usa a mesma imagem e o mesmo som, mais CSS.
- **Narrativa:** é a mesma cena e o mesmo resultado (`quieto`), mas agora o corpo do leitor sente o medo da criança.
- **A testar:** se 4,0 s de silêncio no último trecho é justo. Ele cabe no ar inteiro, mas não cabe se o jogador entrar já sem ar.

### Olhar a Laje · **funciona bem como pausa. Preservar.**
Contemplativo de propósito, cinco toques e nenhum risco. Não é para ser difícil. A imagem do "debaixo da pedra" ainda é a provisória: falta você gerar.

### Treino · **boa ideia, execução rasa. Reescrevi o miolo.**
- **Antes (confirmado):** era só reflexo, tocar quando a imagem trocava.
- **Agora:**
  - **O cheiro vem antes do pau.** Um instante antes de abrir a guarda, uma fumaça quente sobe da Hessa (o "cheiro de Hessa brava", que o nariz guarda já na 2ª troca). Bater no cheiro é acertar antes do pau subir, com texto próprio.
  - **Duas fintas.** Ela ergue o pau **sem** o cheiro. Quem bate no que vê apanha, e aparece a sua imagem extra do Kronk batendo na guarda fechada. Quem espera ganha a troca seguinte.
  - O resultado tem a voz da Hessa: com 4 acertos ou mais, "— Nariz bom. Olho burro."
- **Por que importa:** o treino ensina a mecânica da batalha. Na Batalha das Goelas, o mesmo sinal aparece (o suor frio de quem vai bater). É a curva de aprendizagem que o prompt pede: aprender aos 7, usar aos 21.
- **A testar:** a janela de 0,42 s (cheiro) + 0,5 s (pau erguido). Se for curta para o celular, subo para 0,5 + 0,6.

### A carne · **funciona. Preservar.**
É uma escolha moral feita com a mão, e o arrastar dá peso ao que seria um botão. Não mexi.

### As mãos · **funciona. Preservar e corrigir a imagem.**
É impotência de propósito: não dá para vencer, e é isso que a cena é.
- Você gerou uma imagem só das mãos, então **as duas rotas usam a mesma**. O texto já diz "a mão ser uma só" quando o Tukk tem um braço. As mãos na imagem são de vários e não dá para ver de quem, então nada precisou mudar.
- **Pendente:** a `k5-maos.jpg` **não veio no pacote**. Mande que eu ponho.

### A tocha · **funcionava, mas era previsível. Ajuste mínimo.**
- **Antes (confirmado):** a luz andava num seno perfeito. Depois da 1ª passada, o jogador sabia o tempo de cor.
- **Agora:**
  - a velocidade da luz varia;
  - às vezes o sentinela **para e olha** por 0,7 a 1,3 s.
- É preciso ler a luz, não decorar o ritmo. Não precisou de arte nova.

### Olhar até parar · **forte. Preservar.**
Não mexi.

### A Batalha das Goelas · **funcionava, mas faltava identidade. Polimento grande, sem refazer.**
**O que já era bom e ficou:**
- as três telas;
- a fúria escondida;
- a vida no som e na borda vermelha;
- não haver tela de derrota;
- os aliados fora da tela.

**O que faltava:** um motivo para a luta ser do Kronk e não de qualquer bárbaro.

| Mudança | Problema que resolve | Custo |
|---|---|---|
| **O nariz na luta:** antes de cada golpe, o suor frio sobe de quem vai bater (azul-acinzentado; o do Simon é branco, o "quase Assobio"). Com fome alta fica mais nítido. A 1ª vez vem com a legenda "Suor frio subir. Ferro ir bater." | O jogador reagia ao golpe tarde demais; agora lê antes. Liga a batalha ao treino e ao faro. | código, sem arte |
| **Bater na subida do golpe** dá +10 de fúria e faíscas (antes dava +4). | Recompensa ler o cheiro e bater primeiro. | uma linha |
| **Esquiva no último instante:** o mundo fica lento meio segundo, um anel dourado aparece e a fúria sobe 12. Vale contra flecha também. | A esquiva era só defesa. Agora é a jogada de quem domina. | código |
| **O arco do golpe:** cada golpe deixa um rastro de luz em arco (quente no Kronk, frio no inimigo). | **A ponta da arma cortada nos vídeos**, que fica coberta pelo arco no instante do golpe. E dá peso ao golpe sem arte nova. | código |
| **A entrada do Simon:** a música baixa, toca o rangido da roda e a legenda "Rrrrec.", e só então ele entra. | O chefe entrava como mais um soldado. Agora o som que deu nome a ele avisa. | o som que você já gerou |
| **O golpe final no Simon:** tudo para, a tela pisca em branco e treme forte, depois vem a câmera lenta. | O clímax acabava seco. | código |
| **Cair:** "Ninguém segurar Kronk. Kronk levantar." | Liga a queda ao tema do capítulo (a vida inteira ele foi segurado). | texto |

- **Não fazer:**
  - agarrar;
  - combo de três golpes;
  - barra de vida na tela;
  - aliados na tela.

  Os quatro aumentam escopo e arte sem melhorar a experiência.
- **A testar:**
  - se o suor frio aparece cedo o bastante no celular (hoje 0,55 s antes do golpe; 0,7 s no arqueiro);
  - se a esquiva perfeita sai sem querer demais.

---

## 3. O conjunto

- **Variedade:** boa. São segurar, seguir, tocar, arrastar, puxar e lutar. O faro é o único repetido, e agora evolui (o nariz lembra).
- **Curva de aprendizagem:** era o ponto fraco, porque a batalha não usava nada do que o capítulo ensinou. Agora:
  1. o treino ensina o cheiro antes do golpe;
  2. o faro ensina a ler fios;
  3. a batalha cobra os dois.
- **Ritmo global:** sem mudança. Os jogos difíceis continuam só aos 21.
- **Manutenção:** nenhum sistema novo. O cheiro da batalha, o arco e a câmera lenta são umas cem linhas no `batalha6.js`. O quieto e o treino continuam com o mesmo tamanho.

---

## 4. Plano de validação (com gente de fora)

1. **Quieto:** a pessoa entende sem ajuda que deve respirar com a marcha? Na 2ª parada ela já espera?
2. **Treino:** depois da 1ª finta, ela passa a olhar a fumaça? Na 2ª finta ela espera?
3. **Batalha:** pergunte, sem explicar, "o que é a fumaça azul?". Se ninguém ligar ao golpe, a legenda precisa ficar mais tempo na tela.
4. **Faro F4:** quanto tempo ela leva? Mais de 25 s é demais.
5. **Celular:** tudo isso em tela de 6", com o polegar.

---

## 5. Veredito

- **Merecem ser mantidos:** todos.
- **O que mais limitava a qualidade:** a batalha não conversava com o resto do capítulo. Agora conversa pelo nariz.
- **A menor mudança com maior efeito:** o suor frio antes do golpe (na batalha e no treino).
- **Redesenho ou polimento:** redesenho só no quieto. O resto foi polimento.
- **Pronto quando:** o teste com 3 a 5 leitores de fora confirmar os quatro pontos da seção 4.
