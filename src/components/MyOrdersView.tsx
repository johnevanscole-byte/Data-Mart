import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Search,
  Filter,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { DataOrder, MobileNetwork, UserAccount } from '../types';
import { formatGHS } from '../services/dataStorageService';

interface MyOrdersViewProps {
  orders: DataOrder[];
  currentUser: UserAccount;
  onOpenUssdModal: (network: MobileNetwork) => void;
  onBuyMore: () => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  orders,
  currentUser,
  onOpenUssdModal,
  onBuyMore,
}) => {
  const [filterNetwork, setFilterNetwork] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<DataOrder | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filterNetwork !== 'all' && o.network !== filterNetwork) return false;
    if (!searchTerm) return true;
    return (
      o.recipientPhone.includes(searchTerm) ||
      o.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.transactionRef.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const copyText = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-blue-950 via-slate-900 to-orange-950 border border-orange-500/40 text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Order History & S.M.S Logs</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Mobile Data Purchases & Deliveries
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            All 1GB - 120GB non-expiry packages ordered by <strong>{currentUser.name}</strong> ({currentUser.email}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenUssdModal('mtn')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>Check Balance (*138#)</span>
          </button>
          <button
            type="button"
            onClick={onBuyMore}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-lg shadow-orange-500/20 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buy More Data</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 text-white">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterNetwork('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterNetwork === 'all'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Networks ({orders.length})
          </button>
          <button
            onClick={() => setFilterNetwork('mtn')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterNetwork === 'mtn'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            MTN MoMo
          </button>
          <button
            onClick={() => setFilterNetwork('telecel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterNetwork === 'telecel'
                ? 'bg-red-600 text-white font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Telecel Cash
          </button>
          <button
            onClick={() => setFilterNetwork('airteltigo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterNetwork === 'airteltigo'
                ? 'bg-blue-600 text-white font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            AirtelTigo
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search phone, package, or ref..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Orders Grid / List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 space-y-3">
            <Clock className="w-12 h-12 mx-auto text-slate-600" />
            <div className="text-base font-bold text-white">No data orders found</div>
            <p className="text-xs">Try selecting a different filter or purchase your first data bundle.</p>
            <button
              onClick={onBuyMore}
              className="py-2.5 px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Order 1 - 120 GB Now
            </button>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const netBadgeColor =
              ord.network === 'mtn'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : ord.network === 'telecel'
                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

            return (
              <div
                key={ord.id}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-blue-500/20 hover:border-orange-500/40 text-white shadow-xl transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black flex items-center justify-center text-base shadow-lg">
                      {ord.capacityGb}GB
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {ord.packageName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${netBadgeColor}`}>
                          {ord.network}
                        </span>
                        <span>•</span>
                        <span>{new Date(ord.deliveredAt).toLocaleDateString()} {new Date(ord.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Amount Paid:</span>
                      <span className="text-xl font-black text-amber-400 font-mono">
                        {formatGHS(ord.amountPaid)}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Delivered
                    </span>
                  </div>
                </div>

                {/* S.M.S Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-orange-400 font-bold text-[11px]">
                      <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                      <span>S.M.S Delivered to {ord.recipientPhone}</span>
                    </div>
                    <p className="font-mono text-slate-300 text-xs">
                      "Data Mart S.M.S: You have received {ord.capacityGb}GB {ord.network.toUpperCase()} Non-Expiry Data on {ord.recipientPhone}. Cost: {formatGHS(ord.amountPaid)}. Ref: {ord.transactionRef}."
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyText(ord.transactionRef, ord.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedId === ord.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Ref</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenUssdModal(ord.network)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Verify Balance</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
