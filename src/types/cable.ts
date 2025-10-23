// src/types/cable.ts

import { ConnectionType } from './index';

/**
 * Represents a connection node on an item (input or output point)
 */
export interface Node {
  id: string; // Unique identifier: `${itemId}-${nodeType}-${index}`
  itemId: string; // ID of the item this node belongs to
  type: 'input' | 'output';
  connectionType: ConnectionType; // What type of cable can connect here
  position: {
    x: number; // Absolute canvas position
    y: number;
  };
  pairId?: number; // For doghouse pairs (1, 2, or 3)
}

/**
 * Represents a physical cable connection between two nodes
 */
export interface Cable {
  id: string; // Unique identifier
  type: 'edison' | 'flat-wire';
  fromNodeId: string; // Output node ID (required - cables must be complete)
  toNodeId: string; // Input node ID (required - cables must be complete)
  
  // Visual properties
  color: string; // Inherited from source node
  width: number; // 4px for edison, 8px for flat-wire
  
  // Bezier curve control points (calculated for smooth curves)
  path?: {
    start: { x: number; y: number };
    control1: { x: number; y: number };
    control2: { x: number; y: number };
    end: { x: number; y: number };
  };
}

/**
 * Temporary cable being drawn (before connection is complete)
 */
export interface DraggingCable {
  type: 'edison' | 'flat-wire';
  fromNodeId: string;
  fromPosition: { x: number; y: number }; // Absolute canvas position
  currentPosition: { x: number; y: number }; // Current cursor position
}

/**
 * Node information from item definitions (static data)
 * Matches the structure already in itemDefinitions.ts
 */
export interface NodeDefinition {
  id: string; // Node identifier like 'in', 'out', 'out1', etc.
  type: 'input' | 'output';
  connectionType: ConnectionType;
  maxAmps?: number; // Maximum amperage this node can handle
  pairId?: number; // For doghouse pairs (1, 2, or 3)
  offsetX: number; // Offset from item's top-left corner (in pixels)
  offsetY: number; // Offset from item's top-left corner (in pixels)
}

/**
 * Helper type for finding nearby nodes during cable dragging
 */
export interface NearbyNode {
  node: Node;
  distance: number;
  isCompatible: boolean; // Can the current cable connect to this node?
}

/**
 * Constants for cable visualization and interaction
 */
export const CABLE_CONSTANTS = {
  SNAP_DISTANCE: 35, // Pixels - how close cursor needs to be to snap
  EDISON_COLOR: '#6b7280',
  FLAT_WIRE_COLOR: '#d4a574',
  EDISON_WIDTH: 4,
  FLAT_WIRE_WIDTH: 8,
  
  // Node visualization
  NODE_RADIUS: 30, // Size of connection point circles (1.5x bigger for mobile)
  NODE_STROKE_WIDTH: 4,
  
  // NEW: Updated node colors based on requirements
  NODE_COLORS: {
    // Outputs
    OUTPUT_20A: '#000000',        // Black - standard 20A outputs
    DOGHOUSE_PAIR_1: '#000000',   // Black - first doghouse pair
    DOGHOUSE_PAIR_2: '#ef4444',   // Red - second doghouse pair  
    DOGHOUSE_PAIR_3: '#3b82f6',   // Blue - third doghouse pair
    OUTPUT_L21_30: '#10b981',     // Green - L21-30 outputs
    OUTPUT_SPECIAL: '#d4a574',    // Beige - other special outputs
    
    // Inputs
    INPUT_20A: '#9ca3af',         // Grey - standard 20A inputs (including tails)
    INPUT_SPECIAL: '#d4a574',     // Beige - other special inputs
    
    // Incomplete cable indicator
    INCOMPLETE: '#fbbf24',        // Yellow - for loose cable ends
  } as const,
  
  // Bezier curve tension (how much the curve bends)
  CURVE_TENSION: 0.4, // 0 = straight line, 1 = maximum curve
} as const;