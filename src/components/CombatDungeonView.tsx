import React, { useState, useEffect } from 'react';
import {
  Swords,
  Shield,
  Zap,
  Flame,
  Droplets,
  Wind,
  Sparkles,
  RotateCcw,
  Trophy,
  Skull,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import {
  CharacterHero,
  DungeonStage,
  DUNGEON_STAGES,
  getInitialHeroRoster,
  calculateCombatDamage,
  ElementType
} from '../game/combat';
import {
  playElementalSlashSound,
  playCoinSound,
  playFanfareSound,
  playTapSound
} from '../utils/audio';
import { speakText } from '../utils/speech';

interface CombatDungeonViewProps {
  appIconUrl: string;
  combatDungeonBgUrl: string;
  onReward: (naira: number, coins: number) => void;
}

export const CombatDungeonView: React.FC<CombatDungeonViewProps> = ({
  appIconUrl,
  combatDungeonBgUrl,
  onReward,
}) => {
  const [roster, setRoster] = useState<CharacterHero[]>(() => getInitialHeroRoster(appIconUrl));
  const [activeHeroId, setActiveHeroId] = useState<string>('amina_volt');
  const [selectedStage, setSelectedStage] = useState<DungeonStage>(DUNGEON_STAGES[0]);

  // Active Battle State
  const [isInBattle, setIsInBattle] = useState<boolean>(true);
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState<number>(0);
  const [enemies, setEnemies] = useState(selectedStage.enemies);
  const [battleLogs, setBattleLogs] = useState<{ id: number; text: string; reaction?: string }[]>([
    {
      id: 1,
      text: 'Computer Village Cyber-Heist initiated! Glitch Drone engaged. Choose Normal Strike or Skill [E]!',
    },
  ]);
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});
  const [battleOutcome, setBattleOutcome] = useState<'NONE' | 'VICTORY' | 'DEFEAT'>('NONE');
  const [hitEffect, setHitEffect] = useState<{ text: string; isCrit: boolean; element: ElementType } | null>(null);
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const activeHero = roster.find((h) => h.id === activeHeroId) || roster[0];
  const activeEnemy = enemies[currentEnemyIndex] || enemies[0];

  // Cooldown timer tick
  useEffect(() => {
    if (!isInBattle) return;
    const interval = setInterval(() => {
      setSkillCooldowns((prev) => {
        const next: Record<string, number> = {};
        for (const [key, val] of Object.entries(prev)) {
          if (val > 1) {
            next[key] = val - 1;
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isInBattle]);

  const handleStartStage = (stage: DungeonStage) => {
    playTapSound();
    setSelectedStage(stage);
    setEnemies(JSON.parse(JSON.stringify(stage.enemies)));
    setCurrentEnemyIndex(0);
    setBattleLogs([
      {
        id: Date.now(),
        text: `Entered ${stage.name}! ${stage.enemies[0].name} appears with hostile intent!`,
      },
    ]);
    setIsInBattle(true);
    setBattleOutcome('NONE');
    speakText(`Entering dungeon: ${stage.name}! Prepare for elemental combat!`);
  };

  const handleExecuteAttack = (skillType: 'Normal' | 'ElementalSkill' | 'ElementalBurst') => {
    if (!isInBattle || battleOutcome !== 'NONE') return;

    const skill = activeHero.skills.find((s) => s.type === skillType) || activeHero.skills[0];

    // Check cooldown
    if (skillCooldowns[skill.id] && skillCooldowns[skill.id] > 0) {
      speakText(`${skill.name} is on cooldown for ${skillCooldowns[skill.id]} seconds!`);
      return;
    }

    // Check energy for burst
    if (skillType === 'ElementalBurst' && activeHero.energy < (skill.energyCost || 70)) {
      speakText('Insufficient Elemental Energy! Use normal attacks to charge burst.');
      return;
    }

    playElementalSlashSound(activeHero.element);

    // Calculate player damage
    const damageResult = calculateCombatDamage(
      activeHero.baseAtk,
      skill.basePower,
      activeHero.critRate,
      activeHero.critDmg,
      activeEnemy.def,
      activeHero.element,
      activeEnemy.appliedElement
    );

    // Visual hit notification
    setHitEffect({
      text: `${damageResult.totalDamage}`,
      isCrit: damageResult.isCrit,
      element: activeHero.element,
    });
    setTimeout(() => setHitEffect(null), 800);

    // Set cooldown
    if (skill.cooldownSec > 0) {
      setSkillCooldowns((prev) => ({ ...prev, [skill.id]: skill.cooldownSec }));
    }

    // Energy adjustments
    setRoster((prev) =>
      prev.map((h) => {
        if (h.id === activeHero.id) {
          if (skillType === 'ElementalBurst') {
            return { ...h, energy: 0 };
          } else {
            return { ...h, energy: Math.min(h.maxEnergy, h.energy + 18) };
          }
        }
        return h;
      })
    );

    const reactionText = damageResult.reaction
      ? `⚡ [${damageResult.reaction.name} ${damageResult.reaction.damageMultiplier}x] ${damageResult.reaction.bonusEffect}!`
      : '';

    const newEnemyHp = Math.max(0, activeEnemy.currentHp - damageResult.totalDamage);

    setBattleLogs((prev) => [
      {
        id: Date.now(),
        text: `${activeHero.name} used ${skill.name} dealing ${damageResult.totalDamage} ${activeHero.element} DMG${damageResult.isCrit ? ' (CRITICAL!)' : ''}`,
        reaction: reactionText,
      },
      ...prev.slice(0, 15),
    ]);

    // Update enemy HP & applied element
    setEnemies((prev) =>
      prev.map((e, idx) =>
        idx === currentEnemyIndex
          ? {
              ...e,
              currentHp: newEnemyHp,
              appliedElement: activeHero.element,
            }
          : e
      )
    );

    // Check if enemy defeated
    if (newEnemyHp <= 0) {
      if (currentEnemyIndex + 1 < enemies.length) {
        // Next enemy wave
        setCurrentEnemyIndex((i) => i + 1);
        setBattleLogs((prev) => [
          {
            id: Date.now() + 1,
            text: `Defeated ${activeEnemy.name}! Wave ${currentEnemyIndex + 2} incoming: ${enemies[currentEnemyIndex + 1].name}!`,
          },
          ...prev,
        ]);
        speakText(`Enemy down! Next wave advancing!`);
      } else {
        // Victory!
        playFanfareSound();
        setBattleOutcome('VICTORY');
        const nairaReward =
          Math.floor(
            Math.random() * (selectedStage.rewards.nairaMax - selectedStage.rewards.nairaMin)
          ) + selectedStage.rewards.nairaMin;
        onReward(nairaReward, selectedStage.rewards.lagCoins);
        speakText(`Dungeon Cleared! You claimed ₦${nairaReward.toLocaleString()} and rare ${selectedStage.rewards.rareItemName}!`);
      }
      return;
    }

    // Enemy Retaliation Attack after 400ms
    setTimeout(() => {
      if (!isMountedRef.current) return;
      const enemyDmg = Math.max(
        15,
        Math.round(activeEnemy.atk * (100 / (100 + activeHero.baseDef)))
      );
      setRoster((prev) =>
        prev.map((h) =>
          h.id === activeHero.id
            ? { ...h, currentHp: Math.max(0, h.currentHp - enemyDmg) }
            : h
        )
      );

      setBattleLogs((prev) => [
        {
          id: Date.now() + 2,
          text: `${activeEnemy.name} struck back at ${activeHero.name} dealing ${enemyDmg} damage!`,
        },
        ...prev,
      ]);
    }, 400);
  };

  const getElementColor = (element: ElementType) => {
    switch (element) {
      case 'Electro':
        return 'text-purple-400 bg-purple-950/60 border-purple-500/50';
      case 'Hydro':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/50';
      case 'Pyro':
        return 'text-orange-400 bg-orange-950/60 border-orange-500/50';
      case 'Anemo':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50';
      case 'Geo':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Dungeon Selection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white flex items-center gap-2">
            <Swords className="w-6 h-6 text-purple-400" />
            <span>Elemental Dungeons & Raid Bosses</span>
          </h2>
          <p className="text-xs text-slate-300">
            Combine Electro, Hydro, Pyro and Anemo to trigger devastating elemental reactions (Vaporize, Electro-Charged, Overload)!
          </p>
        </div>

        {/* Stage Selector Dropdown */}
        <div className="flex items-center gap-2">
          {DUNGEON_STAGES.map((stage) => (
            <button
              key={stage.id}
              onClick={() => handleStartStage(stage)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                selectedStage.id === stage.id
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{stage.name.split(' ')[0]}</span>
              <span className="text-[10px] block opacity-75">Lv.{stage.recommendedLevel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Battle Arena Arena Box */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] shadow-2xl min-h-[460px] flex flex-col justify-between">
        {/* Background Visual Scrim */}
        <div className="absolute inset-0 z-0 opacity-45 pointer-events-none">
          <img
            src={combatDungeonBgUrl}
            alt="Dungeon Arena"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/70 to-transparent" />
        </div>

        {/* Arena Top: Active Enemy Status & Stage Badge */}
        <div className="relative z-10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-yellow-300 font-bold border border-yellow-500/30">
              {selectedStage.district} · Wave {currentEnemyIndex + 1}/{enemies.length}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="font-display text-xl font-bold text-white">{activeEnemy.name}</h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getElementColor(activeEnemy.element)}`}>
                {activeEnemy.element}
              </span>
              {activeEnemy.isBoss && (
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider">
                  BOSS
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{activeEnemy.title}</p>
          </div>

          {/* Enemy HP Meter */}
          <div className="w-full sm:w-72 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Target Integrity</span>
              <span className="text-red-400 font-bold">
                {activeEnemy.currentHp} / {activeEnemy.maxHp} HP
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                style={{
                  width: `${Math.max(0, (activeEnemy.currentHp / activeEnemy.maxHp) * 100)}%`,
                }}
                className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Floating Damage & Hit Effect Indicator */}
        {hitEffect && (
          <div className="absolute inset-x-0 top-1/3 flex justify-center pointer-events-none z-20">
            <div className="animate-bounce font-display font-black text-4xl text-yellow-300 drop-shadow-[0_4px_12px_rgba(234,179,8,0.8)]">
              {hitEffect.isCrit && '★ '} -{hitEffect.text} {hitEffect.element}
            </div>
          </div>
        )}

        {/* Victory / Defeat Modal Overlay */}
        {battleOutcome !== 'NONE' && (
          <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            {battleOutcome === 'VICTORY' ? (
              <div className="space-y-4 max-w-md">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-400/20 border border-yellow-400 flex items-center justify-center text-yellow-300">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="font-display text-3xl font-extrabold text-white">Dungeon Conquered!</h3>
                <p className="text-xs text-slate-300">
                  You routed the boss and retrieved high-value tech contraband from {selectedStage.name}!
                </p>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Cash Bounties:</span>
                    <span className="text-emerald-400 font-bold">
                      +₦{selectedStage.rewards.nairaMax.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>LagCoins:</span>
                    <span className="text-yellow-400 font-bold">
                      +{selectedStage.rewards.lagCoins}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Artifact Drop:</span>
                    <span className="text-purple-300 font-bold">
                      {selectedStage.rewards.rareItemName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleStartStage(selectedStage)}
                  className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-sm shadow-xl transition"
                >
                  Raid Again or Claim Next Stage
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400">
                  <Skull className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">Party Defeated</h3>
                <p className="text-xs text-slate-300">
                  Your team ran out of energy. Regroup and rest at your apartment before challenging again.
                </p>
                <button
                  onClick={() => handleStartStage(selectedStage)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Retry Dungeon
                </button>
              </div>
            )}
          </div>
        )}

        {/* Combat Action Controls & Party Roster */}
        <div className="relative z-10 p-5 bg-[#0a0f1d]/90 border-t border-slate-800 space-y-4">
          {/* Party Hero Switcher (1 - 4) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 hidden sm:inline">Active Hero:</span>
            {roster.map((hero) => {
              const isSelected = hero.id === activeHero.id;
              return (
                <button
                  key={hero.id}
                  onClick={() => {
                    playTapSound();
                    setActiveHeroId(hero.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${hero.element === 'Electro' ? 'bg-purple-400' : hero.element === 'Hydro' ? 'bg-cyan-400' : hero.element === 'Pyro' ? 'bg-orange-400' : 'bg-emerald-400'}`} />
                  <span>{hero.name}</span>
                  <span className="font-mono text-[10px] text-yellow-400">
                    HP {hero.currentHp}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Hero Stats & Action Skill Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Hero Vitals */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-white">{activeHero.name} ({activeHero.element})</span>
                <span className="font-mono text-emerald-400">
                  {activeHero.currentHp}/{activeHero.maxHp} HP
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${(activeHero.currentHp / activeHero.maxHp) * 100}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>

              {/* Elemental Burst Energy Bar */}
              <div className="flex justify-between pt-1 text-[11px] font-mono">
                <span className="text-slate-400">Burst Charge</span>
                <span className="text-yellow-400">{activeHero.energy}/100</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${activeHero.energy}%` }}
                  className="h-full bg-yellow-400 transition-all"
                />
              </div>
            </div>

            {/* Skill Action Triggers (Normal, Skill, Burst) */}
            <div className="md:col-span-2 grid grid-cols-3 gap-2">
              {activeHero.skills.map((skill) => {
                const cd = skillCooldowns[skill.id] || 0;
                const isBurst = skill.type === 'ElementalBurst';
                const canUseBurst = isBurst ? activeHero.energy >= 70 : true;

                return (
                  <button
                    key={skill.id}
                    disabled={cd > 0 || !canUseBurst}
                    onClick={() => handleExecuteAttack(skill.type)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      isBurst
                        ? 'bg-gradient-to-br from-yellow-500/20 to-purple-600/30 border-yellow-500/60 hover:border-yellow-400'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                      <span>{skill.type === 'Normal' ? 'Normal Strike' : skill.type === 'ElementalSkill' ? 'Skill [E]' : 'Burst [Q]'}</span>
                      {cd > 0 && <span className="text-red-400 font-mono">{cd}s</span>}
                    </div>
                    <span className="font-display font-bold text-xs text-white truncate mt-1">
                      {skill.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Power: {skill.basePower}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Battle Logs ticker */}
          <div className="max-h-24 overflow-y-auto rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] space-y-1 border border-slate-800 text-slate-300">
            {battleLogs.map((log) => (
              <div key={log.id} className="leading-tight">
                <span>{log.text}</span>
                {log.reaction && (
                  <span className="block text-yellow-400 font-bold">{log.reaction}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
