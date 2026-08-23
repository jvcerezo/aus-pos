import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  X
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import type { MenuCategory, MenuItem, ModifierGroup } from '../../types';
import { formatAud, generateId } from '../../utils/formatters';

export const MenuManager: React.FC = () => {
  const { activeVenue } = useVenue();
  const {
    categories,
    menuItems,
    addCategory,
    updateCategory,
    deleteCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  } = usePos();

  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Category Form
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#3b82f6');

  // Menu Item Form
  const [itemForm, setItemForm] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 18.00,
    costPrice: 5.00,
    categoryId: categories[0]?.id || '',
    course: 'main',
    dietaryTags: [],
    isAvailable: true,
    modifierGroups: [],
  });

  const venueCategories = categories.filter(c => c.venueId === activeVenue.id);
  const venueItems = menuItems.filter(i => {
    if (i.venueId !== activeVenue.id) return false;
    if (selectedCatId !== 'all' && i.categoryId !== selectedCatId) return false;
    if (search.trim() && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleStartCreateItem = () => {
    setItemForm({
      id: generateId('item'),
      venueId: activeVenue.id,
      name: '',
      description: '',
      price: 18.00,
      costPrice: 5.00,
      categoryId: selectedCatId !== 'all' ? selectedCatId : (venueCategories[0]?.id || ''),
      course: 'main',
      dietaryTags: [],
      isAvailable: true,
      modifierGroups: [],
    });
    setIsCreatingItem(true);
    setEditingItem(null);
  };

  const handleStartEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({ ...item, modifierGroups: item.modifierGroups || [] });
    setIsCreatingItem(false);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.categoryId) return;

    const formattedItem: MenuItem = {
      id: itemForm.id || generateId('item'),
      venueId: activeVenue.id,
      categoryId: itemForm.categoryId!,
      name: itemForm.name!,
      description: itemForm.description || '',
      price: Number(itemForm.price) || 0,
      costPrice: Number(itemForm.costPrice) || 0,
      course: (itemForm.course as any) || 'main',
      dietaryTags: itemForm.dietaryTags || [],
      isAvailable: itemForm.isAvailable !== false,
      modifierGroups: itemForm.modifierGroups || [],
    };

    if (isCreatingItem) {
      addMenuItem(formattedItem);
    } else if (editingItem) {
      updateMenuItem(formattedItem);
    }

    setIsCreatingItem(false);
    setEditingItem(null);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (isCreatingCategory) {
      const newCat: MenuCategory = {
        id: generateId('cat'),
        venueId: activeVenue.id,
        name: catName.trim(),
        iconName: 'utensils',
        color: catColor,
        displayOrder: venueCategories.length + 1,
      };
      addCategory(newCat);
    } else if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: catName.trim(),
        color: catColor,
      });
    }

    setIsCreatingCategory(false);
    setEditingCategory(null);
    setCatName('');
  };

  // Add modifier group to item form
  const handleAddModifierGroup = () => {
    const newGroup: ModifierGroup = {
      id: generateId('modg'),
      name: 'Choice / Add-on',
      required: false,
      minSelections: 0,
      maxSelections: 3,
      options: [
        { id: generateId('opt'), name: 'Standard Option', priceDelta: 0, isDefault: true },
        { id: generateId('opt'), name: 'Extra (+$2.00)', priceDelta: 2.00, isDefault: false },
      ],
    };

    setItemForm(prev => ({
      ...prev,
      modifierGroups: [...(prev.modifierGroups || []), newGroup],
    }));
  };

  const handleRemoveModifierGroup = (groupId: string) => {
    setItemForm(prev => ({
      ...prev,
      modifierGroups: (prev.modifierGroups || []).filter(g => g.id !== groupId),
    }));
  };

  const handleAddOptionToGroup = (groupId: string) => {
    setItemForm(prev => ({
      ...prev,
      modifierGroups: (prev.modifierGroups || []).map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            options: [
              ...g.options,
              { id: generateId('opt'), name: 'New Option', priceDelta: 1.00, isDefault: false },
            ],
          };
        }
        return g;
      }),
    }));
  };

  const handleRemoveOptionFromGroup = (groupId: string, optId: string) => {
    setItemForm(prev => ({
      ...prev,
      modifierGroups: (prev.modifierGroups || []).map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            options: g.options.filter(o => o.id !== optId),
          };
        }
        return g;
      }),
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden bg-slate-100">
      {/* Category Bar & Search */}
      <div className="bg-white p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
              selectedCatId === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            All Items ({menuItems.filter(i => i.venueId === activeVenue.id).length})
          </button>

          {venueCategories.map(cat => {
            const count = menuItems.filter(i => i.categoryId === cat.id && i.venueId === activeVenue.id).length;
            return (
              <div key={cat.id} className="flex items-center space-x-1">
                <button
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
                    selectedCatId === cat.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="opacity-75 font-mono text-[10px] ml-1">({count})</span>
                </button>

                <button
                  onClick={() => {
                    setEditingCategory(cat);
                    setCatName(cat.name);
                    setCatColor(cat.color || '#3b82f6');
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700"
                  title="Edit Category"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          <button
            onClick={() => {
              setIsCreatingCategory(true);
              setEditingCategory(null);
              setCatName('');
            }}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Category</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
            />
          </div>

          <button
            onClick={handleStartCreateItem}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Menu Catalog Table */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-600 grid grid-cols-12 gap-2">
            <div className="col-span-4">Item & Category</div>
            <div className="col-span-2">Course</div>
            <div className="col-span-2 text-right">Price (Inc GST)</div>
            <div className="col-span-2 text-right">Gross Margin</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {venueItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No menu items found. Click "+ Add Menu Item" to create one.
              </div>
            ) : (
              venueItems.map(item => {
                const cat = categories.find(c => c.id === item.categoryId);
                const margin = item.costPrice && item.costPrice > 0
                  ? Math.round(((item.price - item.costPrice) / item.price) * 100)
                  : null;

                return (
                  <div
                    key={item.id}
                    className="p-3 grid grid-cols-12 gap-2 items-center hover:bg-slate-50 transition text-xs"
                  >
                    {/* Name & Tags */}
                    <div className="col-span-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                        {!item.isAvailable && (
                          <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                            86'd / Sold Out
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <span>{cat?.name || 'Unassigned'}</span>
                        {item.dietaryTags.map(tag => (
                          <span key={tag} className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono font-bold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Course */}
                    <div className="col-span-2">
                      <span className="capitalize font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {item.course}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-right">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {formatAud(item.price)}
                      </span>
                    </div>

                    {/* Gross Margin */}
                    <div className="col-span-2 text-right">
                      {margin !== null ? (
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            margin >= 70
                              ? 'bg-emerald-50 text-emerald-700'
                              : margin >= 50
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {margin}% Margin
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleStartEditItem(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create / Edit Menu Item */}
      {(isCreatingItem || editingItem) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl relative text-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {isCreatingItem ? 'Add New Menu Item' : `Edit: ${itemForm.name}`}
              </h3>

              <button
                onClick={() => {
                  setIsCreatingItem(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Item Title</label>
                  <input
                    type="text"
                    value={itemForm.name || ''}
                    onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                    placeholder="e.g. Grass-Fed Wagyu Burger"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Description / Ingredients</label>
                  <textarea
                    rows={2}
                    value={itemForm.description || ''}
                    onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                    placeholder="Brioche bun, cheddar, house pickles, truffle aioli..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={itemForm.categoryId || ''}
                    onChange={e => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  >
                    {venueCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kitchen Course Routing</label>
                  <select
                    value={itemForm.course || 'main'}
                    onChange={e => setItemForm({ ...itemForm, course: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="drinks">Drinks / Bar Pass</option>
                    <option value="entree">Entree / Starters</option>
                    <option value="main">Mains</option>
                    <option value="dessert">Desserts</option>
                    <option value="sides">Sides</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Margins */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Price ($ AUD Inc GST)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={itemForm.price || ''}
                    onChange={e => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cost Price ($ AUD)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={itemForm.costPrice || ''}
                    onChange={e => setItemForm({ ...itemForm, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Availability & Dietary Tags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Item Availability (In Stock)</label>
                  <input
                    type="checkbox"
                    checked={itemForm.isAvailable !== false}
                    onChange={e => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Dietary Labels</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['GF', 'VG', 'V', 'DF', 'Halal', 'NF', 'EF'].map(tag => {
                      const isChecked = (itemForm.dietaryTags || []).includes(tag as any);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const tags = itemForm.dietaryTags || [];
                            const next = isChecked ? tags.filter(t => t !== tag) : [...tags, tag as any];
                            setItemForm({ ...itemForm, dietaryTags: next });
                          }}
                          className={`px-2.5 py-1 rounded-md border text-xs font-mono font-bold transition ${
                            isChecked
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modifier Groups Section */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Modifier Groups (Add-ons & Options)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddModifierGroup}
                    className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Modifier Group</span>
                  </button>
                </div>

                {(itemForm.modifierGroups || []).map(group => (
                  <div key={group.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={group.name}
                        onChange={e => {
                          const updated = (itemForm.modifierGroups || []).map(g =>
                            g.id === group.id ? { ...g, name: e.target.value } : g
                          );
                          setItemForm({ ...itemForm, modifierGroups: updated });
                        }}
                        className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900 w-44"
                      />

                      <div className="flex items-center space-x-2">
                        <label className="text-[11px] font-medium text-slate-600 flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={group.required}
                            onChange={e => {
                              const updated = (itemForm.modifierGroups || []).map(g =>
                                g.id === group.id ? { ...g, required: e.target.checked } : g
                              );
                              setItemForm({ ...itemForm, modifierGroups: updated });
                            }}
                          />
                          <span>Required</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveModifierGroup(group.id)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Options in group */}
                    <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                      {group.options.map(opt => (
                        <div key={opt.id} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={opt.name}
                            onChange={e => {
                              const updated = (itemForm.modifierGroups || []).map(g => {
                                if (g.id === group.id) {
                                  return {
                                    ...g,
                                    options: g.options.map(o =>
                                      o.id === opt.id ? { ...o, name: e.target.value } : o
                                    ),
                                  };
                                }
                                return g;
                              });
                              setItemForm({ ...itemForm, modifierGroups: updated });
                            }}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 flex-1"
                          />

                          <div className="flex items-center space-x-1">
                            <span className="text-slate-400 font-mono">+$</span>
                            <input
                              type="number"
                              step="0.50"
                              value={opt.priceDelta}
                              onChange={e => {
                                const updated = (itemForm.modifierGroups || []).map(g => {
                                  if (g.id === group.id) {
                                    return {
                                      ...g,
                                      options: g.options.map(o =>
                                        o.id === opt.id
                                          ? { ...o, priceDelta: parseFloat(e.target.value) || 0 }
                                          : o
                                      ),
                                    };
                                  }
                                  return g;
                                });
                                setItemForm({ ...itemForm, modifierGroups: updated });
                              }}
                              className="w-16 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono font-bold text-slate-900"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveOptionFromGroup(group.id, opt.id)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddOptionToGroup(group.id)}
                        className="text-[11px] text-slate-600 hover:text-slate-900 font-bold flex items-center space-x-1 mt-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Option</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit CTA */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingItem(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Category Creator / Editor */}
      {(isCreatingCategory || editingCategory) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              {isCreatingCategory ? 'New Menu Category' : 'Edit Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name</label>
                <input
                  type="text"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  placeholder="e.g. Specialty Coffees, Woodfired Steaks"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none"
                  required
                />
              </div>

              {editingCategory && (
                <button
                  type="button"
                  onClick={() => {
                    deleteCategory(editingCategory.id);
                    setEditingCategory(null);
                  }}
                  className="text-rose-600 font-bold text-xs hover:underline block"
                >
                  Delete Category & Its Items
                </button>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCategory(false);
                    setEditingCategory(null);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
