import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiArrowRight } from '@mdi/js';
import { getScenarioLeaderboard } from '../lib/supabaseHelpers';

interface NicelyDoneModalProps {
  scenarioId: number;
  elapsedTime: number;
  hint1Used: boolean;
  hint2Used: boolean;
  onNextScenario: () => void;
}

export default function NicelyDoneModal({
  scenarioId,
  elapsedTime,
  hint1Used,
  hint2Used,
  onNextScenario,
}: NicelyDoneModalProps) {
  const [topScore, setTopScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTopScore() {
      const leaderboard = await getScenarioLeaderboard(scenarioId);
      if (leaderboard.length > 0) {
        setTopScore(leaderboard[0].timeSeconds);
      }
      setIsLoading(false);
    }
    fetchTopScore();
  }, [scenarioId]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const hint1Penalty = hint1Used ? 120 : 0;
  const hint2Penalty = hint2Used ? 180 : 0;
  const finalTime = elapsedTime + hint1Penalty + hint2Penalty;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
      <div 
        className="bg-gradient-to-br from-green-900 to-green-800 rounded-3xl shadow-2xl border-2 border-green-600 overflow-hidden flex flex-col"
        style={{ width: '900px', height: '1400px', maxWidth: '100%', maxHeight: '100%' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 p-12 border-b-2 border-green-600 text-center">
          <Icon path={mdiCheckCircle} size={4} className="text-green-300 mx-auto mb-6" />
          <h2 className="text-5xl font-bold text-white mb-4">Nicely Done!</h2>
          <p className="text-2xl text-green-200">
            You completed the scenario successfully
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-12 space-y-8 overflow-y-auto">
          {/* Time Breakdown */}
          <div className="bg-green-800/30 rounded-2xl p-8 border border-green-600 space-y-6">
            <h3 className="text-3xl font-bold text-white text-center mb-6">Time Breakdown</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl text-green-100">Elapsed Time:</span>
                <span className="text-3xl font-bold text-white">{formatTime(elapsedTime)}</span>
              </div>

              {hint1Used && (
                <div className="flex justify-between items-center">
                  <span className="text-2xl text-red-300">Hint 1 Penalty:</span>
                  <span className="text-3xl font-bold text-red-400">+{formatTime(hint1Penalty)}</span>
                </div>
              )}

              {hint2Used && (
                <div className="flex justify-between items-center">
                  <span className="text-2xl text-red-300">Hint 2 Penalty:</span>
                  <span className="text-3xl font-bold text-red-400">+{formatTime(hint2Penalty)}</span>
                </div>
              )}

              <div className="border-t-2 border-green-600 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-green-100">Final Time:</span>
                  <span className="text-4xl font-bold text-white">{formatTime(finalTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Score Comparison */}
          {!isLoading && topScore !== null && (
            <div className="bg-green-800/30 rounded-2xl p-8 border border-green-600">
              <div className="text-center">
                <p className="text-xl text-green-200 mb-2">Current Top Score</p>
                <p className="text-4xl font-bold text-yellow-400">{formatTime(topScore)}</p>
                {finalTime < topScore && (
                  <p className="text-lg text-green-300 mt-4">🎉 You beat the top score! 🎉</p>
                )}
              </div>
            </div>
          )}

          {/* Not on Leaderboard Message */}
          <div className="bg-yellow-900/30 rounded-2xl p-8 border border-yellow-600">
            <p className="text-xl text-yellow-200 text-center">
              You didn't make it to the top 5 this time, but keep practicing to improve your time!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-green-900/50 border-t-2 border-green-600">
          <button
            onClick={onNextScenario}
            className="w-full relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
            <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-8 rounded-2xl shadow-lg transform transition-all duration-150 active:scale-95 text-3xl flex items-center justify-center gap-4">
              Next Scenario
              <Icon path={mdiArrowRight} size={1.5} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}