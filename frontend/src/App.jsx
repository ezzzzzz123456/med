import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import HospitalDashboard from './pages/HospitalDashboard';
import DiseaseBot from './pages/DiseaseBot';
import FirstAid from './pages/FirstAid';
import Login from './pages/Login';          // ✅ New Import
import DonorInbox from './pages/DonorInbox'; // ✅ New Import
import { AuthProvider } from './context/AuthContext';
import './index.css';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
          
          {/* --- SMART NAVIGATION BAR --- */}
          <Navbar />

          {/* --- MAIN CONTENT --- */}
          <div className="fade-in"> 
            <Routes>
              {/* Step 1: Default Page is now Login */}
              <Route path="/" element={<Login />} />
              
              {/* Step 2: Role-Based Routes */}
              <Route path="/hospital" element={<HospitalDashboard />} />
              <Route path="/donor-inbox" element={<DonorInbox />} />
              
              {/* Public Features */}
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
// We extracted this to a separate component so we can use 'useLocation' hook
// to hide the navbar on the login page if we wanted to (optional).
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Helper to handle Logout / Login navigation
  const handleAuthAction = () => {
    // If we are already on login, do nothing. Otherwise, go to login.
    navigate('/');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-slate-800 tracking-tight hover:opacity-80 transition">
          <span className="bg-teal-500 text-white w-9 h-9 flex items-center justify-center rounded-lg shadow-md">M</span>
          MediConnect<span className="text-teal-500">Pro</span>
        </Link>

        {/* Desktop Menu - Useful for Demo Navigation */}
        <div className="hidden md:flex gap-2">
          <NavLink to="/hospital" label="Hospital Portal" />
          <NavLink to="/donor-inbox" label="Donor Inbox" /> {/* ✅ New Link */}
          <NavLink to="/chat" label="AI Doctor" />
          <NavLink to="/first-aid" label="First Aid" />
        </div>

        {/* Dynamic CTA Button */}
        <button 
          onClick={handleAuthAction}
          className="hidden md:block bg-slate-900 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-slate-800 hover:shadow-lg transition transform hover:-translate-y-0.5"
        >
          {location.pathname === '/' ? 'Sign Up' : 'Logout'}
        </button>
      </div>
    </nav>
  );
};

// Helper Component for consistent links
const NavLink = ({ to, label }) => (
  <Link 
    to={to} 
    className="px-4 py-2 text-slate-600 font-semibold text-sm hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200"
  >
    {label}
  </Link>
);

export default App;