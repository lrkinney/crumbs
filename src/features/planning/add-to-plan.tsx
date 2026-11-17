import { Pressable } from 'react-native';
import { RecipeImage } from '@/features/recipes/recipe-card';
import { findRecipe } from '@/fixtures/recipes';
import { PlanCalendar } from './plan-calendar';
import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Dialog, Row, Stack, Stepper, Text } from '@/components/ui';
import type { Meal, Recipe } from '@/models/domain';
import { useApp } from '@/state/app-state';
import { addMeal, householdPortionFactor, localDate, dateLabel } from '@/services/planning';
import { space, token } from '@/theme';
import { recipePresentation } from '@/fixtures/recipe-presentation';

export function AddToPlan({ recipe, onClose, meal, servings: initialServings }: { recipe: Recipe; onClose: () => void; meal?: Meal; servings?: number }) {
  const { data, change, busy, error } = useApp();
  const [servings, setServings] = useState(initialServings ?? meal?.servings ?? data.household.size);
  const [date, setDate] = useState(meal?.date ?? '');
  const [saved, setSaved] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(true);
  const plannedOnDay = data.meals.filter(planned => planned.date === date && planned.status === 'planned');
  const submit = async () => {
    if (!date || busy) return;
    const ok = await change(current => meal
      ? { ...current, meals: current.meals.map(m => m.id === meal.id ? { ...m, servings, date } : m) }
      : addMeal(current, { id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, recipeId: recipe.id, date, servings, status: 'planned', portionFactor: householdPortionFactor(current.household) }));
    if (ok) setSaved(true);
  };
  return <Dialog title={saved ? `${recipePresentation[recipe.id]?.title ?? recipe.title} added to your plan!` : meal ? 'Edit your meal' : 'Which day should we add it to?'} visible onClose={onClose}>
    {saved ? <Stack gap={space.xl}><Text muted>Added to {dateLabel(date)}. Keep browsing or view your plan.</Text>
      <Row style={{ gap: space.lg }}><Button label="Keep Browsing" style={{ flex: 1, minHeight: token('component.button.height.large') }} onPress={() => { onClose(); router.replace('/recipes'); }} testID="keep-browsing" />
        <Button label="Go to Plan" style={{ flex: 1, minHeight: token('component.button.height.large') }} onPress={() => { onClose(); router.navigate({ pathname: '/plan', params: { date } }); }} /></Row>
    </Stack> : <Stack>
      <Text role="card">{recipe.title}</Text><Text muted>Choose a day. You can change this later.</Text>
      <PlanCalendar date={date} onChange={value => { setDate(value); setOverviewOpen(true); }} weekOf={meal?.date ?? data.planStart ?? localDate()} disabled={busy} />
      {date ? <Stack gap={space.xxs}>
        {plannedOnDay.length ? <Pressable hitSlop={space.sm} accessibilityRole="button" accessibilityState={{ expanded: overviewOpen }} accessibilityLabel={`Already planned for ${dateLabel(date)}`} onPress={() => setOverviewOpen(open => !open)}>
          <Row style={{ justifyContent: 'space-between' }}><Text role="body-strong">Already planned · {dateLabel(date)}</Text><Text muted>{overviewOpen ? '⌃' : '⌄'}</Text></Row>
        </Pressable> : null}
        {overviewOpen || !plannedOnDay.length ? <Stack gap={space.xs}>
          {plannedOnDay.length ? plannedOnDay.map(planned => {
            const existing = findRecipe(planned.recipeId);
            if (!existing) return null;
            return <Row key={planned.id} style={{ gap: space.xs }}>
              <RecipeImage recipe={existing} size={token('foundation.space.48')} compact />
              <Text role="body" style={{ flex: 1 }}>{recipePresentation[existing.id]?.title ?? existing.title}</Text>
            </Row>;
          }) : <Text role="small" muted>No meals planned for this day yet.</Text>}
        </Stack> : null}
      </Stack> : null}
      <Stepper bare label="Servings" value={servings} onChange={setServings} disabled={busy} />
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      <Button label={meal ? 'Save changes' : date ? `Add to ${dateLabel(date)}` : 'Choose a day to continue'} disabled={!date} onPress={() => void submit()} busy={busy} testID="confirm-add-to-plan" />
      <Button label="Cancel" variant="ghost" onPress={onClose} disabled={busy} />
    </Stack>}
  </Dialog>;
}
