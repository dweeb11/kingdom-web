<script lang="ts">
  let { title, onClose, children }: {
    title: string;
    onClose: () => void;
    children: any;
  } = $props();
</script>

<div class="modal-overlay" onclick={onClose} role="presentation">
  <div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
    <div class="modal-header">
      <h2>{title}</h2>
      <button class="close-btn" onclick={onClose}>X</button>
    </div>
    <div class="modal-body">
      {@render children()}
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal-content {
    background: var(--bg-panel);
    border: 1px solid var(--line-dim);
    padding: 16px;
    min-width: 300px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--line-dim);
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  h2 {
    font-size: 14px;
    color: var(--accent-orange);
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .close-btn {
    background: none;
    border: 1px solid var(--line-dim);
    color: var(--text-secondary);
    padding: 2px 8px;
    cursor: pointer;
    font-family: var(--font-mono);
  }

  .close-btn:hover {
    color: var(--accent-red);
    border-color: var(--accent-red);
  }
</style>
