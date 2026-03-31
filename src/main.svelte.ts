import './style.css';
import { mount } from 'svelte';
import App from './ui/App.svelte';
import { createInitialState } from './engine/state';
import { resolveTurn } from './engine/turn';
import { saveToLocalStorage, loadFromLocalStorage, serialize } from './engine/save';
import type { GameAction } from './engine/types';

// Load saved state or create fresh
let state = $state(loadFromLocalStorage() ?? createInitialState());

function handleAction(action: GameAction) {
  state = resolveTurn(state, action);

  // Auto-save on kingdom and run_summary transitions
  if (state.screen === 'kingdom' || state.screen === 'run_summary') {
    saveToLocalStorage(state);
  }
}

// Export save function for dev console
(window as any).__exportSave = () => {
  const json = serialize(state);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kingdom-save.json';
  a.click();
  URL.revokeObjectURL(url);
};

const app = document.getElementById('app');
if (app) {
  mount(App, {
    target: app,
    props: {
      get state() { return state; },
      onAction: handleAction,
    },
  });
}
