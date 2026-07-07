import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, EmptyState, ErrorState, LoadingState, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import { formatAppointmentDate, getAppointmentsForTherapist } from '../services/appointments';
import { spacing, useTheme } from '../theme';

const Messages = () => {
  const navigation = useNavigation();
  const { colors, typography } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const currentUser = getCurrentUser();

      if (!currentUser) {
        setAppointments([]);
        return;
      }

      setAppointments(await getAppointmentsForTherapist(currentUser.uid));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <Screen contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.body}>Open appointment-based conversations with your patients.</Text>

        {errorMessage ? <ErrorState title="Message issue" message={errorMessage} /> : null}
        {loading ? <LoadingState message="Loading conversations..." /> : null}

        {!loading && appointments.length === 0 ? (
          <EmptyState
            title="No conversations yet"
            message="Conversations appear after patients request appointments."
            action={<Button title="View Schedule" onPress={() => navigation.navigate('Appointment')} />}
          />
        ) : null}

        {!loading &&
          appointments.map((appointment) => (
            <View key={appointment.id} style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <View style={styles.messageText}>
                  <Text style={styles.patientName}>
                    {appointment.patientName || appointment.patientEmail || 'Patient'}
                  </Text>
                  <Text style={styles.messageMeta}>
                    {formatAppointmentDate(appointment.appointmentDateTime)}
                  </Text>
                </View>
                <View style={[styles.statusPill, styles[`status_${appointment.status || 'pending'}`]]}>
                  <Text style={styles.statusText}>{appointment.status || 'pending'}</Text>
                </View>
              </View>

              <Button
                title="Open Conversation"
                variant="secondary"
                onPress={() => navigation.navigate('SessionMessages', { appointment })}
              />
            </View>
          ))}
      </Card>
    </Screen>
  );
};

const createStyles = (colors, typography) => StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.heading,
    color: colors.primary,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  messageCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.md,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  messageText: {
    flex: 1,
  },
  patientName: {
    ...typography.subheading,
    color: colors.primary,
  },
  messageMeta: {
    ...typography.small,
    color: colors.textMuted,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  status_pending: {
    backgroundColor: '#FFF6E5',
  },
  status_confirmed: {
    backgroundColor: colors.successSoft,
  },
  status_approved: {
    backgroundColor: colors.successSoft,
  },
  status_rejected: {
    backgroundColor: colors.dangerSoft,
  },
  status_cancelled: {
    backgroundColor: colors.surface,
  },
  status_completed: {
    backgroundColor: colors.successSoft,
  },
  status_missed: {
    backgroundColor: '#FFF6E5',
  },
  statusText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});

export default Messages;
