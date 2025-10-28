import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';

interface TutorialBubbleProps {
  message: string;
  onDismiss: () => void;
  position?: 'top' | 'center' | 'bottom';
}

export default function TutorialBubble({ message, onDismiss, position = 'top' }: TutorialBubbleProps) {
  // Position styles based on prop
  const positionStyles = {
    top: 'top-[200px]',
    center: 'top-1/2 -translate-y-1/2',
    bottom: 'bottom-32',
  };

  return (
    <div className={`absolute left-1/2 -translate-x-1/2 ${positionStyles[position]} z-50 w-[80%] max-w-[900px]`}>
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-6 border-3 border-blue-400">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          aria-label="Dismiss"
        >
          <Icon path={mdiClose} size={1.6} color="white" />
        </button>

        {/* Message text */}
        <p className="text-white text-4xl leading-relaxed pr-8">
          {message}
        </p>
      </div>
    </div>
  );
}