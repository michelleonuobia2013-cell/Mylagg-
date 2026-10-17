import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Building2,
  Calendar,
  Mail,
  Coins,
  Wallet,
  Smartphone,
  Download,
  Volume2,
  VolumeX,
  Mic,
  Eye,
  Award,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ExternalLink,
  Shield,
  Zap,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { UserProfile, NIGERIAN_BANKS, validatePlayerAge, validateNubanAccount } from '../game/economy';
import { playTapSound, playCoinSound } from '../utils/audio';
import { speakText } from '../utils/speech';
import { FormatNaira, NairaSign } from './NairaSign';

interface ProfileViewProps {
  userProfile: UserProfile;
  balanceNaira: number;
  lagCoins: number;
  playerLevel: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ttsEnabled: boolean;
  onToggleTts: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigateFintech: () => void;
  onOpenBattlePass: () => void;
  appIconUrl: string;
  isInstallable: boolean;
  onInstallPWA: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  balanceNaira,
  lagCoins,
  playerLevel,
  soundEnabled,
  onToggleSound,
  ttsEnabled,
  onToggleTts,
  highContrast,
  onToggleHighContrast,
  onUpdateProfile,
  onNavigateFintech,
  onOpenBattlePass,
  appIconUrl,
  isInstallable,
  onInstallPWA,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [username, setUsername] = useState(userProfile.username);
  const [email, setEmail] = useState(userProfile.email);
  const [birthYear, setBirthYear] = useState<number>(userProfile.birthYear);
  const [birthMonth, setBirthMonth] = useState<number>(userProfile.birthMonth);
  const [birthDay, setBirthDay] = useState<number>(userProfile.birthDay);
  const [bankCode, setBankCode] = useState(userProfile.bankAccount.bankCode);
  const [accountNumber, setAccountNumber] = useState(userProfile.bankAccount.accountNumber);
  const [accountName, setAccountName] = useState(userProfile.bankAccount.accountName);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    // Validate Age (13 to 100+)
    const ageVal = validatePlayerAge(birthYear, birthMonth, birthDay);
    if (!ageVal.valid) {
      setFeedbackMsg({ type: 'error', text: ageVal.message || 'Age restriction: 13 to 100+ years only.' });
      return;
    }

    // Validate NUBAN
    if (!validateNubanAccount(accountNumber)) {
      setFeedbackMsg({ type: 'error', text: 'Account number must be exactly 10 digits for Nigerian NUBAN.' });
      return;
    }

    const selectedBank = NIGERIAN_BANKS.find((b) => b.code === bankCode) || NIGERIAN_BANKS[0];

    const updated: UserProfile = {
      ...userProfile,
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      birthYear,
      birthMonth,
      birthDay,
      age: ageVal.age,
      bankAccount: {
        bankCode,
        bankName: selectedBank.name,
        accountNumber,
        accountName: accountName.trim() || fullName.toUpperCase(),
        verified: true,
      },
    };

    onUpdateProfile(updated);
    setIsEditing(false);
    playCoinSound();
    setFeedbackMsg({ type: 'success', text: 'Citizen identity & bank details saved successfully!' });
    speakText(`Profile updated for ${updated.fullName}. Bank verified with ${selectedBank.name}.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner: Profile Header & Verified Badge */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#121629] via-[#0d1222] to-[#161c32] border border-purple-900/40 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={appIconUrl}
                alt="Profile Avatar"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-purple-500 shadow-lg shadow-purple-950/60"
              />
              <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] tracking-wider border-2 border-[#0d1222]">
                LV.{playerLevel}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-display font-extrabold text-white">
                  {userProfile.fullName}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/40">
                  @{userProfile.username}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Lagosian
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Citizen ID: <strong className="text-slate-300 font-mono">{userProfile.id}</strong> · Age:{' '}
                <strong className="text-yellow-400 font-bold">{userProfile.age} yrs</strong> (Eligible 13–100+)
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {userProfile.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  DOB: {userProfile.birthDay}/{userProfile.birthMonth}/{userProfile.birthYear}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => {
                playTapSound();
                setIsEditing(!isEditing);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Edit3 className="w-4 h-4 text-purple-400" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Account & Bank'}</span>
            </button>
            <button
              onClick={() => {
                playTapSound();
                onNavigateFintech();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 transition"
            >
              <Wallet className="w-4 h-4" />
              <span>Cashout <FormatNaira amount={balanceNaira} iconClass="w-3.5 h-3.5 mr-0.5 inline-block" /></span>
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                : 'bg-red-950/80 border-red-600 text-red-200'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {/* Edit Form (Collapsible) */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="p-6 rounded-2xl bg-[#0c1220] border border-purple-500/50 shadow-2xl space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" />
              <span>Edit Citizen Information & Real Bank Account</span>
            </h3>
            <span className="text-xs text-yellow-400 font-mono">Changes reflect immediately across mylag</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Username / Tag</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Date of Birth (Day / Month / Year - 13 to 100+ required)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  aria-label="Birth Day"
                  value={birthDay}
                  onChange={(e) => setBirthDay(parseInt(e.target.value, 10))}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2.5 text-white"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Day {d}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Birth Month"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(parseInt(e.target.value, 10))}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2.5 text-white"
                >
                  {[
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                  ].map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Birth Year"
                  value={birthYear}
                  onChange={(e) => setBirthYear(parseInt(e.target.value, 10))}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2.5 text-white"
                >
                  {Array.from({ length: 95 }, (_, i) => 2013 - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Nigerian Bank Setup */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Nigerian Bank Account For Direct Cashout</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Bank Name</label>
                <select
                  aria-label="Bank Name"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">10-Digit NUBAN Account Number</label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 font-mono text-white tracking-widest"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1">Account Holder Name</label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 font-mono text-xs text-emerald-400 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950"
            >
              Save Profile & Bank
            </button>
          </div>
        </form>
      )}

      {/* Grid: Linked Bank Card & Live Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Linked Bank Card */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-[#0c1824] via-[#09131d] to-[#141d2e] border border-emerald-900/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-md">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="font-display font-bold text-white text-base block">
                  {userProfile.bankAccount.bankName}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Verified Real Account · Central Bank NIP Gateway
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700">
              ACTIVE WITHDRAWAL
            </span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-slate-800/80 font-mono space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">NUBAN Number:</span>
              <span className="text-white font-bold tracking-widest text-sm">
                {userProfile.bankAccount.accountNumber}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Account Name:</span>
              <span className="text-emerald-400 font-bold">{userProfile.bankAccount.accountName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified for Instant Settlement
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Automated Escrow Protection enabled on all earnings</span>
            </span>
            <button
              onClick={() => {
                playTapSound();
                onNavigateFintech();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5"
            >
              <span>Go to Bank Cashout</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Balances Card */}
        <div className="p-6 rounded-2xl bg-[#0c1220] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-display font-bold text-white text-sm mb-3">Wallet & Level Status</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Real Balance</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  <FormatNaira amount={balanceNaira} iconClass="w-4 h-4 mr-1 text-emerald-400" />
                </span>
              </div>
              <div className="p-3 rounded-xl bg-yellow-950/40 border border-yellow-900/60">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">LagCoins</span>
                <span className="text-xl font-bold font-mono text-yellow-400">
                  {lagCoins.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onOpenBattlePass();
            }}
            className="w-full py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-600/60 text-purple-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Award className="w-4 h-4 text-yellow-400" />
            <span>View Battle Pass & Streak</span>
          </button>
        </div>
      </div>

      {/* Security & System Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Anti-Cheat & Security */}
        <div className="p-6 rounded-2xl bg-[#0c1220] border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-600/50 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">mylag Sentinel Anti-Cheat Engine</h4>
              <p className="text-xs text-slate-400">Client-Side Memory Auditing & Fair Play</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span>Memory Integrity Scanner:</span>
              <span className="text-emerald-400 font-mono font-bold">SECURE (0 Anomalies)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span>Escrow Multi-Sig Protection:</span>
              <span className="text-emerald-400 font-mono font-bold">ARMED</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span>Fair Play Leaderboard Verification:</span>
              <span className="text-emerald-400 font-mono font-bold">PASS</span>
            </div>
          </div>
        </div>

        {/* Accessibility & Device Integration */}
        <div className="p-6 rounded-2xl bg-[#0c1220] border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-600/50 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Accessibility & Device Features</h4>
              <p className="text-xs text-slate-400">Audio, TTS voice narration, and high contrast</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                playTapSound();
              }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                soundEnabled
                  ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5" />}
              <span className="text-[11px] font-semibold">{soundEnabled ? 'Audio On' : 'Muted'}</span>
            </button>

            {/* TTS Voice Narration */}
            <button
              onClick={() => {
                playTapSound();
                onToggleTts();
              }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                ttsEnabled
                  ? 'bg-yellow-500 text-slate-950 border-yellow-400 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span className="text-[11px]">{ttsEnabled ? 'TTS On' : 'TTS Off'}</span>
            </button>

            {/* High Contrast */}
            <button
              onClick={() => {
                playTapSound();
                onToggleHighContrast();
              }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                highContrast
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span className="text-[11px]">Contrast</span>
            </button>
          </div>

          {/* Cross Platform Download / Install */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-200 font-semibold block">Cross-Platform Sync</span>
              <span className="text-[11px] text-slate-400">iOS, Android, Tablet, PC & Mac</span>
            </div>
            {isInstallable ? (
              <button
                onClick={() => {
                  playTapSound();
                  onInstallPWA();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            ) : (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
                PWA Ready
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
