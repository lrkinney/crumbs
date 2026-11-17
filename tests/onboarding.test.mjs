import test from 'node:test';
import assert from 'node:assert/strict';
import { initialData } from '../src/fixtures/initial-data.ts';
import { commitOnboarding, nextOnboardingStep, onboardingProgress } from '../src/services/onboarding.ts';
import { parseData } from '../src/services/validation.ts';
import { createRepository } from '../src/services/repository.ts';

test('the complete onboarding journey visits ingredients to avoid immediately before eating preferences', () => {
  const seen = []; let step = 'welcome';
  while (step !== 'review') { seen.push(step); step = nextOnboardingStep(step); assert(seen.length < 15); }
  assert.deepEqual(seen, ['welcome', 'profile', 'avoid', 'dietary', 'goals', 'pantry', 'budget', 'portions', 'household']);
  assert.deepEqual(seen.slice(1).map(onboardingProgress), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(nextOnboardingStep('targets'), 'goals');
  assert.equal(nextOnboardingStep('account'), 'invite');
  assert.equal(nextOnboardingStep('invite'), 'invitation');
  assert.equal(nextOnboardingStep('invitation'), 'review');
});

test('all restored onboarding choices and pantry amounts survive saving and reopening', async () => {
  let raw = null;
  const repository = createRepository({ read: async () => raw, write: async value => { raw = value; } });
  const before = initialData();
  const draft = {
    household: { ...before.household, avoidedIngredients: ['Milk', 'Soy', 'Mushrooms'], nutritionGoals: ['More variety'], nutritionTargets: { calories: 2200, protein: 90 }, accountEmailDraft: 'me@example.com', invitationEmailDraft: 'housemate@example.com' },
    pantry: [...before.pantry, { id: 'new-eggs', foodId: 'eggs', label: 'Eggs', amount: 6, unit: 'each', aisle: 'Protein', storage: 'fridge' }],
  };
  await repository.save(commitOnboarding(before, draft, true));
  const reopened = await repository.load();
  assert.deepEqual(reopened.household, draft.household);
  assert.deepEqual(reopened.pantry, draft.pantry);
  assert.equal(reopened.onboardingComplete, true);
  assert.equal(before.onboardingComplete, false);
  assert.equal(before.pantry.length, 3);
  assert(!raw.includes('password'));
});

test('editing a setup choice does not complete unfinished onboarding or lose existing meals', () => {
  const before = initialData();
  const edited = commitOnboarding(before, { household: { ...before.household, avoidedIngredients: ['Milk'] }, pantry: before.pantry }, false);
  assert.equal(edited.onboardingComplete, false);
  const completed = { ...before, onboardingComplete: true };
  assert.equal(commitOnboarding(completed, { household: completed.household, pantry: completed.pantry }, false).onboardingComplete, true);
  assert.deepEqual(edited.meals, before.meals);
  assert.deepEqual(parseData(JSON.stringify(before)), before);
});

test('invalid persisted onboarding selections cannot silently reopen', () => {
  for (const patch of [{ avoidedIngredients: [''] }, { nutritionGoals: ['Unknown'] }, { nutritionTargets: { protein: -1 } }, { nutritionTargets: { calories: '2200' } }, { invitationEmailDraft: 'invalid' }]) {
    const data = initialData(); Object.assign(data.household, patch);
    assert.throws(() => parseData(JSON.stringify(data)));
  }
});
