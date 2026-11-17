import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Stack, Text } from '@/components/ui';
import { BudgetBar, BudgetLegendItem, type BudgetKind } from '@/components/ui/budget-breakdown';
import { budgetBreakdown, money } from '@/services/planning';
import { space } from '@/theme';

/** Weekly budget summary: headline, segmented bar and a legend for the parts that apply (remaining or over, never both). */
export function WeeklyBudget({ spentMinor, plannedMinor, budgetMinor }: { spentMinor: number; plannedMinor: number; budgetMinor: number }) {
  const parts = budgetBreakdown(spentMinor, plannedMinor, budgetMinor);
  const kinds: BudgetKind[] = ['spent', 'planned', parts.overMinor > 0 ? 'over' : 'remaining'];
  const amount = (kind: BudgetKind) => ({ spent: parts.spentMinor, planned: parts.plannedMinor, remaining: parts.remainingMinor, over: parts.overMinor })[kind];
  const summary = budgetMinor <= 0 ? 'Set a weekly budget to track your spending.'
    : parts.overMinor > 0 ? `${money(parts.overMinor)} over your budget of ${money(budgetMinor)} this week`
    : `${money(parts.remainingMinor)} left to plan of your ${money(budgetMinor)} budget this week`;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Edit weekly budget. ${summary}`} onPress={() => router.push('/onboarding?edit=budget')}>
    <Stack gap={space.xs}>
      <Text role="section">Weekly budget</Text>
      <Text muted>{summary}</Text>
      {budgetMinor > 0 ? <>
        <BudgetBar segments={kinds.map(kind => ({ kind, amount: amount(kind) }))} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: space.sm, rowGap: space.sm, paddingTop: space.xxs }}>
          {kinds.map(kind => <View key={kind} style={{ flexBasis: '47%', flexGrow: 1, flexDirection: 'row' }}><BudgetLegendItem kind={kind} amount={money(amount(kind))} /></View>)}
        </View>
      </> : null}
    </Stack>
  </Pressable>;
}
