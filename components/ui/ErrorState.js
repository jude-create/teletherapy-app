import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../../theme';
import Button from './Button';

const ErrorState = ({ title = 'Something went wrong', message, actionLabel, onAction }) => {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.state, { backgroundColor: colors.dangerSoft }]}>
      <Text style={[styles.title, typography.subheading, { color: colors.danger }]}>{title}</Text>
      {message ? <Text style={[styles.message, typography.body, { color: colors.text }]}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="outline" />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  state: {
    width: '100%',
    borderRadius: 8,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
  },
  message: {
  },
});

export default ErrorState;
