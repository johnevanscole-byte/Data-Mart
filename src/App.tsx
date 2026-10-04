import React, { useState, useEffect } from 'react';
import { DataTopupNavbar } from './components/DataTopupNavbar';
import { BuyDataView } from './components/BuyDataView';
import { SellerStudioView } from './components/SellerStudioView';
import { MyOrdersView } from './components/MyOrdersView';
import { MoMoPaymentModal } from './components/MoMoPaymentModal';
import { TopupWalletModal } from './components/TopupWalletModal';
import { USSDCheckModal } from './components/USSDCheckModal';
import { DataStorageService, formatGHS } from './services/dataStorageService';
import { DataPackage, UserAccount, DataOrder, MobileNetwork } from './types';
import { Zap, Sparkles, CheckCircle2, MessageSquare, Phone } from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Current navigation tab
  const [currentTab, setCurrentTab] = useState<'buy_data' | 'seller_studio' | 'my_orders'>('buy_data');

  // Core Data State
  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount>(DataStorageService.getCurrentUser());
  const [orders, setOrders] = useState<DataOrder[]>([]);

  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isTopupWalletOpen, setIsTopupWalletOpen] = useState(false);
  const [isUssdOpen, setIsUssdOpen] = useState(false);
  const [ussdNetwork, setUssdNetwork] = useState<MobileNetwork>('mtn');

  // Payment configuration state
  const [pendingPackage, setPendingPackage] = useState<{
    capacityGb: number;
    network: MobileNetwork;
    price: number;
    name: string;
    validity?: string;
  }>({
    capacityGb: 10,
    network: 'mtn',
    price: 43.0,
    name: '10 GB Data Mart Power Bundle',
    validity: 'Non-Expiry',
  });
  const [pendingRecipientPhone, setPendingRecipientPhone] = useState(currentUser.phone || '0244128990');
  const [pendingRecipientName, setPendingRecipientName] = useState<string | undefined>(undefined);
  const [pendingPaymentCode, setPendingPaymentCode] = useState<string>('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initialize on mount
  useEffect(() => {
    const loadedPackages = DataStorageService.getPackages();
    setPackages(loadedPackages);

    const loadedOrders = DataStorageService.getOrders();
    setOrders(loadedOrders);

    const loadedUser = DataStorageService.getCurrentUser();
    setCurrentUser(loadedUser);

    const savedTheme = DataStorageService.getTheme();
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Theme toggle
  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    DataStorageService.setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Trigger Payment Modal
  const handleInitiatePayment = (
    pkg: {
      capacityGb: number;
      network: MobileNetwork;
      price: number;
      name: string;
      validity?: string;
    },
    phone: string,
    recipientName?: string,
    paymentCode?: string
  ) => {
    setPendingPackage(pkg);
    setPendingRecipientPhone(phone);
    setPendingRecipientName(recipientName);
    setPendingPaymentCode(paymentCode || '');
    setIsPaymentOpen(true);
  };

  // When payment finishes successfully
  const handlePaymentSuccess = (newOrder: DataOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Refresh user balance in case paid with wallet
    setCurrentUser(DataStorageService.getCurrentUser());
    showToast(`⚡ S.M.S: ${newOrder.capacityGb}GB credited to ${newOrder.recipientPhone}! Ref: ${newOrder.transactionRef}`);
  };

  // When agent edits package retail price in Seller Studio
  const handleUpdatePackage = (id: string, updates: Partial<DataPackage>) => {
    const updated = DataStorageService.updatePackage(id, updates);
    if (updated) {
      setPackages([...DataStorageService.getPackages()]);
      showToast(`Updated rate for ${updated.name}`);
    }
  };

  // When wallet gets topped up
  const handleWalletUpdated = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    showToast(`Wallet credited! New balance: ${formatGHS(updatedUser.balance)}`);
  };

  // Quick Open USSD modal
  const handleOpenUssd = (net: MobileNetwork) => {
    setUssdNetwork(net);
    setIsUssdOpen(true);
  };

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-200 ${
      theme === 'dark'
        ? 'bg-[#050b17] text-slate-100 selection:bg-orange-500 selection:text-slate-950'
        : 'bg-gradient-to-b from-sky-50 via-blue-50 to-orange-50/60 text-slate-900 selection:bg-orange-400 selection:text-white'
    }`}>
      {/* 🔵 BLUE and 🧡 ORANGE Atmospheric Radiant Background Layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Glow Orb 1: Electric Cobalt Blue (Top Left) */}
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-blue-600/25 dark:bg-blue-600/30 blur-[130px]" />

        {/* Glow Orb 2: Radiant Warm Amber / Orange (Top Right) */}
        <div className="absolute -top-24 -right-24 w-[700px] h-[700px] rounded-full bg-orange-500/20 dark:bg-orange-500/25 blur-[140px]" />

        {/* Glow Orb 3: Deep Sapphire Blue (Mid Center) */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] rounded-full bg-blue-800/15 dark:bg-blue-700/20 blur-[160px]" />

        {/* Glow Orb 4: Rich Golden Sunset Orange (Bottom Right) */}
        <div className="absolute -bottom-32 right-10 w-[600px] h-[600px] rounded-full bg-orange-600/20 dark:bg-orange-600/25 blur-[150px]" />

        {/* Subtle mesh background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main App Content on top of background */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <DataTopupNavbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onOpenQuickTopup={() => {
            setCurrentTab('buy_data');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Notification Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
            <div className="p-4 rounded-2xl bg-slate-900 border border-orange-500/50 text-white shadow-2xl flex items-center gap-3 max-w-md">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                <MessageSquare className="w-4 h-4 text-slate-950" />
              </div>
              <p className="text-xs font-semibold leading-snug">{toastMessage}</p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {currentTab === 'buy_data' && (
            <BuyDataView
              packages={packages}
              currentUser={currentUser}
              onInitiatePayment={handleInitiatePayment}
              onSwitchToStudio={() => setCurrentTab('seller_studio')}
            />
          )}

          {currentTab === 'seller_studio' && (
            <SellerStudioView
              packages={packages}
              currentUser={currentUser}
              orders={orders}
              onUpdatePackage={handleUpdatePackage}
              onOpenTopupWallet={() => setIsTopupWalletOpen(true)}
              onOrderCreated={(ord) => {
                setOrders((prev) => [ord, ...prev]);
                setCurrentUser(DataStorageService.getCurrentUser());
              }}
            />
          )}

          {currentTab === 'my_orders' && (
            <MyOrdersView
              orders={orders}
              currentUser={currentUser}
              onOpenUssdModal={handleOpenUssd}
              onBuyMore={() => setCurrentTab('buy_data')}
            />
          )}
        </main>

        {/* Footer with Ghana MoMo and Telco Branding */}
        <footer className="border-t border-orange-500/20 bg-slate-950/80 dark:bg-[#040814]/90 backdrop-blur-md py-8 mt-12 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-orange-500 text-slate-950 flex items-center justify-center font-black">
                <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">
                  Data Mart 🇬🇭
                </span>
                <p className="text-[11px] text-blue-200/60">
                  Ghana's low-cost 1GB - 120GB non-expiry mobile data bundle topup & reseller studio.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                MTN MoMo (*170#)
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Telecel Cash (*110#)
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                AirtelTigo Money (*110#)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                No Credit Card Required
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">
                Logged in: <strong className="text-white">{currentUser.name}</strong>
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                Wallet: {formatGHS(currentUser.balance)}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* MoMo Payment & S.M.S Simulation Modal */}
      <MoMoPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        selectedPackage={pendingPackage}
        recipientPhone={pendingRecipientPhone}
        recipientName={pendingRecipientName}
        currentUser={currentUser}
        initialCode={pendingPaymentCode}
        onPaymentSuccess={handlePaymentSuccess}
        defaultPaymentMethod="mtn_momo"
      />

      {/* Topup Agent Wallet Modal */}
      <TopupWalletModal
        isOpen={isTopupWalletOpen}
        onClose={() => setIsTopupWalletOpen(false)}
        currentUser={currentUser}
        onWalletUpdated={handleWalletUpdated}
      />

      {/* Telco USSD Dial & Balance Checker Modal */}
      <USSDCheckModal
        isOpen={isUssdOpen}
        onClose={() => setIsUssdOpen(false)}
        network={ussdNetwork}
        currentUser={currentUser}
      />
    </div>
  );
}
