/**
 * Shared theme: colors and spacing.
 * Single source of truth for UI tokens.
 */
export const theme = {
  colors: {
    primary: '#8b3ac1',
    primaryAccent: '#bb28a1',
    text: '#fff',
    textMuted: 'rgba(255,255,255,0.9)',
    textDim: 'rgba(255,255,255,0.7)',
    surface: 'rgba(255,255,255,0.15)',
    surfaceLight: 'rgba(255,255,255,0.2)',
    border: 'rgba(255,255,255,0.4)',
    placeholder: 'rgba(255,255,255,0.5)',
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  borderRadius: {
    sm: 8,
    md: 10,
    lg: 12,
  },
} as const;

export type Theme = typeof theme;
