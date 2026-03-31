import type { CreatureType, EnemyInstance, Position } from './types';
import { FLOOR_SCALING } from './constants';

let nextEnemyId = 1;

export function getCreatureType(
  id: string,
  types: Record<string, CreatureType>,
): CreatureType | undefined {
  return types[id];
}

export function scaleForFloor(base: CreatureType, floorNumber: number): CreatureType {
  if (floorNumber === 0) return base;

  return {
    ...base,
    stats: {
      hp: base.stats.hp + floorNumber * FLOOR_SCALING.hpBonus,
      attack: base.stats.attack + floorNumber * FLOOR_SCALING.attackBonus,
      defense: base.stats.defense,
      speed: base.stats.speed + floorNumber * FLOOR_SCALING.speedBonus,
    },
    goldDrop: {
      min: base.goldDrop.min + floorNumber * FLOOR_SCALING.goldBonus,
      max: base.goldDrop.max + floorNumber * FLOOR_SCALING.goldBonus,
    },
  };
}

export function spawnEnemy(
  type: CreatureType,
  position: Position,
  floorNumber: number,
  patrolRoute?: Position[],
): EnemyInstance {
  const scaled = scaleForFloor(type, floorNumber);
  return {
    id: `enemy_${nextEnemyId++}`,
    creatureTypeId: type.id,
    position,
    currentHp: scaled.stats.hp,
    ...(patrolRoute ? { patrolRoute, patrolIndex: 0 } : {}),
  };
}
