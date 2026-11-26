/*
 * RUNE ECHO - Camada de JOGO (niveis, barreiras, turno do inimigo, dano, vida).
 * IMPORTANTE: este modulo apenas CONSOME a decisao do pipeline AP -> ALL.
 * Ele nunca decide se um feitico e valido: quem decide e a execucao dos automatos.
 *
 * Mecanicas:
 *  - Barreira (desafio aleatorio por turno): o feitico so fere se o ESCUDO atender
 *    a exigencia sorteada (ex.: 2 escudos ( ), 1 escudo [ ], profundidade >= 3).
 *  - Turno do inimigo: apos cada feitico (se o monstro sobreviver) ele ataca.
 *    Defesa = floor(pares de escudo / 2) (somente se o AP aceitou) + Escudo Runico.
 */
(function (root) {
  'use strict';
  const RE = (root.RE = root.RE || {});

  const xOf = (spell) => spell.slice(spell.indexOf('#') + 1, spell.indexOf(':'));
  const shieldOf = (spell) => spell.slice(0, spell.indexOf('#'));

  /** Conta pares do escudo (assume escudo balanceado, ja aceito pelo AP). */
  function analyzeShield(shield) {
    const info = { round: 0, square: 0, total: 0, depth: 0 };
    let d = 0;
    for (const c of shield) {
      if (c === '(' || c === '[') { d++; info.depth = Math.max(info.depth, d); }
      else if (c === ')') { d--; info.round++; info.total++; }
      else if (c === ']') { d--; info.square++; info.total++; }
    }
    return info;
  }

  function describeBarrier(req) {
    if (!req) return 'sem barreira';
    const p = [];
    const n = (k, a, b) => `${k} ${k === 1 ? a : b}`;
    if (req.round) p.push(n(req.round, 'escudo ( )', 'escudos ( )'));
    if (req.square) p.push(n(req.square, 'escudo [ ]', 'escudos [ ]'));
    if (req.total) p.push(`${req.total} escudos quaisquer`);
    if (req.depth) p.push(`profundidade ≥ ${req.depth}`);
    if (req.minLen) p.push(`feitiço com ≥ ${req.minLen} símbolos`);
    return p.join(' + ');
  }

  function checkBarrier(req, spell) {
    if (!req) return true;
    const i = analyzeShield(shieldOf(spell));
    return i.round >= (req.round || 0) && i.square >= (req.square || 0) && i.total >= (req.total || 0) &&
      i.depth >= (req.depth || 0) && spell.length >= (req.minLen || 0);
  }

  /** Monta um feitico valido que satisfaz a barreira (usado pela dica e pelos testes). */
  function solveBarrier(req, fraq) {
    req = req || {};
    fraq = fraq || 'F';
    const r = req.round || 0, s = req.square || 0;
    const total = Math.max(req.total || 0, r + s, 1);
    const items = [...Array(r).fill('('), ...Array(s).fill('['), ...Array(total - r - s).fill('(')];
    const d = req.depth || 0;
    const chain = items.splice(0, Math.min(d, items.length));
    while (chain.length < d) chain.push('(');
    const close = (o) => (o === '(' ? ')' : ']');
    let nested = '';
    for (let i = chain.length - 1; i >= 0; i--) nested = chain[i] + nested + close(chain[i]);
    const shield = nested + items.map((o) => o + close(o)).join('');
    let x = fraq + (fraq === 'I' ? 'F' : 'I');
    let spell = `${shield}#${x}:${x}`;
    while (spell.length < (req.minLen || 0)) { x += 'T'; spell = `${shield}#${x}:${x}`; }
    return spell;
  }

  const LEVELS = [
    { id: 1, nome: 'Slime de Gelo', tipo: 'gelo', emoji: '🧊', hp: 12, atk: 2, fraqueza: 'F',
      pool: [] },
    { id: 2, nome: 'Morcego Flamejante', tipo: 'fogo', emoji: '🦇', hp: 20, atk: 3, fraqueza: 'I',
      pool: [{ round: 1 }, { total: 2 }] },
    { id: 3, nome: 'Golem de Musgo', tipo: 'terra', emoji: '🗿', hp: 28, atk: 3, fraqueza: 'F',
      pool: [{ round: 2 }, { square: 1 }] },
    { id: 4, nome: 'Espectro Gélido', tipo: 'gelo', emoji: '👻', hp: 34, atk: 4, fraqueza: 'T',
      pool: [{ depth: 3 }, { round: 1, square: 1 }] },
    { id: 5, nome: 'Lobo da Geada', tipo: 'gelo', emoji: '🐺', hp: 40, atk: 4, fraqueza: 'F',
      pool: [{ round: 2, square: 1 }, { total: 3, minLen: 14 }] },
    { id: 6, nome: 'Dragão de Brasa', tipo: 'fogo', emoji: '🐉', hp: 48, atk: 5, fraqueza: 'I',
      pool: [{ square: 2 }, { depth: 3, round: 1 }] },
    { id: 7, nome: 'Hidra do Pântano', tipo: 'terra', emoji: '🐍', hp: 56, atk: 5, fraqueza: 'F',
      pool: [{ round: 3 }, { square: 1, round: 2 }, { total: 3, minLen: 18 }] },
    { id: 8, nome: 'Arquimago Sombrio', tipo: 'fogo', emoji: '👹', hp: 80, atk: 6, fraqueza: 'T',
      pool: [{ round: 2, square: 2 }, { depth: 4 }, { round: 1, square: 1, minLen: 18 }] },
  ];
  LEVELS.forEach((lv) => { lv.exemplo = solveBarrier(lv.pool[0] || null, lv.fraqueza); });

  const EQUIPMENT = {
    hint: { emoji: '🧿', nome: 'Amuleto da Dica', desc: 'Escreve um feitiço que vence a barreira atual (3 cargas)' },
    shield: { emoji: '🛡️', nome: 'Escudo Rúnico', desc: 'Dano recebido −1' },
    staff: { emoji: '🪄', nome: 'Cajado de Eco', desc: 'Poder +2' },
  };
  const UNLOCK_AFTER = { 1: 'shield', 2: 'staff' };
  const MAGE_HP = 20;
  const HEAL_BETWEEN_LEVELS = 8;

  function create(rng) {
    rng = rng || Math.random;
    const g = {
      levelIdx: 0, mageHp: MAGE_HP, monsterHp: LEVELS[0].hp, barrier: null,
      equipment: { hint: true, shield: false, staff: false },
      hintCharges: 3, finished: false, lost: false,
    };
    const level = () => LEVELS[g.levelIdx];
    const power = () => 2 + (g.equipment.staff ? 2 : 0);
    const rollBarrier = () => {
      const pool = level().pool;
      g.barrier = pool.length ? pool[Math.floor(rng() * pool.length)] : null;
    };
    rollBarrier();

    function cast(spell) {
      const result = RE.pipeline.run(spell);
      const out = {
        result, damage: 0, taken: 0, defense: 0, barrier: g.barrier, barrierOk: null,
        won: false, lost: false, text: result.message, unlocked: null,
      };
      if (g.finished || g.lost) { out.text = 'O combate terminou. Reinicie para jogar de novo.'; return out; }
      if (result.status === 'invalid_symbol') return out; // erro de entrada: nao consome o turno
      const lv = level();
      const parts = [];
      const apOk = result.ap && result.ap.accepted;
      const info = apOk ? analyzeShield(shieldOf(spell)) : null;

      if (result.status === 'accepted') {
        out.barrierOk = checkBarrier(g.barrier, spell);
        if (!out.barrierOk) {
          parts.push(`🧱 A barreira resistiu! Exigência: ${describeBarrier(g.barrier)}. Nenhum dano.`);
        } else {
          const x = xOf(spell);
          let dmg = x.length * power();
          const weak = x.includes(lv.fraqueza);
          if (weak) dmg *= 2;
          out.damage = dmg;
          g.monsterHp = Math.max(0, g.monsterHp - dmg);
          parts.push(`✨ Feitiço aceito! Dano ${dmg}${weak ? ' (fraqueza ×2)' : ''}.`);
        }
        if (g.monsterHp === 0) {
          out.won = true;
          const key = UNLOCK_AFTER[lv.id];
          if (key) { g.equipment[key] = true; out.unlocked = key; }
          if (g.levelIdx === LEVELS.length - 1) { g.finished = true; parts.push(`${lv.nome} derrotado! Você venceu o jogo!`); }
          else parts.push(`${lv.nome} derrotado!`);
          out.text = parts.join(' ');
          return out;
        }
      } else if (result.status === 'all_rejects') {
        parts.push(`🔁 O eco falhou (${result.all.reason}). Nenhum dano.`);
      } else {
        parts.push(`💥 Escudo instável (${result.ap.reason}). Sem defesa!`);
      }

      // turno do inimigo
      out.defense = info ? Math.floor(info.total / 2) : 0;
      const equip = g.equipment.shield ? 1 : 0;
      out.taken = Math.max(0, lv.atk - out.defense - equip);
      g.mageHp = Math.max(0, g.mageHp - out.taken);
      parts.push(`${lv.emoji} ${lv.nome} ataca (${lv.atk}): defesa ${out.defense + equip}, você perde ${out.taken} de vida.`);
      if (g.mageHp === 0) { g.lost = true; out.lost = true; parts.push('Você foi derrotado.'); }
      else { rollBarrier(); parts.push(`Nova barreira: ${describeBarrier(g.barrier)}.`); }
      out.text = parts.join(' ');
      return out;
    }

    function nextLevel() {
      if (g.levelIdx < LEVELS.length - 1) {
        g.levelIdx++;
        g.monsterHp = LEVELS[g.levelIdx].hp;
        g.mageHp = Math.min(MAGE_HP, g.mageHp + HEAL_BETWEEN_LEVELS);
        rollBarrier();
      }
    }
    function restartLevel() { g.lost = false; g.mageHp = MAGE_HP; g.monsterHp = level().hp; rollBarrier(); }
    function restartAll() {
      g.levelIdx = 0; g.mageHp = MAGE_HP; g.monsterHp = LEVELS[0].hp; g.lost = false; g.finished = false;
      g.equipment = { hint: true, shield: false, staff: false }; g.hintCharges = 3; rollBarrier();
    }
    function useHint() {
      if (!g.equipment.hint || g.hintCharges <= 0) return null;
      g.hintCharges--;
      return solveBarrier(g.barrier, level().fraqueza);
    }
    return { state: g, level, power, cast, nextLevel, restartLevel, restartAll, useHint };
  }

  RE.game = { LEVELS, EQUIPMENT, MAGE_HP, create, analyzeShield, describeBarrier, checkBarrier, solveBarrier };
  if (typeof module !== 'undefined' && module.exports) module.exports = RE;
})(typeof window !== 'undefined' ? window : globalThis);
