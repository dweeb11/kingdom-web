// --- Directions & Grid ---
export type Direction = 'N' | 'S' | 'E' | 'W';

export interface Position {
  x: number;
  y: number;
}

// --- Dungeon ---
export type TileType = 'wall' | 'floor' | 'door' | 'stairs_down' | 'stairs_up' | 'entrance';

export interface DungeonTile {
  type: TileType;
  visible: boolean;
  visited: boolean;
}

export interface DungeonGrid {
  width: number;
  height: number;
  tiles: DungeonTile[][];
}

export interface EnemyInstance {
  id: string;
  creatureTypeId: string;
  position: Position;
  currentHp: number;
  patrolRoute?: Position[];
  patrolIndex?: number;
}

export interface DungeonFloor {
  grid: DungeonGrid;
  enemies: EnemyInstance[];
  floorNumber: number;
}

export interface DungeonState {
  floors: DungeonFloor[];
  currentFloor: number;
  playerPosition: Position;
  playerFacing: Direction;
}

// --- Heroes ---
export type HeroClass = 'warrior' | 'rogue' | 'mage';

export interface HeroStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  str: number;
  dex: number;
  int: number;
  wis: number;
}

export interface GearItem {
  id: string;
  name: string;
  slot: 'weapon' | 'armor';
  attackBonus: number;
  defenseBonus: number;
  proficiencies: HeroClass[];
}

export interface Hero {
  id: string;
  name: string;
  heroClass: HeroClass;
  level: number;
  xp: number;
  stats: HeroStats;
  weapon: GearItem | null;
  armor: GearItem | null;
  alive: boolean;
}

// --- Creatures ---
export type MovementBehavior = 'stationary' | 'patrol' | 'wander' | 'hunt' | 'flee' | 'pack';

export type CombatActionType = 'melee' | 'ranged' | 'buff_allies' | 'debuff_party' | 'heal_self' | 'summon';

export interface CombatActionDef {
  type: CombatActionType;
  damage: number;
  range: number;
  cooldown: number;
  name: string;
}

export type BodyShape = 'humanoid' | 'arachnid' | 'serpentine' | 'amorphous' | 'winged';

export interface CreatureVisual {
  bodyShape: BodyShape;
  features: string[]; // 'horns', 'fangs', 'claws', 'tail', 'wings', etc.
  lineWeight: number; // 1-3, conveys size/threat
  hatchDensity: number; // 0-1, cross-hatching density
}

export interface CreatureType {
  id: string;
  name: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  movement: MovementBehavior;
  detectionRange: number;
  fleeThreshold: number; // HP percentage to trigger flee behavior
  actions: CombatActionDef[];
  visual: CreatureVisual;
  goldDrop: { min: number; max: number };
  xpReward: number;
}

// --- Combat ---
export type CombatantType = 'hero' | 'enemy';

export interface Combatant {
  type: CombatantType;
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
}

export type PlayerAction =
  | { type: 'attack'; targetId: string }
  | { type: 'defend' }
  | { type: 'flee' };

export interface CombatState {
  combatants: Combatant[];
  turnOrder: string[]; // combatant IDs in initiative order
  currentTurnIndex: number;
  round: number;
  log: string[];
  resolved: boolean;
  playerFled: boolean;
  enemyIds: string[];
  heroIds: string[];
}

// --- Kingdom ---
export interface KingdomResources {
  gold: number;
  food: number;
  water: number;
  torches: number;
}

export interface KingdomState {
  resources: KingdomResources;
  buildings: string[]; // building IDs that are constructed
  tavernRoster: Hero[];
  heroRoster: Hero[]; // hired heroes
}

// --- Top-Level State ---
export type Screen = 'title' | 'kingdom' | 'dungeon' | 'combat' | 'run_summary';

export interface RunSummaryData {
  goldEarned: number;
  xpEarned: number;
  enemiesDefeated: number;
  heroesLost: string[];
  loot: GearItem[];
}

export interface GameState {
  screen: Screen;
  kingdom: KingdomState;
  dungeon: DungeonState | null;
  combat: CombatState | null;
  party: string[]; // hero IDs selected for current run
  runSummary: RunSummaryData | null;
  schemaVersion: number;
}

// --- Actions ---
export type GameAction =
  | { type: 'NEW_GAME' }
  | { type: 'NAVIGATE'; screen: Screen }
  | { type: 'HIRE_HERO'; heroId: string }
  | { type: 'SELECT_PARTY'; heroIds: string[] }
  | { type: 'BUY_SUPPLIES'; item: 'food' | 'water' | 'torches'; quantity: number }
  | { type: 'BUY_GEAR'; gearId: string; heroId: string }
  | { type: 'SELL_GEAR'; heroId: string; slot: 'weapon' | 'armor' }
  | { type: 'ENTER_DUNGEON' }
  | { type: 'MOVE'; direction: 'forward' | 'backward' | 'turn_left' | 'turn_right' }
  | { type: 'DESCEND_FLOOR' }
  | { type: 'RETREAT' }
  | { type: 'COMBAT_ACTION'; action: PlayerAction; heroId: string }
  | { type: 'END_RUN' };
