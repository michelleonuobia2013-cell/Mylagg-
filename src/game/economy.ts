/**
 * mylag - Core Economy & Fintech Simulation Logic
 * Pure deterministic calculations for wallets, careers, watch-and-earn, and verified payouts.
 */

export interface BankAccount {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  verified: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  age: number;
  bankAccount: BankAccount;
  guildId?: string;
  guildName?: string;
  avatarSeed: string;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  type: 'WITHDRAWAL' | 'DEPOSIT' | 'CAREER_PAY' | 'WATCH_EARN' | 'DUNGEON_REWARD' | 'P2P_TRANSFER' | 'MARKETPLACE_SALE' | 'MARKETPLACE_BUY';
  amountNaira: number;
  amountLagCoins?: number;
  feeNaira: number;
  reference: string;
  timestamp: number;
  status: 'PENDING' | 'VERIFIED' | 'COMPLETED' | 'REJECTED';
  description: string;
  recipientAccount?: string;
  recipientBank?: string;
}

export interface Career {
  id: string;
  title: string;
  location: string;
  category: 'Tech' | 'Transport' | 'Entertainment' | 'Commerce' | 'Real Estate';
  description: string;
  payoutNairaMin: number;
  payoutNairaMax: number;
  lagCoinsAward: number;
  xpAward: number;
  energyCost: number;
  cooldownSeconds: number;
  perks: string[];
}

export const CAREER_PATHS: Career[] = [
  {
    id: 'tech_bro',
    title: 'Silicon Lagoon Full-Stack Dev',
    location: 'Yaba Tech Corridor',
    category: 'Tech',
    description: 'Build fintech APIs, fix production bugs, drink iced matcha, and hustle startup equity.',
    payoutNairaMin: 3500,
    payoutNairaMax: 8500,
    lagCoinsAward: 120,
    xpAward: 95,
    energyCost: 15,
    cooldownSeconds: 20,
    perks: ['+15% Tech Loot Drop', 'Free Coworking Wifi in Yaba'],
  },
  {
    id: 'danfo_conductor',
    title: 'Oshodi-CMS Express Conductor',
    location: 'Oshodi Interchange',
    category: 'Transport',
    description: 'Hang off the yellow bus, shout "Enter with your 1000 change!", dodge LASTMA officers.',
    payoutNairaMin: 2200,
    payoutNairaMax: 5400,
    lagCoinsAward: 80,
    xpAward: 75,
    energyCost: 12,
    cooldownSeconds: 15,
    perks: ['+20% Stamina Recovery', 'Unlock Fast Travel Across Mainland'],
  },
  {
    id: 'balogun_trader',
    title: 'Balogun Wholesale Merchant',
    location: 'Lagos Island Market',
    category: 'Commerce',
    description: 'Hustle Swiss lace, high-end electronics, bargain fiercely, and secure container shipments.',
    payoutNairaMin: 4000,
    payoutNairaMax: 9800,
    lagCoinsAward: 140,
    xpAward: 110,
    energyCost: 18,
    cooldownSeconds: 25,
    perks: ['-10% Marketplace Trading Fees', 'Bonus Inventory Storage Slots'],
  },
  {
    id: 'nollywood_star',
    title: 'Lekki Lead Actor & Producer',
    location: 'Lekki Phase 1 Film Studios',
    category: 'Entertainment',
    description: 'Star in high-drama cinema blockbusters, deliver iconic punchlines, sign brand endorsements.',
    payoutNairaMin: 5000,
    payoutNairaMax: 12500,
    lagCoinsAward: 180,
    xpAward: 135,
    energyCost: 20,
    cooldownSeconds: 30,
    perks: ['+25% Watch-to-Earn Streaming Multiplier', 'VIP Guild Access'],
  },
  {
    id: 'island_mogul',
    title: 'Eko Atlantic Real Estate Mogul',
    location: 'Victoria Island / Eko Atlantic',
    category: 'Real Estate',
    description: 'Acquire luxury penthouses, negotiate marina berths, and collect prime rental yields.',
    payoutNairaMin: 8000,
    payoutNairaMax: 20000,
    lagCoinsAward: 260,
    xpAward: 200,
    energyCost: 25,
    cooldownSeconds: 40,
    perks: ['Double Housing Prestige Points', 'Access to Sovereign Escrow Vaults'],
  },
];

export const NIGERIAN_BANKS = [
  { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
  { code: '057', name: 'Zenith Bank' },
  { code: '044', name: 'Access Bank' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '50211', name: 'Kuda Microfinance Bank' },
  { code: '999992', name: 'OPay Digital Services' },
  { code: '50515', name: 'Moniepoint MFB' },
  { code: '035', name: 'Wema Bank / ALAT' },
  { code: '214', name: 'First City Monument Bank (FCMB)' },
];

/**
 * Validates player eligibility according to the 13 to 100+ age requirement.
 */
export function validatePlayerAge(birthYear: number, birthMonth: number, birthDay: number, currentYear = 2026): {
  valid: boolean;
  age: number;
  message?: string;
} {
  if (!birthYear || !birthMonth || !birthDay) {
    return { valid: false, age: 0, message: 'Please provide complete date of birth.' };
  }
  const age = currentYear - birthYear;
  if (age < 13) {
    return { valid: false, age, message: 'mylag is restricted to players aged 13 and above.' };
  }
  if (age > 115) {
    return { valid: false, age, message: 'Please enter a valid birth year.' };
  }
  return { valid: true, age };
}

/**
 * Validates Nigerian 10-digit NUBAN account number format
 */
export function validateNubanAccount(accountNumber: string): boolean {
  return /^\d{10}$/.test(accountNumber.trim());
}

/**
 * Computes withdrawal transaction fee (1.2% with a flat minimum of ₦50 and maximum cap of ₦500)
 */
export function calculateWithdrawalFee(amountNaira: number): number {
  if (amountNaira <= 0) return 0;
  const rawFee = Math.round(amountNaira * 0.012);
  const fee = Math.max(50, Math.min(500, rawFee));
  return fee;
}

/**
 * Checks whether user has sufficient funds for withdrawal after fee deduction
 */
export function canWithdraw(balanceNaira: number, requestedAmount: number): {
  allowed: boolean;
  fee: number;
  totalDeduction: number;
  netPayout: number;
  reason?: string;
} {
  const minWithdrawal = 500;
  if (requestedAmount < minWithdrawal) {
    return {
      allowed: false,
      fee: 0,
      totalDeduction: 0,
      netPayout: 0,
      reason: `Minimum withdrawal amount is ₦${minWithdrawal.toLocaleString()}.`,
    };
  }

  const fee = calculateWithdrawalFee(requestedAmount);
  const totalDeduction = requestedAmount;
  const netPayout = requestedAmount - fee;

  if (balanceNaira < totalDeduction) {
    return {
      allowed: false,
      fee,
      totalDeduction,
      netPayout,
      reason: `Insufficient balance. You need ₦${totalDeduction.toLocaleString()} but currently have ₦${balanceNaira.toLocaleString()}.`,
    };
  }

  return {
    allowed: true,
    fee,
    totalDeduction,
    netPayout,
  };
}

/**
 * Calculates watch-and-earn streaming payout based on seconds watched
 * Rates: ₦25 Naira and 2 LagCoins per 5 seconds of active watch time
 */
export function calculateWatchEarnPayout(secondsWatched: number, multiplier = 1.0): {
  nairaEarned: number;
  coinsEarned: number;
} {
  if (secondsWatched <= 0) return { nairaEarned: 0, coinsEarned: 0 };
  const baseNairaPerSec = 5;
  const baseCoinsPerSec = 0.4;
  const nairaEarned = Math.floor(secondsWatched * baseNairaPerSec * multiplier);
  const coinsEarned = Math.floor(secondsWatched * baseCoinsPerSec * multiplier);
  return { nairaEarned, coinsEarned };
}

/**
 * Generates an authentic Nigerian banking transaction reference string
 * e.g. "MYLAG-PAY-20261017-884291"
 */
export function generateTransactionReference(prefix = 'MYLAG'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
}

/**
 * Offline progression calculator
 * When the player returns, rewards accumulated idle career bonuses up to 8 hours maximum
 */
export function calculateOfflineProgression(lastActiveTimestamp: number, currentTimestamp = Date.now()): {
  hoursElapsed: number;
  nairaEarned: number;
  lagCoinsEarned: number;
  energyRestored: number;
} {
  const elapsedMs = Math.max(0, currentTimestamp - lastActiveTimestamp);
  const hoursRaw = elapsedMs / (1000 * 60 * 60);
  const cappedHours = Math.min(8, hoursRaw);

  if (cappedHours < 0.25) {
    return { hoursElapsed: 0, nairaEarned: 0, lagCoinsEarned: 0, energyRestored: 0 };
  }

  // Approx ₦1,200/hr idle returns + 30 LagCoins/hr + 10 energy/hr
  const nairaEarned = Math.floor(cappedHours * 1200);
  const lagCoinsEarned = Math.floor(cappedHours * 30);
  const energyRestored = Math.floor(cappedHours * 12.5);

  return {
    hoursElapsed: Number(cappedHours.toFixed(1)),
    nairaEarned,
    lagCoinsEarned,
    energyRestored,
  };
}
