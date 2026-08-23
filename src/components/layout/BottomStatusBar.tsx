import React from 'react';
import { ShieldCheck, DollarSign, Receipt } from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import { formatAud } from '../../utils/formatters';

export const BottomStatusBar: React.FC = () => {
  const { activeVenue } = useVenue();
  const { currentShift, allOrders } = usePos();

  const activeOrdersCount = allOrders.filter(o => !o.isPaid).length;

  return (
    <footer className="h-7 bg-slate-900 text-slate-400 border-t border-slate-800 px-3 flex items-center justify-between text-[11px] select-none">
      {/* Left: Terminal status & ATO compliance */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Terminal 01 (Online)</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1 text-slate-400">
          <ShieldCheck className="w-3 h-3 text-slate-400" />
          <span>ATO 10% GST Compliant</span>
        </div>

        <div className="hidden md:flex items-center space-x-1 font-mono text-slate-400">
          <span>ABN: {activeVenue.abn}</span>
        </div>
      </div>

      {/* Right: Shift Stats */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Receipt className="w-3 h-3 text-slate-400" />
          <span>Active Orders: <strong className="text-slate-200">{activeOrdersCount}</strong></span>
        </div>

        <div className="flex items-center space-x-1">
          <DollarSign className="w-3 h-3 text-slate-400" />
          <span>Float: <strong className="text-slate-200">{formatAud(currentShift.openingFloat)}</strong></span>
        </div>

        <div className="hidden lg:flex items-center space-x-1 font-mono">
          <span>Shift Gross: <strong className="text-slate-200">{formatAud(currentShift.totalGrossSales)}</strong></span>
        </div>
      </div>
    </footer>
  );
};
