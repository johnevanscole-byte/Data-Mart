import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  Zap,
  ShieldCheck,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Info,
  Radio,
  User,
  Plus,
  Minus,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { DataPackage, MobileNetwork, UserAccount } from '../types';
import {
  formatGHS,
  detectGhanaNetwork,
  calculateCustomGbPrice,
} from '../services/dataStorageService';

interface BuyDataViewProps {
  packages: DataPackage[];
  currentUser: UserAccount;
  onInitiatePayment: (pkg: {
    capacityGb: number;
    network: MobileNetwork;
    price: number;
    name: string;
    validity?: string;
  }, phone: string, recipientName?: string, paymentCode?: string) => void;
  onSwitchToStudio: () => void;
}

export const BuyDataView: React.FC<BuyDataViewProps> = ({
  packages,
  currentUser,
  onInitiatePayment,
  onSwitchToStudio,
}) => {
  // Active selected network
  const [network, setNetwork] = useState<MobileNetwork>('mtn');

  // Recipient phone number (Ghana 10 digits e.g. 0244128990)
  const [recipientPhone, setRecipientPhone] = useState(currentUser.phone || '0244128990');
  const [recipientName, setRecipientName] = useState('');

  // Payment authorization code state (required to buy data)
  const [paymentCode, setPaymentCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  // Mode: 'quick_presets' or 'custom_slider'
  const [selectionMode, setSelectionMode] = useState<'quick_presets' | 'custom_slider'>('quick_presets');

  // Selected preset package ID
  const [selectedPresetId, setSelectedPresetId] = useState<string>('pkg-mtn-10gb');

  // Custom GB slider value (1 - 120 GB)
  const [customGb, setCustomGb] = useState<number>(10);

  // Auto-detect network when phone number changes
  const handlePhoneChange = (val: string) => {
    setRecipientPhone(val);
    const clean = val.replace(/[^0-9]/g, '');
    if (clean.length >= 3) {
      const detected = detectGhanaNetwork(clean);
      if (detected !== network) {
        setNetwork(detected);
      }
    }
  };

  // Filter preset packages for selected network
  const networkPackages = useMemo(() => {
    return packages
      .filter((p) => p.network === network && p.status === 'active')
      .sort((a, b) => a.capacityGb - b.capacityGb);
  }, [packages, network]);

  // Active selected package configuration
  const activePackageData = useMemo(() => {
    if (selectionMode === 'quick_presets') {
      const found = networkPackages.find((p) => p.id === selectedPresetId);
      if (found) {
        return {
          capacityGb: found.capacityGb,
          network: found.network,
          price: found.retailPrice,
          name: found.name,
          validity: found.validity,
        };
      }
      // fallback to first
      const first = networkPackages[0] || {
        capacityGb: 10,
        network,
        retailPrice: 43.0,
        name: `${10} GB Data Mart Bundle`,
        validity: 'Non-Expiry',
      };
      return {
        capacityGb: first.capacityGb,
        network: first.network,
        price: first.retailPrice,
        name: first.name,
        validity: first.validity,
      };
    } else {
      // Custom 1 - 120 GB calculation
      const { price } = calculateCustomGbPrice(customGb, network);
      return {
        capacityGb: customGb,
        network,
        price,
        name: `${customGb} GB Custom Data Mart Non-Expiry Bundle`,
        validity: 'Non-Expiry',
      };
    }
  }, [selectionMode, selectedPresetId, networkPackages, customGb, network]);

  // Standard direct telco comparison price
  const telcoDirectPrice = useMemo(() => {
    return Math.round(activePackageData.capacityGb * 6.2 * 10) / 10;
  }, [activePackageData.capacityGb]);

  const customerSavings = Math.max(0, Math.round((telcoDirectPrice - activePackageData.price) * 10) / 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone || recipientPhone.length < 9) {
      alert('Please enter a valid Ghana phone number (e.g. 0244128990)');
      return;
    }
    if (!paymentCode || paymentCode.trim().length < 4) {
      setCodeError('Payment authorization code is required. Please type your 4-digit code (e.g. 1234 or your PIN) to buy data.');
      return;
    }
    setCodeError(null);
    onInitiatePayment(activePackageData, recipientPhone, recipientName, paymentCode.trim());
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Data Mart Ghana High Value Teaser */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-blue-900/90 via-blue-950 to-orange-950/90 border border-orange-500/40 shadow-2xl shadow-blue-950/60 text-white">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Data Mart 🇬🇭 • 1GB - 120GB Options</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Buy Cheap <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Non-Expiry</span> Mobile Data in Cedis
          </h1>
          <p className="text-sm sm:text-base text-blue-200/90 leading-relaxed max-w-2xl">
            Instant top-up for <strong>MTN MoMo, Telecel Cash, and AirtelTigo Money</strong>. No credit cards needed! Choose any bundle from <strong>1 GB to 120 GB</strong> with automated S.M.S delivery.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-blue-500/30">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Instant 30s Delivery
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-orange-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              100% Non-Expiry Data
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-500/30">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Direct MoMo Push
            </span>
          </div>
        </div>

        {/* Ambient background glow orbs */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-16 w-80 h-80 rounded-full bg-blue-600/30 blur-3xl pointer-events-none" />
      </div>

      {/* Main Buying Card Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column (Steps 1, 2, 3) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-blue-500/30 text-white shadow-xl space-y-6">
            
            {/* Step 1: Network Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">1</span>
                  Select Network (Ghana)
                </label>
                <span className="text-[11px] text-slate-400">
                  Auto-detects from prefix
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* MTN Button */}
                <button
                  type="button"
                  onClick={() => setNetwork('mtn')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    network === 'mtn'
                      ? 'border-amber-400 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                      MTN
                    </span>
                    {network === 'mtn' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="font-black text-sm text-white">MTN Ghana</div>
                  <div className="text-[10px] text-amber-300/80">024 • 054 • 055 • 059</div>
                </button>

                {/* Telecel Button */}
                <button
                  type="button"
                  onClick={() => setNetwork('telecel')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    network === 'telecel'
                      ? 'border-red-500 bg-gradient-to-br from-red-600/20 to-rose-500/10 shadow-lg shadow-red-500/20 ring-2 ring-red-400'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-8 h-8 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                      TEL
                    </span>
                    {network === 'telecel' && (
                      <CheckCircle2 className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="font-black text-sm text-white">Telecel Ghana</div>
                  <div className="text-[10px] text-red-300/80">020 • 050</div>
                </button>

                {/* AirtelTigo (AT) Button */}
                <button
                  type="button"
                  onClick={() => setNetwork('airteltigo')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    network === 'airteltigo'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-600/20 to-cyan-500/10 shadow-lg shadow-blue-500/20 ring-2 ring-blue-400'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                      AT
                    </span>
                    {network === 'airteltigo' && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className="font-black text-sm text-white">AirtelTigo (AT)</div>
                  <div className="text-[10px] text-blue-300/80">027 • 057 • 026</div>
                </button>
              </div>
            </div>

            {/* Step 2: Recipient Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">2</span>
                  Recipient Phone Number (Ghana)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRecipientPhone(currentUser.phone);
                    setRecipientName(currentUser.name);
                    setNetwork(detectGhanaNetwork(currentUser.phone));
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <User className="w-3 h-3" />
                  <span>Send to Myself ({currentUser.phone})</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="e.g. 0244128990"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white font-mono text-base focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                  <span className="absolute right-3 top-3 text-[11px] font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-700">
                    🇬🇭 GH
                  </span>
                </div>
                <div>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient Nickname (Optional)"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Data Bundle Selection (Options from 1 to 120 GB!) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">3</span>
                  Select Data Amount (1 GB - 120 GB)
                </label>

                {/* Mode Switcher */}
                <div className="inline-flex p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSelectionMode('quick_presets')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      selectionMode === 'quick_presets'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Quick Packages
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionMode('custom_slider')}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      selectionMode === 'custom_slider'
                        ? 'bg-orange-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Custom 1-120 GB Slider</span>
                  </button>
                </div>
              </div>

              {/* Mode A: Preset Package Grid */}
              {selectionMode === 'quick_presets' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {networkPackages.map((pkg) => {
                    const isSelected = selectedPresetId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPresetId(pkg.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                            : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-black text-white">
                              {pkg.capacityGb} <span className="text-xs text-amber-400">GB</span>
                            </span>
                            {pkg.isPopular && (
                              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase bg-orange-500 text-slate-950 rounded">
                                HOT
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold block">
                            Non-Expiry
                          </span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-slate-700/50 flex items-baseline justify-between">
                          <span className="text-sm font-black text-amber-400 font-mono">
                            {formatGHS(pkg.retailPrice)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Mode B: Custom 1 to 120 GB Interactive Slider */
                <div className="p-6 rounded-2xl bg-slate-800/70 border border-orange-500/30 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">
                        Choose Any Capacity from 1 to 120 GB
                      </span>
                      <div className="text-3xl font-black text-white flex items-baseline gap-1 mt-0.5">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                          {customGb}
                        </span>
                        <span className="text-lg text-slate-400">GB Data</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold">
                        Instant Price (Cedis)
                      </span>
                      <div className="text-2xl font-black text-amber-400 font-mono">
                        {formatGHS(calculateCustomGbPrice(customGb, network).price)}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={1}
                      max={120}
                      step={1}
                      value={customGb}
                      onChange={(e) => setCustomGb(Number(e.target.value))}
                      className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>1 GB (Min)</span>
                      <span>20 GB</span>
                      <span>50 GB</span>
                      <span>80 GB</span>
                      <span>120 GB (Max)</span>
                    </div>
                  </div>

                  {/* Stepper Buttons for precise integer GB adjustments */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCustomGb(Math.max(1, customGb - 1))}
                      className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-700 font-mono font-bold text-amber-400 text-sm">
                      {customGb} GB
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomGb(Math.min(120, customGb + 1))}
                      className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Type Payment Authorization Code */}
            <div className={`p-5 rounded-3xl border transition-all ${
              codeError
                ? 'bg-red-950/40 border-red-500/80 shadow-lg shadow-red-500/10'
                : paymentCode.length >= 4
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : 'bg-slate-800/90 border-orange-500/40 shadow-lg shadow-orange-500/5'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">4</span>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Type Payment Authorization Code (Required)</span>
                  <span className="text-orange-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentCode('1234');
                    setCodeError(null);
                  }}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Demo Code: 1234</span>
                </button>
              </div>

              <p className="text-xs text-blue-200/80 mb-3">
                Security check: You must type your 4-digit payment authorization code or MoMo PIN to buy data on Data Mart.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-8 relative">
                  <input
                    type={showCode ? 'text' : 'password'}
                    maxLength={6}
                    required
                    value={paymentCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setPaymentCode(val);
                      if (val.length >= 4) {
                        setCodeError(null);
                      }
                    }}
                    placeholder="Type 4-digit code (e.g. 1234)"
                    className={`w-full px-4 py-3 pr-12 rounded-2xl bg-slate-900 border text-white font-mono text-lg tracking-widest focus:outline-none transition-all ${
                      codeError
                        ? 'border-red-500 ring-2 ring-red-500/30 text-red-300'
                        : paymentCode.length >= 4
                        ? 'border-emerald-500 ring-1 ring-emerald-500/40 text-emerald-300'
                        : 'border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-white p-1"
                    title={showCode ? 'Hide Code' : 'Show Code'}
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* 4-digit visual indicator boxes */}
                <div className="sm:col-span-4 flex items-center justify-center gap-2">
                  {[0, 1, 2, 3].map((i) => {
                    const isFilled = paymentCode.length > i;
                    return (
                      <div
                        key={i}
                        className={`w-9 h-11 rounded-xl border flex items-center justify-center text-sm font-bold font-mono transition-all ${
                          isFilled
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                            : 'bg-slate-900/80 border-slate-700 text-slate-500'
                        }`}
                      >
                        {isFilled ? (showCode ? paymentCode[i] : '•') : ''}
                      </div>
                    );
                  })}
                </div>
              </div>

              {codeError && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{codeError}</span>
                </div>
              )}

              {paymentCode.length >= 4 && !codeError && (
                <div className="mt-2.5 text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Payment code verified & ready for authorization!</span>
                </div>
              )}
            </div>

            {/* Mobile Money Notice (No Cards) */}
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold block mb-0.5">
                  100% Mobile Money & S.M.S Verified
                </strong>
                Card checkout is removed. Payments are processed via direct <strong>MTN MoMo, Telecel Cash, and AT Money</strong> prompts or your Agent Wallet.
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className={`w-full py-4 px-6 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                paymentCode.length < 4
                  ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-slate-950 hover:brightness-110 shadow-orange-500/20'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-orange-500/30'
              }`}
            >
              <Lock className="w-5 h-5 text-slate-950" />
              <span>
                {paymentCode.length < 4
                  ? `Type Code & Buy ${activePackageData.capacityGb}GB Data (${formatGHS(activePackageData.price)})`
                  : `Authorize with Code & Buy ${activePackageData.capacityGb}GB Data (${formatGHS(activePackageData.price)})`}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Right Summary & Reseller Studio Promo Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Live Breakdown Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-orange-500/30 text-white shadow-xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Checkout Breakdown</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Selected Bundle:</span>
                <strong className="text-white font-bold">{activePackageData.capacityGb} GB ({network.toUpperCase()})</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Direct Telco Standard:</span>
                <span className="line-through text-slate-400">{formatGHS(telcoDirectPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Data Mart Discount Price:</span>
                <strong className="text-amber-400 font-bold">{formatGHS(activePackageData.price)}</strong>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>You Save Today:</span>
                <span>{formatGHS(customerSavings)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>MoMo Network Fee:</span>
                <span className="text-emerald-400 font-bold">GH₵ 0.00 (FREE)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-300">Total Due (Cedis):</span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {formatGHS(activePackageData.price)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Non-Expiry Guarantee</span>
              </div>
              <p className="text-slate-400">
                Data rolls over and never expires until fully consumed.
              </p>
            </div>
          </div>

          {/* Reseller Studio Quick Promo CTA */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-orange-950 border border-blue-500/40 text-white shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Seller Studio Active</span>
            </div>
            <h4 className="text-lg font-black text-white">
              Want to Resell 1GB - 120GB Data & Make Profit?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use your Seller Studio to set custom selling prices, manage wholesale discounts, send bulk data to customers, and track net profit in Cedis.
            </p>
            <button
              type="button"
              onClick={onSwitchToStudio}
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Open Seller Studio (Reseller)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
