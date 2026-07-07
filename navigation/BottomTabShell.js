import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTheme } from '../theme';

const BottomTabShell = ({ tabs, initialTab = 'Home' }) => {
  const { colors, shadows, typography } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);
  const activeRoute = tabs.find((tab) => tab.name === activeTab) || tabs[0];
  const ActiveComponent = activeRoute.component;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.scene}>
        <ActiveComponent />
      </View>

      <View
        style={[
          styles.tabBar,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
            ...shadows.sm,
          },
        ]}
      >
        {tabs.map(({ name, label, Icon }) => {
          const focused = activeRoute.name === name;
          return (
            <Pressable
              key={name}
              onPress={() => setActiveTab(name)}
              style={[styles.tabItem, focused && { backgroundColor: colors.primarySoft }]}
            >
              <Icon size={22} color={focused ? colors.primary : colors.textSubtle} />
              <Text
                style={[
                  styles.tabLabel,
                  typography.caption,
                  { color: focused ? colors.primary : colors.textSubtle },
                ]}
                numberOfLines={1}
              >
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
  },
  scene: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderTopWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
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
  tabLabel: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default BottomTabShell;
