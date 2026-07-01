import React, { useState } from 'react';
import { useApp, Employee } from '../context/AppContext';
import { 
  Search, Grid, List, ChevronRight, Filter, Download, Mail, 
  Trash2, Edit, FileText, Landmark, User, FileSignature, 
  MapPin, HelpCircle, Upload, CheckSquare, Plus, FileDown,
  Printer, ArrowLeft, ArrowUpRight, ShieldCheck, HelpCircle as HelpIcon,
  Trash, ChevronDown, Check, X, QrCode
} from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
  const { 
    employees, setEmployees, activeSubModule, setActiveSubModule, 
    addAuditLog, selectedEmployeeId, setSelectedEmployeeId 
  } = useApp();

  // Component state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [profileTab, setProfileTab] = useState<'overview' | 'documents' | 'attendance' | 'payroll' | 'leave' | 'performance' | 'assets' | 'timeline' | 'notes'>('overview');
  
  // Master Onboarding Stepper State
  const [stepperStep, setStepperStep] = useState(1);
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    id: `EMP0${employees.length + 1}`,
    name: '', role: '', department: 'Engineering', status: 'Probation',
    joiningDate: new Date().toISOString().split('T')[0], location: 'Mumbai',
    manager: 'Neha Patel', basic: 30000, hra: 12000, allowance: 8000, deductions: 2000, netSalary: 38000,
    bankName: '', bankAccount: '', ifsc: '', pan: '', aadhaar: '', uan: '', pfNumber: '',
    gender: 'Male', dob: '', bloodGroup: 'O+', maritalStatus: 'Single',
    qualification: '', university: '', passingYear: '', pastCompanies: [],
    promotions: [], transfers: [], probationDuration: '6 Months', probationEnd: '',
    confirmationStatus: 'Pending', assets: ['AST-100 (ID Card)']
  });

  // Exit & Clearance Workflow State
  const [selectedExitEmpId, setSelectedExitEmpId] = useState('EMP009');
  const [resignationReason, setResignationReason] = useState('Personal Growth');
  const [itClearance, setItClearance] = useState(false);
  const [financeClearance, setFinanceClearance] = useState(false);
  const [adminClearance, setAdminClearance] = useState(false);

  // Bulk Actions State
  const [bulkMailSubject, setBulkMailSubject] = useState('');
  const [bulkMailBody, setBulkMailBody] = useState('');
  const [selectedBulkEmpIds, setSelectedBulkEmpIds] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Helper selectors
  const activeEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];

  // Filtering Directory
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleCreateEmployee = () => {
    const finalEmp: Employee = {
      ...(newEmp as Employee),
      avatar: newEmp.gender === 'Female' 
        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
    };

    setEmployees(prev => [...prev, finalEmp]);
    addAuditLog("Onboarded Employee", "Employee Center", `Successfully registered employee ${finalEmp.name} (${finalEmp.id})`);
    
    // Reset Stepper
    setStepperStep(1);
    setNewEmp({
      id: `EMP0${employees.length + 2}`,
      name: '', role: '', department: 'Engineering', status: 'Probation',
      joiningDate: new Date().toISOString().split('T')[0], location: 'Mumbai',
      manager: 'Neha Patel', basic: 30000, hra: 12000, allowance: 8000, deductions: 2000, netSalary: 38000,
      bankName: '', bankAccount: '', ifsc: '', pan: '', aadhaar: '', uan: '', pfNumber: '',
      gender: 'Male', dob: '', bloodGroup: 'O+', maritalStatus: 'Single',
      qualification: '', university: '', passingYear: '', pastCompanies: [],
      promotions: [], transfers: [], probationDuration: '6 Months', probationEnd: '',
      confirmationStatus: 'Pending', assets: ['AST-100 (ID Card)']
    });
    
    setActiveSubModule('directory');
  };

  const handleSendBulkMail = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBulkEmpIds.length === 0) {
      alert("Please select employees first!");
      return;
    }
    addAuditLog("Sent Bulk Email", "Employee Center", `Sent communication email to ${selectedBulkEmpIds.length} employees. Subject: "${bulkMailSubject}"`);
    setBulkMailSubject('');
    setBulkMailBody('');
    setSelectedBulkEmpIds([]);
    alert("Emails queued and dispatched successfully!");
  };

  const handleToggleSelectBulk = (id: string) => {
    setSelectedBulkEmpIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const calculateFullFinal = (emp: Employee) => {
    // Basic calculation for presentation
    const totalEarnings = emp.basic + emp.hra + emp.allowance;
    const leaveEncashment = Math.round((emp.basic / 30) * 12); // Mock 12 days leave
    const gratuity = emp.joiningDate.startsWith('201') ? Math.round((emp.basic / 26) * 15 * 5) : 0; // Mock 5 years if joined in 201x
    const deductions = emp.deductions;
    const netPayable = totalEarnings + leaveEncashment + gratuity - deductions;
    return { earnings: totalEarnings, leaveEncash: leaveEncashment, gratuity, deductions, netPayable };
  };

  const handleProcessClearance = () => {
    setEmployees(prev => prev.map(emp => 
      emp.id === selectedExitEmpId ? { ...emp, status: 'Terminated', clearanceStatus: 'Approved' } : emp
    ));
    addAuditLog("F&F Settlement Processed", "Employee Center", `Processed Full & Final settlement for ${employees.find(e => e.id === selectedExitEmpId)?.name}`);
    alert("Clearance checklists approved. F&F statement processed successfully!");
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveSubModule('directory')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'directory' || activeSubModule === 'profile'
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Employee Directory
        </button>
        <button 
          onClick={() => setActiveSubModule('master')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'master' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Employee Onboarding Master
        </button>
        <button 
          onClick={() => setActiveSubModule('orgchart')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'orgchart' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Organization Chart
        </button>
        <button 
          onClick={() => setActiveSubModule('exit')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'exit' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Exit Management & F&F
        </button>
        <button 
          onClick={() => setActiveSubModule('bulk')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'bulk' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Bulk Actions & Mailing
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. EMPLOYEE DIRECTORY                   */}
      {/* ======================================= */}
      {activeSubModule === 'directory' && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, role or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-300"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded-lg px-2 bg-slate-50 dark:bg-slate-950">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select 
                  value={deptFilter} 
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-transparent border-0 text-xs py-1.5 focus:outline-none text-slate-700 dark:text-slate-300"
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded-lg px-2 bg-slate-50 dark:bg-slate-950">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-0 text-xs py-1.5 focus:outline-none text-slate-700 dark:text-slate-300"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Probation">Probation</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              <div className="flex border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shrink-0">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-primary' : 'bg-transparent text-slate-400'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-primary' : 'bg-transparent text-slate-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <button 
                onClick={() => {
                  alert("Exporting current directory view to Excel...");
                  addAuditLog("Exported Directory", "Employee Center", "Exported filtered employee directory database");
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:scale-105 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredEmployees.map((emp) => (
                <div 
                  key={emp.id} 
                  onClick={() => { setSelectedEmployeeId(emp.id); setActiveSubModule('profile'); }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm interactive-card cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    <img src={emp.avatar} alt={emp.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/10 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">{emp.id}</span>
                      <h3 className="font-bold text-slate-850 dark:text-white text-sm hover:text-primary transition-colors">{emp.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{emp.role}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{emp.department}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      emp.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' :
                      emp.status === 'On Leave' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                      emp.status === 'Probation' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' :
                      'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 uppercase">
                  <tr>
                    <th className="p-4">ID / Employee</th>
                    <th className="p-4">Department & Role</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Joining Date</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                  {filteredEmployees.map((emp) => (
                    <tr 
                      key={emp.id} 
                      onClick={() => { setSelectedEmployeeId(emp.id); setActiveSubModule('profile'); }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                    >
                      <td className="p-4 flex items-center gap-3">
                        <img src={emp.avatar} alt={emp.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white leading-none">{emp.name}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{emp.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{emp.role}</p>
                        <p className="text-[10px] text-slate-400">{emp.department}</p>
                      </td>
                      <td className="p-4">{emp.location}</td>
                      <td className="p-4">{emp.joiningDate}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          emp.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' :
                          emp.status === 'On Leave' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                          emp.status === 'Probation' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' :
                          'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <ChevronRight className="h-4 w-4 text-slate-400 inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================= */}
      {/* 2. DETAIL PROFILE PAGE                  */}
      {/* ======================================= */}
      {activeSubModule === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          {/* Back button and profile header */}
          <button 
            onClick={() => setActiveSubModule('directory')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </button>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <img src={activeEmployee.avatar} alt={activeEmployee.name} className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/20 shrink-0" />
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-none">{activeEmployee.name}</h2>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{activeEmployee.id}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{activeEmployee.role} • {activeEmployee.department}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{activeEmployee.location}</span>
                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />Manager: {activeEmployee.manager}</span>
                  <span className="flex items-center gap-1"><Landmark className="h-3.5 w-3.5" />Joined: {activeEmployee.joiningDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  alert("Triggering warning letter generation for " + activeEmployee.name);
                }}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-xs font-semibold transition-colors"
              >
                Issue Letter
              </button>
              <button 
                onClick={() => {
                  // Switch to salary master edit
                  alert("Opening salary revision options...");
                }}
                className="px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:scale-105 transition-all shadow-md shadow-primary/10"
              >
                Promote / Transfer
              </button>
            </div>
          </div>

          {/* Profile Tab selectors */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto gap-2">
            {(['overview', 'documents', 'attendance', 'payroll', 'leave', 'performance', 'assets', 'timeline', 'notes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setProfileTab(tab)}
                className={`py-2.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  profileTab === tab 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Profile Tab Contents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-64">
            
            {profileTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                {/* Personal details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Personal Details</h3>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div><span className="text-slate-400 block">Gender</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{activeEmployee.gender}</p></div>
                    <div><span className="text-slate-400 block">Date of Birth</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{activeEmployee.dob}</p></div>
                    <div><span className="text-slate-400 block">Blood Group</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{activeEmployee.bloodGroup}</p></div>
                    <div><span className="text-slate-400 block">Marital Status</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{activeEmployee.maritalStatus}</p></div>
                    <div><span className="text-slate-400 block">Contact Email</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{activeEmployee.email}</p></div>
                    <div><span className="text-slate-400 block">Contact Phone</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{activeEmployee.phone}</p></div>
                  </div>
                </div>
                
                {/* Qualifications & Past Work */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Academic & Career Background</h3>
                  <div className="grid grid-cols-2 gap-3.5 mb-4">
                    <div><span className="text-slate-400 block">Highest Degree</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{activeEmployee.qualification}</p></div>
                    <div><span className="text-slate-400 block">University</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{activeEmployee.university}</p></div>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Past Companies</span>
                    {activeEmployee.pastCompanies.length === 0 ? (
                      <p className="text-slate-450 italic">No past companies listed (Fresher)</p>
                    ) : (
                      activeEmployee.pastCompanies.map((c, i) => (
                        <div key={i} className="mb-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          <p className="font-bold text-slate-800 dark:text-white">{c.company}</p>
                          <p className="text-[10px] text-slate-400">{c.role} • {c.duration} • CTC: ₹{c.ctc}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'documents' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Identity Documents & Verification</h3>
                  <button 
                    onClick={() => alert("Simulating upload dialog...")}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-primary hover:text-white transition-all font-semibold"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload File
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSignature className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-bold text-slate-850 dark:text-white">Aadhaar Card</p>
                        <p className="text-[10px] text-slate-400">{activeEmployee.aadhaar}</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 px-2 py-0.5 rounded-full text-[9px] font-bold">VERIFIED</span>
                  </div>
                  <div className="p-3 border rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-bold text-slate-850 dark:text-white">PAN Card</p>
                        <p className="text-[10px] text-slate-400">{activeEmployee.pan}</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 px-2 py-0.5 rounded-full text-[9px] font-bold">VERIFIED</span>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'attendance' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Attendance Summary (Current Cycle)</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-center border">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Days</p>
                    <p className="text-xl font-bold mt-1 text-slate-800 dark:text-white">30</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl text-center border">
                    <p className="text-[10px] text-green-600 dark:text-green-400 uppercase font-bold">Present</p>
                    <p className="text-xl font-bold mt-1 text-green-700 dark:text-green-400">22</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl text-center border">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold">Leaves</p>
                    <p className="text-xl font-bold mt-1 text-amber-700 dark:text-amber-400">2</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl text-center border">
                    <p className="text-[10px] text-red-600 dark:text-red-400 uppercase font-bold">Absent</p>
                    <p className="text-xl font-bold mt-1 text-red-700 dark:text-red-400">0</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">Shift Schedule</h4>
                  <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">General Day Shift (G-01)</p>
                      <p className="text-[10px] text-slate-400">09:30 AM to 06:30 PM • 9 Hours (1 Hr break included)</p>
                    </div>
                    <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">ROSTERED</span>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'payroll' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Salary Master Structure & CTC</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Earnings table */}
                  <div className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-950">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2.5">Monthly Earnings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Basic Salary</span><span className="font-bold text-slate-800 dark:text-white">₹{activeEmployee.basic.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>HRA</span><span className="font-bold text-slate-800 dark:text-white">₹{activeEmployee.hra.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Special Allowance</span><span className="font-bold text-slate-800 dark:text-white">₹{activeEmployee.allowance.toLocaleString()}</span></div>
                      <div className="border-t pt-2 flex justify-between font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        <span>Gross Salary</span>
                        <span>₹{(activeEmployee.basic + activeEmployee.hra + activeEmployee.allowance).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Deductions and Bank */}
                  <div className="space-y-4">
                    <div className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-950">
                      <h4 className="font-bold text-slate-800 dark:text-white mb-2.5">Monthly Deductions</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span>Provident Fund (PF)</span><span className="font-bold text-slate-800 dark:text-white">₹3,200</span></div>
                        <div className="flex justify-between"><span>Professional Tax (PT)</span><span className="font-bold text-slate-800 dark:text-white">₹200</span></div>
                        <div className="flex justify-between"><span>Income Tax (TDS mock)</span><span className="font-bold text-slate-800 dark:text-white">₹{(activeEmployee.deductions - 3400).toLocaleString()}</span></div>
                        <div className="border-t pt-2 flex justify-between font-bold text-rose-600 dark:text-rose-400 text-sm">
                          <span>Total Deductions</span>
                          <span>₹{activeEmployee.deductions.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">Net Credited</p>
                        <p className="text-[10px] text-slate-400">Direct Bank Deposit</p>
                      </div>
                      <span className="text-lg font-extrabold text-primary">₹{activeEmployee.netSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">PF & Bank Remittance Codes</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
                    <div><span className="text-slate-400">Bank</span><p className="font-semibold text-slate-800 dark:text-white">{activeEmployee.bankName}</p></div>
                    <div><span className="text-slate-400">Account No</span><p className="font-semibold text-slate-800 dark:text-white">{activeEmployee.bankAccount}</p></div>
                    <div><span className="text-slate-400">Universal Account No (UAN)</span><p className="font-semibold text-slate-800 dark:text-white">{activeEmployee.uan}</p></div>
                    <div><span className="text-slate-400">PF Member ID</span><p className="font-semibold text-slate-800 dark:text-white">{activeEmployee.pfNumber}</p></div>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'leave' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Leave Summary Info</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950">
                    <p className="text-slate-400">Casual Leave (CL)</p>
                    <p className="text-lg font-bold mt-1 text-slate-800 dark:text-white">8 / 12 Days</p>
                  </div>
                  <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950">
                    <p className="text-slate-400">Sick Leave (SL)</p>
                    <p className="text-lg font-bold mt-1 text-slate-800 dark:text-white">5 / 10 Days</p>
                  </div>
                  <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950">
                    <p className="text-slate-400">Earned Leave (EL)</p>
                    <p className="text-lg font-bold mt-1 text-slate-800 dark:text-white">12 / 18 Days</p>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'performance' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">KRA & KPI Performance Ratings</h3>
                <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">Q1 2026 Core Goal Cycle</p>
                    <p className="text-[10px] text-slate-400">Reviewed by {activeEmployee.manager}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-primary">4.2 / 5.0</p>
                    <span className="bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 px-2 py-0.5 rounded-full text-[9px] font-bold">EXCEEDS EXPECTATIONS</span>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'assets' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Assigned Hardware & IT Assets</h3>
                <div className="space-y-2">
                  {activeEmployee.assets.map((ast, idx) => (
                    <div key={idx} className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <QrCode className="h-5 w-5 text-slate-400" />
                        <span className="font-bold text-slate-800 dark:text-white">{ast}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Verified Auto-Sync • Active</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileTab === 'timeline' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Lifecycle History & Transfers</h3>
                <div className="space-y-4 relative pl-5 border-l">
                  <div className="relative pb-2">
                    <span className="absolute -left-6.5 top-0.5 h-3.5 w-3.5 rounded-full bg-primary border-2 border-white dark:border-slate-900"></span>
                    <p className="font-bold text-slate-850 dark:text-white">Joined Company</p>
                    <p className="text-[10px] text-slate-400">{activeEmployee.joiningDate}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Hired as {activeEmployee.role} in {activeEmployee.department} team located in {activeEmployee.location}.</p>
                  </div>
                  {activeEmployee.promotions.map((p, idx) => (
                    <div key={idx} className="relative pb-2">
                      <span className="absolute -left-6.5 top-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></span>
                      <p className="font-bold text-green-600 dark:text-green-400">Promotion / Salary Revision</p>
                      <p className="text-[10px] text-slate-400">{p.date}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Promoted from {p.oldRole} to {p.newRole} with an increment of {p.salaryIncrement}.</p>
                    </div>
                  ))}
                  {activeEmployee.transfers.map((t, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-6.5 top-0.5 h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900"></span>
                      <p className="font-bold text-blue-600 dark:text-blue-400">Departmental Transfer</p>
                      <p className="text-[10px] text-slate-400">{t.date}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Transferred from {t.oldDept} to {t.newDept} in {t.location} office.</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileTab === 'notes' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Internal HR & Performance Notes</h3>
                <textarea 
                  placeholder="Type an internal note regarding performance, disciplinary actions or awards..." 
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  rows={4}
                />
                <button 
                  onClick={() => alert("Note saved successfully!")}
                  className="px-3.5 py-1.5 bg-primary text-white rounded-lg font-semibold hover:scale-105 transition-all shadow-sm"
                >
                  Save Internal Note
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 3. ONBOARDING STEPPER MASTER            */}
      {/* ======================================= */}
      {activeSubModule === 'master' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-xs">
          <div>
            <h2 className="text-md font-bold text-slate-800 dark:text-white">Employee Onboarding Master Setup</h2>
            <p className="text-slate-400 mt-1">Create a new employee master registry record through a step-by-step confirmation wizard.</p>
          </div>

          {/* Stepper Steps UI */}
          <div className="flex items-center justify-between border-b pb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold border ${
                  stepperStep === step 
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                    : stepperStep > step 
                    ? 'bg-green-500 text-white border-green-500' 
                    : 'border-slate-200 dark:border-slate-800 text-slate-400'
                }`}>
                  {step}
                </div>
                <span className={`font-semibold ${stepperStep === step ? 'text-primary' : 'text-slate-400'}`}>
                  {step === 1 ? 'Personal Details' : step === 2 ? 'Remittance & Work' : 'Confirmation'}
                </span>
                {step < 3 && <ChevronRight className="h-4 w-4 text-slate-400 mx-2 hidden md:block" />}
              </div>
            ))}
          </div>

          {/* Step 1 Content */}
          {stepperStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Step 1: Personal Details & Academics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Full Name</label>
                  <input 
                    type="text" 
                    value={newEmp.name} 
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    placeholder="Enter full name" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Job Designation Role</label>
                  <input 
                    type="text" 
                    value={newEmp.role} 
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                    placeholder="e.g. Frontend Developer" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Gender</label>
                  <select 
                    value={newEmp.gender} 
                    onChange={(e) => setNewEmp({ ...newEmp, gender: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Department</label>
                  <select 
                    value={newEmp.department} 
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Date of Birth</label>
                  <input 
                    type="date" 
                    value={newEmp.dob} 
                    onChange={(e) => setNewEmp({ ...newEmp, dob: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Highest Academic Degree</label>
                  <input 
                    type="text" 
                    value={newEmp.qualification} 
                    onChange={(e) => setNewEmp({ ...newEmp, qualification: e.target.value })}
                    placeholder="e.g. MBA in HR" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 Content */}
          {stepperStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Step 2: Remittance Details & Banking</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Bank Name</label>
                  <input 
                    type="text" 
                    value={newEmp.bankName} 
                    onChange={(e) => setNewEmp({ ...newEmp, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Bank Account Number</label>
                  <input 
                    type="text" 
                    value={newEmp.bankAccount} 
                    onChange={(e) => setNewEmp({ ...newEmp, bankAccount: e.target.value })}
                    placeholder="Enter account number" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">IFSC Code</label>
                  <input 
                    type="text" 
                    value={newEmp.ifsc} 
                    onChange={(e) => setNewEmp({ ...newEmp, ifsc: e.target.value })}
                    placeholder="e.g. HDFC0000240" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">PAN Card Number</label>
                  <input 
                    type="text" 
                    value={newEmp.pan} 
                    onChange={(e) => setNewEmp({ ...newEmp, pan: e.target.value })}
                    placeholder="10-digit alphanumeric" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Aadhaar Card Number</label>
                  <input 
                    type="text" 
                    value={newEmp.aadhaar} 
                    onChange={(e) => setNewEmp({ ...newEmp, aadhaar: e.target.value })}
                    placeholder="12-digit number" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Basic Salary (Monthly)</label>
                  <input 
                    type="number" 
                    value={newEmp.basic} 
                    onChange={(e) => {
                      const b = Number(e.target.value);
                      const h = Math.round(b * 0.4);
                      const a = Math.round(b * 0.3);
                      const d = Math.round(b * 0.15);
                      setNewEmp({ ...newEmp, basic: b, hra: h, allowance: a, deductions: d, netSalary: b + h + a - d });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 Content */}
          {stepperStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Step 3: Confirm Master Record Information</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl space-y-3.5">
                <p className="font-bold text-slate-800 dark:text-white">Verify all fields match legal physical documents:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><span className="text-slate-400">Name</span><p className="font-semibold text-slate-800 dark:text-white">{newEmp.name || "N/A"}</p></div>
                  <div><span className="text-slate-400">Role</span><p className="font-semibold text-slate-800 dark:text-white">{newEmp.role || "N/A"}</p></div>
                  <div><span className="text-slate-400">Department</span><p className="font-semibold text-slate-800 dark:text-white">{newEmp.department}</p></div>
                  <div><span className="text-slate-400">Salary Package (Net)</span><p className="font-semibold text-slate-800 dark:text-white">₹{newEmp.netSalary?.toLocaleString()}</p></div>
                  <div><span className="text-slate-400">Bank Account</span><p className="font-semibold text-slate-800 dark:text-white">{newEmp.bankAccount || "N/A"}</p></div>
                  <div><span className="text-slate-400">PAN</span><p className="font-semibold text-slate-800 dark:text-white">{newEmp.pan || "N/A"}</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex justify-between border-t pt-4">
            <button 
              disabled={stepperStep === 1}
              onClick={() => setStepperStep(prev => prev - 1)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-950 disabled:opacity-50"
            >
              Previous Step
            </button>
            {stepperStep < 3 ? (
              <button 
                onClick={() => setStepperStep(prev => prev + 1)}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:scale-105 transition-all"
              >
                Next Step
              </button>
            ) : (
              <button 
                onClick={handleCreateEmployee}
                disabled={!newEmp.name || !newEmp.role}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold hover:scale-105 transition-all disabled:opacity-50"
              >
                Onboard Employee Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 4. ORGANIZATION CHART                   */}
      {/* ======================================= */}
      {activeSubModule === 'orgchart' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 text-center animate-fade-in text-xs">
          <div>
            <h2 className="text-md font-bold text-slate-800 dark:text-white">Organization Hierarchy Chart</h2>
            <p className="text-slate-400 mt-1">Corporate reporting structures from Board executive down to development teams.</p>
          </div>

          <div className="overflow-x-auto py-8">
            <div className="inline-block min-w-full align-middle">
              <div className="flex flex-col items-center">
                {/* Level 0: CEO */}
                <div className="bg-primary border border-primary/20 p-3 rounded-2xl text-center w-52 shadow-md org-node">
                  <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120" alt="CEO" className="h-10 w-10 rounded-full mx-auto object-cover ring-2 ring-white/20 mb-2" />
                  <p className="font-bold text-white leading-none">Vikram Malhotra</p>
                  <p className="text-[9px] text-white/70 mt-1 uppercase font-bold">Chief Executive Officer</p>
                </div>

                <div className="h-6 w-0.5 bg-slate-200 dark:bg-slate-800 my-1"></div>

                {/* Level 1: Directors/VP */}
                <div className="flex gap-16 relative">
                  {/* Left Column: VP Engineering & Manager */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white dark:bg-slate-950 border p-3 rounded-2xl text-center w-48 shadow-sm org-node">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" alt="Mgr" className="h-9 w-9 rounded-full mx-auto object-cover mb-2" />
                      <p className="font-bold text-slate-800 dark:text-white leading-none">Neha Patel</p>
                      <p className="text-[9px] text-slate-400 mt-1">Engineering Manager</p>
                    </div>
                    
                    <div className="h-6 w-0.5 bg-slate-200 dark:bg-slate-800 my-1"></div>

                    {/* Level 2: Engineering Team */}
                    <div className="flex gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-center w-36 shadow-sm org-node org-node-last">
                        <p className="font-bold text-slate-800 dark:text-white leading-none">Aarav Sharma</p>
                        <p className="text-[8px] text-slate-400 mt-0.5">Senior Dev</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-center w-36 shadow-sm org-node org-node-last">
                        <p className="font-bold text-slate-800 dark:text-white leading-none">Ananya Roy</p>
                        <p className="text-[8px] text-slate-400 mt-0.5">Intern UI Dev</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: HR Director & Team */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white dark:bg-slate-950 border p-3 rounded-2xl text-center w-48 shadow-sm org-node">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120" alt="Mgr" className="h-9 w-9 rounded-full mx-auto object-cover mb-2" />
                      <p className="font-bold text-slate-800 dark:text-white leading-none">Shalini Sen</p>
                      <p className="text-[9px] text-slate-400 mt-1">HR Director</p>
                    </div>

                    <div className="h-6 w-0.5 bg-slate-200 dark:bg-slate-800 my-1"></div>

                    <div className="bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-center w-36 shadow-sm org-node org-node-last">
                      <p className="font-bold text-slate-800 dark:text-white leading-none">Karan Johar</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">HR Generalist</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 5. EXIT MANAGEMENT & RESIGNATION        */}
      {/* ======================================= */}
      {activeSubModule === 'exit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          {/* Left Column: Exit Initiation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Trigger Employee Exit</h3>
            
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Select Resigning Employee</label>
              <select 
                value={selectedExitEmpId} 
                onChange={(e) => setSelectedExitEmpId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Reason for Resignation</label>
              <textarea 
                value={resignationReason} 
                onChange={(e) => setResignationReason(e.target.value)}
                rows={3} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
              />
            </div>

            <div className="space-y-3.5 pt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Clearance Checklist</span>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={itClearance} onChange={(e) => setItClearance(e.target.checked)} className="rounded text-primary focus:ring-0" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">IT Asset & System Revocation</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={financeClearance} onChange={(e) => setFinanceClearance(e.target.checked)} className="rounded text-primary focus:ring-0" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Finance & Expense Claims Match</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={adminClearance} onChange={(e) => setAdminClearance(e.target.checked)} className="rounded text-primary focus:ring-0" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Admin & Key Handover Completed</span>
              </label>
            </div>

            <button 
              onClick={handleProcessClearance}
              disabled={!itClearance || !financeClearance || !adminClearance}
              className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-md shadow-rose-500/10 disabled:opacity-50"
            >
              Approve F&F Settlement
            </button>
          </div>

          {/* Right Column: Full & Final Settlement Calculator Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Full & Final (F&F) Settlement Statement</h3>
            {(() => {
              const emp = employees.find(e => e.id === selectedExitEmpId);
              if (!emp) return <p className="text-slate-400">Employee not found.</p>;
              const details = calculateFullFinal(emp);
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 border rounded-xl">
                    <div><span className="text-slate-400">Employee</span><p className="font-bold text-slate-850 dark:text-white">{emp.name}</p></div>
                    <div><span className="text-slate-400">Designation</span><p className="font-semibold text-slate-700 dark:text-slate-300">{emp.role}</p></div>
                    <div><span className="text-slate-400">Resigned On</span><p className="font-semibold text-slate-700 dark:text-slate-300">2026-06-30</p></div>
                    <div><span className="text-slate-400">Clearance Status</span><p className="font-bold text-amber-500">{emp.clearanceStatus || "Pending Checks"}</p></div>
                  </div>

                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 border-b font-semibold">
                        <tr>
                          <th className="p-3">Salary Component Item</th>
                          <th className="p-3 text-right">Addition Amount</th>
                          <th className="p-3 text-right">Deduction Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-650 dark:text-slate-350">
                        <tr>
                          <td className="p-3">Notice Period Earned (1 Month)</td>
                          <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">₹{details.earnings.toLocaleString()}</td>
                          <td className="p-3 text-right">-</td>
                        </tr>
                        <tr>
                          <td className="p-3">Leave Encashment (12 Accrued Days)</td>
                          <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">₹{details.leaveEncash.toLocaleString()}</td>
                          <td className="p-3 text-right">-</td>
                        </tr>
                        {details.gratuity > 0 && (
                          <tr>
                            <td className="p-3">Gratuity Settlement (5 Years completed)</td>
                            <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">₹{details.gratuity.toLocaleString()}</td>
                            <td className="p-3 text-right">-</td>
                          </tr>
                        )}
                        <tr>
                          <td className="p-3">Provident Fund Deducted</td>
                          <td className="p-3 text-right">-</td>
                          <td className="p-3 text-right text-rose-500 font-medium">₹{details.deductions.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-white border-t">
                          <td className="p-3 text-sm">Net Payable F&F Amount</td>
                          <td className="p-3 text-right text-primary text-sm" colSpan={2}>
                            ₹{details.netPayable.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 6. BULK ACTIONS & MAILING               */}
      {/* ======================================= */}
      {activeSubModule === 'bulk' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          {/* Left Column: Upload and File import */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Bulk Excel/CSV Import</h3>
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); alert("File dropped! Parsing data structure..."); }}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200">Drag & drop your CSV template</p>
              <p className="text-[10px] text-slate-400 mt-1">or click to browse local files</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => alert("Downloading Employee Onboarding Template (CSV)...")}
                className="w-full py-1.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-lg font-bold flex items-center justify-center gap-1.5"
              >
                <FileDown className="h-4 w-4" />
                Template
              </button>
              <button 
                onClick={() => {
                  alert("Syncing 12 records from Excel file...");
                  addAuditLog("Bulk Import Sync", "Employee Center", "Synchronized 12 employee records via excel file upload");
                }}
                className="w-full py-1.5 bg-primary text-white rounded-lg font-bold shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                Process Upload
              </button>
            </div>
          </div>

          {/* Right Column: Bulk Email Communication */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Dispatch Bulk Email & Alert</h3>
            
            <form onSubmit={handleSendBulkMail} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-slate-400 font-bold block mb-1">Select Recipients ({selectedBulkEmpIds.length} chosen)</span>
                  <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-1.5 bg-slate-50 dark:bg-slate-950">
                    {employees.map(e => (
                      <label key={e.id} className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={selectedBulkEmpIds.includes(e.id)} 
                          onChange={() => handleToggleSelectBulk(e.id)}
                          className="rounded text-primary focus:ring-0" 
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{e.name} ({e.department})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Subject Title</label>
                    <input 
                      type="text" 
                      value={bulkMailSubject} 
                      onChange={(e) => setBulkMailSubject(e.target.value)}
                      placeholder="e.g. Q2 Performance Review Kickoff" 
                      required 
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Email Content Body</label>
                    <textarea 
                      value={bulkMailBody} 
                      onChange={(e) => setBulkMailBody(e.target.value)}
                      placeholder="Write your corporate announcements or reminders here..." 
                      rows={3} 
                      required 
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t pt-4">
                <button 
                  type="submit" 
                  disabled={selectedBulkEmpIds.length === 0}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold flex items-center gap-1.5 hover:scale-105 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Emails & Notifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
