import type { CreatureType } from '../engine/types';

export const CREATURE_TYPES: Record<string, CreatureType> = {
  shadow_rat: {
    id: 'shadow_rat',
    name: 'Shadow Rat',
    stats: { hp: 8, attack: 3, defense: 1, speed: 7 },
    movement: 'wander',
    detectionRange: 3,
    fleeThreshold: 0.3,
    actions: [
      { type: 'melee', damage: 3, range: 1, cooldown: 0, name: 'Bite' },
    ],
    visual: {
      bodyShape: 'arachnid',
      features: ['fangs', 'tail'],
      lineWeight: 1,
      hatchDensity: 0.2,
    },
    goldDrop: { min: 2, max: 5 },
    xpReward: 15,
  },

  bone_sentinel: {
    id: 'bone_sentinel',
    name: 'Bone Sentinel',
    stats: { hp: 25, attack: 6, defense: 8, speed: 2 },
    movement: 'patrol',
    detectionRange: 4,
    fleeThreshold: 0,
    actions: [
      { type: 'melee', damage: 6, range: 1, cooldown: 0, name: 'Bony Strike' },
    ],
    visual: {
      bodyShape: 'humanoid',
      features: ['horns'],
      lineWeight: 2,
      hatchDensity: 0.5,
    },
    goldDrop: { min: 5, max: 12 },
    xpReward: 30,
  },

  gloom_spider: {
    id: 'gloom_spider',
    name: 'Gloom Spider',
    stats: { hp: 12, attack: 5, defense: 2, speed: 6 },
    movement: 'hunt',
    detectionRange: 5,
    fleeThreshold: 0.2,
    actions: [
      { type: 'melee', damage: 5, range: 1, cooldown: 0, name: 'Venomous Bite' },
      { type: 'debuff_party', damage: 0, range: 3, cooldown: 3, name: 'Web Snare' },
    ],
    visual: {
      bodyShape: 'arachnid',
      features: ['fangs', 'claws'],
      lineWeight: 2,
      hatchDensity: 0.4,
    },
    goldDrop: { min: 4, max: 8 },
    xpReward: 25,
  },

  void_wraith: {
    id: 'void_wraith',
    name: 'Void Wraith',
    stats: { hp: 18, attack: 7, defense: 3, speed: 5 },
    movement: 'hunt',
    detectionRange: 6,
    fleeThreshold: 0,
    actions: [
      { type: 'melee', damage: 7, range: 1, cooldown: 0, name: 'Spectral Touch' },
      { type: 'debuff_party', damage: 2, range: 4, cooldown: 2, name: 'Dread Aura' },
    ],
    visual: {
      bodyShape: 'amorphous',
      features: ['claws'],
      lineWeight: 1,
      hatchDensity: 0.7,
    },
    goldDrop: { min: 8, max: 15 },
    xpReward: 40,
  },

  cave_troll: {
    id: 'cave_troll',
    name: 'Cave Troll',
    stats: { hp: 40, attack: 10, defense: 5, speed: 3 },
    movement: 'stationary',
    detectionRange: 3,
    fleeThreshold: 0,
    actions: [
      { type: 'melee', damage: 10, range: 1, cooldown: 0, name: 'Crushing Blow' },
    ],
    visual: {
      bodyShape: 'humanoid',
      features: ['horns', 'claws'],
      lineWeight: 3,
      hatchDensity: 0.6,
    },
    goldDrop: { min: 12, max: 20 },
    xpReward: 50,
  },

  plague_slime: {
    id: 'plague_slime',
    name: 'Plague Slime',
    stats: { hp: 15, attack: 4, defense: 2, speed: 4 },
    movement: 'wander',
    detectionRange: 2,
    fleeThreshold: 0,
    actions: [
      { type: 'melee', damage: 4, range: 1, cooldown: 0, name: 'Acidic Touch' },
      { type: 'heal_self', damage: 0, range: 0, cooldown: 3, name: 'Regenerate' },
    ],
    visual: {
      bodyShape: 'amorphous',
      features: [],
      lineWeight: 2,
      hatchDensity: 0.3,
    },
    goldDrop: { min: 3, max: 7 },
    xpReward: 20,
  },

  ember_bat: {
    id: 'ember_bat',
    name: 'Ember Bat',
    stats: { hp: 10, attack: 4, defense: 1, speed: 9 },
    movement: 'flee',
    detectionRange: 4,
    fleeThreshold: 0.5,
    actions: [
      { type: 'ranged', damage: 4, range: 3, cooldown: 0, name: 'Fire Spit' },
    ],
    visual: {
      bodyShape: 'winged',
      features: ['fangs', 'wings'],
      lineWeight: 1,
      hatchDensity: 0.2,
    },
    goldDrop: { min: 3, max: 6 },
    xpReward: 18,
  },

  iron_golem: {
    id: 'iron_golem',
    name: 'Iron Golem',
    stats: { hp: 50, attack: 12, defense: 10, speed: 1 },
    movement: 'stationary',
    detectionRange: 2,
    fleeThreshold: 0,
    actions: [
      { type: 'melee', damage: 12, range: 1, cooldown: 0, name: 'Iron Fist' },
      { type: 'buff_allies', damage: 0, range: 3, cooldown: 4, name: 'War Cry' },
    ],
    visual: {
      bodyShape: 'humanoid',
      features: ['horns'],
      lineWeight: 3,
      hatchDensity: 0.8,
    },
    goldDrop: { min: 15, max: 25 },
    xpReward: 60,
  },
};
