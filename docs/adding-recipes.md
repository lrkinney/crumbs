# Adding CRUMBS recipes

> Update: the expanded 32-recipe library now lives in `data/recipes.json` (schema v2). See `data/README.md` for the current data-only import workflow. The v1 catalog below remains the five-recipe Expo snapshot until the UI migration.

The source of truth is `src/data/recipes.json`. This is a JSON array containing the five migrated recipes. `recipes.schema.json` describes the version 1 import format. The app reads the catalog directly; recipe fixtures are compatibility adapters, not separate editable content.

1. Copy an existing object in the array, including its nested fields. Use a unique lowercase hyphenated `id`. Keep `schemaVersion: 1`.
2. Enter title, description, tags, and `baseServings` (the number of portions made by the original recipe).
3. Enter ingredients for the ENTIRE original yield. Give each line a unique `id`, a reusable `foodId`, label, positive numeric amount, unit (`g`, `ml`, or `each`), and aisle. Use matching food IDs to combine grocery quantities. Preparation, group, and originalText can be text or null. Optional is metadata in this first version; the planner currently includes every ingredient.
4. Write ordered `instructionDetails`. Each needs an ID, text, and ingredientIds (an empty array is allowed). Avoid hardcoding scalable quantities in step text: this first version does not interpolate step quantities.
5. Enter timing in minutes. Total is elapsed time, not necessarily prep plus cook. Use null for unknown prep/cook time. Times do not scale with portions.
6. Enter nutrition PER SERVING, using null for unknown values. Calories use kcal; macros use grams. Record the source. Existing prototype calories are unverified and macros are unknown.
7. Enter `estimateMinor` as the estimated ingredient cost for the ENTIRE base recipe in cents. Cost currency is currently USD; the current app formats dollars. Cost metadata records provenance, date, and region. This is ingredient consumption cost, not checkout/package cost. Only the original chicken recipe currently displays a price on recipe cards to preserve the approved prototype.
8. Add equipment names, scaling notes, and source information. The current UI displays tools but does not yet display macros or scaling notes. Review source recipes before publishing: the migrated instructions are illustrative and some existing titles and ingredients are inconsistent (e.g. tofu and zucchini).
9. Run `npm run recipes:validate`, then `npm run check` from the Expo repository. To validate a candidate file before replacing the catalog: `node scripts/validate-recipes.mjs /path/to/candidate.json`. This validates only; it does not merge or overwrite files.
10. Preview the recipe in Expo/web. For design changes, update corresponding live Figma examples and both design-system handoff directories.

## Images

The current renderer uses bundled images. `image` must be one of the five keys listed in the schema. To add new artwork, add its file under assets, register it in both image maps in `src/features/recipes/recipe-card.tsx`, extend the Recipe image union in `src/models/domain.ts`, and extend the schema enum. Remote image URLs and automatic asset importing are not implemented yet. Do not reuse unrelated food artwork for a published recipe.

## Serving calculations

Ingredient amount = base quantity × selected servings × portion factor ÷ baseServings. Cost uses the same ratio and rounds to cents at display/calculation boundaries. Nutrition is stored per serving; a future macro UI can multiply by selected servings and portion factor. Never scale time, temperature, or equipment counts automatically.

## Scope and deployment

JSON is bundled into Expo/web and versioned in Git. Adding catalog entries requires a rebuild/deployment. There is no server, database, website scraper, or in-app upload UI in this version. GitHub/Vercel can use the same catalog; run the validation/check command in CI before deployment. Version 1 deliberately accepts only measured ingredients supported by the existing grocery planner. Unmeasured/to-taste quantities, alternatives, regional units, remote images, and runtime user imports need a schema and renderer extension; do not encode unknown quantities as zero.

## Estimated nutrition and cost (Boston, MA)

`scripts/estimates-table.mjs` holds per-ingredient nutrition and a best-price estimate (cheapest of Star Market, Stop & Shop, Market Basket, ALDI, Target and Walmart in the Boston area; typical shelf prices as of 2026-11-17, not live quotes). Run `node scripts/estimate-recipes.mjs` to preview, or `--write` to fill `nutrition`, `estimateMinor` and `cost` for every recipe. Cost is charged in proportion to the amount used, so package remainders are not included. Nutrition published by a recipe's own source (a `source` that is a URL) is kept. Add a row to the table for any new `foodId`; the script stops on an unknown ingredient.
