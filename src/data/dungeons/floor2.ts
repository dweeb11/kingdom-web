import type { DungeonFloor, DungeonTile, Position } from '../../engine/types';

const LAYOUT = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 1, 1, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 1, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const FLOOR_2_START: Position = { x: 1, y: 1 };

export function createFloor2(): DungeonFloor {
  const tiles: DungeonTile[][] = LAYOUT.map(row =>
    row.map(cell => ({
      type: cell === 1 ? 'floor' as const : 'wall' as const,
      visible: false,
      visited: false,
    }))
  );

  tiles[1][1] = { type: 'stairs_up', visible: false, visited: false };
  tiles[7][5] = { type: 'stairs_down', visible: false, visited: false };

  return {
    grid: { width: 10, height: 10, tiles },
    enemies: [],
    floorNumber: 1,
  };
}
