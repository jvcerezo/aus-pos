import React, { useState } from 'react';
import { Split, X, CreditCard } from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import { formatAud } from '../../utils/formatters';
import { calculateOrderTotals } from '../../utils/gst';

export const SplitBillModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onPayShare: (amount: number, label: string) => void;
}> = ({ isOpen, onClose, onPayShare }) => {
  const { activeVenue } = useVenue();
  const { currentOrder } = usePos();

  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
  const [splitCount, setSplitCount] = useState<number>(2);
  const [customAmount, setCustomAmount] = useState<string>('');

  if (!isOpen || !currentOrder) return null;

  const totals = calculateOrderTotals(currentOrder, activeVenue);
  const totalPaidSoFar = (currentOrder.splitPayments || []).reduce((sum, p) => sum + p.baseAmount, 0);
  const remainingBaseBalance = Math.max(0, totals.discountedSubtotal - totalPaidSoFar);

  const equalShareAmount = Number((remainingBaseBalance / splitCount).toFixed(2));

  const handlePayEqualShare = (guestNum: number) => {
    onPayShare(equalShareAmount, `Guest ${guestNum} of ${splitCount}`);
  };

  const handlePayCustomAmount = () => {
    const num = parseFloat(customAmount);
    if (isNaN(num) || num <= 0 || num > remainingBaseBalance + 0.05) {
      return;
    }
    onPayShare(num, `Partial Split (${formatAud(num)})`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center border border-slate-200">
            <Split className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Split Bill</h2>
            <p className="text-xs text-slate-500">Equal divide or custom partial payment</p>
          </div>
        </div>

        {/* Balance Status Banner */}
        <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block">Remaining Bill Balance:</span>
            <span className="text-2xl font-black font-mono text-slate-900">
              {formatAud(remainingBaseBalance)}
            </span>
          </div>
          {totalPaidSoFar > 0 && (
            <div className="text-right">
              <span className="text-slate-500 block">Paid So Far:</span>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {formatAud(totalPaidSoFar)}
              </span>
            </div>
          )}
        </div>

        {/* Split Mode Selector */}
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          <button
            type="button"
            onClick={() => setSplitMode('equal')}
            className={`py-2 rounded-xl text-xs font-bold border transition ${
              splitMode === 'equal'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Equal Split (N-Ways)
          </button>
          <button
            type="button"
            onClick={() => setSplitMode('custom')}
            className={`py-2 rounded-xl text-xs font-bold border transition ${
              splitMode === 'custom'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Custom Partial Payment
          </button>
        </div>

        {/* Mode 1: Equal Split */}
        {splitMode === 'equal' ? (
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Number of Guests Sharing:
              </span>
              <div className="flex items-center space-x-1.5">
                {[2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSplitCount(num)}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold border transition ${
                      splitCount === num
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {num}p
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Guest Cards */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {Array.from({ length: splitCount }).map((_, idx) => {
                const guestNum = idx + 1;
                const paid = (currentOrder.splitPayments || []).find(
                  p => p.guestLabel === `Guest ${guestNum} of ${splitCount}`
                );

                return (
                  <div
                    key={guestNum}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Guest {guestNum}
                      </span>
                      <div className="text-xs font-mono font-bold text-slate-900">
                        {formatAud(equalShareAmount)}
                      </div>
                    </div>

                    {paid ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        Paid
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePayEqualShare(guestNum)}
                        className="flex items-center space-x-1 bg-[#10b981] hover:bg-[#059669] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay {formatAud(equalShareAmount)}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Mode 2: Custom Amount */
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Enter Custom Partial Payment ($ AUD)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-lg font-mono font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handlePayCustomAmount}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold shadow-xs transition"
            >
              Proceed with Partial Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
