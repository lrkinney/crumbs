# Recipe catalog handoff — 2026-11-17

Canonical recipe data: `Crumbs Repo/crumbs/src/data/recipes.json`.
Schema and authoring guide: `src/data/recipes.schema.json` and `docs/adding-recipes.md` in the Expo repository.

The five existing recipes now load from JSON. Presentation data derives from that catalog. Existing per-serving ingredient and planning calculations remain in place. Missing nutrition stays null. Prices other than the original chicken card remain hidden to preserve current presentation.

Live Figma file: CRUMBS Screens (61rO5dmZy6bsxQXUkKw0SH), page 03 · Screens · Happy Paths. Two chicken tile calorie labels changed from 593 kcal. to 592 kcal., matching the existing detail value. Tile 112:1084 was captured and visually inspected after the change. Backups and research boards were not edited. This is consistency of prototype content, not nutritional verification.

Validation: catalog, lint, typecheck and new import tests pass. Full suite has two pantry-suggestion failures (290 suggestions versus an expected 18). Expo runtime/browser visual verification was not performed in this pass.
