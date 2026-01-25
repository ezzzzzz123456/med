import { useState } from 'react';
import axios from 'axios';

const DiseaseBot = () => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (symptoms.length < 10) return alert("Please be more descriptive (at least 10 characters).");
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:8000/api/ai/diagnose', { symptoms });
      setResult(res.data);
    } catch (err) {
      alert("AI Server Unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl mb-8">
        <h1 className="text-3xl font-extrabold mb-2">Medi-AI Symptom Analyzer</h1>
        <p className="text-blue-200">Describe your symptoms naturally, and our AI will assist you.</p>
        
        <textarea 
          className="w-full mt-6 p-4 rounded-xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
          rows="4"
          placeholder="e.g., I've been having sharp chest pain that radiates to my left arm..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        
        <button 
          onClick={analyze}
          disabled={loading}
          className="mt-4 bg-white text-blue-900 font-extrabold px-8 py-3 rounded-full hover:bg-blue-50 transition"
        >
          {loading ? "Analyzing..." : "Analyze Symptoms"}
        </button>
      </div>

      {result && (
        <div className="animate-fade-in">
          <div className={`p-6 rounded-2xl shadow-lg border-2 ${result.urgency_level === 'High' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
            <h3 className="text-2xl font-bold text-gray-800">Probable Condition: {result.probable_condition}</h3>
            <p className="text-sm text-gray-500 mt-1 italic">{result.medical_disclaimer}</p>
            
            <div className="mt-6 flex items-center justify-between border-b pb-4">
              <span className="text-gray-700 font-medium">Recommended Specialist:</span>
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-full font-bold">{result.specialist_required}</span>
            </div>

            <h4 className="mt-6 font-bold text-gray-700">Available Doctors:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {result.doctors_available.map((doc, idx) => (
                <div key={idx} className="bg-gray-50 border p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.experience}</p>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-green-700">
                    Book ({doc.availability})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseBot;