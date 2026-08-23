// Australian Restaurant POS Data Models & Types

export type Currency = 'AUD';

export interface SurchargeSettings {
  weekendEnabled: boolean;
  weekendPercent: number; // e.g. 10%
  publicHolidayEnabled: boolean;
  publicHolidayPercent: number; // e.g. 15%
  cardSurchargeEnabled: boolean;
  cardSurchargeEftpos: number; // e.g. 0.5%
  cardSurchargeVisaMastercard: number; // e.g. 1.2%
  cardSurchargeAmex: number; // e.g. 1.8%
}

export interface VenueProfile {
  id: string;
  name: string;
  tradingName: string;
  abn: string; // Australian Business Number (11 digits, e.g. 51 824 753 556)
  phone: string;
  email: string;
  address: {
    street: string;
    suburb: string;
    state: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';
    postcode: string;
    country: 'Australia';
  };
  serviceType: 'hybrid' | 'dining' | 'cafe' | 'pub';
  logoUrl?: string;
  themeColor: string; // Primary accent hex or tailwind class
  currency: Currency;
  gstRate: number; // 0.10 (10%)
  gstRegistered: boolean;
  surcharges: SurchargeSettings;
  receiptHeader: string;
  receiptFooter: string;
  allowSplitBill: boolean;
  allowTableTransfer: boolean;
  enableKds: boolean;
}

export type DietaryTag = 'GF' | 'V' | 'VG' | 'DF' | 'NF' | 'Halal';

export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number; // AUD price adjustment (e.g. +0.80 for Oat Milk)
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string; // e.g. "Milk Option", "Steak Temperature", "Sauce", "Size"
  required: boolean;
  minSelections: number;
  maxSelections: number; // 1 for radio, >1 for multi-select checkboxes
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  venueId: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number; // AUD inclusive of 10% GST
  costPrice?: number;
  dietaryTags: DietaryTag[];
  isAvailable: boolean;
  stockCount?: number; // Optional inventory tracker
  modifierGroups?: ModifierGroup[];
  course: 'drinks' | 'entree' | 'main' | 'dessert' | 'sides';
  imageUrl?: string;
  barcode?: string;
}

export interface MenuCategory {
  id: string;
  venueId: string;
  name: string;
  iconName: string;
  displayOrder: number;
  color?: string;
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  unitPrice: number; // Base unit price (inc GST)
  quantity: number;
  selectedModifiers: SelectedModifier[];
  specialInstructions?: string;
  course: 'drinks' | 'entree' | 'main' | 'dessert' | 'sides';
  itemStatus: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  seatNumber?: number;
  assignedGuestId?: string; // For split billing
}

export type OrderType = 'dine_in' | 'takeaway' | 'bar' | 'delivery';
export type OrderStatus = 'open' | 'kitchen_pending' | 'in_kitchen' | 'ready' | 'paid' | 'cancelled';

export interface OrderDiscount {
  type: 'percent' | 'fixed';
  value: number;
  reason: string; // e.g. "Staff Discount 20%", "Senior Card 10%", "Comp / Mgr Promo"
}

export interface Order {
  id: string;
  orderNumber: number; // Sequential daily order # e.g. #104
  venueId: string;
  orderType: OrderType;
  tableId?: string;
  tableName?: string;
  sectionName?: string;
  covers?: number; // Number of guests/seats
  customerName?: string;
  buzzerNumber?: string; // For cafe / takeaway buzzer
  staffId: string;
  staffName: string;
  items: OrderItem[];
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  discount?: OrderDiscount;
  appliedWeekendSurcharge: boolean;
  appliedPublicHolidaySurcharge: boolean;
  splitPayments?: PaymentRecord[];
  isPaid: boolean;
}

export type PaymentType = 'cash' | 'eftpos' | 'visa' | 'mastercard' | 'amex' | 'gift_card';

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number; // Total amount paid in AUD (including surcharge and tip)
  baseAmount: number; // Sub-share before surcharge & tip
  surchargeAmount: number;
  tipAmount: number;
  paymentType: PaymentType;
  timestamp: string;
  cardLast4?: string;
  authCode?: string;
  tenderedCash?: number;
  changeGiven?: number;
  guestLabel?: string; // e.g. "Guest 1", "Guest 2"
}

export interface FloorSection {
  id: string;
  venueId: string;
  name: string; // e.g. "Main Dining", "Terrace / Outdoor", "Bar Lounge", "Function Room"
  color?: string;
  order?: number;
}

export interface FloorLandmark {
  id: string;
  venueId: string;
  sectionId?: string; // Optional if venue-wide
  name: string; // e.g. "Main Entrance", "Kitchen Pass", "Bar Counter"
  type: 'entrance' | 'kitchen' | 'kitchen_pass' | 'bar' | 'restroom' | 'scenery' | 'terrace_view' | 'stage' | 'host_stand';
  x: number; // Percentage 0-100%
  y: number; // Percentage 0-100%
  width?: number;
  height?: number;
  label: string;
}

export type TableStatus = 'available' | 'occupied' | 'bill_printed' | 'reserved' | 'cleaning';

export type TableShape = 'square' | 'round' | 'rectangle' | 'booth' | 'bar_stool';

export interface RestaurantTable {
  id: string;
  venueId: string;
  sectionId: string;
  name: string; // e.g. "Table 1", "T12", "Booth 4", "Bar 1"
  shape: TableShape;
  capacity: number;
  status: TableStatus;
  activeOrderId?: string;
  currentCovers?: number;
  openedAt?: string;
  serverName?: string;
  x: number; // Layout % X coordinate (0-100)
  y: number; // Layout % Y coordinate (0-100)
  width?: number; // Visual pixel/percentage scale
  height?: number;
  zone?: string;
}


export type StaffRole = 'admin' | 'manager' | 'cashier' | 'waitstaff' | 'kitchen';

export interface StaffMember {
  id: string;
  name: string;
  pin: string; // 4-digit PIN for rapid authentication
  role: StaffRole;
  avatarColor: string;
}

export interface ShiftSummary {
  id: string;
  venueId: string;
  openedByStaffId: string;
  openedByStaffName: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number; // AUD starting cash float
  closingCashCounted?: number;
  totalGrossSales: number;
  totalGst: number;
  totalNetSales: number;
  totalDiscounts: number;
  totalTips: number;
  totalSurcharges: number;
  cashSales: number;
  cardSales: number;
  refundsCount: number;
  refundsTotal: number;
  ordersCount: number;
  cashVariance?: number; // (closingCashCounted - (openingFloat + cashSales))
  isClosed: boolean;
  type: 'X-Report' | 'Z-Report';
}
