import type { DungeonFloor, DungeonTile, Position, TileType, CreatureType } from './types';
import { spawnEnemy } from './creatures';

interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProceduralDungeonConfig {
  floorCount?: number;
  width?: number;
  height?: number;
  minRooms?: number;
  maxRooms?: number;
  seed?: number;
  baseEnemyCount?: number;
  enemyCountPerFloor?: number;
}

export interface ProceduralDungeonResult {
  floors: DungeonFloor[];
  startPosition: Position;
  seed: number;
}

class Lcg {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(values: T[]): T {
    return values[this.int(0, values.length - 1)];
  }
}

function createWallTile(): DungeonTile {
  return { type: 'wall', visible: false, visited: false };
}

function createFloorTile(): DungeonTile {
  return { type: 'floor', visible: false, visited: false };
}

function createGrid(width: number, height: number): DungeonTile[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => createWallTile())
  );
}

function roomCenter(room: Room): Position {
  return {
    x: room.x + Math.floor(room.width / 2),
    y: room.y + Math.floor(room.height / 2),
  };
}

function roomsOverlap(a: Room, b: Room, padding = 1): boolean {
  return !(
    a.x + a.width + padding <= b.x ||
    b.x + b.width + padding <= a.x ||
    a.y + a.height + padding <= b.y ||
    b.y + b.height + padding <= a.y
  );
}

function carveRoom(tiles: DungeonTile[][], room: Room): void {
  for (let y = room.y; y < room.y + room.height; y++) {
    for (let x = room.x; x < room.x + room.width; x++) {
      tiles[y][x] = createFloorTile();
    }
  }
}

function carveCorridor(tiles: DungeonTile[][], from: Position, to: Position, horizontalFirst: boolean): void {
  const carveHorizontal = () => {
    const [startX, endX] = from.x <= to.x ? [from.x, to.x] : [to.x, from.x];
    for (let x = startX; x <= endX; x++) {
      tiles[from.y][x] = createFloorTile();
    }
  };

  const carveVertical = () => {
    const [startY, endY] = from.y <= to.y ? [from.y, to.y] : [to.y, from.y];
    for (let y = startY; y <= endY; y++) {
      tiles[y][to.x] = createFloorTile();
    }
  };

  if (horizontalFirst) {
    carveHorizontal();
    carveVertical();
  } else {
    const [startY, endY] = from.y <= to.y ? [from.y, to.y] : [to.y, from.y];
    for (let y = startY; y <= endY; y++) {
      tiles[y][from.x] = createFloorTile();
    }
    const [startX, endX] = from.x <= to.x ? [from.x, to.x] : [to.x, from.x];
    for (let x = startX; x <= endX; x++) {
      tiles[to.y][x] = createFloorTile();
    }
  }
}

function inBounds(width: number, height: number, pos: Position): boolean {
  return pos.x >= 0 && pos.y >= 0 && pos.x < width && pos.y < height;
}

function isWalkable(tile: DungeonTile): boolean {
  return tile.type !== 'wall';
}

function walkablePositions(tiles: DungeonTile[][]): Position[] {
  const positions: Position[] = [];
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[0].length; x++) {
      if (isWalkable(tiles[y][x])) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}

function bfsDistances(tiles: DungeonTile[][], start: Position): number[][] {
  const height = tiles.length;
  const width = tiles[0].length;
  const distances = Array.from({ length: height }, () => Array.from({ length: width }, () => -1));

  const queue: Position[] = [start];
  distances[start.y][start.x] = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const base = distances[current.y][current.x];

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const next of neighbors) {
      if (!inBounds(width, height, next)) continue;
      if (distances[next.y][next.x] !== -1) continue;
      if (!isWalkable(tiles[next.y][next.x])) continue;

      distances[next.y][next.x] = base + 1;
      queue.push(next);
    }
  }

  return distances;
}

function furthestReachable(tiles: DungeonTile[][], start: Position): Position {
  const distances = bfsDistances(tiles, start);
  let best = start;
  let bestDistance = 0;

  for (let y = 0; y < distances.length; y++) {
    for (let x = 0; x < distances[0].length; x++) {
      const distance = distances[y][x];
      if (distance > bestDistance) {
        bestDistance = distance;
        best = { x, y };
      }
    }
  }

  return best;
}

function validateConnected(tiles: DungeonTile[][], start: Position): boolean {
  const walkables = walkablePositions(tiles);
  const distances = bfsDistances(tiles, start);

  return walkables.every(pos => distances[pos.y][pos.x] >= 0);
}

function markSpecial(tiles: DungeonTile[][], pos: Position, type: TileType): void {
  tiles[pos.y][pos.x] = { type, visible: false, visited: false };
}

function selectEnemySpawns(
  tiles: DungeonTile[][],
  reserved: Position[],
  count: number,
  rng: Lcg,
): Position[] {
  const blocked = new Set(reserved.map(pos => `${pos.x},${pos.y}`));
  const candidates = walkablePositions(tiles).filter(pos => !blocked.has(`${pos.x},${pos.y}`));

  const spawns: Position[] = [];
  while (spawns.length < count && candidates.length > 0) {
    const index = rng.int(0, candidates.length - 1);
    spawns.push(candidates[index]);
    candidates.splice(index, 1);
  }
  return spawns;
}

function generateFloorLayout(
  width: number,
  height: number,
  minRooms: number,
  maxRooms: number,
  rng: Lcg,
): { tiles: DungeonTile[][]; rooms: Room[] } {
  const tiles = createGrid(width, height);
  const rooms: Room[] = [];
  const attempts = maxRooms * 6;

  for (let i = 0; i < attempts && rooms.length < maxRooms; i++) {
    const room: Room = {
      width: rng.int(3, Math.max(3, Math.floor(width / 3))),
      height: rng.int(3, Math.max(3, Math.floor(height / 3))),
      x: rng.int(1, width - 4),
      y: rng.int(1, height - 4),
    };

    if (room.x + room.width >= width - 1 || room.y + room.height >= height - 1) {
      continue;
    }
    if (rooms.some(existing => roomsOverlap(existing, room, 1))) {
      continue;
    }

    carveRoom(tiles, room);
    if (rooms.length > 0) {
      const prevCenter = roomCenter(rooms[rooms.length - 1]);
      const currCenter = roomCenter(room);
      carveCorridor(tiles, prevCenter, currCenter, rng.next() > 0.5);
    }
    rooms.push(room);
  }

  if (rooms.length < minRooms) {
    const room: Room = { x: 1, y: 1, width: width - 2, height: height - 2 };
    carveRoom(tiles, room);
    rooms.push(room);
  }

  return { tiles, rooms };
}

export function generateProceduralDungeon(
  creatureTypes: Record<string, CreatureType>,
  config: ProceduralDungeonConfig = {},
): ProceduralDungeonResult {
  const floorCount = config.floorCount ?? 3;
  const width = config.width ?? 22;
  const height = config.height ?? 22;
  const minRooms = config.minRooms ?? 6;
  const maxRooms = config.maxRooms ?? 10;
  const baseEnemyCount = config.baseEnemyCount ?? 2;
  const enemyCountPerFloor = config.enemyCountPerFloor ?? 2;
  const seed = config.seed ?? Math.floor(Math.random() * 0x7fffffff);
  const rng = new Lcg(seed);

  const creatureList = Object.values(creatureTypes);
  if (creatureList.length === 0) {
    throw new Error('Cannot generate procedural dungeon without creature types');
  }

  const floors: DungeonFloor[] = [];
  let previousDownStairs: Position | null = null;
  let startPosition: Position = { x: 1, y: 1 };

  for (let floorNumber = 0; floorNumber < floorCount; floorNumber++) {
    let layout = generateFloorLayout(width, height, minRooms, maxRooms, rng);
    let entry = previousDownStairs ?? roomCenter(layout.rooms[0]);

    if (!inBounds(width, height, entry) || !isWalkable(layout.tiles[entry.y][entry.x])) {
      entry = roomCenter(layout.rooms[0]);
      layout.tiles[entry.y][entry.x] = createFloorTile();
    }

    if (!validateConnected(layout.tiles, entry)) {
      // Fallback: force full connectivity and regenerate special positions.
      layout.tiles = createGrid(width, height);
      const fallbackRoom: Room = { x: 1, y: 1, width: width - 2, height: height - 2 };
      carveRoom(layout.tiles, fallbackRoom);
      entry = roomCenter(fallbackRoom);
    }

    const specials: Position[] = [entry];

    if (floorNumber === 0) {
      markSpecial(layout.tiles, entry, 'entrance');
      startPosition = entry;
    } else {
      markSpecial(layout.tiles, entry, 'stairs_up');
    }

    if (floorNumber < floorCount - 1) {
      const down = furthestReachable(layout.tiles, entry);
      markSpecial(layout.tiles, down, 'stairs_down');
      previousDownStairs = down;
      specials.push(down);
    } else {
      previousDownStairs = null;
    }

    const enemyCount = baseEnemyCount + floorNumber * enemyCountPerFloor;
    const enemyPositions = selectEnemySpawns(layout.tiles, specials, enemyCount, rng);
    const enemies = enemyPositions.map(pos => {
      const creature = rng.pick(creatureList);
      return spawnEnemy(creature, pos, floorNumber);
    });

    floors.push({
      floorNumber,
      grid: { width, height, tiles: layout.tiles },
      enemies,
    });
  }

  return { floors, startPosition, seed };
}

export function validateProceduralFloorConnectivity(floor: DungeonFloor, start: Position): boolean {
  return validateConnected(floor.grid.tiles, start);
}
