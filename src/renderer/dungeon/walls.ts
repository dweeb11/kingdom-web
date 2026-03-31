// Canvas 2D line-art wall drawing for dungeon corridors.
// Uses the noir palette — light lines on dark backgrounds.

import { getWallSegment, getSideWallSegments } from './projection';
import type { WallSegment, SideWallSegment } from './projection';

export function drawBackWall(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  distance: number,
): void {
  const seg = getWallSegment(distance);
  const x = seg.left * w;
  const y = seg.top * h;
  const sw = seg.width * w;
  const sh = seg.height * h;

  ctx.strokeStyle = `rgba(192, 192, 192, ${seg.opacity})`;
  ctx.lineWidth = Math.max(1, 3 - distance * 0.4);
  ctx.strokeRect(x, y, sw, sh);

  // Cross-hatch texture for walls — sparser at distance
  const spacing = Math.max(8, distance * 6);
  ctx.save();
  ctx.globalAlpha = seg.opacity * 0.3;
  ctx.beginPath();
  for (let i = x; i < x + sw; i += spacing) {
    ctx.moveTo(i, y);
    ctx.lineTo(i + spacing * 0.5, y + sh);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawSideWalls(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  distance: number,
  hasSideWall: { left: boolean; right: boolean },
): void {
  const segments = getSideWallSegments(distance, hasSideWall);

  for (const seg of segments) {
    ctx.strokeStyle = `rgba(192, 192, 192, ${seg.opacity})`;
    ctx.lineWidth = Math.max(1, 2 - distance * 0.3);

    ctx.beginPath();

    if (seg.side === 'left') {
      // Left wall: trapezoid from near-left to far-left
      ctx.moveTo(seg.nearLeft * w, seg.nearTop * h);
      ctx.lineTo(seg.farLeft * w, seg.farTop * h);
      ctx.lineTo(seg.farLeft * w, seg.farBottom * h);
      ctx.lineTo(seg.nearLeft * w, seg.nearBottom * h);
      ctx.closePath();
    } else {
      // Right wall: trapezoid from near-right to far-right
      ctx.moveTo(seg.nearLeft * w, seg.nearTop * h);
      ctx.lineTo(seg.farLeft * w, seg.farTop * h);
      ctx.lineTo(seg.farLeft * w, seg.farBottom * h);
      ctx.lineTo(seg.nearLeft * w, seg.nearBottom * h);
      ctx.closePath();
    }

    ctx.stroke();
  }
}

export function drawFloorAndCeiling(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  distance: number,
): void {
  const seg = getWallSegment(distance);
  const opacity = seg.opacity * 0.15;

  ctx.strokeStyle = `rgba(128, 128, 128, ${opacity})`;
  ctx.lineWidth = 1;

  // Floor line
  const floorY = seg.top * h + seg.height * h;
  ctx.beginPath();
  ctx.moveTo(seg.left * w, floorY);
  ctx.lineTo((seg.left + seg.width) * w, floorY);
  ctx.stroke();

  // Ceiling line
  const ceilY = seg.top * h;
  ctx.beginPath();
  ctx.moveTo(seg.left * w, ceilY);
  ctx.lineTo((seg.left + seg.width) * w, ceilY);
  ctx.stroke();
}
