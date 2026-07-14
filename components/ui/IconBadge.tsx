import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

type IconBadgeProps = {
  children: ReactNode;
  tone?: string;
  backgroundColor?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

const IconBadge = ({
  children,
  tone = colors.primary,
  backgroundColor = colors.primarySoft,
  size = 44,
  style,
}: IconBadgeProps) => (
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
