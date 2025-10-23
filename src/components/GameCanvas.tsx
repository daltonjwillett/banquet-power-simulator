// src/components/GameCanvas.tsx

import { useRef, useState, useEffect, useMemo } from 'react';
import { ItemType, ConnectionType } from '../types';
import type { Scenario, PlacedItem } from '../types';
import type { Cable, DraggingCable, Node } from '../types/cable';
import { ITEM_DEFINITIONS } from '../data/itemDefinitions';
import CableRenderer from './CableRenderer';
import NodeVisualization from './NodeVisualization';
import EquipmentTails from './EquipmentTails';
import { createNodesFromPlacedItems, findSnapTarget } from '../utils/cableHelpers';
import type { OutletUsage } from '../utils/ampCalculator';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface GameCanvasProps {
  scenario: Scenario | null;
  placedAccessories: PlacedItem[];
  cables: Cable[];
  draggingCable: DraggingCable | null;
  selectedCableType: 'edison' | 'flat-wire' | null;
  selectedShopItem: ItemType | null;
  onAccessoryAdd: (itemType: ItemType, x: number, y: number) => void;
  onAccessoryMove: (itemId: string, x: number, y: number) => void;
  onAccessoryRemove: (itemId: string) => void;
  onCableRemove: (cableId: string) => void;
  onCableDragStart: (cableType: 'edison' | 'flat-wire', fromNodeId: string, fromPosition: { x: number; y: number }) => void;
  onCableDragUpdate: (currentPosition: { x: number; y: number }) => void;
  onCableDragEnd: (toNodeId: string | null) => void;
  onShopItemUsed: () => void;
  onSelectionChange: (itemId: string | null, cableId: string | null) => void;
  scale: number;
  hint1Active: boolean;
  hint2Active: boolean;
  outletUsage?: Map<string, OutletUsage>;
  isZoomedIn?: boolean;
  panOffset?: { x: number; y: number };
}

export default function GameCanvas({
  scenario,
  placedAccessories,
  cables,
  draggingCable,
  selectedCableType,
  selectedShopItem,
  onAccessoryAdd,
  onAccessoryMove,
  onAccessoryRemove,
  onCableRemove,
  onCableDragStart,
  onCableDragUpdate,
  onCableDragEnd,
  onShopItemUsed,
  onSelectionChange,
  scale,
  hint1Active,
  hint2Active,
  outletUsage,
  isZoomedIn = false,
  panOffset = { x: 0, y: 0 },
}: GameCanvasProps) {
  // Mark handlers as used (they're called from App.tsx trash bin)
  void onAccessoryRemove;
  void onCableRemove;
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [allNodes, setAllNodes] = useState<Node[]>([]);
  const dragStartedRef = useRef(false);

  if (!scenario) {
    return (
      <div className="w-[1080px] h-[1920px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-300 animate-pulse"></div>
          <p className="text-2xl font-semibold text-gray-500">Loading scenario...</p>
        </div>
      </div>
    );
  }

  const allItems = [
    ...scenario.outlets,
    ...scenario.equipment,
    ...placedAccessories,
  ];

  const allItemsMap = new Map<string, PlacedItem>();
    allItems.forEach(item => {
      allItemsMap.set(item.id, item);
    });

  // Group equipment by type and table for Hint 1
  const equipmentGroups = useMemo(() => {
    if (!scenario || !hint1Active) return new Map();
    
    const groups = new Map<string, {
      itemType: ItemType;
      ampDraw: number;
      count: number;
      centerX: number;
      centerY: number;
      specialReq: string | null;
    }>();

    scenario.equipment.forEach(equip => {
      const def = ITEM_DEFINITIONS[equip.itemType];
      if (!def.watts) return;
      
      const ampDraw = def.watts / 120;
      const inputNode = def.nodes.find(n => n.type === 'input');
      let specialReq: string | null = null;
      
      if (inputNode) {
        if (inputNode.connectionType === ConnectionType.TRUE_20) {
          specialReq = 'TRUE-20';
        } else if (inputNode.connectionType === ConnectionType.L6_20) {
          specialReq = 'L6-20';
        } else if (inputNode.connectionType === ConnectionType.L6_30) {
          specialReq = 'L6-30';
        }
      }
      
      // Find which table this equipment belongs to
      let tableId = 'standalone';
      for (const table of scenario.tables) {
        if (table.equipment && table.equipment.includes(equip.itemType)) {
          // Check if this equipment's position is within the table bounds
          const isOnTable = 
            equip.x >= table.x - 50 &&
            equip.x <= table.x + table.width + 50 &&
            equip.y >= table.y - 50 &&
            equip.y <= table.y + table.height + 50;
          
          if (isOnTable) {
            tableId = table.id;
            break;
          }
        }
      }
      
      // Create unique key based on item type and table
      const posKey = `${equip.itemType}-${tableId}`;
      
      const existing = groups.get(posKey);
      if (existing) {
        existing.count += 1;
        // Average the position for center
        existing.centerX = (existing.centerX * (existing.count - 1) + equip.x) / existing.count;
        existing.centerY = (existing.centerY * (existing.count - 1) + equip.y) / existing.count;
      } else {
        groups.set(posKey, {
          itemType: equip.itemType,
          ampDraw,
          count: 1,
          centerX: equip.x,
          centerY: equip.y,
          specialReq,
        });
      }
    });
    
    return groups;
  }, [scenario, hint1Active]);

  useEffect(() => {
    if (!scenario) return;
    
    const nodes = createNodesFromPlacedItems(
      [...scenario.outlets, ...scenario.equipment, ...placedAccessories],
      scale
    );
    setAllNodes(nodes);
  }, [scenario, placedAccessories, scale]);

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Get position relative to canvas
    let x = (clientX - rect.left) / scale;
    let y = (clientY - rect.top) / scale;
    
    // If zoomed in, we need to account for the zoom transform and pan offset
    if (isZoomedIn) {
      const zoomScale = 1.5;
      const canvasCenter = {
        x: rect.width / (2 * scale),
        y: rect.height / (2 * scale),
      };
      
      // Reverse the pan offset (convert screen pixels to canvas pixels)
      const panX = panOffset.x / (scale * zoomScale);
      const panY = panOffset.y / (scale * zoomScale);
      
      // Adjust for zoom: position relative to center, then divide by zoom, then add center back
      x = (x - canvasCenter.x) / zoomScale + canvasCenter.x - panX;
      y = (y - canvasCenter.y) / zoomScale + canvasCenter.y - panY;
    }
    
    return { x, y };
  };

  const clampToCanvas = (x: number, y: number) => {
    const padding = 50;
    const maxX = canvasRef.current?.clientWidth || 1080;
    const maxY = canvasRef.current?.clientHeight || 1690;
    
    return {
      x: Math.max(padding, Math.min(maxX - padding, x)),
      y: Math.max(padding, Math.min(maxY - padding, y)),
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (selectedShopItem) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      const clamped = clampToCanvas(coords.x, coords.y);
      onAccessoryAdd(selectedShopItem, clamped.x, clamped.y);
      onShopItemUsed();
    } else {
      const target = e.target as HTMLElement;
      if (target === canvasRef.current || target.closest('[data-canvas-bg]')) {
        setSelectedItemId(null);
        setSelectedCableId(null);
        onSelectionChange(null, null);
      }
    }
  };

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (selectedShopItem && e.touches.length === 1) {
      const touch = e.touches[0];
      const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
      const clamped = clampToCanvas(coords.x, coords.y);
      onAccessoryAdd(selectedShopItem, clamped.x, clamped.y);
      onShopItemUsed();
    } else if (!selectedShopItem) {
      const target = e.target as HTMLElement;
      if (target === canvasRef.current || target.closest('[data-canvas-bg]')) {
        setSelectedItemId(null);
        setSelectedCableId(null);
        onSelectionChange(null, null);
      }
    }
  };

  const handleItemMouseDown = (e: React.MouseEvent, itemId: string, isLocked: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (selectedShopItem) return;
    
    dragStartedRef.current = false;
    
    setSelectedItemId(itemId);
    setSelectedCableId(null);
    onSelectionChange(itemId, null);
    
    if (isLocked) return;
    
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    const item = allItems.find(i => i.id === itemId);
    
    if (item && !item.locked) {
      setDraggingItemId(itemId);
      setDragOffset({
        x: coords.x - item.x,
        y: coords.y - item.y,
      });
    }
  };

  const handleItemTouchStart = (e: React.TouchEvent, itemId: string, isLocked: boolean) => {
    e.stopPropagation();
    
    if (selectedShopItem || e.touches.length !== 1) return;
    
    dragStartedRef.current = false;
    
    setSelectedItemId(itemId);
    setSelectedCableId(null);
    onSelectionChange(itemId, null);
    
    if (isLocked) return;
    
    const touch = e.touches[0];
    const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
    const item = allItems.find(i => i.id === itemId);
    
    if (item && !item.locked) {
      setDraggingItemId(itemId);
      setDragOffset({
        x: coords.x - item.x,
        y: coords.y - item.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    
    if (draggingCable) {
      onCableDragUpdate(coords);
    } else if (draggingItemId) {
      e.preventDefault();
      dragStartedRef.current = true;
      const newPos = clampToCanvas(coords.x - dragOffset.x, coords.y - dragOffset.y);
      onAccessoryMove(draggingItemId, newPos.x, newPos.y);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingCable && e.touches.length === 1) {
      const touch = e.touches[0];
      const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
      onCableDragUpdate(coords);
    } else if (draggingItemId && e.touches.length === 1) {
      e.preventDefault();
      dragStartedRef.current = true;
      const touch = e.touches[0];
      const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
      const newPos = clampToCanvas(coords.x - dragOffset.x, coords.y - dragOffset.y);
      onAccessoryMove(draggingItemId, newPos.x, newPos.y);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggingCable) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      const snapNode = findSnapTarget(coords, allNodes, draggingCable, allItemsMap);
      
      if (snapNode) {
        onCableDragEnd(snapNode.id);
      } else {
        onCableDragEnd(null);
      }
    } else if (draggingItemId) {
      setDraggingItemId(null);
      setTimeout(() => {
        dragStartedRef.current = false;
      }, 0);
    }
  };

  const handleTouchEnd = () => {
    if (draggingCable) {
      if (draggingCable.currentPosition) {
        const snapNode = findSnapTarget(draggingCable.currentPosition, allNodes, draggingCable, allItemsMap);
        
        if (snapNode) {
          onCableDragEnd(snapNode.id);
        } else {
          onCableDragEnd(null);
        }
      } else {
        onCableDragEnd(null);
      }
    } else if (draggingItemId) {
      setDraggingItemId(null);
      setTimeout(() => {
        dragStartedRef.current = false;
      }, 0);
    }
  };

  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    
    if (dragStartedRef.current) {
      dragStartedRef.current = false;
      return;
    }
    
    if (selectedShopItem) return;
    
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
      onSelectionChange(null, null);
    } else {
      setSelectedItemId(itemId);
      setSelectedCableId(null);
      onSelectionChange(itemId, null);
    }
  };

  const handleCableClick = (cableId: string) => {
    setSelectedCableId(cableId);
    setSelectedItemId(null);
    onSelectionChange(null, cableId);
  };

  const handleNodeClick = (node: Node) => {
    if (node.type === 'input') {
      // Check if this tail node already has a cable connected
      const hasConnectedCable = cables.some(cable => 
        cable.toNodeId === node.id && cable.fromNodeId && cable.toNodeId
      );
      
      // If already connected, don't allow dragging
      if (hasConnectedCable) {
        return;
      }
      
      // This is a tail node - determine cable type needed and START dragging immediately
      let cableType: 'edison' | 'flat-wire' = 'edison';
      
      // Special twist-lock connections use flat-wire appearance
      if (node.connectionType === ConnectionType.L21_30 ||
          node.connectionType === ConnectionType.L6_20 ||
          node.connectionType === ConnectionType.L6_30) {
        cableType = 'flat-wire';
      }
      
      // Start dragging FROM the input node (tail)
      onCableDragStart(cableType, node.id, node.position);
      return;
    }
    
    // This is an output node (outlet or accessory)
    if (node.type !== 'output') return;
    
    if (!selectedCableType) return;
    
    // Start cable from this OUTPUT node
    onCableDragStart(selectedCableType, node.id, node.position);
  };

  const shouldShowLabel = (itemId: string, itemType: ItemType): boolean => {
    if (selectedItemId === itemId && !selectedShopItem && !selectedCableType) return true;
    
    // Don't show individual labels during hint1 (we show grouped labels instead)
    if (hint1Active) {
      return false;
    }
    
    if (hint2Active) {
      // ISSUE #3 FIX: Only show usage on 20A outlets and DOGHOUSES
      // DO NOT show on L21-30 outlets
      if (itemType === ItemType.OUTLET_20A || itemType === ItemType.DOGHOUSE) {
        return true;
      }
    }
    
    return false;
  };

  const getUsageBadgeColor = (used: number, limit: number): string => {
    if (used > limit) return 'bg-red-500';
    if (used >= limit - 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="relative w-[1080px] h-[1920px] bg-white overflow-hidden shadow-2xl">
      <div className="h-[80px] bg-gradient-to-b from-black to-gray-900" />

      <div
        ref={canvasRef}
        data-canvas-bg="true"
        className={`relative w-full h-[calc(100%-230px)] bg-gradient-to-br from-gray-50 via-white to-gray-100 select-none ${
          selectedShopItem ? 'cursor-crosshair' : 'cursor-default'
        }`}
        style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleCanvasTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {scenario.tables.map((table) => {
          // Calculate width multiplier based on equipment count
          const equipmentCount = table.equipment?.length || 0;
          let widthMultiplier = 1.2; // Default for 1-3 items
          
          if (equipmentCount >= 6) {
            widthMultiplier = 1.5; // Wider for 6+ items
          } else if (equipmentCount === 5) {
            widthMultiplier = 1.4; // Wider for 5 items
          } else if (equipmentCount === 4) {
            widthMultiplier = 1.3; // Slightly wider for 4 items
          }
          
          // Calculate final width and subtract 25px to prevent overflow
          const finalWidth = (table.width * widthMultiplier) - 25;
          
          // Ensure table doesn't go off screen (max canvas width is 1080)
          const maxAllowedWidth = 1080 - table.x - 80; // 80px right padding
          const clampedWidth = Math.min(finalWidth, maxAllowedWidth);
          
          return (
            <div
              key={table.id}
              className="absolute bg-gradient-to-br from-amber-50 to-amber-100 border-4 border-amber-700 rounded-2xl shadow-lg pointer-events-none"
              style={{
                left: `${table.x}px`,
                top: `${table.y}px`,
                width: `${clampedWidth}px`,
                height: `${table.height}px`,
              }}
            >
              <div className="absolute inset-0 opacity-10 rounded-xl" 
                   style={{
                     backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
                   }} 
              />
            </div>
          );
        })}

        <CableRenderer
          cables={cables}
          draggingCable={draggingCable}
          selectedCableId={selectedCableId}
          allNodes={allNodes}        
          allItems={allItemsMap}        
          onCableClick={handleCableClick}
        />

         <svg 
          className="absolute inset-0" 
          style={{ 
            zIndex: 50, 
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          viewBox="0 0 1080 1690"
          preserveAspectRatio="none"
        >
          <EquipmentTails
            equipment={scenario.equipment}
            cables={cables}
            nodes={allNodes}
          />
        </svg>

        <svg
          className="absolute inset-0"
          style={{
            zIndex: 45,
            pointerEvents: 'none', // Keep as 'none' - child elements handle their own events
            width: '100%',
            height: '100%',
          }}
          viewBox="0 0 1080 1690"
          preserveAspectRatio="none"
        >
          <NodeVisualization
            nodes={allNodes}
            draggingCable={draggingCable}
            selectedCableType={selectedCableType}
            allItems={allItemsMap}
            scale={scale}
            onNodeClick={handleNodeClick}
          />
        </svg>

        {allItems.map((item) => {
          const def = ITEM_DEFINITIONS[item.itemType];
          const isSelected = selectedItemId === item.id;
          const isDragging = draggingItemId === item.id;
          const isLocked = item.locked || false;
          const showLabel = shouldShowLabel(item.id, item.itemType);

          return (
            <div
              key={item.id}
              className={`absolute transition-none ${
                isDragging ? 'z-50 scale-110 cursor-grabbing' : isSelected ? 'z-40' : 'z-20'
              } ${
                isSelected && !isDragging && !selectedShopItem && !selectedCableType ? 'ring-4 ring-yellow-400 shadow-xl' : ''
              } ${isLocked ? 'cursor-pointer' : isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'}`}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={(e) => handleItemMouseDown(e, item.id, isLocked)}
              onTouchStart={(e) => handleItemTouchStart(e, item.id, isLocked)}
              onClick={(e) => handleItemClick(e, item.id)}
            >
              <div className={`relative ${isSelected && !isDragging && !selectedShopItem && !selectedCableType ? 'animate-pulse' : ''}`} style={{ transform: 'scale(1.5)', transformOrigin: 'center' }}>
                {def.imagePath ? (
                  <img
                    src={def.imagePath}
                    alt={def.displayName}
                    className="max-w-none h-auto select-none pointer-events-none"
                    draggable={false}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-semibold text-center px-2">{def.displayName}</span>
                  </div>
                )}
              </div>

              {!isDragging && hint2Active && (item.itemType === ItemType.OUTLET_20A || item.itemType === ItemType.DOGHOUSE) && (
                <div className={`absolute ${item.itemType === ItemType.DOGHOUSE ? 'left-full ml-4 top-1/2 -translate-y-1/2' : '-top-20 left-1/2 -translate-x-1/2'} whitespace-nowrap pointer-events-none`}>
                  {(() => {
                    const usage = outletUsage?.get(item.id);
                    if (!usage) return null;

                    // Doghouse: Show 3 colored pairs
                    if (item.itemType === ItemType.DOGHOUSE && usage.pairs) {
                      const pairColors = {
                        1: 'bg-black',
                        2: 'bg-red-500',
                        3: 'bg-blue-500',
                      };
                      
                      return (
                        <div className="flex flex-col gap-1.5">
                          {Array.from(usage.pairs.entries()).map(([pairId, pairUsage]) => (
                            <div
                              key={pairId}
                              className={`${pairColors[pairId as keyof typeof pairColors]} text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white`}
                            >
                              {pairId}: {pairUsage.used.toFixed(1)}A / {pairUsage.limit}A
                            </div>
                          ))}
                        </div>
                      );
                    }

                    // Regular 20A outlet: Show single usage
                    if (item.itemType === ItemType.OUTLET_20A) {
                      return (
                        <div className={`${getUsageBadgeColor(usage.used, usage.limit)} text-white text-xl font-bold px-5 py-3 rounded-full shadow-lg`}>
                          {usage.used.toFixed(1)}A / {usage.limit}A
                        </div>
                      );
                    }
                    
                    return null;
                  })()}
                </div>
              )}

              {!isDragging && showLabel && !hint1Active && !hint2Active && isSelected && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none z-50">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xl font-bold px-5 py-3 rounded-full shadow-lg border-2 border-yellow-300">
                    {def.displayName}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Grouped Amp Labels for Hint 1 */}
        {hint1Active && Array.from(equipmentGroups.values()).map((group, idx) => (
          <div
            key={`amp-label-group-${idx}`}
            className="absolute whitespace-nowrap pointer-events-none"
            style={{
              left: `${group.centerX}px`,
              top: `${group.centerY - 100}px`,
              transform: 'translateX(-50%)',
              zIndex: 35,
            }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold px-5 py-3 rounded-full shadow-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {group.ampDraw.toFixed(1)}A{group.count > 1 ? ` Ãƒâ€”${group.count}` : ''}
              {group.specialReq && (
                <span className="ml-2 text-xs bg-orange-500 px-2 py-1 rounded">
                  {group.specialReq}
                </span>
              )}
            </div>
          </div>
        ))}

        {selectedShopItem && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[100]">
            <div className="bg-black/70 text-white px-8 py-4 rounded-2xl text-xl font-semibold shadow-2xl backdrop-blur-sm border border-white/20">
              Click to place {ITEM_DEFINITIONS[selectedShopItem]?.displayName}
            </div>
          </div>
        )}

        {selectedCableType && !selectedShopItem && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[100]">
            <div className="bg-black/70 text-white px-8 py-4 rounded-2xl text-xl font-semibold shadow-2xl backdrop-blur-sm border border-white/20">
              Click an outlet to start drawing {selectedCableType === 'edison' ? 'Edison' : 'Flat-Wire'} cable
            </div>
          </div>
        )}
      </div>
    </div>
  );
}