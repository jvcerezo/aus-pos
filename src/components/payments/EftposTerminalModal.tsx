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
  const [selectedCardType, setSelectedCardType] = useState<PaymentType>('eftpos');
  const [terminalState, setTerminalState] = useState<'ready' | 'processing' | 'approved'>('ready');
  const [authCode, setAuthCode] = useState<string>('');

  if (!isOpen) return null;

  const totalBaseAndTip = baseAmount + tipAmount;
  const surchargeInfo = calculatePaymentCardSurcharge(totalBaseAndTip, selectedCardType, venue);
  const finalChargeAmount = surchargeInfo.totalWithSurcharge;

  const handleSimulatePayment = () => {
    setTerminalState('processing');

    const generatedAuth = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
    setAuthCode(generatedAuth);

    setTimeout(() => {
      setTerminalState('approved');

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
      }, 800);
    }, 1000);
  };

  const cardOptions: { type: PaymentType; label: string; rate: number }[] = [
    { type: 'eftpos', label: 'EFTPOS Debit (Sav/Chq)', rate: venue.surcharges.cardSurchargeEftpos },
    { type: 'visa', label: 'Visa Credit/Debit', rate: venue.surcharges.cardSurchargeVisaMastercard },
    { type: 'mastercard', label: 'Mastercard', rate: venue.surcharges.cardSurchargeVisaMastercard },
    { type: 'amex', label: 'American Express', rate: venue.surcharges.cardSurchargeAmex },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          disabled={terminalState === 'processing'}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-500 mb-0.5 uppercase tracking-wider">
            <Wifi className="w-3.5 h-3.5 text-slate-600" />
            <span>Integrated EFTPOS</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">{venue.name}</h2>
          {guestLabel && <span className="text-xs text-slate-500 font-medium">Paying for: {guestLabel}</span>}
        </div>

        {/* Terminal Screen */}
        <div className="bg-slate-900 rounded-xl p-4 mb-4 text-center text-white">
          {terminalState === 'ready' && (
            <div className="space-y-2">
              <span className="text-xs text-slate-400 block uppercase font-mono">Present Card / Tap Phone</span>
              <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
                {formatAud(finalChargeAmount)}
              </div>

              {/* Surcharge breakdown display */}
              <div className="bg-slate-800 rounded-lg p-2 text-xs text-slate-400 space-y-0.5 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatAud(baseAmount)}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>Tip:</span>
                    <span>+{formatAud(tipAmount)}</span>
                  </div>
                )}
                {surchargeInfo.surchargeAmount > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>Card Surcharge ({surchargeInfo.rate}%):</span>
                    <span>+{formatAud(surchargeInfo.surchargeAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {terminalState === 'processing' && (
            <div className="py-6 flex flex-col items-center justify-center space-y-2 text-white">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              <span className="text-sm font-mono font-bold">Contacting Bank...</span>
            </div>
          )}

          {terminalState === 'approved' && (
            <div className="py-4 flex flex-col items-center justify-center space-y-1.5 text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
              <span className="text-lg font-black font-mono tracking-wider">APPROVED</span>
              <span className="text-[11px] font-mono text-slate-400">STAN {authCode}</span>
            </div>
          )}
        </div>

        {/* Card Scheme Selection */}
        {terminalState === 'ready' && (
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Card Scheme (Australian Surcharge)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {cardOptions.map(opt => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setSelectedCardType(opt.type)}
                    className={`p-2 rounded-lg border text-left text-xs transition ${
                      selectedCardType === opt.type
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold truncate">{opt.label}</div>
                    <div className="text-[10px] opacity-75">
                      {opt.rate > 0 ? `+${opt.rate}% surcharge` : 'No surcharge'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="flex items-center justify-center space-x-1.5 bg-[#10b981] hover:bg-[#059669] text-white py-2.5 rounded-xl font-bold text-xs shadow-xs transition"
              >
                <Smartphone className="w-4 h-4" />
                <span>Tap / Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={handleSimulatePayment}
                className="flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs shadow-xs transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Insert Chip</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
