import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Employee, LeaveRequest, ClaimRequest, HelpTicket, FeedPost, Asset,
  initialEmployees, initialLeaveRequests, initialClaims, initialTickets, initialFeedPosts, initialAssets 
} from '../mockData';

export type { Employee, LeaveRequest, ClaimRequest, HelpTicket, FeedPost, Asset };

export type UserRole = 'Super Admin' | 'HR Admin' | 'Manager' | 'Employee';

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  details: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'leave' | 'claim' | 'system' | 'payroll' | 'performance';
}

interface AppContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  language: string;
  setLanguage: (lang: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeModule: string;
  setActiveModule: (module: string) => void;
  activeSubModule: string;
  setActiveSubModule: (sub: string) => void;
  selectedEmployeeId: string;
  setSelectedEmployeeId: (id: string) => void;
  
  // Data lists
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  claims: ClaimRequest[];
  setClaims: React.Dispatch<React.SetStateAction<ClaimRequest[]>>;
  tickets: HelpTicket[];
  setTickets: React.Dispatch<React.SetStateAction<HelpTicket[]>>;
  feedPosts: FeedPost[];
  setFeedPosts: React.Dispatch<React.SetStateAction<FeedPost[]>>;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, module: string, details: string) => void;
  
  // Search & Filters
  globalSearch: string;
  setGlobalSearch: (query: string) => void;
  
  // Notifications
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;

  // Authentication State
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  currentUser: Employee | null;
  setCurrentUser: (emp: Employee | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isAuthenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<string>('en');
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      return (localStorage.getItem('userRole') as UserRole) || 'HR Admin';
    } catch {
      return 'HR Admin';
    }
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('userRole', userRole);
  }, [userRole]);
  const getDefaultSubModule = (module: string): string => {
    switch (module) {
      case 'documents':
        return 'vault';
      case 'assets':
        return 'register';
      case 'letters':
        return 'generate';
      case 'helpdesk':
        return 'tickets';
      case 'employees':
        return 'directory';
      case 'attendance':
        return 'punch';
      case 'leave':
        return 'apply';
      case 'payroll':
        return 'process';
      case 'performance':
        return 'goals';
      case 'engagement':
        return 'feed';
      case 'claims':
        return 'apply-claim';
      case 'timesheets':
        return 'entry';
      case 'recruitment':
        return 'jobs';
      default:
        return 'overview';
    }
  };

  const getInitialModule = () => {
    const path = window.location.pathname.replace('/', '');
    const validModules = [
      'dashboard', 'employees', 'attendance', 'leave', 'payroll', 
      'performance', 'engagement', 'claims', 'timesheets', 
      'recruitment', 'documents', 'assets', 'letters', 'helpdesk'
    ];
    return validModules.includes(path) ? path : 'dashboard';
  };

  const [activeModule, setActiveModuleState] = useState<string>(getInitialModule());
  const [activeSubModule, setActiveSubModule] = useState<string>(getDefaultSubModule(getInitialModule()));

  const setActiveModule = (module: string) => {
    setActiveModuleState(module);
    setActiveSubModule(getDefaultSubModule(module));
    window.history.pushState(null, '', `/${module}`);
  };
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('EMP001');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  
  // Data States
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [claims, setClaims] = useState<ClaimRequest[]>(initialClaims);
  const [tickets, setTickets] = useState<HelpTicket[]>(initialTickets);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(initialFeedPosts);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "LOG001", user: "HR Admin (Karan Johar)", action: "Approved Leave Request", module: "Leave Management", timestamp: "Today, 10:15 AM", details: "Approved 4 days of Earned Leave for Ananya Roy (EMP008)" },
    { id: "LOG002", user: "System", action: "Asset Assigned", module: "Asset Management", timestamp: "Yesterday, 04:30 PM", details: "Assigned Asset AST-078 (ThinkPad L14) to Ananya Roy (EMP008)" },
    { id: "LOG003", user: "HR Admin (Karan Johar)", action: "Onboarded Employee", module: "Employee Master", timestamp: "2026-06-25, 11:00 AM", details: "Completed post-onboarding tasks for Ananya Roy" },
    { id: "LOG004", user: "CEO (Vikram Malhotra)", action: "Posted Announcement", module: "Employee Engagement", timestamp: "2026-06-30, 09:00 AM", details: "Announced Q2 customer satisfaction record" }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "NTF001", title: "New Leave Application", message: "Rohan Das applied for Sick Leave (3 days: Jul 1 - Jul 3)", time: "10 mins ago", read: false, type: "leave" },
    { id: "NTF002", title: "Claim Approval Pending", message: "Aarav Sharma submitted Travel claim of ₹3,200", time: "1 hour ago", read: false, type: "claim" },
    { id: "NTF003", title: "Payroll Submission Due", message: "Attendance cycle for June 2026 needs submission", time: "2 hours ago", read: false, type: "payroll" },
    { id: "NTF004", title: "Goal Review Open", message: "Q2 Performance cycle review is now open for engineering department", time: "1 day ago", read: true, type: "performance" }
  ]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    const root = window.document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Initial theme set
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '') || 'dashboard';
      setActiveModuleState(path);
      setActiveSubModule(getDefaultSubModule(path));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [theme]);

  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG${Math.floor(Math.random() * 100000)}`,
      user: userRole === 'HR Admin' ? 'HR Admin (Karan Johar)' : userRole === 'Manager' ? 'Manager (Neha Patel)' : 'Employee (Aarav Sharma)',
      action,
      module,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Also add to notifications for active alerts
    const newNotification: Notification = {
      id: `NTF${Math.floor(Math.random() * 100000)}`,
      title: action,
      message: details,
      time: "Just now",
      read: false,
      type: module.toLowerCase().includes('leave') ? 'leave' : module.toLowerCase().includes('claim') ? 'claim' : 'system'
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    setActiveModule('dashboard');
  };

  return (
    <AppContext.Provider value={{
      theme, setTheme,
      language, setLanguage,
      userRole, setUserRole,
      activeModule, setActiveModule,
      activeSubModule, setActiveSubModule,
      selectedEmployeeId, setSelectedEmployeeId,
      employees, setEmployees,
      leaveRequests, setLeaveRequests,
      claims, setClaims,
      tickets, setTickets,
      feedPosts, setFeedPosts,
      assets, setAssets,
      auditLogs,
      addAuditLog,
      globalSearch, setGlobalSearch,
      notifications, setNotifications,
      markAllNotificationsRead,
      clearNotification,
      isAuthenticated,
      setIsAuthenticated,
      currentUser,
      setCurrentUser,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
