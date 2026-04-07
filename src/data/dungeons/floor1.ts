import type { DungeonFloor, DungeonTile, Position } from '../../engine/types';

// 10x10 hand-authored grid. 1 = floor, 0 = wall
const LAYOUT = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const FLOOR_1_START: Position = { x: 1, y: 8 };

export function createFloor1(): DungeonFloor {
  const tiles: DungeonTile[][] = LAYOUT.map(row =>
    row.map(cell => ({
      type: cell === 1 ? 'floor' as const : 'wall' as const,
      visible: false,
      visited: false,
    }))
  );

  // Mark entrance
  tiles[8][1] = { type: 'entrance', visible: false, visited: false };
  // Mark stairs down
  tiles[1][8] = { type: 'stairs_down', visible: false, visited: false };

  return {
    grid: { width: 10, height: 10, tiles },
    enemies: [],
    floorNumber: 0,
  };
}
