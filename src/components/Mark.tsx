import { Image } from 'react-native';

export function Mark({ small = false }: { small?: boolean }) {
  const size = small ? 19 : 32;
  return <Image source={require('../../assets/images/vemori-mark.png')} resizeMode="contain" style={{ width: size, height: size }} accessibilityLabel="Vemori" />;
}
