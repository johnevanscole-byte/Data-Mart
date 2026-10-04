import React, { useState, useMemo } from 'react';
import {
  Layers,
  Wallet,
  TrendingUp,
  DollarSign,
  Smartphone,
  PlusCircle,
  Sparkles,
  Sliders,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Search,
  MessageSquare,
  Zap,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Lock,
  KeyRound
} from 'lucide-react';
import { DataPackage, MobileNetwork, UserAccount, DataOrder } from '../types';
import {
  formatGHS,
  DataStorageService,
  detectGhanaNetwork,
  calculateCustomGbPrice,
} from '../services/dataStorageService';
import { GeminiService } from '../services/geminiService';

interface SellerStudioViewProps {
  packages: DataPackage[];
  currentUser: UserAccount;
  orders: DataOrder[];
  onUpdatePackage: (id: string, updates: Partial<DataPackage>) => void;
  onOpenTopupWallet: () => void;
  onOrderCreated: (order: DataOrder) => void;
}

export const SellerStudioView: React.FC<SellerStudioViewProps> = ({
  packages,
  currentUser,
  orders,
  onUpdatePackage,
  onOpenTopupWallet,
  onOrderCreated,
}) => {
  // Active Studio Subtab
  const [activeSubtab, setActiveSubtab] = useState<'pricing' | 'dispenser' | 'bulk' | 'logs' | 'ai_advisor'>('pricing');

  // Filter Network for Pricing Manager
  const [selectedNetwork, setSelectedNetwork] = useState<MobileNetwork>('mtn');

  // Search filter for packages
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Dispenser States
  const [dispensePhone, setDispensePhone] = useState('');
  const [dispenseName, setDispenseName] = useState('');
  const [dispenseNetwork, setDispenseNetwork] = useState<MobileNetwork>('mtn');
  const [dispenseGb, setDispenseGb] = useState<number>(10);
  const [dispenseClientCharge, setDispenseClientCharge] = useState<number>(45.0);
  const [dispenseCode, setDispenseCode] = useState('1234');
  const [isDispensing, setIsDispensing] = useState(false);
  const [dispenseSuccessMsg, setDispenseSuccessMsg] = useState<string | null>(null);

  // Bulk Sender States
  const [bulkNumbersText, setBulkNumbersText] = useState('0244128990\n0205819204\n0277819201');
  const [bulkGb, setBulkGb] = useState<number>(5);
  const [bulkNetwork, setBulkNetwork] = useState<MobileNetwork>('mtn');
  const [bulkCode, setBulkCode] = useState('1234');
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkReport, setBulkReport] = useState<{ totalSent: number; totalGb: number; totalCost: number } | null>(null);

  // AI Advisor States
  const [aiTargetGb, setAiTargetGb] = useState<number>(10);
  const [aiTargetNetwork, setAiTargetNetwork] = useState<MobileNetwork>('mtn');
  const [isLoadingAiPricing, setIsLoadingAiPricing] = useState(false);
  const [aiPricingResult, setAiPricingResult] = useState<any>(null);

  const [aiPromoStyle, setAiPromoStyle] = useState('Exciting with Ghana Pidgin & English mix');
  const [isLoadingAiPromo, setIsLoadingAiPromo] = useState(false);
  const [aiPromoResult, setAiPromoResult] = useState<any>(null);
  const [copiedPromoField, setCopiedPromoField] = useState<string | null>(null);

  // Studio Analytics Calculation
  const studioMetrics = useMemo(() => {
    const totalGbSold = orders.reduce((acc, curr) => acc + curr.capacityGb, 0);
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.amountPaid, 0);
    // Estimated net margin ~15-20%
    const totalProfit = Math.round(totalRevenue * 0.17 * 10) / 10;
    const uniqueClients = new Set(orders.map((o) => o.recipientPhone)).size;

    return {
      totalGbSold,
      totalRevenue,
      totalProfit,
      uniqueClients,
    };
  }, [orders]);

  // Packages list for pricing manager
  const filteredPackages = useMemo(() => {
    return packages
      .filter((p) => p.network === selectedNetwork)
      .filter((p) => {
        if (!searchQuery) return true;
        return (
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${p.capacityGb}gb`.includes(searchQuery.toLowerCase())
        );
      })
      .sort((a, b) => a.capacityGb - b.capacityGb);
  }, [packages, selectedNetwork, searchQuery]);

  // Quick Dispenser phone change
  const handleDispensePhoneChange = (val: string) => {
    setDispensePhone(val);
    const clean = val.replace(/[^0-9]/g, '');
    if (clean.length >= 3) {
      setDispenseNetwork(detectGhanaNetwork(clean));
    }
  };

  // Sync dispense retail price when GB or network changes
  const handleDispenseGbChange = (gb: number) => {
    setDispenseGb(gb);
    const { price } = calculateCustomGbPrice(gb, dispenseNetwork);
    setDispenseClientCharge(price);
  };

  // Execute Quick Data Dispense from Agent Wallet
  const handleExecuteDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispensePhone || dispensePhone.length < 9) {
      alert('Please enter a valid Ghana phone number');
      return;
    }
    if (!dispenseCode || dispenseCode.trim().length < 4) {
      alert('Security Code Required: Please enter your 4-digit authorization code (e.g. 1234) to dispense data.');
      return;
    }

    const { agentCost } = calculateCustomGbPrice(dispenseGb, dispenseNetwork);
    if (currentUser.balance < agentCost) {
      alert(`Insufficient wallet balance (GH₵ ${currentUser.balance.toFixed(2)}). Need GH₵ ${agentCost.toFixed(2)}.`);
      return;
    }

    setIsDispensing(true);
    setTimeout(() => {
      // Deduct agent wholesale cost from wallet
      DataStorageService.updateBalance(-agentCost);

      const txRef = `MP-DSP-${Date.now().toString().slice(-6)}`;
      const smsRef = `${dispenseNetwork.toUpperCase()}-DATA-GH-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder: DataOrder = {
        id: `ord-gh-${Date.now()}`,
        packageId: `pkg-${dispenseNetwork}-${dispenseGb}gb`,
        packageName: `${dispenseGb} GB Data Mart Non-Expiry Bundle`,
        network: dispenseNetwork,
        capacityGb: dispenseGb,
        recipientPhone: dispensePhone,
        recipientName: dispenseName || 'Direct Client',
        amountPaid: dispenseClientCharge,
        paymentMethod: 'wallet_balance',
        momoNumber: currentUser.phone,
        transactionRef: txRef,
        smsReference: smsRef,
        deliveryStatus: 'delivered',
        deliveredAt: new Date().toISOString(),
        validity: 'Non-Expiry',
      };

      DataStorageService.addOrder(newOrder);
      onOrderCreated(newOrder);
      setIsDispensing(false);

      const profit = Math.round((dispenseClientCharge - agentCost) * 10) / 10;
      setDispenseSuccessMsg(
        `Successfully sent ${dispenseGb}GB to ${dispensePhone}! Cost: GH₵ ${agentCost.toFixed(2)} debited. You earned GH₵ ${profit.toFixed(2)} profit!`
      );
      setTimeout(() => setDispenseSuccessMsg(null), 6000);
      setDispensePhone('');
      setDispenseName('');
    }, 1000);
  };

  // Execute Bulk Data Dispatch
  const handleExecuteBulkSend = () => {
    const rawLines = bulkNumbersText.split('\n').map((l) => l.trim()).filter((l) => l.length >= 9);
    if (rawLines.length === 0) {
      alert('Please enter at least one valid phone number');
      return;
    }
    if (!bulkCode || bulkCode.trim().length < 4) {
      alert('Security Code Required: Please enter your 4-digit authorization code (e.g. 1234) to send bulk data.');
      return;
    }

    const { agentCost } = calculateCustomGbPrice(bulkGb, bulkNetwork);
    const totalRequiredCost = agentCost * rawLines.length;

    if (currentUser.balance < totalRequiredCost) {
      alert(`Insufficient wallet balance. Total cost is GH₵ ${totalRequiredCost.toFixed(2)}, your balance is GH₵ ${currentUser.balance.toFixed(2)}.`);
      return;
    }

    setIsBulkSending(true);
    setTimeout(() => {
      // Deduct total wholesale cost
      DataStorageService.updateBalance(-totalRequiredCost);

      rawLines.forEach((phone, idx) => {
        const txRef = `MP-BLK-${Date.now().toString().slice(-5)}-${idx}`;
        const newOrder: DataOrder = {
          id: `ord-gh-${Date.now()}-${idx}`,
          packageId: `pkg-${bulkNetwork}-${bulkGb}gb`,
          packageName: `${bulkGb} GB Bulk Non-Expiry Bundle`,
          network: bulkNetwork,
          capacityGb: bulkGb,
          recipientPhone: phone,
          recipientName: `Bulk Client #${idx + 1}`,
          amountPaid: agentCost * 1.15,
          paymentMethod: 'wallet_balance',
          momoNumber: currentUser.phone,
          transactionRef: txRef,
          smsReference: `${bulkNetwork.toUpperCase()}-BULK-${Math.floor(100000 + Math.random() * 900000)}`,
          deliveryStatus: 'delivered',
          deliveredAt: new Date().toISOString(),
          validity: 'Non-Expiry',
        };
        DataStorageService.addOrder(newOrder);
        onOrderCreated(newOrder);
      });

      setIsBulkSending(false);
      setBulkReport({
        totalSent: rawLines.length,
        totalGb: rawLines.length * bulkGb,
        totalCost: totalRequiredCost,
      });
    }, 1500);
  };

  // AI Pricing Advisor Action
  const handleRunAiPricing = async () => {
    setIsLoadingAiPricing(true);
    const { agentCost, price } = calculateCustomGbPrice(aiTargetGb, aiTargetNetwork);
    const result = await GeminiService.optimizeRates({
      network: aiTargetNetwork,
      capacityGb: aiTargetGb,
      wholesaleCost: agentCost,
      currentRetailPrice: price,
      targetMarginPercent: 18,
    });
    setAiPricingResult(result);
    setIsLoadingAiPricing(false);
  };

  // AI Promo Copy Generator Action
  const handleRunAiPromo = async () => {
    setIsLoadingAiPromo(true);
    const result = await GeminiService.generateSmsPromo({
      agentName: currentUser.name,
      network: selectedNetwork,
      highlightBundles: '1GB, 5GB, 10GB, 20GB, 50GB, 100GB, 120GB',
      promoStyle: aiPromoStyle,
    });
    setAiPromoResult(result);
    setIsLoadingAiPromo(false);
  };

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromoField(fieldKey);
    setTimeout(() => setCopiedPromoField(null), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Studio Header Card with John Evans Cole Profile & Blue/Orange Aesthetics */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-blue-950 via-slate-900 to-orange-950 border border-orange-500/40 shadow-2xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-500/40 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 rounded-lg shadow">
                AGENT
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentUser.name}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Master Reseller
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Ghana MoMo Reseller Studio • <strong>1GB to 120GB Wholesale Inventory</strong>
              </p>
              <div className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                📞 {currentUser.phone} • 📍 {currentUser.location}
              </div>
            </div>
          </div>

          {/* Wallet Balance & Action */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-blue-500/30">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                Wholesale MoMo Wallet
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {formatGHS(currentUser.balance)}
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenTopupWallet}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Top Up Wallet</span>
            </button>
          </div>
        </div>

        {/* Studio Live Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Total Data Dispensed</span>
            <span className="text-xl font-black text-white font-mono">
              {studioMetrics.totalGbSold.toLocaleString()} <span className="text-xs text-amber-400">GB</span>
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Gross Revenue (Cedis)</span>
            <span className="text-xl font-black text-amber-400 font-mono">
              {formatGHS(studioMetrics.totalRevenue)}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Net Agent Profit</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {formatGHS(studioMetrics.totalProfit)}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Customers Served</span>
            <span className="text-xl font-black text-white font-mono">
              {studioMetrics.uniqueClients}
            </span>
          </div>
        </div>
      </div>

      {/* Studio Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-bold text-slate-400">
        <button
          onClick={() => setActiveSubtab('pricing')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeSubtab === 'pricing'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Pricing & Margin Studio (1-120 GB)</span>
        </button>

        <button
          onClick={() => setActiveSubtab('dispenser')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeSubtab === 'dispenser'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Quick Client Dispenser</span>
        </button>

        <button
          onClick={() => setActiveSubtab('bulk')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeSubtab === 'bulk'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Bulk S.M.S & Data Sender</span>
        </button>

        <button
          onClick={() => setActiveSubtab('logs')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeSubtab === 'logs'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Dispatch Ledger & S.M.S</span>
        </button>

        <button
          onClick={() => setActiveSubtab('ai_advisor')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeSubtab === 'ai_advisor'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md font-black'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Data Mart AI Advisor</span>
        </button>
      </div>

      {/* Tab 1: Pricing & Margin Studio (1 - 120 GB) */}
      {activeSubtab === 'pricing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/30 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  Reseller Rate Card & Profit Margin Manager
                </h3>
                <p className="text-xs text-slate-400">
                  Configure your customer retail selling price for each bundle (1 - 120 GB) to set your profit per transaction.
                </p>
              </div>

              {/* Network Pill Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedNetwork('mtn')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedNetwork === 'mtn'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  MTN Ghana
                </button>
                <button
                  onClick={() => setSelectedNetwork('telecel')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedNetwork === 'telecel'
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Telecel Ghana
                </button>
                <button
                  onClick={() => setSelectedNetwork('airteltigo')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedNetwork === 'airteltigo'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  AirtelTigo
                </button>
              </div>
            </div>

            {/* Packages Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Bundle Capacity</th>
                    <th className="py-3 px-4">Wholesale Agent Cost</th>
                    <th className="py-3 px-4">Your Retail Price (GH₵)</th>
                    <th className="py-3 px-4">Profit per Sale</th>
                    <th className="py-3 px-4">Validity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Margins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {filteredPackages.map((pkg) => {
                    const profit = Math.round((pkg.retailPrice - pkg.agentCost) * 10) / 10;
                    const marginPercent = Math.round((profit / pkg.retailPrice) * 100);

                    return (
                      <tr key={pkg.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">
                            {pkg.capacityGb} GB
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {pkg.name}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {formatGHS(pkg.agentCost)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-400">GH₵</span>
                            <input
                              type="number"
                              step="0.5"
                              value={pkg.retailPrice}
                              onChange={(e) => {
                                const newPrice = Number(e.target.value);
                                onUpdatePackage(pkg.id, { retailPrice: newPrice });
                              }}
                              className="w-24 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-emerald-400">
                            +{formatGHS(profit)}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({marginPercent}%)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-emerald-400 font-bold text-[11px]">
                          {pkg.validity}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pkg.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {pkg.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const newPrice = Math.round(pkg.agentCost * 1.12 * 10) / 10;
                                onUpdatePackage(pkg.id, { retailPrice: newPrice });
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300"
                            >
                              +12%
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newPrice = Math.round(pkg.agentCost * 1.18 * 10) / 10;
                                onUpdatePackage(pkg.id, { retailPrice: newPrice });
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-amber-400"
                            >
                              +18%
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newPrice = Math.round(pkg.agentCost * 1.25 * 10) / 10;
                                onUpdatePackage(pkg.id, { retailPrice: newPrice });
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-orange-400"
                            >
                              +25%
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Quick Client Dispenser (Send Data to Client) */}
      {activeSubtab === 'dispenser' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-orange-500/30 text-white shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" />
                <span>Agent Quick Data Dispenser</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Send data directly to any client phone number. Wholesale cost is deducted from your wallet balance; collect cash or MoMo from your customer.
              </p>
            </div>

            {dispenseSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{dispenseSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleExecuteDispense} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Client Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={dispensePhone}
                    onChange={(e) => handleDispensePhoneChange(e.target.value)}
                    placeholder="e.g. 0244128990"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white font-mono text-base focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Client Name / Label
                  </label>
                  <input
                    type="text"
                    value={dispenseName}
                    onChange={(e) => setDispenseName(e.target.value)}
                    placeholder="e.g. Kwesi Church Leader"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Network */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Client Telco Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDispenseNetwork('mtn')}
                    className={`p-3 rounded-2xl border text-xs font-bold ${
                      dispenseNetwork === 'mtn' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    MTN Ghana
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispenseNetwork('telecel')}
                    className={`p-3 rounded-2xl border text-xs font-bold ${
                      dispenseNetwork === 'telecel' ? 'bg-red-600 text-white border-red-500' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Telecel
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispenseNetwork('airteltigo')}
                    className={`p-3 rounded-2xl border text-xs font-bold ${
                      dispenseNetwork === 'airteltigo' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    AirtelTigo
                  </button>
                </div>
              </div>

              {/* Data Amount (1 - 120 GB) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Data Capacity: {dispenseGb} GB
                </label>
                <input
                  type="range"
                  min={1}
                  max={120}
                  step={1}
                  value={dispenseGb}
                  onChange={(e) => handleDispenseGbChange(Number(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>1 GB</span>
                  <span>10 GB</span>
                  <span>50 GB</span>
                  <span>100 GB</span>
                  <span>120 GB</span>
                </div>
              </div>

              {/* Charge Client & Profit Calculator */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Wholesale Cost (Deducted):</span>
                  <span className="font-mono font-black text-amber-400 text-base">
                    {formatGHS(calculateCustomGbPrice(dispenseGb, dispenseNetwork).agentCost)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Customer Charge:</span>
                  <input
                    type="number"
                    value={dispenseClientCharge}
                    onChange={(e) => setDispenseClientCharge(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-600 font-mono font-bold text-white text-sm"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Your Net Profit:</span>
                  <span className="font-mono font-black text-emerald-400 text-base">
                    {formatGHS(Math.max(0, dispenseClientCharge - calculateCustomGbPrice(dispenseGb, dispenseNetwork).agentCost))}
                  </span>
                </div>
              </div>

              {/* Dispenser Security Code (Required) */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-orange-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Agent Dispenser Code (Required)</span>
                    <span className="text-orange-400">*</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">Demo Code: 1234</span>
                </div>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={dispenseCode}
                  onChange={(e) => setDispenseCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 4-digit code"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono text-center tracking-widest text-base focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isDispensing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-base shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 text-slate-950" />
                <span>
                  {isDispensing ? 'Contacting Telco Gateway...' : `Send ${dispenseGb}GB Data Now to Client`}
                </span>
              </button>
            </form>
          </div>

          {/* Right Wallet Status */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900 border border-blue-500/30 text-white shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>Studio Wallet</span>
            </h4>
            <div className="text-3xl font-black text-amber-400 font-mono">
              {formatGHS(currentUser.balance)}
            </div>
            <p className="text-xs text-slate-300">
              Every data package you dispense is debited at wholesale cost. Top up your balance anytime via MoMo.
            </p>
            <button
              type="button"
              onClick={onOpenTopupWallet}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow"
            >
              Deposit Funds to Wallet
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Bulk Data Sender */}
      {activeSubtab === 'bulk' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-blue-500/30 text-white shadow-xl space-y-6">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Bulk Data & S.M.S Dispatcher</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Send 1GB to 120GB non-expiry packages to multiple client phone numbers simultaneously.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Paste Phone Numbers (One per line)
                </label>
                <textarea
                  rows={6}
                  value={bulkNumbersText}
                  onChange={(e) => setBulkNumbersText(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Data per Number: {bulkGb} GB
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={120}
                    value={bulkGb}
                    onChange={(e) => setBulkGb(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="text-[11px] font-mono text-amber-400 mt-1">{bulkGb} GB each</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Network
                  </label>
                  <select
                    value={bulkNetwork}
                    onChange={(e) => setBulkNetwork(e.target.value as MobileNetwork)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  >
                    <option value="mtn">MTN Ghana</option>
                    <option value="telecel">Telecel Ghana</option>
                    <option value="airteltigo">AirtelTigo</option>
                  </select>
                </div>
              </div>

              {/* Bulk Dispenser Code */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-orange-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Agent Authorization Code (Required)</span>
                    <span className="text-orange-400">*</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">Demo: 1234</span>
                </div>
                <input
                  type="password"
                  maxLength={6}
                  value={bulkCode}
                  onChange={(e) => setBulkCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 4-digit code"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono text-center tracking-widest text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                disabled={isBulkSending}
                onClick={handleExecuteBulkSend}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                {isBulkSending ? 'Sending Bulk Batches...' : 'Execute Bulk Data Dispatch'}
              </button>
            </div>

            {/* Bulk Calculation / Report Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">
                  Batch Summary
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Valid Recipients:</span>
                    <strong className="text-white font-mono">
                      {bulkNumbersText.split('\n').filter((l) => l.trim().length >= 9).length} Numbers
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Volume Dispensed:</span>
                    <strong className="text-amber-400 font-mono">
                      {bulkNumbersText.split('\n').filter((l) => l.trim().length >= 9).length * bulkGb} GB
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Total Cost:</span>
                    <strong className="text-emerald-400 font-mono">
                      {formatGHS(calculateCustomGbPrice(bulkGb, bulkNetwork).agentCost * bulkNumbersText.split('\n').filter((l) => l.trim().length >= 9).length)}
                    </strong>
                  </div>
                </div>
              </div>

              {bulkReport && (
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs">
                  ✅ Successfully dispatched {bulkReport.totalGb} GB to {bulkReport.totalSent} numbers!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Studio Order Book & S.M.S Logs */}
      {activeSubtab === 'logs' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/30 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Client Order Book & S.M.S Logs</h3>
              <p className="text-xs text-slate-400">Real-time status of all mobile data deliveries.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] tracking-wider uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">S.M.S Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(ord.deliveredAt).toLocaleDateString()} {new Date(ord.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white">{ord.recipientPhone}</div>
                      {ord.recipientName && (
                        <div className="text-[10px] text-amber-400">{ord.recipientName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {ord.capacityGb} GB ({ord.network.toUpperCase()})
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {formatGHS(ord.amountPaid)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        DELIVERED
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                      {ord.smsReference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Data Mart AI Reseller Advisor (Powered by Gemini API) */}
      {activeSubtab === 'ai_advisor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tool 1: AI Pricing Strategy Optimizer */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-orange-500/30 text-white shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-black text-white">
                  Gemini AI Pricing Optimizer (1-120 GB)
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Let Gemini analyze wholesale telco margins in Ghana and calculate the optimal price point for maximum MoMo orders.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Select Network
                  </label>
                  <select
                    value={aiTargetNetwork}
                    onChange={(e) => setAiTargetNetwork(e.target.value as MobileNetwork)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                  >
                    <option value="mtn">MTN Ghana</option>
                    <option value="telecel">Telecel Ghana</option>
                    <option value="airteltigo">AirtelTigo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Bundle Size (1-120 GB)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={aiTargetGb}
                    onChange={(e) => setAiTargetGb(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isLoadingAiPricing}
                onClick={handleRunAiPricing}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{isLoadingAiPricing ? 'Gemini Analyzing...' : 'Optimize Bundle Rates with AI'}</span>
              </button>

              {aiPricingResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 text-xs space-y-2 animate-in fade-in">
                  <div className="flex justify-between items-center text-amber-400 font-bold border-b border-slate-800 pb-1.5">
                    <span>Recommended Selling Price:</span>
                    <span className="text-base font-black font-mono">
                      GH₵ {aiPricingResult.recommendedPrice}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>Buyer Savings: <strong className="text-emerald-400 font-mono">GH₵ {aiPricingResult.customerSavingsGhs}</strong></div>
                    <div>Your Profit: <strong className="text-emerald-400 font-mono">GH₵ {aiPricingResult.profitPerSaleGhs}</strong></div>
                  </div>
                  <p className="text-[11px] text-slate-400 italic pt-1">
                    "{aiPricingResult.recommendationStrategy}"
                  </p>
                </div>
              )}
            </div>

            {/* Tool 2: WhatsApp & SMS Ad Copy Generator */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-blue-500/30 text-white shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-400" />
                <h4 className="text-base font-black text-white">
                  WhatsApp & S.M.S Broadcast Generator
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Auto-generate viral promotional copy in Ghanaian Pidgin and English for your WhatsApp Status and SMS broadcast campaigns.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Campaign Tone
                </label>
                <select
                  value={aiPromoStyle}
                  onChange={(e) => setAiPromoStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                >
                  <option value="Exciting with Ghana Pidgin & English mix">Campus & Youth Pidgin Vibe</option>
                  <option value="Professional corporate for office workers">Professional Office / SME</option>
                  <option value="Urgent weekend discount alert">Weekend Flash Discount</option>
                </select>
              </div>

              <button
                type="button"
                disabled={isLoadingAiPromo}
                onClick={handleRunAiPromo}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{isLoadingAiPromo ? 'Writing Copy...' : 'Generate Broadcast Messages'}</span>
              </button>

              {aiPromoResult && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-orange-400 font-bold uppercase">
                      <span>SMS Broadcast (160 char)</span>
                      <button
                        onClick={() => copyToClipboard(aiPromoResult.smsPromo, 'sms')}
                        className="text-slate-400 hover:text-white flex items-center gap-0.5"
                      >
                        {copiedPromoField === 'sms' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="text-xs font-mono text-slate-200">{aiPromoResult.smsPromo}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-emerald-400 font-bold uppercase">
                      <span>WhatsApp Status Promo</span>
                      <button
                        onClick={() => copyToClipboard(aiPromoResult.whatsappPromo, 'wa')}
                        className="text-slate-400 hover:text-white flex items-center gap-0.5"
                      >
                        {copiedPromoField === 'wa' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="text-xs font-mono text-slate-200 whitespace-pre-line max-h-36 overflow-y-auto">
                      {aiPromoResult.whatsappPromo}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
