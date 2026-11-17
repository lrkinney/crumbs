import { Image } from 'expo-image';
import { View } from 'react-native';
import { colors, token } from '@/theme';
import { layout } from '@/theme/layout';
import { Icon } from '@/components/ui';

const images: Record<string, number> = {
  chicken: require('../../assets/crumbs/crumbs-ingredient-image-chicken-breast-194-2195.png'),
  sriracha: require('../../assets/crumbs/crumbs-ingredient-image-sriracha-195-2196.png'),
  honey: require('../../assets/crumbs/crumbs-ingredient-image-honey-195-2197.png'),
  'olive-oil': require('../../assets/crumbs/crumbs-ingredient-image-olive-oil-195-2198.png'),
  'coconut-aminos': require('../../assets/crumbs/crumbs-ingredient-image-coconut-aminos-195-2199.png'),
  'lime-juice': require('../../assets/crumbs/crumbs-ingredient-image-lime-juice-195-2200.png'),
  garlic: require('../../assets/crumbs/crumbs-ingredient-image-garlic-195-2201.png'),
};
export function FoodImage({ foodId }: { foodId: string }) {
  if (!images[foodId]) return <View style={{ width: layout.ingredientPhoto, height: layout.ingredientPhoto, alignItems: 'center', justifyContent: 'center' }}><Icon name="vegetarianFood32" size={32} color={colors.muted} /></View>;
  return <Image source={images[foodId]} style={{ width: layout.ingredientPhoto, height: layout.ingredientPhoto }} contentFit="contain" accessible={false} />;
}
export function FoodChevron() {
  // Native borders keep this navigation cue visible without an SVG image decoder.
  return <View testID="pantry-chevron" accessible={false} pointerEvents="none" style={{
    width: token('foundation.space.40'), height: token('foundation.space.40'), padding: token('foundation.space.8'),
    flexShrink: 0, alignItems: 'center', justifyContent: 'center',
  }}>
    <View style={{ width: token('component.icon.size.large'), height: token('component.icon.size.large'), alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: token('foundation.space.10'), height: token('foundation.space.10'),
        borderTopWidth: token('foundation.border.2'), borderRightWidth: token('foundation.border.2'),
        borderColor: colors.muted, transform: [{ rotate: '45deg' }],
      }} />
    </View>
  </View>;
}
