import React, { useState, useEffect } from 'react';
import { 
  Users, Sparkles, MessageSquare, Mail, Phone, 
  Send, Copy, AlertTriangle, Check, Sliders, ArrowLeft
} from 'lucide-react';
import { RetentionCampaign } from '../types';
import { INITIAL_RETENTION_CAMPAIGNS } from '../demoData';

interface CustomerRetentionProps {
  showConfirm?: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
  campaigns?: RetentionCampaign[];
  onUpdateCampaigns?: (campaigns: RetentionCampaign[]) => void;
}

export default function CustomerRetention({ 
  showConfirm,
  campaigns: parentCampaigns,
  onUpdateCampaigns
}: CustomerRetentionProps) {
  const [campaigns, setCampaigns] = useState<RetentionCampaign[]>(parentCampaigns || INITIAL_RETENTION_CAMPAIGNS);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copiedType, setCopiedType] = useState<'sms' | 'wa' | 'email' | null>(null);

  useEffect(() => {
    if (parentCampaigns) {
      setCampaigns(parentCampaigns);
    }
  }, [parentCampaigns]);

  useEffect(() => {
    if (onUpdateCampaigns && JSON.stringify(campaigns) !== JSON.stringify(parentCampaigns)) {
      onUpdateCampaigns(campaigns);
    }
  }, [campaigns, onUpdateCampaigns, parentCampaigns]);

  const activeCampaign = (campaigns && campaigns.length > 0) ? (campaigns[selectedIdx] || campaigns[0]) : null;

  const handleCopyText = (text: string, type: 'sms' | 'wa' | 'email') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1500);
  };

  const handleSimulateDispatch = (campaign: RetentionCampaign, medium: string) => {
    const title = "Dispatch Successful";
    const message = `[Message API Simulation]: Dispatching re-engagement invitation to ${campaign.customerName} via ${medium}.\n\nTarget Mobile: ${campaign.phone}`;
    
    // Also mark campaign as contacted/active
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, contacted: true } : c));

    if (showConfirm) {
      showConfirm(title, message, () => {}, "Got it", "Dismiss");
    } else {
      alert(message);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in text-left font-sans select-none text-[#1F1F1F]" id="customer-retention-center">
      
      {/* HEADER SECTION WITH MESH GRADIENT */}
      <div className="relative overflow-hidden rounded-[32px] p-1 border border-neutral-150/45 bg-white shadow-xs" id="retention-mesh-wrapper">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14)_0%,_rgba(14,165,233,0)_75%)] pointer-events-none" />
        
        {/* Main Header greetings block */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4" id="retention-navbar-panel">
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
                Retention Engine
              </h1>
            </div>
            <p className="text-sm font-sans font-normal text-neutral-400 mt-1.5 pl-8">
              Automated re-engagement monitors client checkout gaps and compiles personalized recheck incentives.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap" id="retention-actions-bar">
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-200/50 text-sky-850 px-4 py-2.5 rounded-full text-xs font-semibold select-none shadow-xs">
              <Users className="w-4 h-4 text-sky-700 stroke-[2]" />
              <span>Active Engagement Tracker</span>
            </div>
          </div>
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

          <div className="divide-y divide-[#E3E3E3] min-h-[350px] flex flex-col justify-center" id="retention-customers-scroller">
            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-[#757575] font-sans px-6 select-none">
                <Users className="w-10 h-10 text-sky-400 mx-auto mb-3.5 stroke-[1.5]" />
                <p className="text-xs font-bold text-gray-800">Perfect Retention Rating</p>
                <p className="text-[11px] mt-1.5 text-gray-500 leading-relaxed max-w-sm mx-auto">
                  No high-risk churn indicators or inactive patrons registered inside the active dockets. All clients are within expected shopping intervals!
                </p>
              </div>
            ) : (
              campaigns.map((item, index) => {
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
              })
            )}
          </div>
        </div>

        {/* Right column: re-engagement copy drafts */}
        <div className="bg-white border-2 border-sky-400 rounded-[24px] p-6 self-start space-y-6 flex flex-col shadow-sm" id="retention-campaigns-panel">
          {!activeCampaign ? (
            <div className="text-center py-20 text-[#757575] font-sans select-none">
              <Sparkles className="w-8 h-8 text-sky-400 mx-auto mb-3" />
              <p className="text-xs font-bold text-gray-800">No Target Active</p>
              <p className="text-[10px] mt-1 text-gray-500 leading-relaxed">
                Select an inactive ledger patron from the main queue to generate recheck incentive templates.
              </p>
            </div>
          ) : (
            <>
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
                    <div className="bg-[#FCFAF7] text-[#1F1F1F] text-xs border border-[#E3E3E3] p-4 rounded-2xl leading-relaxed font-sans whitespace-pre-wrap shadow-none font-semibold">
                      {activeCampaign.draftEmail}
                    </div>
                  </div>

                </div>

              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
}
