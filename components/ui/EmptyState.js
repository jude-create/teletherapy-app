import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import Button from './Button';

const EmptyState = ({ title, message, actionLabel, onAction }) => (
  <View style={styles.state}>
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
    {actionLabel && onAction ? (
      <Button title={actionLabel} onPress={onAction} variant="secondary" />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  state: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: {
    ...typography.subheading,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default EmptyState;
