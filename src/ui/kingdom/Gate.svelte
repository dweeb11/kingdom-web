<script lang="ts">
  import type { GameState, GameAction } from '../../engine/types';
  import HeroCard from '../shared/HeroCard.svelte';
  import { MAX_PARTY_SIZE } from '../../engine/constants';

  let { gameState, onAction }: {
    gameState: GameState;
    onAction: (action: GameAction) => void;
  } = $props();

  let selectedIds: string[] = $state([]);

  let availableHeroes = $derived(
    gameState.kingdom.heroRoster.filter(h => h.alive)
  );

  let canLaunch = $derived(selectedIds.length > 0);

  function toggleHero(id: string) {
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter(h => h !== id);
    } else if (selectedIds.length < MAX_PARTY_SIZE) {
      selectedIds = [...selectedIds, id];
    }
  }

  function launch() {
    onAction({ type: 'SELECT_PARTY', heroIds: selectedIds });
    onAction({ type: 'ENTER_DUNGEON' });
  }
</script>

<div class="gate">
  <h3>GATE — Party Selection</h3>
  <p class="info">Select up to {MAX_PARTY_SIZE} heroes for the expedition.</p>

  {#if availableHeroes.length === 0}
    <p class="empty">No heroes available. Visit the Tavern first.</p>
  {:else}
    <div class="roster">
      {#each availableHeroes as hero (hero.id)}
        <div class="hero-select" class:selected={selectedIds.includes(hero.id)}>
          <HeroCard
            {hero}
            onclick={() => toggleHero(hero.id)}
          />
        </div>
      {/each}
    </div>
  {/if}

  <div class="launch-bar">
    <span class="party-count">{selectedIds.length}/{MAX_PARTY_SIZE}</span>
    <button class="launch-btn" disabled={!canLaunch} onclick={launch}>
      ENTER DUNGEON
    </button>
  </div>
</div>

<style>
  .gate {
    padding: 12px;
  }

  h3 {
    font-size: 12px;
    color: var(--accent-orange);
    letter-spacing: 2px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--line-dim);
    padding-bottom: 4px;
  }

  .info {
    font-size: 10px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .roster {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .hero-select {
    border: 1px solid transparent;
  }

  .hero-select.selected {
    border-color: var(--accent-gold);
  }

  .launch-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 8px;
    border-top: 1px solid var(--line-dim);
  }

  .party-count {
    color: var(--text-secondary);
    font-size: 12px;
  }

  .launch-btn {
    background: none;
    border: 1px solid var(--accent-orange);
    color: var(--accent-orange);
    padding: 6px 16px;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 2px;
  }

  .launch-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .launch-btn:not(:disabled):hover {
    background: var(--accent-orange);
    color: var(--bg-primary);
  }

  .empty {
    color: var(--text-secondary);
    font-size: 11px;
    font-style: italic;
  }
</style>
