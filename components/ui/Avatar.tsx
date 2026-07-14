import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, typography } from '../../theme';

type AvatarProps = {
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
  style?: StyleProp<ImageStyle | ViewStyle>;
};

const Avatar = ({ source, name = '', size = 56, style }: AvatarProps) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const avatarStyle: ImageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (source) {
    return <Image source={source} style={[styles.avatar, avatarStyle, style as StyleProp<ImageStyle>]} />;
  }

  return (
    <View style={[styles.avatar, styles.fallback, avatarStyle, style]}>
      <Text style={styles.initials}>{initials || 'VM'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.primarySoft,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  initials: {
    ...typography.subheading,
    color: colors.primary,
  },
});

export default Avatar;
