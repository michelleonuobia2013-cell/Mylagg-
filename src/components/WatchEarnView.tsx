import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  Tv,
  Share2,
  MessageCircle,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Coffee
} from 'lucide-react';
import { playCoinSound, playTapSound, playCashoutSound } from '../utils/audio';
import { speakText } from '../utils/speech';
import { FormatNaira, NairaSign } from './NairaSign';

interface WatchEarnViewProps {
  onEarnTick: (naira: number, coins: number) => void;
  onNavigateFintech: () => void;
}

interface MovieChannel {
  id: string;
  title: string;
  category: 'Trending' | 'Blockbuster' | 'Afrobeats' | 'Comedy' | 'Tech';
  genre: string;
  duration: string;
  videoUrl: string;
  synopsis: string;
  basePayoutRate: number; // in Naira per minute
  rating: string;
  director: string;
  cast: string;
  thumbnailGradient: string;
}

const MOVIE_DATABASE: MovieChannel[] = [
  {
    id: 'm1',
    title: 'The Lagos Heist: Lekki Midnight Express',
    category: 'Trending',
    genre: 'Cyber Action & Thriller',
    duration: '2h 15m',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    synopsis: 'A crew of underground tech specialists attempt to liberate confidential fintech algorithms on the Lekki Tollgate express route before sunrise.',
    basePayoutRate: 360,
    rating: '98% Match · 16+',
    director: 'Kemi Adetiba',
    cast: 'Sola Sobowale, Femi Adebayo, Genevieve Nnaji',
    thumbnailGradient: 'from-purple-900/80 to-slate-900',
  },
  {
    id: 'm2',
    title: 'Balogun Billionaire: From Keke to Penthouse',
    category: 'Blockbuster',
    genre: 'Nollywood Drama & Street Hustle',
    duration: '1h 48m',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    synopsis: 'The inspiring true saga of an Oshodi conductor who mastered wholesale electronics in Balogun market to build a multi-billion naira Yaba empire.',
    basePayoutRate: 380,
    rating: '96% Match · 13+',
    director: 'Kunle Afolayan',
    cast: 'Kunle Remi, Bimbo Ademoye, Ramsey Nouah',
    thumbnailGradient: 'from-amber-900/80 to-slate-900',
  },
  {
    id: 'm3',
    title: 'Afrobeats Neon Odyssey: Live at Eko Hotel',
    category: 'Afrobeats',
    genre: 'Live Concert & Afrofuturism',
    duration: '1h 10m',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    synopsis: 'Electrifying live performances, talking drums, heavy 808 bass, and synth beats recorded live at the prestigious Eko Convention Center.',
    basePayoutRate: 400,
    rating: '99% Match · All Ages',
    director: 'Clarence Peters',
    cast: 'Burna Boy, Asake, Ayra Starr, Tiwa Savage',
    thumbnailGradient: 'from-emerald-900/80 to-slate-900',
  },
  {
    id: 'm4',
    title: 'Computer Village Cyber Hustle 2.0',
    category: 'Tech',
    genre: 'Tech Documentary & Cyberpunk',
    duration: '1h 25m',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    synopsis: 'Deep inside the silicon heart of West Africa where elite chip engineers and crypto innovators turn recycled hardware into supercomputers.',
    basePayoutRate: 420,
    rating: '95% Match · 13+',
    director: 'Izu Ojukwu',
    cast: 'Ikeja Hackers Collective, Yaba Syndicate',
    thumbnailGradient: 'from-cyan-900/80 to-slate-900',
  },
  {
    id: 'm5',
    title: 'Lagos Comedy Jam: Traffic & Yellow Buses',
    category: 'Comedy',
    genre: 'Standup & Street Skits',
    duration: '52m',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    synopsis: 'Hilarious comedy specials capturing the chaotic humor of third mainland bridge traffic, agbero confrontations, and Nigerian parents.',
    basePayoutRate: 350,
    rating: '97% Match · 13+',
    director: 'Basketmouth Productions',
    cast: 'Basketmouth, Bovi, Taaooma, Sabinus',
    thumbnailGradient: 'from-pink-900/80 to-slate-900',
  },
];

const AUDIENCE_REACTIONS = [
  { user: 'Chidi_Ikeja', text: 'Omo! The graphics and plot twist is mad! 🔥' },
  { user: 'Amina_Surulere', text: 'This actor deserves AMVCA award no cap 😂' },
  { user: 'TundeLekki', text: '₦360 credited to my GTBank just watching this! E choke!' },
  { user: 'Bisi_VI', text: 'Popcorn boost is active, double cash flowing in 🍿' },
  { user: 'Kelechi_Yaba', text: 'Best Nollywood movie box ever! Up mylag!' },
  { user: 'Funke_Ogba', text: 'Who dey breathe?? That action sequence crazy!' },
];

export const WatchEarnView: React.FC<WatchEarnViewProps> = ({
  onEarnTick,
  onNavigateFintech,
}) => {
  const [selectedMovie, setSelectedMovie] = useState<MovieChannel>(MOVIE_DATABASE[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [sessionNairaEarned, setSessionNairaEarned] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [popcornBoostActive, setPopcornBoostActive] = useState<boolean>(false);
  const [popcornTimer, setPopcornTimer] = useState<number>(0);
  const [liveReactions, setLiveReactions] = useState(AUDIENCE_REACTIONS);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Streaming earnings calculation ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => {
          const next = prev + 1;
          if (next % 10 === 0 && next > 0) {
            playCoinSound();
          }
          return next;
        });

        // Earning rate (base / 60 seconds)
        // With popcorn boost = 2x
        const multiplier = popcornBoostActive ? 2 : 1;
        const nairaChunk = Math.round((selectedMovie.basePayoutRate / 60) * multiplier);
        const coinChunk = multiplier;

        setSessionNairaEarned((prev) => prev + nairaChunk);
        onEarnTick(nairaChunk, coinChunk);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedMovie, popcornBoostActive, onEarnTick]);

  // Popcorn boost countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (popcornBoostActive && popcornTimer > 0) {
      timer = setInterval(() => {
        setPopcornTimer((prev) => {
          if (prev <= 1) {
            setPopcornBoostActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [popcornBoostActive, popcornTimer]);

  // Rotate simulated audience reactions
  useEffect(() => {
    const reactionInterval = setInterval(() => {
      setLiveReactions((prev) => {
        const next = [...prev];
        const first = next.shift();
        if (first) next.push(first);
        return next;
      });
    }, 4500);
    return () => clearInterval(reactionInterval);
  }, []);

  const togglePlayback = () => {
    if (!videoRef.current) return;
    playTapSound();
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      speakText('Movie paused. Your earned Naira is safely stored.');
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      speakText(`Now playing ${selectedMovie.title}. Watch and earn real cash!`);
    }
  };

  const handleActivatePopcorn = () => {
    playCashoutSound();
    setPopcornBoostActive(true);
    setPopcornTimer(180); // 3 minutes
    speakText('Popcorn boost activated! Earning double 2x Naira while watching!');
  };

  const categories = ['All', 'Trending', 'Blockbuster', 'Afrobeats', 'Comedy', 'Tech'];

  const filteredMovies =
    selectedCategory === 'All'
      ? MOVIE_DATABASE
      : MOVIE_DATABASE.filter((m) => m.category === selectedCategory);

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 ${theaterMode ? 'bg-black/90 p-4 rounded-3xl' : ''}`}>
      {/* Netflix-style Top Billboard & Cinema Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#170e28] via-[#0f1424] to-[#0a1824] border border-purple-900/50 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[11px] tracking-wider uppercase shadow-md shadow-red-950">
                MOVIE BOX
              </span>
              <span className="text-xs font-mono text-yellow-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Nollywood Watch-to-Earn Cinema
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                CBN & NIP Verified Cashout
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Watch Nollywood Blockbusters & Earn Real Naira
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Stream any movie, concert, or comedy skit. Every second you watch automatically credits real Naira to your verified account!
            </p>
          </div>

          {/* Real-time Session Earnings Counter & Fast Cashout */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="px-5 py-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 text-left shadow-lg">
              <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
                <span>SESSION CASH EARNED</span>
                {popcornBoostActive && (
                  <span className="text-yellow-400 font-bold animate-pulse">2X BOOST ACTIVE</span>
                )}
              </div>
              <div className="font-mono text-2xl font-black text-emerald-400 tracking-tight flex items-center">
                <span className="mr-0.5">+</span>
                <FormatNaira amount={sessionNairaEarned} iconClass="w-5 h-5 mr-1" />
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                Rate: <FormatNaira amount={popcornBoostActive ? selectedMovie.basePayoutRate * 2 : selectedMovie.basePayoutRate} iconClass="w-3 h-3 mr-0.5" />/min
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  playTapSound();
                  onNavigateFintech();
                }}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 transition"
              >
                <span>Instant Cashout to Bank</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleActivatePopcorn}
                disabled={popcornBoostActive}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  popcornBoostActive
                    ? 'bg-yellow-500 text-slate-950 font-bold border border-yellow-400 shadow-lg shadow-yellow-950/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700'
                }`}
              >
                <Coffee className="w-3.5 h-3.5 text-yellow-400" />
                <span>
                  {popcornBoostActive
                    ? `2x Boost Active (${popcornTimer}s)`
                    : '🍿 Popcorn 2x Boost (3 min)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Video Cinema Player (Netflix Style) */}
      <div className="relative rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
        <video
          ref={videoRef}
          src={selectedMovie.videoUrl}
          playsInline
          loop
          className="w-full aspect-video max-h-[520px] object-cover mx-auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Video Overlays (Top Bar HUD) */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-slate-700 text-xs font-mono text-white flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="font-bold">{isPlaying ? 'LIVE STREAMING' : 'READY TO PLAY'}</span>
            <span className="text-yellow-400 flex items-center gap-1">· <FormatNaira amount={selectedMovie.basePayoutRate} iconClass="w-3 h-3 mr-0.5" />/min</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-slate-700 text-xs font-mono text-emerald-400">
              Watched: {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s
            </div>
          </div>
        </div>

        {/* Bottom Playback Control Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayback}
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-red-950 transition hover:scale-105"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isPlaying ? 'Pause Cinema' : '▶ Play & Earn Naira'}</span>
            </button>

            <div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                {selectedMovie.title}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                <span className="text-emerald-400 font-semibold">{selectedMovie.rating}</span>
                <span>·</span>
                <span>{selectedMovie.genre}</span>
                <span>·</span>
                <span>{selectedMovie.duration}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
            <button
              onClick={() => {
                playTapSound();
                setTheaterMode(!theaterMode);
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
              title="Toggle Cinema Lights"
            >
              <Tv className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={() => {
                playTapSound();
                speakText(`Now viewing ${selectedMovie.title}. Synopsis: ${selectedMovie.synopsis}`);
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
              title="Read Movie Info"
            >
              <Film className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Audience Reaction Ticker (Simulated Lagos Guild Chat) */}
      <div className="p-3.5 rounded-2xl bg-[#0c1220] border border-slate-800 flex items-center justify-between gap-4 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0 text-xs font-semibold text-purple-400">
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Lagos Audience:</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto text-xs no-scrollbar">
          {liveReactions.map((rec, i) => (
            <div
              key={i}
              className="shrink-0 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5 text-[11px]"
            >
              <span className="text-yellow-400 font-bold">@{rec.user}:</span>
              <span>{rec.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Tabs (Netflix Style) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playTapSound();
                  setSelectedCategory(cat);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950'
                    : 'bg-[#0f1526] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat === 'All' ? 'All Channels' : cat}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-slate-400">
            {filteredMovies.length} Nollywood Streams Available
          </span>
        </div>

        {/* Movie Cards Carousel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMovies.map((movie) => {
            const isSelected = movie.id === selectedMovie.id;
            return (
              <div
                key={movie.id}
                onClick={() => {
                  playTapSound();
                  setSelectedMovie(movie);
                  setIsPlaying(false);
                  if (videoRef.current) videoRef.current.pause();
                }}
                className={`group relative rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'bg-[#151c30] border-red-500 ring-2 ring-red-500/50 shadow-xl'
                    : 'bg-[#0d1322] border-slate-800 hover:border-slate-700 hover:-translate-y-0.5'
                }`}
              >
                {/* Card Header Gradient */}
                <div className={`p-4 bg-gradient-to-br ${movie.thumbnailGradient} border-b border-slate-800/60`}>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-2">
                    <span className="px-2 py-0.5 rounded bg-black/60 font-semibold">{movie.category}</span>
                    <span className="text-yellow-400 font-bold">{movie.rating}</span>
                  </div>
                  <h4 className="font-display font-extrabold text-base text-white group-hover:text-red-400 transition">
                    {movie.title}
                  </h4>
                  <span className="text-xs text-slate-400">{movie.genre} · {movie.duration}</span>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {movie.synopsis}
                  </p>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <div className="text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+<FormatNaira amount={movie.basePayoutRate} iconClass="w-3 h-3 mr-0.5" />/min</span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                        isSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 text-slate-300 group-hover:bg-red-600 group-hover:text-white transition'
                      }`}
                    >
                      {isSelected ? '▶ Playing' : 'Select Stream'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
