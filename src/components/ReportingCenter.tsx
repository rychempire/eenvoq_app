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
    <div className="space-y-4 pb-12 animate-fade-in text-left font-sans select-none text-zinc-300 w-full" id="reporting-center-hub">
      
      {/* HEADER SECTION - SAME AS HOME DASHBOARD STYLE */}
      <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-none" id="reporting-header-nav">
        {/* Left Side: Store Identity & QuickBooks logo */}
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded bg-[#db2777] flex items-center justify-center text-white font-bold text-lg shadow-none shrink-0 select-none lowercase font-sans">
            ev
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md font-sans">
                Accounting Reports Center
              </h2>
              <span className="bg-pink-950/40 text-[#db2777] text-[9px] font-bold px-2 py-0.5 rounded border border-[#db2777]/35 uppercase tracking-widest shrink-0 font-mono">
                Asset Sentry
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Review bookkeeping metrics, ledger differences, and automatic AI auditing statements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap" id="reporting-actions-bar">
          <div className="flex items-center gap-1 bg-pink-950/45 border border-[#db2777]/30 text-[#db2777] rounded px-3 py-1.5 text-[11px] font-bold select-none cursor-pointer">
            <CalendarRange className="w-3.5 h-3.5 text-[#db2777] stroke-[2]" />
            <span>AI Automated Verification Active</span>
          </div>
        </div>
      </div>

      {/* Control Switchboard (Timeframe Selector) */}
      <div className="bg-[#0e0e11] rounded-lg border border-[#27272a] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none animate-fade-in">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#db2777] shrink-0 stroke-[2]" />
          <h3 className="font-sans font-bold text-white text-xs">Report Compilation Interval</h3>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold text-zinc-300 font-sans">
          <button 
            type="button"
            onClick={() => setReportRange('daily')} 
            className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border ${reportRange === 'daily' ? 'bg-[#db2777] border-[#db2777] text-white' : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:bg-zinc-800/40'}`}
          >
            Daily Compilation
          </button>
          <button 
            type="button"
            onClick={() => setReportRange('weekly')} 
            className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border ${reportRange === 'weekly' ? 'bg-[#db2777] border-[#db2777] text-white' : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:bg-zinc-800/40'}`}
          >
            Weekly Compilation
          </button>
          <button 
            type="button"
            onClick={() => setReportRange('monthly')} 
            className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer border ${reportRange === 'monthly' ? 'bg-[#db2777] border-[#db2777] text-white' : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:bg-zinc-800/40'}`}
          >
            Monthly Compilation
          </button>
        </div>
      </div>

      {/* Visual Report Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Core Financial Revenue Audit */}
        <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-5 space-y-4 flex flex-col justify-between shadow-none">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <h4 className="font-sans font-bold text-white text-xs">Revenue &amp; Discrepancy Matrix</h4>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">FR-01</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal font-sans font-medium">
              Compare hand-counted till drawers, mobile OPay declarations, and direct bank transfers against system bills to detect leakages.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <div className="border border-red-900/40 rounded p-2.5 bg-red-950/30 flex justify-between font-mono text-[10px] font-semibold text-rose-350">
              <span className="font-sans text-zinc-400 font-bold">Status:</span>
              <span className="font-bold uppercase font-sans">Flagged Warning</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center font-sans">
              <button onClick={() => simulateDownload('PDF')} className="py-1.5 border border-[#27272a] hover:border-[#db2777] rounded text-[10px] font-bold text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">PDF</button>
              <button onClick={() => simulateDownload('Excel')} className="py-1.5 border border-[#27272a] hover:border-[#db2777] rounded text-[10px] font-bold text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">XLS</button>
              <button onClick={() => simulateDownload('CSV')} className="py-1.5 border border-[#27272a] hover:border-[#db2777] rounded text-[10px] font-bold text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">CSV</button>
            </div>
          </div>
        </div>

        {/* Inventory Devaluation report */}
        <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-5 space-y-4 flex flex-col justify-between shadow-none">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <h4 className="font-sans font-bold text-white text-xs">Asset Depletion Dynamics</h4>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">INV-82</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal font-sans font-medium">
              Summarizes physical stock speed, automatically projects depletion milestones, and flags products nearing safe run-out limits.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <div className="border border-[#27272a] rounded p-2.5 bg-pink-950/20 flex justify-between font-mono text-[10px] font-semibold text-[#db2777]">
              <span className="font-sans text-zinc-400 font-bold">Confidence:</span>
              <span className="font-bold uppercase font-sans">96% Verified</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center font-sans">
              <button onClick={() => simulateDownload('PDF')} className="py-1.5 border border-[#27272a] hover:border-[#db2777] rounded text-[10px] font-bold text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">PDF</button>
              <button onClick={() => simulateDownload('Excel')} className="py-1.5 border border-[#27272a] hover:border-[#db2777] rounded text-[10px] font-bold text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">XLS</button>
              <button onClick={() => simulateDownload('CSV')} className="py-1.5 border border-[#27272a] hover:border-[#db2777] rounded text-[10px] font-bold text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">CSV</button>
            </div>
          </div>
        </div>

        {/* Customer retention & churn indicators */}
        <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-5 space-y-4 flex flex-col justify-between shadow-none">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <h4 className="font-sans font-bold text-white text-xs">Customer Loyalty &amp; Ageing</h4>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">LRT-11</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal font-sans font-medium">
              Tracks merchant login intervals, customer credit score updates, open balances, and rewards dispatch indicators.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <div className="border border-[#27272a] rounded p-2.5 bg-zinc-900 flex justify-between font-mono text-[10px] font-semibold text-zinc-200">
              <span className="font-sans text-zinc-400 font-bold">Ledgers:</span>
              <span className="font-bold uppercase font-sans text-[#db2777]">14 Active Members</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center font-sans">
              <button onClick={() => simulateDownload('PDF')} className="py-1.5 border border-[#27272a] hover:border-[#db2777] rounded text-[10px] font-bold text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">PDF</button>
              <button onClick={() => simulateDownload('Excel')} className="py-1.5 border border-[#27272a] hover:border-[#db2777] rounded text-[10px] font-bold text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">XLS</button>
              <button onClick={() => simulateDownload('CSV')} className="py-1.5 border border-[#27272a] hover:border-[#db2777] rounded text-[10px] font-bold text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">CSV</button>
            </div>
          </div>
        </div>

      </div>

      {/* Advanced AI Ground-Truth Report Preview Panel */}
      <div className="bg-[#0e0e11] border border-[#27272a] p-5 rounded-lg space-y-3 shadow-none animate-fade-in" id="ai-groundtruth-reporter">
        <div className="flex items-center gap-2 text-white">
          <span className="w-5 h-5 rounded bg-[#db2777] flex items-center justify-center font-bold text-white text-[10px] shrink-0">AI</span>
          <h3 className="font-sans font-bold text-xs">Automated Eenvoq Reconciliation Audit Statement</h3>
        </div>

        <div className="bg-[#18181b] p-4 rounded-lg border border-[#27272a] text-xs space-y-2 text-zinc-300 leading-relaxed font-sans shadow-none">
          <p className="font-bold text-xs text-white">Summary Findings:</p>
          <p className="font-medium text-[11px] leading-normal text-zinc-400">
            Operating indices map an unrecorded sales leakage rate representing 5.8% of daily transactions. Reconciliations show discrepancy is centralized on Cash Till Register #1, primarily between 3:00 PM and 5:00 PM, where void overrides were executed without matching receipt security signatures. Overall ledger health is stable, with credit limits locked on Baba Sadiq preventing further exposure.
          </p>
          <div className="h-px bg-[#27272a] my-2" />
          <p className="text-[#db2777] font-bold text-[11px]">
            &bull; Corrective actions applied: Wholesale account override locks engaged (Baba Sadiq). Custom cashier audits logging overrides active.
          </p>
        </div>
      </div>

    </div>
  );
}
