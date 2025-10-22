// src/components/CableRenderer.tsx

import type { PlacedItem } from '../types';
import type { Cable, DraggingCable, Node } from '../types/cable';
import { 
  getCableVisualProps, 
  pathToSvgString, 
  getCableColorFromNode,
  getNodeColor,
  calculateCablePath 
} from '../utils/cableHelpers';

interface CableRendererProps {
  cables: Cable[];
  draggingCable: DraggingCable | null;
  selectedCableId: string | null;
  allNodes: Node[]; // NEW: Need nodes to get colors
  allItems: Map<string, PlacedItem>; // NEW: Need items for node color calculation
  onCableClick?: (cableId: string) => void;
}

export default function CableRenderer({
  cables,
  draggingCable,
  selectedCableId,
  allNodes,
  allItems,
  onCableClick,
}: CableRendererProps) {
  return (
    <svg
      className="absolute inset-0"
      style={{
        zIndex: 25,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
      viewBox="0 0 1080 1690"
      preserveAspectRatio="none"
    >
      {/* Render existing cables */}
      {cables.map(cable => {
        if (!cable.path) return null;

        const pathString = pathToSvgString(cable.path);
        const visualProps = getCableVisualProps(cable.type);
        const isSelected = selectedCableId === cable.id;
        const isIncomplete = !cable.toNodeId; // Cable has no destination
        
        // NEW: Get cable color from its source node (inherit color)
        const cableColor = getCableColorFromNode(cable, allNodes, allItems);

        return (
          <g key={cable.id}>
            {isSelected && (
              <path
                d={pathString}
                stroke="#ef4444" // Red highlight
                strokeWidth={visualProps.width + 6} // Thicker than main cable
                fill="none"
                strokeLinecap="round"
                opacity={0.6}
                style={{ 
                  filter: 'drop-shadow(0 2px 8px rgba(239, 68, 68, 0.8))',
                }}
              />
            )}
            {/* Main cable path */}
            <path
              d={pathString}
              stroke={cableColor} // Use inherited color instead of default
              strokeWidth={visualProps.width}
              fill="none"
              strokeLinecap="round"
              opacity={isIncomplete ? 0.7 : (isSelected ? 1 : 0.9)}
              strokeDasharray={isIncomplete ? "8 4" : undefined}
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              }}
            />

            {/* Invisible thicker path for easier clicking/tapping */}
            <path
              d={pathString}
              stroke="transparent"
              strokeWidth={visualProps.width + 20}
              fill="none"
              strokeLinecap="round"
              style={{ pointerEvents: 'all', cursor: 'pointer' }}
              onClick={() => onCableClick?.(cable.id)}
              className="pointer-events-auto"
            />

            {/* Connection point at start */}
            {cable.path.start && (
              <circle
                cx={cable.path.start.x}
                cy={cable.path.start.y}
                r={visualProps.width * 1.5}
                fill={cableColor}
                opacity={0.8}
              />
            )}
            
            {/* Connection point at end - YELLOW if incomplete */}
            {cable.path.end && (
              <>
                <circle
                  cx={cable.path.end.x}
                  cy={cable.path.end.y}
                  r={isIncomplete ? 20 : visualProps.width * 1.5}
                  fill={isIncomplete ? '#fbbf24' : cableColor} // Yellow if incomplete
                  opacity={isIncomplete ? 0.9 : 0.8}
                />
                {/* Pulse animation for incomplete cables */}
                {isIncomplete && (
                  <circle
                    cx={cable.path.end.x}
                    cy={cable.path.end.y}
                    r={24}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    opacity={0.6}
                    className="animate-pulse"
                  />
                )}
              </>
            )}
          </g>
        );
      })}

      {/* Render cable being dragged (temporary) */}
      {draggingCable && (() => {
        // Find the source node to get its color
        const fromNode = allNodes.find(n => n.id === draggingCable.fromNodeId);
        let dragColor = getCableVisualProps(draggingCable.type).color;
        
        if (fromNode) {
          dragColor = getNodeColor(fromNode, allItems);
        }

        const visualProps = getCableVisualProps(draggingCable.type);

        // Calculate path from source to cursor
        const tempPath = calculateCablePath(
          draggingCable.fromPosition,
          draggingCable.currentPosition
        );
        const pathString = pathToSvgString(tempPath);

        return (
          <g>
            {/* Animated dashed line to show it's temporary */}
            <path
              d={pathString}
              stroke={dragColor} // Use source node color
              strokeWidth={visualProps.width}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="10 5"
              opacity={0.7}
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
              className="animate-pulse"
            />

            {/* Start point indicator */}
            <circle
              cx={draggingCable.fromPosition.x}
              cy={draggingCable.fromPosition.y}
              r={visualProps.width * 2}
              fill={dragColor}
              opacity={0.6}
              className="animate-pulse"
            />

            {/* End point indicator (follows cursor) */}
            <circle
              cx={draggingCable.currentPosition.x}
              cy={draggingCable.currentPosition.y}
              r={visualProps.width * 1.5}
              fill={dragColor}
              opacity={0.8}
            />
          </g>
        );
      })()}
    </svg>
  );
}