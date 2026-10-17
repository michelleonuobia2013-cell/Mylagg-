import React, { useState, useEffect } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { CityHubView } from './components/CityHubView';
import { CombatDungeonView } from './components/CombatDungeonView';
import { HousingView } from './components/HousingView';
import { WatchEarnView } from './components/WatchEarnView';
import { MarketplaceView } from './components/MarketplaceView';
import { FintechGatewayView } from './components/FintechGatewayView';
import { SocialHubView } from './components/SocialHubView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { AIChatModal } from './components/AIChatModal';
import { AIStudioModal } from './components/AIStudioModal';
import { BattlePassModal } from './components/BattlePassModal';
import { UserProfile, TransactionRecord } from './game/economy';
import { ActiveTab, MarketplaceItem } from './types/game';
import { usePWAInstall } from './hooks/usePWAInstall';
import { setSoundEnabled, playCoinSound } from './utils/audio';
import { setTtsEnabled, speakText } from './utils/speech';

// Generated Assets
import appIconImg from './assets/images/mylag_app_icon_1792256495199.jpg';
import titleHeroImg from './assets/images/mylag_title_hero_1792256496089.jpg';
import combatDungeonImg from './assets/images/mylag_combat_dungeon_1792256496232.jpg';
import housingApartmentImg from './assets/images/mylag_housing_apartment_1792256496103.jpg';

export default function App() {
  // Game state
  const [gameState, setGameState] = useState<'title' | 'playing'>('title');
  const [activeTab, setActiveTab] = useState<ActiveTab>('city');

  // Balances & Progress
  const [balanceNaira, setBalanceNaira] = useState<number>(50000); // ₦50,000 welcome citizen grant
  const [lagCoins, setLagCoins] = useState<number>(500);
  const [energy, setEnergy] = useState<number>(85);
  const [maxEnergy] = useState<number>(100);
  const [playerLevel, setPlayerLevel] = useState<number>(12);
  const [lastActiveTimestamp] = useState<number>(Date.now() - 3600 * 3000);

  // Profile & Nigerian Bank Account (13 to 100+ years)
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user_default',
    username: 'MylagQueen',
    fullName: 'Michelle Onuobia',
    email: 'michelleonuobia2013@gmail.com',
    birthYear: 2004,
    birthMonth: 8,
    birthDay: 15,
    age: 22,
    bankAccount: {
      bankCode: '058',
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountNumber: '0234567891',
      accountName: 'MICHELLE ONUOBIA',
      verified: true,
    },
    avatarSeed: 'MylagQueen',
    createdAt: new Date().toISOString(),
  });

  // Financial History Ledger
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: 'MYLAG-INIT-001',
      type: 'DEPOSIT',
      amountNaira: 50000,
      feeNaira: 0,
      reference: 'MYLAG-GRANT-20261017-01',
      timestamp: Date.now() - 3600 * 4000,
      status: 'COMPLETED',
      description: 'Verified Lagos Citizen Starter Grant',
      recipientBank: 'GTBank',
    },
  ]);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [aiChatModalOpen, setAIChatModalOpen] = useState<boolean>(false);
  const [aiStudioModalOpen, setAIStudioModalOpen] = useState<boolean>(false);
  const [battlePassModalOpen, setBattlePassModalOpen] = useState<boolean>(false);

  // Accessibility & Audio
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [ttsOn, setTtsOn] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // PWA Hook
  const { isInstallable, install: installPWA } = usePWAInstall();

  // Set document.body.dataset.state for Ultra Mode verification
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Support ?autostart=1 query param (Ultra Mode requirement)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setGameState('playing');
    }
  }, []);

  // Sync high contrast class on root html
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Balance Update helper
  const handleUpdateBalances = (deltaNaira: number, deltaCoins: number, deltaEnergy: number) => {
    setBalanceNaira((prev) => Math.max(0, prev + deltaNaira));
    setLagCoins((prev) => Math.max(0, prev + deltaCoins));
    setEnergy((prev) => Math.min(maxEnergy, Math.max(0, prev + deltaEnergy)));
  };

  // Withdraw Callback
  const handleWithdrawSuccess = (record: TransactionRecord) => {
    setBalanceNaira((prev) => Math.max(0, prev - record.amountNaira));
    setTransactions((prev) => [record, ...prev]);
  };

  // P2P Transfer Callback
  const handleTransferSuccess = (record: TransactionRecord) => {
    setBalanceNaira((prev) => Math.max(0, prev - record.amountNaira));
    setTransactions((prev) => [record, ...prev]);
  };

  // Marketplace Buy Callback
  const handleBuyMarketItem = (item: MarketplaceItem) => {
    setBalanceNaira((prev) => Math.max(0, prev - item.priceNaira));
    const record: TransactionRecord = {
      id: `TX-${Date.now()}`,
      type: 'MARKETPLACE_BUY',
      amountNaira: item.priceNaira,
      feeNaira: 0,
      reference: `ESCROW-${item.id}`,
      timestamp: Date.now(),
      status: 'COMPLETED',
      description: `Marketplace purchase of ${item.title}`,
    };
    setTransactions((prev) => [record, ...prev]);
  };

  // Dungeon Raid Reward Callback
  const handleDungeonReward = (naira: number, coins: number) => {
    handleUpdateBalances(naira, coins, 0);
    const record: TransactionRecord = {
      id: `RAID-${Date.now()}`,
      type: 'DUNGEON_REWARD',
      amountNaira: naira,
      feeNaira: 0,
      reference: `BOUNTY-${Date.now()}`,
      timestamp: Date.now(),
      status: 'COMPLETED',
      description: 'Elemental Dungeon Raid Boss Bounty',
    };
    setTransactions((prev) => [record, ...prev]);
    setPlayerLevel((l) => l + 1);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans">
      {gameState === 'title' ? (
        <TitleScreen
          onStart={() => {
            setGameState('playing');
            speakText('Welcome to Lagos life in mylag! Explore the city or raid dungeons.');
          }}
          onOpenAuth={() => setAuthModalOpen(true)}
          isLoggedIn={true}
          username={profile.username}
          appIconUrl={appIconImg}
          heroBgUrl={titleHeroImg}
        />
      ) : (
        <GameHUD
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
          }}
          balanceNaira={balanceNaira}
          lagCoins={lagCoins}
          energy={energy}
          maxEnergy={maxEnergy}
          playerLevel={playerLevel}
          username={profile.username}
          fullName={profile.fullName}
          bankName={profile.bankAccount.bankName}
          accountNumber={profile.bankAccount.accountNumber}
          soundEnabled={soundOn}
          onToggleSound={() => {
            const next = !soundOn;
            setSoundOn(next);
            setSoundEnabled(next);
          }}
          ttsEnabled={ttsOn}
          onToggleTts={() => {
            const next = !ttsOn;
            setTtsOn(next);
            setTtsEnabled(next);
            if (next) speakText('Text to speech voice narration enabled.');
          }}
          highContrast={highContrast}
          onToggleHighContrast={() => setHighContrast(!highContrast)}
          onOpenAIChat={() => setAIChatModalOpen(true)}
          onOpenAIStudio={() => setAIStudioModalOpen(true)}
          onOpenBattlePass={() => setBattlePassModalOpen(true)}
          appIconUrl={appIconImg}
          isInstallable={isInstallable}
          onInstallPWA={installPWA}
        >
          {/* Active View matching the selected tab */}
          {activeTab === 'city' && (
            <CityHubView
              balanceNaira={balanceNaira}
              lagCoins={lagCoins}
              energy={energy}
              maxEnergy={maxEnergy}
              onUpdateBalances={handleUpdateBalances}
              onOpenDungeons={() => setActiveTab('combat')}
              onOpenHousing={() => setActiveTab('housing')}
            />
          )}

          {activeTab === 'watch_earn' && (
            <WatchEarnView
              onEarnTick={(naira, coins) => handleUpdateBalances(naira, coins, 0)}
              onNavigateFintech={() => setActiveTab('fintech')}
            />
          )}

          {activeTab === 'combat' && (
            <CombatDungeonView
              appIconUrl={appIconImg}
              combatDungeonBgUrl={combatDungeonImg}
              onReward={handleDungeonReward}
            />
          )}

          {activeTab === 'housing' && (
            <HousingView
              balanceNaira={balanceNaira}
              housingBgUrl={housingApartmentImg}
              onUpdateBalances={handleUpdateBalances}
            />
          )}

          {activeTab === 'marketplace' && (
            <MarketplaceView
              balanceNaira={balanceNaira}
              lagCoins={lagCoins}
              onBuyItem={handleBuyMarketItem}
            />
          )}

          {activeTab === 'fintech' && (
            <FintechGatewayView
              userProfile={profile}
              balanceNaira={balanceNaira}
              lagCoins={lagCoins}
              transactions={transactions}
              onWithdrawSuccess={handleWithdrawSuccess}
              onTransferSuccess={handleTransferSuccess}
              onOpenProfile={() => setActiveTab('profile')}
            />
          )}

          {activeTab === 'social' && (
            <SocialHubView
              username={profile.username}
              playerLevel={playerLevel}
              balanceNaira={balanceNaira}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              userProfile={profile}
              balanceNaira={balanceNaira}
              lagCoins={lagCoins}
              playerLevel={playerLevel}
              soundEnabled={soundOn}
              onToggleSound={() => {
                const next = !soundOn;
                setSoundOn(next);
                setSoundEnabled(next);
              }}
              ttsEnabled={ttsOn}
              onToggleTts={() => {
                const next = !ttsOn;
                setTtsOn(next);
                setTtsEnabled(next);
                if (next) speakText('Screen reader voice narration toggled.');
              }}
              highContrast={highContrast}
              onToggleHighContrast={() => setHighContrast(!highContrast)}
              onUpdateProfile={(updated) => setProfile(updated)}
              onNavigateFintech={() => setActiveTab('fintech')}
              onOpenBattlePass={() => setBattlePassModalOpen(true)}
              appIconUrl={appIconImg}
              isInstallable={isInstallable}
              onInstallPWA={installPWA}
            />
          )}
        </GameHUD>
      )}

      {/* Interactive Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentProfile={profile}
        onCompleteProfile={(newProf) => {
          setProfile(newProf);
          speakText(`Profile updated for ${newProf.fullName}! Bank verified with ${newProf.bankAccount.bankName}.`);
        }}
      />

      <AIChatModal
        isOpen={aiChatModalOpen}
        onClose={() => setAIChatModalOpen(false)}
      />

      <AIStudioModal
        isOpen={aiStudioModalOpen}
        onClose={() => setAIStudioModalOpen(false)}
      />

      <BattlePassModal
        isOpen={battlePassModalOpen}
        onClose={() => setBattlePassModalOpen(false)}
        lastActiveTimestamp={lastActiveTimestamp}
        onClaimRewards={(naira, coins, nrg) => {
          handleUpdateBalances(naira, coins, nrg);
        }}
      />
    </div>
  );
}
