import { createContext, useContext, useRef, useState, type PropsWithChildren, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text as NativeText, TextInput, View,
  type StyleProp, type TextProps, type TextStyle, type ViewStyle, type TextInputProps, type ScrollViewInstance, type TextInputInstance } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, space, token, typography, type TypeRole } from '@/theme';
import { icons } from '@/theme/icons.generated';
import { layout } from '@/theme/layout';

export function Text({ role = 'body', muted, style, ...props }: Omit<TextProps, 'role'> & { role?: TypeRole; muted?: boolean }) {
  return <NativeText {...props} style={[typography[role], { color: muted ? colors.muted : colors.ink }, style]} />;
}
const iconIds = { vegetarianFood: '382:13248', vegetarianFood16: '382:13245', vegetarianFood24: '382:13242', vegetarianFood32: '382:13251', vegetarianFood48: '382:13248', home: '100:775', plan: '100:780', shop: '100:785', cook: '100:790', pantry: '100:795',
  back: '78:3643', add: '104:929', minus: '104:926', check: '104:932', arrow: '104:935', user: '100:800',
  search: '100:805', layers: '96:771', fire: '104:938', chef: '104:944',
  share: '78:3752', filter: '78:3856', whisk: '104:941', dollar: '104:953',
  homeSelected: '103:771', planSelected: '103:777', shopSelected: '103:783', cookSelected: '103:789', pantrySelected: '103:795',
  minusCircle: '136:2372', plusCircle: '136:2377' } as const;
export type IconName = keyof typeof iconIds;
export function Icon({ name, color = colors.ink, size = token('component.icon.size.large') }: { name: IconName; color?: string; size?: number }) {
  return <Image source={{ uri: icons[iconIds[name]] }} tintColor={color} style={{ width: size, height: size }} contentFit="contain" accessible={false} />;
}
export function Stack({ children, style, gap = space.md }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; gap?: number }>) {
  return <View style={[{ gap }, style]}>{children}</View>;
}
export function Row({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.row, style]}>{children}</View>;
}
export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function Button({ label, onPress, variant = 'primary', disabled, busy, icon, compact, accessibilityLabel, testID, style }: {
  label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean; busy?: boolean;
  icon?: IconName; compact?: boolean; accessibilityLabel?: string; testID?: string; style?: StyleProp<ViewStyle>;
}) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inactive = disabled || busy;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} accessibilityState={{ disabled: !!inactive, busy: !!busy }}
    disabled={inactive} onPress={onPress} testID={testID} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}
    style={({ pressed }) => [styles.button, compact && { minHeight: token('component.button.height.compact') }, {
      backgroundColor: variant === 'primary' ? token(pressed ? 'semantic.color.action.primary-pressed' : hovered || focused ? 'semantic.color.action.primary-hover' : 'semantic.color.action.primary')
        : variant === 'secondary' ? token(pressed ? 'semantic.color.action.secondary-pressed' : 'semantic.color.action.secondary') : 'transparent',
      borderColor: focused ? colors.focus : 'transparent', opacity: inactive ? token('component.control.opacity.disabled') : 1,
    }, style]}>
    {({ pressed }) => {
      const color = variant === 'primary' && (!(hovered || focused) || pressed) ? colors.onBrand : colors.ink;
      return <>{busy ? <ActivityIndicator color={color} /> : icon ? <Icon name={icon} color={color} /> : null}<Text role="body" style={{ color: variant === 'ghost' ? colors.brand : color, textAlign: 'center', flexShrink: 1 }}>{label}</Text></>;
    }}
  </Pressable>;
}
export function IconButton({ name, label, onPress, disabled, compact, bare }: { name: IconName; label: string; onPress: () => void; disabled?: boolean; compact?: boolean; bare?: boolean }) {
  const [focus, setFocus] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} accessibilityState={{ disabled: !!disabled }}
    onPress={onPress} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} hitSlop={compact ? space.xxs : undefined} style={({ pressed }) => [styles.iconButton, compact && { minWidth: token('foundation.space.40'), minHeight: token('foundation.space.40') },
      { backgroundColor: bare ? 'transparent' : pressed ? token('semantic.color.action.secondary-pressed') : colors.subtle, borderColor: focus ? colors.focus : 'transparent', opacity: disabled ? token('component.control.opacity.disabled') : 1 }]}>
    <Icon name={name} size={compact ? token('component.icon.size.default') : token('component.icon.size.large')} />
  </Pressable>;
}
export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const style = [styles.chip, selected && { backgroundColor: colors.brand }];
  const content = <Text role="small" style={{ color: selected ? colors.onBrand : colors.ink }}>{label}</Text>;
  return onPress ? <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!selected }} style={style}>{content}</Pressable> : <View style={style}>{content}</View>;
}
const KeyboardScrollContext = createContext<React.RefObject<ScrollViewInstance | null> | null>(null);

export function KeyboardAwareTextInput(props: TextInputProps) {
  const input = useRef<TextInputInstance>(null);
  const scroll = useContext(KeyboardScrollContext);
  return <TextInput ref={input} {...props} onFocus={event => {
    props.onFocus?.(event);
    const scrollToInput = () => {
      if (input.current && scroll?.current) {
        scroll.current.scrollResponderScrollNativeHandleToKeyboard(input.current, space.xxl * 2, true);
      }
    };
    requestAnimationFrame(() => {
      scrollToInput();
      setTimeout(scrollToInput, 350);
    });
  }} />;
}

export function Field({ label, error, style, ...props }: TextInputProps & { label: string; error?: string }) {
  const [focus, setFocus] = useState(false);
  const input = useRef<TextInputInstance>(null);
  const scroll = useContext(KeyboardScrollContext);
  return <Stack gap={space.xs}>
    <Text role="body-strong">{label}</Text>
    <TextInput ref={input} {...props} accessibilityLabel={label} placeholderTextColor={colors.muted} onFocus={event => {
      props.onFocus?.(event);
      setFocus(true);
      // The ref itself is supported by RN's scroll responder. `_nativeTag` is
      // an internal detail and is absent on some Fabric/device combinations.
      const scrollToInput = () => {
        if (input.current && scroll?.current) {
          scroll.current.scrollResponderScrollNativeHandleToKeyboard(input.current, space.xxl * 2, true);
        }
      };
      requestAnimationFrame(() => {
        scrollToInput();
        // Let the keyboard finish resizing the window before the final scroll.
        setTimeout(scrollToInput, 350);
      });
    }} onBlur={event => { props.onBlur?.(event); setFocus(false); }}
      style={[styles.field, typography.body, { color: colors.ink, borderColor: error ? colors.error : focus ? colors.focus : colors.border }, style]} />
    {error ? <Text role="small" accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text> : null}
  </Stack>;
}
export function Stepper({ label, value, onChange, min = 1, max = 12, disabled, bare }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; disabled?: boolean; bare?: boolean }) {
  return <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
    <Text role="label">{label}</Text>
    <Row><IconButton bare={bare} name="minus" label={`Decrease ${label.toLowerCase()}`} disabled={disabled || value <= min} onPress={() => onChange(value - 1)} />
      <Text role="body-strong" accessibilityLiveRegion="polite" style={{ minWidth: space.lg, textAlign: 'center' }}>{value}</Text>
      <IconButton bare={bare} name="add" label={`Increase ${label.toLowerCase()}`} disabled={disabled || value >= max} onPress={() => onChange(value + 1)} /></Row>
  </Row>;
}
export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}><Text role="section" accessibilityRole="header">{title}</Text>{action}</Row>;
}
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <Card><Icon name="layers" size={token('component.icon.size.xlarge')} /><Text role="card">{title}</Text><Text muted>{description}</Text>{action}</Card>;
}
export function Screen({ children, title, subtitle, back, headerAction, footer, scroll = true, footerSafeArea = true, contentStyle, header, footerContentStyle, largeTitle }: PropsWithChildren<{
  title?: string; subtitle?: string; back?: () => void; headerAction?: ReactNode; footer?: ReactNode; scroll?: boolean; footerSafeArea?: boolean;
  contentStyle?: StyleProp<ViewStyle>; header?: ReactNode; footerContentStyle?: StyleProp<ViewStyle>; largeTitle?: boolean;
}>) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const content = <View style={[styles.content, contentStyle]}>
    {header}
    {back || headerAction ? <Row style={{ justifyContent: 'space-between' }}>{back ? <IconButton name="back" label="Go back" onPress={back} /> : <View />}{headerAction}</Row> : null}
    {title ? <Stack gap={space.xs}><Text role={largeTitle ? 'display' : 'title'} accessibilityRole="header">{title}</Text>{subtitle ? <Text muted>{subtitle}</Text> : null}</Stack> : null}
    {children}
  </View>;
  return <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? <KeyboardScrollContext.Provider value={scrollRef}><ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll, { paddingBottom: space.xxl * 3 }]}>{content}</ScrollView></KeyboardScrollContext.Provider> : content}
      {footer ? <SafeAreaView edges={footerSafeArea ? ['bottom'] : []} style={styles.footer}><View style={[styles.footerInner, footerContentStyle]}>{footer}</View></SafeAreaView> : null}
    </SafeAreaView>
  </KeyboardAvoidingView>;
}
export function Dialog({ title, children, visible, onClose }: PropsWithChildren<{ title: string; visible: boolean; onClose: () => void }>) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close dialog" testID="dialog-backdrop" />
      <SafeAreaView style={styles.dialogSafe} pointerEvents="box-none">
        <View style={styles.dialog} accessibilityViewIsModal>
          <KeyboardScrollContext.Provider value={scrollRef}><ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" automaticallyAdjustKeyboardInsets contentContainerStyle={{ flexGrow: 1, paddingBottom: space.xxl * 2 }}><Stack gap={space.md}><Text role="section" accessibilityRole="header">{title}</Text>{children}</Stack></ScrollView></KeyboardScrollContext.Provider>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  </Modal>;
}
export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  card: { padding: token('component.card.padding'), gap: token('component.card.gap'), borderRadius: radius.card, backgroundColor: colors.card },
  button: { minHeight: layout.buttonHeight, borderRadius: radius.control, paddingHorizontal: token('component.button.padding-inline'), paddingVertical: space.sm,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: token('component.button.gap'), borderWidth: token('component.focus.ring-width') },
  iconButton: { minWidth: token('component.control.min-height'), minHeight: token('component.control.min-height'), borderRadius: radius.control, borderWidth: token('component.focus.ring-width'), justifyContent: 'center', alignItems: 'center' },
  chip: { paddingHorizontal: space.sm, paddingVertical: space.xs, borderRadius: radius.pill, backgroundColor: colors.subtle, minHeight: token('component.control.min-height'), justifyContent: 'center' },
  field: { backgroundColor: colors.card, minHeight: layout.fieldHeight, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.control, borderWidth: token('semantic.border.default') },
  safe: { flex: 1, backgroundColor: colors.canvas }, scroll: { flexGrow: 1, alignItems: 'center' },
  content: { width: '100%', maxWidth: layout.canvasWidth, paddingHorizontal: space.gutter, paddingTop: layout.headerTop, paddingBottom: space.lg, gap: token('component.screen.section-gap') },
  footer: { backgroundColor: colors.canvas, alignItems: 'center' },
  footerInner: { width: '100%', maxWidth: layout.canvasWidth, padding: token('component.action-bar.padding'), gap: token('component.action-bar.gap') },
  backdrop: { flex: 1, backgroundColor: `rgba(0,0,0,${token('component.dialog.backdrop.opacity')})`, alignItems: 'center', justifyContent: 'center' },
  dialogSafe: { width: '100%', maxWidth: layout.canvasWidth, maxHeight: '95%', padding: space.sm },
  dialog: { backgroundColor: colors.canvas, padding: space.gutter, borderRadius: radius.control, flexShrink: 1 },
});

export const textStyles: Record<string, TextStyle> = { link: { color: colors.brand, textDecorationLine: 'underline' } };
// Keep platform-specific behavior at renderer boundaries.
export const isWeb = Platform.OS === 'web';
