// Canvas/SVG line-art kingdom panorama — building silhouettes with selection highlight.

export interface BuildingDef {
  id: string;
  name: string;
  x: number;      // center x (0-1 normalized)
  width: number;   // width (0-1 normalized)
  height: number;  // height (0-1 normalized)
}

const BUILDINGS: BuildingDef[] = [
  { id: 'tavern', name: 'Tavern', x: 0.2, width: 0.15, height: 0.35 },
  { id: 'gate', name: 'Gate', x: 0.5, width: 0.2, height: 0.5 },
  { id: 'general_store', name: 'General Store', x: 0.8, width: 0.15, height: 0.3 },
];

export function renderSkyline(
  ctx: CanvasRenderingContext2D,
  selectedBuilding: string | null,
  unlockedBuildings: string[],
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const groundY = h * 0.75;

  // Clear
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, w, h);

  // Stars
  drawStarField(ctx, w, h * 0.6);

  // Ground line
  ctx.strokeStyle = '#404040';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(w, groundY);
  ctx.stroke();

  // Draw buildings
  for (const building of BUILDINGS) {
    if (!unlockedBuildings.includes(building.id)) continue;

    const isSelected = building.id === selectedBuilding;
    drawBuilding(ctx, building, w, groundY, isSelected);
  }
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  building: BuildingDef,
  canvasWidth: number,
  groundY: number,
  isSelected: boolean,
): void {
  const bw = building.width * canvasWidth;
  const bh = building.height * groundY;
  const bx = building.x * canvasWidth - bw / 2;
  const by = groundY - bh;

  // Building outline
  ctx.strokeStyle = isSelected ? '#ff8c00' : '#808080';
  ctx.lineWidth = isSelected ? 2.5 : 1.5;
  ctx.strokeRect(bx, by, bw, bh);

  // Roof — simple triangle
  ctx.beginPath();
  ctx.moveTo(bx - bw * 0.1, by);
  ctx.lineTo(bx + bw / 2, by - bh * 0.25);
  ctx.lineTo(bx + bw + bw * 0.1, by);
  ctx.closePath();
  ctx.stroke();

  // Door
  const doorW = bw * 0.2;
  const doorH = bh * 0.3;
  ctx.strokeRect(bx + bw / 2 - doorW / 2, groundY - doorH, doorW, doorH);

  // Window
  const winSize = bw * 0.12;
  ctx.strokeRect(bx + bw * 0.2, by + bh * 0.25, winSize, winSize);
  ctx.strokeRect(bx + bw * 0.65, by + bh * 0.25, winSize, winSize);

  // Selection glow
  if (isSelected) {
    ctx.shadowColor = '#ff8c00';
    ctx.shadowBlur = 12;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.shadowBlur = 0;
  }

  // Label
  ctx.fillStyle = isSelected ? '#ff8c00' : '#808080';
  ctx.font = '12px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(building.name, bx + bw / 2, groundY + 16);
}

function drawStarField(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Deterministic "random" stars using simple hash
  ctx.fillStyle = '#404040';
  for (let i = 0; i < 40; i++) {
    const x = ((i * 7919 + 1) % 997) / 997 * w;
    const y = ((i * 6271 + 3) % 991) / 991 * h;
    const size = ((i * 3571) % 3) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function getBuildingAtPosition(
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number,
  unlockedBuildings: string[],
): string | null {
  const groundY = canvasHeight * 0.75;

  for (const building of BUILDINGS) {
    if (!unlockedBuildings.includes(building.id)) continue;

    const bw = building.width * canvasWidth;
    const bh = building.height * groundY;
    const bx = building.x * canvasWidth - bw / 2;
    const by = groundY - bh;

    if (x >= bx && x <= bx + bw && y >= by && y <= groundY) {
      return building.id;
    }
  }

  return null;
}
