import React, { useState } from 'react';
import { Delete, Lock, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sounds } from '../../utils/sound';

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
      sounds.playTap();
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        // Auto verify
        setTimeout(() => {
          const success = unlockWithPin(nextPin);
          if (success) {
            setPin('');
            onClose();
          } else {
            setErrorMsg('Invalid PIN. Please try again.');
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    sounds.playTap();
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleQuickSwitch = (staffId: string) => {
    switchStaff(staffId);
    setPin('');
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-sky-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Staff PIN Verification</h2>
          <p className="text-sm text-slate-400">Enter 4-digit PIN to switch staff or unlock terminal</p>
        </div>

        {/* Staff Quick Select Row */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {staffList.map(staff => (
            <button
              key={staff.id}
              onClick={() => handleQuickSwitch(staff.id)}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center border transition ${
                currentStaff.id === staff.id
                  ? 'bg-sky-600/20 border-sky-500 text-sky-400'
                  : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80 text-slate-300'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mb-1 shadow"
                style={{ backgroundColor: staff.avatarColor }}
              >
                {staff.name.charAt(0)}
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {staff.name.split(' ')[0]}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                PIN: {staff.pin}
              </span>
            </button>
          ))}
        </div>

        {/* PIN Circles Display */}
        <div className="flex justify-center space-x-4 mb-6">
          {[0, 1, 2, 3].map(index => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                pin.length > index
                  ? 'bg-sky-400 scale-125 shadow-lg shadow-sky-500/50'
                  : 'bg-slate-700 border border-slate-600'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="text-rose-400 text-xs font-medium text-center mb-4 bg-rose-500/10 py-1.5 rounded-lg border border-rose-500/20">
            {errorMsg}
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-2xl font-bold rounded-2xl transition border border-slate-700 shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPin('')}
            className="h-14 bg-slate-800/50 hover:bg-slate-700 text-xs font-semibold uppercase tracking-wider rounded-2xl text-slate-400 transition border border-slate-700/50"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-14 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-2xl font-bold rounded-2xl transition border border-slate-700 shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 bg-slate-800/50 hover:bg-slate-700 flex items-center justify-center rounded-2xl text-slate-400 transition border border-slate-700/50"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
