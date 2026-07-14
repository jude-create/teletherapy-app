import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  ClockIcon,
  LinkIcon,
  UserGroupIcon,
  XCircleIcon,
} from 'react-native-heroicons/solid';
import { Button, Card, EmptyState, ErrorState, Header, LoadingState, Screen } from '../components/ui';
import { getAdminDashboard, updateTherapistVerification } from '../services/admin';
import { signOutUser } from '../services/auth';
import { colors, spacing, typography } from '../theme';
import type { FirestoreDate } from '../types/models';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

type AdminTherapist = {
  id: string;
  uid?: string;
  name?: string;
  email?: string;
  license?: string;
  bio?: string;
  text?: string;
  selectedOption?: string | string[];
  therapistExperiences?: string[];
  verificationStatus?: VerificationStatus;
  verified?: boolean;
};

type AdminAppointment = {
  id: string;
  patientName?: string;
  patientEmail?: string;
  therapistName?: string;
  therapist?: { name?: string };
  status?: string;
  appointmentDateTime?: FirestoreDate;
};

type AdminDashboard = {
  therapists: AdminTherapist[];
  patients: unknown[];
  appointments: AdminAppointment[];
  appointmentStatusCounts: Record<string, number>;
  verificationStatusCounts: Record<string, number>;
  recentAppointments: AdminAppointment[];
  stats: Record<string, number>;
};

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

type StatCardProps = {
  label: string;
  value: number;
  Icon: IconComponent;
  tone: string;
};

type TherapistReviewCardProps = {
  therapist: AdminTherapist;
  updating: string;
  onUpdate: (therapist: AdminTherapist, status: VerificationStatus) => void;
};

const verificationCopy: Record<VerificationStatus, { label: string; backgroundColor: string; color: string }> = {
  pending: {
    label: 'Pending',
    backgroundColor: '#FFF6E5',
    color: colors.warning,
  },
  approved: {
    label: 'Approved',
    backgroundColor: colors.successSoft,
    color: colors.success,
  },
  rejected: {
    label: 'Rejected',
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
  },
};

const StatCard = ({ label, value, Icon, tone }: StatCardProps) => (
  <Card style={styles.statCard}>
    <View style={styles.statHeader}>
      <Text style={styles.statLabel}>{label}</Text>
      <Icon size={26} color={tone} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
  </Card>
);

const formatAdminDate = (value?: FirestoreDate) => {
  if (!value) return 'Time pending';
  const date =
    typeof value === 'object' && value !== null && 'toDate' in value
      ? value.toDate()
      : value instanceof Date || typeof value === 'string' || typeof value === 'number'
        ? new Date(value)
        : new Date(0);
  return Number.isNaN(date.getTime()) ? 'Time pending' : date.toLocaleString();
};

const TherapistReviewCard = ({ therapist, updating, onUpdate }: TherapistReviewCardProps) => {
  const status = verificationCopy[therapist.verificationStatus || 'pending'] || verificationCopy.pending;

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewIdentity}>
          <Text style={styles.therapistName}>{therapist.name || therapist.email || 'Therapist'}</Text>
          <Text style={styles.metaText}>{therapist.email || 'No email added'}</Text>
          <Text style={styles.metaText}>License: {therapist.license || 'Not added'}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: status.backgroundColor }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <Text style={styles.body} numberOfLines={3}>
        {therapist.bio || therapist.text || 'No professional bio added yet.'}
      </Text>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Therapy types</Text>
        <Text style={styles.detailValue}>
          {(Array.isArray(therapist.selectedOption)
            ? therapist.selectedOption
            : [therapist.selectedOption].filter(Boolean)
          ).join(', ') || 'Pending'}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Experience</Text>
        <Text style={styles.detailValue}>
          {(therapist.therapistExperiences || []).slice(0, 4).join(', ') || 'Pending'}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Approve"
          onPress={() => onUpdate(therapist, 'approved')}
          loading={updating === `${therapist.id}:approved`}
          disabled={Boolean(updating) || therapist.verificationStatus === 'approved'}
          style={styles.actionButton}
        />
        <Button
          title="Reject"
          variant="outline"
          onPress={() => onUpdate(therapist, 'rejected')}
          loading={updating === `${therapist.id}:rejected`}
          disabled={Boolean(updating) || therapist.verificationStatus === 'rejected'}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
};

const Admin = () => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setDashboard((await getAdminDashboard()) as AdminDashboard);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const pendingTherapists = useMemo(
    () =>
      (dashboard?.therapists || []).filter(
        (therapist: AdminTherapist) => (therapist.verificationStatus || 'pending') === 'pending'
      ),
    [dashboard]
  );

  const reviewedTherapists = useMemo(
    () =>
      (dashboard?.therapists || []).filter(
        (therapist: AdminTherapist) => (therapist.verificationStatus || 'pending') !== 'pending'
      ),
    [dashboard]
  );

  const handleVerificationUpdate = async (therapist: AdminTherapist, status: VerificationStatus) => {
    try {
      setUpdating(`${therapist.id}:${status}`);
      setErrorMessage('');
      await updateTherapistVerification({ therapist, status });
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update therapist verification.');
    } finally {
      setUpdating('');
    }
  };

  const stats = dashboard?.stats || {
    therapists: 0,
    patients: 0,
    pendingTherapists: 0,
    approvedTherapists: 0,
    rejectedTherapists: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    approvedAppointments: 0,
    rejectedAppointments: 0,
    cancelledAppointments: 0,
    completedAppointments: 0,
    missedAppointments: 0,
    sessionLinksReady: 0,
  };
  const appointmentStatusCounts = dashboard?.appointmentStatusCounts || {};
  const verificationStatusCounts = dashboard?.verificationStatusCounts || {};
  const recentAppointments = dashboard?.recentAppointments || [];

  return (
    <Screen contentContainerStyle={styles.content}>
      <Header subtitle="Admin overview" />
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Admin</Text>
        <Button title="Sign Out" variant="ghost" onPress={signOutUser} style={styles.signOutButton} />
      </View>

      {loading ? <LoadingState message="Loading admin dashboard..." /> : null}
      {errorMessage ? <ErrorState title="Admin issue" message={errorMessage} /> : null}

      <View style={styles.grid}>
        <StatCard label="Therapists" value={stats.therapists} Icon={UserGroupIcon} tone={colors.primary} />
        <StatCard label="Patients" value={stats.patients} Icon={UserGroupIcon} tone={colors.accent} />
        <StatCard label="Pending Review" value={stats.pendingTherapists} Icon={ClockIcon} tone={colors.warning} />
        <StatCard
          label="Approved Visits"
          value={stats.approvedAppointments}
          Icon={CalendarDaysIcon}
          tone={colors.success}
        />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Appointment Analytics</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{stats.totalAppointments}</Text>
            <Text style={styles.analyticsLabel}>Total</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{stats.pendingAppointments}</Text>
            <Text style={styles.analyticsLabel}>Pending</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{stats.approvedAppointments}</Text>
            <Text style={styles.analyticsLabel}>Approved</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{stats.sessionLinksReady}</Text>
            <Text style={styles.analyticsLabel}>Links Ready</Text>
          </View>
        </View>
        <View style={styles.metricList}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Rejected requests</Text>
            <Text style={styles.metricValue}>{stats.rejectedAppointments}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Completed sessions</Text>
            <Text style={styles.metricValue}>{stats.completedAppointments}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Missed sessions</Text>
            <Text style={styles.metricValue}>{stats.missedAppointments}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Cancelled appointments</Text>
            <Text style={styles.metricValue}>{stats.cancelledAppointments}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Status mix</Text>
            <Text style={styles.metricValue}>
              {Object.entries(appointmentStatusCounts)
                .map(([status, count]) => `${status}: ${count}`)
                .join('  ') || 'No appointments'}
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Provider Analytics</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsItem}>
            <CheckBadgeIcon size={22} color={colors.success} />
            <Text style={styles.analyticsValue}>{stats.approvedTherapists}</Text>
            <Text style={styles.analyticsLabel}>Approved</Text>
          </View>
          <View style={styles.analyticsItem}>
            <ClockIcon size={22} color={colors.warning} />
            <Text style={styles.analyticsValue}>{stats.pendingTherapists}</Text>
            <Text style={styles.analyticsLabel}>Pending</Text>
          </View>
          <View style={styles.analyticsItem}>
            <XCircleIcon size={22} color={colors.danger} />
            <Text style={styles.analyticsValue}>{stats.rejectedTherapists}</Text>
            <Text style={styles.analyticsLabel}>Rejected</Text>
          </View>
          <View style={styles.analyticsItem}>
            <LinkIcon size={22} color={colors.accent} />
            <Text style={styles.analyticsValue}>{stats.sessionLinksReady}</Text>
            <Text style={styles.analyticsLabel}>Video Links</Text>
          </View>
        </View>
        <Text style={styles.body}>
          {Object.entries(verificationStatusCounts)
            .map(([status, count]) => `${status}: ${count}`)
            .join('  ') || 'No provider verification data yet.'}
        </Text>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Therapist Verification</Text>
          <Text style={styles.sectionMeta}>{pendingTherapists.length} pending</Text>
        </View>

        {!loading && pendingTherapists.length === 0 ? (
          <EmptyState
            title="No pending therapists"
            message="New therapist profiles will appear here for license review."
          />
        ) : null}

        {pendingTherapists.map((therapist) => (
          <TherapistReviewCard
            key={therapist.id}
            therapist={therapist}
            updating={updating}
            onUpdate={handleVerificationUpdate}
          />
        ))}
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reviewed Therapists</Text>
          <CheckBadgeIcon size={22} color={colors.success} />
        </View>
        {reviewedTherapists.length ? (
          reviewedTherapists.slice(0, 6).map((therapist) => (
            <TherapistReviewCard
              key={therapist.id}
              therapist={therapist}
              updating={updating}
              onUpdate={handleVerificationUpdate}
            />
          ))
        ) : (
          <Text style={styles.body}>Approved and rejected therapists will appear here.</Text>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Recent Appointment Activity</Text>
        {recentAppointments.length ? (
          recentAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.activityRow}>
              <View style={styles.activityTextWrap}>
                <Text style={styles.activityTitle}>
                  {appointment.patientName || appointment.patientEmail || 'Patient'} with{' '}
                  {appointment.therapistName || appointment.therapist?.name || 'Therapist'}
                </Text>
                <Text style={styles.metaText}>{formatAdminDate(appointment.appointmentDateTime)}</Text>
              </View>
              <View style={styles.smallPill}>
                <Text style={styles.smallPillText}>{appointment.status || 'pending'}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.body}>Appointment activity will appear here.</Text>
        )}
      </Card>

      <Button title="Refresh Dashboard" variant="outline" onPress={loadDashboard} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  heading: {
    ...typography.heading,
    flex: 1,
  },
  signOutButton: {
    width: 'auto',
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 142,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statLabel: {
    ...typography.small,
    fontWeight: '700',
    color: colors.text,
  },
  statValue: {
    ...typography.title,
    color: colors.primary,
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
    color: colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  reviewIdentity: {
    flex: 1,
    gap: spacing.xs,
  },
  therapistName: {
    ...typography.subheading,
    color: colors.primary,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
  },
  metaText: {
    ...typography.small,
    fontWeight: '700',
  },
  detailRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  detailLabel: {
    ...typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailValue: {
    ...typography.small,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
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
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  analyticsItem: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 126,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.xs,
  },
  analyticsValue: {
    ...typography.heading,
    color: colors.primary,
  },
  analyticsLabel: {
    ...typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricList: {
    gap: spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  metricLabel: {
    ...typography.small,
    flex: 1,
    fontWeight: '700',
  },
  metricValue: {
    ...typography.small,
    color: colors.primary,
    flex: 1,
    textAlign: 'right',
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  activityTextWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  activityTitle: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '800',
  },
  smallPill: {
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  smallPillText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});

export default Admin;
