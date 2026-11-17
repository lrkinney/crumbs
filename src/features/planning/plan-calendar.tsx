import { Pressable } from 'react-native';
import { Row, Text } from '@/components/ui';
import { nextDays } from '@/services/planning';
import { colors, radius, space, token } from '@/theme';

export function PlanCalendar({ date, onChange, weekOf, disabled }: { date: string; onChange: (date: string) => void; weekOf: string; disabled?: boolean }) {
  const start = new Date(`${weekOf}T12:00:00`); start.setDate(start.getDate() - start.getDay());
  const week = nextDays(7, start);
  return (    <Row style={{ gap: 0 }}>{week.map(day => <Pressable key={day.value} disabled={disabled} onPress={() => onChange(day.value)} accessibilityRole="button" accessibilityLabel={day.label} accessibilityState={{ selected: date === day.value }}
      style={{ flex: 1, minHeight: token('component.button.height.large'), alignItems: 'center', justifyContent: 'center', gap: space.xxs, borderRadius: radius.control, backgroundColor: date === day.value ? token('semantic.color.action.primary') : 'transparent' }}>
      <Text muted style={date === day.value ? { color: colors.onBrand } : undefined}>{new Date(`${day.value}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })}</Text><Text muted style={date === day.value ? { color: colors.onBrand } : undefined}>{Number(day.value.slice(-2))}</Text>
    </Pressable>)}</Row>);
}
