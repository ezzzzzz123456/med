import { useState } from 'react';

const DonationCheckModal = ({ isOpen, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ alcohol: false, tattoo: false, sick: false });

  // If they answer "Yes" to any restriction, they are ineligible.
  const checkEligibility = () => {
    if (answers.alcohol || answers.tattoo || answers.sick) {
      alert("System: You are currently ineligible to donate. Please rest and try again in 48 hours.");
      onClose();
    } else {
      onConfirm(); // Trigger the API to match them with a hospital
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
        <h3 className="text-2xl font-bold text-red-600 mb-4">Safety Protocol</h3>
        
        {step === 1 && (
          <div>
            <p className="text-gray-700 mb-4 font-medium">Have you consumed alcohol in the last 24 hours?</p>
            <div className="flex gap-4">
              <button onClick={() => { setAnswers({...answers, alcohol: true}); setStep(2); }} className="w-full bg-gray-200 hover:bg-red-100 py-2 rounded font-bold">Yes</button>
              <button onClick={() => setStep(2)} className="w-full bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700">No</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-gray-700 mb-4 font-medium">Have you had a tattoo or major surgery in the last 6 months?</p>
            <div className="flex gap-4">
              <button onClick={() => { setAnswers({...answers, tattoo: true}); setStep(3); }} className="w-full bg-gray-200 py-2 rounded font-bold">Yes</button>
              <button onClick={() => setStep(3)} className="w-full bg-red-600 text-white py-2 rounded font-bold">No</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-gray-700 mb-4 font-medium">Do you currently have a fever, cough, or infectious disease?</p>
            <div className="flex gap-4">
              <button onClick={() => { setAnswers({...answers, sick: true}); checkEligibility(); }} className="w-full bg-gray-200 py-2 rounded font-bold">Yes</button>
              <button onClick={checkEligibility} className="w-full bg-red-600 text-white py-2 rounded font-bold shadow-lg">No, I am fit!</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationCheckModal;