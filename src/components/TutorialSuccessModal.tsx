import Icon from '@mdi/react';
import { mdiCheckCircle } from '@mdi/js';

interface TutorialSuccessModalProps {
  scenarioId: number;
  onContinue: () => void;
}

export default function TutorialSuccessModal({ scenarioId, onContinue }: TutorialSuccessModalProps) {
  // Different messages for different tutorial scenarios
  const getMessage = () => {
    if (scenarioId === 1001) {
      return "Great job! After successfully completing a banquet power order, your time will be shown on this page. The top 5 times for every scenario will be listed for everyone to see.";
    } else if (scenarioId === 1002) {
      return "Great job! Let's continue.";
    } else if (scenarioId === 1003) {
      return "Great job! You have completed the tutorial.";
    }
    return "Great job!";
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 max-w-3xl w-full border-2 border-green-500">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
            <Icon path={mdiCheckCircle} size={3} color="#22c55e" />
          </div>
        </div>

        {/* Message */}
        <p className="text-white text-5xl text-center mb-8 leading-relaxed">
          {getMessage()}
        </p>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-3xl font-bold py-8 px-8 rounded-xl transition-all shadow-lg hover:shadow-green-500/50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}