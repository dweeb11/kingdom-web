import { describe, it, expect } from 'vitest';
import { serialize, deserialize } from '../../src/engine/save';
import { createInitialState } from '../../src/engine/state';
import { SCHEMA_VERSION } from '../../src/engine/constants';

describe('serialize/deserialize', () => {
  it('round-trips a game state', () => {
    const state = createInitialState();
    const json = serialize(state);
    const restored = deserialize(json);
    expect(restored).toEqual(state);
  });

  it('stamps schema version', () => {
    const state = createInitialState();
    const json = serialize(state);
    const parsed = JSON.parse(json);
    expect(parsed.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('throws on schema version mismatch', () => {
    const state = createInitialState();
    const json = serialize(state);
    const parsed = JSON.parse(json);
    parsed.schemaVersion = 999;
    expect(() => deserialize(JSON.stringify(parsed))).toThrow();
  });

  it('throws on invalid JSON', () => {
    expect(() => deserialize('not json')).toThrow();
  });
});
