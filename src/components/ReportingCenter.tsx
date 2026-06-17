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
    <div className="space-y-8 animate-fade-in" id="reporting-center-hub">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none animate-fade-in">
        <div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.hash = 'dashboard'}
              className="p-1 px-1.5 hover:bg-gray-100 rounded-full transition text-[#1F1F1F] cursor-pointer flex items-center justify-center shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
            </button>
            <h1 className="text-[22px] font-sans font-semibold text-[#1F1F1F] tracking-tight">Reporting Center</h1>
          </div>
          <p className="text-xs text-[#757575] font-normal mt-1 font-sans ml-11">Streamlined summaries matching checkout registries with merchant cashflows.</p>
        </div>

        <div className="flex items-center gap-2 bg-[#E6F4EA] border border-[#CCD7CE] text-[#137333] rounded-full px-5 py-2.5 text-xs font-bold self-start sm:self-auto select-none cursor-pointer">
          <CalendarRange className="w-5 h-5 text-[#137333] stroke-[1.5]" />
          <span>Audits Synced</span>
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
            <div className="border border-[#E3E3E3] rounded-xl p-3 bg-[#FAF9F5] flex justify-between font-mono text-[10px] font-semibold text-[#1F1F1F]">
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
        <div className="bg-[#E6F4EA] border border-[#CCD7CE] rounded-[24px] p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#CCD7CE] pb-3">
              <h4 className="font-sans font-bold text-[#137333] text-xs">Depletion Dynamics</h4>
              <span className="text-[10px] text-[#137333] font-mono">INV-82</span>
            </div>
            <p className="text-xs text-[#137333] leading-relaxed font-sans font-semibold">
              Outlines stock level predictions and automatically indexes out-of-stock intervals to prevent gaps.
            </p>
          </div>
          <div className="space-y-3">
            <div className="border border-[#CCD7CE] rounded-xl p-3 bg-white flex justify-between font-mono text-[10px] font-semibold text-[#137333]">
              <span className="font-sans text-[#137333]/80 font-normal">Accuracy Rate:</span>
              <span className="text-green-700 font-bold uppercase font-sans">96% Verified</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-sans">
              <button onClick={() => simulateDownload('PDF')} className="py-2 border border-[#CCD7CE] hover:border-[#137333] bg-white rounded-full text-[10px] font-bold text-[#137333] hover:bg-gray-50 cursor-pointer">PDF</button>
              <button onClick={() => simulateDownload('Excel')} className="py-2 border border-[#CCD7CE] hover:border-[#137333] bg-white rounded-full text-[10px] font-bold text-[#137333] hover:bg-gray-50 cursor-pointer">XLS</button>
              <button onClick={() => simulateDownload('CSV')} className="py-2 border border-[#CCD7CE] hover:border-[#137333] bg-white rounded-full text-[10px] font-bold text-[#137333] hover:bg-gray-50 cursor-pointer">CSV</button>
            </div>
          </div>
        </div>

        {/* Customer retention & churn indicators */}
        <div className="bg-[#E6F4EA] border border-[#CCD7CE] rounded-[24px] p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#CCD7CE] pb-3">
              <h4 className="font-sans font-bold text-[#137333] text-xs">Customer Loyalty rates</h4>
              <span className="text-[10px] text-[#137333] font-mono">LRT-11</span>
            </div>
            <p className="text-xs text-[#137333] leading-relaxed font-sans font-semibold">
              Assess customer return cycles, points allocations, and response stats on promotional marketing.
            </p>
          </div>
          <div className="space-y-3">
            <div className="border border-[#CCD7CE] rounded-xl p-3 bg-white flex justify-between font-mono text-[10px] font-semibold text-[#137333]">
              <span className="font-sans text-[#137333] font-normal font-medium">Overdue accounts:</span>
              <span className="text-green-700 font-bold uppercase font-sans">14 Active Partners</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-sans">
              <button onClick={() => simulateDownload('PDF')} className="py-2 border border-[#CCD7CE] hover:border-[#137333] bg-white rounded-full text-[10px] font-bold text-[#137333] hover:bg-gray-50 cursor-pointer">PDF</button>
              <button onClick={() => simulateDownload('Excel')} className="py-2 border border-[#CCD7CE] hover:border-[#137333] bg-white rounded-full text-[10px] font-bold text-[#137333] hover:bg-gray-50 cursor-pointer">XLS</button>
              <button onClick={() => simulateDownload('CSV')} className="py-2 border border-[#CCD7CE] hover:border-[#137333] bg-white rounded-full text-[10px] font-bold text-[#137333] hover:bg-gray-50 cursor-pointer">CSV</button>
            </div>
          </div>
        </div>

      </div>

      {/* Advanced AI Ground-Truth Report Preview Panel */}
      <div className="bg-[#E6F4EA] border border-[#CCD7CE] p-6 rounded-[24px] space-y-4 shadow-sm" id="ai-groundtruth-reporter animate-fade-in">
        <div className="flex items-center gap-2 text-[#137333]">
          <EenvoqIcon className="w-5 h-5 text-[#137333] stroke-[1.5] animate-pulse" />
          <h3 className="font-sans font-bold text-sm">Automated eenvoq Audit Report</h3>
        </div>

        <div className="bg-[#FAF9F5]/80 p-5 rounded-2xl border border-[#CCD7CE] text-xs space-y-3 text-[#137333] leading-relaxed font-sans shadow-none">
          <p className="font-extrabold text-sm">Summary Findings:</p>
          <p className="font-semibold text-xs leading-relaxed text-[#137333]">
            Operating indices map an unrecorded sales leakage rate representing 5.8% of daily transactions. Reconciliations show discrepancy is centralized on Cash Till Register #1, primarily between 3:00 PM and 5:00 PM, where void overrides were executed without matching receipt security signatures. Overall ledger health is stable, with credit limits locked on Baba Sadiq preventing further exposure.
          </p>
          <p className="text-green-700 font-bold pt-1 text-xs">
            ✓ Corrective acts applied: Wholesale account override locks engaged (Baba Sadiq). Custom cashier audits logging overrides active.
          </p>
        </div>
      </div>

    </div>
  );
}
