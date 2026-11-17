# Pantry quick add

Add food opens a searchable multi-select list. Before searching, it shows the app recipe ingredients ranked by how often they occur. Typing filters an offline catalog of 272 generic grocery foods, including produce, protein, dairy, bakery, cupboard, spices, frozen foods, and snacks. Results are ranked by prefix match, recipe relevance, and name. Search matches without clearing selections. Select all shown and Clear shown apply only to current results.

Food names are curated from the generic foods represented in USDA FoodData Central. FoodData Central is public domain; the app keeps this suggestion catalog offline and does not call the USDA API. Common foods outside the recipe catalog start with a neutral one-item quantity that can be changed after saving. Recipe ingredients keep practical package suggestions in imperial units.

Save commits selected items in one repository update. Existing foods, amounts, storage, and dates are preserved; already-owned rows are disabled. Tap a pantry food to edit its quantity. Add one with details retains the individual entry flow.

The live Figma quick-add screen is 299:19178. Its default view shows recipe ingredients, and the search example 372:24417 now shows milk suggestions for whole, 2%, and skim milk. Figma demonstrates a representative search result; Expo filters the full offline catalog live. Figma keeps its existing sample selection data. Backups and research boards remain untouched.

The pantry detail editor (372:23492) and onboarding pantry step (121:2302) accept arbitrary typed food names as well as catalog matches. Their autocomplete examples are 374:26051 and 374:26070. When typing a match, a scrollable white suggestion panel overlays the content above the field; choosing a suggestion fills the food details. Unmatched text can still be saved as a custom food. Expo uses the same shared autocomplete field on both screens.

Verification: the affected Figma default, search, pantry detail, and onboarding states were visually reviewed. `npm run typecheck` and `npm run lint` pass in the Expo repository. Native device interaction was not available for this check.

See `pantry-quick-add-export.json` for the live screen/component snapshot, the offline suggestion catalog, and verification limits.
