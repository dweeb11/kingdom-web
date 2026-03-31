import { describe, it, expect } from 'vitest';
import { levelUp, canEquip, equipGear, applyXp } from '../../src/engine/heroes';
import { generateHero } from '../../src/engine/state';
import type { Hero, GearItem } from '../../src/engine/types';
import { XP_PER_LEVEL } from '../../src/engine/constants';

function makeHero(overrides: Partial<Hero> = {}): Hero {
  return {
    id: 'hero_test',
    name: 'Test',
    heroClass: 'warrior',
    level: 1,
    xp: 0,
    stats: {
      hp: 30, maxHp: 30, attack: 8, defense: 6, speed: 4,
      str: 10, dex: 5, int: 3, wis: 5,
    },
    weapon: null,
    armor: null,
    alive: true,
    ...overrides,
  };
}

const sword: GearItem = {
  id: 'sword_1',
  name: 'Iron Sword',
  slot: 'weapon',
  attackBonus: 3,
  defenseBonus: 0,
  proficiencies: ['warrior', 'rogue'],
};

const staff: GearItem = {
  id: 'staff_1',
  name: 'Oak Staff',
  slot: 'weapon',
  attackBonus: 2,
  defenseBonus: 1,
  proficiencies: ['mage'],
};

const chainmail: GearItem = {
  id: 'chain_1',
  name: 'Chainmail',
  slot: 'armor',
  attackBonus: 0,
  defenseBonus: 4,
  proficiencies: ['warrior'],
};

describe('canEquip', () => {
  it('returns true when hero class is in proficiencies', () => {
    const hero = makeHero({ heroClass: 'warrior' });
    expect(canEquip(hero, sword)).toBe(true);
  });

  it('returns false when hero class is not in proficiencies', () => {
    const hero = makeHero({ heroClass: 'warrior' });
    expect(canEquip(hero, staff)).toBe(false);
  });
});

describe('equipGear', () => {
  it('equips a weapon to the weapon slot', () => {
    const hero = makeHero();
    const equipped = equipGear(hero, sword);
    expect(equipped.weapon).toEqual(sword);
    expect(equipped.armor).toBeNull();
  });

  it('equips armor to the armor slot', () => {
    const hero = makeHero();
    const equipped = equipGear(hero, chainmail);
    expect(equipped.armor).toEqual(chainmail);
    expect(equipped.weapon).toBeNull();
  });

  it('replaces existing gear in the same slot', () => {
    const hero = makeHero({ weapon: sword });
    const betterSword: GearItem = { ...sword, id: 'sword_2', name: 'Steel Sword', attackBonus: 5 };
    const equipped = equipGear(hero, betterSword);
    expect(equipped.weapon?.id).toBe('sword_2');
  });
});

describe('levelUp', () => {
  it('increments level and applies stat growth for warrior', () => {
    const hero = makeHero({ heroClass: 'warrior' });
    const leveled = levelUp(hero);
    expect(leveled.level).toBe(2);
    expect(leveled.stats.str).toBe(13); // +3
    expect(leveled.stats.dex).toBe(6);  // +1
    expect(leveled.stats.int).toBe(3);  // +0
    expect(leveled.stats.wis).toBe(6);  // +1
  });

  it('increments level and applies stat growth for rogue', () => {
    const hero = makeHero({ heroClass: 'rogue', stats: {
      hp: 22, maxHp: 22, attack: 6, defense: 4, speed: 8,
      str: 5, dex: 10, int: 5, wis: 3,
    }});
    const leveled = levelUp(hero);
    expect(leveled.stats.str).toBe(6);   // +1
    expect(leveled.stats.dex).toBe(13);  // +3
    expect(leveled.stats.int).toBe(6);   // +1
    expect(leveled.stats.wis).toBe(3);   // +0
  });

  it('increases maxHp on level up', () => {
    const hero = makeHero();
    const leveled = levelUp(hero);
    expect(leveled.stats.maxHp).toBeGreaterThan(hero.stats.maxHp);
    expect(leveled.stats.hp).toBe(leveled.stats.maxHp); // fully healed
  });
});

describe('applyXp', () => {
  it('adds XP without leveling when below threshold', () => {
    const hero = makeHero({ xp: 0 });
    const result = applyXp(hero, 50);
    expect(result.xp).toBe(50);
    expect(result.level).toBe(1);
  });

  it('triggers a level up when XP reaches threshold', () => {
    const hero = makeHero({ xp: 0 });
    const result = applyXp(hero, XP_PER_LEVEL); // 100 XP, threshold for L1→L2
    expect(result.level).toBe(2);
    expect(result.xp).toBe(0); // remainder
  });

  it('handles multi-level-ups', () => {
    const hero = makeHero({ xp: 0 });
    // L1 needs 100, L2 needs 200 = 300 total for two level-ups
    const result = applyXp(hero, 300);
    expect(result.level).toBe(3);
    expect(result.xp).toBe(0);
  });

  it('carries over excess XP', () => {
    const hero = makeHero({ xp: 0 });
    const result = applyXp(hero, 150); // 100 to level, 50 leftover
    expect(result.level).toBe(2);
    expect(result.xp).toBe(50);
  });
});
