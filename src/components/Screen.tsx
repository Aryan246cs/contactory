import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';

export function Screen({ children, scroll = false }: PropsWithChildren<{ scroll?: boolean }>) {
  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView> : <View style={styles.content}>{children}</View>}
  </SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas }, content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl } });
