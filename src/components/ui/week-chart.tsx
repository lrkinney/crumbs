import { View } from 'react-native';
import { space, token } from '@/theme';
import { Text } from './index';
import { budgetColors } from './budget-breakdown';

export const chartHeight = 201;
const barWidth = 24;
const capHeight = 12;
const segmentGap = 2;
const columnHeight = chartHeight + capHeight + segmentGap;

/** One rounded fill inside a track. The radius shrinks for short fills so the ends stay round. */
function Fill({ height, color }: { height: number; color: string }) {
  return <View style={{ width: barWidth, height, borderRadius: Math.min(space.sm, height / 2), backgroundColor: color }} />;
}

/** A day's bar: tan track (that day's allowance), spent at the bottom, planned above, and an orange cap when the day went over. */
export function DayBar({ track, spent, planned, over }: { track: number; spent: number; planned: number; over: boolean }) {
  return <View style={{ alignItems: 'center', justifyContent: 'flex-end', gap: segmentGap, height: columnHeight }}>
    {over ? <View style={{ width: barWidth, height: capHeight, borderRadius: space.sm, backgroundColor: budgetColors.over }} /> : null}
    <View style={{ width: barWidth, height: track, borderRadius: space.sm, backgroundColor: budgetColors.remaining, overflow: 'hidden', justifyContent: 'flex-end', gap: segmentGap }}>
      {planned > 0 ? <Fill height={planned} color={budgetColors.planned} /> : null}
      {spent > 0 ? <Fill height={spent} color={budgetColors.spent} /> : null}
    </View>
  </View>;
}

export interface WeekChartDay { key: string; weekday: string; date: string; label: string; track: number; spent: number; planned: number; over: boolean }

/** Seven day bars with the weekday and date under each one. Each column has equal width, so a day always sits under its own bar. */
export function WeekChart({ days }: { days: WeekChartDay[] }) {
  return <View accessible={false}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      {days.map(day => <View key={day.key} accessible accessibilityLabel={day.label} style={{ flex: 1, alignItems: 'center' }}>
        <DayBar track={day.track} spent={day.spent} planned={day.planned} over={day.over} />
      </View>)}
    </View>
    <View style={{ flexDirection: 'row', paddingTop: space.xs }} importantForAccessibility="no-hide-descendants">
      {days.map(day => <View key={day.key} style={{ flex: 1, alignItems: 'center', minHeight: token('component.screen.action-bar-height') * 2 / 3 }}>
        <Text muted>{day.weekday}</Text>
        <Text muted style={{ paddingTop: space.xxs }}>{day.date}</Text>
      </View>)}
    </View>
  </View>;
}
