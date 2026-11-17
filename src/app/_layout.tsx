import { useEffect, type PropsWithChildren } from 'react';
import { ActivityIndicator, StyleSheet, Text as NativeText, View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '@/state/app-state';
import { Button, Card, Screen, Stack as VStack, Text } from '@/components/ui';
import { fontSources } from '@/theme/fonts';
import { colors, space } from '@/theme';

void SplashScreen.preventAutoHideAsync().catch(() => {});
function DataGate({ children }: PropsWithChildren) {
  const { ready, loadError, error, retry, reset, busy, clearError } = useApp();
  if (loadError) return <Screen title="Let’s reconnect your kitchen"><Text>{loadError}</Text>{error ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text> : null}<Button label="Retry loading" onPress={retry} /><Button label="Start a fresh demo" variant="secondary" busy={busy} onPress={() => void reset()} /></Screen>;
  if (!ready) return <View style={styles.loading}><ActivityIndicator color={colors.brand} accessibilityLabel="Loading your kitchen" /></View>;
  return <View style={styles.root}>{error ? <SafeAreaView edges={['top']} style={styles.error}><Card><VStack><Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text><Button label="Dismiss" compact variant="ghost" onPress={clearError} /></VStack></Card></SafeAreaView> : null}{children}</View>;
}
export default function RootLayout() {
  const [loaded, fontError] = useFonts(fontSources);
  useEffect(() => { if (loaded || fontError) void SplashScreen.hideAsync(); }, [loaded, fontError]);
  if (!loaded && !fontError) return null;
  if (fontError) return <SafeAreaProvider><SafeAreaView style={styles.loading}><NativeText>CRUMBS couldn’t load its fonts. Reload the app to try again.</NativeText></SafeAreaView></SafeAreaProvider>;
  return <SafeAreaProvider><StatusBar style="dark" /><AppProvider><DataGate>
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
      <Stack.Screen name="(tabs)" /><Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
    </Stack>
  </DataGate></AppProvider></SafeAreaProvider>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.canvas }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas, padding: space.gutter }, error: { paddingHorizontal: space.gutter, backgroundColor: colors.canvas } });
