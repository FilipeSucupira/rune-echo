const test = require('node:test');
const assert = require('node:assert');
['ap', 'lba', 'grammar', 'pipeline'].forEach((m) => require(`../src/automata/${m}.js`));
require('../src/game/game.js');
const RE = globalThis.RE;

test('Jogo: exemplo de cada nível é aceito pelos dois autômatos e cumpre a missão', () => {
  for (const lv of RE.game.LEVELS) {
    assert.strictEqual(RE.pipeline.run(lv.exemplo).status, 'accepted', lv.nome);
    assert.ok(lv.check(lv.exemplo), lv.nome);
  }
});

test('Jogo: dano só ocorre quando os autômatos aceitam', () => {
  const g = RE.game.create();
  assert.strictEqual(g.cast('()#F:I').damage, 0);
  assert.strictEqual(g.state.monsterHp, 12);
  assert.strictEqual(g.cast('(#F:F').damage, 0);
  assert.strictEqual(g.state.mageHp, 20 - 2 - 4);
});

test('Jogo: símbolo inválido não causa penalidade', () => {
  const g = RE.game.create();
  const o = g.cast('()#F:X');
  assert.strictEqual(o.result.status, 'invalid_symbol');
  assert.strictEqual(g.state.mageHp, 20);
});

test('Jogo: vencer nível 1 e avançar', () => {
  const g = RE.game.create();
  let o;
  do { o = g.cast('()#F:F'); } while (!o.won);
  assert.strictEqual(o.unlocked, 'shield');
  g.nextLevel();
  assert.strictEqual(g.level().id, 2);
});

test('Jogo: missão não cumprida divide o dano', () => {
  const g = RE.game.create();
  g.nextLevel(); // nível 2 exige I em x
  const o = g.cast('()#FF:FF'); // x=2*2=4, sem fraqueza I, sem missão => 2
  assert.strictEqual(o.missionOk, false);
  assert.strictEqual(o.damage, 2);
});
