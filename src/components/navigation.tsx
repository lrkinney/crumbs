import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { router } from 'expo-router';
import { Icon, Text, type IconName } from '@/components/ui';
import { colors, space, token } from '@/theme';
import { layout } from '@/theme/layout';

const items: Record<string, { label: string; icon: IconName; selectedIcon: IconName }> = {
  index: { label: 'Home', icon: 'home', selectedIcon: 'homeSelected' }, plan: { label: 'Plan', icon: 'plan', selectedIcon: 'planSelected' }, shop: { label: 'Shop', icon: 'shop', selectedIcon: 'shopSelected' },
  cook: { label: 'Cook', icon: 'cook', selectedIcon: 'cookSelected' }, pantry: { label: 'Pantry', icon: 'pantry', selectedIcon: 'pantrySelected' },
};
export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.bar, { paddingBottom: insets.bottom + layout.navPadding }]}><View style={styles.inner}>
    {state.routes.map((route, index) => {
      const item = items[route.name]; if (!item) return null;
      const selected = state.index === index;
      return <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected }}
        style={({ pressed }) => [styles.tab, { opacity: pressed ? token('component.control.opacity.disabled') : 1 }]}
        onPress={() => { const e = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (!selected && !e.defaultPrevented) navigateToTab(route.key); }}
        onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}>
        <Icon name={selected ? item.selectedIcon : item.icon} color={selected ? colors.brand : colors.muted} /><Text role={selected ? 'label-small' : 'small'} style={{ color: selected ? colors.brand : colors.muted }}>{item.label}</Text>
      </Pressable>;
    })}
  </View></View>;
}
export function StandaloneTabs({ active }: { active: 'index' | 'plan' | 'shop' | 'cook' | 'pantry' }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.bar, { paddingBottom: insets.bottom + layout.navPadding }]}><View style={styles.inner}>
    {Object.entries(items).map(([key, item]) => <Pressable key={key} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: key === active }} style={styles.tab}
      onPress={() => router.navigate(key === 'index' ? '/' : key === 'plan' ? '/plan' : key === 'shop' ? '/shop' : key === 'cook' ? '/cook' : '/pantry')}>
      <Icon name={key === active ? item.selectedIcon : item.icon} color={key === active ? colors.brand : colors.muted} /><Text role={key === active ? 'label-small' : 'small'} style={{ color: key === active ? colors.brand : colors.muted }}>{item.label}</Text>
    </Pressable>)}
  </View></View>;
}
const styles = StyleSheet.create({
  bar: { backgroundColor: colors.canvas, alignItems: 'center', paddingTop: layout.navPadding,
    boxShadow: [{ offsetX: 0, offsetY: token('component.elevation.navigation.offset-y'), blurRadius: token('component.elevation.soft.blur'), color: token('component.elevation.soft.color') }] },
  inner: { flexDirection: 'row', width: '100%', maxWidth: layout.canvasWidth, paddingHorizontal: space.gutter * 2 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: layout.navLabelGap, minHeight: token('foundation.space.48') - token('foundation.space.2') },
});
