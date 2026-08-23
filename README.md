# AusPOS • Australian Restaurant POS System & Multi-Venue MVP Template 🇦🇺

An enterprise-grade, high-performance Point of Sale (POS) MVP template designed specifically for Australian hospitality venues (Fine Dining, Specialty Cafes / QSRs, Pubs, and Multi-location restaurant groups).

Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**, featuring offline-ready local storage, real-time Kitchen Display System (KDS), Australian Taxation Office (ATO) GST compliance, automated surcharges, and interactive Australian EFTPOS terminal simulation.

---

## 🌟 Key Features & Australian Specifics

### 1. 🇦🇺 Australian Taxation & ATO Compliance
- **ATO 1/11th GST Calculation Formula**: All Australian menu prices are GST-inclusive by default. The system automatically computes and itemizes the exact $1/11^{\text{th}}$ GST component on both screen summaries and tax invoices.
- **ATO-Compliant "TAX INVOICE" Printing**: Generates standardized 80mm thermal receipts containing:
  - Official "TAX INVOICE" declaration
  - Formatted 11-digit Australian Business Number (ABN: `XX XXX XXX XXX`)
  - Registered Trading Name, Phone, and Venue Address
  - Itemized line items, quantities, and nested modifiers
  - Explicit statement: `*** TOTAL INCLUDES GST OF $XX.XX ***`
  - EFTPOS Bank Auth STAN code & masked card PAN (`**** 4242`)

### 2. ⚡ Automated Australian Surcharges Engine
- **Weekend Surcharge**: Configurable weekend rate (e.g. +10% on Saturdays & Sundays) with instant navbar quick-toggles.
- **Public Holiday Surcharge**: Configurable public holiday rate (e.g. +15%).
- **Card / EFTPOS Scheme Surcharges**: Transparent pass-through fee calculations based on card type:
  - EFTPOS Cheque / Savings: `0.5%`
  - Visa / Mastercard: `1.2%`
  - American Express (Amex): `1.8%`

### 3. 🏢 Multi-Venue White-Label Templating
Includes 3 pre-built Australian venue templates out-of-the-box with custom branding, themes, table layouts, and nested modifier menus:
1. **Bondi Sunset Bistro (NSW)**: Premium coastal dining & cocktail bar with multi-course ordering, wine list, and interactive ocean terrace floor map.
2. **Melbourne Lane Coffee & Brunch (VIC)**: High-speed specialty cafe / QSR with nested coffee modifiers (Milk types, Single origins, Syrups, Cup sizes), all-day brunch, and buzzer numbers.
3. **Outback Smokehouse & Brewhouse (QLD)**: Pub & woodfired BBQ with steak doneness modifiers, craft beers on tap, and beer hall seating.
- **Venue Profile Manager**: Edit trading name, ABN, surcharges %, GST registration, theme colors, and custom receipt headers/footers in real time.

### 4. 🍽️ Hybrid All-in-One Operations
- **Interactive Floor / Table Map**: Section management (Main Dining, Terrace, Cocktail Bar, Mezzanine) with visual status indicators (*Available, Dining, Bill Printed, Reserved, Cleaning*), seating elapsed timers, and table transfer capabilities.
- **High-Speed Touch POS**: Category tabs, live fuzzy search, dietary tags (*GF, VG, V, DF, Halal, NF*), seat assignment, and course routing (*Drinks, Entrees, Mains, Desserts, Sides*).
- **Nested Modifiers Engine**: Supports single-choice radio (e.g. Milk choice, Steak temp) and multi-choice checkboxes (e.g. Extra shots, Sauces, Add-ons).
- **Australian Split Billing**:
  - *Equal Split*: Divide bill evenly across 2 to 6+ guests with individual payment triggers.
  - *Custom Partial Amount*: Pay a custom dollar amount on card/cash and retain the remaining balance on the table.

### 5. 💳 Payments & Simulated Australian EFTPOS
- **Realistic Integrated EFTPOS Terminal**: Emulates modern Australian payment terminals (Tyro / Smartpay / Square / Stripe Terminal) with contactless Tap-to-Pay (Apple Pay / Google Pay) and Chip & PIN insertion, processing animations, bank approval chimes, and STAN auth generation.
- **AUD Cash Tender & Till Calculator**: Rapid banknote buttons ($5, $10, $20, $50, $100 AUD notes), exact tender button, and instant change calculation.

### 6. 🍳 Kitchen Display System (KDS)
- Live kitchen tickets with color-coded elapsed timers (<10m Green, 10-20m Amber, >20m Red Urgent).
- Item-level check-off and order bump triggers.
- Web Audio API tactile bells and sound effects (no external audio assets required).
- Course filtering (Drinks, Entrees, Mains, Desserts).

### 7. 📊 End-of-Day (EOD) Z-Report & Cash-Up Reconciliation
- Opening cash float management.
- Mid-day **X-Report** (non-resetting snapshot) and **Z-Report** (end-of-day register closure).
- Financial ledger: Gross Sales, 10% GST Collected, Net Sales, Surcharges total, Gratuities, Discounts audit, EFTPOS vs Cash totals.
- Cash drawer reconciliation: Counted cash vs Expected till balance with variance alert (*Over / Short / Exact Match*).
- Printable 80mm thermal Z-Report docket.

### 8. 🔒 Staff Shift & Fast 4-Digit PIN Security
- Role-based roster (*Manager, Cashier, Waitstaff, Chef*).
- Instant on-screen numeric keypad for rapid PIN authentication and staff switching.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Launch

```bash
# 1. Navigate to the project directory
cd aus-restaurant-pos

# 2. Install dependencies (if not already installed)
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your web browser.

### Default Staff PIN Codes (Demo Roster)
| Staff Member | Role | 4-Digit PIN |
|---|---|---|
| **Sarah Miller** | Manager | `1111` |
| **Jack Murphy** | Cashier | `2222` |
| **Chloe Watson** | Waitstaff | `3333` |
| **Chef Ben O'Connor**| Kitchen | `4444` |

---

## 📁 Project Architecture

```
aus-restaurant-pos/
├── src/
│   ├── types/               # TypeScript models (Venue, Order, Menu, Payment, Staff, Shift)
│   ├── data/                # Initial seed data for Australian venues, menus, tables & staff
│   ├── context/             # React Contexts (VenueContext, AuthContext, PosContext)
│   ├── utils/
│   │   ├── gst.ts           # ATO 1/11th GST & Surcharge calculation formulas
│   │   ├── formatters.ts    # AUD currency formatting, ABN spacing, Aussie date/time
│   │   └── sound.ts         # Web Audio API tactile sound synthesizers
│   ├── components/
│   │   ├── layout/          # TopNavBar, BottomStatusBar, StaffPinModal
│   │   ├── pos/             # PosScreen, ProductGrid, ModifierModal, OrderCart, SplitBillModal, DiscountModal
│   │   ├── tables/          # TableMapScreen, TableTransferModal
│   │   ├── kds/             # KdsScreen (Kitchen Display System)
│   │   ├── payments/        # PaymentModal, EftposTerminalModal, CashPaymentView, ReceiptModal
│   │   ├── reports/         # EodReportsScreen (X-Report & Z-Report)
│   │   └── venue-manager/   # VenueSettingsModal, MenuEditorModal
│   ├── App.tsx              # Root Layout & Router Mode Controller
│   └── index.css            # Tailwind 4 imports & thermal print media styles
├── package.json
└── vite.config.ts
```

---

## 🛠️ Extending the Template

### Adding a New Australian Venue
Add a new object to `src/data/venues.ts` or use the in-app **Venue Settings** screen to customize branding, ABN, and surcharges.

### Connecting Real EFTPOS Hardware
The terminal modal (`src/components/payments/EftposTerminalModal.tsx`) provides clean callback hooks (`onSuccess`) ready to integrate with:
- **Tyro Connect / Tyro Terminal API**
- **Smartpay Linkly Protocol**
- **Square Reader SDK**
- **Stripe Terminal for Australia**

---

## 📜 License
MIT License. Built for Australian Hospitality Operators & Software Developers.
