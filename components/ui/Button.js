import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

const variants = {
  primary: {
    button: { backgroundColor: colors.primary, borderColor: colors.primary },
    text: { color: colors.white },
  },
  secondary: {
    button: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
    text: { color: colors.primary },
  },
  outline: {
    button: { backgroundColor: 'transparent', borderColor: colors.border },
    text: { color: colors.primary },
  },
  danger: {
    button: { backgroundColor: colors.danger, borderColor: colors.danger },
    text: { color: colors.white },
  },
  ghost: {
    button: { backgroundColor: 'transparent', borderColor: 'transparent' },
    text: { color: colors.primary },
  },
};

const Button = ({
  title,
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
}) => {
  const selected = variants[variant] || variants.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        selected.button,
        (pressed || disabled) && styles.dimmed,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={selected.text.color} /> : leftIcon}
      <Text style={[styles.text, selected.text, textStyle]}>{children || title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    width: '100%',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  text: {
    ...typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  dimmed: {
    opacity: 0.72,
  },
});

export default Button;
