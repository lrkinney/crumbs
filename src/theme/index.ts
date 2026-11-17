import { type TextStyle } from 'react-native';
import { token } from './tokens.generated';

export { token } from './tokens.generated';
export const colors = {
  canvas: token('semantic.color.surface.canvas'), card: token('semantic.color.surface.card'),
  subtle: token('semantic.color.surface.subtle'), ink: token('semantic.color.text.primary'),
  muted: token('semantic.color.text.secondary'), brand: token('semantic.color.action.primary'),
  onBrand: token('semantic.color.text.on-action'), border: token('semantic.color.border.default'),
  focus: token('semantic.color.border.focus'), error: token('semantic.color.status.error-text'),
  errorSurface: token('semantic.color.status.error-surface'), success: token('semantic.color.status.success-surface'),
};
export const space = {
  xxs: token('foundation.space.4'), xs: token('foundation.space.8'), sm: token('foundation.space.12'),
  md: token('foundation.space.16'), lg: token('foundation.space.24'), xl: token('foundation.space.32'),
  xxl: token('foundation.space.48'), gutter: token('component.screen.gutter'),
};
export const radius = { control: token('semantic.radius.control'), card: token('component.card.radius'), pill: token('semantic.radius.pill') };
export const typeRoles = ['display', 'title', 'section', 'card', 'body', 'body-strong', 'small', 'caption', 'label', 'label-small', 'button', 'navigation'] as const;
export type TypeRole = (typeof typeRoles)[number];
// Load the actual static font faces, avoiding synthesized weights on native platforms.
export const typography = Object.fromEntries(typeRoles.map(role => [role, {
  fontSize: token(`semantic.type.${role}.size`),
  lineHeight: token(`semantic.type.${role}.line`),
  letterSpacing: token(`semantic.type.${role}.tracking`),
  fontFamily: ['display', 'title', 'section', 'card'].includes(role) ? 'LingoMedium'
    : token(`semantic.type.${role}.weight`) >= 600 ? 'MatterSemibold'
    : token(`semantic.type.${role}.weight`) >= 500 ? 'MatterMedium' : 'MatterRegular',
}])) as Record<TypeRole, TextStyle>;
export const shadow = {
  boxShadow: [{ offsetX: token('component.elevation.soft.offset-x'), offsetY: token('component.elevation.control.offset-y'),
    blurRadius: token('component.elevation.soft.blur'), spreadDistance: token('component.elevation.soft.spread'), color: token('component.elevation.soft.color') }],
};
