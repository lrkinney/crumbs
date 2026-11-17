import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Button, Row, Stack, Text } from '@/components/ui';
import { recipeImages, recipePlaceholder } from '@/features/recipes/recipe-card';
import { recipePresentation } from '@/fixtures/recipe-presentation';
import type { Meal, Recipe } from '@/models/domain';
import { space, token } from '@/theme';

/**
 * A planned meal on Home: plate, title, meta, status and one action.
 * The action is "Begin Cooking" for a planned meal today, "Review Plan" when previewing another day.
 */
export function PlannedMealCard({ meal, recipe, isToday, onOpen, onCook, onReview }: {
  meal: Meal; recipe: Recipe; isToday: boolean; onOpen: () => void; onCook: () => void; onReview: () => void;
}) {
  const title = recipePresentation[recipe.id]?.title ?? recipe.title;
  const canCook = isToday && meal.status === 'planned';
  return <Stack gap={space.md}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${title}`} onPress={onOpen}>
      <Row style={{ gap: space.gutter, alignItems: 'center' }}>
        <Image source={recipe.image ? recipeImages[recipe.image] : recipePlaceholder} contentFit="contain" accessible={false}
          style={{ width: token('component.screen.action-bar-height'), aspectRatio: 1 }} />
        <Stack gap={space.xxs} style={{ flex: 1 }}>
          <Text role="section">{title}</Text>
          <Stack gap={0}>
            <Text>{recipe.minutes} min · {meal.servings} {meal.servings === 1 ? 'serving' : 'servings'}</Text>
            <Text>{meal.status === 'cooked' ? 'Cooked' : 'Planned'}</Text>
          </Stack>
        </Stack>
      </Row>
    </Pressable>
    <Button label={canCook ? 'Begin Cooking' : 'Review Plan'} onPress={canCook ? onCook : onReview} />
  </Stack>;
}
