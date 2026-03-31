import type { GameAction } from '../engine/types';

type ActionCallback = (action: GameAction) => void;

const KEY_MAP: Record<string, GameAction> = {
  'w': { type: 'MOVE', direction: 'forward' },
  'ArrowUp': { type: 'MOVE', direction: 'forward' },
  's': { type: 'MOVE', direction: 'backward' },
  'ArrowDown': { type: 'MOVE', direction: 'backward' },
  'a': { type: 'MOVE', direction: 'turn_left' },
  'ArrowLeft': { type: 'MOVE', direction: 'turn_left' },
  'd': { type: 'MOVE', direction: 'turn_right' },
  'ArrowRight': { type: 'MOVE', direction: 'turn_right' },
  'Escape': { type: 'RETREAT' },
};

export function setupKeyboardInput(onAction: ActionCallback): () => void {
  function handler(e: KeyboardEvent) {
    const action = KEY_MAP[e.key];
    if (action) {
      e.preventDefault();
      onAction(action);
    }
  }

  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
