<script lang="ts">
  import type { Hero } from '../../engine/types';

  let { heroes }: { heroes: Hero[] } = $props();

  let aliveHeroes = $derived(heroes.filter(h => h.alive));
</script>

{#if aliveHeroes.length > 0}
  <div class="party-bar">
    {#each aliveHeroes as hero (hero.id)}
      <div class="party-member">
        <span class="name">{hero.name}</span>
        <span class="class" style="color: {hero.heroClass === 'warrior' ? '#ff8c00' : hero.heroClass === 'rogue' ? '#7cfc00' : '#4488ff'}">{hero.heroClass.toUpperCase()}</span>
        <span class="level">LV{hero.level}</span>
        <div class="hp-wrap">
          <div class="hp-fill" style="width: {Math.round((hero.stats.hp / hero.stats.maxHp) * 100)}%"></div>
        </div>
        <span class="hp-text">{hero.stats.hp}/{hero.stats.maxHp}</span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .party-bar {
    display: flex;
    gap: 12px;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-top: 1px solid var(--line-dim);
    flex-shrink: 0;
  }

  .party-member {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    flex: 1;
    min-width: 0;
  }

  .name {
    color: var(--text-primary);
    white-space: nowrap;
  }

  .class {
    font-size: 8px;
    letter-spacing: 1px;
  }

  .level {
    color: var(--text-secondary);
    font-size: 9px;
  }

  .hp-wrap {
    flex: 1;
    height: 4px;
    background: var(--line-dim);
    min-width: 30px;
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
