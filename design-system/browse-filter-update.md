# Browse recipe filter update · 2026-10-20

Verified in the live CRUMBS Happy Path Screens Figma file:

- Browse Recipes (`15:1203`) and Browse Recipes - Overlap (`79:4278`) each use the existing outlined filter control inside the search composition.
- Removed the duplicate filled Filter recipes instances from both screens.
- Expanded each search composition from 306 to 362 points to use the available width.
- The outlined controls navigate to the existing filter destination (`299:18274`).
- Screenshots of both updated live frames confirmed alignment, spacing, and one outlined filter control beside the search input.

The matching Expo BrowseScreen uses one outlined filter control and keeps filtering and sorting available in its dialog. Expo lint and typecheck passed. The Figma snapshot contains the affected screen size and instance removal; this is a targeted update, not a full fresh file export.
