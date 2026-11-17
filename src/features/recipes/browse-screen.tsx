import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Chip, Dialog, Icon, KeyboardAwareTextInput, Row, Stack, Text } from '@/components/ui';
import { AppScreen } from '@/components/app-screen';
import { recipes } from '@/fixtures/recipes';
import { recipePresentation } from '@/fixtures/recipe-presentation';
import { useApp } from '@/state/app-state';
import { RecipeGrid } from './recipe-card';
import { colors, radius, space, token, typography } from '@/theme';
import { layout } from '@/theme/layout';
import { matchesDiet } from '@/services/planning';
import type { Household } from '@/models/domain';
import { TimeSlider } from '@/components/ui/time-slider';
import { minuteDescription, withinTimeLimit } from '@/services/time-slider';

export function BrowseScreen() {
  const { data } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>(data.household.dietaryPreference === 'Any' ? 'All' : data.household.dietaryPreference);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sort, setSort] = useState('Recommended');
  const [maxMinutes, setMaxMinutes] = useState(60);
  const shared = new Set(data.meals.flatMap(m => recipes.find(r => r.id === m.recipeId)?.ingredients.map(i => i.foodId) ?? []));
  const results = useMemo(() => {
    const list = recipes.filter(r => `${recipePresentation[r.id]?.title} ${r.title} ${r.tags.join(' ')} ${r.ingredients.map(i => i.label).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())
      && (filter === 'All' || ['Vegetarian', 'Vegan', 'Pescatarian'].includes(filter) && matchesDiet(r, filter as Household['dietaryPreference']) || filter === 'Quick' && r.minutes <= 30 || filter === 'Saved' && data.savedRecipeIds.includes(r.id))
      && withinTimeLimit(r.minutes, maxMinutes));
    return sort === 'Quickest first' ? list.sort((a, b) => a.minutes - b.minutes) : list;
  }, [query, filter, sort, maxMinutes, data.savedRecipeIds]);
  return <AppScreen title="Browse Recipes" largeTitle bodyGap={layout.browseBodyGap} navigation="plan">
    <Stack gap={space.xs}>
    <Row style={styles.searchRow}>
      <View style={styles.search}><Icon name="search" size={token('component.icon.size.default')} /><KeyboardAwareTextInput value={query} onChangeText={setQuery} placeholder="Search recipes, ingredients, cuisines, and more..." accessibilityLabel="Search recipes, ingredients, cuisines, and more"
        placeholderTextColor={colors.muted} autoCapitalize="none" style={[typography.small, styles.input]} /></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Filter recipes" style={styles.filterButton} onPress={() => setFiltersVisible(true)}><Icon name="filter" size={token('component.icon.size.default')} /></Pressable>
    </Row>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }} accessible accessibilityLabel="Number of overlapping ingredients with recipes in your plan">
        <View style={styles.overlapKeyIcon}><Icon name="layers" size={token('component.icon.size.small')} color={token('semantic.color.overlap.text')} /></View>
        <Text role="caption" style={styles.overlapKeyText}>Number of overlapping ingredients</Text>
      </View>
    </Stack>
    {filter !== 'All' ? <Row><Chip label={filter} selected onPress={() => setFiltersVisible(true)} /><Button label="Clear" compact variant="ghost" onPress={() => setFilter('All')} /></Row> : null}
    {maxMinutes < 60 ? <Row><Chip label={minuteDescription(maxMinutes)} selected onPress={() => setFiltersVisible(true)} /><Button label="Clear time" compact variant="ghost" onPress={() => setMaxMinutes(60)} /></Row> : null}
    <RecipeGrid recipes={results} plannedIds={data.meals.filter(m => m.status === 'planned').map(m => m.recipeId)} overlapFor={r => r.ingredients.filter(i => shared.has(i.foodId)).length} />
    {!results.length ? <Stack><Text role="section">No recipes found</Text><Text muted>Try fewer filters or another ingredient.</Text><Button label="Clear filters" onPress={() => { setFilter('All'); setMaxMinutes(60); setQuery(''); }} /></Stack> : null}
    <Dialog visible={filtersVisible} title="Find your kind of food" onClose={() => setFiltersVisible(false)}>
      <Stack gap={space.xs}><Text role="label">Total time</Text><TimeSlider value={maxMinutes} onChange={setMaxMinutes} /></Stack>
      <Stack>{['All', 'Quick', 'Vegetarian', 'Vegan', 'Pescatarian', 'Saved'].map(value => <Chip key={value} label={value} selected={value === filter} onPress={() => setFilter(value)} />)}</Stack>
      <Stack><Text role="body-strong">Sort recipes</Text>{['Recommended', 'Quickest first'].map(value => <Chip key={value} label={value} selected={value === sort} onPress={() => setSort(value)} />)}</Stack>
      <Button label="Show recipes" onPress={() => setFiltersVisible(false)} />
    </Dialog>
  </AppScreen>;
}
const styles = StyleSheet.create({
  overlapKeyIcon: { width: token('foundation.space.20'), height: token('foundation.space.20'), borderRadius: radius.pill, backgroundColor: token('semantic.color.overlap.surface'), alignItems: 'center', justifyContent: 'center' },
  overlapKeyText: { flexShrink: 1, fontFamily: 'MatterMedium', color: token('semantic.color.overlap.surface') },
  searchRow: { minHeight: token('component.control.min-height'), gap: space.xs },
  search: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: space.xs, borderWidth: token('semantic.border.default'), borderColor: colors.muted, borderRadius: radius.control, padding: space.xs },
  input: { flex: 1, minWidth: 0, padding: 0, lineHeight: token('foundation.font.size.14'), color: colors.muted },
  filterButton: { width: space.xl + token('foundation.space.2'), height: space.xl + token('foundation.space.2'), alignItems: 'center', justifyContent: 'center', borderWidth: token('semantic.border.default'), borderColor: colors.muted, borderRadius: radius.control },
});
