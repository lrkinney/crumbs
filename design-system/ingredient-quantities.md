# Ingredient quantities · 2026-11-03

Ingredient quantities use U.S. customary oz, lb, fl oz, cups, tbsp, tsp, and meaningful item counts. Nutrition labels retain grams. Conversion factors follow [NIST](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9).

Chicken always uses **medium breasts, approximately 6 oz each**. There is no size preference, size picker, or size-selection dialog in Expo or Figma. Pantry entry can use medium breast counts or package weights in oz/lb. Old saved Small/Large preferences are ignored. Shopping shows “1 medium breast” or “2 medium breasts” and the approximate total weight. Legacy whole-gram values have a half-gram boundary tolerance; credited purchases still cover the exact shortage.

Scale recipes precisely, combine compatible ingredients across meals, subtract pantry stock once, then round the shortage to purchasable amounts. Thus 3½ cucumbers become 4 to buy; two recipes needing 1½ each become 3, not 4. Garlic uses whole bulbs estimated at ten cloves each. Other weights/liquids round to whole oz/fl oz, allowing half a gram/milliliter for legacy conversion boundaries. Do not invent retail package sizes or convert dry weight to cups without ingredient density.

Cooking retains its original quantity, so buying 4 cucumbers and using 3½ leaves ½ in the pantry. Purchased stock records rounded amounts. Changed exact requirements invalidate affected checkmarks. Internal g/ml/each storage preserves precision and existing saves; user-facing inputs and labels use imperial units.

`imperial-quantities-export.json` contains the 17 affected live screen snapshots and imperial variable mapping. The former chicken-size control and overlay have been removed from both snapshots and live Figma. The original metric variables, archives, backups, and research boards remain. All prototype quantity reactions use medium breasts. Existing Figma fixture weights use one cucumber per 150 g and one zucchini/eggplant per 200 g as count equivalents; Expo fixtures already store those foods as counts. The Figma formatter covers its finite serving range of 1–12 and up to 64 breasts/bulbs; Expo computes quantities dynamically.

Validation: Expo lint/typecheck, all 42 tests, and iOS/Android/web bundle exports pass. Figma ingredient, shopping, and pantry screenshots were checked. Browser/device interaction remains unverified in the managed sandbox. The one-time authoring script is guarded against repeated execution.
