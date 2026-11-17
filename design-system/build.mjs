import { readFile, writeFile } from 'node:fs/promises';

const source = JSON.parse(await readFile(new URL('./figma-export.json', import.meta.url), 'utf8'));
const slug = value => String(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '');
const layer = name => ({ 'CRUMBS · Foundations': 'foundation', 'CRUMBS · Semantic': 'semantic', 'CRUMBS · Components': 'component' })[name];
const pathFor = token => [layer(token.collection) || 'legacy', ...(!layer(token.collection) ? [slug(token.collection)] : []), ...token.name.split('/').map(slug)];
const paths = new Map(source.tokens.map(token => [token.id, pathFor(token)]));
const cssName = token => '--crumbs-' + (layer(token.collection) ? token.name.split('/').map(slug) : pathFor(token)).join('-');
const byId = new Map(source.tokens.map(token => [token.id, token]));
const cssNames = new Map(source.tokens.map(token => [token.id, cssName(token)]));
if (new Set(cssNames.values()).size !== source.tokens.length) throw Error('Duplicate CSS variable names');

function tokenType(token) {
  const name = token.name.toLowerCase();
  if (token.type === 'COLOR') return 'color';
  if (token.type === 'STRING') return /family/.test(name) ? 'fontFamily' : 'string';
  if (token.type === 'BOOLEAN') return 'boolean';
  if (/opacity/.test(name)) return 'number';
  if (/weight/.test(name)) return 'fontWeight';
  return 'dimension';
}

function reference(token) {
  if (token.value?.type !== 'VARIABLE_ALIAS') return null;
  const path = paths.get(token.value.id);
  if (!path) throw Error(`Design token ${token.name} references an excluded runtime variable`);
  return `{${path.join('.')}}`;
}

function dtcgValue(token) {
  const alias = reference(token);
  if (alias) return alias;
  const value = /opacity/i.test(token.name) ? token.resolved / 100 : token.resolved;
  if (token.type === 'COLOR') return { colorSpace: 'srgb', components: [value.r, value.g, value.b], alpha: value.a ?? 1 };
  if (tokenType(token) === 'dimension') return { value, unit: 'px' };
  return value;
}

function literalCSS(token) {
  const value = /opacity/i.test(token.name) ? token.resolved / 100 : token.resolved;
  if (token.type === 'COLOR') return `rgb(${[value.r, value.g, value.b].map(v => Math.round(v * 255)).join(' ')} / ${value.a ?? 1})`;
  if (token.type === 'STRING') return JSON.stringify(value);
  if (tokenType(token) !== 'dimension') return String(value);
  // Type sizes and line heights scale with the user's root font preference.
  if (/font[ /-]?size|line[ /-]?height|font\/(size|line)\//i.test(token.name) || /type\/.*\/(size|line)$/.test(token.name)) return `${Number((value / 16).toFixed(6))}rem`;
  return `${value}px`;
}

const tokens = { $description: 'CRUMBS visual design tokens. Runtime form, household, plan, and recipe data are excluded.' };
for (const token of source.tokens) {
  const path = paths.get(token.id);
  let parent = tokens;
  for (const part of path.slice(0, -1)) parent = parent[part] ||= {};
  const key = path.at(-1);
  if (parent[key]) throw Error(`Duplicate token path ${path.join('.')}`);
  parent[key] = { $type: tokenType(token), $value: dtcgValue(token), $description: token.description || token.name, $extensions: { 'com.crumbs.figma': { id: token.id, collection: token.collection, variable: token.name, css: cssName(token), ...(/opacity/i.test(token.name) ? { unitConversion: 'Figma percentage points / 100 → application ratio' } : {}) } } };
}

let css = '/* Generated from figma-export.json by build.mjs. Edit tokens in Figma, then re-export. */\n:root {\n';
for (const token of source.tokens) css += `  ${cssName(token)}: ${reference(token) ? `var(${cssNames.get(token.value.id)})` : literalCSS(token)};\n`;
css += '}\n';

function bindingRefs(value, set = new Set()) {
  if (value?.type === 'VARIABLE_ALIAS' && paths.has(value.id)) set.add(paths.get(value.id).join('.'));
  else if (Array.isArray(value)) value.forEach(v => bindingRefs(v, set));
  else if (value && typeof value === 'object') Object.values(value).forEach(v => bindingRefs(v, set));
  return set;
}

function contract(family) {
  if (/Pantry\/Quick Add Row/.test(family)) return { code: 'PantryQuickAddRow', props: ['foodId', 'label', 'suggestedQuantity', 'image', 'selected', 'alreadyOwned', 'onToggle'], semantics: 'Entire row is a checkbox. Show suggested common purchase quantities in imperial units, using medium chicken breasts and whole produce. Disable foods already owned. Keep selections when filtering; batch save atomically without duplicating existing stock. Quantity remains editable from the pantry.', events: ['change'] };
  if (/Recipe\/IngredientGallery/.test(family)) return { code: 'IngredientGallery', props: ['title?', 'items[]', 'onPress'], semantics: 'One accessible action for the entire ingredients preview, including its heading, Show all label, pictures and captions. Show all uses Body/Small (10px, 16px line-height); no chevron. Horizontal swipes scroll the preview without navigating. Preserve recipe and servings when opening the full list.', events: ['press'] };
  if (/Pantry\/Food Row/.test(family)) return { code: 'PantryFoodRow', props: ['label', 'storage', 'image', 'onPress'], semantics: 'One accessible food edit action. Three columns: 48px artwork, flexible name/storage, and a decorative 24px chevron centered in a transparent 40px square with 8px padding. Quantity is edited in food details. Group under ingredient-style category headings.', events: ['press'] };
  if (/Recipe\/Time Slider/.test(family)) return { code: 'TimeSlider', props: ['value', 'onChange', 'disabled?'], semantics: 'Adjustable time limit from 5 to 60+ in five-minute steps. 60+ means uncapped. Linear scale; responsive fill width, 362 reference. Touch/pointer drag, tap, arrow keys, Home/End, screen-reader increment/decrement.', events: ['change'] };
  if (/Keyboard Key/.test(family)) return { code: 'Native platform keyboard', implementation: 'prototype-only', props: [], semantics: 'This component supports the Figma text-entry prototype. Production uses native labeled inputs and the platform keyboard; do not reproduce the global Input/Draft model.', events: [] };
  if (/Serving Counter|Counter Button|HouseholdStepper|Week Selector/.test(family)) return { code: 'Stepper', props: ['label', 'value', 'min?', 'max?', 'onChange'], semantics: 'Native decrease/increase buttons with an announced value. The application owns numeric constraints.', events: ['change'] };
  if (/Plan Action|Day Tab|Text Action/.test(family)) return { code: 'ActionButton', props: ['label', 'onPress', 'disabled?', 'selected?'], semantics: 'Native action or toggle button. Keep selected state in application data and expose aria-pressed for a toggle.', events: ['press'] };
  if (/TextInput|Text Field|Field\/Select/.test(family)) return { code: /Select/.test(family) ? 'SelectField' : 'TextField', props: ['id', 'label', 'value', 'onChange', 'helperText?', 'error?', 'disabled?', 'required?'], semantics: 'Native labeled input/select. Associate helper and error text; never use the placeholder as its label.', events: ['change'] };
  if (/SettingsRow|Summary Row/.test(family)) return { code: 'SettingsRow', props: ['label', 'description?', 'href? | onPress?', 'disabled?'], semantics: 'A link for navigation; a button for an action. One complete row is the target.', events: ['press'] };
  if (/Dialog|Popup/.test(family)) return { code: 'Dialog', props: ['title', 'description?', 'primary', 'secondary?', 'onDismiss?'], semantics: 'Native modal dialog. Clicking or tapping the backdrop dismisses through onDismiss; clicks, typing and scrolling inside stay within the dialog. Initial focus, Escape dismissal, focus containment and focus return are required.', events: ['primary', 'secondary', 'dismiss'] };
  if (/Choice|Checkbox/.test(family)) return { code: 'Choice', props: ['id', 'label', 'description?', 'checked', 'onChange', 'name?', 'disabled?'], semantics: 'Native checkbox or radio. Checked state is application data, not a global design token.', events: ['change'] };
  if (/Navigation Bar/.test(family)) return { code: 'Navigation', props: ['items[]', 'activeId', 'onSelect?'], semantics: 'Navigation landmark; current destination uses aria-current="page". Icons have adjacent labels.', events: ['select'] };
  if (/Recipe Card|RecipeRow|Recipe Row/.test(family)) return { code: 'RecipeCard', props: ['title', 'image', 'description?', 'meta?', 'planned?', 'overlapCount?', 'onOpen'], semantics: 'Image and text form one action. Planned image treatment must leave text legible.', events: ['open'] };
  if (/ActionBar|RecipeActionBar/.test(family)) return { code: 'ActionBar', props: ['primary', 'secondary?'], semantics: 'Keep actions above navigation and safe-area padding. Bind action callbacks in the application.', events: ['primary', 'secondary'] };
  if (/Button|Text Action/.test(family)) return { code: 'ActionButton', props: ['label', 'onPress', 'variant?', 'size?', 'disabled?', 'busy?', 'icon?'], semantics: 'Native button; icon-only actions need an accessible label. Minimum interactive size comes from control/min-height.', events: ['press'] };
  if (/Icon|reicon:|streamline/.test(family)) return { code: 'Icon', props: ['src', 'label?'], semantics: 'Decorative SVG/image is hidden from assistive technology when an adjacent text label already names the action.', events: [] };
  if (/Facts|Nutrition/.test(family)) return { code: 'Facts', props: ['items[]'], semantics: 'Description list of labels and values. Nutrition and price provenance belong to product data.', events: [] };
  if (/Typography/.test(family)) return { code: 'Text', props: ['text', 'role', 'tag?'], semantics: 'Use a heading level according to document structure, independently of the visual type role.', events: [] };
  if (/Image|Media|Gallery/.test(family)) return { code: 'Media', props: ['src', 'alt', 'ratio?'], semantics: 'Responsive media. Asset path geometry and photography pixels are intrinsic artwork, not spacing tokens.', events: [] };
  if (/InfoCard|Empty|Feedback|Welcome/.test(family)) return { code: 'InfoCard', props: ['title', 'description?', 'meta?', 'tone?', 'children?'], semantics: 'Content and status, with optional child action controls. Do not infer product success until the operation succeeds.', events: [] };
  return { code: 'ContentSection', props: ['title?', 'items? | children'], semantics: 'Compose the primitive components with application data. Repeated content is an array, not a fixed set of Figma layers.', events: [] };
}

const grouped = new Map();
for (const component of source.components) {
  if (!grouped.has(component.family)) grouped.set(component.family, { figmaFamily: component.family, ...contract(component.family), variants: [] });
  grouped.get(component.family).variants.push({ id: component.id, variant: component.variant || 'Default', figmaProperties: component.properties, usageInScreens: component.inScreens, tokenReferences: [...bindingRefs(component.spec)], figmaUrl: `https://www.figma.com/design/${source.file.key}?node-id=${component.id.replace(':', '-')}`, layout: component.spec.layout });
}
const contracts = { generated: source.generated, scope: 'Current app screens and library masters; backups, research diagrams and reference screenshots are not production UI.', conventions: { units: 'Figma logical px; CSS type sizes and line heights use rem.', content: 'Props/slots and application state; no recipe, form or household state is a design token.', layout: '402×874 is a reference viewport. Use fluid width, max content width, safe areas, and native scroll instead of exporting canvas x/y.', typography: 'Keep Figma font names; provide licensed web/native font assets in the app.', variants: 'Figma Pattern alternatives are layout examples. Code uses data arrays, slots and explicit props, not a component per screen.' }, families: [...grouped.values()], screens: source.screens.map(({ id, name, section }) => ({ id, name, section })) };

const assetURL = new URL('./assets/index.json', import.meta.url);
const assets = JSON.parse(await readFile(assetURL, 'utf8'));
const symbols = [];
for (const asset of assets.filter(a => a.format === 'svg')) {
  const svg = await readFile(new URL('./' + asset.path, import.meta.url), 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] || '0 0 24 24';
  let content = svg.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const paints = new Set([...content.matchAll(/(?:fill|stroke)="([^" ]+)"/g)].map(m => m[1]).filter(p => !['none', 'transparent', 'currentColor'].includes(p) && !p.startsWith('url(')));
  asset.monochrome = paints.size <= 1;
  if (asset.monochrome) content = content.replace(/(fill|stroke)="([^" ]+)"/g, (all, key, paint) => ['none', 'transparent'].includes(paint) || paint.startsWith('url(') ? all : `${key}="currentColor"`);
  const id = 'icon-' + asset.id.replaceAll(':', '-');
  asset.sprite = `assets/icons.svg#${id}`;
  symbols.push(`<symbol id="${id}" viewBox="${viewBox}">${content}</symbol>`);
}

await Promise.all([
  writeFile(new URL('./tokens.json', import.meta.url), JSON.stringify(tokens, null, 2) + '\n'),
  writeFile(new URL('./tokens.css', import.meta.url), css),
  writeFile(new URL('./tokens.resolved.json', import.meta.url), JSON.stringify(Object.fromEntries(source.tokens.map(t => [paths.get(t.id).join('.'), { type: tokenType(t), value: /opacity/i.test(t.name) ? t.resolved / 100 : t.resolved, css: cssName(t) }])), null, 2) + '\n'),
  writeFile(new URL('./component-contracts.json', import.meta.url), JSON.stringify(contracts, null, 2) + '\n'),
  writeFile(assetURL, JSON.stringify(assets, null, 2) + '\n'),
  writeFile(new URL('./assets/icons.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('\n')}</svg>\n`),
  writeFile(new URL('./token-paths.d.ts', import.meta.url), 'export type CrumbsTokenPath =\n' + source.tokens.map(t => `  | ${JSON.stringify(paths.get(t.id).join('.'))}`).join('\n') + ';\n')
]);
console.log(`Generated ${source.tokens.length} tokens and ${grouped.size} component family contracts for ${source.screens.length} screen containers.`);
