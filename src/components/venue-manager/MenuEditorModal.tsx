import React, { useState } from 'react';
import { FileText, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import type { MenuItem } from '../../types';
import { formatAud, generateId } from '../../utils/formatters';

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
    setEditingItem(item);
    setFormData({ ...item });
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) return;

    if (isCreating) {
      const newItem: MenuItem = {
        id: formData.id || generateId('item'),
        venueId: activeVenue.id,
        categoryId: formData.categoryId!,
        name: formData.name!,
        description: formData.description || '',
        price: Number(formData.price) || 0,
        costPrice: Number(formData.costPrice) || 0,
        course: (formData.course as any) || 'main',
        dietaryTags: formData.dietaryTags || [],
        isAvailable: formData.isAvailable !== false,
      };
      addMenuItem(newItem);
    } else if (editingItem) {
      updateMenuItem({
        ...editingItem,
        ...formData,
        price: Number(formData.price) || 0,
        costPrice: Number(formData.costPrice) || 0,
      } as MenuItem);
    }

    setIsCreating(false);
    setEditingItem(null);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.25rem)] bg-slate-100 p-4 lg:p-6 overflow-y-auto select-none">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center border border-slate-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Menu Catalog & Pricing (Inc GST)</h2>
              <p className="text-xs text-slate-500">
                Manage items, prices, and dietary tags for {activeVenue.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleStartCreate}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg font-bold text-xs shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item</span>
          </button>
        </div>

        {/* Menu Items Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between">
            <span>Item Name & Category</span>
            <span>Price (Inc GST)</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            {venueItems.map(item => {
              const catName = categories.find(c => c.id === item.categoryId)?.name || 'Category';

              return (
                <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition text-xs">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {catName} • {item.course}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {formatAud(item.price)}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create / Edit Form Modal */}
        {(isCreating || editingItem) && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingItem(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-slate-900 mb-3">
                {isCreating ? 'Add Menu Item' : 'Edit Menu Item'}
              </h3>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Item Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-bold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                  >
                    {venueCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Price (AUD Inc GST)</label>
                    <input
                      type="number"
                      step="0.10"
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Course</label>
                    <select
                      value={formData.course || 'main'}
                      onChange={e => setFormData({ ...formData, course: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                    >
                      {['drinks', 'entree', 'main', 'dessert', 'sides'].map(c => (
                        <option key={c} value={c}>
                          {c.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingItem(null);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs shadow-xs"
                  >
                    Save Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
