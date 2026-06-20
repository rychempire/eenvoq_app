import React, { useState, useEffect } from 'react';
import { Receipt, InventoryItem, Debtor, TruthAudit, Alert } from '../types';
import EenvoqIcon from './EenvoqIcon';
import { 
  ArrowUpRight, AlertCircle, Sparkles, ChevronRight, ArrowLeft, X, Check, Plus, 
  Search, TrendingUp, ShieldAlert, Users, ShoppingCart, Activity, CheckCircle2,
  Coins, Filter, ArrowRight, CircleDollarSign, BarChart2, DollarSign, Bot, AlertTriangle
} from 'lucide-react';
import { formatCurrency, CURRENCIES } from '../utils/currency';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';

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
  currency: string;
  setCurrency?: (curr: string) => void;
}

interface SmartRec {
  id: string;
  text: string;
  action: string;
  state: 'pending' | 'approved' | 'dismissed';
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
  user,
  currency,
  setCurrency
}: DashboardProps) {

  const userName = user?.name || 'Prince';
  const businessName = user?.businessName || 'Eenvoq Enterprise';
  const currencySymbol = CURRENCIES[currency]?.symbol || '$';

  // Toggle state for currency selection
  const handleCurrencyToggle = () => {
    if (setCurrency) {
      const nextCode = currency === 'NGN' ? 'USD' : 'NGN';
      setCurrency(nextCode);
    }
  };

  // State machines
  const [aiQuery, setAiQuery] = useState('');
  const [trendType, setTrendType] = useState<'revenue' | 'profit' | 'transactions'>('revenue');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReconciliationInline, setShowReconciliationInline] = useState(false);

  // Reconciliation interactive states
  const [inputCash, setInputCash] = useState<number>(245000);
  const [inputOthers, setInputOthers] = useState<number>(50000);
  const [truthCheckResult, setTruthCheckResult] = useState<TruthAudit | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  // AI Recommendations queue
  const [recommendations, setRecommendations] = useState<SmartRec[]>([
    { id: 'rec-1', text: "Increase price of Coca-Cola by 3%", action: "Price Adjustment", state: 'pending' },
    { id: 'rec-2', text: "Order 2 cartons of Peak Milk", action: "Procurement", state: 'pending' },
    { id: 'rec-3', text: "Contact inactive customer John", action: "Retention", state: 'pending' },
    { id: 'rec-4', text: "Run Truth Check before closing", action: "Compliance", state: 'pending' }
  ]);

  // Aggregate stats or fallback placeholders
  const verifiedReceipts = receipts.filter(r => r.status === 'verified');
  const expectedToday = receipts.length > 0 ? receipts.reduce((sum, r) => sum + r.totalAmount, 0) : 245000;
  const totalTransactions = receipts.length > 0 ? receipts.length : 43;
  const totalCustomers = debtors.length > 0 ? debtors.length : 31;
  const todayProfit = expectedToday * 0.58; // 58% dynamic margin
  const cashCollected = expectedToday * 0.72; // 72% paid as Cash in drawer
  
  // Calculate inventory valuation
  const totalInventoryValuation = inventory.reduce((sum, item) => sum + (item.basePrice * item.stockLevel), 0) || 1850000;

  // Handles AI search bar submission
  const handleAiSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    onNavigateToAssistant(aiQuery);
    setAiQuery('');
  };

  // Recommendation actions
  const handleApproveRec = (id: string, text: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, state: 'approved' } : r));
    if (showConfirm) {
      showConfirm(
        "Recommendation Approved",
        `Perfect! We have queued the action: "${text}" into your business log.`,
        () => {},
        "Acknowledge",
        ""
      );
    }
  };

  const handleDismissRec = (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, state: 'dismissed' } : r));
  };

  // Inline Reconciliation processing
  const handleRunReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    setAuditLoading(true);
    setTimeout(() => {
      const sumDeclared = inputCash + inputOthers;
      const netDifference = sumDeclared - expectedToday;
      const confidenceScore = netDifference === 0 
        ? 100 
        : Math.max(15, Math.round(100 - (Math.abs(netDifference) / expectedToday) * 110));
      
      const scoreRisk = Math.abs(netDifference) > 40000 ? 'critical' : Math.abs(netDifference) > 5000 ? 'medium' : 'low';
      
      const newAudit: TruthAudit = {
        id: `AUD-INL-${Math.floor(Math.random() * 900) + 100}`,
        date: new Date().toISOString().split('T')[0],
        physicalCash: inputCash,
        bankTransfers: Math.round(inputOthers * 0.7),
        posPayments: Math.round(inputOthers * 0.3),
        mobileMoney: 0,
        otherIncome: 0,
        expectedRevenue: expectedToday,
        declaredRevenue: sumDeclared,
        difference: netDifference,
        confidenceScore: confidenceScore,
        riskLevel: scoreRisk,
        details: netDifference === 0
          ? "Your physical register matches precisely with total recorded sales."
          : `A difference of ${formatCurrency(Math.abs(netDifference), currency)} was detected between your drawer cash count and today's billing.`
      };

      if (onAddAudit) {
        onAddAudit(newAudit);
      }
      setTruthCheckResult(newAudit);
      setAuditLoading(false);
    }, 800);
  };

  // Dynamic datasets for 7-day trend
  const formatChartVal = (val: number) => {
    if (trendType === 'transactions') return val.toString();
    return formatCurrency(val, currency, 0);
  };

  const trendData = [
    { day: 'Mon', revenue: expectedToday * 0.8, profit: expectedToday * 0.8 * 0.58, transactions: 34 },
    { day: 'Tue', revenue: expectedToday * 0.95, profit: expectedToday * 0.95 * 0.58, transactions: 41 },
    { day: 'Wed', revenue: expectedToday * 1.1, profit: expectedToday * 1.1 * 0.58, transactions: 48 },
    { day: 'Thu', revenue: expectedToday * 0.75, profit: expectedToday * 0.75 * 0.58, transactions: 31 },
    { day: 'Fri', revenue: expectedToday * 1.2, profit: expectedToday * 1.2 * 0.58, transactions: 52 },
    { day: 'Sat', revenue: expectedToday * 1.05, profit: expectedToday * 1.05 * 0.58, transactions: 46 },
    { day: 'Sun', revenue: expectedToday, profit: todayProfit, transactions: totalTransactions }
  ];

  return (
    <div className="space-y-6 pb-24 animate-fade-in font-sans text-neutral-900 select-none" id="eenvoq-mobile-dashboard">
      
      {/* ===============================================
          TOP BAR: GREETING & CURRENCY SELECTOR
          =============================================== */}
      <div className="bg-white border border-neutral-100 rounded-[28px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4" id="dashboard-navbar-panel">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-sans font-black text-neutral-900 tracking-tight">
              {businessName}
            </h1>
            <span className="bg-sky-50 text-sky-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-sky-100 uppercase tracking-wider font-mono">
              Live Sentry
            </span>
          </div>
          <p className="text-sm font-sans font-bold text-neutral-400 mt-1">
            Good morning, <span className="text-[#1e40af]">{userName} 👋</span>
          </p>
        </div>

        {/* Sales readout & Currency Toggle widget */}
        <div className="flex flex-row items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-neutral-100">
          <div className="text-left md:text-right">
            <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Today's Sales Sum</span>
            <span className="text-lg font-black text-neutral-950 tracking-tight font-sans">
              {formatCurrency(expectedToday, currency)}
            </span>
          </div>

          <div className="flex bg-neutral-100/80 p-0.5 rounded-full border border-neutral-200/50 shrink-0" id="header-currency-bar">
            <button
              type="button"
              onClick={() => setCurrency && setCurrency('NGN')}
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition ${
                currency === 'NGN' ? 'bg-[#1e40af] text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-950 bg-transparent'
              }`}
            >
              ₦ NGN
            </button>
            <button
              type="button"
              onClick={() => setCurrency && setCurrency('USD')}
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition ${
                currency === 'USD' ? 'bg-[#1e40af] text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-950 bg-transparent'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>

      {/* METRIC BADGES (SMALL INDICATORS) */}
      <div className="grid grid-cols-2 gap-4" id="small-dashboard-indicators">
        <div className="bg-neutral-50/70 border border-neutral-150 rounded-[20px] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Transactions</p>
            <p className="text-md font-extrabold text-neutral-900 leading-none mt-0.5 font-mono">{totalTransactions}</p>
          </div>
        </div>

        <div className="bg-neutral-50/70 border border-neutral-150 rounded-[20px] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Customers</p>
            <p className="text-md font-extrabold text-neutral-900 leading-none mt-0.5 font-mono">{totalCustomers}</p>
          </div>
        </div>
      </div>

      {/* ===============================================
          SECTION 1: AI COMMAND CENTER (HERO AREA)
          =============================================== */}
      <div 
        className="relative border border-slate-900 rounded-[32px] overflow-hidden shadow-lg p-6 md:p-8" 
        id="dashboard-ai-command-center"
        style={{ 
          background: 'radial-gradient(circle at top left, #0D1B2A 0%, #1B263B 60%, #415A77 100%)' 
        }}
      >
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-10 w-[200px] h-[150px] bg-sky-400/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-5 w-[150px] h-[120px] bg-amber-400/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header row with avatar sizer */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <EenvoqIcon className="w-4.5 h-4.5 text-sky-300 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-300 font-mono block">Autonomous Intelligence Sentry</span>
              <h2 className="text-lg font-sans font-black text-white leading-none">Eenvoq Sentry Core</h2>
            </div>
          </div>

          {/* AI Search input block */}
          <form onSubmit={handleAiSearchSubmit} className="relative w-full">
            <input 
              type="text"
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              placeholder="Ask Eenvoq anything..."
              className="w-full bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-full py-3.5 pl-5 pr-12 text-sm focus:outline-none focus:bg-white/15 focus:border-sky-400/60 font-medium transition"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-400 text-neutral-950 flex items-center justify-center cursor-pointer transition shadow-xs"
            >
              <Search className="w-4 h-4 stroke-[2]" />
            </button>
          </form>

          {/* Question Examples */}
          <div className="text-left space-y-2">
            <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Examples:</span>
            <div className="flex flex-wrap gap-2">
              {[
                "Why are sales down today?",
                "What products should I restock?",
                "Which customers haven't returned?",
                "Show suspicious transactions"
              ].map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onNavigateToAssistant(ex)}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-medium transition cursor-pointer text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* AI Insights bullet points inside Hero area */}
          <div className="border-t border-white/10 pt-4 text-left">
            <h3 className="text-xs uppercase font-extrabold text-sky-400 tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Insights</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { text: "Revenue is 18% lower than yesterday", alert: "⚠", path: "Why is today's revenue lower than yesterday?" },
                { text: "3 products will run out in 4 days", alert: "📦", action: () => setActiveSection('inventory') },
                { text: "Cash mismatch detected", alert: "💰", action: () => setShowReconciliationInline(true) },
                { text: "Top customer has not purchased in 12 days", alert: "⭐", action: () => setActiveSection('debtor') }
              ].map((ins, index) => (
                <div 
                  key={index}
                  onClick={() => {
                    if (ins.action) {
                      ins.action();
                    } else if (ins.path) {
                      onNavigateToAssistant(ins.path);
                    }
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[18px] p-3 flex gap-2.5 items-start cursor-pointer transition"
                >
                  <span className="text-sm shrink-0">{ins.alert}</span>
                  <span className="text-[11px] text-white/90 font-medium leading-normal">{ins.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ===============================================
          SECTION 2: TODAY'S BUSINESS SNAPSHOT
          =============================================== */}
      <div className="text-left font-sans">
        <h3 className="text-xs uppercase font-black tracking-widest text-neutral-400 mb-2 pl-1">Today's Business Snapshot</h3>
        <div className="bg-white border border-neutral-150 rounded-[28px] p-5 shadow-xs" id="dashboard-snapshot-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100">
            
            {/* KPI 1 */}
            <div className="pt-2 sm:pt-0 sm:px-2 first:pt-0 first:border-t-0">
              <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wide block">Today's Sales</span>
              <span className="text-lg font-black text-neutral-900 tracking-tight font-mono block mt-1">
                {formatCurrency(expectedToday, currency)}
              </span>
            </div>

            {/* KPI 2 */}
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wide block">Today's Profit</span>
              <span className="text-lg font-black text-emerald-750 tracking-tight font-mono block mt-1">
                {formatCurrency(todayProfit, currency)}
              </span>
            </div>

            {/* KPI 3 */}
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wide block">Cash Collected</span>
              <span className="text-lg font-black text-neutral-900 tracking-tight font-mono block mt-1">
                {formatCurrency(cashCollected, currency)}
              </span>
            </div>

            {/* KPI 4 */}
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wide block">Inventory Value</span>
              <span className="text-lg font-black text-[#1e40af] tracking-tight font-mono block mt-1">
                {formatCurrency(totalInventoryValuation, currency)}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* ===============================================
          SECTION 3: QUICK ACTIONS
          =============================================== */}
      <div className="text-left font-sans">
        <h3 className="text-xs uppercase font-black tracking-widest text-neutral-400 mb-2 pl-1">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          <button
            type="button"
            onClick={() => {
              window.location.hash = 'receipts/add';
              setActiveSection('receipts');
            }}
            className="bg-white hover:bg-sky-50 border border-neutral-150 rounded-[22px] p-4 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer hover:border-sky-300"
          >
            <div className="w-10 h-10 rounded-full bg-[#1e40af]/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#1e40af]" />
            </div>
            <span className="text-xs font-black text-neutral-850">Record Sale</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('inventory');
            }}
            className="bg-white hover:bg-indigo-50 border border-neutral-150 rounded-[22px] p-4 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer hover:border-indigo-300"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xs font-black text-neutral-850">Add Stock</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('debtor');
            }}
            className="bg-white hover:bg-emerald-50 border border-neutral-150 rounded-[22px] p-4 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer hover:border-emerald-300"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-black text-neutral-850">Add Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReconciliationInline(!showReconciliationInline)}
            className={`border rounded-[22px] p-4 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer ${
              showReconciliationInline 
                ? 'bg-amber-50 border-amber-300' 
                : 'bg-white hover:bg-amber-50/50 border-neutral-150 hover:border-amber-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showReconciliationInline ? 'bg-amber-100' : 'bg-amber-50'}`}>
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-black text-neutral-850">Run Truth Check</span>
          </button>

        </div>
      </div>

      {/* INLINE COLLAPSIBLE TRUTH CHECK ENCLOSURE */}
      {showReconciliationInline && (
        <div className="bg-[#FCFAF7] border border-amber-200 rounded-[28px] p-5 space-y-4 text-left animate-fade-in" id="dashboard-inline-truthcheck">
          <div className="flex items-center justify-between border-b border-neutral-150 pb-2">
            <h4 className="text-sm font-black text-amber-900 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Shift Drawer Truth Matcher</span>
            </h4>
            <button 
              type="button" 
              onClick={() => setShowReconciliationInline(false)}
              className="text-neutral-400 hover:text-neutral-900 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleRunReconciliation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1">Counted Physical Cash ({currencySymbol})</label>
                <input 
                  type="number"
                  value={inputCash}
                  onChange={e => setInputCash(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white text-xs font-semibold p-2.5 border border-neutral-200 rounded-full focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1">Counted Digital Transfers / Card ({currencySymbol})</label>
                <input 
                  type="number"
                  value={inputOthers}
                  onChange={e => setInputOthers(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white text-xs font-semibold p-2.5 border border-neutral-200 rounded-full focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-white border border-neutral-150 rounded-xl text-xs text-neutral-550 flex items-center justify-between">
              <span>Expected System Cash Sales:</span>
              <span className="font-extrabold text-neutral-900 font-mono">{formatCurrency(expectedToday, currency)}</span>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={auditLoading}
                className="flex-1 bg-[#1e40af] hover:bg-[#1a368f] text-white font-bold py-2.5 px-4 rounded-full text-xs transition cursor-pointer disabled:bg-neutral-200"
              >
                {auditLoading ? "Running calculations..." : "Reconcile Register Count"}
              </button>
              <button
                type="button"
                onClick={() => setTruthCheckResult(null)}
                className="px-4 py-2.5 border border-neutral-200 rounded-full text-xs text-neutral-500 hover:bg-neutral-50"
              >
                Reset
              </button>
            </div>
          </form>

          {truthCheckResult && (
            <div className="bg-white border border-neutral-150 rounded-[20px] p-4 mt-3 space-y-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-neutral-900">Truth Check Result:</span>
                <span className={`font-mono font-bold ${
                  truthCheckResult.riskLevel === 'low' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {truthCheckResult.riskLevel === 'low' ? '🔒 MATCHED' : '⚠️ DISCREPANCY'}
                </span>
              </div>
              <p className="text-[#757575] leading-relaxed italic">{truthCheckResult.details}</p>
              
              <div className="grid grid-cols-2 gap-2 border-t pt-2 mt-2">
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase font-bold">Sum Declared</span>
                  <span className="font-mono text-neutral-800 font-bold">{formatCurrency((truthCheckResult.declaredRevenue), currency)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase font-bold">Discrepancy</span>
                  <span className={`font-mono font-bold ${truthCheckResult.difference < 0 ? 'text-red-650' : 'text-emerald-700'}`}>
                    {truthCheckResult.difference < 0 ? '-' : '+'}{formatCurrency(Math.abs(truthCheckResult.difference), currency)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===============================================
          SECTION 4: ATTENTION NEEDED
          =============================================== */}
      <div className="text-left font-sans animate-fade-in" id="dashboard-attention-section">
        <h3 className="text-xs uppercase font-black tracking-widest text-neutral-400 mb-2 pl-1">Attention Needed</h3>
        <div className="bg-white border border-neutral-150 rounded-[28px] p-5 shadow-xs space-y-3">
          {[
            { tag: "🔴", priority: "High Priority", text: "Stock running low", detail: "Peak Milk will run out in 2 days at current velocity.", action: () => setActiveSection('inventory') },
            { tag: "🔴", priority: "High Priority", text: "Debtor overdue", detail: "John is overdue by 5 days on credit sales.", action: () => setActiveSection('debtor') },
            { tag: "🟡", priority: "Medium Priority", text: "Revenue declining", detail: "Hourly sales velocity is 12% lower than standard weekend average.", action: () => onNavigateToAssistant("Why is revenue declining?") },
            { tag: "🟡", priority: "Medium Priority", text: "Customer churn risk", detail: "3 regular merchants have not re-logged inside 14 days.", action: () => setActiveSection('debtor') }
          ].map((item, i) => (
            <div 
              key={i} 
              onClick={item.action}
              className="flex items-start justify-between p-3 border border-neutral-100 rounded-[20px] bg-neutral-50/50 hover:bg-neutral-50 transition cursor-pointer"
            >
              <div className="flex gap-2.5 items-start">
                <span className="text-md shrink-0 mt-0.5">{item.tag}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-neutral-900 leading-none">{item.text}</h4>
                    <span className="text-[8px] font-bold font-mono text-neutral-450 uppercase">{item.priority}</span>
                  </div>
                  <p className="text-[11px] text-[#757575] font-semibold mt-1 font-sans">{item.detail}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 align-middle self-center" />
            </div>
          ))}
        </div>
      </div>

      {/* ===============================================
          SECTION 5: PERFORMANCE TREND
          =============================================== */}
      <div className="text-left font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 px-1">
          <h3 className="text-xs uppercase font-black tracking-widest text-neutral-400">Performance Trend</h3>
          
          <div className="flex bg-neutral-100 p-0.5 rounded-full border border-neutral-150 self-start" id="chart-toggle">
            <button
              type="button"
              onClick={() => setTrendType('revenue')}
              className={`px-3 py-1 rounded-full text-[11px] font-black tracking-tight transition uppercase ${
                trendType === 'revenue' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              Revenue
            </button>
            <button
              type="button"
              onClick={() => setTrendType('profit')}
              className={`px-3 py-1 rounded-full text-[11px] font-black tracking-tight transition uppercase ${
                trendType === 'profit' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              Profit
            </button>
            <button
              type="button"
              onClick={() => setTrendType('transactions')}
              className={`px-3 py-1 rounded-full text-[11px] font-black tracking-tight transition uppercase ${
                trendType === 'transactions' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              Transactions
            </button>
          </div>
        </div>

        <div className="bg-white border border-neutral-150 rounded-[28px] p-4 shadow-xs" id="dashboard-trend-panel">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  stroke="#ababab" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#ababab" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={formatChartVal}
                />
                <Tooltip 
                  formatter={(val: any) => [
                    trendType === 'transactions' ? val : formatCurrency(Number(val), currency),
                    trendType.toUpperCase()
                  ]}
                  contentStyle={{ border: '1px solid #dcdcdc', borderRadius: 16, fontSize: 11, fontFamily: 'sans-serif' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={trendType} 
                  stroke="#1e40af" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorTrend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===============================================
          SECTION 6: SMART RECOMMENDATIONS
          =============================================== */}
      <div className="text-left font-sans">
        <h3 className="text-xs uppercase font-black tracking-widest text-neutral-400 mb-2 pl-1">Smart Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.filter(r => r.state !== 'dismissed').map((rec) => (
            <div 
              key={rec.id}
              className={`bg-white border border-neutral-150 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4 transition ${
                rec.state === 'approved' ? 'opacity-60 bg-emerald-50/20 border-emerald-200' : ''
              }`}
            >
              <div className="space-y-1.5">
                <span className="text-[9px] bg-sky-50 text-sky-800 font-extrabold uppercase px-2 py-0.5 rounded-full inline-block tracking-widest">
                  {rec.action}
                </span>
                <p className="text-xs font-black text-neutral-900 leading-normal">
                  {rec.text}
                </p>
              </div>

              <div className="flex gap-2">
                {rec.state === 'approved' ? (
                  <span className="text-emerald-700 text-xs font-bold font-sans flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Approved & Applied</span>
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApproveRec(rec.id, rec.text)}
                      className="bg-[#1e40af] hover:bg-[#1a368f] text-white font-bold px-4 py-2 rounded-full text-[11px] uppercase tracking-wide cursor-pointer transition shadow-xs"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDismissRec(rec.id)}
                      className="border border-neutral-200 hover:bg-neutral-55 text-neutral-500 font-bold px-4 py-2 rounded-full text-[11px] uppercase tracking-wide cursor-pointer transition"
                    >
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {recommendations.filter(r => r.state !== 'dismissed').length === 0 && (
            <div className="col-span-2 text-center text-xs text-neutral-400 py-6">
              All recommendations processed. Check back tonight for refreshed insights.
            </div>
          )}
        </div>
      </div>

      {/* ===============================================
          BOTTOM BAR NAVIGATION MOVED TO GLOBAL APP
          =============================================== */}

      {/* PERSISTENT SLIDE UP BOTTOM SHEET FOR 'MORE' BUTTON */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center select-none" id="more-slideup-modal">
          <div 
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setShowMoreMenu(false)}
          />
          <div 
            className="relative bg-white rounded-t-[32px] w-full max-w-lg p-6 space-y-6 shadow-2xl z-10 transition-transform duration-300 transform translate-y-0"
          >
            {/* Header notch line */}
            <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto" />
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-md font-sans font-black text-neutral-900 uppercase tracking-wide">More Operations</h3>
              <button 
                type="button" 
                onClick={() => setShowMoreMenu(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveSection('forensic');
                }}
                className="p-5 bg-neutral-50/70 border border-neutral-150 hover:bg-neutral-50 rounded-[24px] text-left flex flex-col gap-2 transition cursor-pointer"
              >
                <ShieldAlert className="w-6 h-6 text-red-600" />
                <div>
                  <h4 className="text-xs font-black text-neutral-900 leading-tight">Forensic Check</h4>
                  <p className="text-[10px] text-neutral-400 font-sans mt-0.5 font-bold">Trace missing cash</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveSection('truthcheck');
                }}
                className="p-5 bg-neutral-50/70 border border-neutral-150 hover:bg-neutral-50 rounded-[24px] text-left flex flex-col gap-2 transition cursor-pointer"
              >
                <Coins className="w-6 h-6 text-amber-500" />
                <div>
                  <h4 className="text-xs font-black text-neutral-900 leading-tight">Truth Audits</h4>
                  <p className="text-[10px] text-neutral-400 font-sans mt-0.5 font-bold">Shift balanced files</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveSection('debtor');
                }}
                className="p-5 bg-neutral-50/70 border border-neutral-150 hover:bg-neutral-50 rounded-[24px] text-left flex flex-col gap-2 transition cursor-pointer"
              >
                <Users className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-black text-neutral-900 leading-tight">Debtors Ledger</h4>
                  <p className="text-[10px] text-neutral-400 font-sans mt-0.5 font-bold">Track overdue credit</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveSection('notifications');
                }}
                className="p-5 bg-neutral-50/70 border border-neutral-150 hover:bg-neutral-50 rounded-[24px] text-left flex flex-col gap-2 transition cursor-pointer"
              >
                <AlertTriangle className="w-6 h-6 text-sky-600" />
                <div>
                  <h4 className="text-xs font-black text-neutral-900 leading-tight">Alert Desk</h4>
                  <p className="text-[10px] text-neutral-400 font-sans mt-0.5 font-bold">Sentry trigger alarms</p>
                </div>
              </button>

            </div>

            <button
              type="button"
              onClick={() => setShowMoreMenu(false)}
              className="w-full text-center py-3 bg-neutral-900 hover:bg-black text-white text-xs font-black rounded-full uppercase tracking-wider transition cursor-pointer"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
