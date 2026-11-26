const test = require('node:test');
const assert = require('node:assert');
require('../src/automata/lba.js');
const RE = globalThis.RE;
const casos = require('../data/casos.json');

test('ALL: especificação mínima (>= 8 estados, marcadores fixos)', () => {
  assert.ok(RE.lba.STATES.length >= 8);
  assert.strictEqual(RE.lba.LM, '⊢');
  assert.strictEqual(RE.lba.RM, '⊣');
});

test('ALL: >= 8 aceitas e >= 8 rejeitadas, todas distintas', () => {
  const todas = [...casos.lba_aceitas, ...casos.lba_rejeitadas].map((c) => c.entrada);
  assert.ok(casos.lba_aceitas.length >= 8 && casos.lba_rejeitadas.length >= 8);
  assert.strictEqual(new Set(todas).size, todas.length);
});

for (const c of casos.lba_aceitas) {
  test(`ALL aceita "${c.entrada}"`, () => {
    const r = RE.lba.run(c.entrada);
    assert.strictEqual(r.accepted, true, r.reason);
    assert.strictEqual(r.trace[r.trace.length - 1].state, 'qA');
  });
}
for (const c of casos.lba_rejeitadas) {
  test(`ALL rejeita "${c.entrada}"`, () => {
    assert.strictEqual(RE.lba.run(c.entrada).accepted, false);
  });
}

test('ALL: fita tem n células + 2 marcadores e o cabeçote nunca sai deles', () => {
  for (const c of [...casos.lba_aceitas, ...casos.lba_rejeitadas]) {
    const n = c.entrada.length;
    const r = RE.lba.run(c.entrada);
    for (const s of r.trace) {
      assert.strictEqual(s.tape.length, n + 2);
      assert.strictEqual(s.tape[0], '⊢');
      assert.strictEqual(s.tape[n + 1], '⊣');
      assert.ok(s.head >= 0 && s.head <= n + 1);
    }
  }
});

test('ALL: terminação em até 4(n+2)^2 passos, inclusive para cadeias longas', () => {
  for (let k = 1; k <= 40; k++) {
    const x = 'FIT'.repeat(k);
    for (const w of [x + ':' + x, x + ':' + x + 'F', x + 'F:' + x]) {
      const r = RE.lba.run(w);
      assert.ok(r.steps <= 4 * (w.length + 2) ** 2);
    }
  }
});

test('ALL: aceita exatamente { x:x } (todas as cadeias sobre {F,I,T,:} até comprimento 7)', () => {
  const alfa = ['F', 'I', 'T', ':'];
  const gen = (n) => (n === 0 ? [''] : gen(n - 1).flatMap((w) => alfa.map((s) => w + s)));
  const esperado = (w) => {
    const p = w.split(':');
    return p.length === 2 && p[0].length > 0 && p[0] === p[1];
  };
  for (let n = 0; n <= 7; n++) {
    for (const w of gen(n)) assert.strictEqual(RE.lba.run(w).accepted, esperado(w), `divergência em "${w}"`);
  }
});
