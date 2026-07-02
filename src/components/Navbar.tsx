import {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  Globe,
  HelpCircle,
  LogOut,
  MessageSquare,
  Moon,
  Search,
  ShieldAlert,
  Sun,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp, UserRole } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { 
    theme, setTheme, 
    language, setLanguage, 
    userRole, setUserRole, 
    setActiveModule, setActiveSubModule,
    notifications, markAllNotificationsRead, clearNotification,
    globalSearch, setGlobalSearch,
    currentUser, logout
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const currentUserName = currentUser ? currentUser.name : (userRole === 'HR Admin' ? 'Karan Johar' : userRole === 'Manager' ? 'Neha Patel' : 'Aarav Sharma');
  const currentUserRoleText = currentUser ? currentUser.role : (userRole === 'HR Admin' ? 'HR Administrator' : userRole === 'Manager' ? 'Engineering Manager' : 'Senior UI Developer');
  const currentUserAvatar = currentUser ? currentUser.avatar : (userRole === 'HR Admin' 
    ? "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120"
    : userRole === 'Manager'
    ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120");

  const languages = [
    { code: 'en', name: 'English (US)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setShowProfile(false);
    // Add brief alert
    const alertMsg = `Switched to ${role} workspace view.`;
    console.log(alertMsg);
  };

  const handleLogoClick = () => {
    setActiveModule('dashboard');
    setActiveSubModule('overview');
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-colors duration-200">
      
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Global search (e.g. employee name, asset, ticket)..." 
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-3">
        
        {/* Role Quick Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          <span>Role: {userRole}</span>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button 
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            title="Select Language"
          >
            <Globe className="h-5 w-5" />
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          
          {showLangDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setShowLangDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300"
                >
                  <span>{lang.name}</span>
                  {language === lang.code && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Calendar Shortcut */}
        <button 
          onClick={() => { setActiveModule('attendance'); setActiveSubModule('muster'); }}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          title="Attendance & Holidays Calendar"
        >
          <Calendar className="h-5 w-5" />
        </button>

        {/* Message Shortcut */}
        <button 
          onClick={() => { setActiveModule('engagement'); setActiveSubModule('feed'); }}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          title="Team Announcements"
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <span className="font-semibold text-slate-800 dark:text-white text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllNotificationsRead} 
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">No notifications.</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-850 flex gap-2.5 relative group ${!n.read ? 'bg-primary/5' : ''}`}>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">{n.time}</span>
                      </div>
                      <button 
                        onClick={() => clearNotification(n.id)}
                        className="text-slate-400 hover:text-red-500 self-start p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-850 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Shortcut */}
        <button 
          onClick={() => { 
            // open chat bot drawer or similar
            const chatbotEl = document.getElementById('factobot-chat-trigger');
            if (chatbotEl) chatbotEl.click();
          }}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Ask Factobot Help Desk"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img 
              src={currentUserAvatar}
              alt={currentUserName} 
              className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold leading-none text-slate-800 dark:text-white">{currentUserName}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none">{currentUserRoleText}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{currentUserName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{currentUserRoleText}</p>
              </div>

              {/* Interactive Role Switcher */}
              <div className="p-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase px-2 mb-1.5 block">Switch Workspace Role</span>
                {(['HR Admin', 'Manager', 'Employee'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      userRole === role
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{role} Perspective</span>
                    {userRole === role && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
              
              <button 
                onClick={() => { setActiveModule('employees'); setActiveSubModule('directory'); setShowProfile(false); }}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350"
              >
                My Profile Setup
              </button>
              <button 
                onClick={() => { setActiveModule('dashboard'); setShowProfile(false); }}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350"
              >
                Preferences
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
              <button 
                onClick={() => { logout(); setShowProfile(false); }}
                className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold transition-colors flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
