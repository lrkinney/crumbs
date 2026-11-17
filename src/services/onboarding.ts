import type { AppData, Household, PantryItem } from '../models/domain.ts';

export const onboardingSteps = ['profile', 'avoid', 'dietary', 'goals', 'pantry', 'budget', 'portions', 'household'] as const;
export type OnboardingStep = 'welcome' | typeof onboardingSteps[number] | 'targets' | 'account' | 'invite' | 'invitation' | 'review';
export const avoidanceGroups = [
  { title: 'Dairy & eggs', items: [['Milk', 'Milk and dairy'], ['Eggs', 'Egg ingredients']] },
  { title: 'Nuts & legumes', items: [['Peanuts', 'Peanut ingredients'], ['Tree nuts', 'Almonds, walnuts and other nuts'], ['Soy', 'Soy ingredients']] },
  { title: 'Grains & seafood', items: [['Wheat', 'Wheat and gluten preference'], ['Fish and shellfish', 'Fish, shrimp and other seafood']] },
] as const;
export const nutritionGoals = [['Balanced meals', 'A mix of foods through the week'], ['Higher protein', 'Prioritize protein in your meals'], ['More vegetables', 'Make room for more plant foods'], ['More variety', 'Explore different foods and cuisines']] as const;
export const pantryStarters: PantryItem[] = [
  { id: 'onboarding-rice', foodId: 'rice', label: 'Rice', amount: 100, unit: 'g', aisle: 'Cupboard', storage: 'cupboard' },
  { id: 'onboarding-eggs', foodId: 'eggs', label: 'Eggs', amount: 6, unit: 'each', aisle: 'Protein', storage: 'fridge' },
  { id: 'onboarding-chicken', foodId: 'chicken', label: 'Chicken breast', amount: 300, unit: 'g', aisle: 'Protein', storage: 'fridge' },
  { id: 'onboarding-spinach', foodId: 'spinach', label: 'Spinach', amount: 100, unit: 'g', aisle: 'Produce', storage: 'fridge' },
];
export interface OnboardingDraft {
  household: Household;
  pantry: PantryItem[];
}
export function nextOnboardingStep(step: OnboardingStep): OnboardingStep {
  if (step === 'welcome') return 'profile';
  if (step === 'targets') return 'goals';
  if (step === 'account') return 'invite';
  if (step === 'invite') return 'invitation';
  if (step === 'invitation' || step === 'household') return 'review';
  const index = onboardingSteps.indexOf(step as typeof onboardingSteps[number]);
  return onboardingSteps[index + 1] ?? 'review';
}
export function onboardingProgress(step: OnboardingStep) {
  if (step === 'welcome') return 0;
  if (step === 'targets') return 4;
  const index = onboardingSteps.indexOf(step as typeof onboardingSteps[number]);
  return index < 0 ? 8 : index + 1;
}
export function commitOnboarding(data: AppData, draft: OnboardingDraft, complete: boolean): AppData {
  return { ...data, onboardingComplete: complete || data.onboardingComplete, household: { ...draft.household }, pantry: draft.pantry.map(item => ({ ...item })) };
}
