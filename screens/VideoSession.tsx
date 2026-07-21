import React, { useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
} from 'react-native-heroicons/solid';
import { Button, Card, ErrorState, Screen } from '../components/ui';
import { formatAppointmentDate } from '../services/appointments';
import { getCurrentUser } from '../services/auth';
import { colors, iconSizes, spacing, typography } from '../theme';
import type { AppNavigationProp } from '../types/navigation';
import type { Appointment } from '../types/models';

type VideoSessionAppointment = Appointment & {
  id: string;
  patientEmail?: string;
  sessionLink?: string;
  therapist?: { name?: string };
};

const getParticipantName = (appointment: VideoSessionAppointment, currentUserId?: string) => {
  const isTherapist = currentUserId === appointment.therapistId;
  if (isTherapist) {
    return appointment.patientName || appointment.patientEmail || 'Patient';
  }
  return appointment.therapist?.name || appointment.therapistName || 'Therapist';
};

const VideoSession = ({ route }: any) => {
  const navigation = useNavigation<AppNavigationProp>();
  const appointment = route?.params?.appointment as VideoSessionAppointment | undefined;
  const currentUser = getCurrentUser();
  const [cameraReady, setCameraReady] = useState(true);
  const [microphoneReady, setMicrophoneReady] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const participantName = useMemo(
    () => (appointment ? getParticipantName(appointment, currentUser?.uid) : 'Session partner'),
    [appointment, currentUser?.uid]
  );

  const openSessionLink = async () => {
    if (!appointment?.sessionLink) {
      setErrorMessage('A video session link has not been added yet.');
      return;
    }

    try {
      setErrorMessage('');
      await Linking.openURL(appointment.sessionLink);
    } catch (error) {
      setErrorMessage('We could not open this session link.');
    }
  };

  if (!appointment) {
    return (
      <Screen contentContainerStyle={styles.content}>
        <ErrorState title="Session unavailable" message="Open video sessions from an approved appointment." />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.videoPreview}>
          <VideoCameraIcon size={iconSizes.xl} color={colors.onBrand} />
          <Text style={styles.previewText}>Ready for video session</Text>
        </View>
        <Text style={styles.title}>Video Session</Text>
        <Text style={styles.subtitle}>{participantName}</Text>
        <Text style={styles.meta}>{formatAppointmentDate(appointment.appointmentDateTime)}</Text>
      </View>

      {errorMessage ? <ErrorState title="Video session issue" message={errorMessage} /> : null}

      <Card>
        <View style={styles.statusRow}>
          <View style={styles.statusDetails}>
            <VideoCameraIcon size={iconSizes.md} color={colors.primary} />
            <View style={styles.statusCopy}>
              <Text style={styles.statusTitle}>Camera</Text>
              <Text style={styles.statusText}>{cameraReady ? 'Ready' : 'Off before joining'}</Text>
            </View>
          </View>
          <Button
            title={cameraReady ? 'On' : 'Off'}
            variant={cameraReady ? 'secondary' : 'outline'}
            onPress={() => setCameraReady((ready) => !ready)}
            style={styles.statusButton}
          />
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusDetails}>
            <MicrophoneIcon size={iconSizes.md} color={colors.primary} />
            <View style={styles.statusCopy}>
              <Text style={styles.statusTitle}>Microphone</Text>
              <Text style={styles.statusText}>{microphoneReady ? 'Ready' : 'Muted before joining'}</Text>
            </View>
          </View>
          <Button
            title={microphoneReady ? 'On' : 'Muted'}
            variant={microphoneReady ? 'secondary' : 'outline'}
            onPress={() => setMicrophoneReady((ready) => !ready)}
            style={styles.statusButton}
          />
        </View>
      </Card>

      <Card>
        <View style={styles.noteRow}>
          <ShieldCheckIcon size={iconSizes.md} color={colors.success} />
          <Text style={styles.noteText}>Only the patient and therapist assigned to this appointment should use this session.</Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          title={appointment.sessionLink ? 'Join Video Call' : 'Session Link Pending'}
          onPress={openSessionLink}
          disabled={!appointment.sessionLink}
          leftIcon={<VideoCameraIcon size={iconSizes.sm} color={colors.onBrand} />}
        />
        <Button
          title="Message"
          variant="secondary"
          onPress={() => navigation.navigate('SessionMessages', { appointment })}
          leftIcon={<ChatBubbleLeftRightIcon size={iconSizes.sm} color={colors.primary} />}
        />
        <Button title="Back to Appointments" variant="outline" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
  },
  hero: {
    gap: spacing.sm,
  },
  videoPreview: {
    minHeight: 188,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  previewText: {
    ...typography.subheading,
    color: colors.onBrand,
  },
  title: {
    ...typography.heading,
    color: colors.primary,
  },
  subtitle: {
    ...typography.subheading,
    color: colors.text,
  },
  meta: {
    ...typography.body,
    color: colors.textMuted,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statusDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusCopy: {
    flex: 1,
  },
  statusTitle: {
    ...typography.body,
    fontWeight: '800',
  },
  statusText: {
    ...typography.small,
    color: colors.textMuted,
  },
  statusButton: {
    width: 104,
    minHeight: 44,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  noteText: {
    ...typography.small,
    flex: 1,
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.sm,
  },
});

export default VideoSession;
