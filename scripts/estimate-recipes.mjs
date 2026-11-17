// Estimates per-serving nutrition and base-recipe cost for every recipe from scripts/estimates-table.mjs.
// Usage: node scripts/estimate-recipes.mjs [--write]   (without --write it only prints a report)
import fs from 'node:fs';
import { estimates } from './estimates-table.mjs';

const files = ['../data/recipes.json', '../data/imports/2026-11-17-dinners.json'].map(p => new URL(p, import.meta.url));
const AS_OF = '2026-11-17';
const nutritionSource = 'Estimated from generic per-ingredient values (USDA-style averages) for the full dinner including sides; not a lab or label calculation.';
const costSource = 'Estimated from typical shelf prices, taking the cheapest of Star Market, Stop & Shop, Market Basket, ALDI, Target and Walmart in the Boston, MA area for each ingredient, charged in proportion to the amount used. Not live quotes.';

export function estimate(recipe) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 }; let usd = 0;
  for (const i of recipe.ingredients) {
    const e = estimates[i.foodId];
    if (!e) throw new Error(`No estimate for ${i.foodId}`);
    const [kcal, p, c, f, price, pack] = e;
    const factor = i.unit === 'each' ? i.amount : i.amount / 100;
    t.kcal += kcal * factor; t.p += p * factor; t.c += c * factor; t.f += f * factor;
    usd += price * i.amount / pack;
  }
  const n = recipe.baseServings;
  return {
    nutrition: { basis: 'per-serving', calories: Math.round(t.kcal / n), proteinG: Math.round(t.p / n), carbohydrateG: Math.round(t.c / n), fatG: Math.round(t.f / n), source: nutritionSource },
    estimateMinor: Math.round(usd * 100),
    cost: { currency: 'USD', basis: 'base-recipe', estimated: true, source: costSource, region: 'Boston, MA', asOf: AS_OF },
  };
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const write = process.argv.includes('--write');
  for (const file of files) {
    const recipes = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const r of recipes) {
      const e = estimate(r);
      if (!write) console.log(r.id.padEnd(62), `${e.nutrition.calories} kcal P${e.nutrition.proteinG} C${e.nutrition.carbohydrateG} F${e.nutrition.fatG}`, `$${(e.estimateMinor / r.baseServings / 100).toFixed(2)}/serving`);
      else Object.assign(r, { nutrition: /^https?:/.test(r.nutrition?.source ?? '') ? r.nutrition : e.nutrition, estimateMinor: e.estimateMinor, cost: e.cost }); // keep nutrition published by a recipe source
    }
    if (write) fs.writeFileSync(file, JSON.stringify(recipes, null, 2) + '\n');
    if (!write) break;
  }
}
