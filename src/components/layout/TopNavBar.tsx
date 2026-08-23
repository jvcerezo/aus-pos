import React, { useState, useEffect } from 'react';
import {
  Utensils,
  LayoutGrid,
  ChefHat,
  BarChart3,
  Settings,
  Lock,
  Clock,
  Coffee,
  ChevronDown,
  FileText,
  Sliders,
  Calendar
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { useAuth } from '../../context/AuthContext';
import { usePos } from '../../context/PosContext';
import { formatAusTime } from '../../utils/formatters';
import { sounds } from '../../utils/sound';

export const TopNavBar: React.FC<{ onOpenPinModal: () => void }> = ({ onOpenPinModal }) => {
  const { venues, activeVenue, setActiveVenueId } = useVenue();
  const { currentStaff } = useAuth();
  const {
    activeMode,
    setActiveMode,
    currentOrder,
    toggleWeekendSurcharge,
  } = usePos();


  const [currentTime, setCurrentTime] = useState<string>(formatAusTime(new Date()));
  const [isVenueDropdownOpen, setIsVenueDropdownOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatAusTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isWeekendActive = currentOrder
    ? currentOrder.appliedWeekendSurcharge
    : activeVenue.surcharges.weekendEnabled;

  return (
    <header className="h-14 bg-slate-900 text-white px-3 flex items-center justify-between select-none border-b border-slate-800 z-30 shadow-xs">
      {/* Left: Venue Switcher & ABN */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={() => {
              sounds.playTap();
              setIsVenueDropdownOpen(!isVenueDropdownOpen);
              setIsAdminMenuOpen(false);
            }}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <div
              className="w-3 h-3 rounded-sm shadow-xs"
              style={{ backgroundColor: activeVenue.themeColor }}
            />
            <div className="text-left">
              <div className="font-bold text-xs text-slate-100 flex items-center gap-1">
                {activeVenue.name}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                ABN {activeVenue.abn}
              </div>
            </div>
          </button>

          {/* Venue Dropdown */}
          {isVenueDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsVenueDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-1.5 z-40 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Venue Template
                </div>
                {venues.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                      sounds.playTap();
                      setActiveVenueId(v.id);
                      setIsVenueDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition text-left text-xs ${
                      v.id === activeVenue.id
                        ? 'bg-sky-600/30 text-sky-300 font-bold border border-sky-500/30'
                        : 'hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: v.themeColor }} />
                      <div>
                        <div className="font-semibold">{v.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{v.address.suburb} • {v.serviceType}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center: Clean POS Tabs (Square Style) */}
      <nav className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        {activeVenue.serviceType !== 'cafe' && (
          <button
            onClick={() => {
              sounds.playTap();
              setActiveMode('tables');
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeMode === 'tables'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Tables</span>
          </button>
        )}

        <button
          onClick={() => {
            sounds.playTap();
            setActiveMode('pos');
          }}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeMode === 'pos'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {activeVenue.serviceType === 'cafe' ? <Coffee className="w-3.5 h-3.5" /> : <Utensils className="w-3.5 h-3.5" />}
          <span>Register</span>
          {currentOrder && currentOrder.items.length > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {currentOrder.items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>

        {activeVenue.enableKds && (
          <button
            onClick={() => {
              sounds.playTap();
              setActiveMode('kds');
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeMode === 'kds'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen</span>
          </button>
        )}
      </nav>

      {/* Right: Surcharges, Admin Menu & Staff */}
      <div className="flex items-center space-x-2">
        {/* Weekend Surcharge Button */}
        <button
          onClick={() => toggleWeekendSurcharge()}
          title="Toggle Australian 10% Weekend Surcharge"
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
            isWeekendActive
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
          }`}
        >
          <Calendar className="w-3 h-3" />
          <span>+{activeVenue.surcharges.weekendPercent}% W/End</span>
        </button>

        {/* Live Aussie Clock */}
        <div className="hidden md:flex items-center space-x-1 text-xs font-mono text-slate-300 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{currentTime}</span>
        </div>

        {/* Admin Tools Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playTap();
              setIsAdminMenuOpen(!isAdminMenuOpen);
              setIsVenueDropdownOpen(false);
            }}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition ${
              isAdminMenuOpen || activeMode === 'reports' || activeMode === 'menu-editor' || activeMode === 'venue-settings'
                ? 'bg-sky-600 text-white border-sky-500'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Admin</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isAdminMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsAdminMenuOpen(false)} />
              <div className="absolute top-full right-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1 z-40 space-y-0.5 text-xs">
                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveMode('reports');
                    setIsAdminMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700 text-slate-200 text-left font-medium"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Z-Report & Cash-Up</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveMode('menu-editor');
                    setIsAdminMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700 text-slate-200 text-left font-medium"
                >
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Menu & Prices (Inc GST)</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveMode('venue-settings');
                    setIsAdminMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700 text-slate-200 text-left font-medium"
                >
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Venue Profile & ABN</span>
                </button>

                <div className="pt-1 border-t border-slate-700">
                  <button
                    onClick={() => {
                      onOpenPinModal();
                      setIsAdminMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-rose-500/20 text-rose-300 text-left font-bold"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Lock / Switch Staff</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Staff PIN Button */}
        <button
          onClick={onOpenPinModal}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
            style={{ backgroundColor: currentStaff.avatarColor }}
          >
            {currentStaff.name.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
            {currentStaff.name.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
};
