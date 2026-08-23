import React, { useState } from 'react';
import {
  ShoppingBag,
  Map,
  LayoutGrid
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import type { RestaurantTable } from '../../types';
import { formatAud } from '../../utils/formatters';
import { calculateOrderTotals } from '../../utils/gst';
import { sounds } from '../../utils/sound';
import { TableTransferModal } from './TableTransferModal';
import { RealTableNode } from './RealTableNode';

export const TableMapScreen: React.FC = () => {
  const { activeVenue } = useVenue();
  const {
    sections,
    tables,
    landmarks,
    allOrders,
    openTableOrder,
    startNewTakeawayOrder,
  } = usePos();

  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'blueprint' | 'grid'>('blueprint');
  const [transferSourceTable, setTransferSourceTable] = useState<RestaurantTable | null>(null);

  // Filter sections, landmarks, and tables for active venue
  const venueSections = sections.filter(s => s.venueId === activeVenue.id);
  const venueTables = tables.filter(t => t.venueId === activeVenue.id);
  const venueLandmarks = landmarks.filter(l => l.venueId === activeVenue.id);

  const filteredTables = selectedSectionId === 'all'
    ? venueTables
    : venueTables.filter(t => t.sectionId === selectedSectionId);

  const handleTableNodeClick = (table: RestaurantTable) => {
    sounds.playTap();
    openTableOrder(table);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.75rem)] bg-slate-100 overflow-hidden select-none">
      {/* Top Floor Bar: Sections & View Toggle (Larger Text) */}
      <div className="p-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        {/* Section Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => {
              sounds.playTap();
              setSelectedSectionId('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-sm font-bold transition border ${
              selectedSectionId === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
            }`}
          >
            All Floor Areas ({venueTables.length})
          </button>

          {venueSections.map(s => {
            const count = venueTables.filter(t => t.sectionId === s.id).length;
            const occupied = venueTables.filter(t => t.sectionId === s.id && t.status !== 'available').length;

            return (
              <button
                key={s.id}
                onClick={() => {
                  sounds.playTap();
                  setSelectedSectionId(s.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition border flex items-center space-x-2 ${
                  selectedSectionId === s.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                }`}
              >
                <span>{s.name}</span>
                <span className="font-mono text-xs opacity-75">
                  ({occupied}/{count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Takeaway + View Switcher */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              sounds.playTap();
              startNewTakeawayOrder();
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>+ Counter / Bar Order</span>
          </button>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                sounds.playTap();
                setViewMode('blueprint');
              }}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'blueprint'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="2D Floor Blueprint"
            >
              <Map className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setViewMode('grid');
              }}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Touch Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Floor Canvas */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        {viewMode === 'blueprint' ? (
          /* 2D Architectural Floor Plan */
          <div className="w-[1020px] h-[680px] bg-white rounded-3xl border-2 border-slate-300 relative shadow-md overflow-hidden shrink-0">
            {/* Subtle Blueprint Grid Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#64748b 1px, transparent 1px), radial-gradient(#64748b 1px, #ffffff 1px)',
                backgroundSize: '28px 28px',
                backgroundPosition: '0 0, 14px 14px',
              }}
            />

            {/* Architectural Landmarks */}
            {venueLandmarks.map(lm => (
              <div
                key={lm.id}
                style={{
                  left: `${lm.x}%`,
                  top: `${lm.y}%`,
                  width: `${lm.width || 120}px`,
                  height: `${lm.height || 40}px`,
                }}
                className="absolute z-0 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-wider text-slate-600 shadow-xs select-none"
              >
                {lm.label}
              </div>
            ))}

            {/* Interactive Physical Tables */}
            {filteredTables.map(table => {
              const activeOrder = allOrders.find(o => o.tableId === table.id && !o.isPaid);
              const orderTotals = activeOrder ? calculateOrderTotals(activeOrder, activeVenue) : null;

              return (
                <RealTableNode
                  key={table.id}
                  table={table}
                  activeOrder={activeOrder}
                  orderTotals={orderTotals}
                  onClick={() => handleTableNodeClick(table)}
                />
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="w-full max-w-6xl h-full overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredTables.map(table => {
                const activeOrder = allOrders.find(o => o.tableId === table.id && !o.isPaid);
                const orderTotals = activeOrder ? calculateOrderTotals(activeOrder, activeVenue) : null;

                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableNodeClick(table)}
                    className={`p-4 rounded-2xl border-2 text-left transition transform active:scale-95 shadow-xs flex flex-col justify-between min-h-[120px] ${
                      table.status === 'available'
                        ? 'bg-white border-emerald-500 hover:border-emerald-600'
                        : table.status === 'occupied'
                        ? 'bg-sky-50 border-sky-600'
                        : 'bg-amber-50 border-amber-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-black text-lg text-slate-900 font-mono">
                        {table.name}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                          table.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : table.status === 'occupied'
                            ? 'bg-sky-100 text-sky-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {table.status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                      <span>Capacity: {table.capacity}p</span>
                      {orderTotals && (
                        <span className="font-mono font-black text-sm text-slate-900">
                          {formatAud(orderTotals.payableTotal)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Table Transfer Modal */}
      {transferSourceTable && (
        <TableTransferModal
          sourceTable={transferSourceTable}
          onClose={() => setTransferSourceTable(null)}
        />
      )}
    </div>
  );
};
