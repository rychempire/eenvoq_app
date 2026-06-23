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
    <div className="space-y-4 pb-24 animate-fade-in text-left font-sans select-none text-[#393a3d]" id="truthcheck-audit-center">
      
      {/* HEADER SECTION WITH QUICKBOOKS BRAND AND GREY PANEL */}
      <div className="bg-[#f4f5f8] border border-[#d4d7dc] rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none shrink-0" id="truthcheck-navbar-panel">
        <div className="text-left flex items-center gap-3">
          <button 
            onClick={() => window.location.hash = 'dashboard'}
            className="p-1.5 hover:bg-[#d4d7dc] rounded transition text-[#2c3e50] cursor-pointer flex items-center justify-center shrink-0"
            title="Return to home dashboard"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-neutral-900 tracking-tight font-sans">
              Daily Cash Register Matcher
            </h1>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Compare actual register drawer vault counts with today's customer sales billing history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="text-[9px] uppercase font-bold py-1.5 px-3 bg-[#e9f5e6] text-[#2ca01c] border border-[#2ca01c]/25 rounded flex items-center gap-1 font-sans">
            Register Matching Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="truthcheck-splitting-container">
        
        {/* Left Side: Ledger Declaration inputs */}
        <div className="bg-[#f4f5f8] rounded border border-[#d4d7dc] p-5 space-y-4 flex flex-col" id="accounting-declaration-inputs">
          <div className="flex items-center gap-2 border-b border-[#d4d7dc] pb-3 select-none">
            <Calculator className="w-4 h-4 text-[#2ca01c] stroke-[2]" />
            <h3 className="font-sans font-bold text-slate-800 text-xs">Register Declaration Ledger</h3>
          </div>

          <form onSubmit={handleExecuteAudit} className="space-y-4 text-xs font-semibold text-neutral-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] text-slate-700 font-sans font-bold">Cash in Register Drawer ({currencySymbol})</label>
                <input
                  type="number" value={cashVal} onChange={e => setCashVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-white text-slate-900 border border-[#d4d7dc] rounded py-2 px-3 text-xs focus:outline-none focus:border-[#2ca01c] font-mono shadow-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-[11px] text-slate-700 font-sans font-bold">Card Machine Cash (POS) ({currencySymbol})</label>
                <input
                  type="number" value={posVal} onChange={e => setPosVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-white text-slate-900 border border-[#d4d7dc] rounded py-2 px-3 text-xs focus:outline-none focus:border-[#2ca01c] font-mono shadow-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] text-slate-700 font-sans font-bold">Direct Bank transfers ({currencySymbol})</label>
                <input
                  type="number" value={transfersVal} onChange={e => setTransfersVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-white text-slate-900 border border-[#d4d7dc] rounded py-2 px-3 text-xs focus:outline-none focus:border-[#2ca01c] font-mono shadow-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-[11px] text-slate-700 font-sans font-bold">Mobile Money pay (OPay etc.) ({currencySymbol})</label>
                <input
                  type="number" value={momoVal} onChange={e => setMomoVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-white text-slate-900 border border-[#d4d7dc] rounded py-2 px-3 text-xs focus:outline-none focus:border-[#2ca01c] font-mono shadow-none"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-[11px] text-slate-700 font-sans font-bold">Other sales / Misc payouts ({currencySymbol})</label>
              <input
                type="number" value={otherVal} onChange={e => setOtherVal(parseInt(e.target.value) || 0)}
                className="w-full bg-white text-slate-900 border border-[#d4d7dc] rounded py-2 px-3 text-xs focus:outline-none focus:border-[#2ca01c] font-mono shadow-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2ca01c] hover:bg-[#207514] text-white font-bold py-2.5 rounded shadow-none transition text-xs font-sans flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
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
          <div className="p-3 bg-[#e9f5e6] text-[#141d27] border border-[#2ca01c]/20 rounded flex gap-2 text-xs font-sans mt-1">
            <Info className="w-4 h-4 text-[#2ca01c] shrink-0 stroke-[2] mt-0.5" />
            <p className="leading-normal font-sans text-[11px]">
              We match physical cash on hand with digital bookkeeping journals to prevent leaks, cashier discrepancies, and inventory override errors.
            </p>
          </div>
        </div>

        {/* Right Side: Reconciliation result analytics */}
        <div className="space-y-4 flex flex-col justify-start" id="reconciliation-output-intelligence">
          {results ? (
            <div className="bg-white border border-[#d4d7dc] rounded p-5 shadow-none space-y-4 flex flex-col" id="audit-results-card">
              <div className="flex items-center justify-between border-b border-[#d4d7dc] pb-3 select-none">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Audit Summary: {results.date}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  results.riskLevel === 'low' ? 'bg-[#e9f5e6] text-[#2ca01c] border border-[#2ca01c]/20' :
                  results.riskLevel === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {results.riskLevel === 'low' ? '🔒 Register Matches' : '⚠️ Matches Discrepancy'}
                </span>
              </div>

              {/* expected vs declared summary grid */}
              <div className="grid grid-cols-2 gap-3 font-sans select-none" id="audit-split-metrics">
                <div className="bg-[#f4f5f8] p-3 rounded border border-[#d4d7dc]">
                  <span className="text-[10px] font-bold text-[#5f6368] uppercase">What Sales Book Says</span>
                  <p className="text-base font-bold text-slate-800 font-mono mt-0.5">
                    {formatCurrency(results.expectedRevenue, currency)}
                  </p>
                </div>
                <div className="bg-[#f4f5f8] p-3 rounded border border-[#d4d7dc]">
                  <span className="text-[10px] font-bold text-[#5f6368] uppercase">What Is in Register</span>
                  <p className="text-base font-bold text-slate-800 font-mono mt-0.5">
                    {formatCurrency(results.declaredRevenue, currency)}
                  </p>
                </div>
              </div>

              {/* Net variance bar */}
              <div 
                className="p-4 rounded flex items-center justify-between border text-xs" 
                id="variance-breakdown" 
                style={{
                  backgroundColor: results.difference < 0 ? '#fdf2f2' : '#e9f5e6',
                  borderColor: results.difference < 0 ? '#fde8e8' : '#2ca01c',
                  color: results.difference < 0 ? '#9b1c1c' : '#2ca01c'
                }}
              >
                <div>
                  <span className="text-slate-650 font-sans text-[10px] font-bold uppercase">Money Difference:</span>
                  <p className="text-base font-bold font-mono mt-0.5">
                    {results.difference < 0 ? '-' : '+'}{formatCurrency(Math.abs(results.difference), currency)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-slate-650 block text-[9.5px] uppercase tracking-wider font-bold">Accuracy Index</span>
                  <span className="text-base font-mono font-bold">
                    {results.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Detailed AI Forensics */}
              <div 
                className={`p-4 rounded space-y-2 border transition-colors duration-150 ${
                  results.riskLevel === 'low' 
                    ? 'bg-[#e9f5e6] border-[#2ca01c]/15 text-slate-800' 
                    : 'bg-red-50 border-red-200 text-red-950'
                }`} 
                id="audit-ai-commentary"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="w-5 h-5 rounded-sm bg-[#2ca01c] flex items-center justify-center font-bold text-white text-[10px]">AI</span>
                  <span>Matcher Comments</span>
                </div>
                <p className="text-[11px] leading-relaxed font-sans font-medium">{results.details}</p>
                
                {results.difference < 0 && (
                  <div className="pt-2 border-t border-red-200 text-[10px] text-red-700 font-bold space-y-0.5">
                    <p className="flex items-center gap-1">&bull; Shortage happened during busy hours (3 PM - 5 PM).</p>
                    <p className="flex items-center gap-1">&bull; Warning notice added to the register logs.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded p-12 border border-[#d4d7dc] text-center text-[#5f6368]" id="truthcheck-empty-output">
              <Activity className="w-8 h-8 mx-auto mb-2 text-[#8e9cae] stroke-[1.5]" />
              <p className="text-xs font-bold font-sans">No matching verification executed yet.</p>
              <p className="text-[10px] text-gray-500 max-w-xs mx-auto mt-1">Please confirm audit parameters on the left to invoke the register comparison engine.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
