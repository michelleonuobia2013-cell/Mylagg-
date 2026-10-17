import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCombatDamage,
  ELEMENTAL_REACTIONS,
  DUNGEON_STAGES,
} from './combat.ts';

test('calculateCombatDamage triggers elemental reactions when contrasting elements meet', () => {
  // Electro attacking Hydro target -> Electro-Charged
  const result = calculateCombatDamage(
    300, // attackerAtk
    100, // skillPower %
    0,   // critRate
    0.5, // critDmg
    50,  // targetDef (defFactor = 100 / 150 = 0.6667)
    'Electro',
    'Hydro'
  );

  assert.ok(result.reaction);
  assert.equal(result.reaction?.name, 'Electro-Charged');
  assert.equal(result.reaction?.damageMultiplier, 1.6);
  // (300 * 0.6667) * 1.6 = ~320
  assert.ok(result.totalDamage > 250);
});

test('calculateCombatDamage triggers Vaporize with 2.0x multiplier', () => {
  const result = calculateCombatDamage(
    200,
    100,
    0,
    0,
    0, // 0 def -> defFactor = 1
    'Pyro',
    'Hydro'
  );

  assert.ok(result.reaction);
  assert.equal(result.reaction?.name, 'Vaporize');
  assert.equal(result.reaction?.damageMultiplier, 2.0);
  assert.equal(result.totalDamage, 400); // 200 * 2.0
});

test('Dungeon stages have proper boss and reward definitions', () => {
  assert.ok(DUNGEON_STAGES.length >= 3);
  const compVillage = DUNGEON_STAGES.find((d) => d.id === 'dungeon_comp_village');
  assert.ok(compVillage);
  assert.equal(compVillage.enemies.some((e) => e.isBoss), true);
  assert.ok(compVillage.rewards.nairaMax > compVillage.rewards.nairaMin);
});
