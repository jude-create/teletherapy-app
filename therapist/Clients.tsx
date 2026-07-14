import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../types/navigation';
import { Button, Card, EmptyState, ErrorState, LoadingState, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import { formatAppointmentDate, getAppointmentsForTherapist } from '../services/appointments';
import { spacing, useTheme } from '../theme';

const getPatientKey = (appointment: any) =>
  appointment.patientId || appointment.patientEmail || appointment.patientName || appointment.id;

const Clients = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadClients = async () => {
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
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const clients = useMemo(() => {
    const grouped = new Map();

    appointments.forEach((appointment) => {
      const key = getPatientKey(appointment);
      const current = grouped.get(key);
      const nextClient = current || {
        id: key,
        name: appointment.patientName || appointment.patientEmail || 'Patient',
        email: appointment.patientEmail || '',
        appointments: [],
      };

      nextClient.appointments.push(appointment);
      grouped.set(key, nextClient);
    });

    return Array.from(grouped.values()).map((client) => ({
      ...client,
      latestAppointment: client.appointments[0],
      approvedCount: client.appointments.filter((appointment: any) =>
        ['approved', 'confirmed', 'completed'].includes(appointment.status)
      ).length,
    }));
  }, [appointments]);

  return (
    <Screen contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Clients</Text>
        <Text style={styles.body}>Review patients who have requested or booked sessions with you.</Text>

        {errorMessage ? <ErrorState title="Client issue" message={errorMessage} /> : null}
        {loading ? <LoadingState message="Loading clients..." /> : null}

        {!loading && clients.length === 0 ? (
          <EmptyState
            title="No clients yet"
            message="Patients will appear here after they request an appointment."
            action={<Button title="View Schedule" onPress={() => navigation.navigate('Appointment')} />}
          />
        ) : null}

        {!loading &&
          clients.map((client) => (
            <View key={client.id} style={styles.clientCard}>
              <View style={styles.clientHeader}>
                <View style={styles.clientText}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  {client.email ? <Text style={styles.clientMeta}>{client.email}</Text> : null}
                </View>
                <View style={styles.countPill}>
                  <Text style={styles.countText}>{client.appointments.length}</Text>
                </View>
              </View>

              <Text style={styles.clientMeta}>
                Latest: {formatAppointmentDate(client.latestAppointment?.appointmentDateTime)}
              </Text>
              <Text style={styles.clientMeta}>
                {client.approvedCount} approved session{client.approvedCount === 1 ? '' : 's'} -{' '}
                {client.latestAppointment?.status || 'pending'}
              </Text>

              <View style={styles.actions}>
                <Button
                  title="Message"
                  variant="secondary"
                  onPress={() =>
                    navigation.navigate('SessionMessages', { appointment: client.latestAppointment })
                  }
                  style={styles.actionButton}
                />
                <Button
                  title="Schedule"
                  variant="outline"
                  onPress={() => navigation.navigate('Appointment')}
                  style={styles.actionButton}
                />
              </View>
            </View>
          ))}
      </Card>
    </Screen>
  );
};

const createStyles = (colors: any, typography: any) => StyleSheet.create({
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
  clientCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.sm,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  clientText: {
    flex: 1,
  },
  clientName: {
    ...typography.subheading,
    color: colors.primary,
  },
  clientMeta: {
    ...typography.small,
    color: colors.textMuted,
  },
  countPill: {
    minWidth: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
  },
  countText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: '45%',
  },
});

export default Clients;
