import './style.css';
import { mount } from 'svelte';
import App from './ui/App.svelte';
import { createInitialState } from './engine/state';
import { resolveTurn } from './engine/turn';
import type { GameAction, GameState } from './engine/types';

let state = $state(createInitialState());

function handleAction(action: GameAction) {
  state = resolveTurn(state, action);
}

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
