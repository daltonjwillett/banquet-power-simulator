// src/utils/ampCalculator.ts

import { ItemType } from '../types';
import type { PlacedItem } from '../types';
import type { Cable } from '../types/cable';
import { ITEM_DEFINITIONS } from '../data/itemDefinitions';

export interface OutletUsage {
  used: number;
  limit: number;
  pairs?: Map<number, { used: number; limit: number }>; // For doghouse
  connectedDoghouseId?: string; // For L21-30 outlets: which doghouse they're connected to
  connectedPairId?: number; // For L21-30 outlets: which pair on the doghouse
}

export function calculateOutletUsage(
  outlets: PlacedItem[],
  equipment: PlacedItem[],
  accessories: PlacedItem[],
  cables: Cable[]
): Map<string, OutletUsage> {
  const usageMap = new Map<string, OutletUsage>();
  
  // Initialize all outlets
  outlets.forEach(outlet => {
    const def = ITEM_DEFINITIONS[outlet.itemType];
    const outletNode = def.nodes.find(n => n.type === 'output');
    
    if (outlet.itemType === ItemType.DOGHOUSE) {
      // Doghouse has 3 pairs
      usageMap.set(outlet.id, {
        used: 0,
        limit: 30, // Each pair has 30A limit
        pairs: new Map([
          [1, { used: 0, limit: 30 }],
          [2, { used: 0, limit: 30 }],
          [3, { used: 0, limit: 30 }],
        ]),
      });
    } else if (outlet.itemType === ItemType.OUTLET_L21_30) {
      // ISSUE #4 FIX: L21-30 outlets don't track usage themselves
      // Usage is tracked at the doghouse level instead
      // But we still need to initialize them for display purposes
      usageMap.set(outlet.id, {
        used: 0,
        limit: 30, // Not really used, just for display
      });
    } else {
      usageMap.set(outlet.id, {
        used: 0,
        limit: outletNode?.maxAmps || 20,
      });
    }
  });
  
  // Build a map of all items for quick lookup
  const allItems = new Map<string, PlacedItem>();
  [...outlets, ...equipment, ...accessories].forEach(item => {
    allItems.set(item.id, item);
  });
  
  // For each piece of equipment, trace back to outlet and calculate usage
  equipment.forEach(equip => {
    const def = ITEM_DEFINITIONS[equip.itemType];
    if (!def.watts) return;
    
    const amps = def.watts / 120;
    
    // Trace back through cables to find the outlet/doghouse
    const trace = traceToOutlet(equip.id, cables, allItems);
    
    if (trace.outletId) {
      const outlet = allItems.get(trace.outletId);
      if (!outlet) return;
      
      const usage = usageMap.get(trace.outletId);
      if (!usage) return;
      
      // ISSUE #4 FIX: If the source is an L21-30 outlet, find the doghouse it's connected to
      if (outlet.itemType === ItemType.OUTLET_L21_30) {
        // Find doghouse connected to this L21-30 outlet
        const doghouseTrace = findConnectedDoghouse(trace.outletId, equip.id, cables, allItems);
        
        if (doghouseTrace.doghouseId) {
          const doghouseUsage = usageMap.get(doghouseTrace.doghouseId);
          if (doghouseUsage && doghouseUsage.pairs && doghouseTrace.pairId !== undefined) {
            const pair = doghouseUsage.pairs.get(doghouseTrace.pairId);
            if (pair) {
              pair.used += amps;
            }
          }
        }
      } else if (outlet.itemType === ItemType.DOGHOUSE) {
        // Direct doghouse connection
        // NOTE: For doghouse, we only track usage at the pair level, not at the general level
        // The usage.used field remains 0 and is not used
        
        console.log(`[DOGHOUSE] Equipment ${equip.id} traced to doghouse ${outlet.id}`);
        console.log(`[DOGHOUSE] Pair ID from trace: ${trace.doghousePairId}`);
        console.log(`[DOGHOUSE] Equipment draws: ${amps.toFixed(2)}A`);
        
        if (usage.pairs && trace.doghousePairId !== undefined) {
          const pair = usage.pairs.get(trace.doghousePairId);
          if (pair) {
            console.log(`[DOGHOUSE] Adding ${amps.toFixed(2)}A to pair ${trace.doghousePairId} (was ${pair.used.toFixed(2)}A)`);
            pair.used += amps;
            console.log(`[DOGHOUSE] Pair ${trace.doghousePairId} now has ${pair.used.toFixed(2)}A`);
          } else {
            console.warn(`[DOGHOUSE] Pair ${trace.doghousePairId} not found in usage map!`);
          }
        } else {
          console.warn(`[DOGHOUSE] Missing pairs map or pairId undefined! pairs=${!!usage.pairs}, pairId=${trace.doghousePairId}`);
        }
      } else {
        // Regular outlet
        usage.used += amps;
      }
    }
  });
  
  // NOTE: Second pass removed - L21-30 outlets don't track usage themselves
  // The doghouse tracks usage per pair, not at the outlet level
  // This was causing confusion because one L21-30 can feed multiple doghouse pairs
  /*
  // Second pass: For each L21-30 outlet, find which doghouse and pair it's connected to
  outlets.forEach(outlet => {
    if (outlet.itemType === ItemType.OUTLET_L21_30) {
      const doghouseTrace = findConnectedDoghouse(outlet.id, cables, allItems);
      
      if (doghouseTrace.doghouseId && doghouseTrace.pairId !== undefined) {
        const usage = usageMap.get(outlet.id);
        if (usage) {
          usage.connectedDoghouseId = doghouseTrace.doghouseId;
          usage.connectedPairId = doghouseTrace.pairId;
          
          // Also copy the pair usage from the doghouse for display
          const doghouseUsage = usageMap.get(doghouseTrace.doghouseId);
          if (doghouseUsage && doghouseUsage.pairs) {
            const pair = doghouseUsage.pairs.get(doghouseTrace.pairId);
            if (pair) {
              usage.used = pair.used;
              usage.limit = pair.limit;
            }
          }
        }
      }
    }
  });
  */
  
  return usageMap;
}

interface TraceResult {
  outletId: string | null;
  doghousePairId?: number;
}

interface DoghouseTraceResult {
  doghouseId: string | null;
  pairId?: number;
}

/**
 * NEW: Traces from an L21-30 outlet to find the connected doghouse and which pair the equipment uses
 * FIXED: Now traces forward from doghouse through the specific path to the equipment
 */
function findConnectedDoghouse(
  outletId: string,
  equipmentId: string,
  cables: Cable[],
  allItems: Map<string, PlacedItem>
): DoghouseTraceResult {
  const result: DoghouseTraceResult = { doghouseId: null };
  
  console.log(`[DOGHOUSE TRACE] Finding doghouse for equipment ${equipmentId} connected via outlet ${outletId}`);
  
  // Find cables that connect FROM this outlet
  const outletCables = cables.filter(c => c.fromNodeId.startsWith(outletId + '-'));
  console.log(`[DOGHOUSE TRACE] Found ${outletCables.length} cables from outlet`);
  
  for (const cable of outletCables) {
    if (!cable.toNodeId) continue;
    
    // Parse the destination item ID
    const [toItemId] = cable.toNodeId.split('-');
    const toItem = allItems.get(toItemId);
    
    console.log(`[DOGHOUSE TRACE] Cable ${cable.id} goes to item ${toItemId}, type: ${toItem?.itemType}`);
    
    if (toItem && toItem.itemType === ItemType.DOGHOUSE) {
      // Found the doghouse!
      result.doghouseId = toItemId;
      console.log(`[DOGHOUSE TRACE] ✓ Found doghouse: ${toItemId}`);
      
      // Now we need to trace FORWARD from this equipment back to find which doghouse output it connects through
      // We'll do a reverse trace: start from equipment, work backwards until we hit the doghouse,
      // and see which output node we exit from
      const pairId = traceEquipmentToDoghouseOutput(equipmentId, toItemId, cables, allItems);
      
      if (pairId !== null) {
        result.pairId = pairId;
        console.log(`[DOGHOUSE TRACE] ✓ Equipment traces to pair ${pairId}`);
      } else {
        console.warn(`[DOGHOUSE TRACE] ⚠️ Could not determine pair for equipment ${equipmentId}`);
      }
      
      break;
    }
  }
  
  console.log(`[DOGHOUSE TRACE] Final result: doghouseId=${result.doghouseId}, pairId=${result.pairId}`);
  return result;
}

/**
 * Traces from equipment backwards to find which doghouse output node it's connected through
 */
function traceEquipmentToDoghouseOutput(
  equipmentId: string,
  doghouseId: string,
  cables: Cable[],
  allItems: Map<string, PlacedItem>
): number | null {
  const equipment = allItems.get(equipmentId);
  if (!equipment) return null;
  
  const equipDef = ITEM_DEFINITIONS[equipment.itemType];
  
  // Start from the equipment's tail-in node
  let currentNodeId = equipDef.watts ? `${equipmentId}-tail-in` : `${equipmentId}-in`;
  
  console.log(`[PAIR TRACE] Tracing ${equipmentId} backwards to find doghouse pair`);
  
  const visited = new Set<string>();
  
  while (true) {
    if (visited.has(currentNodeId)) {
      console.warn(`[PAIR TRACE] Circular connection at ${currentNodeId}`);
      return null;
    }
    visited.add(currentNodeId);
    
    // Find cable that connects TO this node
    const cable = cables.find(c => c.toNodeId === currentNodeId);
    if (!cable || !cable.fromNodeId) {
      console.log(`[PAIR TRACE] No cable found connecting to ${currentNodeId}`);
      return null;
    }
    
    console.log(`[PAIR TRACE] Found cable from ${cable.fromNodeId} to ${cable.toNodeId}`);
    
    const [fromItemId, ...fromNodeParts] = cable.fromNodeId.split('-');
    const fromNodeId = fromNodeParts.join('-');
    
    // Check if this is the doghouse
    if (fromItemId === doghouseId) {
      // We've reached the doghouse! The fromNodeId tells us which output
      const doghouseDef = ITEM_DEFINITIONS[ItemType.DOGHOUSE];
      const outputNode = doghouseDef.nodes.find(n => n.id === fromNodeId);
      
      if (outputNode && outputNode.pairId) {
        console.log(`[PAIR TRACE] ✓ Found doghouse output: ${fromNodeId}, pairId: ${outputNode.pairId}`);
        return outputNode.pairId;
      } else {
        console.warn(`[PAIR TRACE] Doghouse node ${fromNodeId} has no pairId`);
        return null;
      }
    }
    
    // Move to the input node of the from item
    const fromItem = allItems.get(fromItemId);
    if (!fromItem) {
      console.log(`[PAIR TRACE] From item ${fromItemId} not found`);
      return null;
    }
    
    const fromItemDef = ITEM_DEFINITIONS[fromItem.itemType];
    const inputNode = fromItemDef.nodes.find(n => n.type === 'input');
    if (!inputNode) {
      console.log(`[PAIR TRACE] No input node on ${fromItemId}`);
      return null;
    }
    
    currentNodeId = `${fromItemId}-${inputNode.id}`;
    console.log(`[PAIR TRACE] Moving to ${currentNodeId}`);
  }
}

/**
 * Traces cables backwards from equipment to find the source outlet
 * FIXED: Now properly handles equipment tails
 */
function traceToOutlet(
  equipmentId: string,
  cables: Cable[],
  allItems: Map<string, PlacedItem>
): TraceResult {
  const result: TraceResult = { outletId: null };
  
  const equipment = allItems.get(equipmentId);
  if (!equipment) {
    console.log(`[TRACE] Equipment ${equipmentId} not found`);
    return result;
  }
  
  const equipDef = ITEM_DEFINITIONS[equipment.itemType];
  
  let currentNodeId: string;
  
  if (equipDef.watts) {
    const tailInputNode = equipDef.nodes.find(n => n.id === 'tail-in');
    if (!tailInputNode) {
      console.warn(`[TRACE] Equipment ${equipmentId} has watts but no tail-in node`);
      return result;
    }
    currentNodeId = `${equipmentId}-tail-in`;
  } else {
    currentNodeId = `${equipmentId}-in`;
  }
  
  console.log(`[TRACE] Starting trace for ${equipmentId}`);
  console.log(`[TRACE] Starting node: ${currentNodeId}`);
  console.log(`[TRACE] All cables:`, cables.map(c => ({
    id: c.id,
    from: c.fromNodeId,
    to: c.toNodeId
  })));
  
  const visited = new Set<string>();
  
  while (true) {
    if (visited.has(currentNodeId)) {
      console.warn(`[TRACE] Circular connection at ${currentNodeId}`);
      break;
    }
    visited.add(currentNodeId);
    
    const cable = cables.find(c => c.toNodeId === currentNodeId);
    console.log(`[TRACE] Looking for cable TO ${currentNodeId}:`, cable ? `Found ${cable.id}` : 'NOT FOUND');
    
    if (!cable || !cable.fromNodeId) {
      console.log(`[TRACE] No cable found, stopping trace`);
      break;
    }
    
    console.log(`[TRACE] Found cable from ${cable.fromNodeId} to ${cable.toNodeId}`);
    
    const [fromItemId, ...fromNodeParts] = cable.fromNodeId.split('-');
    const fromNodeId = fromNodeParts.join('-');
    
    console.log(`[TRACE] Parsed: fromItemId=${fromItemId}, fromNodeId=${fromNodeId}`);
    
    const fromItem = allItems.get(fromItemId);
    if (!fromItem) {
      console.log(`[TRACE] From item ${fromItemId} not found`);
      break;
    }
    
    const fromItemDef = ITEM_DEFINITIONS[fromItem.itemType];
    const fromNode = fromItemDef.nodes.find(n => n.id === fromNodeId);
    if (!fromNode) {
      console.log(`[TRACE] From node ${fromNodeId} not found in ${fromItem.itemType}`);
      break;
    }
    
    const hasOnlyOutputs = fromItemDef.nodes.every(n => n.type === 'output');
    if (hasOnlyOutputs) {
      console.log(`[TRACE] Ã¢Å“â€œ Found outlet: ${fromItemId}`);
      result.outletId = fromItemId;
      
      if (fromItem.itemType === ItemType.DOGHOUSE && fromNode.pairId) {
        result.doghousePairId = fromNode.pairId;
        console.log(`[TRACE] Ã¢Å“â€œ Doghouse pair: ${fromNode.pairId}`);
      }
      
      break;
    }
    
    const inputNode = fromItemDef.nodes.find(n => n.type === 'input');
    if (!inputNode) {
      console.log(`[TRACE] No input node found on ${fromItem.itemType}`);
      break;
    }
    
    currentNodeId = `${fromItemId}-${inputNode.id}`;
    console.log(`[TRACE] Moving to next node: ${currentNodeId}`);
  }
  
  console.log(`[TRACE] Final result:`, result);
  return result;
}