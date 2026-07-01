import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserPlus, FileText, CheckCircle, Clock, 
  Plus, Check, X, ShieldAlert, ArrowRight, User, HelpCircle, 
  Briefcase, KanbanSquare, CheckSquare
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  experience: string;
  email: string;
  stage: 'Applied' | 'Interview' | 'Offer' | 'Onboarding';
}

export const Recruitment: React.FC = () => {
  const { activeSubModule, setActiveSubModule, addAuditLog } = useApp();

  // Job Requisitions State
  const [jobs, setJobs] = useState([
    { id: "JOB001", title: "Senior React Developer", department: "Engineering", status: "Open", applicants: 18 },
    { id: "JOB002", title: "Lead UX UI Designer", department: "Design", status: "Open", applicants: 9 },
    { id: "JOB003", title: "HR Generalist Manager", department: "Human Resources", status: "Filled", applicants: 24 }
  ]);

  // Candidate pipeline state
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: "CAN091", name: "Rishi Kumar", role: "Senior React Developer", experience: "5 Years", email: "rishi@gmail.com", stage: "Applied" },
    { id: "CAN092", name: "Pooja Hegde", role: "Lead UX UI Designer", experience: "8 Years", email: "pooja@design.io", stage: "Interview" },
    { id: "CAN093", name: "Amit Shah", role: "Senior React Developer", experience: "4 Years", email: "amit.shah@dev.net", stage: "Offer" },
    { id: "CAN094", name: "Karan Johar", role: "HR Generalist Manager", experience: "6 Years", email: "karan@hrms.co", stage: "Onboarding" }
  ]);

  // Pre-onboarding checklist
  const [bgvChecked, setBgvChecked] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [hardwareAssigned, setHardwareAssigned] = useState(false);

  // New Job Requisition Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDept, setNewJobDept] = useState('Engineering');

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    const newJob = {
      id: `JOB0${jobs.length + 1}`,
      title: newJobTitle,
      department: newJobDept,
      status: "Open",
      applicants: 0
    };
    setJobs(prev => [...prev, newJob]);
    addAuditLog("Created Job Requisition", "Recruitment & ATS", `Opened new position: ${newJobTitle} in ${newJobDept} team`);
    alert(`Job requisition for "${newJobTitle}" created successfully!`);
    setNewJobTitle('');
  };

  const handleAdvanceCandidate = (id: string, currentStage: Candidate['stage'], name: string) => {
    const nextStages: Record<Candidate['stage'], Candidate['stage']> = {
      'Applied': 'Interview',
      'Interview': 'Offer',
      'Offer': 'Onboarding',
      'Onboarding': 'Onboarding'
    };

    setCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, stage: nextStages[currentStage] } : c
    ));
    addAuditLog("ATS Stage Shifted", "Recruitment & ATS", `Moved candidate ${name} to stage ${nextStages[currentStage]}`);
  };

  const handleRejectCandidate = (id: string, name: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
    addAuditLog("Candidate Rejected", "Recruitment & ATS", `Rejected candidate ${name} from applicant pipeline`);
    alert(`Candidate ${name} archived from recruitment track.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveSubModule('jobs')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'jobs' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Job Requisitions
        </button>
        <button 
          onClick={() => setActiveSubModule('candidates')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'candidates' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Candidate Pipeline Kanban
        </button>
        <button 
          onClick={() => setActiveSubModule('onboarding')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'onboarding' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Pre-onboarding checklist
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. JOB REQUISITIONS BOARD               */}
      {/* ======================================= */}
      {activeSubModule === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          
          {/* Create Job Requisition */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Raise Job Requisition</h3>
            
            <form onSubmit={handleCreateRequisition} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Job Title / Role Position</label>
                <input 
                  type="text" 
                  value={newJobTitle} 
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="e.g. Lead Devops Architect" 
                  required 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Department Target</label>
                <select 
                  value={newJobDept} 
                  onChange={(e) => setNewJobDept(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300 focus:outline-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md shadow-primary/10"
              >
                Create Job Requisition
              </button>
            </form>
          </div>

          {/* Job Openings Board */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Active Openings Board</h3>
            
            <div className="space-y-3.5">
              {jobs.map((job) => (
                <div key={job.id} className="p-3 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                  <div>
                    <span className="font-bold text-slate-850 dark:text-white text-xs">{job.title}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{job.department} • {job.applicants} Applicants applied</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      job.status === 'Open' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' : 'bg-slate-200 dark:bg-slate-850 text-slate-500'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. ATS CANDIDATE PIPELINE KANBAN        */}
      {/* ======================================= */}
      {activeSubModule === 'candidates' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Applicant Pipeline Tracking</h3>
            <p className="text-slate-400 mt-1">Advance applicants through hiring steps from application to final pre-onboarding checks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['Applied', 'Interview', 'Offer', 'Onboarding'] as const).map((stage) => (
              <div key={stage} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-250 dark:border-slate-800 space-y-4 min-h-96">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase">{stage}</span>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {candidates.filter(c => c.stage === stage).length}
                  </span>
                </div>

                <div className="space-y-3">
                  {candidates.filter(c => c.stage === stage).map((c) => (
                    <div key={c.id} className="p-3 bg-white dark:bg-slate-900 border rounded-xl space-y-2.5 shadow-sm">
                      <div>
                        <h4 className="font-bold text-slate-850 dark:text-white leading-tight">{c.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{c.role} • {c.experience}</p>
                      </div>

                      <div className="flex justify-between border-t pt-2 mt-2 gap-1.5">
                        <button 
                          onClick={() => handleRejectCandidate(c.id, c.name)}
                          className="px-2 py-1 border border-slate-200 dark:border-slate-850 text-rose-500 rounded-lg font-bold"
                        >
                          Reject
                        </button>
                        {stage !== 'Onboarding' && (
                          <button 
                            onClick={() => handleAdvanceCandidate(c.id, c.stage, c.name)}
                            className="px-2 py-1 bg-primary text-white rounded-lg font-bold flex items-center gap-0.5"
                          >
                            <span>Advance</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 3. PRE-ONBOARDING CHECKLIST             */}
      {/* ======================================= */}
      {activeSubModule === 'onboarding' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-xs max-w-xl">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Hired Candidate Pre-onboarding Wizard</h3>
            <p className="text-slate-400 mt-1">Complete mandatory verification checklists before activating employee logins.</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl space-y-4">
            <div className="border-b pb-2 flex justify-between font-bold">
              <span>Candidate: Karan Johar</span>
              <span className="text-primary font-bold">Target Join: July 15</span>
            </div>

            <div className="space-y-3.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={bgvChecked} onChange={(e) => setBgvChecked(e.target.checked)} className="rounded text-primary focus:ring-0" />
                <span className="text-slate-705 dark:text-slate-250 font-medium">Background verification (BGV) checks clearance</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={contractSigned} onChange={(e) => setContractSigned(e.target.checked)} className="rounded text-primary focus:ring-0" />
                <span className="text-slate-705 dark:text-slate-250 font-medium">Employment contract and non-disclosure agreement signed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={hardwareAssigned} onChange={(e) => setHardwareAssigned(e.target.checked)} className="rounded text-primary focus:ring-0" />
                <span className="text-slate-705 dark:text-slate-250 font-medium">IT asset provisioning (Laptop and credentials)</span>
              </label>
            </div>

            <button 
              disabled={!bgvChecked || !contractSigned || !hardwareAssigned}
              onClick={() => {
                alert("Triggering final login creation...");
                addAuditLog("Onboarding Checklist Approved", "Recruitment & ATS", "Approved pre-onboarding checks for candidate Karan Johar");
              }}
              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-md shadow-green-500/10 disabled:opacity-50"
            >
              Generate Employee Login & Card
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
