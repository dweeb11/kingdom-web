<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { GameState, GameAction, CombatState } from '../../engine/types';

  let { combat, heroIds, onAction }: {
    combat: CombatState;
    heroIds: string[];
    onAction: (action: GameAction) => void;
  } = $props();

  let currentId = $derived(combat.turnOrder[combat.currentTurnIndex]);
  let isHeroTurn = $derived(combat.heroIds.includes(currentId));
  let currentHero = $derived(combat.combatants.find(c => c.id === currentId));

  let previousHpById = $state<Record<string, number>>({});
  let hitFlashById = $state<Record<string, true>>({});
  let deathFadeById = $state<Record<string, true>>({});
  const hitTimers: Record<string, number> = {};
  const fadeTimers: Record<string, number> = {};

  let displayHeroes = $derived(
    combat.combatants.filter(c => combat.heroIds.includes(c.id) && (c.hp > 0 || !!deathFadeById[c.id]))
  );

  let displayEnemies = $derived(
    combat.combatants.filter(c => combat.enemyIds.includes(c.id) && (c.hp > 0 || !!deathFadeById[c.id]))
  );

  function setHitFlash(id: string) {
    hitFlashById = { ...hitFlashById, [id]: true };
    if (hitTimers[id]) clearTimeout(hitTimers[id]);
    hitTimers[id] = window.setTimeout(() => {
      const next = { ...hitFlashById };
      delete next[id];
      hitFlashById = next;
    }, 240);
  }

  function setDeathFade(id: string) {
    deathFadeById = { ...deathFadeById, [id]: true };
    if (fadeTimers[id]) clearTimeout(fadeTimers[id]);
    fadeTimers[id] = window.setTimeout(() => {
      const next = { ...deathFadeById };
      delete next[id];
      deathFadeById = next;
    }, 760);
  }

  $effect(() => {
    const nextHpById: Record<string, number> = {};

    for (const combatant of combat.combatants) {
      nextHpById[combatant.id] = combatant.hp;
      const previousHp = previousHpById[combatant.id];
      if (previousHp === undefined) continue;
      if (combatant.hp < previousHp) {
        setHitFlash(combatant.id);
      }
      if (previousHp > 0 && combatant.hp <= 0) {
        setDeathFade(combatant.id);
      }
    }

    previousHpById = nextHpById;
  });

  onDestroy(() => {
    for (const id of Object.keys(hitTimers)) clearTimeout(hitTimers[id]);
    for (const id of Object.keys(fadeTimers)) clearTimeout(fadeTimers[id]);
  });

  function attack(targetId: string) {
    onAction({
      type: 'COMBAT_ACTION',
      heroId: currentId,
      action: { type: 'attack', targetId },
    });
  }

  function defend() {
    onAction({
      type: 'COMBAT_ACTION',
      heroId: currentId,
      action: { type: 'defend' },
    });
  }

  function flee() {
    onAction({
      type: 'COMBAT_ACTION',
      heroId: currentId,
      action: { type: 'flee' },
    });
  }
</script>

<div class="combat-hud">
  <div class="combat-header">
    <span>COMBAT — Round {combat.round}</span>
    <span>{currentHero?.name ?? '???'}'s turn</span>
  </div>

  <div class="combatants">
    <div class="side heroes">
      <h4>PARTY</h4>
      {#each displayHeroes as hero (hero.id)}
        <div class="combatant" class:active={hero.id === currentId} class:hit={!!hitFlashById[hero.id]} class:fading={!!deathFadeById[hero.id]} class:dead={hero.hp <= 0}>
          <span>{hero.name}</span>
          <span class="hp">{hero.hp}/{hero.maxHp}</span>
        </div>
      {/each}
    </div>
    <div class="side enemies">
      <h4>ENEMIES</h4>
      {#each displayEnemies as enemy (enemy.id)}
        <div class="combatant" class:hit={!!hitFlashById[enemy.id]} class:fading={!!deathFadeById[enemy.id]} class:dead={enemy.hp <= 0}>
          <span>{enemy.name}</span>
          <span class="hp">{enemy.hp}/{enemy.maxHp}</span>
          {#if isHeroTurn && enemy.hp > 0}
            <button class="target-btn" onclick={() => attack(enemy.id)}>ATK</button>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  {#if isHeroTurn}
    <div class="actions">
      <button onclick={defend}>DEFEND</button>
      <button onclick={flee}>FLEE</button>
    </div>
  {/if}

  <div class="combat-log">
    {#each combat.log.slice(-5) as entry}
      <p>{entry}</p>
    {/each}
  </div>
</div>

<style>
  .combat-hud {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(8, 10, 16, 0.95), rgba(8, 10, 16, 0.82));
    border-top: 1px solid var(--line-dim);
    padding: 12px;
    max-height: 50%;
  }

  .combat-header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--accent-red);
    letter-spacing: 2px;
    margin-bottom: 8px;
  }

  .combatants {
    display: flex;
    gap: 24px;
  }

  .side {
    flex: 1;
  }

  h4 {
    font-size: 10px;
    color: var(--text-secondary);
    letter-spacing: 1px;
    margin-bottom: 4px;
  }

  .combatant {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 11px;
    padding: 3px 4px;
    border: 1px solid transparent;
    transition: color 0.2s, border-color 0.2s, opacity 0.35s;
  }

  .combatant.active {
    color: var(--accent-orange);
    border-color: rgba(214, 163, 110, 0.35);
  }

  .hp {
    color: var(--accent-red);
    margin-left: auto;
  }

  .combatant.hit {
    animation: hit-flash 0.24s ease-out;
  }

  .combatant.dead {
    color: var(--text-secondary);
    opacity: 0.75;
    text-decoration: line-through;
  }

  .combatant.fading {
    animation: death-fade 0.76s ease-out forwards;
  }

  .target-btn {
    background: none;
    border: 1px solid var(--accent-red);
    color: var(--accent-red);
    padding: 1px 6px;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 9px;
  }

  .target-btn:hover {
    background: var(--accent-red);
    color: var(--bg-primary);
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .actions button {
    background: none;
    border: 1px solid var(--line-mid);
    color: var(--text-primary);
    padding: 4px 12px;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 10px;
  }

  .actions button:hover {
    border-color: var(--accent-orange);
    color: var(--accent-orange);
  }

  .combat-log {
    margin-top: 8px;
    border-top: 1px solid var(--line-dim);
    padding-top: 4px;
    max-height: 80px;
    overflow-y: auto;
  }

  .combat-log p {
    font-size: 9px;
    color: var(--text-secondary);
    margin: 1px 0;
  }

  @keyframes hit-flash {
    0% {
      background: rgba(217, 83, 79, 0.65);
      border-color: rgba(217, 83, 79, 0.95);
    }
    100% {
      background: transparent;
      border-color: transparent;
    }
  }

  @keyframes death-fade {
    0% {
      opacity: 0.8;
      filter: saturate(1);
    }
    100% {
      opacity: 0;
      filter: saturate(0.1);
    }
  }
</style>
