import type { PantryItem } from '../models/domain.ts';

const categoryOrder = ['Protein', 'Condiments', 'Produce', 'Grains & Bread', 'Dairy'];
const categories: Record<string, string> = {
  rice: 'Grains & Bread', pita: 'Grains & Bread', bread: 'Grains & Bread',
  'olive-oil': 'Condiments', sriracha: 'Condiments', honey: 'Condiments',
  'coconut-aminos': 'Condiments', 'lime-juice': 'Condiments', lentils: 'Protein',
};
export function groupPantryItems(items: PantryItem[]) {
  const groups = new Map<string, PantryItem[]>();
  for (const item of items) {
    const category = categories[item.foodId] ?? (item.aisle === 'Bakery' ? 'Grains & Bread' : item.aisle.trim() || 'Other');
    groups.set(category, [...(groups.get(category) ?? []), item]);
  }
  const rank = (category: string) => categoryOrder.includes(category) ? categoryOrder.indexOf(category) : categoryOrder.length;
  return [...groups].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b)).map(([category, foods]) => ({ category, foods }));
}
