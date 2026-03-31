import type { Hero, GearItem } from './types';
import { STAT_GROWTH } from './constants';

export function canEquip(hero: Hero, gear: GearItem): boolean {
  return gear.proficiencies.includes(hero.heroClass);
}

export function equipGear(hero: Hero, gear: GearItem): Hero {
  if (gear.slot === 'weapon') {
    return { ...hero, weapon: gear };
  }
  return { ...hero, armor: gear };
}

export function unequipGear(hero: Hero, slot: 'weapon' | 'armor'): { hero: Hero; gear: GearItem | null } {
  const gear = slot === 'weapon' ? hero.weapon : hero.armor;
  const updated = slot === 'weapon'
    ? { ...hero, weapon: null }
    : { ...hero, armor: null };
  return { hero: updated, gear };
}

export function getEffectiveAttack(hero: Hero): number {
  return hero.stats.attack + (hero.weapon?.attackBonus ?? 0);
}

export function getEffectiveDefense(hero: Hero): number {
  return hero.stats.defense + (hero.armor?.defenseBonus ?? 0);
}

export function levelUp(hero: Hero): Hero {
  const growth = STAT_GROWTH[hero.heroClass];
  const hpGain = Math.floor(hero.stats.maxHp * 0.15) + 2; // ~15% + 2 flat

  const newStats = {
    ...hero.stats,
    str: hero.stats.str + growth.str,
    dex: hero.stats.dex + growth.dex,
    int: hero.stats.int + growth.int,
    wis: hero.stats.wis + growth.wis,
    maxHp: hero.stats.maxHp + hpGain,
    hp: hero.stats.maxHp + hpGain, // fully healed on level up
  };

  return {
    ...hero,
    level: hero.level + 1,
    stats: newStats,
  };
}

export function applyXp(hero: Hero, xpGained: number): Hero {
  let current = { ...hero, xp: hero.xp + xpGained };

  while (current.xp >= current.level * 100) {
    current = {
      ...levelUp(current),
      xp: current.xp - current.level * 100,
    };
  }

  return current;
}
