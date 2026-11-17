import type { AppData } from '../models/domain.ts';
import { findRecipe } from '../fixtures/recipes.ts';

type RecordValue = Record<string, unknown>;
const object = (v: unknown): v is RecordValue => !!v && typeof v === 'object' && !Array.isArray(v);
const positive = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v > 0;
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(s => typeof s === 'string');
const unique = (items: RecordValue[]) => new Set(items.map(i => i.id)).size === items.length;
const date = (v: unknown) => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const parsed = new Date(`${v}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v;
};

export function parseData(raw: string): AppData {
  const d: unknown = JSON.parse(raw);
  if (!object(d) || d.schemaVersion !== 1 || typeof d.onboardingComplete !== 'boolean' || !object(d.household)) throw new Error('Unsupported or damaged local data.');
  const h = d.household;
  if (typeof h.name !== 'string' || !h.name.trim() || h.name.length > 60 || !Number.isInteger(h.size) || !positive(h.size) || Number(h.size) > 12 || !Number.isInteger(h.budgetMinor) || !positive(h.budgetMinor) || !['Any', 'Vegetarian', 'Vegan', 'Pescatarian'].includes(String(h.dietaryPreference))) throw new Error('Invalid household data.');
  if (h.avoidedIngredients !== undefined && (!strings(h.avoidedIngredients) || h.avoidedIngredients.some(s => !s.trim() || s.length > 100))) throw new Error('Invalid ingredients to avoid.');
  if (h.nutritionGoals !== undefined && (!strings(h.nutritionGoals) || h.nutritionGoals.some(s => !['Balanced meals', 'Higher protein', 'More vegetables', 'More variety'].includes(s)))) throw new Error('Invalid nutrition goals.');
  if (h.nutritionTargets !== undefined && (!object(h.nutritionTargets) || Object.entries(h.nutritionTargets).some(([key, value]) => !['calories', 'protein'].includes(key) || !positive(value)))) throw new Error('Invalid nutrition targets.');
  for (const key of ['accountEmailDraft', 'invitationEmailDraft']) if (h[key] !== undefined && (typeof h[key] !== 'string' || h[key].length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(h[key]))) throw new Error('Invalid email draft.');
  if (h.portionSize !== undefined && !['Light', 'Standard', 'Hearty'].includes(String(h.portionSize))) throw new Error('Invalid portion size.');
  if (h.mealTarget !== undefined && (!Number.isInteger(h.mealTarget) || Number(h.mealTarget) < 1 || Number(h.mealTarget) > 7)) throw new Error('Invalid meal target.');
  if (d.planStart !== undefined && !date(d.planStart)) throw new Error('Invalid plan start date.');
  if (!Array.isArray(d.meals) || !d.meals.every(m => object(m) && typeof m.id === 'string' && typeof m.recipeId === 'string' && findRecipe(m.recipeId) && typeof m.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(m.date) && Number.isInteger(m.servings) && positive(m.servings) && Number(m.servings) <= 12 && ['planned', 'cooked'].includes(String(m.status))) || !unique(d.meals)) throw new Error('Invalid meal data.');
  if (!Array.isArray(d.pantry) || !d.pantry.every(p => object(p) && typeof p.id === 'string' && typeof p.foodId === 'string' && typeof p.label === 'string' && typeof p.aisle === 'string' && positive(p.amount) && ['g', 'ml', 'each'].includes(String(p.unit)) && ['fridge', 'freezer', 'cupboard'].includes(String(p.storage))) || !unique(d.pantry)) throw new Error('Invalid pantry data.');
  if (d.meals.some(m => !date(m.date) || m.portionFactor !== undefined && ![.75, 1, 1.25].includes(m.portionFactor))) throw new Error('Invalid meal date or portion factor.');
  if (d.pantry.some(p => p.useBy !== undefined && !date(p.useBy))) throw new Error('Invalid use-by date.');
  if (!strings(d.purchasedKeys) || !strings(d.savedRecipeIds) || !d.savedRecipeIds.every(id => findRecipe(id))) throw new Error('Invalid saved selections.');
  return d as unknown as AppData;
}
