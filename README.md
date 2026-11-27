# RUNE ECHO

Jogo de feitiços em **HTML + CSS + JS** (sem dependências) para o Trabalho Prático de **Linguagens Formais e Autômatos** (reconhecimento com pilha e fita limitada).

O jogador digita um **feitiço**. Ele só causa dano se passar por **duas etapas**:

1. **AP (autômato de pilha)** verifica o *escudo* (`( )` e `[ ]` balanceados e aninhados), o separador `#` e a estrutura `x : y` de runas.
2. **ALL (autômato linearmente limitado)** verifica o *eco*: `y` deve ser **cópia exata** de `x`.

```
 ([()])[]  #  FITIF : FITIF
 └escudo─┘  │  └─ x ─┘ └─ y ─┘
   (AP)     │     ALL recebe o trecho após '#'
```

O **Grimório** (barra fixa inferior) mostra o rastreamento passo a passo: estado, posição de leitura e pilha (AP); estado, fita e cabeçote (ALL); a derivação mais à esquerda da GLC; e as regras formais.

## Como executar

Requisitos: **Node.js ≥ 18** (apenas para os testes) e **Python 3** *ou* qualquer servidor estático (opcional, pois `index.html` também abre direto no navegador).

```bash
# 1) Instalar dependências
npm install            # não há dependências externas; o comando apenas valida o package.json

# 2) Executar o jogo
npm start              # abre servidor em http://localhost:8080 → acesse /index.html
#   (alternativa: dê duplo clique em index.html)

# 3) Repetir os testes
npm test               # testes (AP, ALL, integração, jogo)
npm run resultados     # regrava tests/RESULTADOS.md (entrada, esperado, obtido, regra)
```

## Estrutura

```
index.html  css/  src/automata/{ap,lba,grammar,pipeline}.js   ← núcleo formal
src/game/game.js (níveis/dano)   src/ui/ui.js (interface + grimório)
data/casos.json    ← dados de exemplo e casos de teste (entrada, regra)
tests/             ← testes (node:test) e RESULTADOS.md
docs/ESPECIFICACAO.md   ← GLC, AP, ALL, classificação, terminação, justificativas
imagens/           ← PNGs do jogo (opcional; há fallback em emoji)
```

O jogo (`src/game`) **apenas consome** a decisão de `pipeline.js`; quem decide aceitar/rejeitar é a execução das transições do AP e do ALL.

## Documentação formal
Veja [docs/ESPECIFICACAO.md](docs/ESPECIFICACAO.md) (linguagens, GLC, derivação, AP, ALL, classificação, terminação, não determinismo).
Testes: [tests/RESULTADOS.md](tests/RESULTADOS.md).

## Mecânicas do jogo
- **Barreira aleatória por turno:** o feitiço só fere se o escudo cumprir a exigência sorteada (ex.: 2 escudos `( )`, 1 escudo `[ ]`, profundidade ≥ 3). Os autômatos decidem se o feitiço é válido; a barreira é uma regra extra do jogo.
- **Turno do inimigo:** depois de cada feitiço o monstro ataca; defesa = ⌊pares do escudo ÷ 2⌋ (só se o AP aceitou) + Escudo Rúnico. AP rejeita = sem defesa; ALL rejeita = defende, mas não fere.
- **Dano:** |x| × poder (×2 na fraqueza). Símbolo inválido mostra erro e não gasta o turno.

## Níveis
| Nível | Monstro | Fraqueza | ATK | Barreiras sorteadas |
|---|---|---|---|---|
| 1 | Slime de Gelo | F | 2 | nenhuma (tutorial) |
| 2 | Morcego Flamejante | I | 3 | 1 ( ) · 2 escudos |
| 3 | Golem de Musgo | F | 3 | 2 ( ) · 1 [ ] |
| 4 | Espectro Gélido | T | 4 | profundidade 3 · ( )+[ ] |
| 5 | Lobo da Geada | F | 4 | 2 ( )+1 [ ] · 3 escudos e ≥14 símbolos |
| 6 | Dragão de Brasa | I | 5 | 2 [ ] · profundidade 3 + ( ) |
| 7 | Hidra do Pântano | F | 5 | 3 ( ) · 2 ( )+1 [ ] · 3 escudos e ≥18 símbolos |
| 8 | Arquimago Sombrio (chefe) | T | 6 | 2 ( )+2 [ ] · profundidade 4 · ( )+[ ] e ≥18 símbolos |

## Originalidade e uso de IA
- **Problema, linguagens, GLC, AP, ALL e jogo** são da equipe e **não** são os exercícios de sala nem o exemplo da lauda (`(())#RRVVEE`).
- **Referências conceituais:** Sipser, *Introdução à Teoria da Computação*; Hopcroft, Motwani & Ullman, *Introdução à Teoria dos Autômatos, Linguagens e Computação*; Hierarquia de Chomsky.
- **Código/diagramas adaptados:** nenhum código de terceiros copiado. Fontes tipográficas: *Press Start 2P* e *JetBrains Mono* (Google Fonts, licença OFL).
- **Uso de IA:** *[PREENCHER pela equipe]* — ferramenta usada (ex.: Antigravity/Gemini), tarefas apoiadas (estrutura do projeto, rascunho do simulador, testes, CSS) e **o que a equipe verificou** (revisão das transições, execução dos testes, conferência manual de derivações e rastreamentos).

## Equipe
Vitor BIsmarck Mello Sodré (GLC, derivação, elaboração dos slides, participação no desenvolvimento e testes)
Everton Gustavo de Oliveira da Silva (Elaboração da ideia geral da ideia)
Gabriel Cruz Filgueira (Relatório e testes)


