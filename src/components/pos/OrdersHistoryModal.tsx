import React, { useState } from 'react';
import { History, X, Search, Printer, RotateCcw } from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import type { Order } from '../../types';
import { formatAud, formatAusTime } from '../../utils/formatters';
import { calculateOrderTotals } from '../../utils/gst';

interface OrdersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrderToPrint: (order: Order) => void;
}

export const OrdersHistoryModal: React.FC<OrdersHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectOrderToPrint,
}) => {
  const { activeVenue } = useVenue();
  const { allOrders, setCurrentOrder, setActiveMode } = usePos();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const venueOrders = allOrders
    .filter(o => o.venueId === activeVenue.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredOrders = venueOrders.filter(o => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber.toString().includes(q) ||
      (o.tableName || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      o.items.some(i => i.name.toLowerCase().includes(q))
    );
  });

  const handleRecallOrder = (order: Order) => {
    setCurrentOrder(order);
    setActiveMode('pos');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative text-slate-900 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center border border-slate-200">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Orders & History</h2>
              <p className="text-xs text-slate-500">{venueOrders.length} orders recorded</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order #, table, customer name, or item..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No orders found matching search.
            </div>
          ) : (
            filteredOrders.map(order => {
              const totals = calculateOrderTotals(order, activeVenue);
              const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="pt-2.5 first:pt-0 flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl transition"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                        #{order.orderNumber}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">
                        {order.tableName ? `Table ${order.tableName}` : (order.customerName || 'Takeaway')}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                          order.isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.isPaid ? 'Paid' : 'Open / Unpaid'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1">
                      {itemsCount} items ({order.items.slice(0, 3).map(i => i.name).join(', ')}{order.items.length > 3 ? '...' : ''})
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {order.staffName} • {formatAusTime(order.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <span className="font-mono font-bold text-sm text-slate-900 block">
                        {formatAud(totals.payableTotal)}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        {order.orderType}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onSelectOrderToPrint(order)}
                        title="Print / View Receipt"
                        className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg transition"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleRecallOrder(order)}
                        title="Recall Order to Cart"
                        className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
