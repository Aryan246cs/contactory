import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return <View style={styles.row}>
    <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
    <Text style={styles.title}>{title}</Text><View style={styles.right}>{right}</View>
  </View>;
}
const makeStyles = (colors: ThemeColors) => StyleSheet.create({ row: { height: 54, flexDirection: 'row', alignItems: 'center', marginBottom: 10 }, back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.artboard, justifyContent: 'center', alignItems: 'center', marginRight: 12 }, backText: { color: colors.ink, fontSize: 30, lineHeight: 33, marginTop: -3 }, title: { color: colors.ink, fontSize: 18, fontWeight: '700', letterSpacing: -0.4 }, right: { marginLeft: 'auto' } });
