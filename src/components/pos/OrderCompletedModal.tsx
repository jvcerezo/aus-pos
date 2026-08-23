import React from 'react';
import { CheckCircle2, Printer, Plus, RotateCcw, X } from 'lucide-react';
import type { Order } from '../../types';
import { formatAud, formatAusDateTime } from '../../utils/formatters';

interface OrderCompletedModalProps {
  order: Order;
  onClose: () => void;
  onPrintReceipt: () => void;
  onReopenOrder: () => void;
  onNewSale: () => void;
}

export const OrderCompletedModal: React.FC<OrderCompletedModalProps> = ({
  order,
  onClose,
  onPrintReceipt,
  onReopenOrder,
  onNewSale,
}) => {
  const lastPayment = order.splitPayments && order.splitPayments.length > 0
    ? order.splitPayments[order.splitPayments.length - 1]
    : null;

  const totalPaid = (order.splitPayments || []).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon & Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Payment Complete</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Order #{order.orderNumber} • {order.tableName ? `Table ${order.tableName}` : (order.customerName || 'Takeaway')}
          </p>
        </div>

        {/* Payment Summary Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Total Paid:</span>
            <span className="font-mono font-black text-slate-900 text-sm">{formatAud(totalPaid)}</span>
          </div>

          {lastPayment?.changeGiven && lastPayment.changeGiven > 0 ? (
            <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200 font-bold">
              <span>Change Given:</span>
              <span className="font-mono text-sm">{formatAud(lastPayment.changeGiven)}</span>
            </div>
          ) : null}

          <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 text-[11px]">
            <span>Method:</span>
            <span className="capitalize font-bold text-slate-700">
              {lastPayment?.paymentType || 'EFTPOS / Cash'} {lastPayment?.cardLast4 ? `(**** ${lastPayment.cardLast4})` : ''}
            </span>
          </div>

          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>Time:</span>
            <span>{formatAusDateTime(order.updatedAt || order.createdAt)}</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onPrintReceipt}
              className="flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 py-3 rounded-xl font-bold text-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Invoice</span>
            </button>

            <button
              onClick={onReopenOrder}
              className="flex items-center justify-center space-x-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 py-3 rounded-xl font-bold text-xs transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reopen / Add Items</span>
            </button>
          </div>

          <button
            onClick={onNewSale}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3.5 rounded-xl font-black text-sm shadow-xs transition flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Start Next Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
