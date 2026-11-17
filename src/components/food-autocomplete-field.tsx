import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Field, Text } from '@/components/ui';
import { colors, radius, space, token } from '@/theme';
import { layout } from '@/theme/layout';

export interface FoodOption { foodId: string; label: string; aisle: string }

/** Editable food field with an offline suggestion list layered above the input. */
export function FoodAutocompleteField({ label, value, onChangeText, suggestions, onSelect, placeholder = 'Start typing a food' }: {
  label: string; value: string; onChangeText: (value: string) => void; suggestions: FoodOption[];
  onSelect: (food: FoodOption) => void; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const matches = useMemo(() => {
    const query = value.trim().toLocaleLowerCase();
    if (!query) return [];
    return suggestions.filter(item => item.label.toLocaleLowerCase().includes(query))
      .sort((a, b) => Number(!a.label.toLocaleLowerCase().startsWith(query)) - Number(!b.label.toLocaleLowerCase().startsWith(query)) || a.label.localeCompare(b.label))
      .slice(0, 30);
  }, [value, suggestions]);

  return <View style={styles.fieldWrap}>
    {focused && matches.length ? <View style={styles.suggestions}>
      <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled style={styles.suggestionScroll}>
        {matches.map(item => <Pressable key={item.foodId} accessibilityRole="button" accessibilityLabel={`Use ${item.label}`} onPress={() => { onSelect(item); setFocused(false); }} style={styles.suggestionRow}>
          <Text role="body-strong">{item.label}</Text><Text role="caption" muted>{item.aisle}</Text>
        </Pressable>)}
      </ScrollView>
    </View> : null}
    <Field label={label} value={value} onChangeText={onChangeText} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 180)} autoCorrect={false} />
  </View>;
}

const styles = StyleSheet.create({
  fieldWrap: { position: 'relative', zIndex: 20, elevation: 20, overflow: 'visible' },
  suggestions: { position: 'absolute', zIndex: 30, elevation: 30, left: 0, right: 0, bottom: layout.fieldHeight + space.xs, maxHeight: 240,
    borderRadius: radius.control, backgroundColor: '#FFFFFF', borderWidth: token('semantic.border.default'), borderColor: colors.border,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.16, shadowRadius: 8 },
  suggestionScroll: { maxHeight: 238 },
  suggestionRow: { minHeight: token('component.control.min-height'), paddingHorizontal: space.md, paddingVertical: space.xs,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, borderBottomWidth: token('semantic.border.default'), borderBottomColor: colors.border },
});
