import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../types/navigation';
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import {
  formatAppointmentDate,
  getAppointmentsForTherapist,
  updateAppointmentSessionLink,
  updateAppointmentStatus,
} from '../services/appointments';
import { colors, spacing, typography } from '../theme';
import type { Appointment, AppointmentStatus } from '../types/models';

type TherapistAppointment = Appointment & {
  id: string;
  sessionLink?: string;
  patientEmail?: string;
};

type SessionLinks = Record<string, string>;

const AppointmentT = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [requests, setRequests] = useState<TherapistAppointment[]>([]);
  const [sessionLinks, setSessionLinks] = useState<SessionLinks>({});
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      setErrorMessage('');
      const currentUser = getCurrentUser();

      if (!currentUser) {
        setRequests([]);
        return;
      }

      const nextRequests = (await getAppointmentsForTherapist(currentUser.uid)) as TherapistAppointment[];
      setRequests(nextRequests);
      setSessionLinks(
        nextRequests.reduce<SessionLinks>((result, request) => {
          result[request.id] = request.sessionLink || '';
          return result;
        }, {})
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load appointment requests.');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSessionLinkChange = (appointmentId: string, value: string) => {
    setSessionLinks((current) => ({ ...current, [appointmentId]: value }));
  };

  const handleSessionLinkSave = async (appointmentId: string) => {
    try {
      setUpdatingId(appointmentId);
      setErrorMessage('');
      await updateAppointmentSessionLink(appointmentId, sessionLinks[appointmentId] || '');
      await loadRequests();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save session link.');
    } finally {
      setUpdatingId('');
    }
  };

  const openSessionLink = async (sessionLink?: string) => {
    if (!sessionLink) {
      setErrorMessage('Add and save a video session link first.');
      return;
    }

    try {
      await Linking.openURL(sessionLink);
    } catch (error) {
      setErrorMessage('We could not open this session link.');
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusUpdate = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      setUpdatingId(appointmentId);
      setErrorMessage('');
      await updateAppointmentStatus(appointmentId, status);
      await loadRequests();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update appointment.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Appointment Requests</Text>
        <Text style={styles.body}>
          Review patient booking requests. Patients will see approved, pending, or rejected updates.
        </Text>

        {errorMessage ? <ErrorState title="Appointment issue" message={errorMessage} /> : null}
        {loadingRequests ? <LoadingState message="Loading appointment requests..." /> : null}

        {!loadingRequests && requests.length === 0 ? (
          <EmptyState
            title="No appointment requests"
            message="When patients request sessions with you, they will appear here."
            action={<Button title="Update Availability" onPress={() => navigation.navigate('Availability')} />}
          />
        ) : null}

        {!loadingRequests &&
          requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.requestDetails}>
                  <Text style={styles.requestTitle}>
                    {request.patientName || request.patientEmail || 'Patient request'}
                  </Text>
                  <Text style={styles.requestMeta}>
                    {formatAppointmentDate(request.appointmentDateTime)}
                  </Text>
                </View>
                <View style={[styles.statusPill, (styles as any)[`status_${request.status || 'pending'}`]]}>
                  <Text style={styles.statusText}>{request.status || 'pending'}</Text>
                </View>
              </View>

              {request.status === 'pending' ? (
                <View style={styles.requestActions}>
                  <Button
                    title="Approve"
                    onPress={() => handleStatusUpdate(request.id, 'approved')}
                    loading={updatingId === request.id}
                    style={styles.requestButton}
                  />
                  <Button
                    title="Reject"
                    variant="outline"
                    onPress={() => handleStatusUpdate(request.id, 'rejected')}
                    disabled={updatingId === request.id}
                    style={styles.requestButton}
                  />
                </View>
              ) : null}
              {['approved', 'confirmed'].includes(request.status) ? (
                <View style={styles.sessionBox}>
                  <Input
                    label="Video session link"
                    value={sessionLinks[request.id] || ''}
                    onChangeText={(value) => handleSessionLinkChange(request.id, value)}
                    placeholder="https://meet.google.com/..."
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  <View style={styles.requestActions}>
                    <Button
                      title="Save Link"
                      onPress={() => handleSessionLinkSave(request.id)}
                      loading={updatingId === request.id}
                      style={styles.requestButton}
                    />
                    <Button
                      title="Join"
                      variant="outline"
                      onPress={() => openSessionLink(request.sessionLink || sessionLinks[request.id])}
                      disabled={!(request.sessionLink || sessionLinks[request.id])}
                      style={styles.requestButton}
                    />
                  </View>
                  <Button
                    title="Message Patient"
                    variant="secondary"
                    onPress={() => navigation.navigate('SessionMessages', { appointment: request })}
                  />
                  <View style={styles.requestActions}>
                    <Button
                      title="Completed"
                      variant="outline"
                      onPress={() => handleStatusUpdate(request.id, 'completed')}
                      disabled={updatingId === request.id}
                      style={styles.requestButton}
                    />
                    <Button
                      title="Missed"
                      variant="outline"
                      onPress={() => handleStatusUpdate(request.id, 'missed')}
                      disabled={updatingId === request.id}
                      style={styles.requestButton}
                    />
                    <Button
                      title="Cancel"
                      variant="danger"
                      onPress={() => handleStatusUpdate(request.id, 'cancelled')}
                      loading={updatingId === request.id}
                      style={styles.requestButton}
                    />
                  </View>
                </View>
              ) : null}
            </View>
          ))}

        <View style={styles.actions}>
          <Button title="Refresh Requests" variant="outline" onPress={loadRequests} />
          <Button title="Update Availability" variant="secondary" onPress={() => navigation.navigate('Availability')} />
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
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
  requestCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  requestDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  requestTitle: {
    ...typography.subheading,
    color: colors.primary,
  },
  requestMeta: {
    ...typography.small,
    fontWeight: '700',
  },
  requestActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  requestButton: {
    flexGrow: 1,
    flexBasis: '45%',
  },
  actions: {
    gap: spacing.sm,
  },
  sessionBox: {
    gap: spacing.sm,
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
    backgroundColor: colors.surfaceMuted,
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

export default AppointmentT;
