import { ItemType } from '../types';
import type { Scenario, PlacedItem } from '../types';

// ============================================================================
// GRID SYSTEM CONSTANTS
// ============================================================================

const CELL_SIZE = 160; // Slightly smaller cells to fit better
const CANVAS_WIDTH = 1080;


// Safe boundaries (avoid edges and toolbars)
const BOUNDARY_PADDING = {
  left: 80,   // Left edge for outlets
  right: 80,  // Right edge for outlets
  top: 200,   // Top padding - avoid status bar (80px notch + 100px status bar + 20px buffer)
  bottom: 200, // Bottom padding - avoid toolbar (150px toolbar + 50px buffer)
};

// Helper to convert grid coordinates to pixel coordinates (with safety padding)
function gridToPixel(col: number, row: number): { x: number; y: number } {
  // For outlets on edges (col 0 or 5), use boundary padding directly
  let x: number;
  if (col === 0) {
    x = BOUNDARY_PADDING.left; // Left wall - 80px
  } else if (col === 5) {
    x = CANVAS_WIDTH - BOUNDARY_PADDING.right; // Right wall - 1000px
  } else {
    // For tables/equipment in columns 1-4, distribute evenly in middle area
    const usableWidth = CANVAS_WIDTH - BOUNDARY_PADDING.left - BOUNDARY_PADDING.right; // 1080 - 80 - 80 = 920px
    const innerCols = 4; // Columns 1, 2, 3, 4
    const colWidth = usableWidth / innerCols; // 920 / 4 = 230px per column
    
    // Calculate position: start at left boundary + offset for this column + center of column
    x = BOUNDARY_PADDING.left + ((col - 1) * colWidth) + (colWidth / 2);
  }
  
  const y = BOUNDARY_PADDING.top + (row * CELL_SIZE);
  
  return { x, y };
}

// ============================================================================
// EQUIPMENT PLACEMENT HELPER
// ============================================================================

// NOTE: The following equipment types are STANDALONE (not placed on tables):
// - Hot Box
// - Cold Box  
// - Ice Cream Cart
// - Pizza Oven
// These should be positioned near tables but as separate locked items

const EQUIPMENT_X_OFFSET = 120; // Offset equipment 120px to the right for better visual balance
const EQUIPMENT_Y_OFFSET = 20;

function placeEquipmentOnTable(
  table: { x: number; y: number; width: number; height: number },
  equipmentTypes: ItemType[],
  startId: number
): PlacedItem[] {
  const items: PlacedItem[] = [];
  const count = equipmentTypes.length;

  // Dynamic offset: more items = more offset to keep centered
  let dynamicOffset = EQUIPMENT_X_OFFSET; // default 120px for 1-3 items

  if (count >= 6) {
    dynamicOffset = 200;
  } else if (count === 5) {
    dynamicOffset = 180;
  } else if (count === 4) {
    dynamicOffset = 150;
  }
  
  if (count === 0) return items;
  
  if (count === 1) {
    // Single item - center it on the table
    items.push({
      id: `equipment${startId}`,
      itemType: equipmentTypes[0],
      x: table.x + dynamicOffset, // Apply offset
      y: table.y + EQUIPMENT_Y_OFFSET, // Table center y
      locked: true,
    });
  } else if (count === 2) {
    // Two items - space them evenly
    const gap = table.width / 3;
    
    items.push({
      id: `equipment${startId}`,
      itemType: equipmentTypes[0],
      x: table.x - gap / 2 + dynamicOffset, // Left of center + offset
      y: table.y + EQUIPMENT_Y_OFFSET,
      locked: true,
    });
    
    items.push({
      id: `equipment${startId + 1}`,
      itemType: equipmentTypes[1],
      x: table.x + gap / 2 + dynamicOffset, // Right of center + offset
      y: table.y + EQUIPMENT_Y_OFFSET,
      locked: true,
    });
  } else if (count === 3) {
    // Three items - distribute evenly
    const spacing = table.width / 4;
    
    items.push({
      id: `equipment${startId}`,
      itemType: equipmentTypes[0],
      x: table.x - spacing + dynamicOffset, // Left + offset
      y: table.y + EQUIPMENT_Y_OFFSET,
      locked: true,
    });
    
    items.push({
      id: `equipment${startId + 1}`,
      itemType: equipmentTypes[1],
      x: table.x + dynamicOffset, // Center + offset
      y: table.y + EQUIPMENT_Y_OFFSET,
      locked: true,
    });
    
    items.push({
      id: `equipment${startId + 2}`,
      itemType: equipmentTypes[2],
      x: table.x + spacing + dynamicOffset, // Right + offset
      y: table.y + EQUIPMENT_Y_OFFSET,
      locked: true,
    });
  } else {
    // Four or more items
    // Distribute evenly across table width
    const totalWidth = table.width;
    const spacing = totalWidth / (count + 1);
    
    equipmentTypes.forEach((type, index) => {
      // Start from left edge of table, then add spacing for each item
      const leftEdge = table.x - table.width / 2;
      const xPos = leftEdge + spacing * (index + 1) + dynamicOffset; // Apply offset
      
      items.push({
        id: `equipment${startId + index}`,
        itemType: type,
        x: xPos,
        y: table.y,
        locked: true,
      });
    });
  }
  
  return items;
}

// ============================================================================
// SCENARIO DATABASE (50 SCENARIOS)
// ============================================================================

export const SCENARIOS: Scenario[] = [
  // ==========================================================================
  // SCENARIO 1 - EASY: "Breakfast Service"
  // ==========================================================================
  {
    id: 1,
    name: 'Scenario 1 - Breakfast Service',
    difficulty: 'easy',
    
    outlets: [
      {
        id: 'outlet1',
        itemType: ItemType.OUTLET_20A,
        ...gridToPixel(0, 1), // Left wall
        locked: true,
      },
      {
        id: 'outlet2',
        itemType: ItemType.OUTLET_L21_30,
        ...gridToPixel(5, 5), // Right wall
        locked: true,
      },
    ],
    
    tables: [
      {
        id: 'table1',
        ...gridToPixel(2, 0),
        width: 240,
        height: 120,
        equipment: [ItemType.TOASTER, ItemType.TOASTER],
      },
      {
        id: 'table2',
        ...gridToPixel(3, 2),
        width: 240,
        height: 120,
        equipment: [ItemType.SM_ESPRESSO],
      },
      {
        id: 'table3',
        ...gridToPixel(2, 3),
        width: 240,
        height: 120,
        equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
      },
      {
        id: 'table4',
        ...gridToPixel(3, 5),
        width: 240,
        height: 120,
        equipment: [ItemType.SM_ESPRESSO],
      },
      {
        id: 'table5',
        ...gridToPixel(2, 6),
        width: 240,
        height: 120,
        equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
      },
    ],
    
    equipment: [
      // Table 1: Two Toasters
      ...placeEquipmentOnTable(
        { ...gridToPixel(2, 0), width: 240, height: 120 },
        [ItemType.TOASTER, ItemType.TOASTER], 
        1
      ),
      
      // Table 2: Small Espresso
      ...placeEquipmentOnTable(
        { ...gridToPixel(3, 2), width: 240, height: 120 },
        [ItemType.SM_ESPRESSO], 
        3
      ),
      
      // Table 3: Two Double Heat Lamps
      ...placeEquipmentOnTable(
        { ...gridToPixel(2, 3), width: 240, height: 120 },
        [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
        4
      ),
      
      // Table 4: Small Espresso
      ...placeEquipmentOnTable(
        { ...gridToPixel(3, 5), width: 240, height: 120 },
        [ItemType.SM_ESPRESSO], 
        6
      ),
      
      // Table 5: Two Single Heat Lamps
      ...placeEquipmentOnTable(
        { ...gridToPixel(2, 6), width: 240, height: 120 },
        [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
        7
      ),
    ],
  },

  // ==========================================================================
  // SCENARIO 16 - MEDIUM: "Pizza Party"
  // ==========================================================================
  {
    id: 16,
    name: 'Scenario 16 - Pizza Party',
    difficulty: 'medium',
    
    outlets: [
      {
        id: 'outlet1',
        itemType: ItemType.OUTLET_20A,
        ...gridToPixel(0, 0),
        locked: true,
      },
      {
        id: 'outlet2',
        itemType: ItemType.OUTLET_20A,
        ...gridToPixel(0, 4),
        locked: true,
      },
      {
        id: 'outlet3',
        itemType: ItemType.OUTLET_L21_30,
        ...gridToPixel(5, 1),
        locked: true,
      },
      {
        id: 'outlet4',
        itemType: ItemType.OUTLET_L21_30,
        ...gridToPixel(5, 5),
        locked: true,
      },
    ],
    
    tables: [
      {
        id: 'table1',
        ...gridToPixel(2, 0),
        width: 280,
        height: 140,
        equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
      },
      {
        id: 'table2',
        ...gridToPixel(3, 3),
        width: 280,
        height: 140,
        equipment: [ItemType.PANINI, ItemType.SINGLE_HEAT_LAMP],
      },
      {
        id: 'table4',
        ...gridToPixel(2, 5),
        width: 420,
        height: 140,
        equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
      },
    ],
    
    equipment: [
      // Table 1: Two Double Heat Lamps
      ...placeEquipmentOnTable(
        { ...gridToPixel(2, 0), width: 280, height: 140 },
        [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
        1
      ),
      
      // Standalone: Two Pizza Ovens (no table)
      {
        id: 'equipment3',
        itemType: ItemType.PIZZA_OVEN,
        ...gridToPixel(2, 1),
        locked: true,
      },
      {
        id: 'equipment4',
        itemType: ItemType.PIZZA_OVEN,
        ...gridToPixel(3, 1),
        locked: true,
      },
      
      // Table 2: Panini and Single Heat Lamp
      ...placeEquipmentOnTable(
        { ...gridToPixel(3, 3), width: 280, height: 140 },
        [ItemType.PANINI, ItemType.SINGLE_HEAT_LAMP], 
        5
      ),
      
      // Standalone: Two Hot Boxes (no table)
      {
        id: 'equipment7',
        itemType: ItemType.HOT_BOX,
        ...gridToPixel(1, 4),
        locked: true,
      },
      {
        id: 'equipment8',
        itemType: ItemType.HOT_BOX,
        ...gridToPixel(2, 4),
        locked: true,
      },
      
      // Table 4: Two Double Heat Lamps and Single Heat Lamp
      ...placeEquipmentOnTable(
        { ...gridToPixel(2, 5), width: 420, height: 140 },
        [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
        9
      ),
    ],
  },

  // ==========================================================================
  // SCENARIO 36 - HARD: "Double Espresso Rush"
  // ==========================================================================
  {
    id: 36,
    name: 'Scenario 36 - Double Espresso Rush',
    difficulty: 'hard',
    
    outlets: [
      {
        id: 'outlet1',
        itemType: ItemType.OUTLET_20A,
        ...gridToPixel(0, 1),
        locked: true,
      },
      {
        id: 'outlet2',
        itemType: ItemType.OUTLET_20A,
        ...gridToPixel(0, 6),
        locked: true,
      },
      {
        id: 'outlet3',
        itemType: ItemType.OUTLET_L21_30,
        ...gridToPixel(5, 0),
        locked: true,
      },
      {
        id: 'outlet4',
        itemType: ItemType.OUTLET_L21_30,
        ...gridToPixel(5, 2),
        locked: true,
      },
      {
        id: 'outlet5',
        itemType: ItemType.OUTLET_L21_30,
        ...gridToPixel(5, 4),
        locked: true,
      },
      {
        id: 'outlet6',
        itemType: ItemType.OUTLET_L21_30,
        ...gridToPixel(5, 6),
        locked: true,
      },
    ],
    
    tables: [
      {
        id: 'table1',
        ...gridToPixel(2, 0),
        width: 280,
        height: 140,
        equipment: [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP],
      },
      {
        id: 'table2',
        ...gridToPixel(3, 1),
        width: 280,
        height: 140,
        equipment: [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP],
      },
      {
        id: 'table3',
        ...gridToPixel(1, 2),
        width: 280,
        height: 140,
        equipment: [ItemType.TOASTER, ItemType.TOASTER],
      },
      {
        id: 'table4',
        ...gridToPixel(3, 3),
        width: 420,
        height: 140,
        equipment: [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
      },
      {
        id: 'table5',
        ...gridToPixel(1, 4),
        width: 280,
        height: 140,
        equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
      },
      {
        id: 'table6',
        ...gridToPixel(3, 5),
        width: 280,
        height: 140,
        equipment: [ItemType.TOASTER, ItemType.TOASTER],
      },
      {
        id: 'table7',
        ...gridToPixel(1, 6),
        width: 280,
        height: 140,
        equipment: [ItemType.BLENDER, ItemType.BLENDER],
      },
      {
        id: 'table8',
        ...gridToPixel(2, 3),
        width: 280,
        height: 140,
        equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
      },
    ],
    
    equipment: [
      // Table 1: Large Espresso + Pump
      ...placeEquipmentOnTable(
        { ...gridToPixel(2, 0), width: 280, height: 140 },
        [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP], 
        1
      ),
      
      // Table 2: Large Espresso + Pump
      ...placeEquipmentOnTable(
        { ...gridToPixel(3, 1), width: 280, height: 140 },
        [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP], 
        3
      ),
      
      // Table 3: Two Toasters
      ...placeEquipmentOnTable(
        { ...gridToPixel(1, 2), width: 280, height: 140 },
        [ItemType.TOASTER, ItemType.TOASTER], 
        5
      ),
      
      // Table 4: Two Waffle Irons + Two Single Heat Lamps
      ...placeEquipmentOnTable(
        { ...gridToPixel(3, 3), width: 420, height: 140 },
        [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
        7
      ),
      
      // Table 5: Two Double Heat Lamps
      ...placeEquipmentOnTable(
        { ...gridToPixel(1, 4), width: 280, height: 140 },
        [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
        11
      ),
      
      // Table 6: Two Toasters
      ...placeEquipmentOnTable(
        { ...gridToPixel(3, 5), width: 280, height: 140 },
        [ItemType.TOASTER, ItemType.TOASTER], 
        13
      ),
      
      // Table 7: Two Blenders
      ...placeEquipmentOnTable(
        { ...gridToPixel(1, 6), width: 280, height: 140 },
        [ItemType.BLENDER, ItemType.BLENDER], 
        15
      ),
      
      // Table 8: Double Heat Lamp + Single Heat Lamp
      ...placeEquipmentOnTable(
        { ...gridToPixel(2, 3), width: 280, height: 140 },
        [ItemType.DOUBLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
        17
      ),
    ],
  },

  // ==========================================================================
// SCENARIO 2 - EASY: "Morning Brew"
// ==========================================================================
{
  id: 2,
  name: 'Scenario 2 - Morning Brew',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 4),
      width: 240,
      height: 120,
      equipment: [ItemType.SM_ESPRESSO],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP],
    },
  ],
  
  equipment: [
    // Table 1: Two Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      1
    ),
    
    // Table 2: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 2), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      3
    ),
    
    // Table 3: Small Espresso
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 240, height: 120 },
      [ItemType.SM_ESPRESSO], 
      5
    ),
    
    // Table 4: Double Heat Lamp
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP], 
      6
    ),
  ],
},

// ==========================================================================
// SCENARIO 3 - EASY: "Simple Service"
// ==========================================================================
{
  id: 3,
  name: 'Scenario 3 - Simple Service',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 1), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.DOUBLE_HEAT_LAMP],
    },
  ],
  
  equipment: [
    // Table 1: Two Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      1
    ),
    
    // Table 2: Single Heat Lamp
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP], 
      3
    ),
    
    // Table 3: Toaster + Double Heat Lamp
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.DOUBLE_HEAT_LAMP], 
      4
    ),
  ],
},

// ==========================================================================
// SCENARIO 4 - EASY: "Toast & Warmth"
// ==========================================================================
{
  id: 4,
  name: 'Scenario 4 - Toast & Warmth',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 3), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 4),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
  ],
  
  equipment: [
    // Table 1: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      1
    ),
    
    // Table 2: Two Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 2), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      3
    ),
    
    // Table 3: Single Heat Lamp
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP], 
      5
    ),
    
    // Table 4: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      6
    ),
  ],
},

// ==========================================================================
// SCENARIO 5 - EASY: "Coffee Corner"
// ==========================================================================
{
  id: 5,
  name: 'Scenario 5 - Coffee Corner',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.PANINI],
    },
  ],
  
  equipment: [
    // Table 1: Two Small Espresso Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 240, height: 120 },
      [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO], 
      1
    ),
    
    // Table 2: Two Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      3
    ),
    
    // Table 3: Toaster + Panini
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.PANINI], 
      5
    ),
  ],
},

// ==========================================================================
// SCENARIO 6 - EASY: "Breakfast Bar"
// ==========================================================================
{
  id: 6,
  name: 'Scenario 6 - Breakfast Bar',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 1), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 2),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 4),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.WAFFLE_IRON],
    },
  ],
  
  equipment: [
    // Table 1: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      1
    ),
    
    // Table 2: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 2), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      3
    ),
    
    // Table 3: Single Heat Lamp
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP], 
      6
    ),
    
    // Table 4: Double Heat Lamp + Waffle Iron
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.WAFFLE_IRON], 
      7
    ),
  ],
},

// ==========================================================================
// SCENARIO 7 - EASY: "Snack Station"
// ==========================================================================
{
  id: 7,
  name: 'Scenario 7 - Snack Station',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.POPCORN],
    },
    {
      id: 'table3',
      ...gridToPixel(3, 3),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
    {
      id: 'table4',
      ...gridToPixel(2, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP],
    },
  ],
  
  equipment: [
    // Table 1: Two Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      1
    ),
    
    // Table 2: Popcorn Machine
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 2), width: 240, height: 120 },
      [ItemType.POPCORN], 
      3
    ),
    
    // Table 3: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 240, height: 120 },
      [ItemType.TOASTER], 
      4
    ),
    
    // Table 4: Double Heat Lamp
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP], 
      5
    ),
  ],
},

// ==========================================================================
// SCENARIO 8 - EASY: "Warm Start"
// ==========================================================================
{
  id: 8,
  name: 'Scenario 8 - Warm Start',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 1), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      1
    ),
    
    // Table 2: Single Heat Lamp + Double Heat Lamp
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      4
    ),
    
    // Table 3: Double Heat Lamp + Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.TOASTER], 
      6
    ),
  ],
},

// ==========================================================================
// SCENARIO 9 - EASY: "Quick Bites"
// ==========================================================================
{
  id: 9,
  name: 'Scenario 9 - Quick Bites',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 3), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 2), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
  ],
  
  equipment: [
    // Table 1: Two Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      1
    ),
    
    // Standalone: Hot Box
    {
      id: 'equipment3',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(3, 2),
      locked: true,
    },
    
    // Table 2: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 240, height: 120 },
      [ItemType.TOASTER], 
      4
    ),
    
    // Table 3: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      5
    ),
  ],
},

// ==========================================================================
// SCENARIO 10 - EASY: "Espresso Express"
// ==========================================================================
{
  id: 10,
  name: 'Scenario 10 - Espresso Express',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.DOUBLE_HEAT_LAMP],
    },
  ],
  
  equipment: [
    // Table 1: Two Small Espresso Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 240, height: 120 },
      [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO], 
      1
    ),
    
    // Table 2: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      3
    ),
    
    // Table 3: Toaster + Double Heat Lamp
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.DOUBLE_HEAT_LAMP], 
      6
    ),
  ],
},

// ==========================================================================
// SCENARIO 11 - EASY: "Dessert Delight"
// ==========================================================================
{
  id: 11,
  name: 'Scenario 11 - Dessert Delight',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 1), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 240,
      height: 120,
      equipment: [ItemType.CHOCOLATE_FOUNTAIN],
    },
    {
      id: 'table2',
      ...gridToPixel(2, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(3, 4),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Chocolate Fountain
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 240, height: 120 },
      [ItemType.CHOCOLATE_FOUNTAIN], 
      1
    ),
    
    // Table 2: Two Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 2), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      2
    ),
    
    // Table 3: Single Heat Lamp
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 4), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP], 
      4
    ),
    
    // Table 4: Double Heat Lamp + Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.TOASTER], 
      5
    ),
  ],
},

// ==========================================================================
// SCENARIO 12 - EASY: "Waffle Wagon"
// ==========================================================================
{
  id: 12,
  name: 'Scenario 12 - Waffle Wagon',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Two Waffle Irons
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 240, height: 120 },
      [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON], 
      1
    ),
    
    // Table 2: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      3
    ),
    
    // Table 3: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      6
    ),
    
    // Table 4: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      8
    ),
  ],
},

// ==========================================================================
// SCENARIO 13 - EASY: "Smoothie Setup"
// ==========================================================================
{
  id: 13,
  name: 'Scenario 13 - Smoothie Setup',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 1), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.BLENDER, ItemType.BLENDER],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Two Blenders
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 240, height: 120 },
      [ItemType.BLENDER, ItemType.BLENDER], 
      1
    ),
    
    // Table 2: Two Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      3
    ),
    
    // Table 3: Double Heat Lamp + Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.TOASTER], 
      5
    ),
  ],
},

// ==========================================================================
// SCENARIO 14 - EASY: "Panini Party"
// ==========================================================================
{
  id: 14,
  name: 'Scenario 14 - Panini Party',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 3), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 2), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.PANINI, ItemType.PANINI],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Two Panini Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 240, height: 120 },
      [ItemType.PANINI, ItemType.PANINI], 
      1
    ),
    
    // Table 2: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      3
    ),
    
    // Table 3: Double Heat Lamp + Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.TOASTER], 
      6
    ),
  ],
},

// ==========================================================================
// SCENARIO 15 - EASY: "Carnival Treats"
// ==========================================================================
{
  id: 15,
  name: 'Scenario 15 - Carnival Treats',
  difficulty: 'easy',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 240,
      height: 120,
      equipment: [ItemType.COTTON_CANDY],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.POPCORN],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 2),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 4),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Cotton Candy Machine
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 240, height: 120 },
      [ItemType.COTTON_CANDY], 
      1
    ),
    
    // Table 2: Popcorn Machine
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 1), width: 240, height: 120 },
      [ItemType.POPCORN], 
      2
    ),
    
    // Table 3: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 2), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      3
    ),
    
    // Table 4: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 4), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      6
    ),
    
    // Table 5: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      8
    ),
  ],
},

// ==========================================================================
// SCENARIO 17 - MEDIUM: "Coffee Rush Hour"
// ==========================================================================
{
  id: 17,
  name: 'Scenario 17 - Coffee Rush Hour',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 1), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 3), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 280,
      height: 140,
      equipment: [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 2),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 4),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Three Small Espresso Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 280, height: 140 },
      [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO], 
      1
    ),
    
    // Table 2: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 2), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      4
    ),
    
    // Table 3: Single Heat Lamp
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP], 
      7
    ),
    
    // Table 4: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      8
    ),
    
    // Table 5: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      10
    ),
  ],
},

// ==========================================================================
// SCENARIO 18 - MEDIUM: "Fried Favorites"
// ==========================================================================
{
  id: 18,
  name: 'Scenario 18 - Fried Favorites',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 3), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 240,
      height: 120,
      equipment: [ItemType.FRYER],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.FRYER],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 2),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 4),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Fryer
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 240, height: 120 },
      [ItemType.FRYER], 
      1
    ),
    
    // Table 2: Fryer
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 1), width: 240, height: 120 },
      [ItemType.FRYER], 
      2
    ),
    
    // Table 3: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 2), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      3
    ),
    
    // Table 4: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 4), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      6
    ),
    
    // Table 5: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      8
    ),
    
    // Standalone: Hot Box
    {
      id: 'equipment9',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(3, 5),
      locked: true,
    },
  ],
},

// ==========================================================================
// SCENARIO 19 - MEDIUM: "Ice Cream Social"
// ==========================================================================
{
  id: 19,
  name: 'Scenario 19 - Ice Cream Social',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 3), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 2),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 4),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Standalone: Ice Cream Cart
    {
      id: 'equipment1',
      itemType: ItemType.ICE_CREAM_CART,
      ...gridToPixel(2, 0),
      locked: true,
    },
    
    // Standalone: Cold Box
    {
      id: 'equipment2',
      itemType: ItemType.COLD_BOX,
      ...gridToPixel(3, 1),
      locked: true,
    },
    
    // Table 1: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 2), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      3
    ),
    
    // Table 2: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 4), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      6
    ),
    
    // Table 3: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      8
    ),
  ],
},

// ==========================================================================
// SCENARIO 20 - MEDIUM: "Double Trouble"
// ==========================================================================
{
  id: 20,
  name: 'Scenario 20 - Double Trouble',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.CHOCOLATE_FOUNTAIN, ItemType.CHOCOLATE_FOUNTAIN],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 4),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 5),
      width: 280,
      height: 140,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Two Chocolate Fountains
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 240, height: 120 },
      [ItemType.CHOCOLATE_FOUNTAIN, ItemType.CHOCOLATE_FOUNTAIN], 
      1
    ),
    
    // Table 2: Two Waffle Irons
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 2), width: 240, height: 120 },
      [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON], 
      3
    ),
    
    // Table 3: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      5
    ),
    
    // Table 4: Three Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 5), width: 280, height: 140 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      8
    ),
    
    // Table 5: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      11
    ),
  ],
},

// ==========================================================================
// SCENARIO 21 - MEDIUM: "Pizza & Panini"
// ==========================================================================
{
  id: 21,
  name: 'Scenario 21 - Pizza & Panini',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 3), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.PANINI, ItemType.PANINI],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 4),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 0),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment1',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(2, 0),
      locked: true,
    },
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment2',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(2, 1),
      locked: true,
    },
    
    // Table 1: Two Panini Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 2), width: 240, height: 120 },
      [ItemType.PANINI, ItemType.PANINI], 
      3
    ),
    
    // Table 2: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 4), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      5
    ),
    
    // Table 3: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      8
    ),
    
    // Table 4: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 0), width: 240, height: 120 },
      [ItemType.TOASTER], 
      10
    ),
  ],
},

// ==========================================================================
// SCENARIO 22 - MEDIUM: "Breakfast Brigade"
// ==========================================================================
{
  id: 22,
  name: 'Scenario 22 - Breakfast Brigade',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 1), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 3), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 280,
      height: 140,
      equipment: [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 2),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 4),
      width: 240,
      height: 120,
      equipment: [ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 5),
      width: 280,
      height: 140,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO],
    },
  ],
  
  equipment: [
    // Table 1: Three Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 280, height: 140 },
      [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER], 
      1
    ),
    
    // Table 2: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 2), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      4
    ),
    
    // Table 3: Single Heat Lamp
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 240, height: 120 },
      [ItemType.SINGLE_HEAT_LAMP], 
      7
    ),
    
    // Table 4: Three Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 5), width: 280, height: 140 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      8
    ),
    
    // Table 5: Two Small Espresso Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO], 
      11
    ),
  ],
},

// ==========================================================================
// SCENARIO 23 - MEDIUM: "Heat Lamp Heaven"
// ==========================================================================
{
  id: 23,
  name: 'Scenario 23 - Heat Lamp Heaven',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      1
    ),
    
    // Table 2: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      4
    ),
    
    // Table 3: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      7
    ),
    
    // Table 4: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      9
    ),
  ],
},

// ==========================================================================
// SCENARIO 24 - MEDIUM: "Sweet Station"
// ==========================================================================
{
  id: 24,
  name: 'Scenario 24 - Sweet Station',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 240,
      height: 120,
      equipment: [ItemType.COTTON_CANDY],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.CHOCOLATE_FOUNTAIN],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.POPCORN],
    },
    {
      id: 'table4',
      ...gridToPixel(2, 3),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(3, 5),
      width: 280,
      height: 140,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table6',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Cotton Candy Machine
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 240, height: 120 },
      [ItemType.COTTON_CANDY], 
      1
    ),
    
    // Table 2: Chocolate Fountain
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 1), width: 240, height: 120 },
      [ItemType.CHOCOLATE_FOUNTAIN], 
      2
    ),
    
    // Table 3: Popcorn Machine
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 2), width: 240, height: 120 },
      [ItemType.POPCORN], 
      3
    ),
    
    // Table 4: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 3), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      4
    ),
    
    // Table 5: Three Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 5), width: 280, height: 140 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      7
    ),
    
    // Table 6: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      10
    ),
  ],
},

// ==========================================================================
// SCENARIO 25 - MEDIUM: "Convention Kickoff"
// ==========================================================================
{
  id: 25,
  name: 'Scenario 25 - Convention Kickoff',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 3),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 5),
      width: 280,
      height: 140,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Standalone: Hot Box
    {
      id: 'equipment1',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(2, 0),
      locked: true,
    },
    
    // Standalone: Hot Box
    {
      id: 'equipment2',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(3, 1),
      locked: true,
    },
    
    // Standalone: Cold Box
    {
      id: 'equipment3',
      itemType: ItemType.COLD_BOX,
      ...gridToPixel(2, 2),
      locked: true,
    },
    
    // Standalone: Cold Box
    {
      id: 'equipment4',
      itemType: ItemType.COLD_BOX,
      ...gridToPixel(3, 2),
      locked: true,
    },
    
    // Table 1: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 3), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      5
    ),
    
    // Table 2: Three Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 5), width: 280, height: 140 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      8
    ),
    
    // Table 3: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      11
    ),
  ],
},

// ==========================================================================
// SCENARIO 26 - MEDIUM: "Espresso Empire"
// ==========================================================================
{
  id: 26,
  name: 'Scenario 26 - Espresso Empire',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 1), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 3), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 280,
      height: 140,
      equipment: [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.SM_ESPRESSO],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 4),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Three Small Espresso Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 280, height: 140 },
      [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO], 
      1
    ),
    
    // Table 2: Small Espresso Machine
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 2), width: 240, height: 120 },
      [ItemType.SM_ESPRESSO], 
      4
    ),
    
    // Table 3: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      5
    ),
    
    // Table 4: Double Heat Lamp + Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.TOASTER], 
      8
    ),
  ],
},

// ==========================================================================
// SCENARIO 27 - MEDIUM: "Fryer Frenzy"
// ==========================================================================
{
  id: 27,
  name: 'Scenario 27 - Fryer Frenzy',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 3), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 240,
      height: 120,
      equipment: [ItemType.FRYER],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.FRYER],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.FRYER],
    },
    {
      id: 'table4',
      ...gridToPixel(2, 3),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(3, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table6',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Fryer
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 240, height: 120 },
      [ItemType.FRYER], 
      1
    ),
    
    // Table 2: Fryer
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 1), width: 240, height: 120 },
      [ItemType.FRYER], 
      2
    ),
    
    // Table 3: Fryer
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 2), width: 240, height: 120 },
      [ItemType.FRYER], 
      3
    ),
    
    // Table 4: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 3), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      4
    ),
    
    // Table 5: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      7
    ),
    
    // Table 6: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      9
    ),
  ],
},

// ==========================================================================
// SCENARIO 28 - MEDIUM: "Gala Night"
// ==========================================================================
{
  id: 28,
  name: 'Scenario 28 - Gala Night',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.PANINI, ItemType.PANINI],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 4),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 280,
      height: 140,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(1, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Two Panini Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 240, height: 120 },
      [ItemType.PANINI, ItemType.PANINI], 
      1
    ),
    
    // Table 2: Two Waffle Irons
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 2), width: 240, height: 120 },
      [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON], 
      3
    ),
    
    // Table 3: Four Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      5
    ),
    
    // Table 4: Three Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 280, height: 140 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      9
    ),
    
    // Table 5: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      12
    ),
  ],
},

// ==========================================================================
// SCENARIO 29 - MEDIUM: "Trade Show Setup"
// ==========================================================================
{
  id: 29,
  name: 'Scenario 29 - Trade Show Setup',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 3), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.BLENDER, ItemType.BLENDER],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 4),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 6),
      width: 280,
      height: 140,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(1, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment1',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(2, 0),
      locked: true,
    },
    
    // Table 1: Two Blenders
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 2), width: 240, height: 120 },
      [ItemType.BLENDER, ItemType.BLENDER], 
      2
    ),
    
    // Table 2: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 4), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      4
    ),
    
    // Table 3: Three Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 280, height: 140 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      7
    ),
    
    // Table 4: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 5), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      10
    ),
  ],
},

// ==========================================================================
// SCENARIO 30 - MEDIUM: "Waffle Workshop"
// ==========================================================================
{
  id: 30,
  name: 'Scenario 30 - Waffle Workshop',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 280,
      height: 140,
      equipment: [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Three Waffle Irons
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 280, height: 140 },
      [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON], 
      1
    ),
    
    // Table 2: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      4
    ),
    
    // Table 3: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      7
    ),
    
    // Table 4: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      9
    ),
  ],
},

// ==========================================================================
// SCENARIO 31 - MEDIUM: "Cold & Hot"
// ==========================================================================
{
  id: 31,
  name: 'Scenario 31 - Cold & Hot',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 3), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 3),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Standalone: Ice Cream Cart
    {
      id: 'equipment1',
      itemType: ItemType.ICE_CREAM_CART,
      ...gridToPixel(2, 0),
      locked: true,
    },
    
    // Standalone: Hot Box
    {
      id: 'equipment2',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(3, 1),
      locked: true,
    },
    
    // Standalone: Hot Box
    {
      id: 'equipment3',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(2, 2),
      locked: true,
    },
    
    // Table 1: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 3), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      4
    ),
    
    // Table 2: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      7
    ),
    
    // Table 3: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      9
    ),
  ],
},

// ==========================================================================
// SCENARIO 32 - MEDIUM: "Blender Bonanza"
// ==========================================================================
{
  id: 32,
  name: 'Scenario 32 - Blender Bonanza',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 280,
      height: 140,
      equipment: [ItemType.BLENDER, ItemType.BLENDER, ItemType.BLENDER],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 280,
      height: 140,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Three Blenders
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 280, height: 140 },
      [ItemType.BLENDER, ItemType.BLENDER, ItemType.BLENDER], 
      1
    ),
    
    // Table 2: Four Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      4
    ),
    
    // Table 3: Three Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 280, height: 140 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      8
    ),
    
    // Table 4: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      11
    ),
  ],
},

// ==========================================================================
// SCENARIO 33 - MEDIUM: "Pizza Plaza"
// ==========================================================================
{
  id: 33,
  name: 'Scenario 33 - Pizza Plaza',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 3), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 4),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 6),
      width: 280,
      height: 140,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(1, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment1',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(2, 0),
      locked: true,
    },
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment2',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(3, 1),
      locked: true,
    },
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment3',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(2, 2),
      locked: true,
    },
    
    // Table 1: Four Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      4
    ),
    
    // Table 2: Three Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 280, height: 140 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      8
    ),
    
    // Table 3: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 6), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      11
    ),
  ],
},

// ==========================================================================
// SCENARIO 34 - MEDIUM: "Festival Food"
// ==========================================================================
{
  id: 34,
  name: 'Scenario 34 - Festival Food',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 240,
      height: 120,
      equipment: [ItemType.POPCORN],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.COTTON_CANDY],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 3),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 5),
      width: 240,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(2, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Popcorn Machine
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 240, height: 120 },
      [ItemType.POPCORN], 
      1
    ),
    
    // Table 2: Cotton Candy Machine
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 1), width: 240, height: 120 },
      [ItemType.COTTON_CANDY], 
      2
    ),
    
    // Standalone: Hot Box
    {
      id: 'equipment3',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(2, 2),
      locked: true,
    },
    
    // Standalone: Hot Box
    {
      id: 'equipment4',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(3, 2),
      locked: true,
    },
    
    // Table 3: Three Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 3), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      5
    ),
    
    // Table 4: Two Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 5), width: 240, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      8
    ),
    
    // Table 5: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      10
    ),
  ],
},

// ==========================================================================
// SCENARIO 35 - MEDIUM: "Power Challenge"
// ==========================================================================
{
  id: 35,
  name: 'Scenario 35 - Power Challenge',
  difficulty: 'medium',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.CHOCOLATE_FOUNTAIN, ItemType.CHOCOLATE_FOUNTAIN],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.PANINI, ItemType.PANINI],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 4),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 280,
      height: 140,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(1, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Two Chocolate Fountains
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 240, height: 120 },
      [ItemType.CHOCOLATE_FOUNTAIN, ItemType.CHOCOLATE_FOUNTAIN], 
      1
    ),
    
    // Table 2: Two Panini Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 2), width: 240, height: 120 },
      [ItemType.PANINI, ItemType.PANINI], 
      3
    ),
    
    // Table 3: Four Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      5
    ),
    
    // Table 4: Three Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 280, height: 140 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      9
    ),
    
    // Table 5: Toaster
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 6), width: 240, height: 120 },
      [ItemType.TOASTER], 
      12
    ),
  ],
},

// ==========================================================================
// SCENARIO 37 - HARD: "Espresso Extreme"
// ==========================================================================
{
  id: 37,
  name: 'Scenario 37 - Espresso Extreme',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 1), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 6), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 0), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 3), // Right wall
      locked: true,
    },
    {
      id: 'outlet5',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 280,
      height: 140,
      equipment: [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 1),
      width: 280,
      height: 140,
      equipment: [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 2),
      width: 280,
      height: 140,
      equipment: [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 4),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(2, 5),
      width: 280,
      height: 140,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table6',
      ...gridToPixel(3, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Large Espresso (L6-30) + Pump
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 280, height: 140 },
      [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP], 
      1
    ),
    
    // Table 2: Large Espresso (L6-30) + Pump
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 1), width: 280, height: 140 },
      [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP], 
      3
    ),
    
    // Table 3: Three Small Espresso Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 2), width: 280, height: 140 },
      [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO], 
      5
    ),
    
    // Table 4: Four Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 4), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      8
    ),
    
    // Table 5: Three Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 280, height: 140 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      12
    ),
    
    // Table 6: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      15
    ),
  ],
},

// ==========================================================================
// SCENARIO 38 - HARD: "Mega Kitchen"
// ==========================================================================
{
  id: 38,
  name: 'Scenario 38 - Mega Kitchen',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 3), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 240,
      height: 120,
      equipment: [ItemType.FRYER],
    },
    {
      id: 'table2',
      ...gridToPixel(1, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.FRYER],
    },
    {
      id: 'table3',
      ...gridToPixel(3, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.FRYER],
    },
    {
      id: 'table4',
      ...gridToPixel(2, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON],
    },
    {
      id: 'table5',
      ...gridToPixel(3, 4),
      width: 420,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table6',
      ...gridToPixel(2, 6),
      width: 360,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table7',
      ...gridToPixel(1, 5),
      width: 280,
      height: 140,
      equipment: [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Fryer
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 240, height: 120 },
      [ItemType.FRYER], 
      1
    ),
    
    // Table 2: Fryer
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 1), width: 240, height: 120 },
      [ItemType.FRYER], 
      2
    ),
    
    // Table 3: Fryer
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 1), width: 240, height: 120 },
      [ItemType.FRYER], 
      3
    ),
    
    // Table 4: Two Waffle Irons
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 2), width: 240, height: 120 },
      [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON], 
      4
    ),
    
    // Table 5: Five Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 4), width: 420, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      6
    ),
    
    // Table 6: Four Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 6), width: 360, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      11
    ),
    
    // Table 7: Three Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 5), width: 280, height: 140 },
      [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER], 
      15
    ),
    
    // Standalone: Hot Box
    {
      id: 'equipment18',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(3, 3),
      locked: true,
    },
  ],
},

// ==========================================================================
// SCENARIO 39 - HARD: "Pizza Powerhouse"
// ==========================================================================
{
  id: 39,
  name: 'Scenario 39 - Pizza Powerhouse',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 3), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 6), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
    {
      id: 'outlet5',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 4),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 5),
      width: 360,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(1, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment1',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(2, 0),
      locked: true,
    },
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment2',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(3, 1),
      locked: true,
    },
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment3',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(2, 2),
      locked: true,
    },
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment4',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(3, 3),
      locked: true,
    },
    
    // Table 1: Four Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      5
    ),
    
    // Table 2: Four Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 5), width: 360, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      9
    ),
    
    // Table 3: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 6), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      13
    ),
    
    // Standalone: Hot Box
    {
      id: 'equipment15',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(1, 4),
      locked: true,
    },
  ],
},

// ==========================================================================
// SCENARIO 40 - HARD: "Circuit Master"
// ==========================================================================
{
  id: 40,
  name: 'Scenario 40 - Circuit Master',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 0), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 3), // Right wall
      locked: true,
    },
    {
      id: 'outlet5',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 280,
      height: 140,
      equipment: [ItemType.CHOCOLATE_FOUNTAIN, ItemType.CHOCOLATE_FOUNTAIN, ItemType.CHOCOLATE_FOUNTAIN],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 2),
      width: 280,
      height: 140,
      equipment: [ItemType.PANINI, ItemType.PANINI, ItemType.PANINI],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 4),
      width: 420,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 360,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(1, 5),
      width: 280,
      height: 140,
      equipment: [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER],
    },
    {
      id: 'table6',
      ...gridToPixel(1, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.BLENDER],
    },
  ],
  
  equipment: [
    // Table 1: Three Chocolate Fountains
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 280, height: 140 },
      [ItemType.CHOCOLATE_FOUNTAIN, ItemType.CHOCOLATE_FOUNTAIN, ItemType.CHOCOLATE_FOUNTAIN], 
      1
    ),
    
    // Table 2: Three Panini Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 2), width: 280, height: 140 },
      [ItemType.PANINI, ItemType.PANINI, ItemType.PANINI], 
      4
    ),
    
    // Table 3: Six Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 420, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      7
    ),
    
    // Table 4: Four Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 360, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      13
    ),
    
    // Table 5: Three Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 5), width: 280, height: 140 },
      [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER], 
      17
    ),
    
    // Table 6: Blender
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 2), width: 240, height: 120 },
      [ItemType.BLENDER], 
      20
    ),
  ],
},

// ==========================================================================
// SCENARIO 41 - HARD: "Grand Buffet"
// ==========================================================================
{
  id: 41,
  name: 'Scenario 41 - Grand Buffet',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
    {
      id: 'outlet5',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 4),
      width: 420,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 6),
      width: 360,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(1, 5),
      width: 280,
      height: 140,
      equipment: [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER],
    },
    {
      id: 'table4',
      ...gridToPixel(1, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.SM_ESPRESSO],
    },
  ],
  
  equipment: [
    // Standalone: Hot Box
    {
      id: 'equipment1',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(2, 0),
      locked: true,
    },
    
    // Standalone: Hot Box
    {
      id: 'equipment2',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(3, 1),
      locked: true,
    },
    
    // Standalone: Cold Box
    {
      id: 'equipment3',
      itemType: ItemType.COLD_BOX,
      ...gridToPixel(2, 2),
      locked: true,
    },
    
    // Standalone: Cold Box
    {
      id: 'equipment4',
      itemType: ItemType.COLD_BOX,
      ...gridToPixel(3, 3),
      locked: true,
    },
    
    // Table 1: Five Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 420, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      5
    ),
    
    // Table 2: Four Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 360, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      10
    ),
    
    // Table 3: Three Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 5), width: 280, height: 140 },
      [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER], 
      14
    ),
    
    // Table 4: Small Espresso Machine
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 2), width: 240, height: 120 },
      [ItemType.SM_ESPRESSO], 
      17
    ),
  ],
},

// ==========================================================================
// SCENARIO 42 - HARD: "Amp Management"
// ==========================================================================
{
  id: 42,
  name: 'Scenario 42 - Amp Management',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 6), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 0), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 2), // Right wall
      locked: true,
    },
    {
      id: 'outlet5',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 5), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 280,
      height: 140,
      equipment: [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 1),
      width: 280,
      height: 140,
      equipment: [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 4),
      width: 420,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 360,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(1, 6),
      width: 280,
      height: 140,
      equipment: [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER],
    },
    {
      id: 'table6',
      ...gridToPixel(1, 4),
      width: 240,
      height: 120,
      equipment: [ItemType.BLENDER],
    },
  ],
  
  equipment: [
    // Table 1: Large Espresso (L6-30) + Pump
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 280, height: 140 },
      [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP], 
      1
    ),
    
    // Table 2: Large Espresso (L6-30) + Pump
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 1), width: 280, height: 140 },
      [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP], 
      3
    ),
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment5',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(2, 2),
      locked: true,
    },
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment6',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(3, 3),
      locked: true,
    },
    
    // Table 3: Five Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 420, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      7
    ),
    
    // Table 4: Four Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 360, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      12
    ),
    
    // Table 5: Three Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 6), width: 280, height: 140 },
      [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER], 
      16
    ),
    
    // Table 6: Blender
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 4), width: 240, height: 120 },
      [ItemType.BLENDER], 
      19
    ),
  ],
},

// ==========================================================================
// SCENARIO 43 - HARD: "Sweet & Savory"
// ==========================================================================
{
  id: 43,
  name: 'Scenario 43 - Sweet & Savory',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 3), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 240,
      height: 120,
      equipment: [ItemType.COTTON_CANDY, ItemType.COTTON_CANDY],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.CHOCOLATE_FOUNTAIN, ItemType.CHOCOLATE_FOUNTAIN],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 2),
      width: 240,
      height: 120,
      equipment: [ItemType.POPCORN],
    },
    {
      id: 'table4',
      ...gridToPixel(2, 4),
      width: 420,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(3, 6),
      width: 360,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table6',
      ...gridToPixel(1, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Two Cotton Candy Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 240, height: 120 },
      [ItemType.COTTON_CANDY, ItemType.COTTON_CANDY], 
      1
    ),
    
    // Table 2: Two Chocolate Fountains
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 1), width: 240, height: 120 },
      [ItemType.CHOCOLATE_FOUNTAIN, ItemType.CHOCOLATE_FOUNTAIN], 
      3
    ),
    
    // Table 3: Popcorn Machine
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 2), width: 240, height: 120 },
      [ItemType.POPCORN], 
      5
    ),
    
    // Table 4: Five Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 420, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      6
    ),
    
    // Table 5: Four Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 360, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      11
    ),
    
    // Table 6: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 6), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      15
    ),
  ],
},

// ==========================================================================
// SCENARIO 44 - HARD: "Breakfast Beast"
// ==========================================================================
{
  id: 44,
  name: 'Scenario 44 - Breakfast Beast',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
    {
      id: 'outlet5',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 360,
      height: 120,
      equipment: [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 2),
      width: 360,
      height: 120,
      equipment: [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 4),
      width: 420,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 280,
      height: 140,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(1, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Four Waffle Irons
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 360, height: 120 },
      [ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON, ItemType.WAFFLE_IRON], 
      1
    ),
    
    // Table 2: Four Small Espresso Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 2), width: 360, height: 120 },
      [ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO, ItemType.SM_ESPRESSO], 
      5
    ),
    
    // Table 3: Five Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 420, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      9
    ),
    
    // Table 4: Three Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 280, height: 140 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      14
    ),
    
    // Table 5: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 6), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      17
    ),
  ],
},

// ==========================================================================
// SCENARIO 45 - HARD: "Ultimate Challenge"
// ==========================================================================
{
  id: 45,
  name: 'Scenario 45 - Ultimate Challenge',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 1), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 0), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 2), // Right wall
      locked: true,
    },
    {
      id: 'outlet5',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
    {
      id: 'outlet6',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 280,
      height: 140,
      equipment: [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 1),
      width: 280,
      height: 140,
      equipment: [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 3),
      width: 240,
      height: 120,
      equipment: [ItemType.FRYER, ItemType.FRYER],
    },
    {
      id: 'table4',
      ...gridToPixel(1, 4),
      width: 420,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(3, 6),
      width: 360,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table6',
      ...gridToPixel(1, 6),
      width: 280,
      height: 140,
      equipment: [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Large Espresso (L6-30) + Pump
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 280, height: 140 },
      [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP], 
      1
    ),
    
    // Table 2: Large Espresso (L6-30) + Pump
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 1), width: 280, height: 140 },
      [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP], 
      3
    ),
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment5',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(2, 2),
      locked: true,
    },
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment6',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(3, 3),
      locked: true,
    },
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment7',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(1, 2),
      locked: true,
    },
    
    // Table 3: Two Fryers
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 3), width: 240, height: 120 },
      [ItemType.FRYER, ItemType.FRYER], 
      8
    ),
    
    // Table 4: Six Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 4), width: 420, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      10
    ),
    
    // Table 5: Four Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 360, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      16
    ),
    
    // Table 6: Three Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 6), width: 280, height: 140 },
      [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER], 
      20
    ),
  ],
},

// ==========================================================================
// SCENARIO 46 - HARD: "Convention Central"
// ==========================================================================
{
  id: 46,
  name: 'Scenario 46 - Convention Central',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 3), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 4),
      width: 420,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 6),
      width: 360,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(1, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Standalone: Hot Box
    {
      id: 'equipment1',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(2, 0),
      locked: true,
    },
    
    // Standalone: Hot Box
    {
      id: 'equipment2',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(3, 1),
      locked: true,
    },
    
    // Standalone: Hot Box
    {
      id: 'equipment3',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(1, 1),
      locked: true,
    },
    
    // Standalone: Cold Box
    {
      id: 'equipment4',
      itemType: ItemType.COLD_BOX,
      ...gridToPixel(2, 2),
      locked: true,
    },
    
    // Standalone: Cold Box
    {
      id: 'equipment5',
      itemType: ItemType.COLD_BOX,
      ...gridToPixel(3, 2),
      locked: true,
    },
    
    // Standalone: Ice Cream Cart
    {
      id: 'equipment6',
      itemType: ItemType.ICE_CREAM_CART,
      ...gridToPixel(2, 3),
      locked: true,
    },
    
    // Table 1: Five Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 420, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      7
    ),
    
    // Table 2: Four Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 360, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      12
    ),
    
    // Table 3: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 6), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      16
    ),
  ],
},

// ==========================================================================
// SCENARIO 47 - HARD: "Blender Brigade"
// ==========================================================================
{
  id: 47,
  name: 'Scenario 47 - Blender Brigade',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
    {
      id: 'outlet5',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 360,
      height: 120,
      equipment: [ItemType.BLENDER, ItemType.BLENDER, ItemType.BLENDER, ItemType.BLENDER],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 280,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 360,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
    {
      id: 'table5',
      ...gridToPixel(1, 3),
      width: 240,
      height: 120,
      equipment: [ItemType.SM_ESPRESSO],
    },
  ],
  
  equipment: [
    // Table 1: Four Blenders
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 360, height: 120 },
      [ItemType.BLENDER, ItemType.BLENDER, ItemType.BLENDER, ItemType.BLENDER], 
      1
    ),
    
    // Table 2: Four Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 280, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      5
    ),
    
    // Table 3: Four Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 360, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      9
    ),
    
    // Table 4: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      13
    ),
    
    // Table 5: Small Espresso Machine
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 3), width: 240, height: 120 },
      [ItemType.SM_ESPRESSO], 
      15
    ),
  ],
},

// ==========================================================================
// SCENARIO 48 - HARD: "Panini Palace"
// ==========================================================================
{
  id: 48,
  name: 'Scenario 48 - Panini Palace',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 1),
      width: 360,
      height: 120,
      equipment: [ItemType.PANINI, ItemType.PANINI, ItemType.PANINI, ItemType.PANINI],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 3),
      width: 420,
      height: 140,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table3',
      ...gridToPixel(2, 5),
      width: 360,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table4',
      ...gridToPixel(3, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Four Panini Machines
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 1), width: 360, height: 120 },
      [ItemType.PANINI, ItemType.PANINI, ItemType.PANINI, ItemType.PANINI], 
      1
    ),
    
    // Table 2: Five Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 3), width: 420, height: 140 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      5
    ),
    
    // Table 3: Four Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 360, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      10
    ),
    
    // Table 4: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      14
    ),
    
    // Standalone: Hot Box
    {
      id: 'equipment16',
      itemType: ItemType.HOT_BOX,
      ...gridToPixel(1, 3),
      locked: true,
    },
  ],
},

// ==========================================================================
// SCENARIO 49 - HARD: "Fried & Frozen"
// ==========================================================================
{
  id: 49,
  name: 'Scenario 49 - Fried & Frozen',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 2), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 5), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 1), // Right wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
    {
      id: 'outlet5',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 240,
      height: 120,
      equipment: [ItemType.FRYER],
    },
    {
      id: 'table2',
      ...gridToPixel(1, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.FRYER],
    },
    {
      id: 'table3',
      ...gridToPixel(3, 1),
      width: 240,
      height: 120,
      equipment: [ItemType.FRYER],
    },
    {
      id: 'table4',
      ...gridToPixel(2, 5),
      width: 440,
      height: 130,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table5',
      ...gridToPixel(3, 6),
      width: 360,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table6',
      ...gridToPixel(1, 6),
      width: 240,
      height: 120,
      equipment: [ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Fryer
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 240, height: 120 },
      [ItemType.FRYER], 
      1
    ),
    
    // Table 2: Fryer
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 1), width: 240, height: 120 },
      [ItemType.FRYER], 
      2
    ),
    
    // Table 3: Fryer
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 1), width: 240, height: 120 },
      [ItemType.FRYER], 
      3
    ),
    
    // Standalone: Ice Cream Cart
    {
      id: 'equipment4',
      itemType: ItemType.ICE_CREAM_CART,
      ...gridToPixel(2, 2),
      locked: true,
    },
    
    // Standalone: Ice Cream Cart
    {
      id: 'equipment5',
      itemType: ItemType.ICE_CREAM_CART,
      ...gridToPixel(3, 3),
      locked: true,
    },
    
    // Table 4: Six Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 440, height: 130 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      6
    ),
    
    // Table 5: Four Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 360, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      12
    ),
    
    // Table 6: Two Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 6), width: 240, height: 120 },
      [ItemType.TOASTER, ItemType.TOASTER], 
      16
    ),
    
    // Standalone: Cold Box
    {
      id: 'equipment18',
      itemType: ItemType.COLD_BOX,
      ...gridToPixel(1, 4),
      locked: true,
    },
  ],
},

// ==========================================================================
// SCENARIO 50 - HARD: "Final Gauntlet"
// ==========================================================================
{
  id: 50,
  name: 'Scenario 50 - Final Gauntlet',
  difficulty: 'hard',
  
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 1), // Left wall
      locked: true,
    },
    {
      id: 'outlet2',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 4), // Left wall
      locked: true,
    },
    {
      id: 'outlet3',
      itemType: ItemType.OUTLET_20A,
      ...gridToPixel(0, 6), // Left wall
      locked: true,
    },
    {
      id: 'outlet4',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 0), // Right wall
      locked: true,
    },
    {
      id: 'outlet5',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 2), // Right wall
      locked: true,
    },
    {
      id: 'outlet6',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 4), // Right wall
      locked: true,
    },
    {
      id: 'outlet7',
      itemType: ItemType.OUTLET_L21_30,
      ...gridToPixel(5, 6), // Right wall
      locked: true,
    },
  ],
  
  tables: [
    {
      id: 'table1',
      ...gridToPixel(2, 0),
      width: 280,
      height: 140,
      equipment: [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP],
    },
    {
      id: 'table2',
      ...gridToPixel(3, 1),
      width: 280,
      height: 140,
      equipment: [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP],
    },
    {
      id: 'table3',
      ...gridToPixel(1, 1),
      width: 280,
      height: 140,
      equipment: [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP],
    },
    {
      id: 'table4',
      ...gridToPixel(2, 4),
      width: 240,
      height: 120,
      equipment: [ItemType.CHOCOLATE_FOUNTAIN, ItemType.CHOCOLATE_FOUNTAIN],
    },
    {
      id: 'table5',
      ...gridToPixel(2, 5),
      width: 440,
      height: 130,
      equipment: [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP],
    },
    {
      id: 'table6',
      ...gridToPixel(3, 6),
      width: 360,
      height: 120,
      equipment: [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP],
    },
    {
      id: 'table7',
      ...gridToPixel(1, 6),
      width: 280,
      height: 140,
      equipment: [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER],
    },
  ],
  
  equipment: [
    // Table 1: Large Espresso (L6-30) + Pump
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 0), width: 280, height: 140 },
      [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP], 
      1
    ),
    
    // Table 2: Large Espresso (L6-30) + Pump
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 1), width: 280, height: 140 },
      [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP], 
      3
    ),
    
    // Table 3: Large Espresso (L6-30) + Pump
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 1), width: 280, height: 140 },
      [ItemType.LG_ESPRESSO, ItemType.LG_ESPRESSO_PUMP], 
      5
    ),
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment7',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(2, 2),
      locked: true,
    },
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment8',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(3, 3),
      locked: true,
    },
    
    // Standalone: Pizza Oven (L6-20)
    {
      id: 'equipment9',
      itemType: ItemType.PIZZA_OVEN,
      ...gridToPixel(1, 3),
      locked: true,
    },
    
    // Table 4: Two Chocolate Fountains
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 4), width: 240, height: 120 },
      [ItemType.CHOCOLATE_FOUNTAIN, ItemType.CHOCOLATE_FOUNTAIN], 
      10
    ),
    
    // Table 5: Six Single Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(2, 5), width: 440, height: 130 },
      [ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP, ItemType.SINGLE_HEAT_LAMP], 
      12
    ),
    
    // Table 6: Four Double Heat Lamps
    ...placeEquipmentOnTable(
      { ...gridToPixel(3, 6), width: 360, height: 120 },
      [ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP, ItemType.DOUBLE_HEAT_LAMP], 
      18
    ),
    
    // Table 7: Three Toasters
    ...placeEquipmentOnTable(
      { ...gridToPixel(1, 6), width: 280, height: 140 },
      [ItemType.TOASTER, ItemType.TOASTER, ItemType.TOASTER], 
      22
    ),
  ],
},
];

// Helper function to get scenario by ID
export function getScenarioById(id: number): Scenario | undefined {
  return SCENARIOS.find(s => s.id === id);
}

// Helper function to get scenarios by difficulty
export function getScenariosByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Scenario[] {
  return SCENARIOS.filter(s => s.difficulty === difficulty);
}