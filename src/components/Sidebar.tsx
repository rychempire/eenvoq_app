import { useState } from 'react';
import { 
  Shield, Sparkles, LayoutDashboard, MessageSquareCode, 
  FileCheck, FileSearch, HelpCircle, ShoppingCart, 
  TrendingUp, Users, BookOpen, AlertCircle, Settings2, 
  LogOut, Menu, ChevronLeft, ChevronRight, Activity, BellRing
} from 'lucide-react';

import { UserSession, Alert } from '../types';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: UserSession;
  alerts: Alert[];
  onLogout: () => void;
}

export default function Sidebar({ activeSection, setActiveSection, user, alerts, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  const mainNavItems: { id: string; label: string; icon: any; highlight?: boolean }[] = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'receipts', label: 'Sales & Receipts', icon: FileCheck },
    { id: 'inventory', label: 'Inventory Assets', icon: ShoppingCart },
    { id: 'retention', label: 'Customers Ledger', icon: Users },
    { id: 'debtor', label: 'Debtor Registers', icon: BookOpen },
    { id: 'truthcheck', label: 'Cash Registry Match', icon: Activity },
    { id: 'forensic', label: 'Forensic Audit', icon: FileSearch },
    { id: 'reports', label: 'Accounting Reports', icon: TrendingUp },
  ];

  const bottomNavItems = [
    { id: 'landing', label: 'Visit Website', icon: Sparkles },
    { id: 'notifications', label: 'Sentry Alerts', icon: BellRing, badge: unreadAlertsCount },
    { id: 'settings', label: 'Company Settings', icon: Settings2 },
  ];

  return (
    <aside 
      className={`bg-[#000000] border-r border-[#27272a] flex flex-col justify-between transition-none relative z-30 h-full ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      id="application-sidebar-root"
    >
      {/* Brand logo bar */}
      <div className="h-14 flex items-center px-4 border-b border-[#27272a] justify-between select-none shrink-0 bg-[#000000]">
        <div className="flex items-center overflow-hidden w-full">
          {!collapsed ? (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              setActiveSection('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              const panel = document.getElementById('workspace-main-panel');
              if (panel) {
                panel.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}>
              <div className="w-6 h-6 rounded bg-[#db2777] flex items-center justify-center font-bold text-white text-xs shadow-sm lowercase shrink-0">
                ev
              </div>
              <div className="flex flex-col text-left">
                <span className="font-sans font-extrabold text-white text-xs leading-none uppercase tracking-wider">Eenvoq Ledger</span>
                <span className="font-sans text-[8px] text-[#db2777] font-bold uppercase tracking-wider mt-0.5">QuickBooks Mode</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full cursor-pointer" onClick={() => {
              setActiveSection('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              const panel = document.getElementById('workspace-main-panel');
              if (panel) {
                panel.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}>
              <div className="w-7 h-7 rounded bg-[#db2777] flex items-center justify-center font-bold text-white text-sm shadow-sm lowercase">
                ev
              </div>
            </div>
          )}
        </div>

        {/* Leverage standard desktop hide/collapse state trigger */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white hidden md:flex items-center justify-center transition cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 stroke-[2]" /> : <ChevronLeft className="w-4 h-4 stroke-[2]" />}
        </button>
      </div>

      {/* Main navigation menu streams - scrollable */}
      <nav className="flex-1 overflow-y-auto py-4 px-0 space-y-0.5 select-none font-sans">
        {!collapsed && (
          <p className="px-5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-2 font-display">Store Ledger</p>
        )}
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center h-10 px-4 text-xs font-medium transition-all group relative cursor-pointer border-l-4 ${
                isActive 
                  ? 'bg-zinc-900 border-[#db2777] text-white font-semibold' 
                  : 'border-transparent text-zinc-400 hover:bg-zinc-90 w-full hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 stroke-[2] ${collapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-[#db2777]' : 'text-zinc-400 group-hover:text-white'}`} />
              {!collapsed && (
                <span className="truncate flex-1 text-left font-display text-[12.5px] leading-tight">
                  {item.label
                }</span>
              )}
              
              {/* Intelligent highlight flare resembling workspace nodes */}
              {item.highlight && !collapsed && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#db2777] absolute right-4" />
              )}
              
              {/* Collapsed label hover tooltips */}
              {collapsed && (
                <div className="absolute left-20 bg-gray-950 text-white text-[10px] py-1 px-2 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap shadow-md z-40">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}

        <div className="h-px bg-zinc-850 my-3 mx-4" />

        {!collapsed && (
          <p className="px-5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-2 font-display">System Tools</p>
        )}
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center h-10 px-4 text-xs font-medium transition-all group relative cursor-pointer border-l-4 ${
                isActive 
                  ? 'bg-zinc-900 border-[#db2777] text-white font-semibold' 
                  : 'border-transparent text-zinc-400 hover:bg-zinc-90 w-full hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 stroke-[2] ${collapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-[#db2777]' : 'text-zinc-400 group-hover:text-white'}`} />
              {!collapsed && (
                <span className="truncate flex-1 text-left font-display text-[12.5px] leading-tight">
                  {item.label}
                </span>
              )}

              {/* Badges */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded leading-none shrink-0 ${
                  collapsed 
                    ? 'absolute top-1 right-1 bg-red-600 text-white border-white scale-75'
                    : isActive 
                      ? 'bg-[#db2777] text-white' 
                      : 'bg-red-600 text-white'
                }`}>
                  {item.badge}
                </span>
              )}

              {collapsed && (
                <div className="absolute left-20 bg-gray-950 text-white text-[10px] py-1 px-2 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap shadow-md z-40">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Authenticated user segment block / permanent bottom logout panel */}
      <div className="p-3 border-t border-[#27272a] bg-[#000000] select-none shrink-0" id="sidebar-bottom-panel">
        <div className={`flex flex-col gap-2 ${collapsed ? 'items-center' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 p-2 bg-zinc-900 rounded border border-[#27272a]">
              {/* Circular user branding */}
              <div className="w-8 h-8 rounded bg-[#db2777] flex items-center justify-center shrink-0">
                <span className="font-display font-bold text-white text-xs">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0" id="user-profile-meta-sidebar">
                <h4 className="text-[11px] font-bold text-white truncate leading-none">{user.name}</h4>
                <p className="text-[9px] text-[#8e9cae] truncate mt-1 leading-none" title={user.storeName}>{user.storeName}</p>
                <span className="inline-block px-1 py-0.2 mt-1 text-[8px] font-bold text-[#db2777] bg-pink-950/40 rounded uppercase leading-none">
                  {user.role}
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              collapsed 
                ? 'bg-transparent text-red-500 hover:bg-neutral-800 p-2' 
                : 'bg-transparent hover:bg-red-950/20 text-red-400 border border-transparent hover:border-red-900/30'
            }`}
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2]" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Center-aligned Logout Confirmation Modal with serene premium tokens */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#121214] rounded border border-[#27272a] p-5 text-center shadow-lg animate-fade-in">
            <h3 className="text-base font-bold font-display text-zinc-100 mb-1">Confirm Logout</h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-5">
              Are you sure you want to log out of Eenvoq? Your current session bookkeeping details will be securely saved.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded border border-[#27272a] bg-transparent text-xs font-bold text-zinc-300 hover:bg-zinc-800 active:scale-95 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="px-4 py-2 rounded bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold active:scale-95 transition cursor-pointer"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
