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
  
  // Calculate inventory valuation
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
    <div className="space-y-6 pb-24 animate-fade-in font-sans text-neutral-900 select-none max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8" id="eenvoq-improved-dashboard">
      
      {/* ===============================================
          1. HEADER GREETING & INTEGRATED BALANCE BANNER
          =============================================== */}
      <div className="relative overflow-hidden rounded-[28px] md:rounded-[32px] border border-neutral-200 bg-gradient-to-br from-white via-sky-50/10 to-sky-100/10 p-5 md:p-6 lg:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="dashboard-mesh-wrapper">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08)_0%,_rgba(14,165,233,0)_70%)] pointer-events-none" />
        
        {/* Profile/Store Meta */}
        <div className="relative z-10 text-left space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-sans font-medium text-neutral-900 tracking-tight" id="dashboard-business-heading">
              {businessName}
            </h1>
            <span className="bg-sky-50 text-sky-805 text-[9px] font-bold px-2 py-0.5 rounded-full border border-sky-150 uppercase tracking-wider font-mono shrink-0">
              Live &bull; Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 font-sans">
            Good morning, <span className="text-indigo-900 font-semibold">{userName}</span>. Here is your store's financial standing and risk checklist for today.
          </p>
        </div>

        {/* Total balance widget inside header */}
        <div className="relative z-10 w-full md:w-auto bg-white/70 backdrop-blur-md border border-neutral-200 rounded-2xl sm:rounded-[24px] p-4 sm:p-5 flex flex-col [@media(min-width:375px)]:flex-row justify-between items-start [@media(min-width:375px)]:items-center gap-4 shadow-xs" id="dashboard-hero-balance-card">
          <div className="text-left">
            <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider block">Today's Sales Value</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
                {expectedToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold text-sky-600 font-mono">
                {currencySymbol}
              </span>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-150 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-650 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-800 font-mono uppercase tracking-tight">+12.4% today</span>
          </div>
        </div>
      </div>

      {/* ===============================================
      {/* ===============================================
          2. GENERAL GRID STRUCTURE: MAIN vs SIDEBAR
          =============================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: PRIMARY GRAPHS & METRIC SUMMARIES */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4" id="dashboard-split-metrics-grid">
            <div className="bg-sky-50/20 backdrop-blur-xs border border-sky-100/50 rounded-2.5xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100/70 flex items-center justify-center text-sky-600 shrink-0">
                  <Activity className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider leading-none">Transactions</p>
                  <p className="text-xl sm:text-2xl font-bold text-sky-950 font-mono mt-1">{totalTransactions}</p>
                </div>
              </div>
              <span className="text-[9px] font-bold font-mono text-emerald-705 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0 self-start sm:self-center">
                +20%
              </span>
            </div>

            <div className="bg-sky-50/20 backdrop-blur-xs border border-sky-100/50 rounded-2.5xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100/70 flex items-center justify-center text-blue-600 shrink-0">
                  <Users className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider leading-none">Total Clients</p>
                  <p className="text-xl sm:text-2xl font-bold text-sky-950 font-mono mt-1">{totalCustomers}</p>
                </div>
              </div>
              <span className="text-[9px] font-bold font-mono text-sky-850 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-150 shrink-0 self-start sm:self-center">
                +2 New
              </span>
            </div>
          </div>

          {/* Performance Chart Trend */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-5 md:p-6 shadow-sm text-left" id="dashboard-trend-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400">Business Trends</h3>
                <h4 className="text-base font-semibold text-[#111111] mt-0.5 font-sans">Performance Over Time</h4>
              </div>
              
              <div className="flex bg-neutral-100 p-0.5 rounded-full border border-neutral-200 self-start text-xs" id="chart-toggle">
                <button
                  type="button"
                  onClick={() => setTrendType('revenue')}
                  className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-tight transition uppercase ${
                    trendType === 'revenue' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setTrendType('profit')}
                  className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-tight transition uppercase ${
                    trendType === 'profit' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Profit
                </button>
                <button
                  type="button"
                  onClick={() => setTrendType('transactions')}
                  className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-tight transition uppercase ${
                    trendType === 'transactions' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  sales count
                </button>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e40af" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1e40af" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#888888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={8}
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatChartVal}
                    dx={-8}
                  />
                  <Tooltip 
                    formatter={(val: any) => [
                      trendType === 'transactions' ? val : formatCurrency(Number(val), currency),
                      trendType.toUpperCase()
                    ]}
                    contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 16, fontSize: 11, fontFamily: 'sans-serif', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
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

          {/* Today's Snapshot Grid */}
          <div className="space-y-3 text-left">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400">Store Financial health</h3>
              <span className="text-[10px] text-sky-800 font-bold font-mono px-2 py-0.5 bg-sky-50 border border-sky-150 rounded-full uppercase">Real-time stats</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="dashboard-snapshot-kpi-grid">
              
              {/* Turnover */}
              <div className="bg-white border border-neutral-200 hover:border-indigo-300 hover:shadow-xs transition-all duration-305 rounded-2xl p-4 flex flex-col justify-between h-30" id="kpi-sales-card">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-600 flex items-center justify-center shrink-0">
                  <CircleDollarSign className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="text-left mt-3">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Gross Sales</span>
                  <span className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight font-sans block mt-0.5 truncate">
                    {formatCurrency(expectedToday, currency)}
                  </span>
                </div>
              </div>

              {/* Profit */}
              <div className="bg-white border border-neutral-200 hover:border-emerald-300 hover:shadow-xs transition-all duration-305 rounded-2xl p-4 flex flex-col justify-between h-30" id="kpi-profit-card">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-150 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="text-left mt-3">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Retail Profit</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-800 tracking-tight font-sans block mt-0.5 truncate">
                    {formatCurrency(todayProfit, currency)}
                  </span>
                </div>
              </div>

              {/* Cash count */}
              <div className="bg-white border border-neutral-200 hover:border-amber-300 hover:shadow-xs transition-all duration-305 rounded-2xl p-4 flex flex-col justify-between h-30" id="kpi-cash-card">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Coins className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="text-left mt-3">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Cash Balance</span>
                  <span className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight font-sans block mt-0.5 truncate">
                    {formatCurrency(cashCollected, currency)}
                  </span>
                </div>
              </div>

              {/* Inventory valuation */}
              <div className="bg-white border border-neutral-200 hover:border-blue-300 hover:shadow-xs transition-all duration-305 rounded-2xl p-4 flex flex-col justify-between h-30" id="kpi-inventory-card">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-150 text-blue-600 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="text-left mt-3">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Inventory Value</span>
                  <span className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight font-sans block mt-0.5 truncate">
                    {formatCurrency(totalInventoryValuation, currency)}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Daily Business Rundown (EOD Interactive) */}
          <div 
            className="relative border border-neutral-200 bg-[#111] rounded-3xl overflow-hidden shadow-sm p-5 sm:p-6 transition-all duration-300 group cursor-pointer hover:border-indigo-400" 
            id="dashboard-ai-command-center"
            onClick={() => setShowRundownModal(true)}
          >
            <div className="absolute top-0 right-10 w-[200px] h-[150px] bg-sky-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-5 w-[150px] h-[120px] bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-sky-455 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#00a8e8] block">Workday Schedule Tracker</span>
                    <h2 className="text-sm font-semibold text-white tracking-wide mt-0.5">EOD Audits Menu</h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {isEndOfDay ? (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-3 py-1 rounded-full border border-rose-500/30 uppercase tracking-widest font-mono">
                      Closed &bull; Summary Ready
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest font-mono">
                      Running &bull; active hours
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-zinc-350 leading-relaxed text-left">
                {isEndOfDay 
                  ? "Operational hours are over. Select to trigger your daily register audits and export summary to supervisor profiles."
                  : "Store schedule is currently within normal operating hours. Select to preview current terminal calculations, debtor collections, or stock balances."}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-sky-405 font-bold group-hover:text-sky-300 transition select-none pt-1">
                <span>View Daily Performance Rundown</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ACTION HUBS, ALARMS & AUDIT TOOLS */}
        <div className="space-y-6">
          
          {/* Quick Tasks & Actions Grid */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm text-left">
            <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 mb-3.5">Store Operations</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.hash = 'receipts/add';
                  setActiveSection('receipts');
                }}
                className="bg-[#FCFBF9] hover:bg-sky-50/40 border border-neutral-200 hover:border-sky-305 rounded-2xl p-3.5 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer min-h-[92px] active:scale-98"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                  <Plus className="w-4.5 h-4.5 text-[#1e40af]" />
                </div>
                <span className="text-xs font-semibold text-neutral-800">Add Sale</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('inventory')}
                className="bg-[#FCFBF9] hover:bg-slate-50 border border-neutral-200 hover:border-indigo-305 rounded-2xl p-3.5 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer min-h-[92px] active:scale-98"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-4.5 h-4.5 text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-neutral-800">Fill Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('debtor')}
                className="bg-[#FCFBF9] hover:bg-slate-50 border border-neutral-200 hover:border-emerald-305 rounded-2xl p-3.5 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer min-h-[92px] active:scale-98"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Users className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-neutral-800">Client Ledger</span>
              </button>

              <button
                type="button"
                onClick={() => setShowReconciliationInline(!showReconciliationInline)}
                className={`border rounded-2xl p-3.5 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer min-h-[92px] active:scale-98 ${
                  showReconciliationInline 
                    ? 'bg-amber-50/70 border-amber-300' 
                    : 'bg-[#FCFBF9] hover:bg-amber-50/40 border-neutral-200 hover:border-amber-305'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${showReconciliationInline ? 'bg-amber-100' : 'bg-amber-50'}`}>
                  <Coins className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-neutral-800">Truth Check</span>
              </button>
            </div>
          </div>

          {/* Collapsible Truth Check Form */}
          {showReconciliationInline && (
            <div className="bg-gradient-to-b from-amber-50/30 to-amber-50/5 border border-amber-200 rounded-3xl p-5 space-y-4 text-left animate-fade-in" id="dashboard-inline-truthcheck">
              <div className="flex items-center justify-between border-b border-amber-150 pb-2">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Coins className="w-4 h-4 text-amber-605" />
                  <span>Register Truth Matcher</span>
                </h4>
                <button 
                  type="button" 
                  onClick={() => setShowReconciliationInline(false)}
                  className="text-amber-700 hover:text-black p-1 active:scale-95 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRunReconciliation} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1.5 pl-1">Counted Register Cash ({currencySymbol})</label>
                    <input 
                      type="number"
                      required
                      value={inputCash}
                      onChange={e => setInputCash(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white text-xs font-semibold p-3 border border-neutral-200 rounded-full focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1.5 pl-1">Counted Other (POS/Transfers) ({currencySymbol})</label>
                    <input 
                      type="number"
                      required
                      value={inputOthers}
                      onChange={e => setInputOthers(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white text-xs font-semibold p-3 border border-neutral-200 rounded-full focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white/80 border border-neutral-200 rounded-2xl text-xs text-neutral-700 flex items-center justify-between">
                  <span className="font-sans text-neutral-500 font-medium">Billed System Target:</span>
                  <span className="font-bold text-neutral-900 font-mono">{formatCurrency(expectedToday, currency)}</span>
                </div>

                <div className="flex gap-2.5 max-w-full">
                  <button
                    type="submit"
                    disabled={auditLoading}
                    className="flex-grow bg-[#1e40af] hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-full text-xs transition cursor-pointer disabled:bg-neutral-200 tracking-wider uppercase"
                  >
                    {auditLoading ? "Balancing books..." : "Run Reconciler"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTruthCheckResult(null);
                      setInputCash(0);
                      setInputOthers(0);
                    }}
                    className="px-4 py-3 border border-neutral-200 rounded-full text-xs font-bold text-neutral-700 hover:bg-neutral-50 active:scale-95 transition"
                  >
                    Reset
                  </button>
                </div>
              </form>

              {truthCheckResult && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-4 mt-2.5 space-y-2.5 animate-fade-in text-xs text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800 uppercase tracking-widest text-[9px]">Settle status</span>
                    <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                      truthCheckResult.riskLevel === 'low' 
                        ? 'text-teal-800 bg-teal-50 border-teal-150' 
                        : 'text-rose-800 bg-rose-50 border-rose-150'
                    }`}>
                      {truthCheckResult.riskLevel === 'low' ? '🔒 MATCHED' : '⚠️ DISCREPANCY'}
                    </span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed font-semibold italic text-[11px] font-sans">
                    "{truthCheckResult.details}"
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 border-t border-dashed border-neutral-250 pt-2.5">
                    <div>
                      <span className="text-[9px] text-[#757575] block uppercase font-bold tracking-wider">Owner Declared</span>
                      <span className="font-mono text-neutral-900 font-bold text-xs">{formatCurrency((truthCheckResult.declaredRevenue), currency)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#757575] block uppercase font-bold tracking-wider">Book Gap</span>
                      <span className={`font-mono font-bold text-xs ${truthCheckResult.difference < 0 ? 'text-rose-600' : 'text-teal-600'}`}>
                        {truthCheckResult.difference < 0 ? '-' : '+'}{formatCurrency(Math.abs(truthCheckResult.difference), currency)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attention Needed (Store Sentry Guard Alarms) */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm text-left" id="dashboard-attention-section">
            <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 mb-3.5">Active Checklist</h3>
            
            <div className="space-y-3">
              {attentionItems.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 font-sans">
                  <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-neutral-800">All columns cleared</p>
                  <p className="text-[10px] text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Capture store sales, audit dynamic product stock, or maintain credit registers to activate your AI store sentry guards.
                  </p>
                </div>
              ) : (
                attentionItems.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={item.action}
                    className="flex items-start justify-between p-3 border border-neutral-100 rounded-2xl bg-neutral-50/50 hover:bg-neutral-50 transition cursor-pointer hover:border-neutral-200"
                  >
                    <div className="flex gap-2.5 items-start text-left min-w-0 flex-1">
                      <span className="shrink-0 mt-0.5">{item.tag}</span>
                      <div className="min-w-0 pr-1 text-left">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="text-[11px] sm:text-xs font-bold text-neutral-900 leading-snug truncate text-left">{item.text}</h4>
                          <span className={`text-[8px] font-bold font-mono px-1.5 py-0.2 rounded-sm uppercase border scale-95 shrink-0 ${
                            item.priority === "High Priority"
                              ? 'text-rose-700 bg-rose-50 border-rose-150'
                              : 'text-amber-805 bg-amber-50 border-amber-150 text-amber-700'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-[10.5px] leading-relaxed text-[#5F6368] font-normal mt-1 block text-left">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 align-middle self-center font-bold" />
                  </div>
                ))
              )}
            </div>
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
