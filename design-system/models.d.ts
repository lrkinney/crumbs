/** Application-domain examples. These are not global Figma/design-token variables. */
export type ID = string;
export type CanonicalUnit = 'g' | 'ml' | 'each';
export interface Quantity { amount: number; unit: CanonicalUnit }
export interface Money { amountMinor: number; currency: string }
export interface HouseholdMember {
  id: ID;
  displayName: string;
  allergies: string[];
  dietaryPatterns: string[];
  dislikes: string[];
  portionFactor: number;
  nutritionTargets?: { energyKcal?: number; proteinG?: number };
}
export interface RecipeIngredient {
  foodId: ID;
  label: string;
  quantity: Quantity;
  importance: 'required' | 'optional';
  allergens: string[];
  needsLabelReview: boolean;
}
export interface Recipe {
  id: ID;
  title: string;
  imageAsset: string;
  baseServings: number;
  ingredients: RecipeIngredient[];
  steps: Array<{ id: ID; instruction: string; durationMinutes?: number }>;
  tools: string[];
  prepMinutes: number;
  cookMinutes: number;
  cuisines: string[];
  estimatedCost?: { amount: Money; source: string; observedAt: string };
}
export interface PlannedMeal {
  id: ID;
  recipeId: ID;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  servings: number;
  status: 'planned' | 'cooked' | 'skipped';
  substitutions: Array<{ originalFoodId: ID; replacementFoodId: ID }>;
}
export interface PantryItem {
  id: ID;
  foodId: ID;
  quantity: Quantity;
  storage: 'fridge' | 'freezer' | 'cupboard';
  addedAt: string;
  useBy?: string;
}
export interface ShoppingItem {
  id: ID;
  foodId: ID;
  quantity: Quantity;
  aisle?: string;
  purchased: boolean;
  sourceMealIds: ID[];
}
export interface WeeklyPlan {
  id: ID;
  householdId: ID;
  weekStart: string;
  budget?: Money;
  meals: PlannedMeal[];
  version: number;
}
export interface RecipeQuery {
  householdMemberIds: ID[];
  search?: string;
  maxTotalMinutes?: number;
  cuisines?: string[];
  prioritizeFoodIds?: ID[];
}
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'empty' }
  | { status: 'error'; message: string; retry?: () => void };

/** Implement these services outside the component library. */
export interface CrumbsServices {
  findRecipes(query: RecipeQuery): Promise<Recipe[]>;
  savePlan(plan: WeeklyPlan, expectedVersion: number): Promise<WeeklyPlan>;
  buildShoppingList(planId: ID): Promise<ShoppingItem[]>;
  reviewScan(file: Blob): Promise<Array<{ label: string; confidence: number; quantity?: Quantity }>>;
  recordPurchases(items: ShoppingItem[]): Promise<PantryItem[]>;
  markCooked(mealId: ID, confirmedUsage: Array<{ pantryItemId: ID; quantity: Quantity }>): Promise<void>;
}

// Business rules to implement and test in the app:
// - Combine compatible ingredient units after scaling to planned servings.
// - Subtract pantry stock once, not once per meal. Never subtract incompatible units.
// - Apply each included household member's dietary needs before preference ranking.
// - Review substitution allergen data and product labels; a UI chip is not verification.
// - Update purchased/cooked state only after successful persistence.
// - Use versioned writes for shared plans and lists; preserve edits during conflicts.
// - Keep estimates and their provenance separate from verified store prices.

/** Local Expo onboarding draft. Account/invitation emails are drafts, not authentication or sent invitations. */
export interface OnboardingPreferences {
  name: string;
  size: number;
  budgetMinor: number;
  dietaryPreference: 'Any' | 'Vegetarian' | 'Vegan' | 'Pescatarian';
  portionSize?: 'Light' | 'Standard' | 'Hearty';
  avoidedIngredients?: string[];
  nutritionGoals?: string[];
  nutritionTargets?: { calories?: number; protein?: number };
  accountEmailDraft?: string;
  invitationEmailDraft?: string;
}

/** Purchase rounding is applied to the final shortage, not to recipe consumption. */
export interface PurchaseQuantity {
  requiredAmount: number;
  purchaseAmount: number;
  canonicalUnit: CanonicalUnit;
  kind?: 'breast' | 'garlic';
  count?: number;
  breastSize?: 'Medium';
}
