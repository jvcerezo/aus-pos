import React, { useState } from 'react';
import { ProductGrid } from './ProductGrid';
import { OrderCart } from './OrderCart';
import { PaymentModal } from '../payments/PaymentModal';
import { ReceiptModal } from '../payments/ReceiptModal';
import { usePos } from '../../context/PosContext';

export const PosScreen: React.FC = () => {
  const { lastCompletedOrder, setLastCompletedOrder } = usePos();
  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    customAmount?: number;
    guestLabel?: string;
  }>({
    isOpen: false,
  });

  const handleOpenPayment = (customAmount?: number, guestLabel?: string) => {
    setPaymentModalData({
      isOpen: true,
      customAmount,
      guestLabel,
    });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-5.75rem)] bg-slate-100 overflow-hidden">
      {/* Left: Active Tickets Switcher & Menu Product Grid */}
      <ProductGrid />

      {/* Right: Order Cart & Bill Totals */}
      <OrderCart onOpenPaymentModal={handleOpenPayment} />

      {/* Payment Hub Modal */}
      {paymentModalData.isOpen && (
        <PaymentModal
          isOpen={paymentModalData.isOpen}
          customAmount={paymentModalData.customAmount}
          guestLabel={paymentModalData.guestLabel}
          onClose={() => setPaymentModalData({ isOpen: false })}
        />
      )}

      {/* Receipt / ATO Tax Invoice Modal */}
      {lastCompletedOrder && (
        <ReceiptModal
          order={lastCompletedOrder}
          isOpen={!!lastCompletedOrder}
          onClose={() => setLastCompletedOrder(null)}
        />
      )}
    </div>
  );
};
