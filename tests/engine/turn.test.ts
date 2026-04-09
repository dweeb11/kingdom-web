import { describe, it, expect } from 'vitest';
import { resolveTurn } from '../../src/engine/turn';
import { createInitialState } from '../../src/engine/state';
import { getFacingDelta } from '../../src/engine/dungeon';
import type { GameState } from '../../src/engine/types';

function makeForwardTilePassable(state: GameState): void {
  if (!state.dungeon) return;
  const dungeon = state.dungeon;
  const floor = dungeon.floors[dungeon.currentFloor];
  dungeon.playerPosition = { x: 3, y: 3 };
  dungeon.playerFacing = 'N';

  const delta = getFacingDelta(dungeon.playerFacing);
  const target = { x: dungeon.playerPosition.x + delta.x, y: dungeon.playerPosition.y + delta.y };
  floor.grid.tiles[target.y][target.x] = { type: 'floor', visible: false, visited: false };
}

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
    expect(s.dungeon!.floors[0].grid.tiles[s.dungeon!.playerPosition.y][s.dungeon!.playerPosition.x].visited).toBe(true);
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
    makeForwardTilePassable(s);

    const floor = s.dungeon!.floors[s.dungeon!.currentFloor];
    const delta = getFacingDelta(s.dungeon!.playerFacing);
    const target = {
      x: s.dungeon!.playerPosition.x + delta.x,
      y: s.dungeon!.playerPosition.y + delta.y,
    };
    floor.enemies = [{
      id: 'test_enemy',
      creatureTypeId: 'shadow_rat',
      position: target,
      currentHp: 8,
    }];

    s = resolveTurn(s, { type: 'MOVE', direction: 'forward' });
    expect(s.screen).toBe('combat');
    expect(s.combat).not.toBeNull();
    expect(s.combat!.enemyIds.length).toBe(1);
  });
});

describe('starvation', () => {
  it('deals damage to party heroes when food is 0', () => {
    let s = createInitialState();
    s = resolveTurn(s, { type: 'NEW_GAME' });

    const heroId = s.kingdom.tavernRoster[0].id;
    s = resolveTurn(s, { type: 'HIRE_HERO', heroId });
    s = resolveTurn(s, { type: 'ENTER_DUNGEON' });
    makeForwardTilePassable(s);

    const heroBefore = s.kingdom.heroRoster.find(h => h.id === heroId)!;
    const hpBefore = heroBefore.stats.hp;

    // Drain food to 0, clear enemies so we don't trigger combat
    s.kingdom.resources.food = 0;
    s.dungeon!.floors[s.dungeon!.currentFloor].enemies = [];

    // Move forward — should take starvation damage
    s = resolveTurn(s, { type: 'MOVE', direction: 'forward' });

    const heroAfter = s.kingdom.heroRoster.find(h => h.id === heroId)!;
    expect(heroAfter.stats.hp).toBeLessThan(hpBefore);
  });

  it('forces retreat when all party heroes die from starvation', () => {
    let s = createInitialState();
    s = resolveTurn(s, { type: 'NEW_GAME' });

    const heroId = s.kingdom.tavernRoster[0].id;
    s = resolveTurn(s, { type: 'HIRE_HERO', heroId });
    s = resolveTurn(s, { type: 'ENTER_DUNGEON' });
    makeForwardTilePassable(s);

    // Set hero to 1 HP, drain food
    s.kingdom.heroRoster = s.kingdom.heroRoster.map(h =>
      h.id === heroId ? { ...h, stats: { ...h.stats, hp: 1 } } : h
    );
    s.kingdom.resources.food = 0;
    s.dungeon!.floors[s.dungeon!.currentFloor].enemies = [];

    s = resolveTurn(s, { type: 'MOVE', direction: 'forward' });

    expect(s.screen).toBe('run_summary');
    expect(s.dungeon).toBeNull();
  });
});
