// src/components/NodeVisualization.tsx

import type { PlacedItem } from '../types';
import type { Node, DraggingCable, Cable } from '../types/cable';
import { CABLE_CONSTANTS } from '../types/cable';
import { getNodeColor } from '../utils/cableHelpers';
import { ITEM_DEFINITIONS } from '../data/itemDefinitions';

interface NodeVisualizationProps {
  nodes: Node[];
  draggingCable: DraggingCable | null;
  selectedCableType: 'edison' | 'flat-wire' | null;
  allItems: Map<string, PlacedItem>; // NEW: Need this for color calculation
  cables: Cable[]; // NEW: Need this to check if input nodes are connected
  scale: number;
  onNodeClick?: (node: Node) => void;
  onNodeTouch?: (node: Node) => void; // NEW: Separate touch handler for mobile
  nodesHidden?: boolean; // NEW: Hide all nodes when true
  nodeSize?: 'small' | 'large'; // NEW: Node size setting
}

export default function NodeVisualization({
  nodes,
  draggingCable,
  selectedCableType,
  allItems,
  cables,
  onNodeClick,
  onNodeTouch,
  nodesHidden = false,
  nodeSize = 'large',
}: NodeVisualizationProps) {
  // Hide ALL nodes if nodesHidden is true
  if (nodesHidden) {
    return null;
  }
  
  // ALWAYS show nodes now (unless nodesHidden)
  const shouldShowNodes = true;
  
  if (!shouldShowNodes) {
    return null;
  }

  // Calculate radius based on node size setting
  const baseRadius = CABLE_CONSTANTS.NODE_RADIUS; // 30
  const radius = nodeSize === 'small' ? baseRadius * 0.5 : baseRadius; // 15 for small, 30 for large

  // Filter to show appropriate nodes based on state
  const visibleNodes = nodes.filter(node => {
    // CRITICAL: Hide the equipment-to-tail connection nodes
    // Only show the tail-end nodes (tail-in), not the equipment connection nodes (in)
    const item = allItems.get(node.itemId);
    if (item && node.type === 'input') {
      // Check if this node is a tail input (show it if not connected)
      if (node.id.includes('tail-in')) {
        // Check if this tail is already connected
        const isConnected = cables.some(cable => 
          cable.toNodeId === node.id && cable.fromNodeId && cable.toNodeId
        );
        // Show if not connected, or if dragging a cable (to allow reconnection)
        return !isConnected || !!draggingCable;
      }
      
      // Check if this node is an accessory input node (ends with '-in' but NOT 'tail-in')
      if (node.id.endsWith('-in') && !node.id.includes('tail-in')) {
        // First check: Does this item have a tail? If yes, this is a hidden equipment node - NEVER show it
        const itemDef = ITEM_DEFINITIONS[item.itemType];
        const hasTail = itemDef.nodes.some(n => n.id.includes('tail-in'));
        
        if (hasTail) {
          // This is an equipment's hidden connection node - hide it always (unless dragging for compatibility check)
          if (draggingCable) {
            const fromNode = nodes.find(n => n.id === draggingCable.fromNodeId);
            if (fromNode && fromNode.type === 'output' && node.type === 'input') {
              return true;
            }
          }
          return false;
        }
        
        // This is an accessory input node (no tail) - show it if not connected
        const isConnected = cables.some(cable => 
          cable.toNodeId === node.id && cable.fromNodeId && cable.toNodeId
        );
        
        // Show if not connected, or if actively dragging a cable
        return !isConnected || !!draggingCable;
      }
      
      // Any other input node - hide unless dragging for compatibility
      if (draggingCable) {
        const fromNode = nodes.find(n => n.id === draggingCable.fromNodeId);
        if (fromNode && fromNode.type === 'output' && node.type === 'input') {
          return true;
        }
      }
      return false;
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
      // Show input nodes (tails and unconnected accessory inputs) when nothing is selected
      if (node.type === 'input') {
        // Show equipment tails if not connected
        if (node.id.includes('tail-in')) {
          const isConnected = cables.some(cable => 
            cable.toNodeId === node.id && cable.fromNodeId && cable.toNodeId
          );
          return !isConnected;
        }
        
        // Show accessory input nodes if not connected
        if (node.id.endsWith('-in') && !node.id.includes('tail-in')) {
          const isConnected = cables.some(cable => 
            cable.toNodeId === node.id && cable.fromNodeId && cable.toNodeId
          );
          return !isConnected;
        }
      }
      return false;
    }
  });

  return (
    <>
      {visibleNodes.map(node => {
        // Use the new color system that handles doghouse pairs
        const color = getNodeColor(node, allItems);
        const strokeWidth = CABLE_CONSTANTS.NODE_STROKE_WIDTH;

        const isEquipmentTail = node.type === 'input' && node.id.includes('tail-in');

        return (
          <g
            key={node.id}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick?.(node);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault(); // Prevent touch from triggering click
              onNodeTouch?.(node);
            }}
            style={{ 
              cursor: 'pointer',
              pointerEvents: 'all',
              touchAction: 'none',
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
              style={{ pointerEvents: 'all', cursor: 'pointer', touchAction: 'none' }}
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

            {/* Large invisible hit area for easier clicking/touching */}
            <circle
              cx={node.position.x}
              cy={node.position.y}
              r={radius * 2}
              fill="transparent"
              style={{ pointerEvents: 'all', cursor: 'pointer', touchAction: 'none' }}
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick?.(node);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault(); // Prevent touch from triggering click
                onNodeTouch?.(node);
              }}
            />
          </g>
        );
      })}
    </>
  );
}