import { useState, useEffect } from 'react';
import TutorialBubble from './TutorialBubble';
import TutorialFailedModal from './TutorialFailedModal';
import TutorialSuccessModal from './TutorialSuccessModal';
import type { PlacedItem } from '../types';
import type { Cable } from '../types/cable';

interface TutorialManagerProps {
  currentScenarioId: number;
  placedAccessories: PlacedItem[];
  cables: Cable[];
  validationPassed: boolean;
  validationTriggered: boolean;
  onResetValidation: () => void;
  onNextScenario: () => void;
  onExitTutorial: () => void;
}

type TutorialStep = 
  | 'scenario_1001_connect'
  | 'scenario_1002_get_quadbox'
  | 'scenario_1002_place_quadbox'
  | 'scenario_1002_connect_all'
  | 'scenario_1003_connect_doghouse'
  | 'scenario_1003_use_hints'
  | 'complete';

export default function TutorialManager({
  currentScenarioId,
  placedAccessories,
  cables,
  validationPassed,
  validationTriggered,
  onResetValidation,
  onNextScenario,
  onExitTutorial,
}: TutorialManagerProps) {
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>('scenario_1001_connect');
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  // Initialize tutorial step based on scenario
  useEffect(() => {
    if (currentScenarioId === 1001) {
      setTutorialStep('scenario_1001_connect');
    } else if (currentScenarioId === 1002) {
      setTutorialStep('scenario_1002_get_quadbox');
    } else if (currentScenarioId === 1003) {
      setTutorialStep('scenario_1003_connect_doghouse');
    }
    setBubbleDismissed(false);
  }, [currentScenarioId]);

  // Monitor for quad box placement in scenario 1002
  useEffect(() => {
    if (currentScenarioId === 1002 && tutorialStep === 'scenario_1002_get_quadbox') {
      const hasQuadBox = placedAccessories.some(item => item.itemType === 'quad-box');
      if (hasQuadBox) {
        setTutorialStep('scenario_1002_place_quadbox');
        setBubbleDismissed(false);
      }
    }
  }, [placedAccessories, currentScenarioId, tutorialStep]);

  // Monitor for doghouse connection in scenario 1003
  useEffect(() => {
    if (currentScenarioId === 1003 && tutorialStep === 'scenario_1003_connect_doghouse') {
      // Check if there's a valid doghouse to L21-30 outlet connection
      const hasDoghouse = placedAccessories.some(item => item.itemType === 'doghouse');

      if (hasDoghouse) {
        setTutorialStep('scenario_1003_use_hints');
        setBubbleDismissed(false);
      }
    }
  }, [cables, placedAccessories, currentScenarioId, tutorialStep]);

  // Handle validation results
  useEffect(() => {
    if (validationTriggered) {
      if (validationPassed) {
        setShowSuccessModal(true);
      } else {
        setShowFailedModal(true);
      }
    }
  }, [validationTriggered, validationPassed]);

  // Get current bubble message
  const getBubbleMessage = (): string | null => {
    if (bubbleDismissed) return null;

    switch (tutorialStep) {
      case 'scenario_1001_connect':
        return "All banquet items have power cords that can be dragged to an outlet. These are the grey circles. When a cable is selected, outlets will also have a circle connector indicating they are available. Connect the toaster to the outlet, then click submit.";
      
      case 'scenario_1002_get_quadbox':
        return "Sometimes you will need extra gear from the Shop to power everything up. Go to the shop and click the quad box. Then click anywhere on screen to place it down.";
      
      case 'scenario_1002_place_quadbox':
        return "Now we need to plug the quad box in. Click the Edison button in the bottom left to run an Edison cable. Having Edison selected will allow you to plug directly into any Edison outlets. First click the outlet you want to use. Then touch and drag it from there. For even easier setting, you can also click and drag immediately on the plug of the quad box. Go ahead and practice, then plug in all the banquet items. Submit when finished.";
      
      case 'scenario_1003_connect_doghouse':
        return "Sometimes you will need to use an L21-30 outlet. You can find a doghouse in the shop and then use a flatwire cable to connect it to the outlet. Flatwire cables are green so you can easily tell them apart. You can delete items and cables by selecting them and clicknig the trashbin on the bottom right.";
      
      case 'scenario_1003_use_hints':
        return "If you are ever struggling, you may use two hints! The hint button is located in the bottom right corner. The first hint will reveal how much power an item requires. The second hint will reveal how much power you have remaining at each circuit. Beware, using hints will penalize your final time!";
      
      default:
        return null;
    }
  };

  const handleBubbleDismiss = () => {
    setBubbleDismissed(true);
  };

  const handleFailedTryAgain = () => {
    setShowFailedModal(false);
    onResetValidation();
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    onResetValidation();
    
    if (currentScenarioId === 1003) {
      // Tutorial complete - exit to regular game
      onExitTutorial();
    } else {
      // Move to next tutorial scenario
      onNextScenario();
    }
  };

  const bubbleMessage = getBubbleMessage();

  return (
    <>
      {/* Tutorial Bubble */}
      {bubbleMessage && (
        <TutorialBubble
          message={bubbleMessage}
          onDismiss={handleBubbleDismiss}
          position="top"
        />
      )}

      {/* Tutorial Failed Modal */}
      {showFailedModal && (
        <TutorialFailedModal
          scenarioId={currentScenarioId}
          onTryAgain={handleFailedTryAgain}
        />
      )}

      {/* Tutorial Success Modal */}
      {showSuccessModal && (
        <TutorialSuccessModal
          scenarioId={currentScenarioId}
          onContinue={handleSuccessContinue}
        />
      )}
    </>
  );
}