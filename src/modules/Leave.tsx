import {
  Check, X, Calendar, FileText, Plus, AlertCircle, ShieldAlert, Trash2, Clock
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  useLeaveTypes,
  useLeaveAllocations,
  useLeaveRequests,
  useSubmitLeaveRequest,
  useProcessLeaveRequest,
  useCancelLeaveRequest,
  useCreateLeaveType,
  useUpdateLeaveType,
  useDeleteLeaveType,
  LeaveStatus,
  HalfDaySession
} from '../api/hook/useLeave';

export const Leave: React.FC = () => {
  const { 
    activeSubModule, setActiveSubModule, addAuditLog, userRole, employees, currentUser 
  } = useApp();

  const activeUser = currentUser || employees[0];

  // Leave Form States
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [halfDay, setHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<HalfDaySession>('FIRST_HALF');
  const [reason, setReason] = useState('');

  // Admin Create/Update Type States
  const [typeName, setTypeName] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [typeDesc, setTypeDesc] = useState('');
  const [typeDefaultDays, setTypeDefaultDays] = useState(12);
  const [typeCarryForward, setTypeCarryForward] = useState(false);
  const [typeMaxCarry, setTypeMaxCarry] = useState(0);

  // Queries & Mutations
  const { data: leaveTypesRes, isLoading: loadingTypes } = useLeaveTypes();
  const leaveTypes = leaveTypesRes?.data || [];

  const { data: allocationsRes, isLoading: loadingAllocations } = useLeaveAllocations({
    employeeId: activeUser?.id,
  });
  const allocations = allocationsRes?.data || [];

  const { data: requestsRes, isLoading: loadingRequests } = useLeaveRequests();
  const allRequests = requestsRes?.data || [];

  const createRequestMutation = useSubmitLeaveRequest();
  const processRequestMutation = useProcessLeaveRequest();
  const cancelRequestMutation = useCancelLeaveRequest();
  const createTypeMutation = useCreateLeaveType();
  const deleteTypeMutation = useDeleteLeaveType();

  // Set default selected leave type
  useEffect(() => {
    if (leaveTypes.length > 0 && !selectedLeaveTypeId) {
      const active = leaveTypes.find(t => t.isActive);
      if (active) setSelectedLeaveTypeId(active.id);
    }
  }, [leaveTypes, selectedLeaveTypeId]);

  // Adjust end date if half-day is toggled
  useEffect(() => {
    if (halfDay) {
      setEndDate(startDate);
    }
  }, [halfDay, startDate]);

  // Calculated Days preview
  const calculatedDays = halfDay ? 0.5 : (() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    if (diff < 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  })();

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveTypeId) {
      alert("Please select a leave type category.");
      return;
    }

    try {
      const payload = {
        employeeId: activeUser.id,
        leaveTypeId: selectedLeaveTypeId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        halfDay,
        halfDaySession: halfDay ? halfDaySession : null,
        reason,
      };

      const res = await createRequestMutation.mutateAsync(payload);
      addAuditLog("Applied Leave", "Leave Management", `${activeUser.name} applied for leave request: ${res.data.id}`);
      alert(`Leave request submitted successfully!`);
      
      // Reset form
      setReason('');
      setHalfDay(false);
      setActiveSubModule('apply');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to submit leave request.");
    }
  };

  const handleApprove = async (id: string, name: string) => {
    try {
      await processRequestMutation.mutateAsync({
        id,
        data: { status: 'APPROVED' },
      });
      addAuditLog("Approved Leave Request", "Leave Management", `Approved leave request ${id} for ${name}`);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to approve request.");
    }
  };

  const handleReject = async (id: string, name: string) => {
    const reasonPrompt = prompt("Provide reason for rejection:") || "";
    try {
      await processRequestMutation.mutateAsync({
        id,
        data: { status: 'REJECTED', rejectionReason: reasonPrompt },
      });
      addAuditLog("Rejected Leave Request", "Leave Management", `Rejected leave request ${id} for ${name}`);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to reject request.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      await cancelRequestMutation.mutateAsync(id);
      addAuditLog("Cancelled Leave Request", "Leave Management", `Cancelled leave request ${id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to cancel request.");
    }
  };

  const handleCreateLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTypeMutation.mutateAsync({
        name: typeName,
        code: typeCode,
        description: typeDesc,
        defaultDays: typeDefaultDays,
        carryForward: typeCarryForward,
        maxCarryForward: typeMaxCarry,
      });
      addAuditLog("Created Leave Type", "Leave Management", `Created leave type configuration ${typeName} (${typeCode})`);
      alert("Leave type created successfully!");
      setTypeName('');
      setTypeCode('');
      setTypeDesc('');
      setTypeDefaultDays(12);
      setTypeCarryForward(false);
      setTypeMaxCarry(0);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to create leave type.");
    }
  };

  const handleDeleteType = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete/deactivate "${name}" leave type?`)) return;
    try {
      await deleteTypeMutation.mutateAsync(id);
      addAuditLog("Deactivated Leave Type", "Leave Management", `Deactivated leave type ${name}`);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to delete leave type.");
    }
  };

  const renderStatusBadge = (status: LeaveStatus) => {
    const base = "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase transition-all ";
    switch (status) {
      case 'APPROVED':
        return <span className={base + "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300"}>Approved</span>;
      case 'PENDING':
        return <span className={base + "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse"}>Pending</span>;
      case 'REJECTED':
        return <span className={base + "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"}>Rejected</span>;
      case 'CANCELLED':
        return <span className={base + "bg-slate-150 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}>Cancelled</span>;
      default:
        return <span className={base + "bg-slate-100 text-slate-800"}>{status}</span>;
    }
  };

  const isAdmin = userRole === 'Super Admin' || userRole === 'HR Admin';

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-1">
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
        {isAdmin && (
          <button 
            onClick={() => setActiveSubModule('admin')}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
              activeSubModule === 'admin' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300'
            }`}
          >
            Leave Configurations
          </button>
        )}
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
                {loadingTypes ? (
                  <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                ) : (
                  <select 
                    value={selectedLeaveTypeId} 
                    onChange={(e) => setSelectedLeaveTypeId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    {leaveTypes.filter(t => t.isActive).map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2 py-1">
                <input 
                  type="checkbox" 
                  id="halfDayToggle"
                  checked={halfDay}
                  onChange={(e) => setHalfDay(e.target.checked)}
                  className="rounded text-primary border-slate-350"
                />
                <label htmlFor="halfDayToggle" className="text-slate-500 font-semibold cursor-pointer">
                  Request for Half Day
                </label>
              </div>

              {halfDay && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-slate-400 font-medium">Session Session</label>
                  <select
                    value={halfDaySession}
                    onChange={(e) => setHalfDaySession(e.target.value as HalfDaySession)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="FIRST_HALF">First Half Session</option>
                    <option value="SECOND_HALF">Second Half Session</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">End Date</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    disabled={halfDay}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Total Days Preview</label>
                <div className="w-full px-3 py-2 border rounded-lg bg-slate-100 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-300">
                  {calculatedDays} Days
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Reason for Leave</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide brief explanation..." 
                  rows={3} 
                  required 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300"
                />
              </div>

              <button 
                type="submit" 
                disabled={createRequestMutation.isPending}
                className="w-full py-2.5 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/10 hover:scale-105 transition-all disabled:opacity-50"
              >
                {createRequestMutation.isPending ? "Submitting..." : "Apply Leave Request"}
              </button>
            </form>
          </div>

          {/* Leave Balances & History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Accrued Leave Balances</h3>
            
            {loadingAllocations ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 animate-pulse h-24" />
                ))}
              </div>
            ) : allocations.length === 0 ? (
              <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 text-center text-slate-400">
                No leave allocations configured for this year. Leave requests will auto-provision standard default balances.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {allocations.map((alloc) => {
                  const total = alloc.allocated + alloc.carriedForward;
                  const available = total - (alloc.used + alloc.pending);
                  return (
                    <div key={alloc.id} className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-955">
                      <span className="text-slate-450 font-bold uppercase block text-[10px]">{alloc.leaveType?.name}</span>
                      <p className="text-lg font-black mt-1 text-slate-800 dark:text-white">
                        {available} / {total} Days Available
                      </p>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2 border-t pt-1">
                        <span>Used: {alloc.used}d</span>
                        <span>Pending: {alloc.pending}d</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 space-y-3">
              <span className="font-bold text-slate-800 dark:text-white text-xs block">My Leave Request Log</span>
              {loadingRequests ? (
                <div className="space-y-2">
                  {[1, 2].map(n => (
                    <div key={n} className="h-16 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : allRequests.filter(r => r.employeeId === activeUser.id).length === 0 ? (
                <p className="text-slate-400 text-center py-6">You have not submitted any leave requests yet.</p>
              ) : (
                allRequests.filter(r => r.employeeId === activeUser.id).map((req) => {
                  const startStr = new Date(req.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                  const endStr = new Date(req.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                  const appliedStr = new Date(req.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  return (
                    <div key={req.id} className="p-3 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-955 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-white">{req.leaveType?.name || 'Leave'}</span>
                          <span className="text-[10px] text-slate-400">Applied: {appliedStr}</span>
                          {req.halfDay && (
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.2 rounded text-[8px] font-bold">
                              Half-day ({req.halfDaySession === 'FIRST_HALF' ? '1st Half' : '2nd Half'})
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                          {startStr} to {endStr} ({req.totalDays} {req.totalDays === 1 ? 'day' : 'days'}) • Reason: "{req.reason}"
                        </p>
                        {req.rejectionReason && (
                          <p className="text-red-500 text-[10px] mt-1 font-semibold">
                            Rejection Note: "{req.rejectionReason}"
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5">
                        {renderStatusBadge(req.status)}
                        {['PENDING', 'APPROVED'].includes(req.status) && (
                          <button
                            onClick={() => handleCancel(req.id)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-red-500"
                            title="Cancel request"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
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
              {allRequests.filter(r => r.status === 'PENDING').length} Pending
            </span>
          </h3>

          <div className="space-y-3">
            {loadingRequests ? (
              <div className="space-y-2">
                {[1, 2].map(n => (
                  <div key={n} className="h-16 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : allRequests.filter(r => r.status === 'PENDING').length === 0 ? (
              <p className="text-slate-400 text-center py-6">All leave applications have been processed.</p>
            ) : (
              allRequests.filter(r => r.status === 'PENDING').map((req) => {
                const startStr = new Date(req.startDate).toLocaleDateString();
                const endStr = new Date(req.endDate).toLocaleDateString();
                const appliedStr = new Date(req.appliedDate).toLocaleDateString();
                return (
                  <div key={req.id} className="p-4 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-955 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-white">{req.employee?.name || 'Unknown'}</span>
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                          {req.leaveType?.name}
                        </span>
                        {req.halfDay && (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-0.2 rounded text-[8px] font-bold">
                            Half-day
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Duration: <span className="font-semibold">{startStr} to {endStr}</span> ({req.totalDays} days) • Applied: {appliedStr}
                      </p>
                      <p className="text-slate-450 mt-0.5">Reason: "{req.reason}"</p>
                    </div>
                    
                    {userRole === 'Employee' ? (
                      <span className="text-slate-450 font-bold uppercase text-[9px] flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5 text-slate-400" /> Awaiting Manager Actions
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApprove(req.id, req.employee?.name || 'Employee')}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button 
                          onClick={() => handleReject(req.id, req.employee?.name || 'Employee')}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
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
            <span className="font-bold text-slate-700 dark:text-slate-350 block">Approved Leave Tracks</span>
            <div className="space-y-2">
              {loadingRequests ? (
                <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ) : allRequests.filter(r => r.status === 'APPROVED').length === 0 ? (
                <p className="text-slate-400 italic text-[10px]">No active approved leave records in the system.</p>
              ) : (
                allRequests.filter(r => r.status === 'APPROVED').map(req => {
                  const startStr = new Date(req.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  const endStr = new Date(req.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  return (
                    <div key={req.id} className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 border rounded-lg shadow-sm">
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {req.employee?.name || 'Employee'} — <span className="text-slate-500">{req.leaveType?.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-450 font-medium">
                        {startStr} - {endStr} ({req.totalDays} Days) • Approved
                      </span>
                    </div>
                  );
                })
              )}
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
            {loadingTypes ? (
              <div className="space-y-2">
                {[1, 2].map(n => (
                  <div key={n} className="h-16 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : leaveTypes.length === 0 ? (
              <p className="text-slate-400 text-center">No leave policies defined. Configure leave types to automatically populate policies.</p>
            ) : (
              leaveTypes.map((type) => (
                <div key={type.id} className="p-3.5 border rounded-xl bg-slate-50 dark:bg-slate-955 space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center justify-between">
                    <span>{type.name} ({type.code}) Policy</span>
                    <span className="text-[9px] bg-slate-200 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-650">
                      Default: {type.defaultDays} Days/Year
                    </span>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    {type.description || `Standard corporate allowance for ${type.name}.`}
                  </p>
                  <div className="flex gap-4 text-[9px] text-slate-400 pt-1">
                    <span>Carry Forward: {type.carryForward ? `Yes (Max: ${type.maxCarryForward ?? 0} days)` : "No"}</span>
                    <span>Status: {type.isActive ? "Active Policy" : "Deactivated"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 5. LEAVE CONFIGURATIONS (ADMIN ONLY)     */}
      {/* ======================================= */}
      {activeSubModule === 'admin' && isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          
          {/* Create Configuration Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Add New Leave Type</h3>
            
            <form onSubmit={handleCreateLeaveType} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Leave Type Name</label>
                <input 
                  type="text" 
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="e.g. Maternity Leave"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Short Code</label>
                <input 
                  type="text" 
                  value={typeCode}
                  onChange={(e) => setTypeCode(e.target.value)}
                  placeholder="e.g. MTL"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Description / Rules</label>
                <textarea 
                  value={typeDesc}
                  onChange={(e) => setTypeDesc(e.target.value)}
                  placeholder="Describe rules, rollovers, or criteria..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Default Days Allotted</label>
                <input 
                  type="number" 
                  value={typeDefaultDays}
                  onChange={(e) => setTypeDefaultDays(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input 
                  type="checkbox" 
                  id="carryForwardToggle"
                  checked={typeCarryForward}
                  onChange={(e) => setTypeCarryForward(e.target.checked)}
                  className="rounded text-primary border-slate-350"
                />
                <label htmlFor="carryForwardToggle" className="text-slate-500 font-semibold cursor-pointer">
                  Carry Forward Unused Leaves
                </label>
              </div>

              {typeCarryForward && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-slate-400 font-medium">Max Carry Forward (Days)</label>
                  <input 
                    type="number" 
                    value={typeMaxCarry}
                    onChange={(e) => setTypeMaxCarry(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300"
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={createTypeMutation.isPending}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 hover:scale-105 transition-all disabled:opacity-50"
              >
                {createTypeMutation.isPending ? "Creating..." : "Save Configuration"}
              </button>
            </form>
          </div>

          {/* Configuration List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Active Configurations</h3>
            
            <div className="space-y-3">
              {leaveTypes.map((type) => (
                <div key={type.id} className="p-3 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-955 gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <span>{type.name}</span>
                      <span className="px-2 py-0.2 bg-slate-200 dark:bg-slate-800 rounded text-[9px] text-slate-650">{type.code}</span>
                      {!type.isActive && <span className="px-2 py-0.2 bg-red-100 text-red-800 rounded text-[9px]">Inactive</span>}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      Default days: {type.defaultDays} • Carry-forward: {type.carryForward ? `Yes (Max: ${type.maxCarryForward ?? 0}d)` : "No"}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteType(type.id, type.name)}
                    disabled={deleteTypeMutation.isPending}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                    title="Deactivate or Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

