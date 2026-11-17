import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Dialog, Field, Stack, Stepper, Text } from '@/components/ui';
import { AppScreen, InfoCard, SettingsRow } from '@/components/app-screen';
import { useApp } from '@/state/app-state';
import { localDate, money, nextDays } from '@/services/planning';
import { colors, space, token } from '@/theme';

export function PlanSetupScreen() {
  const { data, change, busy, error } = useApp();
  const [panel, setPanel] = useState<'week' | 'household' | 'meals' | 'budget' | null>(null);
  const [budget, setBudget] = useState(String(data.household.budgetMinor / 100));
  const [invalid, setInvalid] = useState('');
  const days = nextDays(7, new Date(`${data.planStart ?? localDate()}T12:00:00`));
  const weekLabel = `${days[0].label.split(', ').slice(1).join(', ')} – ${days[6].label.split(', ').slice(1).join(', ')}`;
  return <AppScreen title="Plan your week" subtitle="Choose what matters. You can adjust it later." navigation="plan"
    footer={<Button label="Find recipes" style={{ minHeight: token('component.button.height.default') }} onPress={() => router.push('/recipes')} />}>
    <Stack gap={space.sm}>
      <Text role="small">WEEK</Text><SettingsRow title={weekLabel} onPress={() => setPanel('week')} />
      <Text role="small">HOUSEHOLD</Text><SettingsRow title={`${data.household.size} people · standard portions`} onPress={() => setPanel('household')} />
      <Text role="small">MEALS TO PLAN</Text><SettingsRow title={`${data.household.mealTarget ?? 7} dinners · save leftovers for lunch`} onPress={() => setPanel('meals')} />
      <Text role="small">WEEKLY GROCERY BUDGET</Text><SettingsRow title={`Optional · ${money(data.household.budgetMinor)} estimate`} onPress={() => setPanel('budget')} />
      <InfoCard title="Your household comes first" description="Your household preferences shape the plan." />
    </Stack>
    <Dialog visible={panel !== null} title={panel === 'week' ? 'Choose your week' : panel === 'household' ? 'Household portions' : panel === 'meals' ? 'Meals to plan' : 'Weekly budget'} onClose={() => setPanel(null)}>
      {panel === 'week' ? [0, 7].map(offset => { const date = nextDays(8)[offset]; return <Button key={offset} label={`Start ${date.label}`} variant="secondary" disabled={busy} onPress={async () => { if (await change(d => ({ ...d, planStart: date.value }))) setPanel(null); }} />; }) : null}
      {panel === 'household' ? <Stepper label="People" value={data.household.size} disabled={busy} onChange={size => void change(d => ({ ...d, household: { ...d.household, size } }))} /> : null}
      {panel === 'meals' ? <Stepper label="Dinners" value={data.household.mealTarget ?? 7} max={7} disabled={busy} onChange={mealTarget => void change(d => ({ ...d, household: { ...d.household, mealTarget } }))} /> : null}
      {panel === 'budget' ? <><Field label="Weekly amount ($)" value={budget} onChangeText={setBudget} keyboardType="decimal-pad" error={invalid} /><Button label="Save budget" busy={busy} onPress={async () => {
        const amount = Number(budget); if (!Number.isFinite(amount) || amount < .01 || amount > 10000) { setInvalid('Enter an amount from $0.01 to $10,000.'); return; }
        if (await change(d => ({ ...d, household: { ...d.household, budgetMinor: Math.round(amount * 100) } }))) setPanel(null);
      }} /></> : null}
      {error ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text> : null}<Button label="Done" variant="secondary" onPress={() => setPanel(null)} />
    </Dialog>
  </AppScreen>;
}
