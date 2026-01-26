import { useState } from 'react';
import axios from 'axios';
import MapSelector from '../components/MapSelector';
import { FaAmbulance, FaSearchLocation, FaUserMd } from 'react-icons/fa'; // Ensure react-icons is installed

const HospitalDashboard = () => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState([]);

  const handleLocationSelect = (latlng) => {
    setCoords(latlng);
  };

  const handleSearch = async () => {
    if (!coords) return alert("📍 Please pin a location on the map first.");

    setLoading(true);
    try {
      // ✅ CONNECTS TO YOUR NEW PORT 5001
      const res = await axios.post('http://localhost:5001/api/blood/request', {
        latitude: coords.lat,
        longitude: coords.lng,
        bloodGroup: "O+"
      });
      
      if(res.data.donors) {
        setDonors(res.data.donors);
      }
    } catch (err) {
      alert("⚠️ Error: Backend not responding on Port 5001");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          <span className="text-teal-600">Emergency</span> Dispatch
        </h1>
        <p className="text-slate-500 mt-2">Real-time donor tracking and resource allocation.</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: MAP & CONTROLS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-1 rounded-2xl shadow-xl border border-slate-200 h-[500px] relative z-0">
             <MapSelector onLocationSelect={handleLocationSelect} />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selected Location</p>
              <p className="text-lg font-mono font-semibold text-slate-700">
                {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "No Pin Dropped"}
              </p>
            </div>
            
            <button 
              onClick={handleSearch}
              disabled={loading || !coords}
              className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transform transition hover:-translate-y-1 flex items-center gap-2
                ${!coords ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-red-200'}`}
            >
              {loading ? "Broadcasting..." : <><FaSearchLocation /> Find Donors</>}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold text-slate-800">Live Results</h2>
             <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold">
               {donors.length} Found
             </span>
          </div>

          <div className="h-[600px] overflow-y-auto pr-2 space-y-3">
            {donors.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <FaAmbulance className="text-4xl text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">Waiting for emergency signal...</p>
              </div>
            ) : (
              donors.map((d, i) => (
                <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-teal-600 transition">{d.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-bold border border-red-100">
                          {d.bloodGroup}
                        </span>
                        <span className="text-xs text-slate-400">1.2km away</span>
                      </div>
                    </div>
                    <button className="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition">
                      <FaUserMd />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HospitalDashboard;