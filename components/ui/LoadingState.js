import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

const LoadingState = ({ message = 'Loading...' }) => (
  <View style={styles.state}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  state: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  message: {
    ...typography.small,
    textAlign: 'center',
  },
});

export default LoadingState;
