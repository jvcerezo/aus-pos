import React from 'react';
import { ShieldCheck, DollarSign, Receipt } from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import { formatAud } from '../../utils/formatters';

export const BottomStatusBar: React.FC = () => {
  const { activeVenue } = useVenue();
  const { currentShift, allOrders, uiTheme } = usePos();

  const activeOrdersCount = allOrders.filter(o => !o.isPaid).length;
  const isLight = uiTheme === 'light';

  return (
    <footer
      className={`h-8 px-4 flex items-center justify-between text-[11px] select-none border-t transition-colors ${
        isLight
          ? 'bg-slate-100 border-slate-200 text-slate-500'
          : 'bg-slate-950 border-slate-800/80 text-slate-400'
      }`}
    >
      {/* Left: System Status & Compliance */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online Terminal 01</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 text-sky-500" />
          <span>ATO 10% GST Compliant</span>
        </div>

        <div className="hidden md:flex items-center space-x-1 font-mono opacity-80">
          <span>ABN: {activeVenue.abn}</span>
        </div>
      </div>

      {/* Right: Shift Stats & Active Orders */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Receipt className="w-3 h-3 text-amber-500" />
          <span>Active: <strong className={isLight ? 'text-slate-800' : 'text-white'}>{activeOrdersCount}</strong></span>
        </div>

        <div className="flex items-center space-x-1">
          <DollarSign className="w-3 h-3 text-emerald-500" />
          <span>Float: <strong className={isLight ? 'text-slate-800' : 'text-white'}>{formatAud(currentShift.openingFloat)}</strong></span>
        </div>

        <div className="hidden lg:flex items-center space-x-1">
          <span>Sales: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatAud(currentShift.totalGrossSales)}</strong></span>
        </div>
      </div>
    </footer>
  );
};
