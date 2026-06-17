import { useState } from 'react';
import { 
  Shield, Sparkles, LayoutDashboard, MessageSquareCode, 
  FileCheck, FileSearch, HelpCircle, ShoppingCart, 
  TrendingUp, Users, BookOpen, AlertCircle, Settings2, 
  LogOut, Menu, ChevronLeft, ChevronRight, Activity, BellRing
} from 'lucide-react';
import EenvoqIcon from './EenvoqIcon';
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

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Chat', icon: EenvoqIcon, highlight: true },
    { id: 'receipts', label: 'Receipts', icon: FileCheck },
    { id: 'truthcheck', label: 'Truth Check', icon: Activity },
    { id: 'forensic', label: 'Forensics', icon: FileSearch },
    { id: 'inventory', label: 'Inventory', icon: ShoppingCart },
    { id: 'retention', label: 'Retention', icon: Users },
    { id: 'debtor', label: 'Debtors', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
  ];

  const bottomNavItems = [
    { id: 'landing', label: 'View Website', icon: Sparkles },
    { id: 'notifications', label: 'Alerts', icon: BellRing, badge: unreadAlertsCount },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  return (
    <aside 
      className={`bg-white border-r border-[#E3E3E3] flex flex-col justify-between transition-all duration-300 relative z-30 h-full ${
        collapsed ? 'w-24' : 'w-72'
      }`}
      id="application-sidebar-root"
    >
      {/* Brand logo bar */}
      <div className="h-20 flex items-center px-5 border-b border-[#E3E3E3] justify-between select-none shrink-0">
        <div className="flex items-center overflow-hidden">
          {!collapsed ? (
            <div className="flex flex-col">
              <span className="font-sans font-semibold text-[#1F1F1F] tracking-tight text-[22px] leading-tight" id="sidebar-eenvoq-title">
                eenvoq
              </span>
              <span className="text-[9px] text-[#757575] font-mono tracking-wider uppercase mt-0.5 leading-none">Auditor</span>
            </div>
          ) : (
            <span className="font-sans font-semibold text-[#1F1F1F] tracking-tight text-[22px] select-none text-center block w-full">
              e
            </span>
          )}
        </div>

        {/* Leverage standard desktop hide/collapse state trigger */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-full hover:bg-gray-100 text-[#5F6368] hover:text-gray-950 hidden md:flex items-center justify-center transition cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5 stroke-[1.5]" /> : <ChevronLeft className="w-5 h-5 stroke-[1.5]" />}
        </button>
      </div>

      {/* Main navigation menu streams - scrollable */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 select-none font-sans">
        {!collapsed && (
          <p className="px-3 text-[10px] font-medium text-[#757575] uppercase tracking-wider mb-2 font-display">Tools</p>
        )}
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center h-12 rounded-full px-4 text-xs font-semibold transition-all group relative cursor-pointer ${
                isActive 
                  ? 'bg-[#F0F4F9] text-[#1F1F1F]' 
                  : 'text-[#444746] bg-transparent hover:bg-gray-100 hover:text-black'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-6 h-6 shrink-0 stroke-[1.5] ${collapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-[#1B1B1F]' : 'text-[#5F6368] group-hover:text-black'}`} />
              {!collapsed && (
                <span className="truncate flex-1 text-left font-display text-[13px] leading-none">
                  {item.label}
                </span>
              )}
              
              {/* Intelligent highlight flare resembling workspace nodes */}
              {item.highlight && !collapsed && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F1F1F] absolute right-4" />
              )}
              
              {/* Collapsed label hover tooltips */}
              {collapsed && (
                <div className="absolute left-24 bg-gray-950 text-white text-xs py-1 px-2.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap shadow-md z-40">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}

        <div className="h-px bg-[#E3E3E3] my-4 mx-2" />

        {!collapsed && (
          <p className="px-3 text-[10px] font-medium text-[#757575] uppercase tracking-wider mb-2 font-display">System</p>
        )}
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center h-12 rounded-full px-4 text-xs font-semibold transition-all group relative cursor-pointer ${
                isActive 
                  ? 'bg-[#F0F4F9] text-[#1F1F1F]' 
                  : 'text-[#444746] bg-transparent hover:bg-gray-100 hover:text-black'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-6 h-6 shrink-0 stroke-[1.5] ${collapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-[#1B1B1F]' : 'text-[#5F6368] group-hover:text-[#1F1F1F]'}`} />
              {!collapsed && (
                <span className="truncate flex-1 text-left font-display text-[13px] leading-none">
                  {item.label}
                </span>
              )}

              {/* Badges */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none border shrink-0 ${
                  collapsed 
                    ? 'absolute top-1.5 right-1.5 bg-red-600 text-white border-white scale-75'
                    : isActive 
                      ? 'bg-white text-[#1F1F1F] border-[#E3E3E3]' 
                      : 'bg-[#5F6368] text-white border-transparent'
                }`}>
                  {item.badge}
                </span>
              )}

              {collapsed && (
                <div className="absolute left-24 bg-gray-950 text-white text-xs py-1 px-2.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap shadow-md z-40">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Guardian Status widget added for Editorial Theme */}
      {!collapsed && (
        <div className="mx-4 my-2.5 p-4 bg-[#F9FAFB] rounded-[24px] border border-[#E3E3E3] select-none shrink-0">
          <p className="text-[10px] font-semibold text-[#757575] uppercase tracking-wider leading-none font-display">Status</p>
          <p className="text-xs font-medium text-[#1F1F1F] mt-1.5 font-sans">Accuracy: 98.2%</p>
        </div>
      )}

      {/* Authenticated user segment block / permanent bottom logout panel */}
      <div className="p-4 border-t border-[#E3E3E3] bg-white select-none shrink-0" id="sidebar-bottom-panel">
        <div className={`flex flex-col gap-3 ${collapsed ? 'items-center' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 p-2 bg-[#F9FAFB] rounded-[24px] border border-[#E3E3E3]">
              {/* Circular user branding */}
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-[#E3E3E3]">
                <span className="font-display font-medium text-[#1F1F1F] text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0" id="user-profile-meta-sidebar">
                <h4 className="text-xs font-semibold text-[#1F1F1F] truncate leading-tight">{user.name}</h4>
                <p className="text-[10px] text-[#757575] truncate mt-0.5" title={user.storeName}>{user.storeName}</p>
                <span className="inline-block px-1.5 py-0.5 mt-1 text-[8px] font-semibold text-[#1F1F1F] bg-white border border-[#E3E3E3] rounded-full uppercase leading-none">
                  {user.role}
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              collapsed 
                ? 'bg-transparent text-red-600 hover:bg-red-50 p-2.5' 
                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-transparent'
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 stroke-[1.5]" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Center-aligned Logout Confirmation Modal with serene premium tokens */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-[28px] border border-[#E3E3E3] p-6 text-center shadow-lg animate-fade-in">
            <h3 className="text-lg font-semibold font-display text-[#1F1F1F] mb-2">Confirm Logout</h3>
            <p className="text-xs text-[#757575] font-sans leading-relaxed mb-6">
              Are you sure you want to log out of eenvoq? Your current session memory context will be compiled and completed.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-2.5 rounded-full border border-[#E3E3E3] bg-white text-xs font-semibold text-[#757575] hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="px-6 py-2.5 rounded-full bg-red-650 hover:bg-red-700 text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer animate-pulse-once"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
