import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { colors, radius } from '@/theme/tokens';

export function ActionButton({ title, variant = 'primary', ...props }: PressableProps & { title: string; variant?: 'primary' | 'secondary' | 'danger' }) {
  return <Pressable accessibilityRole="button" {...props} style={({ pressed }) => [styles.button, variant === 'secondary' && styles.secondary, variant === 'danger' && styles.danger, pressed && styles.pressed, props.style as object]}>
    <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{title}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({ button: { minHeight: 54, borderRadius: radius.pill, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 }, secondary: { backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border }, danger: { backgroundColor: colors.destructive }, pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] }, text: { color: colors.paper, fontSize: 15, fontWeight: '700' }, secondaryText: { color: colors.ink } });
