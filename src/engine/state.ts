import type { GameState, Hero, HeroClass } from './types';
import {
  SCHEMA_VERSION,
  STARTING_GOLD,
  STARTING_FOOD,
  STARTING_WATER,
  STARTING_TORCHES,
  TAVERN_ROSTER_SIZE,
  BASE_STATS,
  HERO_HIRE_COST,
} from './constants';

let nextId = 1;
function genId(prefix: string): string {
  return `${prefix}_${nextId++}`;
}

const FIRST_NAMES = [
  'Aldric', 'Brenna', 'Cedric', 'Dahlia', 'Edric', 'Freya',
  'Gareth', 'Helena', 'Ingrid', 'Jareth', 'Kira', 'Leoric',
  'Mira', 'Nolan', 'Orla', 'Petra', 'Quinn', 'Rowan',
  'Sable', 'Theron', 'Una', 'Voss', 'Wren', 'Xara',
];

const CLASSES: HeroClass[] = ['warrior', 'rogue', 'mage'];

export function generateHero(): Hero {
  const heroClass = CLASSES[Math.floor(Math.random() * CLASSES.length)];
  const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const base = BASE_STATS[heroClass];

  return {
    id: genId('hero'),
    name,
    heroClass,
    level: 1,
    xp: 0,
    stats: {
      hp: base.hp,
      maxHp: base.hp,
      attack: base.attack,
      defense: base.defense,
      speed: base.speed,
      str: base.str,
      dex: base.dex,
      int: base.int,
      wis: base.wis,
    },
    weapon: null,
    armor: null,
    alive: true,
    hireCost: Math.floor(Math.random() * (HERO_HIRE_COST.max - HERO_HIRE_COST.min + 1)) + HERO_HIRE_COST.min,
  };
}

export function generateTavernRoster(): Hero[] {
  return Array.from({ length: TAVERN_ROSTER_SIZE }, () => generateHero());
}

export function createInitialState(): GameState {
  return {
    screen: 'title',
    kingdom: {
      resources: {
        gold: STARTING_GOLD,
        food: STARTING_FOOD,
        water: STARTING_WATER,
        torches: STARTING_TORCHES,
      },
      buildings: ['tavern', 'gate', 'general_store'],
      tavernRoster: generateTavernRoster(),
      heroRoster: [],
    },
    dungeon: null,
    combat: null,
    party: [],
    runSummary: null,
    schemaVersion: SCHEMA_VERSION,
  };
}
