// Orchestrates all dungeon drawing — called each frame.
// Renders far-to-near (painter's algorithm) for correct overlap.

import type { DungeonState, EnemyInstance, CreatureType } from '../../engine/types';
import { getVisibleTiles } from '../../engine/dungeon';
import { TORCH_VISIBILITY, DARK_VISIBILITY } from '../../engine/constants';
import { drawBackWall, drawSideWalls, drawFloorAndCeiling } from './walls';
import { drawTorchlightGradient, drawFogOverlay, drawDarknessVignette, drawTorchFlicker } from './effects';
import { drawCreatureSilhouette, getCreatureScreenPosition } from './creatures';

export function renderDungeon(
  ctx: CanvasRenderingContext2D,
  state: DungeonState,
  torches: number,
  enemies: EnemyInstance[],
  creatureTypes: Record<string, CreatureType>,
  time: number,
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const hasTorch = torches > 0;
  const visibility = hasTorch ? TORCH_VISIBILITY : DARK_VISIBILITY;

  // Clear
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, w, h);

  const floor = state.floors[state.currentFloor];
  const visibleTiles = getVisibleTiles(
    state.playerPosition,
    state.playerFacing,
    floor,
    visibility,
  );

  // Draw far-to-near (painter's algorithm)
  const sorted = [...visibleTiles].sort((a, b) => b.distance - a.distance);

  for (const tile of sorted) {
    if (tile.tileType === 'wall') {
      drawBackWall(ctx, w, h, tile.distance);
    } else {
      // Floor/corridor tile — draw floor lines and side walls
      drawFloorAndCeiling(ctx, w, h, tile.distance);
      drawSideWalls(ctx, w, h, tile.distance, { left: true, right: true });
    }

    // Only draw enemies on walkable tiles (not on/behind walls)
    if (tile.tileType !== 'wall') {
      const enemyHere = enemies.find(
        e => e.position.x === tile.position.x && e.position.y === tile.position.y
      );
      if (enemyHere) {
        const creatureType = creatureTypes[enemyHere.creatureTypeId];
        if (creatureType) {
          const pos = getCreatureScreenPosition(tile.distance, w, h);
          drawCreatureSilhouette(ctx, pos.x, pos.y, pos.scale, creatureType.visual);
        }
      }
    }
  }

  // Lighting effects
  drawTorchlightGradient(ctx, w, h, hasTorch);
  if (hasTorch) {
    drawTorchFlicker(ctx, w, h, time);
    drawFogOverlay(ctx, w, h);
  }
  drawDarknessVignette(ctx, w, h);
}
