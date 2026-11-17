import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Button, Row, Stack, Text } from '@/components/ui';
import { BudgetMeter } from '@/components/ui/budget-meter';
import { AppScreen, SettingsRow } from '@/components/app-screen';
import { PlanCalendar } from '@/features/planning/plan-calendar';
import { recipeImages, recipePlaceholder } from '@/features/recipes/recipe-card';
import { recipePresentation } from '@/fixtures/recipe-presentation';
import { findRecipe } from '@/fixtures/recipes';
import { useApp } from '@/state/app-state';
import { dateLabel, localDate, money, weekSpendMinor } from '@/services/planning';
import { colors, space, token } from '@/theme';

export function HomeScreen() {
  const { data } = useApp();
  const today = localDate();
  const [date, setDate] = useState(today);
  const planned = data.meals.filter(m => m.status === 'planned');
  const onDate = data.meals.filter(m => m.date === date);
  const budget = data.household.budgetMinor;
  const spent = weekSpendMinor(data, today);
  const left = budget - spent;
  return <AppScreen title="Home" largeTitle back={false} bodyGap={space.xl} subtitle={planned.length ? 'A little planning. More room for life.' : undefined}
    footer={planned.length ? <Button label="See your week" style={{ minHeight: token('component.button.height.default') }} onPress={() => router.navigate('/plan')} /> : undefined}>
    <Stack gap={space.md}>
      <PlanCalendar date={date} onChange={setDate} weekOf={today} />
      <Stack gap={space.lg} style={{ paddingTop: space.md }}>
        <Text role="section">{date === today ? 'Today' : dateLabel(date)}</Text>
        {onDate.length ? onDate.map(meal => { const r = findRecipe(meal.recipeId); if (!r) return null;
          return <Pressable key={meal.id} accessibilityRole="button" accessibilityLabel={`Open ${r.title}`} onPress={() => router.push({ pathname: '/recipes/[id]', params: { id: r.id } })}>
            <Row style={{ gap: space.gutter }}><Image source={r.image ? recipeImages[r.image] : recipePlaceholder} contentFit="contain" style={{ width: token('component.screen.action-bar-height'), aspectRatio: 1 }} />
              <Stack gap={space.xxs} style={{ flex: 1 }}><Text role="body-strong">{recipePresentation[r.id]?.title ?? r.title}</Text><Text role="small" muted>{r.minutes} min · {meal.servings} servings</Text>
                <Text role="small" muted>{meal.status === 'cooked' ? 'Cooked' : 'Planned'}</Text></Stack>
            </Row>
          </Pressable>;
        }) : <Stack gap={space.md}><Text muted>{date === today ? 'Nothing is planned for today yet.' : 'Nothing is planned for this day yet.'}</Text>
          <Button label="Browse recipes" variant="secondary" onPress={() => router.push('/recipes')} /></Stack>}
      </Stack>
    </Stack>
    <Pressable accessibilityRole="button" accessibilityLabel="Edit weekly budget" onPress={() => router.push('/onboarding?edit=budget')}>
      <Stack gap={space.xs}>
        <Text role="section">Weekly budget</Text>
        <Text muted>{budget <= 0 ? 'Set a weekly budget to track your spending.' : left >= 0 ? `${money(left)} left of ${money(budget)} this week` : `${money(-left)} over your ${money(budget)} budget`}</Text>
        <BudgetMeter spentMinor={spent} budgetMinor={budget} />
        <Text role="small" muted>Estimated from the meals planned this week.</Text>
      </Stack>
    </Pressable>
    {planned.length ? <Stack gap={space.sm}>
      <SettingsRow title="Your week is ready" description="Review meals and your grocery list" onPress={() => router.navigate('/plan')} />
      <SettingsRow title="Use it while it’s fresh" description={`${data.pantry[0]?.label ?? 'Your pantry'} · check what you have`} onPress={() => router.navigate('/pantry')} />
    </Stack> : <>
      <View style={{ marginHorizontal: -space.gutter, backgroundColor: colors.subtle, padding: space.gutter, paddingVertical: space.lg }}>
        <Stack gap={space.lg}><Stack gap={space.xs}><Text role="section">Getting started</Text><Text muted>It looks like you don’t have a plan created for this week yet, would you like to make one now?</Text></Stack>
          <Button label="Create a Plan" style={{ minHeight: token('component.button.height.large') }} onPress={() => router.push('/plan-setup')} /></Stack>
      </View>
      <Stack gap={space.xs}><Text role="section">Your kitchen setup</Text>
        <SettingsRow title="Portions" value={`${data.household.size} ${data.household.size === 1 ? 'person' : 'people'} · Standard portion`} style={{ paddingVertical: space.xs }} onPress={() => router.push('/onboarding?edit=portions')} />
      </Stack>
    </>}
  </AppScreen>;
}
