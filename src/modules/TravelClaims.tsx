import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plane, DollarSign, FileText, CheckCircle, Clock, 
  Plus, Check, X, ShieldAlert, ArrowRight, User, Upload
} from 'lucide-react';

export const TravelClaims: React.FC = () => {
  const { 
    claims, setClaims, activeSubModule, setActiveSubModule, 
    addAuditLog, userRole, employees 
  } = useApp();

  const activeUser = employees[0]; // Aarav Sharma

  // Request form state
  const [claimType, setClaimType] = useState<'Travel' | 'Mileage' | 'Food' | 'Accommodation' | 'Other'>('Travel');
  const [amount, setAmount] = useState(1500);
  const [date, setDate] = useState('2026-07-01');
  const [reason, setReason] = useState('Uber Cab to Client office BKC');

  const handleApplyClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim = {
      id: `CLM${Math.floor(Math.random() * 1000)}`,
      employeeId: activeUser.id,
      employeeName: activeUser.name,
      type: claimType,
      amount,
      date,
      reason,
      status: 'Pending' as const
    };
    setClaims(prev => [newClaim, ...prev]);
    addAuditLog("Applied Claim", "Travel & Claims", `${activeUser.name} submitted expense claim of ₹${amount} for ${reason}`);
    alert(`Expense claim submitted successfully! Claim ID: ${newClaim.id}`);
    
    setReason('');
    setAmount(1500);
    setActiveSubModule('my-claims');
  };

  const handleApprove = (id: string, name: string, amt: number) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
    addAuditLog("Approved Claim", "Travel & Claims", `Approved expense claim ${id} of ₹${amt} for ${name}`);
  };

  const handleReject = (id: string, name: string, amt: number) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
    addAuditLog("Rejected Claim", "Travel & Claims", `Rejected expense claim ${id} of ₹${amt} for ${name}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveSubModule('apply-claim')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'apply-claim' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          New Travel Request
        </button>
        <button 
          onClick={() => setActiveSubModule('my-claims')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'my-claims' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          My Reimbursements
        </button>
        <button 
          onClick={() => setActiveSubModule('approvals')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'approvals' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Claim Approvals
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. APPLY CLAIM / TRAVEL REQUEST         */}
      {/* ======================================= */}
      {activeSubModule === 'apply-claim' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          
          {/* Submit Expense Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Submit Expense Claim</h3>
            
            <form onSubmit={handleApplyClaim} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Expense Category</label>
                <select 
                  value={claimType} 
                  onChange={(e) => setClaimType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="Travel">Domestic Travel (Cab/Air/Train)</option>
                  <option value="Mileage">Mileage Reimbursement (Fuel)</option>
                  <option value="Food">Meals & Food hosting</option>
                  <option value="Accommodation">Hotel & Lodging</option>
                  <option value="Other">Miscellaneous Expenses</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Total Amount (INR)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Expense Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Receipt Invoice Upload</label>
                <div className="border border-dashed rounded-lg p-4 text-center bg-slate-50 dark:bg-slate-950 cursor-pointer">
                  <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-semibold">Upload receipt PDF / JPEG</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Justification / Reason</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the business purpose of this expense..." 
                  rows={3} 
                  required 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/10 hover:scale-105 transition-all"
              >
                Submit Expense Claim
              </button>
            </form>
          </div>

          {/* Quick Travel policy overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Travel Policy Threshold Limits</h3>
            
            <div className="space-y-3">
              <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-950">
                <p className="font-bold text-slate-800 dark:text-white">Daily Lodging Threshold (Metro Cities)</p>
                <p className="text-slate-400 mt-1">Maximum allowed hotel limit: ₹4,500/night for developers and analysts. Executive limit: ₹8,000/night. Higher amounts require vice president approval.</p>
              </div>
              <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-950">
                <p className="font-bold text-slate-800 dark:text-white">Mileage & Fuel Policy</p>
                <p className="text-slate-400 mt-1">₹12/km reimbursement for 4-wheelers. ₹5/km for 2-wheelers. Google Maps path screenshots must be uploaded for verification.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. MY REIMBURSEMENTS                    */}
      {/* ======================================= */}
      {activeSubModule === 'my-claims' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-xs">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">My Expense Claims History</h3>
          
          <div className="space-y-3">
            {claims.filter(c => c.employeeId === activeUser.id).map((claim) => (
              <div key={claim.id} className="p-3 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-white">{claim.type} Claim</span>
                    <span className="text-[10px] text-slate-400">Date: {claim.date}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Amount: <span className="font-semibold">₹{claim.amount.toLocaleString()}</span> • Purpose: "{claim.reason}"
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  claim.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' :
                  claim.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse' :
                  'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                }`}>
                  {claim.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 3. CLAIM APPROVALS                      */}
      {/* ======================================= */}
      {activeSubModule === 'approvals' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-xs">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2 flex items-center justify-between">
            <span>Pending Team Claims</span>
            <span className="bg-amber-100 text-amber-850 px-2 py-0.5 rounded-full font-bold">
              {claims.filter(c => c.status === 'Pending').length} Pending
            </span>
          </h3>

          <div className="space-y-3">
            {claims.filter(c => c.status === 'Pending').length === 0 ? (
              <p className="text-slate-400 text-center py-6">All expense reimbursement applications are resolved.</p>
            ) : (
              claims.filter(c => c.status === 'Pending').map((claim) => (
                <div key={claim.id} className="p-4 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white">{claim.employeeName}</span>
                      <span className="bg-purple-150 text-purple-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold">{claim.type} Claim</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      Amount: <span className="font-bold">₹{claim.amount.toLocaleString()}</span> • Applied Date: {claim.date}
                    </p>
                    <p className="text-slate-450 mt-0.5">Reason: "{claim.reason}"</p>
                  </div>
                  
                  {userRole === 'Employee' ? (
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Awaiting Manager Actions</span>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(claim.id, claim.employeeName, claim.amount)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-green-600 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(claim.id, claim.employeeName, claim.amount)}
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

    </div>
  );
};
