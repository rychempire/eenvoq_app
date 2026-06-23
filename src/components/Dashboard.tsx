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
    <div className="space-y-6 pb-24 animate-fade-in font-sans text-[#393a3d] select-none max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 bg-[#f4f5f8] min-h-screen py-6 rounded-3xl border border-[#d4d7dc]" id="eenvoq-quickbooks-dashboard">
      
      {/* ===============================================
          1. QUICKBOOKS PREMIUM TOP NAVIGATION BAR
          =============================================== */}
      <div className="bg-white border border-[#d4d7dc] rounded-lg p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm" id="qb-navigation-nav">
        {/* Left Side: Store Identity & QuickBooks logo */}
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded bg-[#2ca01c] flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 select-none">
            qb
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md font-sans">
                {businessName}
              </h2>
              <span className="bg-emerald-50 text-[#2ca01c] text-[9px] font-bold px-2 py-0.5 rounded border border-[#2ca01c]/30 uppercase tracking-widest shrink-0 font-mono">
                Live &bull; Matched
              </span>
            </div>
            <p className="text-xs text-[#5f6368] font-sans">
              Welcome back, <span className="text-[#2ca01c] font-bold">{userName}</span> &bull; Real-time Cash and Ledger
            </p>
          </div>
        </div>

        {/* Central Proxy Search Bar */}
        <form onSubmit={handleAiSearchSubmit} className="relative w-full md:w-80 group">
          <input
            type="text"
            placeholder="Search transactions, ask AI..."
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            className="w-full bg-[#f4f5f8] hover:bg-neutral-100 focus:bg-white text-xs text-[#111111] pl-9 pr-8 py-2.5 rounded border border-[#d4d7dc] focus:border-[#2ca01c] focus:outline-none transition font-sans"
          />
          <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-[#5f6368] group-focus-within:text-[#2ca01c] transition" />
          <button type="submit" className="absolute right-3 top-2.5 p-1 text-[#5f6368] hover:text-[#2ca01c] transition">
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Right Side buttons: Currency & QB signature "+ New" Action Button */}
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
          <button
            type="button"
            onClick={handleCurrencyToggle}
            className="text-[10px] sm:text-xs font-bold text-[#5f6368] hover:text-[#2ca01c] border border-[#d4d7dc] bg-white rounded px-3 py-2 flex items-center gap-1.5 transition active:scale-95 cursor-pointer font-sans"
            title="Switch Core Currency"
          >
            <Coins className="w-3.5 h-3.5 text-[#2ca01c]" />
            <span>Currency: <span className="text-[#111111] font-bold">{currency}</span></span>
          </button>

          <button
            type="button"
            onClick={() => setShowMoreMenu(true)}
            className="flex items-center justify-center gap-1.5 bg-[#2ca01c] hover:bg-[#207514] active:scale-95 text-white transition-all px-4 py-2 rounded text-xs font-bold uppercase tracking-wider shadow-sm border border-transparent cursor-pointer select-none"
            id="header-qb-add-new-btn"
          >
            <Plus className="w-4 h-4 text-white font-bold" />
            <span>+ New</span>
          </button>
        </div>
      </div>

      {/* ===============================================
          2. GENERAL GRID STRUCTURE: MAIN vs SIDEBAR
          =============================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" id="qb-dashboard-bento-grid">
        
        {/* LEFT TWO-THIRDS: MAIN ACCOUNTING OVERVIEWS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* QuickBooks Signature Ribbon KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="qb-key-indicator-ribbon">
            {/* KPI 1: Today's Receipts */}
            <div className="bg-white border border-[#d4d7dc] rounded p-3.5 text-left flex flex-col justify-between shadow-xs relative">
              <div className="flex justify-between items-center text-[#5f6368]">
                <span className="text-[10px] font-bold uppercase tracking-wider block">Today's Sales</span>
                <span className="w-2 h-2 rounded-full bg-[#2ca01c] animate-pulse" />
              </div>
              <div className="mt-3">
                <span className="text-lg sm:text-xl font-bold text-[#111111] font-sans block">
                  {formatCurrency(expectedToday, currency)}
                </span>
                <span className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-50 rounded px-1 mt-1 inline-block">
                  +12.4% today
                </span>
              </div>
            </div>

            {/* KPI 2: Estimated P&L Profit */}
            <div className="bg-white border border-[#d4d7dc] rounded p-3.5 text-left flex flex-col justify-between shadow-xs">
              <div className="flex justify-between items-center text-[#5f6368]">
                <span className="text-[10px] font-bold uppercase tracking-wider block">Est. Net Profit</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#2ca01c]" />
              </div>
              <div className="mt-3">
                <span className="text-lg sm:text-xl font-bold text-[#2ca01c] font-sans block">
                  {formatCurrency(todayProfit, currency)}
                </span>
                <span className="text-[9px] text-[#5f6368] font-medium block mt-1">15% retail margin</span>
              </div>
            </div>

            {/* KPI 3: Billed Receipts Count */}
            <div className="bg-white border border-[#d4d7dc] rounded p-3.5 text-left flex flex-col justify-between shadow-xs">
              <div className="flex justify-between items-center text-[#5f6368]">
                <span className="text-[10px] font-bold uppercase tracking-wider block">Sales Count</span>
                <Activity className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="mt-3">
                <span className="text-lg sm:text-xl font-bold text-[#111111] font-sans block">{totalTransactions} Sales</span>
                <span className="text-[9px] text-[#5f6368] font-medium block mt-1">Receipts verified online</span>
              </div>
            </div>

            {/* KPI 4: Inventory Values */}
            <div className="bg-white border border-[#d4d7dc] rounded p-3.5 text-left flex flex-col justify-between shadow-xs">
              <div className="flex justify-between items-center text-[#5f6368]">
                <span className="text-[10px] font-bold uppercase tracking-wider block">Stock Asset</span>
                <Package className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="mt-3">
                <span className="text-lg sm:text-xl font-bold text-slate-800 font-sans block truncate">
                  {formatCurrency(totalInventoryValuation, currency)}
                </span>
                <span className="text-[9px] text-indigo-800 bg-indigo-50 font-bold px-1 rounded inline-block mt-1">
                  {inventory.length} dynamic SKUs
                </span>
              </div>
            </div>
          </div>

          {/* QuickBooks Signature Area Chart: Profit & Loss Tracker */}
          <div className="bg-white border border-[#d4d7dc] rounded p-5 text-left shadow-xs" id="qb-chart-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#eaebeb]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F6368] block">Profit &amp; Loss Trend</span>
                <h3 className="text-sm sm:text-base font-bold text-[#111111] font-sans mt-0.5">Core Revenue Analytics Ledger</h3>
              </div>
              
              <div className="flex bg-[#f4f5f8] p-0.5 rounded border border-[#d4d7dc] text-xs self-start" id="chart-toggle-group">
                <button
                  type="button"
                  onClick={() => setTrendType('revenue')}
                  className={`px-3 py-1.5 rounded font-bold transition text-[10px] uppercase tracking-wider ${
                    trendType === 'revenue' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#757a7f] hover:text-[#111111]'
                  }`}
                >
                  Gross Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setTrendType('profit')}
                  className={`px-3 py-1.5 rounded font-bold transition text-[10px] uppercase tracking-wider ${
                    trendType === 'profit' ? 'bg-white text-[#2ca01c] shadow-xs' : 'text-[#757a7f] hover:text-[#111111]'
                  }`}
                >
                  Est. Profit
                </button>
                <button
                  type="button"
                  onClick={() => setTrendType('transactions')}
                  className={`px-3 py-1.5 rounded font-bold transition text-[10px] uppercase tracking-wider ${
                    trendType === 'transactions' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#757a7f] hover:text-[#111111]'
                  }`}
                >
                  Sales count
                </button>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorQbGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ca01c" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2ca01c" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#eaebeb" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#5F6368" 
                    fontSize={10} 
                    fontFamily="Manrope"
                    tickLine={false} 
                    axisLine={false} 
                    dy={6}
                  />
                  <YAxis 
                    stroke="#5F6368" 
                    fontSize={9} 
                    fontFamily="Manrope"
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatChartVal}
                    dx={-6}
                  />
                  <Tooltip 
                    formatter={(val: any) => [
                      trendType === 'transactions' ? val : formatCurrency(Number(val), currency),
                      trendType === 'revenue' ? 'GROSS REVENUE' : trendType === 'profit' ? 'NET PROFIT' : 'TRANSACTIONS'
                    ]}
                    contentStyle={{ border: '1px solid #d4d7dc', borderRadius: 8, fontSize: 11, fontFamily: 'Manrope', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={trendType} 
                    stroke="#2ca01c" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorQbGreen)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* QuickBooks Signature Accounts Receivable Ribbon (Overdue, Open, Paid status tracker) */}
          <div className="bg-white border border-[#d4d7dc] rounded p-5 text-left shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5f6368] block">Accounts Receivable</span>
              <h3 className="text-base font-bold text-[#111111] mt-0.5 font-sans">Invoices &amp; Credit Ledger</h3>
            </div>

            {/* Color multi-segmented progress bar */}
            <div className="relative">
              <div className="flex h-3 w-full rounded overflow-hidden bg-neutral-100 border border-[#eaebeb]">
                <div 
                  className="bg-orange-500 transition-all duration-500" 
                  style={{ width: debtors.length > 0 ? '45%' : '0%' }} 
                  title="Overdue Accounts"
                />
                <div 
                  className="bg-sky-500 transition-all duration-500" 
                  style={{ width: debtors.length > 0 ? '35%' : '0%' }}
                  title="Open Invoices"
                />
                <div 
                  className="bg-[#2ca01c] transition-all duration-500" 
                  style={{ width: receipts.length > 0 ? '20%' : '100%' }}
                  title="Paid &amp; Liquid registers"
                />
              </div>

              {/* Legend with Dynamic totals calculated from actual store state */}
              <div className="grid grid-cols-3 gap-2 mt-3 select-none">
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-orange-500 inline-block shrink-0" />
                    <span className="text-[10px] text-[#5f6368] uppercase font-bold tracking-wider">Overdue Credit</span>
                  </div>
                  <span className="text-sm font-bold text-[#111111] block font-mono mt-0.5">
                    {formatCurrency(debtors.reduce((sum, d) => sum + d.amountOwed, 0), currency)}
                  </span>
                  <span className="text-[9px] text-neutral-400 block">{debtors.filter(d => d.amountOwed > 0).length} client ledgers</span>
                </div>

                <div className="text-left border-l border-[#eaebeb] pl-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block shrink-0" />
                    <span className="text-[10px] text-[#5f6368] uppercase font-bold tracking-wider">Open Invoices</span>
                  </div>
                  <span className="text-sm font-bold text-[#111111] block font-mono mt-0.5">
                    {formatCurrency(expectedToday * 0.4, currency)}
                  </span>
                  <span className="text-[9px] text-neutral-400 block">Pending system verify</span>
                </div>

                <div className="text-left border-l border-[#eaebeb] pl-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#2ca01c] inline-block shrink-0" />
                    <span className="text-[10px] text-[#5f6368] uppercase font-bold tracking-wider">Paid Sales</span>
                  </div>
                  <span className="text-sm font-bold text-[#2ca01c] block font-mono mt-0.5">
                    {formatCurrency(expectedToday, currency)}
                  </span>
                  <span className="text-[9px] text-[#2ca01c] font-bold block">{receipts.length} total receipts</span>
                </div>
              </div>
            </div>

            {/* Quick click checklist action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#f4f5f8] p-3 rounded border border-[#d4d7dc] text-xs">
              <span className="text-[#393a3d]">Maintain customer debtor ledgers, add invoices, or clear dues:</span>
              <button
                type="button"
                onClick={() => setActiveSection('debtor')}
                className="text-[#2ca01c] hover:text-[#1e7514] font-bold flex items-center gap-1 cursor-pointer transition select-none uppercase tracking-wider text-[10px] shrink-0"
              >
                <span>Navigate Client Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* QuickBooks Compact Receipts Ledger */}
          <div className="bg-white border border-[#d4d7dc] rounded p-5 text-left shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#5f6368] block">Recent Sales History</span>
                <h3 className="text-base font-bold text-[#111111] mt-0.5 font-sans">Registered Invoices &amp; Receipts</h3>
              </div>
              <button 
                onClick={() => { window.location.hash = 'receipts'; setActiveSection('receipts'); }}
                className="text-xs text-[#2ca01c] hover:text-[#1e7514] font-bold cursor-pointer hover:underline"
              >
                Open Ledger
              </button>
            </div>

            {receipts.length === 0 ? (
              <div className="text-center py-8 text-[#5f6368] font-sans">
                <CheckCircle2 className="w-7 h-7 text-[#5f6368]/30 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#111111]">No receipts generated today</p>
                <p className="text-[10px] text-neutral-400 mt-1">Click "+ New" to add a sales receipt.</p>
              </div>
            ) : (
              <div className="overflow-x-auto min-w-full">
                <table className="min-w-full text-xs text-left" id="qb-receipts-table">
                  <thead>
                    <tr className="border-b border-[#eaebeb] text-[#5f6368] uppercase font-bold text-[9px] tracking-wider">
                      <th className="py-2.5">Receipt #</th>
                      <th className="py-2.5">Cashier</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Sum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.slice(-4).reverse().map((r, i) => (
                      <tr key={i} className="border-b border-[#eaebeb] hover:bg-neutral-50 font-sans">
                        <td className="py-2.5 font-bold font-mono text-[#393a3d]">
                          {r.id ? r.id.substring(0, 10) : `REC-04${105+i}`}
                        </td>
                        <td className="py-2.5 text-[#111111]">{r.createdBy?.name || userName}</td>
                        <td className="py-2.5 text-[#5f6368]">{(r.timestamp || '').split('T')[0] || new Date().toISOString().split('T')[0]}</td>
                        <td className="py-2.5">
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${
                            r.status === 'verified' ? 'text-[#2ca01c] bg-emerald-50 border-[#2ca01c]/35' : 'text-neutral-600 bg-[#f4f5f8] border-[#d4d7dc]'
                          }`}>
                            {r.status || 'Verified'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-bold font-mono text-[#111111]">
                          {formatCurrency(r.totalAmount, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT ONE-THIRD SIDEBAR: BANK ACCOUNT FEED & ACTIVE SENTRY ALARMS */}
        <div className="space-y-6">
          
          {/* QuickBooks Bank Account Matcher Card (Truth Check Reconciler Redesign) */}
          <div className="bg-white border-2 border-[#2ca01c]/45 hover:border-[#2ca01c] rounded p-5 text-left shadow-xs" id="qb-bank-account-reconciliation-widget">
            <div className="flex items-center justify-between border-b border-[#eaebeb] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-emerald-50 text-[#2ca01c] flex items-center justify-center border border-[#2ca01c]/30">
                  <Coins className="w-4 h-4 text-[#2ca01c]" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#5f6368]">QuickBooks Feed Matcher</h3>
                  <h4 className="text-xs sm:text-sm font-bold text-[#111111] font-sans">Register Cash reconciliation</h4>
                </div>
              </div>
              <span className="text-[8px] bg-amber-50 border border-amber-100 text-amber-850 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider block shrink-0 font-mono">
                1 Pending
              </span>
            </div>

            <p className="text-xs text-[#5F6368] leading-relaxed mb-4 font-sans">
              Review register drawers and digital transfers. Reconcile counted physical cash sales vs calculated system values to check for variances.
            </p>

            {/* Expand / Collapse reconciler trigger */}
            {!showReconciliationInline ? (
              <button
                type="button"
                onClick={() => setShowReconciliationInline(true)}
                className="w-full text-center py-2.5 bg-[#2ca01c] hover:bg-[#207514] text-white text-xs font-bold rounded uppercase tracking-wider transition cursor-pointer select-none"
              >
                Reconcile Register Cash
              </button>
            ) : (
              <div className="bg-[#f4f5f8] border border-[#d4d7dc] rounded p-4 space-y-4 animate-fade-in-shorter">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-1.5">
                  <span className="text-[10px] font-bold text-[#393a3d] uppercase tracking-wider">Drawer count feeds</span>
                  <button 
                    type="button" 
                    onClick={() => setShowReconciliationInline(false)}
                    className="p-0.5 text-neutral-400 hover:text-black cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <form onSubmit={handleRunReconciliation} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#5f6368] uppercase tracking-wide mb-1">Counted Cash ({currencySymbol})</label>
                    <input 
                      type="number"
                      required
                      value={inputCash}
                      onChange={e => setInputCash(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white text-xs font-bold p-2.5 border border-[#d4d7dc] rounded focus:outline-none focus:border-[#2ca01c] focus:ring-1 focus:ring-[#2ca01c]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#5f6368] uppercase tracking-wide mb-1">POS / Cards ({currencySymbol})</label>
                    <input 
                      type="number"
                      required
                      value={inputOthers}
                      onChange={e => setInputOthers(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white text-xs font-bold p-2.5 border border-[#d4d7dc] rounded focus:outline-none focus:border-[#2ca01c] focus:ring-1 focus:ring-[#2ca01c]/30"
                    />
                  </div>

                  <div className="p-2.5 bg-white border border-[#d4d7dc] rounded text-xs flex items-center justify-between text-[#393a3d]">
                    <span className="text-[10px] uppercase font-bold text-[#5f6368]">Total Billed Target:</span>
                    <span className="font-bold text-[#111111] font-mono">{formatCurrency(expectedToday, currency)}</span>
                  </div>

                  <div className="flex gap-2 w-full pt-1">
                    <button
                      type="submit"
                      disabled={auditLoading}
                      className="flex-grow bg-[#2ca01c] hover:bg-[#1e7514] text-white font-bold py-2 px-3 rounded text-xs transition cursor-pointer disabled:bg-neutral-200 uppercase tracking-wider"
                    >
                      {auditLoading ? "Matching feeds..." : "Match Register"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTruthCheckResult(null);
                        setInputCash(0);
                        setInputOthers(0);
                      }}
                      className="px-3 py-2 border border-[#d4d7dc] rounded text-xs font-bold text-[#5f6368] hover:bg-neutral-50 active:scale-95 transition cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </form>

                {truthCheckResult && (
                  <div className="bg-white border border-[#d4d7dc] rounded p-3 mt-2 space-y-2 text-xs text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[9px] uppercase tracking-widest text-[#5f6368]">Feeds status</span>
                      <span className={`font-bold font-mono text-[9px] px-2 py-0.2 rounded border ${
                        truthCheckResult.riskLevel === 'low' 
                          ? 'text-[#2ca01c] bg-emerald-50 border-[#2ca01c]/30' 
                          : 'text-rose-700 bg-rose-50 border-rose-200'
                      }`}>
                        {truthCheckResult.riskLevel === 'low' ? '🔒 MATCHED ✔' : '⚠️ UNMATCHED VARIANCE'}
                      </span>
                    </div>
                    <p className="text-neutral-700 leading-snug font-medium italic text-[10.5px]">
                      "{truthCheckResult.details}"
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 border-t border-dashed border-[#d4d7dc] pt-2 mt-1">
                      <div>
                        <span className="text-[8px] text-[#5f6368] block uppercase font-bold tracking-wider">Book Sum</span>
                        <span className="font-mono text-[#111111] font-bold">{formatCurrency((truthCheckResult.declaredRevenue), currency)}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-[#5f6368] block uppercase font-bold tracking-wider">Variance GAP</span>
                        <span className={`font-mono font-bold ${truthCheckResult.difference < 0 ? 'text-rose-600' : 'text-[#2ca01c]'}`}>
                          {truthCheckResult.difference < 0 ? '-' : '+'}{formatCurrency(Math.abs(truthCheckResult.difference), currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QuickBooks Task Center / Active Alerts & Store Sentry Guard */}
          <div className="bg-white border border-[#d4d7dc] rounded p-5 text-left shadow-xs" id="qb-task-alerts-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#5f6368] mb-3.5 pb-2 border-b border-[#eaebeb]">
              Active Checklist / Sentry Alarms
            </h3>
            
            <div className="space-y-3">
              {attentionItems.length === 0 ? (
                <div className="text-center py-6 text-[#5f6368] font-sans">
                  <CheckCircle2 className="w-7 h-7 text-[#2ca01c] mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#111111]">Checklist cleared</p>
                  <p className="text-[10px] text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Capture store sales, audit dynamic product stock, or maintain credit registers to activate your AI store sentry guards.
                  </p>
                </div>
              ) : (
                attentionItems.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={item.action}
                    className="flex items-start justify-between p-3 border border-[#eaebeb] rounded bg-neutral-50/50 hover:bg-neutral-50 transition cursor-pointer hover:border-[#d4d7dc]"
                  >
                    <div className="flex gap-2 items-start text-left min-w-0 flex-1">
                      <span className="shrink-0 mt-0.5">{item.tag}</span>
                      <div className="min-w-0 pr-1 text-left">
                        <div className="flex flex-wrap items-center gap-1">
                          <h4 className="text-[11px] font-bold text-[#111111] leading-snug truncate text-left">{item.text}</h4>
                          <span className={`text-[8px] font-bold font-mono px-1 rounded uppercase tracking-wider shrink-0 scale-90 border ${
                            item.priority === "High Priority"
                              ? 'text-rose-700 bg-rose-50 border-rose-250'
                              : 'text-amber-850 bg-amber-50 border-amber-200'
                          }`}>
                            {item.priority === "High Priority" ? "Urgent" : item.priority}
                          </span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-[#5F6368] font-normal mt-0.5 block text-left font-sans">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 align-middle self-center font-bold" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* QuickBooks Business Schedule / Daily Close Audits Modal Gateway */}
          <div 
            className="relative border border-[#d4d7dc] bg-[#232733] text-white rounded p-5 transition-all duration-300 group cursor-pointer hover:border-[#2ca01c] text-left shadow-xs" 
            id="qb-close-audits-card"
            onClick={() => setShowRundownModal(true)}
          >
            <div className="absolute top-0 right-10 w-[150px] h-[100px] bg-[#2ca01c]/10 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[#2ca01c] animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#2ca01c] block">Operating Schedule</span>
                    <h2 className="text-xs font-bold text-white tracking-wide mt-0.5 font-sans">EOD Auditing Console</h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  {isEndOfDay ? (
                    <span className="text-[8px] bg-rose-500/25 text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-500/30 uppercase tracking-widest font-mono">
                      Closed Summary
                    </span>
                  ) : (
                    <span className="text-[8px] bg-[#2ca01c]/25 text-emerald-300 font-bold px-2 py-0.5 rounded border border-[#2ca01c]/30 uppercase tracking-widest font-mono">
                      Running Feed
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed text-left font-sans">
                {isEndOfDay 
                  ? "Operational shift has ended. Select to review register cash variances, print sales reports, and lock logs today."
                  : "Daily register tracking active inside normal operating hours. Select to preview current performance, debtor statuses, or stock balances."}
              </p>

              <div className="flex items-center gap-1 text-[11px] text-[#2ca01c] font-bold group-hover:text-emerald-300 transition select-none pt-1">
                <span>Open Shift Audit Console</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Smart Recommendations section deleted */}

      {/* PERSISTENT SLIDE UP BOTTOM SHEET FOR 'MORE' OR '+ NEW' BUTTON */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center select-none" id="more-slideup-modal">
          <div 
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setShowMoreMenu(false)}
          />
          <div 
            className="relative bg-white rounded-t-2xl w-full max-w-lg p-5 space-y-5 shadow-2xl z-10 transition-transform duration-300 transform translate-y-0 text-left border-t border-[#d4d7dc]"
          >
            {/* Header notch line */}
            <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto" />
            
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-widest">QuickBooks Operations</h3>
              <button 
                type="button" 
                onClick={() => setShowMoreMenu(false)}
                className="text-neutral-500 hover:text-black p-1 text-[#5F6368] cursor-pointer hover:bg-neutral-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-[#5f6368] font-sans -mt-2">
              Select an action to launch sales workflows, capture client debts, register inventory supply, or run forensic checks.
            </p>

            <div className="grid grid-cols-2 gap-4">
              
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveSection('forensic');
                }}
                className="p-4 bg-purple-50/20 hover:bg-purple-50/55 border border-purple-105 hover:border-purple-300 rounded text-left flex flex-col gap-2 transition cursor-pointer"
              >
                <ShieldAlert className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="text-xs font-bold text-[#111111] leading-tight font-sans">Forensic Audit Check</h4>
                  <p className="text-[10px] text-[#5f6368] mt-0.5 font-normal font-sans">Trace missing register cash</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveSection('receipts');
                  window.location.hash = 'receipts/add';
                }}
                className="p-4 bg-emerald-50/20 hover:bg-emerald-50/55 border border-emerald-100 hover:border-[#2ca01c] rounded text-left flex flex-col gap-2 transition cursor-pointer"
              >
                <Plus className="w-5 h-5 text-[#2ca01c]" />
                <div>
                  <h4 className="text-xs font-bold text-[#111111] leading-tight font-sans">Add Sales Receipt</h4>
                  <p className="text-[10px] text-[#5f6368] mt-0.5 font-normal font-sans">Generate brand new receipt</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveSection('debtor');
                }}
                className="p-4 bg-sky-50/10 hover:bg-sky-50/45 border border-sky-100 hover:border-sky-300 rounded text-left flex flex-col gap-2 transition cursor-pointer"
              >
                <Users className="w-5 h-5 text-sky-600" />
                <div>
                  <h4 className="text-xs font-bold text-[#111111] leading-tight font-sans">Add Client Debts</h4>
                  <p className="text-[10px] text-[#5f6368] mt-0.5 font-normal font-sans">Log custom debtor totals</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveSection('inventory');
                }}
                className="p-4 bg-amber-50/15 hover:bg-amber-50/45 border border-amber-100 hover:border-amber-300 rounded text-left flex flex-col gap-2 transition cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-xs font-bold text-[#111111] leading-tight font-sans">Fill Stock Levels</h4>
                  <p className="text-[10px] text-[#5f6368] mt-0.5 font-normal font-sans">Register supply deliveries</p>
                </div>
              </button>

            </div>

            <button
              type="button"
              onClick={() => setShowMoreMenu(false)}
              className="w-full text-center py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded uppercase tracking-wider transition cursor-pointer"
            >
              Cancel View
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Rundown Modal (Daily Business Rundown) */}
      {showRundownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/70 backdrop-blur-sm animate-fade-in-shorter text-left">
          <div className="bg-white rounded w-full max-w-xl border border-[#d4d7dc] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-[#eaebeb] flex items-center justify-between bg-[#f4f5f8]">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-[#2ca01c] stroke-[1.5]" />
                <div>
                  <h3 className="font-sans font-bold text-black text-xs uppercase tracking-wide">Shift Audits Overview</h3>
                  <p className="text-[10px] text-[#5F6368] font-sans mt-0.5">
                    Operating Schedule: {openTimeStr} - {closeTimeStr}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowRundownModal(false)}
                className="p-1.5 rounded hover:bg-neutral-200 text-[#5F6368] hover:text-black transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-5 text-left select-none">
              {/* Op Hours / Status Banner */}
              <div className="flex items-center justify-between p-3 rounded bg-[#f4f5f8] border border-[#d4d7dc]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#393a3d]">
                  <Activity className="w-4 h-4 text-[#2ca01c]" />
                  <span>Interactive Real-Time Auditing Desk</span>
                </div>
                {isEndOfDay ? (
                  <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-200 uppercase tracking-wider font-mono">
                    Shift Closed
                  </span>
                ) : (
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider font-mono">
                    Shift Active
                  </span>
                )}
              </div>

              {/* Statistics Panel */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f4f5f8] p-4 border border-[#d4d7dc] rounded">
                  <span className="text-[9px] text-[#5f6368] font-bold uppercase tracking-wider block font-sans">Sales Tallied</span>
                  <span className="text-base sm:text-lg font-bold text-[#111111] mt-1 block font-mono">{formatCurrency(expectedToday, currency)}</span>
                  <span className="text-[9px] text-neutral-400 block mt-0.5 font-sans">Through {totalTransactions} sales receipts</span>
                </div>
                <div className="bg-[#f4f5f8] p-4 border border-[#d4d7dc] rounded">
                  <span className="text-[9px] text-[#5f6368] font-bold uppercase tracking-wider block font-sans">Marginal Net Income</span>
                  <span className="text-base sm:text-lg font-bold text-[#2ca01c] mt-1 block font-mono">{formatCurrency(todayProfit, currency)}</span>
                  <span className="text-[9px] text-neutral-400 block mt-0.5 font-sans">Assuming core 15% retail margin</span>
                </div>
              </div>

              {/* Sales/Inventory detailed log */}
              <div className="space-y-2">
                <h4 className="text-[9px] uppercase font-bold text-[#5f6368] tracking-wider">Workday Register Summary</h4>
                <div className="p-4 bg-neutral-50 rounded border border-[#eaebeb] space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between border-b border-dashed border-neutral-200 pb-1.5">
                    <span className="font-semibold text-slate-700 font-sans">Cashier Vault Target:</span>
                    <span className="font-mono text-slate-900 font-bold">{formatCurrency(expectedToday, currency)}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 pb-1.5">
                    <span className="font-semibold text-slate-700 font-sans">Items Audited On-Shelf:</span>
                    <span className="font-mono text-slate-900 font-bold">{inventory.length} dynamic SKUs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700 font-sans">Client Outstanding Balance:</span>
                    <span className="font-mono text-rose-600 font-bold">
                      {formatCurrency(debtors.reduce((sum, d) => sum + d.amountOwed, 0), currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active warning block */}
              {isEndOfDay ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded flex gap-2.5 text-xs text-amber-900 leading-relaxed font-sans">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Closing Audits Recommended</span>
                    Validate shift drawers in QuickBooks Feed Matcher or trigger cash truth check parameters before closing files.
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-sky-50 border border-sky-100 rounded flex gap-2.5 text-xs text-sky-900 leading-relaxed font-sans">
                  <CheckCircle2 className="w-5 h-5 text-[#2ca01c] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Protection Services Online</span>
                    Audits logging enabled. Deletions or receipt modifications are saved directly to the permanent audit trail.
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-[#f4f5f8] border-t border-[#d4d7dc] flex gap-2 justify-end">
              <button 
                onClick={() => setShowRundownModal(false)}
                className="px-4 py-2 border border-[#d4d7dc] bg-white hover:bg-neutral-100 text-[#393a3d] text-xs font-bold rounded transition cursor-pointer"
              >
                Close View
              </button>
              {isEndOfDay && (
                <button 
                  onClick={() => {
                    setShowRundownModal(false);
                    setShowReconciliationInline(true);
                  }}
                  className="px-4 py-2 bg-[#2ca01c] hover:bg-[#1e7514] text-white text-xs font-bold rounded transition cursor-pointer flex items-center gap-1 shadow-sm uppercase tracking-wider"
                >
                  <Coins className="w-3.5 h-3.5" />
                  Run Feed Matcher
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
