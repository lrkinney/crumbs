import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Stack, Text } from '@/components/ui';
import { BudgetLegendItem, type BudgetKind } from '@/components/ui/budget-breakdown';
import { WeekChart, chartHeight, type WeekChartDay } from '@/components/ui/week-chart';
import { money, weekChartBars, type BudgetDay } from '@/services/planning';
import { space } from '@/theme';

const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const longDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

/** Weekly budget: headline, a bar per day (a day that goes over shrinks the days after it) and a legend. */
export function WeeklyBudget({ days, budgetMinor }: { days: BudgetDay[]; budgetMinor: number }) {
  const spent = days.reduce((sum, day) => sum + day.spentMinor, 0);
  const planned = days.reduce((sum, day) => sum + day.plannedMinor, 0);
  const over = days.reduce((sum, day) => sum + day.overMinor, 0);
  const total = spent + planned;
  const remaining = Math.max(0, budgetMinor - total);
  const summary = budgetMinor <= 0 ? 'Set a weekly budget to track your spending.'
    : total > budgetMinor ? `${money(total - budgetMinor)} over your budget of ${money(budgetMinor)} this week`
    : `${money(remaining)} left to plan of your ${money(budgetMinor)} budget this week`;
  const bars = weekChartBars(days, chartHeight);
  const chartDays: WeekChartDay[] = days.map((day, i) => {
    const date = new Date(`${day.date}T12:00:00`);
    const note = `${money(day.spentMinor)} spent, ${money(day.plannedMinor)} planned, ${money(day.allowanceMinor)} allowance${day.overMinor > 0 ? `, ${money(day.overMinor)} over` : ''}`;
    return { key: day.date, weekday: weekday.format(date), date: String(date.getDate()), label: `${longDate.format(date)}: ${note}`, ...bars[i] };
  });
  const legend: [BudgetKind, number][] = [['spent', spent], ['remaining', remaining], ['planned', planned], ...(over > 0 ? [['over', over] as [BudgetKind, number]] : [])];
  return <Pressable accessibilityRole="button" accessibilityLabel={`Edit weekly budget. ${summary}`} onPress={() => router.push('/onboarding?edit=budget')}>
    <Stack gap={space.xs}>
      <Text role="section">Weekly budget</Text>
      <Text muted>{summary}</Text>
      {budgetMinor > 0 ? <>
        <View style={{ paddingTop: space.xs }}><WeekChart days={chartDays} /></View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: space.sm, rowGap: space.sm, paddingTop: space.xxs }}>
          {legend.map(([kind, amount]) => <View key={kind} style={{ flexBasis: '47%', flexGrow: 1, flexDirection: 'row' }}><BudgetLegendItem kind={kind} amount={money(amount)} /></View>)}
        </View>
      </> : null}
    </Stack>
  </Pressable>;
}
