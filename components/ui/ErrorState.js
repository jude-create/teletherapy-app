import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import Button from './Button';

const ErrorState = ({ title = 'Something went wrong', message, actionLabel, onAction }) => (
  <View style={styles.state}>
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
    {actionLabel && onAction ? (
      <Button title={actionLabel} onPress={onAction} variant="outline" />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  state: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: colors.dangerSoft,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.subheading,
    color: colors.danger,
  },
  message: {
    ...typography.body,
    color: colors.text,
  },
});

export default ErrorState;
