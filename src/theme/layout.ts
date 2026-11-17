import { token } from './tokens.generated.ts';

/** Measurements from the source frames, not a new app layout.
 * Browse 15:1203; Recipe 11:739; shared journey chrome 299:17217.
 * Fixed artwork sizes describe intrinsic compositions; spacing uses Figma tokens.
 */
export const layout = {
  canvasWidth: token('component.screen.reference-width'),
  gutter: token('component.screen.gutter'),
  headerTop: token('foundation.space.24') + token('foundation.space.6'),
  recipeScreenTop: token('foundation.space.64'),
  headerTitleGap: token('foundation.space.24') - token('foundation.space.2'),
  subtitleGap: token('foundation.space.10'),
  journeyBodyGap: token('foundation.space.40') - token('foundation.space.2'),
  gridGap: token('foundation.space.24'),
  tileGap: token('foundation.space.12'),
  browseBodyGap: token('foundation.space.32'),
  heroPlate: 233,
  journeyPlate: 150,
  ingredientPhoto: token('foundation.space.48'),
  ingredientItem: token('foundation.space.48'),
  servingCounterWidth: 146,
  navPadding: token('foundation.space.16'),
  navLabelGap: token('foundation.space.2'),
  fieldHeight: token('component.button.height.default'),
  buttonHeight: token('component.button.height.compact') + token('foundation.space.12'),
  actionHeight: token('component.button.height.default'),
} as const;

export function recipeTileWidth(width: number) {
  return (Math.min(width, layout.canvasWidth) - layout.gutter * 2 - layout.gridGap) / 2;
}
