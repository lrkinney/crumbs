import test from 'node:test';
import assert from 'node:assert/strict';
import { initialData } from '../src/fixtures/initial-data.ts';
import { addMeal, cookMeal, householdPortionFactor, localDate, matchesDiet, mealIngredients, nextDays, recordPurchases, shoppingList } from '../src/services/planning.ts';
import { findRecipe, recipes } from '../src/fixtures/recipes.ts';
import { createRepository } from '../src/services/repository.ts';
import { parseData } from '../src/services/validation.ts';

const meal = (id, recipeId = 'honey-sriracha-chicken', servings = 2) => ({ id, recipeId, servings, date: '2026-10-19', status: 'planned' });
test('portions scale, shared ingredients combine, pantry subtracts once across meals', () => {
  const d = initialData();
  d.meals = [meal('one'), meal('two', 'chicken-souvlaki', 4)];
  const items = shoppingList(d);
  assert.equal(items.find(i => i.foodId === 'chicken').requiredAmount, 900);
  assert.equal(items.find(i => i.foodId === 'chicken').purchase.count, 6);
  assert.equal(items.find(i => i.foodId === 'rice').requiredAmount, 50);
  assert.equal(items.find(i => i.foodId === 'garlic').requiredAmount, 4);
  assert.equal(items.find(i => i.foodId === 'garlic').amount, 10);
  assert.equal(items.some(i => i.foodId === 'olive-oil'), false);
});
test('incompatible pantry units are never subtracted', () => {
  const d = initialData(); d.meals = [meal('one')];
  d.pantry = [{ ...d.pantry[0], amount: 1000, unit: 'ml' }];
  assert.equal(shoppingList(d).find(i => i.foodId === 'rice').requiredAmount, 150);
});
test('duplicate recipe on the same day updates the planned serving count', () => {
  const d = addMeal(initialData(), meal('one'));
  const next = addMeal(d, meal('two', 'honey-sriracha-chicken', 4));
  assert.equal(next.meals.length, 1); assert.equal(next.meals[0].servings, 4); assert.equal(next.meals[0].id, 'one');
});
test('changed shopping quantities invalidate old purchased checkmarks', () => {
  const d = addMeal(initialData(), meal('one'));
  d.purchasedKeys = shoppingList(d).map(i => i.key);
  const changed = addMeal(d, meal('two', 'honey-sriracha-chicken', 4));
  assert.equal(shoppingList(changed).find(i => i.foodId === 'rice').purchased, false);
});
test('only checked purchases move to pantry, and repeating the action cannot duplicate them', () => {
  const d = addMeal(initialData(), meal('one'));
  const rice = shoppingList(d).find(i => i.foodId === 'rice'); d.purchasedKeys = [rice.key];
  const next = recordPurchases(d);
  assert.equal(next.pantry.find(i => i.foodId === 'rice').amount, 100 + rice.amount);
  assert.equal(shoppingList(next).some(i => i.foodId === 'rice'), false);
  assert.equal(shoppingList(next).some(i => i.foodId === 'chicken'), true);
  assert.throws(() => recordPurchases(next));
});
test('cooking consumes pantry once and does not mutate the previous snapshot', () => {
  let d = addMeal(initialData(), meal('one')); d.purchasedKeys = shoppingList(d).map(i => i.key); d = recordPurchases(d);
  const before = JSON.stringify(d); const next = cookMeal(d, 'one');
  assert.equal(JSON.stringify(d), before); assert.equal(next.meals[0].status, 'cooked');
  assert.equal(shoppingList(next).length, 0); assert.deepEqual(cookMeal(next, 'one'), next);
});
test('insufficient pantry stock rejects cooking without partially consuming ingredients', () => {
  const d = addMeal(initialData(), meal('one')); const before = JSON.stringify(d);
  assert.throws(() => cookMeal(d, 'one'), /pantry/); assert.equal(JSON.stringify(d), before);
});
test('removing a meal rebuilds the shopping list without stale ingredients', () => {
  const d = addMeal(initialData(), meal('one')); assert.ok(shoppingList(d).length);
  assert.equal(shoppingList({ ...d, meals: [] }).length, 0);
});
test('invalid portions are rejected', () => {
  for (const count of [0, -1, 1.5, 13, Infinity, NaN]) assert.throws(() => addMeal(initialData(), meal('one', 'honey-sriracha-chicken', count)));
});
test('dates follow the local calendar and cross month boundaries', () => {
  const d = new Date(2026, 0, 31, 23, 55);
  assert.equal(localDate(d), '2026-01-31'); assert.equal(nextDays(2, d)[1].value, '2026-02-01');
});
test('storage validation rejects unsupported schemas, bad numbers, and duplicate ids', () => {
  assert.deepEqual(parseData(JSON.stringify(initialData())), initialData());
  for (const mutate of [d => { d.schemaVersion = 999; }, d => { d.household.size = -1; }, d => { d.pantry[0].amount = '100'; }, d => { d.pantry.push(d.pantry[0]); }, d => { d.savedRecipeIds = ['missing']; }]) {
    const d = initialData(); mutate(d); assert.throws(() => parseData(JSON.stringify(d)));
  }
});
test('repository does not silently overwrite corrupted or unsupported local data', async () => {
  let writes = 0;
  const repo = createRepository({ read: async () => '{bad-json', write: async () => { writes++; } });
  await assert.rejects(repo.load()); assert.equal(writes, 0);
});
test('save errors propagate so the UI can keep the previous state', async () => {
  const repo = createRepository({ read: async () => null, write: async () => { throw new Error('Disk full'); } });
  await assert.rejects(repo.save(initialData()), /Disk full/);
});
test('complete persisted journey: set up, add recipe, reload, purchase, cook', async () => {
  let raw = null; const repo = createRepository({ read: async () => raw, write: async next => { raw = next; } });
  let d = initialData(); d.onboardingComplete = true;
  await repo.save(d); d = await repo.load();
  d = addMeal(d, meal('one')); await repo.save(d); d = await repo.load();
  assert.equal(d.meals.length, 1);
  d.purchasedKeys = shoppingList(d).map(i => i.key); d = recordPurchases(d); await repo.save(d); d = await repo.load();
  assert.equal(shoppingList(d).length, 0);
  d = cookMeal(d, 'one'); await repo.save(d); d = await repo.load();
  assert.equal(d.meals[0].status, 'cooked'); assert.equal(shoppingList(d).length, 0);
});
test('portion preference scales a new meal while preserving existing standard plans', () => {
  const d = initialData();
  assert.equal(householdPortionFactor(d.household), 1);
  d.household.portionSize = 'Hearty';
  const factor = householdPortionFactor(d.household);
  assert.equal(factor, 1.25);
  const hearty = { ...meal('one'), portionFactor: factor };
  assert.equal(mealIngredients(hearty).find(i => i.foodId === 'chicken').amount, 375);
  const next = addMeal(addMeal(d, meal('one')), { ...meal('two'), portionFactor: factor });
  assert.equal(next.meals[0].portionFactor, factor);
  next.purchasedKeys = shoppingList(next).map(i => i.key);
  const purchased = recordPurchases(next);
  assert.equal(shoppingList(purchased).length, 0);
  assert.equal(cookMeal(purchased, 'one').meals[0].status, 'cooked');
});
test('dietary choices filter the curated fixture catalog consistently', () => {
  assert.equal(matchesDiet(findRecipe('honey-sriracha-chicken'), 'Vegetarian'), false);
  assert.equal(matchesDiet(findRecipe('tomato-lentil-ratatouille'), 'Vegan'), true);
  assert.equal(matchesDiet(findRecipe('chicken-souvlaki'), 'Pescatarian'), false);
  assert.equal(recipes.filter(r => matchesDiet(r, 'Any')).length, recipes.length);
});
test('new layout-related settings round trip while older saved snapshots remain compatible', () => {
  const legacy = initialData();
  assert.deepEqual(parseData(JSON.stringify(legacy)), legacy);
  const d = { ...legacy, planStart: '2026-10-26', household: { ...legacy.household, mealTarget: 5, dietaryPreference: 'Vegan', portionSize: 'Light' }, pantry: legacy.pantry.map(p => ({ ...p, useBy: '2026-10-30' })) };
  assert.deepEqual(parseData(JSON.stringify(d)), d);
  assert.throws(() => parseData(JSON.stringify({ ...d, planStart: '2026-02-30' })));
  assert.throws(() => parseData(JSON.stringify({ ...d, household: { ...d.household, mealTarget: 8 } })));
});
test('week spend sums estimated meal costs from Sunday to Saturday only', async () => {
  const { weekBounds, weekSpendMinor } = await import('../src/services/planning.ts');
  assert.deepEqual(weekBounds('2026-11-17'), { start: '2026-11-15', end: '2026-11-21' });
  const d = initialData();
  const r = findRecipe('honey-sriracha-chicken');
  d.meals = [
    { id: 'a', recipeId: r.id, servings: 2, date: '2026-11-16', status: 'planned' },
    { id: 'b', recipeId: r.id, servings: 4, date: '2026-11-21', status: 'cooked' },
    { id: 'c', recipeId: r.id, servings: 2, date: '2026-11-22', status: 'planned' },
  ];
  assert.equal(weekSpendMinor(d, '2026-11-17'), Math.round(r.estimateMinor * 2 / r.baseServings) + Math.round(r.estimateMinor * 4 / r.baseServings));
  assert.equal(weekSpendMinor({ ...d, meals: [] }, '2026-11-17'), 0);
});

test('home heading names today, tomorrow and yesterday, else the weekday', async () => {
  const { dayHeading } = await import('../src/services/planning.ts');
  assert.equal(dayHeading('2026-11-17', '2026-11-17'), 'Today, November 17');
  assert.equal(dayHeading('2026-11-18', '2026-11-17'), 'Tomorrow, November 18');
  assert.equal(dayHeading('2026-11-16', '2026-11-17'), 'Yesterday, November 16');
  assert.equal(dayHeading('2026-11-20', '2026-11-17'), 'Friday, November 20');
});

test('week budget breakdown splits cooked and planned meals', async () => {
  const { weekBudgetBreakdown } = await import('../src/services/planning.ts');
  const d = initialData();
  const r = findRecipe('honey-sriracha-chicken');
  d.meals = [
    { id: 'a', recipeId: r.id, servings: 2, date: '2026-11-16', status: 'planned' },
    { id: 'b', recipeId: r.id, servings: 4, date: '2026-11-17', status: 'cooked' },
  ];
  assert.deepEqual(weekBudgetBreakdown(d, '2026-11-17'), {
    spentMinor: Math.round(r.estimateMinor * 4 / r.baseServings), plannedMinor: Math.round(r.estimateMinor * 2 / r.baseServings) });
});

test('going over on one day shrinks the allowance of the days after it', async () => {
  const { distributeDailyBudget, weekChartBars } = await import('../src/services/planning.ts');
  const even = distributeDailyBudget([0, 0, 0, 0, 0, 0, 0], 7000);
  assert.deepEqual(even.map(d => d.allowanceMinor), Array(7).fill(1000));
  // Tuesday costs 1600: 600 over, and the four days after it share what is left (7000 - 1000 - 1000 - 1600) / 4.
  const over = distributeDailyBudget([500, 1000, 1600, 0, 0, 0, 0], 7000);
  assert.deepEqual(over.map(d => d.allowanceMinor), [1000, 1000, 1000, 850, 850, 850, 850]);
  assert.deepEqual(over.map(d => d.overMinor), [0, 0, 600, 0, 0, 0, 0]);
  // Spending less than the allowance does not raise later days.
  assert.deepEqual(distributeDailyBudget([0, 0, 0, 0, 0, 0, 0], 7000).map(d => d.allowanceMinor), Array(7).fill(1000));
  // Budget gone: later days have nothing, so anything planned is over.
  const gone = distributeDailyBudget([3500, 3500, 400, 0, 0, 0, 0], 7000);
  assert.deepEqual(gone.slice(2).map(d => d.allowanceMinor), [0, 0, 0, 0, 0]);
  assert.equal(gone[2].overMinor, 400);
  assert.deepEqual(distributeDailyBudget([100, 100], 0), [{ allowanceMinor: 0, overMinor: 0 }, { allowanceMinor: 0, overMinor: 0 }]);
  const bars = weekChartBars(over.map((d, i) => ({ date: String(i), allowanceMinor: d.allowanceMinor, overMinor: d.overMinor, spentMinor: [500, 1000, 1600, 0, 0, 0, 0][i], plannedMinor: 0 })), 200);
  assert.deepEqual(bars.map(b => b.track), [200, 200, 200, 170, 170, 170, 170]);
  assert.deepEqual(bars[2], { track: 200, spent: 200, planned: 0, over: true });
  assert.deepEqual(bars[0], { track: 200, spent: 100, planned: 0, over: false });
});
