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
    <div className="space-y-8 animate-fade-in" id="notifications-center-viewport">
      
      {/* Header bar */}
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
            <h1 className="text-[22px] font-sans font-semibold text-[#1F1F1F] tracking-tight">Intelligence Notifications</h1>
          </div>
          <p className="text-xs text-[#757575] font-normal mt-1 font-sans ml-11">Critical ledger warnings, inventory alerts, and transaction verification exceptions compiled by eenvoq.</p>
        </div>

        <button
          onClick={handleMarkReadLocalAll}
          className="bg-white border border-[#E3E3E3] hover:bg-gray-50 text-[#1F1F1F] font-semibold py-3 px-6 rounded-full text-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-none"
        >
          <Check className="w-4 h-4 stroke-[1.5]" />
          Mark all as Checked
        </button>
      </div>

      {/* Main notifications stream stack list */}
      <div className="bg-white/70 backdrop-blur rounded-[24px] border border-[#E3E3E3] shadow-sm overflow-hidden flex flex-col" id="notifications-stack-list">
        <div className="p-5 border-b border-[#E3E3E3] bg-transparent flex justify-between select-none items-center">
          <span className="text-[10px] font-bold text-[#757575] uppercase tracking-wider font-sans">Alert Chronicles ({alerts.length})</span>
          <span className="text-[10px] text-[#757575] font-mono">Real-time telemetry</span>
        </div>

        <div className="divide-y divide-[#E3E3E3] min-h-[350px]" id="notifications-rows">
          {alerts.map((alert) => {
            return (
              <div 
                key={alert.id}
                className={`p-5 flex items-start justify-between gap-4 transition-all hover:bg-[#FAF9F5]/70 ${
                  !alert.read ? 'bg-[#E8F0FE]/50 border-l-4 border-black' : ''
                }`}
              >
                {/* Visual priority avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                  alert.priority === 'critical' ? 'bg-[#FCF5E8] border-[#ECDCCB] text-[#78350F]' :
                  alert.priority === 'high' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                  'bg-[#E6F4EA] border-[#CCD7CE] text-[#137333]'
                }`}>
                  {alert.priority === 'critical' ? <Flame className="w-5 h-5 animate-pulse stroke-[1.5]" /> : <AlertCircle className="w-5 h-5 stroke-[1.5]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 select-none font-sans">
                    <span className="font-mono text-[9px] font-bold text-[#757575] uppercase tracking-wider">{alert.category}</span>
                    <span className="text-gray-300 font-mono">•</span>
                    <span className="text-[9px] text-[#757575] font-mono">
                      {new Date(alert.timestamp).toLocaleDateString()} at {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!alert.read && (
                      <span className="text-[8px] bg-black text-white font-bold px-2 py-0.5 rounded-full font-mono uppercase">New</span>
                    )}
                  </div>
                  <h4 className={`text-xs font-bold font-sans ${!alert.read ? 'text-[#1F1F1F]' : 'text-[#5F6368]'}`}>{alert.title}</h4>
                  <p className="text-xs text-[#5F6368] mt-1 pr-4 leading-relaxed font-sans font-normal">{alert.description}</p>
                </div>

                <button
                  onClick={() => onClearAlert(alert.id)}
                  className="p-2 rounded-full text-[#757575] hover:text-red-500 hover:bg-gray-100 transition cursor-pointer self-center"
                  title="Clear notification alert"
                >
                  <Trash2 className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            );
          })}

          {alerts.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16 text-center select-none" id="notifications-empty">
              <CheckCircle className="w-10 h-10 text-green-700 mb-3 stroke-[1.5]" />
              <p className="text-xs font-normal text-[#757575] max-w-sm leading-relaxed">All alerts are cleared! Your retail guardian workspace is secure.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
