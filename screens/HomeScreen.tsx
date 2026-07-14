import React from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../types/navigation';
import { ChatBubbleLeftRightIcon, HeartIcon, SparklesIcon } from 'react-native-heroicons/solid';
import { Button, Screen } from '../components/ui';
import { spacing, useTheme } from '../theme';

const TeletherapyIllustration = ({ colors, styles }: any) => {
  const floatValue = React.useRef(new Animated.Value(0)).current;
  const pulseValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatValue, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(pulseValue, {
        toValue: 1,
        duration: 2200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, [floatValue, pulseValue]);

  const floatStyle = {
    transform: [
      {
        translateY: floatValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
  };

  const pulseStyle = {
    opacity: pulseValue.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [0.38, 0.08, 0],
    }),
    transform: [
      {
        scale: pulseValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1.35],
        }),
      },
    ],
  };

  return (
    <View style={styles.illustrationWrap}>
      <Animated.View style={[styles.pulseRing, pulseStyle]} />
      <Animated.View style={[styles.sessionCard, floatStyle]}>
        <View style={styles.sessionTopBar}>
          <View style={styles.statusDot} />
          <Text style={styles.sessionLabel}>Live session</Text>
          <ChatBubbleLeftRightIcon size={18} color={colors.primarySoft} />
        </View>

        <View style={styles.videoGrid}>
          <View style={[styles.videoTile, styles.therapistTile]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>T</Text>
            </View>
            <View style={styles.captionLine} />
            <View style={styles.captionShort} />
          </View>

          <View style={[styles.videoTile, styles.patientTile]}>
            <View style={styles.avatarCircleSmall}>
              <Text style={styles.avatarInitialSmall}>P</Text>
            </View>
            <HeartIcon size={18} color={colors.success} />
          </View>
        </View>

        <View style={styles.messageBubble}>
          <SparklesIcon size={18} color={colors.primary} />
          <View style={styles.messageLines}>
            <View style={styles.messageLine} />
            <View style={styles.messageLineShort} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { colors, typography } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, typography), [colors, typography]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <Screen
      scroll={false}
      style={styles.screen}
      contentContainerStyle={styles.content}
      edges={['top', 'bottom']}
      backgroundColor={colors.primary}
    >
      <StatusBar style="light" />
      <View style={styles.hero}>
        <TeletherapyIllustration colors={colors} styles={styles} />
        <View style={styles.brandRow}>
          <SparklesIcon size={34} color={colors.primarySoft} />
          <Text style={styles.brand}>VirtualMindSpace</Text>
        </View>
        <Text style={styles.tagline}>Welcome to the home of online therapy</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Log In"
          variant="secondary"
          onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
        />
        <Button
          title="Sign Up"
          variant="outline"
          onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
          style={styles.outlineButton}
          textStyle={styles.outlineButtonText}
        />
      </View>
    </Screen>
  );
};

const createStyles = (colors: any, typography: any) => StyleSheet.create({
  screen: {
    backgroundColor: colors.primary,
  },
  content: {
    justifyContent: 'space-between',
    maxWidth: 520,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  illustrationWrap: {
    width: '100%',
    maxWidth: 330,
    aspectRatio: 1.05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: '84%',
    height: '84%',
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  sessionCard: {
    width: '88%',
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#001B20',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  sessionTopBar: {
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  sessionLabel: {
    ...typography.caption,
    flex: 1,
    color: colors.onBrand,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  videoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  videoTile: {
    minHeight: 126,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  therapistTile: {
    flex: 1.25,
    backgroundColor: colors.primarySoft,
  },
  patientTile: {
    flex: 0.75,
    backgroundColor: colors.accentSoft,
  },
  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  avatarInitial: {
    ...typography.heading,
    color: colors.background,
  },
  avatarCircleSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  avatarInitialSmall: {
    ...typography.subheading,
    color: colors.primary,
  },
  captionLine: {
    width: '70%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  captionShort: {
    width: '48%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  messageBubble: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  messageLines: {
    flex: 1,
    gap: spacing.xs,
  },
  messageLine: {
    width: '86%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primarySoft,
  },
  messageLineShort: {
    width: '58%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primarySoft,
  },
  brandRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  brand: {
    ...typography.title,
    color: colors.white,
    textAlign: 'center',
  },
  tagline: {
    ...typography.body,
    color: colors.primarySoft,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  outlineButton: {
    borderColor: colors.primarySoft,
  },
  outlineButtonText: {
    color: colors.white,
  },
});

export default HomeScreen;
