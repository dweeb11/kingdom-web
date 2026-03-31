import { describe, it, expect } from 'vitest';
import {
  initCombat,
  buildTurnOrder,
  resolveAttack,
  resolveDefend,
  resolveFlee,
  advanceTurn,
  decideEnemyAction,
} from '../../src/engine/combat';
import type { Combatant, CombatState, Hero, EnemyInstance } from '../../src/engine/types';
import { CREATURE_TYPES } from '../../src/data/creatures';

function makeHeroCombatant(overrides: Partial<Combatant> = {}): Combatant {
  return {
    type: 'hero',
    id: 'hero_1',
    name: 'Test Hero',
    hp: 30,
    maxHp: 30,
    attack: 8,
    defense: 6,
    speed: 4,
    ...overrides,
  };
}

function makeEnemyCombatant(overrides: Partial<Combatant> = {}): Combatant {
  return {
    type: 'enemy',
    id: 'enemy_1',
    name: 'Shadow Rat',
    hp: 8,
    maxHp: 8,
    attack: 3,
    defense: 1,
    speed: 7,
    ...overrides,
  };
}

describe('buildTurnOrder', () => {
  it('sorts combatants by speed descending', () => {
    const combatants = [
      makeHeroCombatant({ id: 'h1', speed: 4 }),
      makeEnemyCombatant({ id: 'e1', speed: 7 }),
      makeHeroCombatant({ id: 'h2', speed: 8 }),
    ];
    const order = buildTurnOrder(combatants);
    expect(order).toEqual(['h2', 'e1', 'h1']);
  });
});

describe('initCombat', () => {
  it('creates a combat state from heroes and enemies', () => {
    const heroes: Combatant[] = [
      makeHeroCombatant({ id: 'h1' }),
    ];
    const enemies: Combatant[] = [
      makeEnemyCombatant({ id: 'e1' }),
    ];
    const state = initCombat(heroes, enemies);
    expect(state.combatants.length).toBe(2);
    expect(state.heroIds).toEqual(['h1']);
    expect(state.enemyIds).toEqual(['e1']);
    expect(state.round).toBe(1);
    expect(state.resolved).toBe(false);
    expect(state.turnOrder.length).toBe(2);
  });
});

describe('resolveAttack', () => {
  it('deals damage = max(1, attack - defense)', () => {
    const state = initCombat(
      [makeHeroCombatant({ id: 'h1', attack: 8 })],
      [makeEnemyCombatant({ id: 'e1', defense: 1, hp: 20, maxHp: 20 })],
    );
    const result = resolveAttack(state, 'h1', 'e1');
    const enemy = result.combatants.find(c => c.id === 'e1')!;
    expect(enemy.hp).toBe(20 - 7); // 8 - 1 = 7 damage
  });

  it('deals minimum 1 damage even if defense > attack', () => {
    const state = initCombat(
      [makeHeroCombatant({ id: 'h1', attack: 2 })],
      [makeEnemyCombatant({ id: 'e1', defense: 10, hp: 20, maxHp: 20 })],
    );
    const result = resolveAttack(state, 'h1', 'e1');
    const enemy = result.combatants.find(c => c.id === 'e1')!;
    expect(enemy.hp).toBe(19); // min 1 damage
  });

  it('marks combat resolved when all enemies are dead', () => {
    const state = initCombat(
      [makeHeroCombatant({ id: 'h1', attack: 20 })],
      [makeEnemyCombatant({ id: 'e1', defense: 0, hp: 1, maxHp: 1 })],
    );
    const result = resolveAttack(state, 'h1', 'e1');
    expect(result.resolved).toBe(true);
  });
});

describe('resolveDefend', () => {
  it('increases defense by 50%', () => {
    const state = initCombat(
      [makeHeroCombatant({ id: 'h1', defense: 6 })],
      [makeEnemyCombatant({ id: 'e1' })],
    );
    const result = resolveDefend(state, 'h1');
    const hero = result.combatants.find(c => c.id === 'h1')!;
    expect(hero.defense).toBe(9); // 6 + floor(6 * 0.5) = 9
  });
});

describe('resolveFlee', () => {
  it('returns a combat state with playerFled flag when successful', () => {
    // Mock Math.random to always succeed
    const origRandom = Math.random;
    Math.random = () => 0.1; // below 0.5 threshold
    try {
      const state = initCombat(
        [makeHeroCombatant({ id: 'h1' })],
        [makeEnemyCombatant({ id: 'e1' })],
      );
      const result = resolveFlee(state);
      expect(result.playerFled).toBe(true);
      expect(result.resolved).toBe(true);
    } finally {
      Math.random = origRandom;
    }
  });

  it('does not flee when roll fails', () => {
    const origRandom = Math.random;
    Math.random = () => 0.9; // above 0.5 threshold
    try {
      const state = initCombat(
        [makeHeroCombatant({ id: 'h1' })],
        [makeEnemyCombatant({ id: 'e1' })],
      );
      const result = resolveFlee(state);
      expect(result.playerFled).toBe(false);
      expect(result.resolved).toBe(false);
    } finally {
      Math.random = origRandom;
    }
  });
});

describe('advanceTurn', () => {
  it('advances to next combatant in turn order', () => {
    const state = initCombat(
      [makeHeroCombatant({ id: 'h1', speed: 10 })],
      [makeEnemyCombatant({ id: 'e1', speed: 5 })],
    );
    expect(state.currentTurnIndex).toBe(0);
    const next = advanceTurn(state);
    expect(next.currentTurnIndex).toBe(1);
  });

  it('wraps around and increments round', () => {
    const state = initCombat(
      [makeHeroCombatant({ id: 'h1', speed: 10 })],
      [makeEnemyCombatant({ id: 'e1', speed: 5 })],
    );
    const after1 = advanceTurn(state);
    const after2 = advanceTurn(after1);
    expect(after2.currentTurnIndex).toBe(0);
    expect(after2.round).toBe(2);
  });
});

describe('decideEnemyAction', () => {
  it('targets the hero with lowest HP', () => {
    const state = initCombat(
      [
        makeHeroCombatant({ id: 'h1', hp: 20 }),
        makeHeroCombatant({ id: 'h2', hp: 5 }),
      ],
      [makeEnemyCombatant({ id: 'e1' })],
    );
    const action = decideEnemyAction(state, 'e1');
    expect(action.type).toBe('attack');
    if (action.type === 'attack') {
      expect(action.targetId).toBe('h2');
    }
  });
});
