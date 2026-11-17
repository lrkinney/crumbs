import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Row, Stack, Text } from '@/components/ui';
import { colors, radius, space, token } from '@/theme';

export function ChoiceCard({ title, description, selected, onPress, multiple = false }: { title: string; description?: string; selected: boolean; onPress: () => void; multiple?: boolean }) {
  return <Pressable accessibilityRole={multiple ? 'checkbox' : 'radio'} accessibilityState={{ selected, checked: selected }} onPress={onPress} style={[styles.choice, selected && { backgroundColor: colors.success, borderColor: colors.brand }]}>
    <Row><Stack gap={token('foundation.space.2')} style={{ flex: 1 }}><Text role="label">{title}</Text>{description ? <Text role="small" muted>{description}</Text> : null}</Stack>
      <View style={styles.check}>{selected ? <Icon name="check" size={space.lg} color={colors.muted} /> : null}</View>
    </Row>
  </Pressable>;
}
const styles = StyleSheet.create({ choice: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.control, borderWidth: token('semantic.border.default'), borderColor: colors.border }, check: { width: space.lg, height: space.lg, borderWidth: token('semantic.border.default'), borderColor: colors.border, borderRadius: token('foundation.radius.4'), justifyContent: 'center', alignItems: 'center' } });
