import React, { ReactNode } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';
import { spacing, useTheme } from '../../theme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  backgroundColor?: string;
};

const Screen = ({
  children,
  scroll = true,
  style,
  contentContainerStyle,
  edges = ['top'],
  backgroundColor,
}: ScreenProps) => {
  const { colors } = useTheme();
  const screenBackground = backgroundColor || colors.background;
  const contentStyle = [styles.content, contentContainerStyle];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.primary }, style]} edges={edges}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ backgroundColor: screenBackground }}
          contentContainerStyle={[
            contentStyle,
            { backgroundColor: screenBackground },
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[contentStyle, { backgroundColor: screenBackground }]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
});

export default Screen;
