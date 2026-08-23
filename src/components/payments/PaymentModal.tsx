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
  const [customTip] = useState<string>('');
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
      <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-5">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
              <Receipt className="w-3.5 h-3.5 text-slate-600" />
              <span>Payment Gateway</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {guestLabel ? `Pay ${guestLabel}` : 'Settle Amount'}
            </h2>
            <div className="text-3xl font-black font-mono text-slate-900 mt-1">
              {formatAud(activeBaseAmount + activeTipAmount)}
            </div>
          </div>

          {/* Optional Gratuity / Tip Selector */}
          <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Tip / Gratuity (Optional)</span>
              </span>
              {activeTipAmount > 0 && (
                <span className="text-xs font-mono font-bold text-slate-900">
                  +{formatAud(activeTipAmount)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {tipPresets.map(t => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setTipPercent(t.val);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                    tipPercent === t.val
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => {
                sounds.playTap();
                setPaymentTab('card');
              }}
              className={`p-2.5 rounded-xl border flex items-center justify-center space-x-2 transition ${
                paymentTab === 'card'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="font-bold text-xs">Australian EFTPOS</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setPaymentTab('cash');
              }}
              className={`p-2.5 rounded-xl border flex items-center justify-center space-x-2 transition ${
                paymentTab === 'cash'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span className="font-bold text-xs">Cash Tender</span>
            </button>
          </div>

          {/* Active Payment Content */}
          {paymentTab === 'card' ? (
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Base Charge:</span>
                  <span className="font-mono font-bold text-slate-900">{formatAud(activeBaseAmount)}</span>
                </div>
                {activeTipAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tip:</span>
                    <span className="font-mono font-bold text-slate-900">+{formatAud(activeTipAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                  <span>EFTPOS Scheme Surcharge:</span>
                  <span>+{activeVenue.surcharges.cardSurchargeEftpos}%</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsEftposTerminalOpen(true);
                }}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-xl font-bold text-sm shadow-xs transition flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Launch EFTPOS Terminal</span>
              </button>
            </div>
          ) : (
            <CashPaymentView
              payableAmount={activeBaseAmount + activeTipAmount}
              onSettleCash={handleCashSettled}
            />
          )}
        </div>
      </div>

      {/* EFTPOS Terminal Modal */}
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
