import { useState } from 'react';
import { 
  Sparkles, Thermometer, Clock, ShieldAlert, UserCheck, ArrowLeft
} from 'lucide-react';
import EenvoqIcon from './EenvoqIcon';

export default function ForensicInvestigator() {
  const [selectedAnomaly, setSelectedAnomaly] = useState<string | null>("ANM-001");

  // Hourly shift telemetry
  const shiftHours = [
    { hour: "08:00 - 10:00", sales: "₦85,000", overrides: 0, status: "Secure", risk: "low" },
    { hour: "10:00 - 12:00", sales: "₦142,000", overrides: 1, status: "Secure", risk: "low" },
    { hour: "12:00 - 14:00", sales: "₦210,000", overrides: 2, status: "Stable", risk: "medium" },
    { hour: "14:00 - 16:00", sales: "₦195,000", overrides: 8, status: "LEAKAGE ALERT", risk: "critical" }, // Peak leakage!
    { hour: "16:00 - 18:00", sales: "₦110,000", overrides: 4, status: "Discrepancy", risk: "medium" },
    { hour: "18:00 - 20:00", sales: "₦75,000", overrides: 0, status: "Secure", risk: "low" }
  ];

  // Forensic anomalies database
  const anomaliesList = [
    {
      id: "ANM-001",
      title: "Suspicious Deleted Sale on Register 1",
      time: "June 13th, 15:24",
      riskLevel: "Critical",
      score: 91,
      impact: "₦45,000",
      description: "Cashier cancelled a sale of 3 noodle cartons right after the customer paid cash. The customer left without a bill, and no record was saved in the app.",
      explanation: "This is a classic cash skimming issue. Since the customer did not ask for loyalty points or a bill, the cashier was able to cancel the sale on the screen and keep the cash. The app logs flag register staff: T-01 Okafor."
    },
    {
      id: "ANM-002",
      title: "Items Missing from Shop Shelf",
      time: "June 12th, 23:15",
      riskLevel: "Medium",
      score: 64,
      impact: "₦18,900",
      description: "Checking the shelf showed 2 missing cartons of Mamador Oil that weren't registered as sold in the app.",
      explanation: "Administrative inventory leakage discrepancy. Possible unrecorded promotional bundle issues or supplier stock routing discrepancies. Highly advise manager-level stock re-check."
    },
    {
      id: "ANM-003",
      title: "Allowed Debt Without Approval",
      time: "June 13th, 10:11",
      riskLevel: "High",
      score: 82,
      impact: "₦350,000",
      description: "System locks were ignored, allowing Baba Sadiq to take 12 crates of soap on credit even though he owes past unpaid debts.",
      explanation: "Rules were bypassed. Baba Sadiq is not supposed to take more products because he hasn't paid past debts. Someone on register #2 manually skipped the lock."
    }
  ];

  const activeAnomalyData = anomaliesList.find(a => a.id === selectedAnomaly) || anomaliesList[0];

  return (
    <div className="space-y-8 animate-fade-in" id="forensic-investigation-workspace">
      
      <div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.hash = 'dashboard'}
            className="p-1 px-1.5 hover:bg-gray-100 rounded-full transition text-[#1F1F1F] cursor-pointer flex items-center justify-center shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
          </button>
          <h1 className="text-[22px] font-sans font-semibold text-[#1F1F1F] tracking-tight">Missing Money Investigator</h1>
        </div>
        <p className="text-xs text-[#757575] font-normal mt-1 font-sans ml-11">Find cash mistakes, deleted sales, and where money is getting lost during shifts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="forensic-grids-split">
        
        {/* Left Columns: Risk Matrix Heatmaps & chronological anomaly list */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Thermal Shift Risk Map */}
          <div className="bg-[#FCF5E8] rounded-[24px] p-6 border border-[#ECDCCB] shadow-sm space-y-5" id="shift-risk-thermal-matrix">
            <div className="flex items-center justify-between border-b border-[#ECDCCB] pb-3 mb-2 select-none">
              <h3 className="font-sans font-bold text-[#78350F] text-sm flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-red-600 stroke-[1.5]" />
                Store Sales & Risk Status by the Hour
              </h3>
              <span className="text-[10px] text-[#B45309] font-mono font-semibold">Real-time Feed Active</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" id="grid-thermal-capsules">
              {shiftHours.map((sh, idx) => (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    sh.risk === 'critical' ? 'bg-red-50 border-red-200 text-red-700' :
                    sh.risk === 'medium' ? 'bg-amber-50/50 border-amber-200/50 text-amber-700' :
                    'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]'
                  }`}
                >
                  <p className="text-[9px] font-mono font-semibold opacity-70 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-[#5F6368] stroke-[1.5]" />
                    {sh.hour.split(' ')[0]}
                  </p>
                  <p className="text-xs font-semibold font-mono my-2">{sh.sales}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                    sh.risk === 'critical' ? 'bg-red-200 text-red-800' :
                    sh.risk === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-white text-[#0284c7]'
                  } uppercase font-sans`}>
                    {sh.status.split(' ')[0]}
                  </span>
                  <p className="text-[9px] font-mono opacity-70 mt-2">{sh.overrides} voids</p>
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies Chronicles */}
          <div className="bg-white/70 backdrop-blur rounded-[24px] border border-[#E3E3E3] shadow-sm overflow-hidden" id="forensic-logs-panel">
            <div className="p-5 border-b border-[#E3E3E3] bg-transparent select-none">
              <h3 className="font-sans font-semibold text-[#1F1F1F] text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#5F6368] stroke-[1.5]" />
                Recent Flagged Sales Issues
              </h3>
            </div>

            <div className="divide-y divide-[#E3E3E3]" id="anomalies-scrolling-items">
              {anomaliesList.map((anomaly) => (
                <div
                  key={anomaly.id}
                  onClick={() => setSelectedAnomaly(anomaly.id)}
                  className={`p-5 flex items-center justify-between hover:bg-[#FCFAF7]/70 transition border-l-4 cursor-pointer ${
                    selectedAnomaly === anomaly.id 
                      ? 'bg-[#f0f9ff]/70 border-[#0284c7]' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-semibold text-[#1F1F1F]">{anomaly.id}</span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border uppercase ${
                        anomaly.riskLevel === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                        anomaly.riskLevel === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-100 text-[#1F1F1F] border-[#E3E3E3]'
                      }`}>
                        {anomaly.riskLevel}
                      </span>
                    </div>
                    <p className="font-semibold text-[#1F1F1F] text-xs mb-1 font-sans">{anomaly.title}</p>
                    <p className="text-[10px] text-[#757575] font-mono">Logged: {anomaly.time}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-semibold text-red-600 bg-red-50 border border-red-100 px-2 shadow-none py-0.5 rounded-full block">
                      {anomaly.impact}
                    </span>
                    <span className="text-[10px] text-[#757575] font-mono mt-1.5 block">Confidence: {anomaly.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: AI Explanations & Deep Diagnostics */}
        <div className="bg-white border-2 border-black rounded-[24px] p-6 self-start space-y-6 flex flex-col pt-6 shadow-sm" id="forensic-deep-diagnose">
          
          <div className="border-b border-[#E3E3E3] pb-4 select-none">
            <span className="text-[10px] text-[#757575] font-mono block uppercase">What Happened Here?</span>
            <h3 className="font-sans font-semibold text-[#1F1F1F] text-sm mt-1">{activeAnomalyData.title}</h3>
          </div>

          <div className="space-y-5" id="case-study-details-content">
            <div className="grid grid-cols-2 gap-4 font-sans select-none" id="case-study-metric-pair">
              <div className="bg-[#FCFAF7] border border-[#E3E3E3] p-4 rounded-xl">
                <span className="text-[10px] font-semibold text-[#5F6368] uppercase font-sans">Confidence Level</span>
                <p className="text-base font-mono font-bold text-[#1F1F1F] mt-1">{activeAnomalyData.score}%</p>
              </div>
              <div className="bg-[#FCFAF7] border border-[#E3E3E3] p-4 rounded-xl">
                <span className="text-[10px] font-semibold text-[#5F6368] uppercase font-sans">Money Lost</span>
                <p className="text-base font-mono font-bold text-red-600 mt-1">{activeAnomalyData.impact}</p>
              </div>
            </div>

            {/* Diagnostic Narrative Description */}
            <div className="space-y-1.5 font-sans">
              <span className="text-[9px] font-semibold text-[#757575] uppercase tracking-wider block">Security Flag details:</span>
              <p className="text-xs text-[#1F1F1F] leading-relaxed bg-[#FCFAF7] border border-[#E3E3E3] p-4 rounded-xl font-semibold">
                {activeAnomalyData.description}
              </p>
            </div>

            {/* AI Automated Forensic Explanation */}
            <div className="bg-[#f0f9ff] border border-[#bae6fd] p-5 rounded-[24px] space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0284c7] flex items-center justify-center shrink-0">
                  <EenvoqIcon className="w-3.5 h-3.5 text-white stroke-[1.5]" />
                </div>
                <span className="text-xs font-bold text-[#0284c7] font-sans">AI Summary</span>
              </div>
              <p className="text-[11.5px] text-[#0284c7] leading-relaxed font-sans font-semibold">
                {activeAnomalyData.explanation}
              </p>
            </div>

            {/* Teller Performance Scorecard */}
            <div className="space-y-2.5 font-sans" id="teller-performance-flag">
              <span className="text-[9px] font-semibold text-[#757575] uppercase tracking-wider block">Assigned Staff</span>
              <div className="flex items-center justify-between p-3 bg-white border border-[#E3E3E3] rounded-full text-xs">
                <div className="flex items-center gap-2 pl-1">
                  <UserCheck className="w-4 h-4 text-[#5F6368] stroke-[1.5]" />
                  <span className="font-semibold text-[#1F1F1F]">Okafor, T-1</span>
                </div>
                <span className="bg-red-50 text-red-700 font-semibold px-3 py-1 rounded-full text-[10px] font-mono border border-red-100 uppercase">
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
