// src/utils/cableHelpers.ts

import { ConnectionType, ItemType } from '../types';
import type { PlacedItem } from '../types';
import type { Cable, Node, NearbyNode, DraggingCable } from '../types/cable';
import { CABLE_CONSTANTS } from '../types/cable';
import { getItemDefinition } from '../data/itemDefinitions';

/**
 * Generates a unique cable ID
 */
export function generateCableId(cables: Cable[]): string {
  const existingIds = cables.map(c => c.id);
  let counter = 1;
  while (existingIds.includes(`cable-${counter}`)) {
    counter++;
  }
  return `cable-${counter}`;
}

/**
 * Creates all Node instances for placed items on the canvas
 * Converts static NodeDefinitions into positioned Nodes with unique IDs
 */
export function createNodesFromPlacedItems(
  placedItems: PlacedItem[],
  scale: number = 1
): Node[] {
  const nodes: Node[] = [];

  for (const item of placedItems) {
    const itemDef = getItemDefinition(item.itemType);
    
    if (!itemDef.nodes) continue;

    for (const nodeDef of itemDef.nodes) {
      // Calculate absolute position on canvas (scaled)
      const absoluteX = item.x + (nodeDef.offsetX * scale);
      const absoluteY = item.y + (nodeDef.offsetY * scale);

      nodes.push({
        id: `${item.id}-${nodeDef.id}`, // e.g., "outlet1-out"
        itemId: item.id,
        type: nodeDef.type,
        connectionType: nodeDef.connectionType,
        position: {
          x: absoluteX,
          y: absoluteY,
        },
        pairId: nodeDef.pairId, // For doghouse tracking
      });
    }
  }

  return nodes;
}

/**
 * Finds all nodes within snap distance of a point
 * Sorted by distance (closest first)
 */
export function findNearbyNodes(
  point: { x: number; y: number },
  allNodes: Node[],
  draggingCable: DraggingCable | null,
  allItems: Map<string, PlacedItem>
): NearbyNode[] {
  const nearby: NearbyNode[] = [];

  for (const node of allNodes) {
    const dx = node.position.x - point.x;
    const dy = node.position.y - point.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= CABLE_CONSTANTS.SNAP_DISTANCE) {
      // Check if this node is compatible with the cable being dragged
      const isCompatible = draggingCable 
        ? canConnectCableToNode(draggingCable, node, allNodes, allItems)
        : false;

      nearby.push({
        node,
        distance,
        isCompatible,
      });
    }
  }

  // Sort by distance (closest first)
  nearby.sort((a, b) => a.distance - b.distance);

  return nearby;
}

/**
 * Checks if a cable type can connect to a specific node
 */
function canConnectCableToNode(
  draggingCable: DraggingCable,
  targetNode: Node,
  allNodes: Node[],
  allItems: Map<string, PlacedItem>
): boolean {
  // Can't connect to the same node we started from
  if (targetNode.id === draggingCable.fromNodeId) {
    return false;
  }

  // Find the starting node
  const fromNode = allNodes.find(n => n.id === draggingCable.fromNodeId);
  if (!fromNode) return false;

  // Cable must go from output to input
  if (fromNode.type === 'output' && targetNode.type !== 'input') {
    return false;
  }
  if (fromNode.type === 'input' && targetNode.type !== 'output') {
    return false;
  }

  // Check connection type compatibility based on cable type
  
  // Edison cables (20A)
  if (draggingCable.type === 'edison') {
    // CRITICAL: Edison cables can ONLY connect Edison to Edison
    // EXCEPT: TRUE_20 equipment tails can connect directly to Edison outputs with canDoTrue20
    //         (The tail IS the cable for TRUE_20 equipment - clicking the tail starts "edison" drag)
    
    // Block L6 connections
    if (targetNode.connectionType === ConnectionType.L6_20 || 
        targetNode.connectionType === ConnectionType.L6_30) {
      return false;
    }
    
    if (fromNode.connectionType === ConnectionType.L6_20 || 
        fromNode.connectionType === ConnectionType.L6_30) {
      return false;
    }
    
    // TRUE_20 special case: When dragging FROM a TRUE_20 tail (input node)
    // Allow connection TO Edison outputs IF they have canDoTrue20
    // This represents the tail plugging directly into the Quad Box/Doghouse/Outlet
    if (fromNode.connectionType === ConnectionType.TRUE_20) {
      // Must be going to an Edison output
      if (targetNode.connectionType !== ConnectionType.EDISON) {
        return false;
      }
      
      // Check if the target item has canDoTrue20 (Quad Box, Doghouse, 20A Outlet)
      const targetItem = allItems.get(targetNode.itemId);
      if (!targetItem) return false;
      
      const targetItemDef = getItemDefinition(targetItem.itemType);
      return targetItemDef.canDoTrue20 === true;
    }
    
    // Block Edison cables FROM connecting TO TRUE_20 tails
    // (Can only drag FROM the tail, not TO it)
    if (targetNode.connectionType === ConnectionType.TRUE_20) {
      return false;
    }
    
    // Standard Edison to Edison
    if (targetNode.connectionType === ConnectionType.EDISON && 
        fromNode.connectionType === ConnectionType.EDISON) {
      return true;
    }
    
    return false;
  }

  // Flat-wire cables (L21-30, L6-20, L6-30)
  if (draggingCable.type === 'flat-wire') {
    // L21-30 connections
    if (fromNode.connectionType === ConnectionType.L21_30 && 
        targetNode.connectionType === ConnectionType.L21_30) {
      return true;
    }
    
    // L6-20 connections (Pizza Oven tail → Squid adapter)
    if (fromNode.connectionType === ConnectionType.L6_20 && 
        targetNode.connectionType === ConnectionType.L6_20) {
      return true;
    }
    
    // L6-30 connections (Large Espresso tail → Dogbone adapter)
    if (fromNode.connectionType === ConnectionType.L6_30 && 
        targetNode.connectionType === ConnectionType.L6_30) {
      return true;
    }
    
    return false;
  }

  return false;
}

/**
 * Calculates bezier curve control points for a cable
 * Creates a natural "relaxed" curve between two points
 */
export function calculateCablePath(
  start: { x: number; y: number },
  end: { x: number; y: number }
): {
  start: { x: number; y: number };
  control1: { x: number; y: number };
  control2: { x: number; y: number };
  end: { x: number; y: number };
} {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Control point offset based on distance and curve tension
  const offset = distance * CABLE_CONSTANTS.CURVE_TENSION;

  // Create control points that make the curve sag naturally
  const control1 = {
    x: start.x + dx * 0.3,
    y: start.y + offset * 0.5,
  };

  const control2 = {
    x: end.x - dx * 0.3,
    y: end.y + offset * 0.5,
  };

  return {
    start,
    control1,
    control2,
    end,
  };
}

/**
 * Converts a bezier path to SVG path string
 */
export function pathToSvgString(path: {
  start: { x: number; y: number };
  control1: { x: number; y: number };
  control2: { x: number; y: number };
  end: { x: number; y: number };
}): string {
  return `M ${path.start.x} ${path.start.y} C ${path.control1.x} ${path.control1.y}, ${path.control2.x} ${path.control2.y}, ${path.end.x} ${path.end.y}`;
}

/**
 * Gets the visual properties for a cable type
 */
export function getCableVisualProps(cableType: 'edison' | 'flat-wire'): {
  color: string;
  width: number;
} {
  return {
    color: cableType === 'edison' 
      ? CABLE_CONSTANTS.EDISON_COLOR 
      : CABLE_CONSTANTS.FLAT_WIRE_COLOR,
    width: cableType === 'edison' 
      ? CABLE_CONSTANTS.EDISON_WIDTH 
      : CABLE_CONSTANTS.FLAT_WIRE_WIDTH,
  };
}

/**
 * Finds the closest compatible node to snap to
 * Returns null if none found within snap distance
 */
export function findSnapTarget(
  point: { x: number; y: number },
  allNodes: Node[],
  draggingCable: DraggingCable | null,
  allItems: Map<string, PlacedItem>
): Node | null {
  const nearby = findNearbyNodes(point, allNodes, draggingCable, allItems);
  
  // Return the first compatible node (already sorted by distance)
  const compatible = nearby.find(n => n.isCompatible);
  return compatible ? compatible.node : null;
}

/**
 * Checks if a point is near a cable (for selection)
 */
export function isPointNearCable(
  point: { x: number; y: number },
  cable: Cable,
  threshold: number = 15
): boolean {
  if (!cable.path) return false;

  // Simple distance check to cable midpoint
  const midX = (cable.path.start.x + cable.path.end.x) / 2;
  const midY = (cable.path.start.y + cable.path.end.y) / 2;

  const dx = point.x - midX;
  const dy = point.y - midY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= threshold;
}

/**
 * NEW: Gets node color based on connection type, item type, and pair ID
 * Implements the new color scheme:
 * - 20A outputs (standard equipment/accessories): Black
 * - Doghouse outputs: Black (pair 1), Red (pair 2), Blue (pair 3)
 * - L21-30 outputs: Green
 * - 20A inputs (including tails): Grey
 * - All other special inputs/outputs: Beige
 */
export function getNodeColor(
  node: Node,
  allItems?: Map<string, PlacedItem>
): string {
  // Find the item this node belongs to
  const item = allItems?.get(node.itemId);
  
  // Input nodes (including equipment tails)
  if (node.type === 'input') {
    // 20A inputs are grey
    if (node.connectionType === ConnectionType.EDISON) {
      return '#9ca3af'; // Grey
    }
    // All other special inputs are beige
    return '#d4a574'; // Beige
  }
  
  // Output nodes
  if (node.type === 'output') {
    // Check if this is a doghouse
    if (item && item.itemType === ItemType.DOGHOUSE && node.pairId !== undefined) {
      // Doghouse pair colors
      if (node.pairId === 1) return '#000000'; // Black
      if (node.pairId === 2) return '#ef4444'; // Red
      if (node.pairId === 3) return '#3b82f6'; // Blue
    }
    
    // L21-30 outputs are green
    if (node.connectionType === ConnectionType.L21_30) {
      return '#10b981'; // Green
    }
    
    // Standard 20A outputs are black
    if (node.connectionType === ConnectionType.EDISON) {
      return '#000000'; // Black
    }
    
    // All other special outputs are beige
    return '#d4a574'; // Beige
  }
  
  // Fallback (shouldn't reach here)
  return '#6b7280';
}

/**
 * NEW: Gets the color a cable should be based on its source node
 * Cables inherit the color of their output (source) node
 */
export function getCableColorFromNode(
  cable: Cable,
  allNodes: Node[],
  allItems: Map<string, PlacedItem>
): string {
  if (!cable.fromNodeId) {
    // Cable not connected yet, use default color
    return cable.type === 'edison' 
      ? CABLE_CONSTANTS.EDISON_COLOR 
      : CABLE_CONSTANTS.FLAT_WIRE_COLOR;
  }
  
  // Find the source node
  const fromNode = allNodes.find(n => n.id === cable.fromNodeId);
  if (!fromNode) {
    // Node not found, use default
    return cable.type === 'edison' 
      ? CABLE_CONSTANTS.EDISON_COLOR 
      : CABLE_CONSTANTS.FLAT_WIRE_COLOR;
  }
  
  // Return the node's color
  return getNodeColor(fromNode, allItems);
}