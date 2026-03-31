import type { GameState } from './types';
import { SCHEMA_VERSION } from './constants';

const STORAGE_KEY = 'kingdom-web-save';

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function deserialize(json: string): GameState {
  const parsed = JSON.parse(json);
  if (parsed.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(
      `Save version mismatch: expected ${SCHEMA_VERSION}, got ${parsed.schemaVersion}`
    );
  }
  return parsed as GameState;
}

export function saveToLocalStorage(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, serialize(state));
}

export function loadFromLocalStorage(): GameState | null {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return null;
  try {
    return deserialize(json);
  } catch {
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(STORAGE_KEY);
}
