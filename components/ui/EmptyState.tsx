import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../../theme';
import Button from './Button';

type EmptyStateProps = {
  title: string;
  message?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

const EmptyState = ({ title, message, action, actionLabel, onAction }: EmptyStateProps) => {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.state}>
      <Text style={[styles.title, typography.subheading, { color: colors.text }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, typography.body, { color: colors.textMuted }]}>{message}</Text>
      ) : null}
      {action || (actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="secondary" />
      ) : null)}
    </View>
  );
};

const styles = StyleSheet.create({
  state: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});

export default EmptyState;
