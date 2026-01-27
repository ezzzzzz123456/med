import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHospital, FaUserAlt } from 'react-icons/fa';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle Login / Sign Up
  const [role, setRole] = useState('user'); // 'user' or 'hospital'
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // (We will connect this to your Node.js backend next!)
    localStorage.setItem('userRole', role);
    navigate(role === 'hospital' ? '/hospital' : '/donor-inbox');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-100 flex items-center justify-center p-4">
      <div className={`bg-white p-8 rounded-2xl shadow-2xl w-full border border-cyan-50 transition-all duration-300 ${isLogin ? 'max-w-md' : 'max-w-xl'}`}>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-cyan-600 text-white w-12 h-12 flex items-center justify-center rounded-xl mx-auto mb-3 shadow-lg">
            <span className="text-2xl font-extrabold italic">M</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isLogin ? 'Login to access the MediSense platform' : 'Join the MediSense healthcare network'}
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            className={`flex-1 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all ${role === 'user' ? 'bg-white shadow text-cyan-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setRole('user')}
          >
            <FaUserAlt /> Patient / User
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all ${role === 'hospital' ? 'bg-white shadow text-cyan-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setRole('hospital')}
          >
            <FaHospital /> Hospital
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- SIGN UP FIELDS --- */}
          {!isLogin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* COMMON: Name & Address */}
              <input type="text" placeholder={role === 'hospital' ? "Hospital Name" : "Full Name"} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
              <input type="text" placeholder="Full Address / City" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500" required />

              {/* USER SPECIFIC FIELDS */}
              {role === 'user' && (
                <>
                  <input type="number" placeholder="Age" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500" min="1" required />
                  <select className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-cyan-500" required>
                    <option value="" disabled defaultValue="">Blood Group</option>
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                    <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                  </select>
                  <textarea placeholder="Medical History (e.g., Diabetes, Allergies, Surgeries...)" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 md:col-span-2 h-20" required></textarea>
                </>
              )}

              {/* HOSPITAL SPECIFIC FIELDS */}
              {role === 'hospital' && (
                <>
                  <input type="text" placeholder="Clinical Est. Act Reg. No." className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                  <input type="text" placeholder="NABH Accreditation No." className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                </>
              )}
            </div>
          )}

          {/* --- COMMON LOGIN FIELDS (Email & Password) --- */}
          <div className={`${!isLogin ? 'mt-4 border-t pt-4 border-slate-100' : ''}`}>
            <input type="email" placeholder="Email Address" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 mb-4" required />
            <input type="password" placeholder="Password" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
          </div>
          
          {/* Forgot Password Link (Only on Login) */}
          {isLogin && (
            <div className="text-right">
              <button type="button" className="text-sm font-semibold text-cyan-600 hover:text-cyan-700">
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="text-center mt-6 text-sm text-slate-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-cyan-600 hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;