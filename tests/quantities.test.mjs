import test from 'node:test';
import assert from 'node:assert/strict';
import { initialData } from '../src/fixtures/initial-data.ts';
import { addMeal, cookMeal, mealIngredients, recordPurchases, shoppingList } from '../src/services/planning.ts';
import { GRAMS_PER_OUNCE, ML_PER_FL_OUNCE, ingredientQuantity, imperialQuantity, inputUnits, purchaseQuantity, toStoredQuantity } from '../src/services/quantities.ts';
import { parseData } from '../src/services/validation.ts';
const souvlaki = (id, servings, date = '2026-11-03') => ({ id, recipeId: 'chicken-souvlaki', date, servings, status: 'planned' });

test('3½ cucumbers become 4 to buy, while cooking still uses 3½', () => {
  let d = addMeal(initialData(), souvlaki('one', 7));
  const cucumber = shoppingList(d).find(i => i.foodId === 'cucumber');
  assert.equal(cucumber.requiredAmount, 3.5); assert.equal(cucumber.amount, 4);
  assert.equal(ingredientQuantity(cucumber, 'shopping'), '4 cucumbers');
  assert.equal(mealIngredients(d.meals[0]).find(i => i.foodId === 'cucumber').amount, 3.5);
  d.purchasedKeys = shoppingList(d).map(i => i.key); d = recordPurchases(d);
  assert.equal(shoppingList(d).length, 0);
  d = cookMeal(d, 'one');
  assert.equal(d.pantry.find(i => i.foodId === 'cucumber').amount, .5);
});

test('produce rounds once after aggregation and pantry subtraction', () => {
  let d = addMeal(addMeal(initialData(), souvlaki('one', 3)), souvlaki('two', 3, '2026-11-04'));
  assert.equal(shoppingList(d).find(i => i.foodId === 'cucumber').amount, 3);
  d.pantry.push({ id: 'half-cucumber', foodId: 'cucumber', label: 'Cucumber', amount: .5, unit: 'each', aisle: 'Produce', storage: 'fridge' });
  const item = shoppingList(d).find(i => i.foodId === 'cucumber');
  assert.equal(item.requiredAmount, 2.5); assert.equal(item.amount, 3);
});

test('chicken purchases always use whole medium breasts at about 6 oz each', () => {
  const chicken = { foodId: 'chicken', label: 'Chicken breast', aisle: 'Protein', amount: 6 * GRAMS_PER_OUNCE, unit: 'g' };
  assert.equal(ingredientQuantity({ ...chicken, ...purchaseQuantity(chicken) }, 'shopping'), '1 medium breast');
  assert.equal(ingredientQuantity({ ...chicken, ...purchaseQuantity({ ...chicken, amount: 12 * GRAMS_PER_OUNCE }) }, 'shopping'), '2 medium breasts');
  for (const ounces of [1, 4, 6, 8, 9, 10.5, 32]) {
    const need = { ...chicken, amount: ounces * GRAMS_PER_OUNCE };
    const buy = purchaseQuantity(need);
    assert(buy.amount >= need.amount - 1e-7);
    assert.equal(buy.purchase.size, 'Medium');
  }
});

test('legacy breast-size preferences cannot change shopping quantities', () => {
  const d = addMeal(initialData(), souvlaki('one', 2));
  const original = shoppingList(d).find(i => i.foodId === 'chicken');
  d.household.chickenBreastSize = 'Large';
  const legacy = parseData(JSON.stringify(d));
  assert.deepEqual(shoppingList(legacy).find(i => i.foodId === 'chicken'), original);
});

test('imperial conversion distinguishes weight from volume and preserves compatible storage', () => {
  assert.equal(imperialQuantity(28.349523125, 'g'), '1 oz');
  assert.equal(imperialQuantity(16 * GRAMS_PER_OUNCE, 'g'), '1 lb');
  assert.equal(imperialQuantity(18 * GRAMS_PER_OUNCE, 'g'), '1 lb 2 oz');
  assert.equal(imperialQuantity(ML_PER_FL_OUNCE / 6, 'ml'), '1 tsp');
  assert.equal(imperialQuantity(ML_PER_FL_OUNCE / 2, 'ml'), '1 tbsp');
  assert.equal(imperialQuantity(8 * ML_PER_FL_OUNCE, 'ml'), '1 cup');
  assert.equal(toStoredQuantity(2, 'breast').amount, 12 * GRAMS_PER_OUNCE);
  assert.equal(toStoredQuantity(1, 'cup').amount, 8 * ML_PER_FL_OUNCE);
  assert.deepEqual(inputUnits({ foodId: 'rice', unit: 'g' }), ['oz', 'lb']);
  assert.throws(() => toStoredQuantity(-1, 'oz'));
});

test('garlic is bought as whole bulbs, with surplus cloves left in the pantry', () => {
  const d = addMeal(initialData(), souvlaki('one', 4));
  const garlic = shoppingList(d).find(i => i.foodId === 'garlic');
  assert.equal(garlic.requiredAmount, 2); assert.equal(garlic.amount, 10);
  assert.equal(ingredientQuantity(garlic, 'shopping'), '1 bulb');
});

test('older saved metric kitchens remain readable', () => {
  const d = initialData(); assert.deepEqual(parseData(JSON.stringify(d)), d);
  d.household.chickenBreastSize = 'Small'; assert.deepEqual(parseData(JSON.stringify(d)), d);
});

test('shopping uses whole-ounce purchase amounts while recipes keep cooking fractions', () => {
  const rice = { foodId: 'rice', label: 'Rice', amount: 50, unit: 'g', aisle: 'Cupboard' };
  const bought = { ...rice, ...purchaseQuantity(rice) };
  assert.equal(ingredientQuantity(bought, 'shopping'), '2 oz');
  assert(bought.amount >= rice.amount);
  assert.equal(ingredientQuantity(rice), '1¾ oz');
  const sauce = { ...rice, foodId: 'sriracha', amount: 30, unit: 'ml' };
  const bottleAmount = { ...sauce, ...purchaseQuantity(sauce) };
  assert.equal(ingredientQuantity(bottleAmount, 'shopping'), '1 fl oz');
  assert(bottleAmount.amount >= sauce.amount);
});
