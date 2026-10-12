export const colors = {
  canvas: '#F6F5EF', paper: '#FFFDF8', artboard: '#ECEBE3',
  ink: '#20231E', inkSoft: '#65685F', muted: '#92948B', border: '#E5E4DB',
  accent: '#526A50', accentSoft: '#E5EBDD', accentBright: '#C3D4A8',
  success: '#477653', warning: '#9B7334', destructive: '#A34B42',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 20, xl: 26, xxl: 36, xxxl: 52 } as const;
export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const type = {
  display: { fontSize: 42, lineHeight: 46, letterSpacing: -2 },
  title: { fontSize: 28, lineHeight: 34, letterSpacing: -1 },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 12, lineHeight: 17 },
} as const;
