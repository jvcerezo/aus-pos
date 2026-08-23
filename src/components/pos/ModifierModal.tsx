import React, { useState } from 'react';
import { X, Check, Plus, Minus } from 'lucide-react';
import type { MenuItem, ModifierGroup, SelectedModifier } from '../../types';

import { formatAud } from '../../utils/formatters';
import { sounds } from '../../utils/sound';

interface ModifierModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedModifiers: SelectedModifier[], specialInstructions: string, seatNumber: number) => void;
}

export const ModifierModal: React.FC<ModifierModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const modifierGroups = item.modifierGroups || [];

  // Initialize defaults
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    modifierGroups.forEach(group => {
      const defaultOpt = group.options.find(o => o.isDefault);
      if (defaultOpt) {
        initial[group.id] = [defaultOpt.id];
      } else {
        initial[group.id] = [];
      }
    });
    return initial;
  });

  const [instructions, setInstructions] = useState('');
  const [seatNumber, setSeatNumber] = useState<number>(1);

  // Toggle selection
  const handleOptionClick = (group: ModifierGroup, optionId: string) => {
    sounds.playTap();
    setSelections(prev => {
      const current = prev[group.id] || [];
      if (group.maxSelections === 1) {
        // Radio behavior
        return { ...prev, [group.id]: [optionId] };
      } else {
        // Multi-select checkbox behavior
        if (current.includes(optionId)) {
          return { ...prev, [group.id]: current.filter(id => id !== optionId) };
        } else {
          if (current.length < group.maxSelections) {
            return { ...prev, [group.id]: [...current, optionId] };
          }
          return prev;
        }
      }
    });
  };

  // Check if all required groups are satisfied
  const isValid = modifierGroups.every(group => {
    if (!group.required) return true;
    const count = (selections[group.id] || []).length;
    return count >= group.minSelections;
  });

  // Calculate live total price delta
  let totalModifierDelta = 0;
  const flatSelectedModifiers: SelectedModifier[] = [];

  modifierGroups.forEach(group => {
    const selectedIds = selections[group.id] || [];
    selectedIds.forEach(optId => {
      const opt = group.options.find(o => o.id === optId);
      if (opt) {
        totalModifierDelta += opt.priceDelta;
        flatSelectedModifiers.push({
          groupId: group.id,
          groupName: group.name,
          optionId: opt.id,
          optionName: opt.name,
          priceDelta: opt.priceDelta,
        });
      }
    });
  });

  const finalUnitPrice = item.price + totalModifierDelta;

  const handleFinalAdd = () => {
    if (!isValid) return;
    onConfirm(flatSelectedModifiers, instructions, seatNumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl relative text-white overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">{item.name}</h2>
              {item.dietaryTags.map(tag => (
                <span key={tag} className="text-[10px] bg-slate-800 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">{item.description || 'Customize options & modifiers'}</p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Modifier Groups */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {modifierGroups.map(group => {
            const selectedIds = selections[group.id] || [];
            const isRadio = group.maxSelections === 1;

            return (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-200">
                    {group.name}
                    {group.required && <span className="text-rose-400 ml-1 text-xs">*Required</span>}
                  </span>
                  <span className="text-xs text-slate-400">
                    {isRadio ? 'Select 1' : `Select up to ${group.maxSelections}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.options.map(opt => {
                    const isSelected = selectedIds.includes(opt.id);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleOptionClick(group, opt.id)}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-left transition ${
                          isSelected
                            ? 'bg-sky-600/25 border-sky-500 text-white shadow-md shadow-sky-950/40 ring-1 ring-sky-500/50'
                            : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-700/70 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-5 h-5 rounded-${isRadio ? 'full' : 'md'} flex items-center justify-center border transition ${
                              isSelected
                                ? 'bg-sky-500 border-sky-400 text-white'
                                : 'border-slate-600 bg-slate-900'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-semibold">{opt.name}</span>
                        </div>

                        {opt.priceDelta > 0 && (
                          <span className="text-xs font-mono font-bold text-amber-400">
                            +{formatAud(opt.priceDelta)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Seat Number & Special Kitchen Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Seat / Position</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSeatNumber(Math.max(1, seatNumber - 1))}
                  className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 border border-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-base px-2">Seat {seatNumber}</span>
                <button
                  type="button"
                  onClick={() => setSeatNumber(seatNumber + 1)}
                  className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 border border-slate-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Special Instructions / Allergies</label>
              <input
                type="text"
                placeholder="e.g. Extra hot, dressing on side, allergy note"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer: Live Price & Add Button */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Unit Total (Inc GST)</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {formatAud(finalUnitPrice)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              disabled={!isValid}
              onClick={handleFinalAdd}
              className="flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-sky-950/50 transition"
            >
              <Check className="w-4 h-4" />
              <span>Add to Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
