import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
const source = JSON.parse(await read('figma-export.json'));
const tokens = JSON.parse(await read('tokens.json'));
const contracts = JSON.parse(await read('component-contracts.json'));
const css = await read('tokens.css');
const componentCSS = await read('components.css');
const assets = JSON.parse(await read('assets/index.json'));
const implementation = await import('../components.mjs');
const leaves = new Map();
function walk(value, path = []) {
  if (value?.$value !== undefined) { leaves.set(path.join('.'), value); return; }
  for (const [key, child] of Object.entries(value)) if (!key.startsWith('$')) walk(child, path.concat(key));
}
walk(tokens);

test('all visual tokens export once; no form or recipe state is a style token', () => {
  assert.equal(leaves.size, source.tokens.length);
  assert(!source.tokens.some(t => ['Journey Inputs', 'Recipe Planning', 'Onboarding State', 'Recipe Card Data', 'Recipe Card Controls'].includes(t.collection)));
  assert.equal(new Set([...leaves.values()].map(t => t.$extensions['com.crumbs.figma'].css)).size, leaves.size);
  for (const token of source.tokens) {
    const exported = [...leaves.values()].find(t => t.$extensions['com.crumbs.figma'].id === token.id);
    assert.equal(token.codeSyntax.WEB, `var(${exported.$extensions['com.crumbs.figma'].css})`);
  }
});

test('aliases resolve without cycles and agree on token type', () => {
  const visit = (path, ancestors = []) => {
    assert(!ancestors.includes(path), `Alias cycle: ${ancestors.join(' -> ')} -> ${path}`);
    const token = leaves.get(path);
    assert(token, `Missing token ${path}`);
    if (typeof token.$value === 'string' && /^\{.*\}$/.test(token.$value)) {
      const target = token.$value.slice(1, -1);
      assert.equal(token.$type, leaves.get(target)?.$type, `${path} alias type mismatch`);
      visit(target, ancestors.concat(path));
    }
  };
  for (const path of leaves.keys()) visit(path);
});

test('color, dimensions, opacity, and font values have transportable types', () => {
  for (const [path, token] of leaves) {
    const value = token.$value;
    if (typeof value === 'string' && /^\{.*\}$/.test(value)) continue;
    if (token.$type === 'color') {
      assert.equal(value.colorSpace, 'srgb');
      assert.equal(value.components.length, 3);
      value.components.forEach(channel => assert(channel >= 0 && channel <= 1, path));
    }
    if (token.$type === 'dimension') { assert(Number.isFinite(value.value), path); assert.equal(value.unit, 'px'); }
    if (path.includes('opacity')) { assert.equal(token.$type, 'number'); assert(value >= 0 && value <= 1); }
  }
});

test('the native reference stylesheet has no undefined token references', () => {
  const declarations = new Set([...css.matchAll(/(--crumbs-[\w-]+)\s*:/g)].map(m => m[1]));
  for (const match of (css + componentCSS).matchAll(/var\((--crumbs-[\w-]+)/g)) assert(declarations.has(match[1]), `Undefined ${match[1]}`);
});

test('every current library definition and live nested instance has a contract', () => {
  for (const family of contracts.families) if (family.implementation !== 'prototype-only') assert.equal(typeof implementation[family.code], 'function', `No reference primitive for ${family.code}`);
  const ids = new Set(contracts.families.flatMap(f => f.variants.map(v => v.id)));
  for (const c of source.components) assert(ids.has(c.id), `No contract for ${c.id}`);
  function references(node) {
    if (node.type === 'INSTANCE') assert(ids.has(node.componentId), `Unexported component ${node.componentId}`);
    node.children?.forEach(references);
  }
  source.components.forEach(c => references(c.spec));
  source.screens.forEach(s => s.spec.forEach(references));
});

test('every exported asset exists with the expected SVG or PNG signature', async () => {
  for (const asset of assets) {
    const value = await readFile(new URL('../' + asset.path, import.meta.url));
    if (asset.format === 'png') assert.equal(value.subarray(1, 4).toString(), 'PNG', asset.path);
    else assert(value.toString().includes('<svg'), asset.path);
  }
});
