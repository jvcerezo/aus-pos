import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { formatAud } from '../../utils/formatters';
import { sounds } from '../../utils/sound';

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
    sounds.playTap();
    setTendered(val);
  };


  const handleConfirm = () => {
    if (!isSufficient) {
      sounds.playError();
      return;
    }
    sounds.playTap();
    onSettleCash(tendered, change);
  };

  return (
    <div className="space-y-4">
      {/* Tendered Input & Change Box */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1 font-semibold uppercase">
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-6 pr-3 py-1.5 font-mono font-black text-xl text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-center">
          <span className="text-[11px] text-slate-400 block font-semibold uppercase">
            Change Due ($ AUD)
          </span>
          <span
            className={`font-mono font-black text-2xl mt-0.5 ${
              isSufficient ? 'text-emerald-400' : 'text-rose-400 text-lg'
            }`}
          >
            {isSufficient ? formatAud(change) : 'Insufficient'}
          </span>
        </div>
      </div>

      {/* Quick Australian Banknote Buttons */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Australian Dollar Notes (AUD)
        </label>
        <div className="grid grid-cols-5 gap-2">
          {australianNotes.map(note => (
            <button
              key={note}
              type="button"
              onClick={() => handleNoteClick(note)}
              className={`py-3 rounded-2xl font-mono font-black text-sm border transition flex flex-col items-center justify-center ${
                note === 5
                  ? 'bg-purple-950/40 border-purple-800/80 text-purple-300 hover:bg-purple-900/60'
                  : note === 10
                  ? 'bg-sky-950/40 border-sky-800/80 text-sky-300 hover:bg-sky-900/60'
                  : note === 20
                  ? 'bg-red-950/40 border-red-800/80 text-red-300 hover:bg-red-900/60'
                  : note === 50
                  ? 'bg-amber-950/40 border-amber-800/80 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60'
              }`}
            >
              <span>${note}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Exact Amount Button */}
      <button
        type="button"
        onClick={() => {
          sounds.playTap();
          setTendered(payableAmount);
        }}
        className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-300 rounded-xl border border-slate-700 transition"
      >
        Exact Cash Tendered ({formatAud(payableAmount)})
      </button>

      {/* Settle Button */}
      <button
        disabled={!isSufficient}
        onClick={handleConfirm}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-emerald-950/50 transition flex items-center justify-center space-x-2"
      >
        <Check className="w-5 h-5" />
        <span>Complete Cash Sale & Open Drawer</span>
      </button>
    </div>
  );
};
