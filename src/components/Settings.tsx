import React, { useState } from 'react';
import { 
  ShieldCheck, Store, Key, Phone, CreditCard, Sparkles, Save,
  ToggleLeft, ToggleRight, ArrowLeft
} from 'lucide-react';
import EenvoqIcon from './EenvoqIcon';
import { UserSession } from '../types';
import { formatCurrency } from '../utils/currency';
import LegalPolicies from './LegalPolicies';

interface SettingsProps {
  user: UserSession;
  onUpdateUser: (updated: UserSession) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
  currency: string;
  onChangeCurrency: (c: string) => void;
}

export default function Settings({ user, onUpdateUser, showConfirm, currency, onChangeCurrency }: SettingsProps) {
  const [activeLegalTab, setActiveLegalTab] = useState<'privacy' | 'terms' | 'cookie' | null>(null);
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
    <div className="space-y-6 pb-24 animate-fade-in text-left font-sans select-none text-[#1F1F1F]" id="settings-preferences-view">
      
      {/* HEADER SECTION WITH MESH GRADIENT */}
      <div className="relative overflow-hidden rounded-[32px] p-1 border border-neutral-150/45 bg-white shadow-xs" id="settings-mesh-wrapper">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14)_0%,_rgba(14,165,233,0)_75%)] pointer-events-none" />
        
        {/* Main Header greetings block */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4" id="settings-navbar-panel">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.location.hash = 'dashboard'}
                className="p-1.5 hover:bg-neutral-100 rounded-full transition text-neutral-800 cursor-pointer flex items-center justify-center shrink-0"
                title="Return to home dashboard"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <h1 className="text-xl sm:text-2xl font-sans font-medium text-neutral-900 tracking-tight">
                Settings
              </h1>
            </div>
            <p className="text-sm font-sans font-normal text-neutral-400 mt-1.5 pl-8">
              Manage merchant business profiles, API setups, triggers, and monthly billing permissions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap" id="settings-actions-bar">
            <span className="text-[10px] uppercase font-bold py-2 px-4 bg-sky-50 text-sky-850 border border-sky-150/40 rounded-full flex items-center gap-1 shadow-xs font-sans">
              System Parameters Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="settings-splitting-grid">
        
        {/* Left Side: forms */}
        <div className="lg:col-span-2 bg-[#FCFAF7] rounded-[24px] p-6 border border-sky-100 shadow-sm space-y-6 flex flex-col" id="settings-form-panel">
          
          <div className="flex items-center gap-2 border-b border-sky-100 pb-4 select-none">
            <Store className="w-5 h-5 text-sky-600 stroke-[1.5]" />
            <h4 className="font-sans font-bold text-sky-850 text-sm">Merchant Information</h4>
          </div>

          <form onSubmit={handleSaveSettingsSubmit} className="space-y-5 text-xs font-semibold text-[#1F1F1F]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs text-sky-850 font-sans font-bold">Administrative Owner</label>
                <input
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-white text-[#1F1F1F] border border-sky-150 rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-sky-500 font-sans font-semibold shadow-sm focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs text-sky-850 font-sans font-bold">Business Email</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white text-[#1F1F1F] border border-sky-150 rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-sky-500 font-sans font-semibold shadow-sm focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs text-sky-850 font-sans font-bold">Business Store Name</label>
                <input
                  type="text" required value={storeName} onChange={e => setStoreName(e.target.value)}
                  className="w-full bg-white text-[#1F1F1F] border border-sky-150 rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-sky-500 font-sans font-semibold shadow-sm focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs text-sky-850 font-sans font-bold">Role Category</label>
                <input
                  type="text" disabled value={user.role}
                  className="w-full bg-sky-50/25 text-gray-400 border border-sky-100 rounded-full py-2.5 px-4 text-xs select-none cursor-not-allowed font-sans font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-xs text-sky-850 font-sans font-bold">Physical Location Address</label>
              <input
                type="text" required value={location} onChange={e => setLocation(e.target.value)}
                className="w-full bg-white text-[#1F1F1F] border border-sky-150 rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-sky-500 font-sans font-semibold shadow-sm focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs text-sky-850 font-sans font-bold">Business Currency Preference</label>
              <select
                value={currency}
                onChange={e => onChangeCurrency(e.target.value)}
                className="w-full bg-white text-[#1F1F1F] border border-sky-150 rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-sky-500 font-sans font-bold shadow-sm focus:ring-2 focus:ring-sky-100 cursor-pointer"
              >
                <option value="USD">USD ($) - Primary Default</option>
                <option value="NGN">Naira (₦)</option>
                <option value="GHS">Ghana Cedis (GH₵)</option>
                <option value="KES">Kenyan Shilling (KSh)</option>
                <option value="GBP">Pounds (£)</option>
                <option value="EUR">Euros (€)</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-[#1e40af] hover:bg-[#1a368f] focus:ring-2 focus:ring-[#1e40af]/20 focus:outline-none text-white font-bold py-3.5 px-6 rounded-full transition text-xs font-sans flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4 stroke-[1.5]" />
              Save Configuration
            </button>
          </form>

        </div>

        {/* Right Side: Security secrets, integrations, subscription billing tiers */}
        <div className="space-y-6 flex flex-col justify-start" id="settings-secondary-panel">
          
          {/* Secrets and credentials locked report */}
          <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-[24px] p-6 shadow-sm space-y-4 text-[#0284c7]">
            <div className="flex items-center gap-2 border-b border-[#bae6fd] pb-3 select-none">
              <Key className="w-4.5 h-4.5 text-[#0284c7] stroke-[1.5]" />
              <h4 className="font-sans font-bold text-[#0284c7] text-xs">Credentials Node</h4>
            </div>

            <p className="text-xs text-[#0284c7] leading-relaxed font-sans font-semibold">
              Environment keys are encapsulated inside cloud container instances to prevent browser-side leakage events.
            </p>

            <div className="p-3 bg-white rounded-xl border border-[#bae6fd] flex gap-2 items-center text-[10.5px] text-[#0284c7] font-sans font-bold">
              <ShieldCheck className="w-4 h-4 text-[#0284c7] stroke-[1.5] shrink-0" />
              <span className="font-mono">GEMINI_API_KEY: Configured Server-Side</span>
            </div>
          </div>

          {/* Integration triggers */}
          <div className="bg-white border border-black rounded-[24px] p-6 shadow-sm space-y-5 select-none font-sans">
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
                <p className="text-[10px] text-[#757575] mt-1 font-semibold leading-normal">Restrict sales on credit for unpaid customers</p>
              </div>
              <button type="button" onClick={() => setAutoBillingLock(!autoBillingLock)} className="cursor-pointer">
                {autoBillingLock ? <ToggleRight className="w-8 h-8 text-[#1F1F1F]" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
              </button>
            </div>

            {/* Realtime variance indicator alert */}
            <div className="flex items-center justify-between text-xs font-sans">
              <div>
                <p className="font-bold text-[#1F1F1F]">Push Notifications</p>
                <p className="text-[10px] text-[#757575] mt-1 font-semibold leading-normal">Send cash register alert messages to your phone</p>
              </div>
              <button type="button" onClick={() => setRealtimeNotify(!realtimeNotify)} className="cursor-pointer">
                {realtimeNotify ? <ToggleRight className="w-8 h-8 text-[#1F1F1F]" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
              </button>
            </div>
          </div>

          {/* Legal & Policies compliance card */}
          <div className="bg-white border border-[#E3E3E3] rounded-[24px] p-6 shadow-sm space-y-4 font-sans select-none">
            <div className="flex items-center gap-2 border-b border-[#E3E3E3] pb-3">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 stroke-[1.5]" />
              <h4 className="font-sans font-bold text-[#1F1F1F] text-xs">Compliance and Legal</h4>
            </div>
            
            <p className="text-[10px] text-[#757575] leading-relaxed font-sans font-medium">
              Review our officially active compliance schedules, privacy guidelines, and user terms of service.
            </p>

            <div className="flex flex-col gap-2 font-bold text-[#1F1F1F]">
              <button 
                type="button" 
                onClick={() => setActiveLegalTab('terms')}
                className="w-full text-left p-3 bg-[#FCFAF7] border border-[#E3E3E3] hover:border-[#1F1F1F] rounded-xl transition text-[11px] font-sans flex items-center justify-between cursor-pointer"
              >
                <span>Terms and Conditions</span>
                <span className="text-[10px] text-gray-400 font-mono">View &rarr;</span>
              </button>
              <button 
                type="button" 
                onClick={() => setActiveLegalTab('privacy')}
                className="w-full text-left p-3 bg-[#FCFAF7] border border-[#E3E3E3] hover:border-[#1F1F1F] rounded-xl transition text-[11px] font-sans flex items-center justify-between cursor-pointer"
              >
                <span>Privacy Policy</span>
                <span className="text-[10px] text-gray-400 font-mono">View &rarr;</span>
              </button>
              <button 
                type="button" 
                onClick={() => setActiveLegalTab('cookie')}
                className="w-full text-left p-3 bg-[#FCFAF7] border border-[#E3E3E3] hover:border-[#1F1F1F] rounded-xl transition text-[11px] font-sans flex items-center justify-between cursor-pointer"
              >
                <span>Cookie Policy</span>
                <span className="text-[10px] text-gray-400 font-mono">View &rarr;</span>
              </button>
            </div>
          </div>

          {/* Billing subscription card */}
          <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-[24px] p-6 shadow-sm flex flex-col justify-between font-sans relative overflow-hidden text-[#0284c7]">
            
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-[#bae6fd] select-none">
                <span className="text-[9px] font-bold uppercase tracking-wider bg-white border border-[#bae6fd] text-[#0284c7] px-2.5 py-0.5 rounded-full">Pro Tier</span>
                <EenvoqIcon className="w-4 h-4 text-[#0284c7] stroke-[1.5] animate-pulse" />
              </div>

              <div>
                <h4 className="font-bold text-[#0284c7] text-[11px] uppercase">Service Tier Status</h4>
                <p className="text-xl font-bold font-mono mt-1 text-[#0284c7]">{formatCurrency(45000, currency)} <span className="text-xs font-sans font-semibold text-[#0284c7]">/ mo</span></p>
                <p className="text-[10px] text-[#0284c7] mt-1 font-semibold font-sans">Next automatic bill run: July 1st, 2026</p>
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

      {activeLegalTab && (
        <LegalPolicies activeTab={activeLegalTab} onClose={() => setActiveLegalTab(null)} />
      )}

    </div>
  );
}
