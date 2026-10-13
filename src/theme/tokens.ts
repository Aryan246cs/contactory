export type ThemeMode = 'light' | 'dark';

export const lightColors = {
  canvas: '#F6F5EF', paper: '#FFFDF8', artboard: '#ECEBE3',
  ink: '#20231E', inkSoft: '#65685F', muted: '#92948B', border: '#E5E4DB',
  accent: '#526A50', accentFill: '#526A50', accentSoft: '#E5EBDD', accentBright: '#C3D4A8', onAccent: '#FFFFFF',
  success: '#477653', warning: '#9B7334', destructive: '#A34B42',
  overlay: '#F3E7E3', memory: '#E9EDE4', input: '#FFFDF8',
  shadow: '#172017', cardGlow: '#FFFFFF',
} as const;

export const darkColors = {
  canvas: '#10130F', paper: '#191E19', artboard: '#242A23',
  ink: '#F2F3EC', inkSoft: '#B4B9AE', muted: '#858D81', border: '#30382F',
  accent: '#A9C992', accentFill: '#496343', accentSoft: '#283526', accentBright: '#C5DDAA', onAccent: '#FFFFFF',
  success: '#8BC79A', warning: '#E1B970', destructive: '#E18E83',
  overlay: '#382823', memory: '#202A20', input: '#171C17',
  shadow: '#000000', cardGlow: '#D5E7C8',
} as const;

export type ThemeColors = { [K in keyof typeof lightColors]: string };
export function colorsForMode(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 20, xl: 26, xxl: 36, xxxl: 52 } as const;
export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const type = {
  display: { fontSize: 42, lineHeight: 46, letterSpacing: -2 },
  title: { fontSize: 28, lineHeight: 34, letterSpacing: -1 },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 12, lineHeight: 17 },
} as const;
