import React, { useState } from 'react';
import { Settings, Save, Building2, Percent, Check } from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import type { VenueProfile } from '../../types';

export const VenueSettingsModal: React.FC = () => {
  const { activeVenue, updateVenue } = useVenue();
  const [formData, setFormData] = useState<VenueProfile>({ ...activeVenue });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateVenue(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.25rem)] bg-slate-100 p-4 lg:p-6 overflow-y-auto select-none">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center border border-slate-200">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Venue Profile & ATO Settings</h2>
              <p className="text-xs text-slate-500">
                Business details, ABN, and surcharges for {activeVenue.name}
              </p>
            </div>
          </div>

          {isSaved && (
            <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold">
              <Check className="w-4 h-4" />
              <span>Settings Saved</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Business Details & ABN */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-600" />
              Australian Business Registration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Trading Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Australian Business Number (ABN)</label>
                <input
                  type="text"
                  value={formData.abn}
                  onChange={e => setFormData({ ...formData, abn: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Suburb</label>
                  <input
                    type="text"
                    value={formData.address.suburb}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, suburb: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                  <select
                    value={formData.address.state}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value as any },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                  >
                    {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Postcode</label>
                  <input
                    type="text"
                    value={formData.address.postcode}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, postcode: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Surcharges Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-slate-600" />
              Australian Surcharges Engine
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Weekend Surcharge Rate</span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {formData.surcharges.weekendPercent}%
                  </span>
                </div>
                <input
                  type="number"
                  value={formData.surcharges.weekendPercent}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      surcharges: {
                        ...formData.surcharges,
                        weekendPercent: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Public Holiday Surcharge Rate</span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {formData.surcharges.publicHolidayPercent}%
                  </span>
                </div>
                <input
                  type="number"
                  value={formData.surcharges.publicHolidayPercent}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      surcharges: {
                        ...formData.surcharges,
                        publicHolidayPercent: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Receipt Customization */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              80mm Thermal Receipt Header & Footer
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Receipt Footer Greeting</label>
              <input
                type="text"
                value={formData.receiptFooter}
                onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Venue Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
