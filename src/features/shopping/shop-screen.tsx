import { useState } from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { Button, Dialog, Icon, IconButton, Row, Stack, Text } from '@/components/ui';
import { AppScreen } from '@/components/app-screen';
import { useApp } from '@/state/app-state';
import { recordPurchases, shoppingList } from '@/services/planning';
import { ingredientQuantity, purchaseDetail } from '@/services/quantities';
import { colors, space, token } from '@/theme';

export function ShopScreen() {
  const { data, change, busy, error } = useApp();
  const items = shoppingList(data);
  const bought = items.filter(i => i.purchased).length;
  const aisles = [...new Set(items.map(i => i.aisle))];
  const [notice, setNotice] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [review, setReview] = useState(false);
  return <AppScreen title="Shopping List" largeTitle bodyGap={space.lg} headerLeft={<IconButton name="share" label="Share shopping list" onPress={() => setSharing(true)} />}
    footer={<Button label="Review purchased food" style={{ minHeight: token('component.button.height.default') }} onPress={() => setReview(true)} />}>
    {notice ? <Text accessibilityLiveRegion="polite">Purchased ingredients are now in your pantry.</Text> : null}
    {items.length ? <Text muted>{items.length} ingredients · {bought} checked</Text> : <Stack gap={space.md}>
      <Text role="section">{data.meals.some(m => m.status === 'planned') ? 'You’re stocked for your plan' : 'Nothing on your list yet'}</Text>
      <Text muted>{data.meals.some(m => m.status === 'planned') ? 'Your pantry covers the ingredients in your plan.' : 'Add a recipe to your plan and its ingredients will appear here, grouped for your grocery trip.'}</Text>
      <Button label={data.meals.some(m => m.status === 'planned') ? 'Start cooking' : 'Create a plan'} onPress={() => router.push(data.meals.some(m => m.status === 'planned') ? '/cook' : '/plan-setup')} />
    </Stack>}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    {aisles.map(aisle => <Stack key={aisle} gap={space.xs}><Text role="body-strong">{aisle}</Text>
      {items.filter(i => i.aisle === aisle).map(item => <Pressable key={item.key} accessibilityRole="checkbox" accessibilityLabel={`${item.label}, ${ingredientQuantity(item, 'shopping')}`} accessibilityState={{ checked: item.purchased, disabled: busy }} disabled={busy}
        onPress={() => void change(d => ({ ...d, purchasedKeys: d.purchasedKeys.includes(item.key) ? d.purchasedKeys.filter(k => k !== item.key) : [...d.purchasedKeys, item.key] }))}>
        <Row style={{ minHeight: token('component.control.min-height'), gap: space.sm }}>
          <Row style={{ width: space.lg, height: space.lg, justifyContent: 'center', borderWidth: token('semantic.border.default'), borderColor: colors.border, borderRadius: token('foundation.radius.4'), backgroundColor: item.purchased ? colors.brand : 'transparent' }}>{item.purchased ? <Icon name="check" color={colors.onBrand} size={token('component.icon.size.default')} /> : null}</Row>
          <Stack gap={space.xxs} style={{ flex: 1, minWidth: 0 }}><Text key={`${item.key}:${item.purchased ? 'checked' : 'unchecked'}`} style={item.purchased ? { textDecorationLine: 'line-through' } : undefined}>{item.label}</Text>{purchaseDetail(item) ? <Text role="small" muted>{purchaseDetail(item)}</Text> : null}</Stack><Text muted style={{ maxWidth: '45%', flexShrink: 1, textAlign: 'right' }}>{ingredientQuantity(item, 'shopping')}</Text>
        </Row>
      </Pressable>)}
    </Stack>)}
    <Dialog visible={review} title="Put groceries away" onClose={() => setReview(false)}><Text>{bought ? `${bought} checked ingredients are ready to move into your pantry.` : 'Check off the ingredients you bought, then review them here.'}</Text>
      <Button label="Add checked food to pantry" busy={busy} disabled={!bought} onPress={async () => { if (await change(recordPurchases)) { setReview(false); setNotice(true); } }} /><Button label="Back to shopping" variant="secondary" onPress={() => setReview(false)} />
    </Dialog>
    <Dialog visible={sharing} title="Share your shopping list" onClose={() => setSharing(false)}><Text>Your list is currently saved on this device. Household sharing can be connected when accounts are added.</Text><Button label="Back to my list" onPress={() => setSharing(false)} /></Dialog>
  </AppScreen>;
}
