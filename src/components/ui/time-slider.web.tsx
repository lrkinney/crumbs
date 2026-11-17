import { useRef, useState } from 'react';
import { type KeyboardEvent, type PointerEvent } from 'react';
import { token } from '@/theme';
import { minuteDescription, minutesAtPosition, snapMinutes } from '@/services/time-slider';
import { sliderInset, TimeSliderRuler, type TimeSliderProps } from './time-slider-ruler';

export function TimeSlider({ value, onChange, disabled = false }: TimeSliderProps) {
  const [width, setWidth] = useState<number>(token('component.slider.reference-width'));
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const pointer = useRef<number | null>(null);
  const update = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onChange(minutesAtPosition(event.clientX - rect.left, rect.width, sliderInset));
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const next = { ArrowRight: value + 5, ArrowUp: value + 5, ArrowLeft: value - 5, ArrowDown: value - 5, Home: 5, End: 60 }[event.key];
    if (next !== undefined) { event.preventDefault(); onChange(snapMinutes(next)); }
  };
  return <div role="slider" tabIndex={disabled ? -1 : 0} aria-label="Maximum total cooking time" aria-valuemin={5} aria-valuemax={60}
    aria-valuenow={snapMinutes(value)} aria-valuetext={minuteDescription(value)} aria-disabled={disabled}
    style={{ width: '100%', touchAction: 'pan-y', userSelect: 'none', outline: 'none', cursor: disabled ? 'default' : 'ew-resize' }}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={keyboard}
    onPointerDown={event => {
      if (disabled || !event.isPrimary || event.button !== 0) return;
      pointer.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.focus(); setDragging(true); update(event);
    }}
    onPointerMove={event => { if (!disabled && pointer.current === event.pointerId) update(event); }}
    onPointerUp={event => {
      if (pointer.current !== event.pointerId) return;
      if (!disabled) update(event);
      pointer.current = null; setDragging(false); event.currentTarget.releasePointerCapture(event.pointerId);
    }}
    onLostPointerCapture={() => { pointer.current = null; setDragging(false); }}
    onPointerCancel={() => { pointer.current = null; setDragging(false); }}>
    <div ref={node => {
      if (!node) return;
      const observer = new ResizeObserver(entries => { if (entries[0]) setWidth(entries[0].contentRect.width); });
      observer.observe(node);
      return () => observer.disconnect();
    }} style={{ width: '100%' }}><TimeSliderRuler value={value} width={width} active={focused || dragging} disabled={disabled} /></div>
  </div>;
}
