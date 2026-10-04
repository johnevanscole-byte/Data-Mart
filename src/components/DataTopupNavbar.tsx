import React, { useState } from 'react';
import {
  Wifi,
  Smartphone,
  Layers,
  Clock,
  Sun,
  Moon,
  ChevronDown,
  CheckCircle2,
  Zap,
  PlusCircle,
  PhoneCall
} from 'lucide-react';
import { UserAccount } from '../types';
import { formatGHS } from '../services/dataStorageService';

interface DataTopupNavbarProps {
  currentTab: 'buy_data' | 'seller_studio' | 'my_orders';
  setCurrentTab: (tab: 'buy_data' | 'seller_studio' | 'my_orders') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currentUser: UserAccount;
  onOpenQuickTopup: () => void;
}

export const DataTopupNavbar: React.FC<DataTopupNavbarProps> = ({
  currentTab,
  setCurrentTab,
  theme,
  onToggleTheme,
  currentUser,
  onOpenQuickTopup,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-orange-500/20 bg-slate-950/85 dark:bg-[#060b18]/90 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentTab('buy_data')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md shadow-orange-500/25 font-black">
              <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-white">
                  Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Mart</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30">
                  🇬🇭 Ghana 1-120GB
                </span>
              </div>
              <p className="text-[11px] text-blue-200/70 leading-none hidden sm:block">
                Instant MTN MoMo • Telecel • AirtelTigo Data Top-up
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setCurrentTab('buy_data')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'buy_data'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Buy Data (1-120 GB)</span>
            </button>

            <button
              onClick={() => setCurrentTab('seller_studio')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'seller_studio'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Seller Studio (Reseller)</span>
            </button>

            <button
              onClick={() => setCurrentTab('my_orders')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'my_orders'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>My Orders & S.M.S</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Fast Top-up CTA */}
            <button
              onClick={onOpenQuickTopup}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instant Topup</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-amber-500/40"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-zinc-900 dark:text-white leading-none">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    {formatGHS(currentUser.balance)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden lg:block" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-68 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">{currentUser.email}</div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                        🇬🇭 {currentUser.phone}
                      </div>
                    </div>
                  </div>

                  <div className="py-2.5 text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
                    <div className="flex justify-between items-center py-0.5">
                      <span>MoMo Wallet:</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {formatGHS(currentUser.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span>Agent Pool Stock:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {currentUser.agentStockGb.toLocaleString()} GB
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span>Location:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {currentUser.location}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                    <button
                      onClick={() => setCurrentTab('seller_studio')}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between font-medium"
                    >
                      <span>Seller Studio (1-120 GB Packages)</span>
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                    <button
                      onClick={() => setCurrentTab('my_orders')}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between font-medium"
                    >
                      <span>My S.M.S & Topup History</span>
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-zinc-200/80 dark:border-zinc-800/80 text-xs">
          <button
            onClick={() => setCurrentTab('buy_data')}
            className={`px-2 py-1 rounded-md font-medium ${
              currentTab === 'buy_data'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Buy Data (1-120GB)
          </button>
          <button
            onClick={() => setCurrentTab('seller_studio')}
            className={`px-2 py-1 rounded-md font-medium ${
              currentTab === 'seller_studio'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Seller Studio
          </button>
          <button
            onClick={() => setCurrentTab('my_orders')}
            className={`px-2 py-1 rounded-md font-medium ${
              currentTab === 'my_orders'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Orders & S.M.S
          </button>
        </div>
      </div>
    </header>
  );
};
