import React, { useState } from 'react';
import { VenueProvider } from './context/VenueContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PosProvider, usePos } from './context/PosContext';
import { TopNavBar } from './components/layout/TopNavBar';
import { BottomStatusBar } from './components/layout/BottomStatusBar';
import { StaffPinModal } from './components/layout/StaffPinModal';
import { TableMapScreen } from './components/tables/TableMapScreen';
import { PosScreen } from './components/pos/PosScreen';
import { KdsScreen } from './components/kds/KdsScreen';
import { EodReportsScreen } from './components/reports/EodReportsScreen';
import { VenueSettingsModal } from './components/venue-manager/VenueSettingsModal';
import { MenuEditorModal } from './components/venue-manager/MenuEditorModal';

const PosAppContent: React.FC = () => {
  const { activeMode, uiTheme } = usePos();
  const { isLocked } = useAuth();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const isLight = uiTheme === 'light';

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans select-none transition-colors ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >

      {/* Top Bar */}
      <TopNavBar onOpenPinModal={() => setIsPinModalOpen(true)} />

      {/* Main Mode View */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeMode === 'tables' && <TableMapScreen />}
        {activeMode === 'pos' && <PosScreen />}
        {activeMode === 'kds' && <KdsScreen />}
        {activeMode === 'reports' && <EodReportsScreen />}
        {activeMode === 'menu-editor' && <MenuEditorModal />}
        {activeMode === 'venue-settings' && <VenueSettingsModal />}
      </main>

      {/* Bottom Status Bar */}
      <BottomStatusBar />

      {/* Staff PIN Lock / Switch Modal */}
      {(isPinModalOpen || isLocked) && (
        <StaffPinModal
          isOpen={isPinModalOpen || isLocked}
          onClose={() => setIsPinModalOpen(false)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <VenueProvider>
      <AuthProvider>
        <PosProvider>
          <PosAppContent />
        </PosProvider>
      </AuthProvider>
    </VenueProvider>
  );
}

export default App;
