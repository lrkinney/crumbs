import { router } from 'expo-router';
import { Button, Screen, Text } from '@/components/ui';
export default function NotFound() { return <Screen title="A little off the menu"><Text>We couldn’t find that page.</Text><Button label="Back to my kitchen" onPress={() => router.replace('/')} /></Screen>; }
