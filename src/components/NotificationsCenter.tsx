import { Alert } from '../types';
import { 
  BellRing, ShieldCheck, AlertCircle, 
  Trash2, Mail, CheckCircle, Flame, Check, ArrowLeft
} from 'lucide-react';

interface NotificationsCenterProps {
  alerts: Alert[];
  onMarkAllRead: () => void;
  onClearAlert: (id: string) => void;
}

export default function NotificationsCenter({ alerts, onMarkAllRead, onClearAlert }: NotificationsCenterProps) {
  
  const handleMarkReadLocalAll = () => {
    onMarkAllRead();
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in text-left font-sans select-none text-zinc-300 w-full" id="notifications-center-viewport">
      
      {/* HEADER SECTION - SAME AS HOME DASHBOARD STYLE */}
      <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-none" id="notifications-header-nav">
        {/* Left Side: Store Identity & QuickBooks logo */}
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded bg-[#db2777] flex items-center justify-center text-white font-bold text-lg shadow-none shrink-0 select-none lowercase font-sans">
            ev
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md font-sans">
                Intelligence Security Alerts
              </h2>
              <span className="bg-pink-950/40 text-[#db2777] text-[9px] font-bold px-2 py-0.5 rounded border border-[#db2777]/35 uppercase tracking-widest shrink-0 font-mono">
                System Alerts
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Critical ledger warnings, inventory alerts, and transaction verification exceptions.
            </p>
          </div>
        </div>

        <button
          onClick={handleMarkReadLocalAll}
          className="bg-[#db2777] hover:bg-[#c02164] text-white font-bold py-1.5 px-3 rounded text-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Mark all as Checked</span>
        </button>
      </div>

      {/* Main notifications stream stack list */}
      <div className="bg-[#0e0e11] rounded-lg border border-[#27272a] shadow-none overflow-hidden flex flex-col" id="notifications-stack-list">
        <div className="p-4 border-b border-[#27272a] bg-[#18181b] flex justify-between select-none items-center">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Alert Chronicles ({alerts.length})</span>
          <span className="text-[10px] text-zinc-500 font-mono">Real-time telemetry</span>
        </div>

        <div className="divide-y divide-[#27272a] min-h-[350px]" id="notifications-rows">
          {alerts.map((alert) => {
            return (
              <div 
                key={alert.id}
                className={`p-5 flex items-start justify-between gap-4 transition-all hover:bg-zinc-900/40 ${
                  !alert.read ? 'bg-pink-950/20 border-l-4 border-[#db2777]' : ''
                }`}
              >
                {/* Visual priority avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                  alert.priority === 'critical' ? 'bg-[#ffedfa]/10 border-pink-900/40 text-pink-400' :
                  alert.priority === 'high' ? 'bg-amber-950/20 border-amber-900/30 text-amber-500' :
                  'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}>
                  {alert.priority === 'critical' ? <Flame className="w-5 h-5 animate-pulse stroke-[1.5]" /> : <AlertCircle className="w-5 h-5 stroke-[1.5]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 select-none font-sans">
                    <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{alert.category}</span>
                    <span className="text-zinc-700 font-mono">•</span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      {new Date(alert.timestamp).toLocaleDateString()} at {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!alert.read && (
                      <span className="text-[8px] bg-[#db2777] text-white font-bold px-2 py-0.5 rounded-full font-mono uppercase">New</span>
                    )}
                  </div>
                  <h4 className={`text-xs font-bold font-sans ${!alert.read ? 'text-white' : 'text-zinc-400'}`}>{alert.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 pr-4 leading-relaxed font-sans font-normal">{alert.description}</p>
                </div>

                <button
                  onClick={() => onClearAlert(alert.id)}
                  className="p-2 rounded-full text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition cursor-pointer self-center"
                  title="Clear notification alert"
                >
                  <Trash2 className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            );
          })}

          {alerts.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16 text-center select-none" id="notifications-empty">
               <CheckCircle className="w-10 h-10 text-emerald-500 mb-3 stroke-[1.5]" />
              <p className="text-xs font-normal text-zinc-500 max-w-sm leading-relaxed">All alerts are cleared! Your retail guardian workspace is secure.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
