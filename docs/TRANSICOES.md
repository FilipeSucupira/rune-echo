# Tabelas completas de transições

Geradas por `npm run transicoes` direto do código-fonte (`src/automata`).

## AP — 8 estados, F = {q7}, Γ = {⊥, (, [}, Z₀ = ⊥

Estados: **q0** (inicio (nenhum simbolo lido)); **q1** (dentro do escudo (pilha conta aberturas)); **q2** (escudo balanceado (topo = ⊥)); **q3** (leu # (espera 1a runa de x)); **q4** (lendo runas de x); **q5** (leu : (espera 1a runa de y)); **q6** (lendo runas de y); **q7** (FINAL (entrada consumida))

| # | estado | lê | topo | novo estado | empilha (topo à esquerda) |
|---|---|---|---|---|---|
| 1 | q0 | `(` | `⊥` | q1 | `(⊥` |
| 2 | q0 | `[` | `⊥` | q1 | `[⊥` |
| 3 | q1 | `(` | `(` | q1 | `((` |
| 4 | q1 | `(` | `[` | q1 | `([` |
| 5 | q1 | `[` | `(` | q1 | `[(` |
| 6 | q1 | `[` | `[` | q1 | `[[` |
| 7 | q1 | `)` | `(` | q1 | ε |
| 8 | q1 | `]` | `[` | q1 | ε |
| 9 | q1 | ε | `⊥` | q2 | `⊥` |
| 10 | q2 | `(` | `⊥` | q1 | `(⊥` |
| 11 | q2 | `[` | `⊥` | q1 | `[⊥` |
| 12 | q2 | `#` | `⊥` | q3 | `⊥` |
| 13 | q3 | `F` | `⊥` | q4 | `⊥` |
| 14 | q4 | `F` | `⊥` | q4 | `⊥` |
| 15 | q5 | `F` | `⊥` | q6 | `⊥` |
| 16 | q6 | `F` | `⊥` | q6 | `⊥` |
| 17 | q3 | `I` | `⊥` | q4 | `⊥` |
| 18 | q4 | `I` | `⊥` | q4 | `⊥` |
| 19 | q5 | `I` | `⊥` | q6 | `⊥` |
| 20 | q6 | `I` | `⊥` | q6 | `⊥` |
| 21 | q3 | `T` | `⊥` | q4 | `⊥` |
| 22 | q4 | `T` | `⊥` | q4 | `⊥` |
| 23 | q5 | `T` | `⊥` | q6 | `⊥` |
| 24 | q6 | `T` | `⊥` | q6 | `⊥` |
| 25 | q4 | `:` | `⊥` | q5 | `⊥` |
| 26 | q6 | ε | `⊥` | q7 | `⊥` |

## ALL — 13 estados, aceita em qA, rejeita em qR

Γ = {F, I, T, :, f, i, t, ⊢, ⊣} · movimentos: L (esquerda), R (direita), S (parado)

Estados: **q0** (inicio (cabeçote em ⊢)); **q1** (primeira runa de x); **q2** (procura próxima runa de x não marcada); **qFx** (carrega F: vai até ":"); **qIx** (carrega I: vai até ":"); **qTx** (carrega T: vai até ":"); **qFy** (procura F em y); **qIy** (procura I em y); **qTy** (procura T em y); **q3** (volta ao marcador ⊢); **q4** (verifica que y não tem sobras); **qA** (ACEITA); **qR** (REJEITA)

| # | estado | lê | novo estado | escreve | move |
|---|---|---|---|---|---|
| 1 | q0 | `⊢` | q1 | `⊢` | R |
| 2 | q1 | `F` | qFx | `f` | R |
| 3 | q1 | `I` | qIx | `i` | R |
| 4 | q1 | `T` | qTx | `t` | R |
| 5 | q1 | `:` | qR | `:` | S |
| 6 | q1 | `⊣` | qR | `⊣` | S |
| 7 | qFx | `F` | qFx | `F` | R |
| 8 | qFx | `I` | qFx | `I` | R |
| 9 | qFx | `T` | qFx | `T` | R |
| 10 | qFx | `f` | qFx | `f` | R |
| 11 | qFx | `i` | qFx | `i` | R |
| 12 | qFx | `t` | qFx | `t` | R |
| 13 | qFx | `:` | qFy | `:` | R |
| 14 | qFx | `⊣` | qR | `⊣` | S |
| 15 | qFy | `f` | qFy | `f` | R |
| 16 | qFy | `i` | qFy | `i` | R |
| 17 | qFy | `t` | qFy | `t` | R |
| 18 | qFy | `F` | q3 | `f` | L |
| 19 | qFy | `I` | qR | `I` | S |
| 20 | qFy | `T` | qR | `T` | S |
| 21 | qFy | `:` | qR | `:` | S |
| 22 | qFy | `⊣` | qR | `⊣` | S |
| 23 | qIx | `F` | qIx | `F` | R |
| 24 | qIx | `I` | qIx | `I` | R |
| 25 | qIx | `T` | qIx | `T` | R |
| 26 | qIx | `f` | qIx | `f` | R |
| 27 | qIx | `i` | qIx | `i` | R |
| 28 | qIx | `t` | qIx | `t` | R |
| 29 | qIx | `:` | qIy | `:` | R |
| 30 | qIx | `⊣` | qR | `⊣` | S |
| 31 | qIy | `f` | qIy | `f` | R |
| 32 | qIy | `i` | qIy | `i` | R |
| 33 | qIy | `t` | qIy | `t` | R |
| 34 | qIy | `I` | q3 | `i` | L |
| 35 | qIy | `F` | qR | `F` | S |
| 36 | qIy | `T` | qR | `T` | S |
| 37 | qIy | `:` | qR | `:` | S |
| 38 | qIy | `⊣` | qR | `⊣` | S |
| 39 | qTx | `F` | qTx | `F` | R |
| 40 | qTx | `I` | qTx | `I` | R |
| 41 | qTx | `T` | qTx | `T` | R |
| 42 | qTx | `f` | qTx | `f` | R |
| 43 | qTx | `i` | qTx | `i` | R |
| 44 | qTx | `t` | qTx | `t` | R |
| 45 | qTx | `:` | qTy | `:` | R |
| 46 | qTx | `⊣` | qR | `⊣` | S |
| 47 | qTy | `f` | qTy | `f` | R |
| 48 | qTy | `i` | qTy | `i` | R |
| 49 | qTy | `t` | qTy | `t` | R |
| 50 | qTy | `T` | q3 | `t` | L |
| 51 | qTy | `F` | qR | `F` | S |
| 52 | qTy | `I` | qR | `I` | S |
| 53 | qTy | `:` | qR | `:` | S |
| 54 | qTy | `⊣` | qR | `⊣` | S |
| 55 | q3 | `F` | q3 | `F` | L |
| 56 | q3 | `I` | q3 | `I` | L |
| 57 | q3 | `T` | q3 | `T` | L |
| 58 | q3 | `f` | q3 | `f` | L |
| 59 | q3 | `i` | q3 | `i` | L |
| 60 | q3 | `t` | q3 | `t` | L |
| 61 | q3 | `:` | q3 | `:` | L |
| 62 | q3 | `⊢` | q2 | `⊢` | R |
| 63 | q2 | `f` | q2 | `f` | R |
| 64 | q2 | `i` | q2 | `i` | R |
| 65 | q2 | `t` | q2 | `t` | R |
| 66 | q2 | `F` | qFx | `f` | R |
| 67 | q2 | `I` | qIx | `i` | R |
| 68 | q2 | `T` | qTx | `t` | R |
| 69 | q2 | `:` | q4 | `:` | R |
| 70 | q2 | `⊣` | qR | `⊣` | S |
| 71 | q4 | `f` | q4 | `f` | R |
| 72 | q4 | `i` | q4 | `i` | R |
| 73 | q4 | `t` | q4 | `t` | R |
| 74 | q4 | `F` | qR | `F` | S |
| 75 | q4 | `I` | qR | `I` | S |
| 76 | q4 | `T` | qR | `T` | S |
| 77 | q4 | `:` | qR | `:` | S |
| 78 | q4 | `⊣` | qA | `⊣` | S |
