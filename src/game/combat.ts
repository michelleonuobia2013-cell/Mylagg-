/**
 * mylag - Elemental Combat & Character System (Genshin Impact Style)
 * Pure deterministic combat math, elemental reaction matrices, and dungeon stats.
 */

export type ElementType = 'Electro' | 'Hydro' | 'Pyro' | 'Anemo' | 'Geo';

export interface ElementalReaction {
  name: string;
  effect: string;
  damageMultiplier: number;
  bonusEffect: string;
}

export interface CharacterSkill {
  id: string;
  name: string;
  type: 'Normal' | 'ElementalSkill' | 'ElementalBurst';
  cooldownSec: number;
  energyCost?: number;
  description: string;
  basePower: number;
  element: ElementType;
}

export interface CharacterHero {
  id: string;
  name: string;
  title: string;
  rarity: 4 | 5;
  element: ElementType;
  weaponType: 'Dual Blades' | 'Claymore' | 'Catalyst' | 'Bow' | 'Staff';
  avatarUrl: string;
  level: number;
  maxHp: number;
  currentHp: number;
  baseAtk: number;
  baseDef: number;
  critRate: number;
  critDmg: number;
  energy: number;
  maxEnergy: number;
  skills: CharacterSkill[];
  tagline: string;
}

export interface DungeonEnemy {
  id: string;
  name: string;
  title: string;
  element: ElementType;
  level: number;
  maxHp: number;
  currentHp: number;
  atk: number;
  def: number;
  appliedElement?: ElementType;
  isBoss?: boolean;
}

export interface DungeonStage {
  id: string;
  name: string;
  district: string;
  recommendedLevel: number;
  enemies: DungeonEnemy[];
  rewards: {
    nairaMin: number;
    nairaMax: number;
    lagCoins: number;
    exp: number;
    rareItemName: string;
  };
}

export const ELEMENTAL_REACTIONS: Record<string, ElementalReaction> = {
  'Electro+Hydro': {
    name: 'Electro-Charged',
    effect: 'Continuous lightning arc shocks',
    damageMultiplier: 1.6,
    bonusEffect: 'Chain stun dealing continuous ticks',
  },
  'Hydro+Electro': {
    name: 'Electro-Charged',
    effect: 'Continuous lightning arc shocks',
    damageMultiplier: 1.6,
    bonusEffect: 'Chain stun dealing continuous ticks',
  },
  'Pyro+Hydro': {
    name: 'Vaporize',
    effect: 'Sudden steam shockwave',
    damageMultiplier: 2.0,
    bonusEffect: 'Massive burst single-hit impact',
  },
  'Hydro+Pyro': {
    name: 'Vaporize',
    effect: 'Sudden steam shockwave',
    damageMultiplier: 2.0,
    bonusEffect: 'Massive burst single-hit impact',
  },
  'Pyro+Electro': {
    name: 'Overload',
    effect: 'Explosive kinetic blast',
    damageMultiplier: 1.75,
    bonusEffect: 'AOE blast knockback breaking enemy armor',
  },
  'Electro+Pyro': {
    name: 'Overload',
    effect: 'Explosive kinetic blast',
    damageMultiplier: 1.75,
    bonusEffect: 'AOE blast knockback breaking enemy armor',
  },
  'Anemo+Electro': {
    name: 'Swirl',
    effect: 'Violent purple whirlwind',
    damageMultiplier: 1.5,
    bonusEffect: 'Spreads Electro to all adjacent foes',
  },
  'Anemo+Pyro': {
    name: 'Swirl',
    effect: 'Firestorm funnel',
    damageMultiplier: 1.5,
    bonusEffect: 'Spreads Pyro to all adjacent foes',
  },
  'Anemo+Hydro': {
    name: 'Swirl',
    effect: 'Torrential hurricane',
    damageMultiplier: 1.5,
    bonusEffect: 'Spreads Hydro and slows enemy movement',
  },
};

/**
 * Calculates outgoing combat damage factoring attack, defense, crits and elemental reactions
 */
export function calculateCombatDamage(
  attackerAtk: number,
  skillPower: number,
  attackerCritRate: number,
  attackerCritDmg: number,
  targetDef: number,
  attackElement: ElementType,
  targetExistingElement?: ElementType
): {
  totalDamage: number;
  isCrit: boolean;
  reaction?: ElementalReaction;
} {
  const isCrit = Math.random() < attackerCritRate;
  const critMultiplier = isCrit ? 1 + attackerCritDmg : 1.0;

  // Base raw damage calculation
  const rawDamage = (attackerAtk * (skillPower / 100));

  // Defense mitigation factor: 100 / (100 + targetDef)
  const defFactor = 100 / (100 + Math.max(0, targetDef));
  let calculatedDamage = rawDamage * defFactor * critMultiplier;

  // Check for elemental reaction
  let reaction: ElementalReaction | undefined;
  if (targetExistingElement && targetExistingElement !== attackElement) {
    const key = `${targetExistingElement}+${attackElement}`;
    reaction = ELEMENTAL_REACTIONS[key];
    if (reaction) {
      calculatedDamage *= reaction.damageMultiplier;
    }
  }

  return {
    totalDamage: Math.max(1, Math.round(calculatedDamage)),
    isCrit,
    reaction,
  };
}

/**
 * Initial Roster of playable mylag characters
 */
export function getInitialHeroRoster(appIconPath: string): CharacterHero[] {
  return [
    {
      id: 'amina_volt',
      name: 'Amina "Volt"',
      title: 'Yaba Circuit Queen',
      rarity: 5,
      element: 'Electro',
      weaponType: 'Dual Blades',
      avatarUrl: appIconPath,
      level: 12,
      maxHp: 2400,
      currentHp: 2400,
      baseAtk: 285,
      baseDef: 120,
      critRate: 0.25,
      critDmg: 0.65,
      energy: 40,
      maxEnergy: 100,
      tagline: 'No dulling in my city! Let lightning strike!',
      skills: [
        {
          id: 'amina_s1',
          name: 'Danfo Dash Slash',
          type: 'Normal',
          cooldownSec: 0,
          description: 'A swift flurry of dual electric daggers.',
          basePower: 85,
          element: 'Electro',
        },
        {
          id: 'amina_s2',
          name: 'Sango Surge',
          type: 'ElementalSkill',
          cooldownSec: 6,
          description: 'Hurls an electrified cyber-spike creating an electric pulse.',
          basePower: 210,
          element: 'Electro',
        },
        {
          id: 'amina_s3',
          name: 'Lagos Grid Meltdown',
          type: 'ElementalBurst',
          cooldownSec: 15,
          energyCost: 70,
          description: 'Unleashes the full raw power of NEPA lightning blackout across all enemies.',
          basePower: 450,
          element: 'Electro',
        },
      ],
    },
    {
      id: 'chidi_wave',
      name: 'Chidi "Wave"',
      title: 'Bar Beach Tide Guardian',
      rarity: 4,
      element: 'Hydro',
      weaponType: 'Catalyst',
      avatarUrl: '',
      level: 10,
      maxHp: 2200,
      currentHp: 2200,
      baseAtk: 190,
      baseDef: 140,
      critRate: 0.15,
      critDmg: 0.50,
      energy: 60,
      maxEnergy: 100,
      tagline: 'Cool like the Atlantic breeze at Tarkwa Bay.',
      skills: [
        {
          id: 'chidi_s1',
          name: 'Aqua Splash',
          type: 'Normal',
          cooldownSec: 0,
          description: 'Fires high pressure water drops.',
          basePower: 70,
          element: 'Hydro',
        },
        {
          id: 'chidi_s2',
          name: 'Olokun Cleansing Wave',
          type: 'ElementalSkill',
          cooldownSec: 8,
          description: 'Summons a rolling wave that wets enemies and restores 400 team HP.',
          basePower: 160,
          element: 'Hydro',
        },
        {
          id: 'chidi_s3',
          name: 'Atlantic Tsunami',
          type: 'ElementalBurst',
          cooldownSec: 18,
          energyCost: 80,
          description: 'Engulfs the entire arena in a massive surging vortex.',
          basePower: 380,
          element: 'Hydro',
        },
      ],
    },
    {
      id: 'tunde_blaze',
      name: 'Tunde "Blaze"',
      title: 'Ogun Forge Champion',
      rarity: 5,
      element: 'Pyro',
      weaponType: 'Claymore',
      avatarUrl: '',
      level: 11,
      maxHp: 2650,
      currentHp: 2650,
      baseAtk: 310,
      baseDef: 160,
      critRate: 0.20,
      critDmg: 0.70,
      energy: 30,
      maxEnergy: 100,
      tagline: 'Fire burn bad vibes! Pure Suya heat!',
      skills: [
        {
          id: 'tunde_s1',
          name: 'Blazing Cleave',
          type: 'Normal',
          cooldownSec: 0,
          description: 'Heavy fiery sweeping strike.',
          basePower: 95,
          element: 'Pyro',
        },
        {
          id: 'tunde_s2',
          name: 'Suya Flame Blast',
          type: 'ElementalSkill',
          cooldownSec: 7,
          description: 'Spits spicy forge flames inflicting burning status.',
          basePower: 230,
          element: 'Pyro',
        },
        {
          id: 'tunde_s3',
          name: 'Infernal Sun of Eko',
          type: 'ElementalBurst',
          cooldownSec: 16,
          energyCost: 75,
          description: 'Crashes down a miniature sun creating continuous Pyro devastation.',
          basePower: 480,
          element: 'Pyro',
        },
      ],
    },
    {
      id: 'zainab_zephyr',
      name: 'Zainab "Zephyr"',
      title: 'Third Mainland Sky Strider',
      rarity: 4,
      element: 'Anemo',
      weaponType: 'Bow',
      avatarUrl: '',
      level: 10,
      maxHp: 1950,
      currentHp: 1950,
      baseAtk: 230,
      baseDef: 110,
      critRate: 0.30,
      critDmg: 0.60,
      energy: 50,
      maxEnergy: 100,
      tagline: 'Catch me if you can on the bridge at midnight!',
      skills: [
        {
          id: 'zainab_s1',
          name: 'Gale Arrow',
          type: 'Normal',
          cooldownSec: 0,
          description: 'Pinpoint wind arrows piercing through targets.',
          basePower: 80,
          element: 'Anemo',
        },
        {
          id: 'zainab_s2',
          name: 'Oya Vortex',
          type: 'ElementalSkill',
          cooldownSec: 6,
          description: 'Pulls scattered enemies into a central cyclone.',
          basePower: 180,
          element: 'Anemo',
        },
        {
          id: 'zainab_s3',
          name: 'Harmattan Tempest',
          type: 'ElementalBurst',
          cooldownSec: 14,
          energyCost: 65,
          description: 'Summons a raging harmattan windstorm swirling all active elements.',
          basePower: 410,
          element: 'Anemo',
        },
      ],
    },
  ];
}

/**
 * Standard Dungeon Stages available for player raids
 */
export const DUNGEON_STAGES: DungeonStage[] = [
  {
    id: 'dungeon_comp_village',
    name: 'Computer Village Cyber-Heist',
    district: 'Ikeja Tech Hub',
    recommendedLevel: 5,
    enemies: [
      {
        id: 'cv_mob_1',
        name: 'Glitch Drone',
        title: 'Corrupted Surveillance Bot',
        element: 'Electro',
        level: 6,
        maxHp: 950,
        currentHp: 950,
        atk: 65,
        def: 30,
      },
      {
        id: 'cv_mob_2',
        name: 'Firewall Bruiser',
        title: 'Heavy Network Enforcer',
        element: 'Pyro',
        level: 7,
        maxHp: 1400,
        currentHp: 1400,
        atk: 85,
        def: 45,
      },
      {
        id: 'cv_boss',
        name: 'Cyber-Heist Kingpin "Zero-Day"',
        title: 'Ikeja Master Hacker',
        element: 'Electro',
        level: 8,
        maxHp: 3200,
        currentHp: 3200,
        atk: 125,
        def: 60,
        isBoss: true,
      },
    ],
    rewards: {
      nairaMin: 6000,
      nairaMax: 15000,
      lagCoins: 150,
      exp: 280,
      rareItemName: 'Overclocked Yaba Silicon Core',
    },
  },
  {
    id: 'dungeon_lekki_toll',
    name: 'Lekki Tollgate Midnight Trial',
    district: 'Lekki Express Corridor',
    recommendedLevel: 10,
    enemies: [
      {
        id: 'lt_mob_1',
        name: 'Automated Toll Sentry',
        title: 'Rapid Laser Turret',
        element: 'Pyro',
        level: 10,
        maxHp: 1200,
        currentHp: 1200,
        atk: 90,
        def: 50,
      },
      {
        id: 'lt_boss',
        name: 'Tollgate Titan',
        title: 'Midnight Barrier Guardian',
        element: 'Geo',
        level: 12,
        maxHp: 4800,
        currentHp: 4800,
        atk: 165,
        def: 85,
        isBoss: true,
      },
    ],
    rewards: {
      nairaMin: 12000,
      nairaMax: 28000,
      lagCoins: 300,
      exp: 520,
      rareItemName: 'Golden Toll Express Pass',
    },
  },
  {
    id: 'dungeon_eyo_labyrinth',
    name: 'Eyo Masquerade Mystical Labyrinth',
    district: 'Lagos Island Ancient Quarters',
    recommendedLevel: 15,
    enemies: [
      {
        id: 'eyo_mob_1',
        name: 'Staff Apparition',
        title: 'Ancestral Mist Spriggan',
        element: 'Anemo',
        level: 15,
        maxHp: 1600,
        currentHp: 1600,
        atk: 120,
        def: 55,
      },
      {
        id: 'eyo_boss',
        name: 'High Priest of the White Staff',
        title: 'Sacred Island Entity',
        element: 'Hydro',
        level: 16,
        maxHp: 6500,
        currentHp: 6500,
        atk: 210,
        def: 95,
        isBoss: true,
      },
    ],
    rewards: {
      nairaMin: 25000,
      nairaMax: 60000,
      lagCoins: 650,
      exp: 950,
      rareItemName: 'Sacred Eyo Orisha Staff',
    },
  },
];
