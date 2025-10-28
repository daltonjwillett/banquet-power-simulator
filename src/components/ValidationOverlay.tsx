import type { PlacedItem, Scenario } from '../types';

interface ValidationOverlayProps {
  scenario: Scenario;
  placedAccessories: PlacedItem[];
  validChains: string[][];
  invalidChains: string[][];
  disconnectedItems: string[];
}

export default function ValidationOverlay({
  scenario,
  placedAccessories,
  validChains,
  invalidChains,
  disconnectedItems,
}: ValidationOverlayProps) {
  // Design dimensions - same as GameCanvas
  const DESIGN_WIDTH = 1080;
  const DESIGN_HEIGHT = 1680; // Canvas area height (1920 - 240px toolbars)
  
  // Combine all items for rendering
  const allItems = [
    ...scenario.outlets,
    ...scenario.equipment,
    ...placedAccessories,
  ];

  // Determine which items should glow what color
  const getItemGlowClass = (itemId: string): string | null => {
    // Check if disconnected (red) - highest priority
    if (disconnectedItems.includes(itemId)) {
      return 'validation-glow-red';
    }

    // Check if in invalid chain (red) - takes precedence over valid
    const isInvalid = invalidChains.some(chain => chain.includes(itemId));
    if (isInvalid) {
      return 'validation-glow-red';
    }

    // Check if in valid chain (green) - only if not invalid
    const isValid = validChains.some(chain => chain.includes(itemId));
    if (isValid) {
      return 'validation-glow-green';
    }

    return null;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Top padding for camera notch */}
      <div className="h-[80px]" />
      
      {/* Canvas area - matches GameCanvas dimensions */}
      <div className="relative w-full h-[calc(100%-230px)]">
        {allItems.map((item) => {
          const glowClass = getItemGlowClass(item.id);
          
          if (!glowClass) return null;

          return (
            <div
              key={`glow-${item.id}`}
              className={`absolute ${glowClass}`}
              style={{
                left: `${(item.x / DESIGN_WIDTH) * 100}%`,
                top: `${(item.y / DESIGN_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: '120px',
                height: '120px',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}