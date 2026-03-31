import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs tests in node', () => {
    expect(1 + 1).toBe(2);
  });
});
