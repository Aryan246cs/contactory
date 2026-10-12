import { View } from 'react-native';
import { colors } from '@/theme/tokens';

export function Mark({ small = false }: { small?: boolean }) {
  const size = small ? 19 : 26;
  return <View style={{ width: size, height: size, borderRadius: size * 0.34, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.44, height: size * 0.44, borderRadius: size, borderWidth: 1.5, borderColor: '#F6F5EF' }} />
    <View style={{ position: 'absolute', width: 3, height: 3, borderRadius: 2, backgroundColor: colors.accentBright, right: size * 0.19, top: size * 0.17 }} />
  </View>;
}
