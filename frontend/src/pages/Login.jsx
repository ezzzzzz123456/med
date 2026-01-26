import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [role, setRole] = useState('hospital'); // Default selection
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Save role to localStorage so the app knows who you are
    localStorage.setItem('userRole', role);
    
    if (role === 'hospital') {
      navigate('/hospital');
    } else {
      navigate('/donor-inbox');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">MediConnect Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Role Selection Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 rounded-md font-bold text-sm transition ${role === 'hospital' ? 'bg-white shadow text-teal-600' : 'text-slate-500'}`}
              onClick={() => setRole('hospital')}
            >
              Hospital Admin
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-md font-bold text-sm transition ${role === 'donor' ? 'bg-white shadow text-teal-600' : 'text-slate-500'}`}
              onClick={() => setRole('donor')}
            >
              Blood Donor
            </button>
          </div>

          <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-lg" required />
          <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg" required />
          
          <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition">
            Login as {role === 'hospital' ? 'Admin' : 'Donor'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;