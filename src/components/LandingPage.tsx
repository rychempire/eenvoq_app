import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, Smartphone, RefreshCw, Zap, Users, Lock, 
  ChevronDown, ChevronUp, Star, ArrowLeft, ArrowRight as ArrowRightIcon,
  PlayCircle, Menu, X, Database, Eye, Bell, Sparkles, TrendingUp, Dot,
  Building, Landmark, Check, HelpCircle, CheckCircle2, MessageSquare, 
  Flame, Coins, History, BookOpen, Sliders, AlertTriangle, ArrowUpRight,
  Shield, CheckCircle, Smartphone as PhoneIcon
} from 'lucide-react';
import LegalPolicies from './LegalPolicies';

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const [activeLegalTab, setActiveLegalTab] = useState<'privacy' | 'terms' | 'cookie' | null>(null);
  const [activeSubPage, setActiveSubPage] = useState<'main' | 'blog' | 'terms' | 'privacy' | 'cookie'>('main');
  const [expandedBlogPost, setExpandedBlogPost] = useState<number | null>(null);
  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll reveal animation settings for scroll down & up responsive animations
  const scrollRevealProps = {
    initial: { opacity: 0, y: 35, scale: 0.98 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: false, amount: 0.12 },
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
  };

  const scrollRevealLeftProps = {
    initial: { opacity: 0, x: -30 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.12 },
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
  };

  const scrollRevealRightProps = {
    initial: { opacity: 0, x: 30 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.12 },
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
  };

  const renderBusinessLogo = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="p-1.5 bg-sky-50 rounded-lg text-sky-600 border border-sky-100 shrink-0">
              <Building className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight shrink-0">
              <span className="font-extrabold text-neutral-900 text-xs md:text-sm tracking-tight font-sans">sadiq</span>
              <span className="text-sky-500 font-extrabold text-xs md:text-sm font-sans">.</span>
              <span className="text-[8px] text-neutral-400 block font-mono uppercase tracking-wider font-semibold leading-none">distributors</span>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100 shrink-0">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight shrink-0">
              <span className="font-bold text-[#1e1b4b] text-[10px] md:text-[11px] tracking-widest font-sans uppercase">Adebayo</span>
              <span className="text-[7px] text-indigo-500 block font-sans font-extrabold tracking-widest uppercase leading-none">College</span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 border border-amber-100 shrink-0">
              <Landmark className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight shrink-0">
              <span className="font-semibold text-[#451a03] text-[10px] md:text-xs tracking-wider font-sans uppercase">St. Jude's</span>
              <span className="text-[7px] text-amber-600 block font-mono font-bold tracking-widest uppercase leading-none">Institution</span>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100 shrink-0">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight shrink-0">
              <span className="font-extrabold text-neutral-900 text-xs md:text-sm tracking-tighter font-sans lowercase">ibadan</span>
              <span className="text-[7.5px] text-emerald-600 block font-sans font-bold tracking-widest uppercase leading-none">Retail Co</span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-100 shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight shrink-0">
              <span className="font-black text-[#1e3a8a] text-[10px] md:text-xs tracking-tight uppercase">Al-Ansar</span>
              <span className="text-[7.5px] text-[#1e3a8a]/70 block font-sans uppercase font-semibold leading-none">Academy</span>
            </div>
          </div>
        );
      case 5:
      default:
        return (
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 border border-purple-100 shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight shrink-0">
              <span className="font-extrabold text-[#3b0764] text-[10px] md:text-xs tracking-wider uppercase font-mono">APEX</span>
              <span className="text-[7.5px] text-purple-600 block font-sans font-semibold uppercase tracking-wide leading-none">Assembly</span>
            </div>
          </div>
        );
    }
  };

  // Segmented Value Propositions Selector State
  const [selectedSegment, setSelectedSegment] = useState<'business' | 'school' | 'institutions'>('business');

  // Interactive Live Demo Scanner Simulation State (Section 2)
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [scannerAlertCount, setScannerAlertCount] = useState<number>(0);
  const [scannerLogs, setScannerLogs] = useState<string[]>([
    "INITIALIZING: Ready to monitor cash tills...",
    "DOCKET-01: Listening on operator terminal 1...",
    "LEDGER-STABLE: Cash balances matched bank reference codes."
  ]);

  // Before vs After Active Category State (Section 7)
  const [activeBeforeAfterTab, setActiveBeforeAfterTab] = useState<'retail' | 'school' | 'organization'>('retail');

  // Slidable Testimonials index (Section 9)
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState<number>(0);

  // Interactive ROI Calculator State (Section 10)
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(10000); // defaulted to USD 10k style
  const [revenueCurrency, setRevenueCurrency] = useState<'ngn' | 'usd'>('usd');

  // Pricing toggle state (Section 11)
  const [isAnnualPricing, setIsAnnualPricing] = useState<boolean>(true);

  // FAQ Accordion Active Index State (Section 12)
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  // Dynamic Cash Leakage Simulator Card Toggles (Section 5 inside "How it Works")
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [simulationMsg, setSimulationMsg] = useState<string | null>(null);

  // Social Proof list
  const clientLogos = [
    { name: "Sadiq Distributors Ltd", type: "Wholesale Retail" },
    { name: "Adebayo International College", type: "Academy" },
    { name: "St. Jude's Cathedral", type: "Institution" },
    { name: "Ibadan Retail Group", type: "Supermarket" },
    { name: "Al-Ansar Private School", type: "Educational" },
    { name: "Apex Parish Assembly", type: "Organization" }
  ];

  // Testimonials database
  const testimonials = [
    {
      name: "Antonio Juanito",
      title: "School Owner & Director, Mexico",
      stars: 5,
      comment: "Before using Eenvoq, cashiers recorded wrong tuition fees, and we kept losing tracking slips. Now parents' school term payments are validated in 2 taps. Every single deposit matches 100% and displays on my mobile immediately.",
      stats: "Saved $5K in monthly till leakages"
    },
    {
      name: "Chioma Anyanwu",
      title: "Store Proprietor, Enugu",
      stars: 5,
      comment: "Staff often told me the bank transfer alert was delayed when checkout grew busy. With Eenvoq's reference alert pairing, we detect invalid alerts on-the-spot. It completely eliminated checkout dockets excuses.",
      stats: "100% cash reconciliation accuracy"
    },
    {
      name: "Pst. Peters Schneider",
      title: "Finance Director, London Council",
      stars: 5,
      comment: "Pledges and project donations were extremely tedious to track across multi-department files. Eenvoq gave our audit desk robust tools to post records offline and verify bank alerts automatically.",
      stats: "Reduced ledger oversight by 25 hrs/mo"
    },
    {
      name: "Alhaji Ibrahim Kano",
      title: "Grain Wholesaler, Kano",
      stars: 5,
      comment: "If you sell wholesale goods, paper ledger books get ruined. With Eenvoq's staff terminals and cash drawers monitoring, we track registers in real-time. Our master ledger stays clean and secure.",
      stats: "Saved 18 hours per week on dockets check"
    },
    {
      name: "Kemi Alao",
      title: "Club Coordinator & Retailer, Ibadan",
      stars: 5,
      comment: "Our subscribers used to take rental items even with past-due debts. Eenvoq's automatic debtor locking shuts down access instantly on bad balances. Our operational cash flow recovered in just two weeks.",
      stats: "Outstanding retail debt reduced by 85%"
    }
  ];

  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setActiveTestimonialIdx(prev => (prev > 0 ? prev - 1 : testimonials.length - 1));
    } else {
      setActiveTestimonialIdx(prev => (prev < testimonials.length - 1 ? prev + 1 : 0));
    }
  };

  // Trigger live dashboard mockup audit process for Section 2
  const triggerAuditScan = () => {
    if (scannerActive) return;
    setScannerActive(true);
    setScannerAlertCount(0);
    
    const logs = [
      "CONNECTION: Syncing with banks & cashier registers...",
      "SCANNING: Auditing receipts against bank transfers...",
      "ALERT: Difference found in Register #2! ₦12,500 mismatch detected.",
      "AUTO-RESOLVE: Matched with corresponding mobile bank transfer."
    ];

    let i = 0;
    const intervalObj = setInterval(() => {
      if (i < logs.length) {
        setScannerLogs(prev => [logs[i], ...prev.slice(0, 4)]);
        if (logs[i].includes("ALERT")) {
          setScannerAlertCount(1);
        }
        i++;
      } else {
        clearInterval(intervalObj);
        setScannerActive(false);
      }
    }, 1000);
  };

  // ROI calculation logic based on slider
  const getROICalculations = () => {
    const revenue = monthlyRevenue;
    const isUSD = revenueCurrency === 'usd';
    
    // 2.3% estimated leakage typical in retail/schools
    const leakSaved = revenue * 0.024;
    // Hours saved: approx 8 hours base + 3 hours per 100k NGN / 500 USD
    const hoursSaved = Math.min(48, Math.round(8 + (revenue / (isUSD ? 2000 : 800000)) * 2));
    
    const formatValue = (val: number) => {
      if (isUSD) {
        return `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      } else {
        return `₦${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      }
    };

    return {
      leakSaved: formatValue(leakSaved),
      hoursSaved: `${hoursSaved} hours`,
      efficiency: `${Math.round(hoursSaved * 12.5)}% quicker audit closings`
    };
  };

  const currentROI = getROICalculations();

  return (
    <div className="bg-white min-h-screen font-sans text-neutral-900 flex flex-col items-center overflow-x-hidden relative" id="eenvoq-landing-container">
          {/* ==========================================
          SECTION 0: NAVIGATION HEADER (Aligned with Hero)
          ========================================== */}
       <nav className="fixed top-0 left-0 right-0 h-16 bg-[#1e40af] z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 border-b border-sky-400/20 w-full" id="landing-navbar">
<div className="flex items-center gap-1 cursor-pointer" onClick={() => { setActiveSubPage('main'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
  {/* Logo Image with background removed via Cloudinary and matching dashboard size */}
  <img 
    src="https://res.cloudinary.com/dee01jm0p/image/upload/e_bgremoval/f_auto,q_auto/1001135527_ij6c4q" 
    alt="Eenvoq logo" 
    className="h-7 w-auto object-contain select-none translate-y-0.5 brightness-0 invert" 
  />
</div>

        {/* Desktop Navbar Links */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-white tracking-wide uppercase">
          <button 
            type="button" 
            onClick={() => { setActiveSubPage('main'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className={`transition-colors uppercase bg-transparent border-0 font-bold text-xs tracking-wide cursor-pointer focus:outline-none ${activeSubPage === 'main' ? 'text-sky-300' : 'text-white hover:text-sky-300'}`}
          >
            Home
          </button>
          <a href="#features-showcase" onClick={() => setActiveSubPage('main')} className="hover:text-sky-300 transition-colors">Features</a>
          <a href="#pricing-tiers" onClick={() => setActiveSubPage('main')} className="hover:text-sky-300 transition-colors">Pricing</a>
          <button 
            type="button" 
            onClick={() => { setActiveSubPage('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className={`transition-colors uppercase bg-transparent border-0 font-bold text-xs tracking-wide cursor-pointer focus:outline-none ${activeSubPage === 'blog' ? 'text-sky-300' : 'text-white hover:text-sky-300'}`}
          >
            Blog
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <button
            onClick={onEnterApp}
            className="text-xs font-bold uppercase tracking-wider text-sky-300 hover:text-sky-100 transition-all cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={onEnterApp}
            className="bg-sky-400 hover:bg-sky-300 text-[#1e40af] font-bold py-3 px-6 rounded-full text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer border border-transparent focus:ring-2 focus:ring-sky-300"
            id="nav-cta-btn"
          >
            Start Free Trial
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center">
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-sky-300 transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Hamburger Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 bg-[#1e40af] border-b border-sky-400/25 z-40 lg:hidden shadow-lg overflow-hidden flex flex-col p-6 space-y-4"
          >
            <button 
              type="button" 
              onClick={() => { setMobileMenuOpen(false); setActiveSubPage('main'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="text-left text-sm font-semibold text-white hover:text-sky-300 py-2 border-b border-sky-400/10 bg-transparent border-0 cursor-pointer w-full"
            >
              Home
            </button>
            <a href="#features-showcase" onClick={() => { setMobileMenuOpen(false); setActiveSubPage('main'); }} className="text-sm font-semibold text-white hover:text-sky-300 py-2 border-b border-sky-400/10">Features</a>
            <a href="#pricing-tiers" onClick={() => { setMobileMenuOpen(false); setActiveSubPage('main'); }} className="text-sm font-semibold text-white hover:text-sky-300 py-2 border-b border-sky-400/10">Pricing</a>
            <button 
              type="button" 
              onClick={() => { setMobileMenuOpen(false); setActiveSubPage('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="text-left text-sm font-semibold text-white hover:text-sky-300 py-2 border-b border-sky-400/10 bg-transparent border-0 cursor-pointer w-full"
            >
              Blog Page
            </button>
            <div className="pt-4 flex flex-col gap-3">
              <button onClick={() => { setMobileMenuOpen(false); onEnterApp(); }} className="w-full text-center py-3 font-bold text-sky-300 rounded-full border border-sky-400/30 hover:bg-white/5 text-xs uppercase tracking-wide">Log In</button>
              <button onClick={() => { setMobileMenuOpen(false); onEnterApp(); }} className="w-full text-center py-3 font-bold bg-sky-400 hover:bg-sky-300 text-[#1e40af] rounded-full text-xs uppercase tracking-wide">Start Free Trial</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content body containing exactly 14 sequential sections */}
      <div className="w-full pt-16 pb-0 flex flex-col items-center">
        {activeSubPage === 'main' ? (
          <>
            {/* ==========================================
    COMBINED HERO & VISUAL PREVIEW SECTION 1 & 2
    ========================================== */}
<div className="w-full bg-[#1e40af] pb-16 pt-12 md:pt-16 md:pb-24 overflow-visible relative" id="landing-hero-section">
  <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
    
    {/* Hero Content (Left Column on Desktop, Center on Mobile) */}
    <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-5 lg:space-y-6">
      <div className="inline-flex items-center gap-2 bg-white/10 border border-sky-400/30 px-3 py-1 rounded-full text-[10px] font-bold text-sky-300 uppercase tracking-wider animate-pulse-once">
        <Sparkles className="w-3.5 h-3.5 stroke-[2] text-sky-400" />
        <span>Autonomous Revenue Protection</span>
      </div>

      <h1 className="text-[32px] sm:text-[44px] font-sans font-black text-white leading-tight tracking-tight">
        The Powerful AI Assistant That Tracks Your <span className="text-sky-300">Sales & Revenue</span>
      </h1>

      <p className="text-sm md:text-base text-white/90 leading-relaxed font-sans font-medium max-w-2xl">
        Eenvoq keeps you updated on your finances, <span className="text-sky-300">reduces leaky income</span>, and analyses <span className="text-sky-300">sales, subscription, and tuition streams</span> for your business, school, and organization.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 w-full max-w-xl animate-fade-in">
        <button
          onClick={onEnterApp}
          className="bg-sky-400 hover:bg-sky-300 text-[#1e40af] font-sans font-bold py-2.5 w-60 rounded-full text-xs uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-md hover:shadow-lg hover:shadow-sky-400/20 cursor-pointer border border-transparent whitespace-nowrap flex items-center justify-center gap-2 focus:ring-2 focus:ring-sky-300"
        >
          <span>Start Free Trial</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#1e40af]" />
        </button>
        <button
          onClick={onEnterApp}
          className="bg-[#1e40af] hover:bg-[#1a368f] text-white font-sans font-bold py-2.5 w-60 rounded-full text-xs uppercase tracking-wider transition-all duration-150 active:scale-95 border border-white hover:border-sky-300 cursor-pointer flex items-center justify-center gap-2 shadow-sm focus:ring-2 focus:ring-white/20 whitespace-nowrap"
        >
          <PlayCircle className="w-4 h-4 text-white" />
          <span>Book Demo</span>
        </button>
      </div>

      <p className="text-[10px] text-sky-200/90 font-bold tracking-wide uppercase select-none pt-0.5">
        ✓ No credit card required
      </p>
    </div>

    {/* Hero Visual Preview (Right Column on Desktop, Center on Mobile) */}
    <div className="relative w-full overflow-visible flex justify-center" id="product-preview-mockup">
      {/* Abstract radial dot matrix background grid centered under the frame */}
      <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none -z-10 opacity-80" />
      
      {/* Atmospheric glowing neon background aura under the frame */}
      <div className="absolute inset-x-12 top-10 bottom-10 bg-sky-400/20 rounded-full filter blur-[70px] pointer-events-none -z-10 mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute -inset-y-3 -inset-x-2 bg-gradient-to-r from-sky-300/10 to-indigo-500/10 rounded-[44px] filter blur-xl pointer-events-none -z-10" />

      {/* Structural vertical Swiss line accents extending from the top and bottom of the frame */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-[1px] h-6 bg-gradient-to-t from-white/30 to-transparent pointer-events-none z-0" />
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-[1px] h-6 bg-gradient-to-b from-white/30 to-transparent pointer-events-none z-0" />

      {/* MODIFIED: Significantly tightened the widths and added precise max-widths to clamp size */}
      <motion.div 
        {...scrollRevealProps}
        className="bg-white/10 p-[1.5px] shadow-2xl rounded-[16px] md:rounded-[32px] border border-white/20 w-4/5 sm:w-2/3 md:w-1/2 lg:w-4/5 xl:w-3/4 max-w-sm lg:max-w-md xl:max-w-lg relative overflow-visible group"
      >

        {/* Status and telemetry indicator pill layered on the top edge code bar */}
        <div className="absolute -top-2.5 left-6 px-2 py-0.5 rounded-full border border-white/20 bg-neutral-950 text-[8px] font-mono text-sky-300 select-none z-20 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          SECURE_REVENUE_RECONCILIATION
        </div>

        {/* Dimension telemetry indicator layered on the bottom edge code bar */}
        <div className="absolute -bottom-2.5 right-6 px-2 py-0.5 rounded-full border border-white/20 bg-neutral-950 text-[8px] font-mono text-white/70 select-none z-20 shadow-sm">
          ALL_YOUR_SALES_IN_ONE_TRACKER
        </div>

        {/* Subtle visual lens reflection */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none select-none z-10 rounded-[14px] md:rounded-[28px]" />
        
        {/* Full Image with a micro thin border to isolate the asset within the parent frame */}
        <div className="w-full overflow-hidden bg-neutral-900 rounded-[14px] md:rounded-[30px] border border-white/5 shadow-inner">
          <img 
            src="https://i.ibb.co/TBqgcF74/Screenshot-20260619-130027-1.jpg" 
            alt="Eenvoq App Overview" 
            className="w-full h-auto object-cover select-none transform group-hover:scale-[1.01] transition duration-700"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    </div>

  </div>
</div>


        {/* ==========================================
            SECTION 3: THE SOCIAL PROOF / TRUST BAR
            ========================================== */}
        <div className="w-full bg-neutral-50/50 py-10 border-y border-neutral-100 mb-16" id="social-proof-bar">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#757575] block mb-6">
              Empowering Cash flow integrity over 4,500+ Regional retail systems & schools
            </span>

            <motion.div 
              {...scrollRevealProps}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 items-center justify-center"
            >
              {clientLogos.map((logo, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-center p-3 sm:p-4 bg-white rounded-xl border border-neutral-150/40 shadow-xs hover:border-sky-300/60 hover:scale-[1.04] transition duration-300 ease-out select-none"
                >
                  {renderBusinessLogo(index)}
                </div>
              ))}
            </motion.div>
          </div>
        </div>


        {/* ==========================================
            SECTION 4: SEGMENTED VALUE PROPOSITIONS ("Who It's For")
            ========================================== */}
        <div className="w-full px-6 md:px-12 lg:px-20 max-w-7xl mx-auto py-16 scroll-mt-24" id="why-eenvoq">
          <div className="flex flex-col items-center text-center space-y-3 mb-10">
            <span className="bg-sky-100 border border-sky-200 text-sky-850 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Segmented Solutions
            </span>
            <h2 className="text-[32px] sm:text-[44px] font-sans font-black text-black tracking-tight leading-tight">
              A Tailored Shield for Every Business.
            </h2>
            <p className="text-sm md:text-base text-neutral-500 max-w-2xl leading-relaxed font-sans font-medium">
              We specialize financial tracking parameters to fit identical operational environments—preventing manipulation exact to your structure.
            </p>
          </div>

          {/* Tab Button Selectors */}
          <motion.div 
            {...scrollRevealProps}
            className="flex items-center justify-center gap-3 p-1.5 bg-neutral-50 border border-neutral-150/80 rounded-full max-w-2xl mx-auto mb-12"
          >
            <button
              onClick={() => setSelectedSegment('business')}
              className={`flex-1 py-3 text-center text-xs font-bold rounded-full transition-all duration-150 cursor-pointer ${
                selectedSegment === 'business'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
              }`}
            >
              Businesses
            </button>
            <button
              onClick={() => setSelectedSegment('school')}
              className={`flex-1 py-3 text-center text-xs font-bold rounded-full transition-all duration-150 cursor-pointer ${
                selectedSegment === 'school'
                  ? 'bg-sky-505 text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
              }`}
            >
              Schools
            </button>
            <button
              onClick={() => setSelectedSegment('institutions')}
              className={`flex-1 py-3 text-center text-xs font-bold rounded-full transition-all duration-150 cursor-pointer ${
                selectedSegment === 'institutions'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-neutral-505 hover:bg-neutral-100 hover:text-black'
              }`}
            >
              Organizations
            </button>
          </motion.div>

          {/* Interactive tab block */}
          <motion.div 
            {...scrollRevealProps}
            className="bg-[#FCFAF7] border border-sky-100 p-8 md:p-12 rounded-[32px] max-w-5xl mx-auto text-left"
          >
            <AnimatePresence mode="wait">
              {selectedSegment === 'business' && (
                <motion.div 
                  key="business"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-6">
                    <span className="text-[10px] font-black uppercase text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full text-center inline-block">
                      Retail & Wholesale Cash Guard
                    </span>
                    <h3 className="text-2xl md:text-3xl font-sans font-extrabold text-black tracking-tight leading-snug">
                      Lock Cash Registers at Close. Detect Till Deficits in Real-Time.
                    </h3>
                    <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-sans font-medium">
                      Paper files, hand notches, and unchecked spreadsheets always hide minor cashier discrepancies that balloon into hundreds of thousands. Eenvoq locks down physical tills. Supervisors input closures directly, matching receipts against local offline databases.
                    </p>
                    <ul className="space-y-2.5 text-xs font-semibold text-neutral-800">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                        <span>Audited Till Closures: Locks tills so records cannot be rewritten post-date</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                        <span>Sales Velocity tracking to forecast product reorder thresholds</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                        <span>Operator terminal audits restricting supervisory permissions</span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:col-span-5 bg-white border border-sky-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <span className="text-[9px] font-mono font-bold uppercase text-neutral-400">Core Metrics Sample</span>
                    <div className="space-y-2">
                      <div className="p-3 border border-sky-50 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-800">Deficit Deflector Rate</span>
                        <span className="text-sm font-bold text-emerald-600">99.7% Saved</span>
                      </div>
                      <div className="p-3 border border-sky-50 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-800">Average Till Close</span>
                        <span className="text-sm font-mono text-neutral-400">12 seconds</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedSegment === 'school' && (
                <motion.div 
                  key="school"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-6">
                    <span className="text-[10px] font-black uppercase text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full text-center inline-block">
                      Private Academy & Term Fee Shields
                    </span>
                    <h3 className="text-2xl md:text-3xl font-sans font-extrabold text-black tracking-tight leading-snug">
                      Validate School Tuition Balances and Block Delinquent Debts Automatically.
                    </h3>
                    <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-sans font-medium">
                      Managing periodic school terms on unstable cashbooks results in massive outstanding tuition gaps. Eenvoq's School platform lets your registry verify digital bank transfers, post student dues schedules, and automatically limit checkout parameters for repeat non-payers.
                    </p>
                    <ul className="space-y-2.5 text-xs font-semibold text-neutral-800">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                        <span>Term Fee Schedules containing flexible, multi-installments</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                        <span>Pre-audit reference pairing to block mock bank alert frauds</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                        <span>Automated text reminders directly matching active school rosters</span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:col-span-5 bg-white border border-sky-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <span className="text-[9px] font-mono font-bold uppercase text-neutral-400">Tuition Protection Logs</span>
                    <div className="space-y-2">
                      <div className="p-3 border border-sky-50 rounded-xl flex items-center justify-between bg-emerald-50/50">
                        <span className="text-xs font-bold text-emerald-800">Verified Transfer Alert</span>
                        <span className="text-[11px] font-mono text-emerald-600 font-bold">₦145,000 Term Fee</span>
                      </div>
                      <div className="p-3 border border-sky-50 rounded-xl flex items-center justify-between bg-red-50/50">
                        <span className="text-xs font-bold text-red-800">Unsettled Debtor Locked</span>
                        <span className="text-[11px] font-mono text-neutral-500">Terminal 1 blocked</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedSegment === 'institutions' && (
                <motion.div 
                  key="institutions"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-6">
                    <span className="text-[10px] font-black uppercase text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full text-center inline-block">
                      Multi-Department & Parish Oversight
                    </span>
                    <h3 className="text-2xl md:text-3xl font-sans font-extrabold text-black tracking-tight leading-snug">
                      Grant Transparency, Double-Sentry Controls, and Clean PDF Reports.
                    </h3>
                    <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-sans font-medium">
                      Larger organizations or dioceses cannot afford decentralized financial oversight. Eenvoq ensures that ledger entries require dual key signatures. Only up to exactly 2 active supervisor administrators can authorize credit updates, making the record strictly audit-ready.
                    </p>
                    <ul className="space-y-2.5 text-xs font-semibold text-neutral-800">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                        <span>Double-Sentry: Only 2 authorized executive managers can update transactions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                        <span>Detailed PDF reports structured for annual regulatory board review</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                        <span>Offline caching allowing remote audit logging on location sites</span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:col-span-5 bg-white border border-sky-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <span className="text-[9px] font-mono font-bold uppercase text-neutral-400">Double-Sentry Authorization</span>
                    <div className="space-y-2">
                      <div className="p-2.5 bg-neutral-50 rounded-xl text-[10px] text-neutral-500 space-y-1">
                        <p className="font-bold text-neutral-700">✓ Supervisor 1 (Pastor Adebayo)</p>
                        <p className="font-bold text-neutral-700">✓ Supervisor 2 (Chief Steward)</p>
                        <p className="text-emerald-600 font-bold uppercase text-[9px] tracking-wide mt-1">Audit status: 100% matched</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>


        {/* ==========================================
            SECTION 5: CORE FEATURE SHOWCASES ("How It Works")
            ========================================== */}
        <div className="w-full px-6 md:px-12 lg:px-20 max-w-7xl mx-auto py-16 space-y-24 scroll-mt-24" id="features-showcase">
          
          <div className="flex flex-col items-center text-center space-y-3">
            <span className="bg-sky-100 border border-sky-200 text-sky-850 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              High Integrity Capabilities
            </span>
            <h2 className="text-[32px] sm:text-[44px] font-sans font-black text-black tracking-tight leading-tight">
              6 Columns of Absolute Income Safety.
            </h2>
            <p className="text-sm md:text-base text-neutral-500 max-w-2xl leading-relaxed font-sans font-medium">
              We did not build another passive checkout system. Eenvoq actively polices cash flows to ensure no record disappears.
            </p>
          </div>

          <div className="space-y-24 max-w-5xl mx-auto">
            
            {/* Feature 1: Live Cash Reconciliation (Image Left / Text Right) */}
            <motion.div 
              {...scrollRevealProps}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
            >
              <div className="lg:col-span-5 bg-sky-50/40 border border-sky-100 p-8 rounded-[32px] hover:border-sky-300 transition duration-150 order-2 lg:order-1">
                {/* Visual mockup detail */}
                <div className="space-y-4">
                  <span className="text-[9px] font-mono text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full uppercase font-bold">Ledger Drift Check</span>
                  <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-sm text-left text-xs space-y-2">
                    <div className="flex justify-between items-center text-neutral-400 font-bold">
                      <span>Expected Till Balances:</span>
                      <span className="font-mono text-neutral-800">₦245,600</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-400 font-bold">
                      <span>Physical Drawer Count:</span>
                      <span className="font-mono text-red-650 font-black">₦233,100</span>
                    </div>
                    <div className="h-px bg-neutral-100 my-1" />
                    <p className="text-[10px] text-red-650 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Till Deficit of ₦12,500 caught on Close! Action Required.
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 text-left space-y-4 order-1 lg:order-2">
                <span className="text-sky-600 font-mono text-xs font-black uppercase tracking-wider">01 / RECONCILIATION</span>
                <h3 className="text-2xl md:text-3.5xl font-sans font-black text-black leading-tight">
                  Instant Till Deficit Matching.
                </h3>
                <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-sans font-medium">
                  When a cashier operates a register, the cash drawers must match expected product totals down to the last penny. Eenvoq forces strict drawer counts at every supervisor swap, flagging and reporting mismatch leaks instantly to your parent screen.
                </p>
              </div>
            </motion.div>

            {/* Feature 2: Digital Bank Alert Pairing (Text Left / Image Right) */}
            <motion.div 
              {...scrollRevealProps}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
            >
              <div className="lg:col-span-7 text-left space-y-4">
                <span className="text-sky-600 font-mono text-xs font-black uppercase tracking-wider">02 / FRAUD BLOCKER</span>
                <h3 className="text-2xl md:text-3.5xl font-sans font-black text-black leading-tight">
                  Pair Verified Bank Transfer alert codes, No Fake Screens.
                </h3>
                <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-sans font-medium">
                  Cashiers face constant pressure from customers showing fake bank-transfer screenshots. Eenvoq's alert interface verifies exact transaction references against matched deposit registries before letting operators unlock checkout access.
                </p>
              </div>
              <div className="lg:col-span-5 bg-sky-50/40 border border-sky-100 p-8 rounded-[32px] hover:border-sky-300 transition duration-150">
                <div className="space-y-4">
                  <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase font-bold">Transfer Verification</span>
                  <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-sm text-left space-y-2">
                    <span className="text-[10px] text-neutral-400 block font-bold">INPUT TRANSACTION REF:</span>
                    <input type="text" disabled value="TRX-882194-NQR" className="w-full bg-neutral-50 border border-sky-100 rounded-xl p-2 font-mono text-xs text-neutral-700" />
                    <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 py-1 px-2.5 rounded-full inline-block font-mono font-bold uppercase tracking-wide">
                      ✔ Matching Alert Found in Bank Registry
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Automated Overdue Alerts (Image Left / Text Right) */}
            <motion.div 
              {...scrollRevealProps}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
            >
              <div className="lg:col-span-5 bg-sky-50/40 border border-sky-100 p-8 rounded-[32px] hover:border-sky-300 transition duration-150 order-2 lg:order-1">
                <div className="space-y-4">
                  <span className="text-[9px] font-mono text-red-650 bg-red-50 px-2.5 py-1 rounded-full uppercase font-bold">Debtor Control Protocol</span>
                  <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-sm text-left text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-neutral-500">Baba Sadiq:</span>
                      <span className="text-red-650 font-mono">₦85,000 Overdue</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-xl text-[10px] font-bold">
                      ⚠ Terminal action: All credit sales blocked automatically. WhatsApp text alert queued.
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 text-left space-y-4 order-1 lg:order-2">
                <span className="text-sky-600 font-mono text-xs font-black uppercase tracking-wider">03 / AR DEBT CONTROL</span>
                <h3 className="text-2xl md:text-3.5xl font-sans font-black text-black leading-tight">
                  Automated Overdue reminders & Hard Locks.
                </h3>
                <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-sans font-medium">
                  Say goodbye to chasing down parents or subscribers manually. Eenvoq's AR module tracks overdue tuition and invoices schedules, dispatching instant text updates via WhatsApp, and automatically locking those guest profiles at register point checkouts.
                </p>
              </div>
            </motion.div>

            {/* Feature 4: Staff Terminal Control & Multi-Operator Tracking (Text Left / Image Right) */}
            <motion.div 
              {...scrollRevealProps}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
            >
              <div className="lg:col-span-7 text-left space-y-4">
                <span className="text-sky-600 font-mono text-xs font-black uppercase tracking-wider">04 / AUDIT COMPLIANCE</span>
                <h3 className="text-2xl md:text-3.5xl font-sans font-black text-black leading-tight">
                  Strict Multi-Operator Sentry Rules.
                </h3>
                <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-sans font-medium">
                  We limit managers credentials stringently. Only up to exactly 2 active supervisors can make ledger modifications, closing internal loopholes where devious actors overwrite back-dated transactions secretly. One boss, two trusted cashiers. Perfect lock.
                </p>
              </div>
              <div className="lg:col-span-5 bg-sky-50/40 border border-sky-100 p-8 rounded-[32px] hover:border-sky-300 transition duration-150">
                <div className="space-y-4">
                  <span className="text-[9px] font-mono text-sky-950 bg-sky-50 px-2.5 py-1 rounded-full uppercase font-bold">Access Restrictions</span>
                  <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-sm text-left text-xs space-y-2">
                    <p className="font-bold text-neutral-500 leading-none">Access Level Monitor:</p>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-sky-500" />
                    </div>
                    <p className="text-[9.5px] text-red-650 font-bold leading-none">✖ Supervisor accounts limit reached (2 of 2 maximum).</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 5: Real-Time Interactive On-The-Go Cash Correction (Image Left / Text Right) */}
            <motion.div 
              {...scrollRevealProps}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
            >
              <div className="lg:col-span-5 bg-sky-50/40 border border-sky-100 p-8 rounded-[32px] hover:border-sky-300 transition duration-150 order-2 lg:order-1">
                <div 
                  onClick={() => setShowBottomSheet(!showBottomSheet)}
                  className="border border-neutral-200 hover:border-sky-500/40 p-5 rounded-2xl bg-white cursor-pointer select-none transition shadow-sm text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold font-mono text-sky-600 border border-sky-200 px-2 py-0.5 rounded-full uppercase bg-sky-50/50">Register Status</span>
                    <span className="text-[9px] text-neutral-400 font-sans font-bold">Till #2</span>
                  </div>
                  <p className="text-xs text-neutral-900 leading-snug font-sans font-extrabold mb-3">
                    Discrepancy of ₦12,500 identified.
                  </p>
                  <span className="text-[10px] text-sky-500 font-bold hover:underline block text-right mt-1">
                    {showBottomSheet ? "Close options" : "Fix Leak Simulated Demo →"}
                  </span>
                </div>

                {showBottomSheet && (
                  <div className="bg-white border border-sky-200 rounded-xl p-4 mt-3 shadow-md text-left space-y-2 animate-fade-in text-xs">
                    {simulationMsg ? (
                      <p className="text-green-600 font-bold font-sans">✓ {simulationMsg}</p>
                    ) : (
                      <>
                        <p className="text-[10px] text-neutral-400 font-semibold mb-1">Select simulated correction action:</p>
                        <button onClick={() => setSimulationMsg("Sales docket audit matched automatically.")} className="w-full text-left bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 font-bold hover:bg-sky-50 text-[10.5px]">Verify Reference Codes</button>
                        <button onClick={() => setSimulationMsg("Casher login barred until manual cash audit.")} className="w-full text-left bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 font-bold hover:bg-sky-50 text-[10.5px]">Restrict cash drawer access</button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="lg:col-span-7 text-left space-y-4 order-1 lg:order-2">
                <span className="text-sky-600 font-mono text-xs font-black uppercase tracking-wider">05 / ON-THE-GO DISCREPANCIES</span>
                <h3 className="text-2xl md:text-3.5xl font-sans font-black text-black leading-tight">
                  Instant Corrective Bottom Drawers.
                </h3>
                <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-sans font-medium">
                  When a till closes short, supervisors shouldn't wait days to trace cash journal gaps. Eenvoq launches on-screen corrective bottom-drawers allowing managers to balance registers against bank reference transfers instantly or lock terminal cashiers immediately.
                </p>
              </div>
            </motion.div>

            {/* Feature 6: Stock Velocity Forecasting (Text Left / Image Right) */}
            <motion.div 
              {...scrollRevealProps}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
            >
              <div className="lg:col-span-7 text-left space-y-4">
                <span className="text-sky-600 font-mono text-xs font-black uppercase tracking-wider">06 / FORECAST ENGINE</span>
                <h3 className="text-2xl md:text-3.5xl font-sans font-black text-black leading-tight">
                  Predictive Stock Depletion Forecasting.
                </h3>
                <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-sans font-medium">
                  Eenvoq watches sales speed over trailing days, mapping inventory patterns against live stock counts. It automatically warns owners when vital items are tracking toward stock-out, triggering reorder logs so supply structures never interrupt income pipelines.
                </p>
              </div>
              <div className="lg:col-span-5 bg-sky-50/40 border border-sky-100 p-8 rounded-[32px] hover:border-sky-300 transition duration-150">
                <div className="space-y-4">
                  <span className="text-[9px] font-mono text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full uppercase font-bold">Velocity Forecaster</span>
                  <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-sm text-left text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Item Sales Speed:</span>
                      <span className="font-mono text-neutral-800">45 units/day</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-sky-500" />
                    </div>
                    <p className="text-[9.5px] text-sky-600 font-bold block leading-none">↑ Stable supply pipeline. Reorder required in exactly 4 days.</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>


        {/* ==========================================
            SECTION 6: INTEGRATION ECOSYSTEM
            ========================================== */}
        <div className="w-full bg-neutral-900 border-y border-neutral-950 py-20 text-white scroll-mt-24" id="integrations">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
            <div className="flex flex-col items-center text-center space-y-3 mb-16">
              <span className="bg-neutral-800 border border-neutral-700 text-sky-400 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Ecosystem Support
              </span>
              <h2 className="text-[32px] sm:text-[44px] font-sans font-black tracking-tight leading-tight">
                Seamless Integrity with Your Existing Stack.
              </h2>
              <p className="text-sm md:text-base text-neutral-400 max-w-2xl leading-relaxed font-sans font-medium">
                Eenvoq connects directly with elite global payment networks, Student Information Systems (SIS), and digital registers to protect transfers immediately.
              </p>
            </div>

            <motion.div 
              {...scrollRevealProps}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
            >
              {[
                { name: "Stripe Connect", type: "Credit Cards & SaaS", desc: "Sync direct customer dockets and subscription logs." },
                { name: "PayPal Gateway", type: "International Sales", desc: "Automate reference signature and balance confirmations." },
                { name: "QuickBooks Online", type: "Tax & Accounting", desc: "Export compliant journals and audits with dual sentry codes." },
                { name: "Xero Integration", type: "B2B Bookkeeping", desc: "Automatically match bank statements and outstanding invoicing." },
                { name: "Regional Mobile Monies", type: "USSD / Bank Alerts", desc: "Instant matching checks on mobile alert transfers to cashier tills." },
                { name: "SIS Academics API", type: "School Rosters", desc: "Sync student directories and recurring term fee schedules." },
                { name: "Plaid Bank Rails", type: "Direct Debit Sync", desc: "Pre-audit verification codes matching immediate account credits." },
                { name: "Slack & SMS Hook", type: "Instant Alerts", desc: "Daily till closings and discrepancy flags piped directly to bosses." }
              ].map((item, idx) => (
                <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 hover:border-sky-500/50 transition-all text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-sans font-extrabold text-white">{item.name}</span>
                    <ArrowUpRight className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-[9px] font-mono uppercase text-sky-400 block tracking-wider font-bold">{item.type}</span>
                  <p className="text-xs text-neutral-500 leading-normal font-sans font-normal">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>


        {/* ==========================================
            SECTION 7: THE "BEFORE VS. AFTER" ROI Matrix
            ========================================== */}
        <div className="w-full px-6 md:px-12 lg:px-20 max-w-7xl mx-auto py-20 scroll-mt-24 border-b border-neutral-100" id="before-after">
          
          <div className="flex flex-col items-center text-center space-y-3 mb-12">
            <span className="bg-sky-100 border border-sky-200 text-sky-850 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Before vs After Matrix
            </span>
            <h2 className="text-[32px] sm:text-[44px] font-sans font-black text-black tracking-tight leading-tight">
              Spreadsheet Chaos ➔ Absolute Financial Sanity.
            </h2>
            <p className="text-sm md:text-base text-neutral-500 max-w-2xl leading-relaxed font-sans font-medium">
              See the exact operational differences that translate into thousands saved when you trade papers for Eenvoq's sentry.
            </p>
          </div>

          {/* Symmetrical Table matrix */}
          <motion.div 
            {...scrollRevealProps}
            className="border border-sky-100 rounded-[32px] overflow-hidden max-w-5xl mx-auto shadow-sm"
          >
            
            {/* Header */}
            <div className="grid grid-cols-1 md:grid-cols-12 bg-neutral-900 text-white p-5 text-sm font-bold uppercase tracking-wide text-left select-none gap-4">
              <div className="md:col-span-2 text-xs font-mono text-sky-400 font-extrabold flex items-center">AUDIT SEGMENT</div>
              <div className="md:col-span-5 text-neutral-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" /> CHAOTIC MANUAL SYSTEM (BEFORE)
              </div>
              <div className="md:col-span-5 text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> EENVOQ REVENUE DEFENSER (AFTER)
              </div>
            </div>

            {/* Matrix comparison rows - EXACTLY 5 row points */}
            {[
              {
                segment: "RECO_LOGS",
                before: "Cashiers write end-day registers in offline diaries or Excel files. Actors delete checkout cells privately, pocketing discrepancies with zero tracking trails.",
                after: "Till closures are permanent. Registrations lock immediately. Any discrepancy flags the supervisor screen, showing cash-drift velocity immediately."
              },
              {
                segment: "TRANS_CHECKS",
                before: "Cashiers match bank alert reference codes against manual phone screenshots, accepting forged digital dockets during busy periods. High rate of leakages.",
                after: "Instant reference signature audit against our matched bank registry. Fake transaction transfers can never unlock register approvals."
              },
              {
                segment: "DEBT_COLLECT",
                before: "Outstanding tuition fees, church pledges, or store credit accounts are forgotten in paper registers, running up months of unsecured debts.",
                after: "Debtors balances lock automatically. WhatsApp text alert reminders sent via scheduled timers. Overdue accounts block terminal dockets until cleared."
              },
              {
                segment: "STAFF_ROLES",
                before: "Anyone with master login credentials has full privileges to wipe transaction records. No secure role boundaries for supervisors.",
                after: "Strict double-sentry restricted permissions. Max exactly 2 administrator supervisor entries possible to avoid record back-dating loopholes."
              },
              {
                segment: "OPER_STATS",
                before: "Spending days consolidating handwritten invoice dockets. Reporting stats are laggy, highly inaccurate, and prone to major data errors.",
                after: "Clean PDF reports are automatically compiled for board reviews in seconds. Real-time sales telemetry dashboard updates live."
              }
            ].map((row, idx) => (
              <div 
                key={idx} 
                className={`grid grid-cols-1 md:grid-cols-12 p-6 md:p-8 text-xs sm:text-sm font-sans gap-4 text-left border-t border-sky-50 items-center ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFAF7]/40'
                }`}
              >
                <div className="md:col-span-2 font-mono text-[10.5px] font-bold text-sky-600 block">{row.segment}</div>
                <div className="md:col-span-5 text-neutral-500 pr-4 leading-relaxed font-sans font-medium">
                  {row.before}
                </div>
                <div className="md:col-span-5 text-[#111111] leading-relaxed font-sans font-bold flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span>{row.after}</span>
                </div>
              </div>
            ))}

          </motion.div>
        </div>


        {/* ==========================================
            SECTION 8: DATA SECURITY & COMPLIANCE
            ========================================== */}
        <div className="w-full bg-neutral-900 py-20 text-white scroll-mt-24 border-y border-neutral-950" id="security-compliance">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 text-center">
            
            <div className="flex flex-col items-center space-y-4 mb-16">
              <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Lock className="w-8 h-8 text-sky-400 stroke-[1.5]" />
              </div>
              <span className="bg-neutral-800 border border-neutral-700 text-sky-400 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Bank-Grade Defenses
              </span>
              <h2 className="text-[32px] sm:text-[44px] font-sans font-black tracking-tight leading-tight">
                Data Sovereignty, Fully Secured.
              </h2>
              <p className="text-sm md:text-base text-neutral-400 max-w-2xl leading-relaxed font-sans font-medium">
                We safeguard your operations with strict corporate-level security, ensuring records cannot be tampered with.
              </p>
            </div>

            <motion.div 
              {...scrollRevealProps}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto text-left"
            >
              {[
                {
                  title: "Bank-Grade Encryption",
                  desc: "All financial data, cashier logins, and bank transfers reference pairing are guarded behind 256-bit SSL encryptions both during transit and at rest."
                },
                {
                  title: "Role-Based Permissions",
                  desc: "Granular administrative boundaries limiting ledger modifications. Cashiers can log checkout lists but cannot edit previously queued journals."
                },
                {
                  title: "Automatic Clouds Backups",
                  desc: "Your receipts databases backup every 60 seconds to secure off-site environments, allowing instant data recovery even if register screens fail."
                },
                {
                  title: "Strict GDPR & SOC Compliance",
                  desc: "Zero records shared with third parties. Compliant with top regional regulatory audits, protecting your store ledger and tuition lists securely."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6.5 space-y-3.5 hover:border-sky-500/30 transition">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sky-400 font-mono font-bold text-xs select-none">
                    0{idx+1}
                  </div>
                  <h3 className="font-sans font-extrabold text-sm text-white">{item.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans font-normal">{item.desc}</p>
                </div>
              ))}
            </motion.div>

          </div>
        </div>


        {/* ==========================================
            SECTION 9: TESTIMONIALS & DEEP CASE STUDIES
            ========================================== */}
        <div className="w-full px-6 md:px-12 lg:px-20 max-w-7xl mx-auto py-20 scroll-mt-24" id="testimonials-section">
          
          <div className="flex flex-col items-center text-center space-y-3 mb-16">
            <span className="bg-sky-100 border border-sky-200 text-sky-850 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Success Stories
            </span>
            <h2 className="text-[32px] sm:text-[44px] font-sans font-black text-black tracking-tight leading-tight">
              What others are saying about Eenvoq.
            </h2>
            <p className="text-sm md:text-base text-neutral-500 max-w-2xl leading-relaxed font-sans font-medium">
              Read how business owners and school directors locked their registers and wiped out cash discrepancies forever.
            </p>
          </div>

          <motion.div 
            {...scrollRevealProps}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto"
          >
            
            {/* Left Column Image Overlay */}
            <div className="lg:col-span-5 rounded-[24px] overflow-hidden border border-sky-100 h-[380px] relative hidden lg:block shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop"
                alt="Representative Store Director"
                className="w-full h-full object-cover grayscale opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 to-transparent p-6 flex flex-col justify-end text-white text-left">
                <span className="text-[10px] font-mono uppercase text-sky-450 font-bold block">CASE PROFILE SPOTLIGHT</span>
                <p className="text-xs font-sans font-medium leading-relaxed text-sky-200 mt-1">
                  Private schools in regional hubs observed up to 30% tuition collections rate bumps after automating ledger checks on overdue dockets.
                </p>
              </div>
            </div>

            {/* Carousel Column */}
            <div className="lg:col-span-7 relative">
              <div className="overflow-hidden rounded-[32px] border border-sky-100 bg-white p-8 md:p-10 min-h-[240px] transition-all duration-300 shadow-sm text-left">
                <div className="space-y-6">
                  <div className="flex items-center gap-1.5 text-sky-500">
                    {[...Array(testimonials[activeTestimonialIdx].stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-base md:text-lg text-neutral-800 font-extrabold italic leading-relaxed font-sans">
                    "{testimonials[activeTestimonialIdx].comment}"
                  </blockquote>

                  {/* Impact Stats tag */}
                  <div className="inline-block bg-sky-100/60 border border-sky-200 text-sky-850 px-3 py-1 rounded-full text-xs font-bold select-none">
                    📈 Impact: {testimonials[activeTestimonialIdx].stats}
                  </div>

                  <div className="flex items-center justify-between border-t border-sky-50 pt-5">
                    <div>
                      <h4 className="font-sans font-black text-neutral-900 text-sm md:text-base leading-none">
                        {testimonials[activeTestimonialIdx].name}
                      </h4>
                      <p className="text-xs text-neutral-400 font-sans mt-1.5 font-bold">
                        {testimonials[activeTestimonialIdx].title}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-neutral-300 font-extrabold">
                      {activeTestimonialIdx + 1} of {testimonials.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider Navigation Controls */}
              <div className="flex items-center justify-start gap-4 mt-6">
                <button
                   type="button"
                  onClick={() => scrollTestimonials('left')}
                  className="w-10 h-10 rounded-full border border-sky-100 bg-white hover:bg-sky-50/50 text-neutral-800 inline-flex items-center justify-center cursor-pointer transition active:scale-95 focus:outline-none"
                  aria-label="Previous Testimonial"
                >
                  <ArrowLeft className="w-4 h-4 text-neutral-600" />
                </button>
                
                <div className="flex gap-1.5">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveTestimonialIdx(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeTestimonialIdx === idx ? 'bg-sky-500 w-4' : 'bg-neutral-200'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scrollTestimonials('right')}
                  className="w-10 h-10 rounded-full border border-sky-100 bg-white hover:bg-sky-50/50 text-neutral-800 inline-flex items-center justify-center cursor-pointer transition active:scale-95 focus:outline-none"
                  aria-label="Next Testimonial"
                >
                  <ArrowRightIcon className="w-4 h-4 text-neutral-600" />
                </button>
              </div>

            </div>

          </motion.div>
        </div>


        {/* ==========================================
            SECTION 10: INTERACTIVE ROI CALCULATOR
            ========================================== */}
        <div className="w-full bg-[#FCFAF7] border-y border-sky-150 py-20 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto text-center" id="roi-calculator">
          <div className="max-w-3xl mx-auto space-y-12">
            
            <div className="flex flex-col items-center space-y-3">
              <span className="bg-sky-100 border border-sky-200 text-sky-850 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Financial Savings Forecaster
              </span>
              <h2 className="text-[32px] sm:text-[44px] font-sans font-black text-black tracking-tight leading-tight">
                Calculate Your Real Saved Revenue.
              </h2>
              <p className="text-sm md:text-base text-neutral-500 max-w-2xl leading-relaxed font-sans font-medium">
                Adjust your estimated monthly revenue stream volume below to view immediate leak-recovery values and labor hour cut-downs with Eenvoq.
              </p>
            </div>

            {/* Slider Widget Card */}
            <motion.div 
              {...scrollRevealProps}
              className="bg-white border border-sky-100 rounded-[32px] p-6 md:p-10 shadow-sm text-left space-y-8 max-w-2xl mx-auto"
            >
              
              {/* Currency Selector Toggle */}
              <div className="flex items-center justify-between border-b border-sky-50 pb-4">
                <span className="text-xs font-bold text-neutral-800 uppercase font-sans tracking-wider">Select Currency Base</span>
                <div className="flex gap-2 p-1 bg-neutral-50 border border-neutral-150 rounded-full">
                  <button 
                    onClick={() => { setRevenueCurrency('ngn'); setMonthlyRevenue(2500000); }}
                    className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${
                      revenueCurrency === 'ngn' ? 'bg-sky-500 text-white' : 'text-neutral-500'
                    }`}
                  >
                    NGN (₦)
                  </button>
                  <button 
                    onClick={() => { setRevenueCurrency('usd'); setMonthlyRevenue(10000); }}
                    className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${
                      revenueCurrency === 'usd' ? 'bg-sky-500 text-white' : 'text-neutral-500'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>

              {/* Slider Input Block */}
              <div className="space-y-3">
                <div className="flex justify-between items-center font-sans">
                  <span className="text-xs font-extrabold text-neutral-500 uppercase tracking-wider">Monthly Revenue Flow:</span>
                  <span className="text-xl md:text-2xl font-black text-sky-650 font-mono">
                    {revenueCurrency === 'usd' ? `$${monthlyRevenue.toLocaleString()}` : `₦${monthlyRevenue.toLocaleString()}`}
                  </span>
                </div>

                <input 
                  type="range"
                  min={revenueCurrency === 'usd' ? 1000 : 250000}
                  max={revenueCurrency === 'usd' ? 100000 : 25000000}
                  step={revenueCurrency === 'usd' ? 1000 : 250000}
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full accent-sky-500 h-2 bg-neutral-100 rounded-full cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono text-neutral-400 font-bold">
                  <span>MIN: {revenueCurrency === 'usd' ? '$1,000' : '₦250K'}</span>
                  <span>MAX: {revenueCurrency === 'usd' ? '$100K' : '₦25M'}</span>
                </div>
              </div>

              {/* Outputs Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed border-sky-100">
                <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Recovered Cash Leakages / Mo</span>
                  <span className="text-2xl font-black text-[#111111] font-mono">{currentROI.leakSaved}</span>
                  <span className="text-[10px] text-neutral-500 leading-normal block mt-1 font-semibold">Recouple average 2.4% cash discrepancies from checkout till skips.</span>
                </div>

                <div className="bg-[#FCFAF7] border border-sky-150 rounded-2xl p-4 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Time Reclaimed / Mo</span>
                  <span className="text-2xl font-black text-[#111111] font-mono">{currentROI.hoursSaved}</span>
                  <span className="text-[10px] text-neutral-500 leading-normal block mt-1 font-semibold">Estimated bookkeeping & invoice check duration saved directly.</span>
                </div>
              </div>

              {/* Conversion ROI Badge */}
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold block text-green-900 leading-none mb-1">Eenvoq Protection Verified</span>
                  <p className="text-slate-600 leading-relaxed font-semibold">Typical SaaS return metrics yield a <span className="text-green-700 font-extrabold">12x ROI</span> compared to license budgets in terms fees security.</p>
                </div>
              </div>

            </motion.div>

          </div>
        </div>


        {/* ==========================================
            SECTION 11: TRANSPARENT PRICING & TIER PLAN
            ========================================== */}
        <div className="w-full px-6 md:px-12 lg:px-20 max-w-7xl mx-auto py-20 scroll-mt-24 border-b border-neutral-100" id="pricing-tiers">
          
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <span className="bg-sky-100 border border-sky-200 text-sky-850 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Protected Pricing Plans
            </span>
            <h2 className="text-[32px] sm:text-[44px] font-sans font-black text-black tracking-tight leading-tight">
              Transparent, Zero-Lock-In Licensing.
            </h2>
            <p className="text-sm md:text-base text-neutral-500 max-w-2xl leading-relaxed font-sans font-medium">
              Choose the perfect plan for your terminal capacity. Upgrade or scale-down any time with absolutely zero cancellation fees.
            </p>

            {/* Annual/Monthly Billing Switcher with Discount badge */}
            <div className="flex items-center gap-3 pt-3">
              <span className={`text-xs font-bold font-sans ${!isAnnualPricing ? 'text-black font-black' : 'text-neutral-400'}`}>Monthly Billing</span>
              <button 
                onClick={() => setIsAnnualPricing(!isAnnualPricing)}
                className="w-12 h-6.5 rounded-full bg-neutral-200 p-1 flex items-center transition cursor-pointer relative"
                aria-label="Billing Interval Switcher"
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-sky-500 shadow-sm transition-all duration-150 transform ${isAnnualPricing ? 'translate-x-5.5' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold font-sans ${isAnnualPricing ? 'text-black font-black' : 'text-neutral-400'}`}>Annual Billing</span>
                <span className="bg-sky-100 border border-sky-200 text-[#0284c7] font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider leading-none">
                  Get 20% Off
                </span>
              </div>
            </div>
          </div>

          <motion.div 
            {...scrollRevealProps}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >

            {/* Plan 1: Business Starter */}
            <div className="bg-white border border-sky-100 rounded-[32px] p-8 space-y-6 flex flex-col text-left hover:border-sky-300 transition duration-150">
              <div className="space-y-1">
                <h3 className="font-sans font-black text-lg text-[#111111]">Business Starter</h3>
                <p className="text-xs text-neutral-400 font-sans font-semibold">Perfect for small retail shops and cashiers dockets tracking.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-black text-neutral-950 font-mono">
                  {isAnnualPricing ? "$8" : "$10"}
                </span>
                <span className="text-xs text-neutral-400 font-sans font-bold">/ month</span>
              </div>

              <button 
                onClick={onEnterApp}
                className="w-full bg-neutral-100 hover:bg-[#1e40af] hover:text-white text-neutral-800 font-bold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all duration-150 focus:outline-none"
              >
                Activate Free Trial
              </button>

              <div className="h-px bg-neutral-100" />

              <ul className="space-y-3.5 text-xs text-neutral-600 font-medium font-sans">
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Up to exactly 1 supervisor staff add</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Audited closures counting ledger</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Manual alert confirmation check</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Standard compliance reports</span>
                </li>
              </ul>
            </div>

            {/* Plan 2: School / Growth (Most Popular) */}
            <div className="bg-white border-2 border-sky-500 rounded-[32px] p-8 space-y-6 flex flex-col text-left relative transform md:-translate-y-2 shadow-sm">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-sky-500 text-white font-mono text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular plan
              </div>

              <div className="space-y-1">
                <h3 className="font-sans font-black text-lg text-[#111111]">School / Growth</h3>
                <p className="text-xs text-neutral-400 font-sans font-semibold">Perfect for private school registers, subscriber clubs and parishes.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-black text-neutral-950 font-mono">
                  {isAnnualPricing ? "$20" : "$25"}
                </span>
                <span className="text-xs text-neutral-400 font-sans font-bold">/ month</span>
              </div>

              <button 
                onClick={onEnterApp}
                className="w-full bg-[#1e40af] hover:bg-[#1a368f] text-white font-bold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/20"
              >
                Activate Free Trial
              </button>

              <div className="h-px bg-neutral-100" />

              <ul className="space-y-3.5 text-xs text-neutral-600 font-medium font-sans">
                <li className="flex items-center gap-2 text-neutral-950 font-bold">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Up to exactly 2 active supervisors (Double-Sentry)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Automated text tuition reminder queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Bank alert Paired reference signatures</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Forensic Till drift checks & alert emails</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Automated debtor locked profiles</span>
                </li>
              </ul>
            </div>

            {/* Plan 3: Institutional Enterprise */}
            <div className="bg-white border border-sky-100 rounded-[32px] p-8 space-y-6 flex flex-col text-left hover:border-sky-300 transition duration-150">
              <div className="space-y-1">
                <h3 className="font-sans font-black text-lg text-[#111111]">Institutional Enterprise</h3>
                <p className="text-xs text-neutral-400 font-sans font-semibold">Perfect for colleges, universities, large parishes, and retail networks.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-black text-neutral-950 font-mono">
                  {isAnnualPricing ? "$52" : "$65"}
                </span>
                <span className="text-xs text-neutral-400 font-sans font-bold">/ month</span>
              </div>

              <button 
                onClick={onEnterApp}
                className="w-full bg-neutral-100 hover:bg-[#1e40af] hover:text-white text-neutral-800 font-bold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all duration-150 focus:outline-none"
              >
                Activate Free Trial
              </button>

              <div className="h-px bg-neutral-100" />

              <ul className="space-y-3.5 text-xs text-neutral-600 font-medium font-sans">
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Unlimited Supervisor Sentries configuration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Custom bank transfer alert verification API hooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Full database backup archives access & CSVs</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-950 font-bold">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>Dedicated Onboarding Specialists support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-sky-500 stroke-[2.5]" />
                  <span>SLA uptime compliance targets (99.99%)</span>
                </li>
              </ul>
            </div>

          </motion.div>
        </div>


        {/* ==========================================
            SECTION 12: FREQUENTLY ASKED QUESTIONS (FAQ Accordion)
            ========================================== */}
        <div className="w-full bg-black py-20 text-white scroll-mt-24 border-y border-neutral-950" id="faq-accordion">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
            
            <div className="flex flex-col items-center text-center space-y-3 mb-16">
              <span className="bg-neutral-900 border border-neutral-800 text-sky-400 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Support Accordions
              </span>
              <h2 className="text-[32px] sm:text-[44px] font-sans font-black text-white tracking-tight leading-tight">
                Frequently Answered Objections.
              </h2>
              <p className="text-sm md:text-base text-neutral-400 max-w-2xl leading-relaxed font-sans font-medium">
                Here are critical explanations addressing data security audits, cash drawer offline logs, and setups.
              </p>
            </div>

            <motion.div 
              {...scrollRevealProps}
              className="max-w-3xl mx-auto space-y-4 text-left"
            >
              {[
                {
                  q: "What digital security precautions are implemented to guard audit trails?",
                  a: "Eenvoq anchors audit trails in a tamper-proof write-once ledger. Cashiers cannot modify, backdate, or clear entries once posted from active register terminals. Any modifications must be authorized by dual supervisors."
                },
                {
                  q: "How long does it take to migrate our existing Excel or school sheets?",
                  a: "Record migration takes less than 15 minutes. Our onboarding concierge cleans and executes your CSV tables, mapping historical debtor logs and student directories onto Eenvoq completely free of charge."
                },
                {
                  q: "Why is supervisor permission capped at exactly 2 roles on Growth plans?",
                  a: "Our data security audits reveal that having more than 2 managers creates internal loopholes where responsibilities overlap and checkout gaps get excused secretly. Exactly two supervisors guarantees clear, uncompromised sentry boundaries."
                },
                {
                  q: "Does the platform function offline when regional network towers fail?",
                  a: "Yes. Cashiers continue to log product checkouts and student terms on local browser memory. Transactions sync with our cloud databases automatically the instant connection restores."
                },
                {
                  q: "Are we locked into any contracts when subscribing?",
                  a: "Never. Eenvoq licenses run monthly or annually. You are absolutely free to cancel or adjust active tiers at any click without hidden fees or early cancellation penalties."
                }
              ].map((faq, idx) => {
                const isOpen = activeFAQ === idx;
                return (
                  <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-150">
                    <button
                      type="button"
                      onClick={() => setActiveFAQ(isOpen ? null : idx)}
                      className="w-full p-5 text-left font-extrabold text-sm md:text-base text-white hover:text-sky-400 font-sans flex items-center justify-between cursor-pointer select-none focus:outline-none"
                    >
                      <span className="pr-4">{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-5 h-5 shrink-0 text-sky-400" /> : <ChevronDown className="w-5 h-5 shrink-0 text-neutral-400" />}
                    </button>
                    {isOpen && (
                      <div className="p-5 pt-0 border-t border-neutral-900 bg-neutral-900/10 text-xs md:text-sm text-neutral-400 leading-relaxed font-sans font-normal select-text">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>

          </div>
        </div>


        {/* ==========================================
            SECTION 13: CUSTOMER SUPPORT & CONCIERGE
            ========================================== */}
        <div className="w-full bg-white py-20 border-b border-sky-100 scroll-mt-24" id="support-concierge">
          <motion.div 
            {...scrollRevealProps}
            className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left"
          >
            
            <div className="lg:col-span-6 space-y-6">
              <span className="bg-sky-50 border border-sky-100 text-sky-700 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                White-Glove Support
              </span>
              <h2 className="text-[32px] sm:text-[40px] font-sans font-black text-black tracking-tight leading-tight">
                Our Concierge Migration. Fully Done For You.
              </h2>
              <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-sans font-medium">
                Worrying about moving hundreds of historical rows and parent rosters often stalls software upgrades. We eliminate that fear completely:
              </p>
              
              <ul className="space-y-4 text-xs font-semibold text-neutral-800">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold">1-on-1 Migration Specialist</span>
                    <p className="text-neutral-400 font-normal mt-0.5">We map and clean your student rosters or checkout CSV tables for you.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold">24/7 Priority Live Channels</span>
                    <p className="text-neutral-400 font-normal mt-0.5">Reach real regional support agents over WhatsApp and phone immediately.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold">Cashier Screen training</span>
                    <p className="text-neutral-400 font-normal mt-0.5">Complimentary training sessions to get cashiers comfortable in 5 minutes.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-6 bg-[#FCFAF7] border border-sky-100 rounded-[32px] p-8 text-center space-y-4">
              <span className="text-[10px] font-mono text-sky-600 uppercase font-black tracking-wider block">CONTACT THE CONCIERGE DESK</span>
              <p className="text-sm text-neutral-500 leading-relaxed font-sans font-medium">
                Want a custom setup consultation for your academy, church dioceses, or chain supermarkets before initiating a trial?
              </p>
              
              <div className="h-px bg-sky-150 my-2" />

              <div className="space-y-2.5 text-xs text-left text-neutral-800 font-semibold max-w-sm mx-auto">
                <div className="flex items-center gap-2 p-3 bg-white border border-sky-100 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>Onboarding Desk: <span className="text-neutral-500 font-normal">concierge@eenvoq.com</span></span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white border border-sky-100 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>WhatsApp Concierge: <span className="text-neutral-500 font-normal">+234 (0) 803 129 8812</span></span>
                </div>
              </div>

              <button 
                onClick={onEnterApp}
                className="w-full bg-[#111111] hover:bg-black text-white hover:text-sky-300 font-bold py-3.5 rounded-full text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Connect With a Specialist
              </button>
            </div>

          </motion.div>
        </div>


        {/* ==========================================
            SECTION 14: THE FINAL CALL TO ACTION (Footer CTA)
            ========================================== */}
        <div className="w-full bg-neutral-900 py-20 px-6 text-center text-white relative overflow-hidden" id="final-cta-fold">
          <motion.div 
            {...scrollRevealProps}
            className="max-w-3xl mx-auto space-y-8 relative z-10"
          >
            
            <span className="bg-neutral-805 border border-sky-500/20 text-sky-400 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider select-none">
              Risk-Free Revenue Guard
            </span>

            <h2 className="text-[32px] sm:text-[48px] md:text-[56px] font-sans font-black tracking-tight leading-none text-white">
              Stop Till Leaks structures. Lock details now.
            </h2>

            <p className="text-sm md:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed font-sans font-medium">
              Start your 14-day premium trial today. Setup is fully automated, and historical migration takes under 15 minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 max-w-md mx-auto">
              <button
                onClick={onEnterApp}
                className="bg-[#1e40af] hover:bg-[#1a368f] text-white font-sans font-bold py-4.5 px-8 rounded-full text-sm uppercase tracking-wider transition shadow-lg w-full text-center flex items-center justify-center gap-2 hover:shadow-[#1e40af]/10"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={onEnterApp}
                className="bg-neutral-950 border border-neutral-800 hover:bg-neutral-900 text-white font-sans font-bold py-4.5 px-8 rounded-full text-sm uppercase tracking-wider transition w-full text-center flex items-center justify-center gap-2"
              >
                <span>Book Demo Screen</span>
              </button>
            </div>

            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono font-bold select-none pt-2">
              ✓ No contract. No credit card. Close account any instant.
            </p>
          </motion.div>
        </div>

          </>
        ) : activeSubPage === 'blog' ? (
          <div className="w-full max-w-4xl px-6 py-20 mx-auto font-sans text-left min-h-[65vh] flex flex-col justify-start animate-fade-in" id="standalone-blog-view">
            <div className="mb-8 flex items-center gap-2">
              <button 
                type="button"
                onClick={() => { setActiveSubPage('main'); window.scrollTo({ top: 0 }); }} 
                className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 bg-transparent border-0 cursor-pointer focus:outline-none"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
            
            <div className="space-y-3 mb-10">
              <span className="bg-sky-100 text-sky-850 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full inline-block font-mono">
                Featured Guides
              </span>
              <h1 className="text-[36px] sm:text-[44px] font-sans font-black text-black leading-tight tracking-tight">
                Business & Money Tips
              </h1>
              <p className="text-sm text-neutral-500 max-w-xl font-medium leading-relaxed">
                Simple, easy guides written in plain English to help you run a safe, successful business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 1,
                  title: "How to Stop Losing Money at the Cash Register",
                  date: "June 20, 2026",
                  p1: "Many small shops lose a bit of money every day. It could be a wrong entry, a missed receipt, or giving back the wrong change. In this simple guide, we show you three easy things you can do tonight to keep every coin safe.",
                  p2: "First, write down every single sale immediately. Never rely on your head or simple memory. Second, double-check your daily bank transfers manually. Third, lock down your cash register entries at night so they cannot be edited or erased later."
                },
                {
                  id: 2,
                  title: "Understanding Bank Alerts: Safe vs Fake Screen Tricks",
                  date: "June 18, 2026",
                  p1: "With more customers paying by mobile transfer, fake bank alert scams are on the rise. Fraudsters use computer apps to generate a screen that looks like a real bank message.",
                  p2: "To stay completely safe, never let a customer walk away just by showing you a screenshot on their phone. Always wait for the real notification to show up in your bank app, or use secure matching codes."
                },
                {
                  id: 3,
                  title: "Why Simple Bookkeeping Saves Your Business",
                  date: "June 15, 2026",
                  p1: "You do not need to be a math or accounting genius to run a happy business. Bookkeeping simply means writing down what came in and what went out of your store.",
                  p2: "When you keep your bookkeeping simple and regular, you always know if you are making a profit, how much stock you need to buy next week, and you can sleep peacefully at night."
                }
              ].map((post) => (
                <div 
                  key={post.id} 
                  className="bg-neutral-50/70 border border-neutral-100 rounded-[24px] p-6 flex flex-col h-full hover:border-sky-300 hover:shadow-sm transition duration-300 cursor-pointer text-left"
                  onClick={() => setExpandedBlogPost(expandedBlogPost === post.id ? null : post.id)}
                >
                  <span className="text-[10px] font-bold text-neutral-400 block mb-2">{post.date}</span>
                  <h3 className="text-lg font-bold text-neutral-900 leading-snug mb-3 hover:text-sky-600 transition">
                    {post.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed font-sans mb-4 shrink-0">
                    {post.p1}
                  </p>
                  
                  {expandedBlogPost === post.id && (
                    <div className="text-xs text-neutral-600 leading-relaxed font-sans mt-3 pt-3 border-t border-neutral-200/60 transition-all">
                      {post.p2}
                    </div>
                  )}
                  
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs font-bold text-sky-600">
                    <span>{expandedBlogPost === post.id ? "Close article" : "Read full guide →"}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 p-8 bg-sky-50 rounded-[32px] border border-sky-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 md:max-w-md">
                <h4 className="text-md font-bold text-[#1e40af]">Want to protect your business revenue?</h4>
                <p className="text-xs text-neutral-500 font-medium font-sans">Try our 100% automated cash matching tracker. No technical experience required.</p>
              </div>
              <button 
                type="button"
                onClick={onEnterApp}
                className="bg-[#1e40af] hover:bg-[#1a368f] text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition shrink-0 cursor-pointer"
              >
                Get Started Free
              </button>
            </div>
          </div>
        ) : activeSubPage === 'terms' ? (
          <div className="w-full max-w-3xl px-6 py-20 mx-auto font-sans text-left min-h-[65vh]" id="standalone-terms-view">
            <div className="mb-8 flex items-center gap-2">
              <button 
                type="button"
                onClick={() => { setActiveSubPage('main'); window.scrollTo({ top: 0 }); }} 
                className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-black bg-transparent border-0 cursor-pointer focus:outline-none"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
            
            <div className="space-y-3 mb-8">
              <span className="text-sky-800 text-[10px] font-bold uppercase tracking-widest bg-sky-55 border border-sky-100 px-3 py-1 rounded-full inline-block font-mono">
                Simple Terms & Conditions
              </span>
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
                Our Simple Rules Of Service
              </h1>
              <p className="text-xs text-neutral-400 font-mono font-bold uppercase">Effective Date: June 20, 2026</p>
            </div>

            <div className="space-y-6 text-xs text-neutral-600 leading-relaxed font-sans">
              <p>
                Welcome to <strong>Eenvoq</strong>. We create simple tools to help businesses, shops, and schools keep their money records secure. By using our website and application, you agree to these easy and plain rules.
              </p>
              
              <h3 className="font-extrabold text-neutral-900 text-sm">1. Secure Logins & PINs</h3>
              <p>
                You are responsible for keeping your register passwords and cashier PINs private. If you delegate entry codes to your staff or teammates, make sure they understand not to write them down where others can see them.
              </p>

              <h3 className="font-extrabold text-[#111111] text-sm">2. Free Trial & Simple Billing</h3>
              <p>
                We offer a totally free 14-day trial block. We do not ask for any credit card or lock you into contracts. You can close or delete your account at any second. If you choose to continue after your trial, we charge an honest, simple periodic subscription.
              </p>

              <h3 className="font-extrabold text-neutral-900 text-sm">3. Accountability Disclaimer</h3>
              <p>
                We build very smart systems to spot cash bookkeeping errors, receipt duplicates, and missing registers entries. However, we do not inspect your registers physically or act as police. You remain the overall captain of your store's physical vault safety.
              </p>
            </div>
          </div>
        ) : activeSubPage === 'privacy' ? (
          <div className="w-full max-w-3xl px-6 py-20 mx-auto font-sans text-left min-h-[65vh]" id="standalone-privacy-view">
            <div className="mb-8 flex items-center gap-2">
              <button 
                type="button"
                onClick={() => { setActiveSubPage('main'); window.scrollTo({ top: 0 }); }} 
                className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-black bg-transparent border-0 cursor-pointer focus:outline-none"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
            
            <div className="space-y-3 mb-8">
              <span className="text-emerald-800 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full inline-block font-mono">
                Simple Privacy Policy
              </span>
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
                How We Keep Your Stuff Safe
              </h1>
              <p className="text-xs text-neutral-400 font-mono font-bold uppercase">Effective Date: June 20, 2026</p>
            </div>

            <div className="space-y-6 text-xs text-neutral-600 leading-relaxed font-sans">
              <p>
                At <strong>Eenvoq</strong>, we believe your financial numbers belong to you. We protect your privacy very carefully using simple, safe rules.
              </p>

              <h3 className="font-extrabold text-neutral-900 text-sm">1. What We Collect</h3>
              <p>
                To help you track your sales registers, we securely store:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Your name and business email address.</li>
                <li>Your register logs, daily sales sums, and card receipts values.</li>
                <li>The login names of cashiers you add to your team list.</li>
              </ul>

              <h3 className="font-extrabold text-neutral-900 text-sm">2. We Never Share Your Records</h3>
              <p>
                We do not sell, rent, or lease your commercial transactions, stock counts, or emails to any advertising companies. Your sales records are private, and visible only to you and the supervisors you choose to authorize.
              </p>

              <h3 className="font-extrabold text-neutral-900 text-sm">3. Strong Security Safeguards</h3>
              <p>
                Everything is locked using modern sandboxed containers and secure database entryways. Cashiers are strictly restricted so they can never erase history or access administrative accounting secrets.
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl px-6 py-20 mx-auto font-sans text-left min-h-[65vh]" id="standalone-cookie-view">
            <div className="mb-8 flex items-center gap-2">
              <button 
                type="button"
                onClick={() => { setActiveSubPage('main'); window.scrollTo({ top: 0 }); }} 
                className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-black bg-transparent border-0 cursor-pointer focus:outline-none"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
            
            <div className="space-y-3 mb-8">
              <span className="text-amber-800 text-[10px] font-bold uppercase tracking-widest bg-amber-50 border border-amber-100 px-3 py-1 rounded-full inline-block font-mono">
                Simple Cookie Policy
              </span>
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
                Our Simple Browser Memory Rules
              </h1>
              <p className="text-xs text-neutral-400 font-mono font-bold uppercase">Effective Date: June 20, 2026</p>
            </div>

            <div className="space-y-6 text-xs text-neutral-600 leading-relaxed font-sans">
              <p>
                We use browser cookies and local memory to give you a fast, smooth, and reliable bookkeeping experience.
              </p>

              <h3 className="font-extrabold text-neutral-900 text-sm">1. No Ad Tracking Pixels</h3>
              <p>
                We do not put pesky advertising tracking chips or sales codes in your browser to follow you around the internet.
              </p>

              <h3 className="font-extrabold text-neutral-900 text-sm">2. Remember Choices Easily</h3>
              <p>
                We use small local cookies purely to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Remember if your store prefers using Dollars ($) or Naira (₦).</li>
                <li>Keep the cashier or team operator logged into their direct terminal tab.</li>
                <li>Cache receipts temporarily so you don't lose data if internet disconnects briefly.</li>
              </ul>

              <h3 className="font-extrabold text-neutral-900 text-sm">3. Clearing Browser Memory</h3>
              <p>
                You can wipe cookies and storage using browser options anytime. Note that doing so will reset your custom currency choices and log operators out of their current checkout station.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ==========================================
          CLASSIC BUTTER-STYLE GORGEOUS FOOTER AREA
          ========================================== */}
      <footer className="w-full bg-white border-t border-sky-100 py-16" id="landing-footer">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-5 gap-8 text-left">
          
          {/* Column 1: Logo & Mission */}
          <div className="md:col-span-2 space-y-4">
            {/* Logo Row */}
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => { setActiveSubPage('main'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <img 
                src="https://res.cloudinary.com/dee01jm0p/image/upload/e_bgremoval/f_auto,q_auto/1001135527_ij6c4q" 
                alt="Eenvoq logo" 
                className="h-8 w-auto object-contain select-none translate-y-1 [filter:drop-shadow(1px_0_0_#000)_drop-shadow(-1px_0_0_#000)_drop-shadow(0_1px_0_0_#000)_drop-shadow(0_-1px_0_0_#000)]" 
              />
            </div>

            {/* Description Paragraph */}
            <p className="text-xs text-neutral-400 max-w-xs leading-relaxed font-medium font-sans">
              Your friendly financial bookkeeping helper protecting small shops, schools, and organizations from deficits.
            </p>

            {/* Version Tag */}
            <div className="text-[10px] font-mono text-neutral-300 font-bold select-none">
              v2.5.0-CROButter
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-black uppercase text-neutral-900 tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs text-neutral-500 font-bold">
              <li><button onClick={() => { setActiveSubPage('main'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-sky-600 transition bg-transparent border-0 cursor-pointer font-bold px-0 p-0 text-left">About Us</button></li>
              <li><button onClick={() => { setActiveSubPage('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-sky-600 transition bg-transparent border-0 cursor-pointer font-bold px-0 p-0 text-left">System Blog</button></li>
              <li><button onClick={() => { setActiveSubPage('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-sky-600 transition bg-transparent border-0 cursor-pointer font-bold px-0 p-0 text-left">Terms of Use</button></li>
              <li><button onClick={() => { setActiveSubPage('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-sky-600 transition bg-transparent border-0 cursor-pointer font-bold px-0 p-0 text-left">Privacy Policy</button></li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-black uppercase text-neutral-900 tracking-wider">Solutions</h4>
            <ul className="space-y-2 text-xs text-neutral-500 font-bold">
              <li><button onClick={() => { setActiveSubPage('main'); }} className="hover:text-sky-600 transition bg-transparent border-0 cursor-pointer font-bold px-0 p-0 text-left">Supermarket Retailers</button></li>
              <li><button onClick={() => { setActiveSubPage('main'); }} className="hover:text-sky-600 transition bg-transparent border-0 cursor-pointer font-bold px-0 p-0 text-left">Private Educationalists</button></li>
              <li><button onClick={() => { setActiveSubPage('main'); }} className="hover:text-sky-600 transition bg-transparent border-0 cursor-pointer font-bold px-0 p-0 text-left">Parish Audit Desks</button></li>
              <li><button onClick={() => { setActiveSubPage('main'); }} className="hover:text-sky-600 transition bg-transparent border-0 cursor-pointer font-bold px-0 p-0 text-left">B2B Wholesales</button></li>
            </ul>
          </div>

          {/* Column 4: Newsletter Box */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-black uppercase text-neutral-900 tracking-wider">Stay Connected</h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              Join our list for expert tips regarding cash flow optimization.
            </p>
            <div className="flex gap-2 max-w-xs">
              <input 
                type="email" 
                placeholder="name@email.com" 
                className="bg-neutral-50 text-xs border border-sky-100 px-3 py-2.5 rounded-full flex-1 focus:outline-none focus:border-sky-900 text-neutral-800"
              />
              <button 
                type="button" 
                onClick={() => console.log("Subscribed")}
                className="bg-[#1e40af] text-white font-bold text-xs py-2 px-4 rounded-full hover:bg-[#1a368f] transition shadow-xs"
              >
                Join
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 pb-4 mt-12 border-t border-sky-50 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400 font-bold font-sans">
          <p className="text-center md:text-left">
            &copy; 2026 Eenvoq. Safeguarding Retail & Organizational Ecosystem Income. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0 font-sans">
            <span onClick={() => { setActiveSubPage('cookie'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-sky-600 transition cursor-pointer">Cookie Policy</span>
            <span onClick={() => { setActiveSubPage('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-sky-600 transition cursor-pointer">Privacy Policy</span>
            <span onClick={() => { setActiveSubPage('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-sky-600 transition cursor-pointer">Terms of Service</span>
            <span onClick={() => { setActiveSubPage('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-sky-600 transition cursor-pointer">Blog Page</span>
          </div>
        </div>
      </footer>

      {activeLegalTab && (
        <LegalPolicies activeTab={activeLegalTab} onClose={() => setActiveLegalTab(null)} />
      )}

    </div>
  );
}
