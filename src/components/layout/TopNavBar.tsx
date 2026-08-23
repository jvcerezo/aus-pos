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
  Sun,
  Moon,
  Zap,
  Sliders
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
    uiTheme,
    toggleUiTheme,
    isSimpleMode,
    toggleSimpleMode,
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


  const isLight = uiTheme === 'light';

  return (
    <header
      className={`h-16 px-4 flex items-center justify-between select-none border-b transition-colors z-20 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      {/* Left: Venue Switcher */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <button
            onClick={() => {
              sounds.playTap();
              setIsVenueDropdownOpen(!isVenueDropdownOpen);
              setIsAdminMenuOpen(false);
            }}
            className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border transition ${
              isLight
                ? 'bg-slate-100/80 hover:bg-slate-200/80 border-slate-200 text-slate-900'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-white'
            }`}
          >
            <div
              className="w-3.5 h-3.5 rounded-full shadow-sm"
              style={{ backgroundColor: activeVenue.themeColor }}
            />
            <div className="text-left">
              <div className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                {activeVenue.name}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </div>
              <div className="text-[10px] opacity-60 font-mono">
                ABN {activeVenue.abn}
              </div>
            </div>
          </button>

          {/* Venue Dropdown */}
          {isVenueDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsVenueDropdownOpen(false)} />
              <div
                className={`absolute top-full left-0 mt-1.5 w-72 rounded-2xl shadow-2xl border p-2 z-40 space-y-1 ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider opacity-60">
                  Switch Restaurant Template
                </div>
                {venues.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                      sounds.playTap();
                      setActiveVenueId(v.id);
                      setIsVenueDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left ${
                      v.id === activeVenue.id
                        ? 'bg-sky-500/15 border border-sky-500/30 text-sky-600 font-bold'
                        : isLight
                        ? 'hover:bg-slate-100 text-slate-700'
                        : 'hover:bg-slate-700/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.themeColor }} />
                      <div>
                        <div className="text-sm font-semibold">{v.name}</div>
                        <div className="text-[11px] opacity-60 capitalize">
                          {v.address.suburb}, {v.address.state} • {v.serviceType}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center: Simplified 3 Main Action Tabs */}
      <nav
        className={`flex items-center p-1 rounded-2xl border space-x-1 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/80 border-slate-800'
        }`}
      >
        {activeVenue.serviceType !== 'cafe' && (
          <button
            onClick={() => {
              sounds.playTap();
              setActiveMode('tables');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeMode === 'tables'
                ? 'bg-sky-600 text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Tables</span>
          </button>
        )}

        <button
          onClick={() => {
            sounds.playTap();
            setActiveMode('pos');
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeMode === 'pos'
              ? 'bg-sky-600 text-white shadow-md'
              : isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          {activeVenue.serviceType === 'cafe' ? <Coffee className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
          <span>Register POS</span>
          {currentOrder && currentOrder.items.length > 0 && (
            <span className="bg-amber-500 text-slate-950 text-xs px-1.5 py-0.2 rounded-full font-black">
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeMode === 'kds'
                ? 'bg-sky-600 text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen</span>
          </button>
        )}
      </nav>

      {/* Right Controls: Mode Switch, Theme, Surcharges & Admin */}
      <div className="flex items-center space-x-2.5">
        {/* Simple Touch Mode Toggle */}
        <button
          onClick={toggleSimpleMode}
          title={isSimpleMode ? 'Switch to Detailed Mode' : 'Switch to Simple Quick-Touch Mode'}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            isSimpleMode
              ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40 font-black'
              : isLight
              ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${isSimpleMode ? 'fill-emerald-500 text-emerald-500' : ''}`} />
          <span>{isSimpleMode ? 'Simple Mode ON' : 'Simple Mode'}</span>
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleUiTheme}
          title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          className={`p-2 rounded-xl border transition ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400'
          }`}
        >
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Surcharges Quick Toggles (compact) */}
        <div className="hidden xl:flex items-center space-x-1">
          <button
            onClick={() => toggleWeekendSurcharge()}
            title="Toggle Weekend 10% Surcharge"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              isWeekendActive
                ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                : isLight
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            +{activeVenue.surcharges.weekendPercent}% W/End
          </button>
        </div>

        {/* Live Clock */}
        <div
          className={`hidden sm:flex items-center space-x-1 text-xs font-mono font-bold px-2.5 py-1.5 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-sky-500" />
          <span>{currentTime}</span>
        </div>

        {/* More / Admin Tools Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playTap();
              setIsAdminMenuOpen(!isAdminMenuOpen);
              setIsVenueDropdownOpen(false);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition ${
              isAdminMenuOpen || activeMode === 'reports' || activeMode === 'menu-editor' || activeMode === 'venue-settings'
                ? 'bg-sky-600 text-white border-sky-500'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Admin / More</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* Admin Menu Dropdown */}
          {isAdminMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsAdminMenuOpen(false)} />
              <div
                className={`absolute top-full right-0 mt-1.5 w-60 rounded-2xl shadow-2xl border p-2 z-40 space-y-1 ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveMode('reports');
                    setIsAdminMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeMode === 'reports' ? 'bg-sky-500/15 text-sky-600' : isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div>Z-Report & Cash Up</div>
                    <div className="text-[10px] font-normal opacity-60">Daily shift reconciliation</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveMode('menu-editor');
                    setIsAdminMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeMode === 'menu-editor' ? 'bg-sky-500/15 text-sky-600' : isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4 text-sky-500" />
                  <div>
                    <div>Menu Catalog & Prices</div>
                    <div className="text-[10px] font-normal opacity-60">Add items & prices inc GST</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveMode('venue-settings');
                    setIsAdminMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeMode === 'venue-settings' ? 'bg-sky-500/15 text-sky-600' : isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700'
                  }`}
                >
                  <Settings className="w-4 h-4 text-amber-500" />
                  <div>
                    <div>Venue Profile & ABN</div>
                    <div className="text-[10px] font-normal opacity-60">Surcharges & receipts</div>
                  </div>
                </button>

                <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      onOpenPinModal();
                      setIsAdminMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl text-xs font-bold transition text-left text-rose-500 ${
                      isLight ? 'hover:bg-rose-50' : 'hover:bg-rose-500/10'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Lock / Switch Staff PIN</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Staff Quick Avatar Button */}
        <button
          onClick={onOpenPinModal}
          className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border transition ${
            isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
          }`}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow"
            style={{ backgroundColor: currentStaff.avatarColor }}
          >
            {currentStaff.name.charAt(0)}
          </div>
          <div className="text-left text-xs hidden md:block">
            <div className="font-bold leading-tight">{currentStaff.name.split(' ')[0]}</div>
          </div>
        </button>
      </div>
    </header>
  );
};
