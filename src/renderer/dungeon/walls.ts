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
  const tone = Math.max(0, 1 - distance * 0.16);

  const fill = ctx.createLinearGradient(x, y, x, y + sh);
  fill.addColorStop(0, `rgba(26, 30, 40, ${0.7 * tone})`);
  fill.addColorStop(0.55, `rgba(18, 20, 28, ${0.62 * tone})`);
  fill.addColorStop(1, `rgba(10, 12, 18, ${0.82 * tone})`);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, sw, sh);

  // Ambient top-edge light to improve depth readability.
  const topEdge = ctx.createLinearGradient(x, y, x, y + sh * 0.35);
  topEdge.addColorStop(0, `rgba(178, 188, 210, ${seg.opacity * 0.32})`);
  topEdge.addColorStop(1, 'rgba(178, 188, 210, 0)');
  ctx.fillStyle = topEdge;
  ctx.fillRect(x, y, sw, sh * 0.35);

  ctx.strokeStyle = `rgba(186, 194, 212, ${seg.opacity})`;
  ctx.lineWidth = Math.max(1.2, 2.6 - distance * 0.34);
  ctx.strokeRect(x, y, sw, sh);

  // Cross-hatch texture for walls — sparser at distance
  const spacing = Math.max(8, distance * 6);
  ctx.save();
  ctx.globalAlpha = seg.opacity * 0.24;
  ctx.beginPath();
  for (let i = x; i < x + sw; i += spacing) {
    ctx.moveTo(i, y);
    ctx.lineTo(i + spacing * 0.5, y + sh);
  }
  ctx.strokeStyle = 'rgba(152, 166, 194, 0.9)';
  ctx.lineWidth = 0.8;
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
  const shadeStrength = Math.max(0.2, 1 - distance * 0.15);

  for (const seg of segments) {
    const nearX = seg.nearLeft * w;
    const farX = seg.farLeft * w;
    const topY = seg.farTop * h;
    const bottomY = seg.nearBottom * h;

    ctx.beginPath();
    ctx.moveTo(seg.nearLeft * w, seg.nearTop * h);
    ctx.lineTo(seg.farLeft * w, seg.farTop * h);
    ctx.lineTo(seg.farLeft * w, seg.farBottom * h);
    ctx.lineTo(seg.nearLeft * w, seg.nearBottom * h);
    ctx.closePath();

    const sideFill = ctx.createLinearGradient(nearX, topY, farX, bottomY);
    if (seg.side === 'left') {
      sideFill.addColorStop(0, `rgba(24, 28, 38, ${0.62 * shadeStrength})`);
      sideFill.addColorStop(1, `rgba(10, 12, 18, ${0.84 * shadeStrength})`);
    } else {
      sideFill.addColorStop(0, `rgba(14, 16, 22, ${0.78 * shadeStrength})`);
      sideFill.addColorStop(1, `rgba(22, 26, 36, ${0.54 * shadeStrength})`);
    }
    ctx.fillStyle = sideFill;
    ctx.fill();

    ctx.strokeStyle = `rgba(182, 190, 206, ${seg.opacity})`;
    ctx.lineWidth = Math.max(1.1, 2.1 - distance * 0.24);
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
  const opacity = seg.opacity * 0.2;

  ctx.strokeStyle = `rgba(138, 150, 172, ${opacity})`;
  ctx.lineWidth = 1;
  const floorTop = seg.top * h + seg.height * h;
  const floorBottom = h;

  const floorGradient = ctx.createLinearGradient(0, floorTop, 0, floorBottom);
  floorGradient.addColorStop(0, `rgba(20, 24, 34, ${seg.opacity * 0.34})`);
  floorGradient.addColorStop(1, `rgba(8, 10, 14, ${seg.opacity * 0.88})`);
  ctx.fillStyle = floorGradient;
  ctx.fillRect(seg.left * w, floorTop, seg.width * w, floorBottom - floorTop);

  const ceilGradient = ctx.createLinearGradient(0, seg.top * h, 0, seg.top * h + seg.height * h * 0.4);
  ceilGradient.addColorStop(0, `rgba(16, 18, 26, ${seg.opacity * 0.68})`);
  ceilGradient.addColorStop(1, 'rgba(16, 18, 26, 0)');
  ctx.fillStyle = ceilGradient;
  ctx.fillRect(seg.left * w, seg.top * h, seg.width * w, seg.height * h * 0.4);

  // Floor line
  const floorY = floorTop;
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

  // Deterministic grain noise to break flat floor planes.
  const grainCount = Math.max(8, Math.round((28 - distance * 3) * seg.width));
  const left = seg.left * w;
  const right = (seg.left + seg.width) * w;
  for (let i = 0; i < grainCount; i++) {
    const seed = i * 91.73 + distance * 137.2;
    const nx = left + ((Math.sin(seed) * 0.5 + 0.5) * (right - left));
    const ny = floorY + ((Math.cos(seed * 0.73) * 0.5 + 0.5) * (floorBottom - floorY));
    const dot = Math.max(0.4, 1.3 - distance * 0.12);
    ctx.fillStyle = `rgba(164, 174, 198, ${seg.opacity * 0.14})`;
    ctx.fillRect(nx, ny, dot, dot);
  }
}
