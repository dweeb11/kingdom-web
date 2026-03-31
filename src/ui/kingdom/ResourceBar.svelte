<script lang="ts">
  import type { KingdomResources } from '../../engine/types';

  let { resources }: { resources: KingdomResources } = $props();
</script>

<div class="resource-bar">
  <span class="resource gold">{resources.gold}g</span>
  <span class="resource food">{resources.food} food</span>
  <span class="resource water">{resources.water} water</span>
  <span class="resource torches">{resources.torches} torches</span>
</div>

<style>
  .resource-bar {
    display: flex;
    gap: 16px;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--line-dim);
    font-size: 12px;
  }

  .resource {
    color: var(--text-secondary);
  }

  .gold {
    color: var(--accent-gold);
  }
</style>
