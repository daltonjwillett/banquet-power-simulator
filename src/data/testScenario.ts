import { ItemType } from '../types';
import type { Scenario } from '../types';

export const TEST_SCENARIO: Scenario = {
  id: 0,
  name: 'Test Scenario',
  difficulty: 'easy',
  
  // One 20A outlet on the left side
  outlets: [
    {
      id: 'outlet1',
      itemType: ItemType.OUTLET_20A,
      x: 200,
      y: 300,
      locked: true,
    },
  ],
  
  // One table in the center
  tables: [
    {
      id: 'table1',
      x: 400,
      y: 400,
      width: 400,
      height: 200,
      equipment: [ItemType.TOASTER, ItemType.SINGLE_HEAT_LAMP],
    },
  ],
  
  // Equipment placed on the table
  equipment: [
    {
      id: 'toaster1',
      itemType: ItemType.TOASTER,
      x: 500,
      y: 450,
      locked: true,
    },
    {
      id: 'heatlamp1',
      itemType: ItemType.SINGLE_HEAT_LAMP,
      x: 650,
      y: 450,
      locked: true,
    },
  ],
};