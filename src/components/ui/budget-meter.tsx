import { useState } from 'react';
import { View } from 'react-native';
import { colors, token } from '@/theme';
import { money } from '@/services/planning';
import { SliderRuler } from './time-slider-ruler';

/** Read-only meter built from the Time Slider ruler: the focus tick marks how much of the weekly budget is spent. */
export function BudgetMeter({ spentMinor, budgetMinor }: { spentMinor: number; budgetMinor: number }) {
  const [width, setWidth] = useState<number>(token('component.slider.reference-width'));
  const over = budgetMinor > 0 && spentMinor > budgetMinor;
  const ratio = budgetMinor > 0 ? Math.min(1, spentMinor / budgetMinor) : 0;
  const fraction = Math.round(ratio * 11) / 11;
  const description = budgetMinor > 0
    ? `${money(spentMinor)} spent of your ${money(budgetMinor)} weekly budget${over ? `, ${money(spentMinor - budgetMinor)} over` : ''}`
    : 'No weekly budget set';
  return <View style={{ width: '100%' }} onLayout={event => setWidth(event.nativeEvent.layout.width)} accessible accessibilityRole="progressbar"
    accessibilityLabel="Weekly budget" accessibilityValue={{ min: 0, max: Math.max(budgetMinor, 1), now: Math.min(spentMinor, Math.max(budgetMinor, 1)), text: description }}>
    <SliderRuler fraction={fraction} value={money(spentMinor)} unit="spent" start={money(0)} end={money(budgetMinor)} width={width} valueColor={over ? colors.error : undefined} />
  </View>;
}
