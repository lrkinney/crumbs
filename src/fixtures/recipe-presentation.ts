import catalog from '../../data/recipes.json' with { type: 'json' };
export const recipePresentation = Object.fromEntries(catalog.map(r => [r.id, {
 title: r.title, prep: r.timing.prepMinutes ?? undefined, cook: r.timing.cookMinutes ?? undefined,
 calories: r.nutrition.calories ?? undefined, tileCalories: r.nutrition.calories ?? undefined,
 priceMinor: r.estimateMinor == null ? undefined : Math.round(r.estimateMinor / r.baseServings),
 tools: r.equipment.length ? r.equipment.join(', ') : undefined,
}]));
