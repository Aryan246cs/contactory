import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { getOnboardingComplete } from '@/database/database';
import { HomeScreen } from '@/features/home/HomeScreen';

export default function Index() {
  const [complete, setComplete] = useState<boolean | null>(null);
  useEffect(() => { getOnboardingComplete().then(setComplete); }, []);

  if (complete === null) return null;
  if (!complete) return <Redirect href="/onboarding" />;
  return <HomeScreen />;
}
