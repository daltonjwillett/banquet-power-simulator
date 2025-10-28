import { useState, useEffect, useRef, useMemo } from 'react';
import GameCanvas from './components/GameCanvas';
import ShopInventory from './components/ShopInventory';
import StartModal from './components/StartModal';
import Stopwatch from './components/Stopwatch';
import ValidationOverlay from './components/ValidationOverlay';
import FailedModal from './components/FailedModal';
import NicelyDoneModal from './components/NicelyDoneModal';
import LeaderboardModal from './components/LeaderboardModal';
import AdminPinModal from './components/AdminPinModal';
import AdminPanel from './components/AdminPanel';
import TutorialManager from './components/TutorialManager';
import { getScenarioById } from './data/scenarios';
import { getTutorialScenarioById } from './data/tutorialScenarios';
import { ItemType } from './types';
import type { PlacedItem } from './types';
import type { Cable, DraggingCable } from './types/cable';
import { BanquetPowerEngine } from './engine/GameEngine';
import type { DetailedValidationResult } from './engine/GameEngine';
import { calculateOutletUsage } from './utils/ampCalculator';
import EmployeeLogin from './components/EmployeeLogin';
import SettingsPanel from './components/SettingsPanel';
import { 
  submitAttempt, 
  getUserRank, 
  updateLastThreeScenarios,
  getRandomAvailableScenario 
} from './lib/supabaseHelpers';
import { 
  hasTutorialCompleted, 
  markTutorialCompleted,
  resetTutorialStatus 
} from './lib/tutorialHelpers';
import { getNextTutorialScenario, getFirstTutorialScenario } from './utils/tutorialUtils';
import { 
  generateCableId, 
  calculateCablePath, 
  getCableVisualProps,
  createNodesFromPlacedItems,
} from './utils/cableHelpers';

interface UserSession {
  employeeId: string;
  userName: string;
}

// Modal types
type ModalType = 'none' | 'failed' | 'nicely-done' | 'leaderboard';

function App() {
  // User session state
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [_isCheckingSession, setIsCheckingSession] = useState(true);

  // Admin state
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  // Game state
  const [placedAccessories, setPlacedAccessories] = useState<PlacedItem[]>([]);
  const [cables, setCables] = useState<Cable[]>([]);
  const [draggingCable, setDraggingCable] = useState<DraggingCable | null>(null);
  const [selectedCableType, setSelectedCableType] = useState<'edison' | 'flat-wire' | null>(null);
  const [selectedShopItem, setSelectedShopItem] = useState<ItemType | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [nextItemId, setNextItemId] = useState(1);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPanPosition = useRef({ x: 0, y: 0 });
  
  const [showStartModal, setShowStartModal] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nodesHidden, setNodesHidden] = useState(false);
  const [nodeSize, setNodeSize] = useState<'small' | 'large'>('large');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  
  // Hint penalties
  const [hint1Used, setHint1Used] = useState(false);
  const [hint2Used, setHint2Used] = useState(false);
  const [penaltyPopup, setPenaltyPopup] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tutorial state
  const [inTutorial, setInTutorial] = useState(false);
  const [tutorialValidationTriggered, setTutorialValidationTriggered] = useState(false);

  const [currentScenarioId, setCurrentScenarioId] = useState(() => {
    // Start with random scenario (1-50)
    return Math.floor(Math.random() * 50) + 1;
  });
  
  // Load scenario based on tutorial state
  const currentScenario = inTutorial 
    ? getTutorialScenarioById(currentScenarioId)
    : getScenarioById(currentScenarioId);

  // Hint active states (for display logic)
  const hint2Active = hint2Used;

  // Validation state
  const [showValidationOverlay, setShowValidationOverlay] = useState(false);
  const [validationResult, setValidationResult] = useState<DetailedValidationResult | null>(null);
  const [currentModal, setCurrentModal] = useState<ModalType>('none');
  const [userRank, setUserRank] = useState<number | null>(null);

  // Game engine instance
  const engineRef = useRef<BanquetPowerEngine>(new BanquetPowerEngine());

  // Check for existing session on mount
  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employee_id');
    const storedName = localStorage.getItem('employee_name');
    
    if (storedEmployeeId && storedName) {
      setUserSession({
        employeeId: storedEmployeeId,
        userName: storedName
      });
    }
    
    setIsCheckingSession(false);
  }, []);

  const handleLoginSuccess = async (employeeId: string, userName: string) => {
    setUserSession({ employeeId, userName });
    
    // Check if user has completed tutorial
    const tutorialComplete = await hasTutorialCompleted(employeeId);
    if (!tutorialComplete) {
      // Start tutorial
      setInTutorial(true);
      setCurrentScenarioId(getFirstTutorialScenario());
      setShowStartModal(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employee_id');
    localStorage.removeItem('employee_name');
    setUserSession(null);
    
    // Reset game state
    setShowStartModal(true);
    setGameStarted(false);
    setStopwatchRunning(false);
    setElapsedTime(0);
    setHint1Used(false);
    setHint2Used(false);
    setPlacedAccessories([]);
    setCables([]);
    setDraggingCable(null);
    setSelectedCableType(null);
    setCurrentScenarioId(1);
    setSettingsOpen(false);
  };

  const handleAdminUnlock = () => {
    setAdminUnlocked(true);
    setSettingsOpen(false);
    setShowAdminPin(true);
  };

  const handleAdminPinSuccess = () => {
    setShowAdminPin(false);
    setShowAdminPanel(true);
    setAdminUnlocked(false);
  };

  const handleAdminPinClose = () => {
    setShowAdminPin(false);
    setAdminUnlocked(false);
  };

  const handleReturnToGame = () => {
    setShowAdminPanel(false);
  };

  const handleSettingsToggle = () => {
    // If admin is unlocked and settings is closing, check if user clicked "Settings" header
    if (adminUnlocked && !settingsOpen) {
      // This shouldn't happen because admin unlock opens PIN directly
      return;
    }
    setSettingsOpen(!settingsOpen);
  };

  const handleSelectionChange = (itemId: string | null, cableId: string | null) => {
  setSelectedItemId(itemId);
  setSelectedCableId(cableId);
};

  const handleTrashBinClick = () => {
    console.log('Trash bin clicked in App.tsx!');
    console.log('selectedCableId:', selectedCableId);
    console.log('selectedItemId:', selectedItemId);
    
    if (selectedCableId) {
      console.log('Removing cable:', selectedCableId);
      handleCableRemove(selectedCableId);
      setSelectedCableId(null);
    } else if (selectedItemId) {
      // Check if it's an accessory (not locked)
      const item = placedAccessories.find(i => i.id === selectedItemId);
      console.log('Found accessory:', item);
      if (item) {
        console.log('Removing accessory:', selectedItemId);
        handleAccessoryRemove(selectedItemId);
        setSelectedItemId(null);
      } else {
        console.log('Item is equipment (locked) or not found');
      }
    } else {
      console.log('Nothing selected to remove');
    }
  };

  // Calculate outlet usage for Hint 2 (memoized for performance)
  const outletUsage = useMemo(() => {
    if (!hint2Active || !currentScenario) return new Map();
    
    // Include doghouses from placedAccessories as they can be outlets too
    const allOutlets = [
      ...currentScenario.outlets,
      ...placedAccessories.filter(item => item.itemType === ItemType.DOGHOUSE)
    ];
    
    return calculateOutletUsage(
      allOutlets,
      currentScenario.equipment,
      placedAccessories,
      cables
    );
  }, [hint2Active, placedAccessories, cables, currentScenario]);

  // Dynamic canvas dimensions based on viewport aspect ratio
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1080, height: 1920 });

  // Calculate scale and canvas dimensions to fit the viewport with aspect ratio constraints
  useEffect(() => {
    const calculateScaleAndDimensions = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const viewportAspect = viewportWidth / viewportHeight;

      // Define aspect ratio constraints
      const minAspect = 9 / 16;  // 0.5625 - narrowest (mobile portrait)
      const maxAspect = 3 / 4;   // 0.75 - widest (tablet)

      // Clamp viewport aspect ratio to our constraints
      const clampedAspect = Math.max(minAspect, Math.min(maxAspect, viewportAspect));

      // Fixed design height
      const designHeight = 1920;
      
      // Calculate design width based on clamped aspect ratio
      const designWidth = Math.round(designHeight * clampedAspect);

      // Calculate scale to fit viewport
      const scaleX = viewportWidth / designWidth;
      const scaleY = viewportHeight / designHeight;
      const newScale = Math.min(scaleX, scaleY, 1); // Never scale above 1:1

      setCanvasDimensions({ width: designWidth, height: designHeight });
      setScale(newScale);
    };

    calculateScaleAndDimensions();
    window.addEventListener('resize', calculateScaleAndDimensions);
    return () => window.removeEventListener('resize', calculateScaleAndDimensions);
  }, []);

  // Pause stopwatch when settings open
  useEffect(() => {
    if (settingsOpen && stopwatchRunning) {
      setStopwatchRunning(false);
    } else if (!settingsOpen && gameStarted && !showStartModal && !showValidationOverlay) {
      setStopwatchRunning(true);
    }
  }, [settingsOpen, stopwatchRunning, gameStarted, showStartModal, showValidationOverlay]);

  // Initialize engine with scenario items
  useEffect(() => {
    // Reinitialize engine to clear any previous scenario items
    engineRef.current = new BanquetPowerEngine();
    const engine = engineRef.current;
    
    if (currentScenario) {
      console.log('Initializing engine for scenario:', currentScenarioId);
      currentScenario.outlets.forEach((outlet: PlacedItem) => {
        engine.addItem(outlet);
      });
      
      currentScenario.equipment.forEach((equipment: PlacedItem) => {
        engine.addItem(equipment);
      });
      console.log('Engine initialized with', currentScenario.outlets.length, 'outlets and', currentScenario.equipment.length, 'equipment');
    }
  }, [currentScenarioId, currentScenario]);

  // Update engine when accessories change
  useEffect(() => {
    const engine = engineRef.current;
    
    placedAccessories.forEach(accessory => {
      const state = engine.getState();
      if (!state.items.find(item => item.id === accessory.id)) {
        engine.addItem(accessory);
      }
    });
  }, [placedAccessories]);

  // Update engine when cables change
  useEffect(() => {
    engineRef.current.setCables(cables);
  }, [cables]);

  // Cable handlers
  const handleCableAdd = (cable: Cable) => {
    setCables(prev => [...prev, cable]);
    // TODO: Add cable connections to engine in Phase 6 final integration
  };

  const handleCableRemove = (cableId: string) => {
    const cable = cables.find(c => c.id === cableId);
    
    // If this is an incomplete cable being clicked, allow editing instead
    if (cable && !cable.toNodeId) {
      handleIncompleteCableEdit(cableId);
      return;
    }
    
    // Otherwise, remove the cable normally
    setCables(prev => prev.filter(c => c.id !== cableId));
    
    // Auto-select the same cable type for immediate redraw
    const removedCable = cables.find(c => c.id === cableId);
    if (removedCable) {
      setSelectedCableType(removedCable.type);
    }
  };

  const handleIncompleteCableEdit = (cableId: string) => {
    const cable = cables.find(c => c.id === cableId);
    if (!cable || cable.toNodeId) return; // Only edit incomplete cables
    
    // Remove the incomplete cable
    setCables(prev => prev.filter(c => c.id !== cableId));
    
    // Start dragging from the same source node
    if (cable.fromNodeId && cable.path) {
      setDraggingCable({
        type: cable.type,
        fromNodeId: cable.fromNodeId,
        fromPosition: cable.path.start,
        currentPosition: cable.path.end,
      });
      setSelectedCableType(cable.type);
    }
  };

  const handleCableDragStart = (
    cableType: 'edison' | 'flat-wire',
    fromNodeId: string,
    fromPosition: { x: number; y: number }
  ) => {
    setDraggingCable({
      type: cableType,
      fromNodeId,
      fromPosition,
      currentPosition: fromPosition,
    });
  };

  const handleCableDragUpdate = (currentPosition: { x: number; y: number }) => {
    if (draggingCable) {
      setDraggingCable({
        ...draggingCable,
        currentPosition,
      });
    }
  };

  // MOVED: handleAccessoryAdd must be BEFORE handleCableDragEnd
  const handleAccessoryAdd = (itemType: ItemType, x: number, y: number) => {
    const newItem: PlacedItem = {
      id: `accessory${nextItemId}`,
      itemType: itemType,
      x,
      y,
      locked: false,
    };
    
    setPlacedAccessories(prev => [...prev, newItem]);
    setNextItemId(prev => prev + 1);
    
    // Auto-deselect shop item after placing
    setSelectedShopItem(null);
  };

  const handleCableDragEnd = (toNodeId: string | null) => {
    if (!draggingCable) return;

    // Create nodes to get actual positions
    const allNodes = createNodesFromPlacedItems(
      [
        ...(currentScenario?.outlets || []),
        ...(currentScenario?.equipment || []),
        ...placedAccessories,
      ],
      scale
    );

    const fromNode = allNodes.find(n => n.id === draggingCable.fromNodeId);
    
    if (!fromNode) {
      // Invalid source node, cancel
      setDraggingCable(null);
      setSelectedCableType(null);
      return;
    }

    // REQUIRE COMPLETE CABLES: User must connect both ends
    if (toNodeId) {
      // Node IDs are like "outlet1-out1", "outlet1-out2", "doghouse1-out3", etc.
      const toNodeAlreadyConnected = cables.some(cable => 
        cable.toNodeId === toNodeId || cable.fromNodeId === toNodeId
      );
      
      const fromNodeAlreadyConnected = cables.some(cable =>
        cable.toNodeId === draggingCable.fromNodeId || cable.fromNodeId === draggingCable.fromNodeId
      );
      
      if (toNodeAlreadyConnected) {
        console.log(`Destination node ${toNodeId} already connected, cancelling cable`);
        setDraggingCable(null);
        setSelectedCableType(null);
        return;
      }
      
      if (fromNodeAlreadyConnected) {
        console.log(`Source node ${draggingCable.fromNodeId} already connected, cancelling cable`);
        setDraggingCable(null);
        setSelectedCableType(null);
        return;
      }
      
      const toNode = allNodes.find(n => n.id === toNodeId);
      
      if (toNode) {
        // CRITICAL FIX: Cables must flow in the direction of power (outlet ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ equipment)
        // If user dragged from input (tail) to output (outlet), reverse the direction
        let finalFromNodeId = draggingCable.fromNodeId;
        let finalToNodeId = toNodeId;
        let finalFromPos = fromNode.position;
        let finalToPos = toNode.position;
        
        if (fromNode.type === 'input' && toNode.type === 'output') {
          // Reverse: cable should go FROM outlet TO tail
          finalFromNodeId = toNodeId;
          finalToNodeId = draggingCable.fromNodeId;
          finalFromPos = toNode.position;
          finalToPos = fromNode.position;
          console.log(`[CABLE] Reversed cable direction: ${finalFromNodeId} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ${finalToNodeId}`);
        }
        
        // Calculate cable path for completed connection
        const path = calculateCablePath(finalFromPos, finalToPos);
        const visualProps = getCableVisualProps(draggingCable.type);

        // Create completed cable
        const newCable: Cable = {
          id: generateCableId(cables),
          type: draggingCable.type,
          fromNodeId: finalFromNodeId,
          toNodeId: finalToNodeId,
          color: visualProps.color,
          width: visualProps.width,
          path,
        };

        handleCableAdd(newCable);
      }
    }
    // If toNodeId is null, user dropped cable without connecting - just cancel

    // Clear dragging state and deselect cable type
    setDraggingCable(null);
    setSelectedCableType(null);
  };

  const handleAccessoryMove = (itemId: string, x: number, y: number) => {
    setPlacedAccessories(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, x, y } : item
      )
    );
    
    // Update cable paths for any cables connected to this accessory
    setCables(prevCables => {
      // Find cables connected to this item
      const connectedCables = prevCables.filter(cable => 
        cable.fromNodeId.startsWith(`${itemId}-`) || cable.toNodeId.startsWith(`${itemId}-`)
      );
      
      if (connectedCables.length === 0) return prevCables;
      
      // Create updated nodes with new position
      const allNodes = createNodesFromPlacedItems(
        [
          ...(currentScenario?.outlets || []),
          ...(currentScenario?.equipment || []),
          ...placedAccessories.map(item =>
            item.id === itemId ? { ...item, x, y } : item
          ),
        ],
        scale
      );
      
      // Update paths for connected cables
      return prevCables.map(cable => {
        const isConnected = cable.fromNodeId.startsWith(`${itemId}-`) || cable.toNodeId.startsWith(`${itemId}-`);
        
        if (!isConnected) return cable;
        
        const fromNode = allNodes.find(n => n.id === cable.fromNodeId);
        const toNode = allNodes.find(n => n.id === cable.toNodeId);
        
        if (!fromNode || !toNode) return cable;
        
        // Recalculate the path
        const newPath = calculateCablePath(fromNode.position, toNode.position);
        
        return {
          ...cable,
          path: newPath,
        };
      });
    });
  };

  const handleAccessoryRemove = (itemId: string) => {
    setPlacedAccessories(prev => prev.filter(item => item.id !== itemId));
    engineRef.current.removeItem(itemId);
  };

  const handleShopItemUsed = () => {
    setShopOpen(false);
    setSelectedShopItem(null);
  };

  const handleReset = () => {
    console.log('Reset clicked - accessories:', placedAccessories.length, 'cables:', cables.length);
    
    if (placedAccessories.length === 0 && cables.length === 0) {
      console.log('Nothing to reset');
      return;
    }
    
    if (window.confirm('Are you sure you want to clear all placed items and cables?')) {
      console.log('Resetting...');
      setPlacedAccessories([]);
      setCables([]);
      setSelectedShopItem(null);
      setSelectedCableType(null);
      setDraggingCable(null);
      
      // Reinitialize engine with scenario items
      engineRef.current = new BanquetPowerEngine();
      if (currentScenario) {
        currentScenario.outlets.forEach((outlet: PlacedItem) => engineRef.current.addItem(outlet));
        currentScenario.equipment.forEach((equipment: PlacedItem) => engineRef.current.addItem(equipment));
      }
      console.log('Reset complete');
    }
  };

  const handleStartGame = () => {
    setShowStartModal(false);
    setGameStarted(true);
    setStopwatchRunning(true);
  };

  const handleHint1 = () => {
    if (!hint1Used) {
      setHint1Used(true);
      showPenaltyPopup(2);
    }
  };

  const handleHint2 = () => {
    if (!hint2Used && hint1Used) {
      setHint2Used(true);
      showPenaltyPopup(3);
    }
  };

  const handleZoomToggle = () => {
    setIsZoomedIn(!isZoomedIn);
    // Reset pan when toggling zoom
    if (isZoomedIn) {
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handlePanStart = (clientX: number, clientY: number) => {
    if (isZoomedIn) {
      isPanning.current = true;
      lastPanPosition.current = { x: clientX, y: clientY };
    }
  };

  const handlePanMove = (clientX: number, clientY: number) => {
    if (isPanning.current && isZoomedIn) {
      const deltaX = clientX - lastPanPosition.current.x;
      const deltaY = clientY - lastPanPosition.current.y;
      
      setPanOffset(prev => {
        const newX = prev.x + deltaX;
        const newY = prev.y + deltaY;
        
        // Calculate boundaries using actual canvas dimensions
        // Canvas area height = total height - toolbars (150 + 90 = 240)
        const TOOLBAR_HEIGHT = 150;
        const SHOP_TOGGLE_HEIGHT = 90;
        const baseWidth = canvasDimensions.width;
        const baseHeight = canvasDimensions.height - TOOLBAR_HEIGHT - SHOP_TOGGLE_HEIGHT;
        const zoomScale = 1.5;
        
        // Calculate max pan distance (in screen pixels)
        const maxPanX = ((baseWidth * zoomScale - baseWidth) / 2) * scale;
        const maxPanY = ((baseHeight * zoomScale - baseHeight) / 2) * scale;
        
        // Clamp the pan offset
        const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newX));
        const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newY));
        
        return { x: clampedX, y: clampedY };
      });
      
      lastPanPosition.current = { x: clientX, y: clientY };
    }
  };

  const handlePanEnd = () => {
    isPanning.current = false;
  };

  const showPenaltyPopup = (minutes: number) => {
    setPenaltyPopup(`+${minutes}:00`);
    setTimeout(() => setPenaltyPopup(null), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  // Listen for fullscreen changes (e.g., user presses ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleSubmit = async () => {
    if (!userSession) return; // Safety check
    
    setStopwatchRunning(false);
    
    const engine = engineRef.current;
    const result = engine.validateDetailed();
    
    console.log('=== SUBMIT VALIDATION ===');
    console.log('In Tutorial:', inTutorial);
    console.log('Scenario ID:', currentScenarioId);
    console.log('Validation Result:', result);
    console.log('Success:', result.success);
    
    setValidationResult(result);
    setShowValidationOverlay(true);
    
    // If in tutorial, use tutorial validation flow
    if (inTutorial) {
      console.log('Using tutorial validation flow');
      setTutorialValidationTriggered(true);
      return; // TutorialManager will handle the rest
    }
    
    // Calculate final time with penalties
    let finalTime = elapsedTime;
    if (hint1Used) finalTime += 120;
    if (hint2Used) finalTime += 180;
    
    console.log('Validation Result:', result);
    console.log('Final Time:', finalTime);
    
    if (!result.success) {
      setCurrentModal('failed');
    } else {
      // SUCCESS - Submit to Supabase
      const submitted = await submitAttempt(
        userSession.employeeId,
        currentScenarioId,
        finalTime,
        hint1Used,
        hint2Used
      );

      if (submitted) {
        // Update user progress (anti-replay)
        await updateLastThreeScenarios(userSession.employeeId, currentScenarioId);

        // Get user's rank
        const rank = await getUserRank(userSession.employeeId, currentScenarioId, finalTime);
        
        if (rank !== null && rank <= 5) {
          setUserRank(rank);
          setCurrentModal('leaderboard');
        } else {
          setCurrentModal('nicely-done');
        }
      } else {
        // Submission failed, but still show success modal
        console.error('Failed to submit attempt to database');
        setCurrentModal('nicely-done');
      }
    }
  };

  const handleKeepTrying = () => {
    setShowValidationOverlay(false);
    setValidationResult(null);
    setCurrentModal('none');
    setStopwatchRunning(true);
  };

  const handleNextScenario = async () => {
    if (!userSession) return; // Safety check
    
    // Get random available scenario (excludes last 3)
    const nextId = await getRandomAvailableScenario(userSession.employeeId);
    
    setShowValidationOverlay(false);
    setValidationResult(null);
    setCurrentModal('none');
    setShowStartModal(true);
    setGameStarted(false);
    setStopwatchRunning(false);
    setElapsedTime(0);
    setHint1Used(false);
    setHint2Used(false);
    setPlacedAccessories([]);
    setCables([]);
    setDraggingCable(null);
    setSelectedCableType(null);
    setUserRank(null);
    setCurrentScenarioId(nextId);
    
    // Reinitialize engine
    engineRef.current = new BanquetPowerEngine();
    const newScenario = getScenarioById(nextId);
    if (newScenario) {
      newScenario.outlets.forEach(outlet => engineRef.current.addItem(outlet));
      newScenario.equipment.forEach(equipment => engineRef.current.addItem(equipment));
    }
  };

  // Tutorial handler functions
  const handleReplayTutorial = async () => {
    if (!userSession) return;
    
    // Reset tutorial status in database
    await resetTutorialStatus(userSession.employeeId);
    
    // Start tutorial
    setInTutorial(true);
    setCurrentScenarioId(getFirstTutorialScenario());
    setShowStartModal(true);
    setSettingsOpen(false);
    
    // Reset game state
    setGameStarted(false);
    setStopwatchRunning(false);
    setElapsedTime(0);
    setHint1Used(false);
    setHint2Used(false);
    setPlacedAccessories([]);
    setCables([]);
    setDraggingCable(null);
    setSelectedCableType(null);
    
    // Reinitialize engine
    engineRef.current = new BanquetPowerEngine();
    const tutorialScenario = getTutorialScenarioById(getFirstTutorialScenario());
    if (tutorialScenario) {
      tutorialScenario.outlets.forEach((outlet: PlacedItem) => engineRef.current.addItem(outlet));
      tutorialScenario.equipment.forEach((equipment: PlacedItem) => engineRef.current.addItem(equipment));
    }
  };

  const handleTutorialResetValidation = () => {
    setTutorialValidationTriggered(false);
    setShowValidationOverlay(false);
    setValidationResult(null);
    
    // Reset game state for retry
    setPlacedAccessories([]);
    setCables([]);
    setDraggingCable(null);
    setSelectedCableType(null);
    setGameStarted(false);
    setStopwatchRunning(false);
    setElapsedTime(0);
    setShowStartModal(true);
    
    // Reinitialize engine
    engineRef.current = new BanquetPowerEngine();
    const tutorialScenario = getTutorialScenarioById(currentScenarioId);
    if (tutorialScenario) {
      tutorialScenario.outlets.forEach((outlet: PlacedItem) => engineRef.current.addItem(outlet));
      tutorialScenario.equipment.forEach((equipment: PlacedItem) => engineRef.current.addItem(equipment));
    }
  };

  const handleTutorialNextScenario = () => {
    const nextScenario = getNextTutorialScenario(currentScenarioId);
    if (nextScenario) {
      setCurrentScenarioId(nextScenario);
      
      // Reset game state for next scenario
      setPlacedAccessories([]);
      setCables([]);
      setDraggingCable(null);
      setSelectedCableType(null);
      setGameStarted(false);
      setStopwatchRunning(false);
      setElapsedTime(0);
      setHint1Used(false);
      setHint2Used(false);
      setShowStartModal(true);
      
      // Reinitialize engine
      engineRef.current = new BanquetPowerEngine();
      const tutorialScenario = getTutorialScenarioById(nextScenario);
      if (tutorialScenario) {
        tutorialScenario.outlets.forEach((outlet: PlacedItem) => engineRef.current.addItem(outlet));
        tutorialScenario.equipment.forEach((equipment: PlacedItem) => engineRef.current.addItem(equipment));
      }
    }
  };

  const handleTutorialExit = async () => {
    if (!userSession) return;
    
    console.log('Exiting tutorial...');
    
    // Mark tutorial as completed in database (non-blocking)
    markTutorialCompleted(userSession.employeeId).catch(err => {
      console.error('Failed to mark tutorial as completed:', err);
    });
    
    // Reset game state FIRST
    setPlacedAccessories([]);
    setCables([]);
    setDraggingCable(null);
    setSelectedCableType(null);
    setGameStarted(false);
    setStopwatchRunning(false);
    setElapsedTime(0);
    setHint1Used(false);
    setHint2Used(false);
    setShowValidationOverlay(false);
    setValidationResult(null);
    setTutorialValidationTriggered(false);
    
    // Exit tutorial mode
    setInTutorial(false);
    
    // Load a regular scenario
    try {
      const randomScenario = await getRandomAvailableScenario(userSession.employeeId);
      console.log('Random scenario:', randomScenario);
      setCurrentScenarioId(randomScenario || 1); // Default to scenario 1 if null
    } catch (error) {
      console.error('Error getting random scenario:', error);
      setCurrentScenarioId(1); // Default to scenario 1 on error
    }
    
    // Show start modal for new scenario
    setShowStartModal(true);
    
    // Reinitialize engine (will happen in useEffect when currentScenarioId changes)
  };

  // Show login if no session
  if (!userSession) {
    return <EmployeeLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Show loading if scenario not loaded yet
  if (!currentScenario) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading scenario...</div>
      </div>
    );
  }

  // Main game UI
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      <div 
        className="absolute top-1/2 left-1/2"
        style={{
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          width: `${canvasDimensions.width}px`,
          height: `${canvasDimensions.height}px`,
        }}
      >
        <div className="relative w-full h-full">
          {/* Zoomable Canvas Container */}
          <div
            className="absolute inset-0"
            style={{
              cursor: isZoomedIn ? 'grab' : 'default',
              overflow: 'hidden',
            }}
            onMouseDown={(e) => {
              if (isZoomedIn && e.button === 0) {
                handlePanStart(e.clientX, e.clientY);
                e.currentTarget.style.cursor = 'grabbing';
              }
            }}
            onMouseMove={(e) => {
              if (isZoomedIn) {
                handlePanMove(e.clientX, e.clientY);
              }
            }}
            onMouseUp={(e) => {
              if (isZoomedIn) {
                handlePanEnd();
                e.currentTarget.style.cursor = 'grab';
              }
            }}
            onMouseLeave={(e) => {
              if (isZoomedIn) {
                handlePanEnd();
                e.currentTarget.style.cursor = 'grab';
              }
            }}
            onTouchStart={(e) => {
              if (isZoomedIn && e.touches.length === 1) {
                handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchMove={(e) => {
              if (isZoomedIn && e.touches.length === 1) {
                handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={() => {
              if (isZoomedIn) {
                handlePanEnd();
              }
            }}
          >
            <div 
              style={{
                transform: isZoomedIn ? `scale(1.5) translate(${panOffset.x / (scale * 1.5)}px, ${panOffset.y / (scale * 1.5)}px)` : 'none',
                transformOrigin: 'center center',
                transition: isZoomedIn ? 'none' : 'transform 0.3s ease-out',
                width: '100%',
                height: '100%',
              }}
            >
          <GameCanvas
            scenario={currentScenario!}
            placedAccessories={placedAccessories}
            cables={cables}
            draggingCable={draggingCable}
            selectedCableType={selectedCableType}
            selectedShopItem={selectedShopItem}
            onAccessoryAdd={handleAccessoryAdd}
            onAccessoryMove={handleAccessoryMove}
            onAccessoryRemove={handleAccessoryRemove}
            onCableRemove={handleCableRemove}
            onCableDragStart={handleCableDragStart}
            onCableDragUpdate={handleCableDragUpdate}
            onCableDragEnd={handleCableDragEnd}
            onShopItemUsed={handleShopItemUsed}
            onSelectionChange={handleSelectionChange}
            scale={scale}
            hint1Active={hint1Used}
            hint2Active={hint2Active}
            outletUsage={outletUsage}
            isZoomedIn={isZoomedIn}
            panOffset={panOffset}
            canvasDimensions={canvasDimensions}
            nodesHidden={nodesHidden}
            nodeSize={nodeSize}
          />

          {/* Validation Overlay */}
          {showValidationOverlay && validationResult && (
            <ValidationOverlay
              scenario={currentScenario!}
              placedAccessories={placedAccessories}
              validChains={validationResult.validChains}
              invalidChains={validationResult.invalidChains}
              disconnectedItems={validationResult.disconnectedItems}
            />
          )}
            </div>
          </div>
          {/* End of Zoomable Canvas Container */}

          {showStartModal && (
            <StartModal
              scenario={currentScenario!}
              employeeId={userSession.employeeId}
              onStart={handleStartGame}
            />
          )}

          {/* Result Modals */}
          {currentModal === 'failed' && (
            <FailedModal
              onKeepTrying={handleKeepTrying}
              onNextScenario={handleNextScenario}
            />
          )}

          {currentModal === 'nicely-done' && (
            <NicelyDoneModal
              scenarioId={currentScenarioId}
              elapsedTime={elapsedTime}
              hint1Used={hint1Used}
              hint2Used={hint2Used}
              onNextScenario={handleNextScenario}
            />
          )}

          {currentModal === 'leaderboard' && userRank !== null && (
            <LeaderboardModal
              scenarioId={currentScenarioId}
              rank={userRank}
              employeeId={userSession.employeeId}
              elapsedTime={elapsedTime}
              hint1Used={hint1Used}
              hint2Used={hint2Used}
              onNextScenario={handleNextScenario}
            />
          )}

          {/* Shop Inventory */}
          <div className="absolute bottom-[150px] left-0 right-0">
            <ShopInventory
              selectedItem={selectedShopItem}
              selectedCableType={selectedCableType}
              onSelectItem={setSelectedShopItem}
              onSelectCableType={setSelectedCableType}
              isOpen={shopOpen}
              onToggle={() => setShopOpen(!shopOpen)}
            />
          </div>

          {/* Trash Bin */}
            {((selectedItemId && placedAccessories.some(i => i.id === selectedItemId)) || selectedCableId) && (
              <button
                onClick={handleTrashBinClick}
                className="absolute bottom-[300px] right-8 group pointer-events-auto"
                style={{ zIndex: 75 }}
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-red-700 rounded-full blur opacity-50 group-hover:opacity-75 transition duration-200 animate-pulse pointer-events-none"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center shadow-xl transform transition-all duration-150 active:scale-90 ring-4 ring-red-400">
                  <svg className="w-10 h-10 text-white animate-bounce pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </button>
            )}

          {/* Bottom Toolbar */}
          <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t-2 border-gray-700 shadow-2xl z-[60]">
            <div className="h-full flex items-center justify-between px-12">
              {/* Left: Settings and Hide Nodes */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleSettingsToggle}
                  className="group flex flex-col items-center gap-2 text-gray-300 hover:text-white transition-colors p-3"
                >
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold text-sm">Settings</span>
                </button>

                <button 
                  onClick={() => setNodesHidden(!nodesHidden)}
                  className={`group flex flex-col items-center gap-2 transition-colors p-3 ${
                    nodesHidden ? 'text-orange-500' : 'text-gray-300 hover:text-white'
                  }`}
                  title={nodesHidden ? "Show Nodes" : "Hide Nodes"}
                >
                  {nodesHidden ? (
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                  <span className="font-semibold text-sm">{nodesHidden ? 'Show Nodes' : 'Hide Nodes'}</span>
                </button>
              </div>

              {/* Center: SUBMIT Button */}
              <button 
                onClick={handleSubmit}
                disabled={!gameStarted}
                className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 px-20 rounded-2xl shadow-lg transform transition-all duration-150 active:scale-95 text-2xl">
                  SUBMIT
                </div>
              </button>

              {/* Right: Zoom and Hint */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleZoomToggle}
                  className="group flex flex-col items-center gap-2 text-gray-300 hover:text-white transition-colors p-3"
                  title={isZoomedIn ? "Zoom Out" : "Zoom In"}
                >
                  {isZoomedIn ? (
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  )}
                  <span className="font-semibold text-sm">{isZoomedIn ? 'Zoom Out' : 'Zoom In'}</span>
                </button>

                <button 
                  onClick={hint1Used ? handleHint2 : handleHint1}
                  disabled={!gameStarted || (hint1Used && hint2Used)}
                  className="group flex flex-col items-center gap-2 text-gray-300 hover:text-white transition-colors p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-semibold text-sm">
                    {hint2Used ? 'No Hints' : hint1Used ? 'Hint 2' : 'Hint 1'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Top Status Bar */}
          <div className="absolute top-[100px] left-0 right-0 flex items-center justify-between px-8">
            <button
              onClick={handleReset}
              disabled={placedAccessories.length === 0 && cables.length === 0}
              className={`group bg-gradient-to-br from-gray-800 to-gray-900 px-6 py-3 rounded-xl shadow-lg border transition-all ${
                placedAccessories.length === 0 && cables.length === 0
                  ? 'border-gray-700 opacity-50 cursor-not-allowed'
                  : 'border-gray-700 hover:border-orange-500 hover:shadow-orange-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-8 h-8 transition-colors ${
                  placedAccessories.length === 0 && cables.length === 0 ? 'text-gray-600' : 'text-orange-400 group-hover:text-orange-300'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div className="text-left">
                  <div className={`text-xs uppercase tracking-wide ${
                    placedAccessories.length === 0 && cables.length === 0 ? 'text-gray-600' : 'text-gray-400'
                  }`}>Reset</div>
                  <div className={`text-xl font-bold ${
                    placedAccessories.length === 0 && cables.length === 0 ? 'text-gray-600' : 'text-white'
                  }`}>Clear All</div>
                </div>
              </div>
            </button>

            {gameStarted && (
              <div className="relative">
                <Stopwatch 
                  isRunning={stopwatchRunning}
                  onTimeUpdate={setElapsedTime}
                />
                {penaltyPopup && (
                  <div 
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold animate-penalty-popup"
                  >
                    {penaltyPopup}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white px-6 py-3 rounded-xl shadow-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Items</div>
                    <div className="text-3xl font-bold">{placedAccessories.length + cables.length}</div>
                  </div>
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 hover:shadow-blue-500/20 transition-all"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  // Exit Fullscreen Icon
                  <svg className="w-11 h-11 text-blue-400 group-hover:text-blue-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                ) : (
                  // Enter Fullscreen Icon
                  <svg className="w-11 h-11 text-blue-400 group-hover:text-blue-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          <SettingsPanel
            isOpen={settingsOpen}
            onClose={handleSettingsToggle}
            onLogout={handleLogout}
            userName={userSession.userName}
            employeeId={userSession.employeeId}
            onAdminUnlock={handleAdminUnlock}
            nodeSize={nodeSize}
            onNodeSizeChange={setNodeSize}
            onReplayTutorial={handleReplayTutorial}
          />

          {/* Admin PIN Modal */}
          {showAdminPin && (
            <AdminPinModal
              onCorrectPin={handleAdminPinSuccess}
              onClose={handleAdminPinClose}
            />
          )}

          {/* Admin Panel */}
          {showAdminPanel && (
            <AdminPanel onReturnToGame={handleReturnToGame} />
          )}

          {/* Tutorial Manager */}
          {inTutorial && (
            <TutorialManager
              currentScenarioId={currentScenarioId}
              placedAccessories={placedAccessories}
              cables={cables}
              validationPassed={validationResult?.success || false}
              validationTriggered={tutorialValidationTriggered}
              onResetValidation={handleTutorialResetValidation}
              onNextScenario={handleTutorialNextScenario}
              onExitTutorial={handleTutorialExit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;