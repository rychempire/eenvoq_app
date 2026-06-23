import { useState } from 'react';
import { 
  Download, BarChart3, CalendarRange, ArrowLeft, Info
} from 'lucide-react';
import EenvoqIcon from './EenvoqIcon';

interface ReportingCenterProps {
  showConfirm?: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
}

export default function ReportingCenter({ showConfirm }: ReportingCenterProps) {
  const [reportRange, setReportRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const simulateDownload = (format: string) => {
    setDownloadingFormat(format);
    setTimeout(() => {
      setDownloadingFormat(null);
      const title = "Document Export Complete";
      const message = `[Report Export Simulation]: Compiled financial audit logs.\n\nDispatched completed ${format} document of "${reportRange.toUpperCase()}_eenvoq_report.doc" to downloads folder.`;
      
      if (showConfirm) {
        showConfirm(title, message, () => {}, "Great", "Close");
      } else {
        alert(message);
      }
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in text-left font-sans select-none text-[#393a3d]" id="reporting-center-hub">
      
      {/* HEADER SECTION IN QUICKBOOKS STYLE */}
      <div className="bg-[#f4f5f8] border border-[#d4d7dc] rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none shrink-0" id="reporting-navbar-panel">
        <div className="text-left flex items-center gap-3">
          <button 
            onClick={() => window.location.hash = 'dashboard'}
            className="p-1.5 hover:bg-[#d4d7dc] rounded transition text-[#2c3e50] cursor-pointer flex items-center justify-center shrink-0"
            title="Return to home dashboard"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-neutral-900 tracking-tight font-sans">
              Company Reports Center
            </h1>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Review real-time bookkeeping metrics, ledger differences, and automatic AI auditing statements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap" id="reporting-actions-bar">
          <div className="flex items-center gap-1 bg-[#e9f5e6] border border-[#2ca01c]/25 text-[#2ca01c] rounded px-3 py-1.5 text-[11px] font-bold select-none cursor-pointer">
            <CalendarRange className="w-3.5 h-3.5 text-[#2ca01c] stroke-[2]" />
            <span>AI Automated Verification Active</span>
          </div>
        </div>
      </div>

      {/* Control Switchboard (Timeframe Selector) */}
      <div className="bg-[#f4f5f8] rounded border border-[#d4d7dc] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none animate-fade-in">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#2ca01c] shrink-0 stroke-[2]" />
          <h3 className="font-sans font-bold text-slate-800 text-xs">Report Compilation Interval</h3>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700 font-sans">
          <button 
            type="button"
            onClick={() => setReportRange('daily')} 
            className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border ${reportRange === 'daily' ? 'bg-[#2ca01c] border-[#2ca01c] text-white' : 'bg-white border-[#d4d7dc] text-[#5f6368] hover:bg-[#f4f5f8]'}`}
          >
            Daily Compilation
          </button>
          <button 
            type="button"
            onClick={() => setReportRange('weekly')} 
            className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border ${reportRange === 'weekly' ? 'bg-[#2ca01c] border-[#2ca01c] text-white' : 'bg-white border-[#d4d7dc] text-[#5f6368] hover:bg-[#f4f5f8]'}`}
          >
            Weekly Compilation
          </button>
          <button 
            type="button"
            onClick={() => setReportRange('monthly')} 
            className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border ${reportRange === 'monthly' ? 'bg-[#2ca01c] border-[#2ca01c] text-white' : 'bg-white border-[#d4d7dc] text-[#5f6368] hover:bg-[#f4f5f8]'}`}
          >
            Monthly Compilation
          </button>
        </div>
      </div>

      {/* Visual Report Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Core Financial Revenue Audit */}
        <div className="bg-white border border-[#d4d7dc] rounded p-5 space-y-4 flex flex-col justify-between shadow-none">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#d4d7dc] pb-2">
              <h4 className="font-sans font-bold text-[#111111] text-xs">Revenue &amp; Discrepancy Matrix</h4>
              <span className="text-[10px] text-gray-550 font-mono font-bold">FR-01</span>
            </div>
            <p className="text-[11px] text-[#5f6368] leading-normal font-sans font-medium">
              Compare hand-counted till drawers, mobile OPay declarations, and direct bank transfers against system bills to detect leakages.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <div className="border border-[#d4d7dc] rounded p-2.5 bg-[#fdf2f2] flex justify-between font-mono text-[10px] font-semibold text-[#9b1c1c]">
              <span className="font-sans text-stone-700 font-bold">Status:</span>
              <span className="font-bold uppercase font-sans">Flagged Warning</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center font-sans">
              <button onClick={() => simulateDownload('PDF')} className="py-1.5 border border-[#d4d7dc] hover:border-[#2ca01c] rounded text-[10px] font-bold text-[#393a3d] hover:bg-[#f4f5f8] cursor-pointer">PDF</button>
              <button onClick={() => simulateDownload('Excel')} className="py-1.5 border border-[#d4d7dc] hover:border-[#2ca01c] rounded text-[10px] font-bold text-[#393a3d] hover:bg-[#f4f5f8] cursor-pointer">XLS</button>
              <button onClick={() => simulateDownload('CSV')} className="py-1.5 border border-[#d4d7dc] hover:border-[#2ca01c] rounded text-[10px] font-bold text-[#393a3d] hover:bg-[#f4f5f8] cursor-pointer">CSV</button>
            </div>
          </div>
        </div>

        {/* Inventory Devaluation report */}
        <div className="bg-white border border-[#d4d7dc] rounded p-5 space-y-4 flex flex-col justify-between shadow-none">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#d4d7dc] pb-2">
              <h4 className="font-sans font-bold text-[#111111] text-xs">Asset Depletion Dynamics</h4>
              <span className="text-[10px] text-gray-550 font-mono font-bold">INV-82</span>
            </div>
            <p className="text-[11px] text-[#5f6368] leading-normal font-sans font-medium">
              Summarizes physical stock speed, automatically projects depletion milestones, and flags products nearing safe run-out limits.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <div className="border border-[#d4d7dc] rounded p-2.5 bg-[#e9f5e6] flex justify-between font-mono text-[10px] font-semibold text-[#2ca01c]">
              <span className="font-sans text-stone-700 font-bold">Confidence:</span>
              <span className="font-bold uppercase font-sans">96% Verified</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center font-sans">
              <button onClick={() => simulateDownload('PDF')} className="py-1.5 border border-[#d4d7dc] hover:border-[#2ca01c] rounded text-[10px] font-bold text-[#393a3d] hover:bg-[#f4f5f8] cursor-pointer">PDF</button>
              <button onClick={() => simulateDownload('Excel')} className="py-1.5 border border-[#d4d7dc] hover:border-[#2ca01c] rounded text-[10px] font-bold text-[#393a3d] hover:bg-[#f4f5f8] cursor-pointer">XLS</button>
              <button onClick={() => simulateDownload('CSV')} className="py-1.5 border border-[#d4d7dc] hover:border-[#2ca01c] rounded text-[10px] font-bold text-[#393a3d] hover:bg-[#f4f5f8] cursor-pointer">CSV</button>
            </div>
          </div>
        </div>

        {/* Customer retention & churn indicators */}
        <div className="bg-white border border-[#d4d7dc] rounded p-5 space-y-4 flex flex-col justify-between shadow-none">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#d4d7dc] pb-2">
              <h4 className="font-sans font-bold text-[#111111] text-xs">Customer Loyalty &amp; Ageing</h4>
              <span className="text-[10px] text-gray-550 font-mono font-bold">LRT-11</span>
            </div>
            <p className="text-[11px] text-[#5f6368] leading-normal font-sans font-medium">
              Tracks merchant login intervals, customer credit score updates, open balances, and rewards dispatch indicators.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <div className="border border-[#d4d7dc] rounded p-2.5 bg-[#f4f5f8] flex justify-between font-mono text-[10px] font-semibold text-slate-800">
              <span className="font-sans text-stone-700 font-bold">Ledgers:</span>
              <span className="font-bold uppercase font-sans text-[#2ca01c]">14 Active Members</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center font-sans">
              <button onClick={() => simulateDownload('PDF')} className="py-1.5 border border-[#d4d7dc] hover:border-[#2ca01c] rounded text-[10px] font-bold text-[#393a3d] hover:bg-[#f4f5f8] cursor-pointer">PDF</button>
              <button onClick={() => simulateDownload('Excel')} className="py-1.5 border border-[#d4d7dc] hover:border-[#2ca01c] rounded text-[10px] font-bold text-[#393a3d] hover:bg-[#f4f5f8] cursor-pointer">XLS</button>
              <button onClick={() => simulateDownload('CSV')} className="py-1.5 border border-[#d4d7dc] hover:border-[#2ca01c] rounded text-[10px] font-bold text-[#393a3d] hover:bg-[#f4f5f8] cursor-pointer">CSV</button>
            </div>
          </div>
        </div>

      </div>

      {/* Advanced AI Ground-Truth Report Preview Panel */}
      <div className="bg-white border border-[#d4d7dc] p-5 rounded space-y-3 shadow-none animate-fade-in" id="ai-groundtruth-reporter">
        <div className="flex items-center gap-2 text-slate-800">
          <span className="w-5 h-5 rounded-sm bg-[#1e2a38] flex items-center justify-center font-bold text-white text-[10px] shrink-0">AI</span>
          <h3 className="font-sans font-bold text-xs">Automated Eenvoq Reconciliation Audit Statement</h3>
        </div>

        <div className="bg-[#f4f5f8] p-4 rounded border border-[#d4d7dc] text-xs space-y-2 text-[#393a3d] leading-relaxed font-sans shadow-none">
          <p className="font-bold text-xs text-[#111111]">Summary Findings:</p>
          <p className="font-medium text-[11px] leading-normal text-slate-700">
            Operating indices map an unrecorded sales leakage rate representing 5.8% of daily transactions. Reconciliations show discrepancy is centralized on Cash Till Register #1, primarily between 3:00 PM and 5:00 PM, where void overrides were executed without matching receipt security signatures. Overall ledger health is stable, with credit limits locked on Baba Sadiq preventing further exposure.
          </p>
          <div className="h-px bg-[#d4d7dc] my-2" />
          <p className="text-[#2ca01c] font-bold text-[11px]">
            &bull; Corrective actions applied: Wholesale account override locks engaged (Baba Sadiq). Custom cashier audits logging overrides active.
          </p>
        </div>
      </div>

    </div>
  );
}
