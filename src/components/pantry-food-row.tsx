import { Pressable } from 'react-native';
import { FoodChevron, FoodImage } from './food-image';
import { Row, Stack, Text } from './ui';
import type { PantryItem } from '@/models/domain';
import { ingredientQuantity } from '@/services/quantities';
import { space } from '@/theme';

export function PantryFoodRow({ item, onPress }: { item: PantryItem; onPress: () => void }) {
  return <Pressable accessibilityRole="button"
    accessibilityLabel={`${item.label}, ${ingredientQuantity(item, 'pantry')}, ${item.storage}`} accessibilityHint="Edit pantry food"
    onPress={onPress} style={{ paddingVertical: space.xxs }}>
    <Row style={{ gap: space.md }}>
      <FoodImage foodId={item.foodId} />
      <Stack gap={space.xxs} style={{ flex: 1, minWidth: 0 }}><Text role="body-strong">{item.label}</Text><Text role="small" muted>{ingredientQuantity(item, 'pantry')} · {item.storage}</Text></Stack>
      <FoodChevron />
    </Row>
  </Pressable>;
}
