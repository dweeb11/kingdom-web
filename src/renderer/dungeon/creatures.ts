// Position and render creature SVG elements in the dungeon view.

import { getWallSegment } from './projection';
import type { CreatureVisual } from '../../engine/types';

export function getCreatureScreenPosition(
  distance: number,
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number; scale: number } {
  const seg = getWallSegment(distance);
  const x = (seg.left + seg.width / 2) * canvasWidth;
  const y = (seg.top + seg.height * 0.6) * canvasHeight;
  const scale = seg.height * 0.5;

  return { x, y, scale };
}

export function drawCreatureEyes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
): void {
  // Red glowing eyes — always visible in darkness
  const eyeSize = Math.max(2, scale * 6);
  const eyeSpacing = eyeSize * 2.5;

  ctx.fillStyle = '#ff4444';
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = eyeSize * 2;

  // Left eye
  ctx.beginPath();
  ctx.arc(x - eyeSpacing / 2, y, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.beginPath();
  ctx.arc(x + eyeSpacing / 2, y, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
}

export function drawCreatureSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  visual: CreatureVisual,
): void {
  const size = Math.max(20, scale * 80);
  const opacity = Math.min(1, scale * 1.5);

  ctx.strokeStyle = `rgba(192, 192, 192, ${opacity})`;
  ctx.lineWidth = visual.lineWeight;

  switch (visual.bodyShape) {
    case 'humanoid':
      drawHumanoidSilhouette(ctx, x, y, size);
      break;
    case 'arachnid':
      drawArachnidSilhouette(ctx, x, y, size);
      break;
    case 'amorphous':
      drawAmorphousSilhouette(ctx, x, y, size);
      break;
    case 'winged':
      drawWingedSilhouette(ctx, x, y, size);
      break;
    case 'serpentine':
      drawSerpentineSilhouette(ctx, x, y, size);
      break;
  }

  drawCreatureEyes(ctx, x, y - size * 0.3, scale);
}

function drawHumanoidSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  // Head
  ctx.arc(x, y - size * 0.4, size * 0.15, 0, Math.PI * 2);
  ctx.stroke();
  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25);
  ctx.lineTo(x, y + size * 0.2);
  // Arms
  ctx.moveTo(x - size * 0.25, y - size * 0.1);
  ctx.lineTo(x + size * 0.25, y - size * 0.1);
  // Legs
  ctx.moveTo(x, y + size * 0.2);
  ctx.lineTo(x - size * 0.15, y + size * 0.5);
  ctx.moveTo(x, y + size * 0.2);
  ctx.lineTo(x + size * 0.15, y + size * 0.5);
  ctx.stroke();
}

function drawArachnidSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  // Body oval
  ctx.ellipse(x, y, size * 0.2, size * 0.15, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Legs
  for (let i = 0; i < 4; i++) {
    const angle = (i - 1.5) * 0.4;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.2, y + i * size * 0.08 - size * 0.12);
    ctx.lineTo(x - size * 0.4, y + i * size * 0.1 - size * 0.2);
    ctx.moveTo(x + size * 0.2, y + i * size * 0.08 - size * 0.12);
    ctx.lineTo(x + size * 0.4, y + i * size * 0.1 - size * 0.2);
    ctx.stroke();
  }
}

function drawAmorphousSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  // Blobby shape using bezier curves
  ctx.moveTo(x - size * 0.2, y + size * 0.2);
  ctx.bezierCurveTo(x - size * 0.3, y - size * 0.1, x - size * 0.1, y - size * 0.3, x, y - size * 0.25);
  ctx.bezierCurveTo(x + size * 0.15, y - size * 0.3, x + size * 0.3, y - size * 0.1, x + size * 0.2, y + size * 0.2);
  ctx.bezierCurveTo(x + size * 0.1, y + size * 0.25, x - size * 0.1, y + size * 0.25, x - size * 0.2, y + size * 0.2);
  ctx.stroke();
}

function drawWingedSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.1, size * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Wings
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.1);
  ctx.bezierCurveTo(x - size * 0.4, y - size * 0.4, x - size * 0.5, y, x - size * 0.15, y + size * 0.1);
  ctx.moveTo(x + size * 0.1, y - size * 0.1);
  ctx.bezierCurveTo(x + size * 0.4, y - size * 0.4, x + size * 0.5, y, x + size * 0.15, y + size * 0.1);
  ctx.stroke();
}

function drawSerpentineSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  // S-curve body
  ctx.moveTo(x - size * 0.2, y + size * 0.3);
  ctx.bezierCurveTo(x - size * 0.3, y, x + size * 0.3, y, x, y - size * 0.2);
  ctx.bezierCurveTo(x - size * 0.1, y - size * 0.3, x + size * 0.1, y - size * 0.4, x + size * 0.15, y - size * 0.35);
  ctx.stroke();
  // Head
  ctx.beginPath();
  ctx.arc(x + size * 0.15, y - size * 0.35, size * 0.06, 0, Math.PI * 2);
  ctx.stroke();
}
