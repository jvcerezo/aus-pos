import React, { useState } from 'react';
import { Search, Plus, Utensils, ShoppingBag } from 'lucide-react';
import type { MenuItem, DietaryTag } from '../../types';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import { formatAud } from '../../utils/formatters';
import { sounds } from '../../utils/sound';
import { ModifierModal } from './ModifierModal';

export const ProductGrid: React.FC = () => {
  const { activeVenue } = useVenue();
  const {
    categories,
    menuItems,
    selectedCategory,
    setSelectedCategory,
    addItemToOrder,
    allOrders,
    currentOrder,
    setCurrentOrder,
    startNewTakeawayOrder,
  } = usePos();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<DietaryTag | 'all'>('all');
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);

  // Active open unpaid orders for this venue
  const openOrders = allOrders.filter(o => o.venueId === activeVenue.id && !o.isPaid);

  // Filter categories for active venue
  const venueCategories = categories.filter(c => c.venueId === activeVenue.id);

  // Filter menu items
  const venueItems = menuItems.filter(item => {
    if (item.venueId !== activeVenue.id) return false;
    if (selectedCategory && selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    if (selectedDietary !== 'all') {
      if (!item.dietaryTags.includes(selectedDietary)) return false;
    }
    return true;
  });

  const handleProductClick = (item: MenuItem) => {
    if (!item.isAvailable) {
      sounds.playError();
      return;
    }

    if (item.modifierGroups && item.modifierGroups.length > 0) {
      sounds.playTap();
      setActiveModalItem(item);
    } else {
      addItemToOrder(item);
    }
  };

  const dietaryOptions: { tag: DietaryTag | 'all'; label: string }[] = [
    { tag: 'all', label: 'All' },
    { tag: 'GF', label: 'GF' },
    { tag: 'V', label: 'V' },
    { tag: 'VG', label: 'VG' },
    { tag: 'DF', label: 'DF' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/80 p-3 overflow-hidden border-r border-slate-200">
      {/* 1. Active Open Tickets Switcher Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 mb-2.5 shadow-xs">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Active Open Tickets ({openOrders.length})
            </span>
          </div>

          <button
            onClick={() => startNewTakeawayOrder()}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition shadow-xs"
          >
            <Plus className="w-3 h-3" />
            <span>+ New Ticket</span>
          </button>
        </div>

        {/* Horizontal Ticket Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
          {openOrders.length === 0 ? (
            <div className="text-xs text-slate-400 py-1 px-1 italic">
              No open tickets. Start an order by clicking items below.
            </div>
          ) : (
            openOrders.map(order => {
              const isCurrent = currentOrder?.id === order.id;
              const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <button
                  key={order.id}
                  onClick={() => setCurrentOrder(order)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition whitespace-nowrap flex items-center space-x-2 shrink-0 ${
                    isCurrent
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    {order.tableName ? (
                      <Utensils className="w-3 h-3 opacity-75" />
                    ) : (
                      <ShoppingBag className="w-3 h-3 opacity-75" />
                    )}
                    <span>{order.tableName ? `Table ${order.tableName}` : (order.customerName || 'Takeaway')}</span>
                  </div>

                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                      isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    #{order.orderNumber} ({itemsCount} items)
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Top Filter Bar: Search + Dietary Badges */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Dietary Filters */}
        <div className="flex items-center space-x-1">
          {dietaryOptions.map(opt => (
            <button
              key={opt.tag}
              onClick={() => {
                sounds.playTap();
                setSelectedDietary(opt.tag);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition border ${
                selectedDietary === opt.tag
                  ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 mb-2">
        <button
          onClick={() => {
            sounds.playTap();
            setSelectedCategory('all');
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Items
        </button>

        {venueCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              sounds.playTap();
              setSelectedCategory(cat.id);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 4. Realistic Touch Register Product Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {venueItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <p className="text-xs font-medium">No items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
            {venueItems.map(item => {
              const hasModifiers = item.modifierGroups && item.modifierGroups.length > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => handleProductClick(item)}
                  disabled={!item.isAvailable}
                  className={`relative p-3 rounded-xl border border-b-2 text-left flex flex-col justify-between transition transform active:translate-y-0.5 min-h-[110px] bg-white border-slate-200 hover:border-slate-300 shadow-xs ${
                    item.isAvailable
                      ? 'hover:bg-slate-50 text-slate-900'
                      : 'opacity-40 cursor-not-allowed bg-slate-100'
                  }`}
                >
                  {/* Top: Name & Modifiers badge */}
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2">
                      {item.name}
                    </h4>

                    {hasModifiers && (
                      <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded font-semibold">
                        Options ▾
                      </span>
                    )}
                  </div>

                  {/* Bottom: Price & Dietary Tags */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {item.dietaryTags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1 py-0.2 rounded border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="text-sm font-black font-mono text-slate-900">
                      {formatAud(item.price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modifier Modal */}
      {activeModalItem && (
        <ModifierModal
          item={activeModalItem}
          isOpen={!!activeModalItem}
          onClose={() => setActiveModalItem(null)}
          onConfirm={(mods, instructions, seat) => {
            addItemToOrder(activeModalItem, mods, instructions, seat);
          }}
        />
      )}
    </div>
  );
};
