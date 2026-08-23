import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Send,
  CreditCard,
  Banknote,
  Receipt,
  MoreHorizontal
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
    uiTheme,
  } = usePos();

  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [isEditingGuest, setIsEditingGuest] = useState(false);
  const [tempGuestName, setTempGuestName] = useState(currentOrder?.customerName || '');
  const [tempBuzzer, setTempBuzzer] = useState(currentOrder?.buzzerNumber || '');


  const isLight = uiTheme === 'light';

  if (!currentOrder || currentOrder.items.length === 0) {
    return (
      <div
        className={`w-full lg:w-96 xl:w-[420px] flex flex-col h-full border-l p-6 justify-between transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div
            className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 border ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-slate-800/80 border-slate-700/80 text-slate-500'
            }`}
          >
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className={`text-base font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
            Order Cart Empty
          </h3>
          <p className="text-xs max-w-xs mb-6 opacity-80">
            Tap items from the menu to start building the order.
          </p>

          <button
            onClick={() => {
              sounds.playTap();
              startNewTakeawayOrder();
            }}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-lg shadow-sky-950/20 transition"
          >
            Start Takeaway / Counter Order
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
    <div
      className={`w-full lg:w-96 xl:w-[420px] flex flex-col h-full border-l select-none transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      {/* Top Header: Order Identification */}
      <div
        className={`p-3.5 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-black text-xs text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
              #{currentOrder.orderNumber}
            </span>
            <h3 className="font-bold text-sm truncate max-w-[150px]">
              {currentOrder.tableName ? `Table ${currentOrder.tableName}` : (currentOrder.customerName || 'Takeaway')}
            </h3>
            {currentOrder.buzzerNumber && (
              <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                Buzzer {currentOrder.buzzerNumber}
              </span>
            )}
          </div>
          <div className="text-[11px] opacity-60 mt-0.5">
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
          className={`text-xs font-semibold px-2.5 py-1 rounded-xl border transition ${
            isLight ? 'bg-white border-slate-200 text-sky-600 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 text-sky-400 hover:bg-slate-750'
          }`}
        >
          {isEditingGuest ? 'Done' : 'Edit Info'}
        </button>
      </div>

      {/* Guest Info Quick Edit Bar */}
      {isEditingGuest && (
        <div className={`p-3 border-b space-y-2 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Guest Name"
              value={tempGuestName}
              onChange={e => setTempGuestName(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
            />
            <input
              type="text"
              placeholder="Buzzer #"
              value={tempBuzzer}
              onChange={e => setTempBuzzer(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none"
            />
          </div>
          <button
            onClick={handleSaveGuestInfo}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-1.5 rounded-xl transition"
          >
            Save Info
          </button>
        </div>
      )}

      {/* Items Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {currentOrder.items.map(item => {
          const itemTotal = calculateItemTotal(item);

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-3 space-y-2 border transition ${
                isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Item Title & Price */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <div className="flex items-center space-x-1.5">
                    {item.seatNumber && (
                      <span className="text-[9px] bg-slate-200 dark:bg-slate-800 opacity-70 px-1.5 py-0.2 rounded font-mono font-bold">
                        P{item.seatNumber}
                      </span>
                    )}
                    <span className="font-extrabold text-xs leading-snug">{item.name}</span>
                  </div>

                  {/* Modifiers List */}
                  {item.selectedModifiers.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {item.selectedModifiers.map((mod, i) => (
                        <div key={i} className="text-[11px] text-sky-600 dark:text-sky-400 flex items-center justify-between">
                          <span>+ {mod.optionName}</span>
                          {mod.priceDelta > 0 && (
                            <span className="font-mono text-[10px] text-amber-500">
                              +{formatAud(mod.priceDelta)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Kitchen Notes */}
                  {item.specialInstructions && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 italic mt-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Note: {item.specialInstructions}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 block">
                    {formatAud(itemTotal)}
                  </span>
                  <span className="text-[10px] opacity-50 font-mono">
                    {formatAud(item.unitPrice)} ea
                  </span>
                </div>
              </div>

              {/* Bottom Controls: Course selector & Stepper */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-900">
                <select
                  value={item.course}
                  onChange={e => setItemCourse(item.id, e.target.value as OrderItem['course'])}
                  className={`border text-[10px] font-bold uppercase rounded-lg px-2 py-1 focus:outline-none ${
                    isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {courseOptions.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => {
                      if (item.quantity === 1) {
                        removeItemFromOrder(item.id);
                      } else {
                        updateItemQuantity(item.id, -1);
                      }
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border transition ${
                      isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3 h-3" />}
                  </button>

                  <span className="w-6 text-center font-mono font-bold text-xs">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateItemQuantity(item.id, 1)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border transition ${
                      isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Breakdown (Clean ATO Summary) */}
      <div className={`p-3 border-t space-y-1 text-xs ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'}`}>
        <div className="flex justify-between opacity-70">
          <span>Items Subtotal</span>
          <span className="font-mono font-semibold">{formatAud(totals.itemsSubtotal)}</span>
        </div>

        {totals.discountAmount > 0 && (
          <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
            <span>Discount ({currentOrder.discount?.reason})</span>
            <span className="font-mono">-{formatAud(totals.discountAmount)}</span>
          </div>
        )}

        {totals.weekendSurchargeAmount > 0 && (
          <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
            <span>Weekend +{activeVenue.surcharges.weekendPercent}%</span>
            <span className="font-mono">+{formatAud(totals.weekendSurchargeAmount)}</span>
          </div>
        )}

        {totals.publicHolidaySurchargeAmount > 0 && (
          <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
            <span>Public Holiday +{activeVenue.surcharges.publicHolidayPercent}%</span>
            <span className="font-mono">+{formatAud(totals.publicHolidaySurchargeAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-[11px] opacity-60 pt-0.5 border-t border-slate-200 dark:border-slate-800 font-mono">
          <span>Inc 10% GST (ATO 1/11th)</span>
          <span>{formatAud(totals.gstAmount)}</span>
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-baseline pt-1 border-t border-slate-200 dark:border-slate-800 font-bold">
          <span className="text-sm">Total Due</span>
          <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {formatAud(totals.payableTotal)}
          </span>
        </div>
      </div>

      {/* Cart Action Buttons (1-Click Cash, 1-Click Card, Kitchen Fire) */}
      <div className={`p-3 border-t space-y-2 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        {/* 1-CLICK PAY ROW (Square / iPad speed style) */}
        <div className="grid grid-cols-2 gap-2">
          {/* 1-Click Cash */}
          <button
            onClick={() => {
              sounds.playTap();
              quickSettleOrder('cash');
            }}
            className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-black text-xs shadow-md transition active:scale-95"
          >
            <Banknote className="w-4 h-4" />
            <span>Exact Cash {formatAud(remainingPayable)}</span>
          </button>

          {/* 1-Click EFTPOS Card */}
          <button
            onClick={() => {
              sounds.playTap();
              quickSettleOrder('card');
            }}
            className="flex items-center justify-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white py-3 rounded-2xl font-black text-xs shadow-md transition active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            <span>Tap Card {formatAud(remainingPayable)}</span>
          </button>
        </div>

        {/* SECONDARY ROW: Fire Kitchen + Full Payment Hub / Split / Discounts */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              sounds.playTap();
              handleFireKitchen();
            }}
            className="flex items-center justify-center space-x-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl text-xs font-black transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send KDS</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              onOpenPaymentModal();
            }}
            className={`col-span-2 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
            <span>More (Split / Disc / Custom)</span>
          </button>
        </div>

        {/* Extended Split/Discount Drawer if toggled */}
        <div className="flex items-center justify-between text-[11px] pt-1 px-1">
          <button
            onClick={() => {
              sounds.playTap();
              setIsDiscountOpen(true);
            }}
            className="text-amber-500 hover:underline font-bold"
          >
            + Add Discount
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setIsSplitOpen(true);
            }}
            className="text-indigo-500 hover:underline font-bold"
          >
            ⚡ Split Bill
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
