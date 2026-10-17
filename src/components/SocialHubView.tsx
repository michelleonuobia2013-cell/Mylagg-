import React, { useState, useEffect } from 'react';
import {
  Users,
  Mic,
  MicOff,
  Radio,
  Trophy,
  ShieldCheck,
  Volume2,
  Sparkles,
  MessageSquare,
  Award
} from 'lucide-react';
import { GuildMember } from '../types/game';
import { playTapSound } from '../utils/audio';
import { speakText } from '../utils/speech';

interface SocialHubViewProps {
  username: string;
  playerLevel: number;
  balanceNaira: number;
}

const INITIAL_GUILD_MEMBERS: GuildMember[] = [
  {
    id: 'gm_1',
    name: 'Amina_Volt (You)',
    role: 'Guild Master',
    level: 12,
    nairaNetWorth: 450000,
    isOnline: true,
    avatarSeed: 'Amina',
    isSpeaking: false,
  },
  {
    id: 'gm_2',
    name: 'Babatunde_Danfo',
    role: 'Elder',
    level: 11,
    nairaNetWorth: 380000,
    isOnline: true,
    avatarSeed: 'Babatunde',
    isSpeaking: true,
  },
  {
    id: 'gm_3',
    name: 'Chidi_YabaDev',
    role: 'Member',
    level: 10,
    nairaNetWorth: 290000,
    isOnline: true,
    avatarSeed: 'Chidi',
    isSpeaking: false,
  },
  {
    id: 'gm_4',
    name: 'Folake_Nollywood',
    role: 'Member',
    level: 9,
    nairaNetWorth: 210000,
    isOnline: false,
    avatarSeed: 'Folake',
  },
];

const LEADERBOARD_ENTRIES = [
  { rank: 1, name: 'Senator_Eko', guild: 'Eko Atlantic Moguls', netWorth: '₦14,850,000', badge: '🥇' },
  { rank: 2, name: 'Lekki_Tech_Oracle', guild: 'Tech Cabal Yaba', netWorth: '₦9,420,000', badge: '🥈' },
  { rank: 3, name: 'Balogun_Merchant_King', guild: 'Alaba Cartel', netWorth: '₦8,110,000', badge: '🥉' },
  { rank: 4, name: 'Amina_Volt', guild: 'Tech Cabal Yaba', netWorth: '₦3,850,000', badge: '4th' },
  { rank: 5, name: 'Oshodi_Conductor_Pro', guild: 'Lagos Boys Syndicate', netWorth: '₦2,400,000', badge: '5th' },
];

export const SocialHubView: React.FC<SocialHubViewProps> = ({
  username,
  playerLevel,
  balanceNaira,
}) => {
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [activeVoiceChannel, setActiveVoiceChannel] = useState<string>('Guild Tactical Squad');
  const [members, setMembers] = useState<GuildMember[]>(INITIAL_GUILD_MEMBERS);
  const [chatMessages, setChatMessages] = useState<
    { id: number; sender: string; text: string; time: string }[]
  >([
    { id: 1, sender: 'Babatunde_Danfo', text: 'Who dey raid Computer Village tonight? Bring Pyro and Hydro!', time: '10:02' },
    { id: 2, sender: 'Chidi_YabaDev', text: 'My Danfo Rush score just hit 800! Cashout cleared instantly to my GTB.', time: '10:04' },
  ]);
  const [inputMsg, setInputMsg] = useState<string>('');

  // Voice chat speaking indicator simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.name.includes('(You)')) {
            return { ...m, isSpeaking: isMicActive };
          }
          // Randomly simulate other members speaking
          return {
            ...m,
            isSpeaking: Math.random() < 0.25,
          };
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, [isMicActive]);

  const toggleMic = () => {
    playTapSound();
    const nextState = !isMicActive;
    setIsMicActive(nextState);
    if (nextState) {
      speakText(`Microphone activated in ${activeVoiceChannel}. Press to coordinate attacks.`);
    } else {
      speakText('Microphone muted.');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    playTapSound();
    const newMsg = {
      id: Date.now(),
      sender: username,
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Anti-Cheat Sentinel Banner */}
      <div className="p-6 rounded-2xl bg-[#0f1728] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Low-Latency Lagos Voice Hub & Guild Radio</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            Guild Headquarters: Tech Cabal Yaba
          </h2>
          <p className="text-xs text-slate-300">
            Coordinate elemental burst combos via real-time voice chat, matchmake for dungeon raids, and inspect the cross-platform global leaderboards.
          </p>
        </div>

        {/* Anti-Cheat Shield Badge */}
        <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-emerald-600/60 flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div className="leading-tight">
            <span className="font-bold text-white block">mylag Sentinel Anti-Cheat</span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Fair Play Verified</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Live Voice Chat Room */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Active Voice Room</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {activeVoiceChannel}
              </span>
            </div>

            {/* Voice Channel Selector */}
            <div className="flex gap-1.5 mb-4 text-[11px]">
              {['Guild Tactical Squad', 'Lagos Global Radio', 'Lekki VIP Lounge'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => {
                    playTapSound();
                    setActiveVoiceChannel(ch);
                  }}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-center font-semibold truncate border ${
                    activeVoiceChannel === ch
                      ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {ch.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Speaking Members List */}
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                    member.isSpeaking
                      ? 'bg-purple-950/50 border-purple-500 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        member.isSpeaking
                          ? 'bg-emerald-400 animate-ping'
                          : member.isOnline
                          ? 'bg-emerald-500'
                          : 'bg-slate-600'
                      }`}
                    />
                    <div>
                      <span className="font-bold text-white block">{member.name}</span>
                      <span className="text-[10px] text-slate-400">{member.role} · Lv.{member.level}</span>
                    </div>
                  </div>

                  {member.isSpeaking && (
                    <span className="text-[10px] font-mono text-cyan-300 animate-pulse">
                      Speaking...
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Push-to-Talk Mic Controller */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={toggleMic}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                isMicActive
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950 animate-pulse'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950'
              }`}
            >
              {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span>{isMicActive ? 'Mute Mic (Live On Air)' : 'Push to Talk (Muted)'}</span>
            </button>
          </div>
        </div>

        {/* Center Col: Real-time Guild Chat Feed */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Guild Comms Dispatch</span>
            </h3>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-purple-300">@{msg.sender}</span>
                    <span className="text-[10px] font-mono text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-slate-200">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Send message to guild..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              Send
            </button>
          </form>
        </div>

        {/* Right Col: Cross-Platform Global Leaderboard */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Global Wealth Ranks</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Season 1</span>
          </div>

          <div className="divide-y divide-slate-800">
            {LEADERBOARD_ENTRIES.map((entry) => (
              <div
                key={entry.rank}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-yellow-400 w-5">
                    {entry.badge}
                  </span>
                  <div>
                    <span className="font-bold text-white block truncate max-w-[120px]">
                      {entry.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{entry.guild}</span>
                  </div>
                </div>

                <span className="font-mono font-bold text-emerald-400">
                  {entry.netWorth}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
