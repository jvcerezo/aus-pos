import React, { useState } from 'react';
import { Split, X, CreditCard } from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import { formatAud } from '../../utils/formatters';
import { calculateOrderTotals } from '../../utils/gst';
import { sounds } from '../../utils/sound';


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
    sounds.playTap();
    onPayShare(equalShareAmount, `Guest ${guestNum} of ${splitCount}`);
  };

  const handlePayCustomAmount = () => {
    const num = parseFloat(customAmount);
    if (isNaN(num) || num <= 0 || num > remainingBaseBalance + 0.05) {
      sounds.playError();
      return;
    }
    sounds.playTap();
    onPayShare(num, `Partial Split (${formatAud(num)})`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/30">
            <Split className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Australian Split Billing</h2>
            <p className="text-xs text-slate-400">Equal division or custom partial tender</p>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Remaining Bill Balance</span>
            <span className="text-2xl font-black font-mono text-emerald-400">
              {formatAud(remainingBaseBalance)}
            </span>
          </div>
          {totalPaidSoFar > 0 && (
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Already Paid</span>
              <span className="text-sm font-mono text-slate-300 font-bold">
                {formatAud(totalPaidSoFar)} ({currentOrder.splitPayments?.length} payments)
              </span>
            </div>
          )}
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={() => {
              sounds.playTap();
              setSplitMode('equal');
            }}
            className={`p-2.5 rounded-xl text-xs font-bold border transition ${
              splitMode === 'equal'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            Equal Split (N Ways)
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setSplitMode('custom');
            }}
            className={`p-2.5 rounded-xl text-xs font-bold border transition ${
              splitMode === 'custom'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            Custom Partial Amount ($)
          </button>
        </div>

        {/* EQUAL SPLIT VIEW */}
        {splitMode === 'equal' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Number of Ways:</label>
              <div className="flex items-center space-x-2">
                {[2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      sounds.playTap();
                      setSplitCount(num);
                    }}
                    className={`w-9 h-9 rounded-xl font-mono font-bold text-sm border transition ${
                      splitCount === num
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl text-center">
              <span className="text-xs text-indigo-300 block mb-1">
                Each guest pays ({splitCount} equal shares):
              </span>
              <span className="text-3xl font-black font-mono text-white">
                {formatAud(equalShareAmount)}
              </span>
            </div>

            {/* Individual Guest Pay Buttons */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {Array.from({ length: splitCount }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePayEqualShare(idx + 1)}
                  className="bg-slate-800 hover:bg-slate-700 p-3 rounded-2xl border border-slate-700 flex items-center justify-between text-left transition"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Guest {idx + 1}</span>
                    <span className="text-sm font-mono font-black text-emerald-400">
                      {formatAud(equalShareAmount)}
                    </span>
                  </div>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-lg font-semibold">
                    Pay Now
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOM SPLIT VIEW */}
        {splitMode === 'custom' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Enter Amount to Pay Now ($ AUD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-lg">
                  $
                </span>
                <input
                  type="number"
                  step="0.50"
                  max={remainingBaseBalance}
                  placeholder={`Max ${remainingBaseBalance.toFixed(2)}`}
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-8 pr-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 50, remainingBaseBalance].map((val, idx) => (
                <button
                  key={idx}
                  onClick={() => setCustomAmount(val.toFixed(2))}
                  className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-300 transition"
                >
                  {idx === 3 ? 'Full Remainder' : `$${val}`}
                </button>
              ))}
            </div>

            <button
              disabled={!customAmount || parseFloat(customAmount) <= 0}
              onClick={handlePayCustomAmount}
              className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-40 text-white py-3 rounded-2xl font-bold text-sm shadow-lg transition flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Payment for {customAmount ? formatAud(parseFloat(customAmount)) : '$0.00'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
