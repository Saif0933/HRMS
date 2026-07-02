import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Lock, Landmark, ArrowRight, ShieldCheck, Sparkles, RefreshCw, AlertCircle, Eye, Moon, Sun } from 'lucide-react';

export const Login: React.FC = () => {
  const { 
    employees, 
    setIsAuthenticated, 
    setCurrentUser, 
    setUserRole, 
    theme, 
    setTheme 
  } = useApp();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('123456');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Filter out a few interesting employees for quick-login shortcuts
  const demoUsers = [
    {
      id: 'EMP006',
      name: 'Karan Johar',
      role: 'HR Generalist (HR Admin)',
      phone: '9811223344',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120',
      systemRole: 'HR Admin' as const
    },
    {
      id: 'EMP002',
      name: 'Neha Patel',
      role: 'Engineering Manager',
      phone: '9823456789',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      systemRole: 'Manager' as const
    },
    {
      id: 'EMP001',
      name: 'Aarav Sharma',
      role: 'Senior UI Developer',
      phone: '9876543210',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      systemRole: 'Employee' as const
    }
  ];

  // OTP Countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic 10 digit check
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    // Verify if phone exists in mock data
    const matchedEmployee = employees.find(emp => {
      const cleanEmpPhone = emp.phone.replace(/\D/g, '');
      return cleanEmpPhone.endsWith(digitsOnly);
    });

    if (!matchedEmployee) {
      setError('This phone number is not registered in our HRMS database. Try one of the quick demo logins below!');
      return;
    }

    setLoading(true);

    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setTimer(30);
      setCanResend(false);
      // Auto-generate a random 6 digit code for showcase
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);
    }, 1200);
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next box if typed
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    if (otpCode !== generatedOtp && otpCode !== '123456') { // Allow '123456' as back door always
      setError('Invalid OTP code. Please check the code shown in the banner.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Find the employee by phone
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      const matchedEmployee = employees.find(emp => {
        const cleanEmpPhone = emp.phone.replace(/\D/g, '');
        return cleanEmpPhone.endsWith(digitsOnly);
      });

      if (matchedEmployee) {
        let role: 'HR Admin' | 'Manager' | 'Employee' = 'Employee';
        if (matchedEmployee.name === 'Karan Johar' || matchedEmployee.name === 'Shalini Sen' || matchedEmployee.department === 'Human Resources') {
          role = 'HR Admin';
        } else if (matchedEmployee.name === 'Neha Patel' || matchedEmployee.role.includes('Manager')) {
          role = 'Manager';
        }

        setCurrentUser(matchedEmployee);
        setUserRole(role);
        setIsAuthenticated(true);
      } else {
        setError('Verification failed. Unable to fetch employee record.');
      }
      setLoading(false);
    }, 1000);
  };

  const selectDemoUser = (user: typeof demoUsers[0]) => {
    setPhoneNumber(user.phone);
    setError('');
    setStep('phone');
    // Automate login process
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPhoneNumber(user.phone);
      setStep('otp');
      setTimer(30);
      setCanResend(false);
      setGeneratedOtp('123456'); // Fixed OTP for demo logins
      setOtp(['1', '2', '3', '4', '5', '6']);
    }, 600);
  };

  const resendOtp = () => {
    setTimer(30);
    setCanResend(false);
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setOtp(Array(6).fill(''));
    otpRefs.current[0]?.focus();
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background decoration elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/5"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-purple-900/5"></div>
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary p-2 rounded-xl text-white font-bold flex items-center justify-center shadow-lg shadow-primary/25">
            <Landmark className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-white tracking-wide text-xl leading-none">factoHR</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-1">Enterprise Suite</span>
          </div>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
          id="login-theme-toggle"
        >
          {theme === 'light' ? <Moon className="h-5 w-5 text-slate-600" /> : <Sun className="h-5 w-5 text-slate-350" />}
        </button>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center">
          
          {/* Welcome Branding Panel (Left side) */}
          <div className="hidden md:flex md:col-span-6 flex-col gap-6 pr-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Workforce Management</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              One Workspace, <br />
              <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Infinite Possibilities</span>
            </h1>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Verify your identity using your registered mobile number. Fast, passwordless, and secured with industry-grade multi-factor security protocols.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 backdrop-blur-md">
                <span className="block text-xl font-bold text-slate-800 dark:text-white">GPS/Selfie</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">Punch-in/out attendance tracking</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 backdrop-blur-md">
                <span className="block text-xl font-bold text-slate-800 dark:text-white">Smart Payroll</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">Automated processing & declarations</span>
              </div>
            </div>
          </div>

          {/* Form Panel (Right side) */}
          <div className="col-span-12 md:col-span-6 flex flex-col gap-6">
            <div className="glass dark:glass p-8 rounded-3xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-200/80 dark:border-slate-800/80 max-w-md w-full mx-auto relative overflow-hidden transition-all duration-300">
              
              {/* Form header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {step === 'phone' ? 'Welcome Back' : 'Security Verification'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {step === 'phone' 
                    ? 'Enter your mobile number to receive a verification OTP' 
                    : `We sent a 6-digit OTP code to +91 ${phoneNumber}`}
                </p>
              </div>

              {/* Error messages */}
              {error && (
                <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-fade-in" id="login-error-alert">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* OTP Hint Banner (Extremely helpful for development/testing) */}
              {step === 'otp' && (
                <div className="mb-5 p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs flex items-center justify-between font-medium animate-fade-in">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Your verification OTP code is:</span>
                  </div>
                  <span className="bg-primary text-white font-mono px-2 py-0.5 rounded text-sm tracking-wider font-bold">
                    {generatedOtp}
                  </span>
                </div>
              )}

              {/* Step 1: Phone Input Form */}
              {step === 'phone' && (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="phone-input" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-medium text-sm">
                        +91
                      </div>
                      <input
                        id="phone-input"
                        type="tel"
                        maxLength={10}
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').substring(0, 10))}
                        placeholder="Enter 10-digit number"
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                        disabled={loading}
                      />
                      <Phone className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phoneNumber.length !== 10}
                    className="w-full bg-primary hover:bg-primary/95 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none hover:translate-y-[-1px] active:translate-y-[0px]"
                    id="send-otp-btn"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                        Sending verification SMS...
                      </>
                    ) : (
                      <>
                        Get Verification OTP
                        <ArrowRight className="h-4.5 w-4.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification Form */}
              {step === 'otp' && (
                <form onSubmit={handleOtpSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                      6-Digit Security Code
                    </label>
                    <div className="flex gap-2 justify-between">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          type="text"
                          maxLength={1}
                          pattern="[0-9]*"
                          value={digit}
                          ref={(el) => (otpRefs.current[idx] = el)}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          className="w-11 h-12 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 text-center text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          disabled={loading}
                          id={`otp-field-${idx}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setOtp(Array(6).fill(''));
                        setError('');
                      }}
                      className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold hover:underline"
                    >
                      Change Number
                    </button>

                    {canResend ? (
                      <button
                        type="button"
                        onClick={resendOtp}
                        className="text-primary font-bold hover:underline"
                      >
                        Resend OTP code
                      </button>
                    ) : (
                      <span className="text-slate-400 font-medium">
                        Resend code in {timer}s
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full bg-primary hover:bg-primary/95 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none hover:translate-y-[-1px] active:translate-y-[0px]"
                    id="verify-otp-btn"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                        Verifying credentials...
                      </>
                    ) : (
                      <>
                        Verify & Access HRMS
                        <ShieldCheck className="h-4.5 w-4.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Quick Demo Accounts Selector (Bottom) */}
            <div className="w-full max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></span>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase shrink-0">
                  Quick Demo Workspace Accounts
                </span>
                <span className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {demoUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => selectDemoUser(user)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/40 hover:bg-white/90 dark:bg-slate-900/30 dark:hover:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 hover:border-primary/30 dark:hover:border-primary/30 shadow-sm transition-all hover:shadow hover:-translate-y-[1px] text-left group"
                    id={`demo-user-${user.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-primary/20 transition-all"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
                          {user.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 font-mono font-semibold">
                        +91 {user.phone.substring(0, 5)} {user.phone.substring(5)}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[10px] text-slate-400 dark:text-slate-600 border-t border-slate-200/50 dark:border-slate-900/50 z-10 bg-white/20 dark:bg-slate-950/20 backdrop-blur-sm">
        <span>© 2026 FactoCorp Solutions Private Limited. All rights reserved. Secured MFA Login.</span>
      </footer>

    </div>
  );
};

export default Login;
