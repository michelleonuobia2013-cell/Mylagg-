import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Flame,
  Truck,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  MapPin,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';
import { CAREER_PATHS, Career } from '../game/economy';
import { playCoinSound, playTapSound, playFanfareSound } from '../utils/audio';
import { speakText } from '../utils/speech';
import { FormatNaira, NairaSign } from './NairaSign';
import { Lagos3DWorld } from './Lagos3DWorld';

interface CityHubViewProps {
  balanceNaira: number;
  lagCoins: number;
  energy: number;
  maxEnergy: number;
  onUpdateBalances: (deltaNaira: number, deltaCoins: number, deltaEnergy: number) => void;
  onOpenDungeons: () => void;
  onOpenHousing: () => void;
  onOpenATM: () => void;
  onOpenCinema: () => void;
  onOpenMarket: () => void;
  playerUsername: string;
  playerLevel: number;
}

export const CityHubView: React.FC<CityHubViewProps> = ({
  balanceNaira,
  lagCoins,
  energy,
  maxEnergy,
  onUpdateBalances,
  onOpenDungeons,
  onOpenHousing,
  onOpenATM,
  onOpenCinema,
  onOpenMarket,
  playerUsername,
  playerLevel,
}) => {
  const [activeShift, setActiveShift] = useState<{ careerId: string; timeLeft: number } | null>(null);
  const [activeMiniGame, setActiveMiniGame] = useState<'none' | 'danfo_rush' | 'suya_grill'>('none');

  // Danfo Rush Game State
  const [danfoLane, setDanfoLane] = useState<number>(1); // 0 = Left, 1 = Center, 2 = Right
  const [danfoScore, setDanfoScore] = useState<number>(0);
  const [danfoGameOver, setDanfoGameOver] = useState<boolean>(false);
  const [danfoSpeed, setDanfoSpeed] = useState<number>(1);
  const [obstacles, setObstacles] = useState<{ id: number; lane: number; y: number; isCoin: boolean }[]>([]);

  // Suya Grill Game State
  const [suyaSkewers, setSuyaSkewers] = useState<
    { id: number; doneness: number; spiced: boolean; burnt: boolean }[]
  >([
    { id: 1, doneness: 20, spiced: false, burnt: false },
    { id: 2, doneness: 45, spiced: false, burnt: false },
    { id: 3, doneness: 10, spiced: false, burnt: false },
  ]);
  const [suyaOrdersCompleted, setSuyaOrdersCompleted] = useState<number>(0);

  // Daily Quests State
  const [quests, setQuests] = useState([
    {
      id: 'q1',
      title: 'Yaba Startup Sprint',
      desc: 'Complete 1 Tech Bro shift and review PRs before the server crashes.',
      rewardNaira: 15000,
      rewardCoins: 100,
      completed: false,
    },
    {
      id: 'q2',
      title: 'Danfo Highway Hustle',
      desc: 'Reach 500 score in Danfo Rush mini-game dodging Oshodi potholes.',
      rewardNaira: 12000,
      rewardCoins: 80,
      completed: false,
    },
    {
      id: 'q3',
      title: 'Suya Grill Master',
      desc: 'Successfully season and serve 3 skewers without burning any.',
      rewardNaira: 10000,
      rewardCoins: 75,
      completed: false,
    },
  ]);

  // Career Shift Timer
  useEffect(() => {
    if (!activeShift) return;
    const interval = setInterval(() => {
      setActiveShift((prev) => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          const career = CAREER_PATHS.find((c) => c.id === prev.careerId);
          if (career) {
            const reward =
              Math.floor(Math.random() * (career.payoutNairaMax - career.payoutNairaMin)) +
              career.payoutNairaMin;
            onUpdateBalances(reward, career.lagCoinsAward, -career.energyCost);
            playCoinSound();
            speakText(`Career shift completed! You earned ₦${reward.toLocaleString()}!`);
            // Check quest 1
            if (career.id === 'tech_bro') {
              setQuests((qList) =>
                qList.map((q) => (q.id === 'q1' ? { ...q, completed: true } : q))
              );
            }
          }
          return null;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeShift, onUpdateBalances]);

  // Danfo Rush Game Loop
  useEffect(() => {
    if (activeMiniGame !== 'danfo_rush' || danfoGameOver) return;

    const gameLoop = setInterval(() => {
      setObstacles((prev) => {
        let hitCoin = false;
        let hitObstacle = false;
        let coinIdToRemove: number | null = null;

        const next = prev
          .map((item) => ({ ...item, y: item.y + 6 * danfoSpeed }))
          .filter((item) => item.y < 350);

        // Spawn new obstacle or coin
        if (Math.random() < 0.28 && next.length < 5) {
          next.push({
            id: Date.now() + Math.random(),
            lane: Math.floor(Math.random() * 3),
            y: 0,
            isCoin: Math.random() < 0.45,
          });
        }

        // Check collision with player at y ~ 250-300
        for (const item of next) {
          if (item.y > 250 && item.y < 300 && item.lane === danfoLane) {
            if (item.isCoin) {
              hitCoin = true;
              coinIdToRemove = item.id;
              break;
            } else {
              hitObstacle = true;
              break;
            }
          }
        }

        if (hitCoin) {
          setTimeout(() => {
            playCoinSound();
            setDanfoScore((s) => {
              const nextScore = s + 100;
              if (nextScore >= 500) {
                setQuests((qList) =>
                  qList.map((q) => (q.id === 'q2' ? { ...q, completed: true } : q))
                );
              }
              return nextScore;
            });
          }, 0);
          return next.filter((o) => o.id !== coinIdToRemove);
        }

        if (hitObstacle) {
          setTimeout(() => setDanfoGameOver(true), 0);
          return next;
        }

        return next;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [activeMiniGame, danfoGameOver, danfoLane, danfoSpeed]);

  // Suya Grill cooking tick
  useEffect(() => {
    if (activeMiniGame !== 'suya_grill') return;
    const grillLoop = setInterval(() => {
      setSuyaSkewers((prev) =>
        prev.map((s) => {
          if (s.burnt) return s;
          const nextDoneness = s.doneness + 3;
          return {
            ...s,
            doneness: nextDoneness,
            burnt: nextDoneness >= 100,
          };
        })
      );
    }, 600);
    return () => clearInterval(grillLoop);
  }, [activeMiniGame]);

  const handleStartShift = (career: Career) => {
    if (energy < career.energyCost) {
      speakText('No energy left! Rest at your Life Together home or drink cold Zobo.');
      return;
    }
    if (activeShift) {
      speakText('You already have an active hustle shift running!');
      return;
    }
    playTapSound();
    setActiveShift({ careerId: career.id, timeLeft: career.cooldownSeconds });
    speakText(`Starting ${career.title} shift in ${career.location}!`);
  };

  const claimQuest = (questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q || !q.completed) return;
    playFanfareSound();
    onUpdateBalances(q.rewardNaira, q.rewardCoins, 10);
    setQuests((prev) => prev.filter((item) => item.id !== questId));
    speakText(`Claimed ₦${q.rewardNaira.toLocaleString()} and ${q.rewardCoins} LagCoins!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header Welcome & Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#12192c] via-[#0d1424] to-[#171228] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400 mb-1">
            <MapPin className="w-4 h-4" />
            <span>Lagos State Municipal District · Mainland to Island</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Eko Street Economy & Hustle Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Pick your daily career shift, play street mini-games, complete guild quests, or embark on dungeon raids across Computer Village, Oshodi, and Lekki.
          </p>
        </div>

        {/* Quick Energy & Stat Overview */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-0.5">Energy Stamina</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-yellow-400">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>{energy}/{maxEnergy}</span>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onOpenDungeons();
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/40 flex items-center gap-1.5 transition"
          >
            <span>Dungeon Raids</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mini-Games Section: Danfo Rush & Suya Grill */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-yellow-400" />
            <span>Lagos Street Mini-Games</span>
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                playTapSound();
                setActiveMiniGame(activeMiniGame === 'danfo_rush' ? 'none' : 'danfo_rush');
                setDanfoGameOver(false);
                setDanfoScore(0);
                setObstacles([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeMiniGame === 'danfo_rush'
                  ? 'bg-yellow-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Danfo Rush
            </button>
            <button
              onClick={() => {
                playTapSound();
                setActiveMiniGame(activeMiniGame === 'suya_grill' ? 'none' : 'suya_grill');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeMiniGame === 'suya_grill'
                  ? 'bg-orange-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Suya Barbecue Master
            </button>
          </div>
        </div>

        {/* 1. Danfo Rush Interactive Canvas Game */}
        {activeMiniGame === 'danfo_rush' && (
          <div className="p-6 rounded-2xl bg-[#0b101c] border border-yellow-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-yellow-400">
                Oshodi Highway Sprint · Dodge Potholes & Collect Naira Coins!
              </span>
              <span className="font-mono text-sm font-bold text-white">
                Score: <span className="text-yellow-400">{danfoScore}</span> pts
              </span>
            </div>

            {/* Highway Road Simulation Box */}
            <div className="relative h-64 w-full max-w-lg mx-auto bg-slate-950 rounded-xl border border-slate-800 overflow-hidden select-none">
              {/* Lane Markings */}
              <div className="absolute inset-y-0 left-1/3 w-0.5 border-r border-dashed border-yellow-500/30" />
              <div className="absolute inset-y-0 left-2/3 w-0.5 border-r border-dashed border-yellow-500/30" />

              {/* Obstacles & Coins */}
              {obstacles.map((obs) => {
                const laneLeft = obs.lane === 0 ? '16%' : obs.lane === 1 ? '50%' : '84%';
                return (
                  <div
                    key={obs.id}
                    style={{ left: laneLeft, top: `${obs.y}px` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                  >
                    {obs.isCoin ? (
                      <div className="w-8 h-8 rounded-full bg-yellow-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-lg shadow-yellow-400/50 animate-bounce">
                        ₦1K
                      </div>
                    ) : (
                      <div className="w-9 h-7 rounded bg-red-600/90 border border-red-400 text-[10px] font-bold text-white flex items-center justify-center">
                        BARRIER
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Player Danfo Bus */}
              <div
                style={{
                  left: danfoLane === 0 ? '16%' : danfoLane === 1 ? '50%' : '84%',
                  bottom: '20px',
                }}
                className="absolute -translate-x-1/2 transition-all duration-150"
              >
                <div className="w-12 h-14 rounded-lg bg-yellow-400 border-2 border-slate-900 shadow-xl flex flex-col items-center justify-center p-1 font-mono font-black text-[9px] text-slate-950">
                  <div className="w-10 h-3 bg-slate-900/80 rounded-sm mb-1" />
                  <span>DANFO</span>
                </div>
              </div>

              {/* Game Over Overlay */}
              {danfoGameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3">
                  <span className="font-display text-xl font-bold text-red-400">
                    Wahala! You hit a pothole!
                  </span>
                  <p className="text-xs text-slate-300">
                    Final Score: {danfoScore} · Earned ₦{Math.floor(danfoScore * 10).toLocaleString()}!
                  </p>
                  <button
                    onClick={() => {
                      onUpdateBalances(Math.floor(danfoScore * 10), Math.floor(danfoScore / 10), 0);
                      setDanfoGameOver(false);
                      setDanfoScore(0);
                      setObstacles([]);
                      playCoinSound();
                    }}
                    className="px-4 py-2 rounded-lg bg-yellow-400 text-slate-950 font-bold text-xs"
                  >
                    Collect & Play Again
                  </button>
                </div>
              )}
            </div>

            {/* Touch & Keyboard Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setDanfoLane((l) => Math.max(0, l - 1));
                  playTapSound();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700"
              >
                ◀ Steer Left
              </button>
              <button
                onClick={() => {
                  setDanfoLane((l) => Math.min(2, l + 1));
                  playTapSound();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700"
              >
                Steer Right ▶
              </button>
            </div>
          </div>
        )}

        {/* 2. Suya Barbecue Master Game */}
        {activeMiniGame === 'suya_grill' && (
          <div className="p-6 rounded-2xl bg-[#130d0a] border border-orange-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-orange-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Open Charcoal Hearth · Flip when Doneness is 70%-90%, Season with Yaji Pepper!</span>
              </span>
              <span className="font-mono text-sm font-bold text-white">
                Orders Served: <span className="text-orange-400">{suyaOrdersCompleted}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {suyaSkewers.map((skewer) => {
                const isReady = skewer.doneness >= 70 && skewer.doneness <= 95;
                return (
                  <div
                    key={skewer.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">Skewer #{skewer.id}</span>
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          skewer.burnt
                            ? 'text-red-500'
                            : isReady
                            ? 'text-emerald-400 animate-pulse'
                            : 'text-yellow-400'
                        }`}
                      >
                        {skewer.burnt ? 'BURNT!' : isReady ? 'PERFECT GOLDEN!' : `${skewer.doneness}% RAW`}
                      </span>
                    </div>

                    {/* Progress Bar of Doneness */}
                    <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, skewer.doneness)}%` }}
                        className={`h-full transition-all duration-300 ${
                          skewer.burnt
                            ? 'bg-red-600'
                            : isReady
                            ? 'bg-emerald-500'
                            : 'bg-orange-500'
                        }`}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          playTapSound();
                          setSuyaSkewers((prev) =>
                            prev.map((s) => (s.id === skewer.id ? { ...s, spiced: true } : s))
                          );
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                          skewer.spiced
                            ? 'bg-orange-500 text-white border-orange-400'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        {skewer.spiced ? '✓ Spiced with Yaji' : '+ Add Yaji Pepper'}
                      </button>

                      <button
                        onClick={() => {
                          if (skewer.burnt) {
                            // Reset burnt
                            setSuyaSkewers((prev) =>
                              prev.map((s) =>
                                s.id === skewer.id
                                  ? { id: s.id, doneness: 10, spiced: false, burnt: false }
                                  : s
                              )
                            );
                            speakText('Oya, throw away burnt meat and start fresh!');
                            return;
                          }
                          if (isReady && skewer.spiced) {
                            playCoinSound();
                            onUpdateBalances(3500, 25, 0);
                            setSuyaOrdersCompleted((c) => {
                              const nextC = c + 1;
                              if (nextC >= 3) {
                                setQuests((qList) =>
                                  qList.map((q) => (q.id === 'q3' ? { ...q, completed: true } : q))
                                );
                              }
                              return nextC;
                            });
                            speakText('Suya served to customer! ₦3,500 tip received!');
                            setSuyaSkewers((prev) =>
                              prev.map((s) =>
                                s.id === skewer.id
                                  ? { id: s.id, doneness: 10, spiced: false, burnt: false }
                                  : s
                              )
                            );
                          } else {
                            speakText('Meat not ready or not spiced yet!');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        Serve
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Career Paths & Active Shift Hustle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <span>Lagos Career Shifts</span>
          </h3>
          {activeShift && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-600 text-purple-300 text-xs font-mono font-bold animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Hustling... {activeShift.timeLeft}s left</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAREER_PATHS.map((career) => {
            const isCurrentShift = activeShift?.careerId === career.id;
            return (
              <div
                key={career.id}
                className="p-5 rounded-2xl bg-[#0e1422] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-semibold">
                      {career.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-yellow-400" />
                      <span>{career.location}</span>
                    </span>
                  </div>

                  <h4 className="font-display text-base font-bold text-white mb-1.5">
                    {career.title}
                  </h4>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    {career.description}
                  </p>

                  <div className="space-y-1.5 mb-4 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Shift Payout:</span>
                      <span className="text-emerald-400 font-semibold">
                        ₦{career.payoutNairaMin.toLocaleString()} – ₦{career.payoutNairaMax.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>LagCoins:</span>
                      <span className="text-yellow-400 font-semibold">+{career.lagCoinsAward}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Energy Cost:</span>
                      <span>-{career.energyCost} Energy</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartShift(career)}
                  disabled={!!activeShift}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 ${
                    isCurrentShift
                      ? 'bg-purple-900 text-purple-200 border border-purple-600'
                      : activeShift
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isCurrentShift ? `Working (${activeShift?.timeLeft}s)` : 'Start Shift'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Challenges & Quests */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4">
        <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400" />
          <span>Daily Lagos Quests & Bounty Board</span>
        </h3>

        <div className="space-y-3">
          {quests.map((q) => (
            <div
              key={q.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <span className="text-sm font-semibold text-white block">{q.title}</span>
                <p className="text-xs text-slate-400 mt-0.5">{q.desc}</p>
                <div className="flex items-center gap-3 text-xs font-mono mt-1">
                  <span className="text-emerald-400">₦{q.rewardNaira.toLocaleString()}</span>
                  <span className="text-yellow-400">+{q.rewardCoins} Coins</span>
                </div>
              </div>

              <button
                onClick={() => claimQuest(q.id)}
                disabled={!q.completed}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  q.completed
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {q.completed ? 'Claim Bounty' : 'In Progress'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
