import { BankAccount, UserProfile, TransactionRecord, Career } from '../game/economy';
import { CharacterHero, DungeonStage } from '../game/combat';

export type ActiveTab =
  | 'city'
  | 'watch_earn'
  | 'combat'
  | 'housing'
  | 'marketplace'
  | 'fintech'
  | 'social'
  | 'profile';

export interface Pet {
  id: string;
  name: string;
  species: 'Ekuke Terrier' | 'African Grey Parrot' | 'Galago Bushbaby' | 'Lekki Cheetah Cub';
  level: number;
  hunger: number; // 0 to 100
  happiness: number; // 0 to 100
  favoriteFood: string;
  specialSkill: string;
  dialoguePidgin: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'Living' | 'Tech' | 'Music' | 'Decor';
  nairaCost: number;
  owned: boolean;
  placed: boolean;
  iconName: string;
  prestigePoints: number;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  sellerName: string;
  sellerId: string;
  priceNaira: number;
  priceLagCoins: number;
  category: 'Artifact' | 'Vehicle' | 'Cosmetic' | 'Property';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  inEscrow: boolean;
  imageUrl?: string;
  statsDescription: string;
}

export interface GuildMember {
  id: string;
  name: string;
  role: 'Guild Master' | 'Elder' | 'Member';
  level: number;
  nairaNetWorth: number;
  isOnline: boolean;
  avatarSeed: string;
  isSpeaking?: boolean;
}

export interface DailyReward {
  day: number;
  naira: number;
  lagCoins: number;
  itemName?: string;
  claimed: boolean;
}

export interface BattlePassTier {
  tier: number;
  xpRequired: number;
  freeReward: string;
  premiumReward: string;
  unlocked: boolean;
  claimedFree: boolean;
  claimedPremium: boolean;
}
