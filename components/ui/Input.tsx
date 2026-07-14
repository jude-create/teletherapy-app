import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { radius, spacing, useTheme } from '../../theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

const Input = ({ label, error, style, inputStyle, ...props }: InputProps) => {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={[styles.label, typography.small, { color: colors.text }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textSubtle}
        style={[
          styles.input,
          typography.body,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            color: colors.text,
          },
          inputStyle,
        ]}
        {...props}
      />
      {error ? <Text style={[styles.error, typography.caption, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: spacing.xs,
  },
  label: {
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  error: {
  },
});

export default Input;
