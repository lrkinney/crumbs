import test from 'node:test';
import assert from 'node:assert/strict';
import { pantrySuggestions, addSuggestedPantryItems } from '../src/services/pantry-suggestions.ts';
import { ingredientCatalog } from '../src/fixtures/recipes.ts';
import { initialData } from '../src/fixtures/initial-data.ts';
import { GRAMS_PER_OUNCE } from '../src/services/quantities.ts';
import { parseData } from '../src/services/validation.ts';

test('suggestions cover recipe ingredients with usable purchase quantities, sorted by frequency', () => {
  assert(ingredientCatalog.every(i => pantrySuggestions.some(s => s.foodId === i.foodId && s.unit === i.unit)));
  assert.equal(new Set(pantrySuggestions.map(i => i.foodId)).size, pantrySuggestions.length);
  assert.equal(pantrySuggestions[0].foodId, 'garlic');
  assert(pantrySuggestions.every((item, i) => item.amount > 0 && item.suggestedLabel && (!i || pantrySuggestions[i - 1].recipeCount >= item.recipeCount)));
  assert.equal(pantrySuggestions.find(i => i.foodId === 'chicken').amount, 12 * GRAMS_PER_OUNCE);
  assert.equal(pantrySuggestions.find(i => i.foodId === 'garlic').amount, 10);
  assert.equal(pantrySuggestions.find(i => i.foodId === 'rice').amount, 16 * GRAMS_PER_OUNCE);
  assert(pantrySuggestions.filter(i => i.unit === 'each').every(i => Number.isInteger(i.amount)));
});

test('batch add preserves existing quantities and dates and ignores duplicate and unknown selections', () => {
  const data = initialData();
  data.pantry = [{ ...pantrySuggestions.find(i => i.foodId === 'rice'), id: 'existing', amount: 50, useBy: '2027-01-01' }];
  const next = addSuggestedPantryItems(data, ['rice', 'chicken', 'chicken', 'garlic', 'unknown'], 'test');
  assert.equal(next.pantry.length, 3);
  assert.deepEqual(next.pantry[0], data.pantry[0]);
  assert.equal(data.pantry.length, 1);
  assert.equal(new Set(next.pantry.map(i => i.id)).size, next.pantry.length);
  assert.equal(next.pantry.find(i => i.foodId === 'chicken').storage, 'fridge');
  assert.equal(next.pantry.find(i => i.foodId === 'garlic').storage, 'cupboard');
  assert.equal(next.pantry.find(i => i.foodId === 'chicken').useBy, undefined);
  assert.deepEqual(addSuggestedPantryItems(next, ['chicken', 'garlic'], 'again'), next);
  assert(parseData(JSON.stringify(next)));
});

test('all suggestions can be saved together and edited individually in existing pantry format', () => {
  const data = initialData(); data.pantry = [];
  const next = addSuggestedPantryItems(data, pantrySuggestions.map(i => i.foodId), 'all');
  assert.equal(next.pantry.length, pantrySuggestions.length);
  assert(parseData(JSON.stringify(next)));
  assert(next.pantry.every(i => !('suggestedLabel' in i) && !('recipeCount' in i)));
  assert.deepEqual(addSuggestedPantryItems(data, []), data);
});
