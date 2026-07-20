import React, { useState } from 'react';
import {
  Download,
  FileSignature,
  FileText,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  useIssuedLetters,
  useIssueLetter,
  IssuedLetter
} from '../api/hook/useLetters';

export const Letters: React.FC = () => {
  const { activeSubModule, setActiveSubModule, addAuditLog } = useApp();

  // Queries & Mutations
  const { data: lettersRes, isLoading: logsLoading } = useIssuedLetters();
  const lettersList = lettersRes?.data || [];

  const issueLetterMut = useIssueLetter();

  const [selectedTemplate, setSelectedTemplate] = useState<'offer' | 'warning' | 'experience'>('offer');

  // Input states
  const [recipientName, setRecipientName] = useState('Karan Johar');
  const [recipientRole, setRecipientRole] = useState('HR Specialist');
  const [joiningDate, setJoiningDate] = useState('2026-07-15');
  const [salaryCtc, setSalaryCtc] = useState('₹8,50,000 per annum');
  const [warningReason, setWarningReason] = useState('Repeated late entries beyond grace period limits');

  const handleIssueLetter = (e: React.FormEvent) => {
    e.preventDefault();
    
    issueLetterMut.mutate({
      templateType: selectedTemplate,
      recipientName,
      recipientRole,
      joiningDate: selectedTemplate === 'offer' ? joiningDate : null,
      salaryCtc: selectedTemplate === 'offer' ? salaryCtc : null,
      warningReason: selectedTemplate === 'warning' ? warningReason : null,
    }, {
      onSuccess: () => {
        addAuditLog(
          "Issued Corporate Letter", 
          "Letters Center", 
          `Generated and dispatched ${selectedTemplate} letter to ${recipientName} (${recipientRole})`
        );
        alert(`Letter successfully generated and logged in the database!`);
        // Navigate to the logs tab
        setActiveSubModule('issued-log');
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || err.message || "Failed to generate letter");
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button 
          onClick={() => setActiveSubModule('generate')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'generate' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Generate Corporate Letter
        </button>
        <button 
          onClick={() => setActiveSubModule('issued-log')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'issued-log' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Issued Letters History
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. GENERATE LETTER & PREVIEW            */}
      {/* ======================================= */}
      {activeSubModule === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          
          {/* Controls form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1 h-fit">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Letter Configurator</h3>
            
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Select Template</label>
              <select 
                value={selectedTemplate} 
                onChange={(e) => setSelectedTemplate(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-none"
              >
                <option value="offer">Corporate Offer Letter</option>
                <option value="warning">Official Disciplinary Warning</option>
                <option value="experience">Relieving & Experience Certificate</option>
              </select>
            </div>

            <form onSubmit={handleIssueLetter} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Recipient Full Name</label>
                <input 
                  type="text" 
                  value={recipientName} 
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Recipient Designation Role</label>
                <input 
                  type="text" 
                  value={recipientRole} 
                  onChange={(e) => setRecipientRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                />
              </div>

              {selectedTemplate === 'offer' && (
                <>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Offered Annual CTC</label>
                    <input 
                      type="text" 
                      value={salaryCtc} 
                      onChange={(e) => setSalaryCtc(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Joining Target Date</label>
                    <input 
                      type="date" 
                      value={joiningDate} 
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                    />
                  </div>
                </>
              )}

              {selectedTemplate === 'warning' && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Warning Infraction Reason</label>
                  <textarea 
                    value={warningReason} 
                    onChange={(e) => setWarningReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={issueLetterMut.isPending}
                className="w-full py-2 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/10 hover:scale-105 transition-all disabled:opacity-50"
              >
                {issueLetterMut.isPending ? "Generating..." : "Issue & Log Record"}
              </button>
            </form>
          </div>

          {/* Letter preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 shadow-md lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Real-Time Document Preview</span>
              <button 
                onClick={() => alert("Downloading letter PDF...")}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-355 rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </button>
            </div>

            {/* Letter layout */}
            <div className="p-6 border border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 font-serif leading-relaxed text-slate-850 dark:text-slate-200">
              <div className="text-center border-b pb-4 mb-6">
                <h2 className="text-md font-extrabold uppercase tracking-wide text-primary">FactoCorp Technologies Pvt Ltd</h2>
                <p className="text-[9px] font-sans text-slate-400 italic">Bandra Kurla Complex, Mumbai | contact@factocorp.com</p>
              </div>

              {selectedTemplate === 'offer' && (
                <div className="space-y-4">
                  <div className="text-right text-[10px] font-sans text-slate-450 mb-4">Date: {new Date().toISOString().split('T')[0]}</div>
                  <p className="font-bold">Dear {recipientName},</p>
                  <p>We are pleased to offer you the position of <span className="font-bold">{recipientRole}</span> with our development organization at FactoCorp Technologies. Your target joining date is set for <span className="font-bold">{joiningDate}</span>.</p>
                  <p>Your annual cost-to-company (CTC) remuneration package is structured at <span className="font-bold">{salaryCtc}</span>, inclusive of allowances and performance variables.</p>
                  <p>Kindly acknowledge this letter as a confirmation of acceptance. We look forward to welcoming you onboard.</p>
                  
                  <div className="pt-8 flex justify-between font-sans text-[10px] text-slate-400 mt-6">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200">Neha Patel</p>
                      <p>HR Director, FactoCorp</p>
                    </div>
                    <div className="text-right">
                      <FileSignature className="h-6 w-6 text-slate-300 ml-auto mb-1" />
                      <p className="border-t pt-1">Candidate Acceptance Sign</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate === 'warning' && (
                <div className="space-y-4">
                  <div className="text-right text-[10px] font-sans text-slate-455 mb-4">Date: {new Date().toISOString().split('T')[0]}</div>
                  <p className="font-bold text-rose-500 uppercase tracking-widest text-[10px]">Official Warning Memo</p>
                  <p className="font-bold">To: {recipientName} ({recipientRole})</p>
                  <p>This is a formal disciplinary warning memo regarding documented performance infractions, specifically: <span className="font-bold">{warningReason}</span>.</p>
                  <p>You are requested to provide a written justification response within 48 hours. Failure to correct behavior may escalate to official termination protocols.</p>
                  
                  <div className="pt-8 flex justify-between font-sans text-[10px] text-slate-400 mt-6">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200">Shalini Sen</p>
                      <p>Compliance Officer, FactoCorp</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate === 'experience' && (
                <div className="space-y-4">
                  <div className="text-right text-[10px] font-sans text-slate-455 mb-4">Date: {new Date().toISOString().split('T')[0]}</div>
                  <h3 className="text-center font-bold uppercase border-y py-1.5 text-xs tracking-wider">Relieving & Experience Certificate</h3>
                  <p className="pt-4">This is to certify that <span className="font-bold">{recipientName}</span> has worked with FactoCorp Technologies as a <span className="font-bold">{recipientRole}</span> from January 2023 to June 2026.</p>
                  <p>During their tenure with us, their conduct has been found to be exemplary and professional. We wish them all success in their future career endeavors.</p>
                  
                  <div className="pt-8 flex justify-between font-sans text-[10px] text-slate-400 mt-6">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200">Neha Patel</p>
                      <p>HR Manager, FactoCorp</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. ISSUED LETTERS LEDGER                 */}
      {/* ======================================= */}
      {activeSubModule === 'issued-log' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-xs">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Issued Corporate Documents</h3>
            <p className="text-slate-400 mt-1">Audit log of all issued offer letters, certificates, and disciplinary warning memos.</p>
          </div>

          {logsLoading ? (
            <div className="py-8 text-center text-slate-400 font-medium">Loading issue history...</div>
          ) : lettersList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-medium">No corporate letters issued yet.</div>
          ) : (
            <div className="space-y-3">
              {lettersList.map((letter) => (
                <div key={letter.id} className="p-3.5 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-850 dark:text-white">{letter.recipientName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                          letter.templateType === 'offer' ? 'bg-green-100 text-green-800' :
                          letter.templateType === 'warning' ? 'bg-rose-100 text-rose-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {letter.templateType} Letter
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-450 mt-1">Role: {letter.recipientRole} • Issued On: {new Date(letter.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => alert(`Re-downloading PDF for ${letter.recipientName}...`)}
                    className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg hover:scale-105 transition-all text-slate-500"
                    title="Download Letter"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
