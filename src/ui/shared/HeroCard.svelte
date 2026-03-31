<script lang="ts">
  import type { Hero } from '../../engine/types';
  import { composeCreatureSvg } from '../../renderer/creatures/composer';

  let { hero, compact = false, onclick }: {
    hero: Hero;
    compact?: boolean;
    onclick?: () => void;
  } = $props();

  let hpPercent = $derived(Math.round((hero.stats.hp / hero.stats.maxHp) * 100));

  let classColor = $derived(
    hero.heroClass === 'warrior' ? '#ff8c00' :
    hero.heroClass === 'rogue' ? '#7cfc00' :
    '#4488ff'
  );
</script>

<button
  class="hero-card"
  class:compact
  class:dead={!hero.alive}
  onclick={onclick}
  disabled={!onclick}
>
  <div class="hero-header">
    <span class="hero-name">{hero.name}</span>
    <span class="hero-class" style="color: {classColor}">{hero.heroClass.toUpperCase()}</span>
  </div>

  {#if !compact}
    <div class="hero-stats">
      <div class="stat-row">
        <span>LV {hero.level}</span>
        <span>HP {hero.stats.hp}/{hero.stats.maxHp}</span>
      </div>
      <div class="hp-bar">
        <div class="hp-fill" style="width: {hpPercent}%"></div>
      </div>
      <div class="stat-row">
        <span>ATK {hero.stats.attack}{hero.weapon ? `+${hero.weapon.attackBonus}` : ''}</span>
        <span>DEF {hero.stats.defense}{hero.armor ? `+${hero.armor.defenseBonus}` : ''}</span>
        <span>SPD {hero.stats.speed}</span>
      </div>
      {#if hero.weapon}
        <div class="gear-slot">W: {hero.weapon.name}</div>
      {/if}
      {#if hero.armor}
        <div class="gear-slot">A: {hero.armor.name}</div>
      {/if}
    </div>
  {/if}
</button>

<style>
  .hero-card {
    background: var(--bg-secondary);
    border: 1px solid var(--line-dim);
    padding: 8px;
    text-align: left;
    cursor: default;
    font-family: var(--font-mono);
    color: var(--text-primary);
    width: 100%;
  }

  .hero-card:not(:disabled) {
    cursor: pointer;
  }

  .hero-card:not(:disabled):hover {
    border-color: var(--accent-orange);
  }

  .hero-card.dead {
    opacity: 0.4;
  }

  .hero-header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }

  .hero-name {
    color: var(--text-primary);
  }

  .hero-class {
    font-size: 10px;
    letter-spacing: 1px;
  }

  .hero-stats {
    margin-top: 4px;
    font-size: 10px;
    color: var(--text-secondary);
  }

  .stat-row {
    display: flex;
    gap: 8px;
    margin-top: 2px;
  }

  .hp-bar {
    height: 3px;
    background: var(--line-dim);
    margin: 2px 0;
  }

  .hp-fill {
    height: 100%;
    background: var(--accent-red);
    transition: width 0.3s;
  }

  .gear-slot {
    color: var(--accent-gold);
    font-size: 9px;
    margin-top: 2px;
  }

  .compact .hero-stats {
    display: none;
  }
</style>
