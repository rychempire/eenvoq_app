import { useState } from 'react';
import { 
  Sparkles, Thermometer, Clock, ShieldAlert, UserCheck, ArrowLeft
} from 'lucide-react';
import EenvoqIcon from './EenvoqIcon';
import { formatCurrency } from '../utils/currency';

interface ForensicInvestigatorProps {
  currency: string;
}

export default function ForensicInvestigator({ currency }: ForensicInvestigatorProps) {
  const [selectedAnomaly, setSelectedAnomaly] = useState<string | null>("ANM-001");

  // Hourly shift telemetry
  const shiftHours = [
    { hour: "08:00 - 10:00", salesAmount: 85000, overrides: 0, status: "Secure", risk: "low" },
    { hour: "10:00 - 12:00", salesAmount: 142000, overrides: 1, status: "Secure", risk: "low" },
    { hour: "12:00 - 14:00", salesAmount: 210000, overrides: 2, status: "Stable", risk: "medium" },
    { hour: "14:00 - 16:00", salesAmount: 195000, overrides: 8, status: "LEAKAGE ALERT", risk: "critical" }, // Peak leakage!
    { hour: "16:00 - 18:00", salesAmount: 110000, overrides: 4, status: "Discrepancy", risk: "medium" },
    { hour: "18:00 - 20:00", salesAmount: 75000, overrides: 0, status: "Secure", risk: "low" }
  ];

  // Forensic anomalies database
  const anomaliesList = [
    {
      id: "ANM-001",
      title: "Suspicious Deleted Sale on Register 1",
      time: "June 13th, 15:24",
      riskLevel: "Critical",
      score: 91,
      impactAmount: 45000,
      description: "Cashier cancelled a sale of 3 noodle cartons right after the customer paid cash. The customer left without a bill, and no record was saved in the app.",
      explanation: "This is a classic cash skimming issue. Since the customer did not ask for loyalty points or a bill, the cashier was able to cancel the sale on the screen and keep the cash. The app logs flag register staff: T-01 Okafor."
    },
    {
      id: "ANM-002",
      title: "Items Missing from Shop Shelf",
      time: "June 12th, 23:15",
      riskLevel: "Medium",
      score: 64,
      impactAmount: 18900,
      description: "Checking the shelf showed 2 missing cartons of Mamador Oil that weren't registered as sold in the app.",
      explanation: "Administrative inventory leakage discrepancy. Possible unrecorded promotional bundle issues or supplier stock routing discrepancies. Highly advise manager-level stock re-check."
    },
    {
      id: "ANM-003",
      title: "Allowed Debt Without Approval",
      time: "June 13th, 10:11",
      riskLevel: "High",
      score: 82,
      impactAmount: 350000,
      description: "System locks were ignored, allowing Baba Sadiq to take 12 crates of soap on credit even though he owes past unpaid debts.",
      explanation: "Rules were bypassed. Baba Sadiq is not supposed to take more products because he hasn't paid past debts. Someone on register #2 manually skipped the lock."
    }
  ];

  const activeAnomalyData = anomaliesList.find(a => a.id === selectedAnomaly) || anomaliesList[0];

  return (
    <div className="space-y-4 pb-12 animate-fade-in text-left font-sans select-none text-zinc-300 w-full" id="forensic-investigation-workspace">
      
      {/* HEADER SECTION - SAME AS HOME DASHBOARD STYLE */}
      <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-none" id="forensic-header-nav">
        {/* Left Side: Store Identity & QuickBooks logo */}
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded bg-[#db2777] flex items-center justify-center text-white font-bold text-lg shadow-none shrink-0 select-none lowercase font-sans">
            ev
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md font-sans">
                Forensic Audit Desk
              </h2>
              <span className="bg-pink-950/40 text-[#db2777] text-[9px] font-bold px-2 py-0.5 rounded border border-[#db2777]/35 uppercase tracking-widest shrink-0 font-mono">
                Audit Sentry
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Automatically tracks register voids, unlogged deletions, and suspicious transactions in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap" id="forensic-actions-bar">
          <span className="text-[10px] uppercase font-bold py-1.5 px-3 bg-pink-950/45 text-[#db2777] border border-[#db2777]/30 rounded flex items-center gap-1 font-sans">
            Real-time Scan Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Shift Telemetry & Logs) */}
        <div className="lg:col-span-2 space-y-8" id="forensic-history-panel">
          
          {/* Shift Telemetry Hourly block */}
          <div className="bg-[#0e0e11] rounded-lg border border-[#27272a] p-6 shadow-none space-y-5" id="hourly-shift-telemetry">
            <div className="flex items-center gap-2 select-none">
              <Thermometer className="w-4.5 h-4.5 text-zinc-400" />
              <h3 className="font-sans font-semibold text-white text-xs">Shift Heatmap (June 13th Activity)</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 select-none">
              {shiftHours.map((sh, idx) => (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-lg border text-center transition-all ${
                    sh.risk === 'critical' ? 'bg-red-950/30 border-red-900/40 text-rose-300' :
                    sh.risk === 'medium' ? 'bg-amber-950/20 border-amber-900/30 text-amber-300' :
                    'bg-[#18181b] border-[#27272a] text-zinc-300'
                  }`}
                >
                  <p className="text-[9px] font-mono font-semibold opacity-70 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500 stroke-[1.5]" />
                    {sh.hour.split(' ')[0]}
                  </p>
                  <p className="text-xs font-semibold font-mono my-2">{formatCurrency(sh.salesAmount, currency)}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm ${
                    sh.risk === 'critical' ? 'bg-red-900/55 text-red-200' :
                    sh.risk === 'medium' ? 'bg-amber-900/55 text-amber-200' :
                    'bg-zinc-800 text-zinc-300'
                  } uppercase font-sans`}>
                    {sh.status.split(' ')[0]}
                  </span>
                  <p className="text-[9px] font-mono opacity-70 mt-2">{sh.overrides} voids</p>
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies Chronicles */}
          <div className="bg-[#0e0e11] rounded-lg border border-[#27272a] shadow-none overflow-hidden" id="forensic-logs-panel">
            <div className="p-5 border-b border-[#27272a] bg-transparent select-none">
              <h3 className="font-sans font-semibold text-white text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#db2777] stroke-[1.5]" />
                Recent Flagged Sales Issues
              </h3>
            </div>

            <div className="divide-y divide-[#27272a]" id="anomalies-scrolling-items">
              {anomaliesList.map((anomaly) => (
                <div
                  key={anomaly.id}
                  onClick={() => setSelectedAnomaly(anomaly.id)}
                  className={`p-5 flex items-center justify-between hover:bg-zinc-800/40 transition border-l-4 cursor-pointer ${
                    selectedAnomaly === anomaly.id 
                      ? 'bg-pink-950/20 border-[#db2777]' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-semibold text-white">{anomaly.id}</span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-sm border uppercase ${
                        anomaly.riskLevel === 'Critical' ? 'bg-red-950/50 text-rose-300 border-red-900/40' :
                        anomaly.riskLevel === 'High' ? 'bg-amber-950/50 text-amber-300 border-amber-900/30' :
                        'bg-zinc-800 text-zinc-300 border-[#27272a]'
                      }`}>
                        {anomaly.riskLevel}
                      </span>
                    </div>
                    <p className="font-semibold text-white text-xs mb-1 font-sans">{anomaly.title}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Logged: {anomaly.time}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-semibold text-rose-400 bg-rose-950/40 border border-[#db2777]/30 px-2 shadow-none py-0.5 rounded-full block">
                      {formatCurrency(anomaly.impactAmount, currency)}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-1.5 block">Confidence: {anomaly.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: AI Explanations & Deep Diagnostics */}
        <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-6 self-start space-y-6 flex flex-col pt-6 shadow-none" id="forensic-deep-diagnose">
          
          <div className="border-b border-[#27272a] pb-4 select-none">
            <span className="text-[10px] text-zinc-500 font-mono block uppercase">What Happened Here?</span>
            <h3 className="font-sans font-semibold text-white text-sm mt-1">{activeAnomalyData.title}</h3>
          </div>

          <div className="space-y-5" id="case-study-details-content">
            <div className="grid grid-cols-2 gap-4 font-sans select-none" id="case-study-metric-pair">
              <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-lg">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase font-sans">Confidence Level</span>
                <p className="text-base font-mono font-bold text-white mt-1">{activeAnomalyData.score}%</p>
              </div>
              <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-lg">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase font-sans">Money Lost</span>
                <p className="text-base font-mono font-bold text-rose-500 mt-1">{formatCurrency(activeAnomalyData.impactAmount, currency)}</p>
              </div>
            </div>

            {/* Diagnostic Narrative Description */}
            <div className="space-y-1.5 font-sans">
              <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block">Security Flag details:</span>
              <p className="text-xs text-zinc-300 leading-relaxed bg-[#18181b] border border-[#27272a] p-4 rounded-lg font-semibold">
                {activeAnomalyData.description}
              </p>
            </div>

            {/* AI Automated Forensic Explanation */}
            <div className="bg-pink-950/20 border border-[#db2777]/30 p-5 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#db2777] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
                <span className="text-xs font-bold text-pink-400 font-sans">AI Summary</span>
              </div>
              <p className="text-[11.5px] text-zinc-300 leading-relaxed font-sans font-semibold">
                {activeAnomalyData.explanation}
              </p>
            </div>

            {/* Teller Performance Scorecard */}
            <div className="space-y-2.5 font-sans" id="teller-performance-flag">
              <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block">Assigned Staff</span>
              <div className="flex items-center justify-between p-3 bg-[#18181b] border border-[#27272a] rounded-lg text-xs">
                <div className="flex items-center gap-2 pl-1">
                  <UserCheck className="w-4 h-4 text-zinc-400 stroke-[1.5]" />
                  <span className="font-semibold text-white">Okafor, T-1</span>
                </div>
                <span className="bg-pink-950/40 text-[#db2777] font-semibold px-3 py-1 rounded border border-[#db2777]/30 text-[10px] font-mono uppercase">
                  Flagged Shift
                </span>
              </div>
            </div>
            
          </div>

        </div>

        {/* End grid splits */}
      </div>

    </div>
  );
}
