import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';

// --- PAGE IMPORTS ---
import Login from './pages/Login';
import HospitalDashboard from './pages/HospitalDashboard';
import FirstAid from './pages/FirstAid';
import DonorInbox from './pages/DonorInbox';
import DiseaseBot from './pages/DiseaseBot';

// --- CONTEXT & STYLES ---
// Kept from video branch (ensure this file exists, or remove this line if not used)
import { AuthProvider } from './context/AuthContext'; 
import './index.css';
import 'leaflet/dist/leaflet.css';

// --- SECURITY COMPONENT: PROTECTED ROUTE ---
const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuth = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    // Wrap in AuthProvider from video branch
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
          
          {/* Navbar handles its own visibility (hidden on login) */}
          <Navbar />

          <div className="fade-in"> 
            <Routes>
              {/* 1. Public Login Page */}
              <Route path="/" element={<Login />} />
              
              {/* 2. HOSPITAL ONLY Route */}
              <Route 
                path="/hospital-dashboard" 
                element={
                  <ProtectedRoute requiredRole="hospital">
                    <HospitalDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* 3. DONOR ONLY Route */}
              <Route 
                path="/donor-inbox" 
                element={
                  <ProtectedRoute requiredRole="user">
                    <DonorInbox />
                  </ProtectedRoute>
                } 
              />
              
              {/* Public Features (Accessible to anyone logged in) */}
              <Route path="/chat" element={<DiseaseBot />} />
              <Route path="/first-aid" element={<FirstAid />} />
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
  
  // Get the current role from storage
  const userRole = localStorage.getItem('userRole');

  // Hide Navbar completely on the Login page
  if (location.pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-slate-50 via-cyan-700 to-cyan-950 shadow-lg sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo - Redirects based on role */}
        <Link 
          to={userRole === 'hospital' ? "/hospital-dashboard" : "/donor-inbox"} 
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group"
        >
          <div className="bg-stone-100 text-cyan-900 w-10 h-10 flex items-center justify-center rounded-xl shadow-md transform group-hover:-rotate-6 transition-transform duration-300 border border-stone-200">
             <span className="text-xl font-extrabold italic">M</span>
          </div>
          <div className="text-2xl tracking-tight leading-none flex items-baseline">
            <span className="font-bold text-slate-800">Medi</span>
            <span className="font-extrabold bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent ml-0.5 filter drop-shadow-sm">Sense</span>
          </div>
        </Link>

        {/* --- DYNAMIC MENU BASED ON ROLE --- */}
        <div className="hidden md:flex gap-2">
          
          {/* ONLY Show Hospital Portal if role is 'hospital' */}
          {userRole === 'hospital' && (
            <NavLink to="/hospital-dashboard" label="Hospital Command Center" />
          )}

          {/* ONLY Show Donor Inbox if role is 'user' */}
          {userRole === 'user' && (
            <NavLink to="/donor-inbox" label="My Inbox" />
          )}

          {/* Common Links */}
          <NavLink to="/chat" label="AI Doctor" />
          
          {/* Updated Name from video branch */}
          <NavLink to="/first-aid" label="Survival Guide" />
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="hidden md:block bg-stone-50 text-cyan-900 px-5 py-2 rounded-full font-bold text-sm hover:bg-white hover:shadow-lg transition transform hover:-translate-y-0.5 border border-cyan-800"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

// Helper
const NavLink = ({ to, label }) => (
  <Link 
    to={to} 
    className="px-4 py-2 text-cyan-50 font-semibold text-sm hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
  >
    {label}
  </Link>
);

export default App;