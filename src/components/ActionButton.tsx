import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { radius, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export function ActionButton({ title, variant = 'primary', ...props }: PressableProps & { title: string; variant?: 'primary' | 'secondary' | 'danger' }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return <Pressable accessibilityRole="button" {...props} style={({ pressed }) => [styles.button, variant === 'secondary' && styles.secondary, variant === 'danger' && styles.danger, pressed && styles.pressed, props.style as object]}>
    <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{title}</Text>
  </Pressable>;
}
const makeStyles = (colors: ThemeColors) => StyleSheet.create({ button: { minHeight: 54, borderRadius: radius.pill, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, elevation: 4, shadowColor: colors.shadow, shadowOpacity: 0.16, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, secondary: { backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border }, danger: { backgroundColor: colors.destructive }, pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] }, text: { color: colors.paper, fontSize: 15, fontWeight: '700' }, secondaryText: { color: colors.ink } });
