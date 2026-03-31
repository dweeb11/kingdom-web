<script lang="ts">
  import type { GameState, GameAction } from '../../engine/types';

  let { state, onAction }: {
    state: GameState;
    onAction: (action: GameAction) => void;
  } = $props();
</script>

<div class="title-screen">
  <h1>KINGDOM</h1>
  <div class="menu">
    <button onclick={() => onAction({ type: 'NEW_GAME' })}>NEW GAME</button>
  </div>
</div>

<style>
  .title-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 32px;
  }

  h1 {
    font-size: 48px;
    letter-spacing: 16px;
    color: var(--line-bright);
    text-shadow: 0 0 20px rgba(192, 192, 192, 0.3);
  }

  .menu {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  button {
    background: none;
    border: 1px solid var(--line-mid);
    color: var(--text-primary);
    padding: 8px 32px;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 4px;
  }

  button:hover {
    border-color: var(--accent-orange);
    color: var(--accent-orange);
  }
</style>
