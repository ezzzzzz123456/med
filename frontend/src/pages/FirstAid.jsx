import React, { useState, useEffect } from 'react';
import { FaHeartbeat, FaBurn, FaBandAid, FaLungs, FaProcedures, FaCheckCircle, FaHospital, FaPhoneAlt, FaMapMarkerAlt, FaDirections } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ORIGINAL VIDEO LIST
const videoData = [
  {
    id: "1",
    title: "CPR (No Breathing)",
    desc: "If they are unconscious and NOT breathing.",
    videoId: "TsJ49Np3HS0", 
    color: "text-red-600",
    icon: FaHeartbeat,
    steps: [
      "Place heel of hand in center of chest.",
      "Interlock fingers. Keep arms straight.",
      "Push down hard & fast (2 per second)."
    ]
  },
  {
    id: "2",
    title: "Choking (Adult)",
    desc: "If they cannot breathe, speak, or cough.",
    videoId: "HGBBu4zr8sM", 
    color: "text-blue-600",
    icon: FaLungs,
    steps: [
      "Give up to 5 sharp back blows between shoulder blades.",
      "Give up to 5 abdominal thrusts (pull inwards & upwards).",
      "Repeat cycle until blockage clears."
    ]
  },
  {
    id: "3",
    title: "Severe Bleeding",
    desc: "Apply pressure immediately to stop blood loss.",
    videoId: "p9KHec6xfuw", 
    color: "text-rose-600",
    icon: FaBandAid,
    steps: [
      "Press directly on the wound with a clean cloth.",
      "Keep pressure constant. Do not check the wound.",
      "Elevate the limb above heart level if possible."
    ]
  },
  {
    id: "4",
    title: "Recovery Position",
    desc: "If they are unconscious but ARE breathing.",
    videoId: "SD1nuKERJok", 
    color: "text-purple-600",
    icon: FaProcedures,
    steps: [
      "Place nearest arm at a right angle (waiter tip).",
      "Place back of other hand against their cheek.",
      "Pull far leg knee up and roll them onto their side."
    ]
  },
  {
    id: "5",
    title: "Treating Burns",
    desc: "Cool the burn immediately to stop tissue damage.",
    videoId: "4FLXhD0NYh8", 
    color: "text-orange-500",
    icon: FaBurn,
    steps: [
      "Hold under cool running water for at least 10 mins.",
      "Remove jewelry/clothing before swelling starts.",
      "Cover loosely with cling film to prevent infection."
    ]
  }
];

const FirstAid = () => {
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [hospitals, setHospitals] = useState([]);

  // Function to get location and hospitals
  const handleLocate = () => {
    setLoadingLoc(true);
    setShowMap(true);

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        setLoadingLoc(false);
        return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserPos([latitude, longitude]);
        
        // Fetch nearby hospitals using Overpass API (Free OSM data)
        const query = `
          [out:json];
          (
            node["amenity"="hospital"](around:5000, ${latitude}, ${longitude});
            way["amenity"="hospital"](around:5000, ${latitude}, ${longitude});
            relation["amenity"="hospital"](around:5000, ${latitude}, ${longitude});
          );
          out center;
        `;
        
        fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                const locs = data.elements.map(el => ({
                    lat: el.lat || el.center.lat,
                    lon: el.lon || el.center.lon,
                    name: el.tags.name || "Unknown Hospital"
                })).slice(0, 5); // Take top 5
                setHospitals(locs);
                setLoadingLoc(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingLoc(false);
            });

    }, (error) => {
        alert("Unable to retrieve your location");
        setLoadingLoc(false);
    });
  };

  // Initialize Map Effect
  useEffect(() => {
    if (showMap && userPos && !loadingLoc) {
        // Simple check to prevent re-initialization issues in React strict mode
        const container = L.DomUtil.get('map-container');
        if(container != null){
        container._leaflet_id = null;
        }

        const map = L.map('map-container').setView(userPos, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // User Marker
        L.marker(userPos).addTo(map)
            .bindPopup("You are here")
            .openPopup();

        // Hospital Markers
        hospitals.forEach(h => {
             L.marker([h.lat, h.lon]).addTo(map)
              .bindPopup(`<b>${h.name}</b>`);
        });

        return () => {
            map.remove();
        }
    }
  }, [showMap, userPos, loadingLoc, hospitals]);


  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      
      {/* --- Navbar --- */}
      <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <FaHospital className="text-2xl text-cyan-400" />
                <h1 className="text-xl font-bold tracking-tight">Medi<span className="text-cyan-400">Sense</span> Resources</h1>
            </div>
            <button onClick={() => navigate('/hospital-dashboard')} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                Back to Dashboard
            </button>
        </div>
      </nav>

      {/* --- Header --- */}
      <div className="bg-white border-b border-slate-200 py-10 px-6 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
          Emergency <span className="text-red-600">Survival Guide</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg mb-6">
          Immediate actions to take while waiting for an ambulance.
        </p>

        {/* --- NEW: LOCATE HOSPITALS BUTTON --- */}
        <button 
            onClick={handleLocate}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform hover:scale-105"
        >
            <FaMapMarkerAlt /> {showMap ? "Refresh Location" : "Find Nearest Hospital"}
        </button>

        {/* --- MAP CONTAINER --- */}
        {showMap && (
            <div className="max-w-4xl mx-auto mt-8 bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 animate-fade-in-down">
                {loadingLoc ? (
                    <div className="h-64 flex items-center justify-center text-slate-500">
                        <span className="animate-pulse">Acquiring GPS Signal...</span>
                    </div>
                ) : (
                    <>
                        <div id="map-container" className="h-64 md:h-80 w-full rounded-xl z-0" />
                        <div className="mt-4 flex justify-between items-center">
                            <p className="text-sm text-slate-500">Found {hospitals.length} hospitals nearby.</p>
                            <a 
                                href={`https://www.google.com/maps/search/hospitals/@${userPos[0]},${userPos[1]},15z`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-600 font-bold text-sm flex items-center gap-1 hover:underline"
                            >
                                Open in Google Maps <FaDirections />
                            </a>
                        </div>
                    </>
                )}
            </div>
        )}
      </div>

      {/* --- Video Grid --- */}
      <div className="max-w-7xl mx-auto p-6 md:p-10 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videoData.map((video) => (
            <div key={video.id} className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col h-full">
              {/* YouTube Embed */}
              <div className="relative w-full aspect-video bg-black">
                 <iframe 
                    className="w-full h-full object-cover"
                    src={`https://www.youtube.com/embed/${video.videoId}`} 
                    title={video.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                 ></iframe>
              </div>
              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-3 rounded-xl bg-slate-50 ${video.color}`}>
                    <video.icon className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{video.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{video.desc}</p>
                  </div>
                </div>
                {/* Summary */}
                <div className="mt-auto bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Instant Actions</h4>
                    <ul className="space-y-2">
                        {video.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 font-bold">
                                <FaCheckCircle className="text-green-500 mt-0.5 shrink-0 text-xs" />
                                <span>{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- FLOATING SOS BUTTON --- */}
      <a 
        href="tel:102" 
        className="fixed bottom-8 right-8 bg-red-600 text-white p-5 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:bg-red-700 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center group animate-bounce-slow"
        title="Call Ambulance"
      >
        <FaPhoneAlt className="text-2xl animate-pulse" />
        <span className="absolute right-full mr-4 bg-slate-900 text-white text-sm font-bold px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Call Emergency (102)
        </span>
      </a>

    </div>
  );
};

export default FirstAid;