import React, { useState } from 'react';
import { 
  Plus, Search, Sliders, Printer, ShieldCheck, 
  MessageCircle, Download, XCircle, Clock, Award, ArrowLeft,
  ChevronLeft, ChevronRight, Calendar, Pencil, Trash2, Users, Check, AlertCircle, Undo, ArrowUpDown
} from 'lucide-react';
import { Receipt, TeamMember } from '../types';

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
  onLogout?: () => void;
  onUpdateTeamMembers?: (members: TeamMember[]) => void;
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
  onLogout,
  onUpdateTeamMembers
}: ReceiptVerificationProps) {
  const currentActiveOperator = teamMembers.find(m => m.id === activeOperatorId) || teamMembers[0];
  const isOwner = currentActiveOperator?.isCreator === true || currentActiveOperator?.role === 'Owner';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(receipts[0] || null);
  
  // Advanced contextual filters state
  const [timeHorizon, setTimeHorizon] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [paymentStatus, setPaymentStatus] = useState<'all' | 'verified' | 'pending' | 'failed'>('all');
  const [productCategory, setProductCategory] = useState<'all' | 'top' | 'low' | 'stagnant'>('all');
  const [customDate, setCustomDate] = useState<string>('');
  
  // Transition and pagination
  const [animateFade, setAnimateFade] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // New receipt form fields
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormTab, setAddFormTab] = useState<'manual' | 'whatsapp'>('manual');
  const [dragActive, setDragActive] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [ocrStatusText, setOcrStatusText] = useState('');

  // In-place edit receipt states
  const [isEditing, setIsEditing] = useState(false);
  const [editCustName, setEditCustName] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editProdName, setEditProdName] = useState('');
  const [editProdQty, setEditProdQty] = useState(1);
  const [editProdPrice, setEditProdPrice] = useState(15000);
  const [editStatus, setEditStatus] = useState<'verified' | 'pending' | 'failed'>('verified');

  // Team overlay control state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Owner' | 'Admin' | 'Manager' | 'Supervisor' | 'Cashier' | 'Auditor'>('Cashier');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [teamError, setTeamError] = useState('');

  // Private PIN Setup parameters for secure handover
  const [pinSetupMemberId, setPinSetupMemberId] = useState<string | null>(null);
  const [pinSetupValue, setPinSetupValue] = useState('');
  const [pinSetupConfirm, setPinSetupConfirm] = useState('');
  const [pinSetupError, setPinSetupError] = useState('');

  // Soft deleted bills visibility toggle
  const [includeDeleted, setIncludeDeleted] = useState(false);

  React.useEffect(() => {
    if (selectedReceipt) {
      setEditCustName(selectedReceipt.customerName);
      setEditCustPhone(selectedReceipt.customerPhone);
      if (selectedReceipt.items && selectedReceipt.items.length > 0) {
        setEditProdName(selectedReceipt.items[0].name);
        setEditProdQty(selectedReceipt.items[0].quantity);
        setEditProdPrice(selectedReceipt.items[0].price);
      } else {
        setEditProdName('');
        setEditProdQty(1);
        setEditProdPrice(15000);
      }
      setEditStatus(selectedReceipt.status || 'verified');
      setIsEditing(false); // reset editing on switch
    }
  }, [selectedReceipt]);

  React.useEffect(() => {
    const handleHashCheck = () => {
      if (window.location.hash === '#receipts/add' || window.location.hash === '#/receipts/add' || window.location.hash.endsWith('/receipts/add')) {
        setShowAddForm(true);
      }
    };
    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodQty, setProdQty] = useState(1);
  const [prodPrice, setProdPrice] = useState(15000);
  const [simulatingWhatsApp, setSimulatingWhatsApp] = useState<string | null>(null);

  const triggerFade = () => {
    setAnimateFade(true);
    setTimeout(() => {
      setAnimateFade(false);
    }, 200);
  };

  const handleTimeHorizonChange = (val: 'all' | 'today' | 'week' | 'month' | 'custom') => {
    setTimeHorizon(prev => prev === val ? 'all' : val);
    setCurrentPage(1);
    triggerFade();
  };

  const handlePaymentStatusChange = (val: 'all' | 'verified' | 'pending' | 'failed') => {
    setPaymentStatus(prev => prev === val ? 'all' : val);
    setCurrentPage(1);
    triggerFade();
  };

  const handleProductCategoryChange = (val: 'all' | 'top' | 'low' | 'stagnant') => {
    setProductCategory(prev => prev === val ? 'all' : val);
    setCurrentPage(1);
    triggerFade();
  };

  const handleResetFilters = () => {
    setTimeHorizon('all');
    setPaymentStatus('all');
    setProductCategory('all');
    setCustomDate('');
    setCurrentPage(1);
    triggerFade();
  };

  const handleSimulateOCR_WhatsApp = (preset: { 
    customerName: string; 
    customerPhone: string; 
    itemName: string; 
    itemPrice: number; 
    qty: number; 
    fileName: string; 
  }) => {
    setOcrProgress(0);
    setOcrStatusText("Initializing Local OCR & Cryptographic Core...");
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setOcrProgress(progress);
      
      if (progress === 25) {
        setOcrStatusText(`Reading ${preset.fileName} file elements via AI OCR...`);
      } else if (progress === 50) {
        setOcrStatusText(`Extracting customer: ${preset.customerName}, item: ${preset.itemName}`);
      } else if (progress === 75) {
        setOcrStatusText("Verifying cryptographic signature on purchase receipts...");
      } else if (progress === 100) {
        clearInterval(interval);
        setOcrProgress(null);
        setOcrStatusText("");

        const randomizedHash = Math.random().toString(36).substring(2, 5).toUpperCase() + Math.floor(Math.random() * 90 + 10);
        const autoReceipt: Receipt = {
          id: `TXN-2026-${Math.floor(Math.random() * 89999 + 10000)}`,
          customerName: preset.customerName,
          customerPhone: preset.customerPhone,
          items: [{ name: preset.itemName, quantity: preset.qty, price: preset.itemPrice }],
          totalAmount: preset.qty * preset.itemPrice,
          timestamp: new Date().toISOString(),
          status: 'verified',
          rewardStatus: 'earned',
          rewardPoints: Math.round((preset.qty * preset.itemPrice) * 0.01),
          warrantyStatus: (preset.qty * preset.itemPrice) > 100000 ? 'active' : 'none',
          securitySignature: `TSP-NGR-${randomizedHash}-WA-OCR`
        };

        onAddReceipt(autoReceipt);
        setSelectedReceipt(autoReceipt);
        setShowAddForm(false);
        
        if (showConfirm) {
          showConfirm(
            "AI WhatsApp Receipt Secured! 🎉",
            `[Eenvoq Autonomous AI]: Verified and parsed purchase from ${preset.customerName}.\n\n✅ Transaction GG-${autoReceipt.id.slice(-5)} recorded.\n✅ Stock auto-decremented in inventory for: ${preset.itemName}.\n✅ High-security digital receipt dispatched to client WhatsApp at ${preset.customerPhone}.`,
            () => {},
            "Acknowledge",
            "View receipt"
          );
        }
      }
    }, 600);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileName = e.dataTransfer.files[0].name;
      const presets = [
        { customerName: "Amara Cole", customerPhone: "+234 815 111 2222", itemName: "Indomie Noodles 40pcs", itemPrice: 15000, qty: 5, fileName },
        { customerName: "Chief Sylvester", customerPhone: "+234 803 765 4321", itemName: "Milo Refill Packets", itemPrice: 8500, qty: 10, fileName },
        { customerName: "Baba Sadiq", customerPhone: "+234 812 345 6789", itemName: "Supreme White Sugar", itemPrice: 11000, qty: 3, fileName }
      ];
      const selectedPreset = presets[Math.floor(Math.random() * presets.length)];
      handleSimulateOCR_WhatsApp(selectedPreset);
    }
  };

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      const presets = [
        { customerName: "Amara Cole", customerPhone: "+234 815 111 2222", itemName: "Indomie Noodles 40pcs", itemPrice: 15000, qty: 5, fileName },
        { customerName: "Chief Sylvester", customerPhone: "+234 803 765 4321", itemName: "Milo Refill Packets", itemPrice: 8500, qty: 10, fileName },
        { customerName: "Baba Sadiq", customerPhone: "+234 812 345 6789", itemName: "Supreme White Sugar", itemPrice: 11000, qty: 3, fileName }
      ];
      const selectedPreset = presets[Math.floor(Math.random() * presets.length)];
      handleSimulateOCR_WhatsApp(selectedPreset);
    }
  };

  const handleAddNewReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !prodName) return;

    const randomizedHash = Math.random().toString(36).substring(2, 5).toUpperCase() + Math.floor(Math.random() * 90 + 10);
    const newReceipt: Receipt = {
      id: `TXN-2026-${Math.floor(Math.random() * 89999 + 10000)}`,
      customerName: custName,
      customerPhone: custPhone || "+234 803 123 4567",
      items: [{ name: prodName, quantity: prodQty, price: prodPrice }],
      totalAmount: prodQty * prodPrice,
      timestamp: new Date().toISOString(),
      status: 'verified',
      rewardStatus: 'earned',
      rewardPoints: Math.round((prodQty * prodPrice) * 0.01),
      warrantyStatus: (prodQty * prodPrice) > 100000 ? 'active' : 'none',
      securitySignature: `TSP-NGR-${randomizedHash}-WTS`
    };

    onAddReceipt(newReceipt);
    setSelectedReceipt(newReceipt);
    setShowAddForm(false);
    
    // Clear forms
    setCustName('');
    setCustPhone('');
    setProdName('');
    setProdQty(1);
    setProdPrice(15000);
    
    // Reset layout for new item
    setCurrentPage(1);
    triggerFade();
  };

  const handleTriggerWhatsAppSimulation = (receipt: Receipt) => {
    setSimulatingWhatsApp(receipt.id);
    setTimeout(() => {
      setSimulatingWhatsApp(null);
      
      const title = "WhatsApp Routed";
      const message = `[WhatsApp API Simulation]: Digital Encrypted Receipt successfully routed to client phone: ${receipt.customerPhone}.\n\nText Dispatched:\n"Hello ${receipt.customerName}! Your transaction GG-${receipt.id.slice(-5)} is secured by eenvoq. Secure hash: ${receipt.securitySignature}. You earned +${receipt.rewardPoints} loyalty points!"`;
      
      if (showConfirm) {
        showConfirm(title, message, () => {}, "Got it", "Close");
      } else {
        alert(message);
      }
    }, 1200);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceipt) return;
    
    const updatedFields: Partial<Receipt> = {
      customerName: editCustName,
      customerPhone: editCustPhone,
      items: [{ name: editProdName, quantity: editProdQty, price: editProdPrice }],
      totalAmount: editProdQty * editProdPrice,
      status: editStatus
    };

    onEditReceipt(selectedReceipt.id, updatedFields);
    
    // Update active selected state
    setSelectedReceipt(prev => {
      if (!prev) return null;
      const edits = prev.editedBy || [];
      const activeMember = teamMembers.find(m => m.id === activeOperatorId) || teamMembers[0];
      const newEdit = {
        name: activeMember ? activeMember.name : "System",
        role: activeMember ? activeMember.role : "Owner",
        email: activeMember ? activeMember.email : "",
        timestamp: new Date().toISOString()
      };
      return {
        ...prev,
        ...updatedFields,
        rewardPoints: Math.round((editProdQty * editProdPrice) * 0.01),
        editedBy: [...edits, newEdit]
      };
    });

    setIsEditing(false);
  };

  const handleAddNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError('');
    if (!newMemberName.trim()) {
      setTeamError('Name is required');
      return;
    }
    if (!newMemberEmail.trim() || !newMemberEmail.includes('@')) {
      setTeamError('Provide a valid email');
      return;
    }

    if (newMemberRole === 'Admin') {
      const existingAdmins = teamMembers.filter(m => m.role === 'Admin');
      if (existingAdmins.length >= 2) {
        setTeamError('School / Business owners are restricted to a maximum of 2 additional Admins to manage the business.');
        return;
      }
    }

    onAddTeamMember({
      name: newMemberName,
      role: newMemberRole,
      email: newMemberEmail
    });

    // Reset member fields
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('Cashier');
  };

  const handlePerformDelete = (receiptId: string) => {
    if (showConfirm) {
      showConfirm(
        "Flag & Soft-Delete Recorded Sale?",
        "Are you sure you want to delete this sale receipt?\n\nThis record will not be permanently lost. For accounting audit logs, a soft-delete signature will be marked against your currently active operator.",
        () => {
          onDeleteReceipt(receiptId);
          // Mark selected locally as deleted
          setSelectedReceipt(prev => {
            if (!prev) return null;
            const activeMember = teamMembers.find(m => m.id === activeOperatorId) || teamMembers[0];
            return {
              ...prev,
              deleted: true,
              deletedBy: {
                name: activeMember ? activeMember.name : "System",
                role: activeMember ? activeMember.role : "Owner",
                email: activeMember ? activeMember.email : "",
                timestamp: new Date().toISOString()
              }
            };
          });
        },
        "Yes, flag as deleted",
        "Keep receipt"
      );
    } else {
      if (confirm("Delete receipt?")) {
        onDeleteReceipt(receiptId);
      }
    }
  };

  const handlePerformRestore = (receipt: Receipt) => {
    // Reset deleted status to false
    onEditReceipt(receipt.id, { deleted: false } as any);
    setSelectedReceipt(prev => prev ? { ...prev, deleted: false } : null);
    if (showConfirm) {
      showConfirm(
        "Sale Record Restored",
        `Bill ${receipt.id} has been fully reinstated in the active transaction database. An audit entry has been logged.`,
        () => {}
      );
    }
  };

  // Build the advanced filtering evaluation
  const filteredReceipts = receipts.filter(r => {
    if (r.deleted && !includeDeleted) return false;

    const matchesSearch = r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.customerPhone.includes(searchTerm) ||
                          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 1. Time Horizon Filter
    let matchesTime = true;
    if (timeHorizon !== 'all') {
      const dateObj = new Date(r.timestamp);
      if (timeHorizon === 'today') {
        const day = dateObj.getDate();
        const month = dateObj.getMonth();
        const year = dateObj.getFullYear();
        // Anchor to June 13 & 14, 2026 for demo simulation compatibility
        matchesTime = year === 2026 && month === 5 && (day === 13 || day === 14);
      } else if (timeHorizon === 'week') {
        const diffTime = Math.abs(new Date("2026-06-14T04:16:47-07:00").getTime() - dateObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        matchesTime = diffDays <= 7;
      } else if (timeHorizon === 'month') {
        matchesTime = dateObj.getFullYear() === 2026 && dateObj.getMonth() === 5;
      } else if (timeHorizon === 'custom') {
        if (customDate) {
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          matchesTime = formattedDate === customDate;
        } else {
          matchesTime = true;
        }
      }
    }

    // 2. Payment Status Filter
    let matchesStatus = true;
    if (paymentStatus !== 'all') {
      matchesStatus = r.status === paymentStatus;
    }

    // 3. Product Category Filter
    let matchesCategory = true;
    if (productCategory === 'top') {
      matchesCategory = r.totalAmount > 50000 || r.items.some(item => item.quantity >= 5);
    } else if (productCategory === 'low') {
      matchesCategory = r.items.some(item => 
        item.name.toLowerCase().includes('indomie') || 
        item.name.toLowerCase().includes('milo') || 
        item.name.toLowerCase().includes('garri')
      );
    } else if (productCategory === 'stagnant') {
      matchesCategory = r.items.some(item => 
        item.name.toLowerCase().includes('fridge') || 
        item.name.toLowerCase().includes('sugar')
      );
    }

    return matchesSearch && matchesTime && matchesStatus && matchesCategory;
  });

  // Calculate dynamic dashboard metrics based on active filters
  const totalVolume = filteredReceipts.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalCount = filteredReceipts.length;
  const avgVal = totalCount > 0 ? Math.round(totalVolume / totalCount) : 0;

  // Pagination bounds checking
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage) || 1;
  const paginatedReceipts = filteredReceipts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Active highlighted entry view
  const displayedReceipt = paginatedReceipts.find(r => r.id === selectedReceipt?.id) || paginatedReceipts[0] || null;

  const activeFiltersCount = 
    (timeHorizon !== 'all' ? 1 : 0) + 
    (paymentStatus !== 'all' ? 1 : 0) + 
    (productCategory !== 'all' ? 1 : 0);

  return (
    <div className="space-y-8 animate-fade-in" id="receipts-explorer-view">
      
      {/* Header operations */}
      <div className="flex flex-row items-center justify-between gap-4 select-none w-full" id="receipts-header-block">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => window.location.hash = 'dashboard'}
            className="p-1 px-1.5 hover:bg-gray-100 rounded-full transition text-[#1F1F1F] cursor-pointer flex items-center justify-center shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
          </button>
          <h1 className="text-[22px] font-sans font-semibold text-[#1F1F1F] tracking-tight truncate">Sales & Receipts</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-sky-900 hover:bg-sky-950 focus:ring-2 focus:ring-sky-900/20 focus:outline-none text-white font-semibold py-3 px-6 rounded-full text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Record</span>
        </button>
      </div>

      {/* OPERATOR CONTROL BAR - NEW COMPONENT AS REQUESTED */}
      <div className="bg-sky-50/45 border border-sky-100 rounded-[24px] p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 select-none shadow-xs" id="operator-selection-control-bar">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {/* Active Operator status pill */}
          <div className="bg-white border border-sky-200/70 rounded-full py-2.5 px-4 flex items-center gap-3 shadow-xs shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0 mt-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
              </span>
              <div className="text-left leading-none">
                <span className="text-[#0284c7] font-sans font-bold block mb-1 uppercase tracking-wider text-[9px] leading-none font-sans">Active Operator</span>
                <span className="text-[#1F1F1F] font-semibold flex items-center gap-1.5 leading-none text-xs">
                  <span className="truncate max-w-[130px] sm:max-w-none font-sans font-bold">
                    {teamMembers.find(m => m.id === activeOperatorId)?.name || teamMembers[0]?.name || "System Owner"}
                  </span>
                </span>
              </div>
            </div>
            <span className="text-[9px] text-[#0284c7] bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full font-mono uppercase font-bold shrink-0 ml-2">
              {teamMembers.find(m => m.id === activeOperatorId)?.role || "Owner"}
            </span>
          </div>

          {/* Secure Operator exit button replaces Switch Operator Dropdown */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 text-xs text-sky-800 font-sans w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                if (showConfirm) {
                  showConfirm(
                    "Logout of operator session?",
                    "Do you want to log out of your active operator session? This will log you out from accessing the business' account entirely so another operator can access.",
                    () => {
                      if (onLogout) onLogout();
                    },
                    "Yes, logout session",
                    "Cancel"
                  );
                } else {
                  if (confirm("Logout of your active operator session? You will need to wait for other operators to log out before gaining access again.")) {
                    if (onLogout) onLogout();
                  }
                }
              }}
              className="bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-650 rounded-full h-9 px-4.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <span>✕ Log Out Operator</span>
            </button>
          </div>
        </div>

        {/* Action Button Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              if (isOwner) {
                setShowTeamModal(true);
              } else {
                alert("Access Denied: Only the business Owner is authorized to configure personnel registries and operator settings.");
              }
            }}
            disabled={!isOwner}
            className={`flex items-center justify-center gap-2 border rounded-full h-9 px-4 text-xs transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-100 w-full sm:w-auto ${
              isOwner 
                ? "border-sky-200 hover:border-sky-300 bg-white hover:bg-sky-50/50 text-[#0284c7] font-bold active:scale-98" 
                : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed font-medium opacity-60"
            }`}
          >
            <Users className="w-4 h-4 text-slate-400 stroke-[1.5]" />
            <span>Operators</span>
            {!isOwner && <span className="text-[9px] bg-gray-200 px-1.5 py-0.5 rounded-full font-bold ml-1 text-gray-600 uppercase">Owner Only</span>}
          </button>
          
          <label className="flex items-center justify-center gap-2 bg-white hover:bg-sky-50/30 border border-sky-200 hover:border-sky-300 rounded-full h-9 px-4 text-xs font-semibold text-[#0284c7] cursor-pointer transition select-none w-full sm:w-auto shadow-2xs">
            <input 
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="rounded border-sky-200 text-[#0284c7] focus:ring-sky-100 cursor-pointer h-3.5 w-3.5"
            />
            <span className="flex items-center gap-1.5">
              Include Deleted 
              <span className="text-[9px] text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full font-mono uppercase font-bold tracking-wide shrink-0">
                Trails
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Real-time Contextual Filter Chips */}
      <div className="flex flex-col gap-3 select-none pb-4" id="sales-contextual-filters">
        <div className="flex items-center justify-between gap-4 bg-[#FCFAF7] border border-[#E3E3E3] rounded-[24px] p-3 w-full shadow-none" id="premium-filter-bar-container">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 flex-nowrap" id="scrollable-filter-chips-inner">
            
            {/* Time Horizon Category */}
            <span className="text-[10px] text-[#757575] font-semibold uppercase tracking-wider font-sans pr-1 shrink-0">Time:</span>
            <button 
              onClick={() => handleTimeHorizonChange('today')} 
              className={`h-9 shrink-0 px-4 rounded-[18px] text-xs transition-all duration-200 cursor-pointer flex items-center justify-center ${
                timeHorizon === 'today' 
                  ? 'bg-[#D3E3FD] text-[#0B57D0] font-bold border-transparent' 
                  : 'bg-white text-[#1F1F1F] border border-[#E3E3E3] font-normal hover:bg-gray-50'
              }`}
            >
              Today
            </button>
            <button 
              onClick={() => handleTimeHorizonChange('week')} 
              className={`h-9 shrink-0 px-4 rounded-[18px] text-xs transition-all duration-200 cursor-pointer flex items-center justify-center ${
                timeHorizon === 'week' 
                  ? 'bg-[#D3E3FD] text-[#0B57D0] font-bold border-transparent' 
                  : 'bg-white text-[#1F1F1F] border border-[#E3E3E3] font-normal hover:bg-gray-50'
              }`}
            >
              This Week
            </button>
            <button 
              onClick={() => handleTimeHorizonChange('month')} 
              className={`h-9 shrink-0 px-4 rounded-[18px] text-xs transition-all duration-200 cursor-pointer flex items-center justify-center ${
                timeHorizon === 'month' 
                  ? 'bg-[#D3E3FD] text-[#0B57D0] font-bold border-transparent' 
                  : 'bg-white text-[#1F1F1F] border border-[#E3E3E3] font-normal hover:bg-gray-50'
              }`}
            >
              This Month
            </button>
            <button 
              onClick={() => handleTimeHorizonChange('custom')} 
              className={`h-9 shrink-0 px-4 rounded-[18px] text-xs transition-all duration-200 cursor-pointer flex items-center justify-center ${
                timeHorizon === 'custom' 
                  ? 'bg-[#D3E3FD] text-[#0B57D0] font-bold border-transparent' 
                  : 'bg-white text-[#1F1F1F] border border-[#E3E3E3] font-normal hover:bg-gray-50'
              }`}
            >
              Custom Date
            </button>

            {/* Separator */}
            <div className="h-5 w-px bg-[#E3E3E3] mx-2 self-center shrink-0" />

            {/* Payment Status Category */}
            <span className="text-[10px] text-[#757575] font-semibold uppercase tracking-wider font-sans pr-1 shrink-0">Status:</span>
            <button 
              onClick={() => handlePaymentStatusChange('verified')} 
              className={`h-9 shrink-0 px-4 rounded-[18px] text-xs transition-all duration-200 cursor-pointer flex items-center justify-center ${
                paymentStatus === 'verified' 
                  ? 'bg-[#D3E3FD] text-[#0B57D0] font-bold border-transparent' 
                  : 'bg-white text-[#1F1F1F] border border-[#E3E3E3] font-normal hover:bg-gray-50'
              }`}
            >
              Verified Checkout
            </button>
            <button 
              onClick={() => handlePaymentStatusChange('pending')} 
              className={`h-9 shrink-0 px-4 rounded-[18px] text-xs transition-all duration-200 cursor-pointer flex items-center justify-center ${
                paymentStatus === 'pending' 
                  ? 'bg-[#D3E3FD] text-[#0B57D0] font-bold border-transparent' 
                  : 'bg-white text-[#1F1F1F] border border-[#E3E3E3] font-normal hover:bg-gray-50'
              }`}
            >
              Pending Cash
            </button>
            <button 
              onClick={() => handlePaymentStatusChange('failed')} 
              className={`h-9 shrink-0 px-4 rounded-[18px] text-xs transition-all duration-200 cursor-pointer flex items-center justify-center ${
                paymentStatus === 'failed' 
                  ? 'bg-[#D3E3FD] text-[#0B57D0] font-bold border-transparent' 
                  : 'bg-white text-[#1F1F1F] border border-[#E3E3E3] font-normal hover:bg-gray-50'
              }`}
            >
              Risk
            </button>

            {/* Separator */}
            <div className="h-5 w-px bg-[#E3E3E3] mx-2 self-center shrink-0" />

            {/* Product Category Category */}
            <span className="text-[10px] text-[#757575] font-semibold uppercase tracking-wider font-sans pr-1 shrink-0">Products:</span>
            <button 
              onClick={() => handleProductCategoryChange('top')} 
              className={`h-9 shrink-0 px-4 rounded-[18px] text-xs transition-all duration-200 cursor-pointer flex items-center justify-center ${
                productCategory === 'top' 
                  ? 'bg-[#D3E3FD] text-[#0B57D0] font-bold border-transparent' 
                  : 'bg-white text-[#1F1F1F] border border-[#E3E3E3] font-normal hover:bg-gray-50'
              }`}
            >
              Top Performing
            </button>
            <button 
              onClick={() => handleProductCategoryChange('low')} 
              className={`h-9 shrink-0 px-4 rounded-[18px] text-xs transition-all duration-200 cursor-pointer flex items-center justify-center ${
                productCategory === 'low' 
                  ? 'bg-[#D3E3FD] text-[#0B57D0] font-bold border-transparent' 
                  : 'bg-white text-[#1F1F1F] border border-[#E3E3E3] font-normal hover:bg-gray-50'
              }`}
            >
              Low Stock
            </button>
            <button 
              onClick={() => handleProductCategoryChange('stagnant')} 
              className={`h-9 shrink-0 px-4 rounded-[18px] text-xs transition-all duration-200 cursor-pointer flex items-center justify-center ${
                productCategory === 'stagnant' 
                  ? 'bg-[#D3E3FD] text-[#0B57D0] font-bold border-transparent' 
                  : 'bg-white text-[#1F1F1F] border border-[#E3E3E3] font-normal hover:bg-gray-50'
              }`}
            >
              Stagnant Inventory
            </button>

          </div>

          {/* Reset button at the end of the line */}
          {activeFiltersCount >= 2 && (
            <button 
              onClick={handleResetFilters}
              className="text-[11px] text-[#757575] hover:text-[#1F1F1F] font-semibold transition shrink-0 underline decoration-[#E3E3E3] underline-offset-4 cursor-pointer pl-2 self-center"
            >
              reset filter
            </button>
          )}

        </div>

        {/* Custom inline calendar input if custom date selected */}
        {timeHorizon === 'custom' && (
          <div className="flex items-center gap-2 text-xs text-[#5F6368] animate-fade-in bg-[#F0F4F9] border border-[#E3E3E3] p-3 rounded-2xl self-start">
            <Calendar className="w-4 h-4 text-[#757575] stroke-[1.5]" />
            <span>Select custom calendar target:</span>
            <input 
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setCurrentPage(1);
                triggerFade();
              }}
              className="px-3 py-1.5 border border-[#E3E3E3] rounded-full text-xs text-[#1F1F1F] bg-white font-mono focus:outline-none focus:border-[#5F6368]"
            />
          </div>
        )}

      </div>

      {/* Dashboard Metrics Panel */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-5 transition-all duration-200 ${animateFade ? 'opacity-30 scale-[0.995]' : 'opacity-100 scale-100'}`} id="receipts-realtime-metrics">
        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-[24px] p-5 shadow-sm flex flex-col justify-between select-none text-[#0284c7]">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#0284c7]/70 font-sans">Filter-Matched Volume</span>
            <p className="text-xl font-mono font-bold text-[#0284c7] mt-1.5">₦{totalVolume.toLocaleString()}</p>
          </div>
          <p className="text-[10px] text-[#0284c7]/85 font-sans mt-3">Sum of sales meeting active target bounds</p>
        </div>
        
        <div className="bg-[#FCF5E8] border border-[#ECDCCB] rounded-[24px] p-5 shadow-sm flex flex-col justify-between select-none text-[#78350F]">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#78350F]/70">Total Bills Match</span>
            <p className="text-xl font-mono font-bold text-[#78350F] mt-1.5">{totalCount} customer bills</p>
          </div>
          <p className="text-[10px] text-[#78350F]/80 font-sans mt-3">Active count of matching entries</p>
        </div>

        <div className="bg-black border border-neutral-900 text-white rounded-[24px] p-5 shadow-sm flex flex-col justify-between select-none">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-400">Average Ticket Size</span>
            <p className="text-xl font-mono font-bold text-white mt-1.5">₦{avgVal.toLocaleString()}</p>
          </div>
          <p className="text-[10px] text-neutral-300 font-sans mt-3">Mean ticket weight in filtered database</p>
        </div>
      </div>

      {/* New Invoice Entry Overlay Form */}
      {showAddForm && (
        <div className="bg-white rounded-[24px] p-6 border border-[#E3E3E3] shadow-none animate-fade-in">
          <div className="flex items-center justify-between mb-5 border-b border-[#E3E3E3] pb-3">
            <h3 className="text-sm font-sans font-semibold text-[#1F1F1F] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#5F6368] stroke-[1.5]" />
              Record Store Sale & Invoice
            </h3>
            <div className="flex gap-1.5 bg-gray-100 p-0.5 rounded-full select-none text-[10px]">
              <button
                type="button"
                onClick={() => setAddFormTab('manual')}
                className={`py-1 px-3 rounded-full transition-all font-semibold ${
                  addFormTab === 'manual' 
                    ? 'bg-white text-sky-600 shadow-3xs' 
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Manual Key-in
              </button>
              <button
                type="button"
                onClick={() => setAddFormTab('whatsapp')}
                className={`py-1 px-3 rounded-full transition-all font-semibold flex items-center gap-1 ${
                  addFormTab === 'whatsapp' 
                    ? 'bg-white text-sky-600 shadow-3xs' 
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <MessageCircle className="w-3 h-3 text-[#25D366]" />
                WhatsApp Upload
              </button>
            </div>
          </div>

          {addFormTab === 'manual' ? (
            <form onSubmit={handleAddNewReceipt} className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-medium text-[#1F1F1F]">
              <div>
                <label className="block mb-1.5 text-xs text-[#757575]">Customer Name</label>
                <input
                  type="text" required value={custName} onChange={e => setCustName(e.target.value)}
                  placeholder="Amara Cole"
                  className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368]"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs text-[#757575]">WhatsApp Number</label>
                <input
                  type="text" value={custPhone} onChange={e => setCustPhone(e.target.value)}
                  placeholder="e.g. +234 815 111 2222"
                  className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368]"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs text-[#757575]">Item Purchased</label>
                <input
                  type="text" required value={prodName} onChange={e => setProdName(e.target.value)}
                  placeholder="Indomie Noodles 40pcs"
                  className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368]"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs text-[#757575]">Quantity</label>
                <input
                  type="number" value={prodQty} onChange={e => setProdQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368]"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs text-[#757575]">Unit Price (₦)</label>
                <input
                  type="number" value={prodPrice} onChange={e => setProdPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368]"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#1F1F1F] hover:bg-black text-white py-3 rounded-full font-sans text-xs font-semibold cursor-pointer"
                >
                  Publish
                </button>
                <button
                  type="button" onClick={() => setShowAddForm(false)}
                  className="px-4 py-3 border border-[#E3E3E3] text-[#757575] hover:bg-gray-50 rounded-full text-xs cursor-pointer font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#E8F5E9]/50 border border-[#A5D6A7] rounded-2xl p-4 text-xs text-[#2E7D32]">
                <p className="font-bold flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  Secure WhatsApp AI Invoice Pipeline
                </p>
                <p className="mt-1 font-sans text-[11px] text-[#2E7D32]/90 leading-relaxed">
                  When customers send transaction receipts/proofs on WhatsApp, simply upload their screenshot or document below. Eenvoq's backend AI OCR reads the purchase details, verifies the transaction signature, logs the sale, automatically updates inventory stock levels, and dispatches an encrypted digital confirmation receipt back to their phone number.
                </p>
              </div>

              {ocrProgress !== null ? (
                <div className="bg-[#FAFAFA] border border-neutral-250 p-8 rounded-[24px] text-center space-y-4 animate-pulse">
                  <div className="w-full max-w-xs mx-auto bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-600 h-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                  <p className="text-xs font-mono font-bold text-neutral-700">{ocrStatusText}</p>
                  <p className="text-[10px] text-neutral-400 font-sans">Simulating smart backend OCR validation model...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* File drag-and-drop zone */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`md:col-span-2 border-2 border-dashed rounded-[24px] p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all min-h-[190px] select-none ${
                      dragActive 
                        ? 'border-green-500 bg-green-50/40 scale-[0.99]' 
                        : 'border-[#E3E3E3] hover:border-green-400 hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                      <Download className="w-8 h-8 text-neutral-400 stroke-[1.5] mb-2.5" />
                      <p className="font-sans font-bold text-[#1F1F1F] text-xs">Drag & drop customer invoice screenshot here</p>
                      <p className="text-[10px] text-[#757575] font-sans mt-1">Accepts JPEG, PNG, PDF up to 4MB or tap to browse</p>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleManualFileSelect}
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Sandbox presets list */}
                  <div className="bg-[#FAF9F6] border border-neutral-200/70 p-4 rounded-[24px] flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">Simulate Sandbox Inputs</span>
                      <p className="text-[11px] text-neutral-700 font-sans mt-0.5 mb-3 leading-tight">Pick a customer WhatsApp payout screenshot preset to test AI verification:</p>
                      
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handleSimulateOCR_WhatsApp({
                            customerName: "Amara Cole",
                            customerPhone: "+234 815 111 2222",
                            itemName: "Indomie Noodles 40pcs",
                            itemPrice: 15000,
                            qty: 5,
                            fileName: "IMG_202606_Okafor_WhatsApp.jpg"
                          })}
                          className="w-full text-left p-2.5 bg-white border border-neutral-200 hover:border-green-400 hover:bg-green-50/20 rounded-[14px] transition text-[11px] font-sans flex flex-col justify-between"
                        >
                          <span className="font-bold text-neutral-800">Screenshot: Amara Cole</span>
                          <span className="text-[10px] text-neutral-500 font-mono mt-0.5">5x Indomie Noodles • ₦75,000</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSimulateOCR_WhatsApp({
                            customerName: "Chief Sylvester",
                            customerPhone: "+234 803 765 4321",
                            itemName: "Milo Refill Packets",
                            itemPrice: 8500,
                            qty: 10,
                            fileName: "WhatsApp_Sylvester_Transfer_Milo.png"
                          })}
                          className="w-full text-left p-2.5 bg-white border border-neutral-200 hover:border-green-400 hover:bg-green-50/20 rounded-[14px] transition text-[11px] font-sans flex flex-col justify-between"
                        >
                          <span className="font-bold text-neutral-800">Screenshot: Chief Sylvester</span>
                          <span className="text-[10px] text-neutral-500 font-mono mt-0.5">10x Milo Refill Packets • ₦85,000</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button" 
                      onClick={() => setShowAddForm(false)}
                      className="w-full mt-4 py-2 border border-[#E3E3E3] text-[#757575] bg-white hover:bg-gray-50 rounded-full text-[10px] cursor-pointer font-bold transition text-center"
                    >
                      Close Overlay Panel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Primary splitting workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="receipts-workspace-split">
        
        {/* Left Columns: Receipts Registry logs */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur rounded-[24px] border border-[#E3E3E3] shadow-sm flex flex-col overflow-hidden">
          
          {/* Internal search & header bar */}
          <div className="p-5 border-b border-[#E3E3E3] bg-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
            <h3 className="font-sans font-semibold text-[#1F1F1F] text-sm flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#5F6368] stroke-[1.5]" />
              Active Bills Registry
              <span className="text-[10px] text-[#757575] bg-[#F0F4F9] border border-[#E3E3E3] rounded-full py-0.5 px-2.5 font-normal ml-1">
                {filteredReceipts.length} targets
              </span>
            </h3>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-2.5 text-sky-500 w-3.5 h-3.5 stroke-[2]" />
              <input
                type="text"
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                  triggerFade();
                }}
                className="w-full bg-sky-50 border border-sky-100 rounded-full py-2 pl-10 pr-4 text-xs text-sky-950 font-semibold placeholder:text-sky-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* List display with transition support */}
          <div className={`flex-1 overflow-y-auto max-h-[500px] divide-y divide-[#E3E3E3] transition-all duration-200 ${animateFade ? 'opacity-30 translate-y-1' : 'opacity-100 translate-y-0'}`} id="receipts-rows-box">
            {paginatedReceipts.map((receipt) => {
              const totalQuantity = receipt.items.reduce((sum, item) => sum + item.quantity, 0);
              const isSelected = displayedReceipt?.id === receipt.id;
              return (
                <div
                  key={receipt.id}
                  onClick={() => setSelectedReceipt(receipt)}
                  className={`p-5 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-all ${
                    isSelected ? 'bg-[#F0F4F9]' : ''
                  } ${receipt.deleted ? 'opacity-65 bg-gray-50' : ''}`}
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`font-mono text-xs font-semibold ${receipt.deleted ? 'line-through text-gray-400' : 'text-[#1F1F1F]'}`}>{receipt.id}</span>
                      {receipt.deleted ? (
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border-transparent uppercase leading-none">
                          Deleted (Trail Active)
                        </span>
                      ) : (
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border uppercase leading-none ${
                          receipt.status === 'verified' ? 'bg-[#F0F4F9] text-green-700 border-[#E3E3E3]' :
                          receipt.status === 'pending' ? 'bg-[#F0F4F9] text-amber-700 border-[#E3E3E3]' :
                          'bg-[#F0F4F9] text-red-700 border-red-200'
                        }`}>
                          {receipt.status === 'verified' ? 'verified' : receipt.status === 'pending' ? 'pending' : 'risk issue'}
                        </span>
                      )}
                      {receipt.editedBy && receipt.editedBy.length > 0 && (
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50 uppercase leading-none">
                          Edited
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#5F6368] font-medium font-sans">
                      <span className={`text-[#1F1F1F] font-semibold ${receipt.deleted ? 'line-through text-gray-400' : ''}`}>{receipt.customerName}</span>
                      <span className="text-[#757575] text-[10px]">({receipt.customerPhone})</span>
                      <span className="text-gray-300">•</span>
                      <span className="font-mono text-[10px] text-[#757575]">{totalQuantity} units</span>
                    </div>
                    {receipt.deleted && receipt.deletedBy && (
                      <p className="text-[10px] text-red-600 font-sans mt-1 bg-red-50 border border-red-100 rounded p-1 px-1.5 inline-block">
                        🗑️ Deleted by <strong>{receipt.deletedBy.name} ({receipt.deletedBy.role})</strong>
                      </p>
                    )}
                    {!receipt.deleted && receipt.createdBy && (
                      <p className="text-[9px] text-[#757575] font-mono mt-1">Logged by: {receipt.createdBy.name} ({receipt.createdBy.role})</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-sm font-mono font-semibold block ${receipt.deleted ? 'line-through text-gray-400' : 'text-[#1F1F1F]'}`}>₦{receipt.totalAmount.toLocaleString()}</span>
                    <span className="text-[10px] text-[#757575] block mt-1">
                      {new Date(receipt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredReceipts.length === 0 && (
              <div className="flex flex-col items-center justify-center p-16 text-center" id="empty-records-placeholder">
                <XCircle className="w-10 h-10 text-[#757575] mb-2 stroke-[1.2]" />
                <p className="text-xs font-normal text-[#757575]">No matching bills found.</p>
              </div>
            )}
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[#E3E3E3] bg-white select-none text-xs" id="receipts-pagination">
              <div className="text-[#757575] font-normal font-sans">
                Showing <span className="font-semibold text-[#1F1F1F]">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-[#1F1F1F] font-mono">{Math.min(currentPage * itemsPerPage, filteredReceipts.length)}</span> of <span className="font-semibold text-[#1F1F1F] font-mono">{filteredReceipts.length}</span> bills
              </div>
              <div className="flex items-center gap-1" id="pagination-pages">
                <button
                  type="button"
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      triggerFade();
                    }
                  }}
                  disabled={currentPage === 1}
                  className="p-1 px-1.5 border border-[#E3E3E3] rounded-full hover:bg-gray-50 transition cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center shrink-0"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-[#1F1F1F] stroke-[2]" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    type="button"
                    key={pg}
                    onClick={() => {
                      setCurrentPage(pg);
                      triggerFade();
                    }}
                    className={`min-w-7 h-7 px-2 rounded-full border transition cursor-pointer font-medium font-sans text-[11px] flex items-center justify-center shrink-0 ${
                      currentPage === pg 
                        ? 'bg-[#1F1F1F] border-[#1F1F1F] text-white font-semibold' 
                        : 'bg-white border-[#E3E3E3] text-[#5F6368] hover:bg-gray-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                      triggerFade();
                    }
                  }}
                  disabled={currentPage === totalPages}
                  className="p-1 px-1.5 border border-[#E3E3E3] rounded-full hover:bg-gray-50 transition cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center shrink-0"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#1F1F1F] stroke-[2]" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Encrypted Invoice visual card mockup */}
        <div className="bg-white border-2 border-black rounded-[24px] p-6 self-start space-y-6 flex flex-col pt-6 shadow-sm" id="receipt-visualizer-card">
          {displayedReceipt ? (
            isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4 animate-fade-in text-xs font-semibold text-[#1F1F1F]">
                <div className="border-b border-[#E3E3E3] pb-3 text-center">
                  <h3 className="text-sm font-sans font-bold text-[#1F1F1F]">Edit Sale Record: {displayedReceipt.id}</h3>
                  <p className="text-[10px] text-[#757575] mt-1 font-mono uppercase">Audit trace will attribute modifications</p>
                </div>
                
                <div>
                  <label className="block mb-1 text-xs text-[#757575]">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={editCustName}
                    onChange={e => setEditCustName(e.target.value)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2 px-3 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368]"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs text-[#757575]">WhatsApp Number</label>
                  <input
                    type="text"
                    value={editCustPhone}
                    onChange={e => setEditCustPhone(e.target.value)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2 px-3 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368]"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs text-[#757575]">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editProdName}
                    onChange={e => setEditProdName(e.target.value)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2 px-3 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-xs text-[#757575]">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editProdQty}
                      onChange={e => setEditProdQty(parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-[#E3E3E3] rounded-full py-2 px-3 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368]"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-[#757575]">Price (₦)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editProdPrice}
                      onChange={e => setEditProdPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-[#E3E3E3] rounded-full py-2 px-3 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-xs text-[#757575]">Payment Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2 px-3 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368] cursor-pointer"
                  >
                    <option value="verified">Verified Checkout</option>
                    <option value="pending">Pending Cash</option>
                    <option value="failed">Discrepancy/Risk</option>
                  </select>
                </div>

                <div className="border bg-[#F0F4F9] border-[#E3E3E3] rounded-xl p-3 text-[10px] text-[#5F6368] space-y-1">
                  <p className="font-semibold text-[#1F1F1F]">Estimated Totals:</p>
                  <div className="flex justify-between font-mono">
                    <span>Computed Sum:</span>
                    <span className="font-bold text-[#1F1F1F]">₦{(editProdQty * editProdPrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Audited Reward points:</span>
                    <span className="font-bold text-green-700">+{Math.round((editProdQty * editProdPrice) * 0.01)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-full text-xs transition cursor-pointer"
                  >
                    Save Adjustments
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                    }}
                    className="px-4 py-2.5 border border-[#E3E3E3] text-[#757575] hover:bg-gray-50 rounded-full text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Receipts visual voucher card representation */}
                <div className={`rounded-[24px] p-5 border flex flex-col relative overflow-hidden animate-fade-in ${
                  displayedReceipt.deleted 
                    ? 'bg-red-50/50 border-red-200' 
                    : 'bg-[#F0F4F9] border-[#E3E3E3]'
                  }`} id="cryptographic-print-docket">
                  <div className="absolute top-0 right-4 w-12 h-12 bg-white/50 rounded-b-xl flex items-center justify-center border-x border-b border-[#E3E3E3]">
                    <Printer className="w-5 h-5 text-[#5F6368] stroke-[1.5]" />
                  </div>

                  <div className="text-center pb-5 border-b border-dashed border-[#E3E3E3]">
                    <span className={`text-[9px] font-semibold border rounded-full px-3 py-1 uppercase tracking-wider font-mono ${
                      displayedReceipt.deleted 
                        ? 'bg-red-100 border-red-200 text-red-700' 
                        : 'bg-white border-[#E3E3E3] text-[#1F1F1F]'
                    }`}>
                      {displayedReceipt.deleted ? 'Flagged Inactive' : 'Store Bill Shield'}
                    </span>
                    <h4 className={`font-sans font-semibold text-[#1F1F1F] text-sm mt-3.5 ${displayedReceipt.deleted ? 'line-through text-gray-400' : ''}`}>Customer Bill</h4>
                    <p className="text-[9px] text-[#757575] font-mono mt-1 uppercase">Issued: {new Date(displayedReceipt.timestamp).toLocaleDateString()} | {new Date(displayedReceipt.timestamp).toLocaleTimeString()}</p>
                  </div>

                  {/* Body metadata */}
                  <div className="py-5 space-y-3 font-mono text-[10px] text-[#5F6368]" id="receipt-docket-meta">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#757575]">BILL NUMBER:</span>
                      <span className={`font-semibold ${displayedReceipt.deleted ? 'line-through text-gray-400 font-normal' : 'text-[#1F1F1F]'}`}>{displayedReceipt.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#757575]">CUSTOMER:</span>
                      <span className={displayedReceipt.deleted ? 'line-through text-gray-400 font-normal' : 'text-[#1F1F1F]'}>{displayedReceipt.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#757575]">MOBILE:</span>
                      <span className={displayedReceipt.deleted ? 'line-through text-gray-400 font-normal' : 'text-[#1F1F1F]'}>{displayedReceipt.customerPhone}</span>
                    </div>

                    <div className="h-px bg-dashed bg-[#E3E3E3] my-2" />

                    {/* List items sold */}
                    <div className="space-y-2 font-sans" id="docket-purchased-items">
                      <p className="font-semibold text-[#757575] text-[10px] uppercase font-mono mb-1">ITEMS LIST</p>
                      {displayedReceipt.items && displayedReceipt.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-[#1F1F1F]">
                          <span className={`truncate max-w-[150px] font-normal ${displayedReceipt.deleted ? 'line-through text-gray-400' : ''}`}>{it.name} (x{it.quantity})</span>
                          <span className={`font-mono font-medium ${displayedReceipt.deleted ? 'line-through text-gray-400' : ''}`}>₦{(it.price * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="h-px bg-[#E3E3E3] my-2" />

                    <div className="flex justify-between text-xs text-[#1F1F1F] font-semibold font-sans">
                      <span>Total Price:</span>
                      <span className={`font-mono ${displayedReceipt.deleted ? 'line-through text-gray-400 font-normal' : ''}`}>₦{displayedReceipt.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Security Signatures segment */}
                  <div className="pt-4 border-t border-dashed border-[#E3E3E3] text-center space-y-3">
                    <div className="bg-white p-3 border border-[#E3E3E3] rounded-xl inline-block w-full">
                      <span className="text-[9px] text-[#757575] block tracking-wide font-mono uppercase">Receipt Tag Number</span>
                      <span className="text-xs font-mono font-bold text-[#1F1F1F] tracking-widest block mt-1">{displayedReceipt.securitySignature}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 justify-center text-[10px] font-semibold bg-white p-2 rounded-full border border-[#E3E3E3]">
                      <ShieldCheck className={`w-4 h-4 stroke-[1.5] ${displayedReceipt.deleted ? 'text-red-500' : 'text-green-700'}`} />
                      <span className={displayedReceipt.deleted ? 'text-red-700' : 'text-green-700'}>{displayedReceipt.deleted ? "Audit Flagged Removed" : "Locked & Saved"}</span>
                    </div>
                  </div>

                </div>

                {/* Audit Guardian Log Trail Panel */}
                <div className="bg-[#FFFFFF] rounded-[24px] p-5 border border-[#E3E3E3] text-xs space-y-3 w-full" id="audit-logs-section">
                  <div className="flex items-center gap-1.5 font-semibold text-[#1F1F1F] pb-2 border-b border-[#F0F4F9]">
                    <ShieldCheck className="w-4 h-4 text-blue-700 stroke-[2]" />
                    <span>Transaction Audit Controls</span>
                  </div>
                  <div className="space-y-2 text-[#5F6368]">
                    <p className="flex items-start gap-1.5">
                      <span className="text-[#757575] font-semibold shrink-0">Origin:</span>
                      <span className="leading-snug">
                        Registered by <strong>{displayedReceipt.createdBy?.name || "Owner & Principal Creator"}</strong> ({displayedReceipt.createdBy?.role || "Owner"}) at {new Date(displayedReceipt.timestamp).toLocaleDateString()} {new Date(displayedReceipt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </p>

                    {displayedReceipt.editedBy && displayedReceipt.editedBy.length > 0 && (
                      <div className="space-y-1 pt-1.5 border-t border-dashed border-gray-100">
                        <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded uppercase font-mono tracking-wide">Adjustment Logs ({displayedReceipt.editedBy.length})</span>
                        <div className="space-y-1.5 pl-2 border-l border-amber-200 mt-1">
                          {displayedReceipt.editedBy.map((edit, eIdx) => (
                            <p key={eIdx} className="text-[11px] leading-relaxed">
                              ✏️ Changed by <strong>{edit.name}</strong> ({edit.role}) on {new Date(edit.timestamp).toLocaleDateString()} at {new Date(edit.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {displayedReceipt.deleted && displayedReceipt.deletedBy && (
                      <p className="flex items-start gap-1.5 pt-2 border-t border-dashed border-red-100 text-red-700 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0 stroke-[2]" />
                        <span className="leading-snug">
                          Soft-deleted by <strong>{displayedReceipt.deletedBy.name}</strong> ({displayedReceipt.deletedBy.role}) on {new Date(displayedReceipt.deletedBy.timestamp).toLocaleDateString()} at {new Date(displayedReceipt.deletedBy.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Reward values */}
                {!displayedReceipt.deleted && (
                  <div className="bg-white rounded-[24px] p-5 border border-[#E3E3E3] flex items-center gap-3">
                    <Award className="w-8 h-8 text-amber-500 shrink-0 stroke-[1.5]" />
                    <div className="text-xs">
                      <p className="font-semibold text-[#1F1F1F]">Customer Reward Points</p>
                      <p className="text-[#757575] font-sans mt-0.5">
                        Earned <strong className="font-semibold text-[#1F1F1F]">+{displayedReceipt.rewardPoints}</strong> loyalty marks. Status: <span className="uppercase font-semibold text-[#1F1F1F]">{displayedReceipt.rewardStatus}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Direct Editing / soft-deleting controls toolbar */}
                <div className="grid grid-cols-2 gap-3" id="audit-actions-row">
                  {displayedReceipt.deleted ? (
                    <button
                      type="button"
                      onClick={() => handlePerformRestore(displayedReceipt)}
                      className="col-span-2 bg-[#1F1F1F] hover:bg-black text-white font-semibold py-3 rounded-full text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Undo className="w-4 h-4 stroke-[2]" />
                      <span>Reinstate / Restore Record</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditCustName(displayedReceipt.customerName);
                          setEditCustPhone(displayedReceipt.customerPhone);
                          if (displayedReceipt.items && displayedReceipt.items.length > 0) {
                            setEditProdName(displayedReceipt.items[0].name);
                            setEditProdQty(displayedReceipt.items[0].quantity);
                            setEditProdPrice(displayedReceipt.items[0].price);
                          }
                          setEditStatus(displayedReceipt.status || 'verified');
                          setIsEditing(true);
                        }}
                        className="bg-white border border-[#E3E3E3] hover:bg-gray-100 text-[#1F1F1F] font-semibold py-3 rounded-full text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#5F6368] stroke-[2]" />
                        <span>Edit Bill</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePerformDelete(displayedReceipt.id)}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold py-3 rounded-full text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600 stroke-[2]" />
                        <span>Delete Record</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Original action shortcuts */}
                {!displayedReceipt.deleted && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F0F4F9]" id="receipt-visualizer-actions">
                    <button
                      type="button"
                      onClick={() => handleTriggerWhatsAppSimulation(displayedReceipt)}
                      disabled={simulatingWhatsApp === displayedReceipt.id}
                      className="bg-[#1F1F1F] hover:bg-black text-white font-semibold py-3 rounded-full text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 border border-transparent"
                    >
                      <MessageCircle className="w-4 h-4 stroke-[1.5]" />
                      {simulatingWhatsApp === displayedReceipt.id ? 'Sending...' : 'WhatsApp'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const title = "Receipt Export Ready";
                        const message = "Digital receipt print trigger issued locally in raw formatting. Dispatched to system printer spooler.";
                        if (showConfirm) {
                          showConfirm(title, message, () => {}, "Print Completed", "Close");
                        } else {
                          alert(message);
                        }
                      }}
                      className="bg-white border border-[#E3E3E3] hover:bg-gray-50 text-[#1F1F1F] font-semibold py-3 rounded-full text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#5F6368] stroke-[1.5]" />
                      Export
                    </button>
                  </div>
                )}
              </>
            )
          ) : (
            <div className="text-center py-16 text-[#757575]" id="receipt-visualizer-empty">
              <Clock className="w-10 h-10 mx-auto mb-3 text-[#757575] stroke-[1.2]" />
              <p className="text-xs font-normal max-w-xs mx-auto">Select a bill from the list to see its receipt details.</p>
            </div>
          )}
        </div>

      </div>

      {/* Manage Team & Terminal Registries Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="team-terminal-modal">
          <div className="bg-white rounded-[28px] border border-[#E3E3E3] w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-[#E3E3E3] bg-white flex items-center justify-between">
              <h3 className="font-sans font-bold text-base text-[#1F1F1F] flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-700 stroke-[2]" />
                <span>Team & Terminal Registries</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="p-1 px-2.5 rounded-full hover:bg-gray-100 text-[#757575] font-semibold text-xs cursor-pointer transition"
              >
                ✕ Close
              </button>
            </div>

            {/* Inner Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-[#1F1F1F]">
              
              {/* Explanation note */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-[11px] leading-relaxed text-[#5F6368]">
                <strong>🔒 Multi-Role Access Audit:</strong> Assign dedicated operator registers to log sales edits, deletes, and audits correctly. The creator remains the principal manager.
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-xs text-[#757575]">Authorized Boarding Operators ({teamMembers.length})</h4>
                <div className="border border-[#E3E3E3] rounded-2xl divide-y divide-[#E3E3E3] overflow-hidden bg-gray-50/50">
                  {teamMembers.map(member => (
                    <div key={member.id} className="p-3 px-4 flex items-center justify-between bg-white text-xs">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-[#1F1F1F]">{member.name}</span>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase leading-none ${
                            member.isCreator ? "bg-purple-100 text-purple-700 font-bold border-transparent" : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}>
                            {member.isCreator ? 'Owner & Principal Creator' : member.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#757575] font-mono mt-0.5">{member.email}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                            member.pin ? "bg-emerald-50 text-emerald-705 border-emerald-110 font-bold" : "bg-amber-50 text-amber-705 border-amber-110 font-bold"
                          }`}>
                            {member.pin ? "✓ Secret PIN Configured" : "⚠️ PIN Not Configured"}
                          </span>
                        </div>
                      </div>

                      {/* PIN Configuration and Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setPinSetupMemberId(member.id);
                            setPinSetupValue('');
                            setPinSetupConfirm('');
                            setPinSetupError('');
                          }}
                          className="text-sky-650 hover:text-sky-850 font-bold px-2 py-1 bg-sky-50 hover:bg-sky-100 rounded-full transition text-[11px] cursor-pointer border border-sky-100"
                        >
                          {member.pin ? "Reset PIN" : "Setup PIN"}
                        </button>

                        {!member.isCreator ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (showConfirm) {
                                showConfirm(
                                  "Revoke Operator Credentials?",
                                  `Remove ${member.name} from receipt registry management? This will not erase past auditing trails for actions performed by this user.`,
                                  () => onDeleteTeamMember(member.id),
                                  "Yes, revoke access",
                                  "Cancel"
                                );
                              } else {
                                if (confirm(`Remove ${member.name}?`)) {
                                  onDeleteTeamMember(member.id);
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-bold px-2 py-1 hover:bg-red-50 rounded transition text-[11px] cursor-pointer"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#757575] font-semibold font-mono uppercase bg-gray-50 p-1 px-2 rounded border border-gray-100">Locked</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Operator Form */}
              <form onSubmit={handleAddNewMember} className="border border-[#E3E3E3] p-4 rounded-2xl bg-gray-50 text-xs space-y-4">
                <h4 className="font-semibold text-xs text-[#1F1F1F]">Authorize New Personnel / Operator</h4>
                
                {teamError && (
                  <p className="p-2 border border-red-200 bg-red-50 text-red-600 font-semibold rounded text-[10px]">
                    ⚠️ {teamError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-[10px] text-[#757575]">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newMemberName}
                      onChange={e => setNewMemberName(e.target.value)}
                      placeholder="Funmi Alao"
                      className="w-full bg-white border border-[#E3E3E3] rounded-full py-2 px-3 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368]"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] text-[#757575]">System Role</label>
                    <select
                      value={newMemberRole}
                      onChange={e => setNewMemberRole(e.target.value as any)}
                      className="w-full bg-white border border-[#E3E3E3] rounded-full py-2 px-3 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368] cursor-pointer font-semibold"
                    >
                      <option value="Admin">Admin (Max 2)</option>
                      <option value="Manager">Manager</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Cashier">Cashier</option>
                      <option value="Auditor">Auditor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-[10px] text-[#757575]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newMemberEmail}
                    onChange={e => setNewMemberEmail(e.target.value)}
                    placeholder="funmi.alao@business.com"
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2 px-3 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1F1F1F] hover:bg-black text-white font-semibold py-2 rounded-full cursor-pointer transition text-xs"
                >
                  Authorize Operator Registry
                </button>
              </form>

            </div>

          </div>
        </div>
      )}

      {/* Private Secure PIN Handover Modal */}
      {pinSetupMemberId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white rounded-[28px] border-2 border-black p-6 text-center shadow-xl animate-fade-in relative">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 border border-blue-100">
              <ShieldCheck className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            
            <h3 className="text-base font-bold text-gray-900 mb-1">
              🔒 Secure PIN Handover
            </h3>
            
            <p className="text-[11px] text-gray-500 mb-5 leading-relaxed px-2">
              Please hand this device to <strong className="text-gray-900">{(teamMembers.find(m => m.id === pinSetupMemberId))?.name}</strong> to enter and verify their unique 6-digit access PIN.
              <span className="block mt-1 font-semibold text-sky-700">Owner, please look away! Only this operator should know this credentials.</span>
            </p>

            {pinSetupError && (
              <div className="mb-4 text-xs font-semibold bg-red-50 text-red-650 p-2.5 rounded-xl border border-red-100">
                ⚠️ {pinSetupError}
              </div>
            )}

            <div className="space-y-4 text-left">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-700">Create 6-Digit PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pinSetupValue}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setPinSetupValue(val);
                  }}
                  className="w-full text-center tracking-[0.5rem] font-mono font-bold text-xl py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-700">Confirm 6-Digit PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pinSetupConfirm}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setPinSetupConfirm(val);
                  }}
                  className="w-full text-center tracking-[0.5rem] font-mono font-bold text-xl py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setPinSetupMemberId(null)}
                className="flex-1 py-1 px-4 border border-gray-200 hover:bg-slate-50 text-gray-500 rounded-full text-xs font-bold transition select-none cursor-pointer h-10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pinSetupValue.length !== 6) {
                    setPinSetupError("PIN must be exactly 6 digits.");
                    return;
                  }
                  if (pinSetupValue !== pinSetupConfirm) {
                    setPinSetupError("PIN inputs do not match.");
                    return;
                  }
                  
                  // Save PIN
                  const updatedMembers = teamMembers.map(m => {
                    if (m.id === pinSetupMemberId) {
                      return { ...m, pin: pinSetupValue };
                    }
                    return m;
                  });
                  
                  // Save back to master state and storage
                  if (onUpdateTeamMembers) {
                    onUpdateTeamMembers(updatedMembers);
                  } else {
                    localStorage.setItem('eenvoq_team_members', JSON.stringify(updatedMembers));
                  }
                  
                  setPinSetupMemberId(null);
                  alert("Secure 6-Digit PIN successfully configured and locked! You can hand the device back to the Owner safely.");
                }}
                className="flex-1 py-1 px-4 bg-[#1F1F1F] hover:bg-black text-white rounded-full text-xs font-bold transition select-none cursor-pointer h-10"
              >
                Save PIN
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
