/* RUNE ECHO - interface (arena, runas, grimorio com rastreamento animado). */
(function () {
  'use strict';
  const RE = window.RE;
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let game = RE.game.create();
  const players = {};

  /* ---------- sprites: usa imagens/<arquivo> e cai para emoji se nao existir ---------- */
  function sprite(box, file, emoji) {
    box.textContent = '';
    const img = new Image();
    img.alt = emoji;
    img.onload = () => { box.textContent = ''; box.appendChild(img); };
    img.onerror = () => { box.textContent = emoji; };
    img.src = 'imagens/' + file;
    box.textContent = emoji;
  }

  /* ---------- HUD ---------- */
  function renderHud() {
    const lv = game.level();
    const s = game.state;
    $('#lvl').textContent = 'LEVEL ' + lv.id;
    $('#tipo').textContent = lv.tipo.toUpperCase();
    $('#mission').innerHTML = '🎯 ' + esc(lv.missao);
    $('#monster-name').textContent = lv.nome;
    sprite($('#monster'), `monstro${lv.id}.png`, lv.emoji);
    const arena = $('#arena');
    arena.className = lv.tipo;
    const bg = new Image();
    bg.onload = () => { arena.classList.add('has-bg'); arena.style.backgroundImage = `url(imagens/arena_${lv.tipo}.png)`; };
    bg.onerror = () => { arena.style.backgroundImage = ''; };
    bg.src = `imagens/arena_${lv.tipo}.png`;
    $('#monster-hp').style.width = (100 * s.monsterHp / lv.hp) + '%';
    $('#monster-hp-txt').textContent = `${s.monsterHp} / ${lv.hp}`;
    $('#mage-level').textContent = 'LEVEL ' + lv.id;
    $('#mage-power').textContent = 'PODER ' + game.power();
    $('#mage-hp').style.width = (100 * s.mageHp / RE.game.MAGE_HP) + '%';
    $('#mage-hp-txt').textContent = `VIDA ${s.mageHp} / ${RE.game.MAGE_HP}`;
    renderEquip();
  }

  function renderEquip() {
    const box = $('#equip');
    box.innerHTML = '';
    for (const [key, eq] of Object.entries(RE.game.EQUIPMENT)) {
      const b = el('button', 'slot');
      b.type = 'button';
      const unlocked = game.state.equipment[key];
      b.title = unlocked ? `${eq.nome}: ${eq.desc}` : 'Bloqueado: vença um nível';
      if (!unlocked) b.classList.add('locked');
      const icon = el('span');
      sprite(icon, `equip_${key}.png`, unlocked ? eq.emoji : '🔒');
      b.appendChild(icon);
      if (key === 'hint' && unlocked) {
        b.appendChild(el('span', 'count', 'x' + game.state.hintCharges));
        b.onclick = () => {
          const ex = game.useHint();
          if (ex) { $('#spell').value = ex; setLog('🧿 Dica: um feitiço válido para este nível foi escrito para você.', 'ok'); renderEquip(); }
          else setLog('🧿 Sem cargas de dica.', 'err');
        };
      }
      box.appendChild(b);
    }
  }

  function renderKeypad() {
    const box = $('#keypad');
    box.innerHTML = '';
    ['F', 'I', 'T', '(', ')', '#', '[', ']', ':'].forEach((k) => {
      const b = el('button', 'slot ' + (RE.ap.RUNES.includes(k) ? 'rune-' + k : 'sym'));
      b.type = 'button';
      b.title = RE.ap.RUNES.includes(k) ? { F: 'Runa de fogo', I: 'Runa de gelo', T: 'Runa de terra' }[k] : 'Símbolo estrutural';
      if (RE.ap.RUNES.includes(k)) {
        const icon = el('span'); sprite(icon, `runa_${k}.png`, { F: '🔥', I: '❄️', T: '🌱' }[k]);
        b.appendChild(icon); b.appendChild(el('span', 'count', k));
      } else b.textContent = k;
      b.onclick = () => { const i = $('#spell'); i.value += k; i.focus(); };
      box.appendChild(b);
    });
  }

  function renderExamples() {
    const box = $('#examples');
    box.innerHTML = '';
    [
      ['ok', '✅ AP+ALL aceitam', '([()])[]#FITIF:FITIF'],
      ['bad', '❌ AP rejeita', '(([()])[]#FITIF:FITIF'],
      ['warn', '⚠️ ALL rejeita', '([()])[]#FITIF:FITIT'],
      ['bad', '☠ símbolo inválido', '([()])[]#FITIF:FITIX'],
    ].forEach(([cls, label, value]) => {
      const c = el('button', 'chip ' + cls, label);
      c.type = 'button'; c.title = value;
      c.onclick = () => { $('#spell').value = value; $('#spell').focus(); };
      box.appendChild(c);
    });
    const clear = el('button', 'chip', 'limpar');
    clear.type = 'button';
    clear.onclick = () => { $('#spell').value = ''; $('#spell').focus(); };
    box.appendChild(clear);
  }

  function setLog(text, cls) { const l = $('#log'); l.textContent = text; l.className = cls || ''; }

  function floater(text, color) {
    const f = $('#floater');
    f.textContent = text; f.style.color = color;
    f.classList.remove('show'); void f.offsetWidth; f.classList.add('show');
  }

  /* ---------- grimorio: player de rastreamento ---------- */
  function stopPlayer(kind) { const p = players[kind]; if (p && p.timer) { clearInterval(p.timer); p.timer = null; } }

  function mountPlayer(kind, res, opts) {
    stopPlayer(kind);
    const panel = $('#panel-' + kind);
    if (!res || !res.trace.length) {
      panel.innerHTML = `<div class="empty">${esc(opts.emptyMsg)}</div>`;
      players[kind] = null;
      return;
    }
    const trace = res.trace;
    const last = trace.length - 1;
    const p = { idx: 0, timer: null };
    players[kind] = p;
    panel.innerHTML = '';

    const top = el('div', 't-top');
    const ctrl = el('div', 'ctrl');
    const btns = {};
    [['first', '⏮'], ['prev', '◀'], ['play', '▶'], ['next', '▶|'], ['end', '⏭']].forEach(([k, t]) => {
      const b = el('button', null, t); b.type = 'button'; b.title = k; btns[k] = b; ctrl.appendChild(b);
    });
    const verdict = el('span', 'verdict run', 'executando…');
    const info = el('span', 'stepinfo');
    top.append(ctrl, verdict, info);

    const main = el('div', 't-main');
    const visual = el('div', 'visual');
    const wrap = el('div', 'tablewrap');
    const table = el('table', 'trace');
    table.innerHTML = '<thead><tr>' + opts.columns.map((c) => `<th>${c}</th>`).join('') + '</tr></thead>';
    const tbody = el('tbody');
    trace.forEach((s, i) => {
      const tr = el('tr', null, opts.row(s).map((c) => `<td>${esc(c)}</td>`).join(''));
      tr.onclick = () => { pause(); go(i); };
      tbody.appendChild(tr);
    });
    table.appendChild(tbody); wrap.appendChild(table);
    main.append(visual, wrap);
    panel.append(top, main);

    function go(i) {
      p.idx = Math.max(0, Math.min(last, i));
      const s = trace[p.idx];
      visual.innerHTML = '';
      opts.draw(visual, s, p.idx);
      [...tbody.children].forEach((tr, k) => tr.classList.toggle('active', k === p.idx));
      const act = tbody.children[p.idx];
      if (act) wrap.scrollTop = act.offsetTop - wrap.clientHeight / 2;
      info.textContent = `passo ${p.idx}/${last}`;
      if (p.idx === last) {
        verdict.className = 'verdict ' + (res.accepted ? 'ok' : 'bad');
        verdict.textContent = (res.accepted ? '✔ ACEITA' : '✘ REJEITA') + ' — ' + res.reason;
      } else { verdict.className = 'verdict run'; verdict.textContent = 'executando…'; }
      btns.play.textContent = p.timer ? '⏸' : '▶';
    }
    function pause() { if (p.timer) { clearInterval(p.timer); p.timer = null; } btns.play.textContent = '▶'; }
    function play() {
      if (p.idx >= last) go(0);
      pause();
      p.timer = setInterval(() => {
        if (p.idx >= last) { pause(); if (opts.onEnd) opts.onEnd(); return; }
        go(p.idx + 1);
        if (p.idx >= last) { pause(); if (opts.onEnd) opts.onEnd(); }
      }, opts.speed || 450);
      btns.play.textContent = '⏸';
    }
    btns.first.onclick = () => { pause(); go(0); };
    btns.prev.onclick = () => { pause(); go(p.idx - 1); };
    btns.next.onclick = () => { pause(); go(p.idx + 1); };
    btns.end.onclick = () => { pause(); go(last); };
    btns.play.onclick = () => (p.timer ? pause() : play());
    p.play = play;
    go(0);
    if (opts.autoplay) play();
  }

  const stateBadge = (state, infoMap) =>
    `<div><span class="state-badge">${state}</span><span class="state-desc">${esc(infoMap[state] || '')}</span></div>`;

  function drawAP(box, s) {
    box.innerHTML = stateBadge(s.state, RE.ap.STATE_INFO);
    const input = box.dataset.input;
    const cells = el('div', 'cells');
    [...input].forEach((ch, i) => {
      const c = el('div', 'cell', `<div class="c ${i < s.pos ? 'done' : i === s.pos ? 'cur' : ''}">${esc(ch)}</div><div class="head">${i === s.pos ? '▲' : ''}</div>`);
      cells.appendChild(c);
    });
    if (s.pos >= input.length) cells.appendChild(el('div', 'cell', '<div class="c cur">∅</div><div class="head">▲ fim</div>'));
    const row = el('div', 'stackrow');
    const stack = el('div', 'stack');
    s.stack.forEach((sym, i) => {
      const b = el('div', 'blk' + (sym === RE.ap.BOT ? ' bot' : '') + (i === s.stack.length - 1 ? ' top' : ''), esc(sym));
      stack.appendChild(b);
    });
    row.append(stack, el('div', 'lbl', `pilha<br>(topo em destaque)<br>altura ${s.stack.length}<br>leitura: posição ${s.pos} de ${input.length}`));
    box.append(el('div', 'lbl', 'entrada (▲ = próxima leitura)'), cells, row);
  }

  function drawLBA(box, s) {
    box.innerHTML = stateBadge(s.state, RE.lba.STATE_INFO);
    const cells = el('div', 'cells');
    s.tape.forEach((ch, i) => {
      const isMarker = ch === RE.lba.LM || ch === RE.lba.RM;
      const marked = ['f', 'i', 't'].includes(ch);
      cells.appendChild(el('div', 'cell',
        `<div class="idx">${i}</div><div class="c ${isMarker ? 'marker' : marked ? 'marked' : ''} ${i === s.head ? 'cur' : ''}">${esc(ch)}</div><div class="head">${i === s.head ? '▲' : ''}</div>`));
    });
    box.append(el('div', 'lbl', 'fita: ⊢ marcador · n células graváveis · ⊣ marcador (minúsculas = runa já marcada)'), cells,
      el('div', 'lbl', `cabeçote na célula ${s.head} (lendo "${esc(s.tape[s.head])}")`));
  }

  function mountTraces(res, firstTime) {
    const inputAP = res.input || '';
    mountPlayer('ap', res.ap, {
      emptyMsg: res.status === 'invalid_symbol' ? 'Nenhum autômato foi executado: símbolo fora do alfabeto de entrada.' : 'Lance um feitiço para ver o rastreamento do AP.',
      columns: ['#', 'estado', 'pos', 'pilha (fundo→topo)', 'transição'],
      row: (s) => [s.step, s.state, s.pos, s.stack.join(' '), s.action],
      draw: (box, s) => { box.dataset.input = inputAP; drawAP(box, s); },
      autoplay: true,
      onEnd: () => {
        if (res.all) setTimeout(() => { activateTab('all'); if (players.all && players.all.play) players.all.play(); }, 700);
      },
    });
    const tail = res.tail || '';
    mountPlayer('all', res.all, {
      emptyMsg: res.status === 'ap_rejects' ? 'O AP rejeitou a entrada: o ALL fica sem execução.' : res.status === 'invalid_symbol' ? 'Nenhum autômato foi executado.' : 'Lance um feitiço para ver o rastreamento do ALL.',
      columns: ['#', 'estado', 'cabeçote', 'fita', 'transição'],
      row: (s) => [s.step, s.state, s.head, s.tape.map((c, i) => (i === s.head ? `[${c}]` : c)).join(' '), s.action],
      draw: (box, s) => drawLBA(box, s),
      autoplay: false,
      speed: 250,
    });
    void tail; void firstTime;
  }

  function mountDerivation(res) {
    const panel = $('#panel-der');
    panel.classList.add('scroll');
    if (!res || res.status === 'invalid_symbol') { panel.innerHTML = '<div class="empty">Sem derivação: símbolo inválido.</div>'; return; }
    const d = RE.grammar.derive(res.input);
    if (!d.ok) { panel.innerHTML = '<div class="empty">A cadeia não pertence a L(G): não existe derivação (coerente com a rejeição do AP).</div>'; return; }
    panel.innerHTML = '<div class="der"><b>Derivação mais à esquerda de</b> <code>' + esc(res.input) + '</code><ol>' +
      d.steps.map((s, i) => `<li>${i === 0 ? '' : '⇒ '}<span class="form">${esc(s.form)}</span>${s.rule ? `<span class="rule">[${esc(s.rule)}]</span>` : '<span class="rule">[símbolo inicial]</span>'}</li>`).join('') + '</ol></div>';
  }

  function mountRules() {
    const A = RE.ap, L = RE.lba, G = RE.grammar;
    const apRows = A.DELTA.map((t) => `<tr><td><code>${esc(A.describe(t))}</code></td></tr>`).join('');
    const lbaRows = L.TRANSITIONS.map((t) => `<tr><td>${t.from}</td><td>${esc(t.read)}</td><td>${t.to}</td><td>${esc(t.write)}</td><td>${t.move}</td></tr>`).join('');
    $('#panel-regras').classList.add('scroll');
    $('#panel-regras').innerHTML = `<div class="rules">
      <h4>Módulo 1 · GLC + AP (escudo)</h4>
      <p>L₁ = { E # x : y | E ∈ Dyck⁺ sobre {( ) [ ]}, x,y ∈ {F,I,T}⁺ } — <b>não regular</b> (contagem ilimitada de aberturas: lema do bombeamento sobre (ⁿ)ⁿ).</p>
      <p>GLC: ${G.PRODUCTIONS.map((p) => `<code>${esc(G.label(p))}</code>`).join(' · ')}. V={S,E,D,R}, T={( ) [ ] # : F I T}, início S.</p>
      <p>AP: Q={${A.STATES.join(',')}}, Σ={${A.SIGMA.join(' ')}}, Γ={⊥,(,[}, q₀=q0, F={q7}. <b>Aceitação por estado final com a entrada inteira consumida</b>.
      Não determinismo só na transição ε de q6; o simulador explora todas as alternativas e rejeita se nenhuma consome a entrada até q7.</p>
      <details><summary>Transições do AP (δ) — ${A.DELTA.length}</summary><table>${apRows}</table></details>
      <h4>Módulo 2 · ALL (eco)</h4>
      <p>L₂ = { x : x | x ∈ {F,I,T}⁺ } — sensível ao contexto e <b>não livre de contexto</b> (variante de {ww}; lema do bombeamento para LLC).
      O ALL recebe só o trecho após <code>#</code>. Fita: ⊢ + n células graváveis + ⊣ (marcadores fixos, nunca sobrescritos nem ultrapassados).</p>
      <p>Cada rodada marca a 1ª runa livre de x, cruza <code>:</code>, exige a mesma runa na 1ª livre de y, marca e volta a ⊢. No fim exige y sem sobras.
      <b>Termina sempre</b>: cada rodada marca 2 células, então há no máximo n/2 rodadas de O(n) passos. É determinístico.</p>
      <p>Estados (${L.STATES.length}): ${L.STATES.map((s) => `<code>${s}</code>`).join(' ')}. Γ = {${L.GAMMA.join(' ')}}.</p>
      <details><summary>Transições do ALL (δ) — ${L.TRANSITIONS.length}</summary><table><tr><th>estado</th><th>lê</th><th>vai p/</th><th>escreve</th><th>move</th></tr>${lbaRows}</table></details>
      <h4>Jogo</h4><p>O jogo só consome a decisão do pipeline: dano = |x| × poder (×2 na fraqueza; ÷2 se a missão falhar). AP rejeita: −4 de vida · ALL rejeita: −2 · símbolo inválido: só exibe o erro.</p></div>`;
  }

  function activateTab(name) {
    document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === 'panel-' + name));
    if (!$('#grimorio').classList.contains('open')) $('#grimorio').classList.add('open');
  }

  /* ---------- fluxo do jogo ---------- */
  function overlay(title, color, text, btnLabel, onClick) {
    const o = $('#overlay');
    o.classList.remove('hidden');
    o.innerHTML = `<h2 style="color:${color}">${title}</h2><div>${text}</div>`;
    const b = el('button', null, btnLabel);
    b.onclick = () => { o.classList.add('hidden'); onClick(); };
    o.appendChild(b);
  }

  function onCast(e) {
    e.preventDefault();
    if (!$('#overlay').classList.contains('hidden')) return;
    const spell = $('#spell').value.trim();
    const out = game.cast(spell);
    const r = out.result;
    mountTraces(r);
    mountDerivation(r);
    activateTab('ap');
    const cls = r.status === 'invalid_symbol' ? 'err' : r.status === 'accepted' ? 'ok' : 'bad';
    setLog(out.text, cls);
    if (out.damage) {
      floater('-' + out.damage, '#00f5d4');
      const m = $('#monster'); m.classList.remove('hit'); void m.offsetWidth; m.classList.add('hit');
    } else if (out.taken) floater('-' + out.taken + ' ❤', '#f15bb5');
    renderHud();
    if (out.won) {
      $('#monster').classList.add('dead');
      const eq = out.unlocked ? `<br>🎁 Novo equipamento: ${RE.game.EQUIPMENT[out.unlocked].emoji} ${RE.game.EQUIPMENT[out.unlocked].nome}` : '';
      const lastLevel = game.state.finished;
      setTimeout(() => overlay(lastLevel ? '🏆 DEMO CONCLUÍDA' : '⚔ MONSTRO DERROTADO', '#00f5d4',
        lastLevel ? 'Os níveis 4–8 estão em desenvolvimento.' : `Você avança para o próximo nível!${eq}`,
        lastLevel ? 'JOGAR DE NOVO' : 'PRÓXIMO NÍVEL',
        () => { $('#monster').classList.remove('dead'); if (lastLevel) game.restartAll(); else game.nextLevel(); $('#spell').value = ''; setLog('Novo desafio! Leia a missão no canto da arena.', ''); renderHud(); }), 900);
    } else if (out.lost) {
      setTimeout(() => overlay('💀 DERROTADO', '#f15bb5', 'Seu feitiço falhou demais.', 'TENTAR DE NOVO', () => { $('#monster').classList.remove('dead'); game.restartLevel(); renderHud(); setLog('Tente novamente.', ''); }), 700);
    }
  }

  function init() {
    renderKeypad(); renderExamples(); renderHud(); mountRules();
    mountTraces({ status: 'none', ap: null, all: null, input: '' });
    mountDerivation(null);
    $('#panel-der').innerHTML = '<div class="empty">Lance um feitiço para ver a derivação da GLC.</div>';
    $('#cast-form').addEventListener('submit', onCast);
    $('#tabs').addEventListener('click', (ev) => { const t = ev.target.dataset.tab; if (t) activateTab(t); });
    $('#g-toggle').onclick = () => {
      const g = $('#grimorio'); g.classList.toggle('open');
      $('#g-toggle').textContent = g.classList.contains('open') ? '▼ recolher' : '▲ abrir';
    };
    $('#btn-restart').onclick = () => { game = RE.game.create(); $('#overlay').classList.add('hidden'); $('#monster').classList.remove('dead'); mountTraces({ status: 'none', ap: null, all: null, input: '' }); $('#panel-der').innerHTML = '<div class="empty">Lance um feitiço para ver a derivação da GLC.</div>'; $('#spell').value = ''; setLog('Jogo reiniciado.', ''); renderHud(); };
    sprite($('#mage-img'), 'mago.png', '🧙');
    $('#spell').focus();
  }
  init();
})();
