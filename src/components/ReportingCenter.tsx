import { useState } from 'react';
import { 
  Download, Sparkles, BarChart3, CalendarRange, ArrowLeft
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
    <div className="space-y-6 pb-24 animate-fade-in text-left font-sans select-none text-[#1F1F1F]" id="reporting-center-hub">
      
      {/* HEADER SECTION WITH MESH GRADIENT */}
      <div className="relative overflow-hidden rounded-[32px] p-1 border border-neutral-150/45 bg-white shadow-xs" id="reporting-mesh-wrapper">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14)_0%,_rgba(14,165,233,0)_75%)] pointer-events-none" />
        
        {/* Main Header greetings block */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4" id="reporting-navbar-panel">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.location.hash = 'dashboard'}
                className="p-1.5 hover:bg-neutral-100 rounded-full transition text-neutral-800 cursor-pointer flex items-center justify-center shrink-0"
                title="Return to home dashboard"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <h1 className="text-xl sm:text-2xl font-sans font-medium text-neutral-900 tracking-tight">
                Reporting Center
              </h1>
            </div>
            <p className="text-sm font-sans font-normal text-neutral-400 mt-1.5 pl-8">
              Streamlined summaries matching checkout registries with merchant cashflows.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap" id="reporting-actions-bar">
            <div className="flex items-center gap-2 bg-[#f0f9ff] border border-[#bae6fd]/60 text-[#0284c7] rounded-full px-4 py-2 text-xs font-semibold select-none cursor-pointer">
              <CalendarRange className="w-4 h-4 text-[#0284c7] stroke-[2]" />
              <span>Audits Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Switchboard */}
      <div className="bg-[#FCF5E8] rounded-[24px] p-6 border border-[#ECDCCB] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none animate-fade-in">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-[#B45309] shrink-0 stroke-[1.5]" />
          <h3 className="font-sans font-bold text-[#78350F] text-sm">Time Framework</h3>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#5F6368] font-sans">
          <button 
            type="button"
            onClick={() => setReportRange('daily')} 
            className={`px-4 py-2 rounded-full border transition cursor-pointer font-bold text-xs ${reportRange === 'daily' ? 'bg-[#1F1F1F] border-[#1F1F1F] text-white shadow-xs' : 'bg-white border-[#ECDCCB] text-[#78350F] hover:bg-[#FDFBF7]'}`}
          >
            Daily Compilation
          </button>
          <button 
            type="button"
            onClick={() => setReportRange('weekly')} 
            className={`px-4 py-2 rounded-full border transition cursor-pointer font-bold text-xs ${reportRange === 'weekly' ? 'bg-[#1F1F1F] border-[#1F1F1F] text-white shadow-xs' : 'bg-white border-[#ECDCCB] text-[#78350F] hover:bg-[#FDFBF7]'}`}
          >
            Weekly Compilation
          </button>
          <button 
            type="button"
            onClick={() => setReportRange('monthly')} 
            className={`px-4 py-2 rounded-full border transition cursor-pointer font-bold text-xs ${reportRange === 'monthly' ? 'bg-[#1F1F1F] border-[#1F1F1F] text-white shadow-xs' : 'bg-white border-[#ECDCCB] text-[#78350F] hover:bg-[#FDFBF7]'}`}
          >
            Monthly Compilation
          </button>
        </div>
      </div>

      {/* Visual Report Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Core Financial Revenue Audit */}
        <div className="bg-white border-2 border-black rounded-[24px] p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-3">
              <h4 className="font-sans font-bold text-[#1F1F1F] text-xs">Revenue & Leakages</h4>
              <span className="text-[10px] text-[#757575] font-mono">FR-01</span>
            </div>
            <p className="text-xs text-[#5F6368] leading-relaxed font-sans font-semibold">
              Compare cashier registers, mobile declarations, and bank transaction statements to log exact net discrepancy.
            </p>
          </div>
          <div className="space-y-3">
            <div className="border border-[#E3E3E3] rounded-xl p-3 bg-[#FCFAF7] flex justify-between font-mono text-[10px] font-semibold text-[#1F1F1F]">
              <span className="font-sans text-[#757575] font-normal">Status:</span>
              <span className="text-red-700 font-bold uppercase font-sans">Flagged Warning</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-sans">
              <button onClick={() => simulateDownload('PDF')} className="py-2 border border-[#E3E3E3] hover:border-[#1F1F1F] rounded-full text-[10px] font-bold text-[#1F1F1F] hover:bg-gray-50 cursor-pointer">PDF</button>
              <button onClick={() => simulateDownload('Excel')} className="py-2 border border-[#E3E3E3] hover:border-[#1F1F1F] rounded-full text-[10px] font-bold text-[#1F1F1F] hover:bg-gray-50 cursor-pointer">XLS</button>
              <button onClick={() => simulateDownload('CSV')} className="py-2 border border-[#E3E3E3] hover:border-[#1F1F1F] rounded-full text-[10px] font-bold text-[#1F1F1F] hover:bg-gray-50 cursor-pointer">CSV</button>
            </div>
          </div>
        </div>

        {/* Inventory Devaluation report */}
        <div className="bg-sky-50 border border-sky-200 rounded-[24px] p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-sky-200 pb-3">
              <h4 className="font-sans font-bold text-[#1e40af] text-xs">Depletion Dynamics</h4>
              <span className="text-[10px] text-[#1e40af] font-mono">INV-82</span>
            </div>
            <p className="text-xs text-[#1e40af] leading-relaxed font-sans font-semibold">
              Outlines stock level predictions and automatically indexes out-of-stock intervals to prevent gaps.
            </p>
          </div>
          <div className="space-y-3">
            <div className="border border-sky-200 rounded-xl p-3 bg-white flex justify-between font-mono text-[10px] font-semibold text-[#1e40af]">
              <span className="font-sans text-[#1e40af]/80 font-normal">Accuracy Rate:</span>
              <span className="text-sky-600 font-bold uppercase font-sans">96% Verified</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-sans">
              <button onClick={() => simulateDownload('PDF')} className="py-2 border border-sky-200 hover:border-[#1e40af] bg-white rounded-full text-[10px] font-bold text-[#1e40af] hover:bg-sky-50/50 cursor-pointer">PDF</button>
              <button onClick={() => simulateDownload('Excel')} className="py-2 border border-sky-200 hover:border-[#1e40af] bg-white rounded-full text-[10px] font-bold text-[#1e40af] hover:bg-sky-50/50 cursor-pointer">XLS</button>
              <button onClick={() => simulateDownload('CSV')} className="py-2 border border-sky-200 hover:border-[#1e40af] bg-white rounded-full text-[10px] font-bold text-[#1e40af] hover:bg-sky-50/50 cursor-pointer">CSV</button>
            </div>
          </div>
        </div>

        {/* Customer retention & churn indicators */}
        <div className="bg-sky-50 border border-sky-200 rounded-[24px] p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-sky-200 pb-3">
              <h4 className="font-sans font-bold text-[#1e40af] text-xs">Customer Loyalty rates</h4>
              <span className="text-[10px] text-[#1e40af] font-mono">LRT-11</span>
            </div>
            <p className="text-xs text-[#1e40af] leading-relaxed font-sans font-semibold">
              Assess customer return cycles, points allocations, and response stats on promotional marketing.
            </p>
          </div>
          <div className="space-y-3">
            <div className="border border-sky-200 rounded-xl p-3 bg-white flex justify-between font-mono text-[10px] font-semibold text-[#1e40af]">
              <span className="font-sans text-[#1e40af] font-normal font-medium">Overdue accounts:</span>
              <span className="text-sky-600 font-bold uppercase font-sans">14 Active Partners</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-sans">
              <button onClick={() => simulateDownload('PDF')} className="py-2 border border-sky-200 hover:border-[#1e40af] bg-white rounded-full text-[10px] font-bold text-[#1e40af] hover:bg-sky-50/50 cursor-pointer">PDF</button>
              <button onClick={() => simulateDownload('Excel')} className="py-2 border border-sky-200 hover:border-[#1e40af] bg-white rounded-full text-[10px] font-bold text-[#1e40af] hover:bg-sky-50/50 cursor-pointer">XLS</button>
              <button onClick={() => simulateDownload('CSV')} className="py-2 border border-sky-200 hover:border-[#1e40af] bg-white rounded-full text-[10px] font-bold text-[#1e40af] hover:bg-sky-50/50 cursor-pointer">CSV</button>
            </div>
          </div>
        </div>

      </div>

      {/* Advanced AI Ground-Truth Report Preview Panel */}
      <div className="bg-sky-50 border border-sky-200 p-6 rounded-[24px] space-y-4 shadow-sm" id="ai-groundtruth-reporter animate-fade-in">
        <div className="flex items-center gap-2 text-[#1e40af]">
          <EenvoqIcon className="w-5 h-5 text-[#1e40af] stroke-[1.5] animate-pulse" />
          <h3 className="font-sans font-bold text-sm">Automated eenvoq Audit Report</h3>
        </div>

        <div className="bg-[#FCFAF7]/80 p-5 rounded-2xl border border-sky-200 text-xs space-y-3 text-[#1e40af] leading-relaxed font-sans shadow-none">
          <p className="font-extrabold text-sm">Summary Findings:</p>
          <p className="font-semibold text-xs leading-relaxed text-[#1e40af]">
            Operating indices map an unrecorded sales leakage rate representing 5.8% of daily transactions. Reconciliations show discrepancy is centralized on Cash Till Register #1, primarily between 3:00 PM and 5:00 PM, where void overrides were executed without matching receipt security signatures. Overall ledger health is stable, with credit limits locked on Baba Sadiq preventing further exposure.
          </p>
          <p className="text-sky-600 font-bold pt-1 text-xs">
            ✓ Corrective acts applied: Wholesale account override locks engaged (Baba Sadiq). Custom cashier audits logging overrides active.
          </p>
        </div>
      </div>

    </div>
  );
}
