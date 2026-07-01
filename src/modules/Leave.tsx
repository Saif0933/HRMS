import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, CalendarDays, FileText, CheckCircle, Clock, 
  Plus, Check, X, ShieldAlert, ArrowRight, User
} from 'lucide-react';

export const Leave: React.FC = () => {
  const { 
    leaveRequests, setLeaveRequests, activeSubModule, 
    setActiveSubModule, addAuditLog, userRole, employees 
  } = useApp();

  const activeUser = employees[0]; // Aarav Sharma

  // Application form state
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('2026-07-06');
  const [endDate, setEndDate] = useState('2026-07-07');
  const [reason, setReason] = useState('Personal work in hometown');
  const [days, setDays] = useState(2);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      id: `LRQ${Math.floor(Math.random() * 1000)}`,
      employeeId: activeUser.id,
      employeeName: activeUser.name,
      type: leaveType,
      startDate,
      endDate,
      days,
      reason,
      status: 'Pending' as const,
      appliedOn: new Date().toISOString().split('T')[0]
    };
    setLeaveRequests(prev => [newReq, ...prev]);
    addAuditLog("Applied Leave", "Leave Management", `${activeUser.name} applied for ${leaveType} (${days} days)`);
    alert(`Leave request submitted successfully! Request ID: ${newReq.id}`);
    
    // Clear form & redirect
    setReason('');
    setActiveSubModule('apply');
  };

  const handleApprove = (id: string, name: string) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    addAuditLog("Approved Leave Request", "Leave Management", `Approved leave request ${id} for ${name}`);
  };

  const handleReject = (id: string, name: string) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    addAuditLog("Rejected Leave Request", "Leave Management", `Rejected leave request ${id} for ${name}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveSubModule('apply')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'apply' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Apply / Balance
        </button>
        <button 
          onClick={() => setActiveSubModule('approvals')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'approvals' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Leave Approvals console
        </button>
        <button 
          onClick={() => setActiveSubModule('calendar')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'calendar' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Leave Calendar
        </button>
        <button 
          onClick={() => setActiveSubModule('policies')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'policies' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Leave Policies
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. APPLY LEAVE & BALANCE                */}
      {/* ======================================= */}
      {activeSubModule === 'apply' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          
          {/* Apply Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Apply for Leave</h3>
            
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Leave Type Category</label>
                <select 
                  value={leaveType} 
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Sick Leave">Sick Leave (SL)</option>
                  <option value="Earned Leave">Earned Leave (EL)</option>
                  <option value="Comp Off">Compensatory Off (Comp Off)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">End Date</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Total Days</label>
                <input 
                  type="number" 
                  value={days} 
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Reason for Leave</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide brief explanation..." 
                  rows={3} 
                  required 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/10 hover:scale-105 transition-all"
              >
                Apply Leave Request
              </button>
            </form>
          </div>

          {/* Leave Balances & History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Accrued Leave Balances</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-450 font-bold uppercase block text-[10px]">Casual Leave</span>
                <p className="text-lg font-black mt-1 text-slate-800 dark:text-white">8 / 12 Days</p>
                <span className="text-[9px] text-slate-400 block mt-1">1.0 Day credited monthly</span>
              </div>
              <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-450 font-bold uppercase block text-[10px]">Sick Leave</span>
                <p className="text-lg font-black mt-1 text-slate-800 dark:text-white">5 / 10 Days</p>
                <span className="text-[9px] text-slate-400 block mt-1">Rolls over annually</span>
              </div>
              <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-450 font-bold uppercase block text-[10px]">Earned Leave</span>
                <p className="text-lg font-black mt-1 text-slate-800 dark:text-white">12 / 18 Days</p>
                <span className="text-[9px] text-slate-400 block mt-1">Max 30 days rollover</span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <span className="font-bold text-slate-800 dark:text-white text-xs block">My Leave Request Log</span>
              {leaveRequests.filter(r => r.employeeId === activeUser.id).map((req) => (
                <div key={req.id} className="p-3 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white">{req.type}</span>
                      <span className="text-[10px] text-slate-400">Applied on: {req.appliedOn}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      {req.startDate} to {req.endDate} ({req.days} days) • Reason: "{req.reason}"
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    req.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' :
                    req.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse' :
                    'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. LEAVE APPROVALS CONSOLE              */}
      {/* ======================================= */}
      {activeSubModule === 'approvals' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-xs">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2 flex items-center justify-between">
            <span>Pending Team Leave Requests</span>
            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
              {leaveRequests.filter(r => r.status === 'Pending').length} Pending
            </span>
          </h3>

          <div className="space-y-3">
            {leaveRequests.filter(r => r.status === 'Pending').length === 0 ? (
              <p className="text-slate-400 text-center py-6">All leave applications have been processed.</p>
            ) : (
              leaveRequests.filter(r => r.status === 'Pending').map((req) => (
                <div key={req.id} className="p-4 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white">{req.employeeName}</span>
                      <span className="bg-blue-150 text-blue-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold">{req.type}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      Duration: <span className="font-semibold">{req.startDate} to {req.endDate}</span> ({req.days} days) • Applied: {req.appliedOn}
                    </p>
                    <p className="text-slate-450 mt-0.5">Reason: "{req.reason}"</p>
                  </div>
                  
                  {userRole === 'Employee' ? (
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Awaiting Manager Actions</span>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(req.id, req.employeeName)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-green-600 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(req.id, req.employeeName)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 3. LEAVE CALENDAR                       */}
      {/* ======================================= */}
      {activeSubModule === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-xs">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Calendar Leave View</h3>
          
          <div className="bg-slate-50 dark:bg-slate-950 p-4 border rounded-xl space-y-3.5">
            <span className="font-bold text-slate-700 dark:text-slate-350 block">Approved Leave Tracks (July 2026)</span>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 border rounded-lg">
                <span className="font-semibold">Ananya Roy (Earned Leave)</span>
                <span className="text-[10px] text-slate-450">Jun 15 - Jun 18 (4 Days) • Confirmed</span>
              </div>
              <p className="text-slate-400 italic text-[10px]">No active leave tracks registered for July 1.</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 4. LEAVE POLICIES                       */}
      {/* ======================================= */}
      {activeSubModule === 'policies' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-xs">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Corporate Leave Rules & Policies</h3>
          
          <div className="space-y-4">
            <div className="p-3 border rounded-xl">
              <h4 className="font-bold text-slate-800 dark:text-white">Casual Leave (CL) Policy</h4>
              <p className="text-slate-500 mt-1">12 days per calendar year. Credited at 1.0 day at the start of each month. Rollover to the next calendar year is not allowed. Unused CL will expire on December 31.</p>
            </div>
            <div className="p-3 border rounded-xl">
              <h4 className="font-bold text-slate-800 dark:text-white">Sick Leave (SL) Policy</h4>
              <p className="text-slate-500 mt-1">10 days per calendar year. Credited fully on January 1. Medical certificate is mandatory for claims exceeding 3 consecutive days.</p>
            </div>
            <div className="p-3 border rounded-xl">
              <h4 className="font-bold text-slate-800 dark:text-white">Earned Leave (EL) Policy</h4>
              <p className="text-slate-500 mt-1">18 days per year. Accrued dynamically based on active workdays. Maximum rollover balance allowed is 30 days. Balance exceeding 30 days will auto-encash during the March payroll cycle.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
