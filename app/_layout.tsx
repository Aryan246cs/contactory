import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { initializeDatabase } from '@/database/database';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const initialize = () => {
    setFailed(false);
    initializeDatabase().then(() => setReady(true)).catch((error) => {
      console.error('Contactory could not initialize its local database.', error);
      setFailed(true);
    });
  };

  useEffect(() => {
    initialize();
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas, padding: 32 }}>
      {failed ? <>
        <Text style={{ color: colors.ink, fontSize: 21, fontWeight: '700', textAlign: 'center' }}>Your local library couldn’t open.</Text>
        <Text style={{ color: colors.inkSoft, fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 21 }}>Your contacts stay on this device. Try opening Contactory again.</Text>
        <Pressable accessibilityRole="button" onPress={initialize} style={{ backgroundColor: colors.ink, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, marginTop: 22 }}>
          <Text style={{ color: colors.paper, fontWeight: '700' }}>Try again</Text>
        </Pressable>
      </> : <ActivityIndicator color={colors.accent} />}
    </View>;
  }

  return <>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas }, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
    </Stack>
  </>;
}
