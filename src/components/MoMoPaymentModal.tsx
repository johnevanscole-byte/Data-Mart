import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Radio,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PhoneForwarded,
  MessageSquare,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Delete
} from 'lucide-react';
import { DataPackage, MobileNetwork, UserAccount, DataOrder } from '../types';
import { formatGHS, DataStorageService } from '../services/dataStorageService';

interface MoMoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: {
    capacityGb: number;
    network: MobileNetwork;
    price: number;
    name: string;
    validity?: string;
  };
  recipientPhone: string;
  recipientName?: string;
  currentUser: UserAccount;
  initialCode?: string;
  onPaymentSuccess: (order: DataOrder) => void;
  defaultPaymentMethod?: 'mtn_momo' | 'telecel_cash' | 'airteltigo_money' | 'wallet_balance';
}

export const MoMoPaymentModal: React.FC<MoMoPaymentModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  recipientPhone,
  recipientName,
  currentUser,
  initialCode = '',
  onPaymentSuccess,
  defaultPaymentMethod = 'mtn_momo',
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'telecel_cash' | 'airteltigo_money' | 'wallet_balance'>(defaultPaymentMethod);
  const [momoNumber, setMomoNumber] = useState(currentUser.phone || '0244128990');
  const [step, setStep] = useState<'review' | 'authorizing' | 'prompt_sent' | 'success'>('review');
  const [pin, setPin] = useState(initialCode);
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [completedOrder, setCompletedOrder] = useState<DataOrder | null>(null);

  // Sync default method and initial code when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('review');
      setPin(initialCode || '');
      setPinError(null);
      setCountdown(60);
      setPaymentMethod(defaultPaymentMethod);
      if (currentUser.phone) {
        setMomoNumber(currentUser.phone);
      }
    }
  }, [isOpen, defaultPaymentMethod, currentUser.phone, initialCode]);

  // Countdown for simulated prompt
  useEffect(() => {
    let timer: any;
    if (step === 'prompt_sent' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const networkName =
    selectedPackage.network === 'mtn'
      ? 'MTN Ghana'
      : selectedPackage.network === 'telecel'
      ? 'Telecel Ghana'
      : 'AirtelTigo (AT) Ghana';

  const methodLabel =
    paymentMethod === 'mtn_momo'
      ? 'MTN Mobile Money'
      : paymentMethod === 'telecel_cash'
      ? 'Telecel Cash'
      : paymentMethod === 'airteltigo_money'
      ? 'AirtelTigo Money'
      : 'Agent Wallet Balance';

  const handleKeypadPress = (val: string) => {
    if (val === 'clear') {
      setPin('');
      setPinError(null);
    } else if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
    } else {
      if (pin.length < 6) {
        const next = pin + val;
        setPin(next);
        if (next.length >= 4) {
          setPinError(null);
        }
      }
    }
  };

  const handleStartPayment = () => {
    // Require code
    if (!pin || pin.trim().length < 4) {
      setPinError('Security Code Required: Please type your 4-digit payment authorization code to buy data.');
      return;
    }
    setPinError(null);

    if (paymentMethod === 'wallet_balance') {
      if (currentUser.balance < selectedPackage.price) {
        alert('Insufficient wallet balance. Please top up your wallet or pay via MoMo.');
        return;
      }
      setStep('authorizing');
      setTimeout(() => {
        finishPayment();
      }, 1200);
    } else {
      setStep('prompt_sent');
      setCountdown(60);
    }
  };

  const finishPayment = () => {
    if (!pin || pin.trim().length < 4) {
      setPinError('Please enter your 4-digit code to complete authorization.');
      setStep('review');
      return;
    }

    const txRef = `MP-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const smsRef = `${selectedPackage.network.toUpperCase()}-DATA-GH-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: DataOrder = {
      id: `ord-gh-${Date.now()}`,
      packageId: `pkg-${selectedPackage.network}-${selectedPackage.capacityGb}gb`,
      packageName: selectedPackage.name,
      network: selectedPackage.network,
      capacityGb: selectedPackage.capacityGb,
      recipientPhone,
      recipientName: recipientName || (recipientPhone === currentUser.phone ? currentUser.name : 'Customer'),
      amountPaid: selectedPackage.price,
      paymentMethod,
      momoNumber: paymentMethod === 'wallet_balance' ? currentUser.phone : momoNumber,
      paymentCode: pin ? `${pin.slice(0, 1)}••${pin.slice(-1)}` : '••••',
      transactionRef: txRef,
      smsReference: smsRef,
      deliveryStatus: 'delivered',
      deliveredAt: new Date().toISOString(),
      validity: 'Non-Expiry',
    };

    // If paid by wallet, deduct
    if (paymentMethod === 'wallet_balance') {
      DataStorageService.updateBalance(-selectedPackage.price);
    }

    // Save order
    DataStorageService.addOrder(newOrder);
    setCompletedOrder(newOrder);
    setStep('success');
    onPaymentSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-blue-500/30 text-white shadow-2xl shadow-blue-950/50 overflow-hidden">
        {/* Glow header banner with Blue & Orange branding */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-blue-900 via-blue-800 to-orange-950 border-b border-orange-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-orange-500/30">
                <Lock className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Data Mart MoMo Checkout</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-full">
                    Code Protected
                  </span>
                </h3>
                <p className="text-xs text-blue-200/80">
                  Instant S.M.S delivery • 100% Non-Expiry Data
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {step === 'review' && (
            <div className="space-y-5">
              {/* Order Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-blue-500/20 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                      Selected Package
                    </span>
                    <div className="text-xl font-black text-white flex items-center gap-2">
                      <span>{selectedPackage.capacityGb} GB</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {networkName}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                      Amount Due
                    </span>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {formatGHS(selectedPackage.price)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <span className="text-slate-400 block text-[11px]">Recipient Number</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {recipientPhone}
                    </span>
                    {recipientName && (
                      <span className="block text-[10px] text-amber-400 truncate">
                        ({recipientName})
                      </span>
                    )}
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <span className="text-slate-400 block text-[11px]">Data Validity</span>
                    <span className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Never Expires
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector (MoMo, Telecel, AT, Wallet) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Mobile Money Payment
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* MTN MoMo */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mtn_momo')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'mtn_momo'
                        ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                        : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center font-black text-[11px] text-slate-950">
                      MTN
                    </div>
                    <span className="text-xs font-bold text-slate-200">MoMo</span>
                  </button>

                  {/* Telecel Cash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('telecel_cash')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'telecel_cash'
                        ? 'border-red-500 bg-red-500/15 shadow-md shadow-red-500/20 ring-1 ring-red-400'
                        : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center font-black text-[11px] text-white">
                      TEL
                    </div>
                    <span className="text-xs font-bold text-slate-200">Telecel</span>
                  </button>

                  {/* AirtelTigo (AT) Money */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('airteltigo_money')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'airteltigo_money'
                        ? 'border-blue-500 bg-blue-500/15 shadow-md shadow-blue-500/20 ring-1 ring-blue-400'
                        : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-black text-[11px] text-white">
                      AT
                    </div>
                    <span className="text-xs font-bold text-slate-200">AT Money</span>
                  </button>

                  {/* Reseller Wallet */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet_balance')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'wallet_balance'
                        ? 'border-emerald-500 bg-emerald-500/15 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400'
                        : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center font-black text-[11px] text-slate-950">
                      GH₵
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate max-w-full">
                      Wallet
                    </span>
                  </button>
                </div>
              </div>

              {/* MoMo Number Input (if not paying via wallet) */}
              {paymentMethod !== 'wallet_balance' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your {methodLabel} Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="e.g. 0244128990"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white font-mono text-base focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                    <span className="absolute right-3 top-3 text-[11px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-700">
                      GH 🇬🇭
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-300 font-semibold block">
                      Paying with Agent Wallet
                    </span>
                    <span className="text-sm font-bold text-white">
                      Available: {formatGHS(currentUser.balance)}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Instant 0-Fee
                  </span>
                </div>
              )}

              {/* REQUIRED: Payment Authorization Code / MoMo PIN */}
              <div className={`p-4 rounded-2xl border transition-all ${
                pinError
                  ? 'bg-red-950/40 border-red-500/80 shadow-md shadow-red-500/10'
                  : pin.length >= 4
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : 'bg-slate-800/80 border-orange-500/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Type Payment Authorization Code</span>
                    <span className="text-orange-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPin('1234');
                      setPinError(null);
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Demo Code: 1234</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-300 mb-2.5">
                  Type your 4-digit code (e.g. 1234 or your MoMo PIN) to authorize this payment:
                </p>

                {/* Input & 4 Boxes */}
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      value={pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setPin(val);
                        if (val.length >= 4) {
                          setPinError(null);
                        }
                      }}
                      placeholder="Type 4-digit code"
                      className="w-full px-4 py-3 pr-12 rounded-2xl bg-slate-900 border border-slate-700 text-amber-400 font-mono text-center text-xl tracking-widest focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-white p-1"
                      title={showPin ? 'Hide Code' : 'Show Code'}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* 4 Digit Slots */}
                  <div className="flex items-center justify-center gap-2">
                    {[0, 1, 2, 3].map((i) => {
                      const isFilled = pin.length > i;
                      return (
                        <div
                          key={i}
                          className={`w-10 h-12 rounded-xl border flex items-center justify-center text-base font-bold font-mono transition-all ${
                            isFilled
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                              : 'bg-slate-950/80 border-slate-700 text-slate-600'
                          }`}
                        >
                          {isFilled ? (showPin ? pin[i] : '•') : ''}
                        </div>
                      );
                    })}
                  </div>

                  {/* Compact keypad */}
                  <div className="pt-2 grid grid-cols-3 gap-1.5 max-w-[260px] mx-auto text-xs font-bold font-mono">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleKeypadPress(digit)}
                        className="py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/60 active:scale-95 transition-all"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleKeypadPress('clear')}
                      className="py-2 rounded-xl bg-slate-800/60 hover:bg-red-900/40 text-red-300 border border-slate-700/60 active:scale-95 text-[11px]"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeypadPress('0')}
                      className="py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 active:scale-95"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeypadPress('backspace')}
                      className="py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-amber-400 border border-slate-700/60 active:scale-95 flex items-center justify-center"
                    >
                      <Delete className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {pinError && (
                  <div className="mt-3 p-2.5 rounded-xl bg-red-950/90 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleStartPayment}
                className={`w-full py-4 px-6 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  pin.length < 4
                    ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-slate-950 hover:brightness-110 shadow-orange-500/20'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-orange-500/30'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>
                  {pin.length < 4
                    ? `Type Code to Authorize & Pay ${formatGHS(selectedPackage.price)}`
                    : `Authorize Code & Pay ${formatGHS(selectedPackage.price)}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Code Protected
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Instant S.M.S Notification
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Simulated MoMo Prompt Push on Phone */}
          {step === 'prompt_sent' && (
            <div className="text-center py-4 space-y-5">
              <div className="relative mx-auto w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
                <Radio className="w-10 h-10 text-amber-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-500 text-[11px] font-bold text-slate-950 flex items-center justify-center">
                  {countdown}s
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-white">
                  MoMo Prompt Sent to Handset
                </h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
                  Check your phone <span className="text-amber-400 font-mono font-bold">{momoNumber}</span> for the authorization popup.
                </p>
              </div>

              {/* Simulated Ghana USSD Phone Popup Graphic */}
              <div className="max-w-xs mx-auto p-4 rounded-2xl bg-slate-950 border border-amber-500/40 text-left font-mono text-xs space-y-2 shadow-2xl">
                <div className="text-amber-400 font-bold text-[11px] flex items-center justify-between pb-1 border-b border-slate-800">
                  <span>{methodLabel.toUpperCase()}</span>
                  <span>{paymentMethod === 'mtn_momo' ? '*170#' : '*110#'}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  Authorize payment of <span className="font-bold text-amber-400">{formatGHS(selectedPackage.price)}</span> to <span className="font-bold text-white">DATA MART GHANA</span>?
                </p>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-400 block">
                      Authorization Code:
                    </label>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      Code Verified ✓
                    </span>
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="w-full px-3 py-2 text-center text-lg tracking-widest rounded-xl bg-slate-900 border border-slate-700 text-amber-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Edit Code
                </button>
                <button
                  type="button"
                  onClick={finishPayment}
                  className="flex-2 py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorize Prompt & Deliver Data</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Authorizing Spinner */}
          {step === 'authorizing' && (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
              <div className="text-base font-bold text-white">
                Validating Payment Code & Dispatching {selectedPackage.capacityGb}GB Data...
              </div>
              <p className="text-xs text-slate-400">
                Contacting {networkName} gateway and generating S.M.S alert...
              </p>
            </div>
          )}

          {/* Step 4: Success with S.M.S Notification */}
          {step === 'success' && completedOrder && (
            <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl font-black text-white">
                  Data Delivered Successfully! 🇬🇭
                </h4>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                  {completedOrder.capacityGb} GB non-expiry bundle credited to {completedOrder.recipientPhone}
                </p>
                {completedOrder.paymentCode && (
                  <p className="text-[11px] text-amber-400 mt-1 font-mono">
                    Authorized with Code: {completedOrder.paymentCode}
                  </p>
                )}
              </div>

              {/* S.M.S Received Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-orange-500/40 text-left space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-xs text-orange-400 font-bold border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                    <span>Incoming S.M.S Receipt</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Just Now</span>
                </div>
                <p className="font-mono text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  Data Mart S.M.S: You have received {completedOrder.capacityGb}GB {completedOrder.network.toUpperCase()} Non-Expiry Data on {completedOrder.recipientPhone}. Cost: {formatGHS(completedOrder.amountPaid)}. Ref: {completedOrder.transactionRef}. Dial {completedOrder.network === 'mtn' ? '*138#' : '*124#'} to verify.
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Telco Ref: <strong className="text-white font-mono">{completedOrder.smsReference}</strong></span>
                  <span className="text-emerald-400 font-bold">Status: DELIVERED</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/20 transition-all"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
