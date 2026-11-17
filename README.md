# CRUMBS

A local meal-planning prototype built with **Expo SDK 58, React Native, TypeScript, and Expo Router**. The same app targets iOS, Android, and web.

## Run the app

Use Node 24 (see `.nvmrc`), or Node 22.18+.

```sh
npm ci
npm start -- --clear
```

If your Expo server is already running, stop it with **Ctrl+C** first, then restart so it picks up the fonts, routes, and configuration changes.

- Scan the QR code with an SDK-compatible Expo Go app on your phone.
- Press **w** for the web preview.
- Press **i** or **a** for a configured iOS simulator or Android emulator.
- Keep your computer and phone on the same network for the default LAN connection.

Existing `ios`, `android`, and `web` npm scripts also work. No backend, account, environment variables, or API keys are required.

## Try the complete journey

1. Complete setup, or choose **Set up later** to use the default household.
2. Choose **Create a Plan**, review **Plan your week**, and select **Find recipes**.
3. Browse the two-column recipe grid, open a recipe, adjust servings in its fixed bottom bar, and select **Add to plan**. The confirmation offers **Keep Browsing** and **Go to Plan**.
4. In **Current Plan**, select a day, edit the meal or portions, remove a meal, or open the shopping list.
5. In **Shop**, check ingredients, choose **Review purchased food**, then add the checked food to your pantry.
6. In **Pantry**, use **Add food** or tap an existing ingredient to edit its amount, storage, and optional use-by date.
7. In **Cook**, open a planned meal, advance through the guide, and finish to deduct its ingredients from the pantry.
8. Restart or refresh. Your household, meals, pantry, favorites, and shopping selections are restored.

Cooking requires the planned ingredients in your pantry. Purchased ingredients must be put away first. A successful completion consumes stock once; a failed operation preserves the previous app state.

Use the named profile control to open **Your kitchen** and edit household preferences. The component gallery lives under **Account & settings → Help**. Demo reset lives under **Account & settings → Privacy & data**, with a confirmation.

## Project structure

```text
src/app/                   Expo Router routes, root stack, and five tabs
src/components/ui/         Shared native text, buttons, fields, cards, dialogs, etc.
src/components/navigation  Accessible tab bar
src/theme/                 Generated tokens, typography, original icons, font loading
src/features/              Screen composition and local screen state
src/fixtures/              Five source recipe examples and initial household/pantry data
src/models/                App-domain TypeScript contracts
src/services/              Planning rules, validation, repository, storage adapters
src/state/                 Hydration, persisted changes, busy/error states
assets/crumbs/             Original Figma artwork and icons
assets/fonts/              Supplied Lingo and Matter font files
design-system/             Standalone Figma handoff/reference package
tests/                     Domain, persistence, token, and font checks
```

Route files stay small. Shared UI components receive props and callbacks. Business rules and storage live outside the renderer, so future APIs can replace the local repository without rebuilding screens.

## Design system and fonts

`design-system/tokens.resolved.json` is the portable token source. Run:

```sh
npm run tokens
```

This generates all **232 canonical native tokens** and the original SVG icon data. Semantic and component aliases retain their Figma names. Components use these values for color, spacing, type sizes, line height, tracking, radii, control sizes, and opacity.

The implemented layouts now follow the designed Figma compositions. The prototype uses a responsive **402-point reference canvas**, with 20-point gutters. Browse preserves the two-column, unboxed recipe grid with 24-point gaps and 169-point tiles at the reference width. Recipe details preserve the centered plate, four facts, horizontal ingredient strip, and fixed servings/action bar. The shared chrome, filled navigation states, information cards, settings rows, welcome collage, and onboarding choices use their source layouts. See [the source mapping and validation limits](design-system/app-fidelity.md).

`src/theme/fonts.ts` loads the supplied local font faces through `expo-font`, including Lingo Medium and Matter Regular, Medium, and Semibold. Text roles select explicit faces to avoid synthesized font weights. Figma’s 550 display weight maps to the supplied static Lingo Medium face. All other supplied font files remain available in `assets/fonts/`.

Icons use the original Figma SVG paths through `expo-image`; monochrome icons take the semantic foreground color. Food images are bundled, so the prototype does not depend on an external image service.

The complete Figma contracts remain in `design-system/component-contracts.json`. Native primitives and feature compositions implement this prototype’s screens; the DOM component reference in `design-system/` is separate and is not imported by the app.

## Persistence and planning rules

- Native uses `expo-file-system`, with a temporary write and previous-snapshot backup in the app’s document directory.
- Web uses browser local storage through `storage.web.ts`.
- A versioned schema is validated when loading and saving. Unsupported or malformed data prompts recovery rather than silently replacing it.
- Initial data is not automatically written over existing data during hydration.
- Changes are persisted before the UI adopts them; write errors remain visible and can be retried.
- Shopping quantities scale by servings, combine compatible units across meals, and subtract pantry stock once.
- Shopping checkmarks reference both ingredient and quantity, so portion changes invalidate stale selections.
- Recording purchases adds only checked items to the pantry. Finishing a meal deducts stock once and removes that meal’s shopping demand.
- Dates use the local calendar. Currency uses integer USD cents in the domain model.

The prototype has five fixture recipes and illustrative USD prices and methods. Eating preference sets an initial browsing filter using curated fixture tags. Light/Standard/Hearty portions scale new planned meals without changing previously saved standard meals. Accounts, allergy verification, live pricing, uploads, invitations, and cloud synchronization are future integrations.

## Checks

```sh
npm run check
```

This regenerates tokens, runs repository linting, checks TypeScript, and runs the Node test suite. Linting uses the installed TypeScript parser/compiler to enforce unused-code checks, specific types, source hygiene, and Expo Router imports; it does not require an ESLint download.

To check platform bundling without publishing:

```sh
npx expo install --check
npx expo export --platform web --output-dir /tmp/crumbs-web-check
npx expo export --platform ios --platform android --output-dir /tmp/crumbs-native-check
```

Web, iOS, and Android bundle exports passed during implementation. The automated suite covers source grid measurements and responsive two-column sizing, planning, stock aggregation and consumption, persistence failures, schema validation, a persisted end-to-end domain journey, tokens, and font paths. These checks are not a substitute for running the UI on devices.

The managed implementation environment blocks localhost listening (`EPERM`), so live browser interactions, layout screenshots, and device execution could not be verified here. Review the journey above on your phone and in the browser, including keyboard input, modal dismissal, scrolling, refresh, and error recovery.

## GitHub and future deployment

The existing local Git repository is preserved. Source, lockfile, assets, tests, and this guide can be committed when you are ready; dependencies and generated platform/build folders are ignored. No remote repository, push, hosting configuration, or deployment was created.

The starter’s web output setting is preserved. Choose the web hosting/output strategy separately when you reach that step. Native distribution is also a later step.

Development references: [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [Expo Router](https://docs.expo.dev/versions/v58.0.0/sdk/router/), [Font loading](https://docs.expo.dev/versions/v58.0.0/sdk/font/), and [FileSystem](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/).
