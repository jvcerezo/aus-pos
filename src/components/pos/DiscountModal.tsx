import React, { useState } from 'react';
import { Percent, X } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { formatAud } from '../../utils/formatters';

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center border border-slate-200">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Apply Order Discount</h2>
            <p className="text-xs text-slate-500">Concession / Promo voucher</p>
          </div>
        </div>

        {/* Current Active Discount */}
        {currentOrder.discount && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-900">
                Active: {currentOrder.discount.reason} (
                {currentOrder.discount.type === 'percent'
                  ? `${currentOrder.discount.value}%`
                  : formatAud(currentOrder.discount.value)}
                )
              </div>
            </div>
            <button
              onClick={() => {
                removeOrderDiscount();
                onClose();
              }}
              className="text-xs font-bold text-rose-700 hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        {/* Quick Presets */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Quick Presets
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {quickPresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-xs font-bold text-slate-800 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Discount Form */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Custom Amount
          </span>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setDiscountType('percent')}
              className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                discountType === 'percent'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              Percentage (%)
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('fixed')}
              className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                discountType === 'fixed'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              Fixed Dollar ($)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {discountType === 'percent' ? 'Discount %' : 'Amount ($ AUD)'}
              </label>
              <input
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Reason / Note</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. VIP Card"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCustomApply}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-bold shadow-xs transition"
          >
            Apply Discount
          </button>
        </div>
      </div>
    </div>
  );
};
