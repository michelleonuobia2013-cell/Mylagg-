import React, { useState } from 'react';
import { Award, Calendar, Clock, Sparkles, Check, Gift, X, Zap } from 'lucide-react';
import { BattlePassTier, DailyReward } from '../types/game';
import { calculateOfflineProgression } from '../game/economy';
import { playCoinSound, playFanfareSound, playTapSound } from '../utils/audio';
import { speakText } from '../utils/speech';

interface BattlePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastActiveTimestamp: number;
  onClaimRewards: (deltaNaira: number, deltaCoins: number, deltaEnergy: number) => void;
}

const INITIAL_DAILY_REWARDS: DailyReward[] = [
  { day: 1, naira: 5000, lagCoins: 50, claimed: true },
  { day: 2, naira: 10000, lagCoins: 100, claimed: true },
  { day: 3, naira: 20000, lagCoins: 150, claimed: false },
  { day: 4, naira: 35000, lagCoins: 200, itemName: 'Suya Spice Artifact', claimed: false },
  { day: 5, naira: 50000, lagCoins: 300, claimed: false },
  { day: 6, naira: 80000, lagCoins: 450, itemName: 'Danfo Neon Decal', claimed: false },
  { day: 7, naira: 150000, lagCoins: 1000, itemName: '5-Star Sango Core', claimed: false },
];

const BATTLE_PASS_TIERS: BattlePassTier[] = [
  { tier: 1, xpRequired: 100, freeReward: '₦10,000 Cash', premiumReward: 'Cyber Tomboy Cap', unlocked: true, claimedFree: true, claimedPremium: false },
  { tier: 2, xpRequired: 250, freeReward: '50 LagCoins', premiumReward: '₦50,000 Payout Boost', unlocked: true, claimedFree: false, claimedPremium: false },
  { tier: 3, xpRequired: 500, freeReward: 'Yaba Wifi Artifact', premiumReward: 'Golden Danfo Skin', unlocked: true, claimedFree: false, claimedPremium: false },
  { tier: 4, xpRequired: 800, freeReward: '₦25,000 Cash', premiumReward: 'Ekuke Neon Collar', unlocked: false, claimedFree: false, claimedPremium: false },
  { tier: 5, xpRequired: 1200, freeReward: '150 LagCoins', premiumReward: 'Lekki Penthouse Deed', unlocked: false, claimedFree: false, claimedPremium: false },
];

export const BattlePassModal: React.FC<BattlePassModalProps> = ({
  isOpen,
  onClose,
  lastActiveTimestamp,
  onClaimRewards,
}) => {
  const [dailyRewards, setDailyRewards] = useState<DailyReward[]>(INITIAL_DAILY_REWARDS);
  const [tiers, setTiers] = useState<BattlePassTier[]>(BATTLE_PASS_TIERS);
  const [offlineClaimed, setOfflineClaimed] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate offline progression
  const offline = calculateOfflineProgression(lastActiveTimestamp);

  const handleClaimDaily = (day: number) => {
    const reward = dailyRewards.find((r) => r.day === day);
    if (!reward || reward.claimed) return;

    playFanfareSound();
    onClaimRewards(reward.naira, reward.lagCoins, 20);
    setDailyRewards((prev) =>
      prev.map((r) => (r.day === day ? { ...r, claimed: true } : r))
    );
    speakText(`Day ${day} streak bonus claimed! ₦${reward.naira.toLocaleString()} credited!`);
  };

  const handleClaimOffline = () => {
    if (offlineClaimed || offline.nairaEarned <= 0) return;
    playFanfareSound();
    onClaimRewards(offline.nairaEarned, offline.lagCoinsEarned, offline.energyRestored);
    setOfflineClaimed(true);
    speakText(`Claimed ₦${offline.nairaEarned.toLocaleString()} offline progression income!`);
  };

  const handleClaimTier = (tierIndex: number, type: 'free' | 'premium') => {
    const target = tiers[tierIndex];
    if (!target || !target.unlocked) return;

    playCoinSound();
    setTiers((prev) =>
      prev.map((t, idx) =>
        idx === tierIndex
          ? {
              ...t,
              claimedFree: type === 'free' ? true : t.claimedFree,
              claimedPremium: type === 'premium' ? true : t.claimedPremium,
            }
          : t
      )
    );
    onClaimRewards(15000, 50, 0);
    speakText(`Battle pass Tier ${target.tier} ${type} reward claimed!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0c1322] border border-yellow-500/50 shadow-2xl p-6 text-slate-100 my-8 space-y-6">
        <button
          onClick={onClose}
          aria-label="Close Streak & Pass Modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-400">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <span>Daily Rewards & Season Battle Pass</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-bold">
                SEASON 1: EKO EMERALD
              </span>
            </h3>
            <p className="text-xs text-slate-400">Claim daily login streaks, offline earnings, and battle pass tiers</p>
          </div>
        </div>

        {/* 1. Offline Progression Claim Box */}
        {offline.nairaEarned > 0 && !offlineClaimed && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-purple-950/60 border border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Offline Progression ({offline.hoursElapsed} hrs away)</span>
              </span>
              <p className="text-xs text-slate-200 mt-0.5">
                While you were resting, your Yaba investments and Danfo fleet earned:
              </p>
              <div className="flex items-center gap-3 text-xs font-mono font-bold mt-1">
                <span className="text-emerald-400">+₦{offline.nairaEarned.toLocaleString()}</span>
                <span className="text-yellow-400">+{offline.lagCoinsEarned} Coins</span>
                <span className="text-cyan-400">+{offline.energyRestored} Energy</span>
              </div>
            </div>

            <button
              onClick={handleClaimOffline}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              Claim Offline Earnings
            </button>
          </div>
        )}

        {/* 2. 7-Day Daily Login Streak */}
        <div className="space-y-3">
          <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>7-Day Login Streak Rewards</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {dailyRewards.map((reward) => {
              const isToday = reward.day === 3 && !reward.claimed;
              return (
                <div
                  key={reward.day}
                  className={`p-3 rounded-xl border flex flex-col justify-between text-center transition ${
                    reward.claimed
                      ? 'bg-slate-900/60 border-slate-800 opacity-60'
                      : isToday
                      ? 'bg-purple-950/80 border-purple-500 shadow-md animate-pulse'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400 mb-1">Day {reward.day}</span>
                  <div className="my-1 font-mono text-xs font-bold text-emerald-400">
                    ₦{(reward.naira / 1000).toFixed(0)}k
                  </div>
                  {reward.itemName && (
                    <span className="text-[9px] text-yellow-300 font-semibold truncate block">
                      {reward.itemName.split(' ')[0]}
                    </span>
                  )}

                  <button
                    onClick={() => handleClaimDaily(reward.day)}
                    disabled={reward.claimed || !isToday}
                    className={`mt-2 py-1 rounded text-[10px] font-bold transition ${
                      reward.claimed
                        ? 'bg-slate-800 text-slate-500'
                        : isToday
                        ? 'bg-purple-600 text-white hover:bg-purple-500'
                        : 'bg-slate-850 text-slate-500'
                    }`}
                  >
                    {reward.claimed ? '✓ Claimed' : isToday ? 'Claim' : 'Locked'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Monthly Battle Pass Tiers */}
        <div className="space-y-3">
          <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>Season 1 Pass Progression</span>
          </h4>

          <div className="space-y-2">
            {tiers.map((tier, idx) => (
              <div
                key={tier.tier}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 font-mono font-bold text-yellow-400 flex items-center justify-center">
                    {tier.tier}
                  </span>
                  <div>
                    <span className="text-slate-300 block">Free: <strong className="text-white">{tier.freeReward}</strong></span>
                    <span className="text-yellow-400 text-[11px]">VIP: {tier.premiumReward}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleClaimTier(idx, 'free')}
                    disabled={!tier.unlocked || tier.claimedFree}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      tier.claimedFree
                        ? 'bg-slate-800 text-slate-500'
                        : tier.unlocked
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-slate-850 text-slate-600'
                    }`}
                  >
                    {tier.claimedFree ? '✓ Claimed' : 'Claim Free'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
