import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../theme';

const IconBadge = ({
  children,
  tone = colors.primary,
  backgroundColor = colors.primarySoft,
  size = 44,
  style,
}) => (
  <View
    style={[
      styles.badge,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        borderColor: tone,
      },
      style,
    ]}
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    padding: spacing.xs,
  },
});

export default IconBadge;
