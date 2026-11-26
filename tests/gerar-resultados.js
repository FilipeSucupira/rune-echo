// Executa todos os casos de data/casos.json e grava tests/RESULTADOS.md
// (entrada, decisao esperada, decisao obtida, regra verificada).
const fs = require('fs');
const path = require('path');
['ap', 'lba', 'grammar', 'pipeline'].forEach((m) => require(`../src/automata/${m}.js`));
const RE = globalThis.RE;
const casos = require('../data/casos.json');

const fmt = (s) => (s === '' ? '`ε (vazia)`' : '`' + s + '`');
const dec = (b) => (b ? 'ACEITA' : 'REJEITA');
let falhas = 0;
const out = ['# Resultados dos testes\n', 'Gerado por `npm run resultados` a partir de `data/casos.json`.\n'];

function secao(titulo, lista, esperadoFn, obtidoFn) {
  out.push(`\n## ${titulo}\n`, '| # | Entrada | Esperado | Obtido | Regra verificada | OK |', '|---|---|---|---|---|---|');
  lista.forEach((c, i) => {
    const e = esperadoFn(c);
    const o = obtidoFn(c);
    const ok = e === o;
    if (!ok) falhas++;
    out.push(`| ${i + 1} | ${fmt(c.entrada)} | ${e} | ${o} | ${c.regra} | ${ok ? '✅' : '❌'} |`);
  });
}

secao('Módulo 1 - AP (aceitas)', casos.ap_aceitas, () => 'ACEITA', (c) => dec(RE.ap.run(c.entrada).accepted));
secao('Módulo 1 - AP (rejeitadas)', casos.ap_rejeitadas, () => 'REJEITA', (c) => dec(RE.ap.run(c.entrada).accepted));
secao('Módulo 2 - ALL (aceitas)', casos.lba_aceitas, () => 'ACEITA', (c) => dec(RE.lba.run(c.entrada).accepted));
secao('Módulo 2 - ALL (rejeitadas)', casos.lba_rejeitadas, () => 'REJEITA', (c) => dec(RE.lba.run(c.entrada).accepted));
secao(
  'Integração (fluxo completo AP → ALL)',
  casos.integracao.map((c) => ({ ...c, regra: `${c.nome}: ${c.regra}` })),
  (c) => c.esperado,
  (c) => RE.pipeline.run(c.entrada).status
);

out.push('\n## Símbolo fora do alfabeto\n', '| Entrada | Mensagem exibida |', '|---|---|');
casos.simbolo_invalido.forEach((c) => {
  const r = RE.pipeline.run(c.entrada);
  if (r.status !== 'invalid_symbol') falhas++;
  out.push(`| \`${c.entrada}\` | ${r.message} |`);
});
out.push(`\n**Total de falhas: ${falhas}**\n`);
fs.writeFileSync(path.join(__dirname, 'RESULTADOS.md'), out.join('\n'), 'utf8');
console.log(falhas === 0 ? 'Todos os casos passaram. tests/RESULTADOS.md atualizado.' : `${falhas} falha(s).`);
process.exit(falhas ? 1 : 0);
