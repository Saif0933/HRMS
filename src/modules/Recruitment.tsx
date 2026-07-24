import { ArrowRight, Briefcase, UserCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Candidate,
  useAdvanceCandidate,
  useCandidates,
  useCreateJob,
  useJobs,
  useRejectCandidate,
  useUpdateCandidateChecklist
} from '../api/hook/useRecruitment';
import { useApp } from '../context/AppContext';

export const Recruitment: React.FC = () => {
  const { activeSubModule, setActiveSubModule, addAuditLog, showConfirm, showAlert } = useApp();

  // Queries
  const { data: jobsRes, isLoading: jobsLoading } = useJobs();
  const jobsList = jobsRes?.data || [];

  const { data: candidatesRes, isLoading: candidatesLoading } = useCandidates();
  const candidatesList = candidatesRes?.data || [];

  // Mutations
  const createJobMut = useCreateJob();
  const advanceCandidateMut = useAdvanceCandidate();
  const updateChecklistMut = useUpdateCandidateChecklist();
  const rejectCandidateMut = useRejectCandidate();

  // New Job Requisition Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDept, setNewJobDept] = useState('Engineering');

  // Pre-onboarding selected candidate state
  const onboardingCandidates = candidatesList.filter(c => c.stage === 'Onboarding');
  const [selectedOnboardId, setSelectedOnboardId] = useState('');

  useEffect(() => {
    if (onboardingCandidates.length > 0 && !selectedOnboardId) {
      setSelectedOnboardId(onboardingCandidates[0].id);
    }
  }, [onboardingCandidates, selectedOnboardId]);

  const activeOnboardCandidate = onboardingCandidates.find(c => c.id === selectedOnboardId);

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    showConfirm({
      title: "Confirm Job Requisition",
      message: `Are you sure you want to open a new position for "${newJobTitle}" in ${newJobDept}?`,
      type: "confirm",
      confirmText: "Open Position",
      onConfirm: () => {
        createJobMut.mutate({
          title: newJobTitle,
          department: newJobDept,
        }, {
          onSuccess: () => {
            addAuditLog("Created Job Requisition", "Recruitment & ATS", `Opened new position: ${newJobTitle} in ${newJobDept} team`);
            showAlert(`Job requisition for "${newJobTitle}" created successfully!`, "Position Opened", "success");
            setNewJobTitle('');
          },
          onError: (err: any) => {
            showAlert(err?.response?.data?.message || err.message || "Failed to create requisition", "Error", "danger");
          }
        });
      }
    });
  };

  const handleAdvanceCandidate = (id: string, currentStage: Candidate['stage'], name: string) => {
    const nextStages: Record<Candidate['stage'], Candidate['stage']> = {
      'Applied': 'Interview',
      'Interview': 'Offer',
      'Offer': 'Onboarding',
      'Onboarding': 'Onboarding'
    };

    const nextStage = nextStages[currentStage];
    advanceCandidateMut.mutate({ id, stage: nextStage }, {
      onSuccess: () => {
        addAuditLog("ATS Stage Shifted", "Recruitment & ATS", `Moved candidate ${name} to stage ${nextStage}`);
        showAlert(`Moved candidate ${name} to stage ${nextStage}`, "Stage Advanced", "success");
      },
      onError: (err: any) => {
        showAlert(err?.response?.data?.message || err.message || "Failed to advance candidate", "Error", "danger");
      }
    });
  };

  const handleRejectCandidate = (id: string, name: string) => {
    showConfirm({
      title: "Archive Candidate",
      message: `Are you sure you want to archive candidate ${name} from the recruitment pipeline?`,
      type: "danger",
      confirmText: "Archive Candidate",
      onConfirm: () => {
        rejectCandidateMut.mutate(id, {
          onSuccess: () => {
            addAuditLog("Candidate Rejected", "Recruitment & ATS", `Rejected candidate ${name} from applicant pipeline`);
            showAlert(`Candidate ${name} archived from recruitment track.`, "Archived", "info");
          },
          onError: (err: any) => {
            showAlert(err?.response?.data?.message || err.message || "Failed to reject candidate", "Error", "danger");
          }
        });
      }
    });
  };

  const handleChecklistChange = (field: 'bgvChecked' | 'contractSigned' | 'hardwareAssigned', checked: boolean) => {
    if (!activeOnboardCandidate) return;

    updateChecklistMut.mutate({
      id: activeOnboardCandidate.id,
      [field]: checked
    });
  };

  const handleGenerateLogin = () => {
    if (!activeOnboardCandidate) return;

    showConfirm({
      title: "Generate Employee Login",
      message: `Trigger login credential creation for ${activeOnboardCandidate.name}? Credentials will be sent to ${activeOnboardCandidate.email}.`,
      type: "confirm",
      confirmText: "Generate & Send",
      onConfirm: () => {
        showAlert(`Credentials generated and dispatched to ${activeOnboardCandidate.email}!`, "Login Created", "success");
        addAuditLog("Onboarding Checklist Approved", "Recruitment & ATS", `Approved pre-onboarding checks for candidate ${activeOnboardCandidate.name}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
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
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2 flex items-center gap-1.5">
              <Briefcase className="h-4.5 w-4.5 text-primary" />
              <span>Raise Job Requisition</span>
            </h3>
            
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
                disabled={createJobMut.isPending}
                className="w-full py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
              >
                {createJobMut.isPending ? "Creating..." : "Create Job Requisition"}
              </button>
            </form>
          </div>

          {/* Job Openings Board */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Active Openings Board</h3>
            
            {jobsLoading ? (
              <div className="py-8 text-center text-slate-400 font-medium">Loading requisitions...</div>
            ) : jobsList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-medium">No job requisitions created yet.</div>
            ) : (
              <div className="space-y-3.5">
                {jobsList.map((job) => (
                  <div key={job.id} className="p-3 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                    <div>
                      <span className="font-bold text-slate-850 dark:text-white text-xs">{job.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{job.department} • {job.applicants} Applicants applied</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        job.status === 'Open' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' : 'bg-slate-200 dark:bg-slate-855 text-slate-500'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

          {candidatesLoading ? (
            <div className="py-12 text-center text-slate-400 font-medium">Loading applicant track...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['Applied', 'Interview', 'Offer', 'Onboarding'] as const).map((stage) => (
                <div key={stage} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-850 space-y-4 min-h-[380px]">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase">{stage}</span>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {candidatesList.filter(c => c.stage === stage).length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {candidatesList.filter(c => c.stage === stage).map((c) => (
                      <div key={c.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl space-y-2.5 shadow-sm">
                        <div>
                          <h4 className="font-bold text-slate-850 dark:text-white leading-tight">{c.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{c.role} • {c.experience}</p>
                        </div>

                        <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 mt-2 gap-1.5">
                          <button 
                            onClick={() => handleRejectCandidate(c.id, c.name)}
                            disabled={rejectCandidateMut.isPending}
                            className="px-2 py-1 border border-slate-200 dark:border-slate-800 text-rose-500 rounded-lg font-bold disabled:opacity-50"
                          >
                            Reject
                          </button>
                          {stage !== 'Onboarding' && (
                            <button 
                              onClick={() => handleAdvanceCandidate(c.id, c.stage, c.name)}
                              disabled={advanceCandidateMut.isPending}
                              className="px-2 py-1 bg-primary text-white rounded-lg font-bold flex items-center gap-0.5 disabled:opacity-50"
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
          )}
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

          {candidatesLoading ? (
            <div className="py-8 text-center text-slate-400 font-medium">Loading onboarding data...</div>
          ) : onboardingCandidates.length === 0 ? (
            <div className="p-6 border border-dashed rounded-xl text-center text-slate-450 font-medium">
              No candidates are currently in the Onboarding stage. Advance a candidate from Kanban to begin onboarding.
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2 font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Candidate:</span>
                  <select
                    value={selectedOnboardId}
                    onChange={(e) => setSelectedOnboardId(e.target.value)}
                    className="px-2.5 py-1 border rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
                  >
                    {onboardingCandidates.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <span className="text-primary font-bold">Target Join: July 15</span>
              </div>

              {activeOnboardCandidate && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={activeOnboardCandidate.bgvChecked} 
                        onChange={(e) => handleChecklistChange('bgvChecked', e.target.checked)} 
                        className="rounded text-primary focus:ring-0" 
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Background verification (BGV) checks clearance</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={activeOnboardCandidate.contractSigned} 
                        onChange={(e) => handleChecklistChange('contractSigned', e.target.checked)} 
                        className="rounded text-primary focus:ring-0" 
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Employment contract and non-disclosure agreement signed</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={activeOnboardCandidate.hardwareAssigned} 
                        onChange={(e) => handleChecklistChange('hardwareAssigned', e.target.checked)} 
                        className="rounded text-primary focus:ring-0" 
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">IT asset provisioning (Laptop and credentials)</span>
                    </label>
                  </div>

                  <button 
                    disabled={
                      !activeOnboardCandidate.bgvChecked || 
                      !activeOnboardCandidate.contractSigned || 
                      !activeOnboardCandidate.hardwareAssigned
                    }
                    onClick={handleGenerateLogin}
                    className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-md shadow-green-500/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <UserCheck className="h-4.5 w-4.5" />
                    <span>Generate Employee Login & Card</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
