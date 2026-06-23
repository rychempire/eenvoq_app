import React, { useState } from 'react';
import { 
  ShieldCheck, Store, Key, Phone, CreditCard, Sparkles, Save,
  ToggleLeft, ToggleRight, ArrowLeft, Clock, Info
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

  // Set up default weekly hours
  const defaultHours = {
    Monday: { open: true, openTime: "08:00", closeTime: "18:00" },
    Tuesday: { open: true, openTime: "08:00", closeTime: "18:00" },
    Wednesday: { open: true, openTime: "08:00", closeTime: "18:00" },
    Thursday: { open: true, openTime: "08:00", closeTime: "18:00" },
    Friday: { open: true, openTime: "08:00", closeTime: "18:00" },
    Saturday: { open: true, openTime: "09:00", closeTime: "16:00" },
    Sunday: { open: false, openTime: "12:00", closeTime: "16:00" }
  };

  const storedHoursKey = 'eenvoq_hours_settings';
  const [weeklyHours, setWeeklyHours] = useState(() => {
    try {
      const saved = localStorage.getItem(storedHoursKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultHours;
  });
  
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      email,
      storeName,
      storeLocation: location,
      role: user.role
    });
    
    // Save work hours as well if user is Owner
    if (user.role === 'Owner') {
      localStorage.setItem('eenvoq_hours_settings', JSON.stringify(weeklyHours));
    }

    const title = "Settings Synced";
    const msg = "[eenvoq Settings Simulator]: Merchant profile synced successfully on local database nodes!";
    if (showConfirm) {
      showConfirm(title, msg, () => {}, "Terrific", "Dismiss");
    } else {
      alert(msg);
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in text-left font-sans select-none text-zinc-300 w-full" id="settings-preferences-view">
      
      {/* HEADER SECTION - SAME AS HOME DASHBOARD STYLE */}
      <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-none" id="settings-header-nav">
        {/* Left Side: Store Identity & QuickBooks logo */}
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded bg-[#db2777] flex items-center justify-center text-white font-bold text-lg shadow-none shrink-0 select-none lowercase font-sans">
            ev
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md font-sans">
                Company Settings Preferred Preferences
              </h2>
              <span className="bg-pink-950/40 text-[#db2777] text-[9px] font-bold px-2 py-0.5 rounded border border-[#db2777]/35 uppercase tracking-widest shrink-0 font-mono">
                System Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Manage merchant business profiles, API setups, triggers, and monthly billing permissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap" id="settings-actions-bar">
          <span className="text-[10px] uppercase font-bold py-1.5 px-3 bg-pink-950/40 text-[#db2777] border border-[#db2777]/35 rounded flex items-center gap-1 font-sans">
            System Parameters Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="settings-splitting-grid">
        
        {/* Left Side: forms */}
        <div className="lg:col-span-2 bg-[#0e0e11] rounded-lg p-6 border border-[#27272a] space-y-6 flex flex-col" id="settings-form-panel">
          
          <div className="flex items-center gap-2 border-b border-[#27272a] pb-4 select-none">
            <Store className="w-5 h-5 text-[#db2777] stroke-[1.5]" />
            <h4 className="font-sans font-bold text-white text-sm">Merchant Information</h4>
          </div>

          <form onSubmit={handleSaveSettingsSubmit} className="space-y-5 text-xs font-semibold text-zinc-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs text-zinc-400 font-sans font-bold">Administrative Owner</label>
                <input
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-[#18181b] text-white border border-[#27272a] rounded-lg py-2.5 px-4 text-xs focus:outline-none focus:border-[#db2777] font-sans font-semibold focus:ring-1 focus:ring-[#db2777]/40"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs text-zinc-400 font-sans font-bold">Business Email</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#18181b] text-white border border-[#27272a] rounded-lg py-2.5 px-4 text-xs focus:outline-none focus:border-[#db2777] font-sans font-semibold focus:ring-1 focus:ring-[#db2777]/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs text-zinc-400 font-sans font-bold">Business Store Name</label>
                <input
                  type="text" required value={storeName} onChange={e => setStoreName(e.target.value)}
                  className="w-full bg-[#18181b] text-white border border-[#27272a] rounded-lg py-2.5 px-4 text-xs focus:outline-none focus:border-[#db2777] font-sans font-semibold focus:ring-1 focus:ring-[#db2777]/40"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs text-zinc-400 font-sans font-bold">Role Category</label>
                <input
                  type="text" disabled value={user.role}
                  className="w-full bg-[#27272a]/30 text-zinc-500 border border-[#27272a] rounded-lg py-2.5 px-4 text-xs select-none cursor-not-allowed font-sans font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-xs text-zinc-400 font-sans font-bold">Physical Location Address</label>
              <input
                type="text" required value={location} onChange={e => setLocation(e.target.value)}
                className="w-full bg-[#18181b] text-white border border-[#27272a] rounded-lg py-2.5 px-4 text-xs focus:outline-none focus:border-[#db2777] font-sans font-semibold focus:ring-1 focus:ring-[#db2777]/40"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs text-zinc-400 font-sans font-bold">Business Currency Preference</label>
              <select
                value={currency}
                onChange={e => onChangeCurrency(e.target.value)}
                className="w-full bg-[#18181b] text-white border border-[#27272a] rounded-lg py-2.5 px-4 text-xs focus:outline-none focus:border-[#db2777] font-sans font-bold cursor-pointer"
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
              className="bg-[#db2777] hover:bg-[#c02164] text-white font-bold py-3 px-6 rounded-lg transition text-xs font-sans flex items-center justify-center gap-2 cursor-pointer shadow-none"
            >
              <Save className="w-4 h-4 stroke-[1.5]" />
              Save Configuration
            </button>
          </form>

          {user.role === 'Owner' && (
            <div className="bg-[#18181b] rounded-lg p-6 border border-[#27272a] space-y-4">
              <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
                <Clock className="w-5 h-5 text-[#db2777] stroke-[1.5]" />
                <h4 className="font-sans font-normal text-white text-sm">Store Opening & Closing Hours</h4>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans font-semibold leading-relaxed">
                Set weekly operational schedule to control active sales rundown alerts and day-end performance calculations.
              </p>
              
              <div className="space-y-3 font-sans mt-3">
                {Object.keys(weeklyHours).map((day) => {
                  const d = day as keyof typeof weeklyHours;
                  return (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-[#0e0e11] hover:bg-zinc-900 border border-[#27272a] rounded-xl transition">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={weeklyHours[d].open}
                          onChange={(e) => setWeeklyHours({
                            ...weeklyHours,
                            [d]: { ...weeklyHours[d], open: e.target.checked }
                          })}
                          className="w-4 h-4 text-[#db2777] border-zinc-700 bg-zinc-800 rounded focus:ring-[#db2777] cursor-pointer"
                        />
                        <span className="text-xs font-bold text-white w-24">{day}</span>
                      </div>
                      
                      {weeklyHours[d].open ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-zinc-500 font-bold font-mono">OPEN:</span>
                            <input
                              type="time"
                              value={weeklyHours[d].openTime}
                              onChange={(e) => setWeeklyHours({
                                ...weeklyHours,
                                [d]: { ...weeklyHours[d], openTime: e.target.value }
                              })}
                              className="bg-[#18181b] border border-[#27272a] text-zinc-300 px-2 py-1 rounded text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#db2777] cursor-pointer"
                            />
                          </div>
                          <span className="text-zinc-600 text-xs">-</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-zinc-500 font-bold font-mono">CLOSE:</span>
                            <input
                              type="time"
                              value={weeklyHours[d].closeTime}
                              onChange={(e) => setWeeklyHours({
                                ...weeklyHours,
                                [d]: { ...weeklyHours[d], closeTime: e.target.value }
                              })}
                              className="bg-[#18181b] border border-[#27272a] text-zinc-300 px-2 py-1 rounded text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#db2777] cursor-pointer"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-rose-400 font-bold uppercase tracking-wider font-mono">Closed &bull; Day Off</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Security secrets, integrations, subscription billing tiers */}
        <div className="space-y-6 flex flex-col justify-start" id="settings-secondary-panel">
          
          {/* Secrets and credentials locked report */}
          <div className="bg-pink-950/20 border border-pink-900/30 rounded-lg p-6 shadow-none space-y-4 text-pink-400">
            <div className="flex items-center gap-2 border-b border-pink-900/20 pb-3 select-none">
              <Key className="w-4.5 h-4.5 text-[#db2777] stroke-[1.5]" />
              <h4 className="font-sans font-bold text-[#db2777] text-xs">Credentials Node</h4>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium">
              Environment keys are encapsulated inside cloud container instances to prevent browser-side leakage events.
            </p>

            <div className="p-3 bg-zinc-950/50 rounded-xl border border-pink-900/20 flex gap-2 items-center text-[10.5px] text-[#db2777] font-sans font-bold">
              <ShieldCheck className="w-4 h-4 text-[#db2777] stroke-[1.5] shrink-0" />
              <span className="font-mono">GEMINI_API_KEY: Active Server-Side</span>
            </div>
          </div>

          {/* Database Mode Switcher */}
          <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-6 shadow-none space-y-4 font-sans select-none">
            <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
              <Store className="w-4.5 h-4.5 text-[#db2777] stroke-[1.5]" />
              <h4 className="font-sans font-bold text-white text-xs">Data Ledger Sync Node</h4>
            </div>
            
            <p className="text-[10px] text-zinc-400 leading-relaxed font-sans font-medium">
              Toggle between Supabase Live Sync (Cloud Database connection) or localized Sandbox Engine (simulated local backup storage).
            </p>

            <div className="flex flex-col gap-2 p-3.5 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
              <div>
                <p className="text-xs font-bold text-white">Database Connection</p>
                <p className="text-[9px] text-[#db2777] font-semibold mt-0.5 font-sans leading-relaxed">
                  {localStorage.getItem('eenvoq_force_simulation_db') === 'true' ? "Active Ledger: Simulated Local Storage" : "Active Ledger: Live Supabase Cloud SQL Engine"}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  const currentMode = localStorage.getItem('eenvoq_force_simulation_db') === 'true';
                  if (currentMode) {
                    localStorage.removeItem('eenvoq_force_simulation_db');
                  } else {
                    localStorage.setItem('eenvoq_force_simulation_db', 'true');
                  }
                  window.location.reload();
                }} 
                className="w-full py-2 bg-[#db2777] text-white hover:bg-[#c02164] rounded-lg text-[10px] tracking-wide font-semibold cursor-pointer font-sans shadow-none transition active:scale-95 text-center block"
              >
                {localStorage.getItem('eenvoq_force_simulation_db') === 'true' ? "Switch to Cloud Sync" : "Switch to Local Sandbox"}
              </button>
            </div>
          </div>

          {/* Integration triggers */}
          <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-6 shadow-none space-y-5 select-none font-sans text-zinc-300">
            <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
              <Phone className="w-4.5 h-4.5 text-[#db2777] stroke-[1.5]" />
              <h4 className="font-sans font-bold text-white text-xs">Simulations & Triggers</h4>
            </div>

            {/* WhatsApp Integration Toggle */}
            <div className="flex items-center justify-between text-xs font-sans">
              <div>
                <p className="font-bold text-white">WhatsApp Messages</p>
                <p className="text-[10px] text-zinc-400 mt-1 font-semibold leading-normal">Route verified receipts on checkout</p>
              </div>
              <button type="button" onClick={() => setWaIntegration(!waIntegration)} className="cursor-pointer">
                {waIntegration ? <ToggleRight className="w-8 h-8 text-[#db2777]" /> : <ToggleLeft className="w-8 h-8 text-zinc-600" />}
              </button>
            </div>

            {/* Debtor Auto locker trigger */}
            <div className="flex items-center justify-between text-xs font-sans">
              <div>
                <p className="font-bold text-white">Auto Credit Lockouts</p>
                <p className="text-[10px] text-zinc-400 mt-1 font-semibold leading-normal">Restrict sales on credit for unpaid customers</p>
              </div>
              <button type="button" onClick={() => setAutoBillingLock(!autoBillingLock)} className="cursor-pointer">
                {autoBillingLock ? <ToggleRight className="w-8 h-8 text-[#db2777]" /> : <ToggleLeft className="w-8 h-8 text-zinc-600" />}
              </button>
            </div>

            {/* Realtime variance indicator alert */}
            <div className="flex items-center justify-between text-xs font-sans">
              <div>
                <p className="font-bold text-white">Push Notifications</p>
                <p className="text-[10px] text-zinc-400 mt-1 font-semibold leading-normal">Send cash register alert messages to your phone</p>
              </div>
              <button type="button" onClick={() => setRealtimeNotify(!realtimeNotify)} className="cursor-pointer">
                {realtimeNotify ? <ToggleRight className="w-8 h-8 text-[#db2777]" /> : <ToggleLeft className="w-8 h-8 text-zinc-600" />}
              </button>
            </div>
          </div>

          {/* Legal & Policies compliance card */}
          <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-6 shadow-none space-y-4 font-sans select-none">
            <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
              <ShieldCheck className="w-4.5 h-4.5 text-pink-500 stroke-[1.5]" />
              <h4 className="font-sans font-bold text-white text-xs">Compliance and Legal</h4>
            </div>
            
            <p className="text-[10px] text-zinc-400 leading-relaxed font-sans font-medium">
              Review our officially active compliance schedules, privacy guidelines, and user terms of service.
            </p>

            <div className="flex flex-col gap-2 font-bold text-white">
              <button 
                type="button" 
                onClick={() => setActiveLegalTab('terms')}
                className="w-full text-left p-3 bg-[#18181b] border border-[#27272a] hover:border-[#db2777] rounded-xl transition text-[11px] font-sans flex items-center justify-between cursor-pointer"
              >
                <span>Terms and Conditions</span>
                <span className="text-[10px] text-[#db2777] font-mono">View &rarr;</span>
              </button>
              <button 
                type="button" 
                onClick={() => setActiveLegalTab('privacy')}
                className="w-full text-left p-3 bg-[#18181b] border border-[#27272a] hover:border-[#db2777] rounded-xl transition text-[11px] font-sans flex items-center justify-between cursor-pointer"
              >
                <span>Privacy Policy</span>
                <span className="text-[10px] text-[#db2777] font-mono">View &rarr;</span>
              </button>
              <button 
                type="button" 
                onClick={() => setActiveLegalTab('cookie')}
                className="w-full text-left p-3 bg-[#18181b] border border-[#27272a] hover:border-[#db2777] rounded-xl transition text-[11px] font-sans flex items-center justify-between cursor-pointer"
              >
                <span>Cookie Policy</span>
                <span className="text-[10px] text-[#db2777] font-mono">View &rarr;</span>
              </button>
            </div>
          </div>

          {/* Billing subscription card */}
          <div className="bg-[#db2777]/10 border border-[#db2777]/30 rounded-lg p-6 shadow-none flex flex-col justify-between font-sans relative overflow-hidden text-[#db2777]">
            
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-[#db2777]/20 select-none">
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#18181b] border border-[#db2777]/35 text-[#db2777] px-2.5 py-0.5 rounded-full">Pro Tier</span>
                <EenvoqIcon className="w-4 h-4 text-[#db2777] stroke-[1.5] animate-pulse" />
              </div>

              <div>
                <h4 className="font-bold text-[#db2777] text-[11px] uppercase">Service Tier Status</h4>
                <p className="text-xl font-bold font-mono mt-1 text-white">{formatCurrency(45000, currency)} <span className="text-xs font-sans font-semibold text-zinc-400">/ mo</span></p>
                <p className="text-[10px] text-zinc-400 mt-1 font-semibold font-sans">Next automatic bill run: July 1st, 2026</p>
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
              className="mt-5 w-full bg-[#db2777] hover:bg-[#c02164] text-white font-semibold py-3 rounded-lg text-xs font-sans flex items-center justify-center gap-2 transition cursor-pointer"
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
