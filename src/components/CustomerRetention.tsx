import { useState } from 'react';
import { 
  Users, Sparkles, MessageSquare, Mail, Phone, 
  Send, Copy, AlertTriangle, Check, Sliders, ArrowLeft
} from 'lucide-react';
import { RetentionCampaign } from '../types';
import { INITIAL_RETENTION_CAMPAIGNS } from '../demoData';

interface CustomerRetentionProps {
  showConfirm?: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
}

export default function CustomerRetention({ showConfirm }: CustomerRetentionProps) {
  const [campaigns, setCampaigns] = useState<RetentionCampaign[]>(INITIAL_RETENTION_CAMPAIGNS);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copiedType, setCopiedType] = useState<'sms' | 'wa' | 'email' | null>(null);

  const activeCampaign = campaigns[selectedIdx] || campaigns[0];

  const handleCopyText = (text: string, type: 'sms' | 'wa' | 'email') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1500);
  };

  const handleSimulateDispatch = (campaign: RetentionCampaign, medium: string) => {
    const title = "Dispatch Successful";
    const message = `[Message API Simulation]: Dispatching re-engagement invitation to ${campaign.customerName} via ${medium}.\n\nTarget Mobile: ${campaign.phone}`;
    
    if (showConfirm) {
      showConfirm(title, message, () => {}, "Got it", "Dismiss");
    } else {
      alert(message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="customer-retention-center">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.hash = 'dashboard'}
              className="p-1 px-1.5 hover:bg-gray-100 rounded-full transition text-[#1F1F1F] cursor-pointer flex items-center justify-center shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
            </button>
            <h1 className="text-[22px] font-sans font-semibold text-[#1F1F1F] tracking-tight">Retention Engine</h1>
          </div>
          <p className="text-xs text-[#757575] font-normal mt-1 font-sans ml-11">
            Automated re-engagement monitors client checkout gaps and compiles personalized recheck incentives.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-sky-100 border border-sky-200 text-sky-850 px-5 py-2.5 rounded-full text-xs font-bold self-start sm:self-auto select-none shadow-sm">
          <Users className="w-5 h-5 text-sky-600 stroke-[1.5]" />
          <span>Active Engagement Tracker</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="retention-grid-layout">
        
        {/* Left columns: lists vulnerable customers */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur rounded-[24px] border border-[#E3E3E3] shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E3E3E3] bg-transparent select-none">
            <h3 className="font-sans font-bold text-[#1F1F1F] text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 stroke-[1.5]" />
              High-Risk Churn Alert Flags
            </h3>
          </div>

          <div className="divide-y divide-[#E3E3E3] min-h-[350px]" id="retention-customers-scroller">
            {campaigns.map((item, index) => {
              const isSelected = selectedIdx === index;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIdx(index)}
                  className={`p-5 flex items-center justify-between hover:bg-sky-50/20 cursor-pointer transition border-l-4 ${
                    isSelected 
                      ? 'bg-sky-50 border-sky-500' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-[#1F1F1F] text-xs mb-1.5 font-sans justify-start flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse" />
                      {item.customerName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#757575] font-mono">
                      <span>{item.phone}</span>
                      <span>•</span>
                      <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100 uppercase">Inactive: {item.lastVisitDaysAgo} days</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 select-none">
                    <span className="text-xs font-mono font-bold text-red-600 block">
                      Churn Probability: {item.churnProbability}%
                    </span>
                    {/* Linear health meters */}
                    <div className="flex items-center gap-1.5 mt-1.5 justify-end">
                      <span className="text-[10px] text-[#757575] font-sans font-normal">Score:</span>
                      <span className={`text-[10px] font-bold font-mono ${
                        item.healthScore > 70 ? 'text-sky-650' :
                        item.healthScore > 50 ? 'text-amber-700' :
                        'text-red-700'
                      }`}>
                        {item.healthScore}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: re-engagement copy drafts */}
        <div className="bg-white border-2 border-sky-400 rounded-[24px] p-6 self-start space-y-6 flex flex-col shadow-sm" id="retention-campaigns-panel">
          
          <div className="border-b border-[#E3E3E3] pb-4 select-none">
            <span className="text-[10px] text-[#757575] font-mono block uppercase">Client Retention Card</span>
            <h3 className="font-sans font-bold text-[#1F1F1F] text-base mt-1">{activeCampaign.customerName}</h3>
          </div>

          <div className="space-y-4" id="retention-copy-workspace">
            
            {/* Quick summary advisory */}
            <div className="bg-sky-50 border border-sky-200 p-4.5 rounded-[24px] space-y-1.5 text-xs text-[#0284c7]" id="retention-churn-analytics">
              <span className="font-bold uppercase tracking-wider text-[9px] text-sky-700 block select-none">Action Proposal</span>
              <p className="font-semibold text-[11.5px] leading-relaxed text-sky-950">{activeCampaign.suggestedAction}</p>
            </div>

            {/* Simulated Marketing Copy Toggles */}
            <div className="space-y-4 pt-1" id="marketing-drafts-list">
              
              {/* WhatsApp draft segment */}
              <div className="space-y-1.5 font-sans">
                <div className="flex justify-between items-center text-[9px] font-bold text-[#757575] uppercase tracking-wider select-none">
                  <span className="flex items-center gap-1.5 text-sky-600"><MessageSquare className="w-4 h-4 text-sky-650 stroke-[1.5]" /> WhatsApp Blueprint</span>
                  <div className="flex gap-1">
                    <button 
                      type="button"
                      onClick={() => handleCopyText(activeCampaign.draftWhatsapp, 'wa')}
                      className="text-[#757575] hover:text-[#1F1F1F] p-1 transition cursor-pointer"
                      title="Copy copy text"
                    >
                      {copiedType === 'wa' ? <Check className="w-3.5 h-3.5 text-sky-500 stroke-[2]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSimulateDispatch(activeCampaign, 'WhatsApp')}
                      className="text-[#757575] hover:text-[#1F1F1F] p-1 transition cursor-pointer"
                      title="Simulate Dispatch"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="bg-[#FCFAF7] text-xs border border-[#E3E3E3] text-[#1F1F1F] p-4 rounded-2xl leading-relaxed font-sans shadow-none font-semibold">
                  {activeCampaign.draftWhatsapp}
                </div>
              </div>

              {/* SMS draft segment */}
              <div className="space-y-1.5 font-sans">
                <div className="flex justify-between items-center text-[9px] font-bold text-[#757575] uppercase tracking-wider select-none">
                  <span className="flex items-center gap-1.5 text-blue-700"><Phone className="w-4 h-4 text-blue-700 stroke-[1.5]" /> SMS Blueprint</span>
                  <div className="flex gap-1 font-sans">
                    <button 
                      type="button"
                      onClick={() => handleCopyText(activeCampaign.draftSms, 'sms')}
                      className="text-[#757575] hover:text-[#1F1F1F] p-1 transition cursor-pointer"
                      title="Copy copy text"
                    >
                      {copiedType === 'sms' ? <Check className="w-3.5 h-3.5 text-sky-500 stroke-[2]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSimulateDispatch(activeCampaign, 'SMS')}
                      className="text-[#757575] hover:text-[#1F1F1F] p-1 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="bg-[#FCFAF7] text-xs border border-[#E3E3E3] text-[#1F1F1F] p-4 rounded-2xl leading-relaxed font-sans shadow-none font-semibold">
                  {activeCampaign.draftSms}
                </div>
              </div>

              {/* Email draft segment */}
              <div className="space-y-1.5 font-sans">
                <div className="flex justify-between items-center text-[9px] font-bold text-[#757575] uppercase tracking-wider select-none">
                  <span className="flex items-center gap-1.5 text-purple-700"><Mail className="w-4 h-4 text-purple-700 stroke-[1.5]" /> Email Campaign</span>
                  <div className="flex gap-1">
                    <button 
                      type="button"
                      onClick={() => handleCopyText(activeCampaign.draftEmail, 'email')}
                      className="text-[#757575] hover:text-[#1F1F1F] p-1 transition cursor-pointer"
                    >
                      {copiedType === 'email' ? <Check className="w-3.5 h-3.5 text-sky-500 stroke-[2]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSimulateDispatch(activeCampaign, 'Email')}
                      className="text-[#757575] hover:text-[#1F1F1F] p-1 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="bg-[#FCFAF7] text-xs border border-[#E3E3E3] text-[#1F1F1F] p-4 rounded-2xl leading-relaxed font-sans whitespace-pre-wrap shadow-none font-semibold">
                  {activeCampaign.draftEmail}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
