# CRUMBS design system

This package accompanies **CRUMBS Happy Path Screens** in Figma. The live screens use the shared component library; backups and research boards stay separate.

## Start here

- **Figma → 02 · Components:** existing controls plus typography, cards, rows, fields, screen chrome, recipe compositions, and feedback patterns.
- **Figma → 07 · Design System · App Handoff:** token architecture, component contracts, responsive behavior, and application boundaries.
- [`component-contracts.json`](component-contracts.json): every library family, its props/events, Figma variant IDs, token dependencies, and live usage.
- [`tokens.json`](tokens.json): grouped design tokens with aliases; [`tokens.css`](tokens.css) provides the matching CSS names shown in Figma Inspect.
- [`models.d.ts`](models.d.ts): example application data contracts, quantities, money, persistence, and service boundaries.

## Tokens

The chain is **foundation → semantic role → component alias**. For example:

```text
legacy.Spacing/4 (16)
  → foundation.space.16
  → component.card.padding
  → a shared card master and its screen instances
```

Use a semantic/component role in UI code rather than looking up a pixel value. Legacy variables remain as compatibility roots so the existing library and the newer patterns share values. The exports include the legacy visual aliases. Prototype collections for forms, recipes, household choices, quantities, and plan state are excluded.

The current export has 444 visual tokens (232 canonical plus 212 compatibility tokens), 93 family contracts covering 219 definitions, and 49 original asset exports. Typography, spacing, radii, fills, borders, control sizes, opacity and interface elevation use variables. Canvas coordinates/editor decorations and intrinsic artwork geometry are deliberately not converted into arbitrary UI tokens.

The main exports are:

| File | Purpose |
| --- | --- |
| `tokens.json` | DTCG-style token groups, types, and references |
| `tokens.css` | Copyable CSS variables, including compatibility names |
| `tokens.resolved.json` | Resolved values for other build targets |
| `token-paths.d.ts` | TypeScript union of token paths |
| `figma-export.json` | Exact current library/layout export and screen component references |
| `source-before-migration.json` | Pre-migration variable/style snapshot |

Type sizes and line heights export to `rem` in CSS; Figma/dimensions retain logical px. Opacity exports to a unitless ratio: Figma's 50 percentage points become `0.5` in code. The reference viewport is **402 × 874**, not an implementation constraint. App layout uses fluid width, a content maximum, wrapping text, safe-area insets, and a flexible scrolling main area.

Lingo and Matter-TRIAL are the Figma font names. The code provides local/font-system fallbacks. Supply the licensed font files and map the production font families in the app.

## Components in code

`components.mjs` contains framework-independent DOM factories using native controls. Import `components.css` once. Applications can wrap these patterns in React, Vue, SwiftUI, Compose, or another renderer while keeping the token and data contracts.

```js
import { ActionButton, InfoCard, TextField } from './components.mjs';

const card = InfoCard({
  title: 'Your week is taking shape',
  description: 'Choose varied meals and share ingredients.',
  children: [ActionButton({ label: 'Review plan', onPress: openPlan })]
});

const field = TextField({
  id: 'food-name',
  label: 'Food name',
  value: pantryDraft.name,
  onChange: name => updatePantryDraft({ name }),
  error: errors.name
});
```

The reference provides actions/icon actions, text roles, cards, settings rows, labeled inputs/selects, native choices, steppers, recipe/ingredient rows, facts, media, action bars, navigation, a dialog, and AppShell. All other Figma compositions are described in the contract export and built from these patterns and application data.

Keep callbacks and state in the app. Do not copy global Figma variables such as `Input/Draft`, recipe-specific Boolean flags, or canned sale results into a production state store. The Figma custom keyboard is a **prototype-only adapter**; native inputs use the platform keyboard. The add-to-plan overlay keeps its existing Figma destination ID as a compatibility host, with a shared Dialog instance inside it.

Figma `Pattern` alternatives preserve existing layouts. In an app, use explicit props, child slots, and item arrays rather than a component per screen or a fixed number of ingredient layers.

## Assets

`assets/index.json` maps component IDs to the **30 SVG** and **19 PNG** exports. `assets/icons.svg` supplies symbols; monochrome symbols use `currentColor`, while multicolor art keeps its original paints. The `Icon` factory accepts a symbol path such as `assets/icons.svg#icon-103-777` from the index.

Vector path coordinates and photography pixels are intrinsic artwork, not spacing tokens. Use the base recipe artwork with the planned-state treatment; the pre-faded Figma variants are also exported for compatibility and should not receive that treatment twice.

## App implementation boundaries

Implement recipe filtering and dietary verification, portion scaling, compatible-unit aggregation, pantry subtraction, price provenance, uploads, authentication, sharing permissions, synchronization, and persistence behind services. The component library renders the resulting idle/loading/ready/empty/error states. Prototype prices, dates, and recipes are fixture/draft content; cooking methods need recipe testing before release.

Native controls, associated labels/errors, visible focus, meaningful headings, minimum control sizes, and dialog focus handling are part of the contracts. These are implementation patterns, not a claim of a completed accessibility audit.

## Build and inspect

Requires Node 22+; no npm dependencies are needed.

```sh
node build.mjs
npm test
npm run preview
# Open http://127.0.0.1:4173/
```

`index.html` is the interactive component reference. `node tests/browser.mjs` optionally checks it in installed Chrome using an isolated temporary profile. Set `CRUMBS_CHROME` if Chrome is installed elsewhere.

The six local export tests pass. The native-browser checks **could not complete in this managed workspace**: listening on localhost was denied, and offline Chrome exited with SIGABRT. `browser-validation.json` records this; keyboard, native-dialog, and 320px responsive assertions are provided for running locally, and are not reported as passed. Figma screenshots and prototype/data integrity were checked separately in `figma-validation.json`.

## Maintaining the system

1. Edit a foundation/semantic/component variable or the shared master, not screen instances for a visual change.
2. Keep text/content overrides and application state at the instance level.
3. Use Auto Layout/fill behavior for repeated UI; preserve prototype screen and overlay hosts.
4. Re-export the live Figma data, regenerate the package, and run the checks after changes.
5. Review desktop/mobile text wrapping and keyboard interaction in the implemented app.

The dated **97** screen backup is detached from live masters for visual reference. **97b** preserves the previous component masters. File-level variables remain shared; `source-before-migration.json` preserves their values/styles before migration. Older **98/99** backups remain in the file.

Format and behavior references: [Design Tokens Format 2025.10](https://www.designtokens.org/tr/2025.10/format/), [Design Tokens Color 2025.10](https://www.designtokens.org/tr/2025.10/color/), and [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

See [Time Slider](time-slider.md) for the responsive cooking-time ruler, prototype controls, and verification limits.

See [Onboarding](onboarding.md) for the complete setup sequence, optional branches, replay entry, and verification limits.

The orange overlap key is always visible below recipe search in both browse states, including an empty plan. It uses the existing `Overlap Label` Info component. `overlap-key-export.json` records verified live Figma positions; Expo renders the same icon and copy.

See [Ingredient quantities](ingredient-quantities.md) for imperial display, chicken sizes, whole-item shopping, pantry input, and retained leftovers.

See [Overlay dismissal](overlay-dismissal.md) for the shared outside-click/tap behavior and live Figma overlay audit.

See [Ingredients preview](ingredient-gallery.md) for the shared Show all label, whole-widget press target, and verification limits.

See [Pantry quick add](pantry-quick-add.md) for batch selection of recipe ingredients and suggested purchase amounts.

See [Recipe day picker](recipe-day-picker.md) for choosing a plan day before saving a recipe.
