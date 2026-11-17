import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { FoodImage } from '@/components/food-image';
import { addSuggestedPantryItems, pantrySuggestions } from '@/services/pantry-suggestions';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Chip, Dialog, Field, Icon, Row, Stack, Text } from '@/components/ui';
import { AppScreen, InfoCard, SettingsRow } from '@/components/app-screen';
import { ingredientCatalog } from '@/fixtures/recipes';
import type { PantryItem } from '@/models/domain';
import { useApp } from '@/state/app-state';
import { dateLabel } from '@/services/planning';
import { colors, space, token } from '@/theme';
import { PantryFoodRow } from '@/components/pantry-food-row';
import { fraction, inputUnits, toInputQuantity, toStoredQuantity, type InputUnit } from '@/services/quantities';
import { groupPantryItems } from '@/services/pantry-presentation';
import { FoodAutocompleteField } from '@/components/food-autocomplete-field';

export function PantryScreen() {
  const { data } = useApp();
  const soon = [...data.pantry].filter(i => i.useBy).sort((a, b) => a.useBy!.localeCompare(b.useBy!))[0];
  const groups = groupPantryItems(data.pantry);
  return <AppScreen title="Pantry" subtitle="Know what you have. Use more of it."
    footer={<Button label="Add food" style={{ minHeight: token('component.button.height.default') }} onPress={() => router.push('/pantry-food')} />}>
    <Stack gap={space.lg}>
      {data.pantry.length ? <InfoCard emphasized title="Use soon" description={soon ? `${soon.label} · ${dateLabel(soon.useBy!)}` : 'Add use-by dates to keep food in view'} meta="Check freshness before cooking" /> : <InfoCard emphasized title="Your pantry starts here" description="Add what you have so your plan can make more of it." />}
    {groups.map(({ category, foods }) => <Stack key={category} gap={space.xs}>
      <Text role="body-strong" accessibilityRole="header">{category}</Text>
      {foods.map(item => <PantryFoodRow key={item.id} item={item} onPress={() => router.push({ pathname: '/pantry-food', params: { id: item.id } })} />)}
    </Stack>)}
    </Stack>
  </AppScreen>;
}
export function PantryFoodScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [manual, setManual] = useState(false);
  return id || manual ? <PantryFoodEditor /> : <PantryQuickAddScreen onManual={() => setManual(true)} />;
}
function PantryQuickAddScreen({ onManual }: { onManual: () => void }) {
  const { data, change, busy, error } = useApp();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const owned = new Set(data.pantry.map(item => item.foodId));
  const query = search.trim().toLowerCase();
  const visible = pantrySuggestions.filter(item => (query ? item.label.toLowerCase().includes(query) : item.recipeCount > 0))
    .sort((a, b) => Number(owned.has(a.foodId)) - Number(owned.has(b.foodId)) || Number(!a.label.toLowerCase().startsWith(query)) - Number(!b.label.toLowerCase().startsWith(query)) || b.recipeCount - a.recipeCount || a.label.localeCompare(b.label))
    .slice(0, query ? 40 : 100);
  const available = visible.filter(item => !owned.has(item.foodId));
  const allShownSelected = available.length > 0 && available.every(item => selected.includes(item.foodId));
  const count = selected.filter(id => !owned.has(id)).length;
  return <AppScreen title="Add food" subtitle="Pick what you have. Adjust quantities anytime." navigation="pantry"
    footer={<Stack gap={space.xs}><Button label={count ? `Add ${count} ${count === 1 ? 'ingredient' : 'ingredients'}` : 'Select ingredients to add'} disabled={!count} busy={busy}
      onPress={async () => { if (await change(d => addSuggestedPantryItems(d, selected))) router.replace('/pantry'); }} />
      <Button label="Add one with details" variant="secondary" disabled={busy} onPress={onManual} /></Stack>}>
    <Field label="Search recipe ingredients" placeholder="Search ingredients" value={search} onChangeText={setSearch} />
    <Stack gap={space.xs}><Text role="body-strong">{query ? 'Food suggestions' : 'Common in our recipes'}</Text><Text role="small" muted>Search suggestions include common generic foods. Suggested amounts are a starting point; you can change them in your pantry.</Text></Stack>
    {available.length ? <Button label={allShownSelected ? 'Clear shown' : 'Select all shown'} variant="secondary" disabled={busy} onPress={() => setSelected(current => allShownSelected ? current.filter(id => !available.some(item => item.foodId === id)) : [...new Set([...current, ...available.map(item => item.foodId)])])} /> : null}
    <Stack gap={space.xs}>{visible.map(item => {
      const checked = selected.includes(item.foodId);
      const exists = owned.has(item.foodId);
      return <Pressable key={item.foodId} accessibilityRole="checkbox" accessibilityLabel={`${item.label}, ${item.suggestedLabel}${exists ? ', already in pantry' : ''}`} accessibilityState={{ checked: checked && !exists, disabled: exists || busy }} disabled={exists || busy}
        onPress={() => setSelected(current => current.includes(item.foodId) ? current.filter(id => id !== item.foodId) : [...current, item.foodId])}
        style={{ paddingVertical: space.xs, opacity: exists ? token('component.control.opacity.disabled') : 1 }}>
        <Row><FoodImage foodId={item.foodId} /><Stack gap={space.xxs} style={{ flex: 1 }}><Text role="body-strong">{item.label}</Text><Text role="small" muted>{exists ? 'In your pantry' : item.suggestedLabel}</Text></Stack>{exists ? <Text role="small" muted>Added</Text> : <View accessible={false} style={{ width: token('component.icon.size.large'), height: token('component.icon.size.large'), borderWidth: token('foundation.border.1'), borderColor: colors.brand, borderRadius: space.xxs, alignItems: 'center', justifyContent: 'center' }}>{checked ? <Icon name="check" color={colors.brand} size={token('component.icon.size.default')} /> : null}</View>}</Row>
      </Pressable>;
    })}</Stack>
    {!visible.length ? <Text muted>No matching foods. Try another search.</Text> : null}
    <Text role="caption" muted>Food names based on USDA FoodData Central · public domain</Text>
    {error ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text> : null}
  </AppScreen>;
}
function PantryFoodEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, change, busy, error } = useApp();
  const item = data.pantry.find(p => p.id === id);
  const [foodName, setFoodName] = useState(item?.label ?? ingredientCatalog[0].label);
  const knownFood = pantrySuggestions.find(food => food.label.toLocaleLowerCase() === foodName.trim().toLocaleLowerCase());
  const foodId = item && item.label === foodName ? item.foodId : knownFood?.foodId ?? foodName.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const ingredient = item?.foodId === foodId ? item : { ...(knownFood ?? ingredientCatalog[0]), foodId, label: foodName.trim() || 'Food', aisle: knownFood?.aisle ?? 'Other' };
  const [amount, setAmount] = useState(() => toInputQuantity(item ?? ingredient).amount);
  const [inputUnit, setInputUnit] = useState<InputUnit>(() => toInputQuantity(item ?? ingredient).unit);
  const [storage, setStorage] = useState<PantryItem['storage']>(item?.storage ?? 'fridge');
  const [useBy, setUseBy] = useState(item?.useBy ?? '');
  const [panel, setPanel] = useState<'amount' | 'storage' | 'date' | 'remove' | 'scan' | null>(null);
  const [validation, setValidation] = useState('');
  async function save() {
    if (!foodName.trim()) { setValidation('Enter a food name.'); return; }
    const value = Number(amount);
    if (!amount.trim() || !Number.isFinite(value) || value <= 0 || value > 100000) { setValidation('Enter an amount greater than zero and no more than 100,000.'); setPanel('amount'); return; }
    if (useBy && (!/^\d{4}-\d{2}-\d{2}$/.test(useBy) || !Number.isFinite(new Date(`${useBy}T12:00:00`).getTime()) || new Date(`${useBy}T12:00:00Z`).toISOString().slice(0, 10) !== useBy)) { setValidation('Enter a valid date as YYYY-MM-DD, or leave it blank.'); setPanel('date'); return; }
    if (await change(d => {
      const original = item && item.foodId === foodId && toInputQuantity(item).amount === amount && toInputQuantity(item).unit === inputUnit;
      const measured = original ? { amount: item.amount, unit: item.unit } : toStoredQuantity(value, inputUnit);
      const next = { ...ingredient, foodId, label: foodName.trim(), ...measured, storage, useBy: useBy || undefined, id: item?.id ?? `pantry-${Date.now()}` };
      return { ...d, pantry: item ? d.pantry.map(p => p.id === item.id ? next : p) : [...d.pantry, next] };
    })) router.replace('/pantry');
  }
  return <AppScreen title={item ? 'Edit pantry food' : 'Add food'} subtitle={item ? 'Keep the amount and storage useful.' : 'A few details helps avoid buying it twice.'} navigation="pantry"
    footer={<Button label={item ? 'Save food' : 'Save to pantry'} style={{ minHeight: token('component.button.height.default') }} busy={busy} onPress={() => void save()} />}>
    <Stack gap={space.sm}>
      <FoodAutocompleteField label="Food" value={foodName} onChangeText={value => {
        setFoodName(value);
        setValidation('');
        if (!pantrySuggestions.some(option => option.label.toLocaleLowerCase() === value.trim().toLocaleLowerCase())) {
          setInputUnit('each'); setAmount('1'); setStorage('cupboard');
        }
      }} suggestions={pantrySuggestions} onSelect={food => {
        setFoodName(food.label);
        const selected = pantrySuggestions.find(option => option.foodId === food.foodId);
        if (selected) { setAmount(toInputQuantity(selected).amount); setInputUnit(toInputQuantity(selected).unit); setStorage(selected.storage); }
      }} />
      {validation && panel === null ? <Text role="small" accessibilityRole="alert" style={{ color: colors.error }}>{validation}</Text> : null}
      <Text role="small">QUANTITY</Text><SettingsRow title={`${fraction(Number(amount) || 0)} ${inputUnit === 'breast' ? `medium ${Number(amount) <= 1 ? 'breast' : 'breasts'}` : inputUnit}`}  onPress={() => { setValidation(''); setPanel('amount'); }} />
      <Text role="small">STORAGE</Text><SettingsRow title={storage[0].toUpperCase() + storage.slice(1)} onPress={() => setPanel('storage')} />
      <Text role="small">USE-BY DATE · OPTIONAL</Text><SettingsRow title={useBy ? dateLabel(useBy) : 'Add a date'} onPress={() => { setValidation(''); setPanel('date'); }} />
      <Button label={item ? 'Remove food' : 'Scan food or a receipt instead'} variant="secondary" onPress={() => setPanel(item ? 'remove' : 'scan')} />
      <Text role="small">Use the date on the package. Freshness reminders are a guide; check your food before cooking.</Text>
      {error ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text> : null}
    </Stack>
    <Dialog visible={panel !== null} title={panel === 'amount' ? 'Quantity' : panel === 'storage' ? 'Storage' : panel === 'date' ? 'Use-by date' : panel === 'remove' ? 'Remove this food?' : 'Add food manually'} onClose={() => setPanel(null)}>
      {panel === 'amount' ? <Stack><Field label={`Amount (${inputUnit === 'breast' ? `medium breasts` : inputUnit})`} value={amount} keyboardType="decimal-pad" onChangeText={setAmount} error={validation} /><Row style={{ flexWrap: 'wrap' }}>{inputUnits(ingredient).map(unit => <Chip key={unit} label={unit === 'breast' ? 'breasts' : unit} selected={inputUnit === unit} onPress={() => { const stored = toStoredQuantity(Number(amount) || 1, inputUnit); const factor = toStoredQuantity(1, unit).amount; setAmount(String(Number((stored.amount / factor).toFixed(4)))); setInputUnit(unit); }} />)}</Row></Stack> : null}
      {panel === 'date' ? <Field label="Date (YYYY-MM-DD)" placeholder="2026-10-21" value={useBy} onChangeText={setUseBy} error={validation} autoCapitalize="none" /> : null}
      {panel === 'storage' ? <Stack>{(['fridge', 'freezer', 'cupboard'] as const).map(s => <Chip key={s} label={s} selected={s === storage} onPress={() => { setStorage(s); setPanel(null); }} />)}</Stack> : null}
      {panel === 'remove' ? <><Text>Your plan will use the remaining pantry amounts.</Text><Button label="Remove food" busy={busy} onPress={async () => { if (await change(d => ({ ...d, pantry: d.pantry.filter(p => p.id !== item?.id) }))) router.replace('/pantry'); }} /></> : null}
      {panel === 'scan' ? <Text>Scanning isn’t connected in this local prototype. Add the food and package quantities using these fields.</Text> : null}
      <Button label={panel === 'remove' ? 'Keep food' : 'Done'} variant="secondary" disabled={busy} onPress={() => setPanel(null)} />
    </Dialog>
  </AppScreen>;
}
