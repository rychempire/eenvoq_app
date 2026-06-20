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
  } | null>({
    show: true,
    text: "Peak Milk will run out of stock in 3 days!",
    subtext: "Velocity rose by 32% this week relative to dairy benchmarks. Click to draft order.",
    prompt: "Peak milk is running out soon. Create a reorder purchase draft for 48 cartons instantly."
  });

  // --- POPULATE INITIAL CONVOS OR INTERACTION LAYERS ---
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-init',
          role: 'model',
          text: "Welcome back, owner. I am fully integrated with your POS register terminal, debtor profiles, and stock ledger. How can I assist you with business operations today?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          structured: {
            answer: "Welcome back. I am fully integrated with your POS register, debtor ledgers, and inventory database. Ask me to find security breaches, calculate true daily profit, or draft restock purchase orders.",
            evidence: [
              "🔌 Live connection: checkout terminal broader network is functioning",
              "📁 Reconciled audits: 7 complete ledgers loaded",
              "📊 Outstanding customer tab assets tracking: active"
            ],
            actions: [
              { type: 'ask_profit', label: 'Suggest restock recommendations', value: 'Which products should I reorder?' },
              { type: 'ask_leak', label: 'Check for suspicious discounts', value: 'Find suspicious transactions.' },
              { type: 'ask_debtor', label: 'List overdue collection priorities', value: 'Show overdue debtors.' }
            ]
          }
        }
      ]);
    }
  }, []);

  // --- TASKS LIST WITH REAL-TIME ACTIONS ---
  const [taskList, setTaskList] = useState<AITask[]>([
    {
      id: 'task-1',
      title: 'Approve Pepsi 50cl Purchase Order',
      priority: 'high',
      impact: 'Avoids stock depletion of top soft beverage',
      category: 'inventory',
      recommendedAction: 'Order 48 cartons from Wholesale distributors @ N1,200',
      status: 'pending'
    },
    {
      id: 'task-2',
      title: 'Review Lagos Broad-Street Cash Variance',
      priority: 'high',
      impact: 'Recover N1,450 variance',
      category: 'fraud',
      recommendedAction: 'Operator Prince reported hand-over variance. Request ledger audit.',
      status: 'pending'
    },
    {
      id: 'task-3',
      title: 'Dispatch overdue alert to Baba Sadiq',
      priority: 'medium',
      impact: 'Collect N50,000 outstanding debt',
      category: 'debtor',
      recommendedAction: 'Tab has exceeded due date by 14 days. Click to execute SMS reminder.',
      status: 'pending'
    },
    {
      id: 'task-4',
      title: 'Launch Weekend Soda Flash Offer',
      priority: 'low',
      impact: 'Clear slow moving Coca-Cola stock',
      category: 'campaign',
      recommendedAction: 'Direct a 5% discount push notification to active customers in loyalty program.',
      status: 'pending'
    }
  ]);

  // --- DYNAMIC AI INSIGHTS ---
  const systemInsights = useMemo(() => {
    // Dynamically calculate key facts from data props
    const lowStockCount = inventory.filter(p => p.stockLevel <= p.safeMin).length;
    const highRiskDebtorsCount = debtors.filter(d => d.riskRating === 'high').length;
    const totalAr = debtors.reduce((sum, d) => sum + d.amountOwed, 0);

    return [
      {
        icon: 'trending-up',
        title: 'Daily sales volume trending safe',
        desc: 'Expected daily revenue stands robust. Basket values are up by 4.2% on sweet confectionery indices.',
        priority: 'medium',
        impact: 'Positive revenue acceleration'
      },
      {
        icon: 'package',
        title: `${lowStockCount} products nearing critical stock-out`,
        desc: `Urgent restock advised. Your current safe margins will be depleted entirely by next Tuesday.`,
        priority: 'high',
        impact: 'Prevention of unfulfilled sales',
        prompt: `Which products have stock levels below target thresholds?`
      },
      {
        icon: 'alert-triangle',
        title: `${highRiskDebtorsCount} overdue debt limits requiring recovery action`,
        desc: `Asset portfolio shows ${formatCurrency(totalAr, currency)} locked under broad-line overdue terms.`,
        priority: 'high',
        impact: 'Improves cash-flow solvency',
        prompt: `Show overdue debtors.`
      },
      {
        icon: 'coins',
        title: 'Shift drawer reconciliation consistency improved',
        desc: `Daily audit confidence rating scaled to 94% following standardized terminal sign-offs.`,
        priority: 'low',
        impact: 'System integrity rating secure'
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
          "📂 Supplier: Jiggler Foods & Diary Ltd.",
          "📦 Product: Peak Milk 50cl (Total count: 48 cartons)",
          "💰 Invoice Value: N57,600 Naira",
          "📅 Date logged: 2026-06-20"
        ];
        actions = [
          { type: 'approve_purchase_order', label: 'Approve Purchase OrderPO-394', value: 'Approve Invoice purchase' },
          { type: 'modify_qty', label: 'Modify Quantity', value: 'Adjust PO items count' },
          { type: 'dismiss_ocr', label: 'Disclaim/Cancel Transfer', value: 'Cancel' }
        ];
      } else if (category === 'receipt') {
        answer = "Extracted customer checkout verification swipe from terminal. The system automatically reconciled transaction total with virtual ledger balance.";
        evidence = [
          "🧾 POS Receipt ID: TXN-4011-BROAD",
          "💰 Extracted Total: N12,400 Naira",
          "👤 Cashier Operator: Prince",
          "✅ Audit matching: 100% matched to Broad-Street terminal journal entries."
        ];
        actions = [
          { type: 'reconcile_match', label: 'Flag & Record Validated Sale', value: 'Save verified' },
          { type: 'cancel', label: 'Dismiss File', value: 'Close file details' }
        ];
      } else {
        answer = "Image parsing completed. Discrepancy logged for physical damages matching damaged inventory stock logs.";
        evidence = [
          "📁 File type: DAMAGED STOCK CAPTURED",
          "📦 Affected product index: Fanta Soft Drinks",
          "⚠️ Reason: Carbonation leak / burst container during broad corridor transport"
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
        answerTxt = `Low stock intelligence triggers active warnings. I detected ${lowStockItems.length} core products nearing critical stock exhaustion. I recommend prompt restocks to prevent competitor sales capture.`;
        evidenceList = lowStockItems.map(p => `📦 ${p.name}: Count ${p.stockLevel} units (Minimum Margin Limit: ${p.safeMin})`);
        
        actionsList = [
          { type: 'restock_peak', label: 'Approve Restock PO (All Overdues)', value: 'Draft restocks instantly' },
          { type: 'adjust_safe_limits', label: 'Modify Critical Depletion Thresholds', value: 'Edit inventory numbers' }
        ];
      } 
      // --- 2. DEBT / DEBTOR / OVERDUE ---
      else if (lowercaseQuery.includes('debt') || lowercaseQuery.includes('debtor') || lowercaseQuery.includes('owe') || lowercaseQuery.includes('overdue')) {
        const outstanding = debtors.filter(d => d.amountOwed > 0);
        const outstandingSum = outstanding.reduce((sum, d) => sum + d.amountOwed, 0);
        answerTxt = `Accounts Receivable ledgers hold outstanding debts totaling ${formatCurrency(outstandingSum, currency)}. There are ${outstanding.filter(d => d.riskRating === 'high').length} high-risk active customer lines operating outside payment grace periods.`;
        evidenceList = outstanding.map(d => `⚠️ ${d.name}: owes ${formatCurrency(d.amountOwed, currency)} (DueDate: ${d.dueDate} - risk index: ${d.riskRating.toUpperCase()})`);
        
        actionsList = [
          { type: 'sms_push_reminders', label: 'Dispatch Automated SMS Reminders', value: 'Launch reminder queue' },
          { type: 'credit_suspend_highs', label: 'Suspend Credit for High-Risk Accounts', value: 'Apply debit locks' }
        ];
      }
      // --- 3. PROFIT / REVENUE / LOSS ---
      else if (lowercaseQuery.includes('profit') || lowercaseQuery.includes('revenue') || lowercaseQuery.includes('today') || lowercaseQuery.includes('down')) {
        const todayReceipts = receipts.filter(r => !r.deleted && r.timestamp.startsWith('2026-06-20'));
        const totalSalesToday = todayReceipts.reduce((sum, r) => sum + r.totalAmount, 0);
        answerTxt = `Revenue today is reported at ${formatCurrency(totalSalesToday || 218500, currency)}. This represents a 14% drop in food corridor traffic relative to previous shift registers, mostly caused by an afternoon local network disconnect.`;
        evidenceList = [
          `📉 Beverage product baskets dropped 22% during afternoon hours.`,
          `💵 Reconciled Tills show no structural deficits.`,
          `📊 Calculated gross margins: 24.5% safe baseline.`
        ];
        
        actionsList = [
          { type: 'launch_push_promotion', label: 'Create Evening Soda Promo Push', value: 'Create discount campaign' },
          { type: 'view_discrepancies', label: 'Verify POS Reconciliations', value: 'Check drawer splits' }
        ];
      }
      // --- 4. SUSPICIOUS / FRAUD ---
      else if (lowercaseQuery.includes('suspicious') || lowercaseQuery.includes('fraud') || lowercaseQuery.includes(' Prince') || lowercaseQuery.includes('leak') || lowercaseQuery.includes('variance')) {
        answerTxt = `Operational forensic monitors flagged 2 anomalies under checkout supervisor sign-offs that suggest cash drawer leaks or excessive soft discounts.`;
        evidenceList = [
          `⚠️ Operator Prince: Logged 2 high-value checkout voids within 4 minutes.`,
          `⚠️ Discount margins: An average 28% coupon was used three times without standard authorization logs.`,
          `⚖️ Cash drawer matching: Expected cashier balances exceeded actual hand-over by 1,450 naira.`
        ];
        
        actionsList = [
          { type: 'flag_audit', label: 'Initiate Forensic Inspection on Cashier Prince', value: 'Start auditing investigation' },
          { type: 'add_reconciliation_audit', label: 'Create New Truth Audit Ledger', value: 'Trace variance' }
        ];
      }
      // --- DEFAULT AI ASSISTANCE ---
      else {
        answerTxt = `Understood. I am online with access to the store database. How would you like me to forecast store margins, draft PO files, or dispatch debt messages?`;
        evidenceList = [
          `📁 26 active inventory records registered.`,
          `👤 7 operators verified within team rosters.`,
          `🔒 Core system security levels are optimal.`
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
          successMsg = `✅ Restock Purchase Order (Total: N48,500) successfully structured and dispatched to Suppliers. Stock allocation reserves will update upon warehouse fulfillment.`;
          break;
        case 'sms_push_reminders':
        case 'sms_push':
          successMsg = `📡 Customer overdue collection remind streams initiated! Automated SMS alerts successfully dispatched to Baba Sadiq and pending debtor profiles.`;
          break;
        case 'credit_suspend_highs':
          successMsg = `🔒 Account credit suspended for Baba Sadiq and related high-risk debtors! POS swipe registers are locked for these profiles until balances are settled.`;
          break;
        case 'flag_audit':
          successMsg = `🕵️ Forensic alert dispatched to administrator panel. Cashier Prince terminal activity is flagged for dual-void inspection audits.`;
          break;
        case 'launch_push_promotion':
        case 'create_promo':
          successMsg = `🎉 Flash promotion campaign launched! "5% weekend discount on Pepsi & Coca-Cola" push notification broadcast to all regular customers.`;
          break;
        case 'write_off_inventory':
          successMsg = `⚖️ Inventory stock discrepancy registered. Damaged beverage units written-off; audit logging track updated.`;
          break;
        default:
          successMsg = `👍 Action "${metaLabel}" approved and fully executed. Store audit log was updated.`;
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
    <div className="flex flex-col h-[calc(100vh-6.5rem)] bg-[#FCFAF7] rounded-[24px] border border-[#E3E3E3] shadow-xs overflow-hidden" id="ai-intelligence-canvas">
      
      {/* 1. OPERATIONS HEADER */}
      <div className="h-16 border-b border-[#E3E3E3] px-6 flex items-center justify-between bg-white/90 backdrop-blur select-none shrink-0" id="ai-top-navigation">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.hash = 'dashboard'}
            className="p-1 px-1.5 hover:bg-gray-100 rounded-full transition text-[#1F1F1F] cursor-pointer flex items-center justify-center shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-700 fill-indigo-100 animate-pulse" />
            <h2 className="text-sm font-bold font-display text-[#1F1F1F] uppercase tracking-wide">
              Edenvoq Business Assistant
            </h2>
          </div>
        </div>

        {/* Clear buttons / Status flags */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] uppercase font-bold tracking-wider px-3 h-8 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping" />
            AI Synced Live
          </span>
          <button 
            onClick={() => {
              clearChat();
              setMessages([messages[0]]);
            }}
            className="text-xs text-[#5F6368] hover:text-black hover:bg-slate-50 border border-[#E3E3E3] px-3.5 h-8.5 rounded-full flex items-center gap-1.5 cursor-pointer transition font-bold"
          >
            <RefreshCcw className="w-3 h-3" />
            Reset Chat
          </button>
        </div>
      </div>

      {/* 2. CORE NAVIGATION TAB STRIPS */}
      <div className="flex border-b border-[#e3e3e3] bg-white text-[#444746] px-6 select-none shrink-0" id="assistant-inner-tabs">
        {[
          { tab: 'chat', label: 'Executive Chat', icon: <MessageSquare className="w-3.5 h-3.5" /> },
          { tab: 'insights', label: 'Daily Intelligence Insights', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { tab: 'tasks', label: 'Action Center Tasks', icon: <CheckSquare className="w-3.5 h-3.5" /> },
          { tab: 'history', label: 'Previous Audit History', icon: <Clock className="w-3.5 h-3.5" /> }
        ].map((t) => (
          <button 
            key={t.tab}
            onClick={() => {
              setActiveTab(t.tab as any);
              if (t.tab === 'chat') {
                setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
              }
            }}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs border-b-2 transition-all relative cursor-pointer ${
              activeTab === t.tab ? 'border-sky-500 text-sky-600 font-medium' : 'border-transparent text-slate-500 hover:text-black font-normal'
            }`}
          >
            {t.icon}
            {t.label}

            {/* Red alert badges for notifications */}
            {t.tab === 'tasks' && taskList.filter(tk => tk.status === 'pending').length > 0 && (
              <span className="absolute top-1.5 right-1 bg-red-600 text-white font-medium text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {taskList.filter(tk => tk.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. PROACTIVE SYSTEM INTRUSION BAR */}
      {proactiveNotification && proactiveNotification.show && (
        <div className="bg-amber-50 border-b border-amber-200/60 p-3 px-6 flex items-center justify-between select-none animate-fade-in shrink-0" id="proactive-threat-warning">
          <div className="flex items-center gap-2.5">
            <div className="p-1 text-amber-700 bg-white border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-amber-950 leading-none">{proactiveNotification.text}</p>
              <p className="text-[10px] text-amber-900 leading-tight mt-1">{proactiveNotification.subtext}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => {
                setInputText(proactiveNotification.prompt);
                setProactiveNotification(null);
                setActiveTab('chat');
              }}
              className="px-3.5 py-1 text-[10px] font-medium uppercase text-white bg-amber-850 bg-amber-800 rounded-full hover:bg-amber-900 transition cursor-pointer"
            >
              Draft Purchase Order
            </button>
            <button onClick={() => setProactiveNotification(null)} className="text-amber-500 hover:text-amber-800 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. MAIN CONTENT WORKSPACE VIEW */}
      <div className="flex-1 overflow-y-auto" id="assistant-viewspace">

        {/* Tab A: CONVERSATIONAL AGENT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full bg-[#fdfcfb]">
            
            {/* Scrollable chat messages panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" id="messages-stream">
              <div className="max-w-2xl mx-auto space-y-5">
                
                {messages.map((msg, i) => {
                  const isAI = msg.role === 'model';
                  return (
                    <div key={msg.id || i} className={`flex gap-3.5 ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                      
                      {isAI && (
                        <div className="w-9 h-9 rounded-full border border-indigo-200 bg-indigo-50 flex items-center justify-center shrink-0">
                          <EenvoqIcon className="w-4.5 h-4.5 text-indigo-700" />
                        </div>
                      )}

                      <div className={`max-w-[85%] rounded-[20px] p-5.5 text-xs ${
                        isAI 
                          ? 'bg-white border border-[#E3E3E3] text-gray-900 shadow-xs' 
                          : 'bg-[#1f1f1f] text-white'
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
                              <strong className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 block mb-1">Answer</strong>
                              <p className="text-gray-900 leading-relaxed font-sans">{msg.structured.answer}</p>
                            </div>

                            {/* Section 2: Evidence checklist */}
                            <div className="bg-neutral-50/70 border border-neutral-100 p-3.5 rounded-xl">
                              <strong className="text-[10px] uppercase font-mono tracking-widest text-[#757575] block mb-2">Evidence Data Logged</strong>
                              <ul className="space-y-1.5 font-mono text-[10px] text-gray-700 leading-relaxed">
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
                              <div className="pt-2 select-none border-t border-gray-100">
                                <strong className="text-[10px] uppercase font-mono tracking-widest text-emerald-700 block mb-2 font-black">Approved Dispatch Actions</strong>
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
                          <div className="space-y-2 select-text leading-relaxed font-sans whitespace-pre-wrap">
                            <p>{msg.text}</p>
                          </div>
                        )}

                        {/* Speech read-out voice assistance button */}
                        <div className="flex items-center justify-between text-[9px] mt-3.5 pt-2 border-t border-gray-50 text-gray-400">
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          
                          <button 
                            onClick={() => handleTogglePlayback(msg.id, msg.structured ? msg.structured.answer : msg.text)}
                            className="flex items-center gap-1 px-2 py-0.5 border border-neutral-200/50 hover:border-neutral-300 text-[10px] font-bold rounded-md bg-neutral-50 hover:bg-neutral-100 transition cursor-pointer text-[#1F1F1F]"
                          >
                            {activePlaybackId === msg.id ? (
                              <>
                                <Pause className="w-2.5 h-2.5 text-indigo-700 fill-indigo-700" />
                                <span className="animate-pulse">Stop</span>
                              </>
                            ) : (
                              <>
                                <Mic className="w-2.5 h-2.5" />
                                <span>Speak</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>

                      {!isAI && (
                        <div className="w-9 h-9 rounded-full bg-indigo-950 text-indigo-100 flex items-center justify-center shrink-0 border border-indigo-900 text-xs font-bold font-mono">
                          OP
                        </div>
                      )}

                    </div>
                  );
                })}

                {sending && (
                  <div className="flex gap-3 justify-start animate-fade-in">
                    <div className="w-9 h-9 rounded-full border border-indigo-200 bg-indigo-50 flex items-center justify-center shrink-0">
                      <EenvoqIcon className="w-4.5 h-4.5 text-indigo-750 animate-bounce" />
                    </div>
                    <div className="bg-[#f0f4f9]/80 border border-gray-200 rounded-[20px] px-5 py-4 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce" />
                      <span className="text-[10px] text-indigo-900 font-mono pl-1">Scanning systems data...</span>
                    </div>
                  </div>
                )}

                <div ref={threadEndRef} />
              </div>
            </div>

            {/* Suggested cards at the bottom */}
            {messages.length <= 1 && (
              <div className="max-w-2xl mx-auto w-full px-6 py-4 select-none" id="starting-prompts-cardboard">
                <p className="text-[10px] font-black uppercase text-[#757575] tracking-widest mb-3 text-center">Suggested Business Workflows</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    { q: "Why did revenue drop today?", d: "Evaluate afternoon billing anomalies" },
                    { q: "Which products should I reorder?", d: "Detect critical threshold stock-outs" },
                    { q: "Show overdue debtors.", d: "Draft automated priority reminds" },
                    { q: "Find suspicious transactions.", d: "Check operator Prince sign-off voids" }
                  ].map((sg, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(sg.q)}
                      className="p-4 bg-white/60 hover:bg-white border border-[#E3E3E3] hover:border-indigo-400 rounded-2xl text-left transition cursor-pointer text-xs font-sans group shadow-2xs"
                    >
                      <strong className="text-gray-900 font-display block mb-1 group-hover:text-indigo-900 transition flex items-center justify-between">
                        {sg.q}
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </strong>
                      <span className="text-gray-500 text-[10px] font-mono leading-none">{sg.d}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Composer Console */}
            <div className="p-4 bg-white border-t border-[#E3E3E3] select-none shrink-0" id="chat-control-console">
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleVoiceOrTextSend} className="relative flex items-center bg-neutral-50/50 border border-[#E3E3E3] rounded-3xl p-1.5 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  
                  {/* Speech input simulator toggle */}
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`p-3.5 rounded-full transition cursor-pointer shrink-0 ${
                      isRecording ? 'bg-red-100 text-red-700 animate-pulse' : 'hover:bg-neutral-100 text-gray-500'
                    }`}
                    title={isRecording ? "Stop voice recording" : "Speak to Eenvoq naturally..."}
                  >
                    <Mic className="w-4.5 h-4.5" />
                  </button>

                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isRecording ? `Recording simulated voice input... [${voiceSeconds}s]` : "Ask Eenvoq anything..."}
                    className="flex-1 bg-transparent px-3 py-3 text-xs text-gray-900 focus:outline-hidden placeholder-gray-500"
                    disabled={isRecording}
                  />

                  {/* Attachment launchers */}
                  <div className="flex items-center gap-1.5 px-2">
                    <button
                      type="button"
                      onClick={() => simulateAttachmentUpload('invoice')}
                      className="p-2 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 transition rounded-lg cursor-pointer"
                      title="Upload Supplier Invoice"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateAttachmentUpload('receipt')}
                      className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition rounded-lg cursor-pointer"
                      title="Upload Customer Receipt"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-3 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-40 text-white rounded-full transition cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="flex justify-between items-center text-[9px] text-[#757575] mt-2 px-3">
                  <span>Reconciled live against central databases</span>
                  <span className="flex items-center gap-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> High-security encryption active
                  </span>
                </div>
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
                    case 'trending-up': return <TrendingUp className="w-5 h-5 text-indigo-650 text-indigo-600" />;
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
                <h3 className="text-sm font-bold text-gray-900 font-display">Conversational Action Authorization Board</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">High-impact actions recommended by AI requiring secure manual sign-off.</p>
              </div>
              <span className="text-xs font-black px-2.5 py-1 bg-[#1f1f1f] text-white rounded-full font-mono">
                {taskList.filter(t => t.status === 'pending').length} Actions Pending
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
                        {t.priority} Risk
                      </span>
                      <strong className="text-xs font-bold text-gray-900 font-display">{t.title}</strong>
                    </div>

                    <p className="text-[11px] text-[#757575] font-sans">
                      Impact profile: <strong className="text-emerald-700 font-semibold">{t.impact}</strong>
                    </p>

                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[11px] font-mono leading-relaxed text-gray-800">
                      <strong>AI Advice:</strong> {t.recommendedAction}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 shrink-0 select-none">
                    <button
                      onClick={() => {
                        // Approve & trigger confirm
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
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>

                </div>
              ))}

              {taskList.filter(t => t.status === 'pending').length === 0 && (
                <div className="text-center py-16 bg-white border border-[#E3E3E3] rounded-3xl select-none">
                  <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <strong className="text-gray-900 block text-xs font-display">All Task Queue Action Clear!</strong>
                  <p className="text-[10px] text-gray-400 mt-1">Excellent work. AI task pipelines compiled and approved.</p>
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
                      historyFilter === cat ? 'bg-white text-indigo-700 shadow-2xs' : 'hover:text-black font-semibold'
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
                      className="text-indigo-600 hover:underline hover:scale-105 mt-1 block uppercase font-bold text-[9px]"
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
