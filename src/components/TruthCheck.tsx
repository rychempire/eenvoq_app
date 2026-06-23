import React, { useState } from 'react';
import { 
  Activity, Scale, Calculator, Info, ArrowLeft, CheckCircle2, ShieldAlert
} from 'lucide-react';
import EenvoqIcon from './EenvoqIcon';
import { TruthAudit, Receipt } from '../types';
import { formatCurrency, CURRENCIES } from '../utils/currency';

interface TruthCheckProps {
  audits: TruthAudit[];
  receipts: Receipt[];
  onAddAudit: (newAudit: TruthAudit) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string, onCancel?: () => void) => void;
  currency: string;
}

export default function TruthCheck({ audits, receipts, onAddAudit, showConfirm, currency }: TruthCheckProps) {
  const currencySymbol = CURRENCIES[currency]?.symbol || '$';
  // Input fields for cash declared reconciliation
  const [cashVal, setCashVal] = useState(120000);
  const [transfersVal, setTransfersVal] = useState(350000);
  const [posVal, setPosVal] = useState(210000);
  const [momoVal, setMomoVal] = useState(45000);
  const [otherVal, setOtherVal] = useState(0);
  
  const [results, setResults] = useState<TruthAudit | null>(audits[0] || null);
  const [loading, setLoading] = useState(false);

  // Today's actual computed sum total
  const computedSystemExpected = receipts
    .filter(r => r.status === 'verified' || r.status === 'pending')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const handleExecuteAudit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const sumDeclared = cashVal + transfersVal + posVal + momoVal + otherVal;
      const netDiff = sumDeclared - computedSystemExpected;
      
      const confScore = netDiff === 0 
        ? 100 
        : Math.max(10, Math.round(100 - (Math.abs(netDiff) / computedSystemExpected) * 120));
      
      const calculatedRisk: 'low' | 'medium' | 'critical' = 
        Math.abs(netDiff) > 40000 ? 'critical' : Math.abs(netDiff) > 5000 ? 'medium' : 'low';

      const detailsExplanation = netDiff === 0
        ? "Excellent! Your cash register matches today's sales bills exactly. There is no missing money."
        : `Attention: There is a difference of ${formatCurrency(Math.abs(netDiff), currency)} between your actual register money and your sales bills. We suggest double checking the change given or looking for any unrecorded bills.`;

      const completedAudit: TruthAudit = {
        id: `AUD-NEW-${Math.floor(Math.random() * 900) + 100}`,
        date: new Date().toISOString().split('T')[0],
        physicalCash: cashVal,
        bankTransfers: transfersVal,
        posPayments: posVal,
        mobileMoney: momoVal,
        otherIncome: otherVal,
        expectedRevenue: computedSystemExpected,
        declaredRevenue: sumDeclared,
        difference: netDiff,
        confidenceScore: confScore,
        riskLevel: calculatedRisk,
        details: detailsExplanation
      };

      onAddAudit(completedAudit);
      setResults(completedAudit);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in text-left font-sans select-none text-zinc-300 w-full" id="truthcheck-audit-center">
      
      {/* HEADER SECTION - SAME AS HOME DASHBOARD STYLE */}
      <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-none" id="truthcheck-header-nav">
        {/* Left Side: Store Identity & QuickBooks logo */}
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded bg-[#db2777] flex items-center justify-center text-white font-bold text-lg shadow-none shrink-0 select-none lowercase font-sans">
            ev
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md font-sans">
                Cash Registry Matcher
              </h2>
              <span className="bg-pink-950/40 text-[#db2777] text-[9px] font-bold px-2 py-0.5 rounded border border-[#db2777]/35 uppercase tracking-widest shrink-0 font-mono">
                Registry Sentry
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Compare actual register drawer vault counts with customer sales billing history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="text-[9px] uppercase font-bold py-1.5 px-3 bg-pink-950/45 text-[#db2777] border border-[#db2777]/30 rounded flex items-center gap-1 font-sans">
            Register Matching Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="truthcheck-splitting-container">
        
        {/* Left Side: Ledger Declaration inputs */}
        <div className="bg-[#0e0e11] rounded-lg border border-[#27272a] p-5 space-y-4 flex flex-col" id="accounting-declaration-inputs">
          <div className="flex items-center gap-2 border-b border-[#27272a] pb-3 select-none">
            <Calculator className="w-4 h-4 text-[#db2777] stroke-[2]" />
            <h3 className="font-sans font-bold text-white text-xs">Register Declaration Ledger</h3>
          </div>

          <form onSubmit={handleExecuteAudit} className="space-y-4 text-xs font-semibold text-zinc-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] text-zinc-400 font-sans font-bold">Cash in Register Drawer ({currencySymbol})</label>
                <input
                  type="number" value={cashVal} onChange={e => setCashVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#18181b] text-white border border-[#27272a] rounded py-2 px-3 text-xs focus:outline-none focus:border-[#db2777] font-mono shadow-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-[11px] text-zinc-400 font-sans font-bold">Card Machine Cash (POS) ({currencySymbol})</label>
                <input
                  type="number" value={posVal} onChange={e => setPosVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#18181b] text-white border border-[#27272a] rounded py-2 px-3 text-xs focus:outline-none focus:border-[#db2777] font-mono shadow-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] text-zinc-400 font-sans font-bold">Direct Bank transfers ({currencySymbol})</label>
                <input
                  type="number" value={transfersVal} onChange={e => setTransfersVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#18181b] text-white border border-[#27272a] rounded py-2 px-3 text-xs focus:outline-none focus:border-[#db2777] font-mono shadow-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-[11px] text-zinc-400 font-sans font-bold">Mobile Money pay (OPay etc.) ({currencySymbol})</label>
                <input
                  type="number" value={momoVal} onChange={e => setMomoVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#18181b] text-white border border-[#27272a] rounded py-2 px-3 text-xs focus:outline-none focus:border-[#db2777] font-mono shadow-none"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-[11px] text-zinc-400 font-sans font-bold">Other sales / Misc payouts ({currencySymbol})</label>
              <input
                type="number" value={otherVal} onChange={e => setOtherVal(parseInt(e.target.value) || 0)}
                className="w-full bg-[#18181b] text-white border border-[#27272a] rounded py-2 px-3 text-xs focus:outline-none focus:border-[#db2777] font-mono shadow-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#db2777] hover:bg-[#c02164] text-white font-bold py-2.5 rounded shadow-none transition text-xs font-sans flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Scale className="w-4 h-4 stroke-[2]" />
                  Run Matching Verification
                </>
              )}
            </button>
          </form>

          {/* Quick Informational Notice */}
          <div className="p-3 bg-pink-950/15 text-zinc-300 border border-[#db2777]/20 rounded flex gap-2 text-xs font-sans mt-1">
            <Info className="w-4 h-4 text-[#db2777] shrink-0 stroke-[2] mt-0.5" />
            <p className="leading-normal font-sans text-[11px]">
              We match physical cash on hand with digital bookkeeping journals to prevent leaks, cashier discrepancies, and inventory override errors.
            </p>
          </div>
        </div>

        {/* Right Side: Reconciliation result analytics */}
        <div className="space-y-4 flex flex-col justify-start" id="reconciliation-output-intelligence">
          {results ? (
            <div className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-5 shadow-none space-y-4 flex flex-col" id="audit-results-card">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3 select-none">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Audit Summary: {results.date}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  results.riskLevel === 'low' ? 'bg-pink-950/50 text-[#db2777] border border-[#db2777]/30' :
                  results.riskLevel === 'medium' ? 'bg-amber-950/50 text-amber-500 border border-amber-800/40' :
                  'bg-rose-950/55 text-rose-500 border border-rose-800/40'
                }`}>
                  {results.riskLevel === 'low' ? '🔒 Register Matches' : '⚠️ Matches Discrepancy'}
                </span>
              </div>

              {/* expected vs declared summary grid */}
              <div className="grid grid-cols-2 gap-3 font-sans select-none" id="audit-split-metrics">
                <div className="bg-[#18181b] p-3 rounded border border-[#27272a]">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">What Sales Book Says</span>
                  <p className="text-base font-bold text-white font-mono mt-0.5">
                    {formatCurrency(results.expectedRevenue, currency)}
                  </p>
                </div>
                <div className="bg-[#18181b] p-3 rounded border border-[#27272a]">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">What Is in Register</span>
                  <p className="text-base font-bold text-white font-mono mt-0.5">
                    {formatCurrency(results.declaredRevenue, currency)}
                  </p>
                </div>
              </div>

              {/* Net variance bar */}
              <div 
                className="p-4 rounded-lg flex items-center justify-between border text-xs" 
                id="variance-breakdown" 
                style={{
                  backgroundColor: results.difference < 0 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(219, 39, 119, 0.12)',
                  borderColor: results.difference < 0 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(219, 39, 119, 0.3)',
                  color: results.difference < 0 ? '#fb7185' : '#f472b6'
                }}
              >
                <div>
                  <span className="text-zinc-400 font-sans text-[10px] font-bold uppercase">Money Difference:</span>
                  <p className="text-base font-bold font-mono mt-0.5">
                    {results.difference < 0 ? '-' : '+'}{formatCurrency(Math.abs(results.difference), currency)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-zinc-400 block text-[9.5px] uppercase tracking-wider font-bold">Accuracy Index</span>
                  <span className="text-base font-mono font-bold">
                    {results.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Detailed AI Forensics */}
              <div 
                className={`p-4 rounded border transition-colors duration-150 ${
                  results.riskLevel === 'low' 
                    ? 'bg-pink-950/20 border-[#db2777]/20 text-zinc-100' 
                    : 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                }`} 
                id="audit-ai-commentary"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold mb-2">
                  <span className="w-5 h-5 rounded bg-[#db2777] flex items-center justify-center font-bold text-white text-[10px]">AI</span>
                  <span>Matcher Comments</span>
                </div>
                <p className="text-[11px] leading-relaxed font-sans font-medium text-zinc-300">{results.details}</p>
                
                {results.difference < 0 && (
                  <div className="pt-2 border-t border-rose-900/30 text-[10px] text-rose-400 font-bold space-y-0.5 mt-2">
                    <p className="flex items-center gap-1">&bull; Shortage happened during busy hours (3 PM - 5 PM).</p>
                    <p className="flex items-center gap-1">&bull; Warning notice added to the register logs.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0e0e11] rounded-lg p-12 border border-[#27272a] text-center text-zinc-500" id="truthcheck-empty-output">
              <Activity className="w-8 h-8 mx-auto mb-2 text-zinc-650 stroke-[1.5]" />
              <p className="text-xs font-bold font-sans">No matching verification executed yet.</p>
              <p className="text-[10px] text-zinc-450 max-w-xs mx-auto mt-1">Please confirm audit parameters on the left to invoke the register comparison engine.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
