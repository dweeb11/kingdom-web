<script lang="ts">
  import type { KingdomResources } from '../../engine/types';

  let { resources }: { resources: KingdomResources } = $props();
</script>

<div class="resource-bar">
  <span class="resource gold">GOLD {resources.gold}g</span>
  <span class="resource food">FOOD {resources.food}</span>
  <span class="resource water">WATER {resources.water}</span>
  <span class="resource torches">TORCH {resources.torches}</span>
</div>

<style>
  .resource-bar {
    display: flex;
    gap: 10px;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--line-dim);
    font-size: 12px;
  }

  .resource {
    color: var(--text-secondary);
    border: 1px solid rgba(108, 120, 146, 0.28);
    background: rgba(16, 18, 26, 0.65);
    padding: 2px 6px;
  }

  .gold {
    color: var(--accent-gold);
  }
</style>
