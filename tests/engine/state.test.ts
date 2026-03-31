import { describe, it, expect } from 'vitest';
import { createInitialState } from '../../src/engine/state';
import { STARTING_GOLD, STARTING_FOOD, STARTING_WATER, STARTING_TORCHES, SCHEMA_VERSION, TAVERN_ROSTER_SIZE } from '../../src/engine/constants';

describe('createInitialState', () => {
  it('creates a valid initial game state', () => {
    const state = createInitialState();
    expect(state.screen).toBe('title');
    expect(state.kingdom.resources.gold).toBe(STARTING_GOLD);
    expect(state.kingdom.resources.food).toBe(STARTING_FOOD);
    expect(state.kingdom.resources.water).toBe(STARTING_WATER);
    expect(state.kingdom.resources.torches).toBe(STARTING_TORCHES);
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('starts with three buildings unlocked', () => {
    const state = createInitialState();
    expect(state.kingdom.buildings).toEqual(['tavern', 'gate', 'general_store']);
  });

  it('generates a tavern roster', () => {
    const state = createInitialState();
    expect(state.kingdom.tavernRoster.length).toBe(TAVERN_ROSTER_SIZE);
    for (const hero of state.kingdom.tavernRoster) {
      expect(['warrior', 'rogue', 'mage']).toContain(hero.heroClass);
      expect(hero.level).toBe(1);
      expect(hero.alive).toBe(true);
    }
  });

  it('starts with no dungeon or combat active', () => {
    const state = createInitialState();
    expect(state.dungeon).toBeNull();
    expect(state.combat).toBeNull();
    expect(state.party).toEqual([]);
  });
});
