import React, { useState } from 'react';
import { X, Phone, Radio, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { MobileNetwork, UserAccount } from '../types';

interface USSDCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  network?: MobileNetwork;
  currentUser: UserAccount;
}

export const USSDCheckModal: React.FC<USSDCheckModalProps> = ({
  isOpen,
  onClose,
  network = 'mtn',
  currentUser,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<MobileNetwork>(network);
  const [ussdInput, setUssdInput] = useState<string>(network === 'mtn' ? '*138#' : '*124#');
  const [isDialing, setIsDialing] = useState(false);
  const [dialResult, setDialResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDial = () => {
    setIsDialing(true);
    setDialResult(null);
    setTimeout(() => {
      setIsDialing(false);
      if (selectedNetwork === 'mtn') {
        setDialResult(
          `Y'ello John Evans Cole!\nYour MTN Non-Expiry Data Balance is 28.50 GB.\nBonus Night: 2.00 GB.\nMoMo Wallet: GH₵ ${currentUser.balance.toFixed(2)}.\nThank you for choosing Data Mart.`
        );
      } else if (selectedNetwork === 'telecel') {
        setDialResult(
          `Telecel Ghana Notice:\nActive Non-Expiry Red Bundle: 20.00 GB.\nAccount Balance: GH₵ ${currentUser.balance.toFixed(2)}.\nValidity: NEVER EXPIRES.`
        );
      } else {
        setDialResult(
          `AT Big Time Alert:\nYour AirtelTigo Non-Expiry balance: 35.40 GB.\nAT Money: GH₵ ${currentUser.balance.toFixed(2)}.\nRef: AT-GH-${Math.floor(100000 + Math.random() * 900000)}.`
        );
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-blue-500/30 text-white shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">Dial Telco USSD Balance</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                setSelectedNetwork('mtn');
                setUssdInput('*138#');
              }}
              className={`py-1.5 rounded-xl text-xs font-bold ${
                selectedNetwork === 'mtn' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              MTN *138#
            </button>
            <button
              onClick={() => {
                setSelectedNetwork('telecel');
                setUssdInput('*124#');
              }}
              className={`py-1.5 rounded-xl text-xs font-bold ${
                selectedNetwork === 'telecel' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Telecel *124#
            </button>
            <button
              onClick={() => {
                setSelectedNetwork('airteltigo');
                setUssdInput('*124#');
              }}
              className={`py-1.5 rounded-xl text-xs font-bold ${
                selectedNetwork === 'airteltigo' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              AT *124#
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3 font-mono">
            <div className="text-2xl font-black text-amber-400 tracking-wider">
              {ussdInput}
            </div>
            <button
              type="button"
              disabled={isDialing}
              onClick={handleDial}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isDialing ? 'Dialing network...' : 'Simulate USSD Dial'}</span>
            </button>
          </div>

          {dialResult && (
            <div className="p-3.5 rounded-2xl bg-slate-800 border border-amber-500/40 text-left font-mono text-xs whitespace-pre-line text-slate-200 leading-relaxed animate-in fade-in">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Network Flash Message (USSD Response)
              </div>
              {dialResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
