import React, { useState, useRef } from 'react';
import {
  BarChart3,
  DollarSign,
  Printer,
  CheckCircle2,
  Lock,
  Clock,
  Coins
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import { formatAbn, formatAud, formatAusDateTime } from '../../utils/formatters';
import { sounds } from '../../utils/sound';
import type { ShiftSummary } from '../../types';

export const EodReportsScreen: React.FC = () => {
  const { activeVenue } = useVenue();
  const { currentShift, closeShiftZReport, updateShiftFloat, shiftHistory } = usePos();


  const [closingCashInput, setClosingCashInput] = useState<string>('');
  const [openingFloatInput, setOpeningFloatInput] = useState<string>(currentShift.openingFloat.toString());
  const [isCashUpModalOpen, setIsCashUpModalOpen] = useState(false);
  const [isFloatEditOpen, setIsFloatEditOpen] = useState(false);
  const [selectedReportToPrint, setSelectedReportToPrint] = useState<ShiftSummary | null>(null);

  const zReportRef = useRef<HTMLDivElement>(null);

  const expectedCashInDrawer = Number((currentShift.openingFloat + currentShift.cashSales).toFixed(2));
  const countedCash = parseFloat(closingCashInput) || 0;
  const cashVariance = Number((countedCash - expectedCashInDrawer).toFixed(2));

  const handleFinalizeZReport = () => {
    if (isNaN(countedCash) || closingCashInput === '') {
      sounds.playError();
      return;
    }
    const report = closeShiftZReport(countedCash);
    setSelectedReportToPrint(report);
    setIsCashUpModalOpen(false);
    setClosingCashInput('');
  };

  const handleUpdateFloat = () => {
    const val = parseFloat(openingFloatInput);
    if (!isNaN(val) && val >= 0) {
      updateShiftFloat(val);
      setIsFloatEditOpen(false);
      sounds.playTap();
    }
  };

  const handlePrint = () => {
    sounds.playTap();
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-6.25rem)] bg-slate-950 p-4 lg:p-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Australian ATO Compliant Shift Reconciliation</span>
          </div>
          <h2 className="text-2xl font-black text-white">End-of-Day (Z-Report) & Cash Up</h2>
          <p className="text-xs text-slate-400">
            Current Active Shift opened at {formatAusDateTime(currentShift.openedAt)} by {currentShift.openedByStaffName}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              sounds.playTap();
              setIsFloatEditOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 transition"
          >
            Adjust Float ({formatAud(currentShift.openingFloat)})
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setSelectedReportToPrint(currentShift);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-sky-400 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Mid-Shift (X-Report)</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setIsCashUpModalOpen(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/40 transition"
          >
            <Lock className="w-4 h-4" />
            <span>Close Shift (Z-Report)</span>
          </button>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Gross Sales */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Total Gross Sales (Inc GST)</span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {formatAud(currentShift.totalGrossSales)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Across {currentShift.ordersCount} settled orders
          </span>
        </div>

        {/* GST 10% */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">ATO GST Collected (1/11th)</span>
          <div className="text-2xl font-black font-mono text-sky-400">
            {formatAud(currentShift.totalGst)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Net (ex-GST): {formatAud(currentShift.totalNetSales)}
          </span>
        </div>

        {/* Card Sales */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">EFTPOS & Card Settled</span>
          <div className="text-2xl font-black font-mono text-indigo-400">
            {formatAud(currentShift.cardSales)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Tyro / Smartpay / Square Terminal
          </span>
        </div>

        {/* Cash in Drawer */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Expected Cash in Drawer</span>
          <div className="text-2xl font-black font-mono text-amber-400">
            {formatAud(expectedCashInDrawer)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Float ({formatAud(currentShift.openingFloat)}) + Cash ({formatAud(currentShift.cashSales)})
          </span>
        </div>
      </div>

      {/* Detailed Financial Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Financial Ledger */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Financial Breakdown (AUD)
          </h3>

          <div className="divide-y divide-slate-800 text-xs">
            <div className="py-2 flex justify-between text-slate-300">
              <span>Gross Sales (Inc GST)</span>
              <span className="font-mono font-bold text-white">{formatAud(currentShift.totalGrossSales)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-400">
              <span>Less GST (10% ATO Inclusive)</span>
              <span className="font-mono text-sky-400">-{formatAud(currentShift.totalGst)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-300 font-semibold">
              <span>Net Sales (Ex-GST)</span>
              <span className="font-mono text-emerald-400">{formatAud(currentShift.totalNetSales)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-400">
              <span>Discounts & Concessions Applied</span>
              <span className="font-mono text-amber-400">-{formatAud(currentShift.totalDiscounts)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-400">
              <span>Australian Surcharges Collected (Weekend/Card)</span>
              <span className="font-mono text-indigo-400">+{formatAud(currentShift.totalSurcharges)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-400">
              <span>Total Staff Gratuities / Tips</span>
              <span className="font-mono text-rose-400">+{formatAud(currentShift.totalTips)}</span>
            </div>
          </div>
        </div>

        {/* Right: Payment Channels & Cash Variance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            Tender Channels & Drawer Balance
          </h3>

          <div className="divide-y divide-slate-800 text-xs">
            <div className="py-2 flex justify-between text-slate-300">
              <span>Cash Sales Tendered</span>
              <span className="font-mono font-bold text-white">{formatAud(currentShift.cashSales)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-300">
              <span>EFTPOS / Card Terminal Total</span>
              <span className="font-mono font-bold text-white">{formatAud(currentShift.cardSales)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-300">
              <span>Opening Cash Float</span>
              <span className="font-mono text-slate-400">{formatAud(currentShift.openingFloat)}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-sm font-bold bg-slate-950/60 px-3 rounded-xl border border-slate-800">
              <span>Total Cash Expected in Till:</span>
              <span className="font-mono text-amber-400">{formatAud(expectedCashInDrawer)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Z-Reports */}
      {shiftHistory.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            Closed Shift History (Z-Reports)
          </h3>

          <div className="divide-y divide-slate-800 text-xs">
            {shiftHistory.map((report, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">
                    Shift Closed: {formatAusDateTime(report.closedAt || '')}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Staff: {report.openedByStaffName} • Gross: {formatAud(report.totalGrossSales)} • GST: {formatAud(report.totalGst)}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {report.cashVariance !== undefined && (
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                        report.cashVariance === 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : report.cashVariance > 0
                          ? 'bg-sky-500/20 text-sky-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {report.cashVariance >= 0 ? `+${formatAud(report.cashVariance)}` : formatAud(report.cashVariance)}
                    </span>
                  )}

                  <button
                    onClick={() => setSelectedReportToPrint(report)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cash Up Closing Modal */}
      {isCashUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">End of Day Cash Up (Z-Report)</h2>
                <p className="text-xs text-slate-400">Reconcile cash drawer and finalize daily takings</p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Opening Float:</span>
                  <span className="font-mono text-white">{formatAud(currentShift.openingFloat)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cash Sales Today:</span>
                  <span className="font-mono text-white">+{formatAud(currentShift.cashSales)}</span>
                </div>
                <div className="flex justify-between text-amber-400 font-bold pt-1 border-t border-slate-800">
                  <span>Expected Till Total:</span>
                  <span className="font-mono">{formatAud(expectedCashInDrawer)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase">
                  Actual Counted Cash in Drawer ($ AUD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.50"
                    placeholder="Enter total counted cash"
                    value={closingCashInput}
                    onChange={e => setClosingCashInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-8 pr-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {closingCashInput !== '' && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    cashVariance === 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : cashVariance > 0
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  <span>Cash Drawer Variance:</span>
                  <span className="font-mono">
                    {cashVariance === 0 ? 'Exact Match ($0.00)' : cashVariance > 0 ? `Over by +${formatAud(cashVariance)}` : `Short by ${formatAud(cashVariance)}`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsCashUpModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                disabled={closingCashInput === ''}
                onClick={handleFinalizeZReport}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalize & Print Z-Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Float Modal */}
      {isFloatEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-white">
            <h3 className="text-base font-bold mb-4">Set Opening Cash Float</h3>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">
                $
              </span>
              <input
                type="number"
                value={openingFloatInput}
                onChange={e => setOpeningFloatInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 font-mono font-bold text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsFloatEditOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateFloat}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 rounded-xl text-xs font-bold text-white"
              >
                Save Float
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Z-Report / X-Report Preview Dialog */}
      {selectedReportToPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl relative text-white overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between no-print">
              <h3 className="font-bold text-sm">
                {selectedReportToPrint.type === 'Z-Report' ? 'End of Day Z-Report' : 'Mid-Day X-Report'}
              </h3>
              <button
                onClick={() => setSelectedReportToPrint(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-950/50 flex justify-center">
              <div
                ref={zReportRef}
                className="printable-receipt w-full max-w-[340px] bg-white text-slate-900 p-6 rounded-2xl shadow-xl font-mono text-xs leading-tight select-text"
              >
                <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-slate-300">
                  <h2 className="font-black text-base uppercase">{activeVenue.name}</h2>
                  <div className="font-bold">ABN: {formatAbn(activeVenue.abn)}</div>
                  <div className="font-black text-sm pt-2 uppercase tracking-widest">
                    *** {selectedReportToPrint.type} ***
                  </div>
                </div>

                <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
                  <div>Opened: {formatAusDateTime(selectedReportToPrint.openedAt)}</div>
                  {selectedReportToPrint.closedAt && (
                    <div>Closed: {formatAusDateTime(selectedReportToPrint.closedAt)}</div>
                  )}
                  <div>Operator: {selectedReportToPrint.openedByStaffName}</div>
                </div>

                <div className="py-3 border-b-2 border-dashed border-slate-300 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>GROSS SALES:</span>
                    <span>{formatAud(selectedReportToPrint.totalGrossSales)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>GST (10% ATO Inc):</span>
                    <span>{formatAud(selectedReportToPrint.totalGst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>NET SALES:</span>
                    <span>{formatAud(selectedReportToPrint.totalNetSales)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>SURCHARGES:</span>
                    <span>{formatAud(selectedReportToPrint.totalSurcharges)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>TIPS COLLECTED:</span>
                    <span>{formatAud(selectedReportToPrint.totalTips)}</span>
                  </div>
                </div>

                <div className="py-3 border-b-2 border-dashed border-slate-300 space-y-1 text-xs">
                  <div className="font-bold text-[10px] uppercase text-slate-600">Tender Summary:</div>
                  <div className="flex justify-between">
                    <span>Cash Sales:</span>
                    <span>{formatAud(selectedReportToPrint.cashSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Card / EFTPOS:</span>
                    <span>{formatAud(selectedReportToPrint.cardSales)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Opening Float:</span>
                    <span>{formatAud(selectedReportToPrint.openingFloat)}</span>
                  </div>
                  {selectedReportToPrint.closingCashCounted !== undefined && (
                    <>
                      <div className="flex justify-between font-bold pt-1 border-t border-slate-300">
                        <span>Counted Cash:</span>
                        <span>{formatAud(selectedReportToPrint.closingCashCounted)}</span>
                      </div>
                      <div className="flex justify-between font-black">
                        <span>Variance:</span>
                        <span>{formatAud(selectedReportToPrint.cashVariance || 0)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 text-center text-[10px] text-slate-600">
                  --- END OF FINANCIAL REPORT ---
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end space-x-2 no-print">
              <button
                onClick={() => setSelectedReportToPrint(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
