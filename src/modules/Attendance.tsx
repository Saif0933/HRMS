import {
  Camera,
  Check,
  Clock,
  FileText,
  X,
  Search,
  Filter,
  Download
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface RegularizationRequest {
  id: string;
  employeeName: string;
  date: string;
  timeIn: string;
  timeOut: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export const Attendance: React.FC = () => {
  const { employees, activeSubModule, setActiveSubModule, addAuditLog, userRole } = useApp();

  // GPS Punch State
  const [gpsCoordinates, setGpsCoordinates] = useState({ lat: 19.0760, lng: 72.8777 }); // Mumbai HQ
  const [distance, setDistance] = useState(12); // meters
  const [punchType, setPunchType] = useState<'In' | 'Out'>('In');
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [punchLog, setPunchLog] = useState<{ time: string; type: string; method: string }[]>([
    { time: "Yesterday, 09:34 AM", type: "In", method: "Biometric Portal" },
    { time: "Yesterday, 06:31 PM", type: "Out", method: "Biometric Portal" }
  ]);

  // Regularization requests
  const [regularizeRequests, setRegularizeRequests] = useState<RegularizationRequest[]>([
    { id: "REG091", employeeName: "Aarav Sharma", date: "2026-06-25", timeIn: "09:30 AM", timeOut: "06:30 PM", reason: "Forgot to punch due to client conference", status: "Pending" }
  ]);

  // New Regularization Request Form
  const [regDate, setRegDate] = useState('2026-07-01');
  const [regInTime, setRegInTime] = useState('09:30');
  const [regOutTime, setRegOutTime] = useState('18:30');
  const [regReason, setRegReason] = useState('Card not registered at turnstile');

  // Attendance Reports State
  const [reportMonth, setReportMonth] = useState('June');
  const [reportYear, setReportYear] = useState('2026');
  const [reportSearch, setReportSearch] = useState('');

  // Roster states
  const [rosterWeek, setRosterWeek] = useState('Week 27 (Jul 1 - Jul 5)');
  const [shifts, setShifts] = useState([
    { empId: "EMP001", name: "Aarav Sharma", Mon: "General", Tue: "General", Wed: "General", Thu: "General", Fri: "General", Sat: "Week Off", Sun: "Week Off" },
    { empId: "EMP002", name: "Neha Patel", Mon: "General", Tue: "General", Wed: "General", Thu: "General", Fri: "General", Sat: "Week Off", Sun: "Week Off" },
    { empId: "EMP003", name: "Rohan Das", Mon: "General", Tue: "General", Wed: "General", Thu: "General", Fri: "General", Sat: "Week Off", Sun: "Week Off" },
    { empId: "EMP008", name: "Ananya Roy", Mon: "General", Tue: "General", Wed: "General", Thu: "General", Fri: "General", Sat: "Week Off", Sun: "Week Off" }
  ]);

  // Attendance Calendar (Muster Roll) grid for July 2026
  const musterDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    // Mocking status
    let status: 'Present' | 'Late' | 'Absent' | 'Holiday' | 'WeekOff' = 'Present';
    if (dayNum % 7 === 4 || dayNum % 7 === 5) status = 'WeekOff';
    else if (dayNum === 10) status = 'Absent';
    else if (dayNum === 14) status = 'Late';
    else if (dayNum === 15) status = 'Holiday';

    return { dayNum, status };
  });

  const handlePunchSubmit = () => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", Today";
    setPunchLog(prev => [{ time: timeString, type: punchType, method: selfiePreview ? "GPS + Selfie" : "GPS Mobile" }, ...prev]);
    
    addAuditLog(
      `Attendance Punch ${punchType}`, 
      "Attendance Module", 
      `Self punch ${punchType} verified via GPS coordinates (Distance: ${distance}m) and liveliness face validation.`
    );

    alert(`Punch ${punchType} recorded successfully at ${timeString}!`);
    setSelfiePreview(null);
  };

  const handleApplyRegularization = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: RegularizationRequest = {
      id: `REG${Math.floor(Math.random() * 1000)}`,
      employeeName: userRole === 'Super Admin' ? 'Vikram Malhotra' : userRole === 'HR Admin' ? 'Karan Johar' : userRole === 'Manager' ? 'Neha Patel' : 'Aarav Sharma',
      date: regDate,
      timeIn: regInTime,
      timeOut: regOutTime,
      reason: regReason,
      status: 'Pending'
    };
    setRegularizeRequests(prev => [newReq, ...prev]);
    addAuditLog("Regularization Request", "Attendance Module", `Applied regularization for date ${regDate}`);
    alert("Regularization request submitted to manager.");
    setRegReason('');
  };

  const handleApproveReg = (id: string, name: string, date: string) => {
    setRegularizeRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    addAuditLog("Approved Regularization", "Attendance Module", `Approved regularization request for ${name} on ${date}`);
  };

  const handleRejectReg = (id: string, name: string, date: string) => {
    setRegularizeRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    addAuditLog("Rejected Regularization", "Attendance Module", `Rejected regularization request for ${name} on ${date}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveSubModule('punch')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'punch' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          GPS / Selfie Punch
        </button>
        <button 
          onClick={() => setActiveSubModule('roster')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'roster' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Shift & Roster Planning
        </button>
        <button 
          onClick={() => setActiveSubModule('regularize')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'regularize' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Regularization Requests
        </button>
        <button 
          onClick={() => setActiveSubModule('muster')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'muster' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Muster Roll Calendar
        </button>
        <button 
          onClick={() => setActiveSubModule('reports')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'reports' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Attendance Reports
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. GPS / SELFIE PUNCH SIMULATOR         */}
      {/* ======================================= */}
      {activeSubModule === 'punch' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          {/* Punch Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">GPS Mobile Punch Card</h3>
            
            <div className="flex bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border">
              <button 
                onClick={() => setPunchType('In')}
                className={`w-full py-2 rounded-lg font-bold transition-all ${
                  punchType === 'In' ? 'bg-primary text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                PUNCH IN
              </button>
              <button 
                onClick={() => setPunchType('Out')}
                className={`w-full py-2 rounded-lg font-bold transition-all ${
                  punchType === 'Out' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                PUNCH OUT
              </button>
            </div>

            {/* Selfie Verification */}
            <div className="space-y-2">
              <span className="text-slate-400 font-bold block">Biometric Liveliness Face Detection</span>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden h-40 flex flex-col justify-center items-center">
                {selfiePreview ? (
                  <>
                    <img src={selfiePreview} alt="Selfie Verification" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-green-400 font-bold bg-black/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Check className="h-4 w-4" />
                        Face Confirmed
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="h-8 w-8 text-slate-400 mb-2 animate-bounce" />
                    <button 
                      onClick={() => setSelfiePreview("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120")}
                      className="px-3 py-1.5 bg-primary text-white rounded-lg font-bold"
                    >
                      Capture Mock Selfie
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Geofence Status */}
            <div className="p-3.5 border rounded-xl space-y-2 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-400 uppercase text-[10px]">Geofence Fence Status</span>
                <span className="text-emerald-500 flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
                  MATCHED
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Office HQ Lat/Lng:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">{gpsCoordinates.lat}, {gpsCoordinates.lng}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimated Distance:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">{distance} meters away</span>
              </div>
            </div>

            <button 
              onClick={handlePunchSubmit}
              className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all ${
                punchType === 'In' ? 'bg-primary text-white shadow-primary/10' : 'bg-rose-500 text-white shadow-rose-500/10'
              }`}
            >
              Verify Punch & Sync
            </button>
          </div>

          {/* Punch History Logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Session Punch Register</h3>
            
            <div className="space-y-3.5">
              {punchLog.map((log, idx) => (
                <div key={idx} className="p-3 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      log.type === 'In' ? 'bg-green-150 text-green-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-850 dark:text-white">Punch {log.type === 'In' ? 'Check-In' : 'Check-Out'}</p>
                      <p className="text-[10px] text-slate-400">{log.method}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. SHIFT & ROSTER PLANNING              */}
      {/* ======================================= */}
      {activeSubModule === 'roster' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b pb-2.5">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Shift Planner & Team Roster</h3>
              <p className="text-slate-400 mt-0.5">Assign shifts to engineering and corporate resources weekly.</p>
            </div>
            <select 
              value={rosterWeek} 
              onChange={(e) => setRosterWeek(e.target.value)}
              className="px-3 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-none"
            >
              <option>Week 27 (Jul 1 - Jul 5)</option>
              <option>Week 28 (Jul 6 - Jul 12)</option>
            </select>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-semibold border-b uppercase text-[10px]">
                <tr>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3 text-center">Mon</th>
                  <th className="p-3 text-center">Tue</th>
                  <th className="p-3 text-center">Wed</th>
                  <th className="p-3 text-center">Thu</th>
                  <th className="p-3 text-center">Fri</th>
                  <th className="p-3 text-center">Sat</th>
                  <th className="p-3 text-center">Sun</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-650 dark:text-slate-350">
                {shifts.map((s) => (
                  <tr key={s.empId} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-800 dark:text-white">{s.name}</td>
                    <td className="p-3 text-center"><span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">{s.Mon}</span></td>
                    <td className="p-3 text-center"><span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">{s.Tue}</span></td>
                    <td className="p-3 text-center"><span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">{s.Wed}</span></td>
                    <td className="p-3 text-center"><span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">{s.Thu}</span></td>
                    <td className="p-3 text-center"><span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">{s.Fri}</span></td>
                    <td className="p-3 text-center text-slate-400 font-semibold">{s.Sat}</td>
                    <td className="p-3 text-center text-slate-400 font-semibold">{s.Sun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 3. ATTENDANCE REGULARIZATION            */}
      {/* ======================================= */}
      {activeSubModule === 'regularize' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          {/* Submit Request */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Apply Regularization</h3>
            
            <form onSubmit={handleApplyRegularization} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Select Missed Date</label>
                <input 
                  type="date" 
                  value={regDate} 
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Expected Time-In</label>
                  <input 
                    type="time" 
                    value={regInTime} 
                    onChange={(e) => setRegInTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Expected Time-Out</label>
                  <input 
                    type="time" 
                    value={regOutTime} 
                    onChange={(e) => setRegOutTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Reason for Regularization</label>
                <textarea 
                  value={regReason} 
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="Explain why punch was missed..." 
                  rows={3} 
                  required 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md"
              >
                Submit Regularization Request
              </button>
            </form>
          </div>

          {/* Pending / Historic Requests */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Regularization History Log</h3>
            
            <div className="space-y-3.5">
              {regularizeRequests.length === 0 ? (
                <p className="text-slate-400 text-center py-6">No regularization logs found.</p>
              ) : (
                regularizeRequests.map((req) => (
                  <div key={req.id} className="p-4 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950 gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-white">{req.employeeName}</span>
                        <span className="text-[10px] text-slate-400">{req.date}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Expected In: <span className="font-semibold text-slate-750 dark:text-slate-200">{req.timeIn}</span> • Out: <span className="font-semibold text-slate-750 dark:text-slate-200">{req.timeOut}</span>
                      </p>
                      <p className="text-slate-450 mt-0.5">Reason: "{req.reason}"</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {req.status === 'Pending' && (userRole === 'HR Admin' || userRole === 'Super Admin') ? (
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => handleApproveReg(req.id, req.employeeName, req.date)}
                            className="p-1 bg-green-500 text-white rounded-lg"
                            title="Approve"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleRejectReg(req.id, req.employeeName, req.date)}
                            className="p-1 bg-red-500 text-white rounded-lg"
                            title="Reject"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          req.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' :
                          req.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                          'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 4. MUSTER ROLL CALENDAR                 */}
      {/* ======================================= */}
      {activeSubModule === 'muster' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in text-xs">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2 flex items-center justify-between">
              <span>Muster Roll Grid - July 2026</span>
              <button 
                onClick={() => alert("Downloading Muster Roll sheet for this month...")}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                Muster Report
              </button>
            </h3>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mt-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(w => (
                <div key={w} className="text-center font-bold text-slate-400 py-1">{w}</div>
              ))}
              
              {/* Offset days (July 1, 2026 starts on Wednesday) */}
              <div className="py-2 border border-transparent"></div>
              <div className="py-2 border border-transparent"></div>

              {musterDays.map((d) => (
                <div 
                  key={d.dayNum} 
                  className={`border rounded-xl p-2.5 text-center flex flex-col justify-between h-14 cursor-pointer hover:border-primary transition-colors ${
                    d.status === 'Present' ? 'bg-green-50/50 dark:bg-green-950/10 border-green-100 dark:border-green-950/20' :
                    d.status === 'Late' ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-950/20' :
                    d.status === 'Absent' ? 'bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-950/20 animate-pulse' :
                    d.status === 'Holiday' ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-950/20' :
                    'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800'
                  }`}
                  onClick={() => {
                    if (d.status === 'Absent' || d.status === 'Late') {
                      setRegDate(`2026-07-${d.dayNum.toString().padStart(2, '0')}`);
                      setActiveSubModule('regularize');
                    } else {
                      alert(`Date selected: Jul ${d.dayNum}. Shift status: ${d.status}`);
                    }
                  }}
                >
                  <span className="font-bold text-slate-700 dark:text-slate-350">{d.dayNum}</span>
                  <span className={`text-[8px] font-bold block ${
                    d.status === 'Present' ? 'text-green-500' :
                    d.status === 'Late' ? 'text-amber-500' :
                    d.status === 'Absent' ? 'text-red-500' :
                    d.status === 'Holiday' ? 'text-blue-500' :
                    'text-slate-400'
                  }`}>
                    {d.status === 'Present' ? 'PRESENT' :
                     d.status === 'Late' ? 'LATE' :
                     d.status === 'Absent' ? 'ABSENT' :
                     d.status === 'Holiday' ? 'HOLIDAY' : 'OFF'}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4 items-center mt-4 pt-3 border-t justify-center text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500"></span>Present</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span>Late</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500"></span>Absent</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500"></span>Holiday</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400"></span>WeekOff</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 5. ATTENDANCE REPORTS                   */}
      {/* ======================================= */}
      {activeSubModule === 'reports' && (
        <div className="space-y-6 animate-fade-in text-xs">
          
          {/* Top Control Bar & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Filter controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs border-b pb-1.5 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-primary" />
                Select Month & Year
              </h4>
              <div className="flex gap-2">
                <select 
                  value={reportMonth} 
                  onChange={(e) => setReportMonth(e.target.value)}
                  className="w-1/2 px-2 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
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
                <select 
                  value={reportYear} 
                  onChange={(e) => setReportYear(e.target.value)}
                  className="w-1/2 px-2 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>

            {/* Average Attendance Stat */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Average Attendance Rate</span>
                <h3 className="text-xl font-extrabold text-emerald-500 mt-1">94.8%</h3>
              </div>
              <span className="text-[9px] text-slate-400 mt-2">Target benchmark: &gt;95.0%</span>
            </div>

            {/* Late Arrivals Stat */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Late Arrival Percentage</span>
                <h3 className="text-xl font-extrabold text-amber-500 mt-1">3.1%</h3>
              </div>
              <span className="text-[9px] text-slate-400 mt-2">Grace period allowed: 10 mins</span>
            </div>

            {/* Total Man-Hours worked */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Work Hours Tracked</span>
                <h3 className="text-xl font-extrabold text-primary mt-1">
                  {(employees.length * 22 * 8).toLocaleString()} Hrs
                </h3>
              </div>
              <span className="text-[9px] text-slate-400 mt-2">Based on 22 billing days</span>
            </div>

          </div>

          {/* Main Register Table Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Monthly Attendance Summary Register</h3>
                <p className="text-[10px] text-slate-400">Detailed breakdown of login averages, punctuality, and attendance rates.</p>
              </div>
              
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
                  onClick={() => alert("Exporting Attendance Summary to CSV...")}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border text-slate-700 dark:text-slate-300 rounded-lg font-bold"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Report</span>
                </button>
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-semibold border-b">
                  <tr>
                    <th className="p-3">Employee ID</th>
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-center">Present</th>
                    <th className="p-3 text-center">Late</th>
                    <th className="p-3 text-center">Absent</th>
                    <th className="p-3 text-center">Avg Login</th>
                    <th className="p-3 text-right">Total Hours</th>
                    <th className="p-3 text-center">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-650 dark:text-slate-350">
                  {employees
                    .filter(emp => emp.name.toLowerCase().includes(reportSearch.toLowerCase()))
                    .map((emp) => {
                      const presentDays = emp.id === 'EMP001' ? 21 : emp.id === 'EMP002' ? 22 : emp.id === 'EMP003' ? 18 : 20;
                      const lateDays = emp.id === 'EMP001' ? 1 : emp.id === 'EMP002' ? 0 : emp.id === 'EMP003' ? 3 : 2;
                      const absentDays = emp.id === 'EMP003' ? 4 : emp.id === 'EMP008' ? 1 : 0;
                      const totalHours = presentDays * 8.5;
                      const avgLogin = emp.id === 'EMP001' ? '09:12 AM' : emp.id === 'EMP002' ? '09:05 AM' : '09:28 AM';
                      const attendanceRate = Math.round((presentDays / 22) * 100);

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                          <td className="p-3 font-semibold text-slate-500">{emp.id}</td>
                          <td className="p-3 font-bold text-slate-800 dark:text-white">{emp.name}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{emp.department}</td>
                          <td className="p-3 text-center font-bold text-green-500">{presentDays}</td>
                          <td className="p-3 text-center font-bold text-amber-500">{lateDays}</td>
                          <td className="p-3 text-center font-bold text-red-500">{absentDays}</td>
                          <td className="p-3 text-center text-slate-600 dark:text-slate-350">{avgLogin}</td>
                          <td className="p-3 text-right font-semibold">
                            {totalHours.toFixed(1)} Hrs
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-16 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden shrink-0">
                                <div 
                                  className={`h-full rounded-full ${
                                    attendanceRate >= 95 ? 'bg-green-500' :
                                    attendanceRate >= 90 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${attendanceRate}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-[10px] w-8 text-right">{attendanceRate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
