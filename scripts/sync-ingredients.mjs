import fs from 'node:fs';
import { validateLibrary } from './recipe-library.mjs';
const catalog=validateLibrary(JSON.parse(fs.readFileSync(new URL('../data/recipes.json',import.meta.url))));
const foods=new Map();
for(const recipe of catalog) for(const i of recipe.ingredients) if(!foods.has(i.foodId)) foods.set(i.foodId,{
 foodId:i.foodId,label:i.label,unit:i.unit,aisle:i.aisle,
 storage:i.aisle==='Frozen'?'freezer':['Produce','Protein','Dairy'].includes(i.aisle)?'fridge':'cupboard',image:null,
});
const ingredients=[...foods.values()].sort((a,b)=>a.label.localeCompare(b.label));
const target=new URL('../data/ingredients.json',import.meta.url);
const output=JSON.stringify(ingredients,null,2)+'\n';
if(process.argv.includes('--check')) {
 if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==output) throw new Error('Ingredient catalog is stale. Run npm run ingredients:sync.');
} else fs.writeFileSync(target,output);
console.log(`${ingredients.length} recipe ingredients synchronized.`);
