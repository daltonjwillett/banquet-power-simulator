import type { Cable as CableType, DraggingCable } from './cable';
// ============================================================================
// ENUMS (using const objects for better compatibility)
// ============================================================================

export const ConnectionType = {
  EDISON: 'edison',           // Regular 15/20A plugs
  TRUE_20: 'true20',          // 20A dedicated
  L21_30: 'l21-30',           // 3-phase 30A
  L6_20: 'l6-20',             // 208V 20A
  L6_30: 'l6-30',             // 208V 30A
} as const;

export type ConnectionType = typeof ConnectionType[keyof typeof ConnectionType];

export const ItemType = {
  // Outlets
  OUTLET_20A: 'outlet-20a',
  OUTLET_L21_30: 'outlet-l21-30',
  
  // Cables
  EDISON_CABLE: 'edison-cable',
  FLATWIRE_CABLE: 'flatwire-cable',
  
  // Accessories
  TRI_TAP: 'tri-tap',
  QUAD_BOX: 'quad-box',
  SIX_WAY: 'six-way',
  DOGHOUSE: 'doghouse',
  SQUID: 'squid',
  DOG_BONE: 'dog-bone',
  
  // Equipment
  TOASTER: 'toaster',
  SINGLE_HEAT_LAMP: 'single-heat-lamp',
  DOUBLE_HEAT_LAMP: 'double-heat-lamp',
  SM_ESPRESSO: 'sm-espresso',
  LG_ESPRESSO: 'lg-espresso',
  LG_ESPRESSO_PUMP: 'lg-espresso-pump',
  PANINI: 'panini',
  PIZZA_OVEN: 'pizza-oven',
  CHOCOLATE_FOUNTAIN: 'chocolate-fountain',
  HOT_BOX: 'hot-box',
  COLD_BOX: 'cold-box',
  ICE_CREAM_CART: 'ice-cream-cart',
  FRYER: 'fryer',
  CONVEYER: 'conveyer',
  POPCORN: 'popcorn',
  BLENDER: 'blender',
  WAFFLE_IRON: 'waffle-iron',
  COTTON_CANDY: 'cotton-candy',
} as const;

export type ItemType = typeof ItemType[keyof typeof ItemType];

// ============================================================================
// NODE AND ITEM DEFINITIONS
// ============================================================================

export interface NodeDefinition {
  id: string;
  type: 'input' | 'output';
  connectionType: ConnectionType;
  maxAmps?: number; // For output nodes with limits
  pairId?: number; // For doghouse pairs (1, 2, or 3)
  offsetX: number; 
  offsetY: number;
}

export interface ItemDefinition {
  type: ItemType;
  watts?: number; // For equipment (power consumption)
  nodes: NodeDefinition[];
  ampLimit?: number; // For accessories that limit power flow
  canDoTrue20?: boolean; // For outlets/accessories that support True-20
  imagePath?: string; // Path to the PNG image
  displayName: string; // Human-readable name
}

// ============================================================================
// GAME STATE TYPES
// ============================================================================

export interface PlacedItem {
  id: string; // Unique instance ID (e.g., "outlet1", "cable3")
  itemType: ItemType;
  x: number;
  y: number;
  locked?: boolean; // True for outlets and equipment in scenarios
  rotation?: number; // For visual rotation (degrees)
}

export interface Connection {
  fromNodeId: string; // Format: "itemId.nodeId"
  toNodeId: string;   // Format: "itemId.nodeId"
}

export interface Cable extends PlacedItem {
  fromNodeId: string; // Both ends must be connected
  toNodeId: string;   // Both ends must be connected
}

// ============================================================================
// SCENARIO TYPES
// ============================================================================

export interface Table {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  equipment: ItemType[]; // Max 4 items per table
}

export interface Scenario {
  id: number; // 1-50
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  outlets: PlacedItem[]; // Fixed outlet positions
  tables: Table[];
  equipment: PlacedItem[]; // Fixed equipment positions on tables
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ConnectionValidation {
  valid: boolean;
  reason?: string;
  ampDraw?: number;
  ampLimit?: number;
}

export interface ValidationResult {
  success: boolean;
  violations: Array<{ itemId: string; reason: string }>;
  connectionStatus: Map<string, ConnectionValidation>;
}

// ============================================================================
// CHAIN TRACKING (Internal to engine)
// ============================================================================

export interface ChainLink {
  itemId: string;
  itemType: ItemType;
  nodeId: string;
  node: NodeDefinition;
  itemDef: ItemDefinition;
}

// ============================================================================
// USER AND LEADERBOARD TYPES
// ============================================================================

export interface User {
  employeeId: string; // 6-digit employee number
  name: string;
  createdAt: string;
}

export interface ScenarioAttempt {
  id: string;
  employeeId: string;
  scenarioId: number;
  timeSeconds: number;
  completedAt: string;
  usedHint1: boolean;
  usedHint2: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  employeeId: string;
  employeeName: string;
  timeSeconds: number;
  completedAt: string;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface GameState {
  currentScenario: Scenario | null;
  placedAccessories: PlacedItem[]; // User-placed items (accessories only, NOT cables)
  cables: CableType[]; // ADD THIS - User-drawn cables
  draggingCable: DraggingCable | null; // ADD THIS - Cable being drawn
  selectedCableType: 'edison' | 'flat-wire' | null; // ADD THIS - Selected cable from shop
  connections: Connection[];
  isRunning: boolean;
  startTime: number | null;
  elapsedTime: number;
  hint1Used: boolean;
  hint2Used: boolean;
  selectedItemId: string | null;
  shopOpen: boolean;
  selectedShopItem: ItemType | null;
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface AppSettings {
  employeeId: string | null;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// Re-export from GameEngine
export type { DetailedValidationResult } from '../engine/GameEngine';