import React, { useState } from 'react';
import { X, Wallet, Smartphone, ShieldCheck, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { UserAccount, MobileNetwork } from '../types';
import { formatGHS, DataStorageService } from '../services/dataStorageService';

interface TopupWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onWalletUpdated: (user: UserAccount) => void;
}

export const TopupWalletModal: React.FC<TopupWalletModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onWalletUpdated,
}) => {
  const [amount, setAmount] = useState<number>(100);
  const [network, setNetwork] = useState<MobileNetwork>('mtn');
  const [momoNumber, setMomoNumber] = useState(currentUser.phone || '0244128990');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const quickAmounts = [50, 100, 200, 500, 1000];
  const bonus = amount >= 200 ? Math.round(amount * 0.02 * 10) / 10 : 0;
  const totalCredited = amount + bonus;

  const handleTopup = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const updatedUser = DataStorageService.updateBalance(totalCredited);
      setIsProcessing(false);
      setIsSuccess(true);
      onWalletUpdated(updatedUser);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-orange-500/30 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-950 via-slate-900 to-orange-950 border-b border-orange-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Wallet className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Top Up Agent Wallet</h3>
              <p className="text-xs text-slate-400">Current Balance: {formatGHS(currentUser.balance)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!isSuccess ? (
            <>
              {/* Quick Amount Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Top-up Amount (GH Cedis)
                </label>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        amount === amt
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={10}
                  max={10000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-lg focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Bonus tag */}
              {bonus > 0 && (
                <div className="p-2.5 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center gap-2 text-xs text-orange-300">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>Agent Deposit Bonus applied: +GH₵ {bonus.toFixed(2)} extra credit!</span>
                </div>
              )}

              {/* Network */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Ghana MoMo Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNetwork('mtn')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      network === 'mtn'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    MTN MoMo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNetwork('telecel')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      network === 'telecel'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Telecel Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setNetwork('airteltigo')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      network === 'airteltigo'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    AT Money
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  MoMo Number to Debit
                </label>
                <input
                  type="tel"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleTopup}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 hover:from-amber-400 hover:to-orange-500"
              >
                {isProcessing ? 'Waiting for MoMo Approval...' : `Deposit ${formatGHS(amount)} via MoMo`}
              </button>
            </>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">Wallet Funded Successfully!</h4>
                <p className="text-xs text-slate-300">
                  Credited {formatGHS(totalCredited)} into John Evans Cole's agent wallet.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm"
              >
                Continue to Studio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
