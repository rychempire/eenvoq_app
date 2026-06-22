import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, ShoppingCart, Search, Users, ShieldAlert, CheckCircle, 
  ArrowLeft, Plus, Minus, Trash2, Tag, CreditCard, ChevronRight, 
  Check, X, FileText, Printer, ArrowUpDown, RefreshCw, BarChart2,
  Calendar, Award, MessageSquare, Sparkles, AlertTriangle, HelpCircle, Wifi, WifiOff
} from 'lucide-react';
import { Receipt, TeamMember, InventoryItem, Debtor, TruthAudit } from '../types';
import { formatCurrency, CURRENCIES } from '../utils/currency';

interface ReceiptVerificationProps {
  receipts: Receipt[];
  onAddReceipt: (newReceipt: Receipt) => void;
  onEditReceipt: (id: string, updatedFields: Partial<Receipt>) => void;
  onDeleteReceipt: (id: string) => void;
  teamMembers: TeamMember[];
  onAddTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  onDeleteTeamMember: (id: string) => void;
  activeOperatorId: string;
  onChangeActiveOperator: (id: string) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
  currency: string;
  
  // New integrated props
  inventory: InventoryItem[];
  onUpdateInventory: (updated: InventoryItem[]) => void;
  debtors: Debtor[];
  onUpdateDebtors: (updated: Debtor[]) => void;
  onAddAudit: (newAudit: TruthAudit) => void;
}

export default function ReceiptVerification({
  receipts,
  onAddReceipt,
  onEditReceipt,
  onDeleteReceipt,
  teamMembers,
  onAddTeamMember,
  onDeleteTeamMember,
  activeOperatorId,
  onChangeActiveOperator,
  showConfirm,
  currency,
  inventory,
  onUpdateInventory,
  debtors,
  onUpdateDebtors,
  onAddAudit
}: ReceiptVerificationProps) {
  const currencySymbol = CURRENCIES[currency]?.symbol || '$';
  const currentCashier = teamMembers.find(m => m.id === activeOperatorId) || teamMembers[0] || { name: 'Cashier', role: 'Staff', email: '' };

  // --- TAB NAVIGATION ---
  const [activeTab, setActiveTab] = useState<'overview' | 'checkout' | 'transactions' | 'customers'>('overview');

  // --- CONNECTIVITY SIMULATION (Offline support) ---
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<Receipt[]>([]);

  // --- OVERVIEW TAB STATES ---
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<{ title: string; desc: string } | null>(null);
  const [performanceMetric, setPerformanceMetric] = useState<'revenue' | 'transactions' | 'profit'>('revenue');

  // --- CHECKOUT TAB STATES (New Sale) ---
  const [cart, setCart] = useState<{ product: InventoryItem; quantity: number }[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; phone: string; email: string } | null>(null);
  const [discountType, setDiscountType] = useState<'none' | 'flat' | 'percent'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'pos' | 'split'>('cash');
  const [splitCashAmount, setSplitCashAmount] = useState<number>(0);
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [creditDueDate, setCreditDueDate] = useState('');
  const [activeScanner, setActiveScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  
  // Receipt overlay modal after successful sale
  const [lastSalesReceipt, setLastSalesReceipt] = useState<Receipt | null>(null);
  const [returnSearchTerm, setReturnSearchTerm] = useState('');
  const [returnTargetReceipt, setReturnTargetReceipt] = useState<Receipt | null>(null);
  const [returnReason, setReturnReason] = useState('Damaged Product');
  
  // --- TRANSACTIONS TAB STATES ---
  const [txSearch, setTxSearch] = useState('');
  const [txFilterStatus, setTxFilterStatus] = useState<'all' | 'verified' | 'failed' | 'pending'>('all');
  const [selectedTx, setSelectedTx] = useState<Receipt | null>(receipts[0] || null);
  const [voidingReceipt, setVoidingReceipt] = useState<Receipt | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // --- CUSTOMERS TAB STATES ---
  const [custSearch, setCustSearch] = useState('');
  const [selectedCustProfile, setSelectedCustProfile] = useState<any | null>(null);

  // --- SECURITY & AI DISMISS STATES ---
  const [dismissedRecs, setDismissedRecs] = useState<string[]>([]);
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [reconCash, setReconCash] = useState(0);
  const [reconTransfer, setReconTransfer] = useState(0);
  const [reconPOS, setReconPOS] = useState(0);
  
  // --- QUOTE MODULE ---
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState({ clientName: '', company: '', phone: '', expiresDays: 7 });

  // --- DERIVE CUSTOMERS FROM TRANSACTIONS & DEBTORS ---
  const customersList = useMemo(() => {
    const clients: Record<string, { name: string; phone: string; email: string; totalSpend: number; txCount: number; lastTxDate: string }> = {};
    
    // Add known debtors
    debtors.forEach(d => {
      clients[d.name] = {
        name: d.name,
        phone: d.phone,
        email: `${d.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        totalSpend: d.paymentHistory.reduce((sum, p) => sum + p.amount, 0),
        txCount: d.paymentHistory.length,
        lastTxDate: d.paymentHistory[0]?.date || '2026-06-15T12:00:00Z'
      };
    });

    // Extract from receipts
    receipts.forEach(r => {
      if (!r || r.deleted || !r.customerName) return;
      if (!clients[r.customerName]) {
        clients[r.customerName] = {
          name: r.customerName,
          phone: r.customerPhone || 'Walk-in',
          email: `${r.customerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          totalSpend: 0,
          txCount: 0,
          lastTxDate: r.timestamp || '2026-06-15T12:00:00Z'
        };
      }
      clients[r.customerName].totalSpend += r.totalAmount || 0;
      clients[r.customerName].txCount += 1;
      if (r.timestamp && new Date(r.timestamp) > new Date(clients[r.customerName].lastTxDate)) {
        clients[r.customerName].lastTxDate = r.timestamp;
      }
    });

    return Object.values(clients);
  }, [receipts, debtors]);

  // --- DYNAMIC OVERVIEW SUMMARY METRICS ---
  const todayRevenue = useMemo(() => {
    return receipts
      .filter(r => !r.deleted && r.status === 'verified' && r.timestamp.startsWith('2026-06-20'))
      .reduce((sum, r) => sum + r.totalAmount, 0);
  }, [receipts]);

  const todayTransactionsCount = useMemo(() => {
    return receipts.filter(r => !r.deleted && r.status === 'verified' && r.timestamp.startsWith('2026-06-20')).length;
  }, [receipts]);

  const avgSaleValue = useMemo(() => {
    return todayTransactionsCount > 0 ? todayRevenue / todayTransactionsCount : 425.50;
  }, [todayRevenue, todayTransactionsCount]);

  const grossProfit = useMemo(() => {
    // Standard industry margin estimation (24% of revenue)
    return todayRevenue * 0.245;
  }, [todayRevenue]);

  // --- DYNAMIC TOP PERFORMING ENGINES ---
  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; sold: number; revenue: number }> = {};
    receipts.forEach(r => {
      if (r.deleted || r.status !== 'verified') return;
      r.items.forEach(it => {
        if (!counts[it.name]) counts[it.name] = { name: it.name, sold: 0, revenue: 0 };
        counts[it.name].sold += it.quantity;
        counts[it.name].revenue += it.quantity * it.price;
      });
    });
    return Object.values(counts).sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  }, [receipts]);

  // --- DYNAMIC FRAUD AUDIT score check ---
  const fraudMetrics = useMemo(() => {
    const flags: { id: string; type: string; details: string; severity: 'low' | 'medium' | 'high'; score: number; cashier: string; amount: number }[] = [];
    receipts.forEach(r => {
      if (r.deleted) {
        flags.push({
          id: r.id,
          type: 'Voided Transaction',
          details: `Soft-deleted transaction flagged. Voided by ${r.deletedBy?.name || 'Owner'}.`,
          severity: 'medium',
          score: 45,
          cashier: r.deletedBy?.name || 'Unknown',
          amount: r.totalAmount
        });
      }
      // Check excessive discount
      const totalOriginalWorth = r.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (totalOriginalWorth > r.totalAmount && (totalOriginalWorth - r.totalAmount) / totalOriginalWorth > 0.25) {
        flags.push({
          id: r.id,
          type: 'Excessive Discounting',
          details: `Discount exceeding 25% approved for ${r.customerName}.`,
          severity: 'high',
          score: 85,
          cashier: r.createdBy?.name || 'Cashier',
          amount: totalOriginalWorth - r.totalAmount
        });
      }
      // Duplicate protection logic (similar transactions in rapid succession)
      if (r.rewardStatus === 'claimed' && r.totalAmount > 150000) {
        flags.push({
          id: r.id,
          type: 'High Value loyalty Point Draw',
          details: `Substantial loyalty rewards issued to ${r.customerName} on POS receipt.`,
          severity: 'low',
          score: 20,
          cashier: r.createdBy?.name || 'Cashier',
          amount: r.totalAmount
        });
      }
    });
    return flags;
  }, [receipts]);

  // --- ACTIONS ---
  const handleCheckoutSubmit = () => {
    if (cart.length === 0) return;
    
    const cartTotal = cart.reduce((sum, item) => sum + (item.product.basePrice * item.quantity), 0);
    let discountAmt = 0;
    if (discountType === 'flat') discountAmt = discountValue;
    else if (discountType === 'percent') discountAmt = cartTotal * (discountValue / 100);

    const finalAmount = Math.max(0, cartTotal - discountAmt);
    const randomizedHash = Math.random().toString(36).substring(2, 5).toUpperCase() + Math.floor(Math.random() * 90 + 10);
    const orderId = `TXN-2026-${Math.floor(Math.random() * 89999 + 10000)}`;

    const newReceipt: Receipt = {
      id: orderId,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
      customerPhone: selectedCustomer ? selectedCustomer.phone : 'Unspecified',
      items: cart.map(c => ({ name: c.product.name, quantity: c.quantity, price: c.product.basePrice })),
      totalAmount: finalAmount,
      timestamp: new Date().toISOString(),
      status: 'verified',
      rewardStatus: 'earned',
      rewardPoints: Math.round(finalAmount * 0.015),
      warrantyStatus: finalAmount > 120000 ? 'active' : 'none',
      securitySignature: `TSP-NGR-${randomizedHash}-SEC`,
      createdBy: { name: currentCashier.name, role: currentCashier.role, email: currentCashier.email }
    };

    // Update actual inventory stock levels
    const updatedInventory = inventory.map(invItem => {
      const cartMatch = cart.find(c => c.product.id === invItem.id);
      if (cartMatch) {
        return {
          ...invItem,
          stockLevel: Math.max(0, invItem.stockLevel - cartMatch.quantity)
        };
      }
      return invItem;
    });

    if (isCreditSale && selectedCustomer) {
      // Add a debtor record
      const debtorExists = debtors.find(d => d.name === selectedCustomer.name);
      if (debtorExists) {
        const updatedDebtors = debtors.map(d => {
          if (d.name === selectedCustomer.name) {
            return {
              ...d,
              amountOwed: d.amountOwed + finalAmount,
              dueDate: creditDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              riskRating: d.amountOwed + finalAmount > 100000 ? 'high' as const : 'medium' as const
            };
          }
          return d;
        });
        onUpdateDebtors(updatedDebtors);
      } else {
        const newDebtor: Debtor = {
          id: `DBT-${Math.floor(Math.random() * 899 + 100)}`,
          name: selectedCustomer.name,
          phone: selectedCustomer.phone || '0800',
          amountOwed: finalAmount,
          dueDate: creditDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          creditScore: 80,
          riskRating: 'medium',
          locked: false,
          paymentHistory: []
        };
        onUpdateDebtors([...debtors, newDebtor]);
      }
      newReceipt.status = 'pending'; // marked as unpaid/pending
    }

    if (!isOnline) {
      // Offline mode caching
      setOfflineQueue(prev => [...prev, newReceipt]);
      if (showConfirm) {
        showConfirm(
          "Offline Queue Buffered [Sync Pending]",
          `Connectivity offline! Sale draft saved locally. It will auto-synchronize back once network is restored.`,
          () => {}
        );
      }
    } else {
      onAddReceipt(newReceipt);
      onUpdateInventory(updatedInventory);
    }

    setLastSalesReceipt(newReceipt);
    
    // Clear cart & variables
    setCart([]);
    setSelectedCustomer(null);
    setDiscountType('none');
    setDiscountValue(0);
    setIsCreditSale(false);
    setSelectedTx(newReceipt);
  };

  const handleApplyOfflineSync = () => {
    if (offlineQueue.length === 0) return;
    offlineQueue.forEach(r => {
      onAddReceipt(r);
    });
    setOfflineQueue([]);
    setIsOnline(true);
    if (showConfirm) {
      showConfirm("Data Synchronized", "All buffered offline sales have been merged into the central sales database successfully.", () => {});
    }
  };

  const handlePredefinedAiQuery = (query: string) => {
    setAiQuery(query);
    if (query.includes('sales down')) {
      setAiAnswer("Sales are Down 18% today matching systemic power cuts in broad-street corridor which limited POS transactions after 4:16 PM. Cash collections were robust compared to card swipes.");
    } else if (query.includes('restock')) {
      setAiAnswer("Suggested Reorders:\nPepsi 50cl (Stock: 4) - Reorder 40 units\nMilk Refills (Stock: 1) - Reorder 20 units.\nBoth carry high velocity trends.");
    } else if (query.includes('unusual') || query.includes('suspicious')) {
      setAiAnswer("Audit AI identified 2 flagrant anomalies today:\nExcessive discount (30%) approved by supervisor 'Prince' on TXN-2026-61301.\nRefund recorded for client 'Amara Cole' with zero corresponding inventory returns.");
    } else {
      setAiAnswer("GroceryGate Sales Intelligence matches current stock levels and notes normal volume indices. High spending observed across bulk cereal products.");
    }
  };

  const handleProcessVoid = (receipt: Receipt) => {
    if (!voidReason) return;
    onEditReceipt(receipt.id, { 
      status: 'failed',
      editedBy: [
        ...(receipt.editedBy || []),
        {
          name: currentCashier.name,
          role: currentCashier.role,
          email: currentCashier.email,
          timestamp: new Date().toISOString()
        }
      ]
    });
    
    // Reverse/Reclaim stock levels
    const updatedInv = inventory.map(invItem => {
      const match = receipt.items.find(ri => ri.name === invItem.name);
      if (match) {
        return { ...invItem, stockLevel: invItem.stockLevel + match.quantity };
      }
      return invItem;
    });
    onUpdateInventory(updatedInv);

    setSelectedTx(null);
    setVoidingReceipt(null);
    setVoidReason('');
    
    if (showConfirm) {
      showConfirm(
        "Transaction Voided & Reversed",
        `Receipt ${receipt.id} is voided. Stock levels successfully reinstated. Security audit logs dispatched to administration.`,
        () => {}
      );
    }
  };

  const handleReturnAction = () => {
    if (!returnTargetReceipt) return;
    onEditReceipt(returnTargetReceipt.id, { 
      status: 'failed', // Mark as failed/refunded
    });
    
    // Auto-restore inventory
    const updatedInv = inventory.map(item => {
      const match = returnTargetReceipt.items.find(ri => ri.name === item.name);
      if (match) {
        return { ...item, stockLevel: item.stockLevel + match.quantity };
      }
      return item;
    });
    onUpdateInventory(updatedInv);

    setReturnTargetReceipt(null);
    setReturnSearchTerm('');
    if (showConfirm) {
      showConfirm(
        "Refund Processed Successfully",
        `Inventory reclaimed and client transaction refunded. Receipt marked flag in sales history records.`,
        () => {}
      );
    }
  };

  const handleReconcileSubmit = () => {
    const totalInput = Number(reconCash) + Number(reconTransfer) + Number(reconPOS);
    const expected = todayRevenue;
    const difference = totalInput - expected;

    const newAudit: TruthAudit = {
      id: `ADT-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      physicalCash: reconCash,
      bankTransfers: reconTransfer,
      posPayments: reconPOS,
      mobileMoney: 0,
      otherIncome: 0,
      expectedRevenue: expected,
      declaredRevenue: totalInput,
      difference: difference,
      confidenceScore: Math.max(10, Math.round(100 - (Math.abs(difference) / (expected || 1) * 100))),
      riskLevel: Math.abs(difference) > 50000 ? 'critical' : Math.abs(difference) > 10000 ? 'medium' : 'low',
      details: `Sales drawer submitted by ${currentCashier.name}. Reconciliation variance: ${difference}.`
    };

    onAddAudit(newAudit);
    setShowReconciliationModal(false);
    
    if (showConfirm) {
      showConfirm(
        "Daily Reconciliation Logged",
        `Drawer statement compiled!\nDeclared Cashier Total: ${formatCurrency(totalInput, currency)}\nExpected Total: ${formatCurrency(expected, currency)}\nDiscrepancy: ${formatCurrency(difference, currency)}\nAudit score: ${newAudit.confidenceScore}% (Accuracy indicator).`,
        () => {}
      );
    }
  };

  // --- FILTERS ---
  const activeProductsFiltered = useMemo(() => {
    return inventory.filter(p => {
      const inCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const inSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
      return inCat && inSearch;
    });
  }, [inventory, selectedCategory, productSearch]);

  const activeTxFiltered = useMemo(() => {
    return receipts.filter(r => {
      if (r.deleted) return true; // show soft deletes if needed
      const matchesSearch = r.id.toLowerCase().includes(txSearch.toLowerCase()) || 
        r.customerName.toLowerCase().includes(txSearch.toLowerCase()) || 
        r.items.some(it => it.name.toLowerCase().includes(txSearch.toLowerCase()));
      const matchesStatus = txFilterStatus === 'all' || r.status === txFilterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [receipts, txSearch, txFilterStatus]);

  const activeCustFiltered = useMemo(() => {
    return customersList.filter(c => 
      c.name.toLowerCase().includes(custSearch.toLowerCase()) || 
      c.phone.includes(custSearch) || 
      c.email.toLowerCase().includes(custSearch.toLowerCase())
    );
  }, [customersList, custSearch]);

  const scannedProductMock = () => {
    const item = inventory[Math.floor(Math.random() * inventory.length)];
    if (!item) return;
    setCart(prev => {
      const exists = prev.find(c => c.product.id === item.id);
      if (exists) {
        return prev.map(c => c.product.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { product: item, quantity: 1 }];
    });
    setScannedCode(`BAR-${Math.floor(Math.random() * 89999 + 10000)}`);
    setTimeout(() => {
      setScannedCode('');
      setActiveScanner(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in font-sans text-[#1F1F1F] select-none" id="eenvoq-sales-panel-wrapper">
      
      {/* HEADER SECTION WITH MESH GRADIENT */}
      <div className="relative overflow-hidden rounded-[32px] p-1 border border-neutral-150/45 bg-white shadow-xs" id="sales-mesh-wrapper">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14)_0%,_rgba(14,165,233,0)_75%)] pointer-events-none" />
        
        {/* Main Header greetings block */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4" id="sales-navbar-panel">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-sans font-medium text-neutral-900 tracking-tight">
                Sales Operating System
              </h1>
              <span className="bg-sky-50 text-sky-850 text-[9px] font-medium px-2 py-0.5 rounded-full border border-sky-200/40 uppercase tracking-wider font-mono">
                Terminal Live
              </span>
            </div>
            <p className="text-sm font-sans font-normal text-neutral-400 mt-1.5">
              Active Cashier: <strong className="text-neutral-900">{currentCashier.name}</strong> ({currentCashier.role}) &bull; Register Central Depot
            </p>
          </div>
          
          {/* Action controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap" id="sales-reconciliation-actions-bar">
            <button 
              onClick={() => {
                if (isOnline) {
                  setIsOnline(false);
                } else {
                  handleApplyOfflineSync();
                }
              }}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-full border transition duration-150 cursor-pointer ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              id="network-simulator-toggle"
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
              {isOnline ? "Online Ready" : `Offline Mode (${offlineQueue.length} Queued)`}
            </button>

            <button 
              onClick={() => setShowReconciliationModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 bg-neutral-900 text-white hover:bg-black rounded-full transition duration-150 cursor-pointer shadow-xs border border-transparent"
              id="recon-trigger-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>End of Day Drawer</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-neutral-150/60 pb-1 text-neutral-600 font-sans select-none overflow-x-auto scrollbar-none items-center gap-2" id="sales-page-tabs-bar">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'checkout', label: 'New Sale', icon: ShoppingCart },
          { id: 'transactions', label: 'Transactions', icon: FileText },
          { id: 'customers', label: 'Customers', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'overview') setAiAnswer(null);
              }}
              className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer border ${
                isActive 
                  ? 'bg-sky-50 text-sky-850 border-sky-200/60 shadow-xs font-bold' 
                  : 'bg-white text-neutral-600 border-neutral-150/45 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-700' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CORE CONTENT LAYOUT */}
      <div className="space-y-6" id="sales-dashboard-tabbed-container">

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="overview-segment">
            
            {/* LEFT STATS SUMMARY AND CHARTS COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Today's Metrics snapshot */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-dashboard-counters">
                <div className="bg-white p-5 rounded-2xl border border-[#e3e3e3] shadow-xs hover:border-neutral-300 transition duration-150 select-none">
                  <p className="text-[11px] font-medium text-[#757575] uppercase tracking-wider">Today's Revenue</p>
                  <p className="text-2xl font-bold font-sans mt-1.5 text-[#1f1f1f]">{formatCurrency(todayRevenue, currency)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#e3e3e3] shadow-xs hover:border-neutral-300 transition duration-150 select-none">
                  <p className="text-[11px] font-medium text-[#757575] uppercase tracking-wider">Transactions Today</p>
                  <p className="text-2xl font-bold font-sans mt-1.5 text-[#1f1f1f]">{todayTransactionsCount}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#e3e3e3] shadow-xs hover:border-neutral-300 transition duration-150 select-none">
                  <p className="text-[11px] font-medium text-[#757575] uppercase tracking-wider">Avg Transaction</p>
                  <p className="text-2xl font-bold font-sans mt-1.5 text-[#1f1f1f]">{formatCurrency(avgSaleValue, currency)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#e3e3e3] shadow-xs hover:border-neutral-300 transition duration-150 select-none">
                  <p className="text-[11px] font-medium text-[#757575] uppercase tracking-wider">Est. Gross Profit</p>
                  <p className="text-2xl font-bold font-sans mt-1.5 text-[#2e7d32]">{formatCurrency(grossProfit, currency)}</p>
                </div>
              </div>

              {/* AI COMMAND CENTER HERO */}
              <div className="bg-linear-to-br from-[#1e40af] to-[#1e3a8a] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden" id="ai-intelligence-search-panel">
                <div className="absolute top-0 right-0 p-8 opacity-10 select-none pointer-events-none">
                  <Sparkles className="w-36 h-36" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                    <span className="text-[10px] tracking-widest font-mono uppercase font-black text-sky-200">AI Command Center</span>
                  </div>
                  <h2 className="text-xl font-bold font-display tracking-tight mb-2">Ask Edenvoq AI anything...</h2>
                  
                  {/* Search query box */}
                  <form onSubmit={(e) => { e.preventDefault(); handlePredefinedAiQuery(aiQuery); }} className="relative flex items-center bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden mt-4 border border-white/20 select-text">
                    <input 
                      type="text" 
                      placeholder="Ask sales trends, suspicious discounts, low stock lists..." 
                      className="w-full bg-transparent px-5 py-4 focus:outline-hidden text-sm placeholder-white/60 font-sans"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                    />
                    <button type="submit" className="px-5 text-sky-200 hover:text-white transition duration-150">
                      <Search className="w-5 h-5" />
                    </button>
                  </form>

                  {/* Examples quick selector */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 select-none">
                    <span className="text-[10px] text-sky-200 font-semibold uppercase">Suggestions:</span>
                    {[
                      "Why are sales down today?",
                      "What products should I restock?",
                      "Show suspicious transactions"
                    ].map((s, idx) => (
                      <button 
                        key={idx} 
                        type="button"
                        onClick={() => handlePredefinedAiQuery(s)}
                        className="text-[11px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition border border-white/5 cursor-pointer text-white"
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* AI Response Display */}
                  {aiAnswer && (
                    <div className="mt-5 p-4 bg-white/95 rounded-2xl text-slate-900 shadow-md animate-fade-in font-sans text-xs leading-relaxed max-w-full">
                      <div className="flex items-center justify-between mb-2">
                        <strong className="text-[11px] uppercase tracking-wide text-indigo-900 font-bold">Edenvoq AI Agent</strong>
                        <button onClick={() => setAiAnswer(null)} className="text-slate-400 hover:text-slate-800"><X className="w-3.5 h-3.5" /></button>
                      </div>
                      <p className="whitespace-pre-line text-neutral-800 font-mono text-[11px]">{aiAnswer}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* QUICK ACTIONS ROW */}
              <div className="bg-white p-5 rounded-2xl border border-[#e3e3e3] select-none" id="overview-quick-actions-box">
                <h3 className="text-xs font-normal text-black uppercase tracking-wider mb-3 font-display">Immediate Workflows</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button 
                    onClick={() => setActiveTab('checkout')}
                    className="flex flex-col items-center justify-center p-4 bg-[#fbfbfa] border border-[#e3e3e3] rounded-2xl hover:border-sky-300 hover:bg-sky-50/20 transition group cursor-pointer"
                  >
                    <Plus className="w-5 h-5 mb-1.5 text-sky-600" />
                    <span className="text-xs font-bold font-sans">Record Sale</span>
                  </button>
                  <button 
                    onClick={() => { setActiveTab('checkout'); setActiveScanner(true); scannedProductMock(); }}
                    className="flex flex-col items-center justify-center p-4 bg-[#fbfbfa] border border-[#e3e3e3] rounded-2xl hover:border-emerald-300 hover:bg-emerald-50/20 transition group cursor-pointer"
                  >
                    <BarChart2 className="w-5 h-5 mb-1.5 text-emerald-600" />
                    <span className="text-xs font-bold font-sans">Scan Product</span>
                  </button>
                  <button 
                    onClick={() => setShowQuoteModal(true)}
                    className="flex flex-col items-center justify-center p-4 bg-[#fbfbfa] border border-[#e3e3e3] rounded-2xl hover:border-pink-300 hover:bg-pink-50/20 transition group cursor-pointer"
                  >
                    <FileText className="w-5 h-5 mb-1.5 text-pink-600" />
                    <span className="text-xs font-bold font-sans">Create Quote</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (receipts.length > 0) {
                        setReturnTargetReceipt(receipts[0]);
                      }
                    }}
                    className="flex flex-col items-center justify-center p-4 bg-[#fbfbfa] border border-[#e3e3e3] rounded-2xl hover:border-amber-300 hover:bg-amber-50/20 transition group cursor-pointer"
                  >
                    <RefreshCw className="w-5 h-5 mb-1.5 text-amber-600" />
                    <span className="text-xs font-bold font-sans">Process Refund</span>
                  </button>
                </div>
              </div>

              {/* SALES TREND CHARTS REPLACEMENT */}
              <div className="bg-white p-5 rounded-2xl border border-[#e3e3e3] select-none" id="sales-metrics-trend-graph">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <h3 className="text-xs font-normal text-black uppercase tracking-wider font-display">Sales Performance Index</h3>
                  <div className="flex bg-neutral-100 p-0.5 rounded-full text-[11px]" id="metric-trend-switch">
                    {['revenue', 'transactions', 'profit'].map((m) => (
                      <button 
                        key={m} 
                        onClick={() => setPerformanceMetric(m as any)}
                        className={`px-3 py-1 rounded-full uppercase font-bold transition duration-150 cursor-pointer ${
                          performanceMetric === m ? 'bg-white text-blue-900 shadow-xs' : 'text-[#757575] hover:text-black'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4" id="simulated-bar-charts">
                  <div className="flex items-end justify-between h-36 gap-2">
                    {[
                      { l: 'Mon', r: 120000, t: 8, p: 30000 },
                      { l: 'Tue', r: 180000, t: 12, p: 45000 },
                      { l: 'Wed', r: 210000, t: 19, p: 52000 },
                      { l: 'Thu', r: 95000, t: 7, p: 24000 },
                      { l: 'Fri', r: 245000, t: 22, p: 61000 },
                      { l: 'Sat', r: 298000, t: 31, p: 75000 },
                      { l: 'Sun', r: todayRevenue, t: todayTransactionsCount, p: grossProfit }
                    ].map((item, idx) => {
                      let activeVal = item.r;
                      let suffix = formatCurrency(activeVal, currency);
                      let max = 300000;
                      if (performanceMetric === 'transactions') {
                        activeVal = item.t;
                        suffix = `${activeVal} Tx`;
                        max = 40;
                      } else if (performanceMetric === 'profit') {
                        activeVal = item.p;
                        suffix = formatCurrency(activeVal, currency);
                        max = 80000;
                      }

                      const pct = Math.max(10, Math.min(100, (activeVal / max) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer pt-4">
                          {/* Tooltip bar values */}
                          <span className="absolute -top-3 scale-0 group-hover:scale-100 transition bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm whitespace-nowrap z-20">
                            {suffix}
                          </span>
                          <div className="w-full bg-slate-100 rounded-lg overflow-hidden h-24 flex items-end">
                            <div 
                              className={`w-full rounded-sm transition-all duration-500 ${
                                idx === 6 ? 'bg-blue-600 animate-pulse' : 'bg-[#1f1f1f] group-hover:bg-slate-700'
                              }`} 
                              style={{ height: `${pct}%` }} 
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono mt-2">{item.l}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR WITH INSIGHTS & RANKINGS */}
            <div className="lg:col-span-1 space-y-6">

              {/* LIVE AI INSIGHT FEED */}
              <div className="bg-white p-5 rounded-2xl border border-[#e3e3e3]" id="ai-sales-insights">
                <h3 className="text-xs font-bold text-[#757575] uppercase tracking-wider mb-4 font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  Sales Intelligence Insights
                </h3>
                <div className="space-y-3" id="insights-cards-bucket">
                  {[
                    { flag: 'alert', title: 'Revenue variance', desc: 'Revenue sits 18% below yesterday matching early afternoon credit terms lockouts.', ext: 'Our broad-street terminal recorded lower consumer transactions compared to online credit ledgers.' },
                    { flag: 'growth', title: 'Loyalty index rises', desc: 'Customer points claiming increased by 12% following campaign alerts.', ext: 'Bulk product purchases with loyalty cards boosted general retention indexes.' },
                    { flag: 'stock', title: 'Stock-out proximity alerts', desc: '3 inventory categories face depletion within 48 hours.', ext: 'Pepsi and Milk products require urgent reorder to maintain positive customer velocity.' },
                    { flag: 'finance', title: 'Cash hand-over variance', desc: 'Slight POS difference recorded on previous shift log.', ext: 'Cashier drawer reported 500 variance against computer-tallied bills.' }
                  ].map((ins, i) => {
                    const getInsightIcon = (flag: string) => {
                      switch (flag) {
                        case 'alert': return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
                        case 'growth': return <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />;
                        case 'stock': return <ShoppingCart className="w-4 h-4 text-sky-500 shrink-0" />;
                        case 'finance': return <CreditCard className="w-4 h-4 text-indigo-500 shrink-0" />;
                        default: return null;
                      }
                    };
                    return (
                      <div 
                        key={i} 
                        onClick={() => setSelectedInsight({ title: ins.title, desc: ins.ext })}
                        className="p-3.5 bg-neutral-50/70 border border-neutral-100 hover:border-gray-300 hover:bg-neutral-50 rounded-xl transition cursor-pointer select-none text-xs"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getInsightIcon(ins.flag)}
                          <strong className="text-slate-900 font-display font-bold">{ins.title}</strong>
                        </div>
                        <p className="text-[#5f6368] leading-relaxed text-[11px]">{ins.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BEST SELLERS AND RANKINGS SECTION (NO GRAPHICS) */}
              <div className="bg-white p-5 rounded-2xl border border-[#e3e3e3]" id="top-performers-list-panel">
                <h3 className="text-xs font-normal text-black uppercase tracking-wider mb-4 font-display">Best-Selling Products</h3>
                <div className="space-y-4">
                  {topProducts.map((p, idx) => {
                    const topRev = topProducts[0]?.revenue || 1;
                    const pct = Math.floor((p.revenue / topRev) * 100);
                    return (
                      <div key={idx} className="text-xs select-none">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-800 truncate max-w-[150px]">{p.name}</span>
                          <span className="font-mono text-slate-600 font-semibold">{formatCurrency(p.revenue, currency)}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-sky-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* INTEGRATED SALES FRAUD RADAR MONITORS */}
              <div className="bg-[#fff9f6] border border-[#fbe5da] p-5 rounded-2xl" id="fraud-radar-section">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <h3 className="text-xs font-normal text-black uppercase tracking-widest font-display">Fraud Prevention Intelligence</h3>
                </div>
                <p className="text-[11px] text-[#5f6368] mb-3 leading-normal">
                  Automatic monitoring systems flags unusual discounts, split deviations, or repetitive void cycles.
                </p>
                <div className="space-y-2.5">
                  {fraudMetrics.slice(0, 3).map((f, i) => (
                    <div key={i} className="p-2.5 bg-white border border-[#f3d9ce] rounded-xl text-xs flex justify-between items-start">
                      <div className="max-w-[75%]">
                        <span className="font-bold text-neutral-800 text-[11px] block">{f.type}</span>
                        <span className="text-[10px] text-gray-500 mt-0.5 block">{f.details}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        f.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Risk {f.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. NEW SALE CHECKOUT TAB */}
        {activeTab === 'checkout' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="sales-register-grid">
            
            {/* PRODUCT CATALOG SELECTION (COL SPAN 7) */}
            <div className="lg:col-span-7 bg-white bg-opacity-70 backdrop-blur-md p-5 rounded-2xl border border-[#e3e3e3] flex flex-col h-[650px]" id="catalog-explorer">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 select-none">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    placeholder="Search product inventory, index..." 
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-sky-500 text-xs font-sans"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  {productSearch && (
                    <button onClick={() => setProductSearch('')} className="absolute right-3 top-3 text-gray-400 hover:text-black">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                
                {/* Category Quick Filter Select */}
                <select 
                  className="px-3 py-2 border border-blue-100 bg-blue-50/20 rounded-xl text-xs font-bold text-blue-900 cursor-pointer min-w-[124px]"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="beverage">Beverages & soft</option>
                  <option value="grain">Grain Products</option>
                  <option value="confectionery">Confectionery</option>
                  <option value="dairy">Dairy</option>
                </select>
              </div>

              {/* CATALOG GRID BODY */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3" id="products-catalog-scrollable">
                {activeProductsFiltered.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-gray-500">
                    <AlertTriangle className="w-8 h-8 mb-2 text-amber-500" />
                    <p className="text-xs font-bold">No product matches found</p>
                    <p className="text-[10px] mt-1">Adjust filters or register new inventory index values.</p>
                  </div>
                ) : (
                  activeProductsFiltered.map((prod) => {
                    const cartItem = cart.find(c => c.product.id === prod.id);
                    const qtyInCart = cartItem?.quantity || 0;
                    return (
                      <div 
                        key={prod.id} 
                        onClick={() => {
                          if (prod.stockLevel === 0) return;
                          setCart(prev => {
                            const exists = prev.find(c => c.product.id === prod.id);
                            if (exists) {
                              return prev.map(c => c.product.id === prod.id ? { ...c, quantity: c.quantity + 1 } : c);
                            }
                            return [...prev, { product: prod, quantity: 1 }];
                          });
                        }}
                        className={`p-3.5 rounded-xl border transition-all duration-150 relative cursor-pointer select-none text-xs flex flex-col justify-between h-32 ${
                          prod.stockLevel === 0 
                            ? 'bg-red-50/20 border-red-100 opacity-60' 
                            : qtyInCart > 0 
                              ? 'bg-sky-50/40 border-sky-300 shadow-xs' 
                              : 'bg-[#fafafa] border-[#e3e3e3] hover:border-gray-400'
                        }`}
                      >
                        {qtyInCart > 0 && (
                          <span className="absolute top-2 right-2 bg-sky-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center font-sans">
                            {qtyInCart}
                          </span>
                        )}

                        <div>
                          <strong className="text-slate-900 font-bold block leading-tight truncate">{prod.name}</strong>
                          <span className="text-[10px] text-gray-500 mt-1 block uppercase font-medium">{prod.category}</span>
                        </div>

                        <div className="flex items-end justify-between mt-2 pt-2 border-t border-gray-100/30">
                          <span className="font-bold font-sans text-neutral-800">{formatCurrency(prod.basePrice, currency)}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md font-mono ${
                            prod.stockLevel === 0 
                              ? 'bg-red-100 text-red-800' 
                              : prod.stockLevel <= prod.safeMin 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-[#e1f5fe]/70 text-sky-800'
                          }`}>
                            {prod.stockLevel === 0 ? 'Out of Stock' : `${prod.stockLevel} units`}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* INTEGRATED AI RECOMMENDATIONS HUD */}
              <div className="border-t border-neutral-100 pt-3 mt-3 select-none" id="ai-recommends-checkout">
                <div className="flex items-center gap-1 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] uppercase font-black text-slate-700 tracking-wide">Edenvoq AI Checkout suggestions</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1" id="scrolling-rec-container">
                  {[
                    { id: 'rec-1', text: 'Customers buying Peak Milk also purchase Golden Penny Sugar' },
                    { id: 'rec-2', text: 'Bundle Coca-Cola with Indomie Cartons to increase target ticket weight by 15%.' }
                  ].map(rc => {
                    const isDismissed = dismissedRecs.includes(rc.id);
                    if (isDismissed) return null;
                    return (
                      <div key={rc.id} className="bg-amber-50/50 border border-amber-200/50 px-3.5 py-2 rounded-xl text-[10px] text-amber-900 min-w-[280px] flex items-center justify-between gap-3">
                        <p className="flex-1 font-medium italic">{rc.text}</p>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => setDismissedRecs(prev => [...prev, rc.id])} className="p-1 text-amber-900/60 hover:text-amber-900 bg-white hover:bg-neutral-100 transition rounded-md border border-amber-200/30">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* CART & CHECKOUT TERMINAL PANEL (COL SPAN 5) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#e3e3e3] flex flex-col h-[650px] shadow-sm select-none" id="cart-controller">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <h3 className="text-sm font-normal font-display tracking-tight text-black">Review Basket Receipt</h3>
                <span className="text-[10px] font-mono text-gray-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold">
                  {cart.length} items selected
                </span>
              </div>

              {/* CART LIST CONTAINER */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5" id="cart-items-bucket">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-20 text-center text-gray-400 h-full">
                    <ShoppingCart className="w-12 h-12 mb-3 stroke-[1.2] text-gray-300" />
                    <p className="text-xs font-bold text-gray-500">Cart terminal stands empty</p>
                    <p className="text-[10px] text-gray-400 mt-1 max-w-[200px]">Tap products from the catalog or simulation code scanning to register values.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="p-3 bg-[#fafafa] border border-neutral-100 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex-1 min-w-0 pr-3">
                        <strong className="text-slate-800 font-bold block truncate">{item.product.name}</strong>
                        <span className="text-[10px] text-gray-500 mt-0.5 block font-mono">
                          {formatCurrency(item.product.basePrice, currency)} / unit &bull; Sub: {formatCurrency(item.product.basePrice * item.quantity, currency)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c));
                          }}
                          className="bg-white border rounded-lg p-1 hover:bg-neutral-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-5 text-center font-mono text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => {
                            if (item.quantity >= item.product.stockLevel) return;
                            setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, quantity: c.quantity + 1 } : c));
                          }}
                          className="bg-white border rounded-lg p-1 hover:bg-neutral-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => {
                            setCart(prev => prev.filter(c => c.product.id !== item.product.id));
                          }}
                          className="text-red-500 hover:text-red-700 ml-1 hover:bg-red-50 p-1.5 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* CUSTOMER SELECTION & SET DETAILS */}
              <div className="bg-[#fbfbfa] border border-[#e3e3e3] p-3.5 rounded-xl mt-3 select-text text-xs">
                <div className="flex items-center justify-between mb-2 select-none">
                  <span className="font-bold text-[#757575] text-[10px] uppercase tracking-wider font-display">Assign Customer Profile</span>
                  {selectedCustomer && (
                    <button onClick={() => setSelectedCustomer(null)} className="text-[#c53929] hover:font-bold">
                      Forget
                    </button>
                  )}
                </div>

                {!selectedCustomer ? (
                  <div className="flex items-center gap-2 select-none">
                    <select 
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer focus:outline-hidden"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const match = customersList.find(c => c.name === val);
                        if (match) {
                          setSelectedCustomer({ name: match.name, phone: match.phone, email: match.email });
                        } else if (val === 'new') {
                          setSelectedCustomer({ name: 'Prince Cole', phone: '+234 815 111 2222', email: 'princecole@eenvoq.sg' });
                        }
                      }}
                    >
                      <option value="">Select account profile (Defaults walk-in)...</option>
                      {customersList.map((c, i) => (
                        <option key={i} value={c.name}>{c.name} ({c.phone})</option>
                      ))}
                      <option value="new">+ Quick Add: Prince Cole (+234 815...)</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{selectedCustomer.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{selectedCustomer.phone}</span>
                    </div>
                    {debtors.find(d => d.name === selectedCustomer.name) && (
                      <span className="bg-red-100 text-red-800 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full font-mono">
                        Active Debtor profile
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* DISCOUNTS AND PAYMENT LOGISTICS */}
              <div className="mt-3.5 pt-3.5 border-t border-gray-100 space-y-3 font-sans text-xs">
                
                {/* DISCOUNTS SELECTOR */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-500">Apply Coupon / Discount</span>
                  <div className="flex border rounded-lg overflow-hidden shrink-0 select-none">
                    {['none', 'flat', 'percent'].map((dt) => (
                      <button 
                        key={dt} 
                        onClick={() => { setDiscountType(dt as any); setDiscountValue(0); }}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase transition ${
                          discountType === dt ? 'bg-sky-600 text-white' : 'bg-gray-50 text-slate-700 hover:bg-neutral-100'
                        }`}
                      >
                        {dt}
                      </button>
                    ))}
                  </div>
                </div>

                {discountType !== 'none' && (
                  <div className="flex items-center gap-2 select-text">
                    <span className="font-medium text-slate-700">Discount Amount {discountType === 'percent' ? '(%)' : `(${currencySymbol})`}:</span>
                    <input 
                      type="number" 
                      className="w-20 px-2 py-1 border rounded-md text-slate-900 font-bold focus:outline-hidden"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                )}

                {/* Sell on Credit flow trigger */}
                <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-900 font-display">Sell on Customer Credit</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="w-4.5 h-4.5 accent-indigo-600 cursor-pointer"
                      checked={isCreditSale}
                      onChange={(e) => {
                        const ck = e.target.checked;
                        if (ck && !selectedCustomer) {
                          if (showConfirm) {
                            showConfirm("Customer Record Required", "You must assign an existing customer profile before conducting a credit transaction.", () => {});
                          }
                          return;
                        }
                        setIsCreditSale(ck);
                        if (ck) setPaymentMethod('split'); // defaults split/other
                      }}
                    />
                  </div>
                </div>

                {isCreditSale && (
                  <div className="p-2.5 bg-white border border-indigo-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">Credit Repayment Due Date:</span>
                      <input 
                        type="date" 
                        className="px-2 py-1 border border-gray-200 rounded-md text-xs focus:outline-hidden"
                        value={creditDueDate}
                        onChange={(e) => setCreditDueDate(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal font-mono">
                      Edenvoq alert engine will schedule automatic reminder triggers on due date to {selectedCustomer?.phone}.
                    </p>
                  </div>
                )}

                {/* CHOOSE REGISTER PAYMENT METHODS */}
                {!isCreditSale && (
                  <div className="flex items-center justify-between pt-1 select-none">
                    <span className="font-bold text-gray-500">Sales Gateway</span>
                    <div className="flex gap-1.5 shrink-0">
                      {(['cash', 'transfer', 'pos'] as const).map((m) => (
                        <button 
                          key={m} 
                          onClick={() => setPaymentMethod(m)}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition ${
                            paymentMethod === m 
                              ? 'bg-[#1f1f1f] text-white border-black shadow-xs' 
                              : 'bg-white text-slate-700 hover:bg-neutral-50 border-gray-200'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* BASKET TOTALS AND ACTIONS CHANNELS */}
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-3.5 select-none" id="cart-footer-totals">
                
                {/* Mathematical calculation Breakdown */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Basket Subtotal</span>
                    <span className="font-mono text-slate-700">
                      {formatCurrency(cart.reduce((sum, item) => sum + (item.product.basePrice * item.quantity), 0), currency)}
                    </span>
                  </div>
                  
                  {discountType !== 'none' && discountValue > 0 && (
                    <div className="flex justify-between text-[#c53929]">
                      <span>Discount deduction</span>
                      <span className="font-mono">
                        -{discountType === 'percent' 
                          ? `${discountValue}%` 
                          : formatCurrency(discountValue, currency)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-900 border-t border-dashed border-gray-100 pt-2 pb-0.5">
                    <span className="text-sm font-bold">Total Billable Final</span>
                    <span className="text-lg font-black font-sans text-sky-950">
                      {useMemo(() => {
                        const total = cart.reduce((sum, item) => sum + (item.product.basePrice * item.quantity), 0);
                        let sub = 0;
                        if (discountType === 'flat') sub = discountValue;
                        else if (discountType === 'percent') sub = total * (discountValue / 100);
                        return formatCurrency(Math.max(0, total - sub), currency);
                      }, [cart, discountType, discountValue, currency])}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => { setCart([]); setSelectedCustomer(null); setDiscountType('none'); }}
                    className="flex-1 py-3 text-xs font-bold text-[#c53929] hover:bg-red-50/50 rounded-xl transition duration-150 border border-neutral-100 cursor-pointer"
                  >
                    Wipe Basket
                  </button>

                  <button 
                    onClick={handleCheckoutSubmit}
                    disabled={cart.length === 0}
                    className={`flex-2 py-3.5 text-xs font-bold rounded-xl transition duration-150 text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                      cart.length === 0 
                        ? 'bg-neutral-300 pointer-events-none' 
                        : isCreditSale 
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
                          : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isCreditSale ? "Confirm Credit Handover" : "Record & Post Payment"}
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 3. TRANSACTIONS HISTORIC LEDGER TAB */}
        {activeTab === 'transactions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="transactions-ledger-layout">
            
            {/* TRANSACTION INDEX LIST PANEL (COL SPAN 5) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#e3e3e3] flex flex-col h-[650px]" id="tx-search-index">
              
              <div className="mb-4 space-y-3.5 select-none">
                <h3 className="text-sm font-normal font-display tracking-tight text-black">Sales Register Archives</h3>
                
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    placeholder="Search receipt sequence, clients, products..." 
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-sky-500 text-xs font-sans"
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                  />
                  {txSearch && (
                    <button onClick={() => setTxSearch('')} className="absolute right-3 top-3 text-gray-400 hover:text-black">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1" id="tx-status-filters">
                  {['all', 'verified', 'pending', 'failed'].map((st) => (
                    <button 
                      key={st} 
                      onClick={() => setTxFilterStatus(st as any)}
                      className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase shrink-0 transition ${
                        txFilterStatus === st 
                          ? 'bg-sky-50 border-sky-200 text-sky-800 shadow-xs' 
                          : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
                      }`}
                    >
                      {st === 'all' ? 'All records' : st === 'failed' ? 'Refund/Void' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* TX INDEX SCROLLABLE LIST */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 select-none" id="tx-cards-ledger-scroll">
                {activeTxFiltered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
                    <HelpCircle className="w-8 h-8 mb-2" />
                    <p className="text-xs font-bold">No historic sales matching criteria</p>
                  </div>
                ) : (
                  activeTxFiltered.map((tx) => (
                    <div 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs flex justify-between items-center ${
                        selectedTx?.id === tx.id 
                          ? 'bg-sky-50/20 border-sky-300 shadow-xs' 
                          : 'bg-[#fafafa] border-[#e3e3e3] hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-800 text-sm font-bold font-mono">{tx.id}</strong>
                          {tx.status === 'failed' && (
                            <span className="bg-red-50 text-red-500 text-[8px] font-mono font-bold px-1 rounded-sm">VOID</span>
                          )}
                          {tx.status === 'pending' && (
                            <span className="bg-indigo-50 text-indigo-600 text-[8px] font-mono font-bold px-1 rounded-sm">CREDIT</span>
                          )}
                        </div>
                        <span className="text-[#757575] mt-1 block font-medium">Customer: {tx.customerName}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">{new Date(tx.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>

                      <div className="text-right">
                        <p className="font-bold font-sans text-sm text-neutral-800">{formatCurrency(tx.totalAmount, currency)}</p>
                        <span className="text-[9px] text-[#757575] uppercase block mt-1 font-semibold">{tx.createdBy?.name || 'Cashier'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

            {/* TRANSACTION EXAMINER OVERLAY DETAIL PANEL (COL SPAN 7) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#e3e3e3] flex flex-col h-[650px] shadow-xs" id="tx-detail-examiner">
              {selectedTx ? (
                <div className="flex flex-col h-full justify-between" id="selected-tx-view-layout">
                  
                  {/* Detailed summary header block */}
                  <div className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between select-none">
                      <div>
                        <span className="bg-slate-100 text-slate-800 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full font-mono">
                          Transaction Ledger Record
                        </span>
                        <h2 className="text-2xl font-black font-mono text-slate-800 mt-2">{selectedTx.id}</h2>
                      </div>
                      
                      {selectedTx.status !== 'failed' && (
                        <button 
                          onClick={() => setVoidingReceipt(selectedTx)}
                          className="px-3.5 py-1.5 bg-red-50/50 hover:bg-red-100/50 text-red-700 text-xs font-bold rounded-lg border border-red-200/50 transition cursor-pointer"
                        >
                          Void & Reverse Transaction
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-4 text-xs select-text">
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">Customer Account</span>
                        <strong className="text-slate-800 font-bold block mt-0.5">{selectedTx.customerName}</strong>
                        <span className="text-gray-500 block font-mono">{selectedTx.customerPhone}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">Timestamp Filed</span>
                        <span className="text-slate-800 font-semibold block mt-0.5 font-mono">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">Register Cashier</span>
                        <span className="text-slate-800 font-semibold block mt-0.5">{selectedTx.createdBy?.name || 'Central depot staff'}</span>
                        <span className="text-gray-500 text-[10px] block font-mono">{selectedTx.createdBy?.role || 'Operator'}</span>
                      </div>
                    </div>
                  </div>

                  {/* PRODUCTS SOLD BLOCK */}
                  <div className="flex-1 overflow-y-auto py-5 select-text" id="tx-details-items-container">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 select-none">Products Sold</h3>
                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-[#1f1f1f]">
                        <thead className="bg-[#fcfaf7] border-b text-gray-500 select-none">
                          <tr>
                            <th className="p-3">Product Name</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3 text-right">Unit Price</th>
                            <th className="p-3 text-right">Aggregate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedTx.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="p-3 font-semibold text-slate-800">{item.name}</td>
                              <td className="p-3 text-center font-bold font-mono">{item.quantity}</td>
                              <td className="p-3 text-right font-mono">{formatCurrency(item.price, currency)}</td>
                              <td className="p-3 text-right font-bold font-mono">{formatCurrency(item.price * item.quantity, currency)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECURITY SIGNATURE AND ACTIONS */}
                  <div className="border-t border-gray-100 pt-4 mt-auto select-none" id="tx-footer-actions">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mb-4">
                      <div>
                        <span className="text-gray-400 text-[9px] uppercase tracking-wider block">Security Token Signature</span>
                        <span className="text-[10px] font-mono text-indigo-900 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-sm block mt-0.5">
                          Verified Trace Key: {selectedTx.securitySignature}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px] uppercase block">Total Net Received</span>
                        <strong className="text-xl font-black text-[#1e40af] font-sans block mt-0.5">{formatCurrency(selectedTx.totalAmount, currency)}</strong>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const win = window.open("", "_blank");
                          if (win) {
                            win.document.write(`
                              <html>
                              <head><title>Print Receipt - ${selectedTx.id}</title><style>body { font-family: monospace; padding: 20px; }</style></head>
                              <body>
                                <h2>GroceryGate Receipt</h2>
                                <p>TXN: ${selectedTx.id}</p>
                                <p>Client: ${selectedTx.customerName}</p>
                                <hr />
                                ${selectedTx.items.map(i => `<p>${i.name} x${i.quantity} - ${formatCurrency(i.price * i.quantity, currency)}</p>`).join('')}
                                <hr />
                                <h3>Total Received: ${formatCurrency(selectedTx.totalAmount, currency)}</h3>
                                <p>Secure signature: ${selectedTx.securitySignature}</p>
                                <p>Dispatched by cashier: ${selectedTx.createdBy?.name || 'Staff'}</p>
                              </body>
                              </html>
                            `);
                            win.document.close();
                            win.print();
                          }
                        }}
                        className="flex-1 py-3 bg-white border border-[#e3e3e3] hover:bg-neutral-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-gray-500" />
                        Print Order ticket
                      </button>
                      
                      <button 
                        onClick={() => {
                          if (showConfirm) {
                            showConfirm(
                              "Receipt Dispatched to WhatsApp",
                              `Cryptographically secure digital bill and loyalty allocations pushed successfully to candidate at ${selectedTx.customerPhone || 'Walk-in'}.`,
                              () => {}
                            );
                          }
                        }}
                        className="flex-1 py-3 bg-slate-900 text-white hover:bg-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                        Dispatch WhatsApp bill
                      </button>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
                  <FileText className="w-14 h-14 stroke-[1.2] mb-3 text-gray-300" />
                  <p className="text-xs font-bold text-gray-500">Pick a receipt from the registry</p>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] text-center">Extract metadata analysis, review audit signatures, or print transaction logs.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 4. CUSTOMERS LEDGER TAB */}
        {activeTab === 'customers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="customer-retention-ledger">
            
            {/* LEFT COLUMN: CUSTOMERS SEARCH LIST */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#e3e3e3] flex flex-col h-[650px]" id="cust-search-section">
              
              <div className="mb-4 space-y-3 select-none">
                <h3 className="text-sm font-normal font-display tracking-tight text-black font-display">Client Relationship Register</h3>
                
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    placeholder="Search candidate by name, phone numbers, mail addresses..." 
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-sky-500 text-xs font-sans"
                    value={custSearch}
                    onChange={(e) => setCustSearch(e.target.value)}
                  />
                  {custSearch && (
                    <button onClick={() => setCustSearch('')} className="absolute right-3 top-3 text-gray-400 hover:text-black">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* CUSTOMERS GRID LIST */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3" id="cust-grid-scroll">
                {activeCustFiltered.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-gray-400 select-none">
                    <Users className="w-10 h-10 mb-2 text-gray-300" />
                    <p className="text-xs font-bold">No active customer profiles logged</p>
                  </div>
                ) : (
                  activeCustFiltered.map((cust, i) => {
                    const outstanding = debtors.find(d => d.name === cust.name)?.amountOwed || 0;
                    return (
                      <div 
                        key={i} 
                        onClick={() => setSelectedCustProfile(cust)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-xs flex flex-col justify-between h-32 select-none ${
                          selectedCustProfile?.name === cust.name 
                            ? 'bg-sky-50/20 border-sky-300 shadow-xs' 
                            : 'bg-[#fafafa] border-[#e3e3e3] hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-800 text-sm font-bold truncate max-w-[150px]">{cust.name}</strong>
                            {outstanding > 0 && (
                              <span className="bg-amber-100 text-amber-800 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                                Debt Pending
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 mt-1 block font-mono">{cust.phone}</span>
                        </div>

                        <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-100">
                          <div>
                            <span className="text-[9px] text-[#757575] uppercase block font-semibold">Lifetime Purchase value</span>
                            <span className="font-bold text-neutral-800 font-mono text-[13px]">{formatCurrency(cust.totalSpend, currency)}</span>
                          </div>
                          <span className="bg-slate-100 text-slate-700 text-[9px] px-2 py-0.5 rounded-full font-bold">
                            {cust.txCount} Orders
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: DETAIL PROFILE CARD AND DYNAMIC INSIGHTS */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* SELECTED PROFILE CARD */}
              <div className="bg-white p-5 rounded-2xl border border-[#e3e3e3]" id="cust-profile-detail-card">
                <h3 className="text-xs font-bold text-[#757575] uppercase tracking-wider mb-4 font-display">Customer Ledger Profile</h3>
                
                {selectedCustProfile ? (
                  <div className="space-y-4" id="cust-details-card-body">
                    <div className="select-text">
                      <strong className="text-lg font-black text-slate-800 block leading-tight">{selectedCustProfile.name}</strong>
                      <span className="text-[11px] text-[#5f6368] font-mono block mt-1">Email: {selectedCustProfile.email}</span>
                      <span className="text-[11px] text-[#5f6368] font-mono block">Phone: {selectedCustProfile.phone}</span>
                    </div>

                    <div className="border-t border-b border-gray-100 py-3.5 space-y-2 select-none text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Purchase Volume</span>
                        <strong className="text-slate-800 font-mono">{formatCurrency(selectedCustProfile.totalSpend, currency)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Recorded Order Tickets</span>
                        <strong className="text-slate-800 font-mono">{selectedCustProfile.txCount} receipts</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Average ticket valuation</span>
                        <strong className="text-slate-800 font-mono">
                          {formatCurrency(selectedCustProfile.totalSpend / (selectedCustProfile.txCount || 1), currency)}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Outstanding Credit Pending</span>
                        <strong className="text-red-600 font-mono">
                          {formatCurrency(debtors.find(d => d.name === selectedCustProfile.name)?.amountOwed || 0, currency)}
                        </strong>
                      </div>
                    </div>

                    {/* AI CUSTOMER ANALYTIC BADGE CARD */}
                    <div className="bg-[#f0f4ff] border border-[#d6e4ff] p-3 rounded-xl select-none" id="sales-sentiment-meter">
                      <span className="text-[9px] uppercase font-bold text-sky-800 tracking-wider block">AI Retention Sentiment Meter</span>
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span className="font-semibold text-sky-950">
                          {selectedCustProfile.totalSpend > 150000 
                            ? 'Top Value Account' 
                            : selectedCustProfile.txCount > 4 
                              ? 'Loyal Household buyer' 
                              : 'Walk-in Buyer'}
                        </span>
                        <span className="text-[10px] font-bold text-sky-800">{selectedCustProfile.totalSpend > 150000 ? '98% retention' : '82% retention'}</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center p-12 text-gray-400 select-none">
                    <Users className="w-8 h-8 mx-auto stroke-[1.2] mb-2 text-gray-300" />
                    <p className="text-xs font-bold">Pick customer from register list</p>
                    <p className="text-[10px] mt-1 text-center">Examine transaction histories, total credit ledgers, or loyalty index parameters.</p>
                  </div>
                )}
              </div>

              {/* QUICK CAMPAIGN SCHEDULER ACTIONS */}
              <div className="bg-white p-5 rounded-2xl border border-[#e3e3e3] select-none" id="loyalty-campaigns-panel">
                <h3 className="text-xs font-bold text-[#757575] uppercase tracking-wider mb-3 font-display">Scheduled Loyalty Campaigns</h3>
                <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                  Automatically broadcast custom reward points announcements or reminders.
                </p>
                <div className="space-y-2.5">
                  {[
                    { title: 'Inactive Client Wakeup', alert: 'Send WhatsApp reminder with +50 bonus points incentive', target: 'Repeat Buyers > 12 days silent' },
                    { title: 'New Stock Restocked Alert', alert: 'Push message for Pepsi bulk stock availability', target: 'Soft drinks category fans' }
                  ].map((cp, idx) => (
                    <div key={idx} className="p-3 bg-neutral-50 border rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <strong className="text-slate-800 font-semibold block">{cp.title}</strong>
                        <span className="text-[10px] text-[#757575] mt-0.5 block">{cp.target}</span>
                      </div>
                      <button 
                        onClick={() => {
                          if (showConfirm) {
                            showConfirm("Action Approved", `Broadcast successfully queued! Transmitting campaign to designated customer segment targets.`, () => {});
                          }
                        }}
                        className="px-2.5 py-1 bg-sky-600 text-white rounded-lg text-[10px] font-bold hover:bg-sky-700 transition cursor-pointer shrink-0"
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* FOOTER MULTIPLE CASHIERS SELECTION OVERLAY */}
      <div className="bg-white border-t border-[#e3e3e3] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs select-none mt-auto shrink-0" id="multiple-cashier-handover">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-4 h-4 text-sky-600" />
          <span className="font-semibold text-slate-800 font-display">Autonomous Multi-Register Handover Settings:</span>
        </div>
        <div className="flex items-center gap-2 select-text">
          <span className="text-gray-500 font-medium">Logged Register:</span>
          <select 
            className="px-3 py-1 bg-[#fcfaf7] border border-gray-200 rounded-lg text-xs font-bold cursor-pointer font-sans"
            value={activeOperatorId}
            onChange={(e) => onChangeActiveOperator(e.target.value)}
          >
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
            ))}
          </select>
          <span className="text-[10px] text-gray-400 font-mono">Terminal ID: CTR-MAIN-01</span>
        </div>
      </div>

      {/* Modal overlays */}
      
      {/* 1. DAILY DRAWER RECONCILIATION MODAL */}
      {showReconciliationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border p-6 rounded-[28px] max-w-sm w-full font-sans select-none animate-fade-in shadow-xl">
            <h3 className="text-lg font-bold font-display text-slate-800 mb-1">Verify Drawer & Statements</h3>
            <p className="text-xs text-[#757575] mb-5 leading-relaxed">
              At shift close, physically report currencies in hand. AI models will evaluate and post a variance statement.
            </p>

            <div className="space-y-3.5 select-text">
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Physical Cash Counted ({currencySymbol})</span>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border rounded-xl font-mono text-sm focus:outline-hidden text-neutral-800"
                  value={reconCash}
                  onChange={(e) => setReconCash(Number(e.target.value))}
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Bank Transfers Tally ({currencySymbol})</span>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border rounded-xl font-mono text-sm focus:outline-hidden text-neutral-800"
                  value={reconTransfer}
                  onChange={(e) => setReconTransfer(Number(e.target.value))}
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">POS Card Reader Sums ({currencySymbol})</span>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border rounded-xl font-mono text-sm focus:outline-hidden text-neutral-800"
                  value={reconPOS}
                  onChange={(e) => setReconPOS(Number(e.target.value))}
                />
              </div>
            </div>

            <p className="text-[11px] text-indigo-900 font-medium bg-[#f0f4ff] border border-indigo-100 p-2.5 rounded-xl block mt-4 leading-normal font-mono">
              Calculated target revenue of today: {formatCurrency(todayRevenue, currency)}.
            </p>

            <div className="flex gap-2.5 mt-5">
              <button 
                onClick={() => setShowReconciliationModal(false)}
                className="flex-1 py-2.5 border rounded-xl hover:bg-neutral-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleReconcileSubmit}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Submit Audit Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CREATE QUOTE / PROFORMA INVOICES MODAL */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border p-6 rounded-[28px] max-w-sm w-full font-sans select-none animate-fade-in shadow-xl">
            <h3 className="text-lg font-bold font-display text-slate-800 mb-1">Create Sales Quote</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Compile shopping basket as a preliminary quote for institutional/B2B clients without altering inventory indexes.
            </p>

            <div className="space-y-3 select-text">
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Receipt Company / Client Name</span>
                <input 
                  type="text" 
                  placeholder="e.g. Shell Petroleum Cocoa Corp"
                  className="w-full px-3 py-2 border rounded-xl text-neutral-800 text-xs focus:outline-hidden"
                  value={quoteDetails.clientName}
                  onChange={(e) => setQuoteDetails(prev => ({ ...prev, clientName: e.target.value }))}
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Contact Phone</span>
                <input 
                  type="text" 
                  placeholder="+234..."
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:outline-hidden text-neutral-800"
                  value={quoteDetails.phone}
                  onChange={(e) => setQuoteDetails(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Quote validity period (days)</span>
                <input 
                  type="number" 
                  className="w-24 px-3 py-2 border rounded-xl text-neutral-800 text-xs focus:outline-hidden"
                  value={quoteDetails.expiresDays}
                  onChange={(e) => setQuoteDetails(prev => ({ ...prev, expiresDays: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-5">
              <button 
                onClick={() => setShowQuoteModal(false)}
                className="flex-1 py-2.5 border rounded-xl hover:bg-neutral-50 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowQuoteModal(false);
                  if (showConfirm) {
                    showConfirm(
                      "Sales Quote Generated",
                      `Reference: GGT-QUOT-${Math.floor(Math.random() * 899 + 100)}\nClient profile: ${quoteDetails.clientName || 'General'}\nEstimated Valuation: ${formatCurrency(cart.reduce((sum, item) => sum + (item.product.basePrice * item.quantity), 0), currency)}.\nPDF format copy simulated in downloads directory.`,
                      () => {}
                    );
                  }
                }}
                className="flex-1 py-2.5 bg-[#1f1f1f] hover:bg-black text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Generate Bill PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. VOID TRANSACTION JUSTIFICATION OVERLAY */}
      {voidingReceipt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border p-6 rounded-[28px] max-w-sm w-full font-sans select-none animate-fade-in shadow-xl">
            <h3 className="text-lg font-bold font-display text-slate-800 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Authorize Void Sale
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Voiding order sequence <strong className="font-mono text-slate-800">{voidingReceipt.id}</strong> will restore stock values in inventory register and logs transaction audit.
            </p>

            <div className="space-y-3 select-text">
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">State Void Reasons / Justification</span>
                <select 
                  className="w-full px-3 py-2 border rounded-xl text-neutral-800 text-xs focus:outline-hidden cursor-pointer"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                >
                  <option value="">Choose reason...</option>
                  <option value="Duplicate transaction posted">Duplicate transaction posted</option>
                  <option value="Cashier clerical payment option typo">Cashier clerical payment option typo</option>
                  <option value="Consumer canceled checkout basket items">Consumer canceled checkout basket items</option>
                  <option value="Wrong catalog values selected">Wrong catalog values selected</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 mt-5">
              <button 
                onClick={() => setVoidingReceipt(null)}
                className="flex-1 py-2.5 border rounded-xl hover:bg-neutral-50 text-xs font-semibold cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={() => handleProcessVoid(voidingReceipt)}
                disabled={!voidReason}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl text-white cursor-pointer ${
                  voidReason ? 'bg-red-600 hover:bg-red-700 shadow-xs' : 'bg-neutral-300 pointer-events-none'
                }`}
              >
                Execute Void
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUCCESS COMPLETED SALES OVERLAY */}
      {lastSalesReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white border p-6 rounded-[28px] max-w-sm w-full font-mono text-xs text-slate-800 shadow-2xl animate-fade-in relative">
            <button 
              onClick={() => setLastSalesReceipt(null)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-slate-500 rounded-full p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-3 border-b border-dashed border-gray-200">
              <span className="text-emerald-600 text-2xl font-black block">Sale Logged Successfully</span>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest leading-none font-sans">GroceryGate Terminal</p>
            </div>

            <div className="space-y-2 py-4 border-b border-dashed border-gray-200 select-text">
              <div className="flex justify-between">
                <span>Receipt Index ID:</span>
                <span className="font-bold font-sans">{lastSalesReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Client:</span>
                <span className="font-bold">{lastSalesReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Total amount paid:</span>
                <span className="font-bold font-sans text-[#1e40af] text-sm">{formatCurrency(lastSalesReceipt.totalAmount, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dispatched points:</span>
                <span className="font-bold text-amber-600">+{lastSalesReceipt.rewardPoints} LP</span>
              </div>
            </div>

            <div className="space-y-2 pt-3">
              <p className="text-[10px] text-gray-400 font-sans block leading-relaxed italic text-center">
                Autonomously dispatching encrypted bill and purchase breakdown via active SMS routing queue.
              </p>
              
              <button 
                onClick={() => {
                  setLastSalesReceipt(null);
                  if (showConfirm) {
                    showConfirm("Dispatching text invoice", `Secured receipt has been dispatched to client device successfully.`, () => {});
                  }
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-sans transition cursor-pointer text-center"
              >
                Dispatched WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. REFUND target selector overlay */}
      {returnTargetReceipt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border p-6 rounded-[28px] max-w-sm w-full font-sans select-none animate-fade-in shadow-xl">
            <h3 className="text-lg font-bold font-display text-slate-800 mb-1 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-600" />
              Process Refund Return
            </h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Verify receipt target <strong className="font-mono text-slate-800">{returnTargetReceipt.id}</strong> total value {formatCurrency(returnTargetReceipt.totalAmount, currency)}.
            </p>

            <div className="space-y-3.5 select-text text-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Return Reason / Justification</span>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-xl placeholder-gray-400 text-neutral-800"
                  placeholder="e.g. Defective Indomie Carton packaging"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                />
              </div>

              <div className="bg-[#fff9f6] border border-[#fbe5da] p-3 rounded-xl">
                <span className="text-[10px] font-bold text-amber-800 block uppercase">Continuous inventory update</span>
                <p className="text-[10px] text-slate-600 mt-1 leading-normal">
                  Completing refund rolls back stock counts:
                  {returnTargetReceipt.items.map((it, idx) => (
                    <strong key={idx} className="block mt-1 font-mono text-slate-800">{it.name} (+{it.quantity} units)</strong>
                  ))}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 mt-5">
              <button 
                onClick={() => setReturnTargetReceipt(null)}
                className="flex-1 py-2.5 border rounded-xl hover:bg-neutral-50 text-xs font-semibold cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={handleReturnAction}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Approve Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. AI INSIGHTS OVERLAY MODAL */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border p-6 rounded-[28px] max-w-sm w-full font-sans select-none animate-fade-in shadow-xl">
            <div className="flex items-center gap-2 text-indigo-900 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              <strong className="text-sm font-bold uppercase tracking-wider font-display">Edenvoq Deep Analysis</strong>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2 leading-tight">{selectedInsight.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-mono whitespace-pre-line p-3 bg-neutral-50 rounded-xl border">
              {selectedInsight.desc}
            </p>
            <button 
              onClick={() => setSelectedInsight(null)} 
              className="w-full mt-4 py-2 bg-[#1f1f1f] hover:bg-black text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
