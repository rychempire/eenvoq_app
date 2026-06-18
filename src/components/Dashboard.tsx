import React, { useState, useEffect } from 'react';
import { Receipt, InventoryItem, Debtor, TruthAudit, Alert } from '../types';
import EenvoqIcon from './EenvoqIcon';
import { 
  TrendingUp, CircleDollarSign, ArrowUpRight, ShieldAlert, 
  Activity, Users, ShoppingCart, BookOpen, AlertCircle, 
  Sparkles, ChevronRight, ArrowLeft, X, Check, Scale, Plus
} from 'lucide-react';

interface DashboardProps {
  receipts: Receipt[];
  inventory: InventoryItem[];
  debtors: Debtor[];
  audits: TruthAudit[];
  alerts: Alert[];
  aiInsights: string[];
  setActiveSection: (sec: string) => void;
  onNavigateToAssistant: (promptText: string) => void;
  onAddAudit?: (newAudit: TruthAudit) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
  user?: any;
}

export default function Dashboard({ 
  receipts, 
  inventory, 
  debtors, 
  audits, 
  alerts, 
  aiInsights,
  setActiveSection,
  onNavigateToAssistant,
  onAddAudit,
  showConfirm,
  user
}: DashboardProps) {

  const userCategory = user?.role || 'Retail Store';
  
  // Custom context personalization tags
  const getCustomerLabel = () => {
    if (userCategory.includes('School')) return 'Students';
    if (userCategory.includes('Church') || userCategory.includes('Ministry')) return 'Donors';
    if (userCategory.includes('SaaS') || userCategory.includes('Subscription')) return 'Subscribers';
    return 'Customers';
  };

  const getDebtsLabel = () => {
    if (userCategory.includes('School')) return 'Fees Outstanding Book';
    if (userCategory.includes('Church') || userCategory.includes('Ministry')) return 'Outstanding Pledges';
    return 'People Owed Money';
  };

  const getTotalOwedLabel = () => {
    if (userCategory.includes('School')) return 'Tuition Balance Owed';
    if (userCategory.includes('Church') || userCategory.includes('Ministry')) return 'Total Pledges Owed';
    return 'Total Owed To You';
  };
  
  // Calculate aggregate store intelligence metrics
  const todayReceipts = receipts.filter(r => r.status === 'verified' || r.status === 'pending');
  const expectedToday = todayReceipts.reduce((sum, r) => sum + r.totalAmount, 0);
  
  // Get latest reconciliation log
  const latestAudit = audits[0] || {
    expectedRevenue: expectedToday,
    declaredRevenue: expectedToday - 45000,
    difference: -45000,
    confidenceScore: 91,
    riskLevel: 'critical'
  };

  const cashVariance = latestAudit.difference;
  const activeClientsCount = receipts.filter(r => r.status === 'verified').length;
  
  // Inventory depleted flags / below limit
  const stockoutItems = inventory.filter(i => i.stockLevel <= i.safeMin);
  
  // Debtor values
  const totalDebtorVolume = debtors.reduce((sum, d) => sum + d.amountOwed, 0);

  // Suggested quick prompts for merchant
  const suggestedQuestions = [
    { title: "Difference Report", query: "Why was sales lower today?" },
    { title: "Stock Planning", query: "Tell me when items will run out." },
    { title: "Missing Money Check", query: "Show patterns where money goes missing." }
  ];

  // Overlays and form state machines
  const [showReceiptsOverlay, setShowReceiptsOverlay] = useState(false);
  const [showInlineTruthCheck, setShowInlineTruthCheck] = useState(false);

  // Quick Reconciliation form states (initialized with standard demo data)
  const [inlineCash, setInlineCash] = useState(120000);
  const [inlineOthers, setInlineOthers] = useState(592000);
  const [inlineResult, setInlineResult] = useState<TruthAudit | null>(null);
  const [inlineLoading, setInlineLoading] = useState(false);

  // Hash routing synchronization for overlays so browser/device back triggers closing them
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      if (hash === '#dashboard/receipts') {
        setShowReceiptsOverlay(true);
        setShowInlineTruthCheck(false);
      } else if (hash === '#dashboard/reconcile') {
        setShowReceiptsOverlay(false);
        setShowInlineTruthCheck(true);
      } else {
        setShowReceiptsOverlay(false);
        setShowInlineTruthCheck(false);
      }
    };
    window.addEventListener('hashchange', handlePopState);
    handlePopState();
    return () => window.removeEventListener('hashchange', handlePopState);
  }, []);

  // Smooth scroll down to the Quick Truth Check form on mobile/desktop selection
  useEffect(() => {
    if (showInlineTruthCheck) {
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById('quick-truth-check-inline');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
      return () => clearTimeout(scrollTimer);
    }
  }, [showInlineTruthCheck]);

  const openReceiptsOverlay = () => {
    window.location.hash = 'dashboard/receipts';
  };

  const openInlineTruthCheck = () => {
    window.location.hash = 'dashboard/reconcile';
  };

  const closeOverlays = () => {
    window.location.hash = 'dashboard';
  };

  const handleInlineAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInlineLoading(true);
    setTimeout(() => {
      const sumDeclared = inlineCash + inlineOthers;
      const netDiff = sumDeclared - expectedToday;
      const confScore = netDiff === 0 
        ? 100 
        : Math.max(10, Math.round(100 - (Math.abs(netDiff) / expectedToday) * 120));
      const calculatedRisk = Math.abs(netDiff) > 40000 ? 'critical' : Math.abs(netDiff) > 5000 ? 'medium' : 'low';
      
      const newAudit: TruthAudit = {
        id: `AUD-QLK-${Math.floor(Math.random() * 900) + 100}`,
        date: new Date().toISOString().split('T')[0],
        physicalCash: inlineCash,
        bankTransfers: Math.round(inlineOthers * 0.6),
        posPayments: Math.round(inlineOthers * 0.4),
        mobileMoney: 0,
        otherIncome: 0,
        expectedRevenue: expectedToday,
        declaredRevenue: sumDeclared,
        difference: netDiff,
        confidenceScore: confScore,
        riskLevel: calculatedRisk,
        details: netDiff === 0
          ? "All your cash and sales match perfectly with nothing missing."
          : `A difference of ₦${Math.abs(netDiff).toLocaleString()} was found between your drawer cash count and today's recorded sales.`
      };

      if (onAddAudit) {
        onAddAudit(newAudit);
      }
      setInlineResult(newAudit);
      setInlineLoading(false);
    }, 850);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="merchant-dashboard-view">
      {/* Upper greetings & setup info */}
      <div className="flex flex-row items-center justify-between gap-4 w-full select-none" id="dashboard-header-block">
        <div>
          <h1 className="text-[22px] font-sans font-semibold text-[#1F1F1F] tracking-tight animate-fade-in" id="dashboard-main-title">
            Dashboard
          </h1>
          <p className="text-xs text-[#757575] font-normal mt-1 font-sans">
            For oganizations & businesses
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              window.location.hash = 'receipts/add';
            }}
            className="bg-sky-500 hover:bg-sky-600 focus:ring-2 focus:ring-sky-200 focus:outline-none border border-transparent text-[#FFFFFF] font-semibold py-3 px-6 rounded-full text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4 text-[#FFFFFF]" />
            Record a Sale
          </button>
        </div>
      </div>

      {/* Dynamic Visual Dashboard Greeting */}
      <div className="bg-white border border-[#E3E3E3] rounded-[28px] overflow-hidden shadow-sm p-6 items-center" id="dashboard-visual-banner">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2">
            <span className="bg-sky-100 border border-sky-200 text-[#0284c7] font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Fully Secure
            </span>
            <span className="bg-[#FCFAF7] border border-sky-200 text-sky-950 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" /> Instant Updates
            </span>
          </div>
          <h2 className="text-2xl font-sans font-bold text-neutral-900 leading-tight">
            Track your money
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed font-sans font-normal max-w-lg">
            Eenvoq secures and auto-balances your sales & payments, keeping you up to date with your money. Now you can record sales on the go, manage your customers and outstanding payments, run audits of the current state of your business, get fresh ideas to boost your revenue, and so much more.
          </p>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={openInlineTruthCheck}
              className="bg-[#111111] hover:bg-black text-white hover:text-sky-300 font-sans font-semibold py-2.5 px-5 rounded-full text-xs transition duration-150 active:scale-97 cursor-pointer border border-[#111111] focus:ring-2 focus:ring-sky-200 focus:outline-none"
            >
               Audit my Records
            </button>
            <button 
              type="button"
              onClick={() => setActiveSection('assistant')}
              className="text-[#0284c7] hover:text-sky-900 font-sans font-bold py-2.5 px-4 text-xs transition hover:underline focus:outline-none"
            >
              Get Advice →
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Naira-centric) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" id="kpi-dashboard-grid">
        
        {/* Expected Revenue Card (Light Blue Accent Block) */}
        <div 
          onClick={openReceiptsOverlay}
          className="bg-sky-50 border border-sky-200 text-[#1e40af] rounded-[24px] p-6 pb-9 shadow-sm flex items-center justify-between transition-all duration-150 ease-out hover:bg-sky-100/50 hover:scale-[0.99] active:scale-[0.98] cursor-pointer relative group"
        >
          <div className="space-y-1">
            <span className="text-xs text-[#1e40af] font-bold tracking-tight font-sans block uppercase tracking-wider">Today's Recorded Sales</span>
            <h3 className="text-[28px] font-extrabold text-[#1F1F1F] tracking-tight font-sans leading-none">
              ₦{expectedToday.toLocaleString()}
            </h3>
            <p className="text-xs text-sky-850 font-semibold mt-1 font-sans">{todayReceipts.length} bills</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-sky-205 bg-white flex items-center justify-center shrink-0 group-hover:border-sky-500 transition-colors duration-150 self-start">
            <CircleDollarSign className="w-5 h-5 text-sky-600 stroke-[1.5]" />
          </div>
          <span className="absolute bottom-2.5 right-5 text-[10px] text-sky-600 font-semibold font-sans tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">Tap to view bills</span>
        </div>

        {/* Declared Cash Card (Deep Warm Ivory Block) */}
        <div 
          onClick={openInlineTruthCheck}
          className="bg-[#FCF5E8] border border-[#ECDCCB] text-[#78350F] rounded-[24px] p-6 pb-9 shadow-sm flex items-center justify-between transition-all duration-150 ease-out hover:bg-[#FBEED7] hover:scale-[0.99] active:scale-[0.98] cursor-pointer relative group"
        >
          <div className="space-y-1">
            <span className="text-xs text-[#B45309] font-bold tracking-tight font-sans block uppercase tracking-wider">Drawer Cash Counted</span>
            <h3 className="text-[28px] font-extrabold text-[#1F1F1F] tracking-tight font-sans leading-none">
              ₦{latestAudit.declaredRevenue.toLocaleString()}
            </h3>
            <p className="text-xs text-[#78350F]/80 font-semibold mt-1 font-sans">Money in register</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-[#ECDCCB] bg-white flex items-center justify-center shrink-0 group-hover:border-[#B45309] transition-colors duration-150 self-start">
            <TrendingUp className="w-5 h-5 text-[#B45309] stroke-[1.5]" />
          </div>
          <span className="absolute bottom-2.5 right-5 text-[10px] text-[#B45309] font-semibold font-sans tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">Match Drawer Cash</span>
        </div>

        {/* Cash Variance/Leakage Card (Vibrant Green or Warn Rose alert) */}
        <div 
          onClick={() => setActiveSection('forensic')}
          className={`${
            cashVariance < 0 
              ? 'bg-[#FDF2F2] border border-[#FAD2CF] text-[#9B1C1C] hover:bg-[#FCD8D8]' 
              : 'bg-sky-50 border border-sky-200 text-[#1e40af] hover:bg-sky-100/40'
          } rounded-[24px] p-6 pb-9 shadow-sm flex items-center justify-between transition-all duration-150 ease-out hover:scale-[0.99] active:scale-[0.98] cursor-pointer relative group`}
        >
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-tight font-sans block uppercase tracking-wider">
              {cashVariance < 0 ? 'Cash Difference / Loss' : 'Audit Variance Status'}
            </span>
            <h3 className="text-[28px] font-extrabold tracking-tight font-sans leading-none">
              {cashVariance < 0 ? `-₦${Math.abs(cashVariance).toLocaleString()}` : `₦${cashVariance.toLocaleString()}`}
            </h3>
            <p className="text-xs font-semibold mt-1 font-sans">
              {cashVariance < 0 ? 'Shortage alert' : 'Matches perfectly'}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-full border bg-white flex items-center justify-center shrink-0 transition-colors duration-150 self-start ${
            cashVariance < 0 ? 'border-[#FAD2CF] group-hover:border-[#9B1C1C]' : 'border-sky-205 group-hover:border-sky-500'
          }`}>
            <ShieldAlert className={`w-5 h-5 stroke-[1.5] ${cashVariance < 0 ? 'text-[#9B1C1C]' : 'text-sky-600'}`} />
          </div>
          <span className="absolute bottom-2.5 right-5 text-[10px] font-semibold font-sans tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">
            {cashVariance < 0 ? 'Find missing cash reasons font-semibold' : 'Run forensic checks'}
          </span>
        </div>

        {/* Verified Sales Card (Pure Pitch Black Block) */}
        <div 
          onClick={() => setActiveSection('receipts')}
          className="bg-black text-white rounded-[24px] p-6 pb-9 border border-neutral-900 shadow-sm flex items-center justify-between transition-all duration-150 ease-out hover:bg-neutral-900 hover:scale-[0.99] active:scale-[0.98] cursor-pointer relative group"
        >
          <div className="space-y-1">
            <span className="text-xs text-neutral-400 font-bold tracking-tight font-sans block uppercase tracking-wider">Verified Receipts</span>
            <h3 className="text-[28px] font-extrabold text-white tracking-tight font-sans leading-none">
              {activeClientsCount}
            </h3>
            <p className="text-xs text-neutral-350 font-semibold mt-1 font-sans">Checked sales</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center shrink-0 group-hover:border-neutral-700 transition-colors duration-150 self-start">
            <Users className="w-5 h-5 text-neutral-300 stroke-[1.5]" />
          </div>
          <span className="absolute bottom-2.5 right-5 text-[10px] text-neutral-400 font-semibold font-sans tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">Open bills list</span>
        </div>

      </div>

      {/* Inline Quick Reconciliation Form panel */}
      {showInlineTruthCheck && (
        <div className="bg-[#FCFAF7] rounded-[24px] border border-[#E3E3E3] p-6 space-y-6 animate-fade-in relative" id="quick-truth-check-inline">
          {/* Back head-bar */}
          <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-4 select-none">
            <div className="flex items-center gap-3">
              <button 
                onClick={closeOverlays}
                className="p-1 px-1.5 hover:bg-gray-200 rounded-full transition text-[#1F1F1F] cursor-pointer flex items-center justify-center shrink-0"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
              </button>
              <h2 className="text-[22px] font-sans font-semibold text-[#1F1F1F] tracking-tight">Today's Cash Matching</h2>
            </div>
            <button 
              onClick={closeOverlays}
              className="p-1 hover:bg-gray-200 rounded-full text-[#757575] hover:text-[#1F1F1F] cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Input elements */}
            <form onSubmit={handleInlineAuditSubmit} className="space-y-4 text-xs font-semibold text-[#1F1F1F]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs text-[#757575] font-sans font-medium">Physical Cash in Drawer (₦)</label>
                  <input
                    type="number" 
                    value={inlineCash} 
                    onChange={e => setInlineCash(parseInt(e.target.value) || 0)}
                    className="w-full bg-white text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-[#5F6368] font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs text-[#757575] font-sans font-medium">Bank / Card / OPay / POS (₦)</label>
                  <input
                    type="number" 
                    value={inlineOthers} 
                    onChange={e => setInlineOthers(parseInt(e.target.value) || 0)}
                    className="w-full bg-white text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-[#5F6368] font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-white border border-[#E3E3E3] rounded-[24px] text-xs font-sans text-[#5F6368] font-normal flex justify-between">
                <span>Sales Recorded on System:</span>
                <span className="font-bold text-[#1F1F1F] font-mono">₦{expectedToday.toLocaleString()}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={inlineLoading}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-full shadow-none transition text-xs font-sans flex items-center justify-center gap-2 cursor-pointer disabled:bg-sky-200 focus:ring-2 focus:ring-sky-200 focus:outline-none animate-pulse-once"
                >
                  {inlineLoading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Scale className="w-4 h-4 stroke-[1.5]" />
                      Check My Cash Match
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeOverlays}
                  className="px-4 py-3 border border-sky-100 hover:border-sky-350 text-neutral-600 hover:bg-sky-50 rounded-full text-xs cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Reconciliation response */}
            <div className="space-y-4">
              {inlineResult ? (
                <div className="bg-white rounded-[24px] p-5 border border-[#E3E3E3] shadow-none space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-3 text-[10px] text-[#757575] font-semibold uppercase font-sans">
                    <span>Check Status</span>
                    <span className={`${
                      inlineResult.riskLevel === 'low' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {inlineResult.riskLevel === 'low' ? '🔒 Drawer Matches Sales' : '⚠️ Missing Money Action Need'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#5F6368] font-normal">Difference:</span>
                      <span className={`font-bold font-mono ${inlineResult.difference < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {inlineResult.difference < 0 ? '-' : '+'}₦{Math.abs(inlineResult.difference).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5F6368] font-normal">Matching Score:</span>
                      <span className="font-bold font-mono text-[#1F1F1F]">{inlineResult.confidenceScore}%</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#5F6368] leading-relaxed italic bg-gray-55/40 p-3 rounded-xl font-normal">
                    {inlineResult.details}
                  </p>

                  <button 
                    type="button"
                    onClick={() => {
                      closeOverlays();
                      setActiveSection('truthcheck');
                    }}
                    className="w-full text-center text-[11px] text-[#5F6368] hover:text-[#1F1F1F] font-semibold underline cursor-pointer"
                  >
                    Go to detailed matching sheet
                  </button>
                </div>
              ) : (
                <div className="h-full border border-dashed border-[#E3E3E3] rounded-[24px] flex flex-col items-center justify-center p-8 text-center text-[#757575]">
                  <Activity className="w-8 h-8 text-[#5F6368] stroke-[1.2] mb-2 scale-100" />
                  <p className="text-[11px] font-sans max-w-xs leading-relaxed font-normal">Type what you have in the register today and click check to see if your cash matches recorded sales.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* AI Insights Section (Replicates Gemini UI ambient design) */}
      <div className="bg-white rounded-[24px] border border-[#E3E3E3] p-6 shadow-none relative" id="ambient-ai-dashboard-panel">
        
        <div className="flex items-center gap-4 mb-6" id="ai-insights-branding">
          <div className="w-10 h-10 rounded-full border border-[#E3E3E3] flex items-center justify-center shrink-0">
            <EenvoqIcon className="w-5 h-5 text-[#5F6368] stroke-[1.2] animate-pulse" />
          </div>
          <div>
            <h2 className="text-[22px] font-sans font-semibold text-[#1F1F1F] flex items-center gap-2">
              Insights 
            </h2>
            <p className="text-xs text-[#757575] font-normal font-sans">AI analysis summary</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="ai-insights-details">
          <div className="space-y-4" id="insights-bullet-list">
            {aiInsights.map((insight, index) => (
              <div key={index} className="flex gap-3 items-start text-xs text-[#1F1F1F] leading-relaxed bg-white p-5 rounded-[24px] border border-[#E3E3E3] shadow-none">
                <span className="text-[#757575] mt-0.5">•</span>
                <div>
                  {insight.startsWith('⚠️') ? (
                    <span className="font-semibold text-[#1F1F1F]">Alert: </span>
                  ) : insight.startsWith('📦') ? (
                    <span className="font-semibold text-[#1F1F1F]">Stock: </span>
                  ) : insight.startsWith('📉') ? (
                    <span className="font-semibold text-[#1F1F1F]">Sales: </span>
                  ) : null}
                  <span className="font-normal">{insight.replace(/^[⚠️📦📉💰]\s*(\*\*)?/, '').replace(/\*\*/g, '')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick interactive questions */}
          <div className="flex flex-col justify-between space-y-4" id="ai-recommendations-prompts">
            <p className="text-xs font-semibold text-[#757575] uppercase tracking-wider pl-1 font-sans">Ask AI</p>
            <div className="grid grid-cols-1 gap-3">
              {suggestedQuestions.map((sq, index) => (
                <button
                  key={index}
                  onClick={() => onNavigateToAssistant(sq.query)}
                  className="p-4 bg-white hover:bg-[#F0F4F9] rounded-[24px] border border-[#E3E3E3] text-left text-xs transition duration-200 shadow-none group flex items-center justify-between cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-[#1F1F1F]">{sq.title}</p>
                    <p className="text-[#757575] font-normal truncate mt-1">"{sq.query}"</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#5F6368] stroke-[1.2] shrink-0 transition group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Information Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" id="bento-secondary-indicators">
        
        {/* Left column: Recent system-wide Alerts */}
        <div className="bg-white rounded-[24px] p-6 border border-[#E3E3E3] shadow-none flex flex-col justify-between animate-fade-in" id="recent-alarms-panel">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-[#E3E3E3] pb-3">
              <h3 className="font-sans font-semibold text-[#1F1F1F] flex items-center gap-2 text-[22px] tracking-tight">
                Urgent!
              </h3>
              <button 
                onClick={() => setActiveSection('notifications')}
                className="text-xs text-[#757575] font-semibold hover:underline cursor-pointer"
              >
                All ({alerts.length})
              </button>
            </div>
            
            <div className="space-y-4 font-sans" id="alerts-summarized-dashboard">
              {alerts.slice(0, 3).map((alert) => {
                const isCritical = alert.priority?.toLowerCase() === 'critical' || alert.priority?.toLowerCase() === 'high';
                return (
                  <div 
                    key={alert.id} 
                    onClick={() => setActiveSection('notifications')}
                    className={`p-4 pb-8 border rounded-[24px] text-xs transition-all duration-150 ease-out hover:scale-[0.99] active:scale-[0.98] cursor-pointer relative group ${
                      isCritical 
                        ? 'bg-[#FDF2F2] border-[#FAD2CF] text-[#9B1C1C] hover:bg-[#FCD8D8]' 
                        : 'bg-white border-[#E3E3E3] hover:bg-[#F0F4F9]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-normal mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isCritical ? 'text-[#C5221F]' : 'text-[#757575]'}`}>
                        {alert.priority}
                      </span>
                      <span className={`text-[10px] font-mono ${isCritical ? 'text-[#C5221F]' : 'text-[#757575]'}`}>
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`font-bold truncate mb-0.5 ${isCritical ? 'text-[#9B1C1C]' : 'text-[#1F1F1F]'}`}>{alert.title}</p>
                    <p className={`line-clamp-2 leading-relaxed font-semibold ${isCritical ? 'text-[#9B1C1C]/80' : 'text-[#757575]'}`}>{alert.description}</p>
                    <span className={`absolute bottom-2 right-4 text-[9px] font-bold tracking-tight opacity-75 group-hover:opacity-100 transition-opacity ${isCritical ? 'text-[#C5221F]' : 'text-[#757575]'}`}>View notification</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center column: Inventory depletion metrics (Deep Warm Ivory Block styling) */}
        <div className="bg-white rounded-[24px] p-6 border border-[#E3E3E3] shadow-none flex flex-col justify-between animate-fade-in" id="inventory-indices-panel">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-[#E3E3E3] pb-3">
              <h3 className="font-sans font-semibold text-[#1F1F1F] flex items-center gap-2 text-[22px] tracking-tight">
                Low Stock
              </h3>
              <button 
                onClick={() => setActiveSection('inventory')}
                className="text-xs text-[#757575] font-semibold hover:underline font-sans cursor-pointer"
              >
                Track
              </button>
            </div>

            <div className="space-y-4 font-sans" id="inventory-critical-summaries">
              {stockoutItems.slice(0, 3).map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setActiveSection('inventory')}
                  className="flex items-center justify-between p-4 pb-8 bg-[#FCF5E8]/60 border border-[#ECDCCB] rounded-[24px] transition-all duration-150 ease-out hover:bg-[#FCF5E8] hover:scale-[0.99] active:scale-[0.98] cursor-pointer relative group"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[#78350F] text-xs truncate">{item.name}</p>
                    <p className="text-[10px] text-[#B45309] font-bold flex items-center gap-1 mt-1 font-mono">
                      Sales rate: {item.velocity} items/day
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#78350F] block">
                      {item.stockLevel} left
                    </span>
                    <span className="text-[10px] text-[#B45309] font-semibold block mt-1">Runs out soon</span>
                  </div>
                  <span className="absolute bottom-1.5 right-4 text-[9px] text-[#B45309] font-bold tracking-tight opacity-75 group-hover:opacity-100 transition-opacity">Restock item</span>
                </div>
              ))}
              {stockoutItems.length === 0 && (
                <p className="text-xs text-center text-gray-400 py-6 font-normal">Safe Levels</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Outstanding Debts (Clean White Card with Solid 2px Black Border style) */}
        <div className="bg-white rounded-[24px] p-6 border-2 border-black shadow-sm flex flex-col justify-between animate-fade-in" id="debtors-indices-panel">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-black pb-3">
              <h3 className="font-sans font-bold text-[#1F1F1F] flex items-center gap-2 text-[22px] tracking-tight">
                Debtors
              </h3>
              <button 
                onClick={() => setActiveSection('debtor')}
                className="text-xs text-neutral-600 font-bold hover:underline cursor-pointer"
              >
                Open Book
              </button>
            </div>
 
            <div className="space-y-4 font-sans" id="debtors-dashboard-summaries">
              <div 
                onClick={() => setActiveSection('debtor')}
                className="p-4 pb-7 bg-black text-white border border-neutral-900 rounded-[24px] mb-2 flex items-center justify-between text-xs transition-all duration-150 ease-out hover:bg-neutral-900 hover:scale-[0.99] active:scale-[0.98] cursor-pointer relative group"
              >
                <span className="text-neutral-400 font-semibold font-sans">{getTotalOwedLabel()}</span>
                <span className="font-mono font-extrabold text-white text-sm">₦{totalDebtorVolume.toLocaleString()}</span>
                <span className="absolute bottom-1.5 right-4 text-[9px] text-neutral-400 font-bold font-sans tracking-tight opacity-75 group-hover:opacity-100 transition-opacity">Open Owed List</span>
              </div>
              
              {debtors.slice(0, 2).map((debtor) => (
                <div 
                  key={debtor.id} 
                  onClick={() => setActiveSection('debtor')}
                  className={`flex items-center justify-between p-4 pb-8 rounded-[24px] border transition-all duration-150 ease-out hover:scale-[0.99] active:scale-[0.98] cursor-pointer relative group ${
                    debtor.locked 
                      ? 'bg-[#FDF2F2] border-[#FAD2CF] hover:bg-[#FCD8D8]' 
                      : 'bg-[#FCFAF7] border-[#E3E3E3] hover:bg-[#FCFAF2]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-xs truncate ${debtor.locked ? 'text-[#9B1C1C]' : 'text-[#1F1F1F]'}`}>{debtor.name}</p>
                      {debtor.locked && (
                        <span className="text-[8px] bg-red-650 text-white px-1.5 py-0.5 rounded-full font-mono uppercase font-bold">Blocked</span>
                      )}
                    </div>
                    <p className={`text-[10px] font-semibold mt-1 ${debtor.locked ? 'text-[#9B1C1C]/70' : 'text-[#757575]'}`}>Due: {debtor.dueDate}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold font-mono ${debtor.locked ? 'text-[#9B1C1C]' : 'text-gray-900'}`}>
                      ₦{debtor.amountOwed.toLocaleString()}
                    </span>
                    <span className={`block text-[9px] font-bold uppercase mt-0.5 ${debtor.locked ? 'text-[#C5221F]' : 'text-[#757575]'}`}>
                      {debtor.riskRating} risk
                    </span>
                  </div>
                  <span className={`absolute bottom-1.5 right-4 text-[9px] font-bold tracking-tight opacity-75 group-hover:opacity-100 transition-opacity ${debtor.locked ? 'text-[#C5221F]' : 'text-[#757575]'}`}>Manage debtor</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Footer Insights Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white text-[#1F1F1F] p-6 rounded-[24px] border border-[#E3E3E3] mt-8 gap-4 select-none shadow-none font-sans">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#1F1F1F] font-normal">
            Shortage found in Shift B.
          </span>
        </div>
        <button 
          onClick={() => onNavigateToAssistant("Check Shift B (3PM-5PM) recorded sales vs drawer cash to find missing money source")}
          className="text-xs text-[#5F6368] hover:text-black font-medium underline cursor-pointer shrink-0 animate-pulse-once"
        >
          Check Where Money Went
        </button>
      </div>

      {/* Slide-in receipts drawer overlay */}
      {showReceiptsOverlay && (
        <div className="relative z-50 animate-fade-in" id="receipts-overlay-container">
          <div 
            className="fixed inset-0 bg-[#1F1F1F]/20 backdrop-blur-xs transition-opacity duration-200 pointer-events-auto"
            onClick={closeOverlays}
          />
          <div 
            className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl flex flex-col justify-between transform transition-transform duration-200 pointer-events-auto p-0 border-l border-[#E3E3E3]" 
            style={{ transform: 'translateX(0)' }}
          >
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Back Header inline with 22px semibold title */}
              <div className="p-6 border-b border-[#E3E3E3] flex items-center justify-between bg-white select-none shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={closeOverlays}
                    className="p-1 px-1.5 hover:bg-gray-100 rounded-full transition text-[#1F1F1F] cursor-pointer flex items-center justify-center shrink-0"
                    title="Back to Dashboard"
                  >
                    <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
                  </button>
                  <h2 className="text-[22px] font-sans font-semibold text-[#1F1F1F] tracking-tight">Today's Bills</h2>
                </div>
                <button 
                  onClick={closeOverlays}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-[#757575] hover:text-[#1F1F1F] cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Verified receipts log items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-12rem)]">
                <div className="bg-[#FCFAF7] rounded-[24px] p-5 border border-[#E3E3E3] text-xs space-y-1 select-none">
                  <p className="font-semibold text-[#1F1F1F] font-sans">Recorded Bills List</p>
                  <p className="text-[#5F6368] font-sans">Check today's bills log to see if they match today's total register amount of ₦{expectedToday.toLocaleString()}.</p>
                </div>

                <div className="space-y-3">
                  {todayReceipts.map((receipt) => (
                    <div 
                      key={receipt.id}
                      onClick={() => {
                        closeOverlays();
                        setActiveSection('receipts');
                      }}
                      className="p-5 bg-white hover:bg-[#F0F4F9] border border-[#E3E3E3] rounded-[24px] flex items-center justify-between transition cursor-pointer hover:scale-[0.99] active:scale-[0.98] group relative pb-8"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-1 text-xs">
                          <span className="font-mono font-semibold text-[#1F1F1F]">{receipt.id}</span>
                          <span className="text-[8px] uppercase tracking-wide font-semibold font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">Matched</span>
                        </div>
                        <p className="text-xs font-semibold text-[#1F1F1F] truncate">{receipt.customerName}</p>
                        <p className="text-[10px] text-[#757575] font-mono mt-0.5 truncate">{receipt.securitySignature}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-mono font-semibold text-[#1F1F1F]">₦{receipt.totalAmount.toLocaleString()}</span>
                        <p className="text-[9px] text-[#757575] mt-1 font-mono">Today</p>
                      </div>
                      <span className="absolute bottom-2.5 right-5 text-[8.5px] font-semibold text-[#757575] font-sans tracking-tight">Tap to view</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom panel */}
            <div className="p-6 border-t border-[#E3E3E3] bg-white shrink-0">
              <button 
                onClick={() => {
                  closeOverlays();
                  setActiveSection('receipts');
                }}
                className="w-full bg-[#1F1F1F] hover:bg-black text-white text-xs font-semibold py-3.5 rounded-full transition text-center flex items-center justify-center gap-2 cursor-pointer shadow-none"
              >
                <span>Go to Customer Bills List</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
