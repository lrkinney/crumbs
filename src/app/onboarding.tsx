import { useLocalSearchParams } from 'expo-router';
import { OnboardingScreen } from '@/features/onboarding/onboarding-screen';
export default function Onboarding() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  return <OnboardingScreen key={edit ?? 'setup'} editing={edit} />;
}
