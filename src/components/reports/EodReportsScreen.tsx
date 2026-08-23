import React, { useState, useRef } from 'react';
import {
  BarChart3,
  DollarSign,
  Printer,
  Lock,
  Clock,
  Coins,
  X
} from 'lucide-react';
import { useVenue } from '../../context/VenueContext';
import { usePos } from '../../context/PosContext';
import { formatAbn, formatAud, formatAusDateTime } from '../../utils/formatters';
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
    if (isNaN(countedCash) || closingCashInput === '') return;
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
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.25rem)] bg-slate-100 p-4 lg:p-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 mb-0.5 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-slate-700" />
            <span>Shift Reconciliation & Z-Report</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">End-of-Day (Z-Report) & Cash Up</h2>
          <p className="text-xs text-slate-500">
            Shift opened at {formatAusDateTime(currentShift.openedAt)} by {currentShift.openedByStaffName}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFloatEditOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 transition"
          >
            Adjust Float ({formatAud(currentShift.openingFloat)})
          </button>

          <button
            onClick={() => setSelectedReportToPrint(currentShift)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Mid-Shift (X-Report)</span>
          </button>

          <button
            onClick={() => setIsCashUpModalOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-xs transition"
          >
            <Lock className="w-4 h-4" />
            <span>Close Shift (Z-Report)</span>
          </button>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {/* Gross Sales */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 block mb-1 font-medium">Gross Sales (Inc GST)</span>
          <div className="text-2xl font-black font-mono text-slate-900">
            {formatAud(currentShift.totalGrossSales)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {currentShift.ordersCount} settled orders
          </span>
        </div>

        {/* GST 10% */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 block mb-1 font-medium">ATO GST (1/11th)</span>
          <div className="text-2xl font-black font-mono text-slate-900">
            {formatAud(currentShift.totalGst)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Net (ex-GST): {formatAud(currentShift.totalNetSales)}
          </span>
        </div>

        {/* Card Sales */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 block mb-1 font-medium">EFTPOS & Cards</span>
          <div className="text-2xl font-black font-mono text-slate-900">
            {formatAud(currentShift.cardSales)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Integrated Terminals
          </span>
        </div>

        {/* Cash in Drawer */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 block mb-1 font-medium">Expected Cash in Till</span>
          <div className="text-2xl font-black font-mono text-slate-900">
            {formatAud(expectedCashInDrawer)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Float ({formatAud(currentShift.openingFloat)}) + Cash ({formatAud(currentShift.cashSales)})
          </span>
        </div>
      </div>

      {/* Financial Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Left: Financial Ledger */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-slate-600" />
            Financial Breakdown (AUD)
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex justify-between text-slate-700">
              <span>Gross Sales (Inc GST)</span>
              <span className="font-mono font-bold text-slate-900">{formatAud(currentShift.totalGrossSales)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-600">
              <span>Less GST (10% ATO Inclusive)</span>
              <span className="font-mono">-{formatAud(currentShift.totalGst)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-800 font-bold">
              <span>Net Sales (Ex-GST)</span>
              <span className="font-mono text-emerald-700">{formatAud(currentShift.totalNetSales)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-600">
              <span>Discounts & Concessions Applied</span>
              <span className="font-mono">-{formatAud(currentShift.totalDiscounts)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-600">
              <span>Surcharges Collected (Weekend/Card)</span>
              <span className="font-mono">+{formatAud(currentShift.totalSurcharges)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-600">
              <span>Staff Tips / Gratuity</span>
              <span className="font-mono">+{formatAud(currentShift.totalTips)}</span>
            </div>
          </div>
        </div>

        {/* Right: Payment Channels & Cash Variance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-slate-600" />
            Tender Channels & Drawer Balance
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex justify-between text-slate-700">
              <span>Cash Sales Tendered</span>
              <span className="font-mono font-bold text-slate-900">{formatAud(currentShift.cashSales)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-700">
              <span>EFTPOS / Card Terminal Total</span>
              <span className="font-mono font-bold text-slate-900">{formatAud(currentShift.cardSales)}</span>
            </div>
            <div className="py-2 flex justify-between text-slate-700">
              <span>Opening Cash Float</span>
              <span className="font-mono">{formatAud(currentShift.openingFloat)}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-sm font-bold bg-slate-50 px-3 rounded-lg border border-slate-200 mt-2">
              <span>Total Cash Expected in Till:</span>
              <span className="font-mono text-slate-900">{formatAud(expectedCashInDrawer)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Z-Reports */}
      {shiftHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-600" />
            Closed Shift History (Z-Reports)
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {shiftHistory.map((report, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">
                    Shift Closed: {formatAusDateTime(report.closedAt || '')}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Staff: {report.openedByStaffName} • Gross: {formatAud(report.totalGrossSales)} • GST: {formatAud(report.totalGst)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {report.cashVariance !== undefined && (
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        report.cashVariance === 0
                          ? 'bg-slate-100 text-slate-700'
                          : report.cashVariance > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {report.cashVariance === 0
                        ? 'Balanced'
                        : report.cashVariance > 0
                        ? `Over +${formatAud(report.cashVariance)}`
                        : `Short -${formatAud(Math.abs(report.cashVariance))}`}
                    </span>
                  )}

                  <button
                    onClick={() => setSelectedReportToPrint(report)}
                    className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adjust Float Modal */}
      {isFloatEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setIsFloatEditOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-3">Adjust Opening Cash Float</h3>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 block mb-1">Float Amount ($ AUD)</label>
              <input
                type="number"
                value={openingFloatInput}
                onChange={e => setOpeningFloatInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsFloatEditOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateFloat}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Save Float
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash-Up & Close Shift Modal */}
      {isCashUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setIsCashUpModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Count Cash & Close Shift (Z-Report)</h3>
            <p className="text-xs text-slate-500 mb-4">Reconcile cash drawer and finalize daily register totals.</p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 mb-4 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Expected Cash (Float + Cash Sales):</span>
                <span className="font-mono font-bold text-slate-900">{formatAud(expectedCashInDrawer)}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Actual Physical Cash Counted in Till ($ AUD)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={closingCashInput}
                onChange={e => setClosingCashInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono font-bold text-lg text-slate-900 focus:outline-none"
              />
            </div>

            {closingCashInput !== '' && (
              <div
                className={`p-3 rounded-xl border mb-4 text-xs flex justify-between items-center ${
                  cashVariance === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : cashVariance > 0
                    ? 'bg-sky-50 border-sky-200 text-sky-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                }`}
              >
                <span>Till Variance:</span>
                <span className="font-mono font-bold">
                  {cashVariance === 0 ? 'Exact Balance ($0.00)' : cashVariance > 0 ? `Over +${formatAud(cashVariance)}` : `Short -${formatAud(Math.abs(cashVariance))}`}
                </span>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsCashUpModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalizeZReport}
                disabled={closingCashInput === ''}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Finalize Z-Report & Close Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Report Modal */}
      {selectedReportToPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md max-h-[95vh] flex flex-col shadow-2xl relative text-slate-900 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
              <h3 className="font-bold text-xs text-slate-900">
                Official {selectedReportToPrint.type} Printout
              </h3>
              <button
                onClick={() => setSelectedReportToPrint(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-100 flex justify-center">
              <div
                ref={zReportRef}
                className="printable-receipt w-full max-w-[320px] bg-white text-slate-900 p-5 rounded-xl shadow-xs border border-slate-200 font-mono text-xs leading-tight"
              >
                <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-0.5">
                  <h2 className="text-sm font-black tracking-wider uppercase">
                    {activeVenue.name}
                  </h2>
                  <div className="text-[10px] text-slate-600 font-bold">
                    ABN: {formatAbn(activeVenue.abn)}
                  </div>
                  <div className="pt-1.5 text-xs font-black tracking-widest uppercase border-t border-slate-200 mt-1.5">
                    *** {selectedReportToPrint.type.toUpperCase()} DOCKET ***
                  </div>
                </div>

                <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Opened: {formatAusDateTime(selectedReportToPrint.openedAt)}</span>
                  </div>
                  {selectedReportToPrint.closedAt && (
                    <div className="flex justify-between">
                      <span>Closed: {formatAusDateTime(selectedReportToPrint.closedAt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Cashier: {selectedReportToPrint.openedByStaffName}</span>
                  </div>
                </div>

                <div className="py-2 border-b border-dashed border-slate-300 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>GROSS SALES (Inc GST)</span>
                    <span>{formatAud(selectedReportToPrint.totalGrossSales)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>LESS GST (10% ATO Inclusive)</span>
                    <span>-{formatAud(selectedReportToPrint.totalGst)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-0.5">
                    <span>NET SALES (Ex-GST)</span>
                    <span>{formatAud(selectedReportToPrint.totalNetSales)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CARD SETTLED</span>
                    <span>{formatAud(selectedReportToPrint.cardSales)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CASH SALES</span>
                    <span>{formatAud(selectedReportToPrint.cashSales)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>OPENING FLOAT</span>
                    <span>{formatAud(selectedReportToPrint.openingFloat)}</span>
                  </div>
                  {selectedReportToPrint.closingCashCounted !== undefined && (
                    <div className="flex justify-between font-bold border-t border-slate-200 pt-0.5">
                      <span>CLOSING CASH COUNTED</span>
                      <span>{formatAud(selectedReportToPrint.closingCashCounted)}</span>
                    </div>
                  )}
                  {selectedReportToPrint.cashVariance !== undefined && (
                    <div className="flex justify-between font-bold">
                      <span>DRAWER VARIANCE</span>
                      <span>{formatAud(selectedReportToPrint.cashVariance)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 text-center text-[10px] text-slate-500">
                  <p>*** END OF FINANCIAL DOCKET ***</p>
                  <p className="text-[9px]">Generated by AusPOS • ATO Approved</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2 no-print">
              <button
                onClick={() => setSelectedReportToPrint(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Docket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
