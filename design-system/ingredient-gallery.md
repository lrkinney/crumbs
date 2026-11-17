# Ingredients preview

Recipe detail screens share `CRUMBS/Recipe/IngredientGallery`. The header uses “Show all” in Body/Small: Matter Regular, 10px with 16px line height. Expo maps this style to the existing `caption` role. The chevron is hidden in all four master variants.

The complete widget opens the ingredients list: heading, label, pictures, captions, and surrounding space. Expo preserves the recipe and serving count. The horizontal ingredient strip remains scrollable.

`ingredient-gallery-export.json` records the four live master variants and seven live screen instances, including Recipe-HIGHLIGHT. All seven labels were verified against Body/Small and their widget navigation reactions audited; affected Figma previews were reviewed visually. Backups and research boards were preserved.

Validation: Expo token checks, lint, typecheck, and 42 tests passed; iOS, Android, and web bundles exported. The handoff build and six tests passed. Device taps and swipe gestures remain unverified in this environment; localhost/browser preview is unavailable here.
