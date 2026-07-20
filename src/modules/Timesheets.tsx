import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useEmployees } from '../api/hook/useEmployee';
import {
  useTimesheets,
  useSubmitTimesheet,
  useUpdateTimesheetStatus
} from '../api/hook/useTimesheets';
import { Users, Clock, Check, X, ShieldAlert } from 'lucide-react';

export const Timesheets: React.FC = () => {
  const { activeSubModule, setActiveSubModule, addAuditLog } = useApp();

  // Simulated active employee switcher
  const [selectedEmpId, setSelectedEmpId] = useState('');

  // Fetch employees list
  const { data: dbEmployeesRes, isLoading: employeesLoading } = useEmployees();
  const employeesList = dbEmployeesRes?.data || [];

  // Automatically select first employee as current user
  useEffect(() => {
    if (employeesList.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employeesList[0].id);
    }
  }, [employeesList, selectedEmpId]);

  const activeEmployee = employeesList.find(emp => emp.id === selectedEmpId);

  // Check if simulated user has approval permissions
  const isApprover = activeEmployee?.user?.role?.name === 'SUPER_ADMIN' || 
                     activeEmployee?.user?.role?.name === 'HR_ADMIN' || 
                     activeEmployee?.designation?.toUpperCase().includes('MANAGER') || 
                     activeEmployee?.designation?.toUpperCase().includes('LEAD') || 
                     activeEmployee?.designation?.toUpperCase().includes('DIRECTOR') ||
                     activeEmployee?.designation?.toUpperCase().includes('HEAD');

  // Queries
  const { data: timesheetsRes, isLoading: timesheetsLoading } = useTimesheets(
    activeSubModule === 'projects' && !isApprover ? { employeeId: selectedEmpId } : undefined
  );
  const timesheetsList = timesheetsRes?.data || [];

  // Mutations
  const submitTimesheetMut = useSubmitTimesheet();
  const updateStatusMut = useUpdateTimesheetStatus();

  // Weekly hours state
  const [monHours, setMonHours] = useState(8);
  const [tueHours, setTueHours] = useState(8);
  const [wedHours, setWedHours] = useState(8);
  const [thuHours, setThuHours] = useState(8);
  const [friHours, setFriHours] = useState(8);

  const [project, setProject] = useState('Symbosys HRMS Redesign');
  const [task, setTask] = useState('Developing core employee directory views');

  const totalComputedHours = monHours + tueHours + wedHours + thuHours + friHours;

  const handleSubmitTimesheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !activeEmployee) return;

    submitTimesheetMut.mutate({
      employeeId: selectedEmpId,
      project,
      task,
      monHours,
      tueHours,
      wedHours,
      thuHours,
      friHours,
      week: "Week 27 (Jul 1 - Jul 5)",
    }, {
      onSuccess: () => {
        addAuditLog("Timesheet Submitted", "Timesheets Module", `${activeEmployee.name} submitted timesheet of ${totalComputedHours} hours for project ${project}`);
        alert(`Timesheet of ${totalComputedHours} hours submitted successfully!`);
        setActiveSubModule('projects');
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || err.message || "Failed to submit timesheet");
      }
    });
  };

  const handleApprove = (id: string, employeeName: string, hours: number) => {
    updateStatusMut.mutate({ id, status: 'Approved' }, {
      onSuccess: () => {
        addAuditLog("Approved Timesheet", "Timesheets Module", `Approved timesheet ${id} of ${hours} hours for ${employeeName}`);
        alert(`Approved timesheet successfully.`);
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || err.message || "Failed to update timesheet");
      }
    });
  };

  const handleReject = (id: string, employeeName: string, hours: number) => {
    updateStatusMut.mutate({ id, status: 'Rejected' }, {
      onSuccess: () => {
        addAuditLog("Rejected Timesheet", "Timesheets Module", `Rejected timesheet ${id} of ${hours} hours for ${employeeName}`);
        alert(`Rejected timesheet successfully.`);
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || err.message || "Failed to update timesheet");
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button 
          onClick={() => setActiveSubModule('entry')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'entry' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Submit Hours
        </button>
        <button 
          onClick={() => setActiveSubModule('projects')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'projects' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Timesheet Logs
        </button>
      </div>

      {/* Global Simulated User Switcher */}
      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-100 dark:bg-rose-950/40 text-rose-600 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Simulate as Employee</h4>
            <p className="text-slate-450 mt-0.5">Switch employees to submit hours or approve pending team logs depending on managerial permissions.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="px-3.5 py-2 border rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
          >
            {employeesLoading ? (
              <option>Loading employees...</option>
            ) : (
              employeesList.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.designation || 'Staff'})
                </option>
              ))
            )}
          </select>

          {activeEmployee && (
            <span className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl font-bold uppercase text-[10px]">
              {activeEmployee.department?.name || 'Operations'}
            </span>
          )}
        </div>
      </div>

      {/* ======================================= */}
      {/* 1. SUBMIT HOURS GRID                     */}
      {/* ======================================= */}
      {activeSubModule === 'entry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          
          {/* Submit Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2 flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-primary" />
              <span>Weekly Timesheet Form</span>
            </h3>
            
            <form onSubmit={handleSubmitTimesheet} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Select Billing Project</label>
                  <select 
                    value={project} 
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-none"
                  >
                    <option value="Symbosys HRMS Redesign">Symbosys HRMS Redesign</option>
                    <option value="Vite Migration">Vite Migration Upgrade</option>
                    <option value="Client Portal Support">Client Portal Support (SLA)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Activity Task Category</label>
                  <input 
                    type="text" 
                    value={task} 
                    onChange={(e) => setTask(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  />
                </div>
              </div>

              {/* Day Inputs */}
              <div className="grid grid-cols-5 gap-3 pt-2">
                <div className="space-y-1 text-center">
                  <label className="text-slate-400 font-semibold block">Mon</label>
                  <input 
                    type="number" 
                    value={monHours} 
                    onChange={(e) => setMonHours(Number(e.target.value))}
                    max={24} min={0} 
                    className="w-full px-2 py-1.5 border rounded-lg focus:outline-none text-center bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white font-bold"
                  />
                </div>
                <div className="space-y-1 text-center">
                  <label className="text-slate-400 font-semibold block">Tue</label>
                  <input 
                    type="number" 
                    value={tueHours} 
                    onChange={(e) => setTueHours(Number(e.target.value))}
                    max={24} min={0} 
                    className="w-full px-2 py-1.5 border rounded-lg focus:outline-none text-center bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white font-bold"
                  />
                </div>
                <div className="space-y-1 text-center">
                  <label className="text-slate-400 font-semibold block">Wed</label>
                  <input 
                    type="number" 
                    value={wedHours} 
                    onChange={(e) => setWedHours(Number(e.target.value))}
                    max={24} min={0} 
                    className="w-full px-2 py-1.5 border rounded-lg focus:outline-none text-center bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white font-bold"
                  />
                </div>
                <div className="space-y-1 text-center">
                  <label className="text-slate-400 font-semibold block">Thu</label>
                  <input 
                    type="number" 
                    value={thuHours} 
                    onChange={(e) => setThuHours(Number(e.target.value))}
                    max={24} min={0} 
                    className="w-full px-2 py-1.5 border rounded-lg focus:outline-none text-center bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white font-bold"
                  />
                </div>
                <div className="space-y-1 text-center">
                  <label className="text-slate-400 font-semibold block">Fri</label>
                  <input 
                    type="number" 
                    value={friHours} 
                    onChange={(e) => setFriHours(Number(e.target.value))}
                    max={24} min={0} 
                    className="w-full px-2 py-1.5 border rounded-lg focus:outline-none text-center bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4 items-center">
                <span className="text-slate-400 font-bold">Total Computed Hours: <span className="text-primary text-sm font-black">{totalComputedHours} Hours</span></span>
                <button 
                  type="submit" 
                  disabled={submitTimesheetMut.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                >
                  {submitTimesheetMut.isPending ? "Submitting..." : "Submit Hours to Manager"}
                </button>
              </div>
            </form>
          </div>

          {/* Allocation details info card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Resource Utilization KPI</h3>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-450 font-medium">Billable Target:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">40 Hours / Week</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450 font-medium">Utilization Rating:</span>
                <span className="font-bold text-emerald-500">100% Billable</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. TIMESHEET HISTORY                    */}
      {/* ======================================= */}
      {activeSubModule === 'projects' && (
        <div className="grid grid-cols-1 gap-6 animate-fade-in text-xs">
          
          {/* Manager approval board (Visible only to approvers) */}
          {isApprover && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2 flex items-center justify-between">
                <span>Pending Team Timesheets</span>
                <span className="bg-amber-100 text-amber-850 px-2 py-0.5 rounded-full font-bold">
                  {timesheetsLoading ? "..." : timesheetsList.filter(ts => ts.status === 'Pending').length} Pending
                </span>
              </h3>

              {timesheetsLoading ? (
                <div className="py-8 text-center text-slate-400 font-medium">Loading pending logs...</div>
              ) : (
                <div className="space-y-3">
                  {timesheetsList.filter(ts => ts.status === 'Pending').length === 0 ? (
                    <p className="text-slate-450 text-center py-4">No timesheets are currently awaiting review.</p>
                  ) : (
                    timesheetsList.filter(ts => ts.status === 'Pending').map((ts) => (
                      <div key={ts.id} className="p-4 border border-slate-200/50 dark:border-slate-850 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950 gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-white">{ts.employeeName}</span>
                            <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold">{ts.project}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Logged: <span className="font-bold text-slate-700 dark:text-slate-300">{ts.hours} Hours</span> • Week: {ts.week}
                          </p>
                          <p className="text-slate-450 mt-0.5">Task Description: "{ts.task}"</p>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleApprove(ts.id, ts.employeeName, ts.hours)}
                            disabled={updateStatusMut.isPending}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(ts.id, ts.employeeName, ts.hours)}
                            disabled={updateStatusMut.isPending}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Main Logs listing */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">
              {isApprover ? "Global Timesheet History" : "My Submitted Hours History"}
            </h3>
            
            {timesheetsLoading ? (
              <div className="py-8 text-center text-slate-400 font-medium">Loading history logs...</div>
            ) : timesheetsList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-medium">No hours have been logged yet.</div>
            ) : (
              <div className="space-y-3.5">
                {timesheetsList.map((ts) => (
                  <div key={ts.id} className="p-3 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-850 dark:text-white">{ts.project}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{ts.week}</span>
                        {isApprover && (
                          <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-650 px-1.5 py-0.2 rounded font-bold uppercase">{ts.employeeName}</span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Logged Total: <span className="font-bold text-slate-700 dark:text-slate-300">{ts.hours} Hours</span> (M: {ts.monHours}h, T: {ts.tueHours}h, W: {ts.wedHours}h, T: {ts.thuHours}h, F: {ts.friHours}h)
                      </p>
                    </div>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      ts.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' :
                      ts.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                      'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                    }`}>
                      {ts.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
