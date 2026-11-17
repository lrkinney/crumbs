import { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Button, Chip, Field, IconButton, Row, Screen, Stack, Stepper, Text } from '@/components/ui';
import { ChoiceCard } from '@/components/choice-card';
import { InfoCard, SettingsRow } from '@/components/app-screen';
import { recipeImages } from '@/features/recipes/recipe-card';
import { ingredientCatalog } from '@/fixtures/recipes';
import { useApp } from '@/state/app-state';
import type { Household } from '@/models/domain';
import { money } from '@/services/planning';
import { avoidanceGroups, commitOnboarding, nextOnboardingStep, nutritionGoals, onboardingProgress, pantryStarters, type OnboardingStep } from '@/services/onboarding';
import { ingredientQuantity, inputUnits, toStoredQuantity, type InputUnit } from '@/services/quantities';
import { colors, radius, space, token } from '@/theme';
import { FoodAutocompleteField } from '@/components/food-autocomplete-field';
import { pantrySuggestions } from '@/services/pantry-suggestions';

const copy: Record<Exclude<OnboardingStep, 'welcome'>, { title: string; description: string; primary: string; secondary?: string }> = {
  profile: { title: 'What should we\ncall you?', description: 'A name makes your plan feel like yours.', primary: 'Continue', secondary: 'Skip for now' },
  avoid: { title: 'Any ingredients\nto avoid?', description: 'Select any that apply, or continue with none.', primary: 'Save and continue', secondary: 'No allergies or restrictions' },
  dietary: { title: 'How do you\nlike to eat?', description: 'Choose one eating preference.', primary: 'Continue', secondary: 'Skip preferences' },
  goals: { title: 'What matters\non your plate?', description: 'Choose any goals that fit your routine.', primary: 'Continue', secondary: 'Skip for now' },
  targets: { title: 'Your own\nnutrition targets.', description: 'Add targets you already use. Both fields are optional.', primary: 'Save targets', secondary: 'Leave targets blank' },
  pantry: { title: 'What’s already\nin your kitchen?', description: 'Start with a few items. We’ll use them to reduce repeat buys.', primary: 'Save pantry and continue', secondary: 'Add pantry items later' },
  budget: { title: 'What’s your\nweekly budget?', description: 'Set a grocery budget for everyone in this plan.', primary: 'Save budget', secondary: 'Set a budget later' },
  portions: { title: 'Who are you\ncooking for?', description: 'We’ll scale ingredients to your household and appetite.', primary: 'Save portions', secondary: 'Use default portions' },
  household: { title: 'Plan better,\ntogether.', description: 'Set up your household now, or keep planning on your own.', primary: 'Set up household', secondary: 'Continue on my own' },
  review: { title: 'Your kitchen,\nyour way.', description: 'Review your setup. Tap a row to make a change.', primary: 'Finish setup' },
  account: { title: 'Keep your\nhousehold in sync.', description: 'Account sign-in isn’t connected yet. You can preview household setup.', primary: 'Continue to invitation', secondary: 'Continue without an account' },
  invite: { title: 'Who’s joining\nyour table?', description: 'Save an invitation draft for a partner, family member or housemate.', primary: 'Save invitation draft', secondary: 'Invite someone later' },
  invitation: { title: 'Your invitation\nis drafted.', description: 'Saved with your setup on this device. It hasn’t been sent.', primary: 'Review my setup' },
};
const toggle = (items: string[], value: string) => items.includes(value) ? items.filter(item => item !== value) : [...items, value];
const emailValid = (value: string) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
function initialStep(editing?: string): OnboardingStep {
  if (editing === 'dietary' || editing === 'budget' || editing === 'portions' || editing === 'avoid' || editing === 'goals' || editing === 'pantry') return editing;
  return editing ? 'profile' : 'welcome';
}

export function OnboardingScreen({ editing }: { editing?: string }) {
  const { data, change, busy, error: saveError } = useApp();
  const [step, setStep] = useState<OnboardingStep>(() => initialStep(editing));
  const [history, setHistory] = useState<OnboardingStep[]>([]);
  const [reviewEditing, setReviewEditing] = useState(false);
  const [name, setName] = useState(data.household.name);
  const [size, setSize] = useState(data.household.size);
  const [budget, setBudget] = useState(String(data.household.budgetMinor / 100));
  const [preference, setPreference] = useState<Household['dietaryPreference']>(data.household.dietaryPreference);
  const [portion, setPortion] = useState<NonNullable<Household['portionSize']>>(data.household.portionSize ?? 'Standard');
  const [avoided, setAvoided] = useState(data.household.avoidedIngredients ?? []);
  const [otherAvoided, setOtherAvoided] = useState('');
  const [goals, setGoals] = useState(data.household.nutritionGoals ?? []);
  const [calories, setCalories] = useState(String(data.household.nutritionTargets?.calories ?? ''));
  const [protein, setProtein] = useState(String(data.household.nutritionTargets?.protein ?? ''));
  const [pantry, setPantry] = useState(data.pantry);
  const [food, setFood] = useState('');
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState<InputUnit>('each');
  const [accountEmail, setAccountEmail] = useState(data.household.accountEmailDraft ?? '');
  const [accountDraft, setAccountDraft] = useState(data.household.accountEmailDraft);
  const [invitationDraft, setInvitationDraft] = useState(data.household.invitationEmailDraft);
  const [password, setPassword] = useState('');
  const [inviteEmail, setInviteEmail] = useState(data.household.invitationEmailDraft ?? '');
  const [error, setError] = useState('');
  const allAvoided = [...new Set([...avoided, ...otherAvoided.split(',').map(s => s.trim()).filter(Boolean)])];
  function go(target: OnboardingStep) { setError(''); setHistory(h => [...h, step]); setStep(target); }
  function back() {
    setError('');
    if (step === 'account') setPassword('');
    if (editing && step !== 'targets') { if (router.canGoBack()) router.back(); else router.replace('/household'); return; }
    if (history.length) { setStep(history[history.length - 1]); setHistory(h => h.slice(0, -1)); }
    if (reviewEditing && history[history.length - 1] === 'review') setReviewEditing(false);
  }
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 'welcome') return false;
      back(); return true;
    });
    return () => subscription.remove();
  });
  function validate() {
    if ((step === 'profile' || step === 'review') && (!name.trim() || name.trim().length > 60)) return 'Add a name with up to 60 characters.';
    if ((step === 'budget' || step === 'review') && (!Number.isFinite(Number(budget)) || Number(budget) < .01 || Number(budget) > 10000)) return 'Enter a weekly budget between $0.01 and $10,000.';
    if ((step === 'targets' || step === 'review') && [calories, protein].some(s => s.trim() && (!Number.isFinite(Number(s)) || Number(s) <= 0))) return 'Use positive numbers for your targets, or leave them blank.';
    if ((step === 'avoid' || step === 'review') && allAvoided.some(s => s.length > 100)) return 'Keep each ingredient name under 100 characters.';
    if (step === 'account' && accountEmail && !emailValid(accountEmail.trim())) return 'Enter a valid email address, or leave it blank to preview.';
    if (step === 'invite' && !emailValid(inviteEmail.trim())) return 'Enter a valid email address for your invitation draft.';
    if (step === 'pantry' && food.trim()) return 'Tap Add food to save this item, or clear the food field to continue.';
    return '';
  }
  async function save(complete: boolean) {
    const message = validate(); if (message) { setError(message); return; }
    const household: Household = { ...data.household, name: name.trim(), size, budgetMinor: Math.round(Number(budget) * 100), dietaryPreference: preference, portionSize: portion,
      avoidedIngredients: allAvoided, nutritionGoals: goals,
      nutritionTargets: { ...(calories.trim() ? { calories: Number(calories) } : {}), ...(protein.trim() ? { protein: Number(protein) } : {}) },
      accountEmailDraft: accountDraft, invitationEmailDraft: invitationDraft };
    if (await change(d => commitOnboarding(d, { household, pantry }, complete))) router.replace(editing ? '/household' : '/');
  }
  function advance(skip = false) {
    if (busy) return;
    if (!skip) { const message = validate(); if (message) { setError(message); return; } }
    if (step === 'review') { void save(true); return; }
    if (skip) {
      if (step === 'profile') setName(data.household.name);
      if (step === 'avoid') { setAvoided([]); setOtherAvoided(''); }
      if (step === 'dietary') setPreference('Any');
      if (step === 'goals') setGoals([]);
      if (step === 'targets') { setCalories(''); setProtein(''); }
      if (step === 'pantry') { setPantry(data.pantry); setFood(''); }
      if (step === 'budget') setBudget(String(data.household.budgetMinor / 100));
      if (step === 'portions') { setSize(data.household.size); setPortion(data.household.portionSize ?? 'Standard'); }
    }
    if (step === 'targets') { back(); return; }
    if (editing) { void save(false); return; }
    if (reviewEditing && step !== 'household' && step !== 'account' && step !== 'invite') { setReviewEditing(false); go('review'); return; }
    if (step === 'household' && !skip) { go('account'); return; }
    if ((step === 'household' || step === 'account' || step === 'invite') && skip) {
      if (step === 'account') { setAccountEmail(data.household.accountEmailDraft ?? ''); setPassword(''); }
      if (step === 'invite') setInviteEmail(data.household.invitationEmailDraft ?? '');
      setReviewEditing(false); go('review'); return;
    }
    if (step === 'account') { setAccountDraft(accountEmail.trim() || undefined); setPassword(''); }
    if (step === 'invite') setInvitationDraft(inviteEmail.trim());
    go(nextOnboardingStep(step));
  }
  function edit(target: OnboardingStep) { setReviewEditing(true); go(target); }
  function addFood() {
    if (!food.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0) { setError('Add a food name and a positive amount.'); return; }
    const known = pantrySuggestions.find(i => [i.label.toLowerCase(), i.foodId].includes(food.trim().toLowerCase()));
    const foodId = known?.foodId ?? food.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const measured = toStoredQuantity(Number(amount), unit);
    const existing = pantry.find(i => i.foodId === foodId && i.unit === measured.unit);
    setPantry(items => existing ? items.map(i => i.id === existing.id ? { ...i, amount: i.amount + measured.amount } : i) : [...items, { id: `onboarding-${Date.now()}`, foodId, label: food.trim(), ...measured, aisle: known?.aisle ?? 'Other', storage: 'cupboard' }]);
    setFood(''); setAmount('1'); setError('');
  }
  const footerStyle = { paddingTop: 0, paddingBottom: space.lg, gap: 0 };
  const ghostStyle = { minHeight: token('foundation.space.48') - space.xxs };
  if (step === 'welcome') return <Screen contentStyle={{ paddingTop: token('foundation.space.40') }} footerContentStyle={footerStyle}
    footer={<><Button label="Get started" onPress={() => go('profile')} /><Button label="Set up later" variant="ghost" style={ghostStyle} busy={busy} onPress={() => void save(true)} /></>}>
    <Text role="section">CRUMBS</Text>
    <View style={{ width: '100%', aspectRatio: 362 / 244 }}>
      <Image source={recipeImages.chicken} contentFit="contain" style={{ position: 'absolute', width: '57%', aspectRatio: 1, left: '27%', top: 0 }} />
      <Image source={recipeImages.ratatouille} contentFit="contain" style={{ position: 'absolute', width: '41.4%', aspectRatio: 1, left: 0, top: '42.2%' }} />
      <Image source={recipeImages.tofu} contentFit="contain" style={{ position: 'absolute', width: '38.7%', aspectRatio: 1, right: 0, top: '48%' }} />
    </View>
    <Stack gap={space.xs}><Text role="display" accessibilityRole="header">Good food.{'\n'}Fewer crumbs.</Text><Text muted>Spend less, save time and make the most of what’s already in your kitchen.</Text></Stack>
    <InfoCard emphasized largeTitle title="Make CRUMBS yours" description="A few small steps for food preferences, your budget and your household. Skip anything you don’t need." />
    {saveError ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{saveError}</Text> : null}
  </Screen>;
  const current = copy[step];
  const progress = onboardingProgress(step);
  return <Screen key={step} contentStyle={{ paddingTop: token('foundation.space.28') }} footerContentStyle={footerStyle}
    footer={<><Button label={editing && step !== 'targets' ? 'Save changes' : reviewEditing && !['review', 'targets', 'household', 'account', 'invite', 'invitation'].includes(step) ? 'Save and review' : current.primary} busy={busy} onPress={() => advance()} />{current.secondary && !editing && !reviewEditing ? <Button label={current.secondary} variant="ghost" style={ghostStyle} disabled={busy} onPress={() => advance(true)} /> : null}</>}>
    <Stack gap={space.sm}><Row style={{ justifyContent: 'space-between' }}><IconButton name="back" label="Go back" disabled={busy} onPress={back} /><Text role="small" muted>{editing ? 'Your kitchen' : `${progress} of 8`}</Text></Row>
      <View accessibilityRole="progressbar" accessibilityLabel="Your kitchen setup" accessibilityValue={{ min: 0, max: 8, now: progress }} style={{ flexDirection: 'row', gap: space.xxs }}>{Array.from({ length: 8 }, (_, i) => <View key={i} style={{ height: space.xxs, flex: 1, borderRadius: token('foundation.radius.2'), backgroundColor: i < progress ? colors.brand : colors.border }} />)}</View>
    </Stack>
    <Stack gap={space.xs}><Text role="display" accessibilityRole="header">{current.title}</Text><Text muted>{current.description}</Text></Stack>
    {step === 'profile' ? <Stack gap={space.sm}><Field label="Your name" value={name} onChangeText={setName} maxLength={60} autoComplete="given-name" /><Text muted>A little planning. More room for life.</Text><InfoCard emphasized largeTitle title="A little setup. A lot less stress." description="Choose what matters to you. You can skip optional steps and change them later." /></Stack> : null}
    {step === 'avoid' ? <Stack gap={space.md}>{avoidanceGroups.map(group => <Stack key={group.title} gap={space.sm}><Text role="label">{group.title}</Text>{group.items.map(([title, description]) => <ChoiceCard key={title} multiple title={title} description={description} selected={avoided.includes(title)} onPress={() => setAvoided(items => toggle(items, title))} />)}</Stack>)}
      {avoided.filter(value => !avoidanceGroups.some(group => group.items.some(([title]) => title === value))).map(value => <ChoiceCard key={value} multiple title={value} selected onPress={() => setAvoided(items => toggle(items, value))} />)}
      <Field label="Another ingredient to avoid" value={otherAvoided} onChangeText={setOtherAvoided} placeholder="Separate ingredients with commas" maxLength={500} />
    </Stack> : null}
    {step === 'dietary' ? <Stack gap={space.sm}>{([
      ['Any', 'No preference', 'Keep all recipe options open'], ['Vegetarian', 'Vegetarian', 'No meat or fish'], ['Vegan', 'Vegan', 'Plant based recipes'], ['Pescatarian', 'Pescatarian', 'Fish and plant based recipes'],
    ] as const).map(([value, title, help]) => <ChoiceCard key={value} title={title} description={help} selected={preference === value} onPress={() => setPreference(value)} />)}</Stack> : null}
    {step === 'goals' ? <Stack gap={space.sm}>{nutritionGoals.map(([title, description]) => <ChoiceCard key={title} multiple title={title} description={description} selected={goals.includes(title)} onPress={() => setGoals(items => toggle(items, title))} />)}<Button label="Set optional nutrition targets" variant="ghost" onPress={() => go('targets')} />{calories || protein ? <Text muted>{[calories && `${calories} kcal`, protein && `${protein} g protein`].filter(Boolean).join(' · ')} per day</Text> : null}</Stack> : null}
    {step === 'targets' ? <Stack><Field label="Daily calories (kcal)" value={calories} onChangeText={setCalories} keyboardType="decimal-pad" /><Field label="Daily protein (g)" value={protein} onChangeText={setProtein} keyboardType="decimal-pad" /><Text muted>You can browse recipes without setting targets.</Text></Stack> : null}
    {step === 'pantry' ? <Stack gap={space.sm}>{pantryStarters.map(item => {
      const selected = pantry.find(p => p.foodId === item.foodId);
      return <ChoiceCard key={item.foodId} multiple title={item.foodId === 'chicken' ? 'Chicken' : item.label} description={selected ? `${ingredientQuantity(selected, 'pantry')} · ${selected.storage}` : `${ingredientQuantity(item, 'pantry')} · ${item.storage}`} selected={!!selected} onPress={() => setPantry(items => selected ? items.filter(p => p.foodId !== item.foodId) : [...items, { ...item }])} />;
    })}{pantry.filter(item => !pantryStarters.some(p => p.foodId === item.foodId)).map(item => <ChoiceCard key={item.id} multiple title={item.label} description={ingredientQuantity(item, 'pantry')} selected onPress={() => setPantry(items => items.filter(p => p.id !== item.id))} />)}
      <FoodAutocompleteField label="Add another food" value={food} onChangeText={value => { setFood(value); const known = pantrySuggestions.find(i => i.label.toLowerCase() === value.trim().toLowerCase()); setUnit(known ? inputUnits(known)[0] : 'each'); }} suggestions={pantrySuggestions} onSelect={item => {
        setFood(item.label);
        const known = pantrySuggestions.find(i => i.foodId === item.foodId);
        if (known) setUnit(inputUnits(known)[0]);
      }} placeholder="Type any food or ingredient" /><Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      <Row style={{ flexWrap: 'wrap' }}>{inputUnits(ingredientCatalog.find(i => [i.label.toLowerCase(), i.foodId].includes(food.trim().toLowerCase()))).map(value => <Chip key={value} label={value} selected={unit === value} onPress={() => setUnit(value)} />)}</Row><Text role="small" muted>New foods are added to your cupboard. You can change storage in Pantry.</Text><Button label="Add food" onPress={addFood} />
    </Stack> : null}
    {step === 'budget' ? <Stack gap={space.sm}>{[[50, 'Keep grocery costs low'], [75, 'A little more flexibility'], [100, 'More room for your household']].map(([value, help]) => <ChoiceCard key={value} title={`$${value} / week`} description={String(help)} selected={Number(budget) === value} onPress={() => setBudget(String(value))} />)}<Field label="Or enter a weekly amount ($)" value={budget} onChangeText={setBudget} keyboardType="decimal-pad" /><Text muted>Recipe prices are estimates. Your budget can be changed anytime.</Text></Stack> : null}
    {step === 'portions' ? <Stack gap={space.md}><Stack style={{ backgroundColor: colors.subtle, borderRadius: radius.card, padding: space.md }}><Stepper label="People per meal" value={size} onChange={setSize} /></Stack>
      <Text role="label">Usual portion size</Text>{([['Light', 'Smaller servings'], ['Standard', 'Regular servings'], ['Hearty', 'Larger servings']] as const).map(([value, help]) => <ChoiceCard key={value} title={value} description={help} selected={portion === value} onPress={() => setPortion(value)} />)}
    </Stack> : null}
    {step === 'household' ? <Stack><InfoCard emphasized largeTitle title="One plan. Everyone in sync." description="Share recipe choices, pantry items and a grocery budget with your household." /><Field label="Household status" editable={false} value={invitationDraft ? `Invitation draft: ${invitationDraft}` : 'Just me'} /><Text muted>Sharing isn’t connected yet. Household setup saves a local draft.</Text></Stack> : null}
    {step === 'account' ? <Stack><Field label="Email address" value={accountEmail} onChangeText={setAccountEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" /><Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" /><Text muted>No account will be created. Your password is never saved.</Text></Stack> : null}
    {step === 'invite' ? <Stack><Field label="Their email address" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" /><InfoCard emphasized title="Keep their place at the table." description="Save their email for later. Invitations and shared plans aren’t connected yet." /></Stack> : null}
    {step === 'invitation' ? <Stack><InfoCard emphasized title="Invitation draft for" description={inviteEmail} /><Text muted>You can start planning now. Finish setup to keep this draft on your device.</Text></Stack> : null}
    {step === 'review' ? <Stack gap={space.sm}><SettingsRow title="Name" value={name} onPress={() => edit('profile')} /><SettingsRow title="Ingredients to avoid" value={allAvoided.join(', ') || 'None selected'} onPress={() => edit('avoid')} /><SettingsRow title="Diet" value={preference === 'Any' ? 'No preference' : preference} onPress={() => edit('dietary')} /><SettingsRow title="Goals" value={goals.join(', ') || 'No goals selected'} onPress={() => edit('goals')} /><SettingsRow title="Nutrition targets" value={[calories && `${calories} kcal`, protein && `${protein} g protein`].filter(Boolean).join(' · ') || 'Not set'} onPress={() => edit('targets')} /><SettingsRow title="Pantry" value={`${pantry.length} ${pantry.length === 1 ? 'item' : 'items'} added`} onPress={() => edit('pantry')} /><SettingsRow title="Budget" value={money(Number(budget) * 100)} onPress={() => edit('budget')} /><SettingsRow title="Portions" value={`${size} ${size === 1 ? 'person' : 'people'} · ${portion}`} onPress={() => edit('portions')} /><SettingsRow title="Household" value={invitationDraft ? `Invitation draft: ${invitationDraft}` : 'Just me'} onPress={() => edit('household')} /></Stack> : null}
    {error || saveError ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{error || saveError}</Text> : null}
  </Screen>;
}
