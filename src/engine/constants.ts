export const SCHEMA_VERSION = 1;

// --- Economy ---
export const STARTING_GOLD = 50;
export const STARTING_FOOD = 50;
export const STARTING_WATER = 30;
export const STARTING_TORCHES = 10;

export const SUPPLY_COST = { food: 5, water: 5, torches: 3 } as const;
export const HERO_HIRE_COST = { min: 20, max: 45 } as const;

// --- Dungeon ---
export const STEPS_PER_SUPPLY = 3; // consume 1 food/water/torch every N steps
export const TORCH_VISIBILITY = 4; // tiles visible with torch
export const DARK_VISIBILITY = 1; // tiles visible without torch
export const STEP_TWEEN_MS = 250;

// --- Combat ---
export const STARVATION_DAMAGE = 3; // damage per round without food/water
export const BASE_FLEE_CHANCE = 0.5;

// --- Heroes ---
export const MAX_PARTY_SIZE = 4;
export const XP_PER_LEVEL = 100; // XP needed = level * XP_PER_LEVEL
export const TAVERN_ROSTER_SIZE = 4;

export const STAT_GROWTH: Record<string, { str: number; dex: number; int: number; wis: number }> = {
  warrior: { str: 3, dex: 1, int: 0, wis: 1 },
  rogue:   { str: 1, dex: 3, int: 1, wis: 0 },
  mage:    { str: 0, dex: 1, int: 3, wis: 1 },
};

export const BASE_STATS: Record<string, { hp: number; attack: number; defense: number; speed: number; str: number; dex: number; int: number; wis: number }> = {
  warrior: { hp: 30, attack: 8, defense: 6, speed: 4, str: 10, dex: 5, int: 3, wis: 5 },
  rogue:   { hp: 22, attack: 6, defense: 4, speed: 8, str: 5, dex: 10, int: 5, wis: 3 },
  mage:    { hp: 18, attack: 4, defense: 3, speed: 5, str: 3, dex: 5, int: 10, wis: 5 },
};

// --- Enemy Scaling ---
export const FLOOR_SCALING = {
  hpBonus: 8,
  attackBonus: 2,
  goldBonus: 3,
  speedBonus: 1,
};
