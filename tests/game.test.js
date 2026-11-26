const test = require('node:test');
const assert = require('node:assert');
['ap', 'lba', 'grammar', 'pipeline'].forEach((m) => require(`../src/automata/${m}.js`));
require('../src/game/game.js');
const RE = globalThis.RE;
const G = RE.game;

test('Jogo: 8 níveis definidos', () => assert.strictEqual(G.LEVELS.length, 8));

test('Jogo: toda barreira de todo nível tem solução aceita pelos dois autômatos', () => {
  for (const lv of G.LEVELS) {
    for (const req of lv.pool.length ? lv.pool : [null]) {
      const s = G.solveBarrier(req, lv.fraqueza);
      assert.strictEqual(RE.pipeline.run(s).status, 'accepted', `${lv.nome}: ${s}`);
      assert.ok(G.checkBarrier(req, s), `${lv.nome}: ${s} não cumpre ${G.describeBarrier(req)}`);
      assert.ok(s.includes(lv.fraqueza));
    }
  }
});

test('Jogo: análise do escudo conta pares e profundidade', () => {
  assert.deepStrictEqual(G.analyzeShield('([()])[]'), { round: 2, square: 2, total: 4, depth: 3 });
});

test('Jogo: nível 1 sem barreira; dano só com aceitação dos autômatos', () => {
  const g = G.create(() => 0);
  assert.strictEqual(g.state.barrier, null);
  const o = g.cast('()#F:I'); // ALL rejeita
  assert.strictEqual(o.damage, 0);
  assert.strictEqual(g.state.monsterHp, 12);
});

test('Jogo: AP rejeita => sem defesa, inimigo ataca com força total', () => {
  const g = G.create(() => 0);
  const o = g.cast('(#F:F');
  assert.strictEqual(o.defense, 0);
  assert.strictEqual(o.taken, 2);
  assert.strictEqual(g.state.mageHp, 18);
});

test('Jogo: ALL rejeita => escudo defende (floor(pares/2))', () => {
  const g = G.create(() => 0);
  g.nextLevel(); // nível 2, atk 3, barreira pool[0] = 1 escudo ( )
  const o = g.cast('(())#F:I');
  assert.strictEqual(o.result.status, 'all_rejects');
  assert.strictEqual(o.defense, 1);
  assert.strictEqual(o.taken, 2);
});

test('Jogo: barreira não cumprida bloqueia o dano (e o inimigo ataca)', () => {
  const g = G.create(() => 0);
  g.nextLevel(); // exige 1 escudo ( )
  const o = g.cast('[]#FI:FI'); // aceito pelos autômatos, mas sem escudo ( )
  assert.strictEqual(o.result.status, 'accepted');
  assert.strictEqual(o.barrierOk, false);
  assert.strictEqual(o.damage, 0);
  assert.ok(o.taken > 0);
});

test('Jogo: barreira cumprida causa dano e fraqueza dobra', () => {
  const g = G.create(() => 0);
  g.nextLevel(); // fraqueza I
  const o = g.cast('()#FI:FI'); // x=2 runas*poder 2 = 4, x2 fraqueza = 8
  assert.strictEqual(o.barrierOk, true);
  assert.strictEqual(o.damage, 8);
});

test('Jogo: símbolo inválido não gasta o turno', () => {
  const g = G.create(() => 0);
  const o = g.cast('()#F:X');
  assert.strictEqual(o.result.status, 'invalid_symbol');
  assert.strictEqual(g.state.mageHp, 20);
});

test('Jogo: vencer o nível 1, desbloquear equipamento e avançar', () => {
  const g = G.create(() => 0);
  let o;
  do { o = g.cast('()#F:F'); } while (!o.won);
  assert.strictEqual(o.unlocked, 'shield');
  g.nextLevel();
  assert.strictEqual(g.level().id, 2);
  assert.ok(g.state.barrier);
});

test('Jogo: dica entrega feitiço que cumpre a barreira atual', () => {
  const g = G.create(() => 0.99);
  g.nextLevel(); g.nextLevel(); g.nextLevel();
  const s = g.useHint();
  assert.ok(G.checkBarrier(g.state.barrier, s));
  assert.strictEqual(RE.pipeline.run(s).status, 'accepted');
});
