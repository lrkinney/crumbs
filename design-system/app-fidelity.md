# Native app layout mapping

The Figma frames determine the app’s composition. Tokens alone do not describe screen layout. The initial app’s single-column cards, large green dashboard panel, navigation pills, and simplified onboarding have been replaced with native compositions based on the actual screen designs.

| App surface | Source frame | Translation |
| --- | --- | --- |
| Browse Recipes | [15:1203](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=15-1203) | Two columns, transparent tiles, full names, compact calorie/price line, search controls, Plan navigation |
| Recipe | [11:739](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=11-739) | Centered 233-point plate, floating header actions, display title, four facts, ingredient photo strip, fixed servings/action bar |
| Ingredients | [16:1301](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=16-1301) | Categorized ingredient rows with thumbnails and scaled quantities |
| Empty Home | [preserved Home](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=316-27238) | Getting started band and kitchen setup summaries |
| Active Home | [299:17217](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=299-17217) | Plate, Tonight card, compact rows, bottom action |
| Plan landing | [155:1633](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=155-1633) | Beige planning card and three feature rows |
| Plan setup | [299:17301](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=299-17301) | Labeled week, household, meals, and budget values |
| Current Plan | [52:2570](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=52-2570) | Week strip, unboxed image/text meal rows, review action |
| Shopping List | [21:1677](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=21-1677) | Flat category/checkbox rows and fixed review action |
| Pantry | [299:18979](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=299-18979) | Use-soon card, compact food rows, fixed Add food action |
| Add/edit food | [299:19178](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=299-19178) | Full screen with labeled value controls and save action |
| Cook | [299:19554](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=299-19554) | Plate, meal summary, prep/plan rows, bottom start action |
| Cooking guide | [299:19891](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=299-19891) | Three-stage guide with compact information cards |
| Your kitchen | [299:20230](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=299-20230) | Six settings rows and shared profile chrome |
| Welcome | [preserved Welcome](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=316-26815) | Three-plate collage, original headline, setup card, fixed actions |
| Onboarding fields | [121:2097](https://www.figma.com/design/61rO5dmZy6bsxQXUkKw0SH?node-id=121-2097) | Step header, segmented progress, large question, fields/choices, fixed actions |

`layout-reference.json` records measurements read directly from live nodes. `src/theme/layout.ts` translates them into responsive native layout rules. Spacing remains tied to the exported token scale. Plate dimensions and collage proportions describe the intrinsic artwork composition.

The dated backup supplies the original Welcome/Home copy where the live library’s shared text overrides no longer show the original content. No Figma content was changed during this app correction.

The implemented prototype uses real saved state, so names, counts, dates, quantities, pantry contents, and empty/populated states will differ from static examples. Native safe areas are added for actual devices. Screens remain scrollable on smaller displays. Optional account, sharing, scanning, and notification services are not connected; their entry points do not fabricate success.

Validation includes live Figma screenshots, source geometry checks, TypeScript/lint checks, domain/persistence tests, and platform bundle exports. These are not rendered app screenshot comparisons. The environment blocks localhost servers and its Chrome process exits with SIGABRT, so browser screenshots and phone execution remain unverified. No pixel-perfect comparison is claimed.
