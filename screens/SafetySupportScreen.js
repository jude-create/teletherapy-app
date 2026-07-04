import React from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import {
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  PhoneIcon,
} from 'react-native-heroicons/solid';
import { Button, Card, Header, Screen } from '../components/ui';
import { colors, spacing, typography } from '../theme';

const openUrl = async (url) => {
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.warn('Unable to open safety resource:', error.message);
  }
};

const callNumber = (number) => openUrl(`tel:${number}`);
const textNumber = (number) => openUrl(Platform.OS === 'ios' ? `sms:${number}` : `sms:${number}`);

const ResourceRow = ({ Icon, title, body }) => (
  <View style={styles.resourceRow}>
    <View style={styles.resourceIcon}>
      <Icon size={22} color={colors.primary} />
    </View>
    <View style={styles.resourceText}>
      <Text style={styles.resourceTitle}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  </View>
);

const SafetySupportScreen = () => (
  <Screen contentContainerStyle={styles.content}>
    <Header subtitle="Safety and crisis support" />

    <Card style={styles.emergencyCard}>
      <View style={styles.heroIcon}>
        <ExclamationTriangleIcon size={32} color={colors.white} />
      </View>
      <Text style={styles.emergencyTitle}>If there is immediate danger</Text>
      <Text style={styles.emergencyText}>
        VirtualMindSpace is not an emergency service. If you may hurt yourself or someone else,
        or you need urgent medical help, contact emergency services now.
      </Text>
      <Button
        title="Call 911"
        variant="danger"
        onPress={() => callNumber('911')}
      />
    </Card>

    <Card>
      <Text style={styles.sectionTitle}>988 Suicide & Crisis Lifeline</Text>
      <Text style={styles.body}>
        Call, text, or chat with trained crisis counselors for free, confidential support in the
        United States.
      </Text>
      <View style={styles.actionGrid}>
        <Button
          title="Call 988"
          onPress={() => callNumber('988')}
          leftIcon={<PhoneIcon size={20} color={colors.white} />}
          style={styles.actionButton}
        />
        <Button
          title="Text 988"
          variant="secondary"
          onPress={() => textNumber('988')}
          leftIcon={<ChatBubbleLeftRightIcon size={20} color={colors.primary} />}
          style={styles.actionButton}
        />
      </View>
      <Button
        title="Open 988 Chat"
        variant="outline"
        onPress={() => openUrl('https://chat.988lifeline.org/')}
      />
    </Card>

    <Card>
      <Text style={styles.sectionTitle}>Before Your Next Session</Text>
      <ResourceRow
        Icon={HeartIcon}
        title="Move to a safer place"
        body="If possible, sit near another person, move away from anything you could use to hurt yourself, and avoid being alone with intense urges."
      />
      <ResourceRow
        Icon={PhoneIcon}
        title="Contact someone you trust"
        body="Reach out to a friend, family member, caregiver, or local support person and tell them you need support right now."
      />
      <ResourceRow
        Icon={ChatBubbleLeftRightIcon}
        title="Message your therapist"
        body="If your appointment is approved, use session messages for non-emergency updates. For immediate danger, use emergency services."
      />
    </Card>

    <Card>
      <Text style={styles.sectionTitle}>Important Notice</Text>
      <Text style={styles.body}>
        This app can help with therapy scheduling and communication, but it does not monitor crisis
        messages in real time and does not replace emergency or crisis services.
      </Text>
    </Card>
  </Screen>
);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  emergencyCard: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  heroIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  emergencyTitle: {
    ...typography.heading,
    color: colors.white,
  },
  emergencyText: {
    ...typography.body,
    color: colors.white,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.primary,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: '45%',
  },
  resourceRow: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  resourceIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
  },
  resourceText: {
    flex: 1,
    gap: spacing.xs,
  },
  resourceTitle: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '800',
  },
});

export default SafetySupportScreen;
