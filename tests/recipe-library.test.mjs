import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateLibrary, mergeRecipes } from '../scripts/recipe-library.mjs';
const read = name => JSON.parse(fs.readFileSync(new URL(`../data/${name}`,import.meta.url)));
test('32-recipe library includes precisely 27 sourced additions', () => {
 const library=validateLibrary(read('recipes.json'));
 const batch=read('imports/2026-11-17-dinners.json');
 assert.equal(library.length,32);assert.equal(batch.length,27);
 for(const recipe of batch) assert.deepEqual(library.find(r=>r.id===recipe.id),recipe);
 assert.equal(new Set(batch.map(r=>r.source.url)).size,27);
 assert.ok(batch.every(r=>r.image===null && Number.isInteger(r.estimateMinor) && r.cost.region==="Boston, MA"));
});
test('reimport is idempotent and conflicting edits fail without mutating input', () => {
 const library=read('recipes.json'), batch=read('imports/2026-11-17-dinners.json');
 assert.deepEqual(mergeRecipes(library,batch),library);
 const before=structuredClone(library);batch[0].title='Conflicting title';
 assert.throws(()=>mergeRecipes(library,batch),/Conflicting/);assert.deepEqual(library,before);
});
test('invalid quantities, references, units and duplicate steps are rejected', () => {
 for(const mutate of [d=>d[5].baseServings=0,d=>d[5].ingredients[0].amount=-1,d=>d[5].instructionDetails[0].ingredientIds=['missing'],d=>d[5].instructionDetails.push(d[5].instructionDetails[0]),d=>d[5].ingredients.find(i=>i.foodId==='garlic').unit='g',d=>d[5].extensions.requiresCookedLeftovers=true]) {
  const d=read('recipes.json');mutate(d);assert.throws(()=>validateLibrary(d));
 }
});
test('one and four servings preserve ingredient ratios and fractional eggs', () => {
 const batch=read('imports/2026-11-17-dinners.json');
 for(const r of batch) for(const i of r.ingredients) {
  assert.equal(i.amount / r.baseServings * 4,i.amount*2);
  assert.equal(i.amount / r.baseServings,i.amount/2);
 }
 const pad=batch.find(r=>r.id.startsWith('prawn-pad-thai'));
 assert.equal(pad.ingredients.find(i=>i.foodId==='eggs').amount/pad.baseServings,0.5);
 assert.ok(pad.scalingNotes.some(n=>n.includes('weigh')));
});
