import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  ClockIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
} from 'react-native-heroicons/solid';
import { Button, Card, Header, LoadingState, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import { formatAppointmentDate, getAppointmentsForTherapist } from '../services/appointments';
import { getSlotsFromTherapist } from '../services/availability';
import { getTherapistByEmail } from '../services/therapists';
import { colors, spacing, typography } from '../theme';

const statusColors = {
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

const TherapistHomeScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        const [therapist, therapistAppointments] = await Promise.all([
          getTherapistByEmail(currentUser.email),
          getAppointmentsForTherapist(currentUser.uid),
        ]);

        if (therapist) setProfile(therapist);
        setAppointments(therapistAppointments);
      } catch (error) {
        console.error('Error loading therapist dashboard:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const pendingRequests = appointments.filter((appointment) => appointment.status === 'pending');
  const approvedSessions = appointments.filter((appointment) =>
    ['approved', 'confirmed'].includes(appointment.status)
  );
  const nextAppointment = useMemo(
    () => approvedSessions[0] || pendingRequests[0] || appointments[0],
    [appointments, approvedSessions, pendingRequests]
  );
  const availabilitySlots = getSlotsFromTherapist(profile);
  const hasAvailability = availabilitySlots.length > 0;
  const profileReady = Boolean(
    profile?.license &&
      (profile?.therapyTypes?.length || profile?.selectedOption?.length) &&
      (profile?.specialties?.length || profile?.therapistExperiences?.length) &&
      profile?.bio &&
      profile?.yearsExperience !== ''
  );
  const verificationStatus = profile?.verificationStatus || (profile?.verified ? 'approved' : 'pending');

  useEffect(() => {
    if (!loading && profile && !profile.onboardingCompleted) {
      navigation.navigate('Questions');
    }
  }, [loading, navigation, profile]);

  return (
    <Screen contentContainerStyle={styles.content}>
      <Header subtitle={profile?.name ? `Welcome back, ${profile.name}` : 'Therapist dashboard'} />

      {loading ? <LoadingState message="Loading therapist dashboard..." /> : null}

      <Card style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIcon}>
            <SparklesIcon size={28} color={colors.primary} />
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {verificationStatus === 'approved'
                ? 'Verified'
                : verificationStatus === 'rejected'
                  ? 'Needs updates'
                  : profileReady
                    ? 'Pending review'
                    : 'Profile needs review'}
            </Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>
          {pendingRequests.length ? 'Review new appointment requests' : 'Keep your practice ready'}
        </Text>
        <Text style={styles.heroText}>
          {pendingRequests.length
            ? 'Patients are waiting for approval. Review requests and respond from your Visits tab.'
            : verificationStatus === 'approved'
              ? 'Keep your availability and clinical profile updated so patients can book confidently.'
              : 'Your profile must be approved by admin before patients can find and book you.'}
        </Text>
        <Button
          title={pendingRequests.length ? 'Review Requests' : hasAvailability ? 'View Schedule' : 'Set Availability'}
          variant="secondary"
          onPress={() => navigation.navigate(pendingRequests.length ? 'Appointment' : 'Availability')}
        />
      </Card>

      <View style={styles.statsGrid}>
        <StatCard Icon={ClockIcon} label="Pending" value={pendingRequests.length} color={colors.warning} />
        <StatCard Icon={CalendarDaysIcon} label="Approved" value={approvedSessions.length} color={colors.success} />
        <StatCard
          Icon={ClipboardDocumentCheckIcon}
          label="Profile"
          value={profileReady ? 'Ready' : 'Review'}
          color={colors.primary}
        />
      </View>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Schedule Snapshot</Text>
          <Text style={styles.sectionMeta}>{appointments.length} total</Text>
        </View>
        {nextAppointment ? (
          <View style={styles.appointmentBox}>
            <View style={styles.appointmentTop}>
              <View style={styles.appointmentTextWrap}>
                <Text style={styles.appointmentTitle}>
                  {nextAppointment.patientName || nextAppointment.patientEmail || 'Patient request'}
                </Text>
                <Text style={styles.body}>{formatAppointmentDate(nextAppointment.appointmentDateTime)}</Text>
              </View>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusColors[nextAppointment.status] || colors.warning },
                  ]}
                />
                <Text style={styles.statusText}>{nextAppointment.status || 'pending'}</Text>
              </View>
            </View>
            <Text style={styles.body}>
              {['approved', 'confirmed'].includes(nextAppointment.status)
                ? 'This appointment is approved.'
                : nextAppointment.status === 'rejected'
                  ? 'This request was rejected.'
                  : nextAppointment.status === 'cancelled'
                    ? 'This appointment was cancelled.'
                    : nextAppointment.status === 'completed'
                      ? 'This session was marked completed.'
                      : nextAppointment.status === 'missed'
                        ? 'This session was marked missed.'
                        : 'This request is waiting for your response.'}
            </Text>
          </View>
        ) : (
          <Text style={styles.body}>No appointment requests yet. New patient requests will appear here.</Text>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.availabilityRow}>
          <CheckBadgeIcon size={22} color={hasAvailability ? colors.success : colors.warning} />
          <Text style={styles.activityText}>
            {hasAvailability
              ? availabilitySlots.map((slot) => `${slot.day} ${slot.startTime}-${slot.endTime}`).join(', ')
              : 'Set your available days and time window so patients know when to book.'}
          </Text>
        </View>
        <Button
          title={hasAvailability ? 'Edit Availability' : 'Set Availability'}
          variant="outline"
          onPress={() => navigation.navigate('Availability')}
        />
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
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activityText: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
  },
});

export default TherapistHomeScreen;
