// src/components/NodeVisualization.tsx

import type { PlacedItem } from '../types';
import type { Node, DraggingCable } from '../types/cable';
import { CABLE_CONSTANTS } from '../types/cable';
import { getNodeColor } from '../utils/cableHelpers';

interface NodeVisualizationProps {
  nodes: Node[];
  draggingCable: DraggingCable | null;
  selectedCableType: 'edison' | 'flat-wire' | null;
  allItems: Map<string, PlacedItem>; // NEW: Need this for color calculation
  scale: number;
  onNodeClick?: (node: Node) => void;
}

export default function NodeVisualization({
  nodes,
  draggingCable,
  selectedCableType,
  allItems,
  onNodeClick,
}: NodeVisualizationProps) {
  // ALWAYS show nodes now
  const shouldShowNodes = true;
  
  if (!shouldShowNodes) {
    return null;
  }

  // Filter to show appropriate nodes based on state
  const visibleNodes = nodes.filter(node => {
    // CRITICAL: Hide the equipment-to-tail connection nodes
    // Only show the tail-end nodes (tail-in), not the equipment connection nodes (in)
    const item = allItems.get(node.itemId);
    if (item && node.type === 'input') {
      // Check if this node is a tail input (show it)
      if (node.id.includes('tail-in')) {
        return true; // Show tail input nodes
      }
      // Check if this node is an equipment input (hide it if equipment has a tail)
      if (node.id.endsWith('-in')) {
        // This is likely the hidden equipment connection node
        // We'll still show it during cable dragging if compatible
        if (draggingCable) {
          // During dragging, show if compatible
          const fromNode = nodes.find(n => n.id === draggingCable.fromNodeId);
          if (fromNode && fromNode.type === 'output' && node.type === 'input') {
            return true;
          }
          return false;
        }
        // Not dragging - hide this node
        return false;
      }
    }
    
    if (draggingCable) {
      if (node.id === draggingCable.fromNodeId) {
        return false;
      }

      const fromNode = nodes.find(n => n.id === draggingCable.fromNodeId);
      if (!fromNode) return false;

      if (fromNode.type === 'input' && node.type === 'output') {
        return true;
      }
      
      if (fromNode.type === 'output' && node.type === 'input') {
        return true;
      }

      return false;
    } else if (selectedCableType) {
      return node.type === 'output';
    } else {
      // Show tail input nodes when nothing is selected
      return node.type === 'input' && node.id.includes('tail-in');
    }
  });

  return (
    <>
      {visibleNodes.map(node => {
        // Use the new color system that handles doghouse pairs
        const color = getNodeColor(node, allItems);
        const radius = CABLE_CONSTANTS.NODE_RADIUS;
        const strokeWidth = CABLE_CONSTANTS.NODE_STROKE_WIDTH;

        const isEquipmentTail = node.type === 'input' && node.id.includes('tail-in');

        return (
          <g
            key={node.id}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick?.(node);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            style={{ 
              cursor: 'pointer',
              pointerEvents: 'all',
            }}
            className="hover:opacity-80 transition-opacity"
          >
            {/* Outer glow */}
            <circle
              cx={node.position.x}
              cy={node.position.y}
              r={radius + 6}
              fill={color}
              opacity={0.3}
              style={{ pointerEvents: 'none' }}
            />

            {/* Main node circle */}
            <circle
              cx={node.position.x}
              cy={node.position.y}
              r={radius}
              fill={color}
              stroke="white"
              strokeWidth={strokeWidth}
              opacity={isEquipmentTail ? 0.8 : 0.9}
              style={{ pointerEvents: 'all', cursor: 'pointer' }}
              className="transition-all hover:scale-110"
            />

            {/* Inner indicator dot */}
            <circle
              cx={node.position.x}
              cy={node.position.y}
              r={radius * 0.4}
              fill="white"
              opacity={0.9}
              style={{ pointerEvents: 'none' }}
            />

            {/* Pulse animation for equipment tails */}
            {isEquipmentTail && !selectedCableType && !draggingCable && (
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r={radius + 2}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={0.6}
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Large invisible hit area for easier clicking */}
            <circle
              cx={node.position.x}
              cy={node.position.y}
              r={radius * 3}
              fill="transparent"
              style={{ pointerEvents: 'all', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick?.(node);
              }}
            />
          </g>
        );
      })}
    </>
  );
}