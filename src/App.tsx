import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Menu, X, Sparkles, BellRing, Settings2, LogOut, Shield, SidebarClose, Activity,
  LayoutDashboard, ShoppingCart, Users
} from 'lucide-react';
import { 
  UserSession, Receipt, InventoryItem, Debtor, TruthAudit, Alert, ChatMessage, RetentionCampaign, TeamMember 
} from './types';
import { 
  DEFAULT_USER, INITIAL_RECEIPTS, INITIAL_INVENTORY, INITIAL_DEBTORS, 
  INITIAL_AUDITS, INITIAL_ALERTS, INITIAL_RETENTION_CAMPAIGNS, SAMPLE_AI_INSIGHTS 
} from './demoData';

import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import EenvoqIcon from './components/EenvoqIcon';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import ReceiptVerification from './components/ReceiptVerification';
import TruthCheck from './components/TruthCheck';
import ForensicInvestigator from './components/ForensicInvestigator';
import InventoryIntelligence from './components/InventoryIntelligence';
import CustomerRetention from './components/CustomerRetention';
import DebtorControl from './components/DebtorControl';
import ReportingCenter from './components/ReportingCenter';
import NotificationsCenter from './components/NotificationsCenter';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';

export default function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('eenvoq_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeSection, _setActiveSection] = useState<string>(() => {
    const savedSession = localStorage.getItem('eenvoq_user_session');
    if (savedSession) {
      return localStorage.getItem('eenvoq_active_section') || 'dashboard';
    }
    return 'landing';
  });

  const setActiveSection = (sec: string) => {
    _setActiveSection(sec);
    if (!sec.includes('/')) {
      window.location.hash = sec;
    }
  };

  // Harmonize state with browser back button / hash changes
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '').split('/')[0];
      const validSections = [
        'dashboard', 'assistant', 'receipts', 'truthcheck', 'forensic',
        'inventory', 'retention', 'debtor', 'reports', 'notifications', 'settings', 'landing'
      ];
      if (hash && validSections.includes(hash)) {
        _setActiveSection(hash);
      } else {
        const savedSession = localStorage.getItem('eenvoq_user_session');
        if (savedSession) {
          _setActiveSection('dashboard');
        } else {
          _setActiveSection('landing');
        }
      }
    };
    window.addEventListener('hashchange', handlePopState);
    handlePopState();
    return () => window.removeEventListener('hashchange', handlePopState);
  }, []);
  
  // Responsive mobile menu toggles
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Core application states loaded from localStorage dynamically
  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem('eenvoq_receipts');
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('eenvoq_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  const [debtors, setDebtors] = useState<Debtor[]>(() => {
    const saved = localStorage.getItem('eenvoq_debtors');
    return saved ? JSON.parse(saved) : INITIAL_DEBTORS;
  });
  const [audits, setAudits] = useState<TruthAudit[]>(() => {
    const saved = localStorage.getItem('eenvoq_audits');
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('eenvoq_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });
  const [aiInsights, setAiInsights] = useState<string[]>(SAMPLE_AI_INSIGHTS);
  const [retentionCampaigns, setRetentionCampaigns] = useState<RetentionCampaign[]>(() => {
    const saved = localStorage.getItem('eenvoq_retention_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_RETENTION_CAMPAIGNS;
  });
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('eenvoq_chat_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Team & role management states
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('eenvoq_team_members');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeOperatorId, setActiveOperatorId] = useState<string>(() => {
    return localStorage.getItem('eenvoq_active_operator_id') || 'creator-primary';
  });

  const activeOperator = teamMembers.find(m => m.id === activeOperatorId) || teamMembers[0] || (userSession ? {
    id: 'creator-primary',
    name: userSession.name,
    role: 'Owner' as const,
    email: userSession.email,
    isCreator: true
  } : null);

  useEffect(() => {
    if (userSession) {
      const saved = localStorage.getItem('eenvoq_team_members');
      let loaded: TeamMember[] = saved ? JSON.parse(saved) : [];
      const creatorExists = loaded.some(m => m.isCreator);
      if (!creatorExists) {
        const creator: TeamMember = {
          id: 'creator-primary',
          name: userSession.name,
          role: 'Owner',
          email: userSession.email,
          isCreator: true
        };
        const testMembers: TeamMember[] = [
          creator,
          { id: 'member-1', name: 'Amadi Kalu', role: 'Supervisor', email: 'amadi@grocerygate.ng' },
          { id: 'member-2', name: 'Funmi Alao', role: 'Cashier', email: 'funmi@grocerygate.ng' },
          { id: 'member-3', name: 'Ibrahim Musa', role: 'Auditor', email: 'ibrahim@grocerygate.ng' }
        ];
        setTeamMembers(testMembers);
        localStorage.setItem('eenvoq_team_members', JSON.stringify(testMembers));
      } else {
        setTeamMembers(loaded.map(m => m.isCreator ? { ...m, name: userSession.name, email: userSession.email } : m));
      }
    }
  }, [userSession]);

  useEffect(() => {
    localStorage.setItem('eenvoq_active_operator_id', activeOperatorId);
  }, [activeOperatorId]);
  
  // Suggested context prompt trigger from elsewhere
  const [prefilledPrompt, setPrefilledPrompt] = useState<string>('');

  // Global custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    confirmLabel?: string, 
    cancelLabel?: string,
    onCancel?: () => void
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmLabel,
      cancelLabel,
      onConfirm,
      onCancel
    });
  };

  // Sync state changes to localStorage
  useEffect(() => {
    if (userSession) {
      localStorage.setItem('eenvoq_user_session', JSON.stringify(userSession));
    } else {
      localStorage.removeItem('eenvoq_user_session');
    }
  }, [userSession]);

  useEffect(() => {
    localStorage.setItem('eenvoq_active_section', activeSection);
  }, [activeSection]);

  // Ensure that whenever a page loads (activeSection or userSession transitions), it always displays from the top of the page
  useEffect(() => {
    const scrollToTop = () => {
      // 1. Reset standard viewport scrolling
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }

      // 2. Reset workspace scroll panel if rendered
      const workspacePanel = document.getElementById('workspace-main-panel');
      if (workspacePanel) {
        workspacePanel.scrollTop = 0;
      }
    };

    // Perform immediately
    scrollToTop();

    // Perform also on a microtask/short timeout to counter any content-dynamic sizing or dynamic layout adjustments
    const timeoutId = setTimeout(scrollToTop, 10);
    return () => clearTimeout(timeoutId);
  }, [activeSection, userSession]);

  useEffect(() => {
    localStorage.setItem('eenvoq_receipts', JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem('eenvoq_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('eenvoq_debtors', JSON.stringify(debtors));
  }, [debtors]);

  useEffect(() => {
    localStorage.setItem('eenvoq_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('eenvoq_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('eenvoq_chat_logs', JSON.stringify(chatLogs));
  }, [chatLogs]);

  useEffect(() => {
    localStorage.setItem('eenvoq_retention_campaigns', JSON.stringify(retentionCampaigns));
  }, [retentionCampaigns]);

  // Auto pre-load initial audit advice from eenvoq on entry
  useEffect(() => {
    if (userSession && chatLogs.length === 0) {
      setChatLogs([
        {
          id: 'welcome-logo',
          role: 'model',
          text: `Welcome Chief Specialist ${userSession.name}! 🌟 I am eenvoq AI, your Autonomous Financial Guardian.
 
I have run audits across today's transaction registries and isolated our health scores:
* **Today's Receipts Expected:** ₦712,000 (across verified transactions)
* **Declared Register Cash:** ₦725,000
* **Variance Discrepancy Alert:** Physical till audits map a **₦45,000 cash shortage** on June 13th. Heatmaps pinpoint the register vulnerability zone between **3:00 PM and 5:00 PM**.
 
**Operational Actions required tonight:**
1. Block credit routing on B2B account **Baba Sadiq** (past due by 3 days).
2. Replenish **Indomie Noodles cartons** (depletion forecast within 2.2 days).
3. Dispatch loyalty discount triggers to premium client **Amara Nwachukwu** (no visit in 7 days).
 
Ask me to investigate any anomaly, compute restock velocities, or write collection reminders!`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [userSession]);

  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    setActiveSection('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('eenvoq_user_session');
    localStorage.removeItem('eenvoq_active_section');
    localStorage.removeItem('eenvoq_receipts');
    localStorage.removeItem('eenvoq_inventory');
    localStorage.removeItem('eenvoq_debtors');
    localStorage.removeItem('eenvoq_audits');
    localStorage.removeItem('eenvoq_alerts');
    localStorage.removeItem('eenvoq_chat_logs');
    localStorage.removeItem('eenvoq_retention_campaigns');
    setUserSession(null);
    setChatLogs([]);
    setActiveSection('landing');
  };

  const handleAddReceipt = (newReceipt: Receipt) => {
    const receiptWithAudit: Receipt = {
      ...newReceipt,
      createdBy: newReceipt.createdBy || (activeOperator ? {
        name: activeOperator.name,
        role: activeOperator.role,
        email: activeOperator.email
      } : {
        name: userSession?.name || "System",
        role: "Owner",
        email: userSession?.email || ""
      })
    };

    setReceipts(prev => [receiptWithAudit, ...prev]);
    
    // Add point score feedback notification
    const ptsAlert: Alert = {
      id: `ALT-PTS-${Date.now()}`,
      title: "Loyalty Points Awarded",
      description: `Client ${receiptWithAudit.customerName} verified transaction signature: ${receiptWithAudit.securitySignature} (+${receiptWithAudit.rewardPoints} points).`,
      timestamp: new Date().toISOString(),
      priority: 'low',
      category: 'verification',
      read: false
    };
    setAlerts(prev => [ptsAlert, ...prev]);

    // Update expected sales insights automatically
    setAiInsights(prev => [
      `💰 **Receipt logged:** Verified ₦${receiptWithAudit.totalAmount.toLocaleString()} check-out docket for ${receiptWithAudit.customerName}.`,
      ...prev.slice(0, 3)
    ]);
  };

  const handleEditReceipt = (id: string, updatedFields: Partial<Receipt>) => {
    setReceipts(prev => prev.map(r => {
      if (r.id === id) {
        const edits = r.editedBy || [];
        const newEdit = {
          name: activeOperator ? activeOperator.name : userSession?.name || "System",
          role: activeOperator ? activeOperator.role : "Owner",
          email: activeOperator ? activeOperator.email : userSession?.email || "",
          timestamp: new Date().toISOString()
        };
        // recalculate reward points if totalAmount changed
        let rewardPoints = r.rewardPoints;
        if (updatedFields.totalAmount !== undefined) {
          rewardPoints = Math.round(updatedFields.totalAmount * 0.01);
        }
        return {
          ...r,
          ...updatedFields,
          rewardPoints,
          editedBy: [...edits, newEdit]
        };
      }
      return r;
    }));
  };

  const handleDeleteReceipt = (id: string) => {
    setReceipts(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          deleted: true,
          deletedBy: {
            name: activeOperator ? activeOperator.name : userSession?.name || "System",
            role: activeOperator ? activeOperator.role : "Owner",
            email: activeOperator ? activeOperator.email : userSession?.email || "",
            timestamp: new Date().toISOString()
          }
        };
      }
      return r;
    }));
  };

  const handleAddTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: `member-${Date.now()}`
    };
    setTeamMembers(prev => {
      const next = [...prev, newMember];
      localStorage.setItem('eenvoq_team_members', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteTeamMember = (id: string) => {
    setTeamMembers(prev => {
      const next = prev.filter(m => m.id !== id || m.isCreator);
      localStorage.setItem('eenvoq_team_members', JSON.stringify(next));
      return next;
    });
  };

  const handleAddAudit = (newAudit: TruthAudit) => {
    setAudits(prev => [newAudit, ...prev]);
    
    if (newAudit.difference < 0) {
      const shortageAlert: Alert = {
        id: `ALT-AUD-${Date.now()}`,
        title: "Daily Drawer Deficit Warning",
        description: `Variance deficit value of -₦${Math.abs(newAudit.difference).toLocaleString()} detected. Suspicion scale is at ${newAudit.riskLevel.toUpperCase()}.`,
        timestamp: new Date().toISOString(),
        priority: 'critical',
        category: 'variance',
        read: false
      };
      setAlerts(prev => [shortageAlert, ...prev]);
    }
  };

  const handleTriggerRestock = (itemId: string, qty: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = item.stockLevel + qty;
        return {
          ...item,
          stockLevel: newStock,
          forecastedDepletionDays: Math.round((newStock / item.velocity) * 10) / 10
        };
      }
      return item;
    }));
  };

  const handleToggleDebtorLock = (debtorId: string) => {
    setDebtors(prev => prev.map(debtor => {
      if (debtor.id === debtorId) {
        const nextLock = !debtor.locked;
        
        // Add compliance lock notification feed
        const lockAlert: Alert = {
          id: `ALT-LOCK-${Date.now()}`,
          title: nextLock ? "Debtor Ledger Lock Applied" : "Debtor Ledger Unlocked",
          description: nextLock 
            ? `B2B sales routing for client ${debtor.name} locked on all register terminals due to past-due balances.`
            : `Overdraft permissions re-granted for merchant account ${debtor.name}.`,
          timestamp: new Date().toISOString(),
          priority: nextLock ? 'high' : 'medium',
          category: 'debtor',
          read: false
        };
        setAlerts(prev => [lockAlert, ...prev]);

        return { ...debtor, locked: nextLock };
      }
      return debtor;
    }));
  };

  const handleSendMessage = async (text: string, files?: { name: string; type: string }[]) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
      attachments: files
    };
    
    setChatLogs(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatLogs, userMsg],
          context: {
            storeName: userSession?.storeName,
            merchantName: userSession?.name,
            storeType: userSession?.role,
            location: userSession?.storeLocation,
            expectedRevenue: receipts.filter(r => r.status === 'verified' || r.status === 'pending').reduce((s, r) => s + r.totalAmount, 0),
            declaredRevenue: audits[0]?.declaredRevenue || 0,
            difference: audits[0]?.difference || 0,
            riskLevel: audits[0]?.riskLevel || 'low',
            alerts: alerts.slice(0, 5),
            inventory: inventory.map(i => ({ name: i.name, stock: i.stockLevel, depletion: i.forecastedDepletionDays })),
            debtors: debtors.map(d => ({ name: d.name, owed: d.amountOwed, rating: d.riskRating, locked: d.locked })),
            retention: retentionCampaigns.map(rc => ({ name: rc.customerName, churn: rc.churnProbability }))
          }
        })
      });

      const data = await response.json();
      
      const aiReply: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: 'model',
        text: data.text || "Failed to communicate with guardian nodes.",
        timestamp: new Date().toISOString()
      };

      setChatLogs(prev => [...prev, aiReply]);

      // Smart action integrations (locks Baba Sadiq automatically if model suggests it)
      if (text.toLowerCase().includes("lock baba sadiq") || text.toLowerCase().includes("block sadiq")) {
        setDebtors(prev => prev.map(d => d.name.includes("Sadiq") ? { ...d, locked: true } : d));
      }
    } catch (err) {
      // Offline fallback
      setTimeout(() => {
        const fallMsg: ChatMessage = {
          id: `msg-${Date.now()}-fall`,
          role: 'model',
          text: `Offline Advisory Fallback: Dynamic restock and accounts locked compiled! 
  
  * **Critical stock alert:** Indomie Noodles requires 12 cartons before Tuesday. 
  * **Collections status:** SMS alert formatted for Baba Sadiq. Account transaction blocks remain active.`,
          timestamp: new Date().toISOString()
        };
        setChatLogs(prev => [...prev, fallMsg]);
      }, 800);
    }
  };

  const handleNavigateToAssistant = (promptText: string) => {
    setPrefilledPrompt(promptText);
    setActiveSection('assistant');
  };

  // Full-screen website landing page view
  if (activeSection === 'landing') {
    return <LandingPage onEnterApp={() => setActiveSection('dashboard')} />;
  }

  // If user is not yet logged in, present the registration check gateway
  if (!userSession) {
    return <Auth onLogin={handleLogin} onBackToLanding={() => setActiveSection('landing')} />;
  }

  // Helper variables to direct workspace views
  const renderWorkspaceMainBody = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Dashboard 
            receipts={receipts}
            inventory={inventory}
            debtors={debtors}
            audits={audits}
            alerts={alerts}
            aiInsights={aiInsights}
            setActiveSection={setActiveSection}
            onNavigateToAssistant={handleNavigateToAssistant}
            onAddAudit={handleAddAudit}
            showConfirm={showConfirm}
            user={userSession || undefined}
          />
        );
      case 'assistant':
        return (
          <AIAssistant 
            chatLogs={chatLogs}
            onSendMessage={handleSendMessage}
            receipts={receipts}
            inventory={inventory}
            debtors={debtors}
            audits={audits}
            alerts={alerts}
            clearChat={() => setChatLogs([])}
            prefilledPrompt={prefilledPrompt}
            clearPrefilledPrompt={() => setPrefilledPrompt('')}
          />
        );
      case 'receipts':
        return (
          <ReceiptVerification 
            receipts={receipts} 
            onAddReceipt={handleAddReceipt} 
            onEditReceipt={handleEditReceipt}
            onDeleteReceipt={handleDeleteReceipt}
            teamMembers={teamMembers}
            onAddTeamMember={handleAddTeamMember}
            onDeleteTeamMember={handleDeleteTeamMember}
            activeOperatorId={activeOperatorId}
            onChangeActiveOperator={setActiveOperatorId}
            showConfirm={showConfirm} 
          />
        );
      case 'truthcheck':
        return <TruthCheck audits={audits} receipts={receipts} onAddAudit={handleAddAudit} showConfirm={showConfirm} />;
      case 'forensic':
        return <ForensicInvestigator />;
      case 'inventory':
        return <InventoryIntelligence inventory={inventory} onTriggerRestock={handleTriggerRestock} showConfirm={showConfirm} />;
      case 'retention':
        return <CustomerRetention showConfirm={showConfirm} />;
      case 'debtor':
        return <DebtorControl debtors={debtors} onToggleLock={handleToggleDebtorLock} showConfirm={showConfirm} />;
      case 'reports':
        return <ReportingCenter showConfirm={showConfirm} />;
      case 'notifications':
        return (
          <NotificationsCenter 
            alerts={alerts}
            onMarkAllRead={() => setAlerts(prev => prev.map(a => ({ ...a, read: true })))}
            onClearAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
          />
        );
      case 'settings':
        return <Settings user={userSession} onUpdateUser={setUserSession} showConfirm={showConfirm} />;
      default:
        return <div className="text-center py-12">Action context not found.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#FCFAF7]" id="application-container-root animate-fade-in">
      
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex shrink-0">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          user={userSession}
          alerts={alerts}
          onLogout={handleLogout}
        />
      </div>

      {/* Main body canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Desktop Header for Minimalist Aesthetic */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-[#FCFAF7]/90 backdrop-blur-md border-b border-[#E3E3E3] select-none shrink-0" id="desktop-navigation-header">
          <h1 className="text-sm font-semibold text-[#1F1F1F] font-display flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1F1F1F]" />
            {userSession.storeName}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[#757575] font-mono tracking-wider font-semibold">AUDIT ACTIVE</span>
            <div className="w-8 h-8 rounded-full bg-white border border-[#E3E3E3] flex items-center justify-center text-xs font-semibold text-[#1F1F1F]">
              {userSession.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
          </div>
        </header>

         {/* Mobile Header Bar */}
        <header className="h-16 bg-[#FCFAF7]/90 backdrop-blur-md border-b border-[#E3E3E3] px-4 flex items-center justify-between md:hidden select-none shrink-0" id="mobile-navigation-header">
<div className="flex items-center gap-1">
  {/* Logo Image */}
  <img 
    src="https://res.cloudinary.com/dee01jm0p/image/upload/e_bgremoval/f_auto,q_auto/1001133582_wa3zq3" 
    alt="eenvoq logo" 
    className="h-10 w-auto object-contain select-none translate-y-0.5 [filter:drop-shadow(1px_0_0_#000)_drop-shadow(-1px_0_0_#000)_drop-shadow(0_1px_0_0_#000)_drop-shadow(0_-1px_0_0_#000)]" 
  />

  {/* Logo Text */}
  <span className="font-sans font-semibold text-[#1F1F1F] tracking-tight text-[22px] select-none leading-none">
    eenvoq
  </span>
</div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveSection('notifications')}
              className="p-1.5 hover:bg-gray-50 text-gray-500 rounded-lg relative cursor-pointer"
            >
              <BellRing className="w-4.5 h-4.5 stroke-[1.5]" />
              {alerts.filter(a => !a.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600" />
              )}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 hover:bg-gray-50 text-gray-500 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Menu className="w-5 h-5 stroke-[1.5]" />}
            </button>
          </div>
        </header>

        {/* Mobile Sidebar overlay */}
        {mobileMenuOpen && createPortal(
          <div className="fixed inset-0 z-[9999]" id="mobile-sidebar-backdrop">
            <div 
              className="fixed inset-0 bg-gray-950/40 backdrop-blur-xs transition-opacity" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed top-0 bottom-0 left-0 bg-white w-72 border-r border-gray-100 flex flex-col shadow-2xl">
              <Sidebar 
                activeSection={activeSection} 
                setActiveSection={(sec) => {
                  setActiveSection(sec);
                  setMobileMenuOpen(false);
                }} 
                user={userSession}
                alerts={alerts}
                onLogout={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              />
            </div>
          </div>,
          document.body
        )}

        {/* Dynamic Workspace Container scrolling segment */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative pb-28 md:pb-8" id="workspace-main-panel">
          <div className="max-w-7xl mx-auto" id="centralized-viewport-width-bounds">
            {renderWorkspaceMainBody()}
          </div>
        </main>

        {/* Mobile Floating Pill Premium Bottom Navigation */}
        {!mobileMenuOpen && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[88%] max-w-[420px] md:hidden z-40" id="mobile-floating-pill-nav">
            <div className="bg-white/85 backdrop-blur-xl border border-neutral-200/80 rounded-full h-[76px] px-2 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
              
              {/* Tab: Home */}
              <button 
                onClick={() => setActiveSection('dashboard')}
                className={`flex-1 flex flex-col items-center justify-center h-full rounded-full transition-all duration-300 cursor-pointer ${
                  activeSection === 'dashboard' ? 'text-[#1e40af] scale-105 font-bold' : 'text-[#757575] hover:text-black font-semibold'
                }`}
              >
                <LayoutDashboard className={`w-[22px] h-[22px] stroke-[1.5] transition-all duration-150 ${activeSection === 'dashboard' ? 'text-[#1e40af] stroke-[2]' : 'text-[#757575]'}`} />
                <span className="text-[9px] font-sans tracking-tight mt-1">Home</span>
                {activeSection === 'dashboard' && (
                  <span className="w-1 h-1 rounded-full bg-[#1e40af] mt-0.5 animate-pulse" />
                )}
              </button>

              {/* Tab: Inventory */}
              <button 
                onClick={() => setActiveSection('inventory')}
                className={`flex-1 flex flex-col items-center justify-center h-full rounded-full transition-all duration-300 cursor-pointer ${
                  activeSection === 'inventory' ? 'text-[#1e40af] scale-105 font-bold' : 'text-[#757575] hover:text-black font-semibold'
                }`}
              >
                <ShoppingCart className={`w-[22px] h-[22px] stroke-[1.5] transition-all duration-150 ${activeSection === 'inventory' ? 'text-[#1e40af] stroke-[2]' : 'text-[#757575]'}`} />
                <span className="text-[9px] font-sans tracking-tight mt-1">Inventory</span>
                {activeSection === 'inventory' && (
                  <span className="w-1 h-1 rounded-full bg-[#1e40af] mt-0.5 animate-pulse" />
                )}
              </button>

              {/* Tab: Eenvoq AI */}
              <button 
                onClick={() => setActiveSection('assistant')}
                className={`flex-1 flex flex-col items-center justify-center h-full rounded-full transition-all duration-300 cursor-pointer ${
                  activeSection === 'assistant' ? 'text-[#1e40af] scale-105 font-bold' : 'text-[#757575] hover:text-black font-semibold'
                }`}
              >
                <EenvoqIcon className={`w-[22px] h-[22px] stroke-[1.5] transition-all duration-150 ${activeSection === 'assistant' ? 'text-[#1e40af] stroke-[2]' : 'text-[#757575]'}`} />
                <span className="text-[9px] font-sans tracking-tight mt-1">Eenvoq AI</span>
                {activeSection === 'assistant' && (
                  <span className="w-1 h-1 rounded-full bg-[#1e40af] mt-0.5 animate-pulse" />
                )}
              </button>

              {/* Tab: Customers */}
              <button 
                onClick={() => setActiveSection('retention')}
                className={`flex-1 flex flex-col items-center justify-center h-full rounded-full transition-all duration-300 cursor-pointer ${
                  activeSection === 'retention' ? 'text-[#1e40af] scale-105 font-bold' : 'text-[#757575] hover:text-black font-semibold'
                }`}
              >
                <Users className={`w-[22px] h-[22px] stroke-[1.5] transition-all duration-150 ${activeSection === 'retention' ? 'text-[#1e40af] stroke-[2]' : 'text-[#757575]'}`} />
                <span className="text-[9px] font-sans tracking-tight mt-1">Customers</span>
                {activeSection === 'retention' && (
                  <span className="w-1 h-1 rounded-full bg-[#1e40af] mt-0.5 animate-pulse" />
                )}
              </button>

              {/* Tab: Menu drawer */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="flex-1 flex flex-col items-center justify-center h-full rounded-full text-[#757575] hover:text-black font-semibold transition-all cursor-pointer"
              >
                <Menu className="w-[22px] h-[22px] stroke-[1.5]" />
                <span className="text-[9px] font-sans tracking-tight mt-1">More</span>
              </button>

            </div>
          </div>
        )}
      </div>

      {/* Global custom Confirmation/Alert Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-[28px] border border-[#E3E3E3] p-6 text-center shadow-lg animate-fade-in select-none">
            <h3 className="text-lg font-semibold font-display text-[#1F1F1F] mb-1">{confirmModal.title}</h3>
            <p className="text-xs text-[#757575] font-sans leading-relaxed mb-6 whitespace-pre-line">{confirmModal.message}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (confirmModal.onCancel) confirmModal.onCancel();
                  setConfirmModal(prev => prev ? { ...prev, isOpen: false } : null);
                }}
                className="px-6 py-2.5 rounded-full border border-[#E3E3E3] bg-white text-xs font-semibold text-[#757575] hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              >
                {confirmModal.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => prev ? { ...prev, isOpen: false } : null);
                }}
                className="px-6 py-2.5 rounded-full bg-[#000000] hover:bg-[#1C1C1C] text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer animate-pulse-once"
              >
                {confirmModal.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
