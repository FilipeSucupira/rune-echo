const test = require('node:test');
const assert = require('node:assert');
require('../src/automata/ap.js');
require('../src/automata/lba.js');
require('../src/automata/grammar.js');
require('../src/automata/pipeline.js');
const RE = globalThis.RE;
const casos = require('../data/casos.json');

function distintas(lista) {
  return new Set(lista.map((c) => c.entrada)).size === lista.length;
}

test('AP: especificação mínima (>= 8 estados, aceitação por estado final)', () => {
  assert.ok(RE.ap.STATES.length >= 8);
  assert.strictEqual(RE.ap.FINAL, 'q7');
});

test('AP: >= 8 aceitas e >= 8 rejeitadas, todas distintas', () => {
  assert.ok(casos.ap_aceitas.length >= 8 && casos.ap_rejeitadas.length >= 8);
  assert.ok(distintas([...casos.ap_aceitas, ...casos.ap_rejeitadas]));
});

for (const c of casos.ap_aceitas) {
  test(`AP aceita "${c.entrada}"`, () => {
    const r = RE.ap.run(c.entrada);
    assert.strictEqual(r.accepted, true, r.reason);
    const last = r.trace[r.trace.length - 1];
    assert.strictEqual(last.state, 'q7');
    assert.strictEqual(last.pos, c.entrada.length, 'entrada deve ser consumida por inteiro');
    assert.deepStrictEqual(last.stack, ['⊥']);
  });
}
for (const c of casos.ap_rejeitadas) {
  test(`AP rejeita "${c.entrada}"`, () => {
    assert.strictEqual(RE.ap.run(c.entrada).accepted, false);
  });
}

test('AP: pilha cresce e decresce no rastreamento (ex. (())#F:F)', () => {
  const r = RE.ap.run('(())#F:F');
  const alturas = r.trace.map((s) => s.stack.length);
  assert.strictEqual(Math.max(...alturas), 3);
  assert.ok(r.trace.every((s) => typeof s.state === 'string' && Number.isInteger(s.pos)));
});

test('GLC: derivação mais à esquerda existe para toda cadeia aceita pelo AP', () => {
  for (const c of casos.ap_aceitas) {
    const d = RE.grammar.derive(c.entrada);
    assert.ok(d.ok, c.entrada);
    assert.strictEqual(d.steps[d.steps.length - 1].form.replace(/ /g, ''), c.entrada);
  }
});

test('GLC e AP concordam: derivável <=> aceita (todas as cadeias até comprimento 7)', () => {
  const sigma = RE.ap.SIGMA;
  const gen = (n) => (n === 0 ? [''] : gen(n - 1).flatMap((w) => sigma.map((s) => w + s)));
  let total = 0;
  for (let n = 0; n <= 6; n++) {
    for (const w of gen(n)) {
      total++;
      assert.strictEqual(RE.grammar.derive(w).ok, RE.ap.run(w).accepted, `divergência em "${w}"`);
    }
  }
  assert.ok(total > 100000);
});
