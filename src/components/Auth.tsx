import React, { useState, useEffect } from 'react';
import { Sparkles, User, Mail, Store, MapPin, Key, ArrowRight, CornerDownRight, ArrowLeft, ShieldCheck, Users } from 'lucide-react';
import { UserSession, TeamMember } from '../types';
import EenvoqIcon from './EenvoqIcon';

interface AuthProps {
  onLogin: (session: UserSession, operatorId: string) => void;
  onBackToLanding?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'otp' | 'operator-select';

export default function Auth({ onLogin, onBackToLanding }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Registration and onboarding state machine
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  // Operator PIN authentication states
  const [operatorsList, setOperatorsList] = useState<TeamMember[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [operatorPin, setOperatorPin] = useState<string>('');
  const [newOperatorPinConfirm, setNewOperatorPinConfirm] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Ensure we are scrolled to the top when the auth form switches modes or steps
  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [mode, registerStep]);
  
  // Captures
  const [name, setName] = useState('Chinedu Okafor');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('chinedu@grocerygate.ng');
  const [password, setPassword] = useState('password123');
  
  // Business Context
  const [storeName, setStoreName] = useState('GroceryGate Mega Stores');
  const [storeLocation, setStoreLocation] = useState('14 Broad Street, Lagos Island, Lagos');
  const [businessCategory, setBusinessCategory] = useState('Retail Store');
  const [customCategory, setCustomCategory] = useState('');

  // OTP and utility
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Directly bypasses for instant developer auditing
  const triggerBypass = (profileType: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      let sessionRole = profileType;
      let pName = "Chinedu Okafor";
      let pStore = "GroceryGate Mega Stores";
      let pEmail = "chinedu@grocerygate.ng";
      let pLoc = "14 Broad Street, Lagos Island, Lagos";

      if (profileType === 'School Owner') {
        pName = "Principal Florence Ademola";
        pStore = "Grace Heights Academy";
        pEmail = "florence@graceheights.edu.ng";
        pLoc = "22 Admiralty Way, Lekki Phase 1, Lagos";
      } else if (profileType === 'Church/Ministry') {
        pName = "Pastor Isaac Johnson";
        pStore = "The Redeemer Congregation";
        pEmail = "isaac@thecongregation.org";
        pLoc = "Gbagada Expressway, Gbagada, Lagos";
      } else if (profileType === 'Pharmacy') {
        pName = "Dr. Halima Yusuf";
        pStore = "Halima Care Pharmacy";
        pEmail = "halima@carerx.ng";
        pLoc = "90 Herbert Macaulay Way, Yaba, Kano";
      } else if (profileType === 'Subscription SaaS') {
        pName = "Nduka Nwosu";
        pStore = "Payflow Technologies Ltd";
        pEmail = "nduka@payflow.io";
        pLoc = "Digital Hub Workspace, Victoria Island, Lagos";
      }

      onLogin({
        name: pName,
        email: pEmail,
        storeName: pStore,
        role: sessionRole,
        storeLocation: pLoc,
      }, 'creator-primary');
    }, 450);
  };

  const handlePrefillType = (selectedRole: string, selectedName: string, selectedStore: string, preEmail: string) => {
    setName(selectedName);
    setStoreName(selectedStore);
    setBusinessCategory(selectedRole);
    setEmail(preEmail);
    setStoreLocation("90 Herbert Macaulay Way, Yaba, Lagos");
    setError("");
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please key in your full name.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please specify a genuine email address.");
      return;
    }
    if (password.length < 5) {
      setError("Password must have at least 5 characters.");
      return;
    }
    setError("");
    setRegisterStep(2);
  };

  const getOperators = () => {
    const saved = localStorage.getItem('eenvoq_team_members');
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        if (Array.isArray(loaded) && loaded.length > 0) {
          return loaded;
        }
      } catch (err) {}
    }
    // Fallback default operators matched to business
    return [
      { id: 'creator-primary', name: name || "System Owner", role: 'Owner', email: email || 'chinedu@grocerygate.ng', isCreator: true },
      { id: 'member-1', name: 'Amadi Kalu', role: 'Supervisor', email: 'amadi@grocerygate.ng' },
      { id: 'member-2', name: 'Funmi Alao', role: 'Cashier', email: 'funmi@grocerygate.ng' },
      { id: 'member-3', name: 'Ibrahim Musa', role: 'Auditor', email: 'ibrahim@grocerygate.ng' }
    ];
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      
      const finalRole = businessCategory === 'Other' ? (customCategory.trim() || 'Custom Business') : businessCategory;

      if (mode === 'login') {
        if (!email.includes('@') || password.length < 4) {
          setError('Invalid email or password credentials.');
          return;
        }
        
        // Load target operators list of the business
        const ops = getOperators();
        setOperatorsList(ops);
        setSelectedOperatorId(ops[0]?.id || 'creator-primary');
        setOperatorPin('');
        setNewOperatorPinConfirm('');
        setPinError('');
        
        // Slide to Intermediate Operator & Secret PIN confirmation step
        setMode('operator-select');
      } else if (mode === 'register') {
        if (!storeName.trim()) {
          setError("Please define your Business or Organization Name.");
          return;
        }
        setMode('otp');
      } else if (mode === 'otp') {
        if (otpCode !== '1234' && otpCode !== '') {
          setError('Incorrect verification code. Please write 1234 or leave empty.');
          return;
        }
        
        // Initialize default operator lock setup
        const ops = [
          { id: 'creator-primary', name: name || "System Owner", role: 'Owner', email: email || 'chinedu@grocerygate.ng', isCreator: true },
          { id: 'member-1', name: 'Amadi Kalu', role: 'Supervisor', email: 'amadi@grocerygate.ng' },
          { id: 'member-2', name: 'Funmi Alao', role: 'Cashier', email: 'funmi@grocerygate.ng' },
          { id: 'member-3', name: 'Ibrahim Musa', role: 'Auditor', email: 'ibrahim@grocerygate.ng' }
        ];
        localStorage.setItem('eenvoq_team_members', JSON.stringify(ops));
        setOperatorsList(ops);
        setSelectedOperatorId('creator-primary');
        setOperatorPin('');
        setNewOperatorPinConfirm('');
        setPinError('');
        
        setMode('operator-select');
      } else if (mode === 'forgot') {
        setMode('login');
      }
    }, 850);
  };

  const handleOperatorLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const selectedOperator = operatorsList.find(m => m.id === selectedOperatorId) || operatorsList[0];
      if (!selectedOperator) {
        setPinError("Could not resolve operator profile.");
        return;
      }

      // Check Concurrent Login sessions lock!
      // ONLY one operator can be logged in at a time.
      const lockStr = localStorage.getItem('eenvoq_concurrent_active_operator_session');
      if (lockStr) {
        try {
          const activeLock = JSON.parse(lockStr);
          if (activeLock && activeLock.id !== selectedOperator.id) {
            setPinError(`⚠️ Concurrent Access Blocked: Operator "${activeLock.name}" (${activeLock.role}) is currently active on this terminal. Only one operator session is permitted. You must wait for them to log out first.`);
            return;
          }
        } catch (err) {}
      }

      // If they have a pin set
      if (selectedOperator.pin) {
        if (operatorPin !== selectedOperator.pin) {
          setPinError("Incorrect 6-digit access PIN. Please try again.");
          return;
        }
      } else {
        // First-time setup, require them to setup the pin
        if (operatorPin.length !== 6) {
          setPinError("Your new secret PIN must be exactly 6 digits.");
          return;
        }
        if (operatorPin !== newOperatorPinConfirm) {
          setPinError("PIN inputs do not match. Please verify.");
          return;
        }

        // Save PIN for this operator
        const updatedOps = operatorsList.map(m => {
          if (m.id === selectedOperator.id) {
            return { ...m, pin: operatorPin };
          }
          return m;
        });
        localStorage.setItem('eenvoq_team_members', JSON.stringify(updatedOps));
        setOperatorsList(updatedOps);
      }

      // Lock concurrent session
      const concurrentLock = {
        id: selectedOperator.id,
        name: selectedOperator.name,
        role: selectedOperator.role,
        timestamp: Date.now()
      };
      localStorage.setItem('eenvoq_concurrent_active_operator_session', JSON.stringify(concurrentLock));
      localStorage.setItem('eenvoq_active_operator_id', selectedOperator.id);

      // Perform actual business entry
      const finalRole = businessCategory === 'Other' ? (customCategory.trim() || 'Custom Business') : businessCategory;
      onLogin({
        name: selectedOperator.name,
        email: selectedOperator.email,
        storeName: storeName || "GroceryGate Mega Stores",
        role: selectedOperator.role,
        storeLocation: storeLocation || "14 Broad Street, Lagos Island, Lagos",
      }, selectedOperator.id);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden border-t-[6px] border-[#0ea5e9]" id="login-screen-root">
      
      <div className="w-full max-w-md bg-white rounded-[28px] border border-[#E3E3E3] shadow-none overflow-hidden p-8 transition-all duration-300">
        
        {/* Universal brand logo block */}

        <div className="flex items-center gap-1 cursor-pointer" onClick={onBackToLanding}>
  {/* Logo Image (Solid logo with background removed via Cloudinary AI) */}
      <img 
        src="https://res.cloudinary.com/dee01jm0p/image/upload/e_bgremoval/f_auto,q_auto/1001135527_ij6c4q" 
        alt="eenvoq icon" 
        className="w-14 h-full object-contain [filter:drop-shadow(1px_0_0_#000)_drop-shadow(-1px_0_0_#000)_drop-shadow(0_1px_0_0_#000)_drop-shadow(0_-1px_0_0_#000)]" 
      />
</div>


        {error && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-full border border-red-100 font-sans mb-4 text-center" id="login-error-toast">
            {error}
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleAuthSubmit} className="space-y-4" id="auth-login-form">
            <div>
              <label className="block text-xs font-normal text-[#757575] mb-2 pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[#757575] stroke-[1.5]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all font-sans"
                  placeholder="name@store.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-[#757575] mb-2 pl-1">Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-3.5 w-4 h-4 text-[#757575] stroke-[1.5]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all font-sans"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-[#757575] hover:text-black font-normal cursor-pointer"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setRegisterStep(1);
                  setError("");
                }}
                className="text-[#000000] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                Create Account <ArrowRight className="w-3 h-3 stroke-[1.5]" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-800 text-white rounded-full py-3.5 text-xs font-semibold flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:bg-neutral-300"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4 stroke-[1.5]" /></>
              )}
            </button>
          </form>
        )}

        {/* MODE: OPERATOR SELECT & PIN VERIFY */}
        {mode === 'operator-select' && (
          <form onSubmit={handleOperatorLoginSubmit} className="space-y-4" id="auth-operator-select-form">
            <div className="border-b border-[#E3E3E3] pb-3 mb-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">Step 2: Terminal Entry Lock</span>
            </div>

            <div className="text-center pb-2">
              <h2 className="font-sans font-bold text-lg text-gray-900">Select Operator Profile</h2>
              <p className="text-[11px] text-[#757575] mt-1 max-w-xs mx-auto">
                Only one operator session can be active at any given time. Choose your name and input your secret 6-digit PIN.
              </p>
            </div>

            {pinError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100 font-sans text-center leading-relaxed font-medium">
                ⚠️ {pinError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#757575] mb-2 pl-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Choose Operator / Owner Profile</span>
              </label>
              <div className="relative">
                <select
                  value={selectedOperatorId}
                  onChange={(e) => {
                    setSelectedOperatorId(e.target.value);
                    setPinError('');
                    setOperatorPin('');
                    setNewOperatorPinConfirm('');
                  }}
                  className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 px-5 text-xs focus:outline-none focus:border-[#5F6368] focus:bg-white cursor-pointer transition-all font-sans font-bold appearance-none"
                >
                  {operatorsList.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.name} ({op.role}){op.isCreator ? " [Owner]" : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#757575]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* If the selected operator does NOT have a PIN, ask them to set up one securely! */}
            {!operatorsList.find(op => op.id === selectedOperatorId)?.pin ? (
              <div className="space-y-4">
                <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-2xl text-[10.5px] leading-relaxed text-amber-800">
                  ⚠️ <strong>Initialize Secret Access PIN:</strong> You have no credentials PIN set yet. You must create one now. Hand the device to this operator to set and lock their secret 6-digit PIN. Only they should know this.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#757575] mb-2 pl-1">Create 6-Digit PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={operatorPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 6) setOperatorPin(val);
                    }}
                    placeholder="••••••"
                    className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 px-5 text-center tracking-[0.5rem] text-lg font-mono font-bold focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#757575] mb-2 pl-1">Confirm 6-Digit PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={newOperatorPinConfirm}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 6) setNewOperatorPinConfirm(val);
                    }}
                    placeholder="••••••"
                    className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 px-5 text-center tracking-[0.5rem] text-lg font-mono font-bold focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#757575] mb-2 pl-1">Enter Secret 6-Digit PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={operatorPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setOperatorPin(val);
                  }}
                  placeholder="••••••"
                  className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 px-5 text-center tracking-[0.5rem] text-lg font-mono font-bold focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all"
                />
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setOperatorPin('');
                  setNewOperatorPinConfirm('');
                  setPinError('');
                }}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-500 rounded-full py-3 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer h-12"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black hover:bg-neutral-800 text-white rounded-full py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-neutral-300 h-12"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Access Terminal <ShieldCheck className="w-4 h-4 text-emerald-400" /></>
                )}
              </button>
            </div>
          </form>
        )}

        {/* MODE: REGISTER (MULTI-STEP) */}
        {mode === 'register' && registerStep === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4" id="auth-register-step-1">
            <div className="border-b border-[#E3E3E3] pb-3 mb-2">
              <span className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">Step 1 of 2: Personal Information</span>
            </div>

            <div>
              <label className="block text-xs font-normal text-[#757575] mb-2 pl-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-[#757575] stroke-[1.5]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all font-sans"
                  placeholder="Chinedu Okafor"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-[#757575] mb-2 pl-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 px-5 text-xs focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all h-[46px] font-sans"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-normal text-[#757575] mb-2 pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[#757575] stroke-[1.5]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all font-sans"
                  placeholder="chinedu@grocerygate.ng"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-[#757575] mb-2 pl-1">Choose Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-3.5 w-4 h-4 text-[#757575] stroke-[1.5]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all font-sans"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#757575] hover:text-black font-normal cursor-pointer"
              >
                Already have an account? Sign In
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-neutral-800 text-white rounded-full py-3.5 text-xs font-semibold flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              Next: Business Context <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </button>
          </form>
        )}

        {/* REGISTER STEP 2: BUSINESS CONTEXT */}
        {mode === 'register' && registerStep === 2 && (
          <form onSubmit={handleAuthSubmit} className="space-y-4" id="auth-register-step-2">
            <div className="border-b border-[#E3E3E3] pb-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">Step 2 of 2: Business Context</span>
              <button
                type="button"
                onClick={() => setRegisterStep(1)}
                className="text-[10px] text-[#757575] hover:text-black font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </div>

            <div>
              <label className="block text-xs font-normal text-[#757575] mb-2 pl-1">Business / Organization Name</label>
              <div className="relative">
                <Store className="absolute left-4 top-3.5 w-4 h-4 text-[#757575] stroke-[1.5]" />
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all font-sans"
                  placeholder="GroceryGate Mega Stores"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-[#757575] mb-2 pl-1">Primary Location / Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-[#757575] stroke-[1.5]" />
                <input
                  type="text"
                  required
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all"
                  placeholder="14 Broad Street, Lagos"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-[#757575] mb-2 pl-1">Business Category</label>
              <select
                value={businessCategory}
                onChange={(e) => {
                  setBusinessCategory(e.target.value);
                  setError("");
                }}
                className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 px-5 text-xs focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all h-[46px]"
              >
                <option value="Retail Store">Retail Store</option>
                <option value="Service Provider">Service Provider</option>
                <option value="School Owner">School Owner</option>
                <option value="Church/Ministry">Church/Ministry</option>
                <option value="Subscription SaaS">Subscription SaaS</option>
                <option value="Digital Products">Digital Products</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Smoothly reveal text input for manual Category typing */}
            {businessCategory === 'Other' && (
              <div className="space-y-1 animate-fade-in">
                <label className="block text-xs font-normal text-[#5F6368] mb-1 pl-1">Specify custom business category</label>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-white text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3 px-4 text-xs focus:outline-none focus:border-stone-550 focus:ring-0"
                  placeholder="e.g. Pharmacy / Hospital / Co-op"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-800 text-white rounded-full py-3.5 text-xs font-semibold flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:bg-neutral-300"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Complete Onboarding <ArrowRight className="w-4 h-4 stroke-[1.5]" /></>
              )}
            </button>
          </form>
        )}

        {/* MODE: OTP VERIFICATION */}
        {mode === 'otp' && (
          <form onSubmit={handleAuthSubmit} className="space-y-4" id="auth-otp-form">
            <div className="text-center p-2 mb-2 select-none">
              <span className="text-xs text-[#757575] font-sans block">We sent a verification SMS / email to securely bind this device.</span>
              <span className="text-[10px] font-mono text-neutral-400 mt-1 block">Verification tip: Write 1234 or leave empty to bypass</span>
            </div>

            <div>
              <label className="block text-xs font-normal text-[#757575] mb-2 pl-1">One-Time Passcode</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-[#FCFBF9] text-center tracking-widest text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 text-sm focus:outline-none focus:border-[#5F6368] font-mono"
                placeholder="1234"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-800 text-white rounded-full py-3.5 text-xs font-semibold flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:bg-neutral-300"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Verify & Enter App <ArrowRight className="w-4 h-4 stroke-[1.5]" /></>
              )}
            </button>
          </form>
        )}

        {/* MODE: FORGOT */}
        {mode === 'forgot' && (
          <form onSubmit={handleAuthSubmit} className="space-y-4" id="auth-forgot-form">
            <div className="text-center p-2 mb-2 select-none">
              <span className="text-xs text-[#757575] font-sans block">Enter email to restore access credentials.</span>
            </div>

            <div>
              <label className="block text-xs font-normal text-[#757575] mb-2 pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[#757575] stroke-[1.5]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-[#5F6368] focus:bg-white font-sans"
                  placeholder="name@store.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#757575] hover:text-black font-normal cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-800 text-white rounded-full py-3.5 text-xs font-semibold flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              Reset Password <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </button>
          </form>
        )}

        {/* Fully Functional Mock Sign-In Bypass Framework for Quick Dev Auditing */}
        {(mode === 'login' || mode === 'register') && (
          <div className="mt-8 pt-6 border-t border-[#E3E3E3]" id="auth-demo-preselect">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">⚡ Dev Testing Bypasses</h3>
              <span className="text-[8px] bg-neutral-100 text-[#1F1F1F] font-mono px-1.5 py-0.5 rounded-full select-none">Fully Functional</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2" id="prefill-list">
              <button
                type="button"
                onClick={() => triggerBypass("School Owner")}
                className="p-3 border border-[#E3E3E3] rounded-[24px] text-left bg-white hover:bg-[#F0F4F9] transition-all cursor-pointer group active:scale-95"
              >
                <div className="font-semibold text-xs text-[#1F1F1F] flex items-center justify-between">
                  <span>School Admin</span>
                  <CornerDownRight className="w-3 h-3 text-[#757575] stroke-[1.5] transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="text-[9px] text-[#757575] font-normal block mt-1">Florence (Grace Acad.)</span>
              </button>

              <button
                type="button"
                onClick={() => triggerBypass("Church/Ministry")}
                className="p-3 border border-[#E3E3E3] rounded-[24px] text-left bg-white hover:bg-[#F0F4F9] transition-all cursor-pointer group active:scale-95"
              >
                <div className="font-semibold text-xs text-[#1F1F1F] flex items-center justify-between">
                  <span>Ministry</span>
                  <CornerDownRight className="w-3 h-3 text-[#757575] stroke-[1.5] transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="text-[9px] text-[#757575] font-normal block mt-1">Pastor Isaac (Redeemer)</span>
              </button>

              <button
                type="button"
                onClick={() => triggerBypass("Pharmacy")}
                className="p-3 border border-[#E3E3E3] rounded-[24px] text-left bg-white hover:bg-[#F0F4F9] transition-all cursor-pointer group active:scale-95"
              >
                <div className="font-semibold text-xs text-[#1F1F1F] flex items-center justify-between">
                  <span>Pharmacy</span>
                  <CornerDownRight className="w-3 h-3 text-[#757575] stroke-[1.5] transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="text-[9px] text-[#757575] font-normal block mt-1">Dr. Halima CareRx</span>
              </button>

              <button
                type="button"
                onClick={() => triggerBypass("Subscription SaaS")}
                className="p-3 border border-[#E3E3E3] rounded-[24px] text-left bg-white hover:bg-[#F0F4F9] transition-all cursor-pointer group active:scale-95"
              >
                <div className="font-semibold text-xs text-[#1F1F1F] flex items-center justify-between">
                  <span>SaaS System</span>
                  <CornerDownRight className="w-3 h-3 text-[#757575] stroke-[1.5] transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="text-[9px] text-[#757575] font-normal block mt-1">Nduka Payflow</span>
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => triggerBypass("Retail Store")}
              className="w-full mt-3 py-2.5 px-4 text-xs font-semibold text-black hover:text-white bg-transparent hover:bg-[#000000] border border-[#E3E3E3] rounded-full transition-all duration-150 text-center cursor-pointer active:scale-98"
            >
              Direct Bypass (Lagos Retailer)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
