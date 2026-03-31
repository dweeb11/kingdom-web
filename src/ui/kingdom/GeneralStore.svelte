<script lang="ts">
  import type { GameState, GameAction } from '../../engine/types';
  import { SUPPLY_COST } from '../../engine/constants';
  import { GEAR } from '../../data/gear';
  import HeroCard from '../shared/HeroCard.svelte';

  let { state, onAction }: {
    state: GameState;
    onAction: (action: GameAction) => void;
  } = $props();

  let gearList = $derived(Object.values(GEAR));

  function buySupply(item: 'food' | 'water' | 'torches') {
    onAction({ type: 'BUY_SUPPLIES', item, quantity: 5 });
  }
</script>

<div class="store">
  <h3>GENERAL STORE</h3>

  <div class="section">
    <h4>SUPPLIES</h4>
    <div class="supply-row">
      <button class="buy-btn" onclick={() => buySupply('food')}>
        +5 Food ({SUPPLY_COST.food * 5}g)
      </button>
      <button class="buy-btn" onclick={() => buySupply('water')}>
        +5 Water ({SUPPLY_COST.water * 5}g)
      </button>
      <button class="buy-btn" onclick={() => buySupply('torches')}>
        +5 Torches ({SUPPLY_COST.torches * 5}g)
      </button>
    </div>
  </div>

  <div class="section">
    <h4>GEAR</h4>
    {#if state.kingdom.heroRoster.length === 0}
      <p class="empty">Hire heroes first to buy gear.</p>
    {:else}
      <div class="gear-grid">
        {#each gearList as gear (gear.id)}
          <div class="gear-item">
            <span class="gear-name">{gear.name}</span>
            <span class="gear-stats">
              {gear.slot === 'weapon' ? `ATK+${gear.attackBonus}` : `DEF+${gear.defenseBonus}`}
            </span>
            <span class="gear-classes">
              {gear.proficiencies.join(', ')}
            </span>
            <span class="gear-cost">
              {(gear.attackBonus + gear.defenseBonus) * 5}g
            </span>
            {#each state.kingdom.heroRoster as hero (hero.id)}
              {#if gear.proficiencies.includes(hero.heroClass)}
                <button
                  class="equip-btn"
                  onclick={() => onAction({ type: 'BUY_GEAR', gearId: gear.id, heroId: hero.id })}
                >
                  → {hero.name}
                </button>
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .store {
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

  h4 {
    font-size: 10px;
    color: var(--text-secondary);
    letter-spacing: 1px;
    margin: 12px 0 6px;
  }

  .supply-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .buy-btn, .equip-btn {
    background: none;
    border: 1px solid var(--line-dim);
    color: var(--text-primary);
    padding: 4px 8px;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 10px;
  }

  .buy-btn:hover, .equip-btn:hover {
    border-color: var(--accent-gold);
    color: var(--accent-gold);
  }

  .gear-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .gear-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    padding: 4px;
    border: 1px solid var(--line-dim);
    flex-wrap: wrap;
  }

  .gear-name {
    color: var(--text-primary);
    min-width: 100px;
  }

  .gear-stats {
    color: var(--accent-gold);
  }

  .gear-classes {
    color: var(--text-secondary);
    font-size: 9px;
  }

  .gear-cost {
    color: var(--accent-gold);
    margin-left: auto;
  }

  .empty {
    color: var(--text-secondary);
    font-size: 11px;
    font-style: italic;
  }
</style>
