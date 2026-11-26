/*
 * RUNE ECHO - Camada de JOGO (niveis, dano, vida).
 * IMPORTANTE: este modulo apenas CONSOME a decisao do pipeline AP -> ALL.
 * Ele nunca decide se um feitico e valido: quem decide e a execucao dos automatos.
 */
(function (root) {
  'use strict';
  const RE = (root.RE = root.RE || {});

  const xOf = (spell) => spell.slice(spell.indexOf('#') + 1, spell.indexOf(':'));

  const LEVELS = [
    {
      id: 1, nome: 'Slime de Gelo', tipo: 'gelo', emoji: '🧊', hp: 12, fraqueza: 'F',
      missao: 'Lance qualquer feitiço válido. Fraqueza: fogo (F).',
      exemplo: '()#F:F',
      check: () => true,
    },
    {
      id: 2, nome: 'Morcego Flamejante', tipo: 'fogo', emoji: '🦇', hp: 24, fraqueza: 'I',
      missao: 'Use ao menos uma runa I (gelo) em x. Fraqueza: gelo (I).',
      exemplo: '([])#FI:FI',
      check: (spell) => xOf(spell).includes('I'),
    },
    {
      id: 3, nome: 'Golem de Musgo', tipo: 'terra', emoji: '🗿', hp: 36, fraqueza: 'F',
      missao: 'Escudo com colchetes [ ] e feitiço com ao menos 12 símbolos. Fraqueza: fogo (F).',
      exemplo: '[()]()#FI:FI',
      check: (spell) => spell.slice(0, spell.indexOf('#')).includes('[') && spell.length >= 12,
    },
  ];

  const EQUIPMENT = {
    hint: { emoji: '🧿', nome: 'Amuleto da Dica', desc: 'Mostra um exemplo válido (3 cargas)' },
    shield: { emoji: '🛡️', nome: 'Escudo Rúnico', desc: 'Dano recebido −1' },
    staff: { emoji: '🪄', nome: 'Cajado de Eco', desc: 'Poder +2' },
  };
  const UNLOCK_AFTER = { 1: 'shield', 2: 'staff' };
  const MAGE_HP = 20;
  const DAMAGE_TAKEN = { ap_rejects: 4, all_rejects: 2 };

  function create() {
    const g = {
      levelIdx: 0, mageHp: MAGE_HP, monsterHp: LEVELS[0].hp,
      equipment: { hint: true, shield: false, staff: false },
      hintCharges: 3, finished: false, lost: false,
    };
    const level = () => LEVELS[g.levelIdx];
    const power = () => 2 + (g.equipment.staff ? 2 : 0);

    function cast(spell) {
      const result = RE.pipeline.run(spell);
      const out = { result, damage: 0, taken: 0, won: false, lost: false, missionOk: null, text: result.message, unlocked: null };
      if (g.finished || g.lost) { out.text = 'O combate terminou. Reinicie para jogar de novo.'; return out; }
      const lv = level();
      if (result.status === 'invalid_symbol') return out; // erro de entrada: sem penalidade
      if (result.status !== 'accepted') {
        const base = DAMAGE_TAKEN[result.status];
        out.taken = Math.max(1, base - (g.equipment.shield ? 1 : 0));
        g.mageHp = Math.max(0, g.mageHp - out.taken);
        out.text = result.status === 'ap_rejects'
          ? `💥 Feitiço instável! (${result.message}) Você perde ${out.taken} de vida.`
          : `🔁 O eco falhou! (${result.message}) Você perde ${out.taken} de vida.`;
        if (g.mageHp === 0) { g.lost = true; out.lost = true; out.text += ' Você foi derrotado.'; }
        return out;
      }
      const x = xOf(spell);
      let dmg = x.length * power();
      const weak = x.includes(lv.fraqueza);
      if (weak) dmg *= 2;
      out.missionOk = lv.check(spell);
      if (!out.missionOk) dmg = Math.max(1, Math.floor(dmg / 2));
      out.damage = dmg;
      g.monsterHp = Math.max(0, g.monsterHp - dmg);
      out.text = `✨ Feitiço aceito! Dano ${dmg}${weak ? ' (fraqueza ×2)' : ''}${out.missionOk ? '' : ' (missão não cumprida: dano ÷2)'}.`;
      if (g.monsterHp === 0) {
        out.won = true;
        const key = UNLOCK_AFTER[lv.id];
        if (key) { g.equipment[key] = true; out.unlocked = key; }
        if (g.levelIdx === LEVELS.length - 1) { g.finished = true; out.text += ` ${lv.nome} derrotado! Fim da demo.`; }
        else { out.text += ` ${lv.nome} derrotado!`; }
      }
      return out;
    }

    function nextLevel() {
      if (g.levelIdx < LEVELS.length - 1) {
        g.levelIdx++;
        g.monsterHp = LEVELS[g.levelIdx].hp;
        g.mageHp = Math.min(MAGE_HP, g.mageHp + 6);
      }
    }
    function restartLevel() { g.lost = false; g.mageHp = MAGE_HP; g.monsterHp = level().hp; }
    function restartAll() {
      g.levelIdx = 0; g.mageHp = MAGE_HP; g.monsterHp = LEVELS[0].hp; g.lost = false; g.finished = false;
      g.equipment = { hint: true, shield: false, staff: false }; g.hintCharges = 3;
    }
    function useHint() {
      if (!g.equipment.hint || g.hintCharges <= 0) return null;
      g.hintCharges--;
      return level().exemplo;
    }
    return { state: g, level, power, cast, nextLevel, restartLevel, restartAll, useHint };
  }

  RE.game = { LEVELS, EQUIPMENT, MAGE_HP, create };
  if (typeof module !== 'undefined' && module.exports) module.exports = RE;
})(typeof window !== 'undefined' ? window : globalThis);
