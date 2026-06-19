import React, { useState } from 'react';
import { 
  ShoppingCart, Sparkles, AlertTriangle, CalendarRange, 
  Search, Sliders, PhoneCall, ArrowLeft, Plus, X
} from 'lucide-react';
import EenvoqIcon from './EenvoqIcon';
import { InventoryItem } from '../types';

interface InventoryIntelligenceProps {
  inventory: InventoryItem[];
  onTriggerRestock: (itemId: string, qty: number) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
  onAddInventoryItem?: (newItem: InventoryItem) => void;
}

export default function InventoryIntelligence({ 
  inventory, 
  onTriggerRestock, 
  showConfirm,
  onAddInventoryItem
}: InventoryIntelligenceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'critical' | 'grains' | 'dairy'>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(inventory[0] || null);
  const [restockQty, setRestockQty] = useState(12);

  // States for dynamic Add Product Overlay / Set Opening Stock
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Grains & Essentials');
  const [newStockLevel, setNewStockLevel] = useState(100);
  const [newSafeMin, setNewSafeMin] = useState(20);
  const [newBasePrice, setNewBasePrice] = useState(1500);
  const [newUnit, setNewUnit] = useState('bags');
  const [newSupplierName, setNewSupplierName] = useState('Supreme Distributors');
  const [newSupplierPhone, setNewSupplierPhone] = useState('+234 803 111 2233');

  const handleRestockOrder = (item: InventoryItem) => {
    onTriggerRestock(item.id, restockQty);
    const title = "Restock Dispensed";
    const message = `[Supplier API Simulation]: Dispensed restock invoice of ${restockQty} ${item.unit} for "${item.name}" to manufacturer "${item.supplierName}".\n\nSMS Order placed to: ${item.supplierPhone}\n\n"Hi, please dispatch ${restockQty} units of ${item.name} under our eenvoq automated merchant agreements."`;
    
    if (showConfirm) {
      showConfirm(title, message, () => {}, "Great", "Close");
    } else {
      alert(message);
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newItem: InventoryItem = {
      id: `INV-2026-${Math.floor(Math.random() * 8999 + 1000)}`,
      name: newName,
      category: newCategory,
      stockLevel: newStockLevel,
      safeMin: newSafeMin,
      velocity: 4 + Math.round(Math.random() * 8),
      forecastedDepletionDays: Math.round(((newStockLevel) / (4 + Math.random() * 8)) * 10) / 10,
      restockDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      basePrice: newBasePrice,
      unit: newUnit,
      supplierName: newSupplierName,
      supplierPhone: newSupplierPhone
    };

    if (onAddInventoryItem) {
      onAddInventoryItem(newItem);
    }
    
    setSelectedItem(newItem);
    setShowAddModal(false);

    setNewName('');
    setNewStockLevel(100);
    setNewSafeMin(20);
    setNewBasePrice(1500);

    if (showConfirm) {
      showConfirm(
        "Product Added successfully! 🎉",
        `[Inventory Engine]: Newly created product "${newName}" configured with an opening stock level of ${newStockLevel} ${newUnit}.\n\n✅ Registered in system catalog.\n✅ Automated forecast algorithms activated.\n✅ Supplier order linkage established.`,
        () => {}
      );
    }
  };

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterCategory === 'all') return matchesSearch;
    if (filterCategory === 'critical') return matchesSearch && (item.stockLevel <= item.safeMin);
    if (filterCategory === 'grains') return matchesSearch && item.category.includes('Grains');
    if (filterCategory === 'dairy') return matchesSearch && item.category.includes('Dairy');
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in" id="inventory-intelligence-hub">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.hash = 'dashboard'}
              className="p-1 px-1.5 hover:bg-gray-100 rounded-full transition text-[#1F1F1F] cursor-pointer flex items-center justify-center shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
            </button>
            <h1 className="text-[22px] font-sans font-semibold text-[#1F1F1F] tracking-tight">Low Stock & Restocking</h1>
          </div>
          <p className="text-xs text-[#757575] font-normal mt-1 font-sans ml-11">See which products are running out soon and notify suppliers to send more.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-sky-900 hover:bg-sky-950 border border-transparent text-white font-semibold py-2 px-5 rounded-full text-xs transition flex items-center gap-2 cursor-pointer h-[40px] shadow-sm select-none shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Product</span>
          </button>

          <div className="flex items-center gap-2 bg-[#f0f9ff] border border-[#bae6fd] text-[#0284c7] rounded-full px-5 py-2 text-xs font-bold h-[40px] select-none shrink-0">
            <CalendarRange className="w-4 h-4 text-[#0284c7] stroke-[1.5]" />
            <span className="font-sans">Sync Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="inventory-split-canvas">
        
        {/* Left Side: Structured items tracker table */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur rounded-[24px] border border-[#E3E3E3] shadow-sm overflow-hidden flex flex-col">
          
          {/* Header search controls */}
          <div className="p-4 border-b border-[#E3E3E3] bg-transparent grid grid-cols-1 sm:grid-cols-2 gap-3 select-none">
            <div className="relative">
              <Search className="absolute left-4 top-3 text-[#757575] w-4 h-4 stroke-[1.5]" />
              <input
                type="text"
                placeholder="Search stock and products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#E3E3E3] rounded-full py-2 pl-11 pr-4 text-xs text-[#1F1F1F] font-normal focus:outline-none focus:border-[#5F6368]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 text-xs select-none text-[#5F6368] font-normal font-sans">
              <Sliders className="w-4 h-4 text-[#757575] stroke-[1.5]" />
              <button 
                type="button"
                onClick={() => setFilterCategory('all')} 
                className={`px-4 py-2 rounded-full border transition cursor-pointer font-medium text-xs ${filterCategory === 'all' ? 'bg-[#1F1F1F] border-[#1F1F1F] text-white' : 'bg-white border-[#E3E3E3] text-[#757575] hover:bg-gray-50'}`}
              >
                All
              </button>
              <button 
                type="button"
                onClick={() => setFilterCategory('critical')} 
                className={`px-4 py-2 rounded-full border transition cursor-pointer font-medium text-xs ${filterCategory === 'critical' ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-[#E3E3E3] text-[#757575] hover:bg-gray-50'}`}
              >
                Critical
              </button>
              <button 
                type="button"
                onClick={() => setFilterCategory('grains')} 
                className={`px-4 py-2 rounded-full border transition cursor-pointer font-medium text-xs ${filterCategory === 'grains' ? 'bg-[#1F1F1F] border-[#1F1F1F] text-white' : 'bg-white border-[#E3E3E3] text-[#757575] hover:bg-gray-50'}`}
              >
                Grains
              </button>
            </div>
          </div>

          {/* Table segments */}
          <div className="overflow-x-auto" id="inventory-table-container">
            <table className="w-full text-left border-collapse" id="inventory-records-table">
              <thead>
                <tr className="bg-transparent border-b border-[#E3E3E3] text-[10px] font-semibold text-[#757575] uppercase tracking-wider select-none font-sans">
                  <th className="py-4 px-6 font-semibold">Item Name</th>
                  <th className="py-4 px-6 font-semibold">Stock level</th>
                  <th className="py-4 px-6 font-semibold">How Long Left</th>
                  <th className="py-4 px-6 text-right font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E3E3] text-xs text-[#1F1F1F]">
                {filteredItems.map((item) => {
                  const isCritical = item.stockLevel <= item.safeMin;
                  const percentGirth = Math.min(100, (item.stockLevel / (item.safeMin * 2.5)) * 100);
                  const isSelected = selectedItem?.id === item.id;

                  return (
                    <tr 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`hover:bg-gray-50/75 cursor-pointer transition-all ${
                        isSelected ? 'bg-[#F0F4F9]' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 font-bold text-[#1F1F1F]">
                          {isCritical && <AlertTriangle className="w-4 h-4 text-red-600 stroke-[1.5] shrink-0" />}
                          <span className="truncate max-w-[160px] font-sans">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-[#757575] font-mono mt-0.5 block">{item.category}</span>
                      </td>
                      <td className="py-4 px-6 text-xs">
                        <div className="flex items-center gap-1.5 mb-1.5 font-mono font-medium">
                          <span className={isCritical ? 'text-red-600 font-bold' : 'text-[#1F1F1F]'}>{item.stockLevel} units</span>
                          <span className="text-gray-300">/</span>
                          <span className="text-[#757575] font-normal">Safe Limit: {item.safeMin}</span>
                        </div>
                        {/* Dynamic predictive stock level indicators */}
                        <div className="w-28 bg-gray-100 h-1.5 rounded-full overflow-hidden select-none">
                          <div 
                            className={`h-full rounded-full ${
                              isCritical ? 'bg-red-600' : 'bg-gray-400'
                            }`}
                            style={{ width: `${percentGirth}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs font-mono">
                        <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-[#1F1F1F]'}`}>
                          {item.forecastedDepletionDays} days left
                        </span>
                        <p className="text-[10px] text-[#757575] font-sans mt-0.5">Sales rate: {item.velocity} items per day</p>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-[#1F1F1F]">
                        ₦{item.basePrice.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Side: Supplier Order panel & predictive AI analysis */}
        <div className="bg-white border-2 border-black rounded-[24px] p-6 self-start space-y-6 flex flex-col shadow-sm" id="inventory-item-details-panel">
          {selectedItem ? (
            <>
              {/* Product Info Block */}
              <div className="border-b border-[#E3E3E3] pb-4 select-none">
                <span className="text-[10px] text-[#757575] font-mono block uppercase font-bold">Product Specifications</span>
                <h3 className="font-sans font-bold text-[#1F1F1F] text-base mt-1">{selectedItem.name}</h3>
                <span className="text-[10px] text-[#2563EB] bg-[#E8F0FE] border border-[#CEDFFB] rounded-full py-0.5 px-3 mt-2 inline-block font-bold font-mono">{selectedItem.id}</span>
              </div>

              {/* eenvoq AI Predictive Analytics card */}
              <div className="bg-[#f0f9ff] border border-[#bae6fd] p-5 rounded-[24px] space-y-3 text-[#0284c7]" id="inventory-predictive-analytics-card">
                <div className="flex items-center gap-2 text-xs font-bold select-none">
                  <EenvoqIcon className="w-4 h-4 text-[#0284c7] stroke-[1.5] animate-pulse" />
                  <span>When Will This Run Out?</span>
                </div>
                <div className="space-y-2 text-xs text-[#0284c7] font-sans leading-relaxed" id="depletion-explains">
                  <p className="font-semibold">
                    Selling at about <strong className="text-[#0369a1] font-bold">{selectedItem.velocity} {selectedItem.unit} per day</strong>, this will run out in <strong className="text-[#0369a1] font-bold">{selectedItem.forecastedDepletionDays} days</strong>.
                  </p>
                  <p className="pt-2 border-t border-[#bae6fd] text-[11px] text-[#0284c7] font-medium font-sans">
                    We suggest ordering {restockQty} {selectedItem.unit} before {selectedItem.restockDate} so you don't run out.
                  </p>
                </div>
              </div>

              {/* Supplier contact specs */}
              <div className="bg-[#FCF5E8] border border-[#ECDCCB] p-4 rounded-[24px] text-xs space-y-1 text-[#78350F] shadow-sm" id="supplier-contact-card">
                <span className="text-[9px] font-bold text-[#B45309] uppercase tracking-wider select-none font-sans">Supplier Contact</span>
                <p className="font-bold text-[#78350F] truncate mb-0.5">{selectedItem.supplierName}</p>
                <p className="text-[#B45309] font-mono">{selectedItem.supplierPhone}</p>
              </div>

              {/* Quick replenishment form */}
              <div className="space-y-4 pt-2" id="quick-replenish-action">
                <span className="text-[10px] font-semibold text-[#757575] uppercase font-sans select-none block">Order More Stock</span>
                <div className="flex items-center justify-between bg-white border border-[#E3E3E3] rounded-full py-2 px-4 text-xs select-none">
                  <label className="text-xs text-[#757575] font-normal font-sans">Total Number of Items:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={restockQty}
                      onChange={e => setRestockQty(parseInt(e.target.value) || 1)}
                      className="w-16 bg-transparent text-[#1F1F1F] border-none font-mono font-semibold text-right focus:outline-none"
                    />
                    <span className="text-xs text-[#757575] font-medium">{selectedItem.unit}</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleRestockOrder(selectedItem)}
                  className="w-full bg-[#1F1F1F] hover:bg-black text-white font-semibold py-3.5 rounded-full transition text-xs font-sans flex items-center justify-center gap-2 cursor-pointer shadow-none"
                >
                  <PhoneCall className="w-4 h-4 stroke-[1.5]" />
                  Send Order To Supplier
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-[#757575]" id="inventory-panel-empty">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-[#757575] stroke-[1.2]" />
              <p className="text-xs font-normal max-w-xs mx-auto">Select any product on the left to see when it will run out and to order more.</p>
            </div>
          )}
        </div>

      </div>

      {/* Centered Modal Overlay for Add Product & Opening Stock */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" id="add-product-modal-container">
          <div 
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity duration-200 pointer-events-auto"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-[28px] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-xl border border-[#E3E3E3] pointer-events-auto flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-4 mb-6">
              <h3 className="font-sans font-bold text-[#1F1F1F] text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-sky-500" />
                Add Product & Set Starting Stock
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 font-sans text-xs text-[#1F1F1F]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[#757575] mb-1.5 font-medium">Product / Item Name</label>
                  <input 
                    type="text" required placeholder="e.g. Dangote Sugar 50kg, Golden Penny Flour"
                    value={newName} onChange={e => setNewName(e.target.value)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[#757575] mb-1.5 font-medium">Product Category</label>
                  <select 
                    value={newCategory} onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-sky-500 h-[38px]"
                  >
                    <option value="Grains & Provisions">Grains & Provisions</option>
                    <option value="Dairy & Beverages">Dairy & Beverages</option>
                    <option value="Consumer Packages">Consumer Packages</option>
                    <option value="School Tuition / Fees">School Tuition / Fees</option>
                    <option value="General Inventory">General Inventory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#757575] mb-1.5 font-medium">Unit Type</label>
                  <input 
                    type="text" required placeholder="e.g. bags, cartons, packs"
                    value={newUnit} onChange={e => setNewUnit(e.target.value)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[#757575] mb-1.5 font-medium">Opening Stock Level</label>
                  <input 
                    type="number" required min="0"
                    value={newStockLevel} onChange={e => setNewStockLevel(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs font-mono font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[#757575] mb-1.5 font-medium">Safe Margin (Alert level)</label>
                  <input 
                    type="number" required min="1"
                    value={newSafeMin} onChange={e => setNewSafeMin(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs font-mono font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[#757575] mb-1.5 font-medium">Standard Cost (₦)</label>
                  <input 
                    type="number" required min="1"
                    value={newBasePrice} onChange={e => setNewBasePrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs font-mono font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[#757575] mb-1.5 font-medium font-sans">Supplier Name</label>
                  <input 
                    type="text" required placeholder="Supreme Distributors Ltd"
                    value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#757575] mb-1.5 font-medium font-sans">Supplier Contact Phone</label>
                  <input 
                    type="text" required placeholder="+234 803 111 2233"
                    value={newSupplierPhone} onChange={e => setNewSupplierPhone(e.target.value)}
                    className="w-full bg-white border border-[#E3E3E3] rounded-full py-2.5 px-4 text-xs font-mono font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#E3E3E3]">
                <button
                  type="submit"
                  className="flex-1 bg-[#1F1F1F] hover:bg-black text-white rounded-full py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
                >
                  Confirm & Initialize
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-[#E3E3E3] hover:bg-neutral-50 rounded-full text-xs text-[#757575] font-semibold transition"
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
