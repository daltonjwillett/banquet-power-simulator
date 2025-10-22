import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiClose, mdiLockOutline } from '@mdi/js';

interface AdminPinModalProps {
  onCorrectPin: () => void;
  onClose: () => void;
}

export default function AdminPinModal({ onCorrectPin, onClose }: AdminPinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handlePinChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setPin(numericValue);
    setError(false);
  };

  const handleSubmit = () => {
    if (pin === '0606') {
      onCorrectPin();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-gray-800 w-full max-w-md p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Icon path={mdiClose} size={1} className="text-gray-400" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Icon path={mdiLockOutline} size={1.5} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
          <p className="text-gray-400 text-center">Enter PIN to continue</p>
        </div>

        {/* PIN Input */}
        <div className="mb-6">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => handlePinChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter 4-digit PIN"
            autoFocus
            className={`w-full px-4 py-3 bg-black/40 border-2 ${
              error ? 'border-red-500' : 'border-gray-700'
            } rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500 transition-colors`}
          />
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">Incorrect PIN. Please try again.</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={pin.length !== 4}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:opacity-50"
        >
          Unlock Admin Panel
        </button>
      </div>
    </div>
  );
}