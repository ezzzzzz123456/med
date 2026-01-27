import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHospital } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/hospital-dashboard" className="flex items-center gap-2 group">
          <div className="bg-white text-slate-900 p-2 rounded-lg group-hover:bg-cyan-50 transition-colors">
            <FaHospital className="text-xl" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Medi<span className="text-cyan-400">Sense</span></h1>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/hospital-dashboard" 
            className={`text-sm font-bold transition-colors ${isActive('/hospital-dashboard') ? 'text-cyan-400' : 'text-slate-300 hover:text-white'}`}
          >
            Hospital Portal
          </Link>
          <Link 
            to="/ai-doctor" 
            className={`text-sm font-bold transition-colors ${isActive('/ai-doctor') ? 'text-cyan-400' : 'text-slate-300 hover:text-white'}`}
          >
            AI Doctor
          </Link>
          <Link 
            to="/survival-guide" 
            className={`text-sm font-bold transition-colors ${isActive('/survival-guide') ? 'text-cyan-400' : 'text-slate-300 hover:text-white'}`}
          >
            Survival Guide
          </Link>
          
          {/* CHANGED TEXT HERE */}
          <Link 
            to="/prescription" 
            className={`text-sm font-bold transition-colors ${isActive('/prescription') ? 'text-cyan-400' : 'text-slate-300 hover:text-white'}`}
          >
            Decipher
          </Link>
        </div>

        {/* Logout Button */}
        <button 
            className="bg-white text-slate-900 px-5 py-2 rounded-full text-xs font-bold hover:bg-cyan-50 transition-colors"
            onClick={() => navigate('/')}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;