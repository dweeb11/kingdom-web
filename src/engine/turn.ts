import type { GameState, GameAction } from './types';
import { createInitialState } from './state';
import { buySupplies } from './economy';
import { calculateHireCost } from './economy';
import { canAfford, spendGold } from './economy';
import { canEquip, equipGear, unequipGear } from './heroes';
import { GEAR } from '../data/gear';
import { MAX_PARTY_SIZE } from './constants';

export function resolveTurn(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME': {
      const initial = createInitialState();
      return { ...initial, screen: 'kingdom' };
    }

    case 'NAVIGATE':
      return { ...state, screen: action.screen };

    case 'HIRE_HERO': {
      const hero = state.kingdom.tavernRoster.find(h => h.id === action.heroId);
      if (!hero) return state;

      const cost = calculateHireCost();
      if (!canAfford(state.kingdom.resources, cost)) return state;

      return {
        ...state,
        kingdom: {
          ...state.kingdom,
          resources: spendGold(state.kingdom.resources, cost),
          tavernRoster: state.kingdom.tavernRoster.filter(h => h.id !== action.heroId),
          heroRoster: [...state.kingdom.heroRoster, hero],
        },
      };
    }

    case 'SELECT_PARTY': {
      const validIds = action.heroIds
        .filter(id => state.kingdom.heroRoster.some(h => h.id === id && h.alive))
        .slice(0, MAX_PARTY_SIZE);
      return { ...state, party: validIds };
    }

    case 'BUY_SUPPLIES': {
      const newResources = buySupplies(
        state.kingdom.resources,
        action.item,
        action.quantity,
      );
      return {
        ...state,
        kingdom: { ...state.kingdom, resources: newResources },
      };
    }

    case 'BUY_GEAR': {
      const gear = GEAR[action.gearId];
      if (!gear) return state;
      const hero = state.kingdom.heroRoster.find(h => h.id === action.heroId);
      if (!hero || !canEquip(hero, gear)) return state;

      const cost = (gear.attackBonus + gear.defenseBonus) * 5; // simple pricing
      if (!canAfford(state.kingdom.resources, cost)) return state;

      const updatedHero = equipGear(hero, gear);
      return {
        ...state,
        kingdom: {
          ...state.kingdom,
          resources: spendGold(state.kingdom.resources, cost),
          heroRoster: state.kingdom.heroRoster.map(h =>
            h.id === action.heroId ? updatedHero : h
          ),
        },
      };
    }

    case 'SELL_GEAR': {
      const hero = state.kingdom.heroRoster.find(h => h.id === action.heroId);
      if (!hero) return state;

      const { hero: updatedHero, gear } = unequipGear(hero, action.slot);
      if (!gear) return state;

      const value = Math.floor((gear.attackBonus + gear.defenseBonus) * 2.5);
      return {
        ...state,
        kingdom: {
          ...state.kingdom,
          resources: { ...state.kingdom.resources, gold: state.kingdom.resources.gold + value },
          heroRoster: state.kingdom.heroRoster.map(h =>
            h.id === action.heroId ? updatedHero : h
          ),
        },
      };
    }

    case 'ENTER_DUNGEON':
    case 'MOVE':
    case 'DESCEND_FLOOR':
    case 'RETREAT':
    case 'COMBAT_ACTION':
    case 'END_RUN':
      // These will be implemented in Task 13 (Game Loop Integration)
      return state;

    default:
      return state;
  }
}
