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
    uiTheme,
  } = usePos();

  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'blueprint' | 'grid'>('blueprint');
  const [transferSourceTable, setTransferSourceTable] = useState<RestaurantTable | null>(null);

  const isLight = uiTheme === 'light';

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
    <div
      className={`flex-1 flex flex-col h-[calc(100vh-6.25rem)] overflow-hidden select-none transition-colors ${
        isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-white'
      }`}
    >
      {/* Top Controls: Sections, View Mode & Counter Order */}
      <div className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Section Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => {
              sounds.playTap();
              setSelectedSectionId('all');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition border ${
              selectedSectionId === 'all'
                ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                : isLight
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700'
            }`}
          >
            Full Floor Map ({venueTables.length})
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
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition whitespace-nowrap border ${
                  selectedSectionId === sec.id
                    ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700'
                }`}
              >
                {sec.name} ({count})
              </button>
            );
          })}
        </div>

        {/* View Mode & Takeaway Button */}
        <div className="flex items-center space-x-2.5">
          {/* Blueprint vs Grid Toggle */}
          <div className={`flex items-center p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => {
                sounds.playTap();
                setViewMode('blueprint');
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'blueprint'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>2D Floor Plan</span>
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setViewMode('grid');
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              startNewTakeawayOrder();
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Counter Order</span>
          </button>
        </div>
      </div>

      {/* Main Floor Canvas / Grid Container */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {viewMode === 'blueprint' ? (
          /* ========================================================= */
          /* REAL 2D ARCHITECTURAL RESTAURANT FLOOR CANVAS             */
          /* ========================================================= */
          <div className="flex-1 relative overflow-auto p-6 flex items-center justify-center">
            {/* Restaurant Floor Boundary Canvas */}
            <div
              className={`relative w-full max-w-6xl aspect-[16/10] min-h-[560px] rounded-3xl border-4 shadow-2xl overflow-hidden transition-colors ${
                isLight
                  ? 'bg-[#f8fafc] border-slate-300'
                  : 'bg-[#090d16] border-slate-800'
              }`}
              style={{
                backgroundImage: isLight
                  ? 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)'
                  : 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              {/* Floor Zone Markings / Architectural Dividers */}
              {/* 1. Bar Lounge Zone (Left) */}
              <div className="absolute top-0 bottom-0 left-0 w-[30%] border-r-2 border-dashed border-amber-500/20 bg-amber-500/[0.02]">
                <div className="p-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500/60 block">
                    🍸 Bar & High-Top Lounge
                  </span>
                </div>
              </div>

              {/* 2. Main Dining Room (Center) */}
              <div className="absolute top-0 bottom-0 left-[30%] right-[25%] bg-sky-500/[0.01]">
                <div className="p-3 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-500/60 block">
                    🍽️ Main Dining Hall
                  </span>
                </div>
              </div>

              {/* 3. Ocean Terrace / Deck (Right) */}
              <div className="absolute top-0 bottom-0 right-0 w-[25%] border-l-2 border-dashed border-teal-500/25 bg-teal-500/[0.03]">
                <div className="p-3 text-right">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-500/70 block">
                    🌊 Alfresco Deck & Balcony
                  </span>
                </div>
              </div>

              {/* Render Architectural Landmarks */}
              {venueLandmarks.map(lm => {
                let badgeStyle = 'bg-slate-800/80 border-slate-700 text-slate-300';
                if (lm.type === 'kitchen') badgeStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-400 font-bold';
                if (lm.type === 'bar') badgeStyle = 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold';
                if (lm.type === 'entrance') badgeStyle = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold';
                if (lm.type === 'terrace_view') badgeStyle = 'bg-sky-500/20 border-sky-500/40 text-sky-400 font-bold';

                return (
                  <div
                    key={lm.id}
                    style={{
                      left: `${lm.x}%`,
                      top: `${lm.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-0 px-3 py-1.5 rounded-xl border text-[11px] font-mono shadow-sm pointer-events-none ${badgeStyle}`}
                  >
                    {lm.label}
                  </div>
                );
              })}

              {/* Render All Tables as Realistic Physical Table Nodes with Chairs */}
              {filteredTables.map(table => {
                const activeOrder = allOrders.find(o => o.tableId === table.id && !o.isPaid);
                const totals = activeOrder ? calculateOrderTotals(activeOrder, activeVenue) : null;

                return (
                  <RealTableNode
                    key={table.id}
                    table={table}
                    activeOrder={activeOrder}
                    orderTotals={totals}
                    isLight={isLight}
                    onClick={() => handleTableNodeClick(table)}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* GRID VIEW LIST                                            */
          /* ========================================================= */
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 max-w-6xl mx-auto">
              {filteredTables.map(table => {
                const activeOrder = allOrders.find(o => o.tableId === table.id && !o.isPaid);
                const totals = activeOrder ? calculateOrderTotals(activeOrder, activeVenue) : null;
                const elapsed = table.openedAt ? getElapsedMinutes(table.openedAt) : null;

                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableNodeClick(table)}
                    className={`p-4 rounded-3xl border text-left flex flex-col justify-between transition transform active:scale-95 min-h-[140px] shadow-sm hover:shadow-md ${
                      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xl font-black">{table.name}</span>
                      <span className="text-[10px] font-bold opacity-60 uppercase">{table.shape}</span>
                    </div>

                    {activeOrder ? (
                      <div className="my-2">
                        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base block">
                          {formatAud(totals?.payableTotal || 0)}
                        </span>
                        {elapsed !== null && (
                          <span className="text-[11px] text-amber-500 font-mono">
                            ⏱ {elapsed}m seated
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="my-2 text-xs opacity-50">
                        {table.capacity} seats • Available
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] opacity-60 font-bold uppercase">
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
