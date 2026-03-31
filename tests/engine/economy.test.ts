import { describe, it, expect } from 'vitest';
import {
  canAfford,
  spendGold,
  buySupplies,
  consumeSupplies,
  calculateLoot,
  calculateHireCost,
} from '../../src/engine/economy';
import type { KingdomResources } from '../../src/engine/types';
import { SUPPLY_COST, STEPS_PER_SUPPLY } from '../../src/engine/constants';

function makeResources(overrides: Partial<KingdomResources> = {}): KingdomResources {
  return {
    gold: 100,
    food: 20,
    water: 15,
    torches: 10,
    ...overrides,
  };
}

describe('canAfford', () => {
  it('returns true when gold is sufficient', () => {
    expect(canAfford(makeResources({ gold: 50 }), 50)).toBe(true);
  });

  it('returns false when gold is insufficient', () => {
    expect(canAfford(makeResources({ gold: 10 }), 50)).toBe(false);
  });
});

describe('spendGold', () => {
  it('decrements gold by cost', () => {
    const result = spendGold(makeResources({ gold: 100 }), 30);
    expect(result.gold).toBe(70);
  });

  it('returns unchanged resources if cannot afford', () => {
    const resources = makeResources({ gold: 10 });
    const result = spendGold(resources, 50);
    expect(result.gold).toBe(10);
  });
});

describe('buySupplies', () => {
  it('spends gold and increments the supply', () => {
    const result = buySupplies(makeResources({ gold: 100, food: 10 }), 'food', 3);
    expect(result.food).toBe(13);
    expect(result.gold).toBe(100 - 3 * SUPPLY_COST.food);
  });

  it('returns unchanged if cannot afford', () => {
    const result = buySupplies(makeResources({ gold: 2, water: 10 }), 'water', 1);
    expect(result.water).toBe(10);
    expect(result.gold).toBe(2);
  });
});

describe('consumeSupplies', () => {
  it('decrements by 1 per STEPS_PER_SUPPLY steps', () => {
    const resources = makeResources({ food: 10, water: 8, torches: 5 });
    const result = consumeSupplies(resources, STEPS_PER_SUPPLY);
    expect(result.food).toBe(9);
    expect(result.water).toBe(7);
    expect(result.torches).toBe(4);
  });

  it('does not consume when steps are below threshold', () => {
    const resources = makeResources({ food: 10, water: 8, torches: 5 });
    const result = consumeSupplies(resources, STEPS_PER_SUPPLY - 1);
    expect(result.food).toBe(10);
    expect(result.water).toBe(8);
    expect(result.torches).toBe(5);
  });

  it('does not go below zero', () => {
    const resources = makeResources({ food: 0, water: 0, torches: 0 });
    const result = consumeSupplies(resources, STEPS_PER_SUPPLY * 3);
    expect(result.food).toBe(0);
    expect(result.water).toBe(0);
    expect(result.torches).toBe(0);
  });
});

describe('calculateLoot', () => {
  it('returns gold within the drop range + floor bonus', () => {
    const drop = { min: 5, max: 10 };
    for (let i = 0; i < 20; i++) {
      const loot = calculateLoot(drop, 1);
      expect(loot).toBeGreaterThanOrEqual(5 + 3); // min + floorBonus
      expect(loot).toBeLessThanOrEqual(10 + 3);   // max + floorBonus
    }
  });
});

describe('calculateHireCost', () => {
  it('returns a cost within min/max range', () => {
    for (let i = 0; i < 20; i++) {
      const cost = calculateHireCost();
      expect(cost).toBeGreaterThanOrEqual(20);
      expect(cost).toBeLessThanOrEqual(45);
    }
  });
});
