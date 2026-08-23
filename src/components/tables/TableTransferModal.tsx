import React, { useState } from 'react';
import { ArrowRightLeft, X, Check, Users } from 'lucide-react';
import type { RestaurantTable } from '../../types';
import { usePos } from '../../context/PosContext';
import { sounds } from '../../utils/sound';

export const TableTransferModal: React.FC<{
  sourceTable: RestaurantTable;
  onClose: () => void;
}> = ({ sourceTable, onClose }) => {
  const { tables, transferTable, sections, floors } = usePos();
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');

  const venueTables = tables.filter(
    t => t.venueId === sourceTable.venueId && t.id !== sourceTable.id && t.status === 'available'
  );

  const handleConfirm = () => {
    if (!selectedTargetId) return;
    transferTable(sourceTable.id, selectedTargetId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center border border-slate-200">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Transfer Table {sourceTable.name}</h2>
            <p className="text-xs text-slate-500">Move active order and seated guests to an available table</p>
          </div>
        </div>

        <div className="space-y-3 my-5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            Select Destination Table
          </label>

          {venueTables.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-300 rounded-2xl text-xs">
              No available tables in this venue right now.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
              {venueTables.map(target => {
                const section = sections.find(s => s.id === target.sectionId);
                const floor = floors.find(f => f.id === (target.floorLevelId || section?.floorLevelId));
                const isSelected = selectedTargetId === target.id;

                return (
                  <button
                    key={target.id}
                    onClick={() => {
                      sounds.playTap();
                      setSelectedTargetId(target.id);
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition text-center ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-400 text-slate-800'
                    }`}
                  >
                    <span className="font-black text-base font-mono">{target.name}</span>
                    <div className="flex items-center space-x-1 text-xs opacity-75 mt-0.5">
                      <Users className="w-3 h-3" />
                      <span>{target.capacity}p</span>
                    </div>
                    <span className={`text-[10px] font-bold mt-1 px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {floor ? `${floor.shortCode} • ` : ''}{section?.name || 'Main'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            disabled={!selectedTargetId}
            onClick={handleConfirm}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Transfer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
