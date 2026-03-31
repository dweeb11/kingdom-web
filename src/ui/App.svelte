<script lang="ts">
  import type { GameAction } from '../engine/types';
  import { createInitialState } from '../engine/state';
  import { resolveTurn } from '../engine/turn';
  import { saveToLocalStorage, loadFromLocalStorage, serialize } from '../engine/save';
  import KingdomScreen from './kingdom/KingdomScreen.svelte';
  import TitleScreen from './screens/TitleScreen.svelte';
  import DungeonScreen from './dungeon/DungeonScreen.svelte';
  import RunSummary from './screens/RunSummary.svelte';
  import PartyBar from './shared/PartyBar.svelte';

  let gameState = $state(loadFromLocalStorage() ?? createInitialState());

  function onAction(action: GameAction) {
    gameState = resolveTurn(gameState, action);

    if (gameState.screen === 'kingdom' || gameState.screen === 'run_summary') {
      saveToLocalStorage(gameState);
    }
  }

  // Export save for dev console
  (window as any).__exportSave = () => {
    const json = serialize(gameState);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kingdom-save.json';
    a.click();
    URL.revokeObjectURL(url);
  };
</script>

<div class="app-layout">
  <div class="screen-area">
    {#if gameState.screen === 'title'}
      <TitleScreen {gameState} {onAction} />
    {:else if gameState.screen === 'kingdom'}
      <KingdomScreen {gameState} {onAction} />
    {:else if gameState.screen === 'dungeon' || gameState.screen === 'combat'}
      <DungeonScreen {gameState} {onAction} />
    {:else if gameState.screen === 'run_summary'}
      <RunSummary {gameState} {onAction} />
    {/if}
  </div>
  {#if gameState.screen !== 'title'}
    <PartyBar heroes={gameState.kingdom.heroRoster} />
  {/if}
</div>

<style>
  .app-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .screen-area {
    flex: 1;
    overflow: hidden;
    position: relative;
  }
</style>
