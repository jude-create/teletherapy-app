import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'virtualMindSpaceThemePreference';

export const lightColors = {
  background: '#F7FAF8',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF5F3',
  primary: '#0F3D4A',
  brand: '#0F3D4A',
  primarySoft: '#D8E8E8',
  accent: '#5E8FA8',
  accentSoft: '#E7F0F5',
  success: '#4F9D69',
  successSoft: '#E6F4EA',
  danger: '#D96C6C',
  dangerSoft: '#FCEAEA',
  warning: '#D89A3D',
  warningSoft: '#FFF6E5',
  text: '#1F2A33',
  textMuted: '#63727D',
  textSubtle: '#8A97A0',
  border: '#DDE7E4',
  white: '#FFFFFF',
  onBrand: '#FFFFFF',
};

export const darkColors = {
  background: '#071316',
  surface: '#102327',
  surfaceMuted: '#183238',
  primary: '#A7DADB',
  brand: '#063E48',
  primarySoft: '#24474F',
  accent: '#8FB8CC',
  accentSoft: '#19313A',
  success: '#78C593',
  successSoft: '#163326',
  danger: '#F09797',
  dangerSoft: '#3A1D22',
  warning: '#E3AF5D',
  warningSoft: '#352716',
  text: '#EFF7F5',
  textMuted: '#B5C4C8',
  textSubtle: '#81949A',
  border: '#2D464D',
  white: '#FFFFFF',
  onBrand: '#FFFFFF',
};

export const palettes = {
  light: lightColors,
  dark: darkColors,
};

export const colors = { ...lightColors };

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

export const makeTypography = (palette = colors) => ({
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: palette.text,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: palette.text,
  },
  subheading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: palette.text,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.text,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.textMuted,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.textSubtle,
  },
});

export const typography = makeTypography(colors);

export const makeShadows = (palette = colors) => ({
  sm: {
    shadowColor: palette.background,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: palette.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 3,
  },
});

export const shadows = makeShadows(colors);

export const iconSizes = {
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
};

const getSystemMode = () => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');

const buildTheme = (mode, themePreference = mode) => {
  const palette = palettes[mode] || palettes.light;
  return {
    mode,
    themePreference,
    isDark: mode === 'dark',
    colors: palette,
    spacing,
    radius,
    typography: makeTypography(palette),
    shadows: makeShadows(palette),
    iconSizes,
  };
};

const ThemeContext = createContext({
  ...buildTheme('light', 'system'),
  setThemePreference: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState('system');
  const [systemMode, setSystemMode] = useState(getSystemMode());

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((savedPreference) => {
        if (mounted && ['light', 'dark', 'system'].includes(savedPreference)) {
          setThemePreferenceState(savedPreference);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemMode(colorScheme === 'dark' ? 'dark' : 'light');
    });

    return () => subscription.remove();
  }, []);

  const setThemePreference = async (nextPreference) => {
    if (!['light', 'dark', 'system'].includes(nextPreference)) return;
    setThemePreferenceState(nextPreference);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextPreference);
  };

  const value = useMemo(() => {
    const mode = themePreference === 'system' ? systemMode : themePreference;
    const nextTheme = buildTheme(mode, themePreference);
    return {
      ...nextTheme,
      setThemePreference,
      toggleTheme: () => setThemePreference(mode === 'dark' ? 'light' : 'dark'),
    };
  }, [systemMode, themePreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export const theme = buildTheme('light');

export default theme;
