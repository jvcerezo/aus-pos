import React, { useState } from 'react';
import {
  ShoppingBag,
  Map,
  LayoutGrid
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import type { RestaurantTable } from '../../types';
import { INITIAL_LANDMARKS } from '../../data/initialTables';
import { formatAud, getElapsedMinutes } from '../../utils/formatters';
import { calculateOrderTotals } from '../../utils/gst';
import { sounds } from '../../utils/sound';
import { TableTransferModal } from './TableTransferModal';
import { RealTableNode } from './RealTableNode';

export const TableMapScreen: React.FC = () => {
  const { activeVenue } = useVenue();
  const {
    sections,
    tables,
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
  const venueLandmarks = INITIAL_LANDMARKS.filter(l => l.venueId === activeVenue.id);

  const filteredTables = selectedSectionId === 'all'
    ? venueTables
    : venueTables.filter(t => t.sectionId === selectedSectionId);

  const handleTableNodeClick = (table: RestaurantTable) => {
    sounds.playTap();
    openTableOrder(table);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.25rem)] bg-slate-100 overflow-hidden select-none">
      {/* Top Floor Bar: Sections & View Toggle */}
      <div className="p-2.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
        {/* Section Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5">
          <button
            onClick={() => {
              sounds.playTap();
              setSelectedSectionId('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              selectedSectionId === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
            }`}
          >
            All Floor Areas ({venueTables.length})
          </button>

          {venueSections.map(sec => {
            const count = venueTables.filter(t => t.sectionId === sec.id).length;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  sounds.playTap();
                  setSelectedSectionId(sec.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
                  selectedSectionId === sec.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                }`}
              >
                {sec.name} ({count})
              </button>
            );
          })}
        </div>

        {/* View Toggle & New Counter Order */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-300">
            <button
              onClick={() => {
                sounds.playTap();
                setViewMode('blueprint');
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                viewMode === 'blueprint'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Floor Plan</span>
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setViewMode('grid');
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              startNewTakeawayOrder();
            }}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Counter Order</span>
          </button>
        </div>
      </div>

      {/* Main Floor Plan Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {viewMode === 'blueprint' ? (
          /* AUTHENTIC 2D ARCHITECTURAL FLOOR CANVAS */
          <div className="flex-1 relative overflow-auto p-4 flex items-center justify-center bg-slate-200/60">
            <div
              className="relative w-full max-w-5xl aspect-[16/10] min-h-[500px] bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden"
              style={{
                backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              {/* Floor Plan Zone Dividers */}
              {/* Bar Lounge */}
              <div className="absolute top-0 bottom-0 left-0 w-[30%] border-r border-dashed border-amber-300 bg-amber-50/30 p-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  🍸 Bar & Stools
                </span>
              </div>

              {/* Main Dining */}
              <div className="absolute top-0 bottom-0 left-[30%] right-[25%] bg-slate-50/40 p-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  🍽️ Main Dining
                </span>
              </div>

              {/* Ocean Deck */}
              <div className="absolute top-0 bottom-0 right-0 w-[25%] border-l border-dashed border-teal-300 bg-teal-50/40 p-2 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  🌊 Terrace Deck
                </span>
              </div>

              {/* Landmarks */}
              {venueLandmarks.map(lm => {
                return (
                  <div
                    key={lm.id}
                    style={{
                      left: `${lm.x}%`,
                      top: `${lm.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="absolute z-0 px-2.5 py-1 rounded bg-slate-800 text-white text-[10px] font-bold shadow-xs pointer-events-none"
                  >
                    {lm.label}
                  </div>
                );
              })}

              {/* Table Nodes */}
              {filteredTables.map(table => {
                const activeOrder = allOrders.find(o => o.tableId === table.id && !o.isPaid);
                const totals = activeOrder ? calculateOrderTotals(activeOrder, activeVenue) : null;

                return (
                  <RealTableNode
                    key={table.id}
                    table={table}
                    activeOrder={activeOrder}
                    orderTotals={totals}
                    onClick={() => handleTableNodeClick(table)}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-w-5xl mx-auto">
              {filteredTables.map(table => {
                const activeOrder = allOrders.find(o => o.tableId === table.id && !o.isPaid);
                const totals = activeOrder ? calculateOrderTotals(activeOrder, activeVenue) : null;
                const elapsed = table.openedAt ? getElapsedMinutes(table.openedAt) : null;

                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableNodeClick(table)}
                    className="p-3 rounded-xl border border-b-2 text-left flex flex-col justify-between transition active:translate-y-0.5 min-h-[120px] bg-white border-slate-200 shadow-xs hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-lg font-black text-slate-900">{table.name}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{table.shape}</span>
                    </div>

                    {activeOrder ? (
                      <div className="my-1">
                        <span className="font-mono font-black text-slate-900 text-sm block">
                          {formatAud(totals?.payableTotal || 0)}
                        </span>
                        {elapsed !== null && (
                          <span className="text-[10px] text-amber-700 font-mono">
                            ⏱ {elapsed}m seated
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="my-1 text-xs text-emerald-700 font-semibold">
                        {table.capacity}p • Available
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 font-bold uppercase">
                      {sections.find(s => s.id === table.sectionId)?.name}
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
