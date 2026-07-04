import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import {
  BellAlertIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
} from 'react-native-heroicons/solid';
import { Button, Card, Header, LoadingState, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import { formatAppointmentDate, getAppointmentsForPatient } from '../services/appointments';
import { getPatientByEmail } from '../services/patients';
import { colors, spacing, typography } from '../theme';

const statusStyles = {
  pending: colors.warning,
  confirmed: colors.success,
  approved: colors.success,
  rejected: colors.danger,
  cancelled: colors.textMuted,
  completed: colors.success,
  missed: colors.warning,
};

const StatCard = ({ Icon, label, value, color }) => (
  <Card style={styles.statCard}>
    <View style={[styles.iconBadge, { backgroundColor: `${color}1A` }]}>
      <Icon size={22} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Card>
);

const PatientHomeScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        const [patient, patientAppointments] = await Promise.all([
          getPatientByEmail(currentUser.email),
          getAppointmentsForPatient(currentUser.uid),
        ]);

        if (patient) setUserData(patient);
        setAppointments(patientAppointments);
      } catch (error) {
        console.error('Error fetching patient dashboard:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const nextAppointment = useMemo(
    () => appointments.find((appointment) => appointment.status !== 'rejected') || appointments[0],
    [appointments]
  );
  const pendingCount = appointments.filter((appointment) => appointment.status === 'pending').length;
  const approvedCount = appointments.filter((appointment) =>
    ['approved', 'confirmed'].includes(appointment.status)
  ).length;
  const profileStarted = Boolean(userData?.selectedOption);

  return (
    <Screen contentContainerStyle={styles.content} edges={['top']}>
      <StatusBar style="light" />
      <Header subtitle={userData?.firstName ? `Welcome back, ${userData.firstName}` : 'Patient dashboard'} />

      {loading ? <LoadingState message="Loading your dashboard..." /> : null}

      <Card style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIcon}>
            <SparklesIcon size={28} color={colors.primary} />
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{profileStarted ? 'Profile started' : 'Profile needed'}</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>
          {profileStarted ? 'Ready to book your next session' : 'Build your care profile'}
        </Text>
        <Text style={styles.heroText}>
          {profileStarted
            ? 'Review your matches and request an appointment with a therapist who fits your goals.'
            : 'Answer a few questions so your therapist matches feel more personal and relevant.'}
        </Text>
        <Button
          title={profileStarted ? 'Find a Therapist' : 'Continue Questionnaire'}
          variant="secondary"
          onPress={() => navigation.navigate(profileStarted ? 'Match' : 'Question')}
        />
      </Card>

      <View style={styles.statsGrid}>
        <StatCard
          Icon={ClipboardDocumentCheckIcon}
          label="Profile"
          value={profileStarted ? 'Active' : 'Start'}
          color={colors.primary}
        />
        <StatCard Icon={CalendarDaysIcon} label="Approved" value={approvedCount} color={colors.success} />
        <StatCard Icon={BellAlertIcon} label="Pending" value={pendingCount} color={colors.warning} />
      </View>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Appointment Snapshot</Text>
          <Text style={styles.sectionMeta}>{appointments.length} total</Text>
        </View>
        {nextAppointment ? (
          <View style={styles.appointmentBox}>
            <View style={styles.appointmentTop}>
              <View style={styles.appointmentTextWrap}>
                <Text style={styles.appointmentTitle}>
                  {nextAppointment.therapist?.name || nextAppointment.therapistName || 'Therapist'}
                </Text>
                <Text style={styles.body}>{formatAppointmentDate(nextAppointment.appointmentDateTime)}</Text>
              </View>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusStyles[nextAppointment.status] || colors.warning },
                  ]}
                />
                <Text style={styles.statusText}>{nextAppointment.status || 'pending'}</Text>
              </View>
            </View>
            <Text style={styles.body}>
              {['approved', 'confirmed'].includes(nextAppointment.status)
                ? 'Your session is approved.'
                : nextAppointment.status === 'rejected'
                  ? 'This request was rejected. You can request another time.'
                  : nextAppointment.status === 'cancelled'
                    ? 'This appointment was cancelled.'
                    : nextAppointment.status === 'completed'
                      ? 'This session was marked completed.'
                      : nextAppointment.status === 'missed'
                        ? 'This session was marked missed.'
                        : 'Waiting for therapist approval.'}
            </Text>
          </View>
        ) : (
          <Text style={styles.body}>No appointment requests yet. Your next request will appear here.</Text>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityItem}>
          <View style={styles.activityDot} />
          <Text style={styles.activityText}>
            {appointments.length
              ? 'Your latest appointment status is available in Visits and Alerts.'
              : 'Your account is ready. Start with the recommended next step above.'}
          </Text>
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    gap: spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
  },
  statusBadge: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...typography.heading,
    color: colors.white,
  },
  heroText: {
    ...typography.body,
    color: colors.primarySoft,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 112,
  },
  iconBadge: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  statValue: {
    ...typography.subheading,
    color: colors.primary,
  },
  statLabel: {
    ...typography.small,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.subheading,
  },
  sectionMeta: {
    ...typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
  },
  appointmentBox: {
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.md,
  },
  appointmentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  appointmentTextWrap: {
    flex: 1,
  },
  appointmentTitle: {
    ...typography.subheading,
    color: colors.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    ...typography.small,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  activityText: {
    ...typography.body,
    flex: 1,
  },
});

export default PatientHomeScreen;
