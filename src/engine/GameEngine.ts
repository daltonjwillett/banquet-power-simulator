// ============================================================================
// IMPORTS
// ============================================================================

import { ConnectionType, ItemType } from '../types';
import type { 
  NodeDefinition, 
  ItemDefinition, 
  PlacedItem, 
  Connection,
  ValidationResult,
  ConnectionValidation,
  ChainLink 
} from '../types';
import type { Cable } from '../types/cable';
import { ITEM_DEFINITIONS } from '../data/itemDefinitions';

// ============================================================================
// EXTENDED VALIDATION RESULT (for visual feedback)
// ============================================================================

export interface DetailedValidationResult extends ValidationResult {
  validChains: string[][]; // Array of item IDs in valid chains
  invalidChains: string[][]; // Array of item IDs in invalid chains
  disconnectedItems: string[]; // Item IDs not connected to anything
}

// ============================================================================
// GAME ENGINE
// ============================================================================

export class BanquetPowerEngine {
  private items: Map<string, PlacedItem> = new Map();
  private connections: Connection[] = [];
  private cables: Cable[] = []; // Track cables separately

  addItem(item: PlacedItem): void {
    this.items.set(item.id, item);
  }

  removeItem(itemId: string): void {
    // Remove all connections involving this item
    this.connections = this.connections.filter(
      conn => !conn.fromNodeId.startsWith(itemId) && !conn.toNodeId.startsWith(itemId)
    );
    this.items.delete(itemId);
  }

  // NEW: Set cables from game state
  setCables(cables: Cable[]): void {
    this.cables = cables;
    // Rebuild connections from cables
    this.rebuildConnectionsFromCables();
  }

  private rebuildConnectionsFromCables(): void {
    // Clear existing connections (but keep items)
    this.connections = [];

    // Create connections from each cable
    for (const cable of this.cables) {
      if (cable.fromNodeId && cable.toNodeId) {
        this.connections.push({
          fromNodeId: cable.fromNodeId,
          toNodeId: cable.toNodeId,
        });
      }
    }
    
    // CRITICAL FIX: Add virtual connections for equipment tails
    // Tails are implicit connections from equipment 'in' node to 'tail-in' node
    for (const [itemId, item] of this.items) {
      const itemDef = ITEM_DEFINITIONS[item.itemType];
      
      // Check if this item has a tail (has watts)
      if (itemDef.watts) {
        // IMPORTANT: Node IDs use dashes, not dots
        // Format: itemId-nodeId (e.g., "equipment1-in" and "equipment1-tail-in")
        const equipInNode = `${itemId}-in`;
        const tailInNode = `${itemId}-tail-in`;
        
        this.connections.push({
          fromNodeId: equipInNode,
          toNodeId: tailInNode,
        });
        
        console.log(`Added virtual tail connection: ${equipInNode} ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ${tailInNode}`);
      }
    }
  }

  connect(fromItemId: string, fromNodeId: string, toItemId: string, toNodeId: string): boolean {
    const fromItem = this.items.get(fromItemId);
    const toItem = this.items.get(toItemId);
    
    if (!fromItem || !toItem) return false;

    const fromDef = ITEM_DEFINITIONS[fromItem.itemType];
    const toDef = ITEM_DEFINITIONS[toItem.itemType];
    
    const fromNode = fromDef.nodes.find(n => n.id === fromNodeId);
    const toNode = toDef.nodes.find(n => n.id === toNodeId);
    
    if (!fromNode || !toNode) return false;
    if (fromNode.type !== 'output' || toNode.type !== 'input') return false;

    // Check connection compatibility
    if (!this.isCompatibleConnection(fromNode, toNode, fromDef, toDef)) {
      return false;
    }

    const fullFromNodeId = `${fromItemId}-${fromNodeId}`;
    const fullToNodeId = `${toItemId}-${toNodeId}`;

    // Remove any existing connection to the toNode (only one input per node)
    this.connections = this.connections.filter(c => c.toNodeId !== fullToNodeId);

    this.connections.push({
      fromNodeId: fullFromNodeId,
      toNodeId: fullToNodeId,
    });

    return true;
  }

  disconnect(itemId: string, nodeId: string): void {
    const fullNodeId = `${itemId}-${nodeId}`;
    this.connections = this.connections.filter(
      conn => conn.fromNodeId !== fullNodeId && conn.toNodeId !== fullNodeId
    );
  }

  private isCompatibleConnection(
    fromNode: NodeDefinition,
    toNode: NodeDefinition,
    fromItemDef: ItemDefinition,
    _toItemDef: ItemDefinition
  ): boolean {
    // L6-20 and L6-30 connections require EXACT matches
    // Check if either node is L6 type - if so, both must match exactly
    const fromIsL6_20 = fromNode.connectionType === ConnectionType.L6_20;
    const toIsL6_20 = toNode.connectionType === ConnectionType.L6_20;
    const fromIsL6_30 = fromNode.connectionType === ConnectionType.L6_30;
    const toIsL6_30 = toNode.connectionType === ConnectionType.L6_30;
    
    if (fromIsL6_20 || toIsL6_20) {
      return fromIsL6_20 && toIsL6_20;
    }
    
    if (fromIsL6_30 || toIsL6_30) {
      return fromIsL6_30 && toIsL6_30;
    }

    // TRUE_20 special case: TRUE_20 tails can plug into EDISON outputs 
    // ONLY if the source item has canDoTrue20 (Quad Box, Doghouse, 20A Outlet)
    // This is NOT about cables - it's about the outlet/accessory having the right socket
    if (toNode.connectionType === ConnectionType.TRUE_20) {
      return fromNode.connectionType === ConnectionType.EDISON && fromItemDef.canDoTrue20 === true;
    }

    // Standard compatibility check (Edison to Edison, L21-30 to L21-30)
    return fromNode.connectionType === toNode.connectionType;
  }

  // Enhanced validation with detailed chain tracking
  validateDetailed(): DetailedValidationResult {
    const result: DetailedValidationResult = {
      success: true,
      violations: [],
      connectionStatus: new Map(),
      validChains: [],
      invalidChains: [],
      disconnectedItems: [],
    };

    // Get all equipment items
    const equipmentItems = Array.from(this.items.values()).filter(item => {
      const def = ITEM_DEFINITIONS[item.itemType];
      return def.watts !== undefined;
    });

    // Check each equipment item
    for (const equipment of equipmentItems) {
      // CRITICAL FIX: Equipment with tails starts tracing from the tail-in node
      const equipmentNodeId = `${equipment.id}-tail-in`;
      const chain = this.traceBackToOutlet(equipmentNodeId);
      
      if (chain.length === 0) {
        // Equipment not connected
        result.success = false;
        result.disconnectedItems.push(equipment.id);
        result.connectionStatus.set(equipment.id, { 
          valid: false, 
          reason: 'Not connected to power' 
        });
        continue;
      }

      // Validate the chain
      const validation = this.validateChain(chain, equipment);
      result.connectionStatus.set(equipment.id, validation);
      
      // Extract item IDs from chain
      const chainItemIds = chain.map(link => link.itemId);
      chainItemIds.push(equipment.id); // Add the equipment itself
      
      if (validation.valid) {
        result.validChains.push(chainItemIds);
      } else {
        result.success = false;
        result.invalidChains.push(chainItemIds);
        result.violations.push({
          itemId: equipment.id,
          reason: validation.reason || 'Unknown error',
        });
      }
    }

    // CRITICAL: Check doghouse pair overloads across ALL equipment
    // A doghouse might have multiple equipment items drawing from the same pair
    const doghouseUsage = this.calculateDoghouseUsage();
    
    for (const [doghouseId, pairMap] of doghouseUsage) {
      const overloadedPairs = new Set<number>();
      
      // First pass: identify which pairs are overloaded
      for (const [pairId, usage] of pairMap) {
        if (usage > 30) {
          overloadedPairs.add(pairId);
          result.success = false;
          result.violations.push({
            itemId: doghouseId,
            reason: `Doghouse pair ${pairId} overloaded: ${usage.toFixed(1)}A / 30A`,
          });
        }
      }
      
      // If any pair is overloaded, check which equipment uses those pairs
      if (overloadedPairs.size > 0) {
        // Get all equipment items
        const equipmentItems = Array.from(this.items.values()).filter(item => {
          const def = ITEM_DEFINITIONS[item.itemType];
          return def.watts !== undefined;
        });
        
        // For each equipment, check if it goes through an overloaded pair
        for (const equipment of equipmentItems) {
          const equipmentNodeId = `${equipment.id}-tail-in`;
          const chain = this.traceBackToOutlet(equipmentNodeId);
          
          // Check if this chain goes through the doghouse on an overloaded pair
          let usesOverloadedPair = false;
          for (const link of chain) {
            if (link.itemId === doghouseId && 
                link.node.pairId !== undefined && 
                overloadedPairs.has(link.node.pairId)) {
              usesOverloadedPair = true;
              break;
            }
          }
          
          // If this equipment uses an overloaded pair, move its chain to invalid
          if (usesOverloadedPair) {
            const chainItemIds = chain.map(link => link.itemId);
            chainItemIds.push(equipment.id);
            
            // Remove from validChains
            for (let i = 0; i < result.validChains.length; i++) {
              if (JSON.stringify(result.validChains[i]) === JSON.stringify(chainItemIds)) {
                result.validChains.splice(i, 1);
                break;
              }
            }
            
            // Add to invalidChains if not already there
            if (!result.invalidChains.some(c => JSON.stringify(c) === JSON.stringify(chainItemIds))) {
              result.invalidChains.push(chainItemIds);
            }
          }
        }
        
        // Ensure doghouse itself is in invalid chains
        const doghouseInInvalid = result.invalidChains.some(chain => chain.includes(doghouseId));
        if (!doghouseInInvalid) {
          result.invalidChains.push([doghouseId]);
        }
      }
    }

    return result;
  }

  // Calculate total usage on each doghouse pair across ALL equipment
  private calculateDoghouseUsage(): Map<string, Map<number, number>> {
    const doghouseUsage = new Map<string, Map<number, number>>();
    
    // Get all equipment items
    const equipmentItems = Array.from(this.items.values()).filter(item => {
      const def = ITEM_DEFINITIONS[item.itemType];
      return def.watts !== undefined;
    });
    
    // For each equipment, trace back and accumulate doghouse usage
    for (const equipment of equipmentItems) {
      const equipmentDef = ITEM_DEFINITIONS[equipment.itemType];
      const watts = equipmentDef.watts || 0;
      const amps = watts / 120;
      
      const equipmentNodeId = `${equipment.id}-tail-in`;
      const chain = this.traceBackToOutlet(equipmentNodeId);
      
      // Look for doghouses in the chain
      for (const link of chain) {
        if (link.itemType === ItemType.DOGHOUSE && link.node.pairId !== undefined) {
          if (!doghouseUsage.has(link.itemId)) {
            doghouseUsage.set(link.itemId, new Map([[1, 0], [2, 0], [3, 0]]));
          }
          const pairMap = doghouseUsage.get(link.itemId)!;
          pairMap.set(link.node.pairId, (pairMap.get(link.node.pairId) || 0) + amps);
        }
      }
    }
    
    return doghouseUsage;
  }

  // Original validate method (kept for backwards compatibility)
  validate(): ValidationResult {
    const detailed = this.validateDetailed();
    return {
      success: detailed.success,
      violations: detailed.violations,
      connectionStatus: detailed.connectionStatus,
    };
  }

  private traceBackToOutlet(nodeId: string): ChainLink[] {
    const chain: ChainLink[] = [];
    let currentNodeId = nodeId;
    const visited = new Set<string>(); // Prevent infinite loops

    // Trace backwards through connections
    while (true) {
      // Check for circular reference
      if (visited.has(currentNodeId)) {
        console.warn('Circular connection detected:', currentNodeId);
        break;
      }
      visited.add(currentNodeId);

      const connection = this.connections.find(c => c.toNodeId === currentNodeId);
      if (!connection) break;

      // Split only at first dash (e.g., "equipment1-tail-in" Ã¢â€ â€™ ["equipment1", "tail-in"])
      const dashIndex = connection.fromNodeId.indexOf('-');
      if (dashIndex === -1) break;
      const itemId = connection.fromNodeId.substring(0, dashIndex);
      const localNodeId = connection.fromNodeId.substring(dashIndex + 1);
      const item = this.items.get(itemId);
      if (!item) break;

      const itemDef = ITEM_DEFINITIONS[item.itemType];
      const node = itemDef.nodes.find(n => n.id === localNodeId);
      if (!node) break;

      chain.unshift({
        itemId,
        itemType: item.itemType,
        nodeId: localNodeId,
        node,
        itemDef,
      });

      // Find the input node of this item
      const inputNode = itemDef.nodes.find(n => n.type === 'input');
      if (!inputNode) break; // This is an outlet (no input)

      currentNodeId = `${itemId}-${inputNode.id}`;
    }

    return chain;
  }

  private validateChain(chain: ChainLink[], equipment: PlacedItem): ConnectionValidation {
    if (chain.length === 0) {
      return { valid: false, reason: 'Not connected to outlet' };
    }

    // First item should be an outlet
    const outlet = chain[0];
    const outletDef = ITEM_DEFINITIONS[outlet.itemType];
    
    // Verify it's actually an outlet (has only output nodes)
    const hasOnlyOutput = outletDef.nodes.every(n => n.type === 'output');
    if (!hasOnlyOutput) {
      return { valid: false, reason: 'Chain does not start at outlet' };
    }

    // Calculate equipment power draw
    const equipmentDef = ITEM_DEFINITIONS[equipment.itemType];
    const watts = equipmentDef.watts || 0;
    const amps = watts / 120; // Standard 120V conversion

    // Track minimum amp limit through chain
    let minAmpLimit = outlet.node.maxAmps || Infinity;

    // For doghouse, track pair usage
    const doghousePairUsage: Map<string, Map<number, number>> = new Map();

    for (const link of chain) {
      // Update minimum amp limit
      if (link.itemDef.ampLimit !== undefined) {
        minAmpLimit = Math.min(minAmpLimit, link.itemDef.ampLimit);
      }
      if (link.node.maxAmps !== undefined) {
        minAmpLimit = Math.min(minAmpLimit, link.node.maxAmps);
      }

      // Track doghouse pair usage
      if (link.itemType === ItemType.DOGHOUSE && link.node.pairId !== undefined) {
        if (!doghousePairUsage.has(link.itemId)) {
          doghousePairUsage.set(link.itemId, new Map([[1, 0], [2, 0], [3, 0]]));
        }
        const pairMap = doghousePairUsage.get(link.itemId)!;
        pairMap.set(link.node.pairId, (pairMap.get(link.node.pairId) || 0) + amps);
      }
    }

    // Check if equipment exceeds minimum amp limit
    if (amps > minAmpLimit) {
      return { 
        valid: false, 
        reason: `Equipment draws ${amps.toFixed(1)}A but chain limited to ${minAmpLimit}A`,
        ampDraw: amps,
        ampLimit: minAmpLimit
      };
    }

    // Check doghouse pair limits (30A per pair)
    for (const [_doghouseId, pairMap] of doghousePairUsage) {
      for (const [pairId, usage] of pairMap) {
        if (usage > 30) {
          return {
            valid: false,
            reason: `Doghouse pair ${pairId} exceeds 30A limit (${usage.toFixed(1)}A)`,
          };
        }
      }
    }

    return { valid: true, ampDraw: amps, ampLimit: minAmpLimit };
  }

  // Get current state for saving/loading
  getState() {
    return {
      items: Array.from(this.items.values()),
      connections: this.connections,
      cables: this.cables,
    };
  }

  loadState(state: { items: PlacedItem[]; connections: Connection[]; cables?: Cable[] }) {
    this.items.clear();
    this.connections = [];
    this.cables = [];
    
    state.items.forEach(item => this.items.set(item.id, item));
    this.connections = [...state.connections];
    
    if (state.cables) {
      this.cables = state.cables;
    }
  }
}