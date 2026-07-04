import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, shadows, spacing, typography } from '../theme';

const BottomTabShell = ({ tabs, initialTab = 'Home' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const activeRoute = tabs.find((tab) => tab.name === activeTab) || tabs[0];
  const ActiveComponent = activeRoute.component;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.scene}>
        <ActiveComponent />
      </View>

      <View style={styles.tabBar}>
        {tabs.map(({ name, label, Icon }) => {
          const focused = activeRoute.name === name;
          return (
            <Pressable
              key={name}
              onPress={() => setActiveTab(name)}
              style={[styles.tabItem, focused && styles.tabItemActive]}
            >
              <Icon size={22} color={focused ? colors.primary : colors.textSubtle} />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scene: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    ...shadows.sm,
  },
  tabItem: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  tabItemActive: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.primary,
  },
});

export default BottomTabShell;
