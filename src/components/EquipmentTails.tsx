// src/components/EquipmentTails.tsx

import type { PlacedItem } from '../types';
import type { Cable, Node } from '../types/cable';
import { ITEM_DEFINITIONS } from '../data/itemDefinitions';
import { calculateCablePath, pathToSvgString } from '../utils/cableHelpers';

interface EquipmentTailsProps {
  equipment: PlacedItem[];
  cables: Cable[];
  nodes: Node[];
}

const TAIL_COLORS = {
  edison: '#9ca3af',
  true20: '#d4a574',
  'l21-30': '#d4a574',
  'l6-20': '#d4a574',
  'l6-30': '#d4a574',
} as const;

const TAIL_WIDTH = 8;

export default function EquipmentTails({
  equipment,
  cables,
  nodes,
}: EquipmentTailsProps) {
  return (
    <>
      {equipment.map(equip => {
        const def = ITEM_DEFINITIONS[equip.itemType];
        
        if (!def.watts) return null;
        
        // Find equipment connection node (NOT tail-in)
        const equipmentConnectionNode = nodes.find(n => 
          n.itemId === equip.id && 
          n.type === 'input' && 
          n.id.endsWith('-in') && 
          !n.id.includes('tail')
        );
        
        // Find tail input node  
        const tailInputNode = nodes.find(n => 
          n.itemId === equip.id && 
          n.type === 'input' && 
          n.id.includes('tail-in')
        );
        
        if (!equipmentConnectionNode || !tailInputNode) {
          return null;
        }
        
        // Check for direct cable connection (bypasses tail)
        const hasDirectConnection = cables.some(c => 
          c.toNodeId === equipmentConnectionNode.id && c.fromNodeId && c.toNodeId
        );
        
        if (hasDirectConnection) return null;
        
        // Check if tail has cable connected
        const tailHasCable = cables.some(c => 
          c.toNodeId === tailInputNode.id && c.fromNodeId && c.toNodeId
        );
        
        if (tailHasCable) return null;
        
        // Draw tail from equipment body to tail input
        const path = calculateCablePath(
          equipmentConnectionNode.position,
          tailInputNode.position
        );
        
        const pathString = pathToSvgString(path);
        const color = TAIL_COLORS[tailInputNode.connectionType] || TAIL_COLORS.edison;
        
        return (
          <g key={`tail-${equip.id}`} className="equipment-tail">
            <path
              d={pathString}
              stroke={color}
              strokeWidth={TAIL_WIDTH}
              fill="none"
              strokeLinecap="round"
              opacity={1}
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              }}
            />
          </g>
        );
      })}
    </>
  );
}