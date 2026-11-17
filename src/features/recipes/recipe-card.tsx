import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Icon, Row, Stack, Text } from '@/components/ui';
import type { Recipe } from '@/models/domain';
import { colors, space, token } from '@/theme';
import { layout, recipeTileWidth } from '@/theme/layout';
import { money } from '@/services/planning';
import { recipePresentation } from '@/fixtures/recipe-presentation';

/** Onboarding collage only: it positions these original exports by hand. */
export const recipeImages = {
  chicken: require('../../../assets/crumbs/crumbs-food-image-recipe-honey-sriracha-chicken-100-806.png'),
  souvlaki: require('../../../assets/crumbs/crumbs-food-image-recipe-chicken-souvlaki-100-808.png'),
  ratatouille: require('../../../assets/crumbs/crumbs-food-image-recipe-tomato-lentil-ratatouille-100-810.png'),
  tofu: require('../../../assets/crumbs/crumbs-food-image-recipe-tofu-piccata-100-812.png'),
  toasts: require('../../../assets/crumbs/crumbs-food-image-recipe-additional-recipe-image-114-1096.png'),
};
// Square plates with one plate size/position and the soft shadow fully inside the image (scripts/normalize-plates.py).
// hero: detail, plan rows, cooking.  tile: Browse tiles and the Home meal card, where the plate fills more of the frame.
const plates = {
  hero: {
    chicken: require('../../../assets/crumbs/plates/hero/chicken.png'), souvlaki: require('../../../assets/crumbs/plates/hero/souvlaki.png'),
    ratatouille: require('../../../assets/crumbs/plates/hero/ratatouille.png'), tofu: require('../../../assets/crumbs/plates/hero/tofu.png'),
    toasts: require('../../../assets/crumbs/plates/hero/toasts.png'), placeholder: require('../../../assets/crumbs/plates/hero/placeholder.png'),
  },
  tile: {
    chicken: require('../../../assets/crumbs/plates/tile/chicken.png'), souvlaki: require('../../../assets/crumbs/plates/tile/souvlaki.png'),
    ratatouille: require('../../../assets/crumbs/plates/tile/ratatouille.png'), tofu: require('../../../assets/crumbs/plates/tile/tofu.png'),
    toasts: require('../../../assets/crumbs/plates/tile/toasts.png'), placeholder: require('../../../assets/crumbs/plates/tile/placeholder.png'),
  },
};
export function recipePlate(recipe: Recipe, kind: 'hero' | 'tile' = 'hero') {
  return plates[kind][recipe.image ?? 'placeholder'];
}
export function RecipeImage({ recipe, large, size, compact }: { recipe: Recipe; large?: boolean; size?: number; compact?: boolean }) {
  return <View style={{ alignItems: 'center', width: compact ? size : '100%' }}><Image source={recipePlate(recipe)} style={{ width: size ?? (large ? layout.heroPlate : layout.journeyPlate), aspectRatio: 1, maxWidth: '100%' }}
    contentFit="contain" accessibilityLabel={recipePresentation[recipe.id]?.title ?? recipe.title} /></View>;
}
/** Figma Recipe Card 112:1075: unboxed image, 12pt gap, label, compact facts. */
export function RecipeCard({ recipe, planned, overlap, width }: { recipe: Recipe; planned?: boolean; overlap?: number; width?: number }) {
  const p = recipePresentation[recipe.id];
  return <Pressable accessibilityRole="button" accessibilityLabel={`View ${p?.title ?? recipe.title}`} testID={`recipe-tile-${recipe.id}`}
    onPress={() => router.push({ pathname: '/recipes/[id]', params: { id: recipe.id } })} style={[styles.tile, width ? { width } : { flex: 1 }]}>
    <View style={styles.artwork}>
      <Image source={recipePlate(recipe, 'tile')} style={[styles.tileImage, planned && { opacity: token('component.media.opacity.planned') }]} contentFit="contain" accessible={false} />
      {planned ? <View style={styles.planned}><Text role="body-strong" muted>Already Planned</Text></View> : null}
      {overlap && !planned ? <Row style={styles.overlap}><Text role="caption" style={{ color: colors.onBrand }}>{overlap}</Text><Icon name="layers" size={token('component.icon.size.small')} color={colors.onBrand} /></Row> : null}
    </View>
    <Stack gap={0}><Text role="body-strong" muted>{p?.title ?? recipe.title}</Text>
      <Row style={{ justifyContent: 'space-between', gap: space.xxs }}><Text role="caption" muted>{p?.tileCalories ?? '—'} kcal.</Text><Text role="caption" muted>{p?.priceMinor != null ? money(p.priceMinor) : '$—'}/serving</Text></Row>
    </Stack>
  </Pressable>;
}
export function RecipeGrid({ recipes, plannedIds = [], overlapFor }: { recipes: Recipe[]; plannedIds?: string[]; overlapFor?: (recipe: Recipe) => number }) {
  const viewport = useWindowDimensions();
  const [width, setWidth] = useState(recipeTileWidth(viewport.width) * 2 + layout.gridGap);
  const tileWidth = (width - layout.gridGap) / 2;
  return <View testID="recipe-grid" style={styles.grid} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
    {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} width={tileWidth} planned={plannedIds.includes(recipe.id)} overlap={overlapFor?.(recipe)} />)}
  </View>;
}
const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: layout.gridGap, rowGap: layout.gridGap, alignItems: 'flex-start' },
  tile: { gap: layout.tileGap }, artwork: { width: '100%', aspectRatio: 1 }, tileImage: { width: '100%', height: '100%' },
  planned: { position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center' },
  overlap: { position: 'absolute', top: space.xs, right: space.xs, gap: space.xxs, backgroundColor: token('semantic.color.overlap.surface'), borderRadius: token('semantic.radius.control'), paddingHorizontal: space.xs, paddingVertical: token('foundation.space.2') },
});
