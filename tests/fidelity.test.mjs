import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { layout, recipeTileWidth } from '../src/theme/layout.ts';
import { tokens } from '../src/theme/tokens.generated.ts';
import { recipes } from '../src/fixtures/recipes.ts';
import { recipePresentation } from '../src/fixtures/recipe-presentation.ts';

const source = JSON.parse(await readFile(new URL('../design-system/layout-reference.json', import.meta.url), 'utf8'));
test('browse geometry matches the measured Figma grid at the reference width', () => {
  assert.equal(layout.canvasWidth, source.canvas[0]);
  assert.equal(recipeTileWidth(source.canvas[0]), source.browse.tileWidth);
  assert.equal(layout.gridGap, source.browse.gridGap);
  assert.equal(layout.tileGap, source.browse.tileGap);
  assert.equal(tokens['semantic.type.display.size'], source.browse.titleSize);
  assert.equal(recipeTileWidth(source.canvas[0]) * 2 + layout.gridGap, source.browse.gridWidth);
});
test('two recipe columns fit common phone widths without crossing the page gutter', () => {
  for (const width of [320, 360, 375, 390, 402]) {
    const tile = recipeTileWidth(width);
    assert.ok(tile >= 128);
    assert.equal(tile * 2 + layout.gridGap + layout.gutter * 2, width);
  }
});
test('native recipe hero, servings bar, and navigation use the source measurements', () => {
  assert.equal(layout.heroPlate, source.recipe.plateSize[0]);
  assert.equal(layout.servingCounterWidth, source.recipe.servingCounterWidth);
  assert.equal(layout.navPadding, source.navigation.padding[0]);
});
test('the recipe catalog preserves all five source tiles and full designed titles', () => {
  assert.equal(recipes.length, 32);
  assert.equal(recipes[0].title, 'Honey Sriracha Chicken & Asparagus');
  assert.equal(recipes[1].title, 'Sheet-Pan Chicken Souvlaki');
  assert.equal(recipes[3].title, 'Tofu & Zucchini Piccata');
  assert.equal(recipes[4].title, 'Spiced Chicken & Feta Toasts');
  for (const recipe of recipes) assert.equal(recipePresentation[recipe.id].title, recipe.title);
});
test('browse artwork exports share the same square Figma bounds without unequal shadow padding', async () => {
  for (const recipe of recipes.filter(r => r.image)) {
    const png = await readFile(new URL(`../assets/crumbs/recipe-tiles/${recipe.image}.png`, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), source.browse.tileWidth * 2);
    assert.equal(png.readUInt32BE(20), source.browse.tileWidth * 2);
  }
});
