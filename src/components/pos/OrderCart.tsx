import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Send,
  CreditCard,
  Banknote,
  Receipt,
  Split
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import type { OrderItem } from '../../types';
import { formatAud, formatAusTime } from '../../utils/formatters';
import { calculateItemTotal, calculateOrderTotals } from '../../utils/gst';
import { sounds } from '../../utils/sound';
import { DiscountModal } from './DiscountModal';
import { SplitBillModal } from './SplitBillModal';

interface OrderCartProps {
  onOpenPaymentModal: (customAmount?: number, label?: string) => void;
}

export const OrderCart: React.FC<OrderCartProps> = ({ onOpenPaymentModal }) => {
  const { activeVenue } = useVenue();
  const {
    currentOrder,
    updateItemQuantity,
    removeItemFromOrder,
    setItemCourse,
    fireOrderToKitchen,
    setOrderCustomerInfo,
    startNewTakeawayOrder,
    quickSettleOrder,
  } = usePos();

  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [isEditingGuest, setIsEditingGuest] = useState(false);
  const [tempGuestName, setTempGuestName] = useState(currentOrder?.customerName || '');
  const [tempBuzzer, setTempBuzzer] = useState(currentOrder?.buzzerNumber || '');

  if (!currentOrder || currentOrder.items.length === 0) {
    return (
      <div className="w-full lg:w-96 xl:w-[380px] bg-white flex flex-col h-full border-l border-slate-200 p-6 justify-between text-slate-400 select-none">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-400 border border-slate-200">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Current Sale Empty
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mb-5">
            Select items from the catalog or open a table to start an order.
          </p>

          <button
            onClick={() => {
              sounds.playTap();
              startNewTakeawayOrder();
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs"
          >
            Start Takeaway / Bar Order
          </button>
        </div>
      </div>
    );
  }

  const totals = calculateOrderTotals(currentOrder, activeVenue);
  const totalPaidSoFar = (currentOrder.splitPayments || []).reduce((sum, p) => sum + p.baseAmount, 0);
  const remainingPayable = Math.max(0, totals.payableTotal - totalPaidSoFar);

  const courseOptions: OrderItem['course'][] = ['drinks', 'entree', 'main', 'dessert', 'sides'];

  const handleFireKitchen = () => {
    fireOrderToKitchen();
  };

  const handleSaveGuestInfo = () => {
    setOrderCustomerInfo(tempGuestName || 'Takeaway Guest', tempBuzzer);
    setIsEditingGuest(false);
    sounds.playTap();
  };

  return (
    <div className="w-full lg:w-96 xl:w-[380px] bg-white flex flex-col h-full border-l border-slate-200 text-slate-900 select-none shadow-xs">
      {/* Top Header: Order Info */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
              #{currentOrder.orderNumber}
            </span>
            <h3 className="font-bold text-sm text-slate-900 truncate max-w-[140px]">
              {currentOrder.tableName ? `Table ${currentOrder.tableName}` : (currentOrder.customerName || 'Takeaway')}
            </h3>
            {currentOrder.buzzerNumber && (
              <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                Buzzer {currentOrder.buzzerNumber}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {currentOrder.staffName} • {formatAusTime(currentOrder.createdAt)}
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playTap();
            setTempGuestName(currentOrder.customerName || '');
            setTempBuzzer(currentOrder.buzzerNumber || '');
            setIsEditingGuest(!isEditingGuest);
          }}
          className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-xs"
        >
          {isEditingGuest ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Guest Info Edit Bar */}
      {isEditingGuest && (
        <div className="p-2.5 bg-slate-100 border-b border-slate-200 space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              placeholder="Guest Name"
              value={tempGuestName}
              onChange={e => setTempGuestName(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Buzzer #"
              value={tempBuzzer}
              onChange={e => setTempBuzzer(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-mono focus:outline-none"
            />
          </div>
          <button
            onClick={handleSaveGuestInfo}
            className="w-full bg-slate-900 text-white text-xs font-bold py-1 rounded-lg transition"
          >
            Save Info
          </button>
        </div>
      )}

      {/* Items List (Receipt Ticket Style) */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 divide-y divide-slate-100">
        {currentOrder.items.map(item => {
          const itemTotal = calculateItemTotal(item);

          return (
            <div key={item.id} className="pt-2 first:pt-0 space-y-1">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <div className="flex items-center space-x-1.5">
                    {item.seatNumber && (
                      <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1 py-0.2 rounded font-mono font-bold">
                        P{item.seatNumber}
                      </span>
                    )}
                    <span className="font-bold text-xs text-slate-900 leading-snug">{item.name}</span>
                  </div>

                  {/* Modifiers List */}
                  {item.selectedModifiers.length > 0 && (
                    <div className="mt-0.5 space-y-0.2 text-[11px] text-slate-500 pl-2">
                      {item.selectedModifiers.map((mod, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span>• {mod.optionName}</span>
                          {mod.priceDelta > 0 && (
                            <span className="font-mono text-[10px] text-slate-700">
                              +{formatAud(mod.priceDelta)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Kitchen Notes */}
                  {item.specialInstructions && (
                    <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-1 italic">
                      Note: {item.specialInstructions}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-slate-900 block">
                    {formatAud(itemTotal)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatAud(item.unitPrice)} ea
                  </span>
                </div>
              </div>

              {/* Quantity Stepper & Course */}
              <div className="flex items-center justify-between pt-0.5">
                <select
                  value={item.course}
                  onChange={e => setItemCourse(item.id, e.target.value as OrderItem['course'])}
                  className="bg-slate-100 border border-slate-200 text-[10px] font-bold uppercase text-slate-600 rounded px-1.5 py-0.5 focus:outline-none"
                >
                  {courseOptions.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      if (item.quantity === 1) {
                        removeItemFromOrder(item.id);
                      } else {
                        updateItemQuantity(item.id, -1);
                      }
                    }}
                    className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center border border-slate-200 transition"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-rose-600" /> : <Minus className="w-3 h-3" />}
                  </button>

                  <span className="w-5 text-center font-mono font-bold text-xs text-slate-900">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateItemQuantity(item.id, 1)}
                    className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center border border-slate-200 transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Summary Breakdown (ATO GST) */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-1 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-mono font-medium">{formatAud(totals.itemsSubtotal)}</span>
        </div>

        {totals.discountAmount > 0 && (
          <div className="flex justify-between text-amber-700 font-medium">
            <span>Discount ({currentOrder.discount?.reason})</span>
            <span className="font-mono">-{formatAud(totals.discountAmount)}</span>
          </div>
        )}

        {totals.weekendSurchargeAmount > 0 && (
          <div className="flex justify-between text-amber-700 font-medium">
            <span>Weekend Surcharge (+{activeVenue.surcharges.weekendPercent}%)</span>
            <span className="font-mono">+{formatAud(totals.weekendSurchargeAmount)}</span>
          </div>
        )}

        {totals.publicHolidaySurchargeAmount > 0 && (
          <div className="flex justify-between text-rose-700 font-medium">
            <span>Public Holiday (+{activeVenue.surcharges.publicHolidayPercent}%)</span>
            <span className="font-mono">+{formatAud(totals.publicHolidaySurchargeAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 font-mono">
          <span>Includes 10% GST (1/11th)</span>
          <span>{formatAud(totals.gstAmount)}</span>
        </div>

        <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-300 font-black text-slate-900">
          <span className="text-sm">Total Due</span>
          <span className="text-xl font-mono text-slate-900">
            {formatAud(totals.payableTotal)}
          </span>
        </div>
      </div>

      {/* Checkout Actions (Square Register Style) */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-2">
        {/* Big Solid Green Charge Button (Square's iconic full-width button) */}
        <button
          onClick={() => {
            sounds.playTap();
            onOpenPaymentModal();
          }}
          className="w-full bg-[#10b981] hover:bg-[#059669] active:bg-[#047857] text-white py-3.5 rounded-xl font-black text-base shadow-sm transition transform active:translate-y-0.5 flex items-center justify-center space-x-2"
        >
          <CreditCard className="w-5 h-5" />
          <span>Charge {formatAud(remainingPayable)}</span>
        </button>

        {/* 1-Click Fast Tender Shortcuts */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              sounds.playTap();
              quickSettleOrder('cash');
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-lg text-xs font-bold border border-slate-200 flex items-center justify-center space-x-1 transition"
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Exact Cash</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              handleFireKitchen();
            }}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 py-2 rounded-lg text-xs font-bold border border-amber-300 flex items-center justify-center space-x-1 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send KDS</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setIsSplitOpen(true);
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-lg text-xs font-bold border border-slate-200 flex items-center justify-center space-x-1 transition"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Split Bill</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {isDiscountOpen && (
        <DiscountModal
          isOpen={isDiscountOpen}
          onClose={() => setIsDiscountOpen(false)}
        />
      )}

      {isSplitOpen && (
        <SplitBillModal
          isOpen={isSplitOpen}
          onClose={() => setIsSplitOpen(false)}
          onPayShare={(amount, label) => {
            setIsSplitOpen(false);
            onOpenPaymentModal(amount, label);
          }}
        />
      )}
    </div>
  );
};
