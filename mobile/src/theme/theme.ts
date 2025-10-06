import { palette } from './palette';

export type ColorMode = 'light' | 'dark';

export const lightTheme = {
  mode: 'light' as ColorMode,
  colors: {
    background: palette.slate[50],
    surface: '#FFFFFF',
    surfaceMuted: palette.slate[100],
    text: palette.charcoal[500],
    textMuted: palette.charcoal[400],
    border: palette.slate[200],
    primary: palette.coral[600],
    primaryForeground: '#FFFFFF',
    secondary: palette.graphite[500],
    secondaryForeground: '#FFFFFF',
    accent: palette.coral[600],
    accentForeground: '#FFFFFF',
    success: '#3FB68B',
    warning: '#FFA726',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 20,
    pill: 999,
  },
  typography: {
    fontFamily: 'System',
    headingWeight: '600' as const,
    bodyWeight: '400' as const,
  },
  shadow: {
    card: {
      shadowColor: palette.charcoal[500],
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  mode: 'dark' as ColorMode,
  colors: {
    ...lightTheme.colors,
    background: palette.charcoal[600],
    surface: palette.graphite[600],
    surfaceMuted: palette.graphite[700],
    text: '#F5F7FA',
    textMuted: palette.slate[400],
    border: palette.graphite[500],
  },
  shadow: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 0,
    },
  },
};

export type Theme = typeof lightTheme;
