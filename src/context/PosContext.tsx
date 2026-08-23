import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  FloorLandmark,
  FloorSection,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  PaymentRecord,
  RestaurantTable,
  ShiftSummary,
  TableStatus,
} from '../types';

import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from '../data/initialMenu';
import { INITIAL_LANDMARKS, INITIAL_SECTIONS, INITIAL_TABLES } from '../data/initialTables';
import { INITIAL_ORDERS, INITIAL_SHIFT } from '../data/initialOrders';
import { useVenue } from './VenueContext';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/formatters';
import { calculateOrderTotals } from '../utils/gst';
import { sounds } from '../utils/sound';

interface PosContextType {
  // Navigation & View Mode
  activeMode: 'tables' | 'pos' | 'kds' | 'reports' | 'admin';
  setActiveMode: (mode: 'tables' | 'pos' | 'kds' | 'reports' | 'admin') => void;

  // Floor Tables, Sections & Landmarks (Admin Customization)
  sections: FloorSection[];
  tables: RestaurantTable[];
  landmarks: FloorLandmark[];
  activeTable: RestaurantTable | null;
  setActiveTable: (table: RestaurantTable | null) => void;
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  transferTable: (fromTableId: string, toTableId: string) => void;
  addTable: (table: RestaurantTable) => void;
  updateTable: (table: RestaurantTable) => void;
  deleteTable: (tableId: string) => void;
  moveTablePosition: (tableId: string, x: number, y: number) => void;
  addSection: (section: FloorSection) => void;
  updateSection: (section: FloorSection) => void;
  deleteSection: (sectionId: string) => void;
  addLandmark: (landmark: FloorLandmark) => void;
  updateLandmark: (landmark: FloorLandmark) => void;
  deleteLandmark: (landmarkId: string) => void;

  // Menu & Categories Catalog (Admin Customization)
  categories: MenuCategory[];
  menuItems: MenuItem[];
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  addCategory: (cat: MenuCategory) => void;
  updateCategory: (cat: MenuCategory) => void;
  deleteCategory: (catId: string) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;

  // Active Draft Order / Cart
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  startNewTakeawayOrder: () => void;
  openTableOrder: (table: RestaurantTable) => void;
  addItemToOrder: (item: MenuItem, selectedModifiers?: OrderItem['selectedModifiers'], instructions?: string, seat?: number) => void;
  updateItemQuantity: (orderItemId: string, delta: number) => void;
  removeItemFromOrder: (orderItemId: string) => void;
  setItemCourse: (orderItemId: string, course: OrderItem['course']) => void;
  setItemInstructions: (orderItemId: string, instructions: string) => void;
  applyOrderDiscount: (type: 'percent' | 'fixed', value: number, reason: string) => void;
  removeOrderDiscount: () => void;
  toggleWeekendSurcharge: () => void;
  toggleHolidaySurcharge: () => void;
  setOrderCustomerInfo: (name: string, buzzer?: string, covers?: number) => void;

  // Kitchen / Order Operations
  allOrders: Order[];
  fireOrderToKitchen: () => void;
  updateOrderItemStatus: (orderId: string, itemId: string, newStatus: OrderItem['itemStatus']) => void;
  bumpEntireOrder: (orderId: string) => void;

  // UI Theme & Simplicity Mode
  uiTheme: 'dark' | 'light';
  toggleUiTheme: () => void;
  isSimpleMode: boolean;
  toggleSimpleMode: () => void;

  // Payments & Settlements
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'timestamp'>) => void;
  quickSettleOrder: (type: 'cash' | 'card') => void;
  completedPayments: PaymentRecord[];
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;

  // Shift & End-of-Day (Z-Report)
  currentShift: ShiftSummary;
  updateShiftFloat: (newFloat: number) => void;
  closeShiftZReport: (closingCashCounted: number) => ShiftSummary;
  shiftHistory: ShiftSummary[];
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeVenue } = useVenue();
  const { currentStaff } = useAuth();

  const [activeMode, setActiveMode] = useState<'tables' | 'pos' | 'kds' | 'reports' | 'admin'>(
    activeVenue.serviceType === 'cafe' ? 'pos' : 'tables'
  );


  // Theme & Mode states (persisted)
  const [uiTheme, setUiTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('aus_pos_theme') as 'dark' | 'light') || 'dark';
  });

  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(() => {
    return localStorage.getItem('aus_pos_simple_mode') === 'true';
  });

  const toggleUiTheme = () => {
    sounds.playTap();
    setUiTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('aus_pos_theme', next);
      return next;
    });
  };

  const toggleSimpleMode = () => {
    sounds.playTap();
    setIsSimpleMode(prev => {
      const next = !prev;
      localStorage.setItem('aus_pos_simple_mode', String(next));
      return next;
    });
  };


  // When venue changes, switch default view mode appropriately
  useEffect(() => {
    if (activeVenue.serviceType === 'cafe') {
      setActiveMode('pos');
    }
  }, [activeVenue.id, activeVenue.serviceType]);

  // Persistence keys
  const SECTIONS_KEY = 'aus_pos_sections_v1';
  const TABLES_KEY = 'aus_pos_tables_v1';
  const LANDMARKS_KEY = 'aus_pos_landmarks_v1';
  const CATEGORIES_KEY = 'aus_pos_categories_v1';
  const MENU_KEY = 'aus_pos_menu_v1';

  // Floor Tables, Sections & Landmarks State (with LocalStorage)
  const [sections, setSections] = useState<FloorSection[]>(() => {
    const saved = localStorage.getItem(SECTIONS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SECTIONS;
  });

  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    const saved = localStorage.getItem(TABLES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [landmarks, setLandmarks] = useState<FloorLandmark[]>(() => {
    const saved = localStorage.getItem(LANDMARKS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_LANDMARKS;
  });

  const [activeTable, setActiveTable] = useState<RestaurantTable | null>(null);

  // Menu & Categories State (with LocalStorage)
  const [categories, setCategories] = useState<MenuCategory[]>(() => {
    const saved = localStorage.getItem(CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(MENU_KEY);
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem(TABLES_KEY, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(LANDMARKS_KEY, JSON.stringify(landmarks));
  }, [landmarks]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(MENU_KEY, JSON.stringify(menuItems));
  }, [menuItems]);


  // Orders State
  const [allOrders, setAllOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [completedPayments, setCompletedPayments] = useState<PaymentRecord[]>([]);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Shift & Cashup State
  const [currentShift, setCurrentShift] = useState<ShiftSummary>(INITIAL_SHIFT);
  const [shiftHistory, setShiftHistory] = useState<ShiftSummary[]>([]);

  // Filter items & categories for active venue
  const venueCategories = categories.filter(c => c.venueId === activeVenue.id);
  useEffect(() => {
    if (venueCategories.length > 0) {
      setSelectedCategory(venueCategories[0].id);
    } else {
      setSelectedCategory(null);
    }
  }, [activeVenue.id]);

  // Create or Open Table Order
  const openTableOrder = (table: RestaurantTable) => {
    setActiveTable(table);
    // Find existing open order for this table
    const existing = allOrders.find(o => o.tableId === table.id && !o.isPaid);
    if (existing) {
      setCurrentOrder(existing);
    } else {
      // Create new table order
      const newOrder: Order = {
        id: generateId('ord'),
        orderNumber: allOrders.length + 101,
        venueId: activeVenue.id,
        orderType: 'dine_in',
        tableId: table.id,
        tableName: table.name,
        sectionName: sections.find(s => s.id === table.sectionId)?.name || 'Main',
        covers: table.capacity,
        staffId: currentStaff.id,
        staffName: currentStaff.name,
        items: [],
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appliedWeekendSurcharge: activeVenue.surcharges.weekendEnabled,
        appliedPublicHolidaySurcharge: activeVenue.surcharges.publicHolidayEnabled,
        isPaid: false,
      };
      setCurrentOrder(newOrder);
      setAllOrders(prev => [...prev, newOrder]);
      updateTableStatus(table.id, 'occupied');
    }
    setActiveMode('pos');
  };

  // Start new Takeaway / Cafe Order
  const startNewTakeawayOrder = () => {
    setActiveTable(null);
    const newOrder: Order = {
      id: generateId('ord_tkw'),
      orderNumber: allOrders.length + 101,
      venueId: activeVenue.id,
      orderType: 'takeaway',
      customerName: 'Takeaway Guest',
      buzzerNumber: `${Math.floor(Math.random() * 89 + 10)}`,
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      items: [],
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      appliedWeekendSurcharge: activeVenue.surcharges.weekendEnabled,
      appliedPublicHolidaySurcharge: activeVenue.surcharges.publicHolidayEnabled,
      isPaid: false,
    };
    setCurrentOrder(newOrder);
    setAllOrders(prev => [...prev, newOrder]);
    setActiveMode('pos');
  };

  const updateTableStatus = (tableId: string, status: TableStatus) => {
    setTables(prev =>
      prev.map(t => (t.id === tableId ? { ...t, status } : t))
    );
  };

  const transferTable = (fromTableId: string, toTableId: string) => {
    const fromTable = tables.find(t => t.id === fromTableId);
    const toTable = tables.find(t => t.id === toTableId);
    if (!fromTable || !toTable) return;

    // Find order
    const order = allOrders.find(o => o.tableId === fromTableId && !o.isPaid);
    if (order) {
      const updatedOrder = {
        ...order,
        tableId: toTable.id,
        tableName: toTable.name,
        sectionName: sections.find(s => s.id === toTable.sectionId)?.name || '',
      };

      setAllOrders(prev => prev.map(o => (o.id === order.id ? updatedOrder : o)));
      if (currentOrder && currentOrder.id === order.id) {
        setCurrentOrder(updatedOrder);
      }
    }

    setTables(prev =>
      prev.map(t => {
        if (t.id === fromTableId) return { ...t, status: 'available', activeOrderId: undefined, currentCovers: undefined };
        if (t.id === toTableId) return { ...t, status: 'occupied', activeOrderId: order?.id, currentCovers: fromTable.currentCovers };
        return t;
      })
    );
    sounds.playTap();
  };

  // Add Item to active Order
  const addItemToOrder = (
    item: MenuItem,
    selectedModifiers: OrderItem['selectedModifiers'] = [],
    instructions?: string,
    seat?: number
  ) => {
    if (!currentOrder) {
      // Auto create a takeaway order if none is active
      startNewTakeawayOrder();
    }

    const targetOrder = currentOrder || {
      id: generateId('ord'),
      orderNumber: allOrders.length + 101,
      venueId: activeVenue.id,
      orderType: 'takeaway' as const,
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      items: [],
      status: 'open' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      appliedWeekendSurcharge: activeVenue.surcharges.weekendEnabled,
      appliedPublicHolidaySurcharge: activeVenue.surcharges.publicHolidayEnabled,
      isPaid: false,
    };

    const newItem: OrderItem = {
      id: generateId('item'),
      menuItemId: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity: 1,
      selectedModifiers,
      specialInstructions: instructions,
      course: item.course,
      itemStatus: 'pending',
      seatNumber: seat || 1,
    };

    const updatedOrder: Order = {
      ...targetOrder,
      items: [...targetOrder.items, newItem],
      updatedAt: new Date().toISOString(),
    };

    setCurrentOrder(updatedOrder);
    setAllOrders(prev => {
      const exists = prev.some(o => o.id === updatedOrder.id);
      return exists ? prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)) : [...prev, updatedOrder];
    });

    sounds.playItemAdd();
  };

  const updateItemQuantity = (orderItemId: string, delta: number) => {
    if (!currentOrder) return;
    const item = currentOrder.items.find(i => i.id === orderItemId);
    if (!item) return;

    let updatedItems: OrderItem[];
    if (item.quantity + delta <= 0) {
      updatedItems = currentOrder.items.filter(i => i.id !== orderItemId);
    } else {
      updatedItems = currentOrder.items.map(i =>
        i.id === orderItemId ? { ...i, quantity: i.quantity + delta } : i
      );
    }

    const updatedOrder: Order = {
      ...currentOrder,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    setCurrentOrder(updatedOrder);
    setAllOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
    sounds.playTap();
  };

  const removeItemFromOrder = (orderItemId: string) => {
    if (!currentOrder) return;
    const updatedOrder: Order = {
      ...currentOrder,
      items: currentOrder.items.filter(i => i.id !== orderItemId),
      updatedAt: new Date().toISOString(),
    };
    setCurrentOrder(updatedOrder);
    setAllOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
    sounds.playTap();
  };

  const setItemCourse = (orderItemId: string, course: OrderItem['course']) => {
    if (!currentOrder) return;
    const updatedOrder: Order = {
      ...currentOrder,
      items: currentOrder.items.map(i => (i.id === orderItemId ? { ...i, course } : i)),
      updatedAt: new Date().toISOString(),
    };
    setCurrentOrder(updatedOrder);
    setAllOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
  };

  const setItemInstructions = (orderItemId: string, instructions: string) => {
    if (!currentOrder) return;
    const updatedOrder: Order = {
      ...currentOrder,
      items: currentOrder.items.map(i => (i.id === orderItemId ? { ...i, specialInstructions: instructions } : i)),
      updatedAt: new Date().toISOString(),
    };
    setCurrentOrder(updatedOrder);
    setAllOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
  };

  const applyOrderDiscount = (type: 'percent' | 'fixed', value: number, reason: string) => {
    if (!currentOrder) return;
    const updatedOrder: Order = {
      ...currentOrder,
      discount: { type, value, reason },
      updatedAt: new Date().toISOString(),
    };
    setCurrentOrder(updatedOrder);
    setAllOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
    sounds.playTap();
  };

  const removeOrderDiscount = () => {
    if (!currentOrder) return;
    const updatedOrder: Order = {
      ...currentOrder,
      discount: undefined,
      updatedAt: new Date().toISOString(),
    };
    setCurrentOrder(updatedOrder);
    setAllOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
    sounds.playTap();
  };

  const toggleWeekendSurcharge = () => {
    if (!currentOrder) return;
    const updatedOrder: Order = {
      ...currentOrder,
      appliedWeekendSurcharge: !currentOrder.appliedWeekendSurcharge,
      updatedAt: new Date().toISOString(),
    };
    setCurrentOrder(updatedOrder);
    setAllOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
    sounds.playTap();
  };

  const toggleHolidaySurcharge = () => {
    if (!currentOrder) return;
    const updatedOrder: Order = {
      ...currentOrder,
      appliedPublicHolidaySurcharge: !currentOrder.appliedPublicHolidaySurcharge,
      updatedAt: new Date().toISOString(),
    };
    setCurrentOrder(updatedOrder);
    setAllOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
    sounds.playTap();
  };

  const setOrderCustomerInfo = (name: string, buzzer?: string, covers?: number) => {
    if (!currentOrder) return;
    const updatedOrder: Order = {
      ...currentOrder,
      customerName: name,
      buzzerNumber: buzzer,
      covers: covers || currentOrder.covers,
      updatedAt: new Date().toISOString(),
    };
    setCurrentOrder(updatedOrder);
    setAllOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
  };

  // Fire / Send Order to Kitchen (KDS)
  const fireOrderToKitchen = () => {
    if (!currentOrder || currentOrder.items.length === 0) return;
    const updatedItems = currentOrder.items.map(item => ({
      ...item,
      itemStatus: item.itemStatus === 'pending' ? ('preparing' as const) : item.itemStatus,
    }));

    const updatedOrder: Order = {
      ...currentOrder,
      items: updatedItems,
      status: 'in_kitchen',
      updatedAt: new Date().toISOString(),
    };

    setCurrentOrder(updatedOrder);
    setAllOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
    sounds.playKitchenBell();
  };

  // KDS Item Status Toggle
  const updateOrderItemStatus = (orderId: string, itemId: string, newStatus: OrderItem['itemStatus']) => {
    setAllOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map(item =>
          item.id === itemId ? { ...item, itemStatus: newStatus } : item
        );
        const allReady = updatedItems.every(i => i.itemStatus === 'ready' || i.itemStatus === 'served');
        const updatedStatus = allReady ? ('ready' as const) : order.status;
        const res = { ...order, items: updatedItems, status: updatedStatus, updatedAt: new Date().toISOString() };
        if (currentOrder && currentOrder.id === orderId) {
          setCurrentOrder(res);
        }
        return res;
      })
    );
    sounds.playTap();
  };

  // KDS Bump entire order
  const bumpEntireOrder = (orderId: string) => {
    setAllOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map(i => ({ ...i, itemStatus: 'ready' as const }));
        const res = { ...order, items: updatedItems, status: 'ready' as const, updatedAt: new Date().toISOString() };
        if (currentOrder && currentOrder.id === orderId) {
          setCurrentOrder(res);
        }
        return res;
      })
    );
    sounds.playPaymentSuccess();
  };

  // Record Payment & Settle Order
  const recordPayment = (paymentData: Omit<PaymentRecord, 'id' | 'timestamp'>) => {
    if (!currentOrder) return;
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: generateId('pay'),
      timestamp: new Date().toISOString(),
    };

    const existingPayments = currentOrder.splitPayments || [];
    const updatedPayments = [...existingPayments, newPayment];
    const totalPaidSoFar = updatedPayments.reduce((sum, p) => sum + p.baseAmount, 0);

    const totals = calculateOrderTotals(currentOrder, activeVenue);
    const isFullyPaid = totalPaidSoFar >= totals.discountedSubtotal - 0.01;

    const updatedOrder: Order = {
      ...currentOrder,
      splitPayments: updatedPayments,
      isPaid: isFullyPaid,
      status: isFullyPaid ? 'paid' : currentOrder.status,
      updatedAt: new Date().toISOString(),
    };

    setCompletedPayments(prev => [...prev, newPayment]);
    setAllOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));

    // Update Live Shift Totals
    const isCard = paymentData.paymentType !== 'cash' && paymentData.paymentType !== 'gift_card';
    setCurrentShift(prev => ({
      ...prev,
      totalGrossSales: prev.totalGrossSales + paymentData.amount,
      totalGst: prev.totalGst + (activeVenue.gstRegistered ? (paymentData.amount / 11) : 0),
      totalNetSales: prev.totalNetSales + (paymentData.amount - (activeVenue.gstRegistered ? (paymentData.amount / 11) : 0)),
      totalTips: prev.totalTips + paymentData.tipAmount,
      totalSurcharges: prev.totalSurcharges + paymentData.surchargeAmount,
      cashSales: !isCard ? prev.cashSales + paymentData.baseAmount : prev.cashSales,
      cardSales: isCard ? prev.cardSales + paymentData.amount : prev.cardSales,
      ordersCount: isFullyPaid ? prev.ordersCount + 1 : prev.ordersCount,
    }));

    if (isFullyPaid) {
      setLastCompletedOrder(updatedOrder);
      if (updatedOrder.tableId) {
        updateTableStatus(updatedOrder.tableId, 'available');
      }
      setCurrentOrder(null);
      setActiveTable(null);
      sounds.playPaymentSuccess();
    } else {
      setCurrentOrder(updatedOrder);
      sounds.playTap();
    }
  };

  // 1-Click Quick Settle (Cash or Card)
  const quickSettleOrder = (type: 'cash' | 'card') => {
    if (!currentOrder || currentOrder.items.length === 0) return;
    const totals = calculateOrderTotals(currentOrder, activeVenue);
    const totalPaidSoFar = (currentOrder.splitPayments || []).reduce((sum, p) => sum + p.baseAmount, 0);
    const remainingBase = Math.max(0, totals.payableTotal - totalPaidSoFar);

    if (type === 'cash') {
      recordPayment({
        orderId: currentOrder.id,
        amount: remainingBase,
        baseAmount: remainingBase,
        surchargeAmount: 0,
        tipAmount: 0,
        paymentType: 'cash',
        tenderedCash: remainingBase,
        changeGiven: 0,
      });
    } else {
      const cardSurcharge = activeVenue.surcharges.cardSurchargeEnabled
        ? Number(((remainingBase * activeVenue.surcharges.cardSurchargeEftpos) / 100).toFixed(2))
        : 0;
      recordPayment({
        orderId: currentOrder.id,
        amount: remainingBase + cardSurcharge,
        baseAmount: remainingBase,
        surchargeAmount: cardSurcharge,
        tipAmount: 0,
        paymentType: 'eftpos',
        cardLast4: '4242',
        authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }
  };

  // Shift & Cash float
  const updateShiftFloat = (newFloat: number) => {
    setCurrentShift(prev => ({ ...prev, openingFloat: newFloat }));
  };

  const closeShiftZReport = (closingCashCounted: number): ShiftSummary => {
    const expectedCash = currentShift.openingFloat + currentShift.cashSales;
    const variance = Number((closingCashCounted - expectedCash).toFixed(2));

    const finalZReport: ShiftSummary = {
      ...currentShift,
      closedAt: new Date().toISOString(),
      closingCashCounted,
      cashVariance: variance,
      isClosed: true,
      type: 'Z-Report',
    };

    setShiftHistory(prev => [finalZReport, ...prev]);

    // Open next fresh shift
    setCurrentShift({
      id: generateId('shift'),
      venueId: activeVenue.id,
      openedByStaffId: currentStaff.id,
      openedByStaffName: currentStaff.name,
      openedAt: new Date().toISOString(),
      openingFloat: closingCashCounted,
      totalGrossSales: 0,
      totalGst: 0,
      totalNetSales: 0,
      totalDiscounts: 0,
      totalTips: 0,
      totalSurcharges: 0,
      cashSales: 0,
      cardSales: 0,
      refundsCount: 0,
      refundsTotal: 0,
      ordersCount: 0,
      isClosed: false,
      type: 'X-Report',
    });

    sounds.playPaymentSuccess();
    return finalZReport;
  };

  // Tables CRUD
  const addTable = (table: RestaurantTable) => {
    setTables(prev => [...prev, table]);
  };
  const updateTable = (table: RestaurantTable) => {
    setTables(prev => prev.map(t => (t.id === table.id ? table : t)));
  };
  const deleteTable = (tableId: string) => {
    setTables(prev => prev.filter(t => t.id !== tableId));
  };
  const moveTablePosition = (tableId: string, x: number, y: number) => {
    setTables(prev => prev.map(t => (t.id === tableId ? { ...t, x, y } : t)));
  };

  // Sections CRUD
  const addSection = (section: FloorSection) => {
    setSections(prev => [...prev, section]);
  };
  const updateSection = (section: FloorSection) => {
    setSections(prev => prev.map(s => (s.id === section.id ? section : s)));
  };
  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    // Also delete or reassign tables in this section
    setTables(prev => prev.filter(t => t.sectionId !== sectionId));
  };

  // Landmarks CRUD
  const addLandmark = (landmark: FloorLandmark) => {
    setLandmarks(prev => [...prev, landmark]);
  };
  const updateLandmark = (landmark: FloorLandmark) => {
    setLandmarks(prev => prev.map(l => (l.id === landmark.id ? landmark : l)));
  };
  const deleteLandmark = (landmarkId: string) => {
    setLandmarks(prev => prev.filter(l => l.id !== landmarkId));
  };

  // Categories CRUD
  const addCategory = (cat: MenuCategory) => {
    setCategories(prev => [...prev, cat]);
  };
  const updateCategory = (cat: MenuCategory) => {
    setCategories(prev => prev.map(c => (c.id === cat.id ? cat : c)));
  };
  const deleteCategory = (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
    setMenuItems(prev => prev.filter(i => i.categoryId !== catId));
  };

  // Menu Management CRUD
  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
  };
  const updateMenuItem = (item: MenuItem) => {
    setMenuItems(prev => prev.map(i => (i.id === item.id ? item : i)));
  };
  const deleteMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(i => i.id !== itemId));
  };

  return (
    <PosContext.Provider
      value={{
        activeMode,
        setActiveMode,
        uiTheme,
        toggleUiTheme,
        isSimpleMode,
        toggleSimpleMode,
        sections,
        tables,
        landmarks,
        activeTable,
        setActiveTable,
        updateTableStatus,
        transferTable,
        addTable,
        updateTable,
        deleteTable,
        moveTablePosition,
        addSection,
        updateSection,
        deleteSection,
        addLandmark,
        updateLandmark,
        deleteLandmark,
        categories,
        menuItems,
        selectedCategory,
        setSelectedCategory,
        addCategory,
        updateCategory,
        deleteCategory,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        currentOrder,
        setCurrentOrder,
        startNewTakeawayOrder,
        openTableOrder,
        addItemToOrder,
        updateItemQuantity,
        removeItemFromOrder,
        setItemCourse,
        setItemInstructions,
        applyOrderDiscount,
        removeOrderDiscount,
        toggleWeekendSurcharge,
        toggleHolidaySurcharge,
        setOrderCustomerInfo,
        allOrders,
        fireOrderToKitchen,
        updateOrderItemStatus,
        bumpEntireOrder,
        recordPayment,
        quickSettleOrder,
        completedPayments,
        lastCompletedOrder,
        setLastCompletedOrder,
        currentShift,
        updateShiftFloat,
        closeShiftZReport,
        shiftHistory,
      }}
    >
      {children}
    </PosContext.Provider>
  );


};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
