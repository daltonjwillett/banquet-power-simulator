// src/components/ShopInventory.tsx

import { ItemType } from '../types';
import { ITEM_DEFINITIONS } from '../data/itemDefinitions';

interface ShopInventoryProps {
  selectedItem: ItemType | null;
  selectedCableType: 'edison' | 'flat-wire' | null;
  onSelectItem: (itemType: ItemType | null) => void;
  onSelectCableType: (cableType: 'edison' | 'flat-wire' | null) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Available accessories in the shop
const SHOP_ACCESSORIES = [
  ItemType.TRI_TAP,
  ItemType.QUAD_BOX,
  ItemType.SIX_WAY,
  ItemType.DOGHOUSE,
  ItemType.SQUID,
  ItemType.DOG_BONE,
];

export default function ShopInventory({
  selectedItem,
  selectedCableType,
  onSelectItem,
  onSelectCableType,
  isOpen,
  onToggle,
}: ShopInventoryProps) {
  
  const handleCableClick = (cableType: 'edison' | 'flat-wire') => {
    // Clear accessory selection when selecting cable
    if (selectedItem) {
      onSelectItem(null);
    }
    // Toggle cable selection
    onSelectCableType(selectedCableType === cableType ? null : cableType);
  };

  const handleAccessoryClick = (itemType: ItemType) => {
    // Clear cable selection when selecting accessory
    if (selectedCableType) {
      onSelectCableType(null);
    }
    
    // If clicking the same item, deselect it (don't close shop)
    if (selectedItem === itemType) {
      onSelectItem(null);
    } else {
      // Selecting a new item - select it and close the shop
      onSelectItem(itemType);
      onToggle(); // Close the shop
    }
  };

  return (
    <div
      className="bg-gradient-to-b from-gray-800 to-gray-900 border-t-2 border-gray-700 shadow-2xl transition-all duration-300 ease-in-out relative z-50"
      style={{
        height: isOpen ? '720px' : '0px', // Increased from 600px to 720px
      }}
    >
      {/* Toggle Bar with Cable Buttons - Always Visible - 130px height */}
      <div className="absolute bottom-0 left-0 right-0 h-[130px] bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 border-t-2 border-gray-500 shadow-lg flex items-center justify-between px-6 z-[70]">
        
        {/* Edison Cable Button */}
        <button
          onClick={() => handleCableClick('edison')}
          className={`group flex flex-col items-center gap-2 px-8 py-4 rounded-2xl transition-all duration-200 ${
            selectedCableType === 'edison'
              ? 'bg-orange-500 shadow-xl shadow-orange-500/50 scale-105'
              : 'hover:bg-gray-600 hover:scale-105'
          }`}
        >
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-white font-bold text-lg">EDISON</span>
        </button>

        {/* Shop Toggle Button (Center) */}
        <button
          onClick={onToggle}
          className="flex-1 mx-6 flex items-center justify-center gap-5 hover:bg-gray-600 rounded-2xl py-4 transition-all duration-200"
        >
          <svg className="w-11 h-11 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-white font-bold text-3xl tracking-wide">SHOP</span>
          <svg
            className={`w-11 h-11 text-gray-300 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>

        {/* Flat-Wire Cable Button */}
        <button
          onClick={() => handleCableClick('flat-wire')}
          className={`group flex flex-col items-center gap-2 px-8 py-4 rounded-2xl transition-all duration-200 ${
            selectedCableType === 'flat-wire'
              ? 'bg-orange-500 shadow-xl shadow-orange-500/50 scale-105'
              : 'hover:bg-gray-600 hover:scale-105'
          }`}
        >
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-white font-bold text-lg">FLATWIRE</span>
        </button>
      </div>

      {/* Shop Content - 3 columns for accessories, NO SCROLLING */}
      {isOpen && (
        <div className="h-[590px] p-6 relative z-50">
          {/* Accessories Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              <h3 className="text-2xl font-bold text-white uppercase tracking-wide">Power Accessories</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {SHOP_ACCESSORIES.map((itemType) => {
                const def = ITEM_DEFINITIONS[itemType];
                const isSelected = selectedItem === itemType;

                return (
                  <button
                    key={itemType}
                    onClick={() => handleAccessoryClick(itemType)}
                    className={`relative p-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50 ring-2 ring-blue-400'
                        : 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 shadow-md'
                    }`}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* Item Image or Placeholder */}
                    <div className="w-full aspect-video flex items-center justify-center mb-3 bg-gray-900/50 rounded-lg p-2">
                      {def.imagePath ? (
                        <img
                          src={def.imagePath}
                          alt={def.displayName}
                          className="max-w-full max-h-full object-contain"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs text-center px-1">
                            {def.displayName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Item Name */}
                    <p className={`text-sm font-semibold text-center ${
                      isSelected ? 'text-white' : 'text-gray-200'
                    }`}>
                      {def.displayName}
                    </p>

                    {/* Additional Info */}
                    {def.ampLimit && (
                      <p className={`text-xs text-center mt-1 ${
                        isSelected ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {def.ampLimit}A limit
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}