import { useState } from 'react';
import { 
  BookOpen, Lock, Unlock, Sparkles, MessageSquare, 
  Search, Sliders, ArrowLeft
} from 'lucide-react';
import EenvoqIcon from './EenvoqIcon';
import { Debtor } from '../types';

interface DebtorControlProps {
  debtors: Debtor[];
  onToggleLock: (debtorId: string) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
}

export default function DebtorControl({ debtors, onToggleLock, showConfirm }: DebtorControlProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'locked'>('all');
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(debtors[0] || null);
  const [customOverdraft, setCustomOverdraft] = useState(500000);

  const filteredDebtors = debtors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.phone.includes(searchTerm);
    
    if (filterRisk === 'all') return matchesSearch;
    if (filterRisk === 'high') return matchesSearch && d.riskRating === 'high';
    if (filterRisk === 'locked') return matchesSearch && d.locked;
    return matchesSearch;
  });

  const handleSimulateDispatchReminder = (debtor: Debtor) => {
    const title = "Reminder Routed";
    const msg = `[SMS Dispatch Simulation]: Overdue balance notification routed to debtor customer "${debtor.name}".\n\nMobile: ${debtor.phone}\n\nDear ${debtor.name}, you have a pending payment on your tab of ₦${debtor.amountOwed.toLocaleString()}. Please make a payment soon to keep your account open. Thank you!`;
    
    if (showConfirm) {
      showConfirm(title, msg, () => {}, "Understood", "Close");
    } else {
      alert(msg);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="debtors-accounting-hub">
      
      {/* Page Header */}
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
            <h1 className="text-[22px] font-sans font-semibold text-[#1F1F1F] tracking-tight">People Owed Money</h1>
          </div>
          <p className="text-xs text-[#757575] font-normal mt-1 font-sans ml-11">Keep track of customer store tabs and lock accounts if they owe money for too long.</p>
        </div>

        <div className="flex items-center gap-2 bg-sky-100 border border-sky-200 text-[#0284c7] rounded-full px-5 py-2.5 text-xs font-bold self-start sm:self-auto shadow-sm">
          <BookOpen className="w-5 h-5 text-sky-600 stroke-[1.5]" />
          <span>Credit Check Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="debtors-split-layout">
        
        {/* Left Side: Debt list columns */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur rounded-[24px] border border-[#E3E3E3] shadow-sm overflow-hidden flex flex-col">
          
          {/* Filters controls bar */}
          <div className="p-4 border-b border-[#E3E3E3] bg-transparent grid grid-cols-1 sm:grid-cols-2 gap-3 select-none">
            <div className="relative">
              <Search className="absolute left-4 top-3 text-[#757575] w-4 h-4 stroke-[1.5]" />
              <input
                type="text"
                placeholder="Search customers who owe..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#E3E3E3] rounded-full py-2 pl-11 pr-4 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#5F6368] font-normal"
              />
            </div>

            <div className="flex items-center justify-end gap-2 text-xs text-[#5F6368] font-medium font-sans">
              <Sliders className="w-4 h-4 text-[#757575] stroke-[1.5]" />
              <button type="button" onClick={() => setFilterRisk('all')} className={`px-4 py-2 rounded-full border transition cursor-pointer font-bold text-xs ${filterRisk === 'all' ? 'bg-[#111111] border-sky-400 text-white shadow-sm' : 'bg-white border-[#E3E3E3] text-[#757575] hover:bg-sky-50/50'}`}>All</button>
              <button type="button" onClick={() => setFilterRisk('high')} className={`px-4 py-2 rounded-full border transition cursor-pointer font-bold text-xs ${filterRisk === 'high' ? 'bg-sky-500 border-sky-450 text-white shadow-sm' : 'bg-white border-[#E3E3E3] text-[#757575] hover:bg-sky-50/50'}`}>High Risk</button>
              <button type="button" onClick={() => setFilterRisk('locked')} className={`px-4 py-2 rounded-full border transition cursor-pointer font-bold text-xs ${filterRisk === 'locked' ? 'bg-red-650 border-red-650 text-white shadow-sm' : 'bg-white border-[#E3E3E3] text-[#757575] hover:bg-sky-50/50'}`}>Locked</button>
            </div>
          </div>

          <div className="divide-y divide-[#E3E3E3] min-h-[350px]" id="debtors-viewlist-scroller">
            {filteredDebtors.map((debtor) => {
              return (
                <div
                  key={debtor.id}
                  onClick={() => setSelectedDebtor(debtor)}
                  className={`p-5 flex items-center justify-between hover:bg-sky-50/20 transition cursor-pointer ${
                    selectedDebtor?.id === debtor.id ? 'bg-sky-50 border-l-4 border-sky-500' : ''
                  }`}
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-[#1F1F1F]">{debtor.id}</span>
                      {debtor.locked && (
                        <span className="bg-red-50 text-red-700 text-[8px] font-bold border border-red-100 px-2 py-0.5 rounded-full uppercase font-mono">Locked</span>
                      )}
                    </div>
                    <p className="font-bold text-[#1F1F1F] text-xs font-sans truncate">{debtor.name}</p>
                    <p className="text-[10px] text-[#757575] font-mono mt-1">Mobile: {debtor.phone} | Credit Limit: ₦{customOverdraft.toLocaleString()}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-semibold text-[#1F1F1F] block">₦{debtor.amountOwed.toLocaleString()}</span>
                    <span className={`text-[9px] font-semibold ${
                      debtor.riskRating === 'high' ? 'text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full' : 'text-green-600 bg-green-50/30 px-2.5 py-0.5 rounded-full border border-green-100'
                    } uppercase block mt-1.5`}>
                      {debtor.riskRating} risk (Score: {debtor.creditScore}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Locks toggle & Automated reminder generator */}
        <div className="bg-white border-2 border-black rounded-[24px] p-6 self-start space-y-6 flex flex-col shadow-sm" id="debtors-deep-control-panel">
          {selectedDebtor ? (
            <>
              {/* Profile card */}
              <div className="border-b border-[#E3E3E3] pb-4 select-none">
                <span className="text-[10px] text-[#757575] font-mono block uppercase font-bold">Customer Details</span>
                <h3 className="font-sans font-bold text-[#1F1F1F] text-base mt-1">{selectedDebtor.name}</h3>
                <p className="text-[10px] text-[#757575] font-mono mt-1 font-sans">Payment Due Date: {selectedDebtor.dueDate}</p>
              </div>

              {/* Automatic Lock Toggle */}
              <div className={`p-4 rounded-[24px] space-y-4 shadow-sm border transition-colors duration-150 ${
                selectedDebtor.locked 
                  ? 'bg-[#FCF5E8] border-[#ECDCCB] text-[#78350F]' 
                  : 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]'
              }`} id="automated-credit-lock-box">
                <span className={`text-[9px] font-bold uppercase block font-sans select-none ${
                  selectedDebtor.locked ? 'text-[#78350F]' : 'text-[#0284c7]'
                }`}>Customer Credit Block:</span>
                <div className="flex items-center justify-between text-xs select-none gap-3">
                  <div>
                    <p className={`font-bold flex items-center gap-1.5 font-sans ${
                      selectedDebtor.locked ? 'text-[#78350F]' : 'text-[#0284c7]'
                    }`}>
                      {selectedDebtor.locked ? <Lock className="w-4 h-4 text-red-600 stroke-[1.5]" /> : <Unlock className="w-4 h-4 text-[#0284c7] stroke-[1.5]" />}
                      {selectedDebtor.locked ? 'ACCOUNT LOCKED' : 'ACCOUNT OK'}
                    </p>
                    <p className={`text-[10px] mt-1 font-sans font-semibold leading-normal ${
                      selectedDebtor.locked ? 'text-[#B45309]' : 'text-[#0284c7]/90'
                    }`}>Locks customer from making new purchases until they pay</p>
                  </div>

                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={() => onToggleLock(selectedDebtor.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition ${
                      selectedDebtor.locked 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-none' 
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-none'
                    }`}
                  >
                    {selectedDebtor.locked ? 'Unlock' : 'Block'}
                  </button>
                </div>
              </div>

              {/* Collections Assistant AI Template representation */}
              <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-[24px] p-5 space-y-4 flex flex-col shadow-sm text-[#0284c7]">
                <div className="flex items-center gap-1.5 text-xs font-bold select-none">
                  <EenvoqIcon className="w-4 h-4 text-[#0284c7] stroke-[1.5]" />
                  <span>Ready-made Friendly Text Reminder</span>
                </div>
                <div className="bg-[#FCFAF7]/80 p-4 rounded-xl border border-[#bae6fd] text-[11px] font-sans leading-relaxed text-[#0284c7] font-semibold">
                  "Hello {selectedDebtor.name}, you have a pending payment of ₦{selectedDebtor.amountOwed.toLocaleString()} on your store tab. Please make a payment soon to keep your account open. Thank you!"
                </div>

                <button
                  type="button"
                  onClick={() => handleSimulateDispatchReminder(selectedDebtor)}
                  className="w-full bg-sky-500 hover:bg-sky-600 focus:ring-2 focus:ring-sky-200 focus:outline-none text-white font-bold py-3 rounded-full text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 stroke-[1.5]" />
                  Send Text Reminder
                </button>
              </div>

              {/* Payments log history list */}
              <div className="space-y-3" id="payment-logs-box">
                <span className="text-[9px] font-semibold text-[#757575] uppercase tracking-wider block font-sans select-none">Recent Payments</span>
                <div className="space-y-2" id="payments-list">
                  {selectedDebtor.paymentHistory.map((ph, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 border border-[#E3E3E3] rounded-xl text-xs font-mono">
                      <span className="text-[#5F6368] font-sans">Date: {ph.date}</span>
                      <span className="text-green-700 font-semibold font-sans">₦{ph.amount.toLocaleString()} Paid</span>
                    </div>
                  ))}
                  {selectedDebtor.paymentHistory.length === 0 && (
                    <p className="text-[10px] text-center text-[#757575] py-4 font-sans">No payments made yet.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-[#757575]" id="debtors-panel-empty font-sans">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-[#757575] stroke-[1.2]" />
              <p className="text-xs font-normal max-w-xs mx-auto text-[#757575]">Select any customer on the left to lock/unlock them or send them a reminder.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
