// Title-cases recipe titles and ingredient labels, and moves ", modifier" text out of ingredient labels
// into the line's `preparation` (shown beneath the ingredient name in the app).
const small = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'e', 'for', 'in', 'nor', 'of', 'on', 'or', 'the', 'to', 'with']);
export function titleCase(text) {
  return text.split(/(\s+)/).map((part, index, parts) => {
    if (/^\s+$/.test(part) || part === '') return part;
    const first = parts.findIndex(p => p.trim() !== '') === index;
    return part.split('-').map((piece, k) => {
      if (/^[(\d&]/.test(piece)) return piece;
      const lower = piece.toLowerCase();
      if (small.has(lower) && !first && k === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join('-');
  }).join('');
}
export function normalizeRecipe(recipe) {
  recipe.title = titleCase(recipe.title);
  for (const i of recipe.ingredients) {
    const [name, ...rest] = i.label.split(',').map(s => s.trim());
    const extra = [...rest, ...(i.preparation ? i.preparation.split(',').map(s => s.trim()) : [])].filter(Boolean);
    i.label = titleCase(name);
    const unique = [];
    for (const e of extra.map(titleCase)) if (!unique.includes(e)) unique.push(e);
    i.preparation = unique.length ? unique.join(', ') : null;
  }
  return recipe;
}
