import { describe, it, expect } from 'vitest';
import { resolveTurn } from '../../src/engine/turn';
import { createInitialState } from '../../src/engine/state';
import type { GameState } from '../../src/engine/types';

describe('resolveTurn', () => {
  it('handles NEW_GAME by creating initial state at kingdom screen', () => {
    const state = createInitialState();
    const result = resolveTurn(state, { type: 'NEW_GAME' });
    expect(result.screen).toBe('kingdom');
  });

  it('handles NAVIGATE to change screens', () => {
    const state = { ...createInitialState(), screen: 'kingdom' as const };
    const result = resolveTurn(state, { type: 'NAVIGATE', screen: 'title' });
    expect(result.screen).toBe('title');
  });

  it('handles HIRE_HERO — moves hero from tavern to roster and spends gold', () => {
    const state = { ...createInitialState(), screen: 'kingdom' as const };
    const heroId = state.kingdom.tavernRoster[0].id;
    const result = resolveTurn(state, { type: 'HIRE_HERO', heroId });
    expect(result.kingdom.heroRoster.some(h => h.id === heroId)).toBe(true);
    expect(result.kingdom.tavernRoster.some(h => h.id === heroId)).toBe(false);
    expect(result.kingdom.resources.gold).toBeLessThan(state.kingdom.resources.gold);
  });

  it('handles BUY_SUPPLIES', () => {
    const state = { ...createInitialState(), screen: 'kingdom' as const };
    const result = resolveTurn(state, { type: 'BUY_SUPPLIES', item: 'food', quantity: 2 });
    expect(result.kingdom.resources.food).toBe(state.kingdom.resources.food + 2);
  });

  it('handles ENTER_DUNGEON', () => {
    const state = { ...createInitialState(), screen: 'kingdom' as const };
    const heroId = state.kingdom.tavernRoster[0].id;
    let s = resolveTurn(state, { type: 'HIRE_HERO', heroId });
    s = resolveTurn(s, { type: 'ENTER_DUNGEON' });
    expect(s.screen).toBe('dungeon');
    expect(s.dungeon).not.toBeNull();
    expect(s.dungeon!.floors.length).toBe(3);
  });

  it('handles RETREAT from dungeon', () => {
    const state = { ...createInitialState(), screen: 'kingdom' as const };
    const heroId = state.kingdom.tavernRoster[0].id;
    let s = resolveTurn(state, { type: 'HIRE_HERO', heroId });
    s = resolveTurn(s, { type: 'ENTER_DUNGEON' });
    s = resolveTurn(s, { type: 'RETREAT' });
    expect(s.screen).toBe('run_summary');
  });

  it('handles END_RUN — returns to kingdom', () => {
    const state = { ...createInitialState(), screen: 'kingdom' as const };
    const heroId = state.kingdom.tavernRoster[0].id;
    let s = resolveTurn(state, { type: 'HIRE_HERO', heroId });
    s = resolveTurn(s, { type: 'ENTER_DUNGEON' });
    s = resolveTurn(s, { type: 'RETREAT' });
    s = resolveTurn(s, { type: 'END_RUN' });
    expect(s.screen).toBe('kingdom');
    expect(s.dungeon).toBeNull();
    expect(s.party).toEqual([]);
  });
});

describe('full game loop', () => {
  it('new game → hire → enter dungeon → move → retreat → end run', () => {
    let s = createInitialState();
    s = resolveTurn(s, { type: 'NEW_GAME' });
    expect(s.screen).toBe('kingdom');

    // Hire a hero
    const heroId = s.kingdom.tavernRoster[0].id;
    s = resolveTurn(s, { type: 'HIRE_HERO', heroId });
    expect(s.kingdom.heroRoster.length).toBe(1);

    // Enter dungeon (all hired heroes go automatically)
    s = resolveTurn(s, { type: 'ENTER_DUNGEON' });
    expect(s.screen).toBe('dungeon');
    expect(s.dungeon).not.toBeNull();

    // Move forward (may or may not change position depending on facing)
    const posBefore = { ...s.dungeon!.playerPosition };
    s = resolveTurn(s, { type: 'MOVE', direction: 'forward' });
    // State should still be valid
    expect(s.dungeon).not.toBeNull();

    // Turn
    const facingBefore = s.dungeon!.playerFacing;
    s = resolveTurn(s, { type: 'MOVE', direction: 'turn_right' });
    expect(s.dungeon!.playerFacing).not.toBe(facingBefore);

    // Retreat
    s = resolveTurn(s, { type: 'RETREAT' });
    expect(s.screen).toBe('run_summary');

    // End run
    s = resolveTurn(s, { type: 'END_RUN' });
    expect(s.screen).toBe('kingdom');
    expect(s.dungeon).toBeNull();
    expect(s.combat).toBeNull();
    expect(s.party).toEqual([]);
  });
});

describe('encounter detection', () => {
  it('triggers combat when player walks onto an enemy tile', () => {
    let s = createInitialState();
    s = resolveTurn(s, { type: 'NEW_GAME' });

    const heroId = s.kingdom.tavernRoster[0].id;
    s = resolveTurn(s, { type: 'HIRE_HERO', heroId });
    s = resolveTurn(s, { type: 'ENTER_DUNGEON' });

    // Place a stationary enemy directly ahead of the player
    // Player starts at (1,8) facing N. (1,7) is floor.
    const floor = s.dungeon!.floors[s.dungeon!.currentFloor];
    floor.enemies = [{
      id: 'test_enemy',
      creatureTypeId: 'shadow_rat',
      position: { x: 1, y: 7 },
      currentHp: 8,
    }];

    // Move forward — should land on enemy and trigger combat
    s = resolveTurn(s, { type: 'MOVE', direction: 'forward' });
    expect(s.screen).toBe('combat');
    expect(s.combat).not.toBeNull();
    expect(s.combat!.enemyIds.length).toBe(1);
  });
});
