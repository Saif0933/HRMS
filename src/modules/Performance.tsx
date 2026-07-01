import {
    Star
} from 'lucide-react';
import React, { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '../context/AppContext';

export const Performance: React.FC = () => {
  const { activeSubModule, setActiveSubModule, addAuditLog, employees } = useApp();

  // Goals/KRA State
  const [goals, setGoals] = useState([
    { id: "G01", title: "Deliver Redesigned Core UI Components", weight: "40%", kra: "Development Quality", progress: 85, status: "In Progress" },
    { id: "G02", title: "Optimize Web Performance & Core Web Vitals", weight: "30%", kra: "System Efficiency", progress: 95, status: "Completed" },
    { id: "G03", title: "Refactor State Management & Context Architecture", weight: "30%", kra: "Refactoring & Tech Debt", progress: 60, status: "In Progress" }
  ]);

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalWeight, setGoalWeight] = useState('20%');
  const [goalKra, setGoalKra] = useState('Development');

  // Feedback State
  const [feedbacks, setFeedbacks] = useState([
    { id: "FB01", reviewer: "Neha Patel", relation: "Manager", rating: 4.5, text: "Excellent technical skillset and outstanding dedication to the UI refactor work.", date: "2026-06-28" },
    { id: "FB02", reviewer: "Rohan Das", relation: "Peer", rating: 4.2, text: "Great collaborator, very open to UX critiques and fast at implementing layouts.", date: "2026-06-29" }
  ]);

  // Bell Curve Rating distribution data
  const bellCurveData = [
    { rating: 'Unsatisfactory (1)', Employees: 2 },
    { rating: 'Needs Improvement (2)', Employees: 6 },
    { rating: 'Meets Expectations (3)', Employees: 35 },
    { rating: 'Exceeds Expectations (4)', Employees: 15 },
    { rating: 'Outstanding (5)', Employees: 4 }
  ];

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal = {
      id: `G0${goals.length + 1}`,
      title: goalTitle,
      weight: goalWeight,
      kra: goalKra,
      progress: 0,
      status: "In Progress"
    };
    setGoals(prev => [...prev, newGoal]);
    addAuditLog("Created Goal", "Performance Management", `Added new KRA goal: "${goalTitle}"`);
    alert("New performance goal successfully added.");
    setGoalTitle('');
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveSubModule('goals')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'goals' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          KRA & Goals
        </button>
        <button 
          onClick={() => setActiveSubModule('feedback')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'feedback' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          360° Feedback
        </button>
        <button 
          onClick={() => setActiveSubModule('bellcurve')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'bellcurve' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Bell Curve Analytics
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. KRA & GOAL SETTING                   */}
      {/* ======================================= */}
      {activeSubModule === 'goals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          
          {/* Add Goal */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Add New KRA Goal</h3>
            
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Goal Title</label>
                <input 
                  type="text" 
                  value={goalTitle} 
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Reduce bundle size by 20%" 
                  required 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Weightage</label>
                  <input 
                    type="text" 
                    value={goalWeight} 
                    onChange={(e) => setGoalWeight(e.target.value)}
                    placeholder="e.g. 30%" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Key Focus Area (KRA)</label>
                  <input 
                    type="text" 
                    value={goalKra} 
                    onChange={(e) => setGoalKra(e.target.value)}
                    placeholder="e.g. Code Quality" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md"
              >
                Assign Goal
              </button>
            </form>
          </div>

          {/* Active Goals list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Active Performance KRAs</h3>
            
            <div className="space-y-4">
              {goals.map((g) => (
                <div key={g.id} className="p-4 border rounded-xl space-y-3 bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-center justify-between font-semibold">
                    <div>
                      <span className="font-bold text-slate-850 dark:text-white">{g.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">KRA: {g.kra} • Weight: {g.weight}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      g.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {g.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-450 font-bold">
                      <span>Completion Progress:</span>
                      <span>{g.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-1.5" style={{ width: `${g.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. 360 FEEDBACK                         */}
      {/* ======================================= */}
      {activeSubModule === 'feedback' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">360-Degree Peer & Manager Feedback</h3>
            <button 
              onClick={() => alert("Opening feedback request dialog...")}
              className="px-3 py-1 bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold"
            >
              Request Peer Review
            </button>
          </div>

          <div className="space-y-4">
            {feedbacks.map((f) => (
              <div key={f.id} className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <div>
                    <span className="font-bold text-slate-850 dark:text-white">{f.reviewer}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{f.relation} Review • {f.date}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 text-amber-500 px-2 py-0.5 rounded-lg font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{f.rating}</span>
                  </div>
                </div>
                <p className="text-slate-650 dark:text-slate-400 italic">"{f.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 3. BELL CURVE ANALYTICS                 */}
      {/* ======================================= */}
      {activeSubModule === 'bellcurve' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-xs">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Appraisal Bell Curve Distribution</h3>
            <p className="text-slate-400 mt-1">Normal distribution mapping of employee performance appraisal ratings.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bellCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bellGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="rating" fontSize={9} />
                <YAxis fontSize={9} />
                <Tooltip />
                <Area type="monotone" dataKey="Employees" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#bellGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold block mb-1.5 uppercase">Bell Curve Statistics Summary</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
              <div><span className="text-slate-400">Target Normal Standard</span><p className="font-semibold text-slate-800 dark:text-white">10% - 20% - 50% - 15% - 5%</p></div>
              <div><span className="text-slate-400">Actual Deviation</span><p className="font-semibold text-emerald-500">Normal Range matched (&lt;2% error)</p></div>
              <div><span className="text-slate-400">Total Rated Staff</span><p className="font-semibold text-slate-800 dark:text-white">{employees.length} employees</p></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
