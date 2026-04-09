import { describe, expect, it } from 'vitest';
import { generateProceduralDungeon, validateProceduralFloorConnectivity } from '../../src/engine/procedural';
import { CREATURE_TYPES } from '../../src/data/creatures';
import type { DungeonFloor, Position } from '../../src/engine/types';

function findTile(floor: DungeonFloor, type: 'entrance' | 'stairs_up' | 'stairs_down'): Position[] {
  const positions: Position[] = [];

  for (let y = 0; y < floor.grid.height; y++) {
    for (let x = 0; x < floor.grid.width; x++) {
      if (floor.grid.tiles[y][x].type === type) {
        positions.push({ x, y });
      }
    }
  }

  return positions;
}

describe('generateProceduralDungeon', () => {
  it('creates connected floors with reachable walkable tiles', () => {
    const generated = generateProceduralDungeon(CREATURE_TYPES, { seed: 12345 });

    for (const floor of generated.floors) {
      const entry = findTile(floor, floor.floorNumber === 0 ? 'entrance' : 'stairs_up')[0];
      expect(entry).toBeDefined();
      expect(validateProceduralFloorConnectivity(floor, entry)).toBe(true);
    }
  });

  it('enforces stairs and entrance placement rules across floors', () => {
    const generated = generateProceduralDungeon(CREATURE_TYPES, { seed: 99, floorCount: 3 });

    const first = generated.floors[0];
    const middle = generated.floors[1];
    const last = generated.floors[2];

    expect(findTile(first, 'entrance')).toHaveLength(1);
    expect(findTile(first, 'stairs_up')).toHaveLength(0);
    expect(findTile(first, 'stairs_down')).toHaveLength(1);

    expect(findTile(middle, 'stairs_up')).toHaveLength(1);
    expect(findTile(middle, 'stairs_down')).toHaveLength(1);

    expect(findTile(last, 'stairs_up')).toHaveLength(1);
    expect(findTile(last, 'stairs_down')).toHaveLength(0);

    const firstDown = findTile(first, 'stairs_down')[0];
    const middleUp = findTile(middle, 'stairs_up')[0];
    const middleDown = findTile(middle, 'stairs_down')[0];
    const lastUp = findTile(last, 'stairs_up')[0];

    expect(firstDown).toBeDefined();
    expect(middleUp).toBeDefined();
    expect(middleDown).toBeDefined();
    expect(lastUp).toBeDefined();
  });

  it('scales enemy density on deeper floors', () => {
    const generated = generateProceduralDungeon(CREATURE_TYPES, {
      seed: 4242,
      floorCount: 3,
      width: 24,
      height: 24,
      baseEnemyCount: 1,
      enemyCountPerFloor: 2,
    });

    expect(generated.floors[0].enemies.length).toBe(1);
    expect(generated.floors[1].enemies.length).toBe(3);
    expect(generated.floors[2].enemies.length).toBe(5);
  });
});
