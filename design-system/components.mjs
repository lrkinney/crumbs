/** Native DOM reference components. No framework or global prototype state required. */
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
};
const add = (parent, children = []) => { for (const child of children.flat()) if (child) parent.append(child); return parent; };

export function PantryQuickAddRow({ foodId, label, suggestedQuantity, image, selected = false, alreadyOwned = false, onToggle } = {}) {
  const row = el('label', 'cr-pantry-quick-add-row');
  const input = el('input'); input.type = 'checkbox'; input.value = foodId; input.checked = selected && !alreadyOwned; input.disabled = alreadyOwned;
  input.setAttribute('aria-label', `${label}, ${alreadyOwned ? 'already in pantry' : suggestedQuantity}`);
  const photo = el('img', 'cr-pantry-food-row__image'); photo.src = image; photo.alt = '';
  const copy = add(el('span', 'cr-pantry-food-row__copy'), [Text({ text: label, role: 'label', tag: 'span' }), Text({ text: alreadyOwned ? 'In your pantry' : suggestedQuantity, role: 'small', tag: 'span' })]);
  input.addEventListener('change', () => onToggle?.(foodId, input.checked));
  if (alreadyOwned) row.classList.add('cr-pantry-quick-add-row--owned');
  return add(row, [photo, copy, input]);
}

export function Text({ text = '', role = 'body', tag = 'p' } = {}) {
  return el(tag, `cr-type cr-type--${role}`, text);
}

export function PantryFoodRow({ label, storage, image, onPress } = {}) {
  const row = el('button', 'cr-pantry-food-row');
  row.type = 'button';
  row.setAttribute('aria-label', [label, storage].filter(Boolean).join(', '));
  const photo = el('img', 'cr-pantry-food-row__image'); photo.src = image; photo.alt = '';
  const copy = add(el('span', 'cr-pantry-food-row__copy'), [Text({ text: label, role: 'label', tag: 'span' }), Text({ text: storage, role: 'small', tag: 'span' })]);
  const arrow = el('img', 'cr-pantry-food-row__chevron'); arrow.src = './assets/food-icons/chevron.svg'; arrow.alt = '';
  const arrowFrame = add(el('span', 'cr-pantry-food-row__chevron-frame'), [arrow]);
  add(row, [photo, copy, arrowFrame]);
  if (onPress) row.addEventListener('click', onPress);
  return row;
}

export function TimeSlider({ value = 60, onChange, disabled = false } = {}) {
  const root = el('div', 'cr-time-slider');
  const label = el('div', 'cr-time-slider__value');
  const number = Text({ role: 'small', tag: 'span' });
  add(label, [number, Text({ text: 'Mins', role: 'label-small', tag: 'span' })]);
  const track = el('div', 'cr-time-slider__track');
  track.setAttribute('aria-hidden', 'true');
  label.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 12; i++) {
    const tick = el('span', 'cr-time-slider__tick');
    tick.style.left = `${i / 11 * 100}%`;
    track.append(tick);
  }
  const ends = add(el('div', 'cr-time-slider__ends'), [Text({ text: '5', role: 'label-small' }), Text({ text: '60+', role: 'label-small' })]);
  ends.setAttribute('aria-hidden', 'true');
  const input = el('input', 'cr-time-slider__input');
  Object.assign(input, { type: 'range', min: '5', max: '60', step: '5', disabled });
  input.setAttribute('aria-label', 'Maximum total cooking time');
  input.value = String(Math.max(5, Math.min(60, Math.round(value / 5) * 5)));
  const render = () => {
    const minutes = Number(input.value);
    const fraction = (minutes - 5) / 55;
    number.textContent = minutes === 60 ? '60+' : String(minutes);
    label.style.left = `calc(var(--crumbs-slider-inset) + (100% - 2 * var(--crumbs-slider-inset)) * ${fraction})`;
    for (let i = 0; i < 12; i++) track.children[i].classList.toggle('is-selected', i === Math.round(fraction * 11));
    input.setAttribute('aria-valuetext', minutes === 60 ? '60+ minutes, no time limit' : `${minutes} minutes or less`);
  };
  input.addEventListener('input', () => { render(); onChange?.(Number(input.value)); });
  render();
  return add(root, [label, track, ends, input]);
}

export function Icon({ src, label = '' }) {
  if (src.includes('.svg#')) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('cr-icon');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', src);
    svg.append(use);
    if (label) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label); }
    else svg.setAttribute('aria-hidden', 'true');
    return svg;
  }
  const image = el('img', 'cr-icon');
  image.src = src;
  image.alt = label;
  if (!label) image.setAttribute('aria-hidden', 'true');
  return image;
}

export function ActionButton({ label, onPress, variant = 'primary', size = 'default', disabled = false, busy = false, icon, selected } = {}) {
  if (!label) throw new TypeError('An action needs a visible or accessible label.');
  const button = el('button', `cr-button cr-button--${variant} cr-button--${size}`);
  button.type = 'button';
  button.disabled = disabled || busy;
  if (typeof selected === 'boolean') button.setAttribute('aria-pressed', String(selected));
  if (busy) button.setAttribute('aria-busy', 'true');
  add(button, [icon ? Icon({ src: icon }) : null, el('span', '', busy ? `${label}…` : label)]);
  if (onPress) button.addEventListener('click', onPress);
  return button;
}

export function IconButton({ label, icon, onPress, disabled = false }) {
  const button = ActionButton({ label, icon, onPress, disabled, variant: 'secondary', size: 'compact' });
  button.classList.add('cr-icon-button');
  button.setAttribute('aria-label', label);
  button.querySelector('span').hidden = true;
  return button;
}

export function InfoCard({ title, description, meta, tone = 'default', children = [] } = {}) {
  const card = el('section', `cr-card cr-card--${tone}`);
  add(card, [title ? Text({ text: title, role: 'card', tag: 'h3' }) : null,
    description ? Text({ text: description }) : null,
    meta ? Text({ text: meta, role: 'label-small' }) : null, ...children]);
  return card;
}

export function SettingsRow({ label, description, href, onPress, trailing = '›', disabled = false } = {}) {
  const row = el(href ? 'a' : 'button', 'cr-row');
  if (href) row.href = href;
  else { row.type = 'button'; row.disabled = disabled; }
  const copy = el('span', 'cr-row__copy');
  add(copy, [Text({ text: label, role: 'label', tag: 'span' }), description ? Text({ text: description, role: 'small', tag: 'span' }) : null]);
  const end = el('span', 'cr-row__trailing', trailing);
  end.setAttribute('aria-hidden', 'true');
  add(row, [copy, end]);
  if (onPress) row.addEventListener('click', onPress);
  return row;
}

export function TextField({ id, label, value = '', onChange, helperText, error, disabled = false, required = false, type = 'text', inputMode, autocomplete } = {}) {
  if (!id || !label) throw new TypeError('TextField requires an id and a label.');
  const field = el('div', 'cr-field');
  const caption = el('label', 'cr-type cr-type--label', `${label}${required ? ' (required)' : ''}`);
  caption.htmlFor = id;
  const input = el('input', 'cr-field__control');
  Object.assign(input, { id, type, value, disabled, required });
  if (inputMode) input.inputMode = inputMode;
  if (autocomplete) input.autocomplete = autocomplete;
  const descriptions = [];
  add(field, [caption, input]);
  if (helperText) { const helper = Text({ text: helperText, role: 'small' }); helper.id = `${id}-help`; descriptions.push(helper.id); field.append(helper); }
  if (error) { const message = Text({ text: error, role: 'small' }); message.id = `${id}-error`; message.classList.add('cr-field__error'); descriptions.push(message.id); input.setAttribute('aria-invalid', 'true'); field.append(message); }
  if (descriptions.length) input.setAttribute('aria-describedby', descriptions.join(' '));
  if (onChange) input.addEventListener('input', event => onChange(event.currentTarget.value));
  return field;
}

export function SelectField({ id, label, value, options = [], onChange, disabled = false, required = false, helperText, error } = {}) {
  const field = TextField({ id, label, value, disabled, required, helperText, error });
  const old = field.querySelector('input');
  const select = el('select', 'cr-field__control');
  for (const attribute of old.attributes) if (!['type', 'value'].includes(attribute.name)) select.setAttribute(attribute.name, attribute.value);
  for (const option of options) { const node = el('option', '', option.label); node.value = String(option.value); select.append(node); }
  select.value = String(value ?? options[0]?.value ?? '');
  if (onChange) select.addEventListener('change', event => onChange(event.currentTarget.value));
  old.replaceWith(select);
  return field;
}

export function Choice({ id, label, description, checked = false, onChange, kind = 'checkbox', name, disabled = false } = {}) {
  if (!id || !label) throw new TypeError('Choice requires id and label.');
  const row = el('label', 'cr-choice');
  row.htmlFor = id;
  const control = el('input');
  Object.assign(control, { id, type: kind, checked, disabled });
  if (name) control.name = name;
  const copy = el('span', 'cr-row__copy');
  add(copy, [Text({ text: label, role: 'label', tag: 'span' }), description ? Text({ text: description, role: 'small', tag: 'span' }) : null]);
  add(row, [control, copy]);
  if (onChange) control.addEventListener('change', event => onChange(event.currentTarget.checked));
  return row;
}

export function Stepper({ label, value = 1, min = 1, max = 20, onChange } = {}) {
  const group = el('div', 'cr-stepper');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', label || 'Servings');
  let current = value;
  const output = el('output', 'cr-type cr-type--label', current);
  output.setAttribute('aria-live', 'polite');
  const change = delta => { current = Math.max(min, Math.min(max, current + delta)); output.textContent = String(current); minus.disabled = current <= min; plus.disabled = current >= max; onChange?.(current); };
  const minus = ActionButton({ label: '−', onPress: () => change(-1), size: 'compact', variant: 'secondary', disabled: current <= min });
  minus.setAttribute('aria-label', `Decrease ${label || 'servings'}`);
  const plus = ActionButton({ label: '+', onPress: () => change(1), size: 'compact', variant: 'secondary', disabled: current >= max });
  plus.setAttribute('aria-label', `Increase ${label || 'servings'}`);
  add(group, [minus, output, plus]);
  return group;
}

export function ActionBar({ primary, secondary } = {}) {
  return add(el('footer', 'cr-action-bar'), [secondary ? ActionButton({ ...secondary, variant: 'secondary' }) : null, primary ? ActionButton(primary) : null]);
}

export function Navigation({ items = [], activeId, onSelect } = {}) {
  const nav = el('nav', 'cr-navigation');
  nav.setAttribute('aria-label', 'Main');
  const list = el('ul');
  for (const item of items) {
    const link = el('a', '', item.icon ? undefined : item.label);
    link.href = item.href || `#${encodeURIComponent(item.id)}`;
    if (item.id === activeId) link.setAttribute('aria-current', 'page');
    if (item.icon) add(link, [Icon({ src: item.id === activeId ? item.activeIcon || item.icon : item.icon }), el('span', '', item.label)]);
    if (onSelect) link.addEventListener('click', event => { event.preventDefault(); onSelect(item.id); });
    list.append(add(el('li'), [link]));
  }
  return add(nav, [list]);
}

export function RecipeCard({ title, image, description, meta, overlapCount = 0, planned = false, onOpen } = {}) {
  const card = el('button', 'cr-recipe-card');
  card.type = 'button';
  const photo = el('img', 'cr-recipe-card__photo');
  photo.src = image; photo.alt = ''; photo.setAttribute('aria-hidden', 'true');
  if (planned) photo.classList.add('is-planned');
  add(card, [photo, Text({ text: title, role: 'label', tag: 'span' }), description ? Text({ text: description, role: 'small', tag: 'span' }) : null, meta ? Text({ text: meta, role: 'small', tag: 'span' }) : null, overlapCount > 0 ? Text({ text: `${overlapCount} shared ingredients`, role: 'label-small', tag: 'span' }) : null, planned ? Text({ text: 'In your plan', role: 'label-small', tag: 'span' }) : null]);
  if (onOpen) card.addEventListener('click', onOpen);
  return card;
}

export function IngredientRow({ id, label, quantity, checked = false, onChange, disabled = false } = {}) {
  return Choice({ id, label, description: quantity, checked, onChange, disabled });
}

export function Facts({ items = [] } = {}) {
  const list = el('dl', 'cr-facts');
  for (const { label, value } of items) list.append(add(el('div'), [el('dt', '', label), el('dd', '', value)]));
  return list;
}

export function ContentSection({ title, children = [], items } = {}) {
  return add(el('section', 'cr-section'), [title ? Text({ text: title, role: 'section', tag: 'h2' }) : null, ...(items || children)]);
}

export function Media({ src, alt = '', ratio } = {}) {
  const image = el('img', 'cr-media'); image.src = src; image.alt = alt;
  if (ratio) image.style.aspectRatio = ratio;
  return image;
}

export function Dialog({ title, description, primary, secondary, onDismiss } = {}) {
  const dialog = el('dialog', 'cr-dialog');
  const titleId = `cr-dialog-title-${++Dialog.nextId}`;
  const heading = Text({ text: title, role: 'section', tag: 'h2' });
  heading.id = titleId; heading.tabIndex = -1;
  dialog.setAttribute('aria-labelledby', titleId);
  add(dialog, [heading, description ? Text({ text: description }) : null]);
  if (description) { dialog.children[1].id = `${titleId}-description`; dialog.setAttribute('aria-describedby', `${titleId}-description`); }
  const action = (config, result) => config && ActionButton({ ...config, variant: result === 'secondary' ? 'secondary' : 'primary', onPress: config.onPress || (() => dialog.close(result)) });
  dialog.append(add(el('div', 'cr-dialog__actions'), [action(secondary, 'secondary'), action(primary, 'primary')]));
  let returnFocus;
  const nativeShow = dialog.showModal.bind(dialog);
  dialog.showModal = () => { returnFocus = document.activeElement; nativeShow(); heading.focus(); };
  const outside = event => {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  let outsidePress = false;
  dialog.addEventListener('pointerdown', event => { outsidePress = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => {
    if (outsidePress && event.target === dialog && outside(event)) dialog.close('dismiss');
    outsidePress = false;
  });
  dialog.addEventListener('close', () => { if (returnFocus?.isConnected) returnFocus.focus(); onDismiss?.(dialog.returnValue); });
  return dialog;
}
Dialog.nextId = 0;

export function AppShell({ title, subtitle, headerActions = [], content = [], actions, navigation } = {}) {
  const shell = el('div', 'cr-app-shell');
  const header = el('header', 'cr-app-header');
  add(header, [add(el('div', 'cr-app-header__actions'), headerActions), Text({ text: title, role: 'title', tag: 'h1' }), subtitle ? Text({ text: subtitle }) : null]);
  const main = add(el('main', 'cr-app-main'), content);
  return add(shell, [header, main, actions ? ActionBar(actions) : null, navigation ? Navigation(navigation) : null]);
}

/** One action for the full ingredients preview; preserve horizontal touch scrolling. */
export function IngredientGallery({ title = 'Ingredients', items = [], onPress } = {}) {
  const root = el('button', 'cr-ingredient-gallery'); root.type = 'button';
  root.setAttribute('aria-label', 'Show all ingredients');
  const header = add(el('span', 'cr-ingredient-gallery__header'), [Text({ text: title, role: 'label', tag: 'span' }), Text({ text: 'Show all', role: 'caption', tag: 'span' })]);
  const strip = el('span', 'cr-ingredient-gallery__strip'); strip.setAttribute('aria-hidden', 'true');
  for (const item of items) {
    const photo = el('img', 'cr-ingredient-gallery__photo'); photo.src = item.src; photo.alt = '';
    strip.append(add(el('span', 'cr-ingredient-gallery__item'), [photo, Text({ text: item.label, role: 'caption', tag: 'span' })]));
  }
  add(root, [header, strip]);
  let start, dragged = false;
  root.addEventListener('pointerdown', event => { start = [event.clientX, event.clientY]; dragged = false; });
  root.addEventListener('pointermove', event => { if (start && Math.hypot(event.clientX-start[0], event.clientY-start[1]) > 8) dragged = true; });
  root.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') dragged = false; });
  root.addEventListener('click', event => { if (dragged) event.preventDefault(); else onPress?.(event); start = null; dragged = false; });
  return root;
}
