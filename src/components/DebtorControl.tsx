import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Lock, Unlock, Sparkles, MessageSquare, 
  Search, Sliders, ArrowLeft, CheckSquare, 
  User, Check, DollarSign, Calendar, AlertTriangle, ChevronRight, 
  Activity, Award, FileText, Download, Play, PlusCircle, AlertCircle, Phone, Smartphone, Trash2, ShieldCheck, Mail, X
} from 'lucide-react';
import { Debtor, PaymentItem } from '../types';
import { formatCurrency } from '../utils/currency';

interface DebtorControlProps {
  debtors: Debtor[];
  onToggleLock: (debtorId: string) => void;
  onUpdateDebtors?: (debtors: Debtor[]) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
  currency: string;
}

// Audit record shape for Risk Analysis tab
interface DebtorAuditLog {
  id: string;
  date: string;
  user: string;
  customerName: string;
  action: string;
  reason: string;
  outcome: string;
}

// Payment plan shape
interface PaymentPlan {
  id: string;
  customerName: string;
  totalAmount: number;
  installments: number;
  freq: string;
  progress: number; // percentage
  dueDates: string[];
}

export default function DebtorControl({ 
  debtors: initialDebtors, 
  onToggleLock, 
  onUpdateDebtors, 
  showConfirm, 
  currency 
}: DebtorControlProps) {
  // Use local state synchronized with props so that payments, limits, write-offs update immediately on clicking
  const [localDebtors, setLocalDebtors] = React.useState<Debtor[]>(initialDebtors);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(initialDebtors[0] || null);
  
  // Tab Navigation: Overview, Debtors, Collections, Risk Analysis
  const [activeTab, setActiveTab] = useState<'overview' | 'debtors' | 'collections' | 'risk'>('overview');
  
  // Search & Filter state for Debtors Tab
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState<'all' | 'active' | 'overdue' | 'high_risk' | 'locked'>('all');

  // AI Debtor Assistant Search
  const [aiDebtorQuery, setAiDebtorQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<{ answer: string; evidence: string[] } | null>(null);

  // Forms / Modals States
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Card'>('Cash');

  // New Debtor Creation Modal states
  const [showAddDebtorModal, setShowAddDebtorModal] = useState(false);
  const [newDebtorName, setNewDebtorName] = useState('');
  const [newDebtorPhone, setNewDebtorPhone] = useState('');
  const [newDebtorAmount, setNewDebtorAmount] = useState('');
  const [newDebtorDueDate, setNewDebtorDueDate] = useState('');

  // Credit Management
  const [editLimits, setEditLimits] = useState(false);
  const [customCreditLimit, setCustomCreditLimit] = useState<'150000' | '300000' | '500000'>('300000');
  const [extendDays, setExtendDays] = useState('');

  // Propagate local state change back up to main App.tsx (for database / localStorage mirroring)
  React.useEffect(() => {
    setLocalDebtors(initialDebtors);
  }, [initialDebtors]);

  React.useEffect(() => {
    if (onUpdateDebtors) {
      onUpdateDebtors(localDebtors);
    }
  }, [localDebtors, onUpdateDebtors]);

  const handleRegisterDebtor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebtorName.trim()) return;

    const amt = parseFloat(newDebtorAmount) || 0;
    const defaultDate = newDebtorDueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newDeb: Debtor = {
      id: `debt-${Date.now()}`,
      name: newDebtorName,
      phone: newDebtorPhone || '08000000000',
      amountOwed: amt,
      dueDate: defaultDate,
      creditScore: amt > 150000 ? 55 : 85,
      riskRating: amt > 150000 ? 'high' : amt > 50000 ? 'medium' : 'low',
      locked: false,
      paymentHistory: []
    };

    const updated = [newDeb, ...localDebtors];
    setLocalDebtors(updated);
    setSelectedDebtor(newDeb);

    // Reset Form fields
    setNewDebtorName('');
    setNewDebtorPhone('');
    setNewDebtorAmount('');
    setNewDebtorDueDate('');
    setShowAddDebtorModal(false);

    triggerNotification(`Created Account: Successful overdraft ledger opened for ${newDebtorName}!`);
  };

  // Payment Plan form
  const [planInstallments, setPlanInstallments] = useState(3);
  const [planAmount, setPlanAmount] = useState('');
  const [planSuccess, setPlanSuccess] = useState(false);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([
    { id: 'plan-1', customerName: 'Baba Sadiq', totalAmount: 50000, installments: 4, freq: 'Weekly', progress: 25, dueDates: ['2026-06-25', '2026-07-02'] }
  ]);

  // Debt Write-off flow
  const [writeOffReason, setWriteOffReason] = useState('');
  const [writeOffManagerPin, setWriteOffManagerPin] = useState('');
  const [writeOffSuccess, setWriteOffSuccess] = useState(false);

  // Reminders templates selector
  const [activeReminderTemplate, setActiveReminderTemplate] = useState<'upcoming' | 'today' | 'overdue' | 'final'>('overdue');

  // Centralised Audit Trail Logs
  const [auditLogs, setAuditLogs] = useState<DebtorAuditLog[]>([
    { id: 'aud-1', date: '2026-06-19 14:15', user: 'Owner', customerName: 'Baba Sadiq', action: 'Overdraft Limit Change', reason: 'High seasonal purchasing rate', outcome: 'Credit limit updated to ₦300,000' },
    { id: 'aud-2', date: '2026-06-18 09:30', user: 'Admin', customerName: 'Jubril Ahmed', action: 'Reminder Dispatched', reason: 'Due date passed 5 days ago', outcome: 'Alert sent via WhatsApp integration' },
    { id: 'aud-3', date: '2026-06-15 11:10', user: 'Admin', customerName: 'Lina Enterprise', action: 'Payment Track Reconcile', reason: 'Partial bank transfer received', outcome: 'Recorded ₦20,000 credit adjustment' }
  ]);

  // Success Feed simulation toasts
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Trigger brief alert feeds
  const triggerNotification = (text: string) => {
    setStatusNotification(text);
    setTimeout(() => {
      setStatusNotification(null);
    }, 4500);
  };

  // --- COMPUTE REVENUE METRICS DYNAMICALLY ---
  const debtMetrics = useMemo(() => {
    const totalOutstanding = localDebtors.reduce((sum, d) => sum + d.amountOwed, 0);
    const activeDebtorsCount = localDebtors.filter(d => d.amountOwed > 0).length;
    const overdueDebtorsCount = localDebtors.filter(d => d.amountOwed > 70000 || d.creditScore < 60).length;
    const amountDueThisWeekCount = localDebtors.filter(d => d.amountOwed > 0).reduce((sum, d) => sum + d.amountOwed * 0.4, 0); // simulation factor

    return {
      totalOutstanding,
      activeDebtorsCount,
      overdueDebtorsCount,
      amountDueThisWeekCount
    };
  }, [localDebtors]);

  // --- FILTERED DEBTOR ARRAY FOR MASTER LIST ---
  const filteredDebtors = useMemo(() => {
    return localDebtors.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.phone.includes(searchTerm);
      
      if (!matchSearch) return false;
      if (filterCriteria === 'all') return true;
      if (filterCriteria === 'active') return d.amountOwed > 0;
      if (filterCriteria === 'overdue') return d.amountOwed > 30000 && d.creditScore < 70;
      if (filterCriteria === 'high_risk') return d.riskRating === 'high';
      if (filterCriteria === 'locked') return d.locked;
      return true;
    });
  }, [localDebtors, searchTerm, filterCriteria]);

  // --- AI DEBTOR ASSISTANT HANDLER ---
  const handleAskDebtorAI = (qText: string) => {
    setAiDebtorQuery(qText);
    const q = qText.toLowerCase();

    let ans = "";
    let evidence: string[] = [];

    if (q.includes('most money') || q.includes('who owes')) {
      const highest = [...localDebtors].sort((a, b) => b.amountOwed - a.amountOwed)[0];
      ans = `Our primary accounts debtor is currently ${highest?.name || 'none'}. Their outstanding tab represents approx ${Math.floor((highest?.amountOwed / debtMetrics.totalOutstanding) * 100)}% of your total uncollected credits portfolio.`;
      evidence = [
        `👤 Debtor: ${highest?.name}`,
        `💰 Balance: ${formatCurrency(highest?.amountOwed || 0, currency)}`,
        `⚠️ credit score rating: ${highest?.creditScore}% (${highest?.riskRating.toUpperCase()} risk rating)`
      ];
    } else if (q.includes('overdue') || q.includes('days overdue')) {
      const overdueList = localDebtors.filter(d => d.amountOwed > 3000);
      ans = `We have detected ${overdueList.length} customer records with overdue invoice liabilities. Key collections attention should center on older balances.`;
      evidence = overdueList.map(item => `📦 ${item.name}: Balance of ${formatCurrency(item.amountOwed, currency)} is past terms.`);
    } else if (q.includes('default') || q.includes('likely to')) {
      const risky = localDebtors.filter(d => d.riskRating === 'high');
      ans = `Credit prediction monitors warn that customers with score velocities below 60% hold a combined default probability of 68%. Direct cash-only limits are suggested.`;
      evidence = risky.map(item => `⚠️ ${item.name}: payment score down to ${item.creditScore}%`);
    } else if (q.includes('priorities') || q.includes('repayment')) {
      ans = `Top priorities are assigned based on age matrices paired with risk profiles. Recommending immediate automated WhatsApp templates dispatch.`;
      evidence = [
        `🔥 Collection Priority 1: Baba Sadiq (${formatCurrency(90000, currency)})`,
        `⚡ Collection Priority 2: Alhaji Musa (${formatCurrency(48100, currency)})`
      ];
    } else {
      ans = `I can instantly evaluate credit scoring distributions, rank collections by priority factors, or locate high-default profiles. Ask any of the default queries above.`;
      evidence = [
        `📁 Tracked active customer lines: ${localDebtors.length}`,
        `📊 Total Outstanding assets: ${formatCurrency(debtMetrics.totalOutstanding, currency)}`
      ];
    }

    setAiResponse({ answer: ans, evidence });
  };

  // --- ACTIONS WORKFLOWS ---

  // 1. RECORD CUSTOMER PAYMENT (Durable Local Sync)
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor) return;
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid payment amount entered");
      return;
    }

    // Adjust balances
    const previousOwed = selectedDebtor.amountOwed;
    const remaining = Math.max(0, previousOwed - amount);

    // Update state item
    const updatedDebtors = localDebtors.map(d => {
      if (d.id === selectedDebtor.id) {
        const newPh: PaymentItem = {
          date: new Date().toISOString().split('T')[0],
          amount: amount
        };
        const nextScore = Math.min(100, d.creditScore + 5);
        return {
          ...d,
          amountOwed: remaining,
          creditScore: nextScore,
          riskRating: nextScore > 75 ? 'low' : nextScore > 50 ? 'medium' : 'high',
          paymentHistory: [newPh, ...d.paymentHistory]
        } as Debtor;
      }
      return d;
    });

    setLocalDebtors(updatedDebtors);
    
    // Update active selected profiles
    const nextDebtor = updatedDebtors.find(d => d.id === selectedDebtor.id) || null;
    setSelectedDebtor(nextDebtor);

    // Logs Audit
    const newAudit: DebtorAuditLog = {
      id: `aud-${Date.now()}`,
      date: new Date().toLocaleString(),
      user: 'Owner',
      customerName: selectedDebtor.name,
      action: 'Payment Recorded',
      reason: `Recorded via ${paymentMethod} method`,
      outcome: `Paid ${formatCurrency(amount, currency)}. Bal: ${formatCurrency(remaining, currency)}`
    };
    setAuditLogs([newAudit, ...auditLogs]);

    setRecordingPayment(false);
    setPaymentAmount('');
    triggerNotification(`Confirmed: Received ${formatCurrency(amount, currency)} from ${selectedDebtor.name}!`);
  };

  // 2. TOGGLE LOCKED STATE (Suspends Credit capability)
  const handleLocalToggleLock = (debtorId: string) => {
    const dObj = localDebtors.find(item => item.id === debtorId);
    if (!dObj) return;

    onToggleLock(debtorId);

    const updated = localDebtors.map(item => {
      if (item.id === debtorId) {
        return { ...item, locked: !item.locked };
      }
      return item;
    });
    setLocalDebtors(updated);
    const nextSel = updated.find(item => item.id === debtorId) || null;
    setSelectedDebtor(nextSel);

    const actionText = dObj.locked ? 'Credit Limit Suspended' : 'Credit Limit Re-enabled';
    const auditObj: DebtorAuditLog = {
      id: `aud-${Date.now()}`,
      date: new Date().toLocaleString(),
      user: 'Owner',
      customerName: dObj.name,
      action: actionText,
      reason: 'Bypass authorization approved',
      outcome: dObj.locked ? 'Account unlocked successfully' : 'Account locked from POS credits sales'
    };
    setAuditLogs([auditObj, ...auditLogs]);

    triggerNotification(`Status Sync: ${dObj.name}'s account has been successfully ${dObj.locked ? 'unlocked' : 'blocked'}.`);
  };

  // 3. EXTEND DUE DATE
  const handleExtendDueDate = () => {
    if (!selectedDebtor || !extendDays) return;
    const days = parseInt(extendDays);
    if (isNaN(days) || days <= 0) return;

    const date = new Date();
    date.setDate(date.getDate() + days);
    const formatted = date.toISOString().split('T')[0];

    const updated = localDebtors.map(d => {
      if (d.id === selectedDebtor.id) {
        return { ...d, dueDate: formatted };
      }
      return d;
    });
    setLocalDebtors(updated);
    setSelectedDebtor(updated.find(item => item.id === selectedDebtor.id) || null);

    const auditObj: DebtorAuditLog = {
      id: `aud-${Date.now()}`,
      date: new Date().toLocaleString(),
      user: 'Owner',
      customerName: selectedDebtor.name,
      action: 'DueDate Extension',
      reason: `Extended by user request of ${days} days`,
      outcome: `Due date revised to: ${formatted}`
    };
    setAuditLogs([auditObj, ...auditLogs]);

    setExtendDays('');
    setEditLimits(false);
    triggerNotification(`Extension Confirmed: Due date for ${selectedDebtor.name} extended by ${days} days.`);
  };

  // 4. WRITE OFF DEBT ENFORCER (Requires Mock Bypass Pin 1234)
  const handleWriteOffDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor) return;
    if (writeOffManagerPin !== '1234') {
      alert("Error: Invalid Manager Authorization PIN. Hint: use 1234");
      return;
    }

    const previousAmount = selectedDebtor.amountOwed;

    const updated = localDebtors.map(d => {
      if (d.id === selectedDebtor.id) {
        return { ...d, amountOwed: 0, creditScore: 0, riskRating: 'high' } as Debtor;
      }
      return d;
    });
    setLocalDebtors(updated);
    setSelectedDebtor(updated.find(item => item.id === selectedDebtor.id) || null);

    const auditObj: DebtorAuditLog = {
      id: `aud-${Date.now()}`,
      date: new Date().toLocaleString(),
      user: 'Supervisor 1234',
      customerName: selectedDebtor.name,
      action: 'Debt Write-Off',
      reason: writeOffReason || 'Uncollectible liability accounts',
      outcome: `Written off ${formatCurrency(previousAmount, currency)}. Account balance cleared.`
    };
    setAuditLogs([auditObj, ...auditLogs]);

    setWriteOffReason('');
    setWriteOffManagerPin('');
    setWriteOffSuccess(true);
    setTimeout(() => setWriteOffSuccess(false), 5000);

    triggerNotification(`Written Off: Successfully expunged debt asset for ${selectedDebtor.name}.`);
  };

  // 5. CREATE PAYMENT INSTALLMENT PLAN
  const handleCreatePaymentPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor) return;
    const amount = Number(planAmount);
    if (isNaN(amount) || amount <= 0) return;

    const dates: string[] = [];
    for (let i = 1; i <= planInstallments; i++) {
      const d = new Date();
      d.setDate(d.getDate() + (i * 7));
      dates.push(d.toISOString().split('T')[0]);
    }

    const newPlan: PaymentPlan = {
      id: `plan-${Date.now()}`,
      customerName: selectedDebtor.name,
      totalAmount: amount,
      installments: planInstallments,
      freq: 'Weekly',
      progress: 0,
      dueDates: dates
    };

    setPaymentPlans([newPlan, ...paymentPlans]);

    const auditObj: DebtorAuditLog = {
      id: `aud-${Date.now()}`,
      date: new Date().toLocaleString(),
      user: 'Owner',
      customerName: selectedDebtor.name,
      action: 'Installment Setup',
      reason: 'Structured cooperative repayment flow',
      outcome: `Created plan for ${formatCurrency(amount, currency)} inside ${planInstallments} weeks installments.`
    };
    setAuditLogs([auditObj, ...auditLogs]);

    setPlanAmount('');
    setPlanSuccess(true);
    setTimeout(() => setPlanSuccess(false), 5000);

    triggerNotification(`Created plan! Structured ${planInstallments} weekly cycles for ${selectedDebtor.name}.`);
  };

  // Reminder message templates
  const reminderTemplates = {
    upcoming: {
      type: 'Friendly Alert',
      text: (name: string, amt: number) => `Hello ${name}, this is a gentle reminder that your tab balance of ${formatCurrency(amt, currency)} is due shortly. Please disregard if payment is in transit. Thank you!`
    },
    today: {
      type: 'Standard Notice',
      text: (name: string, amt: number) => `Dear ${name}, your outstanding account credit balance of ${formatCurrency(amt, currency)} is due today. Kindly complete checkout payments to maintain smooth credit limits approval.`
    },
    overdue: {
      type: 'Urgent Alert',
      text: (name: string, amt: number) => `Urgent Notice: Dear ${name}, your store credit balance is overdue by multiple weeks. Outstanding: ${formatCurrency(amt, currency)}. Please settle immediately or credit limits will lock.`
    },
    final: {
      type: 'Final Notice',
      text: (name: string, amt: number) => `FINAL REMINDER: Customer ${name}, your outstanding liability of ${formatCurrency(amt, currency)} will be written off or flagged to supervisor legal credit logs. Direct access is currently restricted.`
    }
  };

  // Ranked Queue based on overdue factors count
  const rankedCollectionQueue = useMemo(() => {
    return [...localDebtors]
      .filter(d => d.amountOwed > 0)
      .sort((a, b) => {
        const factorA = a.amountOwed * (a.riskRating === 'high' ? 2 : 1) * (100 - a.creditScore);
        const factorB = b.amountOwed * (b.riskRating === 'high' ? 2 : 1) * (100 - b.creditScore);
        return factorB - factorA;
      });
  }, [localDebtors]);

  // Simulate exporting report
  const simulateExportReport = (format: 'pdf' | 'excel', reportName: string) => {
    alert(`Success: "${reportName}" exported formats mapped fully! Simulating secure local download for "${reportName}.${format}"...`);
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in text-left font-sans select-none text-zinc-300 w-full" id="debtors-advanced-dashboard">
      
      {/* HEADER SECTION - SAME AS HOME DASHBOARD STYLE */}
      <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-none" id="debtors-header-nav">
        {/* Left Side: Store Identity & QuickBooks logo */}
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded bg-[#db2777] flex items-center justify-center text-white font-bold text-lg shadow-none shrink-0 select-none lowercase">
            ev
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md font-sans">
                Debtor Registers Control
              </h2>
              <span className="bg-pink-950/40 text-[#db2777] text-[9px] font-bold px-2 py-0.5 rounded border border-[#db2777]/35 uppercase tracking-widest shrink-0 font-mono">
                Asset Sentry
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Analyze credit liabilities, enforce overdue restrictions, schedule custom payment plans, and dispatch targeted notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap" id="debtors-actions-bar">
          <span className="text-[9px] uppercase font-bold py-1.5 px-3 bg-red-950/40 text-rose-400 border border-red-900/40 rounded flex items-center gap-1 font-sans">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Overdue Priority Check Active</span>
          </span>
        </div>
      </div>

      {/* 2. LIVE SUCCESS NOTIFICATION FEED TOAST */}
      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded border border-[#db2777]/30 bg-[#0e0e11] text-zinc-200 font-sans shadow-xl flex items-center gap-3 max-w-sm animate-bounce" id="local-debtor-toast">
          <div className="p-1.5 bg-[#db2777] rounded text-white">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-xs font-bold block text-[#db2777]">Transaction Logged Successfully</strong>
            <p className="text-[10px] text-zinc-400 font-medium">{statusNotification}</p>
          </div>
        </div>
      )}

      {/* 3. FOUR TABS CONTROL STRIP */}
      <div className="flex border-b border-[#27272a] pb-1 text-zinc-300 font-sans select-none overflow-x-auto scrollbar-none items-center gap-1.5" id="debtors-hub-tabs">
        {[
          { tab: 'overview', label: 'Overview Hub', icon: <Activity className="w-3.5 h-3.5" /> },
          { tab: 'debtors', label: 'Debtors Ledger', icon: <User className="w-3.5 h-3.5" /> },
          { tab: 'collections', label: 'Recovery Automation', icon: <MessageSquare className="w-3.5 h-3.5" /> },
          { tab: 'risk', label: 'Overdraft Risk Analysis', icon: <ShieldCheck className="w-3.5 h-3.5" /> }
        ].map((t) => {
          const isActive = activeTab === t.tab;
          return (
            <button
              key={t.tab}
              onClick={() => {
                setActiveTab(t.tab as any);
                if (t.tab !== 'debtors' && initialDebtors.length > 0 && !selectedDebtor) {
                  setSelectedDebtor(initialDebtors[0]);
                }
              }}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded text-xs font-bold transition-all duration-150 whitespace-nowrap cursor-pointer border ${
                isActive 
                  ? 'bg-pink-950/40 text-[#db2777] border-[#db2777]/35' 
                  : 'bg-[#18181b] text-zinc-400 border-[#27272a] hover:bg-zinc-800/40'
              }`}
            >
              <span className={isActive ? 'text-[#db2777]' : 'text-zinc-500'}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. MAIN INTERACTIVE VIEWS */}
      <div id="debtors-view-space">
        
        {/* TAB 1: OVERVIEW HUB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in" id="overview-pane">
            
            {/* LARGE METRICS BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
              
              <div className="bg-[#0e0e11] border border-[#27272a] p-5 rounded-lg shadow-none">
                <span className="text-[10px] font-black uppercase text-zinc-400 font-mono block">Total Outstanding Debt</span>
                <p className="text-xl md:text-2xl font-bold font-sans text-white mt-2">
                  {formatCurrency(debtMetrics.totalOutstanding, currency)}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-rose-400 font-bold bg-rose-950/40 px-2 py-1 rounded w-fit">
                  <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>Uncollected retail assets</span>
                </div>
              </div>

              <div className="bg-[#0e0e11] border border-[#27272a] p-5 rounded-lg shadow-none">
                <span className="text-[10px] font-black uppercase text-zinc-400 font-mono block">Active Customer Tabs</span>
                <p className="text-xl md:text-2xl font-bold font-sans text-white mt-2">
                  {debtMetrics.activeDebtorsCount} Active
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-zinc-300 font-bold bg-zinc-800 px-2 py-1 rounded w-fit">
                  <User className="w-3 h-3 text-zinc-400" />
                  <span>Authorized users profiles</span>
                </div>
              </div>

              <div className="bg-[#0e0e11] border border-[#27272a] p-5 rounded-lg shadow-none">
                <span className="text-[10px] font-black uppercase text-zinc-300 font-mono block">Overdue Collections</span>
                <p className="text-xl md:text-2xl font-bold font-sans text-rose-500 mt-2">
                  {debtMetrics.overdueDebtorsCount} Accounts
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-rose-400 font-bold bg-rose-950/40 px-2 py-1 rounded w-fit">
                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>Immediate alerts required</span>
                </div>
              </div>

              <div className="bg-[#0e0e11] border border-[#27272a] p-5 rounded-lg shadow-none">
                <span className="text-[10px] font-black uppercase text-zinc-400 font-mono block">Scheduled for this Week</span>
                <p className="text-xl md:text-2xl font-bold font-sans text-[#db2777] mt-2">
                  {formatCurrency(debtMetrics.amountDueThisWeekCount, currency)}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-pink-300 font-bold bg-pink-950/40 px-2 py-1 rounded w-fit">
                  <Calendar className="w-3 h-3 text-[#db2777]" />
                  <span>Cycle projection estimate</span>
                </div>
              </div>

            </div>

            {/* AI DEBTOR ASSISTANT CONSOLE */}
            <div className="bg-[#0e0e11] border border-[#27272a] p-6 rounded-lg" id="ai-debtor-assistant">
              <div className="flex items-center gap-2 text-white select-none">
                <Sparkles className="w-5 h-5 text-[#db2777]" />
                <h3 className="text-sm font-bold font-display">Debtor Forensic AI Consultant</h3>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 select-none">Instantly audit liabilities. Select prompts below or describe criteria to investigate outstanding profiles.</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-4 select-none">
                {[
                  { q: "Who owes me the most money?", label: "🏆 Largest Liabilities" },
                  { q: "Which debts are overdue?", label: "📅 Overdue Accounts" },
                  { q: "Who is likely to default?", label: "⚠️ Default Probabilities" },
                  { q: "Show collection priorities.", label: "🔥 Collections Priorities" }
                ].map((sug, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleAskDebtorAI(sug.q)}
                    className="p-3 bg-white hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-400 font-semibold font-sans rounded-xl text-left text-[11px] text-indigo-950 transition cursor-pointer flex items-center justify-between"
                  >
                    <span>{sug.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                  </button>
                ))}
              </div>

              {/* AI response panel */}
              {aiResponse && (
                <div className="mt-4 bg-white border border-indigo-250 p-5 rounded-2xl animate-fade-in font-sans">
                  <strong className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 block mb-1">AI Recommendation Answer</strong>
                  <p className="text-gray-900 text-xs leading-relaxed font-sans">{aiResponse.answer}</p>
                  
                  <div className="mt-3.5 pt-3.5 border-t border-neutral-100 flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-mono text-gray-500 block">Supporting Audits Evidence</span>
                    {aiResponse.evidence.map((ev, eIdx) => (
                      <p key={eIdx} className="text-[11px] font-mono text-gray-700 flex items-center gap-1.5">
                        <span className="text-amber-500 font-bold">&bull;</span>
                        {ev}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* COLLECTION PRIORITIES REGISTER (Prioritizes Highest Balance & Default Probability) */}
            <div className="bg-white border-2 border-black rounded-[24px] overflow-hidden shadow-sm" id="collection-priority-table">
              <div className="p-5 border-b border-gray-150 select-none flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-xs font-black uppercase text-gray-900 font-mono tracking-wider">Top Collection Priority Cue</h3>
                  <p className="text-[10px] text-[#757575] mt-0.5">Prioritized automatically by outstanding balance size weighted with payment scoring coefficients.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('collections')}
                  className="px-3 py-1.5 border border-black hover:bg-neutral-50 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer"
                >
                  Configure Reminds
                </button>
              </div>

              <div className="divide-y divide-gray-100 font-sans">
                {rankedCollectionQueue.slice(0, 3).map((item, idx) => (
                  <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center font-mono font-black text-xs text-[#1F1F1F] bg-neutral-100 self-center select-none">
                        0{idx+1}
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-gray-950 block font-display">{item.name}</strong>
                        <p className="text-[10px] text-[#757575] font-mono mt-1">
                          Phone: {item.phone} &bull; Days Overdue: <span className="text-red-700 font-bold">{Math.floor((100 - item.creditScore) * 0.3) + 7} days</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-gray-900">{formatCurrency(item.amountOwed, currency)}</span>
                      <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border block mt-1.5 select-none w-fit ml-auto ${
                        item.riskRating === 'high' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        {item.riskRating} risk (Default Probability: {100 - item.creditScore}%)
                      </span>
                    </div>

                    <div className="self-center shrink-0">
                      <button
                        onClick={() => {
                          setSelectedDebtor(item);
                          setActiveTab('debtors');
                        }}
                        className="px-4.5 py-2 hover:bg-[#111111] bg-indigo-700 hover:text-white text-white font-bold rounded-full text-xs transition cursor-pointer w-full uppercase tracking-wider text-center"
                      >
                        Enforce Collections Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: DEBTORS LEDGER */}
        {activeTab === 'debtors' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in" id="debtors-ledger-screen">
            
            {/* LEFT: MASTER LIST WITH INTERACTIVE FILTERS */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden flex flex-col">
              
              {/* LEDGER HEADER LINE */}
              <div className="p-4 border-b border-neutral-150 flex items-center justify-between bg-neutral-50/20">
                <span className="text-xs font-bold text-neutral-800">Debtor Ledger Accounts ({filteredDebtors.length})</span>
                <button
                  type="button"
                  onClick={() => setShowAddDebtorModal(true)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] uppercase rounded-full flex items-center gap-1 cursor-pointer transition shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 shrink-0" /> Register Debtor
                </button>
              </div>

              {/* FILTERS TOOLBAR */}
              <div className="p-4 border-b border-gray-150 grid grid-cols-1 md:grid-cols-2 gap-3.5 select-none bg-neutral-50/40">
                <div className="relative">
                  <Search className="absolute left-4 top-3 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, phone, or tab ID..."
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2 pl-11 pr-4 text-xs font-semibold placeholder:text-gray-400 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  {['all', 'active', 'overdue', 'high_risk', 'locked'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterCriteria(f as any)}
                      className={`text-[9.5px] font-black uppercase px-2.5 py-1.5 rounded-full border transition cursor-pointer ${
                        filterCriteria === f 
                          ? 'bg-[#111111] border-black text-white' 
                          : 'bg-white border-neutral-200 text-[#757575] hover:bg-neutral-50'
                      }`}
                    >
                      {f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIST ITEMS */}
              <div className="divide-y divide-gray-100 min-h-[400px]">
                {filteredDebtors.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDebtor(item)}
                    className={`p-5 flex items-center justify-between hover:bg-neutral-50/60 transition cursor-pointer ${
                      selectedDebtor?.id === item.id ? 'bg-indigo-50 border-l-4 border-indigo-700' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] font-semibold text-gray-400">{item.id}</span>
                        {item.locked && (
                          <span className="bg-red-50 border border-red-250 text-red-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-md font-mono flex items-center gap-0.5 select-none leading-none">
                            <Lock className="w-2 h-2" /> Locked
                          </span>
                        )}
                      </div>
                      <strong className="text-xs font-bold text-gray-900 block font-display leading-tight">{item.name}</strong>
                      <p className="text-[10px] text-[#757575] font-mono mt-1 leading-none font-semibold">
                        Phone: {item.phone} &bull; Term Date: {item.dueDate}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-gray-900 block">{formatCurrency(item.amountOwed, currency)}</span>
                      <span className={`text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-full border inline-block mt-1.5 select-none leading-none ${
                        item.riskRating === 'high' ? 'bg-red-50 border-red-150 text-red-700' : 'bg-emerald-50 border-emerald-150 text-emerald-800'
                      }`}>
                        {item.riskRating} risk (CScore: {item.creditScore}%)
                      </span>
                    </div>
                  </div>
                ))}

                {filteredDebtors.length === 0 && (
                  <div className="text-center py-20 text-gray-400 select-none">
                    <User className="w-12 h-12 mx-auto text-gray-200 mb-2" />
                    <p className="text-xs font-bold text-gray-700">No debtor profiles matching current filter levels.</p>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT: ADVANCED DETAIL PROFILE WITH LIVE ACTIONS VIEW */}
            <div className="bg-white border-2 border-black rounded-[24px] p-6 shadow-xs flex flex-col space-y-6">
              {selectedDebtor ? (
                <>
                  
                  {/* Basic Profile Info Header */}
                  <div className="border-b border-gray-150 pb-4">
                    <span className="text-[9px] font-black uppercase text-gray-400 block font-mono">Debtor Customer profile</span>
                    <h3 className="font-display font-medium text-gray-900 text-base mt-0.5 flex items-center justify-between">
                      {selectedDebtor.name}
                      <span className="font-mono text-xs text-gray-400 font-semibold">{selectedDebtor.id}</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] font-mono text-[#757575] leading-normal font-semibold">
                      <div>
                        <p className="text-gray-400">Mobile Phone</p>
                        <p className="text-gray-800">{selectedDebtor.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Term Dates deadline</p>
                        <p className="text-gray-800">{selectedDebtor.dueDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Core Debt numbers balance sheet */}
                  <div className="bg-neutral-50 p-4 border border-neutral-150 rounded-2xl select-none space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-semibold">Outstanding Total Debt</span>
                      <strong className="font-mono font-bold text-gray-950 text-base">
                        {formatCurrency(selectedDebtor.amountOwed, currency)}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-neutral-200/60 text-[10px] font-mono">
                      <div>
                        <p className="text-gray-400">Available Credits</p>
                        <p className="font-bold text-emerald-800">
                          {formatCurrency(selectedDebtor.locked ? 0 : 300000 - selectedDebtor.amountOwed, currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Approved Credit limit</p>
                        <p className="font-bold text-gray-800">
                          {formatCurrency(selectedDebtor.locked ? 0 : 300000, currency)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Risk Score meters details */}
                  <div className="border border-indigo-200/50 p-4 bg-indigo-50/20 rounded-2xl space-y-2 select-none">
                    <span className="text-[9px] font-black uppercase text-indigo-700 block font-mono">AI Forensic Credit Rating</span>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-indigo-900 font-semibold">Risk score coefficient</span>
                      <strong className={`font-mono font-black ${selectedDebtor.creditScore < 60 ? 'text-red-700' : 'text-emerald-700'}`}>
                        {selectedDebtor.creditScore}% reliability
                      </strong>
                    </div>

                    <div className="text-[10px] text-indigo-950 leading-relaxed font-sans bg-white p-2.5 rounded-lg border border-indigo-100">
                      <strong>AI Advice:</strong> {selectedDebtor.creditScore < 60 
                        ? `Suspend POS drafts. Outstanding exceeds 40% of baseline checkout frequency.` 
                        : `Account operates safe baseline. Maintain weekly checkout approvals.`}
                    </div>
                  </div>

                  {/* PAYMENT REPAYMENT FORM */}
                  {!recordingPayment ? (
                    <button
                      onClick={() => setRecordingPayment(true)}
                      className="w-full bg-[#111111] hover:bg-neutral-900 hover:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-transparent shadow-2xs select-none uppercase tracking-wide"
                    >
                      <DollarSign className="w-4.5 h-4.5" />
                      Record Transaction Payment
                    </button>
                  ) : (
                    <form onSubmit={handleSavePayment} className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3 animate-fade-in font-sans">
                      <strong className="text-[10px] uppercase font-mono tracking-wider text-amber-900 block font-black">Record cash Payment</strong>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-semibold">Repayment Amount received</label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="e.g. 20000"
                          className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs focus:outline-hidden font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1 select-none">
                        <label className="text-[10px] text-gray-500 font-semibold">Payment Methods channel</label>
                        <div className="grid grid-cols-3 gap-1">
                          {['Cash', 'Bank Transfer', 'Card'].map((ch) => (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => setPaymentMethod(ch as any)}
                              className={`py-1 rounded-md text-[10px] font-bold cursor-pointer transition ${
                                paymentMethod === ch ? 'bg-[#111111] text-white' : 'bg-white border border-neutral-200 text-gray-600'
                              }`}
                            >
                              {ch}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-2 select-none">
                        <button
                          type="button"
                          onClick={() => setRecordingPayment(false)}
                          className="px-3 py-1.5 rounded-lg border border-neutral-350 bg-white text-[10px] text-gray-600 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer"
                        >
                          Save Ledger
                        </button>
                      </div>
                    </form>
                  )}

                  {/* CORE BUTTON ACTIONS ROW */}
                  <div className="grid grid-cols-2 gap-2 select-none">
                    
                    <button
                      onClick={() => handleLocalToggleLock(selectedDebtor.id)}
                      className={`py-2.5 rounded-lg text-[11px] font-bold cursor-pointer transition border text-center flex items-center justify-center gap-1.5 ${
                        selectedDebtor.locked 
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100' 
                          : 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100'
                      }`}
                    >
                      {selectedDebtor.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{selectedDebtor.locked ? 'Unlock Tab' : 'Suspend Credit'}</span>
                    </button>

                    <button
                      onClick={() => handleSavePayment({ preventDefault: () => {} } as any)}
                      className="py-2.5 rounded-lg text-[11px] font-bold cursor-pointer transition border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-center flex items-center justify-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-indigo-700" />
                      <span>WhatsApp Notify</span>
                    </button>

                  </div>

                  {/* CREDIT DETAILS EXTEND TOOL BAR */}
                  <div className="pt-4 border-t border-gray-150">
                    {!editLimits ? (
                      <button
                        onClick={() => setEditLimits(true)}
                        className="text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3" /> Customize Limits or Extend Term dates
                      </button>
                    ) : (
                      <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl space-y-3.5 animate-fade-in font-sans">
                        <strong className="text-[10px] uppercase font-mono tracking-wider text-gray-500 block">Manage thresholds Limits</strong>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold block">Revise Limit size</label>
                          <select 
                            value={customCreditLimit}
                            onChange={(e) => {
                              setCustomCreditLimit(e.target.value as any);
                              triggerNotification(`Credit limits adjusted to N${Number(e.target.value).toLocaleString()}`);
                            }}
                            className="w-full text-xs font-semibold p-1.5 bg-white border border-neutral-300 rounded-md focus:outline-hidden"
                          >
                            <option value="150000">₦150,000 baseline tabs</option>
                            <option value="300000">₦300,000 standard accounts</option>
                            <option value="500000">₦500,000 high partner credits</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold block">Extend Due Days limit</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="number"
                              value={extendDays}
                              onChange={(e) => setExtendDays(e.target.value)}
                              placeholder="e.g. 14 Days"
                              className="flex-1 text-xs p-1.5 border border-neutral-300 rounded-md focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={handleExtendDueDate}
                              className="px-3 bg-indigo-700 hover:bg-indigo-900 text-white rounded-md text-[10px] font-black uppercase cursor-pointer"
                            >
                              Apply
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditLimits(false)}
                          className="text-[10px] text-[#757575] font-bold hover:underline block"
                        >
                          Minimize options
                        </button>
                      </div>
                    )}
                  </div>

                  {/* LOGGED PAYMENT ARCHIVES */}
                  <div className="pt-4 border-t border-gray-150 space-y-3.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block font-mono select-none">Repayment Account History</span>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto">
                      {selectedDebtor.paymentHistory.map((ph, phIdx) => (
                        <div key={phIdx} className="flex justify-between items-center bg-white p-3 border border-neutral-205 rounded-xl text-[11px] font-mono shadow-2xs">
                          <span className="text-gray-500 font-sans">{ph.date}</span>
                          <span className="text-emerald-800 font-bold font-sans">+{formatCurrency(ph.amount, currency)}</span>
                        </div>
                      ))}
                      {selectedDebtor.paymentHistory.length === 0 && (
                        <p className="text-[10px] text-center text-gray-450 py-4 font-sans">No previous transactions registered.</p>
                      )}
                    </div>
                  </div>

                </>
              ) : (
                <div className="text-center py-20 text-gray-400 select-none font-sans">
                  <User className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-800">Select any debtor card on the left to review metrics.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: RECOVERY AUTOMATION */}
        {activeTab === 'collections' && (
          <div className="space-y-8 animate-fade-in" id="collections-screen">
            
            {/* WORKFLOW PIPELINE CHART PANEL */}
            <div className="bg-white border-2 border-black rounded-[24px] p-6 shadow-2xs select-none">
              <strong className="text-[10px] uppercase font-mono tracking-wider text-indigo-700 block mb-2">Automated Collections Pipeline Sequence</strong>
              <h3 className="text-sm font-bold text-gray-900 font-display">System Safeguards Cycle Map</h3>
              <p className="text-[11px] text-gray-500 leading-normal mt-0.5 mb-5 font-sans">Your recovery pipelines enforce automatic notifications &amp; escalating restrictions at due dates threshold limits.</p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-[10.5px] font-sans items-center">
                
                <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl relative">
                  <strong className="block text-indigo-950">1. Term Due Date</strong>
                  <span className="text-[9.5px] text-[#757575] block mt-1.5">Approaching limit deadline</span>
                </div>

                <div className="hidden md:flex justify-center items-center text-gray-400 font-bold">&#10142;</div>

                <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-250 rounded-2xl relative">
                  <strong className="block">2. Reminder Sent</strong>
                  <span className="text-[9.5px] text-emerald-800 block mt-1.5">SMS / WhatsApp integration dispatch</span>
                </div>

                <div className="hidden md:flex justify-center items-center text-gray-400 font-bold">&#10142;</div>

                <div className="p-4 bg-amber-50 text-amber-950 border border-amber-250 rounded-2xl relative">
                  <strong className="block">3. Due Overdue Passed</strong>
                  <span className="text-[9.5px] text-amber-800 block mt-1.5">Default probability escalates</span>
                </div>

              </div>
            </div>

            {/* QUEUE & AUTOMATION TEMPLATE SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* LEFT: TEMPLATE BUILDER SELECTOR */}
              <div className="bg-white border border-neutral-200 rounded-[24px] p-6 shadow-2xs space-y-6">
                
                <div className="select-none">
                  <span className="text-[9px] font-black uppercase text-gray-400 block font-mono">Reminder presets</span>
                  <h3 className="text-xs font-black uppercase text-gray-900 font-mono tracking-wider mt-0.5">Automated SMS/WhatsApp Engine</h3>
                  
                  <div className="flex flex-col gap-1.5 mt-4">
                    {[
                      { tab: 'upcoming', label: 'Upcoming Due Date', desc: 'Sent 3 days prior to term deadline' },
                      { tab: 'today', label: 'Due Today Notice', desc: 'Sent on the due date morning' },
                      { tab: 'overdue', label: 'Overdue Balance Warning', desc: 'Sent after breaching date terms' },
                      { tab: 'final', label: 'Final Legal Demand notice', desc: 'Sent prior to account block restrictions' }
                    ].map((tpl) => (
                      <button
                        key={tpl.tab}
                        onClick={() => {
                          setActiveReminderTemplate(tpl.tab as any);
                          triggerNotification(`Switched template to "${tpl.label}"`);
                        }}
                        className={`p-3 rounded-xl border text-left transition select-none cursor-pointer ${
                          activeReminderTemplate === tpl.tab 
                            ? 'bg-indigo-50/70 border-indigo-450 text-indigo-950' 
                            : 'bg-white border-neutral-200 text-gray-500 hover:bg-neutral-50'
                        }`}
                      >
                        <strong className="text-[11px] block">{tpl.label}</strong>
                        <span className="text-[9px] text-[#757575] font-mono leading-none">{tpl.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template Preview Panel */}
                <div className="p-4 bg-blue-50/20 border border-indigo-150 rounded-2xl space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#757575] block font-mono select-none">Live Template Dispatch Preview</span>
                  <p className="text-[11px] text-gray-800 leading-relaxed font-sans italic bg-white p-3 border border-neutral-200 rounded-xl">
                    "{reminderTemplates[activeReminderTemplate].text(selectedDebtor?.name || 'Customer Name', selectedDebtor?.amountOwed || 48000)}"
                  </p>

                  <div className="flex gap-2 select-none">
                    <button
                      onClick={() => {
                        triggerNotification(`Success: Sent SMS reminder successfully to ${selectedDebtor?.name || 'contacts'}`);
                        const newAud: DebtorAuditLog = {
                          id: `aud-${Date.now()}`,
                          date: new Date().toLocaleString(),
                          user: 'Admin',
                          customerName: selectedDebtor?.name || 'Baba Sadiq',
                          action: 'Reminder Dispatch',
                          reason: `${activeReminderTemplate} Template Remind`,
                          outcome: 'Delivered via central SMS gateway'
                        };
                        setAuditLogs([newAud, ...auditLogs]);
                      }}
                      className="flex-1 py-2 bg-indigo-700 hover:bg-indigo-900 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer text-center flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Smartphone className="w-3.5 h-3.5 shrink-0" /> Dispatch SMS
                    </button>
                    <button
                      onClick={() => triggerNotification(`Success: WhatsApp reminder launched for ${selectedDebtor?.name || 'co'}`)}
                      className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer text-center flex items-center justify-center"
                      title="Direct Share via WhatsApp Web"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>

              </div>

              {/* RIGHT: DETAILED AUTOMATIC PRIORITY QUEUE LIST */}
              <div className="lg:col-span-2 bg-white border border-neutral-250 rounded-[24px] overflow-hidden shadow-2xs">
                <div className="p-5 border-b border-gray-150 select-none flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h3 className="text-xs font-black uppercase text-gray-900 font-mono tracking-wider">Collections Queue Queue</h3>
                    <p className="text-[10px] text-[#757575] mt-0.5">Calculated automatically utilizing balance size weighted with days overdue &risk scoring coefficient factors.</p>
                  </div>
                  <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 bg-indigo-50 border text-indigo-700 rounded-md">
                    Live Ranked
                  </span>
                </div>

                <div className="divide-y divide-gray-100 font-sans">
                  {rankedCollectionQueue.map((item, idx) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 select-none">
                          <span className="text-[10px] font-mono font-bold text-gray-400">Idx 0{idx+1}</span>
                          <span className={`text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded-md border ${
                            item.riskRating === 'high' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-250 text-amber-700'
                          }`}>
                            {item.riskRating} risk
                          </span>
                        </div>
                        <strong className="text-xs font-bold text-gray-950 font-display block mt-1">{item.name}</strong>
                        <p className="text-[10.5px] text-[#757575] mt-1 font-semibold">
                          Phone: {item.phone} &bull; Missed Payments: <span className="font-mono text-red-700 font-bold">{item.creditScore < 60 ? '3' : '1'} times</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0 select-none">
                        <span className="text-xs font-mono font-bold text-gray-950 block">{formatCurrency(item.amountOwed, currency)}</span>
                        <span className="text-[10px] text-[#757575] font-mono mt-1 font-semibold block">DueDate Term: {item.dueDate}</span>
                      </div>

                      <div className="self-center shrink-0">
                        <button
                          onClick={() => {
                            setSelectedDebtor(item);
                            triggerNotification(`Pending reminder queued for ${item.name}!`);
                          }}
                          className="px-4 py-1.5 hover:bg-indigo-50 border-2 border-black hover:scale-105 transition rounded-full text-xs font-bold text-gray-950 cursor-pointer"
                        >
                          Push Reminder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: OVERDRAFT RISK ANALYSIS */}
        {activeTab === 'risk' && (
          <div className="space-y-8 animate-fade-in" id="risk-analysis-hub">
            
            {/* FIRST ROW: RISK GROUPS LIST & AI ADVOCACY CREATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* LEFT COLUMN: RISK GROUPS CARDBOARD */}
              <div className="bg-white border border-neutral-200 p-6 rounded-[24px] shadow-2xs space-y-6 select-none">
                
                <div>
                  <h3 className="text-xs font-black uppercase text-gray-900 font-mono tracking-wider">Risk Segment Categorizations</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-sans">Active profiles grouped dynamically based on historical payments scoring thresholds.</p>
                </div>

                <div className="space-y-3 font-sans">
                  
                  <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-red-900 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        High Risk accounts (score &lt; 60%)
                      </strong>
                      <span className="font-mono font-bold text-red-700">
                        {localDebtors.filter(d => d.riskRating === 'high').length} Debtors
                      </span>
                    </div>
                    <ul className="mt-2 text-[10px] text-red-800 space-y-1 font-mono font-semibold">
                      {localDebtors.filter(d => d.riskRating === 'high').map(d => (
                        <li key={d.id}>&bull; {d.name} ({formatCurrency(d.amountOwed, currency)})</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-amber-900 font-bold flex items-center gap-1">
                        <Sliders className="w-4 h-4 text-amber-600" />
                        Medium Risk (60% - 80%)
                      </strong>
                      <span className="font-mono font-bold text-amber-700 animate-pulse">
                        {localDebtors.filter(d => d.riskRating === 'medium').length} Debtors
                      </span>
                    </div>
                    <ul className="mt-2 text-[10px] text-amber-800 space-y-1 font-mono font-semibold">
                      {localDebtors.filter(d => d.riskRating === 'medium').map(d => (
                        <li key={d.id}>&bull; {d.name} ({formatCurrency(d.amountOwed, currency)})</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-250 rounded-xl">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="font-bold flex items-center gap-1">
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                        Low Risk Accounts (&gt; 80%)
                      </strong>
                      <span className="font-mono font-bold text-emerald-800">
                        {localDebtors.filter(d => d.riskRating === 'low').length} Debtors
                      </span>
                    </div>
                  </div>

                </div>

                {/* Risk Factors Checklist Info */}
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-150 space-y-2">
                  <span className="text-[10px] font-black uppercase text-[#757575] block font-mono">Liability risk coefficients</span>
                  <ul className="space-y-1 text-[10.5px] text-gray-600 font-medium">
                    <li>&bull; Days past due matrices indices</li>
                    <li>&bull; Extreme available credit utilization levels</li>
                    <li>&bull; Historical missed checkout cycles warnings</li>
                  </ul>
                </div>

              </div>

              {/* MIDDLE COLUMN: CREDIT REPAYMENT PLANS CREATOR */}
              <div className="bg-white border border-neutral-200 p-6 rounded-[24px] shadow-2xs space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase text-gray-900 font-mono tracking-wider">Installments payment Plan Builder</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Structure a cooperative, scheduled weak installments repayment sequence to de-escalate liability profiles.</p>
                </div>

                <form onSubmit={handleCreatePaymentPlan} className="space-y-4 font-sans">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-semibold block">Select Debtor Target Profile</label>
                    <select
                      value={selectedDebtor?.id || ''}
                      onChange={(e) => {
                        const target = localDebtors.find(d => d.id === e.target.value) || null;
                        setSelectedDebtor(target);
                      }}
                      className="w-full text-xs font-bold p-2 bg-white border border-neutral-300 rounded-lg focus:outline-hidden"
                      required
                    >
                      <option value="" disabled>-- Pick Outstanding Profile --</option>
                      {localDebtors.filter(d => d.amountOwed > 0).map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({formatCurrency(d.amountOwed, currency)} owed)</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-semibold block">Total amount to defer</label>
                    <input 
                      type="number"
                      placeholder="e.g. 50000"
                      value={planAmount}
                      onChange={(e) => setPlanAmount(e.target.value)}
                      className="w-full text-xs font-mono p-2 border border-neutral-300 rounded-lg focus:outline-hidden"
                      required
                    />
                  </div>

                  <div className="space-y-1 select-none">
                    <label className="text-[10px] text-gray-500 font-semibold block">Installments cycle count</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[3, 4, 6].map((it) => (
                        <button
                          key={it}
                          type="button"
                          onClick={() => setPlanInstallments(it)}
                          className={`py-1.5 rounded-md text-[10px] font-bold cursor-pointer transition ${
                            planInstallments === it ? 'bg-[#111111] text-white' : 'bg-white border border-neutral-250 text-gray-600'
                          }`}
                        >
                          {it} Weeks
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-900 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1 uppercase select-none tracking-wide"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" /> Restructure Balance
                  </button>

                  {planSuccess && (
                    <p className="text-[10.5px] font-bold text-center text-emerald-800 bg-emerald-50 border border-emerald-250 rounded-lg py-2 animate-pulse select-none">
                      🎉 Repayment Installment plan compiled successfully!
                    </p>
                  )}
                </form>

                {/* Payment plans tracked list progress */}
                <div className="pt-4 border-t border-gray-150 space-y-3.5">
                  <span className="text-[9px] font-black uppercase text-gray-400 font-mono tracking-widest block select-none">Active restructurings Progress</span>
                  {paymentPlans.map(plan => (
                    <div key={plan.id} className="bg-neutral-50 p-3 border border-neutral-200 rounded-xl space-y-2 text-[10.5px] font-semibold text-gray-700">
                      <div className="flex justify-between font-bold">
                        <span>{plan.customerName} Plan</span>
                        <span className="font-mono text-emerald-800">{formatCurrency(plan.totalAmount, currency)}</span>
                      </div>
                      <div className="w-full bg-neutral-250 h-1.5 rounded-full overflow-hidden select-none">
                        <div className="bg-emerald-600 h-full transition-all" style={{ width: `${plan.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* RIGHT COLUMN: MANAGER APPROVAL DEBT WRITE-OFF FORM */}
              <div className="bg-white border-2 border-black rounded-[24px] p-6 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase text-red-700 font-mono tracking-wider flex items-center gap-1 select-none">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    Bypass accounts Write-Off authorization
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Expunge uncollectible liabilities dynamically. This high-risk authorization deletes the debtor tab balance asset and creates an immutable audit log entry.</p>
                </div>

                <form onSubmit={handleWriteOffDebt} className="space-y-4 font-sans">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 block font-semibold">Select Debtor Balance to Purge</label>
                    <select
                      value={selectedDebtor?.id || ''}
                      onChange={(e) => {
                        const target = localDebtors.find(d => d.id === e.target.value) || null;
                        setSelectedDebtor(target);
                      }}
                      className="w-full text-xs font-bold p-2 bg-white border border-neutral-300 rounded-lg focus:outline-hidden"
                      required
                    >
                      <option value="" disabled>-- Select account to write-off --</option>
                      {localDebtors.filter(d => d.amountOwed > 0).map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({formatCurrency(d.amountOwed, currency)} uncollectible)</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 block font-semibold">Expunge Justification reason</label>
                    <input 
                      type="text"
                      placeholder="e.g. Relocated out of state / Insolvency"
                      value={writeOffReason}
                      onChange={(e) => setWriteOffReason(e.target.value)}
                      className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-hidden"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-gray-500 block font-semibold">Overdue bypass Manager PIN</label>
                      <span className="text-[9px] text-[#757575] font-mono leading-none flex items-center gap-0.5">Check bypass: (1234)</span>
                    </div>
                    <input 
                      type="password"
                      placeholder="Enter credential PIN"
                      value={writeOffManagerPin}
                      onChange={(e) => setWriteOffManagerPin(e.target.value)}
                      className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-hidden font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-700 hover:bg-neutral-900 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 uppercase select-none tracking-wide"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" /> Expunge Account balance safely
                  </button>

                  {writeOffSuccess && (
                    <p className="text-[10.5px] font-bold text-center text-red-850 bg-red-50 border border-red-200 rounded-lg py-2 animate-bounce select-none">
                      🛡️ Account balance purged. Immutable trace updated.
                    </p>
                  )}
                </form>

              </div>

            </div>

            {/* SECOND ROW: AUDIT TRAIL LOGS STREAM TABLE */}
            <div className="bg-white border border-neutral-250 rounded-[24px] overflow-hidden shadow-2xs">
              <div className="p-5 border-b border-gray-150 select-none flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-xs font-black uppercase text-gray-900 font-mono tracking-wider">Immutable Operations Audit Trail</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Real-time trace logs capturing payment entries, credit lockdown status, term extensions and purged write-off justifications.</p>
                </div>
                <span className="text-[9px] font-mono text-gray-500 font-bold">
                  Immutable sequence log
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-sans border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/50 border-b border-gray-150 text-[#757575] font-mono select-none">
                      <th className="p-4 uppercase tracking-wider font-semibold">Timestamp</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">User Operator</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Customer target</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Authorized Action</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Justification Reason</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Operation Outfall</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50/40 transition">
                        <td className="p-4 font-mono text-[#5F6368] text-[10.5px] whitespace-nowrap">{log.date}</td>
                        <td className="p-4 font-mono">{log.user}</td>
                        <td className="p-4 font-display font-medium text-gray-950">{log.customerName}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 border border-indigo-200 text-indigo-850 rounded-md bg-indigo-50/50 text-[10px] block w-fit">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 font-sans text-[#757575] font-medium text-[10.5px]">{log.reason}</td>
                        <td className="p-4 font-mono text-gray-950 text-[10.5px]">{log.outcome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* THREE COLUMNS: AUTOMATED SYSTEM REFORTS WITH EXPORTS LAUNCHERS */}
            <div className="bg-white border-2 border-black rounded-[24px] p-6 shadow-2xs select-none">
              
              <div className="border-b border-neutral-150 pb-3 mb-5">
                <h3 className="text-xs font-black uppercase text-gray-900 font-mono tracking-wider">Collections PDF/Excel Export Reporting Center</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Generate analytical balance aging matrices or recovery coefficient summaries for administrative tax or cash reconciliations audits.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { name: 'Outstanding Debt Report', desc: 'Summary of uncollected assets by customer' },
                  { name: 'Overdue Collection priorities Report', desc: 'Ranks debtors outside contract grace terms' },
                  { name: 'Recovery performance matrices', desc: 'Measures cash collection coefficients monthly' },
                  { name: 'Credit Limit utilization logs', desc: 'Details credit caps relative to checkout frequency' },
                  { name: 'Debt Aging Matrices Report (30/60/90 days)', desc: 'Balances grouped by outstanding days terms' }
                ].map((rep, rIdx) => (
                  <div key={rIdx} className="p-4.5 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col justify-between gap-3 font-sans">
                    <div>
                      <strong className="text-xs font-bold text-gray-950 block leading-tight font-display">{rep.name}</strong>
                      <p className="text-[10px] text-gray-500 font-sans leading-normal mt-1.5">{rep.desc}</p>
                    </div>

                    <div className="flex gap-1.5 pt-2 border-t border-neutral-200 mt-2">
                      <button
                        onClick={() => simulateExportReport('pdf', rep.name)}
                        className="flex-1 py-1.5 bg-[#111111] hover:bg-neutral-800 text-white rounded-md text-[9.5px] font-black uppercase cursor-pointer text-center flex items-center justify-center gap-0.5"
                      >
                        <FileText className="w-3.5 h-3.5" /> PDF
                      </button>
                      <button
                        onClick={() => simulateExportReport('excel', rep.name)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[9.5px] font-black uppercase cursor-pointer text-center flex items-center justify-center gap-0.5"
                      >
                        <Download className="w-3.5 h-3.5" /> XLS
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* REGISTER NEW DEBTOR MODAL OVERLAY */}
      {showAddDebtorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in" id="add-debtor-modal-container">
          <div className="bg-white rounded-[32px] border border-neutral-150 shadow-2xl p-6 w-full max-w-md animate-scale-up" id="add-debtor-modal-inner">
            <div className="flex items-center justify-between mb-5 select-none">
              <h2 className="text-base font-sans font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <span>Register New Debtor Profile</span>
              </h2>
              <button 
                type="button"
                onClick={() => setShowAddDebtorModal(false)}
                className="p-1.5 hover:bg-neutral-100 rounded-full transition text-neutral-400 hover:text-neutral-950 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDebtor} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block mb-1">Customer Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={newDebtorName}
                    onChange={(e) => setNewDebtorName(e.target.value)}
                    placeholder="e.g. Alhaji Mansur"
                    className="w-full bg-white border border-[#E3E3E3] rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold placeholder:text-gray-400 focus:outline-[#111] focus:ring-1 focus:ring-[#111]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block mb-1">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    value={newDebtorPhone}
                    onChange={(e) => setNewDebtorPhone(e.target.value)}
                    placeholder="e.g. 08031234567"
                    className="w-full bg-white border border-[#E3E3E3] rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold placeholder:text-gray-400 focus:outline-[#111] focus:ring-1 focus:ring-[#111]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block mb-1">Initial Outstanding Debt ({currency})</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono text-xs font-bold">{currency}</span>
                  <input
                    type="number"
                    value={newDebtorAmount}
                    onChange={(e) => setNewDebtorAmount(e.target.value)}
                    placeholder="e.g. 75000"
                    className="w-full bg-white border border-[#E3E3E3] rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold placeholder:text-gray-400 focus:outline-[#111] focus:ring-1 focus:ring-[#111] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block mb-1">Payment Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="date"
                    value={newDebtorDueDate}
                    onChange={(e) => setNewDebtorDueDate(e.target.value)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold placeholder:text-gray-400 focus:outline-[#111] focus:ring-1 focus:ring-[#111] font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddDebtorModal(false)}
                  className="flex-1 py-3 text-xs font-bold text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-full transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition cursor-pointer text-center shadow-xs"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
