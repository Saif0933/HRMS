import {
    Clock
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface HelpTicket {
  id: string;
  employeeName: string;
  subject: string;
  category: 'IT' | 'HR' | 'Facilities' | 'Finance';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Pending' | 'Resolved';
  slaHoursLeft: number;
  date: string;
}

export const HelpDesk: React.FC = () => {
  const { activeSubModule, setActiveSubModule, addAuditLog, userRole, employees } = useApp();

  const activeUser = employees[0]; // Aarav Sharma

  // Tickets List State
  const [tickets, setTickets] = useState<HelpTicket[]>([
    { id: "TCK091", employeeName: "Aarav Sharma", subject: "Intranet VPN credentials not authenticating", category: "IT", priority: "High", status: "Open", slaHoursLeft: 4, date: "2026-06-30" },
    { id: "TCK092", employeeName: "Neha Patel", subject: "June tax deduction slips missing basic values", category: "Finance", priority: "Medium", status: "Pending", slaHoursLeft: 12, date: "2026-06-29" },
    { id: "TCK093", employeeName: "Rohan Das", subject: "New keycard access required for BKC wing", category: "Facilities", priority: "Low", status: "Resolved", slaHoursLeft: 0, date: "2026-06-25" }
  ]);

  // Form State
  const [tktSubject, setTktSubject] = useState('');
  const [tktCategory, setTktCategory] = useState<'IT' | 'HR' | 'Facilities' | 'Finance'>('IT');
  const [tktPriority, setTktPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [tktDesc, setTktDesc] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tktSubject.trim()) return;

    const newTkt: HelpTicket = {
      id: `TCK${Math.floor(Math.random() * 1000)}`,
      employeeName: activeUser.name,
      subject: tktSubject,
      category: tktCategory,
      priority: tktPriority,
      status: "Open",
      slaHoursLeft: tktPriority === 'High' ? 4 : tktPriority === 'Medium' ? 12 : 24,
      date: new Date().toISOString().split('T')[0]
    };

    setTickets(prev => [newTkt, ...prev]);
    addAuditLog("Logged Support Ticket", "Help Desk Center", `Raised support ticket: "${tktSubject}"`);
    alert(`Support ticket ${newTkt.id} created successfully! IT team has been notified.`);
    
    setTktSubject('');
    setTktDesc('');
    setActiveSubModule('tickets');
  };

  const handleResolveTicket = (id: string, subject: string) => {
    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, status: 'Resolved', slaHoursLeft: 0 } : t
    ));
    addAuditLog("Resolved Support Ticket", "Help Desk Center", `Resolved ticket ${id}: "${subject}"`);
    alert(`Ticket ${id} resolved! Notification dispatched to employee.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveSubModule('tickets')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'tickets' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Active Support Tickets
        </button>
        <button 
          onClick={() => setActiveSubModule('raise')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'raise' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Raise Support Ticket
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. TICKETS LIST & SLA                   */}
      {/* ======================================= */}
      {activeSubModule === 'tickets' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-xs">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2 flex items-center justify-between">
            <span>Help Desk Tickets Directory</span>
            <span className="bg-amber-100 text-amber-850 px-2 py-0.5 rounded-full font-bold">
              {tickets.filter(t => t.status !== 'Resolved').length} Open
            </span>
          </h3>

          <div className="space-y-3.5">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-850 dark:text-white">{t.subject}</span>
                    <span className="bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-bold">{t.id}</span>
                  </div>
                  <p className="text-slate-550 dark:text-slate-400 mt-1">
                    Raised by: <span className="font-semibold">{t.employeeName}</span> • Category: <span className="font-semibold">{t.category}</span> • Date: {t.date}
                  </p>
                  
                  {/* SLA Tracker */}
                  {t.status !== 'Resolved' && (
                    <div className="flex items-center gap-1.5 mt-2 text-rose-500 font-bold text-[10px]">
                      <Clock className="h-3.5 w-3.5" />
                      <span>SLA Time Left: {t.slaHoursLeft} Hours</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    t.priority === 'High' ? 'bg-rose-100 text-rose-700' : 
                    t.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {t.priority}
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    t.status === 'Resolved' ? 'bg-green-150 text-green-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}>
                    {t.status}
                  </span>

                  {t.status !== 'Resolved' && userRole === 'HR Admin' && (
                    <button 
                      onClick={() => handleResolveTicket(t.id, t.subject)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. RAISE SUPPORT TICKET                  */}
      {/* ======================================= */}
      {activeSubModule === 'raise' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-xs max-w-xl">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">File Support Ticket</h3>
            <p className="text-slate-400 mt-1">Submit support requests to IT Admin, Finance/Payroll, facilities management or Human Resources.</p>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Issue Subject Header</label>
              <input 
                type="text" 
                value={tktSubject} 
                onChange={(e) => setTktSubject(e.target.value)}
                placeholder="e.g. Broken display port or mouse adapter" 
                required 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-205"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Ticket SLA Category</label>
                <select 
                  value={tktCategory} 
                  onChange={(e) => setTktCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="IT">IT Infrastructure Support</option>
                  <option value="HR">HR Operations Queries</option>
                  <option value="Facilities">Facilities & BKC Access Cards</option>
                  <option value="Finance">Finance & Tax declaration claims</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Priority Level Severity</label>
                <select 
                  value={tktPriority} 
                  onChange={(e) => setTktPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="Low">Low Priority (24 Hr SLA)</option>
                  <option value="Medium">Medium Priority (12 Hr SLA)</option>
                  <option value="High">High Priority (4 Hr SLA)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Detailed Issue Description</label>
              <textarea 
                value={tktDesc} 
                onChange={(e) => setTktDesc(e.target.value)}
                placeholder="Provide specs, serial numbers or exact error logs..." 
                rows={4} 
                required 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
              />
            </div>

            <button 
              type="submit" 
              className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md shadow-primary/10"
            >
              Raise Support Ticket
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
