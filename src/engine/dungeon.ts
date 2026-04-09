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

export function revealTilesAroundPlayer(
  floor: DungeonFloor,
  playerPosition: Position,
  range: number,
): DungeonFloor {
  const maxDistance = Math.max(1, range);
  const tiles = floor.grid.tiles.map(row => row.map(tile => ({ ...tile, visible: false })));

  for (let y = 0; y < floor.grid.height; y++) {
    for (let x = 0; x < floor.grid.width; x++) {
      const distance = Math.abs(playerPosition.x - x) + Math.abs(playerPosition.y - y);
      if (distance <= maxDistance) {
        const current = tiles[y][x];
        tiles[y][x] = {
          ...current,
          visible: true,
          visited: true,
        };
      }
    }
  }

  return {
    ...floor,
    grid: {
      ...floor.grid,
      tiles,
    },
  };
}

export function updateDungeonVisibility(
  dungeon: DungeonState,
  range: number,
): DungeonState {
  const floor = dungeon.floors[dungeon.currentFloor];
  const visibleFloor = revealTilesAroundPlayer(floor, dungeon.playerPosition, range);

  return {
    ...dungeon,
    floors: dungeon.floors.map((existing, index) =>
      index === dungeon.currentFloor ? visibleFloor : existing
    ),
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
