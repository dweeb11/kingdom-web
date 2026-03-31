<script lang="ts">
  import type { GameState, GameAction } from '../../engine/types';

  let { state, onAction }: {
    state: GameState;
    onAction: (action: GameAction) => void;
  } = $props();
</script>

<div class="dungeon-screen">
  <p>Dungeon view — coming in Task 13</p>
  <button onclick={() => onAction({ type: 'RETREAT' })}>RETREAT</button>
</div>

<style>
  .dungeon-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);
    gap: 16px;
  }

  button {
    background: none;
    border: 1px solid var(--accent-red);
    color: var(--accent-red);
    padding: 6px 16px;
    cursor: pointer;
    font-family: var(--font-mono);
  }
</style>
