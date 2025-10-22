import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiTrophy, mdiChevronDown, mdiChevronUp, mdiMedal } from '@mdi/js';
import type { Scenario } from '../types';
import { getScenarioLeaderboard, getUserBestTime } from '../lib/supabaseHelpers';

interface StartModalProps {
  scenario: Scenario;
  employeeId: string;
  onStart: () => void;
}

export default function StartModal({ scenario, employeeId, onStart }: StartModalProps) {
  const [showEquipment, setShowEquipment] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Array<{
    rank: number;
    employeeId: string;
    employeeName: string;
    timeSeconds: number;
  }>>([]);
  const [userBest, setUserBest] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      setIsLoading(true);
      
      // Fetch top 5 leaderboard
      const leaderboardData = await getScenarioLeaderboard(scenario.id);
      setLeaderboard(leaderboardData);

      // Fetch user's best time
      const bestTime = await getUserBestTime(employeeId, scenario.id);
      setUserBest(bestTime);
      
      setIsLoading(false);
    }

    fetchScores();
  }, [scenario.id, employeeId]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400'; // Gold
      case 2:
        return 'text-gray-300'; // Silver
      case 3:
        return 'text-orange-400'; // Bronze
      default:
        return 'text-gray-400';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return mdiTrophy;
    }
    return mdiMedal;
  };

  // Group equipment by type and count
  const equipmentCounts = scenario.equipment.reduce((acc, item) => {
    const key = item.itemType;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
      <div 
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border-2 border-gray-700 overflow-hidden flex flex-col"
        style={{ width: '900px', height: '1400px', maxWidth: '100%', maxHeight: '100%' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 border-b-2 border-gray-700">
          <h2 className="text-5xl font-bold text-white text-center mb-4">
            Scenario {scenario.id}
          </h2>
          <p className="text-2xl text-gray-300 text-center mb-6">{scenario.name}</p>
          
          {/* Difficulty Badge */}
          <div className="flex justify-center">
            <span className={`${getDifficultyColor(scenario.difficulty)} text-white px-6 py-2 rounded-full text-lg font-semibold uppercase`}>
              {scenario.difficulty}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Equipment Info */}
          <div className="bg-gray-700/50 rounded-2xl p-6 border border-gray-600">
            <p className="text-2xl text-white font-semibold text-center">
              Power up the {scenario.equipment.length} Banquet Items
            </p>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-gray-700/50 rounded-2xl p-6 border border-gray-600">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Icon path={mdiTrophy} size={1.5} className="text-yellow-500" />
              <h3 className="text-2xl font-bold text-white">Top 5 Leaderboard</h3>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-xl text-gray-400">Loading scores...</p>
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      entry.employeeId === employeeId
                        ? 'bg-blue-900/30 border-2 border-blue-500'
                        : 'bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon 
                        path={getRankIcon(entry.rank)} 
                        size={1.2} 
                        className={getRankColor(entry.rank)}
                      />
                      <div>
                        <div className="text-xl font-bold text-white">
                          #{entry.rank} {entry.employeeName}
                        </div>
                        {entry.employeeId === employeeId && (
                          <div className="text-sm text-blue-400">Your best time</div>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {formatTime(entry.timeSeconds)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xl text-gray-400">No times recorded yet</p>
                <p className="text-lg text-gray-500 mt-2">Be the first to complete this scenario!</p>
              </div>
            )}

            {/* User's best if not in top 5 */}
            {userBest !== null && !leaderboard.some(entry => entry.employeeId === employeeId) && (
              <div className="mt-6 pt-6 border-t border-gray-600">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <span className="text-xl text-gray-300">Your Best Time:</span>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatTime(userBest)}
                  </div>
                </div>
              </div>
            )}

            {/* First time message */}
            {userBest === null && (
              <div className="mt-6 pt-6 border-t border-gray-600">
                <div className="text-center p-4 bg-blue-900/20 rounded-xl border border-blue-700">
                  <p className="text-lg text-blue-300">
                    This will be your first attempt at this scenario!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Equipment List Toggle */}
          <button
            onClick={() => setShowEquipment(!showEquipment)}
            className="w-full bg-gray-700/50 hover:bg-gray-700 rounded-2xl p-6 border border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl text-white font-semibold">
                {showEquipment ? 'Hide' : 'View'} Power Request
              </span>
              <Icon 
                path={showEquipment ? mdiChevronUp : mdiChevronDown} 
                size={1.5} 
                className="text-gray-400"
              />
            </div>
          </button>

          {/* Equipment List (Collapsible) */}
          {showEquipment && (
            <div className="bg-gray-700/30 rounded-2xl p-8 border border-gray-600 space-y-4">
              {Object.entries(equipmentCounts)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center py-2">
                    <span className="text-2xl text-gray-200 capitalize font-medium">
                      {type.replace(/-/g, ' ')}
                    </span>
                    <span className="text-3xl font-bold text-white">
                      {count}x
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer with Start Button */}
        <div className="p-8 bg-gray-900/50 border-t-2 border-gray-700">
          <button
            onClick={onStart}
            className="w-full relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#b55609] to-[#d67a2e] rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
            <div className="relative bg-gradient-to-r from-[#b55609] to-[#d67a2e] text-white font-bold py-8 rounded-2xl shadow-lg transform transition-all duration-150 active:scale-95 text-4xl">
              START
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}