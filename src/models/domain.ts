export type Unit = 'g' | 'ml' | 'each';
export interface Ingredient { foodId: string; label: string; amount: number; unit: Unit; aisle: string; preparation?: string | null }
export interface Recipe {
  id: string; title: string; description: string; image: 'chicken' | 'souvlaki' | 'ratatouille' | 'tofu' | 'toasts' | null;
  baseServings: number; minutes: number; estimateMinor: number | null; tags: string[]; ingredients: Ingredient[]; steps: string[];
  nutrition: { calories: number | null; proteinG: number | null; carbohydrateG: number | null; fatG: number | null };
  scalingNotes: string[]; source: { url: string | null; notes: string };
}
export interface Meal { id: string; recipeId: string; date: string; servings: number; status: 'planned' | 'cooked'; portionFactor?: number }
export interface PantryItem extends Ingredient { id: string; storage: 'fridge' | 'freezer' | 'cupboard'; useBy?: string }
export interface Household { name: string; size: number; budgetMinor: number; dietaryPreference: 'Any' | 'Vegetarian' | 'Vegan' | 'Pescatarian'; mealTarget?: number; portionSize?: 'Light' | 'Standard' | 'Hearty'; avoidedIngredients?: string[]; nutritionGoals?: string[]; nutritionTargets?: { calories?: number; protein?: number }; accountEmailDraft?: string; invitationEmailDraft?: string }
export interface AppData {
  schemaVersion: 1; onboardingComplete: boolean; household: Household;
  planStart?: string;
  meals: Meal[]; pantry: PantryItem[]; purchasedKeys: string[]; savedRecipeIds: string[];
}
export interface ShoppingItem extends Ingredient { key: string; purchased: boolean; requiredAmount?: number; purchase?: { kind: 'breast' | 'garlic'; count: number; size?: 'Medium' } }
export type Change = (data: AppData) => AppData;
