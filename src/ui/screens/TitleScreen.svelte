<script lang="ts">
  import type { GameState, GameAction } from '../../engine/types';
  import { loadFromLocalStorage, deserialize } from '../../engine/save';

  let { gameState, onAction }: {
    gameState: GameState;
    onAction: (action: GameAction) => void;
  } = $props();

  let hasSave = $derived(loadFromLocalStorage() !== null);
  let importError: string | null = $state(null);

  function continueGame() {
    const saved = loadFromLocalStorage();
    if (saved) {
      // Dispatch navigation — the main loop will load state
      onAction({ type: 'NAVIGATE', screen: saved.screen === 'title' ? 'kingdom' : saved.screen });
    }
  }

  function importSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = deserialize(text);
        // Loaded successfully — continue from imported state
        onAction({ type: 'NAVIGATE', screen: imported.screen === 'title' ? 'kingdom' : imported.screen });
        importError = null;
      } catch (e) {
        importError = 'Invalid save file';
      }
    };
    input.click();
  }
</script>

<div class="title-screen">
  <div class="title-art">
    <h1>KINGDOM</h1>
    <p class="subtitle">A Dungeon Crawler</p>
  </div>

  <div class="menu">
    <button onclick={() => onAction({ type: 'NEW_GAME' })}>NEW GAME</button>
    {#if hasSave}
      <button onclick={continueGame}>CONTINUE</button>
    {/if}
    <button class="secondary" onclick={importSave}>IMPORT SAVE</button>
  </div>

  {#if importError}
    <p class="error">{importError}</p>
  {/if}

  <p class="controls-hint">
    WASD / Arrow keys to move in dungeon
  </p>
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

  .title-art {
    text-align: center;
  }

  h1 {
    font-size: 48px;
    letter-spacing: 16px;
    color: var(--line-bright);
    text-shadow: 0 0 20px rgba(192, 192, 192, 0.3);
  }

  .subtitle {
    font-size: 12px;
    color: var(--text-secondary);
    letter-spacing: 4px;
    margin-top: 8px;
  }

  .menu {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 200px;
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

  .secondary {
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--text-secondary);
    border-color: var(--line-dim);
  }

  .error {
    color: var(--accent-red);
    font-size: 11px;
  }

  .controls-hint {
    font-size: 9px;
    color: var(--text-secondary);
    position: absolute;
    bottom: 16px;
  }
</style>
