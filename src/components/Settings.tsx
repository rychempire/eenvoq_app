import React, { useState } from 'react';
import { 
  ShieldCheck, Store, Key, Phone, CreditCard, Sparkles, Save,
  ToggleLeft, ToggleRight, ArrowLeft
} from 'lucide-react';
import EenvoqIcon from './EenvoqIcon';
import { UserSession } from '../types';

interface SettingsProps {
  user: UserSession;
  onUpdateUser: (updated: UserSession) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
}

export default function Settings({ user, onUpdateUser, showConfirm }: SettingsProps) {
  const [storeName, setStoreName] = useState(user.storeName);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [location, setLocation] = useState(user.storeLocation);
  
  // Custom toggles
  const [waIntegration, setWaIntegration] = useState(true);
  const [autoBillingLock, setAutoBillingLock] = useState(true);
  const [realtimeNotify, setRealtimeNotify] = useState(true);
  
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      email,
      storeName,
      storeLocation: location,
      role: user.role
    });
    
    const title = "Settings Synced";
    const msg = "[eenvoq Settings Simulator]: Merchant profile synced successfully on local database nodes!";
    if (showConfirm) {
      showConfirm(title, msg, () => {}, "Terrific", "Dismiss");
    } else {
      alert(msg);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="settings-preferences-view">
      
      <div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.hash = 'dashboard'}
            className="p-1 px-1.5 hover:bg-gray-100 rounded-full transition text-[#1F1F1F] cursor-pointer flex items-center justify-center shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
          </button>
          <h1 className="text-[22px] font-sans font-semibold text-[#1F1F1F] tracking-tight">Settings</h1>
        </div>
        <p className="text-xs text-[#757575] font-normal mt-1 font-sans ml-11">Manage merchant business profiles, API setups, triggers, and monthly billing permissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="settings-splitting-grid">
        
        {/* Left Side: forms */}
        <div className="lg:col-span-2 bg-[#FCF5E8] rounded-[24px] p-6 border border-[#ECDCCB] shadow-sm space-y-6 flex flex-col" id="settings-form-panel">
          
          <div className="flex items-center gap-2 border-b border-[#ECDCCB] pb-4 select-none">
            <Store className="w-5 h-5 text-[#B45309] stroke-[1.5]" />
            <h4 className="font-sans font-bold text-[#78350F] text-sm">Merchant Information</h4>
          </div>

          <form onSubmit={handleSaveSettingsSubmit} className="space-y-5 text-xs font-semibold text-[#1F1F1F]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs text-[#B45309] font-sans font-bold">Administrative Owner</label>
                <input
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-white text-[#1F1F1F] border border-[#ECDCCB] rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-[#78350F] font-sans font-semibold shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs text-[#B45309] font-sans font-bold">Business Email</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white text-[#1F1F1F] border border-[#ECDCCB] rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-[#78350F] font-sans font-semibold shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs text-[#B45309] font-sans font-bold">Business Store Name</label>
                <input
                  type="text" required value={storeName} onChange={e => setStoreName(e.target.value)}
                  className="w-full bg-white text-[#1F1F1F] border border-[#ECDCCB] rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-[#78350F] font-sans font-semibold shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs text-[#B45309] font-sans font-bold">Role Category</label>
                <input
                  type="text" disabled value={user.role}
                  className="w-full bg-[#FCF8F2] text-gray-400 border border-[#ECDCCB] rounded-full py-2.5 px-4 text-xs select-none cursor-not-allowed font-sans font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-xs text-[#B45309] font-sans font-bold">Physical Location Address</label>
              <input
                type="text" required value={location} onChange={e => setLocation(e.target.value)}
                className="w-full bg-white text-[#1F1F1F] border border-[#ECDCCB] rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-[#78350F] font-sans font-semibold shadow-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-[#1F1F1F] hover:bg-black text-white font-bold py-3.5 px-6 rounded-full transition text-xs font-sans flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4 stroke-[1.5]" />
              Save Configuration
            </button>
          </form>

        </div>

        {/* Right Side: Security secrets, integrations, subscription billing tiers */}
        <div className="space-y-6 flex flex-col justify-start" id="settings-secondary-panel">
          
          {/* Secrets and credentials locked report */}
          <div className="bg-[#E6F4EA] border border-[#CCD7CE] rounded-[24px] p-6 shadow-sm space-y-4 text-[#137333]">
            <div className="flex items-center gap-2 border-b border-[#CCD7CE] pb-3 select-none">
              <Key className="w-4.5 h-4.5 text-[#137333] stroke-[1.5]" />
              <h4 className="font-sans font-bold text-[#137333] text-xs">Credentials Node</h4>
            </div>

            <p className="text-xs text-[#137333] leading-relaxed font-sans font-semibold">
              Environment keys are encapsulated inside cloud container instances to prevent browser-side leakage events.
            </p>

            <div className="p-3 bg-white rounded-xl border border-[#CCD7CE] flex gap-2 items-center text-[10.5px] text-[#137333] font-sans font-bold">
              <ShieldCheck className="w-4 h-4 text-[#137333] stroke-[1.5] shrink-0" />
              <span className="font-mono">GEMINI_API_KEY: Configured Server-Side</span>
            </div>
          </div>

          {/* Integration triggers */}
          <div className="bg-white border-2 border-black rounded-[24px] p-6 shadow-sm space-y-5 select-none font-sans">
            <div className="flex items-center gap-2 border-b border-[#E3E3E3] pb-3">
              <Phone className="w-4.5 h-4.5 text-[#1F1F1F] stroke-[1.5]" />
              <h4 className="font-sans font-bold text-[#1F1F1F] text-xs">Simulations & Triggers</h4>
            </div>

            {/* WhatsApp Integration Toggle */}
            <div className="flex items-center justify-between text-xs font-sans">
              <div>
                <p className="font-bold text-[#1F1F1F]">WhatsApp Messages</p>
                <p className="text-[10px] text-[#757575] mt-1 font-semibold leading-normal">Route verified receipts on checkout</p>
              </div>
              <button type="button" onClick={() => setWaIntegration(!waIntegration)} className="cursor-pointer">
                {waIntegration ? <ToggleRight className="w-8 h-8 text-[#1F1F1F]" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
              </button>
            </div>

            {/* Debtor Auto locker trigger */}
            <div className="flex items-center justify-between text-xs font-sans">
              <div>
                <p className="font-bold text-[#1F1F1F]">Auto Credit Lockouts</p>
                <p className="text-[10px] text-[#757575] mt-1 font-semibold leading-normal">Restrict register sales for B2B debtors</p>
              </div>
              <button type="button" onClick={() => setAutoBillingLock(!autoBillingLock)} className="cursor-pointer">
                {autoBillingLock ? <ToggleRight className="w-8 h-8 text-[#1F1F1F]" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
              </button>
            </div>

            {/* Realtime variance indicator alert */}
            <div className="flex items-center justify-between text-xs font-sans">
              <div>
                <p className="font-bold text-[#1F1F1F]">Push Notifications</p>
                <p className="text-[10px] text-[#757575] mt-1 font-semibold leading-normal">Transmit till overrides to active log streams</p>
              </div>
              <button type="button" onClick={() => setRealtimeNotify(!realtimeNotify)} className="cursor-pointer">
                {realtimeNotify ? <ToggleRight className="w-8 h-8 text-[#1F1F1F]" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
              </button>
            </div>
          </div>

          {/* Billing subscription card */}
          <div className="bg-[#E6F4EA] border border-[#CCD7CE] rounded-[24px] p-6 shadow-sm flex flex-col justify-between font-sans relative overflow-hidden text-[#137333]">
            
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-[#CCD7CE] select-none">
                <span className="text-[9px] font-bold uppercase tracking-wider bg-white border border-[#CCD7CE] text-[#137333] px-2.5 py-0.5 rounded-full">Pro Tier</span>
                <EenvoqIcon className="w-4 h-4 text-[#137333] stroke-[1.5] animate-pulse" />
              </div>

              <div>
                <h4 className="font-bold text-[#137333] text-[11px] uppercase">Service Tier Status</h4>
                <p className="text-xl font-bold font-mono mt-1 text-[#137333]">₦45,000 <span className="text-xs font-sans font-semibold text-[#137333]">/ mo</span></p>
                <p className="text-[10px] text-[#137333] mt-1 font-semibold font-sans">Next automatic bill run: July 1st, 2026</p>
              </div>
            </div>

             <button
              type="button"
              onClick={() => {
                const title = "Billing Gateway Loading";
                const msg = "[Subscription billing]: Gateway secure connection loaded on active cloud router. Access token checked.";
                if (showConfirm) {
                  showConfirm(title, msg, () => {}, "Secure Connection Ready", "Close");
                } else {
                  alert(msg);
                }
              }}
              className="mt-5 w-full bg-[#1F1F1F] hover:bg-black text-white font-semibold py-3 rounded-full text-xs font-sans flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4 stroke-[1.5]" />
              Manage Billing Card
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
