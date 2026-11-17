import { imperialQuantity, purchaseQuantity } from './quantities.ts';
import { findRecipe } from '../fixtures/recipes.ts';
import type { AppData, Household, Ingredient, Meal, Recipe, ShoppingItem } from '../models/domain.ts';

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function nextDays(count = 7, from = new Date()) {
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset, 12);
    return { value: localDate(date), label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) };
  });
}
export function dateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
/** Home heading: "Today, November 17", "Tomorrow, November 18", "Yesterday, ...", else "Wednesday, November 19". */
export function dayHeading(date: string, today: string) {
  const at = (d: string) => new Date(`${d}T12:00:00`);
  const days = Math.round((at(date).getTime() - at(today).getTime()) / 86400000);
  const lead = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days === -1 ? 'Yesterday' : at(date).toLocaleDateString('en-US', { weekday: 'long' });
  return `${lead}, ${at(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
}
export function money(minor: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(minor / 100);
}
export function quantity(amount: number, unit: Ingredient['unit']) {
  return imperialQuantity(amount, unit);
}
const amountKey = (foodId: string, unit: string) => `${foodId}:${unit}`;
export function householdPortionFactor(household: Household) { return household.portionSize === 'Light' ? 0.75 : household.portionSize === 'Hearty' ? 1.25 : 1; }
export function matchesDiet(recipe: Recipe, preference: Household['dietaryPreference']) {
  if (preference === 'Any') return true;
  if (preference === 'Vegan') return recipe.tags.includes('Vegan');
  return recipe.tags.includes('Vegetarian') || recipe.tags.includes('Vegan') || preference === 'Pescatarian' && (recipe.tags.includes('Pescatarian') || recipe.tags.includes('Fish') || recipe.tags.includes('Seafood'));
}

export function mealIngredients(meal: Meal): Ingredient[] {
  const recipe = findRecipe(meal.recipeId);
  if (!recipe) throw new Error('That recipe is no longer available.');
  return recipe.ingredients.map(item => ({ ...item, amount: item.amount * meal.servings * (meal.portionFactor ?? 1) / recipe.baseServings }));
}
/** Scale first, aggregate compatible units, then subtract pantry stock exactly once. */
export function shoppingList(data: AppData): ShoppingItem[] {
  const totals = new Map<string, Ingredient>();
  for (const meal of data.meals.filter(m => m.status === 'planned')) {
    for (const item of mealIngredients(meal)) {
      const key = amountKey(item.foodId, item.unit);
      totals.set(key, { ...item, amount: (totals.get(key)?.amount ?? 0) + item.amount });
    }
  }
  return [...totals.entries()].flatMap(([key, item]) => {
    const stocked = data.pantry.filter(p => amountKey(p.foodId, p.unit) === key).reduce((sum, p) => sum + p.amount, 0);
    const amount = Number(Math.max(0, item.amount - stocked).toFixed(4));
    if (amount === 0) return [];
    // Checkmarks apply to a specific quantity, so changing portions invalidates stale checks.
    const purchase = purchaseQuantity({ ...item, amount });
    const checkKey = `${key}:${amount}:${purchase.amount.toFixed(6)}:${purchase.purchase?.size ?? ''}`;
    return [{ ...item, ...purchase, requiredAmount: amount, key: checkKey, purchased: data.purchasedKeys.includes(checkKey) }];
  }).sort((a, b) => a.aisle.localeCompare(b.aisle) || a.label.localeCompare(b.label));
}
export function addMeal(data: AppData, meal: Meal): AppData {
  if (!findRecipe(meal.recipeId) || !Number.isInteger(meal.servings) || meal.servings < 1 || meal.servings > 12 || !/^\d{4}-\d{2}-\d{2}$/.test(meal.date)) {
    throw new Error('Choose a recipe, date, and between 1 and 12 servings.');
  }
  const current = data.meals.find(m => m.recipeId === meal.recipeId && m.date === meal.date && m.status === 'planned');
  return { ...data, meals: current ? data.meals.map(m => m.id === current.id ? { ...m, servings: meal.servings, portionFactor: meal.portionFactor ?? m.portionFactor } : m) : [...data.meals, meal] };
}
export function recordPurchases(data: AppData): AppData {
  const bought = shoppingList(data).filter(i => i.purchased);
  if (!bought.length) throw new Error('Check off the ingredients you bought first.');
  const pantry = data.pantry.map(p => ({ ...p }));
  for (const item of bought) {
    const existing = pantry.find(p => p.foodId === item.foodId && p.unit === item.unit);
    if (existing) existing.amount += item.amount;
    else {
      const { key, purchased, requiredAmount, purchase, ...ingredient } = item;
      void key; void purchased; void requiredAmount; void purchase;
      pantry.push({ ...ingredient, id: `purchase-${item.key}`, storage: item.aisle === 'Protein' || item.aisle === 'Dairy' || item.aisle === 'Produce' ? 'fridge' : 'cupboard' });
    }
  }
  return { ...data, pantry, purchasedKeys: [] };
}
/** Consume each pantry row once; require all ingredients before marking a meal cooked. */
export function cookMeal(data: AppData, mealId: string): AppData {
  const meal = data.meals.find(m => m.id === mealId);
  if (!meal || meal.status === 'cooked') return data;
  const pantry = data.pantry.map(p => ({ ...p }));
  for (const item of mealIngredients(meal)) {
    let remaining = item.amount;
    for (const stock of pantry.filter(p => p.foodId === item.foodId && p.unit === item.unit)) {
      const used = Math.min(stock.amount, remaining);
      stock.amount -= used; remaining -= used;
    }
    if (remaining > 0.0001) throw new Error(`Add ${item.label.toLowerCase()} to your pantry before marking this meal cooked.`);
  }
  return { ...data, pantry: pantry.filter(p => p.amount > 0.0001), meals: data.meals.map(m => m.id === mealId ? { ...m, status: 'cooked' } : m), purchasedKeys: [] };
}
export function planEstimate(data: AppData) {
  if (data.meals.some(m => findRecipe(m.recipeId)?.estimateMinor == null)) return null;
  return data.meals.reduce((sum, m) => { const r = findRecipe(m.recipeId); return sum + (r?.estimateMinor != null ? Math.round(r.estimateMinor * m.servings * (m.portionFactor ?? 1) / r.baseServings) : 0); }, 0);
}

/** Sunday-to-Saturday week (local dates) that contains `date`. */
export function weekBounds(date: string) {
  const start = new Date(`${date}T12:00:00`); start.setDate(start.getDate() - start.getDay());
  const end = new Date(start); end.setDate(end.getDate() + 6);
  return { start: localDate(start), end: localDate(end) };
}
function mealCostMinor(meal: Meal) {
  const r = findRecipe(meal.recipeId);
  return r?.estimateMinor != null ? Math.round(r.estimateMinor * meal.servings * (meal.portionFactor ?? 1) / r.baseServings) : 0;
}
/** Estimated cost of the meals planned (or cooked) in the week containing `date`, split by status. Recipes without an estimate count as zero. */
export function weekBudgetBreakdown(data: AppData, date: string) {
  const { start, end } = weekBounds(date);
  const meals = data.meals.filter(m => m.date >= start && m.date <= end);
  const sum = (status: Meal['status']) => meals.filter(m => m.status === status).reduce((total, m) => total + mealCostMinor(m), 0);
  return { spentMinor: sum('cooked'), plannedMinor: sum('planned') };
}
/** Estimated cost of every meal planned or cooked in the week containing `date`. */
export function weekSpendMinor(data: AppData, date: string) {
  const { spentMinor, plannedMinor } = weekBudgetBreakdown(data, date);
  return spentMinor + plannedMinor;
}

/** Splits a weekly budget into the amounts the budget widget shows. Over budget replaces remaining, never both. */
export function budgetBreakdown(spentMinor: number, plannedMinor: number, budgetMinor: number) {
  const total = spentMinor + plannedMinor;
  const remainingMinor = Math.max(0, budgetMinor - total);
  const overMinor = budgetMinor > 0 ? Math.max(0, total - budgetMinor) : 0;
  return { spentMinor, plannedMinor, remainingMinor, overMinor, totalMinor: spentMinor + plannedMinor + remainingMinor + overMinor };
}
