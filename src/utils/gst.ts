import type { Order, OrderItem, PaymentType, VenueProfile } from '../types';


export interface OrderFinancialSummary {
  itemsSubtotal: number; // Sum of items inc GST
  discountAmount: number;
  discountedSubtotal: number;
  weekendSurchargeAmount: number;
  publicHolidaySurchargeAmount: number;
  surchargesTotal: number;
  payableTotal: number; // Final payable amount
  gstAmount: number; // 1/11th of taxable total according to ATO
  netAmountExGst: number; // Payable minus GST
}

/**
 * Calculates the exact Australian ATO GST (1/11th of GST-inclusive price)
 */
export function calculateGstInclusive(amountIncGst: number): number {
  return Number((amountIncGst / 11).toFixed(2));
}

/**
 * Calculates item total with selected modifiers and quantity
 */
export function calculateItemTotal(item: OrderItem): number {
  const modifiersDelta = item.selectedModifiers.reduce((sum, mod) => sum + mod.priceDelta, 0);
  const singleUnitPrice = item.unitPrice + modifiersDelta;
  return Number((singleUnitPrice * item.quantity).toFixed(2));
}

/**
 * Computes complete financial totals for an order based on venue surcharge rules and discounts
 */
export function calculateOrderTotals(
  order: Partial<Order>,
  venue: VenueProfile,
  isWeekendOverride?: boolean,
  isHolidayOverride?: boolean
): OrderFinancialSummary {
  const items = order.items || [];
  
  // 1. Calculate items subtotal
  const itemsSubtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  // 2. Calculate discount
  let discountAmount = 0;
  if (order.discount && itemsSubtotal > 0) {
    if (order.discount.type === 'percent') {
      discountAmount = (itemsSubtotal * order.discount.value) / 100;
    } else {
      discountAmount = Math.min(order.discount.value, itemsSubtotal);
    }
  }
  discountAmount = Number(discountAmount.toFixed(2));
  const discountedSubtotal = Math.max(0, itemsSubtotal - discountAmount);

  // 3. Weekend surcharge
  const applyWeekend = isWeekendOverride !== undefined 
    ? isWeekendOverride 
    : (order.appliedWeekendSurcharge ?? venue.surcharges.weekendEnabled);
    
  let weekendSurchargeAmount = 0;
  if (applyWeekend && venue.surcharges.weekendPercent > 0) {
    weekendSurchargeAmount = (discountedSubtotal * venue.surcharges.weekendPercent) / 100;
  }
  weekendSurchargeAmount = Number(weekendSurchargeAmount.toFixed(2));

  // 4. Public holiday surcharge
  const applyHoliday = isHolidayOverride !== undefined 
    ? isHolidayOverride 
    : (order.appliedPublicHolidaySurcharge ?? venue.surcharges.publicHolidayEnabled);

  let publicHolidaySurchargeAmount = 0;
  if (applyHoliday && venue.surcharges.publicHolidayPercent > 0) {
    publicHolidaySurchargeAmount = (discountedSubtotal * venue.surcharges.publicHolidayPercent) / 100;
  }
  publicHolidaySurchargeAmount = Number(publicHolidaySurchargeAmount.toFixed(2));

  const surchargesTotal = weekendSurchargeAmount + publicHolidaySurchargeAmount;
  const payableTotal = Number((discountedSubtotal + surchargesTotal).toFixed(2));

  // 5. Australian GST breakdown (1/11th rule for GST-registered Australian businesses)
  const gstAmount = venue.gstRegistered ? calculateGstInclusive(payableTotal) : 0;
  const netAmountExGst = Number((payableTotal - gstAmount).toFixed(2));

  return {
    itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
    discountAmount,
    discountedSubtotal: Number(discountedSubtotal.toFixed(2)),
    weekendSurchargeAmount,
    publicHolidaySurchargeAmount,
    surchargesTotal: Number(surchargesTotal.toFixed(2)),
    payableTotal,
    gstAmount,
    netAmountExGst,
  };
}

/**
 * Calculates payment card surcharge based on payment method
 */
export function calculatePaymentCardSurcharge(
  baseAmount: number,
  paymentType: PaymentType,
  venue: VenueProfile
): { rate: number; surchargeAmount: number; totalWithSurcharge: number } {
  if (!venue.surcharges.cardSurchargeEnabled || paymentType === 'cash' || paymentType === 'gift_card') {
    return { rate: 0, surchargeAmount: 0, totalWithSurcharge: baseAmount };
  }

  let rate = 0;
  switch (paymentType) {
    case 'eftpos':
      rate = venue.surcharges.cardSurchargeEftpos;
      break;
    case 'visa':
    case 'mastercard':
      rate = venue.surcharges.cardSurchargeVisaMastercard;
      break;
    case 'amex':
      rate = venue.surcharges.cardSurchargeAmex;
      break;
  }

  const surchargeAmount = Number(((baseAmount * rate) / 100).toFixed(2));
  const totalWithSurcharge = Number((baseAmount + surchargeAmount).toFixed(2));

  return {
    rate,
    surchargeAmount,
    totalWithSurcharge,
  };
}
