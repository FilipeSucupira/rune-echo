// Gera docs/TRANSICOES.md com as tabelas completas de transicoes do AP e do ALL (lidas do codigo).
const fs = require('fs');
const path = require('path');
['ap', 'lba'].forEach((m) => require(`../src/automata/${m}.js`));
const { ap, lba } = globalThis.RE;
const o = ['# Tabelas completas de transições\n', 'Geradas por `npm run transicoes` direto do código-fonte (`src/automata`).\n'];
o.push(`## AP — ${ap.STATES.length} estados, F = {${ap.FINAL}}, Γ = {${ap.GAMMA.join(', ')}}, Z₀ = ${ap.BOT}\n`);
o.push('Estados: ' + ap.STATES.map((s) => `**${s}** (${ap.STATE_INFO[s]})`).join('; ') + '\n');
o.push('| # | estado | lê | topo | novo estado | empilha (topo à esquerda) |', '|---|---|---|---|---|---|');
ap.DELTA.forEach((t, i) => o.push(`| ${i + 1} | ${t.from} | ${t.read === '' ? 'ε' : '`' + t.read + '`'} | \`${t.top}\` | ${t.to} | ${t.push.length ? '`' + t.push.slice().reverse().join('') + '`' : 'ε'} |`));
o.push(`\n## ALL — ${lba.STATES.length} estados, aceita em ${lba.ACCEPT}, rejeita em ${lba.REJECT}\n`);
o.push('Γ = {' + lba.GAMMA.join(', ') + '} · movimentos: L (esquerda), R (direita), S (parado)\n');
o.push('Estados: ' + lba.STATES.map((s) => `**${s}** (${lba.STATE_INFO[s]})`).join('; ') + '\n');
o.push('| # | estado | lê | novo estado | escreve | move |', '|---|---|---|---|---|---|');
lba.TRANSITIONS.forEach((t, i) => o.push(`| ${i + 1} | ${t.from} | \`${t.read}\` | ${t.to} | \`${t.write}\` | ${t.move} |`));
fs.writeFileSync(path.join(__dirname, '..', 'docs', 'TRANSICOES.md'), o.join('\n') + '\n', 'utf8');
console.log('docs/TRANSICOES.md gerado.');
