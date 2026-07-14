import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, ErrorState, LoadingState, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import { getNotificationsForUser, markNotificationRead } from '../services/notifications';
import { colors, spacing, typography } from '../theme';

export default function Notifications() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const currentUser = getCurrentUser();

      if (!currentUser) {
        setAlerts([]);
        return;
      }

      setAlerts(await getNotificationsForUser(currentUser.uid));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const markRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      setAlerts((current) =>
        current.map((alert) => (alert.id === notificationId ? { ...alert, read: true } : alert))
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update notification.');
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <Text style={styles.title}>Alerts</Text>
      <Text style={styles.body}>Updates about appointment requests and therapist decisions appear here.</Text>

      {loading ? <LoadingState message="Loading alerts..." /> : null}
      {errorMessage ? <ErrorState title="Alert issue" message={errorMessage} /> : null}

      {!loading && !errorMessage && alerts.length === 0 ? (
        <EmptyState
          title="No alerts yet"
          message="When you request an appointment, status updates will appear here."
        />
      ) : null}

      {!loading &&
        alerts.map((alert) => {
          return (
            <Card key={alert.id} style={!alert.read ? styles.unreadCard : undefined}>
              <View style={styles.alertHeader}>
                <View style={[styles.statusDot, { backgroundColor: alert.read ? colors.textSubtle : colors.primary }]} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.body}>{alert.message}</Text>
                  <Text style={styles.metaText}>{alert.type?.replace(/_/g, ' ') || 'update'}</Text>
                  {!alert.read ? (
                    <Button
                      title="Mark Read"
                      variant="ghost"
                      onPress={() => markRead(alert.id)}
                      style={styles.markReadButton}
                      textStyle={styles.markReadText}
                    />
                  ) : null}
                </View>
              </View>
            </Card>
          );
        })}
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
  alertHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  alertContent: {
    flex: 1,
    gap: spacing.xs,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  alertTitle: {
    ...typography.subheading,
    color: colors.primary,
  },
  unreadCard: {
    borderColor: colors.primarySoft,
  },
  metaText: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  markReadButton: {
    width: 'auto',
    alignSelf: 'flex-start',
    minHeight: 36,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  markReadText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '800',
  },
});
