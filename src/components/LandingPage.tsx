import React, { useState, useRef } from 'react';
import { 
  ArrowRight, ShieldCheck, Smartphone, RefreshCw, Zap, Users, Lock, 
  Truck, Shield, Activity, Database, ChevronDown, ChevronUp,
  Award, MessageCircle, Download, Clock, Star, ArrowLeft, ArrowRight as ArrowRightIcon,
  CheckCircle, AlertCircle, TrendingUp, DollarSign, Eye, PlayCircle
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  // Section 3: Interactive Business Type selection
  const [selectedBusiness, setSelectedBusiness] = useState<string>('items');

  // Interactive sheet & active simulation states
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [simulationMsg, setSimulationMsg] = useState<string | null>(null);

  // New Interactive Section States 
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [activeScannerLogs, setActiveScannerLogs] = useState<string[]>([
    "RECON-09: Initializing cash counting spooler...",
    "AUDIT-88: Verified bank-matching transfer signatures.",
    "MUTATION-01: Registered new cashier terminal connection."
  ]);
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [scannerAlertCount, setScannerAlertCount] = useState<number>(1);
  const [verifiedAdmins, setVerifiedAdmins] = useState<string[]>([
    "Yusuf Adebayo (Principal Admin)",
    "Chioma Nze (Store Manager)"
  ]);
  const [newAdminInput, setNewAdminInput] = useState<string>('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string, text: string, type: 'critical' | 'normal' }>>([
    { id: '1', text: "Till deficit identified at Register #2 (₦12,500 mismatch)", type: 'critical' },
    { id: '2', text: "Baba Sadiq exceeded 3-day past due overdraft terms", type: 'critical' },
    { id: '3', text: "Inventory forecast warning: Indomie Noodles below safe margin", type: 'normal' }
  ]);
  const [stockVelocity, setStockVelocity] = useState<number>(35); // simulated velocity
  
  // Testimonials Slider Ref and State
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState<number>(0);

  const testimonials = [
    {
      name: "Musa Danladi",
      title: "Proprietor, Danladi Group of Schools, Kaduna",
      stars: 5,
      comment: "Before Eenvoq, our cashiers would take tuition payments but delay writing receipt records, causing messy accounting and missing funds. Now, every single payment is tracked instantly. I deleted the manual ledger book permanently."
    },
    {
      name: "Chioma Anyanwu",
      title: "Founder, Beauty & Glow Retail, Enugu",
      stars: 5,
      comment: "My late cashier used to tell me 'the POS alert hasn't dropped' as an excuse to pocket cash or delay logging sales. With Eenvoq, the instant alert mapping stops the lying. I run this app safely while sitting at home!"
    },
    {
      name: "Pastor David Adebayo",
      title: "Heads of Finance, Grace Assembly, Lagos",
      stars: 5,
      comment: "Pledges, special projects, and direct offerings are sensitive things to audit. Having Eenvoq lets our administrative team register dockets offline and match bank reconciliations without manual spreadsheets."
    },
    {
      name: "Alhaji Ibrahim Kano",
      title: "Owner, Kano Grain Wholesalers, Kano",
      stars: 5,
      comment: "If you sell physical bags of grains, the manual sales record books get dirty or lost. With 2 taps on Eenvoq, we track cash drawers. Best part is the Max 2 Admins constraint - prevents crowded hands in our finances."
    },
    {
      name: "Kemi Alao",
      title: "Coordinator, Alao Book Clubs, Ibadan",
      stars: 5,
      comment: "Our subscription records used to be a mess. Customers would checkout even when their balances were outstanding. Eenvoq's overdraft block locks overdue members instantly. Our revenue recovery has gone up 40%!"
    },
    {
      name: "Fatima Yusuf",
      title: "Managing Director, Yusuf Supermarkets, Abuja",
      stars: 5,
      comment: "The forensic heatmap scan is magic. I can check register imbalances instantly without waiting for monthly reviews. This friendly, simple app is the best business auditor we've ever used."
    }
  ];

  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setActiveTestimonialIdx(prev => (prev > 0 ? prev - 1 : testimonials.length - 1));
    } else {
      setActiveTestimonialIdx(prev => (prev < testimonials.length - 1 ? prev + 1 : 0));
    }
  };

  const businessConfigs: Record<string, { title: string, explanation: string, stats: string }> = {
    items: {
      title: "I sell items",
      explanation: "Eenvoq automatically tracks product checkout, syncs your shelf levels, and flags physical register stock leaks without you writing down a single tally.",
      stats: "99.8% audit trail completeness over retail inventory goods."
    },
    services: {
      title: "I sell services",
      explanation: "Eenvoq logs booking fees, locks in customer verification, and confirms bank alerts so your daily service income matches perfectly with your accounts.",
      stats: "Instant SMS dockets sent on tuition or booking payments."
    },
    school: {
      title: "I run a school/church",
      explanation: "Eenvoq simplifies collection of tuition fees, administrative charges, or pledges, generating verified receipts that save hours of human manual records.",
      stats: "Limitless sub-account logging for school owners or heads."
    },
    subscriptions: {
      title: "I sell subscriptions",
      explanation: "Eenvoq verifies membership records, warns you of overdue accounts, and lets you track recurring receipts on a super simple dashboard.",
      stats: "Automatically locks overdue subscription accounts from checkout."
    }
  };

  const handleTriggerScanner = () => {
    setScannerActive(true);
    const mockLogs = [
      "SCANNING-REG-1... Mismatch found in Terminal cash registers.",
      "SCANNING-REG-2... Drawer opening without verified security signature!",
      "ALERT: Variance offset of -₦15,000 recorded.",
      "SYSTEM RECALIBRATED: Audit score synchronized successfully."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < mockLogs.length) {
        setActiveScannerLogs(prev => [mockLogs[i], ...prev.slice(0, 4)]);
        if (mockLogs[i].includes("ALERT")) {
          setScannerAlertCount(c => c + 1);
        }
        i++;
      } else {
        clearInterval(interval);
        setScannerActive(false);
      }
    }, 1200);
  };

  const handleAddLandingAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (!newAdminInput.trim()) return;
    if (verifiedAdmins.length >= 3) { // 1 owner + Max of 2 added admins = 3 total. Limit constraint!
      setAdminError("Access limit reached: Max of 2 additional Admins can be registered to manage the business.");
      return;
    }
    setVerifiedAdmins(prev => [...prev, `${newAdminInput.trim()} (Business Admin)`]);
    setNewAdminInput('');
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen font-sans text-[#1F1F1F] flex flex-col items-center overflow-x-hidden relative" id="eenvoq-landing-container">
      
      {/* 1. GLOBAL NAVIGATION HEADER */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between px-6 border-b border-[#E3E3E3]/60 max-w-7xl mx-auto" id="landing-navbar">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onEnterApp}>
          <span className="font-sans font-bold text-[#1F1F1F] tracking-tight text-[22px] select-none leading-none">eenvoq</span>
          <span className="bg-[#F0F4F9] border border-[#E3E3E3] text-[9px] font-mono font-bold text-blue-700 rounded-full px-2 py-0.5 uppercase tracking-wider hidden sm:inline-block">Audit Guard active</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onEnterApp}
            className="text-xs font-semibold text-[#5F6368] hover:text-[#1F1F1F] transition hidden sm:inline-block"
          >
            Terminal Login
          </button>
          <button
            onClick={onEnterApp}
            className="bg-[#000000] hover:bg-[#1A1A1A] text-[#FFFFFF] font-sans font-semibold py-2.5 px-5 rounded-full text-xs transition-all active:scale-95 shadow-none cursor-pointer"
            id="nav-cta-btn"
          >
            + Create Record
          </button>
        </div>
      </nav>

      {/* Main content viewport with desktop fluid wider boundaries */}
      <div className="w-full max-w-6xl mx-auto px-5 pt-28 pb-24 space-y-32">

        {/* 2. HERO SECTION */}
        <section className="space-y-8 animate-fade-in py-6 text-center max-w-3xl mx-auto" id="landing-hero-section">
          <div className="space-y-4">
            <span className="bg-amber-100 border border-amber-200 text-[10px] font-semibold text-amber-800 rounded-full px-3 py-1 uppercase tracking-wider inline-block">
              Goodbye Manual Record Stress
            </span>
            <h1 className="text-[40px] md:text-[56px] leading-[1.05] font-sans font-extrabold text-[#1F1F1F] tracking-tight" id="hero-headline">
              Stop losing money. <br/>Fire your sales recorder.
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#5F6368] leading-relaxed max-w-2xl mx-auto font-normal" id="hero-subheadline">
              You don't need complex, expensive accounting structures or a manual data entry person who logs false counts. Whether you run a school, church, subscription club, or physical shop, Eenvoq automatically catches leaks, tracks cash, and matches bank alerts. Total revenue auditing in 2 taps.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <button
              onClick={onEnterApp}
              className="bg-[#000000] hover:bg-[#1C1C1C] text-[#FFFFFF] font-sans font-bold py-4 px-8 rounded-full text-xs transition-all active:scale-95 shadow-none cursor-pointer flex-1 text-center flex items-center justify-center gap-2"
              id="hero-cta-btn"
            >
              <span>Automate my tracking now</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              onClick={onEnterApp}
              className="bg-white hover:bg-neutral-50 text-[#1F1F1F] border border-[#E3E3E3] font-sans font-bold py-4 px-8 rounded-full text-xs transition-all active:scale-97 cursor-pointer flex items-center justify-center gap-1"
            >
              <PlayCircle className="w-4 h-4 text-[#5F6368]" />
              <span>Watch demo video</span>
            </button>
          </div>
        </section>


        {/* SLIDABLE TESTIMONIALS SECTION OF 6 TESTIMONIALS */}
        <section className="space-y-8" id="testimonials-section">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Customer success stories
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Real business owners, school administrators, and physical retailers who took back master oversight of their hard-earned cash drawer balances.
            </p>
          </div>

          {/* Interactive Slidable Slider Row */}
          <div className="relative max-w-4xl mx-auto">
            {/* Cards container: dynamic transition depending on active testimonial */}
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm p-8 md:p-10 min-h-[220px] transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-center gap-1.5 text-amber-500">
                  {[...Array(testimonials[activeTestimonialIdx].stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-base md:text-lg text-neutral-800 font-medium italic leading-relaxed">
                  "{testimonials[activeTestimonialIdx].comment}"
                </blockquote>
                <div className="flex items-center justify-between border-t border-neutral-100 pt-5">
                  <div>
                    <h4 className="font-sans font-extrabold text-[#1F1F1F] text-sm md:text-base leading-none">
                      {testimonials[activeTestimonialIdx].name}
                    </h4>
                    <p className="text-[11px] md:text-xs text-neutral-500 font-sans mt-1">
                      {testimonials[activeTestimonialIdx].title}
                    </p>
                  </div>
                  {/* Slide numbering */}
                  <span className="text-xs font-mono text-neutral-400 font-bold">
                    {activeTestimonialIdx + 1} of {testimonials.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Slider Navigation controls positioned nicely below the card */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={() => scrollTestimonials('left')}
                className="w-10 h-10 rounded-full border border-[#E3E3E3] bg-white hover:bg-neutral-50 text-[#1F1F1F] inline-flex items-center justify-center cursor-pointer transition active:scale-90"
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              {/* Micro Dots indicator indicators */}
              <div className="flex gap-1.5">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTestimonialIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeTestimonialIdx === idx ? 'bg-black w-4' : 'bg-[#E3E3E3]'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollTestimonials('right')}
                className="w-10 h-10 rounded-full border border-[#E3E3E3] bg-white hover:bg-neutral-50 text-[#1F1F1F] inline-flex items-center justify-center cursor-pointer transition active:scale-90"
                aria-label="Next testimonial"
              >
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>


        {/* STATS SECTION WITH GRID CARDS ONLY FRIENDLY COPYS */}
        <section className="space-y-8" id="stats-section">
          {/* Header Description Stacked Vertically */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Real business impact partners trust
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              No complicated accounting formulas, no confusing metrics. Just human profit tracking by the numbers.
            </p>
          </div>

          {/* Grid Cards - stacked on mobile, horizontally positioned 3 columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Friendly Stat 1: Black Card with White Accents */}
            <div className="bg-[#111111] text-white p-8 rounded-[28px] border border-neutral-800 space-y-3 flex flex-col justify-between text-left">
              <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">Audit completeness</span>
              <p className="text-[44px] font-sans font-extrabold tracking-tight leading-none text-white my-1">99.8%</p>
              <h4 className="font-bold text-sm">Of revenue leaks identified</h4>
              <p className="text-xs text-neutral-450 leading-relaxed font-sans">
                Every cash payment, bank alert, and manual cashier ledger discrepancy is caught automatically, preventing cash loss.
              </p>
            </div>

            {/* Friendly Stat 2: Solid Blue Card */}
            <div className="bg-[#2563EB] text-white p-8 rounded-[28px] space-y-3 flex flex-col justify-between text-left">
              <span className="text-blue-105 font-mono text-xs font-bold uppercase tracking-wider">Salary recovery</span>
              <p className="text-[44px] font-sans font-extrabold tracking-tight leading-none text-white my-1">₦450K</p>
              <h4 className="font-bold text-sm">Saved each month</h4>
              <p className="text-xs text-blue-100 leading-relaxed font-sans">
                Stop paying extra personnel to sit down doing manual data entry. Let the audit engine work for free.
              </p>
            </div>

            {/* Friendly Stat 3: Clean White Card with Black border */}
            <div className="bg-white text-neutral-900 p-8 rounded-[28px] border-2 border-black space-y-3 flex flex-col justify-between text-left">
              <span className="text-[#5F6368] font-mono text-xs font-bold uppercase tracking-wider">Strict security locks</span>
              <p className="text-[44px] font-sans font-extrabold tracking-tight leading-none text-neutral-900 my-1">2 Max</p>
              <h4 className="font-bold text-sm">Additional administrators</h4>
              <p className="text-xs text-[#5F6368] leading-relaxed font-sans">
                Restricting administrative permissions ensures your financial core stays completely sealed and private.
              </p>
            </div>
          </div>
        </section>


        {/* HOW IT WORKS SECTION */}
        <section className="space-y-8" id="how-it-works-section">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              How the automated system works
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Three basic, friendly steps designed to be used by real business owners and store cashiers on any telephone.
            </p>
          </div>

          {/* Cards positioned horizontally on desktop (3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white border border-[#E3E3E3] p-6 rounded-[24px] space-y-3 text-left">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 font-mono font-bold text-xs flex items-center justify-center border border-amber-200">
                01
              </div>
              <h3 className="font-sans font-bold text-base text-[#1F1F1F]">Log terminal sales</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Your store supervisors or school cashiers easily record customer payments and product quantities directly into the simple app.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#E3E3E3] p-6 rounded-[24px] space-y-3 text-left">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 font-mono font-bold text-xs flex items-center justify-center border border-blue-200">
                02
              </div>
              <h3 className="font-sans font-bold text-base text-[#1F1F1F]">Generate digital signatures</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Eenvoq instantly stamps each checkout with a unique cryptographic receipt tag, sealing the record so cashiers can never delete or alter it silently.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#E3E3E3] p-6 rounded-[24px] space-y-3 text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center border border-emerald-250">
                03
              </div>
              <h3 className="font-sans font-bold text-base text-[#1F1F1F]">Instant variance alert</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                The platform compares register declarations with your bank incoming alerts, instantly highlighting any variance or physical deficits immediately.
              </p>
            </div>
          </div>
        </section>


        {/* BEFORE AND AFTER COMPARISON SECTION */}
        <section className="space-y-8" id="before-after-section">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Before and after comparison
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              See how moving your store tracking out of paper books and manual records into Eenvoq permanently safeguards your business assets.
            </p>
          </div>

          {/* Dual columns on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Before Card */}
            <div className="bg-rose-50/40 border border-rose-205 p-8 rounded-[28px] text-left space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-600 rounded-full" />
                <span className="font-mono text-[10px] font-bold text-rose-800 uppercase tracking-wider">Before Eenvoq (Manual headache)</span>
              </div>
              <ul className="space-y-3 text-xs text-rose-900 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 shrink-0">✕</span>
                  <span>Cashiers write sales in physical notebooks that can be misplaced or torn.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 shrink-0">✕</span>
                  <span>Supervisors take cash and delay writing receipts, opening the door to stolen profits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 shrink-0">✕</span>
                  <span>Spending hours matching bank alerts with paper registers at the end of the month.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 shrink-0">✕</span>
                  <span>No security logs or audit trails when records get changed or deleted.</span>
                </li>
              </ul>
            </div>

            {/* After Card */}
            <div className="bg-emerald-50/40 border border-emerald-250 p-8 rounded-[28px] text-left space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />
                <span className="font-mono text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-sans">After Eenvoq (Automated peace)</span>
              </div>
              <ul className="space-y-3 text-xs text-emerald-900 font-bold">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 shrink-0">✓</span>
                  <span>Receipts are saved on physical-backed databases permanently.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 shrink-0">✓</span>
                  <span>Immediate alerts confirm that a payment maps to bank transfers instantly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 shrink-0">✓</span>
                  <span>Variance analysis shows cash drawer shortages in real-time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 shrink-0">✓</span>
                  <span>Secure audits attribute modifications of any receipt back to the supervisor.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>


        {/* IMAGES IN GRIDS SECTION (HIFI VISUAL BLOCKS DEMO) */}
        <section className="space-y-8" id="visual-interface-grids">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Simple interface made for real-world tasks
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              No complex clutter. Discover a dashboard meticulously styled with clean visible borders, color-coded accents, and spacious visual elements.
            </p>
          </div>

          {/* Dynamic Images Grid Mockups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {/* Card 1: Vibrant Green Block */}
            <div className="bg-[#E6F4EA] border border-[#CCD7CE] p-6 rounded-[24px] flex flex-col justify-between text-left space-y-4 h-[220px]">
              <div>
                <Award className="w-6 h-6 text-green-700 stroke-[1.5]" />
                <h4 className="font-sans font-bold text-sm text-green-900 mt-3">Customer Loyalty Rewards</h4>
                <p className="text-[11px] text-green-800 leading-normal mt-1">
                  Loyalty marks are calculated with each docket print trace, rewarding repeat trust.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-green-700 bg-white border border-[#B3D9C1] px-2 py-0.5 rounded-full inline-block self-start">
                Ready to Print
              </span>
            </div>

            {/* Card 2: Pure Pitch Black Block */}
            <div className="bg-black text-white p-6 rounded-[24px] flex flex-col justify-between text-left space-y-4 h-[220px] border border-neutral-900">
              <div>
                <Lock className="w-6 h-6 text-neutral-400 stroke-[1.5]" />
                <h4 className="font-sans font-bold text-sm text-neutral-200 mt-3">Cryptographic Seals</h4>
                <p className="text-[11px] text-neutral-400 leading-normal mt-1">
                  Tamperproof signatures stop employees from back-dating or modifying totals.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-350 bg-neutral-850 border border-neutral-750 px-2 py-0.5 rounded-full inline-block self-start">
                Secure Hash Lock
              </span>
            </div>

            {/* Card 3: Deep Warm Ivory Block */}
            <div className="bg-[#FCF5E8] border border-[#ECDCCB] p-6 rounded-[24px] flex flex-col justify-[#FAF9F5] text-left space-y-4 h-[220px] justify-between">
              <div>
                <Clock className="w-6 h-6 text-amber-700 stroke-[1.5]" />
                <h4 className="font-sans font-bold text-sm text-amber-900 mt-3">Active Shift Tracker</h4>
                <p className="text-[11px] text-amber-805 leading-normal mt-1">
                  Know exactly when supervisors begin registers and audit cash variances instantly.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-white border border-[#ECCDAD] px-2 py-0.5 rounded-full inline-block self-start">
                Active core
              </span>
            </div>

            {/* Card 4: Light Blue Accent Block */}
            <div className="bg-[#E8F0FE] border border-[#CEDFFB] p-6 rounded-[24px] flex flex-col justify-between text-left space-y-4 h-[220px]">
              <div>
                <Activity className="w-6 h-6 text-blue-700 stroke-[1.5]" />
                <h4 className="font-sans font-bold text-sm text-blue-900 mt-3">POS & Webhook Sync</h4>
                <p className="text-[11px] text-blue-800 leading-normal mt-1">
                  Synchronizes instant alerts directly to owners when till mismatch variances exceed threshold values.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-white border border-[#B1CFF8] px-2 py-0.5 rounded-full inline-block self-start">
                Synced Nodes
              </span>
            </div>
          </div>
        </section>


        {/* 3. THE UNIVERSAL "CHOOSE YOUR BUSINESS" CHIPS */}
        <section className="space-y-8" id="business-selection-chips">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Simplicity for everyone
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              One singular audited engine fine-tuned for any transaction landscape. Pick yours below:
            </p>
          </div>
          
          {/* Scrollable Container */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 max-w-full justify-start md:justify-center flex-nowrap" id="business-chips-scroll">
            {Object.keys(businessConfigs).map((key) => {
              const active = selectedBusiness === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedBusiness(key)}
                  className={`py-3 px-5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                    active 
                      ? 'bg-[#1F1F1F] border-[#1F1F1F] text-white' 
                      : 'bg-[#FFFFFF] border-[#E3E3E3] text-[#5F6368] hover:border-[#757575]'
                  }`}
                >
                  {businessConfigs[key].title}
                </button>
              );
            })}
          </div>

          {/* Dynamic 1-sentence explanation card */}
          <div className="bg-white border border-neutral-200 p-8 rounded-[28px] text-left space-y-4 max-w-2xl mx-auto shadow-sm">
            <p className="text-sm md:text-base text-[#1F1F1F] leading-relaxed italic font-medium text-neutral-800">
              "{businessConfigs[selectedBusiness].explanation}"
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-blue-700 font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{businessConfigs[selectedBusiness].stats}</span>
            </div>
          </div>
        </section>


        {/* 4. THE "DAILY TRUTH CHECK" LEDGER */}
        <section className="space-y-8" id="truth-check-ledger-section">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              The daily truth check
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Instantly map drawer cash declarations against digital bank records. Any variance is automatically calculated and brought to light.
            </p>
          </div>
          
          {/* Cards positioned horizontally on desktop (3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-[#FFFFFF] border border-[#E3E3E3] p-6 rounded-[24px] flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-[#5F6368] font-bold uppercase tracking-wider font-mono">Expected Sales (Bank or POS record)</span>
              <span className="text-[28px] font-sans font-extrabold text-[#1F1F1F] tracking-tight mt-2">₦639,050</span>
              <p className="text-[9px] text-[#757575] mt-1.5 font-mono uppercase">Pulled from 18 verified digital receipts</p>
            </div>
            
            <div className="bg-[#FFFFFF] border border-[#E3E3E3] p-6 rounded-[24px] flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-[#5F6368] font-bold uppercase tracking-wider font-mono">Cash Declared (By Terminal Cashier)</span>
              <span className="text-[28px] font-sans font-extrabold text-[#1F1F1F] tracking-tight mt-2">₦725,050</span>
              <p className="text-[9px] text-[#757575] mt-1.5 font-mono uppercase">Manually inputted at late-shift closing time</p>
            </div>

            <div className="bg-red-50 border border-red-200 p-6 rounded-[24px] flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-red-700 font-bold uppercase tracking-wider font-mono">Daily Variance Deficit</span>
              <span className="text-[28px] font-sans font-extrabold text-red-700 tracking-tight mt-2">-₦86,000</span>
              <p className="text-[9px] text-red-650 mt-1.5 font-mono uppercase">Vulnerability Alert: High risk behavior identified</p>
            </div>
          </div>

          <p className="text-xs text-[#5F6368] leading-relaxed max-w-md mx-auto text-center font-sans font-normal">
            The platform computes physical deviations immediately, saving hours of strenuous manual bank reconciliation workflows and tracing.
          </p>
        </section>


        {/* 5. CLEAN FILTER CONTAINER DEMO */}
        <section className="space-y-8" id="clean-filter-demo-section">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              One-tap instant filters
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Browse raw transaction blocks categorized instantly by precise, responsive timeframes.
            </p>
          </div>
          
          <div className="bg-[#FFFFFF] border border-[#E3E3E3] rounded-[24px] p-3 flex items-center justify-between max-w-md mx-auto shadow-none">
            <div className="flex items-center gap-2 w-full justify-around">
              <button className="bg-[#D3E3FD] text-[#041E49] font-sans font-extrabold py-2.5 px-6 rounded-full text-xs cursor-pointer transition">
                Today
              </button>
              <button className="bg-transparent text-[#5F6368] hover:text-black font-sans font-normal py-2.5 px-6 rounded-full text-xs cursor-pointer transition">
                This Week
              </button>
              <button className="bg-transparent text-[#5F6368] hover:text-black font-sans font-normal py-2.5 px-6 rounded-full text-xs cursor-pointer transition">
                This Month
              </button>
            </div>
          </div>
          <p className="text-xs text-[#5F6368] max-w-xs mx-auto text-center">
            Zero complex multi-select dropdown panels or bloated interfaces. Pure on-the-go speed.
          </p>
        </section>


        {/* 6. THREE REPLACEMENTS WE MAKE (FEATURES) */}
        <section className="space-y-8" id="three-replacements-section">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              What we replace
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Traditional manual ledger processes leak essential store capital. Eenvoq introduces modern, non-compromised automation tools:
            </p>
          </div>
          
          {/* Cards positioned horizontally on desktop (3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            
            <div className="border border-[#E3E3E3] rounded-[28px] p-6 space-y-3 flex flex-col items-center bg-white text-center">
              <div className="w-12 h-12 rounded-full border border-[#E3E3E3] flex items-center justify-center bg-gray-50 text-[#1F1F1F]">
                <Smartphone className="w-6 h-6 stroke-[1.2]" />
              </div>
              <h3 className="font-sans font-bold text-base text-[#1F1F1F]">Replaces the sales recorder</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                No more paying redundant employee salaries to write down ledger logs in paper diaries where changes happen untraced.
              </p>
            </div>

            <div className="border border-[#E3E3E3] rounded-[28px] p-6 space-y-3 flex flex-col items-center bg-white text-center">
              <div className="w-12 h-12 rounded-full border border-[#E3E3E3] flex items-center justify-center bg-gray-50 text-[#1F1F1F]">
                <RefreshCw className="w-6 h-6 stroke-[1.2]" />
              </div>
              <h3 className="font-sans font-bold text-base text-[#1F1F1F]">Replaces the financial analyst</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Automatic mathematical variances, shrinkage warnings, and balance match calculations are compiled in real-time.
              </p>
            </div>

            <div className="border border-[#E3E3E3] rounded-[28px] p-6 space-y-3 flex flex-col items-center bg-white text-center">
              <div className="w-12 h-12 rounded-full border border-[#E3E3E3] flex items-center justify-center bg-gray-50 text-[#1F1F1F]">
                <ShieldCheck className="w-6 h-6 stroke-[1.2]" />
              </div>
              <h3 className="font-sans font-bold text-base text-[#1F1F1F]">Matches bank alerts</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Instantly matches registered store receipts with live cash transfers on the bank network, confirming payouts before customer departs.
              </p>
            </div>

          </div>
        </section>


        {/* 11. DETAILED REALTIME DISCREPANCY SCANNERS - BIG OBSIDIAN-BLACK CARD WITH GREEN ACCENTS */}
        <section className="space-y-8" id="new-section-discrepancy-scanner">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Autonomous heatmap scans
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Test the live terminal auditing component. Run a forensic register ledger check below:
            </p>
          </div>

          <div className="bg-[#111111] text-[#E3E3E3] rounded-[28px] p-6 text-left border border-neutral-800 space-y-4 shadow-xl max-w-2xl mx-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400 stroke-[1.5]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Terminal Forensic Core</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase tracking-widest ${
                scannerActive ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
              }`}>
                {scannerActive ? "Scanning..." : "Active"}
              </span>
            </div>

            {/* Simulated Live Logs */}
            <div className="bg-black/80 rounded-xl p-4 font-mono text-[10px] space-y-1.5 border border-neutral-800 h-28 overflow-y-auto">
              {activeScannerLogs.map((log, idx) => (
                <p key={idx} className={log.includes("ALERT") ? "text-rose-450 font-bold" : "text-neutral-405"}>
                  {log}
                </p>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-neutral-400">
                Warnings Flagged: <strong className="text-rose-400 font-mono text-xs">{scannerAlertCount}</strong>
              </div>
              <button
                type="button"
                disabled={scannerActive}
                onClick={handleTriggerScanner}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black text-[10px] font-bold py-2 px-4 rounded-full transition cursor-pointer"
              >
                {scannerActive ? "Forensic checking..." : "Trigger Live Scan"}
              </button>
            </div>
          </div>
        </section>


        {/* 12. DRAWER vs BANK Webhook LOGS - BENTO GRID WITH SIDE BY SIDE CARDS */}
        <section className="space-y-8" id="new-section-bank-reconciliation">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Bank-settled ledger proofs
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              How Eenvoq ensures that drawer cash declarations exactly reflect bank balances:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            {/* Big Blue Colored Card */}
            <div className="md:col-span-2 bg-[#2563EB] text-white p-8 rounded-[28px] flex flex-col justify-between space-y-6">
              <div>
                <Activity className="w-7 h-7 text-blue-200 stroke-[1.5]" />
                <h4 className="font-bold text-lg mt-3">Verified Cash Ingress</h4>
                <p className="text-xs text-blue-100 leading-relaxed mt-1">
                  When a payment matches the checkout dockets, Eenvoq records their cryptographic fingerprint, guaranteeing that funds arrived before drawer access is allowed.
                </p>
              </div>
              <div className="pt-2 border-t border-blue-500/30 text-[10px] font-semibold text-blue-100 flex items-center gap-1">
                <span>Confidence Score Guarantee:</span>
                <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded font-bold">100% Cryptographic</span>
              </div>
            </div>

            {/* Small White Card with Sharp Thin Black Borders */}
            <div className="bg-white border-2 border-black p-6 rounded-[28px] flex flex-col justify-between space-y-5">
              <div>
                <Lock className="w-6 h-6 text-black stroke-[2]" />
                <h4 className="font-sans font-extrabold text-[13px] text-black mt-2 leading-tight uppercase">Audit Logs Lock</h4>
                <p className="text-[10px] text-neutral-600 leading-normal mt-1">
                  Once saved in the secure logbook, receipt details cannot be altered without leaving a transparent audit trail.
                </p>
              </div>
              <span className="text-[9px] bg-black text-white px-2 py-0.5 rounded font-mono font-bold uppercase self-start">Protected</span>
            </div>
          </div>
        </section>


        {/* 13. THE ADMIN LIMIT AND PERMISSIONS MODULE (Max of 2 Admins) */}
        <section className="space-y-8" id="new-section-admin-management">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Delegate with ironclad safety
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Add dedicated administrators to audit your store terminals while restricting administrative authorization overhead.
            </p>
          </div>

          {/* Golden/Warm Accented Card containing the interactive validator wrapper */}
          <div className="bg-[#FAF7F0] border border-amber-300 rounded-[28px] p-6 text-left space-y-4 max-w-xl mx-auto">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-800" />
                <span className="text-xs font-bold font-sans text-amber-900 uppercase tracking-wide">Multi-Admin Console</span>
              </div>
              <span className="text-[9px] font-bold font-mono bg-amber-100 border border-amber-200 text-amber-800 px-2.5 py-0.5 rounded-full uppercase">
                Admin Limit: {verifiedAdmins.length - 1}/2 Added
              </span>
            </div>

            <p className="text-xs text-neutral-700 leading-relaxed font-sans">
              School owners require team operators to log audits without leaking critical root secrets. Limit extra administrative personnel to **exactly 2** so security profiles never bloat.
            </p>

            {/* Active admins in simulation */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Active Terminal Authorized Admins</p>
              <div className="space-y-1.5">
                {verifiedAdmins.map((adm, idx) => (
                  <div key={idx} className="bg-white border border-amber-200/60 p-2.5 rounded-xl text-xs flex items-center justify-between font-medium animate-fade-in">
                    <span className="text-neutral-800">{adm}</span>
                    <span className="text-[9px] font-mono text-emerald-700 font-extrabold uppercase">Granted</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Input Simulator */}
            <form onSubmit={handleAddLandingAdmin} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Eg. Ibrahim Musa (Supervisor)"
                  value={newAdminInput}
                  onChange={e => {
                    setNewAdminInput(e.target.value);
                    setAdminError(null);
                  }}
                  className="flex-1 bg-white border border-amber-200 rounded-full py-2.5 px-4 text-xs focus:outline-none focus:border-amber-500 text-[#1F1F1F]"
                />
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-900 text-white font-sans text-[11px] uppercase tracking-wide font-extrabold px-5 rounded-full transition cursor-pointer"
                >
                  + Add Admin
                </button>
              </div>

              {adminError && (
                <div className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-100 p-2 rounded-xl text-center">
                  ⚠️ {adminError}
                </div>
              )}
            </form>
          </div>
        </section>


        {/* 14. DISMISSABLE micro warnings stream - COLORFUL RED ACCENT & PLAYFUL MICRO-ALERTS CONTAINER */}
        <section className="space-y-8" id="new-section-notification-dismissal">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Instant push warnings
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Real-time checkout dockets generate active alerts whenever drawer changes occur. Tap any below to resolve on-the-go:
            </p>
          </div>

          <div className="space-y-2 max-w-md mx-auto text-left" id="critical-warnings-stack">
            {notifications.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-[20px] text-center text-xs text-emerald-800 font-semibold animate-fade-in">
                🎉 All workspace alerts are resolved. Safe operations guaranteed.
                <button 
                  onClick={() => setNotifications([
                    { id: '1', text: "Till deficit identified at Register #2 (₦12,500 mismatch)", type: 'critical' },
                    { id: '2', text: "Baba Sadiq exceeded 3-day past due overdraft terms", type: 'critical' }
                  ])}
                  className="block mx-auto mt-2 text-[10px] underline font-bold text-center cursor-pointer"
                >
                  Reload Alert Stream Simulation
                </button>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 animate-fade-in ${
                    n.type === 'critical' 
                      ? 'bg-rose-50/80 border-rose-200 text-rose-800' 
                      : 'bg-blue-50/80 border-blue-200 text-blue-800'
                  }`}
                >
                  <div className="flex gap-2.5 items-start">
                    <div className="w-4 h-4 rounded bg-rose-500 text-white flex items-center justify-center font-mono font-bold text-[9px] shrink-0 mt-0.5">
                      !
                    </div>
                    <p className="text-[11.5px] leading-normal font-sans font-medium">{n.text}</p>
                  </div>
                  <button
                    onClick={() => handleDismissNotification(n.id)}
                    className="p-1 hover:bg-black/5 rounded-full text-xs cursor-pointer transition shrink-0"
                    title="Dismiss alert"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </section>


        {/* 15. VELOCITY CALCULATOR & SUPPLY LEAKS - CARDS WITH SOLID VIBRANT EMERALD GREEN */}
        <section className="space-y-8" id="new-section-stock-planning">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Dynamic capital safeguards
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Avoid tying valuable school or business capital down in excess inventory supply blocks:
            </p>
          </div>

          <div className="bg-[#ECFDF5] border-2 border-emerald-600 p-6 rounded-[28px] text-left space-y-4 max-w-xl mx-auto">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
              <Truck className="w-5 h-5 text-emerald-750" />
              <span>Capital Restock Forecasting Engine</span>
            </div>

            <p className="text-xs text-[#1F1F1F] leading-relaxed">
              Eenvoq compares daily checkout registers with shelf volumes to forecast exact depletion days, so you replenish *exactly* what gets purchased.
            </p>

            {/* Interactive Calculator Slider */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-250 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Daily Sales Velocity:</span>
                <span className="font-mono text-emerald-800 font-bold">{stockVelocity} units / day</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={stockVelocity}
                onChange={e => setStockVelocity(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-ew-resize bg-gray-200 h-1.5 rounded-lg"
              />
              <div className="flex items-center justify-between text-[11px] font-sans text-neutral-600 border-t border-dashed border-neutral-100 pt-2 bg-neutral-50/50 p-2 rounded-xl">
                <span>Est. Storage Safety Margin:</span>
                <strong className="text-emerald-750 font-mono">
                  {Math.round(250 / stockVelocity)} days left
                </strong>
              </div>
            </div>
          </div>
        </section>


        {/* 16. OVERDRAFT & DEBTOR LOCK-DOWN LABELS - WHITE CARD WITH EXPLICIT BLACK FRAME LINE */}
        <section className="space-y-8" id="new-section-debt-restrictions">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Debt control overdraft holds
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Stop losing vital product items or services to outstanding accounts. Restrict additional checkout instantly.
            </p>
          </div>

          <div className="bg-white border-2 border-[#1F1F1F] p-6 rounded-[28px] text-left space-y-4 shadow-sm max-w-xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#1F1F1F] rounded-full animate-pulse" />
              <span className="text-xs font-bold font-sans tracking-wide uppercase text-black">Terminal Overdraft Blocking</span>
            </div>

            <p className="text-xs text-neutral-800 font-sans leading-relaxed">
              If client debts go past agreed dates, terminal operators are dynamically blocked from issuing extra receipts to that customer until credit overrides are cleared.
            </p>

            <div className="border border-[#E3E3E3] p-3 rounded-xl flex items-center justify-between text-xs bg-gray-50/80 font-mono font-bold">
              <span className="text-neutral-500">Baba Sadiq: Overdue Balance</span>
              <span className="text-rose-700">₦24,500</span>
            </div>
            
            <div className="flex items-center gap-2 bg-[#F3F4F6] p-2.5 rounded-xl text-[10.5px] border border-[#E5E7EB] text-neutral-700 font-medium">
              <Shield className="w-4 h-4 text-neutral-600 shrink-0" />
              <span>Status: Checkouts locked until bank deposit verified to credit nodes.</span>
            </div>
          </div>
        </section>


        {/* 17. THE FAQ ACCORDION PANEL - ACCORDION LIST WITH SOLID BORDERS */}
        <section className="space-y-8 bg-transparent" id="new-section-support-faq">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Frequently asked questions
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Learn more about how Eenvoq helps school and business owners secure daily profits with minimal effort.
            </p>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto text-left" id="landing-faq-accordion-container">
            {[
              {
                q: "What is an offline cryptographic receipt signature?",
                a: "Every transaction generates a unique alphanumeric signature sequence. Even if internet coverage fluctuates, cashier operators log dockets locally on devices, storing a compliance signature that verifies item checkout without data tampering."
              },
              {
                q: "How does the maximum of 2 admins rule benefit my security?",
                a: "Over-registration of management profiles leads to administrative chaos and credentials leaks. Limiting delegations to max 2 admins guarantees that the principal owner retains full master oversight while trusted supervisors maintain store operations."
              },
              {
                q: "Does Eenvoq charge commission per sales receipt?",
                a: "No commissions ever. Eenvoq charges a small flat monthly subscription of ₦45,000 for full premium workspace auditing tools, complete with active forensic logs and inventory planning reports."
              },
              {
                q: "Are my bank-settled records safe from prying eyes?",
                a: "Absolutely. All bank match records, ledger hashes, and inventory profiles are computed server-side, locked behind strict sandboxed encryption so nobody but you can view your real cash metrics."
              }
            ].map((faq, idx) => {
              const isOpen = activeFAQ === idx;
              return (
                <div key={idx} className="bg-[#FFFFFF] border-2 border-[#1F1F1F] rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => setActiveFAQ(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-[12.5px] text-black font-sans flex items-center justify-between cursor-pointer select-none"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 border-t border-[#E3E3E3] bg-[#F9FAFB] text-xs text-[#5F6368] leading-relaxed font-sans font-normal animate-fade-in select-text">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>


        {/* 7. CLICK-TO-ACT INTERACTIVE SHOWCASE */}
        <section className="space-y-8 relative" id="click-to-act-showcase">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Tap to fix active leaks
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Simulate isolating an active register variance immediately without calling expensive accountants or specialists:
            </p>
          </div>
          
          {/* Mockup Card acting as interactive trigger */}
          <div 
            onClick={() => setShowBottomSheet(!showBottomSheet)}
            className="border-2 border-black hover:border-black p-6 rounded-[28px] bg-white cursor-pointer select-none transition-all active:scale-98 relative group text-left max-w-xl mx-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold font-mono text-[#000000] border border-[#000000] px-2 py-0.5 rounded-full uppercase tracking-wide bg-neutral-50 font-sans">Leak Isolated</span>
              <span className="text-xs text-[#757575] font-sans font-semibold">Register #2</span>
            </div>
            
            <p className="text-sm text-[#1F1F1F] leading-snug font-sans font-bold">
              Discrepancy of ₦12,500 measured during late shift checkout.
            </p>

            <div className="mt-6 flex justify-between items-center pt-2">
              <span className="text-[11px] text-[#5F6368] font-bold font-sans">Swipe to analyze</span>
              <span className="text-[10px] bg-black text-white hover:bg-neutral-900 font-sans font-bold px-3 py-1.5 rounded-full uppercase tracking-wider leading-none select-none transition-all">
                {showBottomSheet ? "Close" : "Tap to fix leak"}
              </span>
            </div>
          </div>

          {/* Interactive Simulated Bottom-Sheet slide up */}
          {showBottomSheet && (
            <div className="bg-[#FFFFFF] border border-[#1F1F1F] rounded-[24px] p-5 shadow-lg select-none text-left space-y-4 animate-fade-in relative z-20 max-w-xl mx-auto">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-[#1F1F1F] uppercase font-sans tracking-wide">Autonomous Action Protocol</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              </div>
              <div className="h-px bg-neutral-100" />
              
              {simulationMsg ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-250 text-xs rounded-xl font-sans text-center select-none animate-fade-in">
                  <span className="font-semibold block mb-0.5">✓ {simulationMsg}</span>
                  <button 
                    onClick={() => setSimulationMsg(null)}
                    className="text-[10px] underline hover:text-emerald-950 cursor-pointer block mt-1 mx-auto font-medium"
                  >
                    Reset simulator trigger
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-[#5F6368] leading-relaxed">
                    Eenvoq flags the exact cashier profile active during the shortage. Choose automated resolution below:
                  </p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSimulationMsg("Shortage resolved: System recalibrated register #2 balances successfully.")}
                      className="w-full text-left bg-gray-50 border border-[#E3E3E3] hover:bg-neutral-100 text-[#1F1F1F] p-3 rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      1. Recalculate register ledger & banks
                    </button>
                    <button 
                      onClick={() => setSimulationMsg("Compliance warning dispatched: Electronic check-out locks deployed.")}
                      className="w-full text-left bg-gray-50 border border-[#E3E3E3] hover:bg-neutral-100 text-[#1F1F1F] p-3 rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      2. Apply automated compliance hold
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {!showBottomSheet && (
            <p className="text-[11px] text-[#757575] font-sans max-w-xs mx-auto text-center">
              Tap the card above to simulate taking action without hiring external accounting personnel.
            </p>
          )}
        </section>


        {/* 8. THE TRANSFORMATION MATRIX */}
        <section className="space-y-8" id="transformation-matrix-section">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              The transformation matrix
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Compare the old way with modern automated ledger capabilities:
            </p>
          </div>
          
          <div className="border border-[#E3E3E3] rounded-[28px] overflow-hidden text-left bg-white text-xs divide-y divide-[#E3E3E3] max-w-3xl mx-auto">
            <div className="p-6 space-y-2">
              <div className="font-bold uppercase tracking-wider text-[#757575] text-[10px]">The Old Way</div>
              <p className="text-[#5F6368] leading-relaxed text-xs font-normal">
                Paying expensive salaries for manual sales recorders, stressing over messy notebooks, manually cross-checking receipts against bank alerts, and chasing missing cash drawer shortages that Cashiers cover up.
              </p>
            </div>
            <div className="p-6 bg-[#F0F4F9] space-y-2">
              <div className="font-extrabold uppercase tracking-wider text-[#1F1F1F] text-[10px] flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#1C1C1C]" /> The Eenvoq Way
              </div>
              <p className="text-[#1F1F1F] leading-relaxed font-semibold text-xs">
                Zero staff overhead. Total clarity, automated matching, offline receipts signatures proof-of-work, and complete peace of mind in 2 taps.
              </p>
            </div>
          </div>
        </section>


        {/* 9. TRUST & SECURITY STANDARDS */}
        <section className="space-y-8" id="trust-security-section">
          {/* Header & Description Vertically Aligned */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-[26px] md:text-[34px] font-sans font-bold text-[#1F1F1F] tracking-tight">
              Unrivaled security and privacy
            </h2>
            <p className="text-sm text-[#5F6368] max-w-2xl leading-relaxed">
              Eenvoq encrypts your financial registers behind safe, certified sandbox protocols:
            </p>
          </div>
          
          <div className="border-2 border-black p-8 rounded-[28px] bg-white flex flex-col items-center space-y-4 max-w-xl mx-auto text-center">
            <div className="bg-[#D3E3FD]/50 border border-[#D3E3FD] px-4 py-1.5 rounded-full flex items-center justify-center gap-2 select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-black" />
              <span className="text-[10px] font-sans font-bold text-black uppercase tracking-wider">Guardian Status: Engaged</span>
            </div>
            
            <p className="text-sm font-semibold text-[#1F1F1F] leading-relaxed">
              Your financial records are completely safe, private, automated, and permanently verified on physical-backed servers.
            </p>
          </div>
        </section>


        {/* 10. THE CLOSING ACTION & FOOTER */}
        <section className="space-y-12 py-6 text-center" id="closing-and-footer-section">
          <div className="space-y-6">
            <h2 className="text-[28px] md:text-[32px] font-sans font-bold text-[#1F1F1F] leading-tight max-w-md mx-auto">
              Ready to eliminate overhead and secure your revenue?
            </h2>
            <div className="max-w-xs mx-auto">
              <button
                onClick={onEnterApp}
                className="bg-[#000000] hover:bg-[#1A1A1A] text-[#FFFFFF] font-sans font-bold py-4 px-8 rounded-full text-xs transition-all active:scale-95 shadow-none cursor-pointer w-full text-center flex items-center justify-center gap-2"
                id="footer-cta-action-btn"
              >
                <span>Automate my dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-12 border-t border-[#E3E3E3] space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="font-sans font-bold text-[#1F1F1F] tracking-tight text-[22px] select-none">eenvoq</span>
              <span className="text-[10px] font-mono text-neutral-400">v2.1.0-Auditor</span>
            </div>
            <p className="text-[11px] text-[#A2A2A2] font-sans" id="footer-links">
              &copy; 2026 Eenvoq. Safeguarding Retail & Educational Ecosystem Income. All Rights Reserved.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
