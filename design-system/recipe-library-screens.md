# Recipe library screens (32 recipes)

Figma page **03 · Screens · Happy Paths → section "22 · Recipe library · 32 connected dinners"** holds one set of three frames for each recipe in `data/recipes.json`:

- **Recipe ·** detail screen (402 × 874): placeholder or bundled photo, time/cost/calorie facts, ingredient strip, tools, description, nutrition, method, serving notes, servings bar.
- **Ingredients ·** full ingredient list grouped by aisle. Quantities are bound to variables in the `CRUMBS · Recipe catalog` collection, so the servings buttons update them in prototype mode (1–12 servings, imperial amounts from `src/services/quantities.ts`).
- **Plan ·** day-picker overlay opened by *Add to plan*.

**Browse Recipes (15:1203)** now lists all 32 tiles in the two-column grid; every tile opens its detail frame. Tiles without artwork use `CRUMBS/Media/RecipePlaceholder Square` (the user's "RECIPE PLACEHOLDER IMAGE"); detail screens use `CRUMBS/Media/RecipePlaceholder` (203 × 169). Both live in Components → "14 · Recipe library assets".

Calories, macros and per-serving prices are estimates for Boston, MA (cheapest of Star Market, Stop & Shop, Market Basket, ALDI, Target and Walmart per ingredient, charged in proportion to the amount used; typical shelf prices as of 2026-11-17, not live quotes). They come from `scripts/estimates-table.mjs` via `scripts/estimate-recipes.mjs` in the Expo repo. Lemon spaghetti keeps its source-published nutrition. 

## Node IDs

| Recipe id | Detail | Ingredients | Plan |
|---|---|---|---|
| `honey-sriracha-chicken` | 385:24730 | 385:25029 | 385:25069 |
| `chicken-souvlaki` | 385:25138 | 385:25444 | 385:25494 |
| `tomato-lentil-ratatouille` | 385:25563 | 385:25866 | 385:25909 |
| `tofu-piccata` | 385:25978 | 385:26276 | 385:26314 |
| `spiced-chicken-feta-toasts` | 385:26383 | 385:26681 | 385:26720 |
| `wasabi-garlic-prawns-with-soba-and-pak-choi` | 385:26789 | 385:27101 | 385:27160 |
| `paprika-butter-fish-with-potatoes-and-green-beans` | 385:27231 | 385:27549 | 385:27621 |
| `panang-chicken-and-green-beans-with-jasmine-rice` | 385:27694 | 385:28019 | 385:28099 |
| `thai-basil-beef-noodles-with-broccoli` | 385:28172 | 385:28502 | 385:28589 |
| `chicken-and-egg-donburi-with-cucumber` | 385:28662 | 385:29004 | 385:29107 |
| `lemon-chive-gnocchi-with-green-beans` | 385:29180 | 385:29495 | 385:29566 |
| `prawn-pad-thai-with-beansprouts` | 385:29639 | 385:29966 | 385:30048 |
| `tahini-noodles-with-lime-cabbage-slaw` | 385:30121 | 385:30441 | 385:30513 |
| `red-pesto-gnocchi-with-chargrilled-vegetables` | 385:30586 | 385:30888 | 385:30935 |
| `salmon-with-tartare-cream-spinach-and-potatoes` | 385:31009 | 385:31326 | 385:31395 |
| `garlic-prawns-with-peppers-spinach-and-rice` | 385:31468 | 385:31778 | 385:31837 |
| `prawn-and-leek-frittata-with-sourdough` | 385:31910 | 385:32215 | 385:32269 |
| `kimchi-udon-with-broccoli-and-sesame-egg` | 385:32342 | 385:32674 | 385:32763 |
| `sesame-tofu-noodles-with-pak-choi-and-snow-peas` | 385:32836 | 385:33156 | 385:33229 |
| `chorizo-and-pickled-pepper-penne` | 385:33302 | 385:33617 | 385:33684 |
| `creamy-mustard-gnocchi-with-broccoli-and-peas` | 385:33757 | 385:34072 | 385:34139 |
| `teriyaki-tofu-with-brown-rice-and-spring-onions` | 385:34212 | 385:34532 | 385:34605 |
| `cacio-e-pepe-with-lemon-rocket-salad` | 385:34678 | 385:34988 | 385:35047 |
| `fajita-steak-with-pepper-rice-and-yogurt` | 385:35120 | 385:35435 | 385:35502 |
| `halloumi-beetroot-and-orange-salad-with-pita` | 385:35575 | 385:35912 | 385:36009 |
| `roasted-cauliflower-with-pepper-salsa-and-chickpea-couscous` | 385:36082 | 385:36412 | 385:36498 |
| `roasted-vegetable-tacos-with-smoky-kiwi-salsa` | 385:36571 | 385:36914 | 385:37020 |
| `peanut-and-herb-noodles-with-edamame` | 385:37093 | 385:37445 | 385:37562 |
| `pesto-chickpea-and-mozzarella-sourdough-with-rocket` | 385:37635 | 385:37958 | 385:38037 |
| `lemon-spaghetti-with-asparagus-leeks-and-peas` | 385:38110 | 385:38425 | 385:38491 |
| `lemon-garlic-salmon-with-asparagus-tomatoes-and-bread` | 385:38564 | 385:38887 | 385:38967 |
| `honey-garlic-chicken-with-rice-and-broccoli` | 385:39040 | 385:39356 | 385:39426 |

## Layout fixes made during review (2026-11-17)

- "Servings:" label no longer wraps; button labels are vertically centred; day buttons (Mon–Sun) no longer break onto two lines.
- Placeholder plate scales with its frame instead of rendering small and off-centre.
- `roasted-red-pepper` merged into `roasted-red-peppers` so shopping lists combine them (149 distinct recipe ingredients after the restore below).
- Tomatoes are a single ingredient (`tomato`, label "Tomatoes"); "chopped" is stored as the recipe line's `preparation` and shown as "Tomatoes, chopped" on the ingredients page (149 distinct recipe ingredients after the restore below).
- Recipe placeholder artwork re-centred and squared (576 × 576). Figma uses a cropped fill of the original image; Expo and both design-system folders use the new PNG.

## Original five recipes restored, modifiers, title case (2026-11-17)

- The five original recipes' ingredient lists, methods, descriptions, tools and prep/cook times were restored from the original Figma screens (`Recipe`, `Ingredients`, `Recipe · …`, `Ingredients · …`). The earlier JSON, inherited from the Oct 17 Expo fixtures, had only 5–7 ingredients each and generic steps. Amounts that already existed in the JSON were kept; ingredients added back use the Figma amounts, converted to metric. The honey sriracha garlic stays at 2 cloves (the original Figma screen said 6).
- Ingredient modifiers (`preparation` in the JSON, e.g. Boneless, Skinless; Extra Virgin; Chopped) show as a small 10 px line beneath the ingredient name on the Ingredients screen, matching Figma "HIGHLIGHT FOR MODIFIER EXAMPLE" (386:40793). Rows without a modifier keep a single centred name. Comma suffixes in old labels (e.g. "Soba noodles, dried") were moved into the modifier.
- Recipe titles and ingredient names use title case (`scripts/normalize-names.mjs`). `red-pepper` became `bell-pepper` (modifier "Red" where recipes call for red peppers).
- The five library frames (`Recipe ·`, `Ingredients ·`, `Plan ·`) were rebuilt; estimates were recomputed for them.
- Recipe and Ingredients screens (the 32 library screens and the original Recipe, Recipe - Overlap, Ingredients and Ingredients - Overlap screens plus the four original per-recipe pairs) use 64 px top padding bound to `space/64` (Expo: `layout.recipeScreenTop` = `foundation.space.64`). The Ingredients screen back button is now the same `ButtonBeigeSmall` (arrow, no label) as the Recipe screen instead of a bare arrow icon.
