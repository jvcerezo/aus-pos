import React, { useState } from 'react';
import { Delete, Lock, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StaffPinModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { staffList, currentStaff, unlockWithPin, switchStaff } = useAuth();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = unlockWithPin(nextPin);
          if (success) {
            setPin('');
            onClose();
          } else {
            setErrorMsg('Invalid PIN. Try: 1111, 2222, 3333, 4444');
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleQuickSwitch = (staffId: string) => {
    switchStaff(staffId);
    setPin('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 border border-slate-200">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Staff PIN Login</h2>
          <p className="text-xs text-slate-500">Current: {currentStaff.name}</p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center space-x-3 mb-5">
          {[0, 1, 2, 3].map(index => (
            <div
              key={index}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                pin.length > index
                  ? 'bg-slate-900 border-slate-900 scale-110'
                  : 'border-slate-300 bg-slate-100'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-rose-600 text-xs font-bold text-center mb-3">
            {errorMsg}
          </p>
        )}

        {/* 3x4 Touch Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-12 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl text-lg font-bold font-mono text-slate-900 transition flex items-center justify-center shadow-xs"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPin('')}
            className="h-12 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold transition flex items-center justify-center border border-slate-200"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl text-lg font-bold font-mono text-slate-900 transition flex items-center justify-center shadow-xs"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="h-12 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition flex items-center justify-center border border-slate-200"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Staff Switcher for Demo */}
        <div className="pt-3 border-t border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block text-center mb-2">
            Quick Roster Switch (Demo)
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {staffList.map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleQuickSwitch(st.id)}
                className={`p-2 rounded-lg border text-left text-xs transition ${
                  st.id === currentStaff.id
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="truncate font-semibold">{st.name.split(' ')[0]}</div>
                <div className="text-[10px] opacity-75 font-mono">PIN: {st.pin}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
