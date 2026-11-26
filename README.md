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
npm test               # 67 testes (AP, ALL, integração, jogo)
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

## Níveis (demo)
| Nível | Monstro | Fraqueza | Missão |
|---|---|---|---|
| 1 | Slime de Gelo | F | qualquer feitiço válido |
| 2 | Morcego Flamejante | I | ao menos uma runa `I` em x |
| 3 | Golem de Musgo | F | escudo com `[ ]` e ≥ 12 símbolos |

## Originalidade e uso de IA
- **Problema, linguagens, GLC, AP, ALL e jogo** são da equipe e **não** são os exercícios de sala nem o exemplo da lauda (`(())#RRVVEE`).
- **Referências conceituais:** Sipser, *Introdução à Teoria da Computação*; Hopcroft, Motwani & Ullman, *Introdução à Teoria dos Autômatos, Linguagens e Computação*; Hierarquia de Chomsky.
- **Código/diagramas adaptados:** nenhum código de terceiros copiado. Fontes tipográficas: *Press Start 2P* e *JetBrains Mono* (Google Fonts, licença OFL).
- **Uso de IA:** *[PREENCHER pela equipe]* — ferramenta usada (ex.: Antigravity/Gemini), tarefas apoiadas (estrutura do projeto, rascunho do simulador, testes, CSS) e **o que a equipe verificou** (revisão das transições, execução dos testes, conferência manual de derivações e rastreamentos).

## Equipe
*[PREENCHER: nomes completos e contribuição de cada integrante]*
