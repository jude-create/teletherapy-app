import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { Button, Card, EmptyState, ErrorState, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import { getUpcomingSlotOptions } from '../services/availability';
import { saveAppointment as saveAppointmentRecord } from '../services/appointments';
import { colors, spacing, typography } from '../theme';

const BookAppointment = ({ therapistId, therapist, visible, onClose, route }) => {
  const navigation = useNavigation();
  const routeTherapistId = route?.params?.therapistId;
  const routeTherapist = route?.params?.therapist;
  const selectedTherapistId = therapistId || routeTherapistId || null;
  const selectedTherapist = therapist || routeTherapist || null;
  const isModal = typeof visible === 'boolean';
  const slotOptions = useMemo(
    () => getUpcomingSlotOptions(selectedTherapist?.availability?.slots || []),
    [selectedTherapist]
  );
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const selectedSlot = slotOptions.find((slot) => slot.optionId === selectedOptionId);

  const closeBooking = () => {
    if (onClose) {
      onClose();
      return;
    }
    navigation.navigate('PatientDrawer');
  };

  const handleSaveAppointment = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setErrorMessage('You need to be signed in to book an appointment.');
        return;
      }
      if (!selectedTherapistId) {
        setErrorMessage('Choose a therapist before booking an appointment.');
        return;
      }
      if (!selectedSlot) {
        setErrorMessage('Choose one of the therapist available slots before requesting an appointment.');
        return;
      }

      const appointmentData = {
        therapistId: selectedTherapistId,
        therapist: selectedTherapist,
        therapistName: selectedTherapist?.name || 'Therapist',
        patientId: currentUser.uid,
        patientEmail: currentUser.email,
        patientName: currentUser.displayName || currentUser.email,
        appointmentDateTime: selectedSlot.appointmentDateTime,
        date: selectedSlot.appointmentDateTime.toISOString().slice(0, 10),
        time: selectedSlot.timeLabel,
        slot: {
          id: selectedSlot.id,
          day: selectedSlot.day,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          label: selectedSlot.timeLabel,
        },
        status: 'pending',
      };

      await saveAppointmentRecord(currentUser.uid, appointmentData);
      setAppointmentBooked(true);

      setTimeout(closeBooking, 1200);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <Card style={isModal ? styles.modalCard : undefined}>
      <Text style={styles.title}>Book an Appointment</Text>
      <Text style={styles.body}>
        {selectedTherapist?.name
          ? `Choose an available session time with ${selectedTherapist.name}.`
          : 'Choose an available session time.'}
      </Text>

      {selectedTherapist ? (
        <View style={styles.therapistSummary}>
          <Text style={styles.summaryLabel}>Selected therapist</Text>
          <Text style={styles.summaryName}>{selectedTherapist.name || 'Therapist'}</Text>
          <Text style={styles.summaryText}>
            {(selectedTherapist.specialties || []).slice(0, 3).join(', ') || 'Specialties pending'}
          </Text>
          <Text style={styles.summaryText}>
            License: {selectedTherapist.license || 'Pending'}
          </Text>
        </View>
      ) : null}

      {errorMessage ? <ErrorState title="Booking issue" message={errorMessage} /> : null}

      {slotOptions.length ? (
        <View style={styles.slotList}>
          {slotOptions.slice(0, 12).map((slot) => {
            const selected = selectedOptionId === slot.optionId;
            return (
              <Pressable
                key={slot.optionId}
                accessibilityRole="button"
                onPress={() => setSelectedOptionId(slot.optionId)}
                style={[styles.slotButton, selected && styles.slotButtonSelected]}
              >
                <Text style={[styles.slotDate, selected && styles.slotTextSelected]}>
                  {slot.dateLabel}
                </Text>
                <Text style={[styles.slotTime, selected && styles.slotTextSelected]}>
                  {slot.timeLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <EmptyState
          title="No slots available"
          message="This therapist has not published bookable session times yet."
        />
      )}

      <View style={styles.selectionBox}>
        <Text style={styles.selectionLabel}>Selected appointment</Text>
        <Text style={styles.selectionValue}>
          {selectedSlot
            ? `${selectedSlot.dateLabel} at ${selectedSlot.timeLabel}`
            : 'Choose a slot above'}
        </Text>
      </View>

      {appointmentBooked ? (
        <View style={styles.successRow}>
          <CheckCircleIcon size={24} color={colors.success} />
          <Text style={styles.successText}>Request sent for therapist approval.</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          title="Request Appointment"
          onPress={handleSaveAppointment}
          loading={saving}
          disabled={!selectedSlot}
        />
        <Button title="Cancel" variant="ghost" onPress={closeBooking} />
      </View>
    </Card>
  );

  if (isModal) {
    return (
      <Modal transparent visible={visible} animationType="slide">
        <View style={styles.modalOverlay}>{content}</View>
      </Modal>
    );
  }

  return <Screen contentContainerStyle={styles.screenContent}>{content}</Screen>;
};

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
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
  slotList: {
    gap: spacing.sm,
  },
  slotButton: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  slotButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  slotDate: {
    ...typography.body,
    flex: 1,
    fontWeight: '700',
  },
  slotTime: {
    ...typography.small,
    fontWeight: '800',
  },
  slotTextSelected: {
    color: colors.primary,
  },
  therapistSummary: {
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summaryName: {
    ...typography.subheading,
    color: colors.primary,
  },
  summaryText: {
    ...typography.small,
  },
  selectionBox: {
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
    padding: spacing.md,
    gap: spacing.xs,
  },
  selectionLabel: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  selectionValue: {
    ...typography.body,
    fontWeight: '700',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  successText: {
    ...typography.body,
    color: colors.success,
    fontWeight: '800',
  },
  actions: {
    gap: spacing.sm,
  },
});

export default BookAppointment;
