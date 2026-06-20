import React from 'react';
import { ShieldCheck, FileText, Cookie, X } from 'lucide-react';

interface LegalPoliciesProps {
  activeTab: 'terms' | 'privacy' | 'cookie';
  onClose: () => void;
}

export default function LegalPolicies({ activeTab, onClose }: LegalPoliciesProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/45 backdrop-blur-sm animate-fade-in" id="legal-policies-overlay">
      <div 
        className="fixed inset-0 pointer-events-auto" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-[28px] border border-neutral-200 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl flex flex-col pointer-events-auto text-[#1F1F1F]">
        
        {/* Header Block */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            {activeTab === 'terms' && <FileText className="w-5 h-5 text-sky-600 stroke-[1.5]" />}
            {activeTab === 'privacy' && <ShieldCheck className="w-5 h-5 text-emerald-600 stroke-[1.5]" />}
            {activeTab === 'cookie' && <Cookie className="w-5 h-5 text-amber-600 stroke-[1.5]" />}
            
            <h2 className="text-lg font-sans font-black tracking-tight text-[#111111]">
              {activeTab === 'terms' && "Terms and Conditions"}
              {activeTab === 'privacy' && "Privacy and Data Protection Policy"}
              {activeTab === 'cookie' && "Cookie and Local Storage Policy"}
            </h2>
          </div>
          
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-700 transition"
            aria-label="Close legal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6 text-[#333333] font-sans text-xs pb-4 leading-relaxed font-normal overflow-y-auto">
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <p className="text-[#5F6368] font-mono text-[10px] uppercase font-bold">Effective Date: June 20, 2026</p>
              <p>
                Welcome to <strong>eenvoq</strong>. By using our bookkeeping security application, website, and dashboard, you agree to comply with and be bound by the following Terms and Conditions of service.
              </p>
              
              <h3 className="font-bold text-[#111111] text-sm pt-2">1. Scope of Agreement</h3>
              <p>
                This agreement governs your use of the eenvoq software-as-a-service platform, designed to provide cash ledger reconciliation, automated bill tracking, operator management, and inventory leakage diagnostics. Use is permitted only to business operators who have authorized administrative clearance.
              </p>

              <h3 className="font-bold text-[#111111] text-sm pt-2">2. User Account Security & PIN Handover</h3>
              <p>
                Account creators (Owners) can delegate checkout access to Team Members. Each Operator is assigned a secure Personal Identification Number (PIN). You agree that:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                <li>You are solely responsible for protecting register credentials and operator PIN codes.</li>
                <li>Sharing operator login codes with unauthorized cashiers is strictly prohibited.</li>
                <li>All transaction logs, deletions, and overrides recorded under an individual PIN are considered authorized by that team member.</li>
              </ul>

              <h3 className="font-bold text-[#111111] text-sm pt-2">3. Subscription, Renewal, and Billing</h3>
              <p>
                Subscribed users choose between standard Basic, Growth, and Institutional Enterprise tiers. Fees are charged periodically in USD ($) based on annual or monthly preferences. Subscriptions automatically renew unless cancelled through account settings prior to the billing date.
              </p>

              <h3 className="font-bold text-[#111111] text-sm pt-2">4. Disclaimers & Limitation of Liability</h3>
              <p>
                eenvoq leverages custom statistical reconciliation algorithms and diagnostic alerts to suggest cash leakage patterns. However, eenvoq does not act as a licensed financial auditor or security agency. We make no guarantees that our reports will prevent internal retail shrink, and in no event shall eenvoq be liable for direct or indirect business deficits, system down-times, or missing register journals.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <p className="text-[#5F6368] font-mono text-[10px] uppercase font-bold">Last Updated: June 20, 2026</p>
              <p>
                At <strong>eenvoq</strong>, we are committed to shielding your commercial records, sales books, and operator profiles. This Privacy Policy outlines how our application gathers, manages, and secures data.
              </p>

              <h3 className="font-bold text-[#111111] text-sm pt-2">1. Information We Collect</h3>
              <p>
                When you initiate registers matching, our software processes:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                <li><strong>Organizational Profile:</strong> Representative names, phone contacts, email indices, and regional currencies.</li>
                <li><strong>Daily Books & Ledgers:</strong> Cashier counts, POS card receipts, bank transfers, outstanding debts, and customer names.</li>
                <li><strong>Team Operator Profiles:</strong> Cashier names, operational roles, and assigned secure entry logs.</li>
              </ul>

              <h3 className="font-bold text-[#111111] text-sm pt-2">2. Use of Diagnostic Data</h3>
              <p>
                Collected data is processed server-side exclusively to render:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                <li>Reconciliation variance sheets and daily leakage diagnostics.</li>
                <li>Forensic Investigator logs indicating void percentages and register voids.</li>
                <li>Automated customer reminder routing for outstanding debts.</li>
              </ul>

              <h3 className="font-bold text-[#111111] text-sm pt-2">3. Data Security Measures</h3>
              <p>
                All data is encrypted in transit and stored in highly secure sandboxed environments. Operator PIN authorizations are protected by secure salts. eenvoq strictly enforces access boundaries so that cashiers cannot access high-level owner dashboard analytics or override historical reports. We never sell or share your business data with commercial third-party aggregators.
              </p>
            </div>
          )}

          {activeTab === 'cookie' && (
            <div className="space-y-4">
              <p className="text-[#5F6368] font-mono text-[10px] uppercase font-bold">Policy Updated: June 20, 2026</p>
              <p>
                <strong>eenvoq</strong> utilizes standard web cookies, Session storage, and Local Storage browser nodes to deliver a robust and rapid client-side experience. This policy explains what information is saved on your device.
              </p>

              <h3 className="font-bold text-[#111111] text-sm pt-2">1. Use of Cookies & Local Storage</h3>
              <p>
                Our application does not load tracking pixels or third-party advertising cookies. Instead, we use essential cookies and web storage to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-neutral-600">
                <li>
                  <strong>Session Preferences:</strong> Keep track of your selected workspace view, and active store operator selection.
                </li>
                <li>
                  <strong>Global Currency Settings:</strong> Remember whether your store uses USD ($), Naira (₦), Ghana cedis (₵), Kenyan shillings (KSh), Pounds (£), or Euros (€) so the figures render accurately on launch.
                </li>
                <li>
                  <strong>Temporary Offline Buffer:</strong> Store local receipts and ledger audits temporarily to protect against network drops.
                </li>
              </ul>

              <h3 className="font-bold text-[#111111] text-sm pt-2">2. Managing Store Memory</h3>
              <p>
                You can clear cookies and stored data through your browser preferences. Please note that clearing Local Storage will reset your customized currency settings back to our default USD ($) profile, and log your active operators out of their current terminals.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-neutral-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 md:py-2.5 bg-[#1F1F1F] hover:bg-black text-white rounded-full text-xs font-semibold cursor-pointer tracking-wide"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
}
