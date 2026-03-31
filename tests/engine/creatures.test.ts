import { describe, it, expect } from 'vitest';
import { getCreatureType, scaleForFloor, spawnEnemy } from '../../src/engine/creatures';
import { CREATURE_TYPES } from '../../src/data/creatures';
import { FLOOR_SCALING } from '../../src/engine/constants';

describe('getCreatureType', () => {
  it('returns a creature type by ID', () => {
    const creature = getCreatureType('shadow_rat', CREATURE_TYPES);
    expect(creature).toBeDefined();
    expect(creature!.name).toBe('Shadow Rat');
  });

  it('returns undefined for unknown ID', () => {
    const creature = getCreatureType('nonexistent', CREATURE_TYPES);
    expect(creature).toBeUndefined();
  });
});

describe('scaleForFloor', () => {
  it('applies floor scaling bonuses', () => {
    const base = getCreatureType('shadow_rat', CREATURE_TYPES)!;
    const scaled = scaleForFloor(base, 2);
    expect(scaled.stats.hp).toBe(base.stats.hp + 2 * FLOOR_SCALING.hpBonus);
    expect(scaled.stats.attack).toBe(base.stats.attack + 2 * FLOOR_SCALING.attackBonus);
    expect(scaled.stats.speed).toBe(base.stats.speed + 2 * FLOOR_SCALING.speedBonus);
    expect(scaled.goldDrop.min).toBe(base.goldDrop.min + 2 * FLOOR_SCALING.goldBonus);
    expect(scaled.goldDrop.max).toBe(base.goldDrop.max + 2 * FLOOR_SCALING.goldBonus);
  });

  it('does not scale floor 0', () => {
    const base = getCreatureType('shadow_rat', CREATURE_TYPES)!;
    const scaled = scaleForFloor(base, 0);
    expect(scaled.stats.hp).toBe(base.stats.hp);
  });
});

describe('spawnEnemy', () => {
  it('creates an enemy instance from a creature type', () => {
    const type = getCreatureType('shadow_rat', CREATURE_TYPES)!;
    const enemy = spawnEnemy(type, { x: 3, y: 4 }, 1);
    expect(enemy.creatureTypeId).toBe('shadow_rat');
    expect(enemy.position).toEqual({ x: 3, y: 4 });
    expect(enemy.currentHp).toBe(scaleForFloor(type, 1).stats.hp);
    expect(enemy.id).toContain('enemy_');
  });
});

describe('CREATURE_TYPES', () => {
  it('has at least 5 creature types defined', () => {
    expect(Object.keys(CREATURE_TYPES).length).toBeGreaterThanOrEqual(5);
  });

  it('every creature has required fields', () => {
    for (const [id, creature] of Object.entries(CREATURE_TYPES)) {
      expect(creature.id).toBe(id);
      expect(creature.stats.hp).toBeGreaterThan(0);
      expect(creature.actions.length).toBeGreaterThan(0);
      expect(creature.visual.bodyShape).toBeDefined();
      expect(creature.xpReward).toBeGreaterThan(0);
    }
  });
});
