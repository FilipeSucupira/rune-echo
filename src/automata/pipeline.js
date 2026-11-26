/*
 * RUNE ECHO - Fluxo completo em duas etapas.
 * 1) valida o alfabeto de entrada; 2) AP; 3) se o AP aceitar, ALL sobre o trecho apos '#'.
 * Status: 'invalid_symbol' | 'ap_rejects' | 'all_rejects' | 'accepted'
 */
(function (root) {
  'use strict';
  const RE = (root.RE = root.RE || {});

  function run(input) {
    const chars = [...input];
    const sigma = RE.ap.SIGMA;
    const bad = chars.findIndex((c) => !sigma.includes(c));
    if (bad >= 0) {
      return {
        status: 'invalid_symbol',
        decision: false,
        input,
        ap: null,
        all: null,
        message: `ERRO: símbolo '${chars[bad]}' na posição ${bad + 1} está fora do alfabeto de entrada Σ = { ${sigma.join(' ')} }. Nenhum autômato foi executado.`,
      };
    }
    const ap = RE.ap.run(input);
    if (!ap.accepted) {
      return {
        status: 'ap_rejects',
        decision: false,
        input,
        ap,
        all: null,
        message: `AP REJEITA: ${ap.reason}. O ALL não é executado.`,
      };
    }
    const tail = input.slice(input.indexOf('#') + 1);
    const all = RE.lba.run(tail);
    if (!all.accepted) {
      return {
        status: 'all_rejects',
        decision: false,
        input,
        tail,
        ap,
        all,
        message: `AP aceita, mas o ALL REJEITA: ${all.reason}.`,
      };
    }
    return { status: 'accepted', decision: true, input, tail, ap, all, message: 'AP aceita e ALL aceita: feitiço válido!' };
  }

  RE.pipeline = { run };
  if (typeof module !== 'undefined' && module.exports) module.exports = RE;
})(typeof window !== 'undefined' ? window : globalThis);
