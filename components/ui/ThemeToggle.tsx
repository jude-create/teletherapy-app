import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MoonIcon, SunIcon } from 'react-native-heroicons/solid';
import { radius, spacing, useTheme } from '../../theme';

const ThemeToggle = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const Icon = isDark ? SunIcon : MoonIcon;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primarySoft,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <Icon size={22} color={colors.primary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    padding: spacing.sm,
  },
});

export default ThemeToggle;
