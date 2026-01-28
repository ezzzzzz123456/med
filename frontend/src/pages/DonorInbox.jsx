import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTint, FaCheckCircle, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const DonorInbox = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get logged-in donor details
  const donorGroup = localStorage.getItem('userBloodGroup') || "O+"; 
  const donorId = localStorage.getItem('userId'); 

  // Fetch Requests on Load
  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/blood/for-donor/${donorGroup}`);
      if (res.data.success) {
        setRequests(res.data.requests);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    if(!window.confirm("Confirm you can donate? This will notify the hospital.")) return;

    try {
      if (!donorId) return alert("Please Re-Login to refresh your session ID.");

      const res = await axios.put('http://localhost:5001/api/blood/accept', {
        requestId,
        donorId
      });

      if (res.data.success) {
        alert("✅ Thank you! The hospital has been notified.");
        fetchRequests(); // Refresh list to remove the accepted item
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
          <FaTint className="text-red-600" /> Donor Inbox
        </h1>
        <p className="text-slate-500 mt-2">
            Showing emergency requests for <span className="font-bold text-slate-800">{donorGroup}</span> blood group.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {loading ? (
           <p className="text-center text-slate-400">Loading requests...</p>
        ) : requests.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl shadow border border-slate-100">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FaCheckCircle className="text-3xl text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">All Clear!</h3>
              <p className="text-slate-400">No emergency requests nearby at the moment.</p>
           </div>
        ) : (
           requests.map((req) => (
             <div key={req._id} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-red-100 transition-all">
                
                {/* Left: Info */}
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        {req.urgency || "Critical"}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        {/* ✅ FIX: Correct Date Handling */}
                        <FaClock /> {req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Just Now"}
                      </span>
                   </div>
                   
                   <h3 className="text-xl font-bold text-slate-800 mb-1">{req.hospitalName}</h3>
                   
                   <p className="text-slate-500 text-sm flex items-center gap-2">
                      <FaMapMarkerAlt /> {req.location}
                   </p>
                   
                   {/* ✅ FIX: Display Patient Name */}
                   <div className="mt-3">
                     <span className="text-slate-500 text-sm font-medium">Patient: </span>
                     <span className="text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded">{req.patientName || "Unknown"}</span>
                   </div>
                </div>

                {/* Right: Action */}
                <div>
                   <button 
                     onClick={() => handleAccept(req._id)}
                     className="bg-red-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-red-700 shadow-lg hover:shadow-red-200 transition transform active:scale-95 flex items-center gap-2"
                   >
                     <FaTint /> I Can Donate
                   </button>
                </div>

             </div>
           ))
        )}
      </div>

    </div>
  );
};

export default DonorInbox;