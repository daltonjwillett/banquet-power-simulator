import { useState, useEffect, useRef } from 'react';

interface StopwatchProps {
  isRunning: boolean;
  onTimeUpdate?: (seconds: number) => void;
}

export default function Stopwatch({ isRunning, onTimeUpdate }: StopwatchProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [penaltyPopup, _setPenaltyPopup] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pausedTimeRef = useRef(0);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Animation loop for smooth updates
  useEffect(() => {
    if (isRunning) {
      if (startTimeRef.current === null) {
        // First start
        startTimeRef.current = Date.now() - pausedTimeRef.current * 1000;
      } else {
        // Resuming from pause
        startTimeRef.current = Date.now() - pausedTimeRef.current * 1000;
      }

      const updateTimer = () => {
        if (startTimeRef.current !== null) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedSeconds(elapsed);
          pausedTimeRef.current = elapsed;
          
          if (onTimeUpdate) {
            onTimeUpdate(elapsed);
          }
        }
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      };

      animationFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      // Paused - cancel animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, onTimeUpdate]);

  // Public method to show penalty popup (will be called from parent)
  useEffect(() => {
    // This will be controlled by parent via a ref
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 text-white px-6 py-3 rounded-xl shadow-lg border border-gray-700">
      <div className="text-xs text-gray-400 uppercase tracking-wide">Timer</div>
      <div 
        className={`text-3xl font-bold font-mono transition-all duration-300 ${
          isRunning ? 'animate-pulse-once' : ''
        }`}
      >
        {formatTime(elapsedSeconds)}
      </div>

      {/* Penalty Popup */}
      {penaltyPopup && (
        <div 
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold animate-penalty-popup"
          style={{
            animation: 'penaltyPopup 2s ease-out forwards'
          }}
        >
          {penaltyPopup}
        </div>
      )}
    </div>
  );
}

// Export a function to show penalty popup
export function showPenaltyPopup(
  setPenaltyFn: React.Dispatch<React.SetStateAction<string | null>>,
  minutes: number
) {
  const penaltyText = `+${minutes}:00`;
  setPenaltyFn(penaltyText);
  
  setTimeout(() => {
    setPenaltyFn(null);
  }, 2000);
}