import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Heart,
  X,
  Receipt
} from 'lucide-react';
import type { PaymentType } from '../../types';

import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import { formatAud } from '../../utils/formatters';
import { calculateOrderTotals } from '../../utils/gst';
import { sounds } from '../../utils/sound';
import { EftposTerminalModal } from './EftposTerminalModal';
import { CashPaymentView } from './CashPaymentView';

interface PaymentModalProps {
  isOpen: boolean;
  customAmount?: number;
  guestLabel?: string;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  customAmount,
  guestLabel,
  onClose,
}) => {
  const { activeVenue } = useVenue();
  const { currentOrder, recordPayment } = usePos();

  const [paymentTab, setPaymentTab] = useState<'card' | 'cash'>('card');
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>('');
  const [isEftposTerminalOpen, setIsEftposTerminalOpen] = useState(false);

  if (!isOpen || !currentOrder) return null;

  const totals = calculateOrderTotals(currentOrder, activeVenue);
  const totalPaidSoFar = (currentOrder.splitPayments || []).reduce((sum, p) => sum + p.baseAmount, 0);
  const remainingBase = Math.max(0, totals.payableTotal - totalPaidSoFar);

  // If a custom share was chosen from Split Bill, use it, otherwise full remainder
  const activeBaseAmount = customAmount ? Math.min(customAmount, remainingBase) : remainingBase;

  // Calculate tip
  let activeTipAmount = 0;
  if (tipPercent > 0) {
    activeTipAmount = Number(((activeBaseAmount * tipPercent) / 100).toFixed(2));
  } else if (customTip) {
    activeTipAmount = Math.max(0, parseFloat(customTip) || 0);
  }

  const handleCashSettled = (tenderedAmount: number, change: number) => {
    recordPayment({
      orderId: currentOrder.id,
      amount: activeBaseAmount + activeTipAmount,
      baseAmount: activeBaseAmount,
      surchargeAmount: 0,
      tipAmount: activeTipAmount,
      paymentType: 'cash',
      tenderedCash: tenderedAmount,
      changeGiven: change,
      guestLabel,
    });
    onClose();
  };

  const handleEftposSuccess = (result: {
    paymentType: PaymentType;
    baseAmount: number;
    surchargeAmount: number;
    tipAmount: number;
    totalAmount: number;
    cardLast4: string;
    authCode: string;
  }) => {
    setIsEftposTerminalOpen(false);
    recordPayment({
      orderId: currentOrder.id,
      amount: result.totalAmount,
      baseAmount: result.baseAmount,
      surchargeAmount: result.surchargeAmount,
      tipAmount: result.tipAmount,
      paymentType: result.paymentType,
      cardLast4: result.cardLast4,
      authCode: result.authCode,
      guestLabel,
    });
    onClose();
  };

  const tipPresets = [
    { label: 'No Tip', val: 0 },
    { label: '5%', val: 5 },
    { label: '10%', val: 10 },
    { label: '15%', val: 15 },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              <span>Australian Payment Gateway</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {guestLabel ? `Pay ${guestLabel}` : 'Settle Bill'}
            </h2>
            <div className="text-3xl font-black font-mono text-emerald-400 mt-2">
              {formatAud(activeBaseAmount + activeTipAmount)}
            </div>
          </div>

          {/* Optional Gratuity / Tip Selector */}
          <div className="mb-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Hospitality Tip / Gratuity (Optional)</span>
              </span>
              {activeTipAmount > 0 && (
                <span className="text-xs font-mono font-bold text-amber-400">
                  +{formatAud(activeTipAmount)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {tipPresets.map(t => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setTipPercent(t.val);
                    setCustomTip('');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    tipPercent === t.val && !customTip
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => {
                sounds.playTap();
                setPaymentTab('card');
              }}
              className={`p-3 rounded-2xl border flex items-center justify-center space-x-2 transition ${
                paymentTab === 'card'
                  ? 'bg-sky-600 border-sky-500 text-white shadow-lg'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="font-bold text-xs">Australian EFTPOS / Card</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setPaymentTab('cash');
              }}
              className={`p-3 rounded-2xl border flex items-center justify-center space-x-2 transition ${
                paymentTab === 'cash'
                  ? 'bg-sky-600 border-sky-500 text-white shadow-lg'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span className="font-bold text-xs">Cash (AUD)</span>
            </button>
          </div>

          {/* View Content */}
          {paymentTab === 'card' && (
            <div className="space-y-4 text-center">
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs text-slate-400 block">
                  Tap to launch simulated Tyro/Smartpay EFTPOS terminal with card scheme surcharges
                </span>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setIsEftposTerminalOpen(true);
                  }}
                  className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-sky-950/60 transition active:scale-98 flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Launch EFTPOS Terminal ({formatAud(activeBaseAmount + activeTipAmount)})</span>
                </button>
              </div>
            </div>
          )}

          {paymentTab === 'cash' && (
            <CashPaymentView
              payableAmount={activeBaseAmount + activeTipAmount}
              onSettleCash={handleCashSettled}
            />
          )}
        </div>
      </div>

      {/* EFTPOS Terminal Simulation Popup */}
      {isEftposTerminalOpen && (
        <EftposTerminalModal
          isOpen={isEftposTerminalOpen}
          baseAmount={activeBaseAmount}
          tipAmount={activeTipAmount}
          venue={activeVenue}
          guestLabel={guestLabel}
          onClose={() => setIsEftposTerminalOpen(false)}
          onSuccess={handleEftposSuccess}
        />
      )}
    </>
  );
};
