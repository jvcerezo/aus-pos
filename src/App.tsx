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
import { AdminPortalScreen } from './components/admin/AdminPortalScreen';

const PosAppContent: React.FC = () => {
  const { activeMode } = usePos();
  const { isLocked } = useAuth();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 text-slate-900 overflow-hidden font-sans select-none">
      {/* Top Navigation Bar */}
      <TopNavBar onOpenPinModal={() => setIsPinModalOpen(true)} />

      {/* Main Screen Body */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-100">
        {activeMode === 'tables' && <TableMapScreen />}
        {activeMode === 'pos' && <PosScreen />}
        {activeMode === 'kds' && <KdsScreen />}
        {activeMode === 'reports' && <EodReportsScreen />}
        {activeMode === 'admin' && <AdminPortalScreen />}
      </main>

      {/* Bottom Status & Telemetry Bar */}
      <BottomStatusBar />

      {/* Staff PIN Lock Modal */}
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
