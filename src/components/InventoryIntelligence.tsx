import React, { useState } from 'react';
import { 
  ShoppingCart, Sparkles, AlertTriangle, CalendarRange, 
  Search, Sliders, PhoneCall, ArrowLeft, Plus, X, 
  Activity, ClipboardList, RefreshCw, FileDown, Upload, 
  Trash2, Check, CheckSquare, Square, User, Calendar, 
  ChevronRight, ArrowUpRight, Barcode, HelpCircle, Package,
  FileCheck, FileText, ArrowRight, ShieldAlert, BadgeCheck, Sparkle,
  Coins, TrendingDown
} from 'lucide-react';
import EenvoqIcon from './EenvoqIcon';
import { InventoryItem } from '../types';
import { formatCurrency, CURRENCIES } from '../utils/currency';

interface InventoryIntelligenceProps {
  inventory: InventoryItem[];
  onTriggerRestock: (itemId: string, qty: number) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
  onAddInventoryItem?: (newItem: InventoryItem) => void;
  currency: string;
}

// Activity Log Item structure
interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'sale' | 'purchase' | 'return' | 'adjustment' | 'transfer' | 'count';
  productName: string;
  qtyChanged: number; // e.g. +50, -12
  reason: string;
}

// Product Variant structure
interface VariantStock {
  name: string;
  stockLevel: number;
  barcode: string;
}

export default function InventoryIntelligence({ 
  inventory: initialInventory, 
  onTriggerRestock, 
  showConfirm,
  onAddInventoryItem,
  currency
}: InventoryIntelligenceProps) {
  const currencySymbol = CURRENCIES[currency]?.symbol || '$';

  // Local state to keep track of newly added/manipulated inventory items
  const [localInventory, setLocalInventory] = useState<InventoryItem[]>(initialInventory);
  
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'activity' | 'alerts'>('overview');

  // Selected item detail overlay state
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Search, filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'instock' | 'lowstock' | 'outstock' | 'slow' | 'dead'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // AI chat question states
  const [aiAssistantQuery, setAiAssistantQuery] = useState('');
  const [aiAssistantReply, setAiAssistantReply] = useState<string | null>(null);

  // Recommendation Queue
  const [recommendations, setRecommendations] = useState([
    { id: 'rec-1', text: "Order 48 units of Peak Milk", reason: "Current stock depleting in 3 days based on current customer velocity.", status: 'pending' },
    { id: 'rec-2', text: "Increase Coca-Cola 35cl stock level by 20%", reason: "Weekend sales forecast rises by 15% during next dry season run.", status: 'pending' },
    { id: 'rec-3', text: "Reduce Milo Refill Pack 800g reorder quantity", reason: "Velocity dropped from 2.4/day to 1.2/day this fortnight.", status: 'pending' }
  ]);

  // Bulk operation states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkPanel, setShowBulkPanel] = useState(false);

  // Barcode Camera Simulator Overlay
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scannerTargetMode, setScannerTargetMode] = useState<'search' | 'stockcount' | 'sale'>('search');
  const [simulatedScannedItem, setSimulatedScannedItem] = useState<string | null>(null);

  // Stock Count Session state
  const [isStockCounting, setIsStockCounting] = useState(false);
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, number>>({});
  const [varianceResults, setVarianceResults] = useState<{ id: string; name: string; system: number; physical: number; variance: number; valueDifference: number }[] | null>(null);

  // Customer Returns Form state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnProductId, setReturnProductId] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('Damaged / Bad Quality');
  const [returnActionType, setReturnActionType] = useState<'refund' | 'replace'>('replace');

  // Inline adjustment state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustReason, setAdjustReason] = useState('Damaged Goods');
  const [adjustQty, setAdjustQty] = useState(-5);

  // Dialog Add Product states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Dairy');
  const [newStockLevel, setNewStockLevel] = useState(60);
  const [newSafeMin, setNewSafeMin] = useState(15);
  const [newBasePrice, setNewBasePrice] = useState(4800); // Naira equivalent ($3.2 approx)
  const [newUnit, setNewUnit] = useState('Tins');
  const [newSupplierName, setNewSupplierName] = useState('FrieslandCampina WAMCO');
  const [newSupplierContact, setNewSupplierContact] = useState('+234 816 888 7777');
  const [newSku, setNewSku] = useState('');
  const [newBarcode, setNewBarcode] = useState('');

  // Sample Variants for launch
  const [itemVariants, setItemVariants] = useState<Record<string, VariantStock[]>>({
    "INV-RICE-01": [
      { name: "50kg Premium Sack", stockLevel: 8, barcode: "81200021" },
      { name: "25kg Retail Sack", stockLevel: 6, barcode: "81200022" }
    ],
    "INV-PEAK-06": [
      { name: "170g Sachet Tin", stockLevel: 94, barcode: "22049102" },
      { name: "400g Family Pack", stockLevel: 50, barcode: "22049103" }
    ],
    "INV-COCO-04": [
      { name: "800g Metal Tin", stockLevel: 2, barcode: "63012921" },
      { name: "500g Refill Pack", stockLevel: 2, barcode: "63012922" }
    ]
  });

  // Comprehensive movement logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: 'LOG-001', timestamp: '2026-06-20 09:15', user: 'Prince (Owner)', action: 'adjustment', productName: 'Milo Refill Pack 800g', qtyChanged: -2, reason: 'Damaged Goods' },
    { id: 'LOG-002', timestamp: '2026-06-20 08:30', user: 'Sarah Agent', action: 'sale', productName: 'Peak Liquid Milk 170g (Tin)', qtyChanged: -12, reason: 'Verified Checkout POS' },
    { id: 'LOG-003', timestamp: '2026-06-19 16:45', user: 'Prince (Owner)', action: 'purchase', productName: 'Royal Stallion Rice 50kg', qtyChanged: 50, reason: 'Restock Delivered' },
    { id: 'LOG-004', timestamp: '2026-06-19 11:20', user: 'Prince (Owner)', action: 'return', productName: 'Indomie Onion Chicken 70g (Carton)', qtyChanged: 1, reason: 'Customer replaced expired package' },
    { id: 'LOG-005', timestamp: '2026-06-18 10:00', user: 'Prince (Owner)', action: 'count', productName: 'Supa Garri Yellow 50kg', qtyChanged: 3, reason: 'Stock reconciliation adjustment' }
  ]);

  // Selected item active variants array resolver
  const getVariants = (itemId: string): VariantStock[] => {
    return itemVariants[itemId] || [
      { name: "Standard 1X Unit", stockLevel: localInventory.find(i => i.id === itemId)?.stockLevel || 0, barcode: `BAR-${itemId}` }
    ];
  };

  // Metric Computations
  const totalProductsCount = localInventory.length;
  const totalUnitsInStock = localInventory.reduce((sum, item) => sum + item.stockLevel, 0);
  const totalCostValue = localInventory.reduce((sum, item) => sum + (item.basePrice * 0.7 * item.stockLevel), 0); // 70% cost proxy
  const totalRetailValue = localInventory.reduce((sum, item) => sum + (item.basePrice * item.stockLevel), 0);
  const potentialProfit = totalRetailValue - totalCostValue;
  const lowStockProducts = localInventory.filter(item => item.stockLevel <= item.safeMin);

  // Categories list
  const categoriesList = Array.from(new Set(localInventory.map(item => item.category)));

  // Filter Logic
  const filteredProducts = localInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    let matchesFilterType = true;
    if (filterType === 'instock') matchesFilterType = item.stockLevel > item.safeMin;
    if (filterType === 'lowstock') matchesFilterType = item.stockLevel <= item.safeMin && item.stockLevel > 0;
    if (filterType === 'outstock') matchesFilterType = item.stockLevel === 0;
    if (filterType === 'slow') matchesFilterType = item.velocity < 1.5;
    if (filterType === 'dead') matchesFilterType = item.velocity <= 1.1;

    return matchesSearch && matchesCategory && matchesFilterType;
  });

  // Restock Dispatch Trigger
  const handleRestockOrder = (item: InventoryItem, customQty?: number) => {
    const qty = customQty || 48;
    onTriggerRestock(item.id, qty);

    // Update locally too
    setLocalInventory(prev => prev.map(inv => {
      if (inv.id === item.id) {
        const nextStock = inv.stockLevel + qty;
        return {
          ...inv,
          stockLevel: nextStock,
          forecastedDepletionDays: Math.round((nextStock / (inv.velocity || 1.1)) * 10) / 10
        };
      }
      return inv;
    }));

    // Add activity log
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(Math.random() * 899) + 100}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Prince (Owner)',
      action: 'purchase',
      productName: item.name,
      qtyChanged: qty,
      reason: `Automated Reorder Dispatch (${qty} units)`
    };
    setActivityLogs(prev => [newLog, ...prev]);

    const infoMsg = `SMS/WhatsApp notification pushed to supplier: "${item.supplierName}" (${item.supplierPhone}).\n\nOrder payload: "Dispatch cargo of ${qty} ${item.unit} of ${item.name} for our depot." (Converted safely under current billing).`;
    if (showConfirm) {
      showConfirm("Restock Dispatch Succeeded", infoMsg, () => {}, "Got It", "");
    } else {
      alert(infoMsg);
    }
  };

  // Add Product Form Submit handler
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const generatedId = `INV-${newName.replace(/\s+/g, '-').substring(0, 4).toUpperCase()}-${Math.floor(Math.random() * 89) + 10}`;
    const generatedSku = newSku.trim() || `SKU-${generatedId}`;
    const generatedBarcode = newBarcode.trim() || `BARCODE-${Math.floor(Math.random() * 89999) + 10000}`;

    const newItem: InventoryItem = {
      id: generatedId,
      name: newName,
      category: newCategory,
      stockLevel: newStockLevel,
      safeMin: newSafeMin,
      velocity: 1.5 + Math.round(Math.random() * 30) / 10,
      forecastedDepletionDays: Math.round((newStockLevel / (1.5 + Math.random() * 3)) * 10) / 10,
      restockDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      basePrice: newBasePrice,
      unit: newUnit,
      supplierName: newSupplierName,
      supplierPhone: newSupplierContact
    };

    // Update locally and invoke prop
    setLocalInventory(prev => [newItem, ...prev]);
    if (onAddInventoryItem) {
      onAddInventoryItem(newItem);
    }

    // Add activity log
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(Math.random() * 899) + 100}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Prince (Owner)',
      action: 'purchase',
      productName: newItem.name,
      qtyChanged: newStockLevel,
      reason: 'Opening stock registration'
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Cleanup and notify
    setShowAddModal(false);
    setNewName('');
    setNewStockLevel(60);
    setNewSafeMin(15);
    setNewSku('');
    setNewBarcode('');

    if (showConfirm) {
      showConfirm(
        "Product Cataloged",
        `Product "${newItem.name}" added successfully with SKU: ${generatedSku}. Automated alerts for stock level < ${newSafeMin} are now active.`,
        () => {}
      );
    }
  };

  // Single Recommendation Approval
  const handleApproveRec = (id: string, text: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    
    // Find matching item and apply reorder
    const milkItem = localInventory.find(i => i.name.includes("Milk") || i.name.includes("Coke"));
    if (milkItem) {
      handleRestockOrder(milkItem, 48);
    } else if (localInventory.length > 0) {
      handleRestockOrder(localInventory[0], 48);
    }
  };

  const handleDismissRec = (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
  };

  // Run Manual Stock Adjustment
  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = localInventory.find(i => i.id === adjustProductId);
    if (!item) return;

    const qtyVal = Number(adjustQty);
    setLocalInventory(prev => prev.map(inv => {
      if (inv.id === adjustProductId) {
        const nextStock = Math.max(0, inv.stockLevel + qtyVal);
        return {
          ...inv,
          stockLevel: nextStock,
          forecastedDepletionDays: Math.round((nextStock / (inv.velocity || 1.1)) * 10) / 10
        };
      }
      return inv;
    }));

    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(Math.random() * 899) + 100}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Prince (Owner)',
      action: 'adjustment',
      productName: item.name,
      qtyChanged: qtyVal,
      reason: `Manual Adjustment: ${adjustReason}`
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setShowAdjustModal(false);

    if (showConfirm) {
      showConfirm(
        "Stock Adjustment Logged",
        `Managed inventory successfully. Recorded shift log: "${adjustReason}" with variant adjustment of ${qtyVal} units for "${item.name}".`,
        () => {}
      );
    }
  };

  // Returns Management handler
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = localInventory.find(i => i.id === returnProductId);
    if (!item) return;

    const qty = Number(returnQty);
    setLocalInventory(prev => prev.map(inv => {
      if (inv.id === returnProductId) {
        const nextStock = inv.stockLevel + (returnActionType === 'replace' ? 0 : qty); // replacement doesn't increment stock without returning old, but standard refund/return adds to count
        return {
          ...inv,
          stockLevel: nextStock,
          forecastedDepletionDays: Math.round((nextStock / (inv.velocity || 1.1)) * 10) / 10
        };
      }
      return inv;
    }));

    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(Math.random() * 899) + 100}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Prince (Owner)',
      action: 'return',
      productName: item.name,
      qtyChanged: qty,
      reason: `Customer Return [${returnActionType.toUpperCase()}]: ${returnReason}`
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setShowReturnModal(false);

    const actionText = returnActionType === 'refund' ? 'Refund Processed' : 'Replacement Dispensed';
    if (showConfirm) {
      showConfirm(
        "Return Managed Successfully",
        `${actionText} for ${qty} x ${item.name}. Reason: "${returnReason}". Sentry log trail security signed.`,
        () => {}
      );
    }
  };

  // Stock Count Simulation functions
  const handleStartStockCount = () => {
    const initialCounts: Record<string, number> = {};
    localInventory.forEach(item => {
      initialCounts[item.id] = item.stockLevel; // start with expected
    });
    setPhysicalCounts(initialCounts);
    setVarianceResults(null);
    setIsStockCounting(true);
    setActiveTab('products'); // switch to see list and edit counts
  };

  const handleUpdateCountValue = (itemId: string, val: number) => {
    setPhysicalCounts(prev => ({
      ...prev,
      [itemId]: Math.max(0, val)
    }));
  };

  const handleSubmitStockCount = () => {
    const results = localInventory.map(item => {
      const system = item.stockLevel;
      const physical = physicalCounts[item.id] ?? system;
      const variance = physical - system;
      const valueDifference = variance * item.basePrice;
      return {
        id: item.id,
        name: item.name,
        system,
        physical,
        variance,
        valueDifference
      };
    });

    setVarianceResults(results);
    setIsStockCounting(false);
  };

  const handleApproveVarianceAdjustments = () => {
    if (!varianceResults) return;

    let adjustmentsCount = 0;
    setLocalInventory(prev => prev.map(item => {
      const result = varianceResults.find(r => r.id === item.id);
      if (result && result.variance !== 0) {
        adjustmentsCount++;
        const newLog: ActivityLog = {
          id: `LOG-${Math.floor(Math.random() * 899) + 100}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'Prince (Owner)',
          action: 'count',
          productName: item.name,
          qtyChanged: result.variance,
          reason: `Physical Audited Stock Count Variance (${result.variance > 0 ? '+' : ''}${result.variance})`
        };
        setActivityLogs(prevLogs => [newLog, ...prevLogs]);
        return {
          ...item,
          stockLevel: result.physical,
          forecastedDepletionDays: Math.round((result.physical / (item.velocity || 1.1)) * 10) / 10
        };
      }
      return item;
    }));

    setVarianceResults(null);
    if (showConfirm) {
      showConfirm(
        "Audit Variance Balanced",
        `Physical stock count approved. Adjusted ${adjustmentsCount} items in database matching actual shelf count. Security record stamped.`,
        () => {}
      );
    }
  };

  // Scanner Simulator trigger
  const triggerScanSimulator = (mode: 'search' | 'stockcount' | 'sale') => {
    setScannerTargetMode(mode);
    setShowBarcodeScanner(true);
    setSimulatedScannedItem(null);
  };

  const handleScanValueSelected = (itemId: string) => {
    const item = localInventory.find(i => i.id === itemId);
    if (!item) return;

    setSimulatedScannedItem(item.name);
    setTimeout(() => {
      setShowBarcodeScanner(false);
      
      if (scannerTargetMode === 'search') {
        setSearchTerm(item.name);
        setActiveTab('products');
        setSelectedItem(item);
      } else if (scannerTargetMode === 'stockcount' && isStockCounting) {
        handleUpdateCountValue(item.id, (physicalCounts[item.id] || 0) + 1);
        if (showConfirm) {
          showConfirm("Barcode Scanned", `Count incremented for "${item.name}" (+1 unit logged in audit worksheet).`, () => {});
        }
      } else if (scannerTargetMode === 'sale') {
        const customPrompt = `Recorded simulated direct sale for barcode item: "${item.name}" (1 unit sold).`;
        setLocalInventory(prev => prev.map(inv => {
          if (inv.id === item.id) {
            const nextStock = Math.max(0, inv.stockLevel - 1);
            return {
              ...inv,
              stockLevel: nextStock,
              forecastedDepletionDays: Math.round((nextStock / (inv.velocity || 1.1)) * 10) / 10
            };
          }
          return inv;
        }));
        
        const newLog: ActivityLog = {
          id: `LOG-${Math.floor(Math.random() * 899) + 100}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'Casher Prince',
          action: 'sale',
          productName: item.name,
          qtyChanged: -1,
          reason: 'Quick Barcode Scanner Checkout'
        };
        setActivityLogs(prev => [newLog, ...prev]);

        if (showConfirm) {
          showConfirm("Direct Barcode Sale logged", customPrompt, () => {});
        }
      }
    }, 900);
  };

  // AI chat answering mock
  const handleAskInventoryAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiAssistantQuery.trim()) return;

    const query = aiAssistantQuery.toLowerCase();
    let reply = "I analyzed our stock levels and physical sales velocities.\n\n";

    if (query.includes("reorder") || query.includes("order")) {
      const list = localInventory.filter(i => i.stockLevel <= i.safeMin).map(i => i.name).join(", ");
      reply += `**Products needing urgent restock:** You have ${lowStockProducts.length} items below safe limit: **${list || "None!"}**.\n\nWe recommend ordering 48 cartons of Peak Milk from FrieslandCampina today to secure your profit margin.`;
    } else if (query.includes("run out") || query.includes("deplet") || query.includes("week")) {
      reply += `**Expected Stock Outs within 7 days:** \n- Milo Refill Pack 800g (3.3 days remaining, velocity 1.2 packs/day)\n- Supa Garri Yellow 50kg (4.5 days remaining)\n- Indomie Onion Chicken (2.2 days remaining).`;
    } else if (query.includes("dead") || query.includes("slow")) {
      reply += `**Dead stock (Velocity < 1.2 units/day):** \n- Supa Garri Yellow is selling very slow. Keep stock levels minimal to prevent capital being tied up in storage.`;
    } else {
      reply += `**Inventory Outlook optimal:** We track ${localInventory.length} lines. Total retail valuation is of ${formatCurrency(totalRetailValue, currency)} with a predicted potential profit of ${formatCurrency(potentialProfit, currency)}.`;
    }

    setAiAssistantReply(reply);
    setAiAssistantQuery('');
  };

  // Bulk operation triggers
  const handleToggleProductSelection = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkPriceAdjustment = (pct: number) => {
    if (selectedProductIds.length === 0) return;
    setLocalInventory(prev => prev.map(inv => {
      if (selectedProductIds.includes(inv.id)) {
        return {
          ...inv,
          basePrice: Math.round(inv.basePrice * (1 + pct / 100))
        };
      }
      return inv;
    }));
    setSelectedProductIds([]);
    setShowBulkPanel(false);
    if (showConfirm) {
      showConfirm("Bulk Price Updated", `Price adjusted by ${pct > 0 ? '+' : ''}${pct}% for selected products.`, () => {});
    }
  };

  // Trigger simulated exports
  const triggerSimulationExport = (type: 'value' | 'lowstock' | 'valuation') => {
    const csvContent = type === 'lowstock' 
      ? `ID,Product,StockLevel,MinLimit,Supplier\n` + lowStockProducts.map(i => `${i.id},"${i.name}",${i.stockLevel},${i.safeMin},"${i.supplierName}"`).join('\n')
      : `ID,Product,StockLevel,BasePrice,TotalValue\n` + localInventory.map(i => `${i.id},"${i.name}",${i.stockLevel},${i.basePrice},${i.stockLevel * i.basePrice}`).join('\n');
    
    const label = type === 'lowstock' ? 'Low Stock Report' : 'Stock Valuation Spreadsheet';
    
    if (showConfirm) {
      showConfirm(
        `Generated CSV Document: ${label}`,
        `We have simulated generating the layout exports for external business reporting tools: \n\n${csvContent.substring(0, 240)}...\n\n[Successfully exported to local store analytics!]`,
        () => {}
      );
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-left font-sans select-none text-neutral-900" id="eenvoq-inventory-intelligence-page">
      
      {/* HEADER CONTROLS */}
      <div className="bg-white border border-neutral-100 rounded-[28px] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="inventory-header">
        <div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.hash = 'dashboard'}
              className="p-1 px-1.5 hover:bg-neutral-100 rounded-full transition text-neutral-800 cursor-pointer flex items-center justify-center shrink-0"
              title="Return to home dashboard"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>
            <h1 className="text-xl sm:text-2xl font-sans font-black text-neutral-950 tracking-tight">Eenvoq Inventory Control</h1>
          </div>
          <p className="text-xs text-neutral-400 font-bold mt-1 pl-8">Evaluate stock levels, trace history updates, and auto-dispatch supplier procurement.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {isStockCounting ? (
            <button
              type="button"
              onClick={handleSubmitStockCount}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-full text-[11px] uppercase tracking-wide transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Complete Physical Count</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartStockCount}
              className="bg-neutral-900 hover:bg-black text-white font-bold py-2 px-4 rounded-full text-[11px] uppercase tracking-wide transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Start PhysicalCount</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-[#1e40af] hover:bg-[#1a368f] text-white font-bold py-2 px-4 rounded-full text-[11px] uppercase tracking-wide transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* METRIC SUMMARY TAB */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="inventory-snapshot-grid">
        <div className="bg-white border border-neutral-150 rounded-[22px] p-5">
          <span className="text-[9px] uppercase font-black text-neutral-400 tracking-wider">Total Products</span>
          <p className="text-2xl font-black text-neutral-950 leading-none mt-1 font-mono">{totalProductsCount}</p>
          <span className="text-[10px] text-neutral-400 mt-1 block font-sans font-semibold">Active SKUs cataloged</span>
        </div>

        <div className="bg-white border border-neutral-150 rounded-[22px] p-5">
          <span className="text-[9px] uppercase font-black text-neutral-400 tracking-wider">Units in stock</span>
          <p className="text-2xl font-black text-neutral-950 leading-none mt-1 font-mono">{totalUnitsInStock}</p>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block font-sans">Across {categoriesList.length} categories</span>
        </div>

        <div className="bg-white border border-neutral-150 rounded-[22px] p-5 relative overflow-hidden">
          <span className="text-[9px] uppercase font-black text-neutral-400 tracking-wider block">Stock Valuation</span>
          <p className="text-xl font-black text-neutral-950 mt-1 font-mono leading-none">{formatCurrency(totalRetailValue, currency)}</p>
          <div className="flex gap-2 text-[8px] text-neutral-450 font-sans mt-2">
            <span>Cost: {formatCurrency(totalCostValue, currency)}</span>
            <span>Profit: {formatCurrency(potentialProfit, currency)}</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-150 rounded-[22px] p-5">
          <span className="text-[9px] uppercase font-black text-neutral-400 tracking-wider">Low Stock Items</span>
          <p className={`text-2xl font-black leading-none mt-1 font-mono ${lowStockProducts.length > 0 ? 'text-red-650' : 'text-neutral-950'}`}>
            {lowStockProducts.length}
          </p>
          <span className={`text-[10px] font-bold mt-1 block ${lowStockProducts.length > 0 ? 'text-red-500' : 'text-neutral-450'}`}>
            {lowStockProducts.length > 0 ? 'Attention Needed urgently' : 'Optimal safe range'}
          </span>
        </div>
      </div>

      {/* THREE-NAV SECTORS */}
      <div className="flex border-b border-neutral-200" id="inventory-tab-pills-bar">
        {[
          { key: 'overview', title: 'Overview' },
          { key: 'products', title: 'Products' },
          { key: 'activity', title: 'Activity' },
          { key: 'alerts', title: 'Alerts' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key as any);
              setSelectedItem(null);
            }}
            className={`flex-1 text-center py-3.5 text-xs font-black uppercase tracking-wider relative transition-all border-b-2 cursor-pointer ${
              activeTab === tab.key 
                ? 'border-[#1e40af] text-[#1e40af]' 
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {tab.title}
            {tab.key === 'alerts' && lowStockProducts.length > 0 && (
              <span className="absolute top-2.5 right-4 w-2 h-2 rounded-full bg-red-650" />
            )}
          </button>
        ))}
      </div>

      {/* ACTIVE TAB ELEMENT RENDERS */}
      <div className="space-y-6" id="inventory-body-canvas">
        
        {/* ===============================================
            TAB 1: OVERVIEW TAB
            =============================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in" id="inventory-tab-overview">
            
            {/* AI INVENTORY ASSISTANT INPUT & SUGGESTIVE */}
            <div 
              className="border border-slate-900 rounded-[28px] p-6 text-white relative overflow-hidden shadow-lg"
              style={{ background: 'radial-gradient(circle at top left, #0D1B2A 0%, #1B263B 60%, #1a2332 100%)' }}
            >
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    <Sparkle className="w-4 h-4 text-sky-400 animate-spin" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-sky-400 block font-mono">Cognitive Sentry</span>
                    <h3 className="text-sm font-black tracking-tight leading-none text-white">Ask Inventory AI</h3>
                  </div>
                </div>

                <form onSubmit={handleAskInventoryAi} className="relative">
                  <input
                    type="text"
                    value={aiAssistantQuery}
                    onChange={e => setAiAssistantQuery(e.target.value)}
                    placeholder="Ask Eenvoq about stock depletion levels, dead stock, forecasts..."
                    className="w-full bg-white/10 border border-white/20 text-xs font-semibold rounded-full py-3.5 pl-4 pr-12 focus:outline-none focus:border-sky-400 text-white placeholder:text-neutral-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1.5 w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-400 text-neutral-950 flex items-center justify-center cursor-pointer transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="space-y-1.5 text-[11px]">
                  <p className="text-white/50 font-bold uppercase tracking-wider">Examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Which products need reordering?",
                      "What will run out this week?",
                      "Which products aren't selling?",
                      "Show dead stock",
                      "Forecast next month's inventory"
                    ].map((ex, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAiAssistantQuery(ex);
                          setAiAssistantReply(null);
                        }}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-1 px-3 text-[10px] text-white/90 cursor-pointer transition"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {aiAssistantReply && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-3 space-y-2 animate-fade-in text-xs text-brand-light leading-relaxed">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sky-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Analysis
                      </span>
                      <button onClick={() => setAiAssistantReply(null)} className="text-white/40 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-white/90 whitespace-pre-line">{aiAssistantReply}</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI INSIGHTS BOX */}
            <div className="bg-white border border-neutral-150 rounded-[28px] p-5 shadow-xs space-y-3">
              <h4 className="text-xs uppercase font-black text-neutral-400 tracking-wider">Predictive Sentry Warnings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { text: `${lowStockProducts[0]?.name || "Peak Milk"} will run out in 3 days`, type: 'crit', badge: 'OUT' },
                  { text: `${lowStockProducts.length || 3} products are below safe limit reorder levels`, type: 'warning', badge: 'LOW' },
                  { text: "12 slower products have not recorded checkouts in 30 days", type: 'slow', badge: 'DEAD' },
                  { text: `${formatCurrency(85000, currency)} current capital tied up in slow-moving stock lines`, type: 'capital', badge: 'TIED' }
                ].map((item, idx) => {
                  const getWarningIcon = (type: string) => {
                    switch (type) {
                      case 'crit': return <AlertTriangle className="w-3.5 h-3.5 text-red-650 shrink-0 self-center" />;
                      case 'warning': return <Package className="w-3.5 h-3.5 text-amber-600 shrink-0 self-center" />;
                      case 'slow': return <TrendingDown className="w-3.5 h-3.5 text-gray-500 shrink-0 self-center" />;
                      case 'capital': return <Coins className="w-3.5 h-3.5 text-indigo-600 shrink-0 self-center" />;
                      default: return null;
                    }
                  };
                  return (
                    <div 
                      key={idx}
                      onClick={() => {
                        setActiveTab('alerts');
                      }}
                      className="p-3 border border-neutral-100 rounded-[20px] bg-neutral-50/50 hover:bg-neutral-50 flex items-start gap-2.5 cursor-pointer transition"
                    >
                      {getWarningIcon(item.type)}
                      <span className="text-[9px] bg-orange-50 text-orange-850 font-bold px-2 py-0.5 rounded-md self-center font-mono">{item.badge}</span>
                      <span className="text-xs text-neutral-800 font-semibold leading-normal self-center">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RESTOCK RECOMMENDATIONS */}
            <div className="bg-white border border-neutral-150 rounded-[28px] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-black text-neutral-400 tracking-wider">AI Procurement Restocks Suggested</h4>
                <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full font-bold">Autonomous Matcher</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.filter(r => r.status !== 'dismissed').map((rec) => (
                  <div key={rec.id} className="p-4 border border-neutral-150 rounded-[24px] bg-neutral-50/50 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <span className="text-[9px] bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full font-semibold">Suggested</span>
                      <h5 className="text-xs font-black text-neutral-900 leading-normal">{rec.text}</h5>
                      <p className="text-[10px] text-neutral-450 leading-normal font-sans font-medium">{rec.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleApproveRec(rec.id, rec.text)}
                        className="flex-1 bg-[#1e40af] hover:bg-[#1a368f] text-white font-bold py-1.5 px-3 rounded-full text-[10px] uppercase transition cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismissRec(rec.id)}
                        className="border border-neutral-200 text-neutral-500 hover:bg-neutral-100 font-bold py-1.5 px-3 rounded-full text-[10px] uppercase transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK OPERATIONS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="p-4 bg-white border border-neutral-150 rounded-[22px] text-center hover:bg-neutral-50 cursor-pointer transition"
              >
                <div className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-2 text-[#1e40af]">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-neutral-850">Add Product</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (localInventory.length > 0) {
                    setAdjustProductId(localInventory[0].id);
                    setAdjustQty(25);
                    setAdjustReason('Stock Inward Procured');
                    setShowAdjustModal(true);
                  }
                }}
                className="p-4 bg-white border border-neutral-150 rounded-[22px] text-center hover:bg-neutral-50 cursor-pointer transition"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-neutral-850">Add Stock</span>
              </button>

              <button
                type="button"
                onClick={() => triggerScanSimulator('search')}
                className="p-4 bg-white border border-neutral-150 rounded-[22px] text-center hover:bg-neutral-50 cursor-pointer transition"
              >
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600">
                  <Barcode className="w-5 h-5 animate-pulse" />
                </div>
                <span className="text-xs font-black text-neutral-850">Scan Barcode</span>
              </button>

              <button
                type="button"
                onClick={handleStartStockCount}
                className="p-4 bg-white border border-neutral-150 rounded-[22px] text-center hover:bg-neutral-50 cursor-pointer transition"
              >
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-600">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-neutral-850">Stock Count</span>
              </button>
            </div>

            {/* PERFORMANCE RANKINGS */}
            <div className="bg-white border border-neutral-150 rounded-[28px] p-5 shadow-xs space-y-4">
              <h4 className="text-xs uppercase font-black text-neutral-400 tracking-wider">Inventory Performance Rankings</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                {/* Ranking 1 */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Top Selling Products</p>
                  <div className="space-y-1.5 mt-1 text-xs font-semibold text-neutral-850">
                    <p className="flex justify-between">
                      <span className="truncate">1. Peak Liquid Milk</span>
                      <span className="font-mono text-emerald-700 font-bold">18/day</span>
                    </p>
                    <p className="flex justify-between text-[11px] text-neutral-500">
                      <span className="truncate">2. Indomie Chicken</span>
                      <span className="font-mono">3.5/day</span>
                    </p>
                  </div>
                </div>

                {/* Ranking 2 */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-sky-850 bg-sky-50 px-2 py-0.5 rounded-full inline-block">Fastest Growing</p>
                  <div className="space-y-1.5 mt-1 text-xs font-semibold text-neutral-850">
                    <p className="flex justify-between">
                      <span className="truncate">1. Mamador Oil 3L</span>
                      <span className="text-sky-750 font-bold font-mono">+14% velocity</span>
                    </p>
                    <p className="flex justify-between text-[11px] text-neutral-500">
                      <span className="truncate">2. Royal Rice</span>
                      <span className="font-mono">+8% velocity</span>
                    </p>
                  </div>
                </div>

                {/* Ranking 3 */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-red-850 bg-red-50 px-2 py-0.5 rounded-full inline-block">Slow Moving / Dead</p>
                  <div className="space-y-1.5 mt-1 text-xs font-semibold text-neutral-850">
                    <p className="flex justify-between">
                      <span className="truncate">1. Milo Refill Pack</span>
                      <span className="text-red-655 font-mono">1.2/day</span>
                    </p>
                    <p className="flex justify-between text-[11px] text-neutral-500">
                      <span className="truncate">2. Supa Garri Yellow</span>
                      <span className="font-mono">1.1/day</span>
                    </p>
                  </div>
                </div>

                {/* Ranking 4 */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-amber-850 bg-amber-50 px-2 py-0.5 rounded-full inline-block">Highest Profit Margin</p>
                  <div className="space-y-1.5 mt-1 text-xs font-semibold text-neutral-850">
                    <p className="flex justify-between">
                      <span className="truncate">1. Royal Stallion Rice</span>
                      <span className="font-mono font-bold text-emerald-800">30% margin</span>
                    </p>
                    <p className="flex justify-between text-[11px] text-neutral-500">
                      <span className="truncate">2. Mamador Vegetable Oil</span>
                      <span className="font-mono">25% margin</span>
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* INTEGRATIONS & OPERATIONS SECTION */}
            <div className="bg-white border border-neutral-150 rounded-[28px] p-5 shadow-xs flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h4 className="text-xs uppercase font-black text-neutral-400 tracking-wider">Spreadsheet Inventory Imports</h4>
                <p className="text-[11px] font-semibold text-neutral-450 mt-1">Export, back up, or catalog massive inventory sheets in one action.</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => triggerSimulationExport('valuation')}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-4 py-2 rounded-full text-[10px] uppercase flex items-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerSimulationExport('lowstock')}
                  className="bg-[#1e40af]/10 text-[#1e40af] hover:bg-[#1e40af]/20 font-bold px-4 py-2 rounded-full text-[10px] uppercase flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Low Stock PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (showConfirm) {
                      showConfirm(
                        "Import Simulated Worksheets",
                        "Drop your inventory CSV sheet here. System mapping checks SKUs, alerts limits, and configures active supplier details.",
                        () => {}
                      );
                    }
                  }}
                  className="bg-neutral-900 text-white hover:bg-black font-bold px-4 py-2 rounded-full text-[10px] uppercase flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import CSV</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ===============================================
            TAB 2: PRODUCTS CATALOG list
            =============================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in" id="inventory-tab-products">
            
            {/* Interactive Variance Worksheet notification during physical count */}
            {isStockCounting && (
              <div className="bg-amber-50 border border-amber-300 rounded-[24px] p-5 space-y-3" id="active-count-tracker-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-700 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider block">Physical Stock Count is LIVE</h4>
                      <p className="text-[11px] text-amber-850 mt-0.5">Edit physical shelf units directly in the cards below, then compile worksheet.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitStockCount}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-full text-[10px] uppercase transition"
                    >
                      Process Worksheet
                    </button>
                    <button
                      onClick={() => setIsStockCounting(false)}
                      className="border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold py-1.5 px-3 rounded-full text-[10px] uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Compiled Variance results table */}
            {varianceResults && (
              <div className="bg-neutral-900 text-white border border-slate-900 rounded-[28px] p-6 space-y-4 animate-fade-in" id="count-variance-report">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-sky-400 block tracking-widest font-mono">Cognitive Sentry Engine</span>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Audit Variance Reconciliation Report</h4>
                  </div>
                  <button onClick={() => setVarianceResults(null)} className="text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left divide-y divide-white/10">
                    <thead>
                      <tr className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                        <th className="pb-2">Product Name</th>
                        <th className="pb-2 text-center">System Expected</th>
                        <th className="pb-2 text-center">Physical Count</th>
                        <th className="pb-2 text-right">Variance Units</th>
                        <th className="pb-2 text-right">Estimated Discrepancy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-white/90 font-mono">
                      {varianceResults.map(res => (
                        <tr key={res.id} className="hover:bg-white/5">
                          <td className="py-2.5 font-sans font-bold text-white max-w-[150px] truncate">{res.name}</td>
                          <td className="py-2.5 text-center">{res.system}</td>
                          <td className="py-2.5 text-center text-sky-300 font-black">{res.physical}</td>
                          <td className={`py-2.5 text-right font-black ${res.variance < 0 ? 'text-red-400' : res.variance > 0 ? 'text-green-400' : 'text-white/40'}`}>
                            {res.variance > 0 ? '+' : ''}{res.variance}
                          </td>
                          <td className={`py-2.5 text-right font-black ${res.variance < 0 ? 'text-red-400' : res.variance > 0 ? 'text-green-400' : 'text-white/40'}`}>
                            {res.variance !== 0 ? formatCurrency(res.valueDifference, currency) : 'No change'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-[10px] text-white/50 max-w-sm">Upon verification approval, expected system database registers will update to match physical stock count units perfectly.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleApproveVarianceAdjustments}
                      className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-2 px-4 rounded-full text-[10px] uppercase transition cursor-pointer"
                    >
                      Approve & Reconcile System
                    </button>
                    <button
                      onClick={() => setVarianceResults(null)}
                      className="border border-white/20 hover:bg-white/10 text-white font-bold py-2 px-4 rounded-full text-[10px] uppercase transition"
                    >
                      Reject Audit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SEARCH, CATEGORY FILTER AND OPERATIONS ROW */}
            <div className="bg-white border border-neutral-150 rounded-[28px] p-5 shadow-xs space-y-4" id="products-controls-bar">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative col-span-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-sky-500" />
                  <input
                    type="text"
                    placeholder="Search catalog by name, sku, ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-sky-50/50 border border-neutral-200 rounded-full py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-sky-500 focus:bg-white text-neutral-900"
                  />
                </div>

                <div className="flex gap-2 col-span-2 overflow-x-auto pb-1 sm:justify-end">
                  
                  {/* Category select input */}
                  <div className="bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-200 text-xs text-neutral-600 font-bold flex items-center gap-1.5 min-w-[130px] shrink-0">
                    <Sliders className="w-3.5 h-3.5" />
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="bg-transparent text-xs font-bold outline-none cursor-pointer w-full"
                    >
                      <option value="all">All Category</option>
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerScanSimulator('search')}
                    className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 px-3 py-2 rounded-full text-[11px] font-bold uppercase transition flex items-center gap-1.5 shrink-0"
                  >
                    <Barcode className="w-4 h-4 text-purple-600" />
                    <span>Barcode Scan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (localInventory.length > 0) {
                        setReturnProductId(localInventory[0].id);
                        setReturnQty(1);
                        setShowReturnModal(true);
                      }
                    }}
                    className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-2 rounded-full text-[11px] font-bold uppercase transition flex items-center gap-1.5 shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Customer Return</span>
                  </button>

                </div>
              </div>

              {/* Advanced Filter Pills */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-neutral-100">
                {[
                  { key: 'all', label: 'All Catalog' },
                  { key: 'instock', label: 'Healthy Stock' },
                  { key: 'lowstock', label: 'Low Stock Alerts' },
                  { key: 'outstock', label: 'Out Of Stock' },
                  { key: 'slow', label: 'Slow-Moving Lines' },
                  { key: 'dead', label: 'Dead Stock' }
                ].map(pill => (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => setFilterType(pill.key as any)}
                    className={`px-3 py-1.5 rounded-full border text-[10px] uppercase font-black transition cursor-pointer ${
                      filterType === pill.key 
                        ? 'bg-[#1e40af] border-[#1e40af] text-white shadow-xs' 
                        : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}

                {/* Bulk Operation selector button */}
                {selectedProductIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowBulkPanel(!showBulkPanel)}
                    className="ml-auto bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black px-4 py-1.5 rounded-full text-[10px] uppercase flex items-center gap-1 animate-pulse"
                  >
                    <span>Bulk Operations ({selectedProductIds.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* BULK OPERATION MODAL POP / SLIDE PANEL */}
            {showBulkPanel && selectedProductIds.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-[24px] p-5 space-y-3 animate-fade-in text-xs font-semibold" id="inventory-bulk-panel">
                <span className="text-[10px] text-amber-800 uppercase font-black block tracking-wider">Execute Actions on {selectedProductIds.length} Selected SKUs</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button 
                    onClick={() => handleBulkPriceAdjustment(5)}
                    className="bg-neutral-900 text-white hover:bg-black font-bold px-3 py-2 rounded-full text-[10px] uppercase cursor-pointer"
                  >
                    Raise Selling Price (+5%)
                  </button>
                  <button 
                    onClick={() => handleBulkPriceAdjustment(-3)}
                    className="bg-neutral-950 text-white hover:bg-black font-bold px-3 py-2 rounded-full text-[10px] uppercase cursor-pointer"
                  >
                    Discount Selling Price (-3%)
                  </button>
                  <button 
                    onClick={() => {
                      if (showConfirm) {
                        showConfirm(
                          `Update Supplier linkage for ${selectedProductIds.length} products`,
                          "Transfer whole category linkages to 'Supreme Distributors Nigeria' company account?",
                          () => {
                            setLocalInventory(prev => prev.map(inv => {
                              if (selectedProductIds.includes(inv.id)) {
                                return {
                                  ...inv,
                                  supplierName: "Supreme Distributors Nigeria",
                                  supplierPhone: "+234 803 111 2233"
                                };
                              }
                              return inv;
                            }));
                            setSelectedProductIds([]);
                            setShowBulkPanel(false);
                          }
                        );
                      }
                    }}
                    className="bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold px-3 py-2 rounded-full text-[10px] uppercase cursor-pointer"
                  >
                    Update Supplier Group
                  </button>
                  <button 
                    onClick={() => {
                      if (showConfirm) {
                        showConfirm(
                          "Archive Stock records",
                          `Are you sure you want to hide selected ${selectedProductIds.length} obsolete items from the merchant terminal?`,
                          () => {
                            setLocalInventory(prev => prev.filter(inv => !selectedProductIds.includes(inv.id)));
                            setSelectedProductIds([]);
                            setShowBulkPanel(false);
                          }
                        );
                      }
                    }}
                    className="bg-red-50 text-red-700 hover:bg-red-100 font-bold px-3 py-2 rounded-full text-[10px] uppercase cursor-pointer"
                  >
                    Archive Selected Products
                  </button>
                </div>
              </div>
            )}

            {/* PRODUCT CARDS LIST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="inventory-catalog-cards">
              {filteredProducts.map((item) => {
                const isLow = item.stockLevel <= item.safeMin;
                const isSelectedForBulk = selectedProductIds.includes(item.id);
                const progressWidth = Math.min(100, Math.max(8, (item.stockLevel / Math.max(1, item.safeMin * 2.5)) * 100));

                return (
                  <div 
                    key={item.id}
                    className={`bg-white border rounded-[28px] p-5 space-y-4 flex flex-col justify-between shadow-xs transition relative ${
                      isLow ? 'border-red-150 bg-red-50/5 hover:bg-red-50/10' : 'border-neutral-150 hover:border-neutral-300'
                    } ${isSelectedForBulk ? 'ring-2 ring-amber-400' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    
                    {/* Top Row: SKU Badge, Checkbox selector */}
                    <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[9px] bg-neutral-100 text-[#1e40af] px-2 py-0.5 rounded-full font-bold font-mono">
                        {item.id}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {isLow ? (
                          <span className="text-[8px] bg-red-100 text-red-800 font-extrabold px-2 py-0.5 rounded-full font-sans uppercase">
                            Low Stock Alert
                          </span>
                        ) : (
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full font-sans uppercase">
                            Optimal (Sentry OK)
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleProductSelection(item.id)}
                          className="text-neutral-400 hover:text-neutral-900 p-0.5"
                        >
                          {isSelectedForBulk ? (
                            <CheckSquare className="w-4.5 h-4.5 text-amber-500" />
                          ) : (
                            <Square className="w-4.5 h-4.5 text-neutral-300 hover:text-neutral-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Middle specs */}
                    <div className="text-left space-y-1.5 cursor-pointer">
                      <h4 className="text-sm font-sans font-black text-neutral-950 leading-tight">
                        {item.name}
                      </h4>
                      
                      <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-neutral-500">
                        <span>Category: {item.category}</span>
                        <span className="font-mono">{formatCurrency(item.basePrice, currency)}</span>
                      </div>

                      {/* Stock Level numeric readout and bar */}
                      <div className="space-y-1.5 pt-1.5">
                        <div className="flex items-center justify-between text-xs font-mono font-bold">
                          <span className={isLow ? 'text-red-655 font-black' : 'text-neutral-900'}>
                            Stock: {item.stockLevel} {item.unit}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            Safe limit: {item.safeMin}
                          </span>
                        </div>
                        
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isLow ? 'bg-red-650' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${progressWidth}%` }}
                          />
                        </div>
                      </div>

                      {/* Expected run-out predictions */}
                      <div className="bg-neutral-50/70 p-2.5 rounded-[18px] border border-neutral-150 flex items-center justify-between text-[11px] mt-2">
                        <span className="text-neutral-400 font-semibold font-sans">Predicted Run-out:</span>
                        <span className={`font-mono font-bold ${isLow ? 'text-red-655' : 'text-neutral-800'}`}>
                          {item.stockLevel === 0 ? 'Out of stock' : `${item.forecastedDepletionDays} Days`}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Count Form field in Cards LIST while counting session active */}
                    {isStockCounting && (
                      <div className="pt-2 border-t border-[#E3E3E3]" onClick={(e) => e.stopPropagation()}>
                        <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-1">Enter Physical Count:</label>
                        <div className="flex gap-2">
                          <input 
                            type="number"
                            value={physicalCounts[item.id] ?? item.stockLevel}
                            onChange={(e) => handleUpdateCountValue(item.id, parseInt(e.target.value) || 0)}
                            className="bg-[#fcf8f2] border border-amber-300 text-xs font-bold p-1 rounded-md text-center w-20 font-mono focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateCountValue(item.id, (physicalCounts[item.id] ?? item.stockLevel) + 1)}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-extrabold px-2.5 py-1 rounded"
                          >
                            +1
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick Button Row */}
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleRestockOrder(item)}
                        className="flex-1 bg-neutral-900 hover:bg-black text-white font-bold py-1.5 px-3 rounded-full text-[10px] uppercase transition shadow-none cursor-pointer"
                      >
                        Procure Restock
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAdjustProductId(item.id);
                          setAdjustQty(-5);
                          setAdjustReason('Damaged Goods');
                          setShowAdjustModal(true);
                        }}
                        className="px-2.5 py-1.5 border border-neutral-200 hover:bg-neutral-50 rounded-full text-[10px] text-neutral-500 font-sans font-semibold transition"
                        title="Adjust product stock log"
                      >
                        Adjust
                      </button>
                    </div>

                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="col-span-3 text-center text-neutral-400 py-16">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 stroke-[1.2]" />
                  <p className="text-xs">No active goods matched selected criteria filters.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ===============================================
            TAB 3: ACTIVITY TRANSCRIPT / AUDIT TRIALS
            =============================================== */}
        {activeTab === 'activity' && (
          <div className="space-y-6 animate-fade-in" id="inventory-tab-activity">
            
            <div className="bg-white border border-neutral-150 rounded-[28px] p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs uppercase font-black text-neutral-400 tracking-wider">Stock Movements Ledger</h4>
                  <p className="text-[11px] text-neutral-450 font-sans mt-0.5">Tamper-proof log of purchases, returns, shrinkages, and adjustments.</p>
                </div>

                <div className="flex items-center gap-1.5 self-start shrink-0">
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold uppercase">Sentry Verified Trail</span>
                </div>
              </div>

              {/* AUDIT LOG CHANNELS */}
              <div className="space-y-3">
                {activityLogs.map((log) => {
                  const isInc = log.qtyChanged > 0;
                  return (
                    <div 
                      key={log.id} 
                      className="p-3.5 border border-neutral-100 rounded-[20px] bg-neutral-50/30 hover:bg-neutral-50 flex items-start justify-between gap-4 transition text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          log.action === 'sale' ? 'bg-[#1e40af]/10 text-[#1e40af]' :
                          log.action === 'purchase' ? 'bg-emerald-50 text-emerald-600' :
                          log.action === 'return' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          <Activity className="w-4 h-4" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-sans font-black text-neutral-900">{log.productName}</h5>
                            <span className="text-[9px] uppercase font-bold font-mono text-neutral-400 px-1.5 py-0.5 bg-neutral-100 rounded-md">
                              {log.action}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-neutral-450 mt-1 font-semibold">
                            Timestamp: <span className="text-neutral-700 font-mono">{log.timestamp}</span> | Operator: <span className="text-neutral-800 font-sans">{log.user}</span>
                          </p>
                          <p className="text-[11px] text-[#757575] font-semibold mt-1 italic font-sans">
                            Reason: "{log.reason}"
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`font-mono text-sm font-black ${isInc ? 'text-emerald-700' : 'text-red-655'}`}>
                          {isInc ? '+' : ''}{log.qtyChanged} units
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ===============================================
            TAB 4: ALERTS BOARD
            =============================================== */}
        {activeTab === 'alerts' && (
          <div className="space-y-6 animate-fade-in" id="inventory-tab-alerts">
            
            <div className="bg-white border border-neutral-150 rounded-[28px] p-5 shadow-xs space-y-4">
              <h4 className="text-xs uppercase font-black text-neutral-400 tracking-wider">Critical & Warning Bulletins</h4>
              
              <div className="space-y-3">
                {/* Critical section */}
                {lowStockProducts.map(item => {
                  const isOut = item.stockLevel === 0;
                  return (
                    <div 
                      key={item.id}
                      className="p-4 border border-red-200 bg-red-50/10 rounded-[24px] flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
                    >
                      <div className="flex items-start gap-3 text-xs">
                        <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-5 h-5 text-red-650" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-sans font-black text-neutral-900 text-sm">{item.name}</h5>
                            <span className="text-[9px] text-red-800 bg-red-100 font-bold px-2 py-0.5 rounded uppercase font-mono">
                              {isOut ? 'Out Of Stock' : 'Critical STOCK'}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-neutral-550 font-sans mt-1">
                            Current Units remaining: <strong className="font-mono text-neutral-800">{item.stockLevel} {item.unit}</strong>. Velocity shows expected run-out within **{item.forecastedDepletionDays} days**.
                          </p>
                          <p className="text-[10px] text-neutral-450 mt-1 font-mono">Supplier Contact: {item.supplierName} ({item.supplierPhone})</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestockOrder(item, 48)}
                          className="bg-red-650 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full text-[10px] uppercase transition"
                        >
                          Send Purchase Order
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setActiveTab('products');
                          }}
                          className="border border-neutral-300 hover:bg-neutral-150 text-neutral-600 font-bold py-2 px-4 rounded-full text-[10px] uppercase transition"
                        >
                          View Specs
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Simulated alert list */}
                <div className="p-4 border border-amber-200 bg-amber-50/10 rounded-[24px] flex flex-col md:flex-row md:items-center justify-between gap-4 transition">
                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h5 className="font-sans font-black text-neutral-900 text-sm">Dead Stock Lineage Detected</h5>
                      <p className="text-[11px] text-neutral-550 font-sans mt-0.5">
                        Milo Refill Pack has static velocity below standard weekend benchmarks. Potential liquidity of <strong>{formatCurrency(36800, currency)}</strong> is locked inside the drawer shelves.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showConfirm) {
                        showConfirm("Price markdown suggestion", "Markdown Coca-Cola or Milo product selling fees by 5% to stimulate retail turnover velocity?", () => {});
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-600 font-bold py-2 px-4 rounded-full text-[10px] uppercase text-neutral-950 transition"
                  >
                    View Suggestion
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ===============================================
          PRODUCT SPECIFICATIONS DRAWER OVERLAY
          =============================================== */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center select-none" id="product-bottom-drawer">
          <div 
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setSelectedItem(null)}
          />
          <div className="relative bg-white rounded-t-[32px] w-full max-w-lg p-6 space-y-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto animate-slide-up">
            
            {/* Header notch line */}
            <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto" />
            
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[9px] bg-sky-50 text-sky-800 font-extrabold px-3 py-0.5 rounded-full font-mono uppercase">
                  {selectedItem.id}
                </span>
                <h3 className="text-md sm:text-lg font-sans font-black text-neutral-950 mt-1">{selectedItem.name}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedItem(null)}
                className="text-neutral-400 hover:text-neutral-900 p-1 bg-neutral-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Speeds list */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-neutral-50 p-3 rounded-[18px]">
                <span className="text-[9px] uppercase font-bold text-neutral-400">Standard Selling Price</span>
                <p className="font-mono font-black text-neutral-900 text-sm mt-0.5">{formatCurrency(selectedItem.basePrice, currency)}</p>
              </div>

              <div className="bg-neutral-50 p-3 rounded-[18px]">
                <span className="text-[9px] uppercase font-bold text-neutral-400">Current Stock Level</span>
                <p className="font-mono font-black text-neutral-900 text-sm mt-0.5">{selectedItem.stockLevel} {selectedItem.unit}</p>
              </div>

              <div className="bg-neutral-50 p-3 rounded-[18px]">
                <span className="text-[9px] uppercase font-bold text-neutral-400">Supplier Name</span>
                <p className="font-sans font-bold text-neutral-800 text-[11px] mt-0.5 truncate">{selectedItem.supplierName}</p>
              </div>

              <div className="bg-neutral-50 p-3 rounded-[18px]">
                <span className="text-[9px] uppercase font-bold text-neutral-400">Supplier Contact</span>
                <p className="font-mono font-bold text-sky-700 text-[11px] mt-0.5">{selectedItem.supplierPhone}</p>
              </div>
            </div>

            {/* AI Predictive forecast block */}
            <div className="bg-sky-50 text-[#1e40af] border border-sky-200 p-4 rounded-[22px] text-xs leading-relaxed space-y-1.5">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
                <span>AI Core Sentry Forecast</span>
              </span>
              <p className="text-sky-850 font-sans font-medium">
                With a depletion rate of <strong>{selectedItem.velocity} {selectedItem.unit}/day</strong>, your current shelf count will deplete fully inside <strong>{selectedItem.forecastedDepletionDays} days</strong>.
              </p>
              <div className="pt-2 border-t border-sky-200/50 flex justify-between text-[10px] font-mono font-bold">
                <span>Critical alert: &lt; {selectedItem.safeMin} {selectedItem.unit}</span>
                <span>Restock order timeline: {selectedItem.restockDate}</span>
              </div>
            </div>

            {/* Product Variants support (From launch requirement!) */}
            <div className="bg-neutral-50 p-4 rounded-[22px] border border-neutral-150 space-y-2 text-xs">
              <span className="text-[9px] text-neutral-400 uppercase font-black tracking-wider block">Product Variants & Stocks</span>
              <div className="space-y-1.5 pt-1">
                {getVariants(selectedItem.id).map((v, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] pb-1 border-b border-neutral-100 last:border-b-0">
                    <span className="font-sans font-extrabold text-neutral-800">{v.name}</span>
                    <div className="flex items-center gap-2 font-mono text-neutral-500 font-bold">
                      <span>{v.stockLevel} units</span>
                      <span className="text-gray-300">|</span>
                      <span>{v.barcode}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Actions buttons list */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  handleRestockOrder(selectedItem, 48);
                }}
                className="w-full bg-[#1e40af] hover:bg-[#1a368f] text-white font-bold py-3 rounded-full text-xs uppercase tracking-wide cursor-pointer text-center flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Purchase Order (Request stock expansion)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setAdjustProductId(selectedItem.id);
                  setAdjustQty(-2);
                  setAdjustReason('Damaged Goods');
                  setShowAdjustModal(true);
                }}
                className="w-full bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold py-3 rounded-full text-xs uppercase tracking-wide cursor-pointer text-center transition"
              >
                Adjust Stock / Log Shrinkage
              </button>

              <button
                type="button"
                onClick={() => {
                  if (showConfirm) {
                    showConfirm(
                      `Confirm catalogs delete`,
                      `Are you sure you want to permanently delete product "${selectedItem.name}"? This is irreversible.`,
                      () => {
                        setLocalInventory(prev => prev.filter(inv => inv.id !== selectedItem.id));
                        setSelectedItem(null);
                      }
                    );
                  }
                }}
                className="w-full bg-red-50 hover:bg-red-100 text-red-655 font-bold py-2.5 rounded-full text-[11px] uppercase cursor-pointer text-center transition"
              >
                Delete Catalog Record
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===============================================
          BARCODE SIMULATOR TRIGGER PANEL
          =============================================== */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" id="barcode-popup">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity duration-200 pointer-events-auto" onClick={() => setShowBarcodeScanner(false)} />
          <div className="relative bg-white rounded-[28px] max-w-sm w-full p-6 text-center space-y-6 shadow-2xl z-10 pointer-events-auto">
            
            <div className="flex justify-between items-center border-b pb-3 text-left">
              <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider flex items-center gap-1">
                <Barcode className="w-4.5 h-4.5 text-purple-600 animate-pulse" />
                <span>Secure Barcode Scanner</span>
              </h4>
              <button onClick={() => setShowBarcodeScanner(false)} className="text-neutral-400 hover:text-neutral-900 p-0.5">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scanning graphic viewport */}
            <div className="relative h-44 bg-neutral-950 rounded-2xl flex items-center justify-center overflow-hidden border border-purple-500/30">
              {/* Pulsing camera line */}
              <div className="absolute left-0 right-0 h-0.5 bg-green-400 top-1/2 -translate-y-1/2 animate-bounce rounded" />
              <div className="text-white/60 text-[10px] font-mono space-y-1 select-none pointer-events-none">
                <p>ALIGN CAMERA OVER BARCODE LABEL</p>
                <p className="text-purple-400 font-bold uppercase">Scanner mode: {scannerTargetMode.toUpperCase()}</p>
                <p>FPS: 30 | DEPOT ENGINE ACTIVE</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="block text-neutral-400 font-extrabold uppercase text-[9px] tracking-widest text-left">Tap Simulated Card to scan:</span>
              <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto">
                {localInventory.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleScanValueSelected(item.id)}
                    className="p-2.5 border border-neutral-150 hover:bg-neutral-50 rounded-xl text-left flex justify-between items-center transition cursor-pointer"
                  >
                    <span className="font-sans font-extrabold text-neutral-800">{item.name}</span>
                    <span className="font-mono text-[10px] text-purple-600 font-bold select-all">BAR-{item.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-neutral-400">Scanner links directly through WebRTC/WASM camera frameworks on physical smartphones.</p>
          </div>
        </div>
      )}

      {/* ===============================================
          INLINE/MODAL ADJUSTMENT SPEC FORM
          =============================================== */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" id="adjust-stock-overlay">
          <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity duration-200 pointer-events-auto" onClick={() => setShowAdjustModal(false)} />
          <div className="relative bg-white rounded-[28px] max-w-sm w-full p-6 space-y-5 shadow-xl border border-neutral-150 pointer-events-auto">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-sans font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-sky-500" />
                Adjust Stock Inventory
              </h3>
              <button type="button" onClick={() => setShowAdjustModal(false)} className="text-neutral-400 p-1 bg-neutral-50 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Select Product:</label>
                <select
                  value={adjustProductId}
                  onChange={e => setAdjustProductId(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-full p-2.5 font-semibold text-neutral-800 focus:outline-none"
                >
                  {localInventory.map(itm => (
                    <option key={itm.id} value={itm.id}>{itm.name} (Stock: {itm.stockLevel})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Stock Change Value (Negative for shrinkage):</label>
                <input 
                  type="number"
                  value={adjustQty}
                  onChange={e => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-neutral-200 rounded-full p-2.5 font-mono font-bold focus:outline-none text-center"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Reason for change:</label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-full p-2.5 font-semibold text-neutral-800 focus:outline-none"
                >
                  <option value="Damaged Goods">Damaged Goods</option>
                  <option value="Theft">Theft</option>
                  <option value="Expired Products">Expired Products</option>
                  <option value="Internal Use">Internal Use</option>
                  <option value="Corrections">Corrections</option>
                  <option value="Lost Inventory">Lost Inventory</option>
                  <option value="Stock Inward Procured">Stock Inward Procured</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#1e40af] text-white py-2.5 font-bold rounded-full text-xs transition"
                >
                  Apply Stock Adjustment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2.5 border border-neutral-250 text-neutral-500 rounded-full text-xs hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ===============================================
          CUSTOMER RETURNS MODAL OVERLAY
          =============================================== */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in text-left" id="return-goods-overlay">
          <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity duration-200 pointer-events-auto" onClick={() => setShowReturnModal(false)} />
          <div className="relative bg-white rounded-[28px] max-w-sm w-full p-6 space-y-5 shadow-xl border border-neutral-150 pointer-events-auto">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-sans font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-rose-500 animate-spin" />
                Customer Goods Return
              </h3>
              <button type="button" onClick={() => setShowReturnModal(false)} className="text-neutral-400 p-1 bg-neutral-50 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Returned Product:</label>
                <select
                  value={returnProductId}
                  onChange={e => setReturnProductId(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-full p-2.5 font-semibold text-neutral-800 focus:outline-none"
                >
                  {localInventory.map(itm => (
                    <option key={itm.id} value={itm.id}>{itm.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Returned Quantity:</label>
                <input 
                  type="number" min="1"
                  value={returnQty}
                  onChange={e => setReturnQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-white border border-neutral-200 rounded-full p-2.5 font-mono font-bold focus:outline-none text-center"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Action Type:</label>
                <div className="flex bg-neutral-100 p-0.5 rounded-full border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setReturnActionType('replace')}
                    className={`flex-1 py-1.5 rounded-full text-xs font-black uppercase transition ${
                      returnActionType === 'replace' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-400'
                    }`}
                  >
                    Replace Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnActionType('refund')}
                    className={`flex-1 py-1.5 rounded-full text-xs font-black uppercase transition ${
                      returnActionType === 'refund' ? 'bg-[#1e40af] text-white shadow-xs' : 'text-neutral-400'
                    }`}
                  >
                    Credit / Refund
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Return Reason:</label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-full p-2.5 font-semibold text-neutral-800 focus:outline-none"
                >
                  <option value="Damaged / Bad Quality">Damaged / Bad Quality</option>
                  <option value="Expired Package">Expired Package</option>
                  <option value="Incorrect Goods size">Incorrect Goods size</option>
                  <option value="Customer Dissatisfied">Customer Dissatisfied</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#1e40af] text-white py-2.5 font-bold rounded-full text-xs transition"
                >
                  Authorize Return Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2.5 border border-neutral-250 text-neutral-500 rounded-full text-xs hover:bg-neutral-50"
                >
                  Dismiss
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ===============================================
          MODAL OVERLAY FOR ADDING BRAND NEW SKUs
          =============================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" id="add-product-overlay">
          <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity duration-200 pointer-events-auto" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-[28px] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-neutral-150 pointer-events-auto flex flex-col justify-between">
            <div className="flex items-center justify-between border-b pb-4 mb-5">
              <h3 className="font-sans font-black text-neutral-900 text-base sm:text-lg flex items-center gap-1.5">
                <ShoppingCart className="w-5 h-5 text-sky-500 shrink-0" />
                Initialize Retail Product
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1 text-neutral-400 hover:text-neutral-900 bg-neutral-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 font-sans text-xs text-neutral-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="sm:col-span-2">
                  <label className="block text-neutral-450 font-bold mb-1.5">Standard Item Name</label>
                  <input 
                    type="text" required placeholder="e.g. Coca-Cola 35cl, Peak Milk Powder 400g"
                    value={newName} onChange={e => setNewName(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-full py-2.5 px-4 font-semibold text-neutral-800 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-450 font-bold mb-1.5">Category Group</label>
                  <select 
                    value={newCategory} onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-full py-2.5 px-4 font-semibold text-neutral-800 focus:outline-none focus:border-sky-500 h-[38px]"
                  >
                    <option value="Grains & Cereals">Grains & Cereals</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Cooking Oils">Cooking Oils</option>
                    <option value="Noodles & Pasta">Noodles & Pasta</option>
                    <option value="General Merchandising">General Merchandising</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-450 font-bold mb-1.5">Unit measurement</label>
                  <input 
                    type="text" required placeholder="e.g. Packs, Cartons, Tins, Bottles"
                    value={newUnit} onChange={e => setNewUnit(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-full py-2.5 px-4 font-semibold text-neutral-800 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-450 font-bold mb-1.5">Starting Stock level</label>
                  <input 
                    type="number" required min="1"
                    value={newStockLevel} onChange={e => setNewStockLevel(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-neutral-200 rounded-full py-2.5 px-4 font-mono font-bold focus:outline-none text-center"
                  />
                </div>

                <div>
                  <label className="block text-neutral-450 font-bold mb-1.5">Critical Reorder Margin</label>
                  <input 
                    type="number" required min="1"
                    value={newSafeMin} onChange={e => setNewSafeMin(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-neutral-200 rounded-full py-2.5 px-4 font-mono font-bold focus:outline-none text-center"
                  />
                </div>

                <div>
                  <label className="block text-neutral-450 font-bold mb-1.5">Standard Selling Price ({currencySymbol})</label>
                  <input 
                    type="number" required min="1"
                    value={convertFromNairaBase(newBasePrice, currency)} 
                    onChange={e => {
                      const inputPrice = parseFloat(e.target.value) || 1;
                      // Store base price back in original Naira base so everything syncs perfectly!
                      const rate = CURRENCIES[currency]?.rateFromUSD || 1;
                      const usdVal = inputPrice / rate;
                      setNewBasePrice(Math.round(usdVal * 1500));
                    }}
                    className="w-full bg-white border border-neutral-200 rounded-full py-2.5 px-4 font-mono font-bold focus:outline-none text-center"
                  />
                </div>

                <div>
                  <label className="block text-neutral-450 font-bold mb-1.5">Product SKU / Code</label>
                  <input 
                    type="text" placeholder="e.g. SKU COKE-35"
                    value={newSku} onChange={e => setNewSku(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-full py-2.5 px-4 font-semibold text-neutral-800 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-450 font-bold mb-1.5">Barcode digits</label>
                  <input 
                    type="text" placeholder="e.g. 81200344"
                    value={newBarcode} onChange={e => setNewBarcode(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-full py-2.5 px-4 font-semibold text-neutral-800 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-450 font-bold mb-1.5">Procurement Supplier Name</label>
                  <input 
                    type="text" required placeholder="e.g. FrieslandCampina Ltd"
                    value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-full py-2.5 px-4 font-semibold text-neutral-800 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-450 font-bold mb-1.5">Supplier Telephone / Phone Link</label>
                  <input 
                    type="text" required placeholder="e.g. +234 816 888 7777"
                    value={newSupplierContact} onChange={e => setNewSupplierContact(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-full py-2.5 px-4 font-mono font-bold focus:outline-none"
                  />
                </div>

              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-150">
                <button
                  type="submit"
                  className="flex-1 bg-neutral-900 hover:bg-black text-white rounded-full py-3 text-xs font-black uppercase transition shadow-xs cursor-pointer"
                >
                  Save Product Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-neutral-200 hover:bg-neutral-50 rounded-full text-xs text-neutral-500 font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Convert Naira amounts helper back to correct UI representation
function convertFromNairaBase(nairaAmount: number, targetCurrency: string): number {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.USD;
  const usdAmount = nairaAmount / 1500.0;
  return usdAmount * config.rateFromUSD;
}
