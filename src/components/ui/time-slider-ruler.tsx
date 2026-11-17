import { StyleSheet, View, Text } from 'react-native';
import { token, typography, colors } from '@/theme';
import { minuteFraction, snapMinutes } from '@/services/time-slider';

export type TimeSliderProps = { value: number; onChange: (value: number) => void; disabled?: boolean };
export const sliderInset = token('component.slider.inset');

export function SliderRuler({ fraction, value, unit, start, end, width, active = false, disabled = false, valueColor }: {
  fraction: number; value: string; unit: string; start: string; end: string; width: number; active?: boolean; disabled?: boolean; valueColor?: string;
}) {
  const selected = fraction;
  const travel = Math.max(0, width - sliderInset * 2);
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[styles.ruler, { opacity: disabled ? token('component.control.opacity.disabled') : 1 }]}>
    <View style={[styles.value, { left: selected * travel }]}>
      <Text style={[typography.small, styles.valueText, valueColor ? { color: valueColor } : null]}>{value}</Text>
      <Text style={[typography['label-small'], styles.unit]}>{unit}</Text>
    </View>
    <View style={styles.track}>{Array.from({ length: 12 }, (_, index) => {
      const focused = index === Math.round(selected * 11);
      return <View key={index} style={[styles.tick, {
        left: index / 11 * travel,
        height: token(focused ? 'component.slider.focus-height' : 'component.slider.tick-height'),
        backgroundColor: token(focused ? 'component.slider.focus-color' : 'component.slider.tick-color'),
      }]} />;
    })}</View>
    <View style={styles.endpoints}><Text style={[typography['label-small'], styles.unit, styles.endpoint]}>{start}</Text><Text style={[typography['label-small'], styles.unit, styles.endpoint]}>{end}</Text></View>
    {active ? <View style={styles.focusRing} /> : null}
  </View>;
}
export function TimeSliderRuler({ value, width, active = false, disabled = false }: {
  value: number; width: number; active?: boolean; disabled?: boolean;
}) {
  return <SliderRuler fraction={minuteFraction(value)} value={snapMinutes(value) === 60 ? '60+' : String(snapMinutes(value))} unit="Mins" start="5" end="60+" width={width} active={active} disabled={disabled} />;
}

const styles = StyleSheet.create({
  ruler: { width: '100%', height: token('component.slider.height') },
  value: { position: 'absolute', top: 0, width: sliderInset * 2, height: token('component.slider.label-height'), alignItems: 'center' },
  valueText: { color: colors.ink, textAlign: 'center', fontFamily: 'MatterSemibold', fontSize: token('foundation.font.size.14'), lineHeight: token('foundation.space.20') },
  unit: { color: colors.muted, textAlign: 'center', fontFamily: 'MatterRegular', fontSize: token('foundation.font.size.10'), lineHeight: token('foundation.space.16') },
  track: { position: 'absolute', top: token('component.slider.label-height'), left: sliderInset, right: sliderInset, height: token('component.slider.track-height') },
  tick: { position: 'absolute', bottom: token('foundation.space.4'), width: token('component.slider.tick-width'), marginLeft: -token('component.slider.tick-width') / 2, borderRadius: token('component.slider.tick-radius') },
  endpoints: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' },
  endpoint: { width: sliderInset * 2 },
  focusRing: { ...StyleSheet.absoluteFill, borderWidth: token('component.focus.ring-width'), borderColor: colors.focus, borderRadius: token('semantic.radius.control') },
});
