import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const base = new URL('../src/data/', import.meta.url);
const schema = JSON.parse(fs.readFileSync(new URL('recipes.schema.json', base)));
export function validate(value, rule = schema, path = '$') {
  const fail = message => { throw new Error(`${path}: ${message}`); };
  if (rule.const !== undefined && value !== rule.const) fail('unsupported schema version');
  if (rule.enum && !rule.enum.includes(value)) fail('unsupported value');
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  if (rule.type && ![rule.type].flat().some(t => t === type || t === 'integer' && Number.isInteger(value))) fail(`expected ${rule.type}`);
  if (typeof value === 'number' && (!Number.isFinite(value) || value < (rule.minimum ?? -Infinity) || value <= (rule.exclusiveMinimum ?? -Infinity))) fail('invalid number');
  if (typeof value === 'string' && (value.length < (rule.minLength ?? 0) || rule.pattern && !new RegExp(rule.pattern).test(value))) fail('invalid text');
  if (Array.isArray(value)) { if (value.length < (rule.minItems ?? 0)) fail('empty list'); value.forEach((v,i) => validate(v,rule.items??{},`${path}[${i}]`)); }
  if (type === 'object') {
    for (const key of rule.required ?? []) if (!(key in value)) fail(`missing ${key}`);
    for (const [key,v] of Object.entries(value)) { if (rule.additionalProperties === false && !rule.properties?.[key]) fail(`unknown field ${key}`); validate(v,rule.properties?.[key]??{},`${path}.${key}`); }
  }
}
export function validateCatalog(data) {
 validate(data);
 const ids = new Set();
 for (const r of data) {
  if(ids.has(r.id)) throw new Error(`Duplicate recipe ${r.id}`); ids.add(r.id);
  const ingredientIds = r.ingredients.map(i=>i.id);
  if(new Set(ingredientIds).size!==ingredientIds.length) throw new Error(`${r.id}: duplicate ingredient IDs`);
  for(const step of r.instructionDetails) for(const id of step.ingredientIds) if(!ingredientIds.includes(id)) throw new Error(`${r.id}: unknown ingredient reference ${id}`);
 }
 return data;
}
if(process.argv[1] === fileURLToPath(import.meta.url)) {
 const path = process.argv[2] ?? new URL('recipes.json',base);
 const data = validateCatalog(JSON.parse(fs.readFileSync(path)));
 console.log(`Validated ${data.length} recipes.`);
}
