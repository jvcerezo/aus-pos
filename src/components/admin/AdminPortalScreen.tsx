import React, { useState } from 'react';
import {
  LayoutGrid,
  UtensilsCrossed,
  Building2,
  Users
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { FloorPlanDesigner } from './FloorPlanDesigner';
import { MenuManager } from './MenuManager';
import { VenueSettingsModal } from '../venue-manager/VenueSettingsModal';
import { StaffRosterManager } from './StaffRosterManager';

type AdminTab = 'floor' | 'menu' | 'venue' | 'staff';

export const AdminPortalScreen: React.FC = () => {
  const { activeVenue } = useVenue();
  const [activeTab, setActiveTab] = useState<AdminTab>('floor');

  const tabs: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'floor', label: 'Floor & Table Layout', icon: LayoutGrid },
    { id: 'menu', label: 'Menu Catalog & Pricing', icon: UtensilsCrossed },
    { id: 'venue', label: 'Venue Profile & ABN', icon: Building2 },
    { id: 'staff', label: 'Staff Roster & PINs', icon: Users },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.75rem)] bg-slate-100 select-none overflow-hidden">
      {/* Admin Module Switcher Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs">
            ⚙️
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Back-Office Admin Portal</h2>
            <p className="text-[10px] text-slate-500">Customizing: {activeVenue.name}</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'floor' && <FloorPlanDesigner />}
        {activeTab === 'menu' && <MenuManager />}
        {activeTab === 'venue' && <VenueSettingsModal />}
        {activeTab === 'staff' && <StaffRosterManager />}
      </div>
    </div>
  );
};
