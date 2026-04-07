<script lang="ts">
  import type { GameState, GameAction } from '../../engine/types';

  let { gameState, onAction }: {
    gameState: GameState;
    onAction: (action: GameAction) => void;
  } = $props();

  let currentTile = $derived(
    gameState.dungeon
      ? gameState.dungeon.floors[gameState.dungeon.currentFloor]
          .grid.tiles[gameState.dungeon.playerPosition.y][gameState.dungeon.playerPosition.x]
      : null
  );

  let canDescend = $derived(currentTile?.type === 'stairs_down');
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

  {#if gameState.dungeon}
    <div class="location">
      Floor {gameState.dungeon.currentFloor + 1} — Facing {gameState.dungeon.playerFacing}
    </div>
  {/if}
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

  .supplies {
    display: flex;
    gap: 8px;
    font-size: 10px;
    color: var(--text-secondary);
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
</style>
