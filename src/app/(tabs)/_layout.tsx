import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { TabBar } from '@/components/navigation';
import { useApp } from '@/state/app-state';

export default function TabsLayout() {
  const { data } = useApp();
  if (!data.onboardingComplete) return <Redirect href="/onboarding" />;
  return <Tabs screenOptions={{ headerShown: false }} tabBar={props => <TabBar {...props} />}>
    <Tabs.Screen name="index" options={{ title: 'Home' }} /><Tabs.Screen name="plan" options={{ title: 'Plan' }} />
    <Tabs.Screen name="shop" options={{ title: 'Shop' }} /><Tabs.Screen name="cook" options={{ title: 'Cook' }} /><Tabs.Screen name="pantry" options={{ title: 'Pantry' }} />
  </Tabs>;
}
