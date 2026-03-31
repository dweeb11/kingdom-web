import type { Combatant, CombatState, PlayerAction } from './types';
import { BASE_FLEE_CHANCE } from './constants';

export function buildTurnOrder(combatants: Combatant[]): string[] {
  return [...combatants]
    .sort((a, b) => b.speed - a.speed)
    .map(c => c.id);
}

export function initCombat(heroes: Combatant[], enemies: Combatant[]): CombatState {
  const combatants = [...heroes, ...enemies];
  return {
    combatants,
    turnOrder: buildTurnOrder(combatants),
    currentTurnIndex: 0,
    round: 1,
    log: [],
    resolved: false,
    playerFled: false,
    heroIds: heroes.map(h => h.id),
    enemyIds: enemies.map(e => e.id),
  };
}

function checkResolved(state: CombatState): CombatState {
  const heroesAlive = state.combatants.some(c => state.heroIds.includes(c.id) && c.hp > 0);
  const enemiesAlive = state.combatants.some(c => state.enemyIds.includes(c.id) && c.hp > 0);

  if (!heroesAlive || !enemiesAlive) {
    return { ...state, resolved: true };
  }
  return state;
}

export function resolveAttack(state: CombatState, attackerId: string, targetId: string): CombatState {
  const attacker = state.combatants.find(c => c.id === attackerId);
  const target = state.combatants.find(c => c.id === targetId);
  if (!attacker || !target) return state;

  const damage = Math.max(1, attacker.attack - target.defense);
  const newHp = Math.max(0, target.hp - damage);

  const updatedCombatants = state.combatants.map(c =>
    c.id === targetId ? { ...c, hp: newHp } : c
  );

  const log = [...state.log, `${attacker.name} attacks ${target.name} for ${damage} damage`];

  return checkResolved({ ...state, combatants: updatedCombatants, log });
}

export function resolveDefend(state: CombatState, defenderId: string): CombatState {
  const defender = state.combatants.find(c => c.id === defenderId);
  if (!defender) return state;

  const bonus = Math.floor(defender.defense * 0.5);
  const updatedCombatants = state.combatants.map(c =>
    c.id === defenderId ? { ...c, defense: c.defense + bonus } : c
  );

  const log = [...state.log, `${defender.name} defends (+${bonus} defense)`];

  return { ...state, combatants: updatedCombatants, log };
}

export function resolveFlee(state: CombatState): CombatState {
  const success = Math.random() < BASE_FLEE_CHANCE;

  if (success) {
    return {
      ...state,
      playerFled: true,
      resolved: true,
      log: [...state.log, 'Party fled successfully!'],
    };
  }

  return {
    ...state,
    log: [...state.log, 'Failed to flee!'],
  };
}

export function advanceTurn(state: CombatState): CombatState {
  const nextIndex = state.currentTurnIndex + 1;
  if (nextIndex >= state.turnOrder.length) {
    return {
      ...state,
      currentTurnIndex: 0,
      round: state.round + 1,
    };
  }
  return { ...state, currentTurnIndex: nextIndex };
}

export function getCurrentCombatant(state: CombatState): Combatant | undefined {
  const id = state.turnOrder[state.currentTurnIndex];
  return state.combatants.find(c => c.id === id);
}

export function decideEnemyAction(state: CombatState, enemyId: string): PlayerAction {
  const aliveHeroes = state.combatants
    .filter(c => state.heroIds.includes(c.id) && c.hp > 0);

  if (aliveHeroes.length === 0) {
    return { type: 'defend' };
  }

  // Target lowest HP hero
  const target = aliveHeroes.reduce((lowest, hero) =>
    hero.hp < lowest.hp ? hero : lowest
  );

  return { type: 'attack', targetId: target.id };
}

export function heroToCombatant(hero: {
  id: string;
  name: string;
  stats: { hp: number; maxHp: number; attack: number; defense: number; speed: number };
  weapon?: { attackBonus: number } | null;
  armor?: { defenseBonus: number } | null;
}): Combatant {
  return {
    type: 'hero',
    id: hero.id,
    name: hero.name,
    hp: hero.stats.hp,
    maxHp: hero.stats.maxHp,
    attack: hero.stats.attack + (hero.weapon?.attackBonus ?? 0),
    defense: hero.stats.defense + (hero.armor?.defenseBonus ?? 0),
    speed: hero.stats.speed,
  };
}

export function enemyToCombatant(
  enemy: { id: string; currentHp: number },
  creatureType: { name: string; stats: { hp: number; attack: number; defense: number; speed: number } },
): Combatant {
  return {
    type: 'enemy',
    id: enemy.id,
    name: creatureType.name,
    hp: enemy.currentHp,
    maxHp: creatureType.stats.hp,
    attack: creatureType.stats.attack,
    defense: creatureType.stats.defense,
    speed: creatureType.stats.speed,
  };
}
