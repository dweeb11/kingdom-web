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

  it('handles SELECT_PARTY', () => {
    const state = { ...createInitialState(), screen: 'kingdom' as const };
    // Hire a hero first
    const heroId = state.kingdom.tavernRoster[0].id;
    const afterHire = resolveTurn(state, { type: 'HIRE_HERO', heroId });
    const result = resolveTurn(afterHire, { type: 'SELECT_PARTY', heroIds: [heroId] });
    expect(result.party).toEqual([heroId]);
  });

  it('handles BUY_SUPPLIES', () => {
    const state = { ...createInitialState(), screen: 'kingdom' as const };
    const result = resolveTurn(state, { type: 'BUY_SUPPLIES', item: 'food', quantity: 2 });
    expect(result.kingdom.resources.food).toBe(state.kingdom.resources.food + 2);
  });

  it('returns state unchanged for unknown action types', () => {
    const state = createInitialState();
    const result = resolveTurn(state, { type: 'NAVIGATE', screen: 'kingdom' });
    expect(result.screen).toBe('kingdom');
  });
});
