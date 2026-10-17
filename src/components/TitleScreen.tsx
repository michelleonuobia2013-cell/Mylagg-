import React, { useEffect } from 'react';
import { Sparkles, ShieldCheck, Download, Smartphone, Laptop, Gamepad2, ArrowRight } from 'lucide-react';
import { playTapSound, playFanfareSound } from '../utils/audio';

interface TitleScreenProps {
  onStart: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  username?: string;
  appIconUrl: string;
  heroBgUrl: string;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenAuth,
  isLoggedIn,
  username,
  appIconUrl,
  heroBgUrl,
}) => {
  useEffect(() => {
    // Listen for Enter or Space to quickly launch into game per Ultra Mode Title Craft
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playFanfareSound();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#070b12] text-slate-100">
      {/* Background Hero Key-Art with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBgUrl}
          alt="Lagos Cyberpunk Night Skyline"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/60 to-[#070b12]/40" />
      </div>

      {/* Top Banner Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={appIconUrl}
            alt="mylag Purple-Haired Tomboy Icon"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-500/80 shadow-lg shadow-purple-950/50"
          />
          <div>
            <span className="font-display text-2xl font-black tracking-tight text-white flex items-center gap-2">
              mylag
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-yellow-400 text-slate-950 tracking-normal">
                LAGOS LIFE RPG
              </span>
            </span>
            <p className="text-xs text-slate-300">Afro-Cyberpunk City Simulation · Ages 13–100+</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={onStart}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-2"
            >
              <span>Resume as {username}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                playTapSound();
                onOpenAuth();
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Sign In / Bank Verification
            </button>
          )}
        </div>
      </header>

      {/* Hero Centerpiece & Call-to-Action */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center my-auto">
        {/* Thematic Emblem */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-purple-500/40 text-purple-300 text-xs font-medium mb-6 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Vibrant Nigerian Culture · Real-Economy Sandbox · Elemental Combat</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.08] text-balance">
          Hustle, Raid & Earn in <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-300 to-cyan-400">Cyber Lagos</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          From Oshodi bus stops to high-altitude Lekki penthouses: battle elemental dungeon spirits,
          watch Nollywood blockbusters to earn directly, build your Life Together home, and withdraw verified funds through trusted Nigerian gateways.
        </p>

        {/* Primary Start CTA Button (Adheres to Ultra Mode data-start="true") */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
          <button
            data-start="true"
            onClick={() => {
              playFanfareSound();
              onStart();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 text-white font-display font-bold text-lg shadow-xl shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Enter Lagos (Press Space or Enter)</span>
            <ArrowRight className="w-5 h-5 text-yellow-300" />
          </button>
        </div>

        {/* Device Compatibility and Features Pills-Free Strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>iOS & Android Ready</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <Laptop className="w-4 h-4 text-purple-400" />
            <span>Mac, Windows & Tablets</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-yellow-400" />
            <span>Controller & Keyboard Mapped</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified NUBAN Payout Sandbox</span>
          </div>
        </div>
      </main>

      {/* Footer Safe Area with Clean Control Hints */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          <span>WASD / Touch Move · 1-4 Switch Heroes · Q/E Skills · Space Dash / Burst · P Pause</span>
        </div>
        <div>
          <span>mylag Lagos Simulation © 2026 · Licensed Real Economy Sandbox</span>
        </div>
      </footer>
    </div>
  );
};
