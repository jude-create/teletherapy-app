import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { SparklesIcon } from 'react-native-heroicons/solid';
import { Button, Screen } from '../components/ui';
import { colors, spacing, typography } from '../theme';

const HomeScreen = () => {
  const navigation = useNavigation();

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
    >
      <StatusBar style="light" />
      <View style={styles.hero}>
        <View style={styles.brandRow}>
          <SparklesIcon size={48} color={colors.primarySoft} />
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

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.primary,
  },
  content: {
    justifyContent: 'space-between',
    maxWidth: 520,
    paddingVertical: spacing.xxl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  brandRow: {
    alignItems: 'center',
    gap: spacing.md,
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
