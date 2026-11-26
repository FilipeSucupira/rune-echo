/*
 * RUNE ECHO - Modulo 2: Automato Linearmente Limitado (ALL)
 *
 * Linguagem (sensivel ao contexto, NAO livre de contexto):
 *     L2 = { x : x  |  x em {F,I,T}+ }       ("eco": a 2a metade copia a 1a)
 *
 * ALL = (Q, Sigma, Gamma, delta, q0, ⊢, ⊣, qA, qR)
 *   Q     = {q0,q1,q2,qFx,qIx,qTx,qFy,qIy,qTy,q3,q4,qA,qR}   (13 estados)
 *   Sigma = { F, I, T, : }
 *   Gamma = Sigma U {f, i, t} U {⊢, ⊣}      (f,i,t = runas ja marcadas)
 *   Configuracao inicial: fita ⊢ c1..cn ⊣, cabecote em ⊢, estado q0.
 * Para n simbolos de entrada: n celulas graveis + 2 marcadores FIXOS.
 * O cabecote le os marcadores, nunca os sobrescreve e nunca sai deles.
 * Movimentos: L (esquerda), R (direita), S (parado).
 * Aceita ao entrar em qA; rejeita ao entrar em qR ou sem transicao definida.
 *
 * Algoritmo: a cada rodada marca a 1a runa nao marcada de x (carrega a
 * identidade F/I/T no estado), cruza ':', exige a mesma runa na 1a posicao
 * nao marcada de y, marca-a e volta ao inicio. No fim exige y sem sobras.
 * Terminacao: cada rodada marca 2 celulas; as nao marcadas diminuem
 * estritamente -> no maximo n/2 rodadas, cada uma com O(n) passos.
 * O ALL e deterministico (no maximo uma transicao por par estado/simbolo).
 */
(function (root) {
  'use strict';
  const RE = (root.RE = root.RE || {});

  const LM = '⊢';
  const RM = '⊣';
  const RUNES = ['F', 'I', 'T'];
  const MARK = { F: 'f', I: 'i', T: 't' };
  const MARKED = ['f', 'i', 't'];
  const SIGMA = ['F', 'I', 'T', ':'];
  const GAMMA = [...SIGMA, ...MARKED, LM, RM];
  const STATES = ['q0', 'q1', 'q2', 'qFx', 'qIx', 'qTx', 'qFy', 'qIy', 'qTy', 'q3', 'q4', 'qA', 'qR'];
  const START = 'q0';
  const ACCEPT = 'qA';
  const REJECT = 'qR';
  const STATE_INFO = {
    q0: 'inicio (cabeçote em ⊢)',
    q1: 'primeira runa de x',
    q2: 'procura próxima runa de x não marcada',
    qFx: 'carrega F: vai até ":"', qIx: 'carrega I: vai até ":"', qTx: 'carrega T: vai até ":"',
    qFy: 'procura F em y', qIy: 'procura I em y', qTy: 'procura T em y',
    q3: 'volta ao marcador ⊢',
    q4: 'verifica que y não tem sobras',
    qA: 'ACEITA', qR: 'REJEITA',
  };

  const TRANS = [];
  const TABLE = new Map();
  function add(from, read, to, write, move) {
    const t = { from, read, to, write, move };
    TRANS.push(t);
    TABLE.set(from + '|' + read, t);
  }

  add('q0', LM, 'q1', LM, 'R');
  for (const r of RUNES) add('q1', r, `q${r}x`, MARK[r], 'R');
  add('q1', ':', REJECT, ':', 'S');
  add('q1', RM, REJECT, RM, 'S');

  for (const r of RUNES) {
    const cx = `q${r}x`;
    const cy = `q${r}y`;
    for (const s of [...RUNES, ...MARKED]) add(cx, s, cx, s, 'R');
    add(cx, ':', cy, ':', 'R');
    add(cx, RM, REJECT, RM, 'S');
    for (const m of MARKED) add(cy, m, cy, m, 'R');
    add(cy, r, 'q3', MARK[r], 'L');
    for (const o of RUNES) if (o !== r) add(cy, o, REJECT, o, 'S');
    add(cy, ':', REJECT, ':', 'S');
    add(cy, RM, REJECT, RM, 'S');
  }

  for (const s of [...RUNES, ...MARKED, ':']) add('q3', s, 'q3', s, 'L');
  add('q3', LM, 'q2', LM, 'R');

  for (const m of MARKED) add('q2', m, 'q2', m, 'R');
  for (const r of RUNES) add('q2', r, `q${r}x`, MARK[r], 'R');
  add('q2', ':', 'q4', ':', 'R');
  add('q2', RM, REJECT, RM, 'S');

  for (const m of MARKED) add('q4', m, 'q4', m, 'R');
  for (const r of RUNES) add('q4', r, REJECT, r, 'S');
  add('q4', ':', REJECT, ':', 'S');
  add('q4', RM, ACCEPT, RM, 'S');

  // Verificacao estatica: marcadores nunca sao sobrescritos e o cabecote nunca os ultrapassa.
  for (const t of TRANS) {
    if (t.read === LM && (t.write !== LM || t.move === 'L')) throw new Error('ALL: violação do marcador ⊢');
    if (t.read === RM && (t.write !== RM || t.move === 'R')) throw new Error('ALL: violação do marcador ⊣');
    if (t.read !== LM && t.read !== RM && (t.write === LM || t.write === RM)) throw new Error('ALL: escrita de marcador');
  }

  function describe(t) {
    return `δ(${t.from}, ${t.read}) = (${t.to}, ${t.write}, ${t.move})`;
  }

  function run(input) {
    const chars = [...input];
    const bad = chars.findIndex((c) => !SIGMA.includes(c));
    if (bad >= 0) {
      return { accepted: false, trace: [], reason: `símbolo '${chars[bad]}' fora do alfabeto do ALL`, steps: 0 };
    }
    const n = chars.length;
    const tape = [LM, ...chars, RM];
    let head = 0;
    let state = START;
    const snap = (step, action) => ({ step, state, head, tape: tape.slice(), action });
    const trace = [snap(0, 'configuração inicial (q0, fita, cabeçote em ⊢)')];
    // Guarda de seguranca (a prova de terminacao garante ~ n^2/2 passos).
    const LIMIT = 4 * (n + 2) * (n + 2) + 100;
    let steps = 0;
    let reason = '';
    while (state !== ACCEPT && state !== REJECT) {
      const t = TABLE.get(state + '|' + tape[head]);
      if (!t) {
        state = REJECT;
        reason = `sem transição para (${state}, ${tape[head]})`;
        trace.push(snap(++steps, 'sem transição definida → rejeita'));
        break;
      }
      tape[head] = t.write;
      const nh = head + (t.move === 'L' ? -1 : t.move === 'R' ? 1 : 0);
      if (nh < 0 || nh > n + 1) throw new Error('ALL: cabeçote tentou sair da fita');
      head = nh;
      state = t.to;
      trace.push(snap(++steps, describe(t)));
      if (steps > LIMIT) throw new Error('ALL: limite de passos excedido');
    }
    const accepted = state === ACCEPT;
    if (!accepted && !reason) reason = 'transição levou a qR: runa diferente, sobra ou falta em y';
    return {
      accepted,
      trace,
      steps,
      reason: accepted ? 'cada runa de x tem o par idêntico em y; sem sobras' : reason,
    };
  }

  RE.lba = { LM, RM, SIGMA, GAMMA, STATES, START, ACCEPT, REJECT, STATE_INFO, TRANSITIONS: TRANS, describe, run };
  if (typeof module !== 'undefined' && module.exports) module.exports = RE;
})(typeof window !== 'undefined' ? window : globalThis);
