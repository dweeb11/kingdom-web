// Torchlight gradients, fog, and darkness overlay effects.

export function drawTorchlightGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  hasTorch: boolean,
): void {
  if (!hasTorch) {
    // Full darkness — only a tiny visible area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, w, h);
    return;
  }

  // Radial gradient from center: warm light fading to darkness
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.7;

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.1)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

export function drawFogOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  // Subtle fog — very light vignette
  const cx = w / 2;
  const cy = h * 0.6; // slightly below center

  const gradient = ctx.createRadialGradient(cx, cy, w * 0.2, cx, cy, w * 0.8);
  gradient.addColorStop(0, 'rgba(14, 14, 20, 0)');
  gradient.addColorStop(1, 'rgba(14, 14, 20, 0.3)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

export function drawDarknessVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  // Hard vignette around edges
  ctx.fillStyle = 'rgba(8, 8, 8, 0.6)';

  // Top
  ctx.fillRect(0, 0, w, h * 0.05);
  // Bottom
  ctx.fillRect(0, h * 0.95, w, h * 0.05);
  // Left
  ctx.fillRect(0, 0, w * 0.03, h);
  // Right
  ctx.fillRect(w * 0.97, 0, w * 0.03, h);
}

export function drawTorchFlicker(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
): void {
  // Warm amber overlay that pulses subtly
  const flicker = 0.03 + Math.sin(time * 0.003) * 0.01 + Math.sin(time * 0.007) * 0.005;

  ctx.fillStyle = `rgba(255, 140, 0, ${flicker})`;
  ctx.fillRect(0, 0, w, h);
}
