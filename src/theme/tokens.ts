export type ThemeMode = 'light' | 'dark';

export const lightColors = {
  canvas: '#F3F4F2', paper: '#FFFFFF', artboard: '#E8ECE8',
  ink: '#111613', inkSoft: '#58635D', muted: '#88928C', border: '#DDE3DE',
  accent: '#187A5B', accentFill: '#111613', accentSoft: '#E2F1E9', accentBright: '#9CE8C3', onAccent: '#FFFFFF',
  success: '#477653', warning: '#9B7334', destructive: '#A34B42',
  overlay: '#F4E5E2', memory: '#EAF3EE', input: '#FFFFFF',
  shadow: '#101A14', cardGlow: '#76F0BB',
} as const;

export const darkColors = {
  canvas: '#090D0B', paper: '#121A16', artboard: '#1B2721',
  ink: '#F3F8F4', inkSoft: '#B0BEB6', muted: '#73837A', border: '#26362E',
  accent: '#72E0AA', accentFill: '#1A7653', accentSoft: '#172F24', accentBright: '#9CE8C3', onAccent: '#07110B',
  success: '#8BC79A', warning: '#E1B970', destructive: '#E18E83',
  overlay: '#34221F', memory: '#14231A', input: '#101713',
  shadow: '#000000', cardGlow: '#7AF0B8',
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
