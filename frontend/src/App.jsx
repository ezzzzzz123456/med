import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// --- PAGE IMPORTS ---
import Login from './pages/Login';
import HospitalDashboard from './pages/HospitalDashboard';
import FirstAid from './pages/FirstAid';
import DonorInbox from './pages/DonorInbox';
import DiseaseBot from './pages/DiseaseBot';
import Prescription from './pages/Prescription'; // New Import

// --- CONTEXT & STYLES ---
import { AuthProvider } from './context/AuthContext';
import './index.css';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
          
          {/* --- NAVBAR --- */}
          <Navbar />

          {/* --- MAIN CONTENT --- */}
          <div className="fade-in"> 
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
              <Route path="/donor-inbox" element={<DonorInbox />} />
              <Route path="/chat" element={<DiseaseBot />} />
              <Route path="/first-aid" element={<FirstAid />} />
              <Route path="/prescription" element={<Prescription />} /> {/* New Route */}
            </Routes>
          </div>

        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

// --- SUB-COMPONENT: NAVBAR ---
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (location.pathname !== '/') {
        localStorage.clear();
    }
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-slate-50 via-cyan-700 to-cyan-950 shadow-lg sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group">
          <div className="bg-stone-100 text-cyan-900 w-10 h-10 flex items-center justify-center rounded-xl shadow-md transform group-hover:-rotate-6 transition-transform duration-300 border border-stone-200">
             <span className="text-xl font-extrabold italic">M</span>
          </div>
          <div className="text-2xl tracking-tight leading-none flex items-baseline">
            <span className="font-bold text-slate-800">Medi</span>
            <span className="font-extrabold bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent ml-0.5 filter drop-shadow-sm">Sense</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-2">
          <NavLink to="/hospital-dashboard" label="Hospital Portal" />
          <NavLink to="/chat" label="AI Doctor" />
          <NavLink to="/first-aid" label="Survival Guide" />
          <NavLink to="/prescription" label="Decipher" /> {/* New Link */}
        </div>

        {/* Dynamic CTA Button */}
        <button 
          onClick={handleAuthAction}
          className="hidden md:block bg-stone-50 text-cyan-900 px-5 py-2 rounded-full font-bold text-sm hover:bg-white hover:shadow-lg transition transform hover:-translate-y-0.5 border border-cyan-800"
        >
          {location.pathname === '/' ? 'Sign Up / Login' : 'Logout'}
        </button>
      </div>
    </nav>
  );
};

// Helper Component for Links
const NavLink = ({ to, label }) => (
  <Link 
    to={to} 
    className="px-4 py-2 text-cyan-50 font-semibold text-sm hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
  >
    {label}
  </Link>
);

export default App;