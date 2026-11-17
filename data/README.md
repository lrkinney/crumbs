# Recipe library (data-only)

`recipes.json` is the 32-record recipe library. `recipes.schema.json` is its version 2 schema. `imports/2026-11-17-dinners.json` is the source-attributed 27-record import batch. A timestamped pre-import backup preserves the original five library records.

The current Expo prototype still reads `src/data/recipes.json`, its five-recipe version 1 snapshot. This separation is intentional for the requested data-first review. No Figma screens or Expo UI were changed. Do not copy this library directly over that snapshot: first implement nullable artwork/cost handling and migrate the adapter to version 2. After that migration, retire the snapshot to avoid maintaining two sources of truth.

## Validation and import

From the repository root:

```sh
npm run library:validate
npm run library:import -- data/imports/2026-11-17-dinners.json
node --test tests/recipe-library.test.mjs
npm run check
```

The importer validates before writing, rejects conflicting IDs, skips identical records, saves a backup, and replaces the library atomically. A failed validation does not write the catalog. Import input is an array of full version 2 recipe records. Running the same import twice adds nothing the second time.

Version 2 preserves the existing field structure but permits `image: null` and `estimateMinor: null`. These mean unavailable, not an arbitrary existing photo and not zero cost. Nutrition values can also be null. Keep unknown values null until there is a documented source/calculation.

Quantities are for `baseServings`, not per serving. Nutrition is per serving, and `estimateMinor` is for the entire base recipe. `totalMinutes` includes sides; timing is not multiplied when servings change. `extensions` records author, source yield, review status, adaptations and missing-data status. Recipe steps are rewritten concise adaptations, not verbatim publisher instructions.

For a new recipe, copy a batch entry, give it a new stable ID, record its source and author, supply the full meal ingredients and steps, and validate/import it. Use the same foodId AND unit for the same grocery ingredient. Distinguish raw/dried ingredients from cooked equivalents. If a count-to-weight assumption is required, document it rather than treating it as a universal conversion.

See `../docs/recipe-import-2026-11-17.md` for the full selected menu and per-recipe changes. These records are structurally validated and source-reviewed; they have not been kitchen-tested. The original five retain their existing prototype limitations.
