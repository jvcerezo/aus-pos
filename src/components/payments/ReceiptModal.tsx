import React, { useRef } from 'react';
import { Printer, X, ShieldCheck, Copy } from 'lucide-react';
import type { Order } from '../../types';
import { useVenue } from '../../context/VenueContext';
import { formatAbn, formatAud, formatAusDateTime } from '../../utils/formatters';
import { calculateItemTotal, calculateOrderTotals } from '../../utils/gst';

interface ReceiptModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, isOpen, onClose }) => {
  const { activeVenue } = useVenue();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const totals = calculateOrderTotals(order, activeVenue);
  const totalPaid = (order.splitPayments || []).reduce((sum, p) => sum + p.amount, 0) || totals.payableTotal;
  const totalTips = (order.splitPayments || []).reduce((sum, p) => sum + p.tipAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (receiptRef.current) {
      navigator.clipboard.writeText(receiptRef.current.innerText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md max-h-[95vh] flex flex-col shadow-2xl relative text-slate-900 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-xs text-slate-900">Australian ATO Tax Invoice</h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt (80mm Paper Preview) */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100 flex justify-center">
          <div
            ref={receiptRef}
            className="printable-receipt w-full max-w-[320px] bg-white text-slate-900 p-5 rounded-xl shadow-xs border border-slate-200 font-mono text-xs leading-tight select-text"
          >
            {/* Tax Invoice Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-0.5">
              <h2 className="text-sm font-black tracking-wider uppercase">
                {activeVenue.name}
              </h2>
              <div className="text-[10px] text-slate-600 font-bold">
                ABN: {formatAbn(activeVenue.abn)}
              </div>
              <div className="text-[10px] text-slate-500">
                {activeVenue.address.street}, {activeVenue.address.suburb} {activeVenue.address.state} {activeVenue.address.postcode}
              </div>
              <div className="text-[10px] text-slate-500">
                Tel: {activeVenue.phone}
              </div>
              <div className="pt-1.5 text-xs font-black tracking-widest uppercase border-t border-slate-200 mt-1.5">
                *** TAX INVOICE ***
              </div>
            </div>

            {/* Order Meta */}
            <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Docket: #{order.orderNumber}</span>
                <span>{order.tableName ? `Table: ${order.tableName}` : 'Takeaway'}</span>
              </div>
              <div className="flex justify-between">
                <span>Date: {formatAusDateTime(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Server: {order.staffName}</span>
                {order.customerName && <span>Guest: {order.customerName}</span>}
              </div>
            </div>

            {/* Line Items */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5">
              {order.items.map(item => {
                const itemTotal = calculateItemTotal(item);
                return (
                  <div key={item.id} className="space-y-0.5">
                    <div className="flex justify-between font-bold">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatAud(itemTotal)}</span>
                    </div>

                    {item.selectedModifiers.length > 0 && (
                      <div className="pl-3 text-[10px] text-slate-600 space-y-0.2">
                        {item.selectedModifiers.map((m, i) => (
                          <div key={i} className="flex justify-between">
                            <span>- {m.optionName}</span>
                            {m.priceDelta > 0 && <span>+{formatAud(m.priceDelta)}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Financial Ledger & Australian GST Breakdown */}
            <div className="py-2 border-b border-dashed border-slate-300 text-xs space-y-1">
              <div className="flex justify-between">
                <span>SUBTOTAL (Items)</span>
                <span>{formatAud(totals.itemsSubtotal)}</span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>DISCOUNT ({order.discount?.reason})</span>
                  <span>-{formatAud(totals.discountAmount)}</span>
                </div>
              )}

              {totals.weekendSurchargeAmount > 0 && (
                <div className="flex justify-between">
                  <span>WEEKEND SURCHARGE ({activeVenue.surcharges.weekendPercent}%)</span>
                  <span>+{formatAud(totals.weekendSurchargeAmount)}</span>
                </div>
              )}

              {totals.publicHolidaySurchargeAmount > 0 && (
                <div className="flex justify-between">
                  <span>PUBLIC HOLIDAY SURCHARGE ({activeVenue.surcharges.publicHolidayPercent}%)</span>
                  <span>+{formatAud(totals.publicHolidaySurchargeAmount)}</span>
                </div>
              )}

              {totalTips > 0 && (
                <div className="flex justify-between">
                  <span>GRATUITY / TIP</span>
                  <span>+{formatAud(totalTips)}</span>
                </div>
              )}

              {/* ATO Mandatory GST Declaration */}
              <div className="py-1 border-t border-slate-200 text-[10px] font-bold text-center text-slate-700">
                *** TOTAL INCLUDES GST OF {formatAud(totals.gstAmount)} (1/11th) ***
              </div>

              {/* Grand Total */}
              <div className="flex justify-between text-sm font-black pt-1 border-t-2 border-slate-900">
                <span>TOTAL AUD</span>
                <span>{formatAud(totals.payableTotal + totalTips)}</span>
              </div>
            </div>

            {/* Payment Audit Record */}
            <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-1">
              <div className="font-bold uppercase">Payment Settlement:</div>
              {(order.splitPayments || []).length > 0 ? (
                order.splitPayments?.map((p, idx) => (
                  <div key={idx} className="space-y-0.2">
                    <div className="flex justify-between">
                      <span className="capitalize">{p.paymentType} {p.cardLast4 ? `(**** ${p.cardLast4})` : ''}:</span>
                      <span>{formatAud(p.amount)}</span>
                    </div>
                    {p.authCode && <div className="text-slate-500">Auth STAN: {p.authCode}</div>}
                    {p.tenderedCash && (
                      <div className="text-slate-500 flex justify-between">
                        <span>Tendered: {formatAud(p.tenderedCash)}</span>
                        <span>Change: {formatAud(p.changeGiven || 0)}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span>PAID IN FULL:</span>
                  <span>{formatAud(totalPaid)}</span>
                </div>
              )}
            </div>

            {/* Receipt Footer */}
            <div className="pt-3 text-center text-[10px] text-slate-600 space-y-0.5">
              <p className="font-bold">{activeVenue.receiptFooter || 'Thank you for dining with us!'}</p>
              <p>Please retain this receipt as your official Tax Invoice.</p>
              <p className="font-mono text-[9px] text-slate-400">www.auspos.com.au</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <button
            onClick={handleCopyText}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Text</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Close
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print 80mm Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
