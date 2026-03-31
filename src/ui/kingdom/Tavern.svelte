<script lang="ts">
  import type { GameState, GameAction } from '../../engine/types';
  import HeroCard from '../shared/HeroCard.svelte';

  let { state, onAction }: {
    state: GameState;
    onAction: (action: GameAction) => void;
  } = $props();
</script>

<div class="tavern">
  <h3>TAVERN — Heroes for Hire</h3>

  {#if state.kingdom.tavernRoster.length === 0}
    <p class="empty">No heroes available. Check back later.</p>
  {:else}
    <div class="roster">
      {#each state.kingdom.tavernRoster as hero (hero.id)}
        <HeroCard
          {hero}
          showCost
          onclick={() => onAction({ type: 'HIRE_HERO', heroId: hero.id })}
        />
      {/each}
    </div>
  {/if}

  <h3>YOUR HEROES</h3>
  {#if state.kingdom.heroRoster.length === 0}
    <p class="empty">No heroes hired yet.</p>
  {:else}
    <div class="roster">
      {#each state.kingdom.heroRoster as hero (hero.id)}
        <HeroCard {hero} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .tavern {
    padding: 12px;
  }

  h3 {
    font-size: 12px;
    color: var(--accent-orange);
    letter-spacing: 2px;
    margin: 12px 0 8px;
    border-bottom: 1px solid var(--line-dim);
    padding-bottom: 4px;
  }

  .roster {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .empty {
    color: var(--text-secondary);
    font-size: 11px;
    font-style: italic;
  }
</style>
