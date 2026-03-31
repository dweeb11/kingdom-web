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
    // Should see y=4,3,2,1 and the wall at y=0 (5 tiles total, stops at wall)
    expect(positions.length).toBeLessThanOrEqual(5);
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
