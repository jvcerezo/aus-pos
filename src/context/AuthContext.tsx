import React, { createContext, useContext, useState, useEffect } from 'react';
import type { StaffMember } from '../types';
import { INITIAL_STAFF } from '../data/initialTables';

interface AuthContextType {
  currentStaff: StaffMember;
  staffList: StaffMember[];
  isLocked: boolean;
  lockTerminal: () => void;
  unlockWithPin: (pin: string) => boolean;
  switchStaff: (staffId: string) => void;
  addNewStaff: (staff: StaffMember) => void;
  updateStaff: (staff: StaffMember) => void;
  deleteStaff: (staffId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STAFF_STORAGE_KEY = 'aus_pos_staff_list_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(STAFF_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [currentStaff, setCurrentStaff] = useState<StaffMember>(staffList[0] || INITIAL_STAFF[0]);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffList));
  }, [staffList]);

  const lockTerminal = () => {
    setIsLocked(true);
  };

  const unlockWithPin = (pin: string): boolean => {
    const found = staffList.find(s => s.pin === pin);
    if (found) {
      setCurrentStaff(found);
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const switchStaff = (staffId: string) => {
    const found = staffList.find(s => s.id === staffId);
    if (found) {
      setCurrentStaff(found);
    }
  };

  const addNewStaff = (staff: StaffMember) => {
    setStaffList(prev => [...prev, staff]);
  };

  const updateStaff = (staff: StaffMember) => {
    setStaffList(prev => prev.map(s => (s.id === staff.id ? staff : s)));
    if (currentStaff.id === staff.id) {
      setCurrentStaff(staff);
    }
  };

  const deleteStaff = (staffId: string) => {
    setStaffList(prev => prev.filter(s => s.id !== staffId));
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
        updateStaff,
        deleteStaff,
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
