import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validate } from './validate-recipes.mjs';
const base = new URL('../data/', import.meta.url);
const schema = JSON.parse(fs.readFileSync(new URL('recipes.schema.json', base)));
const target = new URL('recipes.json', base);
export function validateLibrary(data) {
  validate(data, schema);
  const ids = new Set();
  const units = new Map();
  for (const r of data) {
    if (ids.has(r.id)) throw new Error(`Duplicate recipe ID: ${r.id}`);
    ids.add(r.id);
    const lines = new Set(r.ingredients.map(i => i.id));
    if (lines.size !== r.ingredients.length) throw new Error(`${r.id}: duplicate ingredient IDs`);
    const steps = new Set(r.instructionDetails.map(s => s.id));
    if (steps.size !== r.instructionDetails.length) throw new Error(`${r.id}: duplicate step IDs`);
    for (const s of r.instructionDetails) for (const id of s.ingredientIds) if (!lines.has(id)) throw new Error(`${r.id}: unknown ingredient reference ${id}`);
    for (const i of r.ingredients) {
      if (units.has(i.foodId) && units.get(i.foodId) !== i.unit) throw new Error(`${r.id}: incompatible units for ${i.foodId}`);
      units.set(i.foodId, i.unit);
      for (const servings of [0.5, 1, 2, 4, 6]) if (!Number.isFinite(i.amount * servings / r.baseServings)) throw new Error(`${r.id}: invalid scaling`);
    }
    if (r.source.kind === 'adapted-web-recipe') {
      if (new URL(r.source.url).protocol !== 'https:') throw new Error(`${r.id}: source URL must be HTTPS`);
      if (!r.extensions.author || !r.extensions.adaptationNotes || !r.equipment.length) throw new Error(`${r.id}: incomplete provenance or equipment`);
      if (!r.extensions.completeDinner || r.extensions.requiresCookedLeftovers || r.extensions.requiredAdvanceMarinationMinutes !== 0) throw new Error(`${r.id}: does not meet dinner criteria`);
      if (r.baseServings !== 2 || r.timing.prepMinutes > 20 || r.timing.totalMinutes > 45) throw new Error(`${r.id}: outside selected portion/time limits`);
      if (r.timing.totalMinutes < Math.max(r.timing.prepMinutes, r.timing.cookMinutes)) throw new Error(`${r.id}: inconsistent timing`);
      if (r.nutrition.calories !== null && [r.nutrition.proteinG,r.nutrition.carbohydrateG,r.nutrition.fatG].some(n => n === null)) throw new Error(`${r.id}: incomplete reported nutrition`);
    }
  }
  return data;
}
export function mergeRecipes(existing, incoming) {
  validateLibrary(existing); validateLibrary(incoming);
  const result = structuredClone(existing);
  for (const recipe of incoming) {
    const match = result.find(r => r.id === recipe.id);
    if (match && JSON.stringify(match) !== JSON.stringify(recipe)) throw new Error(`Conflicting recipe ID: ${recipe.id}; no files written`);
    if (!match) result.push(recipe);
  }
  return validateLibrary(result);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const existing = JSON.parse(fs.readFileSync(target));
  if (process.argv[2]) {
    const incoming = JSON.parse(fs.readFileSync(process.argv[2]));
    const merged = mergeRecipes(existing, incoming);
    if (merged.length !== existing.length) {
      const backup = new URL(`recipes.before-import-${Date.now()}.json`,base);
      fs.copyFileSync(target,backup);
      const temp = new URL('recipes.json.tmp',base);
      fs.writeFileSync(temp, JSON.stringify(merged,null,2)+'\n');
      fs.renameSync(temp,target);
    }
    console.log(`Imported ${merged.length-existing.length}; library contains ${merged.length} recipes.`);
  } else console.log(`Validated ${validateLibrary(existing).length} library recipes.`);
}
