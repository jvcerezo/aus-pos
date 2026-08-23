import React, { useState } from 'react';
import { FileText, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import type { MenuItem, DietaryTag } from '../../types';

import { formatAud, generateId } from '../../utils/formatters';
import { sounds } from '../../utils/sound';

export const MenuEditorModal: React.FC = () => {
  const { activeVenue } = useVenue();
  const { categories, menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = usePos();

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const venueCategories = categories.filter(c => c.venueId === activeVenue.id);
  const venueItems = menuItems.filter(i => i.venueId === activeVenue.id);

  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 15.00,
    costPrice: 4.00,
    categoryId: venueCategories[0]?.id || '',
    course: 'main',
    dietaryTags: [],
    isAvailable: true,
  });

  const handleStartCreate = () => {
    sounds.playTap();
    setFormData({
      id: generateId('item_custom'),
      venueId: activeVenue.id,
      name: '',
      description: '',
      price: 18.00,
      costPrice: 5.00,
      categoryId: venueCategories[0]?.id || '',
      course: 'main',
      dietaryTags: [],
      isAvailable: true,
    });
    setIsCreating(true);
    setEditingItem(null);
  };

  const handleStartEdit = (item: MenuItem) => {
    sounds.playTap();
    setEditingItem(item);
    setFormData({ ...item });
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) return;

    if (isCreating) {
      addMenuItem(formData as MenuItem);
    } else if (editingItem) {
      updateMenuItem(formData as MenuItem);
    }

    sounds.playPaymentSuccess();
    setIsCreating(false);
    setEditingItem(null);
  };

  const toggleDietaryTag = (tag: DietaryTag) => {
    sounds.playTap();
    const current = formData.dietaryTags || [];
    if (current.includes(tag)) {
      setFormData({ ...formData, dietaryTags: current.filter(t => t !== tag) });
    } else {
      setFormData({ ...formData, dietaryTags: [...current, tag] });
    }
  };

  const allDietaryTags: DietaryTag[] = ['GF', 'V', 'VG', 'DF', 'NF', 'Halal'];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-6.25rem)] bg-slate-950 p-4 lg:p-6 overflow-y-auto select-none">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center border border-sky-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Menu Catalog & Price List</h2>
              <p className="text-xs text-slate-400">
                Manage Australian menu items, prices inclusive of 10% GST, and dietary tags for {activeVenue.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleStartCreate}
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-sky-950/40 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Menu Item</span>
          </button>
        </div>

        {/* Item Create / Edit Form Modal */}
        {(isCreating || editingItem) && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-white">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingItem(null);
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold mb-4">
                {isCreating ? 'Create Australian Menu Item' : `Edit: ${editingItem?.name}`}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Description / Ingredients</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Price (Inc 10% GST AUD)</label>
                    <input
                      type="number"
                      step="0.10"
                      required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Cost Price ($ AUD)</label>
                    <input
                      type="number"
                      step="0.10"
                      value={formData.costPrice}
                      onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                    <select
                      value={formData.categoryId}
                      onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {venueCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Course Routing</label>
                    <select
                      value={formData.course}
                      onChange={e => setFormData({ ...formData, course: e.target.value as MenuItem['course'] })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {['drinks', 'entree', 'main', 'dessert', 'sides'].map(c => (
                        <option key={c} value={c}>
                          {c.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Dietary Badges</label>
                  <div className="flex flex-wrap gap-2">
                    {allDietaryTags.map(tag => {
                      const isSelected = (formData.dietaryTags || []).includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleDietaryTag(tag)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition border ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 text-xs text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold"
                  >
                    Save Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Menu Items Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Price (Inc GST)</th>
                  <th className="p-4">Dietary</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {venueItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-850 transition">
                    <td className="p-4 font-bold text-white">
                      <div>{item.name}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {categories.find(c => c.id === item.categoryId)?.name || 'General'}
                    </td>
                    <td className="p-4 uppercase font-semibold text-slate-400">
                      {item.course}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                      {formatAud(item.price)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {item.dietaryTags.map(t => (
                          <span
                            key={t}
                            className="bg-slate-800 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono px-1.5 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            sounds.playTap();
                            deleteMenuItem(item.id);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
