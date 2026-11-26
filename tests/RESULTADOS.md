# Resultados dos testes

Gerado por `npm run resultados` a partir de `data/casos.json`.


## Módulo 1 - AP (aceitas)

| # | Entrada | Esperado | Obtido | Regra verificada | OK |
|---|---|---|---|---|---|
| 1 | `()#F:F` | ACEITA | ACEITA | Caso-limite: menor cadeia de L1 (escudo mínimo, x e y com 1 runa) | ✅ |
| 2 | `[]#I:T` | ACEITA | ACEITA | Escudo com colchetes; AP não compara x e y | ✅ |
| 3 | `(())#FI:TF` | ACEITA | ACEITA | Aninhamento de profundidade 2 | ✅ |
| 4 | `([])#FIT:FIT` | ACEITA | ACEITA | Parênteses e colchetes aninhados (pilha mista) | ✅ |
| 5 | `()[]#T:T` | ACEITA | ACEITA | Dois blocos de escudo em sequência (E → D E) | ✅ |
| 6 | `([()])[]#FITIF:FITIF` | ACEITA | ACEITA | Cadeia de 20 símbolos, profundidade 3 + bloco extra | ✅ |
| 7 | `[[()]]()#FFI:IFF` | ACEITA | ACEITA | Profundidade 3 com bloco final | ✅ |
| 8 | `((()))#I:I` | ACEITA | ACEITA | Profundidade 3 só com parênteses | ✅ |
| 9 | `()()()#FIT:TIF` | ACEITA | ACEITA | Três blocos; x e y diferentes (aceito pelo AP) | ✅ |
| 10 | `[([])]#TTTT:F` | ACEITA | ACEITA | x e y de tamanhos diferentes (AP só exige não vazios) | ✅ |

## Módulo 1 - AP (rejeitadas)

| # | Entrada | Esperado | Obtido | Regra verificada | OK |
|---|---|---|---|---|---|
| 1 | `ε (vazia)` | REJEITA | REJEITA | Caso-limite: entrada vazia (escudo não vazio é obrigatório) | ✅ |
| 2 | `(#F:F` | REJEITA | REJEITA | Escudo desbalanceado (falta fechar) | ✅ |
| 3 | `)(#F:F` | REJEITA | REJEITA | Fechamento sem abertura correspondente | ✅ |
| 4 | `([)]#F:F` | REJEITA | REJEITA | Fechamentos cruzados: topo da pilha incompatível | ✅ |
| 5 | `#F:F` | REJEITA | REJEITA | Escudo vazio | ✅ |
| 6 | `()#:F` | REJEITA | REJEITA | x vazio | ✅ |
| 7 | `()#F:` | REJEITA | REJEITA | y vazio (entrada consumida em estado não final) | ✅ |
| 8 | `()F:F` | REJEITA | REJEITA | Falta o separador # | ✅ |
| 9 | `()#FF` | REJEITA | REJEITA | Falta o separador : | ✅ |
| 10 | `())#F:F` | REJEITA | REJEITA | Fechamento extra | ✅ |
| 11 | `()#F:F:F` | REJEITA | REJEITA | Dois separadores : | ✅ |
| 12 | `(()#FIT:FIT` | REJEITA | REJEITA | Abertura sobrando (pilha não volta a ⊥) | ✅ |

## Módulo 2 - ALL (aceitas)

| # | Entrada | Esperado | Obtido | Regra verificada | OK |
|---|---|---|---|---|---|
| 1 | `F:F` | ACEITA | ACEITA | Caso-limite: menor cadeia de L2 (x = y, 1 runa) | ✅ |
| 2 | `I:I` | ACEITA | ACEITA | x = y = I | ✅ |
| 3 | `T:T` | ACEITA | ACEITA | x = y = T | ✅ |
| 4 | `FI:FI` | ACEITA | ACEITA | Cópia de 2 runas | ✅ |
| 5 | `FIT:FIT` | ACEITA | ACEITA | Cópia de 3 runas distintas | ✅ |
| 6 | `TTF:TTF` | ACEITA | ACEITA | Runas repetidas, ordem preservada | ✅ |
| 7 | `FITIF:FITIF` | ACEITA | ACEITA | Cópia de 5 runas | ✅ |
| 8 | `IIIIFF:IIIIFF` | ACEITA | ACEITA | Cópia longa com blocos repetidos | ✅ |
| 9 | `FTFTFT:FTFTFT` | ACEITA | ACEITA | Cópia alternada | ✅ |
| 10 | `FFFFFFFFF:FFFFFFFFF` | ACEITA | ACEITA | Cópia de 9 runas iguais | ✅ |

## Módulo 2 - ALL (rejeitadas)

| # | Entrada | Esperado | Obtido | Regra verificada | OK |
|---|---|---|---|---|---|
| 1 | `ε (vazia)` | REJEITA | REJEITA | Caso-limite: fita vazia (falta ':') | ✅ |
| 2 | `:` | REJEITA | REJEITA | x vazio | ✅ |
| 3 | `F:` | REJEITA | REJEITA | y menor que x | ✅ |
| 4 | `:F` | REJEITA | REJEITA | x vazio, y não vazio | ✅ |
| 5 | `F:I` | REJEITA | REJEITA | Runa de y diferente da de x | ✅ |
| 6 | `FI:IF` | REJEITA | REJEITA | Mesmas runas em ordem trocada (não é cópia) | ✅ |
| 7 | `FIT:FIF` | REJEITA | REJEITA | Última runa difere | ✅ |
| 8 | `FIT:FI` | REJEITA | REJEITA | y mais curto: ⊣ antes de achar T | ✅ |
| 9 | `FI:FIT` | REJEITA | REJEITA | y com sobra (verificação final) | ✅ |
| 10 | `FIT` | REJEITA | REJEITA | Sem ':' | ✅ |
| 11 | `F::F` | REJEITA | REJEITA | Dois separadores | ✅ |
| 12 | `FF:F` | REJEITA | REJEITA | x maior que y | ✅ |
| 13 | `FITIF:FITIT` | REJEITA | REJEITA | Diferença só na última posição | ✅ |

## Integração (fluxo completo AP → ALL)

| # | Entrada | Esperado | Obtido | Regra verificada | OK |
|---|---|---|---|---|---|
| 1 | `([()])[]#FITIF:FITIF` | accepted | accepted | Cenário 1 - aceita pelo AP e pelo ALL: Escudo balanceado (AP) e y = cópia de x (ALL) | ✅ |
| 2 | `(([()])[]#FITIF:FITIF` | ap_rejects | ap_rejects | Cenário 2 - rejeitada pelo AP: Escudo com '(' sobrando; ALL não executa | ✅ |
| 3 | `([()])[]#FITIF:FITIT` | all_rejects | all_rejects | Cenário 3 - aceita pelo AP, rejeitada pelo ALL: Estrutura válida, mas y não é cópia de x (última runa) | ✅ |

## Símbolo fora do alfabeto

| Entrada | Mensagem exibida |
|---|---|
| `([()])[]#FITIF:FITIX` | ERRO: símbolo 'X' na posição 20 está fora do alfabeto de entrada Σ = { ( ) [ ] # : F I T }. Nenhum autômato foi executado. |
| `([()])[]#FITIF:FITI@` | ERRO: símbolo '@' na posição 20 está fora do alfabeto de entrada Σ = { ( ) [ ] # : F I T }. Nenhum autômato foi executado. |

**Total de falhas: 0**
