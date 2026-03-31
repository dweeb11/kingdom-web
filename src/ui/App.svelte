<script lang="ts">
  import type { GameState, GameAction } from '../engine/types';
  import KingdomScreen from './kingdom/KingdomScreen.svelte';
  import TitleScreen from './screens/TitleScreen.svelte';
  import DungeonScreen from './dungeon/DungeonScreen.svelte';
  import RunSummary from './screens/RunSummary.svelte';

  let { state, onAction }: {
    state: GameState;
    onAction: (action: GameAction) => void;
  } = $props();
</script>

{#if state.screen === 'title'}
  <TitleScreen gameState={state} {onAction} />
{:else if state.screen === 'kingdom'}
  <KingdomScreen gameState={state} {onAction} />
{:else if state.screen === 'dungeon' || state.screen === 'combat'}
  <DungeonScreen {state} {onAction} />
{:else if state.screen === 'run_summary'}
  <RunSummary {state} {onAction} />
{/if}
