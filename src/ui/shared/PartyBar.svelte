<script lang="ts">
  import type { Hero } from '../../engine/types';
  import { MAX_PARTY_SIZE } from '../../engine/constants';

  let { heroes }: { heroes: Hero[] } = $props();

  let slots = $derived(
    Array.from({ length: MAX_PARTY_SIZE }, (_, i) => heroes[i] ?? null)
  );
</script>

<div class="party-bar">
  {#each slots as hero, i (i)}
    <div class="party-slot" class:empty={!hero} class:dead={hero && !hero.alive}>
      {#if hero}
        <div class="slot-header">
          <span class="name">{hero.name}</span>
          <span class="class-badge" style="color: {hero.heroClass === 'warrior' ? '#ff8c00' : hero.heroClass === 'rogue' ? '#7cfc00' : '#4488ff'}">{hero.heroClass.toUpperCase()}</span>
        </div>
        <div class="slot-stats">
          <span class="level">LV{hero.level}</span>
          <div class="hp-wrap">
            <div class="hp-fill" style="width: {Math.round((hero.stats.hp / hero.stats.maxHp) * 100)}%"></div>
          </div>
          <span class="hp-text">{hero.stats.hp}/{hero.stats.maxHp}</span>
        </div>
      {:else}
        <span class="empty-label">—</span>
      {/if}
    </div>
  {/each}
</div>

<style>
  .party-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2px;
    padding: 4px;
    background: var(--bg-primary);
    border-top: 1px solid var(--line-dim);
    flex-shrink: 0;
  }

  .party-slot {
    background: var(--bg-secondary);
    padding: 6px 8px;
    min-height: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .party-slot.empty {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .party-slot.dead {
    opacity: 0.3;
  }

  .empty-label {
    color: var(--line-dim);
    font-size: 14px;
  }

  .slot-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .name {
    color: var(--text-primary);
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .class-badge {
    font-size: 8px;
    letter-spacing: 1px;
  }

  .slot-stats {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
  }

  .level {
    color: var(--text-secondary);
    font-size: 9px;
  }

  .hp-wrap {
    flex: 1;
    height: 4px;
    background: var(--line-dim);
    min-width: 20px;
  }

  .hp-fill {
    height: 100%;
    background: var(--accent-red);
  }

  .hp-text {
    color: var(--accent-red);
    font-size: 9px;
    white-space: nowrap;
  }
</style>
