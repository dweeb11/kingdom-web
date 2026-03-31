# Kingdom Web — Design Spec

**Date:** 2026-03-30
**Status:** Approved
**Purpose:** Design lab for Kingdom Crawler — explore game systems with more depth in a web-based environment, using programmatic art instead of pixel art. Lessons learned feed back into the Godot version.

---

## 1. Core Identity

Kingdom Web is a **web-based hybrid kingdom management / first-person grid-based dungeon crawler**. It shares Kingdom Crawler's core design (kingdom management between dungeon runs, turn-based combat, permadeath, survival resources) but reimagines the presentation with programmatic vector art and targets browser play.

**This is not a port.** It's a parallel exploration of the same design space with different constraints and a different visual identity.

### Design Pillars

1. **Systems depth** — every major system (economy, combat, heroes, creatures, kingdom) is an opportunity to explore more depth than the Godot version
2. **Programmatic art** — zero external art assets. All visuals generated from code (SVG, Canvas 2D, shaders)
3. **Returnability** — the codebase should be easy to pick up after weeks away, following the same patterns as hexcrawler and text-adventure-engine
4. **Fun to experiment with** — this is a lab, not a product. Bias toward trying things.

---

## 2. Visual Style

### Dungeon: Vector Line-Art Noir

- Near-black background (`#080808`)
- Walls, floors, and ceilings rendered as line segments in light gray (`#c0c0c0`), fading with distance
- Interactive elements use accent colors: orange (torches, doors), red (enemies, danger)
- Torchlight as radial gradient overlays bleeding onto nearby wall lines
- Darkness is meaningful: without a torch, visibility drops to 1 tile. Creature eyes (always red) are visible even in total darkness.

### Creatures: Naturalist Field Guide

- Creatures rendered as SVG illustrations in the style of a naturalist's field journal
- Careful outlines, cross-hatching for shading, annotation marks
- Joint markers on arthropods, question marks on unknown features
- Composable SVG parts: body templates + feature overlays (horns, wings, tails, markings)
- Red accent eyes consistent across all creature types

### Kingdom: Line-Art Skyline + Panels

- Hub view is a line-art panorama — building silhouettes along a skyline, growing as you construct
- Clicking a building opens a dedicated Svelte panel for interaction
- Resource bar always visible as a ledger-style header (monospace numbers, ruled lines)
- Noir palette throughout: dark backgrounds, light line work, accent colors for interactables

### Heroes: Programmatic Portraits

- Hero cards styled as journal entries with SVG line-art portraits
- Portraits assembled from composable parts: body type from class, distinguishing features derived from name seed
- Dead heroes get a ruled line through their entry and a date — the roster is a chronicle

---

## 3. Technical Architecture

### Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | TypeScript | Consistent with hexcrawler and text-adventure-engine |
| Bundler | Vite | Proven, fast, used in hexcrawler |
| Dungeon renderer | Canvas 2D | Line-art noir renders cleanly on Canvas. Same approach as hexcrawler. |
| Creature renderer | SVG (inline) | Field guide style is naturally SVG — scalable, animatable, composable parts |
| Kingdom UI | Svelte 5 | Reactive framework for complex interactive panels. Compiles away, stays out of the game loop. |
| Testing | Vitest | Engine tests run in Node with no DOM. Consistent with both projects. |
| Persistence | localStorage (immediate), Turso (future), JSON export | Same progression as other projects |
| Hosting | Vercel | Static + serverless, consistent with both projects |

### Directory Structure

```
src/
  engine/            # Pure game logic — zero DOM/browser dependencies
    state.ts         # GameState type, initial state factory
    turn.ts          # resolveTurn(state, action) → newState
    combat.ts        # Initiative queue, damage calc, enemy AI
    dungeon.ts       # Grid, movement, visibility, fog of war
    economy.ts       # Gold, resources, building costs
    heroes.ts        # Classes, stats, leveling, party management
    creatures.ts     # Creature definitions, behavior, encounter generation
    save.ts          # Serialize/deserialize, migration, validation
  renderer/
    dungeon/         # Canvas 2D first-person corridor renderer
      camera.ts      # Perspective projection, step interpolation
      walls.ts       # Line-art wall drawing (noir style)
      creatures.ts   # SVG creature rendering in dungeon view
      effects.ts     # Torchlight, fog, darkness
    kingdom/         # Kingdom hub renderer
      skyline.ts     # Line-art skyline overview
  ui/                # Svelte 5 components
    kingdom/         # Building panels, hero roster, shop, pre-flight
    dungeon/         # HUD overlay (party HP, resources, minimap)
    shared/          # Resource bars, stat blocks, modal system
  lib/
    types.ts         # Shared TypeScript types
    constants.ts     # Tuning values, balance numbers
  app.ts             # Game loop, screen transitions, Svelte mount
tests/
  engine/            # Pure logic tests (Node, no DOM)
```

### Key Architectural Boundaries

1. **`engine/` is pure** — zero DOM, zero browser APIs. Every function takes state in and returns state out. Fully testable in Node with Vitest.
2. **`renderer/` reads state, never mutates it.** It draws frames based on the current GameState.
3. **`ui/` dispatches actions, never modifies state directly.** Svelte components call into the game loop which routes through the engine.
4. **The game loop:** `user input → action → resolveTurn(state, action) → newState → render(newState)`

This mirrors hexcrawler's architecture exactly. The engine is the source of truth; everything else is a view or an input adapter.

---

## 4. Game Systems

### 4.1 Dungeon Exploration

**Grid and movement:**
- Dungeon is a 2D grid of tiles (walls, floors, doors, traps)
- Player moves in discrete steps: forward, backward, turn left, turn right
- Four facing directions (N/S/E/W)
- Smooth interpolation between steps (~250ms tween)
- Keyboard input: WASD or arrow keys
- Touch/click: directional buttons overlaid on dungeon view

**First-person renderer:**
- Pre-calculated perspective projection for visible wall segments at each facing
- ~20-30 wall segments visible at any position — no raycasting needed
- Distance-based line opacity (closer = brighter, farther = fading)
- Stone brick patterns drawn as additional line segments on walls

**Visibility and lighting:**
- Without torch: 1 tile visibility
- With torch: 3-4 tiles visibility
- Mage Light spell as torch alternative (costs mana per step)
- Torchlight rendered as radial gradient over wall lines
- Creature eyes visible regardless of light level

**Enemy grid movement:**
- All enemies are mobile on the dungeon grid (not just patrol types)
- Movement behaviors defined per creature type (see Creature System)
- Enemies move on the dungeon turn clock — each player step advances enemy positions
- Encounter triggers when either the party steps onto an enemy's tile or an enemy steps onto the party's tile

**First playable scope:**
- Hand-authored dungeon layouts (procedural generation is a later milestone)
- 3 floors per run
- Basic fog of war (visited tiles remembered on minimap)

### 4.2 Combat

**Initiative queue:**
- Turn-based, one actor at a time
- All heroes and enemies sorted by speed/DEX each round
- Heroes and enemies interleaved — you can react to what just happened

**Resolution:**
- Combat is abstract: party vs enemy group, no grid positioning during fights
- Actions: attack, defend, use ability, use item, flee
- Enemy AI is a pure function: `decideAction(enemy, combatState) → action`
- Damage calculation considers: attacker stats, weapon, defender armor, class bonuses
- Survival penalties apply: starvation/dehydration damages party each round if resources depleted

**Presentation:**
- Dungeon view stays active with creature rendered at grid position in field guide style
- Combat HUD slides in: initiative queue, hero HP/MP bars, action menu
- Damage numbers as line-art numerals floating up from targets
- Status effects as small glyphs next to hero portraits

**First playable scope:**
- Basic attack, defend, flee actions
- No capstone abilities yet
- 2-3 combat-relevant stats (HP, attack power, defense)

### 4.3 Creature System

**Design goal:** a wide variety of enemies that are cheap to create and test. The field guide SVG style means adding a creature is writing a config object, not creating pixel art.

**Creature definition (data-driven):**
```typescript
{
  name: string
  stats: { hp, attack, defense, speed, ... }
  movement: MovementBehavior
  actions: CombatAction[]
  visual: CreatureVisual  // body shape, limbs, features, accents
}
```

**Movement behaviors (composable):**
- `stationary` — holds position
- `patrol` — follows a fixed route
- `wander` — random movement within an area
- `hunt` — moves toward party when in detection range
- `flee` — retreats when HP drops below threshold
- `pack` — stays near other creatures of same type

**Combat actions (composable):**
- Basic melee, basic ranged, buff allies, debuff party, heal self, summon
- Each is a reusable action type with tunable parameters (damage, range, cooldown)
- A creature's action list defines its combat personality

**SVG rendering:**
- Composable parts: body template (humanoid, arachnid, serpentine, amorphous, winged) + feature overlays (horns, fangs, claws, tails, markings)
- Cross-hatching density and line weight convey size and threat
- Red accent eyes on all creatures
- Visual description in the config drives the SVG assembly — no per-creature art files

**First playable: 5-8 enemy types**, for example:
- Sentinel (humanoid, stationary, melee)
- Stalker (humanoid, hunt, melee + ambush bonus)
- Caster (humanoid, wander, ranged)
- Crawler (arachnid, patrol, melee + poison)
- Wraith (amorphous, hunt, ranged + debuff)
- Hatchling (arachnid, pack, melee, low HP, appears in groups)
- Shade (amorphous, wander, melee + flee when low)
- Warden (humanoid, patrol, melee + buff allies)

### 4.4 Hero System

**Roster:**
- Heroes hired at the Tavern from a procedurally generated roster (3-4 per refresh)
- Each hero: name, class, level, XP, stats (STR/DEX/INT/WIS), equipped gear
- Select up to 4 for each dungeon run
- Permadeath — dead heroes permanently removed

**Classes (first playable: 3 of 5):**
| Class | Primary Stat | Role |
|-------|-------------|------|
| Warrior | STR | Tank/melee damage |
| Rogue | DEX | Evasion/utility |
| Mage | INT | Ranged damage |

Cleric and Ranger deferred to a later milestone.

**Progression:**
- XP earned from combat, applied at run summary
- Level up increases stats along class-specific growth curves
- Capstone abilities (levels 5/10/15/20) deferred — first playable uses basic stats only

**Gear (first playable):**
- One weapon slot, one armor slot per hero
- Weapons and armor have flat stat bonuses
- Class proficiencies determine equippable gear types
- Purchased at General Store or dropped from enemies

### 4.5 Kingdom Management

**Skyline hub:**
- Line-art panorama rendered in Canvas or SVG
- Building silhouettes appear as constructed, empty plots as flat ground
- Click or keyboard shortcut to enter a building's panel
- Skyline grows visually as kingdom develops

**Buildings (first playable: 3):**

**Tavern:**
- View available heroes (3-4 random, refreshed after each run)
- Preview hero stats, class, starting gear
- Hire for gold

**Gate:**
- Select active party from roster (up to 4)
- Choose dungeon difficulty (1 tier for first playable)
- Review supplies before launching
- Enter dungeon

**General Store:**
- Buy food, water, torches for gold
- Buy/sell basic gear
- Price list visible

**Resource bar (always visible):**
- Gold, food, water, torches
- Monospace numbers, thin ruled lines, ledger aesthetic

**Economy:**
- Dungeon runs yield gold from enemies
- Gold spent on: hiring heroes, buying supplies, buying gear
- Supplies consumed during dungeon exploration (food/water/torches deplete per step)
- "No dead end" rule: a run always yields enough gold for minimum supplies + one hero hire

**Buildings deferred:** Farm, Well, Chandler, Blacksmith, College of Arcane, Tinkerer's Guild, Adventurer's Guild — all for later milestones along with upgrade tiers, retirement system, research trees, and victory conditions.

### 4.6 Save/Load

**Engine layer:**
- `GameState` is a single serializable object (kingdom, heroes, dungeon progress, creatures, resources)
- `serialize(state) → JSON string` and `deserialize(json) → GameState`
- Schema version stamped on every save
- `deserialize` runs migrations if schema version is old

**Storage (first playable):**
- **Auto-save:** localStorage after every state transition (return from dungeon, building action)
- **Manual save:** localStorage, one explicit slot
- **Export/import:** download as `.json`, upload to restore

**Future:** Turso for cloud saves, multiple slots, cross-device play.

---

## 5. Game Flow

```
TitleScreen
  ↓
KingdomScreen (skyline hub)
  ├─ Tavern → hire heroes
  ├─ General Store → buy supplies/gear
  └─ Gate → select party, choose difficulty, launch
       ↓
DungeonLevel (first-person grid, 3 floors)
  ├─ Explore: move through corridors, manage supplies
  ├─ Encounter: enemies move on grid, combat on contact
  ├─ Combat: initiative queue, abstract resolution
  └─ Return: retreat or clear all floors
       ↓
RunSummary
  ├─ Gold earned, XP gained, loot collected
  ├─ Level ups applied
  ├─ Dead heroes removed (permadeath)
  └─ Return to KingdomScreen
```

---

## 6. First Playable Scope

The minimum set of systems that makes this a game worth sitting down to play:

- [ ] First-person grid movement in a hand-authored 3-floor dungeon
- [ ] Line-art noir dungeon renderer (Canvas 2D)
- [ ] All enemies mobile on the grid with configurable movement behaviors
- [ ] Turn-based combat (initiative queue, abstract resolution)
- [ ] 5-8 data-driven enemy types with composable behaviors and SVG field guide rendering
- [ ] Party of up to 4 heroes from 3 classes (Warrior, Rogue, Mage)
- [ ] Basic stats, leveling, gear (1 weapon + 1 armor slot)
- [ ] Kingdom skyline hub with 3 buildings (Tavern, Gate, General Store)
- [ ] Gold economy: earn from dungeons, spend in kingdom
- [ ] Survival resources: food, water, torches deplete per step
- [ ] Save/load via localStorage + JSON export
- [ ] Keyboard-first input (WASD movement, shortcuts for buildings)

**Explicitly deferred:**
- Procedural dungeon generation
- Cleric and Ranger classes
- Capstone abilities
- Building upgrades and additional buildings (Farm, Well, Chandler, Blacksmith, Colleges, Guild)
- Retirement system
- Research trees
- Victory conditions
- Rare creature variants
- Turso cloud persistence
- Audio

---

## 7. Conventions

### From Kingdom Crawler (carried forward)
- Timestamps in UTC internally, display in PT with label
- Fail closed: missing/stale data → block action, surface clearly
- No hardcoded tuning: all balance values in constants/config
- Pure strategy logic: no I/O in engine functions

### From Hexcrawler / Text-Adventure-Engine (project patterns)
- Pure engine with zero DOM dependencies
- `resolveTurn(state, action) → newState` as the core state transition
- Vitest for engine tests, runnable in Node
- Vite for bundling
- Vercel-ready deployment structure

### New for this project
- All visuals programmatic — no external art assets committed to repo
- SVG creatures assembled from composable part templates
- Svelte 5 for interactive UI panels, not for game rendering
- Canvas 2D for the dungeon renderer, kept separate from Svelte
