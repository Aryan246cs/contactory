import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { radius, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

export function Field({ label, multiline, style, ...props }: TextInputProps & { label: string }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return <View style={styles.wrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput {...props} accessibilityLabel={props.accessibilityLabel ?? label} multiline={multiline} placeholderTextColor={colors.muted} style={[styles.input, multiline && styles.multiline, style]} />
  </View>;
}
const makeStyles = (colors: ThemeColors) => StyleSheet.create({ wrap: { marginTop: 14 }, label: { color: colors.inkSoft, fontSize: 11, fontWeight: '700', marginBottom: 7, letterSpacing: 0.3 }, input: { minHeight: 49, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 14, color: colors.ink, backgroundColor: colors.input, fontSize: 15 }, multiline: { minHeight: 100, paddingTop: 12, textAlignVertical: 'top' } });
