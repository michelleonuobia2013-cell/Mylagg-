import React from 'react';
import {
  Compass,
  Film,
  Swords,
  Home,
  ShoppingBag,
  Landmark,
  Users,
  User,
  Wallet,
  Coins,
  Bot,
  Volume2,
  VolumeX,
  Mic,
  Eye,
  Award,
  Download,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ActiveTab } from '../types/game';
import { playTapSound } from '../utils/audio';

import { FormatNaira, NairaSign } from './NairaSign';

interface GameHUDProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  balanceNaira: number;
  lagCoins: number;
  energy: number;
  maxEnergy: number;
  playerLevel: number;
  username: string;
  fullName: string;
  bankName: string;
  accountNumber: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ttsEnabled: boolean;
  onToggleTts: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenAIChat: () => void;
  onOpenAIStudio: () => void;
  onOpenBattlePass: () => void;
  appIconUrl: string;
  isInstallable: boolean;
  onInstallPWA: () => void;
  children: React.ReactNode;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  activeTab,
  onSelectTab,
  balanceNaira,
  lagCoins,
  energy,
  maxEnergy,
  playerLevel,
  username,
  fullName,
  bankName,
  accountNumber,
  soundEnabled,
  onToggleSound,
  ttsEnabled,
  onToggleTts,
  highContrast,
  onToggleHighContrast,
  onOpenAIChat,
  onOpenAIStudio,
  onOpenBattlePass,
  appIconUrl,
  isInstallable,
  onInstallPWA,
  children,
}) => {
  // Navigation Items matching the Netflix pattern:
  // Home, Movie Box, Combat/Raids, Life Together, Marketplace, Cashout, Guilds, Profile
  const navItems = [
    {
      id: 'city' as ActiveTab,
      label: 'Home',
      badge: 'Lagos',
      icon: <Compass className="w-5 h-5" />,
      color: 'text-amber-400',
    },
    {
      id: 'watch_earn' as ActiveTab,
      label: 'Movie Box',
      badge: 'HOT',
      icon: <Film className="w-5 h-5" />,
      color: 'text-red-500',
    },
    {
      id: 'combat' as ActiveTab,
      label: 'Raids',
      badge: 'Genshin',
      icon: <Swords className="w-5 h-5" />,
      color: 'text-purple-400',
    },
    {
      id: 'housing' as ActiveTab,
      label: 'Life',
      badge: 'Pets',
      icon: <Home className="w-5 h-5" />,
      color: 'text-cyan-400',
    },
    {
      id: 'marketplace' as ActiveTab,
      label: 'Market',
      badge: 'Escrow',
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'text-blue-400',
    },
    {
      id: 'fintech' as ActiveTab,
      label: 'Cashout',
      badge: '₦ CBN',
      icon: <Landmark className="w-5 h-5" />,
      color: 'text-emerald-400',
      highlight: true,
    },
    {
      id: 'social' as ActiveTab,
      label: 'Guilds',
      badge: 'Voice',
      icon: <Users className="w-5 h-5" />,
      color: 'text-pink-400',
    },
    {
      id: 'profile' as ActiveTab,
      label: 'Profile',
      badge: 'Bank',
      icon: <User className="w-5 h-5" />,
      color: 'text-yellow-400',
    },
  ];

  // Mobile Bottom bar items (Netflix style bottom dock)
  const mobileBottomItems = [
    {
      id: 'city' as ActiveTab,
      label: 'Home',
      icon: <Compass className="w-5 h-5" />,
    },
    {
      id: 'watch_earn' as ActiveTab,
      label: 'Movie Box',
      icon: <Film className="w-5 h-5" />,
      badge: 'HOT',
    },
    {
      id: 'combat' as ActiveTab,
      label: 'Raids',
      icon: <Swords className="w-5 h-5" />,
    },
    {
      id: 'housing' as ActiveTab,
      label: 'Life',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'fintech' as ActiveTab,
      label: 'Cashout',
      icon: <Landmark className="w-5 h-5" />,
      highlight: true,
    },
    {
      id: 'profile' as ActiveTab,
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100">
      {/* 1. TOP STATUS BAR (Live balance, level, AI companion, accessibility) */}
      <header className="sticky top-0 z-30 w-full bg-[#080d1a]/95 border-b border-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Tomboy Avatar */}
          <button
            onClick={() => {
              playTapSound();
              onSelectTab('city');
            }}
            className="flex items-center gap-2.5 text-left group shrink-0"
          >
            <div className="relative">
              <img
                src={appIconUrl}
                alt="mylag Icon"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover ring-1 ring-purple-500 group-hover:scale-105 transition"
              />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#080d1a]" />
            </div>
            <div className="leading-tight">
              <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                mylag
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-red-600 text-white font-extrabold rounded">
                  EKO
                </span>
              </span>
            </div>
          </button>

          {/* Center: Live Real-Balance Display & Quick Cashout Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real Naira Balance (Direct Cashout Link) */}
            <button
              onClick={() => {
                playTapSound();
                onSelectTab('fintech');
              }}
              title="Click for Direct Bank Cashout & P2P"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-emerald-900/60 border border-emerald-500/80 hover:border-emerald-400 text-emerald-400 text-xs sm:text-sm font-mono font-bold tracking-tight shadow-lg shadow-emerald-950/50 transition hover:scale-105 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <FormatNaira amount={balanceNaira} iconClass="w-3.5 h-3.5 mr-0.5" />
              <span className="hidden sm:inline text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded ml-1">
                CASHOUT
              </span>
            </button>

            {/* LagCoins */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-yellow-950/40 border border-yellow-800/60 text-yellow-400 text-xs font-mono font-semibold">
              <Coins className="w-3.5 h-3.5 shrink-0" />
              <span className="tabular-nums">{lagCoins.toLocaleString()}</span>
            </div>

            {/* Energy */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-300 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>{energy}/{maxEnergy}</span>
            </div>
          </div>

          {/* Right: Quick Actions & Accessibility Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mama Chichi AI Companion Trigger */}
            <button
              onClick={() => {
                playTapSound();
                onOpenAIChat();
              }}
              title="Chat with Mama Chichi (AI Lagos Guide)"
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-600/80 text-purple-200 text-xs font-semibold shadow-md transition"
            >
              <Bot className="w-4 h-4 text-purple-300" />
              <span className="hidden sm:inline">Mama Chichi</span>
            </button>

            {/* Daily Battle Pass Streak */}
            <button
              onClick={() => {
                playTapSound();
                onOpenBattlePass();
              }}
              title="Open Battle Pass & Daily Login Rewards"
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 text-xs font-semibold flex items-center gap-1 transition"
            >
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="hidden md:inline">Streak</span>
            </button>

            {/* Sound Mute/Unmute */}
            <button
              onClick={() => {
                onToggleSound();
                playTapSound();
              }}
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-400" />
              )}
            </button>

            {/* TTS Screen Reader (Desktop) */}
            <button
              onClick={() => {
                playTapSound();
                onToggleTts();
              }}
              title="Toggle Text to Speech Voice Narration"
              className={`hidden sm:flex p-2 rounded-xl border transition ${
                ttsEnabled
                  ? 'bg-yellow-500 text-slate-950 border-yellow-400 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* High Contrast Mode (Desktop) */}
            <button
              onClick={() => {
                playTapSound();
                onToggleHighContrast();
              }}
              title="Toggle High Contrast Mode"
              className={`hidden md:flex p-2 rounded-xl border transition ${
                highContrast
                  ? 'bg-white text-black border-white'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* PWA Install Button */}
            {isInstallable && (
              <button
                onClick={() => {
                  playTapSound();
                  onInstallPWA();
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>App</span>
              </button>
            )}

            {/* Profile Avatar & Bank Status */}
            <button
              onClick={() => {
                playTapSound();
                onSelectTab('profile');
              }}
              title="Open Profile & Bank Account"
              className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border text-xs font-semibold transition ${
                activeTab === 'profile'
                  ? 'bg-purple-600/40 text-purple-300 border-purple-500'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="hidden sm:inline max-w-[80px] truncate">{username}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-slate-950 text-yellow-400">
                Lv.{playerLevel}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MIDDLE BODY: Left Side Rail (Desktop) + Main Content Area */}
      <div className="flex-1 flex flex-row min-h-0">
        {/* Netflix Desktop/Laptop Left Sidebar */}
        <aside className="hidden md:flex flex-col w-56 lg:w-64 bg-[#090e1c] border-r border-slate-800/80 p-4 space-y-6 shrink-0 min-h-[calc(100vh-3.5rem)] sticky top-14 self-start">
          {/* User Mini Card */}
          <div
            onClick={() => {
              playTapSound();
              onSelectTab('profile');
            }}
            className="p-3 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-purple-500/60 cursor-pointer transition flex items-center gap-3"
          >
            <img
              src={appIconUrl}
              alt="User Avatar"
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-purple-500"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white truncate block">{fullName}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {bankName ? bankName.split(' ')[0] : 'Bank'} · {accountNumber.slice(-4)}
              </p>
            </div>
          </div>

          {/* Netflix Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 pb-1">
              Navigation
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playTapSound();
                    onSelectTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600/30 to-purple-600/30 text-white border border-red-500/50 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${isActive ? 'text-red-400 scale-110' : item.color} transition-transform`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </div>

                  {item.highlight ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold animate-pulse">
                      {item.badge}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 group-hover:text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Bank Cashout Card in Sidebar */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">FINANCIAL SANDBOX</span>
              <span className="text-[10px] font-bold text-emerald-400">VERIFIED</span>
            </div>
            <button
              onClick={() => {
                playTapSound();
                onSelectTab('fintech');
              }}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5 transition"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Instant Bank Cashout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-24 md:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 3. NETFLIX-STYLE BOTTOM NAVIGATION BAR (Mobile & Tablet Portrait < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090e1c]/95 backdrop-blur-xl border-t border-slate-800/90 pb-[env(safe-area-inset-bottom)] shadow-2xl">
        <div className="grid grid-cols-6 h-16">
          {mobileBottomItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playTapSound();
                  onSelectTab(item.id);
                }}
                className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'text-red-500 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active glow dot */}
                {isActive && (
                  <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-500" />
                )}

                <div className={`${isActive ? 'scale-110 text-red-500' : ''} transition-transform`}>
                  {item.icon}
                </div>

                <span className="text-[10px] tracking-tight leading-none">
                  {item.label}
                </span>

                {item.highlight && !isActive && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
