import {
    Download,
    Landmark,
    FileText,
    FileSpreadsheet,
    Search,
    Filter,
    Calendar,
    Building,
    CheckCircle2
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const Payroll: React.FC = () => {
  const { employees, activeSubModule, setActiveSubModule, addAuditLog, userRole } = useApp();

  const [selectedEmpId, setSelectedEmpId] = useState('EMP001');
  const [payslipStyle, setPayslipStyle] = useState<'classic' | 'modern' | 'minimalist' | 'grid' | 'fluid'>('classic');
  const [cycleStatus, setCycleStatus] = useState<'Pending Attendance Lock' | 'Processing Salaries' | 'Disbursed'>('Pending Attendance Lock');

  // Salary revisions / Stop payment state
  const [stopPaymentList, setStopPaymentList] = useState<string[]>([]);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [arrearCalculated, setArrearCalculated] = useState(false);
  const [incrementPercentage, setIncrementPercentage] = useState(0);

  // Reports & ECR State
  const [reportMonth, setReportMonth] = useState('June');
  const [reportYear, setReportYear] = useState('2026');
  const [reportSearch, setReportSearch] = useState('');
  const [ecrGenerated, setEcrGenerated] = useState(false);

  // Loans State
  const [loans, setLoans] = useState([
    { id: "LN091", name: "Aarav Sharma", principal: 50000, balance: 35000, emi: 5000, approvedDate: "2026-03-01", status: "Active" }
  ]);

  // Investment Declaration Form State
  const [sec80C, setSec80C] = useState(120000);
  const [sec80D, setSec80D] = useState(25000);
  const [declaredHra, setDeclaredHra] = useState(180000);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  const handleRunPayrollCycle = () => {
    if (cycleStatus === 'Pending Attendance Lock') {
      setCycleStatus('Processing Salaries');
      addAuditLog("Locked Attendance Cycle", "Payroll Processing", "June 2026 attendance records locked for salary computation.");
      alert("Attendance cycle locked successfully! You can now calculate salaries.");
    } else if (cycleStatus === 'Processing Salaries') {
      setCycleStatus('Disbursed');
      addAuditLog("Disbursed Salaries", "Payroll Processing", `Completed salary disbursement for ${employees.length} employees. Total Net: ₹${employees.reduce((acc, e) => acc + e.netSalary, 0).toLocaleString()}`);
      alert("Salaries computed, Bank Funding sheet created, and funds disbursed!");
    }
  };

  const handleStopPaymentToggle = (id: string) => {
    setStopPaymentList(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    const empName = employees.find(e => e.id === id)?.name;
    const action = stopPaymentList.includes(id) ? "Revoked Stop Payment" : "Applied Stop Payment";
    addAuditLog(action, "Payroll Processing", `${action} for employee ${empName} (${id})`);
  };

  const handleApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const activeUser = employees[0]; // Aarav Sharma
    const newLoan = {
      id: `LN${Math.floor(Math.random() * 1000)}`,
      name: activeUser.name,
      principal: 30000,
      balance: 30000,
      emi: 3000,
      approvedDate: new Date().toISOString().split('T')[0],
      status: "Active"
    };
    setLoans(prev => [...prev, newLoan]);
    addAuditLog("Loan Approved", "Payroll Processing", `Approved Advance/Loan request of ₹30,000 for ${activeUser.name}`);
    alert("Advance cash/loan request approved.");
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveSubModule('process')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'process' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Salary Processing Cycle
        </button>
        <button 
          onClick={() => setActiveSubModule('loans')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'loans' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Loans & Advances Ledger
        </button>
        <button 
          onClick={() => setActiveSubModule('investment')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'investment' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Investment Declaration
        </button>
        <button 
          onClick={() => setActiveSubModule('payslips')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'payslips' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Payslip & Templates
        </button>
        <button 
          onClick={() => setActiveSubModule('reports')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'reports' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Payroll Reports & ECR
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. SALARY PROCESSING CYCLE              */}
      {/* ======================================= */}
      {activeSubModule === 'process' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          
          {/* Main Processing Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Payroll Run Center</h3>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Cycle:</span>
                <span className="font-bold text-slate-800 dark:text-white">June 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Processing Status:</span>
                <span className="font-bold text-amber-500">{cycleStatus}</span>
              </div>
            </div>

            <button 
              onClick={handleRunPayrollCycle}
              disabled={cycleStatus === 'Disbursed'}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/10 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {cycleStatus === 'Pending Attendance Lock' ? 'Lock Attendance Roster' : 
               cycleStatus === 'Processing Salaries' ? 'Calculate & Disburse Salaries' : 'Payroll Cycle Closed'}
            </button>

            <div className="border-t pt-4 space-y-3.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Quick Calculation Options</span>
              <label className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Arrear Calculation</span>
                <button 
                  onClick={() => { setArrearCalculated(true); alert("Arrears calculated."); }}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg font-bold"
                >
                  {arrearCalculated ? 'Recalculate' : 'Compute'}
                </button>
              </label>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Bulk Salary Increment (%)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={incrementPercentage} 
                    onChange={(e) => setIncrementPercentage(Number(e.target.value))}
                    className="w-16 px-2 py-1 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350" 
                  />
                  <button 
                    onClick={() => {
                      if (incrementPercentage <= 0) return;
                      addAuditLog("Applied Increment", "Payroll Processing", `Applied bulk increment of ${incrementPercentage}% to engineering department`);
                      alert(`Mock applied ${incrementPercentage}% increment to department.`);
                    }}
                    className="flex-1 py-1 bg-emerald-500 text-white rounded-lg font-bold"
                  >
                    Apply Revision
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stop Payment & Exclusions list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Excluded Employees / Stop Payment Register</h3>
            
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-semibold border-b">
                  <tr>
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Net Salary</th>
                    <th className="p-3 text-center">Payroll Hold Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-650 dark:text-slate-350">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="p-3 font-bold text-slate-800 dark:text-white">{emp.name}</td>
                      <td className="p-3">{emp.department}</td>
                      <td className="p-3">₹{emp.netSalary.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleStopPaymentToggle(emp.id)}
                          className={`px-3 py-1 rounded-lg font-bold ${
                            stopPaymentList.includes(emp.id) 
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {stopPaymentList.includes(emp.id) ? 'HOLD PAYMENT ACTIVE' : 'APPROVE TO RUN'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. LOANS & ADVANCES LEDGER              */}
      {/* ======================================= */}
      {activeSubModule === 'loans' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          {/* Apply loan Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Apply for Advance/Loan</h3>
            
            <form onSubmit={handleApplyLoan} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Principal Amount Requested</label>
                <input 
                  type="number" 
                  defaultValue={30000} 
                  required 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Monthly Installment (EMI)</label>
                <input 
                  type="number" 
                  defaultValue={3000} 
                  required 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Purpose</label>
                <textarea 
                  defaultValue="Home improvement medical emergencies" 
                  rows={3} 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md"
              >
                Submit Loan Application
              </button>
            </form>
          </div>

          {/* Active Ledger */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Company Loan Ledger</h3>
            
            <div className="space-y-3.5">
              {loans.map((ln) => (
                <div key={ln.id} className="p-4 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white">{ln.name}</span>
                      <span className="bg-amber-100 text-amber-850 px-2 py-0.5 rounded-full text-[9px] font-bold">{ln.id}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      Approved: {ln.approvedDate} • Monthly Deduction: <span className="font-bold text-slate-850 dark:text-white">₹{ln.emi.toLocaleString()}</span>
                    </p>
                    <p className="text-slate-400 mt-0.5">Remaining Principal: ₹{ln.balance.toLocaleString()} / ₹{ln.principal.toLocaleString()}</p>
                  </div>
                  
                  <span className="bg-green-150 text-green-700 px-2.5 py-0.5 rounded-full font-bold">{ln.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 3. INVESTMENT DECLARATION               */}
      {/* ======================================= */}
      {activeSubModule === 'investment' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-xs">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Income Tax IT Declaration Portal</h3>
            <p className="text-slate-400 mt-1">Declare deductions under Section 80C, 80D, and HRA for tax exemption calculation.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); addAuditLog("Saved Tax Declarations", "Payroll Processing", "Saved monthly investment declaration values."); alert("Declarations saved successfully!"); }} className="space-y-4 max-w-xl">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Section 80C Deductions (PPF, ELSS, Insurance - Max ₹1,50,000)</label>
              <input 
                type="number" 
                value={sec80C} 
                onChange={(e) => setSec80C(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-200 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Section 80D Deductions (Medical Insurance premiums)</label>
              <input 
                type="number" 
                value={sec80D} 
                onChange={(e) => setSec80D(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-200 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Annual Declared House Rent (HRA Exemptions)</label>
              <input 
                type="number" 
                value={declaredHra} 
                onChange={(e) => setDeclaredHra(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-200 font-semibold"
              />
            </div>

            <button 
              type="submit" 
              className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md shadow-primary/10"
            >
              Save Declarations
            </button>
          </form>
        </div>
      )}

      {/* ======================================= */}
      {/* 4. PAYSLIP TEMPLATE GENERATOR           */}
      {/* ======================================= */}
      {activeSubModule === 'payslips' && (
        <div className="space-y-6 animate-fade-in text-xs">
          
          {/* Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-bold uppercase">Template Layout:</span>
              <div className="flex flex-wrap gap-1">
                {(['classic', 'modern', 'minimalist', 'grid', 'fluid'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setPayslipStyle(style)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      payslipStyle === style 
                        ? 'bg-primary text-white' 
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {style.toUpperCase()} Style
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <select 
                value={selectedEmpId} 
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="px-3 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                ))}
              </select>
              <button 
                onClick={() => alert("Downloading Payslip PDF...")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg font-bold hover:scale-105 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>PDF Download</span>
              </button>
            </div>
          </div>

          {/* Payslip View wrapper */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 shadow-md max-w-3xl mx-auto space-y-6">
            
            {/* Template layout rendering */}
            {payslipStyle === 'classic' && (
              <div className="border border-slate-350 p-6 space-y-6 text-slate-800 dark:text-slate-100 font-serif">
                <div className="text-center">
                  <h2 className="text-lg font-bold uppercase">FactoCorp Technologies Pvt Ltd</h2>
                  <p className="text-[10px] italic">12th Floor, Trade Center, Bandra Kurla Complex, Mumbai - 400051</p>
                  <p className="font-bold border-y py-1.5 mt-3 uppercase text-xs">Salary Statement for June 2026</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] border-b pb-4">
                  <div>
                    <p><span className="font-bold">Employee ID:</span> {selectedEmployee.id}</p>
                    <p><span className="font-bold">Employee Name:</span> {selectedEmployee.name}</p>
                    <p><span className="font-bold">Department:</span> {selectedEmployee.department}</p>
                    <p><span className="font-bold">Designation:</span> {selectedEmployee.role}</p>
                  </div>
                  <div>
                    <p><span className="font-bold">Bank Name:</span> {selectedEmployee.bankName}</p>
                    <p><span className="font-bold">Account No:</span> {selectedEmployee.bankAccount}</p>
                    <p><span className="font-bold">UAN No:</span> {selectedEmployee.uan}</p>
                    <p><span className="font-bold">PAN Card:</span> {selectedEmployee.pan}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-0 border">
                  <div className="border-r">
                    <div className="bg-slate-50 p-2 font-bold border-b text-[10px]">Earnings</div>
                    <div className="p-3 space-y-2 text-[10px]">
                      <div className="flex justify-between"><span>Basic Salary</span><span>₹{selectedEmployee.basic.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>HRA</span><span>₹{selectedEmployee.hra.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Special Allowance</span><span>₹{selectedEmployee.allowance.toLocaleString()}</span></div>
                    </div>
                  </div>
                  <div>
                    <div className="bg-slate-50 p-2 font-bold border-b text-[10px]">Deductions</div>
                    <div className="p-3 space-y-2 text-[10px]">
                      <div className="flex justify-between"><span>Provident Fund (PF)</span><span>₹3,200</span></div>
                      <div className="flex justify-between"><span>Professional Tax (PT)</span><span>₹200</span></div>
                      <div className="flex justify-between"><span>Income Tax (TDS)</span><span>₹{(selectedEmployee.deductions - 3400).toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between border p-3 font-bold text-sm bg-slate-50">
                  <span>Net Credited Amount:</span>
                  <span>₹{selectedEmployee.netSalary.toLocaleString()}</span>
                </div>
              </div>
            )}

            {payslipStyle === 'modern' && (
              <div className="p-6 space-y-6 text-slate-800 dark:text-slate-100 font-sans border-2 border-primary/20 rounded-xl relative overflow-hidden bg-slate-50/20 dark:bg-slate-900/50">
                <div className="absolute right-0 top-0 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase">CONFIDENTIAL</div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-xl text-white">
                    <Landmark className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-md font-extrabold text-primary">FactoCorp HRMS</h2>
                    <p className="text-[10px] text-slate-400 font-semibold">June 2026 Remittance Statement</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-950 text-[10px]">
                  <div>
                    <p className="text-slate-400 uppercase font-bold">Employee Details</p>
                    <p className="font-bold text-slate-800 dark:text-white mt-1">{selectedEmployee.name}</p>
                    <p className="text-slate-500 mt-0.5">{selectedEmployee.role} ({selectedEmployee.id})</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase font-bold">Bank Deposit</p>
                    <p className="font-semibold text-slate-750 dark:text-slate-200 mt-1">{selectedEmployee.bankName}</p>
                    <p className="text-slate-500 mt-0.5">Account: ending in {selectedEmployee.bankAccount.slice(-4)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px]">
                  <div className="space-y-2">
                    <span className="font-bold text-slate-400 block border-b pb-1">EARNINGS</span>
                    <div className="flex justify-between"><span>Basic Pay</span><span className="font-semibold">₹{selectedEmployee.basic.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>HRA</span><span className="font-semibold">₹{selectedEmployee.hra.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Allowance</span><span className="font-semibold">₹{selectedEmployee.allowance.toLocaleString()}</span></div>
                  </div>
                  <div className="space-y-2">
                    <span className="font-bold text-slate-400 block border-b pb-1">DEDUCTIONS</span>
                    <div className="flex justify-between"><span>PF</span><span className="font-semibold">₹3,200</span></div>
                    <div className="flex justify-between"><span>PT</span><span className="font-semibold">₹200</span></div>
                    <div className="flex justify-between"><span>Income Tax</span><span className="font-semibold">₹{(selectedEmployee.deductions - 3400).toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-primary">Net Take-Home</p>
                    <p className="text-[9px] text-slate-400">Directly transferred on Jul 1, 2026</p>
                  </div>
                  <span className="text-lg font-black text-primary">₹{selectedEmployee.netSalary.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Other 13 styles represented under standard clean wrappers */}
            {(payslipStyle === 'minimalist' || payslipStyle === 'grid' || payslipStyle === 'fluid') && (
              <div className="p-6 border rounded-xl space-y-4 text-xs font-mono">
                <div className="flex justify-between font-bold border-b pb-2">
                  <span>FactoCorp Inc.</span>
                  <span>Payslip June 2026</span>
                </div>
                <div className="space-y-1">
                  <p>Employee: {selectedEmployee.name} ({selectedEmployee.id})</p>
                  <p>Basic: ₹{selectedEmployee.basic.toLocaleString()}</p>
                  <p>HRA: ₹{selectedEmployee.hra.toLocaleString()}</p>
                  <p>Deductions: ₹{selectedEmployee.deductions.toLocaleString()}</p>
                  <p className="font-bold border-t pt-2 mt-2">Net Pay: ₹{selectedEmployee.netSalary.toLocaleString()}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 5. PAYROLL REPORTS & ECR                */}
      {/* ======================================= */}
      {activeSubModule === 'reports' && (
        <div className="space-y-6 animate-fade-in text-xs">
          
          {/* Top Control Bar & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            
            {/* Filter controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 lg:col-span-1">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs border-b pb-1.5 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-primary" />
                Report Filters
              </h4>
              <div className="space-y-2">
                <div>
                  <label className="text-slate-400 font-medium">Select Month</label>
                  <select 
                    value={reportMonth} 
                    onChange={(e) => setReportMonth(e.target.value)}
                    className="w-full px-2 py-1.5 mt-1 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  >
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Select Year</label>
                  <select 
                    value={reportYear} 
                    onChange={(e) => setReportYear(e.target.value)}
                    className="w-full px-2 py-1.5 mt-1 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Statutory Stats Card: EPF */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between lg:col-span-1">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">EPF Wages (Statutory Capped)</span>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
                  ₹{(employees.length * 15000).toLocaleString()}
                </h3>
              </div>
              <span className="text-[9px] text-slate-400 mt-2">Capped at ₹15,000 per member per month</span>
            </div>

            {/* Statutory Stats Card: EPF Contribution */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between lg:col-span-1">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total PF Contribution (12%)</span>
                <h3 className="text-xl font-extrabold text-primary mt-1">
                  ₹{(employees.length * 15000 * 0.12).toLocaleString()}
                </h3>
              </div>
              <span className="text-[9px] text-emerald-500 font-semibold mt-2">100% compliant with EPFO rules</span>
            </div>

            {/* Action Card: ECR Generation */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between lg:col-span-1">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Electronic Challan (ECR)</span>
                <p className="text-slate-500 mt-1">Generate text file formatted for EPFO unified portal upload.</p>
              </div>
              <button
                onClick={() => {
                  setEcrGenerated(true);
                  addAuditLog("Generated ECR File", "Payroll Processing", `Generated PF ECR Challan file for ${reportMonth} ${reportYear}`);
                  alert(`ECR file for ${reportMonth} ${reportYear} generated successfully!`);
                }}
                className="w-full py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md mt-2 flex items-center justify-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" />
                Generate ECR text file
              </button>
            </div>

          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ECR Text Preview (collapsible/visible if generated) */}
            {ecrGenerated && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-3 animate-fade-in">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">EPFO ECR File Preview ({reportMonth} {reportYear})</h3>
                  </div>
                  <button 
                    onClick={() => {
                      alert("Downloading ECR txt file...");
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors"
                  >
                    <Download className="h-3 w-3" /> Download ECR
                  </button>
                </div>
                <div className="bg-slate-950 text-slate-350 p-4 rounded-xl font-mono text-[10px] space-y-1 overflow-x-auto max-h-48 overflow-y-auto">
                  {employees.map((emp) => {
                    const uan = emp.uan || "100293049102";
                    const epfWages = Math.min(emp.basic, 15000);
                    const epsWages = Math.min(emp.basic, 15000);
                    const edliWages = Math.min(emp.basic, 15000);
                    const epfCont = Math.round(epfWages * 0.12);
                    const epsCont = Math.round(epsWages * 0.0833);
                    const diffCont = epfCont - epsCont;
                    return (
                      <div key={emp.id} className="whitespace-nowrap">
                        {uan}#{emp.name}#{epfWages}#{epsWages}#{edliWages}#{epfCont}#{epsCont}#{diffCont}#0#0
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 italic">Format: UAN#MemberName#EPFWages#EPSWages#EDLIWages#EPFCont#EPSCont#EmployerDiff#NCPDays#RefundOfAdvances</p>
              </div>
            )}

            {/* Payroll register list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Monthly Payroll Register & Statutory Deductions</h3>
                
                {/* Search / Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search Employee..." 
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 w-full sm:w-48 text-[11px]" 
                    />
                  </div>
                  <button 
                    onClick={() => alert("Exporting report as Excel...")}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border text-slate-700 dark:text-slate-350 rounded-lg font-bold"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[800px]">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-semibold border-b">
                    <tr>
                      <th className="p-3">UAN / Emp ID</th>
                      <th className="p-3">Employee Name</th>
                      <th className="p-3">Basic Salary</th>
                      <th className="p-3">EPF Wages</th>
                      <th className="p-3">EPS Wages</th>
                      <th className="p-3 text-right">EE PF (12%)</th>
                      <th className="p-3 text-right">ER EPS (8.33%)</th>
                      <th className="p-3 text-right">ER EPF Diff (3.67%)</th>
                      <th className="p-3 text-right">Gross Deductions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-650 dark:text-slate-350">
                    {employees
                      .filter(emp => emp.name.toLowerCase().includes(reportSearch.toLowerCase()))
                      .map((emp) => {
                        const epfWages = Math.min(emp.basic, 15000);
                        const epsWages = Math.min(emp.basic, 15000);
                        const epfCont = Math.round(epfWages * 0.12);
                        const epsCont = Math.round(epsWages * 0.0833);
                        const diffCont = epfCont - epsCont;
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                            <td className="p-3">
                              <p className="font-bold text-slate-800 dark:text-white">{emp.uan || "100293049102"}</p>
                              <span className="text-[9px] text-slate-400">{emp.id}</span>
                            </td>
                            <td className="p-3 font-semibold text-slate-700 dark:text-slate-200">{emp.name}</td>
                            <td className="p-3">₹{emp.basic.toLocaleString()}</td>
                            <td className="p-3">₹{epfWages.toLocaleString()}</td>
                            <td className="p-3">₹{epsWages.toLocaleString()}</td>
                            <td className="p-3 text-right font-semibold text-slate-800 dark:text-white">₹{epfCont.toLocaleString()}</td>
                            <td className="p-3 text-right">₹{epsCont.toLocaleString()}</td>
                            <td className="p-3 text-right">₹{diffCont.toLocaleString()}</td>
                            <td className="p-3 text-right font-bold text-red-500">₹{emp.deductions.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
