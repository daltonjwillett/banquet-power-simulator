import Icon from '@mdi/react';
import { mdiAlertCircle } from '@mdi/js';

interface TutorialFailedModalProps {
  scenarioId: number;
  onTryAgain: () => void;
}

export default function TutorialFailedModal({ scenarioId, onTryAgain }: TutorialFailedModalProps) {
  // Different messages for different tutorial scenarios
  const getMessage = () => {
    if (scenarioId === 1001) {
      return "Something went wrong. Keep trying to connect the toaster to the outlet.";
    } else if (scenarioId === 1002) {
      return "Something went wrong. Keep trying.";
    }
    // Default fallback (shouldn't happen in tutorial)
    return "Something went wrong. Keep trying.";
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 max-w-2xl w-full border-2 border-red-500">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
            <Icon path={mdiAlertCircle} size={3} color="#ef4444" />
          </div>
        </div>

        {/* Message */}
        <p className="text-white text-6xl text-center mb-8 leading-relaxed">
          {getMessage()}
        </p>

        {/* Try Again Button */}
        <button
          onClick={onTryAgain}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-3xl font-bold py-6 px-8 rounded-xl transition-all shadow-lg hover:shadow-blue-500/50"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}