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
    <div className="space-y-4 pb-12 animate-fade-in text-left font-sans select-none text-zinc-350 w-full" id="customer-retention-center">
      
      {/* HEADER SECTION - SAME AS HOME DASHBOARD STYLE */}
      <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-none" id="retention-header-nav">
        {/* Left Side: Store Identity & QuickBooks logo */}
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded bg-[#db2777] flex items-center justify-center text-white font-bold text-lg shadow-none shrink-0 select-none lowercase">
            ev
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md font-sans">
                Retention Ledger Engine
              </h2>
              <span className="bg-pink-950/40 text-[#db2777] text-[9px] font-bold px-2 py-0.5 rounded border border-[#db2777]/35 uppercase tracking-widest shrink-0 font-mono">
                Retention Tracker
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Automated re-engagement monitors client gaps and compiles personalized recheck incentives.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap" id="retention-actions-bar">
          <div className="flex items-center gap-2 bg-pink-950/40 border border-[#db2777]/35 text-[#db2777] px-3 py-1.5 rounded text-xs font-bold select-none">
            <Users className="w-3.5 h-3.5 text-[#db2777]" />
            <span>Active Engagement Tracker</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="retention-grid-layout">
        
        {/* Left columns: lists vulnerable customers */}
        <div className="lg:col-span-2 bg-[#0e0e11] rounded border border-[#27272a] shadow-none overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#27272a] bg-[#18181b] select-none">
            <h3 className="font-sans font-bold text-zinc-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              High-Risk Churn Alert Flags
            </h3>
          </div>

          <div className="divide-y divide-[#27272a] min-h-[350px] flex flex-col justify-start" id="retention-customers-scroller">
            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-sans px-6 select-none my-auto">
                <Users className="w-10 h-10 text-[#db2777] mx-auto mb-3.5 stroke-[1.5]" />
                <p className="text-xs font-bold text-white">Perfect Retention Rating</p>
                <p className="text-[11px] mt-1.5 text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  No high-risk churn indicators or inactive patrons registered dockets. All clients are within expected shopping intervals!
                </p>
              </div>
            ) : (
              campaigns.map((item, index) => {
                const isSelected = selectedIdx === index;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIdx(index)}
                    className={`p-4 flex items-center justify-between hover:bg-zinc-800/30 cursor-pointer transition border-l-4 ${
                      isSelected 
                        ? 'bg-pink-950/20 border-[#db2777]' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-bold text-white text-xs mb-1 font-sans justify-start flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        {item.customerName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                        <span>{item.phone}</span>
                        <span>•</span>
                        <span className="text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40 uppercase">Inactive: {item.lastVisitDaysAgo} days</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 select-none">
                      <span className="text-xs font-mono font-bold text-rose-400 block">
                        Churn Probability: {item.churnProbability}%
                      </span>
                      {/* Linear health meters */}
                      <div className="flex items-center gap-1.5 mt-1 justify-end">
                        <span className="text-[10px] text-zinc-450 font-sans font-normal">Score:</span>
                        <span className={`text-[10px] font-bold font-mono ${
                          item.healthScore > 70 ? 'text-[#db2777]' :
                          item.healthScore > 50 ? 'text-amber-500' :
                          'text-rose-400'
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
        <div className="bg-[#0e0e11] border border-[#db2777]/40 rounded-lg p-5 self-start space-y-4 flex flex-col shadow-none" id="retention-campaigns-panel">
          {!activeCampaign ? (
            <div className="text-center py-20 text-zinc-500 font-sans select-none">
              <Sparkles className="w-8 h-8 text-[#db2777] mx-auto mb-3" />
              <p className="text-xs font-bold text-white font-sans">No Target Active</p>
              <p className="text-[10px] mt-1 text-zinc-400 leading-relaxed font-sans">
                Select an inactive ledger patron from the main queue to generate recheck incentive templates.
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-[#27272a] pb-3 select-none">
                <span className="text-[10px] text-zinc-400 font-mono block uppercase">Client Retention Card</span>
                <h3 className="font-sans font-bold text-white text-sm mt-1">{activeCampaign.customerName}</h3>
              </div>

              <div className="space-y-3" id="retention-copy-workspace">
                
                {/* Quick summary advisory */}
                <div className="bg-pink-950/40 border border-[#db2777]/35 p-4 rounded space-y-1.5 text-xs text-pink-300" id="retention-churn-analytics">
                  <span className="font-bold uppercase tracking-wider text-[9px] text-[#db2777] block select-none">Action Proposal</span>
                  <p className="font-semibold text-[11px] leading-relaxed text-slate-200">{activeCampaign.suggestedAction}</p>
                </div>

                {/* Simulated Marketing Copy Toggles */}
                <div className="space-y-4 pt-1" id="marketing-drafts-list">
                  
                  {/* WhatsApp draft segment */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                      <span className="flex items-center gap-1.5 text-sky-400"><MessageSquare className="w-4 h-4 text-sky-400 stroke-[1.5]" /> WhatsApp Blueprint</span>
                      <div className="flex gap-1">
                        <button 
                          type="button"
                          onClick={() => handleCopyText(activeCampaign.draftWhatsapp, 'wa')}
                          className="text-zinc-400 hover:text-white p-1 transition cursor-pointer"
                          title="Copy copy text"
                        >
                          {copiedType === 'wa' ? <Check className="w-3.5 h-3.5 text-sky-400 stroke-[2]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleSimulateDispatch(activeCampaign, 'WhatsApp')}
                          className="text-zinc-400 hover:text-white p-1 transition cursor-pointer"
                          title="Simulate Dispatch"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#18181b] text-xs border border-[#27272a] text-zinc-200 p-4 rounded-xl leading-relaxed font-sans shadow-none font-semibold">
                      {activeCampaign.draftWhatsapp}
                    </div>
                  </div>

                  {/* SMS draft segment */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                      <span className="flex items-center gap-1.5 text-blue-400"><Phone className="w-4 h-4 text-blue-400 stroke-[1.5]" /> SMS Blueprint</span>
                      <div className="flex gap-1 font-sans">
                        <button 
                          type="button"
                          onClick={() => handleCopyText(activeCampaign.draftSms, 'sms')}
                          className="text-zinc-400 hover:text-white p-1 transition cursor-pointer"
                          title="Copy copy text"
                        >
                          {copiedType === 'sms' ? <Check className="w-3.5 h-3.5 text-sky-400 stroke-[2]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleSimulateDispatch(activeCampaign, 'SMS')}
                          className="text-zinc-400 hover:text-white p-1 transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#18181b] text-xs border border-[#27272a] text-zinc-200 p-4 rounded-xl leading-relaxed font-sans shadow-none font-semibold">
                      {activeCampaign.draftSms}
                    </div>
                  </div>

                  {/* Email draft segment */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                      <span className="flex items-center gap-1.5 text-purple-400"><Mail className="w-4 h-4 text-purple-400 stroke-[1.5]" /> Email Campaign</span>
                      <div className="flex gap-1">
                        <button 
                          type="button"
                          onClick={() => handleCopyText(activeCampaign.draftEmail, 'email')}
                          className="text-zinc-400 hover:text-white p-1 transition cursor-pointer"
                        >
                          {copiedType === 'email' ? <Check className="w-3.5 h-3.5 text-sky-400 stroke-[2]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleSimulateDispatch(activeCampaign, 'Email')}
                          className="text-zinc-400 hover:text-white p-1 transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#18181b] text-zinc-200 text-xs border border-[#27272a] p-4 rounded-xl leading-relaxed font-sans whitespace-pre-wrap shadow-none font-semibold font-sans">
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
