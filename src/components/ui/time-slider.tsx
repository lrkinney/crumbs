import { useMemo, useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import { token } from '@/theme';
import { minuteDescription, minutesAtPosition, snapMinutes } from '@/services/time-slider';
import { sliderInset, TimeSliderRuler, type TimeSliderProps } from './time-slider-ruler';

export function TimeSlider({ value, onChange, disabled = false }: TimeSliderProps) {
  const [width, setWidth] = useState<number>(token('component.slider.reference-width'));
  const [active, setActive] = useState(false);
  const start = useRef(0);
  const latest = useRef({ width, onChange, disabled });
  latest.current = { width, onChange, disabled };
  const responder = useMemo(() => {
    const update = (x: number) => {
      const state = latest.current;
      if (!state.disabled) state.onChange(minutesAtPosition(x, state.width, sliderInset));
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled,
      onMoveShouldSetPanResponder: (_, gesture) => !latest.current.disabled && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: event => { start.current = event.nativeEvent.locationX; setActive(true); update(start.current); },
      onPanResponderMove: (_, gesture) => update(start.current + gesture.dx),
      onPanResponderRelease: (_, gesture) => { update(start.current + gesture.dx); setActive(false); },
      onPanResponderTerminate: () => setActive(false),
      onPanResponderTerminationRequest: () => true,
    });
  }, []);
  return <View {...responder.panHandlers} style={{ width: '100%' }} onLayout={event => setWidth(event.nativeEvent.layout.width)}
    accessible accessibilityRole="adjustable" accessibilityLabel="Maximum total cooking time" accessibilityHint="Swipe up or down to adjust in five minute steps"
    accessibilityState={{ disabled }} accessibilityValue={{ min: 5, max: 60, now: snapMinutes(value), text: minuteDescription(value) }}
    accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
    onAccessibilityAction={event => { if (!disabled) onChange(snapMinutes(value + (event.nativeEvent.actionName === 'increment' ? 5 : -5))); }}>
    <TimeSliderRuler value={value} width={width} active={active} disabled={disabled} />
  </View>;
}
