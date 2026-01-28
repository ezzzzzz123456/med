import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaUser, FaStethoscope, FaHospital, FaPhoneAlt, FaExclamationTriangle, FaArrowRight, FaCheckCircle, FaHeartbeat } from 'react-icons/fa';

const DiseaseChat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello, I am your MediSense Assistant. Please describe what symptoms you are experiencing today so we can begin the triage process.' }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, session_id: sessionId })
      });
      
      const data = await res.json();

      if (!data || data.error) {
        setMessages(prev => [...prev, { role: 'ai', text: "⚠️ I encountered a connection issue. Please ensure the backend is running and try again." }]);
        return;
      }

      setSessionId(data.session_id);

      if (data.is_emergency) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply, emergency: true }]);
      } else if (data.final_analysis) {
        setAnalysis(data.final_analysis);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "❌ Unable to reach MediSense Brain. Check if main.py is running." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 font-sans overflow-hidden">
      
      {/* --- SIDEBAR: PROGRESS & INFO --- */}
      <div className="w-80 bg-white border-r border-slate-200 p-8 hidden lg:flex flex-col shadow-sm">
        <div className="flex items-center gap-3 text-cyan-700 font-bold text-2xl mb-12">
          <FaHeartbeat className="animate-pulse" />
          <span>MediSense</span>
        </div>

        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Chat Progress</h4>
            <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500" 
                        style={{ width: `${Math.min((messages.length / 12) * 100, 100)}%` }}
                    ></div>
                </div>
                <span className="text-xs font-bold text-slate-500">{messages.length} turns</span>
            </div>
          </div>

          <div className="p-5 bg-cyan-50 rounded-2xl border border-cyan-100">
            <h5 className="text-cyan-800 font-bold text-sm mb-2 flex items-center gap-2">
                <FaStethoscope /> Smart Triage
            </h5>
            <p className="text-cyan-600 text-xs leading-relaxed">
                I am analyzing your symptoms to recommend the right specialist and check for emergency signs.
            </p>
          </div>
        </div>

        <div className="mt-auto p-4 bg-slate-900 rounded-2xl text-white">
            <p className="text-[10px] font-medium opacity-70 leading-normal">
                Emergency? If you feel life-threatening symptoms, bypass this chat and call emergency services immediately.
            </p>
        </div>
      </div>

      {/* --- MAIN CHAT INTERFACE --- */}
      <div className="flex-1 flex flex-col h-full bg-white md:bg-slate-50 relative">
        
        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-300`}>
              <div className={`max-w-[85%] md:max-w-[70%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.role === 'ai' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                  {m.role === 'ai' ? <FaRobot /> : <FaUser />}
                </div>
                <div className={`relative p-5 rounded-2xl shadow-sm leading-relaxed ${
                    m.emergency 
                    ? 'bg-red-50 border-2 border-red-200 text-red-700 font-medium' 
                    : m.role === 'ai' 
                        ? 'bg-white border border-slate-100 text-slate-700' 
                        : 'bg-cyan-700 border-cyan-600 text-white shadow-cyan-200'
                }`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-cyan-600 font-bold text-sm animate-pulse px-14">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              MediSense is analyzing symptoms...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* --- ANALYSIS REPORT OVERLAY --- */}
        {analysis && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-8 text-white text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  <FaCheckCircle />
                </div>
                <h2 className="text-3xl font-black mb-1 tracking-tight">Triage Result</h2>
                <p className="text-cyan-100 text-sm font-medium">Based on 7-8 points of analysis</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Severity</span>
                    <span className={`px-4 py-1 rounded-full text-xs font-bold ${
                        analysis.severity.toLowerCase().includes('severe') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                        {analysis.severity}
                    </span>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Likely Condition(s)</label>
                  <div className="flex flex-wrap gap-2">
                    {analysis.possible_conditions.map((c, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold">{c}</span>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-cyan-50 rounded-2xl border border-cyan-100 flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest block mb-1">Recommended Specialist</label>
                    <p className="font-black text-cyan-900 text-xl">{analysis.recommended_specialist}</p>
                  </div>
                  <FaArrowRight className="text-cyan-300 text-2xl" />
                </div>

                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                   {analysis.disclaimer}
                </p>

                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-black transition-all active:scale-[0.98]"
                >
                  Start New Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Bar */}
        {!analysis && (
          <div className="p-4 md:p-8 bg-white border-t border-slate-100">
            <div className="max-w-4xl mx-auto relative group">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ex: I have a dull ache in my left arm and jaw..."
                className="w-full bg-slate-100 border-2 border-transparent rounded-3xl pl-8 pr-32 py-5 focus:bg-white focus:border-cyan-500 outline-none transition-all shadow-inner text-slate-700 font-medium"
              />
              <button 
                onClick={handleSend} 
                className="absolute right-3 top-3 bottom-3 bg-cyan-600 text-white px-8 rounded-2xl font-black text-sm shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-all flex items-center gap-2"
              >
                ASK <FaArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseChat;