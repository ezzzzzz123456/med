import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaHospital, FaUserAlt, FaEnvelope, FaLock, 
  FaMapMarkerAlt, FaHeartbeat, FaIdCard, FaBuilding, FaArrowLeft, FaKey 
} from 'react-icons/fa';

// --- INPUT COMPONENT ---
const InputGroup = ({ icon: Icon, type, name, placeholder, value, onChange, hasError, required = true }) => (
  <div className="relative mb-5 group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <Icon className={`transition-colors text-lg ${hasError ? 'text-red-400' : 'text-slate-400 group-focus-within:text-cyan-600'}`} />
    </div>
    <input 
      name={name} 
      type={type} 
      value={value}
      onChange={onChange}
      placeholder={placeholder} 
      className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium
        ${hasError 
          ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300' 
          : 'border-slate-200 focus:ring-cyan-500 focus:bg-white text-slate-700 hover:border-cyan-300'}`} 
      required={required} 
    />
  </div>
);

const Login = () => {
  // view: 'login', 'register', or 'forgot'
  const [view, setView] = useState('login'); 
  const [role, setRole] = useState('user'); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '', password: '', newPassword: '', name: '', address: '',
    age: '', bloodGroup: '', medicalHistory: '', 
    establishmentId: '', nabhId: '' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Determine endpoint based on current view
    let endpoint = '';
    let payload = { ...formData, role };

    if (view === 'login') endpoint = '/login';
    else if (view === 'register') endpoint = '/register';
    else if (view === 'forgot') {
        endpoint = '/reset-password';
        // Backend expects 'newPassword', so we ensure it's in the payload
        payload = { email: formData.email, newPassword: formData.newPassword, role };
    }

    const apiUrl = `http://localhost:5001/api/auth${endpoint}`;

    try {
      const res = await axios.post(apiUrl, payload);

      if (res.data.success) {
        if (view === 'forgot') {
            // Password Reset Success
            alert("✅ Password Reset Successful! Please Login.");
            setView('login'); // Return to login screen
        } else {
            // Login/Register Success
            const user = res.data.user || {};
            
            // 1. Save Basic Info
            localStorage.setItem('userRole', role);
            localStorage.setItem('userName', user.name || formData.name);
            
            // ✅ 2. CRITICAL: Save ID and Blood Group (For Donor Inbox)
            if (user.id) localStorage.setItem('userId', user.id);
            if (role === 'user') {
                localStorage.setItem('userBloodGroup', user.bloodGroup || formData.bloodGroup || "O+");
            }

            // 3. Save Location (For Hospital Dashboard)
            if(user.address) localStorage.setItem('userAddress', user.address);
            if(user.location) {
                localStorage.setItem('userLat', user.location.lat);
                localStorage.setItem('userLng', user.location.lng);
            }

            navigate(role === 'hospital' ? '/hospital-dashboard' : '/donor-inbox');
        }
      }
    } catch (err) {
      console.error("Auth Error:", err.response?.data?.message);
      setError(err.response?.data?.message || "Operation Failed"); 
    }
  };

  const switchView = (newView) => {
    setView(newView);
    setError(null);
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      
      {/* --- LEFT SIDE: BRANDING PANEL --- */}
      <div className="hidden lg:flex w-5/12 bg-slate-900 relative overflow-hidden flex-col justify-center items-center text-white p-12 z-10 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center p-5 bg-white/5 backdrop-blur-xl rounded-3xl mb-8 border border-white/10 shadow-lg">
                 <FaHeartbeat className="text-7xl text-cyan-400 drop-shadow-md" />
            </div>
            <h1 className="text-6xl font-extrabold mb-6 tracking-tight">
              Medi<span className="text-cyan-400">Sense</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed font-light max-w-sm mx-auto">
                Join the largest emergency response network. Real-time connections that save lives.
            </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM SECTION --- */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-8 md:p-16 bg-white relative">
          
          <div className="w-full max-w-md">
              
              {/* Header Text Changes based on View */}
              <div className="text-left mb-10">
                  <h2 className="text-4xl font-bold text-slate-900 mb-2">
                      {view === 'login' && 'Welcome Back'}
                      {view === 'register' && 'Create Account'}
                      {view === 'forgot' && 'Reset Password'}
                  </h2>
                  <p className="text-slate-500 text-lg">
                    {view === 'login' && 'Please enter your details.'}
                    {view === 'register' && 'Join us to make a difference.'}
                    {view === 'forgot' && 'Enter email to set a new password.'}
                  </p>
              </div>

              {/* Role Toggle (Always Visible) */}
              <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8 border border-slate-200">
                  <button type="button" 
                    className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${role === 'user' ? 'bg-white shadow-sm text-cyan-700 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`} 
                    onClick={() => setRole('user')}>
                    <FaUserAlt /> Donor
                  </button>
                  <button type="button" 
                    className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${role === 'hospital' ? 'bg-white shadow-sm text-cyan-700 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`} 
                    onClick={() => setRole('hospital')}>
                    <FaHospital /> Hospital
                  </button>
              </div>

              <form onSubmit={handleSubmit}>
                  
                  {/* --- REGISTER FIELDS --- */}
                  {view === 'register' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 animate-fade-in-up">
                      <InputGroup icon={FaUserAlt} type="text" name="name" value={formData.name} onChange={handleChange} placeholder={role === 'hospital' ? "Hospital Name" : "Full Name"} hasError={!!error} />
                      <InputGroup icon={FaMapMarkerAlt} type="text" name="address" value={formData.address} onChange={handleChange} placeholder="City / Address" hasError={!!error} />
                      
                      {role === 'user' && (
                        <>
                          <InputGroup icon={FaIdCard} type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" hasError={!!error} />
                          <div className="relative mb-5 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                               <FaHeartbeat className={`transition-colors text-lg ${error ? 'text-red-400' : 'text-slate-400'}`} />
                            </div>
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} 
                              className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium appearance-none bg-slate-50 hover:border-cyan-300
                              ${error ? 'border-red-500 bg-red-50 text-red-900 focus:ring-red-200' : 'border-slate-200 focus:ring-cyan-500 text-slate-700'}`} required>
                              <option value="">Select Blood Group</option>
                              <option>A+</option><option>B+</option><option>O+</option><option>AB+</option>
                              <option>A-</option><option>B-</option><option>O-</option><option>AB-</option>
                            </select>
                          </div>
                        </>
                      )}
                      {role === 'hospital' && (
                         <>
                           <InputGroup icon={FaBuilding} type="text" name="establishmentId" value={formData.establishmentId} onChange={handleChange} placeholder="License No" hasError={!!error} />
                           <InputGroup icon={FaIdCard} type="text" name="nabhId" value={formData.nabhId} onChange={handleChange} placeholder="NABH ID" hasError={!!error} />
                         </>
                      )}
                    </div>
                  )}

                  {/* --- EMAIL (Always Visible) --- */}
                  <InputGroup icon={FaEnvelope} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" hasError={!!error} />
                  
                  {/* --- PASSWORD (Login & Register) --- */}
                  {view !== 'forgot' && (
                    <div>
                        <InputGroup icon={FaLock} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" hasError={!!error} />
                        
                        {/* Forgot Password Link */}
                        {view === 'login' && (
                            <div className="text-right -mt-2 mb-6">
                                <button type="button" onClick={() => switchView('forgot')} className="text-sm font-semibold text-cyan-600 hover:text-cyan-800 transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                    </div>
                  )}

                  {/* --- NEW PASSWORD (Forgot View Only) --- */}
                  {view === 'forgot' && (
                     <InputGroup icon={FaKey} type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Enter New Password" hasError={!!error} />
                  )}

                  {/* --- SUBMIT BUTTON --- */}
                  <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transform active:scale-[0.99] transition-all duration-200 shadow-xl shadow-slate-200 hover:shadow-2xl">
                    {view === 'login' ? 'Sign In' : view === 'register' ? 'Create Account' : 'Reset Password'}
                  </button>

                  {/* Error Message */}
                  {error && (
                    <div className="text-center mt-6 animate-pulse">
                      <span className="text-red-500 font-semibold text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                        ⚠️ {error}
                      </span>
                    </div>
                  )}
              </form>
              
              {/* --- FOOTER (Switch between Login/Register/Back) --- */}
              <div className="text-center mt-8 pt-8 border-t border-slate-100">
                  <p className="text-slate-500">
                    {view === 'login' && (
                        <>
                            New to MediSense? 
                            <button onClick={() => switchView('register')} className="font-bold text-cyan-600 ml-2 hover:underline">Register Now</button>
                        </>
                    )}
                    {view === 'register' && (
                        <>
                            Already have an account? 
                            <button onClick={() => switchView('login')} className="font-bold text-cyan-600 ml-2 hover:underline">Login Here</button>
                        </>
                    )}
                    {view === 'forgot' && (
                        <button onClick={() => switchView('login')} className="flex items-center justify-center gap-2 font-bold text-slate-600 hover:text-slate-900 mx-auto transition-colors">
                            <FaArrowLeft /> Back to Login
                        </button>
                    )}
                  </p>
              </div>

          </div>
      </div>
    </div>
  );
};

export default Login;