import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, Users, Clock, CalendarDays, Wallet, Award, 
  Heart, Plane, Briefcase, FileText, Laptop, MailOpen, 
  HelpCircle, ChevronDown, ChevronRight, Menu, X, Landmark, ClipboardList
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  subItems?: { id: string; label: string }[];
}

export const Sidebar: React.FC = () => {
  const { activeModule, setActiveModule, activeSubModule, setActiveSubModule } = useApp();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'employees', 
      label: 'Employee Center', 
      icon: Users,
      subItems: [
        { id: 'directory', label: 'Employee Directory' },
        { id: 'master', label: 'Employee Master' },
        { id: 'orgchart', label: 'Organization Chart' },
        { id: 'exit', label: 'Exit & Settlement' },
        { id: 'bulk', label: 'Bulk Imports & Exports' },
        { id: 'roles', label: 'Role & Permissions' }
      ]
    },
    { 
      id: 'attendance', 
      label: 'Attendance', 
      icon: Clock,
      subItems: [
        { id: 'punch', label: 'GPS / Selfie Punch' },
        { id: 'roster', label: 'Shift & Roster' },
        { id: 'regularize', label: 'Regularization' },
        { id: 'muster', label: 'Muster Roll / Calendar' },
        { id: 'reports', label: 'Attendance Reports' }
      ]
    },
    { 
      id: 'leave', 
      label: 'Leave Management', 
      icon: CalendarDays,
      subItems: [
        { id: 'apply', label: 'Apply Leave' },
        { id: 'approvals', label: 'Leave Approvals' },
        { id: 'calendar', label: 'Leave Calendar' },
        { id: 'policies', label: 'Leave Policies' }
      ]
    },
    { 
      id: 'payroll', 
      label: 'Payroll Processing', 
      icon: Wallet,
      subItems: [
        { id: 'process', label: 'Salary Processing' },
        { id: 'loans', label: 'Loans & Advances' },
        { id: 'investment', label: 'Investment Declarations' },
        { id: 'payslips', label: 'Payslip Templates' },
        { id: 'reports', label: 'Payroll Reports & ECR' }
      ]
    },
    { 
      id: 'performance', 
      label: 'Performance (PMS)', 
      icon: Award,
      subItems: [
        { id: 'goals', label: 'KRA & Goal Setting' },
        { id: 'feedback', label: '360° Feedback' },
        { id: 'bellcurve', label: 'Bell Curve Analytics' }
      ]
    },
    { 
      id: 'engagement', 
      label: 'Engagement & Surveys', 
      icon: Heart,
      subItems: [
        { id: 'feed', label: 'Social Feed & Posts' },
        { id: 'mood', label: 'Mood Analysis' },
        { id: 'surveys', label: 'Surveys & Feedback' }
      ]
    },
    { 
      id: 'claims', 
      label: 'Travel & Claims', 
      icon: Plane,
      subItems: [
        { id: 'apply-claim', label: 'New Travel Request' },
        { id: 'my-claims', label: 'Expense Reimbursements' },
        { id: 'approvals', label: 'Claim Approvals' }
      ]
    },
    {
      id: 'timesheets',
      label: 'Timesheets',
      icon: ClipboardList,
      subItems: [
        { id: 'entry', label: 'Timesheet Entry' },
        { id: 'projects', label: 'Clients & Projects' }
      ]
    },
    { 
      id: 'recruitment', 
      label: 'Recruitment & ATS', 
      icon: Briefcase,
      subItems: [
        { id: 'jobs', label: 'Job Requisitions' },
        { id: 'candidates', label: 'Candidate Pipeline' },
        { id: 'onboarding', label: 'Pre-Onboarding Checklist' }
      ]
    },
    { id: 'documents', label: 'Document Vault', icon: FileText },
    { id: 'assets', label: 'Asset Management', icon: Laptop },
    { id: 'letters', label: 'Letter Generator', icon: MailOpen },
    { id: 'helpdesk', label: 'HR Help Desk', icon: HelpCircle }
  ];

  const handleModuleClick = (item: MenuItem) => {
    setActiveModule(item.id);
    if (item.subItems) {
      // Toggle dropdown if clicked and menu has subitems
      setOpenDropdown(openDropdown === item.id ? null : item.id);
      setActiveSubModule(item.subItems[0].id);
    } else {
      setOpenDropdown(null);
    }
  };

  const handleSubItemClick = (moduleId: string, subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModule(moduleId);
    setActiveSubModule(subId);
  };

  return (
    <aside 
      className={`bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out flex flex-col h-screen select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      } border-r border-slate-800 shrink-0`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800 bg-slate-950">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-white font-bold flex items-center justify-center shadow-lg shadow-primary/20">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white tracking-wide text-lg leading-none">factoHR</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Enterprise Suite</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="bg-primary p-2 rounded-lg text-white mx-auto">
            <Landmark className="h-5 w-5" />
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors hidden md:block"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronRight className="h-5 w-5 rotate-180" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1.5 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeModule === item.id;
          const isDropdownOpen = openDropdown === item.id || (isSelected && openDropdown === null);

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => handleModuleClick(item)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isSelected 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.subItems && (
                  <div>
                    {isDropdownOpen ? (
                      <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-white" />
                    )}
                  </div>
                )}
              </button>

              {/* Sub-menu Items */}
              {!isCollapsed && item.subItems && isDropdownOpen && (
                <div className="pl-9 space-y-1 border-l border-slate-800 ml-5 mt-1 animate-fade-in">
                  {item.subItems.map((sub) => {
                    const isSubSelected = isSelected && activeSubModule === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={(e) => handleSubItemClick(item.id, sub.id, e)}
                        className={`w-full text-left py-1.5 px-2 rounded-md text-xs font-normal transition-colors ${
                          isSubSelected
                            ? 'text-primary font-semibold bg-primary/10'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        {!isCollapsed ? (
          <div className="flex flex-col text-xs text-slate-500">
            <span className="font-semibold text-slate-400">FactoCorp HRMS v4.2</span>
            <span>Server: Cloud Secure</span>
            <span className="mt-1 flex items-center gap-1.5 text-[10px] text-green-500 font-bold uppercase">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-ping"></span>
              Live Sync Active
            </span>
          </div>
        ) : (
          <div className="h-2 w-2 bg-green-500 rounded-full mx-auto animate-pulse" title="System Online"></div>
        )}
      </div>
    </aside>
  );
};
