import React, { useState } from 'react';
import {
  ShoppingBag,
  Map,
  LayoutGrid,
  Building,
  Layers,
  ArrowRight
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
    floors,
    sections,
    tables,
    landmarks,
    allOrders,
    openTableOrder,
    startNewTakeawayOrder,
  } = usePos();

  const venueFloors = floors.filter(f => f.venueId === activeVenue.id).sort((a, b) => a.order - b.order);
  const [selectedFloorId, setSelectedFloorId] = useState<string>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'blueprint' | 'grid'>('blueprint');
  const [transferSourceTable, setTransferSourceTable] = useState<RestaurantTable | null>(null);

  // Helper to resolve floor for any table (even legacy cached tables)
  const getFloorIdForTable = (table: RestaurantTable): string => {
    if (table.floorLevelId) return table.floorLevelId;
    const sec = sections.find(s => s.id === table.sectionId);
    if (sec?.floorLevelId) return sec.floorLevelId;
    if (table.sectionId?.includes('terrace') || table.sectionId?.includes('rooftop') || table.name.startsWith('Deck')) {
      return venueFloors.find(f => f.shortCode === 'L2')?.id || venueFloors[0]?.id || '';
    }
    if (table.sectionId?.includes('mezz') || table.sectionId?.includes('function') || table.name.startsWith('Mezz') || table.name.startsWith('Private') || table.name.startsWith('Loft')) {
      return venueFloors.find(f => f.shortCode === 'L1')?.id || venueFloors[0]?.id || '';
    }
    return venueFloors[0]?.id || '';
  };

  // Helper to resolve floor for landmark
  const getFloorIdForLandmark = (lm: any): string => {
    if (lm.floorLevelId) return lm.floorLevelId;
    if (lm.id?.includes('ocean') || lm.id?.includes('skybar')) {
      return venueFloors.find(f => f.shortCode === 'L2')?.id || venueFloors[0]?.id || '';
    }
    if (lm.id?.includes('l1') || lm.id?.includes('wine') || lm.id?.includes('loft')) {
      return venueFloors.find(f => f.shortCode === 'L1')?.id || venueFloors[0]?.id || '';
    }
    return venueFloors[0]?.id || '';
  };

  // Filter sections for active venue and active floor
  const venueSections = sections.filter(s => {
    if (s.venueId !== activeVenue.id) return false;
    if (selectedFloorId !== 'all' && s.floorLevelId && s.floorLevelId !== selectedFloorId) return false;
    return true;
  });

  const venueTables = tables.filter(t => t.venueId === activeVenue.id);

  // Filter tables by floor + section
  const filteredTables = venueTables.filter(t => {
    // Check floor
    if (selectedFloorId !== 'all') {
      const tableFloorId = getFloorIdForTable(t);
      if (tableFloorId && tableFloorId !== selectedFloorId) return false;
    }
    // Check section
    if (selectedSectionId !== 'all' && t.sectionId !== selectedSectionId) {
      return false;
    }
    return true;
  });

  const handleTableNodeClick = (table: RestaurantTable) => {
    sounds.playTap();
    openTableOrder(table);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.75rem)] bg-slate-100 overflow-hidden select-none">
      {/* 1. Multi-Floor Level Switcher (Elevator Bar) */}
      {venueFloors.length > 1 && (
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between shadow-xs z-10 shrink-0">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Floor Level:
            </span>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <button
              onClick={() => {
                sounds.playTap();
                setSelectedFloorId('all');
                setSelectedSectionId('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                selectedFloorId === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              All Levels ({venueTables.length})
            </button>

            {venueFloors.map(floor => {
              const floorTables = venueTables.filter(t => getFloorIdForTable(t) === floor.id);
              const occupied = floorTables.filter(t => t.status !== 'available').length;
              const isSelected = selectedFloorId === floor.id;

              return (
                <button
                  key={floor.id}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedFloorId(floor.id);
                    setSelectedSectionId('all');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="px-1.5 py-0.2 rounded bg-slate-950/20 font-mono text-[10px]">
                    {floor.shortCode}
                  </span>
                  <span>{floor.name}</span>
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.2 rounded font-bold ${
                      isSelected
                        ? 'bg-slate-200 text-slate-900'
                        : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    {occupied}/{floorTables.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Counter / Bar CTA */}
          <button
            onClick={() => {
              sounds.playTap();
              startNewTakeawayOrder();
            }}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ Takeaway / Bar</span>
          </button>
        </div>
      )}

      {/* 2. Sub-Sections & View Switcher Bar */}
      <div className="p-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs shrink-0">
        {/* Section Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => {
              sounds.playTap();
              setSelectedSectionId('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-sm font-bold transition border flex items-center space-x-1.5 ${
              selectedSectionId === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Sections ({filteredTables.length})</span>
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
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.color || '#3b82f6' }}
                />
                <span>{s.name}</span>
                <span className="font-mono text-xs opacity-75">
                  ({occupied}/{count})
                </span>
              </button>
            );
          })}
        </div>

        {/* View Switcher: Blueprint vs Grid */}
        <div className="flex items-center space-x-2">
          {venueFloors.length <= 1 && (
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
          )}

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                sounds.playTap();
                setViewMode('blueprint');
              }}
              className={`p-2 rounded-lg text-xs font-bold transition ${
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
              className={`p-2 rounded-lg text-xs font-bold transition ${
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

      {/* 3. Main Floor Display Area */}
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        {viewMode === 'blueprint' ? (
          selectedFloorId === 'all' && venueFloors.length > 1 ? (
            /* ALL LEVELS SELECTED: Stacked Multi-Story Architectural Building View (Zero overlap!) */
            <div className="w-full max-w-5xl space-y-6 pb-8">
              {venueFloors.map(floor => {
                const floorTables = venueTables.filter(t => getFloorIdForTable(t) === floor.id);
                const floorLandmarks = landmarks.filter(
                  l => l.venueId === activeVenue.id && getFloorIdForLandmark(l) === floor.id
                );
                const occupiedCount = floorTables.filter(t => t.status !== 'available').length;

                return (
                  <div
                    key={floor.id}
                    className="bg-white rounded-3xl border border-slate-300 shadow-sm overflow-hidden"
                  >
                    {/* Floor Header Bar */}
                    <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-0.5 rounded bg-white/20 font-mono font-bold text-xs">
                          {floor.shortCode}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base">{floor.name}</h3>
                          {floor.description && (
                            <p className="text-xs text-slate-400 font-normal">{floor.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                          {occupiedCount}/{floorTables.length} Occupied
                        </span>

                        <button
                          onClick={() => {
                            sounds.playTap();
                            setSelectedFloorId(floor.id);
                          }}
                          className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          <span>Focus {floor.shortCode}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Floor Level 2D Blueprint Canvas (Independent coordinates per floor) */}
                    <div className="h-[480px] bg-slate-50 relative overflow-hidden select-none border-t border-slate-200">
                      {/* Grid Pattern */}
                      <div
                        className="absolute inset-0 opacity-15 pointer-events-none"
                        style={{
                          backgroundImage:
                            'radial-gradient(#64748b 1px, transparent 1px), radial-gradient(#64748b 1px, #ffffff 1px)',
                          backgroundSize: '24px 24px',
                          backgroundPosition: '0 0, 12px 12px',
                        }}
                      />

                      {/* Landmarks on this level */}
                      {floorLandmarks.map(lm => (
                        <div
                          key={lm.id}
                          style={{
                            left: `${lm.x}%`,
                            top: `${lm.y}%`,
                            width: `${lm.width || 120}px`,
                            height: `${lm.height || 40}px`,
                          }}
                          className="absolute z-0 bg-slate-200/90 border border-slate-300 rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-wider text-slate-600 shadow-2xs select-none"
                        >
                          {lm.label}
                        </div>
                      ))}

                      {/* Tables on this level */}
                      {floorTables.map(table => {
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
                  </div>
                );
              })}
            </div>
          ) : (
            /* SINGLE FLOOR FOCUSED: Full-Size 2D Architectural Floor Plan */
            <div className="flex items-center justify-center h-full">
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
                {landmarks
                  .filter(l => l.venueId === activeVenue.id && (selectedFloorId === 'all' || getFloorIdForLandmark(l) === selectedFloorId))
                  .map(lm => (
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
            </div>
          )
        ) : (
          /* Touch Grid View (Grouped by Floor Level when All is selected) */
          <div className="w-full max-w-6xl h-full overflow-y-auto space-y-6 pb-8">
            {(selectedFloorId === 'all' ? venueFloors : venueFloors.filter(f => f.id === selectedFloorId)).map(floor => {
              const floorTables = filteredTables.filter(t => getFloorIdForTable(t) === floor.id);

              if (floorTables.length === 0) return null;

              return (
                <div key={floor.id} className="space-y-3">
                  <div className="flex items-center space-x-2 border-b border-slate-300 pb-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-xs">
                      {floor.shortCode}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{floor.name}</h3>
                    <span className="text-xs text-slate-500 font-mono">({floorTables.length} tables)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {floorTables.map(table => {
                      const activeOrder = allOrders.find(o => o.tableId === table.id && !o.isPaid);
                      const orderTotals = activeOrder ? calculateOrderTotals(activeOrder, activeVenue) : null;
                      const section = sections.find(s => s.id === table.sectionId);

                      return (
                        <button
                          key={table.id}
                          onClick={() => handleTableNodeClick(table)}
                          className={`p-4 rounded-2xl border-2 text-left transition transform active:scale-95 shadow-xs flex flex-col justify-between min-h-[125px] ${
                            table.status === 'available'
                              ? 'bg-white border-emerald-500 hover:border-emerald-600'
                              : table.status === 'occupied'
                              ? 'bg-sky-50 border-sky-600'
                              : 'bg-amber-50 border-amber-600'
                          }`}
                        >
                          <div>
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

                            <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                              {floor.shortCode} • {section?.name || 'Main'}
                            </div>
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
              );
            })}
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
