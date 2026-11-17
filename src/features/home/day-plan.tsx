import { router } from 'expo-router';
import { Button, Stack, Text } from '@/components/ui';
import { PlannedMealCard } from '@/features/home/planned-meal-card';
import { findRecipe } from '@/fixtures/recipes';
import type { Meal } from '@/models/domain';
import { space } from '@/theme';

/** The meals planned for the selected day, or an empty state with a way to add one. The date heading is the screen title. */
export function DayPlan({ date, today, meals }: { date: string; today: string; meals: Meal[] }) {
  const isToday = date === today;
  return <Stack gap={space.lg} style={{ paddingTop: space.md }}>
    {meals.length ? meals.map(meal => {
      const recipe = findRecipe(meal.recipeId);
      return recipe ? <PlannedMealCard key={meal.id} meal={meal} recipe={recipe} isToday={isToday}
        onOpen={() => router.push({ pathname: '/recipes/[id]', params: { id: recipe.id } })}
        onCook={() => router.push({ pathname: '/cook/[mealId]', params: { mealId: meal.id } })}
        onReview={() => router.navigate({ pathname: '/plan', params: { date } })} /> : null;
    }) : <Stack gap={space.md}>
      <Text muted>{isToday ? 'Nothing is planned for today yet.' : 'Nothing is planned for this day yet.'}</Text>
      <Button label="Browse recipes" variant="secondary" onPress={() => router.push('/recipes')} />
    </Stack>}
  </Stack>;
}
