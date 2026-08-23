import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { StaffMember, StaffRole } from '../../types';
import { generateId } from '../../utils/formatters';

export const StaffRosterManager: React.FC = () => {
  const { staffList, currentStaff, addNewStaff, updateStaff, deleteStaff } = useAuth();

  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: '',
    role: 'waitstaff',
    pin: '1234',
    avatarColor: '#3b82f6',
  });

  const handleStartCreate = () => {
    setFormData({
      id: generateId('staff'),
      name: '',
      role: 'waitstaff',
      pin: Math.floor(1000 + Math.random() * 9000).toString(),
      avatarColor: '#3b82f6',
    });
    setIsCreating(true);
    setEditingStaff(null);
  };

  const handleStartEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({ ...staff });
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pin || formData.pin.length !== 4) return;

    if (isCreating) {
      const newMember: StaffMember = {
        id: formData.id || generateId('staff'),
        name: formData.name,
        role: formData.role || 'waitstaff',
        pin: formData.pin,
        avatarColor: formData.avatarColor || '#3b82f6',
      };
      addNewStaff(newMember);
    } else if (editingStaff) {
      updateStaff({
        ...editingStaff,
        ...formData,
      } as StaffMember);
    }

    setIsCreating(false);
    setEditingStaff(null);
  };

  const roleBadges: Record<StaffRole, { label: string; color: string }> = {
    admin: { label: 'System Admin', color: 'bg-slate-900 text-white' },
    manager: { label: 'Venue Manager', color: 'bg-purple-100 text-purple-800' },
    cashier: { label: 'Head Cashier', color: 'bg-emerald-100 text-emerald-800' },
    waitstaff: { label: 'Floor Server', color: 'bg-blue-100 text-blue-800' },
    kitchen: { label: 'Kitchen / Chef', color: 'bg-amber-100 text-amber-800' },
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto bg-slate-100">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center border border-slate-200">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Staff Roster & 4-Digit PIN Access</h2>
              <p className="text-xs text-slate-500">
                Manage roles, access levels, and quick touch login PINs
              </p>
            </div>
          </div>

          <button
            onClick={handleStartCreate}
            className="flex items-center space-x-1 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Staff Member</span>
          </button>
        </div>

        {/* Staff Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-600 grid grid-cols-12 gap-2">
            <div className="col-span-4">Staff Name</div>
            <div className="col-span-3">Role & Permissions</div>
            <div className="col-span-3">4-Digit PIN</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {staffList.map(st => {
              const badge = roleBadges[st.role] || roleBadges.waitstaff;
              const isCurrent = st.id === currentStaff.id;

              return (
                <div key={st.id} className="p-3 grid grid-cols-12 gap-2 items-center hover:bg-slate-50 transition">
                  <div className="col-span-4 flex items-center space-x-2.5">
                    <div
                      className="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center"
                      style={{ backgroundColor: st.avatarColor || '#3b82f6' }}
                    >
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{st.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] text-emerald-700 font-bold">Currently Logged In</span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="col-span-3 font-mono font-bold text-slate-700">
                    PIN: <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{st.pin}</span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleStartEdit(st)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      title="Edit Staff"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {staffList.length > 1 && (
                      <button
                        onClick={() => deleteStaff(st.id)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                        title="Remove Staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Create / Edit Staff */}
      {(isCreating || editingStaff) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              {isCreating ? 'Add Team Member' : 'Edit Staff Member'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Liam Smith"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role / Position</label>
                <select
                  value={formData.role || 'waitstaff'}
                  onChange={e => setFormData({ ...formData, role: e.target.value as StaffRole })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                >
                  <option value="manager">Venue Manager (Full Access)</option>
                  <option value="cashier">Head Cashier (Register & Cashup)</option>
                  <option value="waitstaff">Floor Waitstaff (Orders & Tables)</option>
                  <option value="kitchen">Kitchen / Chef (KDS View)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">4-Digit Login PIN</label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.pin || ''}
                  onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                  placeholder="1234"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-center text-lg text-slate-900 tracking-widest focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingStaff(null);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
