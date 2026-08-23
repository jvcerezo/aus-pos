import React, { useState } from 'react';
import { X, Check, Plus, Minus } from 'lucide-react';
import type { MenuItem, ModifierGroup, SelectedModifier } from '../../types';
import { formatAud } from '../../utils/formatters';

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
    setSelections(prev => {
      const current = prev[group.id] || [];
      if (group.maxSelections === 1) {
        return { ...prev, [group.id]: [optionId] };
      } else {
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

  // Validation: required groups must have at least 1 selection
  const isValid = modifierGroups.every(group => {
    if (!group.required) return true;
    const selected = selections[group.id] || [];
    return selected.length >= (group.minSelections || 1);
  });

  // Calculate modifier total price delta
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl relative text-slate-900 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">{item.name}</h2>
              {item.dietaryTags.map(tag => (
                <span key={tag} className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{item.description || 'Select options'}</p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Modifier Groups */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {modifierGroups.map(group => {
            const selectedIds = selections[group.id] || [];
            const isRadio = group.maxSelections === 1;

            return (
              <div key={group.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    {group.name}
                    {group.required && <span className="text-rose-600 ml-1 font-bold">*Required</span>}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isRadio ? 'Choose 1' : `Choose up to ${group.maxSelections}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options.map(opt => {
                    const isSelected = selectedIds.includes(opt.id);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleOptionClick(group, opt.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-4 h-4 rounded-${isRadio ? 'full' : 'sm'} flex items-center justify-center border transition ${
                              isSelected
                                ? 'bg-white border-white text-slate-900'
                                : 'border-slate-300 bg-slate-50'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-bold">{opt.name}</span>
                        </div>

                        {opt.priceDelta > 0 && (
                          <span className={`text-xs font-mono font-bold ${isSelected ? 'text-amber-300' : 'text-slate-900'}`}>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Seat #</label>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setSeatNumber(Math.max(1, seatNumber - 1))}
                  className="w-7 h-7 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg flex items-center justify-center"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-xs text-slate-900">
                  {seatNumber}
                </span>
                <button
                  type="button"
                  onClick={() => setSeatNumber(seatNumber + 1)}
                  className="w-7 h-7 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg flex items-center justify-center"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Kitchen Note</label>
              <input
                type="text"
                placeholder="e.g. Extra hot, Dressing on side..."
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Unit Price</div>
            <div className="text-xl font-black font-mono text-slate-900">{formatAud(finalUnitPrice)}</div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleFinalAdd}
              disabled={!isValid}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-xs ${
                isValid
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Add to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
