import React, { useState, useRef, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  Printer, 
  Upload, 
  UserCheck, 
  ShieldCheck, 
  QrCode, 
  Building, 
  Sparkles, 
  Phone, 
  MapPin, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useEmployees } from '../api/hook/useEmployee';

type CardTheme = 'navy' | 'dark' | 'emerald' | 'burgundy';

interface IdCardData {
  fullName: string;
  employeeId: string;
  designation: string;
  department: string;
  joiningDate: string;
  validUntil: string;
  bloodGroup: string;
  emergencyContact: string;
  companyName: string;
  officeLocation: string;
  photoUrl: string;
}

export const IdCardGenerator: React.FC = () => {
  const { currentUser, employees: contextEmployees } = useApp();
  const { data: dbEmployeesRes } = useEmployees();

  const getDeptName = (dept: any): string => {
    if (!dept) return '';
    if (typeof dept === 'object' && dept !== null && 'name' in dept) {
      return dept.name;
    }
    return String(dept);
  };

  // Combine backend employees and context employees dynamically
  const dbEmployees = dbEmployeesRes?.data || [];
  const allEmployees = dbEmployees.length > 0 
    ? dbEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.role || emp.designation || 'Employee',
        designation: emp.designation || emp.role || 'Employee',
        department: getDeptName(emp.department) || 'General',
        joiningDate: emp.joiningDate || '',
        bloodGroup: emp.bloodGroup || 'O+',
        phone: emp.phone || '',
        location: emp.location || '',
        avatar: emp.avatar || ''
      }))
    : contextEmployees;

  // Find logged-in user or active employee details
  const activeEmp = currentUser || allEmployees[0];

  const [cardData, setCardData] = useState<IdCardData>(() => ({
    fullName: activeEmp?.name || '',
    employeeId: activeEmp?.id || '',
    designation: activeEmp?.designation || activeEmp?.role || '',
    department: getDeptName(activeEmp?.department),
    joiningDate: activeEmp?.joiningDate || '',
    validUntil: '2028-12-31',
    bloodGroup: activeEmp?.bloodGroup || 'O+',
    emergencyContact: activeEmp?.phone || '',
    companyName: 'Symbosys Technologies',
    officeLocation: activeEmp?.location || '',
    photoUrl: activeEmp?.avatar || '',
  }));

  // Update cardData dynamically when activeEmp changes
  useEffect(() => {
    if (activeEmp) {
      loadEmployeeData(activeEmp);
    }
  }, [activeEmp]);

  const [activeTheme, setActiveTheme] = useState<CardTheme>('navy');
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [viewMode, setViewMode] = useState<'single' | 'both'>('single');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData((prev) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const autofillProfile = () => {
    if (activeEmp) {
      loadEmployeeData(activeEmp);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    }
  };

  const loadEmployeeData = (emp: typeof allEmployees[0]) => {
    setCardData((prev) => ({
      ...prev,
      fullName: emp.name || '',
      employeeId: emp.id || '',
      designation: emp.designation || emp.role || '',
      department: getDeptName(emp.department),
      joiningDate: emp.joiningDate || '',
      bloodGroup: emp.bloodGroup || 'O+',
      emergencyContact: emp.phone || '',
      officeLocation: emp.location || '',
      photoUrl: emp.avatar || '',
    }));
  };

  const handleSelectEmployee = (employeeId: string) => {
    const selectedEmp = allEmployees.find((e) => e.id === employeeId);
    if (selectedEmp) {
      loadEmployeeData(selectedEmp);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderCardToCanvas = async (side: 'front' | 'back') => {
    const cardEl = side === 'front' ? frontCardRef.current : backCardRef.current;
    if (!cardEl) return;

    const width = 340;
    const height = 530;
    const scale = 2;

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);

    const htmlString = cardEl.outerHTML;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <style>
              ${Array.from(document.styleSheets)
                .map(sheet => {
                  try {
                    return Array.from(sheet.cssRules).map(r => r.cssText).join('');
                  } catch (e) {
                    return '';
                  }
                })
                .join('')}
            </style>
            ${htmlString}
          </div>
        </foreignObject>
      </svg>
    `;

    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const imgUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${cardData.fullName.replace(/\s+/g, '_')}_IDCard_${side.toUpperCase()}.png`;
      link.href = imgUri;
      link.click();
    };
    img.src = url;
  };

  const themeStyles = {
    navy: {
      bg: 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900',
      headerBg: 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900',
      accent: 'border-blue-500 text-blue-400',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      chip: 'bg-amber-400',
      border: 'border-indigo-500/40',
      shadow: 'shadow-indigo-900/30',
      tagline: 'text-indigo-200'
    },
    dark: {
      bg: 'bg-gradient-to-b from-slate-950 via-slate-900 to-black',
      headerBg: 'bg-gradient-to-r from-purple-700 via-pink-600 to-cyan-600',
      accent: 'border-pink-500 text-pink-400',
      badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      chip: 'bg-cyan-400',
      border: 'border-purple-500/40',
      shadow: 'shadow-purple-900/40',
      tagline: 'text-purple-200'
    },
    emerald: {
      bg: 'bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-900',
      headerBg: 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900',
      accent: 'border-emerald-500 text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      chip: 'bg-amber-400',
      border: 'border-emerald-500/40',
      shadow: 'shadow-emerald-900/30',
      tagline: 'text-emerald-200'
    },
    burgundy: {
      bg: 'bg-gradient-to-b from-rose-950 via-red-950 to-slate-950',
      headerBg: 'bg-gradient-to-r from-rose-800 via-red-800 to-amber-900',
      accent: 'border-rose-500 text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      chip: 'bg-amber-300',
      border: 'border-rose-500/40',
      shadow: 'shadow-rose-900/40',
      tagline: 'text-rose-200'
    }
  };

  const currentTheme = themeStyles[activeTheme] || themeStyles.navy;

  const renderFrontCard = (cardRef?: React.RefObject<HTMLDivElement> | React.Ref<HTMLDivElement>) => (
    <div
      ref={cardRef}
      id="id-card-front"
      className={`w-[320px] h-[500px] rounded-2xl ${currentTheme.bg} ${currentTheme.shadow} shadow-2xl border ${currentTheme.border} text-white flex flex-col justify-between overflow-hidden relative select-none transform transition-transform duration-300 hover:scale-[1.01]`}
    >
      <div className="absolute top-12 right-4 opacity-10 pointer-events-none">
        <ShieldCheck className="w-32 h-32 text-white" />
      </div>

      <div className={`${currentTheme.headerBg} p-4 text-center relative overflow-hidden shadow-md`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-center gap-2 mb-1">
          <Building className="w-5 h-5 text-amber-300" />
          <span className="font-extrabold text-sm tracking-wider uppercase">
            {cardData.companyName}
          </span>
        </div>
        <p className={`text-[10px] tracking-widest uppercase font-medium ${currentTheme.tagline}`}>
          Official Identity Card
        </p>
      </div>

      <div className="p-5 flex flex-col items-center text-center space-y-3 flex-1 justify-center relative z-10">
        <div className="relative">
          <div className={`w-28 h-28 rounded-2xl p-1 bg-gradient-to-tr from-white/20 via-white/60 to-white/20 shadow-xl border-2 ${currentTheme.accent}`}>
            <img
              src={cardData.photoUrl}
              alt={cardData.fullName}
              className="w-full h-full rounded-xl object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-slate-900 shadow-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1">
            {cardData.fullName}
          </h3>
          <p className={`text-xs font-semibold mt-0.5 px-3 py-1 rounded-full inline-block border ${currentTheme.badge}`}>
            {cardData.designation}
          </p>
        </div>

        <div className="w-full grid grid-cols-2 gap-2 text-left bg-white/5 p-3 rounded-xl border border-white/10 text-[11px] backdrop-blur-md">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Emp ID</span>
            <span className="font-mono font-bold text-amber-300">{cardData.employeeId}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Department</span>
            <span className="font-medium text-white truncate block">{cardData.department}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Blood Group</span>
            <span className="font-bold text-rose-400">{cardData.bloodGroup}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Valid Till</span>
            <span className="font-medium text-emerald-300">{cardData.validUntil}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/80 p-3 border-t border-white/10 flex items-center justify-between">
        <div className={`w-8 h-6 rounded-md ${currentTheme.chip} opacity-90 border border-amber-200 flex items-center justify-center`}>
          <div className="w-4 h-3 border border-amber-800/40 rounded-xs" />
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-0.5 h-6">
            {[4, 2, 6, 1, 5, 3, 7, 2, 4, 6, 1, 3, 5, 2, 6].map((w, i) => (
              <div key={i} className="bg-white h-full" style={{ width: `${w}px` }} />
            ))}
          </div>
          <span className="text-[8px] font-mono text-slate-400 tracking-widest mt-0.5">
            {cardData.employeeId}
          </span>
        </div>

        <QrCode className="w-7 h-7 text-white/80" />
      </div>
    </div>
  );

  const renderBackCard = (cardRef?: React.RefObject<HTMLDivElement> | React.Ref<HTMLDivElement>) => (
    <div
      ref={cardRef}
      id="id-card-back"
      className={`w-[320px] h-[500px] rounded-2xl ${currentTheme.bg} ${currentTheme.shadow} shadow-2xl border ${currentTheme.border} text-white flex flex-col justify-between overflow-hidden relative select-none transform transition-transform duration-300 hover:scale-[1.01]`}
    >
      <div className="w-full h-12 bg-black my-4 border-y border-white/10 flex items-center justify-end px-4">
        <span className="text-[9px] font-mono text-slate-600 tracking-widest uppercase">
          MAGNETIC STRIPE SECURITY ACCESS
        </span>
      </div>

      <div className="p-5 space-y-4 flex-1 text-xs">
        <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
          <p className="text-[10px] text-slate-300 leading-relaxed">
            This card is the property of <strong className="text-white">{cardData.companyName}</strong>. If found, please return immediately to the address below.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] text-slate-400 block uppercase font-semibold">Head Office</span>
              <p className="text-[11px] text-slate-200">{cardData.officeLocation}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] text-slate-400 block uppercase font-semibold">Emergency Contact</span>
              <p className="text-[11px] font-mono text-emerald-300 font-semibold">{cardData.emergencyContact}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] text-slate-400 block uppercase font-semibold">Date of Issue</span>
              <p className="text-[11px] text-slate-200">{cardData.joiningDate}</p>
            </div>
          </div>
        </div>

        <div className="text-[9px] text-slate-400 space-y-1 pt-1 border-t border-white/10">
          <p>• Unauthorized use or duplication of this card is strictly prohibited.</p>
          <p>• Must be worn visibly at all times within office premises.</p>
        </div>
      </div>

      <div className="bg-slate-950/80 p-4 border-t border-white/10 flex items-end justify-between">
        <div>
          <span className="text-[8px] font-mono text-slate-400 uppercase block">Card Serial</span>
          <span className="text-[10px] font-mono text-amber-400 font-bold">SYM-ID-998241</span>
        </div>

        <div className="text-right">
          <div className="font-serif italic text-indigo-300 text-sm tracking-wider font-semibold border-b border-indigo-400/40 pb-0.5 px-2">
            R. K. Sharma
          </div>
          <span className="text-[8px] text-slate-400 block uppercase mt-0.5">
            Authorized Signatory
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Print-only CSS & container */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-id-cards, #printable-id-cards * {
            visibility: visible !important;
          }
          #printable-id-cards {
            display: flex !important;
            flex-direction: row !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 32px !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 40px 20px !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: auto;
            margin: 10mm;
          }
        }
      `}</style>

      {/* Hidden Print Container rendering Front & Back */}
      <div id="printable-id-cards" className="hidden">
        {renderFrontCard()}
        {renderBackCard()}
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Employee ID Card Generator
                <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Instant Preview
                </span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                Fill in details to customize, view front & back side, and export printable high-res ID cards.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={autofillProfile}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all shadow-sm"
          >
            {copiedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Profile Details Loaded!</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Auto-fill My Details</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-medium rounded-xl transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print ID Card</span>
          </button>

          <button
            onClick={() => renderCardToCanvas(activeSide)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG ({activeSide.toUpperCase()})</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card Theme Picker */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Select ID Card Theme</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['navy', 'dark', 'emerald', 'burgundy'] as CardTheme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setActiveTheme(theme)}
                  className={`p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                    activeTheme === theme
                      ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`h-8 rounded-lg mb-2 ${
                      theme === 'navy'
                        ? 'bg-gradient-to-r from-blue-900 to-indigo-900'
                        : theme === 'dark'
                        ? 'bg-gradient-to-r from-slate-900 via-purple-950 to-pink-950'
                        : theme === 'emerald'
                        ? 'bg-gradient-to-r from-emerald-900 to-teal-900'
                        : 'bg-gradient-to-r from-rose-950 to-amber-950'
                    }`}
                  />
                  <div className="text-xs font-semibold capitalize text-slate-700 dark:text-slate-200">
                    {theme}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                <span>Employee & Card Information</span>
              </h2>
            </div>

            {/* Employee Selector Dropdown */}
            <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 mb-2">
              <label className="block text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                <span>Select Employee to Generate ID Card</span>
              </label>
              <select
                value={cardData.employeeId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-indigo-200 dark:border-indigo-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
              >
                {allEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id}) — {emp.designation || emp.role} [{emp.department}]
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={cardData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Rashi Sharma"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Employee ID / Code
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={cardData.employeeId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. EMP-2026-089"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Job Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={cardData.designation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={cardData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. IT & Engineering"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Date of Joining
                </label>
                <input
                  type="date"
                  name="joiningDate"
                  value={cardData.joiningDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  name="validUntil"
                  value={cardData.validUntil}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={cardData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={cardData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={cardData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Office Location
                </label>
                <input
                  type="text"
                  name="officeLocation"
                  value={cardData.officeLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Employee Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={cardData.photoUrl}
                  alt="Preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                />
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <span>Live Card Preview</span>
              </h2>

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setViewMode('single');
                    setActiveSide('front');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    viewMode === 'single' && activeSide === 'front'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => {
                    setViewMode('single');
                    setActiveSide('back');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    viewMode === 'single' && activeSide === 'back'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Back
                </button>
                <button
                  onClick={() => setViewMode('both')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    viewMode === 'both'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Both Sides
                </button>
              </div>
            </div>

            <div className={`flex flex-wrap items-center justify-center gap-8 py-4 ${viewMode === 'both' ? 'w-full' : ''}`}>
              {/* FRONT CARD */}
              {(viewMode === 'both' || activeSide === 'front') && renderFrontCard(frontCardRef)}

              {/* BACK CARD */}
              {(viewMode === 'both' || activeSide === 'back') && renderBackCard(backCardRef)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdCardGenerator;
