import React, { useState, useEffect } from 'react';
import { Sparkles, User, Mail, Store, MapPin, Key, ArrowRight, CornerDownRight, ArrowLeft, ShieldCheck, Users, Globe } from 'lucide-react';
import { UserSession, TeamMember } from '../types';
import EenvoqIcon from './EenvoqIcon';
import { supabase, isSupabaseConfigured, fetchStoreTeam } from '../lib/supabase';

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "United States", "United Kingdom", "Canada", "Australia", 
  "Germany", "France", "India", "United Arab Emirates", "Saudi Arabia", "Egypt", "Ethiopia", 
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", 
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", 
  "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", 
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Central African Republic", "Chad", 
  "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Congo (Democratic Republic)", 
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Denmark", "Djibouti", 
  "Dominica", "Dominican Republic", "Ecuador", "Eritrea", "Estonia", "Eswatini", "Fiji", "Finland", 
  "Gabon", "Gambia", "Georgia", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", 
  "Haiti", "Honduras", "Hungary", "Iceland", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", 
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", 
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", 
  "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", 
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nepal", 
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "North Korea", "North Macedonia", "Norway", "Oman", 
  "Pakistan", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", 
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Senegal", "Serbia", 
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", 
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", 
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", 
  "Tuvalu", "Uganda", "Ukraine", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", 
  "Zambia", "Zimbabwe"
];

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
  
  // Captures (Emptied for authentic login/registration as required)
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Business Context (Emptied for authentic registration)
  const [storeName, setStoreName] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [businessCategory, setBusinessCategory] = useState('Retail Store');
  const [customCategory, setCustomCategory] = useState('');

  // OTP and utility
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      { id: 'creator-primary', name: name || "System Owner", role: 'Owner', email: email || 'chinedu@grocerygate.ng', isCreator: true }
    ];
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalRole = businessCategory === 'Other' ? (customCategory.trim() || 'Custom Business') : businessCategory;

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('Please fill in both email and password.');
        setLoading(false);
        return;
      }

      // 1. SUPABASE LOGIN FLOW
      if (isSupabaseConfigured) {
        try {
          const { data: authData, error: authErr } = await supabase!.auth.signInWithPassword({
            email,
            password
          });

          if (authErr) {
            setError(`Authentication failed: ${authErr.message} (Code: ${authErr.status || 'AUTH_ERROR'})`);
            setLoading(false);
            return;
          }

          if (!authData.user) {
            setError('Auth succeeded but user object is missing.');
            setLoading(false);
            return;
          }

          // Fetch profile and store from Supabase
          const { data: profile, error: profileErr } = await supabase!
            .from('profiles')
            .select('*, store:stores(*)')
            .eq('id', authData.user.id)
            .single();

          if (profileErr || !profile) {
            setError(`Account found but locked: Your profile does not exist in the profiles table. Profile Error: ${profileErr?.message || 'NOT_FOUND'}`);
            setLoading(false);
            return;
          }

          // Fetch or prepare operator lists
          const ops = await fetchStoreTeam(profile.store_id || '');
          setOperatorsList(ops.length > 0 ? ops : [
            { id: profile.id, name: profile.name, role: profile.role, email: profile.email, pin: profile.pin || undefined, isCreator: true }
          ]);
          setSelectedOperatorId(profile.id);
          setOperatorPin('');
          setNewOperatorPinConfirm('');
          setPinError('');
          setMode('operator-select');

        } catch (err: any) {
          setError(`Database query error: ${err.message || err}`);
        } finally {
          setLoading(false);
        }
      } else {
        // 2. OFFLINE SIMULATED BACKEND
        try {
          const savedProfilesStr = localStorage.getItem('eenvoq_sim_profiles') || '[]';
          const profilesList: any[] = JSON.parse(savedProfilesStr);

          const matchedProfile = profilesList.find(p => p.email.toLowerCase() === email.toLowerCase());

          if (!matchedProfile) {
            setError(`Login failed: No profile with email "${email}" was found in the simulated profiles table. Error Code: USER_NOT_FOUND.`);
            setLoading(false);
            return;
          }

          if (matchedProfile.password !== password) {
            setError('Error Code: INVALID_PASSWORD - Password verification credentials did not match secure profile hashes.');
            setLoading(false);
            return;
          }

          const team = profilesList.filter(p => p.store_id === matchedProfile.store_id);
          setOperatorsList(team.length > 0 ? team : [matchedProfile]);
          setSelectedOperatorId(matchedProfile.id);
          setOperatorPin('');
          setNewOperatorPinConfirm('');
          setPinError('');
          setMode('operator-select');

        } catch (err: any) {
          setError(`Simulated DB Error: ${err.message || err}`);
        } finally {
          setLoading(false);
        }
      }

    } else if (mode === 'register') {
      if (!storeName.trim() || !storeLocation.trim()) {
        setError("Please supply both a Business Name and Location.");
        setLoading(false);
        return;
      }

      const fullLocation = storeLocation.trim() ? `${storeLocation.trim()}, ${country}` : country;

      // 1. SUPABASE REGISTER FLOW
      if (isSupabaseConfigured) {
        try {
          const { data: signUpData, error: signUpErr } = await supabase!.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                role: 'Owner',
                pin: '1234'
              }
            }
          });

          if (signUpErr) {
            setError(`Onboarding failed: ${signUpErr.message} (Code: ${signUpErr.status || 'SIGNUP_ERROR'})`);
            setLoading(false);
            return;
          }

          const user = signUpData.user;
          if (!user) {
            setError('Account verification pending/created but user session empty.');
            setLoading(false);
            return;
          }

          // Create the store record
          const { data: storeData } = await supabase!
            .from('stores')
            .select()
            .eq('owner_id', user.id);

          let storeId = '';
          if (storeData && storeData.length > 0) {
            storeId = storeData[0].id;
          } else {
            const { data: newStore, error: insertStoreErr } = await supabase!
              .from('stores')
              .insert([{
                name: storeName,
                location: fullLocation,
                currency: 'NGN',
                owner_id: user.id
              }])
              .select()
              .single();

            if (insertStoreErr) {
              setError(`Failed to lock business store: ${insertStoreErr.message}`);
              setLoading(false);
              return;
            }
            storeId = newStore.id;
          }

          // Update profiles relation
          await supabase!
            .from('profiles')
            .update({ store_id: storeId })
            .eq('id', user.id);

          setOperatorsList([{
            id: user.id,
            name: name,
            role: 'Owner',
            email: email,
            pin: undefined,
            isCreator: true
          }]);
          setSelectedOperatorId(user.id);
          setOperatorPin('');
          setNewOperatorPinConfirm('');
          setPinError('');
          setMode('operator-select');

        } catch (err: any) {
          setError(`Database flow connection failure: ${err.message || err}`);
        } finally {
          setLoading(false);
        }
      } else {
        // 2. SIMULATED REGISTRATION OFFLINE
        try {
          const savedProfilesStr = localStorage.getItem('eenvoq_sim_profiles') || '[]';
          const savedStoresStr = localStorage.getItem('eenvoq_sim_stores') || '[]';
          const profilesList: any[] = JSON.parse(savedProfilesStr);
          const storesList: any[] = JSON.parse(savedStoresStr);

          if (profilesList.some(p => p.email.toLowerCase() === email.toLowerCase())) {
            setError(`Error Code: EMAIL_ALREADY_EXISTS - The email "${email}" has already been locked in our simulated database.`);
            setLoading(false);
            return;
          }

          const mockUserId = `usr-${Date.now()}`;
          const mockStoreId = `str-${Date.now()}`;

          const newSimProfile = {
            id: mockUserId,
            name,
            email,
            password,
            role: 'Owner',
            pin: null,
            is_creator: true,
            store_id: mockStoreId
          };

          const newSimStore = {
            id: mockStoreId,
            name: storeName,
            location: fullLocation,
            currency: 'NGN',
            owner_id: mockUserId
          };

          profilesList.push(newSimProfile);
          storesList.push(newSimStore);

          localStorage.setItem('eenvoq_sim_profiles', JSON.stringify(profilesList));
          localStorage.setItem('eenvoq_sim_stores', JSON.stringify(storesList));

          setOperatorsList([{
            id: mockUserId,
            name,
            role: 'Owner',
            email,
            pin: undefined,
            isCreator: true
          }]);
          setSelectedOperatorId(mockUserId);
          setOperatorPin('');
          setNewOperatorPinConfirm('');
          setPinError('');
          setMode('operator-select');

        } catch (err: any) {
          setError(`Offline DB failure: ${err.message || err}`);
        } finally {
          setLoading(false);
        }
      }
    } else if (mode === 'forgot') {
      setMode('login');
    }
  };

  const handleOperatorLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setLoading(true);

    const selectedOperator = operatorsList.find(m => m.id === selectedOperatorId) || operatorsList[0];
    if (!selectedOperator) {
      setPinError("Could not resolve operator profile.");
      setLoading(false);
      return;
    }

    const lockStr = localStorage.getItem('eenvoq_concurrent_active_operator_session');
    if (lockStr) {
      try {
        const activeLock = JSON.parse(lockStr);
        if (activeLock && activeLock.id !== selectedOperator.id) {
          setPinError(`⚠️ Concurrent Access Blocked: Operator "${activeLock.name}" (${activeLock.role}) is currently active on this terminal. Only one operator session is permitted.`);
          setLoading(false);
          return;
        }
      } catch (err) {}
    }

    if (selectedOperator.pin) {
      if (operatorPin !== selectedOperator.pin) {
        setPinError("Incorrect 6-digit access PIN. Please try again.");
        setLoading(false);
        return;
      }
    } else {
      if (operatorPin.length !== 6 || !/^\d+$/.test(operatorPin)) {
        setPinError("Your new secret PIN must be exactly 6 digits.");
        setLoading(false);
        return;
      }
      if (operatorPin !== newOperatorPinConfirm) {
        setPinError("PIN inputs do not match. Please verify.");
        setLoading(false);
        return;
      }

      if (isSupabaseConfigured) {
        try {
          const { error: pinUpdateErr } = await supabase!
            .from('profiles')
            .update({ pin: operatorPin })
            .eq('id', selectedOperator.id);

          if (pinUpdateErr) {
            setPinError(`Failed to save PIN: ${pinUpdateErr.message}`);
            setLoading(false);
            return;
          }
        } catch (err: any) {
          setPinError(`Database PIN Sync error: ${err.message || err}`);
          setLoading(false);
          return;
        }
      } else {
        try {
          const savedProfilesStr = localStorage.getItem('eenvoq_sim_profiles') || '[]';
          const profilesList: any[] = JSON.parse(savedProfilesStr);
          const idx = profilesList.findIndex(p => p.id === selectedOperator.id);
          if (idx !== -1) {
            profilesList[idx].pin = operatorPin;
            localStorage.setItem('eenvoq_sim_profiles', JSON.stringify(profilesList));
          }
        } catch (err) {}
      }

      selectedOperator.pin = operatorPin;
    }

    const concurrentLock = {
      id: selectedOperator.id,
      name: selectedOperator.name,
      role: selectedOperator.role,
      timestamp: Date.now()
    };
    localStorage.setItem('eenvoq_concurrent_active_operator_session', JSON.stringify(concurrentLock));
    localStorage.setItem('eenvoq_active_operator_id', selectedOperator.id);

    let resolvedStoreName = storeName;
    let resolvedStoreLoc = storeLocation;

    if (isSupabaseConfigured) {
      try {
        const { data: profile } = await supabase!
          .from('profiles')
          .select('store_id, store:stores(*)')
          .eq('id', selectedOperator.id)
          .single();

        if (profile?.store) {
          resolvedStoreName = (profile.store as any).name;
          resolvedStoreLoc = (profile.store as any).location || '';
        }
      } catch (e) {}
    } else {
      try {
        const savedProfilesStr = localStorage.getItem('eenvoq_sim_profiles') || '[]';
        const savedStoresStr = localStorage.getItem('eenvoq_sim_stores') || '[]';
        const profilesList: any[] = JSON.parse(savedProfilesStr);
        const storesList: any[] = JSON.parse(savedStoresStr);
        const thisProfile = profilesList.find(p => p.id === selectedOperator.id);
        if (thisProfile) {
          const thisStore = storesList.find(s => s.id === thisProfile.store_id);
          if (thisStore) {
            resolvedStoreName = thisStore.name;
            resolvedStoreLoc = thisStore.location;
          }
        }
      } catch (e) {}
    }

    setLoading(false);
    onLogin({
      name: selectedOperator.name,
      email: selectedOperator.email,
      storeName: resolvedStoreName || "GroceryGate Mega Stores",
      role: selectedOperator.role,
      storeLocation: resolvedStoreLoc || "14 Broad Street, Lagos",
      storeId: isSupabaseConfigured ? (selectedOperator as any).store_id || null : null
    }, selectedOperator.id);
  };


  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden border-t-[6px] border-[#0ea5e9]" id="login-screen-root">
      
      <div className="w-full max-w-md bg-white rounded-[28px] border border-[#E3E3E3] shadow-none overflow-hidden p-8 transition-all duration-300">
        
        {/* Universal brand logo block */}

        <div className="flex items-center gap-2 justify-between mb-6">
          <div className="flex items-center gap-1 cursor-pointer" onClick={onBackToLanding}>
            {/* Logo Image (Solid logo with background removed via Cloudinary AI) */}
            <img 
              src="https://res.cloudinary.com/dee01jm0p/image/upload/e_bgremoval/f_auto,q_auto/1001135527_ij6c4q" 
              alt="eenvoq icon" 
              className="w-14 h-full object-contain [filter:drop-shadow(1px_0_0_#000)_drop-shadow(-1px_0_0_#000)_drop-shadow(0_1px_0_0_#000)_drop-shadow(0_-1px_0_0_#000)]" 
            />
          </div>
          <div>
            {isSupabaseConfigured ? (
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono font-bold uppercase rounded-full px-2.5 py-1 select-none">Live DB</span>
            ) : (
              <span className="text-[9px] bg-amber-100 text-amber-800 font-mono font-bold uppercase rounded-full px-2.5 py-1 select-none">Sandbox Mode</span>
            )}
          </div>
        </div>

        {/* Database Status Info Banners */}
        <div className="mb-4">
          {isSupabaseConfigured ? (
            <div className="py-2 px-3 bg-emerald-50 text-emerald-800 text-[10px] rounded-2xl border border-emerald-100 flex items-center gap-1.5 font-sans justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <strong>Production Live:</strong> Linked against your cloud tables securely!
            </div>
          ) : (
            <div className="py-2 px-3 bg-[#FCFBF9] text-amber-800 text-[10px] rounded-2xl border border-amber-100 flex items-center gap-1.5 font-sans justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <strong>Sandbox Active:</strong> Registers profiles inside a localized offline ledger.
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100 font-sans mb-4 text-center space-y-2.5" id="login-error-toast">
            <div>{error}</div>
            {(error.toLowerCase().includes('permission') || error.toLowerCase().includes('recursion') || error.toLowerCase().includes('onboarding') || error.toLowerCase().includes('fail') || error.toLowerCase().includes('database') || error.toLowerCase().includes('query')) && (
              <div className="pt-2 border-t border-red-200/40">
                <p className="text-[10px] text-red-600 mb-2 font-normal leading-relaxed">
                  Experiencing remote cloud permissions or schema locks? You can run locally:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('eenvoq_force_simulation_db', 'true');
                    window.location.reload();
                  }}
                  className="px-3.5 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-full text-[10px] uppercase tracking-wide font-semibold cursor-pointer transition shadow-xs inline-block"
                >
                  Switch to Offline Simulated Demo
                </button>
              </div>
            )}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-xs font-normal text-[#757575] mb-2 pl-1">Country</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 w-4 h-4 text-[#757575] stroke-[1.5]" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#FCFBF9] text-[#1F1F1F] border border-[#E3E3E3] rounded-full py-3.5 pl-12 pr-8 text-xs focus:outline-none focus:border-[#5F6368] focus:bg-white transition-all h-[46px] appearance-none"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <svg className="h-4 w-4 text-[#757575]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
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
      </div>
    </div>
  );
}
