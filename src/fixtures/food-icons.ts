/** Small vector fallbacks for foods without a supplied ingredient photograph. */
export const foodIconPaths: Record<string, string> = {
  rice: '<path d="M5 13h14c0 5-3 7-7 7s-7-2-7-7Z M8 17h8 M9 9l1-3 M14 9l1-3 M11 11l1-3"/>',
  lentils: '<path d="M5 13h14c0 5-3 7-7 7s-7-2-7-7Z"/><ellipse cx="8" cy="9" rx="2" ry="1.4"/><ellipse cx="15" cy="8" rx="2" ry="1.4"/><ellipse cx="12" cy="11" rx="2" ry="1.4"/>',
  tomato: '<path d="M12 7c-8-4-12 12-2 13h4C24 19 20 3 12 7Z M12 8l-3-3 M12 8l4-3 M12 8V3"/>',
  zucchini: '<path d="M6 18C2 14 14 4 18 7c5 4-8 16-12 11Z M17 7l2-3 M8 16l7-7"/>',
  cucumber: '<path d="M6 18C2 14 14 4 18 7c5 4-8 16-12 11Z M8 15l1-1 M11 12l1-1 M14 9l1-1"/>',
  eggplant: '<path d="M16 7C9 5 9 17 4 18c8 6 18-3 12-11Z M15 7l3-4 M14 7l5 2"/>',
  tofu: '<path d="m5 9 7-4 7 4v9l-7 3-7-3V9Z m0 0 7 4 7-4 M12 13v8 M8 8l7 4"/>',
  feta: '<path d="m5 9 7-4 7 4v9l-7 3-7-3V9Z m0 0 7 4 7-4 M12 13v8 M8 14v1 M15 15v1"/>',
  bread: '<path d="M6 10c-5-6 17-6 12 0v10H6V10Z M9 9v3 M12 8v4 M15 9v3"/>',
  pita: '<ellipse cx="12" cy="13" rx="8" ry="6"/><path d="m8 11 1 1 M13 10l1 1 M10 15l1 1 M15 14l1 1"/>',
  yogurt: '<path d="M7 7h10l-1 13H8L7 7Z M6 4h12v3H6V4Z M9 11h6 M10 15h4"/>',
  lemon: '<path d="M5 8c4-7 14-3 14 5l1 3-3 1c-5 6-14 0-12-6L4 8h1Z M8 10c1-2 3-3 5-2"/>',
  asparagus: '<path d="m7 20 3-14 2-3 1 4-3 14 M13 20l3-11 2-3 1 4-3 11 M9 10l3 1 M15 13l3 1"/>',
  spinach: '<path d="M5 19C2 9 8 3 20 4c1 11-5 16-15 15Z M5 19l10-10 M9 15v-5 M9 15h5"/>',
};
export const genericFoodPath = '<path d="M5 10h14l-2 10H7L5 10Z M8 10l2-6 M16 10l-2-6 M10 14v3 M14 14v3"/>';
export const chevronPath = '<path d="m9 5 7 7-7 7"/>';

export function foodIconSvg(paths: string, color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}
