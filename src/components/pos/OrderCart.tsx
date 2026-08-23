import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Send,
  CreditCard,
  Banknote,
  Receipt,
  Split,
  History,
  AlertTriangle
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import type { Order, OrderItem } from '../../types';
import { formatAud, formatAusTime } from '../../utils/formatters';
import { calculateItemTotal, calculateOrderTotals } from '../../utils/gst';
import { DiscountModal } from './DiscountModal';
import { SplitBillModal } from './SplitBillModal';
import { OrderCompletedModal } from './OrderCompletedModal';
import { OrdersHistoryModal } from './OrdersHistoryModal';
import { ReceiptModal } from '../payments/ReceiptModal';

interface OrderCartProps {
  onOpenPaymentModal: (customAmount?: number, label?: string) => void;
}

export const OrderCart: React.FC<OrderCartProps> = ({ onOpenPaymentModal }) => {
  const { activeVenue } = useVenue();
  const {
    currentOrder,
    setCurrentOrder,
    updateItemQuantity,
    removeItemFromOrder,
    setItemCourse,
    fireOrderToKitchen,
    setOrderCustomerInfo,
    startNewTakeawayOrder,
    quickSettleOrder,
    lastCompletedOrder,
    setLastCompletedOrder,
    updateTableStatus,
  } = usePos();

  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditingGuest, setIsEditingGuest] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Safety Confirmation States
  const [isConfirmCashOpen, setIsConfirmCashOpen] = useState(false);
  const [isConfirmVoidOpen, setIsConfirmVoidOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [isKitchenFiredNotice, setIsKitchenFiredNotice] = useState(false);

  const [tempGuestName, setTempGuestName] = useState(currentOrder?.customerName || '');
  const [tempBuzzer, setTempBuzzer] = useState(currentOrder?.buzzerNumber || '');

  // If there's an active completed order modal
  const handlePrintCompleted = () => {
    if (lastCompletedOrder) {
      setSelectedReceiptOrder(lastCompletedOrder);
    }
  };

  const handleReopenCompleted = () => {
    if (lastCompletedOrder) {
      const reopened: Order = {
        ...lastCompletedOrder,
        isPaid: false,
        status: 'open',
        splitPayments: [],
      };

      if (reopened.tableId) {
        updateTableStatus(reopened.tableId, 'occupied');
      }
      setCurrentOrder(reopened);
      setLastCompletedOrder(null);
    }
  };

  if (!currentOrder || currentOrder.items.length === 0) {
    return (
      <div className="w-full lg:w-96 xl:w-[400px] bg-white flex flex-col h-full border-l border-slate-200 p-6 justify-between text-slate-400 select-none">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400 border border-slate-200">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Current Sale Empty
          </h3>
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            Select items from the catalog or open a table to start an order.
          </p>

          <div className="flex flex-col space-y-2.5 w-full max-w-xs">
            <button
              onClick={() => startNewTakeawayOrder()}
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-3.5 rounded-xl transition shadow-xs"
            >
              Start Counter / Bar Order
            </button>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold py-3 rounded-xl border border-slate-200 transition"
            >
              <History className="w-4 h-4" />
              <span>Recall / View Past Orders</span>
            </button>
          </div>
        </div>

        {/* Order Completed Modal */}
        {lastCompletedOrder && (
          <OrderCompletedModal
            order={lastCompletedOrder}
            onClose={() => setLastCompletedOrder(null)}
            onPrintReceipt={handlePrintCompleted}
            onReopenOrder={handleReopenCompleted}
            onNewSale={() => {
              setLastCompletedOrder(null);
              startNewTakeawayOrder();
            }}
          />
        )}

        {/* Orders History Modal */}
        {isHistoryOpen && (
          <OrdersHistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            onSelectOrderToPrint={order => setSelectedReceiptOrder(order)}
          />
        )}

        {/* Receipt Modal */}
        {selectedReceiptOrder && (
          <ReceiptModal
            order={selectedReceiptOrder}
            isOpen={!!selectedReceiptOrder}
            onClose={() => setSelectedReceiptOrder(null)}
          />
        )}
      </div>
    );
  }

  const totals = calculateOrderTotals(currentOrder, activeVenue);
  const totalPaidSoFar = (currentOrder.splitPayments || []).reduce((sum, p) => sum + p.baseAmount, 0);
  const remainingPayable = Math.max(0, totals.payableTotal - totalPaidSoFar);

  const courseOptions: OrderItem['course'][] = ['drinks', 'entree', 'main', 'dessert', 'sides'];

  const handleFireKitchen = () => {
    fireOrderToKitchen();
    setIsKitchenFiredNotice(true);
    setTimeout(() => setIsKitchenFiredNotice(false), 2500);
  };

  const handleSaveGuestInfo = () => {
    setOrderCustomerInfo(tempGuestName || 'Takeaway Guest', tempBuzzer);
    setIsEditingGuest(false);
  };

  const handleConfirmCashPayment = () => {
    quickSettleOrder('cash');
    setIsConfirmCashOpen(false);
  };

  const handleConfirmVoidOrder = () => {
    if (currentOrder.tableId) {
      updateTableStatus(currentOrder.tableId, 'available');
    }
    setCurrentOrder(null);
    setIsConfirmVoidOpen(false);
  };

  return (
    <div className="w-full lg:w-96 xl:w-[400px] bg-white flex flex-col h-full border-l border-slate-200 text-slate-900 select-none shadow-xs">
      {/* Top Header: Order Info (Larger Text) */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
              #{currentOrder.orderNumber}
            </span>
            <h3 className="font-bold text-base text-slate-900 truncate max-w-[150px]">
              {currentOrder.tableName ? `Table ${currentOrder.tableName}` : (currentOrder.customerName || 'Takeaway')}
            </h3>
            {currentOrder.buzzerNumber && (
              <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                Buzzer {currentOrder.buzzerNumber}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {currentOrder.staffName} • {formatAusTime(currentOrder.createdAt)}
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsHistoryOpen(true)}
            title="View Past Orders"
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 shadow-xs"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setTempGuestName(currentOrder.customerName || '');
              setTempBuzzer(currentOrder.buzzerNumber || '');
              setIsEditingGuest(!isEditingGuest);
            }}
            className="text-xs text-slate-700 hover:text-slate-900 font-bold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-xs"
          >
            {isEditingGuest ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Guest Info Edit Bar */}
      {isEditingGuest && (
        <div className="p-3 bg-slate-100 border-b border-slate-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Guest Name"
              value={tempGuestName}
              onChange={e => setTempGuestName(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-medium"
            />
            <input
              type="text"
              placeholder="Buzzer #"
              value={tempBuzzer}
              onChange={e => setTempBuzzer(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none"
            />
          </div>
          <button
            onClick={handleSaveGuestInfo}
            className="w-full bg-slate-900 text-white text-xs font-bold py-1.5 rounded-lg transition"
          >
            Save Info
          </button>
        </div>
      )}

      {/* Kitchen Fired Success Notice */}
      {isKitchenFiredNotice && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 p-2.5 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Send className="w-4 h-4" />
            <span>Fired {currentOrder.items.length} items to Kitchen (KDS)!</span>
          </span>
        </div>
      )}

      {/* Items List (Receipt Ticket Style with Larger Text) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
        {currentOrder.items.map(item => {
          const itemTotal = calculateItemTotal(item);

          return (
            <div key={item.id} className="pt-2.5 first:pt-0 space-y-1.5">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <div className="flex items-center space-x-1.5">
                    {item.seatNumber && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold">
                        P{item.seatNumber}
                      </span>
                    )}
                    <span className="font-bold text-sm text-slate-900 leading-snug">{item.name}</span>
                  </div>

                  {/* Modifiers List */}
                  {item.selectedModifiers.length > 0 && (
                    <div className="mt-1 space-y-0.5 text-xs text-slate-600 pl-2">
                      {item.selectedModifiers.map((mod, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span>• {mod.optionName}</span>
                          {mod.priceDelta > 0 && (
                            <span className="font-mono text-xs text-slate-800 font-bold">
                              +{formatAud(mod.priceDelta)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Kitchen Notes */}
                  {item.specialInstructions && (
                    <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded mt-1 italic font-medium">
                      Note: {item.specialInstructions}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-sm sm:text-base text-slate-900 block">
                    {formatAud(itemTotal)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {formatAud(item.unitPrice)} ea
                  </span>
                </div>
              </div>

              {/* Quantity Stepper & Course */}
              <div className="flex items-center justify-between pt-1">
                <select
                  value={item.course}
                  onChange={e => setItemCourse(item.id, e.target.value as OrderItem['course'])}
                  className="bg-slate-100 border border-slate-200 text-xs font-bold uppercase text-slate-700 rounded-lg px-2 py-1 focus:outline-none"
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
                        setItemToRemove(item.id);
                      } else {
                        updateItemQuantity(item.id, -1);
                      }
                    }}
                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center border border-slate-200 transition"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-600" /> : <Minus className="w-3.5 h-3.5" />}
                  </button>

                  <span className="w-6 text-center font-mono font-bold text-sm text-slate-900">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateItemQuantity(item.id, 1)}
                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center border border-slate-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Summary Breakdown (Larger Text) */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-1.5 text-xs sm:text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-mono font-bold text-slate-900">{formatAud(totals.itemsSubtotal)}</span>
        </div>

        {totals.discountAmount > 0 && (
          <div className="flex justify-between text-amber-800 font-bold">
            <span>Discount ({currentOrder.discount?.reason})</span>
            <span className="font-mono">-{formatAud(totals.discountAmount)}</span>
          </div>
        )}

        {totals.weekendSurchargeAmount > 0 && (
          <div className="flex justify-between text-amber-800 font-bold">
            <span>Weekend Surcharge (+{activeVenue.surcharges.weekendPercent}%)</span>
            <span className="font-mono">+{formatAud(totals.weekendSurchargeAmount)}</span>
          </div>
        )}

        {totals.publicHolidaySurchargeAmount > 0 && (
          <div className="flex justify-between text-rose-800 font-bold">
            <span>Public Holiday (+{activeVenue.surcharges.publicHolidayPercent}%)</span>
            <span className="font-mono">+{formatAud(totals.publicHolidaySurchargeAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-200 font-mono">
          <span>Includes 10% GST (1/11th)</span>
          <span className="font-bold">{formatAud(totals.gstAmount)}</span>
        </div>

        <div className="flex justify-between items-baseline pt-2 border-t border-slate-300 font-black text-slate-900">
          <span className="text-base font-bold">Total Due</span>
          <span className="text-2xl sm:text-3xl font-mono text-slate-900">
            {formatAud(totals.payableTotal)}
          </span>
        </div>
      </div>

      {/* Checkout Actions (Larger Tactile Buttons) */}
      <div className="p-3.5 bg-white border-t border-slate-200 space-y-2.5">
        {/* Full-width Charge Button */}
        <button
          onClick={() => onOpenPaymentModal()}
          className="w-full bg-[#10b981] hover:bg-[#059669] active:bg-[#047857] text-white py-4 rounded-xl font-black text-lg shadow-sm transition transform active:translate-y-0.5 flex items-center justify-center space-x-2"
        >
          <CreditCard className="w-6 h-6" />
          <span>Charge {formatAud(remainingPayable)}</span>
        </button>

        {/* 1-Click Fast Tender & Kitchen Shortcuts */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setIsConfirmCashOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 flex items-center justify-center space-x-1 transition"
          >
            <Banknote className="w-4 h-4" />
            <span>Exact Cash</span>
          </button>

          <button
            onClick={handleFireKitchen}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-amber-300 flex items-center justify-center space-x-1 transition"
          >
            <Send className="w-4 h-4" />
            <span>Send KDS</span>
          </button>

          <button
            onClick={() => setIsSplitOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 flex items-center justify-center space-x-1 transition"
          >
            <Split className="w-4 h-4" />
            <span>Split Bill</span>
          </button>
        </div>

        {/* Secondary Safety Controls: Void Order & Discount */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
          <button
            onClick={() => setIsDiscountOpen(true)}
            className="text-amber-800 font-bold hover:underline"
          >
            + Add Discount
          </button>

          <button
            onClick={() => setIsConfirmVoidOpen(true)}
            className="text-rose-600 font-bold hover:underline"
          >
            Void / Cancel Order
          </button>
        </div>
      </div>

      {/* 1. Confirm Cash Payment Safety Modal */}
      {isConfirmCashOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-slate-900">
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">Confirm Cash Payment</h3>
            <p className="text-sm text-slate-600 mb-5">
              Complete exact cash sale of <strong className="text-slate-900 font-mono text-base">{formatAud(remainingPayable)}</strong> for{' '}
              {currentOrder.tableName ? `Table ${currentOrder.tableName}` : 'Takeaway'}?
            </p>

            <div className="flex justify-end space-x-2.5">
              <button
                onClick={() => setIsConfirmCashOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmCashPayment}
                className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirm Cash & Settle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Confirm Void Order Safety Modal */}
      {isConfirmVoidOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-slate-900">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1.5">Void Current Order?</h3>
            <p className="text-sm text-slate-600 text-center mb-5">
              Are you sure you want to void Order #{currentOrder.orderNumber}? All {currentOrder.items.length} items will be cleared.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setIsConfirmVoidOpen(false)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Keep Order
              </button>

              <button
                onClick={handleConfirmVoidOrder}
                className="py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Yes, Void Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Confirm Item Removal Modal */}
      {itemToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Remove Item?</h3>
            <p className="text-sm text-slate-600 mb-5">
              Remove "{currentOrder.items.find(i => i.id === itemToRemove)?.name}" from the active order?
            </p>

            <div className="flex justify-end space-x-2.5">
              <button
                onClick={() => setItemToRemove(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Keep Item
              </button>

              <button
                onClick={() => {
                  removeItemFromOrder(itemToRemove);
                  setItemToRemove(null);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Order Completed Success Modal */}
      {lastCompletedOrder && (
        <OrderCompletedModal
          order={lastCompletedOrder}
          onClose={() => setLastCompletedOrder(null)}
          onPrintReceipt={handlePrintCompleted}
          onReopenOrder={handleReopenCompleted}
          onNewSale={() => {
            setLastCompletedOrder(null);
            startNewTakeawayOrder();
          }}
        />
      )}

      {/* 5. Orders History Modal */}
      {isHistoryOpen && (
        <OrdersHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectOrderToPrint={order => setSelectedReceiptOrder(order)}
        />
      )}

      {/* 6. Modals */}
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

      {/* 7. Tax Invoice / Receipt Modal */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          isOpen={!!selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}
    </div>
  );
};
