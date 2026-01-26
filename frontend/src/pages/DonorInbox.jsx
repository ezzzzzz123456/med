import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaHeart, FaCheckCircle } from 'react-icons/fa';

const DonorInbox = () => {
  const [requests, setRequests] = useState([]);

  // Fetch requests when page loads
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/blood/inbox');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/blood/accept/${id}`);
      fetchRequests(); // Refresh list to show "Accepted"
      alert("Thank you! The hospital has been notified.");
    } catch (err) {
      alert("Error accepting request");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">🩸 My Donation Inbox</h1>
      
      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req._id} className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex justify-between items-center">
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase">Urgent</span>
                <span className="text-slate-500 text-sm">{new Date(req.date).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">{req.hospitalName}</h3>
              <p className="text-slate-600">Needs <span className="font-bold text-red-600">{req.bloodGroup}</span> Blood immediately.</p>
            </div>

            {req.status === 'Accepted' ? (
              <button disabled className="bg-green-100 text-green-700 px-6 py-3 rounded-lg font-bold flex items-center gap-2">
                <FaCheckCircle /> Accepted
              </button>
            ) : (
              <button 
                onClick={() => handleAccept(req._id)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition flex items-center gap-2"
              >
                <FaHeart /> Donate Now
              </button>
            )}

          </div>
        ))}

        {requests.length === 0 && (
          <p className="text-center text-slate-400 mt-10">No pending requests. You are a hero! 🦸‍♂️</p>
        )}
      </div>
    </div>
  );
};

export default DonorInbox;