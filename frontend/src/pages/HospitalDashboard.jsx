import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  FaHospital, FaSearch, FaPaperPlane, FaPhoneAlt, 
  FaTint, FaSpinner, FaHistory, FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaThumbsUp, FaUserMd 
} from 'react-icons/fa';

// Fix Leaflet Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

const HospitalDashboard = () => {
  // --- STATE ---
  const [formData, setFormData] = useState({ patientName: '', bloodGroup: '', urgency: 'Critical' });
  const [nearbyDonors, setNearbyDonors] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  
  const hospitalName = localStorage.getItem('userName') || "City Hospital";
  const hospitalLoc = { lat: 28.6139, lng: 77.2090 };

  // --- FILTERS: Split Requests into Pending (Right) and Accepted (Center) ---
  // This is the magic logic that moves cards between columns automatically
  const pendingRequests = myRequests.filter(req => req.status === 'Pending');
  const acceptedRequests = myRequests.filter(req => req.status === 'Fulfilled');

  // --- 1. POLL FOR UPDATES ---
  useEffect(() => {
    fetchMyRequests(); 
    const interval = setInterval(fetchMyRequests, 2000); 
    return () => clearInterval(interval);
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/blood/hospital-requests/${hospitalName}`);
      if (res.data.success) {
        setMyRequests(res.data.requests);
      }
    } catch (err) { console.error("Fetch Error:", err); }
  };

  // --- 2. ACTIONS ---
  const handleSearchDonors = async () => {
    if (!formData.bloodGroup) return alert("Select Blood Group first!");
    try {
      const res = await axios.post('http://localhost:5001/api/blood/search', { bloodGroup: formData.bloodGroup });
      if (res.data.success) {
        setNearbyDonors(res.data.donors);
        if (res.data.donors.length === 0) alert("No donors found nearby.");
      }
    } catch (err) { alert("Search Error"); }
  };

  const handleBroadcast = async () => {
    if (!formData.patientName) return alert("Please enter Patient Name");
    if (nearbyDonors.length === 0) return alert("Find donors first!");

    try {
      const payload = {
        hospitalName: hospitalName,
        ...formData,
        location: localStorage.getItem('userAddress') || "New Delhi",
        latitude: hospitalLoc.lat,
        longitude: hospitalLoc.lng
      };

      const res = await axios.post('http://localhost:5001/api/blood/create', payload);
      
      if (res.data.success) {
        alert(`🚨 Request sent for ${formData.patientName}`);
        setFormData({ ...formData, patientName: '' }); 
        fetchMyRequests();
      }
    } catch (err) { alert("Broadcast Failed"); }
  };

  // --- COMPLETE (Green Button) ---
  const handleAcceptDonor = async (requestId) => {
    try {
        await axios.delete(`http://localhost:5001/api/blood/complete-request/${requestId}`);
        alert("✅ Process Completed. Request removed.");
        fetchMyRequests();
    } catch (err) { alert("Error completing request"); }
  };

  // --- DECLINE (Red Button) ---
  const handleDeclineDonor = async (requestId) => {
    try {
        await axios.put(`http://localhost:5001/api/blood/decline-donor`, { requestId });
        alert("❌ Donor Declined. Request moved back to waiting list.");
        fetchMyRequests();
    } catch (err) { alert("Error declining donor"); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      <header className="bg-slate-900 text-white p-4 shadow-lg flex justify-between items-center z-20 shrink-0">
        <div className="flex items-center gap-3">
            <FaHospital className="text-2xl text-cyan-400" />
            <h1 className="text-xl font-bold">Hospital Command Center</h1>
        </div>
        <div className="text-xs text-slate-400">
           Logged in as: <span className="text-white font-bold">{hospitalName}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* LEFT: MAP (40%) */}
        <div className="w-full md:w-5/12 relative border-r border-slate-200">
           <MapContainer center={[hospitalLoc.lat, hospitalLoc.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
             <RecenterMap lat={hospitalLoc.lat} lng={hospitalLoc.lng} />
             <Marker position={[hospitalLoc.lat, hospitalLoc.lng]}><Popup>🏥 Your Hospital</Popup></Marker>
             {nearbyDonors.map((donor) => donor.location && (
                 <Marker key={donor._id} position={[donor.location.lat, donor.location.lng]}>
                    <Popup>{donor.name} ({donor.bloodGroup})</Popup>
                 </Marker>
             ))}
           </MapContainer>

           <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[1000] border border-slate-200">
              <div className="flex gap-2">
                  <select className="flex-1 p-2 bg-slate-50 border rounded font-bold text-sm"
                    value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}>
                     <option value="">Blood Group</option>
                     <option value="O+">O+</option><option value="A+">A+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                  </select>
                  <button onClick={handleSearchDonors} className="bg-slate-800 text-white px-4 rounded font-bold hover:bg-slate-900 text-sm">
                     <FaSearch />
                  </button>
              </div>
           </div>
        </div>

        {/* CENTER: DISPATCH UNIT + ACTION CENTER (30%) */}
        <div className="w-full md:w-3/12 bg-white flex flex-col border-r border-slate-100 z-10 shadow-xl">
            
            {/* 1. TOP BLOCK: Broadcast Form */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                        <FaTint className="text-red-500" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">1. Dispatch Unit</h2>
                </div>

                <div className="space-y-4 mb-6">
                    <input type="text" placeholder="Patient Name" className="w-full p-3 bg-white border border-slate-200 rounded-lg font-medium shadow-sm focus:ring-2 focus:ring-red-100 outline-none"
                        value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})} />
                    
                    <div className="flex gap-2">
                        {['Critical', 'Moderate', 'Low'].map((level) => (
                            <button key={level} onClick={() => setFormData({...formData, urgency: level})}
                            className={`flex-1 py-2 rounded text-xs font-bold border transition-all ${formData.urgency === level ? 'bg-red-500 text-white shadow-md' : 'bg-white text-slate-400'}`}>
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={handleBroadcast} disabled={nearbyDonors.length === 0}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md 
                    ${nearbyDonors.length > 0 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-200 text-slate-400'}`}>
                    <FaPaperPlane /> Broadcast Alert
                </button>
            </div>

            {/* 2. BOTTOM BLOCK: ACTION CENTER (Accepted Requests Move Here) */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                 <div className="flex items-center gap-2 mb-4">
                    <FaUserMd className="text-green-600" />
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Action Required</h2>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">{acceptedRequests.length}</span>
                </div>

                {acceptedRequests.length === 0 ? (
                    <div className="text-center py-10 opacity-40 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-xs text-slate-400">No donors have accepted yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {acceptedRequests.map((req) => (
                            <div key={req._id} className="bg-white p-4 rounded-xl border border-green-200 shadow-sm animate-fade-in-up relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                
                                {/* Patient Header */}
                                <div className="flex justify-between items-start mb-3 pl-2">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{req.patientName}</h4>
                                        <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 rounded">{req.urgency}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1">
                                        <FaCheckCircle /> ACCEPTED
                                    </span>
                                </div>

                                {/* Donor Details Card */}
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-3">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <p className="text-[9px] text-slate-400 uppercase font-bold">Donor</p>
                                            <p className="font-bold text-slate-700">{req.donorId?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-400 uppercase font-bold">Age</p>
                                            <p className="font-bold text-slate-700">{req.donorId?.age || "N/A"}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[9px] text-slate-400 uppercase font-bold">Contact</p>
                                            <div className="flex items-center gap-1">
                                                <FaPhoneAlt className="text-green-600 text-[10px]" />
                                                <span className="font-mono font-bold text-slate-700">{req.donorId?.phone || "No Phone"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-2">
                                    <button onClick={() => handleAcceptDonor(req._id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition shadow-sm">
                                        <FaThumbsUp /> Approve
                                    </button>
                                    <button onClick={() => handleDeclineDonor(req._id)} className="flex-1 bg-white border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition">
                                        <FaTimesCircle /> Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT: LIVE FEED (Only Waiting/Pending Requests) (30%) */}
        <div className="w-full md:w-4/12 bg-slate-100 flex flex-col border-l border-slate-200 h-full">
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <FaHistory className="text-slate-500" />
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Waiting Room</h2>
                </div>
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-bold">{pendingRequests.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {pendingRequests.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-sm text-slate-500">No pending requests.</p>
                        <p className="text-xs text-slate-400">Broadcast a new alert to start.</p>
                    </div>
                )}

                {pendingRequests.map((req) => (
                    <div key={req._id} className="p-4 rounded-xl border-l-4 border-l-amber-400 bg-white shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-800">{req.patientName}</h4>
                                <div className="text-xs text-slate-400 flex gap-2 mt-1">
                                   <span className="font-bold bg-slate-100 px-1 rounded text-slate-600">{req.bloodGroup}</span> 
                                   <span>{req.urgency}</span>
                                </div>
                            </div>
                            <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 animate-pulse">
                                <FaSpinner className="animate-spin" /> Pending
                            </span>
                        </div>
                        <div className="mt-3 text-xs text-slate-400 italic flex items-center gap-1 border-t border-slate-50 pt-2">
                            <FaExclamationCircle /> Waiting for donor response...
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default HospitalDashboard;