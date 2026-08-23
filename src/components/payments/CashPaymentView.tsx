import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { formatAud } from '../../utils/formatters';

interface CashPaymentViewProps {
  payableAmount: number;
  onSettleCash: (tenderedAmount: number, change: number) => void;
}

export const CashPaymentView: React.FC<CashPaymentViewProps> = ({
  payableAmount,
  onSettleCash,
}) => {
  const [tendered, setTendered] = useState<number>(payableAmount);

  const australianNotes = [5, 10, 20, 50, 100];
  const change = Math.max(0, Number((tendered - payableAmount).toFixed(2)));
  const isSufficient = tendered >= payableAmount - 0.001;

  const handleNoteClick = (val: number) => {
    setTendered(val);
  };

  const handleConfirm = () => {
    if (!isSufficient) return;
    onSettleCash(tendered, change);
  };

  return (
    <div className="space-y-3">
      {/* Tendered Input & Change Box */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 block mb-0.5 font-bold uppercase">
            Tendered Cash ($ AUD)
          </span>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
              $
            </span>
            <input
              type="number"
              step="0.50"
              value={tendered || ''}
              onChange={e => setTendered(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-6 pr-2 py-1 font-mono font-black text-lg text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-center">
          <span className="text-[10px] text-slate-500 block font-bold uppercase">
            Change Due ($ AUD)
          </span>
          <span
            className={`font-mono font-black text-xl mt-0.5 ${
              isSufficient ? 'text-slate-900' : 'text-rose-600 text-sm'
            }`}
          >
            {isSufficient ? formatAud(change) : 'Insufficient'}
          </span>
        </div>
      </div>

      {/* Quick Australian Banknote Buttons */}
      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Australian Dollar Notes (AUD)
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {australianNotes.map(note => (
            <button
              key={note}
              type="button"
              onClick={() => handleNoteClick(note)}
              className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-xs text-slate-900 transition flex items-center justify-center"
            >
              ${note}
            </button>
          ))}
        </div>
      </div>

      {/* Exact Amount Button */}
      <button
        type="button"
        onClick={() => setTendered(payableAmount)}
        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-lg border border-slate-200 transition"
      >
        Exact Cash Tendered ({formatAud(payableAmount)})
      </button>

      {/* Settle Button */}
      <button
        disabled={!isSufficient}
        onClick={handleConfirm}
        className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm shadow-xs transition flex items-center justify-center space-x-1.5"
      >
        <Check className="w-4 h-4" />
        <span>Complete Cash Sale</span>
      </button>
    </div>
  );
};
