// Run with the mapping created by the migration, in Figma's plugin context.
// Original metric variables and archived pages are retained. Only live screens receive the new display bindings.
const OUNCE = 28.349523125, FL_OUNCE = 29.5735295625;
const fracs = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'];
function fraction(n) { const v = Math.round(n * 8); if (n > 0 && !v) return '<⅛'; return `${Math.floor(v / 8) || !(v % 8) ? Math.floor(v / 8) : ''}${fracs[v % 8]}`; }
function weight(g) { const oz = g / OUNCE, rounded = Math.round(oz * 8) / 8, pounds = Math.floor(rounded / 16), rest = rounded - pounds * 16; return pounds ? `${pounds} lb${rest ? ` ${fraction(rest)} oz` : ''}` : `${fraction(oz)} oz`; }
function display(n, meta) {
  const food = meta.name.split('/').slice(-2)[0]; const shopping = meta.name.startsWith('Ingredient/');
  if (shopping && food === 'chicken') { const count = Math.max(0, n > 0 ? Math.max(1, Math.ceil((n-.5) / (6 * OUNCE))) : 0); return `${count} medium ${count === 1 ? 'breast' : 'breasts'}`; }
  if (['cucumber','zucchini','eggplant'].includes(food)) { const raw = n / ({ cucumber:150, zucchini:200, eggplant:200 }[food]); const count = shopping ? Math.ceil(raw - 1e-9) : raw; return `${fraction(count)} ${food}${food === 'zucchini' || count <= 1 ? '' : 's'}`; }
  if (shopping && food === 'garlic') { const count = Math.ceil(n / 10 - 1e-9); return `${count} ${count === 1 ? 'bulb' : 'bulbs'}`; }
  if (/\bg$/.test(meta.value)) return weight(shopping && n > 0 ? Math.max(n, Math.max(1,Math.ceil((n-.5)/OUNCE))*OUNCE) : n);
  if (/\bml$/.test(meta.value)) { const oz = shopping && n > 0 ? Math.max(n / FL_OUNCE, Math.max(1,Math.ceil((n-.5)/FL_OUNCE))) : n / FL_OUNCE; if(shopping || /^(addFood|foodEdit)/.test(meta.name)) return oz >= 8 ? `${fraction(oz / 8)} ${oz <= 8 ? 'cup' : 'cups'}` : `${fraction(oz)} fl oz`; if(oz >= 2) return `${fraction(oz / 8)} ${oz <= 8 ? 'cup' : 'cups'}`; return oz >= .5 ? `${fraction(oz * 2)} tbsp` : `${fraction(oz * 6)} tsp`; }
  const count = shopping ? Math.ceil(n - 1e-9) : n;
  const unit = meta.value.replace(/^[\d.]+\s*/, '');
  if(unit) return `${fraction(count)} ${count <= 1 ? unit.replace(/s$/, '') : unit}`;
  const nouns = { bread:['slice','slices'], garlic:['clove','cloves'], lime:['lime','limes'], lemon:['lemon','lemons'], pita:['pita','pitas'], redOnion:['onion','onions'], onion:['onion','onions'], bellPepper:['pepper','peppers'] };
  return `${fraction(count)} ${(nouns[food] || ['item','items'])[count <= 1 ? 0 : 1]}`;
}
const lit = (value, type = typeof value === 'number' ? 'FLOAT' : 'STRING') => ({ type, resolvedType:type, value });
const alias = id => ({ type:'VARIABLE_ALIAS', resolvedType:'FLOAT', value:{ type:'VARIABLE_ALIAS',id } });
const expr = (fn, args, type = 'STRING') => ({ type:'EXPRESSION', resolvedType:type, value:{ expressionFunction:fn, expressionArguments:args } });
const set = (id,value) => ({type:'SET_VARIABLE',variableId:id,variableValue:value});
function numeric(value) {
  if(value.type === 'STRING') { const n = parseFloat(value.value); return Number.isFinite(n) ? lit(n) : null; }
  if(value.type !== 'EXPRESSION') return null;
  const e = value.value;
  if(e.expressionFunction === 'STRINGIFY') return e.expressionArguments[0];
  if(e.expressionFunction === 'ADDITION') { const first = e.expressionArguments[0]; if(first.type === 'EXPRESSION' && first.value.expressionFunction === 'STRINGIFY') return first.value.expressionArguments[0]; }
  return null;
}
function coefficients(v,out=[]) {
  if(v?.type === 'EXPRESSION') {
    if(v.value.expressionFunction === 'MULTIPLICATION') { for(const a of v.value.expressionArguments) if(a.type === 'FLOAT') out.push(a.value); }
    else for(const a of v.value.expressionArguments) coefficients(a,out);
  }
  return out;
}
function binary(entries, key, fallback) {
  if(!entries.length) return lit(fallback);
  if(entries.length === 1) return lit(entries[0].text);
  const mid = Math.floor(entries.length / 2);
  return expr('TERNARY', [expr('LESS_THAN', [alias(key), lit((entries[mid-1].amount + entries[mid].amount) / 2)], 'BOOLEAN'), binary(entries.slice(0,mid),key,fallback), binary(entries.slice(mid),key,fallback)]);
}
const metadata = new Map(mapping.map(m=>[m.id,m]));
const live = await figma.getNodeByIdAsync('0:1');
if(live.getPluginData('crumbsImperialQuantities') === '1') return { alreadyMigrated:true };
const sources = live.findAll(n=>n.reactions?.length);
const originals = sources.map(n=>({id:n.id,reactions:JSON.parse(JSON.stringify(n.reactions))}));
const representatives = new Map();
function inspect(actions) { for(const a of actions || []) { if(a.type==='SET_VARIABLE' && metadata.has(a.variableId) && a.variableValue?.type==='EXPRESSION' && !representatives.has(a.variableId)) representatives.set(a.variableId,numeric(a.variableValue)); for(const b of a.conditionalBlocks || []) inspect(b.actions); } }
originals.forEach(s=>s.reactions.forEach(r=>inspect(r.actions)));
function formatter(meta) {
  const food = meta.name.split('/').slice(-2)[0];
  if(meta.name.startsWith('Ingredient/') && ['chicken','garlic','cucumber','zucchini','eggplant'].includes(food)) {
    function whole() {
      const step = food==='chicken' ? (6 * OUNCE) : food==='garlic' ? 10 : ({cucumber:150,zucchini:200,eggplant:200}[food]);
      function ceilTree(lo,hi) {
        if(lo===hi)return lit(display(lo*step,meta));
        const mid=Math.floor((lo+hi)/2);
        return expr('TERNARY',[expr('LESS_THAN',[alias(meta.amountId),lit(mid===0 ? 1e-6 : mid*step+(food==='chicken'?.5:1e-6))],'BOOLEAN'),ceilTree(lo,mid),ceilTree(mid+1,hi)]);
      }
      return ceilTree(0,64);
    }
    return whole();
  }
  const coefs=coefficients(representatives.get(meta.id));
  const recipe=meta.name.startsWith('Recipe/');
  let amounts;
  if(recipe) { const base=parseFloat(meta.value)||1; amounts=Array.from({length:13},(_,i)=>base*i/2); }
  else if(coefs.length) {
    const gcd=(a,b)=>b?gcd(b,a%b):a;
    const step=coefs.map(c=>Math.round(c*1000)).reduce(gcd)/1000;
    const max=coefs.reduce((a,b)=>a+b,0)*12;
    amounts=Array.from({length:Math.min(1500,Math.ceil(max/step)+1)},(_,i)=>i*step);
  } else { const base=parseFloat(meta.value)||1; amounts=Array.from({length:13},(_,i)=>base*i/2); }
  const entries=amounts.map(amount=>({amount,text:display(amount,meta)}));
  return binary(entries,meta.amountId,display(amounts[amounts.length-1],meta));
}
const formats = new Map(mapping.map(m=>[m.id,formatter(m)]));
const changed=[]; const unhandled=[];
function rewrite(actions,source) {
  const out=[];
  for(const original of actions || []) {
    const a=JSON.parse(JSON.stringify(original));
    if(a.conditionalBlocks) for(const b of a.conditionalBlocks)b.actions=rewrite(b.actions,source);
    out.push(a);
    const m=a.type==='SET_VARIABLE' ? metadata.get(a.variableId) : null;
    if(!m)continue;
    const n=numeric(a.variableValue);
    if(n) { out.push(set(m.amountId,n),set(m.textId,formats.get(m.id))); }
    else if(a.variableValue.type==='VARIABLE_ALIAS') { out.push(set(m.textId,a.variableValue)); }
    else unhandled.push({source,target:m.id});
  }
  return out;
}
for(const s of originals) {
  if(!JSON.stringify(s.reactions).includes('Quantity') && !mapping.some(m=>JSON.stringify(s.reactions).includes(m.id))) continue;
  const n=await figma.getNodeByIdAsync(s.id); const rs=s.reactions.map(r=>({trigger:r.trigger,actions:rewrite(r.actions,s.id)}));
  try { await n.setReactionsAsync(rs);changed.push(s.id); } catch(error) { for(const id of changed){const old=originals.find(s=>s.id===id);await (await figma.getNodeByIdAsync(id)).setReactionsAsync(old.reactions.map(r=>({trigger:r.trigger,actions:r.actions})));}return {failure:String(error),at:s.id,rolledBack:changed.length}; }
}
let rebound=0;
for(const n of live.findAll(n=>n.type==='INSTANCE' || n.type==='TEXT')) {
  if(n.type==='INSTANCE') {
    const props={};
    for(const [k,p] of Object.entries(n.componentProperties)) {const m=metadata.get(p.boundVariables?.value?.id);if(m) props[k]={type:'VARIABLE_ALIAS',id:m.textId};}
    if(Object.keys(props).length){n.setProperties(props);rebound++;}
  } else {const m=metadata.get(n.boundVariables?.characters?.id);if(m){n.setBoundVariable('characters',await figma.variables.getVariableByIdAsync(m.textId));rebound++;}}
}
live.setPluginData('crumbsImperialQuantities','1');
return {changed,rebound,unhandled,formatCount:formats.size};
