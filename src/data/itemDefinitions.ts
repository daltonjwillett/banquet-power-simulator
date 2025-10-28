import { ItemType, ConnectionType } from '../types';
import type { ItemDefinition } from '../types';

// ============================================================================
// ITEM DEFINITIONS DATABASE
// ============================================================================

export const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
  // ==========================================================================
  // OUTLETS
  // ==========================================================================
  
  [ItemType.OUTLET_20A]: {
    type: ItemType.OUTLET_20A,
    displayName: '20A Outlet',
    imagePath: 'images/outlet-20a.png',
    nodes: [
      { 
        id: 'out1', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20,
        offsetX: 0,
        offsetY: -70,
      },
      { 
        id: 'out2', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20,
        offsetX: 0,
        offsetY: 70, 
      }
    ],
    canDoTrue20: true,
  },
  
  [ItemType.OUTLET_L21_30]: {
    type: ItemType.OUTLET_L21_30,
    displayName: 'L21-30 Outlet',
    imagePath: 'images/outlet-l21-30.png',
    nodes: [
      { 
        id: 'out', 
        type: 'output', 
        connectionType: ConnectionType.L21_30, 
        maxAmps: 30,
        offsetX: 0,
        offsetY: 0,
      }
    ],
  },
  
  // ==========================================================================
  // CABLES
  // ==========================================================================
  
  [ItemType.EDISON_CABLE]: {
    type: ItemType.EDISON_CABLE,
    displayName: 'Edison Cable',
    imagePath: 'images/edison.png',
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 20,
        offsetY: 50,
      },
      { 
        id: 'out', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20,
        offsetX: 80,
        offsetY: 50,
      }
    ],
    ampLimit: 20,
  },
  
  [ItemType.FLATWIRE_CABLE]: {
    type: ItemType.FLATWIRE_CABLE,
    displayName: 'Flat-Wire Cable',
    imagePath: 'images/flatwire.png',
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.L21_30,
        offsetX: 20,
        offsetY: 50,
      },
      { 
        id: 'out', 
        type: 'output', 
        connectionType: ConnectionType.L21_30, 
        maxAmps: 30,
        offsetX: 80,
        offsetY: 50,
      }
    ],
    ampLimit: 30,
  },
  
  // ==========================================================================
  // ACCESSORIES
  // ==========================================================================
  
  [ItemType.TRI_TAP]: {
    type: ItemType.TRI_TAP,
    displayName: 'Tri-Tap',
    imagePath: 'images/tritap.png',
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: -105,
        offsetY: -50,
      },
      { 
        id: 'out1', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 15,
        offsetX: -70,
        offsetY: 70,
      },
      { 
        id: 'out2', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 15,
        offsetX: 100,
        offsetY: 30,
      },
      { 
        id: 'out3', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 15,
        offsetX: 70,
        offsetY: -95,
      },
    ],
    ampLimit: 15,
    canDoTrue20: false,
  },
  
  [ItemType.QUAD_BOX]: {
    type: ItemType.QUAD_BOX,
    displayName: 'Quad Box',
    imagePath: 'images/quad_box.png',
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: -100,
        offsetY: -45,
      },
      { 
        id: 'out1', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20,
        offsetX: -40,
        offsetY: -40,
      },
      { 
        id: 'out2', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20,
        offsetX: 85,
        offsetY: -40,
      },
      { 
        id: 'out3', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20,
        offsetX: -40,
        offsetY: 85,
      },
      { 
        id: 'out4', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20,
        offsetX: 85,
        offsetY: 85,
      },
    ],
    ampLimit: 20,
    canDoTrue20: true,
  },
  
  [ItemType.SIX_WAY]: {
    type: ItemType.SIX_WAY,
    displayName: 'Six-Way',
    imagePath: 'images/sixway.png',
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 125,
        offsetY: -50,
      },
      { 
        id: 'out1', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 15,
        offsetX: -60,
        offsetY: 100,
      },
      { 
        id: 'out2', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 15,
        offsetX: 50,
        offsetY: 100,
      },
      { 
        id: 'out3', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 15,
        offsetX: 160,
        offsetY: 100,
      },
      { 
        id: 'out4', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 15,
        offsetX: -60,
        offsetY: -20,
      },
      { 
        id: 'out5', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 15,
        offsetX: 50,
        offsetY: -20,
      },
      { 
        id: 'out6', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 15,
        offsetX: 160,
        offsetY: -20,
      },
    ],
    ampLimit: 15,
    canDoTrue20: false,
  },
  
  [ItemType.DOGHOUSE]: {
    type: ItemType.DOGHOUSE,
    displayName: 'Dog House',
    imagePath: 'images/doghouse.png',
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.L21_30,
        offsetX: -35,
        offsetY: 95,
      },
      // PAIR 1 (Black) - Top section
      { 
        id: 'out1', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20, 
        pairId: 1,
        offsetX: -65,
        offsetY: -60, // Top of pair 1
      },
      { 
        id: 'out2', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20, 
        pairId: 1,
        offsetX: -65,
        offsetY: 60, // Bottom of pair 1
      },
      // PAIR 2 (Red) - Middle section
      { 
        id: 'out3', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20, 
        pairId: 2,
        offsetX: 50,
        offsetY: -60, // Top of pair 2 (center)
      },
      { 
        id: 'out4', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20, 
        pairId: 2,
        offsetX: 50,
        offsetY: 60, // Bottom of pair 2
      },
      // PAIR 3 (Blue) - Bottom section
      { 
        id: 'out5', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20, 
        pairId: 3,
        offsetX: 165,
        offsetY: -60, // Top of pair 3
      },
      { 
        id: 'out6', 
        type: 'output', 
        connectionType: ConnectionType.EDISON, 
        maxAmps: 20, 
        pairId: 3,
        offsetX: 165,
        offsetY: 60, // Bottom of pair 3
      },
    ],
    canDoTrue20: true,
  },
  
  [ItemType.SQUID]: {
    type: ItemType.SQUID,
    displayName: 'Squid',
    imagePath: 'images/squid.png',
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.L21_30,
        offsetX: 35,
        offsetY: 135,
      },
      { 
        id: 'out1', 
        type: 'output', 
        connectionType: ConnectionType.L6_20, 
        maxAmps: 20,
        offsetX: -65,
        offsetY: 125,
      },
      { 
        id: 'out2', 
        type: 'output', 
        connectionType: ConnectionType.L6_20, 
        maxAmps: 20,
        offsetX: -130,
        offsetY: 20,
      },
      { 
        id: 'out3', 
        type: 'output', 
        connectionType: ConnectionType.L6_20, 
        maxAmps: 20,
        offsetX: 0,
        offsetY: 20,
      },
    ],
  },
  
  [ItemType.DOG_BONE]: {
    type: ItemType.DOG_BONE,
    displayName: 'Dog Bone',
    imagePath: 'images/dogbone.png',
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.L21_30,
        offsetX: 180,
        offsetY: 65,
      },
      { 
        id: 'out', 
        type: 'output', 
        connectionType: ConnectionType.L6_30, 
        maxAmps: 30,
        offsetX: -180,
        offsetY: 45,
      },
    ],
  },
  
  // ==========================================================================
  // EQUIPMENT
  // ==========================================================================
  
  [ItemType.TOASTER]: {
    type: ItemType.TOASTER,
    displayName: 'Toaster',
    imagePath: 'images/toaster.png',
    watts: 950,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.SINGLE_HEAT_LAMP]: {
    type: ItemType.SINGLE_HEAT_LAMP,
    displayName: 'Single Heat Lamp',
    imagePath: 'images/heat-lamp-single.png',
    watts: 250,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.DOUBLE_HEAT_LAMP]: {
    type: ItemType.DOUBLE_HEAT_LAMP,
    displayName: 'Double Heat Lamp',
    imagePath: 'images/heat-lamp-double.png',
    watts: 500,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.SM_ESPRESSO]: {
    type: ItemType.SM_ESPRESSO,
    displayName: 'Small Espresso Machine',
    imagePath: 'images/sm-espresso.png',
    watts: 1500,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.TRUE_20,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.TRUE_20,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.LG_ESPRESSO]: {
    type: ItemType.LG_ESPRESSO,
    displayName: 'Large Espresso Machine',
    imagePath: 'images/lg-espresso.png',
    watts: 3000,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.L6_30,
        offsetX: 100,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.L6_30,
        offsetX: 120,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.LG_ESPRESSO_PUMP]: {
    type: ItemType.LG_ESPRESSO_PUMP,
    displayName: 'Espresso Pump',
    imagePath: 'images/lg-espresso-pump.png',
    watts: 50,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.PANINI]: {
    type: ItemType.PANINI,
    displayName: 'Panini Machine',
    imagePath: 'images/panini.png',
    watts: 1750,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.PIZZA_OVEN]: {
    type: ItemType.PIZZA_OVEN,
    displayName: 'Pizza Oven',
    imagePath: 'images/pizza-oven.png',
    watts: 2400,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.L6_20,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.L6_20,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.CHOCOLATE_FOUNTAIN]: {
    type: ItemType.CHOCOLATE_FOUNTAIN,
    displayName: 'Chocolate Fountain',
    imagePath: 'images/chocolate-fountain.png',
    watts: 2400,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.HOT_BOX]: {
    type: ItemType.HOT_BOX,
    displayName: 'Hot Box',
    imagePath: 'images/hot-box.png',
    watts: 2400,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.COLD_BOX]: {
    type: ItemType.COLD_BOX,
    displayName: 'Cold Box',
    imagePath: 'images/cold-box.png',
    watts: 2400,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.ICE_CREAM_CART]: {
    type: ItemType.ICE_CREAM_CART,
    displayName: 'Ice Cream Cart',
    imagePath: 'images/ice-cream-cart.png',
    watts: 2400,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.FRYER]: {
    type: ItemType.FRYER,
    displayName: 'Fryer',
    imagePath: 'images/fryer.png',
    watts: 2400,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.CONVEYER]: {
    type: ItemType.CONVEYER,
    displayName: 'Conveyer',
    imagePath: 'images/conveyer.png',
    watts: 2400,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.POPCORN]: {
    type: ItemType.POPCORN,
    displayName: 'Popcorn Machine',
    imagePath: 'images/popcorn.png',
    watts: 2400,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.BLENDER]: {
    type: ItemType.BLENDER,
    displayName: 'Blender',
    imagePath: 'images/blender.png',
    watts: 2400,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.WAFFLE_IRON]: {
    type: ItemType.WAFFLE_IRON,
    displayName: 'Waffle Iron',
    imagePath: 'images/waffle-iron.png',
    watts: 2400,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
  
  [ItemType.COTTON_CANDY]: {
    type: ItemType.COTTON_CANDY,
    displayName: 'Cotton Candy Machine',
    imagePath: 'images/cotton-candy.png',
    watts: 2400,
    nodes: [
      { 
        id: 'in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 50,
        offsetY: 15,
      },
      { 
        id: 'tail-in', 
        type: 'input', 
        connectionType: ConnectionType.EDISON,
        offsetX: 70,
        offsetY: 65,
      }
    ],
  },
}

// Helper function to get item definition
export function getItemDefinition(itemType: string): ItemDefinition {
  const def = ITEM_DEFINITIONS[itemType];
  if (!def) {
    throw new Error(`Item definition not found for type: ${itemType}`);
  }
  return def;
}

// Helper function to check if item is equipment (has watts)
export function isEquipment(itemType: string): boolean {
  const def = ITEM_DEFINITIONS[itemType];
  return def?.watts !== undefined;
}

// Helper function to check if item is an outlet
export function isOutlet(itemType: string): boolean {
  return itemType === ItemType.OUTLET_20A || itemType === ItemType.OUTLET_L21_30;
}

// Helper function to check if item is a cable
export function isCable(itemType: string): boolean {
  return itemType === ItemType.EDISON_CABLE || itemType === ItemType.FLATWIRE_CABLE;
}

// Helper function to check if item is an accessory
export function isAccessory(itemType: string): boolean {
  return !isOutlet(itemType) && !isCable(itemType) && !isEquipment(itemType);
}