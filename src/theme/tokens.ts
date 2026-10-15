export type ThemeMode = 'light' | 'dark';

export const lightColors = {
  canvas: '#F6F5FA', paper: '#FFFFFF', artboard: '#ECEAF4',
  ink: '#191624', inkSoft: '#625E70', muted: '#928EA0', border: '#E2DFEA',
  accent: '#6954C8', accentFill: '#30265F', accentSoft: '#EEEAFE', accentBright: '#C4B8FF', onAccent: '#FFFFFF',
  success: '#477653', warning: '#9B7334', destructive: '#A34B42',
  overlay: '#F4E5E2', memory: '#F0EDFA', input: '#FFFFFF',
  shadow: '#211B3B', cardGlow: '#9D8BFF',
} as const;

export const darkColors = {
  canvas: '#100E18', paper: '#191625', artboard: '#221E30',
  ink: '#F5F2FC', inkSoft: '#B9B3C9', muted: '#888198', border: '#322D40',
  accent: '#B6A5FF', accentFill: '#49368F', accentSoft: '#2A2340', accentBright: '#C4B8FF', onAccent: '#FFFFFF',
  success: '#8BC79A', warning: '#E1B970', destructive: '#E18E83',
  overlay: '#34221F', memory: '#211B32', input: '#171421',
  shadow: '#000000', cardGlow: '#A38DFF',
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
