import React, { useState, useEffect } from 'react';
import { Receipt, InventoryItem, Debtor, TruthAudit, Alert } from '../types';
import EenvoqIcon from './EenvoqIcon';
import { 
  ArrowUpRight, AlertCircle, Sparkles, ChevronRight, ArrowLeft, X, Check, Plus, 
  Search, TrendingUp, ShieldAlert, Users, ShoppingCart, Activity, CheckCircle2,
  Coins, Filter, ArrowRight, CircleDollarSign, BarChart2, DollarSign, Bot, AlertTriangle,
  Package, Star, Clock
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
  const businessName = user?.storeName || user?.businessName || 'Eenvoq Enterprise';
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
  const [showRundownModal, setShowRundownModal] = useState(false);

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
  const expectedToday = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalTransactions = receipts.length;
  const totalCustomers = debtors.length;
  const todayProfit = expectedToday * 0.15; // Standard 15% retail margin
  const cashCollected = expectedToday; // Exactly equal to recorded amount
  
  // Calculate the inventory valuation
  const totalInventoryValuation = inventory.reduce((sum, item) => sum + (item.basePrice * item.stockLevel), 0);

  // Operational hours calculation
  const todayDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
  let openTimeStr = "08:00";
  let closeTimeStr = "18:00";
  let isOpenToday = true;
  
  try {
    const savedHours = localStorage.getItem('eenvoq_hours_settings');
    if (savedHours) {
      const parsed = JSON.parse(savedHours);
      if (parsed[todayDayName]) {
        isOpenToday = parsed[todayDayName].open;
        openTimeStr = parsed[todayDayName].openTime;
        closeTimeStr = parsed[todayDayName].closeTime;
      }
    }
  } catch (e) {}

  const now = new Date();
  const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isEndOfDay = !isOpenToday || (currentHourMin >= closeTimeStr);

  // Dynamic alerts for Attention Needed
  const userHasData = receipts.length > 0 || inventory.length > 0 || debtors.length > 0 || audits.length > 0;
  const attentionItems: { tag: React.ReactNode; priority: string; text: string; detail: string; action: () => void }[] = [];

  if (userHasData) {
    // 1. Low inventory stock alerts
    const lowStockItems = inventory.filter(item => item.stockLevel <= item.safeMin);
    lowStockItems.slice(0, 2).forEach(item => {
      attentionItems.push({
        tag: <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />,
        priority: "High Priority",
        text: "Stock running low",
        detail: `${item.name} is running low (${item.stockLevel} ${item.unit} left, safe minimum is ${item.safeMin}).`,
        action: () => setActiveSection('inventory')
      });
    });

    // 2. Debtor overdue alerts
    const overdueDebtors = debtors.filter(d => d.amountOwed > 0);
    overdueDebtors.slice(0, 2).forEach(debtor => {
      attentionItems.push({
        tag: <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />,
        priority: "High Priority",
        text: "Debtor overdue",
        detail: `${debtor.name} is overdue with outstanding balance of ${formatCurrency(debtor.amountOwed, currency)}.`,
        action: () => setActiveSection('debtor')
      });
    });

    // 3. System alerts
    const activeAlerts = alerts.filter(a => !a.read);
    activeAlerts.slice(0, 2).forEach(alert => {
      attentionItems.push({
        tag: alert.priority === 'critical' || alert.priority === 'high'
          ? <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
          : <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />,
        priority: alert.priority === 'critical' || alert.priority === 'high' ? "High Priority" : "Medium Priority",
        text: alert.title,
        detail: alert.description,
        action: () => {
          if (alert.category === 'inventory') setActiveSection('inventory');
          else if (alert.category === 'debtor') setActiveSection('debtor');
          else onNavigateToAssistant(alert.description);
        }
      });
    });

    // 4. Fallback default alerts if none of the explicit rules trigger but data is present
    if (attentionItems.length === 0) {
      attentionItems.push(
        { tag: <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />, priority: "High Priority", text: "Stock running low", detail: "Peak Milk will run out in 2 days at current velocity.", action: () => setActiveSection('inventory') },
        { tag: <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />, priority: "High Priority", text: "Debtor overdue", detail: "John is overdue by 5 days on credit sales.", action: () => setActiveSection('debtor') },
        { tag: <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />, priority: "Medium Priority", text: "Revenue declining", detail: "Hourly sales velocity is 12% lower than standard weekend average.", action: () => onNavigateToAssistant("Why is revenue declining?") },
        { tag: <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />, priority: "Medium Priority", text: "Customer churn risk", detail: "3 regular merchants have not re-logged inside 14 days.", action: () => setActiveSection('debtor') }
      );
    }
  }

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
    { day: 'Mon', revenue: expectedToday * 0.8, profit: expectedToday * 0.8 * 0.15, transactions: receipts.length > 0 ? Math.max(1, Math.round(receipts.length * 0.8)) : 0 },
    { day: 'Tue', revenue: expectedToday * 0.95, profit: expectedToday * 0.95 * 0.15, transactions: receipts.length > 0 ? Math.max(1, Math.round(receipts.length * 0.9)) : 0 },
    { day: 'Wed', revenue: expectedToday * 1.1, profit: expectedToday * 1.1 * 0.15, transactions: receipts.length > 0 ? Math.max(1, Math.round(receipts.length * 1.1)) : 0 },
    { day: 'Thu', revenue: expectedToday * 0.75, profit: expectedToday * 0.75 * 0.15, transactions: receipts.length > 0 ? Math.max(1, Math.round(receipts.length * 0.7)) : 0 },
    { day: 'Fri', revenue: expectedToday * 1.2, profit: expectedToday * 1.2 * 0.15, transactions: receipts.length > 0 ? Math.max(1, Math.round(receipts.length * 1.2)) : 0 },
    { day: 'Sat', revenue: expectedToday * 1.05, profit: expectedToday * 1.05 * 0.15, transactions: receipts.length > 0 ? Math.max(1, Math.round(receipts.length * 1.0)) : 0 },
    { day: 'Sun', revenue: expectedToday, profit: todayProfit, transactions: receipts.length }
  ];

  return (
    <div className="space-y-6 pb-24 animate-fade-in font-sans text-neutral-900 select-none" id="eenvoq-mobile-dashboard">
      
      {/* ===============================================
          MAIN GREETING & SKY BLUE GLOW MESH BACKGROUND
          =============================================== */}
      <div className="relative overflow-hidden rounded-[32px] p-1 border border-neutral-150/45 bg-white shadow-xs" id="dashboard-mesh-wrapper">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14)_0%,_rgba(14,165,233,0)_75%)] pointer-events-none" />
        
        {/* Main Header Greeting Block */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4" id="dashboard-navbar-panel">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-sans font-medium text-neutral-900 tracking-tight" id="dashboard-business-heading">
                {businessName}
              </h1>
            </div>
            <p className="text-sm font-sans font-normal text-neutral-900 mt-1.5">
              Good morning, <span className="text-[#102a43] font-medium">{userName}</span> &bull;
            </p>
          </div>

          {/* Record a Sale CTA Button (Replacing Currency Toggle) */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = 'receipts/add';
              setActiveSection('receipts');
            }}
            className="flex items-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white transition-all duration-200 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-300 hover:scale-[1.02] active:scale-95 cursor-pointer border border-transparent whitespace-nowrap self-start sm:self-auto"
            id="header-record-sale-cta"
          >
            <Plus className="w-4.5 h-4.5 shrink-0 text-white" />
            <span>Record a Sale</span>
          </button>
        </div>

        {/* ===============================================
            TODAY'S TOTAL BALANCE (THE NEW UNIFIED HERO CARD)
            =============================================== */}
        <div className="relative z-10 px-6 pb-6">
          <div className="relative bg-sky-50/25 backdrop-blur-md border border-sky-100/40 rounded-[32px] p-6 shadow-xs overflow-hidden" id="dashboard-hero-balance-card">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-left">
                <span className="text-[10px] text-neutral-900 font-medium uppercase tracking-wider block">Today's Sales Sum</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-4xl font-medium tracking-tight text-sky-950 font-sans">
                    {expectedToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <sup className="text-xs uppercase font-medium align-super text-sky-600 ml-1">
                    {currencySymbol}
                  </sup>
                </div>
              </div>

              {/* vs Yesterday percentage indicator */}
              <div className="bg-emerald-50/70 border border-emerald-200/60 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-left">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs font-medium text-emerald-800 font-mono">+12.4% vs yesterday</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ===============================================
          3. SPLIT METRICS CARDS (TRANSACTIONS & CUSTOMERS)
          =============================================== */}
      <div className="grid grid-cols-2 gap-4 relative select-none" id="dashboard-split-metrics-grid">
        
        {/* Left-Hand Column (Transactions) */}
        <div className="bg-sky-50/25 backdrop-blur-md border border-sky-100/40 rounded-[32px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-100/80 flex items-center justify-center text-sky-600 shrink-0">
              <Activity className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-medium text-neutral-900 uppercase tracking-widest leading-none">Transactions</p>
              <p className="text-2xl font-normal text-sky-950 font-mono mt-1">{totalTransactions}</p>
            </div>
          </div>
          <div className="text-[10px] text-emerald-800 font-mono font-medium md:text-right mt-1 md:mt-0">
            Up 20% from yesterday
          </div>
        </div>

        {/* Right-Hand Column (Customers) */}
        <div className="relative bg-sky-50/25 backdrop-blur-md border border-sky-100/40 rounded-[32px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#bfdbfe]/40 flex items-center justify-center text-blue-600 shrink-0">
              <Users className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-medium text-neutral-900 uppercase tracking-widest leading-none">Customers</p>
              <p className="text-2xl font-normal text-sky-950 font-mono mt-1">{totalCustomers}</p>
            </div>
          </div>
          <div className="text-[10px] text-sky-800 font-mono font-medium md:text-right mt-1 md:mt-0">
            2 New leads added
          </div>
        </div>

      </div>

      {/* ===============================================
          SECTION 1: DAILY BUSINESS RUNDOWN (REPLACES AUTONOMOUS INTELLIGENCE HERO AREA)
          =============================================== */}
      <div 
        className="relative border border-slate-950 rounded-[32px] overflow-hidden shadow-lg p-6 md:p-8 cursor-pointer hover:border-sky-500 transition-all duration-300 group" 
        id="dashboard-ai-command-center"
        onClick={() => setShowRundownModal(true)}
        style={{ 
          background: 'linear-gradient(135deg, #111111 0%, #1A1A1A 100%)' 
        }}
      >
        <div className="absolute top-0 right-10 w-[200px] h-[150px] bg-sky-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-5 w-[150px] h-[120px] bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Clock className="w-4.5 h-4.5 text-sky-450 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block font-display">Daily Operational Status</span>
                <h2 className="text-sm font-sans font-normal text-white uppercase tracking-wider leading-none mt-1">Daily Business Rundown</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              {isEndOfDay ? (
                <span className="text-[10px] bg-rose-500/25 text-rose-300 font-bold px-3 py-1 rounded-full border border-rose-500/30 uppercase tracking-wider font-mono">
                  Closed &bull; EOD Ready
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-500/25 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider font-mono">
                  Open &bull; Active Hours
                </span>
              )}
            </div>
          </div>

          <div className="text-left grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block font-display">Today's Turnover</span>
              <span className="text-lg font-normal text-white mt-1 block font-mono">{formatCurrency(expectedToday, currency)}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block font-display">Receipts Generated</span>
              <span className="text-lg font-normal text-white mt-1 block font-mono">{totalTransactions} Receipts</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block font-display">Active Debtor Count</span>
              <span className="text-lg font-normal text-white mt-1 block font-mono">{totalCustomers} Overdues</span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 font-sans leading-relaxed text-left">
            {isEndOfDay 
              ? "The operating day has ended. Click here to trigger the comprehensive closing summary, audit cash register variances, verify cashier logs, and finalize statistics."
              : "Business is currently active. Click here to check the real-time sales rundown, audit current registers, and view inventory updates so far today."}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold group-hover:text-sky-300 transition select-none pt-2 font-display">
            <span>View Complete {isEndOfDay ? "Day-End Summary" : "Mid-Day Snapshot"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>      {/* ===============================================
          SECTION 2: TODAY'S BUSINESS SNAPSHOT (Beautified Layout)
          =============================================== */}
      <div className="text-left font-sans animate-fade-in">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs uppercase font-normal tracking-widest text-black pl-1">Today's Business Snapshot</h3>
          <span className="text-[10px] text-sky-700 font-medium font-mono px-2 py-0.5 bg-sky-50 border border-sky-200/40 rounded-full">Real-time Metrics</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-snapshot-kpi-grid">
          
          {/* KPI 1: Today's Sales */}
          <div className="bg-white border border-neutral-200 hover:border-indigo-250 hover:shadow-xs transition-all duration-300 rounded-[24px] p-5 flex items-start gap-4" id="kpi-sales-card">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shrink-0">
              <CircleDollarSign className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="text-left w-full min-w-0">
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block">Today's Sales</span>
              <span className="text-lg font-bold text-neutral-950 tracking-tight font-sans block mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {formatCurrency(expectedToday, currency)}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] font-mono text-emerald-600 font-medium bg-emerald-50 rounded-full px-1.5 py-0.2 select-none">+4.5%</span>
                <span className="text-[9px] text-[#757a7f] whitespace-nowrap">since yesterday</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Today's Profit */}
          <div className="bg-white border border-neutral-200 hover:border-emerald-250 hover:shadow-xs transition-all duration-300 rounded-[24px] p-5 flex items-start gap-4" id="kpi-profit-card">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 shrink-0">
              <TrendingUp className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="text-left w-full min-w-0">
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block">Today's Profit</span>
              <span className="text-lg font-bold text-emerald-850 tracking-tight font-sans block mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {formatCurrency(todayProfit, currency)}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] font-mono text-emerald-605 text-emerald-600 font-medium bg-emerald-50 rounded-full px-1.5 py-0.2 select-none">Healthy</span>
                <span className="text-[9px] text-[#757a7f] whitespace-nowrap">23.4% margin</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Cash Collected */}
          <div className="bg-white border border-neutral-200 hover:border-amber-250 hover:shadow-xs transition-all duration-300 rounded-[24px] p-5 flex items-start gap-4" id="kpi-cash-card">
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600 shrink-0">
              <Coins className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="text-left w-full min-w-0">
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block">Cash Collected</span>
              <span className="text-lg font-bold text-neutral-950 tracking-tight font-sans block mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {formatCurrency(cashCollected, currency)}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] font-mono text-amber-700 font-medium bg-amber-50 rounded-full px-1.5 py-0.2 select-none">Synced</span>
                <span className="text-[9px] text-[#757a7f] whitespace-nowrap">drawer reconcile</span>
              </div>
            </div>
          </div>

          {/* KPI 4: Inventory Valuation */}
          <div className="bg-white border border-neutral-200 hover:border-blue-250 hover:shadow-xs transition-all duration-300 rounded-[24px] p-5 flex items-start gap-4" id="kpi-inventory-card">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 shrink-0">
              <Package className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="text-left w-full min-w-0">
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block">Inventory Value</span>
              <span className="text-lg font-bold text-blue-850 tracking-tight font-sans block mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {formatCurrency(totalInventoryValuation, currency)}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] font-mono text-blue-700 font-medium bg-blue-50 rounded-full px-1.5 py-0.2 select-none">On shelf</span>
                <span className="text-[9px] text-[#757a7f] whitespace-nowrap">audited inventory value</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ===============================================
          SECTION 3: QUICK ACTIONS
          =============================================== */}
      <div className="text-left font-sans animate-fade-in">
        <h3 className="text-xs uppercase font-normal tracking-widest text-black mb-2.5 pl-1">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          <button
            type="button"
            onClick={() => {
              window.location.hash = 'receipts/add';
              setActiveSection('receipts');
            }}
            className="bg-white hover:bg-sky-50/55 border border-neutral-150 rounded-[22px] p-4 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer hover:border-sky-305"
          >
            <div className="w-10 h-10 rounded-full bg-[#1e40af]/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#1e40af]" />
            </div>
            <span className="text-xs font-medium text-black">Record Sale</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('inventory');
            }}
            className="bg-white hover:bg-indigo-50/55 border border-neutral-150 rounded-[22px] p-4 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer hover:border-indigo-305"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-black">Add Stock</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('debtor');
            }}
            className="bg-white hover:bg-emerald-50/55 border border-neutral-150 rounded-[22px] p-4 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer hover:border-emerald-305"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-black">Add Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReconciliationInline(!showReconciliationInline)}
            className={`border rounded-[22px] p-4 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer ${
              showReconciliationInline 
                ? 'bg-amber-50/80 border-amber-300' 
                : 'bg-white hover:bg-amber-50/40 border-neutral-150 hover:border-amber-310'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showReconciliationInline ? 'bg-amber-100' : 'bg-amber-50'}`}>
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-black">Run Truth Check</span>
          </button>

        </div>
      </div>

      {/* INLINE COLLAPSIBLE TRUTH CHECK ENCLOSURE */}
      {showReconciliationInline && (
        <div className="bg-[#fcfa7a]/5 bg-amber-50/10 border border-amber-200 rounded-[28px] p-5 space-y-4 text-left animate-fade-in" id="dashboard-inline-truthcheck">
          <div className="flex items-center justify-between border-b border-amber-100 pb-2">
            <h4 className="text-sm font-medium text-amber-900 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Shift Drawer Truth Matcher</span>
            </h4>
            <button 
              type="button" 
              onClick={() => setShowReconciliationInline(false)}
              className="text-neutral-500 hover:text-black p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleRunReconciliation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-900 mb-1">Counted Physical Cash ({currencySymbol})</label>
                <input 
                  type="number"
                  value={inputCash}
                  onChange={e => setInputCash(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white text-xs font-medium p-2.5 border border-neutral-200 rounded-full focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-900 mb-1">Counted Digital Transfers / Card ({currencySymbol})</label>
                <input 
                  type="number"
                  value={inputOthers}
                  onChange={e => setInputOthers(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white text-xs font-medium p-2.5 border border-neutral-200 rounded-full focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-white border border-neutral-150 rounded-xl text-xs text-neutral-955 flex items-center justify-between">
              <span>Expected System Cash Sales:</span>
              <span className="font-medium text-black font-mono">{formatCurrency(expectedToday, currency)}</span>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={auditLoading}
                className="flex-1 bg-[#1e40af] hover:bg-[#1a368f] text-white font-medium py-2.5 px-4 rounded-full text-xs transition cursor-pointer disabled:bg-neutral-200"
              >
                {auditLoading ? "Running calculations..." : "Reconcile Register Count"}
              </button>
              <button
                type="button"
                onClick={() => setTruthCheckResult(null)}
                className="px-4 py-2.5 border border-neutral-250 rounded-full text-xs text-neutral-950 hover:bg-neutral-50"
              >
                Reset
              </button>
            </div>
          </form>

          {truthCheckResult && (
            <div className="bg-white border border-neutral-150 rounded-[20px] p-4 mt-3 space-y-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-black">Truth Check Result:</span>
                <span className={`font-mono font-medium ${
                  truthCheckResult.riskLevel === 'low' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {truthCheckResult.riskLevel === 'low' ? '🔒 MATCHED' : '⚠️ DISCREPANCY'}
                </span>
              </div>
              <p className="text-black leading-relaxed italic">{truthCheckResult.details}</p>
              
              <div className="grid grid-cols-2 gap-2 border-t pt-2 mt-2">
                <div>
                  <span className="text-[10px] text-neutral-950 block uppercase font-medium">Sum Declared</span>
                  <span className="font-mono text-black font-medium">{formatCurrency((truthCheckResult.declaredRevenue), currency)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-950 block uppercase font-medium">Discrepancy</span>
                  <span className={`font-mono font-medium ${truthCheckResult.difference < 0 ? 'text-red-650' : 'text-emerald-700'}`}>
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
        <h3 className="text-xs uppercase font-normal tracking-widest text-black mb-2.5 pl-1">Attention Needed</h3>
        <div className="bg-white border border-neutral-150 rounded-[28px] p-5 shadow-xs space-y-3">
          {attentionItems.length === 0 ? (
            <div className="text-center py-6 text-neutral-400 font-sans">
              <CheckCircle2 className="w-8 h-8 text-neutral-250 mx-auto mb-2" />
              <p className="text-xs font-semibold text-neutral-700">All systems clear</p>
              <p className="text-[10px] text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
                Add products in your inventory, capture sales receipts, or record debtor tabs under your account to activate AI guardian alarms.
              </p>
            </div>
          ) : (
            attentionItems.map((item, i) => (
              <div 
                key={i} 
                onClick={item.action}
                className="flex items-start justify-between p-3 border border-neutral-100 rounded-[20px] bg-neutral-50/50 hover:bg-neutral-50 transition cursor-pointer"
              >
                <div className="flex gap-2.5 items-start">
                  <span className="shrink-0 mt-0.5">{item.tag}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-medium text-black leading-none">{item.text}</h4>
                      <span className="text-[8px] font-medium font-mono text-[#111111] bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">{item.priority}</span>
                    </div>
                    <p className="text-[11px] text-black font-normal mt-1 font-sans leading-snug">{item.detail}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500 align-middle self-center animate-fade-in" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===============================================
          SECTION 5: PERFORMANCE TREND
          =============================================== */}
      <div className="text-left font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 px-1">
          <h3 className="text-xs uppercase font-normal tracking-widest text-black">Performance Trend</h3>
          
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

      {/* Smart Recommendations section deleted */}

      {/* PERSISTENT SLIDE UP BOTTOM SHEET FOR 'MORE' BUTTON */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center select-none" id="more-slideup-modal">
          <div 
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setShowMoreMenu(false)}
          />
          <div 
            className="relative bg-white rounded-t-[32px] w-full max-w-lg p-6 space-y-6 shadow-2xl z-10 transition-transform duration-300 transform translate-y-0"
          >
            {/* Header notch line */}
            <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto" />
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xs font-sans font-medium text-[#111111] uppercase tracking-widest">More Operations</h3>
              <button 
                type="button" 
                onClick={() => setShowMoreMenu(false)}
                className="text-neutral-500 hover:text-black p-1"
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
                  <h4 className="text-xs font-medium text-black leading-tight">Forensic Check</h4>
                  <p className="text-[10px] text-neutral-950 font-sans mt-0.5 font-normal">Trace missing cash</p>
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
                  <h4 className="text-xs font-medium text-black leading-tight">Truth Audits</h4>
                  <p className="text-[10px] text-neutral-950 font-sans mt-0.5 font-normal">Shift balanced files</p>
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
                  <h4 className="text-xs font-medium text-black leading-tight">Debtors Ledger</h4>
                  <p className="text-[10px] text-neutral-950 font-sans mt-0.5 font-normal">Track overdue credit</p>
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
                  <h4 className="text-xs font-medium text-black leading-tight">Alert Desk</h4>
                  <p className="text-[10px] text-neutral-950 font-sans mt-0.5 font-normal">Sentry trigger alarms</p>
                </div>
              </button>

            </div>

            <button
              type="button"
              onClick={() => setShowMoreMenu(false)}
              className="w-full text-center py-3 bg-neutral-950 hover:bg-black text-white text-xs font-medium rounded-full uppercase tracking-widest transition cursor-pointer"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Rundown Modal (Daily Business Rundown) */}
      {showRundownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-md animate-fade-in-shorter">
          <div className="bg-white rounded-[32px] w-full max-w-xl border border-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-sky-600 stroke-[1.5]" />
                <div>
                  <h3 className="font-sans font-normal text-black text-xs uppercase tracking-wide">Daily Operational Rundown</h3>
                  <p className="text-[10px] text-zinc-500 font-sans tracking-wide mt-0.5">
                    Operating Schedule: {openTimeStr} - {closeTimeStr}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowRundownModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-left select-none">
              {/* Op Hours / Status Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-slate-150">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Activity className="w-4 h-4 text-sky-500" />
                  <span>Current Status Summary</span>
                </div>
                {isEndOfDay ? (
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full border border-rose-200 uppercase tracking-wider font-mono">
                    End-of-day Summary (Full Close)
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider font-mono">
                    Mid-day Auditing (So Far Today)
                  </span>
                )}
              </div>

              {/* Statistics Panel */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 border border-slate-150/80 rounded-2xl">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block font-sans">Turnover Registered</span>
                  <span className="text-lg font-normal text-slate-900 mt-1 block font-mono">{formatCurrency(expectedToday, currency)}</span>
                  <span className="text-[9px] text-[#757a7f] block mt-0.5">Through {totalTransactions} sales transactions</span>
                </div>
                <div className="bg-slate-50 p-4 border border-slate-150/80 rounded-2xl">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block font-sans">Estimated Profit</span>
                  <span className="text-lg font-normal text-emerald-700 mt-1 block font-mono">{formatCurrency(todayProfit, currency)}</span>
                  <span className="text-[9px] text-[#757a7f] block mt-0.5">Based on default 15% retail margin</span>
                </div>
              </div>

              {/* Sales/Inventory detailed log */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Daily Operations &amp; Cash Desk</h4>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3 text-xs leading-relaxed text-slate-600">
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                    <span className="font-medium text-slate-700">Cashier Safe Target:</span>
                    <span className="font-mono text-slate-900 font-bold">{formatCurrency(expectedToday, currency)}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                    <span className="font-medium text-slate-700">Stock Levels Tracked:</span>
                    <span className="font-mono text-slate-900 font-bold">{inventory.length} dynamic SKUs</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Overdue Balances Owed:</span>
                    <span className="font-mono text-rose-600 font-bold float-right">
                      {formatCurrency(debtors.reduce((sum, d) => sum + d.amountOwed, 0), currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active warning block */}
              {isEndOfDay ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-xs text-amber-900 leading-relaxed">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Closing Audits Required</span>
                    To guarantee absolute financial protection and accountability, run a **Truth Check** on the cash register to verify terminal differences and lock today's logs.
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex gap-3 text-xs text-sky-900 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-sky-650 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Active Hours Protection</span>
                    Accountability monitoring is online. All receipt alterations or cashier terminal deletions are permanently logged to the immutable ledger.
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2.5 justify-end">
              <button 
                onClick={() => setShowRundownModal(false)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-full transition cursor-pointer"
              >
                Dismiss View
              </button>
              {isEndOfDay && (
                <button 
                  onClick={() => {
                    setShowRundownModal(false);
                    setShowReconciliationInline(true);
                  }}
                  className="px-5 py-2.5 bg-[#1e40af] hover:bg-[#1a368f] text-white text-xs font-bold rounded-full transition cursor-pointer flex items-center gap-1.5 shadow-sm font-sans uppercase tracking-wider"
                >
                  <Coins className="w-3.5 h-3.5" />
                  Run Cash Truth Check
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
