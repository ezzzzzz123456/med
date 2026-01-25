import { useState } from 'react';
import axios from 'axios';
import MapSelector from '../components/MapSelector';

const HospitalDashboard = () => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState([]);

  // This function receives the data from MapSelector
  const handleLocationSelect = (latlng) => {
    console.log("✅ Dashboard received:", latlng);
    setCoords(latlng);
  };

  const handleSearch = async () => {
    // Check if coords exist before sending
    if (!coords) {
      alert("Please click on the map to select a location first.");
      return;
    }

    setLoading(true);
    try {
      // Sends request to Node Backend (Port 5000)
      const res = await axios.post('http://localhost:5000/api/blood/request', {
        latitude: coords.lat,
        longitude: coords.lng,
        bloodGroup: "O+"
      });
      
      // Handle response
      if(res.data.donors) {
        setDonors(res.data.donors);
        alert(`Request Sent! Found ${res.data.count} donors.`);
      } else {
        alert("No donors found in this area.");
      }

    } catch (err) {
      console.error("Connection Error:", err);
      alert("Error connecting to Backend. Is Node running on Port 5000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Side: Map */}
      <div className="bg-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🚑 Emergency Dispatch</h2>
        
        <div className="h-96 border-2 border-gray-200 rounded-xl overflow-hidden mb-4 relative z-0">
          {/* This prop name 'onLocationSelect' MUST match the one in MapSelector */}
          <MapSelector onLocationSelect={handleLocationSelect} />
        </div>

        <p className="font-bold text-gray-700">
            Selected Location: {coords ? <span className="text-green-600">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span> : <span className="text-red-500">None</span>}
        </p>

        <button 
          onClick={handleSearch}
          className="w-full mt-4 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
        >
          {loading ? "Broadcasting Signal..." : "Find Nearby Donors"}
        </button>
      </div>

      {/* Right Side: Results */}
      <div className="bg-gray-50 p-6 rounded-2xl shadow-inner border border-gray-200">
         <h3 className="text-xl font-bold mb-4 text-gray-800">Live Search Results</h3>
         {donors.length === 0 ? (
             <div className="text-center mt-10 text-gray-400">
                 <p>Waiting for emergency signal...</p>
             </div>
         ) : (
             donors.map((d, i) => (
                 <div key={i} className="bg-white p-4 mb-3 rounded-lg shadow-sm border-l-4 border-green-500">
                     <p className="font-bold text-lg">{d.name}</p>
                     <p className="text-sm text-gray-600">Blood Group: {d.bloodGroup}</p>
                     <p className="text-xs text-gray-400">Distance: {d.dist ? (d.dist.calculated/1000).toFixed(2) + ' km' : 'Nearby'}</p>
                 </div>
             ))
         )}
      </div>
    </div>
  );
};

export default HospitalDashboard;