import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, Plus, Check, X, ClipboardList, ShieldAlert,
  HelpCircle, ArrowUpRight, CheckCircle
} from 'lucide-react';

export const Timesheets: React.FC = () => {
  const { activeSubModule, setActiveSubModule, addAuditLog, userRole, employees } = useApp();

  const activeUser = employees[0]; // Aarav Sharma

  // Weekly hours state
  const [monHours, setMonHours] = useState(8);
  const [tueHours, setTueHours] = useState(8);
  const [wedHours, setWedHours] = useState(8);
  const [thuHours, setThuHours] = useState(8);
  const [friHours, setFriHours] = useState(8);

  const [project, setProject] = useState('Symbosys HRMS Redesign');
  const [task, setTask] = useState('Developing core employee directory views');

  const [submittedTimesheets, setSubmittedTimesheets] = useState([
    { id: "TS091", project: "Vite Migration", hours: 40, week: "Week 26 (Jun 22 - Jun 28)", status: "Approved" }
  ]);

  const handleSubmitTimesheet = (e: React.FormEvent) => {
    e.preventDefault();
    const totalHours = monHours + tueHours + wedHours + thuHours + friHours;
    const newTs = {
      id: `TS${Math.floor(Math.random() * 1000)}`,
      project,
      hours: totalHours,
      week: "Week 27 (Jul 1 - Jul 5)",
      status: "Pending"
    };
    setSubmittedTimesheets(prev => [newTs, ...prev]);
    addAuditLog("Timesheet Submitted", "Timesheets Module", `Submitted timesheet of ${totalHours} hours for project ${project}`);
    alert(`Timesheet of ${totalHours} hours submitted successfully!`);
    setActiveSubModule('projects');
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
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

      {/* ======================================= */}
      {/* 1. SUBMIT HOURS GRID                     */}
      {/* ======================================= */}
      {activeSubModule === 'entry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          
          {/* Submit Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Weekly Timesheet Form</h3>
            
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

              <div className="flex justify-between border-t pt-4 items-center">
                <span className="text-slate-400 font-bold">Total Computed Hours: <span className="text-primary text-sm font-black">{monHours + tueHours + wedHours + thuHours + friHours} Hours</span></span>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md shadow-primary/10"
                >
                  Submit Hours to Manager
                </button>
              </div>
            </form>
          </div>

          {/* Allocation details info card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Resource Utilization KPI</h3>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-455">Billable Target:</span>
                <span className="font-bold">40 Hours / Week</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455">Utilization Rating:</span>
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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-xs">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Submitted Hours History</h3>
          
          <div className="space-y-3.5">
            {submittedTimesheets.map((ts) => (
              <div key={ts.id} className="p-3 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-850 dark:text-white">{ts.project}</span>
                    <span className="text-[10px] text-slate-400">{ts.week}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Logged Total: <span className="font-bold">{ts.hours} Hours</span></p>
                </div>
                
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  ts.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' : 'bg-amber-100 text-amber-800'
                }`}>
                  {ts.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
