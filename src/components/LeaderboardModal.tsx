import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiTrophy, mdiStar, mdiArrowRight, mdiMedal } from '@mdi/js';
import { getScenarioLeaderboard } from '../lib/supabaseHelpers';

interface LeaderboardModalProps {
  scenarioId: number;
  rank: number;
  employeeId: string;
  elapsedTime: number;
  hint1Used: boolean;
  hint2Used: boolean;
  onNextScenario: () => void;
}

export default function LeaderboardModal({
  scenarioId,
  rank,
  employeeId,
  elapsedTime,
  hint1Used,
  hint2Used,
  onNextScenario,
}: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<Array<{
    rank: number;
    employeeId: string;
    employeeName: string;
    timeSeconds: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const data = await getScenarioLeaderboard(scenarioId);
      setLeaderboard(data);
      setIsLoading(false);
    }
    fetchLeaderboard();
  }, [scenarioId]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400 border-yellow-500'; // Gold
      case 2:
        return 'text-gray-300 border-gray-400'; // Silver
      case 3:
        return 'text-orange-400 border-orange-500'; // Bronze
      default:
        return 'text-gray-400 border-gray-500';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return mdiTrophy;
    }
    return mdiMedal;
  };

  const hint1Penalty = hint1Used ? 120 : 0;
  const hint2Penalty = hint2Used ? 180 : 0;
  const finalTime = elapsedTime + hint1Penalty + hint2Penalty;

  const isHighScore = rank === 1;
  const bgColor = isHighScore ? 'from-yellow-900 to-yellow-800' : 'from-green-900 to-green-800';
  const borderColor = isHighScore ? 'border-yellow-500' : 'border-green-600';
  const headerBg = isHighScore ? 'from-yellow-800 to-yellow-700' : 'from-green-800 to-green-700';
  const headerBorder = isHighScore ? 'border-yellow-500' : 'border-green-600';

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
      <div 
        className={`bg-gradient-to-br ${bgColor} rounded-3xl shadow-2xl border-2 ${borderColor} overflow-hidden flex flex-col relative`}
        style={{ width: '900px', height: '1400px', maxWidth: '100%', maxHeight: '100%' }}
      >
        {/* Confetti for high score */}
        {isHighScore && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  backgroundColor: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'][i % 5],
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Header */}
        <div className={`bg-gradient-to-r ${headerBg} p-12 border-b-2 ${headerBorder} text-center relative z-20`}>
          <Icon 
            path={isHighScore ? mdiStar : mdiTrophy} 
            size={4} 
            className={isHighScore ? 'text-yellow-300' : 'text-green-300'}
            style={isHighScore ? { 
              filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.8))',
            } : {}}
          />
          <h2 className="text-5xl font-bold text-white mb-4 mt-6">
            {isHighScore ? 'New High Score!' : 'You made it on the leaderboard!'}
          </h2>
          <p className={`text-3xl font-bold ${isHighScore ? 'text-yellow-300' : 'text-green-200'}`}>
            Rank #{rank}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-12 space-y-8 overflow-y-auto relative z-20">
          {/* Time Breakdown */}
          <div className={`bg-${isHighScore ? 'yellow' : 'green'}-800/30 rounded-2xl p-8 border border-${isHighScore ? 'yellow' : 'green'}-600 space-y-6`}>
            <h3 className="text-3xl font-bold text-white text-center mb-6">Your Time</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl text-white">Elapsed Time:</span>
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

              <div className={`border-t-2 border-${isHighScore ? 'yellow' : 'green'}-500 pt-4 mt-4`}>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-white">Final Time:</span>
                  <span className={`text-4xl font-bold ${isHighScore ? 'text-yellow-300' : 'text-white'}`}>
                    {formatTime(finalTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className={`bg-${isHighScore ? 'yellow' : 'green'}-800/30 rounded-2xl p-8 border border-${isHighScore ? 'yellow' : 'green'}-600`}>
            <h3 className="text-3xl font-bold text-white text-center mb-6">Top 5 Leaderboard</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-xl text-gray-300">Loading...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.employeeId === employeeId;
                  return (
                    <div
                      key={entry.rank}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        isCurrentUser
                          ? `bg-${isHighScore ? 'yellow' : 'green'}-700 border-2 ${getRankColor(entry.rank)} scale-105`
                          : 'bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Icon 
                          path={getRankIcon(entry.rank)} 
                          size={1.2} 
                          className={getRankColor(entry.rank).split(' ')[0]}
                        />
                        <div>
                          <div className="text-xl font-bold text-white">
                            #{entry.rank} {entry.employeeName}
                          </div>
                          {isCurrentUser && (
                            <div className={`text-sm ${isHighScore ? 'text-yellow-300' : 'text-green-300'}`}>
                              That's you!
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {formatTime(entry.timeSeconds)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-8 bg-${isHighScore ? 'yellow' : 'green'}-900/50 border-t-2 ${isHighScore ? 'border-yellow-500' : 'border-green-600'} relative z-20`}>
          <button
            onClick={onNextScenario}
            className="w-full relative group"
          >
            <div className={`absolute -inset-1 bg-gradient-to-r ${isHighScore ? 'from-yellow-600 to-orange-600' : 'from-green-600 to-emerald-600'} rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-200`}></div>
            <div className={`relative bg-gradient-to-r ${isHighScore ? 'from-yellow-600 to-orange-600' : 'from-green-600 to-emerald-600'} text-white font-bold py-8 rounded-2xl shadow-lg transform transition-all duration-150 active:scale-95 text-3xl flex items-center justify-center gap-4`}>
              Next Scenario
              <Icon path={mdiArrowRight} size={1.5} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}