import React, { useState } from 'react';
import { Percent, X, Check } from 'lucide-react';

import { usePos } from '../../context/PosContext';
import { formatAud } from '../../utils/formatters';
import { sounds } from '../../utils/sound';

export const DiscountModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { applyOrderDiscount, removeOrderDiscount, currentOrder } = usePos();
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState<string>('10');
  const [reason, setReason] = useState<string>('Staff Discount');

  if (!isOpen || !currentOrder) return null;

  const quickPresets = [
    { label: 'Staff Discount 20%', type: 'percent' as const, val: 20, reason: 'Staff 20%' },
    { label: 'Hospitality VIP 10%', type: 'percent' as const, val: 10, reason: 'VIP 10%' },
    { label: 'Senior / Pensioner 10%', type: 'percent' as const, val: 10, reason: 'Senior Card 10%' },
    { label: 'Manager Goodwill $10', type: 'fixed' as const, val: 10, reason: 'Manager Comp $10' },
    { label: 'Promo Voucher $5', type: 'fixed' as const, val: 5, reason: 'Promo Voucher $5' },
  ];

  const handleApplyPreset = (preset: typeof quickPresets[0]) => {
    sounds.playTap();
    applyOrderDiscount(preset.type, preset.val, preset.reason);
    onClose();
  };

  const handleCustomApply = () => {
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal <= 0) return;
    applyOrderDiscount(discountType, numVal, reason || 'Custom Discount');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/30">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Apply Order Discount</h2>
            <p className="text-xs text-slate-400">Australian standard hospitality concession / promo</p>
          </div>
        </div>

        {/* Current Active Discount */}
        {currentOrder.discount && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 block">{currentOrder.discount.reason}</span>
              <span className="text-[11px] text-slate-300">
                {currentOrder.discount.type === 'percent'
                  ? `${currentOrder.discount.value}% off subtotal`
                  : `-${formatAud(currentOrder.discount.value)} off`}
              </span>
            </div>
            <button
              onClick={() => {
                removeOrderDiscount();
                onClose();
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 bg-rose-500/10 rounded-lg border border-rose-500/20"
            >
              Remove
            </button>
          </div>
        )}

        {/* Quick Presets */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Presets</label>
          <div className="grid grid-cols-1 gap-2">
            {quickPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className="w-full bg-slate-800/80 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-slate-200 transition"
              >
                <span>{preset.label}</span>
                <span className="font-mono text-amber-400">
                  {preset.type === 'percent' ? `${preset.val}%` : `-${formatAud(preset.val)}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Discount Input */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Custom Discount</label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDiscountType('percent')}
              className={`p-2 rounded-xl text-xs font-bold border transition ${
                discountType === 'percent'
                  ? 'bg-sky-600 border-sky-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Percentage (%)
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('fixed')}
              className={`p-2 rounded-xl text-xs font-bold border transition ${
                discountType === 'fixed'
                  ? 'bg-sky-600 border-sky-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Fixed Dollar ($ AUD)
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              min="1"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Value"
              className="col-span-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono text-center focus:outline-none focus:border-sky-500"
            />
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason for discount"
              className="col-span-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCustomApply}
              className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition"
            >
              <Check className="w-4 h-4" />
              <span>Apply Custom</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
