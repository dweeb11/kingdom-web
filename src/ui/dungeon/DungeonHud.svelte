<script lang="ts">
  import type { GameState, GameAction, Position } from '../../engine/types';
  import { TORCH_VISIBILITY, DARK_VISIBILITY } from '../../engine/constants';

  const MINIMAP_SIZE = 148;

  let { gameState, onAction }: {
    gameState: GameState;
    onAction: (action: GameAction) => void;
  } = $props();

  let minimapCanvas = $state<HTMLCanvasElement | undefined>(undefined);

  let currentTile = $derived(
    gameState.dungeon
      ? gameState.dungeon.floors[gameState.dungeon.currentFloor]
          .grid.tiles[gameState.dungeon.playerPosition.y][gameState.dungeon.playerPosition.x]
      : null
  );

  let canDescend = $derived(currentTile?.type === 'stairs_down');

  let currentFloor = $derived(
    gameState.dungeon
      ? gameState.dungeon.floors[gameState.dungeon.currentFloor]
      : null
  );

  let visibilityRange = $derived(
    gameState.kingdom.resources.torches > 0 ? TORCH_VISIBILITY : DARK_VISIBILITY
  );

  function tileColor(tileType: string, visible: boolean): string {
    if (tileType === 'wall') return visible ? '#4f545f' : '#2f333a';
    if (tileType === 'stairs_down') return visible ? '#cfae5f' : '#7f6d3c';
    if (tileType === 'stairs_up') return visible ? '#8eb2df' : '#5f7590';
    if (tileType === 'entrance') return visible ? '#9fbf9f' : '#5d7a5d';
    return visible ? '#8c96a6' : '#596171';
  }

  function drawPlayerArrow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    facing: 'N' | 'S' | 'E' | 'W'
  ): void {
    const half = size * 0.5;
    const pointsByFacing: Record<typeof facing, Position[]> = {
      N: [
        { x, y: y - half },
        { x: x - half, y: y + half },
        { x: x + half, y: y + half },
      ],
      S: [
        { x, y: y + half },
        { x: x - half, y: y - half },
        { x: x + half, y: y - half },
      ],
      E: [
        { x: x + half, y },
        { x: x - half, y: y - half },
        { x: x - half, y: y + half },
      ],
      W: [
        { x: x - half, y },
        { x: x + half, y: y - half },
        { x: x + half, y: y + half },
      ],
    };

    const points = pointsByFacing[facing];
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();
    ctx.fillStyle = '#ffd36f';
    ctx.fill();
  }

  function drawMinimap(): void {
    if (!gameState.dungeon || !currentFloor) return;
    const ctx = minimapCanvas.getContext('2d');
    if (!ctx) return;

    const floor = currentFloor;
    const tileSize = Math.max(2, Math.floor(MINIMAP_SIZE / Math.max(floor.grid.width, floor.grid.height)));
    const mapWidth = floor.grid.width * tileSize;
    const mapHeight = floor.grid.height * tileSize;
    const offsetX = Math.floor((MINIMAP_SIZE - mapWidth) / 2);
    const offsetY = Math.floor((MINIMAP_SIZE - mapHeight) / 2);

    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    for (let y = 0; y < floor.grid.height; y++) {
      for (let x = 0; x < floor.grid.width; x++) {
        const tile = floor.grid.tiles[y][x];
        if (!tile.visited) continue;

        ctx.fillStyle = tileColor(tile.type, tile.visible);
        ctx.fillRect(offsetX + x * tileSize, offsetY + y * tileSize, tileSize, tileSize);
      }
    }

    for (const enemy of floor.enemies) {
      const tile = floor.grid.tiles[enemy.position.y][enemy.position.x];
      if (!tile.visible) continue;

      const px = offsetX + enemy.position.x * tileSize + tileSize / 2;
      const py = offsetY + enemy.position.y * tileSize + tileSize / 2;
      const radius = Math.max(1, Math.floor(tileSize * 0.28));
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#c24747';
      ctx.fill();
    }

    const playerX = offsetX + gameState.dungeon.playerPosition.x * tileSize + tileSize / 2;
    const playerY = offsetY + gameState.dungeon.playerPosition.y * tileSize + tileSize / 2;
    drawPlayerArrow(ctx, playerX, playerY, Math.max(3, tileSize - 1), gameState.dungeon.playerFacing);

    ctx.strokeStyle = '#2f3440';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, MINIMAP_SIZE - 1, MINIMAP_SIZE - 1);
  }

  $effect(() => {
    if (!gameState.dungeon || !minimapCanvas) return;
    currentFloor;
    gameState.dungeon.playerPosition.x;
    gameState.dungeon.playerPosition.y;
    gameState.dungeon.playerFacing;
    visibilityRange;
    drawMinimap();
  });
</script>

<div class="dungeon-hud">
  <div class="hud-top">
    <div class="supplies">
      <span class="pill food">FOOD {gameState.kingdom.resources.food}</span>
      <span class="pill water">WATER {gameState.kingdom.resources.water}</span>
      <span class="pill torch">TORCH {gameState.kingdom.resources.torches}</span>
    </div>

    <div class="hud-actions">
      {#if canDescend}
        <button class="descend-btn" onclick={() => onAction({ type: 'DESCEND_FLOOR' })}>
          DESCEND
        </button>
      {/if}
      <button class="retreat-btn" onclick={() => onAction({ type: 'RETREAT' })}>
        RETREAT
      </button>
    </div>
  </div>

  <div class="hud-bottom">
    {#if gameState.dungeon}
      <div class="location">
        Floor {gameState.dungeon.currentFloor + 1} — Facing {gameState.dungeon.playerFacing}
      </div>
      <div class="minimap-wrap">
        <canvas bind:this={minimapCanvas} width={MINIMAP_SIZE} height={MINIMAP_SIZE}></canvas>
      </div>
    {/if}
  </div>
</div>

<style>
  .dungeon-hud {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to bottom, rgba(7, 9, 14, 0.95), rgba(7, 9, 14, 0.72));
    padding: 8px 12px;
    border-bottom: 1px solid var(--line-dim);
    backdrop-filter: blur(1px);
  }

  .hud-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .hud-bottom {
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .supplies {
    display: flex;
    gap: 8px;
    font-size: 10px;
    color: var(--text-secondary);
    flex-wrap: wrap;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 1px solid var(--line-dim);
    padding: 2px 6px;
    letter-spacing: 0.4px;
  }

  .pill.food {
    color: #d4c49a;
  }

  .pill.water {
    color: #95badf;
  }

  .pill.torch {
    color: #d6a36e;
  }

  .location {
    font-size: 10px;
    color: var(--text-secondary);
    margin-top: 4px;
    letter-spacing: 0.8px;
  }

  .hud-actions {
    display: flex;
    gap: 8px;
  }

  .descend-btn, .retreat-btn {
    background: rgba(16, 18, 26, 0.8);
    border: 1px solid var(--line-dim);
    color: var(--text-secondary);
    padding: 3px 8px;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.7px;
  }

  .descend-btn:hover {
    border-color: var(--accent-gold);
    color: var(--accent-gold);
  }

  .retreat-btn:hover {
    border-color: var(--accent-red);
    color: var(--accent-red);
  }

  .minimap-wrap {
    border: 1px solid var(--line-dim);
    background: rgba(9, 12, 20, 0.85);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
    flex-shrink: 0;
  }

  .minimap-wrap canvas {
    display: block;
    width: 124px;
    height: 124px;
    image-rendering: pixelated;
  }

  @media (max-width: 900px) {
    .minimap-wrap canvas {
      width: 104px;
      height: 104px;
    }
  }
</style>
