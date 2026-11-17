import type { Ingredient, ShoppingItem, Unit } from '../models/domain.ts';

// U.S. customary units. Storage stays in g/ml/each so existing kitchens remain compatible.
export const GRAMS_PER_OUNCE = 28.349523125;
export const ML_PER_FL_OUNCE = 29.5735295625;
export const MEDIUM_BREAST_OZ = 6;
export type InputUnit = 'each' | 'breast' | 'oz' | 'lb' | 'fl oz' | 'cup' | 'tbsp' | 'tsp';
const fractions = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'];
export function fraction(value: number) {
  const eighths = Math.round(value * 8);
  if (value > 0 && eighths === 0) return '<⅛';
  const whole = Math.floor(eighths / 8); const part = eighths % 8;
  return `${whole || !part ? whole : ''}${fractions[part]}`;
}
export function imperialQuantity(amount: number, unit: Unit, context: 'recipe' | 'shopping' | 'pantry' = 'recipe') {
  if (unit === 'each') return fraction(amount);
  if (unit === 'g') {
    const ounces = amount / GRAMS_PER_OUNCE;
    const rounded = Math.round(ounces * 8) / 8;
    const pounds = Math.floor(rounded / 16);
    const remainder = rounded - pounds * 16;
    return pounds ? `${pounds} lb${remainder ? ` ${fraction(remainder)} oz` : ''}` : `${fraction(ounces)} oz`;
  }
  const flOz = amount / ML_PER_FL_OUNCE;
  if (context === 'shopping' || context === 'pantry') return flOz >= 8 ? `${fraction(flOz / 8)} ${Math.round(flOz) <= 8 ? 'cup' : 'cups'}` : `${fraction(flOz)} fl oz`;
  if (flOz >= 2) return `${fraction(flOz / 8)} ${Math.round(flOz / 8 * 8) <= 8 ? 'cup' : 'cups'}`;
  if (flOz >= .5) return `${fraction(flOz * 2)} tbsp`;
  return `${fraction(flOz * 6)} tsp`;
}
const counts: Record<string, [string, string]> = {
  cucumber: ['cucumber', 'cucumbers'], lemon: ['lemon', 'lemons'], lime: ['lime', 'limes'],
  zucchini: ['zucchini', 'zucchini'], eggplant: ['eggplant', 'eggplants'], eggs: ['egg', 'eggs'],
  pita: ['pita', 'pitas'], bread: ['slice', 'slices'], garlic: ['clove', 'cloves'],
};
export function ingredientQuantity(item: Ingredient, context: 'recipe' | 'shopping' | 'pantry' = 'recipe') {
  const purchase = 'purchase' in item ? (item as ShoppingItem).purchase : undefined;
  if (context === 'shopping' && purchase?.kind === 'breast') return `${purchase.count} medium ${purchase.count === 1 ? 'breast' : 'breasts'}`;
  if (context === 'shopping' && purchase?.kind === 'garlic') return `${purchase.count} ${purchase.count === 1 ? 'bulb' : 'bulbs'}`;
  if (item.unit === 'each') {
    const noun = counts[item.foodId] ?? ['item', 'items'];
    return `${fraction(item.amount)} ${item.amount <= 1 ? noun[0] : noun[1]}`;
  }
  return imperialQuantity(item.amount, item.unit, context);
}
export function purchaseDetail(item: ShoppingItem) {
  if (item.purchase?.kind === 'breast') return `About ${imperialQuantity(item.amount, item.unit)} total · ${MEDIUM_BREAST_OZ} oz per breast`;
  if (item.purchase?.kind === 'garlic') return `About ${item.purchase.count * 10} cloves total`;
  return undefined;
}
/** Round only the combined shortage, after pantry subtraction. Never round recipe consumption. */
export function purchaseQuantity(item: Ingredient): Pick<ShoppingItem, 'amount' | 'purchase'> {
  if (item.foodId === 'chicken' && item.unit === 'g') {
    // Legacy weights were rounded to whole grams (227 g ≈ 8 oz). Allow half a gram at a size boundary.
    const perBreast = MEDIUM_BREAST_OZ * GRAMS_PER_OUNCE;
    const count = Math.max(1, Math.ceil((item.amount - .5) / perBreast));
    return { amount: Math.max(item.amount, count * perBreast), purchase: { kind: 'breast', count, size: 'Medium' } };
  }
  if (item.foodId === 'garlic' && item.unit === 'each') {
    const count = Math.ceil(item.amount / 10 - 1e-9);
    return { amount: count * 10, purchase: { kind: 'garlic', count } };
  }
  if (item.unit === 'each') return { amount: Math.ceil(item.amount - 1e-9) };
  const increment = item.unit === 'g' ? GRAMS_PER_OUNCE : ML_PER_FL_OUNCE;
  const count = Math.max(1, Math.ceil((item.amount - .5) / increment));
  return { amount: Math.max(item.amount, count * increment) };
}
export function inputUnits(item?: Pick<Ingredient, 'foodId' | 'unit'>): InputUnit[] {
  if (!item) return ['each', 'oz', 'lb', 'fl oz', 'cup', 'tbsp', 'tsp'];
  if (item.foodId === 'chicken') return ['breast', 'oz', 'lb'];
  return item.unit === 'g' ? ['oz', 'lb'] : item.unit === 'ml' ? ['fl oz', 'cup', 'tbsp', 'tsp'] : ['each'];
}
export function toStoredQuantity(amount: number, unit: InputUnit): { amount: number; unit: Unit } {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter a positive amount.');
  if (unit === 'each') return { amount, unit: 'each' };
  if (unit === 'breast') return { amount: amount * MEDIUM_BREAST_OZ * GRAMS_PER_OUNCE, unit: 'g' };
  if (unit === 'oz' || unit === 'lb') return { amount: amount * GRAMS_PER_OUNCE * (unit === 'lb' ? 16 : 1), unit: 'g' };
  const flOz = unit === 'cup' ? 8 : unit === 'tbsp' ? .5 : unit === 'tsp' ? 1 / 6 : 1;
  return { amount: amount * ML_PER_FL_OUNCE * flOz, unit: 'ml' };
}
export function toInputQuantity(item: Ingredient): { amount: string; unit: InputUnit } {
  if (item.unit === 'each') return { amount: String(item.amount), unit: 'each' };
  const value = item.unit === 'g' ? item.amount / GRAMS_PER_OUNCE : item.amount / ML_PER_FL_OUNCE;
  return { amount: String(Number(value.toFixed(2))), unit: item.unit === 'g' ? 'oz' : 'fl oz' };
}
