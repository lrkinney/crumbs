import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { Stack, Text } from '@/components/ui';
import { BudgetMeter } from '@/components/ui/budget-meter';
import { money } from '@/services/planning';
import { space } from '@/theme';

export function WeeklyBudget({ spentMinor, budgetMinor }: { spentMinor: number; budgetMinor: number }) {
  const left = budgetMinor - spentMinor;
  return <Pressable accessibilityRole="button" accessibilityLabel="Edit weekly budget" onPress={() => router.push('/onboarding?edit=budget')}>
    <Stack gap={space.xs}>
      <Text role="section">Weekly budget</Text>
      <Text muted>{budgetMinor <= 0 ? 'Set a weekly budget to track your spending.' : left >= 0 ? `${money(left)} left of ${money(budgetMinor)} this week` : `${money(-left)} over your ${money(budgetMinor)} budget`}</Text>
      <BudgetMeter spentMinor={spentMinor} budgetMinor={budgetMinor} />
      <Text role="small" muted>Estimated from the meals planned this week.</Text>
    </Stack>
  </Pressable>;
}
