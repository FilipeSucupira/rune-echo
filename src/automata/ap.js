/*
 * RUNE ECHO - Modulo 1: Automato de Pilha (AP)
 *
 * Linguagem reconhecida (GLC em grammar.js):
 *     L1 = { E # x : y  |  E em Dyck+ sobre {(,),[,]},  x,y em {F,I,T}+ }
 *
 * AP = (Q, Sigma, Gamma, delta, q0, Z0, F)
 *   Q     = {q0..q7}                      (8 estados)
 *   Sigma = { ( ) [ ] # : F I T }
 *   Gamma = { ⊥, (, [ }                   (⊥ = marcador de fundo Z0)
 *   q0    = estado inicial; configuracao inicial (q0, w, ⊥)
 *   F     = {q7}
 * Aceitacao: POR ESTADO FINAL (q7) com a ENTRADA TOTALMENTE CONSUMIDA.
 * (A pilha so contem ⊥ nesse ponto: '#' so e lido em q2, que exige topo ⊥.)
 *
 * Nao determinismo: apenas as transicoes epsilon de q6 (ler runa x ε para q7).
 * O simulador explora TODAS as alternativas (busca em profundidade com
 * conjunto de configuracoes visitadas) e rejeita quando nenhuma ramificacao
 * consegue consumir a entrada e chegar a q7.
 */
(function (root) {
  'use strict';
  const RE = (root.RE = root.RE || {});

  const BOT = '⊥';
  const RUNES = ['F', 'I', 'T'];
  const SIGMA = ['(', ')', '[', ']', '#', ':', 'F', 'I', 'T'];
  const GAMMA = [BOT, '(', '['];
  const STATES = ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'];
  const START = 'q0';
  const FINAL = 'q7';
  const STATE_INFO = {
    q0: 'inicio (nenhum simbolo lido)',
    q1: 'dentro do escudo (pilha conta aberturas)',
    q2: 'escudo balanceado (topo = ⊥)',
    q3: 'leu # (espera 1a runa de x)',
    q4: 'lendo runas de x',
    q5: 'leu : (espera 1a runa de y)',
    q6: 'lendo runas de y',
    q7: 'FINAL (entrada consumida)',
  };

  // delta: cada entrada = (estado, simbolo lido ou '' = epsilon, topo) -> (novo estado, empilha)
  // 'push' lista do fundo ate o topo; substitui o topo desempilhado.
  const DELTA = [];
  function add(from, read, top, to, push) {
    DELTA.push({ from, read, top, to, push });
  }
  add('q0', '(', BOT, 'q1', [BOT, '(']);
  add('q0', '[', BOT, 'q1', [BOT, '[']);
  for (const open of ['(', '[']) {
    for (const top of ['(', '[']) add('q1', open, top, 'q1', [top, open]);
  }
  add('q1', ')', '(', 'q1', []);
  add('q1', ']', '[', 'q1', []);
  add('q1', '', BOT, 'q2', [BOT]);
  add('q2', '(', BOT, 'q1', [BOT, '(']);
  add('q2', '[', BOT, 'q1', [BOT, '[']);
  add('q2', '#', BOT, 'q3', [BOT]);
  for (const r of RUNES) {
    add('q3', r, BOT, 'q4', [BOT]);
    add('q4', r, BOT, 'q4', [BOT]);
    add('q5', r, BOT, 'q6', [BOT]);
    add('q6', r, BOT, 'q6', [BOT]);
  }
  add('q4', ':', BOT, 'q5', [BOT]);
  add('q6', '', BOT, 'q7', [BOT]);

  function describe(t) {
    const read = t.read === '' ? 'ε' : t.read;
    const push = t.push.length ? t.push.slice().reverse().join('') : 'ε';
    return `δ(${t.from}, ${read}, ${t.top}) = (${t.to}, ${push})`;
  }

  function nextMoves(c, input) {
    const top = c.stack[c.stack.length - 1];
    const sym = c.pos < input.length ? input[c.pos] : null;
    const moves = [];
    for (const t of DELTA) {
      if (t.from !== c.state || t.top !== top) continue;
      if (t.read === '') {
        moves.push({ t, pos: c.pos });
      } else if (sym !== null && t.read === sym) {
        moves.push({ t, pos: c.pos + 1 });
      }
    }
    return moves.map((m) => ({
      state: m.t.to,
      pos: m.pos,
      stack: c.stack.slice(0, -1).concat(m.t.push),
      action: describe(m.t),
    }));
  }

  const snap = (c, step) => ({ step, state: c.state, pos: c.pos, stack: c.stack.slice(), action: c.action });

  function run(input) {
    const start = { state: START, pos: 0, stack: [BOT], action: 'configuração inicial (q0, w, ⊥)' };
    const work = [{ c: start, path: [snap(start, 0)] }];
    const seen = new Set();
    let best = null;
    // Cada leitura avanca pos; epsilons nao formam ciclos -> o conjunto de
    // configuracoes e finito e a busca termina. O limite abaixo e so uma guarda.
    const LIMIT = 50000 + 200 * input.length * input.length;
    let expanded = 0;
    while (work.length) {
      const { c, path } = work.pop();
      const key = c.state + '|' + c.pos + '|' + c.stack.join('');
      if (seen.has(key)) continue;
      seen.add(key);
      if (++expanded > LIMIT) throw new Error('AP: limite de configurações excedido');
      if (c.state === FINAL && c.pos === input.length) {
        return { accepted: true, trace: path, reason: 'entrada consumida e estado final q7 alcançado', explored: expanded };
      }
      const moves = nextMoves(c, input);
      if (!moves.length) {
        const top = c.stack[c.stack.length - 1];
        const reason =
          c.pos >= input.length
            ? `entrada consumida em ${c.state}, que não é estado final`
            : `sem transição para (${c.state}, '${input[c.pos]}', topo '${top}')`;
        if (!best || c.pos > best.c.pos || (c.pos === best.c.pos && path.length > best.path.length)) {
          best = { c, path, reason };
        }
        continue;
      }
      for (let i = moves.length - 1; i >= 0; i--) {
        const m = moves[i];
        work.push({ c: m, path: path.concat([snap(m, path.length)]) });
      }
    }
    return { accepted: false, trace: best.path, reason: best.reason, explored: expanded };
  }

  RE.ap = { BOT, RUNES, SIGMA, GAMMA, STATES, START, FINAL, STATE_INFO, DELTA, describe, run };
  if (typeof module !== 'undefined' && module.exports) module.exports = RE;
})(typeof window !== 'undefined' ? window : globalThis);
