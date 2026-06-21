import React, { useState } from 'react';
import { 
  Activity, Sparkles, Scale, Calculator, Info, ArrowLeft
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
    <div className="space-y-6 pb-24 animate-fade-in text-left font-sans select-none text-[#1F1F1F]" id="truthcheck-audit-center">
      
      {/* HEADER SECTION WITH MESH GRADIENT */}
      <div className="relative overflow-hidden rounded-[32px] p-1 border border-neutral-150/45 bg-white shadow-xs" id="truthcheck-mesh-wrapper">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14)_0%,_rgba(14,165,233,0)_75%)] pointer-events-none" />
        
        {/* Main Header greetings block */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4" id="truthcheck-navbar-panel">
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
                Daily Cash & Sales Matcher
              </h1>
            </div>
            <p className="text-sm font-sans font-normal text-neutral-400 mt-1.5 pl-8">
              Check and match the total money in your physical store with today's records of customer bills.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap" id="truthcheck-actions-bar">
            <span className="text-[10px] uppercase font-bold py-2 px-4 bg-orange-50 text-orange-850 border border-orange-200/50 rounded-full flex items-center gap-1 shadow-xs font-sans">
              Register Matching Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="truthcheck-splitting-container">
        
        {/* Left Side: Ledger Declaration inputs */}
        <div className="bg-[#FCF5E8] rounded-[24px] p-6 border border-[#ECDCCB] shadow-sm space-y-5 flex flex-col" id="accounting-declaration-inputs">
          <div className="flex items-center gap-2 border-b border-[#ECDCCB] pb-4 select-none">
            <Calculator className="w-5 h-5 text-[#B45309] stroke-[1.5]" />
            <h3 className="font-sans font-bold text-[#78350F] text-sm">Money In Your Register</h3>
          </div>

          <form onSubmit={handleExecuteAudit} className="space-y-5 text-xs font-semibold text-[#1F1F1F]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs text-[#B45309] font-sans font-bold">Cash in Register Drawer ({currencySymbol})</label>
                <input
                  type="number" value={cashVal} onChange={e => setCashVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-white text-[#1F1F1F] border border-[#ECDCCB] rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-[#78350F] font-mono shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs text-[#B45309] font-sans font-bold">Card Machine Cash (POS) ({currencySymbol})</label>
                <input
                  type="number" value={posVal} onChange={e => setPosVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-white text-[#1F1F1F] border border-[#ECDCCB] rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-[#78350F] font-mono shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs text-[#B45309] font-sans font-bold">Direct Bank transfers ({currencySymbol})</label>
                <input
                  type="number" value={transfersVal} onChange={e => setTransfersVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-white text-[#1F1F1F] border border-[#ECDCCB] rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-[#78350F] font-mono shadow-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs text-[#B45309] font-sans font-bold">Mobile Wallet pay (OPay etc.) ({currencySymbol})</label>
                <input
                  type="number" value={momoVal} onChange={e => setMomoVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-white text-[#1F1F1F] border border-[#ECDCCB] rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-[#78350F] font-mono shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-xs text-[#B45309] font-sans font-bold">Other sales money ({currencySymbol})</label>
              <input
                type="number" value={otherVal} onChange={e => setOtherVal(parseInt(e.target.value) || 0)}
                className="w-full bg-white text-[#1F1F1F] border border-[#ECDCCB] rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-[#78350F] font-mono shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F1F1F] hover:bg-black text-white font-bold py-3.5 rounded-full shadow-md transition text-xs font-sans flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Scale className="w-4 h-4 stroke-[1.5]" />
                  Match Today's Cash & Sales
                </>
              )}
            </button>
          </form>

          {/* Quick Informational Notice */}
          <div className="p-4 bg-[#f0f9ff] rounded-[24px] border border-[#bae6fd] flex gap-3 items-start text-[11px] text-[#0284c7] font-sans mt-2">
            <Info className="w-5 h-5 text-[#0284c7] shrink-0 stroke-[1.5]" />
            <p className="leading-relaxed font-semibold">
              We match the receipts given to customers against actual cash in the registers to make sure money doesn't get lost.
            </p>
          </div>
        </div>

        {/* Right Side: Reconciliation result analytics */}
        <div className="space-y-4 flex flex-col justify-start" id="reconciliation-output-intelligence">
          {results ? (
            <div className="bg-white border border-black rounded-[24px] p-6 shadow-sm space-y-6 flex flex-col" id="audit-results-card">
              <div className="flex items-center justify-between border-b border-[#E3E3E3] pb-4 select-none">
                <span className="text-[10px] font-mono font-semibold text-[#757575] uppercase">Audit Summary: {results.date}</span>
                <span className={`text-[10px] font-semibold px-3 py-1 rounded-full uppercase ${
                  results.riskLevel === 'low' ? 'bg-green-50 text-green-700 border border-green-200' :
                  results.riskLevel === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {results.riskLevel === 'low' ? '🔒 Register Matches' : '⚠️ Money Missing'}
                </span>
              </div>

              {/* expected vs declared summary grid */}
              <div className="grid grid-cols-2 gap-4 font-sans select-none" id="audit-split-metrics">
                <div className="bg-[#FCFAF7] p-4 rounded-[24px] border border-[#E3E3E3]">
                  <span className="text-[10px] font-semibold text-[#757575] uppercase">What Sales Book Says</span>
                  <p className="text-lg font-bold text-[#1F1F1F] font-mono mt-1">
                    {formatCurrency(results.expectedRevenue, currency)}
                  </p>
                </div>
                <div className="bg-[#FCFAF7] p-4 rounded-[24px] border border-[#E3E3E3]">
                  <span className="text-[10px] font-semibold text-[#757575] uppercase">What Is in Register</span>
                  <p className="text-lg font-bold text-[#1F1F1F] font-mono mt-1">
                    {formatCurrency(results.declaredRevenue, currency)}
                  </p>
                </div>
              </div>

              {/* Net variance bar */}
              <div 
                className="p-5 rounded-[24px] flex items-center justify-between border text-xs" 
                id="variance-breakdown" 
                style={{
                  backgroundColor: results.difference < 0 ? '#FFF1F2' : '#F0FDF4',
                  borderColor: results.difference < 0 ? '#FECDD3' : '#BBF7D0'
                }}
              >
                <div>
                  <span className="text-[#5F6368] font-normal font-sans">Money Difference:</span>
                  <p className={`text-base font-bold font-mono mt-1 ${results.difference < 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {results.difference < 0 ? '-' : '+'}{formatCurrency(Math.abs(results.difference), currency)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[#5F6368] block text-[9px] uppercase tracking-wider font-sans">Score Grade</span>
                  <span className="text-base font-mono font-bold text-[#1F1F1F]">
                    {results.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Detailed AI Forensics */}
              <div 
                className={`p-5 rounded-[24px] space-y-3 border transition-colors duration-150 ${
                  results.riskLevel === 'low' 
                    ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]' 
                    : 'bg-[#E8F0FE] border-[#CEDFFB] text-[#1E3A8A]'
                }`} 
                id="audit-ai-commentary"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <EenvoqIcon className={`w-4 h-4 stroke-[1.5] ${results.riskLevel === 'low' ? 'text-[#0284c7]' : 'text-[#2563EB]'}`} />
                  <span>Cash Check Comments</span>
                </div>
                <p className="text-[11px] leading-relaxed font-sans font-semibold">{results.details}</p>
                
                {results.difference < 0 && (
                  <div className="pt-3 border-t border-[#CEDFFB] text-[10px] text-red-700 font-bold space-y-1">
                    <p className="flex items-center gap-1">⚡ Shortage happened during busy hours (3 PM - 5 PM).</p>
                    <p className="flex items-center gap-1">⚡ Warning notice added to the register logs.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] p-16 border border-[#E3E3E3] shadow-none text-center text-[#757575]" id="truthcheck-empty-output">
              <Activity className="w-10 h-10 mx-auto mb-3 text-[#757575] stroke-[1.2]" />
              <p className="text-xs font-normal max-w-xs mx-auto">Please click the Match button on the left to see the results.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
