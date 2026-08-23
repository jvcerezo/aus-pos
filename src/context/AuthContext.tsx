import React, { createContext, useContext, useState } from 'react';
import type { StaffMember } from '../types';

import { INITIAL_STAFF } from '../data/initialTables';
import { sounds } from '../utils/sound';

interface AuthContextType {
  currentStaff: StaffMember;
  staffList: StaffMember[];
  isLocked: boolean;
  lockTerminal: () => void;
  unlockWithPin: (pin: string) => boolean;
  switchStaff: (staffId: string) => void;
  addNewStaff: (staff: StaffMember) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [currentStaff, setCurrentStaff] = useState<StaffMember>(INITIAL_STAFF[0]);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const lockTerminal = () => {
    sounds.playTap();
    setIsLocked(true);
  };

  const unlockWithPin = (pin: string): boolean => {
    const found = staffList.find(s => s.pin === pin);
    if (found) {
      setCurrentStaff(found);
      setIsLocked(false);
      sounds.playPaymentSuccess();
      return true;
    }
    sounds.playError();
    return false;
  };

  const switchStaff = (staffId: string) => {
    const found = staffList.find(s => s.id === staffId);
    if (found) {
      setCurrentStaff(found);
      sounds.playTap();
    }
  };

  const addNewStaff = (staff: StaffMember) => {
    setStaffList(prev => [...prev, staff]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentStaff,
        staffList,
        isLocked,
        lockTerminal,
        unlockWithPin,
        switchStaff,
        addNewStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
