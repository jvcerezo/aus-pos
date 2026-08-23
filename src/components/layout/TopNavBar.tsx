import React, { useState, useEffect } from 'react';
import {
  Utensils,
  LayoutGrid,
  ChefHat,
  BarChart3,
  Clock,
  Coffee,
  ChevronDown,
  Calendar,
  Sliders
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { useAuth } from '../../context/AuthContext';
import { usePos } from '../../context/PosContext';
import { formatAusTime } from '../../utils/formatters';

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
    <header className="h-14 bg-white text-slate-900 px-3.5 flex items-center justify-between select-none border-b border-slate-200 z-30 shadow-xs">
      {/* Left: Venue Switcher & ABN */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={() => setIsVenueDropdownOpen(!isVenueDropdownOpen)}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg border border-slate-200 transition"
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeVenue.themeColor }}
            />
            <div className="text-left">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                {activeVenue.name}
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                ABN {activeVenue.abn}
              </div>
            </div>
          </button>

          {/* Venue Dropdown */}
          {isVenueDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsVenueDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-40 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Venue Template
                </div>
                {venues.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setActiveVenueId(v.id);
                      setIsVenueDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition text-left text-xs ${
                      v.id === activeVenue.id
                        ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.themeColor }} />
                      <div>
                        <div className="font-semibold">{v.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{v.address.suburb} • {v.serviceType}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center: Primary Navigation Tabs */}
      <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        {activeVenue.serviceType !== 'cafe' && (
          <button
            onClick={() => setActiveMode('tables')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeMode === 'tables'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Floor Tables</span>
          </button>
        )}

        <button
          onClick={() => setActiveMode('pos')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeMode === 'pos'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {activeVenue.serviceType === 'cafe' ? <Coffee className="w-3.5 h-3.5" /> : <Utensils className="w-3.5 h-3.5" />}
          <span>Register</span>
          {currentOrder && currentOrder.items.length > 0 && (
            <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {currentOrder.items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>

        {activeVenue.enableKds && (
          <button
            onClick={() => setActiveMode('kds')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeMode === 'kds'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen (KDS)</span>
          </button>
        )}

        <button
          onClick={() => setActiveMode('reports')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeMode === 'reports'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Z-Report</span>
        </button>

        <button
          onClick={() => setActiveMode('admin')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeMode === 'admin'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Admin Portal</span>
        </button>
      </nav>

      {/* Right: Surcharges & Staff */}
      <div className="flex items-center space-x-2">
        {/* Weekend Surcharge Button */}
        <button
          onClick={() => toggleWeekendSurcharge()}
          title="Toggle Australian 10% Weekend Surcharge"
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
            isWeekendActive
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-3 h-3" />
          <span>+{activeVenue.surcharges.weekendPercent}% Weekend</span>
        </button>

        {/* Live Aussie Clock */}
        <div className="hidden md:flex items-center space-x-1 text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{currentTime}</span>
        </div>

        {/* Staff PIN Button */}
        <button
          onClick={onOpenPinModal}
          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
            style={{ backgroundColor: currentStaff.avatarColor }}
          >
            {currentStaff.name.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
            {currentStaff.name.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
};
