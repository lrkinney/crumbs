import { View } from 'react-native';
import { colors, radius, space, token } from '@/theme';
import { Text } from './index';

export type BudgetKind = 'spent' | 'planned' | 'remaining' | 'over';
/** Bar and swatch colours for each part of the weekly budget. All come from the design tokens. */
export const budgetColors: Record<BudgetKind, string> = {
  spent: token('semantic.color.action.primary'),
  planned: token('semantic.color.action.primary-hover'),
  remaining: token('semantic.color.surface.subtle'),
  over: token('semantic.color.status.warning'),
};
export const budgetLabels: Record<BudgetKind, string> = { spent: 'Spent', planned: 'Planned', remaining: 'Remaining', over: 'Over budget' };

/** Small tan pill that holds an amount. */
export function ValuePill({ children }: { children: string }) {
  return <View style={{ backgroundColor: colors.subtle, borderRadius: radius.control > space.xs ? space.xs : radius.control, paddingHorizontal: space.xxs, minHeight: token('semantic.type.caption.line'), justifyContent: 'center' }}>
    <Text role="caption" muted>{children}</Text>
  </View>;
}

/** Colour swatch, label and amount pill. Sits in the two-column legend below the bar. */
export function BudgetLegendItem({ kind, amount }: { kind: BudgetKind; amount: string }) {
  return <View accessible accessibilityLabel={`${budgetLabels[kind]} ${amount}`} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.xxs, minHeight: 20 }}>
    <View style={{ width: 4, height: 20, borderRadius: space.sm, backgroundColor: budgetColors[kind] }} />
    <Text role="small" muted style={{ flexShrink: 1 }}>{budgetLabels[kind]}</Text>
    <View style={{ flex: 1 }} />
    <ValuePill>{amount}</ValuePill>
  </View>;
}
