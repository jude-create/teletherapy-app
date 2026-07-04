export const colors = {
  background: '#F7FAF8',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF5F3',
  primary: '#0F3D4A',
  primarySoft: '#D8E8E8',
  accent: '#5E8FA8',
  accentSoft: '#E7F0F5',
  success: '#4F9D69',
  successSoft: '#E6F4EA',
  danger: '#D96C6C',
  dangerSoft: '#FCEAEA',
  warning: '#D89A3D',
  text: '#1F2A33',
  textMuted: '#63727D',
  textSubtle: '#8A97A0',
  border: '#DDE7E4',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999,
};

export const typography = {
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.text,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subheading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSubtle,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#0F2A33',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F2A33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
};

export const iconSizes = {
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  iconSizes,
};

export default theme;
