import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  CheckCircle2
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import type { OrderItem } from '../../types';
import { formatAusTime, getElapsedMinutes } from '../../utils/formatters';

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

  // Filter orders for active venue
  const kdsOrders = allOrders.filter(o => {
    if (o.venueId !== activeVenue.id) return false;
    if (o.status === 'paid' && o.items.every(i => i.itemStatus === 'served' || i.itemStatus === 'ready')) return false;
    return o.items.length > 0;
  });

  const getUrgencyColor = (elapsedMinutes: number) => {
    if (elapsedMinutes < 10) return { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', header: 'bg-slate-50' };
    if (elapsedMinutes < 20) return { badge: 'bg-amber-100 text-amber-800 border-amber-300', header: 'bg-amber-50' };
    return { badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', header: 'bg-rose-50' };
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
    <div className="flex-1 flex flex-col h-[calc(100vh-5.25rem)] bg-slate-100 p-4 select-none overflow-hidden">
      {/* Top KDS Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center border border-slate-200">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Kitchen Display System (KDS)</h2>
            <p className="text-xs text-slate-500">{kdsOrders.length} Active Kitchen Tickets</p>
          </div>
        </div>

        {/* Course Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5">
          {coursesList.map(c => (
            <button
              key={c.id}
              onClick={() => setCourseFilter(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
                courseFilter === c.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid (Physical Kitchen Chits) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {kdsOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <ChefHat className="w-12 h-12 mb-2 stroke-1" />
            <h3 className="text-sm font-bold text-slate-600">All Kitchen Tickets Cleared</h3>
            <p className="text-xs">No pending items to prepare.</p>
          </div>
        ) : (
          <div className="flex space-x-3 h-full pb-2">
            {kdsOrders.map(order => {
              const elapsed = getElapsedMinutes(order.createdAt);
              const urgency = getUrgencyColor(elapsed);

              const itemsToShow = courseFilter === 'all'
                ? order.items
                : order.items.filter(i => i.course === courseFilter);

              if (itemsToShow.length === 0) return null;

              const allDone = order.items.every(i => i.itemStatus === 'ready' || i.itemStatus === 'served');

              return (
                <div
                  key={order.id}
                  className="w-72 bg-white rounded-2xl border border-slate-300 shadow-sm flex flex-col justify-between overflow-hidden shrink-0 h-[calc(100%-0.5rem)]"
                >
                  {/* Ticket Header */}
                  <div className={`p-3 border-b border-slate-200 ${urgency.header}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-slate-900">
                        #{order.orderNumber}
                      </span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${urgency.badge}`}>
                        ⏱ {elapsed}m
                      </span>
                    </div>

                    <div className="mt-1 flex items-baseline justify-between">
                      <h3 className="font-bold text-sm text-slate-900 truncate max-w-[170px]">
                        {order.tableName ? `Table ${order.tableName}` : (order.customerName || 'Takeaway')}
                      </h3>
                      {order.buzzerNumber && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 rounded font-mono font-bold">
                          Buzzer {order.buzzerNumber}
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Server: {order.staffName} • {formatAusTime(order.createdAt)}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
                    {itemsToShow.map(item => {
                      const isReady = item.itemStatus === 'ready' || item.itemStatus === 'served';

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            const next = isReady ? 'preparing' : 'ready';
                            updateOrderItemStatus(order.id, item.id, next);
                          }}
                          className={`pt-2 first:pt-0 cursor-pointer transition select-none ${
                            isReady ? 'opacity-40 line-through' : 'hover:opacity-80'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-black font-mono text-sm text-slate-900">
                                {item.quantity}x
                              </span>
                              <div>
                                <span className="font-bold text-xs text-slate-900">
                                  {item.name}
                                </span>
                                {item.seatNumber && (
                                  <span className="text-[9px] text-slate-500 font-mono ml-1">
                                    (P{item.seatNumber})
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className="text-[9px] uppercase font-bold text-slate-400">
                              {item.course}
                            </span>
                          </div>

                          {/* Modifiers */}
                          {item.selectedModifiers.length > 0 && (
                            <div className="pl-6 text-[11px] text-slate-600 space-y-0.2 mt-0.5">
                              {item.selectedModifiers.map((m, i) => (
                                <div key={i}>• {m.optionName}</div>
                              ))}
                            </div>
                          )}

                          {/* Kitchen Instruction */}
                          {item.specialInstructions && (
                            <div className="ml-6 mt-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              Note: {item.specialInstructions}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Ticket Bump Action */}
                  <div className="p-2.5 bg-slate-50 border-t border-slate-200">
                    <button
                      onClick={() => bumpEntireOrder(order.id)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs ${
                        allDone
                          ? 'bg-[#10b981] hover:bg-[#059669] text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{allDone ? 'Order Ready (Bump)' : 'Mark All Items Ready'}</span>
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
