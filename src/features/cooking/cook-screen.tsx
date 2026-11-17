import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Stack, Text } from '@/components/ui';
import { AppScreen, InfoCard, SettingsRow } from '@/components/app-screen';
import { findRecipe } from '@/fixtures/recipes';
import { recipePresentation } from '@/fixtures/recipe-presentation';
import { useApp } from '@/state/app-state';
import { cookMeal, dateLabel } from '@/services/planning';
import { RecipeImage } from '@/features/recipes/recipe-card';
import { space, token } from '@/theme';

export function CookScreen() {
  const { data } = useApp();
  const meal = data.meals.find(m => m.status === 'planned');
  const recipe = meal ? findRecipe(meal.recipeId) : undefined;
  return <AppScreen title="Cook" subtitle="Today’s meals, with a little head start."
    footer={<Button label={meal ? 'Start cooking' : 'Choose recipes'} style={{ minHeight: token('component.button.height.default') }} onPress={() => meal ? router.push({ pathname: '/cook/[mealId]', params: { mealId: meal.id } }) : router.push('/recipes')} />}>
    <Stack gap={space.sm}>
      {recipe && meal ? <><RecipeImage recipe={recipe} /><InfoCard title={recipePresentation[recipe.id]?.title ?? recipe.title} description={`${recipe.minutes} min · ${meal.servings} servings`} meta={`${dateLabel(meal.date)} dinner`} />
        <SettingsRow title="Prep for more than one meal" description="Group shared ingredients before the week starts" onPress={() => router.push('/prep')} />
        <SettingsRow title="Choose another planned meal" description="See your current plan" onPress={() => router.navigate('/plan')} />
      </> : <><InfoCard title="Nothing to cook yet" description="Choose meals for your plan and come back when you’re ready." /><SettingsRow title="Create your next plan" description="Start with a recipe you’ll enjoy" onPress={() => router.push('/plan-setup')} /></>}
    </Stack>
  </AppScreen>;
}
const chickenGuide = [
  [{ title: 'Get everything ready', text: 'Measure the ingredients using your recipe’s serving count. Start the rice according to its package instructions. Trim the asparagus.' }, { title: 'Mix the sauce', text: 'Combine honey, sriracha, coconut aminos, lime juice, and garlic using the recipe quantities. Keep it separate from raw chicken.' }],
  [{ title: 'Follow the method', text: 'Cook the chicken using the recipe’s method, keeping raw chicken and ready-to-eat ingredients separate.' }, { title: 'Bring it together', text: 'Prepare the asparagus and finish the sauce while the rice cooks. Follow the recipe quantities for your servings.' }],
  [{ title: 'Finish & serve', text: 'Finish your recipe, check that everything is cooked as intended, and serve with the rice and asparagus.' }, { title: 'Keep the good things going', text: 'Store any leftovers and update the ingredients you used.' }],
];
export function CookingScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const { data, change, busy } = useApp();
  const meal = data.meals.find(m => m.id === mealId);
  const recipe = meal ? findRecipe(meal.recipeId) : undefined;
  const [step, setStep] = useState(0);
  if (!meal || !recipe) return <AppScreen title="Meal unavailable" navigation="cook"><Button label="Open my plan" onPress={() => router.replace('/plan')} /></AppScreen>;
  if (meal.status === 'cooked') return <AppScreen title="One less thing to do" subtitle="Good food. Fewer crumbs." navigation="cook"
    footer={<Button label="Back to Cook" onPress={() => router.replace('/cook')} />}><Stack gap={space.sm}><RecipeImage recipe={recipe} /><InfoCard title="Your meal is ready" description={recipePresentation[recipe.id]?.title ?? recipe.title} meta="Pantry updated" /><SettingsRow title="See what’s next" description="Review the rest of your week" onPress={() => router.replace('/plan')} /></Stack></AppScreen>;
  const cards = recipe.id === 'honey-sriracha-chicken' ? chickenGuide[step] : recipe.steps.slice(step === 0 ? 0 : step + 1, step === 0 ? 2 : step + 2).map((text, i) => ({ title: step === 0 ? i === 0 ? 'Get everything ready' : 'Prepare your ingredients' : step === 1 ? 'Follow the method' : 'Finish & serve', text }));
  return <AppScreen title={['Let’s get cooking', 'Follow the method', 'Finish & serve'][step]} subtitle={`${step + 1} of 3 · ${['set yourself up', 'bring it together', 'enjoy your meal'][step]}`} navigation="cook"
    footer={<Button label={step < 2 ? 'Next step' : 'Finish & update pantry'} style={{ minHeight: token('component.button.height.default') }} busy={busy} onPress={() => step < 2 ? setStep(s => s + 1) : void change(d => cookMeal(d, meal.id))} />}>
    <Stack gap={space.sm}>{cards.map(card => <InfoCard key={card.title} title={card.title} description={card.text} />)}
      <Button label="Ingredients & portions" variant="secondary" onPress={() => router.push({ pathname: '/recipes/ingredients', params: { id: recipe.id, servings: meal.servings, factor: meal.portionFactor ?? 1 } })} />
      {step > 0 ? <Button label="Previous step" variant="ghost" onPress={() => setStep(s => s - 1)} /> : null}
    </Stack>
  </AppScreen>;
}
export function PrepScreen() {
  const { data } = useApp();
  const count = new Map<string, { label: string; meals: number }>();
  for (const meal of data.meals.filter(m => m.status === 'planned')) for (const item of findRecipe(meal.recipeId)?.ingredients ?? []) count.set(item.foodId, { label: item.label, meals: (count.get(item.foodId)?.meals ?? 0) + 1 });
  const shared = [...count.values()].filter(i => i.meals > 1);
  return <AppScreen title="Prep once, use twice" subtitle="A little head start for your week." navigation="cook" footer={<Button label="Back to Cook" onPress={() => router.replace('/cook')} />}>
    <Stack gap={space.sm}><InfoCard title="Shared prep" description="Group the ingredients that appear in more than one planned meal." />
      {shared.length ? shared.map(i => <InfoCard key={i.label} title={i.label} description={`Used in ${i.meals} meals`} />) : <Text muted>Add another recipe with shared ingredients to see prep opportunities.</Text>}
    </Stack>
  </AppScreen>;
}
