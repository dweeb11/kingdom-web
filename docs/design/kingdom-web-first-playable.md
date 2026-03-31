# Kingdom Web — First Playable Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable web-based kingdom management / first-person dungeon crawler with vector line-art noir visuals and data-driven creature system.

**Architecture:** Pure engine layer (zero DOM deps, `resolveTurn(state, action) → newState`) with Canvas 2D dungeon renderer, inline SVG creature rendering, and Svelte 5 UI panels. Follows hexcrawler's proven pattern of isolated game logic with a separate rendering layer.

**Tech Stack:** TypeScript, Vite, Svelte 5, Canvas 2D, SVG, Vitest

**Spec:** `docs/specs/2026-03-30-kingdom-web-design.md`

---

## File Map

```
kingdom-web/
  package.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  vitest.config.ts
  index.html
  svelte.config.js
  src/
    app.ts                    # Game loop, screen manager, Svelte mount
    main.ts                   # Entry point — creates canvas, mounts app
    style.css                 # Global noir theme styles
    engine/
      types.ts                # All game types (GameState, Hero, Creature, Dungeon, etc.)
      constants.ts            # Balance tuning values (costs, rates, stat curves)
      state.ts                # createInitialState(), state factory
      dungeon.ts              # Grid, movement, visibility, fog of war
      heroes.ts               # Hero generation, leveling, gear equipping
      creatures.ts            # Creature definitions, movement behaviors
      combat.ts               # Initiative queue, damage calc, enemy AI, round resolution
      economy.ts              # Resource spending, loot rewards, "no dead end" validation
      turn.ts                 # resolveTurn(state, action) → newState — top-level dispatcher
      save.ts                 # serialize/deserialize with schema version + migration
    renderer/
      dungeon/
        projection.ts         # Pre-calculated wall segment positions for each facing
        walls.ts              # Canvas 2D line-art wall drawing
        effects.ts            # Torchlight gradients, fog, darkness overlay
        creatures.ts          # Position and scale SVG creatures in dungeon view
        index.ts              # renderDungeon(ctx, state) — orchestrates all dungeon drawing
      kingdom/
        skyline.ts            # Canvas/SVG line-art kingdom panorama
      creatures/
        templates.ts          # Body shape SVG generators (humanoid, arachnid, amorphous, etc.)
        features.ts           # Feature overlay SVG (horns, fangs, claws, wings, markings)
        composer.ts           # Assemble CreatureVisual config → complete SVG element
    ui/
      App.svelte              # Root component — screen router
      kingdom/
        KingdomScreen.svelte  # Skyline hub + building panel container
        Tavern.svelte         # Hero hiring panel
        Gate.svelte           # Party selection + launch panel
        GeneralStore.svelte   # Buy/sell supplies and gear
        ResourceBar.svelte    # Persistent resource display header
      dungeon/
        DungeonScreen.svelte  # Canvas mount + HUD overlay container
        CombatHud.svelte      # Initiative queue, action menu, HP bars
        DungeonHud.svelte     # Party status, supplies, minimap placeholder
      shared/
        HeroCard.svelte       # Hero stat block with SVG portrait
        Modal.svelte          # Reusable modal overlay
      screens/
        TitleScreen.svelte    # Title screen with new game / continue
        RunSummary.svelte     # Post-dungeon results
    lib/
      input.ts                # Keyboard event handler, action mapping
      tween.ts                # Simple interpolation utility for step animation
      dom.ts                  # Safe DOM helper utilities
    data/
      dungeons/
        floor1.ts             # Hand-authored dungeon layout (floor 1)
        floor2.ts             # Hand-authored dungeon layout (floor 2)
        floor3.ts             # Hand-authored dungeon layout (floor 3)
      creatures.ts            # All creature type configs (the 8 enemy types)
      gear.ts                 # Weapon and armor definitions
  tests/
    engine/
      dungeon.test.ts
      heroes.test.ts
      creatures.test.ts
      combat.test.ts
      economy.test.ts
      turn.test.ts
      save.test.ts
      state.test.ts
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`, `svelte.config.js`, `index.html`, `src/main.ts`, `src/style.css`, `.gitignore`

- [ ] **Step 1: Initialize the project with Vite + Svelte + TypeScript**

```bash
cd /Users/davidpaolone-webb/projects/games/kingdom-web
npm create vite@latest . -- --template svelte-ts
```

When prompted about the non-empty directory, choose to proceed (ignore existing files).

- [ ] **Step 2: Install dev dependencies**

```bash
npm install
npm install -D vitest
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 4: Add test script to package.json**

Add to `"scripts"` in `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Replace src/main.ts with minimal entry point**

```typescript
// src/main.ts
import './style.css';

const app = document.getElementById('app');
if (app) {
  app.textContent = 'Kingdom Web';
}
```

- [ ] **Step 6: Replace src/style.css with noir theme base**

```css
/* src/style.css */
:root {
  --bg-primary: #080808;
  --bg-secondary: #0e0e14;
  --bg-panel: #12121e;
  --line-bright: #c0c0c0;
  --line-mid: #808080;
  --line-dim: #404040;
  --accent-orange: #ff8c00;
  --accent-red: #ff4444;
  --accent-gold: #ffd700;
  --text-primary: #c0c0c0;
  --text-secondary: #808080;
  --font-mono: 'Courier New', Courier, monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-mono);
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 7: Verify the dev server runs**

```bash
npm run dev
```

Expected: Vite dev server starts, browser shows "Kingdom Web" on a near-black background.

- [ ] **Step 8: Write and run a smoke test**

Create `tests/smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs tests in node', () => {
    expect(1 + 1).toBe(2);
  });
});
```

```bash
npm test
```

Expected: 1 test passes.

- [ ] **Step 9: Update .gitignore**

Append to `.gitignore` (don't overwrite — Vite template creates one):

```
.superpowers/
```

- [ ] **Step 10: Create safe DOM helper utilities**

```typescript
// src/lib/dom.ts

/**
 * Safely set SVG content on an element by parsing it as XML first.
 * Only use with internally-generated SVG strings — never with user input.
 */
export function setSvgContent(container: HTMLElement, svgString: string): void {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    container.textContent = '[SVG render error]';
    return;
  }
  container.replaceChildren(doc.documentElement);
}

/**
 * Clear all children from an element safely.
 */
export function clearChildren(element: HTMLElement): void {
  element.replaceChildren();
}
```

- [ ] **Step 11: Initialize git and commit**

```bash
git init
git add -A
git commit -m "feat: scaffold project — Vite + Svelte 5 + TypeScript + Vitest"
```

---

## Task 2: Core Types and Game State

**Files:**
- Create: `src/engine/types.ts`, `src/engine/constants.ts`, `src/engine/state.ts`
- Test: `tests/engine/state.test.ts`

- [ ] **Step 1: Write the types file**

```typescript
// src/engine/types.ts

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
```

- [ ] **Step 2: Write the constants file**

```typescript
// src/engine/constants.ts

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
```

- [ ] **Step 3: Write failing tests for state factory**

```typescript
// tests/engine/state.test.ts
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
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `createInitialState` not found.

- [ ] **Step 5: Implement state.ts**

```typescript
// src/engine/state.ts
import type { GameState, Hero, HeroClass } from './types';
import {
  SCHEMA_VERSION,
  STARTING_GOLD,
  STARTING_FOOD,
  STARTING_WATER,
  STARTING_TORCHES,
  TAVERN_ROSTER_SIZE,
  BASE_STATS,
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
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm test
```

Expected: All 4 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/engine/types.ts src/engine/constants.ts src/engine/state.ts src/lib/dom.ts tests/engine/state.test.ts
git commit -m "feat: core types, constants, and initial state factory"
```

---

## Task 3: Dungeon Grid Engine

**Files:**
- Create: `src/engine/dungeon.ts`
- Test: `tests/engine/dungeon.test.ts`

- [ ] **Step 1: Write failing tests for dungeon movement and visibility**

```typescript
// tests/engine/dungeon.test.ts
import { describe, it, expect } from 'vitest';
import {
  createDungeonState,
  moveForward,
  moveBackward,
  turnLeft,
  turnRight,
  getVisibleTiles,
  moveEnemies,
  getFacingDelta,
} from '../../src/engine/dungeon';
import type { DungeonFloor, Position, Direction, EnemyInstance } from '../../src/engine/types';

function makeFloor(width: number, height: number, openTiles: Position[]): DungeonFloor {
  const tiles = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      type: openTiles.some(p => p.x === x && p.y === y) ? 'floor' as const : 'wall' as const,
      visible: false,
      visited: false,
    }))
  );
  return { grid: { width, height, tiles }, enemies: [], floorNumber: 1 };
}

describe('getFacingDelta', () => {
  it('returns correct deltas for each direction', () => {
    expect(getFacingDelta('N')).toEqual({ x: 0, y: -1 });
    expect(getFacingDelta('S')).toEqual({ x: 0, y: 1 });
    expect(getFacingDelta('E')).toEqual({ x: 1, y: 0 });
    expect(getFacingDelta('W')).toEqual({ x: -1, y: 0 });
  });
});

describe('turning', () => {
  it('turns left through all four directions', () => {
    expect(turnLeft('N')).toBe('W');
    expect(turnLeft('W')).toBe('S');
    expect(turnLeft('S')).toBe('E');
    expect(turnLeft('E')).toBe('N');
  });

  it('turns right through all four directions', () => {
    expect(turnRight('N')).toBe('E');
    expect(turnRight('E')).toBe('S');
    expect(turnRight('S')).toBe('W');
    expect(turnRight('W')).toBe('N');
  });
});

describe('moveForward', () => {
  const floor = makeFloor(5, 5, [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
    { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
    { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 },
  ]);

  it('moves the player forward into a floor tile', () => {
    const pos: Position = { x: 2, y: 2 };
    const result = moveForward(pos, 'N', floor);
    expect(result).toEqual({ x: 2, y: 1 });
  });

  it('blocks movement into a wall', () => {
    const pos: Position = { x: 1, y: 1 };
    const result = moveForward(pos, 'N', floor);
    expect(result).toEqual({ x: 1, y: 1 }); // unchanged
  });

  it('blocks movement out of bounds', () => {
    const pos: Position = { x: 1, y: 1 };
    const result = moveForward(pos, 'W', floor);
    expect(result).toEqual({ x: 1, y: 1 }); // wall at 0,1
  });
});

describe('moveBackward', () => {
  const floor = makeFloor(5, 5, [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
    { x: 2, y: 2 },
  ]);

  it('moves backward (opposite of facing)', () => {
    const pos: Position = { x: 2, y: 1 };
    const result = moveBackward(pos, 'N', floor);
    expect(result).toEqual({ x: 2, y: 2 });
  });
});

describe('getVisibleTiles', () => {
  const floor = makeFloor(7, 7, [
    { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
    { x: 3, y: 4 }, { x: 3, y: 5 },
  ]);

  it('returns tiles up to visibility range in facing direction', () => {
    const visible = getVisibleTiles({ x: 3, y: 5 }, 'N', floor, 3);
    const positions = visible.map(t => t.position);
    expect(positions).toContainEqual({ x: 3, y: 4 });
    expect(positions).toContainEqual({ x: 3, y: 3 });
    expect(positions).toContainEqual({ x: 3, y: 2 });
  });

  it('stops at walls', () => {
    const visible = getVisibleTiles({ x: 3, y: 5 }, 'N', floor, 10);
    const positions = visible.map(t => t.position);
    // Should see y=4,3,2,1 but stop at the wall at y=0
    expect(positions.length).toBeLessThanOrEqual(4);
  });
});

describe('moveEnemies', () => {
  it('moves a patrol enemy along its route', () => {
    const enemy: EnemyInstance = {
      id: 'e1',
      creatureTypeId: 'sentinel',
      position: { x: 1, y: 1 },
      currentHp: 30,
      patrolRoute: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
      patrolIndex: 0,
    };
    const floor = makeFloor(5, 5, [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
    ]);
    floor.enemies = [enemy];

    const creatureTypes = {
      sentinel: { movement: 'patrol' as const, detectionRange: 0, fleeThreshold: 0 },
    };

    const result = moveEnemies(floor, { x: 4, y: 4 }, creatureTypes);
    expect(result.enemies[0].position).toEqual({ x: 2, y: 1 });
    expect(result.enemies[0].patrolIndex).toBe(1);
  });

  it('moves a hunt enemy toward the player', () => {
    const enemy: EnemyInstance = {
      id: 'e2',
      creatureTypeId: 'stalker',
      position: { x: 3, y: 3 },
      currentHp: 40,
    };
    const floor = makeFloor(5, 5, [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 },
      { x: 2, y: 3 }, { x: 3, y: 3 },
    ]);
    floor.enemies = [enemy];

    const creatureTypes = {
      stalker: { movement: 'hunt' as const, detectionRange: 5, fleeThreshold: 0 },
    };

    const result = moveEnemies(floor, { x: 1, y: 1 }, creatureTypes);
    // Should move one step closer to player
    expect(
      Math.abs(result.enemies[0].position.x - 1) + Math.abs(result.enemies[0].position.y - 1)
    ).toBeLessThan(
      Math.abs(3 - 1) + Math.abs(3 - 1)
    );
  });

  it('does not move a stationary enemy', () => {
    const enemy: EnemyInstance = {
      id: 'e3',
      creatureTypeId: 'guard',
      position: { x: 2, y: 2 },
      currentHp: 30,
    };
    const floor = makeFloor(5, 5, [{ x: 2, y: 2 }]);
    floor.enemies = [enemy];

    const creatureTypes = {
      guard: { movement: 'stationary' as const, detectionRange: 0, fleeThreshold: 0 },
    };

    const result = moveEnemies(floor, { x: 1, y: 1 }, creatureTypes);
    expect(result.enemies[0].position).toEqual({ x: 2, y: 2 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- tests/engine/dungeon.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement dungeon.ts**

```typescript
// src/engine/dungeon.ts
import type { Position, Direction, DungeonFloor, DungeonState, TileType, EnemyInstance } from './types';

export function getFacingDelta(facing: Direction): Position {
  switch (facing) {
    case 'N': return { x: 0, y: -1 };
    case 'S': return { x: 0, y: 1 };
    case 'E': return { x: 1, y: 0 };
    case 'W': return { x: -1, y: 0 };
  }
}

export function turnLeft(facing: Direction): Direction {
  const order: Direction[] = ['N', 'W', 'S', 'E'];
  return order[(order.indexOf(facing) + 1) % 4];
}

export function turnRight(facing: Direction): Direction {
  const order: Direction[] = ['N', 'E', 'S', 'W'];
  return order[(order.indexOf(facing) + 1) % 4];
}

function isPassable(floor: DungeonFloor, pos: Position): boolean {
  if (pos.x < 0 || pos.y < 0 || pos.x >= floor.grid.width || pos.y >= floor.grid.height) {
    return false;
  }
  const tile = floor.grid.tiles[pos.y][pos.x];
  return tile.type !== 'wall';
}

export function moveForward(position: Position, facing: Direction, floor: DungeonFloor): Position {
  const delta = getFacingDelta(facing);
  const next = { x: position.x + delta.x, y: position.y + delta.y };
  return isPassable(floor, next) ? next : position;
}

export function moveBackward(position: Position, facing: Direction, floor: DungeonFloor): Position {
  const delta = getFacingDelta(facing);
  const next = { x: position.x - delta.x, y: position.y - delta.y };
  return isPassable(floor, next) ? next : position;
}

export interface VisibleTile {
  position: Position;
  distance: number;
  tileType: TileType;
}

export function getVisibleTiles(
  position: Position,
  facing: Direction,
  floor: DungeonFloor,
  range: number,
): VisibleTile[] {
  const delta = getFacingDelta(facing);
  const tiles: VisibleTile[] = [];

  for (let i = 1; i <= range; i++) {
    const pos = { x: position.x + delta.x * i, y: position.y + delta.y * i };
    if (pos.x < 0 || pos.y < 0 || pos.x >= floor.grid.width || pos.y >= floor.grid.height) {
      break;
    }
    const tile = floor.grid.tiles[pos.y][pos.x];
    tiles.push({ position: pos, distance: i, tileType: tile.type });
    if (tile.type === 'wall') break;
  }

  return tiles;
}

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

interface CreatureMovementInfo {
  movement: string;
  detectionRange: number;
  fleeThreshold: number;
}

function movePatrol(enemy: EnemyInstance): EnemyInstance {
  if (!enemy.patrolRoute || enemy.patrolRoute.length === 0) return enemy;
  const nextIndex = ((enemy.patrolIndex ?? 0) + 1) % enemy.patrolRoute.length;
  return {
    ...enemy,
    position: enemy.patrolRoute[nextIndex],
    patrolIndex: nextIndex,
  };
}

function moveHunt(enemy: EnemyInstance, playerPos: Position, floor: DungeonFloor, range: number): EnemyInstance {
  if (manhattanDistance(enemy.position, playerPos) > range) return enemy;

  const candidates = [
    { x: enemy.position.x + 1, y: enemy.position.y },
    { x: enemy.position.x - 1, y: enemy.position.y },
    { x: enemy.position.x, y: enemy.position.y + 1 },
    { x: enemy.position.x, y: enemy.position.y - 1 },
  ].filter(pos => isPassable(floor, pos));

  const currentDist = manhattanDistance(enemy.position, playerPos);
  const best = candidates.reduce<Position | null>((closest, pos) => {
    const dist = manhattanDistance(pos, playerPos);
    if (dist < currentDist && (!closest || dist < manhattanDistance(closest, playerPos))) {
      return pos;
    }
    return closest;
  }, null);

  return best ? { ...enemy, position: best } : enemy;
}

function moveWander(enemy: EnemyInstance, floor: DungeonFloor): EnemyInstance {
  const candidates = [
    { x: enemy.position.x + 1, y: enemy.position.y },
    { x: enemy.position.x - 1, y: enemy.position.y },
    { x: enemy.position.x, y: enemy.position.y + 1 },
    { x: enemy.position.x, y: enemy.position.y - 1 },
  ].filter(pos => isPassable(floor, pos));

  if (candidates.length === 0) return enemy;
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return { ...enemy, position: chosen };
}

export function moveEnemies(
  floor: DungeonFloor,
  playerPos: Position,
  creatureTypes: Record<string, CreatureMovementInfo>,
): DungeonFloor {
  const movedEnemies = floor.enemies.map(enemy => {
    const info = creatureTypes[enemy.creatureTypeId];
    if (!info) return enemy;

    switch (info.movement) {
      case 'stationary':
        return enemy;
      case 'patrol':
        return movePatrol(enemy);
      case 'hunt':
        return moveHunt(enemy, playerPos, floor, info.detectionRange);
      case 'wander':
        return moveWander(enemy, floor);
      case 'flee': {
        const dist = manhattanDistance(enemy.position, playerPos);
        if (dist >= 5) return enemy;
        const candidates = [
          { x: enemy.position.x + 1, y: enemy.position.y },
          { x: enemy.position.x - 1, y: enemy.position.y },
          { x: enemy.position.x, y: enemy.position.y + 1 },
          { x: enemy.position.x, y: enemy.position.y - 1 },
        ].filter(pos => isPassable(floor, pos));
        const farthest = candidates.reduce<Position | null>((best, pos) => {
          if (!best) return pos;
          return manhattanDistance(pos, playerPos) > manhattanDistance(best, playerPos) ? pos : best;
        }, null);
        return farthest ? { ...enemy, position: farthest } : enemy;
      }
      case 'pack': {
        const allies = floor.enemies.filter(
          e => e.id !== enemy.id && e.creatureTypeId === enemy.creatureTypeId
        );
        if (allies.length === 0) return moveWander(enemy, floor);
        const nearest = allies.reduce((closest, ally) =>
          manhattanDistance(ally.position, enemy.position) < manhattanDistance(closest.position, enemy.position)
            ? ally : closest
        );
        if (manhattanDistance(enemy.position, nearest.position) <= 1) return enemy;
        return moveHunt(enemy, nearest.position, floor, 999);
      }
      default:
        return enemy;
    }
  });

  return { ...floor, enemies: movedEnemies };
}

export function checkEncounter(
  playerPos: Position,
  enemies: EnemyInstance[],
): EnemyInstance | null {
  return enemies.find(e => e.position.x === playerPos.x && e.position.y === playerPos.y) ?? null;
}

export function markVisited(floor: DungeonFloor, position: Position): DungeonFloor {
  const tile = floor.grid.tiles[position.y][position.x];
  if (tile.visited) return floor;

  const newTiles = floor.grid.tiles.map((row, y) =>
    row.map((t, x) =>
      x === position.x && y === position.y ? { ...t, visited: true } : t
    )
  );

  return {
    ...floor,
    grid: { ...floor.grid, tiles: newTiles },
  };
}

export function createDungeonState(floors: DungeonFloor[], startPos: Position): DungeonState {
  return {
    floors,
    currentFloor: 0,
    playerPosition: startPos,
    playerFacing: 'N',
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/engine/dungeon.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/engine/dungeon.ts tests/engine/dungeon.test.ts
git commit -m "feat: dungeon grid engine — movement, visibility, enemy behaviors"
```

---

## Tasks 4-15: Remaining Implementation

Due to the size of this plan, Tasks 4-15 follow the same TDD pattern established above. Each task builds one system layer:

| # | Task | Key Files | Tests |
|---|------|-----------|-------|
| 4 | Hero Engine | `src/engine/heroes.ts` | `tests/engine/heroes.test.ts` — levelUp, canEquip, equipGear, applyXp |
| 5 | Creature Definitions | `src/engine/creatures.ts`, `src/data/creatures.ts`, `src/data/gear.ts` | `tests/engine/creatures.test.ts` — getCreatureType, scaleForFloor, spawnEnemy |
| 6 | Combat Engine | `src/engine/combat.ts` | `tests/engine/combat.test.ts` — initCombat, buildTurnOrder, resolveAttack, resolveDefend, resolveFlee, advanceTurn |
| 7 | Economy Engine | `src/engine/economy.ts` | `tests/engine/economy.test.ts` — canAfford, spendGold, buySupplies, consumeSupplies, calculateLoot |
| 8 | Turn Resolver & Save | `src/engine/turn.ts`, `src/engine/save.ts` | `tests/engine/turn.test.ts`, `tests/engine/save.test.ts` — resolveTurn dispatching, serialize/deserialize round-trip |
| 9 | Dungeon Renderer | `src/renderer/dungeon/projection.ts`, `walls.ts`, `effects.ts`, `index.ts` | Visual verification — line-art noir corridor with perspective projection |
| 10 | Creature SVG Renderer | `src/renderer/creatures/templates.ts`, `features.ts`, `composer.ts`, `src/renderer/dungeon/creatures.ts` | Visual verification — composable field guide SVGs |
| 11 | Kingdom Skyline | `src/renderer/kingdom/skyline.ts` | Visual verification — line-art building panorama |
| 12 | Kingdom UI Panels | `src/ui/App.svelte`, `kingdom/*.svelte`, `shared/*.svelte` | Manual verification — title → kingdom → tavern/gate/store |
| 13 | Game Loop Integration | `src/ui/dungeon/*.svelte`, `src/ui/screens/*.svelte`, `src/data/dungeons/*.ts`, `src/lib/input.ts`, `src/lib/tween.ts` + update `turn.ts` with full resolution | Full loop: hire → enter dungeon → move → combat → retreat → return |
| 14 | Save/Load UI | `src/ui/screens/TitleScreen.svelte` + update `main.ts` | Continue, import JSON, export via dev console |
| 15 | Integration Test & Cleanup | Update `tests/engine/turn.test.ts` | End-to-end: new game → hire → enter → retreat → end run |

**Each task follows this pattern:**
1. Write failing tests (engine tasks) or create the component (UI tasks)
2. Run tests to confirm failure
3. Implement the minimal code
4. Run tests to confirm pass
5. Commit

**Key implementation details for each task** are documented in the spec at `docs/specs/2026-03-30-kingdom-web-design.md`. The implementing agent should reference the spec for:
- **Task 4 (Heroes):** `canEquip` checks class proficiency, `equipGear` replaces slot, `levelUp` uses `STAT_GROWTH` curves, `applyXp` handles multi-level-ups
- **Task 5 (Creatures):** 8 creature types with composable movement behaviors and combat actions, `scaleForFloor` applies `FLOOR_SCALING` bonuses, gear data in `src/data/gear.ts`
- **Task 6 (Combat):** `buildTurnOrder` sorts by speed desc, `initCombat` creates state from hero+enemy combatants, `resolveAttack` = `max(1, attack - defense)`, `resolveDefend` = +50% defense, `resolveFlee` uses `BASE_FLEE_CHANCE`, enemy AI targets lowest-HP hero
- **Task 7 (Economy):** `SUPPLY_COST` for food/water/torches, `consumeSupplies` decrements by 1 each, `calculateLoot` random in goldDrop range
- **Task 8 (Turn):** `resolveTurn` dispatches all `GameAction` types. `save.ts` stamps `SCHEMA_VERSION`, throws on mismatch. `saveToLocalStorage`/`loadFromLocalStorage` for persistence.
- **Task 9 (Dungeon Renderer):** Pre-calculated projection (not raycasting), walls drawn far-to-near (painter's algorithm), distance-based line opacity, torchlight as radial gradient, darkness vignette. Uses safe DOM utilities from `src/lib/dom.ts`.
- **Task 10 (Creature SVG):** Body templates (humanoid, arachnid, amorphous), feature overlays (horns, fangs, claws, etc.), cross-hatch overlay, red accent eyes. `composer.ts` assembles SVG string from `CreatureVisual` config. Uses `setSvgContent()` from `src/lib/dom.ts` instead of innerHTML.
- **Task 11 (Skyline):** Canvas drawing of building silhouettes at fixed positions, selection highlight with orange accent, star field background, ground line
- **Task 12 (UI):** Svelte 5 components using `$props()` and `$derived()` runes. Components receive state + onAction callback. ResourceBar, HeroCard, Tavern, Gate, GeneralStore, KingdomScreen.
- **Task 13 (Integration):** Hand-authored 10x10 grid floors in `src/data/dungeons/`. `turn.ts` expanded with full MOVE/COMBAT_ACTION/ENTER_DUNGEON/RETREAT/DESCEND_FLOOR/END_RUN resolution. `main.ts` uses Svelte mount with state + onAction props.
- **Task 14 (Save/Load):** TitleScreen with NEW GAME / CONTINUE / IMPORT. `main.ts` loads from localStorage on startup. Auto-save on kingdom/run_summary transitions. Export via `__exportSave()` on window.
- **Task 15 (Final):** Integration test for full game loop in `tests/engine/turn.test.ts`. `npm run build` for production verification.

---

## Summary

15 tasks, building from foundation to playable game:

| # | Task | What it builds |
|---|------|---------------|
| 1 | Project Scaffolding | Vite + Svelte + TS + Vitest |
| 2 | Core Types & State | GameState, types, constants, state factory |
| 3 | Dungeon Grid Engine | Movement, visibility, enemy movement behaviors |
| 4 | Hero Engine | Leveling, gear, XP |
| 5 | Creature Definitions | 8 enemy types, gear data, floor scaling |
| 6 | Combat Engine | Initiative queue, attack/defend/flee |
| 7 | Economy Engine | Gold, supplies, loot |
| 8 | Turn Resolver & Save | Top-level state transitions, persistence |
| 9 | Dungeon Renderer | Line-art noir walls, projection, lighting |
| 10 | Creature SVG Renderer | Composable field guide creatures |
| 11 | Kingdom Skyline | Line-art building panorama |
| 12 | Kingdom UI Panels | Tavern, Gate, Store, resource bar |
| 13 | Game Loop Integration | Dungeon screen, combat HUD, full loop |
| 14 | Save/Load UI | Title screen, continue, import/export |
| 15 | Integration Test | End-to-end verification, production build |
