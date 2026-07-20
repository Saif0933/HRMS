import { AlertCircle, ArrowRight, Landmark, Moon, Mail, Lock, RefreshCw, ShieldCheck, Sparkles, Sun, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useLogin } from '../api/hook/useAuth';
import { useApp } from '../context/AppContext';

export const Login: React.FC = () => {
  const { 
    employees, 
    setIsAuthenticated, 
    setCurrentUser, 
    setUserRole, 
    theme, 
    setTheme 
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // TanStack Query Login Hook
  const loginMutation = useLogin();
  const loading = loginMutation.isPending || localLoading;

  // Filter out demo accounts for quick-login shortcuts
  const demoUsers = [
    {
      id: 'EMP005',
      name: 'Vikram Malhotra',
      role: 'Chief Executive Officer (Super Admin)',
      email: 'ceo@symbosys.com',
      password: '12345678',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
      systemRole: 'Super Admin' as const
    },
    {
      id: 'EMP006',
      name: 'Karan Johar',
      role: 'HR Generalist (HR Admin)',
      email: 'hr@symbosys.com',
      password: '12345678',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120',
      systemRole: 'HR Admin' as const
    },
    {
      id: 'EMP002',
      name: 'Neha Patel',
      role: 'Engineering Manager',
      email: 'manager@symbosys.com',
      password: '12345678',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      systemRole: 'Manager' as const
    },
    {
      id: 'EMP001',
      name: 'Aarav Sharma',
      role: 'Senior UI Developer',
      email: 'employee@symbosys.com',
      password: '12345678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      systemRole: 'Employee' as const
    }
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (response) => {
          const loggedUser = response.data?.user;
          if (loggedUser) {
            // Map user role using the database role
            let role: 'Super Admin' | 'HR Admin' | 'Manager' | 'Employee' = 'Employee';
            const dbRole = loggedUser.role;
            if (dbRole === 'SUPER_ADMIN' || dbRole === 'SUPER ADMIN' || loggedUser.name === 'Vikram Malhotra') {
              role = 'Super Admin';
            } else if (dbRole === 'HR_ADMIN' || dbRole === 'HR ADMIN' || loggedUser.name === 'Karan Johar' || loggedUser.name === 'Shalini Sen') {
              role = 'HR Admin';
            } else if (dbRole === 'MANAGER' || dbRole === 'Manager') {
              role = 'Manager';
            }

            // Find corresponding employee from mock lists/state, or create one:
            const matchedEmployee = employees.find(emp => emp.email?.toLowerCase() === loggedUser.email?.toLowerCase()) || {
              id: loggedUser.id,
              name: loggedUser.name || 'New User',
              email: loggedUser.email || '',
              phone: loggedUser.phone || '',
              role: role,
              department: 'Engineering',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
              status: 'Active' as const,
              joiningDate: new Date().toISOString().split('T')[0],
              location: 'Mumbai',
              manager: 'Neha Patel',
              basic: 30000, hra: 12000, allowance: 8000, deductions: 2000, netSalary: 38000,
              bankName: '', bankAccount: '', ifsc: '', pan: '', aadhaar: '', uan: '', pfNumber: '',
              gender: 'Male', dob: '1995-01-01', bloodGroup: 'O+', maritalStatus: 'Single',
              qualification: '', university: '', passingYear: '', pastCompanies: [],
              promotions: [], transfers: [], assets: [],
              probationDuration: '6 Months', probationEnd: '', confirmationStatus: 'Confirmed' as const
            };

            setCurrentUser(matchedEmployee as any);
            setUserRole(role);
            setIsAuthenticated(true);
          } else {
            setError('Verification failed. Unable to fetch user details.');
          }
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || err.message || 'Invalid email or password. Please try again.');
        },
      }
    );
  };

  const selectDemoUser = (user: typeof demoUsers[0]) => {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
    setLocalLoading(true);

    loginMutation.mutate(
      { email: user.email, password: user.password },
      {
        onSuccess: (response) => {
          setLocalLoading(false);
          const loggedUser = response.data?.user;
          if (loggedUser) {
            let role: 'Super Admin' | 'HR Admin' | 'Manager' | 'Employee' = 'Employee';
            const dbRole = loggedUser.role;
            if (dbRole === 'SUPER_ADMIN' || dbRole === 'SUPER ADMIN' || loggedUser.name === 'Vikram Malhotra') {
              role = 'Super Admin';
            } else if (dbRole === 'HR_ADMIN' || dbRole === 'HR ADMIN' || loggedUser.name === 'Karan Johar' || loggedUser.name === 'Shalini Sen') {
              role = 'HR Admin';
            } else if (dbRole === 'MANAGER' || dbRole === 'Manager') {
              role = 'Manager';
            }

            const matchedEmployee = employees.find(emp => emp.email?.toLowerCase() === loggedUser.email?.toLowerCase()) || {
              id: loggedUser.id,
              name: loggedUser.name || 'New User',
              email: loggedUser.email || '',
              phone: loggedUser.phone || '',
              role: role,
              department: 'Engineering',
              avatar: user.avatar,
              status: 'Active' as const,
              joiningDate: new Date().toISOString().split('T')[0],
              location: 'Mumbai',
              manager: 'Neha Patel',
              basic: 30000, hra: 12000, allowance: 8000, deductions: 2000, netSalary: 38000,
              bankName: '', bankAccount: '', ifsc: '', pan: '', aadhaar: '', uan: '', pfNumber: '',
              gender: 'Male', dob: '1995-01-01', bloodGroup: 'O+', maritalStatus: 'Single',
              qualification: '', university: '', passingYear: '', pastCompanies: [],
              promotions: [], transfers: [], assets: [],
              probationDuration: '6 Months', probationEnd: '', confirmationStatus: 'Confirmed' as const
            };

            setCurrentUser(matchedEmployee as any);
            setUserRole(role);
            setIsAuthenticated(true);
          }
        },
        onError: (err: any) => {
          setLocalLoading(false);
          setError(err.response?.data?.message || err.message || 'Failed to initialize demo login.');
        },
      }
    );
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
              Sign in to access your customized HRMS workspace, view payslips, claim expense reimbursements, apply for leaves, and collaborate with your team.
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
                  Welcome Back
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter your organization email and password to log in.
                </p>
              </div>

              {/* Error messages */}
              {error && (
                <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-fade-in" id="login-error-alert">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email-input" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                      disabled={loading}
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password-input" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                      disabled={loading}
                    />
                    <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none hover:translate-y-[-1px] active:translate-y-[0px]"
                  id="login-btn"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In to HRMS
                      <ArrowRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </form>
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
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 font-mono font-semibold hidden sm:inline-block">
                        {user.email}
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
