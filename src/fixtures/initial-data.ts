import type { AppData } from '../models/domain.ts';

export function initialData(): AppData {
  return {
    schemaVersion: 1, onboardingComplete: false,
    household: { name: 'Brian', size: 2, budgetMinor: 7500, dietaryPreference: 'Any' },
    meals: [], purchasedKeys: [], savedRecipeIds: [],
    pantry: [
      { id: 'pantry-rice', foodId: 'rice', label: 'Rice', amount: 100, unit: 'g', aisle: 'Cupboard', storage: 'cupboard' },
      { id: 'pantry-oil', foodId: 'olive-oil', label: 'Olive oil', amount: 100, unit: 'ml', aisle: 'Cupboard', storage: 'cupboard' },
      { id: 'pantry-garlic', foodId: 'garlic', label: 'Garlic', amount: 2, unit: 'each', aisle: 'Produce', storage: 'cupboard' },
    ],
  };
}
