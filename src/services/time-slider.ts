export const MIN_MINUTES = 5;
export const MAX_MINUTES = 60;
export const MINUTE_STEP = 5;

export function snapMinutes(value: number) {
  if (!Number.isFinite(value)) return MAX_MINUTES;
  return Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, Math.round(value / MINUTE_STEP) * MINUTE_STEP));
}

export function minuteFraction(value: number) {
  return (snapMinutes(value) - MIN_MINUTES) / (MAX_MINUTES - MIN_MINUTES);
}

export function minutesAtPosition(x: number, width: number, inset: number) {
  const fraction = Math.max(0, Math.min(1, (x - inset) / Math.max(1, width - inset * 2)));
  return snapMinutes(MIN_MINUTES + fraction * (MAX_MINUTES - MIN_MINUTES));
}

export function withinTimeLimit(minutes: number, limit: number) {
  return snapMinutes(limit) === MAX_MINUTES || minutes <= snapMinutes(limit);
}

export function minuteDescription(value: number) {
  return snapMinutes(value) === MAX_MINUTES ? '60+ minutes, no time limit' : `${snapMinutes(value)} minutes or less`;
}
