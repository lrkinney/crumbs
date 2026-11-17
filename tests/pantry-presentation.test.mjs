import test from 'node:test';
import assert from 'node:assert/strict';
import { groupPantryItems } from '../src/services/pantry-presentation.ts';
import { initialData } from '../src/fixtures/initial-data.ts';

test('pantry categories follow ingredient categories independently of storage', () => {
  const items = initialData().pantry;
  const original = structuredClone(items);
  const groups = groupPantryItems(items);
  assert.deepEqual(groups.map(g => g.category), ['Condiments', 'Produce', 'Grains & Bread']);
  assert.equal(groups.find(g => g.category === 'Produce').foods[0].foodId, 'garlic');
  assert.equal(groups.find(g => g.category === 'Grains & Bread').foods[0].foodId, 'rice');
  assert.deepEqual(items, original);
  assert.deepEqual(groups.flatMap(g => g.foods).map(i => i.id).sort(), items.map(i => i.id).sort());
});
test('empty and new food categories preserve every row and amount', () => {
  assert.deepEqual(groupPantryItems([]), []);
  const items = [
    { id: 'a', foodId: 'new-food', label: 'New food', amount: 5, unit: 'g', aisle: 'Frozen', storage: 'freezer' },
    { id: 'b', foodId: 'another-food', label: 'Another food', amount: 2, unit: 'each', aisle: '', storage: 'cupboard' },
  ];
  const groups = groupPantryItems(items);
  assert.deepEqual(groups.map(g => g.category), ['Frozen', 'Other']);
  assert.equal(groups[0].foods[0].amount, 5);
  assert.equal(groups[1].foods[0].amount, 2);
});
