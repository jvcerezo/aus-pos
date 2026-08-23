import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  CheckCircle2
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import type { Order, OrderItem } from '../../types';
import { formatAusTime, getElapsedMinutes } from '../../utils/formatters';

export const KdsScreen: React.FC = () => {
  const { activeVenue } = useVenue();
  const {
    allOrders,
    updateOrderItemStatus,
    bumpEntireOrder,
  } = usePos();

  const [courseFilter, setCourseFilter] = useState<'all' | OrderItem['course']>('all');
  const [orderToBump, setOrderToBump] = useState<Order | null>(null);
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

  const handleConfirmBump = () => {
    if (orderToBump) {
      bumpEntireOrder(orderToBump.id);
      setOrderToBump(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.75rem)] bg-slate-100 p-4 select-none overflow-hidden">
      {/* Top KDS Controls (Larger Text) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center border border-slate-200">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Kitchen Display System (KDS)</h2>
            <p className="text-xs text-slate-500 font-medium">{kdsOrders.length} Active Kitchen Tickets Pending</p>
          </div>
        </div>

        {/* Course Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
          {coursesList.map(c => (
            <button
              key={c.id}
              onClick={() => setCourseFilter(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap border ${
                courseFilter === c.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid (Physical Kitchen Chits with Larger Typography) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {kdsOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <ChefHat className="w-16 h-16 mb-3 stroke-1" />
            <h3 className="text-base font-bold text-slate-700">All Kitchen Tickets Cleared</h3>
            <p className="text-sm">No pending items to prepare.</p>
          </div>
        ) : (
          <div className="flex space-x-4 h-full pb-2">
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
                  className="w-80 bg-white rounded-2xl border border-slate-300 shadow-sm flex flex-col justify-between overflow-hidden shrink-0 h-[calc(100%-0.5rem)]"
                >
                  {/* Ticket Header */}
                  <div className={`p-3.5 border-b border-slate-200 ${urgency.header}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-base text-slate-900">
                        #{order.orderNumber}
                      </span>
                      <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg border ${urgency.badge}`}>
                        ⏱ {elapsed}m
                      </span>
                    </div>

                    <div className="mt-1 flex items-baseline justify-between">
                      <h3 className="font-black text-base text-slate-900 truncate max-w-[190px]">
                        {order.tableName ? `Table ${order.tableName}` : (order.customerName || 'Takeaway')}
                      </h3>
                      {order.buzzerNumber && (
                        <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                          Buzzer {order.buzzerNumber}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 mt-0.5 font-medium">
                      Server: {order.staffName} • {formatAusTime(order.createdAt)}
                    </div>
                  </div>

                  {/* Items List (Larger Readable Kitchen Font) */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-3 divide-y divide-slate-100">
                    {itemsToShow.map(item => {
                      const isReady = item.itemStatus === 'ready' || item.itemStatus === 'served';

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            const next = isReady ? 'preparing' : 'ready';
                            updateOrderItemStatus(order.id, item.id, next);
                          }}
                          className={`pt-2.5 first:pt-0 cursor-pointer transition select-none ${
                            isReady ? 'opacity-35 line-through' : 'hover:opacity-80'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2.5">
                              <span className="font-black font-mono text-base sm:text-lg text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {item.quantity}x
                              </span>
                              <div>
                                <span className="font-bold text-sm sm:text-base text-slate-900 block leading-snug">
                                  {item.name}
                                </span>
                                {item.seatNumber && (
                                  <span className="text-xs text-slate-500 font-mono">
                                    (Guest Seat P{item.seatNumber})
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className="text-xs uppercase font-bold text-slate-400">
                              {item.course}
                            </span>
                          </div>

                          {/* Modifiers */}
                          {item.selectedModifiers.length > 0 && (
                            <div className="pl-9 text-xs text-slate-600 space-y-0.5 mt-1 font-medium">
                              {item.selectedModifiers.map((m, i) => (
                                <div key={i}>• {m.optionName}</div>
                              ))}
                            </div>
                          )}

                          {/* Kitchen Instruction */}
                          {item.specialInstructions && (
                            <div className="ml-9 mt-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                              Note: {item.specialInstructions}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Ticket Bump Action with Confirmation */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200">
                    <button
                      onClick={() => setOrderToBump(order)}
                      className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center space-x-2 transition shadow-xs ${
                        allDone
                          ? 'bg-[#10b981] hover:bg-[#059669] text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{allDone ? 'Bump Ticket (Complete)' : 'Mark All Items Ready'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bump Ticket Confirmation Modal */}
      {orderToBump && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-slate-900">
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">Bump Kitchen Ticket?</h3>
            <p className="text-sm text-slate-600 mb-5">
              Mark Order #{orderToBump.orderNumber} ({orderToBump.tableName ? `Table ${orderToBump.tableName}` : 'Takeaway'}) as complete and remove from KDS rail?
            </p>

            <div className="flex justify-end space-x-2.5">
              <button
                onClick={() => setOrderToBump(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmBump}
                className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Complete Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
