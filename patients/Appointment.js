import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, EmptyState, ErrorState, LoadingState, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import {
  formatAppointmentDate,
  getAppointmentsForPatient,
  updateAppointmentStatus,
} from '../services/appointments';
import { colors, spacing, typography } from '../theme';

const statusCopy = {
  pending: {
    label: 'Pending',
    message: 'Waiting for therapist confirmation.',
    color: colors.warning,
    backgroundColor: '#FFF6E5',
  },
  confirmed: {
    label: 'Approved',
    message: 'Your therapist approved this session.',
    color: colors.success,
    backgroundColor: colors.successSoft,
  },
  approved: {
    label: 'Approved',
    message: 'Your therapist approved this session.',
    color: colors.success,
    backgroundColor: colors.successSoft,
  },
  rejected: {
    label: 'Rejected',
    message: 'This request was not accepted. You can book another time.',
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  cancelled: {
    label: 'Cancelled',
    message: 'This appointment was cancelled.',
    color: colors.textMuted,
    backgroundColor: colors.surfaceMuted,
  },
  completed: {
    label: 'Completed',
    message: 'This session was marked completed.',
    color: colors.success,
    backgroundColor: colors.successSoft,
  },
  missed: {
    label: 'Missed',
    message: 'This session was marked missed.',
    color: colors.warning,
    backgroundColor: '#FFF6E5',
  },
};

const openSessionLink = async (sessionLink, setErrorMessage) => {
  if (!sessionLink) {
    setErrorMessage('Your therapist has not added a video session link yet.');
    return;
  }

  try {
    await Linking.openURL(sessionLink);
  } catch (error) {
    setErrorMessage('We could not open this session link.');
  }
};

const canChangeAppointment = (status) => ['pending', 'approved', 'confirmed'].includes(status);

const AppointmentCard = ({ appointment, onCancel, onMessage, onJoinSession, onReschedule, updating }) => {
  const status = statusCopy[appointment.status] || statusCopy.pending;
  const therapistName = appointment.therapist?.name || appointment.therapistName || 'Therapist';

  return (
    <Card>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.therapistName}>{therapistName}</Text>
          <Text style={styles.dateText}>{formatAppointmentDate(appointment.appointmentDateTime)}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: status.backgroundColor }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <Text style={styles.body}>{status.message}</Text>
      {['approved', 'confirmed'].includes(appointment.status) ? (
        <View style={styles.appointmentActions}>
          <Button
            title={appointment.sessionLink ? 'Join Session' : 'Session Link Pending'}
            onPress={onJoinSession}
            disabled={!appointment.sessionLink}
          />
          <Button title="Message Therapist" variant="secondary" onPress={onMessage} />
        </View>
      ) : null}
      {canChangeAppointment(appointment.status) ? (
        <View style={styles.appointmentActions}>
          <Button
            title="Reschedule"
            variant="outline"
            onPress={onReschedule}
            disabled={updating}
          />
          <Button
            title="Cancel Appointment"
            variant="danger"
            onPress={onCancel}
            loading={updating}
          />
        </View>
      ) : null}
    </Card>
  );
};

export default function Appointment() {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
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

      const nextAppointments = await getAppointmentsForPatient(currentUser.uid);
      setAppointments(nextAppointments);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const cancelAppointment = async (appointmentId) => {
    try {
      setUpdatingId(appointmentId);
      setErrorMessage('');
      await updateAppointmentStatus(appointmentId, 'cancelled', { notifyTherapist: true });
      await loadAppointments();
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setUpdatingId('');
    }
  };

  const rescheduleAppointment = async (appointment) => {
    const cancelled = await cancelAppointment(appointment.id);
    if (!cancelled) return;

    navigation.navigate('Book', {
      therapistId: appointment.therapistId,
      therapist: appointment.therapist || {
        id: appointment.therapistId,
        name: appointment.therapistName || '',
        email: '',
        license: '',
        specialties: [],
        availability: appointment.therapist?.availability || { slots: [] },
      },
    });
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <Text style={styles.title}>Upcoming Appointments</Text>
      <Text style={styles.body}>
        Appointment requests appear here while therapists review, approve, or reject them.
      </Text>

      {loading ? <LoadingState message="Loading appointments..." /> : null}
      {errorMessage ? <ErrorState title="Appointment issue" message={errorMessage} /> : null}

      {!loading && !errorMessage && appointments.length === 0 ? (
        <EmptyState
          title="No appointments yet"
          message="Choose a therapist and request a time to begin."
          action={<Button title="Find a Therapist" onPress={() => navigation.navigate('Match')} />}
        />
      ) : null}

      {!loading && appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          updating={updatingId === appointment.id}
          onCancel={() => cancelAppointment(appointment.id)}
          onMessage={() => navigation.navigate('SessionMessages', { appointment })}
          onJoinSession={() => openSessionLink(appointment.sessionLink, setErrorMessage)}
          onReschedule={() => rescheduleAppointment(appointment)}
        />
      ))}

      <Button title="Refresh" variant="outline" onPress={loadAppointments} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.heading,
    color: colors.primary,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardTitleWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  therapistName: {
    ...typography.subheading,
    color: colors.primary,
  },
  dateText: {
    ...typography.small,
    fontWeight: '700',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  appointmentActions: {
    gap: spacing.sm,
  },
});
