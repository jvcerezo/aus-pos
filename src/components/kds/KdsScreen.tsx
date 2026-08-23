import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import type { OrderItem } from '../../types';
import { formatAusTime, getElapsedMinutes } from '../../utils/formatters';
import { sounds } from '../../utils/sound';


export const KdsScreen: React.FC = () => {
  const { activeVenue } = useVenue();
  const {
    allOrders,
    updateOrderItemStatus,
    bumpEntireOrder,
  } = usePos();

  const [courseFilter, setCourseFilter] = useState<'all' | OrderItem['course']>('all');
  const [, setTimerTick] = useState(0);

  // Re-render every 15 seconds to keep live elapsed timers accurate
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerTick(t => t + 1);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Filter orders for active venue that are not yet paid/completed or were recently sent
  const kdsOrders = allOrders.filter(o => {
    if (o.venueId !== activeVenue.id) return false;
    if (o.status === 'paid' && o.items.every(i => i.itemStatus === 'served' || i.itemStatus === 'ready')) return false;
    return o.items.length > 0;
  });

  const getUrgencyColor = (elapsedMinutes: number) => {
    if (elapsedMinutes < 10) return { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', border: 'border-slate-800' };
    if (elapsedMinutes < 20) return { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', border: 'border-amber-500/50' };
    return { badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse', border: 'border-rose-500/80 shadow-lg shadow-rose-950/50' };
  };

  const coursesList: { id: 'all' | OrderItem['course']; label: string }[] = [
    { id: 'all', label: 'All Courses' },
    { id: 'drinks', label: 'Drinks Bar' },
    { id: 'entree', label: 'Entrees' },
    { id: 'main', label: 'Mains' },
    { id: 'dessert', label: 'Desserts' },
    { id: 'sides', label: 'Sides' },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-6.25rem)] bg-slate-950 p-4 lg:p-6 select-none overflow-hidden">
      {/* Top KDS Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Kitchen Display System (KDS)
              <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg font-normal">
                {kdsOrders.length} active tickets
              </span>
            </h2>
            <p className="text-xs text-slate-400">Real-time docket line and course routing</p>
          </div>
        </div>

        {/* Course Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {coursesList.map(c => (
            <button
              key={c.id}
              onClick={() => {
                sounds.playTap();
                setCourseFilter(c.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                courseFilter === c.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
          <button
            onClick={() => sounds.playKitchenBell()}
            title="Test Kitchen Alert Bell"
            className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl border border-slate-800"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {kdsOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-500 text-center">
            <ChefHat className="w-16 h-16 mb-3 opacity-30" />
            <h3 className="text-base font-bold text-slate-300">All Kitchen Orders Cleared!</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              New orders sent from the POS or tables will instantly pop up on this screen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kdsOrders.map(order => {
              const elapsed = getElapsedMinutes(order.createdAt);
              const urgency = getUrgencyColor(elapsed);

              const visibleItems = courseFilter === 'all'
                ? order.items
                : order.items.filter(i => i.course === courseFilter);

              if (visibleItems.length === 0 && courseFilter !== 'all') return null;

              const isAllReady = order.items.every(i => i.itemStatus === 'ready' || i.itemStatus === 'served');

              return (
                <div
                  key={order.id}
                  className={`bg-slate-900 rounded-2xl border-2 flex flex-col justify-between shadow-xl transition overflow-hidden ${urgency.border}`}
                >
                  {/* Card Header */}
                  <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-sm text-sky-400">
                          #{order.orderNumber}
                        </span>
                        <h4 className="font-bold text-base text-white truncate max-w-[120px]">
                          {order.tableName ? `Table ${order.tableName}` : (order.customerName || 'Takeaway')}
                        </h4>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {order.staffName} • {formatAusTime(order.createdAt)}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-lg border flex items-center space-x-1 ${urgency.badge}`}>
                        <Clock className="w-3 h-3" />
                        <span>{elapsed}m</span>
                      </span>

                      {order.buzzerNumber && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                          Buzzer {order.buzzerNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items Ticket Body */}
                  <div className="p-3.5 flex-1 space-y-2.5 overflow-y-auto max-h-72">
                    {visibleItems.map(item => {
                      const isReady = item.itemStatus === 'ready' || item.itemStatus === 'served';

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            updateOrderItemStatus(
                              order.id,
                              item.id,
                              isReady ? 'preparing' : 'ready'
                            );
                          }}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start justify-between ${
                            isReady
                              ? 'bg-slate-950/40 border-slate-800/80 opacity-50 line-through'
                              : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-750 text-white'
                          }`}
                        >
                          <div className="flex-1 pr-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-black text-sm text-amber-400">
                                {item.quantity}x
                              </span>
                              <span className="font-bold text-xs leading-snug">{item.name}</span>
                            </div>

                            {/* Modifiers */}
                            {item.selectedModifiers.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {item.selectedModifiers.map((m, mIdx) => (
                                  <div key={mIdx} className="text-[11px] text-sky-300 pl-4">
                                    • {m.optionName}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Instructions */}
                            {item.specialInstructions && (
                              <div className="text-[11px] text-rose-300 font-medium italic mt-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                ! {item.specialInstructions}
                              </div>
                            )}
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition mt-0.5 ${
                              isReady
                                ? 'bg-emerald-500 border-emerald-400 text-white'
                                : 'border-slate-600 bg-slate-900'
                            }`}
                          >
                            {isReady && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Bump Button */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800">
                    <button
                      onClick={() => bumpEntireOrder(order.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center space-x-2 ${
                        isAllReady
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{isAllReady ? 'Bump Order (Ready)' : 'Mark All Items Ready'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
