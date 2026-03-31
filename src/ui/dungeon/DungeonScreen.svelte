<script lang="ts">
  import type { GameState, GameAction } from '../../engine/types';
  import { renderDungeon } from '../../renderer/dungeon/index';
  import { CREATURE_TYPES } from '../../data/creatures';
  import { setupKeyboardInput } from '../../lib/input';
  import { onMount } from 'svelte';
  import DungeonHud from './DungeonHud.svelte';
  import CombatHud from './CombatHud.svelte';

  let { gameState, onAction }: {
    gameState: GameState;
    onAction: (action: GameAction) => void;
  } = $props();

  let canvas: HTMLCanvasElement;
  let animFrame: number;

  onMount(() => {
    const ctx = canvas.getContext('2d')!;
    const cleanup = setupKeyboardInput(onAction);

    function draw(time: number) {
      if (gameState.dungeon) {
        const floor = gameState.dungeon.floors[gameState.dungeon.currentFloor];
        renderDungeon(
          ctx,
          gameState.dungeon,
          gameState.kingdom.resources.torches,
          floor.enemies,
          CREATURE_TYPES,
          time,
        );
      }
      animFrame = requestAnimationFrame(draw);
    }

    animFrame = requestAnimationFrame(draw);

    return () => {
      cleanup();
      cancelAnimationFrame(animFrame);
    };
  });
</script>

<div class="dungeon-screen">
  <canvas bind:this={canvas} width={800} height={600}></canvas>
  <DungeonHud {gameState} {onAction} />
  {#if gameState.combat && gameState.screen === 'combat'}
    <CombatHud
      combat={gameState.combat}
      heroIds={gameState.party}
      {onAction}
    />
  {/if}
</div>

<style>
  .dungeon-screen {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
  }

  canvas {
    max-width: 100%;
    max-height: 100%;
  }
</style>
