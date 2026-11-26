# Especificação formal — RUNE ECHO

## 1. Problema
Um portão mágico só abre com um feitiço bem formado e com um "eco" correto. Validamos a entrada em **duas etapas**:
1. **AP** — estrutura livre de contexto: escudo balanceado, `#`, runas `x : y`.
2. **ALL** — dependência sensível ao contexto: `y` repete `x`.

Eventos: `(` `[` abrem camadas do escudo; `)` `]` as fecham; `F`, `I`, `T` = fogo, gelo, terra.

## 2. Módulo 1 — Linguagem livre de contexto

**Alfabeto:** Σ = { `(` , `)` , `[` , `]` , `#` , `:` , `F` , `I` , `T` }

**Regra de formação:** L₁ = { E # x : y | E ∈ Dyck⁺, x, y ∈ {F,I,T}⁺ }, em que Dyck⁺ é o conjunto não vazio de cadeias balanceadas sobre `()` e `[]` (cada fechamento corresponde à última abertura ainda aberta e do mesmo tipo).

**GLC** G = (V, T, P, S)
- V = { S, E, D, R }, T = Σ, símbolo inicial **S**.
- P:
  1. S → E # R : R
  2. E → D E | D
  3. D → ( E ) | [ E ] | ( ) | [ ]
  4. R → F R | I R | T R | F | I | T

**Por que não é regular:** para o ramo `(ⁿ)ⁿ ⊆ L₁` (intersecção com o regular `(*)*#F:F`, que dá `{(ⁿ)ⁿ#F:F}`), o lema do bombeamento para regulares falha: com |xy| ≤ p dentro do prefixo `(ᵖ`, bombear y desbalanceia aberturas e fechamentos. Logo L₁ não é regular (e regulares são fechados sob intersecção).

### Derivação mais à esquerda de `([()])[]#FITIF:FITIF` (20 símbolos)
```
S
⇒ E # R : R                     [S → E # R : R]
⇒ D E # R : R                   [E → D E]
⇒ ( E ) E # R : R               [D → ( E )]
⇒ ( D ) E # R : R               [E → D]
⇒ ( [ E ] ) E # R : R           [D → [ E ]]
⇒ ( [ D ] ) E # R : R           [E → D]
⇒ ( [ ( ) ] ) E # R : R         [D → ( )]
⇒ ( [ ( ) ] ) D # R : R         [E → D]
⇒ ( [ ( ) ] ) [ ] # R : R       [D → [ ]]
⇒ ( [ ( ) ] ) [ ] # F R : R     [R → F R]
⇒ ... # F I R : R               [R → I R]
⇒ ... # F I T R : R             [R → T R]
⇒ ... # F I T I R : R           [R → I R]
⇒ ... # F I T I F : R           [R → F]
⇒ ... : F R                     [R → F R]
⇒ ... : F I R                   [R → I R]
⇒ ... : F I T R                 [R → T R]
⇒ ... : F I T I R               [R → I R]
⇒ ( [ ( ) ] ) [ ] # F I T I F : F I T I F    [R → F]
```
(`...` apenas abrevia o prefixo já derivado; são 19 passos de derivação. A interface mostra a derivação completa, sem abreviações, na aba **Derivação**.)

## 3. Autômato de pilha

AP = (Q, Σ, Γ, δ, q₀, Z₀, F)
- Q = { q0, q1, q2, q3, q4, q5, q6, q7 } — **8 estados**
- Σ = alfabeto acima; Γ = { ⊥, `(`, `[` }; Z₀ = ⊥; q₀ = q0; **F = { q7 }**
- **Configuração inicial:** (q0, w, ⊥), com w na entrada e a cabeça de leitura no 1º símbolo.
- **Critério de aceitação: ESTADO FINAL** (q7) **com a entrada inteira consumida**. Nesse ponto a pilha só tem ⊥, porque `#` só é lido em q2, que exige topo ⊥.

| Estado | Significado |
|---|---|
| q0 | início |
| q1 | dentro do escudo (a pilha conta aberturas) |
| q2 | escudo balanceado e não vazio (topo ⊥) |
| q3 | leu `#` |
| q4 | lendo runas de x |
| q5 | leu `:` |
| q6 | lendo runas de y |
| q7 | final |

**Transições** (δ(estado, lido, topo) = (novo estado, empilha)), ε = sem leitura:
- δ(q0, `(`, ⊥) = (q1, `(`⊥) · δ(q0, `[`, ⊥) = (q1, `[`⊥)
- δ(q1, a, t) = (q1, a t) para a ∈ {`(`,`[`}, t ∈ {`(`,`[`}  (empilha)
- δ(q1, `)`, `(`) = (q1, ε) · δ(q1, `]`, `[`) = (q1, ε)  (desempilha)
- δ(q1, ε, ⊥) = (q2, ⊥)
- δ(q2, `(`, ⊥) = (q1, `(`⊥) · δ(q2, `[`, ⊥) = (q1, `[`⊥) · δ(q2, `#`, ⊥) = (q3, ⊥)
- δ(q3, r, ⊥) = (q4, ⊥) · δ(q4, r, ⊥) = (q4, ⊥) · δ(q4, `:`, ⊥) = (q5, ⊥)
- δ(q5, r, ⊥) = (q6, ⊥) · δ(q6, r, ⊥) = (q6, ⊥) · δ(q6, ε, ⊥) = (q7, ⊥)    (r ∈ {F,I,T})

(A lista completa, gerada do código, está no Grimório → **Regras**.)

### Por que o AP reconhece L(G)
- **(⊆) Toda cadeia de L(G) é aceita.** Por indução na derivação de E: D → `(`E`)` é lido empilhando `(`, executando (por hipótese) o sub-bloco E, e desempilhando com `)` quando o topo volta a ser o `(` correspondente; E → D E concatena blocos, voltando a topo ⊥ (q2). Depois `#`, runas de x (q3–q4), `:` (q5) e runas de y (q6) levam a q7 com a entrada consumida.
- **(⊇) Toda cadeia aceita está em L(G).** O topo da pilha sempre lembra a abertura mais recente ainda não fechada; um fechamento só é válido se casar com ela (o que garante a estrutura aninhada de D → `(`E`)` | `[`E`]`). Chegar a q2 exige pilha só com ⊥ e pelo menos um símbolo lido (q0→q1), isto é, E ∈ Dyck⁺. A sequência q3→q4→q5→q6→q7 impõe `# R : R` com R ≠ ε.
- **Verificação empírica:** o teste `GLC e AP concordam` compara *derivável* (parser da GLC) com *aceito* (AP) em **todas** as ≈ 590 mil cadeias de Σ* até comprimento 6; não há divergência.

### Terminação e não determinismo (AP)
Cada transição que lê avança a posição; as únicas transições ε (q1→q2 com topo ⊥ e q6→q7) nunca formam ciclo. Logo o número de configurações (estado, posição, pilha) alcançáveis é finito e o simulador, que usa busca em profundidade com conjunto de configurações visitadas, **sempre termina** para qualquer entrada sobre Σ. O único não determinismo é em q6 (ler runa *versus* ε→q7): o simulador explora as duas ramificações, **aceita se alguma consome a entrada inteira em q7**, e rejeita quando todas as ramificações esgotam sem transição aplicável. O rastreamento exibido é o da ramificação aceitante ou, na rejeição, a que foi mais longe.

## 4. Módulo 2 — Linguagem sensível ao contexto

**Alfabeto:** Σ₂ = { `F`, `I`, `T`, `:` }
**Regra de aceitação:** L₂ = { x : x | x ∈ {F,I,T}⁺ } (o ALL recebe o trecho após `#`).

**Classificação (argumento técnico):**
- L₂ **não é livre de contexto.** Intersecção com o regular `F*I*:F*I*` resulta em `{FᵃIᵇ:FᵃIᵇ}`; se L₂ fosse LLC, essa intersecção também seria. Com o lema do bombeamento para LLC: suponha L₂ livre de contexto com constante p e tome z = FᵖIᵖ:FᵖIᵖ ∈ L₂ (|z| > p). Para qualquer decomposição z = uvwxy com |vwx| ≤ p, |vx| ≥ 1, mostramos que uv²wx²y ∉ L₂. **(i)** Se v ou x contém `:`, a cadeia bombeada tem dois `:` e sai de L₂. **(ii)** Se vwx não contém `:`, ele está inteiro na metade esquerda ou inteiro na direita; bombear muda o tamanho de só uma das metades, que deixam de ser iguais. **(iii)** Se `:` está em w, como |vwx| ≤ p, v cai nos `I` finais da esquerda e x nos `F` iniciais da direita; a cadeia bombeada fica `FᵖI^(p+|v|) : F^(p+|x|)Iᵖ`, que difere (se |x| > 0, a primeira posição de divergência é a (p+1)-ésima, `I` contra `F`; se |x| = 0, os tamanhos diferem). Contradição; logo L₂ ∉ LLC. (Prova padrão de {ww}: Sipser, *Introdução à Teoria da Computação*, Cap. 2; Hopcroft–Motwani–Ullman, Cap. 7.) Trata-se da linguagem clássica {ww} (Hopcroft–Motwani–Ullman; Sipser).
- L₂ **é sensível ao contexto**: um ALL a reconhece usando apenas as n células da entrada, marcando símbolos (o espaço é linear, **LBA ⇔ LSC**).
- Hierarquia de Chomsky aplicada ao projeto: L₁ é tipo 2 (reconhecida por AP) e L₂ é tipo 1 (reconhecida por ALL). Intuição: a pilha só devolve os símbolos em ordem **inversa** (último a entrar, primeiro a sair), então um AP compara `y` com `x` espelhado, nunca na mesma ordem; por isso a cópia exige a fita do ALL.

## 5. Autômato linearmente limitado

ALL = (Q, Σ₂, Γ, δ, q₀, ⊢, ⊣, qA, qR)
- Q = { q0, q1, q2, qFx, qIx, qTx, qFy, qIy, qTy, q3, q4, qA, qR } — **13 estados**
- Γ = Σ₂ ∪ { f, i, t } ∪ { ⊢, ⊣ } (minúsculas = runa marcada)
- **Configuração inicial:** fita `⊢ c₁ … cₙ ⊣`, cabeçote em `⊢`, estado q0.
- **Fita:** n células graváveis + 2 marcadores fixos. Nenhuma transição sobrescreve ⊢/⊣ nem move o cabeçote para além deles (verificado estaticamente ao carregar o módulo e em tempo de execução). Toda a memória de trabalho (as marcas f/i/t) cabe nas n células.
- **Aceitação:** entrar em qA. **Rejeição:** entrar em qR ou não haver transição definida.

| Estado | Papel |
|---|---|
| q0 | cabeçote em ⊢, avança |
| q1 | 1ª runa de x: marca e carrega |
| q2 | procura a próxima runa livre de x |
| qFx / qIx / qTx | carrega a runa (memória de 1 símbolo no estado) até `:` |
| qFy / qIy / qTy | busca em y a 1ª runa livre e exige que seja a carregada |
| q3 | volta ao marcador ⊢ |
| q4 | x esgotado: y não pode ter runas livres |
| qA / qR | aceita / rejeita |

**Transições principais** (lê → escreve, move):
q0 `⊢`→`⊢`,R,q1 · q1/q2 `F`→`f`,R,qFx (idem I→i, T→t) · qFx runas e marcadas→mesmo,R · qFx `:`→`:`,R,qFy · qFy marcadas→R · qFy `F`→`f`,L,q3 · q3 qualquer→L · q3 `⊢`→R,q2 · q2 marcada→R · q2 `:`→R,q4 · q4 marcada→R · q4 `⊣`→qA. Runa diferente, `⊣` ou `:` onde se esperava runa → qR. (Lista completa no Grimório → **Regras**.)

**Terminação:** cada rodada marca exatamente 2 células novas (uma em x, uma em y), então as células livres diminuem estritamente; há no máximo ⌊n/2⌋ rodadas e cada rodada percorre a fita em O(n) passos. Total ≤ O(n²) < 4(n+2)² passos (o teste `terminação` verifica o limite). O ALL é **determinístico** (no máximo uma transição por par estado/símbolo), portanto não há exploração de alternativas.

## 6. Implementação (resumo)
- `src/automata/ap.js` — δ como tabela, configuração (estado, posição, pilha), busca em profundidade, rastreamento.
- `src/automata/lba.js` — δ como tabela, fita ⊢…⊣, cabeçote, rastreamento.
- `src/automata/grammar.js` — GLC e derivação mais à esquerda.
- `src/automata/pipeline.js` — alfabeto → AP → (se aceitar) ALL com o trecho após `#`. Símbolo fora de Σ: mensagem `ERRO: símbolo 'X' na posição N está fora do alfabeto…`.
- A decisão vem **exclusivamente** da execução das transições e das operações de pilha/fita.

## 7. Cadeias da integração (≥ 18 símbolos)
| Cenário | Entrada | AP | ALL |
|---|---|---|---|
| 1 | `([()])[]#FITIF:FITIF` | aceita | aceita |
| 2 | `(([()])[]#FITIF:FITIF` | rejeita | não executa |
| 3 | `([()])[]#FITIF:FITIT` | aceita | rejeita (última runa difere) |
