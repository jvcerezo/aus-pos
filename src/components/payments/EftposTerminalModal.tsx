import React, { useState } from 'react';
import {
  CreditCard,
  Wifi,
  CheckCircle2,
  Loader2,
  X,
  Smartphone
} from 'lucide-react';
import type { PaymentType, VenueProfile } from '../../types';
import { formatAud } from '../../utils/formatters';
import { calculatePaymentCardSurcharge } from '../../utils/gst';
import { sounds } from '../../utils/sound';
import confetti from 'canvas-confetti';


interface EftposTerminalModalProps {
  isOpen: boolean;
  baseAmount: number;
  venue: VenueProfile;
  guestLabel?: string;
  tipAmount: number;
  onClose: () => void;
  onSuccess: (result: {
    paymentType: PaymentType;
    baseAmount: number;
    surchargeAmount: number;
    tipAmount: number;
    totalAmount: number;
    cardLast4: string;
    authCode: string;
  }) => void;
}

export const EftposTerminalModal: React.FC<EftposTerminalModalProps> = ({
  isOpen,
  baseAmount,
  venue,
  guestLabel,
  tipAmount,
  onClose,
  onSuccess,
}) => {
  const [selectedCardType, setSelectedCardType] = useState<PaymentType>('visa');
  const [terminalState, setTerminalState] = useState<'ready' | 'processing' | 'approved' | 'declined'>('ready');
  const [authCode, setAuthCode] = useState<string>('');

  if (!isOpen) return null;

  const totalBaseAndTip = baseAmount + tipAmount;
  const surchargeInfo = calculatePaymentCardSurcharge(totalBaseAndTip, selectedCardType, venue);
  const finalChargeAmount = surchargeInfo.totalWithSurcharge;

  const handleSimulatePayment = (_method: 'tap' | 'insert') => {

    sounds.playTap();
    setTerminalState('processing');

    const generatedAuth = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
    setAuthCode(generatedAuth);

    setTimeout(() => {
      setTerminalState('approved');
      sounds.playPaymentSuccess();

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      setTimeout(() => {
        onSuccess({
          paymentType: selectedCardType,
          baseAmount,
          surchargeAmount: surchargeInfo.surchargeAmount,
          tipAmount,
          totalAmount: finalChargeAmount,
          cardLast4: '4242',
          authCode: generatedAuth,
        });
      }, 1200);
    }, 1600);
  };

  const cardOptions: { type: PaymentType; label: string; rate: number }[] = [
    { type: 'eftpos', label: 'EFTPOS / Debit (Sav/Chq)', rate: venue.surcharges.cardSurchargeEftpos },
    { type: 'visa', label: 'Visa Credit/Debit', rate: venue.surcharges.cardSurchargeVisaMastercard },
    { type: 'mastercard', label: 'Mastercard', rate: venue.surcharges.cardSurchargeVisaMastercard },
    { type: 'amex', label: 'American Express', rate: venue.surcharges.cardSurchargeAmex },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          disabled={terminalState === 'processing'}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 disabled:opacity-30 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
            <Wifi className="w-3.5 h-3.5 text-sky-400" />
            <span>Australian Integrated EFTPOS Terminal</span>
          </div>
          <h2 className="text-xl font-bold text-white">{venue.name}</h2>
          {guestLabel && <span className="text-xs text-sky-400 font-medium">Paying for: {guestLabel}</span>}
        </div>

        {/* Realistic Terminal LCD Screen */}
        <div className="bg-slate-950 border-2 border-slate-700 rounded-2xl p-5 mb-5 shadow-inner text-center">
          {terminalState === 'ready' && (
            <div className="space-y-3">
              <span className="text-xs text-slate-400 block uppercase font-mono">Present Card / Tap Phone</span>
              <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
                {formatAud(finalChargeAmount)}
              </div>

              {/* Surcharge breakdown display */}
              <div className="bg-slate-900/90 rounded-xl p-2.5 text-xs text-slate-400 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatAud(baseAmount)}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Tip:</span>
                    <span>+{formatAud(tipAmount)}</span>
                  </div>
                )}
                {surchargeInfo.surchargeAmount > 0 && (
                  <div className="flex justify-between text-amber-400/90">
                    <span>Card Surcharge ({surchargeInfo.rate}%):</span>
                    <span>+{formatAud(surchargeInfo.surchargeAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {terminalState === 'processing' && (
            <div className="py-6 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
              <div className="text-sm font-bold text-slate-200">Processing with Bank...</div>
              <span className="text-xs text-slate-400 font-mono">Do not remove card</span>
            </div>
          )}

          {terminalState === 'approved' && (
            <div className="py-4 flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-base font-black text-emerald-400 uppercase tracking-wide">
                Payment Approved
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Auth Code: {authCode} • Card: **** 4242
              </div>
            </div>
          )}
        </div>

        {/* Card Type Selector (To simulate fee differential) */}
        {terminalState === 'ready' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Card Scheme / Surcharge Rate
            </label>
            <div className="grid grid-cols-2 gap-2">
              {cardOptions.map(opt => (
                <button
                  key={opt.type}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedCardType(opt.type);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedCardType === opt.type
                      ? 'bg-sky-600/30 border-sky-500 text-sky-300 ring-1 ring-sky-500/50'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono">+{opt.rate}% Surcharge</div>
                </button>
              ))}
            </div>

            {/* Tap vs Insert Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                onClick={() => handleSimulatePayment('tap')}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg transition active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Tap / Apple Pay</span>
              </button>

              <button
                onClick={() => handleSimulatePayment('insert')}
                className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg transition active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Insert Chip & PIN</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
