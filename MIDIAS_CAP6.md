# Cap. VI · Kronk · Tudo o que você precisa criar

O capítulo já está montado e roda inteiro. Onde ainda falta a sua mídia, ele usa uma provisória: uma imagem do Cap. V que chega perto, uma tela escura com o código escrito, um som feito por código, ou silêncio.

**Para trocar uma peça:** gere a mídia, salve com o **nome exato** da tabela e ponha na pasta indicada, por cima da provisória. Não precisa mexer em código.

**As exceções, que você me manda em vez de pôr na pasta:**
- os vídeos dos sprites (§2.2), porque eu recorto o verde e monto as folhas;
- os vídeos de fundo, quando quiser que eu tire o pôster (a imagem que aparece enquanto o vídeo carrega).

**Legenda:**
- ✅ já está no pacote e pode ficar (veio do Cap. V ou do jogo antigo);
- ♻ provisório tirado do Cap. V: serve para testar, mas o certo é gerar;
- 🆕 não existe ainda: o jogo mostra uma tela com o código ou um som feito por código.

**Estilo de toda imagem:** foto cinematográfica, luz dura do deserto, paleta de ocre, cinza e sangue. Sempre 16:9 (1920×1080), menos os fundos da batalha, que são 21:9.

**O lado do texto:** o painel de texto fica de um lado da tela. Deixe o assunto principal do outro lado, como está indicado em cada linha.

**Prompt negativo (para o seu gerador local; vale para todas as imagens):**
```
text, watermark, logo, signature, cartoon, anime, painting, illustration, 3d render, plastic skin, extra fingers, deformed hands, modern objects, metal armor on grey-skinned warriors, glowing eyes, fantasy horns, elf ears, blurry face
```

---

## 1. IMAGENS

### 1.1 Fichas de referência (gere primeiro; não entram no livro, servem de base para as outras)

**Ajustes nas suas duas imagens do Kronk antes de usá-las:**
1. Recorte a marca d'água do Gemini.
2. Ponha os dois caninos de baixo grandes demais para a boca.
3. Deixe o rosto no mesmo cinza do corpo.

| Código | O que é | Prompt |
|---|---|---|
| REF-K21 | **Kronk aos 21, ficha de três vistas.** Base de todos os sprites e de todas as imagens dos 21. | `Character turnaround sheet, three views side by side on a flat chroma green background: front view, strict side profile facing right, back view. Same character in all three, same scale, same neutral lighting from above-left, full body head to feet, feet on the same baseline. The character: Kronk, a Grakh warrior, about 2.3 meters tall, massive open-class bodybuilder physique with no fat, ash-grey skin, the same grey on face and body. Long black hair with natural dreadlocks and small bone beads. Two thick lower canine teeth too big for the mouth, resting slightly over the upper lip. A diagonal scar across the left eye. Necklace of animal teeth with one big tooth in the centre and a small animal skull. Ragged leather loincloth with bone ornaments, leather wraps on wrists and ankles, barefoot. A huge stone mace with a dark rough head wrapped in hide strips, held in the right hand. Photorealistic, cinematic, sharp focus, no text, no watermark.` |
| REF-K02 | Kronk com 2 secas | `A Grakh toddler, sturdy and heavy for a child, the size of a large human five-year-old, ash-grey skin, thick black hair already starting to clump, small lower canines just showing over the lip, wide dark eyes, a leather wrap, sitting in warm sand. Same family features as the reference adult Kronk. Photorealistic, soft firelight, no text.` |
| REF-K04 | 4 secas | `A Grakh child the size of a human eight-year-old, broad-shouldered, ash-grey skin, black hair to the shoulders, lower canines visible, leather loincloth, crouched under a hide tent wall. Same face as reference Kronk, younger. Photorealistic, low warm light, no text.` |
| REF-K07 | 7 secas | `A Grakh boy the size of a tall human twelve-year-old, already muscular, ash-grey skin, long black hair with the first natural dreadlocks, lower canines over the lip, holding a wooden training stick. Same face as reference Kronk, younger. Photorealistic, harsh desert sun, no text.` |
| REF-K11 | 11 secas | `A Grakh adolescent already as tall as an adult warrior, broad and heavy, ash-grey skin, long black dreadlocked hair, lower canines over the lip, a simple tooth necklace. Same face as reference Kronk, a little younger. Photorealistic, firelight, no text.` |
| REF-K13 | 13 secas | `A young Grakh warrior, taller than most adults around him, powerful but not yet at full mass, ash-grey skin, long black dreadlocks, lower canines over the lip, white clay war paint on the shoulders. Same face as reference Kronk. Photorealistic, overcast desert light, no text.` |
| REF-K16 | 16 secas | `A Grakh warrior a head taller than any other, near full size, massive arms, ash-grey skin, long black dreadlocks, lower canines over the lip, no wounds on him at all. Same face as reference Kronk. Photorealistic, firelight, no text.` |
| REF-K18 | 18 secas | `Kronk at near peak size, open-class bodybuilder physique, ash-grey skin, long black dreadlocks with bone beads, lower canines over the lip, tooth necklace and small skull pendant. Photorealistic, warm firelight, no text.` |
| REF-HES32 | Hessa aos ~32 (7 secas do Kronk) | `A Grakh woman warrior in her prime, lean and hard-muscled, ash-grey skin, black hair in tight braids, lower canines slightly over the lip, an old burn brand on her left shoulder crossed out by three deep knife scars, a stone mace across her back, a stern still face. Photorealistic, harsh sun, no text.` · ✅ a `hessa.jpg` do Cap. V serve de base. |
| REF-HES46 | Hessa velha (21 secas do Kronk) | `The same Grakh woman, now very old for her kind: thin, skin hanging loose on the arms, grey braids gone white at the roots, the brand with three knife scars still on her left shoulder, eyes still hard. Photorealistic, low warm light, no text.` |
| REF-DOR | Dorgh (~25 a 30) | `A Grakh warrior about thirty, tall but a head shorter than Kronk, wiry and scarred, ash-grey skin, a long old scar down the left cheek, shaved sides and a black topknot, lower canines over the lip, white clay paint, a spear and a short club. A proud, hungry face. Photorealistic, no text.` |
| REF-IKK | Ikk (pequena aos 11 do Kronk; 17 aos 21) | `A young Grakh woman hunter, seventeen, lean and quick, ash-grey skin, black hair tied back, small lower canines, a bow and a quiver of reed arrows on her back, white clay stripes on the cheekbones. Photorealistic, no text.` |
| REF-VEL | O velho (Tukk ou Rruk) | `An old Grakh man, about forty which is very old for his kind, heavy frame gone gaunt, ash-grey skin, missing teeth on one side, grey-streaked dreadlocks, hands grey with ash. Photorealistic, no text.` · **Variante de um braço:** `...the left arm missing above the elbow, the stump wrapped in old leather, leaning on a walking stick.` |
| REF-GUP | Gup | `A newborn Grakh cub wrapped in hide, ash-grey skin, a tuft of black hair, tiny lower teeth already showing. Photorealistic.` |
| REF-SIM | **Simon D'Orrose, 34** | `A man of thirty-four, fair hair cut short, short fair beard, lean athletic swordsman's build, light mail shirt under a red tabard with a white sword whose crossguard is a pair of scales, no helmet, a long sword at the hip. An easy, tired smile. Photorealistic, torchlight, no text.` · Use o Simon do Cap. II como referência de rosto, envelhecido. |
| REF-RED | Soldado de Redom | `A Redom soldier, steel plates on chest and arms over mail, red tabard with a white sword whose crossguard is a pair of scales, open-faced steel helm, long sword. Photorealistic.` |

### 1.2 Imagens das páginas · pasta `assets/images/`

| Arquivo | Código | Onde aparece | Texto | Status | Prompt |
|---|---|---|---|---|---|
| `capa.jpg` | IMG-00 | a capa e o cartão de abertura | direita | ♻ | Use REF-K21. `Kronk at twenty-one standing alone in open desert at dusk, seen from below, huge against a sky going dark, stone mace hanging from one hand, the wind lifting sand and his dreadlocks, far behind him a few small Grakh fires, photorealistic, cinematic, epic and lonely.` |
| `k1-festa.jpg` | IMG-01 | k1a/k1b · a festa dos 2 anos, vista de baixo | direita | 🆕 | `Low angle from a toddler's point of view, many huge grey Grakh hands reaching up and lifting toward the sky, a great feast fire behind them, roasting meat on spits, sparks rising at night, dozens of Grakh faces lit orange and shouting in joy, shallow depth of field, everything soft and blurry like an early memory, photorealistic, warm haze.` |
| `k1-shaa-dorme.jpg` | IMG-02a | k1c · se a Shaa sobreviveu no Cap. V | esquerda | 🆕 | `A young Grakh woman with long braids and lower teeth too big for her mouth lying on her side on a hide inside a tent, eyes closed, very thin, a small grey child's hand pulling one of her braids, dim morning light through the hide, soft focus, photorealistic, quiet and heavy.` |
| `k1-ghru-dorme.jpg` | IMG-02b | k1c · se não sobreviveu | esquerda | ♻ (`ghru.jpg`) | `A very old Grakh man with teeth only on one side sitting asleep against a hide wall, a root in his lap, a small grey child's hand pulling his ear, dim light, soft focus, photorealistic.` |
| `comer-tigela.jpg` | IMG-03 | o comer do fim das idades | centro | 🆕 | `Close shot of a carved wooden bowl full of roasted meat and fat glistening, next to a fire, big grey hands reaching in, warm glow, photorealistic, appetizing and primal.` |
| `comer-tigela-noite.jpg` | IMG-03d | k4d · a tigela de noite, crianças ao longe | centro | 🆕 | `The same carved wooden bowl of roasted meat by a fire at night, and far behind it, thin Grakh children sitting in the dark, watching, photorealistic.` |
| `comer-tigela-olhos.jpg` | IMG-03b | k6e · a tigela, olhos em volta | centro | 🆕 | `The same wooden bowl with less meat, by a low fire at night, and in the darkness around it, many tired grey faces watching, only their eyes catching the light, photorealistic.` |
| `comer-gup.jpg` | IMG-03c | k7e · Gup dormindo na barriga do Kronk | centro | 🆕 | Use REF-K18 e REF-GUP. `A huge grey Grakh lying on his back by a fire, a wooden bowl of meat beside him, a newborn cub wrapped in hide asleep on his belly, warm light, photorealistic.` |
| `k2-couro.jpg` | IMG-04 | k2a/k2b · crianças debaixo do couro (e fundo do minijogo Quieto) | direita | 🆕 | `Inside a low hide shelter, Grakh children pressed together in the dark holding their breath, wide eyes, thin light coming through the seams, outside shadows of running figures, photorealistic, tense.` |
| `k3-laje.jpg` | IMG-06 | k3a · a Laje vazia, de dia | direita | ♻ (`laje.jpg`) | `A long tongue of wind-worn rock in the open desert, a shadow underneath the size of a man lying down, empty and abandoned, harsh midday sun, a big Grakh boy approaching, photorealistic.` |
| `k3-laje-debaixo.jpg` | IMG-06b | k3b · debaixo da Laje, minijogo Olhar (5 pontos) | — | ♻ (`laje.jpg`) | `Under a rock overhang: on the left wall many tally scratches cut into the rock, the first ones deeper; left of centre a clay still with a long spout; in the centre a hide scratched with rows of marks hanging on the rock; on the right a row of empty small clay pots; on the ground in front, a long empty hollow the size of a man lying down. Dust, a thin shaft of light, photorealistic, abandoned workshop.` *Os cinco pontos do jogo estão nessas posições. Se a sua imagem sair diferente, me diga e eu ajusto os pontos.* |
| `k3-hessa-guarda.jpg` | IMG-07 | k3c/k3d · Hessa em guarda fechada (e o treino) | esquerda | ♻ (`hessa.jpg`) | Use REF-HES32 e REF-K07. `The Grakh woman warrior in a closed guard stance holding a wooden stick across her body, facing a big Grakh boy who holds another stick, low sun, sand, photorealistic.` |
| `k3-hessa-ergue.jpg` | IMG-07b | k3d · Hessa erguendo o pau (a outra imagem do treino) | — | ♻ | **Mesmo enquadramento do IMG-07** (use o IMG-07 como imagem de referência). `Same scene, same framing: she raises the stick high over her head to strike, her guard open.` |
| `k3-lagarto.jpg` | IMG-08 | k3e · o lagarto | direita | 🆕 | `Close on a dead desert lizard on sand, one leg twitching, a big grey Grakh boy crouched watching it, an older Grakh woman standing behind him, photorealistic.` |
| `k3-ritual.jpg` | IMG-09 | k3f/k3g · o ritual da carne, à noite | direita | ♻ (`maos-hessa.jpg`) | `Night fire, the Grakh woman warrior sitting, tearing a piece of roasted meat in two, handing half back to the big Grakh boy beside her, her other hand raised to cuff his head, photorealistic, warm.` |
| `k4-magro.jpg` | IMG-10 | k4a · o acampamento magro | esquerda | ♻ (`acampamento.jpg`) | `A Grakh desert camp in a drought, thin Grakh, children with visible ribs sitting still, small cooking fires, cracked earth, harsh light, photorealistic, hunger.` |
| `k4-carne.jpg` | IMG-11 | k4b/k4c · o osso e a Ikk (minijogo da carne) | — | 🆕 | Use REF-K11. `A big Grakh adolescent sitting on the left with a large bone of roasted meat in his hands, and on the right, a small thin Grakh girl of about five sitting very still and staring at the meat, not asking. Empty space in the centre. Photorealistic, firelight.` |
| `k4-velho.jpg` | IMG-11b | k4c2 · o velho empurra a carne | direita | 🆕 | `An old Grakh man standing over a seated big adolescent, pushing a piece of meat toward his mouth, stern, photorealistic.` |
| `k5-morro.jpg` | IMG-12 | k5a/k5b · o morro e a batalha ao longe (e fundo do Faro e do Seguro) | direita | ♻ (`choque.jpg`) | `From a desert ridge: old and wounded Grakh and children standing with a huge young Grakh, watching a battle far below where Grakh hordes crash into a straight disciplined line of red-tabarded soldiers, dust and smoke, photorealistic, epic wide shot.` |
| `k5-maos.jpg` | IMG-13 | k5c · as mãos que seguram (minijogo) | — | 🆕 | `Close on several grey Grakh hands gripping a massive young arm from below, straining, one hand grey with ash, everything in the lower half of the frame, blurred battle dust above, photorealistic.` |
| `k5-maos-um-braco.jpg` | IMG-13b | a mesma, se o Tukk perdeu o braço | — | 🆕 | O mesmo prompt, mais: `one of the holders has only one arm.` |
| `k5-volta.jpg` | IMG-14 | k5d · a volta | direita | ♻ (`depois.jpg`) | `A line of wounded Grakh warriors walking back across sand at dusk, carrying their dead, a young warrior with a fresh cut on his face in front, photorealistic.` |
| `k6-goelas-tomadas.jpg` | IMG-15 | k6c · as Goelas tomadas | esquerda | ♻ (`goelas-escuro.jpg`) | `Three deep rock throats in the desert with a Redom garrison built over them: red tents, a wooden watchtower, stables, a wooden rope winch over the deepest well, red banners with a white sword and scales, dusk, photorealistic.` |
| `k6-dorgh.jpg` | IMG-16 | k6d · Dorgh ferido diante do Kronk intacto | esquerda | 🆕 | Use REF-DOR (mais novo) e REF-K16. `A bleeding Grakh warrior with an open arm wound standing in front of a seated, unhurt, much larger young Grakh, firelight, others watching, photorealistic, tension.` |
| `k7-roda.jpg` | IMG-17 | k7a · os velhos em roda | direita | ♻ (`roda.jpg`) | `Elder Grakh sitting in a circle around a standing giant Grakh at a night fire, serious, photorealistic.` |
| `k7-crias.jpg` | IMG-18 | k7b · as crias e os olhares | esquerda | ♻ | `Several Grakh mothers holding small newborn cubs, elders looking at the cubs with disappointment, photorealistic, restrained.` |
| `k7-gup.jpg` | IMG-19 | k7c · Gup junto do rosto (e fundo do Faro) | direita | ♻ | Use REF-K18 e REF-GUP. `Close, the giant Grakh holding a newborn cub against his face, his nose in the cub's hair, eyes closed, firelight.` |
| `k7-velho.jpg` | IMG-20 | k7d · o velho cospe | esquerda | 🆕 | Use REF-VEL. `The old Grakh standing, spitting on the sand near a giant's foot, pointing at him, hard light.` |
| `k7-velho-um-braco.jpg` | IMG-20b | a mesma, se o Tukk perdeu o braço | esquerda | 🆕 | Use a variante de um braço do REF-VEL. |
| `k8-acordar.jpg` | IMG-21 | k8a · acordar | direita | ♻ | Use REF-K21. `Dawn, the giant Grakh lying on his back in the sand outside a hide tent that is far too small for him, eyes open, cold blue light turning gold, photorealistic.` |
| `k8-fogueiras.jpg` | IMG-22 | k8b · poucas fogueiras | esquerda | 🆕 | `A Grakh desert camp at dawn, only a dozen small fires spread far apart, wide empty spaces with cold ash circles between them, photorealistic, emptiness.` |
| `k8-poco.jpg` | IMG-23 | k8c · o poço pequeno, a fila | direita | ♻ | `A shallow muddy well in a dry riverbed, a line of thin Grakh waiting, a leather bucket coming up with mud and a little water, a young woman hunter with a bow in the line, an old Grakh at the end, photorealistic.` |
| `k8-hessa-sombra.jpg` | IMG-24 | k8d · Hessa velha na sombra | esquerda | 🆕 | Use REF-HES46. `The very old Grakh woman lying in the shade of a rock, her stone mace within reach, the giant Grakh crouching to talk to her, photorealistic.` |
| `k8-caca.jpg` | IMG-25 | k8f · a caça caída | esquerda | 🆕 | `A horned desert antelope down in the sand with a spear in its side, the giant Grakh standing over it, watching it, spear-hand empty, harsh sun, photorealistic.` |
| `k8-ritual.jpg` | IMG-24b | k8g · o ritual aos 21 | direita | 🆕 | `The very old Grakh woman sitting up, tearing roasted meat in two and holding half out to the giant crouched beside her, her hand thin, photorealistic, warm.` |
| `k8-noite.jpg` | IMG-26 | k8i · deitado, olhos abertos | direita | ♻ | `Night, the giant Grakh lying on his back in sand, eyes open, one big hand open and empty on the sand beside him, stars, photorealistic.` |
| `k8-leito.jpg` | IMG-27 | k8j · o leito seco (minijogo Faro da água) | — | 🆕 | `A dry rocky riverbed under white sun, three different spots from left to right: on the left a cluster of cold dark stones, in the centre a shallow hole with flies over it, on the right hoofprints in the sand, photorealistic.` *(os três lugares precisam estar nessas posições)* |
| `k8-agua-boa.jpg` | IMG-28a | k8k · água boa | direita | 🆕 | `A giant grey arm reaching shoulder-deep into a hole between stones, clear water welling up around it, photorealistic.` |
| `k8-agua-ruim.jpg` | IMG-28b | k8k · água ruim | direita | 🆕 | `A hole of brown murky water, a dead animal half visible in it, young Grakh doubled over sick nearby, photorealistic.` |
| `k8-patrulha.jpg` | IMG-28c | k8k · a patrulha | direita | 🆕 | `Grakh running across a dry riverbed, mounted red-tabarded soldiers appearing over a rise behind them, dust, photorealistic.` |
| `k8-pao.jpg` | IMG-29 | k8n · o Simon divide o pão | esquerda | 🆕 | Use REF-SIM. `Torchlight at a desert garrison at night: the fair-haired officer sitting on a crate by a wooden rope winch, breaking a loaf of bread and handing half to a very young soldier, both smiling, seen from far off as if from hiding behind rocks, photorealistic.` |
| `k8-mao-hessa.jpg` | IMG-30 | k8q · a carne na mão da Hessa | centro | ♻ (`maos-hessa.jpg`) | `Close on an old thin grey hand lying open on sand, a piece of roasted meat untouched in it, a dead fire's embers, cold blue night, photorealistic.` |
| `k8-pintura.jpg` | IMG-31 | k8s · a pintura de guerra | direita | 🆕 | `Dawn, Grakh warriors painting white clay on their faces and arms, weapons in hand, an old Grakh painting the back of the giant, photorealistic, grim.` |
| `k8-rangido.jpg` | IMG-32 | k8u · o Rangido caído | esquerda | 🆕 | Use REF-SIM e REF-K21. `The fair-haired officer down on his back in the sand near the rope winch, sword out of reach, trying to rise, the giant Grakh standing over him with a stone mace against the sun, smoke, photorealistic.` |
| `k8-ultima-noite.jpg` | IMG-33 | k8w/k8x · a última noite | direita | ♻ | `Night in open desert, a few small fires spread far apart, the giant Grakh sitting alone at the centre fire, a small cub asleep near him, wide shot from above, photorealistic, vast and quiet.` |
| `simon.jpg` | IMG-34 | a tela final, o cartão do Simon | — | ♻ (`tinido.jpg`) | Use REF-SIM. `Portrait of the fair-haired officer of thirty-four at a desert garrison by day, light mail and red tabard with a white sword and scales, no helmet, a tired easy smile, wind and dust, photorealistic, cinematic.` |

### 1.3 Fundos da batalha · pasta `assets/images/batalha/` · 21:9 (2240×960)

**Como gerar:** faça a `tela1` primeiro e use ela como imagem de referência para a `tela2` e a `tela3`. A linha do horizonte e a cor da areia precisam bater, porque o corte entre as telas é seco; as bordas não precisam emendar. O chão de areia tem de ocupar o terço de baixo, liso, sem nada na frente: é onde os lutadores andam.

| Arquivo | Código | Onde | Status | Prompt |
|---|---|---|---|---|
| `tela1.jpg` | IMG-40a | tela 1, a cerca (os sentinelas) | 🆕 | `Wide side-on view, 21:9, of the outer edge of a desert garrison at dawn, sharpened wooden stakes in a line, a dead campfire, one dead giant grey-skinned warrior lying near the stakes, red tents far behind, smoke, flat sandy ground across the bottom third for fighters, nothing in the foreground, photorealistic, painted-plate look.` |
| `tela2.jpg` | IMG-40b | tela 2, as tendas | 🆕 | `Wide side-on view, 21:9, a lane between red military tents in a desert garrison by day, ropes, barrels, crates, a dropped shield, heavy smoke drifting, flat sandy ground across the bottom third for fighters, nothing in the foreground, photorealistic, painted-plate look. Keep the same sand colour, light direction and horizon height as the reference image.` |
| `tela3.jpg` | IMG-40c | tela 3, o poço (o Simon) | 🆕 | `Wide side-on view, 21:9, the central yard of a desert garrison, a rope winch over a round stone well in the middle distance, a wooden watchtower behind, bodies of soldiers and giant grey-skinned warriors on both sides, smoke and dust, flat sandy ground across the bottom third for fighters, nothing in the foreground, photorealistic, painted-plate look. Keep the same sand colour, light direction and horizon height as the reference image.` |

### 1.4 Feitas por mim (não precisa gerar)

- **As máscaras da fome** (`assets/images/mascaras/`): um PNG preto e branco por imagem dos 21 que tem comida ou água, para só a comida continuar colorida quando a fome sobe. Faço quando as imagens finais chegarem. Até lá, a imagem inteira perde a cor junto.
- **Os pôsteres dos vídeos** (`k6-parede.jpg`, `k8-dunas.jpg`, `k8-conselho.jpg`, `k8-posto.jpg`, `k8-hessa.jpg`, `k8-pira.jpg`, `k8-recuo.jpg`): eu tiro um quadro do seu vídeo. Três deles também são o fundo de um minijogo: `k6-parede` (o Faro aos 16), `k8-dunas` (a caçada) e `k8-posto` (a tocha e o Faro no posto).

---

## 2. VÍDEOS

### 2.1 Fundos de página · pasta `assets/video/` · loops de 6 a 8 s, sem corte, 16:9, mudos

| Arquivo | Código | Onde | Status | Prompt |
|---|---|---|---|---|
| `k2-luto.mp4` | VID-00 | k2c · fogueiras de luto | ✅ (o `fogueiras.mp4` do Cap. V) | — |
| `k6-parede.mp4` | VID-01 | i6/k6a/k6b · a parede de Redom (16 secas) | ♻ (o `coluna.mp4` do Cap. V) | `Wide shot from a desert hill, a long straight line of armored soldiers with red tabards, shields locked, advancing slowly; behind them wooden siege engines on wheels pulled by oxen; dust rising; Grakh hordes running toward them; seamless loop, photorealistic, 24fps.` |
| `k8-dunas.mp4` | VID-02 | k8e · a caçada | 🆕 | `Open desert dunes, wind lifting fine sand off the crests from right to left, harsh sun, a horned antelope far away on the right, seamless loop, photorealistic.` |
| `k8-conselho.mp4` | VID-03 | k8h · o fogo do conselho | 🆕 | `Night, a ring of thin Grakh around a small fire, one standing and speaking, flames flickering, sparks, seamless loop, photorealistic.` |
| `k8-posto.mp4` | VID-04 | k8l/k8m · o posto à noite | 🆕 | `Night, a desert garrison seen from behind rocks: red tents, a watchtower with a torch slowly sweeping, a wooden rope winch over a well creaking as it turns, horses shifting, seamless loop, photorealistic.` |
| `k8-hessa.mp4` | VID-05 | k8o/k8p · a última noite da Hessa | 🆕 | `Cold desert night, an old Grakh woman lying by a dying fire, breath faintly visible, a giant Grakh sitting close beside her on the windward side, embers fading, seamless loop, photorealistic, tender.` |
| `k8-pira.mp4` | VID-06 | k8r · a fogueira da Hessa | 🆕 | `Dawn, a tall funeral pyre burning in the desert, Grakh standing around it, a stone mace lying on the sand in front, smoke rising straight up, seamless loop, photorealistic.` |
| `k8-recuo.mp4` | VID-07 | k8v · o recuo | 🆕 | `Grakh retreating across dunes in the afternoon, carrying wounded, smoke rising from a garrison on the horizon behind them, seamless loop, photorealistic.` |

### 2.2 Sprites da batalha · **vídeos para me mandar** (eu faço as folhas)

**O jogo já roda com os sprites do jogo antigo**, convertidos e leves (79 MB viraram 5 MB). Os novos entram no lugar deles.

**As regras, que resolvem o "mudar de cara entre os golpes":**
1. **Perfil puro, virado para a direita, sempre.** Comece da ficha REF-K21 (e da REF-RED e da REF-SIM).
2. **A mesma câmera, distância, altura e luz em todos os clipes.** Fundo verde liso, corpo inteiro no quadro, com folga em cima e embaixo.
3. **Todo clipe começa e termina na pose de guarda.** Use o mesmo quadro de guarda como *start frame* e *end frame*.
4. **Curtos:** golpe até 0,6 s; pesado até 1,2 s; esquiva até 0,5 s; apanhar até 0,4 s; cair até 1,5 s; guarda e andar em loop de 1 a 2 s. Se o gerador fizer mais longo, me mande assim mesmo: eu corto.
5. **Nome do arquivo:** o código e a ação, como na tabela (ex.: `SPR-K3-golpe.mp4`). Mande todos numa pasta zipada.

| Arquivo para me mandar | Quem | Ação | Prompt (vídeo, partindo da pose de guarda) |
|---|---|---|---|
| `SPR-K1-guarda.mp4` | Kronk | guarda (loop) | `Strict side profile facing right, the Grakh warrior in a low ready stance, mace in right hand, breathing heavily, slight sway, seamless loop, flat green screen, static camera.` |
| `SPR-K2-andar.mp4` | Kronk | andar (loop) | `Strict side profile facing right, heavy forward walk cycle in place, mace held ready, seamless loop, flat green screen, static camera.` |
| `SPR-K3-golpe.mp4` | Kronk | golpe rápido | `Strict side profile facing right, fast short one-handed mace swing forward at chest height, returning to the ready stance, 0.6 seconds, flat green screen, static camera.` |
| `SPR-K4-pesado.mp4` | Kronk | golpe pesado | `Strict side profile facing right, raises the mace high overhead with both hands, holds for a beat, then smashes it down in front of him, returning to ready stance, 1.2 seconds, flat green screen, static camera.` *(eu travo o quadro do braço no alto enquanto o jogador segura)* |
| `SPR-K5-esquiva.mp4` | Kronk | esquiva | `Strict side profile facing right, quick heavy step backward, body leaning away, back to ready stance, 0.5 seconds, flat green screen, static camera.` |
| `SPR-K6-apanha.mp4` | Kronk | apanhar | `Strict side profile facing right, takes a hit to the chest, upper body jolts back and returns to the ready stance, 0.4 seconds, flat green screen, static camera.` |
| `SPR-K7-cai.mp4` | Kronk | cair | `Strict side profile facing right, drops to one knee then falls forward onto his hands, 1.5 seconds, flat green screen, static camera.` *(eu toco ao contrário para o "Kronk levantar")* |
| `SPR-S1-andar.mp4` | Soldado | andar (loop) | Use REF-RED. `Strict side profile facing right, a soldier walking forward in place with sword ready, seamless loop, flat green screen, static camera.` |
| `SPR-S2-guarda.mp4` | Soldado | guarda (loop) | `Strict side profile facing right, the soldier in a high guard, sword up, weight shifting, seamless loop, flat green screen.` |
| `SPR-S3-golpe.mp4` | Soldado | golpe | `Strict side profile facing right, the soldier raises the sword high, pauses 0.6 seconds, then slashes down hard, returning to guard, flat green screen.` |
| `SPR-S4-apanha.mp4` | Soldado | apanhar | `Strict side profile facing right, the soldier is hit, staggers back one step and recovers to guard, 0.5 seconds, flat green screen.` |
| `SPR-S5-morre.mp4` | Soldado | morrer | `Strict side profile facing right, the soldier is struck, drops the sword and falls onto his back, 1.5 seconds, flat green screen.` |
| `SPR-E1-andar.mp4` | Escudeiro | andar (loop) | Use REF-RED com um escudo grande. `Strict side profile facing right, a soldier with a large shield walking forward slowly behind the shield, seamless loop, flat green screen.` |
| `SPR-E2-guarda.mp4` | Escudeiro | guarda (loop) | `Strict side profile facing right, crouched behind a large shield, sword ready over its edge, seamless loop, flat green screen.` |
| `SPR-E3-estocada.mp4` | Escudeiro | estocada | `Strict side profile facing right, from behind the shield, pulls the sword back for a beat then thrusts forward hard past the shield edge, returns to guard, 1 second, flat green screen.` |
| `SPR-E4-quebra.mp4` | Escudeiro | escudo quebrando | `Strict side profile facing right, the large shield splits and falls away, the soldier steps back holding only the sword, ends in a high guard, 1.5 seconds, flat green screen.` |
| `SPR-E5-apanha.mp4` | Escudeiro | apanhar | `Strict side profile facing right, a heavy blow lands on the shield, he is shoved back a step and recovers behind it, 0.6 seconds, flat green screen.` |
| `SPR-A1-andar.mp4` | Arqueiro | andar (loop) | Use REF-RED sem placas, com arco. `Strict side profile facing right, a light archer walking forward in place, longbow in hand, seamless loop, flat green screen.` |
| `SPR-A2-atirar.mp4` | Arqueiro | atirar | `Strict side profile facing right, draws a longbow slowly, holds, releases, lowers the bow, 2 seconds, flat green screen.` |
| `SPR-A3-morre.mp4` | Arqueiro | morrer | `Strict side profile facing right, the archer is struck and falls back, the bow dropping, 1.5 seconds, flat green screen.` |
| `SPR-M1-guarda.mp4` | Simon | guarda (loop) | Use REF-SIM. `Strict side profile facing right, the fair-haired swordsman in a light balanced guard, sword forward, weight on the back foot, seamless loop, flat green screen.` |
| `SPR-M2-alto.mp4` | Simon | golpe alto | `Strict side profile facing right, begins by dragging the left foot back, then a high overhead cut, returns to guard, 0.7 seconds, flat green screen.` |
| `SPR-M3-estocada.mp4` | Simon | estocada | `Strict side profile facing right, begins with the shoulder dropping, then a fast straight thrust, returns to guard, 0.5 seconds, flat green screen.` |
| `SPR-M4-baixo.mp4` | Simon | corte baixo | `Strict side profile facing right, begins with the knees bending, then a low sweeping cut at the legs, returns to guard, 0.7 seconds, flat green screen.` |
| `SPR-M5-desvio.mp4` | Simon | desvio | `Strict side profile facing right, a quick light sidestep back and to the side, returns to guard, 0.4 seconds, flat green screen.` |
| `SPR-M6-cai.mp4` | Simon | cair | `Strict side profile facing right, hit hard, staggers, falls onto his back, the sword flying from his hand, 1.5 seconds, flat green screen.` |
| `SPR-M7-gesto.mp4` | Simon | o gesto | `Strict side profile facing right, steps back, lowers the sword, taps two fingers twice on his chest, raises the sword again, 2 seconds, flat green screen.` |

*Total: 7 do Kronk, 5 do soldado, 5 do escudeiro, 3 do arqueiro e 7 do Simon. São 27 clipes.*

---

## 3. SONS

Prompts para gerador de efeitos (ElevenLabs Sound Effects ou parecido). Os loops com 30 a 60 s, sem música e sem vozes que falem palavras.

### 3.1 Ambientes em loop · pasta `assets/audio/`

| Arquivo | Código | Onde | Status | Prompt |
|---|---|---|---|---|
| `festa-loop.mp3` | SOM-01 | 1ª idade · a festa | 🆕 | `Large tribal feast at night heard from inside a crowd, deep laughter, fire crackling, meat sizzling, muffled and warm like a memory, seamless loop.` |
| `tenda-loop.mp3` | SOM-03 | k1c, 2ª idade · dentro da tenda | 🆕 | `Soft low wind inside a hide tent, very quiet, leather creaking gently, seamless loop.` |
| `laje-dia-loop.mp3` | SOM-07 | 3ª idade, k8d · vento na pedra | ✅ (Cap. V) | — |
| `fogo-loop.mp3` | SOM-14 | as noites de fogo, o comer | 🆕 | `Small campfire at night, low crackle, desert wind, seamless loop.` |
| `acampamento-vazio-loop.mp3` | SOM-09 | 4ª idade, o 1º sol aos 21 | 🆕 | `Empty desert camp at dawn, dry wind, a fire's faint crackle, no voices, seamless loop.` |
| `batalha-longe-loop.mp3` | SOM-10 | 5ª idade · o morro | 🆕 | `A large battle heard from far away on a windy hill, roars, metal, horns, all thinned by distance, seamless loop.` |
| `batalha-loop.mp3` | SOM-12 | 6ª idade · a parede de Redom; a Batalha | ✅ (Cap. V) | — |
| `rangido-loop.mp3` | SOM-13 | k6c, k6e, o posto à noite · **o som do Rangido** | 🆕 | `A wooden rope winch over a deep well turning slowly at night, long creaking of wood and rope, a bucket bumping stone far below, seamless loop.` *(é a assinatura do capítulo: vale caprichar)* |
| `dunas-loop.mp3` | SOM-18 | a caçada, o leito seco | 🆕 | `Strong desert wind over dunes, sand hissing, seamless loop.` |
| `noite-fria-loop.mp3` | SOM-20 | a noite da Hessa | 🆕 | `Cold desert night wind, a dying fire popping softly, very quiet, seamless loop.` |
| `pira-funeral-loop.mp3` | SOM-21 | a fogueira da Hessa | 🆕 | `A large bonfire roaring, wood cracking, seamless loop.` |
| `deserto-noite-loop.mp3` | — | a última noite, o recuo | ✅ (Cap. V) | — |

### 3.2 Efeitos · pasta `assets/audio/sfx/`

| Arquivo | Código | Onde | Status | Prompt |
|---|---|---|---|---|
| `canto-kronk1.mp3` a `canto-kronk4.mp3` | SOM-02 | k1b · "KRONK. KRONK. KRONK." | ✅ (as quatro "roda-nome" do Cap. V) | — |
| `tambor-alerta.mp3` | SOM-04 | k2a | 🆕 | `A single deep war drum beating fast in the distance, alarm, desert wind.` |
| `marcha-abafada.mp3` | SOM-05 | minijogo Quieto | 🆕 | `Armored footsteps and horses passing outside, heard muffled through a heavy leather wall, distant shouts, metal clinking, 12 seconds.` |
| `crianca-som.mp3` | — | minijogo Quieto, quando o dedo solta | 🆕 | `A small child's involuntary whimper, muffled, very short.` |
| `choro-grakh.mp3` | SOM-06 | o luto Grakh (k2c, k5d, k6d, k8r, k8v) | 🆕 | `Several deep guttural voices roaring low and long, a mourning howl, no words.` |
| `bastao.mp3` | SOM-08 | k3c e o treino | 🆕 | `Two wooden training sticks striking, one sharp hollow knock.` |
| `seguro-forca.mp3` | SOM-11 | minijogo das mãos | 🆕 | `Heavy strained breathing, leather and skin stretching, grunts of several people holding something strong.` |
| `choro-cria.mp3` | SOM-15 | k7b | ✅ (Cap. V) | — |
| `ronco1.mp3`, `ronco2.mp3`, `ronco3.mp3` | SOM-16 | **a fome** (toca por baixo de tudo aos 21) | 🆕 | `A deep stomach growl in two tones, very low, long, almost felt more than heard, dry and hollow.` *(três variações)* |
| `balde-poco.mp3` | SOM-17 | k8c | 🆕 | `Leather bucket scraping wet stone, a little mud and water splashing, rope sliding.` |
| `cavalos-vozes.mp3` | SOM-19 | k8l · o posto | 🆕 | `Horses shifting and snorting at night, men talking low and laughing in the distance, a camp.` |
| `rangido-longe.mp3` | — | k8h · o Rangido ao longe | 🆕 | `A single long wooden creak of a rope winch, very far away across the desert at night.` |
| `rangido-roda.mp3` | — | k8n · o homem põe a mão na roda | 🆕 | `A wooden rope winch turned by hand, one long close creak.` |
| `sentinela-grito.mp3` | — | minijogo da tocha, quando vê o Kronk | 🆕 | `A sentry at night calling out sharply in alarm, one short shout, distant.` |
| `cavar.mp3` | — | Faro da água, ao escolher onde cavar | 🆕 | `Big hands digging fast into dry sand and gravel.` |
| `bicho-foge.mp3` | — | a caçada, quando o bicho sente o Kronk | 🆕 | `A desert antelope bolting, hooves on sand, a snort.` |
| `carne-rasga.mp3` | — | minijogo da carne | 🆕 | `Roasted meat torn apart by hand, a wet rip.` |
| `mastigar.mp3` | — | **comer** (toca em ciclo enquanto o dedo segura) | 🆕 | `A huge creature chewing meat and crunching a small bone, close, one bite, 0.6 seconds.` |
| `respira.mp3` | — | **olhar até parar** (Hessa, Simon) | 🆕 | `One slow faint breath out of an old dying person, close, quiet.` |
| `ultimo-ar.mp3` | — | o último ar | 🆕 | `A long thin hiss like water on a hot stone, fading out, 3 seconds.` |
| `tambores-guerra.mp3` | SOM-22 | k8s | 🆕 | `Several Grakh war drums far off, slow and heavy.` |
| `corneta-recuo.mp3` | SOM-23 | k8u | 🆕 | `A rough animal-horn call blown three times, far off, over a fading battle.` |
| `fareja.mp3` | — | o nariz (cada cheiro novo) | ✅ (o `grakh-bufa` do Cap. V) | — |
| `marreta.mp3` | — | "Acabar" | ✅ (o `golpe` do Cap. V) | — |
| `grakh-grunhe.mp3`, `passos-areia.mp3`, `pagina.mp3` | — | vários | ✅ (Cap. V) | — |

### 3.3 Batalha · pasta `assets/audio/batalha/`

| Arquivo | Código | Onde | Status | Prompt |
|---|---|---|---|---|
| `fora-da-tela-loop.mp3` | SOM-24 | a batalha Grakh, fora da tela | 🆕 | `Battle all around but unseen: roars, clashing metal, horses, shouting in two languages, seamless loop, 60 seconds.` |
| `tambores-furia-loop.mp3` | SOM-26 | entra com a fúria | 🆕 | `Pounding tribal drums in a fast rhythm, stem to layer over music, seamless loop, 30 seconds.` |
| `kronk-respira1.mp3`, `2`, `3` | SOM-25 | vida baixa | 🆕 | `Very deep heavy breathing of a huge creature, one breath.` *(três: cansado, mais rouco, quase sem ar)* |
| `soldado-grito1.mp3` a `4` | SOM-27 | o soldado anuncia o golpe | 🆕 | `Short sharp male battle shout before a strike.` *(quatro variações)* |
| `arco-corda.mp3` | SOM-28 | o arqueiro puxa a corda (o sinal para esquivar) | 🆕 | `A longbow being drawn, wood and string creaking, 1 second.` |
| `flecha-de-fora.mp3` | SOM-29 | a Ikk acerta o arqueiro | 🆕 | `An arrow whistling in and hitting a man, short groan.` |
| `simon-peito.mp3` | — | o gesto do Simon | 🆕 | `Two soft taps of fingers on a mail shirt, then two more.` |
| `musica-loop.mp3`, `kronk-golpe.mp3`, `kronk-pesado.mp3`, `kronk-apanha1/2.mp3`, `kronk-mata1/2/3.mp3`, `kronk-esquiva.mp3`, `acerta-forte.mp3`, `acerta-leve.mp3`, `soldado-golpe.mp3`, `escudo.mp3`, `escudeiro-estocada.mp3`, `arqueiro-solta.mp3` | ♻ | golpes, música | ✅ (do jogo antigo) | — |

---

## 4. DUBLAGEM · pasta `assets/audio/voz/`

Só o Kronk, e só aos 21: as sete idades antes disso ficam em silêncio, como lembrança. A voz dele chega junto com a barriga.

**Direção de voz:** grave, rouca, lenta, sem pressa e sem emoção nomeada. Fala como quem dá nome às coisas. Pausa curta entre as frases. Nunca teatral.

**Como o livro toca:** a voz fica presa ao parágrafo. O texto para antes dele, o leitor toca em Continuar, e a voz começa junto com o parágrafo.

| Arquivo | Página | Texto (EN) |
|---|---|---|
| `D01.mp3` | k8a | Kronk wake. Something wrong. Kronk smell all around before open eyes. Smoke, little. Sweat, much. Beast, none. |
| `D02.mp3` | k8a | Belly speak. Belly never speak before. All Kronk life, quiet. Now speak. |
| `D03.mp3` | k8d | Hessa old now. Hessa older than all Grakh. Hessa not fight since last dry season. Hessa still keep club near hand. |
| `D04.mp3` | k8f | Spear go in. Beast fall. Beast get up. Hurt beast get up. |
| `D05.mp3` | k8f | Kronk look until it stop. |
| `D06.mp3` | k8g | Hand weigh nothing. |
| `D07.mp3` | k8g | Hessa smell of old leather and burn on shoulder. Same as always. And under, other smell. Little. |
| `D08.mp3` | k8g | Smell of Shaa sleep. *(se a Shaa sobreviveu no Cap. V)* |
| `D08b.mp3` | k8g | Smell of Ghru sleep. *(se não)* |
| `D09.mp3` | k8h | Dorgh say this and sweat change. Cold sweat, fast. Kronk smell this before. On small ones under hide, when iron walk. |
| `D10.mp3` | k8i | Kronk hand look for food. Hand find sand. |
| `D11.mp3` | k8j | Small well dry. Mud only. Grakh dig with hands. |
| `D12.mp3` | k8j | Kronk walk with nose low. |
| `D13.mp3` | k8l | Night. Kronk go to the Creak. Alone. Belly low to sand. |
| `D14.mp3` | k8m | One smell Kronk know. Iron, horse, blade oil. And the thing that not grow in sand. |
| `D15.mp3` | k8m | Not Whistle. Almost Whistle. |
| `D16.mp3` | k8n | Man with almost-Whistle smell sit with young iron. Break bread. Give half. |
| `D17.mp3` | k8n | Like Hessa. |
| `D18.mp3` | k8n | That man be the Creak. |
| `D19.mp3` | k8o | Desert night cold. Kronk hate cold. Kronk sit near Hessa so cold hit Kronk first. |
| `D20.mp3` | k8p | Weigh nothing. |
| `D21.mp3` | k8p | Kronk look until it stop. |
| `D22.mp3` | k8p | Hessa die with sound of Hessa name. |
| `D23.mp3` | k8q | Mouth not open. |
| `D24.mp3` | k8r | Pyre burn Hessa. Fire tall. Smell of Hessa go up. |
| `D25.mp3` | k8r | Nobody hold Kronk back today. |
| `D26.mp3` | k8u | The Creak on ground. Sword far. Man try to get up. |
| `D27.mp3` | k8u | Hurt beast get up. |
| `D28.mp3` | k8u | Kronk look until it stop. |
| `D29.mp3` | k8w | Night. Pyre sit. Pyre few now. Fires far from each other. |
| `D30.mp3` | k8x | Belly speak. Kronk have nothing to give it. |
| `D31.mp3` | k8x | Sun come. Kronk still awake. |

*D05, D21 e D28 têm o mesmo texto de propósito: é a frase que liga a caçada, a Hessa e o Simon. Recomendo três leituras diferentes (a da caçada seca, a da Hessa baixa, a do Simon mais baixa ainda).*

**Opcional: as respostas do Kronk aos 21** (gritadas baixo, curtas). Tocam quando o jogador escolhe a resposta.

| Arquivo | Texto (EN) |
|---|---|
| `C-kronk.mp3` | KRONK. |
| `C-naosabe.mp3` | KRONK NOT KNOW. |
| `C-ir.mp3` | GO. |
| `C-hessa-morrer.mp3` | HESSA DIE. |
| `C-lua.mp3` | DAY EATEN BE MOON. |

---

## 5. Resumo

| Tipo | Gerar | Já no pacote |
|---|---|---|
| Fichas de referência | 16 | — |
| Imagens de página | 50 (+3 fundos da batalha) | 20 provisórias do Cap. V; o resto com o código na tela |
| Vídeos de fundo | 6 (+1 opcional, a parede de Redom) | 2 do Cap. V |
| Vídeos de sprite | 27 clipes | os sprites do jogo antigo, convertidos |
| Sons | 11 ambientes, 22 efeitos, 7 da batalha | 3 ambientes e 9 efeitos do Cap. V; 15 do jogo antigo |
| Dublagem | 32 falas (+5 opcionais) | — |

**A ordem que eu sugiro:** as fichas de referência; os fundos da batalha e os 27 clipes (é o que mais muda o jogo); as imagens dos 21; as outras idades; os sons; a dublagem por último, com o texto já revisado.
