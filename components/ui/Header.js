import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SparklesIcon } from 'react-native-heroicons/solid';
import { colors, spacing, typography } from '../../theme';

const Header = ({ title = 'VirtualMindSpace', subtitle, action }) => (
  <View style={styles.header}>
    <View style={styles.brandRow}>
      <SparklesIcon size={28} color={colors.primarySoft} />
      <View style={styles.titleGroup}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
    {action ? <View style={styles.action}>{action}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    ...typography.subheading,
    color: colors.white,
  },
  subtitle: {
    ...typography.small,
    color: colors.primarySoft,
  },
  action: {
    width: '100%',
  },
});

export default Header;
