const test = require('node:test');
const assert = require('node:assert');
require('../src/automata/ap.js');
require('../src/automata/lba.js');
require('../src/automata/pipeline.js');
const RE = globalThis.RE;
const casos = require('../data/casos.json');

for (const c of casos.integracao) {
  test(`Integração: ${c.nome}`, () => {
    assert.ok(c.entrada.length >= 18, 'cadeia de integração deve ter >= 18 caracteres');
    const r = RE.pipeline.run(c.entrada);
    assert.strictEqual(r.status, c.esperado);
    if (c.esperado === 'ap_rejects') assert.strictEqual(r.all, null, 'ALL não deve executar');
    if (c.esperado === 'accepted') assert.ok(r.ap.accepted && r.all.accepted);
    if (c.esperado === 'all_rejects') assert.ok(r.ap.accepted && !r.all.accepted);
  });
}

test('Integração: o ALL recebe exatamente o trecho após #', () => {
  const r = RE.pipeline.run('([()])[]#FITIF:FITIF');
  assert.strictEqual(r.tail, 'FITIF:FITIF');
  assert.strictEqual(r.all.trace[0].tape.length, r.tail.length + 2);
});

for (const c of casos.simbolo_invalido) {
  test(`Símbolo fora do alfabeto "${c.simbolo}" gera mensagem de erro`, () => {
    const r = RE.pipeline.run(c.entrada);
    assert.strictEqual(r.status, 'invalid_symbol');
    assert.strictEqual(r.ap, null);
    assert.strictEqual(r.all, null);
    assert.ok(r.message.includes(`'${c.simbolo}'`));
    assert.ok(r.message.includes(`posição ${c.posicao}`));
  });
}

test('Fluxo: aceita pelo pipeline <=> AP aceita e ALL aceita (amostra)', () => {
  for (const c of [...casos.ap_aceitas, ...casos.ap_rejeitadas]) {
    const r = RE.pipeline.run(c.entrada);
    const ap = RE.ap.run(c.entrada).accepted;
    if (!ap) assert.strictEqual(r.status, 'ap_rejects');
    else assert.strictEqual(r.status, RE.lba.run(c.entrada.slice(c.entrada.indexOf('#') + 1)).accepted ? 'accepted' : 'all_rejects');
  }
});
