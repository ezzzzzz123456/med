import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaHospital, FaUserAlt, FaEnvelope, FaLock, 
  FaMapMarkerAlt, FaHeartbeat, FaIdCard, FaBuilding 
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
          : 'border-slate-200 focus:ring-cyan-500 focus:bg-white text-slate-700 hover:border-cyan-300'}`} // Added hover effect
      required={required} 
    />
  </div>
);

const Login = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [role, setRole] = useState('user'); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '', password: '', name: '', address: '',
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
    const endpoint = isLogin ? '/login' : '/register';
    const apiUrl = `http://localhost:5001/api/auth${endpoint}`;

    try {
      const res = await axios.post(apiUrl, { ...formData, role });
      if (res.data.success) {
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', res.data.user?.name || formData.name);
        navigate(role === 'hospital' ? '/hospital-dashboard' : '/donor-inbox');
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data?.message);
      setError(isLogin ? "Invalid Credentials" : "Unable to Register"); 
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      
      {/* --- LEFT SIDE: BRANDING PANEL --- */}
      {/* We added a 'z-10 shadow-2xl' to make it pop out over the white side slightly */}
      <div className="hidden lg:flex w-5/12 bg-slate-900 relative overflow-hidden flex-col justify-center items-center text-white p-12 z-10 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)]">
        
        {/* Background shapes linking the colors */}
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
              
              <div className="text-left mb-10">
                  <h2 className="text-4xl font-bold text-slate-900 mb-2">
                      {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-slate-500 text-lg">
                    {isLogin ? 'Please enter your details.' : 'Join us to make a difference.'}
                  </p>
              </div>

              {/* Role Toggle */}
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
                  {!isLogin && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
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

                  <InputGroup icon={FaEnvelope} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" hasError={!!error} />
                  
                  {/* Password + Forgot Link */}
                  <div>
                    <InputGroup icon={FaLock} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" hasError={!!error} />
                    
                    {/* FORGOT PASSWORD LINK */}
                    {isLogin && (
                        <div className="text-right -mt-2 mb-6">
                            <button type="button" onClick={() => alert("Feature coming soon!")} className="text-sm font-semibold text-cyan-600 hover:text-cyan-800 transition-colors">
                                Forgot Password?
                            </button>
                        </div>
                    )}
                  </div>

                  <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transform active:scale-[0.99] transition-all duration-200 shadow-xl shadow-slate-200 hover:shadow-2xl">
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </button>

                  {error && (
                    <div className="text-center mt-6 animate-pulse">
                      <span className="text-red-500 font-semibold text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                        ⚠️ {error}
                      </span>
                    </div>
                  )}
              </form>
              
              <div className="text-center mt-8 pt-8 border-t border-slate-100">
                  <p className="text-slate-500">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-bold text-cyan-600 ml-2 hover:underline">
                      {isLogin ? 'Register Now' : 'Login Here'}
                    </button>
                  </p>
              </div>

          </div>
      </div>
    </div>
  );
};

export default Login;