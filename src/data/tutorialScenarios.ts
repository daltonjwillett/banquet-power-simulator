import { ItemType } from '../types';
import type { Scenario } from '../types';

// ============================================================================
// TUTORIAL SCENARIOS (1001, 1002, 1003)
// ============================================================================
// These scenarios are designed to teach basic game mechanics step-by-step

const BOUNDARY_PADDING = {
  left: 70,
  top: 240,
  right: 70,
  bottom: 200,
};

export const TUTORIAL_SCENARIOS: Scenario[] = [
  // ==========================================================================
  // TUTORIAL SCENARIO 1001: Basic Connection
  // ==========================================================================
  // Goal: Connect a single toaster to a single outlet
  {
    id: 1001,
    name: 'Tutorial 1 - Basic Connection',
    difficulty: 'easy',
    
    outlets: [
      {
        id: 'outlet1',
        itemType: ItemType.OUTLET_20A,
        x: BOUNDARY_PADDING.left,
        y: 800, // Centered vertically
        locked: true,
      },
    ],
    
    tables: [
      {
        id: 'table1',
        x: 540, // Center of canvas
        y: 800,
        width: 240,
        height: 120,
        equipment: [], // Empty array - actual equipment defined below
      },
    ],
    
    equipment: [
      {
        id: 'equipment1',
        itemType: ItemType.TOASTER,
        x: 700, // Right of center, offset from table
        y: 820,
        locked: true,
      },
    ],
  },

  // ==========================================================================
  // TUTORIAL SCENARIO 1002: Using Shop & Accessories
  // ==========================================================================
  // Goal: Use quad box from shop to power multiple items
  {
    id: 1002,
    name: 'Tutorial 2 - Using Shop',
    difficulty: 'easy',
    
    outlets: [
      {
        id: 'outlet1',
        itemType: ItemType.OUTLET_20A,
        x: BOUNDARY_PADDING.left,
        y: 800,
        locked: true,
      },
    ],
    
    tables: [
      {
        id: 'table1',
        x: 540,
        y: 800,
        width: 280,
        height: 120,
        equipment: [], // Empty array - actual equipment defined below
      },
    ],
    
    equipment: [
      {
        id: 'equipment1',
        itemType: ItemType.TOASTER,
        x: 600,
        y: 820,
        locked: true,
      },
      {
        id: 'equipment2',
        itemType: ItemType.SINGLE_HEAT_LAMP,
        x: 720,
        y: 820,
        locked: true,
      },
      {
        id: 'equipment3',
        itemType: ItemType.SINGLE_HEAT_LAMP,
        x: 800,
        y: 820,
        locked: true,
      },
    ],
  },

  // ==========================================================================
  // TUTORIAL SCENARIO 1003: L21-30 & Doghouse
  // ==========================================================================
  // Goal: Use L21-30 outlet with doghouse and flatwire cable
  {
    id: 1003,
    name: 'Tutorial 3 - Advanced Power',
    difficulty: 'easy',
    
    outlets: [
      {
        id: 'outlet1',
        itemType: ItemType.OUTLET_L21_30,
        x: BOUNDARY_PADDING.left,
        y: 700,
        locked: true,
      },
    ],
    
    tables: [
      {
        id: 'table1',
        x: 450,
        y: 600,
        width: 240,
        height: 120,
        equipment: [], // Empty array - actual equipment defined below
      },
      {
        id: 'table2',
        x: 650,
        y: 900,
        width: 280,
        height: 120,
        equipment: [], // Empty array - actual equipment defined below
      },
    ],
    
    equipment: [
      // Table 1: Two toasters
      {
        id: 'equipment1',
        itemType: ItemType.TOASTER,
        x: 550,
        y: 620,
        locked: true,
      },
      {
        id: 'equipment2',
        itemType: ItemType.TOASTER,
        x: 650,
        y: 620,
        locked: true,
      },
      // Table 2: Two single heat lamps + waffle iron
      {
        id: 'equipment3',
        itemType: ItemType.SINGLE_HEAT_LAMP,
        x: 710,
        y: 920,
        locked: true,
      },
      {
        id: 'equipment4',
        itemType: ItemType.SINGLE_HEAT_LAMP,
        x: 790,
        y: 920,
        locked: true,
      },
      {
        id: 'equipment5',
        itemType: ItemType.WAFFLE_IRON,
        x: 890,
        y: 920,
        locked: true,
      },
    ],
  },
];

// Helper function to get tutorial scenario by ID
export function getTutorialScenarioById(id: number): Scenario | undefined {
  return TUTORIAL_SCENARIOS.find(s => s.id === id);
}

// Check if a scenario ID is a tutorial
export function isTutorialScenario(id: number): boolean {
  return id >= 1001 && id <= 1003;
}