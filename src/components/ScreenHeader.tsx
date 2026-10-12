import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { colors } from '@/theme/tokens';

export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  return <View style={styles.row}>
    <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
    <Text style={styles.title}>{title}</Text><View style={styles.right}>{right}</View>
  </View>;
}
const styles = StyleSheet.create({ row: { height: 54, flexDirection: 'row', alignItems: 'center', marginBottom: 10 }, back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.artboard, justifyContent: 'center', alignItems: 'center', marginRight: 12 }, backText: { color: colors.ink, fontSize: 30, lineHeight: 33, marginTop: -3 }, title: { color: colors.ink, fontSize: 18, fontWeight: '700', letterSpacing: -0.4 }, right: { marginLeft: 'auto' } });
