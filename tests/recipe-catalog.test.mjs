import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateCatalog } from '../scripts/validate-recipes.mjs';
const read = () => JSON.parse(fs.readFileSync(new URL('../src/data/recipes.json', import.meta.url)));
test('catalog validates and preserves original yield quantities', () => {
 const data = validateCatalog(read());
 assert.equal(data.length,5);
 assert.equal(data[0].ingredients[0].amount / data[0].baseServings * 3,450);
 assert.equal(data[0].nutrition.proteinG,null);
});
test('rejects malformed imports before use', () => {
 for(const mutate of [d=>d[0].baseServings=0,d=>d[0].ingredients[0].unit='cups',d=>d.push(d[0]),d=>d[0].instructionDetails[0].ingredientIds=['missing'],d=>d[0].nutrition.calories=-1]) {
  const data=read();mutate(data);assert.throws(()=>validateCatalog(data));
 }
});
