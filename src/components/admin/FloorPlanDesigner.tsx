import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Move,
  Users,
  Compass
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import type { FloorLandmark, FloorSection, RestaurantTable, TableShape } from '../../types';
import { generateId } from '../../utils/formatters';

export const FloorPlanDesigner: React.FC = () => {
  const { activeVenue } = useVenue();
  const {
    sections,
    tables,
    landmarks,
    addTable,
    updateTable,
    deleteTable,
    moveTablePosition,
    addSection,
    addLandmark,
    deleteLandmark,
  } = usePos();

  const [activeSectionId, setActiveSectionId] = useState<string>('all');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isAddLandmarkOpen, setIsAddLandmarkOpen] = useState(false);

  // New Table Form State
  const [newTable, setNewTable] = useState<Partial<RestaurantTable>>({
    name: 'T15',
    sectionId: sections[0]?.id || 'sec_main',
    shape: 'square',
    capacity: 4,
    x: 50,
    y: 50,
    width: 80,
    height: 80,
  });

  // New Section Form State
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionColor, setNewSectionColor] = useState('#3b82f6');

  // New Landmark Form State
  const [newLandmark, setNewLandmark] = useState<Partial<FloorLandmark>>({
    name: 'Bar Counter',
    type: 'bar',
    x: 20,
    y: 15,
    width: 140,
    height: 40,
    label: 'BAR & TAPS',
  });

  const venueTables = tables.filter(t => {
    if (activeSectionId === 'all') return true;
    return t.sectionId === activeSectionId;
  });

  const selectedTable = tables.find(t => t.id === selectedTableId);

  const handleSaveNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTable.name) return;

    const tableToCreate: RestaurantTable = {
      id: generateId('tbl'),
      venueId: activeVenue.id,
      sectionId: newTable.sectionId || sections[0]?.id || 'sec_main',
      name: newTable.name,
      shape: (newTable.shape as TableShape) || 'square',
      capacity: Number(newTable.capacity) || 4,
      status: 'available',
      x: Number(newTable.x) || 50,
      y: Number(newTable.y) || 50,
      width: Number(newTable.width) || (newTable.shape === 'rectangle' || newTable.shape === 'booth' ? 110 : 80),
      height: Number(newTable.height) || 80,
    };

    addTable(tableToCreate);
    setSelectedTableId(tableToCreate.id);
    setIsAddTableOpen(false);
  };

  const handleSaveNewSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    const sectionToCreate: FloorSection = {
      id: generateId('sec'),
      venueId: activeVenue.id,
      name: newSectionName.trim(),
      color: newSectionColor,
      order: sections.length + 1,
    };

    addSection(sectionToCreate);
    setActiveSectionId(sectionToCreate.id);
    setNewSectionName('');
    setIsAddSectionOpen(false);
  };

  const handleSaveNewLandmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLandmark.name) return;

    const landmarkToCreate: FloorLandmark = {
      id: generateId('lmk'),
      venueId: activeVenue.id,
      name: newLandmark.name,
      type: (newLandmark.type as any) || 'bar',
      x: Number(newLandmark.x) || 20,
      y: Number(newLandmark.y) || 20,
      width: Number(newLandmark.width) || 120,
      height: Number(newLandmark.height) || 40,
      label: newLandmark.label || newLandmark.name,
    };

    addLandmark(landmarkToCreate);
    setIsAddLandmarkOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
      {/* Top Toolbar */}
      <div className="bg-white p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Section Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveSectionId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
              activeSectionId === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            All Floor Areas ({tables.length})
          </button>

          {sections.map(s => {
            const count = tables.filter(t => t.sectionId === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSectionId(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border flex items-center space-x-1.5 ${
                  activeSectionId === s.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color || '#3b82f6' }}
                />
                <span>{s.name}</span>
                <span className="opacity-75 font-mono text-[10px]">({count})</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsAddSectionOpen(true)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
            title="Add New Section / Room"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Area</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddLandmarkOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>+ Landmark (Bar/Door)</span>
          </button>

          <button
            onClick={() => setIsAddTableOpen(true)}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Table</span>
          </button>
        </div>
      </div>

      {/* Main Designer Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: 2D Interactive Blueprint Canvas */}
        <div className="flex-1 bg-slate-100 p-4 relative overflow-auto select-none flex items-center justify-center">
          <div className="w-[1000px] h-[650px] bg-white rounded-2xl border-2 border-dashed border-slate-300 relative shadow-sm overflow-hidden">
            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#64748b 1px, transparent 1px), radial-gradient(#64748b 1px, #ffffff 1px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px',
              }}
            />

            {/* Architectural Landmarks */}
            {landmarks.map(lm => (
              <div
                key={lm.id}
                style={{
                  left: `${lm.x}%`,
                  top: `${lm.y}%`,
                  width: `${lm.width}px`,
                  height: `${lm.height}px`,
                }}
                className="absolute z-0 bg-slate-200/80 border border-slate-300 rounded-lg flex items-center justify-center px-2 text-[11px] font-black uppercase tracking-wider text-slate-600 shadow-2xs"
              >
                <span>{lm.label || lm.name}</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteLandmark(lm.id);
                  }}
                  className="ml-2 text-slate-400 hover:text-rose-600"
                  title="Remove Landmark"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Tables on Blueprint */}
            {venueTables.map(t => {
              const isSelected = selectedTableId === t.id;
              const section = sections.find(s => s.id === t.sectionId);

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  style={{
                    left: `${t.x}%`,
                    top: `${t.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${t.width || 80}px`,
                    height: `${t.height || 80}px`,
                  }}
                  className={`absolute z-10 cursor-pointer flex flex-col items-center justify-center transition-all ${
                    t.shape === 'round' ? 'rounded-full' : t.shape === 'booth' ? 'rounded-xl border-t-4' : 'rounded-lg'
                  } ${
                    isSelected
                      ? 'bg-slate-900 text-white ring-4 ring-slate-900/20 shadow-lg scale-105 border-slate-900'
                      : 'bg-white border-2 border-slate-300 hover:border-slate-500 text-slate-800 shadow-xs'
                  }`}
                >
                  {/* Table Label */}
                  <span className="font-bold text-xs font-mono">{t.name}</span>
                  <div className="flex items-center space-x-0.5 text-[10px] opacity-75">
                    <Users className="w-2.5 h-2.5" />
                    <span>{t.capacity}p</span>
                  </div>

                  {section && (
                    <div
                      className="absolute bottom-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: section.color || '#3b82f6' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Table Inspector & Position Controls */}
        <div className="w-80 bg-white border-l border-slate-200 p-4 flex flex-col justify-between overflow-y-auto">
          {selectedTable ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Table Settings</h3>
                  <span className="text-xs text-slate-500 font-mono">ID: {selectedTable.id}</span>
                </div>

                <button
                  onClick={() => {
                    deleteTable(selectedTable.id);
                    setSelectedTableId(null);
                  }}
                  className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                  title="Delete Table"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Table Name & Area */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Table Name / Number</label>
                  <input
                    type="text"
                    value={selectedTable.name}
                    onChange={e => updateTable({ ...selectedTable, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Floor Section</label>
                  <select
                    value={selectedTable.sectionId}
                    onChange={e => updateTable({ ...selectedTable, sectionId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  >
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity & Shape */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Seats (Covers)</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={selectedTable.capacity}
                      onChange={e => updateTable({ ...selectedTable, capacity: parseInt(e.target.value) || 2 })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Shape</label>
                    <select
                      value={selectedTable.shape}
                      onChange={e => updateTable({ ...selectedTable, shape: e.target.value as TableShape })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                    >
                      <option value="square">Square</option>
                      <option value="round">Round</option>
                      <option value="rectangle">Rectangle</option>
                      <option value="booth">Booth</option>
                      <option value="bar_stool">Bar Stool</option>
                    </select>
                  </div>
                </div>

                {/* Position Coordinates (X% and Y%) */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Position on Blueprint
                  </span>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Horizontal (X):</span>
                      <span className="font-mono font-bold">{Math.round(selectedTable.x)}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={selectedTable.x}
                      onChange={e => moveTablePosition(selectedTable.id, parseFloat(e.target.value), selectedTable.y)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Vertical (Y):</span>
                      <span className="font-mono font-bold">{Math.round(selectedTable.y)}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={selectedTable.y}
                      onChange={e => moveTablePosition(selectedTable.id, selectedTable.x, parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
              <Move className="w-8 h-8 mb-2 stroke-1" />
              <h4 className="font-bold text-xs text-slate-700">Select a Table</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click any table on the blueprint canvas to edit its shape, capacity, or position coordinates.
              </p>
            </div>
          )}

          {/* Quick Add Tip */}
          <div className="pt-3 border-t border-slate-200 text-center">
            <span className="text-[10px] text-slate-400">
              Changes auto-save instantly to live register floor.
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Add New Table */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add Table to Blueprint</h3>

            <form onSubmit={handleSaveNewTable} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Table Name / Label</label>
                <input
                  type="text"
                  value={newTable.name || ''}
                  onChange={e => setNewTable({ ...newTable, name: e.target.value })}
                  placeholder="e.g. T14, Booth 4, Deck 2"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Floor Section</label>
                <select
                  value={newTable.sectionId}
                  onChange={e => setNewTable({ ...newTable, sectionId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                >
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Shape</label>
                  <select
                    value={newTable.shape}
                    onChange={e => setNewTable({ ...newTable, shape: e.target.value as TableShape })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="square">Square</option>
                    <option value="round">Round</option>
                    <option value="rectangle">Rectangle</option>
                    <option value="booth">Booth</option>
                    <option value="bar_stool">Bar Stool</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seats (Covers)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newTable.capacity}
                    onChange={e => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 2 })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Place Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Floor Section */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add Floor Area / Room</h3>

            <form onSubmit={handleSaveNewSection} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Area Name</label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={e => setNewSectionName(e.target.value)}
                  placeholder="e.g. Beer Garden, Rooftop Deck, Private Dining"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Color Tag</label>
                <div className="flex items-center space-x-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewSectionColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full transition ${
                        newSectionColor === color ? 'ring-2 ring-slate-900 scale-110' : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Create Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Landmark */}
      {isAddLandmarkOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add Floor Landmark</h3>

            <form onSubmit={handleSaveNewLandmark} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Landmark Type / Name</label>
                <select
                  value={newLandmark.type}
                  onChange={e => {
                    const type = e.target.value;
                    const labels: Record<string, string> = {
                      bar: 'BAR & TAPS',
                      kitchen_pass: 'KITCHEN PASS',
                      entrance: 'MAIN ENTRANCE',
                      restroom: 'RESTROOMS',
                      scenery: 'OUTDOOR TERRACE',
                    };
                    setNewLandmark({
                      ...newLandmark,
                      type: type as any,
                      name: labels[type] || type,
                      label: labels[type] || type,
                    });
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                >
                  <option value="bar">Bar Counter</option>
                  <option value="kitchen_pass">Kitchen Pass / Docket Rail</option>
                  <option value="entrance">Main Entrance Door</option>
                  <option value="restroom">Restrooms</option>
                  <option value="scenery">Terrace / Ocean View</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Display Label</label>
                <input
                  type="text"
                  value={newLandmark.label || ''}
                  onChange={e => setNewLandmark({ ...newLandmark, label: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddLandmarkOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Add Landmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
