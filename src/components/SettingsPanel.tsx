import { useState, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiAccount, mdiLogout, mdiClose } from '@mdi/js';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userName: string;
  employeeId: string;
  onAdminUnlock: () => void;
  nodeSize: 'small' | 'large';
  onNodeSizeChange: (size: 'small' | 'large') => void;
  onReplayTutorial: () => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  onLogout,
  userName,
  employeeId,
  onAdminUnlock,
  nodeSize,
  onNodeSizeChange,
  onReplayTutorial,
}: SettingsPanelProps) {
  const [savedClickCount, setSavedClickCount] = useState(0);
  const clickTimeoutRef = useRef<number | null>(null);

  if (!isOpen) return null;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out? Any unsaved progress will be lost.')) {
      onLogout();
    }
  };

  const handleSavedClick = () => {
    // Increment click count
    setSavedClickCount(prev => prev + 1);

    // Clear existing timeout
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
    }

    // Check if we've reached 4 clicks
    if (savedClickCount + 1 >= 4) {
      // Unlock admin - clicking "Settings" header will now trigger admin
      onAdminUnlock();
      setSavedClickCount(0);
    } else {
      // Reset counter after 2 seconds of no clicks
      clickTimeoutRef.current = window.setTimeout(() => {
        setSavedClickCount(0);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4">
      <div 
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col"
        style={{ width: '900px', height: '1400px', maxWidth: '100%', maxHeight: '100%' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
          <h2 className="text-4xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-3 hover:bg-gray-700 rounded-lg"
          >
            <Icon path={mdiClose} size={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-12 space-y-12 overflow-y-auto">
          {/* User Info Section */}
          <div className="bg-gray-700/50 rounded-2xl p-8 border border-gray-600">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#b55609] to-[#d67a2e] flex items-center justify-center shadow-lg">
                <Icon path={mdiAccount} size={3} className="text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-semibold text-white mb-2">{userName}</h3>
                <p className="text-xl text-gray-400">{employeeId}</p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-600">
              <p className="text-lg text-gray-400">
                Logged in and ready to train!
              </p>
            </div>
          </div>

          {/* Node Size Setting */}
          <div className="bg-gray-700/30 rounded-2xl p-8 border border-gray-600">
            <h3 className="text-2xl font-semibold text-white mb-6">Node Size</h3>
            <p className="text-base text-gray-400 mb-6">
              Adjust the size of connection nodes on the canvas
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => onNodeSizeChange('small')}
                className={`flex-1 px-6 py-5 rounded-xl text-lg font-semibold transition-all ${
                  nodeSize === 'small'
                    ? 'bg-gradient-to-r from-[#b55609] to-[#d67a2e] text-white shadow-lg shadow-orange-500/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Small
              </button>
              
              <button
                onClick={() => onNodeSizeChange('large')}
                className={`flex-1 px-6 py-5 rounded-xl text-lg font-semibold transition-all ${
                  nodeSize === 'large'
                    ? 'bg-gradient-to-r from-[#b55609] to-[#d67a2e] text-white shadow-lg shadow-orange-500/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Large
              </button>
            </div>
          </div>

          {/* Replay Tutorial Section */}
          <div className="bg-gray-700/30 rounded-2xl p-8 border border-gray-600">
            <h3 className="text-2xl font-semibold text-white mb-4">Tutorial</h3>
            <p className="text-base text-gray-400 mb-6">
              Replay the tutorial to refresh your skills and learn the basics again.
            </p>
            
            <button
              onClick={onReplayTutorial}
              className="w-full px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 active:scale-95 transition-all shadow-lg hover:shadow-blue-500/30"
            >
              Replay Tutorial
            </button>
          </div>

          {/* App Info 
          <div className="bg-gray-700/30 rounded-2xl p-8 border border-gray-600">
            <h3 className="text-2xl font-semibold text-white mb-4">About</h3>
            <p className="text-lg text-gray-400 mb-3">
              <strong className="text-white">Banquet Power Simulator</strong>
            </p>
            <p className="text-base text-gray-400">
              Train and compete to be the fastest and most accurate power setter in the department.
            </p>
          </div> */}

          {/* Spacer to push logout to bottom */}
          <div className="flex-1"></div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-4 px-8 py-6 bg-gradient-to-r from-red-600 to-red-500 text-white text-2xl font-semibold rounded-2xl shadow-lg hover:shadow-red-500/50 active:scale-95 transition-all"
          >
            <Icon path={mdiLogout} size={1.5} />
            Log Out
          </button>

          {/* Info Text */}
          <p className="text-base text-center text-gray-400 px-4">
            Logging out will return you to the login screen. Your progress and leaderboard times are <span onClick={handleSavedClick} className="cursor-default select-none">saved</span>.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-900/50 px-12 py-8 border-t border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-8 py-5 bg-gray-700 text-white text-xl font-semibold rounded-xl hover:bg-gray-600 active:scale-95 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}