import { View } from 'react-native';
import { colors, radius, space, token } from '@/theme';
import { Text } from './index';

export type BudgetKind = 'spent' | 'planned' | 'remaining' | 'over';
/** Segment and swatch colours for each part of the weekly budget. All come from the design tokens. */
export const budgetColors: Record<BudgetKind, string> = {
  spent: token('semantic.color.action.primary-hover'),
  planned: token('semantic.color.action.primary'),
  remaining: token('semantic.color.action.primary-pressed'),
  over: token('semantic.color.status.warning'),
};
export const budgetLabels: Record<BudgetKind, string> = { spent: 'Spent', planned: 'Planned', remaining: 'Remaining', over: 'Over budget' };

const barHeight = 36;
const segmentGap = space.xxs;

/** One slice of the budget bar. Width is a share of the whole bar. */
export function BudgetSegment({ kind, flex }: { kind: BudgetKind; flex: number }) {
  return <View style={{ flexGrow: flex, flexShrink: 1, flexBasis: 0, height: barHeight, backgroundColor: budgetColors[kind], borderRadius: space.sm }} />;
}

/** Rounded, segmented bar. Segments with no amount are left out, and an empty budget shows a single quiet track. */
export function BudgetBar({ segments }: { segments: { kind: BudgetKind; amount: number }[] }) {
  const shown = segments.filter(segment => segment.amount > 0);
  return <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ flexDirection: 'row', gap: segmentGap, height: barHeight }}>
    {shown.length ? shown.map(segment => <BudgetSegment key={segment.kind} kind={segment.kind} flex={segment.amount} />)
      : <View style={{ flex: 1, backgroundColor: colors.subtle, borderRadius: space.sm }} />}
  </View>;
}

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
