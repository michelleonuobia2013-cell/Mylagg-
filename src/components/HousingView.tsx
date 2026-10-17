import React, { useState } from 'react';
import { Home, Heart, Coffee, Sparkles, Smile, ShieldCheck, Plus, Check } from 'lucide-react';
import { Pet, FurnitureItem } from '../types/game';
import { playTapSound, playCoinSound } from '../utils/audio';
import { speakText } from '../utils/speech';

interface HousingViewProps {
  balanceNaira: number;
  housingBgUrl: string;
  onUpdateBalances: (deltaNaira: number, deltaCoins: number, deltaEnergy: number) => void;
}

const INITIAL_PETS: Pet[] = [
  {
    id: 'pet_ekuke',
    name: 'Tiger the Ekuke',
    species: 'Ekuke Terrier',
    level: 4,
    hunger: 40,
    happiness: 85,
    favoriteFood: 'Suya Meat Skewer',
    specialSkill: '+15% Danfo Rush Coin Magnet',
    dialoguePidgin: 'Woof! Master, I dey watch gate! No thief fit enter!',
  },
  {
    id: 'pet_parrot',
    name: 'Koko the Grey',
    species: 'African Grey Parrot',
    level: 3,
    hunger: 60,
    happiness: 90,
    favoriteFood: 'Roasted Groundnuts',
    specialSkill: '+10% Balogun Merchant Bargain Discount',
    dialoguePidgin: 'Squawk! Wahala be like bicycle! Up Nepa! Squawk!',
  },
  {
    id: 'pet_galago',
    name: 'Bushbaby Zino',
    species: 'Galago Bushbaby',
    level: 2,
    hunger: 50,
    happiness: 70,
    favoriteFood: 'Sweet Plantain Chips',
    specialSkill: 'Night Vision: Unlocks Secret Midnight Dungeons',
    dialoguePidgin: 'Big eyes see all the crypto secrets in Yaba!',
  },
];

const INITIAL_FURNITURE: FurnitureItem[] = [
  {
    id: 'f1',
    name: 'Handwoven Ankara Velvet Sofa',
    category: 'Living',
    nairaCost: 35000,
    owned: true,
    placed: true,
    iconName: 'Sofa',
    prestigePoints: 45,
  },
  {
    id: 'f2',
    name: 'Fela Afrobeat Vinyl Record Deck',
    category: 'Music',
    nairaCost: 55000,
    owned: true,
    placed: true,
    iconName: 'Disc',
    prestigePoints: 75,
  },
  {
    id: 'f3',
    name: 'Dual-Monitor Yaba Tech Workstation',
    category: 'Tech',
    nairaCost: 95000,
    owned: false,
    placed: false,
    iconName: 'Monitor',
    prestigePoints: 120,
  },
  {
    id: 'f4',
    name: 'Lekki Coastal Palm Planters & Warm Neon Strips',
    category: 'Decor',
    nairaCost: 28000,
    owned: false,
    placed: false,
    iconName: 'Sun',
    prestigePoints: 35,
  },
];

export const HousingView: React.FC<HousingViewProps> = ({
  balanceNaira,
  housingBgUrl,
  onUpdateBalances,
}) => {
  const [pets, setPets] = useState<Pet[]>(INITIAL_PETS);
  const [selectedPetId, setSelectedPetId] = useState<string>('pet_ekuke');
  const [furniture, setFurniture] = useState<FurnitureItem[]>(INITIAL_FURNITURE);
  const [housingName, setHousingName] = useState<string>('Yaba Skyline Loft #402');

  const activePet = pets.find((p) => p.id === selectedPetId) || pets[0];
  const totalPrestige = furniture
    .filter((f) => f.placed)
    .reduce((acc, curr) => acc + curr.prestigePoints, 0);

  const handleFeedPet = () => {
    if (balanceNaira < 1500) {
      speakText('Not enough Naira to buy pet delicacies!');
      return;
    }
    playCoinSound();
    onUpdateBalances(-1500, 10, 5);
    setPets((prev) =>
      prev.map((p) =>
        p.id === activePet.id
          ? {
              ...p,
              hunger: Math.max(0, p.hunger - 35),
              happiness: Math.min(100, p.happiness + 20),
            }
          : p
      )
    );
    speakText(`${activePet.name} loved the treat! "${activePet.dialoguePidgin}"`);
  };

  const handlePetCompanion = () => {
    playTapSound();
    setPets((prev) =>
      prev.map((p) =>
        p.id === activePet.id ? { ...p, happiness: Math.min(100, p.happiness + 15) } : p
      )
    );
    speakText(`You petted ${activePet.name}! ${activePet.dialoguePidgin}`);
  };

  const handleBuyFurniture = (item: FurnitureItem) => {
    if (balanceNaira < item.nairaCost) {
      speakText('Insufficient funds in your account to purchase this interior decor!');
      return;
    }
    playCoinSound();
    onUpdateBalances(-item.nairaCost, 50, 0);
    setFurniture((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, owned: true, placed: true } : f))
    );
    speakText(`Acquired ${item.name}! Apartment prestige increased by ${item.prestigePoints} points.`);
  };

  const handleTogglePlacement = (itemId: string) => {
    playTapSound();
    setFurniture((prev) =>
      prev.map((f) => (f.id === itemId ? { ...f, placed: !f.placed } : f))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Apartment Header and Prestige Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0f1524] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400 mb-1">
            <Home className="w-4 h-4" />
            <span>Life Together Housing & Companions</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">{housingName}</h2>
          <p className="text-xs text-slate-400">
            Customize your home, raise faithful companions, and generate passive prestige income!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-0.5">Housing Prestige</span>
            <span className="font-mono text-base font-bold text-yellow-400">{totalPrestige} pts</span>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onUpdateBalances(0, 0, 40); // Nap restores energy
              speakText('Power nap completed! 40 Energy restored.');
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 flex items-center gap-1.5 transition"
          >
            <Coffee className="w-4 h-4" />
            <span>Power Nap (+40 Energy)</span>
          </button>
        </div>
      </div>

      {/* Main Apartment Showcase Window */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 min-h-[380px] shadow-2xl flex flex-col justify-end p-6">
        <img
          src={housingBgUrl}
          alt="Life Together Apartment Interior"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.75] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Diegetic Room Placed Items */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 mb-4">
          {furniture
            .filter((f) => f.placed)
            .map((item) => (
              <span
                key={item.id}
                className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-slate-200 font-medium backdrop-blur-sm"
              >
                ✓ {item.name}
              </span>
            ))}
        </div>

        {/* Pet Dialogue Speech Bubble */}
        <div className="relative z-10 p-4 rounded-xl bg-purple-950/90 border border-purple-500/60 max-w-xl text-xs backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between font-bold text-yellow-300">
            <span>{activePet.name} ({activePet.species})</span>
            <span className="font-mono text-[11px] text-purple-300">Level {activePet.level}</span>
          </div>
          <p className="text-slate-200 italic">"{activePet.dialoguePidgin}"</p>
          <span className="text-[11px] text-cyan-300 block font-mono">
            Special Perk: {activePet.specialSkill}
          </span>
        </div>
      </div>

      {/* Pet Management Section */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" />
          <span>Your Pet Companions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pets.map((pet) => {
            const isSelected = pet.id === activePet.id;
            return (
              <div
                key={pet.id}
                onClick={() => {
                  playTapSound();
                  setSelectedPetId(pet.id);
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-[#141b2c] border-purple-500 shadow-xl shadow-purple-950/40'
                    : 'bg-[#0d1320] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-base text-white">{pet.name}</span>
                  <span className="text-xs text-purple-400 font-mono font-semibold">
                    Lv.{pet.level}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{pet.species}</p>

                {/* Hunger Meter */}
                <div className="space-y-1 text-xs mb-2">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Hunger</span>
                    <span className="font-mono">{pet.hunger}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${pet.hunger}%` }}
                      className={`h-full ${pet.hunger > 60 ? 'bg-red-500' : 'bg-yellow-400'}`}
                    />
                  </div>
                </div>

                {/* Happiness Meter */}
                <div className="space-y-1 text-xs mb-4">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Happiness</span>
                    <span className="font-mono text-emerald-400">{pet.happiness}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${pet.happiness}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>

                {isSelected && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedPet();
                      }}
                      className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition"
                    >
                      Feed (₦1,500)
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePetCompanion();
                      }}
                      className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition"
                    >
                      Pet / Train
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Furniture Catalog & Interior Decorating */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span>Apartment Furnishing & Upgrades</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {furniture.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#0c121e] border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-purple-400 text-[11px]">{item.category}</span>
                  <span className="text-yellow-400 font-mono text-[11px]">
                    +{item.prestigePoints} Prestige
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white mb-2">{item.name}</h4>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                {item.owned ? (
                  <button
                    onClick={() => handleTogglePlacement(item.id)}
                    className={`w-full py-2 rounded-lg text-xs font-semibold border transition ${
                      item.placed
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {item.placed ? '✓ Placed in Room' : 'Store in Inventory'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuyFurniture(item)}
                    className="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs transition"
                  >
                    Buy (₦{item.nairaCost.toLocaleString()})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
