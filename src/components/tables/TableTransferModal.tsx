import React, { useState } from 'react';
import { ArrowRightLeft, X, Check, Users } from 'lucide-react';
import type { RestaurantTable } from '../../types';

import { usePos } from '../../context/PosContext';
import { sounds } from '../../utils/sound';

export const TableTransferModal: React.FC<{
  sourceTable: RestaurantTable;
  onClose: () => void;
}> = ({ sourceTable, onClose }) => {
  const { tables, transferTable, sections } = usePos();
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center border border-sky-500/30">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Transfer Table {sourceTable.name}</h2>
            <p className="text-xs text-slate-400">Move active order and guests to an available table</p>
          </div>
        </div>

        <div className="space-y-4 my-6">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Destination Table
          </label>

          {venueTables.length === 0 ? (
            <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No available tables in this venue right now.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
              {venueTables.map(target => (
                <button
                  key={target.id}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedTargetId(target.id);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition ${
                    selectedTargetId === target.id
                      ? 'bg-sky-600/30 border-sky-500 text-sky-300 ring-2 ring-sky-500/50'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80 text-slate-300'
                  }`}
                >
                  <span className="font-bold text-base">{target.name}</span>
                  <div className="flex items-center space-x-1 text-xs text-slate-400 mt-1">
                    <Users className="w-3 h-3" />
                    <span>{target.capacity} seats</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">
                    {sections.find(s => s.id === target.sectionId)?.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            disabled={!selectedTargetId}
            onClick={handleConfirm}
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Transfer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
