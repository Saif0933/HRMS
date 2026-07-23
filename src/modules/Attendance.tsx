import {
  Camera,
  Check,
  Clock,
  Compass,
  Download,
  FileText,
  Filter,
  Lock,
  MapPin,
  Search,
  Users,
  X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import {
  useApplyRegularization,
  useCreateGeofence,
  useCreatePunch,
  useDeleteGeofence,
  useGeofences,
  usePunches,
  useRegularizations,
  useRosters,
  useSaveRosters,
  useUpdateRegularization
} from '../api/hook/useAttendance';
import { useEmployees } from '../api/hook/useEmployee';
import { useApp } from '../context/AppContext';

export const Attendance: React.FC = () => {
  const { activeSubModule, setActiveSubModule, addAuditLog, userRole } = useApp();

  // Simulated active employee switcher
  const [selectedEmpId, setSelectedEmpId] = useState('');

  // Fetch employees list
  const { data: dbEmployeesRes, isLoading: employeesLoading } = useEmployees();
  const employeesList = dbEmployeesRes?.data || [];

  // Automatically select first employee as current user
  useEffect(() => {
    if (employeesList.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employeesList[0].id);
    }
  }, [employeesList, selectedEmpId]);

  const activeEmployee = employeesList.find(emp => emp.id === selectedEmpId);

  // Queries & Mutations
  const { data: punchesRes, isLoading: punchesLoading } = usePunches(selectedEmpId);
  const punchLogList = punchesRes?.data || [];

  const { data: regularizeRes, isLoading: regsLoading } = useRegularizations();
  const regularizeRequests = regularizeRes?.data || [];

  const createPunchMut = useCreatePunch();
  const applyRegMut = useApplyRegularization();
  const updateRegMut = useUpdateRegularization();

  const { data: fencesRes, isLoading: fencesLoading } = useGeofences();
  const fencesList = fencesRes?.data || [];

  const createFenceMut = useCreateGeofence();
  const deleteFenceMut = useDeleteGeofence();

  // New Geofence Form State
  const [newFenceName, setNewFenceName] = useState('');
  const [newFenceLat, setNewFenceLat] = useState(23.357445);
  const [newFenceLng, setNewFenceLng] = useState(85.311484);
  const [newFenceRadius, setNewFenceRadius] = useState(100);


  // GPS Punch State
  const [gpsCoordinates, setGpsCoordinates] = useState({ lat: 23.357445, lng: 85.311484 });
  const [punchType, setPunchType] = useState<'In' | 'Out'>('In');
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // Find matching or closest fence
  let activeFenceMatch: { name: string; distance: number; radius: number; isInside: boolean } | null = null;
  if (fencesList.length > 0) {
    let closestFence: any = null;
    let minDistance = Infinity;
    for (const fence of fencesList) {
      if (!fence.isActive) continue;
      const d = localDistance(gpsCoordinates.lat, gpsCoordinates.lng, fence.lat, fence.lng);
      if (d < minDistance) {
        minDistance = d;
        closestFence = fence;
      }
    }
    if (closestFence) {
      activeFenceMatch = {
        name: closestFence.name,
        distance: Math.round(minDistance),
        radius: closestFence.radius,
        isInside: minDistance <= closestFence.radius
      };
    }
  }
  const mapRef = useRef<HTMLDivElement | null>(null);
  const punchMapRef = useRef<HTMLDivElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const checkGoogle = () => {
      if ((window as any).google) {
        setMapLoaded(true);
        return;
      }
      setTimeout(checkGoogle, 100);
    };

    if (!(window as any).google) {
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        checkGoogle();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDp1m24jCv0artNLvNYGiRemEEjwAduk20`;
        script.async = true;
        script.defer = true;
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);
      }
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Update Config Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !(window as any).google || activeSubModule !== 'geofence') return;

    const googleMaps = (window as any).google.maps;
    const mapCenter = { lat: newFenceLat, lng: newFenceLng };

    const map = new googleMaps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    // Marker for the new/selected geofence center
    const activeMarker = new googleMaps.Marker({
      position: mapCenter,
      map: map,
      title: newFenceName || "Selected Geofence Center",
      icon: {
        path: googleMaps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 6,
        strokeColor: "#6366f1",
        fillColor: "#6366f1",
        fillOpacity: 0.8
      }
    });

    // Draw active fence circle
    const activeCircle = new googleMaps.Circle({
      strokeColor: "#6366f1",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#6366f1",
      fillOpacity: 0.15,
      map: map,
      center: mapCenter,
      radius: newFenceRadius
    });

    // Add markers and circles for existing geofences
    fencesList.forEach((fence: any) => {
      const fenceCenter = { lat: fence.lat, lng: fence.lng };
      
      // Existing fence circle
      new googleMaps.Circle({
        strokeColor: fence.isActive ? "#10b981" : "#64748b",
        strokeOpacity: 0.6,
        strokeWeight: 1.5,
        fillColor: fence.isActive ? "#10b981" : "#64748b",
        fillOpacity: 0.1,
        map: map,
        center: fenceCenter,
        radius: fence.radius
      });

      // Existing fence marker
      new googleMaps.Marker({
        position: fenceCenter,
        map: map,
        title: fence.name
      });
    });

    // Click map to set coordinates and resolve Location Name
    map.addListener("click", (e: any) => {
      if (e.latLng) {
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();
        setNewFenceLat(parseFloat(clickedLat.toFixed(6)));
        setNewFenceLng(parseFloat(clickedLng.toFixed(6)));

        const geocoder = new googleMaps.Geocoder();
        geocoder.geocode({ location: { lat: clickedLat, lng: clickedLng } }, (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            setNewFenceName(results[0].formatted_address);
          }
        });
      }
    });

  }, [mapLoaded, newFenceLat, newFenceLng, newFenceRadius, fencesList, activeSubModule]);

  // Update Punch Simulation Map
  useEffect(() => {
    if (!mapLoaded || !punchMapRef.current || !(window as any).google || activeSubModule !== 'punch') return;

    const googleMaps = (window as any).google.maps;
    const mapCenter = { lat: gpsCoordinates.lat, lng: gpsCoordinates.lng };

    const map = new googleMaps.Map(punchMapRef.current, {
      center: mapCenter,
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    // Marker for User simulated position
    new googleMaps.Marker({
      position: mapCenter,
      map: map,
      title: "Your Simulated Coordinates",
      icon: {
        path: googleMaps.SymbolPath.CIRCLE,
        scale: 8,
        strokeColor: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.9
      }
    });

    // Add circles for existing geofences
    fencesList.forEach((fence: any) => {
      const fenceCenter = { lat: fence.lat, lng: fence.lng };
      
      new googleMaps.Circle({
        strokeColor: fence.isActive ? "#10b981" : "#64748b",
        strokeOpacity: 0.5,
        strokeWeight: 1.5,
        fillColor: fence.isActive ? "#10b981" : "#64748b",
        fillOpacity: 0.08,
        map: map,
        center: fenceCenter,
        radius: fence.radius
      });
    });

    // Click map to simulate movement
    map.addListener("click", (e: any) => {
      if (e.latLng) {
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();
        setGpsCoordinates({
          lat: parseFloat(clickedLat.toFixed(6)),
          lng: parseFloat(clickedLng.toFixed(6))
        });
      }
    });

  }, [mapLoaded, gpsCoordinates, fencesList, activeSubModule]);

  const handleAutoDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(6));
          const lng = parseFloat(position.coords.longitude.toFixed(6));
          setGpsCoordinates({ lat, lng });
          setNewFenceLat(lat);
          setNewFenceLng(lng);

          // Reverse geocode to resolve Location Name
          if ((window as any).google) {
            const geocoder = new (window as any).google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              if (status === "OK" && results[0]) {
                setNewFenceName(results[0].formatted_address);
              }
            });
          }
        },
        (error) => {
          alert(`Failed to get location permission: ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation API is not supported in this browser.");
    }
  };

  // Automatic Location & Name Fetching on Load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(6));
          const lng = parseFloat(position.coords.longitude.toFixed(6));
          setGpsCoordinates({ lat, lng });
          setNewFenceLat(lat);
          setNewFenceLng(lng);

          const autoResolve = () => {
            if ((window as any).google) {
              const geocoder = new (window as any).google.maps.Geocoder();
              geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                if (status === "OK" && results[0]) {
                  setNewFenceName(results[0].formatted_address);
                }
              });
            } else {
              setTimeout(autoResolve, 500);
            }
          };
          autoResolve();
        },
        (err) => {
          console.log("Automated location fetch failed:", err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [mapLoaded]);




  // Camera & Selfie Stream States using react-webcam
  const webcamRef = useRef<Webcam | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState<'selfie' | 'password'>('selfie');
  const [isVerifyingLock, setIsVerifyingLock] = useState(false);

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setSelfiePreview(imageSrc);
      }
      setIsCameraActive(false);
    }
  };

  // New Regularization Request Form
  const [regDate, setRegDate] = useState('2026-07-01');
  const [regInTime, setRegInTime] = useState('09:30');
  const [regOutTime, setRegOutTime] = useState('18:30');
  const [regReason, setRegReason] = useState('Card not registered at turnstile');

  // Attendance Reports State
  const [reportMonth, setReportMonth] = useState('June');
  const [reportYear, setReportYear] = useState('2026');
  const [reportSearch, setReportSearch] = useState('');

  // Dynamic Roster Shift States & Backend API Hooks
  const [rosterWeek, setRosterWeek] = useState('Week 27 (Jul 1 - Jul 5)');
  const [rosterSearch, setRosterSearch] = useState('');
  const [employeeShifts, setEmployeeShifts] = useState<Record<string, Record<string, string>>>({});

  const { data: dbRostersRes, isLoading: rostersLoading } = useRosters(rosterWeek);
  const saveRostersMut = useSaveRosters();

  // Populate shift data from backend DB when fetched, or fallback to live employee defaults
  useEffect(() => {
    if (dbRostersRes?.data && dbRostersRes.data.length > 0) {
      const loaded: Record<string, Record<string, string>> = {};
      dbRostersRes.data.forEach(item => {
        loaded[item.employeeId] = {
          Mon: item.mon,
          Tue: item.tue,
          Wed: item.wed,
          Thu: item.thu,
          Fri: item.fri,
          Sat: item.sat,
          Sun: item.sun,
        };
      });
      setEmployeeShifts(loaded);
    } else if (employeesList.length > 0) {
      setEmployeeShifts(prev => {
        const updated = { ...prev };
        employeesList.forEach((emp, index) => {
          if (!updated[emp.id]) {
            updated[emp.id] = {
              Mon: 'General',
              Tue: 'General',
              Wed: 'General',
              Thu: 'General',
              Fri: 'General',
              Sat: index % 2 === 0 ? 'Week Off' : 'Morning',
              Sun: 'Week Off'
            };
          }
        });
        return updated;
      });
    }
  }, [dbRostersRes, employeesList]);

  const handleShiftChange = (empId: string, day: string, shiftVal: string) => {
    setEmployeeShifts(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || { Mon: 'General', Tue: 'General', Wed: 'General', Thu: 'General', Fri: 'General', Sat: 'Week Off', Sun: 'Week Off' }),
        [day]: shiftVal
      }
    }));
  };

  const handleSaveRoster = () => {
    const payloadRosters = Object.entries(employeeShifts).map(([empId, days]) => ({
      employeeId: empId,
      mon: days.Mon || 'General',
      tue: days.Tue || 'General',
      wed: days.Wed || 'General',
      thu: days.Thu || 'General',
      fri: days.Fri || 'General',
      sat: days.Sat || 'Week Off',
      sun: days.Sun || 'Week Off',
    }));

    saveRostersMut.mutate({
      week: rosterWeek,
      rosters: payloadRosters,
    }, {
      onSuccess: () => {
        addAuditLog("Published Shift Roster", "Attendance Module", `Published weekly roster shifts for ${payloadRosters.length} employees for ${rosterWeek}.`);
        alert(`Weekly Roster Plan for ${rosterWeek} has been successfully saved to DB and published!`);
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || err.message || "Failed to save roster to backend");
      }
    });
  };

  // Attendance Calendar (Muster Roll) grid for July 2026
  const musterDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    let status: 'Present' | 'Late' | 'Absent' | 'Holiday' | 'WeekOff' = 'Present';
    if (dayNum % 7 === 4 || dayNum % 7 === 5) status = 'WeekOff';
    else if (dayNum === 10) status = 'Absent';
    else if (dayNum === 14) status = 'Late';
    else if (dayNum === 15) status = 'Holiday';

    return { dayNum, status };
  });

  const verifyWithScreenLock = async (): Promise<boolean> => {
    try {
      if (!window.PublicKeyCredential) {
        alert("WebAuthn is not supported on this browser.");
        return false;
      }
      
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        alert("Desktop Lock Screen verification (Windows Hello) is not available or enabled on this device.");
        return false;
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Symbosys HRMS Portal" },
          user: {
            id: userId,
            name: "employee",
            displayName: "Employee"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000
        }
      });

      return !!credential;
    } catch (err: any) {
      console.error("Lock screen verification failed:", err);
      alert("Verification failed: " + (err.message || "User cancelled lock screen prompt."));
      return false;
    }
  };

  const executePunch = () => {
    if (!selectedEmpId) return;
    const methodStr = verifyMethod === 'selfie' ? "GPS + Selfie" : "GPS + Password";

    createPunchMut.mutate({
      employeeId: selectedEmpId,
      type: punchType,
      method: methodStr,
      lat: gpsCoordinates.lat,
      lng: gpsCoordinates.lng,
      selfiePreview: verifyMethod === 'selfie' ? selfiePreview : null
    }, {
      onSuccess: () => {
        addAuditLog(
          `Attendance Punch ${punchType}`, 
          "Attendance Module", 
          `Self punch ${punchType} verified via GPS coordinates (Distance: ${activeFenceMatch?.distance || 0}m) and ${verifyMethod === 'selfie' ? 'liveliness face validation' : 'password authentication'}.`
        );
        alert(`Punch ${punchType} recorded successfully!`);
        setIsCameraActive(false);
        setSelfiePreview(null);
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || err.message || "Failed to record punch");
      }
    });
  };

  const handlePunchSubmit = async () => {
    if (verifyMethod === 'selfie' && !selfiePreview) {
      alert('Please capture a selfie before verifying punch.');
      return;
    }
    
    if (verifyMethod === 'password') {
      setIsVerifyingLock(true);
      const isVerified = await verifyWithScreenLock();
      setIsVerifyingLock(false);
      
      if (isVerified) {
        executePunch();
      }
    } else {
      executePunch();
    }
  };

  const handleApplyRegularization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    applyRegMut.mutate({
      employeeId: selectedEmpId,
      date: regDate,
      timeIn: regInTime,
      timeOut: regOutTime,
      reason: regReason,
    }, {
      onSuccess: () => {
        addAuditLog("Regularization Request", "Attendance Module", `Applied regularization for date ${regDate}`);
        alert("Regularization request submitted successfully.");
        setRegReason('');
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || err.message || "Failed to apply regularization");
      }
    });
  };

  const handleApproveReg = (id: string, name: string, date: string) => {
    updateRegMut.mutate({ id, status: 'Approved' }, {
      onSuccess: () => {
        addAuditLog("Approved Regularization", "Attendance Module", `Approved regularization request for ${name} on ${date}`);
        alert("Request approved.");
      }
    });
  };

  const handleRejectReg = (id: string, name: string, date: string) => {
    updateRegMut.mutate({ id, status: 'Rejected' }, {
      onSuccess: () => {
        addAuditLog("Rejected Regularization", "Attendance Module", `Rejected regularization request for ${name} on ${date}`);
        alert("Request rejected.");
      }
    });
  };

  const handleAddGeofence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFenceName) {
      alert("Please enter a geofence name");
      return;
    }
    createFenceMut.mutate({
      name: newFenceName,
      lat: newFenceLat,
      lng: newFenceLng,
      radius: newFenceRadius,
    }, {
      onSuccess: () => {
        alert("Geofence location registered successfully!");
        setNewFenceName('');
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || err.message || "Failed to create geofence");
      }
    });
  };

  const handleDeleteGeofence = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete geofence "${name}"?`)) return;
    deleteFenceMut.mutate(id, {
      onSuccess: () => {
        alert("Geofence deleted successfully");
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
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
        <button 
          onClick={() => setActiveSubModule('geofence')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'geofence' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Geofencing Config
        </button>
      </div>

      {/* Global Simulated User Switcher */}
      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-100 dark:bg-rose-950/40 text-rose-600 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Simulate as Employee</h4>
            <p className="text-slate-450 mt-0.5">Switch profiles to change who punches check-in/out logs or files regularization requests.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="px-3.5 py-2 border rounded-xl bg-white dark:bg-slate-900 text-slate-750 dark:text-slate-300 font-semibold focus:outline-none"
          >
            {employeesLoading ? (
              <option>Loading employees...</option>
            ) : (
              employeesList.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.designation || 'Staff'})
                </option>
              ))
            )}
          </select>

          {activeEmployee && (
            <span className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-355 rounded-xl font-bold uppercase text-[10px]">
              {activeEmployee.department?.name || 'Operations'}
            </span>
          )}
        </div>
      </div>

      {/* ======================================= */}
      {/* 1. GPS / SELFIE PUNCH SIMULATOR         */}
      {/* ======================================= */}
      {activeSubModule === 'punch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-xs">
          
          {/* Left panel (col-span-5): Punch settings, verification & submit */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Main Action card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2 flex items-center justify-between">
                <span>GPS Mobile Punch Card</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold uppercase">
                  Simulated Device
                </span>
              </h3>

              {/* Punch Toggle */}
              <div className="flex bg-slate-50 dark:bg-slate-955 rounded-xl overflow-hidden p-1 border border-slate-150 dark:border-slate-800">
                <button 
                  onClick={() => setPunchType('In')}
                  className={`w-full py-2 rounded-lg font-bold text-xs transition-all ${
                    punchType === 'In' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  PUNCH IN
                </button>
                <button 
                  onClick={() => setPunchType('Out')}
                  className={`w-full py-2 rounded-lg font-bold text-xs transition-all ${
                    punchType === 'Out' 
                      ? 'bg-rose-500 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  PUNCH OUT
                </button>
              </div>

              {/* Verification Section */}
              <div className="space-y-3">
                <label className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Verification Method</label>
                <div className="flex bg-slate-100 dark:bg-slate-955 rounded-lg p-0.5 border border-slate-150 dark:border-slate-800 text-[10px]">
                  <button 
                    type="button"
                    onClick={() => setVerifyMethod('selfie')}
                    className={`w-1/2 py-1.5 rounded font-bold transition-all ${
                      verifyMethod === 'selfie' 
                        ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-white' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    Selfie Camera
                  </button>
                  <button 
                    type="button"
                    onClick={() => setVerifyMethod('password')}
                    className={`w-1/2 py-1.5 rounded font-bold transition-all ${
                      verifyMethod === 'password' 
                        ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-white' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    Password Auth
                  </button>
                </div>

                {verifyMethod === 'selfie' ? (
                  <div className="border border-slate-250 dark:border-slate-850 rounded-xl p-4 text-center bg-slate-50 dark:bg-slate-955/40 relative overflow-hidden h-44 flex flex-col justify-center items-center">
                    {selfiePreview ? (
                      <>
                        <img src={selfiePreview} alt="Selfie Verification" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-green-400 font-bold bg-black/60 px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-500/35">
                            <Check className="h-4 w-4 animate-bounce" />
                            Face Confirmed
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelfiePreview(null);
                            setIsCameraActive(false);
                          }}
                          className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/95 transition-all z-10"
                          type="button"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : isCameraActive ? (
                      <>
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ transform: 'scaleX(-1)' }}
                          videoConstraints={{
                            facingMode: "user"
                          }}
                        />
                        <div className="absolute bottom-2 inset-x-0 flex justify-center z-10">
                          <button 
                            onClick={capturePhoto}
                            className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold shadow-md text-[10px]"
                            type="button"
                          >
                            Capture Photo
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-slate-400 mb-2" />
                        <button 
                          onClick={() => setIsCameraActive(true)}
                          className="px-3.5 py-1.5 bg-primary text-white rounded-lg font-bold hover:scale-105 transition-all text-[10px]"
                          type="button"
                        >
                          Capture Mock Selfie
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-950 relative h-44 flex flex-col justify-center items-center text-center space-y-3">
                    <div className="p-2.5 bg-primary/10 rounded-full text-primary">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-850 dark:text-white block text-xs">Verify Desktop Screen Lock</span>
                      <span className="text-[10px] text-slate-400 block max-w-[220px] mt-1">Requires your OS lock screen PIN or password authentication to verify GPS punch.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* GPS Simulator Coordinates */}
              <div className="p-3 border rounded-xl space-y-2.5 bg-slate-50/50 dark:bg-slate-950/50">
                <span className="font-bold text-[10px] text-slate-400 uppercase block tracking-wider">Simulated Phone GPS Locator</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={gpsCoordinates.lat}
                      onChange={(e) => setGpsCoordinates({ ...gpsCoordinates, lat: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 text-[11px] border rounded bg-white dark:bg-slate-900 text-slate-750 dark:text-slate-350"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={gpsCoordinates.lng}
                      onChange={(e) => setGpsCoordinates({ ...gpsCoordinates, lng: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 text-[11px] border rounded bg-white dark:bg-slate-900 text-slate-750 dark:text-slate-350"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoDetectLocation}
                  className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-lg border text-[10px] flex items-center justify-center gap-1.5 transition-all"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Auto-Detect Current GPS</span>
                </button>
              </div>

              {/* Geofence Status */}
              <div className="p-3.5 border rounded-xl space-y-2 bg-slate-50 dark:bg-slate-955/40">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-400 uppercase text-[10px] tracking-wider">Geofence Status</span>
                  {fencesLoading ? (
                    <span className="text-slate-400">LOADING FENCES...</span>
                  ) : activeFenceMatch ? (
                    activeFenceMatch.isInside ? (
                      <span className="text-emerald-500 flex items-center gap-1.5">
                        <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
                        MATCHED
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1.5">
                        OUT OF RANGE
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400">NO FENCES FOUND</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 space-y-1 mt-1">
                  {activeFenceMatch ? (
                    activeFenceMatch.isInside ? (
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        You are inside "{activeFenceMatch.name}" ({activeFenceMatch.distance}m away; limit: {activeFenceMatch.radius}m).
                      </p>
                    ) : (
                      <p className="text-rose-500 font-semibold">
                        You are outside "{activeFenceMatch.name}" ({activeFenceMatch.distance}m away; limit: {activeFenceMatch.radius}m).
                      </p>
                    )
                  ) : (
                    <p className="text-slate-450 italic">No active geofence locations exist. Please configure one in the Geofencing Config tab.</p>
                  )}
                </div>
              </div>

              <button 
                onClick={handlePunchSubmit}
                disabled={isVerifyingLock || createPunchMut.isPending}
                className={`w-full py-3 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-all ${
                  isVerifyingLock ? 'bg-slate-400 cursor-not-allowed text-white shadow-none' :
                  punchType === 'In' ? 'bg-primary text-white shadow-primary/20' : 'bg-rose-500 text-white shadow-rose-500/20'
                }`}
              >
                {isVerifyingLock ? 'Verifying Lock Screen...' : createPunchMut.isPending ? 'Syncing...' : 'Verify Punch & Sync'}
              </button>
            </div>

          </div>

          {/* Right panel (col-span-7): Large Map and History list */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Google Map Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Real-time Location Verification</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Displays geofence regions. Click on the map to manually override and verify GPS.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>Your Position</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span>Office Geofences</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoDetectLocation}
                    className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Compass className="h-3.5 w-3.5 text-white" />
                    <span>Fetch Current Location</span>
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner relative h-[400px] bg-slate-100 dark:bg-slate-955">
                <div ref={punchMapRef} className="w-full h-full" />
                
                {/* Floating Map Controls */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg font-bold text-[9px] flex items-center gap-1 select-none pointer-events-none border border-white/5 z-10">
                  <MapPin className="h-3.5 w-3.5 text-blue-400 animate-bounce" />
                  <span>Click map to set simulated location</span>
                </div>

                <button
                  type="button"
                  onClick={handleAutoDetectLocation}
                  className="absolute top-3 right-3 z-10 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-extrabold text-xs rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Fetch your exact current GPS coordinates"
                >
                  <Compass className="h-4 w-4 text-primary" />
                  <span>Fetch Current Location</span>
                </button>
              </div>
            </div>

            {/* Session Logs Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2 flex items-center justify-between">
                <span>Session Punch Register</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                  Punch History ({punchLogList.length})
                </span>
              </h3>
              
              {punchesLoading ? (
                <div className="py-8 text-center text-slate-400 font-medium">Loading session logs...</div>
              ) : punchLogList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-medium italic">No check-in or out punches recorded yet.</div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  {punchLogList.map((log) => (
                    <div key={log.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-900/30 gap-4 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          log.type === 'In' 
                            ? 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400' 
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">Punch {log.type === 'In' ? 'Check-In' : 'Check-Out'}</p>
                          <p className="text-[10px] text-slate-450 mt-0.5" title={`${log.method} • GPS: ${log.lat}, ${log.lng}`}>
                            {log.method} • {log.lat}, {log.lng}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold text-xs shrink-0 ${log.time.startsWith('Today') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>{log.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ======================================= */}
      {/* 2. SHIFT & ROSTER PLANNING              */}
      {/* ======================================= */}
      {activeSubModule === 'roster' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in text-xs">
          
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <span>Shift Planner & Team Roster</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {employeesList.length} Active Staff
                </span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Assign custom shifts to employees weekly with real-time audit trail syncing.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Employee Filter */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search staff..." 
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border rounded-xl focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 text-xs w-40 md:w-48" 
                />
              </div>

              {/* Week Selector */}
              <select 
                value={rosterWeek} 
                onChange={(e) => setRosterWeek(e.target.value)}
                className="px-3 py-1.5 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300 font-bold focus:outline-none text-xs"
              >
                <option value="Week 27 (Jul 1 - Jul 5)">Week 27 (Jul 1 - Jul 5)</option>
                <option value="Week 28 (Jul 6 - Jul 12)">Week 28 (Jul 6 - Jul 12)</option>
                <option value="Week 29 (Jul 13 - Jul 19)">Week 29 (Jul 13 - Jul 19)</option>
                <option value="Week 30 (Jul 20 - Jul 26)">Week 30 (Jul 20 - Jul 26)</option>
              </select>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveRoster}
                disabled={saveRostersMut.isPending}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="h-4 w-4 text-white" />
                <span>{saveRostersMut.isPending ? 'Saving to DB...' : 'Save & Publish Roster'}</span>
              </button>
            </div>
          </div>

          {/* Shift Timing Legend */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50/70 dark:bg-slate-955/50 rounded-xl border border-slate-150 dark:border-slate-800 text-[11px]">
            <span className="font-bold text-slate-500 uppercase text-[9px]">Shift Timings:</span>
            <span className="px-2 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50">General (09:30 - 18:30)</span>
            <span className="px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50">Morning (08:00 - 17:00)</span>
            <span className="px-2 py-0.5 rounded-md font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50">Evening (14:00 - 23:00)</span>
            <span className="px-2 py-0.5 rounded-md font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/50">Night (22:00 - 07:00)</span>
            <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50">Week Off</span>
          </div>

          {/* Dynamic Employee Roster Table */}
          <div className="border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto shadow-inner">
            <table className="w-full text-xs text-left min-w-[850px]">
              <thead className="bg-slate-50 dark:bg-slate-955 text-slate-400 font-bold border-b uppercase text-[10px]">
                <tr>
                  <th className="p-3 min-w-[200px]">Employee Profile</th>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <th key={day} className="p-3 text-center min-w-[105px]">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y text-slate-650 dark:text-slate-350">
                {employeesLoading || rostersLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                      Loading roster staff database...
                    </td>
                  </tr>
                ) : employeesList.filter(e => e.name.toLowerCase().includes(rosterSearch.toLowerCase()) || e.id.toLowerCase().includes(rosterSearch.toLowerCase())).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold italic">
                      No matching staff found for "{rosterSearch}".
                    </td>
                  </tr>
                ) : (
                  employeesList
                    .filter(e => e.name.toLowerCase().includes(rosterSearch.toLowerCase()) || e.id.toLowerCase().includes(rosterSearch.toLowerCase()))
                    .map((emp) => {
                      const shiftsForEmp = employeeShifts[emp.id] || {
                        Mon: 'General', Tue: 'General', Wed: 'General', Thu: 'General', Fri: 'General', Sat: 'Week Off', Sun: 'Week Off'
                      };

                      const getShiftStyle = (val: string) => {
                        switch (val) {
                          case 'Morning': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200';
                          case 'Evening': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200';
                          case 'Night': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200';
                          case 'Week Off': return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
                          default: return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200';
                        }
                      };

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/60 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs shrink-0">
                                {emp.name?.charAt(0) || 'E'}
                              </div>
                              <div className="truncate">
                                <span className="font-extrabold text-slate-800 dark:text-white block truncate">{emp.name}</span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {emp.id} • {emp.designation || 'Staff'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                            const val = shiftsForEmp[day] || 'General';
                            return (
                              <td key={day} className="p-2 text-center">
                                <select
                                  value={val}
                                  onChange={(e) => handleShiftChange(emp.id, day, e.target.value)}
                                  className={`w-full text-[11px] font-extrabold px-2 py-1 rounded-lg border focus:outline-none text-center cursor-pointer transition-all ${getShiftStyle(val)}`}
                                >
                                  <option value="General">General</option>
                                  <option value="Morning">Morning</option>
                                  <option value="Evening">Evening</option>
                                  <option value="Night">Night</option>
                                  <option value="Week Off">Week Off</option>
                                </select>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                )}
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
                disabled={applyRegMut.isPending}
                className="w-full py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md disabled:opacity-50"
              >
                {applyRegMut.isPending ? "Submitting..." : "Submit Regularization Request"}
              </button>
            </form>
          </div>

          {/* Pending / Historic Requests */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Regularization History Log</h3>
            
            {regsLoading ? (
              <div className="py-8 text-center text-slate-400 font-medium">Loading history logs...</div>
            ) : regularizeRequests.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No regularization logs found.</p>
            ) : (
              <div className="space-y-3.5">
                {regularizeRequests.map((req) => (
                  <div key={req.id} className="p-4 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-955/40 gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-white">{req.employeeName}</span>
                        <span className="text-[10px] text-slate-450">{req.date}</span>
                      </div>
                      <p className="text-slate-550 dark:text-slate-450 mt-1">
                        Expected In: <span className="font-semibold text-slate-750 dark:text-slate-200">{req.timeIn}</span> • Out: <span className="font-semibold text-slate-750 dark:text-slate-200">{req.timeOut}</span>
                      </p>
                      <p className="text-slate-450 mt-0.5">Reason: "{req.reason}"</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {req.status === 'Pending' && (userRole === 'HR Admin' || userRole === 'Super Admin') ? (
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => handleApproveReg(req.id, req.employeeName, req.date)}
                            disabled={updateRegMut.isPending}
                            className="p-1 bg-green-500 text-white rounded-lg hover:scale-105 disabled:opacity-50"
                            title="Approve"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleRejectReg(req.id, req.employeeName, req.date)}
                            disabled={updateRegMut.isPending}
                            className="p-1 bg-red-500 text-white rounded-lg hover:scale-105 disabled:opacity-50"
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
                ))}
              </div>
            )}
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
            
            <div className="flex gap-4 items-center mt-4 pt-3 border-t justify-center text-[10px] text-slate-455">
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
                  {(employeesList.length * 22 * 8).toLocaleString()} Hrs
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
                  {employeesList
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
                          <td className="p-3 text-slate-600 dark:text-slate-300">{emp.department?.name || 'Operations'}</td>
                          <td className="p-3 text-center font-bold text-green-500">{presentDays}</td>
                          <td className="p-3 text-center font-bold text-amber-500">{lateDays}</td>
                          <td className="p-3 text-center font-bold text-red-500">{absentDays}</td>
                          <td className="p-3 text-center text-slate-600 dark:text-slate-355">{avgLogin}</td>
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
      {/* ======================================= */}
      {/* 6. GEOFENCING CONFIGURATION             */}
      {/* ======================================= */}
      {activeSubModule === 'geofence' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-xs">
          
          {/* Left panel: Form and List (stacked) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2 flex items-center justify-between">
                <span>Add Office Geofence</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold uppercase">
                  Setup Perimeter
                </span>
              </h3>
              
              <form onSubmit={handleAddGeofence} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Location name</label>
                  <input 
                    type="text" 
                    value={newFenceName} 
                    onChange={(e) => setNewFenceName(e.target.value)}
                    placeholder="e.g. Ranchi Branch Office"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-350 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Latitude</label>
                    <input 
                      type="number" 
                      step="0.000001"
                      value={newFenceLat} 
                      onChange={(e) => setNewFenceLat(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-350"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Longitude</label>
                    <input 
                      type="number" 
                      step="0.000001"
                      value={newFenceLng} 
                      onChange={(e) => setNewFenceLng(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-350"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Perimeter Radius (in meters)</label>
                  <input 
                    type="number" 
                    value={newFenceRadius} 
                    onChange={(e) => setNewFenceRadius(parseInt(e.target.value) || 0)}
                    min="5"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-350"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAutoDetectLocation}
                    className="w-1/2 py-2 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>Auto GPS</span>
                  </button>
                  <button 
                    type="submit" 
                    disabled={createFenceMut.isPending}
                    className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold hover:scale-105 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5 text-white" />
                    <span>{createFenceMut.isPending ? "Locking..." : "Add & Lock Boundary"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2 flex items-center justify-between">
                <span>Active Geofenced Areas</span>
                <span className="text-[10px] text-slate-400 font-medium">Total: {fencesList.length}</span>
              </h3>
              
              {fencesLoading ? (
                <p className="text-slate-400 text-center py-4">Loading boundaries...</p>
              ) : fencesList.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No geofenced boundaries registered.</p>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  {fencesList.map((fence) => {
                    const distanceToFence = Math.round(localDistance(gpsCoordinates.lat, gpsCoordinates.lng, fence.lat, fence.lng));
                    const isSimInside = distanceToFence <= fence.radius;

                    return (
                      <div 
                        key={fence.id} 
                        onClick={() => {
                          setNewFenceName(fence.name);
                          setNewFenceLat(fence.lat);
                          setNewFenceLng(fence.lng);
                          setNewFenceRadius(fence.radius);
                        }}
                        className="p-3 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-955/30 gap-4 text-xs hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer group"
                        title="Click to auto-fill location details into form"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-white truncate max-w-[120px]" title={fence.name}>
                              {fence.name}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                              fence.isActive ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {fence.radius}m
                            </span>
                          </div>
                          <p className="text-[10px] font-medium text-slate-500">
                            Dist: <span className={isSimInside ? "text-emerald-500 font-bold" : "text-rose-500"}>{distanceToFence}m ({isSimInside ? "Inside" : "Outside"})</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGeofence(fence.id, fence.name);
                            }}
                            disabled={deleteFenceMut.isPending}
                            className="p-1.5 bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400 rounded-lg hover:scale-110 transition-all"
                            title="Delete Geofence"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Huge Map (col-span-7) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Geofencing Radar Monitor</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Click anywhere on the map to automatically position and grab coordinates.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500"></span>Selected</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span>Active Fences</span>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner relative flex-1 h-[750px] bg-slate-100 dark:bg-slate-950">
              <div ref={mapRef} className="w-full h-full" />
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl font-semibold text-[10px] flex items-center gap-1.5 select-none pointer-events-none border border-white/10 shadow-lg">
                <MapPin className="h-3.5 w-3.5 text-indigo-400 animate-bounce" />
                <span>Selected: {newFenceLat.toFixed(6)}, {newFenceLng.toFixed(6)}</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

const localDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

