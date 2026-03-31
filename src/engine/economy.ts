import type { KingdomResources } from './types';
import { SUPPLY_COST, STEPS_PER_SUPPLY, HERO_HIRE_COST, FLOOR_SCALING } from './constants';

export function canAfford(resources: KingdomResources, cost: number): boolean {
  return resources.gold >= cost;
}

export function spendGold(resources: KingdomResources, cost: number): KingdomResources {
  if (!canAfford(resources, cost)) return resources;
  return { ...resources, gold: resources.gold - cost };
}

export function buySupplies(
  resources: KingdomResources,
  item: 'food' | 'water' | 'torches',
  quantity: number,
): KingdomResources {
  const totalCost = SUPPLY_COST[item] * quantity;
  if (!canAfford(resources, totalCost)) return resources;

  return {
    ...resources,
    gold: resources.gold - totalCost,
    [item]: resources[item] + quantity,
  };
}

export function consumeSupplies(resources: KingdomResources, stepsTaken: number): KingdomResources {
  const consumed = Math.floor(stepsTaken / STEPS_PER_SUPPLY);
  if (consumed === 0) return resources;

  return {
    ...resources,
    food: Math.max(0, resources.food - consumed),
    water: Math.max(0, resources.water - consumed),
    torches: Math.max(0, resources.torches - consumed),
  };
}

export function calculateLoot(
  goldDrop: { min: number; max: number },
  floorNumber: number,
): number {
  const bonus = floorNumber * FLOOR_SCALING.goldBonus;
  const min = goldDrop.min + bonus;
  const max = goldDrop.max + bonus;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateHireCost(): number {
  return Math.floor(
    Math.random() * (HERO_HIRE_COST.max - HERO_HIRE_COST.min + 1)
  ) + HERO_HIRE_COST.min;
}
