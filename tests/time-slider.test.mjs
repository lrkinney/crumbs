import test from 'node:test';
import assert from 'node:assert/strict';
import { minuteFraction, minutesAtPosition, snapMinutes, withinTimeLimit, minuteDescription } from '../src/services/time-slider.ts';

test('all twelve stops have equal five-minute proportions at different widths', () => {
  for (const width of [240, 280, 362, 600]) {
    for (let stop = 0; stop < 12; stop++) {
      const minutes = 5 + stop * 5;
      const x = 24 + stop / 11 * (width - 48);
      assert.equal(minutesAtPosition(x, width, 24), minutes);
      assert.equal(minuteFraction(minutes), stop / 11);
    }
  }
});

test('dragging clamps outside the ruler and snaps at the midpoint between stops', () => {
  assert.equal(minutesAtPosition(-100, 362, 24), 5);
  assert.equal(minutesAtPosition(500, 362, 24), 60);
  const interval = (362 - 48) / 11;
  assert.equal(minutesAtPosition(24 + interval * 0.49, 362, 24), 5);
  assert.equal(minutesAtPosition(24 + interval * 0.51, 362, 24), 10);
  assert.equal(snapMinutes(0), 5);
  assert.equal(snapMinutes(61), 60);
  assert.equal(snapMinutes(Number.NaN), 60);
});

test('60+ is uncapped, while lower stops filter by maximum total time', () => {
  assert.equal(withinTimeLimit(90, 60), true);
  assert.equal(withinTimeLimit(60, 55), false);
  assert.equal(withinTimeLimit(30, 30), true);
  assert.equal(withinTimeLimit(31, 30), false);
  assert.equal(minuteDescription(60), '60+ minutes, no time limit');
});
