import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, Tag, Sparkles, Filter, Check, Plus } from 'lucide-react';
import { MarketplaceItem } from '../types/game';
import { playCoinSound, playTapSound } from '../utils/audio';
import { speakText } from '../utils/speech';

interface MarketplaceViewProps {
  balanceNaira: number;
  lagCoins: number;
  onBuyItem: (item: MarketplaceItem) => void;
}

const INITIAL_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'm_1',
    title: 'Overclocked Yaba Silicon Core (Artifact)',
    sellerName: 'Chidi_YabaDev',
    sellerId: 'user_992',
    priceNaira: 45000,
    priceLagCoins: 200,
    category: 'Artifact',
    rarity: 'Legendary',
    inEscrow: true,
    statsDescription: '+45 Electro Atk · Reduces Skill Cooldowns by 15%',
  },
  {
    id: 'm_2',
    title: 'Custom Neon Yellow Danfo Express (Vehicle)',
    sellerName: 'Babatunde_Driver',
    sellerId: 'user_401',
    priceNaira: 120000,
    priceLagCoins: 600,
    category: 'Vehicle',
    rarity: 'Epic',
    inEscrow: true,
    statsDescription: 'Top speed 180 km/h · Immune to Lagos pothole penalties in Danfo Rush',
  },
  {
    id: 'm_3',
    title: '24K Solid Gold Lagos Island Chain (Cosmetic)',
    sellerName: 'Lekki_Baller',
    sellerId: 'user_119',
    priceNaira: 85000,
    priceLagCoins: 350,
    category: 'Cosmetic',
    rarity: 'Epic',
    inEscrow: true,
    statsDescription: '+25% Prestige Points in Life Together Apartment',
  },
  {
    id: 'm_4',
    title: 'VIP Lekki Tollgate Sovereign RFID Tag',
    sellerName: 'Senator_Lag',
    sellerId: 'user_007',
    priceNaira: 65000,
    priceLagCoins: 300,
    category: 'Property',
    rarity: 'Rare',
    inEscrow: true,
    statsDescription: 'Zero toll fees · +10% Watch-to-Earn passive streaming bonus',
  },
];

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  balanceNaira,
  lagCoins,
  onBuyItem,
}) => {
  const [items, setItems] = useState<MarketplaceItem[]>(INITIAL_MARKETPLACE_ITEMS);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [purchasedId, setPurchasedId] = useState<string | null>(null);

  // Listing Form State
  const [showListModal, setShowListModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPrice, setNewPrice] = useState<number>(25000);
  const [newCategory, setNewCategory] = useState<'Artifact' | 'Vehicle' | 'Cosmetic' | 'Property'>('Artifact');

  const filteredItems = filterCategory === 'All'
    ? items
    : items.filter((i) => i.category === filterCategory);

  const handlePurchase = (item: MarketplaceItem) => {
    if (balanceNaira < item.priceNaira) {
      speakText('Insufficient funds in your account to purchase this item from the market.');
      return;
    }
    playCoinSound();
    onBuyItem(item);
    setPurchasedId(item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    speakText(`Escrow cleared! ${item.title} delivered to your inventory.`);
    setTimeout(() => setPurchasedId(null), 3000);
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    playCoinSound();

    const newItem: MarketplaceItem = {
      id: `item_${Date.now()}`,
      title: newTitle.trim(),
      sellerName: 'You (Verified Citizen)',
      sellerId: 'self',
      priceNaira: newPrice,
      priceLagCoins: Math.floor(newPrice / 150),
      category: newCategory,
      rarity: 'Rare',
      inEscrow: true,
      statsDescription: 'Verified player artifact deposited into sovereign escrow vault.',
    };

    setItems((prev) => [newItem, ...prev]);
    setShowListModal(false);
    setNewTitle('');
    speakText(`Item listed on the Lagos Trading Market with automated escrow protection!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Escrow Protection Banner */}
      <div className="p-6 rounded-2xl bg-[#0e1627] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sovereign Automated Escrow Protection · Low 1% Commission</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            Peer-to-Peer Trading Marketplace
          </h2>
          <p className="text-xs text-slate-300">
            Exchange rare dungeon weapons, customized Danfo minibuses, real estate deeds, and cosmetic skins with peer players safely.
          </p>
        </div>

        <button
          onClick={() => {
            playTapSound();
            setShowListModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>List Item for Sale</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['All', 'Artifact', 'Vehicle', 'Cosmetic', 'Property'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playTapSound();
              setFilterCategory(cat);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition border ${
              filterCategory === cat
                ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Market Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isLegendary = item.rarity === 'Legendary';
          const isEpic = item.rarity === 'Epic';
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#0b101c] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      isLegendary
                        ? 'bg-yellow-950 text-yellow-400 border border-yellow-700'
                        : isEpic
                        ? 'bg-purple-950 text-purple-300 border border-purple-700'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.rarity}
                  </span>
                  <span className="text-[11px] text-slate-400">@{item.sellerName}</span>
                </div>

                <h4 className="font-display font-bold text-sm text-white mb-1.5">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 mb-4">{item.statsDescription}</p>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 mb-4 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Price:</span>
                    <span className="text-emerald-400 font-bold">₦{item.priceNaira.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Or LagCoins:</span>
                    <span className="text-yellow-400">{item.priceLagCoins} Coins</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePurchase(item)}
                className="w-full py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs shadow-md shadow-yellow-950/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy with Escrow</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* List Item Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1627] border border-slate-700 p-6 shadow-2xl text-slate-100 space-y-4 text-xs">
            <h3 className="font-display text-base font-bold text-white">Create Escrow Listing</h3>
            <form onSubmit={handleCreateListing} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Rare Eyo Masquerade Mask"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Price in Naira (₦)</label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  aria-label="Item Category"
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="Artifact">Artifact</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Cosmetic">Cosmetic</option>
                  <option value="Property">Property</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowListModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Confirm & List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
