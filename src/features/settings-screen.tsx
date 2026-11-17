import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Dialog, Stack, Text } from '@/components/ui';
import { AppScreen, InfoCard, SettingsRow } from '@/components/app-screen';
import { useApp } from '@/state/app-state';
import { money } from '@/services/planning';
import { space } from '@/theme';

export function SettingsScreen() {
  return <AppScreen title="Your kitchen" subtitle="Preferences that make the plan yours." navigation="index">
    <Stack gap={space.sm}>
      <SettingsRow title="Household" description="Members, portions, and dietary needs" onPress={() => router.push('/household-details')} />
      <SettingsRow title="Allergies & dietary needs" description="Ingredients to avoid across your household" onPress={() => router.push('/onboarding?edit=avoid')} />
      <SettingsRow title="Food preferences" description="Ingredients and cuisines you enjoy" onPress={() => router.push('/onboarding?edit=dietary')} />
      <SettingsRow title="Nutrition goals" description="Optional guidance for your plan" onPress={() => router.push('/onboarding?edit=goals')} />
      <SettingsRow title="Weekly budget" description="Adjust your grocery estimate" onPress={() => router.push('/onboarding?edit=budget')} />
      <SettingsRow title="Review onboarding" description="Revisit every setup screen with your saved choices" onPress={() => router.push('/onboarding')} />
      <SettingsRow title="Account & settings" description="Sign in, privacy, and notifications" onPress={() => router.push('/account-settings')} />
    </Stack>

  </AppScreen>;
}
export function HouseholdScreen() {
  const { data } = useApp();
  return <AppScreen title="Your household" subtitle="One kitchen. A plan that works for everyone." navigation="index">
    <Stack gap={space.sm}><InfoCard title={data.household.name} description={`${data.household.size} people · ${data.household.dietaryPreference === 'Any' ? 'No eating preference' : data.household.dietaryPreference}`} />
      <SettingsRow title="Household name" description={data.household.name} onPress={() => router.push('/onboarding?edit=true')} />
      <SettingsRow title="Portions" description={`${data.household.size} people · ${data.household.portionSize ?? 'Standard'} portions`} onPress={() => router.push('/onboarding?edit=portions')} />
      <SettingsRow title="Ingredients to avoid" description={data.household.avoidedIngredients?.join(', ') || 'None selected'} onPress={() => router.push('/onboarding?edit=avoid')} />
      <SettingsRow title="Eating preference" description={data.household.dietaryPreference} onPress={() => router.push('/onboarding?edit=dietary')} />
      <SettingsRow title="Weekly budget" description={money(data.household.budgetMinor)} onPress={() => router.push('/onboarding?edit=budget')} />
    </Stack>
  </AppScreen>;
}
export function AccountSettingsScreen() {
  const { reset, busy, error } = useApp();
  const [panel, setPanel] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  return <AppScreen title="Account & settings" subtitle="Your information, on your terms." navigation="index">
    <Stack gap={space.sm}>
      <SettingsRow title="Account" description="Sign in to keep your kitchen across devices" onPress={() => setPanel('Account')} />
      <SettingsRow title="Household access" description="Manage who can view and edit shared lists" onPress={() => router.push('/household-details')} />
      <SettingsRow title="Reminders" description="Choose if and when we remind you" onPress={() => setPanel('Reminders')} />
      <SettingsRow title="Privacy & data" description="Sharing and account controls" onPress={() => setPanel('Privacy & data')} />
      <SettingsRow title="Help" description="Connection and import troubleshooting" onPress={() => setPanel('Help')} />
    </Stack>
    <Dialog title={panel ?? ''} visible={panel !== null} onClose={() => setPanel(null)}>
      <Text>{panel === 'Account' ? 'This prototype saves your kitchen on this device. Account sign-in and cloud sync are not connected yet.' : panel === 'Reminders' ? 'Notification scheduling is not connected in this local prototype.' : panel === 'Privacy & data' ? 'Your plan, pantry, and household are stored locally on this device.' : 'Restart Expo with npm start -- --clear if routes or fonts have not refreshed.'}</Text>
      {panel === 'Help' ? <Button label="Open component library" variant="secondary" onPress={() => { setPanel(null); router.push('/design-system'); }} /> : null}
      {panel === 'Privacy & data' ? <Button label="Reset demo data" variant="secondary" onPress={() => { setPanel(null); setConfirmReset(true); }} /> : null}
      <Button label="Done" onPress={() => setPanel(null)} />
    </Dialog>
    <Dialog visible={confirmReset} title="Start fresh?" onClose={() => setConfirmReset(false)}><Text>Your local demo changes will be replaced with the starter data.</Text>{error ? <Text accessibilityRole="alert">{error}</Text> : null}<Button label="Reset demo" busy={busy} onPress={async () => { if (await reset()) { setConfirmReset(false); router.replace('/onboarding'); } }} /><Button label="Keep my data" variant="secondary" disabled={busy} onPress={() => setConfirmReset(false)} /></Dialog>
  </AppScreen>;
}
