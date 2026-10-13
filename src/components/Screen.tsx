import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export function Screen({ children, scroll = false }: PropsWithChildren<{ scroll?: boolean }>) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView> : <View style={styles.content}>{children}</View>}
  </SafeAreaView>;
}
const makeStyles = (colors: ThemeColors) => StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas }, content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl } });
