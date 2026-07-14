import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SparklesIcon } from 'react-native-heroicons/solid';
import { spacing, useTheme } from '../../theme';

type HeaderProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
};

const Header = ({ title = 'VirtualMindSpace', subtitle, action }: HeaderProps) => {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.brand }]}>
      <View style={styles.brandRow}>
        <SparklesIcon size={28} color={colors.primarySoft} />
        <View style={styles.titleGroup}>
          <Text style={[styles.title, typography.subheading, { color: colors.onBrand }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, typography.small, { color: colors.primarySoft }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
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
  },
  subtitle: {
  },
  action: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
});

export default Header;
