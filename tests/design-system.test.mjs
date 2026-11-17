import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { tokens } from '../src/theme/tokens.generated.ts';
import { icons } from '../src/theme/icons.generated.ts';

test('native theme includes every canonical Figma token with matching resolved values', async () => {
  const source = JSON.parse(await readFile(new URL('../design-system/tokens.resolved.json', import.meta.url), 'utf8'));
  const canonical = Object.entries(source).filter(([key]) => !key.startsWith('legacy.'));
  assert.equal(Object.keys(tokens).length, canonical.length);
  for (const [key, token] of canonical) {
    assert.ok(key in tokens);
    if (token.type === 'color') assert.match(tokens[key], /^rgba\(/);
    else assert.equal(tokens[key], token.value);
  }
  assert.equal(tokens['component.control.opacity.disabled'], 0.5);
});
test('all bundled font source paths exist', async () => {
  const source = await readFile(new URL('../src/theme/fonts.ts', import.meta.url), 'utf8');
  const paths = [...source.matchAll(/require\('([^']+)'\)/g)].map(m => m[1]);
  assert.equal(paths.length, 5);
  for (const path of paths) await access(new URL(`../src/theme/${path}`, import.meta.url));
});
test('original icons are valid base64 SVG sources supported by the native image loader', async () => {
  const assets = JSON.parse(await readFile(new URL('../assets/crumbs/index.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(icons).sort(), assets.filter(a => a.format === 'svg').map(a => a.id).sort());
  for (const source of Object.values(icons)) {
    assert.ok(source.startsWith('data:image/svg+xml;base64,'));
    const xml = Buffer.from(source.split(',')[1], 'base64').toString('utf8');
    assert.match(xml, /^<svg/); assert.match(xml, /<\/svg>/); assert.equal(xml.includes('currentColor'), false);
  }
});
