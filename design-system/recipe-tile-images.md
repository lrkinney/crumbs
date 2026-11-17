# Consistent Browse recipe images · 2026-10-20

All five live Figma Food Image masters have 169 × 169 logical frames, and both Browse screen variants use these equal square frames. The previous PNG exports included unequal transparent/shadow bounds: some were 418 × 418, others 498 × 418. Containing these files inside equal square tiles made their visible plates different sizes.

Re-exported all five original masters at 2x using useAbsoluteBounds, yielding identical 338 × 338 PNGs. The live masters store this export policy as plugin metadata. Regenerate with exportAsync and useAbsoluteBounds; Figma does not allow saving that option as a normal export-panel setting on these component nodes. Expo Browse uses these exports from assets/crumbs/recipe-tiles, including its planned-state opacity treatment. Original assets remain available for existing non-grid uses. The DOM component reference also uses the normalized tile asset.

The companion JSON maps each export to its Figma source. Visually inspected exported chicken and souvlaki plates and the live Figma Browse screen. A regression check ensures every recipe's tile asset matches the square 2x Figma bounds. Lint, typecheck, app tests and both design-system suites passed. Expo Go rendering still needs an on-device check.
