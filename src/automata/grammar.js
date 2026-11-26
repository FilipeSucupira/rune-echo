/*
 * RUNE ECHO - GLC de L1 e gerador de derivacao mais a esquerda.
 *
 *   G = (V, T, P, S)
 *   V = {S, E, D, R}     T = { ( ) [ ] # : F I T }     simbolo inicial: S
 *   P:
 *     S → E # R : R
 *     E → D E | D
 *     D → ( E ) | [ E ] | ( ) | [ ]
 *     R → F R | I R | T R | F | I | T
 *
 * derive(w) monta a arvore de derivacao por descida recursiva (a gramatica
 * e LL(1) apos fatoracao simples) e a converte em derivacao mais a esquerda.
 */
(function (root) {
  'use strict';
  const RE = (root.RE = root.RE || {});

  const NONTERMINALS = ['S', 'E', 'D', 'R'];
  const TERMINALS = ['(', ')', '[', ']', '#', ':', 'F', 'I', 'T'];
  const START = 'S';
  const PRODUCTIONS = [
    { lhs: 'S', rhs: ['E', '#', 'R', ':', 'R'] },
    { lhs: 'E', rhs: ['D', 'E'] },
    { lhs: 'E', rhs: ['D'] },
    { lhs: 'D', rhs: ['(', 'E', ')'] },
    { lhs: 'D', rhs: ['[', 'E', ']'] },
    { lhs: 'D', rhs: ['(', ')'] },
    { lhs: 'D', rhs: ['[', ']'] },
    { lhs: 'R', rhs: ['F', 'R'] },
    { lhs: 'R', rhs: ['I', 'R'] },
    { lhs: 'R', rhs: ['T', 'R'] },
    { lhs: 'R', rhs: ['F'] },
    { lhs: 'R', rhs: ['I'] },
    { lhs: 'R', rhs: ['T'] },
  ];
  const label = (p) => `${p.lhs} → ${p.rhs.join(' ')}`;
  const node = (prod, kids) => ({ nt: PRODUCTIONS[prod].lhs, prod, kids });

  function parseR(s, i) {
    const k = ['F', 'I', 'T'].indexOf(s[i]);
    if (k < 0) return null;
    if (['F', 'I', 'T'].includes(s[i + 1])) {
      const rest = parseR(s, i + 1);
      return { n: node(7 + k, [s[i], rest.n]), i: rest.i };
    }
    return { n: node(10 + k, [s[i]]), i: i + 1 };
  }
  function parseD(s, i) {
    const open = s[i];
    if (open !== '(' && open !== '[') return null;
    const close = open === '(' ? ')' : ']';
    if (s[i + 1] === close) return { n: node(open === '(' ? 5 : 6, [open, close]), i: i + 2 };
    const e = parseE(s, i + 1);
    if (!e || s[e.i] !== close) return null;
    return { n: node(open === '(' ? 3 : 4, [open, e.n, close]), i: e.i + 1 };
  }
  function parseE(s, i) {
    const d = parseD(s, i);
    if (!d) return null;
    if (s[d.i] === '(' || s[d.i] === '[') {
      const e = parseE(s, d.i);
      if (!e) return null;
      return { n: node(1, [d.n, e.n]), i: e.i };
    }
    return { n: node(2, [d.n]), i: d.i };
  }

  /** Retorna { ok, steps:[{form, rule}] } com a derivacao mais a esquerda. */
  function derive(w) {
    const e = parseE(w, 0);
    if (!e || w[e.i] !== '#') return { ok: false, steps: [] };
    const r1 = parseR(w, e.i + 1);
    if (!r1 || w[r1.i] !== ':') return { ok: false, steps: [] };
    const r2 = parseR(w, r1.i + 1);
    if (!r2 || r2.i !== w.length) return { ok: false, steps: [] };
    const tree = node(0, [e.n, '#', r1.n, ':', r2.n]);

    let form = [tree];
    const show = () => form.map((x) => (typeof x === 'string' ? x : x.nt)).join(' ');
    const steps = [{ form: 'S', rule: null }];
    for (;;) {
      const idx = form.findIndex((x) => typeof x !== 'string');
      if (idx < 0) break;
      const nd = form[idx];
      form = [...form.slice(0, idx), ...nd.kids, ...form.slice(idx + 1)];
      steps.push({ form: show(), rule: label(PRODUCTIONS[nd.prod]) });
    }
    return { ok: true, steps };
  }

  RE.grammar = { NONTERMINALS, TERMINALS, START, PRODUCTIONS, label, derive };
  if (typeof module !== 'undefined' && module.exports) module.exports = RE;
})(typeof window !== 'undefined' ? window : globalThis);
