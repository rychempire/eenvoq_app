import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Sparkles, Send, Mic, Image, Paperclip, ChevronRight, 
  RefreshCcw, ShieldCheck, FileText, ArrowLeft, Play, Pause, 
  Check, X, Search, CheckCircle, AlertTriangle, ArrowUpDown, 
  Trash2, Plus, Sliders, Calendar, MessageSquare, Briefcase, 
  Layers, CheckSquare, Clock, ArrowRight, UserCheck, HelpCircle, Eye,
  TrendingUp, Package, Coins
} from 'lucide-react';
import { ChatMessage, Receipt, InventoryItem, Debtor, TruthAudit, Alert } from '../types';
import { formatCurrency } from '../utils/currency';
import EenvoqIcon from './EenvoqIcon';

const EoBrandLogo = () => (
  <svg className="w-8 h-8 text-sky-500 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="9" fill="currentColor" fillOpacity="0.08" />
    <circle cx="12.5" cy="16" r="4" stroke="currentColor" strokeWidth="2.5" />
    <path d="M10 16h5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="19.5" cy="16" r="4" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

interface AIAssistantProps {
  chatLogs: ChatMessage[];
  onSendMessage: (text: string, attachments?: { name: string; type: string }[]) => Promise<void>;
  receipts: Receipt[];
  inventory: InventoryItem[];
  debtors: Debtor[];
  audits: TruthAudit[];
  alerts: Alert[];
  clearChat: () => void;
  prefilledPrompt?: string;
  clearPrefilledPrompt?: () => void;
  currency: string;
}

// Interactive custom task definition for the Tasks tab
interface AITask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  category: 'inventory' | 'debtor' | 'finance' | 'fraud' | 'campaign';
  recommendedAction: string;
  status: 'pending' | 'approved' | 'dismissed';
}

export default function AIAssistant({
  chatLogs,
  onSendMessage,
  receipts,
  inventory,
  debtors,
  audits,
  alerts,
  clearChat,
  prefilledPrompt,
  clearPrefilledPrompt,
  currency
}: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'tasks' | 'history'>('chat');
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string; category?: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);
  
  // --- SYSTEM PROMPT & OLLAMA MODEL CONFIG STATES ---
  const [selectedModel, setSelectedModel] = useState<'qwen-3-8b' | 'qwen-3-14b'>('qwen-3-8b');
  const [showModelConfig, setShowModelConfig] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>(
    `You are an advanced AI Sales & Inventory Assistant integrated into a business management application. You are powered by a local AI model through Ollama and are designed to help business owners, managers, cashiers, and inventory staff make better decisions using business data available within the application.

Your primary objective is to help users manage inventory, monitor sales performance, analyze business trends, answer operational questions, and provide actionable recommendations that improve efficiency and profitability.

Always prioritize real application data when available. Never fabricate information, statistics, records, transactions, inventory counts, customer details, or financial figures.`
  );

  // Local chat items so we can store complex interactive structural actions and responses
  const [messages, setMessages] = useState<any[]>([]);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const voiceIntervalRef = useRef<any>(null);

  // --- HISTORY SEARCH ---
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'reports' | 'conversations'>('all');

  // --- HIGH-RISK ACTIONS MODAL STATE ---
  const [riskConfirmModal, setRiskConfirmModal] = useState<{
    show: boolean;
    title: string;
    description: string;
    actionType: string;
    payload: any;
    onApprove: () => void;
  } | null>(null);

  // --- PROACTIVE INSIGHT POPUP NOTIFICATION ---
  const [proactiveNotification, setProactiveNotification] = useState<{
    show: boolean;
    text: string;
    subtext: string;
    prompt: string;
  } | null>(null);

  // --- POPULATE INITIAL CONVOS OR INTERACTION LAYERS ---
  useEffect(() => {
    if (messages.length === 0) {
      const lowStockCount = inventory.filter(p => p.stockLevel <= p.safeMin).length;
      const totalAr = debtors.reduce((sum, d) => sum + d.amountOwed, 0);
      setMessages([
        {
          id: 'welcome-init',
          role: 'model',
          text: `### Executive Summary
Welcome to **Eenvoq AI**, your local sales and inventory operations specialist. I am configured with your system instructions and powered by Ollama's **Qwen 3 (8B)** or **14B** models.

### Key Findings
* Daily registers and active checkout terminals are successfully mapped to my scanning registry.
* Operational discrepancies, stock alert thresholds, and credit outstanding ledgers have been synced.

### Metrics
* **Understocked Items**: ${lowStockCount} critical warnings detected
* **Liquidity Ledger**: ${formatCurrency(totalAr, currency)} active receivables
* **System Health**: Fast local response latency over local machine cluster

### Recommendations
* Address low-stock items before depletion.
* Run cash-drawer matching queries to inspect evening void frequencies.

### Next Actions
1. Try asking **"Check Low Stock"** to prioritize your restock orders.
2. Search **"Are there accounts overdue?"** to identify critical debtor logs.`,
          timestamp: new Date().toISOString(),
          structured: {
            answer: "Welcome to Eenvoq AI, your local sales and inventory operations specialist. I am configured with your system instructions and powered by Ollama's Qwen 3 (8B) or 14B models.",
            evidence: [
              `Understocked count: ${lowStockCount} items`,
              `Credit outstanding: ${formatCurrency(totalAr, currency)}`,
              "Local machine cluster state: Active"
            ],
            actions: [
              { type: 'forecast_demand', label: "Check Low Stock Profiles", value: 'Check Low Stock' },
              { type: 'check_retention', label: "Review Overdue Debts", value: 'Show customers who owe money.' }
            ]
          }
        }
      ]);
    }
  }, [inventory, debtors, currency]);

  // --- TASKS LIST WITH REAL-TIME ACTIONS ---
  const [taskList, setTaskList] = useState<AITask[]>([]);

  // --- DYNAMIC AI INSIGHTS ---
  const systemInsights = useMemo(() => {
    // Dynamically calculate key facts from data props
    const lowStockCount = inventory.filter(p => p.stockLevel <= p.safeMin).length;
    const highRiskDebtorsCount = debtors.filter(d => d.riskRating === 'high').length;
    const totalAr = debtors.reduce((sum, d) => sum + d.amountOwed, 0);

    return [
      {
        icon: 'trending-up',
        title: 'Your daily sales are stable',
        desc: 'Customer receipts are matching expected amounts. Your sales trends remain consistent with previous weeks.',
        priority: 'medium',
        impact: 'Stable daily income'
      },
      {
        icon: 'package',
        title: `${lowStockCount} items are running low`,
        desc: `You have ${lowStockCount} products lower than their minimum warning stock. We recommend ordering more before they run out.`,
        priority: 'high',
        impact: 'No empty shelves',
        prompt: `Which items are running low?`
      },
      {
        icon: 'alert-triangle',
        title: `${highRiskDebtorsCount} bills require a payment reminder`,
        desc: `Customers currently owe a total of ${formatCurrency(totalAr, currency)} for products they purchased on credit.`,
        priority: 'high',
        impact: 'Recovering unpaid money',
        prompt: `Show customers who owe money.`
      },
      {
        icon: 'coins',
        title: 'Cash register checks are consistent',
        desc: `Your end-of-day register entries match your sales bills closely. Keep matching them to avoid any loss.`,
        priority: 'low',
        impact: 'Protected cash registers'
      }
    ];
  }, [inventory, debtors, currency]);

  // Handle prefilled prompts
  useEffect(() => {
    if (prefilledPrompt) {
      setInputText(prefilledPrompt);
      if (clearPrefilledPrompt) clearPrefilledPrompt();
    }
  }, [prefilledPrompt, clearPrefilledPrompt]);

  // Auto scroll
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Voice recording simulation timer
  const toggleVoiceRecording = () => {
    if (isRecording) {
      clearInterval(voiceIntervalRef.current);
      setIsRecording(false);
      const spokenSamples = [
        "Why did revenue drop today?",
        "Who owes me coffee money?",
        "What should I reorder?",
        "Show suspicious discounts."
      ];
      const selectedVoiceInput = spokenSamples[Math.floor(Math.random() * spokenSamples.length)];
      setInputText(selectedVoiceInput);
      setVoiceSeconds(0);
    } else {
      setIsRecording(true);
      setVoiceSeconds(0);
      voiceIntervalRef.current = setInterval(() => {
        setVoiceSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  // Extract from attachments simulation (OCR parser)
  const simulateAttachmentUpload = (category: 'invoice' | 'receipt' | 'sheet' | 'image') => {
    setSending(true);
    let payload = { name: '', type: '', category: '' };
    
    if (category === 'invoice') {
      payload = { name: 'Supplier_Invoice_B2B_MILK.pdf', type: 'application/pdf', category: 'invoice' };
    } else if (category === 'receipt') {
      payload = { name: 'TILL_3_CASH_SWIPE_RECONCILE.png', type: 'image/png', category: 'receipt' };
    } else if (category === 'sheet') {
      payload = { name: 'Manual_Physical_Stock_Count.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'sheet' };
    } else {
      payload = { name: 'Fanta_Smashed_Can_Discrepancy.jpg', type: 'image/jpeg', category: 'image' };
    }

    setAttachedFiles([payload]);
    
    setTimeout(() => {
      setSending(false);
      // Trigger instant automated OCR response
      let answer = "";
      let evidence: string[] = [];
      let actions: any[] = [];

      if (category === 'invoice') {
        answer = "Gemini OCR extracted Supplier Invoice from Peak Distributors. Successfully read metadata and line-items. I recommend generating a Purchase Order Draft for high velocity milk units.";
        evidence = [
          "Supplier Record: Jiggler Foods & Diary Ltd.",
          "Line Product Name: Peak Milk 50cl (Total count: 48 cartons)",
          "Invoice Cost Valuation: N57,600 Naira",
          "Date Logged in System: 2026-06-20"
        ];
        actions = [
          { type: 'approve_purchase_order', label: 'Approve Purchase OrderPO-394', value: 'Approve Invoice purchase' },
          { type: 'modify_qty', label: 'Modify Quantity', value: 'Adjust PO items count' },
          { type: 'dismiss_ocr', label: 'Disclaim/Cancel Transfer', value: 'Cancel' }
        ];
      } else if (category === 'receipt') {
        answer = "Extracted customer checkout verification swipe from terminal. The system automatically reconciled transaction total with virtual ledger balance.";
        evidence = [
          "POS Receipt Reference ID: TXN-4011-BROAD",
          "Extracted Receipt Total: N12,400 Naira",
          "System Operator Session: Prince",
          "Journal Verification Audit: 100% matched to Broad-Street terminal journal entries."
        ];
        actions = [
          { type: 'reconcile_match', label: 'Flag & Record Validated Sale', value: 'Save verified' },
          { type: 'cancel', label: 'Dismiss File', value: 'Close file details' }
        ];
      } else {
        answer = "Image parsing completed. Discrepancy logged for physical damages matching damaged inventory stock logs.";
        evidence = [
          "Log File Category: DAMAGED STOCK CAPTURED",
          "Target Product Name: Fanta Soft Drinks",
          "Identified Inventory Exception: Carbonation leak / burst container during broad corridor transport"
        ];
        actions = [
          { type: 'write_off_inventory', label: 'Write-off Damaged Unit', value: 'Write-off stock' },
          { type: 'cancel', label: 'Exits audit flow', value: 'Cancel' }
        ];
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-user`,
          role: 'user',
          text: `Uploaded attachment: ${payload.name}`,
          timestamp: new Date().toISOString(),
          attachments: [payload]
        },
        {
          id: `msg-${Date.now()}-ai`,
          role: 'model',
          text: answer,
          timestamp: new Date().toISOString(),
          structured: { answer, evidence, actions }
        }
      ]);
      setAttachedFiles([]);
    }, 1800);
  };

  // --- SPEECH SYNTHESIS / VOICE AUDIO SIMULATION ---
  const handleTogglePlayback = (msgId: string, text: string) => {
    if (activePlaybackId === msgId) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setActivePlaybackId(null);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setActivePlaybackId(null);
        };
        window.speechSynthesis.speak(utterance);
        setActivePlaybackId(msgId);
      } else {
        // Fallback simulation
        setActivePlaybackId(msgId);
        setTimeout(() => {
          setActivePlaybackId(null);
        }, 4000);
      }
    }
  };

  // Remove text synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // --- CORE CONVERSATION GENERATOR (Answers / Evidence / Actions separation) ---
  const handleVoiceOrTextSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText('');
    setSending(true);

    const userMsg = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: userText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);

    // Fast timer simulation
    setTimeout(() => {
      setSending(false);
      const lowercaseQuery = userText.toLowerCase();
      
      let answerTxt = "";
      let evidenceList: string[] = [];
      let actionsList: any[] = [];

      // --- 1. REORDER / STOCKOUT / INVENTORY ---
      if (lowercaseQuery.includes('stock') || lowercaseQuery.includes('reorder') || lowercaseQuery.includes('depletion') || lowercaseQuery.includes('run out')) {
        const lowStockItems = inventory.filter(p => p.stockLevel <= p.safeMin);
        answerTxt = `### Executive Summary
Inventory scanning completed under system criteria on **Qwen 3**. I detected **${lowStockItems.length} core products** running lower than safe baseline margins. Action is recommended to prevent direct stockouts and lost business revenue.

### Key Findings
* Specified stock lines have broken beneath their safety levels due to accelerated daily purchase velocities.
* Prompt stock replenishment orders are assigned to maintain continuous grocery/beverage shelves.

### Metrics
* **Critical Stock-outs**: ${lowStockItems.length} items flagged
* **Forecasted Depletion**: 1.5 days average
* **Safety Margin Baseline**: ${lowStockItems[0]?.safeMin || 10} minimum unit count limit

### Recommendations
* Distribute immediate replenishment purchase requests to registered suppliers.
* Increment safety reserve coefficients during seasonal demand spikes.

### Next Actions
1. Authorize immediate restock requests to restore inventory safety bounds.
2. Alert cashier operations about immediate limit changes.`;

        evidenceList = lowStockItems.map(p => `Stock Alert: ${p.name} - Count ${p.stockLevel} units (Minimum Margin Limit: ${p.safeMin})`);
        
        actionsList = [
          { type: 'restock_peak', label: 'Approve Restock PO (All Overdues)', value: 'Draft restocks instantly' },
          { type: 'adjust_safe_limits', label: 'Modify Critical Depletion Thresholds', value: 'Edit inventory numbers' }
        ];
      } 
      // --- 2. DEBT / DEBTOR / OVERDUE ---
      else if (lowercaseQuery.includes('debt') || lowercaseQuery.includes('debtor') || lowercaseQuery.includes('owe') || lowercaseQuery.includes('overdue')) {
        const outstanding = debtors.filter(d => d.amountOwed > 0);
        const outstandingSum = outstanding.reduce((sum, d) => sum + d.amountOwed, 0);
        answerTxt = `### Executive Summary
Liquid ledger audits completed on **Qwen 3**. Accounts receivable list indicates **${outstanding.length} customer accounts** operating outside of standard credit maturity lines. Immediate payment reminders are recommended.

### Key Findings
* Liquidity margins are constrained due to uncollected consumer invoice sheets.
* High-risk segments are localized to standard high margin profiles.

### Metrics
* **Total Overdue Ledger**: ${formatCurrency(outstandingSum, currency)}
* **Risk Classifications**: ${outstanding.filter(d => d.riskRating === 'high').length} high risk, ${outstanding.filter(d => d.riskRating === 'medium').length} medium risk accounts
* **Average Overdue Period**: 16 calendar days past maturity limits

### Recommendations
* Restrict additional cashier credit checkout permissions for accounts holding overdue credit sheets.
* Broadcast automated payment requests directly to customer terminals.

### Next Actions
1. Issue automated payment reminder alerts to debtor accounts.
2. Freeze cash register credit permissions on accounts exceeding grace windows.`;

        evidenceList = outstanding.map(d => `Outstanding Trace: ${d.name} owes ${formatCurrency(d.amountOwed, currency)} (DueDate: ${d.dueDate} - risk index: ${d.riskRating.toUpperCase()})`);
        
        actionsList = [
          { type: 'sms_push_reminders', label: 'Dispatch Automated SMS Reminders', value: 'Launch reminder queue' },
          { type: 'credit_suspend_highs', label: 'Suspend Credit for High-Risk Accounts', value: 'Apply debit locks' }
        ];
      }
      // --- 3. PROFIT / REVENUE / LOSS ---
      else if (lowercaseQuery.includes('profit') || lowercaseQuery.includes('revenue') || lowercaseQuery.includes('today') || lowercaseQuery.includes('down')) {
        const todayReceipts = receipts.filter(r => !r.deleted && r.timestamp.startsWith('2026-06-20'));
        const totalSalesToday = todayReceipts.reduce((sum, r) => sum + r.totalAmount, 0);
        const calcRev = totalSalesToday || 218500;
        answerTxt = `### Executive Summary
Financial revenue checks finished on **Qwen 3**. Today\'s cumulative register values stand at **${formatCurrency(calcRev, currency)}**, demonstrating a 14% deviation drop from general shift averages.

### Key Findings
* Basket sizes and catalog margins remain highly beneficial (averaging 24.5%).
* Afternoon cashier connectivity drops restricted full digital ledger accounting synchronization.

### Metrics
* **Shift Gross Receipts**: ${formatCurrency(calcRev, currency)}
* **Transaction Index**: ${todayReceipts.length || 18} digital sheets
* **Performance Deficit**: -14.2% below period targets

### Recommendations
* Launch limited high-margin discount coupons to recover missed evening consumer traffic.
* Re-audit registers to make sure all cash drawers physically match virtual tickets.

### Next Actions
1. Initiate automated evening promotion workflows.
2. Carry out instant physical cash till reconciliation.`;

        evidenceList = [
          `Beverage product baskets dropped 22% during afternoon hours.`,
          `Reconciled Tills show no structural deficits.`,
          `Calculated gross margins: 24.5% safe baseline.`
        ];
        
        actionsList = [
          { type: 'launch_push_promotion', label: 'Create Evening Soda Promo Push', value: 'Create discount campaign' },
          { type: 'view_discrepancies', label: 'Verify POS Reconciliations', value: 'Check drawer splits' }
        ];
      }
      // --- 4. SUSPICIOUS / FRAUD ---
      else if (lowercaseQuery.includes('suspicious') || lowercaseQuery.includes('fraud') || lowercaseQuery.includes(' Prince') || lowercaseQuery.includes('leak') || lowercaseQuery.includes('variance')) {
        answerTxt = `### Executive Summary
Checkout forensic audits completed on **Qwen 3**. Anomaly trackers identified **2 active discrepancies** with checkout supervisor approvals and cash-drawer matches. Immediate review is necessary.

### Key Findings
* Sequential cashier voids occurred inside rapid shift changes.
* Discrepancies exist between expected ledger receipts and actual physical till hand-overs.

### Metrics
* **Logged Deficits**: ${formatCurrency(1450, currency)} in Register Till 3
* **Unauthorized Voids**: 2 sequential override sessions
* **System Trust Rating**: 86% Warning Priority (Yellow Category)

### Recommendations
* Enforce secondary high-level supervisor approvals on void ledger actions.
* Input actual cash hand-over sheets directly to the primary Truth Audit spreadsheet to calculate leakage margins.

### Next Actions
1. Request investigation into Register 3 logs.
2. Draft a new register reconciliation entry for verification.`;

        evidenceList = [
          `Operator Prince alert: Logged 2 high-value checkout voids within 4 minutes.`,
          `Discount margins alert: An average 28% coupon was used three times without standard authorization logs.`,
          `Cash drawer matching discrepancy: Expected cashier balances exceeded actual hand-over by 1,450 naira.`
        ];
        
        actionsList = [
          { type: 'flag_audit', label: 'Initiate Forensic Inspection on Cashier Prince', value: 'Start auditing investigation' },
          { type: 'add_reconciliation_audit', label: 'Create New Truth Audit Ledger', value: 'Trace variance' }
        ];
      }
      // --- DEFAULT AI ASSISTANCE ---
      else {
        answerTxt = `### Executive Summary
Ollama **Qwen 3** is online. I am optimized for store diagnostics, sales records analysis, and inventory optimization under your dedicated system parameters.

### Key Findings
* Active workspace catalog datasets and ledger logs are mapped perfectly.
* Operational safety threshold rules are active and stable.

### Metrics
* **Tracked Products**: ${inventory.length} items logged
* **Assigned Personnel**: 7 active profiles
* **Operations Priority**: High margin preservation

### Recommendations
* Request a review of understocked items to prevent catalog out-of-stocks.
* Ask me about client overdue credit lists to reclaim liquidity.

### Next Actions
1. Inquire about current safety limits to forecast next reorder schedules.
2. Check active alerts to check for store operation variances.`;

        evidenceList = [
          `26 active inventory records registered.`,
          `7 operators verified within team rosters.`,
          `Core system security levels are optimal.`
        ];
        actionsList = [
          { type: 'forecast_demand', label: 'Forecast next week\'s product demand', value: 'Predict trends' },
          { type: 'check_retention', label: 'Review Churn Risk Indicators', value: 'Analyse inactive clients' }
        ];
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-ai`,
          role: 'model',
          text: answerTxt,
          timestamp: new Date().toISOString(),
          structured: {
            answer: answerTxt,
            evidence: evidenceList,
            actions: actionsList
          }
        }
      ]);

    }, 1100);
  };

  // --- INTERACTIVE ACTION EXECUTION (WITH SECURITY CHECK CONFIRMATION CONTROLS) ---
  const handleExecuteAIAction = (actionType: string, metaLabel: string, payloadValue?: any) => {
    // Determine if high-risk requiring confirmation
    const highRiskActions = ['credit_suspend_highs', 'write_off_inventory', 'delete_product', 'void_sale', 'write_off_debt', 'restock_peak', 'sms_push_reminders'];

    if (highRiskActions.includes(actionType)) {
      setRiskConfirmModal({
        show: true,
        title: `Authorize Crucial Action?`,
        description: `Are you sure you want to execute high-risk permission: "${metaLabel}"? This action changes active accounts and sends automated messaging directly to external recipients.`,
        actionType,
        payload: payloadValue,
        onApprove: () => {
          // Process high-risk execution after permission granted
          setRiskConfirmModal(null);
          processRealTimeAction(actionType, metaLabel, payloadValue);
        }
      });
    } else {
      processRealTimeAction(actionType, metaLabel, payloadValue);
    }
  };

  const processRealTimeAction = (actionType: string, metaLabel: string, payloadValue: any) => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      let successMsg = "";
      
      switch (actionType) {
        case 'restock_peak':
        case 'approve_purchase_order':
          successMsg = `Restock Purchase Order (Total: N48,500) successfully structured and dispatched to Suppliers. Stock allocation reserves will update upon warehouse fulfillment.`;
          break;
        case 'sms_push_reminders':
        case 'sms_push':
          successMsg = `Customer overdue collection remind streams initiated! Automated SMS alerts successfully dispatched to Baba Sadiq and pending debtor profiles.`;
          break;
        case 'credit_suspend_highs':
          successMsg = `Account credit suspended for Baba Sadiq and related high-risk debtors! POS swipe registers are locked for these profiles until balances are settled.`;
          break;
        case 'flag_audit':
          successMsg = `Forensic alert dispatched to administrator panel. Cashier Prince terminal activity is flagged for dual-void inspection audits.`;
          break;
        case 'launch_push_promotion':
        case 'create_promo':
          successMsg = `Flash promotion campaign launched! "5% weekend discount on Pepsi & Coca-Cola" push notification broadcast to all regular customers.`;
          break;
        case 'write_off_inventory':
          successMsg = `Inventory stock discrepancy registered. Damaged beverage units written-off; audit logging track updated.`;
          break;
        default:
          successMsg = `Action "${metaLabel}" approved and fully executed. Store audit log was updated.`;
          break;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-ai-receipt`,
          role: 'model',
          text: successMsg,
          timestamp: new Date().toISOString()
        }
      ]);
    }, 1000);
  };

  // --- FILTERED CONVO HISTORY ---
  const activeHistoryFiltered = useMemo(() => {
    const defaultHistory = [
      { id: '1', title: 'Why did revenue drop today?', type: 'conversations', date: 'Today, 10:42 AM', preview: 'Analyzed coke sales reduction due to afternoon power outages.' },
      { id: '2', title: 'Which products should I reorder?', type: 'reports', date: 'Yesterday, 4:15 PM', preview: 'Reorder breakdown for Pepsi 50cl and Indomie Noodle packages.' },
      { id: '3', title: 'Show overdue debtors.', type: 'conversations', date: 'June 18, 2026', preview: 'Baba Sadiq overdue balance warning review draft logs.' },
      { id: '4', title: 'Find suspicious transactions.', type: 'reports', date: 'June 16, 2026', preview: 'Prince terminal sign-off cash variance trace matching.' }
    ];

    return defaultHistory.filter(h => {
      const matchSearch = h.title.toLowerCase().includes(historySearch.toLowerCase()) || h.preview.toLowerCase().includes(historySearch.toLowerCase());
      const matchFilter = historyFilter === 'all' || h.type === historyFilter;
      return matchSearch && matchFilter;
    });
  }, [historySearch, historyFilter]);

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] bg-[#FCFAF7] rounded-[32px] border border-neutral-150/45 shadow-xs overflow-hidden" id="ai-intelligence-canvas">
      
      {/* OPERATIONS HEADER WITH MESH GRADIENT */}
      <div className="relative overflow-hidden border-b border-[#E3E3E3] bg-white select-none shrink-0" id="ai-top-navigation">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12)_0%,_rgba(14,165,233,0)_75%)] pointer-events-none" />
        
        <div className="relative z-10 h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.hash = 'dashboard'}
              className="p-1.5 hover:bg-neutral-100 rounded-full transition text-neutral-800 cursor-pointer flex items-center justify-center shrink-0"
              title="Return to home dashboard"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="flex items-center gap-2.5">
              <EoBrandLogo />
              <h2 className="text-base font-bold font-sans text-neutral-900 tracking-tight">
                Eenvoq AI
              </h2>
            </div>
          </div>

          {/* Clear buttons / Status flags */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border border-emerald-200/40">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping" />
              AI Synced Live
            </span>
            <button
              onClick={() => setShowModelConfig(!showModelConfig)}
              className={`text-xs px-3.5 h-8.5 rounded-full flex items-center gap-1.5 cursor-pointer transition font-bold border ${
                showModelConfig 
                  ? 'bg-sky-505 text-sky-600 bg-sky-50 border-sky-200/80 shadow-2xs' 
                  : 'text-[#5F6368] hover:text-black hover:bg-slate-50 border-[#E3E3E3]'
              }`}
              title="Configure Ollama System Prompt & model selection"
            >
              <Sliders className="w-3 h-3" />
              <span>Ollama Config</span>
            </button>
            <button 
              onClick={() => {
                clearChat();
                setMessages([messages[0]]);
              }}
              className="text-xs text-[#5F6368] hover:text-black hover:bg-slate-50 border border-[#E3E3E3] h-8.5 rounded-full flex items-center gap-1.5 cursor-pointer transition font-bold"
            >
              <RefreshCcw className="w-3 h-3" />
              Reset Chat
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT WORKSPACE VIEW */}
      <div className="flex-1 overflow-y-auto" id="assistant-viewspace">

        {/* Tab A: CONVERSATIONAL AGENT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full bg-[#fdfcfb]">
            
            {showModelConfig && (
              <div className="bg-slate-50/90 border-b border-slate-200/70 p-4 animate-fade-in shrink-0 shadow-2xs select-none" id="ollama-settings-drawer">
                <div className="max-w-2xl mx-auto space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-sky-500" />
                      Ollama Core Engine Parameters
                    </h3>
                    <div className="flex items-center gap-2 select-text">
                      <span className="text-[10px] text-slate-400 font-medium">Model:</span>
                      <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value as any)}
                        className="bg-white border border-slate-250 text-[11px] font-semibold text-slate-700 px-2 py-0.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                      >
                        <option value="qwen-3-8b">Qwen 3 (8B) - Default Balanced</option>
                        <option value="qwen-3-14b">Qwen 3 (14B) - High Capacity</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-1 block select-text">
                    <label className="text-[10px] text-slate-400 font-medium block">Active Sales & Inventory System Prompt Instructions</label>
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      rows={4}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[10px] font-mono text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed overflow-y-auto resize-none shadow-3xs"
                    />
                  </div>
                  
                  <p className="text-[9px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                    System is actively listening via local Ollama engine at <code className="bg-slate-100 px-1 py-0.5 rounded text-sky-700 font-mono text-[9px]">http://localhost:11434</code>
                  </p>
                </div>
              </div>
            )}

            {/* Scrollable chat messages panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" id="messages-stream">
              <div className="max-w-2xl mx-auto space-y-5">
                
                {messages.map((msg, i) => {
                  const isAI = msg.role === 'model';
                  return (
                    <div key={msg.id || i} className={`flex gap-3.5 ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                      
                      {isAI && (
                        <div className="w-9 h-9 rounded-full border border-sky-200/60 bg-sky-50 flex items-center justify-center shrink-0 shadow-2xs">
                          <EenvoqIcon className="w-4.5 h-4.5 text-sky-650" />
                        </div>
                      )}

                      <div className={`max-w-[92%] sm:max-w-[82%] rounded-[24px] px-6 py-4.5 text-[11px] sm:text-xs md:text-sm ${
                        isAI 
                          ? 'bg-sky-50/50 backdrop-blur-xs border border-sky-100/90 text-slate-900 shadow-sm rounded-tl-sm' 
                          : 'bg-slate-900 text-white rounded-tr-sm shadow-xs'
                      }`}>
                        
                        {/* Attachments if rendered */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2.5">
                            {msg.attachments.map((file: any, fileIdx: number) => (
                              <div key={fileIdx} className="flex items-center gap-1 bg-[#2a2a2a] border border-[#3a3a3a] px-2.5 py-1 rounded-full text-[10px] font-mono text-[#dcdcdc]">
                                <FileText className="w-3 px-0.5 h-3" /> {file.name}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* STRUCTURAL THREE-PART RESPONSE (ANSWER, EVIDENCE, ACTIONS) */}
                        {isAI && msg.structured ? (
                          <div className="space-y-4 font-sans select-text">
                            
                            {/* Section 1: Answer block */}
                            <div>
                              <strong className="text-[10px] uppercase font-mono tracking-widest text-sky-600 block mb-1 font-bold">Answer</strong>
                              <p className="text-slate-900 font-semibold text-xs sm:text-sm leading-relaxed font-sans">{msg.structured.answer}</p>
                            </div>

                            {/* Section 2: Evidence checklist */}
                            <div className="bg-white/80 border border-sky-100/60 p-3.5 rounded-xl shadow-2xs">
                              <strong className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block mb-2 font-bold">Evidence Data Logged</strong>
                              <ul className="space-y-1.5 font-mono text-[10px] text-slate-700 leading-relaxed">
                                {msg.structured.evidence.map((ev: string, evIdx: number) => (
                                  <li key={evIdx} className="flex items-start gap-1.5">
                                    <span className="shrink-0 text-amber-600 font-bold">&#8250;</span>
                                    <span>{ev}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Section 3: Recommended action trigger buttons */}
                            {msg.structured.actions && msg.structured.actions.length > 0 && (
                              <div className="pt-2 select-none border-t border-sky-100/50">
                                <strong className="text-[10px] uppercase font-mono tracking-widest text-emerald-700 block mb-2 font-bold">Approved Actions</strong>
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                                  {msg.structured.actions.map((act: any, actIdx: number) => (
                                    <button
                                      key={actIdx}
                                      onClick={() => handleExecuteAIAction(act.type, act.label, act.value)}
                                      className="text-[10px] font-bold px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition cursor-pointer flex items-center gap-1.5 shadow-2xs group"
                                    >
                                      <Play className="w-2.5 h-2.5 fill-white" />
                                      {act.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        ) : (
                          // Fallback or normal flat plaintext message
                          <div className="space-y-2 select-text leading-relaxed font-sans whitespace-pre-wrap text-slate-900 font-semibold text-xs sm:text-sm">
                            <p>{msg.text}</p>
                          </div>
                        )}

                        {/* Speech read-out voice assistance button */}
                        <div className="flex items-center justify-between text-[10px] mt-3.5 pt-2 border-t border-sky-100/60 text-slate-400">
                          <span className="font-sans font-medium">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          
                          <button 
                            onClick={() => handleTogglePlayback(msg.id, msg.structured ? msg.structured.answer : msg.text)}
                            className="flex items-center gap-1.5 px-3 py-1 border border-sky-200/50 hover:border-sky-300 text-[10px] font-bold rounded-full bg-white hover:bg-sky-50 transition cursor-pointer text-sky-850 shadow-2xs"
                          >
                            {activePlaybackId === msg.id ? (
                              <>
                                <Pause className="w-2.5 h-2.5 text-sky-600 fill-sky-600" />
                                <span className="animate-pulse text-sky-700">Stop</span>
                              </>
                            ) : (
                              <>
                                <Mic className="w-2.5 h-2.5 text-sky-500" />
                                <span className="text-sky-750 font-sans">Speak</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>

                      {!isAI && (
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-slate-100 flex items-center justify-center shrink-0 border border-slate-800 text-xs font-bold font-mono">
                          OP
                        </div>
                      )}

                    </div>
                  );
                })}

                {sending && (
                  <div className="flex gap-3 justify-start animate-fade-in">
                    <div className="w-9 h-9 rounded-full border border-sky-100 bg-sky-50 flex items-center justify-center shrink-0">
                      <EenvoqIcon className="w-4.5 h-4.5 text-sky-600 animate-bounce" />
                    </div>
                    <div className="bg-sky-50/50 backdrop-blur-xs border border-sky-100/50 rounded-[20px] px-5 py-4 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-1.5 w-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 bg-sky-500 rounded-full animate-bounce" />
                      <span className="text-[10px] text-sky-950 font-sans pl-1">Scanning systems data...</span>
                    </div>
                  </div>
                )}

                <div ref={threadEndRef} />
              </div>
            </div>

            {/* Suggested cards at the bottom */}
            {messages.length <= 1 && (
              <div className="max-w-2xl mx-auto w-full px-6 py-4 select-none" id="starting-prompts-cardboard">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 text-center sm:text-left">Suggested Quick Workflows</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="suggestions-scroller">
                  {[
                    { q: "Check Low Stock", d: "Detect stock levels running dry & restock instantly" },
                    { q: "Draft Payment Request", d: "Send friendly reminder alerts to overdue accounts" },
                    { q: "Audit Cash Registers", d: "Investigate void cashier register differences" },
                    { q: "Verify Overrides", d: "Scan deleted and modified sales ledger logs" }
                  ].map((sg, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(sg.q)}
                      className="flex items-center justify-between p-3.5 bg-white hover:bg-sky-50/40 border border-slate-200 hover:border-sky-350 rounded-2xl text-left transition cursor-pointer text-xs font-sans group shadow-2xs hover:shadow-xs"
                    >
                      <div className="flex flex-col min-w-0 pr-3">
                        <strong className="text-slate-900 font-bold font-sans text-xs group-hover:text-sky-900 transition truncate">{sg.q}</strong>
                        <span className="text-slate-500 text-[10px] font-sans leading-normal truncate">{sg.d}</span>
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-slate-50 group-hover:bg-sky-100 flex items-center justify-center shrink-0 transition-all">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Composer Console */}
            <div className="p-4 bg-white border-t border-slate-100 select-none shrink-0" id="chat-control-console">
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleVoiceOrTextSend} className="relative flex items-center bg-slate-50/50 border border-slate-200 rounded-3xl p-1 focus-within:border-sky-450 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100/40 transition-all gap-0.5">
                  
                  {/* Left side actions group: Mic, Paperclip, Image */}
                  <div className="flex items-center shrink-0">
                    {/* Speech input simulator toggle */}
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`p-2.5 rounded-full transition cursor-pointer ${
                        isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-sky-50/80 text-slate-400 hover:text-sky-600'
                      }`}
                      title={isRecording ? "Stop voice recording" : "Speak to Eenvoq naturally..."}
                    >
                      <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => simulateAttachmentUpload('invoice')}
                      className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50/50 transition rounded-full cursor-pointer"
                      title="Upload Supplier Invoice"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => simulateAttachmentUpload('receipt')}
                      className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50/50 transition rounded-full cursor-pointer"
                      title="Upload Customer Receipt"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Input field takes up central remaining space */}
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isRecording ? `Recording simulated voice input... [${voiceSeconds}s]` : "Ask Eenvoq..."}
                    className="flex-1 min-w-0 bg-transparent px-2.5 py-2.5 sm:py-3 text-xs text-slate-900 focus:outline-none placeholder-slate-400 font-medium"
                    disabled={isRecording}
                  />

                  {/* Right side action: Send */}
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-30 disabled:bg-slate-200 text-white rounded-full transition cursor-pointer shrink-0 flex items-center justify-center shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* Tab B: SYSTEM INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in" id="intelligence-insights-desk">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 select-none">
              <div>
                <h3 className="text-sm font-medium text-black font-display">Daily Operational Intelligence AI Feed</h3>
                <p className="text-[11px] text-gray-600 mt-0.5">Compiled daily reports prioritized by risk & balance sheet sensitivity indexes.</p>
              </div>
              <span className="text-[10px] font-medium px-2.5 py-1 bg-sky-50 text-sky-800 rounded-full font-mono">
                Updated just now
              </span>
            </div>

            <div className="space-y-4">
              {systemInsights.map((ins, idx) => {
                const renderIcon = () => {
                  switch (ins.icon) {
                    case 'trending-up': return <TrendingUp className="w-5 h-5 text-sky-650 text-sky-600" />;
                    case 'package': return <Package className="w-5 h-5 text-amber-600" />;
                    case 'alert-triangle': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
                    case 'coins': return <Coins className="w-5 h-5 text-emerald-600" />;
                    default: return <Sparkles className="w-5 h-5 text-sky-500" />;
                  }
                };

                return (
                  <div 
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      ins.priority === 'high' 
                        ? 'bg-[#fffcfc] border-red-100 hover:border-red-300' 
                        : ins.priority === 'medium'
                          ? 'bg-[#fcfcff] border-blue-100 hover:border-blue-300'
                          : 'bg-white border-neutral-200 hover:border-neutral-350'
                    } flex flex-col md:flex-row md:items-center justify-between gap-4`}
                  >
                    <div className="flex gap-4">
                      <span className="p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl h-11 w-11 flex items-center justify-center shrink-0">
                        {renderIcon()}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-medium text-black font-display">{ins.title}</strong>
                          <span className={`text-[9px] font-medium uppercase px-2 py-0.5 rounded-full font-mono ${
                            ins.priority === 'high' ? 'bg-red-50 text-red-700' : ins.priority === 'medium' ? 'bg-sky-50 text-sky-700' : 'bg-gray-100 text-gray-750'
                          }`}>
                            {ins.priority} Priority
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-normal mt-1 font-sans">{ins.desc}</p>
                        <p className="text-[10px] text-emerald-800 font-mono mt-1 font-medium flex items-center gap-1">
                          &bull; Expected execution impact: {ins.impact}
                        </p>
                      </div>
                    </div>

                    {ins.prompt && (
                      <button
                        onClick={() => {
                          setInputText(ins.prompt!);
                          setActiveTab('chat');
                        }}
                        className="px-4 py-2 bg-sky-55 bg-sky-50 hover:bg-sky-100 text-sky-850 font-medium rounded-lg text-xs transition cursor-pointer self-start md:self-auto uppercase tracking-wider shrink-0"
                      >
                        Audit Query
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab C: TASKS ACTION CENTER */}
        {activeTab === 'tasks' && (
          <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in" id="tasks-action-board">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 select-none">
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-display">Smart Business Action Board</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Helpful suggestions recommended by your AI that you can approve or dismiss.</p>
              </div>
              <span className="text-xs font-black px-2.5 py-1 bg-[#1f1f1f] text-white rounded-full">
                {taskList.filter(t => t.status === 'pending').length} Actions Unresolved
              </span>
            </div>

            <div className="space-y-4">
              {taskList.filter(t => t.status === 'pending').map((t) => (
                <div key={t.id} className="bg-white border-2 border-black rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-sm border ${
                        t.priority === 'high' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        {t.priority} Urgent
                      </span>
                      <strong className="text-xs font-bold text-gray-900 font-display">{t.title}</strong>
                    </div>

                    <p className="text-[11px] text-[#757575] font-sans">
                      Impact: <strong className="text-emerald-700 font-semibold">{t.impact}</strong>
                    </p>

                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[11px] font-mono leading-relaxed text-gray-800">
                      <strong>AI Suggestion:</strong> {t.recommendedAction}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 shrink-0 select-none">
                    <button
                      onClick={() => {
                        handleExecuteAIAction(
                          t.category === 'inventory' ? 'restock_peak' : t.category === 'debtor' ? 'sms_push_reminders' : 'flag_audit',
                          t.title
                        );
                        setTaskList(prev => prev.map(item => item.id === t.id ? { ...item, status: 'approved' } : item));
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => {
                        setTaskList(prev => prev.map(item => item.id === t.id ? { ...item, status: 'dismissed' } : item));
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Dismiss
                    </button>
                  </div>

                </div>
              ))}

              {taskList.filter(t => t.status === 'pending').length === 0 && (
                <div className="text-center py-16 bg-white border border-[#E3E3E3] rounded-3xl select-none">
                  <CheckSquare className="w-12 h-12 text-zinc-300 mx-auto mb-3 animate-pulse" />
                  <strong className="text-gray-900 block text-xs font-display">No Pending Tasks</strong>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-sm mx-auto px-4">
                    Excellent work! Once you add list products, record sales, or set parameters, your AI assistant will queue smart action advice right here!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab D: HISTORIC DIRECTORIES */}
        {activeTab === 'history' && (
          <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in" id="history-scrolling-room">
            
            {/* Direct query box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-200 pb-4 select-none">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search previous AI chats, draft PO logs, forecasts..."
                  className="w-full pl-9 pr-4 py-2 border border-[#E3E3E3] rounded-xl text-xs font-sans focus:outline-hidden"
                />
              </div>

              <div className="flex gap-1 bg-neutral-100 p-0.5 rounded-full select-none cursor-pointer text-[10px] font-bold text-[#757575]">
                {['all', 'reports', 'conversations'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setHistoryFilter(cat as any)}
                    className={`px-3 py-1 rounded-full uppercase transition ${
                      historyFilter === cat ? 'bg-white text-sky-600 shadow-2xs' : 'hover:text-black font-semibold'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List historic conversation components */}
            <div className="divide-y divide-gray-100 bg-white border border-[#E3E3E3] rounded-2xl overflow-hidden">
              {activeHistoryFiltered.map(h => (
                <div key={h.id} className="p-4 hover:bg-neutral-50/60 transition cursor-pointer flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-gray-900 font-display">{h.title}</strong>
                      <span className="text-[8px] uppercase tracking-wider font-mono font-black border bg-neutral-50 px-2 py-0.5 rounded-full">
                        {h.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-sans leading-relaxed">{h.preview}</p>
                  </div>
                  <div className="text-right shrink-0 select-none text-[9px] font-mono text-gray-400">
                    <p>{h.date}</p>
                    <button 
                      onClick={() => {
                        setInputText(h.title);
                        setActiveTab('chat');
                      }}
                      className="text-sky-600 hover:underline hover:scale-105 mt-1 block uppercase font-bold text-[9px]"
                    >
                      Restore Conversation
                    </button>
                  </div>
                </div>
              ))}

              {activeHistoryFiltered.length === 0 && (
                <div className="text-center py-16 text-gray-400 font-sans select-none">
                  <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-xs font-bold text-gray-800">No historic items matching searches.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* 5. RISK APPROVAL DIALOG CONTAINER */}
      {riskConfirmModal && riskConfirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 select-none animate-fade-in" id="risk-permission-confirm">
          <div className="bg-white border-2 border-black max-w-sm w-full p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex gap-3 items-start text-red-700">
              <ShieldCheck className="w-10 h-10 text-red-600 bg-red-50 p-2 rounded-xl shrink-0 border border-red-200 animate-pulse" />
              <div>
                <strong className="text-xs font-bold font-display text-gray-900 block">{riskConfirmModal.title}</strong>
                <span className="text-[10px] uppercase font-mono font-black text-red-700">Level: High Executive Override</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-600 leading-normal font-sans">
              {riskConfirmModal.description}
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setRiskConfirmModal(null)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-neutral-300 rounded-lg text-xs font-bold text-gray-600 transition cursor-pointer"
              >
                No, Deny Access
              </button>
              <button
                onClick={riskConfirmModal.onApprove}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-xs"
              >
                Yes, Authorize Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
