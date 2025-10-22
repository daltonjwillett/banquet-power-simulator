import { useState } from 'react';

interface FailedModalProps {
  onKeepTrying: () => void;
  onNextScenario: () => void;
}

export default function FailedModal({ onKeepTrying, onNextScenario }: FailedModalProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    // Minimized state - small bar at bottom covering shop and toolbar
    return (
      <div className="absolute bottom-0 left-0 right-0 z-50 h-[840px] flex flex-col z-65">
        {/* Transparent spacer to allow viewing the canvas */}
        <div className="flex-1 pointer-events-none" />
        
        {/* Back to Results bar */}
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full h-[150px] bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-bold text-3xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 z-65"
        >
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
          </svg>
          Back to Results
        </button>
      </div>
    );
  }

  // Full modal state
  return (
    <div className="absolute inset-0 flex items-center justify-center z-65">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div 
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl p-12 w-[900px] h-[800px] flex flex-col"
        style={{
          border: '3px solid transparent',
          backgroundImage: 'linear-gradient(to bottom right, #1f2937, #111827, #1f2937), linear-gradient(135deg, #dc2626, #ef4444, #dc2626)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <svg className="w-32 h-32 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">
            Something went wrong!
          </h1>
          <p className="text-3xl text-gray-300">
            Some equipment is not properly connected or overloaded
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Buttons */}
        <div className="space-y-4">
          {/* View Mistakes Button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold py-8 px-12 rounded-2xl shadow-lg text-3xl transition-all duration-150 active:scale-95 flex items-center justify-center gap-4"
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Mistakes
          </button>

          {/* Keep Trying Button */}
          <button
            onClick={onKeepTrying}
            className="w-full relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl blur opacity-25 transition duration-200"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-8 px-12 rounded-2xl shadow-lg text-3xl transition-all duration-150 active:scale-95">
              Keep Trying
            </div>
          </button>

          {/* Next Scenario Button */}
          <button
            onClick={onNextScenario}
            className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold py-8 px-12 rounded-2xl shadow-lg text-3xl transition-all duration-150 active:scale-95"
          >
            Next Scenario
          </button>
        </div>
      </div>
    </div>
  );
}