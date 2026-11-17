import catalog from '../../data/recipes.json' with { type: 'json' };
import type { Recipe } from '../models/domain.ts';
export const recipes: Recipe[] = catalog.map(r => ({ ...r, image: r.image as Recipe['image'], minutes: r.timing.totalMinutes, steps: r.instructionDetails.map(s => s.text) })) as Recipe[];
export const ingredientCatalog = [...new Map(recipes.flatMap(r => r.ingredients).map(i => [i.foodId, i])).values()];
export const findRecipe = (id: string) => recipes.find(recipe => recipe.id === id);
