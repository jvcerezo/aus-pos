import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
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
    uiTheme,
    isSimpleMode,
  } = usePos();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<DietaryTag | 'all'>('all');
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);

  const isLight = uiTheme === 'light';

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
    <div
      className={`flex-1 flex flex-col h-full p-4 overflow-hidden border-r transition-colors ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/60 border-slate-800 text-slate-100'
      }`}
    >
      {/* Top Filter Bar: Search + Quick Dietary Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 opacity-50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full border rounded-2xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-sky-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dietary Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5">
          {dietaryOptions.map(opt => (
            <button
              key={opt.tag}
              onClick={() => {
                sounds.playTap();
                setSelectedDietary(opt.tag);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                selectedDietary === opt.tag
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : isLight
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-3">
        <button
          onClick={() => {
            sounds.playTap();
            setSelectedCategory('all');
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition whitespace-nowrap border ${
            selectedCategory === 'all'
              ? 'bg-sky-600 text-white border-sky-600 shadow-md'
              : isLight
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          All Menu
        </button>

        {venueCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              sounds.playTap();
              setSelectedCategory(cat.id);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition whitespace-nowrap border ${
              selectedCategory === cat.id
                ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                : isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Touch Product Grid (Simple Mode vs Standard Mode) */}
      <div className="flex-1 overflow-y-auto pr-1">
        {venueItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center opacity-40">
            <Sparkles className="w-8 h-8 mb-2" />
            <p className="text-sm">No items found matching filter.</p>
          </div>
        ) : isSimpleMode ? (
          /* SIMPLE QUICK-TOUCH MODE: Large, tactile square buttons */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {venueItems.map(item => {
              const hasModifiers = item.modifierGroups && item.modifierGroups.length > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => handleProductClick(item)}
                  disabled={!item.isAvailable}
                  className={`relative p-4 rounded-3xl border text-left flex flex-col justify-between transition transform active:scale-95 min-h-[140px] shadow-sm hover:shadow-md ${
                    item.isAvailable
                      ? isLight
                        ? 'bg-white border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 text-slate-900'
                        : 'bg-slate-900 border-slate-800 hover:border-sky-500 hover:bg-slate-850 text-white'
                      : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-950'
                  }`}
                >
                  {/* Top: Name & Modifiers pill */}
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base leading-tight line-clamp-2">
                      {item.name}
                    </h4>
                    {hasModifiers && (
                      <span className="inline-block mt-1 text-[10px] bg-sky-500/15 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-md font-bold">
                        Options
                      </span>
                    )}
                  </div>

                  {/* Bottom: Big bold AUD Price */}
                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {formatAud(item.price)}
                    </span>
                    <span className="text-[10px] uppercase font-bold opacity-40">
                      {item.course}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* STANDARD MODE: Detailed cards with descriptions & dietary tags */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {venueItems.map(item => {
              const hasModifiers = item.modifierGroups && item.modifierGroups.length > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => handleProductClick(item)}
                  disabled={!item.isAvailable}
                  className={`group relative p-3.5 rounded-2xl border text-left flex flex-col justify-between transition active:scale-[0.97] min-h-[120px] shadow-sm hover:shadow-md ${
                    item.isAvailable
                      ? isLight
                        ? 'bg-white border-slate-200 hover:border-sky-500 hover:bg-sky-50/30 text-slate-900'
                        : 'bg-slate-900 border-slate-800 hover:border-sky-500 hover:bg-slate-850 text-white'
                      : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-950'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                        {item.name}
                      </h4>
                      {hasModifiers && (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded font-mono font-medium shrink-0">
                          Mods
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-[11px] opacity-60 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {item.dietaryTags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-1 py-0.2 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {formatAud(item.price)}
                    </div>
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
