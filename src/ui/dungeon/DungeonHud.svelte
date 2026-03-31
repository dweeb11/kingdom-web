<script lang="ts">
  import type { GameState, GameAction } from '../../engine/types';

  let { gameState, onAction }: {
    gameState: GameState;
    onAction: (action: GameAction) => void;
  } = $props();

  let partyHeroes = $derived(
    gameState.party
      .map(id => gameState.kingdom.heroRoster.find(h => h.id === id))
      .filter(h => h != null)
  );

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
    <div class="party-status">
      {#each partyHeroes as hero}
        {#if hero}
          <div class="hero-mini" class:dead={!hero.alive}>
            <span class="name">{hero.name}</span>
            <span class="hp">{hero.stats.hp}/{hero.stats.maxHp}</span>
          </div>
        {/if}
      {/each}
    </div>

    <div class="supplies">
      <span>{gameState.kingdom.resources.food} food</span>
      <span>{gameState.kingdom.resources.water} water</span>
      <span>{gameState.kingdom.resources.torches} torches</span>
    </div>
  </div>

  {#if gameState.dungeon}
    <div class="location">
      Floor {gameState.dungeon.currentFloor + 1} — Facing {gameState.dungeon.playerFacing}
      ({gameState.dungeon.playerPosition.x}, {gameState.dungeon.playerPosition.y})
    </div>
  {/if}

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

<style>
  .dungeon-hud {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(8, 8, 8, 0.8);
    padding: 8px 12px;
    border-bottom: 1px solid var(--line-dim);
  }

  .hud-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .party-status {
    display: flex;
    gap: 12px;
  }

  .hero-mini {
    font-size: 10px;
  }

  .hero-mini.dead {
    opacity: 0.3;
  }

  .name {
    color: var(--text-primary);
  }

  .hp {
    color: var(--accent-red);
    margin-left: 4px;
  }

  .supplies {
    display: flex;
    gap: 12px;
    font-size: 10px;
    color: var(--text-secondary);
  }

  .location {
    font-size: 9px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .hud-actions {
    display: flex;
    gap: 8px;
    margin-top: 6px;
  }

  .descend-btn, .retreat-btn {
    background: none;
    border: 1px solid var(--line-dim);
    color: var(--text-secondary);
    padding: 2px 8px;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 9px;
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
