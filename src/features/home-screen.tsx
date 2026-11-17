import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Stack, Text } from '@/components/ui';
import { AppScreen, SettingsRow } from '@/components/app-screen';
import { PlanCalendar } from '@/features/planning/plan-calendar';
import { DayPlan } from '@/features/home/day-plan';
import { WeeklyBudget } from '@/features/home/weekly-budget';
import { useApp } from '@/state/app-state';
import { dayHeading, localDate, weekSpendMinor } from '@/services/planning';
import { colors, space, token } from '@/theme';

export function HomeScreen() {
  const { data } = useApp();
  const today = localDate();
  const [date, setDate] = useState(today);
  const planned = data.meals.filter(m => m.status === 'planned');
  const onDate = data.meals.filter(m => m.date === date);
  const budget = data.household.budgetMinor;
  const spent = weekSpendMinor(data, today);
  return <AppScreen title={dayHeading(date, today)} titleRole="section" back={false} bodyGap={space.xl}>
    <Stack gap={space.md}>
      <PlanCalendar date={date} onChange={setDate} weekOf={today} />
      <DayPlan date={date} today={today} meals={onDate} />
    </Stack>
    <WeeklyBudget spentMinor={spent} budgetMinor={budget} />
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
