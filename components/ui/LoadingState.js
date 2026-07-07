import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../../theme';

const LoadingState = ({ message = 'Loading...' }) => {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.state}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.message, typography.small, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  state: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  message: {
    textAlign: 'center',
  },
});

export default LoadingState;
