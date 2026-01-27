import React, { useState } from 'react';
import { 
  FaCloudUploadAlt, FaUserClock, FaClock, 
  FaCheckCircle, FaSpinner, FaArrowLeft, FaQuestionCircle, FaHospital, 
  FaPills, FaBell, FaCheck, FaSave, FaPrescriptionBottle, FaTrash, FaPlus, FaPen, FaFilePrescription, FaInfoCircle, FaMagic, FaFilePdf, FaImage 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Prescription = () => {
  const navigate = useNavigate();
  
  // --- CORE STATES ---
  const [step, setStep] = useState(1); 
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [choice, setChoice] = useState('standard');
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [analysisData, setAnalysisData] = useState(null);
  const [alarms, setAlarms] = useState({});

  // --- MULTI-PRESCRIPTION & CABINET STATE ---
  const [savedRx, setSavedRx] = useState([]); 
  const [activeRxId, setActiveRxId] = useState(null);

  // --- UI STATES (Renaming, Toasts, Loading) ---
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState("");
  const [toast, setToast] = useState(null); 
  const [loadingMsg, setLoadingMsg] = useState("Initializing AI...");

  // --- UTILITY HANDLERS ---

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => { setToast(null); }, 3000); 
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // ---------------------------------------------------------
  // THE REAL BACKEND CONNECTION (The Only Major Change)
  // ---------------------------------------------------------
  const startAnalysis = async () => {
    if (!file) return;

    setStep(2); // Show Loading Screen
    setLoadingMsg("Connecting to MediSense Brain...");

    const formData = new FormData();
    formData.append("file", file);

    try {
        // 1. Send Image to Python Backend
        const response = await fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.statusText}`);
        }

        setLoadingMsg("Deciphering Doctor's Handwriting...");
        const data = await response.json();
        
        // 2. Load Real Data from AI
        setAnalysisData(data);
        setActiveRxId(data.id || Date.now()); 
        setStep(3); // Move to "Choice" Screen

    } catch (error) {
        console.error("Analysis Error:", error);
        alert("Connection Failed! Make sure 'python backend-ai/main.py' is running in the terminal.");
        setStep(1); // Go back to upload if failed
    }
  };

  // ---------------------------------------------------------
  // UI LOGIC: TIME CALCULATIONS (Smart Body Clock)
  // ---------------------------------------------------------
  
  const addHours = (time, hoursToAdd) => {
    if (!time) return "00:00";
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return time;

    const date = new Date();
    date.setHours(h + hoursToAdd);
    date.setMinutes(m);
    
    let newH = date.getHours();
    let newM = date.getMinutes();
    const ampm = newH >= 12 ? 'PM' : 'AM';
    newH = newH % 12; newH = newH ? newH : 12; 
    return `${newH}:${newM.toString().padStart(2, '0')} ${ampm}`;
  };

  const calculateCustomTime = (medName, standardTime) => {
    if (!medName || !standardTime) return standardTime;
    const lower = standardTime.toLowerCase();

    // AI Logic for Smart Scheduling
    if (lower.includes("morning") || lower.includes("breakfast")) return addHours(wakeTime, 1) + " (After Breakfast)";
    if (lower.includes("night") || lower.includes("bed") || lower.includes("sleep")) return addHours(sleepTime, 0) + " (Before Sleep)";
    if (lower.includes("lunch") || lower.includes("afternoon")) return addHours(wakeTime, 6) + " (After Lunch)";
    if (lower.includes("twice") || lower.includes("bid")) return `${addHours(wakeTime, 1)}, ${addHours(sleepTime, 0)}`;
    if (lower.includes("three") || lower.includes("tid")) return `${addHours(wakeTime, 1)}, ${addHours(wakeTime, 7)}, ${addHours(sleepTime, 0)}`;
    
    return standardTime; 
  };

  // ---------------------------------------------------------
  // UI LOGIC: SAVING & CABINET MANAGEMENT
  // ---------------------------------------------------------

  const createSaveObject = (currentName) => ({
    id: activeRxId,
    name: currentName || `Prescription #${savedRx.length + 1}`,
    preview: preview,
    data: analysisData,
    choice: choice,
    alarms: alarms
  });

  const handleSaveOnly = () => {
    if (!analysisData) return;
    setSavedRx(prev => {
        const exists = prev.find(item => item.id === activeRxId);
        if (exists) {
            return prev.map(item => item.id === activeRxId ? { ...item, choice, alarms } : item);
        }
        return [...prev, createSaveObject()];
    });
    showToast("Prescription Saved to Cabinet!");
  };

  const handleSaveAndNew = () => {
    if (analysisData) {
        setSavedRx(prev => {
            const exists = prev.find(item => item.id === activeRxId);
            if (exists) return prev.map(item => item.id === activeRxId ? { ...item, choice, alarms } : item);
            return [...prev, createSaveObject()];
        });
        showToast("Saved! Ready for next scan.");
    }
    // Reset Everything
    setFile(null);
    setPreview(null);
    setAnalysisData(null);
    setChoice('standard');
    setAlarms({});
    setStep(1);
    setActiveRxId(null);
  };

  const loadSavedRx = (rx) => {
    setPreview(rx.preview);
    setAnalysisData(rx.data);
    setChoice(rx.choice || 'standard');
    setAlarms(rx.alarms || {});
    setActiveRxId(rx.id);
    setStep(3); 
  };

  const deleteRx = (id, e) => {
    e.stopPropagation();
    setSavedRx(prev => prev.filter(item => item.id !== id));
    if (activeRxId === id) handleSaveAndNew();
  };

  // --- RENAMING LOGIC ---
  const startRenaming = (rx, e) => {
    e.stopPropagation(); 
    setEditingId(rx.id);
    setTempName(rx.name);
  };

  const saveRename = (id) => {
    if (tempName.trim()) {
        setSavedRx(prev => prev.map(item => item.id === id ? { ...item, name: tempName } : item));
    }
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
  };

  // --- ALARM LOGIC ---
  const getSchedulableMeds = () => {
    if (!analysisData || !analysisData.medicines) return [];
    return analysisData.medicines.filter(med => {
        const time = choice === 'custom' ? calculateCustomTime(med.name, med.standard) : med.standard;
        return time && !time.toLowerCase().includes("as needed");
    });
  };

  const toggleMasterAlarm = () => {
    const schedulable = getSchedulableMeds();
    const allActive = schedulable.length > 0 && schedulable.every(med => alarms[med.name]);
    
    const newAlarms = {};
    if (allActive) {
        setAlarms({}); 
        showToast("All reminders turned off.");
    } else {
        schedulable.forEach(med => { newAlarms[med.name] = true; });
        setAlarms(newAlarms); 
        showToast("All reminders set successfully!");
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }
  };

  const toggleIndividualAlarm = (medName) => {
    setAlarms(prev => {
        const newAlarms = { ...prev };
        if (newAlarms[medName]) delete newAlarms[medName];
        else newAlarms[medName] = true;
        return newAlarms;
    });
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
  };


  // ---------------------------------------------------------
  // MAIN RENDER FUNCTION
  // ---------------------------------------------------------
  const renderContent = () => {
    switch(step) {
        case 1: 
            return (
                <div className="max-w-4xl mx-auto text-center animate-fade-in-up h-full flex flex-col justify-center relative z-10">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                    <div className="mb-8 inline-flex p-5 rounded-[2rem] bg-white shadow-lg shadow-cyan-100 border border-cyan-50 mx-auto">
                        <FaMagic className="text-5xl text-cyan-500" />
                    </div>
                    
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 mb-4 tracking-tight">
                        Upload Prescription
                    </h2>
                    <p className="text-slate-400 mb-12 text-xl font-medium max-w-2xl mx-auto">
                        Our AI Decipher engine instantly turns your doctor's messy handwriting into a clear, actionable schedule.
                    </p>
                    
                    <div className="relative group w-full max-w-2xl mx-auto">
                        <div className={`
                            border-[5px] border-dashed rounded-[3rem] p-16 transition-all duration-500 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]
                            ${file 
                                ? 'border-cyan-500 bg-white shadow-2xl shadow-cyan-500/10' 
                                : 'border-slate-200 bg-white/60 hover:border-cyan-400 hover:bg-white hover:shadow-xl hover:shadow-cyan-500/5'
                            }
                        `}>
                            <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                            
                            {preview ? (
                                <div className="relative z-10 w-full h-full flex flex-col items-center">
                                    <div className="relative group-hover:scale-[1.02] transition-transform duration-500">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-25"></div>
                                        <img src={preview} className="h-64 rounded-xl object-contain relative shadow-lg" alt="Rx Preview" />
                                    </div>
                                    <div className="mt-8 flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2 rounded-full font-bold text-sm border border-green-100">
                                        <FaCheckCircle /> Image Loaded Successfully
                                    </div>
                                </div>
                            ) : (
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-cyan-50 transition-all duration-300">
                                        <FaCloudUploadAlt className="text-6xl text-slate-300 group-hover:text-cyan-500 transition-colors" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-700 mb-3 group-hover:text-cyan-700 transition-colors">
                                        Drag & Drop or Click
                                    </h3>
                                    <div className="flex gap-4 text-slate-400 text-sm font-semibold mt-2">
                                        <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-md"><FaFilePdf /> PDF</span>
                                        <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-md"><FaImage /> JPG</span>
                                        <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-md"><FaImage /> PNG</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={startAnalysis} 
                        disabled={!file} 
                        className={`
                            mt-12 px-16 py-6 rounded-full font-black text-xl shadow-xl transition-all transform hover:-translate-y-1 mx-auto flex items-center gap-3
                            ${file 
                                ? 'bg-gradient-to-r from-slate-900 to-cyan-900 text-white shadow-cyan-900/20 hover:shadow-cyan-900/40' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }
                        `}
                    >
                        {file ? <><FaMagic /> Decipher Prescription</> : "Analyze Prescription"}
                    </button>
                </div>
            );
        case 2:
            return (
                <div className="flex flex-col items-center justify-center h-full animate-pulse">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full"></div>
                        <FaSpinner className="text-7xl text-cyan-600 animate-spin relative z-10" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-800 mt-8 mb-2">{loadingMsg}</h3>
                    <p className="text-slate-500 text-lg">Using OCR & Medical AI to process your image.</p>
                </div>
            );
        case 3:
            return (
                <div className="max-w-6xl mx-auto animate-fade-in-up h-full flex flex-col justify-center">
                    <div className="text-center mb-10">
                        <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm">Analysis Complete</span>
                        <h2 className="text-4xl font-extrabold text-slate-900 mt-6">How should we organize this?</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 px-2">
                        {/* Option 1 */}
                        <button onClick={() => { setChoice('purpose'); setStep(4); }} className="group bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 hover:border-blue-200 hover:shadow-blue-500/10 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 h-72 justify-center relative overflow-hidden">
                            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-300 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors group-hover:scale-110">
                                <FaQuestionCircle className="text-4xl text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Medicine Info</h3>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-[80%]">Understand what each medicine is for and its side effects.</p>
                        </button>

                        {/* Option 2 */}
                        <button onClick={() => { setChoice('standard'); setStep(4); }} className="group bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 hover:border-orange-200 hover:shadow-orange-500/10 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 h-72 justify-center relative overflow-hidden">
                             <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-orange-300 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-100 transition-colors group-hover:scale-110">
                                <FaClock className="text-4xl text-orange-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Standard Schedule</h3>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-[80%]">View the exact timings as written in the doctor's note.</p>
                        </button>

                        {/* Option 3 (Premium) */}
                        <button onClick={() => { setChoice('custom'); setStep(4); }} className="group bg-gradient-to-b from-white to-cyan-50 p-8 rounded-[2rem] shadow-xl border-2 border-cyan-100 hover:border-cyan-400 hover:shadow-cyan-500/20 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 h-72 justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10">RECOMMENDED</div>
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <FaUserClock className="text-4xl text-cyan-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Smart Body Clock</h3>
                            <p className="text-slate-600 text-sm leading-relaxed max-w-[80%]">Adjusts the schedule based on your sleep & wake cycle.</p>
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
                        <button onClick={handleSaveOnly} className="flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-full font-bold border-2 border-slate-200 hover:border-cyan-500 hover:text-cyan-600 transition-colors min-w-[200px]">
                            <FaSave /> Save Progress
                        </button>
                        <button onClick={handleSaveAndNew} className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all hover:-translate-y-0.5 min-w-[200px]">
                            <FaPlus /> Save & Scan New
                        </button>
                    </div>
                </div>
            );
        case 4:
            if (!analysisData) { setStep(1); return null; }

            const schedulable = getSchedulableMeds();
            const allActive = schedulable.length > 0 && schedulable.every(med => alarms[med.name]);
            const isInfoMode = choice === 'purpose';

            return (
                <div className="max-w-5xl mx-auto animate-fade-in-up pt-4">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                        <button onClick={() => setStep(3)} className="group flex items-center gap-3 text-slate-500 hover:text-cyan-700 font-bold transition-colors">
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-cyan-400">
                                <FaArrowLeft className="text-sm" />
                            </div>
                            Back to Modes
                        </button>
                        <div className="text-right hidden md:block">
                            <h2 className="text-xl font-bold text-slate-800">{savedRx.find(r => r.id === activeRxId)?.name || "Current Analysis"}</h2>
                            <p className="text-sm text-slate-400">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    {/* BODY CLOCK SETTINGS CARD */}
                    {choice === 'custom' && (
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2rem] shadow-xl shadow-slate-900/10 mb-10 flex flex-col md:flex-row gap-8 items-center justify-between text-white relative overflow-hidden">
                            {/* Decorative background circle */}
                            <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                            
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                                    <FaUserClock className="text-3xl text-cyan-300" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-2xl mb-1">Your Routine</h4>
                                    <p className="text-slate-400 text-sm">Timings adapted to your lifestyle.</p>
                                </div>
                            </div>
                            <div className="flex gap-6 w-full md:w-auto relative z-10">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Wake Up</label>
                                    <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Sleep</label>
                                    <input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MASTER SWITCH - HIDDEN IN INFO MODE */}
                    {!isInfoMode && (
                        <div className="flex items-center justify-between mb-8 bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 p-3 rounded-xl text-green-600"><FaBell className="text-lg" /></div>
                                <div>
                                    <h4 className="font-bold text-slate-700 text-lg">Smart Reminders</h4>
                                    <p className="text-slate-400 text-xs">Enable all alarms for this prescription</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleMasterAlarm}
                                className={`w-14 h-8 rounded-full p-1 transition-all duration-300 shadow-inner flex items-center ${allActive ? 'bg-green-500' : 'bg-slate-200'}`}
                            >
                                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${allActive ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    )}

                    {/* --- PREMIUM RESULTS GRID --- */}
                    <div className="grid grid-cols-1 gap-6 mb-16">
                        {analysisData.medicines.map((med, idx) => {
                            const timeDisplay = choice === 'custom' ? calculateCustomTime(med.name, med.standard) : med.standard;
                            const isAlarmSet = alarms[med.name];

                            return (
                                <div 
                                    key={idx} 
                                    className="group relative overflow-hidden bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300"
                                >
                                    {/* Subtle Colored Accent on Left */}
                                    <div className={`absolute top-0 bottom-0 left-0 w-2 ${isInfoMode ? 'bg-blue-500' : 'bg-cyan-500'}`}></div>

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pl-4">
                                        
                                        {/* Left: Icon & Name */}
                                        <div className="flex items-start gap-6">
                                            <div className={`p-5 rounded-2xl ${isInfoMode ? 'bg-blue-50 text-blue-600' : 'bg-cyan-50 text-cyan-600'} group-hover:scale-110 transition-transform`}>
                                                {isInfoMode ? <FaInfoCircle className="text-2xl" /> : <FaPills className="text-2xl" />}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{med.name}</h3>
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wide border border-slate-200">
                                                    {med.type}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Right: Info or Time */}
                                        <div className="w-full md:w-auto text-left md:text-right pl-20 md:pl-0">
                                            {choice === 'purpose' ? (
                                                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl max-w-lg">
                                                    <p className="text-blue-900 font-medium leading-relaxed flex gap-2 items-start">
                                                        <FaCheckCircle className="text-blue-400 mt-1 shrink-0" />
                                                        {med.purpose}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-start md:items-end gap-3">
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                                            {choice === 'custom' ? "Recommended Time" : "Prescribed Schedule"}
                                                        </span>
                                                        <span className={`text-2xl font-bold ${choice === 'custom' ? 'text-cyan-600' : 'text-slate-800'}`}>
                                                            {timeDisplay}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* ALARM TOGGLE - HIDDEN IN INFO MODE */}
                                                    {!isInfoMode && timeDisplay && !timeDisplay.toLowerCase().includes("as needed") && (
                                                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                                            <span className={`text-xs font-bold ${isAlarmSet ? 'text-green-600' : 'text-slate-400'}`}>{isAlarmSet ? "Alarm Active" : "Alarm Off"}</span>
                                                            <button onClick={() => toggleIndividualAlarm(med.name)} className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 flex items-center ${isAlarmSet ? 'bg-green-500' : 'bg-slate-300'}`}>
                                                                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${isAlarmSet ? 'translate-x-4' : 'translate-x-0'}`} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans flex flex-col md:flex-row relative">
      
      {/* --- PREMIUM TOAST NOTIFICATION --- */}
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-down">
            <div className="bg-slate-900/90 backdrop-blur-md text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 font-bold border border-white/10">
                <div className="bg-green-500 rounded-full p-1"><FaCheck size={10} /></div>
                {toast}
            </div>
        </div>
      )}

      {/* --- SIDEBAR CABINET (Improved UI) --- */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col h-auto md:h-screen sticky top-0 z-40 overflow-y-auto shadow-sm">
        <div className="flex items-center gap-2 mb-10 text-slate-900 px-2">
            <div className="bg-cyan-100 p-2 rounded-lg"><FaHospital className="text-xl text-cyan-600" /></div>
            <h1 className="text-xl font-bold tracking-tight">Medi<span className="text-cyan-500">Sense</span></h1>
        </div>

        <div className="mb-8">
            <button onClick={handleSaveAndNew} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:-translate-y-0.5">
                <FaCloudUploadAlt /> Scan New Rx
            </button>
        </div>

        <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Your Cabinet</h3>
            {savedRx.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                    <FaPrescriptionBottle className="text-4xl text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 italic">No saved prescriptions yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {savedRx.map((rx) => (
                        <div 
                            key={rx.id} 
                            onClick={() => loadSavedRx(rx)}
                            className={`
                                p-4 rounded-2xl cursor-pointer border transition-all relative group
                                ${activeRxId === rx.id 
                                    ? 'bg-cyan-50 border-cyan-200 shadow-sm' 
                                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${activeRxId === rx.id ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <FaPrescriptionBottle />
                                </div>
                                
                                {/* EDIT VS VIEW MODE */}
                                {editingId === rx.id ? (
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            value={tempName} 
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setTempName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if(e.key === 'Enter') saveRename(rx.id);
                                                if(e.key === 'Escape') cancelRename();
                                            }}
                                            className="w-full bg-white text-slate-900 text-sm font-bold px-2 py-1 rounded-lg outline-none border-2 border-cyan-400 shadow-sm"
                                            autoFocus
                                            placeholder="Name..."
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1 px-2">Press Enter to save</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-bold text-sm truncate ${activeRxId === rx.id ? 'text-cyan-900' : 'text-slate-700'}`}>{rx.name}</h4>
                                        <p className="text-xs text-slate-400">{rx.data.timestamp}</p>
                                    </div>
                                )}
                            </div>

                            {/* HOVER ACTIONS */}
                            {editingId !== rx.id && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-100">
                                    <button onClick={(e) => startRenaming(rx, e)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-cyan-600 transition-colors">
                                        <FaPen size={10} />
                                    </button>
                                    <button onClick={(e) => deleteRx(rx.id, e)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                        <FaTrash size={10} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 bg-slate-50 p-6 md:p-12 overflow-y-auto h-screen scroll-smooth">
          {renderContent()}
      </div>

    </div>
  );
};

export default Prescription;