import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Chatbot } from './components/Chatbot';

// Modules imports
import { Dashboard } from './modules/Dashboard';
import { EmployeeManagement } from './modules/EmployeeManagement';
import { Attendance } from './modules/Attendance';
import { Leave } from './modules/Leave';
import { Payroll } from './modules/Payroll';
import { Performance } from './modules/Performance';
import { Engagement } from './modules/Engagement';
import { TravelClaims } from './modules/TravelClaims';
import { Timesheets } from './modules/Timesheets';
import { Recruitment } from './modules/Recruitment';
import { Documents } from './modules/Documents';
import { Assets } from './modules/Assets';
import { Letters } from './modules/Letters';
import { HelpDesk } from './modules/HelpDesk';

const MainLayout: React.FC = () => {
  const { activeModule, theme } = useApp();

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeModule === 'dashboard' && <Dashboard />}
          {activeModule === 'employees' && <EmployeeManagement />}
          {activeModule === 'attendance' && <Attendance />}
          {activeModule === 'leave' && <Leave />}
          {activeModule === 'payroll' && <Payroll />}
          {activeModule === 'performance' && <Performance />}
          {activeModule === 'engagement' && <Engagement />}
          {activeModule === 'claims' && <TravelClaims />}
          {activeModule === 'timesheets' && <Timesheets />}
          {activeModule === 'recruitment' && <Recruitment />}
          {activeModule === 'documents' && <Documents />}
          {activeModule === 'assets' && <Assets />}
          {activeModule === 'letters' && <Letters />}
          {activeModule === 'helpdesk' && <HelpDesk />}
        </main>
      </div>
      <Chatbot />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
