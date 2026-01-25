import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HospitalDashboard from './pages/HospitalDashboard';
import DiseaseBot from './pages/DiseaseBot';
import FirstAid from './pages/FirstAid';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          
          {/* Navigation Bar */}
          <nav className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏥</span>
                  <h1 className="text-xl font-extrabold tracking-wide">MediConnect PRO</h1>
                </div>
                <div className="flex gap-6 text-sm font-semibold">
                  <Link to="/hospital" className="hover:text-blue-200 transition duration-300">Hospital Portal</Link>
                  <Link to="/chat" className="hover:text-blue-200 transition duration-300">AI Doctor</Link>
                  <Link to="/first-aid" className="hover:text-blue-200 transition duration-300">First Aid Library</Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content Area */}
          <div className="py-8">
            <Routes>
              {/* Default Home Redirects to Hospital Dashboard for Demo */}
              <Route path="/" element={
                <div className="text-center mt-20">
                  <h2 className="text-3xl font-bold text-gray-800">Welcome to MediConnect</h2>
                  <p className="text-gray-600 mt-2">Select a module from the navigation bar above.</p>
                </div>
              } />
              
              <Route path="/hospital" element={<HospitalDashboard />} />
              <Route path="/chat" element={<DiseaseBot />} />
              <Route path="/first-aid" element={<FirstAid />} />
            </Routes>
          </div>

        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

// ⚠️ THIS WAS MISSING IN YOUR CODE causing the "No export named default" error
export default App;