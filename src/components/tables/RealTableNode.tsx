import React from 'react';
import { Users } from 'lucide-react';
import type { RestaurantTable, TableStatus, TableShape } from '../../types';
import { formatAud, getElapsedMinutes } from '../../utils/formatters';

interface RealTableNodeProps {
  table: RestaurantTable;
  activeOrder?: any;
  orderTotals?: any;
  onClick: () => void;
}

export const RealTableNode: React.FC<RealTableNodeProps> = ({
  table,
  activeOrder,
  orderTotals,
  onClick,
}) => {
  const elapsed = table.openedAt ? getElapsedMinutes(table.openedAt) : null;
  const itemsCount = activeOrder ? activeOrder.items.reduce((s: number, i: any) => s + i.quantity, 0) : 0;

  // Authentic Lightspeed / Toast Table Styles (Clean, flat, high contrast)
  const getStatusVisuals = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return {
          tableBg: 'bg-white border-2 border-emerald-500 text-slate-900 shadow-sm',
          chairBg: 'bg-slate-300 border border-slate-400',
          badge: 'bg-emerald-100 text-emerald-800',
          statusText: 'Open',
        };
      case 'occupied':
        return {
          tableBg: 'bg-sky-100 border-2 border-sky-600 text-slate-900 shadow-sm',
          chairBg: 'bg-sky-400 border border-sky-600',
          badge: 'bg-sky-200 text-sky-900 font-bold',
          statusText: 'Dining',
        };
      case 'bill_printed':
        return {
          tableBg: 'bg-amber-100 border-2 border-amber-600 text-slate-900 shadow-sm',
          chairBg: 'bg-amber-400 border border-amber-600',
          badge: 'bg-amber-200 text-amber-900 font-bold',
          statusText: 'Bill Req',
        };
      case 'reserved':
        return {
          tableBg: 'bg-purple-100 border-2 border-purple-500 text-slate-900 shadow-sm',
          chairBg: 'bg-purple-300 border border-purple-400',
          badge: 'bg-purple-200 text-purple-900',
          statusText: 'Reserved',
        };
      case 'cleaning':
        return {
          tableBg: 'bg-slate-100 border-2 border-slate-400 text-slate-600',
          chairBg: 'bg-slate-300 border border-slate-400',
          badge: 'bg-slate-200 text-slate-700',
          statusText: 'Bussing',
        };
    }
  };

  const visuals = getStatusVisuals(table.status);

  // Render Realistic Chairs based on shape and capacity
  const renderChairs = (shape: TableShape, capacity: number) => {
    const chairClass = `w-3.5 h-3.5 rounded-full ${visuals.chairBg}`;

    if (shape === 'bar_stool') {
      return (
        <div className="absolute -inset-1 rounded-full border border-slate-400/40 pointer-events-none" />
      );
    }

    if (shape === 'round') {
      const chairCount = capacity;
      return (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: chairCount }).map((_, i) => {
            const angle = (i * 360) / chairCount;
            const rad = (angle * Math.PI) / 180;
            const offset = 48; // % from center
            const x = 50 + offset * Math.cos(rad);
            const y = 50 + offset * Math.sin(rad);

            return (
              <div
                key={i}
                className={`absolute ${chairClass} -translate-x-1/2 -translate-y-1/2`}
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            );
          })}
        </div>
      );
    }

    if (shape === 'square' || shape === 'rectangle') {
      const chairsPerRow = Math.max(1, Math.floor(capacity / 2));
      return (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-2.5 left-0 right-0 flex justify-around px-2">
            {Array.from({ length: chairsPerRow }).map((_, i) => (
              <div key={`t-${i}`} className={`${chairClass} rounded-t-sm rounded-b-none`} />
            ))}
          </div>

          <div className="absolute -bottom-2.5 left-0 right-0 flex justify-around px-2">
            {Array.from({ length: chairsPerRow }).map((_, i) => (
              <div key={`b-${i}`} className={`${chairClass} rounded-b-sm rounded-t-none`} />
            ))}
          </div>
        </div>
      );
    }

    if (shape === 'booth') {
      return (
        <div className="absolute -inset-2 rounded-2xl border-2 border-amber-800/40 bg-amber-100/40 pointer-events-none -z-10" />
      );
    }

    return null;
  };

  // Dimensions per Shape
  const getShapeStyles = (shape: TableShape) => {
    switch (shape) {
      case 'round':
        return 'w-24 h-24 sm:w-28 sm:h-28 rounded-full';
      case 'square':
        return 'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl';
      case 'rectangle':
        return 'w-36 h-24 sm:w-44 sm:h-28 rounded-2xl';
      case 'booth':
        return 'w-32 h-24 sm:w-38 sm:h-28 rounded-xl';
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
      className="absolute z-10 select-none cursor-pointer group transition-transform duration-100 active:scale-95"
    >
      {renderChairs(table.shape, table.capacity)}

      <div
        className={`relative flex flex-col items-center justify-center p-2 text-center transition-all ${getShapeStyles(
          table.shape
        )} ${visuals.tableBg}`}
      >
        <div className="font-black text-base sm:text-lg tracking-tight leading-none text-slate-900">
          {table.name}
        </div>

        {activeOrder ? (
          <div className="mt-1 flex flex-col items-center leading-tight">
            <span className="font-mono font-black text-sm text-slate-900">
              {formatAud(orderTotals?.payableTotal || 0)}
            </span>
            <div className="flex items-center space-x-1 text-xs text-slate-700 mt-0.5 font-bold">
              <span>{itemsCount} itm</span>
              {elapsed !== null && (
                <span className="font-mono font-bold text-amber-900">
                  • {elapsed}m
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-1 flex flex-col items-center">
            <span className="text-xs text-slate-700 font-bold flex items-center gap-0.5">
              <Users className="w-3 h-3" />
              <span>{table.capacity}p</span>
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${visuals.badge}`}>
              {visuals.statusText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
