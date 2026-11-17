import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { FoodImage } from '@/components/food-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Dialog, Icon, IconButton, Row, Screen, Stack, Text, type IconName } from '@/components/ui';
import { findRecipe } from '@/fixtures/recipes';
import { recipePresentation } from '@/fixtures/recipe-presentation';
import type { Recipe } from '@/models/domain';
import { useApp } from '@/state/app-state';
import { householdPortionFactor, money } from '@/services/planning';
import { RecipeImage } from './recipe-card';
import { AddToPlan } from '@/features/planning/add-to-plan';
import { colors, space, token } from '@/theme';
import { ingredientQuantity } from '@/services/quantities';
import { layout } from '@/theme/layout';

export function ServingCounter({ value, onChange, disabled }: { value: number; onChange: (n: number) => void; disabled?: boolean }) {
  return <Row style={{ width: layout.servingCounterWidth, justifyContent: 'space-between', gap: 0 }}>
    <Pressable accessibilityRole="button" accessibilityLabel="Decrease servings" disabled={disabled || value <= 1} onPress={() => onChange(value - 1)} style={styles.counterButton}><Icon name="minusCircle" size={space.lg} color={colors.muted} /></Pressable>
    <Text muted>Servings:</Text><Text role="body-strong" accessibilityLiveRegion="polite">{value}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Increase servings" disabled={disabled || value >= 12} onPress={() => onChange(value + 1)} style={styles.counterButton}><Icon name="plusCircle" size={space.lg} color={colors.muted} /></Pressable>
  </Row>;
}
export function RecipeActionBar({ servings, setServings, onSaved }: { recipe: Recipe; servings: number; setServings: (n: number) => void; onSaved: () => void }) {
  const { busy } = useApp();
  return <Row style={{ justifyContent: 'space-between', gap: space.lg }}><ServingCounter value={servings} onChange={setServings} disabled={busy} />
    <Button label="Add to plan" style={{ flex: 1 }} busy={busy} onPress={onSaved} />  </Row>;
}
export function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = findRecipe(id);
  const { data, change, busy } = useApp();
  const [servings, setServings] = useState(data.household.size);
  const [added, setAdded] = useState(false);
  const [sharing, setSharing] = useState(false);
  if (!recipe) return <Screen title="Recipe unavailable" back={() => router.back()}><Button label="Browse recipes" onPress={() => router.replace('/recipes')} /></Screen>;
  const p = recipePresentation[recipe.id];
  const title = p?.title ?? recipe.title;
  const facts: { icon: IconName; value: string; label: string }[] = [
    { icon: 'whisk', value: p?.prep != null ? `${p.prep} mins` : '—', label: 'Prep Time' },
    { icon: 'chef', value: p?.cook != null ? `${p.cook} mins` : `${recipe.minutes} mins`, label: 'Cook Time' },
    { icon: 'dollar', value: p?.priceMinor != null ? money(p.priceMinor) : '$—', label: 'Est. Per serving' },
    { icon: 'fire', value: p?.calories != null ? String(p.calories) : '—', label: 'Est. Calories' },
  ];
  return <Screen contentStyle={{ paddingTop: layout.recipeScreenTop }} footer={<RecipeActionBar recipe={recipe} servings={servings} setServings={setServings} onSaved={() => setAdded(true)} />}>
    <View style={{ height: layout.heroPlate + space.lg - token('foundation.space.6') }}>
      <View style={{ paddingTop: space.lg - token('foundation.space.6') }}><RecipeImage recipe={recipe} large /></View>
      <Row style={{ position: 'absolute', top: 0, left: 0, right: 0, justifyContent: 'space-between' }}><IconButton name="back" label="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/recipes')} /><IconButton name="share" label="Share this recipe" onPress={() => setSharing(true)} /></Row>
    </View>
    <Text role="display" accessibilityRole="header">{title}</Text>
    <Row style={{ gap: 0 }}>{facts.map((fact, i) => <View key={fact.label} style={{ flex: 1 }}>
      <Stack gap={space.xxs} style={{ alignItems: 'center' }}><Icon name={fact.icon} color={colors.muted} /><Text muted>{fact.value}</Text><Text role="caption" muted>{fact.label}</Text></Stack>
      {i < facts.length - 1 ? <View style={{ position: 'absolute', right: 0, top: space.md + token('foundation.space.2'), height: space.xl, width: token('component.divider.width'), backgroundColor: colors.border, opacity: token('component.control.opacity.disabled') }} /> : null}
    </View>)}</Row>
    <Pressable accessibilityRole="button" accessibilityLabel={`Show all ingredients for ${title}`} accessibilityHint="Opens the full ingredients list" testID="recipe-ingredients-widget"
      onPress={() => router.push({ pathname: '/recipes/ingredients', params: { id: recipe.id, servings } })}>
      <Stack gap={space.sm}><Row style={{ justifyContent: 'space-between' }}><Text role="body-strong">Ingredients</Text><Text role="caption" muted>Show all</Text></Row>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.xs }}>
        {recipe.ingredients.map(i => [i.foodId, i.label]).map(([foodId, label]) => <Stack key={foodId} gap={space.xs} style={{ width: layout.ingredientItem }}><FoodImage foodId={foodId} /><Text role="caption" muted numberOfLines={1}>{label}</Text></Stack>)}
      </ScrollView>
      </Stack>
    </Pressable>
    <Stack gap={space.xs}><Text role="body-strong">Tools</Text><Text muted>{p?.tools ?? 'Knife, cutting board, mixing bowl, and cookware for this recipe.'}</Text></Stack>
    <Stack gap={space.xs}><Text role="body-strong">Description</Text><Text muted>{recipe.description}</Text></Stack>
    <Stack gap={space.xs}><Text role="body-strong">Nutrition Info</Text><Row>{[['Calories', p?.calories ?? '—'], ['Protein', recipe.nutrition.proteinG == null ? '—' : `${recipe.nutrition.proteinG}g`], ['Carbs', recipe.nutrition.carbohydrateG == null ? '—' : `${recipe.nutrition.carbohydrateG}g`], ['Fat', recipe.nutrition.fatG == null ? '—' : `${recipe.nutrition.fatG}g`]].map(([name, value]) => <Stack key={name} gap={space.xxs} style={{ flex: 1 }}><Text role="body-strong">{value}</Text><Text role="caption" muted>{name}</Text></Stack>)}</Row><Text role="small" muted>Per serving · Unavailable values shown as —</Text></Stack>
    <Stack gap={space.sm}><Text role="body-strong">Method</Text>{recipe.steps.map((step, i) => <Stack key={step} gap={space.xs}><Text role="label">{i + 1} · Step {i + 1}</Text><Text muted>{step}</Text></Stack>)}</Stack>
    {recipe.scalingNotes.length ? <Stack gap={space.xs}><Text role="body-strong">Serving notes</Text>{recipe.scalingNotes.map(note => <Text key={note} muted>{note}</Text>)}</Stack> : null}
    {added ? <AddToPlan recipe={recipe} onClose={() => setAdded(false)} servings={servings} /> : null}
    <Dialog visible={sharing} title="Share this recipe" onClose={() => setSharing(false)}><Text>{title}</Text><Button label={data.savedRecipeIds.includes(recipe.id) ? 'Remove saved recipe' : 'Save recipe'} disabled={busy} onPress={() => void change(d => ({ ...d, savedRecipeIds: d.savedRecipeIds.includes(recipe.id) ? d.savedRecipeIds.filter(i => i !== recipe.id) : [...d.savedRecipeIds, recipe.id] }))} /><Button label="Back to recipe" variant="secondary" onPress={() => setSharing(false)} /></Dialog>
  </Screen>;
}
export function IngredientsScreen() {
  const { id, servings: initial, factor } = useLocalSearchParams<{ id: string; servings?: string; factor?: string }>();
  const { data } = useApp();
  const recipe = findRecipe(id);
  const [servings, setServings] = useState(Math.max(1, Math.min(12, Number(initial) || data.household.size)));
  const [added, setAdded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  if (!recipe) return <Screen title="Recipe unavailable"><Button label="Browse recipes" onPress={() => router.replace('/recipes')} /></Screen>;
  const categories = [...new Set(recipe.ingredients.map(i => i.aisle))];
  const portionFactor = Number(factor) || householdPortionFactor(data.household);
  return <Screen contentStyle={{ paddingTop: layout.recipeScreenTop }} back={() => router.back()} title="Ingredients" largeTitle footer={<RecipeActionBar recipe={recipe} servings={servings} setServings={setServings} onSaved={() => setAdded(true)} />}>
    <Text muted>Tap on any ingredient to learn about its purpose in the dish.</Text>
    {categories.map(category => <Stack key={category}><Text role="body-strong">{category}</Text>{recipe.ingredients.filter(i => i.aisle === category).map(item => <Pressable key={item.foodId} accessibilityRole="button" onPress={() => setSelected(item.foodId)}><Row style={{ gap: space.md }}>
      <FoodImage foodId={item.foodId} /><Stack gap={0} style={{ flex: 1 }}><Text role="body-strong">{item.label}</Text>{item.preparation ? <Text role="caption">{item.preparation}</Text> : null}</Stack><Text muted style={item.preparation ? { alignSelf: 'flex-start' } : undefined}>{ingredientQuantity({ ...item, amount: item.amount * servings * portionFactor / recipe.baseServings })}</Text>
    </Row></Pressable>)}</Stack>)}
    {added ? <AddToPlan recipe={recipe} servings={servings} onClose={() => setAdded(false)} /> : null}
    <Dialog visible={selected !== null} title={recipe.ingredients.find(i => i.foodId === selected)?.label ?? 'Ingredient'} onClose={() => setSelected(null)}><Text>Quantities adjust with your serving count. Changes to your pantry are reflected when your shopping list is built.</Text><Button label="Back to ingredients" onPress={() => setSelected(null)} /></Dialog>
  </Screen>;
}
const styles = StyleSheet.create({ counterButton: { minHeight: token('component.control.min-height'), justifyContent: 'center', alignItems: 'center' } });
