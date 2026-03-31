<script lang="ts">
  import type { GameState, GameAction } from '../../engine/types';

  let { gameState, onAction }: {
    gameState: GameState;
    onAction: (action: GameAction) => void;
  } = $props();
</script>

<div class="run-summary">
  <h2>EXPEDITION COMPLETE</h2>

  {#if gameState.runSummary}
    <div class="stats">
      <p>Gold earned: {gameState.runSummary.goldEarned}</p>
      <p>XP earned: {gameState.runSummary.xpEarned}</p>
      <p>Enemies defeated: {gameState.runSummary.enemiesDefeated}</p>
      {#if gameState.runSummary.heroesLost.length > 0}
        <p class="losses">Heroes lost: {gameState.runSummary.heroesLost.length}</p>
      {/if}
    </div>
  {:else}
    <p class="empty">No data.</p>
  {/if}

  <button onclick={() => onAction({ type: 'END_RUN' })}>RETURN TO KINGDOM</button>
</div>

<style>
  .run-summary {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 24px;
  }

  h2 {
    font-size: 24px;
    color: var(--accent-orange);
    letter-spacing: 4px;
  }

  .stats {
    text-align: center;
    font-size: 14px;
    color: var(--text-primary);
  }

  .stats p {
    margin: 4px 0;
  }

  .losses {
    color: var(--accent-red);
  }

  .empty {
    color: var(--text-secondary);
  }

  button {
    background: none;
    border: 1px solid var(--accent-orange);
    color: var(--accent-orange);
    padding: 8px 24px;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 2px;
  }

  button:hover {
    background: var(--accent-orange);
    color: var(--bg-primary);
  }
</style>
