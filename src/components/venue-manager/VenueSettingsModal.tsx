import React, { useState } from 'react';
import { Settings, Save, Building2, Percent, Check } from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import type { VenueProfile } from '../../types';
import { sounds } from '../../utils/sound';


export const VenueSettingsModal: React.FC = () => {
  const { activeVenue, updateVenue } = useVenue();
  const [formData, setFormData] = useState<VenueProfile>({ ...activeVenue });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateVenue(formData);
    sounds.playPaymentSuccess();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-6.25rem)] bg-slate-950 p-4 lg:p-6 overflow-y-auto select-none">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center border border-sky-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Australian Venue & White-Label Config</h2>
              <p className="text-xs text-slate-400">
                Configure business details, Australian ATO compliance, and surcharges for {activeVenue.name}
              </p>
            </div>
          </div>

          {isSaved && (
            <div className="flex items-center space-x-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse">
              <Check className="w-4 h-4" />
              <span>Settings Saved</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Business Details & ABN */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-400" />
              Australian Business Registration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Venue Display Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Legal Trading Name</label>
                <input
                  type="text"
                  value={formData.tradingName}
                  onChange={e => setFormData({ ...formData, tradingName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Australian Business Number (ABN - 11 Digits)
                </label>
                <input
                  type="text"
                  value={formData.abn}
                  onChange={e => setFormData({ ...formData, abn: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Suburb</label>
                <input
                  type="text"
                  value={formData.address.suburb}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, suburb: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">State</label>
                  <select
                    value={formData.address.state}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value as VenueProfile['address']['state'] },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Postcode</label>
                  <input
                    type="text"
                    value={formData.address.postcode}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, postcode: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Surcharges & Rates */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-400" />
              Australian Surcharges Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Weekend Surcharge</span>
                  <input
                    type="checkbox"
                    checked={formData.surcharges.weekendEnabled}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        surcharges: { ...formData.surcharges, weekendEnabled: e.target.checked },
                      })
                    }
                    className="rounded accent-sky-500 w-4 h-4"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.5"
                    value={formData.surcharges.weekendPercent}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        surcharges: { ...formData.surcharges, weekendPercent: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center"
                  />
                  <span className="text-xs text-slate-400">% (Sat & Sun)</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Public Holiday</span>
                  <input
                    type="checkbox"
                    checked={formData.surcharges.publicHolidayEnabled}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        surcharges: { ...formData.surcharges, publicHolidayEnabled: e.target.checked },
                      })
                    }
                    className="rounded accent-sky-500 w-4 h-4"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.5"
                    value={formData.surcharges.publicHolidayPercent}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        surcharges: { ...formData.surcharges, publicHolidayPercent: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center"
                  />
                  <span className="text-xs text-slate-400">% (Holidays)</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Card Payment Surcharges</span>
                  <input
                    type="checkbox"
                    checked={formData.surcharges.cardSurchargeEnabled}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        surcharges: { ...formData.surcharges, cardSurchargeEnabled: e.target.checked },
                      })
                    }
                    className="rounded accent-sky-500 w-4 h-4"
                  />
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>EFTPOS:</span>
                    <span className="font-mono text-white">{formData.surcharges.cardSurchargeEftpos}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Visa / MC:</span>
                    <span className="font-mono text-white">{formData.surcharges.cardSurchargeVisaMastercard}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amex:</span>
                    <span className="font-mono text-white">{formData.surcharges.cardSurchargeAmex}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Custom Header & Footer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Tax Invoice Receipt Messages
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Receipt Header Tagline</label>
                <textarea
                  rows={3}
                  value={formData.receiptHeader}
                  onChange={e => setFormData({ ...formData, receiptHeader: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Receipt Footer Note</label>
                <textarea
                  rows={3}
                  value={formData.receiptFooter}
                  onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-sky-950/60 transition active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Save Venue Template Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
