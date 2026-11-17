import { ingredientCatalog, recipes } from '../fixtures/recipes.ts';
import { commonFoods } from '../fixtures/common-foods.ts';
import type { AppData, PantryItem } from '../models/domain.ts';
import { toStoredQuantity, type InputUnit } from './quantities.ts';

// Practical starter amounts, not recipe portions. Users can edit each saved item.
const packages: Record<string, [number, InputUnit, string, PantryItem['storage']]> = {
  chicken: [2, 'breast', '2 medium breasts', 'fridge'],
  garlic: [10, 'each', '1 bulb · about 10 cloves', 'cupboard'],
  rice: [1, 'lb', '1 lb bag', 'cupboard'],
  sriracha: [9, 'fl oz', '9 fl oz bottle', 'cupboard'],
  honey: [8, 'fl oz', '8 fl oz bottle', 'cupboard'],
  asparagus: [1, 'lb', '1 lb bunch', 'fridge'],
  'olive-oil': [16, 'fl oz', '16 fl oz bottle', 'cupboard'],
  pita: [6, 'each', '6 pitas', 'cupboard'],
  cucumber: [1, 'each', '1 cucumber', 'fridge'],
  yogurt: [32, 'oz', '32 oz tub', 'fridge'],
  lemon: [2, 'each', '2 lemons', 'fridge'],
  lentils: [15, 'oz', '15 oz can', 'cupboard'],
  tomato: [14.5, 'oz', '14½ oz can', 'cupboard'],
  zucchini: [2, 'each', '2 zucchini', 'fridge'],
  eggplant: [1, 'each', '1 eggplant', 'fridge'],
  tofu: [14, 'oz', '14 oz block', 'fridge'],
  bread: [20, 'each', '1 loaf · about 20 slices', 'cupboard'],
  feta: [6, 'oz', '6 oz pack', 'fridge'],
};
const recipeSuggestions = ingredientCatalog.map(ingredient => {
  const [amount, unit, suggestedLabel, storage] = packages[ingredient.foodId] ?? [1, ingredient.unit === 'each' ? 'each' : ingredient.unit === 'g' ? 'lb' : 'cup', 'Editable starter amount', (ingredient.aisle === 'Frozen' ? 'freezer' : ['Produce', 'Protein', 'Dairy'].includes(ingredient.aisle) ? 'fridge' : 'cupboard') as PantryItem['storage']];
  const recipeCount = recipes.filter(recipe => recipe.ingredients.some(i => i.foodId === ingredient.foodId)).length;
  return { ...ingredient, ...toStoredQuantity(amount, unit), storage, suggestedLabel, recipeCount };
}).sort((a, b) => b.recipeCount - a.recipeCount || a.label.localeCompare(b.label));

const recipeFoodIds = new Set(recipeSuggestions.map(item => item.foodId));
const recipeLabels = new Set(recipeSuggestions.map(item => item.label.trim().toLowerCase()));
const commonSuggestions = commonFoods.filter(item => !recipeFoodIds.has(item.foodId) && !recipeLabels.has(item.label.trim().toLowerCase())).map(item => ({
  ...item,
  storage: item.storage as PantryItem['storage'],
  amount: 1,
  unit: 'each' as const,
  suggestedLabel: '1 item',
  recipeCount: 0,
}));
export const pantrySuggestions = [...recipeSuggestions, ...commonSuggestions];

/** One atomic save; repeated selections and foods already owned never duplicate stock. */
export function addSuggestedPantryItems(data: AppData, foodIds: string[], batchId = String(Date.now())): AppData {
  const selected = new Set(foodIds);
  const owned = new Set(data.pantry.map(item => item.foodId));
  const additions: PantryItem[] = pantrySuggestions.filter(item => selected.has(item.foodId) && !owned.has(item.foodId)).map(({ suggestedLabel: _label, recipeCount: _count, ...item }) => ({ ...item, id: `pantry-${batchId}-${item.foodId}` }));
  return { ...data, pantry: [...data.pantry, ...additions] };
}
