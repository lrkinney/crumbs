import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Card, Chip, Dialog, Field, Row, Screen, SectionHeading, Stepper, Text } from '@/components/ui';
import { typeRoles } from '@/theme';
import { TimeSlider } from '@/components/ui/time-slider';

export function LibraryScreen() {
  const [count, setCount] = useState(2);
  const [value, setValue] = useState('');
  const [dialog, setDialog] = useState(false);
  const [minutes, setMinutes] = useState(30);
  return <Screen title="Component library" subtitle="Live React Native components using the Figma tokens." back={() => router.back()}>
    <SectionHeading title="Typography" /><Card>{typeRoles.map(role => <Text key={role} role={role}>{role} · Something delicious</Text>)}</Card>
    <SectionHeading title="Actions" /><Button label="Primary action" onPress={() => setDialog(true)} /><Button label="Secondary action" variant="secondary" onPress={() => setDialog(true)} /><Button label="Disabled action" disabled onPress={() => {}} /><Button label="Saving" busy onPress={() => {}} />
    <SectionHeading title="Inputs" /><Field label="Ingredient name" value={value} onChangeText={setValue} placeholder="Start typing" /><Field label="Error example" error="Choose an ingredient to continue." value="" editable={false} />
    <Card><Stepper label="Servings" value={count} onChange={setCount} /></Card><Row><Chip label="Selected" selected /><Chip label="Default" /></Row>
    <SectionHeading title="Total time" /><TimeSlider value={minutes} onChange={setMinutes} />
    <Dialog title="A reusable dialog" visible={dialog} onClose={() => setDialog(false)}><Text>The same dialog primitive powers adding meals, editing pantry items, and confirmations.</Text><Button label="Close dialog" onPress={() => setDialog(false)} /></Dialog>
  </Screen>;
}
