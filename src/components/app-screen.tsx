import { type PropsWithChildren, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { Icon, IconButton, Row, Screen, Stack, Text, type IconName } from '@/components/ui';
import { useApp } from '@/state/app-state';
import { colors, radius, space, token, type TypeRole } from '@/theme';
import { layout } from '@/theme/layout';
import { StandaloneTabs } from '@/components/navigation';

export function ProfileLink() {
  const { data } = useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel="Your kitchen and household" onPress={() => router.push('/household')} style={styles.profile}>
    <Text role="label" muted>{data.household.name}</Text><Icon name="user" color={colors.muted} />
  </Pressable>;
}
export function AppScreen({ title, subtitle, children, back = true, largeTitle, titleRole, bodyGap = layout.journeyBodyGap, footer, headerLeft, footerSafeArea = false, navigation }: PropsWithChildren<{
  title: string; subtitle?: string; back?: boolean; largeTitle?: boolean; titleRole?: TypeRole; bodyGap?: number;
  footer?: ReactNode; headerLeft?: ReactNode; footerSafeArea?: boolean;
  navigation?: 'index' | 'plan' | 'shop' | 'cook' | 'pantry';
}>) {
  return <View style={{ flex: 1 }}><Screen footer={footer} footerSafeArea={footerSafeArea} contentStyle={{ gap: bodyGap }}
    header={<Stack gap={layout.headerTitleGap}>
      <Row style={styles.header}>{headerLeft ?? (back ? <IconButton name="back" label="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} /> : <View />)}<ProfileLink /></Row>
      <Stack gap={layout.subtitleGap}><Text role={titleRole ?? (largeTitle ? 'display' : 'title')} accessibilityRole="header">{title}</Text>{subtitle ? <Text muted>{subtitle}</Text> : null}</Stack>
    </Stack>}>
    {children}
  </Screen>{navigation ? <StandaloneTabs active={navigation} /> : null}</View>;
}
export function SettingsRow({ title, description, onPress, value, style }: { title: string; description?: string; onPress: () => void; value?: string; style?: StyleProp<ViewStyle> }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.settingsRow, pressed && { backgroundColor: colors.subtle }, style]}>
    <Row style={{ justifyContent: 'space-between' }}><Stack gap={space.xxs} style={{ flex: 1 }}>
      <Text role={value ? 'body' : 'label'} muted={!!value}>{title}</Text>{value ? <Text role="label">{value}</Text> : null}
    </Stack><Text muted>›</Text></Row>{description ? <Text role="small">{description}</Text> : null}
  </Pressable>;
}
export function InfoCard({ title, description, meta, emphasized, children, largeTitle }: PropsWithChildren<{ title: string; description?: string; meta?: string; emphasized?: boolean; largeTitle?: boolean }>) {
  return <Stack gap={space.xs} style={[styles.infoCard, emphasized && { backgroundColor: colors.subtle }]}>
    <Text role={largeTitle ? 'section' : 'card'}>{title}</Text>{description ? <Text>{description}</Text> : null}{meta ? <Text role="label-small" style={{ color: colors.brand }}>{meta}</Text> : null}{children}
  </Stack>;
}
export function FeatureRow({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  return <Row><Icon name={icon} color={colors.muted} /><Stack gap={space.xs} style={{ flex: 1 }}><Text role="label">{title}</Text><Text muted>{description}</Text></Stack></Row>;
}
const styles = StyleSheet.create({
  header: { minHeight: token('component.control.min-height'), justifyContent: 'space-between' },
  profile: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.xs, minHeight: token('component.control.min-height') },
  settingsRow: { backgroundColor: colors.card, borderRadius: radius.control, padding: token('component.row.padding'), gap: token('component.row.gap') },
  infoCard: { backgroundColor: colors.card, borderRadius: radius.card, padding: token('component.card.padding') },
});
