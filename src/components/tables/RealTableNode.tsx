import React from 'react';
import { Users } from 'lucide-react';
import type { RestaurantTable, TableStatus, TableShape } from '../../types';
import { formatAud, getElapsedMinutes } from '../../utils/formatters';

interface RealTableNodeProps {
  table: RestaurantTable;
  activeOrder?: any;
  orderTotals?: any;
  isLight: boolean;
  onClick: () => void;
}


export const RealTableNode: React.FC<RealTableNodeProps> = ({
  table,
  activeOrder,
  orderTotals,
  isLight,
  onClick,
}) => {
  const elapsed = table.openedAt ? getElapsedMinutes(table.openedAt) : null;
  const itemsCount = activeOrder ? activeOrder.items.reduce((s: number, i: any) => s + i.quantity, 0) : 0;

  // Visual status styles
  const getStatusVisuals = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return {
          tableBg: isLight ? 'bg-white border-emerald-400/80 text-slate-800' : 'bg-slate-900 border-emerald-500/60 text-white',
          chairBg: isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-slate-700',
          glow: 'hover:shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-500',
          badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          statusText: 'Open',
        };
      case 'occupied':
        return {
          tableBg: isLight ? 'bg-sky-50 border-sky-500 text-slate-900 shadow-md' : 'bg-sky-950/60 border-sky-400 text-white shadow-lg shadow-sky-950/60',
          chairBg: isLight ? 'bg-sky-200 border-sky-400' : 'bg-sky-700 border-sky-500',
          glow: 'ring-2 ring-sky-500/40',
          badge: 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/40',
          statusText: 'Dining',
        };
      case 'bill_printed':
        return {
          tableBg: isLight ? 'bg-amber-50 border-amber-500 text-slate-900 shadow-md' : 'bg-amber-950/60 border-amber-400 text-white shadow-lg shadow-amber-950/60',
          chairBg: isLight ? 'bg-amber-200 border-amber-400' : 'bg-amber-700 border-amber-500',
          glow: 'ring-2 ring-amber-500/50 animate-pulse',
          badge: 'bg-amber-500/25 text-amber-600 dark:text-amber-300 border-amber-500/40 font-bold',
          statusText: 'Bill Req',
        };
      case 'reserved':
        return {
          tableBg: isLight ? 'bg-purple-50 border-purple-400 text-slate-900' : 'bg-purple-950/60 border-purple-400 text-white',
          chairBg: isLight ? 'bg-purple-200 border-purple-300' : 'bg-purple-800 border-purple-700',
          glow: '',
          badge: 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/40',
          statusText: 'Reserved',
        };
      case 'cleaning':
        return {
          tableBg: isLight ? 'bg-slate-100 border-slate-300 text-slate-500' : 'bg-slate-900/60 border-slate-700 text-slate-400',
          chairBg: isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-slate-700',
          glow: '',
          badge: 'bg-slate-500/20 text-slate-500 border-slate-500/30',
          statusText: 'Cleaning',
        };
    }
  };

  const visuals = getStatusVisuals(table.status);

  // Render Realistic Chairs based on shape and capacity
  const renderChairs = (shape: TableShape, capacity: number) => {
    const chairSize = 'w-3.5 h-3.5 rounded-full border shadow-xs';

    if (shape === 'bar_stool') {
      return (
        <div className="absolute -inset-1.5 rounded-full border border-dashed border-slate-400/40 pointer-events-none" />
      );
    }

    if (shape === 'round') {
      // Radial chairs around the circle
      const chairCount = capacity;
      return (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: chairCount }).map((_, i) => {
            const angle = (i * 360) / chairCount;
            const rad = (angle * Math.PI) / 180;
            // Radius offset outside table
            const offset = 48; // % from center
            const x = 50 + offset * Math.cos(rad);
            const y = 50 + offset * Math.sin(rad);

            return (
              <div
                key={i}
                className={`absolute ${chairSize} ${visuals.chairBg} -translate-x-1/2 -translate-y-1/2 transition-colors`}
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            );
          })}
        </div>
      );
    }

    if (shape === 'square' || shape === 'rectangle') {
      // Top and bottom chairs
      const chairsPerRow = Math.max(1, Math.floor(capacity / 2));
      return (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Chairs */}
          <div className="absolute -top-2.5 left-0 right-0 flex justify-around px-2">
            {Array.from({ length: chairsPerRow }).map((_, i) => (
              <div key={`t-${i}`} className={`${chairSize} rounded-t-lg rounded-b-xs ${visuals.chairBg}`} />
            ))}
          </div>

          {/* Bottom Chairs */}
          <div className="absolute -bottom-2.5 left-0 right-0 flex justify-around px-2">
            {Array.from({ length: chairsPerRow }).map((_, i) => (
              <div key={`b-${i}`} className={`${chairSize} rounded-b-lg rounded-t-xs ${visuals.chairBg}`} />
            ))}
          </div>
        </div>
      );
    }

    if (shape === 'booth') {
      // U-shape booth curved backrest
      return (
        <div className="absolute -inset-2 rounded-2xl border-4 border-amber-600/40 bg-amber-950/10 pointer-events-none -z-10" />
      );
    }

    return null;
  };

  // Dimensions & Geometry per Shape
  const getShapeStyles = (shape: TableShape) => {
    switch (shape) {
      case 'round':
        return 'w-24 h-24 sm:w-28 sm:h-28 rounded-full';
      case 'square':
        return 'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl';
      case 'rectangle':
        return 'w-36 h-24 sm:w-44 sm:h-28 rounded-2xl';
      case 'booth':
        return 'w-32 h-26 sm:w-36 sm:h-28 rounded-xl';
      case 'bar_stool':
        return 'w-16 h-16 sm:w-18 sm:h-18 rounded-full';
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        left: `${table.x}%`,
        top: `${table.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`absolute z-10 select-none cursor-pointer group transition-all duration-200 hover:scale-105 active:scale-95`}
    >
      {/* Surrounding Realistic Chairs */}
      {renderChairs(table.shape, table.capacity)}

      {/* Main Tabletop Node */}
      <div
        className={`relative flex flex-col items-center justify-center p-2 text-center border-2 transition-all shadow-md ${getShapeStyles(
          table.shape
        )} ${visuals.tableBg} ${visuals.glow}`}
      >
        {/* Table Number & Status */}
        <div className="flex items-center space-x-1">
          <span className="font-black text-sm sm:text-base tracking-tight leading-none">
            {table.name}
          </span>
        </div>

        {/* Dynamic Inner Info: Dining vs Available */}
        {activeOrder ? (
          <div className="mt-1 flex flex-col items-center leading-tight">
            <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">
              {formatAud(orderTotals?.payableTotal || 0)}
            </span>
            <div className="flex items-center space-x-1 text-[10px] opacity-70 mt-0.5">
              <span>{itemsCount} itm</span>
              {elapsed !== null && (
                <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">
                  • {elapsed}m
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-0.5 flex flex-col items-center">
            <span className="text-[10px] opacity-60 font-semibold flex items-center gap-0.5">
              <Users className="w-2.5 h-2.5" />
              <span>{table.capacity}p</span>
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 border ${visuals.badge}`}>
              {visuals.statusText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
