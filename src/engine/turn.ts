import type { GameState, GameAction, DungeonState, Hero } from './types';
import { createInitialState } from './state';
import { buySupplies, calculateHireCost, calculateLoot, canAfford, spendGold, consumeSupplies } from './economy';
import { canEquip, equipGear, unequipGear, applyXp } from './heroes';
import { moveForward, moveBackward, turnLeft, turnRight, checkEncounter, markVisited, createDungeonState, moveEnemies } from './dungeon';
import { initCombat, resolveAttack, resolveDefend, resolveFlee, advanceTurn, decideEnemyAction, heroToCombatant, enemyToCombatant } from './combat';
import { scaleForFloor, getCreatureType, spawnEnemy } from './creatures';
import { GEAR } from '../data/gear';
import { CREATURE_TYPES } from '../data/creatures';
import { MAX_PARTY_SIZE, STEPS_PER_SUPPLY } from './constants';
import { createFloor1, FLOOR_1_START } from '../data/dungeons/floor1';
import { createFloor2 } from '../data/dungeons/floor2';
import { createFloor3 } from '../data/dungeons/floor3';

function spawnFloorEnemies(floorNumber: number): import('./types').EnemyInstance[] {
  // Place enemies at fixed positions per floor
  const enemyConfigs: Array<{ typeId: string; pos: import('./types').Position }> = [];

  if (floorNumber === 0) {
    enemyConfigs.push(
      { typeId: 'shadow_rat', pos: { x: 3, y: 1 } },
      { typeId: 'shadow_rat', pos: { x: 5, y: 5 } },
    );
  } else if (floorNumber === 1) {
    enemyConfigs.push(
      { typeId: 'gloom_spider', pos: { x: 3, y: 3 } },
      { typeId: 'bone_sentinel', pos: { x: 5, y: 7 } },
      { typeId: 'shadow_rat', pos: { x: 1, y: 5 } },
    );
  } else {
    enemyConfigs.push(
      { typeId: 'void_wraith', pos: { x: 4, y: 4 } },
      { typeId: 'cave_troll', pos: { x: 1, y: 8 } },
      { typeId: 'gloom_spider', pos: { x: 6, y: 6 } },
      { typeId: 'ember_bat', pos: { x: 8, y: 1 } },
    );
  }

  return enemyConfigs.map(({ typeId, pos }) => {
    const type = CREATURE_TYPES[typeId];
    return spawnEnemy(type, pos, floorNumber);
  });
}

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

      const cost = hero.hireCost;
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
      const newResources = buySupplies(state.kingdom.resources, action.item, action.quantity);
      return { ...state, kingdom: { ...state.kingdom, resources: newResources } };
    }

    case 'BUY_GEAR': {
      const gear = GEAR[action.gearId];
      if (!gear) return state;
      const hero = state.kingdom.heroRoster.find(h => h.id === action.heroId);
      if (!hero || !canEquip(hero, gear)) return state;

      const cost = (gear.attackBonus + gear.defenseBonus) * 5;
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

    case 'ENTER_DUNGEON': {
      const aliveHeroes = state.kingdom.heroRoster.filter(h => h.alive);
      if (aliveHeroes.length === 0) return state;
      const partyIds = aliveHeroes.map(h => h.id);

      const floor1 = createFloor1();
      floor1.enemies = spawnFloorEnemies(0);
      const floor2 = createFloor2();
      floor2.enemies = spawnFloorEnemies(1);
      const floor3 = createFloor3();
      floor3.enemies = spawnFloorEnemies(2);

      const dungeon = createDungeonState([floor1, floor2, floor3], FLOOR_1_START);

      return {
        ...state,
        screen: 'dungeon',
        dungeon,
        party: partyIds,
        runSummary: { goldEarned: 0, xpEarned: 0, enemiesDefeated: 0, heroesLost: [], loot: [] },
      };
    }

    case 'MOVE': {
      if (!state.dungeon) return state;
      const d = state.dungeon;
      const floor = d.floors[d.currentFloor];

      let newPos = d.playerPosition;
      let newFacing = d.playerFacing;

      switch (action.direction) {
        case 'forward':
          newPos = moveForward(d.playerPosition, d.playerFacing, floor);
          break;
        case 'backward':
          newPos = moveBackward(d.playerPosition, d.playerFacing, floor);
          break;
        case 'turn_left':
          newFacing = turnLeft(d.playerFacing);
          break;
        case 'turn_right':
          newFacing = turnRight(d.playerFacing);
          break;
      }

      const moved = newPos.x !== d.playerPosition.x || newPos.y !== d.playerPosition.y;

      // Consume supplies on movement
      let resources = state.kingdom.resources;
      if (moved) {
        resources = consumeSupplies(resources, STEPS_PER_SUPPLY); // consume 1 per move
      }

      // Move enemies
      const creatureMovementInfo: Record<string, { movement: string; detectionRange: number; fleeThreshold: number }> = {};
      for (const [id, ct] of Object.entries(CREATURE_TYPES)) {
        creatureMovementInfo[id] = { movement: ct.movement, detectionRange: ct.detectionRange, fleeThreshold: ct.fleeThreshold };
      }
      const updatedFloor = moved ? moveEnemies(markVisited(floor, newPos), newPos, creatureMovementInfo) : floor;

      // Check encounter
      const encounter = moved ? checkEncounter(newPos, updatedFloor.enemies) : null;

      const newDungeon: DungeonState = {
        ...d,
        playerPosition: newPos,
        playerFacing: newFacing,
        floors: d.floors.map((f, i) => i === d.currentFloor ? updatedFloor : f),
      };

      if (encounter) {
        // Start combat
        const partyHeroes = state.party
          .map(id => state.kingdom.heroRoster.find(h => h.id === id))
          .filter((h): h is Hero => h != null && h.alive);

        const creatureType = getCreatureType(encounter.creatureTypeId, CREATURE_TYPES);
        if (!creatureType) return { ...state, dungeon: newDungeon, kingdom: { ...state.kingdom, resources } };

        const scaled = scaleForFloor(creatureType, d.currentFloor);
        const heroCombatants = partyHeroes.map(h => heroToCombatant(h));
        const enemyCombatants = [enemyToCombatant(encounter, scaled)];
        const combat = initCombat(heroCombatants, enemyCombatants);

        return {
          ...state,
          screen: 'combat',
          dungeon: newDungeon,
          combat,
          kingdom: { ...state.kingdom, resources },
        };
      }

      return { ...state, dungeon: newDungeon, kingdom: { ...state.kingdom, resources } };
    }

    case 'DESCEND_FLOOR': {
      if (!state.dungeon) return state;
      const d = state.dungeon;
      const nextFloor = d.currentFloor + 1;
      if (nextFloor >= d.floors.length) return state;

      const floor = d.floors[nextFloor];
      // Find the stairs_up position on the next floor as player spawn
      let spawnPos = { x: 1, y: 1 };
      for (let y = 0; y < floor.grid.height; y++) {
        for (let x = 0; x < floor.grid.width; x++) {
          if (floor.grid.tiles[y][x].type === 'stairs_up') {
            spawnPos = { x, y };
          }
        }
      }

      return {
        ...state,
        dungeon: {
          ...d,
          currentFloor: nextFloor,
          playerPosition: spawnPos,
          playerFacing: 'N',
        },
      };
    }

    case 'RETREAT': {
      return {
        ...state,
        screen: 'run_summary',
        combat: null,
      };
    }

    case 'COMBAT_ACTION': {
      if (!state.combat || state.combat.resolved) return state;

      let combat = state.combat;
      const currentId = combat.turnOrder[combat.currentTurnIndex];

      // Process hero action
      if (combat.heroIds.includes(currentId) && currentId === action.heroId) {
        switch (action.action.type) {
          case 'attack':
            combat = resolveAttack(combat, currentId, action.action.targetId);
            break;
          case 'defend':
            combat = resolveDefend(combat, currentId);
            break;
          case 'flee':
            combat = resolveFlee(combat);
            break;
        }
        combat = advanceTurn(combat);
      }

      // Process enemy turns until a hero's turn or combat ends
      while (!combat.resolved) {
        const nextId = combat.turnOrder[combat.currentTurnIndex];
        if (combat.heroIds.includes(nextId)) break;

        const enemyCombatant = combat.combatants.find(c => c.id === nextId);
        if (!enemyCombatant || enemyCombatant.hp <= 0) {
          combat = advanceTurn(combat);
          continue;
        }

        const enemyAction = decideEnemyAction(combat, nextId);
        if (enemyAction.type === 'attack') {
          combat = resolveAttack(combat, nextId, enemyAction.targetId);
        }
        combat = advanceTurn(combat);
      }

      // If combat resolved, calculate rewards
      if (combat.resolved && !combat.playerFled) {
        const summary = state.runSummary ?? { goldEarned: 0, xpEarned: 0, enemiesDefeated: 0, heroesLost: [], loot: [] };
        let totalGold = 0;
        let totalXp = 0;

        for (const enemyId of combat.enemyIds) {
          const c = combat.combatants.find(c => c.id === enemyId);
          if (c && c.hp <= 0) {
            // Find the original enemy to get creature type
            const enemy = state.dungeon?.floors[state.dungeon.currentFloor].enemies.find(e => e.id === enemyId);
            if (enemy) {
              const ct = CREATURE_TYPES[enemy.creatureTypeId];
              if (ct) {
                totalGold += calculateLoot(ct.goldDrop, state.dungeon?.currentFloor ?? 0);
                totalXp += ct.xpReward;
              }
            }
          }
        }

        // Remove defeated enemies from dungeon
        let dungeon = state.dungeon;
        if (dungeon) {
          const floor = dungeon.floors[dungeon.currentFloor];
          const deadEnemyIds = combat.enemyIds.filter(id => {
            const c = combat.combatants.find(c => c.id === id);
            return c && c.hp <= 0;
          });
          const updatedFloor = {
            ...floor,
            enemies: floor.enemies.filter(e => !deadEnemyIds.includes(e.id)),
          };
          dungeon = {
            ...dungeon,
            floors: dungeon.floors.map((f, i) => i === dungeon!.currentFloor ? updatedFloor : f),
          };
        }

        return {
          ...state,
          screen: 'dungeon',
          combat: null,
          dungeon,
          kingdom: {
            ...state.kingdom,
            resources: { ...state.kingdom.resources, gold: state.kingdom.resources.gold + totalGold },
          },
          runSummary: {
            ...summary,
            goldEarned: summary.goldEarned + totalGold,
            xpEarned: summary.xpEarned + totalXp,
            enemiesDefeated: summary.enemiesDefeated + combat.enemyIds.filter(id => {
              const c = combat.combatants.find(c => c.id === id);
              return c && c.hp <= 0;
            }).length,
          },
        };
      }

      return { ...state, combat };
    }

    case 'END_RUN': {
      // Apply XP to party heroes, mark dead heroes
      let heroRoster = state.kingdom.heroRoster;
      const summary = state.runSummary;

      if (summary && state.party.length > 0) {
        const xpPerHero = Math.floor(summary.xpEarned / state.party.length);
        heroRoster = heroRoster.map(h => {
          if (state.party.includes(h.id)) {
            return applyXp(h, xpPerHero);
          }
          return h;
        });
      }

      return {
        ...state,
        screen: 'kingdom',
        dungeon: null,
        combat: null,
        party: [],
        runSummary: null,
        kingdom: { ...state.kingdom, heroRoster },
      };
    }

    default:
      return state;
  }
}
