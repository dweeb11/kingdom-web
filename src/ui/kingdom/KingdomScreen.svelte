<script lang="ts">
  import type { GameState, GameAction } from '../../engine/types';
  import ResourceBar from './ResourceBar.svelte';
  import Tavern from './Tavern.svelte';
  import Gate from './Gate.svelte';
  import GeneralStore from './GeneralStore.svelte';
  import { renderSkyline, getBuildingAtPosition } from '../../renderer/kingdom/skyline';
  import { onMount } from 'svelte';

  let { gameState, onAction }: {
    gameState: GameState;
    onAction: (action: GameAction) => void;
  } = $props();

  let canvas: HTMLCanvasElement;
  let selectedBuilding: string | null = $state(null);

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function draw() {
      renderSkyline(ctx!, selectedBuilding, gameState.kingdom.buildings);
    }

    draw();

    $effect(() => {
      selectedBuilding;
      draw();
    });
  });

  function handleCanvasClick(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const building = getBuildingAtPosition(x, y, canvas.width, canvas.height, gameState.kingdom.buildings);
    selectedBuilding = building;
  }
</script>

<div class="kingdom-screen">
  <ResourceBar resources={gameState.kingdom.resources} />

  <div class="kingdom-layout">
    <div class="skyline-area">
      <canvas
        bind:this={canvas}
        width={800}
        height={400}
        onclick={handleCanvasClick}
      ></canvas>
    </div>

    <div class="panel-area">
      {#if selectedBuilding === 'tavern'}
        <Tavern state={gameState} {onAction} />
      {:else if selectedBuilding === 'gate'}
        <Gate gameState={gameState} {onAction} />
      {:else if selectedBuilding === 'general_store'}
        <GeneralStore state={gameState} {onAction} />
      {:else}
        <div class="no-selection">
          <p>Click a building to interact</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .kingdom-screen {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .kingdom-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .skyline-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
  }

  canvas {
    max-width: 100%;
    cursor: pointer;
  }

  .panel-area {
    width: 320px;
    background: var(--bg-panel);
    border-left: 1px solid var(--line-dim);
    overflow-y: auto;
  }

  .no-selection {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);
    font-size: 12px;
  }
</style>
