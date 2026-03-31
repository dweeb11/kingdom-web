<script lang="ts">
  import type { GameState, GameAction, CombatState } from '../../engine/types';

  let { combat, heroIds, onAction }: {
    combat: CombatState;
    heroIds: string[];
    onAction: (action: GameAction) => void;
  } = $props();

  let currentId = $derived(combat.turnOrder[combat.currentTurnIndex]);
  let isHeroTurn = $derived(combat.heroIds.includes(currentId));
  let currentHero = $derived(combat.combatants.find(c => c.id === currentId));

  let aliveEnemies = $derived(
    combat.combatants.filter(c => combat.enemyIds.includes(c.id) && c.hp > 0)
  );

  let aliveHeroes = $derived(
    combat.combatants.filter(c => combat.heroIds.includes(c.id) && c.hp > 0)
  );

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
      {#each aliveHeroes as hero (hero.id)}
        <div class="combatant" class:active={hero.id === currentId}>
          <span>{hero.name}</span>
          <span class="hp">{hero.hp}/{hero.maxHp}</span>
        </div>
      {/each}
    </div>
    <div class="side enemies">
      <h4>ENEMIES</h4>
      {#each aliveEnemies as enemy (enemy.id)}
        <div class="combatant">
          <span>{enemy.name}</span>
          <span class="hp">{enemy.hp}/{enemy.maxHp}</span>
          {#if isHeroTurn}
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
    background: rgba(8, 8, 8, 0.9);
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
    padding: 2px 0;
  }

  .combatant.active {
    color: var(--accent-orange);
  }

  .hp {
    color: var(--accent-red);
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
</style>
