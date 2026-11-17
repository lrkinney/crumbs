import { PlanCalendar } from './plan-calendar';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Dialog, Icon, Row, Stack, Text } from '@/components/ui';
import { AppScreen, FeatureRow } from '@/components/app-screen';
import { findRecipe } from '@/fixtures/recipes';
import { recipePresentation } from '@/fixtures/recipe-presentation';
import type { Meal } from '@/models/domain';
import { useApp } from '@/state/app-state';
import { localDate } from '@/services/planning';
import { AddToPlan } from './add-to-plan';
import { recipeImages, recipePlaceholder } from '@/features/recipes/recipe-card';
import { colors, space, token } from '@/theme';

export function PlanScreen() {
  const { data, change, busy, error } = useApp();
  const { date: requestedDate } = useLocalSearchParams<{ date?: string }>();
  const [editing, setEditing] = useState<Meal | null>(null);
  const [removing, setRemoving] = useState<Meal | null>(null);
  const [menuMeal, setMenuMeal] = useState<Meal | null>(null);
  const [moveDate, setMoveDate] = useState('');
  const [date, setDate] = useState(data.planStart ?? localDate());
  useEffect(() => { setDate(requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : data.planStart ?? localDate()); }, [data.planStart, requestedDate]);
  const editingRecipe = editing ? findRecipe(editing.recipeId) : undefined;
  if (!data.meals.length) return <AppScreen title="Plan" subtitle="A little planning. More time for you." back={false} largeTitle bodyGap={space.lg}>
    <Card style={{ backgroundColor: colors.subtle, padding: space.gutter, gap: space.gutter }}>
      <Row><Icon name="planSelected" color={colors.brand} /><Text role="label">This week</Text></Row>
      <Stack gap={space.xs}><Text role="section">Your next plan starts here</Text><Text muted>Pick meals you’ll enjoy. Share ingredients, use what you have and keep groceries within your budget.</Text></Stack>
      <Button label="Create a plan" style={{ minHeight: token('component.button.height.large') }} onPress={() => router.push('/plan-setup')} />
    </Card>
    <Stack gap={space.md}><Text role="section">Make your week go further</Text>
      <FeatureRow icon="dollar" title="Keep groceries on budget" description="Choose recipes around your budget and optional local sales." />
      <FeatureRow icon="pantry" title="Use more of what you have" description="Share ingredients across meals to save prep and reduce waste." />
      <FeatureRow icon="cook" title="Keep meals varied" description="Mix familiar favourites with something new this week." />
    </Stack>
  </AppScreen>;
  const onDate = data.meals.filter(m => m.date === date);
  return <AppScreen title="Current Plan" largeTitle back={false} bodyGap={space.md}>
    <PlanCalendar date={date} onChange={setDate} weekOf={date} />
    <Stack gap={space.lg} style={{ paddingTop: space.xl }}>
      {onDate.length ? onDate.map(meal => { const r = findRecipe(meal.recipeId); if (!r) return null;
        return <Pressable key={meal.id} accessibilityRole="button" accessibilityLabel={`Options for ${r.title}`} onPress={() => { setMenuMeal(meal); setMoveDate(meal.date); }}>
          <Row style={{ gap: space.gutter }}><Image source={r.image ? recipeImages[r.image] : recipePlaceholder} contentFit="contain" style={{ width: token('component.screen.action-bar-height'), aspectRatio: 1 }} />
            <Stack gap={space.xxs} style={{ flex: 1 }}><Text role="body-strong">{recipePresentation[r.id]?.title ?? r.title}</Text><Text role="small" muted>{r.minutes} min · {meal.servings} servings</Text><Text role="small" muted>{meal.status === 'cooked' ? 'Cooked' : 'Dinner'}</Text></Stack>
          </Row>
        </Pressable>;
      }) : <Stack><Text role="section">Your next plan starts here</Text><Text muted>Choose your first recipe to start a plan. Shared ingredients will help you decide what to add next.</Text></Stack>}
      <Stack gap={space.md}>
        <Button label="Browse recipes" onPress={() => router.push('/recipes')} />
        <Button label="Review week & groceries" onPress={() => router.navigate('/shop')} />
      </Stack>
    </Stack>
    <Dialog visible={!!menuMeal} title={menuMeal ? recipePresentation[menuMeal.recipeId]?.title ?? findRecipe(menuMeal.recipeId)?.title ?? 'Meal options' : 'Meal options'} onClose={() => setMenuMeal(null)}>
      {menuMeal ? <Stack gap={space.xs}>
        <Text role="body-strong">Move to another day</Text>
        <PlanCalendar date={moveDate} onChange={setMoveDate} weekOf={moveDate || menuMeal.date} disabled={busy} />
        <Stack gap={space.xs} style={{ paddingTop: space.xs }}>
        <Button label={moveDate === menuMeal.date ? 'Choose another day' : `Move to ${new Date(`${moveDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`} disabled={busy || !moveDate || moveDate === menuMeal.date} onPress={async () => { if (await change(current => ({ ...current, meals: current.meals.map(m => m.id === menuMeal.id ? { ...m, date: moveDate } : m) }))) { setDate(moveDate); setMenuMeal(null); } }} />
        <Button label="Open recipe" variant="secondary" onPress={() => { const id = menuMeal.recipeId; setMenuMeal(null); router.push({ pathname: '/recipes/[id]', params: { id } }); }} />
        {menuMeal.status === 'planned' ? <Button label="Cook" variant="secondary" onPress={() => { const id = menuMeal.id; setMenuMeal(null); router.push({ pathname: '/cook/[mealId]', params: { mealId: id } }); }} /> : <Text role="small" muted>This meal is already cooked.</Text>}
        <Button label="Cancel" variant="ghost" onPress={() => setMenuMeal(null)} />
        </Stack>
      </Stack> : null}
    </Dialog>
    {editing && editingRecipe ? <AddToPlan recipe={editingRecipe} meal={editing} onClose={() => setEditing(null)} /> : null}
    <Dialog visible={!!removing} title="Remove this meal?" onClose={() => setRemoving(null)}><Text>Your shopping list will update to match.</Text>{error ? <Text accessibilityRole="alert">{error}</Text> : null}
      <Button label="Remove meal" busy={busy} onPress={async () => { if (await change(d => ({ ...d, meals: d.meals.filter(m => m.id !== removing?.id) }))) setRemoving(null); }} /><Button label="Keep meal" variant="secondary" disabled={busy} onPress={() => setRemoving(null)} />
    </Dialog>
  </AppScreen>;
}
