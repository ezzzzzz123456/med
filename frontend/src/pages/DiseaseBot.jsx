import { useState } from 'react';
import axios from 'axios';

const DiseaseBot = () => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (symptoms.length < 5) return alert("Please describe symptoms in detail.");
    setLoading(true);
    try {
      // Connects to Python Backend on Port 8000
      const res = await axios.post('http://localhost:8000/api/ai/diagnose', { symptoms });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Could not connect to AI Brain. Is the Python Terminal running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl mb-8">
        <h1 className="text-3xl font-extrabold mb-2">Medi-AI Symptom Analyzer</h1>
        <p className="text-blue-200">Describe your symptoms naturally (e.g., "I have a sharp pain in my chest").</p>
        
        <textarea 
          className="w-full mt-6 p-4 rounded-xl text-gray-800 text-lg h-32"
          placeholder="Type symptoms here..."
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
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-indigo-100">
          <h3 className="text-2xl font-bold text-gray-800">Probable Condition: {result.probable_condition}</h3>
          
          <div className="mt-4 flex gap-4">
             <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold text-sm">Urgency: {result.urgency_level}</span>
             <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm">Specialist: {result.specialist_required}</span>
          </div>

          <h4 className="mt-6 font-bold text-gray-700">Recommended Doctors:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {result.doctors_available.map((doc, idx) => (
              <div key={idx} className="bg-gray-50 border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.availability}</p>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">Book</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseBot;