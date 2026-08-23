import React, { useRef } from 'react';
import { Printer, X, ShieldCheck, Copy } from 'lucide-react';
import type { Order } from '../../types';
import { useVenue } from '../../context/VenueContext';
import { formatAbn, formatAud, formatAusDateTime } from '../../utils/formatters';
import { calculateItemTotal, calculateOrderTotals } from '../../utils/gst';
import { sounds } from '../../utils/sound';

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
    sounds.playTap();
    window.print();
  };

  const handleCopyText = () => {
    sounds.playTap();
    if (receiptRef.current) {
      navigator.clipboard.writeText(receiptRef.current.innerText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md max-h-[95vh] flex flex-col shadow-2xl relative text-white overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Australian Tax Invoice</h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt (80mm Paper Preview) */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/50 flex justify-center">
          <div
            ref={receiptRef}
            className="printable-receipt w-full max-w-[340px] bg-white text-slate-900 p-6 rounded-2xl shadow-xl font-mono text-xs leading-tight select-text"
          >
            {/* Header */}
            <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-slate-300">
              <h2 className="font-black text-base uppercase tracking-wider">{activeVenue.name}</h2>
              <div className="text-[10px] text-slate-600">{activeVenue.tradingName}</div>
              <div className="font-bold text-xs">ABN: {formatAbn(activeVenue.abn)}</div>
              <div className="text-[10px] text-slate-600">
                {activeVenue.address.street}, {activeVenue.address.suburb} {activeVenue.address.state} {activeVenue.address.postcode}
              </div>
              <div className="text-[10px] text-slate-600">Tel: {activeVenue.phone}</div>
              <div className="pt-2 font-black text-sm tracking-widest uppercase">
                *** TAX INVOICE ***
              </div>
            </div>

            {/* Order Meta Info */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>Docket: #{order.orderNumber}</span>
                <span>{order.tableName ? `Table: ${order.tableName}` : (order.customerName || 'Takeaway')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Date: {formatAusDateTime(order.updatedAt || new Date())}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Staff: {order.staffName}</span>
                {order.buzzerNumber && <span>Buzzer: {order.buzzerNumber}</span>}
              </div>
            </div>

            {/* Itemized Line Items */}
            <div className="py-3 border-b-2 border-dashed border-slate-300 space-y-2">
              {order.items.map((item, idx) => {
                const itemTotal = calculateItemTotal(item);
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-start font-bold">
                      <span className="flex-1 pr-2">
                        {item.quantity}x {item.name}
                      </span>
                      <span>{formatAud(itemTotal)}</span>
                    </div>

                    {item.selectedModifiers.map((m, mIdx) => (
                      <div key={mIdx} className="text-[10px] text-slate-600 pl-3 flex justify-between">
                        <span>+ {m.optionName}</span>
                        {m.priceDelta > 0 && <span>+{formatAud(m.priceDelta)}</span>}
                      </div>
                    ))}

                    {item.specialInstructions && (
                      <div className="text-[10px] italic text-slate-500 pl-3">
                        *{item.specialInstructions}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="py-3 border-b-2 border-dashed border-slate-300 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span>{formatAud(totals.itemsSubtotal)}</span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Discount ({order.discount?.reason}):</span>
                  <span>-{formatAud(totals.discountAmount)}</span>
                </div>
              )}

              {totals.weekendSurchargeAmount > 0 && (
                <div className="flex justify-between">
                  <span>Weekend Surcharge (+{activeVenue.surcharges.weekendPercent}%):</span>
                  <span>+{formatAud(totals.weekendSurchargeAmount)}</span>
                </div>
              )}

              {totals.publicHolidaySurchargeAmount > 0 && (
                <div className="flex justify-between">
                  <span>Public Holiday (+{activeVenue.surcharges.publicHolidayPercent}%):</span>
                  <span>+{formatAud(totals.publicHolidaySurchargeAmount)}</span>
                </div>
              )}

              {totalTips > 0 && (
                <div className="flex justify-between">
                  <span>Gratuity / Tip:</span>
                  <span>+{formatAud(totalTips)}</span>
                </div>
              )}

              {/* Total Paid Header */}
              <div className="flex justify-between font-black text-base pt-2 border-t border-slate-400">
                <span>TOTAL (AUD):</span>
                <span>{formatAud(totalPaid)}</span>
              </div>

              {/* Mandatory Australian GST 1/11th Line */}
              <div className="text-center font-bold text-[11px] pt-1.5 text-slate-700">
                *** TOTAL INCLUDES GST OF {formatAud(totals.gstAmount)} ***
              </div>
            </div>

            {/* Payments List */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1">
              <div className="font-bold uppercase text-[10px] text-slate-500">Settlement Details:</div>
              {order.splitPayments && order.splitPayments.length > 0 ? (
                order.splitPayments.map((p, pIdx) => (
                  <div key={pIdx} className="flex justify-between text-slate-700">
                    <span className="capitalize">
                      {p.guestLabel ? `${p.guestLabel} (${p.paymentType})` : p.paymentType}
                      {p.cardLast4 ? ` (****${p.cardLast4})` : ''}
                    </span>
                    <span className="font-bold">{formatAud(p.amount)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-slate-700">
                  <span>Paid in Full</span>
                  <span className="font-bold">{formatAud(totals.payableTotal)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 text-center text-[10px] text-slate-600 space-y-1 whitespace-pre-line">
              <p>{activeVenue.receiptFooter}</p>
              <div className="text-[9px] text-slate-400 pt-1">
                Powered by AusPOS • Australian Restaurant Template
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between no-print">
          <button
            onClick={handleCopyText}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Text</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-sky-950/50 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print 80mm Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
