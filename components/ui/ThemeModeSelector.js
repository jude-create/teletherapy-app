import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../../theme';

const options = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

const ThemeModeSelector = () => {
  const { colors, typography, themePreference, setThemePreference } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[typography.subheading, { color: colors.text }]}>Appearance</Text>
      <Text style={[typography.small, { color: colors.textMuted }]}>
        Choose how VirtualMindSpace should look on this device.
      </Text>
      <View style={[styles.segment, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
        {options.map((option) => {
          const selected = themePreference === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => setThemePreference(option.value)}
              style={[
                styles.option,
                selected && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  typography.small,
                  styles.optionText,
                  { color: selected ? colors.background : colors.textMuted },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  option: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  optionText: {
    fontWeight: '800',
    textAlign: 'center',
  },
});

export default ThemeModeSelector;
